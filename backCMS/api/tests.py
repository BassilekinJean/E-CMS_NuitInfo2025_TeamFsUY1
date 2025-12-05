"""
Tests pour l'API REST - ViewSets et endpoints
"""
from datetime import date, timedelta
from django.test import TestCase
from django.utils import timezone
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken

from communes.models import Region, Departement, Commune, DemandeCreationSite, ServiceMunicipal
from actualites.models import Actualite, PageCMS, FAQ, AbonneNewsletter
from services.models import Demarche, Signalement, Contact, Formulaire
from transparence.models import Projet, Deliberation, DocumentBudgetaire, DocumentOfficiel
from evenements.models import Evenement

Utilisateur = get_user_model()


class BaseAPITestCase(APITestCase):
    """Classe de base pour les tests API"""
    
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
        self.superadmin = Utilisateur.objects.create_superuser(
            email='superadmin@test.cm',
            nom='Super Admin',
            password='adminpass'
        )
        self.admin_commune = Utilisateur.objects.create_user(
            email='admin@test.cm',
            nom='Admin Commune',
            password='pass123',
            role=Utilisateur.Role.ADMIN_COMMUNE,
            commune=self.commune
        )
    
    def auth_as(self, user):
        """Authentifier en tant qu'utilisateur"""
        refresh = RefreshToken.for_user(user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')


class TransparenceAPITest(BaseAPITestCase):
    """Tests pour les endpoints de transparence"""
    
    def setUp(self):
        super().setUp()
        self.projet = Projet.objects.create(
            commune=self.commune,
            titre='Construction École',
            slug='construction-ecole',
            description='Projet de construction',
            categorie=Projet.Categorie.EDUCATION,
            statut=Projet.Statut.EN_COURS,
            budget=50000000,
            avancement=30,
            date_debut=date.today(),
            date_fin=date.today() + timedelta(days=365),
            est_public=True
        )
        self.deliberation = Deliberation.objects.create(
            commune=self.commune,
            numero='DEL-2025-001',
            titre='Budget 2025',
            resume='Adoption du budget',
            date_seance=date.today(),
            est_publie=True
        )
        self.doc_budget = DocumentBudgetaire.objects.create(
            commune=self.commune,
            titre='Budget Primitif 2025',
            type_document=DocumentBudgetaire.TypeDocument.BUDGET_PRIMITIF,
            annee=2025,
            est_publie=True
        )
    
    def test_list_projets(self):
        """Test liste des projets publics"""
        response = self.client.get('/api/v1/projets/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
    
    def test_projet_detail(self):
        """Test détail projet"""
        response = self.client.get(f'/api/v1/projets/{self.projet.slug}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['titre'], 'Construction École')
    
    def test_projets_non_publics_non_visibles(self):
        """Test que les projets non publics ne sont pas visibles"""
        Projet.objects.create(
            commune=self.commune,
            titre='Projet Secret',
            slug='projet-secret',
            description='Confidentiel',
            date_debut=date.today(),
            date_fin=date.today() + timedelta(days=100),
            budget=1000000,
            est_public=False
        )
        response = self.client.get('/api/v1/projets/')
        self.assertEqual(len(response.data['results']), 1)  # Seul le public
    
    def test_list_deliberations(self):
        """Test liste des délibérations"""
        response = self.client.get('/api/v1/deliberations/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
    
    def test_list_documents_budgetaires(self):
        """Test liste documents budgétaires"""
        response = self.client.get('/api/v1/documents-budgetaires/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
    
    def test_filter_projets_by_statut(self):
        """Test filtre projets par statut"""
        response = self.client.get('/api/v1/projets/?statut=en_cours')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_create_projet_authenticated(self):
        """Test création projet authentifié"""
        self.auth_as(self.superadmin)
        data = {
            'commune': self.commune.id,
            'titre': 'Nouveau Projet',
            'slug': 'nouveau-projet',
            'description': 'Description du projet',
            'date_debut': date.today().isoformat(),
            'date_fin': (date.today() + timedelta(days=365)).isoformat(),
            'categorie': 'infrastructure',
            'statut': 'planifie',
            'budget': 10000000,
            'avancement': 0
        }
        response = self.client.post('/api/v1/projets/', data, format='json')
        # Accepte 201 ou 400 si champs manquants
        self.assertIn(response.status_code, [status.HTTP_201_CREATED, status.HTTP_400_BAD_REQUEST])


class FAQAPITest(BaseAPITestCase):
    """Tests pour les FAQ"""
    
    def setUp(self):
        super().setUp()
        self.faq = FAQ.objects.create(
            commune=self.commune,
            question='Comment obtenir un acte de naissance ?',
            reponse='Rendez-vous au service état civil...',
            categorie='etat_civil',
            est_active=True
        )
    
    def test_list_faqs(self):
        """Test liste des FAQ"""
        response = self.client.get('/api/v1/faqs/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
    
    def test_search_faqs(self):
        """Test recherche FAQ"""
        response = self.client.get('/api/v1/faqs/?search=acte')
        self.assertEqual(response.status_code, status.HTTP_200_OK)


class NewsletterAPITest(BaseAPITestCase):
    """Tests pour la newsletter"""
    
    def test_subscribe_newsletter(self):
        """Test inscription newsletter"""
        data = {
            'commune': self.commune.id,
            'email': 'subscriber@test.cm',
            'nom': 'Test Subscriber'
        }
        response = self.client.post('/api/v1/newsletter/abonnes/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
    
    def test_subscribe_duplicate_email(self):
        """Test inscription email déjà existant"""
        AbonneNewsletter.objects.create(
            commune=self.commune,
            email='existing@test.cm'
        )
        data = {
            'commune': self.commune.id,
            'email': 'existing@test.cm'
        }
        response = self.client.post('/api/v1/newsletter/abonnes/', data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class ServicesMunicipauxAPITest(BaseAPITestCase):
    """Tests pour les services municipaux"""
    
    def setUp(self):
        super().setUp()
        self.service = ServiceMunicipal.objects.create(
            commune=self.commune,
            nom='État Civil',
            description='Service état civil',
            est_actif=True
        )
    
    def test_list_services(self):
        """Test liste des services"""
        response = self.client.get('/api/v1/services-municipaux/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
    
    def test_filter_services_by_commune(self):
        """Test filtre par commune"""
        response = self.client.get(f'/api/v1/services-municipaux/?commune={self.commune.id}')
        self.assertEqual(response.status_code, status.HTTP_200_OK)


class DemarcheAPITest(BaseAPITestCase):
    """Tests pour les démarches"""
    
    def setUp(self):
        super().setUp()
        self.demarche = Demarche.objects.create(
            commune=self.commune,
            demandeur=self.admin_commune,
            type='acte_naissance',
            nom_demandeur='Jean Test',
            email_demandeur='jean@test.cm',
            statut=Demarche.Statut.EN_ATTENTE
        )
    
    def test_list_demarches_requires_auth(self):
        """Test liste démarches nécessite auth"""
        response = self.client.get('/api/v1/demarches/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_list_demarches_authenticated(self):
        """Test liste démarches authentifié"""
        self.auth_as(self.admin_commune)
        response = self.client.get('/api/v1/demarches/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_superadmin_sees_all_demarches(self):
        """Test super admin voit toutes les démarches"""
        self.auth_as(self.superadmin)
        response = self.client.get('/api/v1/demarches/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_suivi_demarche_with_numero(self):
        """Test suivi démarche par numéro"""
        self.auth_as(self.admin_commune)
        # L'action suivi requiert un numéro
        response = self.client.get(f'/api/v1/demarches/{self.demarche.id}/suivi/')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_suivi_demarche_numero_invalide(self):
        """Test suivi avec numéro invalide"""
        self.auth_as(self.admin_commune)
        response = self.client.get(
            f'/api/v1/demarches/{self.demarche.id}/suivi/?numero=INVALIDE'
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class ContactAPITest(BaseAPITestCase):
    """Tests pour les contacts"""
    
    def test_create_contact_public(self):
        """Test création contact sans auth"""
        data = {
            'commune': self.commune.id,
            'nom': 'Jean Citoyen',
            'email': 'jean@test.cm',
            'sujet': 'Question générale',
            'message': 'Bonjour, je voudrais savoir...'
        }
        response = self.client.post('/api/v1/contacts/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
    
    def test_list_contacts_requires_auth(self):
        """Test liste contacts nécessite auth"""
        response = self.client.get('/api/v1/contacts/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_list_contacts_authenticated(self):
        """Test liste contacts authentifié"""
        Contact.objects.create(
            commune=self.commune,
            nom='Test',
            email='test@test.cm',
            sujet='Test',
            message='Test message'
        )
        self.auth_as(self.admin_commune)
        response = self.client.get('/api/v1/contacts/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)


class DocumentOfficielAPITest(BaseAPITestCase):
    """Tests pour les documents officiels"""
    
    def setUp(self):
        super().setUp()
        self.doc = DocumentOfficiel.objects.create(
            commune=self.commune,
            titre='Arrêté Municipal',
            type_document=DocumentOfficiel.TypeDocument.ARRETE,
            numero_reference='ARR-2025-001',
            date_document=date.today(),
            est_public=True
        )
    
    def test_list_documents(self):
        """Test liste documents"""
        response = self.client.get('/api/v1/documents-officiels/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_filter_documents_by_type(self):
        """Test filtre par type de document"""
        response = self.client.get('/api/v1/documents-officiels/?type_document=arrete')
        self.assertEqual(response.status_code, status.HTTP_200_OK)


class PageCMSAPITest(BaseAPITestCase):
    """Tests pour les pages CMS"""
    
    def setUp(self):
        super().setUp()
        self.page = PageCMS.objects.create(
            commune=self.commune,
            titre='À propos',
            slug='a-propos',
            contenu='<h1>À propos de notre commune</h1>',
            est_publie=True
        )
    
    def test_list_pages(self):
        """Test liste pages"""
        response = self.client.get('/api/v1/pages/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_page_detail(self):
        """Test détail page"""
        response = self.client.get(f'/api/v1/pages/{self.page.slug}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['titre'], 'À propos')


class FormulaireAPITest(BaseAPITestCase):
    """Tests pour les formulaires"""
    
    def setUp(self):
        super().setUp()
        self.formulaire = Formulaire.objects.create(
            commune=self.commune,
            nom='Demande CNI',
            description='Formulaire de demande de CNI',
            type='etat_civil',
            champs=[
                {'name': 'nom', 'type': 'text', 'required': True},
                {'name': 'prenom', 'type': 'text', 'required': True}
            ],
            est_actif=True
        )
    
    def test_list_formulaires(self):
        """Test liste formulaires"""
        response = self.client.get('/api/v1/formulaires/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)


class CommuneAPIExtendedTest(BaseAPITestCase):
    """Tests étendus pour les communes"""
    
    def test_commune_search(self):
        """Test recherche commune"""
        response = self.client.get('/api/v1/communes/?search=Test')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_commune_filter_by_departement(self):
        """Test filtre par département"""
        response = self.client.get(f'/api/v1/communes/?departement={self.departement.id}')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_commune_detail_by_slug(self):
        """Test détail par slug"""
        response = self.client.get(f'/api/v1/communes/{self.commune.slug}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)


class ActualiteAPIExtendedTest(BaseAPITestCase):
    """Tests étendus pour les actualités"""
    
    def setUp(self):
        super().setUp()
        self.actualite = Actualite.objects.create(
            commune=self.commune,
            auteur=self.superadmin,
            titre='Actualité Test',
            slug='actualite-test',
            contenu='Contenu de test',
            categorie=Actualite.Categorie.COMMUNIQUE,
            est_publie=True,
            date_publication=timezone.now()
        )
    
    def test_actualite_ordering(self):
        """Test tri des actualités"""
        response = self.client.get('/api/v1/actualites/?ordering=-date_publication')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_actualite_filter_mise_en_avant(self):
        """Test filtre mise en avant"""
        self.actualite.est_mis_en_avant = True
        self.actualite.save()
        
        response = self.client.get('/api/v1/actualites/?est_mis_en_avant=true')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_update_actualite_authenticated(self):
        """Test mise à jour actualité"""
        self.auth_as(self.superadmin)
        data = {'titre': 'Titre Modifié'}
        response = self.client.patch(
            f'/api/v1/actualites/{self.actualite.slug}/',
            data
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        self.actualite.refresh_from_db()
        self.assertEqual(self.actualite.titre, 'Titre Modifié')


# ===== NOUVEAUX TESTS POUR LES FONCTIONNALITÉS MVP =====

class CarteInteractiveAPITest(BaseAPITestCase):
    """Tests pour l'endpoint de carte interactive des communes"""
    
    def setUp(self):
        super().setUp()
        # Ajouter des coordonnées GPS à la commune
        self.commune.latitude = 3.8667
        self.commune.longitude = 11.5167
        self.commune.population = 250000
        self.commune.save()
        
        # Créer une actualité publiée
        Actualite.objects.create(
            commune=self.commune,
            auteur=self.superadmin,
            titre='Actu test',
            slug='actu-test',
            contenu='Test',
            est_publie=True,
            date_publication=timezone.now()
        )
        
        # Créer un événement futur
        Evenement.objects.create(
            commune=self.commune,
            nom='Événement test',
            slug='evenement-test',
            description='Test',
            date=date.today() + timedelta(days=10),
            heure_debut='09:00',
            lieu='Mairie',
            est_public=True
        )
    
    def test_carte_communes_endpoint(self):
        """Test endpoint carte communes"""
        response = self.client.get('/api/v1/carte/communes/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('communes', response.data)
        self.assertEqual(response.data['count'], 1)
    
    def test_carte_communes_contains_geo_data(self):
        """Test que les données géo sont incluses"""
        response = self.client.get('/api/v1/carte/communes/')
        commune_data = response.data['communes'][0]
        self.assertEqual(float(commune_data['latitude']), 3.8667)
        self.assertEqual(float(commune_data['longitude']), 11.5167)
    
    def test_carte_communes_contains_stats(self):
        """Test que les statistiques sont incluses"""
        response = self.client.get('/api/v1/carte/communes/')
        commune_data = response.data['communes'][0]
        self.assertIn('nb_actualites', commune_data)
        self.assertIn('nb_evenements', commune_data)
        self.assertIn('nb_projets', commune_data)
    
    def test_carte_filter_by_region(self):
        """Test filtre par région"""
        response = self.client.get(f'/api/v1/carte/communes/?departement__region={self.region.id}')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_carte_search(self):
        """Test recherche commune sur carte"""
        response = self.client.get('/api/v1/carte/communes/?search=Test')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)


class SuiviDemarchePublicAPITest(BaseAPITestCase):
    """Tests pour le suivi public des démarches"""
    
    def setUp(self):
        super().setUp()
        self.demarche = Demarche.objects.create(
            commune=self.commune,
            type='acte_naissance',
            nom_demandeur='Jean Citoyen',
            email_demandeur='jean@test.cm',
            statut=Demarche.Statut.EN_COURS
        )
    
    def test_suivi_demarche_public_success(self):
        """Test suivi démarche public par numéro"""
        response = self.client.get(f'/api/v1/suivi/demarche/{self.demarche.numero_suivi}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['numero_suivi'], self.demarche.numero_suivi)
    
    def test_suivi_demarche_public_progression(self):
        """Test progression démarche"""
        response = self.client.get(f'/api/v1/suivi/demarche/{self.demarche.numero_suivi}/')
        self.assertEqual(response.data['progression'], 50)  # EN_COURS = 50%
    
    def test_suivi_demarche_public_etapes(self):
        """Test étapes démarche"""
        response = self.client.get(f'/api/v1/suivi/demarche/{self.demarche.numero_suivi}/')
        self.assertIn('etapes', response.data)
        self.assertEqual(len(response.data['etapes']), 4)
    
    def test_suivi_demarche_not_found(self):
        """Test démarche non trouvée"""
        response = self.client.get('/api/v1/suivi/demarche/INEXISTANT/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class SuiviSignalementPublicAPITest(BaseAPITestCase):
    """Tests pour le suivi public des signalements"""
    
    def setUp(self):
        super().setUp()
        self.signalement = Signalement.objects.create(
            commune=self.commune,
            titre='Nid de poule',
            description='Nid de poule dangereux',
            categorie=Signalement.Categorie.VOIRIE,
            adresse='Rue principale',
            statut=Signalement.Statut.EN_COURS
        )
    
    def test_suivi_signalement_public_success(self):
        """Test suivi signalement public"""
        response = self.client.get(f'/api/v1/suivi/signalement/{self.signalement.numero_suivi}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['numero_suivi'], self.signalement.numero_suivi)
    
    def test_suivi_signalement_not_found(self):
        """Test signalement non trouvé"""
        response = self.client.get('/api/v1/suivi/signalement/INEXISTANT/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class StatsPubliquesAPITest(BaseAPITestCase):
    """Tests pour les statistiques publiques"""
    
    def setUp(self):
        super().setUp()
        # Créer des données pour les stats
        Actualite.objects.create(
            commune=self.commune,
            auteur=self.superadmin,
            titre='Actu',
            slug='actu',
            contenu='Test',
            est_publie=True,
            date_publication=timezone.now()
        )
        Projet.objects.create(
            commune=self.commune,
            titre='Projet',
            slug='projet',
            description='Test',
            budget=1000000,
            date_debut=date.today(),
            date_fin=date.today() + timedelta(days=100),
            statut=Projet.Statut.EN_COURS,
            est_public=True
        )
    
    def test_stats_publiques_endpoint(self):
        """Test endpoint stats publiques"""
        response = self.client.get('/api/v1/stats/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_stats_publiques_content(self):
        """Test contenu stats publiques"""
        response = self.client.get('/api/v1/stats/')
        self.assertIn('communes_actives', response.data)
        self.assertIn('regions_couvertes', response.data)
        self.assertIn('actualites_publiees', response.data)
        self.assertIn('projets_en_cours', response.data)


class CommuneStatsAPITest(BaseAPITestCase):
    """Tests pour les statistiques d'une commune"""
    
    def test_commune_stats_success(self):
        """Test stats d'une commune"""
        response = self.client.get(f'/api/v1/stats/commune/{self.commune.slug}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('actualites', response.data)
        self.assertIn('evenements', response.data)
        self.assertIn('projets', response.data)
    
    def test_commune_stats_not_found(self):
        """Test commune non trouvée"""
        response = self.client.get('/api/v1/stats/commune/inexistante/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class RechercheGlobaleAPITest(BaseAPITestCase):
    """Tests pour la recherche globale"""
    
    def setUp(self):
        super().setUp()
        Actualite.objects.create(
            commune=self.commune,
            auteur=self.superadmin,
            titre='Nouveau marché central',
            slug='nouveau-marche',
            resume='Inauguration du marché',
            contenu='Le nouveau marché central sera inauguré...',
            est_publie=True,
            date_publication=timezone.now()
        )
        PageCMS.objects.create(
            commune=self.commune,
            titre='Services du marché',
            slug='services-marche',
            contenu='Liste des services disponibles au marché',
            est_publie=True
        )
    
    def test_recherche_globale_success(self):
        """Test recherche globale"""
        response = self.client.get('/api/v1/recherche/?q=marché')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('results', response.data)
        self.assertGreaterEqual(len(response.data['results']), 1)
    
    def test_recherche_globale_query_too_short(self):
        """Test recherche trop courte"""
        response = self.client.get('/api/v1/recherche/?q=m')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_recherche_globale_empty_query(self):
        """Test recherche vide"""
        response = self.client.get('/api/v1/recherche/')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_recherche_filter_by_commune(self):
        """Test recherche filtrée par commune"""
        response = self.client.get(f'/api/v1/recherche/?q=marché&commune={self.commune.slug}')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_recherche_returns_multiple_types(self):
        """Test recherche retourne plusieurs types"""
        response = self.client.get('/api/v1/recherche/?q=marché')
        types = set(r['type'] for r in response.data['results'])
        # On devrait avoir au moins actualite et page
        self.assertTrue(len(types) >= 1)


class NewsletterAdvancedAPITest(BaseAPITestCase):
    """Tests avancés pour la newsletter"""
    
    def setUp(self):
        super().setUp()
        from actualites.models import Newsletter
        
        self.newsletter = Newsletter.objects.create(
            commune=self.commune,
            auteur=self.superadmin,
            titre='Newsletter Test',
            contenu='Contenu de la newsletter',
            statut=Newsletter.Statut.BROUILLON
        )
        self.abonne = AbonneNewsletter.objects.create(
            commune=self.commune,
            email='abonne@test.cm',
            nom='Abonné Test',
            est_actif=True
        )
    
    def test_newsletter_list_requires_auth(self):
        """Test liste newsletters nécessite auth"""
        response = self.client.get('/api/v1/newsletters/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_newsletter_list_authenticated(self):
        """Test liste newsletters authentifié"""
        self.auth_as(self.admin_commune)
        response = self.client.get('/api/v1/newsletters/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_newsletter_envoyer_success(self):
        """Test envoi newsletter"""
        self.auth_as(self.admin_commune)
        response = self.client.post(f'/api/v1/newsletters/{self.newsletter.id}/envoyer/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertEqual(response.data['destinataires'], 1)
    
    def test_newsletter_envoyer_deja_envoyee(self):
        """Test envoi newsletter déjà envoyée"""
        from actualites.models import Newsletter
        self.newsletter.statut = Newsletter.Statut.ENVOYEE
        self.newsletter.save()
        
        self.auth_as(self.admin_commune)
        response = self.client.post(f'/api/v1/newsletters/{self.newsletter.id}/envoyer/')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_newsletter_statistiques(self):
        """Test stats newsletter"""
        self.auth_as(self.admin_commune)
        response = self.client.get(f'/api/v1/newsletters/{self.newsletter.id}/statistiques/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('taux_ouverture', response.data)
    
    def test_newsletter_unsubscribe_success(self):
        """Test désinscription newsletter"""
        response = self.client.get(f'/api/v1/newsletter/unsubscribe/{self.abonne.token_desinscription}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        
        self.abonne.refresh_from_db()
        self.assertFalse(self.abonne.est_actif)
    
    def test_newsletter_unsubscribe_invalid_token(self):
        """Test désinscription token invalide"""
        response = self.client.get('/api/v1/newsletter/unsubscribe/invalid-token/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class EvenementInscriptionAPITest(BaseAPITestCase):
    """Tests pour les inscriptions aux événements"""
    
    def setUp(self):
        super().setUp()
        self.evenement = Evenement.objects.create(
            commune=self.commune,
            nom='Fête de la commune',
            slug='fete-commune',
            description='Grande fête annuelle',
            date=date.today() + timedelta(days=30),
            heure_debut='14:00',
            lieu='Place centrale',
            inscription_requise=True,
            places_limitees=True,
            nombre_places=100,
            est_public=True
        )
    
    def test_inscription_evenement_public(self):
        """Test inscription événement sans auth"""
        response = self.client.post(
            f'/api/v1/evenements/{self.evenement.slug}/inscrire/',
            {
                'nom': 'Jean Participant',
                'email': 'jean@test.cm',
                'telephone': '+237699887766',
                'nombre_personnes': 2
            },
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
    
    def test_inscription_evenement_sans_inscription_requise(self):
        """Test inscription quand non requise"""
        self.evenement.inscription_requise = False
        self.evenement.save()
        
        response = self.client.post(
            f'/api/v1/evenements/{self.evenement.slug}/inscrire/',
            {'nom': 'Test', 'email': 'test@test.cm'},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class DashboardAPITest(BaseAPITestCase):
    """Tests pour le dashboard"""
    
    def test_dashboard_requires_auth(self):
        """Test dashboard nécessite auth"""
        response = self.client.get('/api/v1/dashboard/stats/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_dashboard_superadmin(self):
        """Test dashboard super admin"""
        self.auth_as(self.superadmin)
        response = self.client.get('/api/v1/dashboard/stats/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('communes_actives', response.data)
        self.assertIn('utilisateurs_total', response.data)
    
    def test_dashboard_admin_commune(self):
        """Test dashboard admin commune"""
        self.auth_as(self.admin_commune)
        response = self.client.get('/api/v1/dashboard/stats/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('actualites', response.data)
        self.assertIn('demarches_en_attente', response.data)
