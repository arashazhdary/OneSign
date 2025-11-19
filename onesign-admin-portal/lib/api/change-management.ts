const API_BASE = 'http://localhost:7000';

// Enums
export type ChangeSetStatus = 'Draft' | 'PendingApproval' | 'Approved' | 'Rejected' | 'Scheduled' | 'Applied' | 'RolledBack' | 'Failed';
export type ChangeCategory = 'Policy' | 'Configuration' | 'User' | 'Application' | 'Federation' | 'Security' | 'Other';

// DTOs
export interface ChangeSetDto {
  id: string;
  scopeType: string;
  scopeId: string;
  title: string;
  description?: string;
  category: string;
  status: ChangeSetStatus;
  createdAt: string;
  createdByUserId: string;
  createdByUserName?: string;
  itemCount: number;
  approvalCount: number;
  requiredApprovals: number;
}

export interface ChangeSetDetailDto {
  id: string;
  scopeType: string;
  scopeId: string;
  title: string;
  description?: string;
  category: string;
  status: ChangeSetStatus;
  createdAt: string;
  createdByUserId: string;
  createdByUserName?: string;
  updatedAt?: string;
  updatedByUserId?: string;
  submittedAt?: string;
  approvedAt?: string;
  scheduledFor?: string;
  appliedAt?: string;
  rolledBackAt?: string;
  items: ChangeItemDto[];
  approvals: ChangeApprovalDto[];
  simulationResult?: SimulationResultDto;
}

export interface ChangeItemDto {
  id: string;
  entityType: string;
  entityId: string;
  entityName?: string;
  changeType: string;
  beforeJson?: string;
  afterJson?: string;
  order: number;
}

export interface CreateChangeItemDto {
  entityType: string;
  entityId: string;
  entityName?: string;
  changeType: string;
  beforeJson?: string;
  afterJson?: string;
  order: number;
}

export interface ChangeApprovalDto {
  id: string;
  changeSetId: string;
  userId: string;
  userName?: string;
  decision: string;
  reason?: string;
  decidedAt: string;
}

export interface SimulationResultDto {
  success: boolean;
  warnings: string[];
  errors: string[];
  affectedEntities: AffectedEntityDto[];
  estimatedImpact: string;
}

export interface AffectedEntityDto {
  entityType: string;
  entityId: string;
  entityName: string;
  impactType: string;
  details: string;
}

export interface ChangeExecutionLogDto {
  id: string;
  changeSetId: string;
  changeItemId: string;
  executedAt: string;
  status: string;
  errorMessage?: string;
  durationMs: number;
  rollbackData?: string;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

// Tenant API functions

export async function getChangeSets(
  tenantId: string,
  params?: {
    status?: string;
    category?: string;
    page?: number;
    pageSize?: number;
  }
): Promise<PagedResult<ChangeSetDto>> {
  const searchParams = new URLSearchParams({ tenantId });
  if (params?.status) searchParams.append('status', params.status);
  if (params?.category) searchParams.append('category', params.category);
  if (params?.page) searchParams.append('page', params.page.toString());
  if (params?.pageSize) searchParams.append('pageSize', params.pageSize.toString());

  const response = await fetch(`${API_BASE}/api/tenant/change-sets?${searchParams}`);
  if (!response.ok) throw new Error('Failed to fetch change sets');
  return response.json();
}

export async function getChangeSet(id: string, tenantId: string): Promise<ChangeSetDetailDto> {
  const response = await fetch(`${API_BASE}/api/tenant/change-sets/${id}?tenantId=${tenantId}`);
  if (!response.ok) throw new Error('Failed to fetch change set');
  return response.json();
}

export async function createChangeSet(data: {
  tenantId: string;
  userId: string;
  title: string;
  description?: string;
  category: string;
  items: CreateChangeItemDto[];
}): Promise<ChangeSetDetailDto> {
  const response = await fetch(`${API_BASE}/api/tenant/change-sets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create change set');
  return response.json();
}

export async function updateChangeSet(
  id: string,
  data: {
    tenantId: string;
    userId: string;
    title: string;
    description?: string;
    category: string;
    items: CreateChangeItemDto[];
  }
): Promise<ChangeSetDetailDto> {
  const response = await fetch(`${API_BASE}/api/tenant/change-sets/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update change set');
  return response.json();
}

export async function submitChangeSet(id: string, tenantId: string, userId: string): Promise<void> {
  const response = await fetch(
    `${API_BASE}/api/tenant/change-sets/${id}/submit?tenantId=${tenantId}&userId=${userId}`,
    { method: 'POST' }
  );
  if (!response.ok) throw new Error('Failed to submit change set');
}

export async function simulateChangeSet(
  id: string,
  tenantId: string,
  userId: string
): Promise<SimulationResultDto> {
  const response = await fetch(
    `${API_BASE}/api/tenant/change-sets/${id}/simulate?tenantId=${tenantId}&userId=${userId}`,
    { method: 'POST' }
  );
  if (!response.ok) throw new Error('Failed to simulate change set');
  return response.json();
}

export async function approveChangeSet(
  id: string,
  data: {
    tenantId: string;
    userId: string;
    reason?: string;
  }
): Promise<void> {
  const response = await fetch(`${API_BASE}/api/tenant/change-sets/${id}/approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to approve change set');
}

export async function rejectChangeSet(
  id: string,
  data: {
    tenantId: string;
    userId: string;
    reason: string;
  }
): Promise<void> {
  const response = await fetch(`${API_BASE}/api/tenant/change-sets/${id}/reject`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to reject change set');
}

export async function scheduleChangeSet(
  id: string,
  data: {
    tenantId: string;
    userId: string;
    scheduledFor: string;
  }
): Promise<void> {
  const response = await fetch(`${API_BASE}/api/tenant/change-sets/${id}/schedule`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to schedule change set');
}

export async function applyChangeSet(id: string, tenantId: string, userId: string): Promise<void> {
  const response = await fetch(
    `${API_BASE}/api/tenant/change-sets/${id}/apply?tenantId=${tenantId}&userId=${userId}`,
    { method: 'POST' }
  );
  if (!response.ok) throw new Error('Failed to apply change set');
}

export async function rollbackChangeSet(
  id: string,
  data: {
    tenantId: string;
    userId: string;
    reason: string;
  }
): Promise<void> {
  const response = await fetch(`${API_BASE}/api/tenant/change-sets/${id}/rollback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to rollback change set');
}

export async function getExecutionLog(id: string, tenantId: string): Promise<ChangeExecutionLogDto[]> {
  const response = await fetch(
    `${API_BASE}/api/tenant/change-sets/${id}/execution-log?tenantId=${tenantId}`
  );
  if (!response.ok) throw new Error('Failed to fetch execution log');
  return response.json();
}

// Global API functions

export async function getGlobalChangeSets(params?: {
  status?: string;
  category?: string;
  page?: number;
  pageSize?: number;
}): Promise<PagedResult<ChangeSetDto>> {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.append('status', params.status);
  if (params?.category) searchParams.append('category', params.category);
  if (params?.page) searchParams.append('page', params.page.toString());
  if (params?.pageSize) searchParams.append('pageSize', params.pageSize.toString());

  const response = await fetch(`${API_BASE}/api/global/change-sets?${searchParams}`);
  if (!response.ok) throw new Error('Failed to fetch global change sets');
  return response.json();
}

export async function getGlobalChangeSet(id: string): Promise<ChangeSetDetailDto> {
  const response = await fetch(`${API_BASE}/api/global/change-sets/${id}`);
  if (!response.ok) throw new Error('Failed to fetch global change set');
  return response.json();
}

export async function createGlobalChangeSet(data: {
  userId: string;
  title: string;
  description?: string;
  category: string;
  items: CreateChangeItemDto[];
}): Promise<ChangeSetDetailDto> {
  const response = await fetch(`${API_BASE}/api/global/change-sets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create global change set');
  return response.json();
}

export async function updateGlobalChangeSet(
  id: string,
  data: {
    userId: string;
    title: string;
    description?: string;
    category: string;
    items: CreateChangeItemDto[];
  }
): Promise<ChangeSetDetailDto> {
  const response = await fetch(`${API_BASE}/api/global/change-sets/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update global change set');
  return response.json();
}

export async function submitGlobalChangeSet(id: string, userId: string): Promise<void> {
  const response = await fetch(
    `${API_BASE}/api/global/change-sets/${id}/submit?userId=${userId}`,
    { method: 'POST' }
  );
  if (!response.ok) throw new Error('Failed to submit global change set');
}

export async function simulateGlobalChangeSet(id: string, userId: string): Promise<SimulationResultDto> {
  const response = await fetch(
    `${API_BASE}/api/global/change-sets/${id}/simulate?userId=${userId}`,
    { method: 'POST' }
  );
  if (!response.ok) throw new Error('Failed to simulate global change set');
  return response.json();
}

export async function approveGlobalChangeSet(
  id: string,
  data: {
    userId: string;
    reason?: string;
  }
): Promise<void> {
  const response = await fetch(`${API_BASE}/api/global/change-sets/${id}/approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to approve global change set');
}

export async function rejectGlobalChangeSet(
  id: string,
  data: {
    userId: string;
    reason: string;
  }
): Promise<void> {
  const response = await fetch(`${API_BASE}/api/global/change-sets/${id}/reject`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to reject global change set');
}

export async function scheduleGlobalChangeSet(
  id: string,
  data: {
    userId: string;
    scheduledFor: string;
  }
): Promise<void> {
  const response = await fetch(`${API_BASE}/api/global/change-sets/${id}/schedule`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to schedule global change set');
}

export async function applyGlobalChangeSet(id: string, userId: string): Promise<void> {
  const response = await fetch(
    `${API_BASE}/api/global/change-sets/${id}/apply?userId=${userId}`,
    { method: 'POST' }
  );
  if (!response.ok) throw new Error('Failed to apply global change set');
}

export async function rollbackGlobalChangeSet(
  id: string,
  data: {
    userId: string;
    reason: string;
  }
): Promise<void> {
  const response = await fetch(`${API_BASE}/api/global/change-sets/${id}/rollback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to rollback global change set');
}

export async function getGlobalExecutionLog(id: string): Promise<ChangeExecutionLogDto[]> {
  const response = await fetch(`${API_BASE}/api/global/change-sets/${id}/execution-log`);
  if (!response.ok) throw new Error('Failed to fetch global execution log');
  return response.json();
}

// Constants
export const CHANGE_SET_STATUSES: ChangeSetStatus[] = [
  'Draft',
  'PendingApproval',
  'Approved',
  'Rejected',
  'Scheduled',
  'Applied',
  'RolledBack',
  'Failed',
];

export const CHANGE_CATEGORIES: ChangeCategory[] = [
  'Policy',
  'Configuration',
  'User',
  'Application',
  'Federation',
  'Security',
  'Other',
];

export const CHANGE_TYPES = [
  'Create',
  'Update',
  'Delete',
  'Enable',
  'Disable',
];

export const ENTITY_TYPES = [
  'User',
  'Application',
  'Policy',
  'Role',
  'Group',
  'Federation',
  'Tenant',
];
