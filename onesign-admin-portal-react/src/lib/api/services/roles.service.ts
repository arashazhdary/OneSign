import apiClient from '@/services/apiClient';

// Types based on spec
export interface RoleDto {
  id: string;
  tenantId?: string;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
  isSystem: boolean;
  parentRoleId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateRoleDto {
  tenantId?: string;
  name: string;
  description?: string;
  permissions: string[];
  parentRoleId?: string;
}

export interface UpdateRoleDto {
  name?: string;
  description?: string;
  permissions?: string[];
  parentRoleId?: string;
}

export interface PermissionDto {
  id: string;
  resource: string;
  action: string;
  description: string;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export const rolesService = {
  // ==================== ROLES (Spec: /api/tenant/authorization/roles) ====================

  /**
   * GET /api/tenant/authorization/roles - لیست نقش‌ها
   */
  getRoles: async (params?: {
    page?: number;
    pageSize?: number;
    search?: string;
  }): Promise<PaginatedResult<RoleDto>> => {
    try {
      const response = await apiClient.get('/api/tenant/authorization/roles', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch roles:', error);
      return { items: [], total: 0, page: 1, pageSize: 10, totalPages: 0 };
    }
  },

  /**
   * GET /api/tenant/authorization/roles/{id} - جزئیات نقش
   */
  getRoleById: async (roleId: string): Promise<RoleDto | null> => {
    try {
      const response = await apiClient.get(`/api/tenant/authorization/roles/${roleId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch role:', error);
      return null;
    }
  },

  /**
   * POST /api/tenant/authorization/roles - ایجاد نقش جدید
   */
  createRole: async (data: CreateRoleDto): Promise<RoleDto> => {
    const response = await apiClient.post('/api/tenant/authorization/roles', data);
    return response.data;
  },

  /**
   * PUT /api/tenant/authorization/roles/{id} - به‌روزرسانی نقش
   */
  updateRole: async (roleId: string, data: UpdateRoleDto): Promise<RoleDto> => {
    const response = await apiClient.put(`/api/tenant/authorization/roles/${roleId}`, data);
    return response.data;
  },

  /**
   * DELETE /api/tenant/authorization/roles/{id} - حذف نقش
   */
  deleteRole: async (roleId: string): Promise<void> => {
    await apiClient.delete(`/api/tenant/authorization/roles/${roleId}`);
  },

  /**
   * GET /api/tenant/authorization/permissions - لیست دسترسی‌های موجود
   */
  getPermissions: async (): Promise<PermissionDto[]> => {
    try {
      const response = await apiClient.get('/api/tenant/authorization/permissions');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch permissions:', error);
      return [];
    }
  },

  /**
   * GET /api/tenant/authorization/roles/{id}/users - کاربران نقش
   */
  getRoleUsers: async (roleId: string, params?: {
    page?: number;
    pageSize?: number;
  }): Promise<any> => {
    try {
      const response = await apiClient.get(`/api/tenant/authorization/roles/${roleId}/users`, { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch role users:', error);
      return { items: [], total: 0 };
    }
  },

  /**
   * POST /api/tenant/authorization/roles/{id}/users - تخصیص کاربران به نقش
   */
  assignUsersToRole: async (roleId: string, userIds: string[]): Promise<void> => {
    await apiClient.post(`/api/tenant/authorization/roles/${roleId}/users`, { userIds });
  },

  /**
   * DELETE /api/tenant/authorization/roles/{roleId}/users/{userId} - حذف کاربر از نقش
   */
  removeUserFromRole: async (roleId: string, userId: string): Promise<void> => {
    await apiClient.delete(`/api/tenant/authorization/roles/${roleId}/users/${userId}`);
  },

  /**
   * POST /api/tenant/authorization/roles/{id}/clone - کلون کردن نقش
   */
  cloneRole: async (roleId: string, newName: string): Promise<RoleDto> => {
    const response = await apiClient.post(`/api/tenant/authorization/roles/${roleId}/clone`, { name: newName });
    return response.data;
  },
};

export default rolesService;
