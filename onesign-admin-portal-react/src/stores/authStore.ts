import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Tenant } from '@/types';

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
