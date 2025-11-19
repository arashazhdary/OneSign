'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';

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

type Tab = 'templates' | 'scheduled' | 'results';

export default function GlobalHuntingPage() {
  const t = useTranslations();
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

  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [tenantFilter, setTenantFilter] = useState<string>('');

  // Modal states
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<GlobalQueryTemplate | null>(null);
  const [editingSchedule, setEditingSchedule] = useState<CrossTenantScheduledHunt | null>(null);

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

  useEffect(() => {
    fetchData();
  }, [activeTab, resultsPage, statusFilter]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      if (activeTab === 'templates') {
        const response = await fetch(
          `http://localhost:7000/api/global/hunting/templates`,
          { credentials: 'include' }
        );
        if (!response.ok) throw new Error('Failed to fetch templates');
        const data = await response.json();
        setTemplates(data);
      } else if (activeTab === 'scheduled') {
        const response = await fetch(
          `http://localhost:7000/api/global/hunting/scheduled`,
          { credentials: 'include' }
        );
        if (!response.ok) throw new Error('Failed to fetch scheduled hunts');
        const data = await response.json();
        setScheduledHunts(data);
      } else if (activeTab === 'results') {
        let url = `http://localhost:7000/api/global/hunting/results?page=${resultsPage}&pageSize=20`;
        if (statusFilter) url += `&status=${statusFilter}`;
        if (tenantFilter) url += `&tenantId=${tenantFilter}`;

        const response = await fetch(url, { credentials: 'include' });
        if (!response.ok) throw new Error('Failed to fetch results');
        const data = await response.json();
        setResults(data.items || []);
        setTotalResults(data.totalCount || 0);
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
      const url = editingTemplate
        ? `http://localhost:7000/api/global/hunting/templates/${editingTemplate.id}`
        : `http://localhost:7000/api/global/hunting/templates`;
      const method = editingTemplate ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          userId,
          ...templateForm,
        }),
      });

      if (!response.ok) throw new Error('Failed to save template');

      setSuccess(editingTemplate ? 'Template updated successfully' : 'Template created successfully');
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
      const url = editingSchedule
        ? `http://localhost:7000/api/global/hunting/scheduled/${editingSchedule.id}`
        : `http://localhost:7000/api/global/hunting/scheduled`;
      const method = editingSchedule ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          userId,
          name: scheduleForm.name,
          templateId: scheduleForm.templateId,
          scheduleSpec: scheduleForm.scheduleSpec === 'Custom' ? scheduleForm.customCron : scheduleForm.scheduleSpec,
          targetAllTenants: scheduleForm.targetAllTenants,
          targetTenantIds: scheduleForm.targetAllTenants ? [] : scheduleForm.targetTenantIds,
          isEnabled: scheduleForm.isEnabled,
        }),
      });

      if (!response.ok) throw new Error('Failed to save scheduled hunt');

      setSuccess(editingSchedule ? 'Schedule updated successfully' : 'Schedule created successfully');
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
      const response = await fetch(
        `http://localhost:7000/api/global/hunting/templates/${id}`,
        { method: 'DELETE', credentials: 'include' }
      );
      if (!response.ok) throw new Error('Failed to delete template');
      setSuccess('Template deleted successfully');
      fetchData();
    } catch (err) {
      setError(t('common.error'));
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    if (!confirm('Are you sure you want to delete this scheduled hunt?')) return;
    try {
      const response = await fetch(
        `http://localhost:7000/api/global/hunting/scheduled/${id}`,
        { method: 'DELETE', credentials: 'include' }
      );
      if (!response.ok) throw new Error('Failed to delete scheduled hunt');
      setSuccess('Scheduled hunt deleted successfully');
      fetchData();
    } catch (err) {
      setError(t('common.error'));
    }
  };

  const handleTogglePublish = async (template: GlobalQueryTemplate) => {
    try {
      const response = await fetch(
        `http://localhost:7000/api/global/hunting/templates/${template.id}/${template.isPublished ? 'unpublish' : 'publish'}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ userId }),
        }
      );
      if (!response.ok) throw new Error('Failed to toggle publish');
      setSuccess(template.isPublished ? 'Template unpublished' : 'Template published');
      fetchData();
    } catch (err) {
      setError(t('common.error'));
    }
  };

  const handleToggleSchedule = async (hunt: CrossTenantScheduledHunt) => {
    try {
      const response = await fetch(
        `http://localhost:7000/api/global/hunting/scheduled/${hunt.id}/${hunt.isEnabled ? 'disable' : 'enable'}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ userId }),
        }
      );
      if (!response.ok) throw new Error('Failed to toggle schedule');
      fetchData();
    } catch (err) {
      setError(t('common.error'));
    }
  };

  const handleRunNow = async (huntId: string) => {
    try {
      const response = await fetch(
        `http://localhost:7000/api/global/hunting/scheduled/${huntId}/run`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ userId }),
        }
      );
      if (!response.ok) throw new Error('Failed to trigger run');
      setSuccess('Cross-tenant hunt triggered successfully');
      setActiveTab('results');
      fetchData();
    } catch (err) {
      setError(t('common.error'));
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
        <nav className="-mb-px flex space-x-8">
          {(['templates', 'scheduled', 'results'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab === 'templates' ? 'Global Query Templates' :
               tab === 'scheduled' ? 'Cross-Tenant Scheduled Hunts' : 'Global Hunt Results'}
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
    </div>
  );
}
