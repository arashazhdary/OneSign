import { ApiClient, apiClient } from '../api-client';
import { PaginatedResponse } from '../types/common';
import {
  Application,
  GetApplicationsParams,
  CreateApplicationRequest,
  UpdateApplicationRequest,
  ApplicationAccess,
  GrantApplicationAccessRequest,
  ApplicationUsageStats,
  ApplicationRiskScore,
  ApplicationCatalogItem,
  ApplicationIntegration,
} from '../types/applications';

/**
 * Applications Service
 * Handles all application management operations
 */
export class ApplicationsService {
  constructor(private client: ApiClient = apiClient) {}

  /**
   * Get paginated list of applications
   */
  async getApplications(params: GetApplicationsParams): Promise<PaginatedResponse<Application>> {
    const response = await this.client.get<PaginatedResponse<Application>>(
      '/api/tenant/applications',
      params
    );
    return response.data;
  }

  /**
   * Get application by ID
   */
  async getApplicationById(tenantId: string, applicationId: string): Promise<Application> {
    const response = await this.client.get<Application>(
      `/api/tenant/applications/${applicationId}`,
      { tenantId }
    );
    return response.data;
  }

  /**
   * Create new application
   */
  async createApplication(data: CreateApplicationRequest): Promise<Application> {
    const response = await this.client.post<Application>('/api/tenant/applications', data);
    return response.data;
  }

  /**
   * Update application
   */
  async updateApplication(
    tenantId: string,
    applicationId: string,
    data: UpdateApplicationRequest
  ): Promise<Application> {
    const response = await this.client.put<Application>(
      `/api/tenant/applications/${applicationId}`,
      { ...data, tenantId }
    );
    return response.data;
  }

  /**
   * Delete application
   */
  async deleteApplication(tenantId: string, applicationId: string): Promise<void> {
    await this.client.delete(`/api/tenant/applications/${applicationId}`, {
      params: { tenantId },
    });
  }

  /**
   * Enable application
   */
  async enableApplication(tenantId: string, applicationId: string): Promise<void> {
    await this.client.post(`/api/tenant/applications/${applicationId}/enable`, { tenantId });
  }

  /**
   * Disable application
   */
  async disableApplication(tenantId: string, applicationId: string): Promise<void> {
    await this.client.post(`/api/tenant/applications/${applicationId}/disable`, { tenantId });
  }

  // Application Access Management

  /**
   * Get application access list
   */
  async getApplicationAccess(
    tenantId: string,
    applicationId: string
  ): Promise<ApplicationAccess[]> {
    const response = await this.client.get<ApplicationAccess[]>(
      `/api/tenant/applications/${applicationId}/access`,
      { tenantId }
    );
    return response.data;
  }

  /**
   * Grant application access to user
   */
  async grantAccess(
    tenantId: string,
    applicationId: string,
    data: GrantApplicationAccessRequest
  ): Promise<void> {
    await this.client.post(`/api/tenant/applications/${applicationId}/access/grant`, {
      ...data,
      tenantId,
    });
  }

  /**
   * Revoke application access from user
   */
  async revokeAccess(tenantId: string, applicationId: string, userId: string): Promise<void> {
    await this.client.post(`/api/tenant/applications/${applicationId}/access/revoke`, {
      tenantId,
      userId,
    });
  }

  /**
   * Bulk grant access
   */
  async bulkGrantAccess(
    tenantId: string,
    applicationId: string,
    userIds: string[],
    roles?: string[]
  ): Promise<{ successCount: number; failureCount: number }> {
    const response = await this.client.post<{ successCount: number; failureCount: number }>(
      `/api/tenant/applications/${applicationId}/access/bulk-grant`,
      { tenantId, userIds, roles }
    );
    return response.data;
  }

  /**
   * Bulk revoke access
   */
  async bulkRevokeAccess(
    tenantId: string,
    applicationId: string,
    userIds: string[]
  ): Promise<{ successCount: number; failureCount: number }> {
    const response = await this.client.post<{ successCount: number; failureCount: number }>(
      `/api/tenant/applications/${applicationId}/access/bulk-revoke`,
      { tenantId, userIds }
    );
    return response.data;
  }

  // Application Integrations

  /**
   * Get application integrations
   */
  async getIntegrations(
    tenantId: string,
    applicationId: string
  ): Promise<ApplicationIntegration[]> {
    const response = await this.client.get<ApplicationIntegration[]>(
      `/api/tenant/applications/${applicationId}/integrations`,
      { tenantId }
    );
    return response.data;
  }

  /**
   * Configure integration
   */
  async configureIntegration(
    tenantId: string,
    applicationId: string,
    type: string,
    config: Record<string, any>
  ): Promise<ApplicationIntegration> {
    const response = await this.client.post<ApplicationIntegration>(
      `/api/tenant/applications/${applicationId}/integrations`,
      { tenantId, type, config }
    );
    return response.data;
  }

  /**
   * Update integration
   */
  async updateIntegration(
    tenantId: string,
    applicationId: string,
    integrationId: string,
    config: Record<string, any>
  ): Promise<ApplicationIntegration> {
    const response = await this.client.put<ApplicationIntegration>(
      `/api/tenant/applications/${applicationId}/integrations/${integrationId}`,
      { tenantId, config }
    );
    return response.data;
  }

  /**
   * Delete integration
   */
  async deleteIntegration(
    tenantId: string,
    applicationId: string,
    integrationId: string
  ): Promise<void> {
    await this.client.delete(
      `/api/tenant/applications/${applicationId}/integrations/${integrationId}`,
      { params: { tenantId } }
    );
  }

  /**
   * Test integration
   */
  async testIntegration(
    tenantId: string,
    applicationId: string,
    integrationId: string
  ): Promise<{ success: boolean; message?: string }> {
    const response = await this.client.post<{ success: boolean; message?: string }>(
      `/api/tenant/applications/${applicationId}/integrations/${integrationId}/test`,
      { tenantId }
    );
    return response.data;
  }

  /**
   * Sync integration
   */
  async syncIntegration(
    tenantId: string,
    applicationId: string,
    integrationId: string
  ): Promise<void> {
    await this.client.post(
      `/api/tenant/applications/${applicationId}/integrations/${integrationId}/sync`,
      { tenantId }
    );
  }

  // Application Analytics

  /**
   * Get application usage statistics
   */
  async getUsageStats(
    tenantId: string,
    applicationId: string,
    from?: string,
    to?: string
  ): Promise<ApplicationUsageStats> {
    const response = await this.client.get<ApplicationUsageStats>(
      `/api/tenant/applications/${applicationId}/stats`,
      { tenantId, from, to }
    );
    return response.data;
  }

  /**
   * Get application risk score
   */
  async getRiskScore(tenantId: string, applicationId: string): Promise<ApplicationRiskScore> {
    const response = await this.client.get<ApplicationRiskScore>(
      `/api/tenant/applications/${applicationId}/risk-score`,
      { tenantId }
    );
    return response.data;
  }

  /**
   * Export application data
   */
  async exportApplicationData(
    tenantId: string,
    applicationId: string,
    format: 'csv' | 'xlsx' | 'json'
  ): Promise<Blob> {
    const response = await this.client.get<Blob>(
      `/api/tenant/applications/${applicationId}/export`,
      { tenantId, format }
    );
    return response.data;
  }

  // Application Catalog

  /**
   * Get application catalog
   */
  async getCatalog(category?: string): Promise<ApplicationCatalogItem[]> {
    const response = await this.client.get<ApplicationCatalogItem[]>(
      '/api/tenant/applications/catalog',
      { category }
    );
    return response.data;
  }

  /**
   * Get catalog categories
   */
  async getCatalogCategories(): Promise<string[]> {
    const response = await this.client.get<string[]>('/api/tenant/applications/catalog/categories');
    return response.data;
  }

  /**
   * Add application from catalog
   */
  async addFromCatalog(tenantId: string, catalogItemId: string): Promise<Application> {
    const response = await this.client.post<Application>(
      '/api/tenant/applications/catalog/add',
      { tenantId, catalogItemId }
    );
    return response.data;
  }

  // Redirect URIs Management

  /**
   * Add redirect URI to application
   */
  async addRedirectUri(tenantId: string, applicationId: string, uri: string): Promise<any> {
    const response = await this.client.post(
      `/api/tenant/applications/${applicationId}/redirect-uris`,
      { tenantId, uri }
    );
    return response.data;
  }

  /**
   * Remove redirect URI from application
   */
  async removeRedirectUri(tenantId: string, redirectUriId: string): Promise<void> {
    await this.client.delete(`/api/tenant/applications/redirect-uris/${redirectUriId}`, {
      params: { tenantId },
    });
  }

  // Client Secrets Management

  /**
   * Add client secret to application
   */
  async addClientSecret(
    tenantId: string,
    applicationId: string,
    description: string
  ): Promise<any> {
    const response = await this.client.post(
      `/api/tenant/applications/${applicationId}/secrets`,
      { tenantId, description }
    );
    return response.data;
  }

  /**
   * Remove client secret from application
   */
  async removeClientSecret(tenantId: string, secretId: string): Promise<void> {
    await this.client.delete(`/api/tenant/applications/secrets/${secretId}`, {
      params: { tenantId },
    });
  }

  // Organization Units Assignment

  /**
   * Get application's assigned org units
   */
  async getApplicationOrgUnits(tenantId: string, applicationId: string): Promise<any> {
    const response = await this.client.get(
      `/api/tenant/applications/${applicationId}/org-units`,
      { tenantId }
    );
    return response.data;
  }

  /**
   * Assign org units to application
   */
  async assignOrgUnits(
    tenantId: string,
    applicationId: string,
    orgUnitIds: string[]
  ): Promise<void> {
    await this.client.put(`/api/tenant/applications/${applicationId}/org-units`, {
      tenantId,
      orgUnitIds,
    });
  }
}

// Export singleton instance
export const applicationsService = new ApplicationsService();
