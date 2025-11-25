import apiClient from '@/services/apiClient';

// Direct function exports for convenience
export const searchGlobalAuditEvents = async (params?: any) => {
  try {
    const response = await apiClient.get('/api/audit/global/search', { params });
    return response.data;
  } catch (error) {
    console.error('Failed to search global audit events:', error);
    return { items: [], total: 0 };
  }
};

export const getGlobalAuditEvent = async (eventId: string) => {
  try {
    const response = await apiClient.get(`/api/audit/global/${eventId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to get global audit event:', error);
    return null;
  }
};

// Tenant audit functions
export const searchAuditEvents = async (params?: any) => {
  try {
    const response = await apiClient.get('/api/audit/search', { params });
    return response.data;
  } catch (error) {
    console.error('Failed to search audit events:', error);
    return { items: [], total: 0 };
  }
};

export const exportAuditLogs = async (format: string, params?: any) => {
  try {
    const response = await apiClient.get('/api/audit/export', {
      params: { format, ...params },
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    console.error('Failed to export audit logs:', error);
    throw error;
  }
};

export const observabilityService = {
  getAuditLogs: async (params?: {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
    actorType?: string;
    action?: string;
  }) => {
    try {
      const response = await apiClient.get('/api/audit/logs', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
      return { items: [], total: 0 };
    }
  },

  getAuditLogById: async (logId: string) => {
    try {
      const response = await apiClient.get(`/api/audit/logs/${logId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch audit log:', error);
      return null;
    }
  },

  getMetrics: async (params?: { timeRange?: string; metricType?: string }) => {
    try {
      const response = await apiClient.get('/api/observability/metrics', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
      return [];
    }
  },

  getTraces: async (params?: { traceId?: string; service?: string }) => {
    try {
      const response = await apiClient.get('/api/observability/traces', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch traces:', error);
      return [];
    }
  },

  getLogs: async (params?: {
    level?: string;
    service?: string;
    startTime?: string;
    endTime?: string;
  }) => {
    try {
      const response = await apiClient.get('/api/observability/logs', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch logs:', error);
      return [];
    }
  },

  getHealthStatus: async () => {
    try {
      const response = await apiClient.get('/api/observability/health');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch health status:', error);
      return null;
    }
  },

  searchGlobalAuditEvents: async (params?: any) => {
    try {
      const response = await apiClient.get('/api/audit/global/search', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to search global audit events:', error);
      return { items: [], total: 0 };
    }
  },

  getGlobalAuditEvent: async (eventId: string) => {
    try {
      const response = await apiClient.get(`/api/audit/global/${eventId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get global audit event:', error);
      return null;
    }
  },
};

export default observabilityService;
