import { API_BASE } from './config/api-config';

// Enums
export type LifecycleEventType = 'Joiner' | 'Mover' | 'Leaver' | 'Rehire' | 'ManagerChange' | 'DepartmentChange';
export type LifecycleStatus = 'Detected' | 'Pending' | 'InProgress' | 'Completed' | 'Failed' | 'Cancelled';
export type WorkflowActionType = 'GrantAccess' | 'RevokeAccess' | 'TransferOwnership' | 'SendNotification' | 'CreateTicket' | 'ApprovalRequired';

// DTOs
export interface LifecycleEventDto {
  id: string;
  tenantId: string;
  eventType: LifecycleEventType;
  userId: string;
  userEmail: string;
  userDisplayName?: string;
  status: LifecycleStatus;
  detectedAt: string;
  detectedBy: string; // System, Integration, Manual
  startedAt?: string;
  completedAt?: string;
  metadata: Record<string, any>;
  workflowId?: string;
  workflowName?: string;
}

export interface LifecycleEventDetailDto extends LifecycleEventDto {
  actions: LifecycleActionDto[];
  affectedResources: AffectedResourceDto[];
  timeline: TimelineEntryDto[];
  detectionCriteria?: string;
}

export interface LifecycleActionDto {
  id: string;
  lifecycleEventId: string;
  actionType: WorkflowActionType;
  actionName: string;
  status: LifecycleStatus;
  executedAt?: string;
  completedAt?: string;
  result?: string;
  errorMessage?: string;
  order: number;
}

export interface AffectedResourceDto {
  resourceType: string; // Application, Role, Group, etc.
  resourceId: string;
  resourceName: string;
  action: string; // Grant, Revoke, Transfer
  status: string;
}

export interface TimelineEntryDto {
  timestamp: string;
  eventType: string;
  description: string;
  performedBy: string;
  metadata?: Record<string, any>;
}

export interface LifecycleWorkflowDto {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  eventType: LifecycleEventType;
  isEnabled: boolean;
  priority: number;
  triggerConditions: TriggerConditionDto[];
  actions: WorkflowActionConfigDto[];
  requiresApproval: boolean;
  approverUserIds?: string[];
  approverRoleIds?: string[];
  notificationRecipients?: string[];
  createdAt: string;
  createdByUserId: string;
  updatedAt?: string;
  executionCount: number;
}

export interface TriggerConditionDto {
  id: string;
  conditionType: string;
  field: string;
  operator: string; // Equals, Contains, StartsWith, etc.
  value: string;
  order: number;
}

export interface WorkflowActionConfigDto {
  id: string;
  actionType: WorkflowActionType;
  actionName: string;
  configuration: Record<string, any>;
  order: number;
  continueOnFailure: boolean;
}

export interface CreateLifecycleWorkflowDto {
  tenantId: string;
  userId: string;
  name: string;
  description?: string;
  eventType: LifecycleEventType;
  isEnabled: boolean;
  priority: number;
  triggerConditions: Omit<TriggerConditionDto, 'id'>[];
  actions: Omit<WorkflowActionConfigDto, 'id'>[];
  requiresApproval: boolean;
  approverUserIds?: string[];
  approverRoleIds?: string[];
  notificationRecipients?: string[];
}

export interface LifecycleStatsDto {
  totalEvents: number;
  eventsByType: Array<{
    eventType: LifecycleEventType;
    count: number;
  }>;
  eventsByStatus: Array<{
    status: LifecycleStatus;
    count: number;
  }>;
  avgCompletionTimeMinutes: number;
  successRate: number;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Tenant API functions

export async function getLifecycleEvents(
  tenantId: string,
  params?: {
    eventType?: LifecycleEventType;
    status?: LifecycleStatus;
    userId?: string;
    fromDate?: string;
    toDate?: string;
    page?: number;
    pageSize?: number;
  }
): Promise<PagedResult<LifecycleEventDto>> {
  const searchParams = new URLSearchParams({ tenantId });
  if (params?.eventType) searchParams.append('eventType', params.eventType);
  if (params?.status) searchParams.append('status', params.status);
  if (params?.userId) searchParams.append('userId', params.userId);
  if (params?.fromDate) searchParams.append('fromDate', params.fromDate);
  if (params?.toDate) searchParams.append('toDate', params.toDate);
  if (params?.page) searchParams.append('page', params.page.toString());
  if (params?.pageSize) searchParams.append('pageSize', params.pageSize.toString());

  const response = await fetch(`${API_BASE}/api/tenant/lifecycle/events?${searchParams}`);
  if (!response.ok) throw new Error('Failed to fetch lifecycle events');
  return response.json();
}

export async function getLifecycleEvent(
  id: string,
  tenantId: string
): Promise<LifecycleEventDetailDto> {
  const response = await fetch(
    `${API_BASE}/api/tenant/lifecycle/events/${id}?tenantId=${tenantId}`
  );
  if (!response.ok) throw new Error('Failed to fetch lifecycle event');
  return response.json();
}

export async function createLifecycleEvent(data: {
  tenantId: string;
  userId: string;
  eventType: LifecycleEventType;
  targetUserId: string;
  metadata?: Record<string, any>;
}): Promise<LifecycleEventDto> {
  const response = await fetch(`${API_BASE}/api/tenant/lifecycle/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create lifecycle event');
  return response.json();
}

export async function executeLifecycleEvent(
  id: string,
  tenantId: string,
  userId: string
): Promise<void> {
  const response = await fetch(
    `${API_BASE}/api/tenant/lifecycle/events/${id}/execute?tenantId=${tenantId}&userId=${userId}`,
    { method: 'POST' }
  );
  if (!response.ok) throw new Error('Failed to execute lifecycle event');
}

export async function cancelLifecycleEvent(
  id: string,
  tenantId: string,
  userId: string,
  reason: string
): Promise<void> {
  const response = await fetch(
    `${API_BASE}/api/tenant/lifecycle/events/${id}/cancel`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenantId, userId, reason }),
    }
  );
  if (!response.ok) throw new Error('Failed to cancel lifecycle event');
}

export async function getLifecycleWorkflows(
  tenantId: string,
  params?: {
    eventType?: LifecycleEventType;
    isEnabled?: boolean;
    page?: number;
    pageSize?: number;
  }
): Promise<PagedResult<LifecycleWorkflowDto>> {
  const searchParams = new URLSearchParams({ tenantId });
  if (params?.eventType) searchParams.append('eventType', params.eventType);
  if (params?.isEnabled !== undefined) searchParams.append('isEnabled', params.isEnabled.toString());
  if (params?.page) searchParams.append('page', params.page.toString());
  if (params?.pageSize) searchParams.append('pageSize', params.pageSize.toString());

  const response = await fetch(`${API_BASE}/api/tenant/lifecycle/workflows?${searchParams}`);
  if (!response.ok) throw new Error('Failed to fetch lifecycle workflows');
  return response.json();
}

export async function getLifecycleWorkflow(
  id: string,
  tenantId: string
): Promise<LifecycleWorkflowDto> {
  const response = await fetch(
    `${API_BASE}/api/tenant/lifecycle/workflows/${id}?tenantId=${tenantId}`
  );
  if (!response.ok) throw new Error('Failed to fetch lifecycle workflow');
  return response.json();
}

export async function createLifecycleWorkflow(
  data: CreateLifecycleWorkflowDto
): Promise<LifecycleWorkflowDto> {
  const response = await fetch(`${API_BASE}/api/tenant/lifecycle/workflows`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create lifecycle workflow');
  return response.json();
}

export async function updateLifecycleWorkflow(
  id: string,
  data: CreateLifecycleWorkflowDto
): Promise<LifecycleWorkflowDto> {
  const response = await fetch(`${API_BASE}/api/tenant/lifecycle/workflows/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update lifecycle workflow');
  return response.json();
}

export async function deleteLifecycleWorkflow(
  id: string,
  tenantId: string,
  userId: string
): Promise<void> {
  const response = await fetch(
    `${API_BASE}/api/tenant/lifecycle/workflows/${id}?tenantId=${tenantId}&userId=${userId}`,
    { method: 'DELETE' }
  );
  if (!response.ok) throw new Error('Failed to delete lifecycle workflow');
}

export async function enableLifecycleWorkflow(
  id: string,
  tenantId: string,
  userId: string
): Promise<void> {
  const response = await fetch(
    `${API_BASE}/api/tenant/lifecycle/workflows/${id}/enable?tenantId=${tenantId}&userId=${userId}`,
    { method: 'POST' }
  );
  if (!response.ok) throw new Error('Failed to enable lifecycle workflow');
}

export async function disableLifecycleWorkflow(
  id: string,
  tenantId: string,
  userId: string
): Promise<void> {
  const response = await fetch(
    `${API_BASE}/api/tenant/lifecycle/workflows/${id}/disable?tenantId=${tenantId}&userId=${userId}`,
    { method: 'POST' }
  );
  if (!response.ok) throw new Error('Failed to disable lifecycle workflow');
}

export async function getLifecycleStats(tenantId: string, params?: {
  fromDate?: string;
  toDate?: string;
}): Promise<LifecycleStatsDto> {
  const searchParams = new URLSearchParams({ tenantId });
  if (params?.fromDate) searchParams.append('fromDate', params.fromDate);
  if (params?.toDate) searchParams.append('toDate', params.toDate);

  const response = await fetch(`${API_BASE}/api/tenant/lifecycle/stats?${searchParams}`);
  if (!response.ok) throw new Error('Failed to fetch lifecycle stats');
  return response.json();
}

// Global API functions

export async function getGlobalLifecycleEvents(
  params?: {
    tenantId?: string;
    eventType?: LifecycleEventType;
    status?: LifecycleStatus;
    page?: number;
    pageSize?: number;
  }
): Promise<PagedResult<LifecycleEventDto>> {
  const searchParams = new URLSearchParams();
  if (params?.tenantId) searchParams.append('tenantId', params.tenantId);
  if (params?.eventType) searchParams.append('eventType', params.eventType);
  if (params?.status) searchParams.append('status', params.status);
  if (params?.page) searchParams.append('page', params.page.toString());
  if (params?.pageSize) searchParams.append('pageSize', params.pageSize.toString());

  const response = await fetch(`${API_BASE}/api/global/lifecycle/events?${searchParams}`);
  if (!response.ok) throw new Error('Failed to fetch global lifecycle events');
  return response.json();
}

export async function getGlobalLifecycleStats(): Promise<{
  byTenant: Array<{ tenantId: string; tenantName: string; stats: LifecycleStatsDto }>;
  overall: LifecycleStatsDto;
}> {
  const response = await fetch(`${API_BASE}/api/global/lifecycle/stats`);
  if (!response.ok) throw new Error('Failed to fetch global lifecycle stats');
  return response.json();
}

// Constants
export const LIFECYCLE_EVENT_TYPES: LifecycleEventType[] = [
  'Joiner',
  'Mover',
  'Leaver',
  'Rehire',
  'ManagerChange',
  'DepartmentChange',
];

export const LIFECYCLE_STATUSES: LifecycleStatus[] = [
  'Detected',
  'Pending',
  'InProgress',
  'Completed',
  'Failed',
  'Cancelled',
];

export const WORKFLOW_ACTION_TYPES: WorkflowActionType[] = [
  'GrantAccess',
  'RevokeAccess',
  'TransferOwnership',
  'SendNotification',
  'CreateTicket',
  'ApprovalRequired',
];

// Helper functions

export function getEventTypeLabel(eventType: LifecycleEventType): string {
  const labels: Record<LifecycleEventType, string> = {
    Joiner: 'New Joiner',
    Mover: 'Role Change',
    Leaver: 'Leaver',
    Rehire: 'Rehire',
    ManagerChange: 'Manager Change',
    DepartmentChange: 'Department Change',
  };
  return labels[eventType];
}

export function getStatusColor(status: LifecycleStatus): string {
  switch (status) {
    case 'Detected':
      return 'blue';
    case 'Pending':
      return 'yellow';
    case 'InProgress':
      return 'blue';
    case 'Completed':
      return 'green';
    case 'Failed':
      return 'red';
    case 'Cancelled':
      return 'gray';
    default:
      return 'gray';
  }
}
