import apiClient from '@/services/apiClient';

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
