/**
 * Layout Example
 * Example usage of the Navigation System
 */

import React from 'react';
import Layout from './Layout';
import { User, Notification, Tenant } from '../types/navigation';

// Example data
const exampleUser: User = {
  id: '1',
  name: 'John Doe',
  email: 'john.doe@example.com',
  role: 'Super Admin',
  avatar: undefined, // or provide an avatar URL
};

const exampleNotifications: Notification[] = [
  {
    id: '1',
    title: 'New user registered',
    message: 'A new user has registered and is waiting for approval.',
    type: 'info',
    read: false,
    timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
    link: '/users',
  },
  {
    id: '2',
    title: 'Security alert',
    message: 'Multiple failed login attempts detected from IP 192.168.1.100',
    type: 'warning',
    read: false,
    timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    link: '/security/risk-events',
  },
  {
    id: '3',
    title: 'Backup completed',
    message: 'Daily backup has been completed successfully.',
    type: 'success',
    read: true,
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
  },
];

const exampleTenants: Tenant[] = [
  { id: '1', name: 'Acme Corporation', logo: undefined },
  { id: '2', name: 'Tech Startup Inc.', logo: undefined },
  { id: '3', name: 'Global Enterprises', logo: undefined },
];

const exampleBreadcrumbLabels = {
  '/dashboard': 'Dashboard',
  '/users': 'User Management',
  '/users/invite': 'Invite New User',
  '/security': 'Security Overview',
  '/security/mfa': 'Multi-Factor Authentication',
};

// Example Component
export default function LayoutExample() {
  const handleTenantChange = (tenant: Tenant) => {
    console.log('Tenant changed to:', tenant.name);
    // Implement tenant switching logic
  };

  const handleLogout = () => {
    console.log('User logged out');
    // Implement logout logic
  };

  return (
    <Layout
      user={exampleUser}
      notifications={exampleNotifications}
      tenant={exampleTenants[0]}
      tenants={exampleTenants}
      onTenantChange={handleTenantChange}
      onLogout={handleLogout}
      breadcrumbLabels={exampleBreadcrumbLabels}
    >
      {/* Your page content goes here */}
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Welcome to your admin dashboard
          </p>
        </div>

        {/* Example Content Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Total Users
            </h3>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              1,234
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              +12% from last month
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Active Applications
            </h3>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
              56
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              8 added this week
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Security Events
            </h3>
            <p className="text-3xl font-bold text-red-600 dark:text-red-400">
              23
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              3 require attention
            </p>
          </div>
        </div>

        {/* Example Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Recent Activity
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    Alice Johnson
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                    Created new application
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                    5 minutes ago
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                      Success
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    Bob Smith
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                    Updated user permissions
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                    15 minutes ago
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                      Completed
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    Carol White
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                    Failed login attempt
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                    30 minutes ago
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
                      Failed
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}
