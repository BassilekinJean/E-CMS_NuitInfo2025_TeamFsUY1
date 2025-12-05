"""
API URLs - E-CMS
Configuration des routes API REST
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenBlacklistView,
)
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)

from .views import (
    # Auth views
    RegisterView, ProfileView, ChangePasswordView,
    PasswordResetRequestView, PasswordResetConfirmView,
    
    # Core viewsets
    ConfigurationPortailViewSet,
    
    # Communes viewsets
    RegionViewSet, DepartementViewSet, CommuneViewSet,
    ServiceMunicipalViewSet, EquipeMunicipaleViewSet,
    DemandeCreationSiteViewSet,
    
    # Actualites viewsets
    ActualiteViewSet, PageCMSViewSet, FAQViewSet, AbonneNewsletterViewSet,
    
    # Evenements viewsets
    EvenementViewSet, InscriptionEvenementViewSet, RendezVousViewSet,
    
    # Services viewsets
    FormulaireViewSet, DemarcheViewSet, SignalementViewSet, ContactViewSet,
    
    # Transparence viewsets
    ProjetViewSet, DeliberationViewSet,
    DocumentBudgetaireViewSet, DocumentOfficielViewSet,
    
    # Dashboard
    DashboardStatsView,
    
    # Nouvelles vues publiques
    CommuneMapView,
    SuiviDemarchePublicView,
    SuiviSignalementPublicView,
    NewsletterViewSet,
    NewsletterUnsubscribeView,
    StatsPubliquesView,
    CommuneStatsView,
    RechercheGlobaleView,
)

# Création du routeur API
router = DefaultRouter()

# Core
router.register(r'configuration', ConfigurationPortailViewSet, basename='configuration')

# Communes
router.register(r'regions', RegionViewSet, basename='regions')
router.register(r'departements', DepartementViewSet, basename='departements')
router.register(r'communes', CommuneViewSet, basename='communes')
router.register(r'services-municipaux', ServiceMunicipalViewSet, basename='services-municipaux')
router.register(r'equipe-municipale', EquipeMunicipaleViewSet, basename='equipe-municipale')
router.register(r'demandes-creation', DemandeCreationSiteViewSet, basename='demandes-creation')

# Actualités
router.register(r'actualites', ActualiteViewSet, basename='actualites')
router.register(r'pages', PageCMSViewSet, basename='pages')
router.register(r'faqs', FAQViewSet, basename='faqs')
router.register(r'newsletter/abonnes', AbonneNewsletterViewSet, basename='newsletter-abonnes')

# Événements
router.register(r'evenements', EvenementViewSet, basename='evenements')
router.register(r'inscriptions-evenements', InscriptionEvenementViewSet, basename='inscriptions-evenements')
router.register(r'rendez-vous', RendezVousViewSet, basename='rendez-vous')

# Services
router.register(r'formulaires', FormulaireViewSet, basename='formulaires')
router.register(r'demarches', DemarcheViewSet, basename='demarches')
router.register(r'signalements', SignalementViewSet, basename='signalements')
router.register(r'contacts', ContactViewSet, basename='contacts')

# Transparence
router.register(r'projets', ProjetViewSet, basename='projets')
router.register(r'deliberations', DeliberationViewSet, basename='deliberations')
router.register(r'documents-budgetaires', DocumentBudgetaireViewSet, basename='documents-budgetaires')
router.register(r'documents-officiels', DocumentOfficielViewSet, basename='documents-officiels')

# Newsletter
router.register(r'newsletters', NewsletterViewSet, basename='newsletters')

app_name = 'api'

urlpatterns = [
    # ===== AUTHENTIFICATION =====
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', TokenObtainPairView.as_view(), name='login'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/logout/', TokenBlacklistView.as_view(), name='logout'),
    path('auth/profile/', ProfileView.as_view(), name='profile'),
    path('auth/change-password/', ChangePasswordView.as_view(), name='change_password'),
    path('auth/password-reset/', PasswordResetRequestView.as_view(), name='password_reset'),
    path('auth/password-reset/confirm/', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    
    # ===== DASHBOARD =====
    path('dashboard/stats/', DashboardStatsView.as_view(), name='dashboard_stats'),
    
    # ===== CARTE INTERACTIVE =====
    path('carte/communes/', CommuneMapView.as_view(), name='carte_communes'),
    
    # ===== SUIVI PUBLIC (SANS AUTH) =====
    path('suivi/demarche/<str:numero>/', SuiviDemarchePublicView.as_view(), name='suivi_demarche_public'),
    path('suivi/signalement/<str:numero>/', SuiviSignalementPublicView.as_view(), name='suivi_signalement_public'),
    
    # ===== NEWSLETTER =====
    path('newsletter/unsubscribe/<str:token>/', NewsletterUnsubscribeView.as_view(), name='newsletter_unsubscribe'),
    
    # ===== STATISTIQUES PUBLIQUES =====
    path('stats/', StatsPubliquesView.as_view(), name='stats_publiques'),
    path('stats/commune/<slug:slug>/', CommuneStatsView.as_view(), name='stats_commune'),
    
    # ===== RECHERCHE GLOBALE =====
    path('recherche/', RechercheGlobaleView.as_view(), name='recherche_globale'),
    
    # ===== DOCUMENTATION API =====
    path('schema/', SpectacularAPIView.as_view(), name='schema'),
    path('docs/', SpectacularSwaggerView.as_view(url_name='api:schema'), name='swagger-ui'),
    path('redoc/', SpectacularRedocView.as_view(url_name='api:schema'), name='redoc'),
    
    # ===== ROUTES API =====
    path('', include(router.urls)),
]
