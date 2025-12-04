import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getTenantId } from '@/lib/tenant-context';
import { useAuth } from '@/app/contexts/AuthContext';
import {
  NotificationTemplateDto,
  getNotificationTemplate,
  updateNotificationTemplate,
} from '@/lib/api/notifications';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Save,
  Trash2,
  Mail,
  Eye,
  Send,
  History,
  Settings,
  Variable,
  Plus,
  X,
  Code,
  FileText,
  Clock,
  User,
  CheckCircle,
  XCircle,
  Smartphone,
  Bell,
  RefreshCw,
} from 'lucide-react';

interface TemplateVersion {
  id: string;
  version: number;
  createdAt: string;
  createdBy: string;
  changes: string;
}

type Tab = 'editor' | 'preview' | 'test' | 'versions' | 'settings';

const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
  { key: 'editor', label: 'Editor', icon: Code },
  { key: 'preview', label: 'Preview', icon: Eye },
  { key: 'test', label: 'Test', icon: Send },
  { key: 'versions', label: 'Versions', icon: History },
  { key: 'settings', label: 'Settings', icon: Settings },
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
      <div className={`p-4 rounded-xl bg-gradient-to-br ${color}`}>{icon}</div>
    </div>
  </motion.div>
);

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
  const [category, setCategory] = useState<any>('Custom');
  const [type, setType] = useState<any>('Email');
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
      const templateData = await getNotificationTemplate(templateId);

      if (templateData) {
        setTemplate(templateData);
        setName(templateData.name);
        setDescription((templateData as any).description || '');
        setCategory((templateData as any).category || 'Custom');
        setType((templateData as any).type || 'Email');
        setSubject((templateData as any).subjectTemplate || '');
        setBody((templateData as any).bodyTemplate || '');
        setHtmlBody((templateData as any).htmlTemplate || '');
        setVariables((templateData as any).variables || []);
        setIsActive(templateData.isActive);

        const initialValues: Record<string, string> = {};
        (templateData.variables || []).forEach((v: string) => {
          initialValues[v] = '';
        });
        setTestVariableValues(initialValues);
      }
    } catch (err: any) {
      console.error('Error fetching template:', err);
      setError(err?.message || t('common.failedToLoadTemplate'));

      const mockTemplate: any = {
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
      if (!name.trim()) {
        throw new Error(t('common.templateNameRequired'));
      }
      if (!subject.trim()) {
        throw new Error(t('common.subjectRequired'));
      }
      if (!body.trim()) {
        throw new Error(t('common.bodyRequired'));
      }

      await updateNotificationTemplate(templateId, {
        name,
        isActive,
      } as any);

      setSuccess(t('common.templateSavedSuccessfully'));
      fetchTemplate();
    } catch (err: any) {
      console.error('Error saving template:', err);
      setError(err?.message || t('common.failedToSaveTemplate'));
    } finally {
      setSaving(false);
    }
  };

  const handleTestSend = async () => {
    setTesting(true);
    setError('');
    setSuccess('');
    try {
      if (!testRecipient.trim()) {
        throw new Error(t('common.recipientRequired'));
      }

      const missingVars = variables.filter(v => !testVariableValues[v]?.trim());
      if (missingVars.length > 0) {
        throw new Error(`${t('common.pleaseProvideValuesFor')} ${missingVars.join(', ')}`);
      }

      await new Promise((resolve) => setTimeout(resolve, 1500));

      setSuccess(`${t('common.testNotificationSentTo')} ${testRecipient}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.failedToSendTestNotification'));
    } finally {
      setTesting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(t('common.confirmDeleteTemplate'))) {
      return;
    }

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      navigate('/tenant/notifications?tab=templates');
    } catch (err) {
      setError(t('common.failedToDeleteTemplate'));
    }
  };

  const insertVariable = (variable: string) => {
    const cursorPos = (document.activeElement as HTMLTextAreaElement)?.selectionStart || body.length;
    const beforeCursor = body.substring(0, cursorPos);
    const afterCursor = body.substring(cursorPos);
    setBody(beforeCursor + `{{${variable}}}` + afterCursor);
  };

  const addVariable = () => {
    const newVar = prompt(t('common.enterVariableName'));
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

  const getTypeIcon = () => {
    switch (type) {
      case 'Email': return <Mail className="w-5 h-5" />;
      case 'SMS': return <Smartphone className="w-5 h-5" />;
      case 'Push': return <Bell className="w-5 h-5" />;
      default: return <Mail className="w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50 to-orange-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-8">
        <div className="flex items-center justify-center h-64">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <RefreshCw className="w-8 h-8 text-amber-600" />
          </motion.div>
        </div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50 to-orange-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-8">
        <div className="text-center text-gray-600 dark:text-gray-400">{t('templates.notFound')}</div>
      </div>
    );
  }

  const preview = renderPreview();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50 to-orange-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Helmet>
        <title>{name || 'Template'} - Notification Templates</title>
      </Helmet>

      <div className="p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <motion.button
            whileHover={{ x: -4 }}
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 mb-4 font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Templates
          </motion.button>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg">
                {getTypeIcon()}
                <span className="sr-only">{type}</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                  {name || 'New Template'}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">{description}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                    isActive
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                    {isActive ? t('common.active') : 'Inactive'}
                  </span>
                  <span className="px-3 py-1 text-sm font-medium rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                    {category}
                  </span>
                  <span className="px-3 py-1 text-sm font-medium rounded-full bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400">
                    {type}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
              >
                <Save className="w-5 h-5" />
                {saving ? t('common.saving') : t('common.saveTemplate')}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleDelete}
                className="flex items-center gap-2 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                <Trash2 className="w-5 h-5" />
              </motion.button>
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
              className="mb-6 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl flex items-center gap-3"
            >
              <XCircle className="w-5 h-5" />
              {error}
            </motion.div>
          )}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 px-4 py-3 rounded-xl flex items-center gap-3"
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
          className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 mb-6"
        >
          <nav className="flex p-2">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`relative flex items-center gap-2 py-3 px-6 rounded-lg font-medium transition-all ${
                  activeTab === tab.key
                    ? 'text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700'
                }`}
              >
                {activeTab === tab.key && (
                  <motion.div
                    layoutId="activeTemplateTab"
                    className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-600 rounded-lg"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <tab.icon className="w-4 h-4 relative z-10" />
                <span className="relative z-10">{tab.label}</span>
              </button>
            ))}
          </nav>
        </motion.div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'editor' && (
            <motion.div
              key="editor"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Subject Template</h2>
                  <input
                    type="text"
                    className="w-full border border-gray-300 dark:border-slate-600 rounded-xl px-4 py-3 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Enter subject template..."
                  />
                </div>

                <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Body Template (Plain Text)</h2>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      onClick={() => setShowPreviewModal(true)}
                      className="flex items-center gap-2 text-amber-600 hover:text-amber-700 dark:text-amber-400 font-medium"
                    >
                      <Eye className="w-4 h-4" />
                      Preview
                    </motion.button>
                  </div>
                  <textarea
                    className="w-full border border-gray-300 dark:border-slate-600 rounded-xl px-4 py-3 bg-white dark:bg-slate-700 text-gray-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                    rows={12}
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Enter body template..."
                  />
                </div>

                {type === 'Email' && (
                  <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">HTML Template (Optional)</h2>
                    <textarea
                      className="w-full border border-gray-300 dark:border-slate-600 rounded-xl px-4 py-3 bg-white dark:bg-slate-700 text-gray-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
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
                <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <Variable className="w-5 h-5 text-amber-500" />
                      Variables
                    </h3>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      onClick={addVariable}
                      className="flex items-center gap-1 text-amber-600 hover:text-amber-700 dark:text-amber-400 font-medium text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      Add
                    </motion.button>
                  </div>
                  <div className="space-y-2">
                    {variables.map((variable) => (
                      <motion.div
                        key={variable}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center justify-between p-3 border border-gray-200 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-700/50"
                      >
                        <code className="text-sm text-gray-900 dark:text-white font-mono">{'{{' + variable + '}}'}</code>
                        <div className="flex gap-2">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            onClick={() => insertVariable(variable)}
                            className="text-amber-600 hover:text-amber-700 dark:text-amber-400 text-xs font-medium"
                          >
                            Insert
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            onClick={() => removeVariable(variable)}
                            className="text-red-600 hover:text-red-700 dark:text-red-400 text-xs font-medium"
                          >
                            <X className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                    {variables.length === 0 && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No variables defined</p>
                    )}
                  </div>
                </div>

                <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
                  <div className="space-y-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      onClick={() => setActiveTab('preview')}
                      className="w-full flex items-center justify-center gap-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 px-4 py-3 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors font-medium"
                    >
                      <Eye className="w-4 h-4" />
                      Preview Template
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      onClick={() => setActiveTab('test')}
                      className="w-full flex items-center justify-center gap-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 px-4 py-3 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors font-medium"
                    >
                      <Send className="w-4 h-4" />
                      Send Test
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      onClick={() => setActiveTab('versions')}
                      className="w-full flex items-center justify-center gap-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 px-4 py-3 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors font-medium"
                    >
                      <History className="w-4 h-4" />
                      View History
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'preview' && (
            <motion.div
              key="preview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Preview</h2>
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      onClick={() => setPreviewMode('text')}
                      className={`px-4 py-2 text-sm rounded-lg font-medium transition-all ${
                        previewMode === 'text'
                          ? 'bg-amber-500 text-white'
                          : 'bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      Text
                    </motion.button>
                    {type === 'Email' && htmlBody && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        onClick={() => setPreviewMode('html')}
                        className={`px-4 py-2 text-sm rounded-lg font-medium transition-all ${
                          previewMode === 'html'
                            ? 'bg-amber-500 text-white'
                            : 'bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        HTML
                      </motion.button>
                    )}
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Variable Values for Preview</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {variables.map((variable) => (
                      <div key={variable}>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{variable}</label>
                        <input
                          type="text"
                          className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500"
                          value={testVariableValues[variable] || ''}
                          onChange={(e) => setTestVariableValues({ ...testVariableValues, [variable]: e.target.value })}
                          placeholder={`Enter ${variable}...`}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-slate-600 pt-4">
                  <div className="mb-4">
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Subject:</div>
                    <div className="p-4 bg-gray-50 dark:bg-slate-700 rounded-lg border border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white">
                      {preview.subject}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Body:</div>
                    {previewMode === 'html' && htmlBody ? (
                      <div className="p-4 bg-white dark:bg-slate-700 rounded-lg border border-gray-200 dark:border-slate-600">
                        <iframe
                          srcDoc={preview.body}
                          className="w-full h-96 border-0"
                          title="HTML Preview"
                        />
                      </div>
                    ) : (
                      <div className="p-4 bg-gray-50 dark:bg-slate-700 rounded-lg border border-gray-200 dark:border-slate-600 whitespace-pre-wrap text-gray-900 dark:text-white">
                        {preview.body}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'test' && (
            <motion.div
              key="test"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl"
            >
              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Send className="w-5 h-5 text-amber-500" />
                  Send Test Notification
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {type === 'Email' ? 'Test Email Address' : 'Test Phone Number'}
                    </label>
                    <input
                      type={type === 'Email' ? 'email' : 'tel'}
                      className="w-full border border-gray-300 dark:border-slate-600 rounded-xl px-4 py-3 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                      value={testRecipient}
                      onChange={(e) => setTestRecipient(e.target.value)}
                      placeholder={type === 'Email' ? 'test@example.com' : '+1234567890'}
                    />
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Variable Values</h3>
                    <div className="space-y-3">
                      {variables.map((variable) => (
                        <div key={variable}>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            {variable}
                          </label>
                          <input
                            type="text"
                            className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-4 py-2 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                            value={testVariableValues[variable] || ''}
                            onChange={(e) => setTestVariableValues({ ...testVariableValues, [variable]: e.target.value })}
                            placeholder={`Enter ${variable}...`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleTestSend}
                      disabled={testing}
                      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                    >
                      <Send className="w-5 h-5" />
                      {testing ? 'Sending...' : 'Send Test'}
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'versions' && (
            <motion.div
              key="versions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <History className="w-5 h-5 text-amber-500" />
                  Version History
                </h2>
              </div>
              <div className="divide-y divide-gray-200 dark:divide-slate-700">
                {versions.map((version, index) => (
                  <motion.div
                    key={version.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-6 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-semibold text-gray-900 dark:text-white">Version {version.version}</span>
                          <span className="px-3 py-1 text-xs rounded-full bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-300 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDate(version.createdAt)}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{version.changes}</p>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-500 flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {version.createdBy}
                        </p>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        className="text-amber-600 hover:text-amber-700 dark:text-amber-400 font-medium"
                      >
                        Restore
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl"
            >
              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6 space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-amber-500" />
                    Template Settings
                  </h2>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Template Name</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 dark:border-slate-600 rounded-xl px-4 py-3 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
                  <textarea
                    className="w-full border border-gray-300 dark:border-slate-600 rounded-xl px-4 py-3 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Type</label>
                    <select
                      className="w-full border border-gray-300 dark:border-slate-600 rounded-xl px-4 py-3 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                      value={type}
                      onChange={(e) => setType(e.target.value as any)}
                    >
                      {['Email', 'SMS', 'Push'].map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
                    <select
                      className="w-full border border-gray-300 dark:border-slate-600 rounded-xl px-4 py-3 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                      value={category}
                      onChange={(e) => setCategory(e.target.value as any)}
                    >
                      {['User', 'System', 'Security', 'Custom'].map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="w-5 h-5 rounded text-amber-500 focus:ring-amber-500"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Active</span>
                  </label>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 ml-8">
                    Inactive templates cannot be used for sending notifications
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-slate-600">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                  >
                    <Save className="w-5 h-5" />
                    {saving ? t('common.saving') : 'Save Settings'}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
