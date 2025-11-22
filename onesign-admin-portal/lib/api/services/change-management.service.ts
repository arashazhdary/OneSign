import { ApiClient, apiClient } from '../api-client';

/**
 * Change Management Service
 * Handles all change management operations for both tenant and global levels
 */
export class ChangeManagementService {
  constructor(private client: ApiClient = apiClient) {}

  // Global Change Management

  /**
   * Get all change sets (global)
   */
  async getGlobalChangeSets(params: { page: number; pageSize: number; status?: string; tenantId?: string }): Promise<any> {
    const response = await this.client.get<any>('/api/global/change-management/change-sets', params);
    return response.data;
  }

  /**
   * Get change set by ID (global)
   */
  async getGlobalChangeSet(id: string): Promise<any> {
    const response = await this.client.get<any>(`/api/global/change-sets/${id}`);
    return response.data;
  }

  /**
   * Simulate change set (global)
   */
  async simulateGlobalChangeSet(id: string, userId: string): Promise<any> {
    const response = await this.client.post<any>(`/api/global/change-sets/${id}/simulate`, { userId });
    return response.data;
  }

  /**
   * Get execution log (global)
   */
  async getGlobalExecutionLog(id: string): Promise<any[]> {
    const response = await this.client.get<any[]>(`/api/global/change-sets/${id}/execution-log`);
    return response.data;
  }

  /**
   * Schedule change set (global)
   */
  async scheduleGlobalChangeSet(id: string, data: any): Promise<void> {
    await this.client.post(`/api/global/change-sets/${id}/schedule`, data);
  }

  /**
   * Apply change set (global)
   */
  async applyGlobalChangeSet(id: string, userId: string): Promise<void> {
    await this.client.post(`/api/global/change-sets/${id}/apply`, { userId });
  }

  /**
   * Rollback change set (global)
   */
  async rollbackGlobalChangeSet(id: string, userId: string): Promise<void> {
    await this.client.post(`/api/global/change-sets/${id}/rollback`, { userId });
  }

  /**
   * Approve change set (global)
   */
  async approveGlobalChangeSet(id: string, userId: string, comment: string): Promise<void> {
    await this.client.post(`/api/global/change-sets/${id}/approve`, { userId, comment });
  }

  /**
   * Reject change set (global)
   */
  async rejectGlobalChangeSet(id: string, userId: string, reason: string): Promise<void> {
    await this.client.post(`/api/global/change-sets/${id}/reject`, { userId, reason });
  }

  /**
   * Submit change set (global)
   */
  async submitGlobalChangeSet(id: string, userId: string): Promise<void> {
    await this.client.post(`/api/global/change-sets/${id}/submit`, { userId });
  }

  /**
   * Get approvals (global)
   */
  async getGlobalApprovals(id: string): Promise<any[]> {
    const response = await this.client.get<any[]>(`/api/global/change-sets/${id}/approvals`);
    return response.data;
  }

  /**
   * Get impact analysis (global)
   */
  async getGlobalImpactAnalysis(id: string): Promise<any> {
    const response = await this.client.get<any>(`/api/global/change-sets/${id}/impact`);
    return response.data;
  }

  /**
   * Get change set templates (global)
   */
  async getGlobalTemplates(): Promise<any[]> {
    const response = await this.client.get<any[]>('/api/global/changesets/templates');
    return response.data;
  }

  /**
   * Get approval rules (global)
   */
  async getGlobalApprovalRules(): Promise<any[]> {
    const response = await this.client.get<any[]>('/api/global/change-management/approval-rules');
    return response.data;
  }

  /**
   * Create approval rule (global)
   */
  async createGlobalApprovalRule(data: any): Promise<any> {
    const response = await this.client.post<any>('/api/global/change-management/approval-rules', data);
    return response.data;
  }

  /**
   * Toggle approval rule (global)
   */
  async toggleGlobalApprovalRule(id: string, userId: string, isActive: boolean): Promise<void> {
    await this.client.post(`/api/global/change-management/approval-rules/${id}/toggle`, { userId, isActive });
  }

  /**
   * Enforce approval rule (global)
   */
  async enforceGlobalApprovalRule(id: string, userId: string, isEnforced: boolean): Promise<void> {
    await this.client.post(`/api/global/change-management/approval-rules/${id}/enforce`, { userId, isEnforced });
  }

  /**
   * Get change history (global)
   */
  async getGlobalChangeHistory(params: { page: number; pageSize: number; tenantId?: string }): Promise<any> {
    const response = await this.client.get<any>('/api/global/change-management/history', params);
    return response.data;
  }
}

// Export singleton instance
export const changeManagementService = new ChangeManagementService();
