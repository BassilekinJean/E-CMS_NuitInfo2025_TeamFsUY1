from django.urls import path
from . import views

app_name = 'mairies'

urlpatterns = [
    # ==== Routes Publiques ====
    # Liste des mairies actives
    path('publiques/', views.MairiesPubliquesListView.as_view(), name='mairies-publiques'),
    # Détail public d'une mairie
    path('publiques/<slug:slug>/', views.MairiePublicDetailView.as_view(), name='mairie-public-detail'),
    # Services d'une mairie (public)
    path('publiques/<slug:mairie_slug>/services/', views.ServicesListView.as_view(), name='services-list'),
    
    # ==== Routes Admin National ====
    # Liste et création de mairies
    path('admin/', views.MairiesAdminListView.as_view(), name='mairies-admin-list'),
    # Détail, modification, suppression d'une mairie
    path('admin/<slug:slug>/', views.MairieAdminDetailView.as_view(), name='mairie-admin-detail'),
    
    # ==== Demandes de création ====
    # Soumettre une demande (public)
    path('demandes/soumettre/', views.DemandeCreationSiteCreateView.as_view(), name='demande-creation'),
    # Liste des demandes (admin)
    path('demandes/', views.DemandesCreationListView.as_view(), name='demandes-list'),
    # Détail d'une demande (admin)
    path('demandes/<int:pk>/', views.DemandeCreationDetailView.as_view(), name='demande-detail'),
    # Valider une demande (admin)
    path('demandes/<int:pk>/valider/', views.ValiderDemandeView.as_view(), name='demande-valider'),
    # Rejeter une demande (admin)
    path('demandes/<int:pk>/rejeter/', views.RejeterDemandeView.as_view(), name='demande-rejeter'),
    
    # ==== Ma Mairie (Agent) ====
    path('ma-mairie/', views.MaMairieView.as_view(), name='ma-mairie'),
    # Services de ma mairie
    path('ma-mairie/services/', views.ServicesListView.as_view(), {'mairie_slug': None}, name='mes-services'),
    
    # ==== Services (gestion) ====
    path('<slug:mairie_slug>/services/', views.ServicesListView.as_view(), name='mairie-services'),
    path('<slug:mairie_slug>/services/<int:pk>/', views.ServiceDetailView.as_view(), name='service-detail'),
]
