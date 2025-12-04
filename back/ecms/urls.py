from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    # Admin Django
    path('admin/', admin.site.urls),
    
    # ===== API Authentication =====
    path('api/auth/', include('apps.users.urls')),
    path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # ===== API Endpoints =====
    path('api/mairies/', include('apps.mairies.urls')),
    path('api/demarches/', include('apps.demarches.urls')),
    path('api/documents/', include('apps.documents.urls')),
    path('api/projets/', include('apps.projets.urls')),
    path('api/evenements/', include('apps.evenements.urls')),
]

# Servir les fichiers media en développement
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)