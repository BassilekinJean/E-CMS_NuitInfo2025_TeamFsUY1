from django.contrib import admin
from .models import Evenement, InscriptionEvenement, Newsletter, AbonneNewsletter


@admin.register(Evenement)
class EvenementAdmin(admin.ModelAdmin):
    list_display = ['nom', 'mairie', 'categorie', 'date', 'heure_debut', 'statut', 'est_public']
    list_filter = ['categorie', 'statut', 'mairie', 'est_public', 'inscription_requise']
    search_fields = ['nom', 'description', 'lieu']
    prepopulated_fields = {'slug': ('nom',)}
    date_hierarchy = 'date'
    
    fieldsets = (
        ('Informations principales', {
            'fields': ('nom', 'slug', 'description', 'mairie', 'categorie')
        }),
        ('Date et lieu', {
            'fields': ('date', 'heure_debut', 'heure_fin', 'lieu', 'latitude', 'longitude')
        }),
        ('Inscriptions', {
            'fields': ('inscription_requise', 'places_limitees', 'nombre_places')
        }),
        ('Organisateur', {
            'fields': ('organisateur', 'contact_organisateur')
        }),
        ('Affichage', {
            'fields': ('image', 'est_public', 'est_mis_en_avant', 'statut')
        }),
        ('Récurrence', {
            'fields': ('est_recurrent', 'recurrence'),
            'classes': ('collapse',)
        }),
    )


@admin.register(InscriptionEvenement)
class InscriptionEvenementAdmin(admin.ModelAdmin):
    list_display = ['participant', 'evenement', 'nombre_personnes', 'statut', 'date_inscription']
    list_filter = ['statut', 'evenement__mairie']
    search_fields = ['participant__nom', 'evenement__nom']


@admin.register(Newsletter)
class NewsletterAdmin(admin.ModelAdmin):
    list_display = ['titre', 'mairie', 'statut', 'nombre_destinataires', 'date_envoi']
    list_filter = ['statut', 'mairie']
    search_fields = ['titre', 'contenu']


@admin.register(AbonneNewsletter)
class AbonneNewsletterAdmin(admin.ModelAdmin):
    list_display = ['email', 'nom', 'mairie', 'est_actif', 'date_inscription']
    list_filter = ['mairie', 'est_actif']
    search_fields = ['email', 'nom']
