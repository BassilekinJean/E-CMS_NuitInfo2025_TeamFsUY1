from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import Utilisateur, ProfilCitoyen, ProfilAgentCommunal


class ProfilCitoyenInline(admin.StackedInline):
    model = ProfilCitoyen
    can_delete = False
    verbose_name = 'Profil Citoyen'


class ProfilAgentCommunalInline(admin.StackedInline):
    model = ProfilAgentCommunal
    can_delete = False
    verbose_name = 'Profil Agent Communal'


@admin.register(Utilisateur)
class UtilisateurAdmin(BaseUserAdmin):
    list_display = ['email', 'nom', 'role', 'mairie', 'is_active', 'date_inscription']
    list_filter = ['role', 'is_active', 'is_staff', 'mairie']
    search_fields = ['email', 'nom']
    ordering = ['-date_inscription']
    
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Informations personnelles', {'fields': ('nom', 'telephone', 'adresse')}),
        ('Rôle et Mairie', {'fields': ('role', 'mairie')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Dates', {'fields': ('date_inscription', 'derniere_connexion')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'nom', 'role', 'mairie', 'password1', 'password2'),
        }),
    )
    
    def get_inlines(self, request, obj=None):
        if obj:
            if obj.role == Utilisateur.Role.CITOYEN:
                return [ProfilCitoyenInline]
            elif obj.role == Utilisateur.Role.AGENT_COMMUNAL:
                return [ProfilAgentCommunalInline]
        return []


@admin.register(ProfilCitoyen)
class ProfilCitoyenAdmin(admin.ModelAdmin):
    list_display = ['utilisateur', 'date_naissance', 'abonne_newsletter']
    search_fields = ['utilisateur__nom', 'utilisateur__email']


@admin.register(ProfilAgentCommunal)
class ProfilAgentCommunalAdmin(admin.ModelAdmin):
    list_display = ['utilisateur', 'poste', 'service', 'date_prise_fonction']
    search_fields = ['utilisateur__nom', 'poste', 'service']
    list_filter = ['service']
