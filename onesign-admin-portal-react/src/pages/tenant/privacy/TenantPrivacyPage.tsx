import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { getTenantId } from '@/lib/tenant-context';
import { governanceService } from '@/lib/api/services';
import Modal from '@/components/common/Modal';
import { Helmet } from 'react-helmet-async';
import {
  Shield,
  Lock,
  Clock,
  FileText,
  Trash2,
  Download,
  Edit,
  Plus,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Search,
  User,
  RefreshCw,
} from 'lucide-react';

interface RetentionPolicy {
  category: string;
  retentionPeriodDays: number;
  hardDeleteAfter: number;
  enabled: boolean;
}

interface DataRequest {
  id: string;
  subjectId: string;
  type: 'Access' | 'Deletion' | 'Portability' | 'Rectification';
  status: string;
  reason: string;
  createdAt: string;
  completedAt?: string;
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

export default function TenantPrivacyPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'retention' | 'requests'>('retention');
  const [tenantId, setTenantIdState] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [retentionPolicies, setRetentionPolicies] = useState<RetentionPolicy[]>([]);
  const [dataRequests, setDataRequests] = useState<DataRequest[]>([]);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestForm, setRequestForm] = useState({
    subjectId: '',
    type: 'Access' as const,
    reason: ''
  });

  useEffect(() => {
    const contextTenantId = getTenantId();
    setTenantIdState(contextTenantId || '00000000-0000-0000-0000-000000000000');
  }, []);

  useEffect(() => {
    if (tenantId) {
      if (activeTab === 'retention') fetchRetentionPolicies();
      else if (activeTab === 'requests') fetchDataRequests();
    }
  }, [tenantId, activeTab]);

  const fetchRetentionPolicies = async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      const data = await governanceService.getRetentionPolicies(tenantId);
      setRetentionPolicies(data || [
        { category: 'User Data', retentionPeriodDays: 365, hardDeleteAfter: 30, enabled: true },
        { category: 'Audit Logs', retentionPeriodDays: 730, hardDeleteAfter: 90, enabled: true },
        { category: 'Analytics', retentionPeriodDays: 180, hardDeleteAfter: 30, enabled: true },
        { category: 'Session Data', retentionPeriodDays: 90, hardDeleteAfter: 14, enabled: true },
        { category: 'Temporary Files', retentionPeriodDays: 30, hardDeleteAfter: 7, enabled: false },
      ]);
    } catch (err) {
      console.error('Error fetching retention policies:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDataRequests = async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      const data = await governanceService.getDataSubjectRequests(tenantId);
      setDataRequests(data || [
        { id: '1', subjectId: 'user@example.com', type: 'Access', status: 'Completed', reason: 'Personal data request', createdAt: '2024-11-20T10:00:00Z', completedAt: '2024-11-21T14:00:00Z' },
        { id: '2', subjectId: 'john.doe@company.com', type: 'Deletion', status: 'Pending', reason: 'Account closure request', createdAt: '2024-11-22T09:00:00Z' },
        { id: '3', subjectId: 'jane.smith@org.com', type: 'Portability', status: 'InProgress', reason: 'Data export for migration', createdAt: '2024-11-23T11:00:00Z' },
      ]);
    } catch (err) {
      console.error('Error fetching data requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRetention = async (category: string, data: Partial<RetentionPolicy>) => {
    if (!tenantId) return;
    setLoading(true);
    try {
      await governanceService.updateRetentionPolicy(tenantId, category, data);
      setSuccess(t('tenant.privacy.retentionPolicyUpdateSuccess'));
      fetchRetentionPolicies();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(t('tenant.privacy.retentionPolicyUpdateError'));
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId) return;
    setLoading(true);
    try {
      await governanceService.createDataSubjectRequest(tenantId, requestForm);
      setSuccess(t('tenant.privacy.dataRequestCreateSuccess'));
      setShowRequestModal(false);
      fetchDataRequests();
      setRequestForm({ subjectId: '', type: 'Access', reason: '' });
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(t('tenant.privacy.dataRequestCreateError'));
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteRequest = async (id: string) => {
    if (!tenantId || !confirm(t('tenant.privacy.confirmExecuteRequest'))) return;
    setLoading(true);
    try {
      await governanceService.executeDataSubjectRequest(tenantId, id);
      setSuccess(t('tenant.privacy.dataRequestExecuteSuccess'));
      fetchDataRequests();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(t('tenant.privacy.dataRequestExecuteError'));
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const getRequestTypeIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      Access: <Search className="w-5 h-5" />,
      Deletion: <Trash2 className="w-5 h-5" />,
      Portability: <Download className="w-5 h-5" />,
      Rectification: <Edit className="w-5 h-5" />,
    };
    return icons[type] || <FileText className="w-5 h-5" />;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      Completed: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
      Pending: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
      InProgress: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
      Failed: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
    };
    return colors[status] || 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400';
  };

  const tabs = [
    { key: 'retention', label: 'Retention Policies', icon: <Clock className="w-4 h-4" /> },
    { key: 'requests', label: 'Data Requests', icon: <FileText className="w-4 h-4" /> },
  ];

  if (loading && retentionPolicies.length === 0 && dataRequests.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      <Helmet>
        <title>Privacy Management - OneSign</title>
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between mb-8"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Privacy Management</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">Manage data retention policies and GDPR/CCPA requests</p>
            </div>
          </div>
          {activeTab === 'requests' && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowRequestModal(true)}
              className="mt-4 md:mt-0 flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Plus className="w-5 h-5" />
              <span>Create Data Request</span>
            </motion.button>
          )}
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
              <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Active Policies"
            value={retentionPolicies.filter(p => p.enabled).length}
            icon={<Lock className="w-6 h-6 text-white" />}
            color="from-purple-500 to-indigo-600"
            delay={0}
          />
          <StatCard
            title="Total Requests"
            value={dataRequests.length}
            icon={<FileText className="w-6 h-6 text-white" />}
            color="from-blue-500 to-indigo-600"
            delay={1}
          />
          <StatCard
            title="Pending"
            value={dataRequests.filter(r => r.status === 'Pending').length}
            icon={<Clock className="w-6 h-6 text-white" />}
            color="from-yellow-500 to-amber-600"
            delay={2}
          />
          <StatCard
            title="Completed"
            value={dataRequests.filter(r => r.status === 'Completed').length}
            icon={<CheckCircle className="w-6 h-6 text-white" />}
            color="from-green-500 to-emerald-600"
            delay={3}
          />
        </div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 mb-6"
        >
          <div className="flex border-b border-gray-200 dark:border-slate-700">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center space-x-2 px-6 py-4 font-medium transition-all relative ${
                  activeTab === tab.key
                    ? 'text-purple-600 dark:text-purple-400'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {activeTab === tab.key && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600 dark:bg-purple-400"
                  />
                )}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Retention Policies Tab */}
        {activeTab === 'retention' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-slate-700/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Retention (days)</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Hard Delete After (days)</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                  {retentionPolicies.map((policy, idx) => (
                    <motion.tr
                      key={policy.category}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + idx * 0.05 }}
                      className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-medium text-gray-900 dark:text-white">{policy.category}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-300">
                        {policy.retentionPeriodDays}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-300">
                        {policy.hardDeleteAfter}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                          policy.enabled
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                        }`}>
                          {policy.enabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleUpdateRetention(policy.category, { enabled: !policy.enabled })}
                          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                            policy.enabled
                              ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
                              : 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                          }`}
                        >
                          {policy.enabled ? 'Disable' : 'Enable'}
                        </motion.button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Data Requests Tab */}
        {activeTab === 'requests' && (
          <div className="space-y-4">
            <AnimatePresence>
              {dataRequests.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-12 text-center"
                >
                  <FileText className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No data requests yet</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Create one to handle GDPR/CCPA requests</p>
                </motion.div>
              ) : (
                dataRequests.map((request, idx) => (
                  <motion.div
                    key={request.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6 hover:shadow-xl transition-all duration-300"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="flex items-start space-x-4">
                        <div className={`p-3 rounded-xl bg-gradient-to-br ${
                          request.type === 'Deletion' ? 'from-red-500 to-rose-600' :
                          request.type === 'Access' ? 'from-blue-500 to-indigo-600' :
                          request.type === 'Portability' ? 'from-green-500 to-emerald-600' :
                          'from-amber-500 to-orange-600'
                        }`}>
                          <span className="text-white">{getRequestTypeIcon(request.type)}</span>
                        </div>
                        <div>
                          <div className="flex items-center space-x-3">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{request.type} Request</h3>
                            <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(request.status)}`}>
                              {request.status}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 mt-1 text-sm text-gray-500 dark:text-gray-400">
                            <User className="w-4 h-4" />
                            <span>{request.subjectId}</span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">{request.reason}</p>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                            <span>Created: {new Date(request.createdAt).toLocaleString()}</span>
                            {request.completedAt && (
                              <span>Completed: {new Date(request.completedAt).toLocaleString()}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {request.status === 'Pending' && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleExecuteRequest(request.id)}
                          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg text-sm shadow-md hover:shadow-lg transition-all"
                        >
                          <RefreshCw className="w-4 h-4" />
                          <span>Execute</span>
                        </motion.button>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-xl p-6"
        >
          <div className="flex items-start space-x-4">
            <div className="p-2 bg-purple-100 dark:bg-purple-800/30 rounded-lg">
              <Shield className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="font-semibold text-purple-900 dark:text-purple-100">Privacy Compliance</h3>
              <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">
                This page helps you manage data privacy in compliance with GDPR, CCPA, and other regulations.
                Retention policies control how long data is kept, while data requests handle individual rights like access, deletion, and portability.
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Create Request Modal */}
      <Modal isOpen={showRequestModal} onClose={() => setShowRequestModal(false)} title={t('tenant.privacy.createDataRequest')}>
        <form onSubmit={handleCreateRequest} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Subject ID</label>
            <input
              type="text"
              value={requestForm.subjectId}
              onChange={(e) => setRequestForm({ ...requestForm, subjectId: e.target.value })}
              placeholder={t('tenant.privacy.placeholders.subjectId')}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Request Type</label>
            <select
              value={requestForm.type}
              onChange={(e) => setRequestForm({ ...requestForm, type: e.target.value as any })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="Access">Access (Right to Access)</option>
              <option value="Deletion">Deletion (Right to be Forgotten)</option>
              <option value="Portability">Portability (Right to Data Portability)</option>
              <option value="Rectification">Rectification (Right to Rectification)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Reason</label>
            <textarea
              value={requestForm.reason}
              onChange={(e) => setRequestForm({ ...requestForm, reason: e.target.value })}
              placeholder={t('tenant.privacy.placeholders.reason')}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              rows={3}
              required
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowRequestModal(false)}
              className="px-4 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
            >
              Cancel
            </motion.button>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all"
            >
              Create Request
            </motion.button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
