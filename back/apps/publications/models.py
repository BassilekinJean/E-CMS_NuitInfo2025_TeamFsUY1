"""
Publications models - Publications/Articles du CMS municipal
"""
from django.db import models
from django.conf import settings
from django.utils.text import slugify


class Category(models.Model):
    """Catégories de publications"""
    name = models.CharField('Nom', max_length=100)
    slug = models.SlugField('Slug', unique=True)
    color = models.CharField('Couleur', max_length=7, default='#0066CC')
    icon = models.CharField('Icône', max_length=50, blank=True)
    description = models.TextField('Description', blank=True)
    
    mairie = models.ForeignKey(
        'mairies.Mairie',
        on_delete=models.CASCADE,
        related_name='publication_categories'
    )
    
    class Meta:
        verbose_name = 'Catégorie'
        verbose_name_plural = 'Catégories'
        unique_together = ['mairie', 'slug']
    
    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class Publication(models.Model):
    """Publications/Articles du CMS"""
    
    class TypePublication(models.TextChoices):
        POST = 'post', 'Article'
        ANNOUNCEMENT = 'announcement', 'Annonce'
        ALERT = 'alert', 'Alerte'
        NEWSLETTER = 'newsletter', 'Newsletter'
    
    class Status(models.TextChoices):
        DRAFT = 'draft', 'Brouillon'
        PUBLISHED = 'published', 'Publié'
        ARCHIVED = 'archived', 'Archivé'
        SCHEDULED = 'scheduled', 'Programmé'
    
    mairie = models.ForeignKey(
        'mairies.Mairie',
        on_delete=models.CASCADE,
        related_name='publications'
    )
    
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='publications'
    )
    
    # Contenu
    title = models.CharField('Titre', max_length=255)
    slug = models.SlugField('Slug', max_length=255)
    excerpt = models.TextField('Extrait', blank=True, max_length=500)
    content = models.TextField('Contenu')
    
    # Type et statut
    type = models.CharField(
        'Type',
        max_length=20,
        choices=TypePublication.choices,
        default=TypePublication.POST
    )
    
    status = models.CharField(
        'Statut',
        max_length=20,
        choices=Status.choices,
        default=Status.DRAFT
    )
    
    # Catégories (many-to-many)
    categories = models.ManyToManyField(
        Category,
        related_name='publications',
        blank=True
    )
    
    # Média
    cover_image = models.ImageField(
        'Image de couverture',
        upload_to='publications/covers/',
        blank=True,
        null=True
    )
    
    images = models.JSONField('Images', default=list, blank=True)
    
    # Options
    is_featured = models.BooleanField('Mis en avant', default=False)
    allow_comments = models.BooleanField('Autoriser commentaires', default=True)
    
    # SEO
    meta_title = models.CharField('Meta titre', max_length=70, blank=True)
    meta_description = models.CharField('Meta description', max_length=160, blank=True)
    
    # Planification
    published_at = models.DateTimeField('Date de publication', null=True, blank=True)
    scheduled_at = models.DateTimeField('Programmé pour', null=True, blank=True)
    
    # Stats
    views_count = models.PositiveIntegerField('Vues', default=0)
    
    # Dates
    created_at = models.DateTimeField('Créé le', auto_now_add=True)
    updated_at = models.DateTimeField('Modifié le', auto_now=True)
    
    class Meta:
        verbose_name = 'Publication'
        verbose_name_plural = 'Publications'
        ordering = ['-created_at']
        unique_together = ['mairie', 'slug']
    
    def __str__(self):
        return self.title
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)
    
    @property
    def likes_count(self):
        return self.likes.count()
    
    @property
    def comments_count(self):
        return self.comments.count()


class Like(models.Model):
    """Likes sur les publications"""
    publication = models.ForeignKey(
        Publication,
        on_delete=models.CASCADE,
        related_name='likes'
    )
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='publication_likes'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['publication', 'user']
    
    def __str__(self):
        return f"{self.user} likes {self.publication}"


class Comment(models.Model):
    """Commentaires sur les publications"""
    
    class Status(models.TextChoices):
        PENDING = 'pending', 'En attente'
        APPROVED = 'approved', 'Approuvé'
        REJECTED = 'rejected', 'Rejeté'
    
    publication = models.ForeignKey(
        Publication,
        on_delete=models.CASCADE,
        related_name='comments'
    )
    
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='publication_comments'
    )
    
    parent = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='replies'
    )
    
    content = models.TextField('Contenu')
    
    status = models.CharField(
        'Statut',
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Commentaire de {self.author} sur {self.publication}"
