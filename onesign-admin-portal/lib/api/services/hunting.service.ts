import { ApiClient, apiClient } from '../api-client';

/**
 * Hunting Service
 * Handles threat hunting and saved queries
 */
export class HuntingService {
  constructor(private client: ApiClient = apiClient) {}

  // Global Hunting

  /**
   * Get global hunt run details
   */
  async getGlobalHuntRun(runId: string): Promise<any> {
    const response = await this.client.get<any>(`/api/global/hunting/hunt-runs/${runId}`);
    return response.data;
  }

  /**
   * Execute global query
   */
  async executeGlobalQuery(data: any): Promise<any> {
    const response = await this.client.post<any>('/api/global/hunting/query', data);
    return response.data;
  }

  /**
   * Get global saved queries
   */
  async getGlobalSavedQueries(params?: any): Promise<any[]> {
    const response = await this.client.get<any[]>('/api/global/hunting/saved-queries', params);
    return response.data;
  }

  /**
   * Get global saved query by ID
   */
  async getGlobalSavedQuery(id: string): Promise<any> {
    const response = await this.client.get<any>(`/api/global/hunting/saved-queries/${id}`);
    return response.data;
  }

  /**
   * Create global saved query
   */
  async createGlobalSavedQuery(data: any): Promise<any> {
    const response = await this.client.post<any>('/api/global/hunting/saved-queries', data);
    return response.data;
  }

  /**
   * Update global saved query
   */
  async updateGlobalSavedQuery(id: string, data: any): Promise<any> {
    const response = await this.client.put<any>(`/api/global/hunting/saved-queries/${id}`, data);
    return response.data;
  }

  /**
   * Delete global saved query
   */
  async deleteGlobalSavedQuery(id: string): Promise<void> {
    await this.client.delete(`/api/global/hunting/saved-queries/${id}`);
  }

  /**
   * Get global scheduled hunts
   */
  async getGlobalScheduledHunts(params?: any): Promise<any[]> {
    const response = await this.client.get<any[]>('/api/global/hunting/scheduled-hunts', params);
    return response.data;
  }

  /**
   * Get global scheduled hunt by ID
   */
  async getGlobalScheduledHunt(id: string): Promise<any> {
    const response = await this.client.get<any>(`/api/global/hunting/scheduled-hunts/${id}`);
    return response.data;
  }

  /**
   * Create global scheduled hunt
   */
  async createGlobalScheduledHunt(data: any): Promise<any> {
    const response = await this.client.post<any>('/api/global/hunting/scheduled-hunts', data);
    return response.data;
  }

  /**
   * Update global scheduled hunt
   */
  async updateGlobalScheduledHunt(id: string, data: any): Promise<any> {
    const response = await this.client.put<any>(`/api/global/hunting/scheduled-hunts/${id}`, data);
    return response.data;
  }

  /**
   * Delete global scheduled hunt
   */
  async deleteGlobalScheduledHunt(id: string): Promise<void> {
    await this.client.delete(`/api/global/hunting/scheduled-hunts/${id}`);
  }

  /**
   * Get global hunt runs for scheduled hunt
   */
  async getGlobalHuntRuns(id: string, params?: any): Promise<any[]> {
    const response = await this.client.get<any[]>(`/api/global/hunting/scheduled-hunts/${id}/runs`, params);
    return response.data;
  }

  // Tenant Hunting

  /**
   * Get tenant hunt run details
   */
  async getTenantHuntRun(tenantId: string, runId: string): Promise<any> {
    const response = await this.client.get<any>(`/api/tenant/hunting/hunt-runs/${runId}`, { tenantId });
    return response.data;
  }

  /**
   * Execute tenant query (OQL)
   */
  async executeTenantQuery(tenantId: string, data: any): Promise<any> {
    const response = await this.client.post<any>('/api/tenant/hunting/query', { ...data, tenantId });
    return response.data;
  }

  /**
   * Get tenant saved queries
   */
  async getTenantSavedQueries(tenantId: string, params?: any): Promise<any[]> {
    const response = await this.client.get<any[]>('/api/tenant/hunting/saved-queries', { tenantId, ...params });
    return response.data;
  }

  /**
   * Get tenant saved query by ID
   */
  async getTenantSavedQuery(tenantId: string, id: string): Promise<any> {
    const response = await this.client.get<any>(`/api/tenant/hunting/saved-queries/${id}`, { tenantId });
    return response.data;
  }

  /**
   * Create tenant saved query
   */
  async createTenantSavedQuery(tenantId: string, data: any): Promise<any> {
    const response = await this.client.post<any>('/api/tenant/hunting/saved-queries', { ...data, tenantId });
    return response.data;
  }

  /**
   * Update tenant saved query
   */
  async updateTenantSavedQuery(tenantId: string, id: string, data: any): Promise<any> {
    const response = await this.client.put<any>(`/api/tenant/hunting/saved-queries/${id}`, { ...data, tenantId });
    return response.data;
  }

  /**
   * Delete tenant saved query
   */
  async deleteTenantSavedQuery(tenantId: string, id: string): Promise<void> {
    await this.client.delete(`/api/tenant/hunting/saved-queries/${id}`, { params: { tenantId } });
  }

  /**
   * Get tenant scheduled hunts
   */
  async getTenantScheduledHunts(tenantId: string, params?: any): Promise<any[]> {
    const response = await this.client.get<any[]>('/api/tenant/hunting/scheduled-hunts', { tenantId, ...params });
    return response.data;
  }

  /**
   * Get tenant scheduled hunt by ID
   */
  async getTenantScheduledHunt(tenantId: string, id: string): Promise<any> {
    const response = await this.client.get<any>(`/api/tenant/hunting/scheduled-hunts/${id}`, { tenantId });
    return response.data;
  }

  /**
   * Create tenant scheduled hunt
   */
  async createTenantScheduledHunt(tenantId: string, data: any): Promise<any> {
    const response = await this.client.post<any>('/api/tenant/hunting/scheduled-hunts', { ...data, tenantId });
    return response.data;
  }

  /**
   * Update tenant scheduled hunt
   */
  async updateTenantScheduledHunt(tenantId: string, id: string, data: any): Promise<any> {
    const response = await this.client.put<any>(`/api/tenant/hunting/scheduled-hunts/${id}`, { ...data, tenantId });
    return response.data;
  }

  /**
   * Delete tenant scheduled hunt
   */
  async deleteTenantScheduledHunt(tenantId: string, id: string): Promise<void> {
    await this.client.delete(`/api/tenant/hunting/scheduled-hunts/${id}`, { params: { tenantId } });
  }

  /**
   * Get tenant hunt runs for scheduled hunt
   */
  async getTenantHuntRuns(tenantId: string, id: string, params?: any): Promise<any[]> {
    const response = await this.client.get<any[]>(`/api/tenant/hunting/scheduled-hunts/${id}/runs`, { tenantId, ...params });
    return response.data;
  }
}

// Export singleton instance
export const huntingService = new HuntingService();
