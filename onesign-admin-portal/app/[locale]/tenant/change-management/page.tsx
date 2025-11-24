'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { getTenantId } from '@/lib/tenant-context';
import Modal from '@/app/components/Modal';
import StatusBadge from '@/app/components/StatusBadge';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import { changeManagementService } from '@/lib/api/services/change-management.service';

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

interface ApprovalRule {
  id: string;
  name: string;
  targetModule: string;
  requiredApprovers: number;
  approverRoles: string[];
  isActive: boolean;
  createdAt: string;
}

interface PendingApproval {
  id: string;
  changeSetId: string;
  changeSetName: string;
  requestedBy: string;
  requestedAt: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  targetModule: string;
}

type Tab = 'list' | 'details' | 'simulation' | 'executionLog' | 'approvals' | 'templates';
type StatusFilter = 'All' | 'Draft' | 'InReview' | 'Approved' | 'Scheduled' | 'Applied' | 'Rejected';

export default function TenantChangeManagementPage() {
  const t = useTranslations();
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
  const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>([]);
  const [approvalRules, setApprovalRules] = useState<ApprovalRule[]>([]);

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
      // Mock data for development
      const mockData: ChangeSet[] = [
        {
          id: '1',
          name: 'Update User Permissions',
          description: 'Bulk update of user permissions for finance team',
          status: 'InReview',
          targetModule: 'Users',
          changesJson: '{"action": "updatePermissions", "users": 15}',
          createdBy: 'admin@example.com',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'New Security Policy',
          description: 'Implement MFA requirement for all admin users',
          status: 'Draft',
          targetModule: 'Security',
          changesJson: '{"action": "enableMFA", "scope": "admins"}',
          createdBy: 'admin@example.com',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '3',
          name: 'Application Configuration',
          description: 'Update OAuth settings for marketing app',
          status: 'Approved',
          targetModule: 'Applications',
          changesJson: '{"action": "updateOAuth", "app": "marketing"}',
          scheduledAt: new Date(Date.now() + 86400000).toISOString(),
          createdBy: 'admin@example.com',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      setChangeSets(statusFilter === 'All' ? mockData : mockData.filter(c => c.status === statusFilter));
      setTotalItems(mockData.length);
    }
  };

  const fetchPendingApprovals = async () => {
    try {
      const data = await changeManagementService.getTenantPendingApprovals(tenantId, userId, {
        page,
        pageSize,
      });
      setPendingApprovals(data.items || []);
      setTotalItems(data.totalCount || 0);
    } catch (err) {
      // Mock data
      const mockData: PendingApproval[] = [
        {
          id: '1',
          changeSetId: '1',
          changeSetName: 'Update User Permissions',
          requestedBy: 'admin@example.com',
          requestedAt: new Date().toISOString(),
          status: 'Pending',
          targetModule: 'Users',
        },
      ];
      setPendingApprovals(mockData);
      setTotalItems(mockData.length);
    }
  };

  const fetchApprovalRules = async () => {
    try {
      const data = await changeManagementService.getTenantApprovalRules(tenantId);
      setApprovalRules(data || []);
    } catch (err) {
      // Mock data
      const mockData: ApprovalRule[] = [
        {
          id: '1',
          name: 'Security Changes',
          targetModule: 'Security',
          requiredApprovers: 2,
          approverRoles: ['SecurityAdmin', 'GlobalAdmin'],
          isActive: true,
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'User Changes',
          targetModule: 'Users',
          requiredApprovers: 1,
          approverRoles: ['Admin'],
          isActive: true,
          createdAt: new Date().toISOString(),
        },
      ];
      setApprovalRules(mockData);
    }
  };

  // 1. GET /api/tenant/changesets/{id} - جزئیات ChangeSet
  const fetchChangeSetDetails = async (id: string) => {
    try {
      const data = await changeManagementService.getTenantChangeSet(tenantId, id);
      setChangeSetDetails(data);
    } catch (err) {
      // Mock data
      const mockData: ChangeSetDetails = {
        ...selectedChangeSet!,
        changes: [
          {
            id: '1',
            type: 'Permission Update',
            entity: 'User',
            operation: 'UPDATE',
            before: { permissions: ['read'] },
            after: { permissions: ['read', 'write'] },
          },
          {
            id: '2',
            type: 'Role Assignment',
            entity: 'Group',
            operation: 'CREATE',
            before: null,
            after: { role: 'Editor', users: 15 },
          },
        ],
        metadata: {
          estimatedImpact: 'Medium',
          affectedResources: 25,
          requiredDowntime: '0 minutes',
        },
      };
      setChangeSetDetails(mockData);
    }
  };

  // 2. POST /api/tenant/changesets/{id}/simulate - شبیه‌سازی تغییرات
  const handleSimulate = async (id: string) => {
    setLoading(true);
    try {
      const data = await changeManagementService.simulateTenantChangeSet(tenantId, id);
      setSimulationResult(data);
      setSuccess('Simulation completed successfully');
    } catch (err) {
      // Mock data
      const mockResult: SimulationResult = {
        success: true,
        warnings: ['Some users may experience temporary access delays'],
        errors: [],
        affectedEntities: [
          { type: 'User', id: 'u1', name: 'John Doe', change: 'Permissions updated' },
          { type: 'User', id: 'u2', name: 'Jane Smith', change: 'Permissions updated' },
          { type: 'Group', id: 'g1', name: 'Finance Team', change: 'Members added' },
        ],
        estimatedDuration: '2 minutes',
      };
      setSimulationResult(mockResult);
      setSuccess('Simulation completed (mock data)');
    } finally {
      setLoading(false);
    }
  };

  // 3. GET /api/tenant/changesets/{id}/execution-log - لاگ اجرا
  const fetchExecutionLogs = async (id: string) => {
    try {
      const data = await changeManagementService.getTenantExecutionLog(tenantId, id);
      setExecutionLogs(data || []);
    } catch (err) {
      // Mock data
      const mockLogs: ExecutionLog[] = [
        {
          id: '1',
          timestamp: new Date().toISOString(),
          action: 'Validation Started',
          status: 'Success',
          message: 'All validations passed',
        },
        {
          id: '2',
          timestamp: new Date(Date.now() - 60000).toISOString(),
          action: 'Simulation Completed',
          status: 'Warning',
          message: 'Minor warnings detected',
          details: 'Some users may experience delays',
        },
        {
          id: '3',
          timestamp: new Date(Date.now() - 120000).toISOString(),
          action: 'Approval Received',
          status: 'Success',
          message: 'Approved by admin@example.com',
        },
      ];
      setExecutionLogs(mockLogs);
    }
  };

  // POST /api/tenant/change-sets/{id}/schedule - زمان‌بندی change set
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
      setSuccess('Change set scheduled successfully');
      setShowScheduleModal(false);
      fetchData();
    } catch (err) {
      setError('Failed to schedule change set');
    } finally {
      setLoading(false);
    }
  };

  // 5. POST /api/tenant/changesets/{id}/execute - اجرای دستی
  const handleExecute = async () => {
    if (!selectedChangeSet) return;

    setLoading(true);
    try {
      await changeManagementService.executeTenantChangeSet(tenantId, selectedChangeSet.id, userId);
      setSuccess('Change set executed successfully');
      setShowExecuteModal(false);
      fetchData();
    } catch (err) {
      setError('Failed to execute change set');
    } finally {
      setLoading(false);
    }
  };

  // POST /api/tenant/change-sets/{id}/rollback - بازگردانی change set
  const handleRollback = async () => {
    if (!selectedChangeSet) return;

    setLoading(true);
    try {
      await changeManagementService.rollbackTenantChangeSet(tenantId, selectedChangeSet.id, userId);
      setSuccess('Change set rolled back successfully');
      setShowRollbackModal(false);
      fetchData();
    } catch (err) {
      setError('Failed to rollback change set');
    } finally {
      setLoading(false);
    }
  };

  // POST /api/tenant/change-sets/{id}/approve - تایید change set
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
      setSuccess('Change set approved');
      setShowApprovalModal(false);
      setApprovalComment('');
      fetchData();
    } catch (err) {
      setError('Failed to approve change set');
    } finally {
      setLoading(false);
    }
  };

  // POST /api/tenant/change-sets/{id}/reject - رد change set
  const handleRejectChangeSet = async () => {
    if (!selectedChangeSet || !rejectReason.trim()) {
      setError('Please provide a reason for rejection');
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
      setSuccess('Change set rejected');
      setShowRejectModal(false);
      setRejectReason('');
      fetchData();
    } catch (err) {
      setError('Failed to reject change set');
    } finally {
      setLoading(false);
    }
  };

  // 9. GET /api/tenant/changesets/{id}/approvals - لیست تاییدکنندگان
  const fetchApprovals = async (id: string) => {
    try {
      const data = await changeManagementService.getTenantApprovals(tenantId, id);
      setApprovals(data || []);
    } catch (err) {
      // Mock data
      const mockApprovals: Approval[] = [
        {
          id: '1',
          approverId: 'u1',
          approverName: 'John Admin',
          approverRole: 'GlobalAdmin',
          decision: 'Approved',
          comment: 'Looks good to me',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: '2',
          approverId: 'u2',
          approverName: 'Jane Security',
          approverRole: 'SecurityAdmin',
          decision: 'Pending',
          comment: '',
          timestamp: new Date().toISOString(),
        },
      ];
      setApprovals(mockApprovals);
    }
  };

  // 10. GET /api/tenant/changesets/{id}/impact - تحلیل تاثیرات
  const fetchImpactAnalysis = async (id: string) => {
    try {
      const data = await changeManagementService.getTenantImpactAnalysis(tenantId, id);
      setImpactAnalysis(data);
    } catch (err) {
      // Mock data
      const mockImpact: ImpactAnalysis = {
        riskLevel: 'Medium',
        affectedUsers: 42,
        affectedGroups: 5,
        affectedApplications: 3,
        dependencies: [
          { type: 'Application', name: 'Finance App', impact: 'Users will need re-authentication' },
          { type: 'Group', name: 'Finance Team', impact: 'Permissions will be updated' },
        ],
        recommendations: [
          'Schedule during off-peak hours',
          'Notify affected users in advance',
          'Have rollback plan ready',
        ],
      };
      setImpactAnalysis(mockImpact);
    }
  };

  // 11. POST /api/tenant/changesets/{id}/clone - کپی ChangeSet
  const handleClone = async () => {
    if (!selectedChangeSet || !cloneName.trim()) {
      setError('Please provide a name for the cloned change set');
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
      setSuccess('Change set cloned successfully');
      setShowCloneModal(false);
      setCloneName('');
      fetchData();
    } catch (err) {
      setError('Failed to clone change set');
    } finally {
      setLoading(false);
    }
  };

  // 12. GET /api/tenant/changesets/templates - قالب‌های آماده
  const fetchTemplates = async () => {
    try {
      const data = await changeManagementService.getTenantTemplates(tenantId);
      setTemplates(data || []);
    } catch (err) {
      // Mock data
      const mockTemplates: Template[] = [
        {
          id: '1',
          name: 'Bulk User Permission Update',
          description: 'Update permissions for multiple users at once',
          category: 'User Management',
          targetModule: 'Users',
          templateJson: '{"action": "bulkUpdatePermissions", "permissions": []}',
          usageCount: 45,
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'Security Policy Rollout',
          description: 'Deploy new security policy across organization',
          category: 'Security',
          targetModule: 'Security',
          templateJson: '{"action": "deployPolicy", "policy": {}}',
          usageCount: 12,
          createdAt: new Date().toISOString(),
        },
        {
          id: '3',
          name: 'Application Configuration',
          description: 'Update application settings and configurations',
          category: 'Applications',
          targetModule: 'Applications',
          templateJson: '{"action": "updateConfig", "settings": {}}',
          usageCount: 28,
          createdAt: new Date().toISOString(),
        },
      ];
      setTemplates(mockTemplates);
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
      setSuccess('Change set created successfully');
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

  // POST /api/tenant/change-sets/{id}/submit - ارسال change set
  const handleSubmitForReview = async (changeSet: ChangeSet) => {
    try {
      await changeManagementService.submitTenantChangeSet(tenantId, changeSet.id, userId);
      setSuccess('Change set submitted for review');
      fetchData();
    } catch (err) {
      setError(t('common.error'));
    }
  };

  const handleApprove = async (approval: PendingApproval) => {
    try {
      await changeManagementService.approveTenantApproval(tenantId, approval.id, userId, '');
      setSuccess('Change set approved');
      fetchData();
    } catch (err) {
      setError(t('common.error'));
    }
  };

  const handleReject = async (approval: PendingApproval) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;

    try {
      await changeManagementService.rejectTenantApproval(tenantId, approval.id, userId, reason);
      setSuccess('Change set rejected');
      fetchData();
    } catch (err) {
      setError(t('common.error'));
    }
  };

  // POST /api/tenant/change-sets/{id}/apply - اعمال change set
  const handleApplyChangeSet = async (changeSet: ChangeSet) => {
    if (!confirm('Are you sure you want to apply this change set? This action cannot be undone.')) return;

    try {
      await changeManagementService.applyTenantChangeSet(tenantId, changeSet.id, userId);
      setSuccess('Change set applied successfully');
      fetchData();
    } catch (err) {
      setError(t('common.error'));
    }
  };

  const handleDeleteChangeSet = async (id: string) => {
    if (!confirm('Are you sure you want to delete this change set?')) return;

    try {
      await changeManagementService.deleteTenantChangeSet(tenantId, id);
      setSuccess('Change set deleted');
      fetchData();
    } catch (err) {
      setError(t('common.error'));
    }
  };

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await changeManagementService.createTenantApprovalRule(tenantId, newRule);
      setSuccess('Approval rule created successfully');
      setShowRuleModal(false);
      setNewRule({
        name: '',
        targetModule: 'Users',
        requiredApprovers: 1,
        approverRoles: ['Admin'],
        isActive: true,
      });
      fetchData();
    } catch (err) {
      setError(t('common.error'));
    }
  };

  const handleToggleRule = async (rule: ApprovalRule) => {
    try {
      await changeManagementService.toggleTenantApprovalRule(tenantId, rule.id, !rule.isActive);
      setSuccess(`Rule ${rule.isActive ? 'disabled' : 'enabled'}`);
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
              Change Management
            </h1>
            <p className="text-gray-600 mt-2">Manage and track organizational changes</p>
          </div>
          <div className="flex gap-3">
            {activeTab === 'list' && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 flex items-center gap-2"
              >
                <span>+</span>
                Create Change Set
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
                Back to List
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
              {(['list', 'templates'] as Tab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => { setActiveTab(tab); setPage(1); }}
                  className={`flex-1 py-4 px-6 rounded-xl font-semibold transition-all duration-200 ${
                    activeTab === tab
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {tab === 'list' ? 'Change Sets' : 'Templates'}
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
          <div className="mb-4">
            <label className="mr-2 text-sm font-medium">Filter by Status:</label>
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

          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-indigo-50 to-purple-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Module</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {changeSets.map((changeSet) => (
                  <tr key={changeSet.id} className="hover:bg-indigo-50/50 transition-colors">
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
                      {new Date(changeSet.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSelectChangeSet(changeSet)}
                          className="text-indigo-600 hover:text-indigo-900 font-medium"
                        >
                          View
                        </button>
                        {changeSet.status === 'Draft' && (
                          <>
                            <button
                              onClick={() => handleSubmitForReview(changeSet)}
                              className="text-blue-600 hover:text-blue-900 font-medium"
                            >
                              Submit
                            </button>
                            <button
                              onClick={() => handleDeleteChangeSet(changeSet.id)}
                              className="text-red-600 hover:text-red-900 font-medium"
                            >
                              Delete
                            </button>
                          </>
                        )}
                        {changeSet.status === 'Approved' && (
                          <>
                            <button
                              onClick={() => {
                                setSelectedChangeSet(changeSet);
                                setShowExecuteModal(true);
                              }}
                              className="text-green-600 hover:text-green-900 font-medium"
                            >
                              Execute
                            </button>
                            <button
                              onClick={() => {
                                setSelectedChangeSet(changeSet);
                                setShowScheduleModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-900 font-medium"
                            >
                              Schedule
                            </button>
                          </>
                        )}
                        {changeSet.status === 'Applied' && (
                          <button
                            onClick={() => {
                              setSelectedChangeSet(changeSet);
                              setShowRollbackModal(true);
                            }}
                            className="text-orange-600 hover:text-orange-900 font-medium"
                          >
                            Rollback
                          </button>
                        )}
                        {changeSet.status === 'Scheduled' && (
                          <span className="text-gray-500 text-xs">
                            {changeSet.scheduledAt ? new Date(changeSet.scheduledAt).toLocaleString() : 'N/A'}
                          </span>
                        )}
                        <button
                          onClick={() => {
                            setSelectedChangeSet(changeSet);
                            setCloneName(`${changeSet.name} - Copy`);
                            setShowCloneModal(true);
                          }}
                          className="text-purple-600 hover:text-purple-900 font-medium"
                        >
                          Clone
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {changeSets.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
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

      {/* Details Tab */}
      {activeTab === 'details' && selectedChangeSet && changeSetDetails && (
        <div className="space-y-6">
          {/* Overview Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">{changeSetDetails.name}</h2>
            <p className="text-gray-600 mb-6">{changeSetDetails.description}</p>

            <div className="grid grid-cols-3 gap-6 mb-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">Status</p>
                <StatusBadge status={changeSetDetails.status} />
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Target Module</p>
                <p className="font-semibold text-gray-900">{changeSetDetails.targetModule}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Created By</p>
                <p className="font-semibold text-gray-900">{changeSetDetails.createdBy}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Estimated Impact</p>
                <p className="font-semibold text-gray-900">{changeSetDetails.metadata.estimatedImpact}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Affected Resources</p>
                <p className="font-semibold text-gray-900">{changeSetDetails.metadata.affectedResources}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Required Downtime</p>
                <p className="font-semibold text-gray-900">{changeSetDetails.metadata.requiredDowntime}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              {changeSetDetails.status === 'InReview' && (
                <>
                  <button
                    onClick={() => setShowApprovalModal(true)}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => setShowRejectModal(true)}
                    className="bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700"
                  >
                    Reject
                  </button>
                </>
              )}
              {changeSetDetails.status === 'Approved' && (
                <>
                  <button
                    onClick={() => setShowExecuteModal(true)}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700"
                  >
                    Execute Now
                  </button>
                  <button
                    onClick={() => setShowScheduleModal(true)}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700"
                  >
                    Schedule
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Changes List */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold mb-4">Changes</h3>
            <div className="space-y-4">
              {changeSetDetails.changes.map((change) => (
                <div key={change.id} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="font-semibold text-gray-900">{change.type}</span>
                      <span className="text-gray-500 ml-2">({change.entity})</span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      change.operation === 'CREATE' ? 'bg-green-100 text-green-800' :
                      change.operation === 'UPDATE' ? 'bg-blue-100 text-blue-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {change.operation}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-3">
                    {change.before && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Before</p>
                        <pre className="text-xs bg-white p-2 rounded border">{JSON.stringify(change.before, null, 2)}</pre>
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-gray-500 mb-1">After</p>
                      <pre className="text-xs bg-white p-2 rounded border">{JSON.stringify(change.after, null, 2)}</pre>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Simulation Tab */}
      {activeTab === 'simulation' && selectedChangeSet && (
        <div className="space-y-6">
          {/* Impact Analysis */}
          {impactAnalysis && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-4">Impact Analysis</h2>
              <div className="grid grid-cols-4 gap-6 mb-6">
                <div className="text-center p-4 bg-gradient-to-br from-red-50 to-orange-50 rounded-xl">
                  <p className="text-sm text-gray-600 mb-2">Risk Level</p>
                  <StatusBadge status={impactAnalysis.riskLevel} variant={getRiskColor(impactAnalysis.riskLevel) as any} />
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
                  <p className="text-sm text-gray-600 mb-2">Affected Users</p>
                  <p className="text-3xl font-bold text-indigo-600">{impactAnalysis.affectedUsers}</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
                  <p className="text-sm text-gray-600 mb-2">Affected Groups</p>
                  <p className="text-3xl font-bold text-green-600">{impactAnalysis.affectedGroups}</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
                  <p className="text-sm text-gray-600 mb-2">Affected Apps</p>
                  <p className="text-3xl font-bold text-purple-600">{impactAnalysis.affectedApplications}</p>
                </div>
              </div>

              {impactAnalysis.dependencies.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-bold mb-3">Dependencies</h3>
                  <div className="space-y-2">
                    {impactAnalysis.dependencies.map((dep, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <span className="font-semibold">{dep.name}</span>
                          <span className="text-gray-500 text-sm ml-2">({dep.type})</span>
                        </div>
                        <p className="text-sm text-gray-600">{dep.impact}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {impactAnalysis.recommendations.length > 0 && (
                <div>
                  <h3 className="font-bold mb-3">Recommendations</h3>
                  <ul className="space-y-2">
                    {impactAnalysis.recommendations.map((rec, idx) => (
                      <li key={idx} className="flex items-start">
                        <span className="text-green-600 mr-2">✓</span>
                        <span className="text-gray-700">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Simulation */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Simulation</h2>
              <button
                onClick={() => handleSimulate(selectedChangeSet.id)}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg"
              >
                Run Simulation
              </button>
            </div>

            {simulationResult && (
              <div className="mt-6 space-y-4">
                <div className={`p-4 rounded-lg ${simulationResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                  <p className="font-semibold">{simulationResult.success ? 'Simulation Successful' : 'Simulation Failed'}</p>
                  <p className="text-sm mt-1">Estimated Duration: {simulationResult.estimatedDuration}</p>
                </div>

                {simulationResult.warnings.length > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                    <p className="font-semibold text-yellow-800 mb-2">Warnings</p>
                    <ul className="list-disc list-inside text-sm">
                      {simulationResult.warnings.map((warning, idx) => (
                        <li key={idx} className="text-yellow-700">{warning}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {simulationResult.errors.length > 0 && (
                  <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                    <p className="font-semibold text-red-800 mb-2">Errors</p>
                    <ul className="list-disc list-inside text-sm">
                      {simulationResult.errors.map((error, idx) => (
                        <li key={idx} className="text-red-700">{error}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {simulationResult.affectedEntities.length > 0 && (
                  <div>
                    <h3 className="font-bold mb-3">Affected Entities</h3>
                    <div className="space-y-2">
                      {simulationResult.affectedEntities.map((entity) => (
                        <div key={entity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <span className="font-semibold">{entity.name}</span>
                            <span className="text-gray-500 text-sm ml-2">({entity.type})</span>
                          </div>
                          <p className="text-sm text-gray-600">{entity.change}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Execution Log Tab */}
      {activeTab === 'executionLog' && selectedChangeSet && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-6">Execution Log</h2>
          <div className="space-y-3">
            {executionLogs.map((log) => (
              <div key={log.id} className="border-l-4 pl-4 py-3 bg-gray-50 rounded-r-lg" style={{
                borderLeftColor: log.status === 'Success' ? '#10b981' : log.status === 'Warning' ? '#f59e0b' : '#ef4444'
              }}>
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <span className="font-semibold text-gray-900">{log.action}</span>
                    <StatusBadge
                      status={log.status}
                      variant={log.status === 'Success' ? 'success' : log.status === 'Warning' ? 'warning' : 'error'}
                    />
                  </div>
                  <span className="text-sm text-gray-500">{new Date(log.timestamp).toLocaleString()}</span>
                </div>
                <p className="text-sm text-gray-700">{log.message}</p>
                {log.details && (
                  <p className="text-xs text-gray-500 mt-1">{log.details}</p>
                )}
              </div>
            ))}
            {executionLogs.length === 0 && (
              <p className="text-center text-gray-500 py-8">No execution logs available</p>
            )}
          </div>
        </div>
      )}

      {/* Approvals Tab */}
      {activeTab === 'approvals' && selectedChangeSet && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-6">Approval Status</h2>
          <div className="space-y-4">
            {approvals.map((approval) => (
              <div key={approval.id} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold text-gray-900">{approval.approverName}</p>
                    <p className="text-sm text-gray-600">{approval.approverRole}</p>
                  </div>
                  <StatusBadge
                    status={approval.decision}
                    variant={approval.decision === 'Approved' ? 'success' : approval.decision === 'Rejected' ? 'error' : 'warning'}
                  />
                </div>
                {approval.comment && (
                  <p className="text-sm text-gray-700 mt-2 italic">&ldquo;{approval.comment}&rdquo;</p>
                )}
                <p className="text-xs text-gray-500 mt-2">{new Date(approval.timestamp).toLocaleString()}</p>
              </div>
            ))}
            {approvals.length === 0 && (
              <p className="text-center text-gray-500 py-8">No approvals yet</p>
            )}
          </div>
        </div>
      )}

      {/* Templates Tab */}
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
              <button
                onClick={() => handleCreateFromTemplate(template)}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                Use Template
              </button>
            </div>
          ))}
          {templates.length === 0 && (
            <div className="col-span-3 text-center text-gray-500 py-12">
              No templates available
            </div>
          )}
        </div>
      )}

      {/* Create Change Set Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Change Set"
        size="lg"
      >
        <form onSubmit={handleCreateChangeSet}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Name *</label>
              <input
                type="text"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                value={newChangeSet.name}
                onChange={(e) => setNewChangeSet({ ...newChangeSet, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Description</label>
              <textarea
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                rows={3}
                value={newChangeSet.description}
                onChange={(e) => setNewChangeSet({ ...newChangeSet, description: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Target Module *</label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                value={newChangeSet.targetModule}
                onChange={(e) => setNewChangeSet({ ...newChangeSet, targetModule: e.target.value })}
              >
                {targetModules.map(module => (
                  <option key={module} value={module}>{module}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Changes (JSON) *</label>
              <textarea
                className="w-full px-4 py-2 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
              <label className="block text-sm font-medium mb-2 text-gray-700">Scheduled Time *</label>
              <input
                type="datetime-local"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                value={scheduleData.scheduledAt}
                onChange={(e) => setScheduleData({ ...scheduleData, scheduledAt: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Timezone</label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
                <span className="text-sm text-gray-700">Notify affected users</span>
              </label>
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={() => setShowScheduleModal(false)}
              className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
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
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
            <p className="text-yellow-800 font-semibold">Warning</p>
            <p className="text-yellow-700 text-sm mt-1">
              This will execute the change set immediately. This action may affect production systems.
            </p>
          </div>
          {selectedChangeSet && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Change Set:</p>
              <p className="font-semibold text-gray-900">{selectedChangeSet.name}</p>
            </div>
          )}
        </div>
        <div className="flex gap-3 mt-6">
          <button
            onClick={() => setShowExecuteModal(false)}
            className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleExecute}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
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
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
            <p className="text-red-800 font-semibold">Critical Action</p>
            <p className="text-red-700 text-sm mt-1">
              This will rollback all changes from this change set. Make sure you understand the impact.
            </p>
          </div>
          {selectedChangeSet && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Change Set:</p>
              <p className="font-semibold text-gray-900">{selectedChangeSet.name}</p>
            </div>
          )}
        </div>
        <div className="flex gap-3 mt-6">
          <button
            onClick={() => setShowRollbackModal(false)}
            className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleRollback}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
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
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Change Set:</p>
              <p className="font-semibold text-gray-900">{selectedChangeSet.name}</p>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">Comment (Optional)</label>
            <textarea
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              rows={3}
              placeholder="Add your approval comment..."
              value={approvalComment}
              onChange={(e) => setApprovalComment(e.target.value)}
            />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button
            onClick={() => setShowApprovalModal(false)}
            className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleApproveChangeSet}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
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
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Change Set:</p>
              <p className="font-semibold text-gray-900">{selectedChangeSet.name}</p>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">Reason for Rejection *</label>
            <textarea
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              rows={4}
              placeholder="Please provide a detailed reason for rejection..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              required
            />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button
            onClick={() => setShowRejectModal(false)}
            className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleRejectChangeSet}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
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
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Original Change Set:</p>
              <p className="font-semibold text-gray-900">{selectedChangeSet.name}</p>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">New Name *</label>
            <input
              type="text"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              value={cloneName}
              onChange={(e) => setCloneName(e.target.value)}
            />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button
            onClick={() => setShowCloneModal(false)}
            className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleClone}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
          >
            Clone
          </button>
        </div>
      </Modal>
    </div>
    </div>
  );
}
