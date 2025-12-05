"""Communes - Administration Django"""
from django.contrib import admin
from django.utils.html import format_html
from django.utils import timezone

from .models import (
    Region, Departement, Commune, DemandeCreationSite,
    ServiceMunicipal, EquipeMunicipale
)


@admin.register(Region)
class RegionAdmin(admin.ModelAdmin):
    """Admin pour les régions"""
    list_display = ['nom', 'code', 'nombre_departements']
    search_fields = ['nom', 'code']
    ordering = ['nom']
    
    def nombre_departements(self, obj):
        return obj.departements.count()
    nombre_departements.short_description = 'Départements'


@admin.register(Departement)
class DepartementAdmin(admin.ModelAdmin):
    """Admin pour les départements"""
    list_display = ['nom', 'code', 'region', 'nombre_communes']
    list_filter = ['region']
    search_fields = ['nom', 'code']
    ordering = ['region', 'nom']
    
    def nombre_communes(self, obj):
        return obj.communes.count()
    nombre_communes.short_description = 'Communes'


class ServiceMunicipalInline(admin.TabularInline):
    """Inline pour les services municipaux"""
    model = ServiceMunicipal
    extra = 0
    fields = ['nom', 'responsable', 'telephone', 'email', 'est_actif', 'ordre']


class EquipeMunicipaleInline(admin.TabularInline):
    """Inline pour l'équipe municipale"""
    model = EquipeMunicipale
    extra = 0
    fields = ['nom', 'fonction', 'fonction_detail', 'photo', 'est_visible', 'ordre']


@admin.register(Commune)
class CommuneAdmin(admin.ModelAdmin):
    """Admin pour les communes"""
    list_display = ['nom', 'departement', 'population', 'statut_badge', 'date_creation']
    list_filter = ['statut', 'departement__region', 'departement']
    search_fields = ['nom', 'description', 'nom_maire']
    prepopulated_fields = {'slug': ('nom',)}
    ordering = ['nom']
    date_hierarchy = 'date_creation'
    inlines = [ServiceMunicipalInline, EquipeMunicipaleInline]
    
    fieldsets = (
        ('Informations de base', {
            'fields': ('nom', 'slug', 'code_postal', 'departement', 'site')
        }),
        ('Données démographiques', {
            'fields': ('population', 'superficie')
        }),
        ('Localisation GPS', {
            'fields': ('latitude', 'longitude'),
            'classes': ('collapse',)
        }),
        ('Contact', {
            'fields': ('adresse', 'telephone', 'email', 'site_web')
        }),
        ('Personnalisation', {
            'fields': ('logo', 'banniere', 'couleur_primaire', 'couleur_secondaire')
        }),
        ('Contenu', {
            'fields': ('description', 'historique', 'mot_du_maire')
        }),
        ('Maire', {
            'fields': ('nom_maire', 'photo_maire')
        }),
        ('Horaires', {
            'fields': ('horaires_ouverture',),
            'classes': ('collapse',)
        }),
        ('Statut', {
            'fields': ('statut', 'date_validation')
        }),
    )
    
    readonly_fields = ['date_creation', 'date_modification']
    
    def statut_badge(self, obj):
        colors = {
            'en_attente': 'orange',
            'active': 'green',
            'suspendue': 'red',
            'desactivee': 'gray'
        }
        color = colors.get(obj.statut, 'gray')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 8px; border-radius: 3px;">{}</span>',
            color, obj.get_statut_display()
        )
    statut_badge.short_description = 'Statut'
    
    actions = ['activer_communes', 'suspendre_communes']
    
    @admin.action(description='Activer les communes sélectionnées')
    def activer_communes(self, request, queryset):
        count = queryset.update(statut=Commune.Statut.ACTIVE, date_validation=timezone.now())
        self.message_user(request, f'{count} commune(s) activée(s).')
    
    @admin.action(description='Suspendre les communes sélectionnées')
    def suspendre_communes(self, request, queryset):
        count = queryset.update(statut=Commune.Statut.SUSPENDUE)
        self.message_user(request, f'{count} commune(s) suspendue(s).')


@admin.register(DemandeCreationSite)
class DemandeCreationSiteAdmin(admin.ModelAdmin):
    """Admin pour les demandes de création de site"""
    list_display = ['nom_commune', 'nom_referent', 'statut_badge', 'date_demande', 'lien_commune']
    list_filter = ['statut', 'departement__region']
    search_fields = ['nom_commune', 'nom_referent', 'email_referent']
    ordering = ['-date_demande']
    date_hierarchy = 'date_demande'
    
    fieldsets = (
        ('Informations commune', {
            'fields': ('nom_commune', 'departement', 'population', 'adresse')
        }),
        ('Référent', {
            'fields': ('nom_referent', 'fonction_referent', 'email_referent', 'telephone_referent')
        }),
        ('Demande', {
            'fields': ('motivation', 'justificatif', 'accepte_charte', 'accepte_confidentialite')
        }),
        ('Traitement', {
            'fields': ('statut', 'motif_rejet', 'notes_admin', 'commune_creee')
        }),
    )
    
    readonly_fields = ['date_demande', 'date_traitement', 'commune_creee']
    
    def statut_badge(self, obj):
        colors = {
            'en_attente': 'orange',
            'en_cours': 'blue',
            'validee': 'green',
            'rejetee': 'red'
        }
        color = colors.get(obj.statut, 'gray')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 8px; border-radius: 3px;">{}</span>',
            color, obj.get_statut_display()
        )
    statut_badge.short_description = 'Statut'
    
    def lien_commune(self, obj):
        if obj.commune_creee:
            return format_html(
                '<a href="/admin/communes/commune/{}/change/">{}</a>',
                obj.commune_creee.id, obj.commune_creee.nom
            )
        return '-'
    lien_commune.short_description = 'Commune créée'
    
    actions = ['valider_demandes', 'rejeter_demandes']
    
    @admin.action(description='✅ Valider et créer les sites')
    def valider_demandes(self, request, queryset):
        from .services import SiteCreationService
        
        success_count = 0
        errors = []
        
        for demande in queryset.filter(statut=DemandeCreationSite.Statut.EN_ATTENTE):
            try:
                service = SiteCreationService(demande)
                result = service.creer_site()
                success_count += 1
                self.message_user(
                    request,
                    f"✅ Site créé pour {demande.nom_commune} - Admin: {result['admin']['email']}",
                    level='SUCCESS'
                )
            except Exception as e:
                errors.append(f"{demande.nom_commune}: {str(e)}")
        
        if errors:
            self.message_user(request, f"❌ Erreurs: {', '.join(errors)}", level='ERROR')
        
        if success_count:
            self.message_user(request, f"✅ {success_count} site(s) créé(s) avec succès!")
    
    @admin.action(description='❌ Rejeter les demandes')
    def rejeter_demandes(self, request, queryset):
        count = queryset.filter(statut=DemandeCreationSite.Statut.EN_ATTENTE).update(
            statut=DemandeCreationSite.Statut.REJETEE,
            date_traitement=timezone.now(),
            motif_rejet="Demande rejetée par l'administrateur"
        )
        self.message_user(request, f'{count} demande(s) rejetée(s).')


@admin.register(ServiceMunicipal)
class ServiceMunicipalAdmin(admin.ModelAdmin):
    """Admin pour les services municipaux"""
    list_display = ['nom', 'commune', 'responsable', 'est_actif', 'ordre']
    list_filter = ['commune', 'est_actif']
    search_fields = ['nom', 'description', 'responsable']
    ordering = ['commune', 'ordre', 'nom']


@admin.register(EquipeMunicipale)
class EquipeMunicipaleAdmin(admin.ModelAdmin):
    """Admin pour l'équipe municipale"""
    list_display = ['nom', 'fonction', 'commune', 'est_visible', 'ordre']
    list_filter = ['commune', 'fonction', 'est_visible']
    search_fields = ['nom', 'fonction_detail']
    ordering = ['commune', 'ordre', 'fonction']
