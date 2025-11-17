// Helper to fetch and cache tenant branding
export interface TenantBranding {
  logoUrl?: string;
  primaryColor?: string;
}

let cachedBranding: TenantBranding | null = null;
let cachedTenantId: string | null = null;

export async function getTenantBranding(tenantId: string): Promise<TenantBranding> {
  // Return cached branding if same tenant
  if (cachedBranding && cachedTenantId === tenantId) {
    return cachedBranding;
  }

  try {
    const response = await fetch(`http://localhost:7000/api/tenant/settings?tenantId=${tenantId}`);
    if (response.ok) {
      const data = await response.json();
      cachedBranding = {
        logoUrl: data.logoUrl,
        primaryColor: data.primaryColor
      };
      cachedTenantId = tenantId;
      return cachedBranding;
    }
  } catch (error) {
    console.error('Failed to fetch tenant branding:', error);
  }

  // Return default branding
  return {
    logoUrl: undefined,
    primaryColor: undefined
  };
}

export function clearBrandingCache(): void {
  cachedBranding = null;
  cachedTenantId = null;
}

