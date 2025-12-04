# from rest_framework import generics, status, permissions
# from rest_framework.response import Response
# from rest_framework.views import APIView
# from django.shortcuts import get_object_or_404
# from django.utils import timezone
# from django.db.models import Q
# from .models import Evenement, InscriptionEvenement, Newsletter, AbonneNewsletter
# from .serializers import (
#     EvenementListSerializer, EvenementDetailSerializer, EvenementCreateSerializer,
#     EvenementPublicSerializer, InscriptionEvenementSerializer, InscriptionCreateSerializer,
#     NewsletterListSerializer, NewsletterDetailSerializer, NewsletterCreateSerializer,
#     AbonneNewsletterSerializer, AbonnementNewsletterSerializer
# )
# from apps.mairies.models import Mairie


# class IsAgentCommunal(permissions.BasePermission):
#     """Permission pour les agents communaux"""
    
#     def has_permission(self, request, view):
#         return request.user.is_authenticated and (
#             request.user.is_agent_communal() or request.user.is_admin_national()
#         )


# # ===== Événements Publics =====

# class EvenementsPublicsListView(generics.ListAPIView):
#     """Liste des événements publiés d'une mairie"""
    
#     serializer_class = EvenementListSerializer
#     permission_classes = [permissions.AllowAny]
    
#     def get_queryset(self):
#         mairie_slug = self.kwargs.get('mairie_slug')
#         mairie = get_object_or_404(Mairie, slug=mairie_slug)
        
#         queryset = Evenement.objects.filter(mairie=mairie, est_publie=True)
        
#         # Filtres
#         categorie = self.request.query_params.get('categorie')
#         a_venir = self.request.query_params.get('a_venir')
        
#         if categorie:
#             queryset = queryset.filter(categorie=categorie)
        
#         if a_venir == 'true':
#             queryset = queryset.filter(date_debut__gte=timezone.now())
        
#         return queryset.order_by('date_debut')


# class EvenementPublicDetailView(generics.RetrieveAPIView):
#     """Détail public d'un événement"""
    
#     serializer_class = EvenementPublicSerializer
#     permission_classes = [permissions.AllowAny]
    
#     def get_queryset(self):
#         return Evenement.objects.filter(est_publie=True)


# class EvenementsAVenirView(generics.ListAPIView):
#     """Événements à venir d'une mairie"""
    
#     serializer_class = EvenementListSerializer
#     permission_classes = [permissions.AllowAny]
    
#     def get_queryset(self):
#         mairie_slug = self.kwargs.get('mairie_slug')
#         mairie = get_object_or_404(Mairie, slug=mairie_slug)
        
#         return Evenement.objects.filter(
#             mairie=mairie,
#             est_publie=True,
#             date_debut__gte=timezone.now()
#         ).order_by('date_debut')[:10]


# class CalendrierEvenementsView(APIView):
#     """Calendrier des événements d'une mairie"""
    
#     permission_classes = [permissions.AllowAny]
    
#     def get(self, request, mairie_slug):
#         mairie = get_object_or_404(Mairie, slug=mairie_slug)
        
#         # Paramètres de date
#         mois = request.query_params.get('mois')
#         annee = request.query_params.get('annee')
        
#         queryset = Evenement.objects.filter(mairie=mairie, est_publie=True)
        
#         if mois and annee:
#             queryset = queryset.filter(
#                 Q(date_debut__year=annee, date_debut__month=mois) |
#                 Q(date_fin__year=annee, date_fin__month=mois)
#             )
        
#         evenements = queryset.order_by('date_debut')
        
#         # Format calendrier
#         calendrier = []
#         for evt in evenements:
#             calendrier.append({
#                 'id': evt.id,
#                 'titre': evt.titre,
#                 'date_debut': evt.date_debut.isoformat(),
#                 'date_fin': evt.date_fin.isoformat() if evt.date_fin else None,
#                 'lieu': evt.lieu,
#                 'categorie': evt.categorie
#             })
        
#         return Response(calendrier)


# # ===== Gestion des Événements (Agent) =====

# class EvenementsGestionListView(generics.ListCreateAPIView):
#     """Gestion des événements (agent)"""
    
#     permission_classes = [IsAgentCommunal]
    
#     def get_serializer_class(self):
#         if self.request.method == 'POST':
#             return EvenementCreateSerializer
#         return EvenementListSerializer
    
#     def get_queryset(self):
#         user = self.request.user
#         if user.is_admin_national():
#             mairie_id = self.request.query_params.get('mairie')
#             if mairie_id:
#                 return Evenement.objects.filter(mairie_id=mairie_id)
#             return Evenement.objects.all()
#         return Evenement.objects.filter(mairie=user.mairie)
    
#     def perform_create(self, serializer):
#         user = self.request.user
#         if user.is_admin_national():
#             mairie_id = self.request.data.get('mairie')
#             mairie = get_object_or_404(Mairie, pk=mairie_id)
#         else:
#             mairie = user.mairie
#         serializer.save(mairie=mairie, organisateur=user)


# class EvenementGestionDetailView(generics.RetrieveUpdateDestroyAPIView):
#     """Détail/modification/suppression d'un événement"""
    
#     serializer_class = EvenementDetailSerializer
#     permission_classes = [IsAgentCommunal]
    
#     def get_queryset(self):
#         user = self.request.user
#         if user.is_admin_national():
#             return Evenement.objects.all()
#         return Evenement.objects.filter(mairie=user.mairie)


# # ===== Inscriptions =====

# class SInscrireEvenementView(generics.CreateAPIView):
#     """S'inscrire à un événement"""
    
#     serializer_class = InscriptionCreateSerializer
#     permission_classes = [permissions.IsAuthenticated]


# class MesInscriptionsView(generics.ListAPIView):
#     """Liste de mes inscriptions"""
    
#     serializer_class = InscriptionEvenementSerializer
#     permission_classes = [permissions.IsAuthenticated]
    
#     def get_queryset(self):
#         return InscriptionEvenement.objects.filter(
#             participant=self.request.user
#         ).order_by('-date_inscription')


# class AnnulerInscriptionView(APIView):
#     """Annuler une inscription"""
    
#     permission_classes = [permissions.IsAuthenticated]
    
#     def post(self, request, pk):
#         inscription = get_object_or_404(
#             InscriptionEvenement, 
#             pk=pk, 
#             participant=request.user
#         )
        
#         if inscription.evenement.date_debut < timezone.now():
#             return Response(
#                 {'error': 'Impossible d\'annuler une inscription pour un événement passé'},
#                 status=status.HTTP_400_BAD_REQUEST
#             )
        
#         inscription.statut = InscriptionEvenement.Statut.ANNULEE
#         inscription.save()
        
#         return Response({'message': 'Inscription annulée'})


# class InscriptionsEvenementView(generics.ListAPIView):
#     """Liste des inscriptions pour un événement (agent)"""
    
#     serializer_class = InscriptionEvenementSerializer
#     permission_classes = [IsAgentCommunal]
    
#     def get_queryset(self):
#         evenement_id = self.kwargs.get('evenement_id')
#         return InscriptionEvenement.objects.filter(
#             evenement_id=evenement_id
#         ).order_by('-date_inscription')


# # ===== Newsletters =====

# class NewslettersGestionListView(generics.ListCreateAPIView):
#     """Gestion des newsletters (agent)"""
    
#     permission_classes = [IsAgentCommunal]
    
#     def get_serializer_class(self):
#         if self.request.method == 'POST':
#             return NewsletterCreateSerializer
#         return NewsletterListSerializer
    
#     def get_queryset(self):
#         user = self.request.user
#         if user.is_admin_national():
#             mairie_id = self.request.query_params.get('mairie')
#             if mairie_id:
#                 return Newsletter.objects.filter(mairie_id=mairie_id)
#             return Newsletter.objects.all()
#         return Newsletter.objects.filter(mairie=user.mairie)
    
#     def perform_create(self, serializer):
#         user = self.request.user
#         if user.is_admin_national():
#             mairie_id = self.request.data.get('mairie')
#             mairie = get_object_or_404(Mairie, pk=mairie_id)
#         else:
#             mairie = user.mairie
#         serializer.save(mairie=mairie, cree_par=user)


# class NewsletterGestionDetailView(generics.RetrieveUpdateDestroyAPIView):
#     """Détail/modification/suppression d'une newsletter"""
    
#     serializer_class = NewsletterDetailSerializer
#     permission_classes = [IsAgentCommunal]
    
#     def get_queryset(self):
#         user = self.request.user
#         if user.is_admin_national():
#             return Newsletter.objects.all()
#         return Newsletter.objects.filter(mairie=user.mairie)


# class EnvoyerNewsletterView(APIView):
#     """Envoyer une newsletter"""
    
#     permission_classes = [IsAgentCommunal]
    
#     def post(self, request, pk):
#         user = request.user
        
#         if user.is_admin_national():
#             newsletter = get_object_or_404(Newsletter, pk=pk)
#         else:
#             newsletter = get_object_or_404(Newsletter, pk=pk, mairie=user.mairie)
        
#         if newsletter.statut == Newsletter.Statut.ENVOYEE:
#             return Response(
#                 {'error': 'Cette newsletter a déjà été envoyée'},
#                 status=status.HTTP_400_BAD_REQUEST
#             )
        
#         # Récupérer les abonnés
#         abonnes = AbonneNewsletter.objects.filter(
#             mairie=newsletter.mairie,
#             est_actif=True
#         )
        
#         # TODO: Implémenter l'envoi réel des emails
#         # Pour l'instant, on marque juste comme envoyée
        
#         newsletter.statut = Newsletter.Statut.ENVOYEE
#         newsletter.date_envoi = timezone.now()
#         newsletter.save()
        
#         return Response({
#             'message': f'Newsletter envoyée à {abonnes.count()} abonné(s)',
#             'destinataires': abonnes.count()
#         })


# # ===== Abonnements Newsletter =====

# class AbonnerNewsletterView(APIView):
#     """S'abonner à une newsletter (public)"""
    
#     permission_classes = [permissions.AllowAny]
    
#     def post(self, request, mairie_slug):
#         mairie = get_object_or_404(Mairie, slug=mairie_slug)
#         email = request.data.get('email')
        
#         if not email:
#             return Response(
#                 {'error': 'L\'email est requis'},
#                 status=status.HTTP_400_BAD_REQUEST
#             )
        
#         # Vérifier si déjà abonné
#         abonne, created = AbonneNewsletter.objects.get_or_create(
#             email=email,
#             mairie=mairie,
#             defaults={'est_actif': True}
#         )
        
#         if not created:
#             if abonne.est_actif:
#                 return Response({'message': 'Vous êtes déjà abonné à cette newsletter'})
#             else:
#                 abonne.est_actif = True
#                 abonne.save()
#                 return Response({'message': 'Votre abonnement a été réactivé'})
        
#         return Response({'message': 'Abonnement réussi'}, status=status.HTTP_201_CREATED)


# class DesabonnerNewsletterView(APIView):
#     """Se désabonner d'une newsletter"""
    
#     permission_classes = [permissions.AllowAny]
    
#     def post(self, request, mairie_slug):
#         mairie = get_object_or_404(Mairie, slug=mairie_slug)
#         email = request.data.get('email')
        
#         if not email:
#             return Response(
#                 {'error': 'L\'email est requis'},
#                 status=status.HTTP_400_BAD_REQUEST
#             )
        
#         try:
#             abonne = AbonneNewsletter.objects.get(email=email, mairie=mairie)
#             abonne.est_actif = False
#             abonne.save()
#             return Response({'message': 'Désabonnement réussi'})
#         except AbonneNewsletter.DoesNotExist:
#             return Response(
#                 {'error': 'Cet email n\'est pas abonné'},
#                 status=status.HTTP_404_NOT_FOUND
#             )


# class AbonnesNewsletterListView(generics.ListAPIView):
#     """Liste des abonnés (agent)"""
    
#     serializer_class = AbonneNewsletterSerializer
#     permission_classes = [IsAgentCommunal]
    
#     def get_queryset(self):
#         user = self.request.user
#         if user.is_admin_national():
#             mairie_id = self.request.query_params.get('mairie')
#             if mairie_id:
#                 return AbonneNewsletter.objects.filter(mairie_id=mairie_id)
#             return AbonneNewsletter.objects.all()
#         return AbonneNewsletter.objects.filter(mairie=user.mairie)
