// Tenant Context - Compatibility layer for tenant context
// This provides the getTenantId function for components that need the current tenant ID

import { useTenantStore } from '@/stores/tenantStore';
import { DEFAULT_TENANT_ID } from '@/lib/constants/testIds';
import { getTenantId as extractTenantId } from '@/lib/utils/tenant-extractor';

/**
 * Get the current tenant ID using multiple extraction methods
 * Priority order:
 * 1. X-Tenant-Id header
 * 2. X-Tenant-Slug header
 * 3. Subdomain
 * 4. URL path
 * 5. JWT claims
 * 6. Store/context
 * 7. Default test tenant ID
 */
export const getTenantId = (): string => {
  // Try to extract from various sources
  const extractedId = extractTenantId({ skipStore: false });
  
  if (extractedId) {
    return extractedId;
  }
  
  // Fallback to store
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
