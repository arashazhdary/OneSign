'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
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

export default function UserAnalyticsDashboard() {
  const t = useTranslations();
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
    setTenantIdState(contextTenantId || '11111111-1111-1111-1111-111111111111');
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
      // Fetch users using usersService
      const usersData = await usersService.getUsers({
        tenantId,
        pageNumber: 1,
        pageSize: 1000
      });

      const users = usersData.items || [];

      // Calculate stats
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

      // Generate top users
      generateTopUsers(users);

      // Generate auth methods
      generateAuthMethods(users);

      // Generate growth data
      generateGrowthData();

      // Generate lifecycle stages
      generateLifecycleStages();

      // Generate heatmap data
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
    return <div className="p-8">Loading user analytics...</div>;
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">User Analytics Dashboard</h1>
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
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-3xl font-bold text-indigo-600 mt-2">{stats.totalUsers}</p>
            </div>
            <div className="text-indigo-500 text-3xl">👥</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Users</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{stats.activeUsers}</p>
            </div>
            <div className="text-green-500 text-3xl">✅</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Inactive Users</p>
              <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.inactiveUsers}</p>
            </div>
            <div className="text-yellow-500 text-3xl">⏸️</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Locked Users</p>
              <p className="text-3xl font-bold text-red-600 mt-2">{stats.lockedUsers}</p>
            </div>
            <div className="text-red-500 text-3xl">🔒</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">MFA Adoption</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{stats.mfaAdoptionRate}%</p>
            </div>
            <div className="text-blue-500 text-3xl">🔐</div>
          </div>
        </div>
      </div>

      {/* User Growth Chart */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">User Growth (Last 6 Months)</h3>
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
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area type="monotone" dataKey="users" stroke="#3b82f6" fillOpacity={1} fill="url(#colorUsers)" name="Total Users" />
            <Area type="monotone" dataKey="active" stroke="#22c55e" fillOpacity={1} fill="url(#colorActive)" name="Active Users" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Authentication Methods Distribution */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Authentication Methods Distribution</h3>
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
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* User Lifecycle Stages */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">User Lifecycle Stages</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={lifecycleStages} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="stage" type="category" width={120} />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#3b82f6" name="Users" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Login Activity Heatmap */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Login Activity Heatmap (by Hour and Day)</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Hour</th>
                <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700">Mon</th>
                <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700">Tue</th>
                <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700">Wed</th>
                <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700">Thu</th>
                <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700">Fri</th>
                <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700">Sat</th>
                <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700">Sun</th>
              </tr>
            </thead>
            <tbody>
              {heatmapData.map((row) => (
                <tr key={row.hour}>
                  <td className="px-4 py-2 text-sm font-medium text-gray-700">{row.hour}:00</td>
                  {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => {
                    const value = row[day as keyof HeatmapData] as number;
                    const intensity = Math.min(value / 100, 1);
                    return (
                      <td key={day} className="px-4 py-2 text-center">
                        <div
                          className="w-12 h-12 mx-auto rounded flex items-center justify-center text-xs font-semibold"
                          style={{
                            backgroundColor: `rgba(59, 130, 246, ${intensity})`,
                            color: intensity > 0.5 ? 'white' : 'black'
                          }}
                        >
                          {value}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Users by Activity */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Top Users by Activity</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Rank</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Name</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Email</th>
                <th className="px-4 py-2 text-right text-sm font-semibold text-gray-700">Activity Count</th>
                <th className="px-4 py-2 text-right text-sm font-semibold text-gray-700">Last Active</th>
              </tr>
            </thead>
            <tbody>
              {topUsers.map((user, index) => (
                <tr key={user.id} className="border-b hover:bg-gray-50">
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
                  <td className="px-4 py-3 text-sm font-medium">{user.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{user.email}</td>
                  <td className="px-4 py-3 text-sm text-right font-semibold text-indigo-600">
                    {user.activityCount}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-gray-600">
                    {new Date(user.lastActive).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
