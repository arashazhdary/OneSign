import apiClient from '@/services/apiClient';

// Types based on spec
export interface SecurityPolicyDto {
  id: string;
  tenantId: string;
  passwordMinLength: number;
  passwordRequireUppercase: boolean;
  passwordRequireLowercase: boolean;
  passwordRequireNumbers: boolean;
  passwordRequireSpecialChars: boolean;
  passwordExpiryDays: number;
  mfaRequirement: 'None' | 'Optional' | 'Required';
  sessionTimeoutMinutes: number;
  lockoutThreshold: number;
  lockoutDurationMinutes: number;
  updatedAt?: string;
}

export interface UpdateSecurityPolicyDto {
  passwordMinLength?: number;
  passwordRequireUppercase?: boolean;
  passwordRequireLowercase?: boolean;
  passwordRequireNumbers?: boolean;
  passwordRequireSpecialChars?: boolean;
  passwordExpiryDays?: number;
  mfaRequirement?: 'None' | 'Optional' | 'Required';
  sessionTimeoutMinutes?: number;
  lockoutThreshold?: number;
  lockoutDurationMinutes?: number;
}

export interface OrgUnitMfaRuleDto {
  id: string;
  orgUnitId: string;
  orgUnitName: string;
  mfaRequirement: 'None' | 'Optional' | 'Required';
}

export interface CreateOrgUnitMfaRuleDto {
  orgUnitId: string;
  mfaRequirement: 'None' | 'Optional' | 'Required';
}

// Adaptive Security Types
export interface AdaptiveSecurityPolicyDto {
  id: string;
  name: string;
  description?: string;
  isEnabled: boolean;
  conditions: any;
  actions: any;
  priority: number;
  createdAt?: string;
}

export interface CreateAdaptiveSecurityPolicyDto {
  name: string;
  description?: string;
  isEnabled?: boolean;
  conditions: any;
  actions: any;
  priority?: number;
}

export interface SecuritySignalDto {
  id: string;
  userId: string;
  signalType: string;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  description: string;
  timestamp: string;
}

export interface HighRiskUserDto {
  userId: string;
  userName: string;
  email: string;
  riskScore: number;
  riskFactors: string[];
  lastActivity?: string;
}

export interface UserSecurityContextDto {
  userId: string;
  riskScore: number;
  lastKnownLocation?: string;
  trustedDevices: number;
  recentSignals: SecuritySignalDto[];
}

export const securityService = {
  // ==================== SECURITY POLICIES (Spec: /api/tenant/security) ====================

  /**
   * GET /api/tenant/security/policy - دریافت سیاست امنیتی
   */
  getPolicy: async (): Promise<SecurityPolicyDto | null> => {
    try {
      const response = await apiClient.get('/api/tenant/security/policy');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch security policy:', error);
      return null;
    }
  },

  /**
   * PUT /api/tenant/security/policy - به‌روزرسانی سیاست امنیتی
   */
  updatePolicy: async (data: UpdateSecurityPolicyDto): Promise<SecurityPolicyDto> => {
    const response = await apiClient.put('/api/tenant/security/policy', data);
    return response.data;
  },

  /**
   * GET /api/tenant/security/policy/org-unit-rules - قوانین MFA واحدها
   */
  getOrgUnitMfaRules: async (): Promise<OrgUnitMfaRuleDto[]> => {
    try {
      const response = await apiClient.get('/api/tenant/security/policy/org-unit-rules');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch org unit MFA rules:', error);
      return [];
    }
  },

  /**
   * POST /api/tenant/security/policy/org-unit-rules - افزودن قاعده MFA واحد
   */
  createOrgUnitMfaRule: async (data: CreateOrgUnitMfaRuleDto): Promise<OrgUnitMfaRuleDto> => {
    const response = await apiClient.post('/api/tenant/security/policy/org-unit-rules', data);
    return response.data;
  },

  /**
   * DELETE /api/tenant/security/policy/org-unit-rules/{id} - حذف قاعده MFA واحد
   */
  deleteOrgUnitMfaRule: async (ruleId: string): Promise<void> => {
    await apiClient.delete(`/api/tenant/security/policy/org-unit-rules/${ruleId}`);
  },

  // ==================== ADAPTIVE SECURITY (Spec: /api/tenant/adaptivesecurity) ====================

  /**
   * GET /api/tenant/adaptivesecurity/policies - لیست سیاست‌های تطبیقی
   */
  getAdaptivePolicies: async (): Promise<AdaptiveSecurityPolicyDto[]> => {
    try {
      const response = await apiClient.get('/api/tenant/adaptivesecurity/policies');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch adaptive security policies:', error);
      return [];
    }
  },

  /**
   * POST /api/tenant/adaptivesecurity/policies - ایجاد سیاست تطبیقی
   */
  createAdaptivePolicy: async (data: CreateAdaptiveSecurityPolicyDto): Promise<AdaptiveSecurityPolicyDto> => {
    const response = await apiClient.post('/api/tenant/adaptivesecurity/policies', data);
    return response.data;
  },

  /**
   * PUT /api/tenant/adaptivesecurity/policies/{id} - به‌روزرسانی سیاست تطبیقی
   */
  updateAdaptivePolicy: async (policyId: string, data: Partial<CreateAdaptiveSecurityPolicyDto>): Promise<AdaptiveSecurityPolicyDto> => {
    const response = await apiClient.put(`/api/tenant/adaptivesecurity/policies/${policyId}`, data);
    return response.data;
  },

  /**
   * DELETE /api/tenant/adaptivesecurity/policies/{id} - حذف سیاست تطبیقی
   */
  deleteAdaptivePolicy: async (policyId: string): Promise<void> => {
    await apiClient.delete(`/api/tenant/adaptivesecurity/policies/${policyId}`);
  },

  /**
   * GET /api/tenant/adaptivesecurity/dashboard - داشبورد امنیتی
   */
  getDashboard: async (): Promise<any> => {
    try {
      const response = await apiClient.get('/api/tenant/adaptivesecurity/dashboard');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch adaptive security dashboard:', error);
      return null;
    }
  },

  /**
   * GET /api/tenant/adaptivesecurity/signals - سیگنال‌های امنیتی
   */
  getSignals: async (params?: {
    page?: number;
    pageSize?: number;
    riskLevel?: string;
  }): Promise<any> => {
    try {
      const response = await apiClient.get('/api/tenant/adaptivesecurity/signals', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch security signals:', error);
      return { items: [], total: 0 };
    }
  },

  /**
   * POST /api/tenant/adaptivesecurity/signals - ثبت سیگنال امنیتی
   */
  createSignal: async (data: Partial<SecuritySignalDto>): Promise<SecuritySignalDto> => {
    const response = await apiClient.post('/api/tenant/adaptivesecurity/signals', data);
    return response.data;
  },

  /**
   * GET /api/tenant/adaptivesecurity/high-risk-users - کاربران پرریسک
   */
  getHighRiskUsers: async (): Promise<HighRiskUserDto[]> => {
    try {
      const response = await apiClient.get('/api/tenant/adaptivesecurity/high-risk-users');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch high risk users:', error);
      return [];
    }
  },

  /**
   * GET /api/tenant/adaptivesecurity/users/{id}/context - بافت امنیتی کاربر
   */
  getUserSecurityContext: async (userId: string): Promise<UserSecurityContextDto | null> => {
    try {
      const response = await apiClient.get(`/api/tenant/adaptivesecurity/users/${userId}/context`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch user security context:', error);
      return null;
    }
  },

  /**
   * PUT /api/tenant/adaptivesecurity/users/{id}/context - به‌روزرسانی بافت امنیتی
   */
  updateUserSecurityContext: async (userId: string, data: Partial<UserSecurityContextDto>): Promise<UserSecurityContextDto> => {
    const response = await apiClient.put(`/api/tenant/adaptivesecurity/users/${userId}/context`, data);
    return response.data;
  },

  // ==================== IP WHITELIST ====================

  /**
   * GET /api/tenant/security/ip-whitelist - لیست IP های مجاز
   */
  getIPWhitelist: async (): Promise<any[]> => {
    try {
      const response = await apiClient.get('/api/tenant/security/ip-whitelist');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch IP whitelist:', error);
      return [];
    }
  },

  /**
   * POST /api/tenant/security/ip-whitelist - افزودن IP به لیست مجاز
   */
  addIPWhitelist: async (tenantId: string, data: { ipAddress: string; description: string }): Promise<any> => {
    const response = await apiClient.post('/api/tenant/security/ip-whitelist', data);
    return response.data;
  },

  /**
   * DELETE /api/tenant/security/ip-whitelist/{id} - حذف IP از لیست مجاز
   */
  removeIPWhitelist: async (tenantId: string, whitelistId: string): Promise<void> => {
    await apiClient.delete(`/api/tenant/security/ip-whitelist/${whitelistId}`);
  },

  /**
   * PUT /api/tenant/security/ip-whitelist/{id} - به‌روزرسانی IP در لیست مجاز
   */
  updateIPWhitelist: async (whitelistId: string, data: any): Promise<any> => {
    const response = await apiClient.put(`/api/tenant/security/ip-whitelist/${whitelistId}`, data);
    return response.data;
  },

  // ==================== CONDITIONAL ACCESS ====================

  /**
   * GET /api/tenant/security/conditional-access - لیست سیاست‌های دسترسی شرطی
   */
  getConditionalAccessPolicies: async (): Promise<any[]> => {
    try {
      const response = await apiClient.get('/api/tenant/security/conditional-access');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch conditional access policies:', error);
      return [];
    }
  },

  /**
   * POST /api/tenant/security/conditional-access - ایجاد سیاست دسترسی شرطی
   */
  createConditionalAccessPolicy: async (data: any): Promise<any> => {
    const response = await apiClient.post('/api/tenant/security/conditional-access', data);
    return response.data;
  },

  /**
   * PUT /api/tenant/security/conditional-access/{id} - به‌روزرسانی سیاست
   */
  updateConditionalAccessPolicy: async (policyId: string, data: any): Promise<any> => {
    const response = await apiClient.put(`/api/tenant/security/conditional-access/${policyId}`, data);
    return response.data;
  },

  /**
   * DELETE /api/tenant/security/conditional-access/{id} - حذف سیاست
   */
  deleteConditionalAccessPolicy: async (policyId: string): Promise<void> => {
    await apiClient.delete(`/api/tenant/security/conditional-access/${policyId}`);
  },

  // ==================== ALERTS ====================

  /**
   * GET /api/tenant/security/alerts/rules - لیست قوانین هشدار
   */
  getAlertRules: async (tenantId?: string): Promise<any[]> => {
    try {
      const response = await apiClient.get('/api/tenant/security/alerts/rules');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch alert rules:', error);
      return [];
    }
  },

  /**
   * POST /api/tenant/security/alerts/rules - ایجاد قانون هشدار
   */
  createAlertRule: async (data: any): Promise<any> => {
    const response = await apiClient.post('/api/tenant/security/alerts/rules', data);
    return response.data;
  },

  /**
   * PUT /api/tenant/security/alerts/rules/{id} - به‌روزرسانی قانون هشدار
   */
  updateAlertRule: async (ruleId: string, data: any): Promise<any> => {
    const response = await apiClient.put(`/api/tenant/security/alerts/rules/${ruleId}`, data);
    return response.data;
  },

  /**
   * DELETE /api/tenant/security/alerts/rules/{id} - حذف قانون هشدار
   */
  deleteAlertRule: async (ruleId: string): Promise<void> => {
    await apiClient.delete(`/api/tenant/security/alerts/rules/${ruleId}`);
  },

  /**
   * POST /api/tenant/security/alerts/rules/{id}/toggle - فعال/غیرفعال کردن قانون
   */
  toggleAlertRule: async (ruleId: string): Promise<any> => {
    const response = await apiClient.post(`/api/tenant/security/alerts/rules/${ruleId}/toggle`);
    return response.data;
  },

  /**
   * GET /api/tenant/security/alerts - لیست هشدارها
   */
  getAlerts: async (tenantId?: string): Promise<any[]> => {
    try {
      const response = await apiClient.get('/api/tenant/security/alerts');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
      return [];
    }
  },

  /**
   * POST /api/tenant/security/alerts/rules/{id}/mute - بی‌صدا کردن قانون هشدار
   */
  muteAlertRule: async (ruleId: string): Promise<any> => {
    const response = await apiClient.post(`/api/tenant/security/alerts/rules/${ruleId}/mute`);
    return response.data;
  },

  // ==================== RISK EVENTS (Spec: /api/tenant/risk-events) ====================

  /**
   * GET /api/tenant/risk-events - لیست رویدادهای ریسک
   */
  getRiskEvents: async (params: {
    tenantId: string;
    userId?: string;
    eventType?: number;
    riskLevel?: number;
    startDate?: string;
    endDate?: string;
    pageNumber?: number;
    pageSize?: number;
  }): Promise<any[]> => {
    try {
      const response = await apiClient.get('/api/tenant/risk-events', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch risk events:', error);
      return [];
    }
  },

  /**
   * POST /api/tenant/risk-events - ثبت رویداد ریسک
   */
  recordRiskEvent: async (data: {
    userId: string;
    eventType: number;
    riskLevel: number;
    ipAddress?: string;
    userAgent?: string;
    location?: string;
    details?: string;
  }): Promise<void> => {
    await apiClient.post('/api/tenant/risk-events', data);
  },
};

export default securityService;
