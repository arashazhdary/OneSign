import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { adminService, ApiKeyDto, CreateApiKeyDto } from '@/lib/api/services/admin.service';

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

export default function AdminApiKeysPage() {
  const { t } = useTranslation();
  const [apiKeys, setApiKeys] = useState<AdminAPIKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showKey, setShowKey] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyPermissions, setNewKeyPermissions] = useState<string[]>([]);
  const [newKeyExpiration, setNewKeyExpiration] = useState('');
  const [createdKeyValue, setCreatedKeyValue] = useState<string | null>(null);

  useEffect(() => {
    fetchAPIKeys();
  }, []);

  const fetchAPIKeys = async () => {
    setLoading(true);
    setError('');
    try {
      // Fetch API keys from backend
      const data = await adminService.getApiKeys();

      // Map ApiKeyDto to AdminAPIKey interface
      const mappedKeys: AdminAPIKey[] = data.map((key: ApiKeyDto) => ({
        id: key.id,
        name: key.name,
        key: key.key || `${key.prefix}${'•'.repeat(32)}`,
        prefix: key.prefix,
        scope: 'platform' as const, // Default scope
        permissions: key.permissions,
        status: key.status.toLowerCase() as 'active' | 'revoked' | 'expired',
        expiresAt: key.expiresAt,
        lastUsed: key.lastUsedAt,
        usageCount: 0, // Not provided by API
        createdBy: key.createdBy,
        createdAt: key.createdAt,
      }));

      setApiKeys(mappedKeys);
    } catch (err) {
      console.error('Failed to fetch API keys:', err);
      setError(t('admin.apiKeys.messages.failedToLoad'));
      setApiKeys([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newKeyName.trim()) {
      setError(t('admin.apiKeys.validation.nameRequired'));
      return;
    }
    setError('');
    try {
      // Create API key via backend
      const createData: CreateApiKeyDto = {
        name: newKeyName,
        permissions: newKeyPermissions,
        expiresAt: newKeyExpiration || undefined,
      };

      const result = await adminService.createApiKey(createData);

      // Store the created key value to display to user
      if (result.key) {
        setCreatedKeyValue(result.key);
      }

      // Reset form
      setNewKeyName('');
      setNewKeyPermissions([]);
      setNewKeyExpiration('');
      setShowCreate(false);
      fetchAPIKeys();
    } catch (err: any) {
      console.error('Failed to create admin API key:', err);
      setError(err.response?.data?.message || t('common.failedToCreateApiKey'));
    }
  };

  const handleRevoke = async (keyId: string) => {
    if (!confirm(t('admin.apiKeys.messages.confirmRevoke'))) return;
    setError('');
    try {
      // Revoke API key via backend
      await adminService.revokeApiKey(keyId);
      fetchAPIKeys();
    } catch (err: any) {
      console.error('Failed to revoke admin API key:', err);
      setError(err.response?.data?.message || t('common.failedToRevokeApiKey'));
    }
  };

  const toggleKeyPermission = (perm: string) => {
    if (newKeyPermissions.includes(perm)) {
      setNewKeyPermissions(newKeyPermissions.filter(p => p !== perm));
    } else {
      setNewKeyPermissions([...newKeyPermissions, perm]);
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

  if (loading) return <div className="p-6">{t('admin.apiKeys.messages.loading')}</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Created Key Modal - Shows the newly created key */}
      {createdKeyValue && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-green-600">{t('admin.apiKeys.createdModal.title')}</h2>
            <div className="space-y-4">
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-sm text-yellow-800 mb-2">
                  <strong>{t('admin.apiKeys.createdModal.important')}</strong> {t('admin.apiKeys.createdModal.copyNow')}
                </p>
              </div>
              <div className="p-3 bg-gray-100 rounded font-mono text-sm break-all">
                {createdKeyValue}
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => handleCopy(createdKeyValue)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {t('admin.apiKeys.buttons.copyKey')}
                </button>
                <button
                  onClick={() => setCreatedKeyValue(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg"
                >
                  {t('admin.apiKeys.buttons.close')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">{t('admin.apiKeys.title')}</h1>
          <p className="text-gray-600 mt-1">{t('admin.apiKeys.description')}</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {t('admin.apiKeys.buttons.createApiKey')}
        </button>
      </div>

      {/* Warning Banner */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <span className="text-2xl mr-3">⚠️</span>
          <div>
            <h3 className="font-semibold text-yellow-800">{t('admin.apiKeys.securityNotice.title')}</h3>
            <p className="text-sm text-yellow-700 mt-1">
              {t('admin.apiKeys.securityNotice.description')}
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">{t('admin.apiKeys.stats.totalKeys')}</div>
          <div className="text-2xl font-bold">{apiKeys.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">{t('admin.apiKeys.stats.active')}</div>
          <div className="text-2xl font-bold text-green-600">
            {apiKeys.filter(k => k.status === 'active').length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">{t('admin.apiKeys.stats.totalApiCalls')}</div>
          <div className="text-2xl font-bold">
            {(apiKeys.reduce((acc, k) => acc + k.usageCount, 0) / 1000).toFixed(0)}K
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">{t('admin.apiKeys.stats.expiringSoon')}</div>
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
                          {showKey === apiKey.id ? t('admin.apiKeys.buttons.hide') : t('admin.apiKeys.buttons.show')}
                        </button>
                        <button
                          onClick={() => handleCopy(apiKey.key)}
                          className="text-blue-600 hover:text-blue-800 text-xs"
                        >
                          {t('admin.apiKeys.buttons.copy')}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Permissions */}
                  <div className="mb-3">
                    <span className="text-sm text-gray-500">{t('admin.apiKeys.labels.permissions')}</span>
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
                      <span className="text-gray-500">{t('admin.apiKeys.labels.created')}</span>
                      <span className="ml-2">{new Date(apiKey.createdAt).toLocaleDateString()}</span>
                    </div>
                    {apiKey.expiresAt && (
                      <div>
                        <span className="text-gray-500">{t('admin.apiKeys.labels.expires')}</span>
                        <span className="ml-2">{new Date(apiKey.expiresAt).toLocaleDateString()}</span>
                        {isExpiringSoon && (
                          <span className="ml-2 text-yellow-600">{t('admin.apiKeys.labels.daysRemaining', { count: daysUntilExpiry })}</span>
                        )}
                      </div>
                    )}
                    {apiKey.lastUsed && (
                      <div>
                        <span className="text-gray-500">{t('admin.apiKeys.labels.lastUsed')}</span>
                        <span className="ml-2">{new Date(apiKey.lastUsed).toLocaleString()}</span>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-500">{t('admin.apiKeys.labels.usage')}</span>
                      <span className="ml-2 font-semibold">{t('admin.apiKeys.labels.usageCount', { count: apiKey.usageCount })}</span>
                    </div>
                  </div>

                  {/* IP Whitelist */}
                  {apiKey.ipWhitelist && apiKey.ipWhitelist.length > 0 && (
                    <div className="mt-3">
                      <span className="text-sm text-gray-500">{t('admin.apiKeys.labels.ipWhitelist')}</span>
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
                    {t('admin.apiKeys.labels.createdBy', { name: apiKey.createdBy })}
                  </div>
                </div>

                {apiKey.status === 'active' && (
                  <button
                    onClick={() => handleRevoke(apiKey.id)}
                    className="px-3 py-1 text-sm text-red-600 border border-red-300 rounded hover:bg-red-50 ml-4"
                  >
                    {t('admin.apiKeys.buttons.revoke')}
                  </button>
                )}
              </div>

              {/* Expiry Warning */}
              {isExpiringSoon && (
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
                  <strong>⚠️ {t('admin.apiKeys.messages.expiringSoon')}</strong> {t('admin.apiKeys.messages.expiryWarning', { days: daysUntilExpiry })}
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
            <h2 className="text-xl font-bold mb-4">{t('admin.apiKeys.createModal.title')}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">{t('admin.apiKeys.createModal.keyName')}</label>
                <input
                  type="text"
                  placeholder={t('admin.apiKeys.createModal.keyNamePlaceholder')}
                  className="w-full border border-gray-300 rounded-lg p-2"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">{t('admin.apiKeys.createModal.permissions')}</label>
                <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
                  {['tenants:read', 'tenants:write', 'tenants:delete', 'users:read', 'users:write', 'system:read', 'analytics:read', 'integrations:manage'].map((perm) => (
                    <label key={perm} className="flex items-center">
                      <input
                        type="checkbox"
                        className="mr-2"
                        checked={newKeyPermissions.includes(perm)}
                        onChange={() => toggleKeyPermission(perm)}
                      />
                      {perm}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">{t('admin.apiKeys.createModal.expiration')}</label>
                <input
                  type="date"
                  className="w-full border border-gray-300 rounded-lg p-2"
                  value={newKeyExpiration}
                  onChange={(e) => setNewKeyExpiration(e.target.value)}
                />
                <p className="mt-1 text-xs text-gray-500">
                  {t('admin.apiKeys.createModal.expirationHint')}
                </p>
              </div>

              <div className="p-3 bg-red-50 border border-red-200 rounded text-sm">
                <strong>⚠️ {t('admin.apiKeys.createModal.important')}</strong> {t('admin.apiKeys.createModal.oneTimeWarning')}
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <button
                  onClick={() => {
                    setShowCreate(false);
                    setNewKeyName('');
                    setNewKeyPermissions([]);
                    setNewKeyExpiration('');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg"
                >
                  {t('admin.apiKeys.buttons.cancel')}
                </button>
                <button
                  onClick={handleCreate}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {t('admin.apiKeys.buttons.createKey')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
