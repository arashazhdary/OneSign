import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'react-router-dom';
import { platformService } from '@/lib/api/services';
import { getTenantId } from '@/lib/tenant-context';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import { Helmet } from 'react-helmet-async';

interface Permission {
  id: string;
  resource: string;
  action: string;
  description: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  assignedAt: string;
}

interface AuditLog {
  id: string;
  action: string;
  performedBy: string;
  timestamp: string;
  details: string;
}

interface RoleDetails {
  id: string;
  name: string;
  description: string;
  type: 'system' | 'custom';
  isBuiltIn: boolean;
  scope: 'global' | 'tenant' | 'orgunit';
  permissions: Permission[];
  userCount: number;
  createdAt: string;
  updatedAt: string;
}

export default function TenantRolesDetailPage() {
  const params = useParams();
  const navigate = useNavigate();
  const id = params.id as string;
  const [tenantId, setTenantIdState] = useState<string | null>(null);

  const [role, setRole] = useState<RoleDetails | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [availablePermissions, setAvailablePermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [activeTab, setActiveTab] = useState<'overview' | 'permissions' | 'users' | 'audit'>('overview');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

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
      const result = await platformService.getRoleById(id, tenantId);

      // Transform to expected format
      const roleData: RoleDetails = {
        id: result.id,
        name: result.name || result.displayName,
        description: result.description || '',
        type: result.type,
        isBuiltIn: result.isBuiltIn,
        scope: result.scope,
        permissions: result.permissions || [],
        userCount: 0, // Will be populated from users list
        createdAt: result.createdAt,
        updatedAt: result.updatedAt,
      };

      setRole(roleData);
      setEditName(roleData.name);
      setEditDescription(roleData.description);
      setSelectedPermissions(roleData.permissions.map(p => p.id));

      // Fetch related data
      await Promise.all([
        fetchUsers(),
        fetchAuditLogs(),
        fetchAvailablePermissions(),
      ]);
    } catch (err: any) {
      console.error('Error fetching role:', err);
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
    const mockRole: RoleDetails = {
      id,
      name: 'Administrator',
      description: 'Full access to all resources and settings',
      type: 'system',
      isBuiltIn: true,
      scope: 'tenant',
      permissions: [
        { id: 'users:read', resource: 'Users', action: 'Read', description: 'View users' },
        { id: 'users:write', resource: 'Users', action: 'Write', description: 'Create and edit users' },
        { id: 'users:delete', resource: 'Users', action: 'Delete', description: 'Delete users' },
        { id: 'roles:read', resource: 'Roles', action: 'Read', description: 'View roles' },
        { id: 'roles:write', resource: 'Roles', action: 'Write', description: 'Create and edit roles' },
        { id: 'settings:read', resource: 'Settings', action: 'Read', description: 'View settings' },
        { id: 'settings:write', resource: 'Settings', action: 'Write', description: 'Edit settings' },
      ],
      userCount: 5,
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-03-20T14:30:00Z',
    };

    const mockUsers: User[] = [
      { id: '1', name: 'John Doe', email: 'john.doe@example.com', assignedAt: '2024-01-20T10:00:00Z' },
      { id: '2', name: 'Jane Smith', email: 'jane.smith@example.com', assignedAt: '2024-02-10T14:30:00Z' },
      { id: '3', name: 'Bob Johnson', email: 'bob.johnson@example.com', assignedAt: '2024-03-05T09:15:00Z' },
    ];

    const mockAuditLogs: AuditLog[] = [
      { id: '1', action: 'Role Updated', performedBy: 'admin@example.com', timestamp: '2024-03-20T14:30:00Z', details: 'Updated role description' },
      { id: '2', action: 'Permission Added', performedBy: 'admin@example.com', timestamp: '2024-02-15T11:20:00Z', details: 'Added settings:write permission' },
      { id: '3', action: 'User Assigned', performedBy: 'admin@example.com', timestamp: '2024-01-20T10:00:00Z', details: 'Assigned role to john.doe@example.com' },
    ];

    const mockPermissions: Permission[] = [
      { id: 'users:read', resource: 'Users', action: 'Read', description: 'View users' },
      { id: 'users:write', resource: 'Users', action: 'Write', description: 'Create and edit users' },
      { id: 'users:delete', resource: 'Users', action: 'Delete', description: 'Delete users' },
      { id: 'roles:read', resource: 'Roles', action: 'Read', description: 'View roles' },
      { id: 'roles:write', resource: 'Roles', action: 'Write', description: 'Create and edit roles' },
      { id: 'roles:delete', resource: 'Roles', action: 'Delete', description: 'Delete roles' },
      { id: 'settings:read', resource: 'Settings', action: 'Read', description: 'View settings' },
      { id: 'settings:write', resource: 'Settings', action: 'Write', description: 'Edit settings' },
      { id: 'audit:read', resource: 'Audit', action: 'Read', description: 'View audit logs' },
      { id: 'apps:read', resource: 'Applications', action: 'Read', description: 'View applications' },
    ];

    setRole(mockRole);
    setUsers(mockUsers);
    setAuditLogs(mockAuditLogs);
    setAvailablePermissions(mockPermissions);
    setEditName(mockRole.name);
    setEditDescription(mockRole.description);
    setSelectedPermissions(mockRole.permissions.map(p => p.id));
  };

  const fetchUsers = async () => {
    // Mock implementation - would call API
    const mockUsers: User[] = [
      { id: '1', name: 'John Doe', email: 'john.doe@example.com', assignedAt: '2024-01-20T10:00:00Z' },
      { id: '2', name: 'Jane Smith', email: 'jane.smith@example.com', assignedAt: '2024-02-10T14:30:00Z' },
    ];
    setUsers(mockUsers);
  };

  const fetchAuditLogs = async () => {
    // Mock implementation - would call API
    const mockAuditLogs: AuditLog[] = [
      { id: '1', action: 'Role Updated', performedBy: 'admin@example.com', timestamp: '2024-03-20T14:30:00Z', details: 'Updated role description' },
      { id: '2', action: 'Permission Added', performedBy: 'admin@example.com', timestamp: '2024-02-15T11:20:00Z', details: 'Added settings:write permission' },
    ];
    setAuditLogs(mockAuditLogs);
  };

  const fetchAvailablePermissions = async () => {
    try {
      const perms = await platformService.getPermissions();
      setAvailablePermissions(perms);
    } catch (err) {
      // Use mock permissions if API fails
      const mockPermissions: Permission[] = [
        { id: 'users:read', resource: 'Users', action: 'Read', description: 'View users' },
        { id: 'users:write', resource: 'Users', action: 'Write', description: 'Create and edit users' },
        { id: 'users:delete', resource: 'Users', action: 'Delete', description: 'Delete users' },
        { id: 'roles:read', resource: 'Roles', action: 'Read', description: 'View roles' },
        { id: 'roles:write', resource: 'Roles', action: 'Write', description: 'Create and edit roles' },
        { id: 'settings:read', resource: 'Settings', action: 'Read', description: 'View settings' },
        { id: 'settings:write', resource: 'Settings', action: 'Write', description: 'Edit settings' },
      ];
      setAvailablePermissions(mockPermissions);
    }
  };

  const handleUpdateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId || !role) return;

    setError('');
    setSuccess('');

    try {
      await platformService.updateRole(id, {
        name: editName,
        description: editDescription,
      }, tenantId);

      setSuccess('Role updated successfully');
      setShowEditModal(false);
      fetchData();
    } catch (err: any) {
      setError(err?.message || 'Failed to update role');
    }
  };

  const handleUpdatePermissions = async () => {
    if (!tenantId || !role) return;

    setError('');
    setSuccess('');

    try {
      await platformService.updateRole(id, {
        permissions: selectedPermissions,
      }, tenantId);

      setSuccess('Permissions updated successfully');
      setShowPermissionModal(false);
      fetchData();
    } catch (err: any) {
      setError(err?.message || 'Failed to update permissions');
    }
  };

  const handleDeleteRole = async () => {
    if (!tenantId) return;

    setError('');
    setSuccess('');

    try {
      await platformService.deleteRole(id, tenantId);
      setSuccess('Role deleted successfully');
      setTimeout(() => {
        navigate('/tenant/roles');
      }, 1500);
    } catch (err: any) {
      setError(err?.message || 'Failed to delete role');
      setShowDeleteConfirm(false);
    }
  };

  const togglePermission = (permId: string) => {
    setSelectedPermissions(prev =>
      prev.includes(permId)
        ? prev.filter(p => p !== permId)
        : [...prev, permId]
    );
  };

  const getResourceGroups = () => {
    const groups: Record<string, Permission[]> = {};
    availablePermissions.forEach(perm => {
      if (!groups[perm.resource]) {
        groups[perm.resource] = [];
      }
      groups[perm.resource].push(perm);
    });
    return groups;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
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
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Role Not Found</h1>
          <p className="text-gray-600 mb-6">The role you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/tenant/roles')}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Back to Roles
          </button>
        </div>
      </div>
    );
  }

  if (!role) {
    return null;
  }

  return (
    <div className="p-8">
      <Breadcrumbs
        customLabels={{
          '/tenant': 'Tenant',
          '/tenant/roles': 'Roles',
          [`/tenant/roles/${id}`]: role.name,
        }}
        className="mb-6"
      />

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{role.name}</h1>
          <p className="text-gray-600 mt-1">{role.description}</p>
        </div>
        <div className="flex gap-2">
          {!role.isBuiltIn && (
            <>
              <button
                onClick={() => setShowEditModal(true)}
                className="px-4 py-2 border rounded hover:bg-gray-50"
              >
                Edit Role
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </>
          )}
          <button
            onClick={() => navigate('/tenant/roles')}
            className="px-4 py-2 border rounded hover:bg-gray-50"
          >
            Back to List
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
          {(['overview', 'permissions', 'users', 'audit'] as const).map((tab) => (
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
          {/* Role Info Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Role Information</h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-500">Role ID</label>
                <p className="font-mono text-sm">{role.id}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Type</label>
                <p>
                  <span className={`px-2 py-1 text-xs rounded ${
                    role.type === 'system' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {role.type}
                  </span>
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Scope</label>
                <p className="capitalize">{role.scope}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Built-in</label>
                <p>{role.isBuiltIn ? 'Yes' : 'No'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Created</label>
                <p className="text-sm">{formatDate(role.createdAt)}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Last Updated</label>
                <p className="text-sm">{formatDate(role.updatedAt)}</p>
              </div>
            </div>
          </div>

          {/* Statistics Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Statistics</h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-500">Total Permissions</label>
                <p className="text-2xl font-bold text-indigo-600">{role.permissions.length}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Assigned Users</label>
                <p className="text-2xl font-bold text-indigo-600">{users.length}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'permissions' && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b flex justify-between items-center">
            <h2 className="text-lg font-semibold">Permissions ({role.permissions.length})</h2>
            {!role.isBuiltIn && (
              <button
                onClick={() => setShowPermissionModal(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              >
                Manage Permissions
              </button>
            )}
          </div>
          <div className="p-6">
            {role.permissions.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No permissions assigned</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Resource</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {role.permissions.map((perm) => (
                      <tr key={perm.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-medium">{perm.resource}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs bg-gray-100 rounded">{perm.action}</span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">{perm.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold">Assigned Users ({users.length})</h2>
          </div>
          <div className="p-6">
            {users.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No users assigned to this role</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned At</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">{user.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(user.assignedAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'audit' && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold">Activity Log</h2>
          </div>
          <div className="p-6">
            {auditLogs.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No activity recorded</p>
            ) : (
              <div className="space-y-4">
                {auditLogs.map((log) => (
                  <div key={log.id} className="border-l-4 border-indigo-500 pl-4 py-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{log.action}</p>
                        <p className="text-sm text-gray-600">{log.details}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          by {log.performedBy} at {formatDate(log.timestamp)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Role Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Edit Role</h2>
            <form onSubmit={handleUpdateRole}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Role Name</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="w-full px-3 py-2 border rounded"
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manage Permissions Modal */}
      {showPermissionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Manage Permissions</h2>
            <div className="border rounded p-4 max-h-96 overflow-y-auto mb-4">
              {Object.entries(getResourceGroups()).map(([resource, perms]) => (
                <div key={resource} className="mb-4">
                  <h3 className="font-medium text-sm mb-2">{resource}</h3>
                  <div className="space-y-2 ml-4">
                    {perms.map((perm) => (
                      <label key={perm.id} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedPermissions.includes(perm.id)}
                          onChange={() => togglePermission(perm.id)}
                          className="rounded"
                        />
                        <span className="text-sm">
                          {perm.action} - {perm.description}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="text-sm text-gray-500 mb-4">
              {selectedPermissions.length} permissions selected
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleUpdatePermissions}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              >
                Save Permissions
              </button>
              <button
                onClick={() => setShowPermissionModal(false)}
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
            <h2 className="text-xl font-bold mb-4">Delete Role</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this role? This action cannot be undone.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleDeleteRole}
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
