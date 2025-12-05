from drf_spectacular.utils import extend_schema, OpenApiParameter
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

# ===== Permissions =====
class IsAgentCommunal(permissions.BasePermission):
    """Permission pour les agents communaux"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            request.user.is_agent_communal() or request.user.is_admin_national()
        )

# ===== Tags Swagger =====
TAG_PROJETS = {'name': 'Projets', 'description': 'Projets municipaux et budgets participatifs'}

# ===== Projets Publics (Transparence) =====
@extend_schema(
    tags=[TAG_PROJETS],
    parameters=[OpenApiParameter("statut", description="Filtrer par statut", required=False)],
    responses=ProjetListSerializer(many=True),
    description="Liste des projets publics d'une mairie"
)
class ProjetsPublicsListView(generics.ListAPIView):
    serializer_class = ProjetListSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        mairie_slug = self.kwargs.get('mairie_slug')
        mairie = get_object_or_404(Mairie, slug=mairie_slug)
        queryset = Projet.objects.filter(mairie=mairie)
        statut = self.request.query_params.get('statut')
        if statut:
            queryset = queryset.filter(statut=statut)
        return queryset.order_by('-date_creation')

@extend_schema(
    tags=[TAG_PROJETS],
    responses=ProjetPublicSerializer,
    description="Détail public d'un projet"
)
class ProjetPublicDetailView(generics.RetrieveAPIView):
    serializer_class = ProjetPublicSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        mairie_slug = self.kwargs.get('mairie_slug')
        return Projet.objects.filter(mairie__slug=mairie_slug)

@extend_schema(
    tags=[TAG_PROJETS],
    responses=StatistiqueProjetsSerializer,
    description="Statistiques des projets d'une mairie"
)
class StatistiquesProjetsView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, mairie_slug):
        mairie = get_object_or_404(Mairie, slug=mairie_slug)
        projets = Projet.objects.filter(mairie=mairie)
        serializer = StatistiqueProjetsSerializer()
        return Response(serializer.to_representation(projets))

@extend_schema(
    tags=[TAG_PROJETS],
    responses=ProjetListSerializer(many=True),
    description="Liste des projets en cours d'une mairie"
)
class ProjetsEnCoursView(generics.ListAPIView):
    serializer_class = ProjetListSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        mairie_slug = self.kwargs.get('mairie_slug')
        mairie = get_object_or_404(Mairie, slug=mairie_slug)
        return Projet.objects.filter(mairie=mairie, statut=Projet.Statut.EN_COURS).order_by('-avancement')

# ===== Gestion des Projets (Agent) =====
@extend_schema(
    tags=[TAG_PROJETS],
    request=ProjetCreateSerializer,
    responses=ProjetListSerializer(many=True),
    description="Liste et création des projets pour un agent"
)
class ProjetsGestionListView(generics.ListCreateAPIView):
    permission_classes = [IsAgentCommunal]

    def get_serializer_class(self):
        return ProjetCreateSerializer if self.request.method == 'POST' else ProjetListSerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_admin_national():
            mairie_id = self.request.query_params.get('mairie')
            return Projet.objects.filter(mairie_id=mairie_id) if mairie_id else Projet.objects.all()
        return Projet.objects.filter(mairie=user.mairie)

    def perform_create(self, serializer):
        user = self.request.user
        if user.is_admin_national():
            mairie_id = self.request.data.get('mairie')
            mairie = get_object_or_404(Mairie, pk=mairie_id)
        else:
            mairie = user.mairie
        serializer.save(mairie=mairie, responsable=user)

@extend_schema(
    tags=[TAG_PROJETS],
    request=ProjetDetailSerializer,
    responses=ProjetDetailSerializer,
    description="Détail, modification ou suppression d'un projet"
)
class ProjetGestionDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ProjetDetailSerializer
    permission_classes = [IsAgentCommunal]

    def get_queryset(self):
        user = self.request.user
        return Projet.objects.all() if user.is_admin_national() else Projet.objects.filter(mairie=user.mairie)

# ===== Mises à jour de Projet =====
@extend_schema(
    tags=[TAG_PROJETS],
    request=MiseAJourCreateSerializer,
    responses=MiseAJourProjetSerializer(many=True),
    description="Liste et création des mises à jour d'un projet"
)
class MisesAJourProjetView(generics.ListCreateAPIView):
    permission_classes = [IsAgentCommunal]

    def get_serializer_class(self):
        return MiseAJourCreateSerializer if self.request.method == 'POST' else MiseAJourProjetSerializer

    def get_queryset(self):
        projet_id = self.kwargs.get('projet_id')
        return MiseAJourProjet.objects.filter(projet_id=projet_id).order_by('-date_mise_a_jour')

    def perform_create(self, serializer):
        projet_id = self.kwargs.get('projet_id')
        projet = get_object_or_404(Projet, pk=projet_id)
        avancement_avant = projet.avancement
        avancement_apres = serializer.validated_data.get('avancement_apres', avancement_avant)
        projet.avancement = avancement_apres
        projet.save()
        serializer.save(projet=projet, auteur=self.request.user, avancement_avant=avancement_avant)

@extend_schema(
    tags=[TAG_PROJETS],
    request=MiseAJourProjetSerializer,
    responses=MiseAJourProjetSerializer,
    description="Détail, modification ou suppression d'une mise à jour"
)
class MiseAJourDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = MiseAJourProjetSerializer
    permission_classes = [IsAgentCommunal]
    queryset = MiseAJourProjet.objects.all()

# ===== Documents de Projet =====
@extend_schema(
    tags=[TAG_PROJETS],
    request=DocumentProjetSerializer,
    responses=DocumentProjetSerializer(many=True),
    description="Liste et ajout de documents pour un projet"
)
class DocumentsProjetView(generics.ListCreateAPIView):
    serializer_class = DocumentProjetSerializer
    permission_classes = [IsAgentCommunal]

    def get_queryset(self):
        projet_id = self.kwargs.get('projet_id')
        return DocumentProjet.objects.filter(projet_id=projet_id).order_by('-date_ajout')

    def perform_create(self, serializer):
        projet_id = self.kwargs.get('projet_id')
        projet = get_object_or_404(Projet, pk=projet_id)
        serializer.save(projet=projet)

@extend_schema(
    tags=[TAG_PROJETS],
    request=DocumentProjetSerializer,
    responses=DocumentProjetSerializer,
    description="Détail, modification ou suppression d'un document"
)
class DocumentProjetDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = DocumentProjetSerializer
    permission_classes = [IsAgentCommunal]
    queryset = DocumentProjet.objects.all()

# ===== Mise à jour rapide de l'avancement =====
@extend_schema(
    tags=[TAG_PROJETS],
    request={
        'type': 'object',
        'properties': {
            'avancement': {'type': 'integer', 'description': 'Nouvel avancement (0-100)'},
            'commentaire': {'type': 'string', 'description': 'Commentaire optionnel'}
        },
        'required': ['avancement']
    },
    responses={
        200: {
            'type': 'object',
            'properties': {
                'message': {'type': 'string'},
                'avancement_avant': {'type': 'integer'},
                'avancement_apres': {'type': 'integer'}
            }
        },
        400: {'type': 'object'}
    },
    description="Mise à jour rapide de l'avancement d'un projet"
)
class MettreAJourAvancementView(APIView):
    permission_classes = [IsAgentCommunal]

    def post(self, request, pk):
        user = request.user
        projet = get_object_or_404(Projet, pk=pk) if user.is_admin_national() else get_object_or_404(Projet, pk=pk, mairie=user.mairie)
        nouvel_avancement = request.data.get('avancement')
        commentaire = request.data.get('commentaire', '')

        if nouvel_avancement is None:
            return Response({'error': 'Le champ avancement est requis'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            nouvel_avancement = int(nouvel_avancement)
            if not 0 <= nouvel_avancement <= 100:
                raise ValueError()
        except (ValueError, TypeError):
            return Response({'error': "L'avancement doit être un entier entre 0 et 100"}, status=status.HTTP_400_BAD_REQUEST)

        avancement_avant = projet.avancement
        projet.avancement = nouvel_avancement
        projet.save()

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

# ===== Changer le statut d'un projet =====
@extend_schema(
    tags=[TAG_PROJETS],
    request={
        'type': 'object',
        'properties': {
            'statut': {'type': 'string', 'description': 'Nouveau statut du projet'}
        },
        'required': ['statut']
    },
    responses={
        200: {
            'type': 'object',
            'properties': {
                'message': {'type': 'string'},
                'ancien_statut': {'type': 'string'},
                'nouveau_statut': {'type': 'string'}
            }
        },
        400: {'type': 'object'}
    },
    description="Changer le statut d'un projet"
)
class ChangerStatutProjetView(APIView):
    permission_classes = [IsAgentCommunal]

    def post(self, request, pk):
        user = request.user
        projet = get_object_or_404(Projet, pk=pk) if user.is_admin_national() else get_object_or_404(Projet, pk=pk, mairie=user.mairie)
        nouveau_statut = request.data.get('statut')

        if nouveau_statut not in dict(Projet.Statut.choices):
            return Response({'error': 'Statut invalide'}, status=status.HTTP_400_BAD_REQUEST)

        ancien_statut = projet.statut
        projet.statut = nouveau_statut

        if nouveau_statut == Projet.Statut.TERMINE and not projet.date_fin_reelle:
            projet.date_fin_reelle = timezone.now().date()
            projet.avancement = 100

        projet.save()

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
