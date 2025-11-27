import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Tenant } from '@/types';
import apiClient from '@/services/apiClient';
import { setAuthToken } from '@/services/apiClient';

interface GoogleLoginParams {
  code: string;
  redirectUri: string;
}

interface AuthState {
  user: User | null;
  tenant: Tenant | null;
  tenants: Tenant[];
  isAuthenticated: boolean;
  isLoading: boolean;

  setUser: (user: User | null) => void;
  setTenant: (tenant: Tenant | null) => void;
  setTenants: (tenants: Tenant[]) => void;
  setIsLoading: (isLoading: boolean) => void;
  login: (user: User, tenant?: Tenant) => void;
  logout: () => void;
  switchTenant: (tenant: Tenant) => void;
  googleLogin: (params: GoogleLoginParams) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      tenant: null,
      tenants: [],
      isAuthenticated: false,
      isLoading: false,

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setTenant: (tenant) => set({ tenant }),
      setTenants: (tenants) => set({ tenants }),
      setIsLoading: (isLoading) => set({ isLoading }),

      login: (user, tenant) =>
        set({ user, tenant, isAuthenticated: true }),

      logout: () =>
        set({ user: null, tenant: null, isAuthenticated: false }),

      switchTenant: (tenant) => set({ tenant }),

      googleLogin: async ({ code, redirectUri }) => {
        set({ isLoading: true });
        try {
          // Exchange authorization code for tokens and user data
          const data = await apiClient.post<{
            accessToken: string;
            refreshToken?: string;
            user: User;
            tenant?: Tenant;
            tenants?: Tenant[];
          }>('/api/auth/google/callback', {
            code,
            redirectUri,
          });

          // Store the access token
          if (data.accessToken) {
            setAuthToken(data.accessToken);
          }

          // Store refresh token if provided
          if (data.refreshToken) {
            localStorage.setItem('refreshToken', data.refreshToken);
          }

          // Get the first tenant if tenants array is provided but no single tenant
          const selectedTenant = data.tenant || (data.tenants && data.tenants.length > 0 ? data.tenants[0] : null);

          // Update auth state
          set({
            user: data.user,
            tenant: selectedTenant,
            tenants: data.tenants || (selectedTenant ? [selectedTenant] : []),
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: any) {
          set({ isLoading: false });
          const errorMessage = error?.response?.data?.message || error?.message || 'Google login failed';
          throw new Error(errorMessage);
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        tenant: state.tenant,
        tenants: state.tenants,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
