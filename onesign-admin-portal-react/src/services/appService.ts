import apiClient from './apiClient';

export interface Application {
  id: string;
  name: string;
  clientId: string;
  type: 'web' | 'mobile' | 'desktop' | 'api';
  status: 'active' | 'inactive';
  createdAt: string;
  lastUsed?: string;
  description?: string;
  redirectUris?: string[];
}

export interface CreateAppDto {
  name: string;
  type: string;
  description?: string;
  redirectUris?: string[];
}

export const appService = {
  getAll: async (tenantId?: string): Promise<Application[]> => {
    const url = tenantId ? `/tenants/${tenantId}/apps` : '/apps';
    const response = await apiClient.get<Application[]>(url);
    return response.data;
  },

  getById: async (id: string): Promise<Application> => {
    const response = await apiClient.get<Application>(`/apps/${id}`);
    return response.data;
  },

  create: async (data: CreateAppDto, tenantId?: string): Promise<Application> => {
    const url = tenantId ? `/tenants/${tenantId}/apps` : '/apps';
    const response = await apiClient.post<Application>(url, data);
    return response.data;
  },

  update: async (id: string, data: Partial<Application>): Promise<Application> => {
    const response = await apiClient.put<Application>(`/apps/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/apps/${id}`);
  },

  regenerateSecret: async (id: string): Promise<{ secret: string }> => {
    const response = await apiClient.post<{ secret: string }>(`/apps/${id}/regenerate-secret`);
    return response.data;
  },
};

export default appService;
