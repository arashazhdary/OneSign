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
  getApplications: async (): Promise<any[]> => {
    try {
      const response = await apiClient.get('/api/tenant/applications');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch applications:', error);
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
  }): Promise<any> => {
    try {
      const response = await apiClient.get('/api/tenant/audit', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
      return { items: [], total: 0 };
    }
  },
};

export default tenantService;
