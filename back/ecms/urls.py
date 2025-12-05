from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import SpectacularRedocView, SpectacularAPIView, SpectacularSwaggerView


urlpatterns = [
    # Admin Django
    path('admin/', admin.site.urls),
    
    # ===== API v1 Endpoints (alignés avec le frontend) =====
    path('api/v1/auth/', include('apps.users.urls')),
    path('api/v1/dashboard/', include('apps.dashboard.urls')),
    path('api/v1/publications/', include('apps.publications.urls')),
    path('api/v1/events/', include('apps.evenements.urls')),
    path('api/v1/messages/', include('apps.messages_app.urls')),
    path('api/v1/website/', include('apps.website.urls')),
    path('api/v1/settings/', include('apps.settings_app.urls')),
    path('api/v1/notifications/', include('apps.notifications.urls')),
    path('api/v1/media/', include('apps.media.urls')),
    path('api/v1/mairies/', include('apps.mairies.urls')),
    path('api/v1/demarches/', include('apps.demarches.urls')),
    path('api/v1/documents/', include('apps.documents.urls')),
    path('api/v1/projets/', include('apps.projets.urls')),

    # ===== Documentation API =====
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('docs/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
    path('swagger/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
]

# Servir les fichiers media en développement
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)