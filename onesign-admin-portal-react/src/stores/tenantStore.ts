import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEFAULT_TENANT_ID } from '@/lib/constants/testIds';

export interface Tenant {
  id: string;
  name: string;
  domain?: string;
  status: 'active' | 'inactive' | 'suspended';
  plan?: string;
  createdAt?: string;
  settings?: Record<string, any>;
}

interface TenantState {
  currentTenant: Tenant | null;
  tenants: Tenant[];
  isLoading: boolean;
  error: string | null;

  // Actions
  setCurrentTenant: (tenant: Tenant | null) => void;
  setTenants: (tenants: Tenant[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearTenant: () => void;
}

// Default tenant for development - uses TestTenantId from DatabaseSeeder
const defaultTenant: Tenant = {
  id: DEFAULT_TENANT_ID,
  name: 'Test Organization',
  status: 'active',
  plan: 'enterprise',
};

export const useTenantStore = create<TenantState>()(
  persist(
    (set) => ({
      currentTenant: defaultTenant,
      tenants: [defaultTenant],
      isLoading: false,
      error: null,

      setCurrentTenant: (tenant) => set({ currentTenant: tenant }),

      setTenants: (tenants) => set({ tenants }),

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error }),

      clearTenant: () => set({ currentTenant: null }),
    }),
    {
      name: 'tenant-storage',
      partialize: (state) => ({
        currentTenant: state.currentTenant,
      }),
    }
  )
);

// Helper function to get tenant ID (for compatibility with existing code)
export const getTenantId = (): string => {
  const state = useTenantStore.getState();
  return state.currentTenant?.id || DEFAULT_TENANT_ID;
};

export default useTenantStore;
