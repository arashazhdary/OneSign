// Platform Service - API methods for the admin portal
// This service provides mock data and API methods for various platform features

import apiClient from '@/services/apiClient';

export const platformService = {
  // ==================== TENANT MANAGEMENT ====================
  getTenants: async () => {
    try {
      const response = await apiClient.get('/api/tenants');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch tenants:', error);
      return [];
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
  getAuditLogs: async (tenantId?: string, params?: any) => {
    try {
      const url = tenantId ? `/api/tenants/${tenantId}/audit` : '/api/audit';
      const response = await apiClient.get(url, { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
      return [];
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

// Applications Service
export const applicationsService = {
  getApplications: async (params?: any) => {
    try {
      const response = await apiClient.get('/api/applications', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch applications:', error);
      return [];
    }
  },

  getApplicationById: async (appId: string) => {
    try {
      const response = await apiClient.get(`/api/applications/${appId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch application:', error);
      return null;
    }
  },

  createApplication: async (data: any) => {
    try {
      const response = await apiClient.post('/api/applications', data);
      return response.data;
    } catch (error) {
      console.error('Failed to create application:', error);
      throw error;
    }
  },

  updateApplication: async (appId: string, data: any) => {
    try {
      const response = await apiClient.put(`/api/applications/${appId}`, data);
      return response.data;
    } catch (error) {
      console.error('Failed to update application:', error);
      throw error;
    }
  },

  deleteApplication: async (appId: string) => {
    try {
      const response = await apiClient.delete(`/api/applications/${appId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to delete application:', error);
      throw error;
    }
  },

  getOrgUnitsTree: async () => {
    try {
      const response = await apiClient.get('/api/org-units/tree');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch org units tree:', error);
      return [];
    }
  },

  getApplicationOrgUnits: async (appId: string) => {
    try {
      const response = await apiClient.get(`/api/applications/${appId}/org-units`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch application org units:', error);
      return [];
    }
  },

  assignOrgUnits: async (appId: string, orgUnitIds: string[]) => {
    try {
      const response = await apiClient.put(`/api/applications/${appId}/org-units`, { orgUnitIds });
      return response.data;
    } catch (error) {
      console.error('Failed to assign org units:', error);
      throw error;
    }
  },

  addRedirectUri: async (appId: string, uri: string) => {
    try {
      const response = await apiClient.post(`/api/applications/${appId}/redirect-uris`, { uri });
      return response.data;
    } catch (error) {
      console.error('Failed to add redirect URI:', error);
      throw error;
    }
  },

  removeRedirectUri: async (appId: string, uri: string) => {
    try {
      const response = await apiClient.delete(`/api/applications/${appId}/redirect-uris`, { data: { uri } });
      return response.data;
    } catch (error) {
      console.error('Failed to remove redirect URI:', error);
      throw error;
    }
  },

  addClientSecret: async (appId: string, name?: string) => {
    try {
      const response = await apiClient.post(`/api/applications/${appId}/secrets`, { name });
      return response.data;
    } catch (error) {
      console.error('Failed to add client secret:', error);
      throw error;
    }
  },

  removeClientSecret: async (appId: string, secretId: string) => {
    try {
      const response = await apiClient.delete(`/api/applications/${appId}/secrets/${secretId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to remove client secret:', error);
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

// Users Service
export const usersService = {
  getUsers: async (params?: any) => {
    try {
      const response = await apiClient.get('/api/users', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch users:', error);
      return [];
    }
  },

  getUserById: async (userId: string) => {
    try {
      const response = await apiClient.get(`/api/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch user:', error);
      return null;
    }
  },

  createUser: async (data: any) => {
    try {
      const response = await apiClient.post('/api/users', data);
      return response.data;
    } catch (error) {
      console.error('Failed to create user:', error);
      throw error;
    }
  },

  updateUser: async (userId: string, data: any) => {
    try {
      const response = await apiClient.put(`/api/users/${userId}`, data);
      return response.data;
    } catch (error) {
      console.error('Failed to update user:', error);
      throw error;
    }
  },

  deleteUser: async (userId: string) => {
    try {
      const response = await apiClient.delete(`/api/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to delete user:', error);
      throw error;
    }
  },

  getUserInfo: async (accessToken: string) => {
    try {
      const response = await apiClient.get('/api/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to delete user:', error);
      throw error;
    }
  },

  // Session management
  getAccountSessions: async (userId?: string) => {
    try {
      const url = userId ? `/api/users/${userId}/sessions` : '/api/users/sessions';
      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
      return [];
    }
  },

  getSessionHistory: async (params?: any) => {
    try {
      const response = await apiClient.get('/api/users/sessions/history', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch session history:', error);
      return [];
    }
  },

  revokeSession: async (sessionId: string) => {
    const response = await apiClient.delete(`/api/users/sessions/${sessionId}`);
    return response.data;
  },

  // User scope and permissions
  getCurrentUserScope: async () => {
    try {
      const response = await apiClient.get('/api/users/me/scope');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch user scope:', error);
      return null;
    }
  },

  // User invitation
  inviteUser: async (data: any) => {
    const response = await apiClient.post('/api/users/invite', data);
    return response.data;
  },

  // User status
  updateUserStatus: async (userId: string, status: string) => {
    const response = await apiClient.patch(`/api/users/${userId}/status`, { status });
    return response.data;
  },

  // User organizational units
  getUserOrgUnits: async (userId: string) => {
    try {
      const response = await apiClient.get(`/api/users/${userId}/org-units`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch user org units:', error);
      return [];
    }
  },

  updateUserOrgUnits: async (userId: string, orgUnitIds: string[]) => {
    const response = await apiClient.put(`/api/users/${userId}/org-units`, { orgUnitIds });
    return response.data;
  },

  // User profile
  getUserProfile: async (userId: string) => {
    try {
      const response = await apiClient.get(`/api/users/${userId}/profile`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      return null;
    }
  },

  updateUserProfile: async (userId: string, data: any) => {
    const response = await apiClient.put(`/api/users/${userId}/profile`, data);
    return response.data;
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

  // User lifecycle
  getUserLifecycle: async (userId: string) => {
    try {
      const response = await apiClient.get(`/api/users/${userId}/lifecycle`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch user lifecycle:', error);
      return null;
    }
  },

  // User risk assessment
  getUserRiskAssessment: async (userId: string) => {
    try {
      const response = await apiClient.get(`/api/users/${userId}/risk-assessment`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch user risk assessment:', error);
      return null;
    }
  },

  // User access packages
  getUserAccessPackages: async (userId: string) => {
    try {
      const response = await apiClient.get(`/api/users/${userId}/access-packages`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch user access packages:', error);
      return [];
    }
  },

  // User privileged sessions
  getUserPrivilegedSessions: async (userId: string) => {
    try {
      const response = await apiClient.get(`/api/users/${userId}/privileged-sessions`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch user privileged sessions:', error);
      return [];
    }
  },

  // User audit trail
  getUserAuditTrail: async (userId: string, params?: any) => {
    try {
      const response = await apiClient.get(`/api/users/${userId}/audit-trail`, { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch user audit trail:', error);
      return [];
    }
  },

  // Account profile management (for current user)
  getAccountProfile: async () => {
    try {
      const response = await apiClient.get('/api/tenant/account/profile');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch account profile:', error);
      return null;
    }
  },

  updateAccountProfile: async (data: {
    firstName?: string;
    lastName?: string;
    displayName?: string;
    phone?: string;
    timezone?: string;
    language?: string;
    avatar?: string;
  }) => {
    try {
      const response = await apiClient.put('/api/tenant/account/profile', data);
      return response.data;
    } catch (error) {
      console.error('Failed to update account profile:', error);
      throw error;
    }
  },

  // Password management
  changePassword: async (data: { currentPassword: string; newPassword: string; confirmPassword: string }) => {
    try {
      const response = await apiClient.post('/api/tenant/account/change-password', data);
      return response.data;
    } catch (error) {
      console.error('Failed to change password:', error);
      throw error;
    }
  },

  // Account security settings
  getAccountSecuritySettings: async () => {
    try {
      const response = await apiClient.get('/api/tenant/account/security');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch account security settings:', error);
      return null;
    }
  },

  updateAccountSecuritySettings: async (data: any) => {
    try {
      const response = await apiClient.put('/api/tenant/account/security', data);
      return response.data;
    } catch (error) {
      console.error('Failed to update account security settings:', error);
      throw error;
    }
  },

  // Account notifications preferences
  getNotificationPreferences: async () => {
    try {
      const response = await apiClient.get('/api/tenant/account/notifications');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch notification preferences:', error);
      return null;
    }
  },

  updateNotificationPreferences: async (data: any) => {
    try {
      const response = await apiClient.put('/api/tenant/account/notifications', data);
      return response.data;
    } catch (error) {
      console.error('Failed to update notification preferences:', error);
      throw error;
    }
  },

  // Account activity
  getAccountActivity: async (params?: any) => {
    try {
      const response = await apiClient.get('/api/tenant/account/activity', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch account activity:', error);
      return [];
    }
  },

  // Account linked accounts (social logins)
  getLinkedAccounts: async () => {
    try {
      const response = await apiClient.get('/api/tenant/account/linked-accounts');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch linked accounts:', error);
      return [];
    }
  },

  linkAccount: async (provider: string, data: any) => {
    try {
      const response = await apiClient.post(`/api/tenant/account/linked-accounts/${provider}`, data);
      return response.data;
    } catch (error) {
      console.error('Failed to link account:', error);
      throw error;
    }
  },

  unlinkAccount: async (provider: string) => {
    try {
      const response = await apiClient.delete(`/api/tenant/account/linked-accounts/${provider}`);
      return response.data;
    } catch (error) {
      console.error('Failed to unlink account:', error);
      throw error;
    }
  },
};

// Governance Service
export const governanceService = {
  // Access Reviews
  getAccessReviews: async (params?: any) => {
    try {
      const response = await apiClient.get('/api/tenant/governance/reviews', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch access reviews:', error);
      return [];
    }
  },

  getAccessReviewById: async (reviewId: string) => {
    try {
      const response = await apiClient.get(`/api/tenant/governance/reviews/${reviewId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch access review:', error);
      return null;
    }
  },

  certifyAccessReview: async (reviewId: string, data: { decision: string; comment?: string }) => {
    try {
      const response = await apiClient.post(`/api/tenant/governance/reviews/${reviewId}/certify`, data);
      return response.data;
    } catch (error) {
      console.error('Failed to certify access review:', error);
      throw error;
    }
  },

  // Certification Campaigns
  getCertificationCampaigns: async (params?: any) => {
    try {
      const response = await apiClient.get('/api/tenant/governance/campaigns', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch certification campaigns:', error);
      return [];
    }
  },

  getCampaignById: async (campaignId: string) => {
    try {
      const response = await apiClient.get(`/api/tenant/governance/campaigns/${campaignId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch campaign:', error);
      return null;
    }
  },

  createCampaign: async (data: any) => {
    try {
      const response = await apiClient.post('/api/tenant/governance/campaigns', data);
      return response.data;
    } catch (error) {
      console.error('Failed to create campaign:', error);
      throw error;
    }
  },

  updateCampaign: async (campaignId: string, data: any) => {
    try {
      const response = await apiClient.put(`/api/tenant/governance/campaigns/${campaignId}`, data);
      return response.data;
    } catch (error) {
      console.error('Failed to update campaign:', error);
      throw error;
    }
  },

  startCampaign: async (campaignId: string) => {
    try {
      const response = await apiClient.post(`/api/tenant/governance/campaigns/${campaignId}/start`);
      return response.data;
    } catch (error) {
      console.error('Failed to start campaign:', error);
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

  getCampaignItems: async (campaignId: string, params?: any) => {
    try {
      const response = await apiClient.get(`/api/tenant/governance/campaigns/${campaignId}/items`, { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch campaign items:', error);
      return [];
    }
  },

  certifyItem: async (campaignId: string, itemId: string, data: { decision: string; comment?: string }) => {
    try {
      const response = await apiClient.post(`/api/tenant/governance/campaigns/${campaignId}/items/${itemId}/certify`, data);
      return response.data;
    } catch (error) {
      console.error('Failed to certify item:', error);
      throw error;
    }
  },

  bulkCertify: async (campaignId: string, data: { itemIds: string[]; decision: string; comment?: string }) => {
    try {
      const response = await apiClient.post(`/api/tenant/governance/campaigns/${campaignId}/bulk-certify`, data);
      return response.data;
    } catch (error) {
      console.error('Failed to bulk certify items:', error);
      throw error;
    }
  },

  // Compliance
  getComplianceReports: async (params?: any) => {
    try {
      const response = await apiClient.get('/api/tenant/governance/compliance', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch compliance reports:', error);
      return [];
    }
  },

  getFrameworks: async () => {
    try {
      const response = await apiClient.get('/api/tenant/governance/compliance/frameworks');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch compliance frameworks:', error);
      return [];
    }
  },

  getFrameworkById: async (frameworkId: string) => {
    try {
      const response = await apiClient.get(`/api/tenant/governance/compliance/frameworks/${frameworkId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch framework:', error);
      return null;
    }
  },

  getViolations: async (params?: any) => {
    try {
      const response = await apiClient.get('/api/tenant/governance/compliance/violations', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch violations:', error);
      return [];
    }
  },

  getViolationById: async (violationId: string) => {
    try {
      const response = await apiClient.get(`/api/tenant/governance/compliance/violations/${violationId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch violation:', error);
      return null;
    }
  },

  resolveViolation: async (violationId: string, data: { resolution: string; notes?: string }) => {
    try {
      const response = await apiClient.post(`/api/tenant/governance/compliance/violations/${violationId}/resolve`, data);
      return response.data;
    } catch (error) {
      console.error('Failed to resolve violation:', error);
      throw error;
    }
  },

  // Reports
  getReports: async (params?: any) => {
    try {
      const response = await apiClient.get('/api/tenant/governance/reports', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch reports:', error);
      return [];
    }
  },

  generateReport: async (data: { type: string; frameworkId?: string; params?: any }) => {
    try {
      const response = await apiClient.post('/api/tenant/governance/reports/generate', data);
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

  scheduleReport: async (data: { type: string; schedule: string; recipients: string[] }) => {
    try {
      const response = await apiClient.post('/api/tenant/governance/reports/schedule', data);
      return response.data;
    } catch (error) {
      console.error('Failed to schedule report:', error);
      throw error;
    }
  },

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
};

// Auth Service
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

  getGoogleAuthUrl: async (redirectUri: string) => {
    try {
      const response = await apiClient.get('/api/auth/google/url', { params: { redirectUri } });
      return response.data;
    } catch (error) {
      console.error('Failed to get Google auth URL:', error);
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

  completeFirstLogin: async (data: any) => {
    try {
      const response = await apiClient.post('/api/auth/complete-first-login', data);
      return response.data;
    } catch (error) {
      console.error('Failed to complete first login:', error);
      throw error;
    }
  },

  resetPassword: async (email: string) => {
    try {
      const response = await apiClient.post('/api/auth/reset-password', { email });
      return response.data;
    } catch (error) {
      console.error('Failed to reset password:', error);
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
