import apiClient from '@/services/apiClient';

export const huntingService = {
  // ==================== QUERY EXECUTION ====================
  runQuery: async (query: string, options?: { timeout?: number; limit?: number }) => {
    try {
      const response = await apiClient.post('/api/tenant/hunting/execute', { query, ...options });
      return response.data;
    } catch (error) {
      console.error('Failed to run hunting query:', error);
      throw error;
    }
  },

  validateQuery: async (query: string) => {
    try {
      const response = await apiClient.post('/api/tenant/hunting/validate', { query });
      return response.data;
    } catch (error) {
      console.error('Failed to validate query:', error);
      throw error;
    }
  },

  // ==================== SAVED QUERIES ====================
  getSavedQueries: async (params?: { category?: string; tags?: string[] }) => {
    try {
      const response = await apiClient.get('/api/tenant/hunting/saved-queries', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to get saved queries:', error);
      return [];
    }
  },

  getSavedQueryById: async (queryId: string) => {
    try {
      const response = await apiClient.get(`/api/tenant/hunting/saved-queries/${queryId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get saved query:', error);
      return null;
    }
  },

  saveQuery: async (data: {
    name: string;
    query: string;
    description?: string;
    category?: string;
    tags?: string[];
    isPublic?: boolean;
  }) => {
    try {
      const response = await apiClient.post('/api/tenant/hunting/saved-queries', data);
      return response.data;
    } catch (error) {
      console.error('Failed to save query:', error);
      throw error;
    }
  },

  updateQuery: async (queryId: string, data: any) => {
    try {
      const response = await apiClient.put(`/api/tenant/hunting/saved-queries/${queryId}`, data);
      return response.data;
    } catch (error) {
      console.error('Failed to update query:', error);
      throw error;
    }
  },

  deleteQuery: async (queryId: string) => {
    try {
      const response = await apiClient.delete(`/api/tenant/hunting/saved-queries/${queryId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to delete query:', error);
      throw error;
    }
  },

  // ==================== SCHEDULED HUNTS ====================
  getScheduledHunts: async (params?: { status?: string }) => {
    try {
      const response = await apiClient.get('/api/tenant/hunting/scheduled-hunts', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to get scheduled hunts:', error);
      return [];
    }
  },

  getScheduledHuntById: async (huntId: string) => {
    try {
      const response = await apiClient.get(`/api/tenant/hunting/scheduled-hunts/${huntId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get scheduled hunt:', error);
      return null;
    }
  },

  createScheduledHunt: async (data: {
    name: string;
    query: string;
    schedule: string;
    alertThreshold?: number;
    notifyOnResults?: boolean;
    recipients?: string[];
  }) => {
    try {
      const response = await apiClient.post('/api/tenant/hunting/scheduled-hunts', data);
      return response.data;
    } catch (error) {
      console.error('Failed to create scheduled hunt:', error);
      throw error;
    }
  },

  updateScheduledHunt: async (huntId: string, data: any) => {
    try {
      const response = await apiClient.put(`/api/tenant/hunting/scheduled-hunts/${huntId}`, data);
      return response.data;
    } catch (error) {
      console.error('Failed to update scheduled hunt:', error);
      throw error;
    }
  },

  deleteScheduledHunt: async (huntId: string) => {
    try {
      const response = await apiClient.delete(`/api/tenant/hunting/scheduled-hunts/${huntId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to delete scheduled hunt:', error);
      throw error;
    }
  },

  pauseScheduledHunt: async (huntId: string) => {
    try {
      const response = await apiClient.post(`/api/tenant/hunting/scheduled-hunts/${huntId}/pause`);
      return response.data;
    } catch (error) {
      console.error('Failed to pause scheduled hunt:', error);
      throw error;
    }
  },

  resumeScheduledHunt: async (huntId: string) => {
    try {
      const response = await apiClient.post(`/api/tenant/hunting/scheduled-hunts/${huntId}/resume`);
      return response.data;
    } catch (error) {
      console.error('Failed to resume scheduled hunt:', error);
      throw error;
    }
  },

  // ==================== HUNT RUNS & RESULTS ====================
  getHuntRuns: async (params?: { huntId?: string; status?: string; limit?: number }) => {
    try {
      const response = await apiClient.get('/api/tenant/hunting/runs', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to get hunt runs:', error);
      return [];
    }
  },

  getHuntRunById: async (runId: string) => {
    try {
      const response = await apiClient.get(`/api/tenant/hunting/runs/${runId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get hunt run:', error);
      return null;
    }
  },

  getHuntRunResults: async (runId: string, params?: { page?: number; pageSize?: number }) => {
    try {
      const response = await apiClient.get(`/api/tenant/hunting/runs/${runId}/results`, { params });
      return response.data;
    } catch (error) {
      console.error('Failed to get hunt run results:', error);
      return { items: [], total: 0 };
    }
  },

  exportHuntResults: async (runId: string, format: 'csv' | 'json' | 'excel' = 'csv') => {
    try {
      const response = await apiClient.get(`/api/tenant/hunting/runs/${runId}/export`, {
        params: { format },
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Failed to export hunt results:', error);
      throw error;
    }
  },

  // ==================== DATASETS ====================
  getDatasets: async () => {
    try {
      const response = await apiClient.get('/api/tenant/hunting/datasets');
      return response.data;
    } catch (error) {
      console.error('Failed to get datasets:', error);
      return [];
    }
  },

  getDatasetSchema: async (datasetId: string) => {
    try {
      const response = await apiClient.get(`/api/tenant/hunting/datasets/${datasetId}/schema`);
      return response.data;
    } catch (error) {
      console.error('Failed to get dataset schema:', error);
      return null;
    }
  },

  // ==================== TEMPLATES ====================
  getQueryTemplates: async (params?: { category?: string }) => {
    try {
      const response = await apiClient.get('/api/tenant/hunting/templates', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to get query templates:', error);
      return [];
    }
  },

  // ==================== THREAT INTELLIGENCE ====================
  getThreatIndicators: async (params?: { type?: string; severity?: string }) => {
    try {
      const response = await apiClient.get('/api/tenant/hunting/threat-indicators', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to get threat indicators:', error);
      return [];
    }
  },

  searchThreatIndicator: async (indicator: string) => {
    try {
      const response = await apiClient.post('/api/tenant/hunting/threat-indicators/search', { indicator });
      return response.data;
    } catch (error) {
      console.error('Failed to search threat indicator:', error);
      throw error;
    }
  },

  // ==================== STATISTICS ====================
  getHuntingStats: async () => {
    try {
      const response = await apiClient.get('/api/tenant/hunting/stats');
      return response.data;
    } catch (error) {
      console.error('Failed to get hunting stats:', error);
      return null;
    }
  },

  // ==================== GLOBAL HUNTING (Platform Admins) ====================
  getGlobalSavedQueries: async (params?: any) => {
    try {
      const response = await apiClient.get('/api/global/hunting/saved-queries', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to get global saved queries:', error);
      return [];
    }
  },

  getGlobalScheduledHunts: async (params?: any) => {
    try {
      const response = await apiClient.get('/api/global/hunting/scheduled-hunts', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to get global scheduled hunts:', error);
      return [];
    }
  },

  getGlobalHuntResults: async (params?: any) => {
    try {
      const response = await apiClient.get('/api/global/hunting/runs', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to get global hunt results:', error);
      return [];
    }
  },

  runGlobalQuery: async (query: string, options?: { tenantIds?: string[]; timeout?: number }) => {
    try {
      const response = await apiClient.post('/api/global/hunting/execute', { query, ...options });
      return response.data;
    } catch (error) {
      console.error('Failed to run global hunting query:', error);
      throw error;
    }
  },

  getCrossTenantResults: async (params?: { queryId?: string; runId?: string }) => {
    try {
      const response = await apiClient.get('/api/global/hunting/cross-tenant', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to get cross-tenant results:', error);
      return [];
    }
  },

  getGlobalTemplates: async () => {
    try {
      const response = await apiClient.get('/api/global/hunting/templates');
      return response.data;
    } catch (error) {
      console.error('Failed to get global templates:', error);
      return [];
    }
  },

  publishQueryAsTemplate: async (queryId: string) => {
    try {
      const response = await apiClient.post(`/api/global/hunting/templates/publish`, { queryId });
      return response.data;
    } catch (error) {
      console.error('Failed to publish query as template:', error);
      throw error;
    }
  },
};

export default huntingService;
