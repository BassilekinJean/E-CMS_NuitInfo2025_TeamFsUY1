from django.db import models
from django.conf import settings


class DocumentOfficiel(models.Model):
    """
    Modèle DocumentOfficiel - Documents publics de la mairie
    Délibérations, arrêtés, comptes-rendus, budgets
    """
    
    class TypeDocument(models.TextChoices):
        DELIBERATION = 'deliberation', 'Délibération du conseil municipal'
        ARRETE = 'arrete', 'Arrêté municipal'
        COMPTE_RENDU = 'compte_rendu', 'Compte-rendu de réunion'
        BUDGET = 'budget', 'Budget'
        REGLEMENT = 'reglement', 'Règlement'
        FORMULAIRE = 'formulaire', 'Formulaire téléchargeable'
        RAPPORT = 'rapport', 'Rapport'
        AUTRE = 'autre', 'Autre document'
    
    mairie = models.ForeignKey(
        'mairies.Mairie',
        on_delete=models.CASCADE,
        related_name='documents'
    )
    
    # Attributs de base (selon le diagramme)
    titre = models.CharField('Titre', max_length=255)
    fichier_joint = models.FileField('Fichier', upload_to='documents/')
    date_publication = models.DateTimeField('Date de publication', auto_now_add=True)
    
    # Informations supplémentaires
    type_document = models.CharField(
        'Type de document',
        max_length=50,
        choices=TypeDocument.choices,
        default=TypeDocument.AUTRE
    )
    
    description = models.TextField('Description', blank=True)
    
    # Auteur/Éditeur
    auteur = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='documents_publies'
    )
    
    # Organisation
    categorie = models.CharField('Catégorie', max_length=100, blank=True)
    annee = models.PositiveIntegerField('Année', null=True, blank=True)
    numero_reference = models.CharField('Numéro de référence', max_length=100, blank=True)
    
    # Visibilité
    est_public = models.BooleanField('Document public', default=True)
    est_mis_en_avant = models.BooleanField('Mis en avant', default=False)
    
    # Métadonnées du fichier
    taille_fichier = models.PositiveIntegerField('Taille du fichier (octets)', default=0)
    type_mime = models.CharField('Type MIME', max_length=100, blank=True)
    
    # Statistiques
    nombre_telechargements = models.PositiveIntegerField('Nombre de téléchargements', default=0)
    
    # Dates
    date_document = models.DateField('Date du document', null=True, blank=True)
    date_modification = models.DateTimeField('Date de modification', auto_now=True)
    
    class Meta:
        verbose_name = 'Document Officiel'
        verbose_name_plural = 'Documents Officiels'
        ordering = ['-date_publication']
    
    def __str__(self):
        return f"{self.titre} - {self.mairie.nom}"
    
    def incrementer_telechargements(self):
        """Incrémente le compteur de téléchargements"""
        self.nombre_telechargements += 1
        self.save(update_fields=['nombre_telechargements'])


class Actualite(models.Model):
    """
    Modèle Actualite - Actualités et communiqués de presse
    """
    
    class Categorie(models.TextChoices):
        COMMUNIQUE = 'communique', 'Communiqué de presse'
        AVIS_PUBLIC = 'avis_public', 'Avis public'
        NOUVELLE = 'nouvelle', 'Nouvelle'
        ANNONCE = 'annonce', 'Annonce'
        EVENEMENT = 'evenement', 'Événement'
    
    mairie = models.ForeignKey(
        'mairies.Mairie',
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
    
    image_principale = models.ImageField(
        'Image principale',
        upload_to='actualites/',
        blank=True, null=True
    )
    
    categorie = models.CharField(
        'Catégorie',
        max_length=50,
        choices=Categorie.choices,
        default=Categorie.NOUVELLE
    )
    
    # Publication
    est_publie = models.BooleanField('Publié', default=False)
    est_mis_en_avant = models.BooleanField('Mis en avant', default=False)
    date_publication = models.DateTimeField('Date de publication', null=True, blank=True)
    
    # Statistiques
    nombre_vues = models.PositiveIntegerField('Nombre de vues', default=0)
    
    # Dates
    date_creation = models.DateTimeField('Date de création', auto_now_add=True)
    date_modification = models.DateTimeField('Date de modification', auto_now=True)
    
    class Meta:
        verbose_name = 'Actualité'
        verbose_name_plural = 'Actualités'
        ordering = ['-date_publication']
        unique_together = ['mairie', 'slug']
    
    def __str__(self):
        return self.titre
    
    def save(self, *args, **kwargs):
        if not self.slug:
            from django.utils.text import slugify
            self.slug = slugify(self.titre)
        super().save(*args, **kwargs)


class PageCMS(models.Model):
    """
    Modèle PageCMS - Pages de contenu du site
    Présentation, Historique, Services, etc.
    """
    
    mairie = models.ForeignKey(
        'mairies.Mairie',
        on_delete=models.CASCADE,
        related_name='pages'
    )
    
    titre = models.CharField('Titre', max_length=255)
    slug = models.SlugField('Slug URL', max_length=255)
    contenu = models.TextField('Contenu')
    
    # Hiérarchie des pages
    parent = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True, blank=True,
        related_name='enfants'
    )
    
    # Paramètres d'affichage
    ordre = models.PositiveIntegerField('Ordre d\'affichage', default=0)
    afficher_dans_menu = models.BooleanField('Afficher dans le menu', default=True)
    est_publie = models.BooleanField('Publié', default=True)
    
    # SEO
    meta_titre = models.CharField('Meta titre', max_length=70, blank=True)
    meta_description = models.CharField('Meta description', max_length=160, blank=True)
    
    # Image
    image_bandeau = models.ImageField(
        'Image bandeau',
        upload_to='pages/',
        blank=True, null=True
    )
    
    # Dates
    date_creation = models.DateTimeField('Date de création', auto_now_add=True)
    date_modification = models.DateTimeField('Date de modification', auto_now=True)
    
    class Meta:
        verbose_name = 'Page CMS'
        verbose_name_plural = 'Pages CMS'
        ordering = ['ordre', 'titre']
        unique_together = ['mairie', 'slug']
    
    def __str__(self):
        return f"{self.titre} - {self.mairie.nom}"


class FAQ(models.Model):
    """
    Modèle FAQ - Foire aux questions
    """
    
    mairie = models.ForeignKey(
        'mairies.Mairie',
        on_delete=models.CASCADE,
        related_name='faqs'
    )
    
    question = models.CharField('Question', max_length=255)
    reponse = models.TextField('Réponse')
    
    categorie = models.CharField('Catégorie', max_length=100, blank=True)
    ordre = models.PositiveIntegerField('Ordre d\'affichage', default=0)
    est_active = models.BooleanField('Active', default=True)
    
    date_creation = models.DateTimeField('Date de création', auto_now_add=True)
    
    class Meta:
        verbose_name = 'FAQ'
        verbose_name_plural = 'FAQs'
        ordering = ['categorie', 'ordre']
    
    def __str__(self):
        return self.question
