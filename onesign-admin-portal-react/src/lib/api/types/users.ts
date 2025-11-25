export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName?: string;
  avatar?: string;
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  role: string;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  mfaEnabled?: boolean;
  phoneNumber?: string;
  department?: string;
  title?: string;
}

export interface UserListResponse {
  items: User[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CreateUserRequest {
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  permissions?: string[];
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  role?: string;
  permissions?: string[];
  status?: string;
}
