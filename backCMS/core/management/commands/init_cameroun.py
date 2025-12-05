"""
Commande pour initialiser les données du Cameroun
Régions, Départements et données de démonstration
"""
from django.core.management.base import BaseCommand
from django.utils import timezone
from django.contrib.sites.models import Site
from decimal import Decimal
import random

from communes.models import Region, Departement, Commune, ServiceMunicipal, EquipeMunicipale
from actualites.models import Actualite, PageCMS, FAQ
from evenements.models import Evenement
from transparence.models import Projet
from core.models import ConfigurationPortail, Utilisateur


class Command(BaseCommand):
    help = 'Initialise les données du Cameroun (régions, départements) et crée des données de démonstration'

    def add_arguments(self, parser):
        parser.add_argument(
            '--demo',
            action='store_true',
            help='Ajoute des données de démonstration (communes, actualités, etc.)',
        )
        parser.add_argument(
            '--force',
            action='store_true',
            help='Force la recréation des données même si elles existent',
        )

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE('🇨🇲 Initialisation des données du Cameroun...'))
        
        # Créer les régions et départements
        self.create_regions_departements(options['force'])
        
        # Créer la configuration du portail
        self.create_configuration_portail()
        
        # Créer les données de démonstration si demandé
        if options['demo']:
            self.create_demo_data()
        
        self.stdout.write(self.style.SUCCESS('✅ Initialisation terminée!'))

    def create_regions_departements(self, force=False):
        """Crée les 10 régions et leurs départements"""
        
        if Region.objects.exists() and not force:
            self.stdout.write(self.style.WARNING('⚠️ Régions existantes, utiliser --force pour recréer'))
            return
        
        if force:
            Departement.objects.all().delete()
            Region.objects.all().delete()
        
        # Données des régions et départements du Cameroun
        REGIONS_DATA = {
            'Adamaoua': {
                'code': 'AD',
                'departements': [
                    ('Djérem', 'DJ'),
                    ('Faro-et-Déo', 'FD'),
                    ('Mayo-Banyo', 'MB'),
                    ('Mbéré', 'MBE'),
                    ('Vina', 'VI'),
                ]
            },
            'Centre': {
                'code': 'CE',
                'departements': [
                    ('Haute-Sanaga', 'HS'),
                    ('Lékié', 'LK'),
                    ('Mbam-et-Inoubou', 'MI'),
                    ('Mbam-et-Kim', 'MK'),
                    ('Méfou-et-Afamba', 'MA'),
                    ('Méfou-et-Akono', 'MAK'),
                    ('Mfoundi', 'MF'),
                    ('Nyong-et-Kéllé', 'NK'),
                    ('Nyong-et-Mfoumou', 'NM'),
                    ('Nyong-et-So\'o', 'NS'),
                ]
            },
            'Est': {
                'code': 'ES',
                'departements': [
                    ('Boumba-et-Ngoko', 'BN'),
                    ('Haut-Nyong', 'HN'),
                    ('Kadey', 'KD'),
                    ('Lom-et-Djérem', 'LD'),
                ]
            },
            'Extrême-Nord': {
                'code': 'EN',
                'departements': [
                    ('Diamaré', 'DM'),
                    ('Logone-et-Chari', 'LC'),
                    ('Mayo-Danay', 'MD'),
                    ('Mayo-Kani', 'MKN'),
                    ('Mayo-Sava', 'MS'),
                    ('Mayo-Tsanaga', 'MT'),
                ]
            },
            'Littoral': {
                'code': 'LT',
                'departements': [
                    ('Moungo', 'MG'),
                    ('Nkam', 'NKM'),
                    ('Sanaga-Maritime', 'SM'),
                    ('Wouri', 'WR'),
                ]
            },
            'Nord': {
                'code': 'NO',
                'departements': [
                    ('Bénoué', 'BE'),
                    ('Faro', 'FA'),
                    ('Mayo-Louti', 'ML'),
                    ('Mayo-Rey', 'MR'),
                ]
            },
            'Nord-Ouest': {
                'code': 'NW',
                'departements': [
                    ('Boyo', 'BY'),
                    ('Bui', 'BU'),
                    ('Donga-Mantung', 'DGM'),
                    ('Menchum', 'MC'),
                    ('Mezam', 'MZ'),
                    ('Momo', 'MM'),
                    ('Ngo-Ketunjia', 'NGK'),
                ]
            },
            'Ouest': {
                'code': 'OU',
                'departements': [
                    ('Bamboutos', 'BB'),
                    ('Haut-Nkam', 'HNK'),
                    ('Hauts-Plateaux', 'HP'),
                    ('Koung-Khi', 'KK'),
                    ('Menoua', 'MN'),
                    ('Mifi', 'MIF'),
                    ('Ndé', 'ND'),
                    ('Noun', 'NN'),
                ]
            },
            'Sud': {
                'code': 'SU',
                'departements': [
                    ('Dja-et-Lobo', 'DL'),
                    ('Mvila', 'MV'),
                    ('Océan', 'OC'),
                    ('Vallée-du-Ntem', 'VN'),
                ]
            },
            'Sud-Ouest': {
                'code': 'SW',
                'departements': [
                    ('Fako', 'FK'),
                    ('Koupé-Manengouba', 'KM'),
                    ('Lebialem', 'LB'),
                    ('Manyu', 'MY'),
                    ('Meme', 'ME'),
                    ('Ndian', 'NDN'),
                ]
            },
        }
        
        for region_nom, region_data in REGIONS_DATA.items():
            region = Region.objects.create(
                nom=region_nom,
                code=region_data['code']
            )
            self.stdout.write(f'  📍 Région: {region_nom}')
            
            for dept_nom, dept_code in region_data['departements']:
                Departement.objects.create(
                    region=region,
                    nom=dept_nom,
                    code=dept_code
                )
        
        self.stdout.write(self.style.SUCCESS(f'✅ {Region.objects.count()} régions et {Departement.objects.count()} départements créés'))

    def create_configuration_portail(self):
        """Crée la configuration du portail national"""
        config, created = ConfigurationPortail.objects.get_or_create(pk=1)
        if created:
            config.nom_portail = 'E-CMS Cameroun'
            config.slogan = 'Le portail des communes camerounaises'
            config.description = 'Plateforme numérique de gestion des sites communaux du Cameroun'
            config.couleur_primaire = '#007A3D'  # Vert du drapeau
            config.couleur_secondaire = '#CE1126'  # Rouge du drapeau
            config.email_contact = 'contact@ecms.cm'
            config.meta_titre = 'E-CMS - Portail des Communes du Cameroun'
            config.meta_description = 'Accédez aux services en ligne des communes camerounaises'
            config.save()
            self.stdout.write(self.style.SUCCESS('✅ Configuration du portail créée'))

    def create_demo_data(self):
        """Crée des données de démonstration"""
        self.stdout.write(self.style.NOTICE('📦 Création des données de démonstration...'))
        
        # Créer le site Django
        site, _ = Site.objects.get_or_create(pk=1, defaults={
            'domain': 'localhost:8000',
            'name': 'E-CMS Local'
        })
        
        # Récupérer quelques départements pour les communes de démo
        mfoundi = Departement.objects.filter(code='MF').first()
        wouri = Departement.objects.filter(code='WR').first()
        mifi = Departement.objects.filter(code='MIF').first()
        
        if not mfoundi or not wouri:
            self.stdout.write(self.style.ERROR('❌ Départements non trouvés, exécutez d\'abord sans --demo'))
            return
        
        # Créer des communes de démonstration
        communes_data = [
            {
                'nom': 'Yaoundé 1er',
                'slug': 'yaounde-1',
                'departement': mfoundi,
                'population': 350000,
                'description': 'Commune de Yaoundé 1er, cœur administratif de la capitale.',
                'nom_maire': 'Jean-Pierre Mbarga',
                'adresse': 'Hôtel de Ville, Centre-ville, Yaoundé',
                'telephone': '+237 222 23 45 67',
                'email': 'mairie@yaounde1.cm',
                'latitude': Decimal('3.8667'),
                'longitude': Decimal('11.5167'),
                'statut': Commune.Statut.ACTIVE,
            },
            {
                'nom': 'Douala 3ème',
                'slug': 'douala-3',
                'departement': wouri,
                'population': 450000,
                'description': 'Commune de Douala 3ème, zone industrielle et commerciale.',
                'nom_maire': 'Marie-Claire Eyoum',
                'adresse': 'Hôtel de Ville, Bassa, Douala',
                'telephone': '+237 233 42 56 78',
                'email': 'mairie@douala3.cm',
                'latitude': Decimal('4.0511'),
                'longitude': Decimal('9.7679'),
                'statut': Commune.Statut.ACTIVE,
            },
            {
                'nom': 'Bafoussam 1er',
                'slug': 'bafoussam-1',
                'departement': mifi,
                'population': 180000,
                'description': 'Commune de Bafoussam 1er, capitale de la région de l\'Ouest.',
                'nom_maire': 'Paul Tchouta',
                'adresse': 'Hôtel de Ville, Centre, Bafoussam',
                'telephone': '+237 233 44 12 34',
                'email': 'mairie@bafoussam1.cm',
                'latitude': Decimal('5.4737'),
                'longitude': Decimal('10.4176'),
                'statut': Commune.Statut.ACTIVE,
            },
        ]
        
        for data in communes_data:
            commune, created = Commune.objects.get_or_create(
                slug=data['slug'],
                defaults=data
            )
            if created:
                self.stdout.write(f'  🏛️ Commune: {commune.nom}')
                self.create_commune_content(commune)
        
        self.stdout.write(self.style.SUCCESS(f'✅ {Commune.objects.count()} communes de démonstration créées'))

    def create_commune_content(self, commune):
        """Crée le contenu pour une commune (actualités, événements, etc.)"""
        
        # Récupérer ou créer un admin
        admin = Utilisateur.objects.filter(role=Utilisateur.Role.SUPER_ADMIN).first()
        
        # Services municipaux
        services = [
            ('État Civil', 'Actes de naissance, mariage, décès', 'fas fa-id-card'),
            ('Urbanisme', 'Permis de construire, certificats', 'fas fa-building'),
            ('Affaires Sociales', 'Aide sociale, handicap', 'fas fa-hands-helping'),
            ('Finances', 'Taxes, impôts locaux', 'fas fa-coins'),
        ]
        
        for nom, desc, icone in services:
            ServiceMunicipal.objects.get_or_create(
                commune=commune,
                nom=nom,
                defaults={
                    'description': desc,
                    'icone': icone,
                    'est_actif': True
                }
            )
        
        # Équipe municipale
        equipe = [
            (commune.nom_maire, EquipeMunicipale.Fonction.MAIRE, ''),
            ('Adjoint(e) 1', EquipeMunicipale.Fonction.ADJOINT, 'Finances et Budget'),
            ('Adjoint(e) 2', EquipeMunicipale.Fonction.ADJOINT, 'Urbanisme et Développement'),
        ]
        
        for nom, fonction, detail in equipe:
            EquipeMunicipale.objects.get_or_create(
                commune=commune,
                nom=nom,
                fonction=fonction,
                defaults={
                    'fonction_detail': detail,
                    'est_visible': True
                }
            )
        
        # Actualités
        actualites = [
            {
                'titre': f'Bienvenue sur le site de {commune.nom}',
                'resume': f'Découvrez le nouveau portail numérique de la commune de {commune.nom}.',
                'contenu': f'''
                    <p>La commune de {commune.nom} est heureuse de vous accueillir sur son nouveau portail numérique.</p>
                    <p>Ce site vous permet de :</p>
                    <ul>
                        <li>Consulter les actualités de votre commune</li>
                        <li>Découvrir les événements à venir</li>
                        <li>Effectuer vos démarches administratives en ligne</li>
                        <li>Signaler des problèmes dans votre quartier</li>
                    </ul>
                    <p>N'hésitez pas à nous contacter pour toute question.</p>
                ''',
                'categorie': Actualite.Categorie.COMMUNIQUE,
                'est_publie': True,
                'est_mis_en_avant': True,
            },
            {
                'titre': 'Campagne de vaccination gratuite',
                'resume': 'Une campagne de vaccination gratuite sera organisée ce mois.',
                'contenu': '<p>Dans le cadre de la santé publique, une campagne de vaccination gratuite sera organisée.</p>',
                'categorie': Actualite.Categorie.AVIS_PUBLIC,
                'est_publie': True,
            },
            {
                'titre': 'Travaux de réfection des routes',
                'resume': 'Des travaux de réfection sont en cours sur plusieurs axes routiers.',
                'contenu': '<p>La commune informe la population que des travaux de réfection routière sont en cours.</p>',
                'categorie': Actualite.Categorie.VIE_MUNICIPALE,
                'est_publie': True,
            },
        ]
        
        for i, data in enumerate(actualites):
            Actualite.objects.get_or_create(
                commune=commune,
                slug=f"{commune.slug}-actu-{i+1}",
                defaults={
                    **data,
                    'auteur': admin,
                    'date_publication': timezone.now(),
                }
            )
        
        # Pages CMS
        pages = [
            {
                'titre': 'Présentation',
                'slug': 'presentation',
                'contenu': f'''
                    <h2>Bienvenue à {commune.nom}</h2>
                    <p>{commune.description}</p>
                    <h3>Notre Mission</h3>
                    <p>La commune s'engage à servir ses citoyens avec efficacité et transparence.</p>
                ''',
            },
            {
                'titre': 'Services',
                'slug': 'services',
                'contenu': '''
                    <h2>Nos Services</h2>
                    <p>Découvrez l'ensemble des services proposés par votre mairie.</p>
                ''',
            },
        ]
        
        for data in pages:
            PageCMS.objects.get_or_create(
                commune=commune,
                slug=data['slug'],
                defaults={
                    **data,
                    'est_publie': True,
                }
            )
        
        # FAQ
        faqs = [
            ('Comment obtenir un acte de naissance ?', 'Rendez-vous au service État Civil avec une pièce d\'identité.'),
            ('Quels sont les horaires de la mairie ?', 'Du lundi au vendredi, de 8h à 15h30.'),
            ('Comment signaler un problème ?', 'Utilisez notre formulaire de signalement en ligne.'),
        ]
        
        for question, reponse in faqs:
            FAQ.objects.get_or_create(
                commune=commune,
                question=question,
                defaults={
                    'reponse': reponse,
                    'est_active': True,
                }
            )
        
        # Événements
        evenements = [
            {
                'nom': 'Conseil Municipal',
                'description': 'Session ordinaire du conseil municipal.',
                'categorie': Evenement.Categorie.CONSEIL,
                'lieu': 'Salle du Conseil, Hôtel de Ville',
            },
            {
                'nom': 'Journée Portes Ouvertes',
                'description': 'Venez découvrir les services de votre mairie.',
                'categorie': Evenement.Categorie.REUNION,
                'lieu': 'Hôtel de Ville',
            },
            {
                'nom': 'Festival Culturel',
                'description': 'Célébration de la diversité culturelle de notre commune.',
                'categorie': Evenement.Categorie.CULTUREL,
                'lieu': 'Place Centrale',
            },
        ]
        
        from datetime import timedelta, time
        for i, data in enumerate(evenements):
            Evenement.objects.get_or_create(
                commune=commune,
                slug=f"{commune.slug}-evt-{i+1}",
                defaults={
                    **data,
                    'date': timezone.now().date() + timedelta(days=7+i*7),
                    'heure_debut': time(9, 0),
                    'heure_fin': time(17, 0),
                    'statut': Evenement.Statut.CONFIRME,
                    'est_public': True,
                }
            )
        
        # Projets
        projets = [
            {
                'titre': 'Rénovation du marché central',
                'description': 'Modernisation des infrastructures du marché.',
                'budget': Decimal('150000000'),
                'avancement': 45,
                'categorie': Projet.Categorie.BATIMENTS,
                'statut': Projet.Statut.EN_COURS,
            },
            {
                'titre': 'Éclairage public LED',
                'description': 'Installation de lampadaires LED dans les quartiers.',
                'budget': Decimal('50000000'),
                'avancement': 80,
                'categorie': Projet.Categorie.VOIRIE,
                'statut': Projet.Statut.EN_COURS,
            },
            {
                'titre': 'Construction école primaire',
                'description': 'Nouvelle école primaire pour le quartier Nord.',
                'budget': Decimal('200000000'),
                'avancement': 10,
                'categorie': Projet.Categorie.EDUCATION,
                'statut': Projet.Statut.PLANIFIE,
            },
        ]
        
        for i, data in enumerate(projets):
            Projet.objects.get_or_create(
                commune=commune,
                slug=f"{commune.slug}-projet-{i+1}",
                defaults={
                    **data,
                    'date_debut': timezone.now().date(),
                    'date_fin': timezone.now().date() + timedelta(days=180),
                    'est_public': True,
                }
            )
