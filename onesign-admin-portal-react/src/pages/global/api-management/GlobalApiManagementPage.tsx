import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from '@/components/common/Modal';
import DataTable, { Column } from '@/components/common/DataTable';
import { platformService } from '@/lib/api/services';
import { Helmet } from 'react-helmet-async';

interface APIEndpoint {
  id: string;
  path: string;
  method: string;
  description: string;
  version: string;
  rateLimit: number;
  rateLimitWindow: string;
  enabled: boolean;
  requestCount: number;
  errorRate: number;
  avgResponseTime: number;
}

interface APIKey {
  id: string;
  name: string;
  key: string;
  scope: string[];
  expiresAt?: string;
  createdAt: string;
  lastUsedAt?: string;
  isActive: boolean;
}

interface APIConsumer {
  id: string;
  name: string;
  requestCount: number;
  errorCount: number;
  lastRequestAt: string;
}

interface APIVersion {
  id: string;
  version: string;
  status: 'Active' | 'Deprecated' | 'Retired';
  releaseDate: string;
  deprecationDate?: string;
  endpointCount: number;
}

type Tab = 'endpoints' | 'keys' | 'consumers' | 'versions';

export default function GlobalApiManagementPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<Tab>('endpoints');
  const [endpoints, setEndpoints] = useState<APIEndpoint[]>([]);
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [consumers, setConsumers] = useState<APIConsumer[]>([]);
  const [versions, setVersions] = useState<APIVersion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isCreateKeyModalOpen, setIsCreateKeyModalOpen] = useState(false);
  const [isRateLimitModalOpen, setIsRateLimitModalOpen] = useState(false);
  const [selectedEndpoint, setSelectedEndpoint] = useState<APIEndpoint | null>(null);

  const [keyFormData, setKeyFormData] = useState({
    name: '',
    scope: [] as string[],
    expiresIn: '90'
  });

  const [rateLimitForm, setRateLimitForm] = useState({
    rateLimit: 1000,
    rateLimitWindow: '1h'
  });

  const fetchEndpoints = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await platformService.getAPIEndpoints();
      setEndpoints(data.endpoints || []);
    } catch (err: any) {
      setError(err.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const fetchAPIKeys = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await platformService.getAPIKeys();
      setApiKeys(data.keys || []);
    } catch (err: any) {
      setError(err.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const fetchConsumers = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await platformService.getAPIConsumers();
      setConsumers(data.consumers || []);
    } catch (err: any) {
      setError(err.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const fetchVersions = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await platformService.getAPIVersions();
      setVersions(data.versions || []);
    } catch (err: any) {
      setError(err.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const createAPIKey = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const data = await platformService.createAPIKey({
        name: keyFormData.name,
        scope: keyFormData.scope,
        expiresIn: parseInt(keyFormData.expiresIn)
      });
      setSuccess(`API Key created: ${data.key}`);
      setIsCreateKeyModalOpen(false);
      setKeyFormData({ name: '', scope: [], expiresIn: '90' });
      fetchAPIKeys();
    } catch (err: any) {
      setError(err.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const revokeAPIKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to revoke this API key?')) return;

    setLoading(true);
    setError('');
    try {
      await platformService.revokeAPIKey(keyId);
      setSuccess('API Key revoked successfully');
      fetchAPIKeys();
    } catch (err: any) {
      setError(err.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const updateRateLimit = async () => {
    if (!selectedEndpoint) return;

    setLoading(true);
    setError('');
    try {
      await platformService.updateEndpointRateLimit(selectedEndpoint.id, rateLimitForm);
      setSuccess('Rate limit updated successfully');
      setIsRateLimitModalOpen(false);
      fetchEndpoints();
    } catch (err: any) {
      setError(err.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'endpoints') fetchEndpoints();
    else if (activeTab === 'keys') fetchAPIKeys();
    else if (activeTab === 'consumers') fetchConsumers();
    else if (activeTab === 'versions') fetchVersions();
  }, [activeTab]);

  const endpointColumns: Column<APIEndpoint>[] = [
    {
      key: 'method',
      label: 'Method',
      render: (e) => (
        <span className={`px-2 py-1 rounded text-xs font-bold ${
          e.method === 'GET' ? 'bg-blue-100 text-blue-800' :
          e.method === 'POST' ? 'bg-green-100 text-green-800' :
          e.method === 'PUT' ? 'bg-yellow-100 text-yellow-800' :
          e.method === 'DELETE' ? 'bg-red-100 text-red-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {e.method}
        </span>
      )
    },
    { key: 'path', label: 'Path', render: (e) => <code className="text-sm">{e.path}</code> },
    { key: 'version', label: 'Version' },
    { key: 'requestCount', label: 'Requests', render: (e) => e.requestCount.toLocaleString() },
    {
      key: 'errorRate',
      label: 'Error Rate',
      render: (e) => (
        <span className={e.errorRate > 5 ? 'text-red-600 font-semibold' : 'text-gray-600'}>
          {e.errorRate.toFixed(2)}%
        </span>
      )
    },
    { key: 'avgResponseTime', label: 'Avg Time', render: (e) => `${e.avgResponseTime}ms` },
    {
      key: 'rateLimit',
      label: 'Rate Limit',
      render: (e) => `${e.rateLimit}/${e.rateLimitWindow}`
    }
  ];

  const keyColumns: Column<APIKey>[] = [
    { key: 'name', label: 'Name', render: (k) => <span className="font-semibold">{k.name}</span> },
    { key: 'key', label: 'Key', render: (k) => <code className="text-xs bg-gray-100 px-2 py-1 rounded">{k.key.substring(0, 20)}...</code> },
    { key: 'scope', label: 'Scope', render: (k) => k.scope.join(', ') },
    {
      key: 'isActive',
      label: 'Status',
      render: (k) => (
        <span className={`px-2 py-1 rounded text-xs ${k.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {k.isActive ? 'Active' : 'Revoked'}
        </span>
      )
    },
    { key: 'expiresAt', label: 'Expires', render: (k) => k.expiresAt ? new Date(k.expiresAt).toLocaleDateString() : 'Never' },
    { key: 'lastUsedAt', label: 'Last Used', render: (k) => k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleString() : 'Never' }
  ];

  const consumerColumns: Column<APIConsumer>[] = [
    { key: 'name', label: 'Consumer', render: (c) => <span className="font-semibold">{c.name}</span> },
    { key: 'requestCount', label: 'Total Requests', render: (c) => c.requestCount.toLocaleString() },
    { key: 'errorCount', label: 'Errors', render: (c) => c.errorCount.toLocaleString() },
    {
      key: 'errorCount',
      label: 'Error Rate',
      render: (c) => {
        const rate = (c.errorCount / c.requestCount) * 100;
        return <span className={rate > 5 ? 'text-red-600 font-semibold' : ''}>{rate.toFixed(2)}%</span>;
      }
    },
    { key: 'lastRequestAt', label: 'Last Request', render: (c) => new Date(c.lastRequestAt).toLocaleString() }
  ];

  const versionColumns: Column<APIVersion>[] = [
    { key: 'version', label: 'Version', render: (v) => <span className="font-bold text-lg">{v.version}</span> },
    {
      key: 'status',
      label: 'Status',
      render: (v) => (
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          v.status === 'Active' ? 'bg-green-100 text-green-800' :
          v.status === 'Deprecated' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {v.status}
        </span>
      )
    },
    { key: 'releaseDate', label: 'Release Date', render: (v) => new Date(v.releaseDate).toLocaleDateString() },
    { key: 'deprecationDate', label: 'Deprecation Date', render: (v) => v.deprecationDate ? new Date(v.deprecationDate).toLocaleDateString() : '-' },
    { key: 'endpointCount', label: 'Endpoints' }
  ];

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">API Management</h1>
        {activeTab === 'keys' && (
          <button
            onClick={() => setIsCreateKeyModalOpen(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
          >
            Create API Key
          </button>
        )}
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

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-500">Total Endpoints</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{endpoints.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-500">Active Keys</div>
          <div className="text-2xl font-bold text-green-600 mt-1">
            {apiKeys.filter(k => k.isActive).length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-500">Total Requests</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">
            {endpoints.reduce((sum, e) => sum + e.requestCount, 0).toLocaleString()}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-500">Avg Error Rate</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">
            {endpoints.length > 0
              ? (endpoints.reduce((sum, e) => sum + e.errorRate, 0) / endpoints.length).toFixed(2)
              : '0.00'}%
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {(['endpoints', 'keys', 'consumers', 'versions'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                activeTab === tab
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.replace('-', ' ')}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'endpoints' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <DataTable
            data={endpoints}
            columns={endpointColumns}
            loading={loading}
            emptyMessage="No endpoints found"
            actions={(endpoint) => (
              <button
                onClick={() => {
                  setSelectedEndpoint(endpoint);
                  setRateLimitForm({
                    rateLimit: endpoint.rateLimit,
                    rateLimitWindow: endpoint.rateLimitWindow
                  });
                  setIsRateLimitModalOpen(true);
                }}
                className="text-indigo-600 hover:text-indigo-900 font-medium"
              >
                Configure
              </button>
            )}
          />
        </div>
      )}

      {activeTab === 'keys' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <DataTable
            data={apiKeys}
            columns={keyColumns}
            loading={loading}
            emptyMessage="No API keys found"
            actions={(key) => (
              <button
                onClick={() => revokeAPIKey(key.id)}
                disabled={!key.isActive}
                className="text-red-600 hover:text-red-900 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Revoke
              </button>
            )}
          />
        </div>
      )}

      {activeTab === 'consumers' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <DataTable
            data={consumers}
            columns={consumerColumns}
            loading={loading}
            emptyMessage="No consumers found"
          />
        </div>
      )}

      {activeTab === 'versions' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <DataTable
            data={versions}
            columns={versionColumns}
            loading={loading}
            emptyMessage="No API versions found"
          />
        </div>
      )}

      {/* Create API Key Modal */}
      <Modal
        isOpen={isCreateKeyModalOpen}
        onClose={() => setIsCreateKeyModalOpen(false)}
        title="Create API Key"
        size="md"
        footer={
          <>
            <button
              onClick={() => setIsCreateKeyModalOpen(false)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={createAPIKey}
              disabled={!keyFormData.name || loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              Create Key
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Key Name *</label>
            <input
              type="text"
              value={keyFormData.name}
              onChange={(e) => setKeyFormData({ ...keyFormData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g., Production API Key"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Scope</label>
            <div className="space-y-2">
              {['read', 'write', 'delete', 'admin'].map((scope) => (
                <label key={scope} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={keyFormData.scope.includes(scope)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setKeyFormData({ ...keyFormData, scope: [...keyFormData.scope, scope] });
                      } else {
                        setKeyFormData({ ...keyFormData, scope: keyFormData.scope.filter(s => s !== scope) });
                      }
                    }}
                    className="mr-2"
                  />
                  <span className="capitalize">{scope}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Expires In (days)</label>
            <input
              type="number"
              value={keyFormData.expiresIn}
              onChange={(e) => setKeyFormData({ ...keyFormData, expiresIn: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              min="1"
            />
          </div>
        </div>
      </Modal>

      {/* Rate Limit Configuration Modal */}
      <Modal
        isOpen={isRateLimitModalOpen}
        onClose={() => setIsRateLimitModalOpen(false)}
        title="Configure Rate Limit"
        size="md"
        footer={
          <>
            <button
              onClick={() => setIsRateLimitModalOpen(false)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={updateRateLimit}
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              Update
            </button>
          </>
        }
      >
        {selectedEndpoint && (
          <div className="space-y-4">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="text-sm text-gray-500">Endpoint</div>
              <div className="font-mono text-sm mt-1">
                <span className="font-bold">{selectedEndpoint.method}</span> {selectedEndpoint.path}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rate Limit (requests)</label>
              <input
                type="number"
                value={rateLimitForm.rateLimit}
                onChange={(e) => setRateLimitForm({ ...rateLimitForm, rateLimit: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                min="1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time Window</label>
              <select
                value={rateLimitForm.rateLimitWindow}
                onChange={(e) => setRateLimitForm({ ...rateLimitForm, rateLimitWindow: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="1m">1 minute</option>
                <option value="5m">5 minutes</option>
                <option value="15m">15 minutes</option>
                <option value="1h">1 hour</option>
                <option value="1d">1 day</option>
              </select>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
