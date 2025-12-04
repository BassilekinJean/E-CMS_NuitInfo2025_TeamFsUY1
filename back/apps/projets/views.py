from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.utils import timezone
from .models import Projet, MiseAJourProjet, DocumentProjet
from .serializers import (
    ProjetListSerializer, ProjetDetailSerializer, ProjetCreateSerializer,
    ProjetPublicSerializer, MiseAJourProjetSerializer, MiseAJourCreateSerializer,
    DocumentProjetSerializer, StatistiqueProjetsSerializer
)
from apps.mairies.models import Mairie


class IsAgentCommunal(permissions.BasePermission):
    """Permission pour les agents communaux"""
    
    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            request.user.is_agent_communal() or request.user.is_admin_national()
        )


# ===== Projets Publics (Transparence) =====

class ProjetsPublicsListView(generics.ListAPIView):
    """Liste des projets publics d'une mairie"""
    
    serializer_class = ProjetListSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        mairie_slug = self.kwargs.get('mairie_slug')
        mairie = get_object_or_404(Mairie, slug=mairie_slug)
        
        queryset = Projet.objects.filter(mairie=mairie)
        
        # Filtres
        statut = self.request.query_params.get('statut')
        if statut:
            queryset = queryset.filter(statut=statut)
        
        return queryset.order_by('-date_creation')


class ProjetPublicDetailView(generics.RetrieveAPIView):
    """Détail public d'un projet (transparence)"""
    
    serializer_class = ProjetPublicSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        mairie_slug = self.kwargs.get('mairie_slug')
        return Projet.objects.filter(mairie__slug=mairie_slug)


class StatistiquesProjetsView(APIView):
    """Statistiques des projets d'une mairie"""
    
    permission_classes = [permissions.AllowAny]
    
    def get(self, request, mairie_slug):
        mairie = get_object_or_404(Mairie, slug=mairie_slug)
        projets = Projet.objects.filter(mairie=mairie)
        
        serializer = StatistiqueProjetsSerializer()
        return Response(serializer.to_representation(projets))


class ProjetsEnCoursView(generics.ListAPIView):
    """Liste des projets en cours d'une mairie"""
    
    serializer_class = ProjetListSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        mairie_slug = self.kwargs.get('mairie_slug')
        mairie = get_object_or_404(Mairie, slug=mairie_slug)
        
        return Projet.objects.filter(
            mairie=mairie,
            statut=Projet.Statut.EN_COURS
        ).order_by('-avancement')


# ===== Gestion des Projets (Agent) =====

class ProjetsGestionListView(generics.ListCreateAPIView):
    """Gestion des projets (agent)"""
    
    permission_classes = [IsAgentCommunal]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ProjetCreateSerializer
        return ProjetListSerializer
    
    def get_queryset(self):
        user = self.request.user
        if user.is_admin_national():
            mairie_id = self.request.query_params.get('mairie')
            if mairie_id:
                return Projet.objects.filter(mairie_id=mairie_id)
            return Projet.objects.all()
        return Projet.objects.filter(mairie=user.mairie)
    
    def perform_create(self, serializer):
        user = self.request.user
        if user.is_admin_national():
            mairie_id = self.request.data.get('mairie')
            mairie = get_object_or_404(Mairie, pk=mairie_id)
        else:
            mairie = user.mairie
        serializer.save(mairie=mairie, responsable=user)


class ProjetGestionDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Détail/modification/suppression d'un projet"""
    
    serializer_class = ProjetDetailSerializer
    permission_classes = [IsAgentCommunal]
    
    def get_queryset(self):
        user = self.request.user
        if user.is_admin_national():
            return Projet.objects.all()
        return Projet.objects.filter(mairie=user.mairie)


# ===== Mises à jour de Projet =====

class MisesAJourProjetView(generics.ListCreateAPIView):
    """Liste et ajout de mises à jour pour un projet"""
    
    permission_classes = [IsAgentCommunal]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return MiseAJourCreateSerializer
        return MiseAJourProjetSerializer
    
    def get_queryset(self):
        projet_id = self.kwargs.get('projet_id')
        return MiseAJourProjet.objects.filter(projet_id=projet_id).order_by('-date_mise_a_jour')
    
    def perform_create(self, serializer):
        projet_id = self.kwargs.get('projet_id')
        projet = get_object_or_404(Projet, pk=projet_id)
        
        avancement_avant = projet.avancement
        avancement_apres = serializer.validated_data.get('avancement_apres', avancement_avant)
        
        # Mettre à jour l'avancement du projet
        projet.avancement = avancement_apres
        projet.save()
        
        serializer.save(
            projet=projet,
            auteur=self.request.user,
            avancement_avant=avancement_avant
        )


class MiseAJourDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Détail d'une mise à jour"""
    
    serializer_class = MiseAJourProjetSerializer
    permission_classes = [IsAgentCommunal]
    queryset = MiseAJourProjet.objects.all()


# ===== Documents de Projet =====

class DocumentsProjetView(generics.ListCreateAPIView):
    """Liste et ajout de documents pour un projet"""
    
    serializer_class = DocumentProjetSerializer
    permission_classes = [IsAgentCommunal]
    
    def get_queryset(self):
        projet_id = self.kwargs.get('projet_id')
        return DocumentProjet.objects.filter(projet_id=projet_id).order_by('-date_ajout')
    
    def perform_create(self, serializer):
        projet_id = self.kwargs.get('projet_id')
        projet = get_object_or_404(Projet, pk=projet_id)
        serializer.save(projet=projet)


class DocumentProjetDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Détail d'un document de projet"""
    
    serializer_class = DocumentProjetSerializer
    permission_classes = [IsAgentCommunal]
    queryset = DocumentProjet.objects.all()


# ===== Mise à jour rapide de l'avancement =====

class MettreAJourAvancementView(APIView):
    """Mise à jour rapide de l'avancement d'un projet"""
    
    permission_classes = [IsAgentCommunal]
    
    def post(self, request, pk):
        user = request.user
        
        if user.is_admin_national():
            projet = get_object_or_404(Projet, pk=pk)
        else:
            projet = get_object_or_404(Projet, pk=pk, mairie=user.mairie)
        
        nouvel_avancement = request.data.get('avancement')
        commentaire = request.data.get('commentaire', '')
        
        if nouvel_avancement is None:
            return Response(
                {'error': 'Le champ avancement est requis'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            nouvel_avancement = int(nouvel_avancement)
            if not 0 <= nouvel_avancement <= 100:
                raise ValueError()
        except (ValueError, TypeError):
            return Response(
                {'error': 'L\'avancement doit être un entier entre 0 et 100'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        avancement_avant = projet.avancement
        projet.avancement = nouvel_avancement
        projet.save()
        
        # Créer une mise à jour
        MiseAJourProjet.objects.create(
            projet=projet,
            titre=f"Avancement mis à jour: {avancement_avant}% → {nouvel_avancement}%",
            contenu=commentaire or "Mise à jour de l'avancement",
            avancement_avant=avancement_avant,
            avancement_apres=nouvel_avancement,
            auteur=user
        )
        
        return Response({
            'message': 'Avancement mis à jour',
            'avancement_avant': avancement_avant,
            'avancement_apres': nouvel_avancement
        })


class ChangerStatutProjetView(APIView):
    """Changer le statut d'un projet"""
    
    permission_classes = [IsAgentCommunal]
    
    def post(self, request, pk):
        user = request.user
        
        if user.is_admin_national():
            projet = get_object_or_404(Projet, pk=pk)
        else:
            projet = get_object_or_404(Projet, pk=pk, mairie=user.mairie)
        
        nouveau_statut = request.data.get('statut')
        
        if nouveau_statut not in dict(Projet.Statut.choices):
            return Response(
                {'error': 'Statut invalide'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        ancien_statut = projet.statut
        projet.statut = nouveau_statut
        
        # Si terminé, mettre la date de fin réelle
        if nouveau_statut == Projet.Statut.TERMINE and not projet.date_fin_reelle:
            projet.date_fin_reelle = timezone.now().date()
            projet.avancement = 100
        
        projet.save()
        
        # Créer une mise à jour
        MiseAJourProjet.objects.create(
            projet=projet,
            titre=f"Changement de statut: {ancien_statut} → {nouveau_statut}",
            contenu=f"Le projet est maintenant {dict(Projet.Statut.choices)[nouveau_statut]}",
            avancement_avant=projet.avancement,
            avancement_apres=projet.avancement,
            auteur=user
        )
        
        return Response({
            'message': 'Statut mis à jour',
            'ancien_statut': ancien_statut,
            'nouveau_statut': nouveau_statut
        })
