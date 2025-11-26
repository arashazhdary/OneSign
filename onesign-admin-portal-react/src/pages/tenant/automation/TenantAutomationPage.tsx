import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getTenantId } from '@/lib/tenant-context';
import { DEFAULT_TENANT_ID } from '@/lib/constants/testIds';
import * as AutomationAPI from '@/lib/api/automation';
import {
  AutomationWorkflowDto,
  AutomationExecutionDto,
  EVENT_TYPES,
  ACTION_TYPES,
} from '@/lib/api/automation';
import { Helmet } from 'react-helmet-async';

interface WorkflowExecution {
  id: string;
  workflowId: string;
  workflowName: string;
  status: string;
  startedAt: string;
  completedAt?: string;
  eventType: string;
  actionsExecutedCount: number;
  actionsFailedCount: number;
  errorMessage?: string;
}

interface ExecutionDetail {
  id: string;
  workflowId: string;
  workflowName: string;
  status: string;
  startedAt: string;
  completedAt?: string;
  eventType: string;
  eventPayload: string;
  actionsExecuted: {
    actionType: string;
    status: string;
    executedAt: string;
    errorMessage?: string;
  }[];
}


type Tab = 'workflows' | 'executionHistory' | 'templates' | 'triggers';

export default function TenantAutomationPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<Tab>('workflows');
  const [tenantId, setTenantIdState] = useState<string>('');
  const [userId] = useState('00000000-0000-0000-0000-000000000001');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [workflows, setWorkflows] = useState<AutomationWorkflowDto[]>([]);
  const [executions, setExecutions] = useState<AutomationExecutionDto[]>([]);
  const [templates, setTemplates] = useState<AutomationWorkflowDto[]>([]);
  const [availableTriggers, setAvailableTriggers] = useState<AutomationAPI.AvailableTrigger[]>([]);
  const [workflowExecutions, setWorkflowExecutions] = useState<WorkflowExecution[]>([]);
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string>('');
  const [executionDetail, setExecutionDetail] = useState<ExecutionDetail | null>(null);
  const [totalExecutions, setTotalExecutions] = useState(0);
  const [executionPage, setExecutionPage] = useState(1);
  const [showExecutionDetail, setShowExecutionDetail] = useState(false);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newWorkflow, setNewWorkflow] = useState({
    name: '',
    description: '',
    severity: 'Info',
    isEnabled: true,
    triggers: [{ eventType: EVENT_TYPES[0], sourceModule: 'Auth' }],
    conditions: [] as { expressionType: string; expression: string; order: number }[],
    actions: [{ actionType: ACTION_TYPES[0], order: 0, configJson: '{}', isCritical: false }],
  });

  useEffect(() => {
    const contextTenantId = getTenantId();
    setTenantIdState(contextTenantId || DEFAULT_TENANT_ID);
  }, []);

  useEffect(() => {
    if (tenantId) {
      fetchData();
    }
  }, [tenantId, activeTab, executionPage]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      if (activeTab === 'workflows') {
        const data = await AutomationAPI.getWorkflows(tenantId);
        setWorkflows(data);
      } else if (activeTab === 'executionHistory') {
        const data = await AutomationAPI.getExecutions(tenantId, { page: executionPage, pageSize: 20 });
        setExecutions(data.items);
        setTotalExecutions(data.totalCount);
      } else if (activeTab === 'templates') {
        const data = await AutomationAPI.getAvailableTemplates();
        setTemplates(data);
      } else if (activeTab === 'triggers') {
        const data = await AutomationAPI.getAvailableTriggers(tenantId);
        setAvailableTriggers(data);
      }
    } catch (err) {
      setError(t('common.error'));
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkflowExecutions = async (workflowId: string) => {
    setLoading(true);
    try {
      const data = await AutomationAPI.getWorkflowExecutions(tenantId, workflowId);
      setWorkflowExecutions(data.items || []);
    } catch (err) {
      setError(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const fetchExecutionDetail = async (workflowId: string, execId: string) => {
    setLoading(true);
    try {
      const data = await AutomationAPI.getExecutionDetail(tenantId, workflowId, execId);
      setExecutionDetail(data);
      setShowExecutionDetail(true);
    } catch (err) {
      setError(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleTestWorkflow = async (workflowId: string) => {
    try {
      const data = await AutomationAPI.testWorkflowWithPayload(workflowId, tenantId, userId);
      setSuccess(`Test completed: ${data.result}`);
      fetchData();
    } catch (err: any) {
      setError(err?.message || t('common.error'));
    }
  };

  const handleCreateTemplate = async (workflow: AutomationWorkflowDto) => {
    try {
      await AutomationAPI.createTemplate(tenantId, {
        name: workflow.name,
        description: workflow.description,
        severity: workflow.severity,
        triggers: workflow.triggers,
        conditions: workflow.conditions,
        actions: workflow.actions,
        userId,
      });
      setSuccess('Template created successfully');
      setActiveTab('templates');
      fetchData();
    } catch (err) {
      setError(t('common.error'));
    }
  };

  const handleCreateWorkflow = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await AutomationAPI.createWorkflow({
        tenantId,
        userId,
        ...newWorkflow,
      });
      setSuccess(t('automation.workflowCreated'));
      setShowCreateModal(false);
      setNewWorkflow({
        name: '',
        description: '',
        severity: 'Info',
        isEnabled: true,
        triggers: [{ eventType: EVENT_TYPES[0], sourceModule: 'Auth' }],
        conditions: [],
        actions: [{ actionType: ACTION_TYPES[0], order: 0, configJson: '{}', isCritical: false }],
      });
      fetchData();
    } catch (err) {
      setError(t('common.error'));
    }
  };

  const handleDeleteWorkflow = async (id: string) => {
    if (!confirm(t('automation.confirmDelete'))) return;
    try {
      await AutomationAPI.deleteWorkflow(id, tenantId);
      setSuccess(t('automation.workflowDeleted'));
      fetchData();
    } catch (err) {
      setError(t('common.error'));
    }
  };

  const handleToggleWorkflow = async (workflow: AutomationWorkflowDto) => {
    try {
      if (workflow.isEnabled) {
        await AutomationAPI.disableWorkflow(workflow.id, tenantId, userId);
      } else {
        await AutomationAPI.enableWorkflow(workflow.id, tenantId, userId);
      }
      fetchData();
    } catch (err) {
      setError(t('common.error'));
    }
  };

  const handleCloneTemplate = async (template: AutomationWorkflowDto) => {
    try {
      await AutomationAPI.cloneTemplate(template.id, tenantId, userId);
      setSuccess(t('automation.templateCloned'));
      setActiveTab('workflows');
      fetchData();
    } catch (err) {
      setError(t('common.error'));
    }
  };

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === 'succeeded' || statusLower === 'success') return 'bg-green-100 text-green-800';
    if (statusLower === 'failed' || statusLower === 'failure') return 'bg-red-100 text-red-800';
    if (statusLower === 'running' || statusLower === 'inprogress') return 'bg-blue-100 text-blue-800';
    if (statusLower === 'skipped') return 'bg-gray-100 text-gray-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical': return 'bg-red-100 text-red-800';
      case 'Warning': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  if (loading && !workflows.length && !executions.length && !templates.length) {
    return <div className="p-8">{t('common.loading')}</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{t('automation.title')}</h1>
        {activeTab === 'workflows' && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            {t('automation.createWorkflow')}
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>
      )}
      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">{success}</div>
      )}

      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {(['workflows', 'executionHistory', 'templates', 'triggers'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab === 'executionHistory' ? 'Execution History' : tab === 'triggers' ? 'Available Triggers' : t(`automation.tabs.${tab}`)}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'workflows' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('automation.name')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('automation.triggers')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('automation.severity')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('automation.status')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('automation.actions')}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {workflows.map((workflow) => (
                <tr key={workflow.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{workflow.name}</div>
                    {workflow.description && (
                      <div className="text-sm text-gray-500">{workflow.description}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {workflow.triggers.map(t => t.eventType).join(', ')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded text-xs ${getSeverityColor(workflow.severity)}`}>
                      {workflow.severity}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded text-xs ${workflow.isEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {workflow.isEnabled ? t('automation.enabled') : t('automation.disabled')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleToggleWorkflow(workflow)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        {workflow.isEnabled ? t('automation.disable') : t('automation.enable')}
                      </button>
                      <button
                        onClick={() => handleTestWorkflow(workflow.id)}
                        className="text-green-600 hover:text-green-900"
                        title="Test Workflow"
                      >
                        Test
                      </button>
                      <button
                        onClick={() => {
                          setSelectedWorkflowId(workflow.id);
                          fetchWorkflowExecutions(workflow.id);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                        title={t('common.viewExecutions')}
                      >
                        Executions
                      </button>
                      <button
                        onClick={() => handleCreateTemplate(workflow)}
                        className="text-purple-600 hover:text-purple-900"
                        title={t('common.saveAsTemplate')}
                      >
                        Template
                      </button>
                      <button
                        onClick={() => handleDeleteWorkflow(workflow.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        {t('common.delete')}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {workflows.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    {t('automation.noWorkflows')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'executionHistory' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('automation.workflow')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('automation.eventType')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('automation.startedAt')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('automation.status')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('automation.actionsRun')}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {executions.map((execution) => (
                <tr key={execution.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {execution.workflowName || execution.workflowId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {execution.eventType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(execution.startedAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded text-xs ${getStatusColor(execution.status)}`}>
                      {execution.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {execution.actionsExecutedCount} / {execution.actionsExecutedCount + execution.actionsFailedCount}
                    {execution.actionsFailedCount > 0 && (
                      <span className="text-red-600 ml-1">({execution.actionsFailedCount} failed)</span>
                    )}
                  </td>
                </tr>
              ))}
              {executions.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    {t('automation.noExecutions')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {totalExecutions > 20 && (
            <div className="px-6 py-4 flex justify-between items-center border-t">
              <button
                onClick={() => setExecutionPage(p => Math.max(1, p - 1))}
                disabled={executionPage === 1}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                {t('common.previous')}
              </button>
              <span className="text-sm text-gray-500">
                {t('common.page')} {executionPage} / {Math.ceil(totalExecutions / 20)}
              </span>
              <button
                onClick={() => setExecutionPage(p => p + 1)}
                disabled={executionPage >= Math.ceil(totalExecutions / 20)}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                {t('common.next')}
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => (
            <div key={template.id} className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">{template.name}</h3>
              {template.description && (
                <p className="text-sm text-gray-500 mb-4">{template.description}</p>
              )}
              <div className="mb-4">
                <span className={`px-2 py-1 rounded text-xs ${getSeverityColor(template.severity)}`}>
                  {template.severity}
                </span>
              </div>
              <div className="text-sm text-gray-500 mb-4">
                <strong>{t('automation.triggers')}:</strong> {template.triggers.map(t => t.eventType).join(', ')}
              </div>
              <button
                onClick={() => handleCloneTemplate(template)}
                className="w-full bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
              >
                {t('automation.useTemplate')}
              </button>
            </div>
          ))}
          {templates.length === 0 && (
            <div className="col-span-3 text-center text-gray-500 py-8">
              {t('automation.noTemplates')}
            </div>
          )}
        </div>
      )}

      {activeTab === 'triggers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {availableTriggers.map((trigger) => (
            <div key={trigger.eventType} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-medium text-gray-900">{trigger.eventType}</h3>
                <span className="px-2 py-1 rounded text-xs bg-indigo-100 text-indigo-800">
                  {trigger.sourceModule}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-4">{trigger.description}</p>
              <div className="mb-4">
                <h4 className="text-xs font-semibold text-gray-700 mb-2">Sample Payload:</h4>
                <pre className="text-xs bg-gray-50 p-2 rounded overflow-x-auto">
                  {trigger.samplePayload}
                </pre>
              </div>
              <button
                onClick={() => {
                  setNewWorkflow({
                    ...newWorkflow,
                    triggers: [{ eventType: trigger.eventType, sourceModule: trigger.sourceModule }]
                  });
                  setShowCreateModal(true);
                }}
                className="w-full bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
              >
                Create Workflow with this Trigger
              </button>
            </div>
          ))}
          {availableTriggers.length === 0 && (
            <div className="col-span-3 text-center text-gray-500 py-8">
              No triggers available
            </div>
          )}
        </div>
      )}

      {selectedWorkflowId && workflowExecutions.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Workflow Executions</h2>
              <button
                onClick={() => {
                  setSelectedWorkflowId('');
                  setWorkflowExecutions([]);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Started At</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Event Type</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {workflowExecutions.map((exec) => (
                  <tr key={exec.id}>
                    <td className="px-4 py-2 whitespace-nowrap text-sm">
                      {new Date(exec.startedAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm">{exec.eventType}</td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded text-xs ${getStatusColor(exec.status)}`}>
                        {exec.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm">
                      {exec.actionsExecutedCount} / {exec.actionsExecutedCount + exec.actionsFailedCount}
                      {exec.actionsFailedCount > 0 && (
                        <span className="text-red-600 ml-1">({exec.actionsFailedCount} failed)</span>
                      )}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm">
                      <button
                        onClick={() => fetchExecutionDetail(exec.workflowId, exec.id)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showExecutionDetail && executionDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Execution Details</h2>
              <button
                onClick={() => {
                  setShowExecutionDetail(false);
                  setExecutionDetail(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Workflow:</label>
                  <p className="text-sm text-gray-900">{executionDetail.workflowName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Status:</label>
                  <span className={`ml-2 px-2 py-1 rounded text-xs ${getStatusColor(executionDetail.status)}`}>
                    {executionDetail.status}
                  </span>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Event Type:</label>
                  <p className="text-sm text-gray-900">{executionDetail.eventType}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Started At:</label>
                  <p className="text-sm text-gray-900">{new Date(executionDetail.startedAt).toLocaleString()}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Event Payload:</label>
                <pre className="text-xs bg-gray-50 p-3 rounded mt-1 overflow-x-auto">
                  {executionDetail.eventPayload}
                </pre>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Actions Executed:</label>
                <div className="space-y-2">
                  {executionDetail.actionsExecuted.map((action, idx) => (
                    <div key={idx} className="border rounded p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">{action.actionType}</span>
                        <span className={`px-2 py-1 rounded text-xs ${getStatusColor(action.status)}`}>
                          {action.status}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        Executed at: {new Date(action.executedAt).toLocaleString()}
                      </div>
                      {action.errorMessage && (
                        <div className="text-xs text-red-600 mt-1">Error: {action.errorMessage}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">{t('automation.createWorkflow')}</h2>
            <form onSubmit={handleCreateWorkflow}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">{t('automation.name')}</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border rounded"
                  value={newWorkflow.name}
                  onChange={(e) => setNewWorkflow({ ...newWorkflow, name: e.target.value })}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">{t('automation.description')}</label>
                <textarea
                  className="w-full px-3 py-2 border rounded"
                  value={newWorkflow.description}
                  onChange={(e) => setNewWorkflow({ ...newWorkflow, description: e.target.value })}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">{t('automation.severity')}</label>
                <select
                  className="w-full px-3 py-2 border rounded"
                  value={newWorkflow.severity}
                  onChange={(e) => setNewWorkflow({ ...newWorkflow, severity: e.target.value })}
                >
                  <option value="Info">Info</option>
                  <option value="Warning">Warning</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">{t('automation.trigger')}</label>
                <select
                  className="w-full px-3 py-2 border rounded"
                  value={newWorkflow.triggers[0]?.eventType}
                  onChange={(e) => setNewWorkflow({
                    ...newWorkflow,
                    triggers: [{ eventType: e.target.value, sourceModule: e.target.value.split('.')[0] }]
                  })}
                >
                  {EVENT_TYPES.map(et => (
                    <option key={et} value={et}>{et}</option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">{t('automation.action')}</label>
                <select
                  className="w-full px-3 py-2 border rounded"
                  value={newWorkflow.actions[0]?.actionType}
                  onChange={(e) => setNewWorkflow({
                    ...newWorkflow,
                    actions: [{ actionType: e.target.value, order: 0, configJson: '{}', isCritical: false }]
                  })}
                >
                  {ACTION_TYPES.map(at => (
                    <option key={at} value={at}>{at}</option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={newWorkflow.isEnabled}
                    onChange={(e) => setNewWorkflow({ ...newWorkflow, isEnabled: e.target.checked })}
                  />
                  {t('automation.enableImmediately')}
                </label>
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border rounded"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                >
                  {t('common.create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
