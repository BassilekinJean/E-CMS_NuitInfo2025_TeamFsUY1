"""
Website models - Configuration du site web de la mairie
"""
from django.db import models


class WebsiteConfig(models.Model):
    """Configuration générale du site web de la mairie"""
    
    mairie = models.OneToOneField(
        'mairies.Mairie',
        on_delete=models.CASCADE,
        related_name='website_config'
    )
    
    # État du site
    is_published = models.BooleanField('Publié', default=False)
    published_at = models.DateTimeField('Publié le', null=True, blank=True)
    
    # Thème
    theme = models.JSONField('Thème', default=dict, blank=True)
    # Structure: {"primary_color": "#...", "secondary_color": "#...", "font_family": "..."}
    
    # SEO
    meta_title = models.CharField('Meta titre', max_length=70, blank=True)
    meta_description = models.CharField('Meta description', max_length=160, blank=True)
    favicon = models.ImageField('Favicon', upload_to='website/favicons/', blank=True, null=True)
    
    # Réseaux sociaux
    social_links = models.JSONField('Réseaux sociaux', default=dict, blank=True)
    # Structure: {"facebook": "url", "twitter": "url", ...}
    
    # Analytics
    google_analytics_id = models.CharField('Google Analytics ID', max_length=50, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Configuration du site'
        verbose_name_plural = 'Configurations des sites'
    
    def __str__(self):
        return f"Config site - {self.mairie.nom}"


class Section(models.Model):
    """Sections du site web (hero, services, events, etc.)"""
    
    class TypeSection(models.TextChoices):
        HERO = 'hero', 'Hero/Bannière'
        SERVICES = 'services', 'Services'
        EVENTS = 'events', 'Événements'
        NEWS = 'news', 'Actualités'
        CONTACT = 'contact', 'Contact'
        GALLERY = 'gallery', 'Galerie'
        TEAM = 'team', 'Équipe'
        CUSTOM = 'custom', 'Personnalisée'
    
    website = models.ForeignKey(
        WebsiteConfig,
        on_delete=models.CASCADE,
        related_name='sections'
    )
    
    section_id = models.CharField('ID section', max_length=50)
    type = models.CharField(
        'Type',
        max_length=20,
        choices=TypeSection.choices
    )
    
    order = models.PositiveIntegerField('Ordre', default=0)
    is_visible = models.BooleanField('Visible', default=True)
    
    # Contenu JSON flexible selon le type
    content = models.JSONField('Contenu', default=dict)
    
    class Meta:
        ordering = ['order']
        unique_together = ['website', 'section_id']
    
    def __str__(self):
        return f"{self.section_id} - {self.get_type_display()}"


class Page(models.Model):
    """Pages personnalisées du site"""
    
    website = models.ForeignKey(
        WebsiteConfig,
        on_delete=models.CASCADE,
        related_name='pages'
    )
    
    title = models.CharField('Titre', max_length=255)
    slug = models.SlugField('Slug', max_length=255)
    content = models.TextField('Contenu HTML')
    
    is_published = models.BooleanField('Publié', default=False)
    in_menu = models.BooleanField('Dans le menu', default=False)
    menu_order = models.PositiveIntegerField('Ordre menu', default=0)
    
    # SEO
    meta_title = models.CharField('Meta titre', max_length=70, blank=True)
    meta_description = models.CharField('Meta description', max_length=160, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['menu_order']
        unique_together = ['website', 'slug']
    
    def __str__(self):
        return self.title
    
    def save(self, *args, **kwargs):
        if not self.slug:
            from django.utils.text import slugify
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)
