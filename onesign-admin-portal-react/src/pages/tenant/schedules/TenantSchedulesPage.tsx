import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getTenantId } from '@/lib/tenant-context';
import { automationService } from '@/lib/api/services';
import { Helmet } from 'react-helmet-async';

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
    { value: 'data_cleanup', label: 'Data Cleanup' },
    { value: 'user_sync', label: 'User Synchronization' },
    { value: 'backup', label: 'Backup' },
    { value: 'report_generation', label: 'Report Generation' },
    { value: 'notification_batch', label: 'Batch Notifications' },
    { value: 'audit_export', label: 'Audit Export' },
    { value: 'metric_aggregation', label: 'Metric Aggregation' },
    { value: 'custom', label: 'Custom Job' },
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
      // Fetch from real API
      const workflows = await automationService.getWorkflows(tenantId);
      // Map workflows to ScheduledJob format
      const mappedSchedules = workflows.map((w: any) => ({
        id: w.id,
        name: w.name,
        description: w.description || '',
        jobType: w.trigger?.type || 'custom',
        cronExpression: w.trigger?.schedule || '0 0 * * *',
        enabled: w.enabled,
        nextRun: w.nextRun || new Date().toISOString(),
        lastRun: w.lastRun,
        lastStatus: w.lastStatus,
        createdAt: w.createdAt,
        createdBy: w.createdBy || 'system',
        executionCount: w.executionCount || 0,
      }));
      setSchedules(mappedSchedules);
    } catch (err: any) {
      console.error('Error fetching schedules:', err);
      setError(err?.message || 'Failed to load schedules');
      // Fallback to mock data
      setSchedules(mockSchedulesFallback);
    } finally {
      setLoading(false);
    }
  };

  // Mock data for fallback
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

  const fetchExecutionHistory = (jobId: string) => {
    // Mock execution history
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
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

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
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

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
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

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
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

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

    // Parse cron expression
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

    // Day of week
    if (dayOfWeek !== '*') {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      desc += `every ${days[parseInt(dayOfWeek)]} `;
    } else if (dayOfMonth !== '*') {
      desc += `on day ${dayOfMonth} of the month `;
    } else {
      desc += 'daily ';
    }

    // Time
    desc += `at ${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`;

    return desc;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Success':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Failed':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Running':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ${seconds % 60}s`;
  };

  return (
    <div className="p-8 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Scheduled Jobs
            </h1>
            <p className="text-gray-600 mt-2">
              Manage and monitor automated job schedules
            </p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowCreateModal(true);
            }}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold"
          >
            Create Schedule
          </button>
        </div>
      </div>

      {/* Success/Error Messages */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg shadow-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-lg shadow-sm">
          {success}
        </div>
      )}

      {/* Schedules List */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
          <h2 className="text-xl font-bold text-white">Scheduled Jobs</h2>
          <p className="text-blue-100 text-sm mt-1">{schedules.length} schedules configured</p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Job Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Schedule
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Next Run
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {schedules.length > 0 ? (
                schedules.map((schedule) => (
                  <tr key={schedule.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-semibold text-gray-900">{schedule.name}</div>
                        <div className="text-xs text-gray-500">{schedule.description}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {jobTypes.find((t) => t.value === schedule.jobType)?.label || schedule.jobType}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-mono text-gray-900">{schedule.cronExpression}</div>
                        <div className="text-xs text-gray-500">{parseCronDescription(schedule.cronExpression)}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{new Date(schedule.nextRun).toLocaleDateString()}</div>
                      <div className="text-xs text-gray-500">{new Date(schedule.nextRun).toLocaleTimeString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {schedule.lastStatus && (
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(schedule.lastStatus)}`}>
                          {schedule.lastStatus}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={schedule.enabled}
                          onChange={() => handleToggleEnabled(schedule)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(schedule)}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Edit
                        </button>
                        <span className="text-gray-300">|</span>
                        <button
                          onClick={() => handleViewHistory(schedule)}
                          className="text-purple-600 hover:text-purple-800 font-medium"
                        >
                          History
                        </button>
                        <span className="text-gray-300">|</span>
                        <button
                          onClick={() => {
                            setSelectedSchedule(schedule);
                            setShowDeleteConfirm(true);
                          }}
                          className="text-red-600 hover:text-red-800 font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    {loading ? (
                      <div>Loading schedules...</div>
                    ) : (
                      <div>
                        <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p>No scheduled jobs</p>
                        <p className="text-sm mt-2">Create your first schedule to get started</p>
                      </div>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 sticky top-0">
              <h2 className="text-xl font-bold text-white">
                {showCreateModal ? 'Create Schedule' : 'Edit Schedule'}
              </h2>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Enter schedule name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  rows={3}
                  placeholder="Enter schedule description"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formJobType}
                  onChange={(e) => setFormJobType(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {jobTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cron Expression <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-5 gap-2 mb-2">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Minute</label>
                    <input
                      type="text"
                      value={cronMinute}
                      onChange={(e) => setCronMinute(e.target.value)}
                      placeholder="0-59 or *"
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Hour</label>
                    <input
                      type="text"
                      value={cronHour}
                      onChange={(e) => setCronHour(e.target.value)}
                      placeholder="0-23 or *"
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Day</label>
                    <input
                      type="text"
                      value={cronDayOfMonth}
                      onChange={(e) => setCronDayOfMonth(e.target.value)}
                      placeholder="1-31 or *"
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Month</label>
                    <input
                      type="text"
                      value={cronMonth}
                      onChange={(e) => setCronMonth(e.target.value)}
                      placeholder="1-12 or *"
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Day of Week</label>
                    <input
                      type="text"
                      value={cronDayOfWeek}
                      onChange={(e) => setCronDayOfWeek(e.target.value)}
                      placeholder="0-6 or *"
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </div>
                </div>
                <div className="bg-gray-100 p-3 rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">Generated Expression:</div>
                  <div className="font-mono text-sm text-gray-900">{formCronExpression}</div>
                  <div className="text-xs text-gray-600 mt-1">{parseCronDescription(formCronExpression)}</div>
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formEnabled}
                    onChange={(e) => setFormEnabled(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700">Enable schedule immediately</span>
                </label>
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-2 border-t">
              <button
                onClick={() => {
                  showCreateModal ? setShowCreateModal(false) : setShowEditModal(false);
                  setSelectedSchedule(null);
                  resetForm();
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={showCreateModal ? handleCreateSchedule : handleUpdateSchedule}
                disabled={loading || !formName || !formJobType || !formCronExpression}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Saving...' : showCreateModal ? 'Create Schedule' : 'Update Schedule'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedSchedule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full shadow-2xl">
            <div className="bg-gradient-to-r from-red-600 to-pink-600 px-6 py-4">
              <h2 className="text-xl font-bold text-white">Delete Schedule</h2>
            </div>

            <div className="p-6">
              <p className="text-gray-700 mb-4">
                Are you sure you want to delete the schedule "{selectedSchedule.name}"? This action cannot be undone.
              </p>
            </div>

            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-2 border-t">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setSelectedSchedule(null);
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteSchedule}
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? 'Deleting...' : 'Delete Schedule'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistoryModal && selectedSchedule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[80vh] overflow-auto shadow-2xl">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4 sticky top-0">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">Execution History</h2>
                  <p className="text-purple-100 text-sm mt-1">{selectedSchedule.name}</p>
                </div>
                <button
                  onClick={() => {
                    setShowHistoryModal(false);
                    setSelectedSchedule(null);
                    setExecutions([]);
                  }}
                  className="text-white hover:text-gray-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Started At
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Duration
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {executions.map((execution) => (
                      <tr key={execution.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {new Date(execution.startedAt).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {execution.duration ? formatDuration(execution.duration) : '-'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(execution.status)}`}>
                            {execution.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          <button
                            onClick={() => handleViewLogs(execution)}
                            className="text-blue-600 hover:text-blue-800 font-medium"
                          >
                            View Logs
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Logs Modal */}
      {showLogsModal && selectedExecution && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[80vh] overflow-auto shadow-2xl">
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-4 sticky top-0">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">Job Logs</h2>
                  <p className="text-gray-300 text-sm mt-1">
                    {new Date(selectedExecution.startedAt).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowLogsModal(false);
                    setSelectedExecution(null);
                  }}
                  className="text-white hover:text-gray-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm">
                {selectedExecution.logs.map((log, index) => (
                  <div key={index} className="text-green-400 mb-1">
                    {log}
                  </div>
                ))}
              </div>

              {selectedExecution.errorMessage && (
                <div className="mt-4 bg-red-50 border border-red-200 p-4 rounded-lg">
                  <div className="text-sm font-semibold text-red-800 mb-1">Error Message:</div>
                  <div className="text-sm text-red-700">{selectedExecution.errorMessage}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
