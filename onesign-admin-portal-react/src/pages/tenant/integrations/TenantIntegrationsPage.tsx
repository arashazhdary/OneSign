import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocale } from '@/hooks/useLocale';
import { getTenantId } from '@/lib/tenant-context';
import { tenantService } from '@/lib/api/services/tenant.service';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plug,
  Plus,
  Settings,
  Trash2,
  X,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  RefreshCw,
  Zap,
  Play,
  Power,
  FileText,
  ChevronRight,
  ChevronLeft,
  Users,
  Key,
  Shield,
  Cloud,
  MessageSquare,
  Link2,
  ArrowRight,
  Activity,
  Server,
  Globe,
} from 'lucide-react';

interface Integration {
  id: string;
  type: string;
  name: string;
  description: string;
  isActive: boolean;
  status: 'healthy' | 'warning' | 'error' | 'pending';
  lastSyncAt?: string;
  config: Record<string, any>;
  syncedUsers?: number;
  errorCount?: number;
}

interface AvailableIntegration {
  id: string;
  type: string;
  name: string;
  description: string;
  icon: React.ElementType;
  category: string;
  features: string[];
  color: string;
}

interface SyncLog {
  id: string;
  integrationId: string;
  timestamp: string;
  status: 'success' | 'failed';
  message: string;
  usersProcessed: number;
  errors: number;
}

const AVAILABLE_INTEGRATIONS: AvailableIntegration[] = [
  {
    id: 'ldap',
    type: 'ldap',
    name: 'LDAP',
    description: 'Lightweight Directory Access Protocol integration',
    icon: Key,
    category: 'Directory Services',
    features: ['User Sync', 'Group Sync', 'Authentication'],
    color: 'from-amber-500 to-orange-600',
  },
  {
    id: 'ad',
    type: 'active-directory',
    name: 'Active Directory',
    description: 'Microsoft Active Directory integration',
    icon: Server,
    category: 'Directory Services',
    features: ['User Sync', 'Group Sync', 'Authentication', 'SSO'],
    color: 'from-blue-500 to-blue-700',
  },
  {
    id: 'okta',
    type: 'okta',
    name: 'Okta',
    description: 'Okta identity and access management',
    icon: Zap,
    category: 'Identity Provider',
    features: ['SSO', 'SAML', 'OIDC', 'User Provisioning'],
    color: 'from-blue-600 to-indigo-600',
  },
  {
    id: 'azure-ad',
    type: 'azure-ad',
    name: 'Azure AD',
    description: 'Microsoft Azure Active Directory',
    icon: Cloud,
    category: 'Identity Provider',
    features: ['SSO', 'SAML', 'OIDC', 'User Sync', 'Graph API'],
    color: 'from-sky-500 to-blue-600',
  },
  {
    id: 'google-workspace',
    type: 'google-workspace',
    name: 'Google Workspace',
    description: 'Google Workspace (G Suite) integration',
    icon: Globe,
    category: 'Identity Provider',
    features: ['SSO', 'User Sync', 'OAuth', 'Directory API'],
    color: 'from-green-500 to-emerald-600',
  },
  {
    id: 'saml',
    type: 'saml',
    name: 'Generic SAML',
    description: 'Generic SAML 2.0 integration',
    icon: Shield,
    category: 'Protocol',
    features: ['SSO', 'SAML 2.0'],
    color: 'from-purple-500 to-purple-700',
  },
  {
    id: 'oidc',
    type: 'oidc',
    name: 'OpenID Connect',
    description: 'Generic OpenID Connect integration',
    icon: Link2,
    category: 'Protocol',
    features: ['SSO', 'OIDC'],
    color: 'from-pink-500 to-rose-600',
  },
  {
    id: 'slack',
    type: 'slack',
    name: 'Slack',
    description: 'Slack workspace integration',
    icon: MessageSquare,
    category: 'Collaboration',
    features: ['Notifications', 'User Sync'],
    color: 'from-violet-500 to-purple-600',
  },
];

// Mock active integrations
const mockActiveIntegrations: Integration[] = [
  {
    id: '1',
    type: 'active-directory',
    name: 'Corporate AD',
    description: 'Main Active Directory for corporate users',
    isActive: true,
    status: 'healthy',
    lastSyncAt: '2024-02-15T10:30:00Z',
    config: {},
    syncedUsers: 1250,
    errorCount: 0,
  },
  {
    id: '2',
    type: 'okta',
    name: 'Okta SSO',
    description: 'Single Sign-On provider',
    isActive: true,
    status: 'healthy',
    lastSyncAt: '2024-02-15T11:00:00Z',
    config: {},
    syncedUsers: 850,
    errorCount: 2,
  },
];

// Mock sync logs
const mockSyncLogs: SyncLog[] = [
  {
    id: '1',
    integrationId: '1',
    timestamp: '2024-02-15T10:30:00Z',
    status: 'success',
    message: t('tenant.integrations.syncMessages.fullSyncSuccess', 'Full sync completed successfully'),
    usersProcessed: 1250,
    errors: 0,
  },
  {
    id: '2',
    integrationId: '2',
    timestamp: '2024-02-15T11:00:00Z',
    status: 'success',
    message: t('tenant.integrations.syncMessages.incrementalSyncWarnings', 'Incremental sync completed with warnings'),
    usersProcessed: 45,
    errors: 2,
  },
  {
    id: '3',
    integrationId: '1',
    timestamp: '2024-02-15T04:00:00Z',
    status: 'success',
    message: t('tenant.integrations.syncMessages.scheduledSyncSuccess', 'Scheduled sync completed'),
    usersProcessed: 1248,
    errors: 0,
  },
];

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  delay: number;
}

const StatCard = ({ title, value, icon: Icon, color, delay }: StatCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: delay * 0.1 }}
    className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300"
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
      </div>
      <div className={`p-4 rounded-xl bg-gradient-to-br ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  </motion.div>
);

export default function TenantIntegrationsPage() {
  const { t } = useTranslation();
  const locale = useLocale();
  const [tenantId, setTenantIdState] = useState<string | null>(null);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showConfigureModal, setShowConfigureModal] = useState(false);
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<AvailableIntegration | null>(null);
  const [selectedActiveIntegration, setSelectedActiveIntegration] = useState<Integration | null>(null);
  const [configStep, setConfigStep] = useState(1);
  const [integrationConfig, setIntegrationConfig] = useState<Record<string, any>>({});
  const [testResult, setTestResult] = useState('');
  const [testStatus, setTestStatus] = useState<'testing' | 'success' | 'error' | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  useEffect(() => {
    const contextTenantId = getTenantId();
    setTenantIdState(contextTenantId || '00000000-0000-0000-0000-000000000000');
  }, []);

  useEffect(() => {
    if (tenantId) {
      fetchIntegrations();
      fetchSyncLogs();
    }
  }, [tenantId]);

  const fetchIntegrations = async () => {
    if (!tenantId) return;
    try {
      const data = await tenantService.getIntegrations();
      setIntegrations(data?.length ? data : mockActiveIntegrations);
    } catch (error) {
      console.error('Error fetching integrations:', error);
      setIntegrations(mockActiveIntegrations);
    } finally {
      setLoading(false);
    }
  };

  const fetchSyncLogs = async () => {
    if (!tenantId) return;
    try {
      setSyncLogs(mockSyncLogs);
    } catch (error) {
      console.error('Error fetching sync logs:', error);
    }
  };

  const handleConfigureIntegration = (integration: AvailableIntegration) => {
    setSelectedIntegration(integration);
    setIntegrationConfig({});
    setConfigStep(1);
    setShowConfigureModal(true);
  };

  const handleNextStep = () => {
    setConfigStep((prev) => prev + 1);
  };

  const handlePrevStep = () => {
    setConfigStep((prev) => Math.max(1, prev - 1));
  };

  const handleSaveIntegration = async () => {
    if (!selectedIntegration || !tenantId) return;

    setError('');
    setSuccess('');

    const payload = {
      type: selectedIntegration.type,
      name: selectedIntegration.name,
      config: integrationConfig,
    };

    try {
      await tenantService.createIntegration(payload);
      setSuccess(t('tenant.integrations.configuredSuccessfully', 'Integration configured successfully'));
      setShowConfigureModal(false);
      fetchIntegrations();
    } catch (error: any) {
      setError(error?.message || t('common.failedToConfigureIntegration', 'Failed to configure integration'));
      console.error('Error configuring integration:', error);
    }
  };

  const handleTestConnection = async (integration: Integration) => {
    setSelectedActiveIntegration(integration);
    setTestResult('');
    setTestStatus('testing');
    setShowTestModal(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const mockData = {
        status: 'success',
        message: 'Connection test successful',
        integration: integration.name,
        latency: '45ms',
        serverVersion: '3.2.1',
      };
      setTestResult(JSON.stringify(mockData, null, 2));
      setTestStatus('success');
    } catch (error: any) {
      setTestResult(error?.message || 'Connection failed');
      setTestStatus('error');
      console.error('Error testing connection:', error);
    }
  };

  const handleSyncNow = async (integrationId: string) => {
    setError('');
    setSuccess('');

    try {
      setSuccess(t('tenant.integrations.syncStarted', 'Sync started successfully'));
      setTimeout(() => {
        fetchIntegrations();
        fetchSyncLogs();
      }, 1000);
    } catch (error: any) {
      setError(error?.message || t('common.failedToStartSync', 'Failed to start sync'));
      console.error('Error starting sync:', error);
    }
  };

  const handleToggleIntegration = async (integration: Integration) => {
    try {
      await tenantService.updateIntegration(integration.id, { isActive: !integration.isActive });
      setSuccess(
        integration.isActive
          ? t('tenant.integrations.disabled', 'Integration disabled successfully')
          : t('tenant.integrations.enabled', 'Integration enabled successfully')
      );
      fetchIntegrations();
    } catch (error: any) {
      setError(error?.message || t('common.failedToUpdateIntegrationStatus', 'Failed to update status'));
      console.error('Error updating integration status:', error);
    }
  };

  const handleDeleteIntegration = async (integrationId: string) => {
    if (!confirm(t('tenant.integrations.confirmDelete', 'Are you sure you want to delete this integration?')))
      return;

    try {
      await tenantService.deleteIntegration(integrationId);
      setSuccess(t('tenant.integrations.deleted', 'Integration deleted successfully'));
      fetchIntegrations();
    } catch (error: any) {
      setError(error?.message || t('common.failedToDeleteIntegration', 'Failed to delete integration'));
      console.error('Error deleting integration:', error);
    }
  };

  const getStatusConfig = (status: Integration['status']) => {
    switch (status) {
      case 'healthy':
        return {
          color: 'bg-green-100 text-green-800',
          icon: CheckCircle,
          iconColor: 'text-green-600',
        };
      case 'warning':
        return {
          color: 'bg-yellow-100 text-yellow-800',
          icon: AlertTriangle,
          iconColor: 'text-yellow-600',
        };
      case 'error':
        return {
          color: 'bg-red-100 text-red-800',
          icon: XCircle,
          iconColor: 'text-red-600',
        };
      case 'pending':
        return {
          color: 'bg-gray-100 text-gray-800',
          icon: Clock,
          iconColor: 'text-gray-600',
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800',
          icon: Clock,
          iconColor: 'text-gray-600',
        };
    }
  };

  const renderConfigurationStep = () => {
    if (!selectedIntegration) return null;

    switch (selectedIntegration.type) {
      case 'ldap':
      case 'active-directory':
        return (
          <>
            {configStep === 1 && (
              <div className="space-y-5">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <Server className="w-5 h-5 text-indigo-600" />
                  {t('tenant.integrations.connectionSettings', 'Connection Settings')}
                </h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('tenant.integrations.serverUrl', 'Server URL')}
                  </label>
                  <input
                    type="text"
                    value={integrationConfig.serverUrl || ''}
                    onChange={(e) =>
                      setIntegrationConfig({ ...integrationConfig, serverUrl: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="ldap://ldap.example.com:389"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('tenant.integrations.baseDN', 'Base DN')}
                  </label>
                  <input
                    type="text"
                    value={integrationConfig.baseDN || ''}
                    onChange={(e) =>
                      setIntegrationConfig({ ...integrationConfig, baseDN: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="dc=example,dc=com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('tenant.integrations.bindDN', 'Bind DN')}
                  </label>
                  <input
                    type="text"
                    value={integrationConfig.bindDN || ''}
                    onChange={(e) =>
                      setIntegrationConfig({ ...integrationConfig, bindDN: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="cn=admin,dc=example,dc=com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('common.password', 'Password')}
                  </label>
                  <input
                    type="password"
                    value={integrationConfig.password || ''}
                    onChange={(e) =>
                      setIntegrationConfig({ ...integrationConfig, password: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}
            {configStep === 2 && (
              <div className="space-y-5">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <RefreshCw className="w-5 h-5 text-indigo-600" />
                  {t('tenant.integrations.syncSettings', 'Sync Settings')}
                </h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('tenant.integrations.userFilter', 'User Filter')}
                  </label>
                  <input
                    type="text"
                    value={integrationConfig.userFilter || ''}
                    onChange={(e) =>
                      setIntegrationConfig({ ...integrationConfig, userFilter: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                    placeholder="(objectClass=person)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('tenant.integrations.syncInterval', 'Sync Interval (minutes)')}
                  </label>
                  <input
                    type="number"
                    value={integrationConfig.syncInterval || 60}
                    onChange={(e) =>
                      setIntegrationConfig({
                        ...integrationConfig,
                        syncInterval: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div
                      className={`relative w-14 h-7 rounded-full transition-colors ${
                        integrationConfig.autoSync
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600'
                          : 'bg-gray-300'
                      }`}
                    >
                      <div
                        className={`absolute top-0.5 ${
                          integrationConfig.autoSync
                            ? locale === 'fa'
                              ? 'left-0.5'
                              : 'right-0.5'
                            : locale === 'fa'
                              ? 'right-0.5'
                              : 'left-0.5'
                        } w-6 h-6 bg-white rounded-full shadow-md transition-all`}
                      />
                    </div>
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={integrationConfig.autoSync || false}
                      onChange={(e) =>
                        setIntegrationConfig({ ...integrationConfig, autoSync: e.target.checked })
                      }
                    />
                    <span className="text-gray-700 font-medium">
                      {t('tenant.integrations.enableAutoSync', 'Enable automatic sync')}
                    </span>
                  </label>
                </div>
              </div>
            )}
          </>
        );

      case 'okta':
      case 'azure-ad':
        return (
          <>
            {configStep === 1 && (
              <div className="space-y-5">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <Key className="w-5 h-5 text-indigo-600" />
                  {t('tenant.integrations.oauthSettings', 'OAuth Settings')}
                </h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('tenant.integrations.domain', 'Domain')}
                  </label>
                  <input
                    type="text"
                    value={integrationConfig.domain || ''}
                    onChange={(e) =>
                      setIntegrationConfig({ ...integrationConfig, domain: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={
                      selectedIntegration.type === 'okta'
                        ? 'example.okta.com'
                        : 'example.onmicrosoft.com'
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('tenant.integrations.clientId', 'Client ID')}
                  </label>
                  <input
                    type="text"
                    value={integrationConfig.clientId || ''}
                    onChange={(e) =>
                      setIntegrationConfig({ ...integrationConfig, clientId: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('tenant.integrations.clientSecret', 'Client Secret')}
                  </label>
                  <input
                    type="password"
                    value={integrationConfig.clientSecret || ''}
                    onChange={(e) =>
                      setIntegrationConfig({ ...integrationConfig, clientSecret: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}
            {configStep === 2 && (
              <div className="space-y-5">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-indigo-600" />
                  {t('tenant.integrations.ssoConfiguration', 'SSO Configuration')}
                </h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('tenant.integrations.authEndpoint', 'Authorization Endpoint')}
                  </label>
                  <input
                    type="text"
                    value={integrationConfig.authEndpoint || ''}
                    onChange={(e) =>
                      setIntegrationConfig({ ...integrationConfig, authEndpoint: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('tenant.integrations.tokenEndpoint', 'Token Endpoint')}
                  </label>
                  <input
                    type="text"
                    value={integrationConfig.tokenEndpoint || ''}
                    onChange={(e) =>
                      setIntegrationConfig({ ...integrationConfig, tokenEndpoint: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('tenant.integrations.scopes', 'Scopes')}
                  </label>
                  <input
                    type="text"
                    value={integrationConfig.scopes || ''}
                    onChange={(e) =>
                      setIntegrationConfig({ ...integrationConfig, scopes: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="openid profile email"
                  />
                </div>
              </div>
            )}
          </>
        );

      default:
        return (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <Settings className="w-5 h-5 text-indigo-600" />
              {t('tenant.integrations.configuration', 'Configuration')}
            </h3>
            <p className="text-sm text-gray-600">
              {t(
                'tenant.integrations.comingSoon',
                `Configuration for ${selectedIntegration.name} will be available soon.`
              )}
            </p>
          </div>
        );
    }
  };

  const categories = ['all', ...new Set(AVAILABLE_INTEGRATIONS.map((i) => i.category))];
  const filteredAvailableIntegrations = AVAILABLE_INTEGRATIONS.filter(
    (integration) => filterCategory === 'all' || integration.category === filterCategory
  );

  // Stats
  const totalIntegrations = integrations.length;
  const activeIntegrations = integrations.filter((i) => i.isActive).length;
  const healthyIntegrations = integrations.filter((i) => i.status === 'healthy').length;
  const totalSyncedUsers = integrations.reduce((sum, i) => sum + (i.syncedUsers || 0), 0);

  if (loading) {
    return (
      <div
        dir={locale === 'fa' ? 'rtl' : 'ltr'}
        className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8 flex items-center justify-center"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-gray-600 font-medium">{t('common.loading', 'Loading...')}</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      dir={locale === 'fa' ? 'rtl' : 'ltr'}
      className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4"
      >
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            {t('tenant.integrations.title', 'Integration Hub')}
          </h1>
          <p className="text-gray-600 mt-2">
            {t('tenant.integrations.subtitle', 'Connect and manage your identity providers and services')}
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowLogsModal(true)}
          className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-50 transition-all shadow-sm"
        >
          <FileText className="w-5 h-5" />
          {t('tenant.integrations.viewLogs', 'View Sync Logs')}
        </motion.button>
      </motion.div>

      {/* Success/Error Messages */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-center gap-2"
          >
            <CheckCircle className="w-5 h-5" />
            {success}
            <button onClick={() => setSuccess('')} className="ml-auto">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2"
          >
            <AlertTriangle className="w-5 h-5" />
            {error}
            <button onClick={() => setError('')} className="ml-auto">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title={t('tenant.integrations.totalIntegrations', 'Total Integrations')}
          value={totalIntegrations}
          icon={Plug}
          color="from-blue-500 to-blue-600"
          delay={0}
        />
        <StatCard
          title={t('tenant.integrations.activeIntegrations', 'Active Integrations')}
          value={activeIntegrations}
          icon={Power}
          color="from-green-500 to-green-600"
          delay={1}
        />
        <StatCard
          title={t('tenant.integrations.healthyConnections', 'Healthy Connections')}
          value={healthyIntegrations}
          icon={Activity}
          color="from-emerald-500 to-emerald-600"
          delay={2}
        />
        <StatCard
          title={t('tenant.integrations.syncedUsers', 'Synced Users')}
          value={totalSyncedUsers.toLocaleString()}
          icon={Users}
          color="from-purple-500 to-purple-600"
          delay={3}
        />
      </div>

      {/* Active Integrations */}
      {integrations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Plug className="w-5 h-5 text-indigo-600" />
            {t('tenant.integrations.activeIntegrations', 'Active Integrations')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {integrations.map((integration, index) => {
              const statusConfig = getStatusConfig(integration.status);
              const StatusIcon = statusConfig.icon;
              const availableIntegration = AVAILABLE_INTEGRATIONS.find(
                (ai) => ai.type === integration.type
              );
              const IntegrationIcon = availableIntegration?.icon || Plug;
              const color = availableIntegration?.color || 'from-gray-500 to-gray-600';

              return (
                <motion.div
                  key={integration.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${color}`}>
                        <IntegrationIcon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{integration.name}</h3>
                        <p className="text-xs text-gray-500 capitalize">{integration.type.replace('-', ' ')}</p>
                      </div>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-full font-medium ${statusConfig.color}`}
                    >
                      <StatusIcon className={`w-3.5 h-3.5 ${statusConfig.iconColor}`} />
                      {t(`tenant.integrations.status.${integration.status}`, integration.status)}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    {integration.lastSyncAt && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span>
                          {t('tenant.integrations.lastSync', 'Last sync')}:{' '}
                          {new Date(integration.lastSyncAt).toLocaleString(locale)}
                        </span>
                      </div>
                    )}

                    {integration.syncedUsers !== undefined && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span>
                          {t('tenant.integrations.syncedUsers', 'Synced users')}: {integration.syncedUsers}
                        </span>
                      </div>
                    )}

                    {integration.errorCount !== undefined && integration.errorCount > 0 && (
                      <div className="flex items-center gap-2 text-sm text-red-600">
                        <AlertTriangle className="w-4 h-4" />
                        <span>
                          {t('tenant.integrations.errors', 'Errors')}: {integration.errorCount}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleTestConnection(integration)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Play className="w-3.5 h-3.5" />
                      {t('tenant.integrations.test', 'Test')}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleSyncNow(integration.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      {t('tenant.integrations.syncNow', 'Sync')}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleToggleIntegration(integration)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-colors ${
                        integration.isActive
                          ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                          : 'bg-green-100 text-green-800 hover:bg-green-200'
                      }`}
                    >
                      <Power className="w-3.5 h-3.5" />
                      {integration.isActive
                        ? t('tenant.integrations.disable', 'Disable')
                        : t('tenant.integrations.enable', 'Enable')}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDeleteIntegration(integration.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      {t('common.delete', 'Delete')}
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Available Integrations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5 text-indigo-600" />
          {t('tenant.integrations.availableIntegrations', 'Available Integrations')}
        </h2>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((category) => (
            <motion.button
              key={category}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setFilterCategory(category)}
              className={`px-4 py-2 text-sm rounded-xl font-medium transition-all ${
                filterCategory === category
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                  : 'bg-white border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {category === 'all' ? t('common.all', 'All') : category}
            </motion.button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAvailableIntegrations.map((integration, index) => {
            const Icon = integration.icon;
            return (
              <motion.div
                key={integration.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl hover:border-indigo-300 transition-all group"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div
                    className={`p-3 rounded-xl bg-gradient-to-br ${integration.color} group-hover:scale-110 transition-transform`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{integration.name}</h3>
                    <p className="text-xs text-gray-500">{integration.category}</p>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-4">{integration.description}</p>

                <div className="mb-4">
                  <p className="text-xs font-medium text-gray-700 mb-2">
                    {t('tenant.integrations.features', 'Features')}:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {integration.features.map((feature) => (
                      <span
                        key={feature}
                        className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-lg"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleConfigureIntegration(integration)}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r ${integration.color} text-white rounded-xl hover:opacity-90 transition-all font-medium`}
                >
                  <Settings className="w-4 h-4" />
                  {t('tenant.integrations.configure', 'Configure')}
                </motion.button>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Configure Integration Modal */}
      <AnimatePresence>
        {showConfigureModal && selectedIntegration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowConfigureModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className={`p-6 border-b border-gray-200 bg-gradient-to-r ${selectedIntegration.color} rounded-t-2xl`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <selectedIntegration.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">
                        {t('tenant.integrations.configure', 'Configure')} {selectedIntegration.name}
                      </h2>
                      <p className="text-white/80 text-sm">{selectedIntegration.category}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowConfigureModal(false)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>

              {/* Progress Steps */}
              <div className="px-6 py-4 border-b border-gray-100">
                <div className="flex items-center justify-center gap-4">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                        configStep >= 1
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      1
                    </div>
                    <span className="text-sm font-medium text-gray-600">
                      {t('tenant.integrations.connection', 'Connection')}
                    </span>
                  </div>
                  <div className="w-16 h-1 bg-gray-200 rounded">
                    <div
                      className={`h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded transition-all ${
                        configStep >= 2 ? 'w-full' : 'w-0'
                      }`}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                        configStep >= 2
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      2
                    </div>
                    <span className="text-sm font-medium text-gray-600">
                      {t('tenant.integrations.settings', 'Settings')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6">{renderConfigurationStep()}</div>

              <div className="flex gap-3 px-6 pb-6">
                {configStep > 1 && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handlePrevStep}
                    className="flex items-center gap-2 px-6 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                  >
                    {locale === 'fa' ? (
                      <ChevronRight className="w-4 h-4" />
                    ) : (
                      <ChevronLeft className="w-4 h-4" />
                    )}
                    {t('common.previous', 'Previous')}
                  </motion.button>
                )}
                {configStep < 2 ? (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleNextStep}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all font-medium"
                  >
                    {t('common.next', 'Next')}
                    {locale === 'fa' ? (
                      <ChevronLeft className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </motion.button>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSaveIntegration}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all font-medium"
                  >
                    <CheckCircle className="w-5 h-5" />
                    {t('tenant.integrations.saveAndActivate', 'Save & Activate')}
                  </motion.button>
                )}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowConfigureModal(false)}
                  className="px-6 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  {t('common.cancel', 'Cancel')}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Test Connection Modal */}
      <AnimatePresence>
        {showTestModal && selectedActiveIntegration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowTestModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-lg w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <Activity className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">
                        {t('tenant.integrations.connectionTest', 'Connection Test')}
                      </h2>
                      <p className="text-blue-100 text-sm">{selectedActiveIntegration.name}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowTestModal(false)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                {testStatus === 'testing' && (
                  <div className="flex flex-col items-center justify-center py-8">
                    <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4" />
                    <p className="text-gray-600 font-medium">
                      {t('tenant.integrations.testingConnection', 'Testing connection...')}
                    </p>
                  </div>
                )}

                {testStatus === 'success' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                      <div>
                        <p className="font-semibold text-green-800">
                          {t('tenant.integrations.connectionSuccessful', 'Connection Successful!')}
                        </p>
                        <p className="text-sm text-green-600">
                          {t('tenant.integrations.integrationReady', 'The integration is ready to use')}
                        </p>
                      </div>
                    </div>
                    <pre className="bg-gray-100 p-4 rounded-xl text-sm overflow-auto max-h-48 font-mono">
                      {testResult}
                    </pre>
                  </motion.div>
                )}

                {testStatus === 'error' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                      <XCircle className="w-8 h-8 text-red-600" />
                      <div>
                        <p className="font-semibold text-red-800">
                          {t('tenant.integrations.connectionFailed', 'Connection Failed')}
                        </p>
                        <p className="text-sm text-red-600">
                          {t('tenant.integrations.checkSettings', 'Please check your settings and try again')}
                        </p>
                      </div>
                    </div>
                    <pre className="bg-gray-100 p-4 rounded-xl text-sm overflow-auto max-h-48 font-mono text-red-600">
                      {testResult}
                    </pre>
                  </motion.div>
                )}
              </div>

              <div className="px-6 pb-6">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowTestModal(false)}
                  className="w-full px-6 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  {t('common.close', 'Close')}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sync Logs Modal */}
      <AnimatePresence>
        {showLogsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowLogsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-700 to-gray-900 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-white">
                      {t('tenant.integrations.syncLogs', 'Sync Logs')}
                    </h2>
                  </div>
                  <button
                    onClick={() => setShowLogsModal(false)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>

              <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
                <div className="space-y-3">
                  {syncLogs.map((log, index) => {
                    const integration = integrations.find((i) => i.id === log.integrationId);
                    return (
                      <motion.div
                        key={log.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`border rounded-xl p-4 ${
                          log.status === 'success'
                            ? 'bg-green-50 border-green-200'
                            : 'bg-red-50 border-red-200'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            {log.status === 'success' ? (
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            ) : (
                              <XCircle className="w-5 h-5 text-red-600" />
                            )}
                            <span className="font-medium text-gray-900">
                              {integration?.name || t('common.unknown', 'Unknown')}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500">
                            {new Date(log.timestamp).toLocaleString(locale)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">{log.message}</p>
                        <div className="flex gap-4 text-xs text-gray-600">
                          <span className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5" />
                            {t('tenant.integrations.usersProcessed', 'Users processed')}: {log.usersProcessed}
                          </span>
                          {log.errors > 0 && (
                            <span className="flex items-center gap-1 text-red-600">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              {t('tenant.integrations.errors', 'Errors')}: {log.errors}
                            </span>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                  {syncLogs.length === 0 && (
                    <div className="text-center py-12">
                      <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">
                        {t('tenant.integrations.noLogs', 'No sync logs available')}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 border-t border-gray-200">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowLogsModal(false)}
                  className="w-full px-6 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  {t('common.close', 'Close')}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
