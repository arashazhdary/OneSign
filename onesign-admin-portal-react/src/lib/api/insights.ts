import apiClient from '@/services/apiClient';

export const insightsService = {
  getInsights: async (params?: any) => {
    try {
      const response = await apiClient.get('/api/insights', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch insights:', error);
      return [];
    }
  },

  getInsightById: async (insightId: string) => {
    try {
      const response = await apiClient.get(`/api/insights/${insightId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch insight:', error);
      return null;
    }
  },

  getRecommendations: async () => {
    try {
      const response = await apiClient.get('/api/insights/recommendations');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
      return [];
    }
  },

  getTrends: async (params?: any) => {
    try {
      const response = await apiClient.get('/api/insights/trends', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch trends:', error);
      return [];
    }
  },

  getAdvancedAnalytics: async (params?: any) => {
    try {
      const response = await apiClient.get('/api/insights/advanced', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch advanced analytics:', error);
      return null;
    }
  },
};

export default insightsService;
