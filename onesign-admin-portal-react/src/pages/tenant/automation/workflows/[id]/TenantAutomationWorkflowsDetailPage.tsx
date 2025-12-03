import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getTenantId } from '@/lib/tenant-context';
import Modal from '@/components/common/Modal';
import StatusBadge from '@/components/common/StatusBadge';
import { getWorkflow, getWorkflowRuns, getWorkflowLogs, activateWorkflow, deactivateWorkflow, testWorkflowDetail, updateWorkflowBasicInfo } from '@/lib/api/automation';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Workflow,
  ArrowLeft,
  Play,
  Pause,
  Edit,
  TestTube,
  Settings,
  FileText,
  Activity,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  ChevronRight,
  Zap,
  GitBranch,
  User
} from 'lucide-react';

interface WorkflowData {
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

const tabs = [
  { key: 'overview', label: 'Overview', icon: <Workflow className="w-4 h-4" /> },
  { key: 'steps', label: 'Steps', icon: <GitBranch className="w-4 h-4" /> },
  { key: 'runs', label: 'Runs', icon: <Activity className="w-4 h-4" /> },
  { key: 'configuration', label: 'Config', icon: <Settings className="w-4 h-4" /> },
  { key: 'test', label: 'Test', icon: <TestTube className="w-4 h-4" /> },
  { key: 'logs', label: 'Logs', icon: <FileText className="w-4 h-4" /> },
];

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

export default function TenantAutomationWorkflowsDetailPage() {
  const params = useParams();
  const navigate = useNavigate();
  const workflowId = params.id as string;
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [workflow, setWorkflow] = useState<WorkflowData | null>(null);
  const [runs, setRuns] = useState<WorkflowRun[]>([]);
  const [logs, setLogs] = useState<WorkflowLog[]>([]);

  const [showTestModal, setShowTestModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

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
      const data = await getWorkflow(workflowId);
      setWorkflow(data as any);
      setEditName(data?.name || '');
      setEditDescription(data?.description || '');
    } catch (err) {
      setError(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const fetchRuns = async () => {
    try {
      const data = await getWorkflowRuns(workflowId, { limit: 20 });
      setRuns(data);
    } catch (err) {
      console.error('Failed to fetch runs:', err);
    }
  };

  const fetchLogs = async () => {
    try {
      const data = await getWorkflowLogs(workflowId, { limit: 50 });
      setLogs(data);
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
      if (workflow.isActive) {
        await deactivateWorkflow(workflowId);
      } else {
        await activateWorkflow(workflowId);
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
      JSON.parse(testData);
      await testWorkflowDetail(workflowId);
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
      await updateWorkflowBasicInfo(workflowId, { name: editName, description: editDescription });
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
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status: string) => {
    const statusMap: Record<string, string> = {
      active: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
      inactive: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300',
      running: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
      completed: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
      failed: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300',
      pending: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300',
    };
    return statusMap[status.toLowerCase()] || statusMap.pending;
  };

  const getLogLevelColor = (level: string) => {
    const levelMap: Record<string, string> = {
      info: 'text-blue-600 dark:text-blue-400',
      warning: 'text-yellow-600 dark:text-yellow-400',
      error: 'text-red-600 dark:text-red-400',
      debug: 'text-gray-600 dark:text-gray-400',
    };
    return levelMap[level.toLowerCase()] || levelMap.info;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!workflow) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-6 py-4 rounded-xl flex items-center gap-3"
        >
          <AlertCircle className="w-6 h-6" />
          Workflow not found
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 p-8">
      <Helmet>
        <title>{workflow.name} - Workflow Details - OneSign</title>
      </Helmet>

      {/* Back Button */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Workflows
      </motion.button>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 shadow-lg">
            <Workflow className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{workflow.name}</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">{workflow.description}</p>
          </div>
        </div>
        <div className="flex gap-3 items-center">
          <span className={`px-3 py-1.5 text-sm font-semibold rounded-full ${getStatusColor(workflow.status)}`}>
            {workflow.status}
          </span>
          <span className={`px-3 py-1.5 text-sm font-semibold rounded-full ${workflow.isActive ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'}`}>
            {workflow.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
      </motion.div>

      {/* Messages */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl flex items-center gap-2"
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
            className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-xl flex items-center gap-2"
          >
            <CheckCircle className="w-5 h-5" />
            {success}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6 flex gap-3"
      >
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleToggleActive}
          disabled={processing}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all disabled:opacity-50 ${
            workflow.isActive
              ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
              : 'bg-green-500 hover:bg-green-600 text-white'
          }`}
        >
          {workflow.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {workflow.isActive ? 'Deactivate' : 'Activate'}
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowEditModal(true)}
          className="flex items-center gap-2 bg-blue-500 text-white px-5 py-2.5 rounded-xl hover:bg-blue-600 font-medium transition-all"
        >
          <Edit className="w-4 h-4" />
          Edit
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowTestModal(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl hover:shadow-lg font-medium transition-all"
        >
          <TestTube className="w-4 h-4" />
          Test
        </motion.button>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-6 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-xl p-2 shadow-lg border border-gray-200 dark:border-slate-700"
      >
        <nav className="flex space-x-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as Tab)}
              className={`relative flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                activeTab === tab.key
                  ? 'text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700'
              }`}
            >
              {activeTab === tab.key && (
                <motion.div
                  layoutId="activeWorkflowTab"
                  className="absolute inset-0 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10 flex items-center justify-center gap-2">
                {tab.icon}
                {tab.label}
              </span>
            </button>
          ))}
        </nav>
      </motion.div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard
              title="Version"
              value={`v${workflow.version}`}
              icon={<Zap className="w-6 h-6 text-white" />}
              color="from-purple-500 to-purple-600"
              delay={0}
            />
            <StatCard
              title="Total Steps"
              value={workflow.steps.length}
              icon={<GitBranch className="w-6 h-6 text-white" />}
              color="from-blue-500 to-blue-600"
              delay={1}
            />
            <StatCard
              title="Last Run"
              value={workflow.lastRunAt ? 'Recent' : 'Never'}
              icon={<Activity className="w-6 h-6 text-white" />}
              color="from-green-500 to-emerald-600"
              delay={2}
            />
            <StatCard
              title="Status"
              value={workflow.isActive ? 'Active' : 'Inactive'}
              icon={workflow.isActive ? <Play className="w-6 h-6 text-white" /> : <Pause className="w-6 h-6 text-white" />}
              color={workflow.isActive ? 'from-green-500 to-green-600' : 'from-gray-500 to-gray-600'}
              delay={3}
            />
          </div>

          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Workflow className="w-5 h-5 text-purple-500" />
              Workflow Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Created By</label>
                <div className="text-gray-900 dark:text-white flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  {workflow.createdBy}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Created At</label>
                <div className="text-gray-900 dark:text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  {formatDate(workflow.createdAt)}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Last Updated</label>
                <div className="text-gray-900 dark:text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  {formatDate(workflow.updatedAt)}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Last Run</label>
                <div className="text-gray-900 dark:text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-gray-400" />
                  {formatDate(workflow.lastRunAt)}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-purple-500" />
              Trigger Configuration
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Trigger Type</label>
                <div className="text-gray-900 dark:text-white capitalize">{workflow.trigger.type}</div>
              </div>
              {workflow.trigger.conditions.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Conditions</label>
                  <div className="space-y-2">
                    {workflow.trigger.conditions.map((condition, index) => (
                      <div key={index} className="bg-gray-50 dark:bg-slate-700/50 p-3 rounded-lg">
                        <span className="font-medium text-gray-900 dark:text-white">{condition.field}</span>
                        <span className="text-gray-600 dark:text-gray-400 mx-2">{condition.operator}</span>
                        <span className="font-mono text-sm text-purple-600 dark:text-purple-400">{JSON.stringify(condition.value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Steps Tab */}
      {activeTab === 'steps' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-purple-500" />
            Workflow Steps
          </h3>
          <div className="space-y-4">
            {workflow.steps.map((step, index) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border border-gray-200 dark:border-slate-600 rounded-xl p-5"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-lg">
                    {step.stepNumber}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 dark:text-white text-lg">{step.name}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      <span className="font-medium">Type:</span> {step.type} |
                      <span className="font-medium ml-2">Action:</span> {step.action}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      <span className="font-medium">Timeout:</span> {step.timeout}s
                    </div>
                    <div className="mt-3 flex gap-6 text-sm">
                      <div className="flex items-center gap-1">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-gray-600 dark:text-gray-400">On Success:</span>
                        <span className="text-green-600 dark:text-green-400 font-medium">{step.onSuccess}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <XCircle className="w-4 h-4 text-red-500" />
                        <span className="text-gray-600 dark:text-gray-400">On Failure:</span>
                        <span className="text-red-600 dark:text-red-400 font-medium">{step.onFailure}</span>
                      </div>
                    </div>
                  </div>
                </div>
                {index < workflow.steps.length - 1 && (
                  <div className="ml-6 mt-3 flex items-center">
                    <div className="border-l-2 border-dashed border-gray-300 dark:border-slate-600 h-6" />
                    <ChevronRight className="w-4 h-4 text-gray-400 -ml-2" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Runs Tab */}
      {activeTab === 'runs' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-500" />
            Execution History
          </h3>
          {runs.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No execution history</p>
            </div>
          ) : (
            <div className="space-y-4">
              {runs.map((run, index) => (
                <motion.div
                  key={run.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border border-gray-200 dark:border-slate-600 rounded-xl p-4 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${getStatusColor(run.status)}`}>
                        {run.status}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Triggered by {run.triggeredBy}
                      </span>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Started: {formatDate(run.startedAt)}
                    {run.completedAt && ` | Completed: ${formatDate(run.completedAt)}`}
                  </div>
                  {run.errorMessage && (
                    <div className="text-sm text-red-600 dark:text-red-400 mt-2 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      {run.errorMessage}
                    </div>
                  )}
                  {run.steps.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-slate-600">
                      <div className="flex flex-wrap gap-2">
                        {run.steps.map((step) => (
                          <span key={step.stepId} className={`text-xs px-2.5 py-1 rounded-lg ${getStatusColor(step.status)}`}>
                            {step.stepName}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Configuration Tab */}
      {activeTab === 'configuration' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Settings className="w-5 h-5 text-purple-500" />
            Workflow Configuration
          </h3>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Trigger Configuration</label>
              <pre className="bg-gray-50 dark:bg-slate-700 p-4 rounded-xl overflow-x-auto text-sm text-gray-900 dark:text-gray-100 font-mono">
                {JSON.stringify(workflow.trigger.configuration, null, 2)}
              </pre>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Steps Configuration</label>
              <div className="space-y-4">
                {workflow.steps.map((step) => (
                  <div key={step.id}>
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Step {step.stepNumber}: {step.name}
                    </div>
                    <pre className="bg-gray-50 dark:bg-slate-700 p-4 rounded-xl overflow-x-auto text-sm text-gray-900 dark:text-gray-100 font-mono">
                      {JSON.stringify(step.configuration, null, 2)}
                    </pre>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Test Tab */}
      {activeTab === 'test' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <TestTube className="w-5 h-5 text-purple-500" />
            Test Workflow
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Test Data (JSON)
              </label>
              <textarea
                value={testData}
                onChange={(e) => setTestData(e.target.value)}
                rows={10}
                className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
                placeholder='{"key": "value"}'
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleTestWorkflow}
              disabled={processing}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:shadow-lg font-medium transition-all disabled:opacity-50"
            >
              {processing ? 'Running Test...' : 'Run Test'}
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Logs Tab */}
      {activeTab === 'logs' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-500" />
            Workflow Logs
          </h3>
          {logs.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No logs available</p>
            </div>
          ) : (
            <div className="space-y-2">
              {logs.map((log, index) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className="border-l-4 border-gray-300 dark:border-slate-600 pl-4 py-2 hover:bg-gray-50 dark:hover:bg-slate-700/50 rounded-r-lg transition-colors"
                >
                  <div className="flex items-start gap-2">
                    <span className={`text-xs font-semibold uppercase ${getLogLevelColor(log.level)}`}>
                      {log.level}
                    </span>
                    <span className="text-sm text-gray-900 dark:text-white">{log.message}</span>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {formatDate(log.timestamp)}
                    {log.runId && ` | Run ID: ${log.runId}`}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Test Modal */}
      <Modal
        isOpen={showTestModal}
        onClose={() => setShowTestModal(false)}
        title="Test Workflow"
        size="lg"
        footer={
          <>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowTestModal(false)}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-slate-700 rounded-xl hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors"
            >
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleTestWorkflow}
              disabled={processing}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
            >
              {processing ? 'Running...' : 'Run Test'}
            </motion.button>
          </>
        }
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Test Data (JSON)
          </label>
          <textarea
            value={testData}
            onChange={(e) => setTestData(e.target.value)}
            rows={8}
            className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
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
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowEditModal(false)}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-slate-700 rounded-xl hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors"
            >
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleUpdateWorkflow}
              disabled={processing}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
            >
              {processing ? 'Saving...' : 'Save Changes'}
            </motion.button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Name</label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
