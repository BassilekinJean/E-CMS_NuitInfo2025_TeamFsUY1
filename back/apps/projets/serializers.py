from rest_framework import serializers
from .models import Projet, MiseAJourProjet, DocumentProjet


# ===== Documents de Projet =====

class DocumentProjetSerializer(serializers.ModelSerializer):
    """Serializer pour les documents de projet"""
    
    type_document_display = serializers.CharField(source='get_type_document_display', read_only=True)
    
    class Meta:
        model = DocumentProjet
        fields = ['id', 'titre', 'type_document', 'type_document_display', 'fichier', 'description', 'est_public', 'date_creation']


# ===== Mises à jour de Projet =====

class MiseAJourProjetSerializer(serializers.ModelSerializer):
    """Serializer pour les mises à jour"""
    
    auteur_nom = serializers.CharField(source='auteur.nom', read_only=True)
    
    class Meta:
        model = MiseAJourProjet
        fields = [
            'id', 'titre', 'description', 'avancement', 'budget_depense', 'image',
            'auteur', 'auteur_nom', 'date_creation'
        ]
        read_only_fields = ['auteur']


class MiseAJourCreateSerializer(serializers.ModelSerializer):
    """Serializer pour créer une mise à jour"""
    
    class Meta:
        model = MiseAJourProjet
        fields = ['titre', 'description', 'avancement', 'budget_depense', 'image']


# ===== Projets =====

class ProjetListSerializer(serializers.ModelSerializer):
    """Serializer pour la liste des projets"""
    
    mairie_nom = serializers.CharField(source='mairie.nom', read_only=True)
    statut_display = serializers.CharField(source='get_statut_display', read_only=True)
    categorie_display = serializers.CharField(source='get_categorie_display', read_only=True)
    budget_formate = serializers.SerializerMethodField()
    
    class Meta:
        model = Projet
        fields = [
            'id', 'titre', 'slug', 'image_principale', 'mairie', 'mairie_nom',
            'statut', 'statut_display', 'categorie', 'categorie_display',
            'budget', 'budget_formate', 'avancement', 'date_debut', 'date_fin',
            'est_public', 'est_mis_en_avant'
        ]
    
    def get_budget_formate(self, obj):
        if obj.budget:
            return f"{obj.budget:,.0f} FCFA".replace(",", " ")
        return None


class ProjetDetailSerializer(serializers.ModelSerializer):
    """Serializer détaillé pour un projet"""
    
    mairie_nom = serializers.CharField(source='mairie.nom', read_only=True)
    statut_display = serializers.CharField(source='get_statut_display', read_only=True)
    categorie_display = serializers.CharField(source='get_categorie_display', read_only=True)
    responsable_info = serializers.SerializerMethodField()
    mises_a_jour = MiseAJourProjetSerializer(many=True, read_only=True)
    documents = DocumentProjetSerializer(many=True, read_only=True)
    budget_formate = serializers.SerializerMethodField()
    budget_depense_formate = serializers.SerializerMethodField()
    budget_restant = serializers.SerializerMethodField()
    pourcentage_budget_utilise = serializers.SerializerMethodField()
    
    class Meta:
        model = Projet
        fields = [
            'id', 'titre', 'slug', 'description', 'image_principale', 'mairie', 'mairie_nom',
            'statut', 'statut_display', 'categorie', 'categorie_display',
            'budget', 'budget_formate', 'budget_depense', 'budget_depense_formate',
            'budget_restant', 'pourcentage_budget_utilise',
            'avancement', 'date_debut', 'date_fin', 'date_fin_reelle',
            'responsable', 'responsable_info', 'lieu', 'latitude', 'longitude',
            'est_public', 'est_mis_en_avant',
            'mises_a_jour', 'documents', 'date_creation', 'date_modification'
        ]
        read_only_fields = ['mairie', 'responsable']
    
    def get_responsable_info(self, obj):
        if obj.responsable:
            return {
                'id': obj.responsable.id,
                'nom': obj.responsable.nom,
                'email': obj.responsable.email
            }
        return None
    
    def get_budget_formate(self, obj):
        if obj.budget:
            return f"{obj.budget:,.0f} FCFA".replace(",", " ")
        return None
    
    def get_budget_depense_formate(self, obj):
        if obj.budget_depense:
            return f"{obj.budget_depense:,.0f} FCFA".replace(",", " ")
        return None
    
    def get_budget_restant(self, obj):
        return obj.get_budget_restant()
    
    def get_pourcentage_budget_utilise(self, obj):
        return obj.get_pourcentage_budget_utilise()


class ProjetCreateSerializer(serializers.ModelSerializer):
    """Serializer pour création de projet"""
    
    class Meta:
        model = Projet
        fields = [
            'titre', 'description', 'image_principale', 'categorie', 'statut',
            'budget', 'budget_depense', 'avancement', 'date_debut', 'date_fin',
            'lieu', 'latitude', 'longitude', 'est_public', 'est_mis_en_avant'
        ]


class ProjetPublicSerializer(serializers.ModelSerializer):
    """Serializer public pour transparence"""
    
    statut_display = serializers.CharField(source='get_statut_display', read_only=True)
    categorie_display = serializers.CharField(source='get_categorie_display', read_only=True)
    mises_a_jour_recentes = serializers.SerializerMethodField()
    budget_formate = serializers.SerializerMethodField()
    budget_depense_formate = serializers.SerializerMethodField()
    pourcentage_budget_utilise = serializers.SerializerMethodField()
    
    class Meta:
        model = Projet
        fields = [
            'id', 'titre', 'slug', 'description', 'image_principale',
            'statut', 'statut_display', 'categorie', 'categorie_display',
            'budget', 'budget_formate', 'budget_depense', 'budget_depense_formate',
            'pourcentage_budget_utilise', 'avancement', 'date_debut', 'date_fin',
            'lieu', 'mises_a_jour_recentes'
        ]
    
    def get_mises_a_jour_recentes(self, obj):
        recentes = obj.mises_a_jour.order_by('-date_creation')[:3]
        return MiseAJourProjetSerializer(recentes, many=True).data
    
    def get_budget_formate(self, obj):
        if obj.budget:
            return f"{obj.budget:,.0f} FCFA".replace(",", " ")
        return None
    
    def get_budget_depense_formate(self, obj):
        if obj.budget_depense:
            return f"{obj.budget_depense:,.0f} FCFA".replace(",", " ")
        return None
    
    def get_pourcentage_budget_utilise(self, obj):
        return obj.get_pourcentage_budget_utilise()


# ===== Statistiques de Projets =====

class StatistiqueProjetsSerializer(serializers.Serializer):
    """Statistiques globales des projets d'une mairie"""
    
    def to_representation(self, queryset):
        from django.db.models import Sum, Count, Avg
        
        stats = queryset.aggregate(
            total_projets=Count('id'),
            budget_total=Sum('budget'),
            depenses_totales=Sum('budget_depense'),
            avancement_moyen=Avg('avancement')
        )
        
        # Compte par statut
        par_statut = {}
        for statut in Projet.Statut.choices:
            par_statut[statut[0]] = queryset.filter(statut=statut[0]).count()
        
        return {
            'total_projets': stats['total_projets'] or 0,
            'budget_total': stats['budget_total'] or 0,
            'budget_total_formate': f"{stats['budget_total'] or 0:,.0f} FCFA".replace(",", " "),
            'depenses_totales': stats['depenses_totales'] or 0,
            'depenses_totales_formatees': f"{stats['depenses_totales'] or 0:,.0f} FCFA".replace(",", " "),
            'avancement_moyen': round(stats['avancement_moyen'] or 0, 1),
            'par_statut': par_statut
        }
