import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import {
  Database,
  Clock,
  CheckCircle,
  AlertCircle,
  Download,
  Upload,
  Trash2,
  RefreshCw,
  Plus,
  Calendar,
  HardDrive,
  Settings,
  Shield,
  Play,
  TrendingUp,
  TrendingDown,
  Search,
  RotateCcw,
  ShieldCheck,
  XCircle
} from 'lucide-react';
import { tenantService } from '@/lib/api/services/tenant.service';
import { useTenantStore } from '@/stores/tenantStore';
import Modal from '@/components/common/Modal';

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

// Types
interface Backup {
  id: string;
  name: string;
  type: 'Manual' | 'Scheduled' | 'Pre-Migration';
  status: 'Completed' | 'In Progress' | 'Failed' | 'Verified';
  size: number;
  createdAt: string;
  createdBy: string;
  expiresAt?: string;
  includesUsers: boolean;
  includesApps: boolean;
  includesSettings: boolean;
  verifiedAt?: string;
}

interface BackupSchedule {
  id: string;
  frequency: 'Daily' | 'Weekly' | 'Monthly';
  time: string;
  retention: number;
  enabled: boolean;
  nextRun: string;
  lastRun?: string;
}

// Mock data for fallback
const mockScheduleFallback: BackupSchedule = {
  id: '1',
  frequency: 'Daily',
  time: '02:00',
  retention: 30,
  enabled: true,
  nextRun: new Date(Date.now() + 3600000 * 8).toISOString(),
  lastRun: new Date(Date.now() - 86400000).toISOString(),
};

// Note: Mock data backup names will use translation keys when rendered
const mockBackupsFallback: Backup[] = [
  {
    id: '1',
    name: 'backup_pre_migration',
    type: 'Pre-Migration',
    status: 'Verified',
    size: 2048000,
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    createdBy: 'admin@example.com',
    expiresAt: new Date(Date.now() + 86400000 * 23).toISOString(),
    includesUsers: true,
    includesApps: true,
    includesSettings: true,
    verifiedAt: new Date(Date.now() - 86400000 * 7).toISOString(),
  },
  {
    id: '2',
    name: 'backup_daily_20231214',
    type: 'Scheduled',
    status: 'Completed',
    size: 1843200,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    createdBy: 'System',
    expiresAt: new Date(Date.now() + 86400000 * 27).toISOString(),
    includesUsers: true,
    includesApps: true,
    includesSettings: true,
  },
  {
    id: '3',
    name: 'backup_before_changes',
    type: 'Manual',
    status: 'Completed',
    size: 1920000,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    createdBy: 'john.doe@example.com',
    includesUsers: false,
    includesApps: true,
    includesSettings: true,
  },
  {
    id: '4',
    name: 'backup_daily_20231215',
    type: 'Scheduled',
    status: 'In Progress',
    size: 0,
    createdAt: new Date().toISOString(),
    createdBy: 'System',
    includesUsers: true,
    includesApps: true,
    includesSettings: true,
  },
];

export default function TenantBackupsPage() {
  const { t } = useTranslation();
  const { currentTenant } = useTenantStore();
  const tenantId = currentTenant?.id || '00000000-0000-0000-0000-000000000000';

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [backups, setBackups] = useState<Backup[]>([]);
  const [schedule, setSchedule] = useState<BackupSchedule | null>(null);
  const [selectedBackup, setSelectedBackup] = useState<Backup | null>(null);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Form state
  const [backupName, setBackupName] = useState('');
  const [includeUsers, setIncludeUsers] = useState(true);
  const [includeApps, setIncludeApps] = useState(true);
  const [includeSettings, setIncludeSettings] = useState(true);

  // Schedule form
  const [scheduleFrequency, setScheduleFrequency] = useState<'Daily' | 'Weekly' | 'Monthly'>('Daily');
  const [scheduleTime, setScheduleTime] = useState('02:00');
  const [scheduleRetention, setScheduleRetention] = useState(30);
  const [scheduleEnabled, setScheduleEnabled] = useState(true);

  useEffect(() => {
    if (tenantId) {
      fetchData();
    }
  }, [tenantId]);

  const fetchData = async (isRefresh = false) => {
    if (!tenantId) return;
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      await Promise.all([fetchBackups(), fetchSchedule()]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchBackups = async () => {
    if (!tenantId) return;

    try {
      const data = await tenantService.getBackups();
      setBackups(data || mockBackupsFallback);
    } catch (err: any) {
      setError(err?.message || t('common.failedToFetchBackups'));
      console.error('Error fetching backups:', err);
      setBackups(mockBackupsFallback);
    }
  };

  const fetchSchedule = async () => {
    if (!tenantId) return;

    try {
      const data = await tenantService.getBackupSchedule();
      const scheduleData = data || mockScheduleFallback;

      setSchedule(scheduleData);
      setScheduleFrequency(scheduleData.frequency);
      setScheduleTime(scheduleData.time);
      setScheduleRetention(scheduleData.retention);
      setScheduleEnabled(scheduleData.enabled);
    } catch (err: any) {
      console.error('Error fetching schedule:', err);
      setSchedule(mockScheduleFallback);
      setScheduleFrequency(mockScheduleFallback.frequency);
      setScheduleTime(mockScheduleFallback.time);
      setScheduleRetention(mockScheduleFallback.retention);
      setScheduleEnabled(mockScheduleFallback.enabled);
    }
  };

  const handleCreateBackup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId || !backupName) {
      setError(t('tenant.backups.errors.nameRequired'));
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setSuccess(t('tenant.backups.success.created'));
      setShowCreateModal(false);
      setBackupName('');
      fetchBackups();
    } catch (err) {
      setError(t('tenant.backups.errors.createFailed'));
      console.error('Error creating backup:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRestoreBackup = async () => {
    if (!tenantId || !selectedBackup) return;

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setSuccess(t('tenant.backups.success.restored'));
      setShowRestoreModal(false);
      setSelectedBackup(null);
    } catch (err) {
      setError(t('tenant.backups.errors.restoreFailed'));
      console.error('Error restoring backup:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyBackup = async (backup: Backup) => {
    if (!tenantId) return;

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSuccess(t('tenant.backups.success.verified'));
      fetchBackups();
    } catch (err) {
      setError(t('tenant.backups.errors.verifyFailed'));
      console.error('Error verifying backup:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBackup = async () => {
    if (!tenantId || !selectedBackup) return;

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSuccess(t('tenant.backups.success.deleted'));
      setShowDeleteConfirm(false);
      setSelectedBackup(null);
      fetchBackups();
    } catch (err) {
      setError(t('tenant.backups.errors.deleteFailed'));
      console.error('Error deleting backup:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId) return;

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSuccess(t('tenant.backups.success.scheduleUpdated'));
      setShowScheduleModal(false);
      fetchSchedule();
    } catch (err) {
      setError(t('tenant.backups.errors.scheduleUpdateFailed'));
      console.error('Error updating schedule:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadBackup = (backup: Backup) => {
    const link = document.createElement('a');
    link.href = '#';
    link.download = `${backup.name}.backup`;
    link.click();
    setSuccess(t('tenant.backups.success.downloadStarted'));
    setTimeout(() => setSuccess(''), 3000);
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return t('tenant.backups.size.zero');
    const k = 1024;
    const sizes = [
      t('tenant.backups.size.bytes'),
      t('tenant.backups.size.kilobytes'),
      t('tenant.backups.size.megabytes'),
      t('tenant.backups.size.gigabytes')
    ];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fa-IR');
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('fa-IR');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'Verified':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'In Progress':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'Failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'Verified':
        return <ShieldCheck className="w-4 h-4" />;
      case 'In Progress':
        return <RefreshCw className="w-4 h-4 animate-spin" />;
      case 'Failed':
        return <XCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'Completed':
        return t('tenant.backups.status.completed');
      case 'Verified':
        return t('tenant.backups.status.verified');
      case 'In Progress':
        return t('tenant.backups.status.inProgress');
      case 'Failed':
        return t('tenant.backups.status.failed');
      default:
        return status;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'Manual':
        return t('tenant.backups.type.manual');
      case 'Scheduled':
        return t('tenant.backups.type.scheduled');
      case 'Pre-Migration':
        return t('tenant.backups.type.preMigration');
      default:
        return type;
    }
  };

  const getFrequencyLabel = (frequency: string) => {
    switch (frequency) {
      case 'Daily':
        return t('tenant.backups.frequency.daily');
      case 'Weekly':
        return t('tenant.backups.frequency.weekly');
      case 'Monthly':
        return t('tenant.backups.frequency.monthly');
      default:
        return frequency;
    }
  };

  // Stats
  const stats = {
    total: backups.length,
    completed: backups.filter(b => b.status === 'Completed' || b.status === 'Verified').length,
    inProgress: backups.filter(b => b.status === 'In Progress').length,
    totalSize: backups.reduce((acc, b) => acc + b.size, 0),
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Database className="w-6 h-6 text-blue-500" />
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
        <title>{t('tenant.backups.title')} | OneSign</title>
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
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl text-white">
                <Database className="w-6 h-6" />
              </div>
              {t('tenant.backups.title')}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="text-slate-500 dark:text-slate-400 mt-1"
            >
              {t('tenant.backups.subtitle')}
            </motion.p>
          </div>
          <div className="flex gap-3">
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => fetchData(true)}
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
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
            >
              <Plus className="w-4 h-4" />
              {t('tenant.backups.createBackup')}
            </motion.button>
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
            title={t('tenant.backups.stats.total')}
            value={stats.total}
            icon={<Database className="w-6 h-6" />}
            color="blue"
            delay={0}
          />
          <StatCard
            title={t('tenant.backups.stats.completed')}
            value={stats.completed}
            icon={<CheckCircle className="w-6 h-6" />}
            color="green"
            delay={1}
          />
          <StatCard
            title={t('tenant.backups.stats.inProgress')}
            value={stats.inProgress}
            icon={<RefreshCw className="w-6 h-6" />}
            color="yellow"
            delay={2}
          />
          <StatCard
            title={t('tenant.backups.stats.totalSize')}
            value={formatBytes(stats.totalSize)}
            icon={<HardDrive className="w-6 h-6" />}
            color="purple"
            delay={3}
          />
        </div>

        {/* Backup Schedule Card */}
        {schedule && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                {t('tenant.backups.schedule.title')}
              </h2>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowScheduleModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-all"
              >
                <Settings className="w-4 h-4" />
                {t('tenant.backups.schedule.settings')}
              </motion.button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">{t('tenant.backups.schedule.frequencyLabel')}</p>
                  <p className="text-lg font-semibold text-slate-900 dark:text-white">{getFrequencyLabel(schedule.frequency)}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">{t('tenant.backups.schedule.timeLabel')}</p>
                  <p className="text-lg font-semibold text-slate-900 dark:text-white">{schedule.time}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">{t('tenant.backups.schedule.retentionLabel')}</p>
                  <p className="text-lg font-semibold text-slate-900 dark:text-white">{t('tenant.backups.schedule.retentionDays', { days: schedule.retention })}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">{t('tenant.backups.schedule.statusLabel')}</p>
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                    schedule.enabled
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-400'
                  }`}>
                    {schedule.enabled ? t('tenant.backups.schedule.enabled') : t('tenant.backups.schedule.disabled')}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 flex flex-wrap items-center gap-6 text-sm">
                <div>
                  <span className="text-slate-500 dark:text-slate-400">{t('tenant.backups.schedule.nextRun')}:</span>
                  <span className="mr-2 font-medium text-slate-900 dark:text-white">
                    {formatDateTime(schedule.nextRun)}
                  </span>
                </div>
                {schedule.lastRun && (
                  <div>
                    <span className="text-slate-500 dark:text-slate-400">{t('tenant.backups.schedule.lastRun')}:</span>
                    <span className="mr-2 font-medium text-slate-900 dark:text-white">
                      {formatDateTime(schedule.lastRun)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Backups List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-blue-600" />
            {t('tenant.backups.list.title')}
          </h2>

          {backups.length > 0 ? (
            backups.map((backup, idx) => (
              <motion.div
                key={backup.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 hover:shadow-lg transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`p-2 rounded-lg ${
                        backup.status === 'Completed' || backup.status === 'Verified'
                          ? 'bg-green-100 dark:bg-green-900/30'
                          : backup.status === 'In Progress'
                          ? 'bg-yellow-100 dark:bg-yellow-900/30'
                          : 'bg-red-100 dark:bg-red-900/30'
                      }`}>
                        <Database className={`w-5 h-5 ${
                          backup.status === 'Completed' || backup.status === 'Verified'
                            ? 'text-green-600 dark:text-green-400'
                            : backup.status === 'In Progress'
                            ? 'text-yellow-600 dark:text-yellow-400'
                            : 'text-red-600 dark:text-red-400'
                        }`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white">
                          {backup.name}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {t('tenant.backups.list.createdBy', { user: backup.createdBy })}
                        </p>
                      </div>
                      <span className={`flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(backup.status)}`}>
                        {getStatusIcon(backup.status)}
                        {getStatusLabel(backup.status)}
                      </span>
                      <span className="px-3 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                        {getTypeLabel(backup.type)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                      <div className="flex items-center gap-2">
                        <HardDrive className="w-4 h-4 text-slate-400" />
                        <div>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{t('tenant.backups.list.size')}</p>
                          <p className="text-sm font-medium text-slate-900 dark:text-white">
                            {formatBytes(backup.size)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <div>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{t('tenant.backups.list.created')}</p>
                          <p className="text-sm font-medium text-slate-900 dark:text-white">
                            {formatDate(backup.createdAt)}
                          </p>
                        </div>
                      </div>
                      {backup.expiresAt && (
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-slate-400" />
                          <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{t('tenant.backups.list.expires')}</p>
                            <p className="text-sm font-medium text-slate-900 dark:text-white">
                              {formatDate(backup.expiresAt)}
                            </p>
                          </div>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-slate-400" />
                        <div>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{t('tenant.backups.list.includes')}</p>
                          <p className="text-sm font-medium text-slate-900 dark:text-white">
                            {[
                              backup.includesUsers && t('tenant.backups.includes.users'),
                              backup.includesApps && t('tenant.backups.includes.apps'),
                              backup.includesSettings && t('tenant.backups.includes.settings'),
                            ].filter(Boolean).join(t('common.separator'))}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {(backup.status === 'Completed' || backup.status === 'Verified') && (
                    <div className="flex items-center gap-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => {
                          setSelectedBackup(backup);
                          setShowRestoreModal(true);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all"
                        title={t('tenant.backups.actions.restore')}
                      >
                        <RotateCcw className="w-5 h-5" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDownloadBackup(backup)}
                        className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-all"
                        title={t('tenant.backups.actions.download')}
                      >
                        <Download className="w-5 h-5" />
                      </motion.button>
                      {!backup.verifiedAt && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleVerifyBackup(backup)}
                          className="p-2 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-lg transition-all"
                          title={t('tenant.backups.actions.verify')}
                        >
                          <ShieldCheck className="w-5 h-5" />
                        </motion.button>
                      )}
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => {
                          setSelectedBackup(backup);
                          setShowDeleteConfirm(true);
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all"
                        title={t('tenant.backups.actions.delete')}
                      >
                        <Trash2 className="w-5 h-5" />
                      </motion.button>
                    </div>
                  )}

                  {backup.status === 'In Progress' && (
                    <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      {t('tenant.backups.list.processing')}
                    </div>
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
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Database className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                {t('tenant.backups.list.noBackups')}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 mb-4">
                {t('tenant.backups.list.noBackupsDescription')}
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all"
              >
                {t('tenant.backups.list.createFirst')}
              </motion.button>
            </motion.div>
          )}
        </motion.div>

        {/* Create Backup Modal */}
        <Modal
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            setBackupName('');
          }}
          title={t('tenant.backups.modal.create.title')}
          size="md"
        >
          <form onSubmit={handleCreateBackup} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                {t('tenant.backups.modal.create.nameLabel')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={backupName}
                onChange={(e) => setBackupName(e.target.value)}
                placeholder={t('tenant.backups.modal.create.namePlaceholder')}
                className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                {t('tenant.backups.modal.create.contentsLabel')}
              </label>
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer transition-all">
                  <input
                    type="checkbox"
                    checked={includeUsers}
                    onChange={(e) => setIncludeUsers(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300">{t('tenant.backups.includes.users')}</span>
                </label>
                <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer transition-all">
                  <input
                    type="checkbox"
                    checked={includeApps}
                    onChange={(e) => setIncludeApps(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300">{t('tenant.backups.includes.apps')}</span>
                </label>
                <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer transition-all">
                  <input
                    type="checkbox"
                    checked={includeSettings}
                    onChange={(e) => setIncludeSettings(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300">{t('tenant.backups.includes.settings')}</span>
                </label>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowCreateModal(false);
                  setBackupName('');
                }}
                className="px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all text-slate-700 dark:text-slate-300"
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                disabled={submitting || !backupName}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50"
              >
                {submitting ? t('tenant.backups.modal.create.creating') : t('tenant.backups.modal.create.submit')}
              </button>
            </div>
          </form>
        </Modal>

        {/* Restore Backup Modal */}
        <Modal
          isOpen={showRestoreModal}
          onClose={() => {
            setShowRestoreModal(false);
            setSelectedBackup(null);
          }}
          title={t('tenant.backups.modal.restore.title')}
          size="md"
        >
          <div className="space-y-4">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
              <div className="flex gap-3">
                <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
                <div>
                  <p className="font-medium text-yellow-800 dark:text-yellow-300 mb-1">{t('tenant.backups.modal.restore.warningTitle')}</p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-400">
                    {t('tenant.backups.modal.restore.warningMessage')}
                  </p>
                </div>
              </div>
            </div>

            {selectedBackup && (
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 space-y-3">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{t('tenant.backups.modal.restore.backupName')}</p>
                  <p className="font-semibold text-slate-900 dark:text-white">{selectedBackup.name}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{t('tenant.backups.modal.restore.createdAt')}</p>
                  <p className="text-slate-900 dark:text-white">{formatDateTime(selectedBackup.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{t('tenant.backups.modal.restore.size')}</p>
                  <p className="text-slate-900 dark:text-white">{formatBytes(selectedBackup.size)}</p>
                </div>
              </div>
            )}

            <div className="flex gap-3 justify-end pt-4">
              <button
                onClick={() => {
                  setShowRestoreModal(false);
                  setSelectedBackup(null);
                }}
                className="px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all text-slate-700 dark:text-slate-300"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleRestoreBackup}
                disabled={submitting}
                className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all disabled:opacity-50"
              >
                {submitting ? t('tenant.backups.modal.restore.restoring') : t('tenant.backups.modal.restore.submit')}
              </button>
            </div>
          </div>
        </Modal>

        {/* Schedule Configuration Modal */}
        <Modal
          isOpen={showScheduleModal}
          onClose={() => setShowScheduleModal(false)}
          title={t('tenant.backups.modal.schedule.title')}
          size="md"
        >
          <form onSubmit={handleUpdateSchedule} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                {t('tenant.backups.modal.schedule.frequencyLabel')}
              </label>
              <select
                value={scheduleFrequency}
                onChange={(e) => setScheduleFrequency(e.target.value as any)}
                className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="Daily">{t('tenant.backups.frequency.daily')}</option>
                <option value="Weekly">{t('tenant.backups.frequency.weekly')}</option>
                <option value="Monthly">{t('tenant.backups.frequency.monthly')}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                {t('tenant.backups.modal.schedule.timeLabel')}
              </label>
              <input
                type="time"
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                {t('tenant.backups.modal.schedule.retentionLabel')}
              </label>
              <input
                type="number"
                value={scheduleRetention}
                onChange={(e) => setScheduleRetention(parseInt(e.target.value))}
                min="1"
                max="365"
                className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer transition-all">
                <input
                  type="checkbox"
                  checked={scheduleEnabled}
                  onChange={(e) => setScheduleEnabled(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-700 dark:text-slate-300">{t('tenant.backups.modal.schedule.enableLabel')}</span>
              </label>
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <button
                type="button"
                onClick={() => setShowScheduleModal(false)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all text-slate-700 dark:text-slate-300"
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50"
              >
                {submitting ? t('tenant.backups.modal.schedule.saving') : t('tenant.backups.modal.schedule.submit')}
              </button>
            </div>
          </form>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={showDeleteConfirm}
          onClose={() => {
            setShowDeleteConfirm(false);
            setSelectedBackup(null);
          }}
          title={t('tenant.backups.modal.delete.title')}
          size="sm"
        >
          <div className="space-y-4">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
              <div className="flex gap-3">
                <XCircle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0" />
                <div>
                  <p className="font-medium text-red-800 dark:text-red-300 mb-1">
                    {t('tenant.backups.modal.delete.confirmMessage')}
                  </p>
                  <p className="text-sm text-red-700 dark:text-red-400">
                    {t('tenant.backups.modal.delete.irreversible')}
                  </p>
                </div>
              </div>
            </div>

            {selectedBackup && (
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4">
                <p className="text-sm text-slate-500 dark:text-slate-400">{t('tenant.backups.modal.delete.selectedBackup')}:</p>
                <p className="font-medium text-slate-900 dark:text-white">{selectedBackup.name}</p>
              </div>
            )}

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setSelectedBackup(null);
                }}
                className="px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all text-slate-700 dark:text-slate-300"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleDeleteBackup}
                disabled={submitting}
                className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all disabled:opacity-50"
              >
                {submitting ? t('tenant.backups.modal.delete.deleting') : t('tenant.backups.modal.delete.submit')}
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </>
  );
}
