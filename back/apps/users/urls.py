from django.urls import path
from .views import (
    RegisterView, LoginView, TokenRefreshView, LogoutView,
    EmailVerifySendView, EmailVerifyConfirmView,
    PasswordForgotView, PasswordResetView,
    ProfileRetrieveUpdateView,
    # Admin management
    ListeUtilisateursView, DetailUtilisateurView,
    CreerAgentView, ActiverDesactiverUtilisateurView,
)

urlpatterns = [
    # ===== Authentification =====
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('logout/', LogoutView.as_view(), name='logout'),
    
    # ===== Email Verification (OTP) =====
    path('email/verify/send/', EmailVerifySendView.as_view(), name='email_verify_send'),
    path('email/verify/confirm/', EmailVerifyConfirmView.as_view(), name='email_verify_confirm'),
    
    # ===== Password Reset (OTP) =====
    path('password/forgot/', PasswordForgotView.as_view(), name='password_forgot'),
    path('password/reset/', PasswordResetView.as_view(), name='password_reset'),
    
    # ===== Profil Utilisateur =====
    path('profile/', ProfileRetrieveUpdateView.as_view(), name='profile'),
    
    # ===== Gestion des utilisateurs (Admin) =====
    path('utilisateurs/', ListeUtilisateursView.as_view(), name='liste_utilisateurs'),
    path('utilisateurs/<int:pk>/', DetailUtilisateurView.as_view(), name='detail_utilisateur'),
    path('utilisateurs/creer-agent/', CreerAgentView.as_view(), name='creer_agent'),
    path('utilisateurs/<int:pk>/toggle-actif/', ActiverDesactiverUtilisateurView.as_view(), name='toggle_actif'),
]
