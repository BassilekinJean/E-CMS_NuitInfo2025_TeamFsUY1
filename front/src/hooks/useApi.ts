/**
 * Hooks API - E-CMS
 * Hooks React pour les appels API avec gestion d'état
 */

import { useState, useEffect, useCallback } from 'react';
import type { Actualite, Evenement, PageCMS, Projet, Deliberation, DocumentBudgetaire, DocumentOfficiel, FAQ, ServiceMunicipal, CommuneStats } from '../api/client';
import { actualiteService, evenementService, pageService, projetService, transparenceService, faqService, serviceMunicipalService, statsService, rechercheService } from '../api/services';
import { useTenant } from '../contexts/TenantContext';

interface UseApiState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface UseListState<T> extends UseApiState<T[]> {
  pagination: {
    count: number;
    hasNext: boolean;
    hasPrevious: boolean;
  } | null;
  loadMore: () => Promise<void>;
}

/**
 * Hook générique pour les appels API
 */
function useApi<T>(
  fetcher: () => Promise<T>,
  deps: unknown[] = []
): UseApiState<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  return { data, isLoading, error, refetch: fetchData };
}

/**
 * Hook pour les actualités du tenant courant
 */
export function useActualites(params?: { categorie?: string; search?: string }): UseListState<Actualite> {
  const { tenantSlug } = useTenant();
  const [data, setData] = useState<Actualite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<{ count: number; hasNext: boolean; hasPrevious: boolean } | null>(null);
  const [page, setPage] = useState(1);
  
  const fetchData = useCallback(async (pageNum: number = 1, append: boolean = false) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await actualiteService.getAll({
        commune: tenantSlug || undefined,
        categorie: params?.categorie,
        search: params?.search,
        page: pageNum,
      });
      setData(prev => append ? [...prev, ...result.results] : result.results);
      setPagination({
        count: result.count,
        hasNext: !!result.next,
        hasPrevious: !!result.previous,
      });
      setPage(pageNum);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setIsLoading(false);
    }
  }, [tenantSlug, params?.categorie, params?.search]);
  
  useEffect(() => {
    fetchData(1);
  }, [fetchData]);
  
  const loadMore = async () => {
    if (pagination?.hasNext) {
      await fetchData(page + 1, true);
    }
  };
  
  return { data, isLoading, error, pagination, refetch: () => fetchData(1), loadMore };
}

/**
 * Hook pour une actualité par slug
 */
export function useActualite(slug: string): UseApiState<Actualite> {
  return useApi(() => actualiteService.getBySlug(slug), [slug]);
}

/**
 * Hook pour les événements du tenant courant
 */
export function useEvenements(params?: { categorie?: string; a_venir?: boolean }): UseListState<Evenement> {
  const { tenantSlug } = useTenant();
  const [data, setData] = useState<Evenement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<{ count: number; hasNext: boolean; hasPrevious: boolean } | null>(null);
  const [page, setPage] = useState(1);
  
  const fetchData = useCallback(async (pageNum: number = 1, append: boolean = false) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await evenementService.getAll({
        commune: tenantSlug || undefined,
        categorie: params?.categorie,
        a_venir: params?.a_venir ?? true,
        page: pageNum,
      });
      setData(prev => append ? [...prev, ...result.results] : result.results);
      setPagination({
        count: result.count,
        hasNext: !!result.next,
        hasPrevious: !!result.previous,
      });
      setPage(pageNum);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setIsLoading(false);
    }
  }, [tenantSlug, params?.categorie, params?.a_venir]);
  
  useEffect(() => {
    fetchData(1);
  }, [fetchData]);
  
  const loadMore = async () => {
    if (pagination?.hasNext) {
      await fetchData(page + 1, true);
    }
  };
  
  return { data, isLoading, error, pagination, refetch: () => fetchData(1), loadMore };
}

/**
 * Hook pour un événement par slug
 */
export function useEvenement(slug: string): UseApiState<Evenement> {
  return useApi(() => evenementService.getBySlug(slug), [slug]);
}

/**
 * Hook pour les pages CMS du tenant courant
 */
export function usePages(params?: { afficher_dans_menu?: boolean }): UseApiState<PageCMS[]> {
  const { tenantSlug } = useTenant();
  
  return useApi(async () => {
    const result = await pageService.getAll({
      commune: tenantSlug || undefined,
      afficher_dans_menu: params?.afficher_dans_menu,
    });
    return result.results;
  }, [tenantSlug, params?.afficher_dans_menu]);
}

/**
 * Hook pour une page CMS par slug
 */
export function usePage(slug: string): UseApiState<PageCMS> {
  return useApi(() => pageService.getBySlug(slug), [slug]);
}

/**
 * Hook pour les projets du tenant courant
 */
export function useProjets(params?: { categorie?: string; statut?: string }): UseListState<Projet> {
  const { tenantSlug } = useTenant();
  const [data, setData] = useState<Projet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<{ count: number; hasNext: boolean; hasPrevious: boolean } | null>(null);
  const [page, setPage] = useState(1);
  
  const fetchData = useCallback(async (pageNum: number = 1, append: boolean = false) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await projetService.getAll({
        commune: tenantSlug || undefined,
        categorie: params?.categorie,
        statut: params?.statut,
        page: pageNum,
      });
      setData(prev => append ? [...prev, ...result.results] : result.results);
      setPagination({
        count: result.count,
        hasNext: !!result.next,
        hasPrevious: !!result.previous,
      });
      setPage(pageNum);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setIsLoading(false);
    }
  }, [tenantSlug, params?.categorie, params?.statut]);
  
  useEffect(() => {
    fetchData(1);
  }, [fetchData]);
  
  const loadMore = async () => {
    if (pagination?.hasNext) {
      await fetchData(page + 1, true);
    }
  };
  
  return { data, isLoading, error, pagination, refetch: () => fetchData(1), loadMore };
}

/**
 * Hook pour un projet par slug
 */
export function useProjet(slug: string): UseApiState<Projet> {
  return useApi(() => projetService.getBySlug(slug), [slug]);
}

/**
 * Hook pour les délibérations
 */
export function useDeliberations(params?: { annee?: number; search?: string }): UseListState<Deliberation> {
  const { tenantSlug } = useTenant();
  const [data, setData] = useState<Deliberation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<{ count: number; hasNext: boolean; hasPrevious: boolean } | null>(null);
  const [page, setPage] = useState(1);
  
  const fetchData = useCallback(async (pageNum: number = 1, append: boolean = false) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await transparenceService.getDeliberations({
        commune: tenantSlug || undefined,
        annee: params?.annee,
        search: params?.search,
        page: pageNum,
      });
      setData(prev => append ? [...prev, ...result.results] : result.results);
      setPagination({
        count: result.count,
        hasNext: !!result.next,
        hasPrevious: !!result.previous,
      });
      setPage(pageNum);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setIsLoading(false);
    }
  }, [tenantSlug, params?.annee, params?.search]);
  
  useEffect(() => {
    fetchData(1);
  }, [fetchData]);
  
  const loadMore = async () => {
    if (pagination?.hasNext) {
      await fetchData(page + 1, true);
    }
  };
  
  return { data, isLoading, error, pagination, refetch: () => fetchData(1), loadMore };
}

/**
 * Hook pour les budgets
 */
export function useBudgets(params?: { annee?: number; type?: string }): UseApiState<DocumentBudgetaire[]> {
  const { tenantSlug } = useTenant();
  
  return useApi(async () => {
    const result = await transparenceService.getBudgets({
      commune: tenantSlug || undefined,
      annee: params?.annee,
      type: params?.type,
    });
    return result.results;
  }, [tenantSlug, params?.annee, params?.type]);
}

/**
 * Hook pour les documents officiels
 */
export function useDocumentsOfficiels(params?: { type?: string; search?: string }): UseApiState<DocumentOfficiel[]> {
  const { tenantSlug } = useTenant();
  
  return useApi(async () => {
    const result = await transparenceService.getDocumentsOfficiels({
      commune: tenantSlug || undefined,
      type: params?.type,
      search: params?.search,
    });
    return result.results;
  }, [tenantSlug, params?.type, params?.search]);
}

/**
 * Hook pour les FAQ du tenant courant
 */
export function useFAQs(params?: { categorie?: string }): UseApiState<FAQ[]> {
  const { tenantSlug } = useTenant();
  
  return useApi(async () => {
    const result = await faqService.getAll({
      commune: tenantSlug || undefined,
      categorie: params?.categorie,
    });
    return result.results;
  }, [tenantSlug, params?.categorie]);
}

/**
 * Hook pour les services municipaux du tenant courant
 */
export function useServicesMunicipaux(): UseApiState<ServiceMunicipal[]> {
  const { tenantSlug } = useTenant();
  
  return useApi(async () => {
    const result = await serviceMunicipalService.getAll({
      commune: tenantSlug || undefined,
    });
    return result.results;
  }, [tenantSlug]);
}

/**
 * Hook pour les statistiques du tenant courant
 */
export function useTenantStats(): UseApiState<CommuneStats> {
  const { tenantSlug } = useTenant();
  
  return useApi(async () => {
    if (!tenantSlug) throw new Error('Pas de tenant');
    return statsService.getCommune(tenantSlug);
  }, [tenantSlug]);
}

/**
 * Hook pour la recherche
 */
export function useRecherche(query: string, limit?: number) {
  const { tenantSlug } = useTenant();
  const [data, setData] = useState<Awaited<ReturnType<typeof rechercheService.rechercher>> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const search = useCallback(async () => {
    if (query.length < 2) {
      setData(null);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    try {
      const result = await rechercheService.rechercher(query, tenantSlug || undefined, limit);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setIsLoading(false);
    }
  }, [query, tenantSlug, limit]);
  
  useEffect(() => {
    const timer = setTimeout(search, 300); // Debounce
    return () => clearTimeout(timer);
  }, [search]);
  
  return { data, isLoading, error, search };
}
