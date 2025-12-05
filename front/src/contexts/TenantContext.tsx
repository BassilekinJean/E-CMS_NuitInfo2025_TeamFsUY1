/**
 * TenantContext - E-CMS
 * Contexte React pour le multi-tenancy (commune courante)
 */

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { getTenantSlug, type Commune } from '../api/client';
import { communeService } from '../api/services';

interface TenantContextValue {
  /** La commune courante (null si portail national) */
  tenant: Commune | null;
  /** Slug du tenant extrait du sous-domaine */
  tenantSlug: string | null;
  /** True si on est sur un sous-domaine tenant */
  isTenantSite: boolean;
  /** True pendant le chargement initial */
  isLoading: boolean;
  /** Erreur de chargement */
  error: string | null;
  /** Recharger les données du tenant */
  refresh: () => Promise<void>;
}

const TenantContext = createContext<TenantContextValue | undefined>(undefined);

interface TenantProviderProps {
  children: ReactNode;
}

export function TenantProvider({ children }: TenantProviderProps) {
  const [tenant, setTenant] = useState<Commune | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const tenantSlug = getTenantSlug();
  const isTenantSite = !!tenantSlug;
  
  const loadTenant = useCallback(async () => {
    if (!tenantSlug) {
      setTenant(null);
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const commune = await communeService.getBySlug(tenantSlug);
      setTenant(commune);
    } catch (err) {
      console.error('Erreur chargement tenant:', err);
      setError(`Commune "${tenantSlug}" introuvable ou inactive.`);
      setTenant(null);
    } finally {
      setIsLoading(false);
    }
  }, [tenantSlug]);
  
  useEffect(() => {
    loadTenant();
  }, [loadTenant]);
  
  const value: TenantContextValue = {
    tenant,
    tenantSlug,
    isTenantSite,
    isLoading,
    error,
    refresh: loadTenant,
  };
  
  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
}

/**
 * Hook pour accéder au contexte tenant
 */
export function useTenant(): TenantContextValue {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
}

/**
 * Hook qui exige un tenant (lève une erreur sinon)
 */
export function useRequiredTenant(): Commune {
  const { tenant, isLoading, error } = useTenant();
  
  if (isLoading) {
    throw new Promise(() => {}); // Suspense
  }
  
  if (error || !tenant) {
    throw new Error(error || 'Cette page nécessite un site communal.');
  }
  
  return tenant;
}

export default TenantContext;
