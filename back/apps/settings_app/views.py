"""
Settings views - Paramètres utilisateur et sécurité
"""
from rest_framework import views, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
import pyotp
import base64
import io

from .models import UserSettings
from .serializers import UserSettingsSerializer, ChangePasswordSerializer


class SettingsView(views.APIView):
    """
    GET/PUT /api/v1/settings/
    Paramètres utilisateur
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        settings_obj, created = UserSettings.objects.get_or_create(user=user)
        
        # Construire la réponse complète
        data = {
            'municipality': None,
            'notifications': {
                'email_new_message': settings_obj.email_new_message,
                'email_new_comment': settings_obj.email_new_comment,
                'email_event_reminder': settings_obj.email_event_reminder,
                'push_enabled': settings_obj.push_enabled,
                'digest_frequency': settings_obj.digest_frequency
            },
            'security': {
                'two_factor_enabled': settings_obj.two_factor_enabled,
                'session_timeout': settings_obj.session_timeout
            },
            'display': {
                'language': settings_obj.language,
                'timezone': settings_obj.timezone,
                'date_format': settings_obj.date_format,
                'time_format': settings_obj.time_format
            }
        }
        
        # Ajouter les infos de la mairie si disponibles
        if user.mairie:
            data['municipality'] = {
                'id': user.mairie.id,
                'name': user.mairie.nom,
                'code': user.mairie.code_postal,
                'address': user.mairie.localisation,
                'phone': user.mairie.telephone,
                'email': user.mairie.email_contact,
                'logo_url': user.mairie.logo.url if user.mairie.logo else None
            }
        
        return Response(data)
    
    def put(self, request):
        user = request.user
        settings_obj, created = UserSettings.objects.get_or_create(user=user)
        
        # Mettre à jour les paramètres
        notifications = request.data.get('notifications', {})
        security = request.data.get('security', {})
        display = request.data.get('display', {})
        
        # Notifications
        if 'email_new_message' in notifications:
            settings_obj.email_new_message = notifications['email_new_message']
        if 'email_new_comment' in notifications:
            settings_obj.email_new_comment = notifications['email_new_comment']
        if 'email_event_reminder' in notifications:
            settings_obj.email_event_reminder = notifications['email_event_reminder']
        if 'push_enabled' in notifications:
            settings_obj.push_enabled = notifications['push_enabled']
        if 'digest_frequency' in notifications:
            settings_obj.digest_frequency = notifications['digest_frequency']
        
        # Sécurité
        if 'session_timeout' in security:
            settings_obj.session_timeout = security['session_timeout']
        
        # Affichage
        if 'language' in display:
            settings_obj.language = display['language']
        if 'timezone' in display:
            settings_obj.timezone = display['timezone']
        if 'date_format' in display:
            settings_obj.date_format = display['date_format']
        if 'time_format' in display:
            settings_obj.time_format = display['time_format']
        
        settings_obj.save()
        
        return Response({
            'message': 'Paramètres mis à jour',
            'updated_at': settings_obj.updated_at
        })


class ChangePasswordView(views.APIView):
    """
    PUT /api/v1/settings/password/
    Changer le mot de passe
    """
    permission_classes = [IsAuthenticated]
    
    def put(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        
        if serializer.is_valid():
            user = request.user
            
            # Vérifier l'ancien mot de passe
            if not user.check_password(serializer.validated_data['current_password']):
                return Response(
                    {'error': 'Mot de passe actuel incorrect'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Changer le mot de passe
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            
            return Response({'message': 'Mot de passe modifié avec succès'})
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class Enable2FAView(views.APIView):
    """
    POST /api/v1/settings/2fa/enable/
    Activer l'authentification à deux facteurs
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        user = request.user
        settings_obj, _ = UserSettings.objects.get_or_create(user=user)
        
        # Générer un secret TOTP
        secret = pyotp.random_base32()
        settings_obj.two_factor_secret = secret
        settings_obj.save()
        
        # Générer le QR code
        totp = pyotp.TOTP(secret)
        provisioning_uri = totp.provisioning_uri(
            name=user.email,
            issuer_name='E-CMS'
        )
        
        # Générer des codes de récupération
        import secrets
        backup_codes = [secrets.token_hex(4).upper() for _ in range(8)]
        
        return Response({
            'secret': secret,
            'qr_code_url': provisioning_uri,
            'backup_codes': backup_codes
        })


class Confirm2FAView(views.APIView):
    """
    POST /api/v1/settings/2fa/confirm/
    Confirmer l'activation 2FA
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        code = request.data.get('code')
        user = request.user
        settings_obj = UserSettings.objects.filter(user=user).first()
        
        if not settings_obj or not settings_obj.two_factor_secret:
            return Response(
                {'error': '2FA non configuré'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Vérifier le code
        totp = pyotp.TOTP(settings_obj.two_factor_secret)
        if totp.verify(code):
            settings_obj.two_factor_enabled = True
            settings_obj.save()
            
            return Response({
                'two_factor_enabled': True,
                'message': 'Authentification à deux facteurs activée'
            })
        
        return Response(
            {'error': 'Code invalide'},
            status=status.HTTP_400_BAD_REQUEST
        )
