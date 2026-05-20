import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { rolesService } from '@/lib/api/services/roles.service';
import { auditService } from '@/lib/api/services';
import { getTenantId } from '@/lib/tenant-context';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import { Helmet } from 'react-helmet-async';
import {
  Shield,
  ArrowLeft,
  Edit,
  Trash2,
  Users,
  Key,
  History,
  FileText,
  CheckCircle,
  XCircle,
  RefreshCw,
  Plus,
  Check,
  X,
  AlertTriangle,
} from 'lucide-react';

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

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  delay: number;
}

const StatCard = ({ title, value, icon, color, delay }: StatCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: delay * 0.1 }}
    className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6 hover:shadow-xl transition-all duration-300"
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
      </div>
      <div className={`p-4 rounded-xl bg-gradient-to-br ${color}`}>
        {icon}
      </div>
    </div>
  </motion.div>
);

export default function TenantRolesDetailPage() {
  const { t } = useTranslation();
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

  const tabs = [
    { key: 'overview', label: 'Overview', icon: FileText },
    { key: 'permissions', label: 'Permissions', icon: Key },
    { key: 'users', label: 'Users', icon: Users },
    { key: 'audit', label: 'Audit Log', icon: History },
  ];

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
      const result = await rolesService.getRoleById(id);
      if (!result) {
        setNotFound(true);
        return;
      }

      const permList: Permission[] = (result.permissions ?? []).map((p: string | Permission) =>
        typeof p === 'string'
          ? { id: p, resource: p.split(':')[0] ?? p, action: p.split(':')[1] ?? '', description: p }
          : p,
      );

      const roleData: RoleDetails = {
        id: result.id,
        name: result.name,
        description: result.description || '',
        type: result.isSystem ? 'system' : 'custom',
        isBuiltIn: result.isSystem,
        scope: 'tenant',
        permissions: permList,
        userCount: result.userCount ?? 0,
        createdAt: result.createdAt ?? '',
        updatedAt: result.updatedAt ?? '',
      };

      setRole(roleData);
      setEditName(roleData.name);
      setEditDescription(roleData.description);
      setSelectedPermissions(permList.map((p) => p.id));

      await Promise.all([fetchUsers(), fetchAuditLogs(), fetchAvailablePermissions()]);
    } catch (err: any) {
      console.error('Error fetching role:', err);
      setError(err.message || t('common.error'));
      if (err.response?.status === 404) {
        setNotFound(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    const data = await rolesService.getRoleUsers(id);
    const items = data?.items ?? data ?? [];
    setUsers(
      items.map((u: { id: string; name?: string; email?: string; assignedAt?: string }) => ({
        id: u.id,
        name: u.name ?? u.email ?? u.id,
        email: u.email ?? '',
        assignedAt: u.assignedAt ?? '',
      })),
    );
  };

  const fetchAuditLogs = async () => {
    const logs = await auditService.getAuditLogs({
      page: 1,
      pageSize: 20,
      resourceType: 'Role',
      search: id,
    });
    const items = logs?.data ?? [];
    setAuditLogs(
      items.map((log: { id: string; action?: string; userId?: string; timestamp?: string; description?: string }) => ({
        id: log.id,
        action: log.action ?? 'Update',
        performedBy: log.userId ?? '—',
        timestamp: log.timestamp ?? '',
        details: log.description ?? '',
      })),
    );
  };

  const fetchAvailablePermissions = async () => {
    setAvailablePermissions(await rolesService.getPermissions());
  };

  const handleUpdateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId || !role) return;

    setError('');
    setSuccess('');

    try {
      await rolesService.updateRole(id, {
        name: editName,
        description: editDescription,
      });

      setSuccess(t('tenant.roles.messages.updated'));
      setShowEditModal(false);
      fetchData();
    } catch (err: any) {
      setError(err?.message || t('tenant.roles.messages.failedToUpdate'));
    }
  };

  const handleUpdatePermissions = async () => {
    if (!tenantId || !role) return;

    setError('');
    setSuccess('');

    try {
      await rolesService.updateRole(id, {
        permissions: selectedPermissions,
      });

      setSuccess(t('tenant.roles.messages.permissionsUpdated'));
      setShowPermissionModal(false);
      fetchData();
    } catch (err: any) {
      setError(err?.message || t('tenant.roles.messages.failedToUpdatePermissions'));
    }
  };

  const handleDeleteRole = async () => {
    if (!tenantId) return;

    setError('');
    setSuccess('');

    try {
      await rolesService.deleteRole(id);
      setSuccess(t('tenant.roles.messages.deleted'));
      setTimeout(() => {
        navigate('/tenant/roles');
      }, 1500);
    } catch (err: any) {
      setError(err?.message || t('tenant.roles.messages.failedToDelete'));
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-teal-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 p-8 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-3 text-gray-600 dark:text-gray-400"
        >
          <RefreshCw className="w-6 h-6 animate-spin" />
          <span>{t('tenant.roles.loading')}</span>
        </motion.div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-teal-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('tenant.roles.notFound.title')}</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{t('tenant.roles.notFound.description')}</p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/tenant/roles')}
            className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-teal-600 text-white rounded-xl hover:from-cyan-600 hover:to-teal-700 transition-all"
          >
            {t('tenant.roles.buttons.backToRoles')}
          </motion.button>
        </motion.div>
      </div>
    );
  }

  if (!role) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-teal-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      <Helmet>
        <title>{role.name} - Role Details | OneSign</title>
      </Helmet>

      <div className="p-8 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-4"
        >
          <Breadcrumbs className="mb-2" />

          <motion.button
            onClick={() => navigate(-1)}
            whileHover={{ x: -4 }}
            className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 hover:text-cyan-800 dark:hover:text-cyan-300 transition-colors w-fit"
          >
            <ArrowLeft className="w-5 h-5" />
            {t('tenant.roles.buttons.backToRoles')}
          </motion.button>

          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-600 shadow-lg">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent">
                  {role.name}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">{role.description}</p>
              </div>
            </div>
            <div className="flex gap-2">
              {!role.isBuiltIn && (
                <>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowEditModal(true)}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors text-gray-700 dark:text-gray-300"
                  >
                    <Edit className="w-4 h-4" />
                    {t('tenant.roles.buttons.edit')}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl hover:from-red-600 hover:to-rose-700 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                    {t('common.delete')}
                  </motion.button>
                </>
              )}
            </div>
          </div>
        </motion.div>

        {/* Alerts */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl flex items-center gap-2"
            >
              <XCircle className="w-5 h-5" />
              {error}
            </motion.div>
          )}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-xl flex items-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              {success}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-2"
        >
          <nav className="flex space-x-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`relative flex items-center gap-2 py-3 px-4 rounded-lg font-medium transition-all ${
                  activeTab === tab.key
                    ? 'text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700'
                }`}
              >
                {activeTab === tab.key && (
                  <motion.div
                    layoutId="activeRoleTab"
                    className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-teal-600 rounded-lg"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <tab.icon className="w-4 h-4 relative z-10" />
                <span className="relative z-10">{tab.label}</span>
              </button>
            ))}
          </nav>
        </motion.div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {/* Role Info Card */}
              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Role Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-500 dark:text-gray-400">Role ID</label>
                    <p className="font-mono text-sm text-gray-900 dark:text-white">{role.id}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 dark:text-gray-400">Type</label>
                    <p>
                      <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                        role.type === 'system' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400'
                      }`}>
                        {role.type}
                      </span>
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 dark:text-gray-400">Scope</label>
                    <p className="capitalize text-gray-900 dark:text-white">{role.scope}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 dark:text-gray-400">Built-in</label>
                    <p className="text-gray-900 dark:text-white">{role.isBuiltIn ? 'Yes' : 'No'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 dark:text-gray-400">Created</label>
                    <p className="text-sm text-gray-900 dark:text-white">{formatDate(role.createdAt)}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 dark:text-gray-400">Last Updated</label>
                    <p className="text-sm text-gray-900 dark:text-white">{formatDate(role.updatedAt)}</p>
                  </div>
                </div>
              </div>

              {/* Statistics Card */}
              <div className="space-y-6">
                <StatCard
                  title="Total Permissions"
                  value={role.permissions.length}
                  icon={<Key className="w-6 h-6 text-white" />}
                  color="from-cyan-500 to-teal-500"
                  delay={0}
                />
                <StatCard
                  title="Assigned Users"
                  value={users.length}
                  icon={<Users className="w-6 h-6 text-white" />}
                  color="from-purple-500 to-pink-500"
                  delay={1}
                />
              </div>
            </motion.div>
          )}

          {activeTab === 'permissions' && (
            <motion.div
              key="permissions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700"
            >
              <div className="p-6 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Permissions ({role.permissions.length})</h2>
                {!role.isBuiltIn && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowPermissionModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-teal-600 text-white rounded-xl hover:from-cyan-600 hover:to-teal-700 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    Manage Permissions
                  </motion.button>
                )}
              </div>
              <div className="p-6">
                {role.permissions.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-8">No permissions assigned</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                      <thead>
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Resource</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Action</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Description</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                        {role.permissions.map((perm, index) => (
                          <motion.tr
                            key={perm.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="font-medium text-gray-900 dark:text-white">{perm.resource}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-slate-700 rounded-lg text-gray-700 dark:text-gray-300">{perm.action}</span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{perm.description}</td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'users' && (
            <motion.div
              key="users"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700"
            >
              <div className="p-6 border-b border-gray-200 dark:border-slate-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Assigned Users ({users.length})</h2>
              </div>
              <div className="p-6">
                {users.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-8">No users assigned to this role</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                      <thead>
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Name</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Email</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Assigned At</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                        {users.map((user, index) => (
                          <motion.tr
                            key={user.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="font-medium text-gray-900 dark:text-white">{user.name}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{user.email}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {formatDate(user.assignedAt)}
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'audit' && (
            <motion.div
              key="audit"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700"
            >
              <div className="p-6 border-b border-gray-200 dark:border-slate-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Activity Log</h2>
              </div>
              <div className="p-6">
                {auditLogs.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-8">No activity recorded</p>
                ) : (
                  <div className="space-y-4">
                    {auditLogs.map((log, index) => (
                      <motion.div
                        key={log.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="border-l-4 border-cyan-500 pl-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-700/50 rounded-r-lg transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{log.action}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{log.details}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              by {log.performedBy} at {formatDate(log.timestamp)}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Edit Role Modal */}
      <AnimatePresence>
        {showEditModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-slate-800 p-6 rounded-2xl max-w-md w-full mx-4 shadow-2xl"
            >
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Edit Role</h2>
              <form onSubmit={handleUpdateRole}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role Name</label>
                    <input
                      type="text"
                      required
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                    <textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500"
                      rows={3}
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-6">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-teal-600 text-white rounded-xl hover:from-cyan-600 hover:to-teal-700 transition-all"
                  >
                    Save Changes
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    Cancel
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Manage Permissions Modal */}
      <AnimatePresence>
        {showPermissionModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-slate-800 p-6 rounded-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Manage Permissions</h2>
              <div className="border border-gray-200 dark:border-slate-700 rounded-xl p-4 max-h-96 overflow-y-auto mb-4">
                {Object.entries(getResourceGroups()).map(([resource, perms]) => (
                  <div key={resource} className="mb-4">
                    <h3 className="font-medium text-sm text-gray-900 dark:text-white mb-2">{resource}</h3>
                    <div className="space-y-2 ml-4">
                      {perms.map((perm) => (
                        <label key={perm.id} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedPermissions.includes(perm.id)}
                            onChange={() => togglePermission(perm.id)}
                            className="rounded border-gray-300 dark:border-slate-600 text-cyan-500 focus:ring-cyan-500"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {perm.action} - {perm.description}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                {selectedPermissions.length} permissions selected
              </div>
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleUpdatePermissions}
                  className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-teal-600 text-white rounded-xl hover:from-cyan-600 hover:to-teal-700 transition-all"
                >
                  Save Permissions
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowPermissionModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-slate-800 p-6 rounded-2xl max-w-md w-full mx-4 shadow-2xl"
            >
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Delete Role</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Are you sure you want to delete this role? This action cannot be undone.
              </p>
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleDeleteRole}
                  className="px-4 py-2 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl hover:from-red-600 hover:to-rose-700 transition-all"
                >
                  Delete
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
