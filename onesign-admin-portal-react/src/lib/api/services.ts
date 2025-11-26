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
};

// Governance Service
export const governanceService = {
  getAccessReviews: async () => {
    try {
      const response = await apiClient.get('/api/governance/access-reviews');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch access reviews:', error);
      return [];
    }
  },

  getCertificationCampaigns: async () => {
    try {
      const response = await apiClient.get('/api/governance/certifications');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch certification campaigns:', error);
      return [];
    }
  },

  getComplianceReports: async () => {
    try {
      const response = await apiClient.get('/api/governance/compliance');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch compliance reports:', error);
      return [];
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

export default platformService;
