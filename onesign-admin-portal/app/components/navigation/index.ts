/**
 * Navigation System - Main Export File
 * Easy imports for all navigation components
 */

// Components
export { default as Sidebar } from '../Sidebar';
export { default as TopBar } from '../TopBar';
export { default as Layout } from '../Layout';
export { default as Breadcrumbs } from '../Breadcrumbs';
export { default as NotificationDropdown } from '../NotificationDropdown';
export { Icon } from '../Icon';

// Types
export type {
  MenuItem,
  Tenant,
  Notification,
  User,
  BreadcrumbItem,
} from '../../types/navigation';

// Configuration
export { menuItems } from '../../config/navigation';
