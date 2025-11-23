'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { getTenantId } from '@/lib/tenant-context';
import { usersService } from '@/lib/api/services';

interface UserSession {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  ipAddress: string;
  deviceType: string;
  deviceName: string;
  browser: string;
  location: string;
  country: string;
  city: string;
  isCurrentSession: boolean;
  isSuspicious: boolean;
  suspiciousReasons?: string[];
  loginAt: string;
  lastActivityAt: string;
  expiresAt: string;
  duration: string;
}

interface SessionHistory {
  id: string;
  userId: string;
  userName: string;
  ipAddress: string;
  device: string;
  location: string;
  loginAt: string;
  logoutAt: string;
  duration: string;
  status: 'completed' | 'forced_logout' | 'expired' | 'revoked';
}

const mockSessions: UserSession[] = [
  {
    id: '1',
    userId: 'user-1',
    userName: 'John Doe',
    userEmail: 'john.doe@example.com',
    ipAddress: '192.168.1.100',
    deviceType: 'Desktop',
    deviceName: 'Windows 11',
    browser: 'Chrome 120.0',
    location: 'New York, USA',
    country: 'United States',
    city: 'New York',
    isCurrentSession: false,
    isSuspicious: false,
    loginAt: '2025-11-23T08:30:00Z',
    lastActivityAt: '2025-11-23T11:45:00Z',
    expiresAt: '2025-11-24T08:30:00Z',
    duration: '3h 15m',
  },
  {
    id: '2',
    userId: 'user-2',
    userName: 'Jane Smith',
    userEmail: 'jane.smith@example.com',
    ipAddress: '10.0.0.50',
    deviceType: 'Mobile',
    deviceName: 'iPhone 15 Pro',
    browser: 'Safari 17.1',
    location: 'San Francisco, USA',
    country: 'United States',
    city: 'San Francisco',
    isCurrentSession: false,
    isSuspicious: false,
    loginAt: '2025-11-23T09:00:00Z',
    lastActivityAt: '2025-11-23T11:40:00Z',
    expiresAt: '2025-11-24T09:00:00Z',
    duration: '2h 40m',
  },
  {
    id: '3',
    userId: 'user-3',
    userName: 'Bob Johnson',
    userEmail: 'bob.johnson@example.com',
    ipAddress: '203.45.67.89',
    deviceType: 'Desktop',
    deviceName: 'macOS Sonoma',
    browser: 'Firefox 121.0',
    location: 'London, UK',
    country: 'United Kingdom',
    city: 'London',
    isCurrentSession: false,
    isSuspicious: true,
    suspiciousReasons: ['Unusual location', 'New device'],
    loginAt: '2025-11-23T10:15:00Z',
    lastActivityAt: '2025-11-23T11:30:00Z',
    expiresAt: '2025-11-24T10:15:00Z',
    duration: '1h 15m',
  },
  {
    id: '4',
    userId: 'user-1',
    userName: 'John Doe',
    userEmail: 'john.doe@example.com',
    ipAddress: '192.168.1.101',
    deviceType: 'Tablet',
    deviceName: 'iPad Pro',
    browser: 'Safari 17.0',
    location: 'New York, USA',
    country: 'United States',
    city: 'New York',
    isCurrentSession: false,
    isSuspicious: false,
    loginAt: '2025-11-23T07:00:00Z',
    lastActivityAt: '2025-11-23T11:25:00Z',
    expiresAt: '2025-11-24T07:00:00Z',
    duration: '4h 25m',
  },
];

const mockHistory: SessionHistory[] = [
  {
    id: 'h1',
    userId: 'user-1',
    userName: 'John Doe',
    ipAddress: '192.168.1.100',
    device: 'Windows 11 - Chrome',
    location: 'New York, USA',
    loginAt: '2025-11-22T14:00:00Z',
    logoutAt: '2025-11-22T18:30:00Z',
    duration: '4h 30m',
    status: 'completed',
  },
  {
    id: 'h2',
    userId: 'user-2',
    userName: 'Jane Smith',
    ipAddress: '10.0.0.50',
    device: 'iPhone 15 Pro - Safari',
    location: 'San Francisco, USA',
    loginAt: '2025-11-22T09:15:00Z',
    logoutAt: '2025-11-22T17:45:00Z',
    duration: '8h 30m',
    status: 'completed',
  },
  {
    id: 'h3',
    userId: 'user-3',
    userName: 'Bob Johnson',
    ipAddress: '203.45.67.88',
    device: 'macOS Sonoma - Firefox',
    location: 'London, UK',
    loginAt: '2025-11-22T12:00:00Z',
    logoutAt: '2025-11-22T13:30:00Z',
    duration: '1h 30m',
    status: 'forced_logout',
  },
  {
    id: 'h4',
    userId: 'user-4',
    userName: 'Alice Williams',
    ipAddress: '45.67.89.12',
    device: 'Ubuntu - Chrome',
    location: 'Toronto, Canada',
    loginAt: '2025-11-21T10:00:00Z',
    logoutAt: '2025-11-22T10:00:00Z',
    duration: '24h',
    status: 'expired',
  },
];

export default function SessionsPage() {
  const t = useTranslations();
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [history, setHistory] = useState<SessionHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<UserSession | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tenantId, setTenantIdState] = useState<string | null>(null);
  const [filterSuspicious, setFilterSuspicious] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const contextTenantId = getTenantId();
    if (contextTenantId) {
      setTenantIdState(contextTenantId);
    } else {
      setTenantIdState('00000000-0000-0000-0000-000000000000');
    }
  }, []);

  useEffect(() => {
    if (tenantId) {
      fetchSessions();
      fetchHistory();
    }
  }, [tenantId]);

  const fetchSessions = async () => {
    if (!tenantId) return;

    try {
      // API call would go here
      // const data = await usersService.getAccountSessions(tenantId);
      setSessions(mockSessions);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      setSessions(mockSessions);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    if (!tenantId) return;

    try {
      // API call would go here
      setHistory(mockHistory);
    } catch (error) {
      console.error('Error fetching session history:', error);
      setHistory(mockHistory);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    if (!tenantId) return;
    if (!confirm('Are you sure you want to revoke this session? The user will be logged out immediately.')) return;

    setError('');
    setSuccess('');

    try {
      await usersService.revokeSession(tenantId, sessionId);
      setSuccess('Session revoked successfully. User has been logged out.');
      fetchSessions();
    } catch (error: any) {
      setError(error?.message || 'Failed to revoke session');
      console.error('Error revoking session:', error);
    }
  };

  const handleRevokeAllUserSessions = async (userId: string) => {
    if (!confirm('Are you sure you want to revoke ALL sessions for this user?')) return;

    setError('');
    setSuccess('');

    try {
      // API call would go here
      setSuccess('All user sessions revoked successfully');
      fetchSessions();
    } catch (error: any) {
      setError(error?.message || 'Failed to revoke sessions');
    }
  };

  const handleRevokeSuspiciousSessions = async () => {
    if (!confirm('Are you sure you want to revoke all suspicious sessions?')) return;

    setError('');
    setSuccess('');

    try {
      // API call would go here
      setSuccess('All suspicious sessions revoked successfully');
      fetchSessions();
    } catch (error: any) {
      setError(error?.message || 'Failed to revoke suspicious sessions');
    }
  };

  const openDetailsModal = (session: UserSession) => {
    setSelectedSession(session);
    setShowDetailsModal(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      completed: 'bg-green-100 text-green-800',
      forced_logout: 'bg-yellow-100 text-yellow-800',
      expired: 'bg-gray-100 text-gray-800',
      revoked: 'bg-red-100 text-red-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const filteredSessions = sessions.filter((session) => {
    const matchesSearch =
      session.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.ipAddress.includes(searchQuery);

    const matchesFilter = !filterSuspicious || session.isSuspicious;

    return matchesSearch && matchesFilter;
  });

  const suspiciousSessionsCount = sessions.filter(s => s.isSuspicious).length;
  const activeSessionsCount = sessions.length;
  const uniqueUsersCount = new Set(sessions.map(s => s.userId)).size;

  if (loading) {
    return <div className="p-8">Loading sessions...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Active Sessions Management</h1>
        <button
          onClick={() => setShowHistoryModal(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          View History
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

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm text-gray-600 mb-2">Active Sessions</h3>
          <p className="text-3xl font-bold text-gray-900">{activeSessionsCount}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm text-gray-600 mb-2">Unique Users</h3>
          <p className="text-3xl font-bold text-gray-900">{uniqueUsersCount}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm text-gray-600 mb-2">Suspicious Sessions</h3>
          <div className="flex items-center justify-between">
            <p className="text-3xl font-bold text-red-600">{suspiciousSessionsCount}</p>
            {suspiciousSessionsCount > 0 && (
              <button
                onClick={handleRevokeSuspiciousSessions}
                className="text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
              >
                Revoke All
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by user name, email, or IP address..."
              className="w-full px-4 py-2 border rounded"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={filterSuspicious}
                onChange={(e) => setFilterSuspicious(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">Show only suspicious</span>
            </label>
          </div>
        </div>
      </div>

      {/* Sessions Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Device</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP Address</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Login Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredSessions.map((session) => (
              <tr key={session.id} className={session.isSuspicious ? 'bg-red-50' : ''}>
                <td className="px-6 py-4 text-sm">
                  <div>
                    <p className="font-medium text-gray-900">{session.userName}</p>
                    <p className="text-gray-500 text-xs">{session.userEmail}</p>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  <div>
                    <p>{session.deviceName}</p>
                    <p className="text-gray-500 text-xs">{session.browser}</p>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{session.location}</td>
                <td className="px-6 py-4 text-sm text-gray-500 font-mono">{session.ipAddress}</td>
                <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                  {formatDate(session.loginAt)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{session.duration}</td>
                <td className="px-6 py-4 text-sm">
                  {session.isSuspicious ? (
                    <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-medium">
                      Suspicious
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                      Normal
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm whitespace-nowrap">
                  <button
                    onClick={() => openDetailsModal(session)}
                    className="text-indigo-600 hover:text-indigo-900 mr-3"
                  >
                    Details
                  </button>
                  <button
                    onClick={() => handleRevokeSession(session.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Revoke
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredSessions.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No active sessions found.
          </div>
        )}
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Session Details</h2>

            {selectedSession.isSuspicious && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded p-4">
                <h3 className="font-semibold text-red-800 mb-2">Suspicious Activity Detected</h3>
                <ul className="list-disc list-inside text-sm text-red-700">
                  {selectedSession.suspiciousReasons?.map((reason, index) => (
                    <li key={index}>{reason}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-600">User</h3>
                  <p className="text-sm text-gray-900">{selectedSession.userName}</p>
                  <p className="text-xs text-gray-500">{selectedSession.userEmail}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-600">User ID</h3>
                  <p className="text-sm text-gray-900 font-mono">{selectedSession.userId}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-600">Device Type</h3>
                  <p className="text-sm text-gray-900">{selectedSession.deviceType}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-600">Device Name</h3>
                  <p className="text-sm text-gray-900">{selectedSession.deviceName}</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-600">Browser</h3>
                <p className="text-sm text-gray-900">{selectedSession.browser}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-600">IP Address</h3>
                  <p className="text-sm text-gray-900 font-mono">{selectedSession.ipAddress}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-600">Location</h3>
                  <p className="text-sm text-gray-900">{selectedSession.location}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-600">Login Time</h3>
                  <p className="text-sm text-gray-900">{formatDate(selectedSession.loginAt)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-600">Last Activity</h3>
                  <p className="text-sm text-gray-900">{formatDate(selectedSession.lastActivityAt)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-600">Session Duration</h3>
                  <p className="text-sm text-gray-900">{selectedSession.duration}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-600">Expires At</h3>
                  <p className="text-sm text-gray-900">{formatDate(selectedSession.expiresAt)}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => {
                  handleRevokeSession(selectedSession.id);
                  setShowDetailsModal(false);
                }}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Revoke Session
              </button>
              <button
                onClick={() => {
                  handleRevokeAllUserSessions(selectedSession.userId);
                  setShowDetailsModal(false);
                }}
                className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
              >
                Revoke All User Sessions
              </button>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Session History</h2>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Device</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Login</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Logout</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {history.map((session) => (
                    <tr key={session.id}>
                      <td className="px-4 py-3 text-sm text-gray-900">{session.userName}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{session.device}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{session.location}</td>
                      <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                        {formatDate(session.loginAt)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                        {formatDate(session.logoutAt)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{session.duration}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded text-xs ${getStatusBadge(session.status)}`}>
                          {session.status.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4">
              <button
                onClick={() => setShowHistoryModal(false)}
                className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
