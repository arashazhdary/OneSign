import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getTenantId } from '@/lib/tenant-context';
import { tenantService } from '@/lib/api/services/tenant.service';
import { applicationsService } from '@/lib/api/services';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Key,
  Plus,
  Edit3,
  Trash2,
  X,
  Search,
  CheckCircle,
  XCircle,
  Shield,
  Layers,
  AppWindow,
  FolderTree,
  ToggleLeft,
  ToggleRight,
  Lock,
  Unlock,
  Eye,
} from 'lucide-react';
import Modal from '@/components/common/Modal';

interface Scope {
  id: string;
  name: string;
  description: string;
  value: string;
  type: 'standard' | 'custom';
  groupId?: string;
  permissions: string[];
  applicationCount: number;
  userConsentRequired: boolean;
  isEnabled: boolean;
  createdAt: string;
}

interface ScopeGroup {
  id: string;
  name: string;
  description: string;
  scopes: string[];
}

interface Application {
  id: string;
  name: string;
  scopes: string[];
}

interface StatCardProps {
  title: string;
  value: number | string;
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

const STANDARD_SCOPES = [
  { value: 'openid', name: 'OpenID', description: 'OpenID Connect authentication', permissions: ['profile:basic'] },
  { value: 'profile', name: 'Profile', description: 'Access to user profile', permissions: ['profile:read'] },
  { value: 'email', name: 'Email', description: 'Access to email address', permissions: ['email:read'] },
  { value: 'offline_access', name: 'Offline Access', description: 'Refresh token access', permissions: ['token:refresh'] },
  { value: 'phone', name: 'Phone', description: 'Access to phone number', permissions: ['phone:read'] },
  { value: 'address', name: 'Address', description: 'Access to address', permissions: ['address:read'] },
];

export default function TenantScopesPage() {
  const { t } = useTranslation();
  const [tenantId, setTenantIdState] = useState<string | null>(null);
  const [scopes, setScopes] = useState<Scope[]>([]);
  const [scopeGroups, setScopeGroups] = useState<ScopeGroup[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showApplicationsModal, setShowApplicationsModal] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [editingScope, setEditingScope] = useState<Scope | null>(null);
  const [selectedScopeForApps, setSelectedScopeForApps] = useState<Scope | null>(null);
  const [selectedScopeForPerms, setSelectedScopeForPerms] = useState<Scope | null>(null);
  const [scopeName, setScopeName] = useState('');
  const [scopeDescription, setScopeDescription] = useState('');
  const [scopeValue, setScopeValue] = useState('');
  const [scopeType, setScopeType] = useState<'standard' | 'custom'>('custom');
  const [scopeGroupId, setScopeGroupId] = useState('');
  const [scopePermissions, setScopePermissions] = useState<string[]>([]);
  const [userConsentRequired, setUserConsentRequired] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'standard' | 'custom'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const contextTenantId = getTenantId();
    setTenantIdState(contextTenantId || '00000000-0000-0000-0000-000000000000');
  }, []);

  useEffect(() => {
    if (tenantId) {
      fetchScopes();
      fetchScopeGroups();
      fetchApplications();
    }
  }, [tenantId]);

  const fetchScopes = async () => {
    if (!tenantId) return;
    try {
      const data = await tenantService.getScopes();
      setScopes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching scopes:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchScopeGroups = async () => {
    if (!tenantId) return;
    try {
      setScopeGroups([]);
    } catch (error) {
      console.error('Error fetching scope groups:', error);
    }
  };

  const fetchApplications = async () => {
    if (!tenantId) return;
    try {
      const data = await applicationsService.getApplications({ page: 1, pageSize: 1000 });
      setApplications(data.items || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

  const handleCreateOrUpdateScope = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!tenantId) return;

    const payload = {
      name: scopeName,
      description: scopeDescription,
      value: scopeValue,
      type: scopeType,
      groupId: scopeGroupId || null,
      permissions: scopePermissions,
      userConsentRequired,
    };

    try {
      if (editingScope) {
        await tenantService.updateScope(editingScope.id, payload);
      } else {
        await tenantService.createScope(payload);
      }
      setSuccess(editingScope ? t('tenant.scopes.messages.updated') : t('tenant.scopes.messages.created'));
      setShowCreateModal(false);
      resetForm();
      fetchScopes();
    } catch (error: any) {
      setError(error?.message || t('common.failedToSaveScope'));
      console.error('Error saving scope:', error);
    }
  };

  const handleEditScope = (scope: Scope) => {
    setEditingScope(scope);
    setScopeName(scope.name);
    setScopeDescription(scope.description);
    setScopeValue(scope.value);
    setScopeType(scope.type);
    setScopeGroupId(scope.groupId || '');
    setScopePermissions(scope.permissions);
    setUserConsentRequired(scope.userConsentRequired);
    setShowCreateModal(true);
  };

  const handleDeleteScope = async (scopeId: string) => {
    if (!confirm(t('tenant.scopes.confirmDelete'))) return;

    setError('');
    setSuccess('');

    try {
      await tenantService.deleteScope(scopeId);
      setSuccess(t('tenant.scopes.messages.deleted'));
      fetchScopes();
    } catch (error: any) {
      setError(error?.message || t('common.failedToDeleteScope'));
      console.error('Error deleting scope:', error);
    }
  };

  const handleToggleScopeStatus = async (scope: Scope) => {
    try {
      await tenantService.updateScope(scope.id, { isEnabled: !scope.isEnabled });
      setSuccess(scope.isEnabled ? t('tenant.scopes.messages.disabled') : t('tenant.scopes.messages.enabled'));
      fetchScopes();
    } catch (error: any) {
      setError(error?.message || t('common.failedToUpdateScopeStatus'));
      console.error('Error updating scope status:', error);
    }
  };

  const handleApplyStandardScope = (standard: typeof STANDARD_SCOPES[0]) => {
    setScopeName(standard.name);
    setScopeDescription(standard.description);
    setScopeValue(standard.value);
    setScopeType('standard');
    setScopePermissions(standard.permissions);
  };

  const resetForm = () => {
    setEditingScope(null);
    setScopeName('');
    setScopeDescription('');
    setScopeValue('');
    setScopeType('custom');
    setScopeGroupId('');
    setScopePermissions([]);
    setUserConsentRequired(true);
  };

  const getApplicationsUsingScope = (scopeId: string) => {
    return applications.filter((app) => app.scopes.includes(scopeId));
  };

  const filteredScopes = scopes.filter((scope) => {
    const matchesType = filterType === 'all' || scope.type === filterType;
    const matchesSearch =
      scope.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scope.value.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scope.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  const standardScopesCount = scopes.filter(s => s.type === 'standard').length;
  const customScopesCount = scopes.filter(s => s.type === 'custom').length;
  const enabledScopesCount = scopes.filter(s => s.isEnabled).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      <Helmet>
        <title>{t('scopes.title', 'Scope Management')} | OneSign</title>
      </Helmet>

      <div className="p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
              <Key className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {t('scopes.title', 'Scope Management')}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                {t('scopes.subtitle', 'Define and manage OAuth scopes and permissions')}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowGroupModal(true)}
              className="px-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2 shadow-sm"
            >
              <FolderTree className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <span className="text-gray-700 dark:text-gray-300">{t('scopes.manageGroups', 'Manage Groups')}</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                resetForm();
                setShowCreateModal(true);
              }}
              className="px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all flex items-center gap-2 shadow-lg"
            >
              <Plus className="w-5 h-5" />
              <span>{t('scopes.createScope', 'Create Scope')}</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title={t('scopes.totalScopes', 'Total Scopes')}
            value={scopes.length}
            icon={<Key className="w-6 h-6 text-white" />}
            color="from-indigo-500 to-indigo-600"
            delay={0}
          />
          <StatCard
            title={t('scopes.standardScopes', 'Standard')}
            value={standardScopesCount}
            icon={<Shield className="w-6 h-6 text-white" />}
            color="from-blue-500 to-blue-600"
            delay={1}
          />
          <StatCard
            title={t('scopes.customScopes', 'Custom')}
            value={customScopesCount}
            icon={<Layers className="w-6 h-6 text-white" />}
            color="from-purple-500 to-purple-600"
            delay={2}
          />
          <StatCard
            title={t('scopes.enabledScopes', 'Enabled')}
            value={enabledScopesCount}
            icon={<CheckCircle className="w-6 h-6 text-white" />}
            color="from-green-500 to-green-600"
            delay={3}
          />
        </div>

        {/* Alerts */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl flex items-center gap-3"
            >
              <XCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
              <button onClick={() => setError('')} className="ml-auto">
                <X className="w-5 h-5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-xl flex items-center gap-3"
            >
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <span>{success}</span>
              <button onClick={() => setSuccess('')} className="ml-auto">
                <X className="w-5 h-5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6 flex flex-col md:flex-row gap-4"
        >
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={t('scopes.searchPlaceholder', 'Search scopes...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>
          <div className="flex gap-2">
            {['all', 'standard', 'custom'].map((type) => (
              <motion.button
                key={type}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setFilterType(type as 'all' | 'standard' | 'custom')}
                className={`px-4 py-2.5 rounded-xl font-medium transition-all ${
                  filterType === type
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                    : 'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Scopes Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
              <thead className="bg-gray-50 dark:bg-slate-900/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t('scopes.scopeName', 'Scope Name')}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t('scopes.value', 'Value')}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t('scopes.type', 'Type')}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t('scopes.permissions', 'Permissions')}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t('scopes.applications', 'Applications')}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t('scopes.consent', 'Consent')}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t('scopes.status', 'Status')}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t('common.actions', 'Actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                {filteredScopes.map((scope, index) => (
                  <motion.tr
                    key={scope.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${scope.type === 'standard' ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-purple-100 dark:bg-purple-900/30'}`}>
                          <Key className={`w-4 h-4 ${scope.type === 'standard' ? 'text-blue-600 dark:text-blue-400' : 'text-purple-600 dark:text-purple-400'}`} />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">{scope.name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{scope.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <code className="text-sm bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded text-gray-700 dark:text-gray-300">{scope.value}</code>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full ${
                          scope.type === 'standard'
                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400'
                            : 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400'
                        }`}
                      >
                        {scope.type === 'standard' ? <Shield className="w-3 h-3 mr-1" /> : <Layers className="w-3 h-3 mr-1" />}
                        {scope.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => {
                          setSelectedScopeForPerms(scope);
                          setShowPermissionsModal(true);
                        }}
                        className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        {scope.permissions.length} {t('scopes.permissions', 'permissions')}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => {
                          setSelectedScopeForApps(scope);
                          setShowApplicationsModal(true);
                        }}
                        className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
                      >
                        <AppWindow className="w-4 h-4" />
                        {scope.applicationCount} apps
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 text-sm ${scope.userConsentRequired ? 'text-amber-600 dark:text-amber-400' : 'text-gray-500 dark:text-gray-400'}`}>
                        {scope.userConsentRequired ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                        {scope.userConsentRequired ? t('scopes.required', 'Required') : t('scopes.notRequired', 'Not Required')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleToggleScopeStatus(scope)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full transition-colors ${
                          scope.isEnabled
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-400'
                        }`}
                      >
                        {scope.isEnabled ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                        {scope.isEnabled ? t('common.enabled', 'Enabled') : t('common.disabled', 'Disabled')}
                      </motion.button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleEditScope(scope)}
                          disabled={scope.type === 'standard'}
                          className="p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Edit3 className="w-4 h-4" />
                        </motion.button>
                        {scope.type === 'custom' && (
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleDeleteScope(scope.id)}
                            className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </motion.button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
                {filteredScopes.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                      {t('scopes.noScopes', 'No scopes found')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Create/Edit Scope Modal */}
        <Modal
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            resetForm();
          }}
          title={editingScope ? t('scopes.editScope', 'Edit Scope') : t('scopes.createScope', 'Create New Scope')}
        >
          {!editingScope && (
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
              <h3 className="font-medium text-blue-900 dark:text-blue-300 mb-3">{t('scopes.standardScopes', 'Standard Scopes')}</h3>
              <div className="flex flex-wrap gap-2">
                {STANDARD_SCOPES.map((standard) => (
                  <motion.button
                    key={standard.value}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleApplyStandardScope(standard)}
                    className="px-3 py-1.5 bg-white dark:bg-slate-700 border border-blue-200 dark:border-blue-700 rounded-lg text-sm hover:bg-blue-50 dark:hover:bg-slate-600 transition-colors text-blue-700 dark:text-blue-300"
                  >
                    {standard.name}
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleCreateOrUpdateScope}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('scopes.scopeName', 'Scope Name')}
                </label>
                <input
                  type="text"
                  required
                  value={scopeName}
                  onChange={(e) => setScopeName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('scopes.value', 'Value (Identifier)')}
                </label>
                <input
                  type="text"
                  required
                  value={scopeValue}
                  onChange={(e) => setScopeValue(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="e.g., api.read"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('common.description', 'Description')}
                </label>
                <textarea
                  value={scopeDescription}
                  onChange={(e) => setScopeDescription(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('scopes.type', 'Type')}
                  </label>
                  <select
                    value={scopeType}
                    onChange={(e) => setScopeType(e.target.value as 'standard' | 'custom')}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  >
                    <option value="custom">Custom</option>
                    <option value="standard">Standard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('scopes.group', 'Group (Optional)')}
                  </label>
                  <select
                    value={scopeGroupId}
                    onChange={(e) => setScopeGroupId(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  >
                    <option value="">None</option>
                    {scopeGroups.map((group) => (
                      <option key={group.id} value={group.id}>
                        {group.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('scopes.permissions', 'Permissions')}
                </label>
                <input
                  type="text"
                  value={scopePermissions.join(', ')}
                  onChange={(e) =>
                    setScopePermissions(
                      e.target.value.split(',').map((p) => p.trim()).filter(Boolean)
                    )
                  }
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="permission1, permission2, permission3"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('scopes.commaSeparated', 'Comma-separated list')}</p>
              </div>

              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={userConsentRequired}
                    onChange={(e) => setUserConsentRequired(e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('scopes.requireConsent', 'Require user consent')}
                  </span>
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg"
              >
                {editingScope ? t('common.update', 'Update') : t('common.create', 'Create')}
              </motion.button>
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}
                className="px-4 py-2.5 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors"
              >
                {t('common.cancel', 'Cancel')}
              </motion.button>
            </div>
          </form>
        </Modal>

        {/* Applications Modal */}
        <Modal
          isOpen={showApplicationsModal && !!selectedScopeForApps}
          onClose={() => {
            setShowApplicationsModal(false);
            setSelectedScopeForApps(null);
          }}
          title={t('scopes.applicationsUsing', `Applications using ${selectedScopeForApps?.name}`)}
        >
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {selectedScopeForApps && getApplicationsUsingScope(selectedScopeForApps.id).map((app) => (
              <div key={app.id} className="border border-gray-200 dark:border-slate-700 rounded-xl p-4 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                    <AppWindow className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">{app.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{app.scopes.length} scopes total</p>
                  </div>
                </div>
              </div>
            ))}
            {selectedScopeForApps && getApplicationsUsingScope(selectedScopeForApps.id).length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                {t('scopes.noAppsUsing', 'No applications using this scope')}
              </div>
            )}
          </div>
        </Modal>

        {/* Permissions Modal */}
        <Modal
          isOpen={showPermissionsModal && !!selectedScopeForPerms}
          onClose={() => {
            setShowPermissionsModal(false);
            setSelectedScopeForPerms(null);
          }}
          title={t('scopes.permissionsFor', `Permissions for ${selectedScopeForPerms?.name}`)}
        >
          <div className="space-y-3">
            {selectedScopeForPerms?.permissions.map((perm) => (
              <div key={perm} className="border border-gray-200 dark:border-slate-700 rounded-xl p-4">
                <code className="text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded">{perm}</code>
              </div>
            ))}
            {selectedScopeForPerms?.permissions.length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                {t('scopes.noPermissions', 'No permissions defined')}
              </div>
            )}
          </div>
        </Modal>

        {/* Scope Groups Modal */}
        <Modal
          isOpen={showGroupModal}
          onClose={() => setShowGroupModal(false)}
          title={t('scopes.scopeGroups', 'Scope Groups')}
        >
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {scopeGroups.map((group) => (
              <div key={group.id} className="border border-gray-200 dark:border-slate-700 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <FolderTree className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">{group.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{group.description}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{group.scopes.length} scopes</p>
                  </div>
                </div>
              </div>
            ))}
            {scopeGroups.length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                {t('scopes.noGroups', 'No scope groups defined')}
              </div>
            )}
          </div>
        </Modal>
      </div>
    </div>
  );
}
