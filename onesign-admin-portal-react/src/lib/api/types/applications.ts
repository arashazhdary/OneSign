export interface Application {
  id: string;
  name: string;
  description?: string;
  type: 'saml' | 'oidc' | 'oauth' | 'custom';
  status: 'active' | 'inactive' | 'pending';
  clientId?: string;
  redirectUris?: string[];
  allowedScopes?: string[];
  logo?: string;
  createdAt: string;
  updatedAt: string;
  usersCount?: number;
  lastAccessedAt?: string;
}

export interface ApplicationListResponse {
  items: Application[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CreateApplicationRequest {
  name: string;
  description?: string;
  type: 'saml' | 'oidc' | 'oauth' | 'custom';
  redirectUris?: string[];
  allowedScopes?: string[];
}
