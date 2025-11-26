import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocale } from '@/hooks/useLocale';
import { getTenantId } from '@/lib/tenant-context';
import * as ObservabilityAPI from '@/lib/api/observability';
import { Helmet } from 'react-helmet-async';


export default function TenantObservabilityPage() {
  const { t } = useTranslation();
  const locale = useLocale();
  const [tenantId, setTenantIdState] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Search filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [eventType, setEventType] = useState('');
  const [action, setAction] = useState('');
  const [actorId, setActorId] = useState('');
  const [resourceType, setResourceType] = useState('');
  const [resourceId, setResourceId] = useState('');
  const [successFilter, setSuccessFilter] = useState<boolean | null>(null);
  const [ipAddress, setIpAddress] = useState('');

  // Results
  const [searchResults, setSearchResults] = useState<ObservabilityAPI.AuditSearchResult | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<ObservabilityAPI.AuditEvent | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Pagination
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  useEffect(() => {
    const contextTenantId = getTenantId();
    setTenantIdState(contextTenantId || '00000000-0000-0000-0000-000000000000');
  }, []);

  useEffect(() => {
    // Set default date range (last 7 days)
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 7);

    setEndDate(end.toISOString().split('T')[0]);
    setStartDate(start.toISOString().split('T')[0]);
  }, []);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');
    setLoading(true);

    if (!tenantId) return;

    try {
      const filter: ObservabilityAPI.AuditSearchFilter = {
        tenantId,
        startDate: startDate ? new Date(startDate).toISOString() : undefined,
        endDate: endDate ? new Date(endDate).toISOString() : undefined,
        eventType: eventType || undefined,
        action: action || undefined,
        actorId: actorId || undefined,
        resourceType: resourceType || undefined,
        resourceId: resourceId || undefined,
        success: successFilter !== null ? successFilter : undefined,
        ipAddress: ipAddress || undefined,
        pageNumber,
        pageSize
      };

      const data = await ObservabilityAPI.searchAuditEvents(tenantId, filter);
      setSearchResults(data);
    } catch (error) {
      setError(t('common.error'));
      console.error('Error searching audit events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    setError('');
    setSuccess('');
    if (!tenantId) return;

    try {
      const filter: Omit<ObservabilityAPI.AuditSearchFilter, 'pageNumber' | 'pageSize'> = {
        tenantId,
        startDate: startDate ? new Date(startDate).toISOString() : undefined,
        endDate: endDate ? new Date(endDate).toISOString() : undefined,
        eventType: eventType || undefined,
        action: action || undefined,
        actorId: actorId || undefined,
        resourceType: resourceType || undefined,
        resourceId: resourceId || undefined,
        success: successFilter !== null ? successFilter : undefined,
        ipAddress: ipAddress || undefined
      };

      const blob = await ObservabilityAPI.exportAuditLogs(tenantId, filter);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-log-${new Date().toISOString()}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setSuccess(t('tenant.observability.exportSuccess') || 'Audit logs exported successfully');
    } catch (error) {
      setError(t('common.error'));
      console.error('Error exporting audit logs:', error);
    }
  };

  const handleViewDetails = async (event: ObservabilityAPI.AuditEvent) => {
    setSelectedEvent(event);
    setShowDetailModal(true);
  };

  const clearFilters = () => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 7);

    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
    setEventType('');
    setAction('');
    setActorId('');
    setResourceType('');
    setResourceId('');
    setSuccessFilter(null);
    setIpAddress('');
    setSearchResults(null);
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{t('tenant.observability.title') || 'Advanced Audit Search'}</h1>
        {searchResults && (
          <button
            onClick={handleExport}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            {t('tenant.observability.export') || 'Export Results'}
          </button>
        )}
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

      {/* Search Form */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">{t('tenant.observability.searchFilters') || 'Search Filters'}</h2>
        <form onSubmit={handleSearch}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium mb-2">{t('tenant.observability.startDate') || 'Start Date'}</label>
              <input
                type="date"
                className="w-full px-3 py-2 border rounded"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">{t('tenant.observability.endDate') || 'End Date'}</label>
              <input
                type="date"
                className="w-full px-3 py-2 border rounded"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            {/* Event Type */}
            <div>
              <label className="block text-sm font-medium mb-2">{t('tenant.observability.eventType') || 'Event Type'}</label>
              <select
                className="w-full px-3 py-2 border rounded"
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
              >
                <option value="">{t('common.all') || 'All'}</option>
                <option value="Authentication">Authentication</option>
                <option value="Authorization">Authorization</option>
                <option value="UserManagement">User Management</option>
                <option value="ApplicationManagement">Application Management</option>
                <option value="SecurityPolicy">Security Policy</option>
                <option value="Configuration">Configuration</option>
              </select>
            </div>

            {/* Action */}
            <div>
              <label className="block text-sm font-medium mb-2">{t('tenant.observability.action') || 'Action'}</label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded"
                value={action}
                onChange={(e) => setAction(e.target.value)}
                placeholder="Login, Create, Update, Delete..."
              />
            </div>

            {/* Actor ID */}
            <div>
              <label className="block text-sm font-medium mb-2">{t('tenant.observability.actorId') || 'Actor (User ID)'}</label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded"
                value={actorId}
                onChange={(e) => setActorId(e.target.value)}
                placeholder="User ID or Email"
              />
            </div>

            {/* Resource Type */}
            <div>
              <label className="block text-sm font-medium mb-2">{t('tenant.observability.resourceType') || 'Resource Type'}</label>
              <select
                className="w-full px-3 py-2 border rounded"
                value={resourceType}
                onChange={(e) => setResourceType(e.target.value)}
              >
                <option value="">{t('common.all') || 'All'}</option>
                <option value="User">User</option>
                <option value="Application">Application</option>
                <option value="Role">Role</option>
                <option value="Policy">Policy</option>
                <option value="OrgUnit">Org Unit</option>
              </select>
            </div>

            {/* Resource ID */}
            <div>
              <label className="block text-sm font-medium mb-2">{t('tenant.observability.resourceId') || 'Resource ID'}</label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded"
                value={resourceId}
                onChange={(e) => setResourceId(e.target.value)}
                placeholder="Resource ID"
              />
            </div>

            {/* IP Address */}
            <div>
              <label className="block text-sm font-medium mb-2">{t('tenant.observability.ipAddress') || 'IP Address'}</label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded"
                value={ipAddress}
                onChange={(e) => setIpAddress(e.target.value)}
                placeholder="192.168.1.1"
              />
            </div>

            {/* Success Filter */}
            <div>
              <label className="block text-sm font-medium mb-2">{t('tenant.observability.status') || 'Status'}</label>
              <select
                className="w-full px-3 py-2 border rounded"
                value={successFilter === null ? 'all' : successFilter.toString()}
                onChange={(e) => {
                  const value = e.target.value;
                  setSuccessFilter(value === 'all' ? null : value === 'true');
                }}
              >
                <option value="all">{t('common.all') || 'All'}</option>
                <option value="true">{t('tenant.observability.success') || 'Success'}</option>
                <option value="false">{t('tenant.observability.failed') || 'Failed'}</option>
              </select>
            </div>
          </div>

          <div className="mt-6 flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700 disabled:bg-gray-400"
            >
              {loading ? t('tenant.observability.searching') || 'Searching...' : t('tenant.observability.search') || 'Search'}
            </button>
            <button
              type="button"
              onClick={clearFilters}
              className="bg-gray-300 px-6 py-2 rounded hover:bg-gray-400"
            >
              {t('tenant.observability.clearFilters') || 'Clear Filters'}
            </button>
          </div>
        </form>
      </div>

      {/* Search Results */}
      {searchResults && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold">
              {t('tenant.observability.results') || 'Search Results'} ({searchResults.totalCount.toLocaleString()} {t('tenant.observability.events') || 'events'})
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('tenant.observability.timestamp') || 'Timestamp'}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('tenant.observability.eventType') || 'Event Type'}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('tenant.observability.action') || 'Action'}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('tenant.observability.actor') || 'Actor'}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('tenant.observability.resource') || 'Resource'}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('tenant.observability.status') || 'Status'}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {searchResults.events.map((event) => (
                  <tr key={event.id} className={!event.success ? 'bg-red-50' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(event.timestamp).toLocaleString(locale)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{event.eventType}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{event.action}</td>
                    <td className="px-6 py-4 text-sm">
                      <div className="text-gray-900">{event.actorEmail}</div>
                      <div className="text-gray-500 text-xs">{event.actorId}</div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="text-gray-900">{event.resourceType}</div>
                      <div className="text-gray-500 text-xs">{event.resourceId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        event.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {event.success ? t('tenant.observability.success') || 'Success' : t('tenant.observability.failed') || 'Failed'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleViewDetails(event)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        {t('tenant.observability.viewDetails') || 'View Details'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {searchResults.events.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {t('tenant.observability.noResults') || 'No audit events found matching your criteria'}
            </div>
          )}

          {/* Pagination */}
          {searchResults.totalCount > pageSize && (
            <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
              <div className="text-sm text-gray-700">
                {t('tenant.observability.showing') || 'Showing'} {((pageNumber - 1) * pageSize) + 1} - {Math.min(pageNumber * pageSize, searchResults.totalCount)} {t('tenant.observability.of') || 'of'} {searchResults.totalCount.toLocaleString()}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setPageNumber(Math.max(1, pageNumber - 1));
                    handleSearch();
                  }}
                  disabled={pageNumber === 1}
                  className="px-3 py-1 border rounded disabled:bg-gray-100 disabled:text-gray-400"
                >
                  {t('common.previous') || 'Previous'}
                </button>
                <button
                  onClick={() => {
                    setPageNumber(pageNumber + 1);
                    handleSearch();
                  }}
                  disabled={pageNumber * pageSize >= searchResults.totalCount}
                  className="px-3 py-1 border rounded disabled:bg-gray-100 disabled:text-gray-400"
                >
                  {t('common.next') || 'Next'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">{t('tenant.observability.eventDetails') || 'Event Details'}</h2>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">{t('tenant.observability.timestamp') || 'Timestamp'}</h3>
                  <p className="text-sm text-gray-900">{new Date(selectedEvent.timestamp).toLocaleString(locale)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">{t('tenant.observability.eventType') || 'Event Type'}</h3>
                  <p className="text-sm text-gray-900">{selectedEvent.eventType}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">{t('tenant.observability.action') || 'Action'}</h3>
                  <p className="text-sm text-gray-900">{selectedEvent.action}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">{t('tenant.observability.status') || 'Status'}</h3>
                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                    selectedEvent.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedEvent.success ? t('tenant.observability.success') || 'Success' : t('tenant.observability.failed') || 'Failed'}
                  </span>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="text-sm font-medium text-gray-500 mb-2">{t('tenant.observability.actor') || 'Actor'}</h3>
                <p className="text-sm text-gray-900">{selectedEvent.actorEmail}</p>
                <p className="text-xs text-gray-500">{selectedEvent.actorId}</p>
              </div>

              <div className="border-t pt-4">
                <h3 className="text-sm font-medium text-gray-500 mb-2">{t('tenant.observability.resource') || 'Resource'}</h3>
                <p className="text-sm text-gray-900">{selectedEvent.resourceType}</p>
                <p className="text-xs text-gray-500">{selectedEvent.resourceId}</p>
              </div>

              <div className="border-t pt-4">
                <h3 className="text-sm font-medium text-gray-500 mb-2">{t('tenant.observability.connectionInfo') || 'Connection Info'}</h3>
                <p className="text-sm text-gray-900"><strong>IP:</strong> {selectedEvent.ipAddress}</p>
                <p className="text-sm text-gray-900"><strong>User Agent:</strong> {selectedEvent.userAgent}</p>
              </div>

              {selectedEvent.errorMessage && (
                <div className="border-t pt-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">{t('tenant.observability.error') || 'Error Message'}</h3>
                  <p className="text-sm text-red-600">{selectedEvent.errorMessage}</p>
                </div>
              )}

              {selectedEvent.metadata && Object.keys(selectedEvent.metadata).length > 0 && (
                <div className="border-t pt-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">{t('tenant.observability.metadata') || 'Metadata'}</h3>
                  <pre className="text-xs bg-gray-50 p-3 rounded overflow-auto max-h-64">
                    {JSON.stringify(selectedEvent.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedEvent(null);
                }}
                className="bg-gray-300 px-4 py-2 rounded"
              >
                {t('common.close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
