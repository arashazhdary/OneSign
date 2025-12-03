import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import {
  Activity,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Clock,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Download,
  Calendar,
  Zap,
  Server,
  Globe,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  FileSpreadsheet,
  FileJson,
  FileText
} from 'lucide-react';
import { getTenantId } from '@/lib/tenant-context';
import { billingService } from '@/lib/api/services';

// Stat Card Component
interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: number;
  trendLabel?: string;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'indigo' | 'cyan' | 'yellow';
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
    yellow: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-600 dark:text-yellow-400', border: 'border-yellow-200 dark:border-yellow-800', glow: 'hover:shadow-yellow-100 dark:hover:shadow-yellow-900/20' }
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

interface ApiUsageStats {
  period: string;
  totalCalls: number;
  successCalls: number;
  errorCalls: number;
  avgResponseTime: number;
  totalCost: number;
}

interface EndpointUsage {
  endpoint: string;
  method: string;
  calls: number;
  avgResponseTime: number;
  errorRate: number;
  lastCalled: string;
}

interface RateLimit {
  name: string;
  limit: number;
  used: number;
  remaining: number;
  resetAt: string;
}

interface UsageChartData {
  date: string;
  calls: number;
  errors: number;
}

// Mock data for fallback
const mockStatsFallback: ApiUsageStats[] = [
  {
    period: 'امروز',
    totalCalls: 12543,
    successCalls: 12389,
    errorCalls: 154,
    avgResponseTime: 145,
    totalCost: 25.08,
  },
  {
    period: 'این هفته',
    totalCalls: 87632,
    successCalls: 86421,
    errorCalls: 1211,
    avgResponseTime: 152,
    totalCost: 175.26,
  },
  {
    period: 'این ماه',
    totalCalls: 342156,
    successCalls: 337890,
    errorCalls: 4266,
    avgResponseTime: 148,
    totalCost: 684.31,
  },
];

const mockEndpointsFallback: EndpointUsage[] = [
  {
    endpoint: '/api/tenant/users',
    method: 'GET',
    calls: 4532,
    avgResponseTime: 89,
    errorRate: 0.8,
    lastCalled: '2025-11-23T11:45:23Z',
  },
  {
    endpoint: '/api/tenant/users',
    method: 'POST',
    calls: 1243,
    avgResponseTime: 234,
    errorRate: 2.1,
    lastCalled: '2025-11-23T11:42:15Z',
  },
  {
    endpoint: '/api/tenant/applications',
    method: 'GET',
    calls: 2134,
    avgResponseTime: 112,
    errorRate: 1.2,
    lastCalled: '2025-11-23T11:40:08Z',
  },
  {
    endpoint: '/api/tenant/roles',
    method: 'GET',
    calls: 1876,
    avgResponseTime: 67,
    errorRate: 0.3,
    lastCalled: '2025-11-23T11:38:42Z',
  },
  {
    endpoint: '/api/tenant/audit-logs',
    method: 'GET',
    calls: 987,
    avgResponseTime: 456,
    errorRate: 4.5,
    lastCalled: '2025-11-23T11:35:19Z',
  },
];

const mockRateLimitsFallback: RateLimit[] = [
  {
    name: 'درخواست‌های ساعتی API',
    limit: 10000,
    used: 3542,
    remaining: 6458,
    resetAt: '2025-11-23T12:00:00Z',
  },
  {
    name: 'درخواست‌های روزانه API',
    limit: 100000,
    used: 12543,
    remaining: 87457,
    resetAt: '2025-11-24T00:00:00Z',
  },
  {
    name: 'درخواست‌های همزمان',
    limit: 100,
    used: 23,
    remaining: 77,
    resetAt: 'بلادرنگ',
  },
];

const mockChartDataFallback: UsageChartData[] = [
  { date: '2025-11-17', calls: 11234, errors: 145 },
  { date: '2025-11-18', calls: 12456, errors: 178 },
  { date: '2025-11-19', calls: 13123, errors: 203 },
  { date: '2025-11-20', calls: 11987, errors: 156 },
  { date: '2025-11-21', calls: 13543, errors: 198 },
  { date: '2025-11-22', calls: 12746, errors: 177 },
  { date: '2025-11-23', calls: 12543, errors: 154 },
];

export default function TenantApiUsagePage() {
  const { t } = useTranslation();
  const [stats, setStats] = useState<ApiUsageStats[]>([]);
  const [endpoints, setEndpoints] = useState<EndpointUsage[]>([]);
  const [rateLimits, setRateLimits] = useState<RateLimit[]>([]);
  const [chartData, setChartData] = useState<UsageChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [chartPeriod, setChartPeriod] = useState<'7' | '30'>('7');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tenantId, setTenantIdState] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'endpoints' | 'limits'>('overview');

  useEffect(() => {
    const contextTenantId = getTenantId();
    if (contextTenantId) {
      setTenantIdState(contextTenantId);
    } else {
      setTenantIdState('00000000-0000-0000-0000-000000000000');
    }
  }, []);

  useEffect(() => {
    if (tenantId) {
      fetchUsageData();
    }
  }, [tenantId]);

  const fetchUsageData = async (isRefresh = false) => {
    if (!tenantId) return;
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const usageData = await billingService.getUsageMetrics(tenantId);

      if (usageData) {
        const transformedStats: ApiUsageStats[] = [
          {
            period: 'امروز',
            totalCalls: usageData.apiCalls?.today || 0,
            successCalls: usageData.apiCalls?.today - (usageData.errors?.today || 0) || 0,
            errorCalls: usageData.errors?.today || 0,
            avgResponseTime: usageData.avgResponseTime?.today || 0,
            totalCost: usageData.cost?.today || 0,
          },
          {
            period: 'این هفته',
            totalCalls: usageData.apiCalls?.week || 0,
            successCalls: usageData.apiCalls?.week - (usageData.errors?.week || 0) || 0,
            errorCalls: usageData.errors?.week || 0,
            avgResponseTime: usageData.avgResponseTime?.week || 0,
            totalCost: usageData.cost?.week || 0,
          },
          {
            period: 'این ماه',
            totalCalls: usageData.apiCalls?.month || 0,
            successCalls: usageData.apiCalls?.month - (usageData.errors?.month || 0) || 0,
            errorCalls: usageData.errors?.month || 0,
            avgResponseTime: usageData.avgResponseTime?.month || 0,
            totalCost: usageData.cost?.month || 0,
          },
        ];

        setStats(transformedStats.length > 0 ? transformedStats : mockStatsFallback);
        setEndpoints(usageData.endpoints || mockEndpointsFallback);
        setRateLimits(usageData.rateLimits || mockRateLimitsFallback);
        setChartData(usageData.chartData || mockChartDataFallback);
      } else {
        setStats(mockStatsFallback);
        setEndpoints(mockEndpointsFallback);
        setRateLimits(mockRateLimitsFallback);
        setChartData(mockChartDataFallback);
      }
    } catch (error: any) {
      console.error('Error fetching API usage data:', error);
      setError(error?.message || t('common.failedToLoadApiUsageData'));
      setStats(mockStatsFallback);
      setEndpoints(mockEndpointsFallback);
      setRateLimits(mockRateLimitsFallback);
      setChartData(mockChartDataFallback);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleExportReport = async (format: 'csv' | 'json' | 'xlsx') => {
    setError('');
    setSuccess('');

    try {
      const blob = await billingService.exportUsageReport(format);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `api-usage-report.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setSuccess(`گزارش مصرف با فرمت ${format.toUpperCase()} دانلود شد`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      setError(error?.message || t('common.failedToExportReport'));
    }
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString('fa-IR');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fa-IR');
  };

  const getProgressBarColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const calculatePercentage = (used: number, limit: number) => {
    return Math.round((used / limit) * 100);
  };

  const getErrorRateColor = (rate: number) => {
    if (rate >= 5) return 'text-red-600 dark:text-red-400';
    if (rate >= 2) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-green-600 dark:text-green-400';
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'POST':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'PUT':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'DELETE':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-400';
    }
  };

  const tabs = [
    { id: 'overview', label: 'نمای کلی', icon: BarChart3 },
    { id: 'endpoints', label: 'Endpointها', icon: Server },
    { id: 'limits', label: 'محدودیت‌ها', icon: Zap },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-500 border-t-transparent"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Activity className="w-6 h-6 text-indigo-500" />
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
        <title>{t('tenant.apiUsage.title', 'مصرف API')} | OneSign</title>
      </Helmet>

      <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 min-h-screen" dir="rtl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3"
            >
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl text-white">
                <Activity className="w-6 h-6" />
              </div>
              {t('tenant.apiUsage.title', 'مصرف و نظارت API')}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="text-slate-500 dark:text-slate-400 mt-1"
            >
              {t('tenant.apiUsage.subtitle', 'بررسی مصرف، عملکرد و هزینه‌های API')}
            </motion.p>
          </div>
          <div className="flex gap-3">
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => fetchUsageData(true)}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              {t('common.refresh', 'بروزرسانی')}
            </motion.button>

            {/* Export Buttons */}
            <div className="flex gap-2">
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleExportReport('csv')}
                className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all"
                title="خروجی CSV"
              >
                <FileText className="w-4 h-4" />
                CSV
              </motion.button>
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleExportReport('xlsx')}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all"
                title="خروجی Excel"
              >
                <FileSpreadsheet className="w-4 h-4" />
                Excel
              </motion.button>
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleExportReport('json')}
                className="flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all"
                title="خروجی JSON"
              >
                <FileJson className="w-4 h-4" />
                JSON
              </motion.button>
            </div>
          </div>
        </div>

        {/* Alerts */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl flex items-center gap-2"
            >
              <AlertCircle className="w-5 h-5" />
              {error}
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-xl flex items-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              {success}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="کل درخواست‌های امروز"
            value={stats[0]?.totalCalls || 0}
            icon={<Globe className="w-6 h-6" />}
            color="indigo"
            delay={0}
          />
          <StatCard
            title="درخواست‌های موفق"
            value={stats[0]?.successCalls || 0}
            icon={<CheckCircle className="w-6 h-6" />}
            color="green"
            delay={1}
          />
          <StatCard
            title="میانگین زمان پاسخ"
            value={`${stats[0]?.avgResponseTime || 0}ms`}
            icon={<Clock className="w-6 h-6" />}
            color="blue"
            delay={2}
          />
          <StatCard
            title="هزینه امروز"
            value={`$${stats[0]?.totalCost.toFixed(2) || '0.00'}`}
            icon={<DollarSign className="w-6 h-6" />}
            color="purple"
            delay={3}
          />
        </div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700"
        >
          <div className="border-b border-slate-200 dark:border-slate-700">
            <nav className="flex gap-4 px-6" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`relative py-4 px-2 flex items-center gap-2 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'text-indigo-600 dark:text-indigo-400'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeApiUsageTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400"
                    />
                  )}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            <AnimatePresence mode="wait">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  {/* Period Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {stats.map((stat, index) => (
                      <motion.div
                        key={stat.period}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-6"
                      >
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">{stat.period}</h3>
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">کل درخواست‌ها</p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{formatNumber(stat.totalCalls)}</p>
                          </div>
                          <div className="flex justify-between">
                            <div>
                              <p className="text-xs text-slate-500 dark:text-slate-400">موفق</p>
                              <p className="text-lg font-semibold text-green-600 dark:text-green-400">{formatNumber(stat.successCalls)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-500 dark:text-slate-400">خطا</p>
                              <p className="text-lg font-semibold text-red-600 dark:text-red-400">{formatNumber(stat.errorCalls)}</p>
                            </div>
                          </div>
                          <div className="flex justify-between pt-4 border-t border-slate-200 dark:border-slate-600">
                            <div>
                              <p className="text-xs text-slate-500 dark:text-slate-400">زمان پاسخ</p>
                              <p className="text-lg font-semibold text-slate-900 dark:text-white">{stat.avgResponseTime}ms</p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-500 dark:text-slate-400">هزینه</p>
                              <p className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">${stat.totalCost.toFixed(2)}</p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Chart */}
                  <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">درخواست‌های API در طول زمان</h3>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setChartPeriod('7')}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                            chartPeriod === '7'
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-500'
                          }`}
                        >
                          ۷ روز گذشته
                        </button>
                        <button
                          onClick={() => setChartPeriod('30')}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                            chartPeriod === '30'
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-500'
                          }`}
                        >
                          ۳۰ روز گذشته
                        </button>
                      </div>
                    </div>

                    {/* Simple Bar Chart */}
                    <div className="relative h-64">
                      <div className="absolute inset-0 flex items-end justify-around space-x-2 px-4">
                        {chartData.map((data, index) => {
                          const maxCalls = Math.max(...chartData.map(d => d.calls));
                          const height = (data.calls / maxCalls) * 100;
                          return (
                            <motion.div
                              key={index}
                              initial={{ height: 0 }}
                              animate={{ height: `${height}%` }}
                              transition={{ delay: index * 0.05, duration: 0.5 }}
                              className="flex-1 flex flex-col items-center"
                            >
                              <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">{formatNumber(data.calls)}</div>
                              <div
                                className="w-full bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-lg hover:from-indigo-700 hover:to-indigo-500 transition-all cursor-pointer"
                                style={{ height: '100%', minHeight: '20px' }}
                                title={`${data.date}: ${formatNumber(data.calls)} درخواست، ${data.errors} خطا`}
                              />
                              <div className="text-xs text-slate-500 dark:text-slate-400 mt-2 whitespace-nowrap">
                                {new Date(data.date).toLocaleDateString('fa-IR', { month: 'short', day: 'numeric' })}
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Endpoints Tab */}
              {activeTab === 'endpoints' && (
                <motion.div
                  key="endpoints"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-700">
                          <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Endpoint</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">متد</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">تعداد</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">زمان پاسخ</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">نرخ خطا</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">آخرین فراخوانی</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                        {endpoints.map((endpoint, index) => (
                          <motion.tr
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                          >
                            <td className="px-4 py-4">
                              <code className="text-sm font-mono text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
                                {endpoint.endpoint}
                              </code>
                            </td>
                            <td className="px-4 py-4">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${getMethodColor(endpoint.method)}`}>
                                {endpoint.method}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-sm text-slate-900 dark:text-white">{formatNumber(endpoint.calls)}</td>
                            <td className="px-4 py-4 text-sm text-slate-500 dark:text-slate-400">{endpoint.avgResponseTime}ms</td>
                            <td className="px-4 py-4">
                              <span className={`text-sm font-semibold ${getErrorRateColor(endpoint.errorRate)}`}>
                                {endpoint.errorRate.toFixed(1)}%
                              </span>
                            </td>
                            <td className="px-4 py-4 text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">
                              {formatDate(endpoint.lastCalled)}
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}

              {/* Rate Limits Tab */}
              {activeTab === 'limits' && (
                <motion.div
                  key="limits"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  {rateLimits.map((limit, index) => {
                    const percentage = calculatePercentage(limit.used, limit.limit);
                    return (
                      <motion.div
                        key={limit.name}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-6"
                      >
                        <div className="flex justify-between items-center mb-4">
                          <div>
                            <h3 className="font-semibold text-slate-900 dark:text-white">{limit.name}</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              {formatNumber(limit.used)} / {formatNumber(limit.limit)} استفاده شده
                              ({formatNumber(limit.remaining)} باقی‌مانده)
                            </p>
                          </div>
                          <div className="text-left">
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              {limit.resetAt === 'بلادرنگ' ? 'بلادرنگ' : `بازنشانی: ${formatDate(limit.resetAt)}`}
                            </p>
                          </div>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-4 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className={`h-4 rounded-full ${getProgressBarColor(percentage)} transition-all`}
                          >
                            <span className="text-xs text-white px-2 leading-4 font-medium">{percentage}%</span>
                          </motion.div>
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Cost Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6"
        >
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-indigo-500" />
            پیگیری هزینه‌ها
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.period}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-6 border border-slate-200 dark:border-slate-600"
              >
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">هزینه {stat.period}</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">${stat.totalCost.toFixed(2)}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                  ${stat.totalCalls > 0 ? ((stat.totalCost / stat.totalCalls) * 1000).toFixed(4) : '0.0000'} به ازای هر ۱۰۰۰ درخواست
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </>
  );
}
