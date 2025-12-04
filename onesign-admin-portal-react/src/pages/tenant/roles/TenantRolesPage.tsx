import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import {
  Shield,
  Plus,
  Copy,
  Users,
  Settings,
  Layers,
  Grid3X3,
  RefreshCw,
  Search,
  Edit2,
  Trash2,
  UserPlus,
  X,
  Check,
  AlertCircle,
  Lock,
  FileText,
  Eye,
  ChevronRight
} from 'lucide-react';
import { getTenantId } from '@/lib/tenant-context';
import { rolesService } from '@/lib/api/services/roles.service';

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

// Stat Card Component
const StatCard = ({ title, value, icon, color, delay = 0 }: {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'purple' | 'orange';
  delay?: number;
}) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay * 0.1 }}
      className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow duration-200"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value.toLocaleString('fa-IR')}</p>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </motion.div>
  );
};

export default function TenantRolesPage() {
  const { t } = useTranslation();
  const [tenantId, setTenantIdState] = useState<string | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
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

  const fetchRoles = async (isRefresh = false) => {
    if (!tenantId) return;
    if (isRefresh) setRefreshing(true);

    try {
      const data = await rolesService.getRoles();
      setRoles((data.items || []) as any);
    } catch (error) {
      console.error('Error fetching roles:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
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
      parentRoleId: parentRoleId || undefined,
    };

    try {
      if (editingRole) {
        await rolesService.updateRole(editingRole.id, payload as any);
      } else {
        await rolesService.createRole(payload as any);
      }
      setSuccess(editingRole ? t('tenant.roles.roleUpdated') : t('tenant.roles.roleCreated'));
      setShowCreateModal(false);
      resetForm();
      fetchRoles();
    } catch (error: any) {
      setError(error?.message || t('common.failedToSaveRole'));
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
    if (!confirm(t('tenant.roles.confirmDelete'))) return;

    setError('');
    setSuccess('');

    try {
      await rolesService.deleteRole(roleId);
      setSuccess(t('tenant.roles.roleDeleted'));
      fetchRoles();
    } catch (error: any) {
      setError(error?.message || t('common.failedToDeleteRole'));
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

  // Calculate stats
  const totalRoles = roles.length;
  const systemRoles = roles.filter(r => r.isSystem).length;
  const customRoles = roles.filter(r => !r.isSystem).length;
  const totalPermissions = new Set(roles.flatMap(r => r.permissions)).size;

  const buildRoleHierarchy = (roleId?: string, level: number = 0): JSX.Element[] => {
    const childRoles = roles.filter((r) => r.parentRoleId === roleId);
    return childRoles.map((role) => (
      <motion.div
        key={role.id}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <div
          className="flex items-center gap-2 p-3 hover:bg-gray-50 rounded-lg transition-colors"
          style={{ marginRight: level * 24 }}
        >
          {level > 0 && <ChevronRight className="w-4 h-4 text-gray-400" />}
          <div className="flex items-center gap-3 flex-1">
            <div className={`p-2 rounded-lg ${role.isSystem ? 'bg-purple-100' : 'bg-blue-100'}`}>
              <Shield className={`w-4 h-4 ${role.isSystem ? 'text-purple-600' : 'text-blue-600'}`} />
            </div>
            <div>
              <span className="font-medium text-gray-900">{role.name}</span>
              <span className="text-sm text-gray-500 mr-2">({role.userCount} {t('tenant.roles.users')})</span>
            </div>
          </div>
        </div>
        {buildRoleHierarchy(role.id, level + 1)}
      </motion.div>
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-500 border-t-transparent"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Shield className="w-6 h-6 text-indigo-500" />
            </div>
          </div>
          <p className="text-gray-600 font-medium">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{t('tenant.roles.title')} | OneSign</title>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8" dir="rtl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"
              >
                {t('tenant.roles.title')}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="text-gray-600 mt-2"
              >
                {t('tenant.roles.subtitle')}
              </motion.p>
            </div>
            <div className="flex gap-3">
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.02 }}
                onClick={() => fetchRoles(true)}
                disabled={refreshing}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-white transition-all flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              </motion.button>
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.02 }}
                onClick={() => setShowTemplateModal(true)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-white transition-all flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                {t('tenant.roles.templates')}
              </motion.button>
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.02 }}
                onClick={() => setShowHierarchyView(true)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-white transition-all flex items-center gap-2"
              >
                <Layers className="w-4 h-4" />
                {t('tenant.roles.hierarchy')}
              </motion.button>
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.02 }}
                onClick={() => setShowPermissionMatrix(true)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-white transition-all flex items-center gap-2"
              >
                <Grid3X3 className="w-4 h-4" />
                {t('tenant.roles.matrix')}
              </motion.button>
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  resetForm();
                  setShowCreateModal(true);
                }}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl font-medium flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                {t('tenant.roles.createRole')}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg shadow-sm flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5" />
            {error}
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-lg shadow-sm flex items-center gap-3"
          >
            <Check className="w-5 h-5" />
            {success}
          </motion.div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title={t('tenant.roles.totalRoles')}
            value={totalRoles}
            icon={<Shield className="w-6 h-6" />}
            color="blue"
            delay={0}
          />
          <StatCard
            title={t('tenant.roles.systemRoles')}
            value={systemRoles}
            icon={<Lock className="w-6 h-6" />}
            color="purple"
            delay={1}
          />
          <StatCard
            title={t('tenant.roles.customRoles')}
            value={customRoles}
            icon={<Settings className="w-6 h-6" />}
            color="green"
            delay={2}
          />
          <StatCard
            title={t('tenant.roles.totalPermissions')}
            value={totalPermissions}
            icon={<Eye className="w-6 h-6" />}
            color="orange"
            delay={3}
          />
        </div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-4 mb-6"
        >
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={t('tenant.roles.searchRoles')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </motion.div>

        {/* Roles Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('tenant.roles.roleName')}
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('tenant.roles.description')}
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('tenant.roles.permissions')}
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('tenant.roles.users')}
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('tenant.roles.type')}
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('common.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRoles.map((role, idx) => (
                  <motion.tr
                    key={role.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${role.isSystem ? 'bg-purple-100' : 'bg-blue-100'}`}>
                          <Shield className={`w-5 h-5 ${role.isSystem ? 'text-purple-600' : 'text-blue-600'}`} />
                        </div>
                        <span className="font-semibold text-gray-900">{role.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{role.description}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium">
                        {role.permissions.length} {t('tenant.roles.permission')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-900">{role.userCount}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                        role.isSystem
                          ? 'bg-purple-100 text-purple-800 border-purple-200'
                          : 'bg-blue-100 text-blue-800 border-blue-200'
                      }`}>
                        {role.isSystem ? t('tenant.roles.system') : t('tenant.roles.custom')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditRole(role)}
                          disabled={role.isSystem}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                          title={t('common.edit')}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleCloneRole(role)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title={t('tenant.roles.clone')}
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedRoleForUsers(role);
                            setShowAssignUsersModal(true);
                          }}
                          className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          title={t('tenant.roles.assignUsers')}
                        >
                          <UserPlus className="w-4 h-4" />
                        </button>
                        {!role.isSystem && (
                          <button
                            onClick={() => handleDeleteRole(role.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title={t('common.delete')}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
                {filteredRoles.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      <Shield className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>{t('tenant.roles.noRoles')}</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Create/Edit Role Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl shadow-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto mx-4"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingRole ? t('tenant.roles.editRole') : t('tenant.roles.createNewRole')}
                </h2>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateOrUpdateRole}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('tenant.roles.roleName')}
                    </label>
                    <input
                      type="text"
                      required
                      value={roleName}
                      onChange={(e) => setRoleName(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('tenant.roles.description')}
                    </label>
                    <textarea
                      value={roleDescription}
                      onChange={(e) => setRoleDescription(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      rows={2}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('tenant.roles.parentRole')}
                    </label>
                    <select
                      value={parentRoleId}
                      onChange={(e) => setParentRoleId(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="">{t('common.none')}</option>
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('tenant.roles.permissions')}
                    </label>
                    <div className="border border-gray-200 rounded-lg p-4 max-h-64 overflow-y-auto bg-gray-50">
                      {Object.entries(getResourceGroups()).map(([resource, perms]) => (
                        <div key={resource} className="mb-4 last:mb-0">
                          <h3 className="font-semibold text-sm text-gray-900 mb-2">{resource}</h3>
                          <div className="space-y-2 mr-4">
                            {perms.map((perm) => (
                              <label key={perm.id} className="flex items-center gap-3 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={selectedPermissions.includes(perm.id)}
                                  onChange={() => togglePermission(perm.id)}
                                  className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <span className="text-sm text-gray-700">
                                  {perm.action} - {perm.description}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      {selectedPermissions.length} {t('tenant.roles.permissionsSelected')}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 mt-8">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      resetForm();
                    }}
                    className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 font-medium transition-all"
                  >
                    {editingRole ? t('common.update') : t('common.create')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Permission Matrix Modal */}
        {showPermissionMatrix && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl shadow-2xl p-8 max-w-6xl w-full max-h-[90vh] overflow-auto mx-4"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">{t('tenant.roles.permissionMatrix')}</h2>
                <button
                  onClick={() => setShowPermissionMatrix(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-200 rounded-lg">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-200 px-4 py-3 text-right text-sm font-medium text-gray-700">
                        {t('tenant.roles.resourceAction')}
                      </th>
                      {roles.map((role) => (
                        <th key={role.id} className="border border-gray-200 px-4 py-3 text-center text-sm font-medium text-gray-700">
                          {role.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {AVAILABLE_PERMISSIONS.map((perm) => (
                      <tr key={perm.id} className="hover:bg-gray-50">
                        <td className="border border-gray-200 px-4 py-3">
                          <div className="font-medium text-gray-900">{perm.resource}</div>
                          <div className="text-sm text-gray-500">{perm.action}</div>
                        </td>
                        {roles.map((role) => (
                          <td key={role.id} className="border border-gray-200 px-4 py-3 text-center">
                            {role.permissions.includes(perm.id) ? (
                              <Check className="w-5 h-5 text-green-600 mx-auto" />
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
            </motion.div>
          </div>
        )}

        {/* Templates Modal */}
        {showTemplateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl shadow-2xl p-8 max-w-2xl w-full mx-4"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">{t('tenant.roles.roleTemplates')}</h2>
                <button
                  onClick={() => setShowTemplateModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-3">
                {ROLE_TEMPLATES.map((template) => (
                  <motion.div
                    key={template.id}
                    whileHover={{ scale: 1.01 }}
                    className="border border-gray-200 rounded-xl p-4 hover:bg-gray-50 cursor-pointer transition-all hover:border-indigo-300"
                    onClick={() => handleApplyTemplate(template)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-100 rounded-lg">
                        <FileText className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{template.name}</h3>
                        <p className="text-sm text-gray-600">{template.description}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {template.permissions.length} {t('tenant.roles.permissions')}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        )}

        {/* Hierarchy Modal */}
        {showHierarchyView && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl shadow-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto mx-4"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">{t('tenant.roles.roleHierarchy')}</h2>
                <button
                  onClick={() => setShowHierarchyView(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-1">{buildRoleHierarchy()}</div>
              {roles.length === 0 && (
                <p className="text-center text-gray-500 py-8">{t('tenant.roles.noRoles')}</p>
              )}
            </motion.div>
          </div>
        )}

        {/* Assign Users Modal */}
        {showAssignUsersModal && selectedRoleForUsers && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {t('tenant.roles.assignUsersTo')} {selectedRoleForUsers.name}
                </h2>
                <button
                  onClick={() => {
                    setShowAssignUsersModal(false);
                    setSelectedRoleForUsers(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">
                    {t('tenant.roles.currentUsers')}: {selectedRoleForUsers.userCount}
                  </span>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-6">
                {t('tenant.roles.assignUsersDescription')}
              </p>

              <button
                onClick={() => {
                  setShowAssignUsersModal(false);
                  setSelectedRoleForUsers(null);
                }}
                className="w-full px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                {t('common.close')}
              </button>
            </motion.div>
          </div>
        )}
      </div>
    </>
  );
}
