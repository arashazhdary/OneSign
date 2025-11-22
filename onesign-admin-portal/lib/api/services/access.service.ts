import { ApiClient, apiClient } from '../api-client';

/**
 * Access Management Service
 * Handles access requests and privileged access management
 */
export class AccessService {
  constructor(private client: ApiClient = apiClient) {}

  // Access Requests

  /**
   * Get access requests
   */
  async getAccessRequests(tenantId: string, params?: any): Promise<any[]> {
    const response = await this.client.get<any[]>('/api/tenant/access-requests', { tenantId, ...params });
    return response.data;
  }

  /**
   * Create access request
   */
  async createAccessRequest(tenantId: string, data: any): Promise<any> {
    const response = await this.client.post<any>('/api/tenant/access-requests', { ...data, tenantId });
    return response.data;
  }

  /**
   * Approve or reject access request
   */
  async processAccessRequest(tenantId: string, requestId: string, decision: 'approve' | 'reject', notes?: string): Promise<void> {
    await this.client.post(`/api/tenant/access-requests/${requestId}/approve`, {
      tenantId,
      decision,
      notes,
    });
  }

  // Privileged Access Management

  /**
   * Get privileged access dashboard
   */
  async getPrivilegedAccessDashboard(tenantId: string): Promise<any> {
    const response = await this.client.get<any>('/api/tenant/privileged-access/dashboard', { tenantId });
    return response.data;
  }

  /**
   * Get break-glass accounts
   */
  async getBreakGlassAccounts(tenantId: string): Promise<any[]> {
    const response = await this.client.get<any[]>('/api/tenant/privileged-access/break-glass', { tenantId });
    return response.data;
  }

  /**
   * Create break-glass account
   */
  async createBreakGlassAccount(tenantId: string, data: any): Promise<any> {
    const response = await this.client.post<any>('/api/tenant/privileged-access/break-glass', { ...data, tenantId });
    return response.data;
  }

  /**
   * Activate break-glass account
   */
  async activateBreakGlassAccount(tenantId: string, accountId: string): Promise<void> {
    await this.client.post(`/api/tenant/privileged-access/break-glass/${accountId}/activate`, { tenantId });
  }

  /**
   * Request JIT access
   */
  async requestJITAccess(tenantId: string, data: any): Promise<any> {
    const response = await this.client.post<any>('/api/tenant/privileged-access/jit/request', { ...data, tenantId });
    return response.data;
  }

  /**
   * Get active JIT grants
   */
  async getJITGrants(tenantId: string): Promise<any[]> {
    const response = await this.client.get<any[]>('/api/tenant/privileged-access/jit/grants', { tenantId });
    return response.data;
  }

  /**
   * Revoke JIT grant
   */
  async revokeJITGrant(tenantId: string, grantId: string): Promise<void> {
    await this.client.post(`/api/tenant/privileged-access/jit/grants/${grantId}/revoke`, { tenantId });
  }

  /**
   * Get privileged access sessions
   */
  async getPrivilegedSessions(tenantId: string, status?: string): Promise<any[]> {
    const response = await this.client.get<any[]>('/api/tenant/privileged-access/sessions', { tenantId, status });
    return response.data;
  }

  /**
   * Revoke privileged session
   */
  async revokePrivilegedSession(tenantId: string, sessionId: string): Promise<void> {
    await this.client.post(`/api/tenant/privileged-access/sessions/${sessionId}/revoke`, { tenantId });
  }

  /**
   * Get privileged access requests
   */
  async getPrivilegedAccessRequests(tenantId: string): Promise<any[]> {
    const response = await this.client.get<any[]>('/api/tenant/privileged-access/requests', { tenantId });
    return response.data;
  }
}

// Export singleton instance
export const accessService = new AccessService();
