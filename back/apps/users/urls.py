from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    InscriptionView, DeconnexionView,
    ProfilUtilisateurView, ProfilAgentView,
    ChangerMotDePasseView,
    ListeUtilisateursView, DetailUtilisateurView,
    CreerAgentView, ActiverDesactiverUtilisateurView,
    # Authentification avancée
    VerifierEmailView, RenvoiVerificationEmailView,
    DemandeResetPasswordView, ConfirmerResetPasswordView,
    VerifierTokenView
)

urlpatterns = [
    # Authentification
    path('inscription/', InscriptionView.as_view(), name='inscription'),
    path('connexion/', TokenObtainPairView.as_view(), name='connexion'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('deconnexion/', DeconnexionView.as_view(), name='deconnexion'),
    
    # Vérification email
    path('email/verifier/', VerifierEmailView.as_view(), name='verifier_email'),
    path('email/renvoyer-verification/', RenvoiVerificationEmailView.as_view(), name='renvoyer_verification'),
    
    # Réinitialisation mot de passe
    path('password/reset/', DemandeResetPasswordView.as_view(), name='demande_reset_password'),
    path('password/reset/confirmer/', ConfirmerResetPasswordView.as_view(), name='confirmer_reset_password'),
    path('token/verifier/<str:token>/', VerifierTokenView.as_view(), name='verifier_token'),
    
    # Profil utilisateur connecté
    path('profil/', ProfilUtilisateurView.as_view(), name='profil'),
    path('profil/agent/', ProfilAgentView.as_view(), name='profil_agent'),
    path('profil/mot-de-passe/', ChangerMotDePasseView.as_view(), name='changer_mot_de_passe'),
    
    # Gestion des utilisateurs (admin)
    path('utilisateurs/', ListeUtilisateursView.as_view(), name='liste_utilisateurs'),
    path('utilisateurs/<int:pk>/', DetailUtilisateurView.as_view(), name='detail_utilisateur'),
    path('utilisateurs/creer-agent/', CreerAgentView.as_view(), name='creer_agent'),
    path('utilisateurs/<int:pk>/toggle-actif/', ActiverDesactiverUtilisateurView.as_view(), name='toggle_actif'),
]
