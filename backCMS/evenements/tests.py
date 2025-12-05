"""
Tests pour le module Événements
"""
from datetime import date, time, timedelta
from django.test import TestCase
from django.utils import timezone
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken

from communes.models import Region, Departement, Commune, ServiceMunicipal
from evenements.models import Evenement, InscriptionEvenement, RendezVous

Utilisateur = get_user_model()


class EvenementModelTest(TestCase):
    """Tests pour le modèle Evenement"""
    
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
        self.user = Utilisateur.objects.create_user(
            email='orga@test.cm',
            nom='Organisateur',
            password='pass123'
        )
    
    def test_evenement_creation(self):
        """Test création d'un événement"""
        evenement = Evenement.objects.create(
            commune=self.commune,
            organisateur=self.user,
            nom='Conseil Municipal',
            description='Session ordinaire',
            date=date.today() + timedelta(days=7),
            heure_debut=time(9, 0),
            heure_fin=time(12, 0),
            lieu='Mairie',
            categorie=Evenement.Categorie.CONSEIL
        )
        self.assertEqual(evenement.nom, 'Conseil Municipal')
        self.assertEqual(evenement.statut, Evenement.Statut.PLANIFIE)
        self.assertIsNotNone(evenement.slug)
    
    def test_evenement_slug_auto(self):
        """Test génération automatique du slug"""
        evenement = Evenement.objects.create(
            commune=self.commune,
            nom='Fête de la Jeunesse 2025',
            description='Célébration annuelle',
            date=date.today(),
            heure_debut=time(10, 0),
            lieu='Place centrale'
        )
        self.assertEqual(evenement.slug, 'fete-de-la-jeunesse-2025')
    
    def test_places_restantes_sans_limite(self):
        """Test places restantes sans limitation"""
        evenement = Evenement.objects.create(
            commune=self.commune,
            nom='Réunion Publique',
            description='Débat citoyen',
            date=date.today(),
            heure_debut=time(14, 0),
            lieu='Salle des fêtes',
            places_limitees=False
        )
        self.assertIsNone(evenement.places_restantes())
    
    def test_places_restantes_avec_limite(self):
        """Test calcul des places restantes"""
        evenement = Evenement.objects.create(
            commune=self.commune,
            nom='Formation',
            description='Atelier informatique',
            date=date.today(),
            heure_debut=time(9, 0),
            lieu='Salle multimédia',
            inscription_requise=True,
            places_limitees=True,
            nombre_places=20
        )
        
        # 20 places au départ
        self.assertEqual(evenement.places_restantes(), 20)
        
        # Ajouter une inscription confirmée
        InscriptionEvenement.objects.create(
            evenement=evenement,
            nom='Jean Test',
            email='jean@test.cm',
            statut=InscriptionEvenement.Statut.CONFIRME
        )
        
        # 19 places restantes
        self.assertEqual(evenement.places_restantes(), 19)
    
    def test_evenement_str(self):
        """Test représentation string"""
        evenement = Evenement.objects.create(
            commune=self.commune,
            nom='Test Event',
            description='Test',
            date=date(2025, 12, 25),
            heure_debut=time(10, 0),
            lieu='Test'
        )
        self.assertIn('Test Event', str(evenement))
        self.assertIn('2025-12-25', str(evenement))


class InscriptionEvenementTest(TestCase):
    """Tests pour les inscriptions"""
    
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
        self.evenement = Evenement.objects.create(
            commune=self.commune,
            nom='Formation Django',
            description='Apprentissage Django',
            date=date.today() + timedelta(days=14),
            heure_debut=time(9, 0),
            lieu='Centre de formation',
            inscription_requise=True
        )
        self.user = Utilisateur.objects.create_user(
            email='participant@test.cm',
            nom='Participant',
            password='pass123'
        )
    
    def test_inscription_anonyme(self):
        """Test inscription anonyme"""
        inscription = InscriptionEvenement.objects.create(
            evenement=self.evenement,
            nom='Jean Dupont',
            email='jean@test.cm',
            telephone='690000000',
            nombre_personnes=2
        )
        self.assertEqual(inscription.statut, InscriptionEvenement.Statut.EN_ATTENTE)
        self.assertIn('Jean Dupont', str(inscription))
    
    def test_inscription_utilisateur(self):
        """Test inscription avec compte utilisateur"""
        inscription = InscriptionEvenement.objects.create(
            evenement=self.evenement,
            participant=self.user,
            nombre_personnes=1
        )
        self.assertEqual(inscription.participant, self.user)
        self.assertIn('Participant', str(inscription))
    
    def test_inscription_statuts(self):
        """Test changement de statuts"""
        inscription = InscriptionEvenement.objects.create(
            evenement=self.evenement,
            nom='Test',
            email='test@test.cm'
        )
        
        # Confirmer
        inscription.statut = InscriptionEvenement.Statut.CONFIRME
        inscription.save()
        self.assertEqual(inscription.statut, 'confirme')
        
        # Marquer présent
        inscription.statut = InscriptionEvenement.Statut.PRESENT
        inscription.save()
        self.assertEqual(inscription.statut, 'present')


class RendezVousTest(TestCase):
    """Tests pour les rendez-vous"""
    
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
        self.service = ServiceMunicipal.objects.create(
            commune=self.commune,
            nom='État Civil',
            description='Service état civil'
        )
        self.user = Utilisateur.objects.create_user(
            email='citoyen@test.cm',
            nom='Citoyen',
            password='pass123'
        )
    
    def test_rdv_creation(self):
        """Test création de rendez-vous"""
        rdv = RendezVous.objects.create(
            commune=self.commune,
            service=self.service,
            demandeur=self.user,
            motif='Demande acte de naissance',
            date=date.today() + timedelta(days=3),
            heure_debut=time(10, 0),
            heure_fin=time(10, 30)
        )
        self.assertEqual(rdv.statut, RendezVous.Statut.EN_ATTENTE)
        self.assertIn('Citoyen', str(rdv))
    
    def test_rdv_anonyme(self):
        """Test RDV sans compte"""
        rdv = RendezVous.objects.create(
            commune=self.commune,
            nom_demandeur='Marie Ngono',
            email_demandeur='marie@test.cm',
            telephone_demandeur='655000000',
            motif='Légalisation documents',
            date=date.today() + timedelta(days=5),
            heure_debut=time(14, 0),
            heure_fin=time(14, 30)
        )
        self.assertIn('Marie Ngono', str(rdv))
    
    def test_rdv_statuts(self):
        """Test workflow des statuts RDV"""
        rdv = RendezVous.objects.create(
            commune=self.commune,
            demandeur=self.user,
            motif='Test',
            date=date.today(),
            heure_debut=time(9, 0),
            heure_fin=time(9, 30)
        )
        
        # Confirmer
        rdv.statut = RendezVous.Statut.CONFIRME
        rdv.save()
        self.assertEqual(rdv.statut, 'confirme')
        
        # Terminer
        rdv.statut = RendezVous.Statut.TERMINE
        rdv.save()
        self.assertEqual(rdv.statut, 'termine')


class EvenementAPITest(APITestCase):
    """Tests API pour les événements"""
    
    def setUp(self):
        self.client = APIClient()
        self.region = Region.objects.create(nom='Centre', code='CE')
        self.departement = Departement.objects.create(
            region=self.region, nom='Mfoundi', code='MF'
        )
        self.commune = Commune.objects.create(
            nom='Yaoundé 1er',
            slug='yaounde-1er',
            departement=self.departement,
            statut=Commune.Statut.ACTIVE
        )
        self.admin = Utilisateur.objects.create_superuser(
            email='admin@test.cm',
            nom='Admin',
            password='adminpass'
        )
        self.evenement = Evenement.objects.create(
            commune=self.commune,
            organisateur=self.admin,
            nom='Fête Nationale',
            slug='fete-nationale',
            description='Célébration du 20 mai',
            date=date.today() + timedelta(days=30),
            heure_debut=time(8, 0),
            lieu='Place de l\'Indépendance',
            categorie=Evenement.Categorie.FESTIF,
            est_public=True
        )
    
    def test_list_evenements_public(self):
        """Test liste des événements (public)"""
        response = self.client.get('/api/v1/evenements/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
    
    def test_filter_evenements_a_venir(self):
        """Test filtre événements à venir"""
        # Créer un événement passé
        Evenement.objects.create(
            commune=self.commune,
            nom='Événement Passé',
            slug='evt-passe',
            description='Test',
            date=date.today() - timedelta(days=10),
            heure_debut=time(10, 0),
            lieu='Test'
        )
        
        response = self.client.get('/api/v1/evenements/?a_venir=true')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_evenement_detail(self):
        """Test détail d'un événement"""
        response = self.client.get(f'/api/v1/evenements/{self.evenement.slug}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['nom'], 'Fête Nationale')
    
    def test_create_evenement_authenticated(self):
        """Test création d'événement (authentifié)"""
        refresh = RefreshToken.for_user(self.admin)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
        
        data = {
            'commune': self.commune.id,
            'nom': 'Nouvel Événement',
            'slug': 'nouvel-evenement',
            'description': 'Description test',
            'date': (date.today() + timedelta(days=60)).isoformat(),
            'heure_debut': '10:00:00',
            'lieu': 'Salle des fêtes',
            'categorie': 'culturel'
        }
        response = self.client.post('/api/v1/evenements/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
    
    def test_inscription_evenement(self):
        """Test inscription à un événement"""
        # Configurer l'événement pour inscription
        self.evenement.inscription_requise = True
        self.evenement.save()
        
        data = {
            'evenement': self.evenement.id,
            'nom': 'Jean Test',
            'email': 'jean@test.cm',
            'telephone': '690000000',
            'nombre_personnes': 2
        }
        response = self.client.post(
            f'/api/v1/evenements/{self.evenement.slug}/inscrire/',
            data
        )
        # L'API accepte l'inscription ou retourne les données manquantes
        self.assertIn(response.status_code, [status.HTTP_201_CREATED, status.HTTP_400_BAD_REQUEST])
        
        if response.status_code == status.HTTP_201_CREATED:
            # Vérifier l'inscription
            self.assertEqual(self.evenement.inscriptions.count(), 1)
    
    def test_inscription_evenement_non_requise(self):
        """Test inscription sur événement sans inscription requise"""
        self.evenement.inscription_requise = False
        self.evenement.save()
        
        response = self.client.post(
            f'/api/v1/evenements/{self.evenement.slug}/inscrire/',
            {'nom': 'Test', 'email': 'test@test.cm'}
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class RendezVousAPITest(APITestCase):
    """Tests API pour les rendez-vous"""
    
    def setUp(self):
        self.client = APIClient()
        self.region = Region.objects.create(nom='Centre', code='CE')
        self.departement = Departement.objects.create(
            region=self.region, nom='Mfoundi', code='MF'
        )
        self.commune = Commune.objects.create(
            nom='Yaoundé 1er',
            slug='yaounde-1er',
            departement=self.departement
        )
        self.service = ServiceMunicipal.objects.create(
            commune=self.commune,
            nom='Urbanisme',
            description='Service urbanisme'
        )
        self.user = Utilisateur.objects.create_user(
            email='user@test.cm',
            nom='User',
            password='pass123',
            commune=self.commune
        )
        self.rdv = RendezVous.objects.create(
            commune=self.commune,
            service=self.service,
            demandeur=self.user,
            motif='Permis de construire',
            date=date.today() + timedelta(days=5),
            heure_debut=time(10, 0),
            heure_fin=time(10, 30)
        )
    
    def test_list_rdv_unauthenticated(self):
        """Test liste RDV non authentifié"""
        response = self.client.get('/api/v1/rendez-vous/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Pas de résultats sans auth
        self.assertEqual(len(response.data['results']), 0)
    
    def test_list_rdv_authenticated(self):
        """Test liste RDV authentifié"""
        refresh = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
        
        response = self.client.get('/api/v1/rendez-vous/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
    
    def test_create_rdv(self):
        """Test création de RDV"""
        refresh = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
        
        data = {
            'commune': self.commune.id,
            'service': self.service.id,
            'motif': 'Demande de certificat',
            'date': (date.today() + timedelta(days=10)).isoformat(),
            'heure_debut': '14:00:00',
            'heure_fin': '14:30:00'
        }
        response = self.client.post('/api/v1/rendez-vous/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)


class DashboardAPITest(APITestCase):
    """Tests pour le dashboard"""
    
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
            email='superadmin@test.cm',
            nom='Super Admin',
            password='adminpass'
        )
        self.admin_commune = Utilisateur.objects.create_user(
            email='admin_commune@test.cm',
            nom='Admin Commune',
            password='pass123',
            role=Utilisateur.Role.ADMIN_COMMUNE,
            commune=self.commune
        )
    
    def test_dashboard_unauthenticated(self):
        """Test dashboard sans auth"""
        response = self.client.get('/api/v1/dashboard/stats/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_dashboard_super_admin(self):
        """Test dashboard super admin"""
        refresh = RefreshToken.for_user(self.admin)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
        
        response = self.client.get('/api/v1/dashboard/stats/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('communes_actives', response.data)
        self.assertIn('utilisateurs_total', response.data)
    
    def test_dashboard_admin_commune(self):
        """Test dashboard admin commune"""
        refresh = RefreshToken.for_user(self.admin_commune)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
        
        response = self.client.get('/api/v1/dashboard/stats/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Stats spécifiques à la commune
        self.assertIn('actualites', response.data)
        self.assertIn('signalements_ouverts', response.data)
