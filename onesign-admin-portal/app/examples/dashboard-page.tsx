/**
 * Dashboard Page Example
 * Real-world example of using the Navigation System in a Next.js page
 */

'use client';

import React from 'react';
import Layout from '../components/Layout';
import { User, Notification, Tenant } from '../types/navigation';
import { Icon } from '../components/Icon';

// Mock data - In production, fetch from API
const mockUser: User = {
  id: '1',
  name: 'Admin User',
  email: 'admin@onesign.com',
  role: 'Super Administrator',
};

const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'Security Alert',
    message: '3 failed login attempts detected from unusual location',
    type: 'warning',
    read: false,
    timestamp: new Date(Date.now() - 10 * 60 * 1000), // 10 mins ago
    link: '/security/risk-events',
  },
  {
    id: '2',
    title: 'New User Registration',
    message: '5 new users registered and pending approval',
    type: 'info',
    read: false,
    timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 mins ago
    link: '/users',
  },
  {
    id: '3',
    title: 'Backup Complete',
    message: 'System backup completed successfully',
    type: 'success',
    read: true,
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
  },
];

const mockTenants: Tenant[] = [
  { id: '1', name: 'Acme Corporation' },
  { id: '2', name: 'TechStart Inc.' },
  { id: '3', name: 'Global Systems' },
];

// Dashboard Statistics
const stats = [
  {
    id: 1,
    name: 'Total Users',
    value: '12,543',
    change: '+12.5%',
    changeType: 'positive',
    icon: 'UsersIcon',
    color: 'blue',
  },
  {
    id: 2,
    name: 'Active Applications',
    value: '89',
    change: '+5',
    changeType: 'positive',
    icon: 'RectangleStackIcon',
    color: 'green',
  },
  {
    id: 3,
    name: 'Security Events',
    value: '34',
    change: '-23%',
    changeType: 'negative',
    icon: 'ShieldCheckIcon',
    color: 'red',
  },
  {
    id: 4,
    name: 'API Calls Today',
    value: '1.2M',
    change: '+18.2%',
    changeType: 'positive',
    icon: 'CodeBracketIcon',
    color: 'purple',
  },
];

const recentActivities = [
  {
    id: 1,
    user: 'Alice Johnson',
    action: 'Created new application "Mobile App v2"',
    timestamp: '5 minutes ago',
    type: 'create',
  },
  {
    id: 2,
    user: 'Bob Smith',
    action: 'Updated security policy "MFA Requirements"',
    timestamp: '15 minutes ago',
    type: 'update',
  },
  {
    id: 3,
    user: 'Carol White',
    action: 'Deleted user account "inactive@example.com"',
    timestamp: '1 hour ago',
    type: 'delete',
  },
  {
    id: 4,
    user: 'David Brown',
    action: 'Generated API key for "Production Service"',
    timestamp: '2 hours ago',
    type: 'create',
  },
];

export default function DashboardPage() {
  const handleTenantChange = (tenant: Tenant) => {
    console.log('Switching to tenant:', tenant.name);
    // In production: Update context, refetch data, etc.
  };

  const handleLogout = () => {
    console.log('Logging out...');
    // In production: Clear session, redirect to login
    // router.push('/login');
  };

  const getStatColor = (color: string) => {
    const colors = {
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      red: 'bg-red-500',
      purple: 'bg-purple-500',
    };
    return colors[color as keyof typeof colors] || 'bg-gray-500';
  };

  const getActivityColor = (type: string) => {
    const colors = {
      create: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      update: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      delete: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Layout
      user={mockUser}
      notifications={mockNotifications}
      tenant={mockTenants[0]}
      tenants={mockTenants}
      onTenantChange={handleTenantChange}
      onLogout={handleLogout}
      breadcrumbLabels={{
        '/dashboard': 'Dashboard Overview',
      }}
    >
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Welcome back! Here's what's happening with your organization.
        </p>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.id}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.name}
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </p>
                <p
                  className={`mt-2 text-sm font-medium ${
                    stat.changeType === 'positive'
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {stat.change} from last month
                </p>
              </div>
              <div
                className={`w-12 h-12 rounded-lg ${getStatColor(
                  stat.color
                )} flex items-center justify-center`}
              >
                <Icon name={stat.icon} className="text-white" size={24} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Recent Activity
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-4 pb-4 border-b border-gray-200 dark:border-gray-700 last:border-0"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-semibold text-sm">
                      {activity.user
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {activity.user}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {activity.action}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      {activity.timestamp}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${getActivityColor(
                      activity.type
                    )}`}
                  >
                    {activity.type}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Quick Actions
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left">
                <Icon name="UsersIcon" className="text-blue-500" size={20} />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  Add New User
                </span>
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left">
                <Icon
                  name="RectangleStackIcon"
                  className="text-green-500"
                  size={20}
                />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  Create Application
                </span>
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left">
                <Icon name="KeyIcon" className="text-purple-500" size={20} />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  Generate API Key
                </span>
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left">
                <Icon
                  name="ShieldCheckIcon"
                  className="text-red-500"
                  size={20}
                />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  Security Scan
                </span>
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left">
                <Icon
                  name="DocumentCheckIcon"
                  className="text-yellow-500"
                  size={20}
                />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  View Reports
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          System Status
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800">
            <div>
              <p className="text-sm font-medium text-green-900 dark:text-green-300">
                API Services
              </p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                Operational
              </p>
            </div>
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
          </div>
          <div className="flex items-center justify-between p-4 rounded-lg bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800">
            <div>
              <p className="text-sm font-medium text-green-900 dark:text-green-300">
                Database
              </p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                Healthy
              </p>
            </div>
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
          </div>
          <div className="flex items-center justify-between p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800">
            <div>
              <p className="text-sm font-medium text-yellow-900 dark:text-yellow-300">
                Email Service
              </p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">
                Degraded
              </p>
            </div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    </Layout>
  );
}
