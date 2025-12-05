"""
API Views - E-CMS
ViewSets et vues API REST
"""
from rest_framework import viewsets, permissions, status, filters, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from drf_spectacular.utils import extend_schema, extend_schema_view
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.db.models import Q, Count, Sum
from django.db import models
from django_filters.rest_framework import DjangoFilterBackend

from core.models import ConfigurationPortail, TokenVerification
from communes.models import (
    Region, Departement, Commune, DemandeCreationSite,
    ServiceMunicipal, EquipeMunicipale
)
from actualites.models import Actualite, PageCMS, FAQ, Newsletter, AbonneNewsletter
from evenements.models import Evenement, InscriptionEvenement, RendezVous
from services.models import Formulaire, Demarche, Signalement, Contact
from transparence.models import Projet, Deliberation, DocumentBudgetaire, DocumentOfficiel

from .serializers import (
    UtilisateurSerializer, UtilisateurCreateSerializer, UtilisateurUpdateSerializer,
    ChangePasswordSerializer, ConfigurationPortailSerializer,
    RegionSerializer, DepartementSerializer, CommuneListSerializer, CommuneDetailSerializer,
    ServiceMunicipalSerializer, EquipeMunicipaleSerializer, DemandeCreationSiteSerializer,
    ActualiteListSerializer, ActualiteDetailSerializer, PageCMSSerializer, FAQSerializer,
    NewsletterSerializer, AbonneNewsletterSerializer,
    EvenementListSerializer, EvenementDetailSerializer, InscriptionEvenementSerializer,
    RendezVousSerializer,
    FormulaireSerializer, DemarcheListSerializer, DemarcheDetailSerializer,
    SignalementSerializer, ContactSerializer,
    ProjetListSerializer, ProjetDetailSerializer, DeliberationSerializer,
    DocumentBudgetaireSerializer, DocumentOfficielSerializer,
    LoginSerializer, PasswordResetRequestSerializer, PasswordResetConfirmSerializer,
    EmailVerificationSerializer
)

from .filters import (
    ActualiteFilter, PageCMSFilter, FAQFilter, AbonneNewsletterFilter,
    EvenementFilter, RendezVousFilter, SignalementFilter, DemarcheFilter,
    ProjetFilter, DeliberationFilter, DocumentBudgetaireFilter, DocumentOfficielFilter,
    ServiceMunicipalFilter, EquipeMunicipaleFilter, ContactFilter
)

Utilisateur = get_user_model()


# ===== PERMISSIONS PERSONNALISÉES =====

class IsAdminOrReadOnly(permissions.BasePermission):
    """Permission: lecture pour tous, écriture pour admin"""
    
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_authenticated and (
            request.user.is_super_admin() or request.user.is_admin_commune()
        )


class IsCommuneAdminOrReadOnly(permissions.BasePermission):
    """Permission: admin de la commune ou lecture seule"""
    
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        
        if not request.user.is_authenticated:
            return False
        
        if request.user.is_super_admin():
            return True
        
        # Vérifier si l'objet appartient à la commune de l'utilisateur
        commune = getattr(obj, 'commune', None)
        return commune and request.user.peut_gerer_commune(commune)


# ===== AUTH VIEWS =====

@extend_schema(tags=['Authentification'])
class CustomLoginView(generics.GenericAPIView):
    """Connexion utilisateur avec retour user + tokens"""
    permission_classes = [permissions.AllowAny]
    serializer_class = LoginSerializer
    
    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            password = serializer.validated_data['password']
            
            try:
                user = Utilisateur.objects.get(email=email)
                if not user.check_password(password):
                    return Response(
                        {'detail': 'Email ou mot de passe incorrect'},
                        status=status.HTTP_401_UNAUTHORIZED
                    )
                
                if not user.is_active:
                    return Response(
                        {'detail': 'Ce compte est désactivé'},
                        status=status.HTTP_401_UNAUTHORIZED
                    )
                
                refresh = RefreshToken.for_user(user)
                
                return Response({
                    'user': UtilisateurSerializer(user).data,
                    'tokens': {
                        'access': str(refresh.access_token),
                        'refresh': str(refresh),
                    }
                })
            
            except Utilisateur.DoesNotExist:
                return Response(
                    {'detail': 'Email ou mot de passe incorrect'},
                    status=status.HTTP_401_UNAUTHORIZED
                )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@extend_schema(tags=['Authentification'])
class RegisterView(generics.CreateAPIView):
    """Inscription utilisateur"""
    permission_classes = [permissions.AllowAny]
    serializer_class = UtilisateurCreateSerializer
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            
            # Générer token de vérification email
            token = TokenVerification.generer_token(
                user, TokenVerification.TypeToken.EMAIL_VERIFICATION
            )
            
            # TODO: Envoyer email de vérification
            
            refresh = RefreshToken.for_user(user)
            return Response({
                'user': UtilisateurSerializer(user).data,
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                },
                'message': 'Inscription réussie. Vérifiez votre email.'
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@extend_schema(tags=['Authentification'])
class ProfileView(generics.RetrieveUpdateAPIView):
    """Profil utilisateur connecté"""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UtilisateurSerializer
    
    def get_object(self):
        return self.request.user
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return UtilisateurUpdateSerializer
        return UtilisateurSerializer


@extend_schema(tags=['Authentification'])
class ChangePasswordView(generics.GenericAPIView):
    """Changement de mot de passe"""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ChangePasswordSerializer
    
    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            if not request.user.check_password(serializer.data['old_password']):
                return Response(
                    {'old_password': 'Mot de passe incorrect'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            request.user.set_password(serializer.data['new_password'])
            request.user.save()
            return Response({'message': 'Mot de passe modifié avec succès'})
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@extend_schema(tags=['Authentification'])
class PasswordResetRequestView(generics.GenericAPIView):
    """Demande de réinitialisation du mot de passe"""
    permission_classes = [permissions.AllowAny]
    serializer_class = PasswordResetRequestSerializer
    
    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            email = serializer.data['email']
            try:
                user = Utilisateur.objects.get(email=email)
                token = TokenVerification.generer_token(
                    user, TokenVerification.TypeToken.PASSWORD_RESET, duree_heures=1
                )
                # TODO: Envoyer email avec lien de reset
            except Utilisateur.DoesNotExist:
                pass  # Ne pas révéler si l'email existe
            
            return Response({
                'message': 'Si cet email existe, un lien de réinitialisation a été envoyé.'
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@extend_schema(tags=['Authentification'])
class PasswordResetConfirmView(generics.GenericAPIView):
    """Confirmation de réinitialisation du mot de passe"""
    permission_classes = [permissions.AllowAny]
    serializer_class = PasswordResetConfirmSerializer
    
    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            try:
                token_obj = TokenVerification.objects.get(
                    token=serializer.data['token'],
                    type_token=TokenVerification.TypeToken.PASSWORD_RESET
                )
                
                if not token_obj.est_valide():
                    return Response(
                        {'error': 'Token expiré ou invalide'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                user = token_obj.utilisateur
                user.set_password(serializer.data['new_password'])
                user.save()
                
                token_obj.est_utilise = True
                token_obj.save()
                
                return Response({'message': 'Mot de passe réinitialisé avec succès'})
            
            except TokenVerification.DoesNotExist:
                return Response(
                    {'error': 'Token invalide'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ===== CORE VIEWSETS =====

class ConfigurationPortailViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet pour la configuration du portail (lecture seule publique)"""
    queryset = ConfigurationPortail.objects.all()
    serializer_class = ConfigurationPortailSerializer
    permission_classes = [permissions.AllowAny]
    
    def list(self, request, *args, **kwargs):
        config = ConfigurationPortail.get_instance()
        serializer = self.get_serializer(config)
        return Response(serializer.data)


# ===== COMMUNES VIEWSETS =====

class RegionViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet pour les régions"""
    queryset = Region.objects.all()
    serializer_class = RegionSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['nom', 'code']
    ordering_fields = ['nom']


class DepartementViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet pour les départements"""
    queryset = Departement.objects.select_related('region').all()
    serializer_class = DepartementSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['region']
    search_fields = ['nom', 'code']
    ordering_fields = ['nom']


class CommuneViewSet(viewsets.ModelViewSet):
    """ViewSet pour les communes"""
    queryset = Commune.objects.select_related('departement__region').all()
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['departement', 'departement__region', 'statut']
    search_fields = ['nom', 'description']
    ordering_fields = ['nom', 'population', 'date_creation']
    lookup_field = 'slug'
    
    def get_serializer_class(self):
        if self.action == 'list':
            return CommuneListSerializer
        return CommuneDetailSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        # Filtrer les communes actives pour les non-admins
        if not self.request.user.is_authenticated or not self.request.user.is_super_admin():
            queryset = queryset.filter(statut=Commune.Statut.ACTIVE)
        return queryset
    
    @action(detail=True, methods=['get'])
    def actualites(self, request, slug=None):
        """Récupérer les actualités d'une commune"""
        commune = self.get_object()
        actualites = commune.actualites.filter(est_publie=True).order_by('-date_publication')[:10]
        serializer = ActualiteListSerializer(actualites, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def evenements(self, request, slug=None):
        """Récupérer les événements à venir d'une commune"""
        commune = self.get_object()
        evenements = commune.evenements.filter(
            est_public=True,
            date__gte=timezone.now().date()
        ).order_by('date', 'heure_debut')[:10]
        serializer = EvenementListSerializer(evenements, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def projets(self, request, slug=None):
        """Récupérer les projets d'une commune"""
        commune = self.get_object()
        projets = commune.projets.filter(est_public=True).order_by('-date_creation')[:10]
        serializer = ProjetListSerializer(projets, many=True)
        return Response(serializer.data)


class ServiceMunicipalViewSet(viewsets.ModelViewSet):
    """ViewSet pour les services municipaux"""
    queryset = ServiceMunicipal.objects.select_related('commune').filter(est_actif=True)
    serializer_class = ServiceMunicipalSerializer
    permission_classes = [IsCommuneAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_class = ServiceMunicipalFilter
    search_fields = ['nom', 'description']


class EquipeMunicipaleViewSet(viewsets.ModelViewSet):
    """ViewSet pour l'équipe municipale"""
    queryset = EquipeMunicipale.objects.select_related('commune').filter(est_visible=True)
    serializer_class = EquipeMunicipaleSerializer
    permission_classes = [IsCommuneAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_class = EquipeMunicipaleFilter
    search_fields = ['nom']


class DemandeCreationSiteViewSet(viewsets.ModelViewSet):
    """ViewSet pour les demandes de création de site"""
    queryset = DemandeCreationSite.objects.all()
    serializer_class = DemandeCreationSiteSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['statut']
    ordering_fields = ['date_demande']
    
    def get_queryset(self):
        if self.request.user.is_super_admin():
            return super().get_queryset()
        return DemandeCreationSite.objects.none()
    
    def get_permissions(self):
        # Permettre la création sans authentification (formulaire public)
        if self.action == 'create':
            return [permissions.AllowAny()]
        return super().get_permissions()
    
    @action(detail=True, methods=['post'], url_path='valider')
    def valider(self, request, pk=None):
        """
        Valide une demande et crée le site communal
        POST /api/v1/demandes/{id}/valider/
        """
        if not request.user.is_super_admin():
            return Response(
                {'error': 'Seul un super admin peut valider les demandes'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        demande = self.get_object()
        
        if demande.statut != DemandeCreationSite.Statut.EN_ATTENTE:
            return Response(
                {'error': f'Cette demande ne peut pas être validée (statut: {demande.get_statut_display()})'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            from communes.services import SiteCreationService
            
            # Notes optionnelles
            notes = request.data.get('notes', '')
            if notes:
                demande.notes_admin = notes
                demande.save(update_fields=['notes_admin'])
            
            service = SiteCreationService(demande)
            result = service.creer_site()
            
            return Response({
                'success': True,
                'message': f"Site créé pour {demande.nom_commune}",
                'commune': result['commune'],
                'admin': {
                    'email': result['admin']['email'],
                    # Le mot de passe doit être envoyé par email sécurisé
                    'password_sent': True
                },
                'site_url': f"https://{result['commune']['domaine']}"
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['post'], url_path='rejeter')
    def rejeter(self, request, pk=None):
        """
        Rejette une demande de création de site
        POST /api/v1/demandes/{id}/rejeter/
        Body: {"motif": "Raison du rejet"}
        """
        if not request.user.is_super_admin():
            return Response(
                {'error': 'Seul un super admin peut rejeter les demandes'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        demande = self.get_object()
        
        if demande.statut != DemandeCreationSite.Statut.EN_ATTENTE:
            return Response(
                {'error': f'Cette demande ne peut pas être rejetée (statut: {demande.get_statut_display()})'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        motif = request.data.get('motif', 'Demande rejetée par l\'administrateur')
        
        demande.statut = DemandeCreationSite.Statut.REJETEE
        demande.motif_rejet = motif
        demande.date_traitement = timezone.now()
        demande.save()
        
        return Response({
            'success': True,
            'message': f"Demande de {demande.nom_commune} rejetée",
            'motif': motif
        })


# ===== ACTUALITES VIEWSETS =====

class ActualiteViewSet(viewsets.ModelViewSet):
    """ViewSet pour les actualités"""
    queryset = Actualite.objects.select_related('commune', 'auteur').all()
    permission_classes = [IsCommuneAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = ActualiteFilter
    search_fields = ['titre', 'resume', 'contenu']
    ordering_fields = ['date_publication', 'nombre_vues', 'date_creation']
    lookup_field = 'slug'
    
    def get_serializer_class(self):
        if self.action == 'list':
            return ActualiteListSerializer
        return ActualiteDetailSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        if not self.request.user.is_authenticated:
            queryset = queryset.filter(est_publie=True)
        return queryset
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.incrementer_vues()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
    
    def perform_create(self, serializer):
        serializer.save(auteur=self.request.user)


class PageCMSViewSet(viewsets.ModelViewSet):
    """ViewSet pour les pages CMS"""
    queryset = PageCMS.objects.select_related('commune').all()
    serializer_class = PageCMSSerializer
    permission_classes = [IsCommuneAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_class = PageCMSFilter
    search_fields = ['titre', 'contenu']
    lookup_field = 'slug'


class FAQViewSet(viewsets.ModelViewSet):
    """ViewSet pour les FAQ"""
    queryset = FAQ.objects.select_related('commune').filter(est_active=True)
    serializer_class = FAQSerializer
    permission_classes = [IsCommuneAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_class = FAQFilter
    search_fields = ['question', 'reponse']


class AbonneNewsletterViewSet(viewsets.ModelViewSet):
    """ViewSet pour les abonnés newsletter"""
    queryset = AbonneNewsletter.objects.all()
    serializer_class = AbonneNewsletterSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend]
    filterset_class = AbonneNewsletterFilter
    
    def get_permissions(self):
        if self.action == 'create':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]


# ===== EVENEMENTS VIEWSETS =====

class EvenementViewSet(viewsets.ModelViewSet):
    """ViewSet pour les événements"""
    queryset = Evenement.objects.select_related('commune', 'organisateur').all()
    permission_classes = [IsCommuneAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = EvenementFilter
    search_fields = ['nom', 'description', 'lieu']
    ordering_fields = ['date', 'heure_debut', 'date_creation']
    lookup_field = 'slug'
    
    def get_serializer_class(self):
        if self.action == 'list':
            return EvenementListSerializer
        return EvenementDetailSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        if not self.request.user.is_authenticated:
            queryset = queryset.filter(est_public=True)
        
        # Filtre par date (à venir)
        a_venir = self.request.query_params.get('a_venir', None)
        if a_venir == 'true':
            queryset = queryset.filter(date__gte=timezone.now().date())
        
        return queryset
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.AllowAny])
    def inscrire(self, request, slug=None):
        """S'inscrire à un événement"""
        evenement = self.get_object()
        
        if not evenement.inscription_requise:
            return Response(
                {'error': 'Cet événement ne requiert pas d\'inscription'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = InscriptionEvenementSerializer(data={
            **request.data,
            'evenement': evenement.id
        })
        
        if serializer.is_valid():
            if request.user.is_authenticated:
                serializer.save(participant=request.user)
            else:
                serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class InscriptionEvenementViewSet(viewsets.ModelViewSet):
    """ViewSet pour les inscriptions aux événements"""
    queryset = InscriptionEvenement.objects.select_related('evenement', 'participant').all()
    serializer_class = InscriptionEvenementSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['evenement', 'statut']


class RendezVousViewSet(viewsets.ModelViewSet):
    """ViewSet pour les rendez-vous"""
    queryset = RendezVous.objects.select_related('commune', 'service', 'demandeur').all()
    serializer_class = RendezVousSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_class = RendezVousFilter
    ordering_fields = ['date', 'heure_debut']
    
    def get_queryset(self):
        queryset = super().get_queryset()
        if self.request.user.is_authenticated:
            if not self.request.user.is_super_admin():
                # Utilisateur voit ses propres RDV ou ceux de sa commune
                queryset = queryset.filter(
                    Q(demandeur=self.request.user) |
                    Q(commune=self.request.user.commune)
                )
        else:
            queryset = RendezVous.objects.none()
        return queryset
    
    def perform_create(self, serializer):
        if self.request.user.is_authenticated:
            serializer.save(demandeur=self.request.user)
        else:
            serializer.save()


# ===== SERVICES VIEWSETS =====

class FormulaireViewSet(viewsets.ModelViewSet):
    """ViewSet pour les formulaires"""
    queryset = Formulaire.objects.select_related('commune').filter(est_actif=True)
    serializer_class = FormulaireSerializer
    permission_classes = [IsCommuneAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['commune', 'type']
    search_fields = ['nom', 'description']


class DemarcheViewSet(viewsets.ModelViewSet):
    """ViewSet pour les démarches"""
    queryset = Demarche.objects.select_related('commune', 'formulaire', 'demandeur').all()
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['commune', 'statut', 'type']
    search_fields = ['numero_suivi', 'nom_demandeur']
    ordering_fields = ['date_demande', 'priorite']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return DemarcheListSerializer
        return DemarcheDetailSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        
        if user.is_super_admin():
            return queryset
        elif user.is_admin_commune() and user.commune:
            return queryset.filter(commune=user.commune)
        else:
            return queryset.filter(demandeur=user)
    
    def perform_create(self, serializer):
        serializer.save(demandeur=self.request.user)
    
    @action(detail=True, methods=['get'])
    def suivi(self, request, pk=None):
        """Suivi d'une démarche par numéro"""
        numero_suivi = request.query_params.get('numero', None)
        if numero_suivi:
            try:
                demarche = Demarche.objects.get(numero_suivi=numero_suivi)
                serializer = DemarcheDetailSerializer(demarche)
                return Response(serializer.data)
            except Demarche.DoesNotExist:
                return Response(
                    {'error': 'Démarche non trouvée'},
                    status=status.HTTP_404_NOT_FOUND
                )
        return Response(
            {'error': 'Numéro de suivi requis'},
            status=status.HTTP_400_BAD_REQUEST
        )


class SignalementViewSet(viewsets.ModelViewSet):
    """ViewSet pour les signalements"""
    queryset = Signalement.objects.select_related('commune', 'signaleur').all()
    serializer_class = SignalementSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = SignalementFilter
    search_fields = ['titre', 'description', 'adresse', 'numero_suivi']
    ordering_fields = ['date_signalement']
    
    def get_permissions(self):
        # Permettre la création de signalements sans authentification
        if self.action == 'create':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticatedOrReadOnly()]
    
    def perform_create(self, serializer):
        if self.request.user.is_authenticated:
            serializer.save(signaleur=self.request.user)
        else:
            serializer.save()


class ContactViewSet(viewsets.ModelViewSet):
    """ViewSet pour les messages de contact"""
    queryset = Contact.objects.select_related('commune').all()
    serializer_class = ContactSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_class = ContactFilter
    ordering_fields = ['date_envoi']
    
    def get_permissions(self):
        if self.action == 'create':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]


# ===== TRANSPARENCE VIEWSETS =====

class ProjetViewSet(viewsets.ModelViewSet):
    """ViewSet pour les projets"""
    queryset = Projet.objects.select_related('commune', 'responsable').all()
    permission_classes = [IsCommuneAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = ProjetFilter
    search_fields = ['titre', 'description', 'lieu']
    ordering_fields = ['date_debut', 'budget', 'avancement', 'date_creation']
    lookup_field = 'slug'
    
    def get_serializer_class(self):
        if self.action == 'list':
            return ProjetListSerializer
        return ProjetDetailSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        if not self.request.user.is_authenticated:
            queryset = queryset.filter(est_public=True)
        return queryset


class DeliberationViewSet(viewsets.ModelViewSet):
    """ViewSet pour les délibérations"""
    queryset = Deliberation.objects.select_related('commune').filter(est_publie=True)
    serializer_class = DeliberationSerializer
    permission_classes = [IsCommuneAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = DeliberationFilter
    search_fields = ['numero', 'titre', 'resume']
    ordering_fields = ['date_seance', 'date_creation']


class DocumentBudgetaireViewSet(viewsets.ModelViewSet):
    """ViewSet pour les documents budgétaires"""
    queryset = DocumentBudgetaire.objects.select_related('commune').filter(est_publie=True)
    serializer_class = DocumentBudgetaireSerializer
    permission_classes = [IsCommuneAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = DocumentBudgetaireFilter
    search_fields = ['titre', 'description']
    ordering_fields = ['annee', 'date_creation']


class DocumentOfficielViewSet(viewsets.ModelViewSet):
    """ViewSet pour les documents officiels"""
    queryset = DocumentOfficiel.objects.select_related('commune', 'auteur').filter(est_public=True)
    serializer_class = DocumentOfficielSerializer
    permission_classes = [IsCommuneAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = DocumentOfficielFilter
    search_fields = ['titre', 'description', 'numero_reference']
    ordering_fields = ['date_document', 'date_creation', 'nombre_telechargements']
    
    @action(detail=True, methods=['post'])
    def telecharger(self, request, pk=None):
        """Incrémenter le compteur de téléchargements"""
        document = self.get_object()
        document.nombre_telechargements += 1
        document.save(update_fields=['nombre_telechargements'])
        return Response({'url': document.fichier.url})


# ===== STATISTIQUES DASHBOARD =====

from rest_framework import serializers as drf_serializers

class DashboardStatsSerializer(drf_serializers.Serializer):
    """Serializer pour les statistiques dashboard"""
    communes_actives = drf_serializers.IntegerField(required=False)
    communes_en_attente = drf_serializers.IntegerField(required=False)
    demandes_en_attente = drf_serializers.IntegerField(required=False)
    utilisateurs_total = drf_serializers.IntegerField(required=False)
    actualites_total = drf_serializers.IntegerField(required=False)
    actualites = drf_serializers.IntegerField(required=False)
    evenements_a_venir = drf_serializers.IntegerField(required=False)
    demarches_en_attente = drf_serializers.IntegerField(required=False)
    signalements_ouverts = drf_serializers.IntegerField(required=False)
    projets_en_cours = drf_serializers.IntegerField(required=False)
    contacts_non_lus = drf_serializers.IntegerField(required=False)


@extend_schema(tags=['Dashboard'], responses={200: DashboardStatsSerializer})
class DashboardStatsView(generics.GenericAPIView):
    """Statistiques pour le dashboard admin"""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = DashboardStatsSerializer
    
    def get(self, request):
        user = request.user
        stats = {}
        
        if user.is_super_admin():
            stats = {
                'communes_actives': Commune.objects.filter(statut=Commune.Statut.ACTIVE).count(),
                'communes_en_attente': Commune.objects.filter(statut=Commune.Statut.EN_ATTENTE).count(),
                'demandes_en_attente': DemandeCreationSite.objects.filter(
                    statut=DemandeCreationSite.Statut.EN_ATTENTE
                ).count(),
                'utilisateurs_total': Utilisateur.objects.count(),
                'actualites_total': Actualite.objects.filter(est_publie=True).count(),
                'evenements_a_venir': Evenement.objects.filter(
                    date__gte=timezone.now().date(), est_public=True
                ).count(),
            }
        elif user.commune:
            commune = user.commune
            stats = {
                'actualites': commune.actualites.filter(est_publie=True).count(),
                'evenements_a_venir': commune.evenements.filter(
                    date__gte=timezone.now().date()
                ).count(),
                'demarches_en_attente': commune.demarches.filter(
                    statut=Demarche.Statut.EN_ATTENTE
                ).count(),
                'signalements_ouverts': commune.signalements.filter(
                    statut__in=[Signalement.Statut.SIGNALE, Signalement.Statut.EN_COURS]
                ).count(),
                'projets_en_cours': commune.projets.filter(
                    statut=Projet.Statut.EN_COURS
                ).count(),
                'contacts_non_lus': commune.contacts.filter(est_lu=False).count(),
            }
        
        return Response(stats)


# ===== CARTE INTERACTIVE - COMMUNES GÉOLOCALISÉES =====

class CommuneMapSerializer(drf_serializers.Serializer):
    """Serializer pour la carte interactive des communes"""
    id = drf_serializers.IntegerField()
    nom = drf_serializers.CharField()
    slug = drf_serializers.CharField()
    latitude = drf_serializers.DecimalField(max_digits=9, decimal_places=6, allow_null=True)
    longitude = drf_serializers.DecimalField(max_digits=9, decimal_places=6, allow_null=True)
    population = drf_serializers.IntegerField(allow_null=True)
    logo = drf_serializers.ImageField(allow_null=True)
    departement_nom = drf_serializers.CharField()
    region_nom = drf_serializers.CharField()
    domaine = drf_serializers.CharField()
    # Statistiques rapides
    nb_actualites = drf_serializers.IntegerField()
    nb_evenements = drf_serializers.IntegerField()
    nb_projets = drf_serializers.IntegerField()


@extend_schema(
    tags=['Carte Interactive'],
    summary='Liste des communes pour la carte',
    description='Récupère toutes les communes actives avec leurs coordonnées GPS pour affichage sur carte',
    responses={200: CommuneMapSerializer(many=True)}
)
class CommuneMapView(generics.ListAPIView):
    """
    Endpoint pour la carte interactive des communes
    Retourne les communes géolocalisées avec filtres
    """
    permission_classes = [permissions.AllowAny]
    serializer_class = CommuneMapSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['departement', 'departement__region']
    search_fields = ['nom']
    
    def get_queryset(self):
        return Commune.objects.filter(
            statut=Commune.Statut.ACTIVE
        ).select_related('departement__region').annotate(
            nb_actualites=models.Count('actualites', filter=models.Q(actualites__est_publie=True)),
            nb_evenements=models.Count('evenements', filter=models.Q(
                evenements__est_public=True,
                evenements__date__gte=timezone.now().date()
            )),
            nb_projets=models.Count('projets', filter=models.Q(projets__est_public=True)),
        )
    
    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        
        # Formater les données pour la carte
        communes_data = []
        for commune in queryset:
            communes_data.append({
                'id': commune.id,
                'nom': commune.nom,
                'slug': commune.slug,
                'latitude': commune.latitude,
                'longitude': commune.longitude,
                'population': commune.population,
                'logo': request.build_absolute_uri(commune.logo.url) if commune.logo else None,
                'departement_nom': commune.departement.nom if commune.departement else '',
                'region_nom': commune.departement.region.nom if commune.departement else '',
                'domaine': commune.get_domaine(),
                'nb_actualites': commune.nb_actualites,
                'nb_evenements': commune.nb_evenements,
                'nb_projets': commune.nb_projets,
            })
        
        return Response({
            'count': len(communes_data),
            'communes': communes_data
        })


# ===== SUIVI DÉMARCHE PUBLIC =====

class SuiviDemarchePublicSerializer(drf_serializers.Serializer):
    """Serializer pour le suivi public d'une démarche"""
    numero_suivi = drf_serializers.CharField()
    type = drf_serializers.CharField()
    statut = drf_serializers.CharField()
    statut_display = drf_serializers.CharField()
    date_demande = drf_serializers.DateTimeField()
    date_prise_en_charge = drf_serializers.DateTimeField(allow_null=True)
    date_traitement = drf_serializers.DateTimeField(allow_null=True)
    commune_nom = drf_serializers.CharField()
    progression = drf_serializers.IntegerField()
    etapes = drf_serializers.ListField(child=drf_serializers.DictField())


@extend_schema(
    tags=['Suivi Démarches'],
    summary='Suivi public d\'une démarche',
    description='Permet aux citoyens de suivre leur démarche sans authentification via le numéro de suivi',
    responses={200: SuiviDemarchePublicSerializer}
)
class SuiviDemarchePublicView(generics.GenericAPIView):
    """
    Endpoint public pour le suivi des démarches
    Accessible sans authentification via numéro de suivi
    """
    permission_classes = [permissions.AllowAny]
    serializer_class = SuiviDemarchePublicSerializer
    
    def get(self, request, numero):
        try:
            demarche = Demarche.objects.select_related('commune').get(numero_suivi=numero)
            
            # Calculer la progression
            progression_map = {
                Demarche.Statut.EN_ATTENTE: 25,
                Demarche.Statut.EN_COURS: 50,
                Demarche.Statut.VALIDEE: 100,
                Demarche.Statut.COMPLETEE: 100,
                Demarche.Statut.REJETEE: 100,
                Demarche.Statut.ANNULEE: 0,
            }
            
            # Construire les étapes
            etapes = [
                {
                    'numero': 1,
                    'titre': 'Demande soumise',
                    'date': demarche.date_demande.isoformat(),
                    'complete': True
                },
                {
                    'numero': 2,
                    'titre': 'Prise en charge',
                    'date': demarche.date_prise_en_charge.isoformat() if demarche.date_prise_en_charge else None,
                    'complete': demarche.statut not in [Demarche.Statut.EN_ATTENTE, Demarche.Statut.ANNULEE]
                },
                {
                    'numero': 3,
                    'titre': 'Traitement en cours',
                    'date': None,
                    'complete': demarche.statut in [Demarche.Statut.VALIDEE, Demarche.Statut.COMPLETEE, Demarche.Statut.REJETEE]
                },
                {
                    'numero': 4,
                    'titre': 'Traitement terminé',
                    'date': demarche.date_traitement.isoformat() if demarche.date_traitement else None,
                    'complete': demarche.statut in [Demarche.Statut.VALIDEE, Demarche.Statut.COMPLETEE, Demarche.Statut.REJETEE]
                },
            ]
            
            data = {
                'numero_suivi': demarche.numero_suivi,
                'type': demarche.type,
                'statut': demarche.statut,
                'statut_display': demarche.get_statut_display(),
                'date_demande': demarche.date_demande,
                'date_prise_en_charge': demarche.date_prise_en_charge,
                'date_traitement': demarche.date_traitement,
                'commune_nom': demarche.commune.nom,
                'progression': progression_map.get(demarche.statut, 0),
                'etapes': etapes,
            }
            
            return Response(data)
            
        except Demarche.DoesNotExist:
            return Response(
                {'error': 'Démarche non trouvée', 'numero': numero},
                status=status.HTTP_404_NOT_FOUND
            )


# ===== SUIVI SIGNALEMENT PUBLIC =====

class SuiviSignalementPublicSerializer(drf_serializers.Serializer):
    """Serializer pour le suivi public d'un signalement"""
    numero_suivi = drf_serializers.CharField()
    titre = drf_serializers.CharField()
    categorie = drf_serializers.CharField()
    categorie_display = drf_serializers.CharField()
    statut = drf_serializers.CharField()
    statut_display = drf_serializers.CharField()
    date_signalement = drf_serializers.DateTimeField()
    date_resolution = drf_serializers.DateTimeField(allow_null=True)
    commune_nom = drf_serializers.CharField()
    adresse = drf_serializers.CharField()
    commentaire_resolution = drf_serializers.CharField()


@extend_schema(
    tags=['Suivi Signalements'],
    summary='Suivi public d\'un signalement',
    description='Permet aux citoyens de suivre leur signalement sans authentification',
    responses={200: SuiviSignalementPublicSerializer}
)
class SuiviSignalementPublicView(generics.GenericAPIView):
    """
    Endpoint public pour le suivi des signalements
    """
    permission_classes = [permissions.AllowAny]
    serializer_class = SuiviSignalementPublicSerializer
    
    def get(self, request, numero):
        try:
            signalement = Signalement.objects.select_related('commune').get(numero_suivi=numero)
            
            data = {
                'numero_suivi': signalement.numero_suivi,
                'titre': signalement.titre,
                'categorie': signalement.categorie,
                'categorie_display': signalement.get_categorie_display(),
                'statut': signalement.statut,
                'statut_display': signalement.get_statut_display(),
                'date_signalement': signalement.date_signalement,
                'date_resolution': signalement.date_resolution,
                'commune_nom': signalement.commune.nom,
                'adresse': signalement.adresse,
                'commentaire_resolution': signalement.commentaire_resolution,
            }
            
            return Response(data)
            
        except Signalement.DoesNotExist:
            return Response(
                {'error': 'Signalement non trouvé', 'numero': numero},
                status=status.HTTP_404_NOT_FOUND
            )


# ===== NEWSLETTER - ENVOI ET GESTION =====

class NewsletterViewSet(viewsets.ModelViewSet):
    """ViewSet pour les newsletters"""
    queryset = Newsletter.objects.select_related('commune', 'auteur').all()
    serializer_class = NewsletterSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['commune', 'statut']
    ordering_fields = ['date_creation', 'date_envoi']
    
    def get_queryset(self):
        queryset = super().get_queryset()
        if self.request.user.is_authenticated:
            if not self.request.user.is_super_admin() and self.request.user.commune:
                queryset = queryset.filter(commune=self.request.user.commune)
        else:
            queryset = Newsletter.objects.none()
        return queryset
    
    def perform_create(self, serializer):
        serializer.save(auteur=self.request.user)
    
    @action(detail=True, methods=['post'], url_path='envoyer')
    def envoyer(self, request, pk=None):
        """
        Envoie une newsletter aux abonnés actifs de la commune
        POST /api/v1/newsletters/{id}/envoyer/
        """
        newsletter = self.get_object()
        
        if newsletter.statut == Newsletter.Statut.ENVOYEE:
            return Response(
                {'error': 'Cette newsletter a déjà été envoyée'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Récupérer les abonnés actifs
        abonnes = AbonneNewsletter.objects.filter(
            commune=newsletter.commune,
            est_actif=True
        )
        
        if not abonnes.exists():
            return Response(
                {'error': 'Aucun abonné actif pour cette commune'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # TODO: Intégrer un service d'envoi d'emails (Celery + SendGrid/Mailgun)
        # Pour le MVP, on simule l'envoi
        
        newsletter.statut = Newsletter.Statut.ENVOYEE
        newsletter.date_envoi = timezone.now()
        newsletter.nombre_destinataires = abonnes.count()
        newsletter.save()
        
        return Response({
            'success': True,
            'message': f'Newsletter envoyée à {abonnes.count()} abonné(s)',
            'destinataires': abonnes.count()
        })
    
    @action(detail=True, methods=['get'])
    def statistiques(self, request, pk=None):
        """Statistiques d'une newsletter"""
        newsletter = self.get_object()
        
        return Response({
            'titre': newsletter.titre,
            'statut': newsletter.get_statut_display(),
            'date_envoi': newsletter.date_envoi,
            'nombre_destinataires': newsletter.nombre_destinataires,
            'nombre_ouvertures': newsletter.nombre_ouvertures,
            'taux_ouverture': (
                round(newsletter.nombre_ouvertures / newsletter.nombre_destinataires * 100, 1)
                if newsletter.nombre_destinataires > 0 else 0
            )
        })


@extend_schema(
    tags=['Newsletter'],
    summary='Désinscription newsletter',
    description='Permet de se désinscrire de la newsletter via un token unique'
)
class NewsletterUnsubscribeView(generics.GenericAPIView):
    """Désinscription de la newsletter via token"""
    permission_classes = [permissions.AllowAny]
    
    def get(self, request, token):
        try:
            abonne = AbonneNewsletter.objects.get(token_desinscription=token)
            abonne.est_actif = False
            abonne.save()
            
            return Response({
                'success': True,
                'message': f'Vous avez été désinscrit(e) de la newsletter de {abonne.commune.nom}'
            })
        except AbonneNewsletter.DoesNotExist:
            return Response(
                {'error': 'Token invalide'},
                status=status.HTTP_404_NOT_FOUND
            )


# ===== STATISTIQUES PUBLIQUES =====

class StatsPubliquesSerializer(drf_serializers.Serializer):
    """Serializer pour les statistiques publiques"""
    communes_actives = drf_serializers.IntegerField()
    regions_couvertes = drf_serializers.IntegerField()
    population_totale = drf_serializers.IntegerField()
    actualites_publiees = drf_serializers.IntegerField()
    evenements_a_venir = drf_serializers.IntegerField()
    projets_en_cours = drf_serializers.IntegerField()


@extend_schema(
    tags=['Statistiques'],
    summary='Statistiques publiques du portail',
    description='Statistiques globales du portail national E-CMS',
    responses={200: StatsPubliquesSerializer}
)
class StatsPubliquesView(generics.GenericAPIView):
    """
    Statistiques publiques pour le portail national
    Accessible sans authentification
    """
    permission_classes = [permissions.AllowAny]
    serializer_class = StatsPubliquesSerializer
    
    def get(self, request):
        from django.db.models import Sum
        
        communes_actives = Commune.objects.filter(statut=Commune.Statut.ACTIVE)
        
        stats = {
            'communes_actives': communes_actives.count(),
            'regions_couvertes': communes_actives.values('departement__region').distinct().count(),
            'population_totale': communes_actives.aggregate(
                total=Sum('population')
            )['total'] or 0,
            'actualites_publiees': Actualite.objects.filter(est_publie=True).count(),
            'evenements_a_venir': Evenement.objects.filter(
                est_public=True,
                date__gte=timezone.now().date()
            ).count(),
            'projets_en_cours': Projet.objects.filter(
                est_public=True,
                statut=Projet.Statut.EN_COURS
            ).count(),
        }
        
        return Response(stats)


class CommuneStatsSerializer(drf_serializers.Serializer):
    """Serializer pour les statistiques d'une commune"""
    actualites = drf_serializers.IntegerField()
    evenements = drf_serializers.IntegerField()
    projets = drf_serializers.IntegerField()
    projets_en_cours = drf_serializers.IntegerField()
    budget_total_projets = drf_serializers.DecimalField(max_digits=15, decimal_places=2)
    services = drf_serializers.IntegerField()
    documents_officiels = drf_serializers.IntegerField()


@extend_schema(
    tags=['Statistiques'],
    summary='Statistiques d\'une commune',
    description='Statistiques publiques pour une commune spécifique',
    responses={200: CommuneStatsSerializer}
)
class CommuneStatsView(generics.GenericAPIView):
    """Statistiques publiques d'une commune"""
    permission_classes = [permissions.AllowAny]
    serializer_class = CommuneStatsSerializer
    
    def get(self, request, slug):
        try:
            commune = Commune.objects.get(slug=slug, statut=Commune.Statut.ACTIVE)
            
            from django.db.models import Sum
            
            stats = {
                'actualites': commune.actualites.filter(est_publie=True).count(),
                'evenements': commune.evenements.filter(
                    est_public=True,
                    date__gte=timezone.now().date()
                ).count(),
                'projets': commune.projets.filter(est_public=True).count(),
                'projets_en_cours': commune.projets.filter(
                    est_public=True,
                    statut=Projet.Statut.EN_COURS
                ).count(),
                'budget_total_projets': commune.projets.filter(
                    est_public=True
                ).aggregate(total=Sum('budget'))['total'] or 0,
                'services': commune.services.filter(est_actif=True).count(),
                'documents_officiels': commune.documents_officiels.filter(est_public=True).count(),
            }
            
            return Response(stats)
            
        except Commune.DoesNotExist:
            return Response(
                {'error': 'Commune non trouvée'},
                status=status.HTTP_404_NOT_FOUND
            )


# ===== RECHERCHE GLOBALE =====

class RechercheGlobaleSerializer(drf_serializers.Serializer):
    """Serializer pour les résultats de recherche globale"""
    type = drf_serializers.CharField()
    id = drf_serializers.IntegerField()
    titre = drf_serializers.CharField()
    extrait = drf_serializers.CharField()
    url = drf_serializers.CharField()
    commune = drf_serializers.CharField()
    date = drf_serializers.DateTimeField(allow_null=True)


@extend_schema(
    tags=['Recherche'],
    summary='Recherche globale',
    description='Recherche multi-modèles dans actualités, événements, pages, FAQ et projets',
    responses={200: RechercheGlobaleSerializer(many=True)}
)
class RechercheGlobaleView(generics.GenericAPIView):
    """
    Recherche globale sur l'ensemble du contenu du CMS
    Accessible publiquement
    """
    permission_classes = [permissions.AllowAny]
    serializer_class = RechercheGlobaleSerializer
    
    def get(self, request):
        query = request.query_params.get('q', '').strip()
        commune_slug = request.query_params.get('commune', None)
        limit = int(request.query_params.get('limit', 20))
        
        if len(query) < 2:
            return Response({
                'error': 'La recherche doit contenir au moins 2 caractères',
                'query': query
            }, status=status.HTTP_400_BAD_REQUEST)
        
        results = []
        
        # Filtrer par commune si spécifiée
        commune_filter = {}
        if commune_slug:
            try:
                commune = Commune.objects.get(slug=commune_slug)
                commune_filter = {'commune': commune}
            except Commune.DoesNotExist:
                pass
        
        # Recherche dans les actualités
        actualites = Actualite.objects.filter(
            Q(titre__icontains=query) | Q(contenu__icontains=query) | Q(resume__icontains=query),
            est_publie=True,
            **commune_filter
        ).select_related('commune')[:limit]
        
        for actu in actualites:
            results.append({
                'type': 'actualite',
                'id': actu.id,
                'titre': actu.titre,
                'extrait': actu.resume[:150] if actu.resume else '',
                'url': f'/api/v1/actualites/{actu.slug}/',
                'commune': actu.commune.nom,
                'date': actu.date_publication,
            })
        
        # Recherche dans les événements
        evenements = Evenement.objects.filter(
            Q(nom__icontains=query) | Q(description__icontains=query),
            est_public=True,
            **commune_filter
        ).select_related('commune')[:limit]
        
        for evt in evenements:
            results.append({
                'type': 'evenement',
                'id': evt.id,
                'titre': evt.nom,
                'extrait': evt.description[:150] if evt.description else '',
                'url': f'/api/v1/evenements/{evt.slug}/',
                'commune': evt.commune.nom,
                'date': timezone.make_aware(
                    timezone.datetime.combine(evt.date, evt.heure_debut)
                ) if evt.date else None,
            })
        
        # Recherche dans les pages CMS
        pages = PageCMS.objects.filter(
            Q(titre__icontains=query) | Q(contenu__icontains=query),
            est_publie=True,
            **commune_filter
        ).select_related('commune')[:limit]
        
        for page in pages:
            results.append({
                'type': 'page',
                'id': page.id,
                'titre': page.titre,
                'extrait': page.contenu[:150] if page.contenu else '',
                'url': f'/api/v1/pages/{page.slug}/',
                'commune': page.commune.nom,
                'date': page.date_modification,
            })
        
        # Recherche dans les FAQ
        faqs = FAQ.objects.filter(
            Q(question__icontains=query) | Q(reponse__icontains=query),
            est_active=True,
            **commune_filter
        ).select_related('commune')[:limit]
        
        for faq in faqs:
            results.append({
                'type': 'faq',
                'id': faq.id,
                'titre': faq.question,
                'extrait': faq.reponse[:150] if faq.reponse else '',
                'url': f'/api/v1/faqs/{faq.id}/',
                'commune': faq.commune.nom,
                'date': faq.date_creation,
            })
        
        # Recherche dans les projets
        projets = Projet.objects.filter(
            Q(titre__icontains=query) | Q(description__icontains=query),
            est_public=True,
            **commune_filter
        ).select_related('commune')[:limit]
        
        for projet in projets:
            results.append({
                'type': 'projet',
                'id': projet.id,
                'titre': projet.titre,
                'extrait': projet.description[:150] if projet.description else '',
                'url': f'/api/v1/projets/{projet.slug}/',
                'commune': projet.commune.nom,
                'date': projet.date_creation,
            })
        
        # Trier par pertinence (les plus récents d'abord)
        results.sort(key=lambda x: x['date'] or timezone.now(), reverse=True)
        
        return Response({
            'query': query,
            'count': len(results),
            'results': results[:limit]
        })
