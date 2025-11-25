import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  getGlobalTemplates,
  createGlobalTemplate,
  publishTemplate,
  enforceTemplate,
  unenforceTemplate,
  getGlobalTemplate,
  updateGlobalTemplate,
  deleteGlobalTemplate,
  AutomationWorkflowDto,
  EVENT_TYPES,
  ACTION_TYPES,
} from '@/lib/api/automation';
import { Helmet } from 'react-helmet-async';

type Tab = 'templates' | 'enforced' | 'executions';

export default function GlobalAutomationPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<Tab>('templates');
  const [userId] = useState('00000000-0000-0000-0000-000000000001');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [templates, setTemplates] = useState<AutomationWorkflowDto[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [templateDetail, setTemplateDetail] = useState<AutomationWorkflowDto | null>(null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    description: '',
    severity: 'Info',
    tenantCanDisable: true,
    tenantCanOverrideConditions: true,
    triggers: [{ eventType: EVENT_TYPES[0], sourceModule: 'Auth' }],
    conditions: [] as { expressionType: string; expression: string; order: number }[],
    actions: [{ actionType: ACTION_TYPES[0], order: 0, configJson: '{}', isCritical: false }],
  });

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getGlobalTemplates();
      setTemplates(data);
    } catch (err) {
      setError(t('common.error'));
      console.error('Error fetching templates:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTemplate = async () => {
    if (!selectedTemplateId) return;
    setError('');
    try {
      const data = await getGlobalTemplate(selectedTemplateId);
      setTemplateDetail(data);
    } catch (err) {
      setError(t('common.error'));
    }
  };

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await createGlobalTemplate({
        userId,
        ...newTemplate,
      });
      setSuccess(t('automation.workflowCreated'));
      setShowCreateModal(false);
      setNewTemplate({
        name: '',
        description: '',
        severity: 'Info',
        tenantCanDisable: true,
        tenantCanOverrideConditions: true,
        triggers: [{ eventType: EVENT_TYPES[0], sourceModule: 'Auth' }],
        conditions: [],
        actions: [{ actionType: ACTION_TYPES[0], order: 0, configJson: '{}', isCritical: false }],
      });
      fetchTemplates();
    } catch (err) {
      setError(t('common.error'));
    }
  };

  const handlePublish = async (id: string) => {
    try {
      await publishTemplate(id, userId);
      setSuccess('Template published successfully');
      fetchTemplates();
    } catch (err) {
      setError(t('common.error'));
    }
  };

  const handleEnforce = async (template: AutomationWorkflowDto) => {
    try {
      if (template.isEnforced) {
        await unenforceTemplate(template.id, userId);
        setSuccess('Template unenforced successfully');
      } else {
        await enforceTemplate(template.id, userId);
        setSuccess('Template enforced successfully');
      }
      fetchTemplates();
    } catch (err) {
      setError(t('common.error'));
    }
  };

  const handleUpdateTemplate = async (id: string, data: any) => {
    try {
      await updateGlobalTemplate(id, { ...data, userId });
      setSuccess('Template updated successfully');
      fetchTemplates();
    } catch (err) {
      setError(t('common.error'));
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;
    try {
      await deleteGlobalTemplate(id, userId);
      setSuccess('Template deleted successfully');
      fetchTemplates();
    } catch (err) {
      setError(t('common.error'));
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical': return 'bg-red-100 text-red-800';
      case 'Warning': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const enforcedTemplates = templates.filter(t => t.isEnforced);

  if (loading && !templates.length) {
    return <div className="p-8">{t('common.loading')}</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{t('automation.title')} - Global</h1>
        {activeTab === 'templates' && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Create Template
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>
      )}
      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">{success}</div>
      )}

      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {(['templates', 'enforced', 'executions'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab === 'templates' ? 'Templates' : tab === 'enforced' ? 'Enforced Workflows' : 'Executions'}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'templates' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('automation.name')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('automation.triggers')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('automation.severity')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('automation.status')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('automation.actions')}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {templates.map((template) => (
                <tr key={template.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{template.name}</div>
                    {template.description && (
                      <div className="text-sm text-gray-500">{template.description}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {template.triggers.map(t => t.eventType).join(', ')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded text-xs ${getSeverityColor(template.severity)}`}>
                      {template.severity}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      <span className={`px-2 py-1 rounded text-xs inline-block w-fit ${template.isEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {template.isEnabled ? 'Published' : 'Draft'}
                      </span>
                      {template.isEnforced && (
                        <span className="px-2 py-1 rounded text-xs bg-purple-100 text-purple-800 inline-block w-fit">
                          Enforced
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex flex-wrap gap-2">
                      {!template.isEnabled && (
                        <button
                          onClick={() => handlePublish(template.id)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Publish
                        </button>
                      )}
                      <button
                        onClick={() => handleEnforce(template)}
                        className="text-purple-600 hover:text-purple-900"
                      >
                        {template.isEnforced ? 'Unenforce' : 'Enforce'}
                      </button>
                      <button
                        onClick={() => handleDeleteTemplate(template.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {templates.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    {t('automation.noTemplates')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'enforced' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('automation.name')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('automation.triggers')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('automation.severity')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tenant Can Disable</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {enforcedTemplates.map((template) => (
                <tr key={template.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{template.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {template.triggers.map(t => t.eventType).join(', ')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded text-xs ${getSeverityColor(template.severity)}`}>
                      {template.severity}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {template.tenantCanDisable ? 'Yes' : 'No'}
                  </td>
                </tr>
              ))}
              {enforcedTemplates.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                    No enforced workflows.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'executions' && (
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-500">Execution overview will be available here. This view aggregates automation executions across all tenants for global monitoring and troubleshooting.</p>
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Create Global Template</h2>
            <form onSubmit={handleCreateTemplate}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">{t('automation.name')}</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border rounded"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">{t('automation.description')}</label>
                <textarea
                  className="w-full px-3 py-2 border rounded"
                  value={newTemplate.description}
                  onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">{t('automation.severity')}</label>
                <select
                  className="w-full px-3 py-2 border rounded"
                  value={newTemplate.severity}
                  onChange={(e) => setNewTemplate({ ...newTemplate, severity: e.target.value })}
                >
                  <option value="Info">Info</option>
                  <option value="Warning">Warning</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">{t('automation.trigger')}</label>
                <select
                  className="w-full px-3 py-2 border rounded"
                  value={newTemplate.triggers[0]?.eventType}
                  onChange={(e) => setNewTemplate({
                    ...newTemplate,
                    triggers: [{ eventType: e.target.value, sourceModule: e.target.value.split('.')[0] }]
                  })}
                >
                  {EVENT_TYPES.map(et => (
                    <option key={et} value={et}>{et}</option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">{t('automation.action')}</label>
                <select
                  className="w-full px-3 py-2 border rounded"
                  value={newTemplate.actions[0]?.actionType}
                  onChange={(e) => setNewTemplate({
                    ...newTemplate,
                    actions: [{ actionType: e.target.value, order: 0, configJson: '{}', isCritical: false }]
                  })}
                >
                  {ACTION_TYPES.map(at => (
                    <option key={at} value={at}>{at}</option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={newTemplate.tenantCanDisable}
                    onChange={(e) => setNewTemplate({ ...newTemplate, tenantCanDisable: e.target.checked })}
                  />
                  Tenant can disable
                </label>
              </div>
              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={newTemplate.tenantCanOverrideConditions}
                    onChange={(e) => setNewTemplate({ ...newTemplate, tenantCanOverrideConditions: e.target.checked })}
                  />
                  Tenant can override conditions
                </label>
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border rounded"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                >
                  {t('common.create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
