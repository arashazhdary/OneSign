import apiClient from '@/services/apiClient';
import {
  buildCreatePayload,
  mapUiApprovals,
  mapUiChangeHistory,
  mapUiChangeSet,
  mapUiChangeSetDetails,
  mapUiExecutionLogs,
  mapUiImpact,
  mapUiSimulation,
  type ApiChangeSetDetailDto,
  type ApiChangeSetDto,
} from './change-management.mappers';

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

  // Tenant-specific methods for TenantChangeManagementPage
  getTenantChangeSets: async (tenantId: string, params?: { page?: number; pageSize?: number; status?: string }) => {
    const response = await apiClient.get<{ items: ApiChangeSetDto[]; totalCount: number }>(
      '/api/tenant/changesets',
      {
        params: {
          tenantId,
          page: params?.page ?? 1,
          pageSize: params?.pageSize ?? 20,
          status: params?.status,
        },
      }
    );
    const paged = response.data;
    return {
      items: (paged.items ?? []).map((dto) => mapUiChangeSet(dto)),
      totalCount: paged.totalCount ?? 0,
    };
  },

  getTenantChangeSet: async (tenantId: string, id: string) => {
    const response = await apiClient.get<ApiChangeSetDetailDto>(`/api/tenant/changesets/${id}`, {
      params: { tenantId },
    });
    return mapUiChangeSetDetails(response.data);
  },

  createTenantChangeSet: async (tenantId: string, userId: string, data: any) => {
    const response = await apiClient.post<ApiChangeSetDetailDto>(
      '/api/tenant/changesets',
      buildCreatePayload(tenantId, userId, data)
    );
    return mapUiChangeSet(response.data);
  },

  deleteTenantChangeSet: async (_tenantId: string, _id: string) => {
    throw new Error('Delete change set is not supported by the API for draft sets.');
  },

  submitTenantChangeSet: async (tenantId: string, id: string, userId: string) => {
    await apiClient.post(`/api/tenant/changesets/${id}/submit`, null, {
      params: { tenantId, userId },
    });
  },

  simulateTenantChangeSet: async (tenantId: string, id: string, userId?: string) => {
    const response = await apiClient.post(`/api/tenant/changesets/${id}/simulate`, null, {
      params: { tenantId, userId: userId ?? tenantId },
    });
    return mapUiSimulation(response.data);
  },

  getTenantExecutionLog: async (tenantId: string, id: string) => {
    const response = await apiClient.get(`/api/tenant/changesets/${id}/execution-log`, {
      params: { tenantId },
    });
    return mapUiExecutionLogs(response.data ?? []);
  },

  scheduleTenantChangeSet: async (tenantId: string, id: string, userId: string, data: { scheduledFor: string }) => {
    await apiClient.post(`/api/tenant/changesets/${id}/schedule`, {
      tenantId,
      userId,
      scheduledFor: data.scheduledFor,
    });
  },

  executeTenantChangeSet: async (tenantId: string, id: string, userId: string) => {
    await apiClient.post(`/api/tenant/changesets/${id}/apply`, null, {
      params: { tenantId, userId },
    });
  },

  rollbackTenantChangeSet: async (tenantId: string, id: string, userId: string, reason?: string) => {
    await apiClient.post(`/api/tenant/changesets/${id}/rollback`, {
      tenantId,
      userId,
      reason: reason ?? 'Rollback requested',
    });
  },

  approveTenantChangeSet: async (tenantId: string, id: string, userId: string, comment: string) => {
    await apiClient.post(`/api/tenant/changesets/${id}/approve`, {
      tenantId,
      userId,
      reason: comment,
    });
  },

  rejectTenantChangeSet: async (tenantId: string, id: string, userId: string, reason: string) => {
    await apiClient.post(`/api/tenant/changesets/${id}/reject`, {
      tenantId,
      userId,
      reason,
    });
  },

  getTenantApprovals: async (tenantId: string, id: string) => {
    const raw = await apiClient.get<ApiChangeSetDetailDto>(`/api/tenant/changesets/${id}`, {
      params: { tenantId },
    });
    return mapUiApprovals(raw.data.approvals ?? []);
  },

  getTenantImpactAnalysis: async (tenantId: string, id: string) => {
    const raw = await apiClient.get<ApiChangeSetDetailDto>(`/api/tenant/changesets/${id}`, {
      params: { tenantId },
    });
    if (raw.data.simulationResult) {
      return mapUiImpact(raw.data.simulationResult);
    }
    const simulated = await changeManagementService.simulateTenantChangeSet(tenantId, id, tenantId);
    return mapUiImpact({
      impactedUsersCount: 0,
      impactedAppsCount: 0,
      privilegedUsersAffectedCount: 0,
      policiesAffected: simulated.affectedEntities.filter((e) => e.type === 'Policy').map((e) => e.name),
      automationWorkflowsAffected: simulated.affectedEntities
        .filter((e) => e.type === 'Automation')
        .map((e) => e.name),
      riskDirection: 'Neutral',
      warnings: simulated.warnings,
      recommendations: [],
    });
  },

  cloneTenantChangeSet: async (tenantId: string, id: string, userId: string, newName: string) => {
    const source = await apiClient.get<ApiChangeSetDetailDto>(`/api/tenant/changesets/${id}`, {
      params: { tenantId },
    });
    const response = await apiClient.post<ApiChangeSetDetailDto>('/api/tenant/changesets', {
      tenantId,
      userId,
      title: newName,
      description: source.data.description,
      category: source.data.category,
      items: (source.data.items ?? []).map((item, index) => ({
        targetType: item.targetType,
        targetId: item.targetId,
        operation: item.operation,
        currentValueJson: item.currentValueJson,
        proposedValueJson: item.proposedValueJson,
        order: index,
      })),
    });
    return mapUiChangeSet(response.data);
  },

  getTenantTemplates: async (_tenantId: string) => {
    return [];
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
  getGlobalChangeSets: async (params?: { page?: number; pageSize?: number; status?: string }) => {
    const response = await apiClient.get<{ items: ApiChangeSetDto[]; totalCount: number }>(
      '/api/global/changesets',
      { params }
    );
    const paged = response.data;
    return {
      items: (paged.items ?? []).map((dto) => mapUiChangeSet(dto)),
      totalCount: paged.totalCount ?? 0,
    };
  },

  getGlobalChangeSet: async (id: string) => {
    const response = await apiClient.get<ApiChangeSetDetailDto>(`/api/global/changesets/${id}`);
    return mapUiChangeSetDetails(response.data);
  },

  simulateGlobalChangeSet: async (id: string, userId?: string) => {
    const response = await apiClient.post(`/api/global/changesets/${id}/simulate`, null, {
      params: { userId: userId ?? '00000000-0000-0000-0000-000000000001' },
    });
    return mapUiSimulation(response.data);
  },

  getGlobalExecutionLog: async (id: string) => {
    const response = await apiClient.get(`/api/global/changesets/${id}/execution-log`);
    return mapUiExecutionLogs(response.data ?? []);
  },

  scheduleGlobalChangeSet: async (id: string, data: any) => {
    const response = await apiClient.post(`/api/global/changesets/${id}/schedule`, data);
    return response.data;
  },

  applyGlobalChangeSet: async (id: string, userId: string) => {
    await apiClient.post(`/api/global/changesets/${id}/apply`, null, { params: { userId } });
  },

  rollbackGlobalChangeSet: async (id: string, userId: string, reason?: string) => {
    await apiClient.post(`/api/global/changesets/${id}/rollback`, {
      userId,
      reason: reason ?? 'Rollback requested',
    });
  },

  approveGlobalChangeSet: async (id: string, userId: string, comment?: string) => {
    await apiClient.post(`/api/global/changesets/${id}/approve`, { userId, reason: comment });
  },

  rejectGlobalChangeSet: async (id: string, userId: string, reason: string) => {
    await apiClient.post(`/api/global/changesets/${id}/reject`, { userId, reason });
  },

  submitGlobalChangeSet: async (id: string, userId: string) => {
    await apiClient.post(`/api/global/changesets/${id}/submit`, null, { params: { userId } });
  },

  getGlobalApprovals: async (id: string) => {
    const response = await apiClient.get<ApiChangeSetDetailDto>(`/api/global/changesets/${id}`);
    return mapUiApprovals(response.data.approvals ?? []);
  },

  getGlobalImpactAnalysis: async (id: string, userId?: string) => {
    const response = await apiClient.get<ApiChangeSetDetailDto>(`/api/global/changesets/${id}`);
    if (response.data.simulationResult) {
      return mapUiImpact(response.data.simulationResult);
    }
    const simulated = await changeManagementService.simulateGlobalChangeSet(id, userId);
    return mapUiImpact({
      impactedUsersCount: 0,
      impactedAppsCount: 0,
      privilegedUsersAffectedCount: 0,
      policiesAffected: simulated.affectedEntities.filter((e) => e.type === 'Policy').map((e) => e.name),
      automationWorkflowsAffected: simulated.affectedEntities
        .filter((e) => e.type === 'Automation')
        .map((e) => e.name),
      riskDirection: 'Neutral',
      warnings: simulated.warnings,
      recommendations: [],
    });
  },

  getGlobalTemplates: async () => [],

  getGlobalApprovalRules: async () => [],

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

  getGlobalChangeHistory: async (params?: { page?: number; pageSize?: number; status?: string }) => {
    const result = await changeManagementService.getGlobalChangeSets({
      page: params?.page,
      pageSize: params?.pageSize,
      status: params?.status ?? 'Applied',
    });
    return {
      items: result.items.map((item: ReturnType<typeof mapUiChangeSet>) => mapUiChangeHistory({
        id: item.id,
        title: item.name,
        description: item.description,
        category: item.targetModule,
        status: item.status,
        scopeId: item.tenantId,
        requestedByUserId: item.createdBy,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        appliedAt: item.appliedAt,
      } as ApiChangeSetDto)),
      totalCount: result.totalCount,
    };
  },
};

export default changeManagementService;
