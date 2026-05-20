import type { OnesignUser } from './types';

export function normalizeClaims(payload: Record<string, unknown>): OnesignUser {
  const sub = String(payload.sub ?? '');
  const roles: string[] = [];
  const permissions: string[] = [];
  const orgUnitIds: string[] = [];

  const roleClaim = payload.role ?? payload.roles;
  if (typeof roleClaim === 'string') roles.push(roleClaim);
  if (Array.isArray(roleClaim)) roles.push(...roleClaim.map(String));

  const permissionClaim = payload.permission ?? payload.permissions;
  if (typeof permissionClaim === 'string') permissions.push(permissionClaim);
  if (Array.isArray(permissionClaim)) permissions.push(...permissionClaim.map(String));

  for (const key of ['org_unit_id', 'org_unit_ids', 'primary_org_unit'] as const) {
    const value = payload[key];
    if (typeof value === 'string') orgUnitIds.push(value);
    if (Array.isArray(value)) orgUnitIds.push(...value.map(String));
  }

  return {
    sub,
    email: payload.email != null ? String(payload.email) : undefined,
    name: payload.name != null ? String(payload.name) : undefined,
    tenantId: payload.tenant_id != null ? String(payload.tenant_id) : undefined,
    clientId: payload.client_id != null ? String(payload.client_id) : undefined,
    roles,
    permissions,
    orgUnitIds,
    claims: { ...payload },
  };
}
