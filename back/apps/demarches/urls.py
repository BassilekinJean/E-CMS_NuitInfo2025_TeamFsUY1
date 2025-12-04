from django.urls import path
from . import views

app_name = 'demarches'

urlpatterns = [
    # ===== Formulaires (Public) =====
    path('formulaires/mairie/<int:mairie_id>/', views.FormulairesListView.as_view(), name='formulaires-mairie'),
    path('formulaires/<int:pk>/', views.FormulaireDetailPublicView.as_view(), name='formulaire-detail'),
    
    # ===== Formulaires (Agent) =====
    path('formulaires/', views.FormulairesGestionView.as_view(), name='formulaires-gestion'),
    path('formulaires/gestion/<int:pk>/', views.FormulaireGestionDetailView.as_view(), name='formulaire-gestion-detail'),
    
    # ===== Démarches (Citoyen) =====
    path('mes-demarches/', views.MesDemarchesView.as_view(), name='mes-demarches'),
    path('mes-demarches/<int:pk>/', views.DemarcheDetailCitoyenView.as_view(), name='ma-demarche-detail'),
    path('soumettre/', views.SoumettreDemarcheView.as_view(), name='soumettre-demarche'),
    
    # ===== Démarches (Agent) =====
    path('agent/', views.DemarchesAgentListView.as_view(), name='demarches-agent'),
    path('agent/<int:pk>/', views.DemarcheAgentDetailView.as_view(), name='demarche-agent-detail'),
    path('agent/<int:pk>/traiter/', views.TraiterDemarcheView.as_view(), name='traiter-demarche'),
    
    # ===== Signalements (Citoyen) =====
    path('signalements/mes/', views.MesSignalementsView.as_view(), name='mes-signalements'),
    path('signalements/mes/<int:pk>/', views.SignalementDetailCitoyenView.as_view(), name='mon-signalement'),
    path('signalements/creer/', views.CreerSignalementView.as_view(), name='creer-signalement'),
    
    # ===== Signalements (Agent) =====
    path('signalements/', views.SignalementsAgentListView.as_view(), name='signalements-agent'),
    path('signalements/<int:pk>/', views.SignalementAgentDetailView.as_view(), name='signalement-agent-detail'),
    path('signalements/<int:pk>/repondre/', views.RepondreSignalementView.as_view(), name='repondre-signalement'),
    
    # ===== Rendez-vous (Citoyen) =====
    path('rdv/mes/', views.MesRendezVousView.as_view(), name='mes-rdv'),
    path('rdv/mes/<int:pk>/', views.RendezVousDetailCitoyenView.as_view(), name='mon-rdv'),
    path('rdv/demander/', views.DemanderRendezVousView.as_view(), name='demander-rdv'),
    path('rdv/mes/<int:pk>/annuler/', views.AnnulerRendezVousView.as_view(), name='annuler-rdv'),
    
    # ===== Rendez-vous (Agent) =====
    path('rdv/', views.RendezVousAgentListView.as_view(), name='rdv-agent'),
    path('rdv/<int:pk>/', views.RendezVousAgentDetailView.as_view(), name='rdv-agent-detail'),
    path('rdv/<int:pk>/confirmer/', views.ConfirmerRendezVousView.as_view(), name='confirmer-rdv'),
]
