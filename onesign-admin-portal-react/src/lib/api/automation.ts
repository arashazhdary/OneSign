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
  actions: Array<{
    type: string;
    config?: any;
  }>;
  isActive: boolean;
  isEnforced?: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

// Constants
export const EVENT_TYPES = [
  { value: 'user.created', label: 'User Created' },
  { value: 'user.updated', label: 'User Updated' },
  { value: 'user.deleted', label: 'User Deleted' },
  { value: 'user.login', label: 'User Login' },
  { value: 'user.logout', label: 'User Logout' },
  { value: 'role.assigned', label: 'Role Assigned' },
  { value: 'role.revoked', label: 'Role Revoked' },
  { value: 'permission.granted', label: 'Permission Granted' },
  { value: 'permission.revoked', label: 'Permission Revoked' },
  { value: 'application.created', label: 'Application Created' },
  { value: 'application.updated', label: 'Application Updated' },
  { value: 'application.deleted', label: 'Application Deleted' },
  { value: 'security.alert', label: 'Security Alert' },
  { value: 'compliance.violation', label: 'Compliance Violation' },
];

export const ACTION_TYPES = [
  { value: 'send_email', label: 'Send Email' },
  { value: 'send_notification', label: 'Send Notification' },
  { value: 'webhook', label: 'Call Webhook' },
  { value: 'assign_role', label: 'Assign Role' },
  { value: 'revoke_role', label: 'Revoke Role' },
  { value: 'suspend_user', label: 'Suspend User' },
  { value: 'activate_user', label: 'Activate User' },
  { value: 'create_ticket', label: 'Create Ticket' },
  { value: 'run_script', label: 'Run Script' },
  { value: 'slack_message', label: 'Send Slack Message' },
  { value: 'teams_message', label: 'Send Teams Message' },
];

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

export const automationService = {
  getWorkflows: async () => {
    try {
      const response = await apiClient.get('/api/automation/workflows');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch workflows:', error);
      return [];
    }
  },

  getWorkflowById: async (workflowId: string) => {
    try {
      const response = await apiClient.get(`/api/automation/workflows/${workflowId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch workflow:', error);
      return null;
    }
  },

  createWorkflow: async (data: any) => {
    try {
      const response = await apiClient.post('/api/automation/workflows', data);
      return response.data;
    } catch (error) {
      console.error('Failed to create workflow:', error);
      throw error;
    }
  },

  updateWorkflow: async (workflowId: string, data: any) => {
    try {
      const response = await apiClient.put(`/api/automation/workflows/${workflowId}`, data);
      return response.data;
    } catch (error) {
      console.error('Failed to update workflow:', error);
      throw error;
    }
  },

  deleteWorkflow: async (workflowId: string) => {
    try {
      const response = await apiClient.delete(`/api/automation/workflows/${workflowId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to delete workflow:', error);
      throw error;
    }
  },

  toggleWorkflow: async (workflowId: string) => {
    try {
      const response = await apiClient.post(`/api/automation/workflows/${workflowId}/toggle`);
      return response.data;
    } catch (error) {
      console.error('Failed to toggle workflow:', error);
      throw error;
    }
  },

  executeWorkflow: async (workflowId: string) => {
    try {
      const response = await apiClient.post(`/api/automation/workflows/${workflowId}/execute`);
      return response.data;
    } catch (error) {
      console.error('Failed to execute workflow:', error);
      throw error;
    }
  },
};

export default automationService;
