'use client';

import { useState, useEffect, useRef, DragEvent } from 'react';
import { useTranslations } from 'next-intl';
import { getTenantId } from '@/lib/tenant-context';
import * as AutomationAPI from '@/lib/api/automation';

interface WorkflowAction {
  id: string;
  type: string;
  name: string;
  icon: string;
  color: string;
}

const AVAILABLE_ACTIONS: WorkflowAction[] = [
  { id: 'email', type: 'email', name: 'Send Email', icon: '📧', color: 'bg-blue-500' },
  { id: 'sms', type: 'sms', name: 'Send SMS', icon: '📱', color: 'bg-green-500' },
  { id: 'webhook', type: 'webhook', name: 'Call Webhook', icon: '🔗', color: 'bg-purple-500' },
  { id: 'condition', type: 'condition', name: 'Condition', icon: '🔀', color: 'bg-yellow-500' },
  { id: 'delay', type: 'delay', name: 'Delay', icon: '⏰', color: 'bg-orange-500' },
  { id: 'notification', type: 'notification', name: 'Push Notification', icon: '🔔', color: 'bg-red-500' },
  { id: 'assign', type: 'assign', name: 'Assign User', icon: '👤', color: 'bg-indigo-500' },
  { id: 'approval', type: 'approval', name: 'Request Approval', icon: '✅', color: 'bg-teal-500' },
  { id: 'data-transform', type: 'data-transform', name: 'Transform Data', icon: '🔄', color: 'bg-pink-500' },
  { id: 'log', type: 'log', name: 'Log Event', icon: '📝', color: 'bg-gray-500' },
];

export default function WorkflowDesignerPage() {
  const t = useTranslations();
  const canvasRef = useRef<HTMLDivElement>(null);
  const [tenantId, setTenantIdState] = useState<string | null>(null);
  const [workflow, setWorkflow] = useState<AutomationAPI.Workflow>({
    name: 'New Workflow',
    description: '',
    steps: [],
    isActive: false,
  });
  const [selectedStep, setSelectedStep] = useState<AutomationAPI.WorkflowStep | null>(null);
  const [draggedAction, setDraggedAction] = useState<WorkflowAction | null>(null);
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [workflows, setWorkflows] = useState<AutomationAPI.Workflow[]>([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [testResults, setTestResults] = useState<string>('');
  const [showTestModal, setShowTestModal] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const contextTenantId = getTenantId();
    setTenantIdState(contextTenantId || '00000000-0000-0000-0000-000000000000');
  }, []);

  useEffect(() => {
    if (tenantId) {
      loadWorkflows();
    }
  }, [tenantId]);

  const loadWorkflows = async () => {
    if (!tenantId) return;
    try {
      const data = await AutomationAPI.getWorkflowsForDesigner(tenantId);
      setWorkflows(data.items || []);
    } catch (error) {
      console.error('Error loading workflows:', error);
    }
  };

  const handleDragStart = (action: WorkflowAction) => {
    setDraggedAction(action);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!draggedAction || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newStep: AutomationAPI.WorkflowStep = {
      id: `step-${Date.now()}`,
      type: draggedAction.type,
      name: draggedAction.name,
      x,
      y,
      config: {},
      connections: [],
    };

    setWorkflow((prev) => ({
      ...prev,
      steps: [...prev.steps, newStep],
    }));

    setDraggedAction(null);
  };

  const handleStepClick = (step: AutomationAPI.WorkflowStep) => {
    if (connectingFrom) {
      // Create connection
      setWorkflow((prev) => ({
        ...prev,
        steps: prev.steps.map((s) =>
          s.id === connectingFrom
            ? { ...s, connections: [...s.connections, step.id] }
            : s
        ),
      }));
      setConnectingFrom(null);
    } else {
      setSelectedStep(step);
    }
  };

  const handleStartConnection = (stepId: string) => {
    setConnectingFrom(stepId);
  };

  const handleDeleteStep = (stepId: string) => {
    setWorkflow((prev) => ({
      ...prev,
      steps: prev.steps.filter((s) => s.id !== stepId),
    }));
    if (selectedStep?.id === stepId) {
      setSelectedStep(null);
    }
  };

  const handleUpdateStepConfig = (key: string, value: any) => {
    if (!selectedStep) return;

    setWorkflow((prev) => ({
      ...prev,
      steps: prev.steps.map((s) =>
        s.id === selectedStep.id
          ? { ...s, config: { ...s.config, [key]: value } }
          : s
      ),
    }));

    setSelectedStep((prev) =>
      prev ? { ...prev, config: { ...prev.config, [key]: value } } : null
    );
  };

  const handleSaveWorkflow = async () => {
    if (!tenantId) return;
    setError('');
    setSuccess('');

    try {
      const data = await AutomationAPI.saveWorkflow(workflow, tenantId);
      setWorkflow(data);
      setSuccess('Workflow saved successfully');
      setShowSaveModal(false);
      loadWorkflows();
    } catch (error: any) {
      setError(error?.message || 'Failed to save workflow');
      console.error('Error saving workflow:', error);
    }
  };

  const handleLoadWorkflow = (wf: AutomationAPI.Workflow) => {
    setWorkflow(wf);
    setShowLoadModal(false);
    setSelectedStep(null);
  };

  const handleTestWorkflow = async () => {
    if (!tenantId) return;
    setTestResults('Testing workflow...');
    setShowTestModal(true);

    try {
      const data = await AutomationAPI.testWorkflowDesigner(workflow, tenantId);
      setTestResults(JSON.stringify(data, null, 2));
    } catch (error: any) {
      setTestResults(`Error: ${error?.message || 'Test failed'}`);
      console.error('Error testing workflow:', error);
    }
  };

  const handleDeployWorkflow = async () => {
    if (!workflow.id) {
      setError('Please save workflow before deploying');
      return;
    }

    if (!confirm('Deploy this workflow? It will become active.')) return;

    try {
      const data = await AutomationAPI.deployWorkflow(workflow.id, tenantId);
      setWorkflow(data);
      setSuccess('Workflow deployed successfully');
    } catch (error: any) {
      setError(error?.message || 'Failed to deploy workflow');
      console.error('Error deploying workflow:', error);
    }
  };

  const getActionColor = (type: string) => {
    return AVAILABLE_ACTIONS.find((a) => a.type === type)?.color || 'bg-gray-500';
  };

  const getActionIcon = (type: string) => {
    return AVAILABLE_ACTIONS.find((a) => a.type === type)?.icon || '📦';
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Workflow Designer</h1>
            <input
              type="text"
              value={workflow.name}
              onChange={(e) => setWorkflow({ ...workflow, name: e.target.value })}
              className="text-sm text-gray-600 border-b border-transparent hover:border-gray-300 focus:border-indigo-600 outline-none mt-1"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowLoadModal(true)}
              className="px-4 py-2 border rounded hover:bg-gray-50"
            >
              📂 Load
            </button>
            <button
              onClick={() => setShowSaveModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              💾 Save
            </button>
            <button
              onClick={handleTestWorkflow}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              🧪 Test
            </button>
            <button
              onClick={handleDeployWorkflow}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              disabled={!workflow.id}
            >
              🚀 Deploy
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-2 bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-2 bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded text-sm">
            {success}
          </div>
        )}
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Actions Palette */}
        <div className="w-64 bg-gray-50 border-r p-4 overflow-y-auto">
          <h2 className="text-lg font-semibold mb-4">Available Actions</h2>
          <div className="space-y-2">
            {AVAILABLE_ACTIONS.map((action) => (
              <div
                key={action.id}
                draggable
                onDragStart={() => handleDragStart(action)}
                className={`${action.color} text-white p-3 rounded cursor-move hover:opacity-90 transition-opacity`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{action.icon}</span>
                  <span className="font-medium text-sm">{action.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Canvas */}
        <div
          ref={canvasRef}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className="flex-1 bg-gray-100 relative overflow-auto"
          style={{ backgroundImage: 'radial-gradient(circle, #ddd 1px, transparent 1px)', backgroundSize: '20px 20px' }}
        >
          {connectingFrom && (
            <div className="absolute top-4 left-4 bg-blue-600 text-white px-4 py-2 rounded shadow-lg">
              Click on a step to connect
            </div>
          )}

          {workflow.steps.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <p className="text-xl mb-2">Drag actions from the left to start building</p>
                <p className="text-sm">Your workflow canvas is empty</p>
              </div>
            </div>
          )}

          {/* Draw connections */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {workflow.steps.map((step) =>
              step.connections.map((targetId) => {
                const target = workflow.steps.find((s) => s.id === targetId);
                if (!target) return null;
                return (
                  <line
                    key={`${step.id}-${targetId}`}
                    x1={step.x + 60}
                    y1={step.y + 40}
                    x2={target.x + 60}
                    y2={target.y + 40}
                    stroke="#4F46E5"
                    strokeWidth="2"
                    markerEnd="url(#arrowhead)"
                  />
                );
              })
            )}
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="10"
                refX="9"
                refY="3"
                orient="auto"
              >
                <polygon points="0 0, 10 3, 0 6" fill="#4F46E5" />
              </marker>
            </defs>
          </svg>

          {/* Workflow Steps */}
          {workflow.steps.map((step) => (
            <div
              key={step.id}
              className={`absolute ${getActionColor(step.type)} text-white p-3 rounded shadow-lg cursor-pointer border-2 ${
                selectedStep?.id === step.id ? 'border-yellow-400' : 'border-transparent'
              }`}
              style={{ left: step.x, top: step.y, width: 120 }}
              onClick={() => handleStepClick(step)}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{getActionIcon(step.type)}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteStep(step.id);
                  }}
                  className="text-white hover:text-red-200 text-xs"
                >
                  ✕
                </button>
              </div>
              <div className="text-xs font-medium">{step.name}</div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleStartConnection(step.id);
                }}
                className="mt-2 text-xs bg-white bg-opacity-20 px-2 py-1 rounded hover:bg-opacity-30 w-full"
              >
                Connect →
              </button>
            </div>
          ))}
        </div>

        {/* Right Sidebar - Properties Panel */}
        <div className="w-80 bg-white border-l p-4 overflow-y-auto">
          {selectedStep ? (
            <>
              <h2 className="text-lg font-semibold mb-4">Properties</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Step Name</label>
                  <input
                    type="text"
                    value={selectedStep.name}
                    onChange={(e) => {
                      const newName = e.target.value;
                      setWorkflow((prev) => ({
                        ...prev,
                        steps: prev.steps.map((s) =>
                          s.id === selectedStep.id ? { ...s, name: newName } : s
                        ),
                      }));
                      setSelectedStep({ ...selectedStep, name: newName });
                    }}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Step Type</label>
                  <input
                    type="text"
                    value={selectedStep.type}
                    disabled
                    className="w-full px-3 py-2 border rounded bg-gray-50"
                  />
                </div>

                {/* Type-specific configurations */}
                {selectedStep.type === 'email' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-1">To Email</label>
                      <input
                        type="email"
                        value={selectedStep.config.toEmail || ''}
                        onChange={(e) => handleUpdateStepConfig('toEmail', e.target.value)}
                        className="w-full px-3 py-2 border rounded"
                        placeholder="user@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Subject</label>
                      <input
                        type="text"
                        value={selectedStep.config.subject || ''}
                        onChange={(e) => handleUpdateStepConfig('subject', e.target.value)}
                        className="w-full px-3 py-2 border rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Body</label>
                      <textarea
                        value={selectedStep.config.body || ''}
                        onChange={(e) => handleUpdateStepConfig('body', e.target.value)}
                        className="w-full px-3 py-2 border rounded"
                        rows={4}
                      />
                    </div>
                  </>
                )}

                {selectedStep.type === 'webhook' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-1">URL</label>
                      <input
                        type="url"
                        value={selectedStep.config.url || ''}
                        onChange={(e) => handleUpdateStepConfig('url', e.target.value)}
                        className="w-full px-3 py-2 border rounded"
                        placeholder="https://example.com/webhook"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Method</label>
                      <select
                        value={selectedStep.config.method || 'POST'}
                        onChange={(e) => handleUpdateStepConfig('method', e.target.value)}
                        className="w-full px-3 py-2 border rounded"
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
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-1">Duration (seconds)</label>
                      <input
                        type="number"
                        value={selectedStep.config.duration || 60}
                        onChange={(e) => handleUpdateStepConfig('duration', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border rounded"
                      />
                    </div>
                  </>
                )}

                {selectedStep.type === 'condition' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-1">Condition</label>
                      <select
                        value={selectedStep.config.condition || 'equals'}
                        onChange={(e) => handleUpdateStepConfig('condition', e.target.value)}
                        className="w-full px-3 py-2 border rounded"
                      >
                        <option value="equals">Equals</option>
                        <option value="notEquals">Not Equals</option>
                        <option value="contains">Contains</option>
                        <option value="greaterThan">Greater Than</option>
                        <option value="lessThan">Less Than</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Value</label>
                      <input
                        type="text"
                        value={selectedStep.config.value || ''}
                        onChange={(e) => handleUpdateStepConfig('value', e.target.value)}
                        className="w-full px-3 py-2 border rounded"
                      />
                    </div>
                  </>
                )}

                <div className="pt-4 border-t">
                  <h3 className="text-sm font-medium mb-2">Connections</h3>
                  {selectedStep.connections.length === 0 ? (
                    <p className="text-sm text-gray-500">No connections</p>
                  ) : (
                    <ul className="text-sm space-y-1">
                      {selectedStep.connections.map((connId) => {
                        const target = workflow.steps.find((s) => s.id === connId);
                        return (
                          <li key={connId} className="flex items-center justify-between">
                            <span>→ {target?.name || 'Unknown'}</span>
                            <button
                              onClick={() => {
                                setWorkflow((prev) => ({
                                  ...prev,
                                  steps: prev.steps.map((s) =>
                                    s.id === selectedStep.id
                                      ? { ...s, connections: s.connections.filter((c) => c !== connId) }
                                      : s
                                  ),
                                }));
                                setSelectedStep({
                                  ...selectedStep,
                                  connections: selectedStep.connections.filter((c) => c !== connId),
                                });
                              }}
                              className="text-red-600 hover:text-red-800"
                            >
                              ✕
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="text-gray-400 text-center mt-8">
              <p className="text-lg mb-2">No step selected</p>
              <p className="text-sm">Click on a step to edit its properties</p>
            </div>
          )}
        </div>
      </div>

      {/* Save Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Save Workflow</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Workflow Name</label>
                <input
                  type="text"
                  value={workflow.name}
                  onChange={(e) => setWorkflow({ ...workflow, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={workflow.description}
                  onChange={(e) => setWorkflow({ ...workflow, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleSaveWorkflow}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Save
              </button>
              <button
                onClick={() => setShowSaveModal(false)}
                className="px-4 py-2 border rounded hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Load Modal */}
      {showLoadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Load Workflow</h2>
            {workflows.length === 0 ? (
              <p className="text-gray-500">No saved workflows</p>
            ) : (
              <div className="space-y-2">
                {workflows.map((wf) => (
                  <div
                    key={wf.id}
                    className="border rounded p-3 hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleLoadWorkflow(wf)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{wf.name}</h3>
                        <p className="text-sm text-gray-600">{wf.description}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {wf.steps.length} steps • {wf.isActive ? 'Active' : 'Inactive'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <button
              onClick={() => setShowLoadModal(false)}
              className="mt-4 px-4 py-2 border rounded hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Test Modal */}
      {showTestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Test Results</h2>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-64">
              {testResults}
            </pre>
            <button
              onClick={() => setShowTestModal(false)}
              className="mt-4 px-4 py-2 border rounded hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
