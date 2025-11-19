const API_BASE = 'http://localhost:7000';

// DTOs
export interface OqlQueryDto {
  dataset: string;
  selectFields: string[];
  whereClause?: string;
  orderBy?: string;
  limit?: number;
  offset?: number;
}

export interface HuntResultDto {
  queryId?: string;
  executedAt: string;
  durationMs: number;
  totalRows: number;
  columns: ColumnDefinitionDto[];
  rows: Record<string, unknown>[];
  warnings?: string[];
}

export interface ColumnDefinitionDto {
  name: string;
  type: string;
  nullable: boolean;
}

export interface SavedQueryDto {
  id: string;
  scopeType: string;
  scopeId: string;
  name: string;
  description?: string;
  dataset: string;
  queryDslJson: string;
  isGlobalTemplate: boolean;
  isEnabled: boolean;
  createdAt: string;
  createdByUserId: string;
  createdByUserName?: string;
  updatedAt?: string;
  updatedByUserId?: string;
  lastExecutedAt?: string;
  executionCount: number;
}

export interface ScheduledHuntDto {
  id: string;
  scopeType: string;
  scopeId: string;
  savedQueryId: string;
  savedQueryName?: string;
  name: string;
  description?: string;
  scheduleSpec: string;
  isEnabled: boolean;
  minMatchCountForFinding: number;
  maxRowsToScan: number;
  timeWindowMinutes: number;
  actions?: HuntActionConfigDto;
  createdAt: string;
  createdByUserId: string;
  updatedAt?: string;
  lastRunAt?: string;
  nextRunAt?: string;
  runCount: number;
}

export interface HuntActionConfigDto {
  createIncident: boolean;
  incidentSeverity?: string;
  sendEmail: boolean;
  emailRecipients?: string[];
  sendWebhook: boolean;
  webhookUrl?: string;
  triggerAutomation: boolean;
  automationWorkflowId?: string;
}

export interface HuntRunDto {
  id: string;
  scheduledHuntId: string;
  scheduledHuntName?: string;
  startedAt: string;
  completedAt?: string;
  status: string;
  rowsScanned: number;
  matchCount: number;
  findingCreated: boolean;
  findingId?: string;
  errorMessage?: string;
  durationMs?: number;
  sampleRows?: Record<string, unknown>[];
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

// Tenant API functions

export async function executeQuery(
  tenantId: string,
  query: OqlQueryDto
): Promise<HuntResultDto> {
  const response = await fetch(`${API_BASE}/api/tenant/hunting/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tenantId, query }),
  });
  if (!response.ok) throw new Error('Failed to execute query');
  return response.json();
}

export async function getSavedQueries(
  tenantId: string,
  params?: {
    dataset?: string;
    isEnabled?: boolean;
    searchTerm?: string;
    pageNumber?: number;
    pageSize?: number;
  }
): Promise<PagedResult<SavedQueryDto>> {
  const searchParams = new URLSearchParams({ tenantId });
  if (params?.dataset) searchParams.append('dataset', params.dataset);
  if (params?.isEnabled !== undefined) searchParams.append('isEnabled', params.isEnabled.toString());
  if (params?.searchTerm) searchParams.append('searchTerm', params.searchTerm);
  if (params?.pageNumber) searchParams.append('pageNumber', params.pageNumber.toString());
  if (params?.pageSize) searchParams.append('pageSize', params.pageSize.toString());

  const response = await fetch(`${API_BASE}/api/tenant/hunting/saved-queries?${searchParams}`);
  if (!response.ok) throw new Error('Failed to fetch saved queries');
  return response.json();
}

export async function getSavedQuery(id: string, tenantId: string): Promise<SavedQueryDto> {
  const response = await fetch(`${API_BASE}/api/tenant/hunting/saved-queries/${id}?tenantId=${tenantId}`);
  if (!response.ok) throw new Error('Failed to fetch saved query');
  return response.json();
}

export async function createSavedQuery(data: {
  tenantId: string;
  name: string;
  description?: string;
  dataset: string;
  queryDslJson: string;
  isGlobalTemplate: boolean;
  isEnabled?: boolean;
}): Promise<SavedQueryDto> {
  const response = await fetch(`${API_BASE}/api/tenant/hunting/saved-queries`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create saved query');
  return response.json();
}

export async function updateSavedQuery(
  id: string,
  data: {
    tenantId: string;
    name: string;
    description?: string;
    dataset: string;
    queryDslJson: string;
    isGlobalTemplate: boolean;
    isEnabled: boolean;
  }
): Promise<SavedQueryDto> {
  const response = await fetch(`${API_BASE}/api/tenant/hunting/saved-queries/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update saved query');
  return response.json();
}

export async function deleteSavedQuery(id: string, tenantId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/api/tenant/hunting/saved-queries/${id}?tenantId=${tenantId}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete saved query');
}

export async function getScheduledHunts(
  tenantId: string,
  params?: {
    scheduleSpec?: string;
    isEnabled?: boolean;
    savedQueryId?: string;
    pageNumber?: number;
    pageSize?: number;
  }
): Promise<PagedResult<ScheduledHuntDto>> {
  const searchParams = new URLSearchParams({ tenantId });
  if (params?.scheduleSpec) searchParams.append('scheduleSpec', params.scheduleSpec);
  if (params?.isEnabled !== undefined) searchParams.append('isEnabled', params.isEnabled.toString());
  if (params?.savedQueryId) searchParams.append('savedQueryId', params.savedQueryId);
  if (params?.pageNumber) searchParams.append('pageNumber', params.pageNumber.toString());
  if (params?.pageSize) searchParams.append('pageSize', params.pageSize.toString());

  const response = await fetch(`${API_BASE}/api/tenant/hunting/scheduled-hunts?${searchParams}`);
  if (!response.ok) throw new Error('Failed to fetch scheduled hunts');
  return response.json();
}

export async function getScheduledHunt(id: string, tenantId: string): Promise<ScheduledHuntDto> {
  const response = await fetch(`${API_BASE}/api/tenant/hunting/scheduled-hunts/${id}?tenantId=${tenantId}`);
  if (!response.ok) throw new Error('Failed to fetch scheduled hunt');
  return response.json();
}

export async function createScheduledHunt(data: {
  tenantId: string;
  savedQueryId: string;
  name: string;
  description?: string;
  scheduleSpec: string;
  isEnabled: boolean;
  minMatchCountForFinding: number;
  maxRowsToScan: number;
  timeWindowMinutes: number;
  actions?: HuntActionConfigDto;
}): Promise<ScheduledHuntDto> {
  const response = await fetch(`${API_BASE}/api/tenant/hunting/scheduled-hunts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create scheduled hunt');
  return response.json();
}

export async function updateScheduledHunt(
  id: string,
  data: {
    tenantId: string;
    savedQueryId: string;
    name: string;
    description?: string;
    scheduleSpec: string;
    isEnabled: boolean;
    minMatchCountForFinding: number;
    maxRowsToScan: number;
    timeWindowMinutes: number;
    actions?: HuntActionConfigDto;
  }
): Promise<ScheduledHuntDto> {
  const response = await fetch(`${API_BASE}/api/tenant/hunting/scheduled-hunts/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update scheduled hunt');
  return response.json();
}

export async function deleteScheduledHunt(id: string, tenantId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/api/tenant/hunting/scheduled-hunts/${id}?tenantId=${tenantId}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete scheduled hunt');
}

export async function getScheduledHuntRuns(
  id: string,
  tenantId: string,
  params?: {
    status?: string;
    fromDate?: string;
    toDate?: string;
    pageNumber?: number;
    pageSize?: number;
  }
): Promise<PagedResult<HuntRunDto>> {
  const searchParams = new URLSearchParams({ tenantId });
  if (params?.status) searchParams.append('status', params.status);
  if (params?.fromDate) searchParams.append('fromDate', params.fromDate);
  if (params?.toDate) searchParams.append('toDate', params.toDate);
  if (params?.pageNumber) searchParams.append('pageNumber', params.pageNumber.toString());
  if (params?.pageSize) searchParams.append('pageSize', params.pageSize.toString());

  const response = await fetch(`${API_BASE}/api/tenant/hunting/scheduled-hunts/${id}/runs?${searchParams}`);
  if (!response.ok) throw new Error('Failed to fetch scheduled hunt runs');
  return response.json();
}

export async function getHuntRun(runId: string, tenantId: string): Promise<HuntRunDto> {
  const response = await fetch(`${API_BASE}/api/tenant/hunting/hunt-runs/${runId}?tenantId=${tenantId}`);
  if (!response.ok) throw new Error('Failed to fetch hunt run');
  return response.json();
}

// Global API functions

export async function executeGlobalQuery(
  query: OqlQueryDto,
  tenantId?: string
): Promise<HuntResultDto> {
  const response = await fetch(`${API_BASE}/api/global/hunting/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tenantId, query }),
  });
  if (!response.ok) throw new Error('Failed to execute global query');
  return response.json();
}

export async function getGlobalSavedQueries(params?: {
  tenantId?: string;
  dataset?: string;
  isEnabled?: boolean;
  searchTerm?: string;
  pageNumber?: number;
  pageSize?: number;
}): Promise<PagedResult<SavedQueryDto>> {
  const searchParams = new URLSearchParams();
  if (params?.tenantId) searchParams.append('tenantId', params.tenantId);
  if (params?.dataset) searchParams.append('dataset', params.dataset);
  if (params?.isEnabled !== undefined) searchParams.append('isEnabled', params.isEnabled.toString());
  if (params?.searchTerm) searchParams.append('searchTerm', params.searchTerm);
  if (params?.pageNumber) searchParams.append('pageNumber', params.pageNumber.toString());
  if (params?.pageSize) searchParams.append('pageSize', params.pageSize.toString());

  const response = await fetch(`${API_BASE}/api/global/hunting/saved-queries?${searchParams}`);
  if (!response.ok) throw new Error('Failed to fetch global saved queries');
  return response.json();
}

export async function getGlobalSavedQuery(id: string, tenantId?: string): Promise<SavedQueryDto> {
  const searchParams = new URLSearchParams();
  if (tenantId) searchParams.append('tenantId', tenantId);

  const response = await fetch(`${API_BASE}/api/global/hunting/saved-queries/${id}?${searchParams}`);
  if (!response.ok) throw new Error('Failed to fetch global saved query');
  return response.json();
}

export async function createGlobalSavedQuery(data: {
  tenantId?: string;
  name: string;
  description?: string;
  dataset: string;
  queryDslJson: string;
  isGlobalTemplate: boolean;
  isEnabled?: boolean;
}): Promise<SavedQueryDto> {
  const response = await fetch(`${API_BASE}/api/global/hunting/saved-queries`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create global saved query');
  return response.json();
}

export async function updateGlobalSavedQuery(
  id: string,
  data: {
    tenantId?: string;
    name: string;
    description?: string;
    dataset: string;
    queryDslJson: string;
    isGlobalTemplate: boolean;
    isEnabled: boolean;
  }
): Promise<SavedQueryDto> {
  const response = await fetch(`${API_BASE}/api/global/hunting/saved-queries/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update global saved query');
  return response.json();
}

export async function deleteGlobalSavedQuery(id: string, tenantId?: string): Promise<void> {
  const searchParams = new URLSearchParams();
  if (tenantId) searchParams.append('tenantId', tenantId);

  const response = await fetch(`${API_BASE}/api/global/hunting/saved-queries/${id}?${searchParams}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete global saved query');
}

export async function getGlobalScheduledHunts(params?: {
  tenantId?: string;
  scheduleSpec?: string;
  isEnabled?: boolean;
  savedQueryId?: string;
  pageNumber?: number;
  pageSize?: number;
}): Promise<PagedResult<ScheduledHuntDto>> {
  const searchParams = new URLSearchParams();
  if (params?.tenantId) searchParams.append('tenantId', params.tenantId);
  if (params?.scheduleSpec) searchParams.append('scheduleSpec', params.scheduleSpec);
  if (params?.isEnabled !== undefined) searchParams.append('isEnabled', params.isEnabled.toString());
  if (params?.savedQueryId) searchParams.append('savedQueryId', params.savedQueryId);
  if (params?.pageNumber) searchParams.append('pageNumber', params.pageNumber.toString());
  if (params?.pageSize) searchParams.append('pageSize', params.pageSize.toString());

  const response = await fetch(`${API_BASE}/api/global/hunting/scheduled-hunts?${searchParams}`);
  if (!response.ok) throw new Error('Failed to fetch global scheduled hunts');
  return response.json();
}

export async function getGlobalScheduledHunt(id: string, tenantId?: string): Promise<ScheduledHuntDto> {
  const searchParams = new URLSearchParams();
  if (tenantId) searchParams.append('tenantId', tenantId);

  const response = await fetch(`${API_BASE}/api/global/hunting/scheduled-hunts/${id}?${searchParams}`);
  if (!response.ok) throw new Error('Failed to fetch global scheduled hunt');
  return response.json();
}

export async function createGlobalScheduledHunt(data: {
  tenantId?: string;
  savedQueryId: string;
  name: string;
  description?: string;
  scheduleSpec: string;
  isEnabled: boolean;
  minMatchCountForFinding: number;
  maxRowsToScan: number;
  timeWindowMinutes: number;
  actions?: HuntActionConfigDto;
}): Promise<ScheduledHuntDto> {
  const response = await fetch(`${API_BASE}/api/global/hunting/scheduled-hunts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create global scheduled hunt');
  return response.json();
}

export async function updateGlobalScheduledHunt(
  id: string,
  data: {
    tenantId?: string;
    savedQueryId: string;
    name: string;
    description?: string;
    scheduleSpec: string;
    isEnabled: boolean;
    minMatchCountForFinding: number;
    maxRowsToScan: number;
    timeWindowMinutes: number;
    actions?: HuntActionConfigDto;
  }
): Promise<ScheduledHuntDto> {
  const response = await fetch(`${API_BASE}/api/global/hunting/scheduled-hunts/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update global scheduled hunt');
  return response.json();
}

export async function deleteGlobalScheduledHunt(id: string, tenantId?: string): Promise<void> {
  const searchParams = new URLSearchParams();
  if (tenantId) searchParams.append('tenantId', tenantId);

  const response = await fetch(`${API_BASE}/api/global/hunting/scheduled-hunts/${id}?${searchParams}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete global scheduled hunt');
}

export async function getGlobalScheduledHuntRuns(
  id: string,
  params?: {
    tenantId?: string;
    status?: string;
    fromDate?: string;
    toDate?: string;
    pageNumber?: number;
    pageSize?: number;
  }
): Promise<PagedResult<HuntRunDto>> {
  const searchParams = new URLSearchParams();
  if (params?.tenantId) searchParams.append('tenantId', params.tenantId);
  if (params?.status) searchParams.append('status', params.status);
  if (params?.fromDate) searchParams.append('fromDate', params.fromDate);
  if (params?.toDate) searchParams.append('toDate', params.toDate);
  if (params?.pageNumber) searchParams.append('pageNumber', params.pageNumber.toString());
  if (params?.pageSize) searchParams.append('pageSize', params.pageSize.toString());

  const response = await fetch(`${API_BASE}/api/global/hunting/scheduled-hunts/${id}/runs?${searchParams}`);
  if (!response.ok) throw new Error('Failed to fetch global scheduled hunt runs');
  return response.json();
}

export async function getGlobalHuntRun(runId: string, tenantId?: string): Promise<HuntRunDto> {
  const searchParams = new URLSearchParams();
  if (tenantId) searchParams.append('tenantId', tenantId);

  const response = await fetch(`${API_BASE}/api/global/hunting/hunt-runs/${runId}?${searchParams}`);
  if (!response.ok) throw new Error('Failed to fetch global hunt run');
  return response.json();
}

// Constants
export const DATASETS = [
  'SignInLogs',
  'AuditLogs',
  'RiskEvents',
  'UserActivity',
  'ApplicationLogs',
  'PolicyEvents',
  'PrivilegedAccess',
];

export const SCHEDULE_SPECS = [
  { value: '*/15 * * * *', label: 'Every 15 minutes' },
  { value: '0 * * * *', label: 'Every hour' },
  { value: '0 */4 * * *', label: 'Every 4 hours' },
  { value: '0 0 * * *', label: 'Daily at midnight' },
  { value: '0 9 * * *', label: 'Daily at 9 AM' },
  { value: '0 0 * * 1', label: 'Weekly on Monday' },
];

export const HUNT_RUN_STATUSES = [
  'Pending',
  'Running',
  'Completed',
  'Failed',
  'Cancelled',
];
