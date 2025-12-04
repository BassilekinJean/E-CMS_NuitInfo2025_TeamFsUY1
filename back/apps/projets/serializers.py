from rest_framework import serializers
from .models import Projet, MiseAJourProjet, DocumentProjet


# ===== Documents de Projet =====

class DocumentProjetSerializer(serializers.ModelSerializer):
    """Serializer pour les documents de projet"""
    
    class Meta:
        model = DocumentProjet
        fields = ['id', 'titre', 'type_document', 'fichier', 'date_ajout']


# ===== Mises à jour de Projet =====

class MiseAJourProjetSerializer(serializers.ModelSerializer):
    """Serializer pour les mises à jour"""
    
    auteur_nom = serializers.CharField(source='auteur.get_full_name', read_only=True)
    
    class Meta:
        model = MiseAJourProjet
        fields = [
            'id', 'titre', 'contenu', 'avancement_avant', 'avancement_apres',
            'auteur', 'auteur_nom', 'date_mise_a_jour'
        ]
        read_only_fields = ['auteur']


class MiseAJourCreateSerializer(serializers.ModelSerializer):
    """Serializer pour créer une mise à jour"""
    
    class Meta:
        model = MiseAJourProjet
        fields = ['titre', 'contenu', 'avancement_apres']


# ===== Projets =====

class ProjetListSerializer(serializers.ModelSerializer):
    """Serializer pour la liste des projets"""
    
    mairie_nom = serializers.CharField(source='mairie.nom', read_only=True)
    statut_display = serializers.CharField(source='get_statut_display', read_only=True)
    budget_formate = serializers.SerializerMethodField()
    
    class Meta:
        model = Projet
        fields = [
            'id', 'titre', 'image', 'mairie_nom', 'statut', 'statut_display',
            'budget', 'budget_formate', 'avancement', 'date_debut', 'date_fin_prevue'
        ]
    
    def get_budget_formate(self, obj):
        if obj.budget:
            return f"{obj.budget:,.0f} FCFA".replace(",", " ")
        return None


class ProjetDetailSerializer(serializers.ModelSerializer):
    """Serializer détaillé pour un projet"""
    
    mairie_nom = serializers.CharField(source='mairie.nom', read_only=True)
    responsable = serializers.SerializerMethodField()
    mises_a_jour = MiseAJourProjetSerializer(many=True, read_only=True)
    documents = DocumentProjetSerializer(many=True, read_only=True)
    budget_formate = serializers.SerializerMethodField()
    depenses_formatees = serializers.SerializerMethodField()
    
    class Meta:
        model = Projet
        fields = [
            'id', 'titre', 'description', 'image', 'mairie', 'mairie_nom',
            'statut', 'budget', 'budget_formate', 'depenses', 'depenses_formatees',
            'avancement', 'date_debut', 'date_fin_prevue', 'date_fin_reelle',
            'responsable', 'localisation', 'latitude', 'longitude',
            'mises_a_jour', 'documents', 'date_creation'
        ]
        read_only_fields = ['mairie', 'responsable']
    
    def get_responsable(self, obj):
        if obj.responsable:
            return {
                'id': obj.responsable.id,
                'nom_complet': obj.responsable.get_full_name()
            }
        return None
    
    def get_budget_formate(self, obj):
        if obj.budget:
            return f"{obj.budget:,.0f} FCFA".replace(",", " ")
        return None
    
    def get_depenses_formatees(self, obj):
        if obj.depenses:
            return f"{obj.depenses:,.0f} FCFA".replace(",", " ")
        return None


class ProjetCreateSerializer(serializers.ModelSerializer):
    """Serializer pour création de projet"""
    
    class Meta:
        model = Projet
        fields = [
            'titre', 'description', 'image', 'statut', 'budget', 'depenses',
            'avancement', 'date_debut', 'date_fin_prevue', 'localisation',
            'latitude', 'longitude'
        ]


class ProjetPublicSerializer(serializers.ModelSerializer):
    """Serializer public pour transparence"""
    
    mises_a_jour_recentes = serializers.SerializerMethodField()
    budget_formate = serializers.SerializerMethodField()
    depenses_formatees = serializers.SerializerMethodField()
    taux_utilisation_budget = serializers.SerializerMethodField()
    
    class Meta:
        model = Projet
        fields = [
            'id', 'titre', 'description', 'image', 'statut', 
            'budget', 'budget_formate', 'depenses', 'depenses_formatees',
            'taux_utilisation_budget', 'avancement', 'date_debut', 
            'date_fin_prevue', 'localisation', 'mises_a_jour_recentes'
        ]
    
    def get_mises_a_jour_recentes(self, obj):
        recentes = obj.mises_a_jour.order_by('-date_mise_a_jour')[:3]
        return MiseAJourProjetSerializer(recentes, many=True).data
    
    def get_budget_formate(self, obj):
        if obj.budget:
            return f"{obj.budget:,.0f} FCFA".replace(",", " ")
        return None
    
    def get_depenses_formatees(self, obj):
        if obj.depenses:
            return f"{obj.depenses:,.0f} FCFA".replace(",", " ")
        return None
    
    def get_taux_utilisation_budget(self, obj):
        if obj.budget and obj.depenses:
            return round((obj.depenses / obj.budget) * 100, 1)
        return 0


# ===== Statistiques de Projets =====

class StatistiqueProjetsSerializer(serializers.Serializer):
    """Statistiques globales des projets d'une mairie"""
    
    def to_representation(self, queryset):
        from django.db.models import Sum, Count, Avg
        
        stats = queryset.aggregate(
            total_projets=Count('id'),
            budget_total=Sum('budget'),
            depenses_totales=Sum('depenses'),
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
