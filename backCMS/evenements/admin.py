"""Événements - Administration Django"""
from django.contrib import admin
from django.utils.html import format_html

from .models import Evenement, InscriptionEvenement, RendezVous


class InscriptionEvenementInline(admin.TabularInline):
    """Inline pour les inscriptions aux événements"""
    model = InscriptionEvenement
    extra = 0
    readonly_fields = ['date_inscription']
    fields = ['nom', 'email', 'telephone', 'nombre_personnes', 'statut', 'date_inscription']


@admin.register(Evenement)
class EvenementAdmin(admin.ModelAdmin):
    """Admin pour les événements"""
    list_display = ['nom', 'commune', 'date', 'heure_debut', 'lieu', 'categorie', 'statut_badge', 'places_info']
    list_filter = ['commune', 'categorie', 'statut', 'est_public', 'inscription_requise']
    search_fields = ['nom', 'description', 'lieu']
    prepopulated_fields = {'slug': ('nom',)}
    ordering = ['-date', '-heure_debut']
    date_hierarchy = 'date'
    inlines = [InscriptionEvenementInline]
    
    fieldsets = (
        ('Informations de base', {
            'fields': ('nom', 'slug', 'description', 'image')
        }),
        ('Date et lieu', {
            'fields': ('date', 'heure_debut', 'heure_fin', 'lieu', 'adresse', 'latitude', 'longitude')
        }),
        ('Classification', {
            'fields': ('commune', 'organisateur', 'categorie', 'statut')
        }),
        ('Inscriptions', {
            'fields': ('inscription_requise', 'places_limitees', 'nombre_places')
        }),
        ('Contact', {
            'fields': ('contact_organisateur',)
        }),
        ('Affichage', {
            'fields': ('est_public', 'est_mis_en_avant')
        }),
        ('Récurrence', {
            'fields': ('est_recurrent', 'recurrence'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ['date_creation', 'date_modification']
    
    def statut_badge(self, obj):
        colors = {
            'planifie': 'blue',
            'confirme': 'green',
            'annule': 'red',
            'reporte': 'orange',
            'termine': 'gray'
        }
        color = colors.get(obj.statut, 'gray')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 8px; border-radius: 3px;">{}</span>',
            color, obj.get_statut_display()
        )
    statut_badge.short_description = 'Statut'
    
    def places_info(self, obj):
        if obj.places_limitees and obj.nombre_places:
            restantes = obj.places_restantes()
            return f"{restantes}/{obj.nombre_places}"
        return "Illimité"
    places_info.short_description = 'Places'
    
    actions = ['confirmer', 'annuler']
    
    @admin.action(description='Confirmer les événements sélectionnés')
    def confirmer(self, request, queryset):
        count = queryset.update(statut=Evenement.Statut.CONFIRME)
        self.message_user(request, f'{count} événement(s) confirmé(s).')
    
    @admin.action(description='Annuler les événements sélectionnés')
    def annuler(self, request, queryset):
        count = queryset.update(statut=Evenement.Statut.ANNULE)
        self.message_user(request, f'{count} événement(s) annulé(s).')


@admin.register(InscriptionEvenement)
class InscriptionEvenementAdmin(admin.ModelAdmin):
    """Admin pour les inscriptions aux événements"""
    list_display = ['get_nom', 'evenement', 'nombre_personnes', 'statut_badge', 'date_inscription']
    list_filter = ['evenement__commune', 'statut']
    search_fields = ['nom', 'email', 'participant__nom', 'evenement__nom']
    ordering = ['-date_inscription']
    
    def get_nom(self, obj):
        return obj.participant.nom if obj.participant else obj.nom
    get_nom.short_description = 'Participant'
    
    def statut_badge(self, obj):
        colors = {
            'en_attente': 'orange',
            'confirme': 'green',
            'annule': 'red',
            'present': 'blue',
            'absent': 'gray'
        }
        color = colors.get(obj.statut, 'gray')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 8px; border-radius: 3px;">{}</span>',
            color, obj.get_statut_display()
        )
    statut_badge.short_description = 'Statut'


@admin.register(RendezVous)
class RendezVousAdmin(admin.ModelAdmin):
    """Admin pour les rendez-vous"""
    list_display = ['get_demandeur', 'commune', 'service', 'motif', 'date', 'heure_debut', 'statut_badge']
    list_filter = ['commune', 'service', 'statut', 'date']
    search_fields = ['nom_demandeur', 'demandeur__nom', 'motif']
    ordering = ['-date', '-heure_debut']
    date_hierarchy = 'date'
    
    fieldsets = (
        ('Demandeur', {
            'fields': ('demandeur', 'nom_demandeur', 'email_demandeur', 'telephone_demandeur')
        }),
        ('Rendez-vous', {
            'fields': ('commune', 'service', 'motif', 'description')
        }),
        ('Date et heure', {
            'fields': ('date', 'heure_debut', 'heure_fin')
        }),
        ('Traitement', {
            'fields': ('statut', 'notes')
        }),
    )
    
    readonly_fields = ['date_creation']
    
    def get_demandeur(self, obj):
        return obj.demandeur.nom if obj.demandeur else obj.nom_demandeur
    get_demandeur.short_description = 'Demandeur'
    
    def statut_badge(self, obj):
        colors = {
            'en_attente': 'orange',
            'confirme': 'green',
            'annule': 'red',
            'termine': 'blue',
            'absent': 'gray'
        }
        color = colors.get(obj.statut, 'gray')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 8px; border-radius: 3px;">{}</span>',
            color, obj.get_statut_display()
        )
    statut_badge.short_description = 'Statut'
