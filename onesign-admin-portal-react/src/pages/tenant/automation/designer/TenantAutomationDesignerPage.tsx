import { useState, useEffect, useRef, DragEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { getTenantId } from '@/lib/tenant-context';
import * as AutomationAPI from '@/lib/api/automation';
import { Helmet } from 'react-helmet-async';
import {
  Workflow,
  Mail,
  Smartphone,
  Link,
  GitBranch,
  Clock,
  Bell,
  User,
  CheckSquare,
  RefreshCw,
  FileText,
  FolderOpen,
  Save,
  TestTube,
  Rocket,
  X,
  Trash2,
  Settings,
  ArrowRight,
  Loader2,
  CheckCircle,
  XCircle,
  Zap,
} from 'lucide-react';

interface WorkflowAction {
  id: string;
  type: string;
  name: string;
  icon: React.ReactNode;
  color: string;
}

interface WorkflowStep {
  id: string;
  type: string;
  name: string;
  x: number;
  y: number;
  config: Record<string, any>;
  connections: string[];
}

interface WorkflowData {
  id?: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  isActive: boolean;
}

const AVAILABLE_ACTIONS: WorkflowAction[] = [
  { id: 'email', type: 'email', name: 'Send Email', icon: <Mail className="w-5 h-5" />, color: 'from-blue-500 to-blue-600' },
  { id: 'sms', type: 'sms', name: 'Send SMS', icon: <Smartphone className="w-5 h-5" />, color: 'from-green-500 to-green-600' },
  { id: 'webhook', type: 'webhook', name: 'Call Webhook', icon: <Link className="w-5 h-5" />, color: 'from-purple-500 to-purple-600' },
  { id: 'condition', type: 'condition', name: 'Condition', icon: <GitBranch className="w-5 h-5" />, color: 'from-yellow-500 to-yellow-600' },
  { id: 'delay', type: 'delay', name: 'Delay', icon: <Clock className="w-5 h-5" />, color: 'from-orange-500 to-orange-600' },
  { id: 'notification', type: 'notification', name: 'Push Notification', icon: <Bell className="w-5 h-5" />, color: 'from-red-500 to-red-600' },
  { id: 'assign', type: 'assign', name: 'Assign User', icon: <User className="w-5 h-5" />, color: 'from-indigo-500 to-indigo-600' },
  { id: 'approval', type: 'approval', name: 'Request Approval', icon: <CheckSquare className="w-5 h-5" />, color: 'from-teal-500 to-teal-600' },
  { id: 'data-transform', type: 'data-transform', name: 'Transform Data', icon: <RefreshCw className="w-5 h-5" />, color: 'from-pink-500 to-pink-600' },
  { id: 'log', type: 'log', name: 'Log Event', icon: <FileText className="w-5 h-5" />, color: 'from-gray-500 to-gray-600' },
];

export default function TenantAutomationDesignerPage() {
  const { t } = useTranslation();
  const canvasRef = useRef<HTMLDivElement>(null);
  const [tenantId, setTenantIdState] = useState<string | null>(null);
  const [workflow, setWorkflow] = useState<WorkflowData>({
    name: 'New Workflow',
    description: '',
    steps: [],
    isActive: false,
  });
  const [selectedStep, setSelectedStep] = useState<WorkflowStep | null>(null);
  const [draggedAction, setDraggedAction] = useState<WorkflowAction | null>(null);
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [workflows, setWorkflows] = useState<WorkflowData[]>([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [testResults, setTestResults] = useState<string>('');
  const [showTestModal, setShowTestModal] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const contextTenantId = getTenantId();
    setTenantIdState(contextTenantId || '00000000-0000-0000-0000-000000000000');
  }, []);

  useEffect(() => {
    if (tenantId) loadWorkflows();
  }, [tenantId]);

  const loadWorkflows = async () => {
    if (!tenantId) return;
    try {
      const data = await AutomationAPI.getWorkflowsForDesigner();
      setWorkflows(Array.isArray(data) ? data : data.items || []);
    } catch (error) {
      console.error('Error loading workflows:', error);
    }
  };

  const handleDragStart = (action: WorkflowAction) => setDraggedAction(action);
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => e.preventDefault();

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!draggedAction || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const newStep: WorkflowStep = {
      id: `step-${Date.now()}`,
      type: draggedAction.type,
      name: draggedAction.name,
      x, y,
      config: {},
      connections: [],
    };
    setWorkflow(prev => ({ ...prev, steps: [...prev.steps, newStep] }));
    setDraggedAction(null);
  };

  const handleStepClick = (step: WorkflowStep) => {
    if (connectingFrom) {
      setWorkflow(prev => ({
        ...prev,
        steps: prev.steps.map(s => s.id === connectingFrom ? { ...s, connections: [...s.connections, step.id] } : s),
      }));
      setConnectingFrom(null);
    } else {
      setSelectedStep(step);
    }
  };

  const handleStartConnection = (stepId: string) => setConnectingFrom(stepId);

  const handleDeleteStep = (stepId: string) => {
    setWorkflow(prev => ({ ...prev, steps: prev.steps.filter(s => s.id !== stepId) }));
    if (selectedStep?.id === stepId) setSelectedStep(null);
  };

  const handleUpdateStepConfig = (key: string, value: any) => {
    if (!selectedStep) return;
    setWorkflow(prev => ({
      ...prev,
      steps: prev.steps.map(s => s.id === selectedStep.id ? { ...s, config: { ...s.config, [key]: value } } : s),
    }));
    setSelectedStep(prev => prev ? { ...prev, config: { ...prev.config, [key]: value } } : null);
  };

  const handleSaveWorkflow = async () => {
    if (!tenantId) return;
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const data = await AutomationAPI.saveWorkflow(workflow);
      setWorkflow(data);
      setSuccess('Workflow saved successfully');
      setShowSaveModal(false);
      loadWorkflows();
    } catch (error: any) {
      setError(error?.message || t('common.failedToSaveWorkflow'));
    } finally {
      setSaving(false);
    }
  };

  const handleLoadWorkflow = (wf: WorkflowData) => {
    setWorkflow(wf);
    setShowLoadModal(false);
    setSelectedStep(null);
  };

  const handleTestWorkflow = async () => {
    if (!tenantId) return;
    setTestResults('Testing workflow...');
    setShowTestModal(true);
    try {
      const data = await AutomationAPI.testWorkflowDesigner(workflow);
      setTestResults(JSON.stringify(data, null, 2));
    } catch (error: any) {
      setTestResults(`Error: ${error?.message || 'Test failed'}`);
    }
  };

  const handleDeployWorkflow = async () => {
    if (!workflow.id) {
      setError('Please save workflow before deploying');
      return;
    }
    if (!confirm('Deploy this workflow? It will become active.')) return;
    try {
      const data = await AutomationAPI.deployWorkflow(workflow.id);
      setWorkflow(data);
      setSuccess('Workflow deployed successfully');
    } catch (error: any) {
      setError(error?.message || t('common.failedToDeployWorkflow'));
    }
  };

  const getActionInfo = (type: string) => AVAILABLE_ACTIONS.find(a => a.type === type) || { icon: <Zap className="w-5 h-5" />, color: 'from-gray-500 to-gray-600' };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      <Helmet>
        <title>Workflow Designer</title>
      </Helmet>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-slate-700 px-6 py-4"
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
              <Workflow className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Workflow Designer</h1>
              <input
                type="text"
                value={workflow.name}
                onChange={(e) => setWorkflow({ ...workflow, name: e.target.value })}
                className="text-sm text-gray-600 dark:text-gray-400 bg-transparent border-b border-transparent hover:border-gray-300 dark:hover:border-slate-600 focus:border-indigo-600 dark:focus:border-indigo-400 outline-none mt-1 transition-colors"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowLoadModal(true)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 transition-colors"
            >
              <FolderOpen className="w-4 h-4" />
              Load
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowSaveModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              <Save className="w-4 h-4" />
              Save
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleTestWorkflow}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              <TestTube className="w-4 h-4" />
              Test
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleDeployWorkflow}
              disabled={!workflow.id}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Rocket className="w-4 h-4" />
              Deploy
            </motion.button>
          </div>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-2 rounded-xl text-sm flex items-center gap-2"
            >
              <XCircle className="w-4 h-4" />
              {error}
            </motion.div>
          )}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-2 rounded-xl text-sm flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              {success}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Actions Palette */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-64 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-r border-gray-200 dark:border-slate-700 p-4 overflow-y-auto"
        >
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Available Actions</h2>
          <div className="space-y-2">
            {AVAILABLE_ACTIONS.map((action, index) => (
              <motion.div
                key={action.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                draggable
                onDragStart={() => handleDragStart(action)}
                className={`bg-gradient-to-r ${action.color} text-white p-3 rounded-xl cursor-move hover:shadow-lg transition-all`}
              >
                <div className="flex items-center gap-3">
                  {action.icon}
                  <span className="font-medium text-sm">{action.name}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Canvas */}
        <div
          ref={canvasRef}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className="flex-1 relative overflow-auto"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }}
        >
          {connectingFrom && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-4 left-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-xl shadow-lg z-10"
            >
              Click on a step to connect
            </motion.div>
          )}

          {workflow.steps.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center text-gray-400 dark:text-gray-500"
              >
                <Workflow className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-xl mb-2">Drag actions from the left to start building</p>
                <p className="text-sm">Your workflow canvas is empty</p>
              </motion.div>
            </div>
          )}

          {/* Draw connections */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                <polygon points="0 0, 10 3, 0 6" fill="#6366f1" />
              </marker>
            </defs>
            {workflow.steps.map((step) =>
              step.connections.map((targetId) => {
                const target = workflow.steps.find(s => s.id === targetId);
                if (!target) return null;
                return (
                  <line
                    key={`${step.id}-${targetId}`}
                    x1={step.x + 60}
                    y1={step.y + 40}
                    x2={target.x + 60}
                    y2={target.y + 40}
                    stroke="url(#lineGradient)"
                    strokeWidth="3"
                    markerEnd="url(#arrowhead)"
                  />
                );
              })
            )}
            <defs>
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#a855f7" />
              </linearGradient>
            </defs>
          </svg>

          {/* Workflow Steps */}
          {workflow.steps.map((step, index) => {
            const actionInfo = getActionInfo(step.type);
            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className={`absolute bg-gradient-to-r ${actionInfo.color} text-white p-4 rounded-xl shadow-lg cursor-pointer border-2 transition-all ${
                  selectedStep?.id === step.id ? 'border-yellow-400 shadow-yellow-400/30' : 'border-transparent hover:shadow-xl'
                }`}
                style={{ left: step.x, top: step.y, width: 140 }}
                onClick={() => handleStepClick(step)}
              >
                <div className="flex items-center justify-between mb-2">
                  {actionInfo.icon}
                  <motion.button
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => { e.stopPropagation(); handleDeleteStep(step.id); }}
                    className="text-white/70 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </motion.button>
                </div>
                <div className="text-sm font-medium truncate">{step.name}</div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => { e.stopPropagation(); handleStartConnection(step.id); }}
                  className="mt-2 text-xs bg-white/20 px-3 py-1.5 rounded-lg hover:bg-white/30 w-full flex items-center justify-center gap-1 transition-colors"
                >
                  Connect
                  <ArrowRight className="w-3 h-3" />
                </motion.button>
              </motion.div>
            );
          })}
        </div>

        {/* Right Sidebar - Properties Panel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-80 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-l border-gray-200 dark:border-slate-700 p-4 overflow-y-auto"
        >
          {selectedStep ? (
            <>
              <div className="flex items-center gap-2 mb-6">
                <Settings className="w-5 h-5 text-indigo-600" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Properties</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Step Name</label>
                  <input
                    type="text"
                    value={selectedStep.name}
                    onChange={(e) => {
                      const newName = e.target.value;
                      setWorkflow(prev => ({ ...prev, steps: prev.steps.map(s => s.id === selectedStep.id ? { ...s, name: newName } : s) }));
                      setSelectedStep({ ...selectedStep, name: newName });
                    }}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Step Type</label>
                  <input
                    type="text"
                    value={selectedStep.type}
                    disabled
                    className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-xl bg-gray-50 dark:bg-slate-700 text-gray-500 dark:text-gray-400"
                  />
                </div>

                {selectedStep.type === 'email' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">To Email</label>
                      <input
                        type="email"
                        value={selectedStep.config.toEmail || ''}
                        onChange={(e) => handleUpdateStepConfig('toEmail', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                        placeholder="user@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Subject</label>
                      <input
                        type="text"
                        value={selectedStep.config.subject || ''}
                        onChange={(e) => handleUpdateStepConfig('subject', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Body</label>
                      <textarea
                        value={selectedStep.config.body || ''}
                        onChange={(e) => handleUpdateStepConfig('body', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                        rows={4}
                      />
                    </div>
                  </>
                )}

                {selectedStep.type === 'webhook' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">URL</label>
                      <input
                        type="url"
                        value={selectedStep.config.url || ''}
                        onChange={(e) => handleUpdateStepConfig('url', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                        placeholder="https://example.com/webhook"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Method</label>
                      <select
                        value={selectedStep.config.method || 'POST'}
                        onChange={(e) => handleUpdateStepConfig('method', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                      >
                        <option>GET</option>
                        <option>POST</option>
                        <option>PUT</option>
                        <option>DELETE</option>
                      </select>
                    </div>
                  </>
                )}

                {selectedStep.type === 'delay' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Duration (seconds)</label>
                    <input
                      type="number"
                      value={selectedStep.config.duration || 60}
                      onChange={(e) => handleUpdateStepConfig('duration', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                )}

                {selectedStep.type === 'condition' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Condition</label>
                      <select
                        value={selectedStep.config.condition || 'equals'}
                        onChange={(e) => handleUpdateStepConfig('condition', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="equals">Equals</option>
                        <option value="notEquals">Not Equals</option>
                        <option value="contains">Contains</option>
                        <option value="greaterThan">Greater Than</option>
                        <option value="lessThan">Less Than</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Value</label>
                      <input
                        type="text"
                        value={selectedStep.config.value || ''}
                        onChange={(e) => handleUpdateStepConfig('value', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </>
                )}

                <div className="pt-4 border-t border-gray-200 dark:border-slate-700">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Connections</h3>
                  {selectedStep.connections.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400">No connections</p>
                  ) : (
                    <ul className="space-y-2">
                      {selectedStep.connections.map(connId => {
                        const target = workflow.steps.find(s => s.id === connId);
                        return (
                          <li key={connId} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                            <span className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2">
                              <ArrowRight className="w-3 h-3" />
                              {target?.name || 'Unknown'}
                            </span>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => {
                                setWorkflow(prev => ({
                                  ...prev,
                                  steps: prev.steps.map(s => s.id === selectedStep.id ? { ...s, connections: s.connections.filter(c => c !== connId) } : s),
                                }));
                                setSelectedStep({ ...selectedStep, connections: selectedStep.connections.filter(c => c !== connId) });
                              }}
                              className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                            >
                              <Trash2 className="w-4 h-4" />
                            </motion.button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500">
              <Settings className="w-12 h-12 mb-4 opacity-50" />
              <p className="text-lg mb-2">No step selected</p>
              <p className="text-sm text-center">Click on a step to edit its properties</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Save Modal */}
      <AnimatePresence>
        {showSaveModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={() => setShowSaveModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-800 p-6 rounded-2xl max-w-md w-full shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Save Workflow</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Workflow Name</label>
                  <input
                    type="text"
                    value={workflow.name}
                    onChange={(e) => setWorkflow({ ...workflow, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
                  <textarea
                    value={workflow.description}
                    onChange={(e) => setWorkflow({ ...workflow, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSaveWorkflow}
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {saving ? 'Saving...' : 'Save'}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowSaveModal(false)}
                  className="px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 transition-colors"
                >
                  Cancel
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Load Modal */}
      <AnimatePresence>
        {showLoadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={() => setShowLoadModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-800 p-6 rounded-2xl max-w-2xl w-full max-h-96 overflow-y-auto shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Load Workflow</h2>
              {workflows.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">No saved workflows</p>
              ) : (
                <div className="space-y-2">
                  {workflows.map((wf) => (
                    <motion.div
                      key={wf.id}
                      whileHover={{ scale: 1.01 }}
                      className="border border-gray-200 dark:border-slate-700 rounded-xl p-4 hover:bg-gray-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors"
                      onClick={() => handleLoadWorkflow(wf)}
                    >
                      <h3 className="font-medium text-gray-900 dark:text-white">{wf.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{wf.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500 mt-2">
                        <span>{wf.steps.length} steps</span>
                        <span className={wf.isActive ? 'text-green-600 dark:text-green-400' : ''}>
                          {wf.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowLoadModal(false)}
                className="mt-4 px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 transition-colors"
              >
                Close
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Test Modal */}
      <AnimatePresence>
        {showTestModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={() => setShowTestModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-800 p-6 rounded-2xl max-w-2xl w-full max-h-96 overflow-y-auto shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Test Results</h2>
              <pre className="bg-gray-900 dark:bg-slate-900 text-gray-100 p-4 rounded-xl text-sm overflow-auto max-h-64 font-mono">
                {testResults}
              </pre>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowTestModal(false)}
                className="mt-4 px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 transition-colors"
              >
                Close
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
