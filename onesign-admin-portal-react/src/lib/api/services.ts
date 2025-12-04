// Platform Service - API methods for the admin portal
// This service provides mock data and API methods for various platform features

import apiClient from '@/services/apiClient';

// Tenants Service - Updated based on Swagger API and Technical Spec
export const tenantsService = {
  // For tenant-level operations (current tenant context)
  getTenantUsers: async (params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    sort?: string;
    order?: 'asc' | 'desc';
  }) => {
    try {
      const response = await apiClient.get('/api/tenant/users', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch tenant users:', error);
      return { data: [], total: 0, page: 1, pageSize: 10 };
    }
  },

  // For global admin operations (all tenants)
  getAllTenants: async (params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    sort?: string;
    order?: 'asc' | 'desc';
  }) => {
    try {
      const response = await apiClient.get('/api/global/tenants', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch all tenants:', error);
      return { data: [], total: 0, page: 1, pageSize: 10 };
    }
  },

  // Legacy method for backward compatibility
  getTenants: async (params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    sort?: string;
    order?: 'asc' | 'desc';
  }) => {
    try {
      const response = await apiClient.get('/api/global/tenants', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch tenants:', error);
      return { data: [], total: 0, page: 1, pageSize: 10 };
    }
  },

  getTenantById: async (tenantId: string) => {
    try {
      const response = await apiClient.get(`/api/tenants/${tenantId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch tenant:', error);
      return null;
    }
  },

  createTenant: async (data: {
    name: string;
    domain: string;
    plan?: string;
    ownerId?: string;
  }) => {
    try {
      const response = await apiClient.post('/api/tenants', data);
      return response.data;
    } catch (error) {
      console.error('Failed to create tenant:', error);
      throw error;
    }
  },

  updateTenant: async (tenantId: string, data: Partial<{
    name: string;
    domain: string;
    plan: string;
    status: string;
  }>) => {
    try {
      const response = await apiClient.put(`/api/tenants/${tenantId}`, data);
      return response.data;
    } catch (error) {
      console.error('Failed to update tenant:', error);
      throw error;
    }
  },

  deleteTenant: async (tenantId: string) => {
    try {
      await apiClient.delete(`/api/tenants/${tenantId}`);
      return true;
    } catch (error) {
      console.error('Failed to delete tenant:', error);
      throw error;
    }
  },

  // Tenant access requests
  getAccessRequests: async (params?: {
    tenantId?: string;
    requesterId?: string;
    approverId?: string;
  }) => {
    try {
      const response = await apiClient.get('/api/tenant/access-requests', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch access requests:', error);
      return [];
    }
  },

  createAccessRequest: async (data: {
    tenantId: string;
    resourceType: string;
    resourceId: string;
    justification: string;
    requestedAccessLevel: string;
  }) => {
    try {
      const response = await apiClient.post('/api/tenant/access-requests', data);
      return response.data;
    } catch (error) {
      console.error('Failed to create access request:', error);
      throw error;
    }
  },

  approveAccessRequest: async (requestId: string, data: {
    decision: 'approved' | 'rejected';
    comments?: string;
  }) => {
    try {
      const response = await apiClient.post(`/api/tenant/access-requests/${requestId}/approve`, data);
      return response.data;
    } catch (error) {
      console.error('Failed to approve access request:', error);
      throw error;
    }
  },

  // Tenant account profile (for current tenant user)
  getTenantAccountProfile: async () => {
    try {
      const response = await apiClient.get('/api/tenant/account/profile');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch tenant account profile:', error);
      return null;
    }
  },

  updateTenantAccountProfile: async (data: {
    userId: string;
    displayName?: string;
    phoneNumber?: string;
    timeZone?: string;
    preferredLanguage?: string;
  }) => {
    try {
      const response = await apiClient.put('/api/tenant/account/profile', data);
      return response.data;
    } catch (error) {
      console.error('Failed to update tenant account profile:', error);
      throw error;
    }
  },

  // Tenant lifecycle
  upgradeTenant: async (data: {
    targetPlanId: string;
    comments?: string;
  }) => {
    try {
      const response = await apiClient.post('/api/tenant/lifecycle/upgrade', data);
      return response.data;
    } catch (error) {
      console.error('Failed to upgrade tenant:', error);
      throw error;
    }
  },

  suspendTenant: async (tenantId: string, reason?: string) => {
    try {
      const response = await apiClient.post(`/api/tenants/${tenantId}/suspend`, { reason });
      return response.data;
    } catch (error) {
      console.error('Failed to suspend tenant:', error);
      throw error;
    }
  },

  reactivateTenant: async (tenantId: string) => {
    try {
      const response = await apiClient.post(`/api/tenants/${tenantId}/reactivate`);
      return response.data;
    } catch (error) {
      console.error('Failed to reactivate tenant:', error);
      throw error;
    }
  },
};

// Legacy platformService for backward compatibility
export const platformService = {

  // ==================== USER MANAGEMENT ====================
  getUsers: async (tenantId?: string) => {
    try {
      const url = tenantId ? `/api/tenants/${tenantId}/users` : '/api/users';
      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch users:', error);
      return [];
    }
  },

  getUserById: async (userId: string, tenantId?: string) => {
    try {
      const url = tenantId ? `/api/tenants/${tenantId}/users/${userId}` : `/api/users/${userId}`;
      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch user:', error);
      return null;
    }
  },

  // ==================== APPLICATIONS ====================
  getApplications: async (tenantId?: string) => {
    try {
      const url = tenantId ? `/api/tenants/${tenantId}/apps` : '/api/apps';
      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch applications:', error);
      return [];
    }
  },

  // ==================== AUDIT LOGS ====================
  getAuditLogs: async (params?: {
    page?: number;
    pageSize?: number;
    startDate?: string;
    endDate?: string;
    userId?: string;
    action?: string;
    resourceType?: string;
    resourceId?: string;
    ipAddress?: string;
    tenantId?: string;
    search?: string;
    sort?: string;
    order?: 'asc' | 'desc';
  }) => {
    try {
      const response = await apiClient.get('/api/audit', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
      return { data: [], total: 0, page: 1, pageSize: 10 };
    }
  },

  getAuditLogById: async (logId: string) => {
    try {
      const response = await apiClient.get(`/api/audit/${logId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch audit log:', error);
      return null;
    }
  },

  exportAuditLogs: async (format: 'csv' | 'json' | 'xlsx' = 'csv', params?: any) => {
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
  },

  // ==================== BACKUPS ====================
  getTenantBackups: async (tenantId: string) => {
    try {
      const response = await apiClient.get(`/api/tenants/${tenantId}/backups`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch backups:', error);
      return null;
    }
  },

  getBackupSchedule: async (tenantId: string) => {
    try {
      const response = await apiClient.get(`/api/tenants/${tenantId}/backups/schedule`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch backup schedule:', error);
      return null;
    }
  },

  createBackup: async (tenantId: string, data: any) => {
    try {
      const response = await apiClient.post(`/api/tenants/${tenantId}/backups`, data);
      return response.data;
    } catch (error) {
      console.error('Failed to create backup:', error);
      throw error;
    }
  },

  // ==================== GLOBAL PLATFORM ====================
  getGlobalStats: async () => {
    try {
      const response = await apiClient.get('/api/global/stats');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch global stats:', error);
      return null;
    }
  },

  getGlobalHealth: async () => {
    try {
      const response = await apiClient.get('/api/global/health');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch global health:', error);
      return null;
    }
  },

  getGlobalIntegrations: async () => {
    try {
      const response = await apiClient.get('/api/global/integrations');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch global integrations:', error);
      return null;
    }
  },

  // ==================== INTEGRATIONS ====================
  toggleIntegration: async (integrationId: string) => {
    try {
      const response = await apiClient.post(`/api/integrations/${integrationId}/toggle`);
      return response.data;
    } catch (error) {
      console.error('Failed to toggle integration:', error);
      throw error;
    }
  },

  testIntegration: async (integrationId: string) => {
    try {
      const response = await apiClient.post(`/api/integrations/${integrationId}/test`);
      return response.data;
    } catch (error) {
      console.error('Failed to test integration:', error);
      throw error;
    }
  },

  deleteIntegration: async (integrationId: string) => {
    try {
      const response = await apiClient.delete(`/api/integrations/${integrationId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to delete integration:', error);
      throw error;
    }
  },

  // ==================== SESSIONS ====================
  getSessions: async (tenantId: string) => {
    try {
      const response = await apiClient.get(`/api/tenants/${tenantId}/sessions`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
      return [];
    }
  },

  revokeSession: async (tenantId: string, sessionId: string) => {
    try {
      const response = await apiClient.delete(`/api/tenants/${tenantId}/sessions/${sessionId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to revoke session:', error);
      throw error;
    }
  },

  // ==================== TOKENS ====================
  getTokens: async (tenantId: string) => {
    try {
      const response = await apiClient.get(`/api/tenants/${tenantId}/tokens`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch tokens:', error);
      return [];
    }
  },

  revokeToken: async (tenantId: string, tokenId: string) => {
    try {
      const response = await apiClient.delete(`/api/tenants/${tenantId}/tokens/${tokenId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to revoke token:', error);
      throw error;
    }
  },

  // ==================== ALERTS ====================
  getAlerts: async (tenantId?: string) => {
    try {
      const url = tenantId ? `/api/tenants/${tenantId}/alerts` : '/api/global/alerts';
      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
      return [];
    }
  },

  // ==================== INCIDENTS ====================
  getIncidents: async (tenantId: string) => {
    try {
      const response = await apiClient.get(`/api/tenants/${tenantId}/incidents`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch incidents:', error);
      return [];
    }
  },

  getIncidentById: async (tenantId: string, incidentId: string) => {
    try {
      const response = await apiClient.get(`/api/tenants/${tenantId}/incidents/${incidentId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch incident:', error);
      return null;
    }
  },

  // ==================== ACCESS REQUESTS ====================
  getAccessRequests: async (tenantId: string) => {
    try {
      const response = await apiClient.get(`/api/tenants/${tenantId}/access-requests`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch access requests:', error);
      return [];
    }
  },

  // ==================== POLICIES ====================
  getPolicies: async (tenantId: string) => {
    try {
      const response = await apiClient.get(`/api/tenants/${tenantId}/policies`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch policies:', error);
      return [];
    }
  },

  // ==================== CERTIFICATES ====================
  getCertificates: async (tenantId: string) => {
    try {
      const response = await apiClient.get(`/api/tenants/${tenantId}/certificates`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch certificates:', error);
      return [];
    }
  },

  // ==================== WEBHOOKS ====================
  getWebhooks: async (tenantId?: string) => {
    try {
      const url = tenantId ? `/api/tenants/${tenantId}/webhooks` : '/api/global/webhooks';
      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch webhooks:', error);
      return [];
    }
  },

  // ==================== API KEYS ====================
  getApiKeys: async (tenantId: string) => {
    try {
      const response = await apiClient.get(`/api/tenants/${tenantId}/api-keys`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch API keys:', error);
      return [];
    }
  },

  // ==================== QUOTAS ====================
  getQuotas: async (tenantId: string) => {
    try {
      const response = await apiClient.get(`/api/tenants/${tenantId}/quotas`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch quotas:', error);
      return null;
    }
  },

  // ==================== COMPLIANCE ====================
  getComplianceStatus: async (tenantId: string) => {
    try {
      const response = await apiClient.get(`/api/tenants/${tenantId}/compliance`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch compliance status:', error);
      return null;
    }
  },

  // ==================== GOVERNANCE ====================
  getGovernanceData: async (tenantId: string) => {
    try {
      const response = await apiClient.get(`/api/tenants/${tenantId}/governance`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch governance data:', error);
      return null;
    }
  },

  // ==================== EXPORTS ====================
  getExports: async (tenantId: string) => {
    try {
      const response = await apiClient.get(`/api/tenants/${tenantId}/exports`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch exports:', error);
      return [];
    }
  },

  createExport: async (tenantId: string, data: any) => {
    try {
      const response = await apiClient.post(`/api/tenants/${tenantId}/exports`, data);
      return response.data;
    } catch (error) {
      console.error('Failed to create export:', error);
      throw error;
    }
  },

  // ==================== AUTOMATION ====================
  getWorkflows: async (tenantId: string) => {
    try {
      const response = await apiClient.get(`/api/tenants/${tenantId}/workflows`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch workflows:', error);
      return [];
    }
  },

  getWorkflowById: async (tenantId: string, workflowId: string) => {
    try {
      const response = await apiClient.get(`/api/tenants/${tenantId}/workflows/${workflowId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch workflow:', error);
      return null;
    }
  },

  // ==================== HUNTING ====================
  runHuntingQuery: async (tenantId: string, query: string) => {
    try {
      const response = await apiClient.post(`/api/tenants/${tenantId}/hunting/query`, { query });
      return response.data;
    } catch (error) {
      console.error('Failed to run hunting query:', error);
      throw error;
    }
  },

  // ==================== BRANDING ====================
  getBranding: async (tenantId: string) => {
    try {
      const response = await apiClient.get(`/api/tenants/${tenantId}/branding`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch branding:', error);
      return null;
    }
  },

  updateBranding: async (tenantId: string, data: any) => {
    try {
      const response = await apiClient.put(`/api/tenants/${tenantId}/branding`, data);
      return response.data;
    } catch (error) {
      console.error('Failed to update branding:', error);
      throw error;
    }
  },

  // ==================== NOTIFICATIONS ====================
  getNotifications: async (tenantId: string) => {
    try {
      const response = await apiClient.get(`/api/tenants/${tenantId}/notifications`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      return [];
    }
  },

  // ==================== ACCOUNT ====================
  getAccountInfo: async (tenantId: string) => {
    try {
      const response = await apiClient.get(`/api/tenants/${tenantId}/account`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch account info:', error);
      return null;
    }
  },

  // ==================== BILLING ====================
  getBillingInfo: async (tenantId?: string) => {
    try {
      const url = tenantId ? `/api/tenants/${tenantId}/billing` : '/api/global/billing';
      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch billing info:', error);
      return null;
    }
  },

  // ==================== API USAGE ====================
  getApiUsage: async (tenantId: string) => {
    try {
      const response = await apiClient.get(`/api/tenants/${tenantId}/api-usage`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch API usage:', error);
      return null;
    }
  },

  // ==================== ACCESS CERTIFICATIONS ====================
  getAccessCertifications: async (tenantId: string) => {
    try {
      const response = await apiClient.get(`/api/tenants/${tenantId}/access/certifications`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch access certifications:', error);
      return [];
    }
  },

  // ==================== ACCESS REVIEWS ====================
  getAccessReviews: async (tenantId: string) => {
    try {
      const response = await apiClient.get(`/api/tenants/${tenantId}/access/reviews`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch access reviews:', error);
      return [];
    }
  },

  // ==================== PLATFORM HEALTH ====================
  getPlatformHealth: async () => {
    try {
      const response = await apiClient.get('/api/platform/health');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch platform health:', error);
      return null;
    }
  },

  // ==================== GLOBAL SETTINGS ====================
  updateGlobalSettings: async (settings: any) => {
    try {
      const response = await apiClient.put('/api/global/settings', settings);
      return response.data;
    } catch (error) {
      console.error('Failed to update global settings:', error);
      throw error;
    }
  },

  testEmailConfiguration: async (config: any) => {
    try {
      const response = await apiClient.post('/api/global/settings/email/test', config);
      return response.data;
    } catch (error) {
      console.error('Failed to test email configuration:', error);
      throw error;
    }
  },

  testSMSConfiguration: async (config: any) => {
    try {
      const response = await apiClient.post('/api/global/settings/sms/test', config);
      return response.data;
    } catch (error) {
      console.error('Failed to test SMS configuration:', error);
      throw error;
    }
  },

  // ==================== API MANAGEMENT ====================
  getAPIEndpoints: async () => {
    try {
      const response = await apiClient.get('/api/global/api-management/endpoints');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch API endpoints:', error);
      return [];
    }
  },

  getAPIKeys: async (tenantId?: string) => {
    try {
      const url = tenantId ? `/api/tenants/${tenantId}/api-keys` : '/api/global/api-keys';
      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch API keys:', error);
      return [];
    }
  },

  getAPIConsumers: async () => {
    try {
      const response = await apiClient.get('/api/global/api-management/consumers');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch API consumers:', error);
      return [];
    }
  },

  getAPIVersions: async () => {
    try {
      const response = await apiClient.get('/api/global/api-management/versions');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch API versions:', error);
      return [];
    }
  },

  createAPIKey: async (data: any) => {
    try {
      const response = await apiClient.post('/api/global/api-keys', data);
      return response.data;
    } catch (error) {
      console.error('Failed to create API key:', error);
      throw error;
    }
  },

  revokeAPIKey: async (keyId: string) => {
    try {
      const response = await apiClient.delete(`/api/global/api-keys/${keyId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to revoke API key:', error);
      throw error;
    }
  },

  updateEndpointRateLimit: async (endpointId: string, rateLimit: number) => {
    try {
      const response = await apiClient.patch(`/api/global/api-management/endpoints/${endpointId}/rate-limit`, { rateLimit });
      return response.data;
    } catch (error) {
      console.error('Failed to update endpoint rate limit:', error);
      throw error;
    }
  },

  // ==================== ADMIN TENANTS ====================
  getAdminTenants: async (page: number = 1, limit: number = 100) => {
    try {
      const response = await apiClient.get('/api/admin/tenants', { params: { page, limit } });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch admin tenants:', error);
      return { items: [], total: 0 };
    }
  },

  createAdminTenant: async (data: { name: string; slug: string }) => {
    try {
      const response = await apiClient.post('/api/admin/tenants', data);
      return response.data;
    } catch (error) {
      console.error('Failed to create admin tenant:', error);
      throw error;
    }
  },

  updateAdminTenantStatus: async (tenantId: string, status: string) => {
    try {
      const response = await apiClient.patch(`/api/admin/tenants/${tenantId}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Failed to update admin tenant status:', error);
      throw error;
    }
  },

  // ==================== ADMIN USERS ====================
  getAdminUsers: async (page: number = 1, limit: number = 100) => {
    try {
      const response = await apiClient.get('/api/admin/users', { params: { page, limit } });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch admin users:', error);
      return { items: [], total: 0 };
    }
  },

  createAdminUser: async (data: any) => {
    try {
      const response = await apiClient.post('/api/admin/users', data);
      return response.data;
    } catch (error) {
      console.error('Failed to create admin user:', error);
      throw error;
    }
  },

  updateAdminUser: async (userId: string, data: any) => {
    try {
      const response = await apiClient.put(`/api/admin/users/${userId}`, data);
      return response.data;
    } catch (error) {
      console.error('Failed to update admin user:', error);
      throw error;
    }
  },

  deleteAdminUser: async (userId: string) => {
    try {
      const response = await apiClient.delete(`/api/admin/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to delete admin user:', error);
      throw error;
    }
  },

  // ==================== ORG UNITS (Spec: /api/tenant/orgunits) ====================
  getOrgUnitsTree: async (tenantId?: string) => {
    try {
      const response = await apiClient.get('/api/tenant/orgunits/tree');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch org units tree:', error);
      return [];
    }
  },

  createOrgUnit: async (data: { tenantId?: string; parentId: string | null; name: string }) => {
    const response = await apiClient.post('/api/tenant/orgunits', data);
    return response.data;
  },

  updateOrgUnit: async (tenantId: string, orgUnitId: string, data: { name?: string }) => {
    const response = await apiClient.put(`/api/tenant/orgunits/${orgUnitId}`, data);
    return response.data;
  },

  moveOrgUnit: async (tenantId: string, orgUnitId: string, newParentId: string | null) => {
    const response = await apiClient.post(`/api/tenant/orgunits/${orgUnitId}/move`, { newParentId });
    return response.data;
  },

  deleteOrgUnit: async (tenantId: string, orgUnitId: string) => {
    await apiClient.delete(`/api/tenant/orgunits/${orgUnitId}`);
  },

  // ==================== ROLES (Spec: /api/tenant/authorization/roles) ====================
  getRoles: async (tenantId?: string) => {
    try {
      const response = await apiClient.get('/api/tenant/authorization/roles');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch roles:', error);
      return { items: [] };
    }
  },

  createRole: async (data: { tenantId?: string; name: string; description?: string; permissions: string[]; parentRoleId?: string }) => {
    const response = await apiClient.post('/api/tenant/authorization/roles', data);
    return response.data;
  },

  updateRole: async (roleId: string, data: { name?: string; description?: string; permissions?: string[]; parentRoleId?: string }, tenantId?: string) => {
    const response = await apiClient.put(`/api/tenant/authorization/roles/${roleId}`, data);
    return response.data;
  },

  deleteRole: async (roleId: string, tenantId?: string) => {
    await apiClient.delete(`/api/tenant/authorization/roles/${roleId}`);
  },

  // ==================== SECURITY POLICY (Spec: /api/tenant/security) ====================
  getSecurityPolicy: async () => {
    try {
      const response = await apiClient.get('/api/tenant/security/policy');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch security policy:', error);
      return null;
    }
  },

  updateSecurityPolicy: async (data: any) => {
    const response = await apiClient.put('/api/tenant/security/policy', data);
    return response.data;
  },
};

// Applications Service - Updated based on Swagger API and Technical Spec
export const applicationsService = {
  getApplications: async (params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    sort?: string;
    order?: 'asc' | 'desc';
  }) => {
    try {
      const response = await apiClient.get('/api/tenant/applications', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch applications:', error);
      return { data: [], total: 0, page: 1, pageSize: 10 };
    }
  },

  getApplicationById: async (appId: string) => {
    try {
      const response = await apiClient.get(`/api/tenant/applications/${appId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch application:', error);
      return null;
    }
  },

  createApplication: async (data: {
    tenantId: string;
    name: string;
    description?: string;
    applicationType: string;
    redirectUris?: string[];
    logoutUri?: string;
    allowedScopes?: string[];
    isEnabled?: boolean;
  }) => {
    try {
      const response = await apiClient.post('/api/tenant/applications', data);
      return response.data;
    } catch (error) {
      console.error('Failed to create application:', error);
      throw error;
    }
  },

  updateApplication: async (appId: string, data: Partial<{
    name: string;
    description: string;
    applicationType: string;
    redirectUris: string[];
    logoutUri: string;
    allowedScopes: string[];
    isEnabled: boolean;
  }>) => {
    try {
      const response = await apiClient.put(`/api/tenant/applications/${appId}`, data);
      return response.data;
    } catch (error) {
      console.error('Failed to update application:', error);
      throw error;
    }
  },

  deleteApplication: async (appId: string) => {
    try {
      await apiClient.delete(`/api/tenant/applications/${appId}`);
      return true;
    } catch (error) {
      console.error('Failed to delete application:', error);
      throw error;
    }
  },

  // Application secrets management
  getApplicationSecrets: async (appId: string) => {
    try {
      const response = await apiClient.get(`/api/applications/${appId}/secrets`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch application secrets:', error);
      return [];
    }
  },

  createApplicationSecret: async (appId: string, data: {
    name?: string;
    expiresAt?: string;
  }) => {
    try {
      const response = await apiClient.post(`/api/applications/${appId}/secrets`, data);
      return response.data;
    } catch (error) {
      console.error('Failed to create application secret:', error);
      throw error;
    }
  },

  deleteApplicationSecret: async (appId: string, secretId: string) => {
    try {
      await apiClient.delete(`/api/applications/${appId}/secrets/${secretId}`);
      return true;
    } catch (error) {
      console.error('Failed to delete application secret:', error);
      throw error;
    }
  },

  // Application permissions/roles
  getApplicationRoles: async (appId: string) => {
    try {
      const response = await apiClient.get(`/api/applications/${appId}/roles`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch application roles:', error);
      return [];
    }
  },

  createApplicationRole: async (appId: string, data: {
    name: string;
    description?: string;
    permissions: string[];
  }) => {
    try {
      const response = await apiClient.post(`/api/applications/${appId}/roles`, data);
      return response.data;
    } catch (error) {
      console.error('Failed to create application role:', error);
      throw error;
    }
  },

  updateApplicationRole: async (appId: string, roleId: string, data: Partial<{
    name: string;
    description: string;
    permissions: string[];
  }>) => {
    try {
      const response = await apiClient.put(`/api/applications/${appId}/roles/${roleId}`, data);
      return response.data;
    } catch (error) {
      console.error('Failed to update application role:', error);
      throw error;
    }
  },

  deleteApplicationRole: async (appId: string, roleId: string) => {
    try {
      await apiClient.delete(`/api/applications/${appId}/roles/${roleId}`);
      return true;
    } catch (error) {
      console.error('Failed to delete application role:', error);
      throw error;
    }
  },

  // Application API keys
  getApplicationApiKeys: async (appId: string) => {
    try {
      const response = await apiClient.get(`/api/applications/${appId}/api-keys`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch application API keys:', error);
      return [];
    }
  },

  createApplicationApiKey: async (appId: string, data: {
    name: string;
    scopes: string[];
    expiresAt?: string;
  }) => {
    try {
      const response = await apiClient.post(`/api/applications/${appId}/api-keys`, data);
      return response.data;
    } catch (error) {
      console.error('Failed to create application API key:', error);
      throw error;
    }
  },

  revokeApplicationApiKey: async (appId: string, keyId: string) => {
    try {
      await apiClient.delete(`/api/applications/${appId}/api-keys/${keyId}`);
      return true;
    } catch (error) {
      console.error('Failed to revoke application API key:', error);
      throw error;
    }
  },

  // Org Units Tree - for application assignment
  getOrgUnitsTree: async (tenantId?: string): Promise<any[]> => {
    try {
      const response = await apiClient.get('/api/tenant/orgunits/tree');
      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch org units tree:', error);
      return [];
    }
  },

  // Application Org Units
  getApplicationOrgUnits: async (tenantId: string | null, appId: string): Promise<{ orgUnitIds: string[] }> => {
    try {
      const response = await apiClient.get(`/api/tenant/applications/${appId}/org-units`);
      return response.data || { orgUnitIds: [] };
    } catch (error) {
      console.error('Failed to fetch application org units:', error);
      return { orgUnitIds: [] };
    }
  },

  // Assign org units to application
  assignOrgUnits: async (tenantId: string | null, appId: string, orgUnitIds: string[]): Promise<void> => {
    await apiClient.put(`/api/tenant/applications/${appId}/org-units`, { orgUnitIds });
  },

  // Redirect URIs management
  addRedirectUri: async (tenantId: string | null, appId: string, uri: string): Promise<{ id: string; uri: string }> => {
    const response = await apiClient.post(`/api/tenant/applications/${appId}/redirect-uris`, { uri });
    return response.data;
  },

  removeRedirectUri: async (tenantId: string | null, redirectUriId: string): Promise<void> => {
    await apiClient.delete(`/api/tenant/applications/redirect-uris/${redirectUriId}`);
  },

  // Client Secrets management
  addClientSecret: async (tenantId: string | null, appId: string, description: string): Promise<{ secretValue: string; id: string }> => {
    const response = await apiClient.post(`/api/tenant/applications/${appId}/secrets`, { description });
    return response.data;
  },

  removeClientSecret: async (tenantId: string | null, secretId: string): Promise<void> => {
    await apiClient.delete(`/api/tenant/applications/secrets/${secretId}`);
  },

  // Regenerate secret
  regenerateSecret: async (tenantId: string | null, appId: string): Promise<{ clientSecret: string }> => {
    const response = await apiClient.post(`/api/tenant/applications/${appId}/regenerate-secret`);
    return response.data;
  },
};

// Security Service
export const securityService = {
  getSecurityAlerts: async () => {
    try {
      const response = await apiClient.get('/api/security/alerts');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch security alerts:', error);
      return [];
    }
  },

  getSecurityIncidents: async () => {
    try {
      const response = await apiClient.get('/api/security/incidents');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch security incidents:', error);
      return [];
    }
  },

  getSecurityPolicies: async () => {
    try {
      const response = await apiClient.get('/api/security/policies');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch security policies:', error);
      return [];
    }
  },

  getThreatIntelligence: async () => {
    try {
      const response = await apiClient.get('/api/security/threat-intelligence');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch threat intelligence:', error);
      return [];
    }
  },
};

// User Types based on Swagger API
export interface TenantUserDto {
  id: string;
  globalUserId: string;
  email: string;
  tenantId: string;
  status: TenantUserStatus;
  isAdmin: boolean;
  firstLoginAt?: string;
  lastLoginAt?: string;
  createdAt: string;
}

export enum TenantUserStatus {
  Invited = 1,
  Active = 2,
  Suspended = 3,
  Deleted = 4
}

export interface InviteUserRequest {
  email: string;
  isAdmin: boolean;
}

export interface CurrentUserScopeDto {
  userId: string;
  isGlobalAdmin: boolean;
  rootOrgUnitIds: string[];
  allowedOrgUnitIds: string[];
}

export interface UserProfileDto {
  id: string;
  userId: string;
  displayName: string;
  phoneNumber?: string;
  profilePictureUrl?: string;
  timeZone?: string;
  preferredLanguage?: string;
  customAttributes?: Record<string, any>;
}

export interface TenantUserDtoPagedResult {
  items: TenantUserDto[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  // Backward compatibility aliases
  data?: TenantUserDto[];
  total?: number;
  page?: number;
}

// Users Service - Updated based on Swagger API
export const usersService = {
  /**
   * GET /api/tenant/users - List tenant users with pagination
   * Supports both page and pageNumber for backward compatibility
   */
  getUsers: async (params?: {
    page?: number;
    pageNumber?: number;
    pageSize?: number;
    search?: string;
    sort?: string;
    order?: 'asc' | 'desc';
    orgUnitId?: string;
    status?: TenantUserStatus | string;
    tenantId?: string;
    filters?: Record<string, any>;
  }): Promise<TenantUserDtoPagedResult> => {
    try {
      // Normalize parameters
      const apiParams: any = {
        pageNumber: params?.pageNumber || params?.page || 1,
        pageSize: params?.pageSize || 10,
        search: params?.search,
        sort: params?.sort,
        order: params?.order,
        orgUnitId: params?.orgUnitId,
      };
      // Handle status - convert string to enum if needed
      if (params?.status) {
        if (typeof params.status === 'string') {
          const statusMap: Record<string, TenantUserStatus> = {
            'Invited': TenantUserStatus.Invited,
            'Active': TenantUserStatus.Active,
            'Suspended': TenantUserStatus.Suspended,
            'Inactive': TenantUserStatus.Suspended,
            'Deleted': TenantUserStatus.Deleted,
          };
          apiParams.status = statusMap[params.status] || params.status;
        } else {
          apiParams.status = params.status;
        }
      }

      const response = await apiClient.get('/api/tenant/users', { params: apiParams });
      const data = response.data || { items: [], totalCount: 0, pageNumber: 1, pageSize: 10, totalPages: 0 };
      // Add backward compatibility fields
      return {
        ...data,
        data: data.items,
        total: data.totalCount,
        page: data.pageNumber,
      };
    } catch (error) {
      console.error('Failed to fetch users:', error);
      return { items: [], totalCount: 0, pageNumber: 1, pageSize: 10, totalPages: 0, data: [], total: 0, page: 1 };
    }
  },

  /**
   * GET /api/tenant/users/{tenantUserId} - Get user by ID
   */
  getUserById: async (userId: string): Promise<TenantUserDto | null> => {
    try {
      const response = await apiClient.get(`/api/tenant/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch user:', error);
      return null;
    }
  },

  /**
   * POST /api/tenant/users/invite - Invite new user
   */
  inviteUser: async (data: InviteUserRequest): Promise<TenantUserDto> => {
    const response = await apiClient.post('/api/tenant/users/invite', data);
    return response.data;
  },

  /**
   * PATCH /api/tenant/users/{tenantUserId}/status - Update user status
   */
  updateUserStatus: async (userId: string, status: TenantUserStatus): Promise<void> => {
    await apiClient.patch(`/api/tenant/users/${userId}/status`, { status });
  },

  /**
   * GET /api/tenant/users/{tenantUserId}/org-units - Get user's org units
   */
  getUserOrgUnits: async (userId: string): Promise<{ primaryOrgUnitId: string; secondaryOrgUnitIds: string[] }> => {
    try {
      const response = await apiClient.get(`/api/tenant/users/${userId}/org-units`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch user org units:', error);
      return { primaryOrgUnitId: '', secondaryOrgUnitIds: [] };
    }
  },

  /**
   * PUT /api/tenant/users/{tenantUserId}/org-units - Assign org units to user
   * Accepts both object with primaryOrgUnitId/secondaryOrgUnitIds or array of orgUnitIds
   */
  updateUserOrgUnits: async (userId: string, data: { primaryOrgUnitId: string; secondaryOrgUnitIds: string[] } | string[]): Promise<void> => {
    // Normalize data - if array is passed, use first as primary
    let normalizedData: { primaryOrgUnitId: string; secondaryOrgUnitIds: string[] };
    if (Array.isArray(data)) {
      normalizedData = {
        primaryOrgUnitId: data[0] || '',
        secondaryOrgUnitIds: data.slice(1),
      };
    } else {
      normalizedData = data;
    }
    await apiClient.put(`/api/tenant/users/${userId}/org-units`, normalizedData);
  },

  /**
   * GET /api/tenant/users/current/scope - Get current user's scope
   */
  getCurrentUserScope: async (): Promise<CurrentUserScopeDto> => {
    const response = await apiClient.get('/api/tenant/users/current/scope');
    return response.data;
  },

  /**
   * PUT /api/user/account/profile - Update current user's profile
   */
  updateAccountProfile: async (data: {
    userId: string;
    displayName?: string;
    phoneNumber?: string;
    timeZone?: string;
    preferredLanguage?: string;
  }): Promise<UserProfileDto> => {
    const response = await apiClient.put('/api/user/account/profile', data);
    return response.data;
  },

  /**
   * GET /api/user/account/activities - Get current user's activities
   */
  getAccountActivities: async (params?: { page?: number; pageSize?: number }): Promise<any[]> => {
    try {
      const response = await apiClient.get('/api/user/account/activities', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch account activities:', error);
      return [];
    }
  },

  /**
   * GET /api/tenant/adaptive-security/users/{userId}/context - Get user security context
   */
  getUserSecurityContext: async (userId: string): Promise<any> => {
    try {
      const response = await apiClient.get(`/api/tenant/adaptive-security/users/${userId}/context`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch user security context:', error);
      return null;
    }
  },

  /**
   * PUT /api/tenant/adaptive-security/users/{userId}/context - Update user security context
   */
  updateUserSecurityContext: async (userId: string, data: any): Promise<void> => {
    await apiClient.put(`/api/tenant/adaptive-security/users/${userId}/context`, data);
  },

  /**
   * GET /api/tenant/adaptive-security/users/{userId}/risk-score - Get user risk score
   */
  getUserRiskScore: async (userId: string): Promise<{ riskScore: number; riskLevel: string }> => {
    try {
      const response = await apiClient.get(`/api/tenant/adaptive-security/users/${userId}/risk-score`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch user risk score:', error);
      return { riskScore: 0, riskLevel: 'low' };
    }
  },

  /**
   * GET /api/tenant/lifecycle/users/{userId}/timeline - Get user lifecycle timeline
   */
  getUserLifecycle: async (userId: string): Promise<any[]> => {
    try {
      const response = await apiClient.get(`/api/tenant/lifecycle/users/${userId}/timeline`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch user lifecycle:', error);
      return [];
    }
  },

  /**
   * GET /api/tenant/insights/users/security-posture - Get users security posture list
   */
  getUsersSecurityPosture: async (): Promise<any[]> => {
    try {
      const response = await apiClient.get('/api/tenant/insights/users/security-posture');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch users security posture:', error);
      return [];
    }
  },

  /**
   * GET /api/connect/userinfo - Get current user info (OIDC)
   */
  getUserInfo: async (): Promise<any> => {
    try {
      const response = await apiClient.get('/connect/userinfo');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch user info:', error);
      return null;
    }
  },

  /**
   * Export users - GET /api/tenant/insights/export/users
   */
  exportUsers: async (format: 'pdf' | 'excel' | 'csv' = 'csv'): Promise<Blob> => {
    const response = await apiClient.get('/api/tenant/insights/export/users', {
      params: { format },
      responseType: 'blob'
    });
    return response.data;
  },

  // Legacy methods for backward compatibility
  createUser: async (data: any) => {
    return usersService.inviteUser(data);
  },

  updateUser: async (userId: string, data: any) => {
    // For now, only status update is supported by swagger
    if (data.status !== undefined) {
      await usersService.updateUserStatus(userId, data.status);
    }
  },

  deleteUser: async (userId: string) => {
    await usersService.updateUserStatus(userId, TenantUserStatus.Deleted);
  },

  // Additional helper methods for pages that expect these
  getUserProfile: async (userId: string): Promise<UserProfileDto | null> => {
    try {
      const user = await usersService.getUserById(userId);
      if (!user) return null;
      // Map TenantUserDto to UserProfileDto-like structure
      return {
        id: user.id,
        userId: user.globalUserId,
        displayName: user.email.split('@')[0],
        phoneNumber: undefined,
        profilePictureUrl: undefined,
        timeZone: undefined,
        preferredLanguage: undefined
      };
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      return null;
    }
  },

  getUserRiskAssessment: async (userId: string) => {
    return usersService.getUserRiskScore(userId);
  },

  getUserAccessPackages: async (userId: string): Promise<any[]> => {
    // This endpoint may not exist in swagger - return empty for now
    return [];
  },

  getUserPrivilegedSessions: async (userId: string): Promise<any[]> => {
    // This endpoint may not exist in swagger - return empty for now
    return [];
  },

  getUserAuditTrail: async (userId: string): Promise<any[]> => {
    try {
      const response = await apiClient.get('/api/tenant/audit', {
        params: { userId, pageSize: 50 }
      });
      return response.data?.items || [];
    } catch (error) {
      console.error('Failed to fetch user audit trail:', error);
      return [];
    }
  },

  updateUserProfile: async (userId: string, data: Partial<UserProfileDto>): Promise<void> => {
    await usersService.updateAccountProfile({
      userId,
      displayName: data.displayName,
      phoneNumber: data.phoneNumber,
      timeZone: data.timeZone,
      preferredLanguage: data.preferredLanguage
    });
  },

  getAccountSessions: async (): Promise<any[]> => {
    try {
      const response = await apiClient.get('/api/user/account/sessions');
      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch account sessions:', error);
      return [];
    }
  },

  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    // Password change endpoint
    await apiClient.post('/api/user/account/change-password', {
      currentPassword,
      newPassword
    });
  },

  revokeSession: async (sessionId: string): Promise<void> => {
    await apiClient.delete(`/api/user/account/sessions/${sessionId}`);
  },

  revokeAllUserSessions: async (userId: string): Promise<void> => {
    await apiClient.post(`/api/tenant/users/${userId}/revoke-sessions`);
  },

  revokeAllOtherSessions: async (): Promise<void> => {
    await apiClient.post('/api/user/account/sessions/revoke-all-others');
  },

  revokeSuspiciousSessions: async (): Promise<void> => {
    await apiClient.post('/api/tenant/sessions/revoke-suspicious');
  },

  getSessionHistory: async (params?: any): Promise<any[]> => {
    try {
      const response = await apiClient.get('/api/tenant/sessions/history', { params });
      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch session history:', error);
      return [];
    }
  },

  getAccountProfile: async (): Promise<UserProfileDto | null> => {
    try {
      const response = await apiClient.get('/api/user/account/profile');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch account profile:', error);
      return null;
    }
  },

  getUserActivities: async (userId: string, params?: any): Promise<any[]> => {
    try {
      const response = await apiClient.get(`/api/tenant/users/${userId}/activities`, { params });
      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch user activities:', error);
      return [];
    }
  },
};


// Dashboard Service - Based on Swagger API
export const dashboardService = {
  // GET /api/dashboard/stats - آمار کلی داشبورد
  getDashboardStats: async (params?: {
    tenantId?: string;
    dateRange?: string;
  }) => {
    try {
      const response = await apiClient.get('/api/dashboard/stats', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
      return null;
    }
  },

  // GET /api/dashboard/charts - داده‌های نمودارها
  getDashboardCharts: async (params?: {
    tenantId?: string;
    chartType?: string;
    dateRange?: string;
  }) => {
    try {
      const response = await apiClient.get('/api/dashboard/charts', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch dashboard charts:', error);
      return [];
    }
  },

  // GET /api/dashboard/recent-activity - فعالیت‌های اخیر
  getRecentActivity: async (params?: {
    tenantId?: string;
    limit?: number;
  }) => {
    try {
      const response = await apiClient.get('/api/dashboard/recent-activity', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch recent activity:', error);
      return [];
    }
  },

  // GET /api/dashboard/alerts - هشدارهای داشبورد
  getDashboardAlerts: async (params?: {
    tenantId?: string;
    severity?: string;
  }) => {
    try {
      const response = await apiClient.get('/api/dashboard/alerts', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch dashboard alerts:', error);
      return [];
    }
  },

  // GET /api/dashboard/performance - معیارهای عملکرد
  getPerformanceMetrics: async (params?: {
    tenantId?: string;
    metricType?: string;
    dateRange?: string;
  }) => {
    try {
      const response = await apiClient.get('/api/dashboard/performance', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch performance metrics:', error);
      return null;
    }
  },
};

// Audit Service - Updated based on Swagger API and Technical Spec
export const auditService = {
  // Tenant-level audit logs
  getTenantAuditLogs: async (params?: {
    page?: number;
    pageSize?: number;
    startDate?: string;
    endDate?: string;
    userId?: string;
    action?: string;
    resourceType?: string;
    resourceId?: string;
    ipAddress?: string;
    search?: string;
    sort?: string;
    order?: 'asc' | 'desc';
  }) => {
    try {
      const response = await apiClient.get('/api/tenant/audit', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch tenant audit logs:', error);
      return { data: [], total: 0, page: 1, pageSize: 10 };
    }
  },

  getAuditLogById: async (logId: string) => {
    try {
      const response = await apiClient.get(`/api/tenant/audit/${logId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch audit log:', error);
      return null;
    }
  },

  exportTenantAuditLogs: async (format: 'csv' | 'json' | 'xlsx' = 'csv', params?: any) => {
    try {
      const response = await apiClient.get('/api/tenant/audit/export', {
        params: { format, ...params },
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Failed to export tenant audit logs:', error);
      throw error;
    }
  },

  // Global audit logs (for platform admins)
  getGlobalAuditLogs: async (params?: {
    page?: number;
    pageSize?: number;
    startDate?: string;
    endDate?: string;
    userId?: string;
    tenantId?: string;
    action?: string;
    resourceType?: string;
    resourceId?: string;
    ipAddress?: string;
    search?: string;
    sort?: string;
    order?: 'asc' | 'desc';
  }) => {
    try {
      const response = await apiClient.get('/api/global/audit', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch global audit logs:', error);
      return { data: [], total: 0, page: 1, pageSize: 10 };
    }
  },

  // Legacy method for backward compatibility
  getAuditLogs: async (params?: {
    page?: number;
    pageSize?: number;
    startDate?: string;
    endDate?: string;
    userId?: string;
    action?: string;
    resourceType?: string;
    resourceId?: string;
    ipAddress?: string;
    tenantId?: string;
    search?: string;
    sort?: string;
    order?: 'asc' | 'desc';
  }) => {
    try {
      const response = await apiClient.get('/api/tenant/audit', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
      return { data: [], total: 0, page: 1, pageSize: 10 };
    }
  },

  exportAuditLogs: async (format: 'csv' | 'json' | 'xlsx' = 'csv', params?: any) => {
    try {
      const response = await apiClient.get('/api/tenant/audit/export', {
        params: { format, ...params },
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Failed to export audit logs:', error);
      throw error;
    }
  },
};

// MFA Service - Based on Swagger API
export const mfaService = {
  // Setup MFA
  setupMFA: async (methodType: number) => {
    try {
      const response = await apiClient.post('/api/auth/mfa/setup', { methodType });
      return response.data;
    } catch (error) {
      console.error('Failed to setup MFA:', error);
      throw error;
    }
  },

  // Verify MFA
  verifyMFA: async (challengeId: string, code: string, rememberDevice: boolean = false, deviceFingerprint?: string) => {
    try {
      const response = await apiClient.post('/api/auth/mfa/verify', {
        challengeId,
        code,
        rememberDevice,
        deviceFingerprint
      });
      return response.data;
    } catch (error) {
      console.error('Failed to verify MFA:', error);
      throw error;
    }
  },

  // Get MFA methods for current user
  getMFAMethods: async () => {
    try {
      const response = await apiClient.get('/api/auth/mfa/methods');
      return response.data;
    } catch (error) {
      console.error('Failed to get MFA methods:', error);
      return [];
    }
  },

  // Remove MFA method
  removeMFAMethod: async (methodId: string) => {
    try {
      await apiClient.delete(`/api/auth/mfa/methods/${methodId}`);
      return true;
    } catch (error) {
      console.error('Failed to remove MFA method:', error);
      throw error;
    }
  },
};

// Roles Service - Based on Technical Specification
export const rolesService = {
  // GET /api/tenant/authorization/roles - لیست نقش‌ها
  getRoles: async (params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    sort?: string;
    order?: 'asc' | 'desc';
  }) => {
    try {
      const response = await apiClient.get('/api/tenant/authorization/roles', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch roles:', error);
      return { data: [], total: 0, page: 1, pageSize: 10 };
    }
  },

  // GET /api/tenant/authorization/roles/{id} - دریافت نقش خاص
  getRoleById: async (roleId: string) => {
    try {
      const response = await apiClient.get(`/api/tenant/authorization/roles/${roleId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch role:', error);
      return null;
    }
  },

  // POST /api/tenant/authorization/roles - ایجاد نقش جدید
  createRole: async (data: {
    name: string;
    description?: string;
    permissions: string[];
    parentRoleId?: string;
  }) => {
    try {
      const response = await apiClient.post('/api/tenant/authorization/roles', data);
      return response.data;
    } catch (error) {
      console.error('Failed to create role:', error);
      throw error;
    }
  },

  // PUT /api/tenant/authorization/roles/{id} - به‌روزرسانی نقش
  updateRole: async (roleId: string, data: Partial<{
    name: string;
    description: string;
    permissions: string[];
    parentRoleId?: string;
  }>) => {
    try {
      const response = await apiClient.put(`/api/tenant/authorization/roles/${roleId}`, data);
      return response.data;
    } catch (error) {
      console.error('Failed to update role:', error);
      throw error;
    }
  },

  // DELETE /api/tenant/authorization/roles/{id} - حذف نقش
  deleteRole: async (roleId: string) => {
    try {
      await apiClient.delete(`/api/tenant/authorization/roles/${roleId}`);
      return true;
    } catch (error) {
      console.error('Failed to delete role:', error);
      throw error;
    }
  },

  // GET /api/tenant/authorization/permissions - لیست مجوزها
  getPermissions: async () => {
    try {
      const response = await apiClient.get('/api/tenant/authorization/permissions');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch permissions:', error);
      return [];
    }
  },

  // POST /api/tenant/authorization/roles/{id}/assign - تخصیص نقش به کاربر
  assignRoleToUser: async (roleId: string, userId: string) => {
    try {
      const response = await apiClient.post(`/api/tenant/authorization/roles/${roleId}/assign`, { userId });
      return response.data;
    } catch (error) {
      console.error('Failed to assign role to user:', error);
      throw error;
    }
  },

  // DELETE /api/tenant/authorization/roles/{id}/revoke - لغو نقش از کاربر
  revokeRoleFromUser: async (roleId: string, userId: string) => {
    try {
      const response = await apiClient.delete(`/api/tenant/authorization/roles/${roleId}/revoke`, { data: { userId } });
      return response.data;
    } catch (error) {
      console.error('Failed to revoke role from user:', error);
      throw error;
    }
  },

  // GET /api/tenant/authorization/users/{id}/roles - نقش‌های کاربر
  getUserRoles: async (userId: string) => {
    try {
      const response = await apiClient.get(`/api/tenant/authorization/users/${userId}/roles`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch user roles:', error);
      return [];
    }
  },
};

// Workflow/Automation Service - Based on Swagger API
export const workflowService = {
  // GET /api/tenant/workflows - لیست workflows
  getWorkflows: async (params?: {
    page?: number;
    pageSize?: number;
    tenantId?: string;
    status?: string;
    search?: string;
  }) => {
    try {
      const response = await apiClient.get('/api/tenant/workflows', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch workflows:', error);
      return { data: [], total: 0, page: 1, pageSize: 10 };
    }
  },

  // GET /api/tenant/workflows/{id} - دریافت workflow خاص
  getWorkflowById: async (workflowId: string) => {
    try {
      const response = await apiClient.get(`/api/tenant/workflows/${workflowId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch workflow:', error);
      return null;
    }
  },

  // POST /api/tenant/workflows - ایجاد workflow جدید
  createWorkflow: async (data: {
    tenantId: string;
    name: string;
    description?: string;
    severity?: string;
    isEnabled?: boolean;
    triggers: any[];
    conditions: any[];
    actions: any[];
  }) => {
    try {
      const response = await apiClient.post('/api/tenant/workflows', data);
      return response.data;
    } catch (error) {
      console.error('Failed to create workflow:', error);
      throw error;
    }
  },

  // PUT /api/tenant/workflows/{id} - به‌روزرسانی workflow
  updateWorkflow: async (workflowId: string, data: Partial<{
    name: string;
    description: string;
    severity: string;
    isEnabled: boolean;
    triggers: any[];
    conditions: any[];
    actions: any[];
  }>) => {
    try {
      const response = await apiClient.put(`/api/tenant/workflows/${workflowId}`, data);
      return response.data;
    } catch (error) {
      console.error('Failed to update workflow:', error);
      throw error;
    }
  },

  // DELETE /api/tenant/workflows/{id} - حذف workflow
  deleteWorkflow: async (workflowId: string) => {
    try {
      await apiClient.delete(`/api/tenant/workflows/${workflowId}`);
      return true;
    } catch (error) {
      console.error('Failed to delete workflow:', error);
      throw error;
    }
  },

  // POST /api/tenant/workflows/{id}/test - تست workflow
  testWorkflow: async (workflowId: string, testData: any) => {
    try {
      const response = await apiClient.post(`/api/tenant/workflows/${workflowId}/test`, testData);
      return response.data;
    } catch (error) {
      console.error('Failed to test workflow:', error);
      throw error;
    }
  },

  // GET /api/tenant/workflows/{id}/executions - لیست اجرای workflow
  getWorkflowExecutions: async (workflowId: string, params?: {
    page?: number;
    pageSize?: number;
  }) => {
    try {
      const response = await apiClient.get(`/api/tenant/workflows/${workflowId}/executions`, { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch workflow executions:', error);
      return { data: [], total: 0, page: 1, pageSize: 10 };
    }
  },
};

// Governance Service - Updated based on Swagger API
export const governanceService = {
  // Global governance (for platform admins)
  getGlobalAccessReviews: async (params?: any) => {
    try {
      const response = await apiClient.get('/api/global/governance/reviews', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch global access reviews:', error);
      return [];
    }
  },

  getGlobalCampaigns: async (params?: any) => {
    try {
      const response = await apiClient.get('/api/global/governance/campaigns', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch global campaigns:', error);
      return [];
    }
  },

  getGlobalComplianceStatus: async () => {
    try {
      const response = await apiClient.get('/api/global/governance/compliance/status');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch global compliance status:', error);
      return null;
    }
  },

  getGlobalViolations: async (params?: any) => {
    try {
      const response = await apiClient.get('/api/global/governance/compliance/violations', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch global violations:', error);
      return [];
    }
  },

  // Statistics
  getGovernanceStats: async () => {
    try {
      const response = await apiClient.get('/api/tenant/governance/stats');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch governance stats:', error);
      return null;
    }
  },

  getCertificationStats: async () => {
    try {
      const response = await apiClient.get('/api/tenant/governance/certifications/stats');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch certification stats:', error);
      return null;
    }
  },

  // Wrapper methods for backward compatibility with page calls
  getCampaigns: async (tenantId?: string) => {
    try {
      const response = await apiClient.get('/api/tenant/governance/campaigns', {
        params: tenantId ? { tenantId } : undefined
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch campaigns:', error);
      return [];
    }
  },

  // Privacy / Data Subject Requests
  getRetentionPolicies: async (tenantId?: string) => {
    try {
      const response = await apiClient.get('/api/tenant/governance/privacy/retention');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch retention policies:', error);
      return [];
    }
  },

  updateRetentionPolicy: async (tenantId: string, category: string, data: any) => {
    try {
      const response = await apiClient.put(`/api/tenant/governance/privacy/retention/${category}`, data);
      return response.data;
    } catch (error) {
      console.error('Failed to update retention policy:', error);
      throw error;
    }
  },

  getDataSubjectRequests: async (tenantId?: string) => {
    try {
      const response = await apiClient.get('/api/tenant/governance/privacy/dsr');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch data subject requests:', error);
      return [];
    }
  },

  createDataSubjectRequest: async (tenantId: string, data: any) => {
    try {
      const response = await apiClient.post('/api/tenant/governance/privacy/dsr', data);
      return response.data;
    } catch (error) {
      console.error('Failed to create data subject request:', error);
      throw error;
    }
  },

  executeDataSubjectRequest: async (tenantId: string, requestId: string) => {
    try {
      const response = await apiClient.post(`/api/tenant/governance/privacy/dsr/${requestId}/execute`);
      return response.data;
    } catch (error) {
      console.error('Failed to execute data subject request:', error);
      throw error;
    }
  },

  // Campaign management
  createCampaign: async (data: {
    name: string;
    description?: string;
    type: string;
    scope?: any;
    startDate?: string;
    endDate?: string;
  }) => {
    try {
      const response = await apiClient.post('/api/tenant/governance/campaigns', data);
      return response.data;
    } catch (error) {
      console.error('Failed to create campaign:', error);
      throw error;
    }
  },

  certifyItem: async (campaignId: string, itemId: string, decision: 'approve' | 'revoke' | 'skip', comment?: string) => {
    try {
      const response = await apiClient.post(`/api/tenant/governance/campaigns/${campaignId}/items/${itemId}/certify`, {
        decision,
        comment
      });
      return response.data;
    } catch (error) {
      console.error('Failed to certify item:', error);
      throw error;
    }
  },

  closeCampaign: async (campaignId: string) => {
    try {
      const response = await apiClient.post(`/api/tenant/governance/campaigns/${campaignId}/close`);
      return response.data;
    } catch (error) {
      console.error('Failed to close campaign:', error);
      throw error;
    }
  },

  // Compliance frameworks
  getFrameworks: async (tenantId?: string) => {
    try {
      const response = await apiClient.get('/api/tenant/governance/compliance/frameworks');
      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch frameworks:', error);
      return [];
    }
  },

  // Violations (tenant level)
  getViolations: async (tenantId?: string, params?: any) => {
    try {
      const response = await apiClient.get('/api/tenant/governance/compliance/violations', { params });
      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch violations:', error);
      return [];
    }
  },

  resolveViolation: async (violationId: string, resolution: { action: string; comment?: string }) => {
    try {
      const response = await apiClient.post(`/api/tenant/governance/compliance/violations/${violationId}/resolve`, resolution);
      return response.data;
    } catch (error) {
      console.error('Failed to resolve violation:', error);
      throw error;
    }
  },

  // Reports
  getReports: async (tenantId?: string, params?: any) => {
    try {
      const response = await apiClient.get('/api/tenant/governance/reports', { params });
      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch reports:', error);
      return [];
    }
  },

  generateReport: async (reportType: string, params?: any) => {
    try {
      const response = await apiClient.post('/api/tenant/governance/reports/generate', {
        type: reportType,
        ...params
      });
      return response.data;
    } catch (error) {
      console.error('Failed to generate report:', error);
      throw error;
    }
  },

  exportReport: async (reportId: string, format: 'pdf' | 'csv' | 'excel' = 'pdf') => {
    try {
      const response = await apiClient.get(`/api/tenant/governance/reports/${reportId}/export`, {
        params: { format },
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Failed to export report:', error);
      throw error;
    }
  },
};

// Auth Types based on Swagger API
export interface LoginRequest {
  email: string;
  password: string;
  deviceFingerprint?: string;
}

export interface LoginResponse {
  accessToken: string;
  idToken: string;
  tokenType: string;
  expiresIn: number;
  mfaRequired: boolean;
  challengeId?: string;
  mfaMethodType?: number;
  maskedDestination?: string;
}

export interface CompleteFirstLoginRequest {
  tenantUserId: string;
  password: string;
}

export interface VerifyMfaRequest {
  challengeId: string;
  code: string;
  rememberDevice: boolean;
  deviceFingerprint?: string;
}

// Auth Service - Updated based on Swagger API
export const authService = {
  /**
   * POST /api/auth/login - Login with email and password
   * Returns LoginResponse with tokens or MFA challenge
   */
  login: async (email: string, password: string, deviceFingerprint?: string): Promise<LoginResponse> => {
    const response = await apiClient.post('/api/auth/login', {
      email,
      password,
      deviceFingerprint
    });
    return response.data;
  },

  /**
   * Alias for login - supports both signatures for backward compatibility
   */
  signIn: async (emailOrCredentials: string | { email: string; password: string }, password?: string): Promise<LoginResponse> => {
    if (typeof emailOrCredentials === 'string') {
      return authService.login(emailOrCredentials, password || '');
    }
    return authService.login(emailOrCredentials.email, emailOrCredentials.password);
  },

  /**
   * POST /api/auth/logout - Logout current user
   */
  logout: async () => {
    try {
      await apiClient.post('/api/auth/logout');
    } catch (error) {
      // Ignore logout errors, just clear local state
      console.warn('Logout request failed:', error);
    }
    // Always clear local storage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('idToken');
    localStorage.removeItem('refreshToken');
  },

  /**
   * POST /api/auth/forgot-password - Request password reset
   */
  forgotPassword: async (email: string) => {
    const response = await apiClient.post('/api/auth/forgot-password', { email });
    return response.data;
  },

  /**
   * POST /api/auth/reset-password - Confirm password reset
   */
  resetPassword: async (token: string, newPassword: string) => {
    const response = await apiClient.post('/api/auth/reset-password', {
      token,
      newPassword
    });
    return response.data;
  },

  /**
   * POST /api/auth/google-login - Login with Google OAuth
   */
  googleLogin: async (idToken: string, clientId: string): Promise<LoginResponse> => {
    const response = await apiClient.post('/api/auth/google-login', {
      idToken,
      clientId
    });
    return response.data;
  },

  /**
   * Get Google OAuth URL for redirect - client-side implementation
   * Note: This is a client-side helper, not a backend endpoint
   */
  getGoogleAuthUrl: async (redirectUri: string): Promise<{ authUrl: string }> => {
    // Google OAuth client ID from environment
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
    if (!clientId) {
      throw new Error('Google OAuth is not configured');
    }

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${encodeURIComponent(clientId)}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=code&` +
      `scope=${encodeURIComponent('openid email profile')}&` +
      `access_type=offline&` +
      `prompt=consent`;

    return { authUrl };
  },

  /**
   * POST /api/auth/complete-first-login - Complete first-time login
   */
  completeFirstLogin: async (tenantUserId: string, password: string) => {
    const response = await apiClient.post('/api/auth/complete-first-login', {
      tenantUserId,
      password
    });
    return response.data;
  },

  /**
   * POST /api/auth/mfa/verify - Verify MFA code
   */
  verifyMFA: async (challengeId: string, code: string, rememberDevice: boolean = false, deviceFingerprint?: string): Promise<LoginResponse> => {
    const response = await apiClient.post('/api/auth/mfa/verify', {
      challengeId,
      code,
      rememberDevice,
      deviceFingerprint
    });
    return response.data;
  },

  /**
   * Store tokens after successful login
   */
  storeTokens: (response: LoginResponse) => {
    if (response.accessToken) {
      localStorage.setItem('accessToken', response.accessToken);
    }
    if (response.idToken) {
      localStorage.setItem('idToken', response.idToken);
    }
  },

  /**
   * Get stored access token
   */
  getAccessToken: (): string | null => {
    return localStorage.getItem('accessToken');
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('accessToken');
  },
};

// Billing Service - Based on /api/tenant/billing spec
export const billingService = {
  // GET /api/tenant/billing/subscription
  getSubscription: async (tenantId?: string) => {
    try {
      const response = await apiClient.get('/api/tenant/billing/subscription');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch subscription:', error);
      return null;
    }
  },

  // GET /api/tenant/billing/quota-status
  getQuotaStatus: async (tenantId?: string) => {
    try {
      const response = await apiClient.get('/api/tenant/billing/quota-status');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch quota status:', error);
      return { quotas: [] };
    }
  },

  // GET /api/tenant/billing/summary
  getBillingSummary: async (tenantId?: string) => {
    try {
      const response = await apiClient.get('/api/tenant/billing/summary');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch billing summary:', error);
      return null;
    }
  },

  // GET /api/tenant/billing/invoices
  getInvoices: async (tenantId?: string) => {
    try {
      const response = await apiClient.get('/api/tenant/billing/invoices');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch invoices:', error);
      return [];
    }
  },

  // Backwards compatibility
  getBillingInfo: async () => {
    try {
      const response = await apiClient.get('/api/tenant/billing/summary');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch billing info:', error);
      return null;
    }
  },

  updateSubscription: async (data: any) => {
    try {
      const response = await apiClient.put('/api/tenant/billing/subscription', data);
      return response.data;
    } catch (error) {
      console.error('Failed to update subscription:', error);
      throw error;
    }
  },

  getUsage: async () => {
    try {
      const response = await apiClient.get('/api/tenant/billing/quota-status');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch usage:', error);
      return null;
    }
  },

  /**
   * GET /api/tenant/billing/usage-metrics - متریک‌های استفاده API
   */
  getUsageMetrics: async (tenantId?: string) => {
    try {
      const response = await apiClient.get('/api/tenant/billing/usage-metrics');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch usage metrics:', error);
      return null;
    }
  },

  /**
   * GET /api/tenant/billing/usage-metrics/export - خروجی گزارش استفاده
   */
  exportUsageReport: async (format: 'csv' | 'json' | 'xlsx' = 'csv') => {
    try {
      const response = await apiClient.get('/api/tenant/billing/usage-metrics/export', {
        params: { format },
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Failed to export usage report:', error);
      throw error;
    }
  },
};

// Incidents Service
export const incidentsService = {
  getIncidents: async (params?: any) => {
    try {
      const response = await apiClient.get('/api/incidents', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch incidents:', error);
      return [];
    }
  },

  getIncidentById: async (incidentId: string) => {
    try {
      const response = await apiClient.get(`/api/incidents/${incidentId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch incident:', error);
      return null;
    }
  },

  getIncidentStats: async () => {
    try {
      const response = await apiClient.get('/api/incidents/stats');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch incident stats:', error);
      return null;
    }
  },

  createIncident: async (data: any) => {
    try {
      const response = await apiClient.post('/api/incidents', data);
      return response.data;
    } catch (error) {
      console.error('Failed to create incident:', error);
      throw error;
    }
  },

  updateIncident: async (incidentId: string, data: any) => {
    try {
      const response = await apiClient.put(`/api/incidents/${incidentId}`, data);
      return response.data;
    } catch (error) {
      console.error('Failed to update incident:', error);
      throw error;
    }
  },

  acknowledgeIncident: async (incidentId: string) => {
    try {
      const response = await apiClient.post(`/api/incidents/${incidentId}/acknowledge`);
      return response.data;
    } catch (error) {
      console.error('Failed to acknowledge incident:', error);
      throw error;
    }
  },

  resolveIncident: async (incidentId: string, resolution?: string) => {
    try {
      const response = await apiClient.post(`/api/incidents/${incidentId}/resolve`, { resolution });
      return response.data;
    } catch (error) {
      console.error('Failed to resolve incident:', error);
      throw error;
    }
  },

  closeIncident: async (incidentId: string) => {
    try {
      const response = await apiClient.post(`/api/incidents/${incidentId}/close`);
      return response.data;
    } catch (error) {
      console.error('Failed to close incident:', error);
      throw error;
    }
  },
};

// Lifecycle Service
export const lifecycleService = {
  getLifecycleEvents: async (params?: any) => {
    try {
      const response = await apiClient.get('/api/lifecycle/events', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch lifecycle events:', error);
      return [];
    }
  },

  getLifecycleStats: async () => {
    try {
      const response = await apiClient.get('/api/lifecycle/stats');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch lifecycle stats:', error);
      return null;
    }
  },

  getLifecyclePolicies: async () => {
    try {
      const response = await apiClient.get('/api/lifecycle/policies');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch lifecycle policies:', error);
      return [];
    }
  },

  createLifecyclePolicy: async (data: any) => {
    try {
      const response = await apiClient.post('/api/lifecycle/policies', data);
      return response.data;
    } catch (error) {
      console.error('Failed to create lifecycle policy:', error);
      throw error;
    }
  },

  updateLifecyclePolicy: async (policyId: string, data: any) => {
    try {
      const response = await apiClient.put(`/api/lifecycle/policies/${policyId}`, data);
      return response.data;
    } catch (error) {
      console.error('Failed to update lifecycle policy:', error);
      throw error;
    }
  },

  deleteLifecyclePolicy: async (policyId: string) => {
    try {
      await apiClient.delete(`/api/lifecycle/policies/${policyId}`);
    } catch (error) {
      console.error('Failed to delete lifecycle policy:', error);
      throw error;
    }
  },
};

// Automation Service (re-export)
export { automationService } from './automation';

// Access Service
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

  getPrivilegedSessions: async (params?: any) => {
    try {
      const response = await apiClient.get('/api/access/privileged-sessions', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch privileged sessions:', error);
      return [];
    }
  },

  getPrivilegedAccounts: async (params?: any) => {
    try {
      const response = await apiClient.get('/api/access/privileged-accounts', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch privileged accounts:', error);
      return [];
    }
  },

  getVaultItems: async (params?: any) => {
    try {
      const response = await apiClient.get('/api/access/vault', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch vault items:', error);
      return [];
    }
  },

  getSessionRecordings: async (params?: any) => {
    try {
      const response = await apiClient.get('/api/access/recordings', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch session recordings:', error);
      return [];
    }
  },
};

export default platformService;
