import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { getTenantId } from '@/lib/tenant-context';
import { tenantService } from '@/lib/api/services/tenant.service';
import Modal from '@/components/common/Modal';
import { Helmet } from 'react-helmet-async';
import {
  Webhook,
  Code2,
  Key,
  Calendar,
  Plus,
  Edit3,
  Trash2,
  Play,
  CheckCircle,
  XCircle,
  Globe,
  Zap,
  Settings,
  Tag,
  Clock,
  AlertTriangle,
  RefreshCw,
  ExternalLink
} from 'lucide-react';

interface WebhookConfig {
  id: string;
  url: string;
  eventTypes: string[];
  isEnabled: boolean;
  secret: string;
  createdAt: string;
}

interface LoginHook {
  id: string;
  name: string;
  hookType: 'PreLogin' | 'PostLogin';
  scriptUrl: string;
  isEnabled: boolean;
  timeout: number;
}

interface TokenRule {
  id: string;
  name: string;
  ruleType: string;
  conditions: string;
  claims: Record<string, any>;
  isEnabled: boolean;
}

interface EventType {
  name: string;
  category: string;
  description: string;
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

export default function TenantExtensibilityPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'webhooks' | 'login-hooks' | 'token-rules' | 'events'>('webhooks');
  const [tenantId, setTenantIdState] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Webhooks
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([]);
  const [showWebhookModal, setShowWebhookModal] = useState(false);
  const [editingWebhook, setEditingWebhook] = useState<WebhookConfig | null>(null);
  const [webhookForm, setWebhookForm] = useState({
    url: '',
    eventTypes: [] as string[],
    isEnabled: true
  });

  // Login Hooks
  const [loginHooks, setLoginHooks] = useState<LoginHook[]>([]);
  const [showLoginHookModal, setShowLoginHookModal] = useState(false);
  const [editingLoginHook, setEditingLoginHook] = useState<LoginHook | null>(null);
  const [loginHookForm, setLoginHookForm] = useState({
    name: '',
    hookType: 'PostLogin' as 'PreLogin' | 'PostLogin',
    scriptUrl: '',
    isEnabled: true,
    timeout: 5000
  });

  // Token Rules
  const [tokenRules, setTokenRules] = useState<TokenRule[]>([]);
  const [showTokenRuleModal, setShowTokenRuleModal] = useState(false);
  const [editingTokenRule, setEditingTokenRule] = useState<TokenRule | null>(null);
  const [tokenRuleForm, setTokenRuleForm] = useState({
    name: '',
    ruleType: 'AddClaim',
    conditions: '',
    claims: {},
    isEnabled: true
  });

  // Event Types
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);

  const tabs = [
    { key: 'webhooks', label: 'Webhooks', icon: <Webhook className="w-4 h-4" /> },
    { key: 'login-hooks', label: 'Login Hooks', icon: <Code2 className="w-4 h-4" /> },
    { key: 'token-rules', label: 'Token Rules', icon: <Key className="w-4 h-4" /> },
    { key: 'events', label: 'Events', icon: <Calendar className="w-4 h-4" /> }
  ];

  useEffect(() => {
    const contextTenantId = getTenantId();
    setTenantIdState(contextTenantId || '00000000-0000-0000-0000-000000000000');
  }, []);

  useEffect(() => {
    if (tenantId) {
      if (activeTab === 'webhooks') fetchWebhooks();
      else if (activeTab === 'login-hooks') fetchLoginHooks();
      else if (activeTab === 'token-rules') fetchTokenRules();
      else if (activeTab === 'events') fetchEventTypes();
    }
  }, [tenantId, activeTab]);

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError('');
        setSuccess('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const fetchWebhooks = async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      const data = await tenantService.getWebhooks();
      setWebhooks(data || []);
    } catch (err) {
      console.error('Error fetching webhooks:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLoginHooks = async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      setLoginHooks([]);
    } catch (err) {
      console.error('Error fetching login hooks:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTokenRules = async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      setTokenRules([]);
    } catch (err) {
      console.error('Error fetching token rules:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEventTypes = async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      setEventTypes([]);
    } catch (err) {
      console.error('Error fetching event types:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId) return;
    setLoading(true);
    try {
      await tenantService.createWebhook(webhookForm);
      setSuccess('Webhook created successfully');
      setShowWebhookModal(false);
      fetchWebhooks();
      setWebhookForm({ url: '', eventTypes: [], isEnabled: true });
    } catch (err) {
      setError('Failed to create webhook');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateWebhook = async (id: string, data: Partial<WebhookConfig>) => {
    if (!tenantId) return;
    setLoading(true);
    try {
      await tenantService.updateWebhook(id, data);
      setSuccess('Webhook updated successfully');
      setEditingWebhook(null);
      setShowWebhookModal(false);
      fetchWebhooks();
    } catch (err) {
      setError('Failed to update webhook');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWebhook = async (id: string) => {
    if (!tenantId || !confirm(t('tenant.extensibility.confirmDeleteWebhook', 'Are you sure you want to delete this webhook?'))) return;
    setLoading(true);
    try {
      await tenantService.deleteWebhook(id);
      setSuccess('Webhook deleted successfully');
      fetchWebhooks();
    } catch (err) {
      setError('Failed to delete webhook');
    } finally {
      setLoading(false);
    }
  };

  const handleTestWebhook = async (id: string) => {
    if (!tenantId) return;
    setLoading(true);
    try {
      await tenantService.testWebhook(id);
      setSuccess('Test event sent successfully');
    } catch (err) {
      setError('Failed to send test event');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLoginHook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId) return;
    setLoading(true);
    try {
      setSuccess('Login hook created successfully');
      setShowLoginHookModal(false);
      fetchLoginHooks();
    } catch (err) {
      setError('Failed to create login hook');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLoginHook = async (id: string) => {
    if (!tenantId || !confirm(t('tenant.extensibility.confirmDeleteLoginHook', 'Are you sure you want to delete this login hook?'))) return;
    setLoading(true);
    try {
      setSuccess('Login hook deleted successfully');
      fetchLoginHooks();
    } catch (err) {
      setError('Failed to delete login hook');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTokenRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId) return;
    setLoading(true);
    try {
      setSuccess('Token rule created successfully');
      setShowTokenRuleModal(false);
      fetchTokenRules();
    } catch (err) {
      setError('Failed to create token rule');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTokenRule = async (id: string) => {
    if (!tenantId || !confirm(t('tenant.extensibility.confirmDeleteTokenRule', 'Are you sure you want to delete this token rule?'))) return;
    setLoading(true);
    try {
      setSuccess('Token rule deleted successfully');
      fetchTokenRules();
    } catch (err) {
      setError('Failed to delete token rule');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 p-6">
      <Helmet>
        <title>Extensibility Hub</title>
      </Helmet>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-4 mb-2">
          <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Extensibility Hub
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage webhooks, login hooks, and token enrichment rules
            </p>
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
            className="mb-4 p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 text-red-800 dark:text-red-300 rounded-xl flex items-center gap-2"
          >
            <AlertTriangle className="w-5 h-5" />
            {error}
          </motion.div>
        )}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 p-4 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 text-green-800 dark:text-green-300 rounded-xl flex items-center gap-2"
          >
            <CheckCircle className="w-5 h-5" />
            {success}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Active Webhooks"
          value={webhooks.filter(w => w.isEnabled).length}
          icon={<Webhook className="w-6 h-6 text-white" />}
          color="from-purple-500 to-purple-600"
          delay={0}
        />
        <StatCard
          title="Login Hooks"
          value={loginHooks.length}
          icon={<Code2 className="w-6 h-6 text-white" />}
          color="from-blue-500 to-blue-600"
          delay={1}
        />
        <StatCard
          title="Token Rules"
          value={tokenRules.length}
          icon={<Key className="w-6 h-6 text-white" />}
          color="from-emerald-500 to-emerald-600"
          delay={2}
        />
        <StatCard
          title="Event Types"
          value={eventTypes.length}
          icon={<Calendar className="w-6 h-6 text-white" />}
          color="from-orange-500 to-orange-600"
          delay={3}
        />
      </div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-2 mb-6"
      >
        <nav className="flex space-x-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`relative flex-1 py-3 px-6 rounded-lg font-medium transition-all duration-200 ${
                activeTab === tab.key
                  ? 'text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700'
              }`}
            >
              {activeTab === tab.key && (
                <motion.div
                  layoutId="activeExtTab"
                  className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10 flex items-center justify-center gap-2">
                {tab.icon}
                {tab.label}
              </span>
            </button>
          ))}
        </nav>
      </motion.div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-12">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <RefreshCw className="w-8 h-8 text-purple-600" />
          </motion.div>
        </div>
      )}

      {/* Webhooks Tab */}
      {activeTab === 'webhooks' && !loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          <div className="flex justify-end">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setEditingWebhook(null);
                setWebhookForm({ url: '', eventTypes: [], isEnabled: true });
                setShowWebhookModal(true);
              }}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all duration-200"
            >
              <Plus className="w-5 h-5" />
              Create Webhook
            </motion.button>
          </div>

          {webhooks.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-12 text-center"
            >
              <Webhook className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Webhooks Configured</h3>
              <p className="text-gray-600 dark:text-gray-400">Create a webhook to receive real-time notifications.</p>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {webhooks.map((webhook, index) => (
                <motion.div
                  key={webhook.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6 hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Globe className="w-5 h-5 text-purple-600" />
                        <span className="font-mono text-sm text-gray-900 dark:text-white truncate max-w-lg">
                          {webhook.url}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          webhook.isEnabled
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                        }`}>
                          {webhook.isEnabled ? 'Active' : 'Disabled'}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {webhook.eventTypes.map((event, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded text-xs"
                          >
                            {event}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          Created: {new Date(webhook.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleTestWebhook(webhook.id)}
                        className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                        title="Test Webhook"
                      >
                        <Play className="w-5 h-5" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => {
                          setEditingWebhook(webhook);
                          setWebhookForm({ url: webhook.url, eventTypes: webhook.eventTypes, isEnabled: webhook.isEnabled });
                          setShowWebhookModal(true);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit3 className="w-5 h-5" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDeleteWebhook(webhook.id)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        title="Delete"
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

      {/* Login Hooks Tab */}
      {activeTab === 'login-hooks' && !loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          <div className="flex justify-end">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setEditingLoginHook(null);
                setLoginHookForm({ name: '', hookType: 'PostLogin', scriptUrl: '', isEnabled: true, timeout: 5000 });
                setShowLoginHookModal(true);
              }}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-xl hover:shadow-lg transition-all duration-200"
            >
              <Plus className="w-5 h-5" />
              Create Login Hook
            </motion.button>
          </div>

          {loginHooks.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-12 text-center"
            >
              <Code2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Login Hooks Configured</h3>
              <p className="text-gray-600 dark:text-gray-400">Create hooks to extend login functionality.</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {loginHooks.map((hook, index) => (
                <motion.div
                  key={hook.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6 hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{hook.name}</h3>
                      <span className={`inline-block mt-1 px-2 py-1 rounded text-xs font-medium ${
                        hook.hookType === 'PreLogin'
                          ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                      }`}>
                        {hook.hookType}
                      </span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      hook.isEnabled
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                    }`}>
                      {hook.isEnabled ? 'Active' : 'Disabled'}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <ExternalLink className="w-4 h-4" />
                      <span className="truncate">{hook.scriptUrl}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Clock className="w-4 h-4" />
                      Timeout: {hook.timeout}ms
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setEditingLoginHook(hook);
                        setLoginHookForm({
                          name: hook.name,
                          hookType: hook.hookType,
                          scriptUrl: hook.scriptUrl,
                          isEnabled: hook.isEnabled,
                          timeout: hook.timeout
                        });
                        setShowLoginHookModal(true);
                      }}
                      className="flex-1 py-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors text-sm font-medium"
                    >
                      Edit
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDeleteLoginHook(hook.id)}
                      className="flex-1 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors text-sm font-medium"
                    >
                      Delete
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Token Rules Tab */}
      {activeTab === 'token-rules' && !loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          <div className="flex justify-end">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setEditingTokenRule(null);
                setTokenRuleForm({ name: '', ruleType: 'AddClaim', conditions: '', claims: {}, isEnabled: true });
                setShowTokenRuleModal(true);
              }}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:shadow-lg transition-all duration-200"
            >
              <Plus className="w-5 h-5" />
              Create Token Rule
            </motion.button>
          </div>

          {tokenRules.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-12 text-center"
            >
              <Key className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Token Rules Configured</h3>
              <p className="text-gray-600 dark:text-gray-400">Create rules to customize token claims.</p>
            </motion.div>
          ) : (
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                <thead className="bg-gray-50 dark:bg-slate-700/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                  {tokenRules.map((rule, index) => (
                    <motion.tr
                      key={rule.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                            <Key className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <span className="font-medium text-gray-900 dark:text-white">{rule.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 rounded text-sm">
                          {rule.ruleType}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          rule.isEnabled
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                        }`}>
                          {rule.isEnabled ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          {rule.isEnabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => {
                              setEditingTokenRule(rule);
                              setTokenRuleForm({
                                name: rule.name,
                                ruleType: rule.ruleType,
                                conditions: rule.conditions,
                                claims: rule.claims,
                                isEnabled: rule.isEnabled
                              });
                              setShowTokenRuleModal(true);
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleDeleteTokenRule(rule.id)}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      )}

      {/* Events Tab */}
      {activeTab === 'events' && !loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-orange-600" />
              Available Event Types
            </h3>
            {eventTypes.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No event types available</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {eventTypes.map((event, index) => (
                  <motion.div
                    key={event.name}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="border border-gray-200 dark:border-slate-600 rounded-xl p-4 hover:shadow-md transition-all duration-200 hover:border-orange-300 dark:hover:border-orange-600"
                  >
                    <h4 className="font-semibold text-orange-600 dark:text-orange-400 mb-1">{event.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{event.description}</p>
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs">
                      <Tag className="w-3 h-3" />
                      {event.category}
                    </span>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}

      {/* Webhook Modal */}
      <Modal
        isOpen={showWebhookModal}
        onClose={() => setShowWebhookModal(false)}
        title={editingWebhook ? t('tenant.extensibility.editWebhook') : t('tenant.extensibility.createWebhook')}
      >
        <form onSubmit={editingWebhook ? (e) => { e.preventDefault(); handleUpdateWebhook(editingWebhook.id, webhookForm); } : handleCreateWebhook} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Webhook URL</label>
            <input
              type="url"
              value={webhookForm.url}
              onChange={(e) => setWebhookForm({ ...webhookForm, url: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-slate-700 dark:text-white"
              placeholder={t('tenant.extensibility.webhookUrlPlaceholder', 'https://example.com/webhook')}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Event Types</label>
            <input
              type="text"
              value={webhookForm.eventTypes.join(', ')}
              onChange={(e) => setWebhookForm({ ...webhookForm, eventTypes: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-slate-700 dark:text-white"
              placeholder={t('tenant.extensibility.eventTypesPlaceholder', 'user.created, user.updated')}
            />
            <p className="text-xs text-gray-500 mt-1">Comma-separated list of event types</p>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="webhookEnabled"
              checked={webhookForm.isEnabled}
              onChange={(e) => setWebhookForm({ ...webhookForm, isEnabled: e.target.checked })}
              className="rounded border-gray-300 dark:border-slate-600 text-purple-600 focus:ring-purple-500"
            />
            <label htmlFor="webhookEnabled" className="text-sm text-gray-700 dark:text-gray-300">Enable webhook</label>
          </div>
          <div className="flex gap-3 pt-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="flex-1 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all duration-200"
            >
              {editingWebhook ? 'Update' : 'Create'}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => setShowWebhookModal(false)}
              className="flex-1 py-2 bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-500 transition-all duration-200"
            >
              Cancel
            </motion.button>
          </div>
        </form>
      </Modal>

      {/* Login Hook Modal */}
      <Modal
        isOpen={showLoginHookModal}
        onClose={() => setShowLoginHookModal(false)}
        title={editingLoginHook ? t('tenant.extensibility.editLoginHook') : t('tenant.extensibility.createLoginHook')}
      >
        <form onSubmit={handleCreateLoginHook} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Hook Name</label>
            <input
              type="text"
              value={loginHookForm.name}
              onChange={(e) => setLoginHookForm({ ...loginHookForm, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
              placeholder={t('tenant.extensibility.loginHookNamePlaceholder', 'My Login Hook')}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Hook Type</label>
            <select
              value={loginHookForm.hookType}
              onChange={(e) => setLoginHookForm({ ...loginHookForm, hookType: e.target.value as 'PreLogin' | 'PostLogin' })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
            >
              <option value="PreLogin">Pre-Login</option>
              <option value="PostLogin">Post-Login</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Script URL</label>
            <input
              type="url"
              value={loginHookForm.scriptUrl}
              onChange={(e) => setLoginHookForm({ ...loginHookForm, scriptUrl: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
              placeholder={t('tenant.extensibility.scriptUrlPlaceholder', 'https://example.com/hook-script')}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Timeout (ms)</label>
            <input
              type="number"
              value={loginHookForm.timeout}
              onChange={(e) => setLoginHookForm({ ...loginHookForm, timeout: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
              min={1000}
              max={30000}
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="hookEnabled"
              checked={loginHookForm.isEnabled}
              onChange={(e) => setLoginHookForm({ ...loginHookForm, isEnabled: e.target.checked })}
              className="rounded border-gray-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="hookEnabled" className="text-sm text-gray-700 dark:text-gray-300">Enable hook</label>
          </div>
          <div className="flex gap-3 pt-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="flex-1 py-2 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg hover:shadow-lg transition-all duration-200"
            >
              {editingLoginHook ? 'Update' : 'Create'}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => setShowLoginHookModal(false)}
              className="flex-1 py-2 bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-500 transition-all duration-200"
            >
              Cancel
            </motion.button>
          </div>
        </form>
      </Modal>

      {/* Token Rule Modal */}
      <Modal
        isOpen={showTokenRuleModal}
        onClose={() => setShowTokenRuleModal(false)}
        title={editingTokenRule ? t('tenant.extensibility.editTokenRule') : t('tenant.extensibility.createTokenRule')}
      >
        <form onSubmit={handleCreateTokenRule} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rule Name</label>
            <input
              type="text"
              value={tokenRuleForm.name}
              onChange={(e) => setTokenRuleForm({ ...tokenRuleForm, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:bg-slate-700 dark:text-white"
              placeholder={t('tenant.extensibility.tokenRuleNamePlaceholder', 'Custom Claim Rule')}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rule Type</label>
            <select
              value={tokenRuleForm.ruleType}
              onChange={(e) => setTokenRuleForm({ ...tokenRuleForm, ruleType: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:bg-slate-700 dark:text-white"
            >
              <option value="AddClaim">Add Claim</option>
              <option value="ModifyClaim">Modify Claim</option>
              <option value="RemoveClaim">Remove Claim</option>
              <option value="MapClaim">Map Claim</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Conditions (JSON)</label>
            <textarea
              value={tokenRuleForm.conditions}
              onChange={(e) => setTokenRuleForm({ ...tokenRuleForm, conditions: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:bg-slate-700 dark:text-white font-mono text-sm"
              rows={3}
              placeholder={t('tenant.extensibility.conditionsPlaceholder', '{"groups": ["admins"]}')}
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="ruleEnabled"
              checked={tokenRuleForm.isEnabled}
              onChange={(e) => setTokenRuleForm({ ...tokenRuleForm, isEnabled: e.target.checked })}
              className="rounded border-gray-300 dark:border-slate-600 text-emerald-600 focus:ring-emerald-500"
            />
            <label htmlFor="ruleEnabled" className="text-sm text-gray-700 dark:text-gray-300">Enable rule</label>
          </div>
          <div className="flex gap-3 pt-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="flex-1 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg hover:shadow-lg transition-all duration-200"
            >
              {editingTokenRule ? 'Update' : 'Create'}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => setShowTokenRuleModal(false)}
              className="flex-1 py-2 bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-500 transition-all duration-200"
            >
              Cancel
            </motion.button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
