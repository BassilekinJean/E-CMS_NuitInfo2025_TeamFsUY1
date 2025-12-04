from rest_framework import serializers
from .models import DocumentOfficiel, Actualite, PageCMS, FAQ


# ===== Documents Officiels =====

class DocumentOfficielListSerializer(serializers.ModelSerializer):
    """Serializer pour la liste des documents"""
    
    mairie_nom = serializers.CharField(source='mairie.nom', read_only=True)
    type_document_display = serializers.CharField(source='get_type_document_display', read_only=True)
    
    class Meta:
        model = DocumentOfficiel
        fields = [
            'id', 'titre', 'type_document', 'type_document_display',
            'mairie_nom', 'date_publication', 'est_public'
        ]


class DocumentOfficielDetailSerializer(serializers.ModelSerializer):
    """Serializer détaillé pour un document"""
    
    mairie_nom = serializers.CharField(source='mairie.nom', read_only=True)
    publie_par_nom = serializers.CharField(source='publie_par.get_full_name', read_only=True)
    
    class Meta:
        model = DocumentOfficiel
        fields = [
            'id', 'titre', 'description', 'type_document', 'fichier',
            'mairie', 'mairie_nom', 'est_public', 'publie_par', 
            'publie_par_nom', 'date_publication', 'date_modification'
        ]
        read_only_fields = ['mairie', 'publie_par']


class DocumentOfficielCreateSerializer(serializers.ModelSerializer):
    """Serializer pour création de document"""
    
    class Meta:
        model = DocumentOfficiel
        fields = ['titre', 'description', 'type_document', 'fichier', 'est_public']


# ===== Actualités =====

class ActualiteListSerializer(serializers.ModelSerializer):
    """Serializer pour la liste des actualités"""
    
    mairie_nom = serializers.CharField(source='mairie.nom', read_only=True)
    auteur_nom = serializers.CharField(source='auteur.get_full_name', read_only=True)
    
    class Meta:
        model = Actualite
        fields = [
            'id', 'titre', 'resume', 'image', 'mairie_nom', 
            'auteur_nom', 'categorie', 'est_mise_en_avant',
            'date_publication', 'est_publie'
        ]


class ActualiteDetailSerializer(serializers.ModelSerializer):
    """Serializer détaillé pour une actualité"""
    
    mairie_nom = serializers.CharField(source='mairie.nom', read_only=True)
    auteur = serializers.SerializerMethodField()
    
    class Meta:
        model = Actualite
        fields = [
            'id', 'titre', 'resume', 'contenu', 'image', 'mairie', 
            'mairie_nom', 'auteur', 'categorie', 'tags', 
            'est_mise_en_avant', 'est_publie', 'date_publication',
            'date_creation', 'date_modification'
        ]
        read_only_fields = ['mairie', 'auteur']
    
    def get_auteur(self, obj):
        return {
            'id': obj.auteur.id,
            'nom_complet': obj.auteur.get_full_name()
        }


class ActualiteCreateSerializer(serializers.ModelSerializer):
    """Serializer pour création d'actualité"""
    
    class Meta:
        model = Actualite
        fields = [
            'titre', 'resume', 'contenu', 'image', 'categorie',
            'tags', 'est_mise_en_avant', 'est_publie', 'date_publication'
        ]


# ===== Pages CMS =====

class PageCMSListSerializer(serializers.ModelSerializer):
    """Serializer pour la liste des pages"""
    
    mairie_nom = serializers.CharField(source='mairie.nom', read_only=True)
    parent_titre = serializers.CharField(source='parent.titre', read_only=True)
    
    class Meta:
        model = PageCMS
        fields = [
            'id', 'titre', 'slug', 'mairie_nom', 'parent_titre',
            'ordre', 'est_publie', 'afficher_dans_menu', 'date_modification'
        ]


class PageCMSDetailSerializer(serializers.ModelSerializer):
    """Serializer détaillé pour une page"""
    
    mairie_nom = serializers.CharField(source='mairie.nom', read_only=True)
    cree_par_nom = serializers.CharField(source='cree_par.get_full_name', read_only=True)
    modifie_par_nom = serializers.CharField(source='modifie_par.get_full_name', read_only=True)
    sous_pages = serializers.SerializerMethodField()
    
    class Meta:
        model = PageCMS
        fields = [
            'id', 'titre', 'slug', 'contenu', 'meta_description',
            'mairie', 'mairie_nom', 'parent', 'ordre', 'est_publie',
            'afficher_dans_menu', 'template', 'cree_par', 'cree_par_nom',
            'modifie_par', 'modifie_par_nom', 'sous_pages',
            'date_creation', 'date_modification'
        ]
        read_only_fields = ['mairie', 'cree_par', 'modifie_par']
    
    def get_sous_pages(self, obj):
        sous_pages = obj.sous_pages.filter(est_publie=True)
        return PageCMSListSerializer(sous_pages, many=True).data


class PageCMSCreateSerializer(serializers.ModelSerializer):
    """Serializer pour création de page"""
    
    class Meta:
        model = PageCMS
        fields = [
            'titre', 'slug', 'contenu', 'meta_description', 'parent',
            'ordre', 'est_publie', 'afficher_dans_menu', 'template'
        ]


class PageCMSPublicSerializer(serializers.ModelSerializer):
    """Serializer public pour une page (sans infos sensibles)"""
    
    sous_pages = serializers.SerializerMethodField()
    
    class Meta:
        model = PageCMS
        fields = [
            'id', 'titre', 'slug', 'contenu', 'meta_description',
            'sous_pages', 'date_modification'
        ]
    
    def get_sous_pages(self, obj):
        sous_pages = obj.sous_pages.filter(est_publie=True, afficher_dans_menu=True)
        return [{'id': p.id, 'titre': p.titre, 'slug': p.slug} for p in sous_pages]


# ===== FAQ =====

class FAQSerializer(serializers.ModelSerializer):
    """Serializer pour les FAQ"""
    
    mairie_nom = serializers.CharField(source='mairie.nom', read_only=True)
    
    class Meta:
        model = FAQ
        fields = [
            'id', 'question', 'reponse', 'categorie', 'mairie', 
            'mairie_nom', 'ordre', 'est_publie', 'date_creation'
        ]
        read_only_fields = ['mairie']


class FAQPublicSerializer(serializers.ModelSerializer):
    """Serializer public pour FAQ"""
    
    class Meta:
        model = FAQ
        fields = ['id', 'question', 'reponse', 'categorie']


# ===== Menu de Navigation =====

class MenuNavigationSerializer(serializers.Serializer):
    """Serializer pour le menu de navigation d'une mairie"""
    
    def to_representation(self, mairie):
        pages = PageCMS.objects.filter(
            mairie=mairie,
            est_publie=True,
            afficher_dans_menu=True,
            parent__isnull=True
        ).order_by('ordre')
        
        menu = []
        for page in pages:
            item = {
                'id': page.id,
                'titre': page.titre,
                'slug': page.slug,
                'sous_pages': []
            }
            sous_pages = page.sous_pages.filter(
                est_publie=True, 
                afficher_dans_menu=True
            ).order_by('ordre')
            
            for sp in sous_pages:
                item['sous_pages'].append({
                    'id': sp.id,
                    'titre': sp.titre,
                    'slug': sp.slug
                })
            
            menu.append(item)
        
        return menu
