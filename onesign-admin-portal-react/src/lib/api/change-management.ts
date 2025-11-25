import apiClient from '@/services/apiClient';

// Type definitions
export interface ChangeSetTemplate {
  id: string;
  name: string;
  description?: string;
  type: string;
  steps: any[];
  createdAt: string;
  updatedAt: string;
}

// Direct function exports
export const getChangeSetTemplates = async (params?: any) => {
  try {
    const response = await apiClient.get('/api/change-management/templates', { params });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch change set templates:', error);
    return [];
  }
};

export const getChangeSetTemplate = async (templateId: string) => {
  try {
    const response = await apiClient.get(`/api/change-management/templates/${templateId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch change set template:', error);
    return null;
  }
};

export const createChangeSetTemplate = async (data: Partial<ChangeSetTemplate>) => {
  try {
    const response = await apiClient.post('/api/change-management/templates', data);
    return response.data;
  } catch (error) {
    console.error('Failed to create change set template:', error);
    throw error;
  }
};

export const updateChangeSetTemplate = async (templateId: string, data: Partial<ChangeSetTemplate>) => {
  try {
    const response = await apiClient.put(`/api/change-management/templates/${templateId}`, data);
    return response.data;
  } catch (error) {
    console.error('Failed to update change set template:', error);
    throw error;
  }
};

export const deleteChangeSetTemplate = async (templateId: string) => {
  try {
    await apiClient.delete(`/api/change-management/templates/${templateId}`);
  } catch (error) {
    console.error('Failed to delete change set template:', error);
    throw error;
  }
};

// Re-export from services/change-management.service
export { changeManagementService } from './services/change-management.service';
import { changeManagementService } from './services/change-management.service';
export default changeManagementService;
