"""Actualités - Administration Django"""
from django.contrib import admin
from django.utils.html import format_html

from .models import Actualite, PageCMS, FAQ, Newsletter, AbonneNewsletter


@admin.register(Actualite)
class ActualiteAdmin(admin.ModelAdmin):
    """Admin pour les actualités"""
    list_display = ['titre', 'commune', 'categorie', 'est_publie', 'est_mis_en_avant', 'nombre_vues', 'date_publication']
    list_filter = ['commune', 'categorie', 'est_publie', 'est_mis_en_avant']
    search_fields = ['titre', 'resume', 'contenu']
    prepopulated_fields = {'slug': ('titre',)}
    ordering = ['-date_publication']
    date_hierarchy = 'date_publication'
    
    fieldsets = (
        ('Contenu', {
            'fields': ('titre', 'slug', 'resume', 'contenu', 'image_principale')
        }),
        ('Classification', {
            'fields': ('commune', 'auteur', 'categorie', 'tags')
        }),
        ('Publication', {
            'fields': ('est_publie', 'est_mis_en_avant', 'date_publication')
        }),
        ('Statistiques', {
            'fields': ('nombre_vues',),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ['nombre_vues', 'date_creation', 'date_modification']
    
    actions = ['publier', 'depublier', 'mettre_en_avant']
    
    @admin.action(description='Publier les articles sélectionnés')
    def publier(self, request, queryset):
        from django.utils import timezone
        count = queryset.update(est_publie=True, date_publication=timezone.now())
        self.message_user(request, f'{count} article(s) publié(s).')
    
    @admin.action(description='Dépublier les articles sélectionnés')
    def depublier(self, request, queryset):
        count = queryset.update(est_publie=False)
        self.message_user(request, f'{count} article(s) dépublié(s).')
    
    @admin.action(description='Mettre en avant')
    def mettre_en_avant(self, request, queryset):
        count = queryset.update(est_mis_en_avant=True)
        self.message_user(request, f'{count} article(s) mis en avant.')


@admin.register(PageCMS)
class PageCMSAdmin(admin.ModelAdmin):
    """Admin pour les pages CMS"""
    list_display = ['titre', 'commune', 'parent', 'afficher_dans_menu', 'est_publie', 'ordre']
    list_filter = ['commune', 'est_publie', 'afficher_dans_menu']
    search_fields = ['titre', 'contenu']
    prepopulated_fields = {'slug': ('titre',)}
    ordering = ['commune', 'ordre', 'titre']
    
    fieldsets = (
        ('Contenu', {
            'fields': ('titre', 'slug', 'contenu', 'image_bandeau')
        }),
        ('Hiérarchie', {
            'fields': ('commune', 'parent', 'ordre')
        }),
        ('Affichage', {
            'fields': ('afficher_dans_menu', 'est_publie')
        }),
        ('SEO', {
            'fields': ('meta_titre', 'meta_description'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ['date_creation', 'date_modification']


@admin.register(FAQ)
class FAQAdmin(admin.ModelAdmin):
    """Admin pour les FAQ"""
    list_display = ['question_courte', 'commune', 'categorie', 'est_active', 'ordre']
    list_filter = ['commune', 'categorie', 'est_active']
    search_fields = ['question', 'reponse']
    ordering = ['commune', 'categorie', 'ordre']
    
    def question_courte(self, obj):
        return obj.question[:60] + '...' if len(obj.question) > 60 else obj.question
    question_courte.short_description = 'Question'


@admin.register(Newsletter)
class NewsletterAdmin(admin.ModelAdmin):
    """Admin pour les newsletters"""
    list_display = ['titre', 'commune', 'statut_badge', 'nombre_destinataires', 'nombre_ouvertures', 'date_envoi']
    list_filter = ['commune', 'statut']
    search_fields = ['titre', 'contenu']
    ordering = ['-date_creation']
    
    def statut_badge(self, obj):
        colors = {
            'brouillon': 'gray',
            'planifiee': 'blue',
            'envoyee': 'green'
        }
        color = colors.get(obj.statut, 'gray')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 8px; border-radius: 3px;">{}</span>',
            color, obj.get_statut_display()
        )
    statut_badge.short_description = 'Statut'


@admin.register(AbonneNewsletter)
class AbonneNewsletterAdmin(admin.ModelAdmin):
    """Admin pour les abonnés newsletter"""
    list_display = ['email', 'nom', 'commune', 'est_actif', 'date_inscription']
    list_filter = ['commune', 'est_actif']
    search_fields = ['email', 'nom']
    ordering = ['-date_inscription']
    
    actions = ['activer', 'desactiver']
    
    @admin.action(description='Activer les abonnés sélectionnés')
    def activer(self, request, queryset):
        count = queryset.update(est_actif=True)
        self.message_user(request, f'{count} abonné(s) activé(s).')
    
    @admin.action(description='Désactiver les abonnés sélectionnés')
    def desactiver(self, request, queryset):
        count = queryset.update(est_actif=False)
        self.message_user(request, f'{count} abonné(s) désactivé(s).')
