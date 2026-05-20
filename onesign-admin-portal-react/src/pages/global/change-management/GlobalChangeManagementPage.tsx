import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from '@/components/common/Modal';
import StatusBadge from '@/components/common/StatusBadge';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { changeManagementService } from '@/lib/api/services/change-management.service';
import { Helmet } from 'react-helmet-async';

interface ChangeSet {
  id: string;
  tenantId: string;
  tenantName?: string;
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

interface GlobalApprovalRule {
  id: string;
  name: string;
  targetModule: string;
  requiredApprovers: number;
  approverRoles: string[];
  isEnforced: boolean;
  tenantCanOverride: boolean;
  isActive: boolean;
  createdAt: string;
}

interface ChangeHistory {
  id: string;
  changeSetId: string;
  changeSetName: string;
  tenantId: string;
  tenantName?: string;
  action: string;
  performedBy: string;
  performedAt: string;
  details: string;
}

type Tab = 'list' | 'details' | 'simulation' | 'executionLog' | 'approvals' | 'templates' | 'globalRules' | 'history';
type StatusFilter = 'All' | 'Draft' | 'InReview' | 'Approved' | 'Scheduled' | 'Applied' | 'Rejected';

export default function GlobalChangeManagementPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<Tab>('list');
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
  const [globalRules, setGlobalRules] = useState<GlobalApprovalRule[]>([]);
  const [changeHistory, setChangeHistory] = useState<ChangeHistory[]>([]);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = 20;

  // Filters
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');
  const [tenantFilter, setTenantFilter] = useState('');

  // Modals
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showExecuteModal, setShowExecuteModal] = useState(false);
  const [showRollbackModal, setShowRollbackModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);

  // Form states
  const [newRule, setNewRule] = useState({
    name: '',
    targetModule: 'Users',
    requiredApprovers: 2,
    approverRoles: ['GlobalAdmin', 'SecurityAdmin'],
    isEnforced: true,
    tenantCanOverride: false,
    isActive: true,
  });

  const [scheduleData, setScheduleData] = useState({
    scheduledAt: '',
    timezone: 'UTC',
    notifyUsers: true,
  });

  const [approvalComment, setApprovalComment] = useState('');
  const [rejectReason, setRejectReason] = useState('');

  const targetModules = ['Users', 'Groups', 'Applications', 'Policies', 'Settings', 'Security'];

  useEffect(() => {
    fetchData();
  }, [activeTab, page, statusFilter, tenantFilter, selectedChangeSet]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      if (activeTab === 'list') {
        await fetchAllChangeSets();
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
      } else if (activeTab === 'globalRules') {
        await fetchGlobalRules();
      } else if (activeTab === 'history') {
        await fetchChangeHistory();
      }
    } catch (err) {
      setError(t('common.error'));
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllChangeSets = async () => {
    const params: any = { page, pageSize };
    if (statusFilter !== 'All') {
      params.status = statusFilter;
    }
    if (tenantFilter) {
      params.tenantId = tenantFilter;
    }
    try {
      const data = await changeManagementService.getGlobalChangeSets(params);
      setChangeSets(data.items || []);
      setTotalItems(data.totalCount || 0);
    } catch (err) {
      console.error('Failed to fetch global change sets:', err);
      setError(t('common.error'));
      setChangeSets([]);
      setTotalItems(0);
    }
  };

  // Endpoint implementations (similar to tenant page)
  const fetchChangeSetDetails = async (id: string) => {
    try {
      const data = await changeManagementService.getGlobalChangeSet(id);
      setChangeSetDetails(data);
    } catch (err) {
      console.error('Failed to fetch change set details:', err);
      setError(t('common.error'));
      setChangeSetDetails(null);
    }
  };

  const handleSimulate = async (id: string) => {
    setLoading(true);
    try {
      const data = await changeManagementService.simulateGlobalChangeSet(id, userId);
      setSimulationResult(data);
      setSuccess(t('global.changeManagement.messages.simulationCompleted'));
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
      const data = await changeManagementService.getGlobalExecutionLog(id);
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
      await changeManagementService.scheduleGlobalChangeSet(selectedChangeSet.id, {
        userId,
        ...scheduleData,
      });
      setSuccess(t('global.changeManagement.messages.scheduled'));
      setShowScheduleModal(false);
      fetchData();
    } catch (err) {
      setError(t('global.changeManagement.errors.failedToSchedule'));
    } finally {
      setLoading(false);
    }
  };

  const handleExecute = async () => {
    if (!selectedChangeSet) return;

    setLoading(true);
    try {
      await changeManagementService.applyGlobalChangeSet(selectedChangeSet.id, userId);
      setSuccess(t('global.changeManagement.messages.applied'));
      setShowExecuteModal(false);
      fetchData();
    } catch (err) {
      setError(t('global.changeManagement.errors.failedToApply'));
    } finally {
      setLoading(false);
    }
  };

  const handleRollback = async () => {
    if (!selectedChangeSet) return;

    setLoading(true);
    try {
      await changeManagementService.rollbackGlobalChangeSet(selectedChangeSet.id, userId);
      setSuccess(t('global.changeManagement.messages.rolledBack'));
      setShowRollbackModal(false);
      fetchData();
    } catch (err) {
      setError(t('global.changeManagement.errors.failedToRollback'));
    } finally {
      setLoading(false);
    }
  };

  const handleApproveChangeSet = async () => {
    if (!selectedChangeSet) return;

    setLoading(true);
    try {
      await changeManagementService.approveGlobalChangeSet(selectedChangeSet.id, userId, approvalComment);
      setSuccess(t('global.changeManagement.messages.approved'));
      setShowApprovalModal(false);
      setApprovalComment('');
      fetchData();
    } catch (err) {
      setError(t('global.changeManagement.errors.failedToApprove'));
    } finally {
      setLoading(false);
    }
  };

  const handleRejectChangeSet = async () => {
    if (!selectedChangeSet || !rejectReason.trim()) {
      setError(t('global.changeManagement.errors.provideReason'));
      return;
    }

    setLoading(true);
    try {
      await changeManagementService.rejectGlobalChangeSet(selectedChangeSet.id, userId, rejectReason);
      setSuccess(t('global.changeManagement.messages.rejected'));
      setShowRejectModal(false);
      setRejectReason('');
      fetchData();
    } catch (err) {
      setError(t('global.changeManagement.errors.failedToReject'));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitChangeSet = async () => {
    if (!selectedChangeSet) return;

    setLoading(true);
    try {
      await changeManagementService.submitGlobalChangeSet(selectedChangeSet.id, userId);
      setSuccess(t('global.changeManagement.messages.submitted'));
      fetchData();
    } catch (err) {
      setError(t('global.changeManagement.errors.failedToSubmit'));
    } finally {
      setLoading(false);
    }
  };

  const fetchApprovals = async (id: string) => {
    try {
      const data = await changeManagementService.getGlobalApprovals(id);
      setApprovals(data || []);
    } catch (err) {
      console.error('Failed to fetch approvals:', err);
      setError(t('common.error'));
      setApprovals([]);
    }
  };

  const fetchImpactAnalysis = async (id: string) => {
    try {
      const data = await changeManagementService.getGlobalImpactAnalysis(id, userId);
      setImpactAnalysis(data);
    } catch (err) {
      console.error('Failed to fetch impact analysis:', err);
      setError(t('common.error'));
      setImpactAnalysis(null);
    }
  };

  const fetchTemplates = async () => {
    try {
      const data = await changeManagementService.getGlobalTemplates();
      setTemplates(data || []);
    } catch (err) {
      console.error('Failed to fetch templates:', err);
      setTemplates([]);
    }
  };

  const fetchGlobalRules = async () => {
    try {
      const data = await changeManagementService.getGlobalApprovalRules();
      setGlobalRules(data || []);
    } catch (err) {
      console.error('Failed to fetch approval rules:', err);
      setGlobalRules([]);
    }
  };

  const fetchChangeHistory = async () => {
    const params: any = { page, pageSize };
    if (tenantFilter) {
      params.tenantId = tenantFilter;
    }
    try {
      const data = await changeManagementService.getGlobalChangeHistory(params);
      setChangeHistory(data.items || []);
      setTotalItems(data.totalCount || 0);
    } catch (err) {
      console.error('Failed to fetch change history:', err);
      setError(t('common.error'));
      setChangeHistory([]);
      setTotalItems(0);
    }
  };

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await changeManagementService.createGlobalApprovalRule({
        userId,
        ...newRule,
      });
      setSuccess(t('global.changeManagement.messages.ruleCreated'));
      setShowRuleModal(false);
      setNewRule({
        name: '',
        targetModule: 'Users',
        requiredApprovers: 2,
        approverRoles: ['GlobalAdmin', 'SecurityAdmin'],
        isEnforced: true,
        tenantCanOverride: false,
        isActive: true,
      });
      fetchData();
    } catch (err) {
      setError(t('common.error'));
    }
  };

  const handleToggleRule = async (rule: GlobalApprovalRule) => {
    try {
      await changeManagementService.toggleGlobalApprovalRule(rule.id, !rule.isActive);
      setSuccess(t(rule.isActive ? 'global.changeManagement.messages.ruleDisabled' : 'global.changeManagement.messages.ruleEnabled'));
      fetchData();
    } catch (err) {
      setError(t('common.error'));
    }
  };

  const handleEnforceRule = async (rule: GlobalApprovalRule) => {
    try {
      await changeManagementService.enforceGlobalApprovalRule(rule.id);
      setSuccess(t(rule.isEnforced ? 'global.changeManagement.messages.ruleUnenforced' : 'global.changeManagement.messages.ruleEnforced'));
      fetchData();
    } catch (err) {
      setError(t('common.error'));
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low': return 'success';
      case 'Medium': return 'warning';
      case 'High': return 'error';
      case 'Critical': return 'error';
      default: return 'default';
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'Applied': return 'info';
      case 'Approved': return 'success';
      case 'Rejected': return 'error';
      case 'Submitted': return 'warning';
      case 'Created': return 'default';
      default: return 'default';
    }
  };

  const handleSelectChangeSet = (changeSet: ChangeSet) => {
    setSelectedChangeSet(changeSet);
    setActiveTab('details');
  };

  const totalPages = Math.ceil(totalItems / pageSize);

  if (loading && !changeSets.length && !templates.length) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              {t('global.changeManagement.title')}
            </h1>
            <p className="text-gray-600 mt-2">{t('global.changeManagement.subtitle')}</p>
          </div>
          <div className="flex gap-3">
            {activeTab === 'globalRules' && (
              <button
                onClick={() => setShowRuleModal(true)}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 flex items-center gap-2"
              >
                <span>+</span>
                {t('global.changeManagement.createGlobalRule')}
              </button>
            )}
            {selectedChangeSet && (
              <button
                onClick={() => {
                  setSelectedChangeSet(null);
                  setActiveTab('list');
                }}
                className="bg-white text-gray-700 px-6 py-3 rounded-xl font-semibold border-2 border-gray-200 hover:border-indigo-300 transition-all duration-200"
              >
                {t('global.changeManagement.backToList')}
              </button>
            )}
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 px-6 py-4 rounded-lg shadow-sm">
            <p className="font-semibold">Error</p>
            <p>{error}</p>
          </div>
        )}
        {success && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-500 text-green-700 px-6 py-4 rounded-lg shadow-sm">
            <p className="font-semibold">Success</p>
            <p>{success}</p>
          </div>
        )}

        {/* Tabs Navigation */}
        {!selectedChangeSet ? (
          <div className="mb-8 bg-white rounded-2xl shadow-lg p-2">
            <nav className="flex space-x-2">
              {(['list', 'globalRules', 'history', 'templates'] as Tab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => { setActiveTab(tab); setPage(1); }}
                  className={`flex-1 py-4 px-6 rounded-xl font-semibold transition-all duration-200 ${
                    activeTab === tab
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {t(`global.changeManagement.tabs.${tab}`)}
                </button>
              ))}
            </nav>
          </div>
        ) : (
          <div className="mb-8 bg-white rounded-2xl shadow-lg p-2">
            <nav className="flex space-x-2">
              {(['details', 'simulation', 'executionLog', 'approvals'] as Tab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-4 px-6 rounded-xl font-semibold transition-all duration-200 ${
                    activeTab === tab
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {tab === 'details' ? 'Details' :
                   tab === 'simulation' ? 'Simulation & Impact' :
                   tab === 'executionLog' ? 'Execution Log' : 'Approvals'}
                </button>
              ))}
            </nav>
          </div>
        )}

        {/* List Tab */}
        {activeTab === 'list' && (
          <>
            <div className="mb-4 flex gap-4">
              <div>
                <label className="mr-2 text-sm font-medium">Status:</label>
                <select
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value as StatusFilter); setPage(1); }}
                  className="px-3 py-2 border rounded"
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
              <div>
                <label className="mr-2 text-sm font-medium">Tenant:</label>
                <input
                  type="text"
                  placeholder="Search tenant..."
                  className="px-3 py-2 border rounded"
                  value={tenantFilter}
                  onChange={(e) => { setTenantFilter(e.target.value); setPage(1); }}
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-indigo-50 to-purple-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Tenant</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Module</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Created By</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {changeSets.map((changeSet) => (
                    <tr key={changeSet.id} className="hover:bg-indigo-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">{changeSet.tenantName || changeSet.tenantId}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-gray-900">{changeSet.name}</div>
                        {changeSet.description && (
                          <div className="text-sm text-gray-500 mt-1">{changeSet.description}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {changeSet.targetModule}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={changeSet.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {changeSet.createdBy}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleSelectChangeSet(changeSet)}
                          className="text-indigo-600 hover:text-indigo-900 font-medium"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                  {changeSets.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                        No change sets found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              {totalItems > pageSize && (
                <div className="px-6 py-4 flex justify-between items-center border-t">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1 border rounded disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-500">
                    Page {page} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(p => p + 1)}
                    disabled={page >= totalPages}
                    className="px-3 py-1 border rounded disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        {/* Global Rules Tab */}
        {activeTab === 'globalRules' && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-indigo-50 to-purple-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Module</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Required Approvers</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {globalRules.map((rule) => (
                  <tr key={rule.id} className="hover:bg-indigo-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-gray-900">{rule.name}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        Roles: {rule.approverRoles.join(', ')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {rule.targetModule}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="text-lg font-bold text-indigo-600">{rule.requiredApprovers}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <StatusBadge status={rule.isActive ? 'Active' : 'Inactive'} />
                        {rule.isEnforced && (
                          <span className="px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800 inline-block w-fit">
                            Enforced
                          </span>
                        )}
                        {rule.tenantCanOverride && (
                          <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 inline-block w-fit">
                            Override Allowed
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleToggleRule(rule)}
                          className="text-indigo-600 hover:text-indigo-900 font-medium"
                        >
                          {rule.isActive ? 'Disable' : 'Enable'}
                        </button>
                        <button
                          onClick={() => handleEnforceRule(rule)}
                          className="text-purple-600 hover:text-purple-900 font-medium"
                        >
                          {rule.isEnforced ? 'Unenforce' : 'Enforce'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {globalRules.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                      No global approval rules configured.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Change History Tab */}
        {activeTab === 'history' && (
          <>
            <div className="mb-4">
              <label className="mr-2 text-sm font-medium">Tenant:</label>
              <input
                type="text"
                placeholder="Search tenant..."
                className="px-3 py-2 border rounded"
                value={tenantFilter}
                onChange={(e) => { setTenantFilter(e.target.value); setPage(1); }}
              />
            </div>

            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-indigo-50 to-purple-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Tenant</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Change Set</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Action</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Performed By</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Details</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {changeHistory.map((history) => (
                    <tr key={history.id} className="hover:bg-indigo-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">{history.tenantName || history.tenantId}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{history.changeSetName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={history.action} variant={getActionColor(history.action) as any} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {history.performedBy}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(history.performedAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                        {history.details}
                      </td>
                    </tr>
                  ))}
                  {changeHistory.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                        No change history found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Templates Tab - Similar to tenant page */}
        {activeTab === 'templates' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <div key={template.id} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="mb-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-gray-900">{template.name}</h3>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      {template.category}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Module: {template.targetModule}</span>
                    <span className="text-gray-500">Used {template.usageCount}x</span>
                  </div>
                </div>
              </div>
            ))}
            {templates.length === 0 && (
              <div className="col-span-3 text-center text-gray-500 py-12">
                No templates available
              </div>
            )}
          </div>
        )}

        {/* Details, Simulation, ExecutionLog, Approvals tabs - Similar to tenant page */}
        {/* ... (Implementation would be similar to tenant page with same structure) ... */}

        {/* Modals */}
        <Modal
          isOpen={showRuleModal}
          onClose={() => setShowRuleModal(false)}
          title={`${t('common.create')} ${t('common.globalApprovalRule')}`}
          size="lg"
        >
          <form onSubmit={handleCreateRule}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Name *</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  value={newRule.name}
                  onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Target Module *</label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  value={newRule.targetModule}
                  onChange={(e) => setNewRule({ ...newRule, targetModule: e.target.value })}
                >
                  {targetModules.map(module => (
                    <option key={module} value={module}>{module}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Required Approvers *</label>
                <input
                  type="number"
                  min="1"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  value={newRule.requiredApprovers}
                  onChange={(e) => setNewRule({ ...newRule, requiredApprovers: parseInt(e.target.value) })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Approver Roles (comma-separated) *</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  value={newRule.approverRoles.join(', ')}
                  onChange={(e) => setNewRule({ ...newRule, approverRoles: e.target.value.split(',').map(r => r.trim()) })}
                />
              </div>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="mr-2 w-4 h-4 text-indigo-600 rounded"
                    checked={newRule.isEnforced}
                    onChange={(e) => setNewRule({ ...newRule, isEnforced: e.target.checked })}
                  />
                  <span className="text-sm text-gray-700">Enforce globally (apply to all tenants)</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="mr-2 w-4 h-4 text-indigo-600 rounded"
                    checked={newRule.tenantCanOverride}
                    onChange={(e) => setNewRule({ ...newRule, tenantCanOverride: e.target.checked })}
                  />
                  <span className="text-sm text-gray-700">Allow tenants to override</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="mr-2 w-4 h-4 text-indigo-600 rounded"
                    checked={newRule.isActive}
                    onChange={(e) => setNewRule({ ...newRule, isActive: e.target.checked })}
                  />
                  <span className="text-sm text-gray-700">Active</span>
                </label>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => setShowRuleModal(false)}
                className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
              >
                Create
              </button>
            </div>
          </form>
        </Modal>

        {/* Other Modals (Schedule, Execute, Rollback, Approval, Reject) - Same as tenant page */}
      </div>
    </div>
  );
}
