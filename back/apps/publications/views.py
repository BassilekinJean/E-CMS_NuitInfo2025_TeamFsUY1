"""
Publications views - CRUD publications avec likes et commentaires
"""
from rest_framework import viewsets, views, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.shortcuts import get_object_or_404

from .models import Publication, Category, Like, Comment
from .serializers import (
    PublicationSerializer, PublicationCreateSerializer,
    CategorySerializer, CommentSerializer, CommentCreateSerializer
)


class CategoryViewSet(viewsets.ModelViewSet):
    """
    CRUD Catégories de publications
    GET /api/v1/publications/categories/
    """
    permission_classes = [IsAuthenticated]
    serializer_class = CategorySerializer
    
    def get_queryset(self):
        user = self.request.user
        if user.mairie:
            return Category.objects.filter(mairie=user.mairie)
        return Category.objects.none()
    
    def perform_create(self, serializer):
        serializer.save(mairie=self.request.user.mairie)


class PublicationViewSet(viewsets.ModelViewSet):
    """
    CRUD Publications
    GET/POST /api/v1/publications/
    GET/PUT/DELETE /api/v1/publications/{id}/
    """
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return PublicationCreateSerializer
        return PublicationSerializer
    
    def get_queryset(self):
        user = self.request.user
        queryset = Publication.objects.all()
        
        if user.mairie:
            queryset = queryset.filter(mairie=user.mairie)
        
        # Filtres
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        type_filter = self.request.query_params.get('type')
        if type_filter:
            queryset = queryset.filter(type=type_filter)
        
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(categories__slug=category)
        
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(title__icontains=search)
        
        return queryset.select_related('author', 'mairie').prefetch_related('categories')
    
    def perform_create(self, serializer):
        publication = serializer.save(
            author=self.request.user,
            mairie=self.request.user.mairie
        )
        
        # Si publié, mettre la date de publication
        if publication.status == Publication.Status.PUBLISHED:
            publication.published_at = timezone.now()
            publication.save()
    
    @action(detail=True, methods=['post'])
    def like(self, request, pk=None):
        """POST /api/v1/publications/{id}/like/"""
        publication = self.get_object()
        user = request.user
        
        like, created = Like.objects.get_or_create(
            publication=publication,
            user=user
        )
        
        if not created:
            # Déjà liké, on retire le like
            like.delete()
            return Response({
                'liked': False,
                'likes_count': publication.likes_count
            })
        
        return Response({
            'liked': True,
            'likes_count': publication.likes_count
        })
    
    @action(detail=True, methods=['get', 'post'])
    def comments(self, request, pk=None):
        """GET/POST /api/v1/publications/{id}/comments/"""
        publication = self.get_object()
        
        if request.method == 'GET':
            comments = publication.comments.filter(
                status=Comment.Status.APPROVED,
                parent__isnull=True
            ).select_related('author')
            
            serializer = CommentSerializer(comments, many=True)
            return Response({'comments': serializer.data})
        
        # POST
        serializer = CommentCreateSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(
                publication=publication,
                author=request.user
            )
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def publish(self, request, pk=None):
        """POST /api/v1/publications/{id}/publish/"""
        publication = self.get_object()
        publication.status = Publication.Status.PUBLISHED
        publication.published_at = timezone.now()
        publication.save()
        
        return Response({
            'status': 'published',
            'published_at': publication.published_at
        })
    
    @action(detail=True, methods=['post'])
    def archive(self, request, pk=None):
        """POST /api/v1/publications/{id}/archive/"""
        publication = self.get_object()
        publication.status = Publication.Status.ARCHIVED
        publication.save()
        
        return Response({'status': 'archived'})
