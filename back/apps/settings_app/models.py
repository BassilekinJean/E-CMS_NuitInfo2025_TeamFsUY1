"""
Settings models - Paramètres utilisateur
"""
from django.db import models
from django.conf import settings


class UserSettings(models.Model):
    """Paramètres personnalisés de l'utilisateur"""
    
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='settings'
    )
    
    # Notifications
    email_new_message = models.BooleanField('Email nouveau message', default=True)
    email_new_comment = models.BooleanField('Email nouveau commentaire', default=True)
    email_event_reminder = models.BooleanField('Email rappel événement', default=True)
    push_enabled = models.BooleanField('Push notifications', default=False)
    digest_frequency = models.CharField(
        'Fréquence digest',
        max_length=20,
        default='daily',
        choices=[
            ('realtime', 'Temps réel'),
            ('daily', 'Quotidien'),
            ('weekly', 'Hebdomadaire'),
            ('never', 'Jamais')
        ]
    )
    
    # Sécurité
    two_factor_enabled = models.BooleanField('2FA activé', default=False)
    two_factor_secret = models.CharField('Secret 2FA', max_length=32, blank=True)
    session_timeout = models.PositiveIntegerField('Timeout session (sec)', default=3600)
    
    # Affichage
    language = models.CharField('Langue', max_length=5, default='fr')
    timezone = models.CharField('Fuseau horaire', max_length=50, default='Africa/Douala')
    date_format = models.CharField('Format date', max_length=20, default='DD/MM/YYYY')
    time_format = models.CharField('Format heure', max_length=5, default='24h')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Paramètres utilisateur'
        verbose_name_plural = 'Paramètres utilisateurs'
    
    def __str__(self):
        return f"Paramètres de {self.user}"
