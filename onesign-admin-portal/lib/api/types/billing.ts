import { AuditFields } from './common';

/**
 * Billing and subscription related types
 */

export interface Subscription extends AuditFields {
  id: string;
  tenantId: string;
  planId: string;
  planName: string;
  status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'unpaid';
  billingInterval: 'monthly' | 'yearly';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  trialStart?: string;
  trialEnd?: string;
  canceledAt?: string;
  cancelAtPeriodEnd: boolean;
  amount: number;
  currency: string;
  features: string[];
  limits: SubscriptionLimits;
}

export interface SubscriptionLimits {
  maxUsers: number;
  maxApplications: number;
  maxApiCalls: number;
  storageGB: number;
  retentionDays: number;
}

export interface Plan {
  id: string;
  name: string;
  displayName: string;
  description: string;
  tier: 'free' | 'basic' | 'professional' | 'enterprise';
  pricing: PlanPricing;
  features: string[];
  limits: SubscriptionLimits;
  isPopular: boolean;
  isActive: boolean;
}

export interface PlanPricing {
  monthly: number;
  yearly: number;
  currency: string;
  yearlyDiscount?: number;
}

export interface Invoice extends AuditFields {
  id: string;
  tenantId: string;
  subscriptionId: string;
  invoiceNumber: string;
  status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';
  amount: number;
  currency: string;
  tax?: number;
  total: number;
  periodStart: string;
  periodEnd: string;
  dueDate: string;
  paidAt?: string;
  items: InvoiceItem[];
  paymentMethod?: PaymentMethod;
  downloadUrl?: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_account' | 'paypal';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
}

export interface UsageMetrics {
  tenantId: string;
  period: {
    start: string;
    end: string;
  };
  metrics: {
    activeUsers: number;
    totalUsers: number;
    apiCalls: number;
    storageUsedGB: number;
    applications: number;
  };
  limits: SubscriptionLimits;
  utilizationPercent: {
    users: number;
    apiCalls: number;
    storage: number;
  };
}

export interface BillingHistory {
  invoices: Invoice[];
  payments: Payment[];
  totalPaid: number;
  nextBillingDate: string;
}

export interface Payment {
  id: string;
  tenantId: string;
  invoiceId?: string;
  amount: number;
  currency: string;
  status: 'pending' | 'succeeded' | 'failed' | 'refunded';
  paymentMethod: PaymentMethod;
  createdAt: string;
  paidAt?: string;
  failureMessage?: string;
}

export interface UpgradeRequest {
  tenantId: string;
  planId: string;
  billingInterval: 'monthly' | 'yearly';
  paymentMethodId?: string;
}

export interface DowngradeRequest {
  tenantId: string;
  planId: string;
  reason?: string;
  feedback?: string;
}

export interface CancelSubscriptionRequest {
  tenantId: string;
  reason?: string;
  feedback?: string;
  cancelImmediately?: boolean;
}

export interface AddPaymentMethodRequest {
  tenantId: string;
  type: 'card' | 'bank_account' | 'paypal';
  token: string;
  setAsDefault?: boolean;
}

export interface BillingPortalSession {
  url: string;
  expiresAt: string;
}
