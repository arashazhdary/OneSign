import apiClient from '@/services/apiClient';

// ==================== TYPES ====================

// Tenant Types
export interface TenantDto {
  id: string;
  name: string;
  slug: string;
  status: 'Active' | 'Suspended' | 'Pending' | 'Deleted';
  regionId: string;
  regionName?: string;
  plan?: string;
  userCount?: number;
  appCount?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateTenantDto {
  name: string;
  slug: string;
  regionId: string;
  adminEmail?: string;
  plan?: string;
}

export interface UpdateTenantDto {
  name?: string;
  plan?: string;
}

// Region Types
export interface RegionDto {
  id: string;
  displayName: string;
  cloudProvider: string;
  location?: string;
  isActive: boolean;
  isPrimary: boolean;
  tenantCount?: number;
  health?: 'Healthy' | 'Degraded' | 'Unhealthy';
}

export interface RegionHealthDto {
  regionId: string;
  status: 'Healthy' | 'Degraded' | 'Unhealthy';
  latency?: number;
  lastChecked: string;
  services: {
    name: string;
    status: string;
  }[];
}

// Crypto Types
export interface KeySetDto {
  id: string;
  name: string;
  algorithm: string;
  purpose: string;
  status: 'Active' | 'Rotated' | 'Expired';
  createdAt: string;
  rotatedAt?: string;
  expiresAt?: string;
}

export interface RotationPolicyDto {
  id: string;
  keySetId: string;
  rotationIntervalDays: number;
  isEnabled: boolean;
  nextRotation?: string;
}

// Platform Types
export interface PlatformVersionDto {
  version: string;
  buildNumber: string;
  releaseDate: string;
  commitHash?: string;
}

export interface PlatformHealthDto {
  status: 'Healthy' | 'Degraded' | 'Unhealthy' | string;
  checkedAt?: string;
  totalCheckDurationMs?: number;
  components: {
    name: string;
    type?: string;
    status: string;
    responseTimeMs?: number;
    message?: string;
  }[];
  warnings?: string[];
  errors?: string[];
}

// Billing Types
export interface BillingPlanDto {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  interval: 'Monthly' | 'Yearly';
  features: string[];
  limits: {
    users?: number;
    apps?: number;
    storage?: number;
  };
  isActive: boolean;
}

// Global Insights Types
export interface GlobalInsightsOverviewDto {
  totalTenants: number;
  activeTenants: number;
  totalUsers: number;
  activeUsers: number;
  totalApps: number;
  apiCallsToday: number;
  storageUsedGB: number;
}

export interface RiskyTenantDto {
  tenantId: string;
  tenantName: string;
  riskScore: number;
  riskFactors: string[];
  lastActivity?: string;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export const globalService = {
  // ==================== TENANTS (Spec: /api/global/tenants) ====================

  /**
   * GET /api/global/tenants - لیست تنانت‌ها
   */
  getTenants: async (params?: {
    page?: number;
    pageSize?: number;
    status?: string;
    regionId?: string;
    search?: string;
  }): Promise<PaginatedResult<TenantDto>> => {
    try {
      const response = await apiClient.get('/api/global/tenants', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch tenants:', error);
      return { items: [], total: 0, page: 1, pageSize: 10, totalPages: 0 };
    }
  },

  /**
   * POST /api/global/tenants - ایجاد تنانت
   */
  createTenant: async (data: CreateTenantDto): Promise<TenantDto> => {
    const response = await apiClient.post('/api/global/tenants', data);
    return response.data;
  },

  /**
   * GET /api/global/tenants/{id} - جزئیات تنانت
   */
  getTenantById: async (tenantId: string): Promise<TenantDto | null> => {
    try {
      const response = await apiClient.get(`/api/global/tenants/${tenantId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch tenant:', error);
      return null;
    }
  },

  /**
   * PUT /api/global/tenants/{id} - به‌روزرسانی تنانت
   */
  updateTenant: async (tenantId: string, data: UpdateTenantDto): Promise<TenantDto> => {
    const response = await apiClient.put(`/api/global/tenants/${tenantId}`, data);
    return response.data;
  },

  /**
   * POST /api/global/tenants/{id}/suspend - تعلیق تنانت
   */
  suspendTenant: async (tenantId: string, reason?: string): Promise<TenantDto> => {
    const response = await apiClient.post(`/api/global/tenants/${tenantId}/suspend`, { reason });
    return response.data;
  },

  /**
   * POST /api/global/tenants/{id}/reactivate - فعال‌سازی مجدد تنانت
   */
  reactivateTenant: async (tenantId: string): Promise<TenantDto> => {
    const response = await apiClient.post(`/api/global/tenants/${tenantId}/reactivate`);
    return response.data;
  },

  /**
   * DELETE /api/global/tenants/{id} - حذف تنانت
   */
  deleteTenant: async (tenantId: string): Promise<void> => {
    await apiClient.delete(`/api/global/tenants/${tenantId}`);
  },

  // ==================== REGIONS (Spec: /api/global/regions) ====================

  /**
   * GET /api/global/regions - لیست مناطق
   */
  getRegions: async (): Promise<RegionDto[]> => {
    try {
      const response = await apiClient.get('/api/global/regions');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch regions:', error);
      return [];
    }
  },

  /**
   * POST /api/global/regions - ایجاد منطقه
   */
  createRegion: async (data: Partial<RegionDto>): Promise<RegionDto> => {
    const response = await apiClient.post('/api/global/regions', data);
    return response.data;
  },

  /**
   * GET /api/global/regions/{id} - جزئیات منطقه
   */
  getRegionById: async (regionId: string): Promise<RegionDto | null> => {
    try {
      const response = await apiClient.get(`/api/global/regions/${regionId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch region:', error);
      return null;
    }
  },

  /**
   * PUT /api/global/regions/{id} - به‌روزرسانی منطقه
   */
  updateRegion: async (regionId: string, data: Partial<RegionDto>): Promise<RegionDto> => {
    const response = await apiClient.put(`/api/global/regions/${regionId}`, data);
    return response.data;
  },

  /**
   * GET /api/global/regions/health - سلامت مناطق
   */
  getRegionsHealth: async (): Promise<RegionHealthDto[]> => {
    try {
      const response = await apiClient.get('/api/global/regions/health');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch regions health:', error);
      return [];
    }
  },

  /**
   * GET /api/global/regions/dr-dashboard - داشبورد DR
   */
  getDrDashboard: async (): Promise<any> => {
    try {
      const response = await apiClient.get('/api/global/regions/dr-dashboard');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch DR dashboard:', error);
      return null;
    }
  },

  /**
   * POST /api/global/regions/{id}/failover - Failover
   */
  initiateFailover: async (regionId: string, targetRegionId: string): Promise<any> => {
    const response = await apiClient.post(`/api/global/regions/${regionId}/failover`, { targetRegionId });
    return response.data;
  },

  /**
   * POST /api/global/regions/{id}/failback - Failback
   */
  initiateFailback: async (regionId: string): Promise<any> => {
    const response = await apiClient.post(`/api/global/regions/${regionId}/failback`);
    return response.data;
  },

  // ==================== CRYPTO (Spec: /api/global/crypto) ====================

  /**
   * GET /api/global/crypto/keysets - لیست KeySet ها
   */
  getKeySets: async (): Promise<KeySetDto[]> => {
    try {
      const response = await apiClient.get('/api/global/crypto/keysets');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch keysets:', error);
      return [];
    }
  },

  /**
   * POST /api/global/crypto/keysets - ایجاد KeySet
   */
  createKeySet: async (data: Partial<KeySetDto>): Promise<KeySetDto> => {
    const response = await apiClient.post('/api/global/crypto/keysets', data);
    return response.data;
  },

  /**
   * POST /api/global/crypto/keysets/{id}/rollover - چرخش کلید
   */
  rolloverKeySet: async (keySetId: string): Promise<KeySetDto> => {
    const response = await apiClient.post(`/api/global/crypto/keysets/${keySetId}/rollover`);
    return response.data;
  },

  /**
   * GET /api/global/crypto/rotation-policies - سیاست‌های چرخش
   */
  getRotationPolicies: async (): Promise<RotationPolicyDto[]> => {
    try {
      const response = await apiClient.get('/api/global/crypto/rotation-policies');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch rotation policies:', error);
      return [];
    }
  },

  /**
   * PUT /api/global/crypto/rotation-policies - به‌روزرسانی سیاست چرخش
   */
  updateRotationPolicy: async (policyId: string, data: Partial<RotationPolicyDto>): Promise<RotationPolicyDto> => {
    const response = await apiClient.put(`/api/global/crypto/rotation-policies/${policyId}`, data);
    return response.data;
  },

  // ==================== PLATFORM (Spec: /api/global/platform) ====================

  /**
   * GET /api/global/platform/version - نسخه پلتفرم
   */
  getVersion: async (): Promise<PlatformVersionDto | null> => {
    try {
      const response = await apiClient.get('/api/global/platform/version');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch platform version:', error);
      return null;
    }
  },

  /**
   * GET /api/global/platform/health - سلامت سیستم
   */
  getHealth: async (): Promise<PlatformHealthDto | null> => {
    try {
      const response = await apiClient.get('/api/global/platform/health');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch platform health:', error);
      return null;
    }
  },

  /**
   * GET /api/global/platform/diagnostics - تشخیص
   */
  getDiagnostics: async (): Promise<any> => {
    try {
      const response = await apiClient.get('/api/global/platform/diagnostics');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch diagnostics:', error);
      return null;
    }
  },

  /**
   * GET /api/global/platform/migrations - لیست Migrations
   */
  getMigrations: async (): Promise<any[]> => {
    try {
      const response = await apiClient.get('/api/global/platform/migrations');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch migrations:', error);
      return [];
    }
  },

  /**
   * POST /api/global/platform/migrations/apply - اعمال Migration
   */
  applyMigration: async (migrationName: string, userId?: string): Promise<any> => {
    const response = await apiClient.post('/api/global/platform/migrations/apply', {
      migrationName,
      userId: userId ?? '00000000-0000-0000-0000-000000000001',
    });
    return response.data;
  },

  /**
   * POST /api/global/platform/tests/run - اجرای تست‌های یکپارچه
   */
  runPlatformIntegrationTests: async (categories?: string[]): Promise<any> => {
    const response = await apiClient.post('/api/global/platform/tests/run', {
      categories: categories ?? [],
    });
    return response.data;
  },

  /**
   * GET /api/global/platform/tests/results - تاریخچه نتایج تست
   */
  getPlatformTestResults: async (page: number = 1, pageSize: number = 20): Promise<any> => {
    try {
      const response = await apiClient.get('/api/global/platform/tests/results', {
        params: { page, pageSize },
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch platform test results:', error);
      return { items: [], totalCount: 0 };
    }
  },

  /**
   * GET /api/global/platform/tests/{testId} - نتیجه یک تست
   */
  getPlatformTestResult: async (testId: string): Promise<any> => {
    const response = await apiClient.get(`/api/global/platform/tests/${testId}`);
    return response.data;
  },

  /**
   * GET /api/global/platform/docs/openapi - مشخصات OpenAPI
   */
  getPlatformOpenApiSpec: async (): Promise<any> => {
    try {
      const response = await apiClient.get('/api/global/platform/docs/openapi');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch OpenAPI spec:', error);
      return null;
    }
  },

  /**
   * POST /api/global/platform/docs/generate - تولید مجدد مستندات
   */
  generatePlatformDocumentation: async (): Promise<any> => {
    const response = await apiClient.post('/api/global/platform/docs/generate', {
      includeExamples: true,
    });
    return response.data;
  },

  /**
   * GET /api/global/platform/configuration - پیکربندی
   */
  getConfiguration: async (): Promise<any> => {
    try {
      const response = await apiClient.get('/api/global/platform/configuration');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch platform configuration:', error);
      return null;
    }
  },

  // ==================== BILLING (Spec: /api/global/billing) ====================

  /**
   * GET /api/global/billing/plans - لیست پلن‌ها
   */
  getBillingPlans: async (): Promise<BillingPlanDto[]> => {
    try {
      const response = await apiClient.get('/api/global/billing/plans');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch billing plans:', error);
      return [];
    }
  },

  /**
   * POST /api/global/billing/plans - ایجاد پلن
   */
  createBillingPlan: async (data: Partial<BillingPlanDto>): Promise<BillingPlanDto> => {
    const response = await apiClient.post('/api/global/billing/plans', data);
    return response.data;
  },

  /**
   * PUT /api/global/billing/plans/{id} - به‌روزرسانی پلن
   */
  updateBillingPlan: async (planId: string, data: Partial<BillingPlanDto>): Promise<BillingPlanDto> => {
    const response = await apiClient.put(`/api/global/billing/plans/${planId}`, data);
    return response.data;
  },

  /**
   * GET /api/global/billing/tenants - وضعیت مالی تنانت‌ها
   */
  getTenantsBillingStatus: async (): Promise<any[]> => {
    try {
      const response = await apiClient.get('/api/global/billing/tenants');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch tenants billing status:', error);
      return [];
    }
  },

  // ==================== INSIGHTS (Spec: /api/global/insights) ====================

  /**
   * GET /api/global/insights/tenants/overview - نمای کلی تنانت‌ها
   */
  getTenantsOverview: async (): Promise<GlobalInsightsOverviewDto | null> => {
    try {
      const response = await apiClient.get('/api/global/insights/tenants/overview');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch tenants overview:', error);
      return null;
    }
  },

  /**
   * GET /api/global/insights/tenants/risky - تنانت‌های پرریسک
   */
  getRiskyTenants: async (): Promise<RiskyTenantDto[]> => {
    try {
      const response = await apiClient.get('/api/global/insights/tenants/risky');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch risky tenants:', error);
      return [];
    }
  },

  /**
   * GET /api/global/insights/usage - آمار استفاده
   */
  getUsageStats: async (params?: { period?: string }): Promise<any> => {
    try {
      const response = await apiClient.get('/api/global/insights/usage', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch usage stats:', error);
      return null;
    }
  },

  /**
   * GET /api/global/insights/growth - رشد
   */
  getGrowthStats: async (params?: { period?: string }): Promise<any> => {
    try {
      const response = await apiClient.get('/api/global/insights/growth', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch growth stats:', error);
      return null;
    }
  },

  /**
   * GET /api/global/insights/advanced - تحلیل پیشرفته
   */
  getAdvancedInsights: async (): Promise<any> => {
    try {
      const response = await apiClient.get('/api/global/insights/advanced');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch advanced insights:', error);
      return null;
    }
  },

  // ==================== ENVIRONMENTS (Spec: /api/global/environments) ====================

  /**
   * GET /api/global/environments - لیست محیط‌ها
   */
  getEnvironments: async (): Promise<any[]> => {
    try {
      const response = await apiClient.get('/api/global/environments');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch environments:', error);
      return [];
    }
  },

  /**
   * POST /api/global/environments - ایجاد محیط
   */
  createEnvironment: async (data: any): Promise<any> => {
    const response = await apiClient.post('/api/global/environments', data);
    return response.data;
  },

  /**
   * POST /api/global/environments/{id}/bootstrap - راه‌اندازی محیط
   */
  bootstrapEnvironment: async (envId: string): Promise<any> => {
    const response = await apiClient.post(`/api/global/environments/${envId}/bootstrap`);
    return response.data;
  },

  /**
   * GET /api/global/environments/{id}/configuration - پیکربندی محیط
   */
  getEnvironmentConfiguration: async (envId: string): Promise<any> => {
    try {
      const response = await apiClient.get(`/api/global/environments/${envId}/configuration`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch environment configuration:', error);
      return null;
    }
  },

  /**
   * GET /api/global/environments/{id}/heartbeat - وضعیت محیط
   */
  getEnvironmentHeartbeat: async (envId: string): Promise<any> => {
    try {
      const response = await apiClient.get(`/api/global/environments/${envId}/heartbeat`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch environment heartbeat:', error);
      return null;
    }
  },

  /**
   * POST /api/global/environments/{id}/restart - راه‌اندازی مجدد محیط
   */
  restartEnvironment: async (envId: string): Promise<any> => {
    const response = await apiClient.post(`/api/global/environments/${envId}/restart`);
    return response.data;
  },

  // ==================== BACKUPS (Spec: /api/global/backups) ====================

  /**
   * GET /api/global/backups - لیست بکاپ‌ها
   */
  getBackups: async (): Promise<any[]> => {
    try {
      const response = await apiClient.get('/api/global/backups');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch backups:', error);
      return [];
    }
  },

  /**
   * POST /api/global/backups - ایجاد بکاپ
   */
  createBackup: async (data: { name: string; type: string; retentionDays: number }): Promise<any> => {
    const response = await apiClient.post('/api/global/backups', data);
    return response.data;
  },

  /**
   * POST /api/global/backups/{id}/restore - بازیابی بکاپ
   */
  restoreBackup: async (backupId: string, options?: any): Promise<any> => {
    const response = await apiClient.post(`/api/global/backups/${backupId}/restore`, options);
    return response.data;
  },

  /**
   * GET /api/global/backups/{id}/download - دانلود بکاپ
   */
  downloadBackup: async (backupId: string): Promise<any> => {
    const response = await apiClient.get(`/api/global/backups/${backupId}/download`, { responseType: 'blob' });
    return response.data;
  },

  /**
   * GET /api/global/backups/schedules - لیست زمان‌بندی‌ها
   */
  getBackupSchedules: async (): Promise<any[]> => {
    try {
      const response = await apiClient.get('/api/global/backups/schedules');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch backup schedules:', error);
      return [];
    }
  },

  /**
   * POST /api/global/backups/schedules - ایجاد زمان‌بندی
   */
  createBackupSchedule: async (data: any): Promise<any> => {
    const response = await apiClient.post('/api/global/backups/schedules', data);
    return response.data;
  },

  /**
   * PUT /api/global/backups/schedules/{id} - به‌روزرسانی زمان‌بندی
   */
  updateBackupSchedule: async (scheduleId: string, data: any): Promise<any> => {
    const response = await apiClient.put(`/api/global/backups/schedules/${scheduleId}`, data);
    return response.data;
  },

  /**
   * DELETE /api/global/backups/schedules/{id} - حذف زمان‌بندی
   */
  deleteBackupSchedule: async (scheduleId: string): Promise<void> => {
    await apiClient.delete(`/api/global/backups/schedules/${scheduleId}`);
  },

  // ==================== API MANAGEMENT (Spec: /api/global/api-management) ====================

  /**
   * GET /api/global/api-management/endpoints - لیست endpoint ها
   */
  getAPIEndpoints: async (): Promise<any> => {
    try {
      const response = await apiClient.get('/api/global/api-management/endpoints');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch API endpoints:', error);
      return { endpoints: [] };
    }
  },

  /**
   * PUT /api/global/api-management/endpoints/{id}/rate-limit - به‌روزرسانی rate limit
   */
  updateEndpointRateLimit: async (endpointId: string, data: { rateLimit: number; rateLimitWindow: string }): Promise<any> => {
    const response = await apiClient.put(`/api/global/api-management/endpoints/${endpointId}/rate-limit`, data);
    return response.data;
  },

  /**
   * GET /api/global/api-management/keys - لیست کلیدهای API
   */
  getAPIKeys: async (): Promise<any> => {
    try {
      const response = await apiClient.get('/api/global/api-management/keys');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch API keys:', error);
      return { keys: [] };
    }
  },

  /**
   * POST /api/global/api-management/keys - ایجاد کلید API
   */
  createAPIKey: async (data: { name: string; scope: string[]; expiresIn?: number }): Promise<any> => {
    const response = await apiClient.post('/api/global/api-management/keys', data);
    return response.data;
  },

  /**
   * DELETE /api/global/api-management/keys/{id} - لغو کلید API
   */
  revokeAPIKey: async (keyId: string): Promise<void> => {
    await apiClient.delete(`/api/global/api-management/keys/${keyId}`);
  },

  /**
   * GET /api/global/api-management/consumers - لیست مصرف‌کنندگان
   */
  getAPIConsumers: async (): Promise<any> => {
    try {
      const response = await apiClient.get('/api/global/api-management/consumers');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch API consumers:', error);
      return { consumers: [] };
    }
  },

  /**
   * GET /api/global/api-management/versions - لیست نسخه‌ها
   */
  getAPIVersions: async (): Promise<any> => {
    try {
      const response = await apiClient.get('/api/global/api-management/versions');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch API versions:', error);
      return { versions: [] };
    }
  },

  // ==================== TEMPLATES (Global System Templates) ====================

  /**
   * GET /api/global/templates - لیست همه قالب‌های سیستم
   */
  getTemplates: async (params?: { type?: string; category?: string }): Promise<any> => {
    try {
      const response = await apiClient.get('/api/global/templates', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch templates:', error);
      return [];
    }
  },

  /**
   * GET /api/global/templates/email - قالب‌های ایمیل
   */
  getEmailTemplates: async (): Promise<any> => {
    try {
      const response = await apiClient.get('/api/global/templates/email');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch email templates:', error);
      return [];
    }
  },

  /**
   * GET /api/global/templates/policy - قالب‌های سیاست
   */
  getPolicyTemplates: async (): Promise<any> => {
    try {
      const response = await apiClient.get('/api/global/templates/policy');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch policy templates:', error);
      return [];
    }
  },

  /**
   * GET /api/global/templates/report - قالب‌های گزارش
   */
  getReportTemplates: async (): Promise<any> => {
    try {
      const response = await apiClient.get('/api/global/templates/report');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch report templates:', error);
      return [];
    }
  },

  /**
   * POST /api/global/templates - ایجاد قالب جدید
   */
  createTemplate: async (data: {
    name: string;
    type: 'workflow' | 'email' | 'policy' | 'report';
    category: string;
    description?: string;
    content: any;
    variables?: string[];
  }): Promise<any> => {
    const response = await apiClient.post('/api/global/templates', data);
    return response.data;
  },

  /**
   * PUT /api/global/templates/{id} - به‌روزرسانی قالب
   */
  updateTemplate: async (templateId: string, data: any): Promise<any> => {
    const response = await apiClient.put(`/api/global/templates/${templateId}`, data);
    return response.data;
  },

  /**
   * DELETE /api/global/templates/{id} - حذف قالب
   */
  deleteTemplate: async (templateId: string): Promise<void> => {
    await apiClient.delete(`/api/global/templates/${templateId}`);
  },

  /**
   * POST /api/global/templates/{id}/publish - انتشار قالب
   */
  publishTemplate: async (templateId: string): Promise<any> => {
    const response = await apiClient.post(`/api/global/templates/${templateId}/publish`);
    return response.data;
  },

  /**
   * POST /api/global/templates/{id}/unpublish - لغو انتشار قالب
   */
  unpublishTemplate: async (templateId: string): Promise<any> => {
    const response = await apiClient.post(`/api/global/templates/${templateId}/unpublish`);
    return response.data;
  },

  // ==================== ALERTS (Global Platform Alerts) ====================

  /**
   * GET /api/global/alerts - لیست هشدارهای پلتفرم
   */
  getAlerts: async (params?: { status?: string; severity?: string; category?: string }): Promise<any> => {
    try {
      const response = await apiClient.get('/api/global/alerts', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
      return [];
    }
  },

  /**
   * GET /api/global/alerts/{id} - جزئیات هشدار
   */
  getAlertById: async (alertId: string): Promise<any> => {
    try {
      const response = await apiClient.get(`/api/global/alerts/${alertId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch alert:', error);
      return null;
    }
  },

  /**
   * POST /api/global/alerts/{id}/acknowledge - تایید هشدار
   */
  acknowledgeAlert: async (alertId: string): Promise<any> => {
    const response = await apiClient.post(`/api/global/alerts/${alertId}/acknowledge`);
    return response.data;
  },

  /**
   * POST /api/global/alerts/{id}/resolve - حل هشدار
   */
  resolveAlert: async (alertId: string, data?: { notes?: string }): Promise<any> => {
    const response = await apiClient.post(`/api/global/alerts/${alertId}/resolve`, data);
    return response.data;
  },

  /**
   * POST /api/global/alerts/{id}/silence - بی‌صدا کردن هشدار
   */
  silenceAlert: async (alertId: string, data?: { duration?: number }): Promise<any> => {
    const response = await apiClient.post(`/api/global/alerts/${alertId}/silence`, data);
    return response.data;
  },

  /**
   * GET /api/global/alerts/rules - لیست قوانین هشدار
   */
  getAlertRules: async (): Promise<any> => {
    try {
      const response = await apiClient.get('/api/global/alerts/rules');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch alert rules:', error);
      return [];
    }
  },

  /**
   * POST /api/global/alerts/rules - ایجاد قانون هشدار
   */
  createAlertRule: async (data: {
    name: string;
    description?: string;
    condition: string;
    threshold: number;
    severity: 'critical' | 'high' | 'medium' | 'low';
    notificationChannels: string[];
    cooldownMinutes?: number;
  }): Promise<any> => {
    const response = await apiClient.post('/api/global/alerts/rules', data);
    return response.data;
  },

  /**
   * PUT /api/global/alerts/rules/{id} - به‌روزرسانی قانون هشدار
   */
  updateAlertRule: async (ruleId: string, data: any): Promise<any> => {
    const response = await apiClient.put(`/api/global/alerts/rules/${ruleId}`, data);
    return response.data;
  },

  /**
   * DELETE /api/global/alerts/rules/{id} - حذف قانون هشدار
   */
  deleteAlertRule: async (ruleId: string): Promise<void> => {
    await apiClient.delete(`/api/global/alerts/rules/${ruleId}`);
  },

  /**
   * POST /api/global/alerts/rules/{id}/toggle - فعال/غیرفعال کردن قانون
   */
  toggleAlertRule: async (ruleId: string): Promise<any> => {
    const response = await apiClient.post(`/api/global/alerts/rules/${ruleId}/toggle`);
    return response.data;
  },

  /**
   * GET /api/global/alerts/stats - آمار هشدارها
   */
  getAlertStats: async (): Promise<any> => {
    try {
      const response = await apiClient.get('/api/global/alerts/stats');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch alert stats:', error);
      return null;
    }
  },

  // ==================== OBSERVABILITY (Spec: /api/global/observability) ====================

  /**
   * GET /api/global/observability/metrics - متریک‌ها
   */
  getMetrics: async (params?: { period?: string }): Promise<any> => {
    try {
      const response = await apiClient.get('/api/global/observability/metrics', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
      return null;
    }
  },

  /**
   * GET /api/global/observability/performance - متریک‌های عملکرد
   */
  getPerformanceMetrics: async (): Promise<any> => {
    try {
      const response = await apiClient.get('/api/global/observability/performance');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch performance metrics:', error);
      return null;
    }
  },

  /**
   * GET /api/global/platform/metrics - متریک‌های پلتفرم
   */
  getPlatformMetrics: async (params?: { timeRange?: string; category?: string }): Promise<any> => {
    try {
      const response = await apiClient.get('/api/global/platform/metrics', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch platform metrics:', error);
      return null;
    }
  },

  /**
   * Refresh platform diagnostics (GET snapshot; no separate run endpoint on API).
   */
  runDiagnostics: async (): Promise<any> => {
    return globalService.getDiagnostics();
  },

  runDiagnosticTest: async (_testId: string): Promise<any> => {
    return globalService.getDiagnostics();
  },

  /**
   * GET /api/global/licenses - لیست لایسنس‌ها
   */
  getLicenses: async (): Promise<any[]> => {
    try {
      const response = await apiClient.get('/api/global/licenses');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch licenses:', error);
      return [];
    }
  },

  /**
   * POST /api/global/licenses - صدور لایسنس
   */
  issueLicense: async (data: any): Promise<any> => {
    const response = await apiClient.post('/api/global/licenses', data);
    return response.data;
  },

  /**
   * POST /api/global/licenses/{id}/suspend - تعلیق لایسنس
   */
  suspendLicense: async (licenseId: string): Promise<any> => {
    const response = await apiClient.post(`/api/global/licenses/${licenseId}/suspend`);
    return response.data;
  },

  /**
   * POST /api/global/licenses/{id}/revoke - ابطال لایسنس
   */
  revokeLicense: async (licenseId: string): Promise<any> => {
    const response = await apiClient.post(`/api/global/licenses/${licenseId}/revoke`);
    return response.data;
  },

  /**
   * POST /api/global/licenses/{id}/renew - تمدید لایسنس
   */
  renewLicense: async (licenseId: string, data?: any): Promise<any> => {
    const response = await apiClient.post(`/api/global/licenses/${licenseId}/renew`, data);
    return response.data;
  },

  /**
   * GET /api/global/observability/logs - لاگ‌ها
   */
  getLogs: async (params?: {
    page?: number;
    pageSize?: number;
    level?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<any> => {
    try {
      const response = await apiClient.get('/api/global/observability/logs', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch logs:', error);
      return { items: [], total: 0 };
    }
  },

  // ==================== MAINTENANCE WINDOWS ====================

  /**
   * GET /api/global/maintenance/windows - لیست پنجره‌های نگهداری
   */
  getMaintenanceWindows: async (): Promise<any[]> => {
    try {
      const response = await apiClient.get('/api/global/maintenance/windows');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch maintenance windows:', error);
      return [];
    }
  },

  /**
   * POST /api/global/maintenance/windows - ایجاد پنجره نگهداری
   */
  createMaintenanceWindow: async (data: {
    title: string;
    description?: string;
    type: 'scheduled' | 'emergency' | 'planned';
    startTime: string;
    endTime: string;
    affectedServices: string[];
    impactLevel: 'none' | 'low' | 'medium' | 'high';
    notifyUsers: boolean;
  }): Promise<any> => {
    const response = await apiClient.post('/api/global/maintenance/windows', data);
    return response.data;
  },

  /**
   * PUT /api/global/maintenance/windows/{id} - به‌روزرسانی پنجره نگهداری
   */
  updateMaintenanceWindow: async (windowId: string, data: any): Promise<any> => {
    const response = await apiClient.put(`/api/global/maintenance/windows/${windowId}`, data);
    return response.data;
  },

  /**
   * POST /api/global/maintenance/windows/{id}/cancel - لغو پنجره نگهداری
   */
  cancelMaintenanceWindow: async (windowId: string): Promise<any> => {
    const response = await apiClient.post(`/api/global/maintenance/windows/${windowId}/cancel`);
    return response.data;
  },

  /**
   * POST /api/global/maintenance/windows/{id}/notify - ارسال اعلان نگهداری
   */
  sendMaintenanceNotification: async (windowId: string): Promise<any> => {
    const response = await apiClient.post(`/api/global/maintenance/windows/${windowId}/notify`);
    return response.data;
  },

  // ==================== RATE LIMITING ====================

  /**
   * GET /api/global/rate-limits - لیست محدودیت‌های نرخ
   */
  getRateLimits: async (): Promise<any[]> => {
    try {
      const response = await apiClient.get('/api/global/rate-limits');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch rate limits:', error);
      return [];
    }
  },

  /**
   * POST /api/global/rate-limits - ایجاد محدودیت نرخ
   */
  createRateLimit: async (data: {
    name: string;
    type: 'global' | 'per_tenant' | 'per_user' | 'per_ip';
    endpoint?: string;
    limit: number;
    window: number;
    windowUnit: 'second' | 'minute' | 'hour' | 'day';
    action: 'throttle' | 'block' | 'notify';
    exemptions: string[];
  }): Promise<any> => {
    const response = await apiClient.post('/api/global/rate-limits', data);
    return response.data;
  },

  /**
   * PUT /api/global/rate-limits/{id} - به‌روزرسانی محدودیت نرخ
   */
  updateRateLimit: async (limitId: string, data: any): Promise<any> => {
    const response = await apiClient.put(`/api/global/rate-limits/${limitId}`, data);
    return response.data;
  },

  /**
   * POST /api/global/rate-limits/{id}/toggle - فعال/غیرفعال کردن محدودیت
   */
  toggleRateLimit: async (limitId: string): Promise<any> => {
    const response = await apiClient.post(`/api/global/rate-limits/${limitId}/toggle`);
    return response.data;
  },

  /**
   * DELETE /api/global/rate-limits/{id} - حذف محدودیت نرخ
   */
  deleteRateLimit: async (limitId: string): Promise<void> => {
    await apiClient.delete(`/api/global/rate-limits/${limitId}`);
  },

  // ==================== PLATFORM MIGRATIONS ====================

  /**
   * GET /api/global/platform/migrations - لیست Migration‌های پلتفرم با pagination
   */
  getPlatformMigrations: async (page: number = 1, pageSize: number = 20, status?: string): Promise<any> => {
    try {
      const response = await apiClient.get('/api/global/platform/migrations', {
        params: { page, pageSize, status },
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch platform migrations:', error);
      return { items: [], totalCount: 0 };
    }
  },

  /**
   * POST /api/global/platform/migrations/apply - اعمال Migration
   */
  applyPlatformMigration: async (migrationName: string, userId?: string): Promise<any> => {
    return globalService.applyMigration(migrationName, userId);
  },

  // ==================== AUDIT STATISTICS ====================

  /**
   * GET /api/global/observability/audit/statistics - آمار audit
   */
  getAuditStatistics: async (): Promise<any> => {
    try {
      const response = await apiClient.get('/api/global/observability/audit/statistics');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch audit statistics:', error);
      return null;
    }
  },

  // ==================== HEALTH ENDPOINTS ====================

  /**
   * GET /api/health - وضعیت سلامت کلی
   */
  getHealthStatus: async (): Promise<any> => {
    try {
      const response = await apiClient.get('/api/health');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch health status:', error);
      return null;
    }
  },

  /**
   * GET /api/health/live - بررسی liveness
   */
  getLivenessProbe: async (): Promise<any> => {
    try {
      const response = await apiClient.get('/api/health/live');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch liveness probe:', error);
      return null;
    }
  },

  /**
   * GET /api/health/ready - بررسی readiness
   */
  getReadinessProbe: async (): Promise<any> => {
    try {
      const response = await apiClient.get('/api/health/ready');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch readiness probe:', error);
      return null;
    }
  },

  /**
   * GET /api/health/regions - سلامت مناطق
   */
  getRegionsHealthStatus: async (): Promise<any[]> => {
    try {
      const response = await apiClient.get('/api/health/regions');
      return response.data?.regions || response.data || [];
    } catch (error) {
      console.error('Failed to fetch regions health:', error);
      return [];
    }
  },

  // ==================== GLOBAL WEBHOOKS ====================

  /**
   * GET /api/global/webhooks - لیست وب‌هوک‌های پلتفرم
   */
  getGlobalWebhooks: async (): Promise<any[]> => {
    try {
      const response = await apiClient.get('/api/global/webhooks');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch global webhooks:', error);
      return [];
    }
  },

  /**
   * POST /api/global/webhooks - ایجاد وب‌هوک پلتفرم
   */
  createGlobalWebhook: async (data: {
    name: string;
    url: string;
    events: string[];
    secret?: string;
    isActive: boolean;
    retryStrategy: 'exponential' | 'linear' | 'none';
    maxRetries: number;
    timeout: number;
    headers?: Record<string, string>;
  }): Promise<any> => {
    const response = await apiClient.post('/api/global/webhooks', data);
    return response.data;
  },

  /**
   * PUT /api/global/webhooks/{id} - به‌روزرسانی وب‌هوک
   */
  updateGlobalWebhook: async (webhookId: string, data: any): Promise<any> => {
    const response = await apiClient.put(`/api/global/webhooks/${webhookId}`, data);
    return response.data;
  },

  /**
   * POST /api/global/webhooks/{id}/toggle - فعال/غیرفعال کردن وب‌هوک
   */
  toggleGlobalWebhook: async (webhookId: string): Promise<any> => {
    const response = await apiClient.post(`/api/global/webhooks/${webhookId}/toggle`);
    return response.data;
  },

  /**
   * POST /api/global/webhooks/{id}/test - تست وب‌هوک
   */
  testGlobalWebhook: async (webhookId: string): Promise<any> => {
    const response = await apiClient.post(`/api/global/webhooks/${webhookId}/test`);
    return response.data;
  },

  /**
   * DELETE /api/global/webhooks/{id} - حذف وب‌هوک
   */
  deleteGlobalWebhook: async (webhookId: string): Promise<void> => {
    await apiClient.delete(`/api/global/webhooks/${webhookId}`);
  },

  /**
   * GET /api/global/webhooks/{id}/logs - لاگ‌های وب‌هوک
   */
  getGlobalWebhookLogs: async (webhookId: string): Promise<any[]> => {
    try {
      const response = await apiClient.get(`/api/global/webhooks/${webhookId}/logs`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch webhook logs:', error);
      return [];
    }
  },

  /**
   * GET /api/global/webhooks/logs - همه لاگ‌های وب‌هوک
   */
  getAllWebhookLogs: async (): Promise<any[]> => {
    try {
      const response = await apiClient.get('/api/global/webhooks/logs');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch all webhook logs:', error);
      return [];
    }
  },

  // ==================== TENANT INTEGRATIONS & IMPORTS/EXPORTS ====================

  /**
   * GET /api/global/integrations - لیست یکپارچه‌سازی‌ها
   */
  getGlobalIntegrations: async (): Promise<any[]> => {
    try {
      const response = await apiClient.get('/api/global/integrations');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch global integrations:', error);
      return [];
    }
  },

  /**
   * POST /api/global/integrations - ایجاد یکپارچه‌سازی
   */
  createGlobalIntegration: async (data: any): Promise<any> => {
    const response = await apiClient.post('/api/global/integrations', data);
    return response.data;
  },

  /**
   * POST /api/global/integrations/{id}/toggle - فعال/غیرفعال کردن
   */
  toggleGlobalIntegration: async (integrationId: string): Promise<any> => {
    const response = await apiClient.post(`/api/global/integrations/${integrationId}/toggle`);
    return response.data;
  },

  /**
   * DELETE /api/global/integrations/{id} - حذف یکپارچه‌سازی
   */
  deleteGlobalIntegration: async (integrationId: string): Promise<void> => {
    await apiClient.delete(`/api/global/integrations/${integrationId}`);
  },

  /**
   * POST /api/global/integrations/{id}/test - تست یکپارچه‌سازی
   */
  testGlobalIntegration: async (integrationId: string): Promise<any> => {
    const response = await apiClient.post(`/api/global/integrations/${integrationId}/test`);
    return response.data;
  },

  // ==================== FEATURE FLAGS ====================

  /**
   * GET /api/global/feature-flags - لیست feature flags
   */
  getFeatureFlags: async (): Promise<any[]> => {
    try {
      const response = await apiClient.get('/api/global/feature-flags');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch feature flags:', error);
      return [];
    }
  },

  /**
   * GET /api/global/feature-flags/{id} - دریافت یک feature flag
   */
  getFeatureFlag: async (flagId: string): Promise<any> => {
    try {
      const response = await apiClient.get(`/api/global/feature-flags/${flagId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch feature flag:', error);
      return null;
    }
  },

  /**
   * POST /api/global/feature-flags - ایجاد feature flag
   */
  createFeatureFlag: async (data: {
    name: string;
    key: string;
    description?: string;
    enabled?: boolean;
    targetAudience?: string;
    targetTenants?: string[];
    rolloutPercentage?: number;
  }): Promise<any> => {
    const response = await apiClient.post('/api/global/feature-flags', data);
    return response.data;
  },

  /**
   * PUT /api/global/feature-flags/{id} - به‌روزرسانی feature flag
   */
  updateFeatureFlag: async (flagId: string, data: any): Promise<any> => {
    const response = await apiClient.put(`/api/global/feature-flags/${flagId}`, data);
    return response.data;
  },

  /**
   * POST /api/global/feature-flags/{id}/toggle - فعال/غیرفعال کردن feature flag
   */
  toggleFeatureFlag: async (flagId: string, enabled: boolean): Promise<any> => {
    const response = await apiClient.post(`/api/global/feature-flags/${flagId}/toggle`, { enabled });
    return response.data;
  },

  /**
   * DELETE /api/global/feature-flags/{id} - حذف feature flag
   */
  deleteFeatureFlag: async (flagId: string): Promise<void> => {
    await apiClient.delete(`/api/global/feature-flags/${flagId}`);
  },

  /**
   * GET /api/global/feature-flags/{id}/history - تاریخچه feature flag
   */
  getFeatureFlagHistory: async (flagId: string): Promise<any[]> => {
    try {
      const response = await apiClient.get(`/api/global/feature-flags/${flagId}/history`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch feature flag history:', error);
      return [];
    }
  },
};

export default globalService;
