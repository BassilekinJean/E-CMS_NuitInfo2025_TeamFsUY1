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
    mairie_nom = serializers.CharField(source='mairie.nom', read_only=True)
    statut_display = serializers.CharField(source='get_statut_display', read_only=True)
    
    class Meta:
        model = DemarcheAdministrative
        fields = [
            'id', 'numero_suivi', 'type', 'formulaire_nom', 'mairie_nom',
            'demandeur_nom', 'statut', 'statut_display', 'date_demande'
        ]
    
    def get_demandeur_nom(self, obj):
        if obj.demandeur:
            return obj.demandeur.get_full_name()
        return obj.nom_demandeur or 'Anonyme'


class DemarcheDetailSerializer(serializers.ModelSerializer):
    """Serializer détaillé pour une démarche"""
    
    demandeur = serializers.SerializerMethodField()
    agent_traitant_nom = serializers.CharField(source='agent_traitant.get_full_name', read_only=True)
    formulaire = FormulaireDetailSerializer(read_only=True)
    statut_display = serializers.CharField(source='get_statut_display', read_only=True)
    
    class Meta:
        model = DemarcheAdministrative
        fields = [
            'id', 'numero_suivi', 'type', 'formulaire', 'mairie',
            'demandeur', 'statut', 'statut_display', 'donnees_formulaire',
            'nom_demandeur', 'email_demandeur', 'telephone_demandeur',
            'commentaire_agent', 'motif_rejet', 'agent_traitant', 'agent_traitant_nom',
            'priorite', 'date_demande', 'date_prise_en_charge', 'date_traitement'
        ]
    
    def get_demandeur(self, obj):
        if obj.demandeur:
            return {
                'id': obj.demandeur.id,
                'nom_complet': obj.demandeur.get_full_name(),
                'email': obj.demandeur.email
            }
        return {
            'nom': obj.nom_demandeur,
            'email': obj.email_demandeur,
            'telephone': obj.telephone_demandeur
        }


class DemarcheSoumissionSerializer(serializers.ModelSerializer):
    """Serializer pour soumettre une démarche"""
    
    class Meta:
        model = DemarcheAdministrative
        fields = [
            'formulaire', 'donnees_formulaire',
            'nom_demandeur', 'email_demandeur', 'telephone_demandeur'
        ]
    
    def validate(self, data):
        formulaire = data.get('formulaire')
        donnees = data.get('donnees_formulaire', {})
        
        if formulaire and formulaire.champs_dynamiques:
            for champ in formulaire.champs_dynamiques:
                if champ.get('obligatoire') and champ.get('nom') not in donnees:
                    raise serializers.ValidationError(
                        f"Le champ '{champ.get('label', champ.get('nom'))}' est obligatoire"
                    )
        
        return data
    
    def create(self, validated_data):
        request = self.context.get('request')
        formulaire = validated_data.get('formulaire')
        
        if request and request.user.is_authenticated:
            validated_data['demandeur'] = request.user
        
        validated_data['mairie'] = formulaire.mairie
        validated_data['type'] = formulaire.get_type_display()
        
        return super().create(validated_data)


class DemarcheTraitementSerializer(serializers.Serializer):
    """Serializer pour traiter une démarche"""
    
    statut = serializers.ChoiceField(choices=DemarcheAdministrative.Statut.choices)
    commentaire = serializers.CharField(required=False, allow_blank=True)
    motif_rejet = serializers.CharField(required=False, allow_blank=True)


# ===== Signalements =====

class SignalementListSerializer(serializers.ModelSerializer):
    """Serializer pour liste des signalements"""
    
    signaleur_nom = serializers.SerializerMethodField()
    mairie_nom = serializers.CharField(source='mairie.nom', read_only=True)
    categorie_display = serializers.CharField(source='get_categorie_display', read_only=True)
    statut_display = serializers.CharField(source='get_statut_display', read_only=True)
    
    class Meta:
        model = Signalement
        fields = [
            'id', 'numero_suivi', 'titre', 'categorie', 'categorie_display',
            'statut', 'statut_display', 'signaleur_nom', 'mairie_nom', 'date_signalement'
        ]
    
    def get_signaleur_nom(self, obj):
        if obj.signaleur:
            return obj.signaleur.get_full_name()
        return 'Anonyme'


class SignalementDetailSerializer(serializers.ModelSerializer):
    """Serializer détaillé pour un signalement"""
    
    signaleur = serializers.SerializerMethodField()
    agent_traitant_nom = serializers.CharField(source='agent_traitant.get_full_name', read_only=True)
    categorie_display = serializers.CharField(source='get_categorie_display', read_only=True)
    statut_display = serializers.CharField(source='get_statut_display', read_only=True)
    
    class Meta:
        model = Signalement
        fields = [
            'id', 'numero_suivi', 'titre', 'description', 'categorie', 'categorie_display',
            'statut', 'statut_display', 'signaleur', 'mairie',
            'adresse', 'latitude', 'longitude', 'photo', 'email_contact',
            'agent_traitant', 'agent_traitant_nom', 'commentaire_resolution',
            'date_signalement', 'date_resolution'
        ]
    
    def get_signaleur(self, obj):
        if obj.signaleur:
            return {
                'id': obj.signaleur.id,
                'nom_complet': obj.signaleur.get_full_name(),
                'email': obj.signaleur.email
            }
        return {'email': obj.email_contact}


class SignalementCreateSerializer(serializers.ModelSerializer):
    """Serializer pour créer un signalement"""
    
    class Meta:
        model = Signalement
        fields = [
            'titre', 'description', 'categorie', 'mairie',
            'adresse', 'latitude', 'longitude', 'photo', 'email_contact'
        ]
    
    def create(self, validated_data):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            validated_data['signaleur'] = request.user
        return super().create(validated_data)


class SignalementReponseSerializer(serializers.Serializer):
    """Serializer pour répondre à un signalement"""
    
    statut = serializers.ChoiceField(choices=Signalement.Statut.choices)
    commentaire_resolution = serializers.CharField(required=False, allow_blank=True)


# ===== Rendez-vous =====

class RendezVousListSerializer(serializers.ModelSerializer):
    """Serializer pour liste des rendez-vous"""
    
    citoyen_nom = serializers.CharField(source='citoyen.get_full_name', read_only=True)
    service_nom = serializers.CharField(source='service.nom', read_only=True)
    statut_display = serializers.CharField(source='get_statut_display', read_only=True)
    
    class Meta:
        model = RendezVous
        fields = [
            'id', 'service_nom', 'citoyen_nom', 'motif',
            'date', 'heure_debut', 'heure_fin', 'statut', 'statut_display'
        ]


class RendezVousDetailSerializer(serializers.ModelSerializer):
    """Serializer détaillé pour un rendez-vous"""
    
    citoyen = serializers.SerializerMethodField()
    service = serializers.SerializerMethodField()
    statut_display = serializers.CharField(source='get_statut_display', read_only=True)
    
    class Meta:
        model = RendezVous
        fields = [
            'id', 'service', 'citoyen', 'motif', 'description',
            'date', 'heure_debut', 'heure_fin', 'statut', 'statut_display',
            'notes', 'date_creation'
        ]
    
    def get_citoyen(self, obj):
        return {
            'id': obj.citoyen.id,
            'nom_complet': obj.citoyen.get_full_name(),
            'email': obj.citoyen.email,
            'telephone': getattr(obj.citoyen, 'telephone', '')
        }
    
    def get_service(self, obj):
        if obj.service:
            return {
                'id': obj.service.id,
                'nom': obj.service.nom,
                'mairie': obj.service.mairie.nom
            }
        return None


class RendezVousDemandeSerializer(serializers.ModelSerializer):
    """Serializer pour demander un rendez-vous"""
    
    class Meta:
        model = RendezVous
        fields = ['mairie', 'service', 'motif', 'description', 'date', 'heure_debut', 'heure_fin']
    
    def validate(self, data):
        from django.utils import timezone
        if data['date'] < timezone.now().date():
            raise serializers.ValidationError(
                "La date du rendez-vous doit être dans le futur"
            )
        if data['heure_fin'] <= data['heure_debut']:
            raise serializers.ValidationError(
                "L'heure de fin doit être après l'heure de début"
            )
        return data
    
    def create(self, validated_data):
        request = self.context.get('request')
        validated_data['citoyen'] = request.user
        return super().create(validated_data)


class RendezVousConfirmationSerializer(serializers.Serializer):
    """Serializer pour confirmer/annuler un rendez-vous"""
    
    statut = serializers.ChoiceField(choices=RendezVous.Statut.choices)
    notes = serializers.CharField(required=False, allow_blank=True)
