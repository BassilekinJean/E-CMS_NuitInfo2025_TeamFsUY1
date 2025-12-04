from django.contrib import admin
from .models import Formulaire, DemarcheAdministrative, Signalement, RendezVous


@admin.register(Formulaire)
class FormulaireAdmin(admin.ModelAdmin):
    list_display = ['nom', 'type', 'mairie', 'est_actif', 'necessite_authentification']
    list_filter = ['type', 'mairie', 'est_actif', 'necessite_authentification']
    search_fields = ['nom', 'description']


@admin.register(DemarcheAdministrative)
class DemarcheAdministrativeAdmin(admin.ModelAdmin):
    list_display = ['numero_suivi', 'type', 'demandeur', 'mairie', 'statut', 'date_demande']
    list_filter = ['statut', 'type', 'mairie']
    search_fields = ['numero_suivi', 'nom_demandeur', 'demandeur__nom']
    readonly_fields = ['numero_suivi', 'date_demande']
    
    fieldsets = (
        ('Informations générales', {
            'fields': ('numero_suivi', 'type', 'mairie', 'formulaire')
        }),
        ('Demandeur', {
            'fields': ('demandeur', 'nom_demandeur', 'email_demandeur', 'telephone_demandeur')
        }),
        ('Données soumises', {
            'fields': ('donnees_formulaire',),
            'classes': ('collapse',)
        }),
        ('Traitement', {
            'fields': ('statut', 'agent_traitant', 'commentaire_agent', 'motif_rejet', 'priorite')
        }),
        ('Dates', {
            'fields': ('date_demande', 'date_prise_en_charge', 'date_traitement')
        }),
    )


@admin.register(Signalement)
class SignalementAdmin(admin.ModelAdmin):
    list_display = ['numero_suivi', 'titre', 'categorie', 'mairie', 'statut', 'date_signalement']
    list_filter = ['statut', 'categorie', 'mairie']
    search_fields = ['numero_suivi', 'titre', 'adresse']
    readonly_fields = ['numero_suivi', 'date_signalement']
    
    fieldsets = (
        ('Informations générales', {
            'fields': ('numero_suivi', 'titre', 'description', 'categorie', 'mairie')
        }),
        ('Signaleur', {
            'fields': ('signaleur', 'email_contact')
        }),
        ('Localisation', {
            'fields': ('adresse', 'latitude', 'longitude', 'photo')
        }),
        ('Traitement', {
            'fields': ('statut', 'agent_traitant', 'commentaire_resolution')
        }),
        ('Dates', {
            'fields': ('date_signalement', 'date_resolution')
        }),
    )


@admin.register(RendezVous)
class RendezVousAdmin(admin.ModelAdmin):
    list_display = ['citoyen', 'mairie', 'service', 'date', 'heure_debut', 'statut']
    list_filter = ['statut', 'mairie', 'service', 'date']
    search_fields = ['citoyen__nom', 'motif']
    date_hierarchy = 'date'
