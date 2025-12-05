"""
Tests pour le module Services (Démarches, Signalements, Contact)
"""
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken

from communes.models import Region, Departement, Commune
from services.models import Formulaire, Demarche, Signalement, Contact

Utilisateur = get_user_model()


class SignalementModelTest(TestCase):
    """Tests pour le modèle Signalement"""
    
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
    
    def test_signalement_creation(self):
        """Test création d'un signalement"""
        signalement = Signalement.objects.create(
            commune=self.commune,
            titre='Nid de poule',
            description='Grand trou sur la route',
            categorie=Signalement.Categorie.VOIRIE,
            adresse='Rue 1.234, Bastos',
            email_contact='jean@test.cm'
        )
        self.assertIsNotNone(signalement.numero_suivi)
        self.assertEqual(signalement.statut, Signalement.Statut.SIGNALE)
    
    def test_signalement_numero_suivi_unique(self):
        """Test unicité du numéro de suivi"""
        s1 = Signalement.objects.create(
            commune=self.commune,
            titre='Test 1',
            categorie=Signalement.Categorie.VOIRIE
        )
        s2 = Signalement.objects.create(
            commune=self.commune,
            titre='Test 2',
            categorie=Signalement.Categorie.VOIRIE
        )
        self.assertNotEqual(s1.numero_suivi, s2.numero_suivi)
    
    def test_signalement_statut_workflow(self):
        """Test workflow des statuts"""
        signalement = Signalement.objects.create(
            commune=self.commune,
            titre='Test Workflow',
            categorie=Signalement.Categorie.ECLAIRAGE
        )
        
        # État initial
        self.assertEqual(signalement.statut, Signalement.Statut.SIGNALE)
        
        # Prise en charge
        signalement.statut = Signalement.Statut.EN_COURS
        signalement.save()
        self.assertEqual(signalement.statut, Signalement.Statut.EN_COURS)
        
        # Résolution
        signalement.statut = Signalement.Statut.RESOLU
        signalement.save()
        self.assertEqual(signalement.statut, Signalement.Statut.RESOLU)


class DemarcheModelTest(TestCase):
    """Tests pour le modèle Démarche"""
    
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
        self.user = Utilisateur.objects.create_user(
            email='user@test.cm',
            nom='User Test',
            password='pass123'
        )
    
    def test_demarche_creation(self):
        """Test création d'une démarche"""
        demarche = Demarche.objects.create(
            commune=self.commune,
            demandeur=self.user,
            type='acte_naissance',
            nom_demandeur='Jean Test',
            email_demandeur='jean@test.cm',
            donnees={'date_naissance': '1990-01-01'}
        )
        self.assertIsNotNone(demarche.numero_suivi)
        self.assertEqual(demarche.statut, Demarche.Statut.EN_ATTENTE)
    
    def test_demarche_numero_format(self):
        """Test format du numéro de suivi"""
        demarche = Demarche.objects.create(
            commune=self.commune,
            type='acte_naissance',
            nom_demandeur='Test'
        )
        # Le numéro doit commencer par DEM-
        self.assertTrue(demarche.numero_suivi.startswith('DEM-'))


class ContactModelTest(TestCase):
    """Tests pour le modèle Contact"""
    
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
    
    def test_contact_creation(self):
        """Test création d'un message de contact"""
        contact = Contact.objects.create(
            commune=self.commune,
            nom='Jean Test',
            email='jean@test.cm',
            sujet='Question',
            message='Ceci est une question...'
        )
        self.assertFalse(contact.est_lu)
        self.assertFalse(contact.est_traite)


class SignalementAPITest(APITestCase):
    """Tests pour l'API des signalements"""
    
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
    
    def test_create_signalement_public(self):
        """Test création de signalement (public)"""
        data = {
            'commune': self.commune.id,
            'titre': 'Test Signalement API',
            'description': 'Description du problème',
            'categorie': 'voirie',
            'adresse': 'Rue Test',
            'email_contact': 'jean@test.cm'
        }
        response = self.client.post('/api/v1/signalements/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('numero_suivi', response.data)
    
    def test_list_signalements(self):
        """Test liste des signalements"""
        Signalement.objects.create(
            commune=self.commune,
            titre='Test',
            categorie=Signalement.Categorie.VOIRIE
        )
        response = self.client.get('/api/v1/signalements/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_filter_signalements_by_categorie(self):
        """Test filtre par catégorie"""
        Signalement.objects.create(
            commune=self.commune,
            titre='Voirie',
            categorie=Signalement.Categorie.VOIRIE
        )
        Signalement.objects.create(
            commune=self.commune,
            titre='Eclairage',
            categorie=Signalement.Categorie.ECLAIRAGE
        )
        
        response = self.client.get('/api/v1/signalements/?categorie=voirie')
        self.assertEqual(response.status_code, status.HTTP_200_OK)


class ContactAPITest(APITestCase):
    """Tests pour l'API de contact"""
    
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
    
    def test_create_contact_public(self):
        """Test envoi de message de contact (public)"""
        data = {
            'commune': self.commune.id,
            'nom': 'Jean Test',
            'email': 'jean@test.cm',
            'sujet': 'Question',
            'message': 'Ma question...'
        }
        response = self.client.post('/api/v1/contacts/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
