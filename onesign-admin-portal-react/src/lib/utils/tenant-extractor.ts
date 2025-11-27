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
import { globalService } from '@/lib/api/services/global.service';

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
 * Lookup tenant ID by slug using the global API
 */
async function lookupTenantBySlug(slug: string): Promise<string | null> {
  try {
    // Use the global service to search for tenant by slug
    const result = await globalService.getTenants({
      search: slug,
      pageSize: 1
    });

    // Check if we found a tenant with matching slug
    if (result.items.length > 0 && result.items[0].slug === slug) {
      return result.items[0].id;
    }

    return null;
  } catch (error) {
    console.error('Error looking up tenant by slug:', error);
    return null;
  }
}

/**
 * Lookup tenant ID by subdomain using the global API
 */
async function lookupTenantBySubdomain(subdomain: string): Promise<string | null> {
  try {
    // Use the global service to search for tenant by subdomain
    // Subdomain is typically stored as the tenant slug
    const result = await globalService.getTenants({
      search: subdomain,
      pageSize: 1
    });

    // Check if we found a tenant with matching slug/subdomain
    if (result.items.length > 0 && result.items[0].slug === subdomain) {
      return result.items[0].id;
    }

    return null;
  } catch (error) {
    console.error('Error looking up tenant by subdomain:', error);
    return null;
  }
}

/**
 * Main function to extract tenant ID from all available sources
 * Returns tenant ID in priority order, or null if not found
 */
export async function extractTenantId(options?: {
  headers?: Record<string, string>;
  url?: string;
  skipStore?: boolean;
}): Promise<string | null> {
  const { headers, url, skipStore = false } = options || {};

  // 1. Try to extract from X-Tenant-Id header
  if (headers?.['X-Tenant-Id'] || headers?.['x-tenant-id']) {
    const tenantId = headers['X-Tenant-Id'] || headers['x-tenant-id'];
    if (tenantId) {
      return tenantId;
    }
  }

  // 2. Try to extract from X-Tenant-Slug header and lookup ID
  if (headers?.['X-Tenant-Slug'] || headers?.['x-tenant-slug']) {
    const tenantSlug = headers['X-Tenant-Slug'] || headers['x-tenant-slug'];
    if (tenantSlug) {
      // Lookup tenant ID by slug
      const tenantId = await lookupTenantBySlug(tenantSlug);
      if (tenantId) {
        return tenantId;
      }
      // If lookup fails, return slug as-is (API might handle it)
      return tenantSlug;
    }
  }

  // 3. Try to extract from subdomain and lookup ID
  const subdomainTenant = extractFromSubdomain();
  if (subdomainTenant) {
    // Lookup tenant ID by subdomain
    const tenantId = await lookupTenantBySubdomain(subdomainTenant);
    if (tenantId) {
      return tenantId;
    }
    // If lookup fails, return subdomain as-is
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
export async function getTenantId(options?: {
  headers?: Record<string, string>;
  url?: string;
  skipStore?: boolean;
}): Promise<string> {
  const tenantId = await extractTenantId(options);
  return tenantId || DEFAULT_TENANT_ID;
}

/**
 * Extract tenant ID from request headers (for server-side or API calls)
 */
export async function extractTenantIdFromHeaders(headers: Record<string, string | undefined>): Promise<string | null> {
  return await extractTenantId({ headers, skipStore: true });
}

/**
 * Extract tenant ID from current browser context
 */
export async function extractTenantIdFromContext(): Promise<string | null> {
  return await extractTenantId({ skipStore: false });
}

