from rest_framework import serializers
from .models import Evenement, InscriptionEvenement, Newsletter, AbonneNewsletter


# ===== Événements =====

class EvenementListSerializer(serializers.ModelSerializer):
    """Serializer pour la liste des événements"""
    
    mairie_nom = serializers.CharField(source='mairie.nom', read_only=True)
    nombre_inscrits = serializers.SerializerMethodField()
    places_restantes = serializers.SerializerMethodField()
    
    class Meta:
        model = Evenement
        fields = [
            'id', 'titre', 'image', 'lieu', 'mairie_nom', 'categorie',
            'date_debut', 'date_fin', 'nombre_places', 'nombre_inscrits',
            'places_restantes', 'est_gratuit', 'prix', 'est_publie'
        ]
    
    def get_nombre_inscrits(self, obj):
        return obj.inscriptions.filter(statut=InscriptionEvenement.Statut.CONFIRMEE).count()
    
    def get_places_restantes(self, obj):
        if obj.nombre_places:
            inscrits = self.get_nombre_inscrits(obj)
            return max(0, obj.nombre_places - inscrits)
        return None


class EvenementDetailSerializer(serializers.ModelSerializer):
    """Serializer détaillé pour un événement"""
    
    mairie_nom = serializers.CharField(source='mairie.nom', read_only=True)
    organisateur = serializers.SerializerMethodField()
    nombre_inscrits = serializers.SerializerMethodField()
    places_restantes = serializers.SerializerMethodField()
    inscriptions = serializers.SerializerMethodField()
    
    class Meta:
        model = Evenement
        fields = [
            'id', 'titre', 'description', 'image', 'lieu', 'adresse',
            'latitude', 'longitude', 'mairie', 'mairie_nom', 'organisateur',
            'categorie', 'date_debut', 'date_fin', 'nombre_places',
            'nombre_inscrits', 'places_restantes', 'est_gratuit', 'prix',
            'lien_externe', 'est_publie', 'inscriptions',
            'date_creation', 'date_modification'
        ]
        read_only_fields = ['mairie', 'organisateur']
    
    def get_organisateur(self, obj):
        if obj.organisateur:
            return {
                'id': obj.organisateur.id,
                'nom_complet': obj.organisateur.get_full_name()
            }
        return None
    
    def get_nombre_inscrits(self, obj):
        return obj.inscriptions.filter(statut=InscriptionEvenement.Statut.CONFIRMEE).count()
    
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
            'titre', 'description', 'image', 'lieu', 'adresse',
            'latitude', 'longitude', 'categorie', 'date_debut', 'date_fin',
            'nombre_places', 'est_gratuit', 'prix', 'lien_externe', 'est_publie'
        ]
    
    def validate(self, data):
        if data.get('date_fin') and data.get('date_debut'):
            if data['date_fin'] < data['date_debut']:
                raise serializers.ValidationError(
                    "La date de fin doit être après la date de début"
                )
        return data


class EvenementPublicSerializer(serializers.ModelSerializer):
    """Serializer public pour un événement"""
    
    nombre_inscrits = serializers.SerializerMethodField()
    places_restantes = serializers.SerializerMethodField()
    complet = serializers.SerializerMethodField()
    
    class Meta:
        model = Evenement
        fields = [
            'id', 'titre', 'description', 'image', 'lieu', 'adresse',
            'latitude', 'longitude', 'categorie', 'date_debut', 'date_fin',
            'nombre_places', 'nombre_inscrits', 'places_restantes', 'complet',
            'est_gratuit', 'prix', 'lien_externe'
        ]
    
    def get_nombre_inscrits(self, obj):
        return obj.inscriptions.filter(statut=InscriptionEvenement.Statut.CONFIRMEE).count()
    
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
    
    participant = serializers.SerializerMethodField()
    evenement_titre = serializers.CharField(source='evenement.titre', read_only=True)
    
    class Meta:
        model = InscriptionEvenement
        fields = [
            'id', 'evenement', 'evenement_titre', 'participant',
            'statut', 'nombre_places', 'commentaire', 'date_inscription'
        ]
    
    def get_participant(self, obj):
        return {
            'id': obj.participant.id,
            'nom_complet': obj.participant.get_full_name(),
            'email': obj.participant.email,
            'telephone': obj.participant.telephone
        }


class InscriptionCreateSerializer(serializers.ModelSerializer):
    """Serializer pour s'inscrire à un événement"""
    
    class Meta:
        model = InscriptionEvenement
        fields = ['evenement', 'nombre_places', 'commentaire']
    
    def validate(self, data):
        evenement = data.get('evenement')
        nombre_places = data.get('nombre_places', 1)
        
        if not evenement.est_publie:
            raise serializers.ValidationError("Cet événement n'est pas ouvert aux inscriptions")
        
        if evenement.nombre_places:
            inscrits = evenement.inscriptions.filter(
                statut=InscriptionEvenement.Statut.CONFIRMEE
            ).count()
            restantes = evenement.nombre_places - inscrits
            
            if nombre_places > restantes:
                raise serializers.ValidationError(
                    f"Il ne reste que {restantes} place(s) disponible(s)"
                )
        
        return data
    
    def create(self, validated_data):
        request = self.context.get('request')
        validated_data['participant'] = request.user
        validated_data['statut'] = InscriptionEvenement.Statut.CONFIRMEE
        return super().create(validated_data)


# ===== Newsletters =====

class NewsletterListSerializer(serializers.ModelSerializer):
    """Serializer pour la liste des newsletters"""
    
    mairie_nom = serializers.CharField(source='mairie.nom', read_only=True)
    nombre_destinataires = serializers.SerializerMethodField()
    
    class Meta:
        model = Newsletter
        fields = [
            'id', 'objet', 'mairie_nom', 'statut', 'nombre_destinataires',
            'date_creation', 'date_envoi'
        ]
    
    def get_nombre_destinataires(self, obj):
        return obj.mairie.abonnes_newsletter.filter(est_actif=True).count()


class NewsletterDetailSerializer(serializers.ModelSerializer):
    """Serializer détaillé pour une newsletter"""
    
    mairie_nom = serializers.CharField(source='mairie.nom', read_only=True)
    cree_par_nom = serializers.CharField(source='cree_par.get_full_name', read_only=True)
    
    class Meta:
        model = Newsletter
        fields = [
            'id', 'objet', 'contenu', 'mairie', 'mairie_nom', 'statut',
            'cree_par', 'cree_par_nom', 'date_creation', 'date_envoi'
        ]
        read_only_fields = ['mairie', 'cree_par', 'statut', 'date_envoi']


class NewsletterCreateSerializer(serializers.ModelSerializer):
    """Serializer pour création de newsletter"""
    
    class Meta:
        model = Newsletter
        fields = ['objet', 'contenu']


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
