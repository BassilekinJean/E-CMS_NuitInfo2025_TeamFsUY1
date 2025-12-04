from django.db import models
from django.utils.text import slugify


class Mairie(models.Model):
    """
    Modèle Mairie - Entité centrale du multi-tenancy E-CMS
    Chaque mairie a son propre espace isolé avec ses données
    """
    
    class Statut(models.TextChoices):
        EN_ATTENTE = 'en_attente', 'En attente de validation'
        ACTIVE = 'active', 'Active'
        SUSPENDUE = 'suspendue', 'Suspendue'
        DESACTIVEE = 'desactivee', 'Désactivée'
    
    # Attributs de base (selon le diagramme de classes)
    nom = models.CharField('Nom de la mairie', max_length=255)
    slug = models.SlugField('Slug URL', unique=True, max_length=255)
    localisation = models.TextField('Adresse complète')
    contact = models.CharField('Contact (téléphone/email)', max_length=255)
    logo = models.ImageField('Logo', upload_to='mairies/logos/', blank=True, null=True)
    
    # Informations supplémentaires
    code_postal = models.CharField('Code postal', max_length=10, blank=True)
    ville = models.CharField('Ville', max_length=100, blank=True)
    region = models.CharField('Région', max_length=100, blank=True)
    pays = models.CharField('Pays', max_length=100, default='Cameroun')
    
    # Site web et réseaux sociaux
    site_web = models.URLField('Site web officiel', blank=True)
    email_contact = models.EmailField('Email de contact', blank=True)
    telephone = models.CharField('Téléphone', max_length=20, blank=True)
    
    # Personnalisation du site
    couleur_primaire = models.CharField('Couleur primaire', max_length=7, default='#0066CC')
    couleur_secondaire = models.CharField('Couleur secondaire', max_length=7, default='#004499')
    banniere = models.ImageField('Bannière', upload_to='mairies/bannieres/', blank=True, null=True)
    
    # Textes de présentation
    description = models.TextField('Description de la mairie', blank=True)
    historique = models.TextField('Historique', blank=True)
    mot_du_maire = models.TextField('Mot du maire', blank=True)
    
    # Informations sur le maire
    nom_maire = models.CharField('Nom du maire', max_length=255, blank=True)
    photo_maire = models.ImageField('Photo du maire', upload_to='mairies/maires/', blank=True, null=True)
    
    # Statut et dates
    statut = models.CharField(
        'Statut',
        max_length=20,
        choices=Statut.choices,
        default=Statut.EN_ATTENTE
    )
    date_creation = models.DateTimeField('Date de création', auto_now_add=True)
    date_modification = models.DateTimeField('Date de modification', auto_now=True)
    date_validation = models.DateTimeField('Date de validation', null=True, blank=True)
    
    # Horaires d'ouverture (JSON)
    horaires_ouverture = models.JSONField('Horaires d\'ouverture', default=dict, blank=True)
    
    # Coordonnées GPS pour la carte
    latitude = models.DecimalField('Latitude', max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField('Longitude', max_digits=9, decimal_places=6, null=True, blank=True)
    
    class Meta:
        verbose_name = 'Mairie'
        verbose_name_plural = 'Mairies'
        ordering = ['nom']
    
    def __str__(self):
        return self.nom
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.nom)
        super().save(*args, **kwargs)
    
    def is_active(self):
        """Vérifie si la mairie est active"""
        return self.statut == self.Statut.ACTIVE
    
    def get_agents(self):
        """Retourne tous les agents de cette mairie"""
        return self.utilisateurs.filter(role='agent_communal')


class DemandeCreationSite(models.Model):
    """
    Modèle pour les demandes de création de site par les mairies
    Validées par l'administrateur national
    """
    
    class Statut(models.TextChoices):
        EN_ATTENTE = 'en_attente', 'En attente'
        EN_COURS = 'en_cours', 'En cours de traitement'
        VALIDEE = 'validee', 'Validée'
        REJETEE = 'rejetee', 'Rejetée'
    
    # Informations de la mairie demandeuse
    nom_mairie = models.CharField('Nom de la mairie', max_length=255)
    localisation = models.TextField('Adresse complète')
    contact = models.CharField('Contact', max_length=255)
    email = models.EmailField('Email')
    telephone = models.CharField('Téléphone', max_length=20)
    
    # Demandeur
    nom_demandeur = models.CharField('Nom du demandeur', max_length=255)
    fonction_demandeur = models.CharField('Fonction du demandeur', max_length=255)
    
    # Documents justificatifs
    justificatif = models.FileField(
        'Document justificatif',
        upload_to='demandes/justificatifs/',
        blank=True, null=True
    )
    
    # Statut et traitement
    statut = models.CharField(
        'Statut',
        max_length=20,
        choices=Statut.choices,
        default=Statut.EN_ATTENTE
    )
    motif_rejet = models.TextField('Motif de rejet', blank=True)
    
    # Dates
    date_demande = models.DateTimeField('Date de demande', auto_now_add=True)
    date_traitement = models.DateTimeField('Date de traitement', null=True, blank=True)
    
    # Mairie créée après validation
    mairie_creee = models.OneToOneField(
        Mairie,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='demande_creation'
    )
    
    class Meta:
        verbose_name = 'Demande de création de site'
        verbose_name_plural = 'Demandes de création de site'
        ordering = ['-date_demande']
    
    def __str__(self):
        return f"Demande - {self.nom_mairie} ({self.get_statut_display()})"


class ServiceMunicipal(models.Model):
    """
    Services proposés par une mairie
    """
    
    mairie = models.ForeignKey(
        Mairie,
        on_delete=models.CASCADE,
        related_name='services'
    )
    
    nom = models.CharField('Nom du service', max_length=255)
    description = models.TextField('Description', blank=True)
    responsable = models.CharField('Responsable', max_length=255, blank=True)
    telephone = models.CharField('Téléphone', max_length=20, blank=True)
    email = models.EmailField('Email', blank=True)
    horaires = models.TextField('Horaires', blank=True)
    
    icone = models.CharField('Icône (classe CSS)', max_length=50, blank=True)
    ordre = models.PositiveIntegerField('Ordre d\'affichage', default=0)
    est_actif = models.BooleanField('Actif', default=True)
    
    class Meta:
        verbose_name = 'Service Municipal'
        verbose_name_plural = 'Services Municipaux'
        ordering = ['ordre', 'nom']
    
    def __str__(self):
        return f"{self.nom} - {self.mairie.nom}"
