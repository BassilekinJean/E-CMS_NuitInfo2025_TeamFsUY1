"""
URLs d'authentification alignées avec le frontend (/api/v1/auth/)
"""
from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    InscriptionView, DeconnexionView,
    ProfilUtilisateurView,
    DemandeOTPView, VerifierOTPView, ResetPasswordView,
    VerifierEmailView, RenvoiVerificationEmailView,
)

urlpatterns = [
    # Authentification de base
    path('register/', InscriptionView.as_view(), name='v1_register'),
    path('login/', TokenObtainPairView.as_view(), name='v1_login'),
    path('logout/', DeconnexionView.as_view(), name='v1_logout'),
    path('token/refresh/', TokenRefreshView.as_view(), name='v1_token_refresh'),
    
    # Profil utilisateur
    path('me/', ProfilUtilisateurView.as_view(), name='v1_me'),
    
    # Vérification email
    path('email/verify/send/', RenvoiVerificationEmailView.as_view(), name='v1_email_verify_send'),
    path('email/verify/', VerifierEmailView.as_view(), name='v1_email_verify'),
    
    # Mot de passe oublié (flux OTP)
    path('password/forgot/', DemandeOTPView.as_view(), name='v1_password_forgot'),
    path('password/verify-otp/', VerifierOTPView.as_view(), name='v1_password_verify_otp'),
    path('password/reset/', ResetPasswordView.as_view(), name='v1_password_reset'),
]
