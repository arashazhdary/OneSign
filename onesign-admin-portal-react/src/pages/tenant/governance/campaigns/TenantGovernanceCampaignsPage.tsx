import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocale } from '@/hooks/useLocale';
import { getTenantId } from '@/lib/tenant-context';
import { governanceService } from '@/lib/api/services';
import DataTable, { Column } from '@/components/common/DataTable';
import Modal from '@/components/common/Modal';
import StatusBadge from '@/components/common/StatusBadge';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FolderKanban,
  Plus,
  Play,
  Eye,
  Target,
  CheckCircle,
  Clock,
  BarChart3,
  Filter,
  Users,
  UserCheck,
  Shield,
  AlertCircle,
  X
} from 'lucide-react';

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

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  delay: number;
}

const StatCard = ({ title, value, icon, color, delay }: StatCardProps) => (
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
      </div>
      <div className={`p-4 rounded-xl bg-gradient-to-br ${color}`}>
        {icon}
      </div>
    </div>
  </motion.div>
);

export default function TenantGovernanceCampaignsPage() {
  const { t } = useTranslation();
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
    setTenantIdState(contextTenantId || '00000000-0000-0000-0000-000000000000');
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
      const data = await governanceService.getCampaigns();
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
      await governanceService.createCampaign({
        name,
        description,
        type: targetType,
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

  const getTargetIcon = (targetType: string) => {
    switch (targetType) {
      case 'Users':
        return <Users className="w-4 h-4" />;
      case 'Groups':
        return <UserCheck className="w-4 h-4" />;
      case 'Roles':
        return <Shield className="w-4 h-4" />;
      default:
        return <Target className="w-4 h-4" />;
    }
  };

  const columns: Column<Campaign>[] = [
    {
      key: 'name',
      label: t('tenant.governance.campaignName'),
      render: (campaign) => (
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
            <FolderKanban className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="font-medium text-gray-900 dark:text-white">{campaign.name}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{campaign.description}</div>
          </div>
        </div>
      )
    },
    {
      key: 'status',
      label: t('tenant.governance.status'),
      render: (campaign) => (
        <StatusBadge status={campaign.status} />
      )
    },
    {
      key: 'targetType',
      label: t('tenant.governance.targetType'),
      render: (campaign) => (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded-lg text-xs font-medium">
          {getTargetIcon(campaign.targetType)}
          {campaign.targetType}
        </span>
      )
    },
    {
      key: 'progress',
      label: t('tenant.governance.progress'),
      render: (campaign) => (
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-200 dark:bg-slate-700 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${campaign.progress}%` }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
              />
            </div>
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{campaign.progress}%</span>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
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
          <div className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
            <Clock className="w-3.5 h-3.5 text-gray-400" />
            {new Date(campaign.startDate).toLocaleDateString()}
          </div>
          <div className="text-gray-400 dark:text-gray-500 text-xs ml-5">to</div>
          <div className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
            <Clock className="w-3.5 h-3.5 text-gray-400" />
            {new Date(campaign.endDate).toLocaleDateString()}
          </div>
        </div>
      )
    },
    {
      key: 'createdBy',
      label: t('tenant.governance.createdBy'),
      render: (campaign) => (
        <div className="text-sm">
          <div className="font-medium text-gray-700 dark:text-gray-300">{campaign.createdBy}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {new Date(campaign.createdAt).toLocaleDateString()}
          </div>
        </div>
      )
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  const activeCampaigns = campaigns.filter(c => c.status === 'Active' || c.status === 'InProgress').length;
  const completedCampaigns = campaigns.filter(c => c.status === 'Completed').length;
  const avgProgress = campaigns.length > 0
    ? Math.round(campaigns.reduce((sum, c) => sum + c.progress, 0) / campaigns.length)
    : 0;

  const statusFilters = ['All', 'Draft', 'Active', 'InProgress', 'Completed', 'Cancelled'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 p-8">
      <Helmet>
        <title>{t('tenant.governance.campaigns')} - OneSign</title>
      </Helmet>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-start mb-8"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
            <FolderKanban className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {t('tenant.governance.campaigns')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">{t('tenant.governance.campaignsSubtitle')}</p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all font-medium"
        >
          <Plus className="w-5 h-5" />
          {t('tenant.governance.createCampaign')}
        </motion.button>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard
          title={t('tenant.governance.totalCampaigns')}
          value={campaigns.length}
          icon={<FolderKanban className="w-6 h-6 text-white" />}
          color="from-blue-500 to-blue-600"
          delay={0}
        />
        <StatCard
          title={t('tenant.governance.activeCampaigns')}
          value={activeCampaigns}
          icon={<Play className="w-6 h-6 text-white" />}
          color="from-green-500 to-emerald-600"
          delay={1}
        />
        <StatCard
          title={t('tenant.governance.completedCampaigns')}
          value={completedCampaigns}
          icon={<CheckCircle className="w-6 h-6 text-white" />}
          color="from-purple-500 to-purple-600"
          delay={2}
        />
        <StatCard
          title={t('tenant.governance.avgProgress')}
          value={`${avgProgress}%`}
          icon={<BarChart3 className="w-6 h-6 text-white" />}
          color="from-orange-500 to-amber-600"
          delay={3}
        />
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-4 mb-6"
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            <Filter className="w-4 h-4" />
            {t('tenant.governance.filterByStatus')}:
          </div>
          <div className="flex gap-2 flex-wrap">
            {statusFilters.map(status => (
              <motion.button
                key={status}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  statusFilter === status
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                }`}
              >
                {status}
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Messages */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl flex items-center gap-2"
          >
            <AlertCircle className="w-5 h-5" />
            {error}
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-xl flex items-center gap-2"
          >
            <CheckCircle className="w-5 h-5" />
            {success}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Campaigns Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 overflow-hidden"
      >
        <DataTable
          data={filteredCampaigns}
          columns={columns}
          loading={false}
          emptyMessage={t('tenant.governance.noCampaigns')}
          actions={(campaign) => (
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
              >
                <Eye className="w-4 h-4" />
              </motion.button>
              {campaign.status === 'Draft' && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                >
                  <Play className="w-4 h-4" />
                </motion.button>
              )}
            </div>
          )}
        />
      </motion.div>

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
        <form onSubmit={handleCreateCampaign} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('tenant.governance.campaignName')}
            </label>
            <input
              type="text"
              required
              className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Q4 2024 Access Review"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('tenant.governance.description')}
            </label>
            <textarea
              required
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Quarterly review of user access rights and permissions"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('tenant.governance.targetType')}
            </label>
            <select
              className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('tenant.governance.startDate')}
              </label>
              <input
                type="date"
                required
                className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('tenant.governance.endDate')}
              </label>
              <input
                type="date"
                required
                className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              {error}
            </div>
          )}

          <div className="flex gap-3 justify-end pt-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => {
                setShowCreateModal(false);
                resetForm();
                setError('');
              }}
              className="px-6 py-3 border border-gray-300 dark:border-slate-600 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 font-medium transition-all"
            >
              {t('common.cancel')}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg font-medium transition-all"
            >
              {t('common.create')}
            </motion.button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
