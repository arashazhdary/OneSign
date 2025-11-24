'use client';

import { createContext, useState, useEffect, useCallback, useContext, ReactNode } from 'react';
import type { User } from '@/lib/api/types/auth';
import { authService } from '@/lib/api/services/auth.service';

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  updateUser: (user: Partial<User>) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Hook to use auth context
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Auth Context Provider
 *
 * @example
 * <AuthProvider>
 *   <App />
 * </AuthProvider>
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          // Validate token and fetch user
          const validation = await authService.validateToken(token);
          if (validation.valid && validation.user) {
            setUser(validation.user);
          } else {
            localStorage.removeItem('token');
          }
        }
      } catch (error) {
        console.error('Failed to load user:', error);
        localStorage.removeItem('token');
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Use authService for login
      const response = await authService.signIn({ email, password });

      // Save token to localStorage
      if (response.accessToken) {
        localStorage.setItem('token', response.accessToken);
      }

      // Fetch current user after login
      const userData = await authService.getCurrentUser();
      setUser(userData);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      // Call logout endpoint
      await authService.signOut();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      setUser(null);
    }
  }, []);

  const refreshToken = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }

      // Use authService for token refresh
      const response = await authService.refreshToken({ refreshToken: token });

      if (response.accessToken) {
        localStorage.setItem('token', response.accessToken);
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      await logout();
    }
  }, [logout]);

  const updateUser = useCallback((updates: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : null));
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    refreshToken,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
