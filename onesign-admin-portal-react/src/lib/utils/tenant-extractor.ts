/**
 * Tenant ID Extractor Utility
 * 
 * This utility extracts tenant ID from multiple sources in priority order:
 * 1. X-Tenant-Id header
 * 2. X-Tenant-Slug header (requires lookup to get ID)
 * 3. Subdomain (e.g., tenant1.onesign.com)
 * 4. URL path (e.g., /api/tenants/{tenantId}/...)
 * 5. JWT token claims
 * 
 * Falls back to store/context if none of the above are available
 */

import { useTenantStore } from '@/stores/tenantStore';
import { DEFAULT_TENANT_ID } from '@/lib/constants/testIds';

/**
 * Decode JWT token and extract claims
 */
function decodeJWT(token: string): any | null {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
}

/**
 * Extract tenant ID from subdomain
 * Example: tenant1.onesign.com -> tenant1
 */
function extractFromSubdomain(): string | null {
  if (typeof window === 'undefined') return null;
  
  const hostname = window.location.hostname;
  
  // Check if it's a subdomain pattern (e.g., tenant1.onesign.com)
  const parts = hostname.split('.');
  
  // If we have at least 3 parts (subdomain.domain.tld), extract subdomain
  if (parts.length >= 3) {
    const subdomain = parts[0];
    // Skip common subdomains like 'www', 'app', 'admin'
    if (subdomain && !['www', 'app', 'admin', 'api', 'cdn'].includes(subdomain.toLowerCase())) {
      return subdomain;
    }
  }
  
  return null;
}

/**
 * Extract tenant ID from URL path
 * Example: /api/tenants/{tenantId}/users -> {tenantId}
 */
function extractFromPath(url?: string): string | null {
  if (!url) {
    if (typeof window === 'undefined') return null;
    url = window.location.pathname;
  }
  
  // Match patterns like /api/tenants/{tenantId}/... or /tenants/{tenantId}/...
  const tenantPathPattern = /\/tenants\/([a-f0-9-]{36}|[a-zA-Z0-9_-]+)/i;
  const match = url.match(tenantPathPattern);
  
  if (match && match[1]) {
    return match[1];
  }
  
  return null;
}

/**
 * Extract tenant ID from JWT token claims
 */
function extractFromJWT(): string | null {
  if (typeof window === 'undefined') return null;
  
  const token = localStorage.getItem('auth-token') || localStorage.getItem('accessToken');
  if (!token) return null;
  
  const claims = decodeJWT(token);
  if (!claims) return null;
  
  // Check common JWT claim names for tenant ID
  return (
    claims.tenantId ||
    claims.tenant_id ||
    claims['http://schemas.microsoft.com/identity/claims/tenantid'] ||
    claims.tid || // Azure AD tenant ID
    claims.tenant || // Alternative claim name
    null
  );
}

/**
 * Main function to extract tenant ID from all available sources
 * Returns tenant ID in priority order, or null if not found
 */
export function extractTenantId(options?: {
  headers?: Record<string, string>;
  url?: string;
  skipStore?: boolean;
}): string | null {
  const { headers, url, skipStore = false } = options || {};

  // 1. Try to extract from X-Tenant-Id header
  if (headers?.['X-Tenant-Id'] || headers?.['x-tenant-id']) {
    const tenantId = headers['X-Tenant-Id'] || headers['x-tenant-id'];
    if (tenantId) {
      return tenantId;
    }
  }

  // 2. Try to extract from X-Tenant-Slug header
  // Note: This requires a lookup service to convert slug to ID
  // For now, we'll return the slug and let the API handle it
  if (headers?.['X-Tenant-Slug'] || headers?.['x-tenant-slug']) {
    const tenantSlug = headers['X-Tenant-Slug'] || headers['x-tenant-slug'];
    if (tenantSlug) {
      // TODO: Implement slug to ID lookup if needed
      // For now, return slug as-is (API should handle slug resolution)
      return tenantSlug;
    }
  }

  // 3. Try to extract from subdomain
  const subdomainTenant = extractFromSubdomain();
  if (subdomainTenant) {
    // TODO: Implement subdomain to ID lookup if needed
    // For now, return subdomain as-is
    return subdomainTenant;
  }

  // 4. Try to extract from URL path
  const pathTenant = extractFromPath(url);
  if (pathTenant) {
    return pathTenant;
  }

  // 5. Try to extract from JWT claims
  const jwtTenant = extractFromJWT();
  if (jwtTenant) {
    return jwtTenant;
  }

  // 6. Fallback to store/context
  if (!skipStore) {
    const state = useTenantStore.getState();
    if (state.currentTenant?.id) {
      return state.currentTenant.id;
    }
  }

  return null;
}

/**
 * Get tenant ID with fallback to default
 */
export function getTenantId(options?: {
  headers?: Record<string, string>;
  url?: string;
  skipStore?: boolean;
}): string {
  const tenantId = extractTenantId(options);
  return tenantId || DEFAULT_TENANT_ID;
}

/**
 * Extract tenant ID from request headers (for server-side or API calls)
 */
export function extractTenantIdFromHeaders(headers: Record<string, string | undefined>): string | null {
  return extractTenantId({ headers, skipStore: true });
}

/**
 * Extract tenant ID from current browser context
 */
export function extractTenantIdFromContext(): string | null {
  return extractTenantId({ skipStore: false });
}

