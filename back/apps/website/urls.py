"""
Website URLs - /api/v1/website/
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    WebsiteConfigView, SectionViewSet, SectionReorderView,
    PageViewSet, WebsitePublishView, WebsitePreviewView
)

router = DefaultRouter()
router.register(r'sections', SectionViewSet, basename='section')
router.register(r'pages', PageViewSet, basename='page')

urlpatterns = [
    path('config/', WebsiteConfigView.as_view(), name='website_config'),
    path('sections/reorder/', SectionReorderView.as_view(), name='sections_reorder'),
    path('publish/', WebsitePublishView.as_view(), name='website_publish'),
    path('preview/', WebsitePreviewView.as_view(), name='website_preview'),
    path('', include(router.urls)),
]
