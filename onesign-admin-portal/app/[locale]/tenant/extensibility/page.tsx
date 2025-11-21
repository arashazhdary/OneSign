'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { getTenantId } from '@/lib/tenant-context';
import DataTable, { Column } from '@/app/components/DataTable';
import StatusBadge from '@/app/components/StatusBadge';
import ActionButton from '@/app/components/ActionButton';
import Modal from '@/app/components/Modal';
import SearchBar from '@/app/components/SearchBar';
import LoadingOverlay from '@/app/components/LoadingOverlay';

interface Webhook {
  id: string;
  url: string;
  eventTypes: string[];
  isEnabled: boolean;
  secret: string;
  createdAt: string;
}

interface LoginHook {
  id: string;
  name: string;
  hookType: 'PreLogin' | 'PostLogin';
  scriptUrl: string;
  isEnabled: boolean;
  timeout: number;
}

interface TokenRule {
  id: string;
  name: string;
  ruleType: string;
  conditions: string;
  claims: Record<string, any>;
  isEnabled: boolean;
}

interface EventType {
  name: string;
  category: string;
  description: string;
}

export default function ExtensibilityPage() {
  const t = useTranslations();
  const [activeTab, setActiveTab] = useState<'webhooks' | 'login-hooks' | 'token-rules' | 'events'>('webhooks');
  const [tenantId, setTenantIdState] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Webhooks
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [showWebhookModal, setShowWebhookModal] = useState(false);
  const [editingWebhook, setEditingWebhook] = useState<Webhook | null>(null);
  const [webhookForm, setWebhookForm] = useState({
    url: '',
    eventTypes: [] as string[],
    isEnabled: true
  });

  // Login Hooks
  const [loginHooks, setLoginHooks] = useState<LoginHook[]>([]);
  const [showLoginHookModal, setShowLoginHookModal] = useState(false);
  const [editingLoginHook, setEditingLoginHook] = useState<LoginHook | null>(null);
  const [loginHookForm, setLoginHookForm] = useState({
    name: '',
    hookType: 'PostLogin' as 'PreLogin' | 'PostLogin',
    scriptUrl: '',
    isEnabled: true,
    timeout: 5000
  });

  // Token Rules
  const [tokenRules, setTokenRules] = useState<TokenRule[]>([]);
  const [showTokenRuleModal, setShowTokenRuleModal] = useState(false);
  const [editingTokenRule, setEditingTokenRule] = useState<TokenRule | null>(null);
  const [tokenRuleForm, setTokenRuleForm] = useState({
    name: '',
    ruleType: 'AddClaim',
    conditions: '',
    claims: {},
    isEnabled: true
  });

  // Event Types
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);

  useEffect(() => {
    const contextTenantId = getTenantId();
    setTenantIdState(contextTenantId || '00000000-0000-0000-0000-000000000000');
  }, []);

  useEffect(() => {
    if (tenantId) {
      if (activeTab === 'webhooks') fetchWebhooks();
      else if (activeTab === 'login-hooks') fetchLoginHooks();
      else if (activeTab === 'token-rules') fetchTokenRules();
      else if (activeTab === 'events') fetchEventTypes();
    }
  }, [tenantId, activeTab]);

  const fetchWebhooks = async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:7000/api/tenant/extensibility/webhooks?tenantId=${tenantId}`);
      if (response.ok) {
        const data = await response.json();
        setWebhooks(data || []);
      }
    } catch (err) {
      console.error('Error fetching webhooks:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLoginHooks = async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:7000/api/tenant/extensibility/login-hooks?tenantId=${tenantId}`);
      if (response.ok) {
        const data = await response.json();
        setLoginHooks(data || []);
      }
    } catch (err) {
      console.error('Error fetching login hooks:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTokenRules = async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:7000/api/tenant/extensibility/token-rules?tenantId=${tenantId}`);
      if (response.ok) {
        const data = await response.json();
        setTokenRules(data || []);
      }
    } catch (err) {
      console.error('Error fetching token rules:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEventTypes = async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:7000/api/tenant/extensibility/event-types?tenantId=${tenantId}`);
      if (response.ok) {
        const data = await response.json();
        setEventTypes(data || []);
      }
    } catch (err) {
      console.error('Error fetching event types:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId) return;
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:7000/api/tenant/extensibility/webhooks?tenantId=${tenantId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(webhookForm)
      });
      if (response.ok) {
        setSuccess('Webhook created successfully');
        setShowWebhookModal(false);
        fetchWebhooks();
        setWebhookForm({ url: '', eventTypes: [], isEnabled: true });
      }
    } catch (err) {
      setError('Failed to create webhook');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateWebhook = async (id: string, data: Partial<Webhook>) => {
    if (!tenantId) return;
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:7000/api/tenant/extensibility/webhooks/${id}?tenantId=${tenantId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (response.ok) {
        setSuccess('Webhook updated successfully');
        setEditingWebhook(null);
        setShowWebhookModal(false);
        fetchWebhooks();
      }
    } catch (err) {
      setError('Failed to update webhook');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWebhook = async (id: string) => {
    if (!tenantId || !confirm('Are you sure you want to delete this webhook?')) return;
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:7000/api/tenant/extensibility/webhooks/${id}?tenantId=${tenantId}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        setSuccess('Webhook deleted successfully');
        fetchWebhooks();
      }
    } catch (err) {
      setError('Failed to delete webhook');
    } finally {
      setLoading(false);
    }
  };

  const handleTestWebhook = async (id: string) => {
    if (!tenantId) return;
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:7000/api/tenant/extensibility/webhooks/${id}/test?tenantId=${tenantId}`, {
        method: 'POST'
      });
      if (response.ok) {
        setSuccess('Test event sent successfully');
      }
    } catch (err) {
      setError('Failed to send test event');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLoginHook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId) return;
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:7000/api/tenant/extensibility/login-hooks?tenantId=${tenantId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginHookForm)
      });
      if (response.ok) {
        setSuccess('Login hook created successfully');
        setShowLoginHookModal(false);
        fetchLoginHooks();
      }
    } catch (err) {
      setError('Failed to create login hook');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateLoginHook = async (id: string, data: Partial<LoginHook>) => {
    if (!tenantId) return;
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:7000/api/tenant/extensibility/login-hooks/${id}?tenantId=${tenantId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (response.ok) {
        setSuccess('Login hook updated successfully');
        setEditingLoginHook(null);
        setShowLoginHookModal(false);
        fetchLoginHooks();
      }
    } catch (err) {
      setError('Failed to update login hook');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLoginHook = async (id: string) => {
    if (!tenantId || !confirm('Are you sure you want to delete this login hook?')) return;
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:7000/api/tenant/extensibility/login-hooks/${id}?tenantId=${tenantId}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        setSuccess('Login hook deleted successfully');
        fetchLoginHooks();
      }
    } catch (err) {
      setError('Failed to delete login hook');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTokenRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId) return;
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:7000/api/tenant/extensibility/token-rules?tenantId=${tenantId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tokenRuleForm)
      });
      if (response.ok) {
        setSuccess('Token rule created successfully');
        setShowTokenRuleModal(false);
        fetchTokenRules();
      }
    } catch (err) {
      setError('Failed to create token rule');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTokenRule = async (id: string, data: Partial<TokenRule>) => {
    if (!tenantId) return;
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:7000/api/tenant/extensibility/token-rules/${id}?tenantId=${tenantId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (response.ok) {
        setSuccess('Token rule updated successfully');
        setEditingTokenRule(null);
        setShowTokenRuleModal(false);
        fetchTokenRules();
      }
    } catch (err) {
      setError('Failed to update token rule');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTokenRule = async (id: string) => {
    if (!tenantId || !confirm('Are you sure you want to delete this token rule?')) return;
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:7000/api/tenant/extensibility/token-rules/${id}?tenantId=${tenantId}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        setSuccess('Token rule deleted successfully');
        fetchTokenRules();
      }
    } catch (err) {
      setError('Failed to delete token rule');
    } finally {
      setLoading(false);
    }
  };

  const webhookColumns: Column<Webhook>[] = [
    { key: 'url', label: 'URL' },
    {
      key: 'eventTypes',
      label: 'Event Types',
      render: (wh) => <span>{wh.eventTypes.join(', ')}</span>
    },
    {
      key: 'isEnabled',
      label: 'Status',
      render: (wh) => <StatusBadge status={wh.isEnabled ? 'Enabled' : 'Disabled'} />
    },
    { key: 'createdAt', label: 'Created', render: (wh) => new Date(wh.createdAt).toLocaleDateString() }
  ];

  const loginHookColumns: Column<LoginHook>[] = [
    { key: 'name', label: 'Name' },
    { key: 'hookType', label: 'Type' },
    { key: 'scriptUrl', label: 'Script URL' },
    { key: 'timeout', label: 'Timeout (ms)' },
    {
      key: 'isEnabled',
      label: 'Status',
      render: (hook) => <StatusBadge status={hook.isEnabled ? 'Enabled' : 'Disabled'} />
    }
  ];

  const tokenRuleColumns: Column<TokenRule>[] = [
    { key: 'name', label: 'Name' },
    { key: 'ruleType', label: 'Type' },
    {
      key: 'isEnabled',
      label: 'Status',
      render: (rule) => <StatusBadge status={rule.isEnabled ? 'Enabled' : 'Disabled'} />
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 p-6">
      <LoadingOverlay isLoading={loading} message="Processing..." />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
          Extensibility Hub
        </h1>
        <p className="text-gray-600">Manage webhooks, login hooks, and token enrichment rules</p>
      </div>

      {/* Alerts */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-300 text-red-800 rounded-lg">{error}</div>
      )}
      {success && (
        <div className="mb-4 p-4 bg-green-100 border border-green-300 text-green-800 rounded-lg">{success}</div>
      )}

      {/* Tabs */}
      <div className="mb-6 flex space-x-2 border-b border-gray-300">
        {['webhooks', 'login-hooks', 'token-rules', 'events'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === tab
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            {tab.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'webhooks' && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <ActionButton onClick={() => setShowWebhookModal(true)}>Create Webhook</ActionButton>
          </div>
          <DataTable
            data={webhooks}
            columns={webhookColumns}
            actions={(wh) => (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditingWebhook(wh);
                    setWebhookForm({ url: wh.url, eventTypes: wh.eventTypes, isEnabled: wh.isEnabled });
                    setShowWebhookModal(true);
                  }}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Edit
                </button>
                <button onClick={() => handleTestWebhook(wh.id)} className="text-green-600 hover:text-green-800 font-medium">
                  Test
                </button>
                <button onClick={() => handleDeleteWebhook(wh.id)} className="text-red-600 hover:text-red-800 font-medium">
                  Delete
                </button>
              </div>
            )}
          />
        </div>
      )}

      {activeTab === 'login-hooks' && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <ActionButton onClick={() => setShowLoginHookModal(true)}>Create Login Hook</ActionButton>
          </div>
          <DataTable
            data={loginHooks}
            columns={loginHookColumns}
            actions={(hook) => (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditingLoginHook(hook);
                    setLoginHookForm({
                      name: hook.name,
                      hookType: hook.hookType,
                      scriptUrl: hook.scriptUrl,
                      isEnabled: hook.isEnabled,
                      timeout: hook.timeout
                    });
                    setShowLoginHookModal(true);
                  }}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Edit
                </button>
                <button onClick={() => handleDeleteLoginHook(hook.id)} className="text-red-600 hover:text-red-800 font-medium">
                  Delete
                </button>
              </div>
            )}
          />
        </div>
      )}

      {activeTab === 'token-rules' && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <ActionButton onClick={() => setShowTokenRuleModal(true)}>Create Token Rule</ActionButton>
          </div>
          <DataTable
            data={tokenRules}
            columns={tokenRuleColumns}
            actions={(rule) => (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditingTokenRule(rule);
                    setTokenRuleForm({
                      name: rule.name,
                      ruleType: rule.ruleType,
                      conditions: rule.conditions,
                      claims: rule.claims,
                      isEnabled: rule.isEnabled
                    });
                    setShowTokenRuleModal(true);
                  }}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Edit
                </button>
                <button onClick={() => handleDeleteTokenRule(rule.id)} className="text-red-600 hover:text-red-800 font-medium">
                  Delete
                </button>
              </div>
            )}
          />
        </div>
      )}

      {activeTab === 'events' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Available Event Types</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {eventTypes.map((event) => (
              <div key={event.name} className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-600">{event.name}</h4>
                <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                <span className="inline-block mt-2 px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                  {event.category}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Webhook Modal */}
      <Modal isOpen={showWebhookModal} onClose={() => setShowWebhookModal(false)} title="Create Webhook">
        <form onSubmit={handleCreateWebhook} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Webhook URL</label>
            <input
              type="url"
              value={webhookForm.url}
              onChange={(e) => setWebhookForm({ ...webhookForm, url: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="flex gap-4">
            <ActionButton type="submit" fullWidth>Create</ActionButton>
            <ActionButton type="button" variant="secondary" fullWidth onClick={() => setShowWebhookModal(false)}>
              Cancel
            </ActionButton>
          </div>
        </form>
      </Modal>
    </div>
  );
}
