export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  permissions?: string[];
}

export interface Tenant {
  id: string;
  name: string;
  domain?: string;
  status?: 'active' | 'inactive' | 'suspended';
  createdAt?: string;
}

export interface Application {
  id: string;
  name: string;
  clientId: string;
  type: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface MenuItem {
  id: string;
  label: string;
  icon?: string;
  href?: string;
  badge?: number | string;
  children?: MenuItem[];
  requiredRole?: string[];
}

export interface ApiResponse<T = any> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
