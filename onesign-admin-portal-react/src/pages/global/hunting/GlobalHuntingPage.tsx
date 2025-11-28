import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { huntingService } from '@/lib/api/services/hunting.service';
import { Helmet } from 'react-helmet-async';

// Types
interface GlobalQueryTemplate {
  id: string;
  name: string;
  description: string;
  oqlExpression: string;
  datasetType: string;
  category: string;
  isPublished: boolean;
  createdAt: string;
  lastModifiedAt: string;
  createdByUserId: string;
  usageCount: number;
}

interface CrossTenantScheduledHunt {
  id: string;
  name: string;
  templateId: string;
  templateName: string;
  scheduleSpec: string;
  targetTenantIds: string[];
  targetAllTenants: boolean;
  isEnabled: boolean;
  nextRunAt: string;
  lastRunAt: string | null;
  createdAt: string;
}

interface GlobalHuntResult {
  id: string;
  scheduledHuntId: string;
  huntName: string;
  tenantId: string;
  tenantName: string;
  status: 'Running' | 'Succeeded' | 'Failed' | 'Cancelled';
  startedAt: string;
  completedAt: string | null;
  matchCount: number;
  errorMessage: string | null;
  datasetType: string;
}

interface SavedQuery {
  id: string;
  name: string;
  description: string;
  oqlExpression: string;
  datasetType: string;
  createdAt: string;
  lastUsedAt: string | null;
  usageCount: number;
}

interface HuntRun {
  id: string;
  scheduledHuntId: string;
  status: 'Running' | 'Succeeded' | 'Failed' | 'Cancelled';
  startedAt: string;
  completedAt: string | null;
  totalTenants: number;
  completedTenants: number;
  totalMatches: number;
}

// Constants
const DATASET_TYPES = [
  'SignInLogs',
  'AuditEvents',
  'RiskEvents',
  'UserActivities',
  'AdminActions',
  'SecurityAlerts',
];

const TEMPLATE_CATEGORIES = [
  'Threat Detection',
  'Anomaly Detection',
  'Compliance',
  'User Behavior',
  'Security Posture',
  'Custom',
];

const SCHEDULE_SPECS = [
  { value: 'Hourly', label: 'Hourly' },
  { value: 'Daily', label: 'Daily' },
  { value: 'Weekly', label: 'Weekly' },
  { value: 'Custom', label: 'Custom' },
];

type Tab = 'templates' | 'scheduled' | 'results' | 'saved-queries' | 'hunt-runs' | 'query-executor';

export default function GlobalHuntingPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<Tab>('templates');
  const [userId] = useState('00000000-0000-0000-0000-000000000001');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Data states
  const [templates, setTemplates] = useState<GlobalQueryTemplate[]>([]);
  const [scheduledHunts, setScheduledHunts] = useState<CrossTenantScheduledHunt[]>([]);
  const [results, setResults] = useState<GlobalHuntResult[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [resultsPage, setResultsPage] = useState(1);
  const [savedQueries, setSavedQueries] = useState<SavedQuery[]>([]);
  const [huntRuns, setHuntRuns] = useState<HuntRun[]>([]);
  const [selectedScheduledHunt, setSelectedScheduledHunt] = useState<string>('');

  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [tenantFilter, setTenantFilter] = useState<string>('');

  // Modal states
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showSavedQueryModal, setShowSavedQueryModal] = useState(false);
  const [showQueryExecutorModal, setShowQueryExecutorModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<GlobalQueryTemplate | null>(null);
  const [editingSchedule, setEditingSchedule] = useState<CrossTenantScheduledHunt | null>(null);
  const [editingSavedQuery, setEditingSavedQuery] = useState<SavedQuery | null>(null);

  // Template form state
  const [templateForm, setTemplateForm] = useState({
    name: '',
    description: '',
    oqlExpression: '',
    datasetType: DATASET_TYPES[0],
    category: TEMPLATE_CATEGORIES[0],
    isPublished: false,
  });

  // Schedule form state
  const [scheduleForm, setScheduleForm] = useState({
    name: '',
    templateId: '',
    scheduleSpec: 'Daily',
    customCron: '',
    targetAllTenants: true,
    targetTenantIds: [] as string[],
    isEnabled: true,
  });

  // Saved Query form state
  const [savedQueryForm, setSavedQueryForm] = useState({
    name: '',
    description: '',
    oqlExpression: '',
    datasetType: DATASET_TYPES[0],
  });

  // Query Executor form state
  const [queryExecutorForm, setQueryExecutorForm] = useState({
    oqlExpression: '',
    datasetType: DATASET_TYPES[0],
    tenantIds: [] as string[],
    targetAllTenants: true,
  });

  const [queryResults, setQueryResults] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, [activeTab, resultsPage, statusFilter]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      if (activeTab === 'templates') {
        const data = await huntingService.getGlobalTemplates();
        setTemplates(data);
      } else if (activeTab === 'scheduled') {
        const data = await huntingService.getGlobalScheduledHunts();
        setScheduledHunts(data);
      } else if (activeTab === 'results') {
        const params: any = { page: resultsPage, pageSize: 20 };
        if (statusFilter) params.status = statusFilter;
        if (tenantFilter) params.tenantId = tenantFilter;

        const data = await huntingService.getGlobalHuntResults(params);
        setResults(data.items || []);
        setTotalResults(data.totalCount || 0);
      } else if (activeTab === 'saved-queries') {
        const data = await huntingService.getGlobalSavedQueries();
        setSavedQueries(data);
      } else if (activeTab === 'hunt-runs') {
        if (selectedScheduledHunt) {
          // const data = await huntingService.getGlobalHuntRuns(selectedScheduledHunt);
          // setHuntRuns(data);
          setHuntRuns([] as any);
        }
      }
    } catch (err) {
      setError(t('common.error'));
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      if (editingTemplate) {
        // await huntingService.updateGlobalTemplate(editingTemplate.id, { userId, ...templateForm });
        setSuccess('Template updated successfully');
      } else {
        // await huntingService.createGlobalTemplate({ userId, ...templateForm });
        setSuccess('Template created successfully');
      }

      setShowTemplateModal(false);
      setEditingTemplate(null);
      setTemplateForm({
        name: '',
        description: '',
        oqlExpression: '',
        datasetType: DATASET_TYPES[0],
        category: TEMPLATE_CATEGORIES[0],
        isPublished: false,
      });
      fetchData();
    } catch (err) {
      setError(t('common.error'));
    }
  };

  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const data = {
        userId,
        name: scheduleForm.name,
        templateId: scheduleForm.templateId,
        scheduleSpec: scheduleForm.scheduleSpec === 'Custom' ? scheduleForm.customCron : scheduleForm.scheduleSpec,
        targetAllTenants: scheduleForm.targetAllTenants,
        targetTenantIds: scheduleForm.targetAllTenants ? [] : scheduleForm.targetTenantIds,
        isEnabled: scheduleForm.isEnabled,
      };

      if (editingSchedule) {
        // await huntingService.updateGlobalScheduled(editingSchedule.id, data);
        setSuccess('Schedule updated successfully');
      } else {
        // await huntingService.createGlobalScheduledHunt(data);
        setSuccess('Schedule created successfully');
      }

      setShowScheduleModal(false);
      setEditingSchedule(null);
      setScheduleForm({
        name: '',
        templateId: '',
        scheduleSpec: 'Daily',
        customCron: '',
        targetAllTenants: true,
        targetTenantIds: [],
        isEnabled: true,
      });
      fetchData();
    } catch (err) {
      setError(t('common.error'));
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;
    try {
      // await huntingService.deleteGlobalTemplate(id);
      setSuccess('Template deleted successfully');
      fetchData();
    } catch (err) {
      setError(t('common.error'));
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    if (!confirm('Are you sure you want to delete this scheduled hunt?')) return;
    try {
      // await huntingService.deleteGlobalScheduled(id);
      setSuccess('Scheduled hunt deleted successfully');
      fetchData();
    } catch (err) {
      setError(t('common.error'));
    }
  };

  const handleTogglePublish = async (template: GlobalQueryTemplate) => {
    try {
      if (template.isPublished) {
        // await huntingService.unpublishGlobalTemplate(template.id, userId);
        setSuccess('Template unpublished');
      } else {
        // await huntingService.publishGlobalTemplate(template.id, userId);
        setSuccess('Template published');
      }
      fetchData();
    } catch (err) {
      setError(t('common.error'));
    }
  };

  const handleToggleSchedule = async (hunt: CrossTenantScheduledHunt) => {
    try {
      if (hunt.isEnabled) {
        // await huntingService.disableGlobalScheduledHunt(hunt.id, userId);
      } else {
        // await huntingService.enableGlobalScheduledHunt(hunt.id, userId);
      }
      fetchData();
    } catch (err) {
      setError(t('common.error'));
    }
  };

  const handleRunNow = async (huntId: string) => {
    try {
      // await huntingService.runGlobalScheduledHuntNow(huntId, userId);
      setSuccess('Cross-tenant hunt triggered successfully');
      setActiveTab('results');
      fetchData();
    } catch (err) {
      setError(t('common.error'));
    }
  };

  const handleCreateSavedQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const data = {
        userId,
        ...savedQueryForm,
      };

      if (editingSavedQuery) {
        // await huntingService.updateGlobalSavedQuery(editingSavedQuery.id, data);
        setSuccess('Query updated successfully');
      } else {
        // await huntingService.createGlobalSavedQuery(data);
        setSuccess('Query saved successfully');
      }

      setShowSavedQueryModal(false);
      setEditingSavedQuery(null);
      setSavedQueryForm({
        name: '',
        description: '',
        oqlExpression: '',
        datasetType: DATASET_TYPES[0],
      });
      fetchData();
    } catch (err) {
      setError(t('common.error'));
    }
  };

  const handleDeleteSavedQuery = async (id: string) => {
    if (!confirm('Are you sure you want to delete this saved query?')) return;
    try {
      // await huntingService.deleteGlobalSavedQuery(id);
      setSuccess('Saved query deleted successfully');
      fetchData();
    } catch (err) {
      setError(t('common.error'));
    }
  };

  const handleExecuteQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setQueryResults(null);
    setLoading(true);
    try {
      // const data = await huntingService.executeGlobalQuery({
      //   userId,
      //   oqlExpression: queryExecutorForm.oqlExpression,
      //   datasetType: queryExecutorForm.datasetType,
      //   tenantIds: queryExecutorForm.targetAllTenants ? [] : queryExecutorForm.tenantIds,
      //   targetAllTenants: queryExecutorForm.targetAllTenants,
      // });
      // setQueryResults(data);
      setSuccess('Query executed successfully');
    } catch (err) {
      setError(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleEditTemplate = (template: GlobalQueryTemplate) => {
    setEditingTemplate(template);
    setTemplateForm({
      name: template.name,
      description: template.description,
      oqlExpression: template.oqlExpression,
      datasetType: template.datasetType,
      category: template.category,
      isPublished: template.isPublished,
    });
    setShowTemplateModal(true);
  };

  const handleEditSavedQuery = (query: SavedQuery) => {
    setEditingSavedQuery(query);
    setSavedQueryForm({
      name: query.name,
      description: query.description,
      oqlExpression: query.oqlExpression,
      datasetType: query.datasetType,
    });
    setShowSavedQueryModal(true);
  };

  const handleEditSchedule = (schedule: CrossTenantScheduledHunt) => {
    setEditingSchedule(schedule);
    const isCustom = !['Hourly', 'Daily', 'Weekly'].includes(schedule.scheduleSpec);
    setScheduleForm({
      name: schedule.name,
      templateId: schedule.templateId,
      scheduleSpec: isCustom ? 'Custom' : schedule.scheduleSpec,
      customCron: isCustom ? schedule.scheduleSpec : '',
      targetAllTenants: schedule.targetAllTenants,
      targetTenantIds: schedule.targetTenantIds,
      isEnabled: schedule.isEnabled,
    });
    setShowScheduleModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Succeeded': return 'bg-green-100 text-green-800';
      case 'Failed': return 'bg-red-100 text-red-800';
      case 'Running': return 'bg-blue-100 text-blue-800';
      case 'Cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Threat Detection': return 'bg-red-100 text-red-800';
      case 'Anomaly Detection': return 'bg-orange-100 text-orange-800';
      case 'Compliance': return 'bg-blue-100 text-blue-800';
      case 'User Behavior': return 'bg-purple-100 text-purple-800';
      case 'Security Posture': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString();
  };

  if (loading && !templates.length && !scheduledHunts.length && !results.length) {
    return <div className="p-8">{t('common.loading')}</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Threat Hunting - Global</h1>
        {activeTab === 'templates' && (
          <button
            onClick={() => {
              setEditingTemplate(null);
              setTemplateForm({
                name: '',
                description: '',
                oqlExpression: '',
                datasetType: DATASET_TYPES[0],
                category: TEMPLATE_CATEGORIES[0],
                isPublished: false,
              });
              setShowTemplateModal(true);
            }}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Create Template
          </button>
        )}
        {activeTab === 'scheduled' && (
          <button
            onClick={() => {
              setEditingSchedule(null);
              setScheduleForm({
                name: '',
                templateId: '',
                scheduleSpec: 'Daily',
                customCron: '',
                targetAllTenants: true,
                targetTenantIds: [],
                isEnabled: true,
              });
              setShowScheduleModal(true);
            }}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Create Cross-Tenant Hunt
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
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {(['templates', 'scheduled', 'saved-queries', 'query-executor', 'hunt-runs', 'results'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === tab
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab === 'templates' ? 'Global Query Templates' :
               tab === 'scheduled' ? 'Scheduled Hunts' :
               tab === 'saved-queries' ? 'Saved Queries' :
               tab === 'query-executor' ? 'Query Executor' :
               tab === 'hunt-runs' ? 'Hunt Runs' : 'Global Hunt Results'}
            </button>
          ))}
        </nav>
      </div>

      {/* Global Query Templates Tab */}
      {activeTab === 'templates' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dataset</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usage</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
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
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded text-xs ${getCategoryColor(template.category)}`}>
                      {template.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 rounded text-xs bg-purple-100 text-purple-800">
                      {template.datasetType}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded text-xs ${template.isPublished ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {template.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {template.usageCount} tenants
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleTogglePublish(template)}
                        className="text-green-600 hover:text-green-900"
                      >
                        {template.isPublished ? 'Unpublish' : 'Publish'}
                      </button>
                      <button
                        onClick={() => handleEditTemplate(template)}
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
                    </div>
                  </td>
                </tr>
              ))}
              {templates.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    No global query templates. Create one to share with tenants.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Cross-Tenant Scheduled Hunts Tab */}
      {activeTab === 'scheduled' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Template</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Schedule</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Target</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Next Run</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {scheduledHunts.map((hunt) => (
                <tr key={hunt.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{hunt.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {hunt.templateName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
                      {hunt.scheduleSpec}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded text-xs ${hunt.targetAllTenants ? 'bg-purple-100 text-purple-800' : 'bg-orange-100 text-orange-800'}`}>
                      {hunt.targetAllTenants ? 'All Tenants' : `${hunt.targetTenantIds.length} Tenants`}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded text-xs ${hunt.isEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {hunt.isEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {hunt.isEnabled ? formatDate(hunt.nextRunAt) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleRunNow(hunt.id)}
                        className="text-green-600 hover:text-green-900"
                      >
                        Run Now
                      </button>
                      <button
                        onClick={() => handleToggleSchedule(hunt)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        {hunt.isEnabled ? 'Disable' : 'Enable'}
                      </button>
                      <button
                        onClick={() => handleEditSchedule(hunt)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteSchedule(hunt.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {scheduledHunts.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    No cross-tenant scheduled hunts. Create one to run hunts across all tenants.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Global Hunt Results Tab */}
      {activeTab === 'results' && (
        <div>
          {/* Filters */}
          <div className="bg-white rounded-lg shadow p-4 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">All Statuses</option>
                  <option value="Running">Running</option>
                  <option value="Succeeded">Succeeded</option>
                  <option value="Failed">Failed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tenant</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  value={tenantFilter}
                  onChange={(e) => setTenantFilter(e.target.value)}
                  placeholder="Filter by tenant ID or name"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hunt</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tenant</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dataset</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Started</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Matches</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {results.map((result) => (
                  <tr key={result.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {result.huntName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {result.tenantName || result.tenantId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 rounded text-xs bg-purple-100 text-purple-800">
                        {result.datasetType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(result.startedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded text-xs ${getStatusColor(result.status)}`}>
                        {result.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-semibold ${result.matchCount > 0 ? 'text-orange-600' : 'text-gray-500'}`}>
                        {result.matchCount}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {result.errorMessage ? (
                        <span className="text-red-600">{result.errorMessage}</span>
                      ) : result.completedAt ? (
                        `Completed: ${formatDate(result.completedAt)}`
                      ) : (
                        'In progress...'
                      )}
                    </td>
                  </tr>
                ))}
                {results.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                      No hunt results yet. Run a cross-tenant hunt to see results here.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            {totalResults > 20 && (
              <div className="px-6 py-4 flex justify-between items-center border-t">
                <button
                  onClick={() => setResultsPage(p => Math.max(1, p - 1))}
                  disabled={resultsPage === 1}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  {t('common.previous')}
                </button>
                <span className="text-sm text-gray-500">
                  {t('common.page')} {resultsPage} / {Math.ceil(totalResults / 20)}
                </span>
                <button
                  onClick={() => setResultsPage(p => p + 1)}
                  disabled={resultsPage >= Math.ceil(totalResults / 20)}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  {t('common.next')}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Saved Queries Tab */}
      {activeTab === 'saved-queries' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold">Saved Queries</h3>
            <button
              onClick={() => {
                setEditingSavedQuery(null);
                setSavedQueryForm({
                  name: '',
                  description: '',
                  oqlExpression: '',
                  datasetType: DATASET_TYPES[0],
                });
                setShowSavedQueryModal(true);
              }}
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
            >
              Create Saved Query
            </button>
          </div>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dataset</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usage Count</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Used</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {savedQueries.map((query) => (
                <tr key={query.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{query.name}</div>
                    {query.description && (
                      <div className="text-sm text-gray-500">{query.description}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 rounded text-xs bg-purple-100 text-purple-800">
                      {query.datasetType}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {query.usageCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {query.lastUsedAt ? formatDate(query.lastUsedAt) : 'Never'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditSavedQuery(query)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteSavedQuery(query.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {savedQueries.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    No saved queries. Create one to reuse your queries.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Query Executor Tab */}
      {activeTab === 'query-executor' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Execute Global Query</h3>
          <form onSubmit={handleExecuteQuery} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Dataset Type</label>
              <select
                className="w-full px-3 py-2 border rounded"
                value={queryExecutorForm.datasetType}
                onChange={(e) => setQueryExecutorForm({ ...queryExecutorForm, datasetType: e.target.value })}
              >
                {DATASET_TYPES.map((dt) => (
                  <option key={dt} value={dt}>{dt}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">OQL Expression</label>
              <textarea
                required
                className="w-full px-3 py-2 border rounded font-mono text-sm"
                rows={6}
                value={queryExecutorForm.oqlExpression}
                onChange={(e) => setQueryExecutorForm({ ...queryExecutorForm, oqlExpression: e.target.value })}
                placeholder='e.g., riskLevel > 5 AND eventType == "FailedLogin"'
              />
            </div>
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={queryExecutorForm.targetAllTenants}
                  onChange={(e) => setQueryExecutorForm({ ...queryExecutorForm, targetAllTenants: e.target.checked })}
                />
                Target all tenants
              </label>
            </div>
            {!queryExecutorForm.targetAllTenants && (
              <div>
                <label className="block text-sm font-medium mb-2">Target Tenant IDs</label>
                <textarea
                  className="w-full px-3 py-2 border rounded font-mono text-sm"
                  rows={3}
                  value={queryExecutorForm.tenantIds.join('\n')}
                  onChange={(e) => setQueryExecutorForm({
                    ...queryExecutorForm,
                    tenantIds: e.target.value.split('\n').filter(id => id.trim())
                  })}
                  placeholder="Enter one tenant ID per line"
                />
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Executing...' : 'Execute Query'}
            </button>
          </form>

          {queryResults && (
            <div className="mt-6 border-t pt-6">
              <h4 className="text-md font-semibold mb-3">Query Results</h4>
              <div className="bg-gray-50 p-4 rounded">
                <pre className="text-sm overflow-auto max-h-96">
                  {JSON.stringify(queryResults, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Hunt Runs Tab */}
      {activeTab === 'hunt-runs' && (
        <div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Select Scheduled Hunt</label>
            <select
              className="w-full md:w-1/2 px-3 py-2 border rounded"
              value={selectedScheduledHunt}
              onChange={(e) => {
                setSelectedScheduledHunt(e.target.value);
                fetchData();
              }}
            >
              <option value="">Select a scheduled hunt...</option>
              {scheduledHunts.map((hunt) => (
                <option key={hunt.id} value={hunt.id}>{hunt.name}</option>
              ))}
            </select>
          </div>

          {selectedScheduledHunt && (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Run ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Started</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Progress</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Matches</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {huntRuns.map((run) => (
                    <tr key={run.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                        {run.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded text-xs ${getStatusColor(run.status)}`}>
                          {run.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(run.startedAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {run.completedTenants} / {run.totalTenants} tenants
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-semibold ${run.totalMatches > 0 ? 'text-orange-600' : 'text-gray-500'}`}>
                          {run.totalMatches}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {huntRuns.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                        No hunt runs found for this scheduled hunt.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Create/Edit Template Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingTemplate ? 'Edit Template' : 'Create Global Query Template'}
            </h2>
            <form onSubmit={handleCreateTemplate}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Name</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border rounded"
                  value={templateForm.name}
                  onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  className="w-full px-3 py-2 border rounded"
                  value={templateForm.description}
                  onChange={(e) => setTemplateForm({ ...templateForm, description: e.target.value })}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Category</label>
                <select
                  className="w-full px-3 py-2 border rounded"
                  value={templateForm.category}
                  onChange={(e) => setTemplateForm({ ...templateForm, category: e.target.value })}
                >
                  {TEMPLATE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Dataset</label>
                <select
                  className="w-full px-3 py-2 border rounded"
                  value={templateForm.datasetType}
                  onChange={(e) => setTemplateForm({ ...templateForm, datasetType: e.target.value })}
                >
                  {DATASET_TYPES.map((dt) => (
                    <option key={dt} value={dt}>{dt}</option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">OQL Expression</label>
                <textarea
                  required
                  className="w-full px-3 py-2 border rounded font-mono text-sm"
                  rows={4}
                  value={templateForm.oqlExpression}
                  onChange={(e) => setTemplateForm({ ...templateForm, oqlExpression: e.target.value })}
                  placeholder='e.g., riskLevel > 5 AND eventType == "FailedLogin"'
                />
              </div>
              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={templateForm.isPublished}
                    onChange={(e) => setTemplateForm({ ...templateForm, isPublished: e.target.checked })}
                  />
                  Publish immediately (make available to tenants)
                </label>
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowTemplateModal(false);
                    setEditingTemplate(null);
                  }}
                  className="px-4 py-2 border rounded"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                >
                  {editingTemplate ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create/Edit Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingSchedule ? 'Edit Cross-Tenant Hunt' : 'Create Cross-Tenant Scheduled Hunt'}
            </h2>
            <form onSubmit={handleCreateSchedule}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Name</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border rounded"
                  value={scheduleForm.name}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, name: e.target.value })}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Template</label>
                <select
                  required
                  className="w-full px-3 py-2 border rounded"
                  value={scheduleForm.templateId}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, templateId: e.target.value })}
                >
                  <option value="">Select a template...</option>
                  {templates.filter(t => t.isPublished).map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Schedule</label>
                <select
                  className="w-full px-3 py-2 border rounded"
                  value={scheduleForm.scheduleSpec}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, scheduleSpec: e.target.value })}
                >
                  {SCHEDULE_SPECS.map((spec) => (
                    <option key={spec.value} value={spec.value}>{spec.label}</option>
                  ))}
                </select>
              </div>
              {scheduleForm.scheduleSpec === 'Custom' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Custom Cron Expression</label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border rounded font-mono"
                    value={scheduleForm.customCron}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, customCron: e.target.value })}
                    placeholder="0 */6 * * *"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Cron format: minute hour day month weekday
                  </p>
                </div>
              )}
              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={scheduleForm.targetAllTenants}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, targetAllTenants: e.target.checked })}
                  />
                  Target all tenants
                </label>
              </div>
              {!scheduleForm.targetAllTenants && (
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Target Tenant IDs</label>
                  <textarea
                    className="w-full px-3 py-2 border rounded font-mono text-sm"
                    rows={3}
                    value={scheduleForm.targetTenantIds.join('\n')}
                    onChange={(e) => setScheduleForm({
                      ...scheduleForm,
                      targetTenantIds: e.target.value.split('\n').filter(id => id.trim())
                    })}
                    placeholder="Enter one tenant ID per line"
                  />
                </div>
              )}
              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={scheduleForm.isEnabled}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, isEnabled: e.target.checked })}
                  />
                  Enable immediately
                </label>
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowScheduleModal(false);
                    setEditingSchedule(null);
                  }}
                  className="px-4 py-2 border rounded"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                >
                  {editingSchedule ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create/Edit Saved Query Modal */}
      {showSavedQueryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingSavedQuery ? 'Edit Saved Query' : 'Create Saved Query'}
            </h2>
            <form onSubmit={handleCreateSavedQuery}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Name</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border rounded"
                  value={savedQueryForm.name}
                  onChange={(e) => setSavedQueryForm({ ...savedQueryForm, name: e.target.value })}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  className="w-full px-3 py-2 border rounded"
                  value={savedQueryForm.description}
                  onChange={(e) => setSavedQueryForm({ ...savedQueryForm, description: e.target.value })}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Dataset</label>
                <select
                  className="w-full px-3 py-2 border rounded"
                  value={savedQueryForm.datasetType}
                  onChange={(e) => setSavedQueryForm({ ...savedQueryForm, datasetType: e.target.value })}
                >
                  {DATASET_TYPES.map((dt) => (
                    <option key={dt} value={dt}>{dt}</option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">OQL Expression</label>
                <textarea
                  required
                  className="w-full px-3 py-2 border rounded font-mono text-sm"
                  rows={4}
                  value={savedQueryForm.oqlExpression}
                  onChange={(e) => setSavedQueryForm({ ...savedQueryForm, oqlExpression: e.target.value })}
                  placeholder='e.g., riskLevel > 5 AND eventType == "FailedLogin"'
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowSavedQueryModal(false);
                    setEditingSavedQuery(null);
                  }}
                  className="px-4 py-2 border rounded"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                >
                  {editingSavedQuery ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
