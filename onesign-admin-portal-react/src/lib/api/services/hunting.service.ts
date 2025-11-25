import apiClient from '@/services/apiClient';

export const huntingService = {
  runQuery: async (query: string) => {
    try {
      const response = await apiClient.post('/api/hunting/query', { query });
      return response.data;
    } catch (error) {
      console.error('Failed to run hunting query:', error);
      throw error;
    }
  },

  getSavedQueries: async () => {
    try {
      const response = await apiClient.get('/api/hunting/queries');
      return response.data;
    } catch (error) {
      console.error('Failed to get saved queries:', error);
      return [];
    }
  },

  saveQuery: async (data: { name: string; query: string; description?: string }) => {
    try {
      const response = await apiClient.post('/api/hunting/queries', data);
      return response.data;
    } catch (error) {
      console.error('Failed to save query:', error);
      throw error;
    }
  },

  deleteQuery: async (queryId: string) => {
    try {
      const response = await apiClient.delete(`/api/hunting/queries/${queryId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to delete query:', error);
      throw error;
    }
  },

  getScheduledHunts: async () => {
    try {
      const response = await apiClient.get('/api/hunting/scheduled');
      return response.data;
    } catch (error) {
      console.error('Failed to get scheduled hunts:', error);
      return [];
    }
  },

  createScheduledHunt: async (data: any) => {
    try {
      const response = await apiClient.post('/api/hunting/scheduled', data);
      return response.data;
    } catch (error) {
      console.error('Failed to create scheduled hunt:', error);
      throw error;
    }
  },
};

export default huntingService;
