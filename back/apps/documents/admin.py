from django.contrib import admin
from .models import DocumentOfficiel, Actualite, PageCMS, FAQ


@admin.register(DocumentOfficiel)
class DocumentOfficielAdmin(admin.ModelAdmin):
    list_display = ['titre', 'type_document', 'mairie', 'date_publication', 'nombre_telechargements']
    list_filter = ['type_document', 'mairie', 'est_public', 'annee']
    search_fields = ['titre', 'description', 'numero_reference']
    date_hierarchy = 'date_publication'
    
    fieldsets = (
        ('Informations principales', {
            'fields': ('titre', 'type_document', 'mairie', 'fichier_joint')
        }),
        ('Description', {
            'fields': ('description', 'categorie', 'annee', 'numero_reference')
        }),
        ('Visibilité', {
            'fields': ('est_public', 'est_mis_en_avant', 'auteur')
        }),
        ('Statistiques', {
            'fields': ('nombre_telechargements', 'taille_fichier', 'type_mime'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Actualite)
class ActualiteAdmin(admin.ModelAdmin):
    list_display = ['titre', 'categorie', 'mairie', 'est_publie', 'date_publication']
    list_filter = ['categorie', 'mairie', 'est_publie', 'est_mis_en_avant']
    search_fields = ['titre', 'contenu']
    prepopulated_fields = {'slug': ('titre',)}
    date_hierarchy = 'date_publication'
    
    fieldsets = (
        ('Contenu', {
            'fields': ('titre', 'slug', 'resume', 'contenu', 'image_principale')
        }),
        ('Classification', {
            'fields': ('mairie', 'categorie', 'auteur')
        }),
        ('Publication', {
            'fields': ('est_publie', 'est_mis_en_avant', 'date_publication')
        }),
    )


@admin.register(PageCMS)
class PageCMSAdmin(admin.ModelAdmin):
    list_display = ['titre', 'mairie', 'parent', 'ordre', 'est_publie', 'afficher_dans_menu']
    list_filter = ['mairie', 'est_publie', 'afficher_dans_menu']
    search_fields = ['titre', 'contenu']
    prepopulated_fields = {'slug': ('titre',)}
    
    fieldsets = (
        ('Contenu', {
            'fields': ('titre', 'slug', 'contenu', 'image_bandeau')
        }),
        ('Organisation', {
            'fields': ('mairie', 'parent', 'ordre')
        }),
        ('Affichage', {
            'fields': ('est_publie', 'afficher_dans_menu')
        }),
        ('SEO', {
            'fields': ('meta_titre', 'meta_description'),
            'classes': ('collapse',)
        }),
    )


@admin.register(FAQ)
class FAQAdmin(admin.ModelAdmin):
    list_display = ['question', 'mairie', 'categorie', 'ordre', 'est_active']
    list_filter = ['mairie', 'categorie', 'est_active']
    search_fields = ['question', 'reponse']
