import { PaginatedResponse, PaginationParams, AuditFields, Status } from './common';

/**
 * Application related types
 */

export interface Application extends AuditFields {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  type: 'saas' | 'custom' | 'internal';
  category: string;
  icon?: string;
  url?: string;
  status: Status;
  isVisible: boolean;
  isCritical: boolean;
  owner?: string;
  integrations: ApplicationIntegration[];
  accessPolicies: string[];
  metadata?: Record<string, any>;
}

export interface ApplicationIntegration {
  id: string;
  type: 'scim' | 'oauth2' | 'saml' | 'api' | 'webhook';
  status: 'active' | 'inactive' | 'error';
  config: Record<string, any>;
  lastSyncAt?: string;
  errorMessage?: string;
}

export interface GetApplicationsParams extends PaginationParams {
  tenantId: string;
  status?: Status;
  type?: string;
  category?: string;
  search?: string;
}

export interface CreateApplicationRequest {
  tenantId: string;
  name: string;
  description?: string;
  type: 'saas' | 'custom' | 'internal';
  category: string;
  icon?: string;
  url?: string;
  isCritical?: boolean;
  metadata?: Record<string, any>;
}

export interface UpdateApplicationRequest {
  name?: string;
  description?: string;
  category?: string;
  icon?: string;
  url?: string;
  isCritical?: boolean;
  metadata?: Record<string, any>;
}

export interface ApplicationAccess {
  userId: string;
  userName: string;
  userEmail: string;
  hasAccess: boolean;
  roles: string[];
  grantedAt?: string;
  grantedByUserId?: string;
  lastAccessAt?: string;
}

export interface GrantApplicationAccessRequest {
  userId: string;
  roles?: string[];
  expiresAt?: string;
}

export interface ApplicationUsageStats {
  applicationId: string;
  totalUsers: number;
  activeUsers: number;
  totalSessions: number;
  avgSessionDuration: number;
  lastAccessAt?: string;
  stats: Array<{
    date: string;
    users: number;
    sessions: number;
  }>;
}

export interface ApplicationRiskScore {
  applicationId: string;
  score: number;
  level: 'low' | 'medium' | 'high' | 'critical';
  factors: Array<{
    factor: string;
    score: number;
    description: string;
  }>;
  lastCalculatedAt: string;
}

export interface ApplicationCatalogItem {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  vendor: string;
  isAvailable: boolean;
  isPopular: boolean;
  supportedIntegrations: string[];
}
