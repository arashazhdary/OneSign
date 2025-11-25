import apiClient from './api';
import { CreateUserInput, UpdateUserInput } from '@/utils/validation';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive' | 'suspended';
  lastLogin?: string;
  createdAt: string;
  avatar?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
  filters?: Record<string, any>;
}

class UsersApi {
  private basePath = '/users';

  async list(params?: ListParams): Promise<PaginatedResponse<User>> {
    return apiClient.get(this.basePath, { params });
  }

  async getById(id: string): Promise<User> {
    return apiClient.get(`${this.basePath}/${id}`);
  }

  async create(data: CreateUserInput): Promise<User> {
    return apiClient.post(this.basePath, data);
  }

  async update(id: string, data: UpdateUserInput): Promise<User> {
    return apiClient.put(`${this.basePath}/${id}`, data);
  }

  async delete(id: string): Promise<void> {
    return apiClient.delete(`${this.basePath}/${id}`);
  }

  async bulkDelete(ids: string[]): Promise<void> {
    return apiClient.post(`${this.basePath}/bulk-delete`, { ids });
  }

  async bulkUpdate(ids: string[], updates: UpdateUserInput): Promise<void> {
    return apiClient.post(`${this.basePath}/bulk-update`, { ids, updates });
  }

  async export(format: 'pdf' | 'excel' | 'csv', params?: ListParams): Promise<Blob> {
    return apiClient.get(`${this.basePath}/export/${format}`, {
      params,
      responseType: 'blob',
    });
  }
}

export const usersApi = new UsersApi();
