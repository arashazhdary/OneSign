'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { getTenantId } from '@/lib/tenant-context';
import LoadingOverlay from '@/app/components/LoadingOverlay';
import Modal from '@/app/components/Modal';
import StatusBadge from '@/app/components/StatusBadge';

interface Workflow {
  id: string;
  tenantId: string;
  name: string;
  description: string;
  status: string;
  trigger: WorkflowTrigger;
  steps: WorkflowStep[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastRunAt: string | null;
  createdBy: string;
  version: number;
}

interface WorkflowTrigger {
  type: string;
  configuration: Record<string, any>;
  conditions: TriggerCondition[];
}

interface TriggerCondition {
  field: string;
  operator: string;
  value: any;
}

interface WorkflowStep {
  id: string;
  stepNumber: number;
  name: string;
  type: string;
  action: string;
  configuration: Record<string, any>;
  onSuccess: string;
  onFailure: string;
  timeout: number;
}

interface WorkflowRun {
  id: string;
  workflowId: string;
  status: string;
  startedAt: string;
  completedAt: string | null;
  triggeredBy: string;
  triggerData: Record<string, any>;
  steps: RunStep[];
  errorMessage: string | null;
}

interface RunStep {
  stepId: string;
  stepName: string;
  status: string;
  startedAt: string;
  completedAt: string | null;
  output: any;
  errorMessage: string | null;
}

interface WorkflowLog {
  id: string;
  workflowId: string;
  runId: string | null;
  level: string;
  message: string;
  timestamp: string;
  metadata: Record<string, any>;
}

type Tab = 'overview' | 'steps' | 'runs' | 'configuration' | 'test' | 'logs';

export default function WorkflowDetailPage() {
  const params = useParams();
  const router = useRouter();
  const workflowId = params.id as string;
  const t = useTranslations();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Data states
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [runs, setRuns] = useState<WorkflowRun[]>([]);
  const [logs, setLogs] = useState<WorkflowLog[]>([]);

  // Modal states
  const [showTestModal, setShowTestModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Form states
  const [testData, setTestData] = useState('{}');
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');

  const tenantId = getTenantId();

  useEffect(() => {
    fetchWorkflow();
  }, [workflowId]);

  useEffect(() => {
    if (activeTab === 'runs') {
      fetchRuns();
    } else if (activeTab === 'logs') {
      fetchLogs();
    }
  }, [activeTab]);

  const fetchWorkflow = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(
        `http://localhost:7000/api/tenant/automation/workflows/${workflowId}?tenantId=${tenantId}`,
        {
          credentials: 'include',
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch workflow');
      }

      const data = await response.json();
      setWorkflow(data);
      setEditName(data.name);
      setEditDescription(data.description);
    } catch (err) {
      setError(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const fetchRuns = async () => {
    try {
      const response = await fetch(
        `http://localhost:7000/api/tenant/automation/workflows/${workflowId}/runs?tenantId=${tenantId}&pageSize=20`,
        {
          credentials: 'include',
        }
      );

      if (response.ok) {
        const data = await response.json();
        setRuns(data);
      }
    } catch (err) {
      console.error('Failed to fetch runs:', err);
    }
  };

  const fetchLogs = async () => {
    try {
      const response = await fetch(
        `http://localhost:7000/api/tenant/automation/workflows/${workflowId}/logs?tenantId=${tenantId}&pageSize=50`,
        {
          credentials: 'include',
        }
      );

      if (response.ok) {
        const data = await response.json();
        setLogs(data);
      }
    } catch (err) {
      console.error('Failed to fetch logs:', err);
    }
  };

  const handleToggleActive = async () => {
    if (!workflow) return;

    setProcessing(true);
    setError('');
    setSuccess('');
    try {
      const action = workflow.isActive ? 'deactivate' : 'activate';
      const response = await fetch(
        `http://localhost:7000/api/tenant/automation/workflows/${workflowId}/${action}?tenantId=${tenantId}`,
        {
          method: 'POST',
          credentials: 'include',
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to ${action} workflow`);
      }

      setSuccess(`Workflow ${action}d successfully`);
      fetchWorkflow();
    } catch (err) {
      setError(t('common.error'));
    } finally {
      setProcessing(false);
    }
  };

  const handleTestWorkflow = async () => {
    setProcessing(true);
    setError('');
    setSuccess('');
    try {
      let parsedData;
      try {
        parsedData = JSON.parse(testData);
      } catch {
        throw new Error('Invalid JSON format');
      }

      const response = await fetch(
        `http://localhost:7000/api/tenant/automation/workflows/${workflowId}/test?tenantId=${tenantId}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ testData: parsedData }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to test workflow');
      }

      const result = await response.json();
      setSuccess('Workflow test completed successfully');
      setShowTestModal(false);
      setActiveTab('runs');
      fetchRuns();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'));
    } finally {
      setProcessing(false);
    }
  };

  const handleUpdateWorkflow = async () => {
    setProcessing(true);
    setError('');
    setSuccess('');
    try {
      const response = await fetch(
        `http://localhost:7000/api/tenant/automation/workflows/${workflowId}?tenantId=${tenantId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            name: editName,
            description: editDescription,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update workflow');
      }

      setSuccess('Workflow updated successfully');
      setShowEditModal(false);
      fetchWorkflow();
    } catch (err) {
      setError(t('common.error'));
    } finally {
      setProcessing(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getStatusColor = (status: string) => {
    const statusMap: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      running: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800',
    };
    return statusMap[status.toLowerCase()] || statusMap.pending;
  };

  const getLogLevelColor = (level: string) => {
    const levelMap: Record<string, string> = {
      info: 'text-blue-600',
      warning: 'text-yellow-600',
      error: 'text-red-600',
      debug: 'text-gray-600',
    };
    return levelMap[level.toLowerCase()] || levelMap.info;
  };

  if (loading) {
    return <LoadingOverlay isLoading={true} message="Loading workflow details..." />;
  }

  if (!workflow) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          Workflow not found
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="text-blue-600 hover:text-blue-800 mb-4 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Workflows
        </button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              {workflow.name}
            </h1>
            <p className="text-gray-600 mt-2">{workflow.description}</p>
          </div>
          <div className="flex gap-3 items-center">
            <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(workflow.status)}`}>
              {workflow.status}
            </span>
            {workflow.isActive ? (
              <span className="px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800">
                Active
              </span>
            ) : (
              <span className="px-3 py-1 text-sm font-semibold rounded-full bg-gray-100 text-gray-800">
                Inactive
              </span>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      {/* Action Buttons */}
      <div className="mb-6 flex gap-3">
        <button
          onClick={handleToggleActive}
          disabled={processing}
          className={`px-4 py-2 rounded-lg transition-colors disabled:opacity-50 ${
            workflow.isActive
              ? 'bg-yellow-500 text-white hover:bg-yellow-600'
              : 'bg-green-500 text-white hover:bg-green-600'
          }`}
        >
          {workflow.isActive ? 'Deactivate' : 'Activate'}
        </button>
        <button
          onClick={() => setShowEditModal(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          Edit Configuration
        </button>
        <button
          onClick={() => setShowTestModal(true)}
          className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors"
        >
          Test Workflow
        </button>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {(['overview', 'steps', 'runs', 'configuration', 'test', 'logs'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-1 border-b-2 font-medium text-sm capitalize transition-colors ${
                activeTab === tab
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Workflow Info */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Workflow Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Version</label>
                <div className="text-gray-900">v{workflow.version}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Created By</label>
                <div className="text-gray-900">{workflow.createdBy}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Created At</label>
                <div className="text-gray-900">{formatDate(workflow.createdAt)}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Updated</label>
                <div className="text-gray-900">{formatDate(workflow.updatedAt)}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Run</label>
                <div className="text-gray-900">{formatDate(workflow.lastRunAt)}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Steps</label>
                <div className="text-gray-900">{workflow.steps.length}</div>
              </div>
            </div>
          </div>

          {/* Trigger Information */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Trigger Configuration</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Trigger Type</label>
                <div className="text-gray-900 capitalize">{workflow.trigger.type}</div>
              </div>
              {workflow.trigger.conditions.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Conditions</label>
                  <div className="space-y-2">
                    {workflow.trigger.conditions.map((condition, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded-lg">
                        <span className="font-medium">{condition.field}</span>
                        <span className="text-gray-600 mx-2">{condition.operator}</span>
                        <span className="font-mono text-sm">{JSON.stringify(condition.value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Steps Tab */}
      {activeTab === 'steps' && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Workflow Steps</h3>
          <div className="space-y-4">
            {workflow.steps.map((step, index) => (
              <div key={step.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
                    {step.stepNumber}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 text-lg">{step.name}</div>
                    <div className="text-sm text-gray-600 mt-1">
                      <span className="font-medium">Type:</span> {step.type} |
                      <span className="font-medium ml-2">Action:</span> {step.action}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      <span className="font-medium">Timeout:</span> {step.timeout}s
                    </div>
                    <div className="mt-2 flex gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">On Success:</span>{' '}
                        <span className="text-green-600 font-medium">{step.onSuccess}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">On Failure:</span>{' '}
                        <span className="text-red-600 font-medium">{step.onFailure}</span>
                      </div>
                    </div>
                  </div>
                </div>
                {index < workflow.steps.length - 1 && (
                  <div className="ml-5 mt-2 border-l-2 border-dashed border-gray-300 h-4"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Runs Tab */}
      {activeTab === 'runs' && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Execution History</h3>
          {runs.length === 0 ? (
            <p className="text-gray-500">No execution history</p>
          ) : (
            <div className="space-y-3">
              {runs.map((run) => (
                <div key={run.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(run.status)}`}>
                          {run.status}
                        </span>
                        <span className="text-sm text-gray-600">
                          Triggered by {run.triggeredBy}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        Started: {formatDate(run.startedAt)}
                        {run.completedAt && ` | Completed: ${formatDate(run.completedAt)}`}
                      </div>
                      {run.errorMessage && (
                        <div className="text-sm text-red-600 mt-2 bg-red-50 p-2 rounded">
                          {run.errorMessage}
                        </div>
                      )}
                    </div>
                  </div>
                  {run.steps.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="grid grid-cols-4 gap-2">
                        {run.steps.map((step) => (
                          <div
                            key={step.stepId}
                            className={`text-xs p-2 rounded ${getStatusColor(step.status)}`}
                          >
                            {step.stepName}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Configuration Tab */}
      {activeTab === 'configuration' && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Workflow Configuration</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Trigger Configuration</label>
              <div className="bg-gray-50 rounded-lg p-4">
                <pre className="text-sm text-gray-900 overflow-x-auto">
                  {JSON.stringify(workflow.trigger.configuration, null, 2)}
                </pre>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Steps Configuration</label>
              <div className="space-y-3">
                {workflow.steps.map((step) => (
                  <div key={step.id}>
                    <div className="text-sm font-medium text-gray-700 mb-1">
                      Step {step.stepNumber}: {step.name}
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <pre className="text-sm text-gray-900 overflow-x-auto">
                        {JSON.stringify(step.configuration, null, 2)}
                      </pre>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Test Tab */}
      {activeTab === 'test' && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Test Workflow</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Test Data (JSON)
              </label>
              <textarea
                value={testData}
                onChange={(e) => setTestData(e.target.value)}
                rows={10}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 font-mono text-sm"
                placeholder='{"key": "value"}'
              />
            </div>
            <button
              onClick={handleTestWorkflow}
              disabled={processing}
              className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              {processing ? 'Running Test...' : 'Run Test'}
            </button>
          </div>
        </div>
      )}

      {/* Logs Tab */}
      {activeTab === 'logs' && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Workflow Logs</h3>
          {logs.length === 0 ? (
            <p className="text-gray-500">No logs available</p>
          ) : (
            <div className="space-y-2">
              {logs.map((log) => (
                <div key={log.id} className="border-l-4 border-gray-300 pl-4 py-2 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-semibold uppercase ${getLogLevelColor(log.level)}`}>
                          {log.level}
                        </span>
                        <span className="text-sm text-gray-900">{log.message}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {formatDate(log.timestamp)}
                        {log.runId && ` | Run ID: ${log.runId}`}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Test Modal */}
      <Modal
        isOpen={showTestModal}
        onClose={() => setShowTestModal(false)}
        title="Test Workflow"
        size="lg"
        footer={
          <>
            <button
              onClick={() => setShowTestModal(false)}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={handleTestWorkflow}
              disabled={processing}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              {processing ? 'Running...' : 'Run Test'}
            </button>
          </>
        }
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Test Data (JSON)
          </label>
          <textarea
            value={testData}
            onChange={(e) => setTestData(e.target.value)}
            rows={8}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 font-mono text-sm"
            placeholder='{"key": "value"}'
          />
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Workflow"
        footer={
          <>
            <button
              onClick={() => setShowEditModal(false)}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdateWorkflow}
              disabled={processing}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {processing ? 'Saving...' : 'Save Changes'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </Modal>

      <LoadingOverlay isLoading={processing} message="Processing..." />
    </div>
  );
}
