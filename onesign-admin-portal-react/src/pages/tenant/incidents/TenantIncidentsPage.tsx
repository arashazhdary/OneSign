import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getTenantId } from '@/lib/tenant-context';
import { incidentsService } from '@/lib/api/services/incidents.service';
import type { Incident, IncidentStats, IncidentNote, LinkedEntity } from '@/lib/api/types/incidents';
import { Helmet } from 'react-helmet-async';

interface TimelineEvent {
  id: string;
  eventType: string;
  description: string;
  occurredAt: string;
  userId: string | null;
  userName: string | null;
}

interface PlaybookRun {
  id: string;
  incidentId: string;
  incidentTitle: string;
  playbookId: string;
  playbookName: string;
  status: string;
  startedAt: string;
  completedAt: string | null;
  stepsCompleted: number;
  totalSteps: number;
  errorMessage: string | null;
}

type Tab = 'active' | 'details' | 'playbooks';

export default function TenantIncidentsPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<Tab>('active');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Data states
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [playbookRuns, setPlaybookRuns] = useState<PlaybookRun[]>([]);
  const [stats, setStats] = useState<IncidentStats>({
    totalActive: 0,
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
  });

  // Filter states
  const [severityFilter, setSeverityFilter] = useState<number | ''>('');
  const [statusFilter, setStatusFilter] = useState<number | ''>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');

  // Pagination states
  const [pageNumber, setPageNumber] = useState(1);
  const [playbookPageNumber, setPlaybookPageNumber] = useState(1);
  const pageSize = 20;

  // Sorting states
  const [sortField, setSortField] = useState<string>('detectedAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Add note state
  const [showAddNote, setShowAddNote] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState('');

  const tenantId = getTenantId();

  useEffect(() => {
    if (activeTab === 'active') {
      fetchIncidents();
      fetchStats();
    } else if (activeTab === 'playbooks') {
      fetchPlaybookRuns();
    }
  }, [activeTab, severityFilter, statusFilter, categoryFilter, pageNumber, sortField, sortDirection, playbookPageNumber]);

  useEffect(() => {
    if (selectedIncident && activeTab === 'details') {
      fetchTimeline(selectedIncident.id);
    }
  }, [selectedIncident, activeTab]);

  const fetchIncidents = async () => {
    setLoading(true);
    setError('');
    if (!tenantId) return;

    try {
      const data = await incidentsService.getIncidents({
        tenantId,
        pageNumber,
        pageSize,
        sortField,
        sortDirection,
        severity: severityFilter !== '' ? severityFilter : undefined,
        status: statusFilter !== '' ? statusFilter : undefined,
        category: categoryFilter || undefined,
      });
      setIncidents(data.items || []);
    } catch (err) {
      setError(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    if (!tenantId) return;

    try {
      const data = await incidentsService.getIncidentStats(tenantId);
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const fetchTimeline = async (incidentId: string) => {
    if (!tenantId) return;

    try {
      const data = await incidentsService.getIncidentTimeline(tenantId, incidentId);
      setTimeline(data);
    } catch (err) {
      console.error('Failed to fetch timeline:', err);
    }
  };

  const fetchPlaybookRuns = async () => {
    setLoading(true);
    setError('');
    if (!tenantId) return;

    try {
      const data = await incidentsService.getPlaybookRuns({
        tenantId,
        pageNumber: playbookPageNumber,
        pageSize,
      });
      setPlaybookRuns(data.items || []);
    } catch (err) {
      setError(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledge = async (incidentId: string) => {
    setError('');
    setSuccess('');
    if (!tenantId) return;

    try {
      await incidentsService.acknowledgeIncident(incidentId, tenantId);
      setSuccess('Incident acknowledged successfully');
      fetchIncidents();
      if (selectedIncident?.id === incidentId) {
        fetchIncidentDetails(incidentId);
      }
    } catch (err) {
      setError(t('common.error'));
    }
  };

  const handleResolve = async (incidentId: string) => {
    setError('');
    setSuccess('');
    if (!tenantId) return;

    try {
      await incidentsService.resolveIncident(incidentId, tenantId);
      setSuccess('Incident resolved successfully');
      fetchIncidents();
      if (selectedIncident?.id === incidentId) {
        fetchIncidentDetails(incidentId);
      }
    } catch (err) {
      setError(t('common.error'));
    }
  };

  const handleClose = async (incidentId: string) => {
    setError('');
    setSuccess('');
    if (!tenantId) return;

    try {
      await incidentsService.closeIncident(incidentId, tenantId);
      setSuccess('Incident closed successfully');
      fetchIncidents();
      if (selectedIncident?.id === incidentId) {
        fetchIncidentDetails(incidentId);
      }
    } catch (err) {
      setError(t('common.error'));
    }
  };

  const fetchIncidentDetails = async (incidentId: string) => {
    if (!tenantId) return;

    try {
      const data = await incidentsService.getIncidentById(incidentId, tenantId);
      setSelectedIncident(data);
    } catch (err) {
      console.error('Failed to fetch incident details:', err);
    }
  };

  const handleAddNote = async () => {
    if (!selectedIncident || !newNoteContent.trim() || !tenantId) return;

    setError('');
    setSuccess('');
    try {
      await incidentsService.addIncidentNote(selectedIncident.id, {
        content: newNoteContent,
      }, tenantId);

      setSuccess('Note added successfully');
      setNewNoteContent('');
      setShowAddNote(false);
      fetchIncidentDetails(selectedIncident.id);
      fetchTimeline(selectedIncident.id);
    } catch (err) {
      setError(t('common.error'));
    }
  };

  const viewIncidentDetails = (incident: Incident) => {
    setSelectedIncident(incident);
    setActiveTab('details');
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getSeverityBadge = (severity: number) => {
    const severities: Record<number, { text: string; className: string }> = {
      0: { text: 'Low', className: 'bg-green-100 text-green-800' },
      1: { text: 'Medium', className: 'bg-yellow-100 text-yellow-800' },
      2: { text: 'High', className: 'bg-orange-100 text-orange-800' },
      3: { text: 'Critical', className: 'bg-red-100 text-red-800' },
    };
    const severityInfo = severities[severity] || severities[0];
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${severityInfo.className}`}>
        {severityInfo.text}
      </span>
    );
  };

  const getStatusBadge = (status: number) => {
    const statuses: Record<number, { text: string; className: string }> = {
      0: { text: 'New', className: 'bg-blue-100 text-blue-800' },
      1: { text: 'Acknowledged', className: 'bg-yellow-100 text-yellow-800' },
      2: { text: 'Investigating', className: 'bg-purple-100 text-purple-800' },
      3: { text: 'Resolved', className: 'bg-green-100 text-green-800' },
      4: { text: 'Closed', className: 'bg-gray-100 text-gray-800' },
    };
    const statusInfo = statuses[status] || statuses[0];
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusInfo.className}`}>
        {statusInfo.text}
      </span>
    );
  };

  const getPlaybookStatusBadge = (status: string) => {
    const statuses: Record<string, string> = {
      'Running': 'bg-blue-100 text-blue-800',
      'Completed': 'bg-green-100 text-green-800',
      'Failed': 'bg-red-100 text-red-800',
      'Cancelled': 'bg-gray-100 text-gray-800',
    };
    const className = statuses[status] || 'bg-gray-100 text-gray-800';
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${className}`}>
        {status}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const categories = ['Security', 'Authentication', 'Authorization', 'Data Breach', 'Malware', 'Phishing', 'DDoS', 'Compliance', 'Other'];

  if (loading && !incidents.length && !playbookRuns.length) {
    return (
      <div className="p-6">
        <div className="text-gray-600">{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Incidents</h1>

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

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white shadow rounded-lg p-4">
          <div className="text-sm font-medium text-gray-500">Total Active</div>
          <div className="text-2xl font-bold text-gray-900">{stats.totalActive}</div>
        </div>
        <div className="bg-white shadow rounded-lg p-4">
          <div className="text-sm font-medium text-red-500">Critical</div>
          <div className="text-2xl font-bold text-red-600">{stats.critical}</div>
        </div>
        <div className="bg-white shadow rounded-lg p-4">
          <div className="text-sm font-medium text-orange-500">High</div>
          <div className="text-2xl font-bold text-orange-600">{stats.high}</div>
        </div>
        <div className="bg-white shadow rounded-lg p-4">
          <div className="text-sm font-medium text-yellow-500">Medium</div>
          <div className="text-2xl font-bold text-yellow-600">{stats.medium}</div>
        </div>
        <div className="bg-white shadow rounded-lg p-4">
          <div className="text-sm font-medium text-green-500">Low</div>
          <div className="text-2xl font-bold text-green-600">{stats.low}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('active')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'active'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Active Incidents
          </button>
          <button
            onClick={() => setActiveTab('details')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'details'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Incident Details
          </button>
          <button
            onClick={() => setActiveTab('playbooks')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'playbooks'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Playbook Runs
          </button>
        </nav>
      </div>

      {/* Active Incidents Tab */}
      {activeTab === 'active' && (
        <>
          {/* Filters */}
          <div className="bg-white shadow rounded-lg p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Severity
                </label>
                <select
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  value={severityFilter}
                  onChange={(e) => {
                    setSeverityFilter(e.target.value === '' ? '' : Number(e.target.value));
                    setPageNumber(1);
                  }}
                >
                  <option value="">All Severities</option>
                  <option value={3}>Critical</option>
                  <option value={2}>High</option>
                  <option value={1}>Medium</option>
                  <option value={0}>Low</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value === '' ? '' : Number(e.target.value));
                    setPageNumber(1);
                  }}
                >
                  <option value="">All Statuses</option>
                  <option value={0}>New</option>
                  <option value={1}>Acknowledged</option>
                  <option value={2}>Investigating</option>
                  <option value={3}>Resolved</option>
                  <option value={4}>Closed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  value={categoryFilter}
                  onChange={(e) => {
                    setCategoryFilter(e.target.value);
                    setPageNumber(1);
                  }}
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Incidents Table */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            {loading ? (
              <div className="p-6 text-center text-gray-600">{t('common.loading')}</div>
            ) : incidents.length === 0 ? (
              <div className="p-6 text-center text-gray-600">No incidents found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('detectedAt')}
                      >
                        Detected {sortField === 'detectedAt' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('title')}
                      >
                        Title {sortField === 'title' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('severity')}
                      >
                        Severity {sortField === 'severity' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('status')}
                      >
                        Status {sortField === 'status' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Assigned To
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {incidents.map((incident) => (
                      <tr key={incident.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {incident.detectedAt ? formatDate(incident.detectedAt) : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{incident.title}</div>
                          <div className="text-sm text-gray-500">{incident.source}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {getSeverityBadge(incident.severity)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {getStatusBadge(incident.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {incident.category}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {incident.assignedToUserName || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex gap-2">
                            <button
                              onClick={() => viewIncidentDetails(incident)}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              View
                            </button>
                            {incident.status === 0 && (
                              <button
                                onClick={() => handleAcknowledge(incident.id)}
                                className="text-yellow-600 hover:text-yellow-900"
                              >
                                Acknowledge
                              </button>
                            )}
                            {incident.status < 3 && (
                              <button
                                onClick={() => handleResolve(incident.id)}
                                className="text-green-600 hover:text-green-900"
                              >
                                Resolve
                              </button>
                            )}
                            {incident.status === 3 && (
                              <button
                                onClick={() => handleClose(incident.id)}
                                className="text-gray-600 hover:text-gray-900"
                              >
                                Close
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {incidents.length > 0 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
                <button
                  onClick={() => setPageNumber(pageNumber - 1)}
                  disabled={pageNumber === 1}
                  className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  {t('common.previous')}
                </button>
                <span className="text-sm text-gray-700">
                  {t('common.page')} {pageNumber}
                </span>
                <button
                  onClick={() => setPageNumber(pageNumber + 1)}
                  disabled={incidents.length < pageSize}
                  className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  {t('common.next')}
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Incident Details Tab */}
      {activeTab === 'details' && (
        <>
          {!selectedIncident ? (
            <div className="bg-white shadow rounded-lg p-6 text-center text-gray-600">
              Select an incident from the Active Incidents tab to view details
            </div>
          ) : (
            <div className="space-y-6">
              {/* Incident Header */}
              <div className="bg-white shadow rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{selectedIncident.title}</h2>
                    <p className="text-sm text-gray-500 mt-1">{selectedIncident.description}</p>
                  </div>
                  <div className="flex gap-2">
                    {getSeverityBadge(selectedIncident.severity)}
                    {getStatusBadge(selectedIncident.status)}
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Category:</span>
                    <span className="ml-2 font-medium">{selectedIncident.category}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Source:</span>
                    <span className="ml-2 font-medium">{selectedIncident.source}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Detected:</span>
                    <span className="ml-2 font-medium">{selectedIncident.detectedAt ? formatDate(selectedIncident.detectedAt) : '-'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Assigned To:</span>
                    <span className="ml-2 font-medium">{selectedIncident.assignedToUserName || 'Unassigned'}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-4 flex gap-2">
                  {selectedIncident.status === 0 && (
                    <button
                      onClick={() => handleAcknowledge(selectedIncident.id)}
                      className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600"
                    >
                      Acknowledge
                    </button>
                  )}
                  {selectedIncident.status < 3 && (
                    <button
                      onClick={() => handleResolve(selectedIncident.id)}
                      className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
                    >
                      Resolve
                    </button>
                  )}
                  {selectedIncident.status === 3 && (
                    <button
                      onClick={() => handleClose(selectedIncident.id)}
                      className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
                    >
                      Close
                    </button>
                  )}
                </div>
              </div>

              {/* Timeline */}
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Timeline</h3>
                {timeline.length === 0 ? (
                  <p className="text-gray-500">No timeline events</p>
                ) : (
                  <div className="space-y-4">
                    {timeline.map((event) => (
                      <div key={event.id} className="flex items-start">
                        <div className="flex-shrink-0 w-2 h-2 mt-2 bg-indigo-500 rounded-full"></div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{event.eventType}</div>
                          <div className="text-sm text-gray-500">{event.description}</div>
                          <div className="text-xs text-gray-400 mt-1">
                            {formatDate(event.occurredAt)}
                            {event.userName && ` by ${event.userName}`}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Linked Entities */}
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Linked Entities</h3>
                {(selectedIncident.linkedEntities?.length ?? 0) === 0 ? (
                  <p className="text-gray-500">No linked entities</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Linked At</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {selectedIncident.linkedEntities?.map((entity) => (
                          <tr key={entity.id}>
                            <td className="px-4 py-2 text-sm text-gray-900">{entity.entityType}</td>
                            <td className="px-4 py-2 text-sm text-gray-500">{entity.entityName}</td>
                            <td className="px-4 py-2 text-sm text-gray-500">{formatDate(entity.linkedAt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Notes */}
              <div className="bg-white shadow rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Notes</h3>
                  <button
                    onClick={() => setShowAddNote(true)}
                    className="bg-indigo-600 text-white px-3 py-1 rounded-md text-sm hover:bg-indigo-700"
                  >
                    Add Note
                  </button>
                </div>

                {showAddNote && (
                  <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                    <textarea
                      className="w-full border border-gray-300 rounded-md px-3 py-2 mb-2"
                      rows={3}
                      placeholder="Enter your note..."
                      value={newNoteContent}
                      onChange={(e) => setNewNoteContent(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleAddNote}
                        disabled={!newNoteContent.trim()}
                        className="bg-indigo-600 text-white px-3 py-1 rounded-md text-sm hover:bg-indigo-700 disabled:opacity-50"
                      >
                        Save Note
                      </button>
                      <button
                        onClick={() => {
                          setShowAddNote(false);
                          setNewNoteContent('');
                        }}
                        className="bg-gray-300 text-gray-700 px-3 py-1 rounded-md text-sm hover:bg-gray-400"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {(selectedIncident.notes?.length ?? 0) === 0 ? (
                  <p className="text-gray-500">No notes yet</p>
                ) : (
                  <div className="space-y-4">
                    {selectedIncident.notes?.map((note) => (
                      <div key={note.id} className="p-4 bg-gray-50 rounded-lg">
                        <div className="text-sm text-gray-900">{note.content}</div>
                        <div className="text-xs text-gray-500 mt-2">
                          {note.createdByUserName} - {formatDate(note.createdAt)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* Playbook Runs Tab */}
      {activeTab === 'playbooks' && (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {loading ? (
            <div className="p-6 text-center text-gray-600">{t('common.loading')}</div>
          ) : playbookRuns.length === 0 ? (
            <div className="p-6 text-center text-gray-600">No playbook runs found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Playbook
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Incident
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Progress
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Started At
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Completed At
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {playbookRuns.map((run) => (
                    <tr key={run.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {run.playbookName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {run.incidentTitle}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {getPlaybookStatusBadge(run.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                            <div
                              className="bg-indigo-600 h-2 rounded-full"
                              style={{ width: `${(run.stepsCompleted / run.totalSteps) * 100}%` }}
                            ></div>
                          </div>
                          <span>{run.stepsCompleted}/{run.totalSteps}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(run.startedAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {run.completedAt ? formatDate(run.completedAt) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {playbookRuns.length > 0 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
              <button
                onClick={() => setPlaybookPageNumber(playbookPageNumber - 1)}
                disabled={playbookPageNumber === 1}
                className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                {t('common.previous')}
              </button>
              <span className="text-sm text-gray-700">
                {t('common.page')} {playbookPageNumber}
              </span>
              <button
                onClick={() => setPlaybookPageNumber(playbookPageNumber + 1)}
                disabled={playbookRuns.length < pageSize}
                className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                {t('common.next')}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
