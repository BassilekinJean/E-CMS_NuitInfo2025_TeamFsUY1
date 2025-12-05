"""
Dashboard serializers
"""
from rest_framework import serializers
from .models import Activity


class ActivitySerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()
    time_ago = serializers.SerializerMethodField()
    
    class Meta:
        model = Activity
        fields = ['id', 'type', 'title', 'description', 'user', 'created_at', 'time_ago']
    
    def get_user(self, obj):
        if obj.user:
            return {
                'name': obj.user.nom,
                'avatar': None  # TODO: ajouter avatar
            }
        return None
    
    def get_time_ago(self, obj):
        from django.utils import timezone
        from datetime import timedelta
        
        now = timezone.now()
        diff = now - obj.created_at
        
        if diff < timedelta(minutes=1):
            return "À l'instant"
        elif diff < timedelta(hours=1):
            minutes = int(diff.total_seconds() / 60)
            return f"Il y a {minutes} min"
        elif diff < timedelta(days=1):
            hours = int(diff.total_seconds() / 3600)
            return f"Il y a {hours} h"
        elif diff < timedelta(days=7):
            days = diff.days
            return f"Il y a {days} j"
        else:
            return obj.created_at.strftime("%d/%m/%Y")


class DashboardStatsSerializer(serializers.Serializer):
    """Serializer pour les statistiques du dashboard"""
    value = serializers.IntegerField()
    label = serializers.CharField()
    trend = serializers.CharField()
    trend_direction = serializers.CharField()
