from django.contrib import admin
from .models import Mairie, DemandeCreationSite, ServiceMunicipal


class ServiceMunicipalInline(admin.TabularInline):
    model = ServiceMunicipal
    extra = 1


@admin.register(Mairie)
class MairieAdmin(admin.ModelAdmin):
    list_display = ['nom', 'ville', 'statut', 'nom_maire', 'date_creation']
    list_filter = ['statut', 'region', 'pays']
    search_fields = ['nom', 'ville', 'nom_maire']
    prepopulated_fields = {'slug': ('nom',)}
    
    fieldsets = (
        ('Informations principales', {
            'fields': ('nom', 'slug', 'localisation', 'code_postal', 'ville', 'region', 'pays')
        }),
        ('Contact', {
            'fields': ('contact', 'email_contact', 'telephone', 'site_web')
        }),
        ('Maire', {
            'fields': ('nom_maire', 'photo_maire', 'mot_du_maire')
        }),
        ('Présentation', {
            'fields': ('description', 'historique')
        }),
        ('Personnalisation', {
            'fields': ('logo', 'banniere', 'couleur_primaire', 'couleur_secondaire')
        }),
        ('Localisation GPS', {
            'fields': ('latitude', 'longitude'),
            'classes': ('collapse',)
        }),
        ('Horaires', {
            'fields': ('horaires_ouverture',),
            'classes': ('collapse',)
        }),
        ('Statut', {
            'fields': ('statut', 'date_validation')
        }),
    )
    
    inlines = [ServiceMunicipalInline]


@admin.register(DemandeCreationSite)
class DemandeCreationSiteAdmin(admin.ModelAdmin):
    list_display = ['nom_mairie', 'nom_demandeur', 'statut', 'date_demande']
    list_filter = ['statut']
    search_fields = ['nom_mairie', 'nom_demandeur']
    readonly_fields = ['date_demande']
    
    fieldsets = (
        ('Informations de la mairie', {
            'fields': ('nom_mairie', 'localisation', 'contact', 'email', 'telephone')
        }),
        ('Demandeur', {
            'fields': ('nom_demandeur', 'fonction_demandeur')
        }),
        ('Justificatifs', {
            'fields': ('justificatif',)
        }),
        ('Traitement', {
            'fields': ('statut', 'motif_rejet', 'date_traitement', 'mairie_creee')
        }),
    )


@admin.register(ServiceMunicipal)
class ServiceMunicipalAdmin(admin.ModelAdmin):
    list_display = ['nom', 'mairie', 'responsable', 'est_actif']
    list_filter = ['mairie', 'est_actif']
    search_fields = ['nom', 'responsable']
