import apiClient from '@/services/apiClient';

// Types based on OneSign Technical Specification
export interface WorkflowDto {
  id: string;
  name: string;
  description?: string;
  enabled: boolean;
  trigger?: {
    type: string;
    schedule?: string;
  };
  actions?: any[];
  createdAt: string;
  createdBy?: string;
  lastRun?: string;
  lastStatus?: 'Success' | 'Failed' | 'Running';
  nextRun?: string;
  executionCount?: number;
}

export interface ScheduledJobDto {
  id: string;
  name: string;
  description?: string;
  jobType: string;
  cronExpression: string;
  enabled: boolean;
  nextRun: string;
  lastRun?: string;
  lastStatus?: 'Success' | 'Failed' | 'Running';
  createdAt: string;
  createdBy?: string;
  executionCount: number;
}

export interface ExecutionDto {
  id: string;
  workflowId?: string;
  jobId?: string;
  startedAt: string;
  completedAt?: string;
  status: 'Success' | 'Failed' | 'Running';
  duration?: number;
  errorMessage?: string;
  logs?: string[];
}

export interface WorkflowTemplateDto {
  id: string;
  name: string;
  description?: string;
  category?: string;
  trigger?: any;
  actions?: any[];
}

// Automation Service - Based on /api/tenant/automation spec
export const automationService = {
  // ==================== WORKFLOWS ====================
  // GET /api/tenant/automation/workflows
  getWorkflows: async (tenantId?: string): Promise<WorkflowDto[]> => {
    try {
      const response = await apiClient.get('/api/tenant/automation/workflows');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch workflows:', error);
      return [];
    }
  },

  // GET /api/tenant/automation/workflows/{id}
  getWorkflowById: async (workflowId: string): Promise<WorkflowDto | null> => {
    try {
      const response = await apiClient.get(`/api/tenant/automation/workflows/${workflowId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch workflow:', error);
      return null;
    }
  },

  // POST /api/tenant/automation/workflows
  createWorkflow: async (data: Partial<WorkflowDto>): Promise<WorkflowDto> => {
    try {
      const response = await apiClient.post('/api/tenant/automation/workflows', data);
      return response.data;
    } catch (error) {
      console.error('Failed to create workflow:', error);
      throw error;
    }
  },

  // PUT /api/tenant/automation/workflows/{id}
  updateWorkflow: async (workflowId: string, data: Partial<WorkflowDto>): Promise<WorkflowDto> => {
    try {
      const response = await apiClient.put(`/api/tenant/automation/workflows/${workflowId}`, data);
      return response.data;
    } catch (error) {
      console.error('Failed to update workflow:', error);
      throw error;
    }
  },

  // DELETE /api/tenant/automation/workflows/{id}
  deleteWorkflow: async (workflowId: string): Promise<void> => {
    try {
      await apiClient.delete(`/api/tenant/automation/workflows/${workflowId}`);
    } catch (error) {
      console.error('Failed to delete workflow:', error);
      throw error;
    }
  },

  // POST /api/tenant/automation/workflows/{id}/execute
  executeWorkflow: async (workflowId: string): Promise<ExecutionDto> => {
    try {
      const response = await apiClient.post(`/api/tenant/automation/workflows/${workflowId}/execute`);
      return response.data;
    } catch (error) {
      console.error('Failed to execute workflow:', error);
      throw error;
    }
  },

  // Toggle workflow enabled status
  toggleWorkflow: async (workflowId: string): Promise<WorkflowDto> => {
    try {
      const workflow = await automationService.getWorkflowById(workflowId);
      if (!workflow) throw new Error('Workflow not found');
      const response = await apiClient.put(`/api/tenant/automation/workflows/${workflowId}`, {
        ...workflow,
        enabled: !workflow.enabled,
      });
      return response.data;
    } catch (error) {
      console.error('Failed to toggle workflow:', error);
      throw error;
    }
  },

  // ==================== SCHEDULES ====================
  // GET /api/tenant/automation/schedules
  getSchedules: async (): Promise<ScheduledJobDto[]> => {
    try {
      const response = await apiClient.get('/api/tenant/automation/schedules');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch schedules:', error);
      return [];
    }
  },

  // POST /api/tenant/automation/schedules
  createSchedule: async (data: Partial<ScheduledJobDto>): Promise<ScheduledJobDto> => {
    try {
      const response = await apiClient.post('/api/tenant/automation/schedules', data);
      return response.data;
    } catch (error) {
      console.error('Failed to create schedule:', error);
      throw error;
    }
  },

  // PUT /api/tenant/automation/schedules/{id}
  updateSchedule: async (scheduleId: string, data: Partial<ScheduledJobDto>): Promise<ScheduledJobDto> => {
    try {
      const response = await apiClient.put(`/api/tenant/automation/schedules/${scheduleId}`, data);
      return response.data;
    } catch (error) {
      console.error('Failed to update schedule:', error);
      throw error;
    }
  },

  // DELETE /api/tenant/automation/schedules/{id}
  deleteSchedule: async (scheduleId: string): Promise<void> => {
    try {
      await apiClient.delete(`/api/tenant/automation/schedules/${scheduleId}`);
    } catch (error) {
      console.error('Failed to delete schedule:', error);
      throw error;
    }
  },

  // Toggle schedule enabled status
  toggleSchedule: async (scheduleId: string, enabled: boolean): Promise<ScheduledJobDto> => {
    try {
      const response = await apiClient.put(`/api/tenant/automation/schedules/${scheduleId}`, { enabled });
      return response.data;
    } catch (error) {
      console.error('Failed to toggle schedule:', error);
      throw error;
    }
  },

  // ==================== EXECUTIONS ====================
  // GET /api/tenant/automation/executions
  getExecutions: async (params?: { workflowId?: string; jobId?: string; limit?: number }): Promise<ExecutionDto[]> => {
    try {
      const response = await apiClient.get('/api/tenant/automation/executions', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch executions:', error);
      return [];
    }
  },

  // ==================== TEMPLATES ====================
  // GET /api/tenant/automation/templates
  getTemplates: async (): Promise<WorkflowTemplateDto[]> => {
    try {
      const response = await apiClient.get('/api/tenant/automation/templates');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch templates:', error);
      return [];
    }
  },

  // ==================== GLOBAL AUTOMATION ====================
  getGlobalTemplates: async (): Promise<AutomationWorkflowDto[]> => {
    try {
      const response = await apiClient.get('/api/global/automation/templates');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch global templates:', error);
      return [];
    }
  },

  getGlobalTemplate: async (templateId: string): Promise<AutomationWorkflowDto | null> => {
    try {
      const response = await apiClient.get(`/api/global/automation/templates/${templateId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch global template:', error);
      return null;
    }
  },

  createGlobalTemplate: async (data: Partial<AutomationWorkflowDto>): Promise<AutomationWorkflowDto> => {
    const response = await apiClient.post('/api/global/automation/templates', data);
    return response.data;
  },

  updateGlobalTemplate: async (templateId: string, data: Partial<AutomationWorkflowDto>): Promise<AutomationWorkflowDto> => {
    const response = await apiClient.put(`/api/global/automation/templates/${templateId}`, data);
    return response.data;
  },

  deleteGlobalTemplate: async (templateId: string): Promise<void> => {
    await apiClient.delete(`/api/global/automation/templates/${templateId}`);
  },

  publishTemplate: async (templateId: string): Promise<AutomationWorkflowDto> => {
    const response = await apiClient.post(`/api/global/automation/templates/${templateId}/publish`);
    return response.data;
  },

  enforceTemplate: async (templateId: string, tenantIds?: string[]): Promise<void> => {
    await apiClient.post(`/api/global/automation/templates/${templateId}/enforce`, { tenantIds });
  },

  unenforceTemplate: async (templateId: string, tenantIds?: string[]): Promise<void> => {
    await apiClient.post(`/api/global/automation/templates/${templateId}/unenforce`, { tenantIds });
  },

  // Available templates for tenant use
  getAvailableTemplates: async (): Promise<AutomationWorkflowDto[]> => {
    try {
      const response = await apiClient.get('/api/tenant/automation/available-templates');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch available templates:', error);
      return [];
    }
  },

  cloneTemplate: async (templateId: string, name: string): Promise<WorkflowDto> => {
    const response = await apiClient.post(`/api/tenant/automation/templates/${templateId}/clone`, { name });
    return response.data;
  },

  createTemplate: async (data: Partial<WorkflowTemplateDto>): Promise<WorkflowTemplateDto> => {
    const response = await apiClient.post('/api/tenant/automation/templates', data);
    return response.data;
  },
};

// Export types for use in pages
export type AutomationWorkflowDto = WorkflowDto;

// Export constants
export const EVENT_TYPES = [
  'UserCreated',
  'UserUpdated',
  'UserDeleted',
  'UserLogin',
  'UserLogout',
  'RoleAssigned',
  'RoleRevoked',
  'PasswordChanged',
  'MfaEnabled',
  'MfaDisabled',
  'ApplicationCreated',
  'ApplicationUpdated',
  'ApplicationDeleted',
  'PermissionGranted',
  'PermissionRevoked',
  'PolicyViolation',
  'SecurityAlert',
  'AuditEvent',
];

export const ACTION_TYPES = [
  'SendEmail',
  'SendSms',
  'SendWebhook',
  'CreateTicket',
  'AssignRole',
  'RevokeRole',
  'EnableMfa',
  'DisableAccount',
  'NotifyAdmin',
  'ExecuteScript',
  'UpdateAttribute',
  'TriggerWorkflow',
];

export default automationService;
