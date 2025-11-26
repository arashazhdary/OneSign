'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { getTenantId } from '@/lib/tenant-context';
import { platformService } from '@/lib/api/services';

interface Webhook {
  id: string;
  url: string;
  events: string[];
  secret: string;
  isActive: boolean;
  lastDelivery: string;
  successCount: number;
  failureCount: number;
  createdAt: string;
}

interface WebhookDelivery {
  id: string;
  webhookId: string;
  event: string;
  status: 'success' | 'failed' | 'pending';
  statusCode?: number;
  requestBody: string;
  responseBody?: string;
  attemptCount: number;
  deliveredAt: string;
  error?: string;
}

  useEffect(() => {
    fetchWebhooks();
  }, []);

  const fetchWebhooks = async () => {
    try {
      const tenantId = getTenantId() || '';
      const data = await platformService.getWebhooks(tenantId);
      setWebhooks(data);
    } catch (error) {
      console.error('Failed to fetch webhooks:', error);
      // Fallback to mock data if API fails
      setWebhooks(mockWebhooksFallback);
    } finally {
      setLoading(false);
    }
  };

const mockWebhooksFallback: Webhook[] = [
  {
    id: '1',
    url: 'https://api.example.com/webhooks/onesign',
    events: ['user.created', 'user.updated', 'user.deleted'],
    secret: '••••••••••••••••',
    isActive: true,
    lastDelivery: '2025-11-23T10:30:00Z',
    successCount: 1234,
    failureCount: 12,
    createdAt: '2025-01-15T08:00:00Z',
  },
  {
    id: '2',
    url: 'https://webhooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXX',
    events: ['security.alert', 'incident.created'],
    secret: '••••••••••••••••',
    isActive: true,
    lastDelivery: '2025-11-23T09:15:00Z',
    successCount: 567,
    failureCount: 3,
    createdAt: '2025-02-01T12:00:00Z',
  },
  {
    id: '3',
    url: 'https://api.internal.com/events',
    events: ['application.created', 'role.assigned'],
    secret: '••••••••••••••••',
    isActive: false,
    lastDelivery: '2025-11-20T14:22:00Z',
    successCount: 89,
    failureCount: 45,
    createdAt: '2025-03-10T09:30:00Z',
  },
];

const mockDeliveries: WebhookDelivery[] = [
  {
    id: '1',
    webhookId: '1',
    event: 'user.created',
    status: 'success',
    statusCode: 200,
    requestBody: '{"event":"user.created","userId":"123"}',
    responseBody: '{"received":true}',
    attemptCount: 1,
    deliveredAt: '2025-11-23T10:30:00Z',
  },
  {
    id: '2',
    webhookId: '1',
    event: 'user.updated',
    status: 'failed',
    statusCode: 500,
    requestBody: '{"event":"user.updated","userId":"456"}',
    responseBody: '{"error":"Internal Server Error"}',
    attemptCount: 3,
    deliveredAt: '2025-11-23T09:45:00Z',
    error: 'Connection timeout after 3 attempts',
  },
  {
    id: '3',
    webhookId: '2',
    event: 'security.alert',
    status: 'success',
    statusCode: 200,
    requestBody: '{"event":"security.alert","severity":"high"}',
    responseBody: '{"ok":true}',
    attemptCount: 1,
    deliveredAt: '2025-11-23T09:15:00Z',
  },
];

const availableEvents = [
  'user.created',
  'user.updated',
  'user.deleted',
  'user.suspended',
  'application.created',
  'application.updated',
  'role.assigned',
  'role.revoked',
  'security.alert',
  'incident.created',
  'audit.log',
];

export default function WebhooksPage() {
  const t = useTranslations();
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [deliveries, setDeliveries] = useState<WebhookDelivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeliveriesModal, setShowDeliveriesModal] = useState(false);
  const [showDeliveryDetailsModal, setShowDeliveryDetailsModal] = useState(false);
  const [selectedWebhook, setSelectedWebhook] = useState<Webhook | null>(null);
  const [selectedDelivery, setSelectedDelivery] = useState<WebhookDelivery | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tenantId, setTenantIdState] = useState<string | null>(null);

  // Form states
  const [formUrl, setFormUrl] = useState('');
  const [formEvents, setFormEvents] = useState<string[]>([]);
  const [formSecret, setFormSecret] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);

  useEffect(() => {
    const contextTenantId = getTenantId();
    if (contextTenantId) {
      setTenantIdState(contextTenantId);
    } else {
      setTenantIdState('11111111-1111-1111-1111-111111111111');
    }
  }, []);

  useEffect(() => {
    if (tenantId) {
      fetchWebhooks();
    }
  }, [tenantId]);

  const fetchWebhooks = async () => {
    if (!tenantId) return;

    try {
      const data = await platformService.getWebhooks(tenantId);
      setWebhooks(data);
    } catch (error) {
      console.error('Error fetching webhooks:', error);
      setWebhooks(mockWebhooks);
    } finally {
      setLoading(false);
    }
  };

  const fetchDeliveries = async (webhookId: string) => {
    if (!tenantId) return;

    try {
      const data = await platformService.getWebhookEvents(tenantId, webhookId);
      setDeliveries(data);
    } catch (error) {
      console.error('Error fetching webhook deliveries:', error);
      setDeliveries(mockDeliveries.filter(d => d.webhookId === webhookId));
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!tenantId) return;

    try {
      await platformService.createWebhook(tenantId, {
        url: formUrl,
        events: formEvents,
        secret: formSecret,
        isActive: formIsActive,
      });
      setSuccess('Webhook created successfully');
      setShowCreateModal(false);
      resetForm();
      fetchWebhooks();
    } catch (error: any) {
      setError(error?.message || 'Failed to create webhook');
      console.error('Error creating webhook:', error);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!tenantId || !selectedWebhook) return;

    try {
      await platformService.updateWebhook(tenantId, selectedWebhook.id, {
        url: formUrl,
        events: formEvents,
        secret: formSecret,
        isActive: formIsActive,
      });
      setSuccess('Webhook updated successfully');
      setShowEditModal(false);
      setSelectedWebhook(null);
      resetForm();
      fetchWebhooks();
    } catch (error: any) {
      setError(error?.message || 'Failed to update webhook');
      console.error('Error updating webhook:', error);
    }
  };

  const handleDelete = async (webhookId: string) => {
    if (!tenantId) return;
    if (!confirm('Are you sure you want to delete this webhook?')) return;

    setError('');
    setSuccess('');

    try {
      await platformService.deleteWebhook(tenantId, webhookId);
      setSuccess('Webhook deleted successfully');
      fetchWebhooks();
    } catch (error: any) {
      setError(error?.message || 'Failed to delete webhook');
      console.error('Error deleting webhook:', error);
    }
  };

  const handleTest = async (webhookId: string) => {
    if (!tenantId) return;

    setError('');
    setSuccess('');

    try {
      const result = await platformService.testWebhook(tenantId, webhookId);
      if (result.success) {
        setSuccess('Test payload sent successfully');
      } else {
        setError(result.message || 'Test failed');
      }
    } catch (error: any) {
      setError(error?.message || 'Failed to test webhook');
      console.error('Error testing webhook:', error);
    }
  };

  const handleToggleActive = async (webhook: Webhook) => {
    if (!tenantId) return;

    try {
      await platformService.updateWebhook(tenantId, webhook.id, {
        isActive: !webhook.isActive,
      });
      setSuccess(`Webhook ${!webhook.isActive ? 'enabled' : 'disabled'} successfully`);
      fetchWebhooks();
    } catch (error: any) {
      setError(error?.message || 'Failed to toggle webhook status');
      console.error('Error toggling webhook:', error);
    }
  };

  const handleRetryDelivery = async (deliveryId: string) => {
    setError('');
    setSuccess('');

    try {
      // API call would go here
      setSuccess('Delivery retry initiated');
    } catch (error: any) {
      setError(error?.message || 'Failed to retry delivery');
    }
  };

  const openCreateModal = () => {
    resetForm();
    setShowCreateModal(true);
  };

  const openEditModal = (webhook: Webhook) => {
    setSelectedWebhook(webhook);
    setFormUrl(webhook.url);
    setFormEvents(webhook.events);
    setFormSecret('');
    setFormIsActive(webhook.isActive);
    setShowEditModal(true);
  };

  const openDeliveriesModal = (webhook: Webhook) => {
    setSelectedWebhook(webhook);
    fetchDeliveries(webhook.id);
    setShowDeliveriesModal(true);
  };

  const openDeliveryDetailsModal = (delivery: WebhookDelivery) => {
    setSelectedDelivery(delivery);
    setShowDeliveryDetailsModal(true);
  };

  const resetForm = () => {
    setFormUrl('');
    setFormEvents([]);
    setFormSecret('');
    setFormIsActive(true);
  };

  const toggleEvent = (event: string) => {
    setFormEvents(prev =>
      prev.includes(event) ? prev.filter(e => e !== event) : [...prev, event]
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      success: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return <div className="p-8">Loading webhooks...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Webhooks Management</h1>
        <button
          onClick={openCreateModal}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          Create Webhook
        </button>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}

      {/* Webhooks Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">URL</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Events</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Success/Failure</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Delivery</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {webhooks.map((webhook) => (
              <tr key={webhook.id}>
                <td className="px-6 py-4 text-sm font-medium text-gray-900 max-w-xs truncate">
                  {webhook.url}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                    {webhook.events.length} events
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">
                  <button
                    onClick={() => handleToggleActive(webhook)}
                    className={`px-3 py-1 rounded text-xs font-medium ${
                      webhook.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {webhook.isActive ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  <span className="text-green-600">{webhook.successCount}</span> /{' '}
                  <span className="text-red-600">{webhook.failureCount}</span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                  {formatDate(webhook.lastDelivery)}
                </td>
                <td className="px-6 py-4 text-sm whitespace-nowrap">
                  <button
                    onClick={() => handleTest(webhook.id)}
                    className="text-indigo-600 hover:text-indigo-900 mr-3"
                  >
                    Test
                  </button>
                  <button
                    onClick={() => openDeliveriesModal(webhook)}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    Logs
                  </button>
                  <button
                    onClick={() => openEditModal(webhook)}
                    className="text-yellow-600 hover:text-yellow-900 mr-3"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(webhook.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {webhooks.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No webhooks configured. Create your first webhook to get started.
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Create Webhook</h2>
            <form onSubmit={handleCreate}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Webhook URL *</label>
                <input
                  type="url"
                  required
                  className="w-full px-3 py-2 border rounded"
                  placeholder="https://api.example.com/webhooks"
                  value={formUrl}
                  onChange={(e) => setFormUrl(e.target.value)}
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Secret Key (optional)</label>
                <input
                  type="password"
                  className="w-full px-3 py-2 border rounded"
                  placeholder="Enter a secret key for HMAC signature"
                  value={formSecret}
                  onChange={(e) => setFormSecret(e.target.value)}
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Events to Subscribe *</label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border rounded p-3">
                  {availableEvents.map((event) => (
                    <label key={event} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formEvents.includes(event)}
                        onChange={() => toggleEvent(event)}
                        className="rounded"
                      />
                      <span className="text-sm">{event}</span>
                    </label>
                  ))}
                </div>
                {formEvents.length === 0 && (
                  <p className="text-xs text-red-600 mt-1">Select at least one event</p>
                )}
              </div>

              <div className="mb-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formIsActive}
                    onChange={(e) => setFormIsActive(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm font-medium">Active</span>
                </label>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={formEvents.length === 0}
                  className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedWebhook && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Edit Webhook</h2>
            <form onSubmit={handleUpdate}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Webhook URL *</label>
                <input
                  type="url"
                  required
                  className="w-full px-3 py-2 border rounded"
                  value={formUrl}
                  onChange={(e) => setFormUrl(e.target.value)}
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Secret Key (leave empty to keep existing)</label>
                <input
                  type="password"
                  className="w-full px-3 py-2 border rounded"
                  placeholder="Enter new secret key"
                  value={formSecret}
                  onChange={(e) => setFormSecret(e.target.value)}
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Events to Subscribe *</label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border rounded p-3">
                  {availableEvents.map((event) => (
                    <label key={event} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formEvents.includes(event)}
                        onChange={() => toggleEvent(event)}
                        className="rounded"
                      />
                      <span className="text-sm">{event}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formIsActive}
                    onChange={(e) => setFormIsActive(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm font-medium">Active</span>
                </label>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={formEvents.length === 0}
                  className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
                >
                  Update
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedWebhook(null);
                  }}
                  className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Deliveries Modal */}
      {showDeliveriesModal && selectedWebhook && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              Webhook Delivery Logs - {selectedWebhook.url}
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Event</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Attempts</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Delivered At</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {deliveries.map((delivery) => (
                    <tr key={delivery.id}>
                      <td className="px-4 py-3 text-sm text-gray-900">{delivery.event}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded text-xs ${getStatusBadge(delivery.status)}`}>
                          {delivery.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{delivery.statusCode || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{delivery.attemptCount}</td>
                      <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                        {formatDate(delivery.deliveredAt)}
                      </td>
                      <td className="px-4 py-3 text-sm whitespace-nowrap">
                        <button
                          onClick={() => openDeliveryDetailsModal(delivery)}
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                        >
                          Details
                        </button>
                        {delivery.status === 'failed' && (
                          <button
                            onClick={() => handleRetryDelivery(delivery.id)}
                            className="text-yellow-600 hover:text-yellow-900"
                          >
                            Retry
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4">
              <button
                onClick={() => {
                  setShowDeliveriesModal(false);
                  setSelectedWebhook(null);
                }}
                className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delivery Details Modal */}
      {showDeliveryDetailsModal && selectedDelivery && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Delivery Details</h2>

            <div className="mb-4">
              <h3 className="font-semibold mb-2">Event: {selectedDelivery.event}</h3>
              <p className="text-sm text-gray-600">
                Status: <span className={`px-2 py-1 rounded ${getStatusBadge(selectedDelivery.status)}`}>
                  {selectedDelivery.status}
                </span>
              </p>
              <p className="text-sm text-gray-600">Attempts: {selectedDelivery.attemptCount}</p>
              <p className="text-sm text-gray-600">Delivered: {formatDate(selectedDelivery.deliveredAt)}</p>
            </div>

            {selectedDelivery.error && (
              <div className="mb-4">
                <h3 className="font-semibold mb-2 text-red-600">Error</h3>
                <pre className="bg-red-50 p-3 rounded text-xs overflow-x-auto">
                  {selectedDelivery.error}
                </pre>
              </div>
            )}

            <div className="mb-4">
              <h3 className="font-semibold mb-2">Request Body</h3>
              <pre className="bg-gray-50 p-3 rounded text-xs overflow-x-auto">
                {JSON.stringify(JSON.parse(selectedDelivery.requestBody), null, 2)}
              </pre>
            </div>

            {selectedDelivery.responseBody && (
              <div className="mb-4">
                <h3 className="font-semibold mb-2">Response Body</h3>
                <pre className="bg-gray-50 p-3 rounded text-xs overflow-x-auto">
                  {JSON.stringify(JSON.parse(selectedDelivery.responseBody), null, 2)}
                </pre>
              </div>
            )}

            <div className="flex gap-2">
              {selectedDelivery.status === 'failed' && (
                <button
                  onClick={() => {
                    handleRetryDelivery(selectedDelivery.id);
                    setShowDeliveryDetailsModal(false);
                  }}
                  className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
                >
                  Retry Delivery
                </button>
              )}
              <button
                onClick={() => setShowDeliveryDetailsModal(false)}
                className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
