import apiClient from '@/services/apiClient';

// Type definitions
export interface AutomationWorkflowDto {
  id: string;
  name: string;
  description?: string;
  trigger: {
    type: string;
    config?: any;
  };
  triggers?: Array<{
    type: string;
    config?: any;
  }>;
  actions: Array<{
    type: string;
    config?: any;
  }>;
  conditions?: Array<{
    type: string;
    config?: any;
  }>;
  isActive: boolean;
  isEnabled?: boolean;
  isEnforced?: boolean;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  category?: string;
  tenantCanDisable?: boolean;
  userId?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

// Constants - Removed duplicate EVENT_TYPES and ACTION_TYPES declarations
// See below for the final declarations

// Global template functions
export const getGlobalTemplates = async (): Promise<AutomationWorkflowDto[]> => {
  try {
    const response = await apiClient.get('/api/automation/templates');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch global templates:', error);
    return [];
  }
};

export const getGlobalTemplate = async (templateId: string): Promise<AutomationWorkflowDto | null> => {
  try {
    const response = await apiClient.get(`/api/automation/templates/${templateId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch global template:', error);
    return null;
  }
};

export const createGlobalTemplate = async (data: Partial<AutomationWorkflowDto>): Promise<AutomationWorkflowDto> => {
  const response = await apiClient.post('/api/automation/templates', data);
  return response.data;
};

export const updateGlobalTemplate = async (templateId: string, data: Partial<AutomationWorkflowDto>): Promise<AutomationWorkflowDto> => {
  const response = await apiClient.put(`/api/automation/templates/${templateId}`, data);
  return response.data;
};

export const deleteGlobalTemplate = async (templateId: string): Promise<void> => {
  await apiClient.delete(`/api/automation/templates/${templateId}`);
};

export const publishTemplate = async (templateId: string): Promise<AutomationWorkflowDto> => {
  const response = await apiClient.post(`/api/automation/templates/${templateId}/publish`);
  return response.data;
};

export const enforceTemplate = async (templateId: string): Promise<AutomationWorkflowDto> => {
  const response = await apiClient.post(`/api/automation/templates/${templateId}/enforce`);
  return response.data;
};

export const unenforceTemplate = async (templateId: string): Promise<AutomationWorkflowDto> => {
  const response = await apiClient.post(`/api/automation/templates/${templateId}/unenforce`);
  return response.data;
};

// Workflow functions
export const getWorkflows = async (): Promise<AutomationWorkflowDto[]> => {
  try {
    const response = await apiClient.get('/api/automation/workflows');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch workflows:', error);
    return [];
  }
};

export const getWorkflow = async (workflowId: string): Promise<AutomationWorkflowDto | null> => {
  try {
    const response = await apiClient.get(`/api/automation/workflows/${workflowId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch workflow:', error);
    return null;
  }
};

export const createWorkflow = async (data: Partial<AutomationWorkflowDto>): Promise<AutomationWorkflowDto> => {
  const response = await apiClient.post('/api/automation/workflows', data);
  return response.data;
};

export const updateWorkflow = async (workflowId: string, data: Partial<AutomationWorkflowDto>): Promise<AutomationWorkflowDto> => {
  const response = await apiClient.put(`/api/automation/workflows/${workflowId}`, data);
  return response.data;
};

export const deleteWorkflow = async (workflowId: string): Promise<void> => {
  await apiClient.delete(`/api/automation/workflows/${workflowId}`);
};

export const enableWorkflow = async (workflowId: string): Promise<AutomationWorkflowDto> => {
  const response = await apiClient.post(`/api/automation/workflows/${workflowId}/enable`);
  return response.data;
};

export const disableWorkflow = async (workflowId: string): Promise<AutomationWorkflowDto> => {
  const response = await apiClient.post(`/api/automation/workflows/${workflowId}/disable`);
  return response.data;
};

export const activateWorkflow = async (workflowId: string): Promise<AutomationWorkflowDto> => {
  const response = await apiClient.post(`/api/automation/workflows/${workflowId}/activate`);
  return response.data;
};

export const deactivateWorkflow = async (workflowId: string): Promise<AutomationWorkflowDto> => {
  const response = await apiClient.post(`/api/automation/workflows/${workflowId}/deactivate`);
  return response.data;
};

// Execution functions
export const getExecutions = async (params?: any) => {
  try {
    const response = await apiClient.get('/api/automation/executions', { params });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch executions:', error);
    return [];
  }
};

export const getWorkflowExecutions = async (workflowId: string, params?: any) => {
  try {
    const response = await apiClient.get(`/api/automation/workflows/${workflowId}/executions`, { params });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch workflow executions:', error);
    return [];
  }
};

export const getExecutionDetail = async (executionId: string) => {
  try {
    const response = await apiClient.get(`/api/automation/executions/${executionId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch execution detail:', error);
    return null;
  }
};

export const getWorkflowRuns = async (workflowId: string, params?: any) => {
  try {
    const response = await apiClient.get(`/api/automation/workflows/${workflowId}/runs`, { params });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch workflow runs:', error);
    return [];
  }
};

export const getWorkflowLogs = async (workflowId: string, params?: any) => {
  try {
    const response = await apiClient.get(`/api/automation/workflows/${workflowId}/logs`, { params });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch workflow logs:', error);
    return [];
  }
};

// Template functions
export const getAvailableTemplates = async () => {
  try {
    const response = await apiClient.get('/api/automation/templates/available');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch available templates:', error);
    return [];
  }
};

export const createTemplate = async (data: Partial<AutomationWorkflowDto>): Promise<AutomationWorkflowDto> => {
  const response = await apiClient.post('/api/automation/templates', data);
  return response.data;
};

export const cloneTemplate = async (templateId: string): Promise<AutomationWorkflowDto> => {
  const response = await apiClient.post(`/api/automation/templates/${templateId}/clone`);
  return response.data;
};

// Trigger functions
export const getAvailableTriggers = async () => {
  try {
    const response = await apiClient.get('/api/automation/triggers');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch available triggers:', error);
    return [];
  }
};

// Test functions
export const testWorkflowWithPayload = async (workflowId: string, payload: any) => {
  const response = await apiClient.post(`/api/automation/workflows/${workflowId}/test`, payload);
  return response.data;
};

export const testWorkflowDetail = async (workflowId: string) => {
  const response = await apiClient.post(`/api/automation/workflows/${workflowId}/test`);
  return response.data;
};

export const testWorkflowDesigner = async (workflow: any) => {
  const response = await apiClient.post('/api/automation/designer/test', workflow);
  return response.data;
};

// Designer functions
export const getWorkflowsForDesigner = async () => {
  try {
    const response = await apiClient.get('/api/automation/designer/workflows');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch workflows for designer:', error);
    return [];
  }
};

export const saveWorkflow = async (workflow: any) => {
  const response = await apiClient.post('/api/automation/designer/save', workflow);
  return response.data;
};

export const deployWorkflow = async (workflowId: string) => {
  const response = await apiClient.post(`/api/automation/workflows/${workflowId}/deploy`);
  return response.data;
};

export const updateWorkflowBasicInfo = async (workflowId: string, data: { name?: string; description?: string }) => {
  const response = await apiClient.patch(`/api/automation/workflows/${workflowId}/basic-info`, data);
  return response.data;
};

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
