from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('my_app.urls')),  # Assurez-vous d'avoir un fichier urls.py dans my_app
]