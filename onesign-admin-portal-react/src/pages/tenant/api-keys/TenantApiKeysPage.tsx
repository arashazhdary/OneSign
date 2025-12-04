import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import {
  Key,
  Plus,
  RefreshCw,
  Copy,
  Eye,
  EyeOff,
  Trash2,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Search,
  Calendar,
  Clock,
  Shield,
  XCircle,
  Activity,
  Lock,
  Unlock
} from 'lucide-react';
import { getTenantId } from '@/lib/tenant-context';
import Modal from '@/components/common/Modal';
import { tenantService } from '@/lib/api/services/tenant.service';

interface APIKey {
  id: string;
  name: string;
  key: string;
  isRevoked: boolean;
  createdAt: string;
  expiresAt?: string;
  lastUsedAt?: string;
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

export default function TenantApiKeysPage() {
  const { t } = useTranslation();
  const [tenantId, setTenantIdState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showRevokeConfirm, setShowRevokeConfirm] = useState(false);
  const [selectedKey, setSelectedKey] = useState<APIKey | null>(null);
  const [newKeyValue, setNewKeyValue] = useState('');
  const [showNewKey, setShowNewKey] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showKeyValues, setShowKeyValues] = useState<Record<string, boolean>>({});

  const [form, setForm] = useState({
    name: '',
    expiresAt: ''
  });

  useEffect(() => {
    const contextTenantId = getTenantId();
    setTenantIdState(contextTenantId || '00000000-0000-0000-0000-000000000000');
  }, []);

  useEffect(() => {
    if (tenantId) fetchAPIKeys();
  }, [tenantId]);

  const fetchAPIKeys = async (isRefresh = false) => {
    if (!tenantId) return;
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const data = await tenantService.getApiKeys();
      setApiKeys(data || []);
    } catch (err: any) {
      console.error('Error fetching API keys:', err);
      setError(err?.message || t('common.failedToFetchApiKeys'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId || !form.name) {
      setError(t('tenant.apiKeys.enterKeyName'));
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const expiresIn = form.expiresAt ? new Date(form.expiresAt).getTime() - Date.now() : undefined;
      const data = await tenantService.createApiKey({
        name: form.name,
        scope: [],
        expiresIn
      });
      setNewKeyValue(data.key);
      setShowNewKey(true);
      setSuccess(t('tenant.apiKeys.keyCreatedSuccessfully'));
      setShowModal(false);
      fetchAPIKeys(true);
      setForm({ name: '', expiresAt: '' });
    } catch (err: any) {
      setError(err?.message || t('common.failedToCreateApiKey'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleRevoke = async () => {
    if (!tenantId || !selectedKey) return;

    setSubmitting(true);
    setError('');
    try {
      await tenantService.revokeApiKey(selectedKey.id);
      setSuccess(t('tenant.apiKeys.keyRevokedSuccessfully'));
      setShowRevokeConfirm(false);
      setSelectedKey(null);
      fetchAPIKeys(true);
    } catch (err: any) {
      setError(err?.message || t('common.failedToRevokeApiKey'));
    } finally {
      setSubmitting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setSuccess(t('tenant.apiKeys.keyCopied'));
    setTimeout(() => setSuccess(''), 2000);
  };

  const toggleKeyVisibility = (keyId: string) => {
    setShowKeyValues(prev => ({ ...prev, [keyId]: !prev[keyId] }));
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('fa-IR');
  };

  const getStats = () => {
    const total = apiKeys.length;
    const active = apiKeys.filter(k => !k.isRevoked).length;
    const revoked = apiKeys.filter(k => k.isRevoked).length;
    const expiringSoon = apiKeys.filter(k => {
      if (k.isRevoked || !k.expiresAt) return false;
      const expiresAt = new Date(k.expiresAt);
      const daysUntilExpiry = (expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
      return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
    }).length;

    return { total, active, revoked, expiringSoon };
  };

  const stats = getStats();

  const filteredKeys = apiKeys.filter(key =>
    key.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Key className="w-6 h-6 text-purple-500" />
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
        <title>{t('tenant.apiKeys.title')} | OneSign</title>
      </Helmet>

      <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 via-purple-50/30 to-indigo-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 min-h-screen" dir="rtl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3"
            >
              <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl text-white">
                <Key className="w-6 h-6" />
              </div>
              {t('tenant.apiKeys.title')}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="text-slate-500 dark:text-slate-400 mt-1"
            >
              {t('tenant.apiKeys.subtitle')}
            </motion.p>
          </div>
          <div className="flex gap-3">
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => fetchAPIKeys(true)}
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
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
            >
              <Plus className="w-4 h-4" />
              {t('common.createApiKey')}
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

        {/* New Key Alert */}
        {showNewKey && newKeyValue && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-300 px-6 py-4 rounded-xl"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold mb-2">{t('tenant.apiKeys.newKeyCreated')}</h4>
                <p className="text-sm mb-3">{t('tenant.apiKeys.newKeyWarning')}</p>
                <div className="flex items-center gap-2 bg-white dark:bg-slate-800 rounded-lg p-3">
                  <code className="text-sm flex-1 break-all font-mono text-slate-900 dark:text-white">{newKeyValue}</code>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => copyToClipboard(newKeyValue)}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <Copy className="w-5 h-5 text-purple-600" />
                  </motion.button>
                </div>
                <button
                  onClick={() => {
                    setShowNewKey(false);
                    setNewKeyValue('');
                  }}
                  className="mt-3 text-sm text-yellow-700 dark:text-yellow-400 hover:underline"
                >
                  {t('tenant.apiKeys.closeMessage')}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title={t('tenant.apiKeys.totalKeys')}
            value={stats.total}
            icon={<Key className="w-6 h-6" />}
            color="purple"
            delay={0}
          />
          <StatCard
            title={t('tenant.apiKeys.activeKeys')}
            value={stats.active}
            icon={<Unlock className="w-6 h-6" />}
            color="green"
            delay={1}
          />
          <StatCard
            title={t('tenant.apiKeys.revokedKeys')}
            value={stats.revoked}
            icon={<Lock className="w-6 h-6" />}
            color="red"
            delay={2}
          />
          <StatCard
            title={t('tenant.apiKeys.expiringSoon')}
            value={stats.expiringSoon}
            subtitle={t('tenant.apiKeys.next30Days')}
            icon={<Clock className="w-6 h-6" />}
            color="yellow"
            delay={3}
          />
        </div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4"
        >
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder={t('tenant.apiKeys.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-10 pl-4 py-2 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </motion.div>

        {/* API Keys List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          {filteredKeys.length > 0 ? (
            filteredKeys.map((apiKey, idx) => (
              <motion.div
                key={apiKey.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`bg-white dark:bg-slate-800 rounded-xl shadow-sm border ${
                  apiKey.isRevoked
                    ? 'border-red-200 dark:border-red-800 opacity-75'
                    : 'border-slate-200 dark:border-slate-700'
                } p-6 hover:shadow-lg transition-all`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`p-2 rounded-lg ${apiKey.isRevoked ? 'bg-red-100 dark:bg-red-900/30' : 'bg-purple-100 dark:bg-purple-900/30'}`}>
                        <Key className={`w-5 h-5 ${apiKey.isRevoked ? 'text-red-600 dark:text-red-400' : 'text-purple-600 dark:text-purple-400'}`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white">
                          {apiKey.name}
                        </h3>
                        <div className="flex items-center gap-2">
                          <code className="text-xs bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded font-mono text-slate-600 dark:text-slate-400">
                            {showKeyValues[apiKey.id] ? apiKey.key : `${apiKey.key.substring(0, 10)}...`}
                          </code>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => toggleKeyVisibility(apiKey.id)}
                            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                          >
                            {showKeyValues[apiKey.id] ? (
                              <EyeOff className="w-4 h-4 text-slate-500" />
                            ) : (
                              <Eye className="w-4 h-4 text-slate-500" />
                            )}
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => copyToClipboard(apiKey.key)}
                            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                          >
                            <Copy className="w-4 h-4 text-slate-500" />
                          </motion.button>
                        </div>
                      </div>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                        apiKey.isRevoked
                          ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      }`}>
                        {apiKey.isRevoked ? t('tenant.apiKeys.revoked') : t('tenant.apiKeys.active')}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <div>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{t('tenant.apiKeys.createdAt')}</p>
                          <p className="text-sm font-medium text-slate-900 dark:text-white">
                            {formatDate(apiKey.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <div>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{t('tenant.apiKeys.expiresAt')}</p>
                          <p className="text-sm font-medium text-slate-900 dark:text-white">
                            {apiKey.expiresAt ? formatDate(apiKey.expiresAt) : t('tenant.apiKeys.noExpiry')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-slate-400" />
                        <div>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{t('tenant.apiKeys.lastUsed')}</p>
                          <p className="text-sm font-medium text-slate-900 dark:text-white">
                            {apiKey.lastUsedAt ? formatDate(apiKey.lastUsedAt) : t('tenant.apiKeys.neverUsed')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {!apiKey.isRevoked && (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => {
                        setSelectedKey(apiKey);
                        setShowRevokeConfirm(true);
                      }}
                      className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all"
                    >
                      <Trash2 className="w-5 h-5" />
                    </motion.button>
                  )}
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-12 text-center"
            >
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Key className="w-8 h-8 text-purple-500" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                {t('tenant.apiKeys.noKeysFound')}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 mb-4">
                {t('tenant.apiKeys.noKeysDescription')}
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all"
              >
                {t('tenant.apiKeys.createFirstKey')}
              </motion.button>
            </motion.div>
          )}
        </motion.div>

        {/* Create API Key Modal */}
        <Modal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setForm({ name: '', expiresAt: '' });
          }}
          title={t('tenant.apiKeys.createNewKey')}
          size="md"
        >
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                {t('tenant.apiKeys.keyName')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                placeholder={t('tenant.apiKeys.keyNamePlaceholder')}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                {t('tenant.apiKeys.expiryDate')}
              </label>
              <input
                type="datetime-local"
                value={form.expiresAt}
                onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {t('tenant.apiKeys.expiryDateHelp')}
              </p>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
              <div className="flex gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
                <div className="text-sm text-yellow-800 dark:text-yellow-300">
                  <p className="font-medium mb-1">{t('tenant.apiKeys.importantNote')}</p>
                  <p>{t('tenant.apiKeys.oneTimeDisplay')}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  setForm({ name: '', expiresAt: '' });
                }}
                className="px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all disabled:opacity-50"
              >
                {submitting ? t('tenant.apiKeys.creating') : t('tenant.apiKeys.createKey')}
              </button>
            </div>
          </form>
        </Modal>

        {/* Revoke Confirmation Modal */}
        <Modal
          isOpen={showRevokeConfirm}
          onClose={() => {
            setShowRevokeConfirm(false);
            setSelectedKey(null);
          }}
          title={t('tenant.apiKeys.confirmRevoke')}
          size="sm"
        >
          <div className="space-y-4">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
              <div className="flex gap-3">
                <XCircle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0" />
                <div>
                  <p className="text-red-800 dark:text-red-300 font-medium mb-1">
                    {t('tenant.apiKeys.revokeConfirmMessage')}
                  </p>
                  <p className="text-sm text-red-700 dark:text-red-400">
                    {t('tenant.apiKeys.revokeWarning')}
                  </p>
                </div>
              </div>
            </div>

            {selectedKey && (
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4">
                <p className="text-sm text-slate-500 dark:text-slate-400">{t('tenant.apiKeys.selectedKey')}</p>
                <p className="font-medium text-slate-900 dark:text-white">{selectedKey.name}</p>
              </div>
            )}

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowRevokeConfirm(false);
                  setSelectedKey(null);
                }}
                className="px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleRevoke}
                disabled={submitting}
                className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all disabled:opacity-50"
              >
                {submitting ? t('tenant.apiKeys.revoking') : t('tenant.apiKeys.revokeKey')}
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </>
  );
}
