"""
Tests pour le module Actualités et CMS
"""
from django.test import TestCase
from django.utils import timezone
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken

from communes.models import Region, Departement, Commune
from actualites.models import Actualite, PageCMS, FAQ, Newsletter, AbonneNewsletter

Utilisateur = get_user_model()


class ActualiteModelTest(TestCase):
    """Tests pour le modèle Actualite"""
    
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
        self.auteur = Utilisateur.objects.create_user(
            email='auteur@test.cm',
            nom='Auteur Test',
            password='pass123'
        )
    
    def test_actualite_creation(self):
        """Test création d'une actualité"""
        actu = Actualite.objects.create(
            commune=self.commune,
            auteur=self.auteur,
            titre='Test Actualité',
            slug='test-actualite',
            resume='Résumé de test',
            contenu='<p>Contenu complet</p>',
            categorie=Actualite.Categorie.COMMUNIQUE,
            est_publie=True,
            date_publication=timezone.now()
        )
        self.assertEqual(actu.titre, 'Test Actualité')
        self.assertEqual(actu.nombre_vues, 0)
    
    def test_incrementer_vues(self):
        """Test incrémentation des vues"""
        actu = Actualite.objects.create(
            commune=self.commune,
            auteur=self.auteur,
            titre='Test Vues',
            slug='test-vues',
            contenu='Test',
            est_publie=True
        )
        self.assertEqual(actu.nombre_vues, 0)
        
        actu.incrementer_vues()
        actu.refresh_from_db()
        self.assertEqual(actu.nombre_vues, 1)
        
        actu.incrementer_vues()
        actu.refresh_from_db()
        self.assertEqual(actu.nombre_vues, 2)
    
    def test_actualite_commune_relation(self):
        """Test relation actualité -> commune"""
        actu = Actualite.objects.create(
            commune=self.commune,
            auteur=self.auteur,
            titre='Test Relation',
            slug='test-relation',
            contenu='Test'
        )
        self.assertEqual(self.commune.actualites.count(), 1)
        self.assertEqual(self.commune.actualites.first(), actu)


class PageCMSTest(TestCase):
    """Tests pour les pages CMS"""
    
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
    
    def test_page_creation(self):
        """Test création d'une page"""
        page = PageCMS.objects.create(
            commune=self.commune,
            titre='Page Test',
            slug='page-test',
            contenu='<h1>Contenu</h1>',
            est_publie=True
        )
        self.assertEqual(page.titre, 'Page Test')
        self.assertTrue(page.est_publie)


class FAQTest(TestCase):
    """Tests pour les FAQ"""
    
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
    
    def test_faq_creation(self):
        """Test création d'une FAQ"""
        faq = FAQ.objects.create(
            commune=self.commune,
            question='Comment faire ?',
            reponse='Voici comment...',
            est_active=True
        )
        self.assertEqual(faq.question, 'Comment faire ?')
        self.assertTrue(faq.est_active)


class NewsletterTest(TestCase):
    """Tests pour la newsletter"""
    
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
    
    def test_abonne_creation(self):
        """Test inscription à la newsletter"""
        abonne = AbonneNewsletter.objects.create(
            commune=self.commune,
            email='abonne@test.cm',
            nom='Test Abonné'
        )
        self.assertTrue(abonne.est_actif)
        self.assertIsNotNone(abonne.token_desinscription)
    
    def test_abonne_unique_email_par_commune(self):
        """Test unicité email par commune"""
        AbonneNewsletter.objects.create(
            commune=self.commune,
            email='unique@test.cm'
        )
        # Le même email pour la même commune devrait échouer
        from django.db import IntegrityError
        with self.assertRaises(IntegrityError):
            AbonneNewsletter.objects.create(
                commune=self.commune,
                email='unique@test.cm'
            )


class ActualiteAPITest(APITestCase):
    """Tests pour l'API des actualités"""
    
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
        self.actu = Actualite.objects.create(
            commune=self.commune,
            auteur=self.admin,
            titre='Actualité Publiée',
            slug='actu-publiee',
            contenu='Contenu',
            est_publie=True,
            date_publication=timezone.now()
        )
    
    def test_list_actualites_public(self):
        """Test liste des actualités (public)"""
        response = self.client.get('/api/v1/actualites/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
    
    def test_actualite_detail_increments_views(self):
        """Test que le détail incrémente les vues"""
        initial_views = self.actu.nombre_vues
        
        response = self.client.get(f'/api/v1/actualites/{self.actu.slug}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        self.actu.refresh_from_db()
        self.assertEqual(self.actu.nombre_vues, initial_views + 1)
    
    def test_create_actualite_authenticated(self):
        """Test création d'actualité (authentifié)"""
        refresh = RefreshToken.for_user(self.admin)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
        
        data = {
            'commune': self.commune.id,
            'titre': 'Nouvelle Actu',
            'slug': 'nouvelle-actu',
            'contenu': '<p>Contenu</p>',
            'categorie': 'communique',
            'est_publie': True
        }
        response = self.client.post('/api/v1/actualites/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
    
    def test_create_actualite_unauthenticated(self):
        """Test création d'actualité sans auth"""
        data = {
            'commune': self.commune.id,
            'titre': 'Nouvelle Actu',
            'slug': 'nouvelle-actu',
            'contenu': '<p>Contenu</p>'
        }
        response = self.client.post('/api/v1/actualites/', data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_filter_by_commune(self):
        """Test filtre par commune"""
        response = self.client.get(f'/api/v1/actualites/?commune={self.commune.id}')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_filter_by_categorie(self):
        """Test filtre par catégorie"""
        response = self.client.get('/api/v1/actualites/?categorie=communique')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
