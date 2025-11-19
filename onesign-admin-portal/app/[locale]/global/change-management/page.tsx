'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';

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

type Tab = 'allChangeSets' | 'globalRules' | 'changeHistory';
type StatusFilter = 'All' | 'Draft' | 'InReview' | 'Approved' | 'Scheduled' | 'Applied' | 'Rejected';

export default function GlobalChangeManagementPage() {
  const t = useTranslations();
  const [activeTab, setActiveTab] = useState<Tab>('allChangeSets');
  const [userId] = useState('00000000-0000-0000-0000-000000000001');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Data states
  const [changeSets, setChangeSets] = useState<ChangeSet[]>([]);
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

  const targetModules = ['Users', 'Groups', 'Applications', 'Policies', 'Settings', 'Security'];

  useEffect(() => {
    fetchData();
  }, [activeTab, page, statusFilter, tenantFilter]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      if (activeTab === 'allChangeSets') {
        await fetchAllChangeSets();
      } else if (activeTab === 'globalRules') {
        await fetchGlobalRules();
      } else if (activeTab === 'changeHistory') {
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
    let url = `http://localhost:7000/api/global/change-management/change-sets?page=${page}&pageSize=${pageSize}`;
    if (statusFilter !== 'All') {
      url += `&status=${statusFilter}`;
    }
    if (tenantFilter) {
      url += `&tenantId=${tenantFilter}`;
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
          tenantId: 'tenant-1',
          tenantName: 'Acme Corp',
          name: 'Update User Permissions',
          description: 'Bulk update of user permissions for finance team',
          status: 'InReview',
          targetModule: 'Users',
          changesJson: '{"action": "updatePermissions", "users": 15}',
          createdBy: 'admin@acme.com',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '2',
          tenantId: 'tenant-2',
          tenantName: 'TechStart Inc',
          name: 'New Security Policy',
          description: 'Implement MFA requirement for all admin users',
          status: 'Approved',
          targetModule: 'Security',
          changesJson: '{"action": "enableMFA", "scope": "admins"}',
          scheduledAt: new Date(Date.now() + 86400000).toISOString(),
          createdBy: 'admin@techstart.com',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '3',
          tenantId: 'tenant-1',
          tenantName: 'Acme Corp',
          name: 'Application Configuration',
          description: 'Update OAuth settings for marketing app',
          status: 'Applied',
          targetModule: 'Applications',
          changesJson: '{"action": "updateOAuth", "app": "marketing"}',
          appliedAt: new Date(Date.now() - 86400000).toISOString(),
          createdBy: 'admin@acme.com',
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          updatedAt: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: '4',
          tenantId: 'tenant-3',
          tenantName: 'Global Services',
          name: 'Policy Update',
          description: 'Update password policy requirements',
          status: 'Rejected',
          targetModule: 'Policies',
          changesJson: '{"action": "updatePolicy", "policy": "password"}',
          createdBy: 'admin@globalservices.com',
          createdAt: new Date(Date.now() - 259200000).toISOString(),
          updatedAt: new Date(Date.now() - 172800000).toISOString(),
        },
      ];
      let filtered = mockData;
      if (statusFilter !== 'All') {
        filtered = filtered.filter(c => c.status === statusFilter);
      }
      if (tenantFilter) {
        filtered = filtered.filter(c => c.tenantId === tenantFilter || c.tenantName?.toLowerCase().includes(tenantFilter.toLowerCase()));
      }
      setChangeSets(filtered);
      setTotalItems(filtered.length);
    }
  };

  const fetchGlobalRules = async () => {
    const url = `http://localhost:7000/api/global/change-management/approval-rules`;
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      setGlobalRules(data || []);
    } else {
      // Mock data
      const mockData: GlobalApprovalRule[] = [
        {
          id: '1',
          name: 'Critical Security Changes',
          targetModule: 'Security',
          requiredApprovers: 3,
          approverRoles: ['GlobalAdmin', 'SecurityAdmin', 'ComplianceOfficer'],
          isEnforced: true,
          tenantCanOverride: false,
          isActive: true,
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'User Management Changes',
          targetModule: 'Users',
          requiredApprovers: 2,
          approverRoles: ['GlobalAdmin', 'UserAdmin'],
          isEnforced: true,
          tenantCanOverride: true,
          isActive: true,
          createdAt: new Date().toISOString(),
        },
        {
          id: '3',
          name: 'Application Changes',
          targetModule: 'Applications',
          requiredApprovers: 1,
          approverRoles: ['AppAdmin'],
          isEnforced: false,
          tenantCanOverride: true,
          isActive: true,
          createdAt: new Date().toISOString(),
        },
      ];
      setGlobalRules(mockData);
    }
  };

  const fetchChangeHistory = async () => {
    let url = `http://localhost:7000/api/global/change-management/history?page=${page}&pageSize=${pageSize}`;
    if (tenantFilter) {
      url += `&tenantId=${tenantFilter}`;
    }
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      setChangeHistory(data.items || []);
      setTotalItems(data.totalCount || 0);
    } else {
      // Mock data
      const mockData: ChangeHistory[] = [
        {
          id: '1',
          changeSetId: '3',
          changeSetName: 'Application Configuration',
          tenantId: 'tenant-1',
          tenantName: 'Acme Corp',
          action: 'Applied',
          performedBy: 'admin@acme.com',
          performedAt: new Date(Date.now() - 86400000).toISOString(),
          details: 'Change set applied successfully. All changes committed.',
        },
        {
          id: '2',
          changeSetId: '4',
          changeSetName: 'Policy Update',
          tenantId: 'tenant-3',
          tenantName: 'Global Services',
          action: 'Rejected',
          performedBy: 'security@globalservices.com',
          performedAt: new Date(Date.now() - 172800000).toISOString(),
          details: 'Rejected: Policy does not meet compliance requirements.',
        },
        {
          id: '3',
          changeSetId: '2',
          changeSetName: 'New Security Policy',
          tenantId: 'tenant-2',
          tenantName: 'TechStart Inc',
          action: 'Approved',
          performedBy: 'security@techstart.com',
          performedAt: new Date(Date.now() - 43200000).toISOString(),
          details: 'Approved by security team. Scheduled for deployment.',
        },
        {
          id: '4',
          changeSetId: '1',
          changeSetName: 'Update User Permissions',
          tenantId: 'tenant-1',
          tenantName: 'Acme Corp',
          action: 'Submitted',
          performedBy: 'admin@acme.com',
          performedAt: new Date(Date.now() - 3600000).toISOString(),
          details: 'Change set submitted for review.',
        },
      ];
      let filtered = mockData;
      if (tenantFilter) {
        filtered = filtered.filter(h => h.tenantId === tenantFilter || h.tenantName?.toLowerCase().includes(tenantFilter.toLowerCase()));
      }
      setChangeHistory(filtered);
      setTotalItems(filtered.length);
    }
  };

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const response = await fetch('http://localhost:7000/api/global/change-management/approval-rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          ...newRule,
        }),
      });
      if (response.ok) {
        setSuccess('Global approval rule created successfully');
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
      } else {
        throw new Error('Failed to create rule');
      }
    } catch (err) {
      setError(t('common.error'));
    }
  };

  const handleToggleRule = async (rule: GlobalApprovalRule) => {
    try {
      const response = await fetch(`http://localhost:7000/api/global/change-management/approval-rules/${rule.id}/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, isActive: !rule.isActive }),
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

  const handleEnforceRule = async (rule: GlobalApprovalRule) => {
    try {
      const response = await fetch(`http://localhost:7000/api/global/change-management/approval-rules/${rule.id}/enforce`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, isEnforced: !rule.isEnforced }),
      });
      if (response.ok) {
        setSuccess(`Rule ${rule.isEnforced ? 'unenforced' : 'enforced'} globally`);
        fetchData();
      } else {
        throw new Error('Failed to enforce rule');
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
      case 'Submitted': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'Applied': return 'bg-blue-100 text-blue-800';
      case 'Approved': return 'bg-green-100 text-green-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      case 'Submitted': return 'bg-yellow-100 text-yellow-800';
      case 'Created': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalPages = Math.ceil(totalItems / pageSize);

  if (loading && !changeSets.length && !globalRules.length && !changeHistory.length) {
    return <div className="p-8">{t('common.loading')}</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Change Management - Global</h1>
        {activeTab === 'globalRules' && (
          <button
            onClick={() => setShowRuleModal(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Create Global Rule
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
          {(['allChangeSets', 'globalRules', 'changeHistory'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setPage(1); }}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab === 'allChangeSets' ? 'All Change Sets' : tab === 'globalRules' ? 'Global Approval Rules' : 'Change History'}
            </button>
          ))}
        </nav>
      </div>

      {/* All Change Sets Tab */}
      {activeTab === 'allChangeSets' && (
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

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tenant</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Module</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created By</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {changeSets.map((changeSet) => (
                  <tr key={changeSet.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{changeSet.tenantName || changeSet.tenantId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{changeSet.name}</div>
                      {changeSet.description && (
                        <div className="text-sm text-gray-500 truncate max-w-xs">{changeSet.description}</div>
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
                      {changeSet.createdBy}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(changeSet.createdAt).toLocaleDateString()}
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

      {/* Global Approval Rules Tab */}
      {activeTab === 'globalRules' && (
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
              {globalRules.map((rule) => (
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
                    <div className="flex flex-col gap-1">
                      <span className={`px-2 py-1 rounded text-xs inline-block w-fit ${rule.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {rule.isActive ? 'Active' : 'Inactive'}
                      </span>
                      {rule.isEnforced && (
                        <span className="px-2 py-1 rounded text-xs bg-purple-100 text-purple-800 inline-block w-fit">
                          Enforced
                        </span>
                      )}
                      {rule.tenantCanOverride && (
                        <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800 inline-block w-fit">
                          Override Allowed
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleToggleRule(rule)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        {rule.isActive ? 'Disable' : 'Enable'}
                      </button>
                      <button
                        onClick={() => handleEnforceRule(rule)}
                        className="text-purple-600 hover:text-purple-900"
                      >
                        {rule.isEnforced ? 'Unenforce' : 'Enforce'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {globalRules.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    No global approval rules configured.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Change History Tab */}
      {activeTab === 'changeHistory' && (
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

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tenant</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Change Set</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Performed By</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {changeHistory.map((history) => (
                  <tr key={history.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{history.tenantName || history.tenantId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{history.changeSetName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded text-xs ${getActionColor(history.action)}`}>
                        {history.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
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

      {/* Create Global Rule Modal */}
      {showRuleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Create Global Approval Rule</h2>
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
                    checked={newRule.isEnforced}
                    onChange={(e) => setNewRule({ ...newRule, isEnforced: e.target.checked })}
                  />
                  Enforce globally (apply to all tenants)
                </label>
              </div>
              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={newRule.tenantCanOverride}
                    onChange={(e) => setNewRule({ ...newRule, tenantCanOverride: e.target.checked })}
                  />
                  Allow tenants to override
                </label>
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
