'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { getTenantId } from '@/lib/tenant-context';
import { platformService } from '@/lib/api/services';

interface Permission {
  id: string;
  resource: string;
  action: string;
  description: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
  isSystem: boolean;
  parentRoleId?: string;
  createdAt: string;
}

interface RoleTemplate {
  id: string;
  name: string;
  description: string;
  permissions: string[];
}

const ROLE_TEMPLATES: RoleTemplate[] = [
  {
    id: 'admin',
    name: 'Administrator',
    description: 'Full access to all resources',
    permissions: ['users:read', 'users:write', 'users:delete', 'roles:read', 'roles:write', 'settings:read', 'settings:write'],
  },
  {
    id: 'viewer',
    name: 'Viewer',
    description: 'Read-only access',
    permissions: ['users:read', 'roles:read', 'settings:read'],
  },
  {
    id: 'user-manager',
    name: 'User Manager',
    description: 'Manage users only',
    permissions: ['users:read', 'users:write', 'users:delete'],
  },
  {
    id: 'auditor',
    name: 'Auditor',
    description: 'Access to audit logs and reports',
    permissions: ['audit:read', 'reports:read'],
  },
];

const AVAILABLE_PERMISSIONS: Permission[] = [
  { id: 'users:read', resource: 'Users', action: 'Read', description: 'View users' },
  { id: 'users:write', resource: 'Users', action: 'Write', description: 'Create and edit users' },
  { id: 'users:delete', resource: 'Users', action: 'Delete', description: 'Delete users' },
  { id: 'roles:read', resource: 'Roles', action: 'Read', description: 'View roles' },
  { id: 'roles:write', resource: 'Roles', action: 'Write', description: 'Create and edit roles' },
  { id: 'roles:delete', resource: 'Roles', action: 'Delete', description: 'Delete roles' },
  { id: 'settings:read', resource: 'Settings', action: 'Read', description: 'View settings' },
  { id: 'settings:write', resource: 'Settings', action: 'Write', description: 'Edit settings' },
  { id: 'audit:read', resource: 'Audit', action: 'Read', description: 'View audit logs' },
  { id: 'reports:read', resource: 'Reports', action: 'Read', description: 'View reports' },
  { id: 'apps:read', resource: 'Applications', action: 'Read', description: 'View applications' },
  { id: 'apps:write', resource: 'Applications', action: 'Write', description: 'Manage applications' },
  { id: 'policies:read', resource: 'Policies', action: 'Read', description: 'View policies' },
  { id: 'policies:write', resource: 'Policies', action: 'Write', description: 'Manage policies' },
];

export default function RoleManagementPage() {
  const t = useTranslations();
  const [tenantId, setTenantIdState] = useState<string | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPermissionMatrix, setShowPermissionMatrix] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showHierarchyView, setShowHierarchyView] = useState(false);
  const [showAssignUsersModal, setShowAssignUsersModal] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [selectedRoleForUsers, setSelectedRoleForUsers] = useState<Role | null>(null);
  const [roleName, setRoleName] = useState('');
  const [roleDescription, setRoleDescription] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [parentRoleId, setParentRoleId] = useState<string>('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const contextTenantId = getTenantId();
    setTenantIdState(contextTenantId || '00000000-0000-0000-0000-000000000000');
  }, []);

  useEffect(() => {
    if (tenantId) {
      fetchRoles();
    }
  }, [tenantId]);

  const fetchRoles = async () => {
    if (!tenantId) return;
    try {
      const data = await platformService.getRoles(tenantId);
      setRoles(data.items || data || []);
    } catch (error) {
      console.error('Error fetching roles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!tenantId) return;

    const payload = {
      name: roleName,
      description: roleDescription,
      permissions: selectedPermissions,
      parentRoleId: parentRoleId || null,
    };

    try {
      if (editingRole) {
        await platformService.updateRole(editingRole.id, payload, tenantId);
      } else {
        await platformService.createRole({ ...payload, tenantId });
      }
      setSuccess(editingRole ? 'Role updated successfully' : 'Role created successfully');
      setShowCreateModal(false);
      resetForm();
      fetchRoles();
    } catch (error: any) {
      setError(error?.message || 'Failed to save role');
      console.error('Error saving role:', error);
    }
  };

  const handleEditRole = (role: Role) => {
    setEditingRole(role);
    setRoleName(role.name);
    setRoleDescription(role.description);
    setSelectedPermissions(role.permissions);
    setParentRoleId(role.parentRoleId || '');
    setShowCreateModal(true);
  };

  const handleDeleteRole = async (roleId: string) => {
    if (!confirm('Are you sure you want to delete this role?')) return;

    setError('');
    setSuccess('');

    try {
      await platformService.deleteRole(roleId, tenantId);
      setSuccess('Role deleted successfully');
      fetchRoles();
    } catch (error: any) {
      setError(error?.message || 'Failed to delete role');
      console.error('Error deleting role:', error);
    }
  };

  const handleCloneRole = (role: Role) => {
    setEditingRole(null);
    setRoleName(`${role.name} (Copy)`);
    setRoleDescription(role.description);
    setSelectedPermissions([...role.permissions]);
    setParentRoleId('');
    setShowCreateModal(true);
  };

  const handleApplyTemplate = (template: RoleTemplate) => {
    setRoleName(template.name);
    setRoleDescription(template.description);
    setSelectedPermissions(template.permissions);
    setShowTemplateModal(false);
    setShowCreateModal(true);
  };

  const resetForm = () => {
    setEditingRole(null);
    setRoleName('');
    setRoleDescription('');
    setSelectedPermissions([]);
    setParentRoleId('');
  };

  const togglePermission = (permissionId: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permissionId)
        ? prev.filter((p) => p !== permissionId)
        : [...prev, permissionId]
    );
  };

  const getResourceGroups = () => {
    const groups: Record<string, Permission[]> = {};
    AVAILABLE_PERMISSIONS.forEach((perm) => {
      if (!groups[perm.resource]) {
        groups[perm.resource] = [];
      }
      groups[perm.resource].push(perm);
    });
    return groups;
  };

  const filteredRoles = roles.filter((role) =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const buildRoleHierarchy = (roleId?: string, level: number = 0): JSX.Element[] => {
    const childRoles = roles.filter((r) => r.parentRoleId === roleId);
    return childRoles.map((role) => (
      <div key={role.id}>
        <div
          className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded"
          style={{ marginLeft: level * 20 }}
        >
          {level > 0 && <span className="text-gray-400">└─</span>}
          <span className="font-medium">{role.name}</span>
          <span className="text-sm text-gray-500">({role.userCount} users)</span>
        </div>
        {buildRoleHierarchy(role.id, level + 1)}
      </div>
    ));
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Role Management</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowTemplateModal(true)}
            className="px-4 py-2 border rounded hover:bg-gray-50"
          >
            📋 Templates
          </button>
          <button
            onClick={() => setShowHierarchyView(true)}
            className="px-4 py-2 border rounded hover:bg-gray-50"
          >
            🌳 Hierarchy
          </button>
          <button
            onClick={() => setShowPermissionMatrix(true)}
            className="px-4 py-2 border rounded hover:bg-gray-50"
          >
            📊 Permission Matrix
          </button>
          <button
            onClick={() => {
              resetForm();
              setShowCreateModal(true);
            }}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            + Create Role
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

      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search roles..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md px-4 py-2 border rounded"
        />
      </div>

      {/* Roles Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Role Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Permissions
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Users
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredRoles.map((role) => (
              <tr key={role.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-gray-900">{role.name}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-500">{role.description}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-500">{role.permissions.length} permissions</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-500">{role.userCount}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 text-xs rounded ${
                      role.isSystem ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {role.isSystem ? 'System' : 'Custom'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditRole(role)}
                      className="text-blue-600 hover:text-blue-900"
                      disabled={role.isSystem}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleCloneRole(role)}
                      className="text-green-600 hover:text-green-900"
                    >
                      Clone
                    </button>
                    <button
                      onClick={() => {
                        setSelectedRoleForUsers(role);
                        setShowAssignUsersModal(true);
                      }}
                      className="text-purple-600 hover:text-purple-900"
                    >
                      Assign Users
                    </button>
                    {!role.isSystem && (
                      <button
                        onClick={() => handleDeleteRole(role.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create/Edit Role Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingRole ? 'Edit Role' : 'Create New Role'}
            </h2>
            <form onSubmit={handleCreateOrUpdateRole}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Role Name</label>
                  <input
                    type="text"
                    required
                    value={roleName}
                    onChange={(e) => setRoleName(e.target.value)}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    value={roleDescription}
                    onChange={(e) => setRoleDescription(e.target.value)}
                    className="w-full px-3 py-2 border rounded"
                    rows={2}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Parent Role (Optional)</label>
                  <select
                    value={parentRoleId}
                    onChange={(e) => setParentRoleId(e.target.value)}
                    className="w-full px-3 py-2 border rounded"
                  >
                    <option value="">None</option>
                    {roles
                      .filter((r) => r.id !== editingRole?.id)
                      .map((role) => (
                        <option key={role.id} value={role.id}>
                          {role.name}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Permissions</label>
                  <div className="border rounded p-4 max-h-64 overflow-y-auto">
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
                </div>

                <div className="text-sm text-gray-500">
                  {selectedPermissions.length} permissions selected
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                >
                  {editingRole ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 border rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Permission Matrix Modal */}
      {showPermissionMatrix && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-auto">
            <h2 className="text-xl font-bold mb-4">Permission Matrix</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full border">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border px-4 py-2 text-left">Resource / Action</th>
                    {roles.map((role) => (
                      <th key={role.id} className="border px-4 py-2 text-center text-sm">
                        {role.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {AVAILABLE_PERMISSIONS.map((perm) => (
                    <tr key={perm.id}>
                      <td className="border px-4 py-2 text-sm">
                        <div className="font-medium">{perm.resource}</div>
                        <div className="text-gray-500 text-xs">{perm.action}</div>
                      </td>
                      {roles.map((role) => (
                        <td key={role.id} className="border px-4 py-2 text-center">
                          {role.permissions.includes(perm.id) ? (
                            <span className="text-green-600">✓</span>
                          ) : (
                            <span className="text-gray-300">-</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button
              onClick={() => setShowPermissionMatrix(false)}
              className="mt-4 px-4 py-2 border rounded hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Role Templates Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full">
            <h2 className="text-xl font-bold mb-4">Role Templates</h2>
            <div className="space-y-3">
              {ROLE_TEMPLATES.map((template) => (
                <div
                  key={template.id}
                  className="border rounded p-4 hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleApplyTemplate(template)}
                >
                  <h3 className="font-medium">{template.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    {template.permissions.length} permissions
                  </p>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowTemplateModal(false)}
              className="mt-4 px-4 py-2 border rounded hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Role Hierarchy Modal */}
      {showHierarchyView && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Role Hierarchy</h2>
            <div className="space-y-1">{buildRoleHierarchy()}</div>
            <button
              onClick={() => setShowHierarchyView(false)}
              className="mt-4 px-4 py-2 border rounded hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Assign Users Modal */}
      {showAssignUsersModal && selectedRoleForUsers && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full">
            <h2 className="text-xl font-bold mb-4">
              Assign Users to {selectedRoleForUsers.name}
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              This feature will allow you to assign users to this role. Integration with user
              management will be implemented.
            </p>
            <div className="border rounded p-4 mb-4">
              <p className="text-sm">Current users: {selectedRoleForUsers.userCount}</p>
            </div>
            <button
              onClick={() => {
                setShowAssignUsersModal(false);
                setSelectedRoleForUsers(null);
              }}
              className="px-4 py-2 border rounded hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
