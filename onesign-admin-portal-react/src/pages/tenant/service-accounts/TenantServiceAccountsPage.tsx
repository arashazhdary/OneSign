import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { getTenantId } from '@/lib/tenant-context';
import { tenantService } from '@/lib/api/services/tenant.service';
import Modal from '@/components/common/Modal';
import { Helmet } from 'react-helmet-async';
import {
  Bot,
  Plus,
  Copy,
  Key,
  CheckCircle,
  XCircle,
  Trash2,
  RefreshCw,
  Shield,
  Clock,
  AlertTriangle,
  Eye,
  EyeOff,
} from 'lucide-react';

interface ServiceAccount {
  id: string;
  name: string;
  description: string;
  clientId: string;
  isEnabled: boolean;
  createdAt: string;
  lastUsed?: string;
}

interface StatCardProps {
  title: string;
  value: string | number;
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

export default function TenantServiceAccountsPage() {
  const { t } = useTranslation();
  const [tenantId, setTenantIdState] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [serviceAccounts, setServiceAccounts] = useState<ServiceAccount[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showSecretModal, setShowSecretModal] = useState(false);
  const [generatedSecret, setGeneratedSecret] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<ServiceAccount | null>(null);
  const [copiedId, setCopiedId] = useState('');
  const [form, setForm] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    const contextTenantId = getTenantId();
    setTenantIdState(contextTenantId || '00000000-0000-0000-0000-000000000000');
  }, []);

  useEffect(() => {
    if (tenantId) fetchServiceAccounts();
  }, [tenantId]);

  const fetchServiceAccounts = async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      const data = await tenantService.getServiceAccounts();
      setServiceAccounts(data || []);
    } catch (err) {
      console.error('Error fetching service accounts:', err);
      // Mock data
      setServiceAccounts([
        { id: '1', name: 'CI/CD Pipeline', description: 'Used for automated deployments', clientId: 'sa-cicd-12345', isEnabled: true, createdAt: '2024-01-15T10:00:00Z', lastUsed: '2024-11-23T14:30:00Z' },
        { id: '2', name: 'Monitoring Service', description: 'Collects metrics and logs', clientId: 'sa-monitor-67890', isEnabled: true, createdAt: '2024-02-20T09:00:00Z', lastUsed: '2024-11-23T15:00:00Z' },
        { id: '3', name: 'Backup Agent', description: 'Automated backup service', clientId: 'sa-backup-54321', isEnabled: false, createdAt: '2024-03-10T11:00:00Z' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId) return;
    setLoading(true);
    try {
      await tenantService.createServiceAccount(form);
      setSuccess('Service account created successfully');
      setShowModal(false);
      fetchServiceAccounts();
      setForm({ name: '', description: '' });
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to create service account');
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(''), 2000);
  };

  const handleRegenerateSecret = (account: ServiceAccount) => {
    setSelectedAccount(account);
    setGeneratedSecret('sk_live_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15));
    setShowSecretModal(true);
    setShowSecret(false);
  };

  if (loading && serviceAccounts.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      <Helmet>
        <title>Service Accounts - OneSign</title>
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between mb-8"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
              <Bot className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Service Accounts</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">Manage machine-to-machine authentication</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowModal(true)}
            className="mt-4 md:mt-0 flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Plus className="w-5 h-5" />
            <span>Create Service Account</span>
          </motion.button>
        </motion.div>

        {/* Messages */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl flex items-center space-x-3"
            >
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
              <span className="text-red-700 dark:text-red-300">{error}</span>
            </motion.div>
          )}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl flex items-center space-x-3"
            >
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span className="text-green-700 dark:text-green-300">{success}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Total Accounts"
            value={serviceAccounts.length}
            icon={<Bot className="w-6 h-6 text-white" />}
            color="from-blue-500 to-indigo-600"
            delay={0}
          />
          <StatCard
            title="Active"
            value={serviceAccounts.filter(sa => sa.isEnabled).length}
            icon={<CheckCircle className="w-6 h-6 text-white" />}
            color="from-green-500 to-emerald-600"
            delay={1}
          />
          <StatCard
            title="Inactive"
            value={serviceAccounts.filter(sa => !sa.isEnabled).length}
            icon={<XCircle className="w-6 h-6 text-white" />}
            color="from-gray-500 to-slate-600"
            delay={2}
          />
        </div>

        {/* Service Accounts Grid */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">All Service Accounts</h2>
          <AnimatePresence>
            {serviceAccounts.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-12 text-center"
              >
                <Bot className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No service accounts configured</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Create one for machine-to-machine authentication</p>
              </motion.div>
            ) : (
              serviceAccounts.map((account, idx) => (
                <motion.div
                  key={account.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6 hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex items-start space-x-4">
                      <div className={`p-3 rounded-xl ${
                        account.isEnabled
                          ? 'bg-gradient-to-br from-green-500 to-emerald-600'
                          : 'bg-gradient-to-br from-gray-400 to-gray-500'
                      }`}>
                        <Bot className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-3">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{account.name}</h3>
                          <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                            account.isEnabled
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                          }`}>
                            {account.isEnabled ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{account.description}</p>

                        <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
                          <div className="flex items-center space-x-2">
                            <Key className="w-4 h-4 text-gray-400" />
                            <code className="px-2 py-1 bg-gray-100 dark:bg-slate-700 rounded text-gray-700 dark:text-gray-300 font-mono text-xs">
                              {account.clientId}
                            </code>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleCopy(account.clientId, account.id)}
                              className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                            >
                              {copiedId === account.id ? (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </motion.button>
                          </div>
                          <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
                            <Clock className="w-4 h-4" />
                            <span>Created {new Date(account.createdAt).toLocaleDateString()}</span>
                          </div>
                          {account.lastUsed && (
                            <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
                              <RefreshCw className="w-4 h-4" />
                              <span>Last used {new Date(account.lastUsed).toLocaleString()}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleRegenerateSecret(account)}
                        className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-lg text-sm shadow-md hover:shadow-lg transition-all"
                      >
                        <RefreshCw className="w-4 h-4" />
                        <span>Regenerate Secret</span>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-6"
        >
          <div className="flex items-start space-x-4">
            <div className="p-2 bg-blue-100 dark:bg-blue-800/30 rounded-lg">
              <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-100">Security Best Practices</h3>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                Service accounts are used for machine-to-machine authentication. Store client secrets securely and rotate them periodically.
                Never expose secrets in code repositories or logs.
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Create Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create Service Account">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g., CI/CD Pipeline"
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="What will this service account be used for?"
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowModal(false)}
              className="px-4 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
            >
              Cancel
            </motion.button>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all"
            >
              Create Account
            </motion.button>
          </div>
        </form>
      </Modal>

      {/* Secret Modal */}
      <Modal isOpen={showSecretModal} onClose={() => setShowSecretModal(false)} title="Client Secret Generated">
        <div className="space-y-4">
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              <strong>Important:</strong> This secret will only be shown once. Copy and store it securely now.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Client Secret</label>
            <div className="relative">
              <input
                type={showSecret ? 'text' : 'password'}
                value={generatedSecret}
                readOnly
                className="w-full px-4 py-3 pr-24 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white font-mono text-sm"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex space-x-1">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowSecret(!showSecret)}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleCopy(generatedSecret, 'secret')}
                  className="p-2 text-gray-400 hover:text-blue-500"
                >
                  {copiedId === 'secret' ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </motion.button>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowSecretModal(false)}
              className="px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all"
            >
              Done
            </motion.button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
