import apiClient from '@/services/apiClient';

// Direct function exports
export const getAccessRequests = async (params?: any) => {
  try {
    const response = await apiClient.get('/api/access/requests', { params });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch access requests:', error);
    return [];
  }
};

export const getAccessRequestById = async (requestId: string) => {
  try {
    const response = await apiClient.get(`/api/access/requests/${requestId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch access request:', error);
    return null;
  }
};

export const createAccessRequest = async (data: any) => {
  try {
    const response = await apiClient.post('/api/access/requests', data);
    return response.data;
  } catch (error) {
    console.error('Failed to create access request:', error);
    throw error;
  }
};

export const approveAccessRequest = async (requestId: string) => {
  try {
    const response = await apiClient.post(`/api/access/requests/${requestId}/approve`);
    return response.data;
  } catch (error) {
    console.error('Failed to approve access request:', error);
    throw error;
  }
};

export const rejectAccessRequest = async (requestId: string, reason?: string) => {
  try {
    const response = await apiClient.post(`/api/access/requests/${requestId}/reject`, { reason });
    return response.data;
  } catch (error) {
    console.error('Failed to reject access request:', error);
    throw error;
  }
};

// Re-export from services/access.service
export { accessService } from './services/access.service';
import { accessService } from './services/access.service';
export default accessService;
