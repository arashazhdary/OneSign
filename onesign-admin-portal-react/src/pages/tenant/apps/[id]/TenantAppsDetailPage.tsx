import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getTenantId } from '@/lib/tenant-context';
import Modal from '@/components/common/Modal';
import StatusBadge from '@/components/common/StatusBadge';
import { applicationsService } from '@/lib/api/services/applications.service';
import { tenantService } from '@/lib/api/services/tenant.service';
import type { Application } from '@/lib/api/types/applications';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AppWindow,
  Link2,
  Key,
  Shield,
  Building2,
  FileText,
  BarChart3,
  Edit,
  Plus,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Clock,
  Users,
  Activity,
  ExternalLink
} from 'lucide-react';

// Types for additional data
interface RedirectURI {
  id: string;
  uri: string;
  type: 'web' | 'mobile' | 'desktop';
  createdAt: string;
}

interface ClientSecret {
  id: string;
  name: string;
  hint: string;
  createdAt: string;
  expiresAt?: string;
  lastUsedAt?: string;
}

interface Permission {
  id: string;
  scope: string;
  description: string;
  isGranted: boolean;
  grantedAt?: string;
}

interface OrgUnitAssignment {
  id: string;
  orgUnitId: string;
  orgUnitName: string;
  orgUnitPath: string;
  assignedAt: string;
  assignedByUserId: string;
}

interface AuditLogEntry {
  id: string;
  action: string;
  actorId: string;
  actorName: string;
  changes: Record<string, any>;
  timestamp: string;
  ipAddress: string;
}

type Tab = 'overview' | 'redirect-uris' | 'client-secrets' | 'permissions' | 'org-units' | 'audit-log' | 'usage-stats';

const tabsData = [
  { key: 'overview', labelKey: 'common.overview', icon: <AppWindow className="w-4 h-4" /> },
  { key: 'redirect-uris', labelKey: 'common.redirectUris', icon: <Link2 className="w-4 h-4" /> },
  { key: 'client-secrets', labelKey: 'common.secrets', icon: <Key className="w-4 h-4" /> },
  { key: 'permissions', labelKey: 'common.permissions', icon: <Shield className="w-4 h-4" /> },
  { key: 'org-units', labelKey: 'common.orgUnits', icon: <Building2 className="w-4 h-4" /> },
  { key: 'audit-log', labelKey: 'common.audit', icon: <FileText className="w-4 h-4" /> },
  { key: 'usage-stats', labelKey: 'common.usage', icon: <BarChart3 className="w-4 h-4" /> },
];

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

export default function TenantAppsDetailPage() {
  const params = useParams();
  const applicationId = params.id as string;
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Data states
  const [application, setApplication] = useState<Application | null>(null);
  const [redirectURIs, setRedirectURIs] = useState<RedirectURI[]>([]);
  const [clientSecrets, setClientSecrets] = useState<ClientSecret[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [orgUnits, setOrgUnits] = useState<OrgUnitAssignment[]>([]);
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);
  const [usageStats, setUsageStats] = useState<any>(null);

  // Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddURIModal, setShowAddURIModal] = useState(false);
  const [showAddSecretModal, setShowAddSecretModal] = useState(false);
  const [showGeneratedSecret, setShowGeneratedSecret] = useState('');

  // Form states
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    category: '',
    url: '',
  });
  const [newURI, setNewURI] = useState({ uri: '', type: 'web' as 'web' | 'mobile' | 'desktop' });
  const [newSecretName, setNewSecretName] = useState('');

  const tenantId = getTenantId();

  useEffect(() => {
    fetchApplication();
  }, [applicationId]);

  useEffect(() => {
    if (activeTab === 'redirect-uris' && redirectURIs.length === 0) {
      fetchRedirectURIs();
    } else if (activeTab === 'client-secrets' && clientSecrets.length === 0) {
      fetchClientSecrets();
    } else if (activeTab === 'permissions' && permissions.length === 0) {
      fetchPermissions();
    } else if (activeTab === 'org-units' && orgUnits.length === 0) {
      fetchOrgUnits();
    } else if (activeTab === 'audit-log' && auditLog.length === 0) {
      fetchAuditLog();
    } else if (activeTab === 'usage-stats' && !usageStats) {
      fetchUsageStats();
    }
  }, [activeTab]);

  const fetchApplication = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await applicationsService.getApplicationById(applicationId);
      if (!data) {
        setError(t('applications.notFound') || 'Application not found');
        return;
      }
      setApplication(data as any);
      setEditForm({
        name: data?.name || '',
        description: (data as any)?.description || '',
        category: (data as any)?.category || '',
        url: (data as any)?.url || '',
      });
    } catch (err: any) {
      setError(err.message || t('common.failedToFetchApplication'));
    } finally {
      setLoading(false);
    }
  };

  const fetchRedirectURIs = async () => {
    try {
      const app = await applicationsService.getApplicationById(applicationId);
      if (!app) return;
      const uris: RedirectURI[] = (app?.redirectUris || []).map((uri: any) => ({
        id: uri.id,
        uri: uri.uri,
        type: 'web' as 'web' | 'mobile' | 'desktop',
        createdAt: new Date().toISOString(),
      }));
      setRedirectURIs(uris);
    } catch (err) {
      console.error('Failed to fetch redirect URIs:', err);
    }
  };

  const fetchClientSecrets = async () => {
    try {
      const app = await applicationsService.getApplicationById(applicationId);
      if (!app) return;
      const secrets: ClientSecret[] = (app?.clientSecrets || []).map((secret: any) => ({
        id: secret.id,
        name: secret.description || 'Client Secret',
        hint: '***' + (secret.id?.slice(-4) || '****'),
        createdAt: secret.createdAt || new Date().toISOString(),
        expiresAt: undefined,
        lastUsedAt: undefined,
      }));
      setClientSecrets(secrets);
    } catch (err) {
      console.error('Failed to fetch client secrets:', err);
    }
  };

  const fetchPermissions = async () => {
    try {
      const data = await tenantService.getAvailablePermissions();
      setPermissions(
        (data || []).map((p: any, i: number) => ({
          id: p.id || String(i),
          scope: p.scope || p.name || '',
          description: p.description || '',
          isGranted: p.isGranted ?? false,
          grantedAt: p.grantedAt,
        }))
      );
    } catch (err) {
      console.error('Failed to fetch permissions:', err);
      setPermissions([]);
    }
  };

  const fetchOrgUnits = async () => {
    try {
      const data = await applicationsService.getApplicationOrgUnits(tenantId, applicationId);
      const orgUnitAssignments: OrgUnitAssignment[] = (data?.orgUnitIds || []).map((ouId: string) => ({
        id: ouId,
        orgUnitId: ouId,
        orgUnitName: `Org Unit ${ouId.slice(0, 8)}`,
        orgUnitPath: `/root/org-unit-${ouId.slice(0, 8)}`,
        assignedAt: new Date().toISOString(),
        assignedByUserId: 'system',
      }));
      setOrgUnits(orgUnitAssignments);
    } catch (err) {
      console.error('Failed to fetch org units:', err);
    }
  };

  const fetchAuditLog = async () => {
    try {
      const data = await tenantService.getAuditLogs({
        page: 1,
        pageSize: 50,
        resource: applicationId,
      });
      setAuditLog(
        (data.items || []).map((e: any) => ({
          id: e.id,
          action: e.action || e.eventType || '',
          actorId: e.userId || e.actorId,
          actorName: e.userName || e.actorName,
          changes: e.changes || e.details,
          timestamp: e.timestamp || e.createdAt,
          ipAddress: e.ipAddress,
        }))
      );
    } catch (err) {
      console.error('Failed to fetch audit log:', err);
      setAuditLog([]);
    }
  };

  const fetchUsageStats = async () => {
    try {
      setUsageStats(null);
    } catch (err) {
      console.error('Failed to fetch usage stats:', err);
      setUsageStats(null);
    }
  };

  const handleUpdateApplication = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await applicationsService.updateApplication(tenantId, applicationId, editForm);
      setSuccess(t('common.applicationUpdatedSuccessfully'));
      setShowEditModal(false);
      fetchApplication();
    } catch (err: any) {
      setError(err.message || t('common.failedToUpdateApplication'));
    } finally {
      setSaving(false);
    }
  };

  const handleAddRedirectURI = async () => {
    setSaving(true);
    setError('');
    try {
      await applicationsService.addRedirectUri(tenantId, applicationId, newURI.uri);
      setSuccess(t('common.redirectUriAddedSuccessfully'));
      setShowAddURIModal(false);
      setNewURI({ uri: '', type: 'web' });
      fetchRedirectURIs();
    } catch (err: any) {
      setError(err.message || t('common.failedToAddRedirectUri'));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRedirectURI = async (uriId: string) => {
    if (!confirm(t('common.confirmDeleteRedirectUri'))) return;
    try {
      await applicationsService.removeRedirectUri(tenantId, uriId);
      setSuccess(t('common.redirectUriDeletedSuccessfully'));
      fetchRedirectURIs();
    } catch (err: any) {
      setError(err.message || t('common.failedToDeleteRedirectUri'));
    }
  };

  const handleGenerateSecret = async () => {
    setSaving(true);
    setError('');
    try {
      const data = await applicationsService.regenerateSecret(tenantId, applicationId);
      setShowGeneratedSecret(data.clientSecret);
      setShowAddSecretModal(false);
      setNewSecretName('');
      fetchClientSecrets();
    } catch (err: any) {
      setError(err.message || t('common.failedToGenerateSecret'));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSecret = async (secretId: string) => {
    if (!confirm(t('common.confirmDeleteClientSecret'))) return;
    try {
      await applicationsService.regenerateSecret(tenantId, applicationId);
      setSuccess(t('common.clientSecretRegeneratedSuccessfully'));
      fetchClientSecrets();
    } catch (err: any) {
      setError(err.message || t('common.failedToDeleteSecret'));
    }
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return t('common.never');
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-6 py-4 rounded-xl flex items-center gap-3"
        >
          <AlertCircle className="w-6 h-6" />
          {t('applications.notFound')}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 p-8">
      <Helmet>
        <title>{application.name} - Application Details - OneSign</title>
      </Helmet>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg">
              <AppWindow className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {application.name}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {(application as any).description || t('common.noDescription')}
              </p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowEditModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all font-medium"
          >
            <Edit className="w-5 h-5" />
            {t('common.editApplication')}
          </motion.button>
        </div>
      </motion.div>

      {/* Messages */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl flex items-center gap-2"
          >
            <AlertCircle className="w-5 h-5" />
            {error}
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-xl flex items-center gap-2"
          >
            <CheckCircle className="w-5 h-5" />
            {success}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-xl p-2 shadow-lg border border-gray-200 dark:border-slate-700 overflow-x-auto"
      >
        <nav className="flex space-x-2 min-w-max">
          {tabsData.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as Tab)}
              className={`relative py-3 px-4 rounded-lg font-medium transition-all duration-200 whitespace-nowrap ${
                activeTab === tab.key
                  ? 'text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700'
              }`}
            >
              {activeTab === tab.key && (
                <motion.div
                  layoutId="activeAppTab"
                  className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                {tab.icon}
                {t(tab.labelKey)}
              </span>
            </button>
          ))}
        </nav>
      </motion.div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <AppWindow className="w-5 h-5 text-green-500" />
              {t('common.applicationInformation')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{t('common.name')}</label>
                <div className="text-gray-900 dark:text-white font-medium">{application.name}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{t('common.type')}</label>
                <div className="text-gray-900 dark:text-white capitalize">{(application as any).type || (application as any).applicationType || t('common.notAvailable')}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{t('common.category')}</label>
                <div className="text-gray-900 dark:text-white">{(application as any).category || t('common.notAvailable')}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{t('common.status')}</label>
                <StatusBadge status={(application as any).status || ((application as any).isEnabled ? 'active' : 'inactive')} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{t('common.url')}</label>
                <div className="text-gray-900 dark:text-white flex items-center gap-2">
                  {(application as any).url || t('common.notAvailable')}
                  {(application as any).url && (
                    <ExternalLink className="w-4 h-4 text-gray-400 cursor-pointer hover:text-green-500" />
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{t('common.criticalApplication')}</label>
                <div className="text-gray-900 dark:text-white">{(application as any).isCritical ? t('common.yes') : t('common.no')}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{t('common.createdAt')}</label>
                <div className="text-gray-900 dark:text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  {formatDate((application as any).createdAt || application.createdAt)}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{t('common.updatedAt')}</label>
                <div className="text-gray-900 dark:text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  {formatDate((application as any).updatedAt || application.updatedAt)}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Redirect URIs Tab */}
      {activeTab === 'redirect-uris' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Link2 className="w-5 h-5 text-green-500" />
              {t('common.redirectUris')}
            </h3>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowAddURIModal(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-xl hover:shadow-lg transition-all font-medium"
            >
              <Plus className="w-4 h-4" />
              {t('common.addUri')}
            </motion.button>
          </div>
          {redirectURIs.length === 0 ? (
            <div className="text-center py-12">
              <Link2 className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">{t('common.noRedirectUrisConfigured')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {redirectURIs.map((uri, index) => (
                <motion.div
                  key={uri.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white font-mono text-sm">{uri.uri}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {t('common.type')}: <span className="capitalize">{uri.type}</span> • {t('common.added')}: {formatDate(uri.createdAt)}
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleDeleteRedirectURI(uri.id)}
                    className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </motion.button>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Client Secrets Tab */}
      {activeTab === 'client-secrets' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Key className="w-5 h-5 text-green-500" />
              {t('common.clientSecrets')}
            </h3>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowAddSecretModal(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-xl hover:shadow-lg transition-all font-medium"
            >
              <Plus className="w-4 h-4" />
              {t('common.generateSecret')}
            </motion.button>
          </div>
          {clientSecrets.length === 0 ? (
            <div className="text-center py-12">
              <Key className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">{t('common.noClientSecretsConfigured')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {clientSecrets.map((secret, index) => (
                <motion.div
                  key={secret.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl"
                >
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">{secret.name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {t('common.hint')}: <span className="font-mono">{secret.hint}</span> • {t('common.created')}: {formatDate(secret.createdAt)}
                      {secret.lastUsedAt && ` • ${t('common.lastUsed')}: ${formatDate(secret.lastUsedAt)}`}
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleDeleteSecret(secret.id)}
                    className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </motion.button>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Permissions Tab */}
      {activeTab === 'permissions' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-500" />
            {t('common.permissionsAndScopes')}
          </h3>
          {permissions.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">{t('common.noPermissionsConfigured')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {permissions.map((permission, index) => (
                <motion.div
                  key={permission.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-start justify-between p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl"
                >
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white font-mono">{permission.scope}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">{permission.description}</div>
                    {permission.isGranted && (
                      <div className="text-xs text-green-600 dark:text-green-400 mt-2 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        {t('common.granted')}: {formatDate(permission.grantedAt)}
                      </div>
                    )}
                  </div>
                  <span
                    className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                      permission.isGranted
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                    }`}
                  >
                    {permission.isGranted ? t('common.granted') : t('common.notGranted')}
                  </span>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Org Units Tab */}
      {activeTab === 'org-units' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-green-500" />
            {t('common.organizationalUnitAssignments')}
          </h3>
          {orgUnits.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">{t('common.noOrgUnitAssignments')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orgUnits.map((assignment, index) => (
                <motion.div
                  key={assignment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl"
                >
                  <div className="font-medium text-gray-900 dark:text-white">{assignment.orgUnitName}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1 font-mono">{assignment.orgUnitPath}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    {t('common.assigned')}: {formatDate(assignment.assignedAt)}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Audit Log Tab */}
      {activeTab === 'audit-log' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <FileText className="w-5 h-5 text-green-500" />
            {t('common.auditLog')}
          </h3>
          {auditLog.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">{t('common.noAuditEntriesFound')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {auditLog.map((entry, index) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-l-4 border-green-500 pl-4 py-3 bg-gray-50 dark:bg-slate-700/50 rounded-r-xl"
                >
                  <div className="font-medium text-gray-900 dark:text-white">{entry.action}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{t('common.by')}: {entry.actorName}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    {formatDate(entry.timestamp)} • {t('common.ip')}: {entry.ipAddress}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Usage Statistics Tab */}
      {activeTab === 'usage-stats' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {!usageStats ? (
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6 text-center">
              <BarChart3 className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">{t('common.loadingStatistics')}</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard
                  title={t('common.totalUsers')}
                  value={usageStats.totalUsers.toLocaleString()}
                  icon={<Users className="w-6 h-6 text-white" />}
                  color="from-blue-500 to-blue-600"
                  delay={0}
                />
                <StatCard
                  title={t('common.activeUsers')}
                  value={usageStats.activeUsers.toLocaleString()}
                  icon={<Activity className="w-6 h-6 text-white" />}
                  color="from-green-500 to-emerald-600"
                  delay={1}
                />
                <StatCard
                  title={t('common.totalSessions')}
                  value={usageStats.totalSessions.toLocaleString()}
                  icon={<BarChart3 className="w-6 h-6 text-white" />}
                  color="from-purple-500 to-purple-600"
                  delay={2}
                />
                <StatCard
                  title={t('common.avgSession')}
                  value={`${usageStats.avgSessionDuration}m`}
                  icon={<Clock className="w-6 h-6 text-white" />}
                  color="from-orange-500 to-amber-600"
                  delay={3}
                />
              </div>

              {usageStats.stats && usageStats.stats.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6"
                >
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('common.dailyStatistics')}</h3>
                  <div className="space-y-3">
                    {usageStats.stats.map((stat: any, index: number) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700/50 rounded-xl"
                      >
                        <div className="text-sm text-gray-600 dark:text-gray-400">{stat.date}</div>
                        <div className="flex gap-6">
                          <span className="text-sm">
                            <span className="font-medium text-gray-900 dark:text-white">{stat.users}</span>
                            <span className="text-gray-500 dark:text-gray-400 ml-1">{t('common.users')}</span>
                          </span>
                          <span className="text-sm">
                            <span className="font-medium text-gray-900 dark:text-white">{stat.sessions}</span>
                            <span className="text-gray-500 dark:text-gray-400 ml-1">{t('common.sessions')}</span>
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </>
          )}
        </motion.div>
      )}

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title={`${t('common.edit')} ${t('common.application')}`}
        size="lg"
        footer={
          <>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowEditModal(false)}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-slate-700 rounded-xl hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors"
            >
              {t('common.cancel')}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleUpdateApplication}
              disabled={saving}
              className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
            >
              {saving ? t('common.saving') : t('common.saveChanges')}
            </motion.button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('common.name')}</label>
            <input
              type="text"
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('common.description')}</label>
            <textarea
              value={editForm.description}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('common.category')}</label>
            <input
              type="text"
              value={editForm.category}
              onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('common.url')}</label>
            <input
              type="url"
              value={editForm.url}
              onChange={(e) => setEditForm({ ...editForm, url: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>
      </Modal>

      {/* Add Redirect URI Modal */}
      <Modal
        isOpen={showAddURIModal}
        onClose={() => setShowAddURIModal(false)}
        title={`${t('common.add')} ${t('common.redirectUri')}`}
        footer={
          <>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowAddURIModal(false)}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-slate-700 rounded-xl hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors"
            >
              {t('common.cancel')}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAddRedirectURI}
              disabled={saving || !newURI.uri}
              className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
            >
              {saving ? t('common.adding') : t('common.addUri')}
            </motion.button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('common.uri')}</label>
            <input
              type="url"
              value={newURI.uri}
              onChange={(e) => setNewURI({ ...newURI, uri: e.target.value })}
              placeholder="https://example.com/callback"
              className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('common.type')}</label>
            <select
              value={newURI.type}
              onChange={(e) => setNewURI({ ...newURI, type: e.target.value as 'web' | 'mobile' | 'desktop' })}
              className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="web">{t('common.web')}</option>
              <option value="mobile">{t('common.mobile')}</option>
              <option value="desktop">{t('common.desktop')}</option>
            </select>
          </div>
        </div>
      </Modal>

      {/* Add Client Secret Modal */}
      <Modal
        isOpen={showAddSecretModal}
        onClose={() => setShowAddSecretModal(false)}
        title={t('common.generateClientSecret')}
        footer={
          <>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowAddSecretModal(false)}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-slate-700 rounded-xl hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors"
            >
              {t('common.cancel')}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGenerateSecret}
              disabled={saving || !newSecretName}
              className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
            >
              {saving ? t('common.generating') : t('common.generateSecret')}
            </motion.button>
          </>
        }
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('common.secretName')}</label>
          <input
            type="text"
            value={newSecretName}
            onChange={(e) => setNewSecretName(e.target.value)}
            placeholder={t('common.secretNamePlaceholder')}
            className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      </Modal>

      {/* Generated Secret Display Modal */}
      <Modal
        isOpen={!!showGeneratedSecret}
        onClose={() => setShowGeneratedSecret('')}
        title={t('common.clientSecretGenerated')}
        footer={
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowGeneratedSecret('')}
            className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:shadow-lg transition-all"
          >
            {t('common.savedSecret')}
          </motion.button>
        }
      >
        <div className="space-y-4">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4 rounded-xl">
            <p className="text-sm text-yellow-800 dark:text-yellow-300 font-medium flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              {t('common.copySecretWarning')}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('common.clientSecret')}</label>
            <div className="bg-gray-100 dark:bg-slate-700 p-4 rounded-xl font-mono text-sm break-all text-gray-900 dark:text-white">
              {showGeneratedSecret}
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              navigator.clipboard.writeText(showGeneratedSecret);
              setSuccess(t('common.secretCopiedToClipboard'));
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-300 dark:hover:bg-slate-500 transition-colors"
          >
            <Copy className="w-4 h-4" />
            {t('common.copyToClipboard')}
          </motion.button>
        </div>
      </Modal>
    </div>
  );
}
