"""
Middleware Multi-Tenant pour E-CMS
Identifie la commune à partir du sous-domaine (ex: yaounde.ecms.cm)
"""
import re
from django.http import Http404
from django.utils.deprecation import MiddlewareMixin


class TenantMiddleware(MiddlewareMixin):
    """
    Middleware pour identifier le tenant (commune) à partir du sous-domaine.
    
    Exemples:
    - yaounde.ecms.cm → tenant = Commune(slug='yaounde')
    - douala.ecms.cm → tenant = Commune(slug='douala')
    - www.ecms.cm / ecms.cm → tenant = None (portail national)
    - localhost:8000 → tenant = None (dev, portail national)
    - yaounde.localhost:8000 → tenant = Commune(slug='yaounde') (dev)
    
    L'objet request.tenant est injecté et utilisable dans les vues/serializers.
    """
    
    # Sous-domaines réservés (ne correspondent pas à une commune)
    RESERVED_SUBDOMAINS = {'www', 'api', 'admin', 'static', 'media', 'mail', 'cdn'}
    
    # Pattern pour extraire le sous-domaine
    SUBDOMAIN_PATTERN = re.compile(
        r'^(?P<subdomain>[a-z0-9-]+)\.'  # sous-domaine
        r'(?P<domain>ecms\.cm|localhost)'  # domaine principal
        r'(?::\d+)?$',  # port optionnel
        re.IGNORECASE
    )
    
    def process_request(self, request):
        """
        Extrait le tenant depuis le sous-domaine et l'injecte dans request.
        """
        request.tenant = None
        request.is_tenant_request = False
        
        host = request.get_host().lower()
        
        # Enlever le port si présent pour la comparaison
        host_without_port = host.split(':')[0]
        
        # Cas spécial: localhost sans sous-domaine = portail national
        if host_without_port in ('localhost', '127.0.0.1', 'ecms.cm', 'www.ecms.cm'):
            return None
        
        # Essayer d'extraire le sous-domaine
        match = self.SUBDOMAIN_PATTERN.match(host)
        
        if match:
            subdomain = match.group('subdomain').lower()
            
            # Ignorer les sous-domaines réservés
            if subdomain in self.RESERVED_SUBDOMAINS:
                return None
            
            # Chercher la commune correspondante
            from communes.models import Commune
            
            try:
                commune = Commune.objects.select_related(
                    'departement__region'
                ).get(
                    slug=subdomain,
                    statut=Commune.Statut.ACTIVE
                )
                request.tenant = commune
                request.is_tenant_request = True
            except Commune.DoesNotExist:
                # Sous-domaine inconnu - on peut choisir de:
                # 1. Lever une 404 (strict)
                # 2. Rediriger vers le portail national (permissif)
                # Pour le MVP, on laisse passer (portail national)
                pass
        
        return None
    
    def process_template_response(self, request, response):
        """
        Injecte le tenant dans le contexte des templates Django (si utilisé).
        """
        if hasattr(response, 'context_data') and response.context_data is not None:
            response.context_data['tenant'] = getattr(request, 'tenant', None)
            response.context_data['is_tenant_request'] = getattr(request, 'is_tenant_request', False)
        return response


class TenantFilterMixin:
    """
    Mixin pour les ViewSets qui doivent filtrer par tenant automatiquement.
    Utiliser avec les ViewSets DRF pour filtrer les querysets par commune.
    
    Usage:
        class ActualiteViewSet(TenantFilterMixin, viewsets.ModelViewSet):
            tenant_field = 'commune'  # Champ FK vers Commune
            ...
    """
    
    tenant_field = 'commune'  # Par défaut, filtre sur le champ 'commune'
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Si requête tenant (sous-domaine), filtrer automatiquement
        if hasattr(self.request, 'tenant') and self.request.tenant:
            filter_kwargs = {self.tenant_field: self.request.tenant}
            queryset = queryset.filter(**filter_kwargs)
        
        return queryset
    
    def perform_create(self, serializer):
        """
        Assigne automatiquement le tenant lors de la création.
        """
        if hasattr(self.request, 'tenant') and self.request.tenant:
            # Vérifier si le serializer accepte ce champ
            if self.tenant_field in serializer.fields:
                serializer.save(**{self.tenant_field: self.request.tenant})
                return
        
        super().perform_create(serializer)


def get_current_tenant(request):
    """
    Helper pour récupérer le tenant courant depuis n'importe où.
    Utile dans les serializers et autres contextes.
    """
    return getattr(request, 'tenant', None)


def require_tenant(view_func):
    """
    Décorateur pour les vues qui nécessitent un tenant.
    Renvoie 404 si la requête n'est pas sur un sous-domaine tenant.
    
    Usage:
        @require_tenant
        def ma_vue(request):
            # request.tenant est garanti d'exister
            ...
    """
    def wrapper(request, *args, **kwargs):
        if not getattr(request, 'tenant', None):
            raise Http404("Cette page n'est accessible que sur un site communal.")
        return view_func(request, *args, **kwargs)
    return wrapper
