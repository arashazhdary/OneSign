// Tenant Context - Compatibility layer for tenant context
// This provides the getTenantId function for components that need the current tenant ID

import { useTenantStore } from '@/stores/tenantStore';

/**
 * Get the current tenant ID from the store
 * Returns a default UUID if no tenant is selected
 */
export const getTenantId = (): string => {
  const state = useTenantStore.getState();
  return state.currentTenant?.id || '00000000-0000-0000-0000-000000000000';
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
  return currentTenant?.id || '00000000-0000-0000-0000-000000000000';
};

export default { getTenantId, useCurrentTenant, useTenantId };
