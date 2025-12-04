from django.urls import path
from . import views

app_name = 'projets'

urlpatterns = [
    # ===== Projets Publics (Transparence) =====
    path('publics/<slug:mairie_slug>/', views.ProjetsPublicsListView.as_view(), name='projets-publics'),
    path('publics/<slug:mairie_slug>/en-cours/', views.ProjetsEnCoursView.as_view(), name='projets-en-cours'),
    path('publics/<slug:mairie_slug>/<int:pk>/', views.ProjetPublicDetailView.as_view(), name='projet-public-detail'),
    path('publics/<slug:mairie_slug>/statistiques/', views.StatistiquesProjetsView.as_view(), name='projets-statistiques'),
    
    # ===== Gestion des Projets (Agent) =====
    path('', views.ProjetsGestionListView.as_view(), name='projets-gestion'),
    path('<int:pk>/', views.ProjetGestionDetailView.as_view(), name='projet-gestion-detail'),
    
    # ===== Actions sur les projets =====
    path('<int:pk>/avancement/', views.MettreAJourAvancementView.as_view(), name='projet-avancement'),
    path('<int:pk>/statut/', views.ChangerStatutProjetView.as_view(), name='projet-statut'),
    
    # ===== Mises à jour de projet =====
    path('<int:projet_id>/mises-a-jour/', views.MisesAJourProjetView.as_view(), name='projet-mises-a-jour'),
    path('mises-a-jour/<int:pk>/', views.MiseAJourDetailView.as_view(), name='mise-a-jour-detail'),
    
    # ===== Documents de projet =====
    path('<int:projet_id>/documents/', views.DocumentsProjetView.as_view(), name='projet-documents'),
    path('documents/<int:pk>/', views.DocumentProjetDetailView.as_view(), name='document-projet-detail'),
]
