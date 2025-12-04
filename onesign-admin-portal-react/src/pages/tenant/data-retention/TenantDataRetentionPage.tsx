import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { tenantService } from '@/lib/api/services/tenant.service';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import Modal from '@/components/common/Modal';
import {
  Database,
  Clock,
  Trash2,
  Play,
  Plus,
  FileText,
  BarChart3,
  Archive,
  Users,
  Shield,
  Webhook,
  HardDrive,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Calendar,
  RefreshCw,
} from 'lucide-react';

interface RetentionPolicy {
  id: string;
  name: string;
  dataType: 'logs' | 'analytics' | 'backups' | 'user_data' | 'audit_logs' | 'webhooks';
  retentionDays: number;
  autoDelete: boolean;
  isActive: boolean;
  lastRun?: string;
  nextRun?: string;
  itemsDeleted: number;
  storageFreed: string;
  createdAt: string;
  updatedAt: string;
}

interface DataStats {
  dataType: string;
  totalRecords: number;
  oldestRecord: string;
  storageUsed: string;
  retentionDays: number;
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

export default function TenantDataRetentionPage() {
  const { t } = useTranslation();
  const [policies, setPolicies] = useState<RetentionPolicy[]>([]);
  const [stats, setStats] = useState<DataStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newPolicy, setNewPolicy] = useState({
    name: '',
    dataType: 'logs' as RetentionPolicy['dataType'],
    retentionDays: 30,
    autoDelete: true,
    isActive: true,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const data = await tenantService.getRetentionPolicies();
      const mockPolicies: RetentionPolicy[] = [
        {
          id: '1',
          name: 'Application Logs Retention',
          dataType: 'logs',
          retentionDays: 30,
          autoDelete: true,
          isActive: true,
          lastRun: '2024-11-23T02:00:00Z',
          nextRun: '2024-11-24T02:00:00Z',
          itemsDeleted: 1250000,
          storageFreed: '45 GB',
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-11-23T02:00:00Z',
        },
        {
          id: '2',
          name: 'Analytics Data Retention',
          dataType: 'analytics',
          retentionDays: 90,
          autoDelete: true,
          isActive: true,
          lastRun: '2024-11-23T03:00:00Z',
          nextRun: '2024-11-24T03:00:00Z',
          itemsDeleted: 850000,
          storageFreed: '120 GB',
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-11-23T03:00:00Z',
        },
        {
          id: '3',
          name: 'Old Backups Cleanup',
          dataType: 'backups',
          retentionDays: 180,
          autoDelete: true,
          isActive: true,
          lastRun: '2024-11-20T01:00:00Z',
          nextRun: '2024-11-27T01:00:00Z',
          itemsDeleted: 45,
          storageFreed: '2.5 TB',
          createdAt: '2024-02-01T09:00:00Z',
          updatedAt: '2024-11-20T01:00:00Z',
        },
        {
          id: '4',
          name: 'Inactive User Data',
          dataType: 'user_data',
          retentionDays: 365,
          autoDelete: false,
          isActive: true,
          itemsDeleted: 0,
          storageFreed: '0 GB',
          createdAt: '2024-03-10T14:00:00Z',
          updatedAt: '2024-03-10T14:00:00Z',
        },
        {
          id: '5',
          name: 'Audit Logs Retention',
          dataType: 'audit_logs',
          retentionDays: 365,
          autoDelete: true,
          isActive: true,
          lastRun: '2024-11-23T01:00:00Z',
          nextRun: '2024-11-24T01:00:00Z',
          itemsDeleted: 450000,
          storageFreed: '78 GB',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-11-23T01:00:00Z',
        },
        {
          id: '6',
          name: 'Webhook Logs Cleanup',
          dataType: 'webhooks',
          retentionDays: 14,
          autoDelete: true,
          isActive: true,
          lastRun: '2024-11-23T04:00:00Z',
          nextRun: '2024-11-24T04:00:00Z',
          itemsDeleted: 2150000,
          storageFreed: '15 GB',
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-11-23T04:00:00Z',
        },
      ];
      setPolicies(data || mockPolicies);

      setStats([
        { dataType: 'Logs', totalRecords: 45000000, oldestRecord: '2024-10-23T00:00:00Z', storageUsed: '1.2 TB', retentionDays: 30 },
        { dataType: 'Analytics', totalRecords: 125000000, oldestRecord: '2024-08-23T00:00:00Z', storageUsed: '3.5 TB', retentionDays: 90 },
        { dataType: 'Backups', totalRecords: 245, oldestRecord: '2024-05-23T00:00:00Z', storageUsed: '8.7 TB', retentionDays: 180 },
        { dataType: 'User Data', totalRecords: 45678, oldestRecord: '2023-11-23T00:00:00Z', storageUsed: '450 GB', retentionDays: 365 },
        { dataType: 'Audit Logs', totalRecords: 12500000, oldestRecord: '2023-11-23T00:00:00Z', storageUsed: '890 GB', retentionDays: 365 },
        { dataType: 'Webhooks', totalRecords: 78900000, oldestRecord: '2024-11-09T00:00:00Z', storageUsed: '45 GB', retentionDays: 14 },
      ]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      await tenantService.createRetentionPolicy('tenant-id', newPolicy);
      setShowCreate(false);
      setNewPolicy({ name: '', dataType: 'logs', retentionDays: 30, autoDelete: true, isActive: true });
      fetchData();
    } catch (error) {
      console.error('Failed to create retention policy:', error);
    }
  };

  const handleToggle = async (policyId: string) => {
    try {
      await tenantService.toggleRetentionPolicy('tenant-id', policyId);
      fetchData();
    } catch (error) {
      console.error('Failed to toggle retention policy:', error);
    }
  };

  const handleRunNow = async (policyId: string) => {
    if (!confirm(t('tenant.dataRetention.confirmRun'))) return;
    try {
      await tenantService.runRetentionPolicy('tenant-id', policyId);
      fetchData();
    } catch (error) {
      console.error('Failed to run retention policy:', error);
    }
  };

  const handleDelete = async (policyId: string) => {
    if (!confirm(t('tenant.dataRetention.confirmDelete'))) return;
    try {
      await tenantService.deleteRetentionPolicy('tenant-id', policyId);
      fetchData();
    } catch (error) {
      console.error('Failed to delete retention policy:', error);
    }
  };

  const getDataTypeIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      logs: <FileText className="w-5 h-5" />,
      analytics: <BarChart3 className="w-5 h-5" />,
      backups: <Archive className="w-5 h-5" />,
      user_data: <Users className="w-5 h-5" />,
      audit_logs: <Shield className="w-5 h-5" />,
      webhooks: <Webhook className="w-5 h-5" />,
    };
    return icons[type] || <Database className="w-5 h-5" />;
  };

  const getDataTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      logs: 'from-blue-500 to-blue-600',
      analytics: 'from-purple-500 to-purple-600',
      backups: 'from-green-500 to-green-600',
      user_data: 'from-yellow-500 to-yellow-600',
      audit_logs: 'from-red-500 to-red-600',
      webhooks: 'from-indigo-500 to-indigo-600',
    };
    return colors[type] || 'from-gray-500 to-gray-600';
  };

  const calculateTotalStorage = () => {
    return stats.reduce((acc, s) => {
      const value = parseFloat(s.storageUsed);
      const unit = s.storageUsed.split(' ')[1];
      if (unit === 'TB') return acc + value;
      if (unit === 'GB') return acc + value / 1024;
      return acc;
    }, 0).toFixed(2);
  };

  const calculateStorageFreed = () => {
    return policies.reduce((acc, p) => {
      const value = parseFloat(p.storageFreed);
      const unit = p.storageFreed.split(' ')[1];
      if (unit === 'TB') return acc + value;
      if (unit === 'GB') return acc + value / 1024;
      return acc;
    }, 0).toFixed(2);
  };

  if (loading) {
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
        <title>Data Retention - OneSign</title>
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
              <Database className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Data Retention Policies</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">Manage data lifecycle and storage optimization</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowCreate(true)}
            className="mt-4 md:mt-0 flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Plus className="w-5 h-5" />
            <span>{t('tenant.dataRetention.createPolicy', 'Create Policy')}</span>
          </motion.button>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Active Policies"
            value={policies.filter(p => p.isActive).length}
            icon={<CheckCircle className="w-6 h-6 text-white" />}
            color="from-green-500 to-emerald-600"
            delay={0}
          />
          <StatCard
            title="Total Storage"
            value={`${calculateTotalStorage()} TB`}
            icon={<HardDrive className="w-6 h-6 text-white" />}
            color="from-blue-500 to-indigo-600"
            delay={1}
          />
          <StatCard
            title="Items Deleted"
            value={`${(policies.reduce((acc, p) => acc + p.itemsDeleted, 0) / 1000000).toFixed(1)}M`}
            icon={<Trash2 className="w-6 h-6 text-white" />}
            color="from-red-500 to-rose-600"
            delay={2}
          />
          <StatCard
            title="Storage Freed"
            value={`${calculateStorageFreed()} TB`}
            icon={<RefreshCw className="w-6 h-6 text-white" />}
            color="from-purple-500 to-violet-600"
            delay={3}
          />
        </div>

        {/* Data Overview Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 mb-8 overflow-hidden"
        >
          <div className="p-6 border-b border-gray-200 dark:border-slate-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Data Storage Overview</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-slate-700/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Data Type</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Records</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Oldest Record</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Storage Used</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Retention</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                {stats.map((stat, idx) => (
                  <motion.tr
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + idx * 0.05 }}
                    className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-medium text-gray-900 dark:text-white">{stat.dataType}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-300">
                      {stat.totalRecords.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-300">
                      {new Date(stat.oldestRecord).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-semibold text-gray-900 dark:text-white">{stat.storageUsed}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full">
                        {stat.retentionDays} days
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Retention Policies */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Retention Policies</h2>
          <AnimatePresence>
            {policies.map((policy, idx) => (
              <motion.div
                key={policy.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6 hover:shadow-xl transition-all duration-300"
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className={`p-2 rounded-lg bg-gradient-to-br ${getDataTypeColor(policy.dataType)}`}>
                        <span className="text-white">{getDataTypeIcon(policy.dataType)}</span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{policy.name}</h3>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                        policy.isActive
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                      }`}>
                        {policy.isActive ? 'Active' : 'Inactive'}
                      </span>
                      {policy.autoDelete && (
                        <span className="px-3 py-1 text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full">
                          Auto Delete
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-500 dark:text-gray-400">Retention:</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{policy.retentionDays} days</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Trash2 className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-500 dark:text-gray-400">Deleted:</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{policy.itemsDeleted.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <HardDrive className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-500 dark:text-gray-400">Freed:</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{policy.storageFreed}</span>
                      </div>
                      {policy.lastRun && (
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-500 dark:text-gray-400">Last Run:</span>
                          <span className="text-gray-700 dark:text-gray-300">{new Date(policy.lastRun).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>

                    {policy.nextRun && (
                      <div className="mt-3 text-sm text-gray-500 dark:text-gray-400 flex items-center space-x-2">
                        <RefreshCw className="w-4 h-4" />
                        <span>Next scheduled run: {new Date(policy.nextRun).toLocaleString()}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-3">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={policy.isActive}
                        onChange={() => handleToggle(policy.id)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 dark:bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                    {policy.isActive && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleRunNow(policy.id)}
                        className="flex items-center space-x-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg text-sm shadow-md hover:shadow-lg transition-all"
                      >
                        <Play className="w-4 h-4" />
                        <span>Run Now</span>
                      </motion.button>
                    )}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDelete(policy.id)}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </motion.button>
                  </div>
                </div>

                {!policy.autoDelete && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg flex items-start space-x-3"
                  >
                    <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Manual Review Required</p>
                      <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                        This policy identifies old data but doesn't automatically delete it. Review and manually delete data when ready.
                      </p>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Create Policy Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title={t('tenant.dataRetention.createRetentionPolicy', 'Create Retention Policy')}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Policy Name</label>
            <input
              type="text"
              value={newPolicy.name}
              onChange={(e) => setNewPolicy({ ...newPolicy, name: e.target.value })}
              placeholder={t('tenant.dataRetention.placeholders.policyName')}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Data Type</label>
            <select
              value={newPolicy.dataType}
              onChange={(e) => setNewPolicy({ ...newPolicy, dataType: e.target.value as RetentionPolicy['dataType'] })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="logs">Application Logs</option>
              <option value="analytics">Analytics Data</option>
              <option value="backups">Backups</option>
              <option value="user_data">User Data</option>
              <option value="audit_logs">Audit Logs</option>
              <option value="webhooks">Webhook Logs</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Retention Period (Days)</label>
            <input
              type="number"
              value={newPolicy.retentionDays}
              onChange={(e) => setNewPolicy({ ...newPolicy, retentionDays: parseInt(e.target.value) || 30 })}
              min={1}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {t('tenant.dataRetention.retentionHelp')}
            </p>
          </div>

          <div className="space-y-3">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={newPolicy.autoDelete}
                onChange={(e) => setNewPolicy({ ...newPolicy, autoDelete: e.target.checked })}
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Automatically delete old data</span>
            </label>
            <p className="ml-7 text-xs text-gray-500 dark:text-gray-400">
              If unchecked, policy will only identify old data for manual review
            </p>

            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={newPolicy.isActive}
                onChange={(e) => setNewPolicy({ ...newPolicy, isActive: e.target.checked })}
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Enable policy immediately</span>
            </label>
          </div>

          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 dark:text-red-300">
              <strong>Warning:</strong> Deleted data cannot be recovered. Ensure you have adequate backups before enabling auto-delete.
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowCreate(false)}
              className="px-4 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
            >
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCreate}
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all"
            >
              Create Policy
            </motion.button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
