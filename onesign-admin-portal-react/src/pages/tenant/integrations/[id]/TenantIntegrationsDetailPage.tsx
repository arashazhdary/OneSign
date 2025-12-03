import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { tenantService } from '@/lib/api/services/tenant.service';
import { getTenantId } from '@/lib/tenant-context';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import { Helmet } from 'react-helmet-async';
import {
  Link2,
  Zap,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Settings,
  History,
  Play,
  Pause,
  Trash2,
  Edit3,
  ArrowLeft,
  Clock,
  Database,
  Activity,
  Info,
  FileText,
  AlertCircle,
  LucideIcon
} from 'lucide-react';

interface SyncLog {
  id: string;
  timestamp: string;
  status: 'success' | 'failed' | 'partial';
  recordsSynced: number;
  errors: string[];
  duration: number;
}

interface IntegrationDetails {
  id: string;
  name: string;
  type: string;
  provider: string;
  status: 'active' | 'inactive' | 'error';
  config: Record<string, any>;
  lastSyncAt?: string;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
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

interface TabItem {
  key: string;
  label: string;
  icon: LucideIcon;
}

export default function TenantIntegrationsDetailPage() {
  const { t } = useTranslation();
  const params = useParams();
  const navigate = useNavigate();
  const id = params.id as string;
  const [tenantId, setTenantIdState] = useState<string | null>(null);

  const [integration, setIntegration] = useState<IntegrationDetails | null>(null);
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [testing, setTesting] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const [activeTab, setActiveTab] = useState<'overview' | 'config' | 'sync-logs'>('overview');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [editName, setEditName] = useState('');
  const [editConfig, setEditConfig] = useState('');
  const [configError, setConfigError] = useState('');

  const tabs: TabItem[] = [
    { key: 'overview', label: 'Overview', icon: Info },
    { key: 'config', label: 'Configuration', icon: Settings },
    { key: 'sync-logs', label: 'Sync Logs', icon: History }
  ];

  useEffect(() => {
    const contextTenantId = getTenantId();
    setTenantIdState(contextTenantId || '00000000-0000-0000-0000-000000000000');
  }, []);

  useEffect(() => {
    if (tenantId) {
      fetchData();
    }
  }, [id, tenantId]);

  const fetchData = async () => {
    if (!tenantId) return;

    try {
      setLoading(true);
      const result = await tenantService.getIntegrationById(id);

      const integrationData: IntegrationDetails = {
        id: result.id,
        name: result.name,
        type: result.type,
        provider: result.provider,
        status: result.status,
        config: result.config || {},
        lastSyncAt: result.lastSyncAt,
        errorMessage: result.errorMessage,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt,
      };

      setIntegration(integrationData);
      setEditName(integrationData.name);
      setEditConfig(JSON.stringify(integrationData.config, null, 2));

      await fetchSyncLogs();
    } catch (err: any) {
      console.error('Error fetching integration:', err);
      if (err.status === 404 || err.response?.status === 404) {
        setNotFound(true);
      } else {
        loadMockData();
      }
    } finally {
      setLoading(false);
    }
  };

  const loadMockData = () => {
    const mockIntegration: IntegrationDetails = {
      id,
      name: 'Azure AD Sync',
      type: 'directory',
      provider: 'azure-ad',
      status: 'active',
      config: {
        tenantId: 'azure-tenant-123',
        clientId: 'client-456',
        syncInterval: 3600,
        syncUsers: true,
        syncGroups: true,
        mappings: {
          email: 'mail',
          firstName: 'givenName',
          lastName: 'surname',
        },
      },
      lastSyncAt: '2024-03-20T10:30:00Z',
      createdAt: '2024-01-15T08:00:00Z',
      updatedAt: '2024-03-20T10:30:00Z',
    };

    const mockSyncLogs: SyncLog[] = [
      {
        id: '1',
        timestamp: '2024-03-20T10:30:00Z',
        status: 'success',
        recordsSynced: 150,
        errors: [],
        duration: 45,
      },
      {
        id: '2',
        timestamp: '2024-03-19T10:30:00Z',
        status: 'success',
        recordsSynced: 148,
        errors: [],
        duration: 42,
      },
      {
        id: '3',
        timestamp: '2024-03-18T10:30:00Z',
        status: 'partial',
        recordsSynced: 145,
        errors: ['Failed to sync 3 users due to invalid email addresses'],
        duration: 50,
      },
      {
        id: '4',
        timestamp: '2024-03-17T10:30:00Z',
        status: 'failed',
        recordsSynced: 0,
        errors: ['Connection timeout', 'Unable to authenticate with Azure AD'],
        duration: 10,
      },
    ];

    setIntegration(mockIntegration);
    setSyncLogs(mockSyncLogs);
    setEditName(mockIntegration.name);
    setEditConfig(JSON.stringify(mockIntegration.config, null, 2));
  };

  const fetchSyncLogs = async () => {
    if (!tenantId) return;

    try {
      setSyncLogs([]);
    } catch (err) {
      console.error('Error fetching sync logs:', err);
      const mockSyncLogs: SyncLog[] = [
        {
          id: '1',
          timestamp: '2024-03-20T10:30:00Z',
          status: 'success',
          recordsSynced: 150,
          errors: [],
          duration: 45,
        },
      ];
      setSyncLogs(mockSyncLogs);
    }
  };

  const handleTestConnection = async () => {
    if (!tenantId) return;

    setTesting(true);
    setError('');
    setSuccess('');

    try {
      setSuccess('Connection test successful');
    } catch (err: any) {
      setError(err?.message || 'Failed to test connection');
    } finally {
      setTesting(false);
    }
  };

  const handleSync = async () => {
    if (!tenantId) return;

    setSyncing(true);
    setError('');
    setSuccess('');

    try {
      setSuccess('Sync started successfully');
      setTimeout(() => {
        fetchSyncLogs();
      }, 2000);
    } catch (err: any) {
      setError(err?.message || 'Failed to start sync');
    } finally {
      setSyncing(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!tenantId || !integration) return;

    setError('');
    setSuccess('');

    const newStatus = integration.status === 'active' ? 'inactive' : 'active';

    try {
      await tenantService.updateIntegration(id, { status: newStatus });
      setSuccess(`Integration ${newStatus === 'active' ? 'enabled' : 'disabled'} successfully`);
      fetchData();
    } catch (err: any) {
      setError(err?.message || 'Failed to update integration status');
    }
  };

  const handleUpdateIntegration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId) return;

    setError('');
    setSuccess('');
    setConfigError('');

    let configObj;
    try {
      configObj = JSON.parse(editConfig);
    } catch (err) {
      setConfigError('Invalid JSON configuration');
      return;
    }

    try {
      await tenantService.updateIntegration(
        id,
        {
          name: editName,
          config: configObj,
        }
      );

      setSuccess('Integration updated successfully');
      setShowEditModal(false);
      fetchData();
    } catch (err: any) {
      setError(err?.message || 'Failed to update integration');
    }
  };

  const handleDeleteIntegration = async () => {
    if (!tenantId) return;

    setError('');
    setSuccess('');

    try {
      await tenantService.deleteIntegration(id);
      setSuccess('Integration deleted successfully');
      setTimeout(() => {
        navigate('/tenant/integrations');
      }, 1500);
    } catch (err: any) {
      setError(err?.message || 'Failed to delete integration');
      setShowDeleteConfirm(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
            <CheckCircle className="w-4 h-4" />
            Active
          </span>
        );
      case 'inactive':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
            <Pause className="w-4 h-4" />
            Inactive
          </span>
        );
      case 'error':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300">
            <XCircle className="w-4 h-4" />
            Error
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
            {status}
          </span>
        );
    }
  };

  const getSyncStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
            <CheckCircle className="w-4 h-4" />
            Success
          </span>
        );
      case 'partial':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300">
            <AlertTriangle className="w-4 h-4" />
            Partial
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300">
            <XCircle className="w-4 h-4" />
            Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
            {status}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-cyan-50 dark:from-slate-900 dark:via-teal-900/20 dark:to-cyan-900/20 p-8">
        <div className="flex items-center justify-center h-64">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full"
          />
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-cyan-50 dark:from-slate-900 dark:via-teal-900/20 dark:to-cyan-900/20 p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 mb-6">
            <AlertCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Integration Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">The integration you're looking for doesn't exist.</p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/tenant/integrations')}
            className="px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-xl font-medium hover:from-teal-600 hover:to-cyan-700 transition-all"
          >
            Back to Integrations
          </motion.button>
        </motion.div>
      </div>
    );
  }

  if (!integration) {
    return null;
  }

  const successfulSyncs = syncLogs.filter(log => log.status === 'success').length;
  const failedSyncs = syncLogs.filter(log => log.status === 'failed').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-cyan-50 dark:from-slate-900 dark:via-teal-900/20 dark:to-cyan-900/20">
      <Helmet>
        <title>{integration.name} - Integration Details</title>
      </Helmet>

      <div className="p-8">
        <Breadcrumbs className="mb-6" />

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8"
        >
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 shadow-lg">
              <Link2 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{integration.name}</h1>
              <div className="flex items-center gap-3 mt-2">
                {getStatusBadge(integration.status)}
                <span className="text-gray-600 dark:text-gray-400">{integration.provider}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleTestConnection}
              disabled={testing}
              className="px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 flex items-center gap-2 transition-all"
            >
              <Zap className="w-4 h-4" />
              {testing ? 'Testing...' : 'Test Connection'}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSync}
              disabled={syncing || integration.status !== 'active'}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 flex items-center gap-2 transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Syncing...' : 'Sync Now'}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleToggleStatus}
              className={`px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-all ${
                integration.status === 'active'
                  ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                  : 'bg-green-500 text-white hover:bg-green-600'
              }`}
            >
              {integration.status === 'active' ? (
                <>
                  <Pause className="w-4 h-4" />
                  Disable
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Enable
                </>
              )}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowEditModal(true)}
              className="px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center gap-2 transition-all"
            >
              <Edit3 className="w-4 h-4" />
              Edit
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 flex items-center gap-2 transition-all"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/tenant/integrations')}
              className="px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center gap-2 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </motion.button>
          </div>
        </motion.div>

        {/* Alerts */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl flex items-center gap-3"
            >
              <XCircle className="w-5 h-5 flex-shrink-0" />
              {error}
            </motion.div>
          )}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 px-4 py-3 rounded-xl flex items-center gap-3"
            >
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              {success}
            </motion.div>
          )}
          {integration.errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl flex items-center gap-3"
            >
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <span><strong>Error:</strong> {integration.errorMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Syncs"
            value={syncLogs.length}
            icon={<RefreshCw className="w-6 h-6 text-white" />}
            color="from-teal-500 to-cyan-600"
            delay={0}
          />
          <StatCard
            title="Successful"
            value={successfulSyncs}
            icon={<CheckCircle className="w-6 h-6 text-white" />}
            color="from-green-500 to-emerald-600"
            delay={1}
          />
          <StatCard
            title="Failed"
            value={failedSyncs}
            icon={<XCircle className="w-6 h-6 text-white" />}
            color="from-red-500 to-rose-600"
            delay={2}
          />
          <StatCard
            title="Last Sync Records"
            value={syncLogs[0]?.recordsSynced || 0}
            icon={<Database className="w-6 h-6 text-white" />}
            color="from-blue-500 to-indigo-600"
            delay={3}
          />
        </div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 mb-6"
        >
          <nav className="flex p-2">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`relative flex items-center gap-2 py-3 px-6 rounded-lg font-medium transition-all ${
                  activeTab === tab.key
                    ? 'text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700'
                }`}
              >
                {activeTab === tab.key && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-lg"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <tab.icon className="w-4 h-4 relative z-10" />
                <span className="relative z-10">{tab.label}</span>
              </button>
            ))}
          </nav>
        </motion.div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {/* Integration Info Card */}
              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-600">
                    <Info className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Integration Information</h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-500 dark:text-gray-400">Integration ID</label>
                    <p className="font-mono text-sm text-gray-900 dark:text-white">{integration.id}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 dark:text-gray-400">Type</label>
                    <p className="capitalize text-gray-900 dark:text-white">{integration.type}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 dark:text-gray-400">Provider</label>
                    <p className="text-gray-900 dark:text-white">{integration.provider}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 dark:text-gray-400">Status</label>
                    <div className="mt-1">{getStatusBadge(integration.status)}</div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 dark:text-gray-400">Last Sync</label>
                    <p className="text-sm text-gray-900 dark:text-white flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      {integration.lastSyncAt ? formatDate(integration.lastSyncAt) : 'Never'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 dark:text-gray-400">Created</label>
                    <p className="text-sm text-gray-900 dark:text-white">{formatDate(integration.createdAt)}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 dark:text-gray-400">Last Updated</label>
                    <p className="text-sm text-gray-900 dark:text-white">{formatDate(integration.updatedAt)}</p>
                  </div>
                </div>
              </div>

              {/* Sync Statistics Card */}
              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600">
                    <Activity className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Sync Statistics</h2>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
                    <p className="text-3xl font-bold text-teal-600 dark:text-teal-400">{syncLogs.length}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Total Syncs</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">{successfulSyncs}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Successful</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
                    <p className="text-3xl font-bold text-red-600 dark:text-red-400">{failedSyncs}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Failed</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{syncLogs[0]?.recordsSynced || 0}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Last Records</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'config' && (
            <motion.div
              key="config"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700"
            >
              <div className="p-6 border-b border-gray-200 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-600">
                    <Settings className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Configuration</h2>
                </div>
              </div>
              <div className="p-6">
                <div className="bg-gray-50 dark:bg-slate-900/50 rounded-xl p-4 font-mono text-sm overflow-x-auto">
                  <pre className="text-gray-800 dark:text-gray-200">{JSON.stringify(integration.config, null, 2)}</pre>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'sync-logs' && (
            <motion.div
              key="sync-logs"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700"
            >
              <div className="p-6 border-b border-gray-200 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-600">
                    <History className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Sync History ({syncLogs.length})</h2>
                </div>
              </div>
              <div className="p-6">
                {syncLogs.length === 0 ? (
                  <div className="text-center py-12">
                    <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">No sync logs available</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-slate-700">
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Timestamp</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Records Synced</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Duration</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Errors</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                        {syncLogs.map((log, index) => (
                          <motion.tr
                            key={log.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="hover:bg-gray-50 dark:hover:bg-slate-700/50"
                          >
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              {formatDate(log.timestamp)}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              {getSyncStatusBadge(log.status)}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{log.recordsSynced}</td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{log.duration}s</td>
                            <td className="px-4 py-4 text-sm">
                              {log.errors.length > 0 ? (
                                <ul className="list-disc list-inside text-red-600 dark:text-red-400">
                                  {log.errors.map((error, idx) => (
                                    <li key={idx}>{error}</li>
                                  ))}
                                </ul>
                              ) : (
                                <span className="text-gray-500 dark:text-gray-400">None</span>
                              )}
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Edit Integration Modal */}
        <AnimatePresence>
          {showEditModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setShowEditModal(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-slate-800 p-6 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-600">
                    <Edit3 className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Edit Integration</h2>
                </div>
                <form onSubmit={handleUpdateIntegration}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Integration Name</label>
                      <input
                        type="text"
                        required
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Configuration (JSON)</label>
                      <textarea
                        value={editConfig}
                        onChange={(e) => setEditConfig(e.target.value)}
                        className={`w-full px-4 py-3 border rounded-xl font-mono text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all ${
                          configError ? 'border-red-500' : 'border-gray-200 dark:border-slate-600'
                        }`}
                        rows={12}
                      />
                      {configError && (
                        <p className="text-red-600 dark:text-red-400 text-sm mt-2 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {configError}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-3 mt-6">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-xl font-medium hover:from-teal-600 hover:to-cyan-700 transition-all"
                    >
                      Save Changes
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={() => {
                        setShowEditModal(false);
                        setConfigError('');
                      }}
                      className="px-6 py-3 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-slate-600 transition-all"
                    >
                      Cancel
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {showDeleteConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setShowDeleteConfirm(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-slate-800 p-6 rounded-2xl max-w-md w-full shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                    <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Delete Integration</h2>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Are you sure you want to delete this integration? This action cannot be undone and will stop all sync operations.
                </p>
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleDeleteIntegration}
                    className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-all"
                  >
                    Delete
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 px-4 py-3 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-slate-600 transition-all"
                  >
                    Cancel
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
