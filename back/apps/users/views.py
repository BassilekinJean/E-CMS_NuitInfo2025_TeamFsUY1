from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from .models import ProfilCitoyen, ProfilAgentCommunal
from .serializers import (
    InscriptionSerializer, UtilisateurSerializer, UtilisateurListSerializer,
    ProfilCitoyenSerializer, ProfilAgentCommunalSerializer,
    ChangerMotDePasseSerializer, CreerAgentSerializer
)

Utilisateur = get_user_model()


class IsAdminNational(permissions.BasePermission):
    """Permission pour les administrateurs nationaux uniquement"""
    
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_admin_national()


class IsAgentCommunal(permissions.BasePermission):
    """Permission pour les agents communaux"""
    
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_agent_communal()


class IsAgentOrAdmin(permissions.BasePermission):
    """Permission pour les agents communaux ou administrateurs"""
    
    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            request.user.is_admin_national() or request.user.is_agent_communal()
        )


# ===== Authentification =====

class InscriptionView(generics.CreateAPIView):
    """Vue pour l'inscription des citoyens"""
    
    queryset = Utilisateur.objects.all()
    serializer_class = InscriptionSerializer
    permission_classes = [permissions.AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        utilisateur = serializer.save()
        
        refresh = RefreshToken.for_user(utilisateur)
        
        return Response({
            'message': 'Inscription réussie',
            'utilisateur': UtilisateurSerializer(utilisateur).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_201_CREATED)


class DeconnexionView(APIView):
    """Vue pour la déconnexion (blacklist du token refresh)"""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            return Response({'message': 'Déconnexion réussie'}, status=status.HTTP_200_OK)
        except Exception:
            return Response({'message': 'Déconnexion réussie'}, status=status.HTTP_200_OK)


# ===== Profil Utilisateur =====

class ProfilUtilisateurView(generics.RetrieveUpdateAPIView):
    """Vue pour récupérer/modifier le profil de l'utilisateur connecté"""
    
    serializer_class = UtilisateurSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user


class ProfilCitoyenView(generics.RetrieveUpdateAPIView):
    """Vue pour le profil citoyen de l'utilisateur connecté"""
    
    serializer_class = ProfilCitoyenSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        profil, created = ProfilCitoyen.objects.get_or_create(utilisateur=self.request.user)
        return profil


class ProfilAgentView(generics.RetrieveUpdateAPIView):
    """Vue pour le profil agent de l'utilisateur connecté"""
    
    serializer_class = ProfilAgentCommunalSerializer
    permission_classes = [IsAgentCommunal]
    
    def get_object(self):
        return self.request.user.profil_agent


class ChangerMotDePasseView(APIView):
    """Vue pour changer le mot de passe"""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        serializer = ChangerMotDePasseSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        if not request.user.check_password(serializer.validated_data['ancien_mot_de_passe']):
            return Response(
                {'error': 'Mot de passe actuel incorrect'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        request.user.set_password(serializer.validated_data['nouveau_mot_de_passe'])
        request.user.save()
        
        return Response({'message': 'Mot de passe modifié avec succès'})


# ===== Gestion des Utilisateurs (Admin) =====

class ListeUtilisateursView(generics.ListAPIView):
    """Liste des utilisateurs (admin national ou agent de la mairie)"""
    
    serializer_class = UtilisateurListSerializer
    permission_classes = [IsAgentOrAdmin]
    
    def get_queryset(self):
        user = self.request.user
        
        if user.is_admin_national():
            queryset = Utilisateur.objects.all()
        else:
            # Agent communal: seulement les utilisateurs de sa mairie
            queryset = Utilisateur.objects.filter(mairie=user.mairie)
        
        # Filtres
        role = self.request.query_params.get('role')
        mairie = self.request.query_params.get('mairie')
        
        if role:
            queryset = queryset.filter(role=role)
        if mairie and user.is_admin_national():
            queryset = queryset.filter(mairie_id=mairie)
        
        return queryset.order_by('-date_inscription')


class DetailUtilisateurView(generics.RetrieveUpdateDestroyAPIView):
    """Détail d'un utilisateur (admin)"""
    
    serializer_class = UtilisateurSerializer
    permission_classes = [IsAgentOrAdmin]
    
    def get_queryset(self):
        user = self.request.user
        
        if user.is_admin_national():
            return Utilisateur.objects.all()
        else:
            return Utilisateur.objects.filter(mairie=user.mairie)


class CreerAgentView(generics.CreateAPIView):
    """Créer un agent communal (admin national ou agent existant)"""
    
    serializer_class = CreerAgentSerializer
    permission_classes = [IsAgentOrAdmin]
    
    def perform_create(self, serializer):
        # Si l'utilisateur est un agent, forcer la mairie
        if self.request.user.is_agent_communal():
            serializer.save(mairie=self.request.user.mairie)
        else:
            serializer.save()


class ActiverDesactiverUtilisateurView(APIView):
    """Activer ou désactiver un utilisateur"""
    
    permission_classes = [IsAgentOrAdmin]
    
    def post(self, request, pk):
        try:
            if request.user.is_admin_national():
                utilisateur = Utilisateur.objects.get(pk=pk)
            else:
                utilisateur = Utilisateur.objects.get(pk=pk, mairie=request.user.mairie)
            
            utilisateur.is_active = not utilisateur.is_active
            utilisateur.save()
            
            statut = 'activé' if utilisateur.is_active else 'désactivé'
            return Response({'message': f'Utilisateur {statut} avec succès'})
        
        except Utilisateur.DoesNotExist:
            return Response(
                {'error': 'Utilisateur non trouvé'},
                status=status.HTTP_404_NOT_FOUND
            )
