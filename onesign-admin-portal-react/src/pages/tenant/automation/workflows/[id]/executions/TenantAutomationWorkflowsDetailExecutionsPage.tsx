import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getTenantId } from '@/lib/tenant-context';
import { automationService } from '@/lib/api/services/automation.service';
import { Helmet } from 'react-helmet-async';

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

export default function TenantAutomationWorkflowsDetailExecutionsPage() {
  const params = useParams();
  const navigate = useNavigate();
  const workflowId = params.id as string;
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Data states
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [stats, setStats] = useState<ExecutionStats | null>(null);
  const [selectedExecution, setSelectedExecution] = useState<WorkflowExecution | null>(null);
  const [executionLogs, setExecutionLogs] = useState<ExecutionLog[]>([]);

  // Filter states
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);

  // Modal states
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
      // Mock data - replace with actual API call
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
          metadata: {
            userId: `user-${i + 1}`,
            email: `user${i + 1}@example.com`,
          },
          steps: [
            {
              stepId: 'step-1',
              stepNumber: 1,
              stepName: 'Validate User Data',
              status: 'Success',
              startedAt: startedAt,
              completedAt: new Date(new Date(startedAt).getTime() + 2000).toISOString(),
              duration: 2000,
              output: { valid: true },
              errorMessage: null,
              logs: ['Starting validation', 'User data is valid'],
            },
            {
              stepId: 'step-2',
              stepNumber: 2,
              stepName: 'Create User Account',
              status: 'Success',
              startedAt: new Date(new Date(startedAt).getTime() + 2000).toISOString(),
              completedAt: new Date(new Date(startedAt).getTime() + 5000).toISOString(),
              duration: 3000,
              output: { userId: `user-${i + 1}` },
              errorMessage: null,
              logs: ['Creating user account', 'Account created successfully'],
            },
            {
              stepId: 'step-3',
              stepNumber: 3,
              stepName: 'Send Welcome Email',
              status: status === 'Failed' ? 'Failed' : 'Success',
              startedAt: new Date(new Date(startedAt).getTime() + 5000).toISOString(),
              completedAt: duration ? new Date(new Date(startedAt).getTime() + duration).toISOString() : null,
              duration: status === 'Failed' ? null : duration ? duration - 5000 : null,
              output: status === 'Failed' ? null : { emailId: `email-${i + 1}` },
              errorMessage: status === 'Failed' ? 'SMTP connection timeout' : null,
              logs: status === 'Failed'
                ? ['Attempting to send email', 'Connection timeout', 'Retrying...', 'Failed after 3 attempts']
                : ['Sending welcome email', 'Email sent successfully'],
            },
          ],
        };
      });

      // Apply filters
      let filtered = mockExecutions;
      if (statusFilter !== 'all') {
        filtered = filtered.filter(e => e.status === statusFilter);
      }
      if (searchQuery) {
        filtered = filtered.filter(e =>
          e.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          e.triggeredBy.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

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
      // Mock data - replace with actual API call
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
    try {
      // Mock data - replace with actual API call
      const mockLogs: ExecutionLog[] = [
        {
          id: '1',
          timestamp: new Date(Date.now() - 10000).toISOString(),
          level: 'Info',
          message: 'Workflow execution started',
          stepId: null,
          stepName: null,
          metadata: { triggeredBy: 'API' },
        },
        {
          id: '2',
          timestamp: new Date(Date.now() - 9000).toISOString(),
          level: 'Info',
          message: 'Step 1: Validate User Data - Started',
          stepId: 'step-1',
          stepName: 'Validate User Data',
          metadata: {},
        },
        {
          id: '3',
          timestamp: new Date(Date.now() - 8000).toISOString(),
          level: 'Debug',
          message: 'Validating email format',
          stepId: 'step-1',
          stepName: 'Validate User Data',
          metadata: { field: 'email' },
        },
        {
          id: '4',
          timestamp: new Date(Date.now() - 7000).toISOString(),
          level: 'Info',
          message: 'Step 1: Validate User Data - Completed',
          stepId: 'step-1',
          stepName: 'Validate User Data',
          metadata: { duration: 2000 },
        },
        {
          id: '5',
          timestamp: new Date(Date.now() - 6000).toISOString(),
          level: 'Info',
          message: 'Step 2: Create User Account - Started',
          stepId: 'step-2',
          stepName: 'Create User Account',
          metadata: {},
        },
        {
          id: '6',
          timestamp: new Date(Date.now() - 3000).toISOString(),
          level: 'Info',
          message: 'Step 2: Create User Account - Completed',
          stepId: 'step-2',
          stepName: 'Create User Account',
          metadata: { duration: 3000, userId: 'user-123' },
        },
        {
          id: '7',
          timestamp: new Date(Date.now() - 2000).toISOString(),
          level: 'Error',
          message: 'Step 3: Send Welcome Email - Failed',
          stepId: 'step-3',
          stepName: 'Send Welcome Email',
          metadata: { error: 'SMTP connection timeout' },
        },
        {
          id: '8',
          timestamp: new Date(Date.now() - 1000).toISOString(),
          level: 'Error',
          message: 'Workflow execution failed',
          stepId: null,
          stepName: null,
          metadata: { totalDuration: 9000 },
        },
      ];
      setExecutionLogs(mockLogs);
    } catch (err) {
      console.error('Failed to fetch logs:', err);
    }
  };

  const handleRetryExecution = async (executionId: string) => {
    setProcessing(true);
    setError('');
    setSuccess('');
    try {
      // Simulate API call
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

    const logsText = executionLogs.map(log =>
      `[${log.timestamp}] [${log.level}] ${log.stepName ? `[${log.stepName}] ` : ''}${log.message}`
    ).join('\n');

    const blob = new Blob([logsText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `execution-${selectedExecution.id}-logs.txt`;
    a.click();
    URL.revokeObjectURL(url);

    setSuccess('Logs exported successfully');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatDuration = (ms: number | null) => {
    if (!ms) return '-';
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Success': return 'green';
      case 'Failed': return 'red';
      case 'Pending': return 'yellow';
      case 'Running': return 'blue';
      case 'Cancelled': return 'gray';
      case 'Skipped': return 'gray';
      default: return 'gray';
    }
  };

  const getLogLevelColor = (level: string) => {
    switch (level) {
      case 'Error': return 'text-red-600';
      case 'Warning': return 'text-yellow-600';
      case 'Info': return 'text-blue-600';
      case 'Debug': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  if (loading && executions.length === 0) {
    return <div className="p-8">{t('common.loading')}</div>;
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="text-indigo-600 hover:text-indigo-900 mb-2 flex items-center gap-2"
        >
          ← Back to Workflow
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Workflow Executions</h1>
        <p className="mt-2 text-gray-600">View execution history, logs, and retry failed runs</p>
      </div>

      {/* Alerts */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white shadow rounded-lg p-4">
            <div className="text-sm text-gray-500">Total</div>
            <div className="text-2xl font-bold text-gray-900">{stats.totalExecutions}</div>
          </div>
          <div className="bg-white shadow rounded-lg p-4">
            <div className="text-sm text-gray-500">Success</div>
            <div className="text-2xl font-bold text-green-600">{stats.successCount}</div>
          </div>
          <div className="bg-white shadow rounded-lg p-4">
            <div className="text-sm text-gray-500">Failed</div>
            <div className="text-2xl font-bold text-red-600">{stats.failedCount}</div>
          </div>
          <div className="bg-white shadow rounded-lg p-4">
            <div className="text-sm text-gray-500">Success Rate</div>
            <div className="text-2xl font-bold text-indigo-600">{stats.successRate}%</div>
          </div>
          <div className="bg-white shadow rounded-lg p-4">
            <div className="text-sm text-gray-500">Avg Duration</div>
            <div className="text-2xl font-bold text-gray-900">{formatDuration(stats.avgDuration)}</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as StatusFilter);
                setPage(1);
              }}
            >
              <option value="all">All Statuses</option>
              <option value="Success">Success</option>
              <option value="Failed">Failed</option>
              <option value="Pending">Pending</option>
              <option value="Running">Running</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              placeholder="Search by ID or trigger..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>
      </div>

      {/* Executions Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Execution ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Started</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trigger</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {executions.slice((page - 1) * pageSize, page * pageSize).map((execution) => (
                <tr key={execution.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-mono text-gray-900">{execution.id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded bg-${getStatusColor(execution.status)}-100 text-${getStatusColor(execution.status)}-800`}>
                      {execution.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(execution.startedAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDuration(execution.duration)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs rounded bg-gray-100 text-gray-800">
                      {execution.triggeredBy}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm space-x-3">
                    <button
                      onClick={() => handleViewDetails(execution)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Details
                    </button>
                    <button
                      onClick={() => handleViewLogs(execution)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Logs
                    </button>
                    {execution.status === 'Failed' && (
                      <button
                        onClick={() => handleRetryExecution(execution.id)}
                        disabled={processing}
                        className="text-green-600 hover:text-green-900 disabled:opacity-50"
                      >
                        Retry
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-700">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page >= totalPages}
            className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {/* Execution Details Modal */}
      {showDetailsModal && selectedExecution && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-xl font-semibold">Execution Details</h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                Close
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Overview */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Overview</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-500">Execution ID</div>
                    <div className="font-mono text-sm text-gray-900">{selectedExecution.id}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Status</div>
                    <span className={`inline-block px-2 py-1 text-xs rounded bg-${getStatusColor(selectedExecution.status)}-100 text-${getStatusColor(selectedExecution.status)}-800`}>
                      {selectedExecution.status}
                    </span>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Started</div>
                    <div className="text-sm text-gray-900">{formatDate(selectedExecution.startedAt)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Duration</div>
                    <div className="text-sm text-gray-900">{formatDuration(selectedExecution.duration)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Triggered By</div>
                    <div className="text-sm text-gray-900">{selectedExecution.triggeredBy}</div>
                  </div>
                  {selectedExecution.completedAt && (
                    <div>
                      <div className="text-sm text-gray-500">Completed</div>
                      <div className="text-sm text-gray-900">{formatDate(selectedExecution.completedAt)}</div>
                    </div>
                  )}
                </div>
                {selectedExecution.errorMessage && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
                    <div className="text-sm font-medium text-red-800">Error Message</div>
                    <div className="text-sm text-red-700 mt-1">{selectedExecution.errorMessage}</div>
                  </div>
                )}
              </div>

              {/* Step Execution Flow */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Step Execution Flow</h3>
                <div className="space-y-3">
                  {selectedExecution.steps.map((step, index) => (
                    <div key={step.stepId} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-700 font-semibold text-sm">
                              {step.stepNumber}
                            </div>
                            <h4 className="font-medium text-gray-900">{step.stepName}</h4>
                            <span className={`px-2 py-1 text-xs rounded bg-${getStatusColor(step.status)}-100 text-${getStatusColor(step.status)}-800`}>
                              {step.status}
                            </span>
                          </div>
                          <div className="ml-11 space-y-2 text-sm">
                            {step.startedAt && (
                              <div className="text-gray-600">
                                Started: {formatDate(step.startedAt)}
                              </div>
                            )}
                            {step.duration && (
                              <div className="text-gray-600">
                                Duration: {formatDuration(step.duration)}
                              </div>
                            )}
                            {step.errorMessage && (
                              <div className="text-red-600">
                                Error: {step.errorMessage}
                              </div>
                            )}
                            {step.output && (
                              <div>
                                <div className="text-gray-500 mb-1">Output:</div>
                                <pre className="bg-gray-50 border border-gray-200 rounded p-2 text-xs overflow-x-auto">
                                  {JSON.stringify(step.output, null, 2)}
                                </pre>
                              </div>
                            )}
                            {step.logs && step.logs.length > 0 && (
                              <div>
                                <div className="text-gray-500 mb-1">Logs:</div>
                                <div className="space-y-1">
                                  {step.logs.map((log, i) => (
                                    <div key={i} className="text-xs text-gray-600">• {log}</div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      {index < selectedExecution.steps.length - 1 && (
                        <div className="ml-4 mt-2">
                          <div className="w-0.5 h-4 bg-gray-300"></div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Metadata */}
              {selectedExecution.metadata && Object.keys(selectedExecution.metadata).length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Metadata</h3>
                  <pre className="bg-gray-50 border border-gray-200 rounded p-4 text-sm overflow-x-auto">
                    {JSON.stringify(selectedExecution.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Logs Modal */}
      {showLogsModal && selectedExecution && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-xl font-semibold">Execution Logs</h2>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleExportLogs}
                  className="text-indigo-600 hover:text-indigo-900 text-sm"
                >
                  Export Logs
                </button>
                <button
                  onClick={() => setShowLogsModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  Close
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                {executionLogs.map((log) => (
                  <div key={log.id} className="mb-2 flex gap-3">
                    <span className="text-gray-500 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                    <span className={`font-semibold whitespace-nowrap ${
                      log.level === 'Error' ? 'text-red-400' :
                      log.level === 'Warning' ? 'text-yellow-400' :
                      log.level === 'Info' ? 'text-blue-400' :
                      'text-gray-400'
                    }`}>
                      [{log.level}]
                    </span>
                    {log.stepName && (
                      <span className="text-purple-400 whitespace-nowrap">
                        [{log.stepName}]
                      </span>
                    )}
                    <span className="text-gray-300">{log.message}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
