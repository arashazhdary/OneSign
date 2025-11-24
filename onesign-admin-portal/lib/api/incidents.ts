import { API_BASE } from './config/api-config';

// Enums
export type IncidentStatus = 'New' | 'Acknowledged' | 'InProgress' | 'Resolved' | 'Closed';
export type IncidentSeverity = 'Low' | 'Medium' | 'High' | 'Critical';
export type IncidentCategory = 'SecurityBreach' | 'UnauthorizedAccess' | 'DataLeak' | 'MaliciousActivity' | 'PolicyViolation' | 'SystemCompromise' | 'Other';
export type DetectionSource = 'Manual' | 'Automated' | 'UserReport' | 'ExternalAlert' | 'Hunting';
export type IncidentEntityType = 'User' | 'Application' | 'Device' | 'IP' | 'Location' | 'Session';
export type IncidentEntityRole = 'Primary' | 'Affected' | 'Related' | 'Source' | 'Target';

// DTOs
export interface IncidentDto {
  id: string;
  tenantId: string;
  title: string;
  description: string;
  category: IncidentCategory;
  severity: IncidentSeverity;
  status: IncidentStatus;
  detectionSource: DetectionSource;
  primaryUserId?: string;
  primaryUserName?: string;
  primaryAppId?: string;
  primaryAppName?: string;
  affectedUsersCount: number;
  affectedAppsCount: number;
  createdAt: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
  closedAt?: string;
  assignedToUserId?: string;
  assignedToUserName?: string;
}

export interface IncidentDetailDto extends IncidentDto {
  events: IncidentEventDto[];
  entities: IncidentEntityDto[];
  notes: IncidentNoteDto[];
  playbookRuns: IncidentPlaybookRunDto[];
  timeline: IncidentTimelineItemDto[];
}

export interface IncidentEventDto {
  id: string;
  incidentId: string;
  eventType: string;
  eventId: string;
  timestamp: string;
  severity: string;
  summary: string;
  detailsJson?: string;
}

export interface IncidentEntityDto {
  id: string;
  incidentId: string;
  entityType: IncidentEntityType;
  entityId: string;
  entityName: string;
  role: IncidentEntityRole;
  addedAt: string;
}

export interface IncidentNoteDto {
  id: string;
  incidentId: string;
  content: string;
  createdAt: string;
  createdByUserId: string;
  createdByUserName?: string;
}

export interface IncidentPlaybookRunDto {
  id: string;
  incidentId: string;
  workflowId: string;
  workflowName: string;
  triggeredAt: string;
  triggeredByUserId: string;
  triggeredByUserName?: string;
  status: string;
  completedAt?: string;
  resultSummary?: string;
}

export interface IncidentTimelineItemDto {
  id: string;
  incidentId: string;
  timestamp: string;
  eventType: string;
  description: string;
  userId?: string;
  userName?: string;
  metadata?: string;
}

export interface IncidentListDto {
  incidents: IncidentDto[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface IncidentStatisticsDto {
  totalIncidents: number;
  openIncidents: number;
  resolvedIncidents: number;
  closedIncidents: number;
  bySeverity: SeverityCountDto[];
  byCategory: CategoryCountDto[];
  byStatus: StatusCountDto[];
  averageResolutionTimeHours: number;
  trend: DailyIncidentTrendDto[];
}

export interface SeverityCountDto {
  severity: IncidentSeverity;
  count: number;
}

export interface CategoryCountDto {
  category: IncidentCategory;
  count: number;
}

export interface StatusCountDto {
  status: IncidentStatus;
  count: number;
}

export interface DailyIncidentTrendDto {
  date: string;
  created: number;
  resolved: number;
  closed: number;
}

export interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}

// API functions

export async function getIncidents(
  tenantId: string,
  params?: {
    status?: IncidentStatus;
    severity?: IncidentSeverity;
    category?: IncidentCategory;
    from?: string;
    to?: string;
    page?: number;
    pageSize?: number;
  }
): Promise<IncidentListDto> {
  const searchParams = new URLSearchParams({ tenantId });
  if (params?.status) searchParams.append('status', params.status);
  if (params?.severity) searchParams.append('severity', params.severity);
  if (params?.category) searchParams.append('category', params.category);
  if (params?.from) searchParams.append('from', params.from);
  if (params?.to) searchParams.append('to', params.to);
  if (params?.page) searchParams.append('page', params.page.toString());
  if (params?.pageSize) searchParams.append('pageSize', params.pageSize.toString());

  const response = await fetch(`${API_BASE}/api/tenant/incidents?${searchParams}`);
  if (!response.ok) throw new Error('Failed to fetch incidents');
  return response.json();
}

export async function getIncident(id: string): Promise<IncidentDetailDto> {
  const response = await fetch(`${API_BASE}/api/tenant/incidents/${id}`);
  if (!response.ok) throw new Error('Failed to fetch incident');
  return response.json();
}

export async function createIncident(data: {
  tenantId: string;
  title: string;
  description: string;
  category: IncidentCategory;
  severity: IncidentSeverity;
  detectionSource: DetectionSource;
  primaryUserId?: string;
  primaryAppId?: string;
  affectedUsersCount: number;
  affectedAppsCount: number;
  initialEvents?: IncidentEventDto[];
  relatedEntities?: IncidentEntityDto[];
}): Promise<IncidentDto> {
  const response = await fetch(`${API_BASE}/api/tenant/incidents`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create incident');
  return response.json();
}

export async function updateIncident(
  id: string,
  data: {
    title: string;
    description: string;
    category: IncidentCategory;
    severity: IncidentSeverity;
    affectedUsersCount: number;
    affectedAppsCount: number;
  }
): Promise<IncidentDto> {
  const response = await fetch(`${API_BASE}/api/tenant/incidents/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update incident');
  return response.json();
}

export async function acknowledgeIncident(
  id: string,
  data: { note?: string }
): Promise<IncidentDto> {
  const response = await fetch(`${API_BASE}/api/tenant/incidents/${id}/acknowledge`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to acknowledge incident');
  return response.json();
}

export async function assignIncident(
  id: string,
  data: {
    assignToUserId: string;
    note?: string;
  }
): Promise<IncidentDto> {
  const response = await fetch(`${API_BASE}/api/tenant/incidents/${id}/assign`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to assign incident');
  return response.json();
}

export async function updateIncidentStatus(
  id: string,
  data: {
    status: IncidentStatus;
    note?: string;
  }
): Promise<IncidentDto> {
  const response = await fetch(`${API_BASE}/api/tenant/incidents/${id}/status`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update incident status');
  return response.json();
}

export async function resolveIncident(
  id: string,
  data: { resolutionSummary: string }
): Promise<IncidentDto> {
  const response = await fetch(`${API_BASE}/api/tenant/incidents/${id}/resolve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to resolve incident');
  return response.json();
}

export async function closeIncident(
  id: string,
  data: { finalNote?: string }
): Promise<IncidentDto> {
  const response = await fetch(`${API_BASE}/api/tenant/incidents/${id}/close`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to close incident');
  return response.json();
}

export async function addIncidentNote(
  id: string,
  data: { content: string }
): Promise<IncidentNoteDto> {
  const response = await fetch(`${API_BASE}/api/tenant/incidents/${id}/notes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to add incident note');
  return response.json();
}

export async function linkEntityToIncident(
  id: string,
  data: {
    entityType: IncidentEntityType;
    entityId: string;
    entityName: string;
    role: IncidentEntityRole;
  }
): Promise<IncidentEntityDto> {
  const response = await fetch(`${API_BASE}/api/tenant/incidents/${id}/entities`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to link entity to incident');
  return response.json();
}

export async function runPlaybookOnIncident(
  id: string,
  data: {
    workflowId: string;
    workflowName: string;
    parameters?: Record<string, string>;
  }
): Promise<IncidentPlaybookRunDto> {
  const response = await fetch(`${API_BASE}/api/tenant/incidents/${id}/playbook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to run playbook on incident');
  return response.json();
}

export async function getIncidentTimeline(
  id: string,
  params?: {
    from?: string;
    to?: string;
    limit?: number;
  }
): Promise<IncidentTimelineItemDto[]> {
  const searchParams = new URLSearchParams();
  if (params?.from) searchParams.append('from', params.from);
  if (params?.to) searchParams.append('to', params.to);
  if (params?.limit) searchParams.append('limit', params.limit.toString());

  const response = await fetch(`${API_BASE}/api/tenant/incidents/${id}/timeline?${searchParams}`);
  if (!response.ok) throw new Error('Failed to fetch incident timeline');
  return response.json();
}

export async function getRelatedIncidents(
  id: string,
  params?: {
    maxResults?: number;
    includeSameUser?: boolean;
    includeSameApplication?: boolean;
    includeSameCategory?: boolean;
  }
): Promise<IncidentDto[]> {
  const searchParams = new URLSearchParams();
  if (params?.maxResults) searchParams.append('maxResults', params.maxResults.toString());
  if (params?.includeSameUser !== undefined) searchParams.append('includeSameUser', params.includeSameUser.toString());
  if (params?.includeSameApplication !== undefined) searchParams.append('includeSameApplication', params.includeSameApplication.toString());
  if (params?.includeSameCategory !== undefined) searchParams.append('includeSameCategory', params.includeSameCategory.toString());

  const response = await fetch(`${API_BASE}/api/tenant/incidents/${id}/related?${searchParams}`);
  if (!response.ok) throw new Error('Failed to fetch related incidents');
  return response.json();
}

export async function getIncidentStatistics(
  tenantId: string,
  params?: {
    from?: string;
    to?: string;
    trendDays?: number;
  }
): Promise<IncidentStatisticsDto> {
  const searchParams = new URLSearchParams({ tenantId });
  if (params?.from) searchParams.append('from', params.from);
  if (params?.to) searchParams.append('to', params.to);
  if (params?.trendDays) searchParams.append('trendDays', params.trendDays.toString());

  const response = await fetch(`${API_BASE}/api/tenant/incidents/statistics?${searchParams}`);
  if (!response.ok) throw new Error('Failed to fetch incident statistics');
  return response.json();
}

// Constants
export const INCIDENT_STATUSES: IncidentStatus[] = [
  'New',
  'Acknowledged',
  'InProgress',
  'Resolved',
  'Closed',
];

export const INCIDENT_SEVERITIES: IncidentSeverity[] = [
  'Low',
  'Medium',
  'High',
  'Critical',
];

export const INCIDENT_CATEGORIES: IncidentCategory[] = [
  'SecurityBreach',
  'UnauthorizedAccess',
  'DataLeak',
  'MaliciousActivity',
  'PolicyViolation',
  'SystemCompromise',
  'Other',
];

export const DETECTION_SOURCES: DetectionSource[] = [
  'Manual',
  'Automated',
  'UserReport',
  'ExternalAlert',
  'Hunting',
];

export const ENTITY_TYPES: IncidentEntityType[] = [
  'User',
  'Application',
  'Device',
  'IP',
  'Location',
  'Session',
];

export const ENTITY_ROLES: IncidentEntityRole[] = [
  'Primary',
  'Affected',
  'Related',
  'Source',
  'Target',
];
