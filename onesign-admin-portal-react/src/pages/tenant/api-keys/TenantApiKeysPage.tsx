import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getTenantId } from '@/lib/tenant-context';
import DataTable, { Column } from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import ActionButton from '@/components/common/ActionButton';
import Modal from '@/components/common/Modal';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import { tenantService } from '@/lib/api/services/tenant.service';
import { Helmet } from 'react-helmet-async';

interface APIKey {
  id: string;
  name: string;
  key: string;
  isRevoked: boolean;
  createdAt: string;
  expiresAt?: string;
  lastUsedAt?: string;
}

export default function TenantApiKeysPage() {
  const [tenantId, setTenantIdState] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    name: '',
    expiresAt: ''
  });

  useEffect(() => {
    const contextTenantId = getTenantId();
    setTenantIdState(contextTenantId || '00000000-0000-0000-0000-000000000000');
  }, []);

  useEffect(() => {
    if (tenantId) fetchAPIKeys();
  }, [tenantId]);

  const fetchAPIKeys = async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      const data = await tenantService.getApiKeys(tenantId);
      setApiKeys(data || []);
    } catch (err: any) {
      console.error('Error fetching API keys:', err);
      setError(err?.message || t('common.failedToFetchApiKeys'));
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId) return;
    setLoading(true);
    try {
      const data = await tenantService.createApiKey(
        tenantId,
        form.name,
        [],
        form.expiresAt || undefined
      );
      setSuccess(`API Key created: ${data.key}`);
      setShowModal(false);
      fetchAPIKeys();
      setForm({ name: '', expiresAt: '' });
    } catch (err: any) {
      setError(err?.message || t('common.failedToCreateApiKey'));
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (id: string) => {
    if (!tenantId || !confirm('Are you sure you want to revoke this API key?')) return;
    setLoading(true);
    try {
      await tenantService.revokeApiKey(tenantId, id);
      setSuccess('API key revoked successfully');
      fetchAPIKeys();
    } catch (err: any) {
      setError(err?.message || t('common.failedToRevokeApiKey'));
    } finally {
      setLoading(false);
    }
  };

  const columns: Column<APIKey>[] = [
    { key: 'name', label: 'Name' },
    { key: 'key', label: 'Key', render: (k) => <code className="text-xs">{k.key.substring(0, 20)}...</code> },
    {
      key: 'isRevoked',
      label: 'Status',
      render: (k) => <StatusBadge status={k.isRevoked ? 'Revoked' : 'Active'} variant={k.isRevoked ? 'error' : 'success'} />
    },
    { key: 'createdAt', label: 'Created', render: (k) => new Date(k.createdAt).toLocaleDateString() },
    { key: 'expiresAt', label: 'Expires', render: (k) => k.expiresAt ? new Date(k.expiresAt).toLocaleDateString() : 'Never' },
    { key: 'lastUsedAt', label: 'Last Used', render: (k) => k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleDateString() : 'Never' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      

      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
          API Keys
        </h1>
        <p className="text-gray-600">Manage API keys for programmatic access</p>
      </div>

      {error && <div className="mb-4 p-4 bg-red-100 border border-red-300 text-red-800 rounded-lg">{error}</div>}
      {success && <div className="mb-4 p-4 bg-green-100 border border-green-300 text-green-800 rounded-lg">{success}</div>}

      <div className="mb-6 flex justify-end">
        <ActionButton onClick={() => setShowModal(true)}>Create API Key</ActionButton>
      </div>

      <DataTable
        data={apiKeys}
        columns={columns}
        actions={(key) => (
          !key.isRevoked && (
            <button onClick={() => handleRevoke(key.id)} className="text-red-600 hover:text-red-800 font-medium">
              Revoke
            </button>
          )
        )}
      />

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create API Key">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Expiration Date (optional)</label>
            <input
              type="datetime-local"
              value={form.expiresAt}
              onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-4">
            <ActionButton type="submit" fullWidth>Create</ActionButton>
            <ActionButton type="button" variant="secondary" fullWidth onClick={() => setShowModal(false)}>
              Cancel
            </ActionButton>
          </div>
        </form>
      </Modal>
    </div>
  );
}
