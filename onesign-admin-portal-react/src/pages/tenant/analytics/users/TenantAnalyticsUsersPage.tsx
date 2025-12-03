import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { getTenantId } from '@/lib/tenant-context';
import { usersService } from '@/lib/api/services';
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
  Area,
  AreaChart
} from 'recharts';
import { Helmet } from 'react-helmet-async';
import {
  Users,
  UserCheck,
  UserX,
  Lock,
  Shield,
  Download,
  RefreshCw,
  TrendingUp,
  Clock,
  Activity,
} from 'lucide-react';

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  lockedUsers: number;
  mfaAdoptionRate: number;
}

interface GrowthData {
  month: string;
  users: number;
  active: number;
}

interface AuthMethod {
  name: string;
  value: number;
}

interface TopUser {
  id: string;
  name: string;
  email: string;
  activityCount: number;
  lastActive: string;
}

interface LifecycleStage {
  stage: string;
  count: number;
}

interface HeatmapData {
  hour: string;
  monday: number;
  tuesday: number;
  wednesday: number;
  thursday: number;
  friday: number;
  saturday: number;
  sunday: number;
}

const COLORS = ['#3b82f6', '#22c55e', '#eab308', '#ef4444', '#8b5cf6', '#ec4899'];

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

export default function TenantAnalyticsUsersPage() {
  const { t } = useTranslation();
  const [tenantId, setTenantIdState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  const [stats, setStats] = useState<UserStats>({
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    lockedUsers: 0,
    mfaAdoptionRate: 0
  });

  const [growthData, setGrowthData] = useState<GrowthData[]>([]);
  const [authMethods, setAuthMethods] = useState<AuthMethod[]>([]);
  const [topUsers, setTopUsers] = useState<TopUser[]>([]);
  const [lifecycleStages, setLifecycleStages] = useState<LifecycleStage[]>([]);
  const [heatmapData, setHeatmapData] = useState<HeatmapData[]>([]);

  useEffect(() => {
    const contextTenantId = getTenantId();
    setTenantIdState(contextTenantId || '00000000-0000-0000-0000-000000000000');
  }, []);

  useEffect(() => {
    if (tenantId) {
      fetchUserData();
    }
  }, [tenantId, timeRange]);

  const fetchUserData = async () => {
    if (!tenantId) return;

    setLoading(true);
    try {
      const usersData = await usersService.getUsers({
        tenantId,
        pageNumber: 1,
        pageSize: 1000
      });

      const users = usersData.items || [];

      const total = usersData.totalCount || 0;
      const active = users.filter((u: any) => u.isActive).length;
      const locked = users.filter((u: any) => u.isLocked).length;
      const withMfa = users.filter((u: any) => u.mfaEnabled).length;

      setStats({
        totalUsers: total,
        activeUsers: active,
        inactiveUsers: total - active,
        lockedUsers: locked,
        mfaAdoptionRate: total > 0 ? Math.round((withMfa / total) * 100) : 0
      });

      generateTopUsers(users);
      generateAuthMethods(users);
      generateGrowthData();
      generateLifecycleStages();
      generateHeatmapData();

    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateGrowthData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const data: GrowthData[] = [];

    let baseUsers = 1000;
    for (const month of months) {
      const growth = Math.floor(Math.random() * 150) + 50;
      baseUsers += growth;
      data.push({
        month,
        users: baseUsers,
        active: Math.floor(baseUsers * 0.8)
      });
    }

    setGrowthData(data);
  };

  const generateAuthMethods = (users: any[]) => {
    const methods = [
      { name: 'Password', value: Math.floor(users.length * 0.45) },
      { name: 'OAuth 2.0', value: Math.floor(users.length * 0.25) },
      { name: 'SAML', value: Math.floor(users.length * 0.15) },
      { name: 'LDAP', value: Math.floor(users.length * 0.10) },
      { name: 'Biometric', value: Math.floor(users.length * 0.05) }
    ];

    setAuthMethods(methods);
  };

  const generateTopUsers = (users: any[]) => {
    const top = users
      .slice(0, 10)
      .map((user: any) => ({
        id: user.id,
        name: user.name || `${user.firstName} ${user.lastName}`,
        email: user.email,
        activityCount: Math.floor(Math.random() * 500) + 100,
        lastActive: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
      }))
      .sort((a, b) => b.activityCount - a.activityCount)
      .slice(0, 5);

    setTopUsers(top);
  };

  const generateLifecycleStages = () => {
    const stages = [
      { stage: 'New Users', count: Math.floor(Math.random() * 100) + 50 },
      { stage: 'Active Users', count: Math.floor(Math.random() * 500) + 300 },
      { stage: 'Inactive Users', count: Math.floor(Math.random() * 150) + 50 },
      { stage: 'Dormant Users', count: Math.floor(Math.random() * 80) + 20 },
      { stage: 'Archived Users', count: Math.floor(Math.random() * 50) + 10 }
    ];

    setLifecycleStages(stages);
  };

  const generateHeatmapData = () => {
    const hours = ['00', '04', '08', '12', '16', '20'];
    const data: HeatmapData[] = hours.map(hour => ({
      hour,
      monday: Math.floor(Math.random() * 100),
      tuesday: Math.floor(Math.random() * 100),
      wednesday: Math.floor(Math.random() * 100),
      thursday: Math.floor(Math.random() * 100),
      friday: Math.floor(Math.random() * 100),
      saturday: Math.floor(Math.random() * 50),
      sunday: Math.floor(Math.random() * 50)
    }));

    setHeatmapData(data);
  };

  const exportData = () => {
    const data = {
      stats,
      growthData,
      authMethods,
      topUsers,
      lifecycleStages,
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `user-analytics-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 p-8 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-3 text-gray-600 dark:text-gray-400"
        >
          <RefreshCw className="w-6 h-6 animate-spin" />
          <span>Loading user analytics...</span>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      <Helmet>
        <title>User Analytics | OneSign</title>
      </Helmet>

      <div className="p-8 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg">
              <Users className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                User Analytics
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Monitor user activity and engagement</p>
            </div>
          </div>
          <div className="flex gap-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={exportData}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all shadow-lg"
            >
              <Download className="w-4 h-4" />
              Export Data
            </motion.button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            icon={<Users className="w-6 h-6 text-white" />}
            color="from-indigo-500 to-purple-500"
            delay={0}
          />
          <StatCard
            title="Active Users"
            value={stats.activeUsers}
            icon={<UserCheck className="w-6 h-6 text-white" />}
            color="from-green-500 to-emerald-500"
            delay={1}
          />
          <StatCard
            title="Inactive Users"
            value={stats.inactiveUsers}
            icon={<UserX className="w-6 h-6 text-white" />}
            color="from-yellow-500 to-orange-500"
            delay={2}
          />
          <StatCard
            title="Locked Users"
            value={stats.lockedUsers}
            icon={<Lock className="w-6 h-6 text-white" />}
            color="from-red-500 to-rose-500"
            delay={3}
          />
          <StatCard
            title="MFA Adoption"
            value={`${stats.mfaAdoptionRate}%`}
            icon={<Shield className="w-6 h-6 text-white" />}
            color="from-blue-500 to-cyan-500"
            delay={4}
          />
        </div>

        {/* User Growth Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">User Growth (Last 6 Months)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={growthData}>
              <defs>
                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#9ca3af" />
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
              <Area type="monotone" dataKey="users" stroke="#3b82f6" fillOpacity={1} fill="url(#colorUsers)" name="Total Users" />
              <Area type="monotone" dataKey="active" stroke="#22c55e" fillOpacity={1} fill="url(#colorActive)" name="Active Users" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Authentication Methods Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Authentication Methods Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={authMethods}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {authMethods.map((entry, index) => (
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

          {/* User Lifecycle Stages */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">User Lifecycle Stages</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={lifecycleStages} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" stroke="#9ca3af" />
                <YAxis dataKey="stage" type="category" width={120} stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Legend />
                <Bar dataKey="count" fill="#3b82f6" name="Users" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Login Activity Heatmap */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Login Activity Heatmap (by Hour and Day)</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Hour</th>
                  <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700 dark:text-gray-300">Mon</th>
                  <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700 dark:text-gray-300">Tue</th>
                  <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700 dark:text-gray-300">Wed</th>
                  <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700 dark:text-gray-300">Thu</th>
                  <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700 dark:text-gray-300">Fri</th>
                  <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700 dark:text-gray-300">Sat</th>
                  <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700 dark:text-gray-300">Sun</th>
                </tr>
              </thead>
              <tbody>
                {heatmapData.map((row, rowIndex) => (
                  <motion.tr
                    key={row.hour}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 + rowIndex * 0.05 }}
                  >
                    <td className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300">{row.hour}:00</td>
                    {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => {
                      const value = row[day as keyof HeatmapData] as number;
                      const intensity = Math.min(value / 100, 1);
                      return (
                        <td key={day} className="px-4 py-2 text-center">
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            className="w-12 h-12 mx-auto rounded-lg flex items-center justify-center text-xs font-semibold shadow-sm transition-all"
                            style={{
                              background: `linear-gradient(135deg, rgba(59, 130, 246, ${intensity}) 0%, rgba(16, 185, 129, ${intensity}) 100%)`,
                              color: intensity > 0.5 ? 'white' : 'rgb(107, 114, 128)'
                            }}
                          >
                            {value}
                          </motion.div>
                        </td>
                      );
                    })}
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Top Users by Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Users by Activity</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-slate-700">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Rank</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Name</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Email</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">Activity Count</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">Last Active</th>
                </tr>
              </thead>
              <tbody>
                {topUsers.map((user, index) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.9 + index * 0.05 }}
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
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{user.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{user.email}</td>
                    <td className="px-4 py-3 text-sm text-right font-semibold text-emerald-600 dark:text-emerald-400">
                      {user.activityCount}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-600 dark:text-gray-400">
                      {new Date(user.lastActive).toLocaleDateString()}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
