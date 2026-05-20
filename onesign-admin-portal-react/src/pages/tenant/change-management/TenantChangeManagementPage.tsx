import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getTenantId } from '@/lib/tenant-context';
import Modal from '@/components/common/Modal';
import { changeManagementService } from '@/lib/api/services/change-management.service';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GitBranch,
  Plus,
  ArrowLeft,
  FileText,
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Play,
  Calendar,
  RotateCcw,
  Copy,
  Send,
  Trash2,
  Eye,
  Users,
  Server,
  Activity,
  ChevronLeft,
  ChevronRight,
  Zap,
  LayoutTemplate
} from 'lucide-react';

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

interface ChangeSet {
  id: string;
  name: string;
  description: string;
  status: 'Draft' | 'InReview' | 'Approved' | 'Scheduled' | 'Applied' | 'Rejected';
  targetModule: string;
  changesJson: string;
  scheduledAt?: string;
  appliedAt?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface ChangeSetDetails extends ChangeSet {
  changes: Array<{
    id: string;
    type: string;
    entity: string;
    operation: string;
    before: any;
    after: any;
  }>;
  metadata: {
    estimatedImpact: string;
    affectedResources: number;
    requiredDowntime: string;
  };
}

interface SimulationResult {
  success: boolean;
  warnings: string[];
  errors: string[];
  affectedEntities: Array<{
    type: string;
    id: string;
    name: string;
    change: string;
  }>;
  estimatedDuration: string;
}

interface ImpactAnalysis {
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  affectedUsers: number;
  affectedGroups: number;
  affectedApplications: number;
  dependencies: Array<{
    type: string;
    name: string;
    impact: string;
  }>;
  recommendations: string[];
}

interface ExecutionLog {
  id: string;
  timestamp: string;
  action: string;
  status: 'Success' | 'Warning' | 'Error';
  message: string;
  details?: string;
}

interface Approval {
  id: string;
  approverId: string;
  approverName: string;
  approverRole: string;
  decision: 'Approved' | 'Rejected' | 'Pending';
  comment: string;
  timestamp: string;
}

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  targetModule: string;
  templateJson: string;
  usageCount: number;
  createdAt: string;
}

type Tab = 'list' | 'details' | 'simulation' | 'executionLog' | 'approvals' | 'templates';
type StatusFilter = 'All' | 'Draft' | 'InReview' | 'Approved' | 'Scheduled' | 'Applied' | 'Rejected';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Draft':
      return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300';
    case 'InReview':
      return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
    case 'Approved':
      return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
    case 'Scheduled':
      return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
    case 'Applied':
      return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300';
    case 'Rejected':
      return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
    case 'Pending':
      return 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300';
    default:
      return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'Draft':
      return <FileText className="w-3 h-3" />;
    case 'InReview':
      return <Clock className="w-3 h-3" />;
    case 'Approved':
      return <CheckCircle className="w-3 h-3" />;
    case 'Scheduled':
      return <Calendar className="w-3 h-3" />;
    case 'Applied':
      return <Zap className="w-3 h-3" />;
    case 'Rejected':
      return <XCircle className="w-3 h-3" />;
    default:
      return <FileText className="w-3 h-3" />;
  }
};

export default function TenantChangeManagementPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<Tab>('list');
  const [tenantId, setTenantIdState] = useState<string>('');
  const [userId] = useState('00000000-0000-0000-0000-000000000001');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Data states
  const [changeSets, setChangeSets] = useState<ChangeSet[]>([]);
  const [selectedChangeSet, setSelectedChangeSet] = useState<ChangeSet | null>(null);
  const [changeSetDetails, setChangeSetDetails] = useState<ChangeSetDetails | null>(null);
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [impactAnalysis, setImpactAnalysis] = useState<ImpactAnalysis | null>(null);
  const [executionLogs, setExecutionLogs] = useState<ExecutionLog[]>([]);
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = 20;

  // Filters
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showCloneModal, setShowCloneModal] = useState(false);
  const [showExecuteModal, setShowExecuteModal] = useState(false);
  const [showRollbackModal, setShowRollbackModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);

  // Form states
  const [newChangeSet, setNewChangeSet] = useState({
    name: '',
    description: '',
    targetModule: 'Users',
    changesJson: '{}',
    scheduledAt: '',
  });

  const [scheduleData, setScheduleData] = useState({
    scheduledAt: '',
    timezone: 'UTC',
    notifyUsers: true,
  });

  const [approvalComment, setApprovalComment] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [cloneName, setCloneName] = useState('');

  const targetModules = ['Users', 'Groups', 'Applications', 'Policies', 'Settings', 'Security'];

  useEffect(() => {
    const contextTenantId = getTenantId();
    setTenantIdState(contextTenantId || '00000000-0000-0000-0000-000000000000');
  }, []);

  useEffect(() => {
    if (tenantId) {
      fetchData();
    }
  }, [tenantId, activeTab, page, statusFilter, selectedChangeSet]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      if (activeTab === 'list') {
        await fetchChangeSets();
      } else if (activeTab === 'details' && selectedChangeSet) {
        await fetchChangeSetDetails(selectedChangeSet.id);
      } else if (activeTab === 'simulation' && selectedChangeSet) {
        await fetchImpactAnalysis(selectedChangeSet.id);
      } else if (activeTab === 'executionLog' && selectedChangeSet) {
        await fetchExecutionLogs(selectedChangeSet.id);
      } else if (activeTab === 'approvals' && selectedChangeSet) {
        await fetchApprovals(selectedChangeSet.id);
      } else if (activeTab === 'templates') {
        await fetchTemplates();
      }
    } catch (err) {
      setError(t('common.error'));
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchChangeSets = async () => {
    try {
      const data = await changeManagementService.getTenantChangeSets(tenantId, {
        page,
        pageSize,
        status: statusFilter !== 'All' ? statusFilter : undefined,
      });
      setChangeSets(data.items || []);
      setTotalItems(data.totalCount || 0);
    } catch (err) {
      console.error('Failed to fetch change sets:', err);
      setError(t('common.error'));
      setChangeSets([]);
      setTotalItems(0);
    }
  };

  const fetchChangeSetDetails = async (id: string) => {
    try {
      const data = await changeManagementService.getTenantChangeSet(tenantId, id);
      setChangeSetDetails(data as any);
    } catch (err) {
      console.error('Failed to fetch change set details:', err);
      setError(t('common.error'));
      setChangeSetDetails(null);
    }
  };

  const handleSimulate = async (id: string) => {
    setLoading(true);
    try {
      const data = await changeManagementService.simulateTenantChangeSet(tenantId, id, userId);
      setSimulationResult(data as any);
      setSuccess(t('tenant.changeManagement.messages.simulationCompleted'));
    } catch (err) {
      console.error('Simulation failed:', err);
      setError(t('common.error'));
      setSimulationResult(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchExecutionLogs = async (id: string) => {
    try {
      const data = await changeManagementService.getTenantExecutionLog(tenantId, id);
      setExecutionLogs(data || []);
    } catch (err) {
      console.error('Failed to fetch execution logs:', err);
      setError(t('common.error'));
      setExecutionLogs([]);
    }
  };

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChangeSet) return;

    setLoading(true);
    try {
      await changeManagementService.scheduleTenantChangeSet(
        tenantId,
        selectedChangeSet.id,
        userId,
        scheduleData
      );
      setSuccess(t('tenant.changeManagement.messages.scheduled'));
      setShowScheduleModal(false);
      fetchData();
    } catch (err) {
      setError(t('tenant.changeManagement.errors.failedToSchedule'));
    } finally {
      setLoading(false);
    }
  };

  const handleExecute = async () => {
    if (!selectedChangeSet) return;

    setLoading(true);
    try {
      await changeManagementService.executeTenantChangeSet(tenantId, selectedChangeSet.id, userId);
      setSuccess(t('tenant.changeManagement.messages.executed'));
      setShowExecuteModal(false);
      fetchData();
    } catch (err) {
      setError(t('tenant.changeManagement.errors.failedToExecute'));
    } finally {
      setLoading(false);
    }
  };

  const handleRollback = async () => {
    if (!selectedChangeSet) return;

    setLoading(true);
    try {
      await changeManagementService.rollbackTenantChangeSet(tenantId, selectedChangeSet.id, userId);
      setSuccess(t('tenant.changeManagement.messages.rolledBack'));
      setShowRollbackModal(false);
      fetchData();
    } catch (err) {
      setError(t('tenant.changeManagement.errors.failedToRollback'));
    } finally {
      setLoading(false);
    }
  };

  const handleApproveChangeSet = async () => {
    if (!selectedChangeSet) return;

    setLoading(true);
    try {
      await changeManagementService.approveTenantChangeSet(
        tenantId,
        selectedChangeSet.id,
        userId,
        approvalComment
      );
      setSuccess(t('tenant.changeManagement.messages.approved'));
      setShowApprovalModal(false);
      setApprovalComment('');
      fetchData();
    } catch (err) {
      setError(t('tenant.changeManagement.errors.failedToApprove'));
    } finally {
      setLoading(false);
    }
  };

  const handleRejectChangeSet = async () => {
    if (!selectedChangeSet || !rejectReason.trim()) {
      setError(t('tenant.changeManagement.errors.provideReason'));
      return;
    }

    setLoading(true);
    try {
      await changeManagementService.rejectTenantChangeSet(
        tenantId,
        selectedChangeSet.id,
        userId,
        rejectReason
      );
      setSuccess(t('tenant.changeManagement.messages.rejected'));
      setShowRejectModal(false);
      setRejectReason('');
      fetchData();
    } catch (err) {
      setError(t('tenant.changeManagement.errors.failedToReject'));
    } finally {
      setLoading(false);
    }
  };

  const fetchApprovals = async (id: string) => {
    try {
      const data = await changeManagementService.getTenantApprovals(tenantId, id);
      setApprovals(data || []);
    } catch (err) {
      console.error('Failed to fetch approvals:', err);
      setError(t('common.error'));
      setApprovals([]);
    }
  };

  const fetchImpactAnalysis = async (id: string) => {
    try {
      const data = await changeManagementService.getTenantImpactAnalysis(tenantId, id);
      setImpactAnalysis(data as any);
    } catch (err) {
      console.error('Failed to fetch impact analysis:', err);
      setError(t('common.error'));
      setImpactAnalysis(null);
    }
  };

  const handleClone = async () => {
    if (!selectedChangeSet || !cloneName.trim()) {
      setError(t('tenant.changeManagement.errors.provideCloneName'));
      return;
    }

    setLoading(true);
    try {
      await changeManagementService.cloneTenantChangeSet(
        tenantId,
        selectedChangeSet.id,
        userId,
        cloneName
      );
      setSuccess(t('tenant.changeManagement.messages.cloned'));
      setShowCloneModal(false);
      setCloneName('');
      fetchData();
    } catch (err) {
      setError(t('tenant.changeManagement.errors.failedToClone'));
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const data = await changeManagementService.getTenantTemplates(tenantId);
      setTemplates(data || []);
    } catch (err) {
      console.error('Failed to fetch templates:', err);
      setTemplates([]);
    }
  };

  const handleCreateFromTemplate = async (template: Template) => {
    setNewChangeSet({
      name: `${template.name} - ${new Date().toLocaleDateString()}`,
      description: template.description,
      targetModule: template.targetModule,
      changesJson: template.templateJson,
      scheduledAt: '',
    });
    setShowCreateModal(true);
  };

  const handleCreateChangeSet = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await changeManagementService.createTenantChangeSet(tenantId, userId, newChangeSet);
      setSuccess(t('tenant.changeManagement.messages.created'));
      setShowCreateModal(false);
      setNewChangeSet({
        name: '',
        description: '',
        targetModule: 'Users',
        changesJson: '{}',
        scheduledAt: '',
      });
      fetchData();
    } catch (err) {
      setError(t('common.error'));
    }
  };

  const handleSubmitForReview = async (changeSet: ChangeSet) => {
    try {
      await changeManagementService.submitTenantChangeSet(tenantId, changeSet.id, userId);
      setSuccess(t('tenant.changeManagement.messages.submitted'));
      fetchData();
    } catch (err) {
      setError(t('common.error'));
    }
  };

  const handleDeleteChangeSet = async (id: string) => {
    if (!confirm(t('tenant.changeManagement.confirmDelete'))) return;

    try {
      await changeManagementService.deleteTenantChangeSet(tenantId, id);
      setSuccess(t('tenant.changeManagement.messages.deleted'));
      fetchData();
    } catch (err) {
      setError(t('common.error'));
    }
  };

  const handleSelectChangeSet = (changeSet: ChangeSet) => {
    setSelectedChangeSet(changeSet);
    setActiveTab('details');
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low': return 'from-green-500 to-emerald-600';
      case 'Medium': return 'from-yellow-500 to-orange-600';
      case 'High': return 'from-orange-500 to-red-600';
      case 'Critical': return 'from-red-500 to-rose-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const totalPages = Math.ceil(totalItems / pageSize);
  const mainTabs: Tab[] = ['list', 'templates'];
  const detailTabs: Tab[] = ['details', 'simulation', 'executionLog', 'approvals'];

  // Calculate stats
  const draftCount = changeSets.filter(c => c.status === 'Draft').length;
  const inReviewCount = changeSets.filter(c => c.status === 'InReview').length;
  const approvedCount = changeSets.filter(c => c.status === 'Approved').length;
  const appliedCount = changeSets.filter(c => c.status === 'Applied').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      <Helmet>
        <title>{t('tenant.changeManagement.title') || 'Change Management'} | OneSign</title>
      </Helmet>

      <div className="p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
                <GitBranch className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {t('tenant.changeManagement.title') || 'Change Management'}
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                  {t('tenant.changeManagement.subtitle') || 'Manage and track organizational changes'}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              {activeTab === 'list' && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Plus className="w-5 h-5" />
                  {t('tenant.changeManagement.createChangeSet', 'Create Change Set')}
                </motion.button>
              )}
              {selectedChangeSet && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setSelectedChangeSet(null);
                    setActiveTab('list');
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-200 rounded-lg shadow border border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-600 transition-all duration-300"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Back to List
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Error/Success Messages */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl flex items-center gap-2"
            >
              <XCircle className="w-5 h-5" />
              {error}
            </motion.div>
          )}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 px-4 py-3 rounded-xl flex items-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              {success}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats Cards */}
        {!selectedChangeSet && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Draft"
              value={draftCount}
              icon={<FileText className="w-6 h-6 text-white" />}
              color="from-gray-500 to-slate-600"
              delay={0}
            />
            <StatCard
              title="In Review"
              value={inReviewCount}
              icon={<Clock className="w-6 h-6 text-white" />}
              color="from-yellow-500 to-orange-600"
              delay={1}
            />
            <StatCard
              title="Approved"
              value={approvedCount}
              icon={<CheckCircle className="w-6 h-6 text-white" />}
              color="from-green-500 to-emerald-600"
              delay={2}
            />
            <StatCard
              title="Applied"
              value={appliedCount}
              icon={<Zap className="w-6 h-6 text-white" />}
              color="from-indigo-500 to-purple-600"
              delay={3}
            />
          </div>
        )}

        {/* Tabs Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-2"
        >
          <nav className="flex space-x-2">
            {(!selectedChangeSet ? mainTabs : detailTabs).map((tab) => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); if (tab === 'list') setPage(1); }}
                className={`relative flex-1 py-3 px-6 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === tab
                    ? 'text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700'
                }`}
              >
                {activeTab === tab && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {tab === 'list' && <FileText className="w-4 h-4" />}
                  {tab === 'templates' && <LayoutTemplate className="w-4 h-4" />}
                  {tab === 'details' && <Eye className="w-4 h-4" />}
                  {tab === 'simulation' && <Activity className="w-4 h-4" />}
                  {tab === 'executionLog' && <Clock className="w-4 h-4" />}
                  {tab === 'approvals' && <CheckCircle className="w-4 h-4" />}
                  {tab === 'list' ? 'Change Sets' :
                   tab === 'templates' ? 'Templates' :
                   tab === 'details' ? 'Details' :
                   tab === 'simulation' ? 'Simulation & Impact' :
                   tab === 'executionLog' ? 'Execution Log' : 'Approvals'}
                </span>
              </button>
            ))}
          </nav>
        </motion.div>

        {/* List Tab */}
        {activeTab === 'list' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Filter */}
            <div className="mb-6 flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter by Status:</label>
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value as StatusFilter); setPage(1); }}
                className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="All">All</option>
                <option value="Draft">Draft</option>
                <option value="InReview">In Review</option>
                <option value="Approved">Approved</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Applied">Applied</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            {/* Table */}
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                  <thead className="bg-gray-50 dark:bg-slate-700/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Module</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Created</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                    {changeSets.map((changeSet, index) => (
                      <motion.tr
                        key={changeSet.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="text-sm font-semibold text-gray-900 dark:text-white">{changeSet.name}</div>
                          {changeSet.description && (
                            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{changeSet.description}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                            {changeSet.targetModule}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(changeSet.status)}`}>
                            {getStatusIcon(changeSet.status)}
                            {changeSet.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                          {new Date(changeSet.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex gap-2">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleSelectChangeSet(changeSet)}
                              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 font-medium flex items-center gap-1"
                            >
                              <Eye className="w-4 h-4" />
                              View
                            </motion.button>
                            {changeSet.status === 'Draft' && (
                              <>
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => handleSubmitForReview(changeSet)}
                                  className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 font-medium flex items-center gap-1"
                                >
                                  <Send className="w-4 h-4" />
                                  Submit
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => handleDeleteChangeSet(changeSet.id)}
                                  className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 font-medium flex items-center gap-1"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Delete
                                </motion.button>
                              </>
                            )}
                            {changeSet.status === 'Approved' && (
                              <>
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => {
                                    setSelectedChangeSet(changeSet);
                                    setShowExecuteModal(true);
                                  }}
                                  className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300 font-medium flex items-center gap-1"
                                >
                                  <Play className="w-4 h-4" />
                                  Execute
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => {
                                    setSelectedChangeSet(changeSet);
                                    setShowScheduleModal(true);
                                  }}
                                  className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 font-medium flex items-center gap-1"
                                >
                                  <Calendar className="w-4 h-4" />
                                  Schedule
                                </motion.button>
                              </>
                            )}
                            {changeSet.status === 'Applied' && (
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                  setSelectedChangeSet(changeSet);
                                  setShowRollbackModal(true);
                                }}
                                className="text-orange-600 dark:text-orange-400 hover:text-orange-900 dark:hover:text-orange-300 font-medium flex items-center gap-1"
                              >
                                <RotateCcw className="w-4 h-4" />
                                Rollback
                              </motion.button>
                            )}
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => {
                                setSelectedChangeSet(changeSet);
                                setCloneName(`${changeSet.name} - Copy`);
                                setShowCloneModal(true);
                              }}
                              className="text-purple-600 dark:text-purple-400 hover:text-purple-900 dark:hover:text-purple-300 font-medium flex items-center gap-1"
                            >
                              <Copy className="w-4 h-4" />
                              Clone
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                    {changeSets.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center">
                          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500 dark:text-gray-400">No change sets found.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalItems > pageSize && (
                <div className="px-6 py-4 border-t border-gray-200 dark:border-slate-700 flex justify-between items-center">
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Page {page} of {totalPages}
                  </span>
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="flex items-center gap-1 px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg disabled:opacity-50 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setPage(p => p + 1)}
                      disabled={page >= totalPages}
                      className="flex items-center gap-1 px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg disabled:opacity-50 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700"
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Details Tab */}
        {activeTab === 'details' && selectedChangeSet && changeSetDetails && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Overview Card */}
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{changeSetDetails.name}</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">{changeSetDetails.description}</p>

              <div className="grid grid-cols-3 gap-6 mb-6">
                <div className="bg-gray-50 dark:bg-slate-700/50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Status</p>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(changeSetDetails.status)}`}>
                    {getStatusIcon(changeSetDetails.status)}
                    {changeSetDetails.status}
                  </span>
                </div>
                <div className="bg-gray-50 dark:bg-slate-700/50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Target Module</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{changeSetDetails.targetModule}</p>
                </div>
                <div className="bg-gray-50 dark:bg-slate-700/50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Created By</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{changeSetDetails.createdBy}</p>
                </div>
                <div className="bg-gray-50 dark:bg-slate-700/50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Estimated Impact</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{changeSetDetails.metadata.estimatedImpact}</p>
                </div>
                <div className="bg-gray-50 dark:bg-slate-700/50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Affected Resources</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{changeSetDetails.metadata.affectedResources}</p>
                </div>
                <div className="bg-gray-50 dark:bg-slate-700/50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Required Downtime</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{changeSetDetails.metadata.requiredDowntime}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-slate-700">
                {changeSetDetails.status === 'InReview' && (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowApprovalModal(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg shadow-lg"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Approve
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowRejectModal(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-lg shadow-lg"
                    >
                      <XCircle className="w-5 h-5" />
                      Reject
                    </motion.button>
                  </>
                )}
                {changeSetDetails.status === 'Approved' && (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowExecuteModal(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg shadow-lg"
                    >
                      <Play className="w-5 h-5" />
                      Execute Now
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowScheduleModal(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg shadow-lg"
                    >
                      <Calendar className="w-5 h-5" />
                      Schedule
                    </motion.button>
                  </>
                )}
              </div>
            </div>

            {/* Changes List */}
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Changes</h3>
              <div className="space-y-4">
                {changeSetDetails.changes.map((change, index) => (
                  <motion.div
                    key={change.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border border-gray-200 dark:border-slate-700 rounded-lg p-4 bg-gray-50 dark:bg-slate-700/50"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="font-semibold text-gray-900 dark:text-white">{change.type}</span>
                        <span className="text-gray-500 dark:text-gray-400 ml-2">({change.entity})</span>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        change.operation === 'CREATE' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
                        change.operation === 'UPDATE' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' :
                        'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                      }`}>
                        {change.operation}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-3">
                      {change.before && (
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Before</p>
                          <pre className="text-xs bg-white dark:bg-slate-800 p-2 rounded border border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white overflow-auto">
                            {JSON.stringify(change.before, null, 2)}
                          </pre>
                        </div>
                      )}
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">After</p>
                        <pre className="text-xs bg-white dark:bg-slate-800 p-2 rounded border border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white overflow-auto">
                          {JSON.stringify(change.after, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Simulation Tab */}
        {activeTab === 'simulation' && selectedChangeSet && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Impact Analysis */}
            {impactAnalysis && (
              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Impact Analysis</h2>
                <div className="grid grid-cols-4 gap-6 mb-6">
                  <div className="text-center p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Risk Level</p>
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium text-white bg-gradient-to-r ${getRiskColor(impactAnalysis.riskLevel)}`}>
                      <AlertTriangle className="w-4 h-4" />
                      {impactAnalysis.riskLevel}
                    </span>
                  </div>
                  <div className="text-center p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Affected Users</p>
                    <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{impactAnalysis.affectedUsers}</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Affected Groups</p>
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">{impactAnalysis.affectedGroups}</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Affected Apps</p>
                    <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{impactAnalysis.affectedApplications}</p>
                  </div>
                </div>

                {impactAnalysis.dependencies.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-3">Dependencies</h3>
                    <div className="space-y-2">
                      {impactAnalysis.dependencies.map((dep, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                          <div>
                            <span className="font-semibold text-gray-900 dark:text-white">{dep.name}</span>
                            <span className="text-gray-500 dark:text-gray-400 text-sm ml-2">({dep.type})</span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{dep.impact}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {impactAnalysis.recommendations.length > 0 && (
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-3">Recommendations</h3>
                    <ul className="space-y-2">
                      {impactAnalysis.recommendations.map((rec, idx) => (
                        <li key={idx} className="flex items-start">
                          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mr-2 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700 dark:text-gray-300">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Simulation */}
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Simulation</h2>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSimulate(selectedChangeSet.id)}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg shadow-lg"
                >
                  <Play className="w-5 h-5" />
                  Run Simulation
                </motion.button>
              </div>

              {simulationResult && (
                <div className="space-y-4">
                  <div className={`p-4 rounded-lg ${simulationResult.success ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'}`}>
                    <div className="flex items-center gap-2">
                      {simulationResult.success ? (
                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                      )}
                      <p className={`font-semibold ${simulationResult.success ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'}`}>
                        {simulationResult.success ? 'Simulation Successful' : 'Simulation Failed'}
                      </p>
                    </div>
                    <p className="text-sm mt-1 text-gray-600 dark:text-gray-400">Estimated Duration: {simulationResult.estimatedDuration}</p>
                  </div>

                  {simulationResult.warnings.length > 0 && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                        <p className="font-semibold text-yellow-800 dark:text-yellow-300">Warnings</p>
                      </div>
                      <ul className="list-disc list-inside text-sm">
                        {simulationResult.warnings.map((warning, idx) => (
                          <li key={idx} className="text-yellow-700 dark:text-yellow-300">{warning}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {simulationResult.affectedEntities.length > 0 && (
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white mb-3">Affected Entities</h3>
                      <div className="space-y-2">
                        {simulationResult.affectedEntities.map((entity) => (
                          <div key={entity.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                            <div className="flex items-center gap-2">
                              {entity.type === 'User' ? <Users className="w-4 h-4 text-gray-500" /> : <Server className="w-4 h-4 text-gray-500" />}
                              <span className="font-semibold text-gray-900 dark:text-white">{entity.name}</span>
                              <span className="text-gray-500 dark:text-gray-400 text-sm">({entity.type})</span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{entity.change}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Execution Log Tab */}
        {activeTab === 'executionLog' && selectedChangeSet && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Execution Log</h2>
            <div className="space-y-3">
              {executionLogs.map((log, index) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`border-l-4 pl-4 py-3 bg-gray-50 dark:bg-slate-700/50 rounded-r-lg ${
                    log.status === 'Success' ? 'border-green-500' :
                    log.status === 'Warning' ? 'border-yellow-500' : 'border-red-500'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900 dark:text-white">{log.action}</span>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        log.status === 'Success' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
                        log.status === 'Warning' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' :
                        'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                      }`}>
                        {log.status === 'Success' ? <CheckCircle className="w-3 h-3" /> :
                         log.status === 'Warning' ? <AlertTriangle className="w-3 h-3" /> :
                         <XCircle className="w-3 h-3" />}
                        {log.status}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{new Date(log.timestamp).toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{log.message}</p>
                  {log.details && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{log.details}</p>
                  )}
                </motion.div>
              ))}
              {executionLogs.length === 0 && (
                <div className="text-center py-12">
                  <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No execution logs available</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Approvals Tab */}
        {activeTab === 'approvals' && selectedChangeSet && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Approval Status</h2>
            <div className="space-y-4">
              {approvals.map((approval, index) => (
                <motion.div
                  key={approval.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border border-gray-200 dark:border-slate-700 rounded-lg p-4 bg-gray-50 dark:bg-slate-700/50"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{approval.approverName}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{approval.approverRole}</p>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(approval.decision)}`}>
                      {approval.decision === 'Approved' ? <CheckCircle className="w-3 h-3" /> :
                       approval.decision === 'Rejected' ? <XCircle className="w-3 h-3" /> :
                       <Clock className="w-3 h-3" />}
                      {approval.decision}
                    </span>
                  </div>
                  {approval.comment && (
                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-2 italic">&ldquo;{approval.comment}&rdquo;</p>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{new Date(approval.timestamp).toLocaleString()}</p>
                </motion.div>
              ))}
              {approvals.length === 0 && (
                <div className="text-center py-12">
                  <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No approvals yet</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {templates.map((template, index) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -4 }}
                className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6 hover:shadow-xl transition-all"
              >
                <div className="mb-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">{template.name}</h3>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300">
                      {template.category}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{template.description}</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Module: {template.targetModule}</span>
                    <span className="text-gray-500 dark:text-gray-400">Used {template.usageCount}x</span>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleCreateFromTemplate(template)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg shadow-lg hover:shadow-xl transition-all"
                >
                  <LayoutTemplate className="w-5 h-5" />
                  Use Template
                </motion.button>
              </motion.div>
            ))}
            {templates.length === 0 && (
              <div className="col-span-3 text-center py-12">
                <LayoutTemplate className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No templates available</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Create Change Set Modal */}
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title={t('tenant.changeManagement.createChangeSet', 'Create Change Set')}
          size="lg"
        >
          <form onSubmit={handleCreateChangeSet}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Name *</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  value={newChangeSet.name}
                  onChange={(e) => setNewChangeSet({ ...newChangeSet, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Description</label>
                <textarea
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  rows={3}
                  value={newChangeSet.description}
                  onChange={(e) => setNewChangeSet({ ...newChangeSet, description: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Target Module *</label>
                <select
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  value={newChangeSet.targetModule}
                  onChange={(e) => setNewChangeSet({ ...newChangeSet, targetModule: e.target.value })}
                >
                  {targetModules.map(module => (
                    <option key={module} value={module}>{module}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Changes (JSON) *</label>
                <textarea
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-indigo-500"
                  rows={5}
                  value={newChangeSet.changesJson}
                  onChange={(e) => setNewChangeSet({ ...newChangeSet, changesJson: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-6 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg font-medium shadow-lg hover:shadow-xl"
              >
                Create
              </button>
            </div>
          </form>
        </Modal>

        {/* Schedule Modal */}
        <Modal
          isOpen={showScheduleModal}
          onClose={() => setShowScheduleModal(false)}
          title="Schedule Execution"
          size="md"
        >
          <form onSubmit={handleSchedule}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Scheduled Time *</label>
                <input
                  type="datetime-local"
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  value={scheduleData.scheduledAt}
                  onChange={(e) => setScheduleData({ ...scheduleData, scheduledAt: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Timezone</label>
                <select
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  value={scheduleData.timezone}
                  onChange={(e) => setScheduleData({ ...scheduleData, timezone: e.target.value })}
                >
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">Eastern Time</option>
                  <option value="America/Chicago">Central Time</option>
                  <option value="America/Los_Angeles">Pacific Time</option>
                </select>
              </div>
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="mr-2 w-4 h-4 text-indigo-600 rounded"
                    checked={scheduleData.notifyUsers}
                    onChange={(e) => setScheduleData({ ...scheduleData, notifyUsers: e.target.checked })}
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Notify affected users</span>
                </label>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => setShowScheduleModal(false)}
                className="flex-1 px-6 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-medium shadow-lg hover:shadow-xl"
              >
                Schedule
              </button>
            </div>
          </form>
        </Modal>

        {/* Execute Confirmation Modal */}
        <Modal
          isOpen={showExecuteModal}
          onClose={() => setShowExecuteModal(false)}
          title="Execute Change Set"
          size="md"
        >
          <div className="space-y-4">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4 rounded-lg flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-yellow-800 dark:text-yellow-300 font-semibold">Warning</p>
                <p className="text-yellow-700 dark:text-yellow-400 text-sm mt-1">
                  This will execute the change set immediately. This action may affect production systems.
                </p>
              </div>
            </div>
            {selectedChangeSet && (
              <div className="bg-gray-50 dark:bg-slate-700/50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Change Set:</p>
                <p className="font-semibold text-gray-900 dark:text-white">{selectedChangeSet.name}</p>
              </div>
            )}
          </div>
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setShowExecuteModal(false)}
              className="flex-1 px-6 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              onClick={handleExecute}
              className="flex-1 px-6 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-medium shadow-lg hover:shadow-xl"
            >
              Execute Now
            </button>
          </div>
        </Modal>

        {/* Rollback Confirmation Modal */}
        <Modal
          isOpen={showRollbackModal}
          onClose={() => setShowRollbackModal(false)}
          title="Rollback Change Set"
          size="md"
        >
          <div className="space-y-4">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-lg flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-800 dark:text-red-300 font-semibold">Critical Action</p>
                <p className="text-red-700 dark:text-red-400 text-sm mt-1">
                  This will rollback all changes from this change set. Make sure you understand the impact.
                </p>
              </div>
            </div>
            {selectedChangeSet && (
              <div className="bg-gray-50 dark:bg-slate-700/50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Change Set:</p>
                <p className="font-semibold text-gray-900 dark:text-white">{selectedChangeSet.name}</p>
              </div>
            )}
          </div>
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setShowRollbackModal(false)}
              className="flex-1 px-6 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              onClick={handleRollback}
              className="flex-1 px-6 py-2.5 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-lg font-medium shadow-lg hover:shadow-xl"
            >
              Rollback
            </button>
          </div>
        </Modal>

        {/* Approval Modal */}
        <Modal
          isOpen={showApprovalModal}
          onClose={() => setShowApprovalModal(false)}
          title="Approve Change Set"
          size="md"
        >
          <div className="space-y-4">
            {selectedChangeSet && (
              <div className="bg-gray-50 dark:bg-slate-700/50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Change Set:</p>
                <p className="font-semibold text-gray-900 dark:text-white">{selectedChangeSet.name}</p>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Comment (Optional)</label>
              <textarea
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                rows={3}
                placeholder={t('tenant.changeManagement.placeholders.approvalComment')}
                value={approvalComment}
                onChange={(e) => setApprovalComment(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setShowApprovalModal(false)}
              className="flex-1 px-6 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              onClick={handleApproveChangeSet}
              className="flex-1 px-6 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-medium shadow-lg hover:shadow-xl"
            >
              Approve
            </button>
          </div>
        </Modal>

        {/* Reject Modal */}
        <Modal
          isOpen={showRejectModal}
          onClose={() => setShowRejectModal(false)}
          title="Reject Change Set"
          size="md"
        >
          <div className="space-y-4">
            {selectedChangeSet && (
              <div className="bg-gray-50 dark:bg-slate-700/50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Change Set:</p>
                <p className="font-semibold text-gray-900 dark:text-white">{selectedChangeSet.name}</p>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Reason for Rejection *</label>
              <textarea
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                rows={4}
                placeholder={t('tenant.changeManagement.placeholders.rejectReason')}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setShowRejectModal(false)}
              className="flex-1 px-6 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              onClick={handleRejectChangeSet}
              className="flex-1 px-6 py-2.5 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-lg font-medium shadow-lg hover:shadow-xl"
            >
              Reject
            </button>
          </div>
        </Modal>

        {/* Clone Modal */}
        <Modal
          isOpen={showCloneModal}
          onClose={() => setShowCloneModal(false)}
          title="Clone Change Set"
          size="md"
        >
          <div className="space-y-4">
            {selectedChangeSet && (
              <div className="bg-gray-50 dark:bg-slate-700/50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Original Change Set:</p>
                <p className="font-semibold text-gray-900 dark:text-white">{selectedChangeSet.name}</p>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">New Name *</label>
              <input
                type="text"
                required
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                value={cloneName}
                onChange={(e) => setCloneName(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setShowCloneModal(false)}
              className="flex-1 px-6 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              onClick={handleClone}
              className="flex-1 px-6 py-2.5 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg font-medium shadow-lg hover:shadow-xl"
            >
              Clone
            </button>
          </div>
        </Modal>
      </div>
    </div>
  );
}
