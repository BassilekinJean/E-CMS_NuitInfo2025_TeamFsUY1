"""Transparence - Administration Django"""
from django.contrib import admin
from django.utils.html import format_html

from .models import Projet, Deliberation, DocumentBudgetaire, DocumentOfficiel


@admin.register(Projet)
class ProjetAdmin(admin.ModelAdmin):
    """Admin pour les projets"""
    list_display = ['titre', 'commune', 'categorie', 'budget_formatte', 'avancement_barre', 'statut_badge', 'date_debut']
    list_filter = ['commune', 'categorie', 'statut', 'est_public']
    search_fields = ['titre', 'description', 'lieu']
    prepopulated_fields = {'slug': ('titre',)}
    ordering = ['-date_creation']
    date_hierarchy = 'date_debut'
    
    fieldsets = (
        ('Informations de base', {
            'fields': ('titre', 'slug', 'description', 'image_principale')
        }),
        ('Classification', {
            'fields': ('commune', 'responsable', 'categorie', 'statut')
        }),
        ('Budget', {
            'fields': ('budget', 'budget_depense', 'avancement')
        }),
        ('Dates', {
            'fields': ('date_debut', 'date_fin', 'date_fin_reelle')
        }),
        ('Localisation', {
            'fields': ('lieu', 'latitude', 'longitude'),
            'classes': ('collapse',)
        }),
        ('Affichage', {
            'fields': ('est_public', 'est_mis_en_avant')
        }),
    )
    
    readonly_fields = ['date_creation', 'date_modification']
    
    def budget_formatte(self, obj):
        return f"{obj.budget:,.0f} FCFA".replace(',', ' ')
    budget_formatte.short_description = 'Budget'
    
    def avancement_barre(self, obj):
        color = 'green' if obj.avancement >= 75 else 'blue' if obj.avancement >= 50 else 'orange' if obj.avancement >= 25 else 'red'
        return format_html(
            '<div style="width:100px;background:#ddd;border-radius:3px;">'
            '<div style="width:{}%;background:{};height:20px;border-radius:3px;text-align:center;color:white;font-size:11px;line-height:20px;">{}</div>'
            '</div>',
            obj.avancement, color, f"{obj.avancement}%"
        )
    avancement_barre.short_description = 'Avancement'
    
    def statut_badge(self, obj):
        colors = {
            'planifie': 'blue',
            'en_cours': 'green',
            'suspendu': 'orange',
            'termine': 'teal',
            'annule': 'red'
        }
        color = colors.get(obj.statut, 'gray')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 8px; border-radius: 3px;">{}</span>',
            color, obj.get_statut_display()
        )
    statut_badge.short_description = 'Statut'


@admin.register(Deliberation)
class DeliberationAdmin(admin.ModelAdmin):
    """Admin pour les délibérations"""
    list_display = ['numero', 'titre', 'commune', 'date_seance', 'est_publie']
    list_filter = ['commune', 'est_publie']
    search_fields = ['numero', 'titre', 'resume']
    ordering = ['-date_seance']
    date_hierarchy = 'date_seance'
    
    fieldsets = (
        ('Informations', {
            'fields': ('numero', 'titre', 'resume', 'commune')
        }),
        ('Document', {
            'fields': ('date_seance', 'fichier')
        }),
        ('Publication', {
            'fields': ('est_publie',)
        }),
    )
    
    readonly_fields = ['date_creation']


@admin.register(DocumentBudgetaire)
class DocumentBudgetaireAdmin(admin.ModelAdmin):
    """Admin pour les documents budgétaires"""
    list_display = ['titre', 'commune', 'type_document', 'annee', 'montant_formatte', 'est_publie']
    list_filter = ['commune', 'type_document', 'annee', 'est_publie']
    search_fields = ['titre', 'description']
    ordering = ['-annee', '-date_creation']
    
    fieldsets = (
        ('Informations', {
            'fields': ('titre', 'type_document', 'annee', 'description', 'commune')
        }),
        ('Document', {
            'fields': ('fichier', 'montant_total')
        }),
        ('Publication', {
            'fields': ('est_publie',)
        }),
    )
    
    readonly_fields = ['date_creation']
    
    def montant_formatte(self, obj):
        if obj.montant_total:
            return f"{obj.montant_total:,.0f} FCFA".replace(',', ' ')
        return "-"
    montant_formatte.short_description = 'Montant'


@admin.register(DocumentOfficiel)
class DocumentOfficielAdmin(admin.ModelAdmin):
    """Admin pour les documents officiels"""
    list_display = ['titre', 'commune', 'type_document', 'categorie', 'nombre_telechargements', 'est_public', 'date_document']
    list_filter = ['commune', 'type_document', 'categorie', 'est_public']
    search_fields = ['titre', 'description', 'numero_reference']
    ordering = ['-date_creation']
    date_hierarchy = 'date_document'
    
    fieldsets = (
        ('Informations', {
            'fields': ('titre', 'type_document', 'categorie', 'description', 'commune', 'auteur')
        }),
        ('Document', {
            'fields': ('fichier', 'numero_reference', 'date_document')
        }),
        ('Statistiques', {
            'fields': ('nombre_telechargements',),
            'classes': ('collapse',)
        }),
        ('Publication', {
            'fields': ('est_public',)
        }),
    )
    
    readonly_fields = ['nombre_telechargements', 'date_creation']
