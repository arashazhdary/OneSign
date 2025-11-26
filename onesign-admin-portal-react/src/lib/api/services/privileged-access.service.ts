import apiClient from '@/services/apiClient';

// Types based on spec
export interface JitGrantDto {
  id: string;
  userId: string;
  userName?: string;
  resourceType: string;
  resourceId: string;
  resourceName?: string;
  grantedAt: string;
  expiresAt: string;
  status: 'Active' | 'Expired' | 'Revoked';
  justification?: string;
}

export interface JitRequestDto {
  resourceType: string;
  resourceId: string;
  justification: string;
  durationMinutes: number;
}

export interface BreakGlassAccountDto {
  id: string;
  name: string;
  description?: string;
  status: 'Available' | 'Active' | 'Locked';
  lastActivatedAt?: string;
  lastActivatedBy?: string;
  createdAt: string;
}

export interface PrivilegedSessionDto {
  id: string;
  userId: string;
  userName?: string;
  sessionType: string;
  startedAt: string;
  endedAt?: string;
  status: 'Active' | 'Ended' | 'Terminated';
  ipAddress?: string;
  actions?: number;
}

export interface PamDashboardDto {
  activeJitGrants: number;
  totalJitGrantsToday: number;
  activeBreakGlassAccounts: number;
  activeSessions: number;
  recentActivity: any[];
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export const privilegedAccessService = {
  // ==================== PRIVILEGED ACCESS (Spec: /api/tenant/privilegedaccess) ====================

  /**
   * GET /api/tenant/privilegedaccess/dashboard - داشبورد PAM
   */
  getDashboard: async (): Promise<PamDashboardDto | null> => {
    try {
      const response = await apiClient.get('/api/tenant/privilegedaccess/dashboard');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch PAM dashboard:', error);
      return null;
    }
  },

  // ==================== JIT GRANTS ====================

  /**
   * GET /api/tenant/privilegedaccess/jit/grants - لیست JIT grants
   */
  getJitGrants: async (params?: {
    page?: number;
    pageSize?: number;
    status?: string;
  }): Promise<PaginatedResult<JitGrantDto>> => {
    try {
      const response = await apiClient.get('/api/tenant/privilegedaccess/jit/grants', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch JIT grants:', error);
      return { items: [], total: 0, page: 1, pageSize: 10, totalPages: 0 };
    }
  },

  /**
   * POST /api/tenant/privilegedaccess/jit/request - درخواست JIT
   */
  requestJitAccess: async (data: JitRequestDto): Promise<JitGrantDto> => {
    const response = await apiClient.post('/api/tenant/privilegedaccess/jit/request', data);
    return response.data;
  },

  /**
   * POST /api/tenant/privilegedaccess/jit/grants/{id}/revoke - لغو JIT
   */
  revokeJitGrant: async (grantId: string, reason?: string): Promise<void> => {
    await apiClient.post(`/api/tenant/privilegedaccess/jit/grants/${grantId}/revoke`, { reason });
  },

  /**
   * POST /api/tenant/privilegedaccess/jit/grants/{id}/extend - تمدید JIT
   */
  extendJitGrant: async (grantId: string, additionalMinutes: number): Promise<JitGrantDto> => {
    const response = await apiClient.post(`/api/tenant/privilegedaccess/jit/grants/${grantId}/extend`, { additionalMinutes });
    return response.data;
  },

  // ==================== BREAK GLASS ACCOUNTS ====================

  /**
   * GET /api/tenant/privilegedaccess/breakglass-accounts - حساب‌های اضطراری
   */
  getBreakGlassAccounts: async (): Promise<BreakGlassAccountDto[]> => {
    try {
      const response = await apiClient.get('/api/tenant/privilegedaccess/breakglass-accounts');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch break glass accounts:', error);
      return [];
    }
  },

  /**
   * POST /api/tenant/privilegedaccess/breakglass-accounts/{id}/activate - فعال‌سازی اضطراری
   */
  activateBreakGlassAccount: async (accountId: string, justification: string): Promise<{ password: string; expiresAt: string }> => {
    const response = await apiClient.post(`/api/tenant/privilegedaccess/breakglass-accounts/${accountId}/activate`, { justification });
    return response.data;
  },

  /**
   * POST /api/tenant/privilegedaccess/breakglass-accounts/{id}/deactivate - غیرفعال‌سازی
   */
  deactivateBreakGlassAccount: async (accountId: string): Promise<void> => {
    await apiClient.post(`/api/tenant/privilegedaccess/breakglass-accounts/${accountId}/deactivate`);
  },

  /**
   * POST /api/tenant/privilegedaccess/breakglass-accounts - ایجاد حساب اضطراری
   */
  createBreakGlassAccount: async (data: { name: string; description?: string }): Promise<BreakGlassAccountDto> => {
    const response = await apiClient.post('/api/tenant/privilegedaccess/breakglass-accounts', data);
    return response.data;
  },

  /**
   * DELETE /api/tenant/privilegedaccess/breakglass-accounts/{id} - حذف حساب اضطراری
   */
  deleteBreakGlassAccount: async (accountId: string): Promise<void> => {
    await apiClient.delete(`/api/tenant/privilegedaccess/breakglass-accounts/${accountId}`);
  },

  // ==================== PRIVILEGED SESSIONS ====================

  /**
   * GET /api/tenant/privilegedaccess/sessions - نشست‌های ویژه
   */
  getSessions: async (params?: {
    page?: number;
    pageSize?: number;
    status?: string;
  }): Promise<PaginatedResult<PrivilegedSessionDto>> => {
    try {
      const response = await apiClient.get('/api/tenant/privilegedaccess/sessions', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch privileged sessions:', error);
      return { items: [], total: 0, page: 1, pageSize: 10, totalPages: 0 };
    }
  },

  /**
   * GET /api/tenant/privilegedaccess/sessions/{id} - جزئیات نشست
   */
  getSessionById: async (sessionId: string): Promise<PrivilegedSessionDto | null> => {
    try {
      const response = await apiClient.get(`/api/tenant/privilegedaccess/sessions/${sessionId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch privileged session:', error);
      return null;
    }
  },

  /**
   * POST /api/tenant/privilegedaccess/sessions/{id}/terminate - خاتمه نشست
   */
  terminateSession: async (sessionId: string, reason?: string): Promise<void> => {
    await apiClient.post(`/api/tenant/privilegedaccess/sessions/${sessionId}/terminate`, { reason });
  },

  /**
   * GET /api/tenant/privilegedaccess/sessions/{id}/recording - ضبط نشست
   */
  getSessionRecording: async (sessionId: string): Promise<any> => {
    try {
      const response = await apiClient.get(`/api/tenant/privilegedaccess/sessions/${sessionId}/recording`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch session recording:', error);
      return null;
    }
  },
};

export default privilegedAccessService;
