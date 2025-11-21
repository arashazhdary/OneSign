'use client';

/**
 * Layout with Hooks Example
 * Example usage of Layout component with custom hooks
 */

import React from 'react';
import Layout from './Layout';
import { useNavigation, useNotifications, useTenant } from '../hooks/useNavigation';
import { User, Notification, Tenant } from '../types/navigation';

// Mock data fetching (replace with real API calls)
const mockUser: User = {
  id: '1',
  name: 'Admin User',
  email: 'admin@example.com',
  role: 'Administrator',
};

const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'System Update',
    message: 'A new system update is available.',
    type: 'info',
    read: false,
    timestamp: new Date(),
  },
  {
    id: '2',
    title: 'Security Alert',
    message: 'Suspicious activity detected.',
    type: 'warning',
    read: false,
    timestamp: new Date(Date.now() - 3600000),
  },
];

const mockTenants: Tenant[] = [
  { id: '1', name: 'Main Organization' },
  { id: '2', name: 'Development Team' },
  { id: '3', name: 'QA Team' },
];

interface LayoutWithHooksProps {
  children: React.ReactNode;
  initialUser?: User;
  initialNotifications?: Notification[];
  initialTenants?: Tenant[];
}

export default function LayoutWithHooks({
  children,
  initialUser = mockUser,
  initialNotifications = mockNotifications,
  initialTenants = mockTenants,
}: LayoutWithHooksProps) {
  // Use navigation hook for theme and language management
  const navigation = useNavigation({
    initialTheme: 'light',
    initialLanguage: 'en',
    onThemeChange: (theme) => {
      console.log('Theme changed to:', theme);
    },
    onLanguageChange: (language) => {
      console.log('Language changed to:', language);
    },
  });

  // Use notifications hook
  const {
    notifications,
    markAsRead,
    markAllAsRead,
    clearAll,
  } = useNotifications(initialNotifications);

  // Use tenant hook
  const {
    currentTenant,
    availableTenants,
    switchTenant,
  } = useTenant(initialTenants[0], initialTenants);

  const handleLogout = () => {
    console.log('Logging out...');
    // Implement logout logic
    // Example: router.push('/login');
  };

  const handleSearch = (query: string) => {
    console.log('Searching for:', query);
    // Implement search logic
  };

  const breadcrumbLabels = {
    '/dashboard': 'Dashboard',
    '/users': 'Users',
    '/users/invite': 'Invite User',
    '/applications': 'Applications',
    '/security': 'Security Center',
  };

  return (
    <Layout
      user={initialUser}
      notifications={notifications}
      tenant={currentTenant}
      tenants={availableTenants}
      onTenantChange={switchTenant}
      onLogout={handleLogout}
      breadcrumbLabels={breadcrumbLabels}
    >
      {children}
    </Layout>
  );
}

/**
 * Usage Example in a Page Component:
 *
 * ```tsx
 * import LayoutWithHooks from '@/app/components/LayoutWithHooks';
 *
 * export default function DashboardPage() {
 *   return (
 *     <LayoutWithHooks>
 *       <div>
 *         <h1>Dashboard Content</h1>
 *         // Your page content here
 *       </div>
 *     </LayoutWithHooks>
 *   );
 * }
 * ```
 */
