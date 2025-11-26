import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocale } from '@/hooks/useLocale';
import { globalService } from '@/lib/api/services/global.service';
import {
  getGlobalTemplates,
  createGlobalTemplate,
  publishTemplate,
  updateGlobalTemplate,
  deleteGlobalTemplate,
  AutomationWorkflowDto,
  EVENT_TYPES,
  ACTION_TYPES,
} from '@/lib/api/automation';

interface Template {
  id: string;
  name: string;
  type: 'workflow' | 'email' | 'policy' | 'report';
  category: string;
  description: string;
  content: any;
  variables: string[];
  isPublished: boolean;
  isEnforced?: boolean;
  createdAt: string;
  updatedAt: string;
  usageCount?: number;
}

type TemplateType = 'workflow' | 'email' | 'policy' | 'report';
type TabType = 'all' | TemplateType;

export default function GlobalTemplatesPage() {
  const { t } = useTranslation();
  const locale = useLocale();
  const [userId] = useState('00000000-0000-0000-0000-000000000001');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('all');

  const [templates, setTemplates] = useState<Template[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [publishedFilter, setPublishedFilter] = useState<'all' | 'published' | 'draft'>('all');

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
    fetchTemplates();
  }, []);

  useEffect(() => {
    filterTemplates();
  }, [templates, activeTab, searchQuery, categoryFilter, publishedFilter]);

  const fetchTemplates = async () => {
    setLoading(true);
    setError('');

    try {
      // Fetch all template types in parallel
      const [workflowTemplates, emailTemplates, policyTemplates, reportTemplates] = await Promise.all([
        getGlobalTemplates(),
        globalService.getEmailTemplates(),
        globalService.getPolicyTemplates(),
        globalService.getReportTemplates(),
      ]);

      // Convert workflow templates to unified Template format
      const workflowItems: Template[] = (workflowTemplates || []).map((wt: AutomationWorkflowDto) => ({
        id: wt.id,
        name: wt.name,
        type: 'workflow' as TemplateType,
        category: wt.severity || 'General',
        description: wt.description || '',
        content: {
          triggers: wt.triggers,
          conditions: wt.conditions,
          actions: wt.actions,
          tenantCanDisable: wt.tenantCanDisable,
          tenantCanOverrideConditions: wt.tenantCanOverrideConditions,
        },
        variables: extractVariables(wt),
        isPublished: wt.isEnabled,
        isEnforced: wt.isEnforced,
        createdAt: wt.createdAt,
        updatedAt: wt.updatedAt || wt.createdAt,
        usageCount: 0,
      }));

      // Convert email templates
      const emailItems: Template[] = (emailTemplates || []).map((et: any) => ({
        id: et.id,
        name: et.name,
        type: 'email' as TemplateType,
        category: et.category || 'General',
        description: et.description || '',
        content: et.content || {},
        variables: et.variables || [],
        isPublished: et.isPublished ?? true,
        createdAt: et.createdAt,
        updatedAt: et.updatedAt || et.createdAt,
        usageCount: et.usageCount || 0,
      }));

      // Convert policy templates
      const policyItems: Template[] = (policyTemplates || []).map((pt: any) => ({
        id: pt.id,
        name: pt.name,
        type: 'policy' as TemplateType,
        category: pt.category || 'Security',
        description: pt.description || '',
        content: pt.content || {},
        variables: pt.variables || [],
        isPublished: pt.isPublished ?? true,
        isEnforced: pt.isEnforced,
        createdAt: pt.createdAt,
        updatedAt: pt.updatedAt || pt.createdAt,
        usageCount: pt.usageCount || 0,
      }));

      // Convert report templates
      const reportItems: Template[] = (reportTemplates || []).map((rt: any) => ({
        id: rt.id,
        name: rt.name,
        type: 'report' as TemplateType,
        category: rt.category || 'Compliance',
        description: rt.description || '',
        content: rt.content || {},
        variables: rt.variables || [],
        isPublished: rt.isPublished ?? true,
        createdAt: rt.createdAt,
        updatedAt: rt.updatedAt || rt.createdAt,
        usageCount: rt.usageCount || 0,
      }));

      const allTemplates: Template[] = [
        ...workflowItems,
        ...emailItems,
        ...policyItems,
        ...reportItems,
      ];

      setTemplates(allTemplates);
    } catch (err) {
      console.error('Error fetching templates:', err);
      setError('Failed to load templates');
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  const extractVariables = (workflow: AutomationWorkflowDto): string[] => {
    const variables: string[] = [];
    workflow.actions.forEach(action => {
      try {
        const config = JSON.parse(action.configJson);
        const matches = JSON.stringify(config).match(/\{\{(\w+)\}\}/g);
        if (matches) {
          variables.push(...matches.map(m => m.replace(/\{\{|\}\}/g, '')));
        }
      } catch {}
    });
    return [...new Set(variables)];
  };

  const filterTemplates = () => {
    let filtered = templates;

    // Filter by tab
    if (activeTab !== 'all') {
      filtered = filtered.filter(t => t.type === activeTab);
    }

    // Filter by category
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(t => t.category === categoryFilter);
    }

    // Filter by published status
    if (publishedFilter === 'published') {
      filtered = filtered.filter(t => t.isPublished);
    } else if (publishedFilter === 'draft') {
      filtered = filtered.filter(t => !t.isPublished);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(t =>
        t.name.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query) ||
        t.category.toLowerCase().includes(query)
      );
    }

    setFilteredTemplates(filtered);
  };

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      let content;
      try {
        content = JSON.parse(newTemplate.content);
      } catch {
        setError('Invalid JSON content');
        return;
      }

      // For workflow templates, use the automation API
      if (newTemplate.type === 'workflow') {
        await createGlobalTemplate({
          userId,
          name: newTemplate.name,
          description: newTemplate.description,
          severity: newTemplate.category || 'Info',
          tenantCanDisable: content.tenantCanDisable ?? true,
          tenantCanOverrideConditions: content.tenantCanOverrideConditions ?? true,
          triggers: content.triggers || [],
          conditions: content.conditions || [],
          actions: content.actions || [],
        });
      } else {
        // For other types, add to local state as demo
        const newTemplateData: Template = {
          id: `temp-${Date.now()}`,
          ...newTemplate,
          content,
          isPublished: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          usageCount: 0,
        };
        setTemplates([...templates, newTemplateData]);
      }

      setSuccess('Template created successfully');
      setShowCreateModal(false);
      resetNewTemplate();
      fetchTemplates();
    } catch (err: any) {
      setError(err.message || t('common.failedToCreateTemplate'));
    }
  };

  const handlePublishTemplate = async (template: Template) => {
    try {
      if (template.type === 'workflow') {
        await publishTemplate(template.id, userId);
        setSuccess('Template published successfully');
        fetchTemplates();
      } else {
        // Update locally for other types
        setTemplates(templates.map(t =>
          t.id === template.id ? { ...t, isPublished: true, updatedAt: new Date().toISOString() } : t
        ));
        setSuccess('Template published successfully');
      }
    } catch (err: any) {
      setError(err.message || t('common.failedToPublishTemplate'));
    }
  };

  const handleUnpublishTemplate = (template: Template) => {
    // Update locally
    setTemplates(templates.map(t =>
      t.id === template.id ? { ...t, isPublished: false, updatedAt: new Date().toISOString() } : t
    ));
    setSuccess('Template unpublished successfully');
  };

  const handleDeleteTemplate = async (template: Template) => {
    if (!confirm(`Are you sure you want to delete "${template.name}"? This will affect all tenants using this template.`)) return;

    try {
      if (template.type === 'workflow') {
        await deleteGlobalTemplate(template.id, userId);
        setSuccess('Template deleted successfully');
        fetchTemplates();
      } else {
        setTemplates(templates.filter(t => t.id !== template.id));
        setSuccess('Template deleted successfully');
      }
    } catch (err: any) {
      setError(err.message || t('common.failedToDeleteTemplate'));
    }
  };

  const handleEditTemplate = (template: Template) => {
    setSelectedTemplate(template);
    setNewTemplate({
      name: template.name,
      type: template.type,
      category: template.category,
      description: template.description,
      content: JSON.stringify(template.content, null, 2),
      variables: template.variables,
    });
    setShowEditModal(true);
  };

  const handleUpdateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTemplate) return;

    try {
      const content = JSON.parse(newTemplate.content);

      if (selectedTemplate.type === 'workflow') {
        await updateGlobalTemplate(selectedTemplate.id, {
          userId,
          name: newTemplate.name,
          description: newTemplate.description,
          severity: newTemplate.category,
          tenantCanDisable: content.tenantCanDisable ?? true,
          tenantCanOverrideConditions: content.tenantCanOverrideConditions ?? true,
          triggers: content.triggers || [],
          conditions: content.conditions || [],
          actions: content.actions || [],
        });
        setSuccess('Template updated successfully');
        fetchTemplates();
      } else {
        const updatedTemplate: Template = {
          ...selectedTemplate,
          name: newTemplate.name,
          type: newTemplate.type,
          category: newTemplate.category,
          description: newTemplate.description,
          content,
          variables: newTemplate.variables,
          updatedAt: new Date().toISOString(),
        };
        setTemplates(templates.map(t => t.id === selectedTemplate.id ? updatedTemplate : t));
        setSuccess('Template updated successfully');
      }

      setShowEditModal(false);
      setSelectedTemplate(null);
      resetNewTemplate();
    } catch (err: any) {
      setError(err.message || 'Invalid JSON content');
    }
  };

  const handleCloneTemplate = (template: Template) => {
    const cloned: Template = {
      ...template,
      id: `temp-${Date.now()}`,
      name: `${template.name} (Copy)`,
      isPublished: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      usageCount: 0,
    };
    setTemplates([...templates, cloned]);
    setSuccess('Template cloned successfully');
  };

  const handlePreview = (template: Template) => {
    setSelectedTemplate(template);
    setShowPreviewModal(true);
  };

  const resetNewTemplate = () => {
    setNewTemplate({
      name: '',
      type: 'workflow',
      category: '',
      description: '',
      content: '{}',
      variables: [],
    });
  };

  const getCategories = () => {
    const categories = new Set(templates.map(t => t.category));
    return ['all', ...Array.from(categories)];
  };

  const getTypeIcon = (type: TemplateType) => {
    switch (type) {
      case 'workflow': return '⚡';
      case 'email': return '✉️';
      case 'policy': return '📋';
      case 'report': return '📊';
      default: return '📄';
    }
  };

  const getTypeBadgeColor = (type: TemplateType) => {
    switch (type) {
      case 'workflow': return 'bg-purple-100 text-purple-800';
      case 'email': return 'bg-blue-100 text-blue-800';
      case 'policy': return 'bg-yellow-100 text-yellow-800';
      case 'report': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="p-8">{t('common.loading')}</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Global Template Management</h1>
          <p className="text-gray-600 mt-1">Manage system-wide templates available to all tenants</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          Create Global Template
        </button>
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

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {(['all', 'workflow', 'email', 'policy', 'report'] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab === 'all' ? 'All Templates' : `${tab.charAt(0).toUpperCase() + tab.slice(1)} Templates`}
              <span className="ml-2 text-xs text-gray-500">
                ({templates.filter(t => tab === 'all' || t.type === tab).length})
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Search</label>
            <input
              type="text"
              placeholder="Search templates..."
              className="w-full px-3 py-2 border rounded"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <select
              className="w-full px-3 py-2 border rounded"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              {getCategories().map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Status</label>
            <select
              className="w-full px-3 py-2 border rounded"
              value={publishedFilter}
              onChange={(e) => setPublishedFilter(e.target.value as any)}
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <div key={template.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center flex-1">
                  <span className="text-2xl mr-2">{getTypeIcon(template.type)}</span>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{template.name}</h3>
                    <div className="flex gap-2 mt-1">
                      <span className={`inline-block px-2 py-1 rounded text-xs ${getTypeBadgeColor(template.type)}`}>
                        {template.type}
                      </span>
                      {template.isPublished ? (
                        <span className="inline-block px-2 py-1 rounded text-xs bg-green-100 text-green-800">
                          Published
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-1 rounded text-xs bg-gray-100 text-gray-800">
                          Draft
                        </span>
                      )}
                      {template.isEnforced && (
                        <span className="inline-block px-2 py-1 rounded text-xs bg-purple-100 text-purple-800">
                          Enforced
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{template.description}</p>

              <div className="mb-3">
                <span className="text-xs font-medium text-gray-500">Category: </span>
                <span className="text-xs text-gray-700">{template.category}</span>
              </div>

              {template.usageCount !== undefined && (
                <div className="mb-3">
                  <span className="text-xs font-medium text-gray-500">Usage: </span>
                  <span className="text-xs text-gray-700">{template.usageCount} tenants</span>
                </div>
              )}

              {template.variables.length > 0 && (
                <div className="mb-3">
                  <span className="text-xs font-medium text-gray-500">Variables: </span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {template.variables.slice(0, 3).map((v, i) => (
                      <span key={i} className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {v}
                      </span>
                    ))}
                    {template.variables.length > 3 && (
                      <span className="text-xs text-gray-500">+{template.variables.length - 3} more</span>
                    )}
                  </div>
                </div>
              )}

              <div className="text-xs text-gray-500 mb-4">
                Updated: {new Date(template.updatedAt).toLocaleDateString(locale)}
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handlePreview(template)}
                  className="flex-1 text-sm px-3 py-2 bg-gray-100 rounded hover:bg-gray-200"
                >
                  Preview
                </button>
                <button
                  onClick={() => handleEditTemplate(template)}
                  className="flex-1 text-sm px-3 py-2 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200"
                >
                  Edit
                </button>
                {!template.isPublished ? (
                  <button
                    onClick={() => handlePublishTemplate(template)}
                    className="text-sm px-3 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200"
                  >
                    Publish
                  </button>
                ) : (
                  <button
                    onClick={() => handleUnpublishTemplate(template)}
                    className="text-sm px-3 py-2 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200"
                  >
                    Unpublish
                  </button>
                )}
                <button
                  onClick={() => handleCloneTemplate(template)}
                  className="text-sm px-3 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                >
                  Clone
                </button>
                <button
                  onClick={() => handleDeleteTemplate(template)}
                  className="text-sm px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredTemplates.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500">
            No templates found. Create your first global template to get started.
          </div>
        )}
      </div>

      {/* Create/Edit Template Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">
                {showEditModal ? 'Edit Global Template' : 'Create Global Template'}
              </h2>
              <form onSubmit={showEditModal ? handleUpdateTemplate : handleCreateTemplate}>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Template Name</label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border rounded"
                      value={newTemplate.name}
                      onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Type</label>
                    <select
                      className="w-full px-3 py-2 border rounded"
                      value={newTemplate.type}
                      onChange={(e) => setNewTemplate({ ...newTemplate, type: e.target.value as TemplateType })}
                    >
                      <option value="workflow">Workflow</option>
                      <option value="email">Email</option>
                      <option value="policy">Policy</option>
                      <option value="report">Report</option>
                    </select>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border rounded"
                    value={newTemplate.category}
                    onChange={(e) => setNewTemplate({ ...newTemplate, category: e.target.value })}
                    placeholder="e.g., Security, Onboarding, Compliance"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    className="w-full px-3 py-2 border rounded"
                    rows={2}
                    value={newTemplate.description}
                    onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    Template Content (JSON)
                  </label>
                  <textarea
                    required
                    className="w-full px-3 py-2 border rounded font-mono text-sm"
                    rows={12}
                    value={newTemplate.content}
                    onChange={(e) => setNewTemplate({ ...newTemplate, content: e.target.value })}
                    placeholder='{"key": "value"}'
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter valid JSON content. For workflows, include triggers, conditions, and actions.
                  </p>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    Variables (comma-separated)
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border rounded"
                    value={newTemplate.variables.join(', ')}
                    onChange={(e) => setNewTemplate({
                      ...newTemplate,
                      variables: e.target.value.split(',').map(v => v.trim()).filter(Boolean)
                    })}
                    placeholder="tenantName, userName, timestamp"
                  />
                </div>

                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setShowEditModal(false);
                      setSelectedTemplate(null);
                      resetNewTemplate();
                    }}
                    className="px-4 py-2 border rounded hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                  >
                    {showEditModal ? 'Update Template' : 'Create Template'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreviewModal && selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold">{selectedTemplate.name}</h2>
                  <div className="flex gap-2 mt-2">
                    <span className={`inline-block px-2 py-1 rounded text-xs ${getTypeBadgeColor(selectedTemplate.type)}`}>
                      {selectedTemplate.type}
                    </span>
                    {selectedTemplate.isPublished ? (
                      <span className="inline-block px-2 py-1 rounded text-xs bg-green-100 text-green-800">
                        Published
                      </span>
                    ) : (
                      <span className="inline-block px-2 py-1 rounded text-xs bg-gray-100 text-gray-800">
                        Draft
                      </span>
                    )}
                    {selectedTemplate.isEnforced && (
                      <span className="inline-block px-2 py-1 rounded text-xs bg-purple-100 text-purple-800">
                        Enforced
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowPreviewModal(false);
                    setSelectedTemplate(null);
                  }}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ✕
                </button>
              </div>

              <div className="mb-4">
                <p className="text-gray-600">{selectedTemplate.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <span className="font-medium">Category: </span>
                  <span className="text-gray-700">{selectedTemplate.category}</span>
                </div>
                {selectedTemplate.usageCount !== undefined && (
                  <div>
                    <span className="font-medium">Usage: </span>
                    <span className="text-gray-700">{selectedTemplate.usageCount} tenants</span>
                  </div>
                )}
              </div>

              {selectedTemplate.variables.length > 0 && (
                <div className="mb-4">
                  <span className="font-medium">Variables: </span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedTemplate.variables.map((v, i) => (
                      <span key={i} className="bg-gray-100 px-3 py-1 rounded text-sm">
                        {v}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="mb-4">
                <h3 className="font-medium mb-2">Template Content:</h3>
                <pre className="bg-gray-50 p-4 rounded border overflow-x-auto text-sm">
                  {JSON.stringify(selectedTemplate.content, null, 2)}
                </pre>
              </div>

              <div className="text-sm text-gray-500">
                <div>Created: {new Date(selectedTemplate.createdAt).toLocaleString(locale)}</div>
                <div>Updated: {new Date(selectedTemplate.updatedAt).toLocaleString(locale)}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
