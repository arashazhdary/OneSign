import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import {
  Globe,
  Plus,
  RefreshCw,
  Shield,
  CheckCircle,
  AlertCircle,
  Clock,
  Star,
  Trash2,
  ExternalLink,
  Copy,
  Lock,
  X
} from 'lucide-react';
import { tenantService } from '@/lib/api/services/tenant.service';
import Modal from '@/components/common/Modal';

interface CustomDomain {
  id: string;
  domain: string;
  status: 'pending' | 'verifying' | 'active' | 'failed' | 'expired';
  verificationMethod: 'dns' | 'file';
  dnsRecords: {
    type: string;
    name: string;
    value: string;
    verified: boolean;
  }[];
  sslStatus: 'pending' | 'active' | 'renewing' | 'expired';
  sslExpiry: string;
  createdAt: string;
  verifiedAt?: string;
  lastChecked: string;
  isPrimary: boolean;
}

export default function TenantDomainsPage() {
  const { t } = useTranslation();
  const [domains, setDomains] = useState<CustomDomain[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newDomain, setNewDomain] = useState('');
  const [verificationMethod, setVerificationMethod] = useState<'dns' | 'file'>('dns');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchDomains();
  }, []);

  const fetchDomains = async () => {
    try {
      const data = await tenantService.getCustomDomains();
      setDomains(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setDomains([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newDomain) {
      setError(t('tenant.domains.errors.enterDomain'));
      return;
    }
    setError('');
    setSuccess('');
    try {
      await tenantService.addCustomDomain('tenant-id', { domain: newDomain, verificationMethod });
      setSuccess(t('tenant.domains.messages.added'));
      setShowAdd(false);
      setNewDomain('');
      fetchDomains();
    } catch (error) {
      setError(t('tenant.domains.errors.failedToAdd'));
      console.error('Failed to add custom domain:', error);
    }
  };

  const handleVerify = async (domainId: string) => {
    setError('');
    setSuccess('');
    try {
      await tenantService.verifyCustomDomain('tenant-id', domainId);
      setSuccess(t('tenant.domains.messages.verificationInitiated'));
      fetchDomains();
    } catch (error) {
      setError(t('tenant.domains.errors.failedToVerify'));
      console.error('Failed to verify custom domain:', error);
    }
  };

  const handleDelete = async (domainId: string) => {
    if (!confirm(t('tenant.domains.confirmDelete'))) return;
    setError('');
    setSuccess('');
    try {
      await tenantService.deleteCustomDomain('tenant-id', domainId);
      setSuccess(t('tenant.domains.messages.removed'));
      fetchDomains();
    } catch (error) {
      setError(t('tenant.domains.errors.failedToRemove'));
      console.error('Failed to delete custom domain:', error);
    }
  };

  const handleSetPrimary = async (domainId: string) => {
    setError('');
    setSuccess('');
    try {
      await tenantService.setPrimaryDomain('tenant-id', domainId);
      setSuccess(t('tenant.domains.messages.primaryUpdated'));
      fetchDomains();
    } catch (error) {
      setError(t('tenant.domains.errors.failedToSetPrimary'));
      console.error('Failed to set primary domain:', error);
    }
  };

  const handleRenewSSL = async (domainId: string) => {
    setError('');
    setSuccess('');
    try {
      await tenantService.renewDomainSSL('tenant-id', domainId);
      setSuccess(t('tenant.domains.messages.sslRenewalInitiated'));
      fetchDomains();
    } catch (error) {
      setError(t('tenant.domains.errors.failedToRenewSSL'));
      console.error('Failed to renew SSL certificate:', error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setSuccess(t('tenant.domains.messages.copiedToClipboard'));
    setTimeout(() => setSuccess(''), 2000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'verifying':
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'failed':
      case 'expired':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-slate-400" />;
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'verifying':
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'failed':
      case 'expired':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400';
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, delay = 0 }: { title: string; value: string | number; icon: React.ElementType; color: string; delay?: number }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay * 0.1 }}
      className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 hover:shadow-lg transition-all"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Globe className="w-6 h-6 text-blue-500" />
            </div>
          </div>
          <p className="text-slate-600 dark:text-slate-400 font-medium">{t('common.loading', 'Loading...')}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{t('tenant.domains.title', 'Custom Domains')} | OneSign</title>
      </Helmet>

      <div className="min-h-screen p-6 space-y-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3"
            >
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl text-white">
                <Globe className="w-6 h-6" />
              </div>
              {t('tenant.domains.title', 'Custom Domains')}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="text-slate-500 dark:text-slate-400 mt-1"
            >
              {t('tenant.domains.subtitle', 'Configure custom domains for your organization')}
            </motion.p>
          </div>
          <div className="flex gap-3">
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={fetchDomains}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              {t('common.refresh', 'Refresh')}
            </motion.button>
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAdd(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
            >
              <Plus className="w-4 h-4" />
              {t('tenant.domains.addDomain', 'Add Domain')}
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

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            title={t('tenant.domains.totalDomains', 'Total Domains')}
            value={domains.length}
            icon={Globe}
            color="bg-gradient-to-br from-blue-500 to-blue-600"
            delay={0}
          />
          <StatCard
            title={t('tenant.domains.activeDomains', 'Active')}
            value={domains.filter(d => d.status === 'active').length}
            icon={CheckCircle}
            color="bg-gradient-to-br from-green-500 to-green-600"
            delay={1}
          />
          <StatCard
            title={t('tenant.domains.pendingVerification', 'Pending')}
            value={domains.filter(d => d.status === 'verifying' || d.status === 'pending').length}
            icon={Clock}
            color="bg-gradient-to-br from-yellow-500 to-orange-500"
            delay={2}
          />
          <StatCard
            title={t('tenant.domains.sslActive', 'SSL Active')}
            value={domains.filter(d => d.sslStatus === 'active').length}
            icon={Shield}
            color="bg-gradient-to-br from-purple-500 to-purple-600"
            delay={3}
          />
        </div>

        {/* Domains List */}
        <div className="space-y-4">
          {domains.map((domain, index) => (
            <motion.div
              key={domain.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 hover:shadow-lg transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {getStatusIcon(domain.status)}
                    <h3 className="text-lg font-semibold font-mono text-slate-900 dark:text-white">{domain.domain}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusBadgeClass(domain.status)}`}>
                      {domain.status}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusBadgeClass(domain.sslStatus)}`}>
                      <Lock className="w-3 h-3 inline mr-1" />
                      SSL: {domain.sslStatus}
                    </span>
                    {domain.isPrimary && (
                      <span className="px-2 py-1 text-xs rounded-full font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        {t('tenant.domains.primary')}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    {t('tenant.domains.created')}: {new Date(domain.createdAt).toLocaleString()}
                    {domain.verifiedAt && ` | ${t('tenant.domains.verified')}: ${new Date(domain.verifiedAt).toLocaleString()}`}
                  </div>
                </div>

                <div className="flex gap-2">
                  {domain.status === 'verifying' && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleVerify(domain.id)}
                      className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      {t('tenant.domains.verifyNow')}
                    </motion.button>
                  )}
                  {domain.status === 'active' && !domain.isPrimary && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleSetPrimary(domain.id)}
                      className="px-3 py-1.5 text-sm border border-purple-300 dark:border-purple-700 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors flex items-center gap-1"
                    >
                      <Star className="w-3 h-3" />
                      {t('tenant.domains.setPrimary')}
                    </motion.button>
                  )}
                  {domain.sslStatus === 'active' && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleRenewSSL(domain.id)}
                      className="px-3 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      {t('tenant.domains.renewSSL')}
                    </motion.button>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDelete(domain.id)}
                    className="px-3 py-1.5 text-sm text-red-600 dark:text-red-400 border border-red-300 dark:border-red-700 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    {t('tenant.domains.remove')}
                  </motion.button>
                </div>
              </div>

              {/* DNS Records */}
              <div className="mt-4">
                <h4 className="text-sm font-semibold mb-3 text-slate-700 dark:text-slate-300">{t('tenant.domains.dnsConfiguration')}</h4>
                <div className="space-y-2">
                  {domain.dnsRecords.map((record, idx) => (
                    <div key={idx} className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 rounded font-mono font-medium">
                            {record.type}
                          </span>
                          <span className={`text-xs flex items-center gap-1 ${record.verified ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                            {record.verified ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                            {record.verified ? t('tenant.domains.verified') : t('tenant.domains.pending')}
                          </span>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => copyToClipboard(record.value)}
                          className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition-colors"
                        >
                          <Copy className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                        </motion.button>
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="grid grid-cols-12 gap-2">
                          <span className="col-span-2 text-slate-500 dark:text-slate-400 font-medium">{t('tenant.domains.name')}:</span>
                          <span className="col-span-10 font-mono text-xs text-slate-700 dark:text-slate-300">{record.name}</span>
                        </div>
                        <div className="grid grid-cols-12 gap-2">
                          <span className="col-span-2 text-slate-500 dark:text-slate-400 font-medium">{t('tenant.domains.value')}:</span>
                          <span className="col-span-10 font-mono text-xs break-all text-slate-700 dark:text-slate-300">{record.value}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SSL Info */}
              {domain.sslStatus === 'active' && domain.sslExpiry && (
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400 flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      {t('tenant.domains.sslExpires')}:
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {new Date(domain.sslExpiry).toLocaleDateString()}
                      <span className="ml-2 text-slate-500 dark:text-slate-400 font-normal">
                        ({t('tenant.domains.daysRemaining', { days: Math.ceil((new Date(domain.sslExpiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) })})
                      </span>
                    </span>
                  </div>
                </div>
              )}

              {/* Instructions for pending domains */}
              {domain.status === 'verifying' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl"
                >
                  <h4 className="font-semibold text-blue-800 dark:text-blue-400 mb-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {t('tenant.domains.actionRequired')}
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    {t('tenant.domains.verificationInstructions')}
                  </p>
                  <button
                    onClick={() => handleVerify(domain.id)}
                    className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    {t('tenant.domains.checkVerificationStatus')}
                  </button>
                </motion.div>
              )}
            </motion.div>
          ))}

          {domains.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-12 text-center"
            >
              <Globe className="w-16 h-16 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{t('tenant.domains.noDomains')}</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-4">{t('tenant.domains.noDomainsDescription')}</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAdd(true)}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all"
              >
                {t('tenant.domains.addFirstDomain')}
              </motion.button>
            </motion.div>
          )}
        </div>

        {/* Add Domain Modal */}
        <Modal
          isOpen={showAdd}
          onClose={() => {
            setShowAdd(false);
            setNewDomain('');
            setError('');
          }}
          title={t('tenant.domains.addDomain', 'Add Custom Domain')}
          size="md"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                {t('tenant.domains.modal.domainName')}
              </label>
              <input
                type="text"
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                placeholder={t('tenant.domains.modal.domainPlaceholder')}
                className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {t('tenant.domains.modal.domainHelp')}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                {t('tenant.domains.modal.verificationMethod')}
              </label>
              <div className="space-y-2">
                <label className="flex items-start p-3 border border-slate-200 dark:border-slate-600 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <input
                    type="radio"
                    value="dns"
                    checked={verificationMethod === 'dns'}
                    onChange={() => setVerificationMethod('dns')}
                    className="mt-1 mr-3"
                  />
                  <div>
                    <div className="font-medium text-slate-900 dark:text-white">{t('tenant.domains.modal.dnsVerification')}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{t('tenant.domains.modal.dnsVerificationHelp')}</div>
                  </div>
                </label>
                <label className="flex items-start p-3 border border-slate-200 dark:border-slate-600 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <input
                    type="radio"
                    value="file"
                    checked={verificationMethod === 'file'}
                    onChange={() => setVerificationMethod('file')}
                    className="mt-1 mr-3"
                  />
                  <div>
                    <div className="font-medium text-slate-900 dark:text-white">{t('tenant.domains.modal.fileUpload')}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{t('tenant.domains.modal.fileUploadHelp')}</div>
                  </div>
                </label>
              </div>
            </div>

            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl text-sm">
              <p className="text-yellow-800 dark:text-yellow-400">
                {t('tenant.domains.modal.note')}
              </p>
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setShowAdd(false);
                  setNewDomain('');
                }}
                className="px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
              >
                {t('common.cancel')}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAdd}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all"
              >
                {t('tenant.domains.addDomain')}
              </motion.button>
            </div>
          </div>
        </Modal>
      </div>
    </>
  );
}
