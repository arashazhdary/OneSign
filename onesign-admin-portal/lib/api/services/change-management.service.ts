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

  // Tenant Change Management

  /**
   * Get all change sets (tenant)
   */
  async getTenantChangeSets(tenantId: string, params: { page: number; pageSize: number; status?: string }): Promise<any> {
    const response = await this.client.get<any>('/api/tenant/change-management/change-sets', {
      tenantId,
      ...params
    });
    return response.data;
  }

  /**
   * Get pending approvals (tenant)
   */
  async getTenantPendingApprovals(tenantId: string, userId: string, params: { page: number; pageSize: number }): Promise<any> {
    const response = await this.client.get<any>('/api/tenant/change-management/pending-approvals', {
      tenantId,
      userId,
      ...params
    });
    return response.data;
  }

  /**
   * Get approval rules (tenant)
   */
  async getTenantApprovalRules(tenantId: string): Promise<any[]> {
    const response = await this.client.get<any[]>('/api/tenant/change-management/approval-rules', { tenantId });
    return response.data;
  }

  /**
   * Get change set by ID (tenant)
   */
  async getTenantChangeSet(tenantId: string, id: string): Promise<any> {
    const response = await this.client.get<any>(`/api/tenant/changesets/${id}`, { tenantId });
    return response.data;
  }

  /**
   * Simulate change set (tenant)
   */
  async simulateTenantChangeSet(tenantId: string, id: string): Promise<any> {
    const response = await this.client.post<any>(`/api/tenant/changesets/${id}/simulate`, { tenantId });
    return response.data;
  }

  /**
   * Get execution log (tenant)
   */
  async getTenantExecutionLog(tenantId: string, id: string): Promise<any[]> {
    const response = await this.client.get<any[]>(`/api/tenant/changesets/${id}/execution-log`, { tenantId });
    return response.data;
  }

  /**
   * Schedule change set (tenant)
   */
  async scheduleTenantChangeSet(tenantId: string, id: string, userId: string, data: any): Promise<void> {
    await this.client.post(`/api/tenant/change-sets/${id}/schedule`, {
      tenantId,
      userId,
      ...data
    });
  }

  /**
   * Execute change set (tenant)
   */
  async executeTenantChangeSet(tenantId: string, id: string, userId: string): Promise<void> {
    await this.client.post(`/api/tenant/changesets/${id}/execute`, { tenantId, userId });
  }

  /**
   * Rollback change set (tenant)
   */
  async rollbackTenantChangeSet(tenantId: string, id: string, userId: string): Promise<void> {
    await this.client.post(`/api/tenant/change-sets/${id}/rollback`, { tenantId, userId });
  }

  /**
   * Approve change set (tenant)
   */
  async approveTenantChangeSet(tenantId: string, id: string, userId: string, comment: string): Promise<void> {
    await this.client.post(`/api/tenant/change-sets/${id}/approve`, { tenantId, userId, comment });
  }

  /**
   * Reject change set (tenant)
   */
  async rejectTenantChangeSet(tenantId: string, id: string, userId: string, reason: string): Promise<void> {
    await this.client.post(`/api/tenant/change-sets/${id}/reject`, { tenantId, userId, reason });
  }

  /**
   * Get approvals (tenant)
   */
  async getTenantApprovals(tenantId: string, id: string): Promise<any[]> {
    const response = await this.client.get<any[]>(`/api/tenant/changesets/${id}/approvals`, { tenantId });
    return response.data;
  }

  /**
   * Get impact analysis (tenant)
   */
  async getTenantImpactAnalysis(tenantId: string, id: string): Promise<any> {
    const response = await this.client.get<any>(`/api/tenant/changesets/${id}/impact`, { tenantId });
    return response.data;
  }

  /**
   * Clone change set (tenant)
   */
  async cloneTenantChangeSet(tenantId: string, id: string, userId: string, name: string): Promise<void> {
    await this.client.post(`/api/tenant/changesets/${id}/clone`, { tenantId, userId, name });
  }

  /**
   * Get change set templates (tenant)
   */
  async getTenantTemplates(tenantId: string): Promise<any[]> {
    const response = await this.client.get<any[]>('/api/tenant/changesets/templates', { tenantId });
    return response.data;
  }

  /**
   * Create change set (tenant)
   */
  async createTenantChangeSet(tenantId: string, userId: string, data: any): Promise<any> {
    const response = await this.client.post<any>('/api/tenant/change-management/change-sets', {
      tenantId,
      userId,
      ...data
    });
    return response.data;
  }

  /**
   * Submit change set for review (tenant)
   */
  async submitTenantChangeSet(tenantId: string, id: string, userId: string): Promise<void> {
    await this.client.post(`/api/tenant/change-sets/${id}/submit`, { tenantId, userId });
  }

  /**
   * Approve approval request (tenant)
   */
  async approveTenantApproval(tenantId: string, approvalId: string, userId: string, comment: string): Promise<void> {
    await this.client.post(`/api/tenant/change-management/approvals/${approvalId}/approve`, {
      tenantId,
      userId,
      comment
    });
  }

  /**
   * Reject approval request (tenant)
   */
  async rejectTenantApproval(tenantId: string, approvalId: string, userId: string, reason: string): Promise<void> {
    await this.client.post(`/api/tenant/change-management/approvals/${approvalId}/reject`, {
      tenantId,
      userId,
      reason
    });
  }

  /**
   * Apply change set (tenant)
   */
  async applyTenantChangeSet(tenantId: string, id: string, userId: string): Promise<void> {
    await this.client.post(`/api/tenant/change-sets/${id}/apply`, { tenantId, userId });
  }

  /**
   * Delete change set (tenant)
   */
  async deleteTenantChangeSet(tenantId: string, id: string): Promise<void> {
    await this.client.delete(`/api/tenant/change-management/change-sets/${id}`, { tenantId });
  }

  /**
   * Create approval rule (tenant)
   */
  async createTenantApprovalRule(tenantId: string, data: any): Promise<any> {
    const response = await this.client.post<any>('/api/tenant/change-management/approval-rules', {
      tenantId,
      ...data
    });
    return response.data;
  }

  /**
   * Toggle approval rule (tenant)
   */
  async toggleTenantApprovalRule(tenantId: string, id: string, isActive: boolean): Promise<void> {
    await this.client.post(`/api/tenant/change-management/approval-rules/${id}/toggle`, {
      tenantId,
      isActive
    });
  }
}

// Export singleton instance
export const changeManagementService = new ChangeManagementService();
