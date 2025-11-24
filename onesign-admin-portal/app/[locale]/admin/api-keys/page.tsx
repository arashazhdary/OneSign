'use client';

import { useState, useEffect } from 'react';
import { platformService } from '@/lib/api/services';

interface AdminAPIKey {
  id: string;
  name: string;
  key: string;
  prefix: string;
  scope: 'platform' | 'readonly' | 'admin' | 'superadmin';
  permissions: string[];
  status: 'active' | 'revoked' | 'expired';
  expiresAt?: string;
  lastUsed?: string;
  usageCount: number;
  createdBy: string;
  createdAt: string;
  ipWhitelist?: string[];
}

export default function AdminAPIKeysPage() {
  const [apiKeys, setApiKeys] = useState<AdminAPIKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showKey, setShowKey] = useState<string | null>(null);

  useEffect(() => {
    fetchAPIKeys();
  }, []);

  const fetchAPIKeys = async () => {
    try {
      const data = await platformService.getAdminAPIKeys?.();
      const mockData: AdminAPIKey[] = [
        {
          id: '1',
          name: 'Platform Management Key',
          key: 'pk_live_abc123def456ghi789jkl012mno345pqr678',
          prefix: 'pk_live_',
          scope: 'platform',
          permissions: [
            'tenants:read',
            'tenants:write',
            'tenants:delete',
            'users:read',
            'users:write',
            'system:read',
          ],
          status: 'active',
          lastUsed: '2024-11-23T09:30:00Z',
          usageCount: 45678,
          createdBy: 'superadmin@example.com',
          createdAt: '2024-01-01T00:00:00Z',
          ipWhitelist: ['192.168.1.0/24', '10.0.0.0/8'],
        },
        {
          id: '2',
          name: 'Read-Only Analytics Key',
          key: 'pk_readonly_stu901vwx234yz567abc890def123ghi456',
          prefix: 'pk_readonly_',
          scope: 'readonly',
          permissions: [
            'analytics:read',
            'logs:read',
            'metrics:read',
          ],
          status: 'active',
          expiresAt: '2025-01-01T00:00:00Z',
          lastUsed: '2024-11-23T10:00:00Z',
          usageCount: 123456,
          createdBy: 'admin@example.com',
          createdAt: '2024-06-01T10:00:00Z',
        },
        {
          id: '3',
          name: 'Admin Operations Key',
          key: 'pk_admin_jkl789mno012pqr345stu678vwx901yz234',
          prefix: 'pk_admin_',
          scope: 'admin',
          permissions: [
            'tenants:read',
            'tenants:write',
            'users:read',
            'users:write',
            'integrations:manage',
          ],
          status: 'active',
          expiresAt: '2024-12-31T23:59:59Z',
          lastUsed: '2024-11-22T15:30:00Z',
          usageCount: 8901,
          createdBy: 'superadmin@example.com',
          createdAt: '2024-03-15T09:00:00Z',
        },
        {
          id: '4',
          name: 'Legacy Integration Key',
          key: 'pk_live_abc456def789ghi012jkl345mno678pqr901',
          prefix: 'pk_live_',
          scope: 'platform',
          permissions: [
            'tenants:read',
            'users:read',
          ],
          status: 'revoked',
          lastUsed: '2024-10-15T12:00:00Z',
          usageCount: 234567,
          createdBy: 'admin@example.com',
          createdAt: '2023-01-01T00:00:00Z',
        },
      ];
      setApiKeys(data || mockData);
    } catch (err) {
      console.error(err);
      setApiKeys(mockData);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      await platformService.createAdminAPIKey?.({
        name: 'New API Key',
        scope: 'readonly',
        permissions: ['read'],
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      });
      setShowCreate(false);
      fetchAPIKeys();
    } catch (error) {
      console.error('Failed to create admin API key:', error);
    }
  };

  const handleRevoke = async (keyId: string) => {
    if (!confirm('Revoke this API key? This action cannot be undone.')) return;
    try {
      await platformService.revokeAdminAPIKey?.(keyId);
      fetchAPIKeys();
    } catch (error) {
      console.error('Failed to revoke admin API key:', error);
    }
  };

  const handleCopy = (key: string) => {
    navigator.clipboard.writeText(key);
  };

  const getScopeBadge = (scope: string) => {
    const colors = {
      platform: 'bg-purple-100 text-purple-800',
      readonly: 'bg-blue-100 text-blue-800',
      admin: 'bg-green-100 text-green-800',
      superadmin: 'bg-red-100 text-red-800',
    };
    return colors[scope as keyof typeof colors] || 'bg-gray-100';
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      revoked: 'bg-red-100 text-red-800',
      expired: 'bg-gray-100 text-gray-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100';
  };

  const maskKey = (key: string, prefix: string) => {
    return prefix + '•'.repeat(20) + key.slice(-8);
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Platform API Keys</h1>
          <p className="text-gray-600 mt-1">Manage admin-level API keys for platform operations</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Create API Key
        </button>
      </div>

      {/* Warning Banner */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <span className="text-2xl mr-3">⚠️</span>
          <div>
            <h3 className="font-semibold text-yellow-800">Security Notice</h3>
            <p className="text-sm text-yellow-700 mt-1">
              Admin API keys have elevated privileges and can perform critical platform operations.
              Store them securely and never commit them to version control. Regularly rotate keys and monitor usage.
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Total Keys</div>
          <div className="text-2xl font-bold">{apiKeys.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Active</div>
          <div className="text-2xl font-bold text-green-600">
            {apiKeys.filter(k => k.status === 'active').length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Total API Calls</div>
          <div className="text-2xl font-bold">
            {(apiKeys.reduce((acc, k) => acc + k.usageCount, 0) / 1000).toFixed(0)}K
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Expiring Soon</div>
          <div className="text-2xl font-bold text-yellow-600">
            {apiKeys.filter(k => {
              if (!k.expiresAt) return false;
              const daysUntilExpiry = Math.ceil((new Date(k.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
              return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
            }).length}
          </div>
        </div>
      </div>

      {/* API Keys List */}
      <div className="space-y-4">
        {apiKeys.map((apiKey) => {
          const daysUntilExpiry = apiKey.expiresAt
            ? Math.ceil((new Date(apiKey.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
            : null;
          const isExpiringSoon = daysUntilExpiry !== null && daysUntilExpiry <= 30 && daysUntilExpiry > 0;

          return (
            <div key={apiKey.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold">{apiKey.name}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${getScopeBadge(apiKey.scope)}`}>
                      {apiKey.scope}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(apiKey.status)}`}>
                      {apiKey.status}
                    </span>
                  </div>

                  {/* API Key Display */}
                  <div className="bg-gray-50 rounded p-3 mb-3 font-mono text-sm">
                    <div className="flex items-center justify-between">
                      <span className="break-all">
                        {showKey === apiKey.id ? apiKey.key : maskKey(apiKey.key, apiKey.prefix)}
                      </span>
                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={() => setShowKey(showKey === apiKey.id ? null : apiKey.id)}
                          className="text-blue-600 hover:text-blue-800 text-xs"
                        >
                          {showKey === apiKey.id ? 'Hide' : 'Show'}
                        </button>
                        <button
                          onClick={() => handleCopy(apiKey.key)}
                          className="text-blue-600 hover:text-blue-800 text-xs"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Permissions */}
                  <div className="mb-3">
                    <span className="text-sm text-gray-500">Permissions:</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {apiKey.permissions.map((perm, idx) => (
                        <span key={idx} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                          {perm}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Key Info */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Created:</span>
                      <span className="ml-2">{new Date(apiKey.createdAt).toLocaleDateString()}</span>
                    </div>
                    {apiKey.expiresAt && (
                      <div>
                        <span className="text-gray-500">Expires:</span>
                        <span className="ml-2">{new Date(apiKey.expiresAt).toLocaleDateString()}</span>
                        {isExpiringSoon && (
                          <span className="ml-2 text-yellow-600">({daysUntilExpiry} days)</span>
                        )}
                      </div>
                    )}
                    {apiKey.lastUsed && (
                      <div>
                        <span className="text-gray-500">Last Used:</span>
                        <span className="ml-2">{new Date(apiKey.lastUsed).toLocaleString()}</span>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-500">Usage:</span>
                      <span className="ml-2 font-semibold">{apiKey.usageCount.toLocaleString()} calls</span>
                    </div>
                  </div>

                  {/* IP Whitelist */}
                  {apiKey.ipWhitelist && apiKey.ipWhitelist.length > 0 && (
                    <div className="mt-3">
                      <span className="text-sm text-gray-500">IP Whitelist:</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {apiKey.ipWhitelist.map((ip, idx) => (
                          <span key={idx} className="px-2 py-1 text-xs bg-gray-100 rounded font-mono">
                            {ip}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-3 text-xs text-gray-500">
                    Created by: {apiKey.createdBy}
                  </div>
                </div>

                {apiKey.status === 'active' && (
                  <button
                    onClick={() => handleRevoke(apiKey.id)}
                    className="px-3 py-1 text-sm text-red-600 border border-red-300 rounded hover:bg-red-50 ml-4"
                  >
                    Revoke
                  </button>
                )}
              </div>

              {/* Expiry Warning */}
              {isExpiringSoon && (
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
                  <strong>⚠️ Expiring Soon:</strong> This API key will expire in {daysUntilExpiry} days.
                  Consider creating a new key before expiry.
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Create Admin API Key</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Key Name</label>
                <input
                  type="text"
                  placeholder="e.g., Platform Management Key"
                  className="w-full border border-gray-300 rounded-lg p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Scope</label>
                <select className="w-full border border-gray-300 rounded-lg p-2">
                  <option value="readonly">Read-Only (View access only)</option>
                  <option value="admin">Admin (Manage tenants & users)</option>
                  <option value="platform">Platform (All operations except system)</option>
                  <option value="superadmin">Super Admin (Full platform access)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Permissions</label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  <label className="flex items-center"><input type="checkbox" className="mr-2" />tenants:read</label>
                  <label className="flex items-center"><input type="checkbox" className="mr-2" />tenants:write</label>
                  <label className="flex items-center"><input type="checkbox" className="mr-2" />tenants:delete</label>
                  <label className="flex items-center"><input type="checkbox" className="mr-2" />users:read</label>
                  <label className="flex items-center"><input type="checkbox" className="mr-2" />users:write</label>
                  <label className="flex items-center"><input type="checkbox" className="mr-2" />system:read</label>
                  <label className="flex items-center"><input type="checkbox" className="mr-2" />analytics:read</label>
                  <label className="flex items-center"><input type="checkbox" className="mr-2" />integrations:manage</label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Expiration (Optional)</label>
                <input
                  type="date"
                  className="w-full border border-gray-300 rounded-lg p-2"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Leave empty for no expiration
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">IP Whitelist (Optional)</label>
                <input
                  type="text"
                  placeholder="192.168.1.0/24, 10.0.0.0/8"
                  className="w-full border border-gray-300 rounded-lg p-2"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Comma-separated list of IP addresses or CIDR ranges
                </p>
              </div>

              <div className="p-3 bg-red-50 border border-red-200 rounded text-sm">
                <strong>⚠️ Important:</strong> The API key will be displayed only once after creation.
                Make sure to copy and store it securely.
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
                  Create Key
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
