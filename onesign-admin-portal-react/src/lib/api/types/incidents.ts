export interface Incident {
  id: string;
  title: string;
  description: string;
  severity: number; // 0: Low, 1: Medium, 2: High, 3: Critical
  status: number; // 0: New, 1: Acknowledged, 2: Investigating, 3: Resolved, 4: Closed
  type: string;
  source: string;
  category: string;
  assignee?: string;
  assignedToUserName?: string;
  detectedAt: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  resolution?: string;
  affectedResources?: string[];
  timeline?: IncidentTimelineEntry[];
  notes: IncidentNote[];
  linkedEntities: LinkedEntity[];
}

export interface IncidentNote {
  id: string;
  content: string;
  createdByUserId: string;
  createdByUserName: string;
  createdAt: string;
}

export interface LinkedEntity {
  id: string;
  entityType: string;
  entityId: string;
  entityName: string;
  linkedAt: string;
}

export interface IncidentTimelineEntry {
  id: string;
  timestamp: string;
  action: string;
  actor: string;
  details?: string;
}

export interface IncidentListResponse {
  items: Incident[];
  total: number;
  page: number;
  pageSize: number;
}

export interface IncidentStats {
  totalActive: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
}
