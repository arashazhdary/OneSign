// Tenant Service - API methods for tenant-specific operations
// Maps to the Swagger API endpoints for tenant operations

import apiClient from '@/services/apiClient';

// Types based on Swagger schema
export interface TenantStatsDto {
  activeUsers: number;
  totalUsers: number;
  totalApps: number;
  activeApps: number;
  apiCalls: number;
  storageUsed: number;
  storageTotal: number;
}

export interface RecentLoginDto {
  id: string;
  userId: string;
  userName: string;
  email: string;
  timestamp: string;
  ipAddress: string;
  location: string;
  userAgent?: string;
  success: boolean;
}

export interface UserActivityStatsDto {
  day: string;
  users: number;
  date?: string;
}

export interface ApplicationUsageDto {
  id: string;
  name: string;
  usage: number;
  requests: number;
  lastAccessed?: string;
}

export interface TenantInsightsDto {
  stats: TenantStatsDto;
  recentLogins: RecentLoginDto[];
  userActivityStats: UserActivityStatsDto[];
  applicationUsage: ApplicationUsageDto[];
}

export interface TenantUserDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName?: string;
  status: 'Active' | 'Inactive' | 'Suspended' | 'Pending';
  roles: string[];
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
  mfaEnabled?: boolean;
}

export interface CreateTenantUserDto {
  email: string;
  firstName: string;
  lastName: string;
  roles?: string[];
  sendInvite?: boolean;
}

export interface UpdateTenantUserDto {
  firstName?: string;
  lastName?: string;
  status?: 'Active' | 'Inactive' | 'Suspended';
  roles?: string[];
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Tenant Service
export const tenantService = {
  // ==================== TENANT INSIGHTS ====================
  getTenantStats: async (): Promise<TenantStatsDto | null> => {
    try {
      const response = await apiClient.get('/api/tenant/insights/stats');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch tenant stats:', error);
      return null;
    }
  },

  getTenantInsights: async (): Promise<TenantInsightsDto | null> => {
    try {
      const response = await apiClient.get('/api/tenant/insights');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch tenant insights:', error);
      return null;
    }
  },

  getRecentLogins: async (limit: number = 10): Promise<RecentLoginDto[]> => {
    try {
      const response = await apiClient.get('/api/tenant/audit/logins', {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch recent logins:', error);
      return [];
    }
  },

  getUserActivityStats: async (days: number = 7): Promise<UserActivityStatsDto[]> => {
    try {
      const response = await apiClient.get('/api/tenant/insights/user-activity', {
        params: { days }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch user activity stats:', error);
      return [];
    }
  },

  getApplicationUsage: async (): Promise<ApplicationUsageDto[]> => {
    try {
      const response = await apiClient.get('/api/tenant/insights/application-usage');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch application usage:', error);
      return [];
    }
  },

  // ==================== TENANT USERS ====================
  getUsers: async (page: number = 1, pageSize: number = 50, search?: string): Promise<PaginatedResult<TenantUserDto>> => {
    try {
      const response = await apiClient.get('/api/tenant/users', {
        params: { page, pageSize, search }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch users:', error);
      return { items: [], total: 0, page: 1, pageSize, totalPages: 0 };
    }
  },

  getUserById: async (userId: string): Promise<TenantUserDto | null> => {
    try {
      const response = await apiClient.get(`/api/tenant/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch user:', error);
      return null;
    }
  },

  createUser: async (data: CreateTenantUserDto): Promise<TenantUserDto> => {
    const response = await apiClient.post('/api/tenant/users', data);
    return response.data;
  },

  updateUser: async (userId: string, data: UpdateTenantUserDto): Promise<TenantUserDto> => {
    const response = await apiClient.put(`/api/tenant/users/${userId}`, data);
    return response.data;
  },

  deleteUser: async (userId: string): Promise<void> => {
    await apiClient.delete(`/api/tenant/users/${userId}`);
  },

  suspendUser: async (userId: string): Promise<TenantUserDto> => {
    const response = await apiClient.patch(`/api/tenant/users/${userId}/status`, {
      status: 'Suspended'
    });
    return response.data;
  },

  activateUser: async (userId: string): Promise<TenantUserDto> => {
    const response = await apiClient.patch(`/api/tenant/users/${userId}/status`, {
      status: 'Active'
    });
    return response.data;
  },

  resetUserPassword: async (userId: string): Promise<void> => {
    await apiClient.post(`/api/tenant/users/${userId}/reset-password`);
  },

  // ==================== TENANT APPLICATIONS ====================
  getApplications: async (params?: { page?: number; pageSize?: number; search?: string; type?: string; status?: string }): Promise<PaginatedResult<any>> => {
    try {
      const response = await apiClient.get('/api/tenant/applications', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch applications:', error);
      return { items: [], total: 0, page: 1, pageSize: 50, totalPages: 0 };
    }
  },

  getApplicationById: async (appId: string): Promise<any> => {
    try {
      const response = await apiClient.get(`/api/tenant/applications/${appId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch application:', error);
      return null;
    }
  },

  createApplication: async (data: {
    name: string;
    type: 'web' | 'mobile' | 'desktop' | 'api';
    description?: string;
    redirectUris?: string[];
    allowedScopes?: string[];
  }): Promise<any> => {
    const response = await apiClient.post('/api/tenant/applications', data);
    return response.data;
  },

  updateApplication: async (appId: string, data: any): Promise<any> => {
    const response = await apiClient.put(`/api/tenant/applications/${appId}`, data);
    return response.data;
  },

  deleteApplication: async (appId: string): Promise<void> => {
    await apiClient.delete(`/api/tenant/applications/${appId}`);
  },

  regenerateClientSecret: async (appId: string): Promise<{ clientSecret: string }> => {
    const response = await apiClient.post(`/api/tenant/applications/${appId}/regenerate-secret`);
    return response.data;
  },

  toggleApplicationStatus: async (appId: string, status: 'active' | 'inactive'): Promise<any> => {
    const response = await apiClient.patch(`/api/tenant/applications/${appId}/status`, { status });
    return response.data;
  },

  // ==================== TENANT ROLES ====================
  getRoles: async (params?: { page?: number; pageSize?: number; search?: string }): Promise<PaginatedResult<any>> => {
    try {
      const response = await apiClient.get('/api/tenant/roles', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch roles:', error);
      return { items: [], total: 0, page: 1, pageSize: 50, totalPages: 0 };
    }
  },

  getRoleById: async (roleId: string): Promise<any> => {
    try {
      const response = await apiClient.get(`/api/tenant/roles/${roleId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch role:', error);
      return null;
    }
  },

  createRole: async (data: {
    name: string;
    description?: string;
    permissions: string[];
  }): Promise<any> => {
    const response = await apiClient.post('/api/tenant/roles', data);
    return response.data;
  },

  updateRole: async (roleId: string, data: any): Promise<any> => {
    const response = await apiClient.put(`/api/tenant/roles/${roleId}`, data);
    return response.data;
  },

  deleteRole: async (roleId: string): Promise<void> => {
    await apiClient.delete(`/api/tenant/roles/${roleId}`);
  },

  getRolePermissions: async (roleId: string): Promise<string[]> => {
    try {
      const response = await apiClient.get(`/api/tenant/roles/${roleId}/permissions`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch role permissions:', error);
      return [];
    }
  },

  getAvailablePermissions: async (): Promise<string[]> => {
    try {
      const response = await apiClient.get('/api/tenant/permissions');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch available permissions:', error);
      return [];
    }
  },

  // ==================== TENANT AUDIT ====================
  getAuditLogs: async (params?: {
    page?: number;
    pageSize?: number;
    startDate?: string;
    endDate?: string;
    action?: string;
    userId?: string;
    resource?: string;
    status?: string;
  }): Promise<PaginatedResult<any>> => {
    try {
      const response = await apiClient.get('/api/tenant/audit', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
      return { items: [], total: 0, page: 1, pageSize: 50, totalPages: 0 };
    }
  },

  exportAuditLogs: async (params?: {
    startDate?: string;
    endDate?: string;
    format?: 'csv' | 'json' | 'pdf';
  }): Promise<Blob> => {
    const response = await apiClient.get('/api/tenant/audit/export', {
      params,
      responseType: 'blob'
    });
    return response.data;
  },

  // ==================== TENANT API KEYS ====================
  getApiKeys: async (): Promise<any[]> => {
    try {
      const response = await apiClient.get('/api/tenant/api-keys');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch API keys:', error);
      return [];
    }
  },

  createApiKey: async (data: { name: string; scope: string[]; expiresIn?: number }): Promise<any> => {
    const response = await apiClient.post('/api/tenant/api-keys', data);
    return response.data;
  },

  revokeApiKey: async (keyId: string): Promise<void> => {
    await apiClient.delete(`/api/tenant/api-keys/${keyId}`);
  },

  // ==================== TENANT BACKUPS ====================
  getBackups: async (): Promise<any[]> => {
    try {
      const response = await apiClient.get('/api/tenant/backups');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch backups:', error);
      return [];
    }
  },

  createBackup: async (data: any): Promise<any> => {
    const response = await apiClient.post('/api/tenant/backups', data);
    return response.data;
  },

  restoreBackup: async (backupId: string): Promise<any> => {
    const response = await apiClient.post(`/api/tenant/backups/${backupId}/restore`);
    return response.data;
  },

  downloadBackup: async (backupId: string): Promise<any> => {
    const response = await apiClient.get(`/api/tenant/backups/${backupId}/download`, { responseType: 'blob' });
    return response.data;
  },

  // ==================== TENANT BRANDING ====================
  getBranding: async (): Promise<any> => {
    try {
      const response = await apiClient.get('/api/tenant/branding');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch branding:', error);
      return null;
    }
  },

  updateBranding: async (data: any): Promise<any> => {
    const response = await apiClient.put('/api/tenant/branding', data);
    return response.data;
  },

  // ==================== TENANT CERTIFICATES ====================
  getCertificates: async (): Promise<any[]> => {
    try {
      const response = await apiClient.get('/api/tenant/certificates');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch certificates:', error);
      return [];
    }
  },

  createCertificate: async (data: any): Promise<any> => {
    const response = await apiClient.post('/api/tenant/certificates', data);
    return response.data;
  },

  deleteCertificate: async (certId: string): Promise<void> => {
    await apiClient.delete(`/api/tenant/certificates/${certId}`);
  },

  // ==================== TENANT DATA RETENTION ====================
  getDataRetentionPolicies: async (): Promise<any[]> => {
    try {
      const response = await apiClient.get('/api/tenant/data-retention');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch data retention policies:', error);
      return [];
    }
  },

  updateDataRetentionPolicy: async (policyId: string, data: any): Promise<any> => {
    const response = await apiClient.put(`/api/tenant/data-retention/${policyId}`, data);
    return response.data;
  },

  // ==================== TENANT DELEGATED ADMINS ====================
  getDelegatedAdmins: async (): Promise<any[]> => {
    try {
      const response = await apiClient.get('/api/tenant/delegated-admins');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch delegated admins:', error);
      return [];
    }
  },

  getDelegatedAdminById: async (adminId: string): Promise<any> => {
    try {
      const response = await apiClient.get(`/api/tenant/delegated-admins/${adminId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch delegated admin:', error);
      return null;
    }
  },

  createDelegatedAdmin: async (data: any): Promise<any> => {
    const response = await apiClient.post('/api/tenant/delegated-admins', data);
    return response.data;
  },

  updateDelegatedAdmin: async (adminId: string, data: any): Promise<any> => {
    const response = await apiClient.put(`/api/tenant/delegated-admins/${adminId}`, data);
    return response.data;
  },

  deleteDelegatedAdmin: async (adminId: string): Promise<void> => {
    await apiClient.delete(`/api/tenant/delegated-admins/${adminId}`);
  },

  // ==================== TENANT DOMAINS ====================
  getDomains: async (): Promise<any[]> => {
    try {
      const response = await apiClient.get('/api/tenant/domains');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch domains:', error);
      return [];
    }
  },

  addDomain: async (data: { domain: string }): Promise<any> => {
    const response = await apiClient.post('/api/tenant/domains', data);
    return response.data;
  },

  verifyDomain: async (domainId: string): Promise<any> => {
    const response = await apiClient.post(`/api/tenant/domains/${domainId}/verify`);
    return response.data;
  },

  deleteDomain: async (domainId: string): Promise<void> => {
    await apiClient.delete(`/api/tenant/domains/${domainId}`);
  },

  // ==================== TENANT EXPORTS ====================
  getExports: async (): Promise<any[]> => {
    try {
      const response = await apiClient.get('/api/tenant/exports');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch exports:', error);
      return [];
    }
  },

  createExport: async (data: any): Promise<any> => {
    const response = await apiClient.post('/api/tenant/exports', data);
    return response.data;
  },

  downloadExport: async (exportId: string): Promise<any> => {
    const response = await apiClient.get(`/api/tenant/exports/${exportId}/download`, { responseType: 'blob' });
    return response.data;
  },

  // ==================== TENANT IMPORTS ====================
  getImports: async (): Promise<any[]> => {
    try {
      const response = await apiClient.get('/api/tenant/imports');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch imports:', error);
      return [];
    }
  },

  createImport: async (data: FormData): Promise<any> => {
    const response = await apiClient.post('/api/tenant/imports', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  // ==================== TENANT EXTENSIBILITY ====================
  getExtensions: async (): Promise<any[]> => {
    try {
      const response = await apiClient.get('/api/tenant/extensions');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch extensions:', error);
      return [];
    }
  },

  toggleExtension: async (extensionId: string, enabled: boolean): Promise<any> => {
    const response = await apiClient.patch(`/api/tenant/extensions/${extensionId}`, { enabled });
    return response.data;
  },

  // ==================== TENANT FEDERATION ====================
  getIdentityProviders: async (): Promise<any[]> => {
    try {
      const response = await apiClient.get('/api/tenant/identity-providers');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch identity providers:', error);
      return [];
    }
  },

  createIdentityProvider: async (data: any): Promise<any> => {
    const response = await apiClient.post('/api/tenant/identity-providers', data);
    return response.data;
  },

  updateIdentityProvider: async (providerId: string, data: any): Promise<any> => {
    const response = await apiClient.put(`/api/tenant/identity-providers/${providerId}`, data);
    return response.data;
  },

  deleteIdentityProvider: async (providerId: string): Promise<void> => {
    await apiClient.delete(`/api/tenant/identity-providers/${providerId}`);
  },

  // ==================== TENANT INTEGRATIONS ====================
  getIntegrations: async (): Promise<any[]> => {
    try {
      const response = await apiClient.get('/api/tenant/integrations');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch integrations:', error);
      return [];
    }
  },

  getIntegrationById: async (integrationId: string): Promise<any> => {
    try {
      const response = await apiClient.get(`/api/tenant/integrations/${integrationId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch integration:', error);
      return null;
    }
  },

  createIntegration: async (data: any): Promise<any> => {
    const response = await apiClient.post('/api/tenant/integrations', data);
    return response.data;
  },

  updateIntegration: async (integrationId: string, data: any): Promise<any> => {
    const response = await apiClient.put(`/api/tenant/integrations/${integrationId}`, data);
    return response.data;
  },

  deleteIntegration: async (integrationId: string): Promise<void> => {
    await apiClient.delete(`/api/tenant/integrations/${integrationId}`);
  },

  // ==================== TENANT SCOPES ====================
  getScopes: async (): Promise<any[]> => {
    try {
      const response = await apiClient.get('/api/tenant/scopes');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch scopes:', error);
      return [];
    }
  },

  createScope: async (data: any): Promise<any> => {
    const response = await apiClient.post('/api/tenant/scopes', data);
    return response.data;
  },

  updateScope: async (scopeId: string, data: any): Promise<any> => {
    const response = await apiClient.put(`/api/tenant/scopes/${scopeId}`, data);
    return response.data;
  },

  deleteScope: async (scopeId: string): Promise<void> => {
    await apiClient.delete(`/api/tenant/scopes/${scopeId}`);
  },

  // ==================== TENANT SERVICE ACCOUNTS ====================
  getServiceAccounts: async (): Promise<any[]> => {
    try {
      const response = await apiClient.get('/api/tenant/service-accounts');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch service accounts:', error);
      return [];
    }
  },

  getServiceAccountById: async (accountId: string): Promise<any> => {
    try {
      const response = await apiClient.get(`/api/tenant/service-accounts/${accountId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch service account:', error);
      return null;
    }
  },

  createServiceAccount: async (data: any): Promise<any> => {
    const response = await apiClient.post('/api/tenant/service-accounts', data);
    return response.data;
  },

  updateServiceAccount: async (accountId: string, data: any): Promise<any> => {
    const response = await apiClient.put(`/api/tenant/service-accounts/${accountId}`, data);
    return response.data;
  },

  deleteServiceAccount: async (accountId: string): Promise<void> => {
    await apiClient.delete(`/api/tenant/service-accounts/${accountId}`);
  },

  rotateServiceAccountSecret: async (accountId: string): Promise<any> => {
    const response = await apiClient.post(`/api/tenant/service-accounts/${accountId}/rotate-secret`);
    return response.data;
  },

  // ==================== TENANT SETTINGS ====================
  getSettings: async (): Promise<any> => {
    try {
      const response = await apiClient.get('/api/tenant/settings');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch tenant settings:', error);
      return null;
    }
  },

  updateSettings: async (data: any): Promise<any> => {
    const response = await apiClient.put('/api/tenant/settings', data);
    return response.data;
  },

  // ==================== TENANT TOKENS ====================
  getTokens: async (): Promise<any[]> => {
    try {
      const response = await apiClient.get('/api/tenant/tokens');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch tokens:', error);
      return [];
    }
  },

  revokeToken: async (tokenId: string): Promise<void> => {
    await apiClient.delete(`/api/tenant/tokens/${tokenId}`);
  },

  revokeAllTokens: async (userId?: string): Promise<void> => {
    await apiClient.post('/api/tenant/tokens/revoke-all', { userId });
  },

  // ==================== TENANT WEBHOOKS ====================
  getWebhooks: async (): Promise<any[]> => {
    try {
      const response = await apiClient.get('/api/tenant/webhooks');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch webhooks:', error);
      return [];
    }
  },

  createWebhook: async (data: any): Promise<any> => {
    const response = await apiClient.post('/api/tenant/webhooks', data);
    return response.data;
  },

  updateWebhook: async (webhookId: string, data: any): Promise<any> => {
    const response = await apiClient.put(`/api/tenant/webhooks/${webhookId}`, data);
    return response.data;
  },

  deleteWebhook: async (webhookId: string): Promise<void> => {
    await apiClient.delete(`/api/tenant/webhooks/${webhookId}`);
  },

  testWebhook: async (webhookId: string): Promise<any> => {
    const response = await apiClient.post(`/api/tenant/webhooks/${webhookId}/test`);
    return response.data;
  },

  getWebhookEvents: async (webhookId: string): Promise<any[]> => {
    try {
      const response = await apiClient.get(`/api/tenant/webhooks/${webhookId}/events`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch webhook events:', error);
      return [];
    }
  },

  // ==================== BRANDING ====================
  updateBrandingSettings: async (data: any): Promise<any> => {
    const response = await apiClient.put('/api/tenant/settings/branding', data);
    return response.data;
  },

  // ==================== ORG UNITS ====================
  getOrgUnitsTree: async (): Promise<any[]> => {
    try {
      const response = await apiClient.get('/api/tenant/org-units/tree');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch org units tree:', error);
      return [];
    }
  },

  // ==================== TOKENS (additional methods) ====================
  createToken: async (data: any): Promise<any> => {
    const response = await apiClient.post('/api/tenant/tokens', data);
    return response.data;
  },

  rotateToken: async (tokenId: string): Promise<any> => {
    const response = await apiClient.post(`/api/tenant/tokens/${tokenId}/rotate`);
    return response.data;
  },
};

export default tenantService;
