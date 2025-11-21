'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { getTenantId } from '@/lib/tenant-context';
import LoadingOverlay from '@/app/components/LoadingOverlay';
import Modal from '@/app/components/Modal';
import StatusBadge from '@/app/components/StatusBadge';

// Types
interface OrgUnit {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  parentId?: string;
  parentName?: string;
  path: string;
  level: number;
  status: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

interface OrgUnitUser {
  id: string;
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  status: string;
  roles: string[];
  assignedAt: string;
  assignedByUserId?: string;
}

interface OrgUnitApplication {
  id: string;
  applicationId: string;
  name: string;
  type: string;
  category: string;
  status: string;
  assignedAt: string;
  userCount: number;
}

interface OrgUnitPolicy {
  id: string;
  policyId: string;
  name: string;
  category: string;
  type: string;
  isEnforced: boolean;
  appliedAt: string;
  appliedByUserId?: string;
}

interface OrgUnitHierarchy {
  id: string;
  name: string;
  parentId?: string;
  children: OrgUnitHierarchy[];
  userCount: number;
  applicationCount: number;
}

interface OrgUnitStatistics {
  orgUnitId: string;
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  totalApplications: number;
  totalPolicies: number;
  directChildren: number;
  totalDescendants: number;
  complianceScore?: number;
  lastUpdated: string;
}

type Tab = 'overview' | 'users' | 'applications' | 'policies' | 'hierarchy' | 'statistics';

export default function OrgUnitDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orgUnitId = params.id as string;
  const t = useTranslations();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Data states
  const [orgUnit, setOrgUnit] = useState<OrgUnit | null>(null);
  const [users, setUsers] = useState<OrgUnitUser[]>([]);
  const [applications, setApplications] = useState<OrgUnitApplication[]>([]);
  const [policies, setPolicies] = useState<OrgUnitPolicy[]>([]);
  const [hierarchy, setHierarchy] = useState<OrgUnitHierarchy | null>(null);
  const [statistics, setStatistics] = useState<OrgUnitStatistics | null>(null);

  // Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showAddApplicationModal, setShowAddApplicationModal] = useState(false);

  // Form states
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
  });

  const tenantId = getTenantId();

  useEffect(() => {
    fetchOrgUnit();
  }, [orgUnitId]);

  useEffect(() => {
    if (activeTab === 'users' && users.length === 0) {
      fetchUsers();
    } else if (activeTab === 'applications' && applications.length === 0) {
      fetchApplications();
    } else if (activeTab === 'policies' && policies.length === 0) {
      fetchPolicies();
    } else if (activeTab === 'hierarchy' && !hierarchy) {
      fetchHierarchy();
    } else if (activeTab === 'statistics' && !statistics) {
      fetchStatistics();
    }
  }, [activeTab]);

  const fetchOrgUnit = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(
        `http://localhost:7000/api/tenant/org-units/${orgUnitId}?tenantId=${tenantId}`,
        { credentials: 'include' }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch org unit');
      }

      const data = await response.json();
      setOrgUnit(data);
      setEditForm({
        name: data.name || '',
        description: data.description || '',
      });
    } catch (err: any) {
      setError(err.message || 'Failed to fetch org unit');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch(
        `http://localhost:7000/api/tenant/org-units/${orgUnitId}/users?tenantId=${tenantId}`,
        { credentials: 'include' }
      );

      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  };

  const fetchApplications = async () => {
    try {
      const response = await fetch(
        `http://localhost:7000/api/tenant/org-units/${orgUnitId}/applications?tenantId=${tenantId}`,
        { credentials: 'include' }
      );

      if (response.ok) {
        const data = await response.json();
        setApplications(data);
      }
    } catch (err) {
      console.error('Failed to fetch applications:', err);
    }
  };

  const fetchPolicies = async () => {
    try {
      const response = await fetch(
        `http://localhost:7000/api/tenant/org-units/${orgUnitId}/policies?tenantId=${tenantId}`,
        { credentials: 'include' }
      );

      if (response.ok) {
        const data = await response.json();
        setPolicies(data);
      }
    } catch (err) {
      console.error('Failed to fetch policies:', err);
    }
  };

  const fetchHierarchy = async () => {
    try {
      const response = await fetch(
        `http://localhost:7000/api/tenant/org-units/${orgUnitId}/hierarchy?tenantId=${tenantId}`,
        { credentials: 'include' }
      );

      if (response.ok) {
        const data = await response.json();
        setHierarchy(data);
      }
    } catch (err) {
      console.error('Failed to fetch hierarchy:', err);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await fetch(
        `http://localhost:7000/api/tenant/org-units/${orgUnitId}/statistics?tenantId=${tenantId}`,
        { credentials: 'include' }
      );

      if (response.ok) {
        const data = await response.json();
        setStatistics(data);
      }
    } catch (err) {
      console.error('Failed to fetch statistics:', err);
    }
  };

  const handleUpdateOrgUnit = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const response = await fetch(
        `http://localhost:7000/api/tenant/org-units/${orgUnitId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ tenantId, ...editForm }),
        }
      );

      if (!response.ok) throw new Error('Failed to update org unit');

      setSuccess('Org unit updated successfully');
      setShowEditModal(false);
      fetchOrgUnit();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveUser = async (userId: string) => {
    if (!confirm('Are you sure you want to remove this user from the org unit?')) return;
    try {
      const response = await fetch(
        `http://localhost:7000/api/tenant/org-units/${orgUnitId}/users/${userId}?tenantId=${tenantId}`,
        { method: 'DELETE', credentials: 'include' }
      );

      if (!response.ok) throw new Error('Failed to remove user');

      setSuccess('User removed successfully');
      fetchUsers();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleRemoveApplication = async (applicationId: string) => {
    if (!confirm('Are you sure you want to remove this application from the org unit?')) return;
    try {
      const response = await fetch(
        `http://localhost:7000/api/tenant/org-units/${orgUnitId}/applications/${applicationId}?tenantId=${tenantId}`,
        { method: 'DELETE', credentials: 'include' }
      );

      if (!response.ok) throw new Error('Failed to remove application');

      setSuccess('Application removed successfully');
      fetchApplications();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const renderHierarchyTree = (node: OrgUnitHierarchy, level: number = 0) => {
    return (
      <div key={node.id} className={`${level > 0 ? 'ml-6' : ''}`}>
        <div
          className={`flex items-center justify-between p-3 rounded-lg mb-2 cursor-pointer hover:bg-gray-100 transition-colors ${
            node.id === orgUnitId ? 'bg-blue-50 border-2 border-blue-500' : 'bg-gray-50'
          }`}
          onClick={() => {
            if (node.id !== orgUnitId) {
              router.push(`/tenant/org-units/${node.id}`);
            }
          }}
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">{level === 0 ? '📁' : '📂'}</span>
            <div>
              <div className="font-medium text-gray-900">{node.name}</div>
              <div className="text-xs text-gray-500">
                {node.userCount} users • {node.applicationCount} apps
              </div>
            </div>
          </div>
          {node.id === orgUnitId && (
            <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded">Current</span>
          )}
        </div>
        {node.children && node.children.length > 0 && (
          <div className="border-l-2 border-gray-200 ml-3">
            {node.children.map((child) => renderHierarchyTree(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return <LoadingOverlay isLoading={true} message="Loading org unit..." />;
  }

  if (!orgUnit) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          Org unit not found
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {orgUnit.name}
            </h1>
            <p className="text-gray-600 mt-2">{orgUnit.path}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowEditModal(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all"
            >
              Edit Org Unit
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'overview', label: 'Overview' },
            { key: 'users', label: 'Users' },
            { key: 'applications', label: 'Applications' },
            { key: 'policies', label: 'Policies' },
            { key: 'hierarchy', label: 'Hierarchy' },
            { key: 'statistics', label: 'Statistics' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as Tab)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Org Unit Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <div className="text-gray-900">{orgUnit.name}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <StatusBadge status={orgUnit.status} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Path</label>
                <div className="text-gray-900">{orgUnit.path}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
                <div className="text-gray-900">{orgUnit.level}</div>
              </div>
              {orgUnit.parentName && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Parent Org Unit</label>
                  <div className="text-gray-900">{orgUnit.parentName}</div>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Created At</label>
                <div className="text-gray-900">{formatDate(orgUnit.createdAt)}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Updated At</label>
                <div className="text-gray-900">{formatDate(orgUnit.updatedAt)}</div>
              </div>
            </div>
            {orgUnit.description && (
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <div className="text-gray-900">{orgUnit.description}</div>
              </div>
            )}
          </div>

          {orgUnit.metadata && Object.keys(orgUnit.metadata).length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Custom Metadata</h3>
              <pre className="bg-gray-50 p-4 rounded-lg overflow-auto text-sm">
                {JSON.stringify(orgUnit.metadata, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Users ({users.length})</h3>
            <button
              onClick={() => setShowAddUserModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add User
            </button>
          </div>
          {users.length === 0 ? (
            <p className="text-gray-500">No users assigned to this org unit</p>
          ) : (
            <div className="space-y-4">
              {users.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">{user.displayName}</div>
                    <div className="text-sm text-gray-600">{user.email}</div>
                    <div className="flex items-center gap-2 mt-2">
                      <StatusBadge status={user.status} />
                      {user.roles.length > 0 && (
                        <div className="flex gap-1">
                          {user.roles.map((role, idx) => (
                            <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                              {role}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Assigned: {formatDate(user.assignedAt)}
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveUser(user.userId)}
                    className="text-red-600 hover:text-red-800 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Applications Tab */}
      {activeTab === 'applications' && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Applications ({applications.length})</h3>
            <button
              onClick={() => setShowAddApplicationModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Application
            </button>
          </div>
          {applications.length === 0 ? (
            <p className="text-gray-500">No applications assigned to this org unit</p>
          ) : (
            <div className="space-y-4">
              {applications.map((app) => (
                <div key={app.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">{app.name}</div>
                    <div className="text-sm text-gray-600">
                      {app.type} • {app.category}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <StatusBadge status={app.status} />
                      <span className="text-xs text-gray-600">{app.userCount} users</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Assigned: {formatDate(app.assignedAt)}
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveApplication(app.applicationId)}
                    className="text-red-600 hover:text-red-800 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Policies Tab */}
      {activeTab === 'policies' && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Policies ({policies.length})</h3>
          {policies.length === 0 ? (
            <p className="text-gray-500">No policies applied to this org unit</p>
          ) : (
            <div className="space-y-4">
              {policies.map((policy) => (
                <div key={policy.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-medium text-gray-900">{policy.name}</div>
                      <div className="text-sm text-gray-600 mt-1">
                        {policy.category} • {policy.type}
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        Applied: {formatDate(policy.appliedAt)}
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        policy.isEnforced
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {policy.isEnforced ? 'Enforced' : 'Not Enforced'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Hierarchy Tab */}
      {activeTab === 'hierarchy' && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Organizational Hierarchy</h3>
          {!hierarchy ? (
            <p className="text-gray-500">Loading hierarchy...</p>
          ) : (
            <div className="space-y-2">{renderHierarchyTree(hierarchy)}</div>
          )}
        </div>
      )}

      {/* Statistics Tab */}
      {activeTab === 'statistics' && (
        <div className="space-y-6">
          {!statistics ? (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <p className="text-gray-500">Loading statistics...</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">{statistics.totalUsers}</div>
                    <div className="text-sm text-gray-600 mt-1">Total Users</div>
                    <div className="text-xs text-gray-500 mt-2">
                      {statistics.activeUsers} active • {statistics.inactiveUsers} inactive
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">{statistics.totalApplications}</div>
                    <div className="text-sm text-gray-600 mt-1">Applications</div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">{statistics.totalPolicies}</div>
                    <div className="text-sm text-gray-600 mt-1">Policies</div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600">{statistics.directChildren}</div>
                    <div className="text-sm text-gray-600 mt-1">Direct Children</div>
                    <div className="text-xs text-gray-500 mt-2">
                      {statistics.totalDescendants} total descendants
                    </div>
                  </div>
                </div>
              </div>

              {statistics.complianceScore !== undefined && (
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">Compliance Score</h3>
                  <div className="flex items-center gap-6">
                    <div className="relative w-32 h-32">
                      <svg className="w-32 h-32 transform -rotate-90">
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          stroke="#e5e7eb"
                          strokeWidth="8"
                          fill="transparent"
                        />
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          stroke={
                            statistics.complianceScore >= 90
                              ? '#10b981'
                              : statistics.complianceScore >= 70
                              ? '#3b82f6'
                              : statistics.complianceScore >= 50
                              ? '#f59e0b'
                              : '#dc2626'
                          }
                          strokeWidth="8"
                          fill="transparent"
                          strokeDasharray={`${(statistics.complianceScore / 100) * 352} 352`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-3xl font-bold">{statistics.complianceScore}</div>
                          <div className="text-xs text-gray-500">Score</div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">
                        Compliance score indicates how well this org unit adheres to configured policies.
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        Last updated: {formatDate(statistics.lastUpdated)}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Org Unit"
        footer={
          <>
            <button
              onClick={() => setShowEditModal(false)}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdateOrgUnit}
              disabled={saving}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
            <input
              type="text"
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={editForm.description}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
          </div>
        </div>
      </Modal>

      {/* Add User Modal - Placeholder */}
      <Modal
        isOpen={showAddUserModal}
        onClose={() => setShowAddUserModal(false)}
        title="Add User to Org Unit"
        footer={
          <>
            <button
              onClick={() => setShowAddUserModal(false)}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add User
            </button>
          </>
        }
      >
        <div className="text-gray-600">
          User selection interface would go here.
        </div>
      </Modal>

      {/* Add Application Modal - Placeholder */}
      <Modal
        isOpen={showAddApplicationModal}
        onClose={() => setShowAddApplicationModal(false)}
        title="Add Application to Org Unit"
        footer={
          <>
            <button
              onClick={() => setShowAddApplicationModal(false)}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Application
            </button>
          </>
        }
      >
        <div className="text-gray-600">
          Application selection interface would go here.
        </div>
      </Modal>

      <LoadingOverlay isLoading={saving} message="Processing..." />
    </div>
  );
}
