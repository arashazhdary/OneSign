import apiClient from '@/services/apiClient';

export const copilotService = {
  query: async (query: string) => {
    try {
      const response = await apiClient.post('/api/copilot/query', { query });
      return response.data;
    } catch (error) {
      console.error('Failed to query copilot:', error);
      throw error;
    }
  },

  getSuggestions: async (context: string) => {
    try {
      const response = await apiClient.post('/api/copilot/suggestions', { context });
      return response.data;
    } catch (error) {
      console.error('Failed to get suggestions:', error);
      return [];
    }
  },

  getConversationHistory: async () => {
    try {
      const response = await apiClient.get('/api/copilot/history');
      return response.data;
    } catch (error) {
      console.error('Failed to get conversation history:', error);
      return [];
    }
  },

  clearHistory: async () => {
    try {
      const response = await apiClient.delete('/api/copilot/history');
      return response.data;
    } catch (error) {
      console.error('Failed to clear history:', error);
      throw error;
    }
  },

  // ==================== GLOBAL COPILOT METHODS ====================
  getGlobalSettings: async () => {
    try {
      const response = await apiClient.get('/api/global/copilot/settings');
      return response.data;
    } catch (error) {
      console.error('Failed to get global copilot settings:', error);
      return null;
    }
  },

  updateGlobalSettings: async (settings: any) => {
    const response = await apiClient.put('/api/global/copilot/settings', settings);
    return response.data;
  },

  getGlobalAnalytics: async () => {
    try {
      const response = await apiClient.get('/api/global/copilot/analytics');
      return response.data;
    } catch (error) {
      console.error('Failed to get global copilot analytics:', error);
      return null;
    }
  },

  getGlobalConversations: async (params?: any) => {
    try {
      const response = await apiClient.get('/api/global/copilot/conversations', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to get global conversations:', error);
      return [];
    }
  },

  getGlobalConversation: async (conversationId: string) => {
    try {
      const response = await apiClient.get(`/api/global/copilot/conversations/${conversationId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get global conversation:', error);
      return null;
    }
  },

  getGlobalPlatformInsights: async () => {
    try {
      const response = await apiClient.get('/api/global/copilot/insights');
      return response.data;
    } catch (error) {
      console.error('Failed to get platform insights:', error);
      return [];
    }
  },

  getGlobalRecommendations: async () => {
    try {
      const response = await apiClient.get('/api/global/copilot/recommendations');
      return response.data;
    } catch (error) {
      console.error('Failed to get recommendations:', error);
      return [];
    }
  },

  getGlobalAlerts: async () => {
    try {
      const response = await apiClient.get('/api/global/copilot/alerts');
      return response.data;
    } catch (error) {
      console.error('Failed to get copilot alerts:', error);
      return [];
    }
  },

  acknowledgeGlobalAlert: async (alertId: string) => {
    const response = await apiClient.post(`/api/global/copilot/alerts/${alertId}/acknowledge`);
    return response.data;
  },

  getKnowledgeBaseStatus: async () => {
    try {
      const response = await apiClient.get('/api/global/copilot/knowledge-base/status');
      return response.data;
    } catch (error) {
      console.error('Failed to get knowledge base status:', error);
      return null;
    }
  },

  analyzeTenants: async (query: string, options?: any) => {
    try {
      const response = await apiClient.post('/api/global/copilot/analyze-tenants', { query, ...options });
      return response.data;
    } catch (error) {
      console.error('Failed to analyze tenants:', error);
      return null;
    }
  },

  executeGlobalQuery: async (query: string) => {
    try {
      const response = await apiClient.post('/api/global/copilot/query', { query });
      return response.data;
    } catch (error) {
      console.error('Failed to execute global query:', error);
      throw error;
    }
  },

  executeGlobalAction: async (action: string, params?: any) => {
    try {
      const response = await apiClient.post('/api/global/copilot/actions', { action, params });
      return response.data;
    } catch (error) {
      console.error('Failed to execute global action:', error);
      throw error;
    }
  },
};

export default copilotService;
