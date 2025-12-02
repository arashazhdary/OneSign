import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getTenantId } from '@/lib/tenant-context';
import { governanceService } from '@/lib/api/services';
import DataTable, { Column } from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import ActionButton from '@/components/common/ActionButton';
import Modal from '@/components/common/Modal';

interface RetentionPolicy {
  category: string;
  retentionPeriodDays: number;
  hardDeleteAfter: number;
  enabled: boolean;
}

interface DataRequest {
  id: string;
  subjectId: string;
  type: 'Access' | 'Deletion' | 'Portability' | 'Rectification';
  status: string;
  reason: string;
  createdAt: string;
  completedAt?: string;
}

export default function TenantPrivacyPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'retention' | 'requests'>('retention');
  const [tenantId, setTenantIdState] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [retentionPolicies, setRetentionPolicies] = useState<RetentionPolicy[]>([]);
  const [dataRequests, setDataRequests] = useState<DataRequest[]>([]);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestForm, setRequestForm] = useState({
    subjectId: '',
    type: 'Access' as const,
    reason: ''
  });

  useEffect(() => {
    const contextTenantId = getTenantId();
    setTenantIdState(contextTenantId || '00000000-0000-0000-0000-000000000000');
  }, []);

  useEffect(() => {
    if (tenantId) {
      if (activeTab === 'retention') fetchRetentionPolicies();
      else if (activeTab === 'requests') fetchDataRequests();
    }
  }, [tenantId, activeTab]);

  const fetchRetentionPolicies = async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      const data = await governanceService.getRetentionPolicies(tenantId);
      setRetentionPolicies(data || []);
    } catch (err) {
      console.error('Error fetching retention policies:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDataRequests = async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      const data = await governanceService.getDataSubjectRequests(tenantId);
      setDataRequests(data || []);
    } catch (err) {
      console.error('Error fetching data requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRetention = async (category: string, data: Partial<RetentionPolicy>) => {
    if (!tenantId) return;
    setLoading(true);
    try {
      await governanceService.updateRetentionPolicy(tenantId, category, data);
      setSuccess('Retention policy updated successfully');
      fetchRetentionPolicies();
    } catch (err) {
      setError('Failed to update retention policy');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId) return;
    setLoading(true);
    try {
      await governanceService.createDataSubjectRequest(tenantId, requestForm);
      setSuccess('Data request created successfully');
      setShowRequestModal(false);
      fetchDataRequests();
      setRequestForm({ subjectId: '', type: 'Access', reason: '' });
    } catch (err) {
      setError('Failed to create data request');
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteRequest = async (id: string) => {
    if (!tenantId || !confirm('Are you sure you want to execute this request?')) return;
    setLoading(true);
    try {
      await governanceService.executeDataSubjectRequest(tenantId, id);
      setSuccess('Data request executed successfully');
      fetchDataRequests();
    } catch (err) {
      setError('Failed to execute data request');
    } finally {
      setLoading(false);
    }
  };

  const retentionColumns: Column<RetentionPolicy>[] = [
    { key: 'category', label: 'Category' },
    { key: 'retentionPeriodDays', label: 'Retention (days)' },
    { key: 'hardDeleteAfter', label: 'Hard Delete After (days)' },
    {
      key: 'enabled',
      label: 'Status',
      render: (_, p) => <StatusBadge status={p.enabled ? 'Enabled' : 'Disabled'} />
    }
  ];

  const requestColumns: Column<DataRequest>[] = [
    { key: 'subjectId', label: 'Subject ID' },
    { key: 'type', label: 'Request Type' },
    {
      key: 'status',
      label: 'Status',
      render: (_, r) => <StatusBadge status={r.status} />
    },
    { key: 'reason', label: 'Reason' },
    { key: 'createdAt', label: 'Created', render: (_, r) => new Date(r.createdAt).toLocaleDateString() }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      

      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
          Privacy Management
        </h1>
        <p className="text-gray-600">Manage data retention policies and data subject requests (GDPR/CCPA)</p>
      </div>

      {error && <div className="mb-4 p-4 bg-red-100 border border-red-300 text-red-800 rounded-lg">{error}</div>}
      {success && <div className="mb-4 p-4 bg-green-100 border border-green-300 text-green-800 rounded-lg">{success}</div>}

      <div className="mb-6 flex space-x-2 border-b border-gray-300">
        {['retention', 'requests'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === tab ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            {tab === 'retention' ? 'Retention Policies' : 'Data Requests'}
          </button>
        ))}
      </div>

      {activeTab === 'retention' && (
        <DataTable
          data={retentionPolicies}
          columns={retentionColumns}
          actions={(policy) => (
            <button
              onClick={() => handleUpdateRetention(policy.category, { enabled: !policy.enabled })}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              {policy.enabled ? 'Disable' : 'Enable'}
            </button>
          )}
        />
      )}

      {activeTab === 'requests' && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <ActionButton onClick={() => setShowRequestModal(true)}>Create Data Request</ActionButton>
          </div>
          <DataTable
            data={dataRequests}
            columns={requestColumns}
            actions={(request) => (
              request.status === 'Pending' && (
                <button
                  onClick={() => handleExecuteRequest(request.id)}
                  className="text-green-600 hover:text-green-800 font-medium"
                >
                  Execute
                </button>
              )
            )}
          />
        </div>
      )}

      <Modal isOpen={showRequestModal} onClose={() => setShowRequestModal(false)} title="Create Data Request">
        <form onSubmit={handleCreateRequest} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject ID</label>
            <input
              type="text"
              value={requestForm.subjectId}
              onChange={(e) => setRequestForm({ ...requestForm, subjectId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Request Type</label>
            <select
              value={requestForm.type}
              onChange={(e) => setRequestForm({ ...requestForm, type: e.target.value as any })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="Access">Access</option>
              <option value="Deletion">Deletion</option>
              <option value="Portability">Portability</option>
              <option value="Rectification">Rectification</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
            <textarea
              value={requestForm.reason}
              onChange={(e) => setRequestForm({ ...requestForm, reason: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={3}
              required
            />
          </div>
          <div className="flex gap-4">
            <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors">Create</button>
            <ActionButton variant="secondary" className="flex-1" onClick={() => setShowRequestModal(false)}>
              Cancel
            </ActionButton>
          </div>
        </form>
      </Modal>
    </div>
  );
}
