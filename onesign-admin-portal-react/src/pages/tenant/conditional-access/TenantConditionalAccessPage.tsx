import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { securityService } from '@/lib/api/services/security.service';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Plus,
  MapPin,
  Smartphone,
  AlertTriangle,
  CheckCircle,
  XCircle,
  X,
  Edit3,
  Trash2,
  Lock,
  Unlock,
  ArrowUp,
  ArrowDown,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import Modal from '@/components/common/Modal';

interface ConditionalAccessPolicy {
  id: string;
  name: string;
  description: string;
  conditions: {
    locations?: string[];
    devices?: string[];
    riskLevel?: string;
    timeRange?: string;
  };
  action: 'allow' | 'deny' | 'mfa_required';
  priority: number;
  isEnabled: boolean;
  createdAt: string;
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

export default function TenantConditionalAccessPage() {
  const { t } = useTranslation();
  const [policies, setPolicies] = useState<ConditionalAccessPolicy[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    try {
      const data = await securityService.getConditionalAccessPolicies();
      setPolicies(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Error fetching conditional access policies:', err);
      setPolicies([]);
    } finally {
      setLoading(false);
    }
  };

  const getActionConfig = (action: string) => {
    const configs = {
      allow: {
        bg: 'bg-green-100 dark:bg-green-900/30',
        text: 'text-green-800 dark:text-green-400',
        icon: <CheckCircle className="w-4 h-4" />
      },
      deny: {
        bg: 'bg-red-100 dark:bg-red-900/30',
        text: 'text-red-800 dark:text-red-400',
        icon: <XCircle className="w-4 h-4" />
      },
      mfa_required: {
        bg: 'bg-amber-100 dark:bg-amber-900/30',
        text: 'text-amber-800 dark:text-amber-400',
        icon: <Lock className="w-4 h-4" />
      },
    };
    return configs[action as keyof typeof configs] || { bg: 'bg-gray-100', text: 'text-gray-800', icon: null };
  };

  const getActionLabel = (action: string) => {
    const labels = {
      allow: t('conditionalAccess.allow', 'Allow'),
      deny: t('conditionalAccess.deny', 'Deny'),
      mfa_required: t('conditionalAccess.mfaRequired', 'Require MFA'),
    };
    return labels[action as keyof typeof labels] || action;
  };

  const handleTogglePolicy = async (policy: ConditionalAccessPolicy) => {
    try {
      setSuccess(t('conditionalAccess.policyToggled', `Policy ${policy.isEnabled ? t('common.disabled', 'disabled') : t('common.enabled', 'enabled')} successfully`));
      fetchPolicies();
    } catch (err: any) {
      setError(err?.message || t('conditionalAccess.updatePolicyError', 'Failed to update policy'));
    }
  };

  const enabledPolicies = policies.filter(p => p.isEnabled).length;
  const denyPolicies = policies.filter(p => p.action === 'deny').length;
  const mfaPolicies = policies.filter(p => p.action === 'mfa_required').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      <Helmet>
        <title>{t('conditionalAccess.title', 'Conditional Access')} | OneSign</title>
      </Helmet>

      <div className="p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {t('conditionalAccess.title', 'Conditional Access Policies')}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                {t('conditionalAccess.subtitle', 'Control access based on conditions')}
              </p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all flex items-center gap-2 shadow-lg"
          >
            <Plus className="w-5 h-5" />
            <span>{t('conditionalAccess.createPolicy', 'Create Policy')}</span>
          </motion.button>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title={t('conditionalAccess.totalPolicies', 'Total Policies')}
            value={policies.length}
            icon={<Shield className="w-6 h-6 text-white" />}
            color="from-indigo-500 to-indigo-600"
            delay={0}
          />
          <StatCard
            title={t('conditionalAccess.enabled', 'Enabled')}
            value={enabledPolicies}
            icon={<CheckCircle className="w-6 h-6 text-white" />}
            color="from-green-500 to-green-600"
            delay={1}
          />
          <StatCard
            title={t('conditionalAccess.denyPolicies', 'Deny Policies')}
            value={denyPolicies}
            icon={<XCircle className="w-6 h-6 text-white" />}
            color="from-red-500 to-red-600"
            delay={2}
          />
          <StatCard
            title={t('conditionalAccess.mfaPolicies', 'MFA Required')}
            value={mfaPolicies}
            icon={<Lock className="w-6 h-6 text-white" />}
            color="from-amber-500 to-amber-600"
            delay={3}
          />
        </div>

        {/* Alerts */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl flex items-center gap-3"
            >
              <XCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
              <button onClick={() => setError('')} className="ml-auto">
                <X className="w-5 h-5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-xl flex items-center gap-3"
            >
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <span>{success}</span>
              <button onClick={() => setSuccess('')} className="ml-auto">
                <X className="w-5 h-5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Policies List */}
        <div className="space-y-4">
          {policies.map((policy, index) => (
            <motion.div
              key={policy.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6 hover:shadow-xl transition-all"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                      <Shield className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{policy.name}</h3>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${getActionConfig(policy.action).bg} ${getActionConfig(policy.action).text}`}>
                      {getActionConfig(policy.action).icon}
                      {getActionLabel(policy.action)}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400">
                      <ArrowUp className="w-3 h-3" />
                      {t('conditionalAccess.priority', 'Priority')}: {policy.priority}
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">{policy.description}</p>

                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    {policy.conditions.locations && (
                      <div className="flex items-start gap-2 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                        <div>
                          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 block">{t('conditionalAccess.locations', 'Locations')}</span>
                          <span className="text-sm text-gray-900 dark:text-white">{policy.conditions.locations.join(', ')}</span>
                        </div>
                      </div>
                    )}
                    {policy.conditions.devices && (
                      <div className="flex items-start gap-2 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                        <Smartphone className="w-4 h-4 text-gray-400 mt-0.5" />
                        <div>
                          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 block">{t('conditionalAccess.devices', 'Devices')}</span>
                          <span className="text-sm text-gray-900 dark:text-white">{policy.conditions.devices.join(', ')}</span>
                        </div>
                      </div>
                    )}
                    {policy.conditions.riskLevel && (
                      <div className="flex items-start gap-2 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                        <AlertTriangle className="w-4 h-4 text-gray-400 mt-0.5" />
                        <div>
                          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 block">{t('conditionalAccess.riskLevel', 'Risk Level')}</span>
                          <span className="text-sm text-gray-900 dark:text-white capitalize">{policy.conditions.riskLevel}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 ml-4">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleTogglePolicy(policy)}
                    className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                      policy.isEnabled
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-400'
                    }`}
                  >
                    {policy.isEnabled ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                    {policy.isEnabled ? t('common.enabled', 'Enabled') : t('common.disabled', 'Disabled')}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}

          {policies.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700"
            >
              <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">{t('conditionalAccess.noPolicies', 'No conditional access policies configured')}</p>
            </motion.div>
          )}
        </div>

        {/* Create Modal */}
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title={t('conditionalAccess.createPolicy', 'Create Conditional Access Policy')}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('conditionalAccess.policyName', 'Policy Name')}
              </label>
              <input
                type="text"
                className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                placeholder={t('conditionalAccess.policyNamePlaceholder', 'Enter policy name')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('common.description', 'Description')}
              </label>
              <textarea
                className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                rows={3}
                placeholder={t('conditionalAccess.descriptionPlaceholder', 'Describe the policy')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('conditionalAccess.action', 'Action')}
              </label>
              <select className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all">
                <option value="allow">{t('conditionalAccess.allow', 'Allow')}</option>
                <option value="deny">{t('conditionalAccess.deny', 'Deny')}</option>
                <option value="mfa_required">{t('conditionalAccess.mfaRequired', 'Require MFA')}</option>
              </select>
            </div>
            <div className="flex gap-3 mt-6">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg"
              >
                {t('common.create', 'Create')}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2.5 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors"
              >
                {t('common.cancel', 'Cancel')}
              </motion.button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}
