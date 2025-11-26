// Billing Service - API methods for tenant billing and quota management
// Based on OneSign Technical Specification

import apiClient from '@/services/apiClient';

// Types
export interface SubscriptionDto {
  id: string;
  planId: string;
  planName: string;
  status: 'Active' | 'Cancelled' | 'Expired' | 'Trial';
  startDate: string;
  endDate?: string;
  renewalDate?: string;
  price: number;
  currency: string;
  features: string[];
}

export interface QuotaStatusDto {
  users: {
    used: number;
    limit: number;
    percentage: number;
  };
  applications: {
    used: number;
    limit: number;
    percentage: number;
  };
  apiCalls: {
    used: number;
    limit: number;
    percentage: number;
    resetDate: string;
  };
  storage: {
    usedGB: number;
    limitGB: number;
    percentage: number;
  };
}

export interface BillingSummaryDto {
  currentBalance: number;
  currency: string;
  lastPaymentDate?: string;
  lastPaymentAmount?: number;
  nextPaymentDate?: string;
  nextPaymentAmount?: number;
  totalSpentThisMonth: number;
  totalSpentThisYear: number;
}

export interface InvoiceDto {
  id: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  amount: number;
  currency: string;
  status: 'Paid' | 'Pending' | 'Overdue' | 'Cancelled';
  items: InvoiceItemDto[];
  downloadUrl?: string;
}

export interface InvoiceItemDto {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface ApiUsageDto {
  date: string;
  endpoint: string;
  method: string;
  count: number;
  averageResponseTime: number;
  errorRate: number;
}

// Billing Service
export const billingService = {
  // ==================== SUBSCRIPTION ====================

  /**
   * GET /api/tenant/billing/subscription - اشتراک فعلی
   */
  getSubscription: async (): Promise<SubscriptionDto | null> => {
    try {
      const response = await apiClient.get('/api/tenant/billing/subscription');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch subscription:', error);
      return null;
    }
  },

  /**
   * PUT /api/tenant/billing/subscription - به‌روزرسانی اشتراک
   */
  updateSubscription: async (planId: string): Promise<SubscriptionDto> => {
    const response = await apiClient.put('/api/tenant/billing/subscription', { planId });
    return response.data;
  },

  /**
   * POST /api/tenant/billing/subscription/cancel - لغو اشتراک
   */
  cancelSubscription: async (): Promise<void> => {
    await apiClient.post('/api/tenant/billing/subscription/cancel');
  },

  // ==================== QUOTA ====================

  /**
   * GET /api/tenant/billing/quota-status - وضعیت سهمیه
   */
  getQuotaStatus: async (): Promise<QuotaStatusDto | null> => {
    try {
      const response = await apiClient.get('/api/tenant/billing/quota-status');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch quota status:', error);
      return null;
    }
  },

  // ==================== BILLING SUMMARY ====================

  /**
   * GET /api/tenant/billing/summary - خلاصه مالی
   */
  getSummary: async (): Promise<BillingSummaryDto | null> => {
    try {
      const response = await apiClient.get('/api/tenant/billing/summary');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch billing summary:', error);
      return null;
    }
  },

  // ==================== INVOICES ====================

  /**
   * GET /api/tenant/billing/invoices - فاکتورها
   */
  getInvoices: async (params?: { page?: number; pageSize?: number; status?: string }): Promise<{ items: InvoiceDto[]; total: number }> => {
    try {
      const response = await apiClient.get('/api/tenant/billing/invoices', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch invoices:', error);
      return { items: [], total: 0 };
    }
  },

  /**
   * GET /api/tenant/billing/invoices/{id} - جزئیات فاکتور
   */
  getInvoiceById: async (invoiceId: string): Promise<InvoiceDto | null> => {
    try {
      const response = await apiClient.get(`/api/tenant/billing/invoices/${invoiceId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch invoice:', error);
      return null;
    }
  },

  /**
   * GET /api/tenant/billing/invoices/{id}/download - دانلود فاکتور
   */
  downloadInvoice: async (invoiceId: string): Promise<Blob> => {
    const response = await apiClient.get(`/api/tenant/billing/invoices/${invoiceId}/download`, {
      responseType: 'blob'
    });
    return response.data;
  },

  // ==================== API USAGE ====================

  /**
   * GET /api/tenant/billing/api-usage - مصرف API
   */
  getApiUsage: async (params?: { startDate?: string; endDate?: string; groupBy?: string }): Promise<ApiUsageDto[]> => {
    try {
      const response = await apiClient.get('/api/tenant/billing/api-usage', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch API usage:', error);
      return [];
    }
  },

  /**
   * GET /api/tenant/billing/api-usage/summary - خلاصه مصرف API
   */
  getApiUsageSummary: async (period?: string): Promise<any> => {
    try {
      const response = await apiClient.get('/api/tenant/billing/api-usage/summary', {
        params: { period }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch API usage summary:', error);
      return null;
    }
  },
};

export default billingService;
