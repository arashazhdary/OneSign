import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getTenantId } from '@/lib/tenant-context';
import { governanceService } from '@/lib/api/services';
import { useAuth } from '@/app/contexts/AuthContext';
import DataTable, { Column } from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import ActionButton from '@/components/common/ActionButton';
import Modal from '@/components/common/Modal';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import { Helmet } from 'react-helmet-async';

interface CertificationCampaign {
  id: string;
  name: string;
  description?: string;
  type: 'access' | 'entitlement' | 'role' | 'policy';
  status: 'draft' | 'active' | 'completed' | 'archived';
  startDate: string;
  endDate: string;
  certifiers: string[];
  scope: {
    includeUsers?: string[];
    includeGroups?: string[];
    includeApplications?: string[];
  };
  statistics?: {
    totalItems: number;
    certified: number;
    revoked: number;
    pending: number;
    completion: number;
  };
  createdAt: string;
  completedAt?: string;
}

interface CertificationItem {
  id: string;
  campaignId: string;
  userId: string;
  userName: string;
  userEmail: string;
  accessType: string;
  resourceName: string;
  grantedDate: string;
  lastUsed?: string;
  riskLevel: 'low' | 'medium' | 'high';
  status: 'pending' | 'certified' | 'revoked';
  certifiedBy?: string;
  certifiedAt?: string;
  notes?: string;
}

interface HistoricalCertification {
  id: string;
  campaignName: string;
  completedAt: string;
  totalItems: number;
  certifiedCount: number;
  revokedCount: number;
  certifiers: string[];
}

export default function TenantAccessCertificationsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [tenantId, setTenantIdState] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState<'campaigns' | 'certify' | 'history' | 'reports'>('campaigns');

  const [campaigns, setCampaigns] = useState<CertificationCampaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<CertificationCampaign | null>(null);
  const [certificationItems, setCertificationItems] = useState<CertificationItem[]>([]);
  const [historicalCertifications, setHistoricalCertifications] = useState<HistoricalCertification[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [createForm, setCreateForm] = useState({
    name: '',
    description: '',
    type: 'access' as const,
    startDate: '',
    endDate: '',
    certifiers: [] as string[],
  });

  useEffect(() => {
    const contextTenantId = getTenantId();
    setTenantIdState(contextTenantId || '00000000-0000-0000-0000-000000000000');
  }, []);

  useEffect(() => {
    if (tenantId) {
      if (activeTab === 'campaigns') fetchCampaigns();
      else if (activeTab === 'history') fetchHistoricalCertifications();
    }
  }, [tenantId, activeTab]);

  const fetchCampaigns = async () => {
    if (!tenantId) return;
    setLoading(true);
    setError('');
    try {
      const data = await governanceService.getCampaigns(tenantId);
      // Mock data structure - adapt based on actual API response
      const campaigns = (data || []).map((campaign: any) => ({
        ...campaign,
        type: campaign.type || 'access',
        status: campaign.status || 'active',
        certifiers: campaign.certifiers || [],
        scope: campaign.scope || {},
        statistics: campaign.statistics || {
          totalItems: Math.floor(Math.random() * 500) + 100,
          certified: Math.floor(Math.random() * 300),
          revoked: Math.floor(Math.random() * 50),
          pending: Math.floor(Math.random() * 150),
          completion: Math.floor(Math.random() * 100),
        },
      }));
      setCampaigns(campaigns);
    } catch (err: any) {
      console.error('Error fetching campaigns:', err);
      setError('Failed to load certification campaigns');
      // Use mock data on error
      setCampaigns([
        {
          id: '1',
          name: 'Q4 2024 Access Certification',
          description: 'Quarterly access certification campaign',
          type: 'access',
          status: 'active',
          startDate: '2024-10-01',
          endDate: '2024-12-31',
          certifiers: ['manager@example.com'],
          scope: {},
          statistics: {
            totalItems: 450,
            certified: 280,
            revoked: 25,
            pending: 145,
            completion: 68,
          },
          createdAt: '2024-09-28',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistoricalCertifications = async () => {
    // Mock historical data - implement actual API call when available
    setHistoricalCertifications([
      {
        id: '1',
        campaignName: 'Q3 2024 Access Certification',
        completedAt: '2024-09-30',
        totalItems: 425,
        certifiedCount: 390,
        revokedCount: 35,
        certifiers: ['manager@example.com', 'admin@example.com'],
      },
      {
        id: '2',
        campaignName: 'Q2 2024 Role Certification',
        completedAt: '2024-06-30',
        totalItems: 380,
        certifiedCount: 360,
        revokedCount: 20,
        certifiers: ['admin@example.com'],
      },
    ]);
  };

  const handleCreateCampaign = async () => {
    if (!tenantId) return;
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      // Use governance service to create campaign
      // Adapt based on actual API structure
      await governanceService.createCampaign(tenantId, createForm as any);
      setSuccess('Certification campaign created successfully');
      setShowCreateModal(false);
      setCreateForm({
        name: '',
        description: '',
        type: 'access',
        startDate: '',
        endDate: '',
        certifiers: [],
      });
      fetchCampaigns();
    } catch (err: any) {
      console.error('Error creating campaign:', err);
      setError('Failed to create certification campaign');
    } finally {
      setLoading(false);
    }
  };

  const handleViewCampaign = async (campaign: CertificationCampaign) => {
    setSelectedCampaign(campaign);
    setActiveTab('certify');

    // Fetch certification items for this campaign
    // Mock data - implement actual API call
    setCertificationItems([
      {
        id: '1',
        campaignId: campaign.id,
        userId: 'user1',
        userName: 'John Doe',
        userEmail: 'john@example.com',
        accessType: 'Application Access',
        resourceName: 'Salesforce',
        grantedDate: '2024-01-15',
        lastUsed: '2024-11-20',
        riskLevel: 'low',
        status: 'pending',
      },
      {
        id: '2',
        campaignId: campaign.id,
        userId: 'user2',
        userName: 'Jane Smith',
        userEmail: 'jane@example.com',
        accessType: 'Role Assignment',
        resourceName: 'Admin Role',
        grantedDate: '2024-03-10',
        lastUsed: '2024-11-15',
        riskLevel: 'high',
        status: 'pending',
      },
    ]);
  };

  const handleCertify = async (itemId: string, action: 'certify' | 'revoke', notes?: string) => {
    setLoading(true);
    try {
      // Call API with campaignId, itemId, and certification data
      if (selectedCampaign) {
        await governanceService.certifyItem(selectedCampaign.id, itemId, {
          decision: action,
          comment: notes
        });
      }
      setSuccess(`Access ${action === 'certify' ? 'certified' : 'revoked'} successfully`);

      // Update local state
      setCertificationItems((prev) =>
        prev.map((item) =>
          item.id === itemId
            ? {
                ...item,
                status: action === 'certify' ? 'certified' : 'revoked',
                certifiedBy: user?.email || 'current-user',
                certifiedAt: new Date().toISOString(),
                notes,
              }
            : item
        )
      );
    } catch (err) {
      setError(`Failed to ${action} access`);
    } finally {
      setLoading(false);
    }
  };

  const campaignColumns: Column<CertificationCampaign>[] = [
    { key: 'name', label: 'Campaign Name' },
    {
      key: 'type',
      label: 'Type',
      render: (campaign) => <span className="capitalize">{campaign.type}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (campaign) => (
        <StatusBadge
          status={campaign.status}
          variant={
            campaign.status === 'completed'
              ? 'success'
              : campaign.status === 'active'
              ? 'warning'
              : campaign.status === 'archived'
              ? 'error'
              : 'info'
          }
        />
      ),
    },
    {
      key: 'endDate',
      label: 'Due Date',
      render: (campaign) => new Date(campaign.endDate).toLocaleDateString(),
    },
    {
      key: 'statistics',
      label: 'Progress',
      render: (campaign) =>
        campaign.statistics ? (
          <div className="flex items-center gap-2">
            <div className="w-32 bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full"
                style={{ width: `${campaign.statistics.completion}%` }}
              />
            </div>
            <span className="text-sm">{campaign.statistics.completion}%</span>
          </div>
        ) : (
          '-'
        ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
          Access Certifications
        </h1>
        <p className="text-gray-600">
          Manage certification campaigns and attest to user access rights
        </p>
      </div>

      {/* Alerts */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-300 text-red-800 rounded-lg">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-4 bg-green-100 border border-green-300 text-green-800 rounded-lg">
          {success}
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6 flex space-x-2 border-b border-gray-300">
        <button
          onClick={() => setActiveTab('campaigns')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'campaigns'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Campaigns
        </button>
        <button
          onClick={() => setActiveTab('certify')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'certify'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Certify Access
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'history'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          History
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'reports'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Reports
        </button>
      </div>

      {/* Campaigns Tab */}
      {activeTab === 'campaigns' && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <ActionButton onClick={() => setShowCreateModal(true)}>
              Create Campaign
            </ActionButton>
          </div>
          <DataTable
            data={campaigns}
            columns={campaignColumns}
            onRowClick={handleViewCampaign}
            actions={(campaign) => (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewCampaign(campaign);
                }}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                View Details
              </button>
            )}
          />
        </div>
      )}

      {/* Certify Tab */}
      {activeTab === 'certify' && (
        <div className="space-y-6">
          {selectedCampaign && (
            <>
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold mb-2">{selectedCampaign.name}</h2>
                <p className="text-gray-600 mb-4">{selectedCampaign.description}</p>
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <div className="text-sm text-gray-600">Total Items</div>
                    <div className="text-2xl font-bold">{selectedCampaign.statistics?.totalItems || 0}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Certified</div>
                    <div className="text-2xl font-bold text-green-600">{selectedCampaign.statistics?.certified || 0}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Revoked</div>
                    <div className="text-2xl font-bold text-red-600">{selectedCampaign.statistics?.revoked || 0}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Pending</div>
                    <div className="text-2xl font-bold text-orange-600">{selectedCampaign.statistics?.pending || 0}</div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {certificationItems.map((item) => (
                  <div key={item.id} className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{item.userName}</h3>
                          <StatusBadge
                            status={item.riskLevel}
                            variant={
                              item.riskLevel === 'high'
                                ? 'error'
                                : item.riskLevel === 'medium'
                                ? 'warning'
                                : 'success'
                            }
                          />
                        </div>
                        <div className="text-sm text-gray-600">{item.userEmail}</div>
                        <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Access:</span>{' '}
                            <span className="font-medium">{item.accessType}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Resource:</span>{' '}
                            <span className="font-medium">{item.resourceName}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Granted:</span>{' '}
                            <span className="font-medium">{new Date(item.grantedDate).toLocaleDateString()}</span>
                          </div>
                          {item.lastUsed && (
                            <div>
                              <span className="text-gray-600">Last Used:</span>{' '}
                              <span className="font-medium">{new Date(item.lastUsed).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="ml-6">
                        {item.status === 'pending' ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleCertify(item.id, 'certify')}
                              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-medium"
                            >
                              Certify
                            </button>
                            <button
                              onClick={() => handleCertify(item.id, 'revoke')}
                              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 font-medium"
                            >
                              Revoke
                            </button>
                          </div>
                        ) : (
                          <StatusBadge
                            status={item.status}
                            variant={item.status === 'certified' ? 'success' : 'error'}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
          {!selectedCampaign && (
            <div className="text-center py-12 text-gray-500">
              <p>Select a campaign from the Campaigns tab to start certifying access</p>
            </div>
          )}
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          {historicalCertifications.map((cert) => (
            <div key={cert.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{cert.campaignName}</h3>
                  <div className="text-sm text-gray-600 mt-1">
                    Completed on {new Date(cert.completedAt).toLocaleDateString()}
                  </div>
                  <div className="flex gap-4 mt-3 text-sm">
                    <div>
                      <span className="text-gray-600">Total:</span>{' '}
                      <span className="font-medium">{cert.totalItems}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Certified:</span>{' '}
                      <span className="font-medium text-green-600">{cert.certifiedCount}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Revoked:</span>{' '}
                      <span className="font-medium text-red-600">{cert.revokedCount}</span>
                    </div>
                  </div>
                </div>
                <ActionButton variant="secondary">Download Report</ActionButton>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Compliance Reports</h2>
          <p className="text-gray-600 mb-6">
            Generate compliance reports for audits and regulatory requirements
          </p>
          <div className="space-y-3">
            <ActionButton>Generate Certification Summary Report</ActionButton>
            <ActionButton variant="secondary">Export All Certifications (CSV)</ActionButton>
            <ActionButton variant="secondary">Download Compliance Attestation</ActionButton>
          </div>
        </div>
      )}

      {/* Create Campaign Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title={`${t('common.create')} ${t('common.certificationCampaign')}`}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Name</label>
            <input
              type="text"
              value={createForm.name}
              onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Q4 2024 Access Certification"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={createForm.description}
              onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Certification Type</label>
            <select
              value={createForm.type}
              onChange={(e) => setCreateForm({ ...createForm, type: e.target.value as any })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="access">Access Certification</option>
              <option value="entitlement">Entitlement Certification</option>
              <option value="role">Role Certification</option>
              <option value="policy">Policy Certification</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={createForm.startDate}
                onChange={(e) => setCreateForm({ ...createForm, startDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={createForm.endDate}
                onChange={(e) => setCreateForm({ ...createForm, endDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <ActionButton onClick={handleCreateCampaign} className="flex-1">
              Create Campaign
            </ActionButton>
            <ActionButton onClick={() => setShowCreateModal(false)} variant="secondary" className="flex-1">
              Cancel
            </ActionButton>
          </div>
        </div>
      </Modal>
    </div>
  );
}
