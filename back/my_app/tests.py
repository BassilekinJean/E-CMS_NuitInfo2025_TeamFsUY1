from django.test import TestCase
from .models import YourModel  # Remplacez YourModel par le nom de votre modèle

class YourModelTests(TestCase):

    def setUp(self):
        # Configuration initiale pour les tests
        YourModel.objects.create(field_name='value')  # Remplacez field_name et value par vos propres champs et valeurs

    def test_model_str(self):
        # Test de la méthode __str__ de votre modèle
        model_instance = YourModel.objects.get(field_name='value')
        self.assertEqual(str(model_instance), 'value')  # Remplacez 'value' par la valeur attendue

    def test_model_field(self):
        # Test d'un champ spécifique de votre modèle
        model_instance = YourModel.objects.get(field_name='value')
        self.assertEqual(model_instance.field_name, 'value')  # Remplacez field_name et value par vos propres champs et valeurs