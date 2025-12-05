"""
Tests pour le module Core - Utilisateurs et Configuration
"""
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken

from core.models import ConfigurationPortail, TokenVerification

Utilisateur = get_user_model()


class UtilisateurModelTest(TestCase):
    """Tests pour le modèle Utilisateur"""
    
    def test_create_user(self):
        """Test création d'un utilisateur standard"""
        user = Utilisateur.objects.create_user(
            email='test@example.com',
            nom='Test User',
            password='testpass123'
        )
        self.assertEqual(user.email, 'test@example.com')
        self.assertEqual(user.nom, 'Test User')
        self.assertTrue(user.check_password('testpass123'))
        self.assertFalse(user.is_staff)
        self.assertFalse(user.is_superuser)
        self.assertEqual(user.role, Utilisateur.Role.EDITEUR)
    
    def test_create_superuser(self):
        """Test création d'un superutilisateur"""
        admin = Utilisateur.objects.create_superuser(
            email='admin@example.com',
            nom='Admin User',
            password='adminpass123'
        )
        self.assertEqual(admin.email, 'admin@example.com')
        self.assertTrue(admin.is_staff)
        self.assertTrue(admin.is_superuser)
        self.assertEqual(admin.role, Utilisateur.Role.SUPER_ADMIN)
    
    def test_user_roles(self):
        """Test des méthodes de vérification de rôle"""
        super_admin = Utilisateur.objects.create_user(
            email='super@example.com',
            nom='Super Admin',
            password='pass123',
            role=Utilisateur.Role.SUPER_ADMIN
        )
        admin_commune = Utilisateur.objects.create_user(
            email='admin@commune.cm',
            nom='Admin Commune',
            password='pass123',
            role=Utilisateur.Role.ADMIN_COMMUNE
        )
        
        self.assertTrue(super_admin.is_super_admin())
        self.assertFalse(super_admin.is_admin_commune())
        
        self.assertFalse(admin_commune.is_super_admin())
        self.assertTrue(admin_commune.is_admin_commune())
    
    def test_email_required(self):
        """Test que l'email est obligatoire"""
        with self.assertRaises(ValueError):
            Utilisateur.objects.create_user(
                email='',
                nom='Test',
                password='pass123'
            )


class ConfigurationPortailTest(TestCase):
    """Tests pour la configuration du portail"""
    
    def test_singleton_pattern(self):
        """Test que la configuration est un singleton"""
        config1 = ConfigurationPortail.get_instance()
        config1.nom_portail = 'E-CMS Test'
        config1.save()
        
        config2 = ConfigurationPortail.get_instance()
        self.assertEqual(config1.pk, config2.pk)
        self.assertEqual(config2.nom_portail, 'E-CMS Test')
    
    def test_default_values(self):
        """Test des valeurs par défaut"""
        config = ConfigurationPortail.get_instance()
        self.assertEqual(config.couleur_primaire, '#0066CC')


class TokenVerificationTest(TestCase):
    """Tests pour les tokens de vérification"""
    
    def setUp(self):
        self.user = Utilisateur.objects.create_user(
            email='test@example.com',
            nom='Test User',
            password='testpass123'
        )
    
    def test_generate_token(self):
        """Test génération de token"""
        token = TokenVerification.generer_token(
            self.user,
            TokenVerification.TypeToken.EMAIL_VERIFICATION
        )
        self.assertIsNotNone(token.token)
        self.assertEqual(token.utilisateur, self.user)
        self.assertTrue(token.est_valide())
    
    def test_token_invalidation(self):
        """Test qu'un nouveau token invalide l'ancien"""
        token1 = TokenVerification.generer_token(
            self.user,
            TokenVerification.TypeToken.PASSWORD_RESET
        )
        token2 = TokenVerification.generer_token(
            self.user,
            TokenVerification.TypeToken.PASSWORD_RESET
        )
        
        token1.refresh_from_db()
        self.assertTrue(token1.est_utilise)
        self.assertTrue(token2.est_valide())


class AuthAPITest(APITestCase):
    """Tests pour l'API d'authentification"""
    
    def setUp(self):
        self.client = APIClient()
        self.user = Utilisateur.objects.create_user(
            email='test@example.com',
            nom='Test User',
            password='testpass123'
        )
    
    def test_register(self):
        """Test inscription"""
        data = {
            'email': 'new@example.com',
            'nom': 'New User',
            'password': 'newpass123',
            'password_confirm': 'newpass123'
        }
        response = self.client.post('/api/v1/auth/register/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('tokens', response.data)
        self.assertTrue(Utilisateur.objects.filter(email='new@example.com').exists())
    
    def test_register_password_mismatch(self):
        """Test inscription avec mots de passe différents"""
        data = {
            'email': 'new@example.com',
            'nom': 'New User',
            'password': 'newpass123',
            'password_confirm': 'differentpass'
        }
        response = self.client.post('/api/v1/auth/register/', data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_login(self):
        """Test connexion JWT"""
        data = {
            'email': 'test@example.com',
            'password': 'testpass123'
        }
        response = self.client.post('/api/v1/auth/login/', data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
    
    def test_login_invalid(self):
        """Test connexion avec mauvais mot de passe"""
        data = {
            'email': 'test@example.com',
            'password': 'wrongpassword'
        }
        response = self.client.post('/api/v1/auth/login/', data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_profile_authenticated(self):
        """Test accès profil authentifié"""
        refresh = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
        
        response = self.client.get('/api/v1/auth/profile/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], 'test@example.com')
    
    def test_profile_unauthenticated(self):
        """Test accès profil non authentifié"""
        response = self.client.get('/api/v1/auth/profile/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
