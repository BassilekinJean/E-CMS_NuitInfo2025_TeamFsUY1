from django.contrib import admin
from .models import Projet, MiseAJourProjet, DocumentProjet


class MiseAJourProjetInline(admin.TabularInline):
    model = MiseAJourProjet
    extra = 0
    readonly_fields = ['date_creation']


class DocumentProjetInline(admin.TabularInline):
    model = DocumentProjet
    extra = 0


@admin.register(Projet)
class ProjetAdmin(admin.ModelAdmin):
    list_display = ['titre', 'mairie', 'categorie', 'statut', 'avancement', 'budget', 'date_debut', 'date_fin']
    list_filter = ['statut', 'categorie', 'mairie', 'est_public', 'est_mis_en_avant']
    search_fields = ['titre', 'description', 'lieu']
    prepopulated_fields = {'slug': ('titre',)}
    date_hierarchy = 'date_debut'
    
    fieldsets = (
        ('Informations principales', {
            'fields': ('titre', 'slug', 'description', 'categorie', 'mairie')
        }),
        ('Budget et avancement', {
            'fields': ('budget', 'budget_depense', 'avancement')
        }),
        ('Dates', {
            'fields': ('date_debut', 'date_fin', 'date_fin_reelle')
        }),
        ('Localisation', {
            'fields': ('lieu', 'latitude', 'longitude')
        }),
        ('Affichage', {
            'fields': ('image_principale', 'est_public', 'est_mis_en_avant', 'statut', 'responsable')
        }),
    )
    
    inlines = [MiseAJourProjetInline, DocumentProjetInline]


@admin.register(MiseAJourProjet)
class MiseAJourProjetAdmin(admin.ModelAdmin):
    list_display = ['projet', 'titre', 'avancement', 'date_creation']
    list_filter = ['projet__mairie']
    search_fields = ['titre', 'description']


@admin.register(DocumentProjet)
class DocumentProjetAdmin(admin.ModelAdmin):
    list_display = ['titre', 'projet', 'type_document', 'est_public', 'date_creation']
    list_filter = ['type_document', 'est_public']
    search_fields = ['titre', 'description']
