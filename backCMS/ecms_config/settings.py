"""
Django settings for E-CMS - CMS Multisite pour Communes Camerounaises
Configuration Django CMS + Django REST Framework
"""

import os
from pathlib import Path
from datetime import timedelta

# Charger dotenv si disponible
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.environ.get('SECRET_KEY', 'django-insecure-ecms-dev-key-change-in-production-2025')

DEBUG = os.environ.get('DEBUG', 'True').lower() in ('true', '1', 'yes')

ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', 'localhost,127.0.0.1,*').split(',')

# ===== SITE CONFIGURATION =====
SITE_ID = 1

# ===== VÉRIFICATION DES MODULES OPTIONNELS =====
def is_module_available(module_name):
    """Vérifie si un module est disponible"""
    try:
        __import__(module_name)
        return True
    except ImportError:
        return False

# Django CMS disponible ?
DJANGO_CMS_AVAILABLE = is_module_available('cms')

# ===== INSTALLED APPS =====
INSTALLED_APPS = [
    # Django Core
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.sites',
    
    # Django REST Framework
    'rest_framework',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',
    'corsheaders',
    'django_filters',
    'drf_spectacular',
    
    # Applications E-CMS
    'core',
    'communes',
    'actualites',
    'evenements',
    'services',
    'transparence',
    'api',
]

# Ajouter Django CMS si disponible
if DJANGO_CMS_AVAILABLE:
    INSTALLED_APPS = [
        'djangocms_admin_style',
    ] + INSTALLED_APPS + [
        'cms',
        'menus',
        'treebeard',
        'sekizai',
        'filer',
        'easy_thumbnails',
        'djangocms_text_ckeditor',
        'djangocms_link',
        'djangocms_picture',
        'djangocms_file',
        'djangocms_video',
        'djangocms_googlemap',
        'djangocms_style',
    ]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'django.middleware.locale.LocaleMiddleware',
]

# Ajouter middleware Django CMS si disponible
if DJANGO_CMS_AVAILABLE:
    MIDDLEWARE += [
        'cms.middleware.user.CurrentUserMiddleware',
        'cms.middleware.page.CurrentPageMiddleware',
        'cms.middleware.toolbar.ToolbarMiddleware',
        'cms.middleware.language.LanguageCookieMiddleware',
    ]

ROOT_URLCONF = 'ecms_config.urls'

# Context processors de base
CONTEXT_PROCESSORS = [
    'django.template.context_processors.debug',
    'django.template.context_processors.request',
    'django.contrib.auth.context_processors.auth',
    'django.contrib.messages.context_processors.messages',
    'django.template.context_processors.i18n',
    'django.template.context_processors.media',
    'django.template.context_processors.static',
]

# Ajouter context processors Django CMS si disponible
if DJANGO_CMS_AVAILABLE:
    CONTEXT_PROCESSORS += [
        'sekizai.context_processors.sekizai',
        'cms.context_processors.cms_settings',
    ]

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': CONTEXT_PROCESSORS,
        },
    },
]

WSGI_APPLICATION = 'ecms_config.wsgi.application'

# ===== DATABASE =====
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# ===== AUTH =====
AUTH_USER_MODEL = 'core.Utilisateur'

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# ===== INTERNATIONALIZATION =====
LANGUAGE_CODE = 'fr'
TIME_ZONE = 'Africa/Douala'
USE_I18N = True
USE_L10N = True
USE_TZ = True

LANGUAGES = [
    ('fr', 'Français'),
    ('en', 'English'),
]

# ===== STATIC & MEDIA =====
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_DIRS = [BASE_DIR / 'static'] if (BASE_DIR / 'static').exists() else []

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ===== DJANGO CMS CONFIGURATION (si disponible) =====
if DJANGO_CMS_AVAILABLE:
    CMS_TEMPLATES = [
        ('home.html', 'Page d accueil'),
        ('page.html', 'Page standard'),
        ('fullwidth.html', 'Page pleine largeur'),
        ('sidebar.html', 'Page avec barre laterale'),
    ]
    
    CMS_LANGUAGES = {
        1: [
            {
                'code': 'fr',
                'name': 'Français',
                'fallbacks': ['en'],
                'public': True,
                'hide_untranslated': False,
                'redirect_on_fallback': True,
            },
            {
                'code': 'en',
                'name': 'English',
                'fallbacks': ['fr'],
                'public': True,
                'hide_untranslated': False,
                'redirect_on_fallback': True,
            },
        ],
        'default': {
            'fallbacks': ['fr', 'en'],
            'redirect_on_fallback': True,
            'public': True,
            'hide_untranslated': False,
        }
    }
    
    CMS_PERMISSION = True
    CMS_PLACEHOLDER_CONF = {}
    
    # EASY THUMBNAILS
    THUMBNAIL_HIGH_RESOLUTION = True
    THUMBNAIL_PROCESSORS = (
        'easy_thumbnails.processors.colorspace',
        'easy_thumbnails.processors.autocrop',
        'filer.thumbnail_processors.scale_and_crop_with_subject_location',
        'easy_thumbnails.processors.filters',
    )
    
    # DJANGO FILER
    FILER_CANONICAL_URL = 'sharing/'

# ===== DJANGO REST FRAMEWORK =====
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticatedOrReadOnly',
    ),
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
}

# ===== JWT CONFIGURATION =====
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'AUTH_HEADER_TYPES': ('Bearer',),
}

# ===== CORS =====
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
CORS_ALLOW_CREDENTIALS = True

# ===== EMAIL =====
EMAIL_BACKEND = os.environ.get(
    'EMAIL_BACKEND',
    'django.core.mail.backends.console.EmailBackend'
)
EMAIL_HOST = os.environ.get('EMAIL_HOST', 'smtp.gmail.com')
EMAIL_PORT = int(os.environ.get('EMAIL_PORT', 587))
EMAIL_USE_TLS = os.environ.get('EMAIL_USE_TLS', 'True').lower() in ('true', '1', 'yes')
EMAIL_HOST_USER = os.environ.get('EMAIL_HOST_USER', '')
EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_HOST_PASSWORD', '')
DEFAULT_FROM_EMAIL = os.environ.get('DEFAULT_FROM_EMAIL', 'E-CMS <noreply@ecms.cm>')

FRONTEND_URL = os.environ.get('FRONTEND_URL', 'http://localhost:3000')

# ===== API DOCUMENTATION =====
SPECTACULAR_SETTINGS = {
    'TITLE': 'E-CMS API',
    'DESCRIPTION': 'API REST pour CMS Multisite Communes Camerounaises',
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
}

# ===== X_FRAME_OPTIONS for CMS =====
X_FRAME_OPTIONS = 'SAMEORIGIN'
