/**
 * AuthContext - E-CMS
 * Contexte React pour l'authentification
 */

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { api, type User } from '../api/client';
import { authService } from '../api/services';

interface AuthContextValue {
  /** Utilisateur connecté */
  user: User | null;
  /** True si authentifié */
  isAuthenticated: boolean;
  /** True pendant le chargement initial */
  isLoading: boolean;
  /** Connexion */
  login: (email: string, password: string) => Promise<void>;
  /** Déconnexion */
  logout: () => Promise<void>;
  /** Recharger le profil */
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const isAuthenticated = !!user;
  
  const loadProfile = useCallback(async () => {
    if (!api.isAuthenticated()) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    
    try {
      const profile = await authService.getProfile();
      setUser(profile);
    } catch {
      // Token invalide ou expiré
      api.clearTokens();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  useEffect(() => {
    loadProfile();
  }, [loadProfile]);
  
  const login = async (email: string, password: string) => {
    const response = await authService.login(email, password);
    setUser(response.user);
  };
  
  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
    }
  };
  
  const value: AuthContextValue = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    refreshProfile: loadProfile,
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook pour accéder au contexte auth
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

/**
 * Hook qui exige une authentification
 */
export function useRequiredAuth(): User {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    throw new Promise(() => {}); // Suspense
  }
  
  if (!user) {
    throw new Error('Authentification requise.');
  }
  
  return user;
}

export default AuthContext;
