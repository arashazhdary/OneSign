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
  status: 'Healthy' | 'Degraded' | 'Unhealthy';
  uptime: string;
  services: {
    name: string;
    status: string;
    latency?: number;
  }[];
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
  applyMigration: async (migrationId: string): Promise<any> => {
    const response = await apiClient.post('/api/global/platform/migrations/apply', { migrationId });
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
};

export default globalService;
