"""Core - Administration Django"""
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.html import format_html

from .models import Utilisateur, TokenVerification, ConfigurationPortail


@admin.register(Utilisateur)
class UtilisateurAdmin(BaseUserAdmin):
    """Admin pour le modèle Utilisateur personnalisé"""
    
    list_display = ['email', 'nom', 'role', 'commune', 'is_active', 'email_verifie', 'date_inscription']
    list_filter = ['role', 'is_active', 'email_verifie', 'is_staff', 'commune']
    search_fields = ['email', 'nom', 'telephone']
    ordering = ['-date_inscription']
    
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Informations personnelles', {'fields': ('nom', 'telephone', 'photo')}),
        ('Rôle et commune', {'fields': ('role', 'commune')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'email_verifie', 'groups', 'user_permissions')}),
        ('Dates', {'fields': ('date_inscription', 'derniere_connexion')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'nom', 'password1', 'password2', 'role', 'commune'),
        }),
    )
    
    readonly_fields = ['date_inscription', 'derniere_connexion']


@admin.register(TokenVerification)
class TokenVerificationAdmin(admin.ModelAdmin):
    """Admin pour les tokens de vérification"""
    
    list_display = ['utilisateur', 'type_token', 'date_creation', 'date_expiration', 'est_utilise', 'statut']
    list_filter = ['type_token', 'est_utilise']
    search_fields = ['utilisateur__email', 'token']
    readonly_fields = ['token', 'date_creation']
    
    def statut(self, obj):
        if obj.est_valide():
            return format_html('<span style="color: green;">✓ Valide</span>')
        return format_html('<span style="color: red;">✗ Expiré/Utilisé</span>')
    statut.short_description = 'Statut'


@admin.register(ConfigurationPortail)
class ConfigurationPortailAdmin(admin.ModelAdmin):
    """Admin pour la configuration du portail (singleton)"""
    
    fieldsets = (
        ('Informations générales', {
            'fields': ('nom_portail', 'slogan', 'description')
        }),
        ('Images', {
            'fields': ('logo', 'favicon', 'banniere')
        }),
        ('Couleurs', {
            'fields': ('couleur_primaire', 'couleur_secondaire')
        }),
        ('Contact', {
            'fields': ('email_contact', 'telephone', 'adresse')
        }),
        ('Réseaux sociaux', {
            'fields': ('facebook', 'twitter', 'youtube'),
            'classes': ('collapse',)
        }),
        ('SEO', {
            'fields': ('meta_titre', 'meta_description'),
            'classes': ('collapse',)
        }),
    )
    
    def has_add_permission(self, request):
        # Empêcher la création de plusieurs instances
        return not ConfigurationPortail.objects.exists()
    
    def has_delete_permission(self, request, obj=None):
        return False
