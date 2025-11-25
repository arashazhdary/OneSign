import apiClient from '@/services/apiClient';

// Tenant Insights Functions
export const getTenantInsightsOverview = async (tenantId?: string) => {
  try {
    const response = await apiClient.get('/api/tenant/insights/overview', { params: { tenantId } });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch tenant insights overview:', error);
    return null;
  }
};

export const getTenantUserActivity = async (tenantId?: string) => {
  try {
    const response = await apiClient.get('/api/tenant/insights/user-activity', { params: { tenantId } });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch tenant user activity:', error);
    return [];
  }
};

export const getTenantApplicationUsage = async (tenantId?: string) => {
  try {
    const response = await apiClient.get('/api/tenant/insights/application-usage', { params: { tenantId } });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch tenant application usage:', error);
    return [];
  }
};

// Global Insights Functions
export const getGlobalPlatformOverview = async () => {
  try {
    const response = await apiClient.get('/api/global/insights/overview');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch global platform overview:', error);
    return null;
  }
};

export const getGlobalTenantUsage = async () => {
  try {
    const response = await apiClient.get('/api/global/insights/tenant-usage');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch global tenant usage:', error);
    return [];
  }
};

export const getGlobalHighRiskUsers = async () => {
  try {
    const response = await apiClient.get('/api/global/insights/high-risk-users');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch global high risk users:', error);
    return [];
  }
};

export const getGlobalSystemHealth = async () => {
  try {
    const response = await apiClient.get('/api/global/insights/system-health');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch global system health:', error);
    return null;
  }
};

export const getGlobalSystemAlerts = async () => {
  try {
    const response = await apiClient.get('/api/global/insights/system-alerts');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch global system alerts:', error);
    return [];
  }
};

export const acknowledgeGlobalSystemAlert = async (alertId: string) => {
  try {
    const response = await apiClient.post(`/api/global/insights/system-alerts/${alertId}/acknowledge`);
    return response.data;
  } catch (error) {
    console.error('Failed to acknowledge global system alert:', error);
    throw error;
  }
};

export const getGlobalTenantsOverview = async () => {
  try {
    const response = await apiClient.get('/api/global/insights/tenants-overview');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch global tenants overview:', error);
    return [];
  }
};

export const getRiskyTenants = async () => {
  try {
    const response = await apiClient.get('/api/global/insights/risky-tenants');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch risky tenants:', error);
    return [];
  }
};

export const exportGlobalTenantsOverview = async (format: string) => {
  try {
    const response = await apiClient.get('/api/global/insights/tenants-overview/export', {
      params: { format },
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    console.error('Failed to export global tenants overview:', error);
    throw error;
  }
};

export const getGlobalReportSubscriptions = async () => {
  try {
    const response = await apiClient.get('/api/global/insights/report-subscriptions');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch global report subscriptions:', error);
    return [];
  }
};

export const createGlobalReportSubscription = async (data: any) => {
  try {
    const response = await apiClient.post('/api/global/insights/report-subscriptions', data);
    return response.data;
  } catch (error) {
    console.error('Failed to create global report subscription:', error);
    throw error;
  }
};

export const updateGlobalReportSubscription = async (subscriptionId: string, data: any) => {
  try {
    const response = await apiClient.put(`/api/global/insights/report-subscriptions/${subscriptionId}`, data);
    return response.data;
  } catch (error) {
    console.error('Failed to update global report subscription:', error);
    throw error;
  }
};

export const deleteGlobalReportSubscription = async (subscriptionId: string) => {
  try {
    await apiClient.delete(`/api/global/insights/report-subscriptions/${subscriptionId}`);
  } catch (error) {
    console.error('Failed to delete global report subscription:', error);
    throw error;
  }
};

// Tenant Insights - User Security
export const getUserSecurityPosture = async (tenantId?: string) => {
  try {
    const response = await apiClient.get('/api/tenant/insights/user-security-posture', { params: { tenantId } });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch user security posture:', error);
    return null;
  }
};

export const exportTenantInsightsOverview = async (format: string, tenantId?: string) => {
  try {
    const response = await apiClient.get('/api/tenant/insights/export', {
      params: { format, tenantId },
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    console.error('Failed to export tenant insights:', error);
    throw error;
  }
};

export const exportUserSecurityPosture = async (format: string, tenantId?: string) => {
  try {
    const response = await apiClient.get('/api/tenant/insights/user-security-posture/export', {
      params: { format, tenantId },
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    console.error('Failed to export user security posture:', error);
    throw error;
  }
};

// Report Subscriptions
export const getReportSubscriptions = async (tenantId?: string) => {
  try {
    const response = await apiClient.get('/api/tenant/insights/report-subscriptions', { params: { tenantId } });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch report subscriptions:', error);
    return [];
  }
};

export const createReportSubscription = async (data: any) => {
  try {
    const response = await apiClient.post('/api/tenant/insights/report-subscriptions', data);
    return response.data;
  } catch (error) {
    console.error('Failed to create report subscription:', error);
    throw error;
  }
};

export const updateReportSubscription = async (subscriptionId: string, data: any) => {
  try {
    const response = await apiClient.put(`/api/tenant/insights/report-subscriptions/${subscriptionId}`, data);
    return response.data;
  } catch (error) {
    console.error('Failed to update report subscription:', error);
    throw error;
  }
};

export const deleteReportSubscription = async (subscriptionId: string) => {
  try {
    await apiClient.delete(`/api/tenant/insights/report-subscriptions/${subscriptionId}`);
  } catch (error) {
    console.error('Failed to delete report subscription:', error);
    throw error;
  }
};

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
