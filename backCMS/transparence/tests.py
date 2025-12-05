"""
Tests pour le module Transparence (Projets, Délibérations, Budget)
"""
from django.test import TestCase
from django.utils import timezone
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from decimal import Decimal
from datetime import timedelta

from communes.models import Region, Departement, Commune
from transparence.models import Projet, Deliberation, DocumentBudgetaire, DocumentOfficiel

Utilisateur = get_user_model()


class ProjetModelTest(TestCase):
    """Tests pour le modèle Projet"""
    
    def setUp(self):
        self.region = Region.objects.create(nom='Centre', code='CE')
        self.departement = Departement.objects.create(
            region=self.region, nom='Mfoundi', code='MF'
        )
        self.commune = Commune.objects.create(
            nom='Test Commune',
            slug='test-commune',
            departement=self.departement,
            statut=Commune.Statut.ACTIVE
        )
    
    def test_projet_creation(self):
        """Test création d'un projet"""
        projet = Projet.objects.create(
            commune=self.commune,
            titre='Construction école',
            slug='construction-ecole',
            description='Construction d\'une nouvelle école primaire',
            budget=Decimal('150000000'),
            categorie=Projet.Categorie.EDUCATION,
            statut=Projet.Statut.PLANIFIE,
            date_debut=timezone.now().date(),
            date_fin=timezone.now().date() + timedelta(days=365),
            est_public=True
        )
        self.assertEqual(projet.titre, 'Construction école')
        self.assertEqual(projet.avancement, 0)
    
    def test_projet_avancement_bounds(self):
        """Test que l'avancement reste entre 0 et 100"""
        projet = Projet.objects.create(
            commune=self.commune,
            titre='Test Avancement',
            slug='test-avancement',
            description='Test',
            budget=Decimal('1000000'),
            categorie=Projet.Categorie.VOIRIE,
            avancement=50,
            date_debut=timezone.now().date(),
            date_fin=timezone.now().date() + timedelta(days=30)
        )
        self.assertEqual(projet.avancement, 50)
        
        # Avancement à 100%
        projet.avancement = 100
        projet.save()
        self.assertEqual(projet.avancement, 100)
    
    def test_projet_budget_depense(self):
        """Test suivi du budget dépensé"""
        projet = Projet.objects.create(
            commune=self.commune,
            titre='Test Budget',
            slug='test-budget',
            description='Test',
            budget=Decimal('100000000'),
            budget_depense=Decimal('25000000'),
            categorie=Projet.Categorie.BATIMENTS,
            date_debut=timezone.now().date(),
            date_fin=timezone.now().date() + timedelta(days=30)
        )
        self.assertEqual(projet.budget_depense, Decimal('25000000'))
        # 25% du budget dépensé
        pourcentage = (projet.budget_depense / projet.budget) * 100
        self.assertEqual(pourcentage, 25)


class DeliberationModelTest(TestCase):
    """Tests pour le modèle Délibération"""
    
    def setUp(self):
        self.region = Region.objects.create(nom='Centre', code='CE')
        self.departement = Departement.objects.create(
            region=self.region, nom='Mfoundi', code='MF'
        )
        self.commune = Commune.objects.create(
            nom='Test Commune',
            slug='test-commune',
            departement=self.departement
        )
    
    def test_deliberation_creation(self):
        """Test création d'une délibération"""
        delib = Deliberation.objects.create(
            commune=self.commune,
            numero='DEL-2025-001',
            titre='Budget primitif 2025',
            resume='Adoption du budget primitif',
            date_seance=timezone.now().date(),
            est_publie=True
        )
        self.assertEqual(delib.numero, 'DEL-2025-001')
        self.assertTrue(delib.est_publie)


class DocumentBudgetaireModelTest(TestCase):
    """Tests pour le modèle DocumentBudgetaire"""
    
    def setUp(self):
        self.region = Region.objects.create(nom='Centre', code='CE')
        self.departement = Departement.objects.create(
            region=self.region, nom='Mfoundi', code='MF'
        )
        self.commune = Commune.objects.create(
            nom='Test Commune',
            slug='test-commune',
            departement=self.departement
        )
    
    def test_document_budgetaire_creation(self):
        """Test création d'un document budgétaire"""
        doc = DocumentBudgetaire.objects.create(
            commune=self.commune,
            titre='Budget 2025',
            type_document=DocumentBudgetaire.TypeDocument.BUDGET_PRIMITIF,
            annee=2025,
            montant_total=Decimal('500000000'),
            est_publie=True
        )
        self.assertEqual(doc.annee, 2025)
        self.assertEqual(doc.montant_total, Decimal('500000000'))


class ProjetAPITest(APITestCase):
    """Tests pour l'API des projets"""
    
    def setUp(self):
        self.client = APIClient()
        self.region = Region.objects.create(nom='Centre', code='CE')
        self.departement = Departement.objects.create(
            region=self.region, nom='Mfoundi', code='MF'
        )
        self.commune = Commune.objects.create(
            nom='Test Commune',
            slug='test-commune',
            departement=self.departement,
            statut=Commune.Statut.ACTIVE
        )
        self.admin = Utilisateur.objects.create_superuser(
            email='admin@test.cm',
            nom='Admin',
            password='adminpass'
        )
        self.projet = Projet.objects.create(
            commune=self.commune,
            titre='Projet Public',
            slug='projet-public',
            description='Description test',
            budget=Decimal('100000000'),
            categorie=Projet.Categorie.VOIRIE,
            statut=Projet.Statut.EN_COURS,
            avancement=50,
            est_public=True,
            date_debut=timezone.now().date(),
            date_fin=timezone.now().date() + timedelta(days=365)
        )
    
    def test_list_projets_public(self):
        """Test liste des projets (public)"""
        response = self.client.get('/api/v1/projets/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
    
    def test_projet_detail(self):
        """Test détail d'un projet"""
        response = self.client.get(f'/api/v1/projets/{self.projet.slug}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['titre'], 'Projet Public')
        self.assertEqual(response.data['avancement'], 50)
    
    def test_filter_projets_by_statut(self):
        """Test filtre par statut"""
        response = self.client.get('/api/v1/projets/?statut=en_cours')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
    
    def test_filter_projets_by_categorie(self):
        """Test filtre par catégorie"""
        response = self.client.get('/api/v1/projets/?categorie=voirie')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_projet_prive_non_visible(self):
        """Test qu'un projet privé n'est pas visible publiquement"""
        Projet.objects.create(
            commune=self.commune,
            titre='Projet Privé',
            slug='projet-prive',
            description='Test',
            budget=Decimal('50000000'),
            categorie=Projet.Categorie.BATIMENTS,
            est_public=False,
            date_debut=timezone.now().date(),
            date_fin=timezone.now().date() + timedelta(days=30)
        )
        response = self.client.get('/api/v1/projets/')
        # Seul le projet public doit être visible
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['titre'], 'Projet Public')
    
    def test_create_projet_authenticated(self):
        """Test création de projet (authentifié)"""
        refresh = RefreshToken.for_user(self.admin)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
        
        data = {
            'commune': self.commune.id,
            'titre': 'Nouveau Projet',
            'slug': 'nouveau-projet',
            'description': 'Description',
            'budget': '200000000',
            'categorie': 'education',
            'statut': 'planifie',
            'date_debut': '2025-01-01',
            'date_fin': '2025-12-31',
            'est_public': True
        }
        response = self.client.post('/api/v1/projets/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)


class DeliberationAPITest(APITestCase):
    """Tests pour l'API des délibérations"""
    
    def setUp(self):
        self.client = APIClient()
        self.region = Region.objects.create(nom='Centre', code='CE')
        self.departement = Departement.objects.create(
            region=self.region, nom='Mfoundi', code='MF'
        )
        self.commune = Commune.objects.create(
            nom='Test Commune',
            slug='test-commune',
            departement=self.departement
        )
        Deliberation.objects.create(
            commune=self.commune,
            numero='DEL-2025-001',
            titre='Test Délibération',
            date_seance=timezone.now().date(),
            est_publie=True
        )
    
    def test_list_deliberations(self):
        """Test liste des délibérations"""
        response = self.client.get('/api/v1/deliberations/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
