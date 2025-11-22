import { ApiClient, apiClient } from '../api-client';
import {
  Tenant,
  CreateTenantRequest,
  UpdateTenantRequest,
  Role,
  OrgUnit,
  Integration,
  Webhook,
  WebhookEvent,
  ApiKey,
  SystemHealth,
  Permission,
} from '../types/platform';

/**
 * Platform Service
 * Handles all platform management operations
 */
export class PlatformService {
  constructor(private client: ApiClient = apiClient) {}

  // Tenant Management

  /**
   * Get all tenants (Global Admin only)
   */
  async getTenants(): Promise<Tenant[]> {
    const response = await this.client.get<Tenant[]>('/api/global/tenants');
    return response.data;
  }

  /**
   * Get tenant by ID
   */
  async getTenantById(tenantId: string): Promise<Tenant> {
    const response = await this.client.get<Tenant>(`/api/tenant/${tenantId}`);
    return response.data;
  }

  /**
   * Get current tenant
   */
  async getCurrentTenant(tenantId: string): Promise<Tenant> {
    const response = await this.client.get<Tenant>('/api/tenant/current', { tenantId });
    return response.data;
  }

  /**
   * Create tenant (Global Admin only)
   */
  async createTenant(data: CreateTenantRequest): Promise<Tenant> {
    const response = await this.client.post<Tenant>('/api/global/tenants', data);
    return response.data;
  }

  /**
   * Update tenant
   */
  async updateTenant(tenantId: string, data: UpdateTenantRequest): Promise<Tenant> {
    const response = await this.client.put<Tenant>(`/api/tenant/${tenantId}`, data);
    return response.data;
  }

  /**
   * Delete tenant (Global Admin only)
   */
  async deleteTenant(tenantId: string): Promise<void> {
    await this.client.delete(`/api/global/tenants/${tenantId}`);
  }

  /**
   * Suspend tenant
   */
  async suspendTenant(tenantId: string, reason?: string): Promise<void> {
    await this.client.post(`/api/global/tenants/${tenantId}/suspend`, { reason });
  }

  /**
   * Activate tenant
   */
  async activateTenant(tenantId: string): Promise<void> {
    await this.client.post(`/api/global/tenants/${tenantId}/activate`);
  }

  // Roles & Permissions

  /**
   * Get roles
   */
  async getRoles(tenantId?: string): Promise<Role[]> {
    const endpoint = tenantId ? '/api/tenant/roles' : '/api/global/roles';
    const response = await this.client.get<Role[]>(endpoint, { tenantId });
    return response.data;
  }

  /**
   * Get role by ID
   */
  async getRoleById(roleId: string, tenantId?: string): Promise<Role> {
    const endpoint = tenantId ? `/api/tenant/roles/${roleId}` : `/api/global/roles/${roleId}`;
    const response = await this.client.get<Role>(endpoint, { tenantId });
    return response.data;
  }

  /**
   * Create role
   */
  async createRole(data: Partial<Role>): Promise<Role> {
    const endpoint = data.tenantId ? '/api/tenant/roles' : '/api/global/roles';
    const response = await this.client.post<Role>(endpoint, data);
    return response.data;
  }

  /**
   * Update role
   */
  async updateRole(roleId: string, data: Partial<Role>, tenantId?: string): Promise<Role> {
    const endpoint = tenantId ? `/api/tenant/roles/${roleId}` : `/api/global/roles/${roleId}`;
    const response = await this.client.put<Role>(endpoint, { ...data, tenantId });
    return response.data;
  }

  /**
   * Delete role
   */
  async deleteRole(roleId: string, tenantId?: string): Promise<void> {
    const endpoint = tenantId ? `/api/tenant/roles/${roleId}` : `/api/global/roles/${roleId}`;
    await this.client.delete(endpoint, { params: { tenantId } });
  }

  /**
   * Get available permissions
   */
  async getPermissions(): Promise<Permission[]> {
    const response = await this.client.get<Permission[]>('/api/global/permissions');
    return response.data;
  }

  // Organization Units

  /**
   * Get organization units
   */
  async getOrgUnits(tenantId: string): Promise<OrgUnit[]> {
    const response = await this.client.get<OrgUnit[]>('/api/tenant/orgunits', { tenantId });
    return response.data;
  }

  /**
   * Get org unit by ID
   */
  async getOrgUnitById(tenantId: string, orgUnitId: string): Promise<OrgUnit> {
    const response = await this.client.get<OrgUnit>(`/api/tenant/orgunits/${orgUnitId}`, {
      tenantId,
    });
    return response.data;
  }

  /**
   * Create org unit
   */
  async createOrgUnit(data: Partial<OrgUnit>): Promise<OrgUnit> {
    const response = await this.client.post<OrgUnit>('/api/tenant/orgunits', data);
    return response.data;
  }

  /**
   * Update org unit
   */
  async updateOrgUnit(tenantId: string, orgUnitId: string, data: Partial<OrgUnit>): Promise<OrgUnit> {
    const response = await this.client.put<OrgUnit>(`/api/tenant/orgunits/${orgUnitId}`, {
      ...data,
      tenantId,
    });
    return response.data;
  }

  /**
   * Delete org unit
   */
  async deleteOrgUnit(tenantId: string, orgUnitId: string): Promise<void> {
    await this.client.delete(`/api/tenant/orgunits/${orgUnitId}`, {
      params: { tenantId },
    });
  }

  /**
   * Get org units tree
   */
  async getOrgUnitsTree(tenantId: string): Promise<any[]> {
    const response = await this.client.get<any[]>('/api/tenant/org-units/tree', { tenantId });
    return response.data;
  }

  /**
   * Move org unit to new parent
   */
  async moveOrgUnit(tenantId: string, orgUnitId: string, newParentId: string | null): Promise<void> {
    await this.client.post(`/api/tenant/org-units/${orgUnitId}/move`, {
      tenantId,
      newParentId,
    });
  }

  // Integrations

  /**
   * Get integrations
   */
  async getIntegrations(tenantId?: string): Promise<Integration[]> {
    const endpoint = tenantId ? '/api/tenant/integrations' : '/api/global/integrations';
    const response = await this.client.get<Integration[]>(endpoint, { tenantId });
    return response.data;
  }

  /**
   * Get integration by ID
   */
  async getIntegrationById(integrationId: string, tenantId?: string): Promise<Integration> {
    const endpoint = tenantId
      ? `/api/tenant/integrations/${integrationId}`
      : `/api/global/integrations/${integrationId}`;
    const response = await this.client.get<Integration>(endpoint, { tenantId });
    return response.data;
  }

  /**
   * Create integration
   */
  async createIntegration(data: Partial<Integration>): Promise<Integration> {
    const endpoint = data.tenantId ? '/api/tenant/integrations' : '/api/global/integrations';
    const response = await this.client.post<Integration>(endpoint, data);
    return response.data;
  }

  /**
   * Update integration
   */
  async updateIntegration(
    integrationId: string,
    data: Partial<Integration>,
    tenantId?: string
  ): Promise<Integration> {
    const endpoint = tenantId
      ? `/api/tenant/integrations/${integrationId}`
      : `/api/global/integrations/${integrationId}`;
    const response = await this.client.put<Integration>(endpoint, { ...data, tenantId });
    return response.data;
  }

  /**
   * Delete integration
   */
  async deleteIntegration(integrationId: string, tenantId?: string): Promise<void> {
    const endpoint = tenantId
      ? `/api/tenant/integrations/${integrationId}`
      : `/api/global/integrations/${integrationId}`;
    await this.client.delete(endpoint, { params: { tenantId } });
  }

  /**
   * Test integration
   */
  async testIntegration(
    integrationId: string,
    tenantId?: string
  ): Promise<{ success: boolean; message?: string }> {
    const endpoint = tenantId
      ? `/api/tenant/integrations/${integrationId}/test`
      : `/api/global/integrations/${integrationId}/test`;
    const response = await this.client.post<{ success: boolean; message?: string }>(endpoint, {
      tenantId,
    });
    return response.data;
  }

  /**
   * Sync integration
   */
  async syncIntegration(integrationId: string, tenantId?: string): Promise<void> {
    const endpoint = tenantId
      ? `/api/tenant/integrations/${integrationId}/sync`
      : `/api/global/integrations/${integrationId}/sync`;
    await this.client.post(endpoint, { tenantId });
  }

  /**
   * Get integration sync logs for a specific integration
   */
  async getIntegrationSyncLogs(integrationId: string, tenantId?: string): Promise<any[]> {
    const endpoint = tenantId
      ? `/api/tenant/integrations/${integrationId}/sync-logs`
      : `/api/global/integrations/${integrationId}/sync-logs`;
    const response = await this.client.get<any[]>(endpoint, { tenantId });
    return response.data;
  }

  /**
   * Get all integration sync logs
   */
  async getAllIntegrationSyncLogs(tenantId: string): Promise<any> {
    const response = await this.client.get<any>('/api/tenant/integrations/sync-logs', { tenantId });
    return response.data;
  }

  // Webhooks

  /**
   * Get webhooks
   */
  async getWebhooks(tenantId: string): Promise<Webhook[]> {
    const response = await this.client.get<Webhook[]>('/api/tenant/webhooks', { tenantId });
    return response.data;
  }

  /**
   * Create webhook
   */
  async createWebhook(data: Partial<Webhook>): Promise<Webhook> {
    const response = await this.client.post<Webhook>('/api/tenant/webhooks', data);
    return response.data;
  }

  /**
   * Update webhook
   */
  async updateWebhook(tenantId: string, webhookId: string, data: Partial<Webhook>): Promise<Webhook> {
    const response = await this.client.put<Webhook>(`/api/tenant/webhooks/${webhookId}`, {
      ...data,
      tenantId,
    });
    return response.data;
  }

  /**
   * Delete webhook
   */
  async deleteWebhook(tenantId: string, webhookId: string): Promise<void> {
    await this.client.delete(`/api/tenant/webhooks/${webhookId}`, {
      params: { tenantId },
    });
  }

  /**
   * Test webhook
   */
  async testWebhook(tenantId: string, webhookId: string): Promise<{ success: boolean; message?: string }> {
    const response = await this.client.post<{ success: boolean; message?: string }>(
      `/api/tenant/webhooks/${webhookId}/test`,
      { tenantId }
    );
    return response.data;
  }

  /**
   * Get webhook events
   */
  async getWebhookEvents(tenantId: string, webhookId: string): Promise<WebhookEvent[]> {
    const response = await this.client.get<WebhookEvent[]>(
      `/api/tenant/webhooks/${webhookId}/events`,
      { tenantId }
    );
    return response.data;
  }

  // API Keys

  /**
   * Get API keys
   */
  async getApiKeys(tenantId: string): Promise<ApiKey[]> {
    const response = await this.client.get<ApiKey[]>('/api/tenant/api-keys', { tenantId });
    return response.data;
  }

  /**
   * Create API key
   */
  async createApiKey(
    tenantId: string,
    name: string,
    permissions: string[],
    expiresAt?: string
  ): Promise<ApiKey> {
    const response = await this.client.post<ApiKey>('/api/tenant/api-keys', {
      tenantId,
      name,
      permissions,
      expiresAt,
    });
    return response.data;
  }

  /**
   * Revoke API key
   */
  async revokeApiKey(tenantId: string, apiKeyId: string): Promise<void> {
    await this.client.delete(`/api/tenant/api-keys/${apiKeyId}`, {
      params: { tenantId },
    });
  }

  // System Health

  /**
   * Get system health
   */
  async getSystemHealth(): Promise<SystemHealth> {
    const response = await this.client.get<SystemHealth>('/api/health');
    return response.data;
  }

  /**
   * Get service health
   */
  async getServiceHealth(serviceName: string): Promise<any> {
    const response = await this.client.get(`/api/health/${serviceName}`);
    return response.data;
  }

  // Cryptography Management

  /**
   * Get all keysets
   */
  async getCryptoKeysets(): Promise<any[]> {
    const response = await this.client.get<any[]>('/api/global/crypto/keysets');
    return response.data;
  }

  /**
   * Get keyset by ID with versions
   */
  async getCryptoKeyset(keysetId: string): Promise<any> {
    const response = await this.client.get<any>(`/api/global/crypto/keysets/${keysetId}`);
    return response.data;
  }

  /**
   * Rollover key manually
   */
  async rolloverCryptoKey(keysetId: string): Promise<void> {
    await this.client.post(`/api/global/crypto/keysets/${keysetId}/rollover`, {});
  }

  /**
   * Revoke key version
   */
  async revokeCryptoKeyVersion(versionId: string): Promise<void> {
    await this.client.post(`/api/global/crypto/keyversions/${versionId}/revoke`, {});
  }

  /**
   * Get key rotation policies
   */
  async getCryptoRotationPolicies(): Promise<any[]> {
    const response = await this.client.get<any[]>('/api/global/crypto/rotation-policies');
    return response.data;
  }

  /**
   * Create new keyset
   */
  async createCryptoKeyset(data: {
    name: string;
    algorithm: string;
    keySize: number;
    purpose: string;
  }): Promise<any> {
    const response = await this.client.post<any>('/api/global/crypto/key-sets', data);
    return response.data;
  }

  /**
   * Rotate key manually
   */
  async rotateCryptoKey(keysetId: string): Promise<void> {
    await this.client.post(`/api/global/crypto/key-sets/${keysetId}/rotate`, {});
  }

  /**
   * Update rotation policy
   */
  async updateCryptoRotationPolicy(data: {
    name: string;
    rotationInterval: number;
    rotationUnit: string;
    autoRotate: boolean;
    gracePeriod: number;
    notifyBefore: number;
  }): Promise<any> {
    const response = await this.client.put<any>('/api/global/crypto/rotation-policies', data);
    return response.data;
  }

  // Extensibility - Login Hooks

  /**
   * Get login hooks
   */
  async getLoginHooks(tenantId: string): Promise<any[]> {
    const response = await this.client.get<any[]>('/api/tenant/extensibility/login-hooks', { tenantId });
    return response.data;
  }

  /**
   * Create login hook
   */
  async createLoginHook(tenantId: string, data: any): Promise<any> {
    const response = await this.client.post<any>('/api/tenant/extensibility/login-hooks', { ...data, tenantId });
    return response.data;
  }

  /**
   * Update login hook
   */
  async updateLoginHook(tenantId: string, id: string, data: any): Promise<any> {
    const response = await this.client.put<any>(`/api/tenant/extensibility/login-hooks/${id}`, { ...data, tenantId });
    return response.data;
  }

  /**
   * Delete login hook
   */
  async deleteLoginHook(tenantId: string, id: string): Promise<void> {
    await this.client.delete(`/api/tenant/extensibility/login-hooks/${id}`, { params: { tenantId } });
  }

  // Webhooks

  /**
   * Get webhooks
   */
  async getWebhooks(tenantId: string): Promise<any[]> {
    const response = await this.client.get<any[]>('/api/tenant/extensibility/webhooks', { tenantId });
    return response.data;
  }

  /**
   * Create webhook
   */
  async createWebhook(tenantId: string, data: any): Promise<any> {
    const response = await this.client.post<any>('/api/tenant/extensibility/webhooks', { ...data, tenantId });
    return response.data;
  }

  /**
   * Update webhook
   */
  async updateWebhook(tenantId: string, id: string, data: any): Promise<any> {
    const response = await this.client.put<any>(`/api/tenant/extensibility/webhooks/${id}`, { ...data, tenantId });
    return response.data;
  }

  /**
   * Delete webhook
   */
  async deleteWebhook(tenantId: string, id: string): Promise<void> {
    await this.client.delete(`/api/tenant/extensibility/webhooks/${id}`, { params: { tenantId } });
  }

  /**
   * Test webhook
   */
  async testWebhook(tenantId: string, id: string): Promise<void> {
    await this.client.post(`/api/tenant/extensibility/webhooks/${id}/test`, { tenantId });
  }

  // Token Rules

  /**
   * Get token rules
   */
  async getTokenRules(tenantId: string): Promise<any[]> {
    const response = await this.client.get<any[]>('/api/tenant/extensibility/token-rules', { tenantId });
    return response.data;
  }

  /**
   * Create token rule
   */
  async createTokenRule(tenantId: string, data: any): Promise<any> {
    const response = await this.client.post<any>('/api/tenant/extensibility/token-rules', { ...data, tenantId });
    return response.data;
  }

  /**
   * Update token rule
   */
  async updateTokenRule(tenantId: string, id: string, data: any): Promise<any> {
    const response = await this.client.put<any>(`/api/tenant/extensibility/token-rules/${id}`, { ...data, tenantId });
    return response.data;
  }

  /**
   * Delete token rule
   */
  async deleteTokenRule(tenantId: string, id: string): Promise<void> {
    await this.client.delete(`/api/tenant/extensibility/token-rules/${id}`, { params: { tenantId } });
  }

  // Event Types

  /**
   * Get event types
   */
  async getEventTypes(tenantId: string): Promise<any[]> {
    const response = await this.client.get<any[]>('/api/tenant/extensibility/event-types', { tenantId });
    return response.data;
  }

  // Service Accounts

  /**
   * Get service accounts
   */
  async getServiceAccounts(tenantId: string): Promise<any[]> {
    const response = await this.client.get<any[]>('/api/tenant/service-accounts', { tenantId });
    return response.data;
  }

  /**
   * Create service account
   */
  async createServiceAccount(tenantId: string, data: any): Promise<any> {
    const response = await this.client.post<any>('/api/tenant/service-accounts', { ...data, tenantId });
    return response.data;
  }

  /**
   * Update service account
   */
  async updateServiceAccount(tenantId: string, id: string, data: any): Promise<any> {
    const response = await this.client.put<any>(`/api/tenant/service-accounts/${id}`, { ...data, tenantId });
    return response.data;
  }

  /**
   * Delete service account
   */
  async deleteServiceAccount(tenantId: string, id: string): Promise<void> {
    await this.client.delete(`/api/tenant/service-accounts/${id}`, { params: { tenantId } });
  }

  /**
   * Rotate service account credentials
   */
  async rotateServiceAccountCredentials(tenantId: string, id: string): Promise<any> {
    const response = await this.client.post<any>(`/api/tenant/service-accounts/${id}/rotate`, { tenantId });
    return response.data;
  }

  // Scopes Management

  /**
   * Get scopes
   */
  async getScopes(tenantId: string): Promise<any[]> {
    const response = await this.client.get<any[]>('/api/tenant/scopes', { tenantId });
    return response.data;
  }

  /**
   * Create scope
   */
  async createScope(tenantId: string, data: any): Promise<any> {
    const response = await this.client.post<any>('/api/tenant/scopes', { ...data, tenantId });
    return response.data;
  }

  /**
   * Update scope
   */
  async updateScope(tenantId: string, scopeId: string, data: any): Promise<any> {
    const response = await this.client.put<any>(`/api/tenant/scopes/${scopeId}`, { ...data, tenantId });
    return response.data;
  }

  /**
   * Delete scope
   */
  async deleteScope(tenantId: string, scopeId: string): Promise<void> {
    await this.client.delete(`/api/tenant/scopes/${scopeId}`, { params: { tenantId } });
  }

  /**
   * Update scope status
   */
  async updateScopeStatus(tenantId: string, scopeId: string, isEnabled: boolean): Promise<void> {
    await this.client.patch(`/api/tenant/scopes/${scopeId}/status`, { tenantId, isEnabled });
  }

  /**
   * Get scope groups
   */
  async getScopeGroups(tenantId: string): Promise<any[]> {
    const response = await this.client.get<any[]>('/api/tenant/scope-groups', { tenantId });
    return response.data;
  }

  // Tenant Settings Management

  /**
   * Get tenant settings
   */
  async getSettings(tenantId: string): Promise<any> {
    const response = await this.client.get<any>('/api/tenant/settings', { tenantId });
    return response.data;
  }

  /**
   * Get tenant branding configuration
   */
  async getBranding(tenantId: string): Promise<any> {
    const response = await this.client.get<any>('/api/tenant/branding', { tenantId });
    return response.data;
  }

  /**
   * Update tenant branding settings
   */
  async updateBranding(tenantId: string, data: any): Promise<any> {
    const response = await this.client.put<any>('/api/tenant/branding', { ...data, tenantId });
    return response.data;
  }

  /**
   * Update tenant branding settings (legacy)
   */
  async updateBrandingSettings(tenantId: string, data: any): Promise<any> {
    const response = await this.client.put<any>('/api/tenant/settings/branding', { ...data, tenantId });
    return response.data;
  }

  // Federation Management

  /**
   * Get SAML providers
   */
  async getSAMLProviders(tenantId: string): Promise<any[]> {
    const response = await this.client.get<any[]>('/api/tenant/federation/saml-providers', { tenantId });
    return response.data;
  }

  /**
   * Create SAML provider
   */
  async createSAMLProvider(tenantId: string, data: any): Promise<any> {
    const response = await this.client.post<any>('/api/tenant/federation/saml-providers', { ...data, tenantId });
    return response.data;
  }

  /**
   * Update SAML provider
   */
  async updateSAMLProvider(tenantId: string, providerId: string, data: any): Promise<any> {
    const response = await this.client.put<any>(`/api/tenant/federation/saml-providers/${providerId}`, { ...data, tenantId });
    return response.data;
  }

  /**
   * Delete SAML provider
   */
  async deleteSAMLProvider(tenantId: string, providerId: string): Promise<void> {
    await this.client.delete(`/api/tenant/federation/saml-providers/${providerId}`, { params: { tenantId } });
  }

  /**
   * Get OIDC providers
   */
  async getOIDCProviders(tenantId: string): Promise<any[]> {
    const response = await this.client.get<any[]>('/api/tenant/federation/oidc-providers', { tenantId });
    return response.data;
  }

  /**
   * Create OIDC provider
   */
  async createOIDCProvider(tenantId: string, data: any): Promise<any> {
    const response = await this.client.post<any>('/api/tenant/federation/oidc-providers', { ...data, tenantId });
    return response.data;
  }

  /**
   * Update OIDC provider
   */
  async updateOIDCProvider(tenantId: string, providerId: string, data: any): Promise<any> {
    const response = await this.client.put<any>(`/api/tenant/federation/oidc-providers/${providerId}`, { ...data, tenantId });
    return response.data;
  }

  /**
   * Delete OIDC provider
   */
  async deleteOIDCProvider(tenantId: string, providerId: string): Promise<void> {
    await this.client.delete(`/api/tenant/federation/oidc-providers/${providerId}`, { params: { tenantId } });
  }

  /**
   * Get SCIM tokens
   */
  async getSCIMTokens(tenantId: string): Promise<any[]> {
    const response = await this.client.get<any[]>('/api/tenant/federation/scim-tokens', { tenantId });
    return response.data;
  }

  /**
   * Create SCIM token
   */
  async createSCIMToken(tenantId: string, data: any): Promise<any> {
    const response = await this.client.post<any>('/api/tenant/federation/scim-tokens', { ...data, tenantId });
    return response.data;
  }

  /**
   * Delete SCIM token
   */
  async deleteSCIMToken(tenantId: string, tokenId: string): Promise<void> {
    await this.client.delete(`/api/tenant/federation/scim-tokens/${tokenId}`, { params: { tenantId } });
  }

  // Delegated Admins Management

  /**
   * Get delegated admins
   */
  async getDelegatedAdmins(tenantId: string): Promise<any[]> {
    const response = await this.client.get<any[]>('/api/tenant/delegated-admins', { tenantId });
    return response.data;
  }

  /**
   * Create delegated admin
   */
  async createDelegatedAdmin(tenantId: string, data: {
    tenantUserId: string;
    orgUnitId: string;
    scopeType: number;
  }): Promise<any> {
    const response = await this.client.post<any>('/api/tenant/delegated-admins', { ...data, tenantId });
    return response.data;
  }

  /**
   * Delete delegated admin
   */
  async deleteDelegatedAdmin(tenantId: string, id: string): Promise<void> {
    await this.client.delete(`/api/tenant/delegated-admins/${id}`, { params: { tenantId } });
  }

  // ==================== Global Infrastructure Management ====================

  // Platform Management

  /**
   * Get platform version information
   */
  async getPlatformVersion(): Promise<any> {
    const response = await this.client.get<any>('/api/global/platform/version');
    return response.data;
  }

  /**
   * Get platform migrations
   */
  async getPlatformMigrations(page: number, pageSize: number): Promise<any> {
    const response = await this.client.get<any>(`/api/global/platform/migrations?page=${page}&pageSize=${pageSize}`);
    return response.data;
  }

  /**
   * Get platform tests
   */
  async getPlatformTests(page: number, pageSize: number): Promise<any> {
    const response = await this.client.get<any>(`/api/global/platform/tests?page=${page}&pageSize=${pageSize}`);
    return response.data;
  }

  /**
   * Get platform health
   */
  async getPlatformHealth(): Promise<any> {
    const response = await this.client.get<any>('/api/global/platform/health');
    return response.data;
  }

  /**
   * Get platform diagnostics
   */
  async getPlatformDiagnostics(): Promise<any> {
    const response = await this.client.get<any>('/api/global/platform/diagnostics');
    return response.data;
  }

  /**
   * Get platform OpenAPI documentation
   */
  async getPlatformOpenApiDocs(): Promise<any> {
    const response = await this.client.get<any>('/api/global/platform/docs/openapi');
    return response.data;
  }

  /**
   * Run platform tests
   */
  async runPlatformTests(): Promise<void> {
    await this.client.post('/api/global/platform/tests/run');
  }

  /**
   * Apply platform migration
   */
  async applyPlatformMigration(migrationId: string): Promise<void> {
    await this.client.post('/api/global/platform/migrations/apply', { migrationId });
  }

  /**
   * Get platform test by ID
   */
  async getPlatformTestById(testId: string): Promise<any> {
    const response = await this.client.get<any>(`/api/global/platform/tests/${testId}`);
    return response.data;
  }

  /**
   * Get platform test results
   */
  async getPlatformTestResults(): Promise<any> {
    const response = await this.client.get<any>('/api/global/platform/tests/results');
    return response.data;
  }

  /**
   * Generate platform documentation
   */
  async generatePlatformDocs(): Promise<void> {
    await this.client.post('/api/global/platform/docs/generate');
  }

  // Regions Management

  /**
   * Get all regions
   */
  async getRegions(): Promise<any> {
    const response = await this.client.get<any>('/api/global/regions');
    return response.data;
  }

  /**
   * Get region health
   */
  async getRegionHealth(regionId: string): Promise<any> {
    const response = await this.client.get<any>(`/api/global/regions/${regionId}/health`);
    return response.data;
  }

  /**
   * Get region backups
   */
  async getRegionBackups(): Promise<any> {
    const response = await this.client.get<any>('/api/global/regions/backups');
    return response.data;
  }

  /**
   * Get data residency rules
   */
  async getDataResidencyRules(): Promise<any> {
    const response = await this.client.get<any>('/api/global/regions/data-residency');
    return response.data;
  }

  /**
   * Get disaster recovery status
   */
  async getDRStatus(): Promise<any> {
    const response = await this.client.get<any>('/api/global/regions/dr/status');
    return response.data;
  }

  /**
   * Create region
   */
  async createRegion(data: any): Promise<any> {
    const response = await this.client.post<any>('/api/global/regions', data);
    return response.data;
  }

  /**
   * Activate region
   */
  async activateRegion(regionId: string): Promise<void> {
    await this.client.post(`/api/global/regions/${regionId}/activate`);
  }

  /**
   * Deactivate region
   */
  async deactivateRegion(regionId: string): Promise<void> {
    await this.client.post(`/api/global/regions/${regionId}/deactivate`);
  }

  /**
   * Delete region
   */
  async deleteRegion(regionId: string): Promise<void> {
    await this.client.delete(`/api/global/regions/${regionId}`);
  }

  /**
   * Create region backup
   */
  async createRegionBackup(regionId: string): Promise<any> {
    const response = await this.client.post<any>('/api/global/regions/backups', { regionId });
    return response.data;
  }

  /**
   * Restore region backup
   */
  async restoreRegionBackup(backupId: string): Promise<void> {
    await this.client.post(`/api/global/regions/backups/${backupId}/restore`);
  }

  /**
   * Update region
   */
  async updateRegion(regionId: string, data: any): Promise<any> {
    const response = await this.client.put<any>(`/api/global/regions/${regionId}`, data);
    return response.data;
  }

  /**
   * Get backups for specific region
   */
  async getRegionBackupsById(regionId: string): Promise<any> {
    const response = await this.client.get<any>(`/api/global/regions/${regionId}/backups`);
    return response.data;
  }

  /**
   * Create backup for specific region
   */
  async createRegionBackupById(regionId: string): Promise<any> {
    const response = await this.client.post<any>(`/api/global/regions/${regionId}/backups`);
    return response.data;
  }

  /**
   * Get tenant data residency
   */
  async getTenantDataResidency(): Promise<any> {
    const response = await this.client.get<any>('/api/global/regions/tenants/data-residency');
    return response.data;
  }

  /**
   * Get tenant backups
   */
  async getTenantBackups(tenantId: string): Promise<any> {
    const response = await this.client.get<any>(`/api/global/regions/tenants/${tenantId}/backups`);
    return response.data;
  }

  /**
   * Create tenant backup
   */
  async createTenantBackup(tenantId: string): Promise<any> {
    const response = await this.client.post<any>(`/api/global/regions/tenants/${tenantId}/backups`);
    return response.data;
  }

  /**
   * Restore tenant
   */
  async restoreTenant(tenantId: string): Promise<void> {
    await this.client.post(`/api/global/regions/tenants/${tenantId}/restore`);
  }

  /**
   * Get DR dashboard
   */
  async getDRDashboard(): Promise<any> {
    const response = await this.client.get<any>('/api/global/regions/dr-dashboard');
    return response.data;
  }

  // Environments Management

  /**
   * Get all environments
   */
  async getEnvironments(): Promise<any> {
    const response = await this.client.get<any>('/api/global/environments');
    return response.data;
  }

  /**
   * Get environment heartbeat
   */
  async getEnvironmentHeartbeat(environmentId: string): Promise<any> {
    const response = await this.client.get<any>(`/api/global/environments/${environmentId}/heartbeat`);
    return response.data;
  }

  /**
   * Bootstrap environment
   */
  async bootstrapEnvironment(data: any): Promise<any> {
    const response = await this.client.post<any>('/api/global/environments/bootstrap', data);
    return response.data;
  }

  /**
   * Restart environment
   */
  async restartEnvironment(environmentId: string): Promise<void> {
    await this.client.post(`/api/global/environments/${environmentId}/restart`);
  }

  // Feature Flags Management

  /**
   * Get all feature flags
   */
  async getFeatureFlags(): Promise<any> {
    const response = await this.client.get<any>('/api/global/feature-flags');
    return response.data;
  }

  /**
   * Get feature flag history
   */
  async getFeatureFlagHistory(flagId: string): Promise<any> {
    const response = await this.client.get<any>(`/api/global/feature-flags/${flagId}/history`);
    return response.data;
  }

  /**
   * Toggle feature flag
   */
  async toggleFeatureFlag(flagId: string, enabled: boolean): Promise<void> {
    await this.client.patch(`/api/global/feature-flags/${flagId}/toggle`, { enabled });
  }

  /**
   * Create feature flag
   */
  async createFeatureFlag(data: any): Promise<any> {
    const response = await this.client.post<any>('/api/global/feature-flags', data);
    return response.data;
  }

  /**
   * Delete feature flag
   */
  async deleteFeatureFlag(flagId: string): Promise<void> {
    await this.client.delete(`/api/global/feature-flags/${flagId}`);
  }

  // Global Settings Management

  /**
   * Get settings by category
   */
  async getGlobalSettings(category: string): Promise<any> {
    const response = await this.client.get<any>(`/api/global/settings/${category}`);
    return response.data;
  }

  /**
   * Update settings by category
   */
  async updateGlobalSettings(category: string, data: any): Promise<any> {
    const response = await this.client.put<any>(`/api/global/settings/${category}`, data);
    return response.data;
  }

  /**
   * Test email configuration
   */
  async testEmailConfiguration(data: any): Promise<any> {
    const response = await this.client.post<any>('/api/global/settings/email/test', data);
    return response.data;
  }

  /**
   * Test SMS configuration
   */
  async testSMSConfiguration(data: any): Promise<any> {
    const response = await this.client.post<any>('/api/global/settings/sms/test', data);
    return response.data;
  }

  // API Management

  /**
   * Get API endpoints
   */
  async getAPIEndpoints(): Promise<any> {
    const response = await this.client.get<any>('/api/global/api-management/endpoints');
    return response.data;
  }

  /**
   * Get API keys
   */
  async getAPIKeys(): Promise<any> {
    const response = await this.client.get<any>('/api/global/api-management/keys');
    return response.data;
  }

  /**
   * Get API consumers
   */
  async getAPIConsumers(): Promise<any> {
    const response = await this.client.get<any>('/api/global/api-management/consumers');
    return response.data;
  }

  /**
   * Get API versions
   */
  async getAPIVersions(): Promise<any> {
    const response = await this.client.get<any>('/api/global/api-management/versions');
    return response.data;
  }

  /**
   * Create API key
   */
  async createAPIKey(data: any): Promise<any> {
    const response = await this.client.post<any>('/api/global/api-management/keys', data);
    return response.data;
  }

  /**
   * Revoke API key
   */
  async revokeAPIKey(keyId: string): Promise<void> {
    await this.client.post(`/api/global/api-management/keys/${keyId}/revoke`);
  }

  /**
   * Update endpoint rate limit
   */
  async updateEndpointRateLimit(endpointId: string, data: any): Promise<void> {
    await this.client.patch(`/api/global/api-management/endpoints/${endpointId}/rate-limit`, data);
  }

  // Performance Monitoring

  /**
   * Get performance metrics
   */
  async getPerformanceMetrics(): Promise<any> {
    const response = await this.client.get<any>('/api/global/performance/metrics');
    return response.data;
  }

  /**
   * Get slow queries
   */
  async getSlowQueries(): Promise<any> {
    const response = await this.client.get<any>('/api/global/performance/slow-queries');
    return response.data;
  }

  /**
   * Get performance alerts
   */
  async getPerformanceAlerts(): Promise<any> {
    const response = await this.client.get<any>('/api/global/performance/alerts');
    return response.data;
  }

  /**
   * Resolve performance alert
   */
  async resolvePerformanceAlert(alertId: string): Promise<void> {
    await this.client.post(`/api/global/performance/alerts/${alertId}/resolve`);
  }

  // Tenant Lifecycle Management

  /**
   * Get tenant health (overloaded for global context)
   */
  async getTenantHealthGlobal(tenantId: string): Promise<any> {
    const response = await this.client.get<any>(`/api/global/tenants/${tenantId}/health`);
    return response.data;
  }

  /**
   * Get tenant metrics (global)
   */
  async getTenantMetricsGlobal(tenantId: string): Promise<any> {
    const response = await this.client.get<any>(`/api/global/tenants/${tenantId}/metrics`);
    return response.data;
  }

  /**
   * Get tenant migration status
   */
  async getTenantMigrationStatus(tenantId: string, migrationId: string): Promise<any> {
    const response = await this.client.get<any>(`/api/global/tenants/${tenantId}/migrations/${migrationId}`);
    return response.data;
  }

  /**
   * Get tenant export status
   */
  async getTenantExportStatus(tenantId: string, exportId: string): Promise<any> {
    const response = await this.client.get<any>(`/api/global/tenants/${tenantId}/exports/${exportId}`);
    return response.data;
  }

  /**
   * Suspend tenant (global)
   */
  async suspendTenantGlobal(tenantId: string): Promise<void> {
    await this.client.post(`/api/global/tenants/${tenantId}/suspend`);
  }

  /**
   * Resume tenant (global)
   */
  async resumeTenantGlobal(tenantId: string): Promise<void> {
    await this.client.post(`/api/global/tenants/${tenantId}/resume`);
  }

  /**
   * Migrate tenant
   */
  async migrateTenant(tenantId: string): Promise<any> {
    const response = await this.client.post<any>(`/api/global/tenants/${tenantId}/migrate`);
    return response.data;
  }

  /**
   * Export tenant data
   */
  async exportTenantData(tenantId: string): Promise<any> {
    const response = await this.client.post<any>(`/api/global/tenants/${tenantId}/export`);
    return response.data;
  }

  /**
   * Import tenant data
   */
  async importTenantData(tenantId: string): Promise<void> {
    await this.client.post(`/api/global/tenants/${tenantId}/import`);
  }

  // Org Unit Detail Management

  /**
   * Get org unit by ID
   */
  async getOrgUnit(tenantId: string, orgUnitId: string): Promise<any> {
    const response = await this.client.get<any>(`/api/tenant/org-units/${orgUnitId}`, { tenantId });
    return response.data;
  }

  /**
   * Get org unit users
   */
  async getOrgUnitUsers(tenantId: string, orgUnitId: string): Promise<any[]> {
    const response = await this.client.get<any[]>(`/api/tenant/org-units/${orgUnitId}/users`, { tenantId });
    return response.data;
  }

  /**
   * Get org unit applications
   */
  async getOrgUnitApplications(tenantId: string, orgUnitId: string): Promise<any[]> {
    const response = await this.client.get<any[]>(`/api/tenant/org-units/${orgUnitId}/applications`, { tenantId });
    return response.data;
  }

  /**
   * Get org unit policies
   */
  async getOrgUnitPolicies(tenantId: string, orgUnitId: string): Promise<any[]> {
    const response = await this.client.get<any[]>(`/api/tenant/org-units/${orgUnitId}/policies`, { tenantId });
    return response.data;
  }

  /**
   * Get org unit hierarchy
   */
  async getOrgUnitHierarchy(tenantId: string, orgUnitId: string): Promise<any> {
    const response = await this.client.get<any>(`/api/tenant/org-units/${orgUnitId}/hierarchy`, { tenantId });
    return response.data;
  }

  /**
   * Get org unit statistics
   */
  async getOrgUnitStatistics(tenantId: string, orgUnitId: string): Promise<any> {
    const response = await this.client.get<any>(`/api/tenant/org-units/${orgUnitId}/statistics`, { tenantId });
    return response.data;
  }

  /**
   * Update org unit
   */
  async updateOrgUnit(tenantId: string, orgUnitId: string, data: any): Promise<any> {
    const response = await this.client.put<any>(`/api/tenant/org-units/${orgUnitId}`, { ...data, tenantId });
    return response.data;
  }

  /**
   * Remove user from org unit
   */
  async removeOrgUnitUser(tenantId: string, orgUnitId: string, userId: string): Promise<void> {
    await this.client.delete(`/api/tenant/org-units/${orgUnitId}/users/${userId}`, { params: { tenantId } });
  }

  /**
   * Remove application from org unit
   */
  async removeOrgUnitApplication(tenantId: string, orgUnitId: string, applicationId: string): Promise<void> {
    await this.client.delete(`/api/tenant/org-units/${orgUnitId}/applications/${applicationId}`, { params: { tenantId } });
  }

  // ==================== Admin Tenant Management ====================

  /**
   * Get admin tenants with pagination
   */
  async getAdminTenants(pageNumber: number, pageSize: number): Promise<any> {
    const response = await this.client.get<any>(`/api/admin/tenants?pageNumber=${pageNumber}&pageSize=${pageSize}`);
    return response.data;
  }

  /**
   * Create admin tenant
   */
  async createAdminTenant(data: { name: string; slug: string }): Promise<any> {
    const response = await this.client.post<any>('/api/admin/tenants', data);
    return response.data;
  }

  /**
   * Update admin tenant status
   */
  async updateAdminTenantStatus(tenantId: string, status: string): Promise<void> {
    await this.client.patch(`/api/admin/tenants/${tenantId}/status`, { status });
  }
}

// Export singleton instance
export const platformService = new PlatformService();
