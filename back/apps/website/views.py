"""
Website views - Configuration et gestion du site web
"""
from rest_framework import viewsets, views, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.shortcuts import get_object_or_404

from .models import WebsiteConfig, Section, Page
from .serializers import (
    WebsiteConfigSerializer, SectionSerializer, PageSerializer
)


class WebsiteConfigView(views.APIView):
    """
    GET/PUT /api/v1/website/config/
    Configuration générale du site
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        if not user.mairie:
            return Response({'error': 'Aucune mairie associée'}, status=status.HTTP_400_BAD_REQUEST)
        
        config, created = WebsiteConfig.objects.get_or_create(mairie=user.mairie)
        serializer = WebsiteConfigSerializer(config)
        return Response(serializer.data)
    
    def put(self, request):
        user = request.user
        if not user.mairie:
            return Response({'error': 'Aucune mairie associée'}, status=status.HTTP_400_BAD_REQUEST)
        
        config, created = WebsiteConfig.objects.get_or_create(mairie=user.mairie)
        serializer = WebsiteConfigSerializer(config, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class SectionViewSet(viewsets.ModelViewSet):
    """
    CRUD Sections du site
    GET /api/v1/website/sections/
    """
    permission_classes = [IsAuthenticated]
    serializer_class = SectionSerializer
    
    def get_queryset(self):
        user = self.request.user
        if user.mairie:
            config = WebsiteConfig.objects.filter(mairie=user.mairie).first()
            if config:
                return Section.objects.filter(website=config)
        return Section.objects.none()
    
    def perform_create(self, serializer):
        config, _ = WebsiteConfig.objects.get_or_create(mairie=self.request.user.mairie)
        serializer.save(website=config)


class SectionReorderView(views.APIView):
    """
    PUT /api/v1/website/sections/reorder/
    Réordonner les sections
    """
    permission_classes = [IsAuthenticated]
    
    def put(self, request):
        user = request.user
        order = request.data.get('order', [])
        
        if not user.mairie:
            return Response({'error': 'Aucune mairie associée'}, status=status.HTTP_400_BAD_REQUEST)
        
        config = WebsiteConfig.objects.filter(mairie=user.mairie).first()
        if not config:
            return Response({'error': 'Configuration non trouvée'}, status=status.HTTP_404_NOT_FOUND)
        
        for index, section_id in enumerate(order):
            Section.objects.filter(website=config, section_id=section_id).update(order=index)
        
        return Response({'message': 'Ordre des sections mis à jour'})


class PageViewSet(viewsets.ModelViewSet):
    """
    CRUD Pages personnalisées
    GET /api/v1/website/pages/
    """
    permission_classes = [IsAuthenticated]
    serializer_class = PageSerializer
    
    def get_queryset(self):
        user = self.request.user
        if user.mairie:
            config = WebsiteConfig.objects.filter(mairie=user.mairie).first()
            if config:
                return Page.objects.filter(website=config)
        return Page.objects.none()
    
    def perform_create(self, serializer):
        config, _ = WebsiteConfig.objects.get_or_create(mairie=self.request.user.mairie)
        serializer.save(website=config)


class WebsitePublishView(views.APIView):
    """
    POST /api/v1/website/publish/
    Publier/Dépublier le site
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        user = request.user
        action = request.data.get('action', 'publish')
        
        if not user.mairie:
            return Response({'error': 'Aucune mairie associée'}, status=status.HTTP_400_BAD_REQUEST)
        
        config, _ = WebsiteConfig.objects.get_or_create(mairie=user.mairie)
        
        if action == 'publish':
            config.is_published = True
            config.published_at = timezone.now()
            message = 'Site publié avec succès'
        else:
            config.is_published = False
            message = 'Site dépublié'
        
        config.save()
        
        return Response({
            'is_published': config.is_published,
            'published_at': config.published_at,
            'message': message
        })


class WebsitePreviewView(views.APIView):
    """
    GET /api/v1/website/preview/
    Générer un lien de prévisualisation
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        
        if not user.mairie:
            return Response({'error': 'Aucune mairie associée'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Générer un token temporaire pour la prévisualisation
        import secrets
        preview_token = secrets.token_urlsafe(32)
        
        preview_url = f"https://preview.{user.mairie.slug}.ecms.cm?token={preview_token}"
        expires_at = timezone.now() + timezone.timedelta(hours=1)
        
        return Response({
            'preview_url': preview_url,
            'expires_at': expires_at
        })
