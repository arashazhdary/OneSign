// Tenant Context - Compatibility layer for tenant context
// This provides the getTenantId function for components that need the current tenant ID

import { useTenantStore } from '@/stores/tenantStore';
import { DEFAULT_TENANT_ID } from '@/lib/constants/testIds';
import { getTenantId as extractTenantIdAsync } from '@/lib/utils/tenant-extractor';

/**
 * Get the current tenant ID using multiple extraction methods (async version)
 * Priority order:
 * 1. X-Tenant-Id header
 * 2. X-Tenant-Slug header (with lookup)
 * 3. Subdomain (with lookup)
 * 4. URL path
 * 5. JWT claims
 * 6. Store/context
 * 7. Default test tenant ID
 */
export const getTenantIdAsync = async (): Promise<string> => {
  // Try to extract from various sources
  const extractedId = await extractTenantIdAsync({ skipStore: false });

  if (extractedId) {
    return extractedId;
  }

  // Fallback to store
  const state = useTenantStore.getState();
  return state.currentTenant?.id || DEFAULT_TENANT_ID;
};

/**
 * Get the current tenant ID synchronously (without slug/subdomain lookup)
 * This is a fallback for components that need immediate access to tenant ID
 * Note: This will not perform slug/subdomain lookups and will use store/default
 */
export const getTenantId = (): string => {
  // Use store value directly without async lookup
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

export default { getTenantId, getTenantIdAsync, useCurrentTenant, useTenantId };
