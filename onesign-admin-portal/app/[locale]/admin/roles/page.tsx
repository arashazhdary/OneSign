'use client';

import { useState, useEffect } from 'react';
import { platformService } from '@/lib/api/services';

interface PlatformRole {
  id: string;
  name: string;
  description: string;
  type: 'system' | 'custom';
  permissions: string[];
  usersCount: number;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function PlatformRolesPage() {
  const [roles, setRoles] = useState<PlatformRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedRole, setSelectedRole] = useState<PlatformRole | null>(null);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const data = await platformService.getPlatformRoles?.();
      const mockData: PlatformRole[] = [
        {
          id: '1',
          name: 'Super Administrator',
          description: 'Full platform access with all permissions',
          type: 'system',
          permissions: [
            'platform:*',
            'tenants:*',
            'users:*',
            'billing:*',
            'system:*',
            'security:*',
            'integrations:*',
            'analytics:*',
          ],
          usersCount: 2,
          isDefault: false,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
        {
          id: '2',
          name: 'Platform Administrator',
          description: 'Manage tenants, users, and platform settings',
          type: 'system',
          permissions: [
            'tenants:read',
            'tenants:write',
            'tenants:delete',
            'users:read',
            'users:write',
            'users:delete',
            'analytics:read',
            'integrations:read',
            'integrations:write',
          ],
          usersCount: 5,
          isDefault: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
        {
          id: '3',
          name: 'Support Agent',
          description: 'View tenants and users, limited write access',
          type: 'system',
          permissions: [
            'tenants:read',
            'users:read',
            'users:write',
            'analytics:read',
          ],
          usersCount: 12,
          isDefault: false,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
        {
          id: '4',
          name: 'Analytics Viewer',
          description: 'Read-only access to analytics and reports',
          type: 'system',
          permissions: [
            'analytics:read',
            'tenants:read',
            'users:read',
          ],
          usersCount: 8,
          isDefault: false,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
        {
          id: '5',
          name: 'Billing Manager',
          description: 'Manage billing and subscriptions',
          type: 'custom',
          permissions: [
            'billing:read',
            'billing:write',
            'tenants:read',
            'analytics:read',
          ],
          usersCount: 3,
          isDefault: false,
          createdAt: '2024-02-15T10:00:00Z',
          updatedAt: '2024-10-20T14:00:00Z',
        },
      ]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    // await platformService.createPlatformRole({...});
    setShowCreate(false);
    fetchRoles();
  };

  const handleDelete = async (roleId: string) => {
    if (!confirm('Delete this role? Users with this role will lose their permissions.')) return;
    // await platformService.deletePlatformRole(roleId);
    fetchRoles();
  };

  const getTypeBadge = (type: string) => {
    const colors = {
      system: 'bg-purple-100 text-purple-800',
      custom: 'bg-blue-100 text-blue-800',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100';
  };

  const allPermissions = [
    { category: 'Platform', perms: ['platform:read', 'platform:write', 'platform:delete', 'platform:*'] },
    { category: 'Tenants', perms: ['tenants:read', 'tenants:write', 'tenants:delete', 'tenants:*'] },
    { category: 'Users', perms: ['users:read', 'users:write', 'users:delete', 'users:*'] },
    { category: 'Billing', perms: ['billing:read', 'billing:write', 'billing:*'] },
    { category: 'System', perms: ['system:read', 'system:write', 'system:*'] },
    { category: 'Security', perms: ['security:read', 'security:write', 'security:*'] },
    { category: 'Integrations', perms: ['integrations:read', 'integrations:write', 'integrations:*'] },
    { category: 'Analytics', perms: ['analytics:read', 'analytics:*'] },
  ];

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Platform Roles</h1>
          <p className="text-gray-600 mt-1">Manage system-level roles and permissions</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Create Role
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Total Roles</div>
          <div className="text-2xl font-bold">{roles.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">System Roles</div>
          <div className="text-2xl font-bold text-purple-600">
            {roles.filter(r => r.type === 'system').length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Custom Roles</div>
          <div className="text-2xl font-bold text-blue-600">
            {roles.filter(r => r.type === 'custom').length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Total Users</div>
          <div className="text-2xl font-bold">
            {roles.reduce((acc, r) => acc + r.usersCount, 0)}
          </div>
        </div>
      </div>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {roles.map((role) => (
          <div key={role.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold">{role.name}</h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${getTypeBadge(role.type)}`}>
                    {role.type}
                  </span>
                  {role.isDefault && (
                    <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                      Default
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-3">{role.description}</p>

                {/* Users Count */}
                <div className="mb-3 text-sm">
                  <span className="text-gray-500">Users with this role:</span>
                  <span className="ml-2 font-semibold">{role.usersCount}</span>
                </div>

                {/* Permissions */}
                <div>
                  <span className="text-sm text-gray-500">Permissions ({role.permissions.length}):</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {role.permissions.slice(0, 6).map((perm, idx) => (
                      <span key={idx} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded font-mono">
                        {perm}
                      </span>
                    ))}
                    {role.permissions.length > 6 && (
                      <button
                        onClick={() => setSelectedRole(role)}
                        className="px-2 py-1 text-xs text-blue-600 hover:text-blue-800"
                      >
                        +{role.permissions.length - 6} more
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-3 text-xs text-gray-500">
                  Created: {new Date(role.createdAt).toLocaleDateString()}
                  {role.updatedAt !== role.createdAt && (
                    <> | Updated: {new Date(role.updatedAt).toLocaleDateString()}</>
                  )}
                </div>
              </div>

              <div className="flex space-x-2 ml-4">
                <button
                  onClick={() => setSelectedRole(role)}
                  className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
                >
                  View
                </button>
                {role.type === 'custom' && (
                  <>
                    <button className="px-3 py-1 text-sm border border-blue-300 text-blue-600 rounded hover:bg-blue-50">
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(role.id)}
                      className="px-3 py-1 text-sm text-red-600 border border-red-300 rounded hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Role Details Modal */}
      {selectedRole && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <h2 className="text-xl font-bold">{selectedRole.name}</h2>
                  <span className={`px-2 py-1 text-xs rounded-full ${getTypeBadge(selectedRole.type)}`}>
                    {selectedRole.type}
                  </span>
                </div>
                <p className="text-gray-600">{selectedRole.description}</p>
              </div>
              <button
                onClick={() => setSelectedRole(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Role Information</h3>
                <div className="bg-gray-50 rounded p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type:</span>
                    <span className="font-medium">{selectedRole.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Users:</span>
                    <span className="font-medium">{selectedRole.usersCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Default Role:</span>
                    <span className="font-medium">{selectedRole.isDefault ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Created:</span>
                    <span className="font-medium">{new Date(selectedRole.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">All Permissions ({selectedRole.permissions.length})</h3>
                <div className="bg-gray-50 rounded p-4 max-h-96 overflow-y-auto">
                  <div className="flex flex-wrap gap-2">
                    {selectedRole.permissions.map((perm, idx) => (
                      <span key={idx} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded font-mono">
                        {perm}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <button
                  onClick={() => setSelectedRole(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg"
                >
                  Close
                </button>
                {selectedRole.type === 'custom' && (
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Edit Role
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Create Platform Role</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Role Name</label>
                <input
                  type="text"
                  placeholder="e.g., Integration Manager"
                  className="w-full border border-gray-300 rounded-lg p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  placeholder="Describe what this role can do"
                  className="w-full border border-gray-300 rounded-lg p-2"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Permissions</label>
                <div className="border border-gray-300 rounded-lg p-4 max-h-96 overflow-y-auto">
                  {allPermissions.map((group, idx) => (
                    <div key={idx} className="mb-4">
                      <h4 className="font-semibold text-sm mb-2">{group.category}</h4>
                      <div className="space-y-1 ml-4">
                        {group.perms.map((perm, pidx) => (
                          <label key={pidx} className="flex items-center text-sm">
                            <input type="checkbox" className="mr-2" />
                            <span className="font-mono">{perm}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm">Set as default role for new admin users</span>
                </label>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <button
                  onClick={() => setShowCreate(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create Role
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
