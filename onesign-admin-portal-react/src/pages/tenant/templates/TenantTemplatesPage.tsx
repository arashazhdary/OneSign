import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useLocale } from '@/hooks/useLocale';
import { getTenantId } from '@/lib/tenant-context';
import {
  getAvailableTemplates,
  AutomationWorkflowDto,
  automationService,
} from '@/lib/api/automation';
import {
  getChangeSetTemplates,
  ChangeSetTemplate,
} from '@/lib/api/change-management';
import { Helmet } from 'react-helmet-async';
import Modal from '@/components/common/Modal';
import {
  FileCode,
  Plus,
  Copy,
  Trash2,
  Edit,
  Eye,
  Search,
  Zap,
  Mail,
  FileText,
  BarChart3,
  CheckCircle,
  XCircle,
  Filter,
  LayoutGrid,
} from 'lucide-react';

interface Template {
  id: string;
  name: string;
  type: 'workflow' | 'email' | 'policy' | 'report';
  category: string;
  description: string;
  content: any;
  variables: string[];
  isPublished?: boolean;
  createdAt: string;
  updatedAt: string;
}

type TemplateType = 'workflow' | 'email' | 'policy' | 'report';
type TabType = 'all' | TemplateType;

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

export default function TenantTemplatesPage() {
  const { t } = useTranslation();
  const locale = useLocale();
  const [tenantId, setTenantIdState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('all');

  const [templates, setTemplates] = useState<Template[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  const [newTemplate, setNewTemplate] = useState({
    name: '',
    type: 'workflow' as TemplateType,
    category: '',
    description: '',
    content: '{}',
    variables: [] as string[],
  });

  useEffect(() => {
    const contextTenantId = getTenantId();
    setTenantIdState(contextTenantId || '00000000-0000-0000-0000-000000000000');
  }, []);

  useEffect(() => {
    if (tenantId) fetchTemplates();
  }, [tenantId]);

  useEffect(() => {
    filterTemplates();
  }, [templates, activeTab, searchQuery, categoryFilter]);

  const fetchTemplates = async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      const [workflowTemplates, changeTemplates] = await Promise.all([
        getAvailableTemplates().catch(() => []),
        getChangeSetTemplates(tenantId).catch(() => []),
      ]);

      const allTemplates: Template[] = [
        ...workflowTemplates.map((wt: AutomationWorkflowDto) => ({
          id: wt.id,
          name: wt.name,
          type: 'workflow' as TemplateType,
          category: wt.severity || 'General',
          description: wt.description || '',
          content: { triggers: wt.triggers, conditions: wt.conditions, actions: wt.actions },
          variables: extractVariables(wt),
          isPublished: wt.isEnabled,
          createdAt: wt.createdAt,
          updatedAt: wt.updatedAt || wt.createdAt,
        })),
        ...changeTemplates.map((ct: ChangeSetTemplate) => ({
          id: ct.id,
          name: ct.name,
          type: 'policy' as TemplateType,
          category: ct.type || 'General',
          description: ct.description || '',
          content: ct.steps || [],
          variables: [],
          createdAt: ct.createdAt,
          updatedAt: ct.updatedAt,
        })),
        ...getMockEmailTemplates(),
        ...getMockReportTemplates(),
      ];
      setTemplates(allTemplates);
    } catch (err) {
      console.error('Error fetching templates:', err);
      setTemplates([...getMockEmailTemplates(), ...getMockReportTemplates()]);
    } finally {
      setLoading(false);
    }
  };

  const extractVariables = (workflow: AutomationWorkflowDto): string[] => {
    const variables: string[] = [];
    workflow.actions.forEach(action => {
      try {
        const config = typeof action.config === 'string' ? JSON.parse(action.config) : action.config;
        const matches = JSON.stringify(config).match(/\{\{(\w+)\}\}/g);
        if (matches) variables.push(...matches.map(m => m.replace(/\{\{|\}\}/g, '')));
      } catch {}
    });
    return [...new Set(variables)];
  };

  const getMockEmailTemplates = (): Template[] => [
    { id: 'email-1', name: 'Welcome Email', type: 'email', category: 'Onboarding', description: 'Welcome email for new users', content: { subject: 'Welcome to {{tenantName}}', body: 'Hello {{userName}}!', htmlTemplate: '<h1>Welcome {{userName}}</h1>' }, variables: ['tenantName', 'userName'], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'email-2', name: 'Password Reset', type: 'email', category: 'Security', description: 'Password reset notification', content: { subject: 'Password Reset Request', body: 'Click here: {{resetLink}}' }, variables: ['resetLink', 'userName'], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  ];

  const getMockReportTemplates = (): Template[] => [
    { id: 'report-1', name: 'User Activity Report', type: 'report', category: 'Analytics', description: 'Monthly user activity summary', content: { metrics: ['activeUsers', 'signIns', 'failedLogins'], groupBy: 'day', charts: ['line', 'bar'] }, variables: ['startDate', 'endDate'], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  ];

  const filterTemplates = () => {
    let filtered = templates;
    if (activeTab !== 'all') filtered = filtered.filter(t => t.type === activeTab);
    if (categoryFilter !== 'all') filtered = filtered.filter(t => t.category === categoryFilter);
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(t => t.name.toLowerCase().includes(query) || t.description.toLowerCase().includes(query) || t.category.toLowerCase().includes(query));
    }
    setFilteredTemplates(filtered);
  };

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId) return;
    try {
      let content;
      try { content = JSON.parse(newTemplate.content); } catch { setError('Invalid JSON content'); return; }
      if (newTemplate.type === 'workflow') {
        await automationService.createTemplate({ name: newTemplate.name, description: newTemplate.description, category: newTemplate.category || 'General' });
      } else {
        const newTemplateData: Template = { id: `temp-${Date.now()}`, ...newTemplate, content, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
        setTemplates([...templates, newTemplateData]);
      }
      setSuccess(t('tenant.templates.messages.created'));
      setShowCreateModal(false);
      resetNewTemplate();
      fetchTemplates();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || t('tenant.templates.errors.failedToCreate'));
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleCloneTemplate = async (template: Template) => {
    if (!tenantId) return;
    try {
      if (template.type === 'workflow') {
        await automationService.cloneTemplate(template.id, `${template.name} (Copy)`);
        fetchTemplates();
      } else {
        const cloned: Template = { ...template, id: `temp-${Date.now()}`, name: `${template.name} (Copy)`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
        setTemplates([...templates, cloned]);
      }
      setSuccess(t('tenant.templates.messages.cloned'));
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || t('tenant.templates.errors.failedToClone'));
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDeleteTemplate = (template: Template) => {
    if (!confirm(t('tenant.templates.confirmDelete', { name: template.name }))) return;
    setTemplates(templates.filter(t => t.id !== template.id));
    setSuccess(t('tenant.templates.messages.deleted'));
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleEditTemplate = (template: Template) => {
    setSelectedTemplate(template);
    setNewTemplate({ name: template.name, type: template.type, category: template.category, description: template.description, content: JSON.stringify(template.content, null, 2), variables: template.variables });
    setShowEditModal(true);
  };

  const handleUpdateTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTemplate) return;
    try {
      const content = JSON.parse(newTemplate.content);
      const updatedTemplate: Template = { ...selectedTemplate, name: newTemplate.name, type: newTemplate.type, category: newTemplate.category, description: newTemplate.description, content, variables: newTemplate.variables, updatedAt: new Date().toISOString() };
      setTemplates(templates.map(t => t.id === selectedTemplate.id ? updatedTemplate : t));
      setSuccess(t('tenant.templates.messages.updated'));
      setShowEditModal(false);
      setSelectedTemplate(null);
      resetNewTemplate();
      setTimeout(() => setSuccess(''), 3000);
    } catch { setError(t('tenant.templates.errors.invalidJSON')); setTimeout(() => setError(''), 3000); }
  };

  const resetNewTemplate = () => setNewTemplate({ name: '', type: 'workflow', category: '', description: '', content: '{}', variables: [] });

  const getCategories = () => ['all', ...Array.from(new Set(templates.map(t => t.category)))];

  const getTypeIcon = (type: TemplateType) => {
    const icons: Record<string, React.ReactNode> = { workflow: <Zap className="w-5 h-5" />, email: <Mail className="w-5 h-5" />, policy: <FileText className="w-5 h-5" />, report: <BarChart3 className="w-5 h-5" /> };
    return icons[type] || <FileCode className="w-5 h-5" />;
  };

  const getTypeColor = (type: TemplateType) => {
    const colors: Record<string, string> = { workflow: 'from-purple-500 to-violet-600', email: 'from-blue-500 to-indigo-600', policy: 'from-amber-500 to-orange-600', report: 'from-green-500 to-emerald-600' };
    return colors[type] || 'from-gray-500 to-gray-600';
  };

  const tabs = [
    { key: 'all', label: t('tenant.templates.tabs.all'), count: templates.length },
    { key: 'workflow', label: t('tenant.templates.tabs.workflows'), count: templates.filter(t => t.type === 'workflow').length },
    { key: 'email', label: t('tenant.templates.tabs.emails'), count: templates.filter(t => t.type === 'email').length },
    { key: 'policy', label: t('tenant.templates.tabs.policies'), count: templates.filter(t => t.type === 'policy').length },
    { key: 'report', label: t('tenant.templates.tabs.reports'), count: templates.filter(t => t.type === 'report').length },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      <Helmet><title>{t('tenant.templates.title')} - OneSign</title></Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
              <FileCode className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('tenant.templates.title')}</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">{t('tenant.templates.subtitle')}</p>
            </div>
          </div>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowCreateModal(true)} className="mt-4 md:mt-0 flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
            <Plus className="w-5 h-5" /><span>{t('tenant.templates.createTemplate')}</span>
          </motion.button>
        </motion.div>

        {/* Messages */}
        <AnimatePresence>
          {error && <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl flex items-center space-x-3"><XCircle className="w-5 h-5 text-red-600 dark:text-red-400" /><span className="text-red-700 dark:text-red-300">{error}</span></motion.div>}
          {success && <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl flex items-center space-x-3"><CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" /><span className="text-green-700 dark:text-green-300">{success}</span></motion.div>}
        </AnimatePresence>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard title={t('tenant.templates.stats.total')} value={templates.length} icon={<LayoutGrid className="w-6 h-6 text-white" />} color="from-blue-500 to-indigo-600" delay={0} />
          <StatCard title={t('tenant.templates.stats.workflows')} value={templates.filter(t => t.type === 'workflow').length} icon={<Zap className="w-6 h-6 text-white" />} color="from-purple-500 to-violet-600" delay={1} />
          <StatCard title={t('tenant.templates.stats.emails')} value={templates.filter(t => t.type === 'email').length} icon={<Mail className="w-6 h-6 text-white" />} color="from-green-500 to-emerald-600" delay={2} />
          <StatCard title={t('tenant.templates.stats.reports')} value={templates.filter(t => t.type === 'report').length} icon={<BarChart3 className="w-6 h-6 text-white" />} color="from-orange-500 to-amber-600" delay={3} />
        </div>

        {/* Tabs */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 mb-6">
          <div className="flex border-b border-gray-200 dark:border-slate-700 overflow-x-auto">
            {tabs.map((tab) => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key as TabType)} className={`flex items-center space-x-2 px-6 py-4 font-medium transition-all relative whitespace-nowrap ${activeTab === tab.key ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}>
                <span>{tab.label}</span>
                <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 dark:bg-slate-700">{tab.count}</span>
                {activeTab === tab.key && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400" />}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="text" placeholder={t('tenant.templates.searchPlaceholder')} className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                {getCategories().map(cat => <option key={cat} value={cat}>{cat === 'all' ? t('tenant.templates.allCategories') : cat}</option>)}
              </select>
            </div>
          </div>
        </motion.div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredTemplates.map((template, idx) => (
              <motion.div key={template.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ delay: idx * 0.05 }} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 overflow-hidden hover:shadow-xl transition-all duration-300">
                <div className={`h-2 bg-gradient-to-r ${getTypeColor(template.type)}`} />
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg bg-gradient-to-br ${getTypeColor(template.type)}`}>
                        <span className="text-white">{getTypeIcon(template.type)}</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{template.name}</h3>
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium mt-1 bg-gradient-to-r ${getTypeColor(template.type)} text-white`}>{template.type}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">{template.description}</p>

                  <div className="mb-3">
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{t('tenant.templates.category')}: </span>
                    <span className="text-xs text-gray-700 dark:text-gray-300">{template.category}</span>
                  </div>

                  {template.variables.length > 0 && (
                    <div className="mb-3">
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{t('tenant.templates.variables')}: </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {template.variables.slice(0, 3).map((v, i) => <span key={i} className="text-xs bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded">{v}</span>)}
                        {template.variables.length > 3 && <span className="text-xs text-gray-500 dark:text-gray-400">+{template.variables.length - 3} {t('common.more')}</span>}
                      </div>
                    </div>
                  )}

                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-4">{t('tenant.templates.updated')}: {new Date(template.updatedAt).toLocaleDateString(locale)}</div>

                  <div className="flex flex-wrap gap-2">
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => { setSelectedTemplate(template); setShowPreviewModal(true); }} className="flex-1 text-sm px-3 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors flex items-center justify-center space-x-1">
                      <Eye className="w-4 h-4" /><span>{t('common.preview')}</span>
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleEditTemplate(template)} className="flex-1 text-sm px-3 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors flex items-center justify-center space-x-1">
                      <Edit className="w-4 h-4" /><span>{t('common.edit')}</span>
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleCloneTemplate(template)} className="p-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors">
                      <Copy className="w-4 h-4" />
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleDeleteTemplate(template)} className="p-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredTemplates.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
            <FileCode className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">{t('tenant.templates.noTemplates')}</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">{t('tenant.templates.noTemplatesDescription')}</p>
          </motion.div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal isOpen={showCreateModal || showEditModal} onClose={() => { setShowCreateModal(false); setShowEditModal(false); setSelectedTemplate(null); resetNewTemplate(); }} title={showEditModal ? t('tenant.templates.editTemplate') : t('tenant.templates.createTemplate')}>
        <form onSubmit={showEditModal ? handleUpdateTemplate : handleCreateTemplate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Template Name</label>
              <input type="text" required className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" value={newTemplate.name} onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Type</label>
              <select className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" value={newTemplate.type} onChange={(e) => setNewTemplate({ ...newTemplate, type: e.target.value as TemplateType })}>
                <option value="workflow">Workflow</option>
                <option value="email">Email</option>
                <option value="policy">Policy</option>
                <option value="report">Report</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
            <input type="text" required className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" value={newTemplate.category} onChange={(e) => setNewTemplate({ ...newTemplate, category: e.target.value })} placeholder="e.g., Security, Onboarding" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
            <textarea className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" rows={2} value={newTemplate.description} onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Template Content (JSON)</label>
            <textarea required className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm" rows={8} value={newTemplate.content} onChange={(e) => setNewTemplate({ ...newTemplate, content: e.target.value })} placeholder='{"key": "value"}' />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Variables (comma-separated)</label>
            <input type="text" className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" value={newTemplate.variables.join(', ')} onChange={(e) => setNewTemplate({ ...newTemplate, variables: e.target.value.split(',').map(v => v.trim()).filter(Boolean) })} placeholder="userName, tenantName, date" />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <motion.button type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => { setShowCreateModal(false); setShowEditModal(false); setSelectedTemplate(null); resetNewTemplate(); }} className="px-4 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">{t('common.cancel')}</motion.button>
            <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all">{showEditModal ? 'Update' : 'Create'}</motion.button>
          </div>
        </form>
      </Modal>

      {/* Preview Modal */}
      <Modal isOpen={showPreviewModal} onClose={() => { setShowPreviewModal(false); setSelectedTemplate(null); }} title={selectedTemplate?.name || 'Template Preview'}>
        {selectedTemplate && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r ${getTypeColor(selectedTemplate.type)} text-white`}>{selectedTemplate.type}</span>
              <span className="text-gray-500 dark:text-gray-400">{selectedTemplate.category}</span>
            </div>
            <p className="text-gray-600 dark:text-gray-300">{selectedTemplate.description}</p>
            {selectedTemplate.variables.length > 0 && (
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Variables: </span>
                <div className="flex flex-wrap gap-2 mt-2">{selectedTemplate.variables.map((v, i) => <span key={i} className="bg-gray-100 dark:bg-slate-700 px-3 py-1 rounded text-sm">{v}</span>)}</div>
              </div>
            )}
            <div>
              <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Template Content:</h3>
              <pre className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg border border-gray-200 dark:border-slate-600 overflow-x-auto text-sm">{JSON.stringify(selectedTemplate.content, null, 2)}</pre>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              <div>Created: {new Date(selectedTemplate.createdAt).toLocaleString(locale)}</div>
              <div>Updated: {new Date(selectedTemplate.updatedAt).toLocaleString(locale)}</div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
