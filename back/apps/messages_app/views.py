"""
Messages views - Gestion des conversations et messages
"""
from rest_framework import viewsets, views, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q

from .models import Conversation, Message, Attachment
from .serializers import (
    ConversationSerializer, ConversationListSerializer,
    MessageSerializer, MessageCreateSerializer
)


class ConversationViewSet(viewsets.ModelViewSet):
    """
    CRUD Conversations
    GET /api/v1/messages/conversations/
    """
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'list':
            return ConversationListSerializer
        return ConversationSerializer
    
    def get_queryset(self):
        user = self.request.user
        queryset = Conversation.objects.all()
        
        # Filtrer par mairie de l'utilisateur
        if user.mairie:
            queryset = queryset.filter(mairie=user.mairie)
        else:
            # Si c'est un citoyen, voir ses propres conversations
            queryset = queryset.filter(citizen=user)
        
        # Filtres
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        priority = self.request.query_params.get('priority')
        if priority:
            queryset = queryset.filter(priority=priority)
        
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(subject__icontains=search) |
                Q(citizen__nom__icontains=search)
            )
        
        return queryset.select_related('citizen', 'assigned_to')
    
    def perform_create(self, serializer):
        serializer.save(
            citizen=self.request.user,
            mairie=self.request.user.mairie
        )
    
    @action(detail=True, methods=['post'])
    def reply(self, request, pk=None):
        """POST /api/v1/messages/conversations/{id}/reply/"""
        conversation = self.get_object()
        
        serializer = MessageCreateSerializer(data=request.data)
        if serializer.is_valid():
            message = serializer.save(
                conversation=conversation,
                sender=request.user,
                is_from_citizen=not request.user.is_agent_communal()
            )
            
            # Mettre à jour la conversation
            conversation.save()  # Met à jour updated_at
            
            return Response(MessageSerializer(message).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['put'])
    def assign(self, request, pk=None):
        """PUT /api/v1/messages/conversations/{id}/assign/"""
        conversation = self.get_object()
        agent_id = request.data.get('agent_id')
        
        if agent_id:
            from apps.users.models import Utilisateur
            try:
                agent = Utilisateur.objects.get(id=agent_id)
                conversation.assigned_to = agent
                conversation.status = Conversation.Status.IN_PROGRESS
                conversation.save()
            except Utilisateur.DoesNotExist:
                return Response({'error': 'Agent non trouvé'}, status=status.HTTP_404_NOT_FOUND)
        else:
            conversation.assigned_to = request.user
            conversation.status = Conversation.Status.IN_PROGRESS
            conversation.save()
        
        return Response(ConversationSerializer(conversation).data)
    
    @action(detail=True, methods=['put'])
    def resolve(self, request, pk=None):
        """PUT /api/v1/messages/conversations/{id}/resolve/"""
        conversation = self.get_object()
        conversation.status = Conversation.Status.RESOLVED
        conversation.save()
        
        return Response({'status': 'resolved'})
    
    @action(detail=True, methods=['put'])
    def close(self, request, pk=None):
        """PUT /api/v1/messages/conversations/{id}/close/"""
        conversation = self.get_object()
        conversation.status = Conversation.Status.CLOSED
        conversation.save()
        
        return Response({'status': 'closed'})
    
    @action(detail=True, methods=['put'])
    def mark_read(self, request, pk=None):
        """PUT /api/v1/messages/conversations/{id}/mark-read/"""
        conversation = self.get_object()
        conversation.messages.filter(is_read=False).update(is_read=True)
        conversation.unread_count = 0
        conversation.save()
        
        return Response({'unread_count': 0})


class ConversationStatsView(views.APIView):
    """
    GET /api/v1/messages/stats/
    Statistiques des messages
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        
        if user.mairie:
            conversations = Conversation.objects.filter(mairie=user.mairie)
        else:
            conversations = Conversation.objects.filter(citizen=user)
        
        stats = {
            'total': conversations.count(),
            'open': conversations.filter(status=Conversation.Status.OPEN).count(),
            'in_progress': conversations.filter(status=Conversation.Status.IN_PROGRESS).count(),
            'resolved': conversations.filter(status=Conversation.Status.RESOLVED).count(),
            'unread': conversations.filter(unread_count__gt=0).count()
        }
        
        return Response(stats)
