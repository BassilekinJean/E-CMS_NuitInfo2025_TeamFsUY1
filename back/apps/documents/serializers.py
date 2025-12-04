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
            'categorie', 'annee', 'mairie_nom', 'date_publication',
            'est_public', 'nombre_telechargements'
        ]


class DocumentOfficielDetailSerializer(serializers.ModelSerializer):
    """Serializer détaillé pour un document"""
    
    mairie_nom = serializers.CharField(source='mairie.nom', read_only=True)
    auteur_nom = serializers.CharField(source='auteur.nom', read_only=True)
    
    class Meta:
        model = DocumentOfficiel
        fields = [
            'id', 'titre', 'description', 'type_document', 'fichier_joint',
            'mairie', 'mairie_nom', 'auteur', 'auteur_nom',
            'categorie', 'annee', 'numero_reference', 'date_document',
            'est_public', 'est_mis_en_avant', 'taille_fichier', 'type_mime',
            'nombre_telechargements', 'date_publication', 'date_modification'
        ]
        read_only_fields = ['mairie', 'auteur', 'taille_fichier', 'type_mime', 'nombre_telechargements']


class DocumentOfficielCreateSerializer(serializers.ModelSerializer):
    """Serializer pour création de document"""
    
    class Meta:
        model = DocumentOfficiel
        fields = [
            'titre', 'description', 'type_document', 'fichier_joint',
            'categorie', 'annee', 'numero_reference', 'date_document',
            'est_public', 'est_mis_en_avant'
        ]


# ===== Actualités =====

class ActualiteListSerializer(serializers.ModelSerializer):
    """Serializer pour la liste des actualités"""
    
    mairie_nom = serializers.CharField(source='mairie.nom', read_only=True)
    auteur_nom = serializers.CharField(source='auteur.nom', read_only=True)
    categorie_display = serializers.CharField(source='get_categorie_display', read_only=True)
    
    class Meta:
        model = Actualite
        fields = [
            'id', 'titre', 'slug', 'resume', 'image_principale',
            'mairie_nom', 'auteur_nom', 'categorie', 'categorie_display',
            'est_mis_en_avant', 'est_publie', 'date_publication', 'nombre_vues'
        ]


class ActualiteDetailSerializer(serializers.ModelSerializer):
    """Serializer détaillé pour une actualité"""
    
    mairie_nom = serializers.CharField(source='mairie.nom', read_only=True)
    auteur_nom = serializers.CharField(source='auteur.nom', read_only=True)
    
    class Meta:
        model = Actualite
        fields = [
            'id', 'titre', 'slug', 'resume', 'contenu', 'image_principale',
            'mairie', 'mairie_nom', 'auteur', 'auteur_nom',
            'categorie', 'est_mis_en_avant', 'est_publie',
            'date_publication', 'nombre_vues',
            'date_creation', 'date_modification'
        ]
        read_only_fields = ['mairie', 'auteur', 'slug', 'nombre_vues']


class ActualiteCreateSerializer(serializers.ModelSerializer):
    """Serializer pour création d'actualité"""
    
    class Meta:
        model = Actualite
        fields = [
            'titre', 'resume', 'contenu', 'image_principale',
            'categorie', 'est_mis_en_avant', 'est_publie', 'date_publication'
        ]


# ===== Pages CMS =====

class PageCMSListSerializer(serializers.ModelSerializer):
    """Serializer pour la liste des pages"""
    
    mairie_nom = serializers.CharField(source='mairie.nom', read_only=True)
    parent_titre = serializers.CharField(source='parent.titre', read_only=True)
    
    class Meta:
        model = PageCMS
        fields = [
            'id', 'titre', 'slug', 'mairie_nom', 'parent', 'parent_titre',
            'ordre', 'est_publie', 'afficher_dans_menu', 'date_modification'
        ]


class PageCMSDetailSerializer(serializers.ModelSerializer):
    """Serializer détaillé pour une page"""
    
    mairie_nom = serializers.CharField(source='mairie.nom', read_only=True)
    sous_pages = serializers.SerializerMethodField()
    
    class Meta:
        model = PageCMS
        fields = [
            'id', 'titre', 'slug', 'contenu', 'mairie', 'mairie_nom',
            'parent', 'ordre', 'afficher_dans_menu', 'est_publie',
            'meta_titre', 'meta_description', 'image_bandeau',
            'sous_pages', 'date_creation', 'date_modification'
        ]
        read_only_fields = ['mairie', 'slug']
    
    def get_sous_pages(self, obj):
        enfants = obj.enfants.filter(est_publie=True).order_by('ordre')
        return PageCMSListSerializer(enfants, many=True).data


class PageCMSPublicSerializer(serializers.ModelSerializer):
    """Serializer public pour une page"""
    
    sous_pages = serializers.SerializerMethodField()
    
    class Meta:
        model = PageCMS
        fields = [
            'id', 'titre', 'slug', 'contenu', 'image_bandeau',
            'meta_titre', 'meta_description', 'sous_pages'
        ]
    
    def get_sous_pages(self, obj):
        enfants = obj.enfants.filter(est_publie=True).order_by('ordre')
        return [{'id': p.id, 'titre': p.titre, 'slug': p.slug} for p in enfants]


class PageCMSCreateSerializer(serializers.ModelSerializer):
    """Serializer pour création de page"""
    
    class Meta:
        model = PageCMS
        fields = [
            'titre', 'contenu', 'parent', 'ordre',
            'afficher_dans_menu', 'est_publie',
            'meta_titre', 'meta_description', 'image_bandeau'
        ]


class MenuNavigationSerializer(serializers.Serializer):
    """Serializer pour le menu de navigation"""
    
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
            
            sous_pages = page.enfants.filter(
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
        
        return {'menu': menu}


# ===== FAQ =====

class FAQSerializer(serializers.ModelSerializer):
    """Serializer pour les FAQs"""
    
    class Meta:
        model = FAQ
        fields = [
            'id', 'question', 'reponse', 'categorie', 'ordre',
            'est_active', 'date_creation'
        ]
        read_only_fields = ['date_creation']


class FAQPublicSerializer(serializers.ModelSerializer):
    """Serializer public pour les FAQs"""
    
    class Meta:
        model = FAQ
        fields = ['id', 'question', 'reponse', 'categorie']
