from rest_framework import serializers
from .models import Formulaire, ChampFormulaire, DemarcheAdministrative, Signalement, RendezVous


# ===== Formulaires =====

class ChampFormulaireSerializer(serializers.ModelSerializer):
    """Serializer pour les champs de formulaire"""
    
    class Meta:
        model = ChampFormulaire
        fields = [
            'id', 'nom', 'label', 'type_champ', 'obligatoire',
            'options', 'placeholder', 'valeur_defaut', 'ordre'
        ]


class FormulaireListSerializer(serializers.ModelSerializer):
    """Serializer pour la liste des formulaires"""
    
    mairie_nom = serializers.CharField(source='mairie.nom', read_only=True)
    nombre_champs = serializers.SerializerMethodField()
    nombre_demarches = serializers.SerializerMethodField()
    
    class Meta:
        model = Formulaire
        fields = [
            'id', 'titre', 'description', 'mairie_nom', 'est_actif',
            'nombre_champs', 'nombre_demarches', 'date_creation'
        ]
    
    def get_nombre_champs(self, obj):
        return obj.champs.count()
    
    def get_nombre_demarches(self, obj):
        return obj.demarches.count()


class FormulaireDetailSerializer(serializers.ModelSerializer):
    """Serializer détaillé pour un formulaire"""
    
    champs = ChampFormulaireSerializer(many=True, read_only=True)
    mairie_nom = serializers.CharField(source='mairie.nom', read_only=True)
    
    class Meta:
        model = Formulaire
        fields = [
            'id', 'titre', 'description', 'mairie', 'mairie_nom',
            'est_actif', 'champs', 'date_creation', 'date_modification'
        ]
        read_only_fields = ['mairie']


class FormulaireCreateSerializer(serializers.ModelSerializer):
    """Serializer pour création de formulaire avec champs"""
    
    champs = ChampFormulaireSerializer(many=True, required=False)
    
    class Meta:
        model = Formulaire
        fields = ['titre', 'description', 'est_actif', 'champs']
    
    def create(self, validated_data):
        champs_data = validated_data.pop('champs', [])
        formulaire = Formulaire.objects.create(**validated_data)
        
        for ordre, champ_data in enumerate(champs_data, start=1):
            ChampFormulaire.objects.create(
                formulaire=formulaire,
                ordre=champ_data.get('ordre', ordre),
                **champ_data
            )
        
        return formulaire


# ===== Démarches Administratives =====

class DemarcheListSerializer(serializers.ModelSerializer):
    """Serializer pour liste des démarches"""
    
    citoyen_nom = serializers.CharField(source='citoyen.get_full_name', read_only=True)
    formulaire_titre = serializers.CharField(source='formulaire.titre', read_only=True)
    mairie_nom = serializers.CharField(source='mairie.nom', read_only=True)
    
    class Meta:
        model = DemarcheAdministrative
        fields = [
            'id', 'formulaire_titre', 'mairie_nom', 'citoyen_nom',
            'statut', 'date_soumission', 'date_traitement'
        ]


class DemarcheDetailSerializer(serializers.ModelSerializer):
    """Serializer détaillé pour une démarche"""
    
    citoyen = serializers.SerializerMethodField()
    formulaire = FormulaireDetailSerializer(read_only=True)
    traite_par_nom = serializers.CharField(source='traite_par.get_full_name', read_only=True)
    
    class Meta:
        model = DemarcheAdministrative
        fields = [
            'id', 'formulaire', 'mairie', 'citoyen', 'statut',
            'donnees', 'documents_joints', 'commentaire_agent',
            'traite_par', 'traite_par_nom', 'date_soumission', 'date_traitement'
        ]
    
    def get_citoyen(self, obj):
        return {
            'id': obj.citoyen.id,
            'nom_complet': obj.citoyen.get_full_name(),
            'email': obj.citoyen.email
        }


class DemarcheSoumissionSerializer(serializers.ModelSerializer):
    """Serializer pour soumettre une démarche"""
    
    class Meta:
        model = DemarcheAdministrative
        fields = ['formulaire', 'donnees', 'documents_joints']
    
    def validate(self, data):
        formulaire = data.get('formulaire')
        donnees = data.get('donnees', {})
        
        # Vérifier les champs obligatoires
        champs_obligatoires = formulaire.champs.filter(obligatoire=True)
        for champ in champs_obligatoires:
            if champ.nom not in donnees or not donnees[champ.nom]:
                raise serializers.ValidationError(
                    f"Le champ '{champ.label}' est obligatoire"
                )
        
        return data
    
    def create(self, validated_data):
        request = self.context.get('request')
        validated_data['citoyen'] = request.user
        validated_data['mairie'] = validated_data['formulaire'].mairie
        return super().create(validated_data)


class DemarcheTraitementSerializer(serializers.Serializer):
    """Serializer pour traiter une démarche"""
    
    statut = serializers.ChoiceField(choices=DemarcheAdministrative.Statut.choices)
    commentaire = serializers.CharField(required=False, allow_blank=True)


# ===== Signalements =====

class SignalementListSerializer(serializers.ModelSerializer):
    """Serializer pour liste des signalements"""
    
    citoyen_nom = serializers.CharField(source='citoyen.get_full_name', read_only=True)
    mairie_nom = serializers.CharField(source='mairie.nom', read_only=True)
    
    class Meta:
        model = Signalement
        fields = [
            'id', 'titre', 'categorie', 'statut', 'citoyen_nom',
            'mairie_nom', 'date_signalement'
        ]


class SignalementDetailSerializer(serializers.ModelSerializer):
    """Serializer détaillé pour un signalement"""
    
    citoyen = serializers.SerializerMethodField()
    traite_par_nom = serializers.CharField(source='traite_par.get_full_name', read_only=True)
    
    class Meta:
        model = Signalement
        fields = [
            'id', 'titre', 'description', 'categorie', 'statut',
            'citoyen', 'mairie', 'localisation', 'latitude', 'longitude',
            'photo', 'reponse', 'traite_par', 'traite_par_nom',
            'date_signalement', 'date_traitement'
        ]
    
    def get_citoyen(self, obj):
        return {
            'id': obj.citoyen.id,
            'nom_complet': obj.citoyen.get_full_name(),
            'email': obj.citoyen.email
        }


class SignalementCreateSerializer(serializers.ModelSerializer):
    """Serializer pour créer un signalement"""
    
    class Meta:
        model = Signalement
        fields = [
            'titre', 'description', 'categorie', 'mairie',
            'localisation', 'latitude', 'longitude', 'photo'
        ]
    
    def create(self, validated_data):
        request = self.context.get('request')
        validated_data['citoyen'] = request.user
        return super().create(validated_data)


class SignalementReponseSerializer(serializers.Serializer):
    """Serializer pour répondre à un signalement"""
    
    statut = serializers.ChoiceField(choices=Signalement.Statut.choices)
    reponse = serializers.CharField(required=False, allow_blank=True)


# ===== Rendez-vous =====

class RendezVousListSerializer(serializers.ModelSerializer):
    """Serializer pour liste des rendez-vous"""
    
    citoyen_nom = serializers.CharField(source='citoyen.get_full_name', read_only=True)
    service_nom = serializers.CharField(source='service.nom', read_only=True)
    
    class Meta:
        model = RendezVous
        fields = [
            'id', 'service_nom', 'citoyen_nom', 'objet',
            'date_heure', 'statut', 'date_demande'
        ]


class RendezVousDetailSerializer(serializers.ModelSerializer):
    """Serializer détaillé pour un rendez-vous"""
    
    citoyen = serializers.SerializerMethodField()
    service = serializers.SerializerMethodField()
    confirme_par_nom = serializers.CharField(source='confirme_par.get_full_name', read_only=True)
    
    class Meta:
        model = RendezVous
        fields = [
            'id', 'service', 'citoyen', 'objet', 'description',
            'date_heure', 'duree_estimee', 'statut', 'notes_agent',
            'confirme_par', 'confirme_par_nom', 'date_demande'
        ]
    
    def get_citoyen(self, obj):
        return {
            'id': obj.citoyen.id,
            'nom_complet': obj.citoyen.get_full_name(),
            'email': obj.citoyen.email,
            'telephone': obj.citoyen.telephone
        }
    
    def get_service(self, obj):
        return {
            'id': obj.service.id,
            'nom': obj.service.nom,
            'mairie': obj.service.mairie.nom
        }


class RendezVousDemandeSerializer(serializers.ModelSerializer):
    """Serializer pour demander un rendez-vous"""
    
    class Meta:
        model = RendezVous
        fields = ['service', 'objet', 'description', 'date_heure']
    
    def validate_date_heure(self, value):
        from django.utils import timezone
        if value < timezone.now():
            raise serializers.ValidationError(
                "La date du rendez-vous doit être dans le futur"
            )
        return value
    
    def create(self, validated_data):
        request = self.context.get('request')
        validated_data['citoyen'] = request.user
        return super().create(validated_data)


class RendezVousConfirmationSerializer(serializers.Serializer):
    """Serializer pour confirmer/annuler un rendez-vous"""
    
    statut = serializers.ChoiceField(choices=RendezVous.Statut.choices)
    notes = serializers.CharField(required=False, allow_blank=True)
