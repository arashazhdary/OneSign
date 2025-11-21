'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { getTenantId } from '@/lib/tenant-context';

interface RiskEvent {
  id: string;
  userId: string;
  eventType: number;
  riskLevel: number;
  ipAddress: string | null;
  userAgent: string | null;
  location: string | null;
  details: string | null;
  occurredAt: string;
}

export default function RiskEventsPage() {
  const t = useTranslations();
  const [events, setEvents] = useState<RiskEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Filters
  const [eventTypeFilter, setEventTypeFilter] = useState<number | ''>('');
  const [riskLevelFilter, setRiskLevelFilter] = useState<number | ''>('');
  const [pageNumber, setPageNumber] = useState(1);
  const pageSize = 20;

  // Create form
  const [newEventUserId, setNewEventUserId] = useState('');
  const [newEventType, setNewEventType] = useState<number>(1);
  const [newRiskLevel, setNewRiskLevel] = useState<number>(0);
  const [newIpAddress, setNewIpAddress] = useState('');
  const [newUserAgent, setNewUserAgent] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newDetails, setNewDetails] = useState('');

  const tenantId = getTenantId();

  useEffect(() => {
    fetchRiskEvents();
  }, [eventTypeFilter, riskLevelFilter, pageNumber]);

  const fetchRiskEvents = async () => {
    setLoading(true);
    setError('');
    try {
      let url = `http://localhost:7000/api/tenant/risk-events?tenantId=${tenantId}&pageNumber=${pageNumber}&pageSize=${pageSize}`;
      if (eventTypeFilter !== '') {
        url += `&eventType=${eventTypeFilter}`;
      }
      if (riskLevelFilter !== '') {
        url += `&riskLevel=${riskLevelFilter}`;
      }

      const response = await fetch(url, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch risk events');
      }

      const data = await response.json();
      setEvents(data);
    } catch (err) {
      setError(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const getEventTypeName = (type: number) => {
    const types: Record<number, string> = {
      1: t('riskEvents.newDeviceLogin'),
      2: t('riskEvents.geoAnomaly'),
      3: t('riskEvents.multipleFailedLogins'),
      4: t('riskEvents.suspiciousActivity'),
      5: t('riskEvents.accountLockout'),
    };
    return types[type] || t('riskEvents.unknown');
  };

  const getRiskLevelBadge = (level: number) => {
    const levels: Record<number, { text: string; className: string }> = {
      0: { text: t('riskEvents.low'), className: 'bg-green-100 text-green-800' },
      1: { text: t('riskEvents.medium'), className: 'bg-yellow-100 text-yellow-800' },
      2: { text: t('riskEvents.high'), className: 'bg-red-100 text-red-800' },
    };
    const levelInfo = levels[level] || levels[0];
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${levelInfo.className}`}>
        {levelInfo.text}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const handleCreateRiskEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const response = await fetch(`http://localhost:7000/api/tenant/risk-events?tenantId=${tenantId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          userId: newEventUserId,
          eventType: newEventType,
          riskLevel: newRiskLevel,
          ipAddress: newIpAddress || null,
          userAgent: newUserAgent || null,
          location: newLocation || null,
          details: newDetails || null,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create risk event');
      }

      setSuccess(t('riskEvents.eventCreated') || 'Risk event created successfully');
      setShowCreateModal(false);
      setNewEventUserId('');
      setNewEventType(1);
      setNewRiskLevel(0);
      setNewIpAddress('');
      setNewUserAgent('');
      setNewLocation('');
      setNewDetails('');
      fetchRiskEvents();
    } catch (err) {
      setError(t('common.error'));
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">{t('riskEvents.title')}</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
        >
          {t('riskEvents.createEvent') || 'Create Risk Event'}
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

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('riskEvents.eventType')}
            </label>
            <select
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              value={eventTypeFilter}
              onChange={(e) => setEventTypeFilter(e.target.value === '' ? '' : Number(e.target.value))}
            >
              <option value="">{t('riskEvents.allTypes')}</option>
              <option value={1}>{t('riskEvents.newDeviceLogin')}</option>
              <option value={2}>{t('riskEvents.geoAnomaly')}</option>
              <option value={3}>{t('riskEvents.multipleFailedLogins')}</option>
              <option value={4}>{t('riskEvents.suspiciousActivity')}</option>
              <option value={5}>{t('riskEvents.accountLockout')}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('riskEvents.riskLevel')}
            </label>
            <select
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              value={riskLevelFilter}
              onChange={(e) => setRiskLevelFilter(e.target.value === '' ? '' : Number(e.target.value))}
            >
              <option value="">{t('riskEvents.allLevels')}</option>
              <option value={0}>{t('riskEvents.low')}</option>
              <option value={1}>{t('riskEvents.medium')}</option>
              <option value={2}>{t('riskEvents.high')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Events Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-6 text-center text-gray-600">{t('common.loading')}</div>
        ) : events.length === 0 ? (
          <div className="p-6 text-center text-gray-600">{t('riskEvents.noEvents')}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('riskEvents.date')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('riskEvents.eventType')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('riskEvents.riskLevel')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('riskEvents.ipAddress')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('riskEvents.location')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('riskEvents.details')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {events.map((event) => (
                  <tr key={event.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(event.occurredAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getEventTypeName(event.eventType)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {getRiskLevelBadge(event.riskLevel)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {event.ipAddress || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {event.location || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {event.details || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {events.length > 0 && (
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
              disabled={events.length < pageSize}
              className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              {t('common.next')}
            </button>
          </div>
        )}
      </div>

      {/* Create Risk Event Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full">
            <h2 className="text-xl font-bold mb-4">{t('riskEvents.createEvent') || 'Create Risk Event'}</h2>
            <form onSubmit={handleCreateRiskEvent}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('riskEvents.userId') || 'User ID'}
                </label>
                <input
                  type="text"
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  value={newEventUserId}
                  onChange={(e) => setNewEventUserId(e.target.value)}
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('riskEvents.eventType')}
                </label>
                <select
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  value={newEventType}
                  onChange={(e) => setNewEventType(Number(e.target.value))}
                >
                  <option value={1}>{t('riskEvents.newDeviceLogin')}</option>
                  <option value={2}>{t('riskEvents.geoAnomaly')}</option>
                  <option value={3}>{t('riskEvents.multipleFailedLogins')}</option>
                  <option value={4}>{t('riskEvents.suspiciousActivity')}</option>
                  <option value={5}>{t('riskEvents.accountLockout')}</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('riskEvents.riskLevel')}
                </label>
                <select
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  value={newRiskLevel}
                  onChange={(e) => setNewRiskLevel(Number(e.target.value))}
                >
                  <option value={0}>{t('riskEvents.low')}</option>
                  <option value={1}>{t('riskEvents.medium')}</option>
                  <option value={2}>{t('riskEvents.high')}</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('riskEvents.ipAddress')} ({t('common.optional') || 'Optional'})
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  value={newIpAddress}
                  onChange={(e) => setNewIpAddress(e.target.value)}
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('riskEvents.userAgent') || 'User Agent'} ({t('common.optional') || 'Optional'})
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  value={newUserAgent}
                  onChange={(e) => setNewUserAgent(e.target.value)}
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('riskEvents.location')} ({t('common.optional') || 'Optional'})
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('riskEvents.details')} ({t('common.optional') || 'Optional'})
                </label>
                <textarea
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  rows={3}
                  value={newDetails}
                  onChange={(e) => setNewDetails(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                >
                  {t('common.create')}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                >
                  {t('common.cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
