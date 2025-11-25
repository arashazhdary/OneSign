export interface Incident {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  type: string;
  source: string;
  assignee?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  resolution?: string;
  affectedResources?: string[];
  timeline?: IncidentTimelineEntry[];
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
