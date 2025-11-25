import { useState, useEffect } from 'react';
import { platformService, securityService } from '@/lib/api/services';
import { Helmet } from 'react-helmet-async';

interface PlatformStats {
  totalTenants: number;
  activeTenants: number;
  totalUsers: number;
  totalApplications: number;
  activeUsers24h: number;
  apiCallsToday: number;
}

interface SystemHealth {
  status: 'healthy' | 'degraded' | 'down';
  services: {
    name: string;
    status: 'healthy' | 'degraded' | 'down';
    responseTime: number;
    uptime: number;
  }[];
  database: {
    status: 'healthy' | 'degraded' | 'down';
    connections: number;
    maxConnections: number;
  };
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  cpu: {
    usage: number;
  };
}

interface Activity {
  id: string;
  timestamp: string;
  type: string;
  description: string;
  severity: 'info' | 'warning' | 'critical';
  user?: string;
}

interface Alert {
  id: string;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  timestamp: string;
  isRead: boolean;
}

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');

    try {
      // Fetch platform statistics
      const platformStats = await platformService.getPlatformHealth();

      // Mock data for demonstration (replace with actual API calls when available)
      const mockStats: PlatformStats = {
        totalTenants: platformStats?.totalTenants || 45,
        activeTenants: platformStats?.activeTenants || 42,
        totalUsers: platformStats?.totalUsers || 1250,
        totalApplications: platformStats?.totalApplications || 380,
        activeUsers24h: platformStats?.activeUsers24h || 856,
        apiCallsToday: platformStats?.apiCallsToday || 125430,
      };

      const mockHealth: SystemHealth = {
        status: 'healthy',
        services: [
          { name: 'API Gateway', status: 'healthy', responseTime: 45, uptime: 99.9 },
          { name: 'Auth Service', status: 'healthy', responseTime: 32, uptime: 99.8 },
          { name: 'Notification Service', status: 'healthy', responseTime: 28, uptime: 99.7 },
          { name: 'Analytics Service', status: 'degraded', responseTime: 156, uptime: 98.5 },
        ],
        database: {
          status: 'healthy',
          connections: 45,
          maxConnections: 100,
        },
        memory: {
          used: 6.4,
          total: 16,
          percentage: 40,
        },
        cpu: {
          usage: 35,
        },
      };

      const mockActivities: Activity[] = [
        {
          id: '1',
          timestamp: new Date(Date.now() - 300000).toISOString(),
          type: 'Tenant Created',
          description: 'New tenant "Acme Corp" created',
          severity: 'info',
          user: 'admin@platform.com',
        },
        {
          id: '2',
          timestamp: new Date(Date.now() - 900000).toISOString(),
          type: 'Security Alert',
          description: 'Multiple failed login attempts detected',
          severity: 'warning',
          user: 'system',
        },
        {
          id: '3',
          timestamp: new Date(Date.now() - 1800000).toISOString(),
          type: 'System Update',
          description: 'Platform updated to version 2.5.1',
          severity: 'info',
          user: 'system',
        },
        {
          id: '4',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          type: 'User Management',
          description: 'Admin role assigned to user john.doe@example.com',
          severity: 'info',
          user: 'admin@platform.com',
        },
      ];

      const mockAlerts: Alert[] = [
        {
          id: '1',
          title: 'High CPU Usage',
          message: 'Database server CPU usage exceeded 80% threshold',
          severity: 'warning',
          timestamp: new Date(Date.now() - 600000).toISOString(),
          isRead: false,
        },
        {
          id: '2',
          title: 'API Rate Limit',
          message: 'Tenant "Demo Corp" approaching API rate limit',
          severity: 'info',
          timestamp: new Date(Date.now() - 1200000).toISOString(),
          isRead: false,
        },
      ];

      setStats(mockStats);
      setHealth(mockHealth);
      setActivities(mockActivities);
      setAlerts(mockAlerts);
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Using fallback data.');

      // Fallback mock data
      setStats({
        totalTenants: 45,
        activeTenants: 42,
        totalUsers: 1250,
        totalApplications: 380,
        activeUsers24h: 856,
        apiCallsToday: 125430,
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'green';
      case 'degraded':
        return 'yellow';
      case 'down':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'red';
      case 'warning':
        return 'yellow';
      case 'info':
        return 'blue';
      default:
        return 'gray';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-2 text-gray-600">Platform-wide overview and system monitoring</p>
      </div>

      {error && (
        <div className="mb-4 bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Platform Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Tenants</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.totalTenants || 0}</p>
              <p className="text-sm text-green-600 mt-1">
                {stats?.activeTenants || 0} active
              </p>
            </div>
            <div className="p-3 bg-indigo-100 rounded-full">
              <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Users</p>
              <p className="text-3xl font-bold text-gray-900">{formatNumber(stats?.totalUsers || 0)}</p>
              <p className="text-sm text-green-600 mt-1">
                {formatNumber(stats?.activeUsers24h || 0)} active today
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Applications</p>
              <p className="text-3xl font-bold text-gray-900">{formatNumber(stats?.totalApplications || 0)}</p>
              <p className="text-sm text-gray-600 mt-1">Across all tenants</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">API Calls Today</p>
              <p className="text-3xl font-bold text-gray-900">{formatNumber(stats?.apiCallsToday || 0)}</p>
              <p className="text-sm text-gray-600 mt-1">All endpoints</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">System Status</p>
              <p className="text-2xl font-bold text-green-600 capitalize">{health?.status || 'Unknown'}</p>
              <p className="text-sm text-gray-600 mt-1">All systems operational</p>
            </div>
            <div className={`p-3 bg-${getStatusColor(health?.status || 'gray')}-100 rounded-full`}>
              <svg className={`w-8 h-8 text-${getStatusColor(health?.status || 'gray')}-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Memory Usage</p>
              <p className="text-3xl font-bold text-gray-900">{health?.memory.percentage || 0}%</p>
              <p className="text-sm text-gray-600 mt-1">
                {health?.memory.used || 0} GB / {health?.memory.total || 0} GB
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">System Health</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {health?.services.map((service) => (
                <div key={service.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`w-3 h-3 rounded-full bg-${getStatusColor(service.status)}-500`}></span>
                    <span className="text-sm font-medium text-gray-900">{service.name}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>{service.responseTime}ms</span>
                    <span className="text-green-600">{service.uptime}% uptime</span>
                  </div>
                </div>
              ))}

              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900">Database</span>
                  <span className={`px-2 py-1 text-xs rounded bg-${getStatusColor(health?.database.status || 'gray')}-100 text-${getStatusColor(health?.database.status || 'gray')}-800`}>
                    {health?.database.status}
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  Connections: {health?.database.connections}/{health?.database.maxConnections}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Active Alerts</h2>
          </div>
          <div className="p-6">
            {alerts.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No active alerts</p>
            ) : (
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-4 rounded-lg border-l-4 border-${getSeverityColor(alert.severity)}-500 bg-${getSeverityColor(alert.severity)}-50`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-gray-900">{alert.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                        <p className="text-xs text-gray-500 mt-2">{formatDate(alert.timestamp)}</p>
                      </div>
                      <button className="text-gray-400 hover:text-gray-600">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white shadow rounded-lg mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Activities</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-4 pb-4 border-b border-gray-100 last:border-0">
                <div className={`p-2 rounded-full bg-${getSeverityColor(activity.severity)}-100`}>
                  <svg className={`w-5 h-5 text-${getSeverityColor(activity.severity)}-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-900">{activity.type}</h3>
                    <span className="text-xs text-gray-500">{formatDate(activity.timestamp)}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                  {activity.user && (
                    <p className="text-xs text-gray-500 mt-1">by {activity.user}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="text-sm font-medium text-gray-900">Create Tenant</span>
            </button>

            <button className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              <span className="text-sm font-medium text-gray-900">Add Admin</span>
            </button>

            <button className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-sm font-medium text-gray-900">View Logs</span>
            </button>

            <button className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-sm font-medium text-gray-900">Settings</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
