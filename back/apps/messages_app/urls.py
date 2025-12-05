"""
Messages URLs - /api/v1/messages/
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ConversationViewSet, ConversationStatsView

router = DefaultRouter()
router.register(r'conversations', ConversationViewSet, basename='conversation')

urlpatterns = [
    path('stats/', ConversationStatsView.as_view(), name='messages_stats'),
    path('', include(router.urls)),
]
