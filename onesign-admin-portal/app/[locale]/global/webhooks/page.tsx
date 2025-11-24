'use client';

import { useState, useEffect } from 'react';
import { platformService } from '@/lib/api/services';

interface GlobalWebhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  secret: string;
  isActive: boolean;
  retryStrategy: 'exponential' | 'linear' | 'none';
  maxRetries: number;
  timeout: number;
  headers: Record<string, string>;
  createdAt: string;
  updatedAt: string;
  stats: {
    totalDeliveries: number;
    successfulDeliveries: number;
    failedDeliveries: number;
    lastDelivery?: string;
    avgResponseTime: number;
  };
}

interface WebhookLog {
  id: string;
  webhookId: string;
  event: string;
  url: string;
  statusCode: number;
  responseTime: number;
  attempt: number;
  success: boolean;
  error?: string;
  timestamp: string;
}

export default function GlobalWebhooksPage() {
  const [webhooks, setWebhooks] = useState<GlobalWebhook[]>([]);
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'webhooks' | 'logs' | 'templates'>('webhooks');
  const [showCreate, setShowCreate] = useState(false);
  const [selectedWebhook, setSelectedWebhook] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const data = await platformService.getGlobalWebhooks?.();
      const mockWebhooks: GlobalWebhook[] = [
        {
          id: '1',
          name: 'Global User Events',
          url: 'https://analytics.company.com/webhooks/users',
          events: ['user.created', 'user.updated', 'user.deleted'],
          secret: 'whsec_abc123def456',
          isActive: true,
          retryStrategy: 'exponential',
          maxRetries: 3,
          timeout: 5000,
          headers: {
            'X-Custom-Header': 'value',
          },
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-11-20T14:00:00Z',
          stats: {
            totalDeliveries: 125678,
            successfulDeliveries: 124234,
            failedDeliveries: 1444,
            lastDelivery: '2024-11-23T10:00:00Z',
            avgResponseTime: 245,
          },
        },
        {
          id: '2',
          name: 'Platform Alerts',
          url: 'https://ops.company.com/alerts',
          events: ['alert.triggered', 'alert.resolved', 'system.error'],
          secret: 'whsec_xyz789ghi012',
          isActive: true,
          retryStrategy: 'exponential',
          maxRetries: 5,
          timeout: 10000,
          headers: {},
          createdAt: '2024-02-01T09:00:00Z',
          updatedAt: '2024-10-15T16:00:00Z',
          stats: {
            totalDeliveries: 8542,
            successfulDeliveries: 8498,
            failedDeliveries: 44,
            lastDelivery: '2024-11-23T09:45:00Z',
            avgResponseTime: 512,
          },
        },
        {
          id: '3',
          name: 'Billing Events',
          url: 'https://billing.company.com/webhooks',
          events: ['payment.succeeded', 'payment.failed', 'subscription.created', 'subscription.cancelled'],
          secret: 'whsec_mno345pqr678',
          isActive: true,
          retryStrategy: 'linear',
          maxRetries: 10,
          timeout: 8000,
          headers: {
            'Authorization': 'Bearer token_***',
          },
          createdAt: '2024-03-10T14:00:00Z',
          updatedAt: '2024-11-18T10:00:00Z',
          stats: {
            totalDeliveries: 45678,
            successfulDeliveries: 45234,
            failedDeliveries: 444,
            lastDelivery: '2024-11-23T08:30:00Z',
            avgResponseTime: 178,
          },
        },
      ];
      setWebhooks(data || mockWebhooks);

      // Mock logs
      setLogs([
        {
          id: '1',
          webhookId: '1',
          event: 'user.created',
          url: 'https://analytics.company.com/webhooks/users',
          statusCode: 200,
          responseTime: 245,
          attempt: 1,
          success: true,
          timestamp: '2024-11-23T10:00:00Z',
        },
        {
          id: '2',
          webhookId: '2',
          event: 'alert.triggered',
          url: 'https://ops.company.com/alerts',
          statusCode: 200,
          responseTime: 512,
          attempt: 1,
          success: true,
          timestamp: '2024-11-23T09:45:00Z',
        },
        {
          id: '3',
          webhookId: '3',
          event: 'payment.succeeded',
          url: 'https://billing.company.com/webhooks',
          statusCode: 500,
          responseTime: 5000,
          attempt: 1,
          success: false,
          error: 'Internal Server Error',
          timestamp: '2024-11-23T09:30:00Z',
        },
        {
          id: '4',
          webhookId: '3',
          event: 'payment.succeeded',
          url: 'https://billing.company.com/webhooks',
          statusCode: 200,
          responseTime: 178,
          attempt: 2,
          success: true,
          timestamp: '2024-11-23T09:32:00Z',
        },
      ]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      await platformService.createGlobalWebhook?.({
        name: 'New Webhook',
        url: 'https://example.com/webhook',
        events: [],
        secret: '',
        isActive: true,
        retryStrategy: 'exponential',
        maxRetries: 3,
        timeout: 5000,
      });
      setShowCreate(false);
      fetchData();
    } catch (error) {
      console.error('Failed to create global webhook:', error);
    }
  };

  const handleToggle = async (webhookId: string) => {
    try {
      await platformService.toggleGlobalWebhook?.(webhookId);
      fetchData();
    } catch (error) {
      console.error('Failed to toggle global webhook:', error);
    }
  };

  const handleTest = async (webhookId: string) => {
    try {
      await platformService.testGlobalWebhook?.(webhookId);
    } catch (error) {
      console.error('Failed to test global webhook:', error);
    }
  };

  const handleDelete = async (webhookId: string) => {
    if (!confirm('Delete this webhook?')) return;
    try {
      await platformService.deleteGlobalWebhook?.(webhookId);
      fetchData();
    } catch (error) {
      console.error('Failed to delete global webhook:', error);
    }
  };

  const getSuccessRate = (stats: GlobalWebhook['stats']) => {
    return ((stats.successfulDeliveries / stats.totalDeliveries) * 100).toFixed(1);
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Global Platform Webhooks</h1>
          <p className="text-gray-600 mt-1">Configure platform-wide webhook endpoints</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Create Webhook
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Active Webhooks</div>
          <div className="text-2xl font-bold">
            {webhooks.filter(w => w.isActive).length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Total Deliveries</div>
          <div className="text-2xl font-bold">
            {(webhooks.reduce((acc, w) => acc + w.stats.totalDeliveries, 0) / 1000).toFixed(0)}K
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Success Rate</div>
          <div className="text-2xl font-bold text-green-600">
            {((webhooks.reduce((acc, w) => acc + w.stats.successfulDeliveries, 0) /
               webhooks.reduce((acc, w) => acc + w.stats.totalDeliveries, 0)) * 100).toFixed(1)}%
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Avg Response Time</div>
          <div className="text-2xl font-bold">
            {Math.round(webhooks.reduce((acc, w) => acc + w.stats.avgResponseTime, 0) / webhooks.length)}ms
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex space-x-8">
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
            onClick={() => setActiveTab('logs')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'logs'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Delivery Logs ({logs.length})
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'templates'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Webhook Templates
          </button>
        </div>
      </div>

      {/* Webhooks Tab */}
      {activeTab === 'webhooks' && (
        <div className="space-y-4">
          {webhooks.map((webhook) => (
            <div key={webhook.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold">{webhook.name}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      webhook.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {webhook.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <div className="font-mono text-sm text-gray-600 mb-3">{webhook.url}</div>

                  {/* Events */}
                  <div className="mb-3">
                    <span className="text-sm text-gray-500">Events:</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {webhook.events.map((event, idx) => (
                        <span key={idx} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                          {event}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Total Deliveries:</span>
                      <span className="ml-2 font-semibold">{webhook.stats.totalDeliveries.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Success Rate:</span>
                      <span className="ml-2 font-semibold text-green-600">{getSuccessRate(webhook.stats)}%</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Avg Response:</span>
                      <span className="ml-2 font-semibold">{webhook.stats.avgResponseTime}ms</span>
                    </div>
                    {webhook.stats.lastDelivery && (
                      <div>
                        <span className="text-gray-500">Last Delivery:</span>
                        <span className="ml-2">{new Date(webhook.stats.lastDelivery).toLocaleString()}</span>
                      </div>
                    )}
                  </div>

                  {/* Configuration */}
                  <div className="mt-3 text-xs text-gray-500">
                    Retry: {webhook.retryStrategy} (max {webhook.maxRetries}) | Timeout: {webhook.timeout}ms
                  </div>
                </div>

                <div className="flex items-center space-x-3 ml-4">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={webhook.isActive}
                      onChange={() => handleToggle(webhook.id)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                  <button
                    onClick={() => handleTest(webhook.id)}
                    className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
                  >
                    Test
                  </button>
                  <button
                    onClick={() => handleDelete(webhook.id)}
                    className="px-3 py-1 text-sm text-red-600 border border-red-300 rounded hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Logs Tab */}
      {activeTab === 'logs' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Event</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">URL</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Response Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Attempt</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm">{log.event}</td>
                  <td className="px-6 py-4 text-sm font-mono">{new URL(log.url).hostname}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      log.statusCode >= 200 && log.statusCode < 300
                        ? 'bg-green-100 text-green-800'
                        : log.statusCode >= 500
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {log.statusCode}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">{log.responseTime}ms</td>
                  <td className="px-6 py-4 text-sm">{log.attempt}</td>
                  <td className="px-6 py-4 text-sm">
                    {log.success ? (
                      <span className="text-green-600">✓ Success</span>
                    ) : (
                      <span className="text-red-600">✗ {log.error}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center py-12 text-gray-500">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-lg font-semibold mb-2">Webhook Templates</h3>
            <p>Pre-configured webhook templates for common use cases</p>
            <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Browse Templates
            </button>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Create Global Webhook</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <input
                  type="text"
                  placeholder="e.g., User Events Webhook"
                  className="w-full border border-gray-300 rounded-lg p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Endpoint URL</label>
                <input
                  type="url"
                  placeholder="https://your-domain.com/webhooks/endpoint"
                  className="w-full border border-gray-300 rounded-lg p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Events</label>
                <div className="grid grid-cols-2 gap-2">
                  <label className="flex items-center"><input type="checkbox" className="mr-2" />user.created</label>
                  <label className="flex items-center"><input type="checkbox" className="mr-2" />user.updated</label>
                  <label className="flex items-center"><input type="checkbox" className="mr-2" />tenant.created</label>
                  <label className="flex items-center"><input type="checkbox" className="mr-2" />alert.triggered</label>
                  <label className="flex items-center"><input type="checkbox" className="mr-2" />payment.succeeded</label>
                  <label className="flex items-center"><input type="checkbox" className="mr-2" />system.error</label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Retry Strategy</label>
                  <select className="w-full border border-gray-300 rounded-lg p-2">
                    <option value="exponential">Exponential Backoff</option>
                    <option value="linear">Linear</option>
                    <option value="none">None</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Max Retries</label>
                  <input
                    type="number"
                    defaultValue={3}
                    className="w-full border border-gray-300 rounded-lg p-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Timeout (ms)</label>
                <input
                  type="number"
                  defaultValue={5000}
                  className="w-full border border-gray-300 rounded-lg p-2"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <button
                  onClick={() => setShowCreate(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
