import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import {
  CreditCard,
  Users,
  AppWindow,
  Activity,
  HardDrive,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  ArrowUpRight,
  CheckCircle,
  AlertCircle,
  Calendar,
  Receipt,
  Package,
  Zap,
  Clock,
  Star
} from 'lucide-react';
import { useLocale } from '@/hooks/useLocale';
import { getTenantId } from '@/lib/tenant-context';
import { billingService } from '@/lib/api/services';
import Modal from '@/components/common/Modal';

interface UsageSummary {
  period: string;
  totalUsers: number;
  activeUsers: number;
  totalApplications: number;
  totalAuthEvents: number;
  totalApiCalls: number;
  storageUsedMB: number;
}

interface QuotaStatus {
  maxUsers: number;
  currentUsers: number;
  maxApplications: number;
  currentApplications: number;
  maxApiCallsPerMonth: number;
  currentApiCalls: number;
  maxStorageGB: number;
  currentStorageGB: number;
}

interface Subscription {
  planName: string;
  planTier: string;
  status: string;
  startDate: string;
  renewalDate: string;
  billingCycle: string;
  price: number;
  currency: string;
}

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

// Progress Bar Component
const ProgressBar = ({ current, max, label, color, t }: { current: number; max: number; label: string; color: string; t: any }) => {
  const percentage = max > 0 ? Math.min((current / max) * 100, 100) : 0;

  const getBarColor = () => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return color;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-2"
    >
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>
        <span className="text-sm text-slate-500 dark:text-slate-400">
          {current.toLocaleString('fa-IR')} / {max.toLocaleString('fa-IR')}
        </span>
      </div>
      <div className="relative w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, delay: 0.5 }}
          className={`absolute h-full rounded-full ${getBarColor()}`}
        />
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400 text-left">
        {percentage.toFixed(1)}% {t('tenant.billing.used')}
      </p>
    </motion.div>
  );
};

export default function TenantBillingPage() {
  const { t } = useTranslation();
  const locale = useLocale();
  const [tenantId, setTenantIdState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [usageSummary, setUsageSummary] = useState<UsageSummary | null>(null);
  const [quotaStatus, setQuotaStatus] = useState<QuotaStatus | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);

  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [targetPlan, setTargetPlan] = useState('Premium');
  const [upgradeComments, setUpgradeComments] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const contextTenantId = getTenantId();
    setTenantIdState(contextTenantId || '00000000-0000-0000-0000-000000000000');
  }, []);

  useEffect(() => {
    if (tenantId) {
      setLoading(true);
      Promise.all([
        fetchUsageSummary(),
        fetchQuotaStatus(),
        fetchSubscription()
      ]).finally(() => setLoading(false));
    }
  }, [tenantId]);

  const fetchUsageSummary = async () => {
    if (!tenantId) return;

    try {
      const data = await billingService.getBillingSummary();
      setUsageSummary(data);
    } catch (error) {
      console.error('Error fetching usage summary:', error);
    }
  };

  const fetchQuotaStatus = async () => {
    if (!tenantId) return;

    try {
      const data = await billingService.getQuotaStatus(tenantId);
      setQuotaStatus(data);
    } catch (error) {
      console.error('Error fetching quota status:', error);
    }
  };

  const fetchSubscription = async () => {
    if (!tenantId) return;

    try {
      const data = await billingService.getSubscription(tenantId);
      setSubscription(data);
    } catch (error) {
      console.error('Error fetching subscription:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      fetchUsageSummary(),
      fetchQuotaStatus(),
      fetchSubscription()
    ]);
    setRefreshing(false);
  };

  const handleRequestUpgrade = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);
    if (!tenantId) return;

    try {
      // await billingService.requestUpgrade(targetPlan, upgradeComments);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setShowUpgradeModal(false);
      setUpgradeComments('');
      setSuccess(t('tenant.billing.upgradeRequestSuccess'));
    } catch (error: any) {
      setError(error?.message || t('common.error'));
      console.error('Error requesting upgrade:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fa-IR');
  };

  const planFeatures: Record<string, string[]> = {
    Starter: [
      t('tenant.billing.planFeatures.starter.users'),
      t('tenant.billing.planFeatures.starter.apps'),
      t('tenant.billing.planFeatures.starter.apiCalls'),
      t('tenant.billing.planFeatures.starter.storage')
    ],
    Professional: [
      t('tenant.billing.planFeatures.professional.users'),
      t('tenant.billing.planFeatures.professional.apps'),
      t('tenant.billing.planFeatures.professional.apiCalls'),
      t('tenant.billing.planFeatures.professional.storage')
    ],
    Premium: [
      t('tenant.billing.planFeatures.premium.users'),
      t('tenant.billing.planFeatures.premium.apps'),
      t('tenant.billing.planFeatures.premium.apiCalls'),
      t('tenant.billing.planFeatures.premium.storage')
    ],
    Enterprise: [
      t('tenant.billing.planFeatures.enterprise.users'),
      t('tenant.billing.planFeatures.enterprise.apps'),
      t('tenant.billing.planFeatures.enterprise.apiCalls'),
      t('tenant.billing.planFeatures.enterprise.storage')
    ]
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-500 border-t-transparent"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-green-500" />
            </div>
          </div>
          <p className="text-slate-600 dark:text-slate-400 font-medium">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{t('tenant.billing.title')} | OneSign</title>
      </Helmet>

      <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 via-green-50/30 to-emerald-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 min-h-screen" dir="rtl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3"
            >
              <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl text-white">
                <CreditCard className="w-6 h-6" />
              </div>
              {t('tenant.billing.title')}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="text-slate-500 dark:text-slate-400 mt-1"
            >
              {t('tenant.billing.subtitle')}
            </motion.p>
          </div>
          <div className="flex gap-3">
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              {t('common.refresh')}
            </motion.button>
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowUpgradeModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl"
            >
              <ArrowUpRight className="w-4 h-4" />
              {t('tenant.billing.requestUpgrade')}
            </motion.button>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
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
            className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-xl flex items-center gap-2"
          >
            <CheckCircle className="w-5 h-5" />
            {success}
          </motion.div>
        )}

        {/* Subscription Card */}
        {subscription && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden"
          >
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Package className="w-5 h-5" />
                {t('tenant.billing.currentSubscription')}
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center md:text-right">
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">{t('tenant.billing.plan')}</p>
                  <div className="flex items-center gap-2 justify-center md:justify-start">
                    <Star className="w-5 h-5 text-yellow-500" />
                    <span className="text-2xl font-bold text-green-600 dark:text-green-400">{subscription.planName}</span>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{subscription.planTier}</p>
                </div>
                <div className="text-center md:text-right">
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">{t('tenant.billing.status')}</p>
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${
                    subscription.status === 'Active'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                  }`}>
                    {subscription.status === 'Active' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    {subscription.status === 'Active' ? t('tenant.billing.statusActive') : t('tenant.billing.statusInactive')}
                  </span>
                </div>
                <div className="text-center md:text-right">
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">{t('tenant.billing.price')}</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {subscription.price.toLocaleString('fa-IR')} {subscription.currency}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{subscription.billingCycle}</p>
                </div>
                <div className="text-center md:text-right">
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">{t('tenant.billing.renewalDate')}</p>
                  <div className="flex items-center gap-2 justify-center md:justify-start">
                    <Calendar className="w-5 h-5 text-slate-400" />
                    <span className="text-lg font-semibold text-slate-900 dark:text-white">
                      {formatDate(subscription.renewalDate)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Usage Summary Stats */}
        {usageSummary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard
              title={t('tenant.billing.totalUsers')}
              value={usageSummary.totalUsers}
              subtitle={t('tenant.billing.activeUsersCount', { count: usageSummary.activeUsers })}
              icon={<Users className="w-6 h-6" />}
              color="blue"
              delay={0}
            />
            <StatCard
              title={t('tenant.billing.applications')}
              value={usageSummary.totalApplications}
              icon={<AppWindow className="w-6 h-6" />}
              color="purple"
              delay={1}
            />
            <StatCard
              title={t('tenant.billing.authEvents')}
              value={usageSummary.totalAuthEvents}
              icon={<Activity className="w-6 h-6" />}
              color="green"
              delay={2}
            />
            <StatCard
              title={t('tenant.billing.apiRequests')}
              value={usageSummary.totalApiCalls}
              icon={<Zap className="w-6 h-6" />}
              color="yellow"
              delay={3}
            />
            <StatCard
              title={t('tenant.billing.storageUsed')}
              value={`${usageSummary.storageUsedMB.toFixed(0)} MB`}
              icon={<HardDrive className="w-6 h-6" />}
              color="orange"
              delay={4}
            />
            <StatCard
              title={t('tenant.billing.reportPeriod')}
              value={usageSummary.period}
              icon={<Clock className="w-6 h-6" />}
              color="cyan"
              delay={5}
            />
          </div>
        )}

        {/* Quota Status */}
        {quotaStatus && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6"
          >
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <Receipt className="w-5 h-5 text-green-600" />
              {t('tenant.billing.quotaStatus')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ProgressBar
                current={quotaStatus.currentUsers}
                max={quotaStatus.maxUsers}
                label={t('tenant.billing.users')}
                color="bg-blue-500"
                t={t}
              />
              <ProgressBar
                current={quotaStatus.currentApplications}
                max={quotaStatus.maxApplications}
                label={t('tenant.billing.applications')}
                color="bg-purple-500"
                t={t}
              />
              <ProgressBar
                current={quotaStatus.currentApiCalls}
                max={quotaStatus.maxApiCallsPerMonth}
                label={t('tenant.billing.apiRequestsMonthly')}
                color="bg-yellow-500"
                t={t}
              />
              <ProgressBar
                current={quotaStatus.currentStorageGB}
                max={quotaStatus.maxStorageGB}
                label={t('tenant.billing.storageGB')}
                color="bg-orange-500"
                t={t}
              />
            </div>
          </motion.div>
        )}

        {/* Upgrade Modal */}
        <Modal
          isOpen={showUpgradeModal}
          onClose={() => {
            setShowUpgradeModal(false);
            setUpgradeComments('');
          }}
          title={t('tenant.billing.requestPlanUpgrade')}
          size="lg"
        >
          <form onSubmit={handleRequestUpgrade} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                {t('tenant.billing.targetPlan')}
              </label>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(planFeatures).map(([plan, features]) => (
                  <div
                    key={plan}
                    onClick={() => setTargetPlan(plan)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      targetPlan === plan
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                        : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500'
                    }`}
                  >
                    <h4 className="font-bold text-slate-900 dark:text-white mb-2">{plan}</h4>
                    <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                      {features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 text-green-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                {t('tenant.billing.commentsOptional')}
              </label>
              <textarea
                value={upgradeComments}
                onChange={(e) => setUpgradeComments(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-green-500"
                placeholder={t('tenant.billing.commentsPlaceholder')}
              />
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowUpgradeModal(false);
                  setUpgradeComments('');
                }}
                className="px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50"
              >
                {submitting ? t('tenant.billing.submitting') : t('tenant.billing.submitRequest')}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </>
  );
}
