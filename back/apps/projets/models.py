from django.db import models
from django.conf import settings
from decimal import Decimal


class Projet(models.Model):
    """
    Modèle Projet - Projets municipaux avec suivi budget et avancement
    Pour la transparence sur l'utilisation des fonds publics
    """
    
    class Statut(models.TextChoices):
        PLANIFIE = 'planifie', 'Planifié'
        EN_COURS = 'en_cours', 'En cours'
        SUSPENDU = 'suspendu', 'Suspendu'
        TERMINE = 'termine', 'Terminé'
        ANNULE = 'annule', 'Annulé'
    
    class Categorie(models.TextChoices):
        VOIRIE = 'voirie', 'Voirie et infrastructures'
        BATIMENTS = 'batiments', 'Bâtiments publics'
        ESPACES_VERTS = 'espaces_verts', 'Espaces verts'
        CULTURE = 'culture', 'Culture et patrimoine'
        SPORT = 'sport', 'Sport et loisirs'
        EDUCATION = 'education', 'Éducation'
        SOCIAL = 'social', 'Action sociale'
        ENVIRONNEMENT = 'environnement', 'Environnement'
        NUMERIQUE = 'numerique', 'Numérique'
        AUTRE = 'autre', 'Autre'
    
    mairie = models.ForeignKey(
        'mairies.Mairie',
        on_delete=models.CASCADE,
        related_name='projets'
    )
    
    # Attributs de base (selon le diagramme)
    titre = models.CharField('Titre du projet', max_length=255)
    slug = models.SlugField('Slug', max_length=255)
    description = models.TextField('Description')
    budget = models.DecimalField('Budget alloué (€)', max_digits=12, decimal_places=2)
    avancement = models.PositiveIntegerField(
        'Avancement (%)',
        default=0,
        help_text='Pourcentage de réalisation (0-100)'
    )
    date_debut = models.DateField('Date de début')
    date_fin = models.DateField('Date de fin prévue')
    
    # Informations supplémentaires
    categorie = models.CharField(
        'Catégorie',
        max_length=50,
        choices=Categorie.choices,
        default=Categorie.AUTRE
    )
    
    statut = models.CharField(
        'Statut',
        max_length=20,
        choices=Statut.choices,
        default=Statut.PLANIFIE
    )
    
    # Responsable du projet
    responsable = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='projets_responsable'
    )
    
    # Budget détaillé
    budget_depense = models.DecimalField(
        'Budget dépensé (€)',
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00')
    )
    
    # Images
    image_principale = models.ImageField(
        'Image principale',
        upload_to='projets/',
        blank=True, null=True
    )
    
    # Localisation
    lieu = models.CharField('Lieu / Adresse', max_length=255, blank=True)
    latitude = models.DecimalField('Latitude', max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField('Longitude', max_digits=9, decimal_places=6, null=True, blank=True)
    
    # Affichage
    est_public = models.BooleanField('Visible publiquement', default=True)
    est_mis_en_avant = models.BooleanField('Mis en avant', default=False)
    
    # Dates
    date_creation = models.DateTimeField('Date de création', auto_now_add=True)
    date_modification = models.DateTimeField('Date de modification', auto_now=True)
    date_fin_reelle = models.DateField('Date de fin réelle', null=True, blank=True)
    
    class Meta:
        verbose_name = 'Projet'
        verbose_name_plural = 'Projets'
        ordering = ['-date_creation']
        unique_together = ['mairie', 'slug']
    
    def __str__(self):
        return f"{self.titre} ({self.avancement}%)"
    
    def save(self, *args, **kwargs):
        if not self.slug:
            from django.utils.text import slugify
            self.slug = slugify(self.titre)
        super().save(*args, **kwargs)
    
    def get_budget_restant(self):
        """Calcule le budget restant"""
        return self.budget - self.budget_depense
    
    def get_pourcentage_budget_utilise(self):
        """Calcule le pourcentage du budget utilisé"""
        if self.budget > 0:
            return round((self.budget_depense / self.budget) * 100, 2)
        return 0


class MiseAJourProjet(models.Model):
    """
    Historique des mises à jour d'un projet
    Pour le suivi transparent de l'avancement
    """
    
    projet = models.ForeignKey(
        Projet,
        on_delete=models.CASCADE,
        related_name='mises_a_jour'
    )
    
    auteur = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True
    )
    
    titre = models.CharField('Titre de la mise à jour', max_length=255)
    description = models.TextField('Description')
    
    # Valeurs au moment de la mise à jour
    avancement = models.PositiveIntegerField('Avancement (%)', default=0)
    budget_depense = models.DecimalField(
        'Budget dépensé (€)',
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00')
    )
    
    # Image optionnelle
    image = models.ImageField(
        'Image',
        upload_to='projets/mises_a_jour/',
        blank=True, null=True
    )
    
    date_creation = models.DateTimeField('Date de création', auto_now_add=True)
    
    class Meta:
        verbose_name = 'Mise à jour de projet'
        verbose_name_plural = 'Mises à jour de projets'
        ordering = ['-date_creation']
    
    def __str__(self):
        return f"{self.projet.titre} - {self.titre}"


class DocumentProjet(models.Model):
    """
    Documents associés à un projet
    Plans, études, marchés publics, etc.
    """
    
    class TypeDocument(models.TextChoices):
        PLAN = 'plan', 'Plan'
        ETUDE = 'etude', 'Étude'
        MARCHE = 'marche', 'Marché public'
        RAPPORT = 'rapport', 'Rapport'
        PHOTO = 'photo', 'Photographie'
        AUTRE = 'autre', 'Autre'
    
    projet = models.ForeignKey(
        Projet,
        on_delete=models.CASCADE,
        related_name='documents'
    )
    
    titre = models.CharField('Titre', max_length=255)
    fichier = models.FileField('Fichier', upload_to='projets/documents/')
    type_document = models.CharField(
        'Type',
        max_length=20,
        choices=TypeDocument.choices,
        default=TypeDocument.AUTRE
    )
    description = models.TextField('Description', blank=True)
    
    est_public = models.BooleanField('Public', default=True)
    date_creation = models.DateTimeField('Date d\'ajout', auto_now_add=True)
    
    class Meta:
        verbose_name = 'Document de projet'
        verbose_name_plural = 'Documents de projets'
        ordering = ['-date_creation']
    
    def __str__(self):
        return f"{self.titre} - {self.projet.titre}"
