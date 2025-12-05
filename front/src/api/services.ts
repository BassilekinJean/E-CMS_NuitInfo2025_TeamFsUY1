/**
 * Services API - E-CMS
 * Fonctions pour interagir avec l'API backend
 */

import api, {
  type PaginatedResponse,
  type Commune,
  type Actualite,
  type Evenement,
  type PageCMS,
  type Projet,
  type Deliberation,
  type DocumentBudgetaire,
  type DocumentOfficiel,
  type FAQ,
  type ServiceMunicipal,
  type Signalement,
  type Contact,
  type Newsletter,
  type RendezVous,
  type User,
  type LoginResponse,
  type RegisterResponse,
  type StatsPubliques,
  type CommuneStats,
  getTenantSlug,
} from './client';

// ===== AUTH =====

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/login/', { email, password });
    // Gérer les deux formats de réponse possibles
    if (response.tokens) {
      api.setTokens(response.tokens.access, response.tokens.refresh);
    } else if ((response as any).access && (response as any).refresh) {
      // Format simple_jwt standard
      api.setTokens((response as any).access, (response as any).refresh);
    }
    return response;
  },
  
  async register(data: { email: string; nom: string; password: string; password_confirm: string; telephone?: string }): Promise<RegisterResponse> {
    const response = await api.post<RegisterResponse>('/auth/register/', data);
    api.setTokens(response.tokens.access, response.tokens.refresh);
    return response;
  },
  
  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout/', {}, true);
    } finally {
      api.clearTokens();
    }
  },
  
  async getProfile(): Promise<User> {
    return api.get<User>('/auth/profile/', true);
  },
  
  async updateProfile(data: Partial<User>): Promise<User> {
    return api.patch<User>('/auth/profile/', data, true);
  },
  
  async changePassword(oldPassword: string, newPassword: string, newPasswordConfirm: string): Promise<void> {
    await api.post('/auth/change-password/', {
      old_password: oldPassword,
      new_password: newPassword,
      new_password_confirm: newPasswordConfirm,
    }, true);
  },
  
  async requestPasswordReset(email: string): Promise<{ message: string }> {
    return api.post('/auth/password-reset/', { email });
  },
  
  async confirmPasswordReset(token: string, newPassword: string, newPasswordConfirm: string): Promise<{ message: string }> {
    return api.post('/auth/password-reset/confirm/', {
      token,
      new_password: newPassword,
      new_password_confirm: newPasswordConfirm,
    });
  },
  
  isAuthenticated(): boolean {
    return api.isAuthenticated();
  },
};

// ===== COMMUNES =====

export const communeService = {
  async getAll(params?: { departement?: number; region?: number; search?: string }): Promise<PaginatedResponse<Commune>> {
    const query = new URLSearchParams();
    if (params?.departement) query.set('departement', params.departement.toString());
    if (params?.region) query.set('departement__region', params.region.toString());
    if (params?.search) query.set('search', params.search);
    return api.get<PaginatedResponse<Commune>>(`/communes/?${query.toString()}`);
  },
  
  async getBySlug(slug: string): Promise<Commune> {
    return api.get<Commune>(`/communes/${slug}/`);
  },
  
  async getCurrent(): Promise<Commune | null> {
    const slug = getTenantSlug();
    if (!slug) return null;
    return this.getBySlug(slug);
  },
  
  async getStats(slug: string): Promise<CommuneStats> {
    return api.get<CommuneStats>(`/stats/commune/${slug}/`);
  },
  
  async getActualites(slug: string): Promise<Actualite[]> {
    const response = await api.get<{ results: Actualite[] } | Actualite[]>(`/communes/${slug}/actualites/`);
    return Array.isArray(response) ? response : response.results;
  },
  
  async getEvenements(slug: string): Promise<Evenement[]> {
    const response = await api.get<{ results: Evenement[] } | Evenement[]>(`/communes/${slug}/evenements/`);
    return Array.isArray(response) ? response : response.results;
  },
  
  async getProjets(slug: string): Promise<Projet[]> {
    const response = await api.get<{ results: Projet[] } | Projet[]>(`/communes/${slug}/projets/`);
    return Array.isArray(response) ? response : response.results;
  },
};

// ===== ACTUALITES =====

export const actualiteService = {
  async getAll(params?: { commune?: string; categorie?: string; search?: string; page?: number }): Promise<PaginatedResponse<Actualite>> {
    const query = new URLSearchParams();
    if (params?.commune) query.set('commune', params.commune);
    if (params?.categorie) query.set('categorie', params.categorie);
    if (params?.search) query.set('search', params.search);
    if (params?.page) query.set('page', params.page.toString());
    return api.get<PaginatedResponse<Actualite>>(`/actualites/?${query.toString()}`);
  },
  
  async getBySlug(slug: string): Promise<Actualite> {
    return api.get<Actualite>(`/actualites/${slug}/`);
  },
  
  async create(data: Partial<Actualite>): Promise<Actualite> {
    return api.post<Actualite>('/actualites/', data, true);
  },
  
  async update(slug: string, data: Partial<Actualite>): Promise<Actualite> {
    return api.patch<Actualite>(`/actualites/${slug}/`, data, true);
  },
  
  async delete(slug: string): Promise<void> {
    await api.delete(`/actualites/${slug}/`);
  },
};

// ===== EVENEMENTS =====

export const evenementService = {
  async getAll(params?: { commune?: string; categorie?: string; a_venir?: boolean; page?: number }): Promise<PaginatedResponse<Evenement>> {
    const query = new URLSearchParams();
    if (params?.commune) query.set('commune', params.commune);
    if (params?.categorie) query.set('categorie', params.categorie);
    if (params?.a_venir) query.set('a_venir', 'true');
    if (params?.page) query.set('page', params.page.toString());
    return api.get<PaginatedResponse<Evenement>>(`/evenements/?${query.toString()}`);
  },
  
  async getBySlug(slug: string): Promise<Evenement> {
    return api.get<Evenement>(`/evenements/${slug}/`);
  },
  
  async inscrire(slug: string, data: { nom: string; email: string; telephone?: string }): Promise<{ id: number }> {
    return api.post(`/evenements/${slug}/inscrire/`, data);
  },
  
  async create(data: Partial<Evenement>): Promise<Evenement> {
    return api.post<Evenement>('/evenements/', data, true);
  },
  
  async update(slug: string, data: Partial<Evenement>): Promise<Evenement> {
    return api.patch<Evenement>(`/evenements/${slug}/`, data, true);
  },
  
  async delete(slug: string): Promise<void> {
    await api.delete(`/evenements/${slug}/`);
  },
};

// ===== PAGES CMS =====

export const pageService = {
  async getAll(params?: { commune?: string; afficher_dans_menu?: boolean }): Promise<PaginatedResponse<PageCMS>> {
    const query = new URLSearchParams();
    if (params?.commune) query.set('commune', params.commune);
    if (params?.afficher_dans_menu !== undefined) query.set('afficher_dans_menu', params.afficher_dans_menu.toString());
    return api.get<PaginatedResponse<PageCMS>>(`/pages/?${query.toString()}`);
  },
  
  async getBySlug(slug: string): Promise<PageCMS> {
    return api.get<PageCMS>(`/pages/${slug}/`);
  },
  
  async create(data: Partial<PageCMS>): Promise<PageCMS> {
    return api.post<PageCMS>('/pages/', data, true);
  },
  
  async update(slug: string, data: Partial<PageCMS>): Promise<PageCMS> {
    return api.patch<PageCMS>(`/pages/${slug}/`, data, true);
  },
  
  async delete(slug: string): Promise<void> {
    await api.delete(`/pages/${slug}/`);
  },
};

// ===== PROJETS (TRANSPARENCE) =====

export const projetService = {
  async getAll(params?: { commune?: string; categorie?: string; statut?: string; page?: number }): Promise<PaginatedResponse<Projet>> {
    const query = new URLSearchParams();
    if (params?.commune) query.set('commune', params.commune);
    if (params?.categorie) query.set('categorie', params.categorie);
    if (params?.statut) query.set('statut', params.statut);
    if (params?.page) query.set('page', params.page.toString());
    return api.get<PaginatedResponse<Projet>>(`/projets/?${query.toString()}`);
  },
  
  async getBySlug(slug: string): Promise<Projet> {
    return api.get<Projet>(`/projets/${slug}/`);
  },
};

// ===== TRANSPARENCE =====

export const transparenceService = {
  async getDeliberations(params?: { commune?: string; annee?: number; search?: string; page?: number }): Promise<PaginatedResponse<Deliberation>> {
    const query = new URLSearchParams();
    if (params?.commune) query.set('commune', params.commune);
    if (params?.annee) query.set('date_seance__year', params.annee.toString());
    if (params?.search) query.set('search', params.search);
    if (params?.page) query.set('page', params.page.toString());
    return api.get<PaginatedResponse<Deliberation>>(`/deliberations/?${query.toString()}`);
  },

  async getBudgets(params?: { commune?: string; annee?: number; type?: string }): Promise<PaginatedResponse<DocumentBudgetaire>> {
    const query = new URLSearchParams();
    if (params?.commune) query.set('commune', params.commune);
    if (params?.annee) query.set('annee', params.annee.toString());
    if (params?.type) query.set('type_document', params.type);
    return api.get<PaginatedResponse<DocumentBudgetaire>>(`/documents-budgetaires/?${query.toString()}`);
  },

  async getDocumentsOfficiels(params?: { commune?: string; type?: string; search?: string }): Promise<PaginatedResponse<DocumentOfficiel>> {
    const query = new URLSearchParams();
    if (params?.commune) query.set('commune', params.commune);
    if (params?.type) query.set('type_document', params.type);
    if (params?.search) query.set('search', params.search);
    return api.get<PaginatedResponse<DocumentOfficiel>>(`/documents-officiels/?${query.toString()}`);
  },
};

// ===== FAQ =====

export const faqService = {
  async getAll(params?: { commune?: string; categorie?: string }): Promise<PaginatedResponse<FAQ>> {
    const query = new URLSearchParams();
    if (params?.commune) query.set('commune', params.commune);
    if (params?.categorie) query.set('categorie', params.categorie);
    return api.get<PaginatedResponse<FAQ>>(`/faqs/?${query.toString()}`);
  },
};

// ===== SERVICES MUNICIPAUX =====

export const serviceMunicipalService = {
  async getAll(params?: { commune?: string }): Promise<PaginatedResponse<ServiceMunicipal>> {
    const query = new URLSearchParams();
    if (params?.commune) query.set('commune', params.commune);
    return api.get<PaginatedResponse<ServiceMunicipal>>(`/services-municipaux/?${query.toString()}`);
  },
};

// ===== SIGNALEMENTS =====

export const signalementService = {
  async create(data: Partial<Signalement>): Promise<Signalement> {
    return api.post<Signalement>('/signalements/', data);
  },
  
  async suivi(numero: string): Promise<{
    numero_suivi: string;
    titre: string;
    statut: string;
    statut_display: string;
    date_signalement: string;
    date_resolution?: string;
    commune_nom: string;
  }> {
    return api.get(`/suivi/signalement/${numero}/`);
  },
};

// ===== CONTACT =====

export const contactService = {
  async envoyer(data: Contact): Promise<{ id: number; message: string }> {
    return api.post('/contacts/', data);
  },
};

// ===== NEWSLETTER =====

export const newsletterService = {
  async subscribe(data: Newsletter): Promise<{ id: number; message: string }> {
    return api.post('/newsletter/abonnes/', data);
  },
  
  async unsubscribe(token: string): Promise<{ message: string }> {
    return api.get(`/newsletter/unsubscribe/${token}/`);
  },
};

// ===== RENDEZ-VOUS =====

export const rendezVousService = {
  async create(data: Partial<RendezVous>): Promise<RendezVous> {
    return api.post<RendezVous>('/rendez-vous/', data, true);
  },
  
  async getMine(): Promise<PaginatedResponse<RendezVous>> {
    return api.get<PaginatedResponse<RendezVous>>('/rendez-vous/', true);
  },
};

// ===== STATISTIQUES =====

export const statsService = {
  async getPubliques(): Promise<StatsPubliques> {
    return api.get<StatsPubliques>('/stats/');
  },
  
  async getCommune(slug: string): Promise<CommuneStats> {
    return api.get<CommuneStats>(`/stats/commune/${slug}/`);
  },
};

// ===== RECHERCHE =====

export const rechercheService = {
  async rechercher(query: string, commune?: string, limit?: number): Promise<{
    query: string;
    count: number;
    results: Array<{
      type: string;
      id: number;
      titre: string;
      extrait: string;
      url: string;
      commune: string;
      date?: string;
    }>;
  }> {
    const params = new URLSearchParams({ q: query });
    if (commune) params.set('commune', commune);
    if (limit) params.set('limit', limit.toString());
    return api.get(`/recherche/?${params.toString()}`);
  },
};

// ===== CARTE INTERACTIVE =====

export const carteService = {
  async getCommunes(params?: { departement?: number; region?: number; search?: string }): Promise<{
    count: number;
    communes: Array<{
      id: number;
      nom: string;
      slug: string;
      latitude?: number;
      longitude?: number;
      population?: number;
      logo?: string;
      departement_nom: string;
      region_nom: string;
      domaine: string;
      nb_actualites: number;
      nb_evenements: number;
      nb_projets: number;
    }>;
  }> {
    const query = new URLSearchParams();
    if (params?.departement) query.set('departement', params.departement.toString());
    if (params?.region) query.set('departement__region', params.region.toString());
    if (params?.search) query.set('search', params.search);
    return api.get(`/carte/communes/?${query.toString()}`);
  },
};

// Export par défaut
export default {
  auth: authService,
  communes: communeService,
  actualites: actualiteService,
  evenements: evenementService,
  pages: pageService,
  projets: projetService,
  transparence: transparenceService,
  faqs: faqService,
  servicesMunicipaux: serviceMunicipalService,
  signalements: signalementService,
  contact: contactService,
  newsletter: newsletterService,
  rendezVous: rendezVousService,
  stats: statsService,
  recherche: rechercheService,
  carte: carteService,
};
