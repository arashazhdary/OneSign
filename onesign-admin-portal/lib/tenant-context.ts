// Helper to extract tenant ID from various sources
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

export function setTenantId(tenantId: string): void {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('tenantId', tenantId);
    localStorage.setItem('tenantId', tenantId);
  }
}

