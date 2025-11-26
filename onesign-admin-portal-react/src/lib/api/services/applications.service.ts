import apiClient from '@/services/apiClient';

// Application Types based on spec
export interface ApplicationDto {
  id: string;
  name: string;
  clientId: string;
  applicationType: number | string;
  grantType?: number;
  isEnabled?: boolean;
  redirectUris?: RedirectUriDto[];
  clientSecrets?: ClientSecretDto[];
  createdAt?: string;
  updatedAt?: string;
}

export interface RedirectUriDto {
  id: string;
  uri: string;
}

export interface ClientSecretDto {
  id: string;
  description: string;
  createdAt: string;
}

export interface CreateApplicationDto {
  tenantId?: string;
  name: string;
  applicationType: number;
  grantType?: number;
  redirectUris?: string[];
}

export interface UpdateApplicationDto {
  name?: string;
  applicationType?: number;
  grantType?: number;
  isEnabled?: boolean;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export const applicationsService = {
  // ==================== APPLICATIONS (Spec: /api/tenant/applications) ====================

  /**
   * GET /api/tenant/applications - لیست اپلیکیشن‌ها
   */
  getApplications: async (params?: {
    pageNumber?: number;
    pageSize?: number;
    orgUnitId?: string;
    tenantId?: string;
  }): Promise<PaginatedResult<ApplicationDto>> => {
    try {
      const response = await apiClient.get('/api/tenant/applications', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch applications:', error);
      return { items: [], total: 0, page: 1, pageSize: 10, totalPages: 0 };
    }
  },

  /**
   * GET /api/tenant/applications/{id} - جزئیات اپلیکیشن
   */
  getApplicationById: async (tenantId: string, appId: string): Promise<ApplicationDto | null> => {
    try {
      const response = await apiClient.get(`/api/tenant/applications/${appId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch application:', error);
      return null;
    }
  },

  /**
   * POST /api/tenant/applications - ثبت اپلیکیشن جدید
   */
  createApplication: async (data: CreateApplicationDto): Promise<ApplicationDto> => {
    const response = await apiClient.post('/api/tenant/applications', data);
    return response.data;
  },

  /**
   * PUT /api/tenant/applications/{id} - به‌روزرسانی اپلیکیشن
   */
  updateApplication: async (tenantId: string, appId: string, data: UpdateApplicationDto): Promise<ApplicationDto> => {
    const response = await apiClient.put(`/api/tenant/applications/${appId}`, data);
    return response.data;
  },

  /**
   * DELETE /api/tenant/applications/{id} - حذف اپلیکیشن
   */
  deleteApplication: async (tenantId: string, appId: string): Promise<void> => {
    await apiClient.delete(`/api/tenant/applications/${appId}`);
  },

  /**
   * POST /api/tenant/applications/{id}/regenerate-secret - تولید مجدد Secret
   */
  regenerateSecret: async (tenantId: string, appId: string): Promise<{ clientSecret: string }> => {
    const response = await apiClient.post(`/api/tenant/applications/${appId}/regenerate-secret`);
    return response.data;
  },

  /**
   * GET /api/tenant/applications/{id}/org-units - واحدهای سازمانی اپ
   */
  getApplicationOrgUnits: async (tenantId: string | null, appId: string): Promise<{ orgUnitIds: string[] }> => {
    try {
      const response = await apiClient.get(`/api/tenant/applications/${appId}/org-units`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch application org units:', error);
      return { orgUnitIds: [] };
    }
  },

  /**
   * PUT /api/tenant/applications/{id}/org-units - تخصیص واحدهای سازمانی به اپ
   */
  assignOrgUnits: async (tenantId: string | null, appId: string, orgUnitIds: string[]): Promise<void> => {
    await apiClient.put(`/api/tenant/applications/${appId}/org-units`, { orgUnitIds });
  },

  // ==================== REDIRECT URIs ====================

  /**
   * POST /api/tenant/applications/{id}/redirect-uris - افزودن Redirect URI
   */
  addRedirectUri: async (tenantId: string | null, appId: string, uri: string): Promise<RedirectUriDto> => {
    const response = await apiClient.post(`/api/tenant/applications/${appId}/redirect-uris`, { uri });
    return response.data;
  },

  /**
   * DELETE /api/tenant/applications/redirect-uris/{id} - حذف Redirect URI
   */
  removeRedirectUri: async (tenantId: string | null, redirectUriId: string): Promise<void> => {
    await apiClient.delete(`/api/tenant/applications/redirect-uris/${redirectUriId}`);
  },

  // ==================== CLIENT SECRETS ====================

  /**
   * POST /api/tenant/applications/{id}/secrets - افزودن Client Secret
   */
  addClientSecret: async (tenantId: string | null, appId: string, description: string): Promise<{ secretValue: string; id: string }> => {
    const response = await apiClient.post(`/api/tenant/applications/${appId}/secrets`, { description });
    return response.data;
  },

  /**
   * DELETE /api/tenant/applications/secrets/{id} - حذف Client Secret
   */
  removeClientSecret: async (tenantId: string | null, secretId: string): Promise<void> => {
    await apiClient.delete(`/api/tenant/applications/secrets/${secretId}`);
  },

  // ==================== ORG UNITS TREE (Used by apps page) ====================

  /**
   * GET /api/tenant/orgunits/tree - دریافت درخت سازمانی
   */
  getOrgUnitsTree: async (tenantId: string): Promise<any[]> => {
    try {
      const response = await apiClient.get('/api/tenant/orgunits/tree');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch org units tree:', error);
      return [];
    }
  },
};

export default applicationsService;
