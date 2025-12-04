from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    InscriptionView, DeconnexionView,
    ProfilUtilisateurView, ProfilCitoyenView, ProfilAgentView,
    ChangerMotDePasseView,
    ListeUtilisateursView, DetailUtilisateurView,
    CreerAgentView, ActiverDesactiverUtilisateurView
)

urlpatterns = [
    # Authentification
    path('inscription/', InscriptionView.as_view(), name='inscription'),
    path('connexion/', TokenObtainPairView.as_view(), name='connexion'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('deconnexion/', DeconnexionView.as_view(), name='deconnexion'),
    
    # Profil utilisateur connecté
    path('profil/', ProfilUtilisateurView.as_view(), name='profil'),
    path('profil/citoyen/', ProfilCitoyenView.as_view(), name='profil_citoyen'),
    path('profil/agent/', ProfilAgentView.as_view(), name='profil_agent'),
    path('profil/mot-de-passe/', ChangerMotDePasseView.as_view(), name='changer_mot_de_passe'),
    
    # Gestion des utilisateurs (admin)
    path('utilisateurs/', ListeUtilisateursView.as_view(), name='liste_utilisateurs'),
    path('utilisateurs/<int:pk>/', DetailUtilisateurView.as_view(), name='detail_utilisateur'),
    path('utilisateurs/creer-agent/', CreerAgentView.as_view(), name='creer_agent'),
    path('utilisateurs/<int:pk>/toggle-actif/', ActiverDesactiverUtilisateurView.as_view(), name='toggle_actif'),
]
