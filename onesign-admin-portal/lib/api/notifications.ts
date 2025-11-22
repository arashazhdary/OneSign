const API_BASE = 'http://localhost:7000';

// Enums
export type NotificationType = 'Email' | 'SMS' | 'InApp' | 'Webhook' | 'Slack' | 'Teams';
export type NotificationPriority = 'Low' | 'Normal' | 'High' | 'Critical';
export type NotificationStatus = 'Pending' | 'Sent' | 'Delivered' | 'Failed' | 'Bounced';
export type NotificationCategory = 'Security' | 'System' | 'User' | 'Incident' | 'AccessRequest' | 'Lifecycle' | 'Custom';

// DTOs
export interface NotificationDto {
  id: string;
  tenantId: string;
  recipientUserId?: string;
  recipientEmail?: string;
  recipientPhone?: string;
  type: NotificationType;
  category: NotificationCategory;
  priority: NotificationPriority;
  status: NotificationStatus;
  subject: string;
  message: string;
  htmlContent?: string;
  metadata?: Record<string, any>;
  sentAt?: string;
  deliveredAt?: string;
  failureReason?: string;
  retryCount: number;
  createdAt: string;
}

export interface NotificationTemplateDto {
  id: string;
  tenantId?: string; // null for global templates
  name: string;
  description?: string;
  category: NotificationCategory;
  type: NotificationType;
  subjectTemplate: string;
  bodyTemplate: string;
  htmlTemplate?: string;
  variables: string[];
  isActive: boolean;
  isGlobalTemplate: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateNotificationTemplateDto {
  tenantId?: string;
  userId: string;
  name: string;
  description?: string;
  category: NotificationCategory;
  type: NotificationType;
  subjectTemplate: string;
  bodyTemplate: string;
  htmlTemplate?: string;
  variables: string[];
  isActive: boolean;
}

export interface NotificationChannelDto {
  id: string;
  tenantId: string;
  type: NotificationType;
  name: string;
  isEnabled: boolean;
  configuration: Record<string, any>;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateNotificationChannelDto {
  tenantId: string;
  userId: string;
  type: NotificationType;
  name: string;
  configuration: Record<string, any>;
}

export interface NotificationPreferenceDto {
  id: string;
  userId: string;
  tenantId: string;
  category: NotificationCategory;
  emailEnabled: boolean;
  smsEnabled: boolean;
  inAppEnabled: boolean;
  updatedAt?: string;
}

export interface UpdateNotificationPreferenceDto {
  userId: string;
  tenantId: string;
  category: NotificationCategory;
  emailEnabled: boolean;
  smsEnabled: boolean;
  inAppEnabled: boolean;
}

export interface NotificationStatsDto {
  totalSent: number;
  totalDelivered: number;
  totalFailed: number;
  deliveryRate: number;
  byType: Array<{
    type: NotificationType;
    sent: number;
    delivered: number;
    failed: number;
  }>;
  byCategory: Array<{
    category: NotificationCategory;
    sent: number;
  }>;
}

export interface SendNotificationDto {
  tenantId: string;
  recipientUserIds?: string[];
  recipientEmails?: string[];
  recipientPhones?: string[];
  type: NotificationType;
  category: NotificationCategory;
  priority: NotificationPriority;
  subject: string;
  message: string;
  htmlContent?: string;
  metadata?: Record<string, any>;
  templateId?: string;
  templateVariables?: Record<string, string>;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Tenant API functions

export async function getNotifications(
  tenantId: string,
  params?: {
    recipientUserId?: string;
    type?: NotificationType;
    category?: NotificationCategory;
    status?: NotificationStatus;
    fromDate?: string;
    toDate?: string;
    page?: number;
    pageSize?: number;
  }
): Promise<PagedResult<NotificationDto>> {
  const searchParams = new URLSearchParams({ tenantId });
  if (params?.recipientUserId) searchParams.append('recipientUserId', params.recipientUserId);
  if (params?.type) searchParams.append('type', params.type);
  if (params?.category) searchParams.append('category', params.category);
  if (params?.status) searchParams.append('status', params.status);
  if (params?.fromDate) searchParams.append('fromDate', params.fromDate);
  if (params?.toDate) searchParams.append('toDate', params.toDate);
  if (params?.page) searchParams.append('page', params.page.toString());
  if (params?.pageSize) searchParams.append('pageSize', params.pageSize.toString());

  const response = await fetch(`${API_BASE}/api/tenant/notifications?${searchParams}`);
  if (!response.ok) throw new Error('Failed to fetch notifications');
  return response.json();
}

export async function getNotification(
  id: string,
  tenantId: string
): Promise<NotificationDto> {
  const response = await fetch(
    `${API_BASE}/api/tenant/notifications/${id}?tenantId=${tenantId}`
  );
  if (!response.ok) throw new Error('Failed to fetch notification');
  return response.json();
}

export async function sendNotification(
  data: SendNotificationDto
): Promise<NotificationDto | NotificationDto[]> {
  const response = await fetch(`${API_BASE}/api/tenant/notifications/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to send notification');
  return response.json();
}

export async function sendNotificationDirect(
  tenantId: string,
  data: {
    recipientId?: string;
    channel: string;
    subject?: string;
    body?: string;
    templateId?: string;
    variables?: Record<string, string>;
  }
): Promise<NotificationDto> {
  const response = await fetch(`${API_BASE}/api/tenant/notifications?tenantId=${tenantId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...data, tenantId }),
  });
  if (!response.ok) throw new Error('Failed to send notification');
  return response.json();
}

export async function retryNotification(
  id: string,
  tenantId: string
): Promise<void> {
  const response = await fetch(
    `${API_BASE}/api/tenant/notifications/${id}/retry?tenantId=${tenantId}`,
    { method: 'POST' }
  );
  if (!response.ok) throw new Error('Failed to retry notification');
}

export async function getNotificationTemplates(
  tenantId: string,
  params?: {
    category?: NotificationCategory;
    type?: NotificationType;
    isActive?: boolean;
  }
): Promise<NotificationTemplateDto[]> {
  const searchParams = new URLSearchParams({ tenantId });
  if (params?.category) searchParams.append('category', params.category);
  if (params?.type) searchParams.append('type', params.type);
  if (params?.isActive !== undefined) searchParams.append('isActive', params.isActive.toString());

  const response = await fetch(`${API_BASE}/api/tenant/notifications/templates?${searchParams}`);
  if (!response.ok) throw new Error('Failed to fetch notification templates');
  return response.json();
}

export async function getNotificationTemplate(
  id: string,
  tenantId: string
): Promise<NotificationTemplateDto> {
  const response = await fetch(
    `${API_BASE}/api/tenant/notifications/templates/${id}?tenantId=${tenantId}`
  );
  if (!response.ok) throw new Error('Failed to fetch notification template');
  return response.json();
}

export async function createNotificationTemplate(
  data: CreateNotificationTemplateDto
): Promise<NotificationTemplateDto> {
  const response = await fetch(`${API_BASE}/api/tenant/notifications/templates`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create notification template');
  return response.json();
}

export async function updateNotificationTemplate(
  id: string,
  data: CreateNotificationTemplateDto
): Promise<NotificationTemplateDto> {
  const response = await fetch(`${API_BASE}/api/tenant/notifications/templates/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update notification template');
  return response.json();
}

export async function deleteNotificationTemplate(
  id: string,
  tenantId: string,
  userId: string
): Promise<void> {
  const response = await fetch(
    `${API_BASE}/api/tenant/notifications/templates/${id}?tenantId=${tenantId}&userId=${userId}`,
    { method: 'DELETE' }
  );
  if (!response.ok) throw new Error('Failed to delete notification template');
}

export async function getNotificationChannels(
  tenantId: string
): Promise<NotificationChannelDto[]> {
  const response = await fetch(
    `${API_BASE}/api/tenant/notifications/channels?tenantId=${tenantId}`
  );
  if (!response.ok) throw new Error('Failed to fetch notification channels');
  return response.json();
}

export async function createNotificationChannel(
  data: CreateNotificationChannelDto
): Promise<NotificationChannelDto> {
  const response = await fetch(`${API_BASE}/api/tenant/notifications/channels`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create notification channel');
  return response.json();
}

export async function updateNotificationChannel(
  id: string,
  data: CreateNotificationChannelDto
): Promise<NotificationChannelDto> {
  const response = await fetch(`${API_BASE}/api/tenant/notifications/channels/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update notification channel');
  return response.json();
}

export async function deleteNotificationChannel(
  id: string,
  tenantId: string,
  userId: string
): Promise<void> {
  const response = await fetch(
    `${API_BASE}/api/tenant/notifications/channels/${id}?tenantId=${tenantId}&userId=${userId}`,
    { method: 'DELETE' }
  );
  if (!response.ok) throw new Error('Failed to delete notification channel');
}

export async function getNotificationPreferences(
  userId: string,
  tenantId: string
): Promise<NotificationPreferenceDto[]> {
  const response = await fetch(
    `${API_BASE}/api/tenant/notifications/preferences?userId=${userId}&tenantId=${tenantId}`
  );
  if (!response.ok) throw new Error('Failed to fetch notification preferences');
  return response.json();
}

export async function updateNotificationPreference(
  data: UpdateNotificationPreferenceDto
): Promise<NotificationPreferenceDto> {
  const response = await fetch(`${API_BASE}/api/tenant/notifications/preferences`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update notification preference');
  return response.json();
}

export async function getNotificationStats(
  tenantId: string,
  params?: {
    fromDate?: string;
    toDate?: string;
  }
): Promise<NotificationStatsDto> {
  const searchParams = new URLSearchParams({ tenantId });
  if (params?.fromDate) searchParams.append('fromDate', params.fromDate);
  if (params?.toDate) searchParams.append('toDate', params.toDate);

  const response = await fetch(`${API_BASE}/api/tenant/notifications/stats?${searchParams}`);
  if (!response.ok) throw new Error('Failed to fetch notification stats');
  return response.json();
}

// Global API functions

export async function getGlobalNotifications(
  params?: {
    tenantId?: string;
    type?: NotificationType;
    category?: NotificationCategory;
    status?: NotificationStatus;
    page?: number;
    pageSize?: number;
  }
): Promise<PagedResult<NotificationDto>> {
  const searchParams = new URLSearchParams();
  if (params?.tenantId) searchParams.append('tenantId', params.tenantId);
  if (params?.type) searchParams.append('type', params.type);
  if (params?.category) searchParams.append('category', params.category);
  if (params?.status) searchParams.append('status', params.status);
  if (params?.page) searchParams.append('page', params.page.toString());
  if (params?.pageSize) searchParams.append('pageSize', params.pageSize.toString());

  const response = await fetch(`${API_BASE}/api/global/notifications?${searchParams}`);
  if (!response.ok) throw new Error('Failed to fetch global notifications');
  return response.json();
}

export async function getGlobalNotificationStats(): Promise<{
  byTenant: Array<{ tenantId: string; tenantName: string; stats: NotificationStatsDto }>;
  overall: NotificationStatsDto;
}> {
  const response = await fetch(`${API_BASE}/api/global/notifications/stats`);
  if (!response.ok) throw new Error('Failed to fetch global notification stats');
  return response.json();
}

export async function getGlobalNotificationTemplates(): Promise<NotificationTemplateDto[]> {
  const response = await fetch(`${API_BASE}/api/global/notifications/templates`);
  if (!response.ok) throw new Error('Failed to fetch global notification templates');
  return response.json();
}

// Constants
export const NOTIFICATION_TYPES: NotificationType[] = ['Email', 'SMS', 'InApp', 'Webhook', 'Slack', 'Teams'];

export const NOTIFICATION_PRIORITIES: NotificationPriority[] = ['Low', 'Normal', 'High', 'Critical'];

export const NOTIFICATION_STATUSES: NotificationStatus[] = ['Pending', 'Sent', 'Delivered', 'Failed', 'Bounced'];

export const NOTIFICATION_CATEGORIES: NotificationCategory[] = [
  'Security',
  'System',
  'User',
  'Incident',
  'AccessRequest',
  'Lifecycle',
  'Custom',
];

// Helper functions

export function getStatusColor(status: NotificationStatus): string {
  switch (status) {
    case 'Pending':
      return 'yellow';
    case 'Sent':
      return 'blue';
    case 'Delivered':
      return 'green';
    case 'Failed':
      return 'red';
    case 'Bounced':
      return 'orange';
    default:
      return 'gray';
  }
}

export function getPriorityColor(priority: NotificationPriority): string {
  switch (priority) {
    case 'Low':
      return 'gray';
    case 'Normal':
      return 'blue';
    case 'High':
      return 'orange';
    case 'Critical':
      return 'red';
    default:
      return 'gray';
  }
}

export function getTypeIcon(type: NotificationType): string {
  const icons: Record<NotificationType, string> = {
    Email: 'mail',
    SMS: 'phone',
    InApp: 'bell',
    Webhook: 'globe',
    Slack: 'slack',
    Teams: 'microsoft',
  };
  return icons[type] || 'bell';
}
