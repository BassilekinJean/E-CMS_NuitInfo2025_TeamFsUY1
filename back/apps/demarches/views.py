from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.utils import timezone
from .models import Formulaire, ChampFormulaire, DemarcheAdministrative, Signalement, RendezVous
from .serializers import (
    FormulaireListSerializer, FormulaireDetailSerializer, FormulaireCreateSerializer,
    ChampFormulaireSerializer, DemarcheListSerializer, DemarcheDetailSerializer,
    DemarcheSoumissionSerializer, DemarcheTraitementSerializer,
    SignalementListSerializer, SignalementDetailSerializer, SignalementCreateSerializer,
    SignalementReponseSerializer, RendezVousListSerializer, RendezVousDetailSerializer,
    RendezVousDemandeSerializer, RendezVousConfirmationSerializer
)


class IsAgentCommunal(permissions.BasePermission):
    """Permission pour les agents communaux"""
    
    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            request.user.is_agent_communal() or request.user.is_admin_national()
        )


class IsOwnerOrAgent(permissions.BasePermission):
    """Permission pour le propriétaire ou un agent"""
    
    def has_object_permission(self, request, view, obj):
        if request.user.is_admin_national():
            return True
        if hasattr(obj, 'citoyen') and obj.citoyen == request.user:
            return True
        if request.user.is_agent_communal() and hasattr(obj, 'mairie'):
            return request.user.mairie == obj.mairie
        return False


# ===== Formulaires =====

class FormulairesListView(generics.ListAPIView):
    """Liste des formulaires publics d'une mairie"""
    
    serializer_class = FormulaireListSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        mairie_id = self.kwargs.get('mairie_id')
        return Formulaire.objects.filter(
            mairie_id=mairie_id,
            est_actif=True
        ).order_by('titre')


class FormulaireDetailPublicView(generics.RetrieveAPIView):
    """Détail d'un formulaire (public)"""
    
    serializer_class = FormulaireDetailSerializer
    permission_classes = [permissions.AllowAny]
    queryset = Formulaire.objects.filter(est_actif=True)


class FormulairesGestionView(generics.ListCreateAPIView):
    """Gestion des formulaires (agent)"""
    
    permission_classes = [IsAgentCommunal]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return FormulaireCreateSerializer
        return FormulaireListSerializer
    
    def get_queryset(self):
        user = self.request.user
        if user.is_admin_national():
            mairie_id = self.request.query_params.get('mairie')
            if mairie_id:
                return Formulaire.objects.filter(mairie_id=mairie_id)
            return Formulaire.objects.all()
        return Formulaire.objects.filter(mairie=user.mairie)
    
    def perform_create(self, serializer):
        user = self.request.user
        if user.is_admin_national():
            mairie_id = self.request.data.get('mairie')
            from apps.mairies.models import Mairie
            mairie = get_object_or_404(Mairie, pk=mairie_id)
            serializer.save(mairie=mairie)
        else:
            serializer.save(mairie=user.mairie)


class FormulaireGestionDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Détail/modification/suppression d'un formulaire"""
    
    serializer_class = FormulaireDetailSerializer
    permission_classes = [IsAgentCommunal]
    
    def get_queryset(self):
        user = self.request.user
        if user.is_admin_national():
            return Formulaire.objects.all()
        return Formulaire.objects.filter(mairie=user.mairie)


# ===== Champs de Formulaire =====

class ChampFormulaireGestionView(generics.CreateAPIView):
    """Ajouter un champ à un formulaire"""
    
    serializer_class = ChampFormulaireSerializer
    permission_classes = [IsAgentCommunal]
    
    def perform_create(self, serializer):
        formulaire_id = self.kwargs.get('formulaire_id')
        formulaire = get_object_or_404(Formulaire, pk=formulaire_id)
        serializer.save(formulaire=formulaire)


class ChampFormulaireDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Modifier/supprimer un champ"""
    
    serializer_class = ChampFormulaireSerializer
    permission_classes = [IsAgentCommunal]
    queryset = ChampFormulaire.objects.all()


# ===== Démarches Administratives =====

class MesDemarchesView(generics.ListAPIView):
    """Liste des démarches du citoyen connecté"""
    
    serializer_class = DemarcheListSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return DemarcheAdministrative.objects.filter(
            citoyen=self.request.user
        ).order_by('-date_soumission')


class SoumettreDemarcheView(generics.CreateAPIView):
    """Soumettre une nouvelle démarche"""
    
    serializer_class = DemarcheSoumissionSerializer
    permission_classes = [permissions.IsAuthenticated]


class DemarcheDetailCitoyenView(generics.RetrieveAPIView):
    """Voir le détail de sa démarche"""
    
    serializer_class = DemarcheDetailSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrAgent]
    
    def get_queryset(self):
        return DemarcheAdministrative.objects.filter(citoyen=self.request.user)


class DemarchesAgentListView(generics.ListAPIView):
    """Liste des démarches pour l'agent"""
    
    serializer_class = DemarcheListSerializer
    permission_classes = [IsAgentCommunal]
    
    def get_queryset(self):
        user = self.request.user
        queryset = DemarcheAdministrative.objects.all()
        
        if not user.is_admin_national():
            queryset = queryset.filter(mairie=user.mairie)
        
        # Filtres
        statut = self.request.query_params.get('statut')
        if statut:
            queryset = queryset.filter(statut=statut)
        
        return queryset.order_by('-date_soumission')


class DemarcheAgentDetailView(generics.RetrieveAPIView):
    """Détail d'une démarche pour l'agent"""
    
    serializer_class = DemarcheDetailSerializer
    permission_classes = [IsAgentCommunal]
    
    def get_queryset(self):
        user = self.request.user
        if user.is_admin_national():
            return DemarcheAdministrative.objects.all()
        return DemarcheAdministrative.objects.filter(mairie=user.mairie)


class TraiterDemarcheView(APIView):
    """Traiter une démarche"""
    
    permission_classes = [IsAgentCommunal]
    
    def post(self, request, pk):
        user = request.user
        
        if user.is_admin_national():
            demarche = get_object_or_404(DemarcheAdministrative, pk=pk)
        else:
            demarche = get_object_or_404(DemarcheAdministrative, pk=pk, mairie=user.mairie)
        
        serializer = DemarcheTraitementSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        demarche.statut = serializer.validated_data['statut']
        demarche.commentaire_agent = serializer.validated_data.get('commentaire', '')
        demarche.traite_par = user
        demarche.date_traitement = timezone.now()
        demarche.save()
        
        return Response({
            'message': 'Démarche traitée avec succès',
            'demarche': DemarcheDetailSerializer(demarche).data
        })


# ===== Signalements =====

class MesSignalementsView(generics.ListAPIView):
    """Liste des signalements du citoyen"""
    
    serializer_class = SignalementListSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Signalement.objects.filter(
            citoyen=self.request.user
        ).order_by('-date_signalement')


class CreerSignalementView(generics.CreateAPIView):
    """Créer un signalement"""
    
    serializer_class = SignalementCreateSerializer
    permission_classes = [permissions.IsAuthenticated]


class SignalementDetailCitoyenView(generics.RetrieveAPIView):
    """Détail d'un signalement (citoyen)"""
    
    serializer_class = SignalementDetailSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrAgent]
    
    def get_queryset(self):
        return Signalement.objects.filter(citoyen=self.request.user)


class SignalementsAgentListView(generics.ListAPIView):
    """Liste des signalements (agent)"""
    
    serializer_class = SignalementListSerializer
    permission_classes = [IsAgentCommunal]
    
    def get_queryset(self):
        user = self.request.user
        queryset = Signalement.objects.all()
        
        if not user.is_admin_national():
            queryset = queryset.filter(mairie=user.mairie)
        
        statut = self.request.query_params.get('statut')
        categorie = self.request.query_params.get('categorie')
        
        if statut:
            queryset = queryset.filter(statut=statut)
        if categorie:
            queryset = queryset.filter(categorie=categorie)
        
        return queryset.order_by('-date_signalement')


class SignalementAgentDetailView(generics.RetrieveAPIView):
    """Détail d'un signalement (agent)"""
    
    serializer_class = SignalementDetailSerializer
    permission_classes = [IsAgentCommunal]
    
    def get_queryset(self):
        user = self.request.user
        if user.is_admin_national():
            return Signalement.objects.all()
        return Signalement.objects.filter(mairie=user.mairie)


class RepondreSignalementView(APIView):
    """Répondre à un signalement"""
    
    permission_classes = [IsAgentCommunal]
    
    def post(self, request, pk):
        user = request.user
        
        if user.is_admin_national():
            signalement = get_object_or_404(Signalement, pk=pk)
        else:
            signalement = get_object_or_404(Signalement, pk=pk, mairie=user.mairie)
        
        serializer = SignalementReponseSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        signalement.statut = serializer.validated_data['statut']
        signalement.reponse = serializer.validated_data.get('reponse', '')
        signalement.traite_par = user
        signalement.date_traitement = timezone.now()
        signalement.save()
        
        return Response({
            'message': 'Signalement traité avec succès',
            'signalement': SignalementDetailSerializer(signalement).data
        })


# ===== Rendez-vous =====

class MesRendezVousView(generics.ListAPIView):
    """Liste des RDV du citoyen"""
    
    serializer_class = RendezVousListSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return RendezVous.objects.filter(
            citoyen=self.request.user
        ).order_by('-date_heure')


class DemanderRendezVousView(generics.CreateAPIView):
    """Demander un rendez-vous"""
    
    serializer_class = RendezVousDemandeSerializer
    permission_classes = [permissions.IsAuthenticated]


class RendezVousDetailCitoyenView(generics.RetrieveAPIView):
    """Détail d'un RDV (citoyen)"""
    
    serializer_class = RendezVousDetailSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrAgent]
    
    def get_queryset(self):
        return RendezVous.objects.filter(citoyen=self.request.user)


class AnnulerRendezVousView(APIView):
    """Annuler un RDV (citoyen)"""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, pk):
        rdv = get_object_or_404(RendezVous, pk=pk, citoyen=request.user)
        
        if rdv.statut == RendezVous.Statut.TERMINE:
            return Response(
                {'error': 'Impossible d\'annuler un rendez-vous terminé'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        rdv.statut = RendezVous.Statut.ANNULE
        rdv.save()
        
        return Response({'message': 'Rendez-vous annulé'})


class RendezVousAgentListView(generics.ListAPIView):
    """Liste des RDV (agent)"""
    
    serializer_class = RendezVousListSerializer
    permission_classes = [IsAgentCommunal]
    
    def get_queryset(self):
        user = self.request.user
        queryset = RendezVous.objects.all()
        
        if not user.is_admin_national():
            queryset = queryset.filter(service__mairie=user.mairie)
        
        statut = self.request.query_params.get('statut')
        date = self.request.query_params.get('date')
        
        if statut:
            queryset = queryset.filter(statut=statut)
        if date:
            queryset = queryset.filter(date_heure__date=date)
        
        return queryset.order_by('date_heure')


class RendezVousAgentDetailView(generics.RetrieveAPIView):
    """Détail d'un RDV (agent)"""
    
    serializer_class = RendezVousDetailSerializer
    permission_classes = [IsAgentCommunal]
    
    def get_queryset(self):
        user = self.request.user
        if user.is_admin_national():
            return RendezVous.objects.all()
        return RendezVous.objects.filter(service__mairie=user.mairie)


class ConfirmerRendezVousView(APIView):
    """Confirmer/modifier un RDV (agent)"""
    
    permission_classes = [IsAgentCommunal]
    
    def post(self, request, pk):
        user = request.user
        
        if user.is_admin_national():
            rdv = get_object_or_404(RendezVous, pk=pk)
        else:
            rdv = get_object_or_404(RendezVous, pk=pk, service__mairie=user.mairie)
        
        serializer = RendezVousConfirmationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        rdv.statut = serializer.validated_data['statut']
        rdv.notes_agent = serializer.validated_data.get('notes', '')
        rdv.confirme_par = user
        rdv.save()
        
        return Response({
            'message': 'Rendez-vous mis à jour',
            'rdv': RendezVousDetailSerializer(rdv).data
        })
