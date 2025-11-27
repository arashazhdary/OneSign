'use client';

/**
 * Layout with Hooks Example
 * Example usage of Layout component with custom hooks
 */

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Layout from './Layout';
import { useNavigation, useNotifications, useTenant } from '../hooks/useNavigation';
import { User, Notification, Tenant } from '../types/navigation';
import { authService } from '@/lib/api/services/auth.service';

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
  const router = useRouter();
  const pathname = usePathname();

  // Use navigation hook for theme and language management
  const navigation = useNavigation({
    initialTheme: 'light',
    initialLanguage: 'en',
    onThemeChange: (theme) => {
      // Persist theme to localStorage and update document class
      localStorage.setItem('theme', theme);
      document.documentElement.classList.toggle('dark', theme === 'dark');
    },
    onLanguageChange: (language) => {
      // Change locale by navigating to the new locale path
      const currentLocale = pathname.split('/')[1];
      const pathWithoutLocale = pathname.replace(`/${currentLocale}`, '');
      router.push(`/${language}${pathWithoutLocale || '/dashboard'}`);
    },
  });

  // Use notifications hook
  const {
    notifications,
    markAsRead,
    markAllAsRead,
    clearAll,
  } = useNotifications(initialNotifications);

  // Notification handlers
  const handleNotificationMarkAsRead = (id: string) => {
    markAsRead(id);
  };

  const handleNotificationMarkAllAsRead = () => {
    markAllAsRead();
  };

  const handleNotificationClearAll = () => {
    clearAll();
  };

  // Use tenant hook
  const {
    currentTenant,
    availableTenants,
    switchTenant,
  } = useTenant(initialTenants[0], initialTenants);

  const handleLogout = async () => {
    try {
      // Call auth service to logout
      await authService.signOut();
      // Clear tokens from localStorage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      // Redirect to login page
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      // Still redirect to login even if API call fails
      router.push('/login');
    }
  };

  const handleSearch = (query: string) => {
    if (!query.trim()) return;
    // Navigate to search results page with query parameter
    const currentLocale = pathname.split('/')[1];
    router.push(`/${currentLocale}/search?q=${encodeURIComponent(query)}`);
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
      onNotificationMarkAsRead={handleNotificationMarkAsRead}
      onNotificationMarkAllAsRead={handleNotificationMarkAllAsRead}
      onNotificationClearAll={handleNotificationClearAll}
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
