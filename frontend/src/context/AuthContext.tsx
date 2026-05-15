/**
 * Authentication context with React Context + localStorage persistence.
 * Provides login, register, logout, and current user state.
 */

import { createContext, useCallback, useEffect, useState, type ReactNode } from 'react';
import { getMe } from '../api/auth';
import type { MeResponse } from '../types/auth';

interface AuthState {
  user: MeResponse | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {
  setToken: (token: string) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MeResponse | null>(null);
  const [token, setTokenState] = useState<string | null>(
    () => localStorage.getItem('access_token'),
  );
  const [isLoading, setIsLoading] = useState(true);

  const setToken = useCallback((newToken: string) => {
    localStorage.setItem('access_token', newToken);
    setTokenState(newToken);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('access_token');
    setTokenState(null);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    try {
      const me = await getMe();
      setUser(me);
    } catch {
      // Token is invalid — clear everything
      localStorage.removeItem('access_token');
      setTokenState(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        setToken,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
