"""
Notifications models - Système de notifications
"""
from django.db import models
from django.conf import settings


class Notification(models.Model):
    """Notifications utilisateur"""
    
    class TypeNotification(models.TextChoices):
        NEW_MESSAGE = 'new_message', 'Nouveau message'
        NEW_COMMENT = 'new_comment', 'Nouveau commentaire'
        EVENT_REMINDER = 'event_reminder', 'Rappel événement'
        PUBLICATION = 'publication', 'Nouvelle publication'
        SYSTEM = 'system', 'Système'
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications'
    )
    
    type = models.CharField(
        'Type',
        max_length=20,
        choices=TypeNotification.choices
    )
    
    title = models.CharField('Titre', max_length=255)
    message = models.TextField('Message')
    
    # Données supplémentaires (JSON)
    data = models.JSONField('Données', default=dict, blank=True)
    
    is_read = models.BooleanField('Lu', default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = 'Notification'
        verbose_name_plural = 'Notifications'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} - {self.user}"
