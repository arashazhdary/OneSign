import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocale } from '@/hooks/useLocale';
import { getTenantId } from '@/lib/tenant-context';
import {
  getNotificationTemplates,
  getNotifications,
  createNotificationTemplate,
  updateNotificationTemplate,
  deleteNotificationTemplate,
  sendNotification,
  getNotificationChannels,
  createNotificationChannel,
  updateNotificationChannel,
  deleteNotificationChannel,
  getNotificationPreferences,
  updateNotificationPreference,
  getNotificationStats,
  retryNotification,
  getNotificationRules,
  getNotificationRule,
  createNotificationRule,
  updateNotificationRule,
  deleteNotificationRule,
  toggleNotificationRule,
  NotificationTemplateDto,
  NotificationChannelDto,
  NotificationPreferenceDto,
  NotificationRuleDto,
  NOTIFICATION_TYPES,
  NOTIFICATION_CATEGORIES,
  getStatusColor,
  getPriorityColor,
} from '@/lib/api/notifications';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  Settings,
  FileText,
  History,
  Zap,
  Plus,
  Mail,
  MessageSquare,
  Smartphone,
  Webhook,
  Send,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Search,
  Eye,
  Edit,
  Trash2,
  X,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ToggleLeft,
  ToggleRight,
  Clock,
  Filter,
  BarChart3,
} from 'lucide-react';

// Type definitions for missing types
type NotificationType = 'Email' | 'SMS' | 'Push' | 'InApp' | 'Webhook';
type NotificationCategory = 'System' | 'Security' | 'User' | 'Admin' | 'Custom';
type NotificationPriority = 'Low' | 'Medium' | 'High' | 'Critical';
type NotificationStatus = 'Pending' | 'Sent' | 'Delivered' | 'Failed' | 'Bounced';
type CreateNotificationRuleDto = any;
type NotificationDto = any;
type NotificationStatsDto = any;

type TabType = 'settings' | 'templates' | 'history' | 'rules';

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
    className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300"
  >
    <div className="flex items-center gap-4">
      <div className={`p-3 rounded-xl ${color}`}>{icon}</div>
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  </motion.div>
);

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'Email':
      return <Mail className="w-4 h-4" />;
    case 'SMS':
      return <MessageSquare className="w-4 h-4" />;
    case 'Push':
      return <Smartphone className="w-4 h-4" />;
    case 'InApp':
      return <Bell className="w-4 h-4" />;
    case 'Webhook':
      return <Webhook className="w-4 h-4" />;
    default:
      return <Send className="w-4 h-4" />;
  }
};

// Fallback mock data for rules if API is not available
const mockRules: any[] = [
  {
    id: '1',
    tenantId: '00000000-0000-0000-0000-000000000000',
    name: 'Failed Login Alert',
    description: 'Notify admin on 3 failed login attempts',
    eventType: 'FailedLogin',
    conditions: ['attemptCount >= 3'],
    notificationType: 'Email',
    isActive: true,
    createdAt: new Date().toISOString(),
    createdBy: 'system',
  },
  {
    id: '2',
    tenantId: '00000000-0000-0000-0000-000000000000',
    name: 'New User Registration',
    description: 'Send welcome notification to new users',
    eventType: 'UserRegistered',
    conditions: [],
    notificationType: 'Email',
    templateId: 'welcome-template',
    isActive: true,
    createdAt: new Date().toISOString(),
    createdBy: 'system',
  },
];

export default function TenantNotificationsPage() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language;
  const [tenantId, setTenantIdState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('settings');

  // Settings Tab State
  const [channels, setChannels] = useState<NotificationChannelDto[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferenceDto[]>([]);
  const [showChannelModal, setShowChannelModal] = useState(false);
  const [editingChannel, setEditingChannel] = useState<NotificationChannelDto | null>(null);
  const [channelType, setChannelType] = useState<NotificationType>('Email');
  const [channelName, setChannelName] = useState('');
  const [channelConfig, setChannelConfig] = useState('');
  const [channelEnabled, setChannelEnabled] = useState(true);

  // Templates Tab State
  const [templates, setTemplates] = useState<NotificationTemplateDto[]>([]);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<NotificationTemplateDto | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<NotificationTemplateDto | null>(null);
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [templateCategory, setTemplateCategory] = useState<NotificationCategory>('Custom');
  const [templateType, setTemplateType] = useState<NotificationType>('Email');
  const [templateSubject, setTemplateSubject] = useState('');
  const [templateBody, setTemplateBody] = useState('');
  const [templateHtml, setTemplateHtml] = useState('');
  const [templateVariables, setTemplateVariables] = useState('');
  const [templateActive, setTemplateActive] = useState(true);

  // History Tab State
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);
  const [stats, setStats] = useState<NotificationStatsDto | null>(null);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyPageSize] = useState(20);
  const [historyTotalPages, setHistoryTotalPages] = useState(1);
  const [historyStatusFilter, setHistoryStatusFilter] = useState<NotificationStatus | ''>('');
  const [historyTypeFilter, setHistoryTypeFilter] = useState<NotificationType | ''>('');
  const [historyCategoryFilter, setHistoryCategoryFilter] = useState<NotificationCategory | ''>('');
  const [selectedNotification, setSelectedNotification] = useState<NotificationDto | null>(null);

  // Rules Tab State
  const [rules, setRules] = useState<any[]>([]);
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [editingRule, setEditingRule] = useState<any | null>(null);
  const [ruleName, setRuleName] = useState('');
  const [ruleDescription, setRuleDescription] = useState('');
  const [ruleEventType, setRuleEventType] = useState('');
  const [ruleNotificationType, setRuleNotificationType] = useState<NotificationType>('Email');
  const [ruleTemplateId, setRuleTemplateId] = useState('');
  const [ruleActive, setRuleActive] = useState(true);

  useEffect(() => {
    const contextTenantId = getTenantId();
    setTenantIdState(contextTenantId || '00000000-0000-0000-0000-000000000000');
  }, []);

  useEffect(() => {
    if (tenantId) {
      loadTabData();
    }
  }, [tenantId, activeTab]);

  const loadTabData = async () => {
    setLoading(true);
    try {
      switch (activeTab) {
        case 'settings':
          await Promise.all([fetchChannels(), fetchPreferences()]);
          break;
        case 'templates':
          await fetchTemplates();
          break;
        case 'history':
          await Promise.all([fetchNotifications(), fetchStats()]);
          break;
        case 'rules':
          await fetchRules();
          break;
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError(t('common.failedToLoadData'));
    } finally {
      setLoading(false);
    }
  };

  // Settings Tab Functions
  const fetchChannels = async () => {
    if (!tenantId) return;
    try {
      const data = await getNotificationChannels();
      setChannels(data);
    } catch (err) {
      console.error('Error fetching channels:', err);
    }
  };

  const fetchPreferences = async () => {
    if (!tenantId) return;
    try {
      const userId = '00000000-0000-0000-0000-000000000001';
      const data = await getNotificationPreferences(userId);
      setPreferences(data);
    } catch (err) {
      console.error('Error fetching preferences:', err);
    }
  };

  const handleSaveChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!tenantId) return;

    try {
      let config: Record<string, any> = {};
      if (channelConfig) {
        try {
          config = JSON.parse(channelConfig);
        } catch {
          config = { value: channelConfig };
        }
      }

      const channelData = {
        tenantId,
        userId: '00000000-0000-0000-0000-000000000001',
        type: channelType,
        name: channelName,
        configuration: config,
      };

      if (editingChannel) {
        await updateNotificationChannel(editingChannel.id, channelData as any);
        setSuccess(t('tenant.notifications.channelUpdated', 'Channel updated successfully'));
      } else {
        await createNotificationChannel(channelData as any);
        setSuccess(t('tenant.notifications.channelCreated', 'Channel created successfully'));
      }

      setShowChannelModal(false);
      resetChannelForm();
      fetchChannels();
    } catch (err: any) {
      setError(err.message || t('common.failedToSaveChannel'));
    }
  };

  const handleDeleteChannel = async (channelId: string) => {
    if (!tenantId || !confirm(t('common.confirmDelete'))) return;

    setError('');
    setSuccess('');
    try {
      await deleteNotificationChannel(channelId);
      setSuccess(t('tenant.notifications.channelDeleted', 'Channel deleted successfully'));
      fetchChannels();
    } catch (err: any) {
      setError(err.message || t('common.failedToDeleteChannel'));
    }
  };

  const resetChannelForm = () => {
    setEditingChannel(null);
    setChannelName('');
    setChannelType('Email');
    setChannelConfig('');
    setChannelEnabled(true);
  };

  const openEditChannel = (channel: NotificationChannelDto) => {
    setEditingChannel(channel);
    setChannelName(channel.name);
    setChannelType(channel.type as any);
    setChannelConfig(JSON.stringify((channel as any).configuration, null, 2));
    setChannelEnabled((channel as any).isEnabled || true);
    setShowChannelModal(true);
  };

  // Templates Tab Functions
  const fetchTemplates = async () => {
    if (!tenantId) return;
    try {
      const data = await getNotificationTemplates();
      setTemplates(data);
    } catch (err) {
      console.error('Error fetching templates:', err);
    }
  };

  const handleSaveTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!tenantId) return;

    try {
      const variables = templateVariables.split(',').map(v => v.trim()).filter(v => v);
      const templateData = {
        tenantId,
        userId: '00000000-0000-0000-0000-000000000001',
        name: templateName,
        description: templateDescription,
        category: templateCategory,
        type: templateType,
        subjectTemplate: templateSubject,
        bodyTemplate: templateBody,
        htmlTemplate: templateHtml || undefined,
        variables,
        isActive: templateActive,
      };

      if (editingTemplate) {
        await updateNotificationTemplate(editingTemplate.id, templateData);
        setSuccess(t('tenant.notifications.templateUpdated', 'Template updated successfully'));
      } else {
        await createNotificationTemplate(templateData);
        setSuccess(t('tenant.notifications.templateCreated', 'Template created successfully'));
      }

      setShowTemplateModal(false);
      resetTemplateForm();
      fetchTemplates();
    } catch (err: any) {
      setError(err.message || t('common.failedToSaveTemplate'));
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!tenantId || !confirm(t('common.confirmDelete'))) return;

    setError('');
    setSuccess('');
    try {
      await deleteNotificationTemplate(templateId);
      setSuccess(t('tenant.notifications.templateDeleted', 'Template deleted successfully'));
      fetchTemplates();
    } catch (err: any) {
      setError(err.message || t('common.failedToDeleteTemplate'));
    }
  };

  const resetTemplateForm = () => {
    setEditingTemplate(null);
    setTemplateName('');
    setTemplateDescription('');
    setTemplateCategory('Custom');
    setTemplateType('Email');
    setTemplateSubject('');
    setTemplateBody('');
    setTemplateHtml('');
    setTemplateVariables('');
    setTemplateActive(true);
  };

  const openEditTemplate = (template: NotificationTemplateDto) => {
    setEditingTemplate(template);
    setTemplateName(template.name);
    setTemplateDescription((template as any).description || '');
    setTemplateCategory((template as any).category || 'Custom');
    setTemplateType(template.type as any);
    setTemplateSubject((template as any).subjectTemplate || '');
    setTemplateBody((template as any).bodyTemplate || '');
    setTemplateHtml((template as any).htmlTemplate || '');
    setTemplateVariables((template.variables || []).join(', '));
    setTemplateActive(template.isActive);
    setShowTemplateModal(true);
  };

  // History Tab Functions
  const fetchNotifications = async () => {
    if (!tenantId) return;
    try {
      const params: any = {
        page: historyPage,
        pageSize: historyPageSize,
      };
      if (historyStatusFilter) params.status = historyStatusFilter;
      if (historyTypeFilter) params.type = historyTypeFilter;
      if (historyCategoryFilter) params.category = historyCategoryFilter;

      const data = await getNotifications(params);
      setNotifications(data.items || []);
      setHistoryTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  const fetchStats = async () => {
    if (!tenantId) return;
    try {
      const data = await getNotificationStats();
      setStats(data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  // Rules Tab Functions
  const fetchRules = async () => {
    if (!tenantId) return;
    try {
      const data = await getNotificationRules();
      setRules(data || mockRules);
    } catch (err) {
      console.error('Error fetching notification rules:', err);
      setRules(mockRules);
    }
  };

  const handleRetryNotification = async (notificationId: string) => {
    if (!tenantId) return;
    setError('');
    setSuccess('');
    try {
      await retryNotification(notificationId);
      setSuccess(t('tenant.notifications.retryInitiated', 'Notification retry initiated'));
      fetchNotifications();
    } catch (err: any) {
      setError(err.message || t('common.failedToRetryNotification'));
    }
  };

  const handleSaveRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId) return;

    setError('');
    setSuccess('');

    try {
      const ruleData: CreateNotificationRuleDto = {
        tenantId,
        userId: '00000000-0000-0000-0000-000000000001',
        name: ruleName,
        description: ruleDescription,
        eventType: ruleEventType,
        conditions: [],
        notificationType: ruleNotificationType,
        templateId: ruleTemplateId || undefined,
        isActive: ruleActive,
      };

      if (editingRule) {
        await updateNotificationRule(editingRule.id, ruleData);
        setSuccess(t('tenant.notifications.ruleUpdated', 'Rule updated successfully'));
      } else {
        await createNotificationRule(ruleData);
        setSuccess(t('tenant.notifications.ruleCreated', 'Rule created successfully'));
      }

      setShowRuleModal(false);
      resetRuleForm();
      fetchRules();
    } catch (err: any) {
      console.error('Error saving rule:', err);
      setError(err?.message || t('common.failedToSaveRule'));
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    if (!tenantId || !confirm(t('common.confirmDeleteRule'))) return;

    setError('');
    setSuccess('');
    try {
      await deleteNotificationRule(ruleId);
      setSuccess(t('tenant.notifications.ruleDeleted', 'Rule deleted successfully'));
      fetchRules();
    } catch (err: any) {
      console.error('Error deleting rule:', err);
      setError(err?.message || t('common.failedToDeleteRule'));
    }
  };

  const handleToggleRule = async (ruleId: string) => {
    if (!tenantId) return;

    setError('');
    try {
      await toggleNotificationRule(ruleId);
      fetchRules();
    } catch (err: any) {
      console.error('Error toggling rule:', err);
      setError(err?.message || t('common.failedToToggleRuleStatus'));
    }
  };

  const resetRuleForm = () => {
    setEditingRule(null);
    setRuleName('');
    setRuleDescription('');
    setRuleEventType('');
    setRuleNotificationType('Email');
    setRuleTemplateId('');
    setRuleActive(true);
  };

  const openEditRule = (rule: any) => {
    setEditingRule(rule);
    setRuleName(rule.name);
    setRuleDescription(rule.description);
    setRuleEventType(rule.eventType);
    setRuleNotificationType(rule.notificationType);
    setRuleTemplateId(rule.templateId || '');
    setRuleActive(rule.isActive);
    setShowRuleModal(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString(locale === 'fa' ? 'fa-IR' : 'en-US');
  };

  const getStatusBadgeStyles = (status: NotificationStatus) => {
    const styles: Record<string, string> = {
      Pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      Sent: 'bg-blue-100 text-blue-800 border-blue-200',
      Delivered: 'bg-green-100 text-green-800 border-green-200',
      Failed: 'bg-red-100 text-red-800 border-red-200',
      Bounced: 'bg-orange-100 text-orange-800 border-orange-200',
    };
    return styles[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getPriorityBadgeStyles = (priority: NotificationPriority) => {
    const styles: Record<string, string> = {
      Low: 'bg-gray-100 text-gray-800 border-gray-200',
      Medium: 'bg-blue-100 text-blue-800 border-blue-200',
      High: 'bg-orange-100 text-orange-800 border-orange-200',
      Critical: 'bg-red-100 text-red-800 border-red-200',
    };
    return styles[priority] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const tabs = [
    { id: 'settings', label: t('tenant.notifications.settings', 'Settings'), icon: Settings },
    { id: 'templates', label: t('tenant.notifications.templates', 'Templates'), icon: FileText },
    { id: 'history', label: t('tenant.notifications.history', 'History'), icon: History },
    { id: 'rules', label: t('tenant.notifications.rules', 'Rules'), icon: Zap },
  ];

  if (loading && activeTab === 'settings' && channels.length === 0) {
    return (
      <div dir={locale === 'fa' ? 'rtl' : 'ltr'} className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-3 text-gray-600"
        >
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span>{t('common.loading', 'Loading...')}</span>
        </motion.div>
      </div>
    );
  }

  return (
    <div dir={locale === 'fa' ? 'rtl' : 'ltr'} className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8">
      <Helmet>
        <title>{t('tenant.notifications.title', 'Notifications')} | OneSign</title>
      </Helmet>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          {t('tenant.notifications.title', 'Notifications')}
        </h1>
        <p className="text-gray-600 mt-1">
          {t('tenant.notifications.subtitle', 'Configure notification channels, templates, and delivery rules')}
        </p>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-2 mb-6"
      >
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Alerts */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2"
          >
            <AlertTriangle className="w-5 h-5" />
            {error}
            <button onClick={() => setError('')} className="ms-auto">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-center gap-2"
          >
            <CheckCircle className="w-5 h-5" />
            {success}
            <button onClick={() => setSuccess('')} className="ms-auto">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Tab */}
      <AnimatePresence mode="wait">
        {activeTab === 'settings' && (
          <motion.div
            key="settings"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Notification Channels */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-gray-50 to-gray-100">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {t('tenant.notifications.channels', 'Notification Channels')}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {t('tenant.notifications.channelsDescription', 'Configure email, SMS, webhook, and other notification channels')}
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    resetChannelForm();
                    setShowChannelModal(true);
                  }}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-xl hover:shadow-lg transition-all"
                >
                  <Plus className="w-4 h-4" />
                  {t('tenant.notifications.addChannel', 'Add Channel')}
                </motion.button>
              </div>
              <div className="p-6">
                {channels.length === 0 ? (
                  <div className="text-center py-12">
                    <Mail className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">{t('tenant.notifications.noChannels', 'No channels configured yet')}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {channels.map((channel: any, index) => (
                      <motion.div
                        key={channel.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-gray-50 border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              {getTypeIcon(channel.type)}
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-900">{channel.name}</h3>
                              <p className="text-sm text-gray-500">{channel.type}</p>
                            </div>
                          </div>
                          <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${
                            channel.isEnabled
                              ? 'bg-green-100 text-green-700 border border-green-200'
                              : 'bg-gray-100 text-gray-600 border border-gray-200'
                          }`}>
                            {channel.isEnabled ? t('common.enabled', 'Enabled') : t('common.disabled', 'Disabled')}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => openEditChannel(channel)}
                            className="flex items-center gap-1 text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg text-sm transition-colors"
                          >
                            <Edit className="w-3 h-3" />
                            {t('common.edit', 'Edit')}
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleDeleteChannel(channel.id)}
                            className="flex items-center gap-1 text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg text-sm transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                            {t('common.delete', 'Delete')}
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* User Preferences */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">
                  {t('tenant.notifications.preferences', 'Notification Preferences')}
                </h2>
                <p className="text-sm text-gray-500">
                  {t('tenant.notifications.preferencesDescription', 'Configure default notification preferences by category')}
                </p>
              </div>
              <div className="p-6">
                {preferences.length === 0 ? (
                  <div className="text-center py-12">
                    <Settings className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">{t('tenant.notifications.noPreferences', 'No preferences configured yet')}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {preferences.map((pref: any, index) => (
                      <motion.div
                        key={pref.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex justify-between items-center py-4 px-4 bg-gray-50 rounded-xl border border-gray-100"
                      >
                        <div>
                          <h3 className="font-medium text-gray-900">{pref.category || 'N/A'}</h3>
                        </div>
                        <div className="flex items-center gap-6">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={pref.emailEnabled || false}
                              onChange={() => {}}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-600">{t('tenant.notifications.email', 'Email')}</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={pref.smsEnabled || false}
                              onChange={() => {}}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-600">{t('tenant.notifications.sms', 'SMS')}</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={pref.inAppEnabled || false}
                              onChange={() => {}}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-600">{t('tenant.notifications.inApp', 'In-App')}</span>
                          </label>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <motion.div
            key="templates"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-gray-50 to-gray-100">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {t('tenant.notifications.notificationTemplates', 'Notification Templates')}
                </h2>
                <p className="text-sm text-gray-500">
                  {t('tenant.notifications.templatesDescription', 'Create and manage reusable notification templates')}
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  resetTemplateForm();
                  setShowTemplateModal(true);
                }}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-xl hover:shadow-lg transition-all"
              >
                <Plus className="w-4 h-4" />
                {t('tenant.notifications.createTemplate', 'Create Template')}
              </motion.button>
            </div>
            <div className="overflow-x-auto">
              {templates.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">{t('tenant.notifications.noTemplates', 'No templates found')}</p>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-start text-xs font-semibold text-gray-600 uppercase tracking-wider">{t('common.name', 'Name')}</th>
                      <th className="px-6 py-4 text-start text-xs font-semibold text-gray-600 uppercase tracking-wider">{t('common.type', 'Type')}</th>
                      <th className="px-6 py-4 text-start text-xs font-semibold text-gray-600 uppercase tracking-wider">{t('common.category', 'Category')}</th>
                      <th className="px-6 py-4 text-start text-xs font-semibold text-gray-600 uppercase tracking-wider">{t('common.status', 'Status')}</th>
                      <th className="px-6 py-4 text-start text-xs font-semibold text-gray-600 uppercase tracking-wider">{t('common.created', 'Created')}</th>
                      <th className="px-6 py-4 text-start text-xs font-semibold text-gray-600 uppercase tracking-wider">{t('common.actions', 'Actions')}</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {templates.map((template: any, index) => (
                      <motion.tr
                        key={template.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              {getTypeIcon(template.type)}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{template.name}</div>
                              <div className="text-sm text-gray-500">{template.description || ''}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{template.type}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{template.category || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2.5 py-1 text-xs rounded-full font-medium border ${
                            template.isActive
                              ? 'bg-green-100 text-green-700 border-green-200'
                              : 'bg-gray-100 text-gray-600 border-gray-200'
                          }`}>
                            {template.isActive ? t('common.active', 'Active') : t('common.inactive', 'Inactive')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(template.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => setPreviewTemplate(template)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title={t('common.preview', 'Preview')}
                            >
                              <Eye className="w-4 h-4" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => openEditTemplate(template)}
                              className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                              title={t('common.edit', 'Edit')}
                            >
                              <Edit className="w-4 h-4" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleDeleteTemplate(template.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title={t('common.delete', 'Delete')}
                            >
                              <Trash2 className="w-4 h-4" />
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </motion.div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <motion.div
            key="history"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Stats */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard
                  title={t('tenant.notifications.totalSent', 'Total Sent')}
                  value={stats.totalSent}
                  icon={<Send className="w-6 h-6 text-blue-600" />}
                  color="bg-blue-100"
                  delay={0}
                />
                <StatCard
                  title={t('tenant.notifications.delivered', 'Delivered')}
                  value={stats.totalDelivered}
                  icon={<CheckCircle className="w-6 h-6 text-green-600" />}
                  color="bg-green-100"
                  delay={1}
                />
                <StatCard
                  title={t('tenant.notifications.failed', 'Failed')}
                  value={stats.totalFailed}
                  icon={<XCircle className="w-6 h-6 text-red-600" />}
                  color="bg-red-100"
                  delay={2}
                />
                <StatCard
                  title={t('tenant.notifications.deliveryRate', 'Delivery Rate')}
                  value={`${stats.deliveryRate.toFixed(1)}%`}
                  icon={<BarChart3 className="w-6 h-6 text-indigo-600" />}
                  color="bg-indigo-100"
                  delay={3}
                />
              </div>
            )}

            {/* Filters */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-4"
            >
              <div className="flex items-center gap-2 mb-4">
                <Filter className="w-5 h-5 text-gray-500" />
                <h3 className="font-medium text-gray-700">{t('common.filters', 'Filters')}</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('common.status', 'Status')}</label>
                  <select
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    value={historyStatusFilter}
                    onChange={(e) => {
                      setHistoryStatusFilter(e.target.value as NotificationStatus | '');
                      setHistoryPage(1);
                    }}
                  >
                    <option value="">{t('common.allStatuses', 'All Statuses')}</option>
                    <option value="Pending">{t('common.pending', 'Pending')}</option>
                    <option value="Sent">{t('common.sent', 'Sent')}</option>
                    <option value="Delivered">{t('common.delivered', 'Delivered')}</option>
                    <option value="Failed">{t('common.failed', 'Failed')}</option>
                    <option value="Bounced">{t('common.bounced', 'Bounced')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('common.type', 'Type')}</label>
                  <select
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    value={historyTypeFilter}
                    onChange={(e) => {
                      setHistoryTypeFilter(e.target.value as NotificationType | '');
                      setHistoryPage(1);
                    }}
                  >
                    <option value="">{t('common.allTypes', 'All Types')}</option>
                    {(NOTIFICATION_TYPES as any[]).map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('common.category', 'Category')}</label>
                  <select
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    value={historyCategoryFilter}
                    onChange={(e) => {
                      setHistoryCategoryFilter(e.target.value as NotificationCategory | '');
                      setHistoryPage(1);
                    }}
                  >
                    <option value="">{t('common.allCategories', 'All Categories')}</option>
                    {(NOTIFICATION_CATEGORIES as any[]).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>
            </motion.div>

            {/* Notifications Table */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 overflow-hidden"
            >
              {notifications.length === 0 ? (
                <div className="text-center py-12">
                  <History className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">{t('tenant.notifications.noNotifications', 'No notifications found')}</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                        <tr>
                          <th className="px-6 py-4 text-start text-xs font-semibold text-gray-600 uppercase tracking-wider">{t('common.recipient', 'Recipient')}</th>
                          <th className="px-6 py-4 text-start text-xs font-semibold text-gray-600 uppercase tracking-wider">{t('common.subject', 'Subject')}</th>
                          <th className="px-6 py-4 text-start text-xs font-semibold text-gray-600 uppercase tracking-wider">{t('common.type', 'Type')}</th>
                          <th className="px-6 py-4 text-start text-xs font-semibold text-gray-600 uppercase tracking-wider">{t('common.status', 'Status')}</th>
                          <th className="px-6 py-4 text-start text-xs font-semibold text-gray-600 uppercase tracking-wider">{t('common.priority', 'Priority')}</th>
                          <th className="px-6 py-4 text-start text-xs font-semibold text-gray-600 uppercase tracking-wider">{t('common.sentAt', 'Sent At')}</th>
                          <th className="px-6 py-4 text-start text-xs font-semibold text-gray-600 uppercase tracking-wider">{t('common.actions', 'Actions')}</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-100">
                        {notifications.map((notification, index) => (
                          <motion.tr
                            key={notification.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: index * 0.03 }}
                            className="hover:bg-gray-50 transition-colors"
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                {getTypeIcon(notification.type)}
                                <span className="text-sm font-medium text-gray-900">
                                  {notification.recipientEmail || notification.recipientPhone || 'N/A'}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900 max-w-xs truncate">{notification.subject}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{notification.type}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2.5 py-1 text-xs rounded-full font-medium border ${getStatusBadgeStyles(notification.status)}`}>
                                {notification.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2.5 py-1 text-xs rounded-full font-medium border ${getPriorityBadgeStyles(notification.priority)}`}>
                                {notification.priority}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-gray-400" />
                                {notification.sentAt ? formatDate(notification.sentAt) : t('common.notSent', 'Not sent')}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => setSelectedNotification(notification)}
                                  className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                  title={t('common.view', 'View')}
                                >
                                  <Eye className="w-4 h-4" />
                                </motion.button>
                                {notification.status === 'Failed' && (
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => handleRetryNotification(notification.id)}
                                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                    title={t('common.retry', 'Retry')}
                                  >
                                    <RefreshCw className="w-4 h-4" />
                                  </motion.button>
                                )}
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setHistoryPage(historyPage - 1)}
                      disabled={historyPage === 1}
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      {t('common.previous', 'Previous')}
                    </motion.button>
                    <span className="text-sm text-gray-700">
                      {t('common.pageOf', 'Page {{current}} of {{total}}', { current: historyPage, total: historyTotalPages })}
                    </span>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setHistoryPage(historyPage + 1)}
                      disabled={historyPage >= historyTotalPages}
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      {t('common.next', 'Next')}
                      <ChevronRight className="w-4 h-4" />
                    </motion.button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}

        {/* Rules Tab */}
        {activeTab === 'rules' && (
          <motion.div
            key="rules"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-gray-50 to-gray-100">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {t('tenant.notifications.notificationRules', 'Notification Rules')}
                </h2>
                <p className="text-sm text-gray-500">
                  {t('tenant.notifications.rulesDescription', 'Configure automated notification triggers based on events')}
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  resetRuleForm();
                  setShowRuleModal(true);
                }}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-xl hover:shadow-lg transition-all"
              >
                <Plus className="w-4 h-4" />
                {t('tenant.notifications.createRule', 'Create Rule')}
              </motion.button>
            </div>
            <div className="p-6">
              {rules.length === 0 ? (
                <div className="text-center py-12">
                  <Zap className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">{t('tenant.notifications.noRules', 'No rules configured yet')}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {rules.map((rule, index) => (
                    <motion.div
                      key={rule.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-gray-50 border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-indigo-100 rounded-lg">
                              <Zap className="w-4 h-4 text-indigo-600" />
                            </div>
                            <h3 className="font-semibold text-gray-900">{rule.name}</h3>
                            <span className={`px-2.5 py-1 text-xs rounded-full font-medium border ${
                              rule.isActive
                                ? 'bg-green-100 text-green-700 border-green-200'
                                : 'bg-gray-100 text-gray-600 border-gray-200'
                            }`}>
                              {rule.isActive ? t('common.active', 'Active') : t('common.inactive', 'Inactive')}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 mb-3">{rule.description}</p>
                          <div className="flex flex-wrap gap-3 text-sm">
                            <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg">
                              {t('common.event', 'Event')}: <strong>{rule.eventType}</strong>
                            </span>
                            <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-lg flex items-center gap-1">
                              {getTypeIcon(rule.notificationType)}
                              <strong>{rule.notificationType}</strong>
                            </span>
                            {rule.templateId && (
                              <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg">
                                {t('common.template', 'Template')}: <strong>{rule.templateId}</strong>
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleToggleRule(rule.id)}
                            className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg transition-colors ${
                              rule.isActive
                                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                          >
                            {rule.isActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                            {rule.isActive ? t('common.disable', 'Disable') : t('common.enable', 'Enable')}
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => openEditRule(rule)}
                            className="flex items-center gap-1 text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg text-sm transition-colors"
                          >
                            <Edit className="w-3 h-3" />
                            {t('common.edit', 'Edit')}
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleDeleteRule(rule.id)}
                            className="flex items-center gap-1 text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg text-sm transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                            {t('common.delete', 'Delete')}
                          </motion.button>
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

      {/* Channel Modal */}
      <AnimatePresence>
        {showChannelModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowChannelModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-xl">
                      <Mail className="w-6 h-6" />
                    </div>
                    <h2 className="text-xl font-bold">
                      {editingChannel ? t('tenant.notifications.editChannel', 'Edit Channel') : t('tenant.notifications.addChannel', 'Add Channel')}
                    </h2>
                  </div>
                  <button
                    onClick={() => setShowChannelModal(false)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <form onSubmit={handleSaveChannel} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('common.channelName', 'Channel Name')}</label>
                  <input
                    type="text"
                    required
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    value={channelName}
                    onChange={(e) => setChannelName(e.target.value)}
                    placeholder={t('tenant.notifications.channelNamePlaceholder', 'e.g., Primary Email Server')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('common.channelType', 'Channel Type')}</label>
                  <select
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    value={channelType}
                    onChange={(e) => setChannelType(e.target.value as NotificationType)}
                  >
                    {(NOTIFICATION_TYPES as any[]).map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('common.configuration', 'Configuration')} (JSON)
                  </label>
                  <textarea
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    rows={6}
                    value={channelConfig}
                    onChange={(e) => setChannelConfig(e.target.value)}
                    placeholder='{"host": "smtp.example.com", "port": 587}'
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {t('tenant.notifications.configHint', 'Enter configuration as JSON object')}
                  </p>
                </div>
                <div className="flex gap-3 pt-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl hover:shadow-lg transition-all"
                  >
                    <CheckCircle className="w-4 h-4" />
                    {t('common.save', 'Save')}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => setShowChannelModal(false)}
                    className="px-5 py-2.5 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors"
                  >
                    {t('common.cancel', 'Cancel')}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Template Modal */}
      <AnimatePresence>
        {showTemplateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowTemplateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-xl">
                      <FileText className="w-6 h-6" />
                    </div>
                    <h2 className="text-xl font-bold">
                      {editingTemplate ? t('tenant.notifications.editTemplate', 'Edit Template') : t('tenant.notifications.createTemplate', 'Create Template')}
                    </h2>
                  </div>
                  <button
                    onClick={() => setShowTemplateModal(false)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <form onSubmit={handleSaveTemplate} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('common.templateName', 'Template Name')}</label>
                    <input
                      type="text"
                      required
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      value={templateName}
                      onChange={(e) => setTemplateName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('common.type', 'Type')}</label>
                    <select
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      value={templateType}
                      onChange={(e) => setTemplateType(e.target.value as NotificationType)}
                    >
                      {(NOTIFICATION_TYPES as any[]).map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('common.description', 'Description')}</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    value={templateDescription}
                    onChange={(e) => setTemplateDescription(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('common.category', 'Category')}</label>
                    <select
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      value={templateCategory}
                      onChange={(e) => setTemplateCategory(e.target.value as NotificationCategory)}
                    >
                      {(NOTIFICATION_CATEGORIES as any[]).map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('common.variables', 'Variables')} ({t('common.commaSeparated', 'comma-separated')})
                    </label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      value={templateVariables}
                      onChange={(e) => setTemplateVariables(e.target.value)}
                      placeholder="userName, actionUrl, date"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('common.subjectTemplate', 'Subject Template')}</label>
                  <input
                    type="text"
                    required
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    value={templateSubject}
                    onChange={(e) => setTemplateSubject(e.target.value)}
                    placeholder="Welcome {{userName}}!"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('common.bodyTemplate', 'Body Template')}</label>
                  <textarea
                    required
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    rows={6}
                    value={templateBody}
                    onChange={(e) => setTemplateBody(e.target.value)}
                    placeholder="Hello {{userName}}, welcome to our platform!"
                  />
                </div>
                {templateType === 'Email' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('common.htmlTemplate', 'HTML Template')} ({t('common.optional', 'optional')})
                    </label>
                    <textarea
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      rows={6}
                      value={templateHtml}
                      onChange={(e) => setTemplateHtml(e.target.value)}
                      placeholder="<html><body>Hello {{userName}}</body></html>"
                    />
                  </div>
                )}
                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={templateActive}
                      onChange={(e) => setTemplateActive(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">{t('common.active', 'Active')}</span>
                  </label>
                </div>
                <div className="flex gap-3 pt-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl hover:shadow-lg transition-all"
                  >
                    <CheckCircle className="w-4 h-4" />
                    {t('common.saveTemplate', 'Save Template')}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => setShowTemplateModal(false)}
                    className="px-5 py-2.5 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors"
                  >
                    {t('common.cancel', 'Cancel')}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Template Preview Modal */}
      <AnimatePresence>
        {previewTemplate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setPreviewTemplate(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-xl">
                      <Eye className="w-6 h-6" />
                    </div>
                    <h2 className="text-xl font-bold">{t('tenant.notifications.templatePreview', 'Template Preview')}</h2>
                  </div>
                  <button
                    onClick={() => setPreviewTemplate(null)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    {getTypeIcon(previewTemplate.type)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{previewTemplate.name}</h3>
                    <p className="text-sm text-gray-500">{(previewTemplate as any).description || ''}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <label className="text-sm font-medium text-gray-700">{t('common.subject', 'Subject')}:</label>
                    <div className="mt-2 text-gray-900 font-medium">
                      {(previewTemplate as any).subjectTemplate || ''}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <label className="text-sm font-medium text-gray-700">{t('common.body', 'Body')}:</label>
                    <div className="mt-2 text-gray-900 whitespace-pre-wrap">
                      {(previewTemplate as any).bodyTemplate || ''}
                    </div>
                  </div>
                  {(previewTemplate as any).htmlTemplate && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <label className="text-sm font-medium text-gray-700">{t('common.html', 'HTML')}:</label>
                      <div className="mt-2 font-mono text-xs text-gray-700 overflow-x-auto">
                        {(previewTemplate as any).htmlTemplate}
                      </div>
                    </div>
                  )}
                  {previewTemplate.variables.length > 0 && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <label className="text-sm font-medium text-gray-700">{t('common.variables', 'Variables')}:</label>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {previewTemplate.variables.map((v) => (
                          <span key={v} className="px-3 py-1 bg-indigo-100 text-indigo-700 text-sm rounded-lg font-mono">
                            {`{{${v}}}`}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rule Modal */}
      <AnimatePresence>
        {showRuleModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowRuleModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-xl">
                      <Zap className="w-6 h-6" />
                    </div>
                    <h2 className="text-xl font-bold">
                      {editingRule ? t('tenant.notifications.editRule', 'Edit Rule') : t('tenant.notifications.createRule', 'Create Rule')}
                    </h2>
                  </div>
                  <button
                    onClick={() => setShowRuleModal(false)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <form onSubmit={handleSaveRule} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('common.ruleName', 'Rule Name')}</label>
                  <input
                    type="text"
                    required
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    value={ruleName}
                    onChange={(e) => setRuleName(e.target.value)}
                    placeholder={t('tenant.notifications.ruleNamePlaceholder', 'e.g., Failed Login Alert')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('common.description', 'Description')}</label>
                  <textarea
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    rows={3}
                    value={ruleDescription}
                    onChange={(e) => setRuleDescription(e.target.value)}
                    placeholder={t('tenant.notifications.ruleDescriptionPlaceholder', 'Describe when this rule should trigger')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('common.eventType', 'Event Type')}</label>
                  <input
                    type="text"
                    required
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    value={ruleEventType}
                    onChange={(e) => setRuleEventType(e.target.value)}
                    placeholder={t('tenant.notifications.eventTypePlaceholder', 'e.g., FailedLogin, UserRegistered')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('common.notificationType', 'Notification Type')}</label>
                  <select
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    value={ruleNotificationType}
                    onChange={(e) => setRuleNotificationType(e.target.value as NotificationType)}
                  >
                    {(NOTIFICATION_TYPES as any[]).map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('common.template', 'Template')} ({t('common.optional', 'optional')})
                  </label>
                  <select
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    value={ruleTemplateId}
                    onChange={(e) => setRuleTemplateId(e.target.value)}
                  >
                    <option value="">{t('tenant.notifications.noTemplate', 'None - Use custom message')}</option>
                    {templates.map(template => (
                      <option key={template.id} value={template.id}>{template.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={ruleActive}
                      onChange={(e) => setRuleActive(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">{t('common.active', 'Active')}</span>
                  </label>
                </div>
                <div className="flex gap-3 pt-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl hover:shadow-lg transition-all"
                  >
                    <CheckCircle className="w-4 h-4" />
                    {t('common.saveRule', 'Save Rule')}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => setShowRuleModal(false)}
                    className="px-5 py-2.5 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors"
                  >
                    {t('common.cancel', 'Cancel')}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notification Detail Modal */}
      <AnimatePresence>
        {selectedNotification && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedNotification(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-xl">
                      <Bell className="w-6 h-6" />
                    </div>
                    <h2 className="text-xl font-bold">{t('tenant.notifications.notificationDetails', 'Notification Details')}</h2>
                  </div>
                  <button
                    onClick={() => setSelectedNotification(null)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <label className="text-sm font-medium text-gray-500">{t('common.type', 'Type')}</label>
                    <div className="mt-1 flex items-center gap-2 text-gray-900">
                      {getTypeIcon(selectedNotification.type)}
                      {selectedNotification.type}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <label className="text-sm font-medium text-gray-500">{t('common.category', 'Category')}</label>
                    <div className="mt-1 text-gray-900">{selectedNotification.category}</div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <label className="text-sm font-medium text-gray-500">{t('common.status', 'Status')}</label>
                    <div className="mt-1">
                      <span className={`px-2.5 py-1 text-xs rounded-full font-medium border ${getStatusBadgeStyles(selectedNotification.status)}`}>
                        {selectedNotification.status}
                      </span>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <label className="text-sm font-medium text-gray-500">{t('common.priority', 'Priority')}</label>
                    <div className="mt-1">
                      <span className={`px-2.5 py-1 text-xs rounded-full font-medium border ${getPriorityBadgeStyles(selectedNotification.priority)}`}>
                        {selectedNotification.priority}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <label className="text-sm font-medium text-gray-500">{t('common.recipient', 'Recipient')}</label>
                  <div className="mt-1 text-gray-900">
                    {selectedNotification.recipientEmail || selectedNotification.recipientPhone || 'N/A'}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <label className="text-sm font-medium text-gray-500">{t('common.subject', 'Subject')}</label>
                  <div className="mt-1 text-gray-900 font-medium">{selectedNotification.subject}</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <label className="text-sm font-medium text-gray-500">{t('common.message', 'Message')}</label>
                  <div className="mt-2 text-gray-900 whitespace-pre-wrap">
                    {selectedNotification.message}
                  </div>
                </div>
                {selectedNotification.failureReason && (
                  <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                    <label className="text-sm font-medium text-red-600">{t('common.failureReason', 'Failure Reason')}</label>
                    <div className="mt-1 text-red-800">
                      {selectedNotification.failureReason}
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <label className="text-sm font-medium text-gray-500">{t('common.created', 'Created')}</label>
                    <div className="mt-1 text-gray-900">{formatDate(selectedNotification.createdAt)}</div>
                  </div>
                  {selectedNotification.sentAt && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <label className="text-sm font-medium text-gray-500">{t('common.sent', 'Sent')}</label>
                      <div className="mt-1 text-gray-900">{formatDate(selectedNotification.sentAt)}</div>
                    </div>
                  )}
                  {selectedNotification.deliveredAt && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <label className="text-sm font-medium text-gray-500">{t('common.delivered', 'Delivered')}</label>
                      <div className="mt-1 text-gray-900">{formatDate(selectedNotification.deliveredAt)}</div>
                    </div>
                  )}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <label className="text-sm font-medium text-gray-500">{t('common.retryCount', 'Retry Count')}</label>
                    <div className="mt-1 text-gray-900">{selectedNotification.retryCount}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
