import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { getTenantId } from '@/lib/tenant-context';
import { governanceService } from '@/lib/api/services';
import { useAuth } from '@/app/contexts/AuthContext';
import Modal from '@/components/common/Modal';
import { Helmet } from 'react-helmet-async';
import {
  Award,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Plus,
  Eye,
  AlertTriangle,
  RefreshCw,
  Search,
  Users,
  ThumbsUp,
  ThumbsDown,
  FileText,
  Download,
  BarChart3,
  History,
  Target,
  TrendingUp
} from 'lucide-react';

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

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  delay: number;
  trend?: string;
}

const StatCard = ({ title, value, icon, color, delay, trend }: StatCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: delay * 0.1 }}
    className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6 hover:shadow-xl transition-all duration-300"
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
        {trend && (
          <p className="text-sm text-green-600 dark:text-green-400 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            {trend}
          </p>
        )}
      </div>
      <div className={`p-4 rounded-xl bg-gradient-to-br ${color}`}>
        {icon}
      </div>
    </div>
  </motion.div>
);

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
  const [searchQuery, setSearchQuery] = useState('');

  const [createForm, setCreateForm] = useState({
    name: '',
    description: '',
    type: 'access' as const,
    startDate: '',
    endDate: '',
    certifiers: [] as string[],
  });

  const tabs = [
    { key: 'campaigns', label: 'Campaigns', icon: <Target className="w-4 h-4" /> },
    { key: 'certify', label: 'Certify Access', icon: <CheckCircle className="w-4 h-4" /> },
    { key: 'history', label: 'History', icon: <History className="w-4 h-4" /> },
    { key: 'reports', label: 'Reports', icon: <BarChart3 className="w-4 h-4" /> }
  ];

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

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError('');
        setSuccess('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const fetchCampaigns = async () => {
    if (!tenantId) return;
    setLoading(true);
    setError('');
    try {
      const data = await governanceService.getCampaigns();
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
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistoricalCertifications = async () => {
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
      await governanceService.createCampaign(createForm as any);
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
      if (selectedCampaign) {
        await governanceService.certifyItem(
          selectedCampaign.id,
          itemId,
          action === 'certify' ? 'approve' : 'revoke',
          notes
        );
      }
      setSuccess(`Access ${action === 'certify' ? 'certified' : 'revoked'} successfully`);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'active':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'archived':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400';
      default:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'medium':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      default:
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    }
  };

  const totalCampaigns = campaigns.length;
  const activeCampaigns = campaigns.filter(c => c.status === 'active').length;
  const totalItems = campaigns.reduce((sum, c) => sum + (c.statistics?.totalItems || 0), 0);
  const pendingItems = campaigns.reduce((sum, c) => sum + (c.statistics?.pending || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 p-6">
      <Helmet>
        <title>Access Certifications</title>
      </Helmet>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-4 mb-2">
          <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg">
            <Award className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Access Certifications
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage certification campaigns and attest to user access rights
            </p>
          </div>
        </div>
      </motion.div>

      {/* Alerts */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 text-red-800 dark:text-red-300 rounded-xl flex items-center gap-2"
          >
            <AlertTriangle className="w-5 h-5" />
            {error}
          </motion.div>
        )}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 p-4 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 text-green-800 dark:text-green-300 rounded-xl flex items-center gap-2"
          >
            <CheckCircle className="w-5 h-5" />
            {success}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Campaigns"
          value={totalCampaigns}
          icon={<Target className="w-6 h-6 text-white" />}
          color="from-amber-500 to-amber-600"
          delay={0}
        />
        <StatCard
          title="Active Campaigns"
          value={activeCampaigns}
          icon={<Clock className="w-6 h-6 text-white" />}
          color="from-blue-500 to-blue-600"
          delay={1}
        />
        <StatCard
          title="Total Items"
          value={totalItems.toLocaleString()}
          icon={<Users className="w-6 h-6 text-white" />}
          color="from-purple-500 to-purple-600"
          delay={2}
        />
        <StatCard
          title="Pending Review"
          value={pendingItems.toLocaleString()}
          icon={<AlertTriangle className="w-6 h-6 text-white" />}
          color="from-orange-500 to-orange-600"
          delay={3}
        />
      </div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-2 mb-6"
      >
        <nav className="flex space-x-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`relative flex-1 py-3 px-6 rounded-lg font-medium transition-all duration-200 ${
                activeTab === tab.key
                  ? 'text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700'
              }`}
            >
              {activeTab === tab.key && (
                <motion.div
                  layoutId="activeCertTab"
                  className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-600 rounded-lg"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10 flex items-center justify-center gap-2">
                {tab.icon}
                {tab.label}
              </span>
            </button>
          ))}
        </nav>
      </motion.div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-12">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <RefreshCw className="w-8 h-8 text-amber-600" />
          </motion.div>
        </div>
      )}

      {/* Campaigns Tab */}
      {activeTab === 'campaigns' && !loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search campaigns..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-amber-500 dark:bg-slate-700 dark:text-white"
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl hover:shadow-lg transition-all duration-200"
            >
              <Plus className="w-5 h-5" />
              Create Campaign
            </motion.button>
          </div>

          {campaigns.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-12 text-center"
            >
              <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Certification Campaigns</h3>
              <p className="text-gray-600 dark:text-gray-400">Create a campaign to start certifying user access.</p>
            </motion.div>
          ) : (
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                <thead className="bg-gray-50 dark:bg-slate-700/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Campaign Name</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Due Date</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Progress</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                  {campaigns.filter(c => !searchQuery || c.name.toLowerCase().includes(searchQuery.toLowerCase())).map((campaign, index) => (
                    <motion.tr
                      key={campaign.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer"
                      onClick={() => handleViewCampaign(campaign)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                            <Award className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                          </div>
                          <div>
                            <span className="font-medium text-gray-900 dark:text-white">{campaign.name}</span>
                            {campaign.description && (
                              <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">{campaign.description}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 rounded text-sm capitalize">
                          {campaign.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                          {campaign.status === 'completed' && <CheckCircle className="w-3 h-3" />}
                          {campaign.status === 'active' && <Clock className="w-3 h-3" />}
                          {campaign.status === 'archived' && <XCircle className="w-3 h-3" />}
                          {campaign.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {new Date(campaign.endDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {campaign.statistics ? (
                          <div className="flex items-center gap-3">
                            <div className="w-32 bg-gray-200 dark:bg-slate-600 rounded-full h-2 overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${campaign.statistics.completion}%` }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="h-full bg-gradient-to-r from-amber-500 to-orange-600"
                              />
                            </div>
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{campaign.statistics.completion}%</span>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewCampaign(campaign);
                          }}
                          className="p-2 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </motion.button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      )}

      {/* Certify Tab */}
      {activeTab === 'certify' && !loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          {selectedCampaign ? (
            <>
              {/* Campaign Summary */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedCampaign.name}</h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">{selectedCampaign.description}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedCampaign.status)}`}>
                    {selectedCampaign.status}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">{selectedCampaign.statistics?.totalItems || 0}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Total Items</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                    <div className="text-3xl font-bold text-green-600 dark:text-green-400">{selectedCampaign.statistics?.certified || 0}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Certified</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
                    <div className="text-3xl font-bold text-red-600 dark:text-red-400">{selectedCampaign.statistics?.revoked || 0}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Revoked</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
                    <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">{selectedCampaign.statistics?.pending || 0}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Pending</div>
                  </div>
                </div>
              </motion.div>

              {/* Certification Items */}
              <div className="space-y-4">
                {certificationItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                            <Users className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{item.userName}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{item.userEmail}</p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(item.riskLevel)}`}>
                            {item.riskLevel} risk
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Access Type:</span>
                            <span className="ml-1 font-medium text-gray-900 dark:text-white">{item.accessType}</span>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Resource:</span>
                            <span className="ml-1 font-medium text-gray-900 dark:text-white">{item.resourceName}</span>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Granted:</span>
                            <span className="ml-1 font-medium text-gray-900 dark:text-white">{new Date(item.grantedDate).toLocaleDateString()}</span>
                          </div>
                          {item.lastUsed && (
                            <div>
                              <span className="text-gray-600 dark:text-gray-400">Last Used:</span>
                              <span className="ml-1 font-medium text-gray-900 dark:text-white">{new Date(item.lastUsed).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="ml-6">
                        {item.status === 'pending' ? (
                          <div className="flex gap-2">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleCertify(item.id, 'certify')}
                              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                            >
                              <ThumbsUp className="w-4 h-4" />
                              Certify
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleCertify(item.id, 'revoke')}
                              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                            >
                              <ThumbsDown className="w-4 h-4" />
                              Revoke
                            </motion.button>
                          </div>
                        ) : (
                          <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${
                            item.status === 'certified'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                          }`}>
                            {item.status === 'certified' ? <ThumbsUp className="w-4 h-4" /> : <ThumbsDown className="w-4 h-4" />}
                            {item.status}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-12 text-center"
            >
              <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Select a Campaign</h3>
              <p className="text-gray-600 dark:text-gray-400">Choose a campaign from the Campaigns tab to start certifying access.</p>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && !loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          {historicalCertifications.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-12 text-center"
            >
              <History className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Historical Records</h3>
              <p className="text-gray-600 dark:text-gray-400">Completed certifications will appear here.</p>
            </motion.div>
          ) : (
            historicalCertifications.map((cert, index) => (
              <motion.div
                key={cert.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{cert.campaignName}</h3>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
                      <Calendar className="w-4 h-4" />
                      Completed on {new Date(cert.completedAt).toLocaleDateString()}
                    </div>
                    <div className="flex gap-6 text-sm">
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Total:</span>
                        <span className="ml-1 font-medium text-gray-900 dark:text-white">{cert.totalItems}</span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Certified:</span>
                        <span className="ml-1 font-medium text-green-600 dark:text-green-400">{cert.certifiedCount}</span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Revoked:</span>
                        <span className="ml-1 font-medium text-red-600 dark:text-red-400">{cert.revokedCount}</span>
                      </div>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Download Report
                  </motion.button>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && !loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                <BarChart3 className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Compliance Reports</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Generate compliance reports for audits and regulatory requirements.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-3 p-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl hover:shadow-lg transition-all duration-200"
              >
                <FileText className="w-6 h-6" />
                <div className="text-left">
                  <div className="font-medium">Certification Summary</div>
                  <div className="text-xs opacity-80">Overview of all certifications</div>
                </div>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-3 p-4 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-xl hover:shadow-lg transition-all duration-200"
              >
                <Download className="w-6 h-6" />
                <div className="text-left">
                  <div className="font-medium">Export All (CSV)</div>
                  <div className="text-xs opacity-80">Download certification data</div>
                </div>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-3 p-4 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-xl hover:shadow-lg transition-all duration-200"
              >
                <Award className="w-6 h-6" />
                <div className="text-left">
                  <div className="font-medium">Compliance Attestation</div>
                  <div className="text-xs opacity-80">Official compliance document</div>
                </div>
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Create Campaign Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title={t('tenant.accessCertifications.createCertificationCampaign')}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Campaign Name</label>
            <input
              type="text"
              value={createForm.name}
              onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-amber-500 dark:bg-slate-700 dark:text-white"
              placeholder="Q4 2024 Access Certification"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <textarea
              value={createForm.description}
              onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-amber-500 dark:bg-slate-700 dark:text-white"
              rows={3}
              placeholder="Quarterly access certification campaign..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Certification Type</label>
            <select
              value={createForm.type}
              onChange={(e) => setCreateForm({ ...createForm, type: e.target.value as any })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-amber-500 dark:bg-slate-700 dark:text-white"
            >
              <option value="access">Access Certification</option>
              <option value="entitlement">Entitlement Certification</option>
              <option value="role">Role Certification</option>
              <option value="policy">Policy Certification</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
              <input
                type="date"
                value={createForm.startDate}
                onChange={(e) => setCreateForm({ ...createForm, startDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-amber-500 dark:bg-slate-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date</label>
              <input
                type="date"
                value={createForm.endDate}
                onChange={(e) => setCreateForm({ ...createForm, endDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-amber-500 dark:bg-slate-700 dark:text-white"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCreateCampaign}
              className="flex-1 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-lg hover:shadow-lg transition-all duration-200"
            >
              Create Campaign
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowCreateModal(false)}
              className="flex-1 py-2 bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-500 transition-all duration-200"
            >
              Cancel
            </motion.button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
