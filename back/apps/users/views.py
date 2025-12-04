from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings
from .models import ProfilAgentCommunal, TokenVerification
from .serializers import (
    InscriptionSerializer, UtilisateurSerializer, UtilisateurListSerializer,
    ProfilAgentCommunalSerializer,
    ChangerMotDePasseSerializer, CreerAgentSerializer,
    DemandeResetPasswordSerializer, ConfirmerResetPasswordSerializer,
    VerifierEmailSerializer, RenvoiVerificationEmailSerializer
)

Utilisateur = get_user_model()


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


# ===== Authentification =====

class InscriptionView(generics.CreateAPIView):
    """Vue pour l'inscription des utilisateurs (Admin National ou Agent Communal)"""
    
    queryset = Utilisateur.objects.all()
    serializer_class = InscriptionSerializer
    permission_classes = [permissions.AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        utilisateur = serializer.save()
        
        # Générer et envoyer le token de vérification email
        self._envoyer_email_verification(utilisateur)
        
        refresh = RefreshToken.for_user(utilisateur)
        
        return Response({
            'message': 'Inscription réussie. Veuillez vérifier votre email.',
            'utilisateur': UtilisateurSerializer(utilisateur).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_201_CREATED)
    
    def _envoyer_email_verification(self, utilisateur):
        """Envoie l'email de vérification"""
        token = TokenVerification.generer_token(
            utilisateur, 
            TokenVerification.TypeToken.EMAIL_VERIFICATION
        )
        
        lien_verification = f"{settings.FRONTEND_URL}/verifier-email/{token.token}"
        
        sujet = "E-CMS - Vérifiez votre adresse email"
        message_html = f"""
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #0066CC;">Bienvenue sur E-CMS !</h2>
                <p>Bonjour <strong>{utilisateur.nom}</strong>,</p>
                <p>Merci de vous être inscrit sur E-CMS, le portail des mairies camerounaises.</p>
                <p>Pour activer votre compte, veuillez cliquer sur le bouton ci-dessous :</p>
                <p style="text-align: center; margin: 30px 0;">
                    <a href="{lien_verification}" 
                       style="background-color: #0066CC; color: white; padding: 12px 30px; 
                              text-decoration: none; border-radius: 5px; display: inline-block;">
                        Vérifier mon email
                    </a>
                </p>
                <p>Ou copiez ce lien dans votre navigateur :</p>
                <p style="word-break: break-all; color: #666;">{lien_verification}</p>
                <p><strong>Ce lien expire dans 24 heures.</strong></p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                <p style="color: #888; font-size: 12px;">
                    Si vous n'avez pas créé de compte sur E-CMS, ignorez cet email.
                </p>
            </div>
        </body>
        </html>
        """
        
        try:
            send_mail(
                sujet,
                strip_tags(message_html),
                settings.DEFAULT_FROM_EMAIL,
                [utilisateur.email],
                html_message=message_html,
                fail_silently=True
            )
        except Exception as e:
            print(f"Erreur envoi email: {e}")


class DeconnexionView(APIView):
    """Vue pour la déconnexion (blacklist du token refresh)"""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            return Response({'message': 'Déconnexion réussie'}, status=status.HTTP_200_OK)
        except Exception:
            return Response({'message': 'Déconnexion réussie'}, status=status.HTTP_200_OK)


# ===== Profil Utilisateur =====

class ProfilUtilisateurView(generics.RetrieveUpdateAPIView):
    """Vue pour récupérer/modifier le profil de l'utilisateur connecté"""
    
    serializer_class = UtilisateurSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user


class ProfilAgentView(generics.RetrieveUpdateAPIView):
    """Vue pour le profil agent de l'utilisateur connecté"""
    
    serializer_class = ProfilAgentCommunalSerializer
    permission_classes = [IsAgentCommunal]
    
    def get_object(self):
        return self.request.user.profil_agent


class ChangerMotDePasseView(APIView):
    """Vue pour changer le mot de passe"""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        serializer = ChangerMotDePasseSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        if not request.user.check_password(serializer.validated_data['ancien_mot_de_passe']):
            return Response(
                {'error': 'Mot de passe actuel incorrect'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        request.user.set_password(serializer.validated_data['nouveau_mot_de_passe'])
        request.user.save()
        
        return Response({'message': 'Mot de passe modifié avec succès'})


# ===== Gestion des Utilisateurs (Admin) =====

class ListeUtilisateursView(generics.ListAPIView):
    """Liste des utilisateurs (admin national ou agent de la mairie)"""
    
    serializer_class = UtilisateurListSerializer
    permission_classes = [IsAgentOrAdmin]
    
    def get_queryset(self):
        user = self.request.user
        
        if user.is_admin_national():
            queryset = Utilisateur.objects.all()
        else:
            # Agent communal: seulement les utilisateurs de sa mairie
            queryset = Utilisateur.objects.filter(mairie=user.mairie)
        
        # Filtres
        role = self.request.query_params.get('role')
        mairie = self.request.query_params.get('mairie')
        
        if role:
            queryset = queryset.filter(role=role)
        if mairie and user.is_admin_national():
            queryset = queryset.filter(mairie_id=mairie)
        
        return queryset.order_by('-date_inscription')


class DetailUtilisateurView(generics.RetrieveUpdateDestroyAPIView):
    """Détail d'un utilisateur (admin)"""
    
    serializer_class = UtilisateurSerializer
    permission_classes = [IsAgentOrAdmin]
    
    def get_queryset(self):
        user = self.request.user
        
        if user.is_admin_national():
            return Utilisateur.objects.all()
        else:
            return Utilisateur.objects.filter(mairie=user.mairie)


class CreerAgentView(generics.CreateAPIView):
    """Créer un agent communal (admin national ou agent existant)"""
    
    serializer_class = CreerAgentSerializer
    permission_classes = [IsAgentOrAdmin]
    
    def perform_create(self, serializer):
        # Si l'utilisateur est un agent, forcer la mairie
        if self.request.user.is_agent_communal():
            serializer.save(mairie=self.request.user.mairie)
        else:
            serializer.save()


class ActiverDesactiverUtilisateurView(APIView):
    """Activer ou désactiver un utilisateur"""
    
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
            return Response(
                {'error': 'Utilisateur non trouvé'},
                status=status.HTTP_404_NOT_FOUND
            )


# ===== Authentification Avancée =====

class VerifierEmailView(APIView):
    """Vue pour vérifier l'email avec le token"""
    
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = VerifierEmailSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        token_str = serializer.validated_data['token']
        
        try:
            token = TokenVerification.objects.get(
                token=token_str,
                type_token=TokenVerification.TypeToken.EMAIL_VERIFICATION
            )
            
            if not token.est_valide():
                return Response(
                    {'error': 'Ce lien a expiré. Demandez un nouveau lien de vérification.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Vérifier l'email
            utilisateur = token.utilisateur
            utilisateur.email_verifie = True
            utilisateur.save(update_fields=['email_verifie'])
            
            # Marquer le token comme utilisé
            token.marquer_utilise()
            
            return Response({
                'message': 'Email vérifié avec succès ! Vous pouvez maintenant utiliser toutes les fonctionnalités.'
            })
            
        except TokenVerification.DoesNotExist:
            return Response(
                {'error': 'Lien de vérification invalide.'},
                status=status.HTTP_400_BAD_REQUEST
            )


class RenvoiVerificationEmailView(APIView):
    """Vue pour renvoyer l'email de vérification"""
    
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = RenvoiVerificationEmailSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data['email'].lower()
        
        try:
            utilisateur = Utilisateur.objects.get(email=email)
            
            if utilisateur.email_verifie:
                return Response({'message': 'Votre email est déjà vérifié.'})
            
            # Générer et envoyer le token
            token = TokenVerification.generer_token(
                utilisateur,
                TokenVerification.TypeToken.EMAIL_VERIFICATION
            )
            
            lien_verification = f"{settings.FRONTEND_URL}/verifier-email/{token.token}"
            
            sujet = "E-CMS - Nouveau lien de vérification"
            message_html = f"""
            <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #0066CC;">Vérification de votre email</h2>
                    <p>Bonjour <strong>{utilisateur.nom}</strong>,</p>
                    <p>Vous avez demandé un nouveau lien de vérification pour votre compte E-CMS.</p>
                    <p style="text-align: center; margin: 30px 0;">
                        <a href="{lien_verification}" 
                           style="background-color: #0066CC; color: white; padding: 12px 30px; 
                                  text-decoration: none; border-radius: 5px; display: inline-block;">
                            Vérifier mon email
                        </a>
                    </p>
                    <p><strong>Ce lien expire dans 24 heures.</strong></p>
                </div>
            </body>
            </html>
            """
            
            send_mail(
                sujet,
                strip_tags(message_html),
                settings.DEFAULT_FROM_EMAIL,
                [utilisateur.email],
                html_message=message_html,
                fail_silently=True
            )
            
        except Utilisateur.DoesNotExist:
            pass  # Ne pas révéler si l'email existe
        
        return Response({
            'message': 'Si cet email est associé à un compte, vous recevrez un lien de vérification.'
        })


class DemandeResetPasswordView(APIView):
    """Vue pour demander la réinitialisation du mot de passe"""
    
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = DemandeResetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data['email'].lower()
        
        try:
            utilisateur = Utilisateur.objects.get(email=email)
            
            # Générer le token
            token = TokenVerification.generer_token(
                utilisateur,
                TokenVerification.TypeToken.PASSWORD_RESET
            )
            
            lien_reset = f"{settings.FRONTEND_URL}/reset-password/{token.token}"
            
            sujet = "E-CMS - Réinitialisation de votre mot de passe"
            message_html = f"""
            <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #0066CC;">Réinitialisation du mot de passe</h2>
                    <p>Bonjour <strong>{utilisateur.nom}</strong>,</p>
                    <p>Vous avez demandé la réinitialisation de votre mot de passe E-CMS.</p>
                    <p>Cliquez sur le bouton ci-dessous pour définir un nouveau mot de passe :</p>
                    <p style="text-align: center; margin: 30px 0;">
                        <a href="{lien_reset}" 
                           style="background-color: #DC3545; color: white; padding: 12px 30px; 
                                  text-decoration: none; border-radius: 5px; display: inline-block;">
                            Réinitialiser mon mot de passe
                        </a>
                    </p>
                    <p><strong>⚠️ Ce lien expire dans 1 heure.</strong></p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                    <p style="color: #888; font-size: 12px;">
                        Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.
                        Votre mot de passe restera inchangé.
                    </p>
                </div>
            </body>
            </html>
            """
            
            send_mail(
                sujet,
                strip_tags(message_html),
                settings.DEFAULT_FROM_EMAIL,
                [utilisateur.email],
                html_message=message_html,
                fail_silently=True
            )
            
        except Utilisateur.DoesNotExist:
            pass  # Ne pas révéler si l'email existe (sécurité)
        
        return Response({
            'message': 'Si cet email est associé à un compte, vous recevrez un lien de réinitialisation.'
        })


class ConfirmerResetPasswordView(APIView):
    """Vue pour confirmer la réinitialisation du mot de passe"""
    
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = ConfirmerResetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        token_str = serializer.validated_data['token']
        nouveau_mdp = serializer.validated_data['nouveau_mot_de_passe']
        
        try:
            token = TokenVerification.objects.get(
                token=token_str,
                type_token=TokenVerification.TypeToken.PASSWORD_RESET
            )
            
            if not token.est_valide():
                return Response(
                    {'error': 'Ce lien a expiré. Veuillez demander un nouveau lien.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Réinitialiser le mot de passe
            utilisateur = token.utilisateur
            utilisateur.set_password(nouveau_mdp)
            utilisateur.save()
            
            # Marquer le token comme utilisé
            token.marquer_utilise()
            
            return Response({
                'message': 'Mot de passe réinitialisé avec succès ! Vous pouvez maintenant vous connecter.'
            })
            
        except TokenVerification.DoesNotExist:
            return Response(
                {'error': 'Lien de réinitialisation invalide.'},
                status=status.HTTP_400_BAD_REQUEST
            )


class VerifierTokenView(APIView):
    """Vue pour vérifier si un token est valide (avant d'afficher le formulaire)"""
    
    permission_classes = [permissions.AllowAny]
    
    def get(self, request, token):
        try:
            token_obj = TokenVerification.objects.get(token=token)
            
            if token_obj.est_valide():
                return Response({
                    'valide': True,
                    'type': token_obj.type_token,
                    'email': token_obj.utilisateur.email
                })
            else:
                return Response({
                    'valide': False,
                    'error': 'Ce lien a expiré.'
                })
                
        except TokenVerification.DoesNotExist:
            return Response({
                'valide': False,
                'error': 'Lien invalide.'
            })