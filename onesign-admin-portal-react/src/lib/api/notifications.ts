import apiClient from '@/services/apiClient';

export const notificationsService = {
  getNotifications: async (params?: any) => {
    try {
      const response = await apiClient.get('/api/notifications', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      return [];
    }
  },

  getNotificationById: async (notificationId: string) => {
    try {
      const response = await apiClient.get(`/api/notifications/${notificationId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch notification:', error);
      return null;
    }
  },

  markAsRead: async (notificationId: string) => {
    try {
      const response = await apiClient.post(`/api/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      throw error;
    }
  },

  getTemplates: async () => {
    try {
      const response = await apiClient.get('/api/notifications/templates');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch notification templates:', error);
      return [];
    }
  },

  getTemplateById: async (templateId: string) => {
    try {
      const response = await apiClient.get(`/api/notifications/templates/${templateId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch notification template:', error);
      return null;
    }
  },

  createTemplate: async (data: any) => {
    try {
      const response = await apiClient.post('/api/notifications/templates', data);
      return response.data;
    } catch (error) {
      console.error('Failed to create notification template:', error);
      throw error;
    }
  },

  updateTemplate: async (templateId: string, data: any) => {
    try {
      const response = await apiClient.put(`/api/notifications/templates/${templateId}`, data);
      return response.data;
    } catch (error) {
      console.error('Failed to update notification template:', error);
      throw error;
    }
  },
};

export default notificationsService;
