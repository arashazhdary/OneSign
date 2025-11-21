import { PaginatedResponse, PaginationParams, AuditFields } from './common';

/**
 * Governance and compliance related types
 */

export interface ComplianceFramework {
  id: string;
  name: string;
  description: string;
  version: string;
  isActive: boolean;
  requirements: ComplianceRequirement[];
}

export interface ComplianceRequirement {
  id: string;
  code: string;
  title: string;
  description: string;
  category: string;
  controls: string[];
}

export interface Policy extends AuditFields {
  id: string;
  tenantId?: string;
  name: string;
  description?: string;
  category: string;
  type: string;
  isEnabled: boolean;
  isEnforced: boolean;
  scope: 'global' | 'tenant' | 'orgunit';
  scopeId?: string;
  content: string;
  version: number;
  effectiveDate: string;
  expiryDate?: string;
  approvers: string[];
  tags: string[];
}

export interface PolicyViolation {
  id: string;
  tenantId: string;
  policyId: string;
  policyName: string;
  userId?: string;
  userName?: string;
  violationType: string;
  severity: string;
  status: 'open' | 'investigating' | 'resolved' | 'false_positive';
  detectedAt: string;
  resolvedAt?: string;
  details: Record<string, any>;
}

export interface ComplianceReport {
  id: string;
  tenantId: string;
  reportType: string;
  framework: string;
  period: {
    from: string;
    to: string;
  };
  status: 'draft' | 'pending_review' | 'approved' | 'published';
  overallScore: number;
  findings: ComplianceFinding[];
  generatedAt: string;
  generatedByUserId: string;
}

export interface ComplianceFinding {
  id: string;
  requirementId: string;
  status: 'compliant' | 'non_compliant' | 'partially_compliant' | 'not_applicable';
  evidence: string[];
  gaps: string[];
  recommendations: string[];
}

export interface DataClassification {
  id: string;
  name: string;
  level: 'public' | 'internal' | 'confidential' | 'restricted';
  description: string;
  handlingRequirements: string[];
  retentionPeriod?: number;
}
