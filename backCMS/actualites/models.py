"""
Actualités - Articles, communiqués, pages CMS et FAQ
"""
from django.db import models
from django.conf import settings
from django.utils.text import slugify


class Actualite(models.Model):
    """Articles et communiqués de presse"""
    
    class Categorie(models.TextChoices):
        COMMUNIQUE = 'communique', 'Communiqué de presse'
        AVIS_PUBLIC = 'avis_public', 'Avis public'
        NOUVELLE = 'nouvelle', 'Nouvelle'
        ANNONCE = 'annonce', 'Annonce'
        VIE_MUNICIPALE = 'vie_municipale', 'Vie municipale'
        CULTURE = 'culture', 'Culture'
        EDUCATION = 'education', 'Éducation'
        SPORT = 'sport', 'Sport'
    
    commune = models.ForeignKey(
        'communes.Commune',
        on_delete=models.CASCADE,
        related_name='actualites'
    )
    auteur = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='actualites'
    )
    
    titre = models.CharField('Titre', max_length=255)
    slug = models.SlugField('Slug', max_length=255)
    resume = models.TextField('Résumé', max_length=500, blank=True)
    contenu = models.TextField('Contenu')
    
    image_principale = models.ImageField('Image principale', upload_to='actualites/', blank=True, null=True)
    
    categorie = models.CharField('Catégorie', max_length=50, choices=Categorie.choices, default=Categorie.NOUVELLE)
    tags = models.CharField('Tags', max_length=255, blank=True, help_text='Tags séparés par des virgules')
    
    # Publication
    est_publie = models.BooleanField('Publié', default=False)
    est_mis_en_avant = models.BooleanField('Mis en avant', default=False)
    date_publication = models.DateTimeField('Date de publication', null=True, blank=True)
    
    # Statistiques
    nombre_vues = models.PositiveIntegerField('Nombre de vues', default=0)
    
    # Dates
    date_creation = models.DateTimeField('Date création', auto_now_add=True)
    date_modification = models.DateTimeField('Dernière modification', auto_now=True)
    
    class Meta:
        verbose_name = 'Actualité'
        verbose_name_plural = 'Actualités'
        ordering = ['-date_publication']
        unique_together = ['commune', 'slug']
    
    def __str__(self):
        return self.titre
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.titre)
        super().save(*args, **kwargs)
    
    def incrementer_vues(self):
        self.nombre_vues += 1
        self.save(update_fields=['nombre_vues'])


class PageCMS(models.Model):
    """Pages de contenu personnalisables"""
    
    commune = models.ForeignKey(
        'communes.Commune',
        on_delete=models.CASCADE,
        related_name='pages'
    )
    
    titre = models.CharField('Titre', max_length=255)
    slug = models.SlugField('Slug URL', max_length=255)
    contenu = models.TextField('Contenu')
    
    # Hiérarchie
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='enfants')
    
    # Affichage
    ordre = models.PositiveIntegerField('Ordre', default=0)
    afficher_dans_menu = models.BooleanField('Afficher dans le menu', default=True)
    est_publie = models.BooleanField('Publié', default=True)
    
    # SEO
    meta_titre = models.CharField('Meta titre', max_length=70, blank=True)
    meta_description = models.CharField('Meta description', max_length=160, blank=True)
    
    # Image
    image_bandeau = models.ImageField('Image bandeau', upload_to='pages/', blank=True, null=True)
    
    # Dates
    date_creation = models.DateTimeField('Date création', auto_now_add=True)
    date_modification = models.DateTimeField('Dernière modification', auto_now=True)
    
    class Meta:
        verbose_name = 'Page CMS'
        verbose_name_plural = 'Pages CMS'
        ordering = ['ordre', 'titre']
        unique_together = ['commune', 'slug']
    
    def __str__(self):
        return f"{self.titre} - {self.commune.nom}"
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.titre)
        super().save(*args, **kwargs)


class FAQ(models.Model):
    """Foire aux questions"""
    
    commune = models.ForeignKey(
        'communes.Commune',
        on_delete=models.CASCADE,
        related_name='faqs'
    )
    
    question = models.CharField('Question', max_length=500)
    reponse = models.TextField('Réponse')
    categorie = models.CharField('Catégorie', max_length=100, blank=True)
    ordre = models.PositiveIntegerField('Ordre', default=0)
    est_active = models.BooleanField('Active', default=True)
    
    date_creation = models.DateTimeField('Date création', auto_now_add=True)
    
    class Meta:
        verbose_name = 'FAQ'
        verbose_name_plural = 'FAQs'
        ordering = ['categorie', 'ordre']
    
    def __str__(self):
        return self.question[:50]


class Newsletter(models.Model):
    """Newsletters"""
    
    class Statut(models.TextChoices):
        BROUILLON = 'brouillon', 'Brouillon'
        PLANIFIEE = 'planifiee', 'Planifiée'
        ENVOYEE = 'envoyee', 'Envoyée'
    
    commune = models.ForeignKey(
        'communes.Commune',
        on_delete=models.CASCADE,
        related_name='newsletters'
    )
    auteur = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    
    titre = models.CharField('Titre', max_length=255)
    contenu = models.TextField('Contenu')
    
    statut = models.CharField('Statut', max_length=20, choices=Statut.choices, default=Statut.BROUILLON)
    date_envoi = models.DateTimeField('Date envoi', null=True, blank=True)
    date_creation = models.DateTimeField('Date création', auto_now_add=True)
    
    nombre_destinataires = models.PositiveIntegerField('Destinataires', default=0)
    nombre_ouvertures = models.PositiveIntegerField('Ouvertures', default=0)
    
    class Meta:
        verbose_name = 'Newsletter'
        verbose_name_plural = 'Newsletters'
        ordering = ['-date_creation']
    
    def __str__(self):
        return f"{self.titre} - {self.commune.nom}"


class AbonneNewsletter(models.Model):
    """Abonnés newsletter"""
    
    commune = models.ForeignKey(
        'communes.Commune',
        on_delete=models.CASCADE,
        related_name='abonnes_newsletter'
    )
    
    email = models.EmailField('Email')
    nom = models.CharField('Nom', max_length=255, blank=True)
    est_actif = models.BooleanField('Actif', default=True)
    
    date_inscription = models.DateTimeField('Date inscription', auto_now_add=True)
    token_desinscription = models.CharField('Token désinscription', max_length=64, blank=True)
    
    class Meta:
        verbose_name = 'Abonné newsletter'
        verbose_name_plural = 'Abonnés newsletter'
        unique_together = ['commune', 'email']
    
    def __str__(self):
        return f"{self.email} - {self.commune.nom}"
    
    def save(self, *args, **kwargs):
        if not self.token_desinscription:
            import uuid
            self.token_desinscription = uuid.uuid4().hex
        super().save(*args, **kwargs)
