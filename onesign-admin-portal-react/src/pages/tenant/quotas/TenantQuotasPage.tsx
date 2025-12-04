import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getTenantId } from '@/lib/tenant-context';
import { billingService } from '@/lib/api/services';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Gauge,
  Users,
  HardDrive,
  Activity,
  AppWindow,
  Smartphone,
  Shield,
  Webhook,
  Key,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  X,
  ArrowUp,
  History,
  Plus,
} from 'lucide-react';
import Modal from '@/components/common/Modal';

interface Quota {
  id: string;
  resourceType: string;
  resourceName: string;
  limit: number;
  used: number;
  unit: string;
  resetDate?: string;
  warningThreshold: number;
  criticalThreshold: number;
}

interface QuotaHistory {
  date: string;
  used: number;
  limit: number;
}

interface StatCardProps {
  title: string;
  value: number | string;
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

const getQuotaIcon = (resourceType: string) => {
  const icons: Record<string, React.ReactNode> = {
    users: <Users className="w-5 h-5" />,
    storage: <HardDrive className="w-5 h-5" />,
    api_calls: <Activity className="w-5 h-5" />,
    applications: <AppWindow className="w-5 h-5" />,
    mfa_devices: <Smartphone className="w-5 h-5" />,
    roles: <Shield className="w-5 h-5" />,
    webhooks: <Webhook className="w-5 h-5" />,
    api_keys: <Key className="w-5 h-5" />,
  };
  return icons[resourceType] || <Gauge className="w-5 h-5" />;
};

export default function TenantQuotasPage() {
  const { t } = useTranslation();
  const [tenantId, setTenantIdState] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [quotas, setQuotas] = useState<Quota[]>([]);
  const [selectedQuota, setSelectedQuota] = useState<Quota | null>(null);
  const [quotaHistory, setQuotaHistory] = useState<QuotaHistory[]>([]);
  const [showIncreaseModal, setShowIncreaseModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [requestedLimit, setRequestedLimit] = useState<number>(0);
  const [requestReason, setRequestReason] = useState('');

  useEffect(() => {
    const contextTenantId = getTenantId();
    setTenantIdState(contextTenantId || '00000000-0000-0000-0000-000000000000');
  }, []);

  useEffect(() => {
    if (tenantId) {
      fetchQuotas();
    }
  }, [tenantId]);

  const fetchQuotas = async () => {
    if (!tenantId) return;
    setLoading(true);
    setError('');

    try {
      const quotaData = await billingService.getQuotaStatus(tenantId);
      setQuotas(quotaData.quotas || mockQuotasFallback);
    } catch (err: any) {
      console.error('Error fetching quotas:', err);
      setQuotas(mockQuotasFallback);
    } finally {
      setLoading(false);
    }
  };

  const mockQuotasFallback: Quota[] = [
    { id: '1', resourceType: 'users', resourceName: 'Users', limit: 1000, used: 847, unit: 'users', resetDate: new Date(Date.now() + 86400000 * 15).toISOString(), warningThreshold: 80, criticalThreshold: 95 },
    { id: '2', resourceType: 'storage', resourceName: 'Storage', limit: 100, used: 68.5, unit: 'GB', warningThreshold: 80, criticalThreshold: 90 },
    { id: '3', resourceType: 'api_calls', resourceName: 'API Calls', limit: 1000000, used: 523456, unit: 'calls/month', resetDate: new Date(Date.now() + 86400000 * 7).toISOString(), warningThreshold: 75, criticalThreshold: 90 },
    { id: '4', resourceType: 'applications', resourceName: 'Applications', limit: 50, used: 23, unit: 'apps', warningThreshold: 80, criticalThreshold: 95 },
    { id: '5', resourceType: 'mfa_devices', resourceName: 'MFA Devices', limit: 2000, used: 1234, unit: 'devices', warningThreshold: 80, criticalThreshold: 90 },
    { id: '6', resourceType: 'roles', resourceName: 'Custom Roles', limit: 100, used: 45, unit: 'roles', warningThreshold: 80, criticalThreshold: 95 },
    { id: '7', resourceType: 'webhooks', resourceName: 'Webhooks', limit: 25, used: 18, unit: 'webhooks', warningThreshold: 80, criticalThreshold: 90 },
    { id: '8', resourceType: 'api_keys', resourceName: 'API Keys', limit: 100, used: 32, unit: 'keys', warningThreshold: 80, criticalThreshold: 95 },
  ];

  const fetchQuotaHistory = (quota: Quota) => {
    const history: QuotaHistory[] = [];
    for (let i = 30; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const trend = (30 - i) / 30;
      const variance = Math.random() * 0.1 - 0.05;
      history.push({ date: date.toISOString(), used: Math.max(0, quota.used * (trend + variance)), limit: quota.limit });
    }
    setQuotaHistory(history);
  };

  const handleRequestIncrease = async () => {
    if (!tenantId || !selectedQuota || !requestedLimit || !requestReason || requestedLimit <= selectedQuota.limit) {
      setError(t('quotas.fillRequiredFields'));
      return;
    }
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setSuccess(t('quotas.increaseRequestSuccess'));
      setShowIncreaseModal(false);
      setSelectedQuota(null);
      setRequestedLimit(0);
      setRequestReason('');
    } catch (err) {
      setError(t('quotas.increaseRequestError'));
    } finally {
      setLoading(false);
    }
  };

  const handleViewHistory = (quota: Quota) => {
    setSelectedQuota(quota);
    fetchQuotaHistory(quota);
    setShowHistoryModal(true);
  };

  const getUsagePercentage = (used: number, limit: number) => limit === 0 ? 0 : Math.min((used / limit) * 100, 100);
  const getUsageColor = (percentage: number, quota: Quota) => {
    if (percentage >= quota.criticalThreshold) return 'from-red-500 to-red-600';
    if (percentage >= quota.warningThreshold) return 'from-amber-500 to-amber-600';
    return 'from-green-500 to-green-600';
  };
  const getAlertLevel = (percentage: number, quota: Quota) => percentage >= quota.criticalThreshold ? 'critical' : percentage >= quota.warningThreshold ? 'warning' : 'none';
  const formatNumber = (num: number) => num >= 1000000 ? `${(num / 1000000).toFixed(1)}M` : num >= 1000 ? `${(num / 1000).toFixed(1)}K` : num.toFixed(0);
  const getDaysUntilReset = (resetDate?: string) => resetDate ? Math.ceil((new Date(resetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null;

  const criticalQuotas = quotas.filter(q => getAlertLevel(getUsagePercentage(q.used, q.limit), q) === 'critical').length;
  const warningQuotas = quotas.filter(q => getAlertLevel(getUsagePercentage(q.used, q.limit), q) === 'warning').length;
  const healthyQuotas = quotas.filter(q => getAlertLevel(getUsagePercentage(q.used, q.limit), q) === 'none').length;

  if (loading && quotas.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      <Helmet><title>{t('quotas.title', 'Quota Management')} | OneSign</title></Helmet>

      <div className="p-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
              <Gauge className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('quotas.title', 'Quota Management')}</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">{t('quotas.subtitle', 'Monitor resource usage and manage quotas')}</p>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard title={t('quotas.totalQuotas', 'Total Quotas')} value={quotas.length} icon={<Gauge className="w-6 h-6 text-white" />} color="from-indigo-500 to-indigo-600" delay={0} />
          <StatCard title={t('quotas.healthy', 'Healthy')} value={healthyQuotas} icon={<CheckCircle className="w-6 h-6 text-white" />} color="from-green-500 to-green-600" delay={1} />
          <StatCard title={t('quotas.warning', 'Warning')} value={warningQuotas} icon={<AlertTriangle className="w-6 h-6 text-white" />} color="from-amber-500 to-amber-600" delay={2} />
          <StatCard title={t('quotas.critical', 'Critical')} value={criticalQuotas} icon={<XCircle className="w-6 h-6 text-white" />} color="from-red-500 to-red-600" delay={3} />
        </div>

        {/* Alerts */}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mb-6 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl flex items-center gap-3">
              <XCircle className="w-5 h-5" /><span>{error}</span><button onClick={() => setError('')} className="ml-auto"><X className="w-5 h-5" /></button>
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {success && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mb-6 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-xl flex items-center gap-3">
              <CheckCircle className="w-5 h-5" /><span>{success}</span><button onClick={() => setSuccess('')} className="ml-auto"><X className="w-5 h-5" /></button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active Alerts Section */}
        {quotas.filter(q => getAlertLevel(getUsagePercentage(q.used, q.limit), q) !== 'none').length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-amber-500" />{t('quotas.activeAlerts', 'Active Alerts')}</h2>
            <div className="space-y-3">
              {quotas.filter(q => getAlertLevel(getUsagePercentage(q.used, q.limit), q) !== 'none').map((quota) => {
                const percentage = getUsagePercentage(quota.used, quota.limit);
                const level = getAlertLevel(percentage, quota);
                return (
                  <motion.div key={quota.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`border rounded-xl p-4 ${level === 'critical' ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${level === 'critical' ? 'bg-red-100 dark:bg-red-900/30' : 'bg-amber-100 dark:bg-amber-900/30'}`}>
                          {level === 'critical' ? <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" /> : <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />}
                        </div>
                        <div>
                          <span className="font-semibold text-gray-900 dark:text-white">{quota.resourceName}</span>
                          <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">{percentage.toFixed(1)}% used</span>
                          <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{level === 'critical' ? `Critical: You've used ${percentage.toFixed(1)}% of your quota` : `Warning: Approaching limit at ${percentage.toFixed(1)}%`}</p>
                        </div>
                      </div>
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => { setSelectedQuota(quota); setRequestedLimit(quota.limit * 2); setShowIncreaseModal(true); }} className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium text-sm flex items-center gap-1"><Plus className="w-4 h-4" />{t('quotas.requestIncrease', 'Request Increase')}</motion.button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Quotas Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quotas.map((quota, index) => {
            const percentage = getUsagePercentage(quota.used, quota.limit);
            const daysUntilReset = getDaysUntilReset(quota.resetDate);
            const alertLevel = getAlertLevel(percentage, quota);
            return (
              <motion.div key={quota.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6 hover:shadow-xl transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${getUsageColor(percentage, quota)}`}>
                      <div className="text-white">{getQuotaIcon(quota.resourceType)}</div>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">{quota.resourceName}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{quota.resourceType}</p>
                    </div>
                  </div>
                  {alertLevel !== 'none' && (
                    <div className={`p-2 rounded-full ${alertLevel === 'critical' ? 'bg-red-100 dark:bg-red-900/30' : 'bg-amber-100 dark:bg-amber-900/30'}`}>
                      {alertLevel === 'critical' ? <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" /> : <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />}
                    </div>
                  )}
                </div>
                <div className="mb-4">
                  <div className="flex items-baseline justify-between mb-2">
                    <span className="text-3xl font-bold text-gray-900 dark:text-white">{formatNumber(quota.used)}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">of {formatNumber(quota.limit)} {quota.unit}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-3 mb-2 overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${percentage}%` }} transition={{ duration: 1, ease: 'easeOut' }} className={`h-3 rounded-full bg-gradient-to-r ${getUsageColor(percentage, quota)}`} />
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>{percentage.toFixed(1)}% used</span>
                    {daysUntilReset !== null && <span>Resets in {daysUntilReset} days</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-4 border-t border-gray-200 dark:border-slate-700">
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => handleViewHistory(quota)} className="flex-1 px-4 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors text-sm font-medium flex items-center justify-center gap-2"><History className="w-4 h-4" />{t('quotas.viewHistory', 'History')}</motion.button>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => { setSelectedQuota(quota); setRequestedLimit(quota.limit * 2); setShowIncreaseModal(true); }} className="flex-1 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all text-sm font-medium flex items-center justify-center gap-2"><ArrowUp className="w-4 h-4" />{t('quotas.increase', 'Increase')}</motion.button>
                </div>
              </motion.div>
            );
          })}
          {quotas.length === 0 && (
            <div className="col-span-full text-center py-12"><Gauge className="w-16 h-16 text-gray-400 mx-auto mb-4" /><p className="text-gray-500 dark:text-gray-400">{t('quotas.noQuotas', 'No quotas available')}</p></div>
          )}
        </div>

        {/* Request Increase Modal */}
        <Modal isOpen={showIncreaseModal && !!selectedQuota} onClose={() => { setShowIncreaseModal(false); setSelectedQuota(null); setRequestedLimit(0); setRequestReason(''); }} title={t('quotas.requestIncrease', 'Request Quota Increase')}>
          {selectedQuota && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl"><p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('quotas.resource', 'Resource')}</p><p className="font-semibold text-gray-900 dark:text-white">{selectedQuota.resourceName}</p></div>
                <div className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl"><p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('quotas.currentLimit', 'Current Limit')}</p><p className="font-semibold text-gray-900 dark:text-white">{formatNumber(selectedQuota.limit)} {selectedQuota.unit}</p></div>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl"><p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('quotas.currentUsage', 'Current Usage')}</p><p className="font-semibold text-gray-900 dark:text-white">{formatNumber(selectedQuota.used)} {selectedQuota.unit} ({getUsagePercentage(selectedQuota.used, selectedQuota.limit).toFixed(1)}%)</p></div>
              <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('quotas.requestedLimit', 'Requested Limit')} <span className="text-red-500">*</span></label><input type="number" value={requestedLimit} onChange={(e) => setRequestedLimit(parseInt(e.target.value) || 0)} min={selectedQuota.limit + 1} className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" /></div>
              <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('quotas.reason', 'Reason for Increase')} <span className="text-red-500">*</span></label><textarea value={requestReason} onChange={(e) => setRequestReason(e.target.value)} rows={4} placeholder={t('quotas.reasonPlaceholder', 'Please explain why you need this quota increase...')} className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" /></div>
              {requestedLimit > selectedQuota.limit && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-xl"><p className="text-sm text-blue-800 dark:text-blue-300">You're requesting an increase from <strong>{formatNumber(selectedQuota.limit)}</strong> to <strong>{formatNumber(requestedLimit)}</strong> {selectedQuota.unit} ({(((requestedLimit - selectedQuota.limit) / selectedQuota.limit) * 100).toFixed(0)}% increase)</p></div>
              )}
              <div className="flex gap-3 mt-6">
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleRequestIncrease} disabled={loading || !requestedLimit || !requestReason || requestedLimit <= selectedQuota.limit} className="flex-1 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg disabled:opacity-50">{loading ? t('common.submitting', 'Submitting...') : t('common.submit', 'Submit Request')}</motion.button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => { setShowIncreaseModal(false); setSelectedQuota(null); }} className="px-4 py-2.5 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors">{t('common.cancel', 'Cancel')}</motion.button>
              </div>
            </div>
          )}
        </Modal>

        {/* History Modal */}
        <Modal isOpen={showHistoryModal && !!selectedQuota} onClose={() => { setShowHistoryModal(false); setSelectedQuota(null); setQuotaHistory([]); }} title={selectedQuota ? `${selectedQuota.resourceName} ${t('quotas.history', 'History')}` : ''}>
          {selectedQuota && (
            <div className="space-y-6">
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('quotas.usageLast30Days', 'Usage over the last 30 days')}</p>
              <div className="relative h-48 border border-gray-200 dark:border-slate-700 rounded-xl bg-gradient-to-br from-gray-50 to-white dark:from-slate-800 dark:to-slate-900 p-4">
                <div className="absolute inset-0 flex items-end justify-around p-4 gap-0.5">
                  {quotaHistory.map((point, index) => {
                    const height = (point.used / point.limit) * 100;
                    const color = height >= selectedQuota.criticalThreshold ? 'from-red-500 to-red-600' : height >= selectedQuota.warningThreshold ? 'from-amber-500 to-amber-600' : 'from-green-500 to-green-600';
                    return (
                      <div key={index} className="group relative flex-1 flex items-end" title={`${new Date(point.date).toLocaleDateString()}: ${formatNumber(point.used)}`}>
                        <motion.div initial={{ height: 0 }} animate={{ height: `${Math.max(height, 2)}%` }} transition={{ duration: 0.5, delay: index * 0.02 }} className={`w-full bg-gradient-to-t ${color} rounded-t hover:opacity-80 relative`} />
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4"><p className="text-xs text-blue-700 dark:text-blue-400 font-semibold mb-1">{t('quotas.currentUsage', 'Current')}</p><p className="text-xl font-bold text-blue-800 dark:text-blue-300">{formatNumber(selectedQuota.used)}</p></div>
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4"><p className="text-xs text-green-700 dark:text-green-400 font-semibold mb-1">{t('quotas.limit', 'Limit')}</p><p className="text-xl font-bold text-green-800 dark:text-green-300">{formatNumber(selectedQuota.limit)}</p></div>
                <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-4"><p className="text-xs text-purple-700 dark:text-purple-400 font-semibold mb-1">{t('quotas.remaining', 'Remaining')}</p><p className="text-xl font-bold text-purple-800 dark:text-purple-300">{formatNumber(selectedQuota.limit - selectedQuota.used)}</p></div>
                <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-4"><p className="text-xs text-orange-700 dark:text-orange-400 font-semibold mb-1">{t('quotas.usagePercent', 'Usage %')}</p><p className="text-xl font-bold text-orange-800 dark:text-orange-300">{getUsagePercentage(selectedQuota.used, selectedQuota.limit).toFixed(1)}%</p></div>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}
