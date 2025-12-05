"""
Événements - Agenda municipal et inscriptions
"""
from django.db import models
from django.conf import settings
from django.utils.text import slugify


class Evenement(models.Model):
    """Événements de l'agenda municipal"""
    
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
    
    commune = models.ForeignKey(
        'communes.Commune',
        on_delete=models.CASCADE,
        related_name='evenements'
    )
    organisateur = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='evenements_organises'
    )
    
    # Informations
    nom = models.CharField('Nom', max_length=255)
    slug = models.SlugField('Slug', max_length=255)
    description = models.TextField('Description')
    
    # Date et lieu
    date = models.DateField('Date')
    heure_debut = models.TimeField('Heure début')
    heure_fin = models.TimeField('Heure fin', null=True, blank=True)
    lieu = models.CharField('Lieu', max_length=255)
    adresse = models.TextField('Adresse complète', blank=True)
    
    # Coordonnées GPS
    latitude = models.DecimalField('Latitude', max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField('Longitude', max_digits=9, decimal_places=6, null=True, blank=True)
    
    # Catégorie et statut
    categorie = models.CharField('Catégorie', max_length=50, choices=Categorie.choices, default=Categorie.AUTRE)
    statut = models.CharField('Statut', max_length=20, choices=Statut.choices, default=Statut.PLANIFIE)
    
    # Image
    image = models.ImageField('Image', upload_to='evenements/', blank=True, null=True)
    
    # Contact
    contact_organisateur = models.CharField('Contact organisateur', max_length=255, blank=True)
    
    # Inscriptions
    inscription_requise = models.BooleanField('Inscription requise', default=False)
    places_limitees = models.BooleanField('Places limitées', default=False)
    nombre_places = models.PositiveIntegerField('Nombre de places', null=True, blank=True)
    
    # Affichage
    est_public = models.BooleanField('Public', default=True)
    est_mis_en_avant = models.BooleanField('Mis en avant', default=False)
    
    # Récurrence
    est_recurrent = models.BooleanField('Récurrent', default=False)
    recurrence = models.CharField('Récurrence', max_length=50, blank=True)
    
    # Dates
    date_creation = models.DateTimeField('Date création', auto_now_add=True)
    date_modification = models.DateTimeField('Dernière modification', auto_now=True)
    
    class Meta:
        verbose_name = 'Événement'
        verbose_name_plural = 'Événements'
        ordering = ['date', 'heure_debut']
        unique_together = ['commune', 'slug']
    
    def __str__(self):
        return f"{self.nom} - {self.date}"
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.nom)
        super().save(*args, **kwargs)
    
    def places_restantes(self):
        if self.places_limitees and self.nombre_places:
            inscrits = self.inscriptions.filter(statut='confirme').count()
            return max(0, self.nombre_places - inscrits)
        return None


class InscriptionEvenement(models.Model):
    """Inscriptions aux événements"""
    
    class Statut(models.TextChoices):
        EN_ATTENTE = 'en_attente', 'En attente'
        CONFIRME = 'confirme', 'Confirmé'
        ANNULE = 'annule', 'Annulé'
        PRESENT = 'present', 'Présent'
        ABSENT = 'absent', 'Absent'
    
    evenement = models.ForeignKey(Evenement, on_delete=models.CASCADE, related_name='inscriptions')
    
    # Participant (peut être anonyme)
    participant = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='inscriptions_evenements'
    )
    
    # Infos pour inscriptions anonymes
    nom = models.CharField('Nom', max_length=255, blank=True)
    email = models.EmailField('Email', blank=True)
    telephone = models.CharField('Téléphone', max_length=20, blank=True)
    
    nombre_personnes = models.PositiveIntegerField('Nombre de personnes', default=1)
    commentaire = models.TextField('Commentaire', blank=True)
    statut = models.CharField('Statut', max_length=20, choices=Statut.choices, default=Statut.EN_ATTENTE)
    
    date_inscription = models.DateTimeField('Date inscription', auto_now_add=True)
    
    class Meta:
        verbose_name = 'Inscription événement'
        verbose_name_plural = 'Inscriptions événements'
    
    def __str__(self):
        nom = self.participant.nom if self.participant else self.nom
        return f"{nom} - {self.evenement.nom}"


class RendezVous(models.Model):
    """Prise de rendez-vous en mairie"""
    
    class Statut(models.TextChoices):
        EN_ATTENTE = 'en_attente', 'En attente'
        CONFIRME = 'confirme', 'Confirmé'
        ANNULE = 'annule', 'Annulé'
        TERMINE = 'termine', 'Terminé'
        ABSENT = 'absent', 'Absent'
    
    commune = models.ForeignKey(
        'communes.Commune',
        on_delete=models.CASCADE,
        related_name='rendez_vous'
    )
    service = models.ForeignKey(
        'communes.ServiceMunicipal',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='rendez_vous'
    )
    demandeur = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='rendez_vous'
    )
    
    # Infos demandeur (si non connecté)
    nom_demandeur = models.CharField('Nom', max_length=255, blank=True)
    email_demandeur = models.EmailField('Email', blank=True)
    telephone_demandeur = models.CharField('Téléphone', max_length=20, blank=True)
    
    # Rendez-vous
    motif = models.CharField('Motif', max_length=255)
    description = models.TextField('Description', blank=True)
    
    date = models.DateField('Date')
    heure_debut = models.TimeField('Heure début')
    heure_fin = models.TimeField('Heure fin')
    
    statut = models.CharField('Statut', max_length=20, choices=Statut.choices, default=Statut.EN_ATTENTE)
    notes = models.TextField('Notes internes', blank=True)
    
    date_creation = models.DateTimeField('Date création', auto_now_add=True)
    
    class Meta:
        verbose_name = 'Rendez-vous'
        verbose_name_plural = 'Rendez-vous'
        ordering = ['date', 'heure_debut']
    
    def __str__(self):
        nom = self.demandeur.nom if self.demandeur else self.nom_demandeur
        return f"RDV {nom} - {self.date} {self.heure_debut}"
