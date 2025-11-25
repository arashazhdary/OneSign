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
};

export default copilotService;
