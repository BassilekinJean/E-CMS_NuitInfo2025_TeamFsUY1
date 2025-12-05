"""
Service de création de sous-sites communaux
Gère la création automatisée d'un site après validation d'une demande
"""
from django.db import transaction
from django.contrib.sites.models import Site
from django.utils import timezone
from django.utils.text import slugify
from django.utils.crypto import get_random_string

from communes.models import Commune, DemandeCreationSite, ServiceMunicipal
from core.models import Utilisateur


class SiteCreationService:
    """
    Service pour créer un sous-site communal complet
    
    Utilisation:
        service = SiteCreationService(demande)
        result = service.creer_site()
    """
    
    # Services par défaut créés pour chaque commune
    SERVICES_DEFAUT = [
        {
            'nom': 'État Civil',
            'description': 'Actes de naissance, mariage, décès, livret de famille',
            'icone': 'fas fa-id-card',
        },
        {
            'nom': 'Urbanisme',
            'description': 'Permis de construire, certificats d\'urbanisme, lotissements',
            'icone': 'fas fa-building',
        },
        {
            'nom': 'Affaires Sociales',
            'description': 'Aide sociale, handicap, personnes âgées',
            'icone': 'fas fa-hands-helping',
        },
        {
            'nom': 'Finances',
            'description': 'Taxes locales, impôts, budget communal',
            'icone': 'fas fa-coins',
        },
        {
            'nom': 'Voirie et Environnement',
            'description': 'Entretien des routes, éclairage, propreté',
            'icone': 'fas fa-road',
        },
    ]
    
    def __init__(self, demande: DemandeCreationSite):
        self.demande = demande
        self.commune = None
        self.admin_user = None
        self.site = None
    
    @transaction.atomic
    def creer_site(self) -> dict:
        """
        Crée le sous-site complet :
        1. Crée l'objet Site Django
        2. Crée la Commune
        3. Crée l'utilisateur admin
        4. Crée les services par défaut
        5. Met à jour la demande
        
        Retourne un dict avec les infos de création
        """
        
        if self.demande.statut != DemandeCreationSite.Statut.EN_ATTENTE:
            raise ValueError(f"La demande n'est pas en attente (statut: {self.demande.statut})")
        
        # 1. Générer le slug unique
        slug = self._generer_slug()
        
        # 2. Créer le Site Django
        self.site = self._creer_site_django(slug)
        
        # 3. Créer la Commune
        self.commune = self._creer_commune(slug)
        
        # 4. Créer l'admin de la commune
        self.admin_user, password = self._creer_admin()
        
        # 5. Créer les services par défaut
        self._creer_services_defaut()
        
        # 6. Mettre à jour la demande
        self._finaliser_demande()
        
        return {
            'success': True,
            'commune': {
                'id': self.commune.id,
                'nom': self.commune.nom,
                'slug': self.commune.slug,
                'domaine': self.commune.get_domaine(),
            },
            'admin': {
                'email': self.admin_user.email,
                'password': password,  # À envoyer par email sécurisé
            },
            'site': {
                'id': self.site.id,
                'domain': self.site.domain,
            },
            'message': f"Site {self.commune.nom} créé avec succès!"
        }
    
    def _generer_slug(self) -> str:
        """Génère un slug unique pour la commune"""
        base_slug = slugify(self.demande.nom_commune)
        slug = base_slug
        counter = 1
        
        while Commune.objects.filter(slug=slug).exists():
            slug = f"{base_slug}-{counter}"
            counter += 1
        
        return slug
    
    def _creer_site_django(self, slug: str) -> Site:
        """Crée l'objet Site Django pour le multisite"""
        domain = f"{slug}.ecms.cm"
        
        site = Site.objects.create(
            domain=domain,
            name=self.demande.nom_commune
        )
        
        return site
    
    def _creer_commune(self, slug: str) -> Commune:
        """Crée l'objet Commune"""
        commune = Commune.objects.create(
            site=self.site,
            nom=self.demande.nom_commune,
            slug=slug,
            departement=self.demande.departement,
            population=self.demande.population,
            adresse=self.demande.adresse,
            email=self.demande.email_referent,
            telephone=self.demande.telephone_referent,
            statut=Commune.Statut.ACTIVE,
            date_validation=timezone.now(),
        )
        
        return commune
    
    def _creer_admin(self) -> tuple:
        """
        Crée l'utilisateur administrateur de la commune
        Retourne (utilisateur, mot_de_passe)
        """
        # Générer un mot de passe temporaire
        password = get_random_string(12)
        
        # Créer l'utilisateur
        admin = Utilisateur.objects.create_user(
            email=self.demande.email_referent,
            password=password,
            nom=self.demande.nom_referent,
            role=Utilisateur.Role.ADMIN_COMMUNE,
            commune=self.commune,
            is_active=True,
            email_verifie=True,  # Validé par l'admin
        )
        
        return admin, password
    
    def _creer_services_defaut(self):
        """Crée les services municipaux par défaut"""
        for i, service_data in enumerate(self.SERVICES_DEFAUT):
            ServiceMunicipal.objects.create(
                commune=self.commune,
                ordre=i + 1,
                est_actif=True,
                **service_data
            )
    
    def _finaliser_demande(self):
        """Met à jour la demande après création"""
        self.demande.statut = DemandeCreationSite.Statut.VALIDEE
        self.demande.date_traitement = timezone.now()
        self.demande.commune_creee = self.commune
        self.demande.save()


def valider_demande(demande_id: int, notes: str = "") -> dict:
    """
    Fonction utilitaire pour valider une demande et créer le site
    
    Utilisation:
        from communes.services import valider_demande
        result = valider_demande(42, notes="Dossier complet")
    """
    demande = DemandeCreationSite.objects.get(id=demande_id)
    
    if notes:
        demande.notes_admin = notes
        demande.save(update_fields=['notes_admin'])
    
    service = SiteCreationService(demande)
    return service.creer_site()


def rejeter_demande(demande_id: int, motif: str) -> dict:
    """
    Rejette une demande de création de site
    
    Utilisation:
        from communes.services import rejeter_demande
        result = rejeter_demande(42, motif="Documents manquants")
    """
    demande = DemandeCreationSite.objects.get(id=demande_id)
    
    if demande.statut != DemandeCreationSite.Statut.EN_ATTENTE:
        raise ValueError(f"La demande n'est pas en attente")
    
    demande.statut = DemandeCreationSite.Statut.REJETEE
    demande.motif_rejet = motif
    demande.date_traitement = timezone.now()
    demande.save()
    
    return {
        'success': True,
        'message': f"Demande {demande.nom_commune} rejetée",
        'motif': motif
    }
