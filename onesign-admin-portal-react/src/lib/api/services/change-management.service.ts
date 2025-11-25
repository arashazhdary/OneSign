import apiClient from '@/services/apiClient';

// Types based on OneSign Technical Specification
export interface ChangeSetDto {
  id: string;
  title: string;
  description?: string;
  status: 'Draft' | 'Submitted' | 'Approved' | 'Rejected' | 'Applied' | 'Rolledback';
  type: string;
  targetType?: string;
  targetId?: string;
  changes?: ChangeItemDto[];
  createdAt: string;
  createdBy: string;
  submittedAt?: string;
  approvedAt?: string;
  approvedBy?: string;
  appliedAt?: string;
  rollbackedAt?: string;
  rejectionReason?: string;
}

export interface ChangeItemDto {
  field: string;
  oldValue?: any;
  newValue?: any;
  action: 'Create' | 'Update' | 'Delete';
}

export interface ImpactAnalysisDto {
  affectedResources: number;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  estimatedDowntime?: string;
  warnings?: string[];
  dependencies?: string[];
}

export interface SimulationResultDto {
  success: boolean;
  errors?: string[];
  warnings?: string[];
  preview?: any;
}

// Change Management Service - Based on /api/tenant/changesets spec
export const changeManagementService = {
  // GET /api/tenant/changesets
  getChangeSets: async (params?: { status?: string; page?: number; pageSize?: number }): Promise<ChangeSetDto[]> => {
    try {
      const response = await apiClient.get('/api/tenant/changesets', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch change sets:', error);
      return [];
    }
  },

  // GET /api/tenant/changesets/{id}
  getChangeSetById: async (changesetId: string): Promise<ChangeSetDto | null> => {
    try {
      const response = await apiClient.get(`/api/tenant/changesets/${changesetId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch change set:', error);
      return null;
    }
  },

  // POST /api/tenant/changesets
  createChangeSet: async (data: Partial<ChangeSetDto>): Promise<ChangeSetDto> => {
    try {
      const response = await apiClient.post('/api/tenant/changesets', data);
      return response.data;
    } catch (error) {
      console.error('Failed to create change set:', error);
      throw error;
    }
  },

  // POST /api/tenant/changesets/{id}/submit
  submitChangeSet: async (changesetId: string): Promise<ChangeSetDto> => {
    try {
      const response = await apiClient.post(`/api/tenant/changesets/${changesetId}/submit`);
      return response.data;
    } catch (error) {
      console.error('Failed to submit change set:', error);
      throw error;
    }
  },

  // POST /api/tenant/changesets/{id}/approve
  approveChangeSet: async (changesetId: string, comments?: string): Promise<ChangeSetDto> => {
    try {
      const response = await apiClient.post(`/api/tenant/changesets/${changesetId}/approve`, { comments });
      return response.data;
    } catch (error) {
      console.error('Failed to approve change set:', error);
      throw error;
    }
  },

  // POST /api/tenant/changesets/{id}/reject
  rejectChangeSet: async (changesetId: string, reason: string): Promise<ChangeSetDto> => {
    try {
      const response = await apiClient.post(`/api/tenant/changesets/${changesetId}/reject`, { reason });
      return response.data;
    } catch (error) {
      console.error('Failed to reject change set:', error);
      throw error;
    }
  },

  // POST /api/tenant/changesets/{id}/apply
  applyChangeSet: async (changesetId: string): Promise<ChangeSetDto> => {
    try {
      const response = await apiClient.post(`/api/tenant/changesets/${changesetId}/apply`);
      return response.data;
    } catch (error) {
      console.error('Failed to apply change set:', error);
      throw error;
    }
  },

  // POST /api/tenant/changesets/{id}/rollback
  rollbackChangeSet: async (changesetId: string): Promise<ChangeSetDto> => {
    try {
      const response = await apiClient.post(`/api/tenant/changesets/${changesetId}/rollback`);
      return response.data;
    } catch (error) {
      console.error('Failed to rollback change set:', error);
      throw error;
    }
  },

  // GET /api/tenant/changesets/{id}/simulate
  simulateChangeSet: async (changesetId: string): Promise<SimulationResultDto> => {
    try {
      const response = await apiClient.get(`/api/tenant/changesets/${changesetId}/simulate`);
      return response.data;
    } catch (error) {
      console.error('Failed to simulate change set:', error);
      return { success: false, errors: ['Simulation failed'] };
    }
  },

  // GET /api/tenant/changesets/{id}/impact
  getImpactAnalysis: async (changesetId: string): Promise<ImpactAnalysisDto | null> => {
    try {
      const response = await apiClient.get(`/api/tenant/changesets/${changesetId}/impact`);
      return response.data;
    } catch (error) {
      console.error('Failed to get impact analysis:', error);
      return null;
    }
  },

  // Backwards compatibility aliases
  getChangeRequests: async (params?: any) => changeManagementService.getChangeSets(params),
  getChangeRequestById: async (requestId: string) => changeManagementService.getChangeSetById(requestId),
  createChangeRequest: async (data: any) => changeManagementService.createChangeSet(data),
  approveChangeRequest: async (requestId: string) => changeManagementService.approveChangeSet(requestId),
  rejectChangeRequest: async (requestId: string, reason: string) => changeManagementService.rejectChangeSet(requestId, reason),

  // Tenant-specific methods for backward compatibility with TenantChangeManagementPage
  getTenantChangeSets: async (tenantId: string, params?: any) => {
    try {
      const response = await apiClient.get('/api/tenant/changesets', { params });
      return { items: response.data, totalCount: response.data?.length || 0 };
    } catch (error) {
      console.error('Failed to fetch tenant change sets:', error);
      throw error;
    }
  },

  getTenantChangeSet: async (tenantId: string, id: string) => {
    return changeManagementService.getChangeSetById(id);
  },

  createTenantChangeSet: async (tenantId: string, userId: string, data: any) => {
    return changeManagementService.createChangeSet(data);
  },

  deleteTenantChangeSet: async (tenantId: string, id: string) => {
    try {
      await apiClient.delete(`/api/tenant/changesets/${id}`);
    } catch (error) {
      console.error('Failed to delete change set:', error);
      throw error;
    }
  },

  submitTenantChangeSet: async (tenantId: string, id: string, userId: string) => {
    return changeManagementService.submitChangeSet(id);
  },

  simulateTenantChangeSet: async (tenantId: string, id: string) => {
    return changeManagementService.simulateChangeSet(id);
  },

  getTenantExecutionLog: async (tenantId: string, id: string) => {
    try {
      const response = await apiClient.get(`/api/tenant/changesets/${id}/execution-log`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch execution log:', error);
      throw error;
    }
  },

  scheduleTenantChangeSet: async (tenantId: string, id: string, userId: string, data: any) => {
    try {
      const response = await apiClient.post(`/api/tenant/changesets/${id}/schedule`, data);
      return response.data;
    } catch (error) {
      console.error('Failed to schedule change set:', error);
      throw error;
    }
  },

  executeTenantChangeSet: async (tenantId: string, id: string, userId: string) => {
    return changeManagementService.applyChangeSet(id);
  },

  rollbackTenantChangeSet: async (tenantId: string, id: string, userId: string) => {
    return changeManagementService.rollbackChangeSet(id);
  },

  approveTenantChangeSet: async (tenantId: string, id: string, userId: string, comment: string) => {
    return changeManagementService.approveChangeSet(id, comment);
  },

  rejectTenantChangeSet: async (tenantId: string, id: string, userId: string, reason: string) => {
    return changeManagementService.rejectChangeSet(id, reason);
  },

  getTenantApprovals: async (tenantId: string, id: string) => {
    try {
      const response = await apiClient.get(`/api/tenant/changesets/${id}/approvals`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch approvals:', error);
      throw error;
    }
  },

  getTenantImpactAnalysis: async (tenantId: string, id: string) => {
    return changeManagementService.getImpactAnalysis(id);
  },

  cloneTenantChangeSet: async (tenantId: string, id: string, userId: string, newName: string) => {
    try {
      const response = await apiClient.post(`/api/tenant/changesets/${id}/clone`, { name: newName });
      return response.data;
    } catch (error) {
      console.error('Failed to clone change set:', error);
      throw error;
    }
  },

  getTenantTemplates: async (tenantId: string) => {
    try {
      const response = await apiClient.get('/api/tenant/changesets/templates');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch templates:', error);
      throw error;
    }
  },

  getTenantPendingApprovals: async (tenantId: string, userId: string, params?: any) => {
    try {
      const response = await apiClient.get('/api/tenant/changesets/pending-approvals', { params });
      return { items: response.data, totalCount: response.data?.length || 0 };
    } catch (error) {
      console.error('Failed to fetch pending approvals:', error);
      throw error;
    }
  },

  approveTenantApproval: async (tenantId: string, approvalId: string, userId: string, comment: string) => {
    try {
      const response = await apiClient.post(`/api/tenant/changesets/approvals/${approvalId}/approve`, { comment });
      return response.data;
    } catch (error) {
      console.error('Failed to approve:', error);
      throw error;
    }
  },

  rejectTenantApproval: async (tenantId: string, approvalId: string, userId: string, reason: string) => {
    try {
      const response = await apiClient.post(`/api/tenant/changesets/approvals/${approvalId}/reject`, { reason });
      return response.data;
    } catch (error) {
      console.error('Failed to reject:', error);
      throw error;
    }
  },

  applyTenantChangeSet: async (tenantId: string, id: string, userId: string) => {
    return changeManagementService.applyChangeSet(id);
  },

  getTenantApprovalRules: async (tenantId: string) => {
    try {
      const response = await apiClient.get('/api/tenant/changesets/approval-rules');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch approval rules:', error);
      throw error;
    }
  },

  createTenantApprovalRule: async (tenantId: string, data: any) => {
    try {
      const response = await apiClient.post('/api/tenant/changesets/approval-rules', data);
      return response.data;
    } catch (error) {
      console.error('Failed to create approval rule:', error);
      throw error;
    }
  },

  toggleTenantApprovalRule: async (tenantId: string, ruleId: string, isActive: boolean) => {
    try {
      const response = await apiClient.put(`/api/tenant/changesets/approval-rules/${ruleId}`, { isActive });
      return response.data;
    } catch (error) {
      console.error('Failed to toggle approval rule:', error);
      throw error;
    }
  },

  // ==================== GLOBAL CHANGE MANAGEMENT ====================
  getGlobalChangeSets: async (params?: any) => {
    try {
      const response = await apiClient.get('/api/global/changesets', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch global change sets:', error);
      return [];
    }
  },

  getGlobalChangeSet: async (id: string) => {
    try {
      const response = await apiClient.get(`/api/global/changesets/${id}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch global change set:', error);
      return null;
    }
  },

  simulateGlobalChangeSet: async (id: string) => {
    try {
      const response = await apiClient.get(`/api/global/changesets/${id}/simulate`);
      return response.data;
    } catch (error) {
      console.error('Failed to simulate global change set:', error);
      return { success: false, errors: ['Simulation failed'] };
    }
  },

  getGlobalExecutionLog: async (id: string) => {
    try {
      const response = await apiClient.get(`/api/global/changesets/${id}/execution-log`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch global execution log:', error);
      return [];
    }
  },

  scheduleGlobalChangeSet: async (id: string, data: any) => {
    const response = await apiClient.post(`/api/global/changesets/${id}/schedule`, data);
    return response.data;
  },

  applyGlobalChangeSet: async (id: string) => {
    const response = await apiClient.post(`/api/global/changesets/${id}/apply`);
    return response.data;
  },

  rollbackGlobalChangeSet: async (id: string) => {
    const response = await apiClient.post(`/api/global/changesets/${id}/rollback`);
    return response.data;
  },

  approveGlobalChangeSet: async (id: string, comment?: string) => {
    const response = await apiClient.post(`/api/global/changesets/${id}/approve`, { comment });
    return response.data;
  },

  rejectGlobalChangeSet: async (id: string, reason: string) => {
    const response = await apiClient.post(`/api/global/changesets/${id}/reject`, { reason });
    return response.data;
  },

  submitGlobalChangeSet: async (id: string) => {
    const response = await apiClient.post(`/api/global/changesets/${id}/submit`);
    return response.data;
  },

  getGlobalApprovals: async (id: string) => {
    try {
      const response = await apiClient.get(`/api/global/changesets/${id}/approvals`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch global approvals:', error);
      return [];
    }
  },

  getGlobalImpactAnalysis: async (id: string) => {
    try {
      const response = await apiClient.get(`/api/global/changesets/${id}/impact`);
      return response.data;
    } catch (error) {
      console.error('Failed to get global impact analysis:', error);
      return null;
    }
  },

  getGlobalTemplates: async () => {
    try {
      const response = await apiClient.get('/api/global/changesets/templates');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch global templates:', error);
      return [];
    }
  },

  getGlobalApprovalRules: async () => {
    try {
      const response = await apiClient.get('/api/global/changesets/approval-rules');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch global approval rules:', error);
      return [];
    }
  },

  createGlobalApprovalRule: async (data: any) => {
    const response = await apiClient.post('/api/global/changesets/approval-rules', data);
    return response.data;
  },

  toggleGlobalApprovalRule: async (ruleId: string, isActive: boolean) => {
    const response = await apiClient.put(`/api/global/changesets/approval-rules/${ruleId}`, { isActive });
    return response.data;
  },

  enforceGlobalApprovalRule: async (ruleId: string) => {
    const response = await apiClient.post(`/api/global/changesets/approval-rules/${ruleId}/enforce`);
    return response.data;
  },

  getGlobalChangeHistory: async (params?: any) => {
    try {
      const response = await apiClient.get('/api/global/changesets/history', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch global change history:', error);
      return [];
    }
  },
};

export default changeManagementService;
