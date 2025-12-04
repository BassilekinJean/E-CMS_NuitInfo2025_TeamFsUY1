from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.utils import timezone
from django.conf import settings
import uuid
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
        extra_fields.setdefault('role', Utilisateur.Role.ADMIN_NATIONAL)
        return self.create_user(email, nom, password, **extra_fields)


class Utilisateur(AbstractBaseUser, PermissionsMixin):
    """
    Modèle Utilisateur de base pour E-CMS
    Uniquement 2 rôles : Admin National et Agent Communal
    """
    
    class Role(models.TextChoices):
        ADMIN_NATIONAL = 'admin_national', 'Administrateur National'
        AGENT_COMMUNAL = 'agent_communal', 'Agent Communal'
    
    # Attributs de base (selon le diagramme de classes)
    nom = models.CharField('Nom complet', max_length=255)
    email = models.EmailField('Email', unique=True)
    
    # Rôle de l'utilisateur (pas de valeur par défaut)
    role = models.CharField(
        'Rôle',
        max_length=20,
        choices=Role.choices,
        null=False,
        blank=False
    )
    
    # Champs supplémentaires utiles
    telephone = models.CharField('Téléphone', max_length=20, blank=True)
    adresse = models.TextField('Adresse', blank=True)
    
    # Champs Django requis
    is_active = models.BooleanField('Actif', default=True)
    is_staff = models.BooleanField('Staff', default=False)
    email_verifie = models.BooleanField('Email vérifié', default=False)
    date_inscription = models.DateTimeField('Date d\'inscription', default=timezone.now)
    derniere_connexion = models.DateTimeField('Dernière connexion', null=True, blank=True)
    
    # Relation avec la mairie (pour les agents communaux et citoyens)
    mairie = models.ForeignKey(
        'mairies.Mairie',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='utilisateurs',
        verbose_name='Mairie rattachée'
    )
    
    objects = UtilisateurManager()
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['nom']
    
    class Meta:
        verbose_name = 'Utilisateur'
        verbose_name_plural = 'Utilisateurs'
        ordering = ['-date_inscription']
    
    def __str__(self):
        return f"{self.nom} ({self.get_role_display()})"
    
    def is_admin_national(self):
        """Vérifie si l'utilisateur est administrateur national"""
        return self.role == self.Role.ADMIN_NATIONAL
    
    def is_agent_communal(self):
        """Vérifie si l'utilisateur est agent communal"""
        return self.role == self.Role.AGENT_COMMUNAL


class ProfilAgentCommunal(models.Model):
    """
    Profil étendu pour les agents communaux
    Contient les informations spécifiques aux agents de mairie
    """
    
    utilisateur = models.OneToOneField(
        Utilisateur,
        on_delete=models.CASCADE,
        related_name='profil_agent',
        limit_choices_to={'role': Utilisateur.Role.AGENT_COMMUNAL}
    )
    
    # Informations professionnelles
    poste = models.CharField('Poste', max_length=255, blank=True)
    service = models.CharField('Service', max_length=255, blank=True)
    matricule = models.CharField('Matricule', max_length=50, blank=True)
    
    # Permissions spécifiques
    peut_gerer_contenu = models.BooleanField('Peut gérer le contenu', default=True)
    peut_gerer_formulaires = models.BooleanField('Peut gérer les formulaires', default=True)
    peut_gerer_projets = models.BooleanField('Peut gérer les projets', default=True)
    peut_gerer_evenements = models.BooleanField('Peut gérer les événements', default=True)
    peut_gerer_documents = models.BooleanField('Peut gérer les documents', default=True)
    
    date_prise_fonction = models.DateField('Date de prise de fonction', null=True, blank=True)
    
    class Meta:
        verbose_name = 'Profil Agent Communal'
        verbose_name_plural = 'Profils Agents Communaux'
    
    def __str__(self):
        return f"Agent {self.utilisateur.nom} - {self.poste}"


class TokenVerification(models.Model):
    """
    Modèle pour les tokens de vérification (email et reset password)
    """
    
    class TypeToken(models.TextChoices):
        EMAIL_VERIFICATION = 'email_verification', 'Vérification Email'
        PASSWORD_RESET = 'password_reset', 'Réinitialisation Mot de Passe'
    
    utilisateur = models.ForeignKey(
        Utilisateur,
        on_delete=models.CASCADE,
        related_name='tokens_verification'
    )
    
    token = models.CharField('Token', max_length=64, unique=True)
    type_token = models.CharField(
        'Type de token',
        max_length=20,
        choices=TypeToken.choices
    )
    
    date_creation = models.DateTimeField('Date de création', auto_now_add=True)
    date_expiration = models.DateTimeField('Date d\'expiration')
    est_utilise = models.BooleanField('Utilisé', default=False)
    
    class Meta:
        verbose_name = 'Token de vérification'
        verbose_name_plural = 'Tokens de vérification'
        ordering = ['-date_creation']
    
    def __str__(self):
        return f"{self.get_type_token_display()} - {self.utilisateur.email}"
    
    @classmethod
    def generer_token(cls, utilisateur, type_token):
        """Génère un nouveau token pour l'utilisateur"""
        from datetime import timedelta
        
        # Invalider les anciens tokens du même type
        cls.objects.filter(
            utilisateur=utilisateur,
            type_token=type_token,
            est_utilise=False
        ).update(est_utilise=True)
        
        # Définir la durée d'expiration selon le type
        if type_token == cls.TypeToken.EMAIL_VERIFICATION:
            expiry_hours = getattr(settings, 'EMAIL_VERIFICATION_TOKEN_EXPIRY', 24)
        else:
            expiry_hours = getattr(settings, 'PASSWORD_RESET_TOKEN_EXPIRY', 1)
        
        # Créer le nouveau token
        token = cls.objects.create(
            utilisateur=utilisateur,
            token=secrets.token_urlsafe(48),
            type_token=type_token,
            date_expiration=timezone.now() + timedelta(hours=expiry_hours)
        )
        
        return token
    
    def est_valide(self):
        """Vérifie si le token est encore valide"""
        return not self.est_utilise and self.date_expiration > timezone.now()
    
    def marquer_utilise(self):
        """Marque le token comme utilisé"""
        self.est_utilise = True
        self.save(update_fields=['est_utilise'])
