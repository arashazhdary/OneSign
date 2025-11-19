export type StorageType = 'localStorage' | 'sessionStorage';

export interface OnesignConfig {
  baseUrl: string;
  clientId: string;
  redirectUri: string;
  tenantId?: string;
  storageType?: StorageType;
  storagePrefix?: string;
  autoRefresh?: boolean;
  refreshBuffer?: number;
}

export interface TokenInfo {
  accessToken: string;
  idToken: string;
  tokenType: string;
  expiresIn: number;
  refreshToken?: string;
}

export interface UserInfo {
  sub: string;
  email?: string;
  emailVerified?: boolean;
  name?: string;
  givenName?: string;
  familyName?: string;
  preferredUsername?: string;
  picture?: string;
  locale?: string;
  zoneinfo?: string;
  updatedAt?: string;
  tenantId?: string;
  tenantName?: string;
  roles: string[];
  permissions: string[];
  groups: string[];
  customClaims: Record<string, unknown>;
}

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  user: UserInfo | null;
  tokens: TokenInfo | null;
}

