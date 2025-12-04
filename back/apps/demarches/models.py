from django.db import models
from django.conf import settings


class Formulaire(models.Model):
    """
    Modèle Formulaire - Formulaires dynamiques avec champs JSON
    Permet de créer des formulaires personnalisés par mairie
    """
    
    class TypeFormulaire(models.TextChoices):
        ACTE_NAISSANCE = 'acte_naissance', 'Demande d\'acte de naissance'
        ACTE_MARIAGE = 'acte_mariage', 'Demande d\'acte de mariage'
        ACTE_DECES = 'acte_deces', 'Demande d\'acte de décès'
        SIGNALEMENT = 'signalement', 'Signalement de problème'
        CONTACT = 'contact', 'Formulaire de contact'
        DEMANDE_INFO = 'demande_info', 'Demande d\'information'
        INSCRIPTION = 'inscription', 'Inscription à un service'
        RECLAMATION = 'reclamation', 'Réclamation'
        AUTRE = 'autre', 'Autre'
    
    mairie = models.ForeignKey(
        'mairies.Mairie',
        on_delete=models.CASCADE,
        related_name='formulaires'
    )
    
    # Attributs de base (selon le diagramme)
    type = models.CharField(
        'Type de formulaire',
        max_length=50,
        choices=TypeFormulaire.choices,
        default=TypeFormulaire.CONTACT
    )
    
    nom = models.CharField('Nom du formulaire', max_length=255)
    description = models.TextField('Description', blank=True)
    
    # Champs dynamiques (structure JSON)
    champs_dynamiques = models.JSONField(
        'Champs du formulaire',
        default=list,
        help_text='Configuration JSON des champs du formulaire'
    )
    """
    Exemple de structure JSON:
    [
        {"nom": "titre", "type": "text", "label": "Titre", "obligatoire": true},
        {"nom": "description", "type": "textarea", "label": "Description", "obligatoire": true},
        {"nom": "photo", "type": "file", "label": "Photo", "obligatoire": false},
        {"nom": "localisation", "type": "geolocalisation", "label": "Localisation", "obligatoire": false}
    ]
    """
    
    # Paramètres du formulaire
    necessite_authentification = models.BooleanField(
        'Nécessite une authentification',
        default=False,
        help_text='Si activé, seuls les utilisateurs connectés peuvent soumettre'
    )
    est_actif = models.BooleanField('Formulaire actif', default=True)
    
    # Notification
    email_notification = models.EmailField('Email de notification', blank=True)
    
    # Dates
    date_creation = models.DateTimeField('Date de création', auto_now_add=True)
    date_modification = models.DateTimeField('Date de modification', auto_now=True)
    
    class Meta:
        verbose_name = 'Formulaire'
        verbose_name_plural = 'Formulaires'
        ordering = ['mairie', 'type', 'nom']
    
    def __str__(self):
        return f"{self.nom} - {self.mairie.nom}"


class DemarcheAdministrative(models.Model):
    """
    Modèle DemarcheAdministrative - Demandes soumises par les citoyens
    Gère le suivi des demandes d'actes et signalements
    """
    
    class Statut(models.TextChoices):
        EN_ATTENTE = 'en_attente', 'En attente'
        EN_COURS = 'en_cours', 'En cours de traitement'
        VALIDEE = 'validee', 'Validée'
        REJETEE = 'rejetee', 'Rejetée'
        COMPLETEE = 'completee', 'Complétée'
        ANNULEE = 'annulee', 'Annulée'
    
    # Relations
    mairie = models.ForeignKey(
        'mairies.Mairie',
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
        related_name='demarches',
        help_text='Peut être null pour les signalements anonymes'
    )
    
    agent_traitant = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='demarches_traitees'
    )
    
    # Attributs de base (selon le diagramme)
    type = models.CharField('Type de démarche', max_length=100)
    statut = models.CharField(
        'Statut',
        max_length=20,
        choices=Statut.choices,
        default=Statut.EN_ATTENTE
    )
    date_demande = models.DateTimeField('Date de demande', auto_now_add=True)
    
    # Données du formulaire soumis (JSON)
    donnees_formulaire = models.JSONField(
        'Données soumises',
        default=dict
    )
    
    # Informations du demandeur (pour les demandes anonymes)
    nom_demandeur = models.CharField('Nom du demandeur', max_length=255, blank=True)
    email_demandeur = models.EmailField('Email du demandeur', blank=True)
    telephone_demandeur = models.CharField('Téléphone du demandeur', max_length=20, blank=True)
    
    # Numéro de suivi
    numero_suivi = models.CharField('Numéro de suivi', max_length=50, unique=True, blank=True)
    
    # Traitement
    commentaire_agent = models.TextField('Commentaire de l\'agent', blank=True)
    motif_rejet = models.TextField('Motif de rejet', blank=True)
    
    # Dates de traitement
    date_prise_en_charge = models.DateTimeField('Date de prise en charge', null=True, blank=True)
    date_traitement = models.DateTimeField('Date de traitement', null=True, blank=True)
    
    # Priorité
    priorite = models.PositiveIntegerField('Priorité', default=0)
    
    class Meta:
        verbose_name = 'Démarche Administrative'
        verbose_name_plural = 'Démarches Administratives'
        ordering = ['-date_demande']
    
    def __str__(self):
        return f"{self.type} - {self.numero_suivi} ({self.get_statut_display()})"
    
    def save(self, *args, **kwargs):
        if not self.numero_suivi:
            import uuid
            self.numero_suivi = f"DEM-{uuid.uuid4().hex[:8].upper()}"
        super().save(*args, **kwargs)


class Signalement(models.Model):
    """
    Modèle Signalement - Signalements de problèmes par les citoyens
    Cas particulier de démarche avec géolocalisation et photos
    """
    
    class Categorie(models.TextChoices):
        VOIRIE = 'voirie', 'Voirie (nids-de-poule, trottoirs...)'
        ECLAIRAGE = 'eclairage', 'Éclairage public'
        PROPRETE = 'proprete', 'Propreté (dépôts sauvages...)'
        ESPACES_VERTS = 'espaces_verts', 'Espaces verts'
        STATIONNEMENT = 'stationnement', 'Stationnement'
        BRUIT = 'bruit', 'Nuisances sonores'
        SECURITE = 'securite', 'Sécurité'
        AUTRE = 'autre', 'Autre'
    
    class Statut(models.TextChoices):
        SIGNALE = 'signale', 'Signalé'
        EN_COURS = 'en_cours', 'En cours de traitement'
        RESOLU = 'resolu', 'Résolu'
        REJETE = 'rejete', 'Rejeté'
    
    mairie = models.ForeignKey(
        'mairies.Mairie',
        on_delete=models.CASCADE,
        related_name='signalements'
    )
    
    # Signaleur (optionnel - peut être anonyme)
    signaleur = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='signalements'
    )
    
    # Informations du signalement
    titre = models.CharField('Titre', max_length=255)
    description = models.TextField('Description')
    categorie = models.CharField(
        'Catégorie',
        max_length=50,
        choices=Categorie.choices,
        default=Categorie.AUTRE
    )
    
    # Localisation
    adresse = models.CharField('Adresse', max_length=255, blank=True)
    latitude = models.DecimalField('Latitude', max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField('Longitude', max_digits=9, decimal_places=6, null=True, blank=True)
    
    # Photo
    photo = models.ImageField('Photo', upload_to='signalements/', blank=True, null=True)
    
    # Contact (pour signalement anonyme)
    email_contact = models.EmailField('Email de contact', blank=True)
    
    # Statut et traitement
    statut = models.CharField(
        'Statut',
        max_length=20,
        choices=Statut.choices,
        default=Statut.SIGNALE
    )
    
    agent_traitant = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='signalements_traites'
    )
    
    commentaire_resolution = models.TextField('Commentaire de résolution', blank=True)
    
    # Dates
    date_signalement = models.DateTimeField('Date de signalement', auto_now_add=True)
    date_resolution = models.DateTimeField('Date de résolution', null=True, blank=True)
    
    # Numéro de suivi
    numero_suivi = models.CharField('Numéro de suivi', max_length=50, unique=True, blank=True)
    
    class Meta:
        verbose_name = 'Signalement'
        verbose_name_plural = 'Signalements'
        ordering = ['-date_signalement']
    
    def __str__(self):
        return f"{self.titre} - {self.get_statut_display()}"
    
    def save(self, *args, **kwargs):
        if not self.numero_suivi:
            import uuid
            self.numero_suivi = f"SIG-{uuid.uuid4().hex[:8].upper()}"
        super().save(*args, **kwargs)


class RendezVous(models.Model):
    """
    Modèle RendezVous - Prise de rendez-vous en mairie
    """
    
    class Statut(models.TextChoices):
        EN_ATTENTE = 'en_attente', 'En attente de confirmation'
        CONFIRME = 'confirme', 'Confirmé'
        ANNULE = 'annule', 'Annulé'
        TERMINE = 'termine', 'Terminé'
        ABSENT = 'absent', 'Absent'
    
    mairie = models.ForeignKey(
        'mairies.Mairie',
        on_delete=models.CASCADE,
        related_name='rendez_vous'
    )
    
    citoyen = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='rendez_vous'
    )
    
    service = models.ForeignKey(
        'mairies.ServiceMunicipal',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='rendez_vous'
    )
    
    # Informations du rendez-vous
    motif = models.CharField('Motif du rendez-vous', max_length=255)
    description = models.TextField('Description', blank=True)
    
    # Date et heure
    date = models.DateField('Date')
    heure_debut = models.TimeField('Heure de début')
    heure_fin = models.TimeField('Heure de fin')
    
    # Statut
    statut = models.CharField(
        'Statut',
        max_length=20,
        choices=Statut.choices,
        default=Statut.EN_ATTENTE
    )
    
    # Notes
    notes = models.TextField('Notes internes', blank=True)
    
    # Dates
    date_creation = models.DateTimeField('Date de création', auto_now_add=True)
    
    class Meta:
        verbose_name = 'Rendez-vous'
        verbose_name_plural = 'Rendez-vous'
        ordering = ['date', 'heure_debut']
    
    def __str__(self):
        return f"RDV {self.citoyen.nom} - {self.date} {self.heure_debut}"
