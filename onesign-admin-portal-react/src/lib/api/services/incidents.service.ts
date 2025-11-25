import apiClient from '@/services/apiClient';

export const incidentsService = {
  getIncidents: async (params?: any) => {
    try {
      const response = await apiClient.get('/api/incidents', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch incidents:', error);
      return [];
    }
  },

  getIncidentById: async (incidentId: string) => {
    try {
      const response = await apiClient.get(`/api/incidents/${incidentId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch incident:', error);
      return null;
    }
  },

  createIncident: async (data: any) => {
    try {
      const response = await apiClient.post('/api/incidents', data);
      return response.data;
    } catch (error) {
      console.error('Failed to create incident:', error);
      throw error;
    }
  },

  updateIncident: async (incidentId: string, data: any) => {
    try {
      const response = await apiClient.put(`/api/incidents/${incidentId}`, data);
      return response.data;
    } catch (error) {
      console.error('Failed to update incident:', error);
      throw error;
    }
  },

  resolveIncident: async (incidentId: string, resolution: string) => {
    try {
      const response = await apiClient.post(`/api/incidents/${incidentId}/resolve`, { resolution });
      return response.data;
    } catch (error) {
      console.error('Failed to resolve incident:', error);
      throw error;
    }
  },
};

export default incidentsService;
