import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
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
} from 'recharts';
import { Helmet } from 'react-helmet-async';
import {
  AppWindow,
  Activity,
  AlertTriangle,
  Ticket,
  Zap,
  Download,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Shield,
} from 'lucide-react';

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

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  delay: number;
}

const StatCard = ({ title, value, icon, color, delay }: StatCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: delay * 0.1 }}
    className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6 hover:shadow-xl transition-all duration-300"
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
      </div>
      <div className={`p-4 rounded-xl bg-gradient-to-br ${color}`}>
        {icon}
      </div>
    </div>
  </motion.div>
);

export default function TenantAnalyticsApplicationsPage() {
  const { t } = useTranslation();
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
    setTenantIdState(contextTenantId || '00000000-0000-0000-0000-000000000000');
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
      const appsData = await applicationsService.getApplications({
        page: 1,
        pageSize: 1000
      });

      const apps = appsData.items || [];

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

      generateMostUsedApps(apps);
      generateProtocols(apps);
      generateHealthStatus(apps);
      generateUsageData();
      generateTokenMetrics();
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
          status: (usage > 7000 ? 'healthy' : usage > 4000 ? 'warning' : 'critical') as "critical" | "healthy" | "warning"
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
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 p-8 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-3 text-gray-600 dark:text-gray-400"
        >
          <RefreshCw className="w-6 h-6 animate-spin" />
          <span>Loading application analytics...</span>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      <Helmet>
        <title>Application Analytics | OneSign</title>
      </Helmet>

      <div className="p-8 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
              <AppWindow className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Application Analytics
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Monitor application usage and performance</p>
            </div>
          </div>
          <div className="flex gap-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={exportData}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg"
            >
              <Download className="w-4 h-4" />
              Export Data
            </motion.button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <StatCard
            title="Total Apps"
            value={stats.totalApps}
            icon={<AppWindow className="w-6 h-6 text-white" />}
            color="from-blue-500 to-indigo-500"
            delay={0}
          />
          <StatCard
            title="Active Apps"
            value={stats.activeApps}
            icon={<CheckCircle className="w-6 h-6 text-white" />}
            color="from-green-500 to-emerald-500"
            delay={1}
          />
          <StatCard
            title="Unused Apps"
            value={stats.unusedApps}
            icon={<AlertTriangle className="w-6 h-6 text-white" />}
            color="from-yellow-500 to-orange-500"
            delay={2}
          />
          <StatCard
            title="Tokens Issued"
            value={stats.tokensIssued.toLocaleString()}
            icon={<Ticket className="w-6 h-6 text-white" />}
            color="from-cyan-500 to-blue-500"
            delay={3}
          />
          <StatCard
            title="API Calls"
            value={stats.apiCalls.toLocaleString()}
            icon={<Zap className="w-6 h-6 text-white" />}
            color="from-purple-500 to-pink-500"
            delay={4}
          />
        </div>

        {/* App Usage Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Application Usage Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={usageData}>
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
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend />
              <Area type="monotone" dataKey="usage" stroke="#3b82f6" fillOpacity={1} fill="url(#colorUsage)" name="Active Sessions" />
              <Area type="monotone" dataKey="requests" stroke="#22c55e" fillOpacity={1} fill="url(#colorRequests)" name="API Requests" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Authentication Protocols Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Authentication Protocols Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={protocols}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {protocols.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Application Health Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Application Health Status</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={healthStatus}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="status" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Legend />
                <Bar dataKey="count" name="Applications" radius={[8, 8, 0, 0]}>
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
          </motion.div>
        </div>

        {/* Token Issuance Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Token Issuance Metrics</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={tokenMetrics}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="type" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend />
              <Bar dataKey="issued" fill="#22c55e" name="Issued" radius={[4, 4, 0, 0]} />
              <Bar dataKey="refreshed" fill="#3b82f6" name="Refreshed" radius={[4, 4, 0, 0]} />
              <Bar dataKey="revoked" fill="#ef4444" name="Revoked" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Most Used Applications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Most Used Applications</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-slate-700">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Rank</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Application</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Client ID</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">Usage Count</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300">Status</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">Last Used</th>
                </tr>
              </thead>
              <tbody>
                {mostUsedApps.map((app, index) => (
                  <motion.tr
                    key={app.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + index * 0.05 }}
                    className="border-b border-gray-100 dark:border-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    <td className="px-4 py-3 text-sm">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${
                        index === 0 ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-white' :
                        index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-500 text-white' :
                        index === 2 ? 'bg-gradient-to-r from-orange-400 to-orange-500 text-white' :
                        'bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300'
                      } font-bold`}>
                        {index + 1}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{app.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 font-mono text-xs">{app.clientId}</td>
                    <td className="px-4 py-3 text-sm text-right font-semibold text-blue-600 dark:text-blue-400">
                      {app.usage.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-center">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        app.status === 'healthy' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' :
                        app.status === 'warning' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400' :
                        'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
                      }`}>
                        {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-600 dark:text-gray-400">
                      {new Date(app.lastUsed).toLocaleString()}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* API Usage Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">API Usage Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-600 dark:text-blue-400 font-semibold">Total API Calls</p>
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-300 mt-2">
                {stats.apiCalls.toLocaleString()}
              </p>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3 text-green-500" />
                <p className="text-xs text-green-600 dark:text-green-400">+12.5% from last period</p>
              </div>
            </div>
            <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 rounded-xl border border-green-200 dark:border-green-800">
              <p className="text-sm text-green-600 dark:text-green-400 font-semibold">Success Rate</p>
              <p className="text-2xl font-bold text-green-700 dark:text-green-300 mt-2">98.7%</p>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3 text-green-500" />
                <p className="text-xs text-green-600 dark:text-green-400">+0.3% improvement</p>
              </div>
            </div>
            <div className="p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/30 dark:to-yellow-800/30 rounded-xl border border-yellow-200 dark:border-yellow-800">
              <p className="text-sm text-yellow-600 dark:text-yellow-400 font-semibold">Avg Response Time</p>
              <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300 mt-2">142ms</p>
              <div className="flex items-center gap-1 mt-1">
                <Clock className="w-3 h-3 text-yellow-500" />
                <p className="text-xs text-yellow-600 dark:text-yellow-400">-8ms from last period</p>
              </div>
            </div>
            <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 rounded-xl border border-purple-200 dark:border-purple-800">
              <p className="text-sm text-purple-600 dark:text-purple-400 font-semibold">Error Rate</p>
              <p className="text-2xl font-bold text-purple-700 dark:text-purple-300 mt-2">1.3%</p>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3 text-green-500" />
                <p className="text-xs text-green-600 dark:text-green-400">-0.3% improvement</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
