"""
API Filters - E-CMS
Filtres personnalisés pour les ViewSets
"""
import django_filters
from communes.models import Commune, ServiceMunicipal, EquipeMunicipale
from actualites.models import Actualite, PageCMS, FAQ, AbonneNewsletter
from evenements.models import Evenement, InscriptionEvenement, RendezVous
from services.models import Signalement, Contact, Demarche
from transparence.models import Projet, Deliberation, DocumentBudgetaire, DocumentOfficiel


class CommuneSlugFilter(django_filters.FilterSet):
    """
    Filtre de base permettant de filtrer par slug de commune
    au lieu de l'ID numérique
    """
    commune = django_filters.CharFilter(method='filter_by_commune_slug')
    
    def filter_by_commune_slug(self, queryset, name, value):
        """
        Filtre par slug de commune.
        Accepte soit un slug (texte) soit un ID (entier).
        """
        if not value:
            return queryset
        
        # Essayer de convertir en entier (ID)
        try:
            commune_id = int(value)
            return queryset.filter(commune_id=commune_id)
        except ValueError:
            # C'est un slug
            return queryset.filter(commune__slug=value)


class ActualiteFilter(CommuneSlugFilter):
    """Filtre pour les actualités"""
    categorie = django_filters.CharFilter(field_name='categorie')
    est_publie = django_filters.BooleanFilter(field_name='est_publie')
    est_mis_en_avant = django_filters.BooleanFilter(field_name='est_mis_en_avant')
    
    class Meta:
        model = Actualite
        fields = ['commune', 'categorie', 'est_publie', 'est_mis_en_avant']


class PageCMSFilter(CommuneSlugFilter):
    """Filtre pour les pages CMS"""
    est_publie = django_filters.BooleanFilter(field_name='est_publie')
    afficher_dans_menu = django_filters.BooleanFilter(field_name='afficher_dans_menu')
    
    class Meta:
        model = PageCMS
        fields = ['commune', 'est_publie', 'afficher_dans_menu']


class FAQFilter(CommuneSlugFilter):
    """Filtre pour les FAQ"""
    categorie = django_filters.CharFilter(field_name='categorie')
    
    class Meta:
        model = FAQ
        fields = ['commune', 'categorie']


class AbonneNewsletterFilter(CommuneSlugFilter):
    """Filtre pour les abonnés newsletter"""
    
    class Meta:
        model = AbonneNewsletter
        fields = ['commune']


class EvenementFilter(CommuneSlugFilter):
    """Filtre pour les événements"""
    categorie = django_filters.CharFilter(field_name='categorie')
    statut = django_filters.CharFilter(field_name='statut')
    est_public = django_filters.BooleanFilter(field_name='est_public')
    
    class Meta:
        model = Evenement
        fields = ['commune', 'categorie', 'statut', 'est_public']


class RendezVousFilter(CommuneSlugFilter):
    """Filtre pour les rendez-vous"""
    service = django_filters.NumberFilter(field_name='service')
    statut = django_filters.CharFilter(field_name='statut')
    
    class Meta:
        model = RendezVous
        fields = ['commune', 'service', 'statut']


class SignalementFilter(CommuneSlugFilter):
    """Filtre pour les signalements"""
    categorie = django_filters.CharFilter(field_name='categorie')
    statut = django_filters.CharFilter(field_name='statut')
    
    class Meta:
        model = Signalement
        fields = ['commune', 'categorie', 'statut']


class DemarcheFilter(CommuneSlugFilter):
    """Filtre pour les démarches"""
    statut = django_filters.CharFilter(field_name='statut')
    type_demarche = django_filters.CharFilter(field_name='type_demarche')
    
    class Meta:
        model = Demarche
        fields = ['commune', 'statut', 'type_demarche']


class ProjetFilter(CommuneSlugFilter):
    """Filtre pour les projets"""
    categorie = django_filters.CharFilter(field_name='categorie')
    statut = django_filters.CharFilter(field_name='statut')
    est_public = django_filters.BooleanFilter(field_name='est_public')
    
    class Meta:
        model = Projet
        fields = ['commune', 'categorie', 'statut', 'est_public']


class DeliberationFilter(CommuneSlugFilter):
    """Filtre pour les délibérations"""
    date_seance__year = django_filters.NumberFilter(field_name='date_seance', lookup_expr='year')
    
    class Meta:
        model = Deliberation
        fields = ['commune', 'date_seance__year']


class DocumentBudgetaireFilter(CommuneSlugFilter):
    """Filtre pour les documents budgétaires"""
    type_document = django_filters.CharFilter(field_name='type_document')
    annee = django_filters.NumberFilter(field_name='annee')
    
    class Meta:
        model = DocumentBudgetaire
        fields = ['commune', 'type_document', 'annee']


class DocumentOfficielFilter(CommuneSlugFilter):
    """Filtre pour les documents officiels"""
    type_document = django_filters.CharFilter(field_name='type_document')
    categorie = django_filters.CharFilter(field_name='categorie')
    
    class Meta:
        model = DocumentOfficiel
        fields = ['commune', 'type_document', 'categorie']


class ServiceMunicipalFilter(CommuneSlugFilter):
    """Filtre pour les services municipaux"""
    
    class Meta:
        model = ServiceMunicipal
        fields = ['commune']


class EquipeMunicipaleFilter(CommuneSlugFilter):
    """Filtre pour l'équipe municipale"""
    fonction = django_filters.CharFilter(field_name='fonction')
    
    class Meta:
        model = EquipeMunicipale
        fields = ['commune', 'fonction']


class ContactFilter(CommuneSlugFilter):
    """Filtre pour les messages de contact"""
    est_lu = django_filters.BooleanFilter(field_name='est_lu')
    est_traite = django_filters.BooleanFilter(field_name='est_traite')
    
    class Meta:
        model = Contact
        fields = ['commune', 'est_lu', 'est_traite']
