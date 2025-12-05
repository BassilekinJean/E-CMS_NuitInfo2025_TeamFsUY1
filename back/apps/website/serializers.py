"""
Website serializers
"""
from rest_framework import serializers
from .models import WebsiteConfig, Section, Page


class SectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Section
        fields = ['id', 'section_id', 'type', 'order', 'is_visible', 'content']
        read_only_fields = ['id']


class PageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Page
        fields = [
            'id', 'title', 'slug', 'content',
            'is_published', 'in_menu', 'menu_order',
            'meta_title', 'meta_description',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'slug', 'created_at', 'updated_at']


class WebsiteConfigSerializer(serializers.ModelSerializer):
    sections = SectionSerializer(many=True, read_only=True)
    mairie_name = serializers.CharField(source='mairie.nom', read_only=True)
    
    class Meta:
        model = WebsiteConfig
        fields = [
            'id', 'mairie', 'mairie_name',
            'is_published', 'published_at',
            'theme', 'meta_title', 'meta_description', 'favicon',
            'social_links', 'google_analytics_id',
            'sections', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'mairie', 'published_at', 'created_at', 'updated_at']
