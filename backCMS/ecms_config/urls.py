"""
URL configuration for E-CMS - CMS Multisite Communes Camerounaises
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    # Admin Django
    path('admin/', admin.site.urls),
    
    # API REST
    path('api/v1/', include('api.urls', namespace='api')),
]

# Django CMS (si disponible, doit être en dernier)
if getattr(settings, 'DJANGO_CMS_AVAILABLE', False):
    urlpatterns += [
        path('', include('cms.urls')),
    ]

# Servir les fichiers media en développement
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

# Configuration admin
admin.site.site_header = 'E-CMS Administration'
admin.site.site_title = 'E-CMS Admin'
admin.site.index_title = 'Tableau de bord'
