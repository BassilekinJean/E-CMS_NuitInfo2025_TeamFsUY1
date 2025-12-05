"""
Publications URLs - /api/v1/publications/
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PublicationViewSet, CategoryViewSet

router = DefaultRouter()
router.register(r'', PublicationViewSet, basename='publication')
router.register(r'categories', CategoryViewSet, basename='category')

urlpatterns = [
    path('', include(router.urls)),
]
