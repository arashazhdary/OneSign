const API_BASE = 'http://localhost:7000';

// Enums
export type ExtensionType = 'WebHook' | 'CustomFunction' | 'Connector' | 'Widget' | 'Plugin';
export type ExtensionStatus = 'Active' | 'Inactive' | 'Error' | 'Testing';
export type TriggerEventType = 'UserCreated' | 'UserUpdated' | 'UserDeleted' | 'SignInSucceeded' | 'SignInFailed' | 'IncidentCreated' | 'PolicyViolation' | 'AccessRequested' | 'Custom';
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

// DTOs
export interface ExtensionDto {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  type: ExtensionType;
  status: ExtensionStatus;
  configuration: ExtensionConfigDto;
  triggers: ExtensionTriggerDto[];
  isEnabled: boolean;
  createdAt: string;
  createdByUserId: string;
  updatedAt?: string;
  lastExecutedAt?: string;
  executionCount: number;
}

export interface ExtensionConfigDto {
  // WebHook specific
  webhookUrl?: string;
  httpMethod?: HttpMethod;
  headers?: Record<string, string>;
  authType?: 'None' | 'ApiKey' | 'Bearer' | 'Basic';
  authCredentials?: Record<string, string>;
  timeoutMs?: number;
  retryPolicy?: {
    maxRetries: number;
    retryDelayMs: number;
  };

  // Custom Function specific
  functionCode?: string;
  functionRuntime?: 'JavaScript' | 'Python' | 'CSharp';
  functionDependencies?: string[];

  // Connector specific
  connectorType?: string;
  connectorEndpoint?: string;
  connectorCredentials?: Record<string, string>;

  // Widget specific
  widgetHtml?: string;
  widgetCss?: string;
  widgetScript?: string;
  widgetPlacement?: string;

  // Plugin specific
  pluginUrl?: string;
  pluginManifest?: Record<string, any>;
}

export interface ExtensionTriggerDto {
  id: string;
  extensionId: string;
  eventType: TriggerEventType;
  filterExpression?: string;
  isEnabled: boolean;
}

export interface CreateExtensionDto {
  tenantId: string;
  userId: string;
  name: string;
  description?: string;
  type: ExtensionType;
  configuration: ExtensionConfigDto;
  triggers: Omit<ExtensionTriggerDto, 'id' | 'extensionId'>[];
  isEnabled: boolean;
}

export interface ExtensionExecutionDto {
  id: string;
  extensionId: string;
  extensionName?: string;
  tenantId: string;
  triggerEvent: string;
  startedAt: string;
  completedAt?: string;
  status: 'Pending' | 'Running' | 'Succeeded' | 'Failed' | 'TimedOut';
  errorMessage?: string;
  executionTimeMs?: number;
  requestPayload?: string;
  responsePayload?: string;
}

export interface ExtensionTestResultDto {
  success: boolean;
  executionTimeMs: number;
  statusCode?: number;
  response?: string;
  error?: string;
  validationErrors?: string[];
}

export interface ExtensionStatsDto {
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  avgExecutionTimeMs: number;
  successRate: number;
  executionsByExtension: Array<{
    extensionId: string;
    extensionName: string;
    executionCount: number;
    successCount: number;
    failureCount: number;
  }>;
}

export interface ConnectorDto {
  id: string;
  name: string;
  description?: string;
  connectorType: string;
  logoUrl?: string;
  documentationUrl?: string;
  configurationSchema: Record<string, any>;
  supportedEvents: string[];
  isOfficial: boolean;
  isActive: boolean;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Tenant API functions

export async function getExtensions(
  tenantId: string,
  params?: {
    type?: ExtensionType;
    status?: ExtensionStatus;
    isEnabled?: boolean;
    page?: number;
    pageSize?: number;
  }
): Promise<PagedResult<ExtensionDto>> {
  const searchParams = new URLSearchParams({ tenantId });
  if (params?.type) searchParams.append('type', params.type);
  if (params?.status) searchParams.append('status', params.status);
  if (params?.isEnabled !== undefined) searchParams.append('isEnabled', params.isEnabled.toString());
  if (params?.page) searchParams.append('page', params.page.toString());
  if (params?.pageSize) searchParams.append('pageSize', params.pageSize.toString());

  const response = await fetch(`${API_BASE}/api/tenant/extensibility/extensions?${searchParams}`);
  if (!response.ok) throw new Error('Failed to fetch extensions');
  return response.json();
}

export async function getExtension(
  id: string,
  tenantId: string
): Promise<ExtensionDto> {
  const response = await fetch(
    `${API_BASE}/api/tenant/extensibility/extensions/${id}?tenantId=${tenantId}`
  );
  if (!response.ok) throw new Error('Failed to fetch extension');
  return response.json();
}

export async function createExtension(
  data: CreateExtensionDto
): Promise<ExtensionDto> {
  const response = await fetch(`${API_BASE}/api/tenant/extensibility/extensions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create extension');
  return response.json();
}

export async function updateExtension(
  id: string,
  data: CreateExtensionDto
): Promise<ExtensionDto> {
  const response = await fetch(`${API_BASE}/api/tenant/extensibility/extensions/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update extension');
  return response.json();
}

export async function deleteExtension(
  id: string,
  tenantId: string,
  userId: string
): Promise<void> {
  const response = await fetch(
    `${API_BASE}/api/tenant/extensibility/extensions/${id}?tenantId=${tenantId}&userId=${userId}`,
    { method: 'DELETE' }
  );
  if (!response.ok) throw new Error('Failed to delete extension');
}

export async function enableExtension(
  id: string,
  tenantId: string,
  userId: string
): Promise<void> {
  const response = await fetch(
    `${API_BASE}/api/tenant/extensibility/extensions/${id}/enable?tenantId=${tenantId}&userId=${userId}`,
    { method: 'POST' }
  );
  if (!response.ok) throw new Error('Failed to enable extension');
}

export async function disableExtension(
  id: string,
  tenantId: string,
  userId: string
): Promise<void> {
  const response = await fetch(
    `${API_BASE}/api/tenant/extensibility/extensions/${id}/disable?tenantId=${tenantId}&userId=${userId}`,
    { method: 'POST' }
  );
  if (!response.ok) throw new Error('Failed to disable extension');
}

export async function testExtension(
  id: string,
  tenantId: string,
  testPayload?: Record<string, any>
): Promise<ExtensionTestResultDto> {
  const response = await fetch(
    `${API_BASE}/api/tenant/extensibility/extensions/${id}/test`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenantId, testPayload }),
    }
  );
  if (!response.ok) throw new Error('Failed to test extension');
  return response.json();
}

export async function getExtensionExecutions(
  tenantId: string,
  params?: {
    extensionId?: string;
    status?: string;
    fromDate?: string;
    toDate?: string;
    page?: number;
    pageSize?: number;
  }
): Promise<PagedResult<ExtensionExecutionDto>> {
  const searchParams = new URLSearchParams({ tenantId });
  if (params?.extensionId) searchParams.append('extensionId', params.extensionId);
  if (params?.status) searchParams.append('status', params.status);
  if (params?.fromDate) searchParams.append('fromDate', params.fromDate);
  if (params?.toDate) searchParams.append('toDate', params.toDate);
  if (params?.page) searchParams.append('page', params.page.toString());
  if (params?.pageSize) searchParams.append('pageSize', params.pageSize.toString());

  const response = await fetch(`${API_BASE}/api/tenant/extensibility/executions?${searchParams}`);
  if (!response.ok) throw new Error('Failed to fetch extension executions');
  return response.json();
}

export async function getExtensionExecution(
  id: string,
  tenantId: string
): Promise<ExtensionExecutionDto> {
  const response = await fetch(
    `${API_BASE}/api/tenant/extensibility/executions/${id}?tenantId=${tenantId}`
  );
  if (!response.ok) throw new Error('Failed to fetch extension execution');
  return response.json();
}

export async function retryExtensionExecution(
  id: string,
  tenantId: string,
  userId: string
): Promise<void> {
  const response = await fetch(
    `${API_BASE}/api/tenant/extensibility/executions/${id}/retry?tenantId=${tenantId}&userId=${userId}`,
    { method: 'POST' }
  );
  if (!response.ok) throw new Error('Failed to retry extension execution');
}

export async function getExtensionStats(
  tenantId: string,
  params?: {
    extensionId?: string;
    fromDate?: string;
    toDate?: string;
  }
): Promise<ExtensionStatsDto> {
  const searchParams = new URLSearchParams({ tenantId });
  if (params?.extensionId) searchParams.append('extensionId', params.extensionId);
  if (params?.fromDate) searchParams.append('fromDate', params.fromDate);
  if (params?.toDate) searchParams.append('toDate', params.toDate);

  const response = await fetch(`${API_BASE}/api/tenant/extensibility/stats?${searchParams}`);
  if (!response.ok) throw new Error('Failed to fetch extension stats');
  return response.json();
}

export async function getAvailableConnectors(): Promise<ConnectorDto[]> {
  const response = await fetch(`${API_BASE}/api/tenant/extensibility/connectors`);
  if (!response.ok) throw new Error('Failed to fetch available connectors');
  return response.json();
}

export async function validateExtensionCode(
  code: string,
  runtime: string
): Promise<{
  isValid: boolean;
  errors?: string[];
  warnings?: string[];
}> {
  const response = await fetch(`${API_BASE}/api/tenant/extensibility/validate-code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, runtime }),
  });
  if (!response.ok) throw new Error('Failed to validate extension code');
  return response.json();
}

// Global API functions

export async function getGlobalExtensions(
  params?: {
    tenantId?: string;
    type?: ExtensionType;
    status?: ExtensionStatus;
    page?: number;
    pageSize?: number;
  }
): Promise<PagedResult<ExtensionDto>> {
  const searchParams = new URLSearchParams();
  if (params?.tenantId) searchParams.append('tenantId', params.tenantId);
  if (params?.type) searchParams.append('type', params.type);
  if (params?.status) searchParams.append('status', params.status);
  if (params?.page) searchParams.append('page', params.page.toString());
  if (params?.pageSize) searchParams.append('pageSize', params.pageSize.toString());

  const response = await fetch(`${API_BASE}/api/global/extensibility/extensions?${searchParams}`);
  if (!response.ok) throw new Error('Failed to fetch global extensions');
  return response.json();
}

export async function getGlobalExtensionStats(): Promise<{
  byTenant: Array<{ tenantId: string; tenantName: string; stats: ExtensionStatsDto }>;
  overall: ExtensionStatsDto;
}> {
  const response = await fetch(`${API_BASE}/api/global/extensibility/stats`);
  if (!response.ok) throw new Error('Failed to fetch global extension stats');
  return response.json();
}

export async function getGlobalAvailableConnectors(): Promise<ConnectorDto[]> {
  const response = await fetch(`${API_BASE}/api/global/extensibility/connectors`);
  if (!response.ok) throw new Error('Failed to fetch global available connectors');
  return response.json();
}

export async function createGlobalConnector(
  data: Omit<ConnectorDto, 'id'>
): Promise<ConnectorDto> {
  const response = await fetch(`${API_BASE}/api/global/extensibility/connectors`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create global connector');
  return response.json();
}

// Constants
export const EXTENSION_TYPES: ExtensionType[] = ['WebHook', 'CustomFunction', 'Connector', 'Widget', 'Plugin'];

export const EXTENSION_STATUSES: ExtensionStatus[] = ['Active', 'Inactive', 'Error', 'Testing'];

export const TRIGGER_EVENT_TYPES: TriggerEventType[] = [
  'UserCreated',
  'UserUpdated',
  'UserDeleted',
  'SignInSucceeded',
  'SignInFailed',
  'IncidentCreated',
  'PolicyViolation',
  'AccessRequested',
  'Custom',
];

export const HTTP_METHODS: HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

export const FUNCTION_RUNTIMES = ['JavaScript', 'Python', 'CSharp'];

// Helper functions

export function getExtensionTypeIcon(type: ExtensionType): string {
  const icons: Record<ExtensionType, string> = {
    WebHook: 'globe',
    CustomFunction: 'code',
    Connector: 'plug',
    Widget: 'layout',
    Plugin: 'package',
  };
  return icons[type] || 'box';
}

export function getStatusColor(status: ExtensionStatus): string {
  switch (status) {
    case 'Active':
      return 'green';
    case 'Inactive':
      return 'gray';
    case 'Error':
      return 'red';
    case 'Testing':
      return 'yellow';
    default:
      return 'gray';
  }
}

export function validateWebhookUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === 'https:';
  } catch {
    return false;
  }
}

export function getTriggerEventLabel(eventType: TriggerEventType): string {
  const labels: Record<TriggerEventType, string> = {
    UserCreated: 'User Created',
    UserUpdated: 'User Updated',
    UserDeleted: 'User Deleted',
    SignInSucceeded: 'Sign-In Succeeded',
    SignInFailed: 'Sign-In Failed',
    IncidentCreated: 'Incident Created',
    PolicyViolation: 'Policy Violation',
    AccessRequested: 'Access Requested',
    Custom: 'Custom Event',
  };
  return labels[eventType];
}
