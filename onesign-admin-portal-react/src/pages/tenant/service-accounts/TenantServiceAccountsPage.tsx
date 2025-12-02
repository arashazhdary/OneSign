import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getTenantId } from '@/lib/tenant-context';
import { tenantService } from '@/lib/api/services/tenant.service';
import DataTable, { Column } from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import ActionButton from '@/components/common/ActionButton';
import Modal from '@/components/common/Modal';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import { Helmet } from 'react-helmet-async';

interface ServiceAccount {
  id: string;
  name: string;
  description: string;
  clientId: string;
  isEnabled: boolean;
  createdAt: string;
}

export default function TenantServiceAccountsPage() {
  const { t } = useTranslation();
  const [tenantId, setTenantIdState] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [serviceAccounts, setServiceAccounts] = useState<ServiceAccount[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    const contextTenantId = getTenantId();
    setTenantIdState(contextTenantId || '00000000-0000-0000-0000-000000000000');
  }, []);

  useEffect(() => {
    if (tenantId) fetchServiceAccounts();
  }, [tenantId]);

  const fetchServiceAccounts = async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      const data = await tenantService.getServiceAccounts();
      setServiceAccounts(data || []);
    } catch (err) {
      console.error('Error fetching service accounts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId) return;
    setLoading(true);
    try {
      await tenantService.createServiceAccount(form);
      setSuccess('Service account created successfully');
      setShowModal(false);
      fetchServiceAccounts();
      setForm({ name: '', description: '' });
    } catch (err) {
      setError('Failed to create service account');
    } finally {
      setLoading(false);
    }
  };

  const columns: Column<ServiceAccount>[] = [
    { key: 'name', label: 'Name' },
    { key: 'description', label: 'Description' },
    { key: 'clientId', label: 'Client ID' },
    {
      key: 'isEnabled',
      label: 'Status',
      render: (_, sa) => <StatusBadge status={sa.isEnabled ? 'Enabled' : 'Disabled'} />
    },
    { key: 'createdAt', label: 'Created', render: (_, sa) => new Date(sa.createdAt).toLocaleDateString() }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      

      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
          Service Accounts
        </h1>
        <p className="text-gray-600">Manage service accounts for machine-to-machine authentication</p>
      </div>

      {error && <div className="mb-4 p-4 bg-red-100 border border-red-300 text-red-800 rounded-lg">{error}</div>}
      {success && <div className="mb-4 p-4 bg-green-100 border border-green-300 text-green-800 rounded-lg">{success}</div>}

      <div className="mb-6 flex justify-end">
        <ActionButton onClick={() => setShowModal(true)}>Create Service Account</ActionButton>
      </div>

      <DataTable data={serviceAccounts} columns={columns} />

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={`${t('common.create')} ${t('common.serviceAccount')}`}>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>
          <div className="flex gap-4">
            <ActionButton className="w-full">Create</ActionButton>
            <ActionButton variant="secondary" className="w-full" onClick={() => setShowModal(false)}>
              Cancel
            </ActionButton>
          </div>
        </form>
      </Modal>
    </div>
  );
}
