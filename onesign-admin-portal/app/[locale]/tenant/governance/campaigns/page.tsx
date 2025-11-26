'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { getTenantId } from '@/lib/tenant-context';
import { governanceService } from '@/lib/api/services';
import DataTable, { Column } from '@/app/components/DataTable';
import Modal from '@/app/components/Modal';
import StatusBadge from '@/app/components/StatusBadge';

interface Campaign {
  id: string;
  name: string;
  description: string;
  status: 'Draft' | 'Active' | 'InProgress' | 'Completed' | 'Cancelled';
  targetType: 'Users' | 'Groups' | 'Roles' | 'All';
  startDate: string;
  endDate: string;
  progress: number;
  reviewedCount: number;
  totalCount: number;
  createdBy: string;
  createdAt: string;
}

export default function GovernanceCampaignsPage() {
  const t = useTranslations();
  const locale = useLocale();
  const [tenantId, setTenantIdState] = useState<string | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [targetType, setTargetType] = useState<'Users' | 'Groups' | 'Roles' | 'All'>('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const contextTenantId = getTenantId();
    setTenantIdState(contextTenantId || '11111111-1111-1111-1111-111111111111');
  }, []);

  useEffect(() => {
    if (tenantId) {
      fetchCampaigns();
    }
  }, [tenantId]);

  useEffect(() => {
    if (statusFilter === 'All') {
      setFilteredCampaigns(campaigns);
    } else {
      setFilteredCampaigns(campaigns.filter(c => c.status === statusFilter));
    }
  }, [campaigns, statusFilter]);

  const fetchCampaigns = async () => {
    if (!tenantId) return;
    try {
      const data = await (governanceService as any).getCampaigns(tenantId);
      setCampaigns(data);
    } catch (err) {
      console.error('Error fetching campaigns:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!tenantId) return;

    try {
      await (governanceService as any).createCampaign(tenantId, {
        name,
        description,
        targetType,
        startDate,
        endDate
      });

      setSuccess(t('tenant.governance.campaignCreated'));
      setShowCreateModal(false);
      resetForm();
      fetchCampaigns();
    } catch (err) {
      setError(t('common.error'));
      console.error('Error creating campaign:', err);
    }
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setTargetType('All');
    setStartDate('');
    setEndDate('');
  };

  const getStatusColor = (status: string): 'green' | 'blue' | 'yellow' | 'red' | 'gray' => {
    switch (status) {
      case 'Completed':
        return 'green';
      case 'Active':
      case 'InProgress':
        return 'blue';
      case 'Draft':
        return 'yellow';
      case 'Cancelled':
        return 'red';
      default:
        return 'gray';
    }
  };

  const columns: Column<Campaign>[] = [
    {
      key: 'name',
      label: t('tenant.governance.campaignName'),
      render: (campaign) => (
        <div>
          <div className="font-medium">{campaign.name}</div>
          <div className="text-xs text-gray-500">{campaign.description}</div>
        </div>
      )
    },
    {
      key: 'status',
      label: t('tenant.governance.status'),
      render: (campaign) => (
        <StatusBadge status={campaign.status} color={getStatusColor(campaign.status)} />
      )
    },
    {
      key: 'targetType',
      label: t('tenant.governance.targetType'),
      render: (campaign) => (
        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-medium">
          {campaign.targetType}
        </span>
      )
    },
    {
      key: 'progress',
      label: t('tenant.governance.progress'),
      render: (campaign) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${campaign.progress}%` }}
              ></div>
            </div>
            <span className="text-sm text-gray-600">{campaign.progress}%</span>
          </div>
          <div className="text-xs text-gray-500">
            {campaign.reviewedCount} / {campaign.totalCount} reviewed
          </div>
        </div>
      )
    },
    {
      key: 'startDate',
      label: t('tenant.governance.dateRange'),
      render: (campaign) => (
        <div className="text-sm">
          <div>{new Date(campaign.startDate).toLocaleDateString()}</div>
          <div className="text-gray-500">to</div>
          <div>{new Date(campaign.endDate).toLocaleDateString()}</div>
        </div>
      )
    },
    {
      key: 'createdBy',
      label: t('tenant.governance.createdBy'),
      render: (campaign) => (
        <div className="text-sm">
          <div>{campaign.createdBy}</div>
          <div className="text-xs text-gray-500">
            {new Date(campaign.createdAt).toLocaleDateString()}
          </div>
        </div>
      )
    }
  ];

  if (loading) {
    return <div className="p-8">{t('common.loading')}</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {t('tenant.governance.campaigns')}
          </h1>
          <p className="text-gray-600 mt-2">{t('tenant.governance.campaignsSubtitle')}</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all"
        >
          {t('tenant.governance.createCampaign')}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600">{t('tenant.governance.totalCampaigns')}</div>
          <div className="text-3xl font-bold text-blue-600">{campaigns.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600">{t('tenant.governance.activeCampaigns')}</div>
          <div className="text-3xl font-bold text-green-600">
            {campaigns.filter(c => c.status === 'Active' || c.status === 'InProgress').length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600">{t('tenant.governance.completedCampaigns')}</div>
          <div className="text-3xl font-bold text-purple-600">
            {campaigns.filter(c => c.status === 'Completed').length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600">{t('tenant.governance.avgProgress')}</div>
          <div className="text-3xl font-bold text-orange-600">
            {campaigns.length > 0
              ? Math.round(campaigns.reduce((sum, c) => sum + c.progress, 0) / campaigns.length)
              : 0}%
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium">{t('tenant.governance.filterByStatus')}:</label>
          <div className="flex gap-2">
            {['All', 'Draft', 'Active', 'InProgress', 'Completed', 'Cancelled'].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                  statusFilter === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
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

      {/* Campaigns Table */}
      <DataTable
        data={filteredCampaigns}
        columns={columns}
        loading={false}
        emptyMessage={t('tenant.governance.noCampaigns')}
        actions={(campaign) => (
          <div className="flex gap-2">
            <button className="text-blue-600 hover:text-blue-800 text-sm">
              {t('common.view')}
            </button>
            {campaign.status === 'Draft' && (
              <button className="text-green-600 hover:text-green-800 text-sm">
                {t('tenant.governance.launch')}
              </button>
            )}
          </div>
        )}
      />

      {/* Create Campaign Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          resetForm();
          setError('');
        }}
        title={t('tenant.governance.createCampaign')}
        size="lg"
      >
        <form onSubmit={handleCreateCampaign} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              {t('tenant.governance.campaignName')}
            </label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border rounded"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Q4 2024 Access Review"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              {t('tenant.governance.description')}
            </label>
            <textarea
              required
              rows={3}
              className="w-full px-3 py-2 border rounded"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Quarterly review of user access rights and permissions"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              {t('tenant.governance.targetType')}
            </label>
            <select
              className="w-full px-3 py-2 border rounded"
              value={targetType}
              onChange={(e) => setTargetType(e.target.value as any)}
            >
              <option value="All">All</option>
              <option value="Users">Users</option>
              <option value="Groups">Groups</option>
              <option value="Roles">Roles</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                {t('tenant.governance.startDate')}
              </label>
              <input
                type="date"
                required
                className="w-full px-3 py-2 border rounded"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                {t('tenant.governance.endDate')}
              </label>
              <input
                type="date"
                required
                className="w-full px-3 py-2 border rounded"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="flex gap-3 justify-end pt-4">
            <button
              type="button"
              onClick={() => {
                setShowCreateModal(false);
                resetForm();
                setError('');
              }}
              className="px-4 py-2 border rounded hover:bg-gray-50"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {t('common.create')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
