// Tenant Context - Compatibility layer for tenant context
// This provides the getTenantId function for components that need the current tenant ID

import { useTenantStore } from '@/stores/tenantStore';
import { DEFAULT_TENANT_ID } from '@/lib/constants/testIds';

/**
 * Get the current tenant ID from the store
 * Returns a default test tenant ID from DatabaseSeeder if no tenant is selected
 */
export const getTenantId = (): string => {
  const state = useTenantStore.getState();
  return state.currentTenant?.id || DEFAULT_TENANT_ID;
};

/**
 * Hook to get the current tenant
 */
export const useCurrentTenant = () => {
  const { currentTenant, setCurrentTenant } = useTenantStore();
  return { currentTenant, setCurrentTenant };
};

/**
 * Hook to get the tenant ID
 */
export const useTenantId = (): string => {
  const { currentTenant } = useTenantStore();
  return currentTenant?.id || DEFAULT_TENANT_ID;
};

export default { getTenantId, useCurrentTenant, useTenantId };
