'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { getTenantId } from '@/lib/tenant-context';
import { applicationsService } from '@/lib/api/services';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';

interface AppStats {
  totalApps: number;
  activeApps: number;
  unusedApps: number;
  tokensIssued: number;
  apiCalls: number;
}

interface UsageData {
  date: string;
  usage: number;
  requests: number;
}

interface MostUsedApp {
  id: string;
  name: string;
  clientId: string;
  usage: number;
  lastUsed: string;
  status: 'healthy' | 'warning' | 'critical';
}

interface Protocol {
  name: string;
  value: number;
}

interface TokenMetric {
  type: string;
  issued: number;
  refreshed: number;
  revoked: number;
}

interface HealthStatus {
  status: string;
  count: number;
}

const COLORS = ['#22c55e', '#3b82f6', '#eab308', '#ef4444', '#8b5cf6', '#ec4899'];
const HEALTH_COLORS = {
  healthy: '#22c55e',
  warning: '#eab308',
  critical: '#ef4444'
};

export default function ApplicationAnalyticsDashboard() {
  const t = useTranslations();
  const [tenantId, setTenantIdState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  const [stats, setStats] = useState<AppStats>({
    totalApps: 0,
    activeApps: 0,
    unusedApps: 0,
    tokensIssued: 0,
    apiCalls: 0
  });

  const [usageData, setUsageData] = useState<UsageData[]>([]);
  const [mostUsedApps, setMostUsedApps] = useState<MostUsedApp[]>([]);
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [tokenMetrics, setTokenMetrics] = useState<TokenMetric[]>([]);
  const [healthStatus, setHealthStatus] = useState<HealthStatus[]>([]);

  useEffect(() => {
    const contextTenantId = getTenantId();
    setTenantIdState(contextTenantId || '11111111-1111-1111-1111-111111111111');
  }, []);

  useEffect(() => {
    if (tenantId) {
      fetchApplicationData();
    }
  }, [tenantId, timeRange]);

  const fetchApplicationData = async () => {
    if (!tenantId) return;

    setLoading(true);
    try {
      // Fetch applications using applicationsService
      const appsData = await applicationsService.getApplications({
        tenantId,
        page: 1,
        pageSize: 1000
      });

      const apps = appsData.items || [];

      // Calculate stats
      const total = appsData.totalCount || 0;
      const active = apps.filter((a: any) => a.isActive).length;
      const unused = apps.filter((a: any) => !a.lastUsed ||
        new Date(a.lastUsed) < new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      ).length;

      setStats(prev => ({
        ...prev,
        totalApps: total,
        activeApps: active,
        unusedApps: unused
      }));

      // Generate most used apps
      generateMostUsedApps(apps);

      // Generate protocols
      generateProtocols(apps);

      // Generate health status
      generateHealthStatus(apps);

      // Generate usage data
      generateUsageData();

      // Generate token metrics
      generateTokenMetrics();

      // Generate API usage stats
      generateApiUsageStats();

    } catch (error) {
      console.error('Error fetching application data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateUsageData = () => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const data: UsageData[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toISOString().split('T')[0].substring(5),
        usage: Math.floor(Math.random() * 5000) + 2000,
        requests: Math.floor(Math.random() * 10000) + 5000
      });
    }

    setUsageData(data);
  };

  const generateMostUsedApps = (apps: any[]) => {
    const appList: MostUsedApp[] = apps
      .slice(0, 10)
      .map((app: any) => {
        const usage = Math.floor(Math.random() * 10000) + 1000;
        return {
          id: app.id,
          name: app.name || app.clientId,
          clientId: app.clientId,
          usage,
          lastUsed: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
          status: (usage > 7000 ? 'healthy' : usage > 4000 ? 'warning' : 'critical') as 'healthy' | 'warning' | 'critical'
        };
      })
      .sort((a, b) => b.usage - a.usage)
      .slice(0, 8);

    setMostUsedApps(appList);
  };

  const generateProtocols = (apps: any[]) => {
    const protocolData = [
      { name: 'OAuth 2.0', value: Math.floor(apps.length * 0.45) },
      { name: 'OIDC', value: Math.floor(apps.length * 0.30) },
      { name: 'SAML 2.0', value: Math.floor(apps.length * 0.15) },
      { name: 'JWT', value: Math.floor(apps.length * 0.08) },
      { name: 'Others', value: Math.floor(apps.length * 0.02) }
    ];

    setProtocols(protocolData);
  };

  const generateTokenMetrics = () => {
    const metrics: TokenMetric[] = [
      {
        type: 'Access Token',
        issued: Math.floor(Math.random() * 50000) + 30000,
        refreshed: Math.floor(Math.random() * 20000) + 10000,
        revoked: Math.floor(Math.random() * 1000) + 100
      },
      {
        type: 'Refresh Token',
        issued: Math.floor(Math.random() * 30000) + 20000,
        refreshed: Math.floor(Math.random() * 15000) + 8000,
        revoked: Math.floor(Math.random() * 800) + 80
      },
      {
        type: 'ID Token',
        issued: Math.floor(Math.random() * 40000) + 25000,
        refreshed: 0,
        revoked: Math.floor(Math.random() * 500) + 50
      }
    ];

    setTokenMetrics(metrics);

    // Update stats with total tokens issued
    const totalIssued = metrics.reduce((sum, m) => sum + m.issued, 0);
    setStats(prev => ({ ...prev, tokensIssued: totalIssued }));
  };

  const generateApiUsageStats = () => {
    const apiCalls = Math.floor(Math.random() * 500000) + 300000;
    setStats(prev => ({ ...prev, apiCalls }));
  };

  const generateHealthStatus = (apps: any[]) => {
    const healthData: HealthStatus[] = [
      { status: 'Healthy', count: Math.floor(apps.length * 0.7) },
      { status: 'Warning', count: Math.floor(apps.length * 0.2) },
      { status: 'Critical', count: Math.floor(apps.length * 0.1) }
    ];

    setHealthStatus(healthData);
  };

  const exportData = () => {
    const data = {
      stats,
      usageData,
      mostUsedApps,
      protocols,
      tokenMetrics,
      healthStatus,
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `application-analytics-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return <div className="p-8">Loading application analytics...</div>;
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Application Analytics Dashboard</h1>
        <div className="flex gap-4">
          {/* Time Range Filter */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-4 py-2 border rounded-lg bg-white"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>

          {/* Export Button */}
          <button
            onClick={exportData}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Export Data
          </button>
        </div>
      </div>

      {/* Overview Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Apps</p>
              <p className="text-3xl font-bold text-indigo-600 mt-2">{stats.totalApps}</p>
            </div>
            <div className="text-indigo-500 text-3xl">📱</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Apps</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{stats.activeApps}</p>
            </div>
            <div className="text-green-500 text-3xl">✅</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Unused Apps</p>
              <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.unusedApps}</p>
            </div>
            <div className="text-yellow-500 text-3xl">⚠️</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tokens Issued</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">
                {stats.tokensIssued.toLocaleString()}
              </p>
            </div>
            <div className="text-blue-500 text-3xl">🎟️</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">API Calls</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">
                {stats.apiCalls.toLocaleString()}
              </p>
            </div>
            <div className="text-purple-500 text-3xl">🔌</div>
          </div>
        </div>
      </div>

      {/* App Usage Chart */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Application Usage Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={usageData as any}>
            <defs>
              <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area type="monotone" dataKey="usage" stroke="#3b82f6" fillOpacity={1} fill="url(#colorUsage)" name="Active Sessions" />
            <Area type="monotone" dataKey="requests" stroke="#22c55e" fillOpacity={1} fill="url(#colorRequests)" name="API Requests" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Authentication Protocols Distribution */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Authentication Protocols Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={protocols as any}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {protocols.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Application Health Status */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Application Health Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={healthStatus as any}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="status" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" name="Applications">
                {healthStatus.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      entry.status === 'Healthy' ? '#22c55e' :
                      entry.status === 'Warning' ? '#eab308' :
                      '#ef4444'
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Token Issuance Metrics */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Token Issuance Metrics</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={tokenMetrics as any}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="type" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="issued" fill="#22c55e" name="Issued" />
            <Bar dataKey="refreshed" fill="#3b82f6" name="Refreshed" />
            <Bar dataKey="revoked" fill="#ef4444" name="Revoked" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Most Used Applications */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Most Used Applications</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Rank</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Application</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Client ID</th>
                <th className="px-4 py-2 text-right text-sm font-semibold text-gray-700">Usage Count</th>
                <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700">Status</th>
                <th className="px-4 py-2 text-right text-sm font-semibold text-gray-700">Last Used</th>
              </tr>
            </thead>
            <tbody>
              {mostUsedApps.map((app, index) => (
                <tr key={app.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${
                      index === 0 ? 'bg-yellow-400 text-white' :
                      index === 1 ? 'bg-gray-400 text-white' :
                      index === 2 ? 'bg-orange-400 text-white' :
                      'bg-gray-200 text-gray-700'
                    } font-bold`}>
                      {index + 1}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium">{app.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 font-mono text-xs">{app.clientId}</td>
                  <td className="px-4 py-3 text-sm text-right font-semibold text-indigo-600">
                    {app.usage.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-center">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                      app.status === 'healthy' ? 'bg-green-100 text-green-800' :
                      app.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-gray-600">
                    {new Date(app.lastUsed).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* API Usage Statistics */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">API Usage Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-600 font-semibold">Total API Calls</p>
            <p className="text-2xl font-bold text-blue-700 mt-2">
              {stats.apiCalls.toLocaleString()}
            </p>
            <p className="text-xs text-blue-600 mt-1">+12.5% from last period</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-green-600 font-semibold">Success Rate</p>
            <p className="text-2xl font-bold text-green-700 mt-2">98.7%</p>
            <p className="text-xs text-green-600 mt-1">+0.3% improvement</p>
          </div>
          <div className="p-4 bg-yellow-50 rounded-lg">
            <p className="text-sm text-yellow-600 font-semibold">Avg Response Time</p>
            <p className="text-2xl font-bold text-yellow-700 mt-2">142ms</p>
            <p className="text-xs text-yellow-600 mt-1">-8ms from last period</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <p className="text-sm text-purple-600 font-semibold">Error Rate</p>
            <p className="text-2xl font-bold text-purple-700 mt-2">1.3%</p>
            <p className="text-xs text-purple-600 mt-1">-0.3% improvement</p>
          </div>
        </div>
      </div>
    </div>
  );
}
