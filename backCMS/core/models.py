"""
Core - Modèles utilisateurs et configuration de base
"""
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.utils import timezone
import secrets


class UtilisateurManager(BaseUserManager):
    """Manager personnalisé pour le modèle Utilisateur"""
    
    def create_user(self, email, nom, password=None, **extra_fields):
        if not email:
            raise ValueError("L'adresse email est obligatoire")
        email = self.normalize_email(email)
        user = self.model(email=email, nom=nom, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, email, nom, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        extra_fields.setdefault('role', Utilisateur.Role.SUPER_ADMIN)
        return self.create_user(email, nom, password, **extra_fields)


class Utilisateur(AbstractBaseUser, PermissionsMixin):
    """
    Modèle Utilisateur personnalisé pour E-CMS
    Gère les différents rôles du CMS multisite
    """
    
    class Role(models.TextChoices):
        SUPER_ADMIN = 'super_admin', 'Super Administrateur'
        ADMIN_COMMUNE = 'admin_commune', 'Administrateur Commune'
        EDITEUR = 'editeur', 'Éditeur'
        MODERATEUR = 'moderateur', 'Modérateur'
    
    # Informations de base
    email = models.EmailField('Email', unique=True)
    nom = models.CharField('Nom complet', max_length=255)
    telephone = models.CharField('Téléphone', max_length=20, blank=True)
    photo = models.ImageField('Photo de profil', upload_to='utilisateurs/', blank=True, null=True)
    
    # Rôle
    role = models.CharField(
        'Rôle',
        max_length=20,
        choices=Role.choices,
        default=Role.EDITEUR
    )
    
    # Relation avec une commune (pour les admins/éditeurs de commune)
    commune = models.ForeignKey(
        'communes.Commune',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='utilisateurs',
        verbose_name='Commune rattachée'
    )
    
    # Statuts Django
    is_active = models.BooleanField('Actif', default=True)
    is_staff = models.BooleanField('Staff', default=False)
    email_verifie = models.BooleanField('Email vérifié', default=False)
    
    # Dates
    date_inscription = models.DateTimeField('Date d inscription', default=timezone.now)
    derniere_connexion = models.DateTimeField('Dernière connexion', null=True, blank=True)
    
    objects = UtilisateurManager()
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['nom']
    
    class Meta:
        verbose_name = 'Utilisateur'
        verbose_name_plural = 'Utilisateurs'
        ordering = ['-date_inscription']
    
    def __str__(self):
        return f"{self.nom} ({self.get_role_display()})"
    
    def is_super_admin(self):
        return self.role == self.Role.SUPER_ADMIN
    
    def is_admin_commune(self):
        return self.role == self.Role.ADMIN_COMMUNE
    
    def is_editeur(self):
        return self.role == self.Role.EDITEUR
    
    def peut_gerer_commune(self, commune):
        """Vérifie si l'utilisateur peut gérer une commune"""
        if self.is_super_admin():
            return True
        return self.commune == commune and self.role in [self.Role.ADMIN_COMMUNE, self.Role.EDITEUR]


class TokenVerification(models.Model):
    """Tokens pour vérification email et reset password"""
    
    class TypeToken(models.TextChoices):
        EMAIL_VERIFICATION = 'email_verification', 'Vérification Email'
        PASSWORD_RESET = 'password_reset', 'Réinitialisation Mot de Passe'
    
    utilisateur = models.ForeignKey(
        Utilisateur,
        on_delete=models.CASCADE,
        related_name='tokens_verification'
    )
    token = models.CharField('Token', max_length=64, unique=True)
    type_token = models.CharField('Type', max_length=20, choices=TypeToken.choices)
    date_creation = models.DateTimeField('Date création', auto_now_add=True)
    date_expiration = models.DateTimeField('Date expiration')
    est_utilise = models.BooleanField('Utilisé', default=False)
    
    class Meta:
        verbose_name = 'Token de vérification'
        verbose_name_plural = 'Tokens de vérification'
    
    @classmethod
    def generer_token(cls, utilisateur, type_token, duree_heures=24):
        from datetime import timedelta
        cls.objects.filter(
            utilisateur=utilisateur,
            type_token=type_token,
            est_utilise=False
        ).update(est_utilise=True)
        
        return cls.objects.create(
            utilisateur=utilisateur,
            token=secrets.token_urlsafe(48),
            type_token=type_token,
            date_expiration=timezone.now() + timedelta(hours=duree_heures)
        )
    
    def est_valide(self):
        return not self.est_utilise and self.date_expiration > timezone.now()


class ConfigurationPortail(models.Model):
    """Configuration du portail national (singleton)"""
    
    nom_portail = models.CharField('Nom du portail', max_length=255, default='E-CMS Cameroun')
    slogan = models.CharField('Slogan', max_length=500, blank=True)
    description = models.TextField('Description', blank=True)
    
    # Logo et images
    logo = models.ImageField('Logo', upload_to='portail/', blank=True, null=True)
    favicon = models.ImageField('Favicon', upload_to='portail/', blank=True, null=True)
    banniere = models.ImageField('Bannière', upload_to='portail/', blank=True, null=True)
    
    # Couleurs
    couleur_primaire = models.CharField('Couleur primaire', max_length=7, default='#0066CC')
    couleur_secondaire = models.CharField('Couleur secondaire', max_length=7, default='#004499')
    
    # Contact
    email_contact = models.EmailField('Email de contact', blank=True)
    telephone = models.CharField('Téléphone', max_length=20, blank=True)
    adresse = models.TextField('Adresse', blank=True)
    
    # Réseaux sociaux
    facebook = models.URLField('Facebook', blank=True)
    twitter = models.URLField('Twitter', blank=True)
    youtube = models.URLField('YouTube', blank=True)
    
    # SEO
    meta_titre = models.CharField('Meta titre', max_length=70, blank=True)
    meta_description = models.CharField('Meta description', max_length=160, blank=True)
    
    date_modification = models.DateTimeField('Dernière modification', auto_now=True)
    
    class Meta:
        verbose_name = 'Configuration du portail'
        verbose_name_plural = 'Configuration du portail'
    
    def __str__(self):
        return self.nom_portail
    
    def save(self, *args, **kwargs):
        # Assure qu'il n'y a qu'une seule instance
        self.pk = 1
        super().save(*args, **kwargs)
    
    @classmethod
    def get_instance(cls):
        instance, _ = cls.objects.get_or_create(pk=1)
        return instance
