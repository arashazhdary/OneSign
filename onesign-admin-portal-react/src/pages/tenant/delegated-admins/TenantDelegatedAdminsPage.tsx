import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useLocale } from '@/hooks/useLocale';
import { getTenantId } from '@/lib/tenant-context';
import { getCurrentUserScope, CurrentUserScopeDto } from '@/lib/api/users';
import { tenantService } from '@/lib/api/services/tenant.service';
import { usersService } from '@/lib/api/services/users.service';
import { Helmet } from 'react-helmet-async';
import Modal from '@/components/common/Modal';
import {
  UserCog,
  Users,
  Building2,
  Shield,
  Plus,
  Trash2,
  AlertTriangle,
  Network,
  ChevronRight,
  CheckCircle,
} from 'lucide-react';

interface DelegatedAdmin {
  id: string;
  tenantUserId: string;
  userEmail?: string;
  userDisplayName?: string;
  orgUnitId: string;
  orgUnitName: string;
  scopeType: number;
  createdAt: string;
}

interface OrgUnitTreeNode {
  id: string;
  parentId: string | null;
  name: string;
  code?: string;
  level: number;
  status: number;
  children: OrgUnitTreeNode[];
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

export default function TenantDelegatedAdminsPage() {
  const { t } = useTranslation();
  const locale = useLocale();
  const [delegatedAdmins, setDelegatedAdmins] = useState<DelegatedAdmin[]>([]);
  const [orgTree, setOrgTree] = useState<OrgUnitTreeNode[]>([]);
  const [tenantUsers, setTenantUsers] = useState<Array<{ id: string; email: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedOrgUnitId, setSelectedOrgUnitId] = useState('');
  const [selectedScopeType, setSelectedScopeType] = useState<number>(2);
  const [tenantId, setTenantId] = useState<string>('');
  const [userScope, setUserScope] = useState<CurrentUserScopeDto | null>(null);
  const [scopeLoading, setScopeLoading] = useState(true);

  useEffect(() => {
    const tid = getTenantId();
    if (tid) {
      setTenantId(tid);
      loadData(tid);
      fetchUserScope(tid);
    } else {
      setTenantId('00000000-0000-0000-0000-000000000000');
      loadData('00000000-0000-0000-0000-000000000000');
      fetchUserScope('00000000-0000-0000-0000-000000000000');
    }
  }, []);

  const fetchUserScope = async (tid: string) => {
    try {
      setScopeLoading(true);
      const scope = await getCurrentUserScope();
      setUserScope(scope);
    } catch (err) {
      console.error('Error fetching user scope:', err);
    } finally {
      setScopeLoading(false);
    }
  };

  const loadData = async (tid: string) => {
    try {
      setLoading(true);
      const [admins, tree, usersData] = await Promise.all([
        tenantService.getDelegatedAdmins(),
        tenantService.getOrgUnitsTree(),
        usersService.getUsers({ tenantId: tid, pageSize: 1000 })
      ]);

      setDelegatedAdmins(admins);
      setOrgTree(tree);

      const adminUsers = usersData.items?.filter((u: any) => u.isAdmin) || [];
      setTenantUsers(adminUsers.map((u: any) => ({ id: u.id, email: u.email })));
    } catch (err) {
      setError(t('common.error'));
    } finally {
      setLoading(false);
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

  const handleCreate = async () => {
    try {
      await tenantService.createDelegatedAdmin({
        tenantUserId: selectedUserId,
        orgUnitId: selectedOrgUnitId,
        scopeType: selectedScopeType
      });

      setShowCreateModal(false);
      setSelectedUserId('');
      setSelectedOrgUnitId('');
      setSelectedScopeType(2);
      loadData(tenantId);
    } catch (err: any) {
      setError(err.message || t('common.error'));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('tenant.delegatedAdmins.confirmRemove'))) return;
    try {
      await tenantService.deleteDelegatedAdmin(id);
      loadData(tenantId);
    } catch (err: any) {
      setError(err.message || t('common.error'));
    }
  };

  const getUniqueOrgUnits = () => {
    const uniqueUnits = new Set(delegatedAdmins.map(a => a.orgUnitId));
    return uniqueUnits.size;
  };

  if (loading || scopeLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (userScope && !(userScope as any).isGlobalAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl p-8 max-w-md text-center"
        >
          <div className="w-16 h-16 mx-auto mb-4 bg-yellow-100 dark:bg-yellow-800/30 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
          </div>
          <h2 className="text-xl font-bold text-yellow-800 dark:text-yellow-200 mb-2">Access Restricted</h2>
          <p className="text-yellow-700 dark:text-yellow-300">Only global administrators can manage delegated admins.</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      <Helmet>
        <title>{t('tenant.delegatedAdmins.title')} - OneSign</title>
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between mb-8"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
              <UserCog className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('tenant.delegatedAdmins.title')}</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">Manage organizational unit administrators</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setSelectedUserId('');
              setSelectedOrgUnitId('');
              setSelectedScopeType(2);
              setShowCreateModal(true);
            }}
            className="mt-4 md:mt-0 flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Plus className="w-5 h-5" />
            <span>{t('tenant.delegatedAdmins.createDelegatedAdmin')}</span>
          </motion.button>
        </motion.div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl flex items-center space-x-3"
            >
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
              <span className="text-red-700 dark:text-red-300">{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Total Delegated Admins"
            value={delegatedAdmins.length}
            icon={<Users className="w-6 h-6 text-white" />}
            color="from-blue-500 to-indigo-600"
            delay={0}
          />
          <StatCard
            title="Org Units with Admins"
            value={getUniqueOrgUnits()}
            icon={<Building2 className="w-6 h-6 text-white" />}
            color="from-purple-500 to-violet-600"
            delay={1}
          />
          <StatCard
            title="Full Scope Admins"
            value={delegatedAdmins.filter(a => a.scopeType === 2).length}
            icon={<Network className="w-6 h-6 text-white" />}
            color="from-green-500 to-emerald-600"
            delay={2}
          />
        </div>

        {/* Delegated Admins Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 overflow-hidden"
        >
          <div className="p-6 border-b border-gray-200 dark:border-slate-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Delegated Administrators</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-slate-700/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t('tenant.delegatedAdmins.user')}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t('tenant.delegatedAdmins.orgUnit')}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t('tenant.delegatedAdmins.scopeType')}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t('common.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                {delegatedAdmins.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <UserCog className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
                        <p className="text-gray-500 dark:text-gray-400">No delegated administrators configured</p>
                        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Create one to delegate admin access to specific org units</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  delegatedAdmins.map((admin, idx) => (
                    <motion.tr
                      key={admin.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + idx * 0.05 }}
                      className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                            {(admin.userEmail || admin.userDisplayName || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {admin.userDisplayName || admin.userEmail || admin.tenantUserId}
                            </p>
                            {admin.userDisplayName && admin.userEmail && (
                              <p className="text-sm text-gray-500 dark:text-gray-400">{admin.userEmail}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <Building2 className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-900 dark:text-white">{admin.orgUnitName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center space-x-1 px-3 py-1 text-xs font-medium rounded-full ${
                          admin.scopeType === 2
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                            : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                        }`}>
                          {admin.scopeType === 2 ? (
                            <>
                              <Network className="w-3 h-3" />
                              <span>{t('tenant.delegatedAdmins.orgAndDescendants')}</span>
                            </>
                          ) : (
                            <>
                              <Building2 className="w-3 h-3" />
                              <span>{t('tenant.delegatedAdmins.orgOnly')}</span>
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleDelete(admin.id)}
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </motion.button>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-6"
        >
          <div className="flex items-start space-x-4">
            <div className="p-2 bg-blue-100 dark:bg-blue-800/30 rounded-lg">
              <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-100">About Delegated Administration</h3>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                Delegated administrators can manage users and resources within their assigned organizational units.
                Choose "Org Only" to limit access to a single unit, or "Org and Descendants" to include all child units.
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Create Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title={t('tenant.delegatedAdmins.createDelegatedAdmin')}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('tenant.delegatedAdmins.user')}
            </label>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">{t('tenant.delegatedAdmins.selectUser')}</option>
              {tenantUsers.map(user => (
                <option key={user.id} value={user.id}>{user.email}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('tenant.delegatedAdmins.orgUnit')}
            </label>
            <select
              value={selectedOrgUnitId}
              onChange={(e) => setSelectedOrgUnitId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">{t('tenant.delegatedAdmins.selectOrgUnit')}</option>
              {getAllNodes(orgTree).map(node => (
                <option key={node.id} value={node.id}>
                  {'—'.repeat(node.level)} {node.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('tenant.delegatedAdmins.scopeType')}
            </label>
            <div className="space-y-2">
              <label className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${
                selectedScopeType === 1
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700/30'
              }`}>
                <input
                  type="radio"
                  name="scopeType"
                  value={1}
                  checked={selectedScopeType === 1}
                  onChange={() => setSelectedScopeType(1)}
                  className="sr-only"
                />
                <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                  selectedScopeType === 1 ? 'border-blue-500 bg-blue-500' : 'border-gray-300 dark:border-slate-500'
                }`}>
                  {selectedScopeType === 1 && <CheckCircle className="w-3 h-3 text-white" />}
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{t('tenant.delegatedAdmins.orgOnly')}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Admin can only manage the selected org unit</p>
                </div>
              </label>

              <label className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${
                selectedScopeType === 2
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700/30'
              }`}>
                <input
                  type="radio"
                  name="scopeType"
                  value={2}
                  checked={selectedScopeType === 2}
                  onChange={() => setSelectedScopeType(2)}
                  className="sr-only"
                />
                <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                  selectedScopeType === 2 ? 'border-blue-500 bg-blue-500' : 'border-gray-300 dark:border-slate-500'
                }`}>
                  {selectedScopeType === 2 && <CheckCircle className="w-3 h-3 text-white" />}
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{t('tenant.delegatedAdmins.orgAndDescendants')}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Admin can manage the org unit and all child units</p>
                </div>
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowCreateModal(false)}
              className="px-4 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
            >
              {t('common.cancel')}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCreate}
              disabled={!selectedUserId || !selectedOrgUnitId}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('common.create')}
            </motion.button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
