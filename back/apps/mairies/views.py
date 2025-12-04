from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.utils import timezone
from .models import Mairie, DemandeCreationSite, ServiceMunicipal
from .serializers import (
    MairieListSerializer, MairieDetailSerializer, MairiePublicSerializer,
    MairieCreateSerializer, ServiceMunicipalSerializer,
    DemandeCreationSiteSerializer, DemandeCreationSiteAdminSerializer
)


class IsAdminNational(permissions.BasePermission):
    """Permission pour les administrateurs nationaux"""
    
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_admin_national()


class IsAgentOfMairie(permissions.BasePermission):
    """Permission pour les agents de la mairie concernée"""
    
    def has_object_permission(self, request, view, obj):
        if request.user.is_admin_national():
            return True
        return request.user.mairie == obj


# ===== Mairies Publiques =====

class MairiesPubliquesListView(generics.ListAPIView):
    """Liste publique des mairies actives"""
    
    serializer_class = MairieListSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        queryset = Mairie.objects.filter(statut=Mairie.Statut.ACTIVE)
        
        # Filtres
        region = self.request.query_params.get('region')
        ville = self.request.query_params.get('ville')
        search = self.request.query_params.get('search')
        
        if region:
            queryset = queryset.filter(region__icontains=region)
        if ville:
            queryset = queryset.filter(ville__icontains=ville)
        if search:
            queryset = queryset.filter(nom__icontains=search)
        
        return queryset.order_by('nom')


class MairiePublicDetailView(generics.RetrieveAPIView):
    """Détail public d'une mairie"""
    
    serializer_class = MairiePublicSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'slug'
    
    def get_queryset(self):
        return Mairie.objects.filter(statut=Mairie.Statut.ACTIVE)


# ===== Gestion des Mairies (Admin) =====

class MairiesAdminListView(generics.ListCreateAPIView):
    """Liste et création de mairies (admin national)"""
    
    permission_classes = [IsAdminNational]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return MairieCreateSerializer
        return MairieListSerializer
    
    def get_queryset(self):
        queryset = Mairie.objects.all()
        
        statut = self.request.query_params.get('statut')
        if statut:
            queryset = queryset.filter(statut=statut)
        
        return queryset.order_by('-date_creation')
    
    def perform_create(self, serializer):
        mairie = serializer.save(statut=Mairie.Statut.ACTIVE, date_validation=timezone.now())
        return mairie


class MairieAdminDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Détail, modification et suppression d'une mairie (admin)"""
    
    queryset = Mairie.objects.all()
    serializer_class = MairieDetailSerializer
    permission_classes = [IsAdminNational]
    lookup_field = 'slug'


class MaMairieView(generics.RetrieveUpdateAPIView):
    """Vue pour l'agent de consulter/modifier sa propre mairie"""
    
    serializer_class = MairieDetailSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        if not self.request.user.mairie:
            return None
        return self.request.user.mairie
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        if not instance:
            return Response(
                {'error': 'Vous n\'êtes rattaché à aucune mairie'},
                status=status.HTTP_404_NOT_FOUND
            )
        serializer = self.get_serializer(instance)
        return Response(serializer.data)


# ===== Services Municipaux =====

class ServicesListView(generics.ListCreateAPIView):
    """Liste et création de services pour une mairie"""
    
    serializer_class = ServiceMunicipalSerializer
    
    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]
    
    def get_queryset(self):
        mairie_slug = self.kwargs.get('mairie_slug')
        mairie = get_object_or_404(Mairie, slug=mairie_slug)
        
        if self.request.user.is_authenticated and (
            self.request.user.is_admin_national() or self.request.user.mairie == mairie
        ):
            return ServiceMunicipal.objects.filter(mairie=mairie)
        
        return ServiceMunicipal.objects.filter(mairie=mairie, est_actif=True)
    
    def perform_create(self, serializer):
        mairie_slug = self.kwargs.get('mairie_slug')
        mairie = get_object_or_404(Mairie, slug=mairie_slug)
        
        # Vérifier les permissions
        if not (self.request.user.is_admin_national() or self.request.user.mairie == mairie):
            return Response(
                {'error': 'Vous n\'avez pas les permissions pour cette mairie'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer.save(mairie=mairie)


class ServiceDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Détail, modification et suppression d'un service"""
    
    serializer_class = ServiceMunicipalSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        mairie_slug = self.kwargs.get('mairie_slug')
        return ServiceMunicipal.objects.filter(mairie__slug=mairie_slug)


# ===== Demandes de Création de Site =====

class DemandeCreationSiteCreateView(generics.CreateAPIView):
    """Soumettre une demande de création de site (public)"""
    
    serializer_class = DemandeCreationSiteSerializer
    permission_classes = [permissions.AllowAny]


class DemandesCreationListView(generics.ListAPIView):
    """Liste des demandes de création (admin national)"""
    
    serializer_class = DemandeCreationSiteSerializer
    permission_classes = [IsAdminNational]
    
    def get_queryset(self):
        queryset = DemandeCreationSite.objects.all()
        
        statut = self.request.query_params.get('statut')
        if statut:
            queryset = queryset.filter(statut=statut)
        
        return queryset.order_by('-date_demande')


class DemandeCreationDetailView(generics.RetrieveUpdateAPIView):
    """Détail et traitement d'une demande (admin national)"""
    
    queryset = DemandeCreationSite.objects.all()
    serializer_class = DemandeCreationSiteAdminSerializer
    permission_classes = [IsAdminNational]


class ValiderDemandeView(APIView):
    """Valider une demande et créer la mairie"""
    
    permission_classes = [IsAdminNational]
    
    def post(self, request, pk):
        demande = get_object_or_404(DemandeCreationSite, pk=pk)
        
        if demande.statut != DemandeCreationSite.Statut.EN_ATTENTE:
            return Response(
                {'error': 'Cette demande a déjà été traitée'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Créer la mairie
        mairie = Mairie.objects.create(
            nom=demande.nom_mairie,
            localisation=demande.localisation,
            contact=demande.contact,
            email_contact=demande.email,
            telephone=demande.telephone,
            statut=Mairie.Statut.ACTIVE,
            date_validation=timezone.now()
        )
        
        # Mettre à jour la demande
        demande.statut = DemandeCreationSite.Statut.VALIDEE
        demande.date_traitement = timezone.now()
        demande.mairie_creee = mairie
        demande.save()
        
        return Response({
            'message': 'Demande validée et mairie créée',
            'mairie': MairieDetailSerializer(mairie).data
        })


class RejeterDemandeView(APIView):
    """Rejeter une demande de création"""
    
    permission_classes = [IsAdminNational]
    
    def post(self, request, pk):
        demande = get_object_or_404(DemandeCreationSite, pk=pk)
        
        if demande.statut != DemandeCreationSite.Statut.EN_ATTENTE:
            return Response(
                {'error': 'Cette demande a déjà été traitée'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        motif = request.data.get('motif', '')
        
        demande.statut = DemandeCreationSite.Statut.REJETEE
        demande.motif_rejet = motif
        demande.date_traitement = timezone.now()
        demande.save()
        
        return Response({'message': 'Demande rejetée'})
