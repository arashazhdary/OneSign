import { OnesignConfig, UserInfo, TokenInfo } from '../types';

export async function fetchUserInfo(
  config: OnesignConfig,
  tokens: TokenInfo
): Promise<UserInfo | null> {
  const baseUrl = config.baseUrl.replace(/\/+$/, '');
  const userInfoUrl = `${baseUrl}/connect/userinfo`;

  try {
    const response = await fetch(userInfoUrl, {
      method: 'GET',
      headers: {
        'Authorization': `${tokens.tokenType} ${tokens.accessToken}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    return {
      sub: data.sub,
      email: data.email,
      emailVerified: data.email_verified,
      name: data.name,
      givenName: data.given_name,
      familyName: data.family_name,
      preferredUsername: data.preferred_username,
      picture: data.picture,
      locale: data.locale,
      zoneinfo: data.zoneinfo,
      updatedAt: data.updated_at,
      tenantId: data.tenant_id,
      tenantName: data.tenant_name,
      roles: data.roles || data.role ? (Array.isArray(data.roles) ? data.roles : [data.role]) : [],
      permissions: data.permissions || data.permission ? (Array.isArray(data.permissions) ? data.permissions : [data.permission]) : [],
      groups: data.groups || [],
      customClaims: extractCustomClaims(data),
    };
  } catch (error) {
    console.error('Error fetching user info:', error);
    return null;
  }
}

function extractCustomClaims(data: Record<string, unknown>): Record<string, unknown> {
  const standardClaims = new Set([
    'sub', 'email', 'email_verified', 'name', 'given_name', 'family_name',
    'preferred_username', 'picture', 'locale', 'zoneinfo', 'updated_at',
    'tenant_id', 'tenant_name', 'roles', 'role', 'permissions', 'permission',
    'groups', 'iss', 'aud', 'exp', 'iat', 'nbf', 'jti', 'auth_time', 'nonce',
    'acr', 'amr', 'azp'
  ]);

  const customClaims: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(data)) {
    if (!standardClaims.has(key)) {
      customClaims[key] = value;
    }
  }

  return customClaims;
}

export function decodeIdToken(idToken: string): Record<string, unknown> | null {
  try {
    const parts = idToken.split('.');
    if (parts.length !== 3) return null;

    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

export function isTokenExpired(tokens: TokenInfo, bufferSeconds: number = 60): boolean {
  if (!tokens.expiresIn) return false;

  const expirationTime = Date.now() + (tokens.expiresIn * 1000);
  return Date.now() > (expirationTime - (bufferSeconds * 1000));
}

export function getTokenClaims(tokens: TokenInfo): Record<string, unknown> | null {
  if (!tokens.idToken) return null;
  return decodeIdToken(tokens.idToken);
}

export function hasPermission(user: UserInfo | null, permission: string): boolean {
  if (!user || !user.permissions) return false;
  return user.permissions.some(p => p.toLowerCase() === permission.toLowerCase());
}

export function hasAnyPermission(user: UserInfo | null, permissions: string[]): boolean {
  if (!user || !user.permissions) return false;
  const userPerms = new Set(user.permissions.map(p => p.toLowerCase()));
  return permissions.some(p => userPerms.has(p.toLowerCase()));
}

export function hasAllPermissions(user: UserInfo | null, permissions: string[]): boolean {
  if (!user || !user.permissions) return false;
  const userPerms = new Set(user.permissions.map(p => p.toLowerCase()));
  return permissions.every(p => userPerms.has(p.toLowerCase()));
}

export function hasRole(user: UserInfo | null, role: string): boolean {
  if (!user || !user.roles) return false;
  return user.roles.some(r => r.toLowerCase() === role.toLowerCase());
}

export function hasAnyRole(user: UserInfo | null, roles: string[]): boolean {
  if (!user || !user.roles) return false;
  const userRoles = new Set(user.roles.map(r => r.toLowerCase()));
  return roles.some(r => userRoles.has(r.toLowerCase()));
}

export function hasAllRoles(user: UserInfo | null, roles: string[]): boolean {
  if (!user || !user.roles) return false;
  const userRoles = new Set(user.roles.map(r => r.toLowerCase()));
  return roles.every(r => userRoles.has(r.toLowerCase()));
}
