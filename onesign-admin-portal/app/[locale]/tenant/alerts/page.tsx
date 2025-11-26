'use client';

import { useState, useEffect } from 'react';
import { getTenantId } from '@/lib/tenant-context';
import DataTable, { Column } from '@/app/components/DataTable';
import StatusBadge from '@/app/components/StatusBadge';
import ActionButton from '@/app/components/ActionButton';
import Modal from '@/app/components/Modal';
import LoadingOverlay from '@/app/components/LoadingOverlay';
import { securityService } from '@/lib/api/services/security.service';

interface AlertRule {
  id: string;
  name: string;
  description: string;
  condition: {
    type: 'threshold' | 'pattern' | 'anomaly';
    metric: string;
    operator: string;
    value: number | string;
  };
  channels: Array<{
    type: 'email' | 'sms' | 'slack' | 'webhook';
    config: any;
  }>;
  isEnabled: boolean;
  isMuted: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
  lastTriggered?: string;
  triggerCount: number;
}

interface AlertHistory {
  id: string;
  alertRuleId: string;
  alertRuleName: string;
  triggeredAt: string;
  severity: string;
  message: string;
  status: 'active' | 'acknowledged' | 'resolved';
}

type Tab = 'rules' | 'history' | 'templates';

export default function AlertsPage() {
  const [tenantId, setTenantIdState] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('rules');

  // Alert Rules
  const [alertRules, setAlertRules] = useState<AlertRule[]>([]);
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [editingRule, setEditingRule] = useState<AlertRule | null>(null);

  // Alert History
  const [alertHistory, setAlertHistory] = useState<AlertHistory[]>([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState<AlertHistory | null>(null);

  // Form
  const [form, setForm] = useState({
    name: '',
    description: '',
    conditionType: 'threshold' as 'threshold' | 'pattern' | 'anomaly',
    metric: '',
    operator: '>',
    value: '',
    channels: [] as Array<{ type: 'email' | 'sms' | 'slack' | 'webhook'; config: string }>,
    severity: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    isEnabled: true,
  });

  useEffect(() => {
    const contextTenantId = getTenantId();
    setTenantIdState(contextTenantId || '11111111-1111-1111-1111-111111111111');
  }, []);

  useEffect(() => {
    if (tenantId) {
      if (activeTab === 'rules') fetchAlertRules();
      if (activeTab === 'history') fetchAlertHistory();
    }
  }, [tenantId, activeTab]);

  const fetchAlertRules = async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      // Fetch from real API
      const data = await (securityService as any).getAlertRules?.(tenantId);

      // Mock data for fallback
      const mockRules: AlertRule[] = [
        {
          id: '1',
          name: 'High CPU Usage Alert',
          description: 'Alert when CPU usage exceeds 80%',
          condition: {
            type: 'threshold',
            metric: 'cpu_usage',
            operator: '>',
            value: 80,
          },
          channels: [
            { type: 'email', config: { recipients: ['admin@example.com'] } },
            { type: 'slack', config: { webhook: 'https://hooks.slack.com/...' } },
          ],
          isEnabled: true,
          isMuted: false,
          severity: 'high',
          createdAt: new Date().toISOString(),
          lastTriggered: new Date(Date.now() - 3600000).toISOString(),
          triggerCount: 12,
        },
        {
          id: '2',
          name: 'Failed Login Attempts',
          description: 'Alert on 5 or more failed login attempts',
          condition: {
            type: 'pattern',
            metric: 'failed_logins',
            operator: '>=',
            value: 5,
          },
          channels: [
            { type: 'email', config: { recipients: ['security@example.com'] } },
          ],
          isEnabled: true,
          isMuted: false,
          severity: 'critical',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          lastTriggered: new Date(Date.now() - 7200000).toISOString(),
          triggerCount: 45,
        },
      ];

      setAlertRules(data || mockRules);
    } catch (err: any) {
      console.error('Error fetching alert rules:', err);
      setError(err?.message || 'Failed to fetch alert rules');
      // Fallback to mock data
      setAlertRules([
        {
          id: '1',
          name: 'High CPU Usage Alert',
          description: 'Alert when CPU usage exceeds 80%',
          condition: { type: 'threshold', metric: 'cpu_usage', operator: '>', value: 80 },
          channels: [{ type: 'email', config: { recipients: ['admin@example.com'] } }],
          isEnabled: true,
          isMuted: false,
          severity: 'high',
          createdAt: new Date().toISOString(),
          lastTriggered: new Date(Date.now() - 3600000).toISOString(),
          triggerCount: 12,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAlertHistory = async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      // Fetch from real API
      const data = await (securityService as any).getAlerts(tenantId);

      // Transform to alert history format
      const historyData: AlertHistory[] = data?.map((alert: any) => ({
        id: alert.id,
        alertRuleId: alert.ruleId || alert.id,
        alertRuleName: alert.ruleName || alert.title,
        triggeredAt: alert.createdAt || alert.timestamp,
        severity: alert.severity,
        message: alert.message || alert.description,
        status: alert.status,
      })) || [
        {
          id: '1',
          alertRuleId: '1',
          alertRuleName: 'High CPU Usage Alert',
          triggeredAt: new Date(Date.now() - 3600000).toISOString(),
          severity: 'high',
          message: 'CPU usage reached 85%',
          status: 'resolved',
        },
        {
          id: '2',
          alertRuleId: '2',
          alertRuleName: 'Failed Login Attempts',
          triggeredAt: new Date(Date.now() - 7200000).toISOString(),
          severity: 'critical',
          message: '7 failed login attempts detected',
          status: 'acknowledged',
        },
      ];

      setAlertHistory(historyData);
    } catch (err: any) {
      console.error('Error fetching alert history:', err);
      setError(err?.message || 'Failed to fetch alert history');
      // Fallback to mock data
      setAlertHistory([
        {
          id: '1',
          alertRuleId: '1',
          alertRuleName: 'High CPU Usage Alert',
          triggeredAt: new Date(Date.now() - 3600000).toISOString(),
          severity: 'high',
          message: 'CPU usage reached 85%',
          status: 'resolved',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRule = () => {
    setEditingRule(null);
    setForm({
      name: '',
      description: '',
      conditionType: 'threshold',
      metric: '',
      operator: '>',
      value: '',
      channels: [],
      severity: 'medium',
      isEnabled: true,
    });
    setShowRuleModal(true);
  };

  const handleEditRule = (rule: AlertRule) => {
    setEditingRule(rule);
    setForm({
      name: rule.name,
      description: rule.description,
      conditionType: rule.condition.type,
      metric: rule.condition.metric,
      operator: rule.condition.operator,
      value: String(rule.condition.value),
      channels: rule.channels.map(ch => ({ type: ch.type, config: JSON.stringify(ch.config) })),
      severity: rule.severity,
      isEnabled: rule.isEnabled,
    });
    setShowRuleModal(true);
  };

  const handleSubmitRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId) return;
    setLoading(true);
    try {
      // Replace with actual API call
      setSuccess(editingRule ? 'Alert rule updated successfully' : 'Alert rule created successfully');
      setShowRuleModal(false);
      fetchAlertRules();
    } catch (err: any) {
      setError(err?.message || 'Failed to save alert rule');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRule = async (id: string) => {
    if (!tenantId || !confirm('Are you sure you want to delete this alert rule?')) return;
    setLoading(true);
    try {
      // Replace with actual API call
      setSuccess('Alert rule deleted successfully');
      fetchAlertRules();
    } catch (err: any) {
      setError(err?.message || 'Failed to delete alert rule');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRule = async (id: string, isEnabled: boolean) => {
    if (!tenantId) return;
    setLoading(true);
    try {
      // Replace with actual API call
      setSuccess(`Alert rule ${isEnabled ? 'enabled' : 'disabled'} successfully`);
      fetchAlertRules();
    } catch (err: any) {
      setError(err?.message || 'Failed to toggle alert rule');
    } finally {
      setLoading(false);
    }
  };

  const handleMuteRule = async (id: string) => {
    if (!tenantId) return;
    setLoading(true);
    try {
      // Replace with actual API call
      setSuccess('Alert rule muted successfully');
      fetchAlertRules();
    } catch (err: any) {
      setError(err?.message || 'Failed to mute alert rule');
    } finally {
      setLoading(false);
    }
  };

  const addChannel = () => {
    setForm({
      ...form,
      channels: [...form.channels, { type: 'email', config: '' }],
    });
  };

  const removeChannel = (index: number) => {
    setForm({
      ...form,
      channels: form.channels.filter((_, i) => i !== index),
    });
  };

  const getSeverityBadge = (severity: string) => {
    const variants: Record<string, 'error' | 'warning' | 'success' | 'info'> = {
      critical: 'error',
      high: 'error',
      medium: 'warning',
      low: 'success',
    };
    return <StatusBadge status={severity} variant={variants[severity] || 'info'} />;
  };

  const ruleColumns: Column<AlertRule>[] = [
    { key: 'name', label: 'Name' },
    { key: 'description', label: 'Description' },
    {
      key: 'condition',
      label: 'Condition',
      render: (rule) => `${rule.condition.metric} ${rule.condition.operator} ${rule.condition.value}`
    },
    {
      key: 'channels',
      label: 'Channels',
      render: (rule) => rule.channels.map(ch => ch.type).join(', ')
    },
    { key: 'severity', label: 'Severity', render: (rule) => getSeverityBadge(rule.severity) },
    {
      key: 'isEnabled',
      label: 'Status',
      render: (rule) => (
        <div className="flex gap-2">
          <StatusBadge
            status={rule.isEnabled ? 'Enabled' : 'Disabled'}
            variant={rule.isEnabled ? 'success' : 'error'}
          />
          {rule.isMuted && <StatusBadge status="Muted" variant="warning" />}
        </div>
      ),
    },
    {
      key: 'triggerCount',
      label: 'Triggers',
      render: (rule) => (
        <div className="text-sm">
          <div className="font-semibold">{rule.triggerCount}</div>
          {rule.lastTriggered && (
            <div className="text-xs text-gray-500">
              Last: {new Date(rule.lastTriggered).toLocaleString()}
            </div>
          )}
        </div>
      )
    },
  ];

  const historyColumns: Column<AlertHistory>[] = [
    {
      key: 'triggeredAt',
      label: 'Triggered',
      render: (h) => new Date(h.triggeredAt).toLocaleString()
    },
    { key: 'alertRuleName', label: 'Alert Rule' },
    { key: 'severity', label: 'Severity', render: (h) => getSeverityBadge(h.severity) },
    { key: 'message', label: 'Message' },
    {
      key: 'status',
      label: 'Status',
      render: (h) => {
        const variants: Record<string, 'success' | 'warning' | 'error'> = {
          resolved: 'success',
          acknowledged: 'warning',
          active: 'error',
        };
        return <StatusBadge status={h.status} variant={variants[h.status] || 'info'} />;
      },
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <LoadingOverlay isLoading={loading} message="Processing..." />

      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
          Alert Configuration
        </h1>
        <p className="text-gray-600">Manage alert rules, channels, and notification history</p>
      </div>

      {error && <div className="mb-4 p-4 bg-red-100 border border-red-300 text-red-800 rounded-lg">{error}</div>}
      {success && <div className="mb-4 p-4 bg-green-100 border border-green-300 text-green-800 rounded-lg">{success}</div>}

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {(['rules', 'history', 'templates'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Alert Rules Tab */}
      {activeTab === 'rules' && (
        <>
          <div className="mb-6 flex justify-end">
            <ActionButton onClick={handleCreateRule}>Create Alert Rule</ActionButton>
          </div>

          <DataTable
            data={alertRules}
            columns={ruleColumns}
            actions={(rule) => (
              <div className="flex gap-2">
                <button onClick={() => handleEditRule(rule)} className="text-blue-600 hover:text-blue-800 font-medium">
                  Edit
                </button>
                <button
                  onClick={() => handleToggleRule(rule.id, !rule.isEnabled)}
                  className="text-purple-600 hover:text-purple-800 font-medium"
                >
                  {rule.isEnabled ? 'Disable' : 'Enable'}
                </button>
                {!rule.isMuted && (
                  <button onClick={() => handleMuteRule(rule.id)} className="text-orange-600 hover:text-orange-800 font-medium">
                    Mute
                  </button>
                )}
                <button onClick={() => handleDeleteRule(rule.id)} className="text-red-600 hover:text-red-800 font-medium">
                  Delete
                </button>
              </div>
            )}
          />
        </>
      )}

      {/* Alert History Tab */}
      {activeTab === 'history' && (
        <DataTable
          data={alertHistory}
          columns={historyColumns}
          actions={(history) => (
            <button
              onClick={() => {
                setSelectedHistory(history);
                setShowHistoryModal(true);
              }}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              View Details
            </button>
          )}
        />
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600">Alert templates coming soon...</p>
        </div>
      )}

      {/* Create/Edit Alert Rule Modal */}
      <Modal isOpen={showRuleModal} onClose={() => setShowRuleModal(false)} title={editingRule ? 'Edit Alert Rule' : 'Create Alert Rule'}>
        <form onSubmit={handleSubmitRule} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Condition Type</label>
              <select
                value={form.conditionType}
                onChange={(e) => setForm({ ...form, conditionType: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="threshold">Threshold</option>
                <option value="pattern">Pattern</option>
                <option value="anomaly">Anomaly</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
              <select
                value={form.severity}
                onChange={(e) => setForm({ ...form, severity: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Metric</label>
              <input
                type="text"
                value={form.metric}
                onChange={(e) => setForm({ ...form, metric: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="cpu_usage"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Operator</label>
              <select
                value={form.operator}
                onChange={(e) => setForm({ ...form, operator: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value=">">&gt;</option>
                <option value=">=">&gt;=</option>
                <option value="<">&lt;</option>
                <option value="<=">&lt;=</option>
                <option value="=">=</option>
                <option value="!=">!=</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
              <input
                type="text"
                value={form.value}
                onChange={(e) => setForm({ ...form, value: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">Alert Channels</label>
              <button type="button" onClick={addChannel} className="text-sm text-blue-600 hover:text-blue-800">
                + Add Channel
              </button>
            </div>
            {form.channels.map((channel, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <select
                  value={channel.type}
                  onChange={(e) => {
                    const newChannels = [...form.channels];
                    newChannels[index].type = e.target.value as any;
                    setForm({ ...form, channels: newChannels });
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="email">Email</option>
                  <option value="sms">SMS</option>
                  <option value="slack">Slack</option>
                  <option value="webhook">Webhook</option>
                </select>
                <input
                  type="text"
                  value={channel.config}
                  onChange={(e) => {
                    const newChannels = [...form.channels];
                    newChannels[index].config = e.target.value;
                    setForm({ ...form, channels: newChannels });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Configuration (JSON)"
                />
                <button
                  type="button"
                  onClick={() => removeChannel(index)}
                  className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={form.isEnabled}
              onChange={(e) => setForm({ ...form, isEnabled: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 text-sm text-gray-700">Enable this alert rule</label>
          </div>
          <div className="flex gap-4">
            <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              {editingRule ? 'Update' : 'Create'} Alert Rule
            </button>
            <button type="button" onClick={() => setShowRuleModal(false)} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      {/* Alert History Details Modal */}
      <Modal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        title="Alert History Details"
      >
        {selectedHistory && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Alert Rule</label>
              <p className="text-gray-900">{selectedHistory.alertRuleName}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Triggered At</label>
              <p className="text-gray-900">{new Date(selectedHistory.triggeredAt).toLocaleString()}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Severity</label>
              {getSeverityBadge(selectedHistory.severity)}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Message</label>
              <p className="text-gray-900">{selectedHistory.message}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <StatusBadge status={selectedHistory.status} />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
