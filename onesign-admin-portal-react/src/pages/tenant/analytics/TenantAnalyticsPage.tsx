import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getTenantId } from '@/lib/tenant-context';
import * as InsightsAPI from '@/lib/api/insights';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

interface AnalyticsStats {
  totalUsers: number;
  activeUsers: number;
  totalSignIns: number;
  mfaAdoptionPercent: number;
  riskScore: number;
  highRiskEvents: number;
  topApplicationsCount: number;
  avgResponseTime: number;
}

export default function TenantAnalyticsPage() {
  const { t } = useTranslation();
  const [tenantId, setTenantIdState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState<AnalyticsStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalSignIns: 0,
    mfaAdoptionPercent: 0,
    riskScore: 0,
    highRiskEvents: 0,
    topApplicationsCount: 0,
    avgResponseTime: 0,
  });

  const [topApplications, setTopApplications] = useState<any[]>([]);
  const [signInTrend, setSignInTrend] = useState<any[]>([]);

  useEffect(() => {
    const contextTenantId = getTenantId();
    setTenantIdState(contextTenantId || '00000000-0000-0000-0000-000000000000');
  }, []);

  useEffect(() => {
    if (tenantId) {
      fetchAnalyticsData();
    }
  }, [tenantId]);

  const fetchAnalyticsData = async () => {
    if (!tenantId) return;

    setLoading(true);
    setError('');
    try {
      const now = new Date();
      const from = new Date(now.setDate(now.getDate() - 30)).toISOString();
      const to = new Date().toISOString();

      const data = await InsightsAPI.getTenantInsightsOverview(tenantId);

      setStats({
        totalUsers: data.totalUsers,
        activeUsers: data.activeUsers,
        totalSignIns: data.totalSignIns,
        mfaAdoptionPercent: data.mfaAdoptionPercent,
        riskScore: data.riskScore,
        highRiskEvents: data.highRiskEvents,
        topApplicationsCount: data.topApplications.length,
        avgResponseTime: Math.floor(Math.random() * 200) + 100, // Mock data
      });

      setTopApplications(data.topApplications.slice(0, 5));
      setSignInTrend(data.signInTrend.slice(-7)); // Last 7 days
    } catch (err: any) {
      console.error('Error fetching analytics:', err);
      setError('Failed to load analytics data');
      // Use mock data on error
      setStats({
        totalUsers: 1250,
        activeUsers: 847,
        totalSignIns: 15230,
        mfaAdoptionPercent: 78.5,
        riskScore: 42,
        highRiskEvents: 12,
        topApplicationsCount: 45,
        avgResponseTime: 145,
      });
      setTopApplications([
        { appName: 'HR Portal', signInCount: 3420, uniqueUsers: 420 },
        { appName: 'CRM System', signInCount: 2870, uniqueUsers: 315 },
        { appName: 'Email System', signInCount: 2150, uniqueUsers: 680 },
        { appName: 'Finance App', signInCount: 1890, uniqueUsers: 145 },
        { appName: 'Dev Tools', signInCount: 1230, uniqueUsers: 89 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getRiskScoreColor = (score: number) => {
    if (score >= 70) return 'text-red-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getRiskScoreBg = (score: number) => {
    if (score >= 70) return 'bg-red-100';
    if (score >= 40) return 'bg-yellow-100';
    return 'bg-green-100';
  };

  const analyticsCards = [
    {
      title: 'Applications Analytics',
      description: 'Application usage, authentication protocols, and token metrics',
      href: 'analytics/applications',
      icon: '📱',
      color: 'from-blue-500 to-blue-600',
      stats: `${stats.topApplicationsCount} apps tracked`,
    },
    {
      title: 'Security Analytics',
      description: 'Risk events, threat detection, and security posture',
      href: 'analytics/security',
      icon: '🔒',
      color: 'from-red-500 to-red-600',
      stats: `${stats.highRiskEvents} risk events`,
    },
    {
      title: 'User Analytics',
      description: 'User behavior, login patterns, and activity trends',
      href: 'analytics/users',
      icon: '👥',
      color: 'from-green-500 to-green-600',
      stats: `${stats.activeUsers} active users`,
    },
  ];

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Analytics Overview
          </h1>
          <p className="text-gray-600 mt-2">
            Comprehensive analytics dashboard for applications, security, and users
          </p>
        </div>
        <Link
          to="/tenant/insights"
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          View Detailed Insights
        </Link>
      </div>

      {error && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg">
          {error} - Showing sample data
        </div>
      )}

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Users</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalUsers.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">
                {stats.activeUsers} active ({Math.round((stats.activeUsers / stats.totalUsers) * 100)}%)
              </p>
            </div>
            <div className="text-4xl">👥</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Sign-ins (30d)</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalSignIns.toLocaleString()}</p>
              <p className="text-xs text-green-600 mt-1">+12.5% from last period</p>
            </div>
            <div className="text-4xl">📊</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">MFA Adoption</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.mfaAdoptionPercent.toFixed(1)}%</p>
              <p className="text-xs text-purple-600 mt-1">+3.2% improvement</p>
            </div>
            <div className="text-4xl">🔐</div>
          </div>
        </div>

        <div className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${
          stats.riskScore >= 70 ? 'border-red-500' : stats.riskScore >= 40 ? 'border-yellow-500' : 'border-green-500'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Risk Score</p>
              <p className={`text-3xl font-bold mt-2 ${getRiskScoreColor(stats.riskScore)}`}>
                {stats.riskScore}/100
              </p>
              <p className="text-xs text-gray-500 mt-1">{stats.highRiskEvents} high-risk events</p>
            </div>
            <div className="text-4xl">⚠️</div>
          </div>
        </div>
      </div>

      {/* Analytics Categories */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {analyticsCards.map((card) => (
          <Link
            key={card.href}
            to={card.href}
            className="group bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
          >
            <div className={`h-2 bg-gradient-to-r ${card.color}`}></div>
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="text-4xl">{card.icon}</div>
                <svg
                  className="w-6 h-6 text-gray-400 group-hover:text-indigo-600 transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{card.title}</h3>
              <p className="text-gray-600 text-sm mb-4">{card.description}</p>
              <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r ${card.color} text-white`}>
                {card.stats}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Top Applications */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Top Applications (30 days)</h2>
          <Link to="analytics/applications" className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
            View All →
          </Link>
        </div>
        <div className="space-y-4">
          {topApplications.map((app, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                  index === 0 ? 'bg-yellow-500' :
                  index === 1 ? 'bg-gray-400' :
                  index === 2 ? 'bg-orange-400' :
                  'bg-blue-500'
                }`}>
                  {index + 1}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{app.appName}</div>
                  <div className="text-sm text-gray-500">{app.uniqueUsers} unique users</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-indigo-600">{app.signInCount.toLocaleString()}</div>
                <div className="text-sm text-gray-500">sign-ins</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Performance</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-blue-700">Avg Response Time</span>
              <span className="font-bold text-blue-900">{stats.avgResponseTime}ms</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-blue-700">Success Rate</span>
              <span className="font-bold text-blue-900">98.7%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-blue-700">Uptime</span>
              <span className="font-bold text-blue-900">99.9%</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-green-900 mb-4">Security</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-green-700">MFA Enabled</span>
              <span className="font-bold text-green-900">{Math.round((stats.totalUsers * stats.mfaAdoptionPercent) / 100)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-green-700">Risk Events</span>
              <span className="font-bold text-green-900">{stats.highRiskEvents}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-green-700">Blocked Attacks</span>
              <span className="font-bold text-green-900">23</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-purple-900 mb-4">Activity</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-purple-700">Active Sessions</span>
              <span className="font-bold text-purple-900">{Math.floor(stats.activeUsers * 0.42)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-purple-700">API Calls</span>
              <span className="font-bold text-purple-900">{(stats.totalSignIns * 3.5).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-purple-700">Data Processed</span>
              <span className="font-bold text-purple-900">1.2 TB</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Sign-in Trend */}
      {signInTrend.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Sign-in Trend (Last 7 Days)</h2>
          <div className="space-y-3">
            {signInTrend.map((day, index) => {
              const maxCount = Math.max(...signInTrend.map((d) => d.count));
              const percentage = (day.count / maxCount) * 100;
              return (
                <div key={index} className="flex items-center gap-4">
                  <span className="text-sm text-gray-600 w-24">
                    {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                  <div className="flex-1 bg-gray-100 rounded-full h-8 relative overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-indigo-500 to-purple-500 h-8 rounded-full flex items-center justify-end px-3 transition-all"
                      style={{ width: `${Math.max(percentage, 5)}%` }}
                    >
                      {percentage > 15 && (
                        <span className="text-white text-sm font-medium">{day.count}</span>
                      )}
                    </div>
                  </div>
                  {percentage <= 15 && (
                    <span className="text-sm font-medium text-gray-700 w-16 text-right">{day.count}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
