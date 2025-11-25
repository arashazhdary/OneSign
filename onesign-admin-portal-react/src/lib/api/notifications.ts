import apiClient from '@/services/apiClient';

// Constants
export const NOTIFICATION_TYPES = [
  { value: 'email', label: 'Email' },
  { value: 'sms', label: 'SMS' },
  { value: 'push', label: 'Push Notification' },
  { value: 'in_app', label: 'In-App' },
  { value: 'slack', label: 'Slack' },
  { value: 'teams', label: 'Microsoft Teams' },
  { value: 'webhook', label: 'Webhook' },
];

export const NOTIFICATION_CATEGORIES = [
  { value: 'security', label: 'Security' },
  { value: 'system', label: 'System' },
  { value: 'user', label: 'User Activity' },
  { value: 'compliance', label: 'Compliance' },
  { value: 'billing', label: 'Billing' },
  { value: 'access', label: 'Access Management' },
  { value: 'alert', label: 'Alerts' },
  { value: 'report', label: 'Reports' },
];

// Utility functions
export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'sent':
    case 'delivered':
    case 'success':
      return 'green';
    case 'pending':
    case 'queued':
      return 'yellow';
    case 'failed':
    case 'error':
      return 'red';
    case 'cancelled':
      return 'gray';
    default:
      return 'blue';
  }
};

export const getPriorityColor = (priority: string): string => {
  switch (priority) {
    case 'critical':
    case 'urgent':
      return 'red';
    case 'high':
      return 'orange';
    case 'medium':
    case 'normal':
      return 'blue';
    case 'low':
      return 'gray';
    default:
      return 'blue';
  }
};

// Type definitions
export interface NotificationTemplateDto {
  id: string;
  name: string;
  type: string;
  subject?: string;
  body: string;
  variables?: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationChannelDto {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'push' | 'slack' | 'teams' | 'webhook';
  config: any;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationPreferenceDto {
  id: string;
  userId: string;
  channelId: string;
  enabled: boolean;
  types: string[];
}

export interface NotificationRuleDto {
  id: string;
  name: string;
  event: string;
  conditions?: any;
  actions: any[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Direct function exports
export const getNotifications = async (params?: any) => {
  try {
    const response = await apiClient.get('/api/notifications', { params });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
    return [];
  }
};

export const sendNotification = async (data: any) => {
  try {
    const response = await apiClient.post('/api/notifications/send', data);
    return response.data;
  } catch (error) {
    console.error('Failed to send notification:', error);
    throw error;
  }
};

export const retryNotification = async (notificationId: string) => {
  try {
    const response = await apiClient.post(`/api/notifications/${notificationId}/retry`);
    return response.data;
  } catch (error) {
    console.error('Failed to retry notification:', error);
    throw error;
  }
};

export const getNotificationStats = async () => {
  try {
    const response = await apiClient.get('/api/notifications/stats');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch notification stats:', error);
    return null;
  }
};

// Template functions
export const getNotificationTemplates = async (params?: any) => {
  try {
    const response = await apiClient.get('/api/notifications/templates', { params });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch notification templates:', error);
    return [];
  }
};

export const getNotificationTemplate = async (templateId: string) => {
  try {
    const response = await apiClient.get(`/api/notifications/templates/${templateId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch notification template:', error);
    return null;
  }
};

export const createNotificationTemplate = async (data: Partial<NotificationTemplateDto>) => {
  try {
    const response = await apiClient.post('/api/notifications/templates', data);
    return response.data;
  } catch (error) {
    console.error('Failed to create notification template:', error);
    throw error;
  }
};

export const updateNotificationTemplate = async (templateId: string, data: Partial<NotificationTemplateDto>) => {
  try {
    const response = await apiClient.put(`/api/notifications/templates/${templateId}`, data);
    return response.data;
  } catch (error) {
    console.error('Failed to update notification template:', error);
    throw error;
  }
};

export const deleteNotificationTemplate = async (templateId: string) => {
  try {
    await apiClient.delete(`/api/notifications/templates/${templateId}`);
  } catch (error) {
    console.error('Failed to delete notification template:', error);
    throw error;
  }
};

// Channel functions
export const getNotificationChannels = async (params?: any) => {
  try {
    const response = await apiClient.get('/api/notifications/channels', { params });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch notification channels:', error);
    return [];
  }
};

export const getNotificationChannel = async (channelId: string) => {
  try {
    const response = await apiClient.get(`/api/notifications/channels/${channelId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch notification channel:', error);
    return null;
  }
};

export const createNotificationChannel = async (data: Partial<NotificationChannelDto>) => {
  try {
    const response = await apiClient.post('/api/notifications/channels', data);
    return response.data;
  } catch (error) {
    console.error('Failed to create notification channel:', error);
    throw error;
  }
};

export const updateNotificationChannel = async (channelId: string, data: Partial<NotificationChannelDto>) => {
  try {
    const response = await apiClient.put(`/api/notifications/channels/${channelId}`, data);
    return response.data;
  } catch (error) {
    console.error('Failed to update notification channel:', error);
    throw error;
  }
};

export const deleteNotificationChannel = async (channelId: string) => {
  try {
    await apiClient.delete(`/api/notifications/channels/${channelId}`);
  } catch (error) {
    console.error('Failed to delete notification channel:', error);
    throw error;
  }
};

// Preference functions
export const getNotificationPreferences = async (userId?: string) => {
  try {
    const response = await apiClient.get('/api/notifications/preferences', { params: { userId } });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch notification preferences:', error);
    return [];
  }
};

export const updateNotificationPreference = async (preferenceId: string, data: Partial<NotificationPreferenceDto>) => {
  try {
    const response = await apiClient.put(`/api/notifications/preferences/${preferenceId}`, data);
    return response.data;
  } catch (error) {
    console.error('Failed to update notification preference:', error);
    throw error;
  }
};

// Rule functions
export const getNotificationRules = async (params?: any) => {
  try {
    const response = await apiClient.get('/api/notifications/rules', { params });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch notification rules:', error);
    return [];
  }
};

export const getNotificationRule = async (ruleId: string) => {
  try {
    const response = await apiClient.get(`/api/notifications/rules/${ruleId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch notification rule:', error);
    return null;
  }
};

export const createNotificationRule = async (data: Partial<NotificationRuleDto>) => {
  try {
    const response = await apiClient.post('/api/notifications/rules', data);
    return response.data;
  } catch (error) {
    console.error('Failed to create notification rule:', error);
    throw error;
  }
};

export const updateNotificationRule = async (ruleId: string, data: Partial<NotificationRuleDto>) => {
  try {
    const response = await apiClient.put(`/api/notifications/rules/${ruleId}`, data);
    return response.data;
  } catch (error) {
    console.error('Failed to update notification rule:', error);
    throw error;
  }
};

export const deleteNotificationRule = async (ruleId: string) => {
  try {
    await apiClient.delete(`/api/notifications/rules/${ruleId}`);
  } catch (error) {
    console.error('Failed to delete notification rule:', error);
    throw error;
  }
};

export const toggleNotificationRule = async (ruleId: string) => {
  try {
    const response = await apiClient.post(`/api/notifications/rules/${ruleId}/toggle`);
    return response.data;
  } catch (error) {
    console.error('Failed to toggle notification rule:', error);
    throw error;
  }
};

// Service object
export const notificationsService = {
  getNotifications,
  sendNotification,
  retryNotification,
  getNotificationStats,
  getNotificationTemplates,
  getNotificationTemplate,
  createNotificationTemplate,
  updateNotificationTemplate,
  deleteNotificationTemplate,
  getNotificationChannels,
  getNotificationChannel,
  createNotificationChannel,
  updateNotificationChannel,
  deleteNotificationChannel,
  getNotificationPreferences,
  updateNotificationPreference,
  getNotificationRules,
  getNotificationRule,
  createNotificationRule,
  updateNotificationRule,
  deleteNotificationRule,
  toggleNotificationRule,
};

export default notificationsService;
