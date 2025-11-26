import apiClient from '@/services/apiClient';

// Direct function exports
export const getSavedQueries = async (params?: any) => {
  try {
    const response = await apiClient.get('/api/hunting/queries', { params });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch saved queries:', error);
    return [];
  }
};

export const getSavedQuery = async (queryId: string) => {
  try {
    const response = await apiClient.get(`/api/hunting/queries/${queryId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch saved query:', error);
    return null;
  }
};

export const createSavedQuery = async (data: any) => {
  try {
    const response = await apiClient.post('/api/hunting/queries', data);
    return response.data;
  } catch (error) {
    console.error('Failed to create saved query:', error);
    throw error;
  }
};

export const updateSavedQuery = async (queryId: string, data: any) => {
  try {
    const response = await apiClient.put(`/api/hunting/queries/${queryId}`, data);
    return response.data;
  } catch (error) {
    console.error('Failed to update saved query:', error);
    throw error;
  }
};

export const deleteSavedQuery = async (queryId: string) => {
  try {
    await apiClient.delete(`/api/hunting/queries/${queryId}`);
  } catch (error) {
    console.error('Failed to delete saved query:', error);
    throw error;
  }
};

export const executeQuery = async (query: string) => {
  try {
    const response = await apiClient.post('/api/hunting/execute', { query });
    return response.data;
  } catch (error) {
    console.error('Failed to execute query:', error);
    throw error;
  }
};

export const getScheduledHunts = async (params?: any) => {
  try {
    const response = await apiClient.get('/api/hunting/scheduled', { params });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch scheduled hunts:', error);
    return [];
  }
};

export const getScheduledHunt = async (huntId: string) => {
  try {
    const response = await apiClient.get(`/api/hunting/scheduled/${huntId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch scheduled hunt:', error);
    return null;
  }
};

export const createScheduledHunt = async (data: any) => {
  try {
    const response = await apiClient.post('/api/hunting/scheduled', data);
    return response.data;
  } catch (error) {
    console.error('Failed to create scheduled hunt:', error);
    throw error;
  }
};

export const updateScheduledHunt = async (huntId: string, data: any) => {
  try {
    const response = await apiClient.put(`/api/hunting/scheduled/${huntId}`, data);
    return response.data;
  } catch (error) {
    console.error('Failed to update scheduled hunt:', error);
    throw error;
  }
};

export const deleteScheduledHunt = async (huntId: string) => {
  try {
    await apiClient.delete(`/api/hunting/scheduled/${huntId}`);
  } catch (error) {
    console.error('Failed to delete scheduled hunt:', error);
    throw error;
  }
};

export const getScheduledHuntRuns = async (huntId: string, params?: any) => {
  try {
    const response = await apiClient.get(`/api/hunting/scheduled/${huntId}/runs`, { params });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch scheduled hunt runs:', error);
    return [];
  }
};

// Re-export from services/hunting.service
export { huntingService } from './services/hunting.service';
import { huntingService } from './services/hunting.service';
export default huntingService;
