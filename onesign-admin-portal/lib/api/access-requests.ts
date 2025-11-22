const API_BASE = 'http://localhost:7000';

// Enums
export type AccessRequestStatus = 'Pending' | 'Approved' | 'Rejected' | 'Expired' | 'Cancelled';
export type AccessRequestType = 'ApplicationAccess' | 'RoleAssignment' | 'PrivilegedAccess' | 'ResourceAccess';
export type ApprovalDecision = 'Approved' | 'Rejected';

// DTOs
export interface AccessRequestDto {
  id: string;
  tenantId: string;
  requesterId: string;
  requesterName?: string;
  requesterEmail?: string;
  requestType: AccessRequestType;
  targetResourceId: string;
  targetResourceName?: string;
  targetResourceType: string;
  requestedScopes?: string[];
  justification: string;
  status: AccessRequestStatus;
  createdAt: string;
  expiresAt?: string;
  reviewedAt?: string;
  reviewedByUserId?: string;
  reviewedByUserName?: string;
  reviewComments?: string;
  autoApproved: boolean;
  approvalWorkflowId?: string;
}

export interface CreateAccessRequestDto {
  tenantId: string;
  userId: string;
  requestType: AccessRequestType;
  targetResourceId: string;
  targetResourceType: string;
  requestedScopes?: string[];
  justification: string;
  durationHours?: number;
}

export interface AccessRequestDetailDto extends AccessRequestDto {
  approvalHistory: ApprovalHistoryDto[];
  relatedIncidents?: string[];
  riskScore?: number;
  autoApprovalReason?: string;
}

export interface ApprovalHistoryDto {
  id: string;
  accessRequestId: string;
  approverId: string;
  approverName?: string;
  decision: ApprovalDecision;
  comments?: string;
  decidedAt: string;
  approvalLevel: number;
}

export interface AccessRequestStatsDto {
  totalPending: number;
  totalApproved: number;
  totalRejected: number;
  avgApprovalTimeMinutes: number;
  autoApprovedPercentage: number;
  expiredCount: number;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Tenant API functions

export async function getAccessRequests(
  tenantId: string,
  params?: {
    status?: AccessRequestStatus;
    requestType?: AccessRequestType;
    requesterId?: string;
    approverId?: string;
    fromDate?: string;
    toDate?: string;
    page?: number;
    pageSize?: number;
  }
): Promise<PagedResult<AccessRequestDto>> {
  const searchParams = new URLSearchParams({ tenantId });
  if (params?.status) searchParams.append('status', params.status);
  if (params?.requestType) searchParams.append('requestType', params.requestType);
  if (params?.requesterId) searchParams.append('requesterId', params.requesterId);
  if (params?.approverId) searchParams.append('approverId', params.approverId);
  if (params?.fromDate) searchParams.append('fromDate', params.fromDate);
  if (params?.toDate) searchParams.append('toDate', params.toDate);
  if (params?.page) searchParams.append('page', params.page.toString());
  if (params?.pageSize) searchParams.append('pageSize', params.pageSize.toString());

  const response = await fetch(`${API_BASE}/api/tenant/access-requests?${searchParams}`);
  if (!response.ok) throw new Error('Failed to fetch access requests');
  return response.json();
}

export async function getAccessRequest(
  id: string,
  tenantId: string
): Promise<AccessRequestDetailDto> {
  const response = await fetch(
    `${API_BASE}/api/tenant/access-requests/${id}?tenantId=${tenantId}`
  );
  if (!response.ok) throw new Error('Failed to fetch access request');
  return response.json();
}

export async function createAccessRequest(
  data: CreateAccessRequestDto
): Promise<AccessRequestDto> {
  const response = await fetch(`${API_BASE}/api/tenant/access-requests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create access request');
  return response.json();
}

export async function approveAccessRequest(
  id: string,
  data: {
    tenantId: string;
    userId: string;
    comments?: string;
  }
): Promise<void> {
  const response = await fetch(`${API_BASE}/api/tenant/access-requests/${id}/approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to approve access request');
}

export async function rejectAccessRequest(
  id: string,
  data: {
    tenantId: string;
    userId: string;
    comments: string;
  }
): Promise<void> {
  const response = await fetch(`${API_BASE}/api/tenant/access-requests/${id}/reject`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to reject access request');
}

export async function cancelAccessRequest(
  id: string,
  tenantId: string,
  userId: string
): Promise<void> {
  const response = await fetch(
    `${API_BASE}/api/tenant/access-requests/${id}/cancel?tenantId=${tenantId}&userId=${userId}`,
    { method: 'POST' }
  );
  if (!response.ok) throw new Error('Failed to cancel access request');
}

export async function getAccessRequestStats(tenantId: string): Promise<AccessRequestStatsDto> {
  const response = await fetch(
    `${API_BASE}/api/tenant/access-requests/stats?tenantId=${tenantId}`
  );
  if (!response.ok) throw new Error('Failed to fetch access request stats');
  return response.json();
}

export async function getMyAccessRequests(
  tenantId: string,
  userId: string,
  params?: {
    status?: AccessRequestStatus;
    page?: number;
    pageSize?: number;
  }
): Promise<PagedResult<AccessRequestDto>> {
  const searchParams = new URLSearchParams({ tenantId, userId });
  if (params?.status) searchParams.append('status', params.status);
  if (params?.page) searchParams.append('page', params.page.toString());
  if (params?.pageSize) searchParams.append('pageSize', params.pageSize.toString());

  const response = await fetch(`${API_BASE}/api/tenant/access-requests/my-requests?${searchParams}`);
  if (!response.ok) throw new Error('Failed to fetch my access requests');
  return response.json();
}

export async function getPendingApprovals(
  tenantId: string,
  userId: string,
  params?: {
    page?: number;
    pageSize?: number;
  }
): Promise<PagedResult<AccessRequestDto>> {
  const searchParams = new URLSearchParams({ tenantId, userId });
  if (params?.page) searchParams.append('page', params.page.toString());
  if (params?.pageSize) searchParams.append('pageSize', params.pageSize.toString());

  const response = await fetch(`${API_BASE}/api/tenant/access-requests/pending-approvals?${searchParams}`);
  if (!response.ok) throw new Error('Failed to fetch pending approvals');
  return response.json();
}

// Global API functions

export async function getGlobalAccessRequests(
  params?: {
    tenantId?: string;
    status?: AccessRequestStatus;
    requestType?: AccessRequestType;
    page?: number;
    pageSize?: number;
  }
): Promise<PagedResult<AccessRequestDto>> {
  const searchParams = new URLSearchParams();
  if (params?.tenantId) searchParams.append('tenantId', params.tenantId);
  if (params?.status) searchParams.append('status', params.status);
  if (params?.requestType) searchParams.append('requestType', params.requestType);
  if (params?.page) searchParams.append('page', params.page.toString());
  if (params?.pageSize) searchParams.append('pageSize', params.pageSize.toString());

  const response = await fetch(`${API_BASE}/api/global/access-requests?${searchParams}`);
  if (!response.ok) throw new Error('Failed to fetch global access requests');
  return response.json();
}

export async function getGlobalAccessRequestStats(): Promise<{
  byTenant: Array<{ tenantId: string; tenantName: string; stats: AccessRequestStatsDto }>;
  overall: AccessRequestStatsDto;
}> {
  const response = await fetch(`${API_BASE}/api/global/access-requests/stats`);
  if (!response.ok) throw new Error('Failed to fetch global access request stats');
  return response.json();
}

// Constants
export const ACCESS_REQUEST_STATUSES: AccessRequestStatus[] = [
  'Pending',
  'Approved',
  'Rejected',
  'Expired',
  'Cancelled',
];

export const ACCESS_REQUEST_TYPES: AccessRequestType[] = [
  'ApplicationAccess',
  'RoleAssignment',
  'PrivilegedAccess',
  'ResourceAccess',
];

export const RESOURCE_TYPES = [
  'Application',
  'Role',
  'Group',
  'Resource',
  'Data',
];

// Helper functions

export function getStatusColor(status: AccessRequestStatus): string {
  switch (status) {
    case 'Pending':
      return 'yellow';
    case 'Approved':
      return 'green';
    case 'Rejected':
      return 'red';
    case 'Expired':
      return 'gray';
    case 'Cancelled':
      return 'gray';
    default:
      return 'gray';
  }
}

export function getRequestTypeLabel(type: AccessRequestType): string {
  switch (type) {
    case 'ApplicationAccess':
      return 'Application Access';
    case 'RoleAssignment':
      return 'Role Assignment';
    case 'PrivilegedAccess':
      return 'Privileged Access';
    case 'ResourceAccess':
      return 'Resource Access';
    default:
      return type;
  }
}

export function calculateTimeRemaining(expiresAt?: string): string {
  if (!expiresAt) return 'No expiration';

  const now = new Date();
  const expiry = new Date(expiresAt);
  const diffMs = expiry.getTime() - now.getTime();

  if (diffMs <= 0) return 'Expired';

  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} remaining`;
  if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} remaining`;

  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} remaining`;
}
