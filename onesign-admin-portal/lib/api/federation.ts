const API_BASE = 'http://localhost:7000';

// Enums
export type FederationProtocol = 'SAML2' | 'OIDC' | 'WsFed' | 'OAuth2';
export type FederationStatus = 'Active' | 'Inactive' | 'ConfigurationError' | 'Testing';
export type AttributeMappingType = 'Email' | 'FirstName' | 'LastName' | 'DisplayName' | 'Roles' | 'Groups' | 'Custom';

// DTOs
export interface FederationProviderDto {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  protocol: FederationProtocol;
  status: FederationStatus;
  isDefault: boolean;
  priority: number;

  // Protocol-specific configuration
  metadataUrl?: string;
  entityId?: string;
  ssoUrl?: string;
  sloUrl?: string;
  certificate?: string;

  // OIDC specific
  clientId?: string;
  clientSecret?: string;
  authority?: string;
  scopes?: string[];

  // User provisioning
  autoProvision: boolean;
  updateUserOnLogin: boolean;
  attributeMappings: AttributeMappingDto[];

  // Access control
  allowedDomains?: string[];
  restrictToGroups?: string[];

  createdAt: string;
  createdByUserId: string;
  updatedAt?: string;
  updatedByUserId?: string;
  lastTestedAt?: string;
  lastUsedAt?: string;
}

export interface AttributeMappingDto {
  id: string;
  federationProviderId: string;
  sourceAttribute: string;
  targetAttribute: AttributeMappingType;
  customTargetName?: string;
  transformExpression?: string;
  isRequired: boolean;
}

export interface CreateFederationProviderDto {
  tenantId: string;
  userId: string;
  name: string;
  description?: string;
  protocol: FederationProtocol;
  isDefault: boolean;
  metadataUrl?: string;
  entityId?: string;
  ssoUrl?: string;
  sloUrl?: string;
  certificate?: string;
  clientId?: string;
  clientSecret?: string;
  authority?: string;
  scopes?: string[];
  autoProvision: boolean;
  updateUserOnLogin: boolean;
  attributeMappings: Omit<AttributeMappingDto, 'id' | 'federationProviderId'>[];
  allowedDomains?: string[];
  restrictToGroups?: string[];
}

export interface UpdateFederationProviderDto extends CreateFederationProviderDto {
  status?: FederationStatus;
}

export interface FederationTestResultDto {
  success: boolean;
  protocol: FederationProtocol;
  testedAt: string;
  metadata?: {
    entityId?: string;
    ssoUrl?: string;
    certificate?: string;
    issuer?: string;
  };
  validationErrors: string[];
  validationWarnings: string[];
  recommendations: string[];
}

export interface FederationStatsDto {
  totalProviders: number;
  activeProviders: number;
  totalLogins: number;
  loginsByProvider: Array<{
    providerId: string;
    providerName: string;
    loginCount: number;
  }>;
  failedLoginsByProvider: Array<{
    providerId: string;
    providerName: string;
    failureCount: number;
  }>;
}

export interface FederationLoginEventDto {
  id: string;
  tenantId: string;
  federationProviderId: string;
  federationProviderName?: string;
  userId: string;
  userEmail: string;
  success: boolean;
  errorMessage?: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Tenant API functions

export async function getFederationProviders(
  tenantId: string,
  params?: {
    protocol?: FederationProtocol;
    status?: FederationStatus;
    page?: number;
    pageSize?: number;
  }
): Promise<PagedResult<FederationProviderDto>> {
  const searchParams = new URLSearchParams({ tenantId });
  if (params?.protocol) searchParams.append('protocol', params.protocol);
  if (params?.status) searchParams.append('status', params.status);
  if (params?.page) searchParams.append('page', params.page.toString());
  if (params?.pageSize) searchParams.append('pageSize', params.pageSize.toString());

  const response = await fetch(`${API_BASE}/api/tenant/federation/providers?${searchParams}`);
  if (!response.ok) throw new Error('Failed to fetch federation providers');
  return response.json();
}

export async function getFederationProvider(
  id: string,
  tenantId: string
): Promise<FederationProviderDto> {
  const response = await fetch(
    `${API_BASE}/api/tenant/federation/providers/${id}?tenantId=${tenantId}`
  );
  if (!response.ok) throw new Error('Failed to fetch federation provider');
  return response.json();
}

export async function createFederationProvider(
  data: CreateFederationProviderDto
): Promise<FederationProviderDto> {
  const response = await fetch(`${API_BASE}/api/tenant/federation/providers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create federation provider');
  return response.json();
}

export async function updateFederationProvider(
  id: string,
  data: UpdateFederationProviderDto
): Promise<FederationProviderDto> {
  const response = await fetch(`${API_BASE}/api/tenant/federation/providers/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update federation provider');
  return response.json();
}

export async function deleteFederationProvider(
  id: string,
  tenantId: string,
  userId: string
): Promise<void> {
  const response = await fetch(
    `${API_BASE}/api/tenant/federation/providers/${id}?tenantId=${tenantId}&userId=${userId}`,
    { method: 'DELETE' }
  );
  if (!response.ok) throw new Error('Failed to delete federation provider');
}

export async function activateFederationProvider(
  id: string,
  tenantId: string,
  userId: string
): Promise<void> {
  const response = await fetch(
    `${API_BASE}/api/tenant/federation/providers/${id}/activate?tenantId=${tenantId}&userId=${userId}`,
    { method: 'POST' }
  );
  if (!response.ok) throw new Error('Failed to activate federation provider');
}

export async function deactivateFederationProvider(
  id: string,
  tenantId: string,
  userId: string
): Promise<void> {
  const response = await fetch(
    `${API_BASE}/api/tenant/federation/providers/${id}/deactivate?tenantId=${tenantId}&userId=${userId}`,
    { method: 'POST' }
  );
  if (!response.ok) throw new Error('Failed to deactivate federation provider');
}

export async function testFederationProvider(
  id: string,
  tenantId: string
): Promise<FederationTestResultDto> {
  const response = await fetch(
    `${API_BASE}/api/tenant/federation/providers/${id}/test?tenantId=${tenantId}`,
    { method: 'POST' }
  );
  if (!response.ok) throw new Error('Failed to test federation provider');
  return response.json();
}

export async function parseMetadata(
  tenantId: string,
  metadataUrl: string
): Promise<{
  entityId: string;
  ssoUrl: string;
  sloUrl?: string;
  certificate: string;
}> {
  const response = await fetch(`${API_BASE}/api/tenant/federation/parse-metadata`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tenantId, metadataUrl }),
  });
  if (!response.ok) throw new Error('Failed to parse metadata');
  return response.json();
}

export async function getServiceProviderMetadata(tenantId: string): Promise<string> {
  const response = await fetch(
    `${API_BASE}/api/tenant/federation/sp-metadata?tenantId=${tenantId}`
  );
  if (!response.ok) throw new Error('Failed to fetch SP metadata');
  return response.text();
}

export async function getFederationStats(tenantId: string): Promise<FederationStatsDto> {
  const response = await fetch(
    `${API_BASE}/api/tenant/federation/stats?tenantId=${tenantId}`
  );
  if (!response.ok) throw new Error('Failed to fetch federation stats');
  return response.json();
}

export async function getFederationLoginEvents(
  tenantId: string,
  params?: {
    federationProviderId?: string;
    success?: boolean;
    fromDate?: string;
    toDate?: string;
    page?: number;
    pageSize?: number;
  }
): Promise<PagedResult<FederationLoginEventDto>> {
  const searchParams = new URLSearchParams({ tenantId });
  if (params?.federationProviderId) searchParams.append('federationProviderId', params.federationProviderId);
  if (params?.success !== undefined) searchParams.append('success', params.success.toString());
  if (params?.fromDate) searchParams.append('fromDate', params.fromDate);
  if (params?.toDate) searchParams.append('toDate', params.toDate);
  if (params?.page) searchParams.append('page', params.page.toString());
  if (params?.pageSize) searchParams.append('pageSize', params.pageSize.toString());

  const response = await fetch(`${API_BASE}/api/tenant/federation/login-events?${searchParams}`);
  if (!response.ok) throw new Error('Failed to fetch federation login events');
  return response.json();
}

// Global API functions

export async function getGlobalFederationProviders(
  params?: {
    tenantId?: string;
    protocol?: FederationProtocol;
    page?: number;
    pageSize?: number;
  }
): Promise<PagedResult<FederationProviderDto>> {
  const searchParams = new URLSearchParams();
  if (params?.tenantId) searchParams.append('tenantId', params.tenantId);
  if (params?.protocol) searchParams.append('protocol', params.protocol);
  if (params?.page) searchParams.append('page', params.page.toString());
  if (params?.pageSize) searchParams.append('pageSize', params.pageSize.toString());

  const response = await fetch(`${API_BASE}/api/global/federation/providers?${searchParams}`);
  if (!response.ok) throw new Error('Failed to fetch global federation providers');
  return response.json();
}

export async function getGlobalFederationStats(): Promise<{
  byTenant: Array<{ tenantId: string; tenantName: string; stats: FederationStatsDto }>;
  overall: FederationStatsDto;
}> {
  const response = await fetch(`${API_BASE}/api/global/federation/stats`);
  if (!response.ok) throw new Error('Failed to fetch global federation stats');
  return response.json();
}

// Constants
export const FEDERATION_PROTOCOLS: FederationProtocol[] = ['SAML2', 'OIDC', 'WsFed', 'OAuth2'];

export const FEDERATION_STATUSES: FederationStatus[] = [
  'Active',
  'Inactive',
  'ConfigurationError',
  'Testing',
];

export const ATTRIBUTE_MAPPING_TYPES: AttributeMappingType[] = [
  'Email',
  'FirstName',
  'LastName',
  'DisplayName',
  'Roles',
  'Groups',
  'Custom',
];

export const DEFAULT_OIDC_SCOPES = ['openid', 'profile', 'email'];

// Helper functions

export function getProtocolLabel(protocol: FederationProtocol): string {
  const labels: Record<FederationProtocol, string> = {
    SAML2: 'SAML 2.0',
    OIDC: 'OpenID Connect',
    WsFed: 'WS-Federation',
    OAuth2: 'OAuth 2.0',
  };
  return labels[protocol];
}

export function getStatusColor(status: FederationStatus): string {
  switch (status) {
    case 'Active':
      return 'green';
    case 'Inactive':
      return 'gray';
    case 'ConfigurationError':
      return 'red';
    case 'Testing':
      return 'yellow';
    default:
      return 'gray';
  }
}

export function validateCertificate(certificate: string): boolean {
  return certificate.includes('BEGIN CERTIFICATE') && certificate.includes('END CERTIFICATE');
}

export function validateEntityId(entityId: string): boolean {
  try {
    new URL(entityId);
    return true;
  } catch {
    // Entity ID might not be a URL (can be a URN)
    return entityId.length > 0;
  }
}
