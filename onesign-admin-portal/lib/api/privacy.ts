const API_BASE = 'http://localhost:7000';

// Enums
export type DataSubjectRequestType = 'Access' | 'Export' | 'Delete' | 'Rectify' | 'Restrict' | 'Object' | 'Portability';
export type RequestStatus = 'Submitted' | 'UnderReview' | 'InProgress' | 'Completed' | 'Rejected' | 'Cancelled';
export type DataClassification = 'Public' | 'Internal' | 'Confidential' | 'Sensitive' | 'PII';
export type ConsentPurpose = 'Marketing' | 'Analytics' | 'Personalization' | 'ThirdPartySharing' | 'Research';
export type ConsentStatus = 'Granted' | 'Denied' | 'Withdrawn' | 'Expired';

// DTOs
export interface DataSubjectRequestDto {
  id: string;
  tenantId: string;
  requestType: DataSubjectRequestType;
  requesterId: string;
  requesterEmail: string;
  requesterName?: string;
  status: RequestStatus;
  submittedAt: string;
  completedAt?: string;
  reviewedByUserId?: string;
  reviewerComments?: string;
  deadlineAt: string; // Legal requirement deadline
  metadata?: Record<string, any>;
}

export interface DataSubjectRequestDetailDto extends DataSubjectRequestDto {
  affectedData: AffectedDataDto[];
  processingHistory: ProcessingHistoryDto[];
  exportedDataUrl?: string;
}

export interface AffectedDataDto {
  dataType: string;
  dataClassification: DataClassification;
  location: string;
  recordCount: number;
  action: string; // Export, Delete, Anonymize
  processedAt?: string;
  status: string;
}

export interface ProcessingHistoryDto {
  timestamp: string;
  action: string;
  performedBy: string;
  details?: string;
}

export interface CreateDataSubjectRequestDto {
  tenantId: string;
  requestType: DataSubjectRequestType;
  requesterId: string;
  requesterEmail: string;
  requesterName?: string;
  metadata?: Record<string, any>;
}

export interface ConsentDto {
  id: string;
  tenantId: string;
  userId: string;
  userEmail: string;
  purpose: ConsentPurpose;
  status: ConsentStatus;
  grantedAt?: string;
  withdrawnAt?: string;
  expiresAt?: string;
  consentText: string;
  consentVersion: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface UpdateConsentDto {
  tenantId: string;
  userId: string;
  purpose: ConsentPurpose;
  status: ConsentStatus;
  ipAddress?: string;
  userAgent?: string;
}

export interface DataRetentionPolicyDto {
  id: string;
  tenantId?: string; // null for global policies
  name: string;
  description?: string;
  dataType: string;
  retentionPeriodDays: number;
  autoDeleteEnabled: boolean;
  legalBasis: string;
  isActive: boolean;
  isGlobalPolicy: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateDataRetentionPolicyDto {
  tenantId?: string;
  userId: string;
  name: string;
  description?: string;
  dataType: string;
  retentionPeriodDays: number;
  autoDeleteEnabled: boolean;
  legalBasis: string;
  isActive: boolean;
}

export interface DataAuditLogDto {
  id: string;
  tenantId: string;
  userId?: string;
  dataType: string;
  dataClassification: DataClassification;
  action: string; // Access, Export, Modify, Delete
  purpose?: string;
  legalBasis?: string;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}

export interface PrivacyStatsDto {
  totalDataSubjectRequests: number;
  pendingRequests: number;
  completedRequests: number;
  avgProcessingTimeDays: number;
  requestsByType: Array<{
    requestType: DataSubjectRequestType;
    count: number;
  }>;
  consentsByPurpose: Array<{
    purpose: ConsentPurpose;
    granted: number;
    denied: number;
    withdrawn: number;
  }>;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Tenant API functions

export async function getDataSubjectRequests(
  tenantId: string,
  params?: {
    requestType?: DataSubjectRequestType;
    status?: RequestStatus;
    requesterId?: string;
    fromDate?: string;
    toDate?: string;
    page?: number;
    pageSize?: number;
  }
): Promise<PagedResult<DataSubjectRequestDto>> {
  const searchParams = new URLSearchParams({ tenantId });
  if (params?.requestType) searchParams.append('requestType', params.requestType);
  if (params?.status) searchParams.append('status', params.status);
  if (params?.requesterId) searchParams.append('requesterId', params.requesterId);
  if (params?.fromDate) searchParams.append('fromDate', params.fromDate);
  if (params?.toDate) searchParams.append('toDate', params.toDate);
  if (params?.page) searchParams.append('page', params.page.toString());
  if (params?.pageSize) searchParams.append('pageSize', params.pageSize.toString());

  const response = await fetch(`${API_BASE}/api/tenant/privacy/data-subject-requests?${searchParams}`);
  if (!response.ok) throw new Error('Failed to fetch data subject requests');
  return response.json();
}

export async function getDataSubjectRequest(
  id: string,
  tenantId: string
): Promise<DataSubjectRequestDetailDto> {
  const response = await fetch(
    `${API_BASE}/api/tenant/privacy/data-subject-requests/${id}?tenantId=${tenantId}`
  );
  if (!response.ok) throw new Error('Failed to fetch data subject request');
  return response.json();
}

export async function createDataSubjectRequest(
  data: CreateDataSubjectRequestDto
): Promise<DataSubjectRequestDto> {
  const response = await fetch(`${API_BASE}/api/tenant/privacy/data-subject-requests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create data subject request');
  return response.json();
}

export async function processDataSubjectRequest(
  id: string,
  tenantId: string,
  userId: string
): Promise<void> {
  const response = await fetch(
    `${API_BASE}/api/tenant/privacy/data-subject-requests/${id}/process?tenantId=${tenantId}&userId=${userId}`,
    { method: 'POST' }
  );
  if (!response.ok) throw new Error('Failed to process data subject request');
}

export async function completeDataSubjectRequest(
  id: string,
  data: {
    tenantId: string;
    userId: string;
    comments?: string;
  }
): Promise<void> {
  const response = await fetch(
    `${API_BASE}/api/tenant/privacy/data-subject-requests/${id}/complete`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }
  );
  if (!response.ok) throw new Error('Failed to complete data subject request');
}

export async function rejectDataSubjectRequest(
  id: string,
  data: {
    tenantId: string;
    userId: string;
    reason: string;
  }
): Promise<void> {
  const response = await fetch(
    `${API_BASE}/api/tenant/privacy/data-subject-requests/${id}/reject`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }
  );
  if (!response.ok) throw new Error('Failed to reject data subject request');
}

export async function getConsents(
  tenantId: string,
  params?: {
    userId?: string;
    purpose?: ConsentPurpose;
    status?: ConsentStatus;
    page?: number;
    pageSize?: number;
  }
): Promise<PagedResult<ConsentDto>> {
  const searchParams = new URLSearchParams({ tenantId });
  if (params?.userId) searchParams.append('userId', params.userId);
  if (params?.purpose) searchParams.append('purpose', params.purpose);
  if (params?.status) searchParams.append('status', params.status);
  if (params?.page) searchParams.append('page', params.page.toString());
  if (params?.pageSize) searchParams.append('pageSize', params.pageSize.toString());

  const response = await fetch(`${API_BASE}/api/tenant/privacy/consents?${searchParams}`);
  if (!response.ok) throw new Error('Failed to fetch consents');
  return response.json();
}

export async function updateConsent(
  data: UpdateConsentDto
): Promise<ConsentDto> {
  const response = await fetch(`${API_BASE}/api/tenant/privacy/consents`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update consent');
  return response.json();
}

export async function getUserConsents(
  userId: string,
  tenantId: string
): Promise<ConsentDto[]> {
  const response = await fetch(
    `${API_BASE}/api/tenant/privacy/consents/user/${userId}?tenantId=${tenantId}`
  );
  if (!response.ok) throw new Error('Failed to fetch user consents');
  return response.json();
}

export async function getDataRetentionPolicies(
  tenantId: string
): Promise<DataRetentionPolicyDto[]> {
  const response = await fetch(
    `${API_BASE}/api/tenant/privacy/retention-policies?tenantId=${tenantId}`
  );
  if (!response.ok) throw new Error('Failed to fetch data retention policies');
  return response.json();
}

export async function createDataRetentionPolicy(
  data: CreateDataRetentionPolicyDto
): Promise<DataRetentionPolicyDto> {
  const response = await fetch(`${API_BASE}/api/tenant/privacy/retention-policies`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create data retention policy');
  return response.json();
}

export async function updateDataRetentionPolicy(
  id: string,
  data: CreateDataRetentionPolicyDto
): Promise<DataRetentionPolicyDto> {
  const response = await fetch(`${API_BASE}/api/tenant/privacy/retention-policies/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update data retention policy');
  return response.json();
}

export async function deleteDataRetentionPolicy(
  id: string,
  tenantId: string,
  userId: string
): Promise<void> {
  const response = await fetch(
    `${API_BASE}/api/tenant/privacy/retention-policies/${id}?tenantId=${tenantId}&userId=${userId}`,
    { method: 'DELETE' }
  );
  if (!response.ok) throw new Error('Failed to delete data retention policy');
}

export async function getDataAuditLogs(
  tenantId: string,
  params?: {
    userId?: string;
    dataType?: string;
    action?: string;
    fromDate?: string;
    toDate?: string;
    page?: number;
    pageSize?: number;
  }
): Promise<PagedResult<DataAuditLogDto>> {
  const searchParams = new URLSearchParams({ tenantId });
  if (params?.userId) searchParams.append('userId', params.userId);
  if (params?.dataType) searchParams.append('dataType', params.dataType);
  if (params?.action) searchParams.append('action', params.action);
  if (params?.fromDate) searchParams.append('fromDate', params.fromDate);
  if (params?.toDate) searchParams.append('toDate', params.toDate);
  if (params?.page) searchParams.append('page', params.page.toString());
  if (params?.pageSize) searchParams.append('pageSize', params.pageSize.toString());

  const response = await fetch(`${API_BASE}/api/tenant/privacy/audit-logs?${searchParams}`);
  if (!response.ok) throw new Error('Failed to fetch data audit logs');
  return response.json();
}

export async function getPrivacyStats(
  tenantId: string,
  params?: {
    fromDate?: string;
    toDate?: string;
  }
): Promise<PrivacyStatsDto> {
  const searchParams = new URLSearchParams({ tenantId });
  if (params?.fromDate) searchParams.append('fromDate', params.fromDate);
  if (params?.toDate) searchParams.append('toDate', params.toDate);

  const response = await fetch(`${API_BASE}/api/tenant/privacy/stats?${searchParams}`);
  if (!response.ok) throw new Error('Failed to fetch privacy stats');
  return response.json();
}

// Global API functions

export async function getGlobalDataSubjectRequests(
  params?: {
    tenantId?: string;
    requestType?: DataSubjectRequestType;
    status?: RequestStatus;
    page?: number;
    pageSize?: number;
  }
): Promise<PagedResult<DataSubjectRequestDto>> {
  const searchParams = new URLSearchParams();
  if (params?.tenantId) searchParams.append('tenantId', params.tenantId);
  if (params?.requestType) searchParams.append('requestType', params.requestType);
  if (params?.status) searchParams.append('status', params.status);
  if (params?.page) searchParams.append('page', params.page.toString());
  if (params?.pageSize) searchParams.append('pageSize', params.pageSize.toString());

  const response = await fetch(`${API_BASE}/api/global/privacy/data-subject-requests?${searchParams}`);
  if (!response.ok) throw new Error('Failed to fetch global data subject requests');
  return response.json();
}

export async function getGlobalPrivacyStats(): Promise<{
  byTenant: Array<{ tenantId: string; tenantName: string; stats: PrivacyStatsDto }>;
  overall: PrivacyStatsDto;
}> {
  const response = await fetch(`${API_BASE}/api/global/privacy/stats`);
  if (!response.ok) throw new Error('Failed to fetch global privacy stats');
  return response.json();
}

export async function getGlobalDataRetentionPolicies(): Promise<DataRetentionPolicyDto[]> {
  const response = await fetch(`${API_BASE}/api/global/privacy/retention-policies`);
  if (!response.ok) throw new Error('Failed to fetch global data retention policies');
  return response.json();
}

// Constants
export const DATA_SUBJECT_REQUEST_TYPES: DataSubjectRequestType[] = [
  'Access',
  'Export',
  'Delete',
  'Rectify',
  'Restrict',
  'Object',
  'Portability',
];

export const REQUEST_STATUSES: RequestStatus[] = [
  'Submitted',
  'UnderReview',
  'InProgress',
  'Completed',
  'Rejected',
  'Cancelled',
];

export const DATA_CLASSIFICATIONS: DataClassification[] = [
  'Public',
  'Internal',
  'Confidential',
  'Sensitive',
  'PII',
];

export const CONSENT_PURPOSES: ConsentPurpose[] = [
  'Marketing',
  'Analytics',
  'Personalization',
  'ThirdPartySharing',
  'Research',
];

export const CONSENT_STATUSES: ConsentStatus[] = ['Granted', 'Denied', 'Withdrawn', 'Expired'];

// Helper functions

export function getRequestTypeLabel(requestType: DataSubjectRequestType): string {
  const labels: Record<DataSubjectRequestType, string> = {
    Access: 'Right to Access',
    Export: 'Data Export',
    Delete: 'Right to be Forgotten',
    Rectify: 'Right to Rectification',
    Restrict: 'Right to Restrict Processing',
    Object: 'Right to Object',
    Portability: 'Data Portability',
  };
  return labels[requestType];
}

export function getStatusColor(status: RequestStatus): string {
  switch (status) {
    case 'Submitted':
      return 'yellow';
    case 'UnderReview':
      return 'blue';
    case 'InProgress':
      return 'blue';
    case 'Completed':
      return 'green';
    case 'Rejected':
      return 'red';
    case 'Cancelled':
      return 'gray';
    default:
      return 'gray';
  }
}

export function calculateDeadlineStatus(deadlineAt: string): {
  status: 'Overdue' | 'DueSoon' | 'OnTrack';
  daysRemaining: number;
} {
  const deadline = new Date(deadlineAt);
  const now = new Date();
  const diffTime = deadline.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { status: 'Overdue', daysRemaining: diffDays };
  } else if (diffDays <= 7) {
    return { status: 'DueSoon', daysRemaining: diffDays };
  } else {
    return { status: 'OnTrack', daysRemaining: diffDays };
  }
}
