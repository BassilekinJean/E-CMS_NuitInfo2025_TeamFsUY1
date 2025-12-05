from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView as SimpleJWTTokenRefreshView
from rest_framework_simplejwt.exceptions import TokenError
from django.contrib.auth import get_user_model, authenticate
from django.core.mail import send_mail
from django.utils.html import strip_tags
from django.conf import settings
from drf_spectacular.utils import extend_schema
from drf_spectacular.types import OpenApiTypes

from .models import ProfilAgentCommunal, TokenVerification
from .serializers import (
    InscriptionSerializer, UtilisateurSerializer, UtilisateurListSerializer,
    ChangerMotDePasseSerializer, CreerAgentSerializer,
    DemandeOTPSerializer, VerifyOTPSerializer, ResetPasswordSerializer,
)

Utilisateur = get_user_model()


# ===== Permissions =====
class IsAdminNational(permissions.BasePermission):
    """Permission pour les administrateurs nationaux uniquement"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_admin_national()


class IsAgentCommunal(permissions.BasePermission):
    """Permission pour les agents communaux"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_agent_communal()


class IsAgentOrAdmin(permissions.BasePermission):
    """Permission pour les agents communaux ou administrateurs"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            request.user.is_admin_national() or request.user.is_agent_communal()
        )


# ===== AUTHENTIFICATION =====

class RegisterView(generics.CreateAPIView):
    """
    Inscription: Crée un nouvel utilisateur
    """
    queryset = Utilisateur.objects.all()
    serializer_class = InscriptionSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        utilisateur = serializer.save()
        
        return Response({
            'id': utilisateur.id,
            'email': utilisateur.email,
            'first_name': utilisateur.first_name if hasattr(utilisateur, 'first_name') else '',
            'last_name': utilisateur.last_name if hasattr(utilisateur, 'last_name') else '',
            'role': utilisateur.role,
            'is_verified': False,
            'created_at': utilisateur.date_inscription
        }, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    """
    Connexion: Authentifie l'utilisateur et retourne les tokens JWT
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        
        if not email or not password:
            return Response({'error': 'Email et mot de passe requis'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            utilisateur = Utilisateur.objects.get(email=email)
            if utilisateur.check_password(password) and utilisateur.is_active:
                refresh = RefreshToken.for_user(utilisateur)
                return Response({
                    'access_token': str(refresh.access_token),
                    'refresh_token': str(refresh),
                    'token_type': 'Bearer',
                    'expires_in': 3600,
                    'user': {
                        'id': utilisateur.id,
                        'email': utilisateur.email,
                        'first_name': utilisateur.first_name if hasattr(utilisateur, 'first_name') else '',
                        'last_name': utilisateur.last_name if hasattr(utilisateur, 'last_name') else '',
                        'role': utilisateur.role,
                        'avatar_url': utilisateur.avatar_url if hasattr(utilisateur, 'avatar_url') else '',
                        'municipality': {
                            'id': utilisateur.mairie.id if hasattr(utilisateur, 'mairie') and utilisateur.mairie else None,
                            'name': utilisateur.mairie.nom if hasattr(utilisateur, 'mairie') and utilisateur.mairie else '',
                            'code': utilisateur.mairie.code if hasattr(utilisateur, 'mairie') and utilisateur.mairie else ''
                        }
                    }
                })
            else:
                return Response({'error': 'Email ou mot de passe invalide'}, status=status.HTTP_401_UNAUTHORIZED)
        except Utilisateur.DoesNotExist:
            return Response({'error': 'Email ou mot de passe invalide'}, status=status.HTTP_401_UNAUTHORIZED)


class TokenRefreshView(SimpleJWTTokenRefreshView):
    """
    Rafraîchir le token: Prend un refresh token et retourne nouveaux access + refresh tokens
    """
    def post(self, request, *args, **kwargs):
        refresh_token_str = request.data.get('refresh_token')
        if not refresh_token_str:
            return Response({'error': 'refresh_token requis'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            refresh = RefreshToken(refresh_token_str)
            new_refresh = RefreshToken(str(refresh))
            return Response({
                'access_token': str(new_refresh.access_token),
                'refresh_token': str(new_refresh),
                'expires_in': 3600
            })
        except TokenError:
            return Response({'error': 'Token invalide'}, status=status.HTTP_401_UNAUTHORIZED)


class LogoutView(APIView):
    """
    Déconnexion: Blackliste le refresh token
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh_token')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            return Response({'message': 'Déconnexion réussie'}, status=status.HTTP_200_OK)
        except Exception:
            return Response({'message': 'Déconnexion réussie'}, status=status.HTTP_200_OK)


# ===== EMAIL VERIFICATION =====

class EmailVerifySendView(APIView):
    """
    Vérification Email - Envoi OTP: Envoie un code OTP par email
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = DemandeOTPSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email'].lower()
        
        try:
            utilisateur = Utilisateur.objects.get(email=email)
            token = TokenVerification.generer_token(utilisateur, TokenVerification.TypeToken.EMAIL_VERIFICATION_OTP)
            
            sujet = "E-CMS - Code de vérification email"
            message_html = f"""
            <html>
            <body style="font-family: Arial, sans-serif;">
                <h2>Vérification de votre email</h2>
                <p>Votre code de vérification: <strong>{token.code_otp}</strong></p>
                <p>Ce code expire dans 10 minutes.</p>
            </body>
            </html>
            """
            send_mail(
                sujet,
                strip_tags(message_html),
                settings.DEFAULT_FROM_EMAIL,
                [utilisateur.email],
                html_message=message_html,
                fail_silently=False
            )
        except Utilisateur.DoesNotExist:
            pass
        
        return Response({
            'message': 'Code OTP envoyé par email',
            'expires_in': 600
        })


class EmailVerifyConfirmView(APIView):
    """
    Vérification Email - Valider OTP: Confirme la vérification d'email
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = VerifyOTPSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email'].lower()
        code_otp = serializer.validated_data['otp_code']
        
        try:
            utilisateur = Utilisateur.objects.get(email=email)
            token = TokenVerification.objects.filter(
                utilisateur=utilisateur,
                type_token=TokenVerification.TypeToken.EMAIL_VERIFICATION_OTP,
                est_utilise=False
            ).order_by('-date_creation').first()
            
            if not token:
                return Response({'error': 'Aucun code OTP en attente'}, status=status.HTTP_400_BAD_REQUEST)
            
            if not token.est_valide():
                return Response({'error': 'Le code OTP a expiré'}, status=status.HTTP_400_BAD_REQUEST)
            
            if token.verifier_otp(code_otp):
                # Mark user as verified
                if hasattr(utilisateur, 'is_verified'):
                    utilisateur.is_verified = True
                    utilisateur.save()
                token.marquer_utilise()
                return Response({
                    'message': 'Email vérifié avec succès',
                    'is_verified': True
                })
            else:
                return Response({'error': 'Code OTP invalide'}, status=status.HTTP_400_BAD_REQUEST)
        except Utilisateur.DoesNotExist:
            return Response({'error': 'Email invalide'}, status=status.HTTP_400_BAD_REQUEST)


# ===== PASSWORD RESET =====

class PasswordForgotView(APIView):
    """
    Mot de passe oublié: Envoie un code OTP pour réinitialiser le mot de passe
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = DemandeOTPSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email'].lower()
        
        try:
            utilisateur = Utilisateur.objects.get(email=email)
            token = TokenVerification.generer_token(utilisateur, TokenVerification.TypeToken.PASSWORD_RESET_OTP)
            
            sujet = "E-CMS - Réinitialisation de mot de passe"
            message_html = f"""
            <html>
            <body style="font-family: Arial, sans-serif;">
                <h2>Réinitialisation de mot de passe</h2>
                <p>Votre code de vérification: <strong>{token.code_otp}</strong></p>
                <p>Ce code expire dans 6 minutes.</p>
            </body>
            </html>
            """
            send_mail(
                sujet,
                strip_tags(message_html),
                settings.DEFAULT_FROM_EMAIL,
                [utilisateur.email],
                html_message=message_html,
                fail_silently=False
            )
        except Utilisateur.DoesNotExist:
            pass
        
        return Response({'message': 'Email de réinitialisation envoyé'})


class PasswordResetView(APIView):
    """
    Réinitialiser mot de passe: Confirme le reset et retourne les tokens JWT
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email')
        otp_code = request.data.get('otp_code')
        password = request.data.get('password')
        password_confirm = request.data.get('password_confirm')
        
        if not all([email, otp_code, password, password_confirm]):
            return Response({'error': 'Tous les champs sont requis'}, status=status.HTTP_400_BAD_REQUEST)
        
        if password != password_confirm:
            return Response({'error': 'Les mots de passe ne correspondent pas'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            utilisateur = Utilisateur.objects.get(email=email.lower())
            token = TokenVerification.objects.filter(
                utilisateur=utilisateur,
                type_token=TokenVerification.TypeToken.PASSWORD_RESET_OTP,
                est_utilise=False
            ).order_by('-date_creation').first()
            
            if not token:
                return Response({'error': 'Aucun code OTP en attente'}, status=status.HTTP_400_BAD_REQUEST)
            
            if not token.est_valide():
                return Response({'error': 'Le code OTP a expiré'}, status=status.HTTP_400_BAD_REQUEST)
            
            if not token.verifier_otp(otp_code):
                return Response({'error': 'Code OTP invalide'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Reset password
            utilisateur.set_password(password)
            utilisateur.save()
            token.marquer_utilise()
            
            # Generate JWT tokens
            refresh = RefreshToken.for_user(utilisateur)
            return Response({
                'message': 'Mot de passe réinitialisé avec succès',
                'tokens': {
                    'access': str(refresh.access_token),
                    'refresh': str(refresh)
                }
            })
        except Utilisateur.DoesNotExist:
            return Response({'error': 'Email invalide'}, status=status.HTTP_400_BAD_REQUEST)


# ===== PROFILE =====

class ProfileRetrieveUpdateView(generics.RetrieveUpdateAPIView):
    """
    Profil Utilisateur: Récupère ou met à jour le profil de l'utilisateur connecté
    """
    serializer_class = UtilisateurSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


# ===== ADMIN MANAGEMENT =====

class ListeUtilisateursView(generics.ListAPIView):
    """
    Liste des utilisateurs: Récupère la liste des utilisateurs
    """
    serializer_class = UtilisateurListSerializer
    permission_classes = [IsAgentOrAdmin]

    def get_queryset(self):
        user = self.request.user
        if user.is_admin_national():
            queryset = Utilisateur.objects.all()
        else:
            queryset = Utilisateur.objects.filter(mairie=user.mairie)
        
        role = self.request.query_params.get('role')
        mairie = self.request.query_params.get('mairie')
        if role:
            queryset = queryset.filter(role=role)
        if mairie and user.is_admin_national():
            queryset = queryset.filter(mairie_id=mairie)
        return queryset.order_by('-date_inscription')


class DetailUtilisateurView(generics.RetrieveUpdateDestroyAPIView):
    """
    Détail d'un utilisateur: Récupère, modifie ou supprime un utilisateur
    """
    serializer_class = UtilisateurSerializer
    permission_classes = [IsAgentOrAdmin]

    def get_queryset(self):
        user = self.request.user
        if user.is_admin_national():
            return Utilisateur.objects.all()
        else:
            return Utilisateur.objects.filter(mairie=user.mairie)


class CreerAgentView(generics.CreateAPIView):
    """
    Créer un agent: Crée un agent communal
    """
    serializer_class = CreerAgentSerializer
    permission_classes = [IsAgentOrAdmin]

    def perform_create(self, serializer):
        if self.request.user.is_agent_communal():
            serializer.save(mairie=self.request.user.mairie)
        else:
            serializer.save()


class ActiverDesactiverUtilisateurView(APIView):
    """
    Activer/Désactiver utilisateur: Toggle le statut actif d'un utilisateur
    """
    permission_classes = [IsAgentOrAdmin]

    def post(self, request, pk):
        try:
            if request.user.is_admin_national():
                utilisateur = Utilisateur.objects.get(pk=pk)
            else:
                utilisateur = Utilisateur.objects.get(pk=pk, mairie=request.user.mairie)
            utilisateur.is_active = not utilisateur.is_active
            utilisateur.save()
            statut = 'activé' if utilisateur.is_active else 'désactivé'
            return Response({'message': f'Utilisateur {statut} avec succès'})
        except Utilisateur.DoesNotExist:
            return Response({'error': 'Utilisateur non trouvé'}, status=status.HTTP_404_NOT_FOUND)
