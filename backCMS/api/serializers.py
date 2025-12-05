"""
API Serializers - E-CMS
Serializers pour toutes les entités du CMS
"""
from rest_framework import serializers
from django.contrib.auth import get_user_model

from core.models import ConfigurationPortail, TokenVerification
from communes.models import (
    Region, Departement, Commune, DemandeCreationSite,
    ServiceMunicipal, EquipeMunicipale
)
from actualites.models import Actualite, PageCMS, FAQ, Newsletter, AbonneNewsletter
from evenements.models import Evenement, InscriptionEvenement, RendezVous
from services.models import Formulaire, Demarche, Signalement, Contact
from transparence.models import Projet, Deliberation, DocumentBudgetaire, DocumentOfficiel

Utilisateur = get_user_model()


# ===== CORE SERIALIZERS =====

class UtilisateurSerializer(serializers.ModelSerializer):
    """Serializer pour l'utilisateur (lecture)"""
    role_display = serializers.CharField(source='get_role_display', read_only=True)
    commune_nom = serializers.CharField(source='commune.nom', read_only=True)
    
    class Meta:
        model = Utilisateur
        fields = [
            'id', 'email', 'nom', 'telephone', 'photo',
            'role', 'role_display', 'commune', 'commune_nom',
            'is_active', 'email_verifie', 'date_inscription'
        ]
        read_only_fields = ['date_inscription', 'email_verifie']


class UtilisateurCreateSerializer(serializers.ModelSerializer):
    """Serializer pour création d'utilisateur"""
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = Utilisateur
        fields = ['email', 'nom', 'telephone', 'password', 'password_confirm']
    
    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError({
                'password_confirm': 'Les mots de passe ne correspondent pas'
            })
        return data
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        return Utilisateur.objects.create_user(**validated_data)


class UtilisateurUpdateSerializer(serializers.ModelSerializer):
    """Serializer pour mise à jour profil"""
    
    class Meta:
        model = Utilisateur
        fields = ['nom', 'telephone', 'photo']


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer pour changement de mot de passe"""
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, min_length=8)
    new_password_confirm = serializers.CharField(required=True)
    
    def validate(self, data):
        if data['new_password'] != data['new_password_confirm']:
            raise serializers.ValidationError({
                'new_password_confirm': 'Les mots de passe ne correspondent pas'
            })
        return data


class ConfigurationPortailSerializer(serializers.ModelSerializer):
    """Serializer pour la configuration du portail"""
    
    class Meta:
        model = ConfigurationPortail
        fields = '__all__'


# ===== COMMUNES SERIALIZERS =====

class RegionSerializer(serializers.ModelSerializer):
    """Serializer pour les régions"""
    nombre_departements = serializers.SerializerMethodField()
    
    class Meta:
        model = Region
        fields = ['id', 'nom', 'code', 'nombre_departements']
    
    def get_nombre_departements(self, obj):
        return obj.departements.count()


class DepartementSerializer(serializers.ModelSerializer):
    """Serializer pour les départements"""
    region_nom = serializers.CharField(source='region.nom', read_only=True)
    nombre_communes = serializers.SerializerMethodField()
    
    class Meta:
        model = Departement
        fields = ['id', 'nom', 'code', 'region', 'region_nom', 'nombre_communes']
    
    def get_nombre_communes(self, obj):
        return obj.communes.count()


class CommuneListSerializer(serializers.ModelSerializer):
    """Serializer liste des communes (léger)"""
    departement_nom = serializers.CharField(source='departement.nom', read_only=True)
    region_nom = serializers.CharField(source='departement.region.nom', read_only=True)
    statut_display = serializers.CharField(source='get_statut_display', read_only=True)
    
    class Meta:
        model = Commune
        fields = [
            'id', 'nom', 'slug', 'logo', 'departement_nom', 'region_nom',
            'population', 'statut', 'statut_display'
        ]


class CommuneDetailSerializer(serializers.ModelSerializer):
    """Serializer détail d'une commune"""
    departement_nom = serializers.CharField(source='departement.nom', read_only=True)
    region_nom = serializers.CharField(source='departement.region.nom', read_only=True)
    statut_display = serializers.CharField(source='get_statut_display', read_only=True)
    services = serializers.SerializerMethodField()
    equipe = serializers.SerializerMethodField()
    
    class Meta:
        model = Commune
        fields = '__all__'
    
    def get_services(self, obj):
        services = obj.services.filter(est_actif=True)
        return ServiceMunicipalSerializer(services, many=True).data
    
    def get_equipe(self, obj):
        equipe = obj.equipe.filter(est_visible=True)
        return EquipeMunicipaleSerializer(equipe, many=True).data


class ServiceMunicipalSerializer(serializers.ModelSerializer):
    """Serializer pour les services municipaux"""
    commune_nom = serializers.CharField(source='commune.nom', read_only=True)
    
    class Meta:
        model = ServiceMunicipal
        fields = '__all__'


class EquipeMunicipaleSerializer(serializers.ModelSerializer):
    """Serializer pour l'équipe municipale"""
    fonction_display = serializers.CharField(source='get_fonction_display', read_only=True)
    
    class Meta:
        model = EquipeMunicipale
        fields = '__all__'


class DemandeCreationSiteSerializer(serializers.ModelSerializer):
    """Serializer pour demande de création de site"""
    statut_display = serializers.CharField(source='get_statut_display', read_only=True)
    
    class Meta:
        model = DemandeCreationSite
        fields = '__all__'
        read_only_fields = ['statut', 'motif_rejet', 'notes_admin', 'date_traitement', 'commune_creee']


# ===== ACTUALITES SERIALIZERS =====

class ActualiteListSerializer(serializers.ModelSerializer):
    """Serializer liste des actualités"""
    commune_nom = serializers.CharField(source='commune.nom', read_only=True)
    auteur_nom = serializers.CharField(source='auteur.nom', read_only=True)
    categorie_display = serializers.CharField(source='get_categorie_display', read_only=True)
    
    class Meta:
        model = Actualite
        fields = [
            'id', 'titre', 'slug', 'resume', 'image_principale',
            'categorie', 'categorie_display', 'commune', 'commune_nom',
            'auteur_nom', 'est_publie', 'est_mis_en_avant',
            'date_publication', 'nombre_vues'
        ]


class ActualiteDetailSerializer(serializers.ModelSerializer):
    """Serializer détail d'une actualité"""
    commune_nom = serializers.CharField(source='commune.nom', read_only=True)
    auteur_nom = serializers.CharField(source='auteur.nom', read_only=True)
    categorie_display = serializers.CharField(source='get_categorie_display', read_only=True)
    
    class Meta:
        model = Actualite
        fields = '__all__'
        read_only_fields = ['auteur', 'nombre_vues', 'date_creation', 'date_modification', 'slug']
        extra_kwargs = {
            'slug': {'required': False, 'allow_blank': True},
            'resume': {'required': False, 'allow_blank': True},
            'image_principale': {'required': False},
        }


class PageCMSSerializer(serializers.ModelSerializer):
    """Serializer pour les pages CMS"""
    commune_nom = serializers.CharField(source='commune.nom', read_only=True)
    
    class Meta:
        model = PageCMS
        fields = '__all__'


class FAQSerializer(serializers.ModelSerializer):
    """Serializer pour les FAQ"""
    
    class Meta:
        model = FAQ
        fields = '__all__'


class NewsletterSerializer(serializers.ModelSerializer):
    """Serializer pour les newsletters"""
    statut_display = serializers.CharField(source='get_statut_display', read_only=True)
    
    class Meta:
        model = Newsletter
        fields = '__all__'


class AbonneNewsletterSerializer(serializers.ModelSerializer):
    """Serializer pour les abonnés newsletter"""
    
    class Meta:
        model = AbonneNewsletter
        fields = ['id', 'commune', 'email', 'nom', 'est_actif', 'date_inscription']
        read_only_fields = ['date_inscription', 'token_desinscription']


# ===== EVENEMENTS SERIALIZERS =====

class EvenementListSerializer(serializers.ModelSerializer):
    """Serializer liste des événements"""
    commune_nom = serializers.CharField(source='commune.nom', read_only=True)
    categorie_display = serializers.CharField(source='get_categorie_display', read_only=True)
    statut_display = serializers.CharField(source='get_statut_display', read_only=True)
    places_restantes = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Evenement
        fields = [
            'id', 'nom', 'slug', 'description', 'date', 'heure_debut', 'heure_fin',
            'lieu', 'categorie', 'categorie_display', 'statut', 'statut_display',
            'image', 'commune', 'commune_nom', 'inscription_requise',
            'places_limitees', 'nombre_places', 'places_restantes',
            'est_public', 'est_mis_en_avant'
        ]


class EvenementDetailSerializer(serializers.ModelSerializer):
    """Serializer détail d'un événement"""
    commune_nom = serializers.CharField(source='commune.nom', read_only=True)
    categorie_display = serializers.CharField(source='get_categorie_display', read_only=True)
    statut_display = serializers.CharField(source='get_statut_display', read_only=True)
    places_restantes = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Evenement
        fields = '__all__'
        read_only_fields = ['date_creation', 'date_modification', 'slug']
        extra_kwargs = {
            'slug': {'required': False, 'allow_blank': True},
            'organisateur': {'required': False},
            'heure_fin': {'required': False},
            'adresse': {'required': False},
        }


class InscriptionEvenementSerializer(serializers.ModelSerializer):
    """Serializer pour les inscriptions aux événements"""
    evenement_nom = serializers.CharField(source='evenement.nom', read_only=True)
    statut_display = serializers.CharField(source='get_statut_display', read_only=True)
    
    class Meta:
        model = InscriptionEvenement
        fields = '__all__'
        read_only_fields = ['date_inscription']


class RendezVousSerializer(serializers.ModelSerializer):
    """Serializer pour les rendez-vous"""
    commune_nom = serializers.CharField(source='commune.nom', read_only=True)
    service_nom = serializers.CharField(source='service.nom', read_only=True)
    statut_display = serializers.CharField(source='get_statut_display', read_only=True)
    
    class Meta:
        model = RendezVous
        fields = '__all__'
        read_only_fields = ['date_creation']


# ===== SERVICES SERIALIZERS =====

class FormulaireSerializer(serializers.ModelSerializer):
    """Serializer pour les formulaires"""
    type_display = serializers.CharField(source='get_type_display', read_only=True)
    
    class Meta:
        model = Formulaire
        fields = '__all__'


class DemarcheListSerializer(serializers.ModelSerializer):
    """Serializer liste des démarches"""
    commune_nom = serializers.CharField(source='commune.nom', read_only=True)
    formulaire_nom = serializers.CharField(source='formulaire.nom', read_only=True)
    statut_display = serializers.CharField(source='get_statut_display', read_only=True)
    
    class Meta:
        model = Demarche
        fields = [
            'id', 'numero_suivi', 'type', 'statut', 'statut_display',
            'commune', 'commune_nom', 'formulaire_nom',
            'nom_demandeur', 'date_demande', 'priorite'
        ]


class DemarcheDetailSerializer(serializers.ModelSerializer):
    """Serializer détail d'une démarche"""
    commune_nom = serializers.CharField(source='commune.nom', read_only=True)
    formulaire_nom = serializers.CharField(source='formulaire.nom', read_only=True)
    statut_display = serializers.CharField(source='get_statut_display', read_only=True)
    
    class Meta:
        model = Demarche
        fields = '__all__'
        read_only_fields = ['numero_suivi', 'date_demande']


class SignalementSerializer(serializers.ModelSerializer):
    """Serializer pour les signalements"""
    commune_nom = serializers.CharField(source='commune.nom', read_only=True)
    categorie_display = serializers.CharField(source='get_categorie_display', read_only=True)
    statut_display = serializers.CharField(source='get_statut_display', read_only=True)
    
    class Meta:
        model = Signalement
        fields = '__all__'
        read_only_fields = ['numero_suivi', 'date_signalement']


class ContactSerializer(serializers.ModelSerializer):
    """Serializer pour les messages de contact"""
    
    class Meta:
        model = Contact
        fields = '__all__'
        read_only_fields = ['date_envoi', 'est_lu', 'est_traite', 'reponse', 'date_reponse']


# ===== TRANSPARENCE SERIALIZERS =====

class ProjetListSerializer(serializers.ModelSerializer):
    """Serializer liste des projets"""
    commune_nom = serializers.CharField(source='commune.nom', read_only=True)
    categorie_display = serializers.CharField(source='get_categorie_display', read_only=True)
    statut_display = serializers.CharField(source='get_statut_display', read_only=True)
    
    class Meta:
        model = Projet
        fields = [
            'id', 'titre', 'slug', 'budget', 'budget_depense', 'avancement',
            'date_debut', 'date_fin', 'categorie', 'categorie_display',
            'statut', 'statut_display', 'commune', 'commune_nom',
            'image_principale', 'est_public', 'est_mis_en_avant'
        ]


class ProjetDetailSerializer(serializers.ModelSerializer):
    """Serializer détail d'un projet"""
    commune_nom = serializers.CharField(source='commune.nom', read_only=True)
    categorie_display = serializers.CharField(source='get_categorie_display', read_only=True)
    statut_display = serializers.CharField(source='get_statut_display', read_only=True)
    
    class Meta:
        model = Projet
        fields = '__all__'


class DeliberationSerializer(serializers.ModelSerializer):
    """Serializer pour les délibérations"""
    commune_nom = serializers.CharField(source='commune.nom', read_only=True)
    
    class Meta:
        model = Deliberation
        fields = '__all__'


class DocumentBudgetaireSerializer(serializers.ModelSerializer):
    """Serializer pour les documents budgétaires"""
    commune_nom = serializers.CharField(source='commune.nom', read_only=True)
    type_display = serializers.CharField(source='get_type_document_display', read_only=True)
    
    class Meta:
        model = DocumentBudgetaire
        fields = '__all__'


class DocumentOfficielSerializer(serializers.ModelSerializer):
    """Serializer pour les documents officiels"""
    commune_nom = serializers.CharField(source='commune.nom', read_only=True)
    type_display = serializers.CharField(source='get_type_document_display', read_only=True)
    
    class Meta:
        model = DocumentOfficiel
        fields = '__all__'


# ===== AUTH SERIALIZERS =====

class LoginSerializer(serializers.Serializer):
    """Serializer pour la connexion"""
    email = serializers.EmailField()
    password = serializers.CharField()


class PasswordResetRequestSerializer(serializers.Serializer):
    """Serializer pour demande de reset password"""
    email = serializers.EmailField()


class PasswordResetConfirmSerializer(serializers.Serializer):
    """Serializer pour confirmer reset password"""
    token = serializers.CharField()
    new_password = serializers.CharField(min_length=8)
    new_password_confirm = serializers.CharField()
    
    def validate(self, data):
        if data['new_password'] != data['new_password_confirm']:
            raise serializers.ValidationError({
                'new_password_confirm': 'Les mots de passe ne correspondent pas'
            })
        return data


class EmailVerificationSerializer(serializers.Serializer):
    """Serializer pour vérification email"""
    token = serializers.CharField()
