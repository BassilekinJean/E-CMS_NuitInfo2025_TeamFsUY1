"""
Transparence - Projets, budgets et deliberations
"""
from django.db import models
from django.conf import settings
from django.utils.text import slugify
from decimal import Decimal


class Projet(models.Model):
    """Projets municipaux avec suivi budget et avancement"""
    
    class Statut(models.TextChoices):
        PLANIFIE = 'planifie', 'Planifie'
        EN_COURS = 'en_cours', 'En cours'
        SUSPENDU = 'suspendu', 'Suspendu'
        TERMINE = 'termine', 'Termine'
        ANNULE = 'annule', 'Annule'
    
    class Categorie(models.TextChoices):
        VOIRIE = 'voirie', 'Voirie et infrastructures'
        BATIMENTS = 'batiments', 'Batiments publics'
        ESPACES_VERTS = 'espaces_verts', 'Espaces verts'
        CULTURE = 'culture', 'Culture et patrimoine'
        SPORT = 'sport', 'Sport et loisirs'
        EDUCATION = 'education', 'Education'
        SOCIAL = 'social', 'Action sociale'
        ENVIRONNEMENT = 'environnement', 'Environnement'
        NUMERIQUE = 'numerique', 'Numerique'
        SANTE = 'sante', 'Sante'
        AUTRE = 'autre', 'Autre'
    
    commune = models.ForeignKey('communes.Commune', on_delete=models.CASCADE, related_name='projets')
    responsable = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='projets_responsable')
    
    titre = models.CharField('Titre', max_length=255)
    slug = models.SlugField('Slug', max_length=255)
    description = models.TextField('Description')
    
    budget = models.DecimalField('Budget alloue (FCFA)', max_digits=15, decimal_places=2)
    budget_depense = models.DecimalField('Budget depense', max_digits=15, decimal_places=2, default=Decimal('0.00'))
    avancement = models.PositiveIntegerField('Avancement (%)', default=0)
    
    date_debut = models.DateField('Date debut')
    date_fin = models.DateField('Date fin prevue')
    date_fin_reelle = models.DateField('Date fin reelle', null=True, blank=True)
    
    categorie = models.CharField('Categorie', max_length=50, choices=Categorie.choices, default=Categorie.AUTRE)
    statut = models.CharField('Statut', max_length=20, choices=Statut.choices, default=Statut.PLANIFIE)
    
    lieu = models.CharField('Lieu', max_length=255, blank=True)
    latitude = models.DecimalField('Latitude', max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField('Longitude', max_digits=9, decimal_places=6, null=True, blank=True)
    
    image_principale = models.ImageField('Image principale', upload_to='projets/', blank=True, null=True)
    
    est_public = models.BooleanField('Public', default=True)
    est_mis_en_avant = models.BooleanField('Mis en avant', default=False)
    
    date_creation = models.DateTimeField('Date creation', auto_now_add=True)
    date_modification = models.DateTimeField('Derniere modification', auto_now=True)
    
    class Meta:
        verbose_name = 'Projet'
        verbose_name_plural = 'Projets'
        ordering = ['-date_creation']
        unique_together = ['commune', 'slug']
    
    def __str__(self):
        return f"{self.titre} ({self.avancement}%)"
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.titre)
        super().save(*args, **kwargs)


class Deliberation(models.Model):
    """Deliberations du conseil municipal"""
    
    commune = models.ForeignKey('communes.Commune', on_delete=models.CASCADE, related_name='deliberations')
    
    numero = models.CharField('Numero', max_length=50)
    titre = models.CharField('Titre', max_length=255)
    resume = models.TextField('Resume', blank=True)
    
    date_seance = models.DateField('Date de seance')
    fichier = models.FileField('Fichier PDF', upload_to='deliberations/')
    
    est_publie = models.BooleanField('Publie', default=True)
    date_creation = models.DateTimeField('Date creation', auto_now_add=True)
    
    class Meta:
        verbose_name = 'Deliberation'
        verbose_name_plural = 'Deliberations'
        ordering = ['-date_seance']
    
    def __str__(self):
        return f"{self.numero} - {self.titre}"


class DocumentBudgetaire(models.Model):
    """Documents budgetaires officiels"""
    
    class TypeDocument(models.TextChoices):
        BUDGET_PRIMITIF = 'budget_primitif', 'Budget primitif'
        BUDGET_SUPPLEMENTAIRE = 'budget_supplementaire', 'Budget supplementaire'
        COMPTE_ADMINISTRATIF = 'compte_administratif', 'Compte administratif'
        RAPPORT_ACTIVITE = 'rapport_activite', 'Rapport activite'
        AUTRE = 'autre', 'Autre'
    
    commune = models.ForeignKey('communes.Commune', on_delete=models.CASCADE, related_name='documents_budgetaires')
    
    type_document = models.CharField('Type', max_length=50, choices=TypeDocument.choices)
    titre = models.CharField('Titre', max_length=255)
    annee = models.PositiveIntegerField('Annee')
    description = models.TextField('Description', blank=True)
    fichier = models.FileField('Fichier', upload_to='budgets/')
    
    montant_total = models.DecimalField('Montant total (FCFA)', max_digits=15, decimal_places=2, null=True, blank=True)
    
    est_publie = models.BooleanField('Publie', default=True)
    date_creation = models.DateTimeField('Date creation', auto_now_add=True)
    
    class Meta:
        verbose_name = 'Document budgetaire'
        verbose_name_plural = 'Documents budgetaires'
        ordering = ['-annee', '-date_creation']
    
    def __str__(self):
        return f"{self.titre} - {self.annee}"


class DocumentOfficiel(models.Model):
    """Documents officiels"""
    
    class TypeDocument(models.TextChoices):
        ARRETE = 'arrete', 'Arrete'
        REGLEMENT = 'reglement', 'Reglement'
        COMPTE_RENDU = 'compte_rendu', 'Compte-rendu'
        FORMULAIRE = 'formulaire', 'Formulaire'
        GUIDE = 'guide', 'Guide'
        AUTRE = 'autre', 'Autre'
    
    commune = models.ForeignKey('communes.Commune', on_delete=models.CASCADE, related_name='documents_officiels')
    auteur = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='documents_publies')
    
    titre = models.CharField('Titre', max_length=255)
    type_document = models.CharField('Type', max_length=50, choices=TypeDocument.choices, default=TypeDocument.AUTRE)
    description = models.TextField('Description', blank=True)
    fichier = models.FileField('Fichier', upload_to='documents/')
    
    categorie = models.CharField('Categorie', max_length=100, blank=True)
    numero_reference = models.CharField('Numero de reference', max_length=100, blank=True)
    date_document = models.DateField('Date du document', null=True, blank=True)
    
    est_public = models.BooleanField('Public', default=True)
    nombre_telechargements = models.PositiveIntegerField('Telechargements', default=0)
    
    date_creation = models.DateTimeField('Date creation', auto_now_add=True)
    
    class Meta:
        verbose_name = 'Document officiel'
        verbose_name_plural = 'Documents officiels'
        ordering = ['-date_creation']
    
    def __str__(self):
        return f"{self.titre} - {self.commune.nom}"
