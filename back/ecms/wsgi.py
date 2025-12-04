import os
import sys

from django.core.wsgi import get_wsgi_application

# Ajoute le chemin du projet à sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecms.settings')

application = get_wsgi_application()