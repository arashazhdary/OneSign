// Helper to extract tenant ID from various sources
export function getTenantId(): string | null {
  // Try to get from URL query parameter
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    const tenantId = params.get('tenantId');
    if (tenantId) {
      return tenantId;
    }

    // Try to get from subdomain (e.g., tenant1.onesign.com)
    const hostname = window.location.hostname;
    const parts = hostname.split('.');
    if (parts.length > 2) {
      // Could be tenant subdomain
      const subdomain = parts[0];
      // In production, you would look up tenant by subdomain/domain
      // For Phase 1, we'll use a placeholder
      return null;
    }

    // Try to get from localStorage/sessionStorage
    const storedTenantId = sessionStorage.getItem('tenantId') || localStorage.getItem('tenantId');
    if (storedTenantId) {
      return storedTenantId;
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

