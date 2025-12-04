from rest_framework import serializers
from .models import Formulaire, DemarcheAdministrative, Signalement, RendezVous


# ===== Formulaires =====

class FormulaireListSerializer(serializers.ModelSerializer):
    """Serializer pour la liste des formulaires"""
    
    mairie_nom = serializers.CharField(source='mairie.nom', read_only=True)
    type_display = serializers.CharField(source='get_type_display', read_only=True)
    nombre_demarches = serializers.SerializerMethodField()
    
    class Meta:
        model = Formulaire
        fields = [
            'id', 'nom', 'type', 'type_display', 'description',
            'mairie_nom', 'est_actif', 'necessite_authentification',
            'nombre_demarches', 'date_creation'
        ]
    
    def get_nombre_demarches(self, obj):
        return obj.demarches.count()


class FormulaireDetailSerializer(serializers.ModelSerializer):
    """Serializer détaillé pour un formulaire"""
    
    mairie_nom = serializers.CharField(source='mairie.nom', read_only=True)
    type_display = serializers.CharField(source='get_type_display', read_only=True)
    
    class Meta:
        model = Formulaire
        fields = [
            'id', 'nom', 'type', 'type_display', 'description',
            'mairie', 'mairie_nom', 'champs_dynamiques',
            'necessite_authentification', 'est_actif', 'email_notification',
            'date_creation', 'date_modification'
        ]
        read_only_fields = ['mairie']


class FormulaireCreateSerializer(serializers.ModelSerializer):
    """Serializer pour création de formulaire"""
    
    class Meta:
        model = Formulaire
        fields = [
            'nom', 'type', 'description', 'champs_dynamiques',
            'necessite_authentification', 'est_actif', 'email_notification'
        ]


# ===== Démarches Administratives =====

class DemarcheListSerializer(serializers.ModelSerializer):
    """Serializer pour liste des démarches"""
    
    demandeur_nom = serializers.SerializerMethodField()
    formulaire_nom = serializers.CharField(source='formulaire.nom', read_only=True)
    statut_display = serializers.CharField(source='get_statut_display', read_only=True)
    
    class Meta:
        model = DemarcheAdministrative
        fields = [
            'id', 'type', 'numero_suivi', 'statut', 'statut_display',
            'demandeur_nom', 'formulaire_nom', 'date_demande', 'priorite'
        ]
    
    def get_demandeur_nom(self, obj):
        if obj.demandeur:
            return obj.demandeur.nom
        return obj.nom_demandeur or 'Anonyme'


class DemarcheDetailSerializer(serializers.ModelSerializer):
    """Serializer détaillé pour une démarche"""
    
    demandeur_nom = serializers.SerializerMethodField()
    formulaire_nom = serializers.CharField(source='formulaire.nom', read_only=True)
    agent_traitant_nom = serializers.CharField(source='agent_traitant.nom', read_only=True)
    statut_display = serializers.CharField(source='get_statut_display', read_only=True)
    mairie_nom = serializers.CharField(source='mairie.nom', read_only=True)
    
    class Meta:
        model = DemarcheAdministrative
        fields = [
            'id', 'mairie', 'mairie_nom', 'formulaire', 'formulaire_nom',
            'type', 'numero_suivi', 'statut', 'statut_display',
            'demandeur', 'demandeur_nom', 'donnees_formulaire',
            'nom_demandeur', 'email_demandeur', 'telephone_demandeur',
            'agent_traitant', 'agent_traitant_nom',
            'commentaire_agent', 'motif_rejet', 'priorite',
            'date_demande', 'date_prise_en_charge', 'date_traitement'
        ]
        read_only_fields = ['mairie', 'numero_suivi']
    
    def get_demandeur_nom(self, obj):
        if obj.demandeur:
            return obj.demandeur.nom
        return obj.nom_demandeur or 'Anonyme'


class DemarcheSoumissionSerializer(serializers.ModelSerializer):
    """Serializer pour soumettre une démarche"""
    
    class Meta:
        model = DemarcheAdministrative
        fields = [
            'formulaire', 'type', 'donnees_formulaire',
            'nom_demandeur', 'email_demandeur', 'telephone_demandeur'
        ]
    
    def create(self, validated_data):
        request = self.context.get('request')
        formulaire = validated_data.get('formulaire')
        
        demarche = DemarcheAdministrative.objects.create(
            mairie=formulaire.mairie,
            demandeur=request.user if request and request.user.is_authenticated else None,
            **validated_data
        )
        return demarche


class DemarcheTraitementSerializer(serializers.Serializer):
    """Serializer pour traiter une démarche"""
    
    statut = serializers.ChoiceField(choices=DemarcheAdministrative.Statut.choices)
    commentaire_agent = serializers.CharField(required=False, allow_blank=True)
    motif_rejet = serializers.CharField(required=False, allow_blank=True)


# ===== Signalements =====

class SignalementListSerializer(serializers.ModelSerializer):
    """Serializer pour liste des signalements"""
    
    signaleur_nom = serializers.SerializerMethodField()
    categorie_display = serializers.CharField(source='get_categorie_display', read_only=True)
    statut_display = serializers.CharField(source='get_statut_display', read_only=True)
    
    class Meta:
        model = Signalement
        fields = [
            'id', 'titre', 'categorie', 'categorie_display',
            'statut', 'statut_display', 'signaleur_nom',
            'numero_suivi', 'date_signalement'
        ]
    
    def get_signaleur_nom(self, obj):
        if obj.signaleur:
            return obj.signaleur.nom
        return 'Anonyme'


class SignalementDetailSerializer(serializers.ModelSerializer):
    """Serializer détaillé pour un signalement"""
    
    signaleur_nom = serializers.SerializerMethodField()
    agent_traitant_nom = serializers.CharField(source='agent_traitant.nom', read_only=True)
    categorie_display = serializers.CharField(source='get_categorie_display', read_only=True)
    statut_display = serializers.CharField(source='get_statut_display', read_only=True)
    mairie_nom = serializers.CharField(source='mairie.nom', read_only=True)
    
    class Meta:
        model = Signalement
        fields = [
            'id', 'mairie', 'mairie_nom', 'titre', 'description',
            'categorie', 'categorie_display', 'adresse',
            'latitude', 'longitude', 'photo', 'email_contact',
            'statut', 'statut_display', 'signaleur', 'signaleur_nom',
            'agent_traitant', 'agent_traitant_nom',
            'commentaire_resolution', 'numero_suivi',
            'date_signalement', 'date_resolution'
        ]
        read_only_fields = ['mairie', 'numero_suivi']
    
    def get_signaleur_nom(self, obj):
        if obj.signaleur:
            return obj.signaleur.nom
        return 'Anonyme'


class SignalementCreateSerializer(serializers.ModelSerializer):
    """Serializer pour créer un signalement"""
    
    class Meta:
        model = Signalement
        fields = [
            'titre', 'description', 'categorie',
            'adresse', 'latitude', 'longitude', 'photo', 'email_contact'
        ]
    
    def create(self, validated_data):
        request = self.context.get('request')
        mairie_id = self.context.get('mairie_id')
        
        from apps.mairies.models import Mairie
        mairie = Mairie.objects.get(pk=mairie_id)
        
        signalement = Signalement.objects.create(
            mairie=mairie,
            signaleur=request.user if request and request.user.is_authenticated else None,
            **validated_data
        )
        return signalement


class SignalementReponseSerializer(serializers.Serializer):
    """Serializer pour répondre à un signalement"""
    
    statut = serializers.ChoiceField(choices=Signalement.Statut.choices)
    commentaire_resolution = serializers.CharField(required=False, allow_blank=True)


# ===== Rendez-vous =====

class RendezVousListSerializer(serializers.ModelSerializer):
    """Serializer pour liste des rendez-vous"""
    
    citoyen_nom = serializers.CharField(source='citoyen.nom', read_only=True)
    service_nom = serializers.CharField(source='service.nom', read_only=True)
    statut_display = serializers.CharField(source='get_statut_display', read_only=True)
    
    class Meta:
        model = RendezVous
        fields = [
            'id', 'motif', 'date', 'heure_debut', 'heure_fin',
            'statut', 'statut_display', 'citoyen_nom', 'service_nom'
        ]


class RendezVousDetailSerializer(serializers.ModelSerializer):
    """Serializer détaillé pour un rendez-vous"""
    
    citoyen_nom = serializers.CharField(source='citoyen.nom', read_only=True)
    citoyen_email = serializers.CharField(source='citoyen.email', read_only=True)
    citoyen_telephone = serializers.CharField(source='citoyen.telephone', read_only=True)
    service_nom = serializers.CharField(source='service.nom', read_only=True)
    statut_display = serializers.CharField(source='get_statut_display', read_only=True)
    mairie_nom = serializers.CharField(source='mairie.nom', read_only=True)
    
    class Meta:
        model = RendezVous
        fields = [
            'id', 'mairie', 'mairie_nom', 'citoyen', 'citoyen_nom',
            'citoyen_email', 'citoyen_telephone',
            'service', 'service_nom', 'motif', 'description',
            'date', 'heure_debut', 'heure_fin',
            'statut', 'statut_display', 'notes', 'date_creation'
        ]
        read_only_fields = ['mairie', 'citoyen']


class RendezVousDemandeSerializer(serializers.ModelSerializer):
    """Serializer pour demander un rendez-vous"""
    
    class Meta:
        model = RendezVous
        fields = ['service', 'motif', 'description', 'date', 'heure_debut', 'heure_fin']
    
    def create(self, validated_data):
        request = self.context.get('request')
        
        rdv = RendezVous.objects.create(
            mairie=request.user.mairie,
            citoyen=request.user,
            **validated_data
        )
        return rdv


class RendezVousConfirmationSerializer(serializers.Serializer):
    """Serializer pour confirmer/annuler un rendez-vous"""
    
    statut = serializers.ChoiceField(choices=RendezVous.Statut.choices)
    notes = serializers.CharField(required=False, allow_blank=True)
