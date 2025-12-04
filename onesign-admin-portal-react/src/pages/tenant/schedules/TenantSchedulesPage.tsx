import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { getTenantId } from '@/lib/tenant-context';
import { automationService, ScheduledJobDto, ExecutionDto } from '@/lib/api/automation';
import { Helmet } from 'react-helmet-async';
import Modal from '@/components/common/Modal';
import {
  Calendar,
  Clock,
  Plus,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Play,
  Pause,
  Edit3,
  Trash2,
  History,
  Terminal,
  Timer,
  Zap,
  FileText,
  Users,
  Database,
  BarChart3,
  Bell,
  Archive,
  Settings,
  X,
} from 'lucide-react';

// Types
interface ScheduledJob {
  id: string;
  name: string;
  description: string;
  jobType: string;
  cronExpression: string;
  enabled: boolean;
  nextRun: string;
  lastRun?: string;
  lastStatus?: 'Success' | 'Failed' | 'Running';
  createdAt: string;
  createdBy: string;
  executionCount: number;
}

interface JobExecution {
  id: string;
  jobId: string;
  startedAt: string;
  completedAt?: string;
  status: 'Success' | 'Failed' | 'Running';
  duration?: number;
  errorMessage?: string;
  logs: string[];
}

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ElementType;
  color: string;
  delay?: number;
  subtitle?: string;
}

const StatCard = ({ title, value, icon: Icon, color, delay = 0, subtitle }: StatCardProps) => (
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
        {subtitle && <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{subtitle}</p>}
      </div>
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  </motion.div>
);

export default function TenantSchedulesPage() {
  const { t } = useTranslation();
  const [tenantId, setTenantIdState] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [schedules, setSchedules] = useState<ScheduledJob[]>([]);
  const [selectedSchedule, setSelectedSchedule] = useState<ScheduledJob | null>(null);
  const [executions, setExecutions] = useState<JobExecution[]>([]);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [selectedExecution, setSelectedExecution] = useState<JobExecution | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formJobType, setFormJobType] = useState('data_cleanup');
  const [formCronExpression, setFormCronExpression] = useState('0 0 * * *');
  const [formEnabled, setFormEnabled] = useState(true);

  // Cron builder
  const [cronMinute, setCronMinute] = useState('0');
  const [cronHour, setCronHour] = useState('0');
  const [cronDayOfMonth, setCronDayOfMonth] = useState('*');
  const [cronMonth, setCronMonth] = useState('*');
  const [cronDayOfWeek, setCronDayOfWeek] = useState('*');

  const jobTypes = [
    { value: 'data_cleanup', label: 'Data Cleanup', icon: Database },
    { value: 'user_sync', label: 'User Synchronization', icon: Users },
    { value: 'backup', label: 'Backup', icon: Archive },
    { value: 'report_generation', label: 'Report Generation', icon: BarChart3 },
    { value: 'notification_batch', label: 'Batch Notifications', icon: Bell },
    { value: 'audit_export', label: 'Audit Export', icon: FileText },
    { value: 'metric_aggregation', label: 'Metric Aggregation', icon: Zap },
    { value: 'custom', label: 'Custom Job', icon: Settings },
  ];

  useEffect(() => {
    const contextTenantId = getTenantId();
    setTenantIdState(contextTenantId || '00000000-0000-0000-0000-000000000000');
  }, []);

  useEffect(() => {
    if (tenantId) {
      fetchSchedules();
    }
  }, [tenantId]);

  // Update cron expression when builder values change
  useEffect(() => {
    setFormCronExpression(`${cronMinute} ${cronHour} ${cronDayOfMonth} ${cronMonth} ${cronDayOfWeek}`);
  }, [cronMinute, cronHour, cronDayOfMonth, cronMonth, cronDayOfWeek]);

  const fetchSchedules = async () => {
    if (!tenantId) return;

    setLoading(true);
    setError('');

    try {
      const schedulesData = await automationService.getSchedules();
      if (schedulesData && schedulesData.length > 0) {
        const mappedSchedules = schedulesData.map((s: ScheduledJobDto) => ({
          id: s.id,
          name: s.name,
          description: s.description || '',
          jobType: s.jobType || 'custom',
          cronExpression: s.cronExpression || '0 0 * * *',
          enabled: s.enabled,
          nextRun: s.nextRun || new Date().toISOString(),
          lastRun: s.lastRun,
          lastStatus: s.lastStatus,
          createdAt: s.createdAt,
          createdBy: s.createdBy || 'system',
          executionCount: s.executionCount || 0,
        }));
        setSchedules(mappedSchedules);
      } else {
        setSchedules(mockSchedulesFallback);
      }
    } catch (err: any) {
      console.error('Error fetching schedules:', err);
      setError(err?.message || t('common.failedToLoadSchedules'));
      setSchedules(mockSchedulesFallback);
    } finally {
      setLoading(false);
    }
  };

  const mockSchedulesFallback: ScheduledJob[] = [
    {
      id: '1',
      name: 'Daily User Sync',
      description: 'Synchronize user data from external systems',
      jobType: 'user_sync',
      cronExpression: '0 2 * * *',
      enabled: true,
      nextRun: new Date(Date.now() + 3600000 * 5).toISOString(),
      lastRun: new Date(Date.now() - 86400000).toISOString(),
      lastStatus: 'Success',
      createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
      createdBy: 'admin@example.com',
      executionCount: 30,
    },
    {
      id: '2',
      name: 'Weekly Report Generation',
      description: 'Generate and send weekly analytics reports',
      jobType: 'report_generation',
      cronExpression: '0 8 * * 1',
      enabled: true,
      nextRun: new Date(Date.now() + 86400000 * 2).toISOString(),
      lastRun: new Date(Date.now() - 86400000 * 7).toISOString(),
      lastStatus: 'Success',
      createdAt: new Date(Date.now() - 86400000 * 60).toISOString(),
      createdBy: 'john.doe@example.com',
      executionCount: 8,
    },
    {
      id: '3',
      name: 'Data Cleanup',
      description: 'Remove old temporary data and expired sessions',
      jobType: 'data_cleanup',
      cronExpression: '0 3 * * *',
      enabled: true,
      nextRun: new Date(Date.now() + 3600000 * 6).toISOString(),
      lastRun: new Date(Date.now() - 86400000).toISOString(),
      lastStatus: 'Success',
      createdAt: new Date(Date.now() - 86400000 * 90).toISOString(),
      createdBy: 'system',
      executionCount: 90,
    },
    {
      id: '4',
      name: 'Audit Log Export',
      description: 'Export audit logs for compliance',
      jobType: 'audit_export',
      cronExpression: '0 1 1 * *',
      enabled: false,
      nextRun: new Date(Date.now() + 86400000 * 15).toISOString(),
      lastRun: new Date(Date.now() - 86400000 * 30).toISOString(),
      lastStatus: 'Failed',
      createdAt: new Date(Date.now() - 86400000 * 120).toISOString(),
      createdBy: 'admin@example.com',
      executionCount: 4,
    },
  ];

  const fetchExecutionHistory = async (jobId: string) => {
    try {
      const executionsData = await automationService.getExecutions({ jobId });
      if (executionsData && executionsData.length > 0) {
        const mappedExecutions: JobExecution[] = executionsData.map((e: ExecutionDto) => ({
          id: e.id,
          jobId: e.jobId || jobId,
          startedAt: e.startedAt,
          completedAt: e.completedAt,
          status: e.status,
          duration: e.duration,
          errorMessage: e.errorMessage,
          logs: e.logs || [],
        }));
        setExecutions(mappedExecutions);
      } else {
        const mockExecutions: JobExecution[] = [];
        const count = 10;

        for (let i = 0; i < count; i++) {
          const status: JobExecution['status'] = Math.random() > 0.8 ? 'Failed' : 'Success';
          const startedAt = new Date(Date.now() - 86400000 * i - Math.random() * 86400000);
          const duration = Math.floor(Math.random() * 60000);

          mockExecutions.push({
            id: `exec-${i}`,
            jobId,
            startedAt: startedAt.toISOString(),
            completedAt: new Date(startedAt.getTime() + duration).toISOString(),
            status,
            duration,
            errorMessage: status === 'Failed' ? 'Connection timeout to external service' : undefined,
            logs: [
              `[${startedAt.toISOString()}] Job started`,
              `[${new Date(startedAt.getTime() + 1000).toISOString()}] Initializing...`,
              `[${new Date(startedAt.getTime() + 5000).toISOString()}] Processing records...`,
              status === 'Failed'
                ? `[${new Date(startedAt.getTime() + duration).toISOString()}] ERROR: Connection timeout`
                : `[${new Date(startedAt.getTime() + duration).toISOString()}] Job completed successfully`,
            ],
          });
        }
        setExecutions(mockExecutions);
      }
    } catch (err) {
      console.error('Error fetching execution history:', err);
      setExecutions([]);
    }
  };

  const handleCreateSchedule = async () => {
    if (!tenantId || !formName || !formJobType || !formCronExpression) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await automationService.createSchedule({
        name: formName,
        description: formDescription,
        jobType: formJobType,
        cronExpression: formCronExpression,
        enabled: formEnabled,
        nextRun: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        executionCount: 0,
      });

      setSuccess('Schedule created successfully');
      setShowCreateModal(false);
      resetForm();
      fetchSchedules();
    } catch (err) {
      setError('Failed to create schedule');
      console.error('Error creating schedule:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSchedule = async () => {
    if (!tenantId || !selectedSchedule || !formName || !formJobType || !formCronExpression) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await automationService.updateSchedule(selectedSchedule.id, {
        name: formName,
        description: formDescription,
        jobType: formJobType,
        cronExpression: formCronExpression,
        enabled: formEnabled,
      });

      setSuccess('Schedule updated successfully');
      setShowEditModal(false);
      setSelectedSchedule(null);
      resetForm();
      fetchSchedules();
    } catch (err) {
      setError('Failed to update schedule');
      console.error('Error updating schedule:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSchedule = async () => {
    if (!tenantId || !selectedSchedule) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await automationService.deleteSchedule(selectedSchedule.id);

      setSuccess('Schedule deleted successfully');
      setShowDeleteConfirm(false);
      setSelectedSchedule(null);
      fetchSchedules();
    } catch (err) {
      setError('Failed to delete schedule');
      console.error('Error deleting schedule:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleEnabled = async (schedule: ScheduledJob) => {
    setLoading(true);
    setError('');

    try {
      await automationService.toggleSchedule(schedule.id, !schedule.enabled);
      setSuccess(`Schedule ${schedule.enabled ? 'disabled' : 'enabled'} successfully`);
      fetchSchedules();
    } catch (err) {
      setError('Failed to toggle schedule');
      console.error('Error toggling schedule:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewHistory = (schedule: ScheduledJob) => {
    setSelectedSchedule(schedule);
    fetchExecutionHistory(schedule.id);
    setShowHistoryModal(true);
  };

  const handleViewLogs = (execution: JobExecution) => {
    setSelectedExecution(execution);
    setShowLogsModal(true);
  };

  const handleEdit = (schedule: ScheduledJob) => {
    setSelectedSchedule(schedule);
    setFormName(schedule.name);
    setFormDescription(schedule.description);
    setFormJobType(schedule.jobType);
    setFormCronExpression(schedule.cronExpression);
    setFormEnabled(schedule.enabled);

    const parts = schedule.cronExpression.split(' ');
    if (parts.length === 5) {
      setCronMinute(parts[0]);
      setCronHour(parts[1]);
      setCronDayOfMonth(parts[2]);
      setCronMonth(parts[3]);
      setCronDayOfWeek(parts[4]);
    }

    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormName('');
    setFormDescription('');
    setFormJobType('data_cleanup');
    setFormCronExpression('0 0 * * *');
    setFormEnabled(true);
    setCronMinute('0');
    setCronHour('0');
    setCronDayOfMonth('*');
    setCronMonth('*');
    setCronDayOfWeek('*');
  };

  const parseCronDescription = (cron: string) => {
    const parts = cron.split(' ');
    if (parts.length !== 5) return 'Invalid cron expression';

    const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;

    let desc = 'Runs ';

    if (dayOfWeek !== '*') {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      desc += `every ${days[parseInt(dayOfWeek)]} `;
    } else if (dayOfMonth !== '*') {
      desc += `on day ${dayOfMonth} of the month `;
    } else {
      desc += 'daily ';
    }

    desc += `at ${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`;

    return desc;
  };

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ${seconds % 60}s`;
  };

  const getJobTypeIcon = (jobType: string) => {
    const type = jobTypes.find((t) => t.value === jobType);
    return type?.icon || Settings;
  };

  const getStats = () => {
    const totalSchedules = schedules.length;
    const activeSchedules = schedules.filter((s) => s.enabled).length;
    const successfulRuns = schedules.filter((s) => s.lastStatus === 'Success').length;
    const failedRuns = schedules.filter((s) => s.lastStatus === 'Failed').length;
    return { totalSchedules, activeSchedules, successfulRuns, failedRuns };
  };

  const stats = getStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      <Helmet>
        <title>Scheduled Jobs - OneSign</title>
      </Helmet>

      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg shadow-indigo-500/25">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                  Scheduled Jobs
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                  Manage and monitor automated job schedules
                </p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                resetForm();
                setShowCreateModal(true);
              }}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:shadow-lg hover:shadow-indigo-500/25 transition-all font-medium"
            >
              <Plus className="w-5 h-5" />
              {t('tenant.schedules.createSchedule')}
            </motion.button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Schedules"
            value={stats.totalSchedules}
            icon={Calendar}
            color="bg-gradient-to-br from-blue-500 to-blue-600"
            delay={0}
          />
          <StatCard
            title="Active Schedules"
            value={stats.activeSchedules}
            icon={Play}
            color="bg-gradient-to-br from-emerald-500 to-emerald-600"
            delay={1}
          />
          <StatCard
            title="Successful Runs"
            value={stats.successfulRuns}
            icon={CheckCircle}
            color="bg-gradient-to-br from-green-500 to-green-600"
            delay={2}
          />
          <StatCard
            title="Failed Runs"
            value={stats.failedRuns}
            icon={XCircle}
            color="bg-gradient-to-br from-red-500 to-red-600"
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
              className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl flex items-center gap-3"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
              <button onClick={() => setError('')} className="ml-auto">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 px-4 py-3 rounded-xl flex items-center gap-3"
            >
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <span>{success}</span>
              <button onClick={() => setSuccess('')} className="ml-auto">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading State */}
        {loading && schedules.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center py-20"
          >
            <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
          </motion.div>
        )}

        {/* Schedules Grid */}
        {!loading && schedules.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-12 text-center"
          >
            <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-indigo-500" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              No Scheduled Jobs
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md mx-auto">
              Create your first schedule to automate recurring tasks.
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                resetForm();
                setShowCreateModal(true);
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:shadow-lg hover:shadow-indigo-500/25 transition-all font-medium"
            >
              <Plus className="w-5 h-5" />
              {t('tenant.schedules.createSchedule')}
            </motion.button>
          </motion.div>
        ) : (
          <div className="grid gap-4">
            {schedules.map((schedule, index) => {
              const JobIcon = getJobTypeIcon(schedule.jobType);
              return (
                <motion.div
                  key={schedule.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 hover:shadow-lg transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-xl ${
                        schedule.enabled
                          ? 'bg-indigo-100 dark:bg-indigo-900/30'
                          : 'bg-slate-100 dark:bg-slate-700'
                      }`}>
                        <JobIcon className={`w-6 h-6 ${
                          schedule.enabled
                            ? 'text-indigo-600 dark:text-indigo-400'
                            : 'text-slate-400 dark:text-slate-500'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                            {schedule.name}
                          </h3>
                          <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                            schedule.enabled
                              ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                          }`}>
                            {schedule.enabled ? t('common.active') : t('tenant.schedules.paused')}
                          </span>
                          {schedule.lastStatus && (
                            <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                              schedule.lastStatus === 'Success'
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                : schedule.lastStatus === 'Failed'
                                ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                                : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                            }`}>
                              Last: {schedule.lastStatus}
                            </span>
                          )}
                        </div>
                        {schedule.description && (
                          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            {schedule.description}
                          </p>
                        )}
                        <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
                          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                            <Timer className="w-4 h-4 text-slate-400" />
                            <code className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-xs font-mono">
                              {schedule.cronExpression}
                            </code>
                            <span className="text-xs text-slate-400">
                              ({parseCronDescription(schedule.cronExpression)})
                            </span>
                          </div>
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4 text-slate-400" />
                            Next run: {new Date(schedule.nextRun).toLocaleString()}
                          </div>
                          {schedule.lastRun && (
                            <div className="flex items-center gap-1">
                              <History className="w-4 h-4 text-slate-400" />
                              Last run: {new Date(schedule.lastRun).toLocaleString()}
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Zap className="w-4 h-4 text-slate-400" />
                            {schedule.executionCount} executions
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleToggleEnabled(schedule)}
                        className={`p-2 rounded-lg transition-all ${
                          schedule.enabled
                            ? 'text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20'
                            : 'text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
                        }`}
                        title={schedule.enabled ? 'Pause' : 'Resume'}
                      >
                        {schedule.enabled ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleViewHistory(schedule)}
                        className="p-2 text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-all"
                        title="View History"
                      >
                        <History className="w-5 h-5" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleEdit(schedule)}
                        className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all"
                        title="Edit"
                      >
                        <Edit3 className="w-5 h-5" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setSelectedSchedule(schedule);
                          setShowDeleteConfirm(true);
                        }}
                        className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                        title="Delete"
                      >
                        <Trash2 className="w-5 h-5" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Create/Edit Modal */}
        <Modal
          isOpen={showCreateModal || showEditModal}
          onClose={() => {
            showCreateModal ? setShowCreateModal(false) : setShowEditModal(false);
            setSelectedSchedule(null);
            resetForm();
          }}
          title={showCreateModal ? t('tenant.schedules.createSchedule') : t('tenant.schedules.editSchedule')}
          size="lg"
          footer={
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  showCreateModal ? setShowCreateModal(false) : setShowEditModal(false);
                  setSelectedSchedule(null);
                  resetForm();
                }}
                className="px-4 py-2 text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={showCreateModal ? handleCreateSchedule : handleUpdateSchedule}
                disabled={loading || !formName || !formJobType || !formCronExpression}
                className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:shadow-lg hover:shadow-indigo-500/25 disabled:opacity-50 transition-all"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    {t('common.saving')}
                  </span>
                ) : showCreateModal ? (
                  t('tenant.schedules.createSchedule')
                ) : (
                  t('tenant.schedules.updateSchedule')
                )}
              </button>
            </div>
          }
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Enter schedule name"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Description
              </label>
              <textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                rows={3}
                placeholder="Enter schedule description"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Job Type <span className="text-red-500">*</span>
              </label>
              <select
                value={formJobType}
                onChange={(e) => setFormJobType(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-slate-900 dark:text-white"
              >
                {jobTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Cron Expression <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-5 gap-2 mb-3">
                <div>
                  <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Minute</label>
                  <input
                    type="text"
                    value={cronMinute}
                    onChange={(e) => setCronMinute(e.target.value)}
                    placeholder="0-59"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Hour</label>
                  <input
                    type="text"
                    value={cronHour}
                    onChange={(e) => setCronHour(e.target.value)}
                    placeholder="0-23"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Day</label>
                  <input
                    type="text"
                    value={cronDayOfMonth}
                    onChange={(e) => setCronDayOfMonth(e.target.value)}
                    placeholder="1-31"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Month</label>
                  <input
                    type="text"
                    value={cronMonth}
                    onChange={(e) => setCronMonth(e.target.value)}
                    placeholder="1-12"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Weekday</label>
                  <input
                    type="text"
                    value={cronDayOfWeek}
                    onChange={(e) => setCronDayOfWeek(e.target.value)}
                    placeholder="0-6"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-900 dark:text-white"
                  />
                </div>
              </div>
              <div className="bg-slate-100 dark:bg-slate-900 p-4 rounded-xl">
                <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Generated Expression:</div>
                <code className="text-sm font-mono text-slate-900 dark:text-white">{formCronExpression}</code>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {parseCronDescription(formCronExpression)}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl">
              <button
                type="button"
                onClick={() => setFormEnabled(!formEnabled)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  formEnabled ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    formEnabled ? 'left-7' : 'left-1'
                  }`}
                />
              </button>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Enable schedule immediately
              </span>
            </div>
          </div>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={showDeleteConfirm}
          onClose={() => {
            setShowDeleteConfirm(false);
            setSelectedSchedule(null);
          }}
          title="Delete Schedule"
          footer={
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setSelectedSchedule(null);
                }}
                className="px-4 py-2 text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleDeleteSchedule}
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 transition-all"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    {t('common.deleting')}
                  </span>
                ) : (
                  t('tenant.schedules.deleteSchedule')
                )}
              </button>
            </div>
          }
        >
          <div className="flex items-start gap-4">
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl flex-shrink-0">
              <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-slate-700 dark:text-slate-300">
                Are you sure you want to delete the schedule <strong className="text-slate-900 dark:text-white">"{selectedSchedule?.name}"</strong>?
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                This action cannot be undone.
              </p>
            </div>
          </div>
        </Modal>

        {/* History Modal */}
        <Modal
          isOpen={showHistoryModal}
          onClose={() => {
            setShowHistoryModal(false);
            setSelectedSchedule(null);
            setExecutions([]);
          }}
          title="Execution History"
          size="xl"
          footer={
            <div className="flex justify-end">
              <button
                onClick={() => {
                  setShowHistoryModal(false);
                  setSelectedSchedule(null);
                  setExecutions([]);
                }}
                className="px-4 py-2 text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              >
                {t('common.close')}
              </button>
            </div>
          }
        >
          <div className="mb-4">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Execution history for <strong className="text-slate-900 dark:text-white">{selectedSchedule?.name}</strong>
            </p>
          </div>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {executions.map((execution, index) => (
              <motion.div
                key={execution.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${
                    execution.status === 'Success'
                      ? 'bg-emerald-100 dark:bg-emerald-900/30'
                      : execution.status === 'Failed'
                      ? 'bg-red-100 dark:bg-red-900/30'
                      : 'bg-blue-100 dark:bg-blue-900/30'
                  }`}>
                    {execution.status === 'Success' ? (
                      <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    ) : execution.status === 'Failed' ? (
                      <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                    ) : (
                      <RefreshCw className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-spin" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {new Date(execution.startedAt).toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Duration: {execution.duration ? formatDuration(execution.duration) : '-'}
                    </p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleViewLogs(execution)}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                >
                  <Terminal className="w-4 h-4" />
                  {t('tenant.schedules.viewLogs')}
                </motion.button>
              </motion.div>
            ))}
          </div>
        </Modal>

        {/* Logs Modal */}
        <Modal
          isOpen={showLogsModal}
          onClose={() => {
            setShowLogsModal(false);
            setSelectedExecution(null);
          }}
          title="Job Logs"
          size="lg"
          footer={
            <div className="flex justify-end">
              <button
                onClick={() => {
                  setShowLogsModal(false);
                  setSelectedExecution(null);
                }}
                className="px-4 py-2 text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              >
                {t('common.close')}
              </button>
            </div>
          }
        >
          <div className="mb-4 text-sm text-slate-500 dark:text-slate-400">
            {selectedExecution && new Date(selectedExecution.startedAt).toLocaleString()}
          </div>
          <div className="bg-slate-900 rounded-xl p-4 font-mono text-sm overflow-x-auto">
            {selectedExecution?.logs.map((log, index) => (
              <div key={index} className={`mb-1 ${
                log.includes('ERROR')
                  ? 'text-red-400'
                  : log.includes('successfully') || log.includes('completed')
                  ? 'text-emerald-400'
                  : 'text-slate-300'
              }`}>
                {log}
              </div>
            ))}
          </div>
          {selectedExecution?.errorMessage && (
            <div className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-red-800 dark:text-red-300 mb-1">
                    Error Message
                  </div>
                  <div className="text-sm text-red-700 dark:text-red-400">
                    {selectedExecution.errorMessage}
                  </div>
                </div>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}
