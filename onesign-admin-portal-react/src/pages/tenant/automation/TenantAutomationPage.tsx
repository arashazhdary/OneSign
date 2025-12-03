import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getTenantId } from '@/lib/tenant-context';
import { DEFAULT_TENANT_ID } from '@/lib/constants/testIds';
import * as AutomationAPI from '@/lib/api/automation';
import {
  AutomationWorkflowDto,
  EVENT_TYPES,
  ACTION_TYPES,
} from '@/lib/api/automation';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Workflow,
  Plus,
  RefreshCw,
  Play,
  Pause,
  Trash2,
  Eye,
  Copy,
  History,
  Zap,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Settings,
  FileText,
  Activity,
  X,
  ChevronRight,
  ChevronLeft,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import Modal from '@/components/common/Modal';

interface AutomationExecutionDto {
  id: string;
  workflowId: string;
  workflowName?: string;
  status: string;
  startedAt: string;
  completedAt?: string;
  type: string;
  actionsExecutedCount: number;
  actionsFailedCount: number;
}

interface AvailableTrigger {
  eventType: string;
  sourceModule: string;
  description: string;
  samplePayload: string;
}

interface WorkflowExecution {
  id: string;
  workflowId: string;
  workflowName: string;
  status: string;
  startedAt: string;
  completedAt?: string;
  type: string;
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
  type: string;
  eventPayload: string;
  actionsExecuted: {
    actionType: string;
    status: string;
    executedAt: string;
    errorMessage?: string;
  }[];
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  delay?: number;
}

const StatCard = ({ title, value, icon: Icon, color, delay = 0 }: StatCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: delay * 0.1 }}
    className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 hover:shadow-lg transition-all"
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{title}</p>
        <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{value}</p>
      </div>
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  </motion.div>
);

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
  const [availableTriggers, setAvailableTriggers] = useState<AvailableTrigger[]>([]);
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

  const tabs = [
    { id: 'workflows', label: t('automation.tabs.workflows'), icon: Workflow },
    { id: 'executionHistory', label: 'Execution History', icon: History },
    { id: 'templates', label: t('automation.tabs.templates'), icon: FileText },
    { id: 'triggers', label: 'Available Triggers', icon: Zap },
  ];

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
        const data = await AutomationAPI.getWorkflows();
        setWorkflows(data);
      } else if (activeTab === 'executionHistory') {
        const data = await AutomationAPI.getExecutions({ page: executionPage, pageSize: 20 });
        setExecutions(data.items);
        setTotalExecutions(data.totalCount);
      } else if (activeTab === 'templates') {
        const data = await AutomationAPI.getAvailableTemplates();
        setTemplates(data);
      } else if (activeTab === 'triggers') {
        const data = await AutomationAPI.getAvailableTriggers();
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
      const data = await AutomationAPI.getExecutionDetail(execId);
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
      const data = await AutomationAPI.testWorkflowWithPayload(workflowId, { userId });
      setSuccess(`Test completed: ${data.result}`);
      fetchData();
    } catch (err: any) {
      setError(err?.message || t('common.error'));
    }
  };

  const handleCreateTemplate = async (workflow: AutomationWorkflowDto) => {
    try {
      await AutomationAPI.createTemplate({
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
        ...newWorkflow,
        userId,
      } as any);
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
      await AutomationAPI.deleteWorkflow(id);
      setSuccess(t('automation.workflowDeleted'));
      fetchData();
    } catch (err) {
      setError(t('common.error'));
    }
  };

  const handleToggleWorkflow = async (workflow: AutomationWorkflowDto) => {
    try {
      if (workflow.isEnabled) {
        await AutomationAPI.disableWorkflow(workflow.id);
      } else {
        await AutomationAPI.enableWorkflow(workflow.id);
      }
      fetchData();
    } catch (err) {
      setError(t('common.error'));
    }
  };

  const handleCloneTemplate = async (template: AutomationWorkflowDto) => {
    try {
      await AutomationAPI.cloneTemplate(template.id);
      setSuccess(t('automation.templateCloned'));
      setActiveTab('workflows');
      fetchData();
    } catch (err) {
      setError(t('common.error'));
    }
  };

  const getStatusStyles = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === 'succeeded' || statusLower === 'success')
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400';
    if (statusLower === 'failed' || statusLower === 'failure')
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
    if (statusLower === 'running' || statusLower === 'inprogress')
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
    if (statusLower === 'skipped')
      return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300';
    return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
  };

  const getStatusIcon = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === 'succeeded' || statusLower === 'success') return <CheckCircle className="w-4 h-4" />;
    if (statusLower === 'failed' || statusLower === 'failure') return <XCircle className="w-4 h-4" />;
    if (statusLower === 'running' || statusLower === 'inprogress') return <Activity className="w-4 h-4" />;
    return <Clock className="w-4 h-4" />;
  };

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case 'Critical': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'Warning': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
      default: return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
    }
  };

  // Calculate stats
  const totalWorkflows = workflows.length;
  const activeWorkflows = workflows.filter(w => w.isEnabled).length;
  const successfulExecutions = executions.filter(e => e.status.toLowerCase() === 'succeeded' || e.status.toLowerCase() === 'success').length;
  const failedExecutions = executions.filter(e => e.status.toLowerCase() === 'failed' || e.status.toLowerCase() === 'failure').length;

  if (loading && !workflows.length && !executions.length && !templates.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 p-8">
        <div className="flex items-center justify-center h-64">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Workflow className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          </motion.div>
          <span className="ml-3 text-slate-600 dark:text-slate-400">{t('common.loading')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      <Helmet>
        <title>Automation - OneSign</title>
      </Helmet>

      <div className="p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
              <Workflow className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                {t('automation.title')}
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Automate workflows and event-driven actions
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={fetchData}
              className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </motion.button>
            {activeTab === 'workflows' && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/25"
              >
                <Plus className="w-4 h-4" />
                {t('automation.createWorkflow')}
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* Alerts */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl flex items-center gap-3"
            >
              <XCircle className="w-5 h-5 flex-shrink-0" />
              {error}
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
              {success}
              <button onClick={() => setSuccess('')} className="ml-auto">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Workflows"
            value={totalWorkflows}
            icon={Workflow}
            color="bg-gradient-to-br from-indigo-500 to-purple-600"
            delay={0}
          />
          <StatCard
            title="Active Workflows"
            value={activeWorkflows}
            icon={Activity}
            color="bg-gradient-to-br from-emerald-500 to-teal-600"
            delay={1}
          />
          <StatCard
            title="Successful Runs"
            value={successfulExecutions}
            icon={CheckCircle}
            color="bg-gradient-to-br from-green-500 to-emerald-600"
            delay={2}
          />
          <StatCard
            title="Failed Runs"
            value={failedExecutions}
            icon={XCircle}
            color="bg-gradient-to-br from-red-500 to-rose-600"
            delay={3}
          />
        </div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-1.5 inline-flex gap-1 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as Tab)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Workflows Tab */}
        {activeTab === 'workflows' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Workflow className="w-5 h-5 text-indigo-500" />
                Automation Workflows
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                <thead className="bg-slate-50 dark:bg-slate-900/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">{t('automation.name')}</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">{t('automation.triggers')}</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">{t('automation.severity')}</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">{t('automation.status')}</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">{t('automation.actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {workflows.map((workflow, index) => (
                    <motion.tr
                      key={workflow.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                            <Workflow className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-900 dark:text-white">{workflow.name}</p>
                            {workflow.description && (
                              <p className="text-xs text-slate-500 dark:text-slate-400">{workflow.description}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-amber-500" />
                          <span className="text-sm text-slate-600 dark:text-slate-400">
                            {workflow.triggers.map(t => t.type).join(', ')}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium ${getSeverityStyles(workflow.severity)}`}>
                          <AlertTriangle className="w-3 h-3" />
                          {workflow.severity}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleWorkflow(workflow)}
                          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            workflow.isEnabled
                              ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/50'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                          }`}
                        >
                          {workflow.isEnabled ? (
                            <>
                              <ToggleRight className="w-4 h-4" />
                              {t('automation.enabled')}
                            </>
                          ) : (
                            <>
                              <ToggleLeft className="w-4 h-4" />
                              {t('automation.disabled')}
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleTestWorkflow(workflow.id)}
                            className="p-2 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg transition-colors"
                            title="Test Workflow"
                          >
                            <Play className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => {
                              setSelectedWorkflowId(workflow.id);
                              fetchWorkflowExecutions(workflow.id);
                            }}
                            className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                            title="View Executions"
                          >
                            <History className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleCreateTemplate(workflow)}
                            className="p-2 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-lg transition-colors"
                            title="Save as Template"
                          >
                            <Copy className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleDeleteWorkflow(workflow.id)}
                            className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {workflows.length === 0 && (
              <div className="text-center py-12">
                <div className="p-4 bg-slate-100 dark:bg-slate-700 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Workflow className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                  {t('automation.noWorkflows')}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  Create your first automation workflow to get started
                </p>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  {t('automation.createWorkflow')}
                </motion.button>
              </div>
            )}
          </motion.div>
        )}

        {/* Execution History Tab */}
        {activeTab === 'executionHistory' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <History className="w-5 h-5 text-indigo-500" />
                Execution History
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                <thead className="bg-slate-50 dark:bg-slate-900/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">{t('automation.workflow')}</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">{t('automation.eventType')}</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">{t('automation.startedAt')}</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">{t('automation.status')}</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">{t('automation.actionsRun')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {executions.map((execution, index) => (
                    <motion.tr
                      key={execution.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-slate-900 dark:text-white">
                          {execution.workflowName || execution.workflowId}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-amber-500" />
                          <span className="text-sm text-slate-600 dark:text-slate-400">{execution.type}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                        {new Date(execution.startedAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium ${getStatusStyles(execution.status)}`}>
                          {getStatusIcon(execution.status)}
                          {execution.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-slate-600 dark:text-slate-400">
                            {execution.actionsExecutedCount} / {execution.actionsExecutedCount + execution.actionsFailedCount}
                          </span>
                          {execution.actionsFailedCount > 0 && (
                            <span className="text-xs text-red-600 dark:text-red-400">
                              ({execution.actionsFailedCount} failed)
                            </span>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {executions.length === 0 && (
              <div className="text-center py-12">
                <History className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                <p className="text-slate-600 dark:text-slate-400">{t('automation.noExecutions')}</p>
              </div>
            )}

            {totalExecutions > 20 && (
              <div className="px-6 py-4 flex justify-between items-center border-t border-slate-200 dark:border-slate-700">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setExecutionPage(p => Math.max(1, p - 1))}
                  disabled={executionPage === 1}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl disabled:opacity-50 transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                  {t('common.previous')}
                </motion.button>
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  {t('common.page')} {executionPage} / {Math.ceil(totalExecutions / 20)}
                </span>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setExecutionPage(p => p + 1)}
                  disabled={executionPage >= Math.ceil(totalExecutions / 20)}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl disabled:opacity-50 transition-all"
                >
                  {t('common.next')}
                  <ChevronRight className="w-4 h-4" />
                </motion.button>
              </div>
            )}
          </motion.div>
        )}

        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {templates.map((template, index) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 hover:shadow-lg transition-all"
              >
                <div className="flex items-start gap-3 mb-4">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{template.name}</h3>
                    {template.description && (
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{template.description}</p>
                    )}
                  </div>
                </div>
                <div className="mb-4">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium ${getSeverityStyles(template.severity)}`}>
                    <AlertTriangle className="w-3 h-3" />
                    {template.severity}
                  </span>
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400 mb-4 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  {template.triggers.map(t => t.type).join(', ')}
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleCloneTemplate(template)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/25"
                >
                  <Copy className="w-4 h-4" />
                  {t('automation.useTemplate')}
                </motion.button>
              </motion.div>
            ))}

            {templates.length === 0 && (
              <div className="col-span-3 text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <FileText className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                <p className="text-slate-600 dark:text-slate-400">{t('automation.noTemplates')}</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Triggers Tab */}
        {activeTab === 'triggers' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {availableTriggers.map((trigger, index) => (
              <motion.div
                key={trigger.eventType}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 hover:shadow-lg transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                      <Zap className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{trigger.eventType}</h3>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400">
                    {trigger.sourceModule}
                  </span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{trigger.description}</p>
                <div className="mb-4">
                  <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">Sample Payload:</h4>
                  <pre className="text-xs bg-slate-50 dark:bg-slate-700/50 p-3 rounded-xl overflow-x-auto text-slate-600 dark:text-slate-400">
                    {trigger.samplePayload}
                  </pre>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setNewWorkflow({
                      ...newWorkflow,
                      triggers: [{ eventType: trigger.eventType, sourceModule: trigger.sourceModule }]
                    });
                    setShowCreateModal(true);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/25"
                >
                  <Plus className="w-4 h-4" />
                  Create Workflow
                </motion.button>
              </motion.div>
            ))}

            {availableTriggers.length === 0 && (
              <div className="col-span-3 text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <Zap className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                <p className="text-slate-600 dark:text-slate-400">No triggers available</p>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Workflow Executions Modal */}
      <Modal
        isOpen={selectedWorkflowId !== '' && workflowExecutions.length > 0}
        onClose={() => {
          setSelectedWorkflowId('');
          setWorkflowExecutions([]);
        }}
        title="Workflow Executions"
        size="xl"
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-900/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Started At</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Event Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Actions</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {workflowExecutions.map((exec) => (
                <tr key={exec.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                  <td className="px-4 py-3 text-sm text-slate-900 dark:text-white">
                    {new Date(exec.startedAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{exec.type}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium ${getStatusStyles(exec.status)}`}>
                      {getStatusIcon(exec.status)}
                      {exec.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                    {exec.actionsExecutedCount} / {exec.actionsExecutedCount + exec.actionsFailedCount}
                    {exec.actionsFailedCount > 0 && (
                      <span className="text-red-600 dark:text-red-400 ml-1">({exec.actionsFailedCount} failed)</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => fetchExecutionDetail(exec.workflowId, exec.id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      Details
                    </motion.button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Modal>

      {/* Execution Detail Modal */}
      <Modal
        isOpen={showExecutionDetail && !!executionDetail}
        onClose={() => {
          setShowExecutionDetail(false);
          setExecutionDetail(null);
        }}
        title="Execution Details"
        size="xl"
      >
        {executionDetail && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase mb-1">Workflow</p>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{executionDetail.workflowName}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase mb-1">Status</p>
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium ${getStatusStyles(executionDetail.status)}`}>
                  {getStatusIcon(executionDetail.status)}
                  {executionDetail.status}
                </span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase mb-1">Event Type</p>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{executionDetail.type}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase mb-1">Started At</p>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{new Date(executionDetail.startedAt).toLocaleString()}</p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Event Payload</h3>
              <pre className="text-xs bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 p-4 rounded-xl overflow-x-auto text-slate-700 dark:text-slate-300">
                {executionDetail.eventPayload}
              </pre>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Actions Executed</h3>
              <div className="space-y-3">
                {executionDetail.actionsExecuted.map((action, idx) => (
                  <div key={idx} className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm text-slate-900 dark:text-white">{action.actionType}</span>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium ${getStatusStyles(action.status)}`}>
                        {getStatusIcon(action.status)}
                        {action.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Executed at: {new Date(action.executedAt).toLocaleString()}
                    </p>
                    {action.errorMessage && (
                      <p className="text-xs text-red-600 dark:text-red-400 mt-2 flex items-center gap-1">
                        <XCircle className="w-3 h-3" />
                        {action.errorMessage}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Create Workflow Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title={t('automation.createWorkflow')}
      >
        <form onSubmit={handleCreateWorkflow} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              {t('automation.name')}
            </label>
            <input
              type="text"
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              value={newWorkflow.name}
              onChange={(e) => setNewWorkflow({ ...newWorkflow, name: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              {t('automation.description')}
            </label>
            <textarea
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              rows={3}
              value={newWorkflow.description}
              onChange={(e) => setNewWorkflow({ ...newWorkflow, description: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              {t('automation.severity')}
            </label>
            <select
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              value={newWorkflow.severity}
              onChange={(e) => setNewWorkflow({ ...newWorkflow, severity: e.target.value })}
            >
              <option value="Info">Info</option>
              <option value="Warning">Warning</option>
              <option value="Critical">Critical</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              {t('automation.trigger')}
            </label>
            <select
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
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

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              {t('automation.action')}
            </label>
            <select
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
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

          <div>
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={newWorkflow.isEnabled}
                onChange={(e) => setNewWorkflow({ ...newWorkflow, isEnabled: e.target.checked })}
                className="rounded border-slate-300 dark:border-slate-500 text-indigo-600 focus:ring-indigo-500 w-5 h-5"
              />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('automation.enableImmediately')}</span>
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/25"
            >
              <Plus className="w-4 h-4" />
              {t('common.create')}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="px-6 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-all"
            >
              {t('common.cancel')}
            </motion.button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
