"""
Notifications views
"""
from rest_framework import viewsets, views, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import Notification
from .serializers import NotificationSerializer


class NotificationViewSet(viewsets.ModelViewSet):
    """
    CRUD Notifications
    GET /api/v1/notifications/
    """
    permission_classes = [IsAuthenticated]
    serializer_class = NotificationSerializer
    http_method_names = ['get', 'put', 'delete']
    
    def get_queryset(self):
        user = self.request.user
        queryset = Notification.objects.filter(user=user)
        
        # Filtre par statut lu/non lu
        is_read = self.request.query_params.get('is_read')
        if is_read is not None:
            queryset = queryset.filter(is_read=is_read.lower() == 'true')
        
        return queryset
    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        
        return Response({
            'count': queryset.count(),
            'unread_count': queryset.filter(is_read=False).count(),
            'results': serializer.data
        })
    
    @action(detail=True, methods=['put'], url_path='read')
    def mark_read(self, request, pk=None):
        """PUT /api/v1/notifications/{id}/read/"""
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        
        return Response({'is_read': True})


class MarkAllReadView(views.APIView):
    """
    PUT /api/v1/notifications/read-all/
    Marquer toutes les notifications comme lues
    """
    permission_classes = [IsAuthenticated]
    
    def put(self, request):
        user = request.user
        updated = Notification.objects.filter(
            user=user,
            is_read=False
        ).update(is_read=True)
        
        return Response({
            'message': 'Toutes les notifications marquées comme lues',
            'updated_count': updated
        })
