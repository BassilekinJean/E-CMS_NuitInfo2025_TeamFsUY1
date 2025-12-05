/**
 * useCMSData Hook - E-CMS
 * Hook pour charger et gérer les données du CMS (publications, événements, etc.)
 */

import { useState, useEffect, useCallback } from 'react';
import { useTenant } from '../contexts/TenantContext';
import { useAuth } from '../contexts/AuthContext';
import { 
  actualiteService, 
  evenementService, 
  statsService,
  pageService,
} from '../api/services';
import type { Actualite, Evenement, PageCMS } from '../api/client';

// ===== Types =====

export interface CMSPublication {
  id: string;
  type: 'post' | 'communique';
  title: string;
  content: string;
  category: string;
  status: 'draft' | 'published';
  author: string;
  createdAt: string;
  publishedAt?: string;
  image?: string;
  views: number;
  likes: number;
  comments: number;
  slug: string;
}

export interface CMSEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'confirmed' | 'cancelled';
  attendees?: number;
  slug: string;
}

export interface CMSStats {
  // Données réelles de l'API
  actualites: number;
  evenements: number;
  projets: number;
  projetsEnCours: number;
  budgetTotalProjets: number;
  services: number;
  documentsOfficiels: number;
}

// ===== Helper Functions =====

function mapActualiteToCMSPublication(actualite: Actualite): CMSPublication {
  return {
    id: actualite.id.toString(),
    type: actualite.categorie === 'communique' ? 'communique' : 'post',
    title: actualite.titre,
    content: actualite.contenu || actualite.resume || '',
    category: actualite.categorie || 'actualites',
    status: actualite.est_publie ? 'published' : 'draft',
    author: actualite.auteur_nom || 'Admin',
    createdAt: actualite.date_publication || new Date().toISOString(),
    publishedAt: actualite.date_publication,
    image: actualite.image_principale || undefined,
    views: actualite.nombre_vues || 0,
    likes: 0, // Not available in API
    comments: 0, // Not available in API
    slug: actualite.slug,
  };
}

function mapEvenementToCMSEvent(evenement: Evenement): CMSEvent {
  return {
    id: evenement.id.toString(),
    title: evenement.nom,
    description: evenement.description || '',
    date: evenement.date,
    startTime: evenement.heure_debut,
    endTime: evenement.heure_fin || evenement.heure_debut,
    location: evenement.lieu || '',
    category: evenement.categorie || 'autre',
    priority: 'medium',
    status: evenement.statut === 'confirme' ? 'confirmed' : 
            evenement.statut === 'annule' ? 'cancelled' : 'pending',
    attendees: evenement.nombre_places ? (evenement.nombre_places - (evenement.places_restantes || 0)) : 0,
    slug: evenement.slug,
  };
}

// ===== Hooks =====

/**
 * Hook pour charger les publications (actualités)
 */
export function usePublications() {
  const { tenant, tenantSlug } = useTenant();
  const { isAuthenticated } = useAuth();
  const [publications, setPublications] = useState<CMSPublication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPublications = useCallback(async () => {
    if (!tenantSlug) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await actualiteService.getAll({ commune: tenantSlug });
      const mapped = response.results.map(mapActualiteToCMSPublication);
      setPublications(mapped);
    } catch (err) {
      console.error('Erreur chargement publications:', err);
      setError('Impossible de charger les publications');
      setPublications([]);
    } finally {
      setLoading(false);
    }
  }, [tenantSlug]);

  useEffect(() => {
    fetchPublications();
  }, [fetchPublications]);

  const createPublication = async (data: Partial<CMSPublication>): Promise<CMSPublication | null> => {
    if (!tenant || !isAuthenticated) return null;

    // Mapper les catégories frontend vers backend
    // Frontend: actualites, evenements, services, annonces, culture
    // Backend: communique, avis_public, nouvelle, annonce, vie_municipale, culture, education, sport
    const categoryMap: Record<string, string> = {
      'post': 'nouvelle',
      'communique': 'communique',
      'actualites': 'nouvelle',
      'evenements': 'vie_municipale',  // Les événements comme actualité de vie municipale
      'services': 'avis_public',       // Services comme avis public
      'annonces': 'annonce',           // annonces (avec s) -> annonce
      'annonce': 'annonce',
      'culture': 'culture',
      'sport': 'sport',
      'education': 'education',
    };
    const backendCategory = categoryMap[data.category || 'post'] || 'nouvelle';

    try {
      const actualite = await actualiteService.create({
        titre: data.title || 'Nouvelle publication',
        contenu: data.content || 'Contenu de la publication',
        resume: data.content?.substring(0, 200) || '',
        categorie: backendCategory,
        est_publie: data.status === 'published',
        image_principale: data.image,
        commune: tenant.id,
      });
      
      const newPub = mapActualiteToCMSPublication(actualite);
      setPublications(prev => [newPub, ...prev]);
      return newPub;
    } catch (err) {
      console.error('Erreur création publication:', err);
      throw err;
    }
  };

  const updatePublication = async (slug: string, data: Partial<CMSPublication>): Promise<CMSPublication | null> => {
    if (!isAuthenticated) return null;

    try {
      const actualite = await actualiteService.update(slug, {
        titre: data.title,
        contenu: data.content,
        resume: data.content?.substring(0, 200),
        categorie: data.category,
        est_publie: data.status === 'published',
        image_principale: data.image,
      });
      
      const updated = mapActualiteToCMSPublication(actualite);
      setPublications(prev => prev.map(p => p.slug === slug ? updated : p));
      return updated;
    } catch (err) {
      console.error('Erreur mise à jour publication:', err);
      throw err;
    }
  };

  const deletePublication = async (slug: string): Promise<boolean> => {
    if (!isAuthenticated) return false;

    try {
      await actualiteService.delete(slug);
      setPublications(prev => prev.filter(p => p.slug !== slug));
      return true;
    } catch (err) {
      console.error('Erreur suppression publication:', err);
      throw err;
    }
  };

  return {
    publications,
    loading,
    error,
    refresh: fetchPublications,
    createPublication,
    updatePublication,
    deletePublication,
  };
}

/**
 * Hook pour charger les événements
 */
export function useEvents() {
  const { tenant, tenantSlug } = useTenant();
  const { isAuthenticated } = useAuth();
  const [events, setEvents] = useState<CMSEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    if (!tenantSlug) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await evenementService.getAll({ commune: tenantSlug });
      const mapped = response.results.map(mapEvenementToCMSEvent);
      setEvents(mapped);
    } catch (err) {
      console.error('Erreur chargement événements:', err);
      setError('Impossible de charger les événements');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [tenantSlug]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const createEvent = async (data: Partial<CMSEvent>): Promise<CMSEvent | null> => {
    if (!tenant || !isAuthenticated) return null;

    try {
      const evenement = await evenementService.create({
        nom: data.title || 'Nouvel événement',
        description: data.description || 'Description de l\'événement',
        date: data.date,
        heure_debut: data.startTime,
        heure_fin: data.endTime || data.startTime,
        lieu: data.location || 'À définir',
        categorie: data.category || 'autre',
        commune: tenant.id,
        est_public: true,
      });
      
      const newEvent = mapEvenementToCMSEvent(evenement);
      setEvents(prev => [...prev, newEvent].sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      ));
      return newEvent;
    } catch (err) {
      console.error('Erreur création événement:', err);
      throw err;
    }
  };

  const updateEvent = async (slug: string, data: Partial<CMSEvent>): Promise<CMSEvent | null> => {
    if (!isAuthenticated) return null;

    try {
      const evenement = await evenementService.update(slug, {
        nom: data.title,
        description: data.description,
        date: data.date,
        heure_debut: data.startTime,
        heure_fin: data.endTime,
        lieu: data.location,
        categorie: data.category,
      });
      
      const updated = mapEvenementToCMSEvent(evenement);
      setEvents(prev => prev.map(e => e.slug === slug ? updated : e));
      return updated;
    } catch (err) {
      console.error('Erreur mise à jour événement:', err);
      throw err;
    }
  };

  const deleteEvent = async (slug: string): Promise<boolean> => {
    if (!isAuthenticated) return false;

    try {
      await evenementService.delete(slug);
      setEvents(prev => prev.filter(e => e.slug !== slug));
      return true;
    } catch (err) {
      console.error('Erreur suppression événement:', err);
      throw err;
    }
  };

  return {
    events,
    loading,
    error,
    refresh: fetchEvents,
    createEvent,
    updateEvent,
    deleteEvent,
  };
}

/**
 * Hook pour charger les statistiques du CMS
 */
export function useCMSStats() {
  const { tenantSlug } = useTenant();
  const [stats, setStats] = useState<CMSStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    if (!tenantSlug) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const communeStats = await statsService.getCommune(tenantSlug);
      
      // Utiliser les vraies données de l'API
      setStats({
        actualites: communeStats.actualites || 0,
        evenements: communeStats.evenements || 0,
        projets: communeStats.projets || 0,
        projetsEnCours: communeStats.projets_en_cours || 0,
        budgetTotalProjets: parseFloat(communeStats.budget_total_projets?.toString() || '0'),
        services: communeStats.services || 0,
        documentsOfficiels: communeStats.documents_officiels || 0,
      });
    } catch (err) {
      console.error('Erreur chargement statistiques:', err);
      setError('Impossible de charger les statistiques');
      // Set default stats on error
      setStats({
        actualites: 0,
        evenements: 0,
        projets: 0,
        projetsEnCours: 0,
        budgetTotalProjets: 0,
        services: 0,
        documentsOfficiels: 0,
      });
    } finally {
      setLoading(false);
    }
  }, [tenantSlug]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refresh: fetchStats,
  };
}

/**
 * Hook pour charger les pages CMS
 */
export function useCMSPages() {
  const { tenant, tenantSlug } = useTenant();
  const { isAuthenticated } = useAuth();
  const [pages, setPages] = useState<PageCMS[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPages = useCallback(async () => {
    if (!tenantSlug) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await pageService.getAll({ commune: tenantSlug });
      setPages(response.results);
    } catch (err) {
      console.error('Erreur chargement pages:', err);
      setError('Impossible de charger les pages');
      setPages([]);
    } finally {
      setLoading(false);
    }
  }, [tenantSlug]);

  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  const createPage = async (data: Partial<PageCMS>): Promise<PageCMS | null> => {
    if (!tenant || !isAuthenticated) return null;

    try {
      const page = await pageService.create({
        ...data,
        commune: tenant.id,
      });
      setPages(prev => [...prev, page]);
      return page;
    } catch (err) {
      console.error('Erreur création page:', err);
      throw err;
    }
  };

  const updatePage = async (slug: string, data: Partial<PageCMS>): Promise<PageCMS | null> => {
    if (!isAuthenticated) return null;

    try {
      const page = await pageService.update(slug, data);
      setPages(prev => prev.map(p => p.slug === slug ? page : p));
      return page;
    } catch (err) {
      console.error('Erreur mise à jour page:', err);
      throw err;
    }
  };

  const deletePage = async (slug: string): Promise<boolean> => {
    if (!isAuthenticated) return false;

    try {
      await pageService.delete(slug);
      setPages(prev => prev.filter(p => p.slug !== slug));
      return true;
    } catch (err) {
      console.error('Erreur suppression page:', err);
      throw err;
    }
  };

  return {
    pages,
    loading,
    error,
    refresh: fetchPages,
    createPage,
    updatePage,
    deletePage,
  };
}

// Export default
export default {
  usePublications,
  useEvents,
  useCMSStats,
  useCMSPages,
};
