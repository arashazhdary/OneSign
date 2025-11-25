import apiClient from '@/services/apiClient';

export const changeManagementService = {
  getChangeRequests: async (params?: any) => {
    try {
      const response = await apiClient.get('/api/change-management/requests', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch change requests:', error);
      return [];
    }
  },

  getChangeRequestById: async (requestId: string) => {
    try {
      const response = await apiClient.get(`/api/change-management/requests/${requestId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch change request:', error);
      return null;
    }
  },

  createChangeRequest: async (data: any) => {
    try {
      const response = await apiClient.post('/api/change-management/requests', data);
      return response.data;
    } catch (error) {
      console.error('Failed to create change request:', error);
      throw error;
    }
  },

  approveChangeRequest: async (requestId: string) => {
    try {
      const response = await apiClient.post(`/api/change-management/requests/${requestId}/approve`);
      return response.data;
    } catch (error) {
      console.error('Failed to approve change request:', error);
      throw error;
    }
  },

  rejectChangeRequest: async (requestId: string, reason: string) => {
    try {
      const response = await apiClient.post(`/api/change-management/requests/${requestId}/reject`, { reason });
      return response.data;
    } catch (error) {
      console.error('Failed to reject change request:', error);
      throw error;
    }
  },

  getAuditTrail: async (params?: any) => {
    try {
      const response = await apiClient.get('/api/change-management/audit', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch audit trail:', error);
      return [];
    }
  },

  searchAuditEvents: async (params?: any) => {
    try {
      const response = await apiClient.get('/api/change-management/audit/search', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to search audit events:', error);
      return { items: [], total: 0 };
    }
  },
};

export default changeManagementService;
