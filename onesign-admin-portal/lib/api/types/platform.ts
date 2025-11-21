import { AuditFields } from './common';

/**
 * Platform management related types
 */

export interface Tenant extends AuditFields {
  id: string;
  name: string;
  displayName: string;
  domain?: string;
  subdomain: string;
  status: 'active' | 'suspended' | 'trial' | 'expired';
  tier: 'free' | 'basic' | 'professional' | 'enterprise';
  maxUsers: number;
  currentUsers: number;
  trialEndsAt?: string;
  features: string[];
  settings: TenantSettings;
  branding?: TenantBranding;
  metadata?: Record<string, any>;
}

export interface TenantSettings {
  language: string;
  timezone: string;
  dateFormat: string;
  allowSelfRegistration: boolean;
  requireEmailVerification: boolean;
  sessionTimeout: number;
  mfaRequired: boolean;
  passwordPolicy: PasswordPolicy;
  notificationChannels: string[];
}

export interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  expiryDays?: number;
  preventReuse: number;
}

export interface TenantBranding {
  logo?: string;
  favicon?: string;
  primaryColor: string;
  secondaryColor: string;
  customCss?: string;
  customDomain?: string;
}

export interface CreateTenantRequest {
  name: string;
  displayName: string;
  subdomain: string;
  adminEmail: string;
  adminFirstName: string;
  adminLastName: string;
  tier?: string;
}

export interface UpdateTenantRequest {
  displayName?: string;
  domain?: string;
  settings?: Partial<TenantSettings>;
  branding?: Partial<TenantBranding>;
  metadata?: Record<string, any>;
}

export interface Role extends AuditFields {
  id: string;
  tenantId?: string;
  name: string;
  displayName: string;
  description?: string;
  type: 'system' | 'custom';
  isBuiltIn: boolean;
  scope: 'global' | 'tenant' | 'orgunit';
  permissions: Permission[];
}

export interface Permission {
  id: string;
  resource: string;
  action: string;
  description: string;
}

export interface OrgUnit extends AuditFields {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  parentId?: string;
  path: string;
  level: number;
  type: string;
  managerId?: string;
  metadata?: Record<string, any>;
  children?: OrgUnit[];
}

export interface Integration extends AuditFields {
  id: string;
  tenantId?: string;
  name: string;
  type: string;
  provider: string;
  status: 'active' | 'inactive' | 'error';
  config: Record<string, any>;
  credentials?: Record<string, any>;
  lastSyncAt?: string;
  errorMessage?: string;
}

export interface Webhook extends AuditFields {
  id: string;
  tenantId: string;
  name: string;
  url: string;
  secret?: string;
  events: string[];
  isActive: boolean;
  headers?: Record<string, string>;
  retryPolicy?: {
    maxRetries: number;
    retryDelay: number;
  };
}

export interface WebhookEvent {
  id: string;
  webhookId: string;
  eventType: string;
  payload: Record<string, any>;
  status: 'pending' | 'delivered' | 'failed';
  attempts: number;
  lastAttemptAt?: string;
  deliveredAt?: string;
  errorMessage?: string;
  createdAt: string;
}

export interface ApiKey extends AuditFields {
  id: string;
  tenantId: string;
  name: string;
  key: string;
  keyPrefix: string;
  permissions: string[];
  expiresAt?: string;
  lastUsedAt?: string;
  isActive: boolean;
}

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  version: string;
  timestamp: string;
  services: Record<string, ServiceHealth>;
  metrics: SystemMetrics;
}

export interface ServiceHealth {
  status: 'up' | 'down' | 'degraded';
  responseTime?: number;
  lastCheck: string;
  errorMessage?: string;
}

export interface SystemMetrics {
  activeUsers: number;
  activeTenants: number;
  apiRequestsPerMinute: number;
  avgResponseTime: number;
  errorRate: number;
}
