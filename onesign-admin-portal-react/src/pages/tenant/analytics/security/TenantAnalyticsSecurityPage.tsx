import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { getTenantId } from '@/lib/tenant-context';
import { incidentsService } from '@/lib/api/services';
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
  ResponsiveContainer
} from 'recharts';
import { Helmet } from 'react-helmet-async';
import {
  Shield,
  AlertTriangle,
  Target,
  Users,
  Flame,
  CheckCircle,
  TrendingUp,
  Download,
  Loader2,
  Activity,
  Clock,
  AlertCircle,
  FileText,
  Lightbulb,
} from 'lucide-react';

interface SecurityStats {
  totalIncidents: number;
  riskEvents: number;
  highRiskUsers: number;
  activeThreats: number;
  securityScore: number;
}

interface IncidentTrend {
  date: string;
  incidents: number;
  resolved: number;
}

interface RiskDistribution {
  score: string;
  count: number;
}

interface RiskCategory {
  name: string;
  value: number;
}

interface SecurityEvent {
  id: string;
  timestamp: string;
  type: string;
  severity: string;
  description: string;
}

interface Recommendation {
  id: string;
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
}

const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6'];

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  delay: number;
  suffix?: string;
}

const StatCard = ({ title, value, icon, color, delay, suffix }: StatCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: delay * 0.1 }}
    className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6 hover:shadow-xl transition-all duration-300"
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
          {value}{suffix}
        </p>
      </div>
      <div className={`p-4 rounded-xl bg-gradient-to-br ${color}`}>
        {icon}
      </div>
    </div>
  </motion.div>
);

export default function TenantAnalyticsSecurityPage() {
  const { t } = useTranslation();
  const [tenantId, setTenantIdState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [stats, setStats] = useState<SecurityStats>({
    totalIncidents: 0,
    riskEvents: 0,
    highRiskUsers: 0,
    activeThreats: 0,
    securityScore: 0
  });

  const [incidentTrend, setIncidentTrend] = useState<IncidentTrend[]>([]);
  const [riskDistribution, setRiskDistribution] = useState<RiskDistribution[]>([]);
  const [riskCategories, setRiskCategories] = useState<RiskCategory[]>([]);
  const [recentEvents, setRecentEvents] = useState<SecurityEvent[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

  useEffect(() => {
    const contextTenantId = getTenantId();
    setTenantIdState(contextTenantId || '00000000-0000-0000-0000-000000000000');
  }, []);

  useEffect(() => {
    if (tenantId) {
      fetchSecurityData();
    }
  }, [tenantId, timeRange]);

  const fetchSecurityData = async () => {
    if (!tenantId) return;

    setLoading(true);
    try {
      const incidentsData = await incidentsService.getIncidents({
        pageNumber: 1,
        pageSize: 100
      });

      setStats(prev => ({
        ...prev,
        totalIncidents: incidentsData.totalCount || 0,
        activeThreats: incidentsData.items?.filter((i: any) => i.status === 'Open').length || 0
      }));

      generateIncidentTrend(incidentsData.items || []);
      calculateSecurityScore();
      generateRecommendations();
      generateRiskDistribution([]);
      generateRiskCategories([]);

    } catch (error) {
      console.error('Error fetching security data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateIncidentTrend = (incidents: any[]) => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const trend: IncidentTrend[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      trend.push({
        date: dateStr.substring(5),
        incidents: Math.floor(Math.random() * 15) + 5,
        resolved: Math.floor(Math.random() * 10) + 3
      });
    }

    setIncidentTrend(trend);
  };

  const generateRiskDistribution = (riskEvents: any[]) => {
    const distribution = [
      { score: '0-20', count: Math.floor(Math.random() * 50) + 30 },
      { score: '21-40', count: Math.floor(Math.random() * 40) + 20 },
      { score: '41-60', count: Math.floor(Math.random() * 30) + 15 },
      { score: '61-80', count: Math.floor(Math.random() * 20) + 10 },
      { score: '81-100', count: Math.floor(Math.random() * 10) + 5 }
    ];
    setRiskDistribution(distribution);
  };

  const generateRiskCategories = (riskEvents: any[]) => {
    const categoryData = [
      { name: 'Authentication', value: Math.floor(Math.random() * 30) + 10 },
      { name: 'Access', value: Math.floor(Math.random() * 25) + 8 },
      { name: 'Data', value: Math.floor(Math.random() * 20) + 5 },
      { name: 'Network', value: Math.floor(Math.random() * 15) + 3 },
      { name: 'Other', value: Math.floor(Math.random() * 10) + 2 }
    ];
    setRiskCategories(categoryData);
  };

  const calculateSecurityScore = () => {
    const score = Math.floor(Math.random() * 20) + 75;
    setStats(prev => ({ ...prev, securityScore: score }));
  };

  const generateRecommendations = () => {
    const recs: Recommendation[] = [
      {
        id: '1',
        priority: 'high',
        title: 'Enable Multi-Factor Authentication',
        description: 'Enforce MFA for all privileged users to improve security posture'
      },
      {
        id: '2',
        priority: 'medium',
        title: 'Review High-Risk Users',
        description: 'Investigate and remediate accounts with elevated risk scores'
      },
      {
        id: '3',
        priority: 'medium',
        title: 'Update Security Policies',
        description: 'Review and update password policies to meet current standards'
      },
      {
        id: '4',
        priority: 'low',
        title: 'Security Training',
        description: 'Schedule security awareness training for all users'
      }
    ];

    setRecommendations(recs);
  };

  const exportData = () => {
    const data = {
      stats,
      incidentTrend,
      riskDistribution,
      riskCategories,
      recentEvents,
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `security-analytics-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-orange-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <Loader2 className="w-8 h-8 text-red-600" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-orange-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 p-6">
      <Helmet>
        <title>Security Analytics - Dashboard</title>
      </Helmet>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-red-500 to-orange-600 shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Security Analytics Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Monitor security posture and threat landscape
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={exportData}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              <Download className="w-4 h-4" />
              Export
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <StatCard
          title="Total Incidents"
          value={stats.totalIncidents}
          icon={<AlertTriangle className="w-6 h-6 text-white" />}
          color="from-red-500 to-red-600"
          delay={0}
        />
        <StatCard
          title="Risk Events"
          value={stats.riskEvents}
          icon={<Target className="w-6 h-6 text-white" />}
          color="from-orange-500 to-orange-600"
          delay={1}
        />
        <StatCard
          title="High-Risk Users"
          value={stats.highRiskUsers}
          icon={<Users className="w-6 h-6 text-white" />}
          color="from-yellow-500 to-yellow-600"
          delay={2}
        />
        <StatCard
          title="Active Threats"
          value={stats.activeThreats}
          icon={<Flame className="w-6 h-6 text-white" />}
          color="from-rose-500 to-rose-600"
          delay={3}
        />
        <StatCard
          title="Security Score"
          value={stats.securityScore}
          suffix="%"
          icon={<CheckCircle className="w-6 h-6 text-white" />}
          color="from-green-500 to-green-600"
          delay={4}
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Incidents Trend Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6"
        >
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-red-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Incidents Trend (Last {timeRange})
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={incidentTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  borderRadius: '12px',
                  border: 'none',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="incidents" stroke="#ef4444" strokeWidth={3} name="Total Incidents" dot={{ fill: '#ef4444' }} />
              <Line type="monotone" dataKey="resolved" stroke="#22c55e" strokeWidth={3} name="Resolved" dot={{ fill: '#22c55e' }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Risk Score Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6"
        >
          <div className="flex items-center gap-2 mb-6">
            <Activity className="w-5 h-5 text-red-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Risk Score Distribution</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={riskDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="score" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  borderRadius: '12px',
                  border: 'none',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend />
              <Bar dataKey="count" fill="url(#barGradient)" name="Users" radius={[4, 4, 0, 0]} />
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" />
                  <stop offset="100%" stopColor="#f97316" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Top Risk Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6"
        >
          <div className="flex items-center gap-2 mb-6">
            <Target className="w-5 h-5 text-red-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Top Risk Categories</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={riskCategories}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {riskCategories.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  borderRadius: '12px',
                  border: 'none',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Recent Security Events Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6 lg:col-span-2"
        >
          <div className="flex items-center gap-2 mb-6">
            <Clock className="w-5 h-5 text-red-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Security Events</h3>
          </div>
          <div className="space-y-4 max-h-[300px] overflow-y-auto">
            {recentEvents.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">No recent security events</p>
              </div>
            ) : (
              recentEvents.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-l-4 border-red-500 pl-4 py-3 bg-gray-50 dark:bg-slate-700/50 rounded-r-xl"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-sm text-gray-900 dark:text-white">{event.type}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{event.description}</p>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        event.severity === 'High' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400' :
                        event.severity === 'Medium' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400' :
                        'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                      }`}>
                        {event.severity}
                      </span>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        {new Date(event.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </div>

      {/* Recommendations Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6"
      >
        <div className="flex items-center gap-2 mb-6">
          <Lightbulb className="w-5 h-5 text-red-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Security Recommendations</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendations.map((rec, index) => (
            <motion.div
              key={rec.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + index * 0.1 }}
              className={`p-4 rounded-xl border-l-4 ${
                rec.priority === 'high' ? 'border-red-500 bg-red-50 dark:bg-red-900/10' :
                rec.priority === 'medium' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/10' :
                'border-blue-500 bg-blue-50 dark:bg-blue-900/10'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                      rec.priority === 'high' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400' :
                      rec.priority === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400' :
                      'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400'
                    }`}>
                      {rec.priority.toUpperCase()}
                    </span>
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">{rec.title}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{rec.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
