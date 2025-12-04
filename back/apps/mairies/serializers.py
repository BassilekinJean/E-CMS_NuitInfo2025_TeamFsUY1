from rest_framework import serializers
from .models import Mairie, DemandeCreationSite, ServiceMunicipal


class ServiceMunicipalSerializer(serializers.ModelSerializer):
    """Serializer pour les services municipaux"""
    
    class Meta:
        model = ServiceMunicipal
        fields = [
            'id', 'nom', 'description', 'responsable', 'telephone',
            'email', 'horaires', 'icone', 'ordre', 'est_actif'
        ]
        read_only_fields = ['id']


class MairieListSerializer(serializers.ModelSerializer):
    """Serializer léger pour la liste des mairies"""
    
    class Meta:
        model = Mairie
        fields = [
            'id', 'nom', 'slug', 'ville', 'region', 'logo',
            'statut', 'date_creation'
        ]


class MairieDetailSerializer(serializers.ModelSerializer):
    """Serializer complet pour le détail d'une mairie"""
    
    services = ServiceMunicipalSerializer(many=True, read_only=True)
    nombre_agents = serializers.SerializerMethodField()
    nombre_citoyens = serializers.SerializerMethodField()
    
    class Meta:
        model = Mairie
        fields = [
            'id', 'nom', 'slug', 'localisation', 'contact', 'logo',
            'code_postal', 'ville', 'region', 'pays',
            'site_web', 'email_contact', 'telephone',
            'couleur_primaire', 'couleur_secondaire', 'banniere',
            'description', 'historique', 'mot_du_maire',
            'nom_maire', 'photo_maire',
            'statut', 'horaires_ouverture',
            'latitude', 'longitude',
            'date_creation', 'date_modification', 'date_validation',
            'services', 'nombre_agents', 'nombre_citoyens'
        ]
        read_only_fields = ['id', 'slug', 'date_creation', 'date_modification', 'date_validation']
    
    def get_nombre_agents(self, obj):
        return obj.get_agents().count()
    
    def get_nombre_citoyens(self, obj):
        return obj.get_citoyens().count()


class MairiePublicSerializer(serializers.ModelSerializer):
    """Serializer pour les informations publiques d'une mairie"""
    
    services = ServiceMunicipalSerializer(many=True, read_only=True, source='services.filter(est_actif=True)')
    
    class Meta:
        model = Mairie
        fields = [
            'id', 'nom', 'slug', 'localisation', 'contact', 'logo',
            'ville', 'region',
            'site_web', 'email_contact', 'telephone',
            'couleur_primaire', 'couleur_secondaire', 'banniere',
            'description', 'historique', 'mot_du_maire',
            'nom_maire', 'photo_maire',
            'horaires_ouverture', 'latitude', 'longitude',
            'services'
        ]
    
    def get_services(self, obj):
        services = obj.services.filter(est_actif=True)
        return ServiceMunicipalSerializer(services, many=True).data


class DemandeCreationSiteSerializer(serializers.ModelSerializer):
    """Serializer pour les demandes de création de site"""
    
    class Meta:
        model = DemandeCreationSite
        fields = [
            'id', 'nom_mairie', 'localisation', 'contact', 'email', 'telephone',
            'nom_demandeur', 'fonction_demandeur', 'justificatif',
            'statut', 'motif_rejet', 'date_demande', 'date_traitement', 'mairie_creee'
        ]
        read_only_fields = ['id', 'statut', 'motif_rejet', 'date_demande', 'date_traitement', 'mairie_creee']


class DemandeCreationSiteAdminSerializer(serializers.ModelSerializer):
    """Serializer admin pour traiter les demandes"""
    
    class Meta:
        model = DemandeCreationSite
        fields = [
            'id', 'nom_mairie', 'localisation', 'contact', 'email', 'telephone',
            'nom_demandeur', 'fonction_demandeur', 'justificatif',
            'statut', 'motif_rejet', 'date_demande', 'date_traitement', 'mairie_creee'
        ]
        read_only_fields = ['id', 'date_demande']


class MairieCreateSerializer(serializers.ModelSerializer):
    """Serializer pour la création d'une mairie"""
    
    class Meta:
        model = Mairie
        fields = [
            'nom', 'localisation', 'contact', 'logo',
            'code_postal', 'ville', 'region', 'pays',
            'email_contact', 'telephone'
        ]
