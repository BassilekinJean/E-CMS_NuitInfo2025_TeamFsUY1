"""
Notifications URLs - /api/v1/notifications/
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import NotificationViewSet, MarkAllReadView

router = DefaultRouter()
router.register(r'', NotificationViewSet, basename='notification')

urlpatterns = [
    path('read-all/', MarkAllReadView.as_view(), name='notifications_read_all'),
    path('', include(router.urls)),
]
