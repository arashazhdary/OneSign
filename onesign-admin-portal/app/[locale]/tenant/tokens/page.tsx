'use client';

import { useState, useEffect } from 'react';
import { platformService } from '@/lib/api/services';

interface Token {
  id: string;
  name: string;
  type: 'access' | 'refresh' | 'api_key';
  token: string;
  prefix: string;
  permissions: string[];
  status: 'active' | 'expired' | 'revoked';
  expiresAt?: string;
  lastUsed?: string;
  usageCount: number;
  createdBy: string;
  createdAt: string;
  ipWhitelist?: string[];
}

export default function TokensPage() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showToken, setShowToken] = useState<string | null>(null);
  const [filterType, setFilterType] = useState('');

  useEffect(() => {
    fetchTokens();
  }, []);

  const fetchTokens = async () => {
    try {
      // Mock data
      setTokens([
        {
          id: '1',
          name: 'Production API Key',
          type: 'api_key',
          token: 'os_prod_abc123def456ghi789jkl012mno345',
          prefix: 'os_prod_',
          permissions: ['read', 'write', 'delete'],
          status: 'active',
          lastUsed: '2024-11-23T09:30:00Z',
          usageCount: 15234,
          createdBy: 'admin@example.com',
          createdAt: '2024-01-15T10:00:00Z',
          ipWhitelist: ['192.168.1.0/24', '10.0.0.0/16'],
        },
        {
          id: '2',
          name: 'Development Access Token',
          type: 'access',
          token: 'os_dev_pqr678stu901vwx234yz567abc890',
          prefix: 'os_dev_',
          permissions: ['read', 'write'],
          status: 'active',
          expiresAt: '2024-12-31T23:59:59Z',
          lastUsed: '2024-11-23T08:15:00Z',
          usageCount: 4521,
          createdBy: 'developer@example.com',
          createdAt: '2024-06-01T09:00:00Z',
        },
        {
          id: '3',
          name: 'CI/CD Pipeline Token',
          type: 'api_key',
          token: 'os_ci_def123ghi456jkl789mno012pqr345',
          prefix: 'os_ci_',
          permissions: ['read', 'write'],
          status: 'active',
          lastUsed: '2024-11-23T10:00:00Z',
          usageCount: 28965,
          createdBy: 'system',
          createdAt: '2024-03-10T14:00:00Z',
        },
        {
          id: '4',
          name: 'Old Integration Token',
          type: 'access',
          token: 'os_int_stu901vwx234yz567abc890def123',
          prefix: 'os_int_',
          permissions: ['read'],
          status: 'revoked',
          expiresAt: '2024-10-31T23:59:59Z',
          lastUsed: '2024-10-25T12:00:00Z',
          usageCount: 8742,
          createdBy: 'admin@example.com',
          createdAt: '2024-01-01T00:00:00Z',
        },
        {
          id: '5',
          name: 'Monitoring Service Token',
          type: 'refresh',
          token: 'os_mon_ghi456jkl789mno012pqr345stu678',
          prefix: 'os_mon_',
          permissions: ['read'],
          status: 'active',
          expiresAt: '2025-11-23T00:00:00Z',
          lastUsed: '2024-11-23T10:05:00Z',
          usageCount: 125678,
          createdBy: 'system',
          createdAt: '2023-11-23T10:00:00Z',
        },
      ]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    // await platformService.createToken(tenantId, { name, type, permissions });
    setShowCreate(false);
    fetchTokens();
  };

  const handleRevoke = async (tokenId: string) => {
    if (!confirm('Revoke this token? This action cannot be undone.')) return;
    // await platformService.revokeToken(tenantId, tokenId);
    fetchTokens();
  };

  const handleRotate = async (tokenId: string) => {
    if (!confirm('Rotate this token? The old token will be invalidated.')) return;
    // await platformService.rotateToken(tenantId, tokenId);
    fetchTokens();
  };

  const handleCopy = (token: string) => {
    navigator.clipboard.writeText(token);
  };

  const getTypeBadge = (type: string) => {
    const colors = {
      access: 'bg-blue-100 text-blue-800',
      refresh: 'bg-purple-100 text-purple-800',
      api_key: 'bg-green-100 text-green-800',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100';
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      expired: 'bg-red-100 text-red-800',
      revoked: 'bg-gray-100 text-gray-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100';
  };

  const maskToken = (token: string, prefix: string) => {
    return prefix + '•'.repeat(20) + token.slice(-8);
  };

  const filteredTokens = filterType
    ? tokens.filter(t => t.type === filterType)
    : tokens;

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Access Tokens</h1>
          <p className="text-gray-600 mt-1">Manage API keys and access tokens</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Create Token
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Total Tokens</div>
          <div className="text-2xl font-bold">{tokens.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Active</div>
          <div className="text-2xl font-bold text-green-600">
            {tokens.filter(t => t.status === 'active').length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Revoked</div>
          <div className="text-2xl font-bold text-gray-600">
            {tokens.filter(t => t.status === 'revoked').length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Total API Calls</div>
          <div className="text-2xl font-bold">
            {tokens.reduce((acc, t) => acc + t.usageCount, 0).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <div className="flex space-x-4">
          <div>
            <label className="block text-sm font-medium mb-2">Filter by Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="">All Types</option>
              <option value="api_key">API Key</option>
              <option value="access">Access Token</option>
              <option value="refresh">Refresh Token</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tokens List */}
      <div className="space-y-4">
        {filteredTokens.map((token) => (
          <div key={token.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold">{token.name}</h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${getTypeBadge(token.type)}`}>
                    {token.type.replace('_', ' ')}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(token.status)}`}>
                    {token.status}
                  </span>
                </div>

                {/* Token Display */}
                <div className="bg-gray-50 rounded p-3 mb-3 font-mono text-sm">
                  <div className="flex items-center justify-between">
                    <span className="break-all">
                      {showToken === token.id ? token.token : maskToken(token.token, token.prefix)}
                    </span>
                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => setShowToken(showToken === token.id ? null : token.id)}
                        className="text-blue-600 hover:text-blue-800 text-xs"
                      >
                        {showToken === token.id ? 'Hide' : 'Show'}
                      </button>
                      <button
                        onClick={() => handleCopy(token.token)}
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
                    {token.permissions.map((perm, idx) => (
                      <span key={idx} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                        {perm}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Token Info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Created:</span>
                    <span className="ml-2">{new Date(token.createdAt).toLocaleDateString()}</span>
                  </div>
                  {token.expiresAt && (
                    <div>
                      <span className="text-gray-500">Expires:</span>
                      <span className="ml-2">{new Date(token.expiresAt).toLocaleDateString()}</span>
                    </div>
                  )}
                  {token.lastUsed && (
                    <div>
                      <span className="text-gray-500">Last Used:</span>
                      <span className="ml-2">{new Date(token.lastUsed).toLocaleString()}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-500">Usage:</span>
                    <span className="ml-2 font-semibold">{token.usageCount.toLocaleString()} calls</span>
                  </div>
                </div>

                {/* IP Whitelist */}
                {token.ipWhitelist && token.ipWhitelist.length > 0 && (
                  <div className="mt-3">
                    <span className="text-sm text-gray-500">IP Whitelist:</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {token.ipWhitelist.map((ip, idx) => (
                        <span key={idx} className="px-2 py-1 text-xs bg-gray-100 rounded font-mono">
                          {ip}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {token.status === 'active' && (
                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => handleRotate(token.id)}
                    className="px-3 py-1 text-sm border border-blue-300 text-blue-600 rounded hover:bg-blue-50"
                  >
                    Rotate
                  </button>
                  <button
                    onClick={() => handleRevoke(token.id)}
                    className="px-3 py-1 text-sm text-red-600 border border-red-300 rounded hover:bg-red-50"
                  >
                    Revoke
                  </button>
                </div>
              )}
            </div>

            {/* Expiry Warning */}
            {token.expiresAt && token.status === 'active' && (
              (() => {
                const daysUntilExpiry = Math.ceil((new Date(token.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                if (daysUntilExpiry <= 30) {
                  return (
                    <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
                      <strong>⚠️ Expiring Soon:</strong> This token will expire in {daysUntilExpiry} days.
                      Consider rotating it before expiry.
                    </div>
                  );
                }
                return null;
              })()
            )}
          </div>
        ))}
      </div>

      {/* Create Token Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Create New Token</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Token Name</label>
                <input
                  type="text"
                  placeholder="e.g., Production API Key"
                  className="w-full border border-gray-300 rounded-lg p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Token Type</label>
                <select className="w-full border border-gray-300 rounded-lg p-2">
                  <option value="api_key">API Key (No expiration)</option>
                  <option value="access">Access Token (Expires in 90 days)</option>
                  <option value="refresh">Refresh Token (Expires in 1 year)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Permissions</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" defaultChecked />
                    <span className="text-sm">Read</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" defaultChecked />
                    <span className="text-sm">Write</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-sm">Delete</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-sm">Admin</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">IP Whitelist (Optional)</label>
                <input
                  type="text"
                  placeholder="192.168.1.0/24, 10.0.0.0/16"
                  className="w-full border border-gray-300 rounded-lg p-2"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Comma-separated list of IP addresses or CIDR ranges
                </p>
              </div>

              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
                <strong>Important:</strong> The token will be displayed only once after creation.
                Make sure to copy and store it securely.
              </div>

              <div className="flex justify-end space-x-2">
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
                  Create Token
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
