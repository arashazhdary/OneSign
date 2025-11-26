import apiClient from '@/services/apiClient';

// Types based on spec
export interface OrgUnitDto {
  id: string;
  tenantId: string;
  parentId: string | null;
  name: string;
  code?: string;
  level: number;
  status: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrgUnitTreeNode {
  id: string;
  parentId: string | null;
  name: string;
  code?: string;
  level: number;
  status: number;
  children: OrgUnitTreeNode[];
}

export interface CreateOrgUnitDto {
  tenantId?: string;
  parentId: string | null;
  name: string;
  code?: string;
}

export interface UpdateOrgUnitDto {
  name?: string;
  code?: string;
  status?: number;
}

export const orgUnitsService = {
  // ==================== ORG UNITS (Spec: /api/tenant/orgunits) ====================

  /**
   * GET /api/tenant/orgunits/tree - دریافت درخت سازمانی
   */
  getTree: async (): Promise<OrgUnitTreeNode[]> => {
    try {
      const response = await apiClient.get('/api/tenant/orgunits/tree');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch org units tree:', error);
      return [];
    }
  },

  /**
   * GET /api/tenant/orgunits/{id} - دریافت جزئیات واحد
   */
  getById: async (orgUnitId: string): Promise<OrgUnitDto | null> => {
    try {
      const response = await apiClient.get(`/api/tenant/orgunits/${orgUnitId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch org unit:', error);
      return null;
    }
  },

  /**
   * POST /api/tenant/orgunits - ایجاد واحد جدید
   */
  create: async (data: CreateOrgUnitDto): Promise<OrgUnitDto> => {
    const response = await apiClient.post('/api/tenant/orgunits', data);
    return response.data;
  },

  /**
   * PUT /api/tenant/orgunits/{id} - به‌روزرسانی واحد
   */
  update: async (orgUnitId: string, data: UpdateOrgUnitDto): Promise<OrgUnitDto> => {
    const response = await apiClient.put(`/api/tenant/orgunits/${orgUnitId}`, data);
    return response.data;
  },

  /**
   * DELETE /api/tenant/orgunits/{id} - حذف واحد
   */
  delete: async (orgUnitId: string): Promise<void> => {
    await apiClient.delete(`/api/tenant/orgunits/${orgUnitId}`);
  },

  /**
   * POST /api/tenant/orgunits/{id}/move - انتقال واحد به والد جدید
   */
  move: async (orgUnitId: string, newParentId: string | null): Promise<OrgUnitDto> => {
    const response = await apiClient.post(`/api/tenant/orgunits/${orgUnitId}/move`, {
      newParentId
    });
    return response.data;
  },

  /**
   * GET /api/tenant/orgunits/{id}/users - کاربران واحد سازمانی
   */
  getUsers: async (orgUnitId: string, params?: {
    page?: number;
    pageSize?: number;
  }): Promise<any> => {
    try {
      const response = await apiClient.get(`/api/tenant/orgunits/${orgUnitId}/users`, { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch org unit users:', error);
      return { items: [], total: 0 };
    }
  },

  /**
   * GET /api/tenant/orgunits/{id}/applications - اپلیکیشن‌های واحد سازمانی
   */
  getApplications: async (orgUnitId: string): Promise<any[]> => {
    try {
      const response = await apiClient.get(`/api/tenant/orgunits/${orgUnitId}/applications`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch org unit applications:', error);
      return [];
    }
  },
};

export default orgUnitsService;
