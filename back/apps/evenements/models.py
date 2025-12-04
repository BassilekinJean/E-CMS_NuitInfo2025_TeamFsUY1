from django.db import models
from django.conf import settings


class Evenement(models.Model):
    """
    Modèle Evenement - Agenda municipal public
    Réunions, événements culturels, conseils municipaux, etc.
    """
    
    class Categorie(models.TextChoices):
        CONSEIL = 'conseil', 'Conseil municipal'
        REUNION = 'reunion', 'Réunion publique'
        CULTUREL = 'culturel', 'Événement culturel'
        SPORTIF = 'sportif', 'Événement sportif'
        FESTIF = 'festif', 'Fête / Cérémonie'
        MARCHE = 'marche', 'Marché'
        ASSOCIATIF = 'associatif', 'Événement associatif'
        FORMATION = 'formation', 'Formation / Atelier'
        AUTRE = 'autre', 'Autre'
    
    class Statut(models.TextChoices):
        PLANIFIE = 'planifie', 'Planifié'
        CONFIRME = 'confirme', 'Confirmé'
        ANNULE = 'annule', 'Annulé'
        REPORTE = 'reporte', 'Reporté'
        TERMINE = 'termine', 'Terminé'
    
    mairie = models.ForeignKey(
        'mairies.Mairie',
        on_delete=models.CASCADE,
        related_name='evenements'
    )
    
    # Attributs de base (selon le diagramme)
    nom = models.CharField('Nom de l\'événement', max_length=255)
    slug = models.SlugField('Slug', max_length=255)
    description = models.TextField('Description')
    lieu = models.CharField('Lieu', max_length=255)
    date = models.DateField('Date')
    
    # Horaires
    heure_debut = models.TimeField('Heure de début')
    heure_fin = models.TimeField('Heure de fin', null=True, blank=True)
    
    # Catégorie et statut
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
    
    # Image
    image = models.ImageField(
        'Image',
        upload_to='evenements/',
        blank=True, null=True
    )
    
    # Organisateur
    organisateur = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='evenements_organises'
    )
    
    contact_organisateur = models.CharField('Contact organisateur', max_length=255, blank=True)
    
    # Options
    inscription_requise = models.BooleanField('Inscription requise', default=False)
    places_limitees = models.BooleanField('Places limitées', default=False)
    nombre_places = models.PositiveIntegerField('Nombre de places', null=True, blank=True)
    
    # Localisation GPS
    latitude = models.DecimalField('Latitude', max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField('Longitude', max_digits=9, decimal_places=6, null=True, blank=True)
    
    # Affichage
    est_public = models.BooleanField('Événement public', default=True)
    est_mis_en_avant = models.BooleanField('Mis en avant', default=False)
    
    # Récurrence (pour les événements récurrents)
    est_recurrent = models.BooleanField('Événement récurrent', default=False)
    recurrence = models.CharField(
        'Récurrence',
        max_length=50,
        blank=True,
        help_text='Ex: hebdomadaire, mensuel, annuel'
    )
    
    # Dates
    date_creation = models.DateTimeField('Date de création', auto_now_add=True)
    date_modification = models.DateTimeField('Date de modification', auto_now=True)
    
    class Meta:
        verbose_name = 'Événement'
        verbose_name_plural = 'Événements'
        ordering = ['date', 'heure_debut']
        unique_together = ['mairie', 'slug']
    
    def __str__(self):
        return f"{self.nom} - {self.date}"
    
    def save(self, *args, **kwargs):
        if not self.slug:
            from django.utils.text import slugify
            self.slug = slugify(self.nom)
        super().save(*args, **kwargs)
    
    def places_restantes(self):
        """Calcule le nombre de places restantes"""
        if self.places_limitees and self.nombre_places:
            inscrits = self.inscriptions.filter(statut='confirme').count()
            return max(0, self.nombre_places - inscrits)
        return None


class InscriptionEvenement(models.Model):
    """
    Inscriptions aux événements
    """
    
    class Statut(models.TextChoices):
        EN_ATTENTE = 'en_attente', 'En attente'
        CONFIRME = 'confirme', 'Confirmé'
        ANNULE = 'annule', 'Annulé'
        PRESENT = 'present', 'Présent'
        ABSENT = 'absent', 'Absent'
    
    evenement = models.ForeignKey(
        Evenement,
        on_delete=models.CASCADE,
        related_name='inscriptions'
    )
    
    participant = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='inscriptions_evenements'
    )
    
    statut = models.CharField(
        'Statut',
        max_length=20,
        choices=Statut.choices,
        default=Statut.EN_ATTENTE
    )
    
    nombre_personnes = models.PositiveIntegerField('Nombre de personnes', default=1)
    commentaire = models.TextField('Commentaire', blank=True)
    
    date_inscription = models.DateTimeField('Date d\'inscription', auto_now_add=True)
    
    class Meta:
        verbose_name = 'Inscription à un événement'
        verbose_name_plural = 'Inscriptions aux événements'
        unique_together = ['evenement', 'participant']
    
    def __str__(self):
        return f"{self.participant.nom} - {self.evenement.nom}"


class Newsletter(models.Model):
    """
    Gestion des newsletters par mairie
    """
    
    class Statut(models.TextChoices):
        BROUILLON = 'brouillon', 'Brouillon'
        PLANIFIEE = 'planifiee', 'Planifiée'
        ENVOYEE = 'envoyee', 'Envoyée'
    
    mairie = models.ForeignKey(
        'mairies.Mairie',
        on_delete=models.CASCADE,
        related_name='newsletters'
    )
    
    auteur = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True
    )
    
    titre = models.CharField('Titre', max_length=255)
    contenu = models.TextField('Contenu')
    
    statut = models.CharField(
        'Statut',
        max_length=20,
        choices=Statut.choices,
        default=Statut.BROUILLON
    )
    
    date_envoi = models.DateTimeField('Date d\'envoi', null=True, blank=True)
    date_creation = models.DateTimeField('Date de création', auto_now_add=True)
    
    # Statistiques
    nombre_destinataires = models.PositiveIntegerField('Nombre de destinataires', default=0)
    nombre_ouvertures = models.PositiveIntegerField('Nombre d\'ouvertures', default=0)
    
    class Meta:
        verbose_name = 'Newsletter'
        verbose_name_plural = 'Newsletters'
        ordering = ['-date_creation']
    
    def __str__(self):
        return f"{self.titre} - {self.mairie.nom}"


class AbonneNewsletter(models.Model):
    """
    Abonnés à la newsletter d'une mairie
    """
    
    mairie = models.ForeignKey(
        'mairies.Mairie',
        on_delete=models.CASCADE,
        related_name='abonnes_newsletter'
    )
    
    email = models.EmailField('Email')
    nom = models.CharField('Nom', max_length=255, blank=True)
    
    est_actif = models.BooleanField('Actif', default=True)
    date_inscription = models.DateTimeField('Date d\'inscription', auto_now_add=True)
    date_desinscription = models.DateTimeField('Date de désinscription', null=True, blank=True)
    
    # Token pour désinscription
    token_desinscription = models.CharField('Token de désinscription', max_length=64, blank=True)
    
    class Meta:
        verbose_name = 'Abonné newsletter'
        verbose_name_plural = 'Abonnés newsletter'
        unique_together = ['mairie', 'email']
    
    def __str__(self):
        return f"{self.email} - {self.mairie.nom}"
    
    def save(self, *args, **kwargs):
        if not self.token_desinscription:
            import uuid
            self.token_desinscription = uuid.uuid4().hex
        super().save(*args, **kwargs)
