import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { getTenantId } from '@/lib/tenant-context';
import { usersService } from '@/lib/api/services/users.service';
import { platformService } from '@/lib/api/services/platform.service';
import { Helmet } from 'react-helmet-async';

interface ServiceAccount {
  id: string;
  tenantId: string;
  name: string;
  description: string;
  clientId: string;
  status: 'Active' | 'Disabled' | 'Suspended';
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  lastUsedAt: string | null;
  permissions: string[];
  secrets: ServiceAccountSecret[];
}

interface ServiceAccountSecret {
  id: string;
  name: string;
  hint: string;
  createdAt: string;
  expiresAt: string | null;
  lastUsedAt: string | null;
  isActive: boolean;
}

interface ApiUsageStats {
  totalCalls: number;
  callsToday: number;
  callsThisWeek: number;
  callsThisMonth: number;
  rateLimit: number;
  rateLimitRemaining: number;
  rateLimitReset: string;
  topEndpoints: EndpointStat[];
  dailyUsage: DailyUsage[];
}

interface EndpointStat {
  endpoint: string;
  method: string;
  calls: number;
  avgResponseTime: number;
}

interface DailyUsage {
  date: string;
  calls: number;
  errors: number;
}

interface AuditEntry {
  id: string;
  timestamp: string;
  action: string;
  actor: string;
  ipAddress: string;
  userAgent: string;
  details: string;
  status: 'Success' | 'Failed';
}

type Tab = 'overview' | 'credentials' | 'usage' | 'permissions' | 'audit';

export default function TenantServiceAccountsDetailPage() {
  const params = useParams();
  const navigate = useNavigate();
  const accountId = params.id as string;
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Data states
  const [account, setAccount] = useState<ServiceAccount | null>(null);
  const [usageStats, setUsageStats] = useState<ApiUsageStats | null>(null);
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);

  // Modal states
  const [showGenerateSecretModal, setShowGenerateSecretModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRevokeSecretModal, setShowRevokeSecretModal] = useState(false);
  const [selectedSecret, setSelectedSecret] = useState<ServiceAccountSecret | null>(null);
  const [newSecretValue, setNewSecretValue] = useState('');

  // Form states
  const [secretName, setSecretName] = useState('');
  const [secretExpiry, setSecretExpiry] = useState('90');

  const tenantId = getTenantId();

  useEffect(() => {
    fetchServiceAccount();
  }, [accountId]);

  useEffect(() => {
    if (activeTab === 'usage') {
      fetchUsageStats();
    } else if (activeTab === 'audit') {
      fetchAuditLog();
    }
  }, [activeTab]);

  const fetchServiceAccount = async () => {
    setLoading(true);
    setError('');
    try {
      // Mock data - replace with actual API call
      const mockData: ServiceAccount = {
        id: accountId,
        tenantId: tenantId || '',
        name: 'Production API Service',
        description: 'Service account for production API access',
        clientId: 'sa_' + accountId.substring(0, 24),
        status: 'Active',
        createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'admin@example.com',
        lastUsedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        permissions: ['api:read', 'api:write', 'users:read', 'workflows:execute'],
        secrets: [
          {
            id: '1',
            name: 'Primary Secret',
            hint: '****abc123',
            createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            lastUsedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            isActive: true,
          },
          {
            id: '2',
            name: 'Backup Secret',
            hint: '****xyz789',
            createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
            lastUsedAt: null,
            isActive: true,
          },
        ],
      };
      setAccount(mockData);
    } catch (err) {
      setError('Failed to load service account');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsageStats = async () => {
    try {
      // Mock data - replace with actual API call
      const mockStats: ApiUsageStats = {
        totalCalls: 125847,
        callsToday: 3421,
        callsThisWeek: 24563,
        callsThisMonth: 98234,
        rateLimit: 10000,
        rateLimitRemaining: 7234,
        rateLimitReset: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        topEndpoints: [
          { endpoint: '/api/tenant/users', method: 'GET', calls: 5234, avgResponseTime: 145 },
          { endpoint: '/api/tenant/workflows', method: 'POST', calls: 3421, avgResponseTime: 267 },
          { endpoint: '/api/tenant/automation/executions', method: 'GET', calls: 2145, avgResponseTime: 98 },
          { endpoint: '/api/tenant/audit', method: 'GET', calls: 1876, avgResponseTime: 234 },
        ],
        dailyUsage: Array.from({ length: 7 }, (_, i) => ({
          date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          calls: Math.floor(Math.random() * 5000) + 2000,
          errors: Math.floor(Math.random() * 50),
        })),
      };
      setUsageStats(mockStats);
    } catch (err) {
      console.error('Failed to fetch usage stats:', err);
    }
  };

  const fetchAuditLog = async () => {
    try {
      // Mock data - replace with actual API call
      const mockAudit: AuditEntry[] = [
        {
          id: '1',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          action: 'API Call',
          actor: 'Service Account',
          ipAddress: '203.0.113.42',
          userAgent: 'OneSign-SDK/1.0',
          details: 'GET /api/tenant/users',
          status: 'Success',
        },
        {
          id: '2',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          action: 'Secret Rotated',
          actor: 'admin@example.com',
          ipAddress: '198.51.100.10',
          userAgent: 'Mozilla/5.0',
          details: 'Generated new secret: Primary Secret',
          status: 'Success',
        },
        {
          id: '3',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          action: 'Permissions Updated',
          actor: 'admin@example.com',
          ipAddress: '198.51.100.10',
          userAgent: 'Mozilla/5.0',
          details: 'Added permission: workflows:execute',
          status: 'Success',
        },
      ];
      setAuditLog(mockAudit);
    } catch (err) {
      console.error('Failed to fetch audit log:', err);
    }
  };

  const handleGenerateSecret = async () => {
    setProcessing(true);
    setError('');
    setSuccess('');
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Generate mock secret
      const generatedSecret = 'sk_' + Array.from({ length: 32 }, () =>
        'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'[Math.floor(Math.random() * 62)]
      ).join('');

      setNewSecretValue(generatedSecret);
      setSuccess('Secret generated successfully. Copy it now - you won\'t be able to see it again!');

      // Refresh account data
      setTimeout(() => {
        fetchServiceAccount();
      }, 2000);
    } catch (err) {
      setError('Failed to generate secret');
    } finally {
      setProcessing(false);
    }
  };

  const handleRevokeSecret = async () => {
    if (!selectedSecret) return;

    setProcessing(true);
    setError('');
    setSuccess('');
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSuccess(`Secret "${selectedSecret.name}" revoked successfully`);
      setShowRevokeSecretModal(false);
      setSelectedSecret(null);
      fetchServiceAccount();
    } catch (err) {
      setError('Failed to revoke secret');
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteAccount = async () => {
    setProcessing(true);
    setError('');
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      navigate('/tenant/service-accounts');
    } catch (err) {
      setError('Failed to delete service account');
      setProcessing(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatRelativeDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return `Expired ${Math.abs(diffDays)} days ago`;
    if (diffDays === 0) return 'Expires today';
    if (diffDays === 1) return 'Expires tomorrow';
    return `Expires in ${diffDays} days`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'green';
      case 'Disabled': return 'gray';
      case 'Suspended': return 'red';
      default: return 'gray';
    }
  };

  if (loading) {
    return <div className="p-8">{t('common.loading')}</div>;
  }

  if (!account) {
    return <div className="p-8">Service account not found</div>;
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <button
              onClick={() => navigate(-1)}
              className="text-indigo-600 hover:text-indigo-900 mb-2 flex items-center gap-2"
            >
              ← Back
            </button>
            <h1 className="text-3xl font-bold text-gray-900">{account.name}</h1>
            <p className="mt-2 text-gray-600">{account.description}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded text-sm bg-${getStatusColor(account.status)}-100 text-${getStatusColor(account.status)}-800`}>
              {account.status}
            </span>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>

      {/* Alerts */}
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

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {(['overview', 'credentials', 'usage', 'permissions', 'audit'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                activeTab === tab
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white shadow rounded-lg p-6">
              <div className="text-sm text-gray-500">Client ID</div>
              <div className="mt-2 font-mono text-sm text-gray-900 break-all">{account.clientId}</div>
            </div>
            <div className="bg-white shadow rounded-lg p-6">
              <div className="text-sm text-gray-500">Created</div>
              <div className="mt-2 text-gray-900">{formatDate(account.createdAt)}</div>
              <div className="text-xs text-gray-500 mt-1">by {account.createdBy}</div>
            </div>
            <div className="bg-white shadow rounded-lg p-6">
              <div className="text-sm text-gray-500">Last Used</div>
              <div className="mt-2 text-gray-900">
                {account.lastUsedAt ? formatDate(account.lastUsedAt) : 'Never'}
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Active Secrets</h2>
            <div className="space-y-3">
              {account.secrets.filter(s => s.isActive).map((secret) => (
                <div key={secret.id} className="flex justify-between items-center p-3 border border-gray-200 rounded">
                  <div>
                    <div className="font-medium text-gray-900">{secret.name}</div>
                    <div className="text-sm text-gray-500">
                      {secret.expiresAt ? formatRelativeDate(secret.expiresAt) : 'No expiration'}
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    Last used: {secret.lastUsedAt ? formatDate(secret.lastUsedAt) : 'Never'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-2xl font-bold text-gray-900">{account.secrets.length}</div>
                <div className="text-sm text-gray-500">Total Secrets</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{account.permissions.length}</div>
                <div className="text-sm text-gray-500">Permissions</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {account.secrets.filter(s => s.isActive).length}
                </div>
                <div className="text-sm text-gray-500">Active Secrets</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{account.status}</div>
                <div className="text-sm text-gray-500">Status</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Credentials Tab */}
      {activeTab === 'credentials' && (
        <div className="space-y-6">
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">API Secrets</h2>
                <p className="text-sm text-gray-500">Manage authentication secrets for this service account</p>
              </div>
              <button
                onClick={() => setShowGenerateSecretModal(true)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
              >
                Generate New Secret
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {account.secrets.map((secret) => (
                  <div key={secret.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-medium text-gray-900">{secret.name}</h3>
                          <span className={`px-2 py-1 text-xs rounded ${
                            secret.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {secret.isActive ? 'Active' : 'Revoked'}
                          </span>
                        </div>
                        <div className="mt-2 space-y-1 text-sm text-gray-600">
                          <div>Secret: <span className="font-mono">{secret.hint}</span></div>
                          <div>Created: {formatDate(secret.createdAt)}</div>
                          {secret.expiresAt && (
                            <div className={`${new Date(secret.expiresAt) < new Date() ? 'text-red-600' : ''}`}>
                              {formatRelativeDate(secret.expiresAt)}
                            </div>
                          )}
                          {secret.lastUsedAt && (
                            <div>Last used: {formatDate(secret.lastUsedAt)}</div>
                          )}
                        </div>
                      </div>
                      {secret.isActive && (
                        <button
                          onClick={() => {
                            setSelectedSecret(secret);
                            setShowRevokeSecretModal(true);
                          }}
                          className="text-red-600 hover:text-red-900 text-sm"
                        >
                          Revoke
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Client ID</h2>
            <div className="bg-gray-50 border border-gray-200 rounded p-4">
              <div className="flex justify-between items-center">
                <code className="text-sm font-mono text-gray-900">{account.clientId}</code>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(account.clientId);
                    setSuccess('Client ID copied to clipboard');
                    setTimeout(() => setSuccess(''), 3000);
                  }}
                  className="text-indigo-600 hover:text-indigo-900 text-sm"
                >
                  Copy
                </button>
              </div>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Use this Client ID along with a secret to authenticate API requests
            </p>
          </div>
        </div>
      )}

      {/* Usage Tab */}
      {activeTab === 'usage' && usageStats && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white shadow rounded-lg p-4">
              <div className="text-sm text-gray-500">Today</div>
              <div className="text-2xl font-bold text-gray-900">{usageStats.callsToday.toLocaleString()}</div>
            </div>
            <div className="bg-white shadow rounded-lg p-4">
              <div className="text-sm text-gray-500">This Week</div>
              <div className="text-2xl font-bold text-gray-900">{usageStats.callsThisWeek.toLocaleString()}</div>
            </div>
            <div className="bg-white shadow rounded-lg p-4">
              <div className="text-sm text-gray-500">This Month</div>
              <div className="text-2xl font-bold text-gray-900">{usageStats.callsThisMonth.toLocaleString()}</div>
            </div>
            <div className="bg-white shadow rounded-lg p-4">
              <div className="text-sm text-gray-500">Total Calls</div>
              <div className="text-2xl font-bold text-gray-900">{usageStats.totalCalls.toLocaleString()}</div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Rate Limits</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Current Usage</span>
                  <span className="font-medium">
                    {usageStats.rateLimitRemaining.toLocaleString()} / {usageStats.rateLimit.toLocaleString()} remaining
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-indigo-600 h-2 rounded-full"
                    style={{ width: `${(usageStats.rateLimitRemaining / usageStats.rateLimit) * 100}%` }}
                  />
                </div>
              </div>
              <div className="text-sm text-gray-500">
                Resets at: {formatDate(usageStats.rateLimitReset)}
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Last 7 Days</h2>
            <div className="space-y-2">
              {usageStats.dailyUsage.map((day) => (
                <div key={day.date} className="flex items-center gap-4">
                  <div className="w-24 text-sm text-gray-600">{day.date}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-6">
                        <div
                          className="bg-indigo-600 h-6 rounded-full flex items-center justify-end px-2"
                          style={{ width: `${(day.calls / 5000) * 100}%` }}
                        >
                          <span className="text-xs text-white">{day.calls}</span>
                        </div>
                      </div>
                      {day.errors > 0 && (
                        <span className="text-xs text-red-600">{day.errors} errors</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Top Endpoints</h2>
            </div>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Endpoint</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Calls</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg Response</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {usageStats.topEndpoints.map((endpoint, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 text-sm font-mono text-gray-900">{endpoint.endpoint}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded ${
                        endpoint.method === 'GET' ? 'bg-blue-100 text-blue-800' :
                        endpoint.method === 'POST' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {endpoint.method}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{endpoint.calls.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{endpoint.avgResponseTime}ms</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Permissions Tab */}
      {activeTab === 'permissions' && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Assigned Permissions</h2>
            <p className="text-sm text-gray-500">Scopes and permissions granted to this service account</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {account.permissions.map((permission) => (
              <div key={permission} className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm text-gray-900">{permission}</span>
                  <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6">
            <button className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
              Manage Permissions
            </button>
          </div>
        </div>
      )}

      {/* Audit Tab */}
      {activeTab === 'audit' && (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Audit Trail</h2>
            <p className="text-sm text-gray-500">Activity history for this service account</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP Address</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {auditLog.map((entry) => (
                  <tr key={entry.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(entry.timestamp)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.action}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.actor}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">{entry.ipAddress}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{entry.details}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded ${
                        entry.status === 'Success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {entry.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Generate Secret Modal */}
      {showGenerateSecretModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold">Generate New Secret</h2>
            </div>
            <div className="p-6 space-y-4">
              {newSecretValue ? (
                <div>
                  <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
                    <p className="text-sm text-yellow-800">
                      Make sure to copy your secret now. You won't be able to see it again!
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Your New Secret</label>
                    <div className="bg-gray-50 border border-gray-200 rounded p-4">
                      <code className="text-sm font-mono text-gray-900 break-all">{newSecretValue}</code>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(newSecretValue);
                        setSuccess('Secret copied to clipboard');
                      }}
                      className="mt-2 text-indigo-600 hover:text-indigo-900 text-sm"
                    >
                      Copy to Clipboard
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={(e) => { e.preventDefault(); handleGenerateSecret(); }}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Secret Name</label>
                      <input
                        type="text"
                        required
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                        value={secretName}
                        onChange={(e) => setSecretName(e.target.value)}
                        placeholder="e.g., Production Secret"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Expiration (days)</label>
                      <select
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                        value={secretExpiry}
                        onChange={(e) => setSecretExpiry(e.target.value)}
                      >
                        <option value="30">30 days</option>
                        <option value="60">60 days</option>
                        <option value="90">90 days</option>
                        <option value="180">180 days</option>
                        <option value="365">1 year</option>
                        <option value="0">No expiration</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-6 flex gap-3">
                    <button
                      type="submit"
                      disabled={processing}
                      className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                    >
                      {processing ? 'Generating...' : 'Generate Secret'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowGenerateSecretModal(false);
                        setNewSecretValue('');
                        setSecretName('');
                      }}
                      className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                    >
                      {newSecretValue ? 'Close' : 'Cancel'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Revoke Secret Modal */}
      {showRevokeSecretModal && selectedSecret && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold">Revoke Secret</h2>
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                Are you sure you want to revoke the secret "{selectedSecret.name}"? This action cannot be undone and
                any applications using this secret will no longer be able to authenticate.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleRevokeSecret}
                  disabled={processing}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  {processing ? 'Revoking...' : 'Revoke Secret'}
                </button>
                <button
                  onClick={() => {
                    setShowRevokeSecretModal(false);
                    setSelectedSecret(null);
                  }}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold">Delete Service Account</h2>
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                Are you sure you want to delete this service account? This action cannot be undone and will
                immediately revoke all associated secrets and permissions.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleDeleteAccount}
                  disabled={processing}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  {processing ? 'Deleting...' : 'Delete Account'}
                </button>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
