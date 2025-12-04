import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import {
  Users,
  UserPlus,
  UserCheck,
  UserX,
  Shield,
  Search,
  Filter,
  MoreVertical,
  Mail,
  Calendar,
  Building2,
  RefreshCw,
  X,
  Check,
  AlertCircle
} from 'lucide-react';
import { useLocale } from '@/hooks/useLocale';
import { getTenantId } from '@/lib/tenant-context';
import { usersService } from '@/lib/api/services/users.service';
import { tenantService, TenantUserDto } from '@/lib/api/services/tenant.service';
import { getCurrentUserScope, CurrentUserScopeDto } from '@/lib/api/users';

interface OrgUnitTreeNode {
  id: string;
  parentId: string | null;
  name: string;
  code?: string;
  level: number;
  status: number;
  children: OrgUnitTreeNode[];
}

// Stat Card Component
const StatCard = ({ title, value, icon, color, delay = 0 }: {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'red' | 'purple' | 'orange';
  delay?: number;
}) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    red: 'bg-red-100 text-red-600',
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

export default function TenantUsersPage() {
  const { t } = useTranslation();
  const locale = useLocale();
  const [users, setUsers] = useState<TenantUserDto[]>([]);
  const [orgTree, setOrgTree] = useState<OrgUnitTreeNode[]>([]);
  const [selectedOrgUnitId, setSelectedOrgUnitId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showAssignOrgUnitsModal, setShowAssignOrgUnitsModal] = useState(false);
  const [selectedUserForOrgUnits, setSelectedUserForOrgUnits] = useState<TenantUserDto | null>(null);
  const [primaryOrgUnitId, setPrimaryOrgUnitId] = useState<string>('');
  const [secondaryOrgUnitIds, setSecondaryOrgUnitIds] = useState<string[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteIsAdmin, setInviteIsAdmin] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [tenantId, setTenantIdState] = useState<string | null>(null);
  const [userScope, setUserScope] = useState<CurrentUserScopeDto | null>(null);
  const [scopeLoading, setScopeLoading] = useState(true);

  useEffect(() => {
    const contextTenantId = getTenantId();
    if (contextTenantId) {
      setTenantIdState(contextTenantId);
    } else {
      setTenantIdState('00000000-0000-0000-0000-000000000000');
    }
  }, []);

  useEffect(() => {
    if (tenantId) {
      fetchUserScope(tenantId);
    }
  }, [tenantId]);

  const fetchUserScope = async (tid: string) => {
    try {
      setScopeLoading(true);
      const scope = await getCurrentUserScope();
      setUserScope(scope);
      const orgUnitIds = scope?.allowedOrgUnitIds || scope?.rootOrgUnitIds || [];
      if (orgUnitIds.length > 0) {
        setSelectedOrgUnitId(orgUnitIds[0]);
      }
    } catch (err) {
      console.error('Error fetching user scope:', err);
    } finally {
      setScopeLoading(false);
    }
  };

  useEffect(() => {
    if (tenantId) {
      fetchUsers();
      fetchOrgTree();
    }
  }, [tenantId, selectedOrgUnitId]);

  const fetchUsers = async (isRefresh = false) => {
    if (!tenantId) return;

    if (isRefresh) setRefreshing(true);

    try {
      const data = await tenantService.getUsers(1, 100, selectedOrgUnitId || '');
      setUsers(data.items || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchOrgTree = async () => {
    if (!tenantId) return;
    try {
      const data = await tenantService.getOrgUnitsTree();
      setOrgTree(data);
    } catch (error) {
      console.error('Error fetching org tree:', error);
    }
  };

  const getAllNodes = (nodes: OrgUnitTreeNode[]): OrgUnitTreeNode[] => {
    const result: OrgUnitTreeNode[] = [];
    nodes.forEach(node => {
      result.push(node);
      if (node.children) {
        result.push(...getAllNodes(node.children));
      }
    });
    return result;
  };

  const getFilteredOrgTree = (): OrgUnitTreeNode[] => {
    if (!userScope) {
      return orgTree;
    }
    const isAdmin = userScope.isGlobalAdmin;
    if (isAdmin) {
      return orgTree;
    }
    const allowedOrgUnitIds = userScope.allowedOrgUnitIds || [];
    const allNodes = getAllNodes(orgTree);
    return allNodes.filter(node => allowedOrgUnitIds.includes(node.id));
  };

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!tenantId) return;

    try {
      await usersService.inviteUser({
        email: inviteEmail,
        isAdmin: inviteIsAdmin,
      });

      setShowInviteModal(false);
      setInviteEmail('');
      setInviteIsAdmin(false);
      setSuccess(t('tenant.users.invited'));
      fetchUsers();
    } catch (error: any) {
      setError(error?.message || t('common.error'));
      console.error('Error inviting user:', error);
    }
  };

  const handleDisableUser = async (userId: string) => {
    if (!confirm(t('tenant.users.confirmDisable'))) return;
    setError('');
    setSuccess('');
    if (!tenantId) return;

    try {
      await usersService.updateUserStatus(userId, 3);
      setSuccess(t('tenant.users.userDisabled'));
      fetchUsers();
    } catch (error: any) {
      setError(error?.message || t('common.error'));
      console.error('Error disabling user:', error);
    }
  };

  const handleAssignOrgUnits = async (user: TenantUserDto) => {
    setSelectedUserForOrgUnits(user);
    try {
      const data = await usersService.getUserOrgUnits(user.id);
      if (Array.isArray(data)) {
        setSecondaryOrgUnitIds(data);
      } else {
        setPrimaryOrgUnitId((data as any)?.primaryOrgUnitId || '');
        setSecondaryOrgUnitIds((data as any)?.secondaryOrgUnitIds || []);
      }
    } catch (error) {
      console.error('Error fetching user org units:', error);
    }
    setShowAssignOrgUnitsModal(true);
  };

  const handleSaveOrgUnits = async () => {
    if (!selectedUserForOrgUnits || !primaryOrgUnitId) return;
    setError('');
    setSuccess('');

    try {
      const allOrgUnitIds = [primaryOrgUnitId, ...secondaryOrgUnitIds];
      await usersService.updateUserOrgUnits(selectedUserForOrgUnits.id, allOrgUnitIds);
      setSuccess(t('tenant.userOrgUnits.orgUnitsAssigned'));
      setShowAssignOrgUnitsModal(false);
      setSelectedUserForOrgUnits(null);
      fetchUsers();
    } catch (error: any) {
      setError(error?.message || t('common.error'));
      console.error('Error assigning org units:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower === 'active') {
      return 'bg-green-100 text-green-800 border-green-200';
    } else if (statusLower === 'suspended') {
      return 'bg-red-100 text-red-800 border-red-200';
    } else if (statusLower === 'pending') {
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const filteredUsers = users.filter(user =>
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.lastName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate stats
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status?.toLowerCase() === 'active').length;
  const suspendedUsers = users.filter(u => u.status?.toLowerCase() === 'suspended').length;
  const adminUsers = users.filter(u => u.roles?.includes('admin')).length;

  if (loading || scopeLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-500 border-t-transparent"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Users className="w-6 h-6 text-indigo-500" />
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
        <title>{t('tenant.users.title')} | OneSign</title>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8" dir={locale === 'fa' ? 'rtl' : 'ltr'}>
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"
              >
                {t('tenant.users.title')}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="text-gray-600 mt-2"
              >
                {t('tenant.users.subtitle')}
              </motion.p>
            </div>
            <div className="flex gap-3">
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => fetchUsers(true)}
                disabled={refreshing}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-white transition-all duration-200 flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                {t('common.refresh')}
              </motion.button>
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowInviteModal(true)}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium flex items-center gap-2"
              >
                <UserPlus className="w-5 h-5" />
                {t('tenant.users.inviteUser')}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Error & Success Messages */}
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title={t('tenant.users.totalUsers')}
            value={totalUsers}
            icon={<Users className="w-6 h-6" />}
            color="blue"
            delay={0}
          />
          <StatCard
            title={t('tenant.users.activeUsers')}
            value={activeUsers}
            icon={<UserCheck className="w-6 h-6" />}
            color="green"
            delay={1}
          />
          <StatCard
            title={t('tenant.users.suspendedUsers')}
            value={suspendedUsers}
            icon={<UserX className="w-6 h-6" />}
            color="red"
            delay={2}
          />
          <StatCard
            title={t('tenant.users.adminUsers')}
            value={adminUsers}
            icon={<Shield className="w-6 h-6" />}
            color="purple"
            delay={3}
          />
        </div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-4 mb-6"
        >
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder={t('common.search')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-gray-400" />
              <select
                value={selectedOrgUnitId}
                onChange={(e) => {
                  setSelectedOrgUnitId(e.target.value);
                  setLoading(true);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                {(!userScope || userScope.isGlobalAdmin) && <option value="">{t('common.all')}</option>}
                {getFilteredOrgTree().map(node => (
                  <option key={node.id} value={node.id}>{node.name}</option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        {/* Users Table */}
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
                    {t('tenant.users.user')}
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('tenant.users.email')}
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('tenant.users.status')}
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('tenant.users.role')}
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('tenant.users.lastLogin')}
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('tenant.users.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user, idx) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                          {user.firstName?.[0] || user.email?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {user.id?.slice(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-gray-900">
                        <Mail className="w-4 h-4 text-gray-400" />
                        {user.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(user.status || '')}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.roles?.includes('admin') ? (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
                          {t('tenant.users.admin')}
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 border border-gray-200">
                          {t('tenant.users.user')}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString('fa-IR') : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAssignOrgUnits(user)}
                          className="px-3 py-1 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors font-medium"
                        >
                          {t('tenant.userOrgUnits.assignOrgUnits')}
                        </button>
                        {user.status !== t('common.disabled') && (
                          <button
                            onClick={() => handleDisableUser(user.id)}
                            className="px-3 py-1 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors font-medium"
                          >
                            {t('tenant.users.disable')}
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>{t('tenant.users.noUsers')}</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Invite User Modal */}
        {showInviteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">{t('tenant.users.inviteUser')}</h2>
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleInviteUser}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('tenant.users.email')}</label>
                    <input
                      type="email"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="user@example.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        checked={inviteIsAdmin}
                        onChange={(e) => setInviteIsAdmin(e.target.checked)}
                      />
                      <span className="text-sm font-medium text-gray-700">{t('tenant.users.isAdmin')}</span>
                    </label>
                  </div>
                </div>
                <div className="flex gap-3 mt-8">
                  <button
                    type="button"
                    onClick={() => setShowInviteModal(false)}
                    className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 font-medium transition-all"
                  >
                    {t('common.create')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Assign OrgUnits Modal */}
        {showAssignOrgUnitsModal && selectedUserForOrgUnits && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{t('tenant.userOrgUnits.assignOrgUnits')}</h2>
                  <p className="text-sm text-gray-500 mt-1">{selectedUserForOrgUnits.email}</p>
                </div>
                <button
                  onClick={() => {
                    setShowAssignOrgUnitsModal(false);
                    setSelectedUserForOrgUnits(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('tenant.userOrgUnits.primaryOrgUnit')}
                  </label>
                  <select
                    value={primaryOrgUnitId}
                    onChange={(e) => setPrimaryOrgUnitId(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  >
                    <option value="">{t('tenant.delegatedAdmins.selectOrgUnit')}</option>
                    {getFilteredOrgTree().map(node => (
                      <option key={node.id} value={node.id}>{node.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('tenant.userOrgUnits.secondaryOrgUnits')}
                  </label>
                  <select
                    multiple
                    value={secondaryOrgUnitIds}
                    onChange={(e) => {
                      const selected = Array.from(e.target.selectedOptions, option => option.value);
                      setSecondaryOrgUnitIds(selected);
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    size={5}
                  >
                    {getFilteredOrgTree()
                      .filter(node => node.id !== primaryOrgUnitId)
                      .map(node => (
                        <option key={node.id} value={node.id}>{node.name}</option>
                      ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">{t('common.holdCtrl')}</p>
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => {
                    setShowAssignOrgUnitsModal(false);
                    setSelectedUserForOrgUnits(null);
                  }}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={handleSaveOrgUnits}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 font-medium transition-all"
                >
                  {t('common.save')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </>
  );
}
