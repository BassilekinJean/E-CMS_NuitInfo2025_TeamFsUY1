"""
Services - Formulaires et démarches administratives
"""
from django.db import models
from django.conf import settings
import uuid


class Formulaire(models.Model):
    """Formulaires dynamiques pour démarches"""
    
    class TypeFormulaire(models.TextChoices):
        ETAT_CIVIL = 'etat_civil', 'État Civil'
        URBANISME = 'urbanisme', 'Urbanisme'
        SOCIAL = 'social', 'Action Sociale'
        SCOLAIRE = 'scolaire', 'Scolaire'
        SIGNALEMENT = 'signalement', 'Signalement'
        CONTACT = 'contact', 'Contact'
        DEMANDE_INFO = 'demande_info', 'Demande d information'
        RECLAMATION = 'reclamation', 'Réclamation'
        AUTRE = 'autre', 'Autre'
    
    commune = models.ForeignKey(
        'communes.Commune',
        on_delete=models.CASCADE,
        related_name='formulaires'
    )
    
    nom = models.CharField('Nom', max_length=255)
    description = models.TextField('Description', blank=True)
    type = models.CharField('Type', max_length=50, choices=TypeFormulaire.choices, default=TypeFormulaire.CONTACT)
    
    # Configuration des champs (JSON)
    champs = models.JSONField(
        'Champs du formulaire',
        default=list,
        help_text='Configuration JSON des champs'
    )
    """
    Structure exemple:
    [
        {"nom": "nom", "type": "text", "label": "Nom", "obligatoire": true},
        {"nom": "email", "type": "email", "label": "Email", "obligatoire": true},
        {"nom": "message", "type": "textarea", "label": "Message", "obligatoire": true}
    ]
    """
    
    # Paramètres
    necessite_authentification = models.BooleanField('Authentification requise', default=False)
    email_notification = models.EmailField('Email notification', blank=True)
    est_actif = models.BooleanField('Actif', default=True)
    
    # Dates
    date_creation = models.DateTimeField('Date création', auto_now_add=True)
    date_modification = models.DateTimeField('Dernière modification', auto_now=True)
    
    class Meta:
        verbose_name = 'Formulaire'
        verbose_name_plural = 'Formulaires'
        ordering = ['type', 'nom']
    
    def __str__(self):
        return f"{self.nom} - {self.commune.nom}"


class Demarche(models.Model):
    """Demandes soumises via les formulaires"""
    
    class Statut(models.TextChoices):
        EN_ATTENTE = 'en_attente', 'En attente'
        EN_COURS = 'en_cours', 'En cours'
        VALIDEE = 'validee', 'Validée'
        REJETEE = 'rejetee', 'Rejetée'
        COMPLETEE = 'completee', 'Complétée'
        ANNULEE = 'annulee', 'Annulée'
    
    commune = models.ForeignKey(
        'communes.Commune',
        on_delete=models.CASCADE,
        related_name='demarches'
    )
    formulaire = models.ForeignKey(
        Formulaire,
        on_delete=models.SET_NULL,
        null=True,
        related_name='demarches'
    )
    demandeur = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='demarches'
    )
    agent_traitant = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='demarches_traitees'
    )
    
    # Numéro de suivi unique
    numero_suivi = models.CharField('Numéro de suivi', max_length=50, unique=True, blank=True)
    
    # Type et données
    type = models.CharField('Type de démarche', max_length=100)
    donnees = models.JSONField('Données soumises', default=dict)
    
    # Demandeur (si non connecté)
    nom_demandeur = models.CharField('Nom demandeur', max_length=255, blank=True)
    email_demandeur = models.EmailField('Email demandeur', blank=True)
    telephone_demandeur = models.CharField('Téléphone', max_length=20, blank=True)
    
    # Traitement
    statut = models.CharField('Statut', max_length=20, choices=Statut.choices, default=Statut.EN_ATTENTE)
    commentaire_agent = models.TextField('Commentaire agent', blank=True)
    motif_rejet = models.TextField('Motif rejet', blank=True)
    priorite = models.PositiveIntegerField('Priorité', default=0)
    
    # Dates
    date_demande = models.DateTimeField('Date demande', auto_now_add=True)
    date_prise_en_charge = models.DateTimeField('Date prise en charge', null=True, blank=True)
    date_traitement = models.DateTimeField('Date traitement', null=True, blank=True)
    
    class Meta:
        verbose_name = 'Démarche'
        verbose_name_plural = 'Démarches'
        ordering = ['-date_demande']
    
    def __str__(self):
        return f"{self.type} - {self.numero_suivi}"
    
    def save(self, *args, **kwargs):
        if not self.numero_suivi:
            self.numero_suivi = f"DEM-{uuid.uuid4().hex[:8].upper()}"
        super().save(*args, **kwargs)


class Signalement(models.Model):
    """Signalements citoyens géolocalisés"""
    
    class Categorie(models.TextChoices):
        VOIRIE = 'voirie', 'Voirie'
        ECLAIRAGE = 'eclairage', 'Éclairage public'
        PROPRETE = 'proprete', 'Propreté'
        ESPACES_VERTS = 'espaces_verts', 'Espaces verts'
        STATIONNEMENT = 'stationnement', 'Stationnement'
        BRUIT = 'bruit', 'Nuisances sonores'
        SECURITE = 'securite', 'Sécurité'
        EAU = 'eau', 'Eau / Assainissement'
        AUTRE = 'autre', 'Autre'
    
    class Statut(models.TextChoices):
        SIGNALE = 'signale', 'Signalé'
        EN_COURS = 'en_cours', 'En cours'
        RESOLU = 'resolu', 'Résolu'
        REJETE = 'rejete', 'Rejeté'
    
    commune = models.ForeignKey(
        'communes.Commune',
        on_delete=models.CASCADE,
        related_name='signalements'
    )
    signaleur = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='signalements'
    )
    agent_traitant = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='signalements_traites'
    )
    
    # Numéro de suivi
    numero_suivi = models.CharField('Numéro de suivi', max_length=50, unique=True, blank=True)
    
    # Informations
    titre = models.CharField('Titre', max_length=255)
    description = models.TextField('Description')
    categorie = models.CharField('Catégorie', max_length=50, choices=Categorie.choices, default=Categorie.AUTRE)
    
    # Localisation
    adresse = models.CharField('Adresse', max_length=255, blank=True)
    latitude = models.DecimalField('Latitude', max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField('Longitude', max_digits=9, decimal_places=6, null=True, blank=True)
    
    # Photo
    photo = models.ImageField('Photo', upload_to='signalements/', blank=True, null=True)
    
    # Contact (si anonyme)
    email_contact = models.EmailField('Email contact', blank=True)
    
    # Traitement
    statut = models.CharField('Statut', max_length=20, choices=Statut.choices, default=Statut.SIGNALE)
    commentaire_resolution = models.TextField('Commentaire résolution', blank=True)
    
    # Dates
    date_signalement = models.DateTimeField('Date signalement', auto_now_add=True)
    date_resolution = models.DateTimeField('Date résolution', null=True, blank=True)
    
    class Meta:
        verbose_name = 'Signalement'
        verbose_name_plural = 'Signalements'
        ordering = ['-date_signalement']
    
    def __str__(self):
        return f"{self.titre} - {self.numero_suivi}"
    
    def save(self, *args, **kwargs):
        if not self.numero_suivi:
            self.numero_suivi = f"SIG-{uuid.uuid4().hex[:8].upper()}"
        super().save(*args, **kwargs)


class Contact(models.Model):
    """Messages de contact"""
    
    commune = models.ForeignKey(
        'communes.Commune',
        on_delete=models.CASCADE,
        related_name='contacts'
    )
    
    nom = models.CharField('Nom', max_length=255)
    email = models.EmailField('Email')
    telephone = models.CharField('Téléphone', max_length=20, blank=True)
    sujet = models.CharField('Sujet', max_length=255)
    message = models.TextField('Message')
    
    est_lu = models.BooleanField('Lu', default=False)
    est_traite = models.BooleanField('Traité', default=False)
    reponse = models.TextField('Réponse', blank=True)
    
    date_envoi = models.DateTimeField('Date envoi', auto_now_add=True)
    date_reponse = models.DateTimeField('Date réponse', null=True, blank=True)
    
    class Meta:
        verbose_name = 'Message de contact'
        verbose_name_plural = 'Messages de contact'
        ordering = ['-date_envoi']
    
    def __str__(self):
        return f"{self.sujet} - {self.nom}"
