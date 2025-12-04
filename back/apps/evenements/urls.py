from django.urls import path
from . import views

app_name = 'evenements'

urlpatterns = [
    # ===== Événements Publics =====
    path('publics/<slug:mairie_slug>/', views.EvenementsPublicsListView.as_view(), name='evenements-publics'),
    path('publics/<slug:mairie_slug>/a-venir/', views.EvenementsAVenirView.as_view(), name='evenements-a-venir'),
    path('publics/<slug:mairie_slug>/calendrier/', views.CalendrierEvenementsView.as_view(), name='calendrier'),
    path('publics/detail/<int:pk>/', views.EvenementPublicDetailView.as_view(), name='evenement-public-detail'),
    
    # ===== Gestion des Événements (Agent) =====
    path('', views.EvenementsGestionListView.as_view(), name='evenements-gestion'),
    path('<int:pk>/', views.EvenementGestionDetailView.as_view(), name='evenement-gestion-detail'),
    
    # ===== Inscriptions (Citoyen) =====
    path('inscription/', views.SInscrireEvenementView.as_view(), name='inscription-evenement'),
    path('mes-inscriptions/', views.MesInscriptionsView.as_view(), name='mes-inscriptions'),
    path('inscription/<int:pk>/annuler/', views.AnnulerInscriptionView.as_view(), name='annuler-inscription'),
    
    # ===== Inscriptions (Agent) =====
    path('<int:evenement_id>/inscriptions/', views.InscriptionsEvenementView.as_view(), name='inscriptions-evenement'),
    
    # ===== Newsletters (Agent) =====
    path('newsletters/', views.NewslettersGestionListView.as_view(), name='newsletters-gestion'),
    path('newsletters/<int:pk>/', views.NewsletterGestionDetailView.as_view(), name='newsletter-detail'),
    path('newsletters/<int:pk>/envoyer/', views.EnvoyerNewsletterView.as_view(), name='envoyer-newsletter'),
    path('newsletters/abonnes/', views.AbonnesNewsletterListView.as_view(), name='abonnes-liste'),
    
    # ===== Abonnement Newsletter (Public) =====
    path('newsletter/<slug:mairie_slug>/abonner/', views.AbonnerNewsletterView.as_view(), name='abonner-newsletter'),
    path('newsletter/<slug:mairie_slug>/desabonner/', views.DesabonnerNewsletterView.as_view(), name='desabonner-newsletter'),
]
