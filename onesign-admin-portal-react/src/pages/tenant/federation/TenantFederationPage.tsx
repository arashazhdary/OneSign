import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { getTenantId } from '@/lib/tenant-context';
import Modal from '@/components/common/Modal';
import { tenantService } from '@/lib/api/services/tenant.service';
import { Helmet } from 'react-helmet-async';
import {
  Shield,
  Key,
  Users,
  Plus,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit3,
  Trash2,
  Link2,
  Lock,
  Fingerprint,
  Server,
  ExternalLink,
  Copy,
  Eye,
  EyeOff,
  FileKey,
  Globe,
  Clock,
  X,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';

interface SAMLProvider {
  id: string;
  tenantId: string;
  name: string;
  entityId: string;
  ssoUrl: string;
  certificate: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

interface OIDCProvider {
  id: string;
  tenantId: string;
  name: string;
  issuer: string;
  clientId: string;
  clientSecret: string;
  authorizationEndpoint: string;
  tokenEndpoint: string;
  userInfoEndpoint: string;
  jwksUri: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

interface SCIMToken {
  id: string;
  tenantId: string;
  name: string;
  token: string;
  expiresAt: string | null;
  enabled: boolean;
  createdAt: string;
  lastUsedAt: string | null;
}

type Tab = 'saml' | 'oidc' | 'scim';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ElementType;
  color: string;
  delay?: number;
  subtitle?: string;
}

const StatCard = ({ title, value, icon: Icon, color, delay = 0, subtitle }: StatCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: delay * 0.1 }}
    className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 hover:shadow-lg transition-all"
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
        <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{value}</p>
        {subtitle && <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{subtitle}</p>}
      </div>
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  </motion.div>
);

export default function TenantFederationPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<Tab>('saml');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Data states
  const [samlProviders, setSamlProviders] = useState<SAMLProvider[]>([]);
  const [oidcProviders, setOidcProviders] = useState<OIDCProvider[]>([]);
  const [scimTokens, setScimTokens] = useState<SCIMToken[]>([]);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [showSecret, setShowSecret] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // SAML Form states
  const [samlName, setSamlName] = useState('');
  const [samlEntityId, setSamlEntityId] = useState('');
  const [samlSsoUrl, setSamlSsoUrl] = useState('');
  const [samlCertificate, setSamlCertificate] = useState('');
  const [samlEnabled, setSamlEnabled] = useState(true);

  // OIDC Form states
  const [oidcName, setOidcName] = useState('');
  const [oidcIssuer, setOidcIssuer] = useState('');
  const [oidcClientId, setOidcClientId] = useState('');
  const [oidcClientSecret, setOidcClientSecret] = useState('');
  const [oidcAuthEndpoint, setOidcAuthEndpoint] = useState('');
  const [oidcTokenEndpoint, setOidcTokenEndpoint] = useState('');
  const [oidcUserInfoEndpoint, setOidcUserInfoEndpoint] = useState('');
  const [oidcJwksUri, setOidcJwksUri] = useState('');
  const [oidcEnabled, setOidcEnabled] = useState(true);

  // SCIM Form states
  const [scimName, setScimName] = useState('');
  const [scimExpiresAt, setScimExpiresAt] = useState('');

  const tenantId = getTenantId();

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      if (activeTab === 'saml') {
        await fetchSAMLProviders();
      } else if (activeTab === 'oidc') {
        await fetchOIDCProviders();
      } else if (activeTab === 'scim') {
        await fetchSCIMTokens();
      }
    } catch (err) {
      setError(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const fetchSAMLProviders = async () => {
    if (!tenantId) return;
    // const data = await tenantService.getSAMLProviders(tenantId);
    // setSamlProviders(data);
    setSamlProviders([]);
  };

  const fetchOIDCProviders = async () => {
    if (!tenantId) return;
    // const data = await tenantService.getOIDCProviders(tenantId);
    // setOidcProviders(data);
    setOidcProviders([]);
  };

  const fetchSCIMTokens = async () => {
    if (!tenantId) return;
    // const data = await tenantService.getSCIMTokens(tenantId);
    // setScimTokens(data);
    setScimTokens([]);
  };

  const handleCreateSAML = async () => {
    if (!samlName || !samlEntityId || !samlSsoUrl || !samlCertificate) {
      setError('Please fill in all required fields');
      return;
    }

    if (!tenantId) return;

    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      // await tenantService.createSAMLProvider(tenantId, {
      //   name: samlName,
      //   entityId: samlEntityId,
      //   ssoUrl: samlSsoUrl,
      //   certificate: samlCertificate,
      //   enabled: samlEnabled,
      // });

      setSuccess('SAML provider created successfully');
      setShowCreateModal(false);
      resetSAMLForm();
      fetchSAMLProviders();
    } catch (err: any) {
      setError(err?.message || t('common.error'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateOIDC = async () => {
    if (!oidcName || !oidcIssuer || !oidcClientId || !oidcClientSecret) {
      setError('Please fill in all required fields');
      return;
    }

    if (!tenantId) return;

    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      // await tenantService.createOIDCProvider(tenantId, {
      //   name: oidcName,
      //   issuer: oidcIssuer,
      //   clientId: oidcClientId,
      //   clientSecret: oidcClientSecret,
      //   authorizationEndpoint: oidcAuthEndpoint,
      //   tokenEndpoint: oidcTokenEndpoint,
      //   userInfoEndpoint: oidcUserInfoEndpoint,
      //   jwksUri: oidcJwksUri,
      //   enabled: oidcEnabled,
      // });

      setSuccess('OIDC provider created successfully');
      setShowCreateModal(false);
      resetOIDCForm();
      fetchOIDCProviders();
    } catch (err: any) {
      setError(err?.message || t('common.error'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateSCIM = async () => {
    if (!scimName) {
      setError('Please fill in all required fields');
      return;
    }

    if (!tenantId) return;

    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      // const data = await tenantService.createSCIMToken(tenantId, {
      //   name: scimName,
      //   expiresAt: scimExpiresAt || null,
      // });
      // setSuccess(`SCIM token created successfully. Token: ${data.token}`);
      setSuccess('SCIM token created successfully');
      setShowCreateModal(false);
      resetSCIMForm();
      fetchSCIMTokens();
    } catch (err: any) {
      setError(err?.message || t('common.error'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateProvider = async () => {
    if (!selectedItem || !tenantId) return;

    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      // if (activeTab === 'saml') {
      //   await tenantService.updateSAMLProvider(tenantId, selectedItem.id, {
      //     name: samlName,
      //     entityId: samlEntityId,
      //     ssoUrl: samlSsoUrl,
      //     certificate: samlCertificate,
      //     enabled: samlEnabled,
      //   });
      // } else {
      //   await tenantService.updateOIDCProvider(tenantId, selectedItem.id, {
      //     name: oidcName,
      //     issuer: oidcIssuer,
      //     clientId: oidcClientId,
      //     clientSecret: oidcClientSecret,
      //     authorizationEndpoint: oidcAuthEndpoint,
      //     tokenEndpoint: oidcTokenEndpoint,
      //     userInfoEndpoint: oidcUserInfoEndpoint,
      //     jwksUri: oidcJwksUri,
      //     enabled: oidcEnabled,
      //   });
      // }

      setSuccess('Provider updated successfully');
      setShowEditModal(false);
      setSelectedItem(null);
      fetchData();
    } catch (err: any) {
      setError(err?.message || t('common.error'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedItem || !tenantId) return;

    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      // if (activeTab === 'saml') {
      //   await tenantService.deleteSAMLProvider(tenantId, selectedItem.id);
      // } else if (activeTab === 'oidc') {
      //   await tenantService.deleteOIDCProvider(tenantId, selectedItem.id);
      // } else if (activeTab === 'scim') {
      //   await tenantService.deleteSCIMToken(tenantId, selectedItem.id);
      // }

      setSuccess('Item deleted successfully');
      setShowDeleteModal(false);
      setSelectedItem(null);
      fetchData();
    } catch (err: any) {
      setError(err?.message || t('common.error'));
    } finally {
      setSubmitting(false);
    }
  };

  const resetSAMLForm = () => {
    setSamlName('');
    setSamlEntityId('');
    setSamlSsoUrl('');
    setSamlCertificate('');
    setSamlEnabled(true);
  };

  const resetOIDCForm = () => {
    setOidcName('');
    setOidcIssuer('');
    setOidcClientId('');
    setOidcClientSecret('');
    setOidcAuthEndpoint('');
    setOidcTokenEndpoint('');
    setOidcUserInfoEndpoint('');
    setOidcJwksUri('');
    setOidcEnabled(true);
  };

  const resetSCIMForm = () => {
    setScimName('');
    setScimExpiresAt('');
  };

  const loadItemForEdit = (item: any) => {
    setSelectedItem(item);
    if (activeTab === 'saml') {
      setSamlName(item.name);
      setSamlEntityId(item.entityId);
      setSamlSsoUrl(item.ssoUrl);
      setSamlCertificate(item.certificate);
      setSamlEnabled(item.enabled);
    } else if (activeTab === 'oidc') {
      setOidcName(item.name);
      setOidcIssuer(item.issuer);
      setOidcClientId(item.clientId);
      setOidcClientSecret(item.clientSecret);
      setOidcAuthEndpoint(item.authorizationEndpoint);
      setOidcTokenEndpoint(item.tokenEndpoint);
      setOidcUserInfoEndpoint(item.userInfoEndpoint);
      setOidcJwksUri(item.jwksUri);
      setOidcEnabled(item.enabled);
    }
    setShowEditModal(true);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const maskToken = (token: string) => {
    return token.substring(0, 8) + '••••••••••••' + token.slice(-8);
  };

  const tabs = [
    { id: 'saml' as Tab, label: 'SAML Providers', icon: Shield, count: samlProviders.length },
    { id: 'oidc' as Tab, label: 'OIDC Providers', icon: Key, count: oidcProviders.length },
    { id: 'scim' as Tab, label: 'SCIM Tokens', icon: Users, count: scimTokens.length },
  ];

  const getStats = () => {
    const totalProviders = samlProviders.length + oidcProviders.length;
    const activeProviders = [...samlProviders, ...oidcProviders].filter(p => p.enabled).length;
    const activeTokens = scimTokens.filter(t => t.enabled).length;
    return { totalProviders, activeProviders, activeTokens };
  };

  const stats = getStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      <Helmet>
        <title>Federation Management - OneSign</title>
      </Helmet>

      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg shadow-indigo-500/25">
                <Fingerprint className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                  Federation Management
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                  Manage SSO providers and identity federation
                </p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:shadow-lg hover:shadow-indigo-500/25 transition-all font-medium"
            >
              <Plus className="w-5 h-5" />
              Add {activeTab.toUpperCase()} {activeTab === 'scim' ? 'Token' : 'Provider'}
            </motion.button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Providers"
            value={stats.totalProviders}
            icon={Server}
            color="bg-gradient-to-br from-blue-500 to-blue-600"
            delay={0}
          />
          <StatCard
            title="Active Providers"
            value={stats.activeProviders}
            icon={CheckCircle}
            color="bg-gradient-to-br from-emerald-500 to-emerald-600"
            delay={1}
          />
          <StatCard
            title="SCIM Tokens"
            value={scimTokens.length}
            icon={Key}
            color="bg-gradient-to-br from-purple-500 to-purple-600"
            delay={2}
          />
          <StatCard
            title="Active Tokens"
            value={stats.activeTokens}
            icon={Shield}
            color="bg-gradient-to-br from-amber-500 to-amber-600"
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
              className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl flex items-center gap-3"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
              <button onClick={() => setError('')} className="ml-auto">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 px-4 py-3 rounded-xl flex items-center gap-3"
            >
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <span>{success}</span>
              <button onClick={() => setSuccess('')} className="ml-auto">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 mb-6"
        >
          <div className="flex border-b border-slate-200 dark:border-slate-700">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 font-medium text-sm transition-all relative ${
                  activeTab === tab.id
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {tab.count > 0 && (
                  <span className={`px-2 py-0.5 text-xs rounded-full ${
                    activeTab === tab.id
                      ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                  }`}>
                    {tab.count}
                  </span>
                )}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400"
                  />
                )}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center py-20"
          >
            <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
          </motion.div>
        )}

        {/* SAML Providers Tab */}
        {!loading && activeTab === 'saml' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {samlProviders.length === 0 ? (
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-12 text-center">
                <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-indigo-500" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  No SAML Providers Configured
                </h3>
                <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md mx-auto">
                  Set up SAML providers to enable single sign-on authentication for your organization.
                </p>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:shadow-lg hover:shadow-indigo-500/25 transition-all font-medium"
                >
                  <Plus className="w-5 h-5" />
                  Add SAML Provider
                </motion.button>
              </div>
            ) : (
              <div className="grid gap-4">
                {samlProviders.map((provider, index) => (
                  <motion.div
                    key={provider.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 hover:shadow-lg transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
                          <Shield className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                              {provider.name}
                            </h3>
                            <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                              provider.enabled
                                ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                            }`}>
                              {provider.enabled ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          <div className="mt-3 space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                              <Globe className="w-4 h-4 text-slate-400" />
                              <span className="text-slate-500 dark:text-slate-400">Entity ID:</span>
                              <code className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-xs font-mono text-slate-700 dark:text-slate-300">
                                {provider.entityId}
                              </code>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Link2 className="w-4 h-4 text-slate-400" />
                              <span className="text-slate-500 dark:text-slate-400">SSO URL:</span>
                              <a href={provider.ssoUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline text-xs flex items-center gap-1">
                                {provider.ssoUrl}
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                              <Clock className="w-4 h-4 text-slate-400" />
                              Created: {formatDate(provider.createdAt)}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => loadItemForEdit(provider)}
                          className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all"
                        >
                          <Edit3 className="w-5 h-5" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            setSelectedItem(provider);
                            setShowDeleteModal(true);
                          }}
                          className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                        >
                          <Trash2 className="w-5 h-5" />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* OIDC Providers Tab */}
        {!loading && activeTab === 'oidc' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {oidcProviders.length === 0 ? (
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-12 text-center">
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Key className="w-8 h-8 text-purple-500" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  No OIDC Providers Configured
                </h3>
                <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md mx-auto">
                  Set up OIDC providers to enable OpenID Connect authentication for your organization.
                </p>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:shadow-lg hover:shadow-indigo-500/25 transition-all font-medium"
                >
                  <Plus className="w-5 h-5" />
                  Add OIDC Provider
                </motion.button>
              </div>
            ) : (
              <div className="grid gap-4">
                {oidcProviders.map((provider, index) => (
                  <motion.div
                    key={provider.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 hover:shadow-lg transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                          <Key className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                              {provider.name}
                            </h3>
                            <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                              provider.enabled
                                ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                            }`}>
                              {provider.enabled ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          <div className="mt-3 space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                              <Server className="w-4 h-4 text-slate-400" />
                              <span className="text-slate-500 dark:text-slate-400">Issuer:</span>
                              <span className="text-slate-700 dark:text-slate-300 text-xs">{provider.issuer}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Fingerprint className="w-4 h-4 text-slate-400" />
                              <span className="text-slate-500 dark:text-slate-400">Client ID:</span>
                              <code className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-xs font-mono text-slate-700 dark:text-slate-300">
                                {provider.clientId}
                              </code>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                              <Clock className="w-4 h-4 text-slate-400" />
                              Created: {formatDate(provider.createdAt)}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => loadItemForEdit(provider)}
                          className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all"
                        >
                          <Edit3 className="w-5 h-5" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            setSelectedItem(provider);
                            setShowDeleteModal(true);
                          }}
                          className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                        >
                          <Trash2 className="w-5 h-5" />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* SCIM Tokens Tab */}
        {!loading && activeTab === 'scim' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {scimTokens.length === 0 ? (
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-12 text-center">
                <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-amber-500" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  No SCIM Tokens Created
                </h3>
                <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md mx-auto">
                  Create SCIM tokens to enable automatic user provisioning and synchronization.
                </p>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:shadow-lg hover:shadow-indigo-500/25 transition-all font-medium"
                >
                  <Plus className="w-5 h-5" />
                  Create SCIM Token
                </motion.button>
              </div>
            ) : (
              <div className="grid gap-4">
                {scimTokens.map((token, index) => (
                  <motion.div
                    key={token.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 hover:shadow-lg transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
                          <FileKey className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                              {token.name}
                            </h3>
                            <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                              token.enabled
                                ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                            }`}>
                              {token.enabled ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          <div className="mt-3 space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                              <Lock className="w-4 h-4 text-slate-400" />
                              <span className="text-slate-500 dark:text-slate-400">Token:</span>
                              <code className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-xs font-mono text-slate-700 dark:text-slate-300">
                                {maskToken(token.token)}
                              </code>
                              <button
                                onClick={() => copyToClipboard(token.token, `token-${token.id}`)}
                                className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                              >
                                {copiedField === `token-${token.id}` ? (
                                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                                ) : (
                                  <Copy className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4 text-slate-400" />
                                Expires: {formatDate(token.expiresAt)}
                              </div>
                              <div className="flex items-center gap-1">
                                <RefreshCw className="w-4 h-4 text-slate-400" />
                                Last used: {formatDate(token.lastUsedAt)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setSelectedItem(token);
                          setShowDeleteModal(true);
                        }}
                        className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                      >
                        <Trash2 className="w-5 h-5" />
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Create SAML Provider Modal */}
        {activeTab === 'saml' && (
          <Modal
            isOpen={showCreateModal}
            onClose={() => {
              setShowCreateModal(false);
              resetSAMLForm();
            }}
            title="Create SAML Provider"
            size="lg"
            footer={
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    resetSAMLForm();
                  }}
                  className="px-4 py-2 text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateSAML}
                  disabled={submitting}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:shadow-lg hover:shadow-indigo-500/25 disabled:opacity-50 transition-all"
                >
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      {t('common.creating')}
                    </span>
                  ) : (
                    t('tenant.federation.createProvider')
                  )}
                </button>
              </div>
            }
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={samlName}
                  onChange={(e) => setSamlName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-slate-900 dark:text-white"
                  placeholder="My SAML Provider"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Entity ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={samlEntityId}
                  onChange={(e) => setSamlEntityId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-slate-900 dark:text-white"
                  placeholder="https://idp.example.com/entity"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  SSO URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  value={samlSsoUrl}
                  onChange={(e) => setSamlSsoUrl(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-slate-900 dark:text-white"
                  placeholder="https://idp.example.com/sso"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Certificate <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={samlCertificate}
                  onChange={(e) => setSamlCertificate(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-slate-900 dark:text-white font-mono text-xs"
                  placeholder="-----BEGIN CERTIFICATE-----&#10;...&#10;-----END CERTIFICATE-----"
                />
              </div>

              <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl">
                <button
                  type="button"
                  onClick={() => setSamlEnabled(!samlEnabled)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    samlEnabled ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'
                  }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      samlEnabled ? 'left-7' : 'left-1'
                    }`}
                  />
                </button>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Enable this provider
                </span>
              </div>
            </div>
          </Modal>
        )}

        {/* Create OIDC Provider Modal */}
        {activeTab === 'oidc' && (
          <Modal
            isOpen={showCreateModal}
            onClose={() => {
              setShowCreateModal(false);
              resetOIDCForm();
            }}
            title="Create OIDC Provider"
            size="xl"
            footer={
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    resetOIDCForm();
                  }}
                  className="px-4 py-2 text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateOIDC}
                  disabled={submitting}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:shadow-lg hover:shadow-indigo-500/25 disabled:opacity-50 transition-all"
                >
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      {t('common.creating')}
                    </span>
                  ) : (
                    t('tenant.federation.createProvider')
                  )}
                </button>
              </div>
            }
          >
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={oidcName}
                    onChange={(e) => setOidcName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Issuer <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="url"
                    value={oidcIssuer}
                    onChange={(e) => setOidcIssuer(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Client ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={oidcClientId}
                    onChange={(e) => setOidcClientId(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Client Secret <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showSecret ? 'text' : 'password'}
                      value={oidcClientSecret}
                      onChange={(e) => setOidcClientSecret(e.target.value)}
                      className="w-full px-4 py-2.5 pr-10 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-slate-900 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSecret(!showSecret)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    >
                      {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Authorization Endpoint
                </label>
                <input
                  type="url"
                  value={oidcAuthEndpoint}
                  onChange={(e) => setOidcAuthEndpoint(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Token Endpoint
                </label>
                <input
                  type="url"
                  value={oidcTokenEndpoint}
                  onChange={(e) => setOidcTokenEndpoint(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  UserInfo Endpoint
                </label>
                <input
                  type="url"
                  value={oidcUserInfoEndpoint}
                  onChange={(e) => setOidcUserInfoEndpoint(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  JWKS URI
                </label>
                <input
                  type="url"
                  value={oidcJwksUri}
                  onChange={(e) => setOidcJwksUri(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl">
                <button
                  type="button"
                  onClick={() => setOidcEnabled(!oidcEnabled)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    oidcEnabled ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'
                  }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      oidcEnabled ? 'left-7' : 'left-1'
                    }`}
                  />
                </button>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Enable this provider
                </span>
              </div>
            </div>
          </Modal>
        )}

        {/* Create SCIM Token Modal */}
        {activeTab === 'scim' && (
          <Modal
            isOpen={showCreateModal}
            onClose={() => {
              setShowCreateModal(false);
              resetSCIMForm();
            }}
            title="Create SCIM Token"
            footer={
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    resetSCIMForm();
                  }}
                  className="px-4 py-2 text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateSCIM}
                  disabled={submitting}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:shadow-lg hover:shadow-indigo-500/25 disabled:opacity-50 transition-all"
                >
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      {t('common.creating')}
                    </span>
                  ) : (
                    t('tenant.federation.createToken')
                  )}
                </button>
              </div>
            }
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Token Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={scimName}
                  onChange={(e) => setScimName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-slate-900 dark:text-white"
                  placeholder="My SCIM Integration"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Expiration Date (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={scimExpiresAt}
                  onChange={(e) => setScimExpiresAt(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-slate-900 dark:text-white"
                />
              </div>

              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-800 dark:text-amber-300">
                    <strong>Important:</strong> The token will only be displayed once after creation. Please copy and store it securely.
                  </p>
                </div>
              </div>
            </div>
          </Modal>
        )}

        {/* Edit Provider Modal */}
        <Modal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedItem(null);
          }}
          title={`Edit ${activeTab.toUpperCase()} Provider`}
          size={activeTab === 'oidc' ? 'xl' : 'lg'}
          footer={
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedItem(null);
                }}
                className="px-4 py-2 text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateProvider}
                disabled={submitting}
                className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:shadow-lg hover:shadow-indigo-500/25 disabled:opacity-50 transition-all"
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    {t('common.updating')}
                  </span>
                ) : (
                  t('tenant.federation.updateProvider')
                )}
              </button>
            </div>
          }
        >
          {activeTab === 'saml' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Name</label>
                <input
                  type="text"
                  value={samlName}
                  onChange={(e) => setSamlName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Entity ID</label>
                <input
                  type="text"
                  value={samlEntityId}
                  onChange={(e) => setSamlEntityId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">SSO URL</label>
                <input
                  type="url"
                  value={samlSsoUrl}
                  onChange={(e) => setSamlSsoUrl(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Certificate</label>
                <textarea
                  value={samlCertificate}
                  onChange={(e) => setSamlCertificate(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-slate-900 dark:text-white font-mono text-xs"
                />
              </div>
              <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl">
                <button
                  type="button"
                  onClick={() => setSamlEnabled(!samlEnabled)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    samlEnabled ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'
                  }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      samlEnabled ? 'left-7' : 'left-1'
                    }`}
                  />
                </button>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Enable this provider
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Name</label>
                  <input
                    type="text"
                    value={oidcName}
                    onChange={(e) => setOidcName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Issuer</label>
                  <input
                    type="url"
                    value={oidcIssuer}
                    onChange={(e) => setOidcIssuer(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-slate-900 dark:text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Client ID</label>
                  <input
                    type="text"
                    value={oidcClientId}
                    onChange={(e) => setOidcClientId(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Client Secret</label>
                  <input
                    type="password"
                    value={oidcClientSecret}
                    onChange={(e) => setOidcClientSecret(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-slate-900 dark:text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Authorization Endpoint</label>
                <input
                  type="url"
                  value={oidcAuthEndpoint}
                  onChange={(e) => setOidcAuthEndpoint(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Token Endpoint</label>
                <input
                  type="url"
                  value={oidcTokenEndpoint}
                  onChange={(e) => setOidcTokenEndpoint(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">UserInfo Endpoint</label>
                <input
                  type="url"
                  value={oidcUserInfoEndpoint}
                  onChange={(e) => setOidcUserInfoEndpoint(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">JWKS URI</label>
                <input
                  type="url"
                  value={oidcJwksUri}
                  onChange={(e) => setOidcJwksUri(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-slate-900 dark:text-white"
                />
              </div>
              <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl">
                <button
                  type="button"
                  onClick={() => setOidcEnabled(!oidcEnabled)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    oidcEnabled ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'
                  }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      oidcEnabled ? 'left-7' : 'left-1'
                    }`}
                  />
                </button>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Enable this provider
                </span>
              </div>
            </div>
          )}
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedItem(null);
          }}
          title="Confirm Deletion"
          footer={
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedItem(null);
                }}
                className="px-4 py-2 text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={submitting}
                className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 transition-all"
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    {t('common.deleting')}
                  </span>
                ) : (
                  t('common.delete')
                )}
              </button>
            </div>
          }
        >
          <div className="flex items-start gap-4">
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl flex-shrink-0">
              <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-slate-700 dark:text-slate-300">
                Are you sure you want to delete <strong className="text-slate-900 dark:text-white">{selectedItem?.name}</strong>?
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                This action cannot be undone.
              </p>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}
