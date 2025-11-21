'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { getTenantId } from '@/lib/tenant-context';

// Types
interface SavedQuery {
  id: string;
  name: string;
  description: string;
  oqlExpression: string;
  datasetType: string;
  createdAt: string;
  lastModifiedAt: string;
  createdByUserId: string;
}

interface ScheduledHunt {
  id: string;
  name: string;
  queryId: string;
  queryName: string;
  scheduleSpec: string;
  datasetType: string;
  isEnabled: boolean;
  nextRunAt: string;
  lastRunAt: string | null;
  createdAt: string;
}

interface HuntRun {
  id: string;
  scheduledHuntId: string;
  huntName: string;
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

const SCHEDULE_SPECS = [
  { value: 'Hourly', label: 'Hourly' },
  { value: 'Daily', label: 'Daily' },
  { value: 'Weekly', label: 'Weekly' },
  { value: 'Custom', label: 'Custom' },
];

type Tab = 'queries' | 'scheduled' | 'runs' | 'builder';

export default function TenantHuntingPage() {
  const t = useTranslations();
  const [activeTab, setActiveTab] = useState<Tab>('queries');
  const [tenantId, setTenantIdState] = useState<string>('');
  const [userId] = useState('00000000-0000-0000-0000-000000000001');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Data states
  const [queries, setQueries] = useState<SavedQuery[]>([]);
  const [scheduledHunts, setScheduledHunts] = useState<ScheduledHunt[]>([]);
  const [huntRuns, setHuntRuns] = useState<HuntRun[]>([]);
  const [totalRuns, setTotalRuns] = useState(0);
  const [runsPage, setRunsPage] = useState(1);

  // Modal states
  const [showQueryModal, setShowQueryModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [editingQuery, setEditingQuery] = useState<SavedQuery | null>(null);
  const [editingSchedule, setEditingSchedule] = useState<ScheduledHunt | null>(null);

  // Query form state
  const [queryForm, setQueryForm] = useState({
    name: '',
    description: '',
    oqlExpression: '',
    datasetType: DATASET_TYPES[0],
  });

  // Schedule form state
  const [scheduleForm, setScheduleForm] = useState({
    name: '',
    queryId: '',
    scheduleSpec: 'Daily',
    customCron: '',
    isEnabled: true,
  });

  // Query builder state
  const [builderDataset, setBuilderDataset] = useState(DATASET_TYPES[0]);
  const [builderField, setBuilderField] = useState('');
  const [builderOperator, setBuilderOperator] = useState('==');
  const [builderValue, setBuilderValue] = useState('');
  const [builderQuery, setBuilderQuery] = useState('');

  useEffect(() => {
    const contextTenantId = getTenantId();
    setTenantIdState(contextTenantId || '00000000-0000-0000-0000-000000000000');
  }, []);

  useEffect(() => {
    if (tenantId) {
      fetchData();
    }
  }, [tenantId, activeTab, runsPage]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      if (activeTab === 'queries') {
        const response = await fetch(
          `http://localhost:7000/api/tenant/hunting/queries?tenantId=${tenantId}`,
          { credentials: 'include' }
        );
        if (!response.ok) throw new Error('Failed to fetch queries');
        const data = await response.json();
        setQueries(data);
      } else if (activeTab === 'scheduled') {
        const response = await fetch(
          `http://localhost:7000/api/tenant/hunting/scheduled?tenantId=${tenantId}`,
          { credentials: 'include' }
        );
        if (!response.ok) throw new Error('Failed to fetch scheduled hunts');
        const data = await response.json();
        setScheduledHunts(data);
      } else if (activeTab === 'runs') {
        const response = await fetch(
          `http://localhost:7000/api/tenant/hunting/runs?tenantId=${tenantId}&page=${runsPage}&pageSize=20`,
          { credentials: 'include' }
        );
        if (!response.ok) throw new Error('Failed to fetch hunt runs');
        const data = await response.json();
        setHuntRuns(data.items || []);
        setTotalRuns(data.totalCount || 0);
      }
    } catch (err) {
      setError(t('common.error'));
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const url = editingQuery
        ? `http://localhost:7000/api/tenant/hunting/queries/${editingQuery.id}`
        : `http://localhost:7000/api/tenant/hunting/queries`;
      const method = editingQuery ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          tenantId,
          userId,
          ...queryForm,
        }),
      });

      if (!response.ok) throw new Error('Failed to save query');

      setSuccess(editingQuery ? 'Query updated successfully' : 'Query created successfully');
      setShowQueryModal(false);
      setEditingQuery(null);
      setQueryForm({
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

  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const url = editingSchedule
        ? `http://localhost:7000/api/tenant/hunting/scheduled/${editingSchedule.id}`
        : `http://localhost:7000/api/tenant/hunting/scheduled`;
      const method = editingSchedule ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          tenantId,
          userId,
          name: scheduleForm.name,
          queryId: scheduleForm.queryId,
          scheduleSpec: scheduleForm.scheduleSpec === 'Custom' ? scheduleForm.customCron : scheduleForm.scheduleSpec,
          isEnabled: scheduleForm.isEnabled,
        }),
      });

      if (!response.ok) throw new Error('Failed to save scheduled hunt');

      setSuccess(editingSchedule ? 'Schedule updated successfully' : 'Schedule created successfully');
      setShowScheduleModal(false);
      setEditingSchedule(null);
      setScheduleForm({
        name: '',
        queryId: '',
        scheduleSpec: 'Daily',
        customCron: '',
        isEnabled: true,
      });
      fetchData();
    } catch (err) {
      setError(t('common.error'));
    }
  };

  // DELETE /api/tenant/hunting/saved-queries/{id} - حذف saved query
  const handleDeleteQuery = async (id: string) => {
    if (!confirm('Are you sure you want to delete this query?')) return;
    try {
      const response = await fetch(
        `http://localhost:7000/api/tenant/hunting/saved-queries/${id}?tenantId=${tenantId}`,
        { method: 'DELETE', credentials: 'include' }
      );
      if (!response.ok) throw new Error('Failed to delete query');
      setSuccess('Query deleted successfully');
      fetchData();
    } catch (err) {
      setError(t('common.error'));
    }
  };

  // DELETE /api/tenant/hunting/scheduled-hunts/{id} - حذف scheduled hunt
  const handleDeleteSchedule = async (id: string) => {
    if (!confirm('Are you sure you want to delete this scheduled hunt?')) return;
    try {
      const response = await fetch(
        `http://localhost:7000/api/tenant/hunting/scheduled-hunts/${id}?tenantId=${tenantId}`,
        { method: 'DELETE', credentials: 'include' }
      );
      if (!response.ok) throw new Error('Failed to delete scheduled hunt');
      setSuccess('Scheduled hunt deleted successfully');
      fetchData();
    } catch (err) {
      setError(t('common.error'));
    }
  };

  const handleToggleSchedule = async (hunt: ScheduledHunt) => {
    try {
      const response = await fetch(
        `http://localhost:7000/api/tenant/hunting/scheduled/${hunt.id}/${hunt.isEnabled ? 'disable' : 'enable'}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ tenantId, userId }),
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
        `http://localhost:7000/api/tenant/hunting/scheduled/${huntId}/run`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ tenantId, userId }),
        }
      );
      if (!response.ok) throw new Error('Failed to trigger run');
      setSuccess('Hunt run triggered successfully');
      setActiveTab('runs');
      fetchData();
    } catch (err) {
      setError(t('common.error'));
    }
  };

  const handleEditQuery = (query: SavedQuery) => {
    setEditingQuery(query);
    setQueryForm({
      name: query.name,
      description: query.description,
      oqlExpression: query.oqlExpression,
      datasetType: query.datasetType,
    });
    setShowQueryModal(true);
  };

  const handleEditSchedule = (schedule: ScheduledHunt) => {
    setEditingSchedule(schedule);
    const isCustom = !['Hourly', 'Daily', 'Weekly'].includes(schedule.scheduleSpec);
    setScheduleForm({
      name: schedule.name,
      queryId: schedule.queryId,
      scheduleSpec: isCustom ? 'Custom' : schedule.scheduleSpec,
      customCron: isCustom ? schedule.scheduleSpec : '',
      isEnabled: schedule.isEnabled,
    });
    setShowScheduleModal(true);
  };

  const handleBuildQuery = () => {
    if (builderField && builderValue) {
      const newClause = `${builderField} ${builderOperator} "${builderValue}"`;
      setBuilderQuery(builderQuery ? `${builderQuery} AND ${newClause}` : newClause);
      setBuilderField('');
      setBuilderValue('');
    }
  };

  const handleSaveBuiltQuery = () => {
    if (builderQuery) {
      setQueryForm({
        name: '',
        description: '',
        oqlExpression: builderQuery,
        datasetType: builderDataset,
      });
      setShowQueryModal(true);
    }
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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString();
  };

  if (loading && !queries.length && !scheduledHunts.length && !huntRuns.length) {
    return <div className="p-8">{t('common.loading')}</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Threat Hunting</h1>
        {activeTab === 'queries' && (
          <button
            onClick={() => {
              setEditingQuery(null);
              setQueryForm({
                name: '',
                description: '',
                oqlExpression: '',
                datasetType: DATASET_TYPES[0],
              });
              setShowQueryModal(true);
            }}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Create Query
          </button>
        )}
        {activeTab === 'scheduled' && (
          <button
            onClick={() => {
              setEditingSchedule(null);
              setScheduleForm({
                name: '',
                queryId: '',
                scheduleSpec: 'Daily',
                customCron: '',
                isEnabled: true,
              });
              setShowScheduleModal(true);
            }}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Create Scheduled Hunt
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
          {(['queries', 'scheduled', 'runs', 'builder'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab === 'queries' ? 'Saved Queries' :
               tab === 'scheduled' ? 'Scheduled Hunts' :
               tab === 'runs' ? 'Hunt Runs' : 'Query Builder'}
            </button>
          ))}
        </nav>
      </div>

      {/* Saved Queries Tab */}
      {activeTab === 'queries' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dataset</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">OQL Expression</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {queries.map((query) => (
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
                  <td className="px-6 py-4">
                    <code className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded break-all">
                      {query.oqlExpression.length > 50
                        ? `${query.oqlExpression.substring(0, 50)}...`
                        : query.oqlExpression}
                    </code>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(query.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditQuery(query)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteQuery(query.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {queries.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    No saved queries. Create one to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Scheduled Hunts Tab */}
      {activeTab === 'scheduled' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Query</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Schedule</th>
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
                    {hunt.queryName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
                      {hunt.scheduleSpec}
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
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    No scheduled hunts. Create one to automate threat hunting.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Hunt Runs Tab */}
      {activeTab === 'runs' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hunt</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dataset</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Started</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Matches</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {huntRuns.map((run) => (
                <tr key={run.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {run.huntName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 rounded text-xs bg-purple-100 text-purple-800">
                      {run.datasetType}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(run.startedAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded text-xs ${getStatusColor(run.status)}`}>
                      {run.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm font-semibold ${run.matchCount > 0 ? 'text-orange-600' : 'text-gray-500'}`}>
                      {run.matchCount}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {run.errorMessage ? (
                      <span className="text-red-600">{run.errorMessage}</span>
                    ) : run.completedAt ? (
                      `Completed: ${formatDate(run.completedAt)}`
                    ) : (
                      'In progress...'
                    )}
                  </td>
                </tr>
              ))}
              {huntRuns.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    No hunt runs yet. Schedule a hunt or run one manually.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {totalRuns > 20 && (
            <div className="px-6 py-4 flex justify-between items-center border-t">
              <button
                onClick={() => setRunsPage(p => Math.max(1, p - 1))}
                disabled={runsPage === 1}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                {t('common.previous')}
              </button>
              <span className="text-sm text-gray-500">
                {t('common.page')} {runsPage} / {Math.ceil(totalRuns / 20)}
              </span>
              <button
                onClick={() => setRunsPage(p => p + 1)}
                disabled={runsPage >= Math.ceil(totalRuns / 20)}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                {t('common.next')}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Query Builder Tab */}
      {activeTab === 'builder' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium mb-4">Build OQL Query</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Dataset</label>
                <select
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  value={builderDataset}
                  onChange={(e) => setBuilderDataset(e.target.value)}
                >
                  {DATASET_TYPES.map((dt) => (
                    <option key={dt} value={dt}>{dt}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Field</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  value={builderField}
                  onChange={(e) => setBuilderField(e.target.value)}
                  placeholder="e.g., ipAddress, userId"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Operator</label>
                <select
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  value={builderOperator}
                  onChange={(e) => setBuilderOperator(e.target.value)}
                >
                  <option value="==">Equals (==)</option>
                  <option value="!=">Not Equals (!=)</option>
                  <option value="contains">Contains</option>
                  <option value="startswith">Starts With</option>
                  <option value="endswith">Ends With</option>
                  <option value=">">Greater Than (&gt;)</option>
                  <option value="<">Less Than (&lt;)</option>
                  <option value=">=">Greater or Equal (&gt;=)</option>
                  <option value="<=">Less or Equal (&lt;=)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Value</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  value={builderValue}
                  onChange={(e) => setBuilderValue(e.target.value)}
                  placeholder="Value to match"
                />
              </div>
            </div>

            <div className="flex gap-2 mb-4">
              <button
                onClick={handleBuildQuery}
                className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                disabled={!builderField || !builderValue}
              >
                Add Condition
              </button>
              <button
                onClick={() => setBuilderQuery('')}
                className="border border-gray-300 px-4 py-2 rounded hover:bg-gray-50"
              >
                Clear
              </button>
            </div>

            {builderQuery && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Generated Query</label>
                <div className="bg-gray-100 p-4 rounded-md">
                  <code className="text-sm text-gray-800 break-all">{builderQuery}</code>
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <button
                onClick={handleSaveBuiltQuery}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                disabled={!builderQuery}
              >
                Save as Query
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium mb-4">OQL Syntax Help</h3>
            <div className="text-sm text-gray-600 space-y-2">
              <p><strong>Basic syntax:</strong> <code className="bg-gray-100 px-1">field operator "value"</code></p>
              <p><strong>Combine conditions:</strong> Use <code className="bg-gray-100 px-1">AND</code> or <code className="bg-gray-100 px-1">OR</code></p>
              <p><strong>Examples:</strong></p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li><code className="bg-gray-100 px-1">ipAddress == "192.168.1.1"</code></li>
                <li><code className="bg-gray-100 px-1">riskLevel &gt; 5 AND location contains "Unknown"</code></li>
                <li><code className="bg-gray-100 px-1">eventType == "FailedLogin" AND attempts &gt;= 3</code></li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Query Modal */}
      {showQueryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingQuery ? 'Edit Query' : 'Create Query'}
            </h2>
            <form onSubmit={handleCreateQuery}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Name</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border rounded"
                  value={queryForm.name}
                  onChange={(e) => setQueryForm({ ...queryForm, name: e.target.value })}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  className="w-full px-3 py-2 border rounded"
                  value={queryForm.description}
                  onChange={(e) => setQueryForm({ ...queryForm, description: e.target.value })}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Dataset</label>
                <select
                  className="w-full px-3 py-2 border rounded"
                  value={queryForm.datasetType}
                  onChange={(e) => setQueryForm({ ...queryForm, datasetType: e.target.value })}
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
                  value={queryForm.oqlExpression}
                  onChange={(e) => setQueryForm({ ...queryForm, oqlExpression: e.target.value })}
                  placeholder='e.g., riskLevel > 5 AND eventType == "FailedLogin"'
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowQueryModal(false);
                    setEditingQuery(null);
                  }}
                  className="px-4 py-2 border rounded"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                >
                  {editingQuery ? 'Update' : 'Create'}
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
              {editingSchedule ? 'Edit Scheduled Hunt' : 'Create Scheduled Hunt'}
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
                <label className="block text-sm font-medium mb-2">Query</label>
                <select
                  required
                  className="w-full px-3 py-2 border rounded"
                  value={scheduleForm.queryId}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, queryId: e.target.value })}
                >
                  <option value="">Select a query...</option>
                  {queries.map((q) => (
                    <option key={q.id} value={q.id}>{q.name}</option>
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
