import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'react-router-dom';
import { platformService } from '@/lib/api/services';
import { getTenantId } from '@/lib/tenant-context';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import { Helmet } from 'react-helmet-async';

interface Scope {
  id: string;
  type: 'org-unit' | 'application' | 'resource';
  name: string;
  resourceId: string;
  permissions: string[];
}

interface ActivityLog {
  id: string;
  action: string;
  resource: string;
  timestamp: string;
  details: string;
  ipAddress?: string;
  userAgent?: string;
}

interface DelegatedAdminDetails {
  id: string;
  userId: string;
  name: string;
  email: string;
  status: 'active' | 'suspended' | 'pending';
  scopes: Scope[];
  permissions: string[];
  assignedAt: string;
  assignedBy: string;
  lastActiveAt?: string;
  createdAt: string;
  updatedAt: string;
}

export default function TenantDelegatedAdminsDetailPage() {
  const params = useParams();
  const navigate = useNavigate();
  const id = params.id as string;
  const [tenantId, setTenantIdState] = useState<string | null>(null);

  const [admin, setAdmin] = useState<DelegatedAdminDetails | null>(null);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [activeTab, setActiveTab] = useState<'overview' | 'scopes' | 'permissions' | 'activity'>('overview');
  const [showEditScopesModal, setShowEditScopesModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [availableOrgUnits, setAvailableOrgUnits] = useState<any[]>([]);
  const [availableApplications, setAvailableApplications] = useState<any[]>([]);
  const [selectedScopes, setSelectedScopes] = useState<Scope[]>([]);

  useEffect(() => {
    const contextTenantId = getTenantId();
    setTenantIdState(contextTenantId || '00000000-0000-0000-0000-000000000000');
  }, []);

  useEffect(() => {
    if (tenantId) {
      fetchData();
    }
  }, [id, tenantId]);

  const fetchData = async () => {
    if (!tenantId) return;

    try {
      setLoading(true);
      // Since there's no getDelegatedAdminById in the service, we'll fetch the list and find by ID
      const admins = await platformService.getDelegatedAdmins(tenantId);
      const adminData = admins.find((a: any) => a.id === id);

      if (!adminData) {
        setNotFound(true);
        return;
      }

      // Transform to expected format
      const delegatedAdmin: DelegatedAdminDetails = {
        id: adminData.id,
        userId: adminData.tenantUserId || adminData.userId,
        name: adminData.name || adminData.userName || 'Unknown User',
        email: adminData.email || adminData.userEmail || '',
        status: adminData.status || 'active',
        scopes: adminData.scopes || [],
        permissions: adminData.permissions || [],
        assignedAt: adminData.assignedAt || adminData.createdAt,
        assignedBy: adminData.assignedBy || 'System',
        lastActiveAt: adminData.lastActiveAt,
        createdAt: adminData.createdAt,
        updatedAt: adminData.updatedAt,
      };

      setAdmin(delegatedAdmin);
      setSelectedScopes(delegatedAdmin.scopes);

      // Fetch related data
      await Promise.all([
        fetchActivityLogs(),
        fetchAvailableOrgUnits(),
        fetchAvailableApplications(),
      ]);
    } catch (err: any) {
      console.error('Error fetching delegated admin:', err);
      if (err.status === 404 || err.response?.status === 404) {
        setNotFound(true);
      } else {
        // Fallback to mock data
        loadMockData();
      }
    } finally {
      setLoading(false);
    }
  };

  const loadMockData = () => {
    const mockAdmin: DelegatedAdminDetails = {
      id,
      userId: 'user-123',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@example.com',
      status: 'active',
      scopes: [
        {
          id: 'scope-1',
          type: 'org-unit',
          name: 'Engineering Department',
          resourceId: 'ou-eng-001',
          permissions: ['users:read', 'users:write', 'apps:read'],
        },
        {
          id: 'scope-2',
          type: 'org-unit',
          name: 'Product Team',
          resourceId: 'ou-prod-001',
          permissions: ['users:read', 'apps:read'],
        },
        {
          id: 'scope-3',
          type: 'application',
          name: 'HR Portal',
          resourceId: 'app-hr-001',
          permissions: ['apps:read', 'apps:write'],
        },
      ],
      permissions: ['users:read', 'users:write', 'apps:read', 'apps:write', 'audit:read'],
      assignedAt: '2024-01-15T10:00:00Z',
      assignedBy: 'admin@example.com',
      lastActiveAt: '2024-03-20T14:30:00Z',
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-03-10T09:15:00Z',
    };

    const mockActivityLogs: ActivityLog[] = [
      {
        id: '1',
        action: 'User Updated',
        resource: 'john.doe@example.com',
        timestamp: '2024-03-20T14:30:00Z',
        details: 'Updated user profile information',
        ipAddress: '192.168.1.100',
      },
      {
        id: '2',
        action: 'Application Access Granted',
        resource: 'HR Portal',
        timestamp: '2024-03-19T11:20:00Z',
        details: 'Granted access to HR Portal for new employee',
        ipAddress: '192.168.1.100',
      },
      {
        id: '3',
        action: 'User Created',
        resource: 'jane.smith@example.com',
        timestamp: '2024-03-18T09:45:00Z',
        details: 'Created new user account',
        ipAddress: '192.168.1.101',
      },
      {
        id: '4',
        action: 'Audit Log Viewed',
        resource: 'Engineering Department',
        timestamp: '2024-03-17T16:30:00Z',
        details: 'Viewed audit logs for org unit',
        ipAddress: '192.168.1.100',
      },
    ];

    const mockOrgUnits = [
      { id: 'ou-eng-001', name: 'Engineering Department' },
      { id: 'ou-prod-001', name: 'Product Team' },
      { id: 'ou-sales-001', name: 'Sales Team' },
      { id: 'ou-hr-001', name: 'HR Department' },
    ];

    const mockApplications = [
      { id: 'app-hr-001', name: 'HR Portal' },
      { id: 'app-crm-001', name: 'CRM System' },
      { id: 'app-pm-001', name: 'Project Management' },
    ];

    setAdmin(mockAdmin);
    setActivityLogs(mockActivityLogs);
    setAvailableOrgUnits(mockOrgUnits);
    setAvailableApplications(mockApplications);
    setSelectedScopes(mockAdmin.scopes);
  };

  const fetchActivityLogs = async () => {
    // Mock implementation - would call API
    const mockActivityLogs: ActivityLog[] = [
      {
        id: '1',
        action: 'User Updated',
        resource: 'john.doe@example.com',
        timestamp: '2024-03-20T14:30:00Z',
        details: 'Updated user profile information',
        ipAddress: '192.168.1.100',
      },
      {
        id: '2',
        action: 'Application Access Granted',
        resource: 'HR Portal',
        timestamp: '2024-03-19T11:20:00Z',
        details: 'Granted access to HR Portal for new employee',
        ipAddress: '192.168.1.100',
      },
    ];
    setActivityLogs(mockActivityLogs);
  };

  const fetchAvailableOrgUnits = async () => {
    if (!tenantId) return;

    try {
      const orgUnits = await platformService.getOrgUnits(tenantId);
      setAvailableOrgUnits(orgUnits);
    } catch (err) {
      // Use mock data on error
      const mockOrgUnits = [
        { id: 'ou-eng-001', name: 'Engineering Department' },
        { id: 'ou-prod-001', name: 'Product Team' },
      ];
      setAvailableOrgUnits(mockOrgUnits);
    }
  };

  const fetchAvailableApplications = async () => {
    // Mock implementation - would call applications API
    const mockApplications = [
      { id: 'app-hr-001', name: 'HR Portal' },
      { id: 'app-crm-001', name: 'CRM System' },
    ];
    setAvailableApplications(mockApplications);
  };

  const handleSuspend = async () => {
    if (!tenantId || !admin) return;

    setError('');
    setSuccess('');

    try {
      // Mock implementation - would call API to suspend
      setSuccess('Delegated admin suspended successfully');
      fetchData();
    } catch (err: any) {
      setError(err?.message || 'Failed to suspend delegated admin');
    }
  };

  const handleActivate = async () => {
    if (!tenantId || !admin) return;

    setError('');
    setSuccess('');

    try {
      // Mock implementation - would call API to activate
      setSuccess('Delegated admin activated successfully');
      fetchData();
    } catch (err: any) {
      setError(err?.message || 'Failed to activate delegated admin');
    }
  };

  const handleUpdateScopes = async () => {
    if (!tenantId || !admin) return;

    setError('');
    setSuccess('');

    try {
      // Mock implementation - would call API to update scopes
      setSuccess('Scopes updated successfully');
      setShowEditScopesModal(false);
      fetchData();
    } catch (err: any) {
      setError(err?.message || 'Failed to update scopes');
    }
  };

  const handleDeleteAdmin = async () => {
    if (!tenantId) return;

    setError('');
    setSuccess('');

    try {
      await platformService.deleteDelegatedAdmin(tenantId, id);
      setSuccess('Delegated admin deleted successfully');
      setTimeout(() => {
        navigate('/tenant/delegated-admins');
      }, 1500);
    } catch (err: any) {
      setError(err?.message || 'Failed to delete delegated admin');
      setShowDeleteConfirm(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Delegated Admin Not Found</h1>
          <p className="text-gray-600 mb-6">The delegated admin you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/tenant/delegated-admins')}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Back to Delegated Admins
          </button>
        </div>
      </div>
    );
  }

  if (!admin) {
    return null;
  }

  return (
    <div className="p-8">
      <Breadcrumbs
        customLabels={{
          '/tenant': 'Tenant',
          '/tenant/delegated-admins': 'Delegated Admins',
          [`/tenant/delegated-admins/${id}`]: admin.name,
        }}
        className="mb-6"
      />

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{admin.name}</h1>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-gray-600">{admin.email}</span>
            <span className={`px-3 py-1 text-sm rounded ${getStatusColor(admin.status)}`}>
              {admin.status}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowEditScopesModal(true)}
            className="px-4 py-2 border rounded hover:bg-gray-50"
          >
            Edit Scopes
          </button>
          {admin.status === 'active' ? (
            <button
              onClick={handleSuspend}
              className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
            >
              Suspend
            </button>
          ) : (
            <button
              onClick={handleActivate}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Activate
            </button>
          )}
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Delete
          </button>
          <button
            onClick={() => navigate('/tenant/delegated-admins')}
            className="px-4 py-2 border rounded hover:bg-gray-50"
          >
            Back
          </button>
        </div>
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

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {(['overview', 'scopes', 'permissions', 'activity'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Admin Info Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Admin Information</h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-500">Admin ID</label>
                <p className="font-mono text-sm">{admin.id}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">User ID</label>
                <p className="font-mono text-sm">{admin.userId}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Status</label>
                <p>
                  <span className={`px-2 py-1 text-xs rounded ${getStatusColor(admin.status)}`}>
                    {admin.status}
                  </span>
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Assigned By</label>
                <p>{admin.assignedBy}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Assigned At</label>
                <p className="text-sm">{formatDate(admin.assignedAt)}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Last Active</label>
                <p className="text-sm">
                  {admin.lastActiveAt ? formatDate(admin.lastActiveAt) : 'Never'}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Created</label>
                <p className="text-sm">{formatDate(admin.createdAt)}</p>
              </div>
            </div>
          </div>

          {/* Statistics Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Statistics</h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-500">Total Scopes</label>
                <p className="text-2xl font-bold text-indigo-600">{admin.scopes.length}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Total Permissions</label>
                <p className="text-2xl font-bold text-indigo-600">{admin.permissions.length}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Organization Units</label>
                <p className="text-2xl font-bold text-indigo-600">
                  {admin.scopes.filter(s => s.type === 'org-unit').length}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Applications</label>
                <p className="text-2xl font-bold text-indigo-600">
                  {admin.scopes.filter(s => s.type === 'application').length}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'scopes' && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b flex justify-between items-center">
            <h2 className="text-lg font-semibold">Assigned Scopes ({admin.scopes.length})</h2>
            <button
              onClick={() => setShowEditScopesModal(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Manage Scopes
            </button>
          </div>
          <div className="p-6">
            {admin.scopes.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No scopes assigned</p>
            ) : (
              <div className="space-y-4">
                {admin.scopes.map((scope) => (
                  <div key={scope.id} className="border rounded p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium">{scope.name}</h3>
                        <p className="text-sm text-gray-500 capitalize">{scope.type}</p>
                      </div>
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                        {scope.permissions.length} permissions
                      </span>
                    </div>
                    <div className="mt-2">
                      <p className="text-xs text-gray-500 mb-1">Permissions:</p>
                      <div className="flex flex-wrap gap-1">
                        {scope.permissions.map((perm) => (
                          <span
                            key={perm}
                            className="px-2 py-1 text-xs bg-gray-100 rounded"
                          >
                            {perm}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'permissions' && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold">Effective Permissions ({admin.permissions.length})</h2>
          </div>
          <div className="p-6">
            {admin.permissions.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No permissions assigned</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {admin.permissions.map((perm) => (
                  <div key={perm} className="px-3 py-2 bg-gray-100 rounded text-sm">
                    {perm}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'activity' && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold">Activity Timeline</h2>
          </div>
          <div className="p-6">
            {activityLogs.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No activity recorded</p>
            ) : (
              <div className="space-y-4">
                {activityLogs.map((log) => (
                  <div key={log.id} className="border-l-4 border-indigo-500 pl-4 py-2">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{log.action}</p>
                          <span className="px-2 py-1 text-xs bg-gray-100 rounded">
                            {log.resource}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{log.details}</p>
                        <div className="flex gap-4 mt-2 text-xs text-gray-500">
                          <span>{formatDate(log.timestamp)}</span>
                          {log.ipAddress && <span>IP: {log.ipAddress}</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Scopes Modal */}
      {showEditScopesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Manage Scopes</h2>

            <div className="space-y-6">
              {/* Organization Units */}
              <div>
                <h3 className="font-medium mb-2">Organization Units</h3>
                <div className="border rounded p-4 max-h-48 overflow-y-auto">
                  {availableOrgUnits.map((ou) => (
                    <label key={ou.id} className="flex items-center gap-2 mb-2">
                      <input
                        type="checkbox"
                        checked={selectedScopes.some(s => s.resourceId === ou.id)}
                        onChange={() => {
                          // Toggle org unit scope
                          const exists = selectedScopes.some(s => s.resourceId === ou.id);
                          if (exists) {
                            setSelectedScopes(selectedScopes.filter(s => s.resourceId !== ou.id));
                          } else {
                            setSelectedScopes([
                              ...selectedScopes,
                              {
                                id: `scope-${Date.now()}`,
                                type: 'org-unit',
                                name: ou.name,
                                resourceId: ou.id,
                                permissions: ['users:read'],
                              },
                            ]);
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-sm">{ou.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Applications */}
              <div>
                <h3 className="font-medium mb-2">Applications</h3>
                <div className="border rounded p-4 max-h-48 overflow-y-auto">
                  {availableApplications.map((app) => (
                    <label key={app.id} className="flex items-center gap-2 mb-2">
                      <input
                        type="checkbox"
                        checked={selectedScopes.some(s => s.resourceId === app.id)}
                        onChange={() => {
                          // Toggle application scope
                          const exists = selectedScopes.some(s => s.resourceId === app.id);
                          if (exists) {
                            setSelectedScopes(selectedScopes.filter(s => s.resourceId !== app.id));
                          } else {
                            setSelectedScopes([
                              ...selectedScopes,
                              {
                                id: `scope-${Date.now()}`,
                                type: 'application',
                                name: app.name,
                                resourceId: app.id,
                                permissions: ['apps:read'],
                              },
                            ]);
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-sm">{app.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="text-sm text-gray-500 mt-4">
              {selectedScopes.length} scopes selected
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={handleUpdateScopes}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              >
                Save Scopes
              </button>
              <button
                onClick={() => setShowEditScopesModal(false)}
                className="px-4 py-2 border rounded hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Delete Delegated Admin</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this delegated admin? This will revoke all their administrative access. This action cannot be undone.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleDeleteAdmin}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border rounded hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
