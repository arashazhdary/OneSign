const API_BASE = 'http://localhost:7000';

// Enums
export type ReportType = 'SecurityOverview' | 'UserActivity' | 'ApplicationUsage' | 'RiskAnalysis' | 'ComplianceStatus';
export type ScopeType = 'Tenant' | 'Global';

// DTOs
export interface TenantInsightsOverviewDto {
  tenantId: string;
  from: string;
  to: string;
  totalUsers: number;
  activeUsers: number;
  totalSignIns: number;
  mfaAdoptionPercent: number;
  riskScore: number;
  highRiskEvents: number;
  mediumRiskEvents: number;
  lowRiskEvents: number;
  topApplications: ApplicationUsageDto[];
  signInTrend: DailySignInDto[];
}

export interface ApplicationUsageDto {
  appId: string;
  appName: string;
  signInCount: number;
  uniqueUsers: number;
  lastAccessed: string;
}

export interface ApplicationUsageListDto {
  date: string;
  applications: ApplicationUsageDto[];
  totalSignIns: number;
}

export interface DailySignInDto {
  date: string;
  count: number;
  successCount: number;
  failureCount: number;
}

export interface UserSecurityPostureDto {
  userId: string;
  userEmail: string;
  displayName: string;
  mfaEnabled: boolean;
  lastSignIn?: string;
  riskLevel: string;
  highRiskEventCount: number;
  failedSignInCount: number;
  unusualActivityCount: number;
}

export interface UserSecurityPostureListDto {
  users: UserSecurityPostureDto[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface ReportSubscriptionDto {
  id: string;
  scopeType: ScopeType;
  scopeId?: string;
  reportType: ReportType;
  cronOrFrequency: string;
  emailRecipients: string[];
  isActive: boolean;
  lastSentAt?: string;
  nextScheduledAt?: string;
  createdAt: string;
  createdByUserId: string;
  updatedAt?: string;
  updatedByUserId?: string;
}

export interface ReportSubscriptionListDto {
  subscriptions: ReportSubscriptionDto[];
  totalCount: number;
}

export interface GlobalTenantOverviewDto {
  tenants: TenantSummaryDto[];
  summary: GlobalSummaryDto;
}

export interface TenantSummaryDto {
  tenantId: string;
  tenantName: string;
  totalUsers: number;
  activeUsers: number;
  totalSignInCount: number;
  mfaAdoptionPercent: number;
  riskLevel: string;
  riskScore: number;
}

export interface GlobalSummaryDto {
  totalTenants: number;
  totalUsers: number;
  totalActiveUsers: number;
  totalSignIns: number;
  avgMfaAdoption: number;
  highRiskTenantCount: number;
}

export interface RiskyTenantsListDto {
  tenants: RiskyTenantDto[];
  totalCount: number;
}

export interface RiskyTenantDto {
  tenantId: string;
  tenantName: string;
  riskScore: number;
  riskLevel: string;
  highRiskEventCount: number;
  compromisedUserCount: number;
  lastHighRiskEvent?: string;
}

export interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}

// Tenant API functions

export async function getTenantInsightsOverview(
  tenantId: string,
  from: string,
  to: string
): Promise<TenantInsightsOverviewDto> {
  const response = await fetch(
    `${API_BASE}/api/tenant/insights/overview?from=${from}&to=${to}`,
    {
      headers: { 'X-Tenant-Id': tenantId },
    }
  );
  if (!response.ok) throw new Error('Failed to fetch tenant insights overview');
  return response.json();
}

export async function getApplicationUsage(
  tenantId: string,
  date: string
): Promise<ApplicationUsageListDto> {
  const response = await fetch(
    `${API_BASE}/api/tenant/insights/apps?date=${date}`,
    {
      headers: { 'X-Tenant-Id': tenantId },
    }
  );
  if (!response.ok) throw new Error('Failed to fetch application usage');
  return response.json();
}

export async function getUserSecurityPosture(
  tenantId: string,
  params?: {
    sortBy?: string;
    mfaEnabled?: boolean;
    hasHighRisk?: boolean;
    page?: number;
    pageSize?: number;
  }
): Promise<UserSecurityPostureListDto> {
  const searchParams = new URLSearchParams();
  if (params?.sortBy) searchParams.append('sortBy', params.sortBy);
  if (params?.mfaEnabled !== undefined) searchParams.append('mfaEnabled', params.mfaEnabled.toString());
  if (params?.hasHighRisk !== undefined) searchParams.append('hasHighRisk', params.hasHighRisk.toString());
  if (params?.page) searchParams.append('page', params.page.toString());
  if (params?.pageSize) searchParams.append('pageSize', params.pageSize.toString());

  const response = await fetch(
    `${API_BASE}/api/tenant/insights/users/security-posture?${searchParams}`,
    {
      headers: { 'X-Tenant-Id': tenantId },
    }
  );
  if (!response.ok) throw new Error('Failed to fetch user security posture');
  return response.json();
}

export async function exportTenantInsightsOverview(
  tenantId: string,
  from: string,
  to: string,
  format: string = 'csv'
): Promise<Blob> {
  const response = await fetch(
    `${API_BASE}/api/tenant/insights/export/overview?from=${from}&to=${to}&format=${format}`,
    {
      headers: { 'X-Tenant-Id': tenantId },
    }
  );
  if (!response.ok) throw new Error('Failed to export tenant insights');
  return response.blob();
}

export async function exportUserSecurityPosture(
  tenantId: string,
  format: string = 'csv'
): Promise<Blob> {
  const response = await fetch(
    `${API_BASE}/api/tenant/insights/export/users?format=${format}`,
    {
      headers: { 'X-Tenant-Id': tenantId },
    }
  );
  if (!response.ok) throw new Error('Failed to export user security posture');
  return response.blob();
}

export async function getReportSubscriptions(tenantId: string): Promise<ReportSubscriptionListDto> {
  const response = await fetch(
    `${API_BASE}/api/tenant/insights/report-subscriptions`,
    {
      headers: { 'X-Tenant-Id': tenantId },
    }
  );
  if (!response.ok) throw new Error('Failed to fetch report subscriptions');
  return response.json();
}

export async function createReportSubscription(
  tenantId: string,
  data: {
    reportType: ReportType;
    cronOrFrequency: string;
    emailRecipients: string[];
  }
): Promise<ReportSubscriptionDto> {
  const response = await fetch(`${API_BASE}/api/tenant/insights/report-subscriptions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Tenant-Id': tenantId,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create report subscription');
  return response.json();
}

export async function updateReportSubscription(
  tenantId: string,
  id: string,
  data: {
    reportType: ReportType;
    cronOrFrequency: string;
    emailRecipients: string[];
    isActive: boolean;
  }
): Promise<ReportSubscriptionDto> {
  const response = await fetch(`${API_BASE}/api/tenant/insights/report-subscriptions/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-Tenant-Id': tenantId,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update report subscription');
  return response.json();
}

export async function deleteReportSubscription(tenantId: string, id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/api/tenant/insights/report-subscriptions/${id}`, {
    method: 'DELETE',
    headers: { 'X-Tenant-Id': tenantId },
  });
  if (!response.ok) throw new Error('Failed to delete report subscription');
}

// Global API functions

export async function getGlobalTenantsOverview(params?: {
  from?: string;
  to?: string;
  sortBy?: string;
  page?: number;
  pageSize?: number;
}): Promise<GlobalTenantOverviewDto> {
  const searchParams = new URLSearchParams();
  if (params?.from) searchParams.append('from', params.from);
  if (params?.to) searchParams.append('to', params.to);
  if (params?.sortBy) searchParams.append('sortBy', params.sortBy);
  if (params?.page) searchParams.append('page', params.page.toString());
  if (params?.pageSize) searchParams.append('pageSize', params.pageSize.toString());

  const response = await fetch(`${API_BASE}/api/global/insights/tenants/overview?${searchParams}`);
  if (!response.ok) throw new Error('Failed to fetch global tenants overview');
  return response.json();
}

export async function getRiskyTenants(params?: {
  days?: number;
  minRiskScore?: number;
  top?: number;
}): Promise<RiskyTenantsListDto> {
  const searchParams = new URLSearchParams();
  if (params?.days) searchParams.append('days', params.days.toString());
  if (params?.minRiskScore) searchParams.append('minRiskScore', params.minRiskScore.toString());
  if (params?.top) searchParams.append('top', params.top.toString());

  const response = await fetch(`${API_BASE}/api/global/insights/tenants/risky?${searchParams}`);
  if (!response.ok) throw new Error('Failed to fetch risky tenants');
  return response.json();
}

export async function exportGlobalTenantsOverview(params?: {
  from?: string;
  to?: string;
  format?: string;
}): Promise<Blob> {
  const searchParams = new URLSearchParams();
  if (params?.from) searchParams.append('from', params.from);
  if (params?.to) searchParams.append('to', params.to);
  if (params?.format) searchParams.append('format', params.format);

  const response = await fetch(`${API_BASE}/api/global/insights/export/tenants?${searchParams}`);
  if (!response.ok) throw new Error('Failed to export global tenants overview');
  return response.blob();
}

export async function getGlobalReportSubscriptions(): Promise<ReportSubscriptionListDto> {
  const response = await fetch(`${API_BASE}/api/global/insights/report-subscriptions`);
  if (!response.ok) throw new Error('Failed to fetch global report subscriptions');
  return response.json();
}

export async function createGlobalReportSubscription(data: {
  reportType: ReportType;
  cronOrFrequency: string;
  emailRecipients: string[];
}): Promise<ReportSubscriptionDto> {
  const response = await fetch(`${API_BASE}/api/global/insights/report-subscriptions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create global report subscription');
  return response.json();
}

export async function updateGlobalReportSubscription(
  id: string,
  data: {
    reportType: ReportType;
    cronOrFrequency: string;
    emailRecipients: string[];
    isActive: boolean;
  }
): Promise<ReportSubscriptionDto> {
  const response = await fetch(`${API_BASE}/api/global/insights/report-subscriptions/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update global report subscription');
  return response.json();
}

export async function deleteGlobalReportSubscription(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/api/global/insights/report-subscriptions/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete global report subscription');
}

export async function getGlobalPlatformOverview(params?: {
  from?: string;
  to?: string;
}): Promise<any> {
  const searchParams = new URLSearchParams();
  if (params?.from) searchParams.append('from', params.from);
  if (params?.to) searchParams.append('to', params.to);

  const response = await fetch(`${API_BASE}/api/global/insights/platform-overview?${searchParams}`);
  if (!response.ok) throw new Error('Failed to fetch global platform overview');
  return response.json();
}

export async function getGlobalTenantUsage(params?: {
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
}): Promise<any> {
  const searchParams = new URLSearchParams();
  if (params?.from) searchParams.append('from', params.from);
  if (params?.to) searchParams.append('to', params.to);
  if (params?.page) searchParams.append('page', params.page.toString());
  if (params?.pageSize) searchParams.append('pageSize', params.pageSize.toString());

  const response = await fetch(`${API_BASE}/api/global/insights/tenant-usage?${searchParams}`);
  if (!response.ok) throw new Error('Failed to fetch global tenant usage');
  return response.json();
}

export async function getGlobalHighRiskUsers(params?: {
  minRiskScore?: number;
  page?: number;
  pageSize?: number;
}): Promise<any> {
  const searchParams = new URLSearchParams();
  if (params?.minRiskScore) searchParams.append('minRiskScore', params.minRiskScore.toString());
  if (params?.page) searchParams.append('page', params.page.toString());
  if (params?.pageSize) searchParams.append('pageSize', params.pageSize.toString());

  const response = await fetch(`${API_BASE}/api/global/insights/high-risk-users?${searchParams}`);
  if (!response.ok) throw new Error('Failed to fetch global high risk users');
  return response.json();
}

export async function getGlobalSystemHealth(): Promise<any> {
  const response = await fetch(`${API_BASE}/api/global/insights/system-health`);
  if (!response.ok) throw new Error('Failed to fetch global system health');
  return response.json();
}

export async function getGlobalSystemAlerts(params?: {
  severity?: string;
  acknowledged?: boolean;
  page?: number;
  pageSize?: number;
}): Promise<any> {
  const searchParams = new URLSearchParams();
  if (params?.severity) searchParams.append('severity', params.severity);
  if (params?.acknowledged !== undefined) searchParams.append('acknowledged', params.acknowledged.toString());
  if (params?.page) searchParams.append('page', params.page.toString());
  if (params?.pageSize) searchParams.append('pageSize', params.pageSize.toString());

  const response = await fetch(`${API_BASE}/api/global/insights/system-alerts?${searchParams}`);
  if (!response.ok) throw new Error('Failed to fetch global system alerts');
  return response.json();
}

export async function acknowledgeGlobalSystemAlert(id: string, userId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/api/global/insights/system-alerts/${id}/acknowledge`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  });
  if (!response.ok) throw new Error('Failed to acknowledge global system alert');
}

// Constants
export const REPORT_TYPES: ReportType[] = [
  'SecurityOverview',
  'UserActivity',
  'ApplicationUsage',
  'RiskAnalysis',
  'ComplianceStatus',
];

export const FREQUENCY_OPTIONS = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: '0 9 * * 1', label: 'Every Monday at 9 AM' },
  { value: '0 9 1 * *', label: 'First of month at 9 AM' },
];
