import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  adminService,
  PlatformAdminDto,
  AdminActivityDto
} from '@/lib/api/services/admin.service';

const ADMIN_ROLES = ['SuperAdmin', 'PlatformAdmin', 'SupportAdmin'] as const;

const AVAILABLE_PERMISSIONS = [
  'platform.tenants.read',
  'platform.tenants.write',
  'platform.tenants.delete',
  'platform.users.read',
  'platform.users.write',
  'platform.users.delete',
  'platform.settings.read',
  'platform.settings.write',
  'platform.security.read',
  'platform.security.write',
  'platform.audit.read',
  'platform.billing.read',
  'platform.billing.write',
];

export default function AdminUsersPage() {
  const [loading, setLoading] = useState(true);
  const [admins, setAdmins] = useState<PlatformAdminDto[]>([]);
  const [selectedAdmin, setSelectedAdmin] = useState<PlatformAdminDto | null>(null);
  const [adminActivities, setAdminActivities] = useState<AdminActivityDto[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [formEmail, setFormEmail] = useState('');
  const [formFirstName, setFormFirstName] = useState('');
  const [formLastName, setFormLastName] = useState('');
  const [formRole, setFormRole] = useState<PlatformAdminDto['role']>('PlatformAdmin');
  const [formPermissions, setFormPermissions] = useState<string[]>([]);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    setLoading(true);
    setError('');

    try {
      // Fetch admins from API
      const response = await adminService.getAdmins(1, 100);
      setAdmins(response.items);
    } catch (err: any) {
      console.error('Error fetching admins:', err);
      setError('Failed to load platform administrators');
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminActivities = async (adminId: string) => {
    try {
      // Fetch admin activities from API
      const activities = await adminService.getAdminActivities(adminId, 20);
      setAdminActivities(activities);
    } catch (err) {
      console.error('Error fetching admin activities:', err);
      setAdminActivities([]);
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      // Create admin via API
      const newAdmin = await adminService.createAdmin({
        email: formEmail,
        firstName: formFirstName,
        lastName: formLastName,
        role: formRole,
        permissions: formPermissions,
      });

      setAdmins([...admins, newAdmin]);
      setSuccess('Administrator created successfully');
      setShowCreateModal(false);
      resetForm();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to create administrator');
    }
  };

  const handleUpdateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedAdmin) return;

    try {
      // Update admin via API
      const updatedAdmin = await adminService.updateAdmin(selectedAdmin.id, {
        email: formEmail,
        firstName: formFirstName,
        lastName: formLastName,
        role: formRole,
        permissions: formPermissions,
      });

      setAdmins(admins.map(a => a.id === selectedAdmin.id ? updatedAdmin : a));
      setSuccess('Administrator updated successfully');
      setShowEditModal(false);
      setSelectedAdmin(null);
      resetForm();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to update administrator');
    }
  };

  const handleDeleteAdmin = async (adminId: string) => {
    if (!confirm('Are you sure you want to delete this administrator?')) return;

    setError('');
    setSuccess('');

    try {
      // Delete admin via API
      await adminService.deleteAdmin(adminId);
      setAdmins(admins.filter(a => a.id !== adminId));
      setSuccess('Administrator deleted successfully');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to delete administrator');
    }
  };

  const handleSuspendAdmin = async (adminId: string) => {
    if (!confirm('Are you sure you want to suspend this administrator?')) return;

    setError('');
    setSuccess('');

    try {
      // Suspend admin via API
      const updatedAdmin = await adminService.suspendAdmin(adminId);
      setAdmins(admins.map(a => a.id === adminId ? updatedAdmin : a));
      setSuccess('Administrator suspended successfully');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to suspend administrator');
    }
  };

  const handleActivateAdmin = async (adminId: string) => {
    setError('');
    setSuccess('');

    try {
      // Activate admin via API
      const updatedAdmin = await adminService.activateAdmin(adminId);
      setAdmins(admins.map(a => a.id === adminId ? updatedAdmin : a));
      setSuccess('Administrator activated successfully');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to activate administrator');
    }
  };

  const openEditModal = (admin: PlatformAdminDto) => {
    setSelectedAdmin(admin);
    setFormEmail(admin.email);
    setFormFirstName(admin.firstName);
    setFormLastName(admin.lastName);
    setFormRole(admin.role);
    setFormPermissions(admin.permissions);
    setShowEditModal(true);
  };

  const openActivityModal = async (admin: PlatformAdminDto) => {
    setSelectedAdmin(admin);
    await fetchAdminActivities(admin.id);
    setShowActivityModal(true);
  };

  const resetForm = () => {
    setFormEmail('');
    setFormFirstName('');
    setFormLastName('');
    setFormRole('PlatformAdmin');
    setFormPermissions([]);
    setSelectedAdmin(null);
  };

  const togglePermission = (permission: string) => {
    setFormPermissions(prev =>
      prev.includes(permission)
        ? prev.filter(p => p !== permission)
        : [...prev, permission]
    );
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString();
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'SuperAdmin':
        return 'bg-purple-100 text-purple-800';
      case 'PlatformAdmin':
        return 'bg-blue-100 text-blue-800';
      case 'SupportAdmin':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Inactive':
        return 'bg-gray-100 text-gray-800';
      case 'Suspended':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-gray-600">Loading administrators...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Platform Administrators</h1>
        <p className="mt-2 text-gray-600">Manage super admins, platform admins, and support staff</p>
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

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-sm text-gray-500">Total Admins</div>
          <div className="text-2xl font-bold text-gray-900">{admins.length}</div>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-sm text-gray-500">Active</div>
          <div className="text-2xl font-bold text-green-600">
            {admins.filter(a => a.status === 'Active').length}
          </div>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-sm text-gray-500">Suspended</div>
          <div className="text-2xl font-bold text-red-600">
            {admins.filter(a => a.status === 'Suspended').length}
          </div>
        </div>
      </div>

      {/* Admin List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Administrators</h2>
          <button
            onClick={() => {
              resetForm();
              setShowCreateModal(true);
            }}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          >
            Create New Admin
          </button>
        </div>
        <div className="overflow-x-auto">
          {admins.length === 0 ? (
            <p className="text-gray-500 text-center py-12">No administrators found</p>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Admin</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Permissions</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Login</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {admins.map((admin) => (
                  <tr key={admin.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {admin.firstName} {admin.lastName}
                      </div>
                      <div className="text-sm text-gray-500">{admin.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded ${getRoleBadgeColor(admin.role)}`}>
                        {admin.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded ${getStatusBadgeColor(admin.status)}`}>
                        {admin.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500">
                        {admin.permissions.length} permissions
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(admin.lastLoginAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-3">
                      <button
                        onClick={() => openEditModal(admin)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => openActivityModal(admin)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Activity
                      </button>
                      {admin.status === 'Active' ? (
                        <button
                          onClick={() => handleSuspendAdmin(admin.id)}
                          className="text-yellow-600 hover:text-yellow-900"
                        >
                          Suspend
                        </button>
                      ) : (
                        <button
                          onClick={() => handleActivateAdmin(admin.id)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Activate
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteAdmin(admin.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Create Admin Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold">Create New Administrator</h2>
            </div>
            <form onSubmit={handleCreateAdmin} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                  <input
                    type="text"
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    value={formFirstName}
                    onChange={(e) => setFormFirstName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                  <input
                    type="text"
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    value={formLastName}
                    onChange={(e) => setFormLastName(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <select
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value as PlatformAdminDto['role'])}
                >
                  {ADMIN_ROLES.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
                <div className="border border-gray-300 rounded-md p-4 max-h-60 overflow-y-auto">
                  {AVAILABLE_PERMISSIONS.map(permission => (
                    <label key={permission} className="flex items-center gap-2 py-2">
                      <input
                        type="checkbox"
                        checked={formPermissions.includes(permission)}
                        onChange={() => togglePermission(permission)}
                        className="rounded"
                      />
                      <span className="text-sm text-gray-700">{permission}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                >
                  Create Admin
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Admin Modal */}
      {showEditModal && selectedAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold">Edit Administrator</h2>
            </div>
            <form onSubmit={handleUpdateAdmin} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                  <input
                    type="text"
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    value={formFirstName}
                    onChange={(e) => setFormFirstName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                  <input
                    type="text"
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    value={formLastName}
                    onChange={(e) => setFormLastName(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <select
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value as PlatformAdminDto['role'])}
                >
                  {ADMIN_ROLES.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
                <div className="border border-gray-300 rounded-md p-4 max-h-60 overflow-y-auto">
                  {AVAILABLE_PERMISSIONS.map(permission => (
                    <label key={permission} className="flex items-center gap-2 py-2">
                      <input
                        type="checkbox"
                        checked={formPermissions.includes(permission)}
                        onChange={() => togglePermission(permission)}
                        className="rounded"
                      />
                      <span className="text-sm text-gray-700">{permission}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                >
                  Update Admin
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Activity Modal */}
      {showActivityModal && selectedAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold">
                Activity Log - {selectedAdmin.firstName} {selectedAdmin.lastName}
              </h2>
              <button
                onClick={() => setShowActivityModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                Close
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {adminActivities.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No activities found</p>
                ) : (
                  adminActivities.map((activity) => (
                    <div key={activity.id} className="border-b border-gray-200 pb-4 last:border-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-sm font-medium text-gray-900">{activity.action}</h3>
                          <p className="text-sm text-gray-600 mt-1">{activity.details}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span>{formatDate(activity.timestamp)}</span>
                            {activity.ipAddress && <span>IP: {activity.ipAddress}</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
