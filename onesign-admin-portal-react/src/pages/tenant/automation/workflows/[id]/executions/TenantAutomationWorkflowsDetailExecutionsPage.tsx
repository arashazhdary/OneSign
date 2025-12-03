import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { getTenantId } from '@/lib/tenant-context';
import { Helmet } from 'react-helmet-async';
import {
  Play,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  RefreshCw,
  Eye,
  FileText,
  Download,
  Search,
  Filter,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Activity,
  Zap,
  Timer,
  Target,
} from 'lucide-react';

interface WorkflowExecution {
  id: string;
  workflowId: string;
  workflowName: string;
  status: 'Success' | 'Failed' | 'Pending' | 'Cancelled' | 'Running';
  startedAt: string;
  completedAt: string | null;
  duration: number | null;
  triggeredBy: string;
  triggerType: string;
  steps: ExecutionStep[];
  errorMessage: string | null;
  metadata: Record<string, any>;
}

interface ExecutionStep {
  stepId: string;
  stepNumber: number;
  stepName: string;
  status: 'Success' | 'Failed' | 'Pending' | 'Skipped' | 'Running';
  startedAt: string | null;
  completedAt: string | null;
  duration: number | null;
  output: any;
  errorMessage: string | null;
  logs: string[];
}

interface ExecutionLog {
  id: string;
  timestamp: string;
  level: 'Info' | 'Warning' | 'Error' | 'Debug';
  message: string;
  stepId: string | null;
  stepName: string | null;
  metadata: Record<string, any>;
}

interface ExecutionStats {
  totalExecutions: number;
  successCount: number;
  failedCount: number;
  pendingCount: number;
  cancelledCount: number;
  successRate: number;
  avgDuration: number;
}

type StatusFilter = 'all' | 'Success' | 'Failed' | 'Pending' | 'Cancelled' | 'Running';

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
    className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-5 hover:shadow-xl transition-all duration-300"
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
      </div>
      <div className={`p-3 rounded-xl bg-gradient-to-br ${color}`}>
        {icon}
      </div>
    </div>
  </motion.div>
);

export default function TenantAutomationWorkflowsDetailExecutionsPage() {
  const params = useParams();
  const navigate = useNavigate();
  const workflowId = params.id as string;
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [stats, setStats] = useState<ExecutionStats | null>(null);
  const [selectedExecution, setSelectedExecution] = useState<WorkflowExecution | null>(null);
  const [executionLogs, setExecutionLogs] = useState<ExecutionLog[]>([]);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);

  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showLogsModal, setShowLogsModal] = useState(false);

  const tenantId = getTenantId();

  useEffect(() => {
    fetchExecutions();
    fetchStats();
  }, [workflowId, statusFilter, page]);

  const fetchExecutions = async () => {
    setLoading(true);
    setError('');
    try {
      const mockExecutions: WorkflowExecution[] = Array.from({ length: 15 }, (_, i) => {
        const statuses: Array<'Success' | 'Failed' | 'Pending' | 'Running'> = ['Success', 'Success', 'Success', 'Failed', 'Pending'];
        const status = statuses[i % statuses.length];
        const startedAt = new Date(Date.now() - (i + 1) * 3600000).toISOString();
        const duration = status === 'Success' || status === 'Failed' ? Math.floor(Math.random() * 30000) + 5000 : null;
        const completedAt = duration ? new Date(new Date(startedAt).getTime() + duration).toISOString() : null;

        return {
          id: `exec-${i + 1}`,
          workflowId,
          workflowName: 'User Onboarding Workflow',
          status,
          startedAt,
          completedAt,
          duration,
          triggeredBy: i % 3 === 0 ? 'API' : i % 3 === 1 ? 'Schedule' : 'Manual',
          triggerType: i % 3 === 0 ? 'api_call' : i % 3 === 1 ? 'schedule' : 'manual',
          errorMessage: status === 'Failed' ? 'Failed to send notification: SMTP connection timeout' : null,
          metadata: { userId: `user-${i + 1}`, email: `user${i + 1}@example.com` },
          steps: [
            { stepId: 'step-1', stepNumber: 1, stepName: 'Validate User Data', status: 'Success', startedAt, completedAt: new Date(new Date(startedAt).getTime() + 2000).toISOString(), duration: 2000, output: { valid: true }, errorMessage: null, logs: ['Starting validation', 'User data is valid'] },
            { stepId: 'step-2', stepNumber: 2, stepName: 'Create User Account', status: 'Success', startedAt: new Date(new Date(startedAt).getTime() + 2000).toISOString(), completedAt: new Date(new Date(startedAt).getTime() + 5000).toISOString(), duration: 3000, output: { userId: `user-${i + 1}` }, errorMessage: null, logs: ['Creating user account', 'Account created successfully'] },
            { stepId: 'step-3', stepNumber: 3, stepName: 'Send Welcome Email', status: status === 'Failed' ? 'Failed' : 'Success', startedAt: new Date(new Date(startedAt).getTime() + 5000).toISOString(), completedAt: duration ? new Date(new Date(startedAt).getTime() + duration).toISOString() : null, duration: status === 'Failed' ? null : duration ? duration - 5000 : null, output: status === 'Failed' ? null : { emailId: `email-${i + 1}` }, errorMessage: status === 'Failed' ? 'SMTP connection timeout' : null, logs: status === 'Failed' ? ['Attempting to send email', 'Connection timeout', 'Retrying...', 'Failed after 3 attempts'] : ['Sending welcome email', 'Email sent successfully'] },
          ],
        };
      });

      let filtered = mockExecutions;
      if (statusFilter !== 'all') filtered = filtered.filter(e => e.status === statusFilter);
      if (searchQuery) filtered = filtered.filter(e => e.id.toLowerCase().includes(searchQuery.toLowerCase()) || e.triggeredBy.toLowerCase().includes(searchQuery.toLowerCase()));

      setExecutions(filtered);
      setTotalPages(Math.ceil(filtered.length / pageSize));
    } catch (err) {
      setError('Failed to load executions');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const mockStats: ExecutionStats = {
        totalExecutions: 1247,
        successCount: 1089,
        failedCount: 127,
        pendingCount: 23,
        cancelledCount: 8,
        successRate: 87.3,
        avgDuration: 12500,
      };
      setStats(mockStats);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const fetchExecutionLogs = async (executionId: string) => {
    const mockLogs: ExecutionLog[] = [
      { id: '1', timestamp: new Date(Date.now() - 10000).toISOString(), level: 'Info', message: 'Workflow execution started', stepId: null, stepName: null, metadata: { triggeredBy: 'API' } },
      { id: '2', timestamp: new Date(Date.now() - 9000).toISOString(), level: 'Info', message: 'Step 1: Validate User Data - Started', stepId: 'step-1', stepName: 'Validate User Data', metadata: {} },
      { id: '3', timestamp: new Date(Date.now() - 8000).toISOString(), level: 'Debug', message: 'Validating email format', stepId: 'step-1', stepName: 'Validate User Data', metadata: { field: 'email' } },
      { id: '4', timestamp: new Date(Date.now() - 7000).toISOString(), level: 'Info', message: 'Step 1: Validate User Data - Completed', stepId: 'step-1', stepName: 'Validate User Data', metadata: { duration: 2000 } },
      { id: '5', timestamp: new Date(Date.now() - 6000).toISOString(), level: 'Info', message: 'Step 2: Create User Account - Started', stepId: 'step-2', stepName: 'Create User Account', metadata: {} },
      { id: '6', timestamp: new Date(Date.now() - 3000).toISOString(), level: 'Info', message: 'Step 2: Create User Account - Completed', stepId: 'step-2', stepName: 'Create User Account', metadata: { duration: 3000, userId: 'user-123' } },
      { id: '7', timestamp: new Date(Date.now() - 2000).toISOString(), level: 'Error', message: 'Step 3: Send Welcome Email - Failed', stepId: 'step-3', stepName: 'Send Welcome Email', metadata: { error: 'SMTP connection timeout' } },
      { id: '8', timestamp: new Date(Date.now() - 1000).toISOString(), level: 'Error', message: 'Workflow execution failed', stepId: null, stepName: null, metadata: { totalDuration: 9000 } },
    ];
    setExecutionLogs(mockLogs);
  };

  const handleRetryExecution = async (executionId: string) => {
    setProcessing(true);
    setError('');
    setSuccess('');
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSuccess('Execution retry initiated');
      fetchExecutions();
    } catch (err) {
      setError('Failed to retry execution');
    } finally {
      setProcessing(false);
    }
  };

  const handleViewDetails = (execution: WorkflowExecution) => {
    setSelectedExecution(execution);
    setShowDetailsModal(true);
  };

  const handleViewLogs = (execution: WorkflowExecution) => {
    setSelectedExecution(execution);
    fetchExecutionLogs(execution.id);
    setShowLogsModal(true);
  };

  const handleExportLogs = () => {
    if (!selectedExecution) return;
    const logsText = executionLogs.map(log => `[${log.timestamp}] [${log.level}] ${log.stepName ? `[${log.stepName}] ` : ''}${log.message}`).join('\n');
    const blob = new Blob([logsText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `execution-${selectedExecution.id}-logs.txt`;
    a.click();
    URL.revokeObjectURL(url);
    setSuccess('Logs exported successfully');
  };

  const formatDate = (dateString: string) => new Date(dateString).toLocaleString();
  const formatDuration = (ms: number | null) => {
    if (!ms) return '-';
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'Failed': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'Pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'Running': return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Success': return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400';
      case 'Failed': return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400';
      case 'Pending': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400';
      case 'Running': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400';
      default: return 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-400';
    }
  };

  if (loading && executions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
          <Loader2 className="w-8 h-8 text-indigo-600" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 p-6">
      <Helmet>
        <title>Workflow Executions</title>
      </Helmet>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <motion.button
          whileHover={{ x: -4 }}
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Workflow
        </motion.button>
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
            <Play className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Workflow Executions</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">View execution history, logs, and retry failed runs</p>
          </div>
        </div>
      </motion.div>

      {/* Alerts */}
      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-6 py-4 rounded-xl flex items-center gap-3">
            <XCircle className="w-5 h-5" />
            {error}
          </motion.div>
        )}
        {success && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-6 py-4 rounded-xl flex items-center gap-3">
            <CheckCircle className="w-5 h-5" />
            {success}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <StatCard title="Total" value={stats.totalExecutions} icon={<Activity className="w-5 h-5 text-white" />} color="from-indigo-500 to-indigo-600" delay={0} />
          <StatCard title="Success" value={stats.successCount} icon={<CheckCircle className="w-5 h-5 text-white" />} color="from-green-500 to-green-600" delay={1} />
          <StatCard title="Failed" value={stats.failedCount} icon={<XCircle className="w-5 h-5 text-white" />} color="from-red-500 to-red-600" delay={2} />
          <StatCard title="Success Rate" value={`${stats.successRate}%`} icon={<Target className="w-5 h-5 text-white" />} color="from-blue-500 to-blue-600" delay={3} />
          <StatCard title="Avg Duration" value={formatDuration(stats.avgDuration)} icon={<Timer className="w-5 h-5 text-white" />} color="from-purple-500 to-purple-600" delay={4} />
        </div>
      )}

      {/* Filters */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value as StatusFilter); setPage(1); }}
              >
                <option value="all">All Statuses</option>
                <option value="Success">Success</option>
                <option value="Failed">Failed</option>
                <option value="Pending">Pending</option>
                <option value="Running">Running</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                placeholder="Search by ID or trigger..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Executions Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
            <thead className="bg-gray-50 dark:bg-slate-800">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Execution ID</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Started</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Duration</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Trigger</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
              {executions.slice((page - 1) * pageSize, page * pageSize).map((execution, index) => (
                <motion.tr
                  key={execution.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-mono text-gray-900 dark:text-white">{execution.id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs rounded-full font-medium ${getStatusColor(execution.status)}`}>
                      {getStatusIcon(execution.status)}
                      {execution.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {formatDate(execution.startedAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {formatDuration(execution.duration)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-300">
                      {execution.triggeredBy}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center gap-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleViewDetails(execution)}
                        className="p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleViewLogs(execution)}
                        className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                        title="View Logs"
                      >
                        <FileText className="w-4 h-4" />
                      </motion.button>
                      {execution.status === 'Failed' && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleRetryExecution(execution.id)}
                          disabled={processing}
                          className="p-2 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors disabled:opacity-50"
                          title="Retry"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </motion.button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-white dark:bg-slate-800 px-6 py-4 flex items-center justify-between border-t border-gray-200 dark:border-slate-700">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-slate-700 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </motion.button>
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Page {page} of {totalPages}
          </span>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setPage(page + 1)}
            disabled={page >= totalPages}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-slate-700 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </motion.button>
        </div>
      </motion.div>

      {/* Details Modal */}
      <AnimatePresence>
        {showDetailsModal && selectedExecution && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowDetailsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center sticky top-0 bg-white dark:bg-slate-800">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Execution Details</h2>
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setShowDetailsModal(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                  <XCircle className="w-6 h-6" />
                </motion.button>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Execution ID', value: selectedExecution.id },
                    { label: 'Status', value: selectedExecution.status, isStatus: true },
                    { label: 'Started', value: formatDate(selectedExecution.startedAt) },
                    { label: 'Duration', value: formatDuration(selectedExecution.duration) },
                    { label: 'Triggered By', value: selectedExecution.triggeredBy },
                    { label: 'Completed', value: selectedExecution.completedAt ? formatDate(selectedExecution.completedAt) : '-' },
                  ].map(item => (
                    <div key={item.label} className="p-3 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
                      <div className="text-sm text-gray-500 dark:text-gray-400">{item.label}</div>
                      {item.isStatus ? (
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-xs rounded-full font-medium ${getStatusColor(item.value as string)}`}>
                          {getStatusIcon(item.value as string)}
                          {item.value}
                        </span>
                      ) : (
                        <div className="font-medium text-gray-900 dark:text-white">{item.value}</div>
                      )}
                    </div>
                  ))}
                </div>

                {selectedExecution.errorMessage && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                    <div className="text-sm font-medium text-red-800 dark:text-red-400">Error Message</div>
                    <div className="text-sm text-red-700 dark:text-red-300 mt-1">{selectedExecution.errorMessage}</div>
                  </div>
                )}

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Step Execution Flow</h3>
                  <div className="space-y-3">
                    {selectedExecution.steps.map((step, index) => (
                      <motion.div
                        key={step.stepId}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="border border-gray-200 dark:border-slate-700 rounded-xl p-4 bg-gray-50 dark:bg-slate-700/50"
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-sm font-bold">
                            {step.stepNumber}
                          </div>
                          <h4 className="font-medium text-gray-900 dark:text-white">{step.stepName}</h4>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full font-medium ${getStatusColor(step.status)}`}>
                            {getStatusIcon(step.status)}
                            {step.status}
                          </span>
                        </div>
                        {step.duration && (
                          <div className="text-sm text-gray-600 dark:text-gray-400 ml-11">Duration: {formatDuration(step.duration)}</div>
                        )}
                        {step.errorMessage && (
                          <div className="text-sm text-red-600 dark:text-red-400 ml-11 mt-1">Error: {step.errorMessage}</div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Logs Modal */}
      <AnimatePresence>
        {showLogsModal && selectedExecution && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowLogsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-800 rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center sticky top-0 bg-white dark:bg-slate-800">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Execution Logs</h2>
                <div className="flex items-center gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleExportLogs}
                    className="flex items-center gap-2 px-3 py-1.5 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 rounded-lg text-sm transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Export
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setShowLogsModal(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                    <XCircle className="w-6 h-6" />
                  </motion.button>
                </div>
              </div>
              <div className="p-6">
                <div className="bg-gray-900 rounded-xl p-4 font-mono text-sm overflow-x-auto">
                  {executionLogs.map((log, index) => (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="mb-2 flex gap-3"
                    >
                      <span className="text-gray-500 whitespace-nowrap">{new Date(log.timestamp).toLocaleTimeString()}</span>
                      <span className={`font-semibold whitespace-nowrap ${
                        log.level === 'Error' ? 'text-red-400' :
                        log.level === 'Warning' ? 'text-yellow-400' :
                        log.level === 'Info' ? 'text-blue-400' : 'text-gray-400'
                      }`}>
                        [{log.level}]
                      </span>
                      {log.stepName && <span className="text-purple-400 whitespace-nowrap">[{log.stepName}]</span>}
                      <span className="text-gray-300">{log.message}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
