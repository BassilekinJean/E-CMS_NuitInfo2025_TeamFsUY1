"""
Events URLs v1 - /api/v1/events/
Compatible avec le frontend React
"""
from django.urls import path
from . import views

urlpatterns = [
    # Liste et création d'événements
    path('', views.EvenementsGestionListView.as_view(), name='v1_events_list'),
    path('<int:pk>/', views.EvenementGestionDetailView.as_view(), name='v1_event_detail'),
    
    # Calendrier
    path('calendar/', views.CalendrierEvenementsView.as_view(), name='v1_events_calendar'),
    
    # Événements à venir
    path('upcoming/', views.EvenementsAVenirView.as_view(), name='v1_events_upcoming'),
    
    # Inscriptions
    path('<int:evenement_id>/attendees/', views.InscriptionsEvenementView.as_view(), name='v1_event_attendees'),
    path('<int:pk>/register/', views.SInscrireEvenementView.as_view(), name='v1_event_register'),
]
