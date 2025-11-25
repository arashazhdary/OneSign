import apiClient from '@/services/apiClient';

export const accessService = {
  getAccessRequests: async (params?: any) => {
    try {
      const response = await apiClient.get('/api/access/requests', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch access requests:', error);
      return [];
    }
  },

  getAccessRequestById: async (requestId: string) => {
    try {
      const response = await apiClient.get(`/api/access/requests/${requestId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch access request:', error);
      return null;
    }
  },

  approveRequest: async (requestId: string) => {
    try {
      const response = await apiClient.post(`/api/access/requests/${requestId}/approve`);
      return response.data;
    } catch (error) {
      console.error('Failed to approve access request:', error);
      throw error;
    }
  },

  rejectRequest: async (requestId: string, reason: string) => {
    try {
      const response = await apiClient.post(`/api/access/requests/${requestId}/reject`, { reason });
      return response.data;
    } catch (error) {
      console.error('Failed to reject access request:', error);
      throw error;
    }
  },

  getAccessReviews: async (params?: any) => {
    try {
      const response = await apiClient.get('/api/access/reviews', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch access reviews:', error);
      return [];
    }
  },

  getCertifications: async (params?: any) => {
    try {
      const response = await apiClient.get('/api/access/certifications', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch certifications:', error);
      return [];
    }
  },
};

export default accessService;
