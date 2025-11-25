// Admin Service - API methods for admin portal dashboard and management
// Maps to the Swagger API endpoints for global/admin operations

import apiClient from '@/services/apiClient';

// Types based on Swagger schema
export interface GlobalInsightsDto {
  totalTenants: number;
  activeTenants: number;
  totalUsers: number;
  totalApplications: number;
  activeUsers24h: number;
  apiCallsToday: number;
  storageUsedGB?: number;
  storageAvailableGB?: number;
}

export interface ServiceHealthDto {
  name: string;
  status: 'healthy' | 'degraded' | 'down';
  responseTime: number;
  uptime: number;
  lastChecked?: string;
}

export interface SystemHealthDto {
  status: 'healthy' | 'degraded' | 'down';
  services: ServiceHealthDto[];
  database: {
    status: 'healthy' | 'degraded' | 'down';
    connections: number;
    maxConnections: number;
  };
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  cpu: {
    usage: number;
  };
  lastUpdated?: string;
}

export interface ActivityDto {
  id: string;
  timestamp: string;
  type: string;
  description: string;
  severity: 'info' | 'warning' | 'critical';
  user?: string;
  tenantId?: string;
  ipAddress?: string;
}

export interface AlertDto {
  id: string;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  timestamp: string;
  isRead: boolean;
  source?: string;
}

export interface PlatformAdminDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'SuperAdmin' | 'PlatformAdmin' | 'SupportAdmin';
  permissions: string[];
  status: 'Active' | 'Inactive' | 'Suspended';
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAdminDto {
  email: string;
  firstName: string;
  lastName: string;
  role: 'SuperAdmin' | 'PlatformAdmin' | 'SupportAdmin';
  permissions: string[];
}

export interface UpdateAdminDto {
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: 'SuperAdmin' | 'PlatformAdmin' | 'SupportAdmin';
  permissions?: string[];
  status?: 'Active' | 'Inactive' | 'Suspended';
}

export interface AdminActivityDto {
  id: string;
  timestamp: string;
  action: string;
  details: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PlatformRoleDto {
  id: string;
  name: string;
  description: string;
  type: 'system' | 'custom';
  permissions: string[];
  usersCount: number;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePlatformRoleDto {
  name: string;
  description: string;
  permissions: string[];
  isDefault?: boolean;
}

export interface UpdatePlatformRoleDto {
  name?: string;
  description?: string;
  permissions?: string[];
  isDefault?: boolean;
}

export interface ApiKeyDto {
  id: string;
  name: string;
  key?: string;
  prefix: string;
  permissions: string[];
  status: 'Active' | 'Revoked' | 'Expired';
  expiresAt?: string;
  lastUsedAt?: string;
  createdAt: string;
  createdBy: string;
}

export interface CreateApiKeyDto {
  name: string;
  permissions: string[];
  expiresAt?: string;
}

// Admin Service
export const adminService = {
  // ==================== GLOBAL INSIGHTS ====================
  getGlobalInsights: async (): Promise<GlobalInsightsDto | null> => {
    try {
      const response = await apiClient.get('/api/global/insights');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch global insights:', error);
      return null;
    }
  },

  // ==================== SYSTEM HEALTH ====================
  getSystemHealth: async (): Promise<SystemHealthDto | null> => {
    try {
      const response = await apiClient.get('/api/health');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch system health:', error);
      return null;
    }
  },

  getDetailedHealth: async (): Promise<SystemHealthDto | null> => {
    try {
      const response = await apiClient.get('/api/health/detailed');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch detailed health:', error);
      return null;
    }
  },

  // ==================== ACTIVITIES ====================
  getRecentActivities: async (limit: number = 10): Promise<ActivityDto[]> => {
    try {
      const response = await apiClient.get('/api/global/observability/activities', {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch activities:', error);
      return [];
    }
  },

  // ==================== ALERTS ====================
  getActiveAlerts: async (): Promise<AlertDto[]> => {
    try {
      const response = await apiClient.get('/api/global/observability/alerts');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
      return [];
    }
  },

  dismissAlert: async (alertId: string): Promise<void> => {
    try {
      await apiClient.post(`/api/global/observability/alerts/${alertId}/dismiss`);
    } catch (error) {
      console.error('Failed to dismiss alert:', error);
      throw error;
    }
  },

  // ==================== PLATFORM ADMINS ====================
  getAdmins: async (page: number = 1, pageSize: number = 50): Promise<PaginatedResult<PlatformAdminDto>> => {
    try {
      const response = await apiClient.get('/api/admin/users', {
        params: { page, pageSize }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch admins:', error);
      return { items: [], total: 0, page: 1, pageSize, totalPages: 0 };
    }
  },

  getAdminById: async (adminId: string): Promise<PlatformAdminDto | null> => {
    try {
      const response = await apiClient.get(`/api/admin/users/${adminId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch admin:', error);
      return null;
    }
  },

  createAdmin: async (data: CreateAdminDto): Promise<PlatformAdminDto> => {
    const response = await apiClient.post('/api/admin/users', data);
    return response.data;
  },

  updateAdmin: async (adminId: string, data: UpdateAdminDto): Promise<PlatformAdminDto> => {
    const response = await apiClient.put(`/api/admin/users/${adminId}`, data);
    return response.data;
  },

  deleteAdmin: async (adminId: string): Promise<void> => {
    await apiClient.delete(`/api/admin/users/${adminId}`);
  },

  suspendAdmin: async (adminId: string): Promise<PlatformAdminDto> => {
    const response = await apiClient.patch(`/api/admin/users/${adminId}/status`, {
      status: 'Suspended'
    });
    return response.data;
  },

  activateAdmin: async (adminId: string): Promise<PlatformAdminDto> => {
    const response = await apiClient.patch(`/api/admin/users/${adminId}/status`, {
      status: 'Active'
    });
    return response.data;
  },

  getAdminActivities: async (adminId: string, limit: number = 20): Promise<AdminActivityDto[]> => {
    try {
      const response = await apiClient.get(`/api/admin/users/${adminId}/activities`, {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch admin activities:', error);
      return [];
    }
  },

  // ==================== PLATFORM ROLES ====================
  getPlatformRoles: async (): Promise<PlatformRoleDto[]> => {
    try {
      const response = await apiClient.get('/api/admin/roles');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch platform roles:', error);
      return [];
    }
  },

  getPlatformRoleById: async (roleId: string): Promise<PlatformRoleDto | null> => {
    try {
      const response = await apiClient.get(`/api/admin/roles/${roleId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch platform role:', error);
      return null;
    }
  },

  createPlatformRole: async (data: CreatePlatformRoleDto): Promise<PlatformRoleDto> => {
    const response = await apiClient.post('/api/admin/roles', data);
    return response.data;
  },

  updatePlatformRole: async (roleId: string, data: UpdatePlatformRoleDto): Promise<PlatformRoleDto> => {
    const response = await apiClient.put(`/api/admin/roles/${roleId}`, data);
    return response.data;
  },

  deletePlatformRole: async (roleId: string): Promise<void> => {
    await apiClient.delete(`/api/admin/roles/${roleId}`);
  },

  getAvailablePermissions: async (): Promise<string[]> => {
    try {
      const response = await apiClient.get('/api/admin/permissions');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch available permissions:', error);
      return [];
    }
  },

  // ==================== API KEYS ====================
  getApiKeys: async (): Promise<ApiKeyDto[]> => {
    try {
      const response = await apiClient.get('/api/admin/api-keys');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch API keys:', error);
      return [];
    }
  },

  getApiKeyById: async (keyId: string): Promise<ApiKeyDto | null> => {
    try {
      const response = await apiClient.get(`/api/admin/api-keys/${keyId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch API key:', error);
      return null;
    }
  },

  createApiKey: async (data: CreateApiKeyDto): Promise<ApiKeyDto> => {
    const response = await apiClient.post('/api/admin/api-keys', data);
    return response.data;
  },

  revokeApiKey: async (keyId: string): Promise<void> => {
    await apiClient.delete(`/api/admin/api-keys/${keyId}`);
  },
};

export default adminService;
