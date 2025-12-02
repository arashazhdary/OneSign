import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocale } from '@/hooks/useLocale';
import { getTenantId } from '@/lib/tenant-context';
import * as InsightsAPI from '@/lib/api/insights';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3,
  Users,
  Shield,
  AppWindow,
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  Zap,
  Lock,
  Eye,
  Server,
  Globe
} from 'lucide-react';

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

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color: string;
  trend?: { value: number; positive: boolean };
  delay: number;
}

const StatCard = ({ title, value, subtitle, icon, color, trend, delay }: StatCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: delay * 0.1 }}
    className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300"
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className={`text-3xl font-bold mt-2 ${color}`}>{typeof value === 'number' ? value.toLocaleString() : value}</p>
        {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        {trend && (
          <div className={`flex items-center gap-1 mt-2 text-sm ${trend.positive ? 'text-green-600' : 'text-red-600'}`}>
            {trend.positive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <span>{trend.positive ? '+' : ''}{trend.value}%</span>
          </div>
        )}
      </div>
      <div className={`p-4 rounded-xl ${color.replace('text-', 'bg-').replace('600', '100')}`}>
        {icon}
      </div>
    </div>
  </motion.div>
);

interface AnalyticsCategoryCardProps {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  color: string;
  stats: string;
  delay: number;
}

const AnalyticsCategoryCard = ({ title, description, href, icon, color, stats, delay }: AnalyticsCategoryCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: delay * 0.1 }}
  >
    <Link
      to={href}
      className="group block bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300"
    >
      <div className={`h-2 bg-gradient-to-r ${color}`}></div>
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-xl bg-gradient-to-r ${color}`}>
            {icon}
          </div>
          <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 text-sm mb-4">{description}</p>
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r ${color} text-white`}>
          <Activity className="w-4 h-4" />
          {stats}
        </div>
      </div>
    </Link>
  </motion.div>
);

export default function TenantAnalyticsPage() {
  const { t } = useTranslation();
  const locale = useLocale();
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

      const data = await InsightsAPI.getTenantInsightsOverview();

      setStats({
        totalUsers: data.totalUsers,
        activeUsers: data.activeUsers,
        totalSignIns: data.totalSignIns,
        mfaAdoptionPercent: data.mfaAdoptionPercent,
        riskScore: data.riskScore,
        highRiskEvents: data.highRiskEvents,
        topApplicationsCount: data.topApplications.length,
        avgResponseTime: data.avgResponseTime || 0,
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
      setSignInTrend([
        { date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), count: 2100 },
        { date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), count: 2300 },
        { date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), count: 1950 },
        { date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), count: 2400 },
        { date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), count: 2200 },
        { date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), count: 2500 },
        { date: new Date().toISOString(), count: 2180 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getRiskScoreColor = (score: number) => {
    if (score >= 70) return 'text-red-600';
    if (score >= 40) return 'text-amber-600';
    return 'text-green-600';
  };

  const analyticsCards = [
    {
      title: t('analytics.applicationsAnalytics') || 'Applications Analytics',
      description: t('analytics.applicationsDescription') || 'Application usage, authentication protocols, and token metrics',
      href: 'analytics/applications',
      icon: <AppWindow className="w-6 h-6 text-white" />,
      color: 'from-blue-500 to-blue-600',
      stats: `${stats.topApplicationsCount} ${t('analytics.appsTracked') || 'apps tracked'}`,
    },
    {
      title: t('analytics.securityAnalytics') || 'Security Analytics',
      description: t('analytics.securityDescription') || 'Risk events, threat detection, and security posture',
      href: 'analytics/security',
      icon: <Shield className="w-6 h-6 text-white" />,
      color: 'from-red-500 to-red-600',
      stats: `${stats.highRiskEvents} ${t('analytics.riskEvents') || 'risk events'}`,
    },
    {
      title: t('analytics.userAnalytics') || 'User Analytics',
      description: t('analytics.userDescription') || 'User behavior, login patterns, and activity trends',
      href: 'analytics/users',
      icon: <Users className="w-6 h-6 text-white" />,
      color: 'from-green-500 to-green-600',
      stats: `${stats.activeUsers} ${t('analytics.activeUsers') || 'active users'}`,
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-500 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8" dir={locale === 'fa' ? 'rtl' : 'ltr'}>
      <Helmet>
        <title>{t('analytics.title') || 'Analytics Overview'}</title>
      </Helmet>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8"
      >
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            {t('analytics.title') || 'Analytics Overview'}
          </h1>
          <p className="text-gray-600 mt-2">
            {t('analytics.subtitle') || 'Comprehensive analytics dashboard for applications, security, and users'}
          </p>
        </div>
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => fetchAnalyticsData()}
            className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl font-medium hover:bg-gray-50 transition-all duration-200"
          >
            <RefreshCw className="w-4 h-4" />
            {t('common.refresh') || 'Refresh'}
          </motion.button>
          <Link
            to="/tenant/insights"
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2.5 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Eye className="w-4 h-4" />
            {t('analytics.viewInsights') || 'View Detailed Insights'}
          </Link>
        </div>
      </motion.div>

      {/* Error Alert */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 bg-amber-50 border border-amber-200 text-amber-700 px-6 py-4 rounded-xl flex items-center gap-3"
          >
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <span>{error} - {t('analytics.showingSampleData') || 'Showing sample data'}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title={t('analytics.totalUsers') || 'Total Users'}
          value={stats.totalUsers}
          subtitle={`${stats.activeUsers} ${t('analytics.active') || 'active'} (${Math.round((stats.activeUsers / stats.totalUsers) * 100)}%)`}
          icon={<Users className="w-6 h-6 text-blue-600" />}
          color="text-blue-600"
          delay={0}
        />
        <StatCard
          title={t('analytics.signIns30d') || 'Sign-ins (30d)'}
          value={stats.totalSignIns}
          icon={<BarChart3 className="w-6 h-6 text-green-600" />}
          color="text-green-600"
          trend={{ value: 12.5, positive: true }}
          delay={1}
        />
        <StatCard
          title={t('analytics.mfaAdoption') || 'MFA Adoption'}
          value={`${stats.mfaAdoptionPercent.toFixed(1)}%`}
          icon={<Lock className="w-6 h-6 text-purple-600" />}
          color="text-purple-600"
          trend={{ value: 3.2, positive: true }}
          delay={2}
        />
        <StatCard
          title={t('analytics.riskScore') || 'Risk Score'}
          value={`${stats.riskScore}/100`}
          subtitle={`${stats.highRiskEvents} ${t('analytics.highRiskEvents') || 'high-risk events'}`}
          icon={<AlertTriangle className={`w-6 h-6 ${getRiskScoreColor(stats.riskScore)}`} />}
          color={getRiskScoreColor(stats.riskScore)}
          delay={3}
        />
      </div>

      {/* Analytics Categories */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {analyticsCards.map((card, index) => (
          <AnalyticsCategoryCard
            key={card.href}
            title={card.title}
            description={card.description}
            href={card.href}
            icon={card.icon}
            color={card.color}
            stats={card.stats}
            delay={4 + index}
          />
        ))}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Top Applications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-6"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">{t('analytics.topApplications') || 'Top Applications (30 days)'}</h2>
            <Link to="analytics/applications" className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center gap-1">
              {t('common.viewAll') || 'View All'}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-4">
            {topApplications.map((app, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white ${
                    index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' :
                    index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-500' :
                    index === 2 ? 'bg-gradient-to-r from-orange-400 to-orange-500' :
                    'bg-gradient-to-r from-blue-400 to-blue-500'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{app.appName}</p>
                    <p className="text-sm text-gray-500">{app.uniqueUsers} {t('analytics.uniqueUsers') || 'unique users'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-indigo-600">{app.signInCount.toLocaleString()}</p>
                  <p className="text-sm text-gray-500">{t('analytics.signIns') || 'sign-ins'}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Sign-in Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-6"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6">{t('analytics.signInTrend') || 'Sign-in Trend (Last 7 Days)'}</h2>
          <div className="space-y-4">
            {signInTrend.map((day, index) => {
              const maxCount = Math.max(...signInTrend.map((d) => d.count));
              const percentage = (day.count / maxCount) * 100;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9 + index * 0.1 }}
                  className="flex items-center gap-4"
                >
                  <span className="text-sm text-gray-600 w-20">
                    {new Date(day.date).toLocaleDateString(locale === 'fa' ? 'fa-IR' : 'en-US', { month: 'short', day: 'numeric' })}
                  </span>
                  <div className="flex-1 bg-gray-100 rounded-full h-10 relative overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.max(percentage, 5)}%` }}
                      transition={{ delay: 1 + index * 0.1, duration: 0.5 }}
                      className="bg-gradient-to-r from-indigo-500 to-purple-500 h-10 rounded-full flex items-center justify-end px-3"
                    >
                      {percentage > 20 && (
                        <span className="text-white text-sm font-medium">{day.count.toLocaleString()}</span>
                      )}
                    </motion.div>
                  </div>
                  {percentage <= 20 && (
                    <span className="text-sm font-medium text-gray-700 w-16 text-right">{day.count.toLocaleString()}</span>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-lg p-6 border border-blue-200"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-blue-900">{t('analytics.performance') || 'Performance'}</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-blue-700">{t('analytics.avgResponseTime') || 'Avg Response Time'}</span>
              <span className="font-bold text-blue-900">{stats.avgResponseTime}ms</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-blue-700">{t('analytics.successRate') || 'Success Rate'}</span>
              <span className="font-bold text-blue-900">98.7%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-blue-700">{t('analytics.uptime') || 'Uptime'}</span>
              <span className="font-bold text-blue-900">99.9%</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-lg p-6 border border-green-200"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-500 rounded-lg">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-green-900">{t('analytics.security') || 'Security'}</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-green-700">{t('analytics.mfaEnabled') || 'MFA Enabled'}</span>
              <span className="font-bold text-green-900">{Math.round((stats.totalUsers * stats.mfaAdoptionPercent) / 100)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-green-700">{t('analytics.riskEvents') || 'Risk Events'}</span>
              <span className="font-bold text-green-900">{stats.highRiskEvents}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-green-700">{t('analytics.blockedAttacks') || 'Blocked Attacks'}</span>
              <span className="font-bold text-green-900">23</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-lg p-6 border border-purple-200"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-500 rounded-lg">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-purple-900">{t('analytics.activity') || 'Activity'}</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-purple-700">{t('analytics.activeSessions') || 'Active Sessions'}</span>
              <span className="font-bold text-purple-900">{Math.floor(stats.activeUsers * 0.42)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-purple-700">{t('analytics.apiCalls') || 'API Calls'}</span>
              <span className="font-bold text-purple-900">{(stats.totalSignIns * 3.5).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-purple-700">{t('analytics.dataProcessed') || 'Data Processed'}</span>
              <span className="font-bold text-purple-900">1.2 TB</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
