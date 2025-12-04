from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.utils import timezone
from .models import DocumentOfficiel, Actualite, PageCMS, FAQ
from .serializers import (
    DocumentOfficielListSerializer, DocumentOfficielDetailSerializer,
    DocumentOfficielCreateSerializer, ActualiteListSerializer,
    ActualiteDetailSerializer, ActualiteCreateSerializer,
    PageCMSListSerializer, PageCMSDetailSerializer, PageCMSCreateSerializer,
    PageCMSPublicSerializer, FAQSerializer, FAQPublicSerializer,
    MenuNavigationSerializer
)
from apps.mairies.models import Mairie


class IsAgentCommunal(permissions.BasePermission):
    """Permission pour les agents communaux"""
    
    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            request.user.is_agent_communal() or request.user.is_admin_national()
        )


# ===== Documents Officiels =====

class DocumentsPublicsListView(generics.ListAPIView):
    """Liste des documents publics d'une mairie"""
    
    serializer_class = DocumentOfficielListSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        mairie_slug = self.kwargs.get('mairie_slug')
        mairie = get_object_or_404(Mairie, slug=mairie_slug)
        
        queryset = DocumentOfficiel.objects.filter(mairie=mairie, est_public=True)
        
        type_doc = self.request.query_params.get('type')
        if type_doc:
            queryset = queryset.filter(type_document=type_doc)
        
        return queryset.order_by('-date_publication')


class DocumentPublicDetailView(generics.RetrieveAPIView):
    """Détail d'un document public"""
    
    serializer_class = DocumentOfficielDetailSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        return DocumentOfficiel.objects.filter(est_public=True)


class DocumentsGestionListView(generics.ListCreateAPIView):
    """Gestion des documents (agent)"""
    
    permission_classes = [IsAgentCommunal]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return DocumentOfficielCreateSerializer
        return DocumentOfficielListSerializer
    
    def get_queryset(self):
        user = self.request.user
        if user.is_admin_national():
            mairie_id = self.request.query_params.get('mairie')
            if mairie_id:
                return DocumentOfficiel.objects.filter(mairie_id=mairie_id)
            return DocumentOfficiel.objects.all()
        return DocumentOfficiel.objects.filter(mairie=user.mairie)
    
    def perform_create(self, serializer):
        user = self.request.user
        if user.is_admin_national():
            mairie_id = self.request.data.get('mairie')
            mairie = get_object_or_404(Mairie, pk=mairie_id)
        else:
            mairie = user.mairie
        serializer.save(mairie=mairie, auteur=user)


class DocumentGestionDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Détail/modification/suppression d'un document"""
    
    serializer_class = DocumentOfficielDetailSerializer
    permission_classes = [IsAgentCommunal]
    
    def get_queryset(self):
        user = self.request.user
        if user.is_admin_national():
            return DocumentOfficiel.objects.all()
        return DocumentOfficiel.objects.filter(mairie=user.mairie)


# ===== Actualités =====

class ActualitesPubliquesListView(generics.ListAPIView):
    """Liste des actualités publiées d'une mairie"""
    
    serializer_class = ActualiteListSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        mairie_slug = self.kwargs.get('mairie_slug')
        mairie = get_object_or_404(Mairie, slug=mairie_slug)
        
        queryset = Actualite.objects.filter(
            mairie=mairie,
            est_publie=True,
            date_publication__lte=timezone.now()
        )
        
        categorie = self.request.query_params.get('categorie')
        if categorie:
            queryset = queryset.filter(categorie=categorie)
        
        return queryset.order_by('-date_publication')


class ActualitePublicDetailView(generics.RetrieveAPIView):
    """Détail d'une actualité publiée"""
    
    serializer_class = ActualiteDetailSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'slug'
    
    def get_queryset(self):
        return Actualite.objects.filter(
            est_publie=True,
            date_publication__lte=timezone.now()
        )


class ActualitesEnVedetteView(generics.ListAPIView):
    """Actualités mises en avant d'une mairie"""
    
    serializer_class = ActualiteListSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        mairie_slug = self.kwargs.get('mairie_slug')
        mairie = get_object_or_404(Mairie, slug=mairie_slug)
        
        return Actualite.objects.filter(
            mairie=mairie,
            est_publie=True,
            est_mis_en_avant=True,
            date_publication__lte=timezone.now()
        ).order_by('-date_publication')[:5]


class ActualitesGestionListView(generics.ListCreateAPIView):
    """Gestion des actualités (agent)"""
    
    permission_classes = [IsAgentCommunal]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ActualiteCreateSerializer
        return ActualiteListSerializer
    
    def get_queryset(self):
        user = self.request.user
        if user.is_admin_national():
            mairie_id = self.request.query_params.get('mairie')
            if mairie_id:
                return Actualite.objects.filter(mairie_id=mairie_id)
            return Actualite.objects.all()
        return Actualite.objects.filter(mairie=user.mairie)
    
    def perform_create(self, serializer):
        user = self.request.user
        if user.is_admin_national():
            mairie_id = self.request.data.get('mairie')
            mairie = get_object_or_404(Mairie, pk=mairie_id)
        else:
            mairie = user.mairie
        serializer.save(mairie=mairie, auteur=user)


class ActualiteGestionDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Détail/modification/suppression d'une actualité"""
    
    serializer_class = ActualiteDetailSerializer
    permission_classes = [IsAgentCommunal]
    
    def get_queryset(self):
        user = self.request.user
        if user.is_admin_national():
            return Actualite.objects.all()
        return Actualite.objects.filter(mairie=user.mairie)


# ===== Pages CMS =====

class PagesPubliquesListView(generics.ListAPIView):
    """Liste des pages publiées d'une mairie"""
    
    serializer_class = PageCMSListSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        mairie_slug = self.kwargs.get('mairie_slug')
        mairie = get_object_or_404(Mairie, slug=mairie_slug)
        
        return PageCMS.objects.filter(
            mairie=mairie,
            est_publie=True
        ).order_by('ordre')


class PagePublicDetailView(generics.RetrieveAPIView):
    """Détail d'une page publiée"""
    
    serializer_class = PageCMSPublicSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'slug'
    
    def get_queryset(self):
        mairie_slug = self.kwargs.get('mairie_slug')
        return PageCMS.objects.filter(
            mairie__slug=mairie_slug,
            est_publie=True
        )


class MenuNavigationView(APIView):
    """Récupérer le menu de navigation d'une mairie"""
    
    permission_classes = [permissions.AllowAny]
    
    def get(self, request, mairie_slug):
        mairie = get_object_or_404(Mairie, slug=mairie_slug)
        serializer = MenuNavigationSerializer()
        return Response(serializer.to_representation(mairie))


class PagesGestionListView(generics.ListCreateAPIView):
    """Gestion des pages (agent)"""
    
    permission_classes = [IsAgentCommunal]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return PageCMSCreateSerializer
        return PageCMSListSerializer
    
    def get_queryset(self):
        user = self.request.user
        if user.is_admin_national():
            mairie_id = self.request.query_params.get('mairie')
            if mairie_id:
                return PageCMS.objects.filter(mairie_id=mairie_id)
            return PageCMS.objects.all()
        return PageCMS.objects.filter(mairie=user.mairie)
    
    def perform_create(self, serializer):
        user = self.request.user
        if user.is_admin_national():
            mairie_id = self.request.data.get('mairie')
            mairie = get_object_or_404(Mairie, pk=mairie_id)
        else:
            mairie = user.mairie
        serializer.save(mairie=mairie)


class PageGestionDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Détail/modification/suppression d'une page"""
    
    serializer_class = PageCMSDetailSerializer
    permission_classes = [IsAgentCommunal]
    
    def get_queryset(self):
        user = self.request.user
        if user.is_admin_national():
            return PageCMS.objects.all()
        return PageCMS.objects.filter(mairie=user.mairie)


# ===== FAQ =====

class FAQPubliquesListView(generics.ListAPIView):
    """Liste des FAQ actives d'une mairie"""
    
    serializer_class = FAQPublicSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        mairie_slug = self.kwargs.get('mairie_slug')
        mairie = get_object_or_404(Mairie, slug=mairie_slug)
        
        queryset = FAQ.objects.filter(mairie=mairie, est_active=True)
        
        categorie = self.request.query_params.get('categorie')
        if categorie:
            queryset = queryset.filter(categorie=categorie)
        
        return queryset.order_by('ordre')


class FAQGestionListView(generics.ListCreateAPIView):
    """Gestion des FAQ (agent)"""
    
    serializer_class = FAQSerializer
    permission_classes = [IsAgentCommunal]
    
    def get_queryset(self):
        user = self.request.user
        if user.is_admin_national():
            mairie_id = self.request.query_params.get('mairie')
            if mairie_id:
                return FAQ.objects.filter(mairie_id=mairie_id)
            return FAQ.objects.all()
        return FAQ.objects.filter(mairie=user.mairie)
    
    def perform_create(self, serializer):
        user = self.request.user
        if user.is_admin_national():
            mairie_id = self.request.data.get('mairie')
            mairie = get_object_or_404(Mairie, pk=mairie_id)
        else:
            mairie = user.mairie
        serializer.save(mairie=mairie)


class FAQGestionDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Détail/modification/suppression d'une FAQ"""
    
    serializer_class = FAQSerializer
    permission_classes = [IsAgentCommunal]
    
    def get_queryset(self):
        user = self.request.user
        if user.is_admin_national():
            return FAQ.objects.all()
        return FAQ.objects.filter(mairie=user.mairie)
