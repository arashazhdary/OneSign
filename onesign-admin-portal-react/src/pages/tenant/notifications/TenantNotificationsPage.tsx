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
  NotificationDto,
  NotificationChannelDto,
  NotificationPreferenceDto,
  NotificationStatsDto,
  NotificationRuleDto,
  CreateNotificationRuleDto,
  NotificationType,
  NotificationCategory,
  NotificationPriority,
  NotificationStatus,
  NOTIFICATION_TYPES,
  NOTIFICATION_CATEGORIES,
  NOTIFICATION_PRIORITIES,
  getStatusColor,
  getPriorityColor,
  getTypeIcon,
} from '@/lib/api/notifications';
import { Helmet } from 'react-helmet-async';

type TabType = 'settings' | 'templates' | 'history' | 'rules';

// Fallback mock data for rules if API is not available
const mockRules: NotificationRuleDto[] = [
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
  const { t } = useTranslation();
  const locale = useLocale();
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
  const [rules, setRules] = useState<NotificationRuleDto[]>([]);
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [editingRule, setEditingRule] = useState<NotificationRuleDto | null>(null);
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
      const data = await getNotificationChannels(tenantId);
      setChannels(data);
    } catch (err) {
      console.error('Error fetching channels:', err);
    }
  };

  const fetchPreferences = async () => {
    if (!tenantId) return;
    try {
      // Using a mock user ID for demo purposes
      const userId = '00000000-0000-0000-0000-000000000001';
      const data = await getNotificationPreferences(userId, tenantId);
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
        await updateNotificationChannel(editingChannel.id, channelData);
        setSuccess('Channel updated successfully');
      } else {
        await createNotificationChannel(channelData);
        setSuccess('Channel created successfully');
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
      await deleteNotificationChannel(channelId, tenantId, '00000000-0000-0000-0000-000000000001');
      setSuccess('Channel deleted successfully');
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
    setChannelType(channel.type);
    setChannelConfig(JSON.stringify(channel.configuration, null, 2));
    setChannelEnabled(channel.isEnabled);
    setShowChannelModal(true);
  };

  // Templates Tab Functions
  const fetchTemplates = async () => {
    if (!tenantId) return;
    try {
      const data = await getNotificationTemplates(tenantId);
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
        setSuccess('Template updated successfully');
      } else {
        await createNotificationTemplate(templateData);
        setSuccess('Template created successfully');
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
      await deleteNotificationTemplate(templateId, tenantId, '00000000-0000-0000-0000-000000000001');
      setSuccess('Template deleted successfully');
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
    setTemplateDescription(template.description || '');
    setTemplateCategory(template.category);
    setTemplateType(template.type);
    setTemplateSubject(template.subjectTemplate);
    setTemplateBody(template.bodyTemplate);
    setTemplateHtml(template.htmlTemplate || '');
    setTemplateVariables(template.variables.join(', '));
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

      const data = await getNotifications(tenantId, params);
      setNotifications(data.items);
      setHistoryTotalPages(data.totalPages);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  const fetchStats = async () => {
    if (!tenantId) return;
    try {
      const data = await getNotificationStats(tenantId);
      setStats(data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  // Rules Tab Functions
  const fetchRules = async () => {
    if (!tenantId) return;
    try {
      const data = await getNotificationRules(tenantId);
      setRules(data || mockRules);
    } catch (err) {
      console.error('Error fetching notification rules:', err);
      console.warn('Using fallback mock data for notification rules');
      setRules(mockRules);
    }
  };

  const handleRetryNotification = async (notificationId: string) => {
    if (!tenantId) return;
    setError('');
    setSuccess('');
    try {
      await retryNotification(notificationId, tenantId);
      setSuccess('Notification retry initiated');
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
        setSuccess(t('common.ruleUpdatedSuccessfully'));
      } else {
        await createNotificationRule(ruleData);
        setSuccess(t('common.ruleCreatedSuccessfully'));
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
      await deleteNotificationRule(ruleId, tenantId);
      setSuccess(t('common.ruleDeletedSuccessfully'));
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
      await toggleNotificationRule(ruleId, tenantId);
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

  const openEditRule = (rule: NotificationRuleDto) => {
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
    return new Date(dateString).toLocaleString(locale);
  };

  const getStatusBadgeClass = (status: NotificationStatus) => {
    const color = getStatusColor(status);
    return `bg-${color}-100 text-${color}-800`;
  };

  if (loading && activeTab === 'settings' && channels.length === 0) {
    return <div className="p-8">{t('common.loading')}</div>;
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          {t('tenant.notifications.title')}
        </h1>
        <p className="mt-2 text-gray-600">
          Configure notification channels, templates, and delivery rules
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('settings')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'settings'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Settings
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'templates'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Templates
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'history'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            History
          </button>
          <button
            onClick={() => setActiveTab('rules')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'rules'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Rules
          </button>
        </nav>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          {/* Notification Channels */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Notification Channels</h2>
                <p className="text-sm text-gray-500">Configure email, SMS, webhook, and other notification channels</p>
              </div>
              <button
                onClick={() => {
                  resetChannelForm();
                  setShowChannelModal(true);
                }}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
              >
                Add Channel
              </button>
            </div>
            <div className="p-6">
              {channels.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No channels configured yet</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {channels.map((channel) => (
                    <div key={channel.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-medium text-gray-900">{channel.name}</h3>
                          <p className="text-sm text-gray-500">{channel.type}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 text-xs rounded ${
                            channel.isEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {channel.isEnabled ? 'Enabled' : 'Disabled'}
                          </span>
                        </div>
                      </div>
                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={() => openEditChannel(channel)}
                          className="text-indigo-600 hover:text-indigo-900 text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteChannel(channel.id)}
                          className="text-red-600 hover:text-red-900 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* User Preferences */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Notification Preferences</h2>
              <p className="text-sm text-gray-500">Configure default notification preferences by category</p>
            </div>
            <div className="p-6">
              {preferences.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No preferences configured yet</p>
              ) : (
                <div className="space-y-4">
                  {preferences.map((pref) => (
                    <div key={pref.id} className="flex justify-between items-center py-3 border-b border-gray-100">
                      <div>
                        <h3 className="font-medium text-gray-900">{pref.category}</h3>
                      </div>
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={pref.emailEnabled}
                            onChange={() => {/* Handle update */}}
                            className="rounded"
                          />
                          <span className="text-sm">Email</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={pref.smsEnabled}
                            onChange={() => {/* Handle update */}}
                            className="rounded"
                          />
                          <span className="text-sm">SMS</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={pref.inAppEnabled}
                            onChange={() => {/* Handle update */}}
                            className="rounded"
                          />
                          <span className="text-sm">In-App</span>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Notification Templates</h2>
              <p className="text-sm text-gray-500">Create and manage reusable notification templates</p>
            </div>
            <button
              onClick={() => {
                resetTemplateForm();
                setShowTemplateModal(true);
              }}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
            >
              Create Template
            </button>
          </div>
          <div className="overflow-x-auto">
            {templates.length === 0 ? (
              <p className="text-gray-500 text-center py-12">No templates found</p>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {templates.map((template) => (
                    <tr key={template.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{template.name}</div>
                        <div className="text-sm text-gray-500">{template.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{template.type}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{template.category}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded ${
                          template.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {template.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(template.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm space-x-3">
                        <button
                          onClick={() => setPreviewTemplate(template)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Preview
                        </button>
                        <button
                          onClick={() => openEditTemplate(template)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteTemplate(template.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white shadow rounded-lg p-4">
                <div className="text-sm text-gray-500">Total Sent</div>
                <div className="text-2xl font-bold text-gray-900">{stats.totalSent}</div>
              </div>
              <div className="bg-white shadow rounded-lg p-4">
                <div className="text-sm text-gray-500">Delivered</div>
                <div className="text-2xl font-bold text-green-600">{stats.totalDelivered}</div>
              </div>
              <div className="bg-white shadow rounded-lg p-4">
                <div className="text-sm text-gray-500">Failed</div>
                <div className="text-2xl font-bold text-red-600">{stats.totalFailed}</div>
              </div>
              <div className="bg-white shadow rounded-lg p-4">
                <div className="text-sm text-gray-500">Delivery Rate</div>
                <div className="text-2xl font-bold text-indigo-600">{stats.deliveryRate.toFixed(1)}%</div>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="bg-white shadow rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  value={historyStatusFilter}
                  onChange={(e) => {
                    setHistoryStatusFilter(e.target.value as NotificationStatus | '');
                    setHistoryPage(1);
                  }}
                >
                  <option value="">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Sent">Sent</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Failed">Failed</option>
                  <option value="Bounced">Bounced</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <select
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  value={historyTypeFilter}
                  onChange={(e) => {
                    setHistoryTypeFilter(e.target.value as NotificationType | '');
                    setHistoryPage(1);
                  }}
                >
                  <option value="">All Types</option>
                  {NOTIFICATION_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  value={historyCategoryFilter}
                  onChange={(e) => {
                    setHistoryCategoryFilter(e.target.value as NotificationCategory | '');
                    setHistoryPage(1);
                  }}
                >
                  <option value="">All Categories</option>
                  {NOTIFICATION_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Notifications Table */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            {notifications.length === 0 ? (
              <p className="text-gray-500 text-center py-12">No notifications found</p>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Recipient</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sent At</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {notifications.map((notification) => (
                        <tr key={notification.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">
                              {notification.recipientEmail || notification.recipientPhone || 'N/A'}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 max-w-xs truncate">{notification.subject}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{notification.type}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs rounded bg-${getStatusColor(notification.status)}-100 text-${getStatusColor(notification.status)}-800`}>
                              {notification.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs rounded bg-${getPriorityColor(notification.priority)}-100 text-${getPriorityColor(notification.priority)}-800`}>
                              {notification.priority}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {notification.sentAt ? formatDate(notification.sentAt) : 'Not sent'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm space-x-3">
                            <button
                              onClick={() => setSelectedNotification(notification)}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              View
                            </button>
                            {notification.status === 'Failed' && (
                              <button
                                onClick={() => handleRetryNotification(notification.id)}
                                className="text-green-600 hover:text-green-900"
                              >
                                Retry
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
                  <button
                    onClick={() => setHistoryPage(historyPage - 1)}
                    disabled={historyPage === 1}
                    className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-700">
                    Page {historyPage} of {historyTotalPages}
                  </span>
                  <button
                    onClick={() => setHistoryPage(historyPage + 1)}
                    disabled={historyPage >= historyTotalPages}
                    className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Rules Tab */}
      {activeTab === 'rules' && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Notification Rules</h2>
              <p className="text-sm text-gray-500">Configure automated notification triggers based on events</p>
            </div>
            <button
              onClick={() => {
                resetRuleForm();
                setShowRuleModal(true);
              }}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
            >
              Create Rule
            </button>
          </div>
          <div className="p-6">
            {rules.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No rules configured yet</p>
            ) : (
              <div className="space-y-4">
                {rules.map((rule) => (
                  <div key={rule.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-medium text-gray-900">{rule.name}</h3>
                          <span className={`px-2 py-1 text-xs rounded ${
                            rule.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {rule.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{rule.description}</p>
                        <div className="mt-2 flex gap-4 text-sm text-gray-600">
                          <span>Event: <strong>{rule.eventType}</strong></span>
                          <span>Type: <strong>{rule.notificationType}</strong></span>
                          {rule.templateId && <span>Template: <strong>{rule.templateId}</strong></span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleRule(rule.id)}
                          className={`px-3 py-1 text-sm rounded ${
                            rule.isActive
                              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                        >
                          {rule.isActive ? 'Disable' : 'Enable'}
                        </button>
                        <button
                          onClick={() => openEditRule(rule)}
                          className="text-indigo-600 hover:text-indigo-900 text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteRule(rule.id)}
                          className="text-red-600 hover:text-red-900 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Channel Modal */}
      {showChannelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold">
                {editingChannel ? 'Edit Channel' : 'Add Channel'}
              </h2>
            </div>
            <form onSubmit={handleSaveChannel} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Channel Name</label>
                <input
                  type="text"
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  value={channelName}
                  onChange={(e) => setChannelName(e.target.value)}
                  placeholder="e.g., Primary Email Server"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Channel Type</label>
                <select
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  value={channelType}
                  onChange={(e) => setChannelType(e.target.value as NotificationType)}
                >
                  {NOTIFICATION_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Configuration (JSON)
                </label>
                <textarea
                  className="w-full border border-gray-300 rounded-md px-3 py-2 font-mono text-sm"
                  rows={6}
                  value={channelConfig}
                  onChange={(e) => setChannelConfig(e.target.value)}
                  placeholder='{"host": "smtp.example.com", "port": 587}'
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter configuration as JSON object
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setShowChannelModal(false)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Template Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold">
                {editingTemplate ? 'Edit Template' : 'Create Template'}
              </h2>
            </div>
            <form onSubmit={handleSaveTemplate} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Template Name</label>
                  <input
                    type="text"
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                  <select
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    value={templateType}
                    onChange={(e) => setTemplateType(e.target.value as NotificationType)}
                  >
                    {NOTIFICATION_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  value={templateDescription}
                  onChange={(e) => setTemplateDescription(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    value={templateCategory}
                    onChange={(e) => setTemplateCategory(e.target.value as NotificationCategory)}
                  >
                    {NOTIFICATION_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Variables (comma-separated)
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    value={templateVariables}
                    onChange={(e) => setTemplateVariables(e.target.value)}
                    placeholder="userName, actionUrl, date"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject Template</label>
                <input
                  type="text"
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  value={templateSubject}
                  onChange={(e) => setTemplateSubject(e.target.value)}
                  placeholder="Welcome {{userName}}!"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Body Template</label>
                <textarea
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 font-mono text-sm"
                  rows={6}
                  value={templateBody}
                  onChange={(e) => setTemplateBody(e.target.value)}
                  placeholder="Hello {{userName}}, welcome to our platform!"
                />
              </div>
              {templateType === 'Email' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    HTML Template (optional)
                  </label>
                  <textarea
                    className="w-full border border-gray-300 rounded-md px-3 py-2 font-mono text-sm"
                    rows={6}
                    value={templateHtml}
                    onChange={(e) => setTemplateHtml(e.target.value)}
                    placeholder="<html><body>Hello {{userName}}</body></html>"
                  />
                </div>
              )}
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={templateActive}
                    onChange={(e) => setTemplateActive(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">Active</span>
                </label>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                >
                  Save Template
                </button>
                <button
                  type="button"
                  onClick={() => setShowTemplateModal(false)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Template Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold">Template Preview</h2>
              <button
                onClick={() => setPreviewTemplate(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                Close
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">{previewTemplate.name}</h3>
                <p className="text-sm text-gray-500">{previewTemplate.description}</p>
              </div>
              <div className="border-t border-gray-200 pt-4">
                <div className="mb-4">
                  <label className="text-sm font-medium text-gray-700">Subject:</label>
                  <div className="mt-1 p-3 bg-gray-50 rounded border border-gray-200">
                    {previewTemplate.subjectTemplate}
                  </div>
                </div>
                <div className="mb-4">
                  <label className="text-sm font-medium text-gray-700">Body:</label>
                  <div className="mt-1 p-3 bg-gray-50 rounded border border-gray-200 whitespace-pre-wrap">
                    {previewTemplate.bodyTemplate}
                  </div>
                </div>
                {previewTemplate.htmlTemplate && (
                  <div className="mb-4">
                    <label className="text-sm font-medium text-gray-700">HTML:</label>
                    <div className="mt-1 p-3 bg-gray-50 rounded border border-gray-200 font-mono text-xs">
                      {previewTemplate.htmlTemplate}
                    </div>
                  </div>
                )}
                {previewTemplate.variables.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Variables:</label>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {previewTemplate.variables.map((v) => (
                        <span key={v} className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded">
                          {v}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rule Modal */}
      {showRuleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold">
                {editingRule ? 'Edit Rule' : 'Create Rule'}
              </h2>
            </div>
            <form onSubmit={handleSaveRule} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rule Name</label>
                <input
                  type="text"
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  value={ruleName}
                  onChange={(e) => setRuleName(e.target.value)}
                  placeholder="e.g., Failed Login Alert"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  rows={3}
                  value={ruleDescription}
                  onChange={(e) => setRuleDescription(e.target.value)}
                  placeholder="Describe when this rule should trigger"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Event Type</label>
                <input
                  type="text"
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  value={ruleEventType}
                  onChange={(e) => setRuleEventType(e.target.value)}
                  placeholder="e.g., FailedLogin, UserRegistered"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notification Type</label>
                <select
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  value={ruleNotificationType}
                  onChange={(e) => setRuleNotificationType(e.target.value as NotificationType)}
                >
                  {NOTIFICATION_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Template (optional)
                </label>
                <select
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  value={ruleTemplateId}
                  onChange={(e) => setRuleTemplateId(e.target.value)}
                >
                  <option value="">None - Use custom message</option>
                  {templates.map(template => (
                    <option key={template.id} value={template.id}>{template.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={ruleActive}
                    onChange={(e) => setRuleActive(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">Active</span>
                </label>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                >
                  Save Rule
                </button>
                <button
                  type="button"
                  onClick={() => setShowRuleModal(false)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Notification Detail Modal */}
      {selectedNotification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold">Notification Details</h2>
              <button
                onClick={() => setSelectedNotification(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                Close
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Type</label>
                  <div className="mt-1 text-gray-900">{selectedNotification.type}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Category</label>
                  <div className="mt-1 text-gray-900">{selectedNotification.category}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <div className="mt-1">
                    <span className={`px-2 py-1 text-xs rounded bg-${getStatusColor(selectedNotification.status)}-100 text-${getStatusColor(selectedNotification.status)}-800`}>
                      {selectedNotification.status}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Priority</label>
                  <div className="mt-1">
                    <span className={`px-2 py-1 text-xs rounded bg-${getPriorityColor(selectedNotification.priority)}-100 text-${getPriorityColor(selectedNotification.priority)}-800`}>
                      {selectedNotification.priority}
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Recipient</label>
                <div className="mt-1 text-gray-900">
                  {selectedNotification.recipientEmail || selectedNotification.recipientPhone || 'N/A'}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Subject</label>
                <div className="mt-1 text-gray-900">{selectedNotification.subject}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Message</label>
                <div className="mt-1 p-3 bg-gray-50 rounded border border-gray-200 whitespace-pre-wrap text-gray-900">
                  {selectedNotification.message}
                </div>
              </div>
              {selectedNotification.failureReason && (
                <div>
                  <label className="text-sm font-medium text-red-500">Failure Reason</label>
                  <div className="mt-1 p-3 bg-red-50 rounded border border-red-200 text-red-900">
                    {selectedNotification.failureReason}
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="text-sm font-medium text-gray-500">Created</label>
                  <div className="mt-1 text-gray-900">{formatDate(selectedNotification.createdAt)}</div>
                </div>
                {selectedNotification.sentAt && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Sent</label>
                    <div className="mt-1 text-gray-900">{formatDate(selectedNotification.sentAt)}</div>
                  </div>
                )}
                {selectedNotification.deliveredAt && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Delivered</label>
                    <div className="mt-1 text-gray-900">{formatDate(selectedNotification.deliveredAt)}</div>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-gray-500">Retry Count</label>
                  <div className="mt-1 text-gray-900">{selectedNotification.retryCount}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
