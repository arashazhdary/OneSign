import { ApiClient, apiClient } from '../api-client';
import {
  Subscription,
  Plan,
  Invoice,
  PaymentMethod,
  UsageMetrics,
  BillingHistory,
  Payment,
  UpgradeRequest,
  DowngradeRequest,
  CancelSubscriptionRequest,
  AddPaymentMethodRequest,
  BillingPortalSession,
} from '../types/billing';

/**
 * Billing Service
 * Handles all billing and subscription operations
 */
export class BillingService {
  constructor(private client: ApiClient = apiClient) {}

  // Subscriptions

  /**
   * Get current subscription
   */
  async getCurrentSubscription(tenantId: string): Promise<Subscription> {
    const response = await this.client.get<Subscription>('/api/tenant/billing/subscription', {
      tenantId,
    });
    return response.data;
  }

  /**
   * Upgrade subscription
   */
  async upgradeSubscription(data: UpgradeRequest): Promise<Subscription> {
    const response = await this.client.post<Subscription>(
      '/api/tenant/billing/subscription/upgrade',
      data
    );
    return response.data;
  }

  /**
   * Downgrade subscription
   */
  async downgradeSubscription(data: DowngradeRequest): Promise<Subscription> {
    const response = await this.client.post<Subscription>(
      '/api/tenant/billing/subscription/downgrade',
      data
    );
    return response.data;
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(data: CancelSubscriptionRequest): Promise<Subscription> {
    const response = await this.client.post<Subscription>(
      '/api/tenant/billing/subscription/cancel',
      data
    );
    return response.data;
  }

  /**
   * Reactivate subscription
   */
  async reactivateSubscription(tenantId: string): Promise<Subscription> {
    const response = await this.client.post<Subscription>(
      '/api/tenant/billing/subscription/reactivate',
      { tenantId }
    );
    return response.data;
  }

  // Plans

  /**
   * Get available plans
   */
  async getPlans(): Promise<Plan[]> {
    const response = await this.client.get<Plan[]>('/api/billing/plans');
    return response.data;
  }

  /**
   * Get plan by ID
   */
  async getPlanById(planId: string): Promise<Plan> {
    const response = await this.client.get<Plan>(`/api/billing/plans/${planId}`);
    return response.data;
  }

  /**
   * Compare plans
   */
  async comparePlans(planIds: string[]): Promise<Plan[]> {
    const response = await this.client.post<Plan[]>('/api/billing/plans/compare', { planIds });
    return response.data;
  }

  // Invoices

  /**
   * Get invoices
   */
  async getInvoices(tenantId: string, limit?: number): Promise<Invoice[]> {
    const response = await this.client.get<Invoice[]>('/api/tenant/billing/invoices', {
      tenantId,
      limit,
    });
    return response.data;
  }

  /**
   * Get invoice by ID
   */
  async getInvoiceById(tenantId: string, invoiceId: string): Promise<Invoice> {
    const response = await this.client.get<Invoice>(
      `/api/tenant/billing/invoices/${invoiceId}`,
      { tenantId }
    );
    return response.data;
  }

  /**
   * Download invoice
   */
  async downloadInvoice(tenantId: string, invoiceId: string): Promise<Blob> {
    const response = await this.client.get<Blob>(
      `/api/tenant/billing/invoices/${invoiceId}/download`,
      { tenantId }
    );
    return response.data;
  }

  /**
   * Get upcoming invoice
   */
  async getUpcomingInvoice(tenantId: string): Promise<Invoice> {
    const response = await this.client.get<Invoice>('/api/tenant/billing/invoices/upcoming', {
      tenantId,
    });
    return response.data;
  }

  // Payment Methods

  /**
   * Get payment methods
   */
  async getPaymentMethods(tenantId: string): Promise<PaymentMethod[]> {
    const response = await this.client.get<PaymentMethod[]>(
      '/api/tenant/billing/payment-methods',
      { tenantId }
    );
    return response.data;
  }

  /**
   * Add payment method
   */
  async addPaymentMethod(data: AddPaymentMethodRequest): Promise<PaymentMethod> {
    const response = await this.client.post<PaymentMethod>(
      '/api/tenant/billing/payment-methods',
      data
    );
    return response.data;
  }

  /**
   * Set default payment method
   */
  async setDefaultPaymentMethod(tenantId: string, paymentMethodId: string): Promise<void> {
    await this.client.post(`/api/tenant/billing/payment-methods/${paymentMethodId}/set-default`, {
      tenantId,
    });
  }

  /**
   * Remove payment method
   */
  async removePaymentMethod(tenantId: string, paymentMethodId: string): Promise<void> {
    await this.client.delete(`/api/tenant/billing/payment-methods/${paymentMethodId}`, {
      params: { tenantId },
    });
  }

  // Usage & Metrics

  /**
   * Get usage metrics
   */
  async getUsageMetrics(tenantId: string, from?: string, to?: string): Promise<UsageMetrics> {
    const response = await this.client.get<UsageMetrics>('/api/tenant/billing/usage', {
      tenantId,
      from,
      to,
    });
    return response.data;
  }

  /**
   * Get current period usage
   */
  async getCurrentPeriodUsage(tenantId: string): Promise<UsageMetrics> {
    const response = await this.client.get<UsageMetrics>(
      '/api/tenant/billing/usage/current-period',
      { tenantId }
    );
    return response.data;
  }

  // Billing History

  /**
   * Get billing history
   */
  async getBillingHistory(tenantId: string): Promise<BillingHistory> {
    const response = await this.client.get<BillingHistory>('/api/tenant/billing/history', {
      tenantId,
    });
    return response.data;
  }

  /**
   * Get payments
   */
  async getPayments(tenantId: string, limit?: number): Promise<Payment[]> {
    const response = await this.client.get<Payment[]>('/api/tenant/billing/payments', {
      tenantId,
      limit,
    });
    return response.data;
  }

  // Billing Portal

  /**
   * Create billing portal session
   */
  async createBillingPortalSession(tenantId: string): Promise<BillingPortalSession> {
    const response = await this.client.post<BillingPortalSession>(
      '/api/tenant/billing/portal-session',
      { tenantId }
    );
    return response.data;
  }

  // Estimates & Previews

  /**
   * Preview subscription upgrade
   */
  async previewUpgrade(tenantId: string, planId: string, billingInterval: string): Promise<Invoice> {
    const response = await this.client.post<Invoice>('/api/tenant/billing/preview/upgrade', {
      tenantId,
      planId,
      billingInterval,
    });
    return response.data;
  }

  /**
   * Preview subscription downgrade
   */
  async previewDowngrade(tenantId: string, planId: string): Promise<Invoice> {
    const response = await this.client.post<Invoice>('/api/tenant/billing/preview/downgrade', {
      tenantId,
      planId,
    });
    return response.data;
  }

  // Coupons & Discounts

  /**
   * Apply coupon
   */
  async applyCoupon(tenantId: string, couponCode: string): Promise<Subscription> {
    const response = await this.client.post<Subscription>('/api/tenant/billing/coupon/apply', {
      tenantId,
      couponCode,
    });
    return response.data;
  }

  /**
   * Remove coupon
   */
  async removeCoupon(tenantId: string): Promise<Subscription> {
    const response = await this.client.post<Subscription>('/api/tenant/billing/coupon/remove', {
      tenantId,
    });
    return response.data;
  }

  // Tax Information

  /**
   * Update tax information
   */
  async updateTaxInfo(
    tenantId: string,
    taxInfo: { taxId?: string; country: string; state?: string }
  ): Promise<void> {
    await this.client.post('/api/tenant/billing/tax-info', {
      tenantId,
      ...taxInfo,
    });
  }

  /**
   * Get tax information
   */
  async getTaxInfo(tenantId: string): Promise<any> {
    const response = await this.client.get('/api/tenant/billing/tax-info', { tenantId });
    return response.data;
  }
}

// Export singleton instance
export const billingService = new BillingService();
