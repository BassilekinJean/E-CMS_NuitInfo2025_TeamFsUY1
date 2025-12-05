/**
 * Configuration API - E-CMS
 * Gestion des appels API et du contexte tenant (multi-site)
 */

// URL de base de l'API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

/**
 * Extrait le slug du tenant depuis le sous-domaine actuel
 * Exemples:
 * - yaounde.ecms.cm → 'yaounde'
 * - yaounde.localhost:5173 → 'yaounde'
 * - localhost:5173 → null (portail national)
 */
export function getTenantSlug(): string | null {
  const hostname = window.location.hostname.toLowerCase();
  
  // Cas spéciaux: pas de tenant
  if (hostname === 'localhost' || hostname === '127.0.0.1' || 
      hostname === 'ecms.cm' || hostname === 'www.ecms.cm') {
    return null;
  }
  
  // Pattern pour extraire le sous-domaine
  const match = hostname.match(/^([a-z0-9-]+)\.(ecms\.cm|localhost)$/i);
  if (match) {
    const subdomain = match[1];
    // Ignorer les sous-domaines réservés
    const reserved = ['www', 'api', 'admin', 'static', 'media'];
    if (!reserved.includes(subdomain)) {
      return subdomain;
    }
  }
  
  return null;
}

/**
 * Type pour les réponses paginées de l'API
 */
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

/**
 * Type pour les erreurs API
 */
export interface ApiError {
  message: string;
  code?: string;
  field?: string;
  details?: Record<string, string[]>;
}

/**
 * Client API avec gestion des tokens JWT et du tenant
 */
class ApiClient {
  private baseUrl: string;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  
  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.loadTokens();
  }
  
  /**
   * Charge les tokens depuis le localStorage
   */
  private loadTokens(): void {
    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem('ecms_access_token');
      this.refreshToken = localStorage.getItem('ecms_refresh_token');
    }
  }
  
  /**
   * Sauvegarde les tokens
   */
  setTokens(access: string, refresh: string): void {
    this.accessToken = access;
    this.refreshToken = refresh;
    localStorage.setItem('ecms_access_token', access);
    localStorage.setItem('ecms_refresh_token', refresh);
  }
  
  /**
   * Efface les tokens (déconnexion)
   */
  clearTokens(): void {
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem('ecms_access_token');
    localStorage.removeItem('ecms_refresh_token');
  }
  
  /**
   * Vérifie si l'utilisateur est authentifié
   */
  isAuthenticated(): boolean {
    return !!this.accessToken;
  }
  
  /**
   * Construit les headers pour les requêtes
   */
  private getHeaders(includeAuth: boolean = true): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    // Ajouter le token d'authentification
    if (includeAuth && this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }
    
    // Ajouter le header tenant si on est sur un sous-domaine
    const tenantSlug = getTenantSlug();
    if (tenantSlug) {
      headers['X-Tenant-Slug'] = tenantSlug;
    }
    
    return headers;
  }
  
  /**
   * Effectue une requête API
   */
  async request<T>(
    endpoint: string,
    options: RequestInit = {},
    requireAuth: boolean = false
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.getHeaders(requireAuth || this.isAuthenticated()),
        ...options.headers,
      },
      credentials: 'include',
    });
    
    // Gestion du refresh token si 401
    if (response.status === 401 && this.refreshToken) {
      const refreshed = await this.refreshAccessToken();
      if (refreshed) {
        // Réessayer la requête avec le nouveau token
        return this.request<T>(endpoint, options, requireAuth);
      } else {
        this.clearTokens();
        throw new Error('Session expirée. Veuillez vous reconnecter.');
      }
    }
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw {
        message: errorData.detail || errorData.error || 'Une erreur est survenue',
        code: response.status.toString(),
        details: errorData,
      } as ApiError;
    }
    
    // Retourner null pour les réponses 204 No Content
    if (response.status === 204) {
      return null as T;
    }
    
    return response.json();
  }
  
  /**
   * Rafraîchit le token d'accès
   */
  private async refreshAccessToken(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: this.refreshToken }),
      });
      
      if (response.ok) {
        const data = await response.json();
        this.accessToken = data.access;
        localStorage.setItem('ecms_access_token', data.access);
        return true;
      }
    } catch {
      // Ignore
    }
    return false;
  }
  
  // ===== Méthodes HTTP =====
  
  async get<T>(endpoint: string, requireAuth: boolean = false): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' }, requireAuth);
  }
  
  async post<T>(endpoint: string, data?: unknown, requireAuth: boolean = false): Promise<T> {
    return this.request<T>(
      endpoint,
      {
        method: 'POST',
        body: data ? JSON.stringify(data) : undefined,
      },
      requireAuth
    );
  }
  
  async put<T>(endpoint: string, data: unknown, requireAuth: boolean = true): Promise<T> {
    return this.request<T>(
      endpoint,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      },
      requireAuth
    );
  }
  
  async patch<T>(endpoint: string, data: unknown, requireAuth: boolean = true): Promise<T> {
    return this.request<T>(
      endpoint,
      {
        method: 'PATCH',
        body: JSON.stringify(data),
      },
      requireAuth
    );
  }
  
  async delete<T>(endpoint: string, requireAuth: boolean = true): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' }, requireAuth);
  }
}

// Instance singleton du client API
export const api = new ApiClient(API_BASE_URL);

// ===== Types pour les entités principales =====

export interface Commune {
  id: number;
  nom: string;
  slug: string;
  logo?: string;
  banniere?: string;
  description?: string;
  historique?: string;
  mot_du_maire?: string;
  nom_maire?: string;
  photo_maire?: string;
  couleur_primaire: string;
  couleur_secondaire: string;
  population?: number;
  telephone?: string;
  email?: string;
  adresse?: string;
  horaires_ouverture?: Record<string, string>;
  departement_nom?: string;
  region_nom?: string;
  statut: string;
}

export interface Actualite {
  id: number;
  titre: string;
  slug: string;
  resume?: string;
  contenu?: string;
  image_principale?: string;
  categorie: string;
  categorie_display?: string;
  commune: number;
  commune_nom?: string;
  auteur_nom?: string;
  est_publie: boolean;
  est_mis_en_avant: boolean;
  date_publication?: string;
  nombre_vues: number;
}

export interface Evenement {
  id: number;
  nom: string;
  slug: string;
  description?: string;
  date: string;
  heure_debut: string;
  heure_fin?: string;
  lieu?: string;
  categorie: string;
  categorie_display?: string;
  statut: string;
  statut_display?: string;
  image?: string;
  commune: number;
  commune_nom?: string;
  inscription_requise: boolean;
  places_limitees: boolean;
  nombre_places?: number;
  places_restantes?: number;
  est_public: boolean;
  est_mis_en_avant: boolean;
}

export interface PageCMS {
  id: number;
  titre: string;
  slug: string;
  contenu?: string;
  commune: number;
  commune_nom?: string;
  est_publie: boolean;
  afficher_dans_menu: boolean;
  ordre_menu?: number;
  meta_titre?: string;
  meta_description?: string;
}

export interface Projet {
  id: number;
  titre: string;
  slug: string;
  description?: string;
  budget?: number;
  budget_depense?: number;
  avancement: number;
  date_debut?: string;
  date_fin?: string;
  categorie: string;
  categorie_display?: string;
  statut: string;
  statut_display?: string;
  commune: number;
  commune_nom?: string;
  image_principale?: string;
  est_public: boolean;
  lieu?: string;
}

export interface FAQ {
  id: number;
  question: string;
  reponse: string;
  categorie?: string;
  commune: number;
  ordre?: number;
  est_active: boolean;
}

export interface Newsletter {
  email: string;
  nom?: string;
  commune: number;
}

export interface Deliberation {
  id: number;
  numero: string;
  titre: string;
  resume?: string;
  date_seance: string;
  fichier: string;
  commune: number;
  est_publie: boolean;
}

export interface DocumentBudgetaire {
  id: number;
  type_document: string;
  type_document_display?: string;
  titre: string;
  annee: number;
  description?: string;
  fichier: string;
  montant_total?: number;
  commune: number;
  est_publie: boolean;
}

export interface DocumentOfficiel {
  id: number;
  titre: string;
  type_document: string;
  type_document_display?: string;
  description?: string;
  fichier: string;
  categorie?: string;
  numero_reference?: string;
  date_document?: string;
  commune: number;
  est_public: boolean;
  nombre_telechargements: number;
}

export interface Signalement {
  id: number;
  numero_suivi?: string;
  titre: string;
  description?: string;
  categorie: string;
  adresse?: string;
  latitude?: number;
  longitude?: number;
  photo?: string;
  nom_signaleur?: string;
  email_signaleur?: string;
  telephone_signaleur?: string;
  statut: string;
  commune: number;
}

export interface Contact {
  nom: string;
  email: string;
  sujet: string;
  message: string;
  telephone?: string;
  commune: number;
}

export interface ServiceMunicipal {
  id: number;
  nom: string;
  description?: string;
  responsable?: string;
  telephone?: string;
  email?: string;
  horaires?: string;
  icone?: string;
  commune: number;
}

export interface RendezVous {
  id: number;
  date: string;
  heure_debut: string;
  heure_fin?: string;
  motif: string;
  nom_demandeur: string;
  email_demandeur: string;
  telephone_demandeur?: string;
  service: number;
  service_nom?: string;
  commune: number;
  statut: string;
}

export interface User {
  id: number;
  email: string;
  nom: string;
  telephone?: string;
  photo?: string;
  role: string;
  role_display?: string;
  commune?: number;
  commune_nom?: string;
  is_active: boolean;
  email_verifie: boolean;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface LoginResponse {
  user: User;
  tokens: AuthTokens;
}

export interface RegisterResponse {
  user: User;
  tokens: AuthTokens;
  message: string;
}

export interface StatsPubliques {
  communes_actives: number;
  regions_couvertes: number;
  population_totale: number;
  actualites_publiees: number;
  evenements_a_venir: number;
  projets_en_cours: number;
}

export interface CommuneStats {
  actualites: number;
  evenements: number;
  projets: number;
  projets_en_cours: number;
  budget_total_projets: number;
  services: number;
  documents_officiels: number;
}

export default api;
