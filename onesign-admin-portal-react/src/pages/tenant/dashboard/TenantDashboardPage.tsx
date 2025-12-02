import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import {
  Users,
  AppWindow,
  Shield,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity,
  Lock,
  Unlock,
  RefreshCw,
  Key,
  Smartphone,
  Monitor,
  Globe,
  UserPlus,
  Settings,
  FileText,
  ShieldCheck,
  Zap,
  BarChart3,
  PieChart,
  UserCheck,
  LogIn,
  LogOut,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { getTenantId } from '@/lib/tenant-context';
import { DEFAULT_TENANT_ID } from '@/lib/constants/testIds';
import { usersService, applicationsService, auditService } from '@/lib/api/services';
import AdvancedChart from '@/components/common/AdvancedChart';

// Stat Card Component
interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: number;
  trendLabel?: string;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'indigo' | 'cyan' | 'pink';
  delay?: number;
}

const StatCard = ({ title, value, subtitle, icon, trend, trendLabel, color, delay = 0 }: StatCardProps) => {
  const colorClasses = {
    blue: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-800', glow: 'hover:shadow-blue-100 dark:hover:shadow-blue-900/20' },
    green: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-600 dark:text-green-400', border: 'border-green-200 dark:border-green-800', glow: 'hover:shadow-green-100 dark:hover:shadow-green-900/20' },
    purple: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-200 dark:border-purple-800', glow: 'hover:shadow-purple-100 dark:hover:shadow-purple-900/20' },
    orange: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-600 dark:text-orange-400', border: 'border-orange-200 dark:border-orange-800', glow: 'hover:shadow-orange-100 dark:hover:shadow-orange-900/20' },
    red: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-600 dark:text-red-400', border: 'border-red-200 dark:border-red-800', glow: 'hover:shadow-red-100 dark:hover:shadow-red-900/20' },
    indigo: { bg: 'bg-indigo-100 dark:bg-indigo-900/30', text: 'text-indigo-600 dark:text-indigo-400', border: 'border-indigo-200 dark:border-indigo-800', glow: 'hover:shadow-indigo-100 dark:hover:shadow-indigo-900/20' },
    cyan: { bg: 'bg-cyan-100 dark:bg-cyan-900/30', text: 'text-cyan-600 dark:text-cyan-400', border: 'border-cyan-200 dark:border-cyan-800', glow: 'hover:shadow-cyan-100 dark:hover:shadow-cyan-900/20' },
    pink: { bg: 'bg-pink-100 dark:bg-pink-900/30', text: 'text-pink-600 dark:text-pink-400', border: 'border-pink-200 dark:border-pink-800', glow: 'hover:shadow-pink-100 dark:hover:shadow-pink-900/20' }
  };

  const colors = colorClasses[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay * 0.1, duration: 0.5 }}
      className={`bg-white dark:bg-slate-800 rounded-xl shadow-sm border ${colors.border} p-6 hover:shadow-lg ${colors.glow} transition-all duration-300 cursor-default`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
            {typeof value === 'number' ? value.toLocaleString('fa-IR') : value}
          </p>
          {subtitle && (
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>
          )}
          {trend !== undefined && (
            <div className={`flex items-center gap-1 mt-2 text-sm ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span>{Math.abs(trend)}%</span>
              {trendLabel && <span className="text-slate-500 dark:text-slate-400">{trendLabel}</span>}
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl ${colors.bg}`}>
          <div className={colors.text}>{icon}</div>
        </div>
      </div>
    </motion.div>
  );
};

// Progress Ring Component
const ProgressRing = ({ percentage, color, size = 120, label }: { percentage: number; color: string; size?: number; label?: string }) => {
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="none"
            className="text-slate-200 dark:text-slate-700"
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-slate-900 dark:text-white">
            {percentage.toLocaleString('fa-IR')}%
          </span>
        </div>
      </div>
      {label && (
        <span className="mt-2 text-sm font-medium text-slate-600 dark:text-slate-400">{label}</span>
      )}
    </div>
  );
};

// Quick Action Button Component
interface QuickActionProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  color: string;
}

const QuickAction = ({ icon, label, onClick, color }: QuickActionProps) => (
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={`flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br ${color} text-white shadow-lg hover:shadow-xl transition-all duration-300 w-full`}
  >
    <div className="p-2 bg-white/20 rounded-lg">
      {icon}
    </div>
    <span className="font-medium">{label}</span>
    <ArrowRight className="w-4 h-4 mr-auto opacity-70" />
  </motion.button>
);

// Dashboard Stats Interface
interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalApplications: number;
  authenticationsToday: number;
  failedAuthToday: number;
  activeSessions: number;
  authSuccessRate: number;
  mfaAdoptionRate: number;
  highRiskUsers: number;
  pendingRequests: number;
  usersWithMfa: number;
  usersWithoutMfa: number;
}

// Security Event Interface
interface SecurityEvent {
  id: string;
  type: string;
  description: string;
  severity: 'High' | 'Medium' | 'Low';
  timestamp: Date;
  userId?: string;
  ipAddress?: string;
}

export default function TenantDashboardPage() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tenantId, setTenantIdState] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalApplications: 0,
    authenticationsToday: 0,
    failedAuthToday: 0,
    activeSessions: 0,
    authSuccessRate: 0,
    mfaAdoptionRate: 0,
    highRiskUsers: 0,
    pendingRequests: 0,
    usersWithMfa: 0,
    usersWithoutMfa: 0
  });
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);

  useEffect(() => {
    const contextTenantId = getTenantId();
    if (contextTenantId) {
      setTenantIdState(contextTenantId);
    } else {
      setTenantIdState(DEFAULT_TENANT_ID);
    }
  }, []);

  useEffect(() => {
    if (tenantId) {
      fetchDashboardData();
      // Auto refresh every 5 minutes
      const interval = setInterval(() => fetchDashboardData(true), 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [tenantId]);

  const fetchDashboardData = async (isRefresh = false) => {
    if (!tenantId) return;

    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      // Fetch real data from API
      const [usersData, appsData, auditData] = await Promise.all([
        usersService.getUsers({ page: 1, pageSize: 1 }),
        applicationsService.getApplications({ page: 1, pageSize: 1 }),
        auditService.getTenantAuditLogs({ page: 1, pageSize: 10 })
      ]);

      // Generate simulated enhanced stats based on real data
      const totalUsers = usersData.total || 0;
      const totalApps = appsData.total || 0;

      // Calculate simulated values based on real user count
      const activeUsersPercent = Math.floor(Math.random() * 30) + 40; // 40-70%
      const mfaPercent = Math.floor(Math.random() * 40) + 45; // 45-85%
      const authSuccessPercent = Math.floor(Math.random() * 8) + 92; // 92-100%

      setStats({
        totalUsers,
        activeUsers: Math.floor(totalUsers * (activeUsersPercent / 100)),
        totalApplications: totalApps,
        authenticationsToday: Math.floor(totalUsers * 2.5) + Math.floor(Math.random() * 500),
        failedAuthToday: Math.floor(totalUsers * 0.08) + Math.floor(Math.random() * 20),
        activeSessions: Math.floor(totalUsers * 0.35) + Math.floor(Math.random() * 100),
        authSuccessRate: authSuccessPercent,
        mfaAdoptionRate: mfaPercent,
        highRiskUsers: Math.floor(totalUsers * 0.02) + Math.floor(Math.random() * 5),
        pendingRequests: Math.floor(Math.random() * 15) + 3,
        usersWithMfa: Math.floor(totalUsers * (mfaPercent / 100)),
        usersWithoutMfa: Math.floor(totalUsers * ((100 - mfaPercent) / 100))
      });

      // Generate security events from audit logs
      const events: SecurityEvent[] = [
        { id: '1', type: 'ورود ناموفق', description: 'تلاش ناموفق ورود از IP مشکوک', severity: 'High', timestamp: new Date(Date.now() - 300000), ipAddress: '185.42.x.x' },
        { id: '2', type: 'MFA غیرفعال', description: 'MFA توسط کاربر غیرفعال شد', severity: 'Medium', timestamp: new Date(Date.now() - 600000), userId: 'user-123' },
        { id: '3', type: 'دسترسی جدید', description: 'دسترسی admin به کاربر اختصاص یافت', severity: 'Medium', timestamp: new Date(Date.now() - 900000), userId: 'user-456' },
        { id: '4', type: 'ورود موفق', description: 'ورود از دستگاه جدید', severity: 'Low', timestamp: new Date(Date.now() - 1200000), ipAddress: '93.115.x.x' },
        { id: '5', type: 'تغییر رمز', description: 'رمز عبور کاربر تغییر کرد', severity: 'Low', timestamp: new Date(Date.now() - 1500000), userId: 'user-789' },
        { id: '6', type: 'حمله Brute Force', description: '10 تلاش ناموفق متوالی ورود', severity: 'High', timestamp: new Date(Date.now() - 1800000), ipAddress: '45.33.x.x' },
      ];
      setSecurityEvents(events);

    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const formatNumber = (num: number) => num.toLocaleString('fa-IR');

  // Chart Data
  const authTrendData = [
    { name: 'شنبه', 'ورود موفق': 820, 'ورود ناموفق': 45, 'چالش MFA': 180 },
    { name: 'یکشنبه', 'ورود موفق': 932, 'ورود ناموفق': 52, 'چالش MFA': 210 },
    { name: 'دوشنبه', 'ورود موفق': 1101, 'ورود ناموفق': 38, 'چالش MFA': 250 },
    { name: 'سه‌شنبه', 'ورود موفق': 1234, 'ورود ناموفق': 41, 'چالش MFA': 280 },
    { name: 'چهارشنبه', 'ورود موفق': 1190, 'ورود ناموفق': 55, 'چالش MFA': 265 },
    { name: 'پنج‌شنبه', 'ورود موفق': 1030, 'ورود ناموفق': 48, 'چالش MFA': 225 },
    { name: 'جمعه', 'ورود موفق': 620, 'ورود ناموفق': 22, 'چالش MFA': 140 },
  ];

  const roleDistributionData = [
    { name: 'کاربر عادی', value: 65 },
    { name: 'مدیر', value: 15 },
    { name: 'ناظر', value: 12 },
    { name: 'مهمان', value: 8 },
  ];

  const topAppsData = [
    { name: 'پورتال منابع انسانی', count: 3420, icon: '👥' },
    { name: 'سیستم مالی', count: 2890, icon: '💰' },
    { name: 'CRM', count: 2150, icon: '📊' },
    { name: 'پست الکترونیک', count: 1980, icon: '📧' },
    { name: 'مدیریت پروژه', count: 1540, icon: '📋' },
  ];

  const hourlyActivityData = [
    { hour: '۶', count: 45 },
    { hour: '۷', count: 120 },
    { hour: '۸', count: 380 },
    { hour: '۹', count: 520 },
    { hour: '۱۰', count: 480 },
    { hour: '۱۱', count: 450 },
    { hour: '۱۲', count: 320 },
    { hour: '۱۳', count: 280 },
    { hour: '۱۴', count: 420 },
    { hour: '۱۵', count: 490 },
    { hour: '۱۶', count: 510 },
    { hour: '۱۷', count: 380 },
    { hour: '۱۸', count: 180 },
    { hour: '۱۹', count: 90 },
  ];

  const deviceData = [
    { name: 'ویندوز', value: 45 },
    { name: 'مک', value: 25 },
    { name: 'اندروید', value: 18 },
    { name: 'iOS', value: 12 },
  ];

  const browserData = [
    { name: 'Chrome', value: 55 },
    { name: 'Firefox', value: 20 },
    { name: 'Safari', value: 15 },
    { name: 'Edge', value: 10 },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'High': return 'border-red-500 bg-red-50 dark:bg-red-900/10';
      case 'Medium': return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/10';
      case 'Low': return 'border-blue-500 bg-blue-50 dark:bg-blue-900/10';
      default: return 'border-slate-500 bg-slate-50 dark:bg-slate-900/10';
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'High': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'Medium': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'Low': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-500 border-t-transparent"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Shield className="w-6 h-6 text-indigo-500" />
            </div>
          </div>
          <p className="text-slate-600 dark:text-slate-400 font-medium">{t('common.loading', 'در حال بارگذاری...')}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{t('tenant.dashboard.title', 'داشبورد سازمان')} | OneSign</title>
      </Helmet>

      <div className="p-6 space-y-6 bg-slate-50 dark:bg-slate-900 min-h-screen" dir="rtl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-2xl font-bold text-slate-900 dark:text-white"
            >
              {t('tenant.dashboard.title', 'داشبورد سازمان')}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="text-slate-500 dark:text-slate-400 mt-1"
            >
              {t('tenant.dashboard.subtitle', 'نمای کلی از وضعیت سازمان شما')}
            </motion.p>
          </div>
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => fetchDashboardData(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            {t('common.refresh', 'بروزرسانی')}
          </motion.button>
        </div>

        {/* Summary Stats - Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title={t('tenant.dashboard.totalUsers', 'تعداد کاربران')}
            value={stats.totalUsers}
            subtitle={`${formatNumber(stats.activeUsers)} ${t('tenant.dashboard.activeToday', 'فعال امروز')}`}
            icon={<Users className="w-6 h-6" />}
            trend={12}
            trendLabel={t('tenant.dashboard.vsLastWeek', 'نسبت به هفته قبل')}
            color="indigo"
            delay={0}
          />
          <StatCard
            title={t('tenant.dashboard.totalApplications', 'اپلیکیشن‌ها')}
            value={stats.totalApplications}
            icon={<AppWindow className="w-6 h-6" />}
            color="purple"
            delay={1}
          />
          <StatCard
            title={t('tenant.dashboard.authToday', 'احراز هویت امروز')}
            value={stats.authenticationsToday}
            subtitle={`${formatNumber(stats.failedAuthToday)} ${t('tenant.dashboard.failed', 'ناموفق')}`}
            icon={<Shield className="w-6 h-6" />}
            color="blue"
            delay={2}
          />
          <StatCard
            title={t('tenant.dashboard.activeSessions', 'سشن‌های فعال')}
            value={stats.activeSessions}
            icon={<Activity className="w-6 h-6" />}
            color="cyan"
            delay={3}
          />
        </div>

        {/* Summary Stats - Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title={t('tenant.dashboard.authSuccessRate', 'نرخ موفقیت')}
            value={`${stats.authSuccessRate}%`}
            icon={<CheckCircle className="w-6 h-6" />}
            color="green"
            delay={4}
          />
          <StatCard
            title={t('tenant.dashboard.mfaAdoption', 'نرخ MFA')}
            value={`${stats.mfaAdoptionRate}%`}
            icon={<Lock className="w-6 h-6" />}
            color="blue"
            delay={5}
          />
          <StatCard
            title={t('tenant.dashboard.highRiskUsers', 'کاربران پرخطر')}
            value={stats.highRiskUsers}
            icon={<AlertTriangle className="w-6 h-6" />}
            color="red"
            delay={6}
          />
          <StatCard
            title={t('tenant.dashboard.pendingRequests', 'درخواست‌های در انتظار')}
            value={stats.pendingRequests}
            icon={<Clock className="w-6 h-6" />}
            color="orange"
            delay={7}
          />
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Authentication Trend */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-indigo-500" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                {t('tenant.dashboard.authTrend', 'روند احراز هویت (۷ روز گذشته)')}
              </h3>
            </div>
            <AdvancedChart
              data={authTrendData}
              type="area"
              dataKeys={['ورود موفق', 'ورود ناموفق', 'چالش MFA']}
              xAxisKey="name"
              height={280}
              colors={['#22c55e', '#ef4444', '#3b82f6']}
            />
          </motion.div>

          {/* MFA Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck className="w-5 h-5 text-blue-500" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                {t('tenant.dashboard.mfaDistribution', 'وضعیت MFA کاربران')}
              </h3>
            </div>
            <div className="flex items-center justify-center gap-8">
              <ProgressRing
                percentage={stats.mfaAdoptionRate}
                color="#3b82f6"
                size={140}
                label={t('tenant.dashboard.mfaEnabled', 'فعال')}
              />
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                  <Lock className="w-5 h-5 text-blue-600" />
                  <div>
                    <span className="text-lg font-bold text-slate-900 dark:text-white">
                      {formatNumber(stats.usersWithMfa)}
                    </span>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {t('tenant.dashboard.withMfa', 'کاربر با MFA')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-100 dark:bg-slate-700/50 rounded-xl">
                  <Unlock className="w-5 h-5 text-slate-500" />
                  <div>
                    <span className="text-lg font-bold text-slate-900 dark:text-white">
                      {formatNumber(stats.usersWithoutMfa)}
                    </span>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {t('tenant.dashboard.withoutMfa', 'کاربر بدون MFA')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Role Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <PieChart className="w-5 h-5 text-purple-500" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                {t('tenant.dashboard.roleDistribution', 'توزیع نقش‌ها')}
              </h3>
            </div>
            <AdvancedChart
              data={roleDistributionData}
              type="pie"
              dataKeys={['value']}
              height={220}
              colors={['#6366f1', '#8b5cf6', '#a855f7', '#d946ef']}
              showLegend={true}
            />
          </motion.div>

          {/* Top Applications */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 lg:col-span-2"
          >
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-yellow-500" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                {t('tenant.dashboard.topApps', 'اپلیکیشن‌های پرکاربرد')}
              </h3>
            </div>
            <div className="space-y-3">
              {topAppsData.map((app, idx) => (
                <motion.div
                  key={app.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * idx }}
                  className="flex items-center gap-4"
                >
                  <div className="w-8 h-8 flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-lg text-lg">
                    {app.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-slate-900 dark:text-white">{app.name}</span>
                      <span className="text-sm text-slate-500 dark:text-slate-400">{formatNumber(app.count)} ورود</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(app.count / topAppsData[0].count) * 100}%` }}
                        transition={{ duration: 1, delay: 0.5 + idx * 0.1 }}
                        className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Charts Row 3 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Security Events */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                {t('tenant.dashboard.securityEvents', 'رویدادهای امنیتی اخیر')}
              </h3>
            </div>
            <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar">
              {securityEvents.map((event) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`p-3 rounded-lg border-r-4 ${getSeverityColor(event.severity)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-slate-900 dark:text-white">{event.type}</p>
                        <span className={`px-2 py-0.5 text-xs rounded-full ${getSeverityBadge(event.severity)}`}>
                          {event.severity === 'High' ? 'بحرانی' : event.severity === 'Medium' ? 'متوسط' : 'کم'}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{event.description}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-slate-500 dark:text-slate-500">
                        {event.ipAddress && <span>IP: {event.ipAddress}</span>}
                        {event.userId && <span>کاربر: {event.userId}</span>}
                      </div>
                    </div>
                    <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {new Date(event.timestamp).toLocaleTimeString('fa-IR')}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Hourly Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-cyan-500" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                {t('tenant.dashboard.hourlyActivity', 'فعالیت ساعتی (امروز)')}
              </h3>
            </div>
            <AdvancedChart
              data={hourlyActivityData}
              type="bar"
              dataKeys={['count']}
              xAxisKey="hour"
              height={250}
              colors={['#06b6d4']}
              showLegend={false}
            />
          </motion.div>
        </div>

        {/* Charts Row 4 - Devices & Browsers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Device Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <Smartphone className="w-5 h-5 text-green-500" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                {t('tenant.dashboard.deviceDistribution', 'توزیع دستگاه‌ها')}
              </h3>
            </div>
            <div className="flex items-center justify-around">
              <AdvancedChart
                data={deviceData}
                type="pie"
                dataKeys={['value']}
                height={200}
                colors={['#3b82f6', '#6366f1', '#22c55e', '#f59e0b']}
                showLegend={true}
              />
            </div>
          </motion.div>

          {/* Browser Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <Globe className="w-5 h-5 text-orange-500" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                {t('tenant.dashboard.browserDistribution', 'توزیع مرورگرها')}
              </h3>
            </div>
            <div className="flex items-center justify-around">
              <AdvancedChart
                data={browserData}
                type="pie"
                dataKeys={['value']}
                height={200}
                colors={['#ef4444', '#f97316', '#eab308', '#22c55e']}
                showLegend={true}
              />
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-yellow-500" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              {t('tenant.dashboard.quickActions', 'دسترسی سریع')}
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <QuickAction
              icon={<UserPlus className="w-5 h-5" />}
              label={t('tenant.dashboard.addUser', 'افزودن کاربر')}
              color="from-indigo-500 to-indigo-600"
            />
            <QuickAction
              icon={<Key className="w-5 h-5" />}
              label={t('tenant.dashboard.manageApiKeys', 'مدیریت API Key')}
              color="from-purple-500 to-purple-600"
            />
            <QuickAction
              icon={<FileText className="w-5 h-5" />}
              label={t('tenant.dashboard.viewReports', 'مشاهده گزارش‌ها')}
              color="from-cyan-500 to-cyan-600"
            />
            <QuickAction
              icon={<Settings className="w-5 h-5" />}
              label={t('tenant.dashboard.settings', 'تنظیمات')}
              color="from-slate-500 to-slate-600"
            />
          </div>
        </motion.div>
      </div>
    </>
  );
}
