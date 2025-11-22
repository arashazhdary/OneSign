import { ApiClient, apiClient } from '../api-client';

/**
 * Lifecycle Service
 * Handles identity lifecycle management
 */
export class LifecycleService {
  constructor(private client: ApiClient = apiClient) {}

  // Access Packages

  /**
   * Get access packages
   */
  async getAccessPackages(tenantId: string): Promise<any[]> {
    const response = await this.client.get<any[]>('/api/tenant/lifecycle/access-packages', { tenantId });
    return response.data;
  }

  /**
   * Create access package
   */
  async createAccessPackage(tenantId: string, data: any): Promise<any> {
    const response = await this.client.post<any>('/api/tenant/lifecycle/access-packages', { ...data, tenantId });
    return response.data;
  }

  // User Timeline

  /**
   * Get user lifecycle timeline
   */
  async getUserTimeline(tenantId: string, userId: string): Promise<any[]> {
    const response = await this.client.get<any[]>(`/api/tenant/lifecycle/users/${userId}/timeline`, { tenantId });
    return response.data;
  }

  // Lifecycle Events

  /**
   * Get lifecycle events
   */
  async getLifecycleEvents(tenantId: string, params?: any): Promise<any[]> {
    const response = await this.client.get<any[]>('/api/tenant/lifecycle/events', { tenantId, ...params });
    return response.data;
  }

  // HR Sync

  /**
   * Sync with HR system
   */
  async syncWithHR(tenantId: string): Promise<any> {
    const response = await this.client.post<any>('/api/tenant/lifecycle/hr/sync', { tenantId });
    return response.data;
  }

  // Lifecycle Policies

  /**
   * Get lifecycle policies
   */
  async getLifecyclePolicies(tenantId: string): Promise<any[]> {
    const response = await this.client.get<any[]>('/api/tenant/lifecycle/policies', { tenantId });
    return response.data;
  }

  /**
   * Create lifecycle policy
   */
  async createLifecyclePolicy(tenantId: string, data: any): Promise<any> {
    const response = await this.client.post<any>('/api/tenant/lifecycle/policies', { ...data, tenantId });
    return response.data;
  }

  // Processing Status

  /**
   * Get lifecycle event processing status
   */
  async getProcessingStatus(tenantId: string): Promise<any> {
    const response = await this.client.get<any>('/api/tenant/lifecycle/processing-status', { tenantId });
    return response.data;
  }
}

// Export singleton instance
export const lifecycleService = new LifecycleService();
