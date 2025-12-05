"""
Tests pour le module Communes - Multisite
"""
from django.test import TestCase
from django.contrib.auth import get_user_model
from django.contrib.sites.models import Site
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken

from communes.models import Region, Departement, Commune, DemandeCreationSite, ServiceMunicipal
from communes.services import SiteCreationService

Utilisateur = get_user_model()


class RegionDepartementTest(TestCase):
    """Tests pour les régions et départements"""
    
    def setUp(self):
        self.region = Region.objects.create(nom='Centre', code='CE')
        self.departement = Departement.objects.create(
            region=self.region,
            nom='Mfoundi',
            code='MF'
        )
    
    def test_region_creation(self):
        """Test création de région"""
        self.assertEqual(self.region.nom, 'Centre')
        self.assertEqual(str(self.region), 'Centre')
    
    def test_departement_creation(self):
        """Test création de département"""
        self.assertEqual(self.departement.nom, 'Mfoundi')
        self.assertEqual(self.departement.region, self.region)
        self.assertIn('Mfoundi', str(self.departement))
    
    def test_region_departements_relation(self):
        """Test relation région -> départements"""
        self.assertEqual(self.region.departements.count(), 1)
        self.assertEqual(self.region.departements.first(), self.departement)


class CommuneModelTest(TestCase):
    """Tests pour le modèle Commune"""
    
    def setUp(self):
        self.region = Region.objects.create(nom='Centre', code='CE')
        self.departement = Departement.objects.create(
            region=self.region,
            nom='Mfoundi',
            code='MF'
        )
    
    def test_commune_creation(self):
        """Test création d'une commune"""
        commune = Commune.objects.create(
            nom='Yaoundé 1er',
            slug='yaounde-1',
            departement=self.departement,
            population=350000,
            statut=Commune.Statut.ACTIVE
        )
        self.assertEqual(commune.nom, 'Yaoundé 1er')
        self.assertEqual(commune.slug, 'yaounde-1')
        self.assertTrue(commune.is_active())
    
    def test_commune_auto_slug(self):
        """Test génération automatique du slug"""
        commune = Commune.objects.create(
            nom='Douala 3ème',
            departement=self.departement
        )
        self.assertEqual(commune.slug, 'douala-3eme')
    
    def test_commune_domaine(self):
        """Test génération du domaine"""
        commune = Commune.objects.create(
            nom='Test Commune',
            slug='test-commune',
            departement=self.departement
        )
        self.assertEqual(commune.get_domaine(), 'test-commune.ecms.cm')
    
    def test_commune_with_site(self):
        """Test commune avec Site Django"""
        site = Site.objects.create(domain='ma-commune.ecms.cm', name='Ma Commune')
        commune = Commune.objects.create(
            nom='Ma Commune',
            slug='ma-commune',
            departement=self.departement,
            site=site
        )
        self.assertEqual(commune.get_domaine(), 'ma-commune.ecms.cm')


class DemandeCreationSiteTest(TestCase):
    """Tests pour les demandes de création de site"""
    
    def setUp(self):
        self.region = Region.objects.create(nom='Littoral', code='LT')
        self.departement = Departement.objects.create(
            region=self.region,
            nom='Wouri',
            code='WR'
        )
    
    def test_demande_creation(self):
        """Test création d'une demande"""
        demande = DemandeCreationSite.objects.create(
            nom_commune='Douala 5ème',
            departement=self.departement,
            population=200000,
            adresse='BP 500, Douala',
            nom_referent='Jean Test',
            fonction_referent='Maire',
            email_referent='jean@test.cm',
            telephone_referent='+237 699 000 000',
            accepte_charte=True,
            accepte_confidentialite=True
        )
        self.assertEqual(demande.statut, DemandeCreationSite.Statut.EN_ATTENTE)
        self.assertIn('Douala 5ème', str(demande))


class SiteCreationServiceTest(TestCase):
    """Tests pour le service de création de sites"""
    
    def setUp(self):
        self.region = Region.objects.create(nom='Sud', code='SU')
        self.departement = Departement.objects.create(
            region=self.region,
            nom='Océan',
            code='OC'
        )
        self.demande = DemandeCreationSite.objects.create(
            nom_commune='Kribi',
            departement=self.departement,
            population=100000,
            adresse='BP 100, Kribi',
            nom_referent='Marie Admin',
            fonction_referent='Maire',
            email_referent='marie@kribi.cm',
            telephone_referent='+237 699 111 111',
            accepte_charte=True,
            accepte_confidentialite=True
        )
    
    def test_site_creation_complete(self):
        """Test création complète d'un site"""
        service = SiteCreationService(self.demande)
        result = service.creer_site()
        
        # Vérifier le succès
        self.assertTrue(result['success'])
        
        # Vérifier la commune
        self.assertEqual(result['commune']['nom'], 'Kribi')
        self.assertEqual(result['commune']['slug'], 'kribi')
        
        # Vérifier l'admin
        self.assertEqual(result['admin']['email'], 'marie@kribi.cm')
        self.assertIn('password', result['admin'])
        
        # Vérifier le site Django
        self.assertEqual(result['site']['domain'], 'kribi.ecms.cm')
        
        # Vérifier en base
        commune = Commune.objects.get(slug='kribi')
        self.assertEqual(commune.statut, Commune.Statut.ACTIVE)
        
        # Vérifier les services créés
        services = ServiceMunicipal.objects.filter(commune=commune)
        self.assertEqual(services.count(), 5)
        
        # Vérifier l'utilisateur admin
        admin = Utilisateur.objects.get(email='marie@kribi.cm')
        self.assertEqual(admin.role, Utilisateur.Role.ADMIN_COMMUNE)
        self.assertEqual(admin.commune, commune)
        
        # Vérifier la demande mise à jour
        self.demande.refresh_from_db()
        self.assertEqual(self.demande.statut, DemandeCreationSite.Statut.VALIDEE)
        self.assertEqual(self.demande.commune_creee, commune)
    
    def test_site_creation_demande_non_attente(self):
        """Test erreur si demande pas en attente"""
        self.demande.statut = DemandeCreationSite.Statut.REJETEE
        self.demande.save()
        
        service = SiteCreationService(self.demande)
        
        with self.assertRaises(ValueError):
            service.creer_site()
    
    def test_slug_unique(self):
        """Test génération de slug unique"""
        # Créer une première commune avec le même nom
        Commune.objects.create(
            nom='Kribi',
            slug='kribi',
            departement=self.departement
        )
        
        # Le service doit créer un slug différent
        service = SiteCreationService(self.demande)
        result = service.creer_site()
        
        self.assertEqual(result['commune']['slug'], 'kribi-1')


class CommuneAPITest(APITestCase):
    """Tests pour l'API des communes"""
    
    def setUp(self):
        self.client = APIClient()
        self.region = Region.objects.create(nom='Centre', code='CE')
        self.departement = Departement.objects.create(
            region=self.region,
            nom='Mfoundi',
            code='MF'
        )
        self.commune = Commune.objects.create(
            nom='Yaoundé Test',
            slug='yaounde-test',
            departement=self.departement,
            statut=Commune.Statut.ACTIVE
        )
        self.admin = Utilisateur.objects.create_superuser(
            email='admin@test.cm',
            nom='Admin',
            password='adminpass'
        )
    
    def test_list_regions(self):
        """Test liste des régions (public)"""
        response = self.client.get('/api/v1/regions/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_list_departements(self):
        """Test liste des départements (public)"""
        response = self.client.get('/api/v1/departements/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_list_communes(self):
        """Test liste des communes (public)"""
        response = self.client.get('/api/v1/communes/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
    
    def test_commune_detail(self):
        """Test détail d'une commune"""
        response = self.client.get(f'/api/v1/communes/{self.commune.slug}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['nom'], 'Yaoundé Test')
    
    def test_create_demande_public(self):
        """Test création de demande (public)"""
        data = {
            'nom_commune': 'Nouvelle Commune',
            'departement': self.departement.id,
            'population': 50000,
            'adresse': 'BP 123',
            'nom_referent': 'Jean Test',
            'fonction_referent': 'Maire',
            'email_referent': 'jean@test.cm',
            'telephone_referent': '+237 699 999 999',
            'accepte_charte': True,
            'accepte_confidentialite': True
        }
        response = self.client.post('/api/v1/demandes-creation/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
    
    def test_valider_demande_authenticated(self):
        """Test validation de demande (admin requis)"""
        demande = DemandeCreationSite.objects.create(
            nom_commune='Test Validation',
            departement=self.departement,
            adresse='Test',
            nom_referent='Test',
            fonction_referent='Maire',
            email_referent='validation@test.cm',
            telephone_referent='+237 600 000 000',
            accepte_charte=True,
            accepte_confidentialite=True
        )
        
        # Authentifier comme admin
        refresh = RefreshToken.for_user(self.admin)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
        
        response = self.client.post(f'/api/v1/demandes-creation/{demande.id}/valider/')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data['success'])
    
    def test_valider_demande_unauthenticated(self):
        """Test validation de demande sans auth"""
        demande = DemandeCreationSite.objects.create(
            nom_commune='Test No Auth',
            departement=self.departement,
            adresse='Test',
            nom_referent='Test',
            fonction_referent='Maire',
            email_referent='noauth@test.cm',
            telephone_referent='+237 600 000 001',
            accepte_charte=True,
            accepte_confidentialite=True
        )
        
        response = self.client.post(f'/api/v1/demandes-creation/{demande.id}/valider/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
