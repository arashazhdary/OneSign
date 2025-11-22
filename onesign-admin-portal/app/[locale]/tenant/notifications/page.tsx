'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { getTenantId } from '@/lib/tenant-context';
import {
  getNotificationTemplates,
  getNotifications,
  createNotificationTemplate,
  sendNotificationDirect,
  NotificationTemplateDto,
  NotificationDto,
} from '@/lib/api/notifications';

interface NotificationTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  templateType: string;
  channel: string;
  variables: string[];
  createdAt: string;
}

interface Notification {
  id: string;
  recipientId: string;
  recipientEmail: string;
  subject: string;
  body: string;
  channel: string;
  status: string;
  sentAt: string;
  deliveredAt?: string;
  error?: string;
}

export default function NotificationsPage() {
  const t = useTranslations();
  const locale = useLocale();
  const [tenantId, setTenantIdState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState<'templates' | 'history' | 'send'>('templates');

  // Templates
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateSubject, setTemplateSubject] = useState('');
  const [templateBody, setTemplateBody] = useState('');
  const [templateType, setTemplateType] = useState('Email');
  const [templateChannel, setTemplateChannel] = useState('Email');

  // History
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [historyFilter, setHistoryFilter] = useState<string>('all');

  // Send Notification
  const [sendRecipientId, setSendRecipientId] = useState('');
  const [sendSubject, setSendSubject] = useState('');
  const [sendBody, setSendBody] = useState('');
  const [sendChannel, setSendChannel] = useState('Email');
  const [useTemplate, setUseTemplate] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');

  useEffect(() => {
    const contextTenantId = getTenantId();
    setTenantIdState(contextTenantId || '00000000-0000-0000-0000-000000000000');
  }, []);

  useEffect(() => {
    if (tenantId) {
      setLoading(true);
      Promise.all([
        fetchTemplates(),
        fetchNotifications()
      ]).finally(() => setLoading(false));
    }
  }, [tenantId]);

  const fetchTemplates = async () => {
    if (!tenantId) return;

    try {
      const data = await getNotificationTemplates(tenantId);
      setTemplates(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const fetchNotifications = async () => {
    if (!tenantId) return;

    try {
      const data = await getNotifications(tenantId);
      setNotifications(Array.isArray(data.items) ? data.items : []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!tenantId) return;

    try {
      await createNotificationTemplate({
        tenantId,
        userId: '', // TODO: Add current user ID
        name: templateName,
        description: '',
        category: 'Custom',
        type: templateChannel as any,
        subjectTemplate: templateSubject,
        bodyTemplate: templateBody,
        htmlTemplate: '',
        variables: [],
        isActive: true,
      });

      setShowTemplateModal(false);
      setTemplateName('');
      setTemplateSubject('');
      setTemplateBody('');
      setSuccess(t('tenant.notifications.templateCreated') || 'Template created successfully');
      fetchTemplates();
    } catch (error: any) {
      setError(error.message || t('common.error'));
      console.error('Error creating template:', error);
    }
  };

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!tenantId) return;

    try {
      const requestData: any = {
        recipientId: sendRecipientId,
        channel: sendChannel
      };

      if (useTemplate && selectedTemplateId) {
        requestData.templateId = selectedTemplateId;
        requestData.variables = {}; // Would need to collect template variables
      } else {
        requestData.subject = sendSubject;
        requestData.body = sendBody;
      }

      await sendNotificationDirect(tenantId, requestData);

      setSendRecipientId('');
      setSendSubject('');
      setSendBody('');
      setUseTemplate(false);
      setSelectedTemplateId('');
      setSuccess(t('tenant.notifications.notificationSent') || 'Notification sent successfully');
      fetchNotifications();
    } catch (error: any) {
      setError(error.message || t('common.error'));
      console.error('Error sending notification:', error);
    }
  };

  const getFilteredNotifications = () => {
    if (historyFilter === 'all') return notifications;
    return notifications.filter(n => n.status.toLowerCase() === historyFilter.toLowerCase());
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'sent':
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="p-8">{t('common.loading')}</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">{t('tenant.notifications.title') || 'Notification Center'}</h1>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('templates')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'templates'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {t('tenant.notifications.templates') || 'Templates'}
          </button>
          <button
            onClick={() => setActiveTab('send')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'send'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {t('tenant.notifications.send') || 'Send Notification'}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'history'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {t('tenant.notifications.history') || 'History'}
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

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">{t('tenant.notifications.templates') || 'Notification Templates'}</h2>
            <button
              onClick={() => setShowTemplateModal(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
            >
              {t('tenant.notifications.createTemplate') || 'Create Template'}
            </button>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('tenant.notifications.name') || 'Name'}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('tenant.notifications.type') || 'Type'}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('tenant.notifications.channel') || 'Channel'}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('tenant.notifications.created') || 'Created'}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {templates.map((template) => (
                  <tr key={template.id}>
                    <td className="px-6 py-4 text-sm">
                      <div className="font-medium text-gray-900">{template.name}</div>
                      <div className="text-gray-500 text-xs">{template.subject}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{template.templateType}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{template.channel}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(template.createdAt).toLocaleDateString(locale)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button className="text-indigo-600 hover:text-indigo-900 mr-3">{t('common.edit')}</button>
                      <button className="text-red-600 hover:text-red-900">{t('common.delete')}</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {templates.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                {t('tenant.notifications.noTemplates') || 'No templates found'}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Send Notification Tab */}
      {activeTab === 'send' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">{t('tenant.notifications.sendNotification') || 'Send Notification'}</h2>
          <form onSubmit={handleSendNotification}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">{t('tenant.notifications.recipientId') || 'Recipient User ID'}</label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border rounded"
                value={sendRecipientId}
                onChange={(e) => setSendRecipientId(e.target.value)}
                placeholder="User ID or Email"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">{t('tenant.notifications.channel') || 'Channel'}</label>
              <select
                className="w-full px-3 py-2 border rounded"
                value={sendChannel}
                onChange={(e) => setSendChannel(e.target.value)}
              >
                <option value="Email">Email</option>
                <option value="SMS">SMS</option>
                <option value="Push">Push Notification</option>
                <option value="InApp">In-App</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={useTemplate}
                  onChange={(e) => setUseTemplate(e.target.checked)}
                />
                {t('tenant.notifications.useTemplate') || 'Use Template'}
              </label>
            </div>

            {useTemplate ? (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">{t('tenant.notifications.selectTemplate') || 'Select Template'}</label>
                <select
                  className="w-full px-3 py-2 border rounded"
                  value={selectedTemplateId}
                  onChange={(e) => setSelectedTemplateId(e.target.value)}
                  required
                >
                  <option value="">{t('tenant.notifications.selectTemplatePlaceholder') || 'Choose a template...'}</option>
                  {templates.map((template) => (
                    <option key={template.id} value={template.id}>{template.name}</option>
                  ))}
                </select>
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">{t('tenant.notifications.subject') || 'Subject'}</label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border rounded"
                    value={sendSubject}
                    onChange={(e) => setSendSubject(e.target.value)}
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">{t('tenant.notifications.body') || 'Body'}</label>
                  <textarea
                    required
                    className="w-full px-3 py-2 border rounded"
                    rows={6}
                    value={sendBody}
                    onChange={(e) => setSendBody(e.target.value)}
                  />
                </div>
              </>
            )}

            <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700">
              {t('tenant.notifications.send') || 'Send Notification'}
            </button>
          </form>
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">{t('tenant.notifications.history') || 'Notification History'}</h2>
            <select
              className="px-3 py-2 border rounded"
              value={historyFilter}
              onChange={(e) => setHistoryFilter(e.target.value)}
            >
              <option value="all">{t('common.all') || 'All'}</option>
              <option value="sent">{t('tenant.notifications.sent') || 'Sent'}</option>
              <option value="delivered">{t('tenant.notifications.delivered') || 'Delivered'}</option>
              <option value="pending">{t('tenant.notifications.pending') || 'Pending'}</option>
              <option value="failed">{t('tenant.notifications.failed') || 'Failed'}</option>
            </select>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('tenant.notifications.recipient') || 'Recipient'}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('tenant.notifications.subject') || 'Subject'}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('tenant.notifications.channel') || 'Channel'}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('tenant.notifications.status') || 'Status'}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('tenant.notifications.sentAt') || 'Sent At'}</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {getFilteredNotifications().map((notification) => (
                  <tr key={notification.id}>
                    <td className="px-6 py-4 text-sm">
                      <div className="font-medium text-gray-900">{notification.recipientEmail}</div>
                      <div className="text-gray-500 text-xs">{notification.recipientId}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                      {notification.subject}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{notification.channel}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(notification.status)}`}>
                        {notification.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(notification.sentAt).toLocaleString(locale)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {getFilteredNotifications().length === 0 && (
              <div className="text-center py-8 text-gray-500">
                {t('tenant.notifications.noNotifications') || 'No notifications found'}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Template Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">{t('tenant.notifications.createTemplate') || 'Create Template'}</h2>
            <form onSubmit={handleCreateTemplate}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">{t('tenant.notifications.name') || 'Name'}</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border rounded"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">{t('tenant.notifications.type') || 'Type'}</label>
                <select
                  className="w-full px-3 py-2 border rounded"
                  value={templateType}
                  onChange={(e) => setTemplateType(e.target.value)}
                >
                  <option value="Email">Email</option>
                  <option value="SMS">SMS</option>
                  <option value="Push">Push</option>
                  <option value="InApp">In-App</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">{t('tenant.notifications.channel') || 'Channel'}</label>
                <select
                  className="w-full px-3 py-2 border rounded"
                  value={templateChannel}
                  onChange={(e) => setTemplateChannel(e.target.value)}
                >
                  <option value="Email">Email</option>
                  <option value="SMS">SMS</option>
                  <option value="Push">Push</option>
                  <option value="InApp">In-App</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">{t('tenant.notifications.subject') || 'Subject'}</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border rounded"
                  value={templateSubject}
                  onChange={(e) => setTemplateSubject(e.target.value)}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">{t('tenant.notifications.body') || 'Body'}</label>
                <textarea
                  required
                  className="w-full px-3 py-2 border rounded font-mono text-sm"
                  rows={8}
                  value={templateBody}
                  onChange={(e) => setTemplateBody(e.target.value)}
                  placeholder="Use {{variableName}} for variables"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {t('tenant.notifications.templateHint') || 'Use {{variableName}} syntax for dynamic content'}
                </p>
              </div>
              <div className="flex gap-2">
                <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded">
                  {t('common.create')}
                </button>
                <button
                  type="button"
                  onClick={() => setShowTemplateModal(false)}
                  className="bg-gray-300 px-4 py-2 rounded"
                >
                  {t('common.cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
