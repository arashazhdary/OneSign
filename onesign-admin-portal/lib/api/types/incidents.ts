import { PaginatedResponse, PaginationParams, AuditFields, SeverityLevel, PriorityLevel } from './common';

/**
 * Incidents and risk events related types
 */

export interface Incident extends AuditFields {
  id: string;
  tenantId: string;
  title: string;
  description: string;
  incidentType: string;
  severity: SeverityLevel;
  priority: PriorityLevel;
  status: 'open' | 'investigating' | 'contained' | 'resolved' | 'closed';
  assignedToUserId?: string;
  assignedToUserName?: string;
  source: string;
  detectedAt: string;
  acknowledgedAt?: string;
  containedAt?: string;
  resolvedAt?: string;
  closedAt?: string;
  affectedEntities: AffectedEntity[];
  timeline: IncidentTimelineEvent[];
  attachments: IncidentAttachment[];
  tags: string[];
  metadata?: Record<string, any>;
}

export interface AffectedEntity {
  entityType: 'user' | 'application' | 'device' | 'resource';
  entityId: string;
  entityName: string;
  impact: string;
}

export interface IncidentTimelineEvent {
  id: string;
  timestamp: string;
  eventType: string;
  description: string;
  userId?: string;
  userName?: string;
  data?: Record<string, any>;
}

export interface IncidentAttachment {
  id: string;
  fileName: string;
  fileSize: number;
  contentType: string;
  url: string;
  uploadedAt: string;
  uploadedByUserId: string;
}

export interface GetIncidentsParams extends PaginationParams {
  tenantId: string;
  status?: string;
  severity?: SeverityLevel;
  priority?: PriorityLevel;
  incidentType?: string;
  assignedTo?: string;
  from?: string;
  to?: string;
  tags?: string[];
}

export interface CreateIncidentRequest {
  tenantId: string;
  title: string;
  description: string;
  incidentType: string;
  severity: SeverityLevel;
  priority: PriorityLevel;
  source: string;
  detectedAt?: string;
  affectedEntities?: AffectedEntity[];
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface UpdateIncidentRequest {
  title?: string;
  description?: string;
  severity?: SeverityLevel;
  priority?: PriorityLevel;
  assignedToUserId?: string;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface IncidentComment {
  id: string;
  incidentId: string;
  userId: string;
  userName: string;
  comment: string;
  createdAt: string;
  isInternal: boolean;
}

export interface IncidentWorkflow {
  id: string;
  name: string;
  description?: string;
  incidentTypes: string[];
  automatedActions: WorkflowAction[];
}

export interface WorkflowAction {
  actionType: string;
  order: number;
  config: Record<string, any>;
  condition?: string;
}

export interface IncidentStatistics {
  tenantId: string;
  totalIncidents: number;
  openIncidents: number;
  resolvedIncidents: number;
  avgResolutionTime: number;
  bySeverity: Record<string, number>;
  byType: Record<string, number>;
  byStatus: Record<string, number>;
  trend: Array<{
    date: string;
    count: number;
  }>;
}
