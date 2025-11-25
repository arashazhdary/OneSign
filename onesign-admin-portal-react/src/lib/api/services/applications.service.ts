import apiClient from '@/services/apiClient';

export const applicationsService = {
  getApplications: async (params?: any) => {
    try {
      const response = await apiClient.get('/api/applications', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch applications:', error);
      return [];
    }
  },

  getApplicationById: async (appId: string) => {
    try {
      const response = await apiClient.get(`/api/applications/${appId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch application:', error);
      return null;
    }
  },

  createApplication: async (data: any) => {
    try {
      const response = await apiClient.post('/api/applications', data);
      return response.data;
    } catch (error) {
      console.error('Failed to create application:', error);
      throw error;
    }
  },

  updateApplication: async (appId: string, data: any) => {
    try {
      const response = await apiClient.put(`/api/applications/${appId}`, data);
      return response.data;
    } catch (error) {
      console.error('Failed to update application:', error);
      throw error;
    }
  },

  deleteApplication: async (appId: string) => {
    try {
      const response = await apiClient.delete(`/api/applications/${appId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to delete application:', error);
      throw error;
    }
  },
};

export default applicationsService;
