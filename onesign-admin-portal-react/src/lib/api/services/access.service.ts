import apiClient from '@/services/apiClient';

// Types based on spec
export interface AccessRequestDto {
  id: string;
  tenantId: string;
  requesterId: string;
  requesterName?: string;
  requesterEmail?: string;
  resourceType: string;
  resourceId?: string;
  resourceName?: string;
  requestType: 'Role' | 'Application' | 'Permission' | 'OrgUnit';
  justification?: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled' | 'Expired';
  approverId?: string;
  approverName?: string;
  approvedAt?: string;
  rejectionReason?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateAccessRequestDto {
  resourceType: string;
  resourceId?: string;
  requestType: 'Role' | 'Application' | 'Permission' | 'OrgUnit';
  justification?: string;
  duration?: number; // In hours
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export const accessService = {
  // ==================== ACCESS REQUESTS (Spec: /api/tenant/accessrequests) ====================

  /**
   * GET /api/tenant/accessrequests - لیست درخواست‌ها
   */
  getAccessRequests: async (params?: {
    page?: number;
    pageSize?: number;
    status?: string;
    requestType?: string;
  }): Promise<PaginatedResult<AccessRequestDto>> => {
    try {
      const response = await apiClient.get('/api/tenant/accessrequests', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch access requests:', error);
      return { items: [], total: 0, page: 1, pageSize: 10, totalPages: 0 };
    }
  },

  /**
   * POST /api/tenant/accessrequests - ارسال درخواست جدید
   */
  createAccessRequest: async (data: CreateAccessRequestDto): Promise<AccessRequestDto> => {
    const response = await apiClient.post('/api/tenant/accessrequests', data);
    return response.data;
  },

  /**
   * GET /api/tenant/accessrequests/{id} - جزئیات درخواست
   */
  getAccessRequestById: async (requestId: string): Promise<AccessRequestDto | null> => {
    try {
      const response = await apiClient.get(`/api/tenant/accessrequests/${requestId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch access request:', error);
      return null;
    }
  },

  /**
   * POST /api/tenant/accessrequests/{id}/approve - تایید درخواست
   */
  approveRequest: async (requestId: string, comment?: string): Promise<AccessRequestDto> => {
    const response = await apiClient.post(`/api/tenant/accessrequests/${requestId}/approve`, { comment });
    return response.data;
  },

  /**
   * POST /api/tenant/accessrequests/{id}/reject - رد درخواست
   */
  rejectRequest: async (requestId: string, reason: string): Promise<AccessRequestDto> => {
    const response = await apiClient.post(`/api/tenant/accessrequests/${requestId}/reject`, { reason });
    return response.data;
  },

  /**
   * POST /api/tenant/accessrequests/{id}/cancel - لغو درخواست
   */
  cancelRequest: async (requestId: string): Promise<void> => {
    await apiClient.post(`/api/tenant/accessrequests/${requestId}/cancel`);
  },

  // ==================== ACCESS REVIEWS (Spec: /api/tenant/governance/reviews) ====================

  /**
   * GET /api/tenant/governance/reviews - بازبینی‌ها
   */
  getAccessReviews: async (params?: {
    page?: number;
    pageSize?: number;
    status?: string;
  }): Promise<any> => {
    try {
      const response = await apiClient.get('/api/tenant/governance/reviews', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch access reviews:', error);
      return { items: [], total: 0 };
    }
  },

  /**
   * POST /api/tenant/governance/reviews/{id}/certify - تایید دسترسی
   */
  certifyReview: async (reviewId: string, decision: 'Approve' | 'Revoke', comment?: string): Promise<any> => {
    const response = await apiClient.post(`/api/tenant/governance/reviews/${reviewId}/certify`, { decision, comment });
    return response.data;
  },

  // ==================== ACCESS CERTIFICATIONS (Spec: /api/tenant/access/certifications) ====================

  /**
   * GET /api/tenant/access/certifications - گواهینامه‌های دسترسی
   */
  getCertifications: async (params?: {
    page?: number;
    pageSize?: number;
  }): Promise<any> => {
    try {
      const response = await apiClient.get('/api/tenant/access/certifications', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch certifications:', error);
      return { items: [], total: 0 };
    }
  },

  // ==================== GOVERNANCE CAMPAIGNS (Spec: /api/tenant/governance/campaigns) ====================

  /**
   * GET /api/tenant/governance/campaigns - کمپین‌های بازبینی
   */
  getCampaigns: async (params?: {
    page?: number;
    pageSize?: number;
    status?: string;
  }): Promise<any> => {
    try {
      const response = await apiClient.get('/api/tenant/governance/campaigns', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch governance campaigns:', error);
      return { items: [], total: 0 };
    }
  },

  /**
   * POST /api/tenant/governance/campaigns - ایجاد کمپین
   */
  createCampaign: async (data: any): Promise<any> => {
    const response = await apiClient.post('/api/tenant/governance/campaigns', data);
    return response.data;
  },
};

export default accessService;
