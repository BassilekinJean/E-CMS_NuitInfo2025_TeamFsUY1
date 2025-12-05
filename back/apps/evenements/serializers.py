from rest_framework import serializers
from django.db import models
from .models import Evenement, InscriptionEvenement, Newsletter, AbonneNewsletter


# ===== Événements =====

class EvenementListSerializer(serializers.ModelSerializer):
    """Serializer pour la liste des événements"""
    
    mairie_nom = serializers.CharField(source='mairie.nom', read_only=True)
    categorie_display = serializers.CharField(source='get_categorie_display', read_only=True)
    statut_display = serializers.CharField(source='get_statut_display', read_only=True)
    nombre_inscrits = serializers.SerializerMethodField()
    places_restantes = serializers.SerializerMethodField()
    
    class Meta:
        model = Evenement
        fields = [
            'id', 'nom', 'slug', 'image', 'lieu', 'mairie', 'mairie_nom',
            'categorie', 'categorie_display', 'statut', 'statut_display',
            'date', 'heure_debut', 'heure_fin', 'nombre_places',
            'nombre_inscrits', 'places_restantes', 'est_public', 'est_mis_en_avant'
        ]
    
    def get_nombre_inscrits(self, obj):
        return obj.inscriptions.filter(statut=InscriptionEvenement.Statut.CONFIRME).count()
    
    def get_places_restantes(self, obj):
        if obj.nombre_places:
            inscrits = self.get_nombre_inscrits(obj)
            return max(0, obj.nombre_places - inscrits)
        return None


class EvenementDetailSerializer(serializers.ModelSerializer):
    """Serializer détaillé pour un événement"""
    
    mairie_nom = serializers.CharField(source='mairie.nom', read_only=True)
    categorie_display = serializers.CharField(source='get_categorie_display', read_only=True)
    statut_display = serializers.CharField(source='get_statut_display', read_only=True)
    organisateur_info = serializers.SerializerMethodField()
    nombre_inscrits = serializers.SerializerMethodField()
    places_restantes = serializers.SerializerMethodField()
    inscriptions = serializers.SerializerMethodField()
    
    class Meta:
        model = Evenement
        fields = [
            'id', 'nom', 'slug', 'description', 'image', 'lieu',
            'latitude', 'longitude', 'mairie', 'mairie_nom', 'organisateur', 'organisateur_info',
            'contact_organisateur', 'categorie', 'categorie_display', 'statut', 'statut_display',
            'date', 'heure_debut', 'heure_fin', 'nombre_places',
            'nombre_inscrits', 'places_restantes', 'inscription_requise', 'places_limitees',
            'est_public', 'est_mis_en_avant', 'est_recurrent', 'recurrence',
            'inscriptions', 'date_creation', 'date_modification'
        ]
        read_only_fields = ['mairie', 'organisateur']
    
    def get_organisateur_info(self, obj):
        if obj.organisateur:
            return {
                'id': obj.organisateur.id,
                'nom': obj.organisateur.nom,
                'email': obj.organisateur.email
            }
        return None
    
    def get_nombre_inscrits(self, obj):
        return obj.inscriptions.filter(statut=InscriptionEvenement.Statut.CONFIRME).count()
    
    def get_places_restantes(self, obj):
        if obj.nombre_places:
            inscrits = self.get_nombre_inscrits(obj)
            return max(0, obj.nombre_places - inscrits)
        return None
    
    def get_inscriptions(self, obj):
        # Seulement pour les agents
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            if request.user.is_admin_national() or request.user.is_agent_communal():
                inscriptions = obj.inscriptions.all()
                return InscriptionEvenementSerializer(inscriptions, many=True).data
        return None


class EvenementCreateSerializer(serializers.ModelSerializer):
    """Serializer pour création d'événement"""
    
    class Meta:
        model = Evenement
        fields = [
            'nom', 'description', 'image', 'lieu',
            'latitude', 'longitude', 'categorie', 'statut',
            'date', 'heure_debut', 'heure_fin',
            'nombre_places', 'inscription_requise', 'places_limitees',
            'contact_organisateur', 'est_public', 'est_mis_en_avant',
            'est_recurrent', 'recurrence'
        ]
    
    def validate(self, data):
        if data.get('heure_fin') and data.get('heure_debut'):
            if data['heure_fin'] < data['heure_debut']:
                raise serializers.ValidationError(
                    "L'heure de fin doit être après l'heure de début"
                )
        return data


class EvenementPublicSerializer(serializers.ModelSerializer):
    """Serializer public pour un événement"""
    
    categorie_display = serializers.CharField(source='get_categorie_display', read_only=True)
    statut_display = serializers.CharField(source='get_statut_display', read_only=True)
    nombre_inscrits = serializers.SerializerMethodField()
    places_restantes = serializers.SerializerMethodField()
    complet = serializers.SerializerMethodField()
    
    class Meta:
        model = Evenement
        fields = [
            'id', 'nom', 'slug', 'description', 'image', 'lieu',
            'latitude', 'longitude', 'categorie', 'categorie_display',
            'statut', 'statut_display', 'date', 'heure_debut', 'heure_fin',
            'nombre_places', 'nombre_inscrits', 'places_restantes', 'complet',
            'inscription_requise', 'contact_organisateur'
        ]
    
    def get_nombre_inscrits(self, obj):
        return obj.inscriptions.filter(statut=InscriptionEvenement.Statut.CONFIRME).count()
    
    def get_places_restantes(self, obj):
        if obj.nombre_places:
            inscrits = self.get_nombre_inscrits(obj)
            return max(0, obj.nombre_places - inscrits)
        return None
    
    def get_complet(self, obj):
        if obj.nombre_places:
            return self.get_places_restantes(obj) == 0
        return False


# ===== Inscriptions =====

class InscriptionEvenementSerializer(serializers.ModelSerializer):
    """Serializer pour les inscriptions"""
    
    participant_info = serializers.SerializerMethodField()
    evenement_nom = serializers.CharField(source='evenement.nom', read_only=True)
    statut_display = serializers.CharField(source='get_statut_display', read_only=True)
    
    class Meta:
        model = InscriptionEvenement
        fields = [
            'id', 'evenement', 'evenement_nom', 'participant', 'participant_info',
            'statut', 'statut_display', 'nombre_personnes', 'commentaire', 'date_inscription'
        ]
    
    def get_participant_info(self, obj):
        return {
            'id': obj.participant.id,
            'nom': obj.participant.nom,
            'email': obj.participant.email,
            'telephone': obj.participant.telephone
        }


class InscriptionCreateSerializer(serializers.ModelSerializer):
    """Serializer pour s'inscrire à un événement"""
    
    class Meta:
        model = InscriptionEvenement
        fields = ['evenement', 'nombre_personnes', 'commentaire']
    
    def validate(self, data):
        evenement = data.get('evenement')
        nombre_personnes = data.get('nombre_personnes', 1)
        
        if not evenement.est_public:
            raise serializers.ValidationError("Cet événement n'est pas ouvert aux inscriptions")
        
        if evenement.nombre_places:
            inscrits = evenement.inscriptions.filter(
                statut=InscriptionEvenement.Statut.CONFIRME
            ).aggregate(total=models.Sum('nombre_personnes'))['total'] or 0
            restantes = evenement.nombre_places - inscrits
            
            if nombre_personnes > restantes:
                raise serializers.ValidationError(
                    f"Il ne reste que {restantes} place(s) disponible(s)"
                )
        
        return data
    
    def create(self, validated_data):
        request = self.context.get('request')
        validated_data['participant'] = request.user
        validated_data['statut'] = InscriptionEvenement.Statut.CONFIRME
        return super().create(validated_data)


# ===== Newsletters =====

class NewsletterListSerializer(serializers.ModelSerializer):
    """Serializer pour la liste des newsletters"""
    
    mairie_nom = serializers.CharField(source='mairie.nom', read_only=True)
    statut_display = serializers.CharField(source='get_statut_display', read_only=True)
    
    class Meta:
        model = Newsletter
        fields = [
            'id', 'titre', 'mairie', 'mairie_nom', 'statut', 'statut_display',
            'nombre_destinataires', 'nombre_ouvertures',
            'date_creation', 'date_envoi'
        ]


class NewsletterDetailSerializer(serializers.ModelSerializer):
    """Serializer détaillé pour une newsletter"""
    
    mairie_nom = serializers.CharField(source='mairie.nom', read_only=True)
    auteur_nom = serializers.CharField(source='auteur.nom', read_only=True)
    statut_display = serializers.CharField(source='get_statut_display', read_only=True)
    
    class Meta:
        model = Newsletter
        fields = [
            'id', 'titre', 'contenu', 'mairie', 'mairie_nom', 'statut', 'statut_display',
            'auteur', 'auteur_nom', 'nombre_destinataires', 'nombre_ouvertures',
            'date_creation', 'date_envoi'
        ]
        read_only_fields = ['mairie', 'auteur', 'statut', 'date_envoi', 'nombre_destinataires', 'nombre_ouvertures']


class NewsletterCreateSerializer(serializers.ModelSerializer):
    """Serializer pour création de newsletter"""
    
    class Meta:
        model = Newsletter
        fields = ['titre', 'contenu']


# ===== Abonnés Newsletter =====

class AbonneNewsletterSerializer(serializers.ModelSerializer):
    """Serializer pour les abonnés"""
    
    mairie_nom = serializers.CharField(source='mairie.nom', read_only=True)
    
    class Meta:
        model = AbonneNewsletter
        fields = ['id', 'email', 'mairie', 'mairie_nom', 'est_actif', 'date_inscription']
        read_only_fields = ['mairie']


class AbonnementNewsletterSerializer(serializers.Serializer):
    """Serializer pour s'abonner à une newsletter"""
    
    email = serializers.EmailField()
    mairie = serializers.IntegerField()
    
    def validate_email(self, value):
        from apps.mairies.models import Mairie
        mairie_id = self.initial_data.get('mairie')
        
        if AbonneNewsletter.objects.filter(email=value, mairie_id=mairie_id).exists():
            raise serializers.ValidationError("Cet email est déjà abonné à cette newsletter")
        
        return value


class DesabonnementSerializer(serializers.Serializer):
    """Serializer pour se désabonner"""
    
    email = serializers.EmailField()
    token = serializers.CharField(required=False)
