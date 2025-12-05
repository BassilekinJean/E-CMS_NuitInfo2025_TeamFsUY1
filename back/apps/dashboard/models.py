"""
Dashboard models - Modèles pour les statistiques et activités
"""
from django.db import models
from django.conf import settings


class Activity(models.Model):
    """
    Activités récentes pour le dashboard
    """
    class TypeActivity(models.TextChoices):
        PUBLICATION = 'publication', 'Publication créée'
        EVENT = 'event', 'Événement créé'
        MESSAGE = 'message', 'Message reçu'
        COMMENT = 'comment', 'Commentaire ajouté'
        LIKE = 'like', 'Like ajouté'
        USER = 'user', 'Utilisateur inscrit'
    
    mairie = models.ForeignKey(
        'mairies.Mairie',
        on_delete=models.CASCADE,
        related_name='activities'
    )
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='activities'
    )
    
    type = models.CharField(
        'Type',
        max_length=20,
        choices=TypeActivity.choices
    )
    
    title = models.CharField('Titre', max_length=255)
    description = models.TextField('Description', blank=True)
    
    # Référence à l'objet concerné
    content_type = models.CharField('Type de contenu', max_length=50, blank=True)
    object_id = models.PositiveIntegerField('ID objet', null=True, blank=True)
    
    created_at = models.DateTimeField('Date de création', auto_now_add=True)
    
    class Meta:
        verbose_name = 'Activité'
        verbose_name_plural = 'Activités'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} - {self.created_at}"
