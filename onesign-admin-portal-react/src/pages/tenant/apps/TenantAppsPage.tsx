import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useLocale } from '@/hooks/useLocale';
import { getTenantId } from '@/lib/tenant-context';
import { getCurrentUserScope, CurrentUserScopeDto } from '@/lib/api/users';
import { applicationsService } from '@/lib/api/services';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AppWindow,
  Plus,
  Search,
  Globe,
  Smartphone,
  Monitor,
  Key,
  Link2,
  Building2,
  Edit2,
  Trash2,
  X,
  CheckCircle2,
  AlertCircle,
  Shield,
  Settings2,
  ExternalLink
} from 'lucide-react';

interface Application {
  id: string;
  name: string;
  clientId: string;
  applicationType: string;
  redirectUris: Array<{ id: string; uri: string }>;
  clientSecrets?: Array<{ id: string; description: string; createdAt: string }>;
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
  value: number;
  icon: React.ReactNode;
  color: string;
  delay: number;
}

const StatCard = ({ title, value, icon, color, delay }: StatCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: delay * 0.1 }}
    className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300"
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className={`text-3xl font-bold mt-2 ${color}`}>{value}</p>
      </div>
      <div className={`p-4 rounded-xl ${color.replace('text-', 'bg-').replace('600', '100')}`}>
        {icon}
      </div>
    </div>
  </motion.div>
);

export default function TenantAppsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const locale = useLocale();
  const [applications, setApplications] = useState<Application[]>([]);
  const [orgTree, setOrgTree] = useState<OrgUnitTreeNode[]>([]);
  const [selectedOrgUnitId, setSelectedOrgUnitId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignOrgUnitsModal, setShowAssignOrgUnitsModal] = useState(false);
  const [selectedAppForOrgUnits, setSelectedAppForOrgUnits] = useState<Application | null>(null);
  const [selectedOrgUnitIds, setSelectedOrgUnitIds] = useState<string[]>([]);
  const [newAppName, setNewAppName] = useState('');
  const [newAppType, setNewAppType] = useState('Web');
  const [newRedirectUris, setNewRedirectUris] = useState<string[]>(['']);
  const [tenantId, setTenantIdState] = useState<string | null>(null);
  const [editingApp, setEditingApp] = useState<Application | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editAppName, setEditAppName] = useState('');
  const [editAppType, setEditAppType] = useState('Web');
  const [showRedirectUrisModal, setShowRedirectUrisModal] = useState(false);
  const [selectedAppForRedirectUris, setSelectedAppForRedirectUris] = useState<Application | null>(null);
  const [newRedirectUri, setNewRedirectUri] = useState('');
  const [showSecretsModal, setShowSecretsModal] = useState(false);
  const [selectedAppForSecrets, setSelectedAppForSecrets] = useState<Application | null>(null);
  const [newSecretDescription, setNewSecretDescription] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userScope, setUserScope] = useState<CurrentUserScopeDto | null>(null);
  const [scopeLoading, setScopeLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

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

      // Auto-select first rootOrgUnitId for delegated admins
      if (scope && !(scope as any).isGlobalAdmin && (scope as any).rootOrgUnitIds && (scope as any).rootOrgUnitIds.length > 0) {
        setSelectedOrgUnitId((scope as any).rootOrgUnitIds[0]);
      }
    } catch (err) {
      console.error('Error fetching user scope:', err);
    } finally {
      setScopeLoading(false);
    }
  };

  useEffect(() => {
    if (tenantId) {
      fetchApplications();
      fetchOrgTree();
    }
  }, [tenantId, selectedOrgUnitId]);

  const fetchApplications = async () => {
    if (!tenantId) return;

    try {
      const params: any = { tenantId, pageNumber: 1, pageSize: 100 };
      if (selectedOrgUnitId) params.orgUnitId = selectedOrgUnitId;

      const data = await applicationsService.getApplications(params);
      const apps = data.items || [];

      // Fetch details for each app to get redirect URIs
      const appsWithDetails = await Promise.all(
        apps.map(async (app: Application) => {
          try {
            const detailData = await applicationsService.getApplicationById(app.id);
            return {
              ...app,
              redirectUris: detailData.redirectUris || [],
              clientSecrets: detailData.clientSecrets || []
            };
          } catch (error) {
            console.error(`Error fetching details for app ${app.id}:`, error);
            return { ...app, redirectUris: [], clientSecrets: [] };
          }
        })
      );
      setApplications(appsWithDetails);

      // Update selected app if modal is open
      if (selectedAppForRedirectUris) {
        const updatedApp = appsWithDetails.find(a => a.id === selectedAppForRedirectUris.id);
        if (updatedApp) {
          setSelectedAppForRedirectUris(updatedApp);
        }
      }
      if (selectedAppForSecrets) {
        const updatedApp = appsWithDetails.find(a => a.id === selectedAppForSecrets.id);
        if (updatedApp) {
          setSelectedAppForSecrets(updatedApp);
        }
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrgTree = async () => {
    if (!tenantId) return;
    try {
      const data = await applicationsService.getOrgUnitsTree();
      setOrgTree(data || []);
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
    if (!userScope || (userScope as any).isGlobalAdmin) {
      return orgTree;
    }
    // Filter to show only allowed org units
    const allNodes = getAllNodes(orgTree);
    return allNodes.filter(node => (userScope as any).allowedOrgUnitIds && (userScope as any).allowedOrgUnitIds.includes(node.id));
  };

  const handleAssignOrgUnits = async (app: Application) => {
    setSelectedAppForOrgUnits(app);
    try {
      const data = await applicationsService.getApplicationOrgUnits(tenantId, app.id);
      setSelectedOrgUnitIds(data.orgUnitIds || []);
    } catch (error) {
      console.error('Error fetching application org units:', error);
    }
    setShowAssignOrgUnitsModal(true);
  };

  const handleSaveOrgUnits = async () => {
    if (!selectedAppForOrgUnits) return;
    setError('');
    setSuccess('');

    try {
      await applicationsService.assignOrgUnits(tenantId, selectedAppForOrgUnits.id, selectedOrgUnitIds);
      setSuccess(t('tenant.applicationOrgUnits.orgUnitsAssigned'));
      setShowAssignOrgUnitsModal(false);
      setSelectedAppForOrgUnits(null);
      fetchApplications();
    } catch (error: any) {
      setError(error?.message || t('common.error'));
      console.error('Error assigning org units:', error);
    }
  };

  const handleCreateApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!tenantId) return;

    try {
      // Map applicationType string to enum number
      const appTypeMap: Record<string, number> = {
        'Web': 1,
        'Mobile': 2,
        'SPA': 3
      };

      await applicationsService.createApplication({
        name: newAppName,
        applicationType: appTypeMap[newAppType] || 1,
        grantType: 1, // AuthorizationCode
        redirectUris: newRedirectUris.filter(uri => uri.trim() !== '')
      });
      setShowCreateModal(false);
      setNewAppName('');
      setNewAppType('Web');
      setNewRedirectUris(['']);
      setSuccess(t('tenant.applications.applicationCreated'));
      fetchApplications();
    } catch (error: any) {
      setError(error?.message || t('common.error'));
      console.error('Error creating application:', error);
    }
  };

  const handleEditApplication = (app: Application) => {
    setEditingApp(app);
    setEditAppName(app.name);
    // Map applicationType enum to string
    const appTypeMap: Record<string, string> = {
      'Web': 'Web',
      'Mobile': 'Mobile',
      'SPA': 'SPA',
      '1': 'Web',
      '2': 'Mobile',
      '3': 'SPA'
    };
    setEditAppType(appTypeMap[app.applicationType] || 'Web');
    setShowEditModal(true);
  };

  const handleUpdateApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!tenantId || !editingApp) return;

    try {
      // Map applicationType string to enum number
      const appTypeMap: Record<string, number> = {
        'Web': 1,
        'Mobile': 2,
        'SPA': 3
      };

      await applicationsService.updateApplication(editingApp.id, {
        name: editAppName,
        applicationType: appTypeMap[editAppType] || 1
      });
      setShowEditModal(false);
      setEditingApp(null);
      setEditAppName('');
      setEditAppType('Web');
      setSuccess(t('tenant.applications.applicationUpdated'));
      fetchApplications();
    } catch (error: any) {
      setError(error?.message || t('common.error'));
      console.error('Error updating application:', error);
    }
  };

  const handleDeleteApplication = async (appId: string) => {
    if (!confirm(t('tenant.applications.confirmDelete'))) return;
    setError('');
    setSuccess('');
    if (!tenantId) return;

    try {
      await applicationsService.deleteApplication(appId);
      setSuccess(t('tenant.applications.applicationDeleted'));
      fetchApplications();
    } catch (error: any) {
      setError(error?.message || t('common.error'));
      console.error('Error deleting application:', error);
    }
  };

  const handleManageRedirectUris = (app: Application) => {
    setSelectedAppForRedirectUris(app);
    setShowRedirectUrisModal(true);
    setNewRedirectUri('');
  };

  const handleAddRedirectUri = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!tenantId || !selectedAppForRedirectUris) return;

    try {
      await applicationsService.addRedirectUri(tenantId, selectedAppForRedirectUris.id, newRedirectUri);
      setNewRedirectUri('');
      setSuccess(t('tenant.applications.redirectUriAdded'));
      await fetchApplications();
    } catch (error: any) {
      setError(error?.message || t('common.error'));
      console.error('Error adding redirect URI:', error);
    }
  };

  const handleRemoveRedirectUri = async (redirectUriId: string) => {
    if (!confirm(t('tenant.applications.confirmRemoveRedirectUri'))) return;
    setError('');
    setSuccess('');
    if (!tenantId) return;

    try {
      await applicationsService.removeRedirectUri(tenantId, redirectUriId);
      setSuccess(t('tenant.applications.redirectUriRemoved'));
      await fetchApplications();
    } catch (error: any) {
      setError(error?.message || t('common.error'));
      console.error('Error removing redirect URI:', error);
    }
  };

  const handleManageSecrets = (app: Application) => {
    setSelectedAppForSecrets(app);
    setShowSecretsModal(true);
    setNewSecretDescription('');
  };

  const handleAddSecret = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!tenantId || !selectedAppForSecrets) return;

    try {
      await applicationsService.addClientSecret(tenantId, selectedAppForSecrets.id, newSecretDescription);
      setNewSecretDescription('');
      setSuccess(t('tenant.applications.secretAdded') || 'Client secret added successfully');
      await fetchApplications();
    } catch (error: any) {
      setError(error?.message || t('common.error'));
      console.error('Error adding client secret:', error);
    }
  };

  const handleRemoveSecret = async (secretId: string) => {
    if (!confirm(t('tenant.applications.confirmRemoveSecret') || 'Are you sure you want to delete this client secret? Applications using this secret will stop working.')) return;
    setError('');
    setSuccess('');
    if (!tenantId) return;

    try {
      await applicationsService.removeClientSecret(tenantId, secretId);
      setSuccess(t('tenant.applications.secretRemoved') || 'Client secret deleted successfully');
      await fetchApplications();
    } catch (error: any) {
      setError(error?.message || t('common.error'));
      console.error('Error removing client secret:', error);
    }
  };

  const getAppTypeIcon = (type: string) => {
    switch (type) {
      case 'Web':
      case '1':
        return <Globe className="w-5 h-5 text-blue-600" />;
      case 'Mobile':
      case '2':
        return <Smartphone className="w-5 h-5 text-green-600" />;
      case 'SPA':
      case '3':
        return <Monitor className="w-5 h-5 text-purple-600" />;
      default:
        return <AppWindow className="w-5 h-5 text-gray-600" />;
    }
  };

  const getAppTypeBadge = (type: string) => {
    const typeMap: Record<string, { label: string; color: string }> = {
      'Web': { label: t('tenant.applications.web'), color: 'bg-blue-100 text-blue-700' },
      '1': { label: t('tenant.applications.web'), color: 'bg-blue-100 text-blue-700' },
      'Mobile': { label: t('tenant.applications.mobile'), color: 'bg-green-100 text-green-700' },
      '2': { label: t('tenant.applications.mobile'), color: 'bg-green-100 text-green-700' },
      'SPA': { label: t('tenant.applications.spa'), color: 'bg-purple-100 text-purple-700' },
      '3': { label: t('tenant.applications.spa'), color: 'bg-purple-100 text-purple-700' }
    };
    const { label, color } = typeMap[type] || { label: type, color: 'bg-gray-100 text-gray-700' };
    return <span className={`px-3 py-1 rounded-full text-xs font-medium ${color}`}>{label}</span>;
  };

  // Calculate stats
  const webApps = applications.filter(a => a.applicationType === 'Web' || a.applicationType === '1').length;
  const mobileApps = applications.filter(a => a.applicationType === 'Mobile' || a.applicationType === '2').length;
  const spaApps = applications.filter(a => a.applicationType === 'SPA' || a.applicationType === '3').length;

  // Filter applications by search
  const filteredApps = applications.filter(app =>
    app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.clientId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading || scopeLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-500 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8" dir={locale === 'fa' ? 'rtl' : 'ltr'}>
      <Helmet>
        <title>{t('tenant.applications.title')}</title>
      </Helmet>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8"
      >
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            {t('tenant.applications.title')}
          </h1>
          <p className="text-gray-600 mt-2">{t('tenant.applications.subtitle') || 'Manage your OAuth applications and API clients'}</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <Plus className="w-5 h-5" />
          {t('tenant.applications.createApplication')}
        </motion.button>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard
          title={t('tenant.applications.totalApps') || 'Total Applications'}
          value={applications.length}
          icon={<AppWindow className="w-6 h-6 text-indigo-600" />}
          color="text-indigo-600"
          delay={0}
        />
        <StatCard
          title={t('tenant.applications.webApps') || 'Web Applications'}
          value={webApps}
          icon={<Globe className="w-6 h-6 text-blue-600" />}
          color="text-blue-600"
          delay={1}
        />
        <StatCard
          title={t('tenant.applications.mobileApps') || 'Mobile Apps'}
          value={mobileApps}
          icon={<Smartphone className="w-6 h-6 text-green-600" />}
          color="text-green-600"
          delay={2}
        />
        <StatCard
          title={t('tenant.applications.spaApps') || 'SPA Applications'}
          value={spaApps}
          icon={<Monitor className="w-6 h-6 text-purple-600" />}
          color="text-purple-600"
          delay={3}
        />
      </div>

      {/* Filters Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-6 mb-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder={t('tenant.applications.searchPlaceholder') || 'Search by name or client ID...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
            />
          </div>

          {/* Org Unit Filter */}
          <div>
            <select
              value={selectedOrgUnitId}
              onChange={(e) => {
                setSelectedOrgUnitId(e.target.value);
                setLoading(true);
              }}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
            >
              {(!userScope || (userScope as any).isGlobalAdmin) && <option value="">{t('common.all')} - {t('tenant.orgUnits.title')}</option>}
              {getFilteredOrgTree().map(node => (
                <option key={node.id} value={node.id}>{node.name}</option>
              ))}
            </select>
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
            className="mb-6 bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
            <button onClick={() => setError('')} className="ml-auto">
              <X className="w-5 h-5" />
            </button>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-xl flex items-center gap-3"
          >
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span>{success}</span>
            <button onClick={() => setSuccess('')} className="ml-auto">
              <X className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Applications Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-6 py-4 text-start text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  {t('tenant.applications.applicationName')}
                </th>
                <th className="px-6 py-4 text-start text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  {t('tenant.applications.clientId')}
                </th>
                <th className="px-6 py-4 text-start text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  {t('tenant.applications.applicationType')}
                </th>
                <th className="px-6 py-4 text-start text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  {t('tenant.applications.redirectUris') || 'Redirect URIs'}
                </th>
                <th className="px-6 py-4 text-start text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  {t('common.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filteredApps.map((app, index) => (
                <motion.tr
                  key={app.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-50/80 transition-colors duration-150"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-gray-100">
                        {getAppTypeIcon(app.applicationType)}
                      </div>
                      <div>
                        <button
                          type="button"
                          onClick={() => navigate(`/tenant/apps/${app.id}`)}
                          className="font-medium text-gray-900 hover:text-indigo-600 text-start"
                        >
                          {app.name}
                        </button>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <code className="text-sm bg-gray-100 px-3 py-1 rounded-lg font-mono text-gray-600">
                      {app.clientId}
                    </code>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getAppTypeBadge(app.applicationType)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-600">
                      {app.redirectUris?.length || 0} {t('tenant.applications.uris') || 'URIs'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigate(`/tenant/apps/${app.id}`)}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title={t('common.view')}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEditApplication(app)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title={t('common.edit')}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleAssignOrgUnits(app)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title={t('tenant.applicationOrgUnits.selectOrgUnits')}
                      >
                        <Building2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleManageRedirectUris(app)}
                        className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                        title={t('tenant.applications.manageRedirectUris')}
                      >
                        <Link2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleManageSecrets(app)}
                        className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                        title={t('tenant.applications.manageSecrets') || 'Manage Secrets'}
                      >
                        <Key className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteApplication(app.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title={t('common.delete')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
              {filteredApps.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <AppWindow className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">{t('tenant.applications.noApps') || 'No applications found'}</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Create Application Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-indigo-100 rounded-xl">
                  <Plus className="w-6 h-6 text-indigo-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">{t('tenant.applications.createApplication')}</h2>
              </div>

              <form onSubmit={handleCreateApplication}>
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('tenant.applications.applicationName')}</label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                      value={newAppName}
                      onChange={(e) => setNewAppName(e.target.value)}
                      placeholder={t('tenant.applications.namePlaceholder') || 'Enter application name'}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('tenant.applications.applicationType')}</label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: 'Web', icon: Globe, label: t('tenant.applications.web'), color: 'blue' },
                        { value: 'Mobile', icon: Smartphone, label: t('tenant.applications.mobile'), color: 'green' },
                        { value: 'SPA', icon: Monitor, label: t('tenant.applications.spa'), color: 'purple' }
                      ].map(({ value, icon: Icon, label, color }) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setNewAppType(value)}
                          className={`p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2
                            ${newAppType === value
                              ? `border-${color}-500 bg-${color}-50 text-${color}-700`
                              : 'border-gray-200 hover:border-gray-300 text-gray-600'}`}
                        >
                          <Icon className="w-6 h-6" />
                          <span className="text-sm font-medium">{label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('tenant.applications.redirectUris')}</label>
                    {newRedirectUris.map((uri, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                          placeholder="https://example.com/callback"
                          value={uri}
                          onChange={(e) => {
                            const updated = [...newRedirectUris];
                            updated[index] = e.target.value;
                            setNewRedirectUris(updated);
                          }}
                        />
                        {index > 0 && (
                          <button
                            type="button"
                            onClick={() => setNewRedirectUris(newRedirectUris.filter((_, i) => i !== index))}
                            className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => setNewRedirectUris([...newRedirectUris, ''])}
                      className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1 mt-2"
                    >
                      <Plus className="w-4 h-4" />
                      {t('tenant.applications.addRedirectUri')}
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 mt-8">
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    {t('common.create')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-6 py-3 border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-all duration-200"
                  >
                    {t('common.cancel')}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Application Modal */}
      <AnimatePresence>
        {showEditModal && editingApp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => { setShowEditModal(false); setEditingApp(null); }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Edit2 className="w-6 h-6 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">{t('tenant.applications.editApplication')}</h2>
              </div>

              <form onSubmit={handleUpdateApplication}>
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('tenant.applications.applicationName')}</label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                      value={editAppName}
                      onChange={(e) => setEditAppName(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('tenant.applications.applicationType')}</label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: 'Web', icon: Globe, label: t('tenant.applications.web'), color: 'blue' },
                        { value: 'Mobile', icon: Smartphone, label: t('tenant.applications.mobile'), color: 'green' },
                        { value: 'SPA', icon: Monitor, label: t('tenant.applications.spa'), color: 'purple' }
                      ].map(({ value, icon: Icon, label, color }) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setEditAppType(value)}
                          className={`p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2
                            ${editAppType === value
                              ? `border-${color}-500 bg-${color}-50 text-${color}-700`
                              : 'border-gray-200 hover:border-gray-300 text-gray-600'}`}
                        >
                          <Icon className="w-6 h-6" />
                          <span className="text-sm font-medium">{label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-8">
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    {t('common.save')}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowEditModal(false); setEditingApp(null); }}
                    className="px-6 py-3 border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-all duration-200"
                  >
                    {t('common.cancel')}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Redirect URIs Modal */}
      <AnimatePresence>
        {showRedirectUrisModal && selectedAppForRedirectUris && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => { setShowRedirectUrisModal(false); setSelectedAppForRedirectUris(null); setError(''); setSuccess(''); }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-purple-100 rounded-xl">
                  <Link2 className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{t('tenant.applications.manageRedirectUris')}</h2>
                  <p className="text-gray-500">{selectedAppForRedirectUris.name}</p>
                </div>
              </div>

              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  {error}
                </div>
              )}

              {success && (
                <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                  {success}
                </div>
              )}

              <form onSubmit={handleAddRedirectUri} className="mb-6">
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    placeholder="https://example.com/callback"
                    value={newRedirectUri}
                    onChange={(e) => setNewRedirectUri(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    {t('tenant.applications.addRedirectUri')}
                  </button>
                </div>
              </form>

              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">{t('tenant.applications.redirectUris')}</h3>
                {selectedAppForRedirectUris.redirectUris && selectedAppForRedirectUris.redirectUris.length > 0 ? (
                  <div className="space-y-2">
                    {selectedAppForRedirectUris.redirectUris.map((uri) => (
                      <div key={uri.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <div className="flex items-center gap-3">
                          <ExternalLink className="w-4 h-4 text-gray-400" />
                          <code className="text-sm text-gray-700">{uri.uri}</code>
                        </div>
                        <button
                          onClick={() => handleRemoveRedirectUri(uri.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm text-center py-8">{t('tenant.applications.noRedirectUris')}</p>
                )}
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => { setShowRedirectUrisModal(false); setSelectedAppForRedirectUris(null); setError(''); setSuccess(''); }}
                  className="px-6 py-3 border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-all duration-200"
                >
                  {t('common.close')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Manage Secrets Modal */}
      <AnimatePresence>
        {showSecretsModal && selectedAppForSecrets && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => { setShowSecretsModal(false); setSelectedAppForSecrets(null); setError(''); setSuccess(''); }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-amber-100 rounded-xl">
                  <Key className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{t('tenant.applications.manageSecrets') || 'Manage Client Secrets'}</h2>
                  <p className="text-gray-500">{selectedAppForSecrets.name}</p>
                </div>
              </div>

              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  {error}
                </div>
              )}

              {success && (
                <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                  {success}
                </div>
              )}

              <form onSubmit={handleAddSecret} className="mb-6">
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                    placeholder={t('tenant.applications.secretDescriptionPlaceholder') || 'Secret description (e.g., Production, Development)'}
                    value={newSecretDescription}
                    onChange={(e) => setNewSecretDescription(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    {t('tenant.applications.addSecret') || 'Add Secret'}
                  </button>
                </div>
              </form>

              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">{t('tenant.applications.clientSecrets') || 'Client Secrets'}</h3>
                {selectedAppForSecrets.clientSecrets && selectedAppForSecrets.clientSecrets.length > 0 ? (
                  <div className="space-y-2">
                    {selectedAppForSecrets.clientSecrets.map((secret) => (
                      <div key={secret.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <div className="flex items-center gap-3">
                          <Shield className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="font-medium text-gray-900">{secret.description}</p>
                            <p className="text-xs text-gray-500">
                              {t('common.created')}: {new Date(secret.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveSecret(secret.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm text-center py-8">
                    {t('tenant.applications.noSecrets') || 'No client secrets. Add one to enable authentication.'}
                  </p>
                )}
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => { setShowSecretsModal(false); setSelectedAppForSecrets(null); setError(''); setSuccess(''); }}
                  className="px-6 py-3 border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-all duration-200"
                >
                  {t('common.close')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Assign OrgUnits Modal */}
      <AnimatePresence>
        {showAssignOrgUnitsModal && selectedAppForOrgUnits && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => { setShowAssignOrgUnitsModal(false); setSelectedAppForOrgUnits(null); setError(''); setSuccess(''); }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-green-100 rounded-xl">
                  <Building2 className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{t('tenant.applicationOrgUnits.selectOrgUnits')}</h2>
                  <p className="text-gray-500">{selectedAppForOrgUnits.name}</p>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('tenant.applicationOrgUnits.orgVisibility')}</label>
                <select
                  multiple
                  value={selectedOrgUnitIds}
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions, option => option.value);
                    setSelectedOrgUnitIds(selected);
                  }}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  size={8}
                >
                  {getFilteredOrgTree().map(node => (
                    <option key={node.id} value={node.id}>{node.name}</option>
                  ))}
                </select>
                <p className="text-sm text-gray-500 mt-2">{t('common.holdCtrl') || 'Hold Ctrl/Cmd to select multiple'}</p>
              </div>

              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  {error}
                </div>
              )}

              {success && (
                <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                  {success}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={handleSaveOrgUnits}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {t('common.save')}
                </button>
                <button
                  onClick={() => { setShowAssignOrgUnitsModal(false); setSelectedAppForOrgUnits(null); setError(''); setSuccess(''); }}
                  className="px-6 py-3 border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-all duration-200"
                >
                  {t('common.cancel')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
