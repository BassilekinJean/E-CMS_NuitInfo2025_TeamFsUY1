from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.utils import timezone


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
    Classe parente dont héritent tous les types d'utilisateurs
    """
    
    class Role(models.TextChoices):
        ADMIN_NATIONAL = 'admin_national', 'Administrateur National'
        AGENT_COMMUNAL = 'agent_communal', 'Agent Communal'
        CITOYEN = 'citoyen', 'Citoyen'
    
    # Attributs de base (selon le diagramme de classes)
    nom = models.CharField('Nom complet', max_length=255)
    email = models.EmailField('Email', unique=True)
    
    # Rôle de l'utilisateur
    role = models.CharField(
        'Rôle',
        max_length=20,
        choices=Role.choices,
        default=Role.CITOYEN
    )
    
    # Champs supplémentaires utiles
    telephone = models.CharField('Téléphone', max_length=20, blank=True)
    adresse = models.TextField('Adresse', blank=True)
    
    # Champs Django requis
    is_active = models.BooleanField('Actif', default=True)
    is_staff = models.BooleanField('Staff', default=False)
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
    
    def is_citoyen(self):
        """Vérifie si l'utilisateur est citoyen"""
        return self.role == self.Role.CITOYEN


class ProfilCitoyen(models.Model):
    """
    Profil étendu pour les citoyens
    Contient les informations spécifiques aux citoyens
    """
    
    utilisateur = models.OneToOneField(
        Utilisateur,
        on_delete=models.CASCADE,
        related_name='profil_citoyen',
        limit_choices_to={'role': Utilisateur.Role.CITOYEN}
    )
    
    # Informations personnelles
    date_naissance = models.DateField('Date de naissance', null=True, blank=True)
    lieu_naissance = models.CharField('Lieu de naissance', max_length=255, blank=True)
    numero_identite = models.CharField('Numéro d\'identité', max_length=50, blank=True)
    
    # Préférences de notification
    notification_email = models.BooleanField('Notifications par email', default=True)
    notification_sms = models.BooleanField('Notifications par SMS', default=False)
    abonne_newsletter = models.BooleanField('Abonné à la newsletter', default=False)
    
    class Meta:
        verbose_name = 'Profil Citoyen'
        verbose_name_plural = 'Profils Citoyens'
    
    def __str__(self):
        return f"Profil de {self.utilisateur.nom}"


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
