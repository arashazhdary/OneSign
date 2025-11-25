import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getTenantId } from '@/lib/tenant-context';
import { useAuth } from '@/app/contexts/AuthContext';
import {
  NotificationTemplateDto,
  NotificationType,
  NotificationCategory,
  NOTIFICATION_TYPES,
  NOTIFICATION_CATEGORIES,
  getNotificationTemplate,
  updateNotificationTemplate,
} from '@/lib/api/notifications';
import { Helmet } from 'react-helmet-async';

interface TemplateVersion {
  id: string;
  version: number;
  createdAt: string;
  createdBy: string;
  changes: string;
}

type Tab = 'editor' | 'preview' | 'test' | 'versions' | 'settings';

export default function TenantNotificationsTemplatesDetailPage() {
  const params = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const templateId = params.id as string;
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<Tab>('editor');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Template data
  const [template, setTemplate] = useState<NotificationTemplateDto | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<NotificationCategory>('Custom');
  const [type, setType] = useState<NotificationType>('Email');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [htmlBody, setHtmlBody] = useState('');
  const [variables, setVariables] = useState<string[]>([]);
  const [isActive, setIsActive] = useState(true);

  // Test send state
  const [testRecipient, setTestRecipient] = useState('');
  const [testVariableValues, setTestVariableValues] = useState<Record<string, string>>({});
  const [testing, setTesting] = useState(false);

  // Preview state
  const [previewMode, setPreviewMode] = useState<'text' | 'html'>('text');
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Versions
  const [versions, setVersions] = useState<TemplateVersion[]>([]);

  const tenantId = getTenantId();

  useEffect(() => {
    fetchTemplate();
  }, [templateId]);

  useEffect(() => {
    if (activeTab === 'versions') {
      fetchVersions();
    }
  }, [activeTab]);

  const fetchTemplate = async () => {
    if (!tenantId) return;

    setLoading(true);
    setError('');
    try {
      // Fetch real template from API
      const templateData = await getNotificationTemplate(templateId, tenantId);

      if (templateData) {
        setTemplate(templateData);
        setName(templateData.name);
        setDescription(templateData.description || '');
        setCategory(templateData.category);
        setType(templateData.type);
        setSubject(templateData.subjectTemplate);
        setBody(templateData.bodyTemplate);
        setHtmlBody(templateData.htmlTemplate || '');
        setVariables(templateData.variables);
        setIsActive(templateData.isActive);

        // Initialize test variable values
        const initialValues: Record<string, string> = {};
        templateData.variables.forEach(v => {
          initialValues[v] = '';
        });
        setTestVariableValues(initialValues);
      }
    } catch (err: any) {
      console.error('Error fetching template:', err);
      setError(err?.message || 'Failed to load template');

      // Fallback to mock data
      const mockTemplate: NotificationTemplateDto = {
        id: templateId,
        tenantId: tenantId || '',
        name: 'Welcome Email',
        description: 'Welcome email sent to new users',
        category: 'User',
        type: 'Email',
        subjectTemplate: 'Welcome to {{companyName}}, {{userName}}!',
        bodyTemplate: 'Hello {{userName}},\n\nWelcome to {{companyName}}! We\'re excited to have you on board.',
        htmlTemplate: '<html><body><h1>Welcome!</h1></body></html>',
        variables: ['userName', 'companyName', 'actionUrl'],
        isActive: true,
        isGlobalTemplate: false,
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setTemplate(mockTemplate);
      setName(mockTemplate.name);
      setDescription(mockTemplate.description || '');
      setCategory(mockTemplate.category);
      setType(mockTemplate.type);
      setSubject(mockTemplate.subjectTemplate);
      setBody(mockTemplate.bodyTemplate);
      setHtmlBody(mockTemplate.htmlTemplate || '');
      setVariables(mockTemplate.variables);
      setIsActive(mockTemplate.isActive);
    } finally {
      setLoading(false);
    }
  };

  const fetchVersions = async () => {
    try {
      // Mock data - replace with actual API call
      const mockVersions: TemplateVersion[] = [
        {
          id: '1',
          version: 3,
          createdAt: new Date().toISOString(),
          createdBy: 'admin@example.com',
          changes: 'Updated HTML formatting',
        },
        {
          id: '2',
          version: 2,
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          createdBy: 'admin@example.com',
          changes: 'Added actionUrl variable',
        },
        {
          id: '3',
          version: 1,
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          createdBy: 'admin@example.com',
          changes: 'Initial version',
        },
      ];
      setVersions(mockVersions);
    } catch (err) {
      console.error('Failed to fetch versions:', err);
    }
  };

  const handleSave = async () => {
    if (!tenantId) return;

    setSaving(true);
    setError('');
    setSuccess('');
    try {
      // Validate
      if (!name.trim()) {
        throw new Error('Template name is required');
      }
      if (!subject.trim()) {
        throw new Error('Subject is required');
      }
      if (!body.trim()) {
        throw new Error('Body is required');
      }

      // Update template via API
      await updateNotificationTemplate(templateId, {
        tenantId,
        userId: user?.id || '00000000-0000-0000-0000-000000000001',
        name,
        description,
        category,
        type,
        subjectTemplate: subject,
        bodyTemplate: body,
        htmlTemplate: htmlBody,
        variables,
        isActive,
      });

      setSuccess('Template saved successfully');
      fetchTemplate();
    } catch (err: any) {
      console.error('Error saving template:', err);
      setError(err?.message || 'Failed to save template');
    } finally {
      setSaving(false);
    }
  };

  const handleTestSend = async () => {
    setTesting(true);
    setError('');
    setSuccess('');
    try {
      // Validate
      if (!testRecipient.trim()) {
        throw new Error('Recipient is required');
      }

      // Check all variables have values
      const missingVars = variables.filter(v => !testVariableValues[v]?.trim());
      if (missingVars.length > 0) {
        throw new Error(`Please provide values for: ${missingVars.join(', ')}`);
      }

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setSuccess(`Test notification sent to ${testRecipient}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send test notification');
    } finally {
      setTesting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this template? This action cannot be undone.')) {
      return;
    }

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      navigate('/tenant/notifications?tab=templates');
    } catch (err) {
      setError('Failed to delete template');
    }
  };

  const insertVariable = (variable: string) => {
    const cursorPos = (document.activeElement as HTMLTextAreaElement)?.selectionStart || body.length;
    const beforeCursor = body.substring(0, cursorPos);
    const afterCursor = body.substring(cursorPos);
    setBody(beforeCursor + `{{${variable}}}` + afterCursor);
  };

  const insertVariableIntoHtml = (variable: string) => {
    const cursorPos = (document.activeElement as HTMLTextAreaElement)?.selectionStart || htmlBody.length;
    const beforeCursor = htmlBody.substring(0, cursorPos);
    const afterCursor = htmlBody.substring(cursorPos);
    setHtmlBody(beforeCursor + `{{${variable}}}` + afterCursor);
  };

  const addVariable = () => {
    const newVar = prompt('Enter variable name:');
    if (newVar && newVar.trim() && !variables.includes(newVar.trim())) {
      const updatedVars = [...variables, newVar.trim()];
      setVariables(updatedVars);
      setTestVariableValues({ ...testVariableValues, [newVar.trim()]: '' });
    }
  };

  const removeVariable = (variable: string) => {
    setVariables(variables.filter(v => v !== variable));
    const updated = { ...testVariableValues };
    delete updated[variable];
    setTestVariableValues(updated);
  };

  const renderPreview = () => {
    let previewSubject = subject;
    let previewBody = previewMode === 'html' ? htmlBody : body;

    // Replace variables with test values
    variables.forEach(variable => {
      const value = testVariableValues[variable] || `{{${variable}}}`;
      const regex = new RegExp(`{{${variable}}}`, 'g');
      previewSubject = previewSubject.replace(regex, value);
      previewBody = previewBody.replace(regex, value);
    });

    return { subject: previewSubject, body: previewBody };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return <div className="p-8">{t('common.loading')}</div>;
  }

  if (!template) {
    return <div className="p-8">Template not found</div>;
  }

  const preview = renderPreview();

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="text-indigo-600 hover:text-indigo-900 mb-2 flex items-center gap-2"
        >
          ← Back to Templates
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{name || 'New Template'}</h1>
            <p className="mt-2 text-gray-600">{description}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Template'}
            </button>
            <button
              onClick={handleDelete}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Alerts */}
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

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {(['editor', 'preview', 'test', 'versions', 'settings'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                activeTab === tab
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Editor Tab */}
      {activeTab === 'editor' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Subject Template</h2>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter subject template..."
              />
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Body Template (Plain Text)</h2>
                <button
                  onClick={() => setShowPreviewModal(true)}
                  className="text-indigo-600 hover:text-indigo-900 text-sm"
                >
                  Preview
                </button>
              </div>
              <textarea
                className="w-full border border-gray-300 rounded-md px-3 py-2 font-mono text-sm"
                rows={12}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Enter body template..."
              />
            </div>

            {type === 'Email' && (
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">HTML Template (Optional)</h2>
                <textarea
                  className="w-full border border-gray-300 rounded-md px-3 py-2 font-mono text-sm"
                  rows={12}
                  value={htmlBody}
                  onChange={(e) => setHtmlBody(e.target.value)}
                  placeholder="Enter HTML template..."
                />
              </div>
            )}
          </div>

          {/* Variables Sidebar */}
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Variables</h3>
                <button
                  onClick={addVariable}
                  className="text-indigo-600 hover:text-indigo-900 text-sm"
                >
                  + Add
                </button>
              </div>
              <div className="space-y-2">
                {variables.map((variable) => (
                  <div key={variable} className="flex items-center justify-between p-2 border border-gray-200 rounded">
                    <code className="text-sm text-gray-900">{'{{' + variable + '}}'}</code>
                    <div className="flex gap-2">
                      <button
                        onClick={() => insertVariable(variable)}
                        className="text-indigo-600 hover:text-indigo-900 text-xs"
                        title="Insert into body"
                      >
                        Insert
                      </button>
                      <button
                        onClick={() => removeVariable(variable)}
                        className="text-red-600 hover:text-red-900 text-xs"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
                {variables.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">No variables defined</p>
                )}
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setActiveTab('preview')}
                  className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 text-sm"
                >
                  Preview Template
                </button>
                <button
                  onClick={() => setActiveTab('test')}
                  className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 text-sm"
                >
                  Send Test
                </button>
                <button
                  onClick={() => setActiveTab('versions')}
                  className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 text-sm"
                >
                  View History
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Tab */}
      {activeTab === 'preview' && (
        <div className="space-y-6">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Preview</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setPreviewMode('text')}
                  className={`px-3 py-1 text-sm rounded ${
                    previewMode === 'text'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  Text
                </button>
                {type === 'Email' && htmlBody && (
                  <button
                    onClick={() => setPreviewMode('html')}
                    className={`px-3 py-1 text-sm rounded ${
                      previewMode === 'html'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    HTML
                  </button>
                )}
              </div>
            </div>

            {/* Variable Values */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Variable Values for Preview</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {variables.map((variable) => (
                  <div key={variable}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{variable}</label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                      value={testVariableValues[variable] || ''}
                      onChange={(e) => setTestVariableValues({ ...testVariableValues, [variable]: e.target.value })}
                      placeholder={`Enter ${variable}...`}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Preview Display */}
            <div className="border-t border-gray-200 pt-4">
              <div className="mb-4">
                <div className="text-sm font-medium text-gray-500 mb-1">Subject:</div>
                <div className="p-3 bg-gray-50 rounded border border-gray-200">
                  {preview.subject}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500 mb-1">Body:</div>
                {previewMode === 'html' && htmlBody ? (
                  <div className="p-4 bg-white rounded border border-gray-200">
                    <iframe
                      srcDoc={preview.body}
                      className="w-full h-96 border-0"
                      title="HTML Preview"
                    />
                  </div>
                ) : (
                  <div className="p-3 bg-gray-50 rounded border border-gray-200 whitespace-pre-wrap">
                    {preview.body}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Test Tab */}
      {activeTab === 'test' && (
        <div className="max-w-2xl">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Send Test Notification</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {type === 'Email' ? 'Test Email Address' : 'Test Phone Number'}
                </label>
                <input
                  type={type === 'Email' ? 'email' : 'tel'}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  value={testRecipient}
                  onChange={(e) => setTestRecipient(e.target.value)}
                  placeholder={type === 'Email' ? 'test@example.com' : '+1234567890'}
                />
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Variable Values</h3>
                <div className="space-y-3">
                  {variables.map((variable) => (
                    <div key={variable}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {variable}
                      </label>
                      <input
                        type="text"
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                        value={testVariableValues[variable] || ''}
                        onChange={(e) => setTestVariableValues({ ...testVariableValues, [variable]: e.target.value })}
                        placeholder={`Enter ${variable}...`}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={handleTestSend}
                  disabled={testing}
                  className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                >
                  {testing ? 'Sending...' : 'Send Test'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Versions Tab */}
      {activeTab === 'versions' && (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Version History</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {versions.map((version) => (
              <div key={version.id} className="p-6 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-semibold text-gray-900">Version {version.version}</span>
                      <span className="px-2 py-1 text-xs rounded bg-gray-100 text-gray-800">
                        {formatDate(version.createdAt)}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-gray-600">{version.changes}</p>
                    <p className="mt-1 text-xs text-gray-500">by {version.createdBy}</p>
                  </div>
                  <button className="text-indigo-600 hover:text-indigo-900 text-sm">
                    Restore
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="max-w-2xl">
          <div className="bg-white shadow rounded-lg p-6 space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Template Settings</h2>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Template Name</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <select
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  value={type}
                  onChange={(e) => setType(e.target.value as NotificationType)}
                >
                  {NOTIFICATION_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as NotificationCategory)}
                >
                  {NOTIFICATION_CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm font-medium text-gray-700">Active</span>
              </label>
              <p className="mt-1 text-xs text-gray-500">
                Inactive templates cannot be used for sending notifications
              </p>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
