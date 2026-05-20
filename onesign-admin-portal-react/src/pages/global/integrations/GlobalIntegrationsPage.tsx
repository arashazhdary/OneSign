import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { globalService } from '@/lib/api/services/global.service';
import { Helmet } from 'react-helmet-async';

interface Integration {
  id: string;
  name: string;
  provider: string;
  type: 'payment' | 'email' | 'sms' | 'analytics' | 'auth' | 'storage' | 'monitoring';
  status: 'active' | 'inactive' | 'error' | 'configuring';
  isEnabled: boolean;
  config: Record<string, any>;
  credentials: {
    type: string;
    lastUpdated: string;
  };
  usage: {
    requests: number;
    errors: number;
    lastUsed: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface WebhookEndpoint {
  id: string;
  url: string;
  events: string[];
  secret: string;
  isActive: boolean;
  lastDelivery?: string;
  successRate: number;
}

export default function GlobalIntegrationsPage() {
  const { t } = useTranslation();
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [webhooks, setWebhooks] = useState<WebhookEndpoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'integrations' | 'webhooks' | 'oauth'>('integrations');
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const data = await globalService.getGlobalIntegrations();
      const list = Array.isArray(data) ? data : (data as any)?.integrations;
      setIntegrations(Array.isArray(list) ? list : []);
      const webhooks = await globalService.getGlobalWebhooks();
      setWebhooks(
        Array.isArray(webhooks)
          ? webhooks.map((w: any) => ({
              id: w.id,
              url: w.url,
              events: w.events ?? [],
              secret: w.secret ?? '',
              isActive: w.isActive ?? true,
              lastDelivery: w.stats?.lastDelivery,
              successRate: w.stats?.successfulDeliveries && w.stats?.totalDeliveries
                ? (w.stats.successfulDeliveries / w.stats.totalDeliveries) * 100
                : 0,
            }))
          : []
      );
    } catch (err) {
      console.error(err);
      setIntegrations([]);
      setWebhooks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleIntegration = async (integrationId: string) => {
    try {
      await globalService.toggleGlobalIntegration(integrationId);
      fetchData();
    } catch (error) {
      console.error('Failed to toggle integration:', error);
    }
  };

  const handleTestIntegration = async (integrationId: string) => {
    try {
      await globalService.testGlobalIntegration(integrationId);
      alert(t('integrations.testSuccessful'));
    } catch (error) {
      console.error('Failed to test integration:', error);
      alert(t('integrations.testFailed'));
    }
  };

  const handleDeleteIntegration = async (integrationId: string) => {
    if (!confirm(t('integrations.confirmRemove'))) return;
    try {
      await globalService.deleteGlobalIntegration(integrationId);
      fetchData();
    } catch (error) {
      console.error('Failed to delete integration:', error);
    }
  };

  const getTypeBadge = (type: string) => {
    const colors = {
      payment: 'bg-green-100 text-green-800',
      email: 'bg-blue-100 text-blue-800',
      sms: 'bg-purple-100 text-purple-800',
      analytics: 'bg-yellow-100 text-yellow-800',
      auth: 'bg-red-100 text-red-800',
      storage: 'bg-indigo-100 text-indigo-800',
      monitoring: 'bg-pink-100 text-pink-800',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100';
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      error: 'bg-red-100 text-red-800',
      configuring: 'bg-yellow-100 text-yellow-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100';
  };

  if (loading) return <div className="p-6">{t('common.loading')}...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Platform Integrations</h1>
          <p className="text-gray-600 mt-1">Manage third-party integrations and webhooks</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Add Integration
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Active Integrations</div>
          <div className="text-2xl font-bold">
            {integrations.filter(i => i.isEnabled).length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Total API Calls</div>
          <div className="text-2xl font-bold">
            {(integrations.reduce((acc, i) => acc + i.usage.requests, 0) / 1000000).toFixed(1)}M
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Error Rate</div>
          <div className="text-2xl font-bold">
            {((integrations.reduce((acc, i) => acc + i.usage.errors, 0) /
               integrations.reduce((acc, i) => acc + i.usage.requests, 0)) * 100).toFixed(2)}%
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Active Webhooks</div>
          <div className="text-2xl font-bold">
            {webhooks.filter(w => w.isActive).length}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab('integrations')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'integrations'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Integrations ({integrations.length})
          </button>
          <button
            onClick={() => setActiveTab('webhooks')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'webhooks'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Webhooks ({webhooks.length})
          </button>
          <button
            onClick={() => setActiveTab('oauth')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'oauth'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            OAuth Apps
          </button>
        </div>
      </div>

      {/* Integrations Tab */}
      {activeTab === 'integrations' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {integrations.map((integration) => (
            <div key={integration.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold">{integration.name}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${getTypeBadge(integration.type)}`}>
                      {integration.type}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(integration.status)}`}>
                      {integration.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">Provider: {integration.provider}</p>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={integration.isEnabled}
                    onChange={() => handleToggleIntegration(integration.id)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {/* Usage Stats */}
              <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                <div>
                  <span className="text-gray-500">Requests:</span>
                  <div className="font-semibold">{integration.usage.requests.toLocaleString()}</div>
                </div>
                <div>
                  <span className="text-gray-500">Errors:</span>
                  <div className="font-semibold">{integration.usage.errors.toLocaleString()}</div>
                </div>
                <div>
                  <span className="text-gray-500">Success Rate:</span>
                  <div className="font-semibold">
                    {((1 - integration.usage.errors / integration.usage.requests) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>

              {/* Config */}
              <div className="mb-4 text-sm">
                <div className="text-gray-500 mb-2">Configuration:</div>
                <div className="bg-gray-50 rounded p-3 space-y-1">
                  {Object.entries(integration.config).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-gray-600">{key}:</span>
                      <span className="font-mono text-xs">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Credentials Info */}
              <div className="text-xs text-gray-500 mb-4">
                Credentials: {integration.credentials.type} (Updated: {new Date(integration.credentials.lastUpdated).toLocaleDateString()})
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                <button
                  onClick={() => handleTestIntegration(integration.id)}
                  className="flex-1 px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
                >
                  Test
                </button>
                <button className="flex-1 px-3 py-1 text-sm border border-blue-300 text-blue-600 rounded hover:bg-blue-50">
                  Configure
                </button>
                <button
                  onClick={() => handleDeleteIntegration(integration.id)}
                  className="px-3 py-1 text-sm text-red-600 border border-red-300 rounded hover:bg-red-50"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Webhooks Tab */}
      {activeTab === 'webhooks' && (
        <div className="space-y-4">
          {webhooks.map((webhook) => (
            <div key={webhook.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold font-mono">{webhook.url}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${webhook.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {webhook.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <div className="mt-3">
                    <span className="text-sm text-gray-500">Events:</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {webhook.events.map((event, idx) => (
                        <span key={idx} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                          {event}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-3 text-sm">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-gray-500">Success Rate:</span>
                        <span className="ml-2 font-semibold">{webhook.successRate}%</span>
                      </div>
                      {webhook.lastDelivery && (
                        <div>
                          <span className="text-gray-500">Last Delivery:</span>
                          <span className="ml-2">{new Date(webhook.lastDelivery).toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2 ml-4">
                  <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
                    Test
                  </button>
                  <button className="px-3 py-1 text-sm text-red-600 border border-red-300 rounded hover:bg-red-50">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* OAuth Apps Tab */}
      {activeTab === 'oauth' && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center py-12 text-gray-500">
            <div className="text-6xl mb-4">🔐</div>
            <h3 className="text-lg font-semibold mb-2">OAuth Applications</h3>
            <p>Manage OAuth 2.0 applications and client credentials</p>
            <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Create OAuth App
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
