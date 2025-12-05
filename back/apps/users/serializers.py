from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from .models import ProfilAgentCommunal

Utilisateur = get_user_model()


class InscriptionSerializer(serializers.ModelSerializer):
    """Serializer pour l'inscription des utilisateurs (agents communaux)"""
    
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)
    role = serializers.ChoiceField(choices=Utilisateur.Role.choices, required=True)
    
    class Meta:
        model = Utilisateur
        fields = ['email', 'nom', 'password', 'password_confirm', 'role', 'telephone', 'adresse', 'mairie']
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({'password': 'Les mots de passe ne correspondent pas.'})
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        utilisateur = Utilisateur.objects.create_user(password=password, **validated_data)
        
        # Créer le profil agent si c'est un agent communal
        if utilisateur.role == Utilisateur.Role.AGENT_COMMUNAL:
            ProfilAgentCommunal.objects.create(utilisateur=utilisateur)
        
        return utilisateur


class UtilisateurSerializer(serializers.ModelSerializer):
    """Serializer pour les informations utilisateur"""
    
    role_display = serializers.CharField(source='get_role_display', read_only=True)
    mairie_nom = serializers.CharField(source='mairie.nom', read_only=True)
    
    class Meta:
        model = Utilisateur
        fields = [
            'id', 'email', 'nom', 'role', 'role_display', 'telephone', 'adresse',
            'mairie', 'mairie_nom', 'is_active', 'date_inscription', 'derniere_connexion'
        ]
        read_only_fields = ['id', 'email', 'role', 'is_active', 'date_inscription', 'derniere_connexion']


class UtilisateurListSerializer(serializers.ModelSerializer):
    """Serializer léger pour les listes d'utilisateurs"""
    
    role_display = serializers.CharField(source='get_role_display', read_only=True)
    
    class Meta:
        model = Utilisateur
        fields = ['id', 'email', 'nom', 'role', 'role_display', 'is_active']


class ProfilAgentCommunalSerializer(serializers.ModelSerializer):
    """Serializer pour le profil agent communal"""
    
    utilisateur = UtilisateurSerializer(read_only=True)
    
    class Meta:
        model = ProfilAgentCommunal
        fields = [
            'id', 'utilisateur', 'poste', 'service', 'matricule',
            'peut_gerer_contenu', 'peut_gerer_formulaires', 'peut_gerer_projets',
            'peut_gerer_evenements', 'peut_gerer_documents', 'date_prise_fonction'
        ]
        read_only_fields = ['id', 'utilisateur']


class ChangerMotDePasseSerializer(serializers.Serializer):
    """Serializer pour le changement de mot de passe"""
    
    ancien_mot_de_passe = serializers.CharField(required=True)
    nouveau_mot_de_passe = serializers.CharField(required=True, validators=[validate_password])
    confirmer_mot_de_passe = serializers.CharField(required=True)
    
    def validate(self, attrs):
        if attrs['nouveau_mot_de_passe'] != attrs['confirmer_mot_de_passe']:
            raise serializers.ValidationError({'nouveau_mot_de_passe': 'Les mots de passe ne correspondent pas.'})
        return attrs


# ===== Authentification Avancée =====

class DemandeOTPSerializer(serializers.Serializer):
    """Serializer pour demander un code OTP (mot de passe oublié)"""
    
    email = serializers.EmailField(required=True)
    
    def validate_email(self, value):
        # On ne révèle pas si l'email existe ou non (sécurité)
        return value.lower()


class VerifyOTPSerializer(serializers.Serializer):
    """Serializer pour vérifier le code OTP"""
    
    email = serializers.EmailField(required=True)
    otp_code = serializers.CharField(required=True, min_length=6, max_length=6)
    
    def validate_otp_code(self, value):
        if not value.isdigit():
            raise serializers.ValidationError("Le code OTP doit contenir uniquement des chiffres.")
        return value


class ResetPasswordSerializer(serializers.Serializer):
    """Serializer pour réinitialiser le mot de passe après validation OTP"""
    
    reset_permit = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, validators=[validate_password])
    confirm_password = serializers.CharField(required=True)
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError({
                'new_password': 'Les mots de passe ne correspondent pas.'
            })
        return attrs



class CreerAgentSerializer(serializers.ModelSerializer):
    """Serializer pour la création d'un agent communal (par admin)"""
    
    password = serializers.CharField(write_only=True, validators=[validate_password])
    poste = serializers.CharField(write_only=True, required=False)
    service = serializers.CharField(write_only=True, required=False)
    
    class Meta:
        model = Utilisateur
        fields = ['email', 'nom', 'password', 'telephone', 'mairie', 'poste', 'service']
    
    def create(self, validated_data):
        poste = validated_data.pop('poste', '')
        service = validated_data.pop('service', '')
        password = validated_data.pop('password')
        
        utilisateur = Utilisateur.objects.create_user(
            password=password,
            role=Utilisateur.Role.AGENT_COMMUNAL,
            **validated_data
        )
        
        ProfilAgentCommunal.objects.create(
            utilisateur=utilisateur,
            poste=poste,
            service=service
        )
        
        return utilisateur
