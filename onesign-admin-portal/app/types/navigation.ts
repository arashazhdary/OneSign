/**
 * Navigation Types
 * Type definitions for navigation system
 */

export interface MenuItem {
  id: string;
  label: string;
  icon?: string;
  href?: string;
  badge?: number | string;
  children?: MenuItem[];
  roles?: string[];
  onClick?: () => void;
}

export interface Tenant {
  id: string;
  name: string;
  logo?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  read: boolean;
  timestamp: Date;
  link?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}
