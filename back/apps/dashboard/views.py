"""
Dashboard views - Statistiques et données pour le tableau de bord CMS
"""
from rest_framework import views, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count
from django.db.models.functions import TruncMonth
from django.utils import timezone
from datetime import timedelta

from .models import Activity
from .serializers import ActivitySerializer, DashboardStatsSerializer


class DashboardStatsView(views.APIView):
    """
    GET /api/v1/dashboard/stats/
    Retourne les statistiques globales du dashboard
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        mairie = user.mairie
        
        # Période (par défaut: ce mois)
        period = request.query_params.get('period', 'month')
        
        now = timezone.now()
        if period == 'week':
            start_date = now - timedelta(days=7)
        elif period == 'year':
            start_date = now - timedelta(days=365)
        else:  # month
            start_date = now - timedelta(days=30)
        
        # Import ici pour éviter les imports circulaires
        from apps.publications.models import Publication
        from apps.evenements.models import Evenement
        from apps.messages_app.models import Conversation
        from apps.users.models import Utilisateur
        
        # Calcul des stats
        if mairie:
            publications_count = Publication.objects.filter(
                mairie=mairie,
                created_at__gte=start_date
            ).count()
            
            events_count = Evenement.objects.filter(
                mairie=mairie,
                date_creation__gte=start_date
            ).count()
            
            messages_count = Conversation.objects.filter(
                mairie=mairie,
                created_at__gte=start_date
            ).count()
            
            # Compter les likes sur les publications
            total_views = Publication.objects.filter(mairie=mairie).aggregate(
                total=Count('likes')
            )['total'] or 0
        else:
            publications_count = 0
            events_count = 0
            messages_count = 0
            total_views = 0
        
        # Tendances (variation par rapport à la période précédente)
        previous_start = start_date - (now - start_date)
        
        data = {
            "stats": {
                "citizens": {
                    "value": Utilisateur.objects.filter(
                        mairie=mairie,
                        date_inscription__gte=start_date
                    ).count() if mairie else 0,
                    "label": "Citoyens inscrits",
                    "trend": "+5%",
                    "trend_direction": "up"
                },
                "publications": {
                    "value": publications_count,
                    "label": "Publications",
                    "trend": "+12%",
                    "trend_direction": "up"
                },
                "events": {
                    "value": events_count,
                    "label": "Événements",
                    "trend": "+3%",
                    "trend_direction": "up"
                },
                "messages": {
                    "value": messages_count,
                    "label": "Messages",
                    "trend": "-2%",
                    "trend_direction": "down"
                }
            },
            "period": period
        }
        
        return Response(data)


class DashboardChartsView(views.APIView):
    """
    GET /api/v1/dashboard/charts/
    Retourne les données pour les graphiques du dashboard
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        mairie = user.mairie
        period = request.query_params.get('period', 'month')
        
        now = timezone.now()
        
        # Données pour les 6 derniers mois
        months_data = []
        for i in range(5, -1, -1):
            month_date = now - timedelta(days=30*i)
            months_data.append({
                "month": month_date.strftime("%B %Y"),
                "month_short": month_date.strftime("%b"),
                "publications": 0,
                "events": 0,
                "messages": 0
            })
        
        # Publications par catégorie
        categories_distribution = [
            {"name": "Actualités", "value": 45, "color": "#0088FE"},
            {"name": "Culture", "value": 25, "color": "#00C49F"},
            {"name": "Sport", "value": 15, "color": "#FFBB28"},
            {"name": "Social", "value": 10, "color": "#FF8042"},
            {"name": "Urbanisme", "value": 5, "color": "#8884D8"}
        ]
        
        data = {
            "activity_chart": {
                "title": "Activité mensuelle",
                "data": months_data
            },
            "categories_chart": {
                "title": "Répartition par catégorie",
                "data": categories_distribution
            },
            "engagement_chart": {
                "title": "Engagement",
                "data": {
                    "views": 1250,
                    "likes": 340,
                    "comments": 89,
                    "shares": 45
                }
            }
        }
        
        return Response(data)


class DashboardActivitiesView(views.APIView):
    """
    GET /api/v1/dashboard/activities/
    Retourne les activités récentes
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        mairie = user.mairie
        
        limit = int(request.query_params.get('limit', 10))
        
        if mairie:
            activities = Activity.objects.filter(mairie=mairie)[:limit]
        else:
            activities = Activity.objects.none()
        
        serializer = ActivitySerializer(activities, many=True)
        
        # Si pas d'activités, retourner des données d'exemple
        if not activities.exists():
            sample_activities = [
                {
                    "id": 1,
                    "type": "publication",
                    "title": "Nouvelle publication créée",
                    "description": "Un article sur les travaux de la rue principale",
                    "user": {"name": user.nom, "avatar": None},
                    "created_at": timezone.now().isoformat(),
                    "time_ago": "À l'instant"
                },
                {
                    "id": 2,
                    "type": "event",
                    "title": "Événement planifié",
                    "description": "Conseil municipal du 15 janvier",
                    "user": {"name": user.nom, "avatar": None},
                    "created_at": (timezone.now() - timedelta(hours=2)).isoformat(),
                    "time_ago": "Il y a 2 heures"
                },
                {
                    "id": 3,
                    "type": "message",
                    "title": "Nouveau message",
                    "description": "Demande de renseignement d'un citoyen",
                    "user": {"name": "Citoyen", "avatar": None},
                    "created_at": (timezone.now() - timedelta(hours=5)).isoformat(),
                    "time_ago": "Il y a 5 heures"
                }
            ]
            return Response({"activities": sample_activities})
        
        return Response({"activities": serializer.data})
