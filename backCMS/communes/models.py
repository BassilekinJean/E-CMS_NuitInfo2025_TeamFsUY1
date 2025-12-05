"""
Communes - Modèles pour les sites communaux (multisite)
"""
from django.db import models
from django.utils.text import slugify
from django.contrib.sites.models import Site


class Region(models.Model):
    """Régions du Cameroun"""
    nom = models.CharField('Nom', max_length=100)
    code = models.CharField('Code', max_length=10, unique=True)
    
    class Meta:
        verbose_name = 'Région'
        verbose_name_plural = 'Régions'
        ordering = ['nom']
    
    def __str__(self):
        return self.nom


class Departement(models.Model):
    """Départements du Cameroun"""
    region = models.ForeignKey(Region, on_delete=models.CASCADE, related_name='departements')
    nom = models.CharField('Nom', max_length=100)
    code = models.CharField('Code', max_length=10)
    
    class Meta:
        verbose_name = 'Département'
        verbose_name_plural = 'Départements'
        ordering = ['region', 'nom']
    
    def __str__(self):
        return f"{self.nom} ({self.region.nom})"


class Commune(models.Model):
    """
    Modèle Commune - Représente un site communal dans le multisite
    Chaque commune a son propre sous-site avec contenu personnalisé
    """
    
    class Statut(models.TextChoices):
        EN_ATTENTE = 'en_attente', 'En attente de validation'
        ACTIVE = 'active', 'Active'
        SUSPENDUE = 'suspendue', 'Suspendue'
        DESACTIVEE = 'desactivee', 'Désactivée'
    
    # Relation avec Django Sites (pour le multisite)
    site = models.OneToOneField(
        Site,
        on_delete=models.CASCADE,
        null=True, blank=True,
        related_name='commune'
    )
    
    # Informations de base
    nom = models.CharField('Nom de la commune', max_length=255)
    slug = models.SlugField('Slug URL', unique=True, max_length=255)
    code_postal = models.CharField('Code postal', max_length=10, blank=True)
    
    # Localisation
    departement = models.ForeignKey(
        Departement,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='communes'
    )
    population = models.PositiveIntegerField('Population', null=True, blank=True)
    superficie = models.DecimalField('Superficie (km²)', max_digits=10, decimal_places=2, null=True, blank=True)
    
    # Coordonnées GPS
    latitude = models.DecimalField('Latitude', max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField('Longitude', max_digits=9, decimal_places=6, null=True, blank=True)
    
    # Contact
    adresse = models.TextField('Adresse complète', blank=True)
    telephone = models.CharField('Téléphone', max_length=20, blank=True)
    email = models.EmailField('Email', blank=True)
    site_web = models.URLField('Site web officiel', blank=True)
    
    # Personnalisation visuelle
    logo = models.ImageField('Logo', upload_to='communes/logos/', blank=True, null=True)
    banniere = models.ImageField('Bannière', upload_to='communes/bannieres/', blank=True, null=True)
    couleur_primaire = models.CharField('Couleur primaire', max_length=7, default='#0066CC')
    couleur_secondaire = models.CharField('Couleur secondaire', max_length=7, default='#004499')
    
    # Contenu
    description = models.TextField('Description', blank=True)
    historique = models.TextField('Historique', blank=True)
    mot_du_maire = models.TextField('Mot du maire', blank=True)
    
    # Maire
    nom_maire = models.CharField('Nom du maire', max_length=255, blank=True)
    photo_maire = models.ImageField('Photo du maire', upload_to='communes/maires/', blank=True, null=True)
    
    # Horaires
    horaires_ouverture = models.JSONField('Horaires d ouverture', default=dict, blank=True)
    
    # Statut
    statut = models.CharField('Statut', max_length=20, choices=Statut.choices, default=Statut.EN_ATTENTE)
    
    # Dates
    date_creation = models.DateTimeField('Date création', auto_now_add=True)
    date_modification = models.DateTimeField('Dernière modification', auto_now=True)
    date_validation = models.DateTimeField('Date validation', null=True, blank=True)
    
    class Meta:
        verbose_name = 'Commune'
        verbose_name_plural = 'Communes'
        ordering = ['nom']
    
    def __str__(self):
        return self.nom
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.nom)
        super().save(*args, **kwargs)
    
    def is_active(self):
        return self.statut == self.Statut.ACTIVE
    
    def get_domaine(self):
        """Retourne le domaine/sous-domaine de la commune"""
        if self.site:
            return self.site.domain
        return f"{self.slug}.ecms.cm"


class DemandeCreationSite(models.Model):
    """
    Demandes de création de site par les communes
    Validées par le super admin
    """
    
    class Statut(models.TextChoices):
        EN_ATTENTE = 'en_attente', 'En attente'
        EN_COURS = 'en_cours', 'En cours de traitement'
        VALIDEE = 'validee', 'Validée'
        REJETEE = 'rejetee', 'Rejetée'
    
    # Informations commune
    nom_commune = models.CharField('Nom de la commune', max_length=255)
    departement = models.ForeignKey(Departement, on_delete=models.SET_NULL, null=True, blank=True)
    population = models.PositiveIntegerField('Population approximative', null=True, blank=True)
    adresse = models.TextField('Adresse')
    
    # Contact référent
    nom_referent = models.CharField('Nom du référent', max_length=255)
    fonction_referent = models.CharField('Fonction', max_length=255)
    email_referent = models.EmailField('Email')
    telephone_referent = models.CharField('Téléphone', max_length=20)
    
    # Motivation
    motivation = models.TextField('Motivation / Attentes', blank=True)
    
    # Documents
    justificatif = models.FileField('Document justificatif', upload_to='demandes/', blank=True, null=True)
    
    # Consentement
    accepte_charte = models.BooleanField('Accepte la charte', default=False)
    accepte_confidentialite = models.BooleanField('Accepte politique confidentialité', default=False)
    
    # Traitement
    statut = models.CharField('Statut', max_length=20, choices=Statut.choices, default=Statut.EN_ATTENTE)
    motif_rejet = models.TextField('Motif de rejet', blank=True)
    notes_admin = models.TextField('Notes administrateur', blank=True)
    
    # Dates
    date_demande = models.DateTimeField('Date de demande', auto_now_add=True)
    date_traitement = models.DateTimeField('Date de traitement', null=True, blank=True)
    
    # Commune créée après validation
    commune_creee = models.OneToOneField(
        Commune,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='demande_creation'
    )
    
    class Meta:
        verbose_name = 'Demande de création'
        verbose_name_plural = 'Demandes de création'
        ordering = ['-date_demande']
    
    def __str__(self):
        return f"Demande - {self.nom_commune} ({self.get_statut_display()})"


class ServiceMunicipal(models.Model):
    """Services proposés par une commune"""
    
    commune = models.ForeignKey(Commune, on_delete=models.CASCADE, related_name='services')
    nom = models.CharField('Nom du service', max_length=255)
    description = models.TextField('Description', blank=True)
    responsable = models.CharField('Responsable', max_length=255, blank=True)
    telephone = models.CharField('Téléphone', max_length=20, blank=True)
    email = models.EmailField('Email', blank=True)
    horaires = models.TextField('Horaires', blank=True)
    icone = models.CharField('Icône (classe CSS)', max_length=50, blank=True)
    ordre = models.PositiveIntegerField('Ordre', default=0)
    est_actif = models.BooleanField('Actif', default=True)
    
    class Meta:
        verbose_name = 'Service Municipal'
        verbose_name_plural = 'Services Municipaux'
        ordering = ['ordre', 'nom']
    
    def __str__(self):
        return f"{self.nom} - {self.commune.nom}"


class EquipeMunicipale(models.Model):
    """Membres de l'équipe municipale (élus)"""
    
    class Fonction(models.TextChoices):
        MAIRE = 'maire', 'Maire'
        ADJOINT = 'adjoint', 'Adjoint au Maire'
        CONSEILLER = 'conseiller', 'Conseiller Municipal'
        SECRETAIRE = 'secretaire', 'Secrétaire Général'
    
    commune = models.ForeignKey(Commune, on_delete=models.CASCADE, related_name='equipe')
    nom = models.CharField('Nom complet', max_length=255)
    fonction = models.CharField('Fonction', max_length=50, choices=Fonction.choices)
    fonction_detail = models.CharField('Délégation / Détail', max_length=255, blank=True)
    photo = models.ImageField('Photo', upload_to='communes/equipe/', blank=True, null=True)
    email = models.EmailField('Email', blank=True)
    telephone = models.CharField('Téléphone', max_length=20, blank=True)
    biographie = models.TextField('Biographie', blank=True)
    ordre = models.PositiveIntegerField('Ordre affichage', default=0)
    est_visible = models.BooleanField('Visible', default=True)
    
    class Meta:
        verbose_name = 'Membre équipe municipale'
        verbose_name_plural = 'Équipe municipale'
        ordering = ['ordre', 'fonction']
    
    def __str__(self):
        return f"{self.nom} - {self.get_fonction_display()}"
