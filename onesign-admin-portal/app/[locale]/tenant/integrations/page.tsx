'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { getTenantId } from '@/lib/tenant-context';
import { platformService } from '@/lib/api/services';

interface Integration {
  id: string;
  type: string;
  name: string;
  description: string;
  isActive: boolean;
  status: 'healthy' | 'warning' | 'error' | 'pending';
  lastSyncAt?: string;
  config: Record<string, any>;
  syncedUsers?: number;
  errorCount?: number;
}

interface AvailableIntegration {
  id: string;
  type: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  features: string[];
}

interface SyncLog {
  id: string;
  integrationId: string;
  timestamp: string;
  status: 'success' | 'failed';
  message: string;
  usersProcessed: number;
  errors: number;
}

const AVAILABLE_INTEGRATIONS: AvailableIntegration[] = [
  {
    id: 'ldap',
    type: 'ldap',
    name: 'LDAP',
    description: 'Lightweight Directory Access Protocol integration',
    icon: '🔐',
    category: 'Directory Services',
    features: ['User Sync', 'Group Sync', 'Authentication'],
  },
  {
    id: 'ad',
    type: 'active-directory',
    name: 'Active Directory',
    description: 'Microsoft Active Directory integration',
    icon: '🪟',
    category: 'Directory Services',
    features: ['User Sync', 'Group Sync', 'Authentication', 'SSO'],
  },
  {
    id: 'okta',
    type: 'okta',
    name: 'Okta',
    description: 'Okta identity and access management',
    icon: '⚡',
    category: 'Identity Provider',
    features: ['SSO', 'SAML', 'OIDC', 'User Provisioning'],
  },
  {
    id: 'azure-ad',
    type: 'azure-ad',
    name: 'Azure AD',
    description: 'Microsoft Azure Active Directory',
    icon: '☁️',
    category: 'Identity Provider',
    features: ['SSO', 'SAML', 'OIDC', 'User Sync', 'Graph API'],
  },
  {
    id: 'google-workspace',
    type: 'google-workspace',
    name: 'Google Workspace',
    description: 'Google Workspace (G Suite) integration',
    icon: '🔵',
    category: 'Identity Provider',
    features: ['SSO', 'User Sync', 'OAuth', 'Directory API'],
  },
  {
    id: 'saml',
    type: 'saml',
    name: 'Generic SAML',
    description: 'Generic SAML 2.0 integration',
    icon: '🔑',
    category: 'Protocol',
    features: ['SSO', 'SAML 2.0'],
  },
  {
    id: 'oidc',
    type: 'oidc',
    name: 'OpenID Connect',
    description: 'Generic OpenID Connect integration',
    icon: '🆔',
    category: 'Protocol',
    features: ['SSO', 'OIDC'],
  },
  {
    id: 'slack',
    type: 'slack',
    name: 'Slack',
    description: 'Slack workspace integration',
    icon: '💬',
    category: 'Collaboration',
    features: ['Notifications', 'User Sync'],
  },
];

export default function IntegrationHubPage() {
  const t = useTranslations();
  const [tenantId, setTenantIdState] = useState<string | null>(null);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showConfigureModal, setShowConfigureModal] = useState(false);
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<AvailableIntegration | null>(null);
  const [selectedActiveIntegration, setSelectedActiveIntegration] = useState<Integration | null>(null);
  const [configStep, setConfigStep] = useState(1);
  const [integrationConfig, setIntegrationConfig] = useState<Record<string, any>>({});
  const [testResult, setTestResult] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  useEffect(() => {
    const contextTenantId = getTenantId();
    setTenantIdState(contextTenantId || '11111111-1111-1111-1111-111111111111');
  }, []);

  useEffect(() => {
    if (tenantId) {
      fetchIntegrations();
      fetchSyncLogs();
    }
  }, [tenantId]);

  const fetchIntegrations = async () => {
    if (!tenantId) return;
    try {
      const data = await platformService.getIntegrations(tenantId);
      setIntegrations(data.items || data || []);
    } catch (error) {
      console.error('Error fetching integrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSyncLogs = async () => {
    if (!tenantId) return;
    try {
      const data = await platformService.getAllIntegrationSyncLogs(tenantId);
      setSyncLogs(data.items || data || []);
    } catch (error) {
      console.error('Error fetching sync logs:', error);
    }
  };

  const handleConfigureIntegration = (integration: AvailableIntegration) => {
    setSelectedIntegration(integration);
    setIntegrationConfig({});
    setConfigStep(1);
    setShowConfigureModal(true);
  };

  const handleNextStep = () => {
    setConfigStep((prev) => prev + 1);
  };

  const handlePrevStep = () => {
    setConfigStep((prev) => Math.max(1, prev - 1));
  };

  const handleSaveIntegration = async () => {
    if (!selectedIntegration || !tenantId) return;

    setError('');
    setSuccess('');

    const payload = {
      type: selectedIntegration.type,
      name: selectedIntegration.name,
      config: integrationConfig,
    };

    try {
      await platformService.createIntegration({ ...payload, tenantId });
      setSuccess('Integration configured successfully');
      setShowConfigureModal(false);
      fetchIntegrations();
    } catch (error: any) {
      setError(error?.message || 'Failed to configure integration');
      console.error('Error configuring integration:', error);
    }
  };

  const handleTestConnection = async (integration: Integration) => {
    setSelectedActiveIntegration(integration);
    setTestResult('Testing connection...');
    setShowTestModal(true);

    try {
      const data = await platformService.testIntegration(integration.id, tenantId);
      setTestResult(`✅ Connection successful!\n\n${JSON.stringify(data, null, 2)}`);
    } catch (error: any) {
      setTestResult(`❌ Connection failed\n\n${error?.message || 'Unknown error'}`);
      console.error('Error testing connection:', error);
    }
  };

  const handleSyncNow = async (integrationId: string) => {
    setError('');
    setSuccess('');

    try {
      await platformService.syncIntegration(integrationId, tenantId);
      setSuccess('Sync started successfully');
      setTimeout(() => {
        fetchIntegrations();
        fetchSyncLogs();
      }, 1000);
    } catch (error: any) {
      setError(error?.message || 'Failed to start sync');
      console.error('Error starting sync:', error);
    }
  };

  const handleToggleIntegration = async (integration: Integration) => {
    try {
      await platformService.updateIntegration(integration.id, { isActive: !integration.isActive }, tenantId);
      setSuccess(`Integration ${integration.isActive ? 'disabled' : 'enabled'} successfully`);
      fetchIntegrations();
    } catch (error: any) {
      setError(error?.message || 'Failed to update integration status');
      console.error('Error updating integration status:', error);
    }
  };

  const handleDeleteIntegration = async (integrationId: string) => {
    if (!confirm('Are you sure you want to delete this integration?')) return;

    try {
      await platformService.deleteIntegration(integrationId, tenantId);
      setSuccess('Integration deleted successfully');
      fetchIntegrations();
    } catch (error: any) {
      setError(error?.message || 'Failed to delete integration');
      console.error('Error deleting integration:', error);
    }
  };

  const getStatusColor = (status: Integration['status']) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderConfigurationStep = () => {
    if (!selectedIntegration) return null;

    switch (selectedIntegration.type) {
      case 'ldap':
      case 'active-directory':
        return (
          <>
            {configStep === 1 && (
              <div className="space-y-4">
                <h3 className="font-medium">Connection Settings</h3>
                <div>
                  <label className="block text-sm font-medium mb-1">Server URL</label>
                  <input
                    type="text"
                    value={integrationConfig.serverUrl || ''}
                    onChange={(e) =>
                      setIntegrationConfig({ ...integrationConfig, serverUrl: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded"
                    placeholder="ldap://ldap.example.com:389"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Base DN</label>
                  <input
                    type="text"
                    value={integrationConfig.baseDN || ''}
                    onChange={(e) =>
                      setIntegrationConfig({ ...integrationConfig, baseDN: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded"
                    placeholder="dc=example,dc=com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Bind DN</label>
                  <input
                    type="text"
                    value={integrationConfig.bindDN || ''}
                    onChange={(e) =>
                      setIntegrationConfig({ ...integrationConfig, bindDN: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded"
                    placeholder="cn=admin,dc=example,dc=com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Password</label>
                  <input
                    type="password"
                    value={integrationConfig.password || ''}
                    onChange={(e) =>
                      setIntegrationConfig({ ...integrationConfig, password: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
              </div>
            )}
            {configStep === 2 && (
              <div className="space-y-4">
                <h3 className="font-medium">Sync Settings</h3>
                <div>
                  <label className="block text-sm font-medium mb-1">User Filter</label>
                  <input
                    type="text"
                    value={integrationConfig.userFilter || ''}
                    onChange={(e) =>
                      setIntegrationConfig({ ...integrationConfig, userFilter: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded"
                    placeholder="(objectClass=person)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Sync Interval (minutes)</label>
                  <input
                    type="number"
                    value={integrationConfig.syncInterval || 60}
                    onChange={(e) =>
                      setIntegrationConfig({
                        ...integrationConfig,
                        syncInterval: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={integrationConfig.autoSync || false}
                      onChange={(e) =>
                        setIntegrationConfig({ ...integrationConfig, autoSync: e.target.checked })
                      }
                      className="rounded"
                    />
                    <span className="text-sm">Enable automatic sync</span>
                  </label>
                </div>
              </div>
            )}
          </>
        );

      case 'okta':
      case 'azure-ad':
        return (
          <>
            {configStep === 1 && (
              <div className="space-y-4">
                <h3 className="font-medium">OAuth Settings</h3>
                <div>
                  <label className="block text-sm font-medium mb-1">Domain</label>
                  <input
                    type="text"
                    value={integrationConfig.domain || ''}
                    onChange={(e) =>
                      setIntegrationConfig({ ...integrationConfig, domain: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded"
                    placeholder={
                      selectedIntegration.type === 'okta'
                        ? 'example.okta.com'
                        : 'example.onmicrosoft.com'
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Client ID</label>
                  <input
                    type="text"
                    value={integrationConfig.clientId || ''}
                    onChange={(e) =>
                      setIntegrationConfig({ ...integrationConfig, clientId: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Client Secret</label>
                  <input
                    type="password"
                    value={integrationConfig.clientSecret || ''}
                    onChange={(e) =>
                      setIntegrationConfig({ ...integrationConfig, clientSecret: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
              </div>
            )}
            {configStep === 2 && (
              <div className="space-y-4">
                <h3 className="font-medium">SSO Configuration</h3>
                <div>
                  <label className="block text-sm font-medium mb-1">Authorization Endpoint</label>
                  <input
                    type="text"
                    value={integrationConfig.authEndpoint || ''}
                    onChange={(e) =>
                      setIntegrationConfig({ ...integrationConfig, authEndpoint: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Token Endpoint</label>
                  <input
                    type="text"
                    value={integrationConfig.tokenEndpoint || ''}
                    onChange={(e) =>
                      setIntegrationConfig({ ...integrationConfig, tokenEndpoint: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Scopes</label>
                  <input
                    type="text"
                    value={integrationConfig.scopes || ''}
                    onChange={(e) =>
                      setIntegrationConfig({ ...integrationConfig, scopes: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded"
                    placeholder="openid profile email"
                  />
                </div>
              </div>
            )}
          </>
        );

      default:
        return (
          <div className="space-y-4">
            <h3 className="font-medium">Configuration</h3>
            <p className="text-sm text-gray-600">
              Configuration for {selectedIntegration.name} will be available soon.
            </p>
          </div>
        );
    }
  };

  const categories = ['all', ...new Set(AVAILABLE_INTEGRATIONS.map((i) => i.category))];
  const filteredAvailableIntegrations = AVAILABLE_INTEGRATIONS.filter(
    (integration) => filterCategory === 'all' || integration.category === filterCategory
  );

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Integration Hub</h1>
        <button
          onClick={() => {
            setShowLogsModal(true);
          }}
          className="px-4 py-2 border rounded hover:bg-gray-50"
        >
          📋 View Sync Logs
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

      {/* Active Integrations */}
      {integrations.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Active Integrations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {integrations.map((integration) => (
              <div key={integration.id} className="bg-white rounded-lg shadow p-4 border">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-medium">{integration.name}</h3>
                    <p className="text-xs text-gray-500">{integration.type}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded ${getStatusColor(integration.status)}`}>
                    {integration.status}
                  </span>
                </div>

                {integration.lastSyncAt && (
                  <div className="text-sm text-gray-600 mb-2">
                    Last sync: {new Date(integration.lastSyncAt).toLocaleString()}
                  </div>
                )}

                {integration.syncedUsers !== undefined && (
                  <div className="text-sm text-gray-600 mb-2">
                    Synced users: {integration.syncedUsers}
                  </div>
                )}

                {integration.errorCount && integration.errorCount > 0 && (
                  <div className="text-sm text-red-600 mb-2">
                    Errors: {integration.errorCount}
                  </div>
                )}

                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => handleTestConnection(integration)}
                    className="text-xs px-2 py-1 border rounded hover:bg-gray-50"
                  >
                    Test
                  </button>
                  <button
                    onClick={() => handleSyncNow(integration.id)}
                    className="text-xs px-2 py-1 border rounded hover:bg-gray-50"
                  >
                    Sync Now
                  </button>
                  <button
                    onClick={() => handleToggleIntegration(integration)}
                    className={`text-xs px-2 py-1 rounded ${
                      integration.isActive
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {integration.isActive ? 'Disable' : 'Enable'}
                  </button>
                  <button
                    onClick={() => handleDeleteIntegration(integration.id)}
                    className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded hover:bg-red-200"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available Integrations */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Available Integrations</h2>

        {/* Category Filter */}
        <div className="flex gap-2 mb-4">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setFilterCategory(category)}
              className={`px-3 py-1 text-sm rounded ${
                filterCategory === category
                  ? 'bg-indigo-600 text-white'
                  : 'border hover:bg-gray-50'
              }`}
            >
              {category === 'all' ? 'All' : category}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAvailableIntegrations.map((integration) => (
            <div
              key={integration.id}
              className="bg-white rounded-lg shadow p-4 border hover:border-indigo-600 transition-colors"
            >
              <div className="flex items-start gap-3 mb-3">
                <span className="text-4xl">{integration.icon}</span>
                <div className="flex-1">
                  <h3 className="font-medium">{integration.name}</h3>
                  <p className="text-xs text-gray-500">{integration.category}</p>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-3">{integration.description}</p>

              <div className="mb-3">
                <p className="text-xs font-medium text-gray-700 mb-1">Features:</p>
                <div className="flex flex-wrap gap-1">
                  {integration.features.map((feature) => (
                    <span
                      key={feature}
                      className="text-xs bg-gray-100 px-2 py-1 rounded"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={() => handleConfigureIntegration(integration)}
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              >
                Configure
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Configure Integration Modal */}
      {showConfigureModal && selectedIntegration && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full">
            <h2 className="text-xl font-bold mb-4">
              Configure {selectedIntegration.name}
            </h2>

            {/* Progress Steps */}
            <div className="flex items-center justify-center mb-6">
              <div className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    configStep >= 1 ? 'bg-indigo-600 text-white' : 'bg-gray-200'
                  }`}
                >
                  1
                </div>
                <div className="w-16 h-1 bg-gray-200">
                  <div
                    className={`h-full ${configStep >= 2 ? 'bg-indigo-600' : ''}`}
                  />
                </div>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    configStep >= 2 ? 'bg-indigo-600 text-white' : 'bg-gray-200'
                  }`}
                >
                  2
                </div>
              </div>
            </div>

            {renderConfigurationStep()}

            <div className="flex gap-2 mt-6">
              {configStep > 1 && (
                <button
                  onClick={handlePrevStep}
                  className="px-4 py-2 border rounded hover:bg-gray-50"
                >
                  Previous
                </button>
              )}
              {configStep < 2 ? (
                <button
                  onClick={handleNextStep}
                  className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleSaveIntegration}
                  className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                >
                  Save & Activate
                </button>
              )}
              <button
                onClick={() => setShowConfigureModal(false)}
                className="px-4 py-2 border rounded hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Test Connection Modal */}
      {showTestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full">
            <h2 className="text-xl font-bold mb-4">Connection Test</h2>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-96 whitespace-pre-wrap">
              {testResult}
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

      {/* Sync Logs Modal */}
      {showLogsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Sync Logs</h2>
            <div className="space-y-2">
              {syncLogs.map((log) => (
                <div
                  key={log.id}
                  className={`border rounded p-3 ${
                    log.status === 'success' ? 'bg-green-50' : 'bg-red-50'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium">
                      {integrations.find((i) => i.id === log.integrationId)?.name || 'Unknown'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm">{log.message}</p>
                  <div className="text-xs text-gray-600 mt-1">
                    Users processed: {log.usersProcessed} | Errors: {log.errors}
                  </div>
                </div>
              ))}
              {syncLogs.length === 0 && (
                <p className="text-gray-500">No sync logs available</p>
              )}
            </div>
            <button
              onClick={() => setShowLogsModal(false)}
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
