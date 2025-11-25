import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import DataTable, { Column } from '@/app/components/DataTable';
import Modal from '@/app/components/Modal';
import StatusBadge from '@/app/components/StatusBadge';
import { governanceService } from '@/lib/api/services';
import { Helmet } from 'react-helmet-async';

interface AccessReviewCampaign {
  id: string;
  name: string;
  description: string;
  type: 'User Access' | 'Role Assignment' | 'Privileged Access' | 'Application Access';
  scope: 'Global' | 'Tenant';
  status: 'Active' | 'Completed' | 'Scheduled' | 'Cancelled';
  startDate: string;
  endDate: string;
  deadline: string;
  tenantsIncluded: number;
  totalItems: number;
  reviewedItems: number;
  approvedItems: number;
  revokedItems: number;
  progress: number;
  riskScore: number;
  createdBy: string;
  createdAt: string;
}

interface CampaignReviewer {
  id: string;
  campaignId: string;
  reviewerName: string;
  reviewerEmail: string;
  assignedItems: number;
  reviewedItems: number;
  pendingItems: number;
  progress: number;
  lastActivity: string;
}

interface AccessReviewItem {
  id: string;
  campaignId: string;
  tenantId: string;
  tenantName: string;
  userName: string;
  userEmail: string;
  accessType: string;
  resourceName: string;
  riskLevel: 'Critical' | 'High' | 'Medium' | 'Low';
  status: 'Pending' | 'Approved' | 'Revoked' | 'Escalated';
  reviewedBy?: string;
  reviewedAt?: string;
  justification?: string;
}

interface CampaignStats {
  totalCampaigns: number;
  activeCampaigns: number;
  totalReviews: number;
  completedReviews: number;
  pendingReviews: number;
  revokedAccess: number;
  averageRiskScore: number;
  complianceRate: number;
}

export default function GlobalAccessReviewsPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'campaigns' | 'reviews' | 'reviewers' | 'analytics'>('campaigns');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Stats State
  const [stats, setStats] = useState<CampaignStats>({
    totalCampaigns: 0,
    activeCampaigns: 0,
    totalReviews: 0,
    completedReviews: 0,
    pendingReviews: 0,
    revokedAccess: 0,
    averageRiskScore: 0,
    complianceRate: 0,
  });

  // Campaigns State
  const [campaigns, setCampaigns] = useState<AccessReviewCampaign[]>([]);
  const [showCreateCampaignModal, setShowCreateCampaignModal] = useState(false);
  const [campaignName, setCampaignName] = useState('');
  const [campaignDescription, setCampaignDescription] = useState('');
  const [campaignType, setCampaignType] = useState<'User Access' | 'Role Assignment' | 'Privileged Access' | 'Application Access'>('User Access');
  const [campaignStartDate, setCampaignStartDate] = useState('');
  const [campaignEndDate, setCampaignEndDate] = useState('');
  const [campaignDeadline, setCampaignDeadline] = useState('');

  // Reviewers State
  const [reviewers, setReviewers] = useState<CampaignReviewer[]>([]);

  // Review Items State
  const [reviewItems, setReviewItems] = useState<AccessReviewItem[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<string>('');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedReviewItem, setSelectedReviewItem] = useState<AccessReviewItem | null>(null);
  const [reviewDecision, setReviewDecision] = useState<'approve' | 'revoke'>('approve');
  const [reviewJustification, setReviewJustification] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      await Promise.all([
        fetchCampaigns(),
        fetchReviewers(),
        fetchReviewItems(),
        fetchStats(),
      ]);
    } catch (err) {
      console.error('Error fetching data:', err);
      loadMockData();
    } finally {
      setLoading(false);
    }
  };

  const fetchCampaigns = async () => {
    try {
      // Note: Using mock data as there's no global campaign endpoint yet
      // In production, would need a global endpoint or aggregate from multiple tenants
      setCampaigns([
        {
          id: '1',
          name: 'Q4 2024 Privileged Access Review',
          description: 'Quarterly review of all privileged access across all tenants',
          type: 'Privileged Access',
          scope: 'Global',
          status: 'Active',
          startDate: '2024-11-01',
          endDate: '2024-11-30',
          deadline: '2024-11-30',
          tenantsIncluded: 145,
          totalItems: 2456,
          reviewedItems: 1834,
          approvedItems: 1623,
          revokedItems: 211,
          progress: 74.7,
          riskScore: 6.8,
          createdBy: 'admin@onesign.com',
          createdAt: '2024-10-25T10:00:00Z',
        },
        {
          id: '2',
          name: 'Annual User Access Certification',
          description: 'Annual certification of all user access rights',
          type: 'User Access',
          scope: 'Global',
          status: 'Active',
          startDate: '2024-11-15',
          endDate: '2024-12-15',
          deadline: '2024-12-15',
          tenantsIncluded: 145,
          totalItems: 15234,
          reviewedItems: 5678,
          approvedItems: 5123,
          revokedItems: 555,
          progress: 37.3,
          riskScore: 5.4,
          createdBy: 'compliance@onesign.com',
          createdAt: '2024-11-01T09:00:00Z',
        },
        {
          id: '3',
          name: 'SOC 2 Role Assignment Audit',
          description: 'SOC 2 compliance audit for role assignments',
          type: 'Role Assignment',
          scope: 'Global',
          status: 'Completed',
          startDate: '2024-10-01',
          endDate: '2024-10-31',
          deadline: '2024-10-31',
          tenantsIncluded: 145,
          totalItems: 3456,
          reviewedItems: 3456,
          approvedItems: 3201,
          revokedItems: 255,
          progress: 100,
          riskScore: 4.2,
          createdBy: 'audit@onesign.com',
          createdAt: '2024-09-20T14:00:00Z',
        },
        {
          id: '4',
          name: 'Application Access Review - High Risk Apps',
          description: 'Review access to high-risk applications',
          type: 'Application Access',
          scope: 'Global',
          status: 'Active',
          startDate: '2024-11-10',
          endDate: '2024-11-25',
          deadline: '2024-11-25',
          tenantsIncluded: 78,
          totalItems: 4567,
          reviewedItems: 3234,
          approvedItems: 2890,
          revokedItems: 344,
          progress: 70.8,
          riskScore: 7.9,
          createdBy: 'security@onesign.com',
          createdAt: '2024-11-05T11:30:00Z',
        },
        {
          id: '5',
          name: 'Emergency Access Review',
          description: 'Review all emergency/break-glass access grants',
          type: 'Privileged Access',
          scope: 'Global',
          status: 'Scheduled',
          startDate: '2024-12-01',
          endDate: '2024-12-10',
          deadline: '2024-12-10',
          tenantsIncluded: 145,
          totalItems: 456,
          reviewedItems: 0,
          approvedItems: 0,
          revokedItems: 0,
          progress: 0,
          riskScore: 8.5,
          createdBy: 'admin@onesign.com',
          createdAt: '2024-11-20T08:00:00Z',
        },
      ]);
    } catch (err) {
      console.error('Error fetching campaigns:', err);
    }
  };

  const fetchReviewers = async () => {
    try {
      setReviewers([
        {
          id: '1',
          campaignId: '1',
          reviewerName: 'John Smith',
          reviewerEmail: 'john.smith@onesign.com',
          assignedItems: 456,
          reviewedItems: 389,
          pendingItems: 67,
          progress: 85.3,
          lastActivity: '2024-11-22T14:30:00Z',
        },
        {
          id: '2',
          campaignId: '1',
          reviewerName: 'Sarah Johnson',
          reviewerEmail: 'sarah.j@onesign.com',
          assignedItems: 523,
          reviewedItems: 401,
          pendingItems: 122,
          progress: 76.7,
          lastActivity: '2024-11-22T11:15:00Z',
        },
        {
          id: '3',
          campaignId: '2',
          reviewerName: 'Mike Davis',
          reviewerEmail: 'mike.d@onesign.com',
          assignedItems: 1234,
          reviewedItems: 567,
          pendingItems: 667,
          progress: 45.9,
          lastActivity: '2024-11-21T16:45:00Z',
        },
        {
          id: '4',
          campaignId: '2',
          reviewerName: 'Emily Chen',
          reviewerEmail: 'emily.chen@onesign.com',
          assignedItems: 1456,
          reviewedItems: 823,
          pendingItems: 633,
          progress: 56.5,
          lastActivity: '2024-11-22T09:20:00Z',
        },
        {
          id: '5',
          campaignId: '4',
          reviewerName: 'David Park',
          reviewerEmail: 'david.p@onesign.com',
          assignedItems: 789,
          reviewedItems: 654,
          pendingItems: 135,
          progress: 82.9,
          lastActivity: '2024-11-22T13:00:00Z',
        },
      ]);
    } catch (err) {
      console.error('Error fetching reviewers:', err);
    }
  };

  const fetchReviewItems = async () => {
    try {
      setReviewItems([
        {
          id: '1',
          campaignId: '1',
          tenantId: 'tenant-001',
          tenantName: 'Acme Corporation',
          userName: 'admin.user',
          userEmail: 'admin@acme.com',
          accessType: 'Global Administrator',
          resourceName: 'All Systems',
          riskLevel: 'Critical',
          status: 'Pending',
        },
        {
          id: '2',
          campaignId: '1',
          tenantId: 'tenant-002',
          tenantName: 'TechCorp Inc',
          userName: 'super.admin',
          userEmail: 'super@techcorp.com',
          accessType: 'Security Administrator',
          resourceName: 'Security Console',
          riskLevel: 'High',
          status: 'Approved',
          reviewedBy: 'john.smith@onesign.com',
          reviewedAt: '2024-11-20T10:30:00Z',
          justification: 'Required for security operations',
        },
        {
          id: '3',
          campaignId: '2',
          tenantId: 'tenant-003',
          tenantName: 'StartupXYZ',
          userName: 'jane.doe',
          userEmail: 'jane@startupxyz.com',
          accessType: 'Finance Manager',
          resourceName: 'Financial Systems',
          riskLevel: 'High',
          status: 'Pending',
        },
        {
          id: '4',
          campaignId: '1',
          tenantId: 'tenant-001',
          tenantName: 'Acme Corporation',
          userName: 'temp.contractor',
          userEmail: 'temp@acme.com',
          accessType: 'Privileged User',
          resourceName: 'Production Databases',
          riskLevel: 'Critical',
          status: 'Revoked',
          reviewedBy: 'sarah.j@onesign.com',
          reviewedAt: '2024-11-19T15:20:00Z',
          justification: 'Contract ended, access no longer needed',
        },
        {
          id: '5',
          campaignId: '4',
          tenantId: 'tenant-005',
          tenantName: 'Enterprise Solutions',
          userName: 'app.admin',
          userEmail: 'appadmin@enterprise.com',
          accessType: 'Application Owner',
          resourceName: 'CRM Application',
          riskLevel: 'Medium',
          status: 'Approved',
          reviewedBy: 'david.p@onesign.com',
          reviewedAt: '2024-11-21T09:45:00Z',
          justification: 'Active application owner with business justification',
        },
      ]);
    } catch (err) {
      console.error('Error fetching review items:', err);
    }
  };

  const fetchStats = async () => {
    setStats({
      totalCampaigns: 5,
      activeCampaigns: 3,
      totalReviews: 26169,
      completedReviews: 14657,
      pendingReviews: 11512,
      revokedAccess: 1365,
      averageRiskScore: 6.6,
      complianceRate: 94.8,
    });
  };

  const loadMockData = () => {
    // Mock data already loaded in individual fetch functions
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      // Mock - would call governanceService.createCampaign with global scope in production
      setSuccess('Access review campaign created successfully');
      setShowCreateCampaignModal(false);
      resetCampaignForm();
      fetchCampaigns();
    } catch (err: any) {
      setError(err?.message || 'Error creating campaign');
      console.error('Error creating campaign:', err);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReviewItem) return;
    setError('');
    setSuccess('');

    try {
      // Mock - would call securityService or governanceService in production
      setSuccess(`Access ${reviewDecision === 'approve' ? 'approved' : 'revoked'} successfully`);
      setShowReviewModal(false);
      setSelectedReviewItem(null);
      setReviewJustification('');
      fetchReviewItems();
    } catch (err: any) {
      setError(err?.message || 'Error submitting review');
      console.error('Error submitting review:', err);
    }
  };

  const handleCancelCampaign = async (campaignId: string) => {
    setError('');
    setSuccess('');

    try {
      // Mock - would call API to cancel campaign
      setSuccess('Campaign cancelled successfully');
      fetchCampaigns();
    } catch (err: any) {
      setError(err?.message || 'Error cancelling campaign');
      console.error('Error cancelling campaign:', err);
    }
  };

  const resetCampaignForm = () => {
    setCampaignName('');
    setCampaignDescription('');
    setCampaignType('User Access');
    setCampaignStartDate('');
    setCampaignEndDate('');
    setCampaignDeadline('');
  };

  const openReviewModal = (item: AccessReviewItem) => {
    setSelectedReviewItem(item);
    setReviewDecision('approve');
    setReviewJustification('');
    setShowReviewModal(true);
  };

  // Column Definitions
  const campaignColumns: Column<AccessReviewCampaign>[] = [
    {
      key: 'name',
      label: 'Campaign Name',
      render: (campaign) => (
        <div>
          <div className="font-medium">{campaign.name}</div>
          <div className="text-xs text-gray-500">{campaign.description.substring(0, 60)}...</div>
        </div>
      ),
    },
    {
      key: 'type',
      label: 'Type',
      render: (campaign) => (
        <StatusBadge
          status={campaign.type}
          
        />
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (campaign) => (
        <StatusBadge
          status={campaign.status}
        />
      ),
    },
    {
      key: 'progress',
      label: 'Progress',
      render: (campaign) => (
        <div>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${
                  campaign.progress >= 80 ? 'bg-green-500' :
                  campaign.progress >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${campaign.progress}%` }}
              />
            </div>
            <span className="text-sm font-medium">{campaign.progress.toFixed(1)}%</span>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {campaign.reviewedItems} / {campaign.totalItems} items
          </div>
        </div>
      ),
    },
    {
      key: 'riskScore',
      label: 'Risk Score',
      render: (campaign) => (
        <div className="flex items-center gap-2">
          <div
            className={`font-semibold ${
              campaign.riskScore >= 7 ? 'text-red-600' :
              campaign.riskScore >= 5 ? 'text-orange-600' : 'text-green-600'
            }`}
          >
            {campaign.riskScore.toFixed(1)}
          </div>
          <div className="text-xs text-gray-500">/ 10</div>
        </div>
      ),
    },
    {
      key: 'deadline',
      label: 'Deadline',
      render: (campaign) => {
        const deadline = new Date(campaign.deadline);
        const today = new Date();
        const daysLeft = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return (
          <div>
            <div className="text-sm">{deadline.toLocaleDateString()}</div>
            {campaign.status === 'Active' && (
              <div
                className={`text-xs ${
                  daysLeft < 7 ? 'text-red-600' :
                  daysLeft < 14 ? 'text-orange-600' : 'text-gray-500'
                }`}
              >
                {daysLeft > 0 ? `${daysLeft} days left` : 'Overdue'}
              </div>
            )}
          </div>
        );
      },
    },
  ];

  const reviewerColumns: Column<CampaignReviewer>[] = [
    {
      key: 'reviewerName',
      label: 'Reviewer',
      render: (reviewer) => (
        <div>
          <div className="font-medium">{reviewer.reviewerName}</div>
          <div className="text-xs text-gray-500">{reviewer.reviewerEmail}</div>
        </div>
      ),
    },
    {
      key: 'assignedItems',
      label: 'Assigned',
      render: (reviewer) => <div className="font-medium">{reviewer.assignedItems}</div>,
    },
    {
      key: 'reviewedItems',
      label: 'Reviewed',
      render: (reviewer) => <div className="text-green-600">{reviewer.reviewedItems}</div>,
    },
    {
      key: 'pendingItems',
      label: 'Pending',
      render: (reviewer) => <div className="text-orange-600">{reviewer.pendingItems}</div>,
    },
    {
      key: 'progress',
      label: 'Progress',
      render: (reviewer) => (
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${
                reviewer.progress >= 80 ? 'bg-green-500' :
                reviewer.progress >= 50 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${reviewer.progress}%` }}
            />
          </div>
          <span className="text-sm font-medium">{reviewer.progress.toFixed(1)}%</span>
        </div>
      ),
    },
    {
      key: 'lastActivity',
      label: 'Last Activity',
      render: (reviewer) => {
        const lastActivity = new Date(reviewer.lastActivity);
        const now = new Date();
        const hoursAgo = Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60));
        return (
          <div className="text-sm text-gray-600">
            {hoursAgo < 1 ? 'Just now' :
             hoursAgo < 24 ? `${hoursAgo}h ago` :
             lastActivity.toLocaleDateString()}
          </div>
        );
      },
    },
  ];

  const reviewItemColumns: Column<AccessReviewItem>[] = [
    {
      key: 'userName',
      label: 'User',
      render: (item) => (
        <div>
          <div className="font-medium">{item.userName}</div>
          <div className="text-xs text-gray-500">{item.userEmail}</div>
        </div>
      ),
    },
    {
      key: 'tenantName',
      label: 'Tenant',
      render: (item) => <div className="text-sm">{item.tenantName}</div>,
    },
    {
      key: 'accessType',
      label: 'Access Type',
      render: (item) => (
        <div>
          <div className="font-medium text-sm">{item.accessType}</div>
          <div className="text-xs text-gray-500">{item.resourceName}</div>
        </div>
      ),
    },
    {
      key: 'riskLevel',
      label: 'Risk',
      render: (item) => (
        <StatusBadge
          status={item.riskLevel}
        />
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (item) => (
        <StatusBadge
          status={item.status}
        />
      ),
    },
    {
      key: 'reviewedBy',
      label: 'Reviewed By',
      render: (item) => (
        <div className="text-sm">
          {item.reviewedBy ? (
            <div>
              <div>{item.reviewedBy}</div>
              {item.reviewedAt && (
                <div className="text-xs text-gray-500">
                  {new Date(item.reviewedAt).toLocaleDateString()}
                </div>
              )}
            </div>
          ) : (
            <span className="text-gray-400">Not reviewed</span>
          )}
        </div>
      ),
    },
  ];

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Global Access Reviews
        </h1>
        <p className="text-gray-600 mt-2">
          Manage access review campaigns and certifications across all tenants
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg shadow-lg p-6">
          <div className="text-sm opacity-90">Active Campaigns</div>
          <div className="text-3xl font-bold">{stats.activeCampaigns}</div>
          <div className="text-xs mt-1">of {stats.totalCampaigns} total</div>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg shadow-lg p-6">
          <div className="text-sm opacity-90">Pending Reviews</div>
          <div className="text-3xl font-bold">{stats.pendingReviews.toLocaleString()}</div>
          <div className="text-xs mt-1">{stats.completedReviews.toLocaleString()} completed</div>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-lg shadow-lg p-6">
          <div className="text-sm opacity-90">Revoked Access</div>
          <div className="text-3xl font-bold">{stats.revokedAccess}</div>
          <div className="text-xs mt-1">Security improvement</div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg shadow-lg p-6">
          <div className="text-sm opacity-90">Compliance Rate</div>
          <div className="text-3xl font-bold">{stats.complianceRate}%</div>
          <div className="text-xs mt-1">Risk score: {stats.averageRiskScore.toFixed(1)}/10</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('campaigns')}
          className={`px-6 py-3 font-medium ${
            activeTab === 'campaigns'
              ? 'border-b-2 border-purple-600 text-purple-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Campaigns
        </button>
        <button
          onClick={() => setActiveTab('reviews')}
          className={`px-6 py-3 font-medium ${
            activeTab === 'reviews'
              ? 'border-b-2 border-purple-600 text-purple-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Review Items
        </button>
        <button
          onClick={() => setActiveTab('reviewers')}
          className={`px-6 py-3 font-medium ${
            activeTab === 'reviewers'
              ? 'border-b-2 border-purple-600 text-purple-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Reviewers
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-6 py-3 font-medium ${
            activeTab === 'analytics'
              ? 'border-b-2 border-purple-600 text-purple-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Analytics
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

      {/* Campaigns Tab */}
      {activeTab === 'campaigns' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Access Review Campaigns</h2>
            <button
              onClick={() => setShowCreateCampaignModal(true)}
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
            >
              Create Campaign
            </button>
          </div>
          <DataTable
            data={campaigns}
            columns={campaignColumns}
            actions={(campaign) => (
              <div className="flex gap-2">
                <button className="text-blue-600 hover:text-blue-800 text-sm">
                  View
                </button>
                {campaign.status === 'Active' && (
                  <button
                    onClick={() => handleCancelCampaign(campaign.id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Cancel
                  </button>
                )}
              </div>
            )}
          />
        </div>
      )}

      {/* Review Items Tab */}
      {activeTab === 'reviews' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Review Items</h2>
            <div className="flex gap-2">
              <select
                className="px-3 py-2 border rounded"
                value={selectedCampaign}
                onChange={(e) => setSelectedCampaign(e.target.value)}
              >
                <option value="">All Campaigns</option>
                {campaigns.map(campaign => (
                  <option key={campaign.id} value={campaign.id}>
                    {campaign.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <DataTable
            data={reviewItems.filter(item => !selectedCampaign || item.campaignId === selectedCampaign)}
            columns={reviewItemColumns}
            actions={(item) => (
              <div className="flex gap-2">
                {item.status === 'Pending' && (
                  <button
                    onClick={() => openReviewModal(item)}
                    className="text-purple-600 hover:text-purple-800 text-sm"
                  >
                    Review
                  </button>
                )}
                <button className="text-blue-600 hover:text-blue-800 text-sm">
                  Details
                </button>
              </div>
            )}
          />
        </div>
      )}

      {/* Reviewers Tab */}
      {activeTab === 'reviewers' && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Campaign Reviewers</h2>
          <DataTable
            data={reviewers}
            columns={reviewerColumns}
            actions={(reviewer) => (
              <button className="text-blue-600 hover:text-blue-800 text-sm">
                Send Reminder
              </button>
            )}
          />
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Campaign Status Distribution */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Campaign Status Distribution</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Active</span>
                  <div className="flex items-center gap-2 flex-1 ml-4">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '60%' }} />
                    </div>
                    <span className="text-sm font-medium w-8">3</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Completed</span>
                  <div className="flex items-center gap-2 flex-1 ml-4">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: '20%' }} />
                    </div>
                    <span className="text-sm font-medium w-8">1</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Scheduled</span>
                  <div className="flex items-center gap-2 flex-1 ml-4">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '20%' }} />
                    </div>
                    <span className="text-sm font-medium w-8">1</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Review Decision Distribution */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Review Decisions</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Approved</span>
                  <div className="flex items-center gap-2 flex-1 ml-4">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '88%' }} />
                    </div>
                    <span className="text-sm font-medium w-16">12,837</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Revoked</span>
                  <div className="flex items-center gap-2 flex-1 ml-4">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div className="bg-red-500 h-2 rounded-full" style={{ width: '10%' }} />
                    </div>
                    <span className="text-sm font-medium w-16">1,365</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Escalated</span>
                  <div className="flex items-center gap-2 flex-1 ml-4">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div className="bg-orange-500 h-2 rounded-full" style={{ width: '2%' }} />
                    </div>
                    <span className="text-sm font-medium w-16">455</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Risk Level Distribution */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Access Risk Levels</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Critical</span>
                  <div className="flex items-center gap-2 flex-1 ml-4">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div className="bg-red-500 h-2 rounded-full" style={{ width: '15%' }} />
                    </div>
                    <span className="text-sm font-medium w-16">3,925</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">High</span>
                  <div className="flex items-center gap-2 flex-1 ml-4">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div className="bg-orange-500 h-2 rounded-full" style={{ width: '25%' }} />
                    </div>
                    <span className="text-sm font-medium w-16">6,542</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Medium</span>
                  <div className="flex items-center gap-2 flex-1 ml-4">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '35%' }} />
                    </div>
                    <span className="text-sm font-medium w-16">9,159</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Low</span>
                  <div className="flex items-center gap-2 flex-1 ml-4">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '25%' }} />
                    </div>
                    <span className="text-sm font-medium w-16">6,543</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Reviewer Performance */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Top Reviewers</h3>
              <div className="space-y-3">
                {reviewers.slice(0, 5).map((reviewer, index) => (
                  <div key={reviewer.id} className="flex items-center justify-between border-b pb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-semibold">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium text-sm">{reviewer.reviewerName}</div>
                        <div className="text-xs text-gray-500">{reviewer.reviewedItems} reviews</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{reviewer.progress.toFixed(1)}%</div>
                      <div className="text-xs text-gray-500">completion</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Campaign Modal */}
      <Modal
        isOpen={showCreateCampaignModal}
        onClose={() => {
          setShowCreateCampaignModal(false);
          resetCampaignForm();
          setError('');
        }}
        title="Create Access Review Campaign"
        size="lg"
      >
        <form onSubmit={handleCreateCampaign} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Campaign Name</label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border rounded"
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              placeholder="e.g., Q1 2025 Privileged Access Review"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              required
              rows={3}
              className="w-full px-3 py-2 border rounded"
              value={campaignDescription}
              onChange={(e) => setCampaignDescription(e.target.value)}
              placeholder="Describe the purpose and scope of this review campaign"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Campaign Type</label>
            <select
              className="w-full px-3 py-2 border rounded"
              value={campaignType}
              onChange={(e) => setCampaignType(e.target.value as any)}
            >
              <option value="User Access">User Access</option>
              <option value="Role Assignment">Role Assignment</option>
              <option value="Privileged Access">Privileged Access</option>
              <option value="Application Access">Application Access</option>
            </select>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Start Date</label>
              <input
                type="date"
                required
                className="w-full px-3 py-2 border rounded"
                value={campaignStartDate}
                onChange={(e) => setCampaignStartDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">End Date</label>
              <input
                type="date"
                required
                className="w-full px-3 py-2 border rounded"
                value={campaignEndDate}
                onChange={(e) => setCampaignEndDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Deadline</label>
              <input
                type="date"
                required
                className="w-full px-3 py-2 border rounded"
                value={campaignDeadline}
                onChange={(e) => setCampaignDeadline(e.target.value)}
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
                setShowCreateCampaignModal(false);
                resetCampaignForm();
                setError('');
              }}
              className="px-4 py-2 border rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              Create Campaign
            </button>
          </div>
        </form>
      </Modal>

      {/* Review Decision Modal */}
      <Modal
        isOpen={showReviewModal}
        onClose={() => {
          setShowReviewModal(false);
          setSelectedReviewItem(null);
          setReviewJustification('');
        }}
        title="Review Access"
      >
        {selectedReviewItem && (
          <form onSubmit={handleSubmitReview} className="space-y-4">
            <div className="bg-gray-50 p-4 rounded">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-600">User</div>
                  <div className="font-medium">{selectedReviewItem.userName}</div>
                  <div className="text-xs text-gray-500">{selectedReviewItem.userEmail}</div>
                </div>
                <div>
                  <div className="text-gray-600">Tenant</div>
                  <div className="font-medium">{selectedReviewItem.tenantName}</div>
                </div>
                <div>
                  <div className="text-gray-600">Access Type</div>
                  <div className="font-medium">{selectedReviewItem.accessType}</div>
                </div>
                <div>
                  <div className="text-gray-600">Resource</div>
                  <div className="font-medium">{selectedReviewItem.resourceName}</div>
                </div>
                <div>
                  <div className="text-gray-600">Risk Level</div>
                  <StatusBadge
                    status={selectedReviewItem.riskLevel}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Decision</label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="decision"
                    value="approve"
                    checked={reviewDecision === 'approve'}
                    onChange={(e) => setReviewDecision(e.target.value as any)}
                    className="mr-2"
                  />
                  <span className="text-sm">Approve Access</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="decision"
                    value="revoke"
                    checked={reviewDecision === 'revoke'}
                    onChange={(e) => setReviewDecision(e.target.value as any)}
                    className="mr-2"
                  />
                  <span className="text-sm">Revoke Access</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Justification</label>
              <textarea
                required
                rows={3}
                className="w-full px-3 py-2 border rounded"
                value={reviewJustification}
                onChange={(e) => setReviewJustification(e.target.value)}
                placeholder="Provide justification for your decision"
              />
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
                  setShowReviewModal(false);
                  setSelectedReviewItem(null);
                  setReviewJustification('');
                }}
                className="px-4 py-2 border rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`px-4 py-2 text-white rounded ${
                  reviewDecision === 'approve'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {reviewDecision === 'approve' ? 'Approve' : 'Revoke'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
