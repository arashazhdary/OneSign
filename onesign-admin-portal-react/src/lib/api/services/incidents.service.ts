import apiClient from '@/services/apiClient';

export interface IncidentQueryParams {
  tenantId?: string;
  pageNumber?: number;
  pageSize?: number;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
  severity?: number;
  status?: number;
  category?: string;
}

export const incidentsService = {
  // Get paginated list of incidents
  getIncidents: async (params?: IncidentQueryParams) => {
    try {
      const response = await apiClient.get('/api/tenant/incidents', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch incidents:', error);
      return { items: [], total: 0 };
    }
  },

  // Get incident by ID
  getIncidentById: async (incidentId: string, tenantId?: string) => {
    try {
      const response = await apiClient.get(`/api/tenant/incidents/${incidentId}`, {
        params: { tenantId }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch incident:', error);
      return null;
    }
  },

  // Get incident stats/summary
  getIncidentStats: async (tenantId?: string) => {
    try {
      const response = await apiClient.get('/api/tenant/incidents/stats', {
        params: { tenantId }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch incident stats:', error);
      return { totalActive: 0, critical: 0, high: 0, medium: 0, low: 0 };
    }
  },

  // Get incident timeline
  getIncidentTimeline: async (incidentId: string, tenantId?: string) => {
    try {
      const response = await apiClient.get(`/api/tenant/incidents/${incidentId}/timeline`, {
        params: { tenantId }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch incident timeline:', error);
      return [];
    }
  },

  // Get playbook runs
  getPlaybookRuns: async (params?: { tenantId?: string; pageNumber?: number; pageSize?: number }) => {
    try {
      const response = await apiClient.get('/api/tenant/incidents/playbook-runs', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch playbook runs:', error);
      return { items: [], total: 0 };
    }
  },

  // Acknowledge incident
  acknowledgeIncident: async (incidentId: string, tenantId?: string) => {
    try {
      const response = await apiClient.post(`/api/tenant/incidents/${incidentId}/acknowledge`, {}, {
        params: { tenantId }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to acknowledge incident:', error);
      throw error;
    }
  },

  // Resolve incident
  resolveIncident: async (incidentId: string, tenantId?: string, resolution?: string) => {
    try {
      const response = await apiClient.post(`/api/tenant/incidents/${incidentId}/resolve`, { resolution }, {
        params: { tenantId }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to resolve incident:', error);
      throw error;
    }
  },

  // Close incident
  closeIncident: async (incidentId: string, tenantId?: string) => {
    try {
      const response = await apiClient.post(`/api/tenant/incidents/${incidentId}/close`, {}, {
        params: { tenantId }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to close incident:', error);
      throw error;
    }
  },

  // Add note to incident
  addIncidentNote: async (incidentId: string, tenantId: string | undefined, data: { content: string }) => {
    try {
      const response = await apiClient.post(`/api/tenant/incidents/${incidentId}/notes`, data, {
        params: { tenantId }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to add incident note:', error);
      throw error;
    }
  },

  // Create incident
  createIncident: async (data: any) => {
    try {
      const response = await apiClient.post('/api/tenant/incidents', data);
      return response.data;
    } catch (error) {
      console.error('Failed to create incident:', error);
      throw error;
    }
  },

  // Update incident
  updateIncident: async (incidentId: string, data: any) => {
    try {
      const response = await apiClient.put(`/api/tenant/incidents/${incidentId}`, data);
      return response.data;
    } catch (error) {
      console.error('Failed to update incident:', error);
      throw error;
    }
  },
};

export default incidentsService;
