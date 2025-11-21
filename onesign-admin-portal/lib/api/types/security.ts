import { PaginatedResponse, PaginationParams, AuditFields, SeverityLevel } from './common';

/**
 * Security related types
 */

export interface SecurityPolicy extends AuditFields {
  id: string;
  tenantId?: string;
  name: string;
  description?: string;
  type: 'password' | 'mfa' | 'session' | 'access' | 'risk';
  isEnabled: boolean;
  isEnforced: boolean;
  rules: SecurityPolicyRule[];
  scope: 'global' | 'tenant' | 'orgunit';
  scopeId?: string;
}

export interface SecurityPolicyRule {
  id: string;
  ruleType: string;
  config: Record<string, any>;
  order: number;
}

export interface RiskEvent extends AuditFields {
  id: string;
  tenantId: string;
  userId?: string;
  userName?: string;
  eventType: string;
  severity: SeverityLevel;
  riskScore: number;
  status: 'open' | 'investigating' | 'resolved' | 'false_positive';
  details: Record<string, any>;
  ipAddress?: string;
  location?: string;
  deviceInfo?: string;
  mitigationActions?: string[];
  resolvedAt?: string;
  resolvedByUserId?: string;
  notes?: string;
}

export interface GetRiskEventsParams extends PaginationParams {
  tenantId: string;
  userId?: string;
  severity?: SeverityLevel;
  status?: string;
  eventType?: string;
  from?: string;
  to?: string;
}

export interface ThreatDetection {
  id: string;
  tenantId: string;
  detectionType: string;
  name: string;
  description: string;
  severity: SeverityLevel;
  isEnabled: boolean;
  detectionRules: DetectionRule[];
  alertChannels: string[];
}

export interface DetectionRule {
  id: string;
  condition: string;
  threshold: number;
  timeWindow: number;
}

export interface SecurityAlert extends AuditFields {
  id: string;
  tenantId: string;
  alertType: string;
  title: string;
  description: string;
  severity: SeverityLevel;
  status: 'new' | 'acknowledged' | 'resolved' | 'suppressed';
  source: string;
  entityType?: string;
  entityId?: string;
  acknowledgedAt?: string;
  acknowledgedByUserId?: string;
  resolvedAt?: string;
  resolvedByUserId?: string;
}

export interface AuditLog extends AuditFields {
  id: string;
  tenantId: string;
  userId?: string;
  userName?: string;
  action: string;
  category: string;
  resourceType: string;
  resourceId?: string;
  resourceName?: string;
  status: 'success' | 'failure';
  ipAddress: string;
  userAgent: string;
  location?: string;
  details?: Record<string, any>;
}

export interface GetAuditLogsParams extends PaginationParams {
  tenantId: string;
  userId?: string;
  action?: string;
  category?: string;
  resourceType?: string;
  status?: string;
  from?: string;
  to?: string;
}

export interface AccessReview {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  reviewType: 'application' | 'role' | 'group' | 'permission';
  scope: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  dueDate: string;
  reviewers: string[];
  items: AccessReviewItem[];
  completedAt?: string;
  statistics?: {
    total: number;
    approved: number;
    revoked: number;
    pending: number;
  };
}

export interface AccessReviewItem {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  accessType: string;
  accessName: string;
  grantedAt: string;
  lastUsedAt?: string;
  decision?: 'approve' | 'revoke' | 'pending';
  decidedAt?: string;
  decidedByUserId?: string;
  notes?: string;
}

export interface ConditionalAccessPolicy extends AuditFields {
  id: string;
  tenantId?: string;
  name: string;
  description?: string;
  isEnabled: boolean;
  priority: number;
  conditions: ConditionalAccessCondition[];
  actions: ConditionalAccessAction[];
}

export interface ConditionalAccessCondition {
  type: 'user' | 'group' | 'location' | 'device' | 'application' | 'risk';
  operator: 'equals' | 'notEquals' | 'contains' | 'in' | 'notIn';
  value: any;
}

export interface ConditionalAccessAction {
  type: 'allow' | 'deny' | 'requireMfa' | 'requireCompliantDevice' | 'requireApprovedApp';
  config?: Record<string, any>;
}
