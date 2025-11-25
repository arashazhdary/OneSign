import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Tenant } from '@/types';

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
          // TODO: Implement actual Google OAuth callback
          const response = await fetch('/api/auth/google/callback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code, redirectUri }),
          });

          if (!response.ok) {
            throw new Error('Google login failed');
          }

          const data = await response.json();
          set({
            user: data.user,
            tenant: data.tenant,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
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
