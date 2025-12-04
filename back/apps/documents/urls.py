from django.urls import path
from . import views

app_name = 'documents'

urlpatterns = [
    # ===== Documents Officiels (Public) =====
    path('documents/<slug:mairie_slug>/', views.DocumentsPublicsListView.as_view(), name='documents-publics'),
    path('documents/detail/<int:pk>/', views.DocumentPublicDetailView.as_view(), name='document-public-detail'),
    
    # ===== Documents Officiels (Agent) =====
    path('documents/', views.DocumentsGestionListView.as_view(), name='documents-gestion'),
    path('documents/gestion/<int:pk>/', views.DocumentGestionDetailView.as_view(), name='document-gestion-detail'),
    
    # ===== Actualités (Public) =====
    path('actualites/<slug:mairie_slug>/', views.ActualitesPubliquesListView.as_view(), name='actualites-publiques'),
    path('actualites/<slug:mairie_slug>/vedette/', views.ActualitesEnVedetteView.as_view(), name='actualites-vedette'),
    path('actualites/detail/<slug:slug>/', views.ActualitePublicDetailView.as_view(), name='actualite-public-detail'),
    
    # ===== Actualités (Agent) =====
    path('actualites/', views.ActualitesGestionListView.as_view(), name='actualites-gestion'),
    path('actualites/gestion/<int:pk>/', views.ActualiteGestionDetailView.as_view(), name='actualite-gestion-detail'),
    
    # ===== Pages CMS (Public) =====
    path('pages/<slug:mairie_slug>/', views.PagesPubliquesListView.as_view(), name='pages-publiques'),
    path('pages/<slug:mairie_slug>/<slug:slug>/', views.PagePublicDetailView.as_view(), name='page-public-detail'),
    path('menu/<slug:mairie_slug>/', views.MenuNavigationView.as_view(), name='menu-navigation'),
    
    # ===== Pages CMS (Agent) =====
    path('pages/', views.PagesGestionListView.as_view(), name='pages-gestion'),
    path('pages/gestion/<int:pk>/', views.PageGestionDetailView.as_view(), name='page-gestion-detail'),
    
    # ===== FAQ (Public) =====
    path('faq/<slug:mairie_slug>/', views.FAQPubliquesListView.as_view(), name='faq-publiques'),
    
    # ===== FAQ (Agent) =====
    path('faq/', views.FAQGestionListView.as_view(), name='faq-gestion'),
    path('faq/gestion/<int:pk>/', views.FAQGestionDetailView.as_view(), name='faq-gestion-detail'),
]
