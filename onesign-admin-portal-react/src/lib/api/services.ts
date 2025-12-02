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

// Users Service - Updated based on Swagger API
export const usersService = {
  // User management
  getUsers: async (params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    sort?: string;
    order?: 'asc' | 'desc';
    filters?: Record<string, any>;
  }) => {
    try {
      const response = await apiClient.get('/api/tenant/users', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch users:', error);
      return { data: [], total: 0, page: 1, pageSize: 10 };
    }
  },

  getUserById: async (userId: string) => {
    try {
      const response = await apiClient.get(`/api/tenant/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch user:', error);
      return null;
    }
  },

  createUser: async (data: any) => {
    try {
      const response = await apiClient.post('/api/tenant/users', data);
      return response.data;
    } catch (error) {
      console.error('Failed to create user:', error);
      throw error;
    }
  },

  updateUser: async (userId: string, data: any) => {
    try {
      const response = await apiClient.put(`/api/tenant/users/${userId}`, data);
      return response.data;
    } catch (error) {
      console.error('Failed to update user:', error);
      throw error;
    }
  },

  deleteUser: async (userId: string) => {
    try {
      await apiClient.delete(`/api/tenant/users/${userId}`);
      return true;
    } catch (error) {
      console.error('Failed to delete user:', error);
      throw error;
    }
  },

  // Bulk operations
  bulkDelete: async (userIds: string[]) => {
    try {
      const response = await apiClient.post('/api/tenant/users/bulk-delete', { ids: userIds });
      return response.data;
    } catch (error) {
      console.error('Failed to bulk delete users:', error);
      throw error;
    }
  },

  bulkUpdate: async (userIds: string[], updates: any) => {
    try {
      const response = await apiClient.post('/api/tenant/users/bulk-update', { ids: userIds, updates });
      return response.data;
    } catch (error) {
      console.error('Failed to bulk update users:', error);
      throw error;
    }
  },

  // User profile management (for current user)
  getAccountProfile: async () => {
    try {
      const response = await apiClient.get('/api/user/account/profile');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch account profile:', error);
      return null;
    }
  },

  updateAccountProfile: async (data: {
    userId: string;
    displayName?: string;
    phoneNumber?: string;
    timeZone?: string;
    preferredLanguage?: string;
  }) => {
    try {
      const response = await apiClient.put('/api/user/account/profile', data);
      return response.data;
    } catch (error) {
      console.error('Failed to update account profile:', error);
      throw error;
    }
  },

  // User security context
  updateUserSecurityContext: async (data: {
    userId: string;
    lastLoginLocation?: string;
    lastLoginDevice?: string;
    trustedDevices?: string[];
    trustedLocations?: string[];
  }) => {
    try {
      const response = await apiClient.put('/api/user/account/security-context', data);
      return response.data;
    } catch (error) {
      console.error('Failed to update user security context:', error);
      throw error;
    }
  },

  // User activities
  getUserActivities: async (userId: string, params?: any) => {
    try {
      const response = await apiClient.get(`/api/users/${userId}/activities`, { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch user activities:', error);
      return [];
    }
  },

  // MFA methods for user
  getUserMFAMethods: async (userId: string) => {
    try {
      const response = await apiClient.get(`/api/users/${userId}/mfa-methods`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch user MFA methods:', error);
      return [];
    }
  },

  // User security posture
  getUserSecurityPosture: async (userId: string) => {
    try {
      const response = await apiClient.get(`/api/users/${userId}/security-posture`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch user security posture:', error);
      return null;
    }
  },

  // Export users
  exportUsers: async (format: 'pdf' | 'excel' | 'csv' = 'csv', params?: any) => {
    try {
      const response = await apiClient.get('/api/users/export', {
        params: { format, ...params },
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Failed to export users:', error);
      throw error;
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
};

// Auth Service - Updated based on Swagger API
export const authService = {
  login: async (email: string, password: string) => {
    try {
      const response = await apiClient.post('/api/auth/login', { email, password });
      return response.data;
    } catch (error) {
      console.error('Failed to login:', error);
      throw error;
    }
  },

  signIn: async (credentials: { email: string; password: string }) => {
    try {
      const response = await apiClient.post('/api/auth/login', credentials);
      return response.data;
    } catch (error) {
      console.error('Failed to sign in:', error);
      throw error;
    }
  },

  logout: async () => {
    try {
      const response = await apiClient.post('/api/auth/logout');
      return response.data;
    } catch (error) {
      console.error('Failed to logout:', error);
      throw error;
    }
  },

  refreshToken: async (refreshToken: string) => {
    try {
      const response = await apiClient.post('/api/auth/refresh', { refreshToken });
      return response.data;
    } catch (error) {
      console.error('Failed to refresh token:', error);
      throw error;
    }
  },

  forgotPassword: async (email: string) => {
    try {
      const response = await apiClient.post('/api/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      console.error('Failed to request password reset:', error);
      throw error;
    }
  },

  resetPassword: async (token: string, password: string) => {
    try {
      const response = await apiClient.post('/api/auth/reset-password', { token, password });
      return response.data;
    } catch (error) {
      console.error('Failed to reset password:', error);
      throw error;
    }
  },

  verifyEmail: async (token: string) => {
    try {
      const response = await apiClient.post('/api/auth/verify-email', { token });
      return response.data;
    } catch (error) {
      console.error('Failed to verify email:', error);
      throw error;
    }
  },

  getCurrentUser: async () => {
    try {
      const response = await apiClient.get('/api/auth/me');
      return response.data;
    } catch (error) {
      console.error('Failed to get current user:', error);
      throw error;
    }
  },

  // MFA related endpoints
  setupMFA: async (methodType: number) => {
    try {
      const response = await apiClient.post('/api/auth/mfa/setup', { methodType });
      return response.data;
    } catch (error) {
      console.error('Failed to setup MFA:', error);
      throw error;
    }
  },

  verifyMFA: async (challengeId: string, code: string, rememberDevice: boolean = false) => {
    try {
      const response = await apiClient.post('/api/auth/mfa/verify', {
        challengeId,
        code,
        rememberDevice
      });
      return response.data;
    } catch (error) {
      console.error('Failed to verify MFA:', error);
      throw error;
    }
  },

  getMFAMethods: async () => {
    try {
      const response = await apiClient.get('/api/auth/mfa/methods');
      return response.data;
    } catch (error) {
      console.error('Failed to get MFA methods:', error);
      throw error;
    }
  },

  removeMFAMethod: async (methodId: string) => {
    try {
      const response = await apiClient.delete(`/api/auth/mfa/methods/${methodId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to remove MFA method:', error);
      throw error;
    }
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
