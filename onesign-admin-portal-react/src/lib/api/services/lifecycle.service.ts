// Lifecycle Service - API methods for identity lifecycle management
// Based on OneSign Technical Specification

import apiClient from '@/services/apiClient';

// Types
export interface AccessPackageDto {
  id: string;
  name: string;
  description: string;
  resources: ResourceDto[];
  approvalWorkflow?: ApprovalWorkflowDto;
  validityPeriod?: number; // days
  autoApproval: boolean;
  status: 'Active' | 'Inactive' | 'Draft';
  createdAt: string;
  updatedAt: string;
}

export interface ResourceDto {
  id: string;
  type: 'Application' | 'Group' | 'Role';
  name: string;
  resourceId: string;
}

export interface ApprovalWorkflowDto {
  stages: ApprovalStageDto[];
  escalationTimeout?: number; // hours
}

export interface ApprovalStageDto {
  order: number;
  approverType: 'Manager' | 'User' | 'Group' | 'Role';
  approverId?: string;
  approverName?: string;
}

export interface LifecycleEventDto {
  id: string;
  type: 'Onboarding' | 'Transfer' | 'Offboarding' | 'RoleChange' | 'LeaveOfAbsence' | 'Return';
  userId: string;
  userName: string;
  status: 'Pending' | 'InProgress' | 'Completed' | 'Failed' | 'Cancelled';
  triggeredBy: string;
  triggeredAt: string;
  completedAt?: string;
  details?: Record<string, any>;
}

export interface LifecyclePolicyDto {
  id: string;
  name: string;
  description: string;
  eventType: string;
  conditions: PolicyConditionDto[];
  actions: PolicyActionDto[];
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PolicyConditionDto {
  field: string;
  operator: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'matches';
  value: string;
}

export interface PolicyActionDto {
  type: 'AssignRole' | 'RevokeRole' | 'AssignGroup' | 'RemoveGroup' | 'SendNotification' | 'RunScript';
  parameters: Record<string, any>;
}

export interface HrRecordDto {
  id: string;
  employeeId: string;
  userId?: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  jobTitle: string;
  manager?: string;
  startDate: string;
  terminationDate?: string;
  status: 'Active' | 'OnLeave' | 'Terminated' | 'Pending';
  syncStatus: 'Synced' | 'PendingSync' | 'Error';
  lastSyncAt?: string;
}

export interface CreateAccessPackageDto {
  name: string;
  description: string;
  resources: { type: string; resourceId: string }[];
  approvalWorkflow?: ApprovalWorkflowDto;
  validityPeriod?: number;
  autoApproval?: boolean;
}

export interface CreateLifecyclePolicyDto {
  name: string;
  description: string;
  eventType: string;
  conditions: PolicyConditionDto[];
  actions: PolicyActionDto[];
  enabled?: boolean;
}

// Lifecycle Service
export const lifecycleService = {
  // ==================== ACCESS PACKAGES ====================

  /**
   * GET /api/tenant/lifecycle/access-packages - بسته‌های دسترسی
   */
  getAccessPackages: async (): Promise<AccessPackageDto[]> => {
    try {
      const response = await apiClient.get('/api/tenant/lifecycle/access-packages');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch access packages:', error);
      return [];
    }
  },

  /**
   * GET /api/tenant/lifecycle/access-packages/{id} - جزئیات بسته
   */
  getAccessPackageById: async (packageId: string): Promise<AccessPackageDto | null> => {
    try {
      const response = await apiClient.get(`/api/tenant/lifecycle/access-packages/${packageId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch access package:', error);
      return null;
    }
  },

  /**
   * POST /api/tenant/lifecycle/access-packages - ایجاد بسته
   */
  createAccessPackage: async (data: CreateAccessPackageDto): Promise<AccessPackageDto> => {
    const response = await apiClient.post('/api/tenant/lifecycle/access-packages', data);
    return response.data;
  },

  /**
   * PUT /api/tenant/lifecycle/access-packages/{id} - به‌روزرسانی بسته
   */
  updateAccessPackage: async (packageId: string, data: Partial<CreateAccessPackageDto>): Promise<AccessPackageDto> => {
    const response = await apiClient.put(`/api/tenant/lifecycle/access-packages/${packageId}`, data);
    return response.data;
  },

  /**
   * DELETE /api/tenant/lifecycle/access-packages/{id} - حذف بسته
   */
  deleteAccessPackage: async (packageId: string): Promise<void> => {
    await apiClient.delete(`/api/tenant/lifecycle/access-packages/${packageId}`);
  },

  // ==================== LIFECYCLE EVENTS ====================

  /**
   * GET /api/tenant/lifecycle/events - رویدادهای چرخه حیات
   */
  getEvents: async (params?: { type?: string; status?: string; page?: number; pageSize?: number }): Promise<{ items: LifecycleEventDto[]; total: number }> => {
    try {
      const response = await apiClient.get('/api/tenant/lifecycle/events', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch lifecycle events:', error);
      return { items: [], total: 0 };
    }
  },

  /**
   * GET /api/tenant/lifecycle/events/{id} - جزئیات رویداد
   */
  getEventById: async (eventId: string): Promise<LifecycleEventDto | null> => {
    try {
      const response = await apiClient.get(`/api/tenant/lifecycle/events/${eventId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch lifecycle event:', error);
      return null;
    }
  },

  /**
   * POST /api/tenant/lifecycle/events/{id}/retry - تلاش مجدد
   */
  retryEvent: async (eventId: string): Promise<LifecycleEventDto> => {
    const response = await apiClient.post(`/api/tenant/lifecycle/events/${eventId}/retry`);
    return response.data;
  },

  /**
   * POST /api/tenant/lifecycle/events/{id}/cancel - لغو رویداد
   */
  cancelEvent: async (eventId: string): Promise<LifecycleEventDto> => {
    const response = await apiClient.post(`/api/tenant/lifecycle/events/${eventId}/cancel`);
    return response.data;
  },

  // ==================== LIFECYCLE POLICIES ====================

  /**
   * GET /api/tenant/lifecycle/policies - سیاست‌ها
   */
  getPolicies: async (): Promise<LifecyclePolicyDto[]> => {
    try {
      const response = await apiClient.get('/api/tenant/lifecycle/policies');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch lifecycle policies:', error);
      return [];
    }
  },

  /**
   * GET /api/tenant/lifecycle/policies/{id} - جزئیات سیاست
   */
  getPolicyById: async (policyId: string): Promise<LifecyclePolicyDto | null> => {
    try {
      const response = await apiClient.get(`/api/tenant/lifecycle/policies/${policyId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch lifecycle policy:', error);
      return null;
    }
  },

  /**
   * POST /api/tenant/lifecycle/policies - ایجاد سیاست
   */
  createPolicy: async (data: CreateLifecyclePolicyDto): Promise<LifecyclePolicyDto> => {
    const response = await apiClient.post('/api/tenant/lifecycle/policies', data);
    return response.data;
  },

  /**
   * PUT /api/tenant/lifecycle/policies/{id} - به‌روزرسانی سیاست
   */
  updatePolicy: async (policyId: string, data: Partial<CreateLifecyclePolicyDto>): Promise<LifecyclePolicyDto> => {
    const response = await apiClient.put(`/api/tenant/lifecycle/policies/${policyId}`, data);
    return response.data;
  },

  /**
   * DELETE /api/tenant/lifecycle/policies/{id} - حذف سیاست
   */
  deletePolicy: async (policyId: string): Promise<void> => {
    await apiClient.delete(`/api/tenant/lifecycle/policies/${policyId}`);
  },

  /**
   * PATCH /api/tenant/lifecycle/policies/{id}/toggle - فعال/غیرفعال کردن
   */
  togglePolicy: async (policyId: string, enabled: boolean): Promise<LifecyclePolicyDto> => {
    const response = await apiClient.patch(`/api/tenant/lifecycle/policies/${policyId}`, { enabled });
    return response.data;
  },

  // ==================== HR RECORDS ====================

  /**
   * GET /api/tenant/lifecycle/hr-records - رکوردهای HR
   */
  getHrRecords: async (params?: { status?: string; department?: string; page?: number; pageSize?: number }): Promise<{ items: HrRecordDto[]; total: number }> => {
    try {
      const response = await apiClient.get('/api/tenant/lifecycle/hr-records', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch HR records:', error);
      return { items: [], total: 0 };
    }
  },

  /**
   * GET /api/tenant/lifecycle/hr-records/{id} - جزئیات رکورد
   */
  getHrRecordById: async (recordId: string): Promise<HrRecordDto | null> => {
    try {
      const response = await apiClient.get(`/api/tenant/lifecycle/hr-records/${recordId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch HR record:', error);
      return null;
    }
  },

  /**
   * POST /api/tenant/lifecycle/hr-records/{id}/sync - همگام‌سازی رکورد
   */
  syncHrRecord: async (recordId: string): Promise<HrRecordDto> => {
    const response = await apiClient.post(`/api/tenant/lifecycle/hr-records/${recordId}/sync`);
    return response.data;
  },

  /**
   * POST /api/tenant/lifecycle/hr-records/sync-all - همگام‌سازی همه
   */
  syncAllHrRecords: async (): Promise<{ synced: number; failed: number }> => {
    const response = await apiClient.post('/api/tenant/lifecycle/hr-records/sync-all');
    return response.data;
  },
};

export default lifecycleService;
