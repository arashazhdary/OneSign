import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import * as observabilityApi from '@/lib/api/observability';
import { Helmet } from 'react-helmet-async';

interface AuditEvent {
  id: string;
  eventType: string;
  tenantId?: string;
  tenantName?: string;
  userId: string;
  userEmail: string;
  action: string;
  resource: string;
  resourceId?: string;
  outcome: 'Success' | 'Failure' | 'Partial';
  ipAddress: string;
  userAgent: string;
  timestamp: string;
  details?: Record<string, any>;
}

interface AuditSearchRequest {
  eventTypes?: string[];
  tenantIds?: string[];
  userIds?: string[];
  actions?: string[];
  resources?: string[];
  outcomes?: string[];
  startDate?: string;
  endDate?: string;
  searchTerm?: string;
  page: number;
  pageSize: number;
}

type Tab = 'search' | 'detail';

export default function GlobalObservabilityPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<Tab>('search');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [totalEvents, setTotalEvents] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const [searchRequest, setSearchRequest] = useState<AuditSearchRequest>({
    page: 1,
    pageSize,
  });

  const [selectedEventId, setSelectedEventId] = useState('');
  const [eventDetail, setEventDetail] = useState<AuditEvent | null>(null);

  const searchAuditEvents = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await observabilityApi.searchGlobalAuditEvents({
        ...searchRequest,
        pageNumber: page,
        pageSize,
      });
      setAuditEvents(data.events || []);
      setTotalEvents(data.totalCount || 0);
    } catch (err) {
      setError(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const getAuditEvent = async () => {
    if (!selectedEventId) return;
    setLoading(true);
    setError('');
    try {
      const data = await observabilityApi.getGlobalAuditEvent(selectedEventId);
      setEventDetail(data);
    } catch (err) {
      setError(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'search') {
      searchAuditEvents();
    }
  }, [page]);

  const getOutcomeColor = (outcome: string) => {
    switch (outcome) {
      case 'Success': return 'bg-green-100 text-green-800';
      case 'Failure': return 'bg-red-100 text-red-800';
      case 'Partial': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-8">
      <Helmet>
        <title>{t('globalObservability.pageTitle')}</title>
      </Helmet>
      <h1 className="text-3xl font-bold mb-6">{t('globalObservability.pageTitle')}</h1>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>
      )}

      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {(['search', 'detail'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab === 'search' ? t('globalObservability.searchEvents') : t('globalObservability.eventDetail')}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'search' && (
        <div>
          <div className="mb-6 bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">{t('globalObservability.searchFilters')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('globalObservability.searchTerm')}</label>
                <input
                  type="text"
                  value={searchRequest.searchTerm || ''}
                  onChange={(e) => setSearchRequest({ ...searchRequest, searchTerm: e.target.value })}
                  placeholder={t('globalObservability.searchPlaceholder')}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('globalObservability.startDate')}</label>
                <input
                  type="datetime-local"
                  value={searchRequest.startDate || ''}
                  onChange={(e) => setSearchRequest({ ...searchRequest, startDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('globalObservability.endDate')}</label>
                <input
                  type="datetime-local"
                  value={searchRequest.endDate || ''}
                  onChange={(e) => setSearchRequest({ ...searchRequest, endDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => {
                  setPage(1);
                  searchAuditEvents();
                }}
                disabled={loading}
                className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
              >
                {loading ? t('globalObservability.searching') : t('globalObservability.search')}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('globalObservability.eventType')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('globalObservability.tenant')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('globalObservability.user')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('globalObservability.action')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('globalObservability.resource')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('globalObservability.outcome')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('globalObservability.timestamp')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('globalObservability.actions')}</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {auditEvents.map((event) => (
                  <tr key={event.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs rounded bg-indigo-100 text-indigo-800">
                        {event.eventType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {event.tenantName || event.tenantId || t('globalObservability.global')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {event.userEmail || event.userId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {event.action}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {event.resource}
                      {event.resourceId && <div className="text-xs text-gray-400">{event.resourceId}</div>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded ${getOutcomeColor(event.outcome)}`}>
                        {event.outcome}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(event.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => {
                          setSelectedEventId(event.id);
                          setActiveTab('detail');
                          getAuditEvent();
                        }}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        {t('globalObservability.view')}
                      </button>
                    </td>
                  </tr>
                ))}
                {auditEvents.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                      {t('globalObservability.noEventsFound')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            {totalEvents > pageSize && (
              <div className="px-6 py-4 flex justify-between items-center border-t">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  {t('common.previous')}
                </button>
                <span className="text-sm text-gray-500">
                  Page {page} / {Math.ceil(totalEvents / pageSize)}
                </span>
                <button
                  onClick={() => setPage(p => p + 1)}
                  disabled={page >= Math.ceil(totalEvents / pageSize)}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  {t('common.next')}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'detail' && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-4 flex gap-2">
            <input
              type="text"
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              placeholder={t('globalObservability.enterEventId')}
              className="flex-1 px-3 py-2 border border-gray-300 rounded"
            />
            <button
              onClick={getAuditEvent}
              disabled={!selectedEventId || loading}
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? t('common.loading') : t('globalObservability.getEvent')}
            </button>
          </div>

          {eventDetail && (
            <div className="space-y-6">
              <div className="flex items-start justify-between pb-4 border-b">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{eventDetail.eventType}</h2>
                  <p className="text-sm text-gray-500 mt-1">{t('globalObservability.eventId')}: {eventDetail.id}</p>
                </div>
                <span className={`px-3 py-1 rounded text-sm font-semibold ${getOutcomeColor(eventDetail.outcome)}`}>
                  {eventDetail.outcome}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">{t('globalObservability.eventInformation')}</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-gray-500">{t('globalObservability.action')}:</span>
                      <p className="font-medium">{eventDetail.action}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">{t('globalObservability.resource')}:</span>
                      <p className="font-medium">{eventDetail.resource}</p>
                      {eventDetail.resourceId && (
                        <p className="text-xs text-gray-600 mt-1">{eventDetail.resourceId}</p>
                      )}
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">{t('globalObservability.timestamp')}:</span>
                      <p className="font-medium">{new Date(eventDetail.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">{t('globalObservability.userAndTenant')}</h3>
                  <div className="space-y-3">
                    {eventDetail.tenantName && (
                      <div>
                        <span className="text-sm text-gray-500">{t('globalObservability.tenant')}:</span>
                        <p className="font-medium">{eventDetail.tenantName}</p>
                        <p className="text-xs text-gray-600 mt-1">{eventDetail.tenantId}</p>
                      </div>
                    )}
                    <div>
                      <span className="text-sm text-gray-500">{t('globalObservability.user')}:</span>
                      <p className="font-medium">{eventDetail.userEmail}</p>
                      <p className="text-xs text-gray-600 mt-1">{eventDetail.userId}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">{t('globalObservability.ipAddress')}:</span>
                      <p className="font-medium">{eventDetail.ipAddress}</p>
                    </div>
                  </div>
                </div>
              </div>

              {eventDetail.userAgent && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">{t('globalObservability.userAgent')}</h3>
                  <p className="text-sm text-gray-600 font-mono bg-gray-50 p-3 rounded">{eventDetail.userAgent}</p>
                </div>
              )}

              {eventDetail.details && Object.keys(eventDetail.details).length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">{t('globalObservability.additionalDetails')}</h3>
                  <pre className="text-sm text-gray-800 bg-gray-50 p-4 rounded overflow-auto max-h-96">
                    {JSON.stringify(eventDetail.details, null, 2)}
                  </pre>
                </div>
              )}

              <div className="pt-4 border-t flex justify-end">
                <button
                  onClick={() => {
                    setEventDetail(null);
                    setSelectedEventId('');
                    setActiveTab('search');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                >
                  {t('globalObservability.backToSearch')}
                </button>
              </div>
            </div>
          )}

          {!eventDetail && !loading && (
            <div className="text-center text-gray-500 py-12">
              {t('globalObservability.enterEventIdPrompt')}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
