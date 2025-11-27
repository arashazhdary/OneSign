// Helper to extract tenant ID from various sources

// Cache for subdomain lookups to avoid repeated API calls
const subdomainCache = new Map<string, string | null>();

// Lookup tenant ID by subdomain via API
async function lookupTenantBySubdomain(subdomain: string): Promise<string | null> {
  // Check cache first
  if (subdomainCache.has(subdomain)) {
    return subdomainCache.get(subdomain) || null;
  }

  try {
    const response = await fetch(`http://localhost:7000/api/global/tenants?search=${encodeURIComponent(subdomain)}&pageSize=1`);
    if (response.ok) {
      const data = await response.json();
      if (data.items && data.items.length > 0) {
        const tenantId = data.items[0].id;
        subdomainCache.set(subdomain, tenantId);
        return tenantId;
      }
    }
  } catch (error) {
    console.error('Failed to lookup tenant by subdomain:', error);
  }

  subdomainCache.set(subdomain, null);
  return null;
}

export function getTenantId(): string | null {
  // Try to get from URL query parameter
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    const tenantId = params.get('tenantId');
    if (tenantId) {
      return tenantId;
    }

    // Try to get from localStorage/sessionStorage
    const storedTenantId = sessionStorage.getItem('tenantId') || localStorage.getItem('tenantId');
    if (storedTenantId) {
      return storedTenantId;
    }
  }

  return null;
}

// Async version that can do subdomain lookup
export async function getTenantIdAsync(): Promise<string | null> {
  // Try synchronous sources first
  const syncResult = getTenantId();
  if (syncResult) {
    return syncResult;
  }

  // Try subdomain lookup
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const parts = hostname.split('.');
    if (parts.length > 2) {
      const subdomain = parts[0];
      // Skip common non-tenant subdomains
      if (subdomain !== 'www' && subdomain !== 'login' && subdomain !== 'auth') {
        const tenantId = await lookupTenantBySubdomain(subdomain);
        if (tenantId) {
          // Store for future use
          setTenantId(tenantId);
          return tenantId;
        }
      }
    }
  }

  return null;
}

export function setTenantId(tenantId: string): void {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('tenantId', tenantId);
    localStorage.setItem('tenantId', tenantId);
  }
}

