"""
Messages models - Système de messagerie citoyen-mairie
"""
from django.db import models
from django.conf import settings


class Conversation(models.Model):
    """Conversation entre un citoyen et la mairie"""
    
    class Status(models.TextChoices):
        OPEN = 'open', 'Ouverte'
        IN_PROGRESS = 'in_progress', 'En cours'
        RESOLVED = 'resolved', 'Résolue'
        CLOSED = 'closed', 'Fermée'
    
    class Priority(models.TextChoices):
        LOW = 'low', 'Basse'
        NORMAL = 'normal', 'Normale'
        HIGH = 'high', 'Haute'
        URGENT = 'urgent', 'Urgente'
    
    mairie = models.ForeignKey(
        'mairies.Mairie',
        on_delete=models.CASCADE,
        related_name='conversations'
    )
    
    # Citoyen qui a initié la conversation
    citizen = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='citizen_conversations'
    )
    
    # Agent assigné (optionnel)
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_conversations'
    )
    
    subject = models.CharField('Sujet', max_length=255)
    
    status = models.CharField(
        'Statut',
        max_length=20,
        choices=Status.choices,
        default=Status.OPEN
    )
    
    priority = models.CharField(
        'Priorité',
        max_length=20,
        choices=Priority.choices,
        default=Priority.NORMAL
    )
    
    category = models.CharField('Catégorie', max_length=100, blank=True)
    
    # Stats
    unread_count = models.PositiveIntegerField('Non lus', default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Conversation'
        verbose_name_plural = 'Conversations'
        ordering = ['-updated_at']
    
    def __str__(self):
        return f"{self.subject} - {self.citizen}"
    
    @property
    def last_message(self):
        return self.messages.order_by('-created_at').first()


class Message(models.Model):
    """Message dans une conversation"""
    
    conversation = models.ForeignKey(
        Conversation,
        on_delete=models.CASCADE,
        related_name='messages'
    )
    
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='sent_messages'
    )
    
    content = models.TextField('Contenu')
    
    is_read = models.BooleanField('Lu', default=False)
    is_from_citizen = models.BooleanField('Du citoyen', default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['created_at']
    
    def __str__(self):
        return f"Message de {self.sender} - {self.created_at}"


class Attachment(models.Model):
    """Pièces jointes aux messages"""
    
    message = models.ForeignKey(
        Message,
        on_delete=models.CASCADE,
        related_name='attachments'
    )
    
    file = models.FileField('Fichier', upload_to='messages/attachments/')
    filename = models.CharField('Nom du fichier', max_length=255)
    file_type = models.CharField('Type', max_length=50)
    file_size = models.PositiveIntegerField('Taille', default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.filename
