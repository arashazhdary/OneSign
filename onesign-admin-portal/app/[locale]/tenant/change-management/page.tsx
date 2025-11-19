'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { getTenantId } from '@/lib/tenant-context';

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

type Tab = 'changeSets' | 'pendingApprovals' | 'approvalRules';
type StatusFilter = 'All' | 'Draft' | 'InReview' | 'Approved' | 'Scheduled' | 'Applied' | 'Rejected';

export default function TenantChangeManagementPage() {
  const t = useTranslations();
  const [activeTab, setActiveTab] = useState<Tab>('changeSets');
  const [tenantId, setTenantIdState] = useState<string>('');
  const [userId] = useState('00000000-0000-0000-0000-000000000001');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Data states
  const [changeSets, setChangeSets] = useState<ChangeSet[]>([]);
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
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [selectedChangeSet, setSelectedChangeSet] = useState<ChangeSet | null>(null);

  // Form states
  const [newChangeSet, setNewChangeSet] = useState({
    name: '',
    description: '',
    targetModule: 'Users',
    changesJson: '{}',
    scheduledAt: '',
  });

  const [newRule, setNewRule] = useState({
    name: '',
    targetModule: 'Users',
    requiredApprovers: 1,
    approverRoles: ['Admin'],
    isActive: true,
  });

  const targetModules = ['Users', 'Groups', 'Applications', 'Policies', 'Settings', 'Security'];

  useEffect(() => {
    const contextTenantId = getTenantId();
    setTenantIdState(contextTenantId || '00000000-0000-0000-0000-000000000000');
  }, []);

  useEffect(() => {
    if (tenantId) {
      fetchData();
    }
  }, [tenantId, activeTab, page, statusFilter]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      if (activeTab === 'changeSets') {
        await fetchChangeSets();
      } else if (activeTab === 'pendingApprovals') {
        await fetchPendingApprovals();
      } else if (activeTab === 'approvalRules') {
        await fetchApprovalRules();
      }
    } catch (err) {
      setError(t('common.error'));
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchChangeSets = async () => {
    let url = `http://localhost:7000/api/tenant/change-management/change-sets?tenantId=${tenantId}&page=${page}&pageSize=${pageSize}`;
    if (statusFilter !== 'All') {
      url += `&status=${statusFilter}`;
    }
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      setChangeSets(data.items || []);
      setTotalItems(data.totalCount || 0);
    } else {
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
    const url = `http://localhost:7000/api/tenant/change-management/pending-approvals?tenantId=${tenantId}&userId=${userId}&page=${page}&pageSize=${pageSize}`;
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      setPendingApprovals(data.items || []);
      setTotalItems(data.totalCount || 0);
    } else {
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
    const url = `http://localhost:7000/api/tenant/change-management/approval-rules?tenantId=${tenantId}`;
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      setApprovalRules(data || []);
    } else {
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

  const handleCreateChangeSet = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const response = await fetch('http://localhost:7000/api/tenant/change-management/change-sets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId,
          userId,
          ...newChangeSet,
        }),
      });
      if (response.ok) {
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
      } else {
        throw new Error('Failed to create change set');
      }
    } catch (err) {
      setError(t('common.error'));
    }
  };

  const handleSubmitForReview = async (changeSet: ChangeSet) => {
    try {
      const response = await fetch(`http://localhost:7000/api/tenant/change-management/change-sets/${changeSet.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId, userId }),
      });
      if (response.ok) {
        setSuccess('Change set submitted for review');
        fetchData();
      } else {
        throw new Error('Failed to submit');
      }
    } catch (err) {
      setError(t('common.error'));
    }
  };

  const handleApprove = async (approval: PendingApproval) => {
    try {
      const response = await fetch(`http://localhost:7000/api/tenant/change-management/approvals/${approval.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId, userId, comment: '' }),
      });
      if (response.ok) {
        setSuccess('Change set approved');
        fetchData();
      } else {
        throw new Error('Failed to approve');
      }
    } catch (err) {
      setError(t('common.error'));
    }
  };

  const handleReject = async (approval: PendingApproval) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;

    try {
      const response = await fetch(`http://localhost:7000/api/tenant/change-management/approvals/${approval.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId, userId, reason }),
      });
      if (response.ok) {
        setSuccess('Change set rejected');
        fetchData();
      } else {
        throw new Error('Failed to reject');
      }
    } catch (err) {
      setError(t('common.error'));
    }
  };

  const handleApplyChangeSet = async (changeSet: ChangeSet) => {
    if (!confirm('Are you sure you want to apply this change set? This action cannot be undone.')) return;

    try {
      const response = await fetch(`http://localhost:7000/api/tenant/change-management/change-sets/${changeSet.id}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId, userId }),
      });
      if (response.ok) {
        setSuccess('Change set applied successfully');
        fetchData();
      } else {
        throw new Error('Failed to apply');
      }
    } catch (err) {
      setError(t('common.error'));
    }
  };

  const handleDeleteChangeSet = async (id: string) => {
    if (!confirm('Are you sure you want to delete this change set?')) return;

    try {
      const response = await fetch(`http://localhost:7000/api/tenant/change-management/change-sets/${id}?tenantId=${tenantId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setSuccess('Change set deleted');
        fetchData();
      } else {
        throw new Error('Failed to delete');
      }
    } catch (err) {
      setError(t('common.error'));
    }
  };

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const response = await fetch('http://localhost:7000/api/tenant/change-management/approval-rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId,
          ...newRule,
        }),
      });
      if (response.ok) {
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
      } else {
        throw new Error('Failed to create rule');
      }
    } catch (err) {
      setError(t('common.error'));
    }
  };

  const handleToggleRule = async (rule: ApprovalRule) => {
    try {
      const response = await fetch(`http://localhost:7000/api/tenant/change-management/approval-rules/${rule.id}/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId, isActive: !rule.isActive }),
      });
      if (response.ok) {
        setSuccess(`Rule ${rule.isActive ? 'disabled' : 'enabled'}`);
        fetchData();
      } else {
        throw new Error('Failed to toggle rule');
      }
    } catch (err) {
      setError(t('common.error'));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Draft': return 'bg-gray-100 text-gray-800';
      case 'InReview': return 'bg-yellow-100 text-yellow-800';
      case 'Approved': return 'bg-green-100 text-green-800';
      case 'Scheduled': return 'bg-blue-100 text-blue-800';
      case 'Applied': return 'bg-blue-100 text-blue-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalPages = Math.ceil(totalItems / pageSize);

  if (loading && !changeSets.length && !pendingApprovals.length && !approvalRules.length) {
    return <div className="p-8">{t('common.loading')}</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Change Management</h1>
        {activeTab === 'changeSets' && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Create Change Set
          </button>
        )}
        {activeTab === 'approvalRules' && (
          <button
            onClick={() => setShowRuleModal(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Create Approval Rule
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>
      )}
      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">{success}</div>
      )}

      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {(['changeSets', 'pendingApprovals', 'approvalRules'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setPage(1); }}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab === 'changeSets' ? 'Change Sets' : tab === 'pendingApprovals' ? 'Pending Approvals' : 'Approval Rules'}
            </button>
          ))}
        </nav>
      </div>

      {/* Change Sets Tab */}
      {activeTab === 'changeSets' && (
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

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Module</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {changeSets.map((changeSet) => (
                  <tr key={changeSet.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{changeSet.name}</div>
                      {changeSet.description && (
                        <div className="text-sm text-gray-500">{changeSet.description}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {changeSet.targetModule}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded text-xs ${getStatusColor(changeSet.status)}`}>
                        {changeSet.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(changeSet.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        {changeSet.status === 'Draft' && (
                          <>
                            <button
                              onClick={() => handleSubmitForReview(changeSet)}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              Submit
                            </button>
                            <button
                              onClick={() => handleDeleteChangeSet(changeSet.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          </>
                        )}
                        {changeSet.status === 'Approved' && (
                          <button
                            onClick={() => handleApplyChangeSet(changeSet)}
                            className="text-green-600 hover:text-green-900"
                          >
                            Apply Now
                          </button>
                        )}
                        {changeSet.status === 'Scheduled' && (
                          <span className="text-gray-500">
                            Scheduled: {changeSet.scheduledAt ? new Date(changeSet.scheduledAt).toLocaleString() : 'N/A'}
                          </span>
                        )}
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

      {/* Pending Approvals Tab */}
      {activeTab === 'pendingApprovals' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Change Set</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Module</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Requested By</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Requested At</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pendingApprovals.map((approval) => (
                <tr key={approval.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{approval.changeSetName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {approval.targetModule}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {approval.requestedBy}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(approval.requestedAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(approval)}
                        className="text-green-600 hover:text-green-900 font-medium"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(approval)}
                        className="text-red-600 hover:text-red-900 font-medium"
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {pendingApprovals.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    No pending approvals.
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
      )}

      {/* Approval Rules Tab */}
      {activeTab === 'approvalRules' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Module</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Required Approvers</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Approver Roles</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {approvalRules.map((rule) => (
                <tr key={rule.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{rule.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {rule.targetModule}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {rule.requiredApprovers}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {rule.approverRoles.join(', ')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded text-xs ${rule.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {rule.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => handleToggleRule(rule)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      {rule.isActive ? 'Disable' : 'Enable'}
                    </button>
                  </td>
                </tr>
              ))}
              {approvalRules.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    No approval rules configured.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Change Set Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Create Change Set</h2>
            <form onSubmit={handleCreateChangeSet}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Name</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border rounded"
                  value={newChangeSet.name}
                  onChange={(e) => setNewChangeSet({ ...newChangeSet, name: e.target.value })}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  className="w-full px-3 py-2 border rounded"
                  rows={3}
                  value={newChangeSet.description}
                  onChange={(e) => setNewChangeSet({ ...newChangeSet, description: e.target.value })}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Target Module</label>
                <select
                  className="w-full px-3 py-2 border rounded"
                  value={newChangeSet.targetModule}
                  onChange={(e) => setNewChangeSet({ ...newChangeSet, targetModule: e.target.value })}
                >
                  {targetModules.map(module => (
                    <option key={module} value={module}>{module}</option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Changes (JSON)</label>
                <textarea
                  className="w-full px-3 py-2 border rounded font-mono text-sm"
                  rows={5}
                  value={newChangeSet.changesJson}
                  onChange={(e) => setNewChangeSet({ ...newChangeSet, changesJson: e.target.value })}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Schedule For (Optional)</label>
                <input
                  type="datetime-local"
                  className="w-full px-3 py-2 border rounded"
                  value={newChangeSet.scheduledAt}
                  onChange={(e) => setNewChangeSet({ ...newChangeSet, scheduledAt: e.target.value })}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Approval Rule Modal */}
      {showRuleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Create Approval Rule</h2>
            <form onSubmit={handleCreateRule}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Name</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border rounded"
                  value={newRule.name}
                  onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Target Module</label>
                <select
                  className="w-full px-3 py-2 border rounded"
                  value={newRule.targetModule}
                  onChange={(e) => setNewRule({ ...newRule, targetModule: e.target.value })}
                >
                  {targetModules.map(module => (
                    <option key={module} value={module}>{module}</option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Required Approvers</label>
                <input
                  type="number"
                  min="1"
                  required
                  className="w-full px-3 py-2 border rounded"
                  value={newRule.requiredApprovers}
                  onChange={(e) => setNewRule({ ...newRule, requiredApprovers: parseInt(e.target.value) })}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Approver Roles (comma-separated)</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border rounded"
                  value={newRule.approverRoles.join(', ')}
                  onChange={(e) => setNewRule({ ...newRule, approverRoles: e.target.value.split(',').map(r => r.trim()) })}
                />
              </div>
              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={newRule.isActive}
                    onChange={(e) => setNewRule({ ...newRule, isActive: e.target.checked })}
                  />
                  Active
                </label>
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowRuleModal(false)}
                  className="px-4 py-2 border rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
