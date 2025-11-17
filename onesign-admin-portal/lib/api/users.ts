export interface CurrentUserScopeDto {
  userId: string;
  isGlobalAdmin: boolean;
  rootOrgUnitIds: string[];
  allowedOrgUnitIds: string[];
}

export async function getCurrentUserScope(tenantId: string): Promise<CurrentUserScopeDto | null> {
  try {
    const response = await fetch(`http://localhost:7000/api/tenant/users/current/scope?tenantId=${tenantId}`);

    if (!response.ok) {
      console.error('Failed to fetch current user scope:', response.statusText);
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching current user scope:', error);
    return null;
  }
}
