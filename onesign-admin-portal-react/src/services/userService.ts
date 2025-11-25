import apiClient from './apiClient';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  lastLogin?: string;
  avatar?: string;
}

export interface CreateUserDto {
  name: string;
  email: string;
  role: string;
  status: string;
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  role?: string;
  status?: string;
}

export const userService = {
  // Get all users
  getAll: async (): Promise<User[]> => {
    const response = await apiClient.get<User[]>('/users');
    return response.data;
  },

  // Get user by ID
  getById: async (id: string): Promise<User> => {
    const response = await apiClient.get<User>(`/users/${id}`);
    return response.data;
  },

  // Create user
  create: async (data: CreateUserDto): Promise<User> => {
    const response = await apiClient.post<User>('/users', data);
    return response.data;
  },

  // Update user
  update: async (id: string, data: UpdateUserDto): Promise<User> => {
    const response = await apiClient.put<User>(`/users/${id}`, data);
    return response.data;
  },

  // Delete user
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/users/${id}`);
  },

  // Bulk delete
  bulkDelete: async (ids: string[]): Promise<void> => {
    await apiClient.post('/users/bulk-delete', { ids });
  },
};

export default userService;
