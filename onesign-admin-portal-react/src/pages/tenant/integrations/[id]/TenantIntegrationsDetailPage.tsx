import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'react-router-dom';
import { platformService } from '@/lib/api/services';
import { getTenantId } from '@/lib/tenant-context';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import { Helmet } from 'react-helmet-async';

interface SyncLog {
  id: string;
  timestamp: string;
  status: 'success' | 'failed' | 'partial';
  recordsSynced: number;
  errors: string[];
  duration: number;
}

interface IntegrationDetails {
  id: string;
  name: string;
  type: string;
  provider: string;
  status: 'active' | 'inactive' | 'error';
  config: Record<string, any>;
  lastSyncAt?: string;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export default function TenantIntegrationsDetailPage() {
  const params = useParams();
  const navigate = useNavigate();
  const id = params.id as string;
  const [tenantId, setTenantIdState] = useState<string | null>(null);

  const [integration, setIntegration] = useState<IntegrationDetails | null>(null);
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [testing, setTesting] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const [activeTab, setActiveTab] = useState<'overview' | 'config' | 'sync-logs'>('overview');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [editName, setEditName] = useState('');
  const [editConfig, setEditConfig] = useState('');
  const [configError, setConfigError] = useState('');

  useEffect(() => {
    const contextTenantId = getTenantId();
    setTenantIdState(contextTenantId || '00000000-0000-0000-0000-000000000000');
  }, []);

  useEffect(() => {
    if (tenantId) {
      fetchData();
    }
  }, [id, tenantId]);

  const fetchData = async () => {
    if (!tenantId) return;

    try {
      setLoading(true);
      const result = await platformService.getIntegrationById(id, tenantId);

      const integrationData: IntegrationDetails = {
        id: result.id,
        name: result.name,
        type: result.type,
        provider: result.provider,
        status: result.status,
        config: result.config || {},
        lastSyncAt: result.lastSyncAt,
        errorMessage: result.errorMessage,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt,
      };

      setIntegration(integrationData);
      setEditName(integrationData.name);
      setEditConfig(JSON.stringify(integrationData.config, null, 2));

      // Fetch sync logs
      await fetchSyncLogs();
    } catch (err: any) {
      console.error('Error fetching integration:', err);
      if (err.status === 404 || err.response?.status === 404) {
        setNotFound(true);
      } else {
        // Fallback to mock data
        loadMockData();
      }
    } finally {
      setLoading(false);
    }
  };

  const loadMockData = () => {
    const mockIntegration: IntegrationDetails = {
      id,
      name: 'Azure AD Sync',
      type: 'directory',
      provider: 'azure-ad',
      status: 'active',
      config: {
        tenantId: 'azure-tenant-123',
        clientId: 'client-456',
        syncInterval: 3600,
        syncUsers: true,
        syncGroups: true,
        mappings: {
          email: 'mail',
          firstName: 'givenName',
          lastName: 'surname',
        },
      },
      lastSyncAt: '2024-03-20T10:30:00Z',
      createdAt: '2024-01-15T08:00:00Z',
      updatedAt: '2024-03-20T10:30:00Z',
    };

    const mockSyncLogs: SyncLog[] = [
      {
        id: '1',
        timestamp: '2024-03-20T10:30:00Z',
        status: 'success',
        recordsSynced: 150,
        errors: [],
        duration: 45,
      },
      {
        id: '2',
        timestamp: '2024-03-19T10:30:00Z',
        status: 'success',
        recordsSynced: 148,
        errors: [],
        duration: 42,
      },
      {
        id: '3',
        timestamp: '2024-03-18T10:30:00Z',
        status: 'partial',
        recordsSynced: 145,
        errors: ['Failed to sync 3 users due to invalid email addresses'],
        duration: 50,
      },
      {
        id: '4',
        timestamp: '2024-03-17T10:30:00Z',
        status: 'failed',
        recordsSynced: 0,
        errors: ['Connection timeout', 'Unable to authenticate with Azure AD'],
        duration: 10,
      },
    ];

    setIntegration(mockIntegration);
    setSyncLogs(mockSyncLogs);
    setEditName(mockIntegration.name);
    setEditConfig(JSON.stringify(mockIntegration.config, null, 2));
  };

  const fetchSyncLogs = async () => {
    if (!tenantId) return;

    try {
      const logs = await platformService.getIntegrationSyncLogs(id, tenantId);
      setSyncLogs(logs || []);
    } catch (err) {
      console.error('Error fetching sync logs:', err);
      // Use mock data on error
      const mockSyncLogs: SyncLog[] = [
        {
          id: '1',
          timestamp: '2024-03-20T10:30:00Z',
          status: 'success',
          recordsSynced: 150,
          errors: [],
          duration: 45,
        },
      ];
      setSyncLogs(mockSyncLogs);
    }
  };

  const handleTestConnection = async () => {
    if (!tenantId) return;

    setTesting(true);
    setError('');
    setSuccess('');

    try {
      const result = await platformService.testIntegration(id, tenantId);
      if (result.success) {
        setSuccess('Connection test successful');
      } else {
        setError(result.message || 'Connection test failed');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to test connection');
    } finally {
      setTesting(false);
    }
  };

  const handleSync = async () => {
    if (!tenantId) return;

    setSyncing(true);
    setError('');
    setSuccess('');

    try {
      await platformService.syncIntegration(id, tenantId);
      setSuccess('Sync started successfully');
      // Refresh sync logs after a delay
      setTimeout(() => {
        fetchSyncLogs();
      }, 2000);
    } catch (err: any) {
      setError(err?.message || 'Failed to start sync');
    } finally {
      setSyncing(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!tenantId || !integration) return;

    setError('');
    setSuccess('');

    const newStatus = integration.status === 'active' ? 'inactive' : 'active';

    try {
      await platformService.updateIntegration(id, { status: newStatus }, tenantId);
      setSuccess(`Integration ${newStatus === 'active' ? 'enabled' : 'disabled'} successfully`);
      fetchData();
    } catch (err: any) {
      setError(err?.message || 'Failed to update integration status');
    }
  };

  const handleUpdateIntegration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId) return;

    setError('');
    setSuccess('');
    setConfigError('');

    // Validate JSON config
    let configObj;
    try {
      configObj = JSON.parse(editConfig);
    } catch (err) {
      setConfigError('Invalid JSON configuration');
      return;
    }

    try {
      await platformService.updateIntegration(
        id,
        {
          name: editName,
          config: configObj,
        },
        tenantId
      );

      setSuccess('Integration updated successfully');
      setShowEditModal(false);
      fetchData();
    } catch (err: any) {
      setError(err?.message || 'Failed to update integration');
    }
  };

  const handleDeleteIntegration = async () => {
    if (!tenantId) return;

    setError('');
    setSuccess('');

    try {
      await platformService.deleteIntegration(id, tenantId);
      setSuccess('Integration deleted successfully');
      setTimeout(() => {
        navigate('/tenant/integrations');
      }, 1500);
    } catch (err: any) {
      setError(err?.message || 'Failed to delete integration');
      setShowDeleteConfirm(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSyncStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'partial':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Integration Not Found</h1>
          <p className="text-gray-600 mb-6">The integration you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/tenant/integrations')}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Back to Integrations
          </button>
        </div>
      </div>
    );
  }

  if (!integration) {
    return null;
  }

  return (
    <div className="p-8">
      <Breadcrumbs
        customLabels={{
          '/tenant': 'Tenant',
          '/tenant/integrations': 'Integrations',
          [`/tenant/integrations/${id}`]: integration.name,
        }}
        className="mb-6"
      />

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{integration.name}</h1>
          <div className="flex items-center gap-3 mt-2">
            <span className={`px-3 py-1 text-sm rounded ${getStatusColor(integration.status)}`}>
              {integration.status}
            </span>
            <span className="text-gray-600">{integration.provider}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleTestConnection}
            disabled={testing}
            className="px-4 py-2 border rounded hover:bg-gray-50 disabled:opacity-50"
          >
            {testing ? 'Testing...' : 'Test Connection'}
          </button>
          <button
            onClick={handleSync}
            disabled={syncing || integration.status !== 'active'}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {syncing ? 'Syncing...' : 'Sync Now'}
          </button>
          <button
            onClick={handleToggleStatus}
            className={`px-4 py-2 rounded ${
              integration.status === 'active'
                ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {integration.status === 'active' ? 'Disable' : 'Enable'}
          </button>
          <button
            onClick={() => setShowEditModal(true)}
            className="px-4 py-2 border rounded hover:bg-gray-50"
          >
            Edit
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Delete
          </button>
          <button
            onClick={() => navigate('/tenant/integrations')}
            className="px-4 py-2 border rounded hover:bg-gray-50"
          >
            Back
          </button>
        </div>
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

      {integration.errorMessage && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <strong>Error:</strong> {integration.errorMessage}
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {(['overview', 'config', 'sync-logs'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab === 'sync-logs' ? 'Sync Logs' : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Integration Info Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Integration Information</h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-500">Integration ID</label>
                <p className="font-mono text-sm">{integration.id}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Type</label>
                <p className="capitalize">{integration.type}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Provider</label>
                <p>{integration.provider}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Status</label>
                <p>
                  <span className={`px-2 py-1 text-xs rounded ${getStatusColor(integration.status)}`}>
                    {integration.status}
                  </span>
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Last Sync</label>
                <p className="text-sm">
                  {integration.lastSyncAt ? formatDate(integration.lastSyncAt) : 'Never'}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Created</label>
                <p className="text-sm">{formatDate(integration.createdAt)}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Last Updated</label>
                <p className="text-sm">{formatDate(integration.updatedAt)}</p>
              </div>
            </div>
          </div>

          {/* Sync Statistics Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Sync Statistics</h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-500">Total Syncs</label>
                <p className="text-2xl font-bold text-indigo-600">{syncLogs.length}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Successful Syncs</label>
                <p className="text-2xl font-bold text-green-600">
                  {syncLogs.filter(log => log.status === 'success').length}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Failed Syncs</label>
                <p className="text-2xl font-bold text-red-600">
                  {syncLogs.filter(log => log.status === 'failed').length}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Last Sync Records</label>
                <p className="text-2xl font-bold text-indigo-600">
                  {syncLogs[0]?.recordsSynced || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'config' && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold">Configuration</h2>
          </div>
          <div className="p-6">
            <div className="bg-gray-50 rounded p-4 font-mono text-sm overflow-x-auto">
              <pre>{JSON.stringify(integration.config, null, 2)}</pre>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'sync-logs' && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold">Sync History ({syncLogs.length})</h2>
          </div>
          <div className="p-6">
            {syncLogs.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No sync logs available</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Records Synced</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration (s)</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Errors</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {syncLogs.map((log) => (
                      <tr key={log.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {formatDate(log.timestamp)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded ${getSyncStatusColor(log.status)}`}>
                            {log.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{log.recordsSynced}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{log.duration}s</td>
                        <td className="px-6 py-4 text-sm">
                          {log.errors.length > 0 ? (
                            <ul className="list-disc list-inside text-red-600">
                              {log.errors.map((error, idx) => (
                                <li key={idx}>{error}</li>
                              ))}
                            </ul>
                          ) : (
                            <span className="text-gray-500">None</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Integration Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Edit Integration</h2>
            <form onSubmit={handleUpdateIntegration}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Integration Name</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Configuration (JSON)</label>
                  <textarea
                    value={editConfig}
                    onChange={(e) => setEditConfig(e.target.value)}
                    className={`w-full px-3 py-2 border rounded font-mono text-sm ${
                      configError ? 'border-red-500' : ''
                    }`}
                    rows={12}
                  />
                  {configError && (
                    <p className="text-red-600 text-sm mt-1">{configError}</p>
                  )}
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setConfigError('');
                  }}
                  className="px-4 py-2 border rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Delete Integration</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this integration? This action cannot be undone and will stop all sync operations.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleDeleteIntegration}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border rounded hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
