"""Services - Administration Django"""
from django.contrib import admin
from django.utils.html import format_html

from .models import Formulaire, Demarche, Signalement, Contact


@admin.register(Formulaire)
class FormulaireAdmin(admin.ModelAdmin):
    """Admin pour les formulaires"""
    list_display = ['nom', 'commune', 'type', 'est_actif', 'necessite_authentification']
    list_filter = ['commune', 'type', 'est_actif']
    search_fields = ['nom', 'description']
    ordering = ['commune', 'type', 'nom']
    
    fieldsets = (
        ('Informations', {
            'fields': ('nom', 'description', 'type', 'commune')
        }),
        ('Configuration', {
            'fields': ('champs', 'necessite_authentification', 'email_notification')
        }),
        ('Statut', {
            'fields': ('est_actif',)
        }),
    )
    
    readonly_fields = ['date_creation', 'date_modification']


@admin.register(Demarche)
class DemarcheAdmin(admin.ModelAdmin):
    """Admin pour les démarches"""
    list_display = ['numero_suivi', 'type', 'get_demandeur', 'commune', 'statut_badge', 'priorite', 'date_demande']
    list_filter = ['commune', 'statut', 'type', 'priorite']
    search_fields = ['numero_suivi', 'nom_demandeur', 'demandeur__nom', 'type']
    ordering = ['-date_demande']
    date_hierarchy = 'date_demande'
    
    fieldsets = (
        ('Identification', {
            'fields': ('numero_suivi', 'commune', 'formulaire', 'type')
        }),
        ('Demandeur', {
            'fields': ('demandeur', 'nom_demandeur', 'email_demandeur', 'telephone_demandeur')
        }),
        ('Données', {
            'fields': ('donnees',),
            'classes': ('collapse',)
        }),
        ('Traitement', {
            'fields': ('statut', 'agent_traitant', 'priorite', 'commentaire_agent', 'motif_rejet')
        }),
        ('Dates', {
            'fields': ('date_demande', 'date_prise_en_charge', 'date_traitement'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ['numero_suivi', 'date_demande']
    
    def get_demandeur(self, obj):
        return obj.demandeur.nom if obj.demandeur else obj.nom_demandeur
    get_demandeur.short_description = 'Demandeur'
    
    def statut_badge(self, obj):
        colors = {
            'en_attente': 'orange',
            'en_cours': 'blue',
            'validee': 'green',
            'rejetee': 'red',
            'completee': 'teal',
            'annulee': 'gray'
        }
        color = colors.get(obj.statut, 'gray')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 8px; border-radius: 3px;">{}</span>',
            color, obj.get_statut_display()
        )
    statut_badge.short_description = 'Statut'
    
    actions = ['prendre_en_charge', 'valider', 'rejeter']
    
    @admin.action(description='Prendre en charge')
    def prendre_en_charge(self, request, queryset):
        from django.utils import timezone
        count = queryset.update(
            statut=Demarche.Statut.EN_COURS,
            agent_traitant=request.user,
            date_prise_en_charge=timezone.now()
        )
        self.message_user(request, f'{count} démarche(s) prise(s) en charge.')
    
    @admin.action(description='Valider')
    def valider(self, request, queryset):
        from django.utils import timezone
        count = queryset.update(
            statut=Demarche.Statut.VALIDEE,
            date_traitement=timezone.now()
        )
        self.message_user(request, f'{count} démarche(s) validée(s).')
    
    @admin.action(description='Rejeter')
    def rejeter(self, request, queryset):
        from django.utils import timezone
        count = queryset.update(
            statut=Demarche.Statut.REJETEE,
            date_traitement=timezone.now()
        )
        self.message_user(request, f'{count} démarche(s) rejetée(s).')


@admin.register(Signalement)
class SignalementAdmin(admin.ModelAdmin):
    """Admin pour les signalements"""
    list_display = ['numero_suivi', 'titre', 'commune', 'categorie', 'statut_badge', 'date_signalement']
    list_filter = ['commune', 'categorie', 'statut']
    search_fields = ['numero_suivi', 'titre', 'description', 'adresse']
    ordering = ['-date_signalement']
    date_hierarchy = 'date_signalement'
    
    fieldsets = (
        ('Identification', {
            'fields': ('numero_suivi', 'commune')
        }),
        ('Signalement', {
            'fields': ('titre', 'description', 'categorie', 'photo')
        }),
        ('Localisation', {
            'fields': ('adresse', 'latitude', 'longitude')
        }),
        ('Contact', {
            'fields': ('signaleur', 'email_contact')
        }),
        ('Traitement', {
            'fields': ('statut', 'agent_traitant', 'commentaire_resolution', 'date_resolution')
        }),
    )
    
    readonly_fields = ['numero_suivi', 'date_signalement']
    
    def statut_badge(self, obj):
        colors = {
            'signale': 'orange',
            'en_cours': 'blue',
            'resolu': 'green',
            'rejete': 'red'
        }
        color = colors.get(obj.statut, 'gray')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 8px; border-radius: 3px;">{}</span>',
            color, obj.get_statut_display()
        )
    statut_badge.short_description = 'Statut'
    
    actions = ['prendre_en_charge', 'resoudre']
    
    @admin.action(description='Prendre en charge')
    def prendre_en_charge(self, request, queryset):
        count = queryset.update(
            statut=Signalement.Statut.EN_COURS,
            agent_traitant=request.user
        )
        self.message_user(request, f'{count} signalement(s) pris en charge.')
    
    @admin.action(description='Marquer comme résolu')
    def resoudre(self, request, queryset):
        from django.utils import timezone
        count = queryset.update(
            statut=Signalement.Statut.RESOLU,
            date_resolution=timezone.now()
        )
        self.message_user(request, f'{count} signalement(s) résolu(s).')


@admin.register(Contact)
class ContactAdmin(admin.ModelAdmin):
    """Admin pour les messages de contact"""
    list_display = ['sujet', 'nom', 'email', 'commune', 'est_lu', 'est_traite', 'date_envoi']
    list_filter = ['commune', 'est_lu', 'est_traite']
    search_fields = ['nom', 'email', 'sujet', 'message']
    ordering = ['-date_envoi']
    date_hierarchy = 'date_envoi'
    
    fieldsets = (
        ('Contact', {
            'fields': ('nom', 'email', 'telephone', 'commune')
        }),
        ('Message', {
            'fields': ('sujet', 'message')
        }),
        ('Traitement', {
            'fields': ('est_lu', 'est_traite', 'reponse', 'date_reponse')
        }),
    )
    
    readonly_fields = ['date_envoi']
    
    actions = ['marquer_lu', 'marquer_traite']
    
    @admin.action(description='Marquer comme lu')
    def marquer_lu(self, request, queryset):
        count = queryset.update(est_lu=True)
        self.message_user(request, f'{count} message(s) marqué(s) comme lu(s).')
    
    @admin.action(description='Marquer comme traité')
    def marquer_traite(self, request, queryset):
        count = queryset.update(est_lu=True, est_traite=True)
        self.message_user(request, f'{count} message(s) marqué(s) comme traité(s).')
