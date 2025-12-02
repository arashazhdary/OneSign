import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getTenantId } from '@/lib/tenant-context';
import { usersService } from '@/lib/api/services';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Monitor,
  Users,
  AlertTriangle,
  Search,
  History,
  Eye,
  Power,
  Smartphone,
  Tablet,
  MapPin,
  Clock,
  X,
  Shield,
  Globe,
  Activity,
} from 'lucide-react';

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

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  delay: number;
  action?: React.ReactNode;
}

const StatCard = ({ title, value, icon, color, delay, action }: StatCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: delay * 0.1 }}
    className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300"
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-xl ${color}`}>{icon}</div>
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>
  </motion.div>
);

// Mock data for fallback
const mockSessionsFallback: UserSession[] = [
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

const mockHistoryFallback: SessionHistory[] = [
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

export default function TenantSessionsPage() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language;
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
      const data = await usersService.getAccountSessions();
      setSessions(data || mockSessionsFallback);
    } catch (error: any) {
      console.error('Error fetching sessions:', error);
      setError(error?.message || t('common.failedToLoadSessions'));
      setSessions(mockSessionsFallback);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    if (!tenantId) return;

    try {
      const data = await usersService.getSessionHistory();
      setHistory(data || mockHistoryFallback);
    } catch (error: any) {
      console.error('Error fetching session history:', error);
      setHistory(mockHistoryFallback);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    if (!tenantId) return;
    if (!confirm(t('tenant.sessions.confirmRevoke', 'Are you sure you want to revoke this session? The user will be logged out immediately.'))) return;

    setError('');
    setSuccess('');

    try {
      await usersService.revokeSession(sessionId);
      setSuccess(t('tenant.sessions.revokeSuccess', 'Session revoked successfully. User has been logged out.'));
      fetchSessions();
    } catch (error: any) {
      setError(error?.message || t('common.failedToRevokeSession'));
      console.error('Error revoking session:', error);
    }
  };

  const handleRevokeAllUserSessions = async (userId: string) => {
    if (!confirm(t('tenant.sessions.confirmRevokeAll', 'Are you sure you want to revoke ALL sessions for this user?'))) return;

    setError('');
    setSuccess('');

    try {
      await usersService.revokeAllUserSessions(userId);
      setSuccess(t('tenant.sessions.revokeAllSuccess', 'All user sessions revoked successfully'));
      fetchSessions();
    } catch (error: any) {
      setError(error?.message || t('common.failedToRevokeSessions'));
    }
  };

  const handleRevokeSuspiciousSessions = async () => {
    if (!confirm(t('tenant.sessions.confirmRevokeSuspicious', 'Are you sure you want to revoke all suspicious sessions?'))) return;

    setError('');
    setSuccess('');

    try {
      await usersService.revokeSuspiciousSessions();
      setSuccess(t('tenant.sessions.revokeSuspiciousSuccess', 'All suspicious sessions revoked successfully'));
      fetchSessions();
    } catch (error: any) {
      setError(error?.message || t('common.failedToRevokeSuspiciousSessions'));
    }
  };

  const openDetailsModal = (session: UserSession) => {
    setSelectedSession(session);
    setShowDetailsModal(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString(locale === 'fa' ? 'fa-IR' : 'en-US');
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      completed: 'bg-green-100 text-green-800 border-green-200',
      forced_logout: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      expired: 'bg-gray-100 text-gray-800 border-gray-200',
      revoked: 'bg-red-100 text-red-800 border-red-200',
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType.toLowerCase()) {
      case 'mobile':
        return <Smartphone className="w-4 h-4" />;
      case 'tablet':
        return <Tablet className="w-4 h-4" />;
      default:
        return <Monitor className="w-4 h-4" />;
    }
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
    return (
      <div dir={locale === 'fa' ? 'rtl' : 'ltr'} className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-3 text-gray-600"
        >
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span>{t('common.loading', 'Loading...')}</span>
        </motion.div>
      </div>
    );
  }

  return (
    <div dir={locale === 'fa' ? 'rtl' : 'ltr'} className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8">
      <Helmet>
        <title>{t('tenant.sessions.title', 'Sessions Management')} | OneSign</title>
      </Helmet>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            {t('tenant.sessions.title', 'Active Sessions Management')}
          </h1>
          <p className="text-gray-600 mt-1">
            {t('tenant.sessions.subtitle', 'Monitor and manage active user sessions')}
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowHistoryModal(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl hover:shadow-lg transition-all duration-300"
        >
          <History className="w-5 h-5" />
          {t('tenant.sessions.viewHistory', 'View History')}
        </motion.button>
      </motion.div>

      {/* Alerts */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2"
          >
            <AlertTriangle className="w-5 h-5" />
            {error}
            <button onClick={() => setError('')} className="ms-auto">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-center gap-2"
          >
            <Shield className="w-5 h-5" />
            {success}
            <button onClick={() => setSuccess('')} className="ms-auto">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title={t('tenant.sessions.activeSessions', 'Active Sessions')}
          value={activeSessionsCount}
          icon={<Activity className="w-6 h-6 text-blue-600" />}
          color="bg-blue-100"
          delay={0}
        />
        <StatCard
          title={t('tenant.sessions.uniqueUsers', 'Unique Users')}
          value={uniqueUsersCount}
          icon={<Users className="w-6 h-6 text-green-600" />}
          color="bg-green-100"
          delay={1}
        />
        <StatCard
          title={t('tenant.sessions.suspiciousSessions', 'Suspicious Sessions')}
          value={suspiciousSessionsCount}
          icon={<AlertTriangle className="w-6 h-6 text-red-600" />}
          color="bg-red-100"
          delay={2}
          action={
            suspiciousSessionsCount > 0 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRevokeSuspiciousSessions}
                className="text-sm bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 transition-colors"
              >
                {t('tenant.sessions.revokeAll', 'Revoke All')}
              </motion.button>
            )
          }
        />
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-4 mb-6"
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={t('tenant.sessions.searchPlaceholder', 'Search by user name, email, or IP address...')}
              className="w-full ps-10 pe-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <label className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
            <input
              type="checkbox"
              checked={filterSuspicious}
              onChange={(e) => setFilterSuspicious(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">{t('tenant.sessions.showSuspicious', 'Show only suspicious')}</span>
          </label>
        </div>
      </motion.div>

      {/* Sessions Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-6 py-4 text-start text-xs font-semibold text-gray-600 uppercase tracking-wider">{t('tenant.sessions.user', 'User')}</th>
                <th className="px-6 py-4 text-start text-xs font-semibold text-gray-600 uppercase tracking-wider">{t('tenant.sessions.device', 'Device')}</th>
                <th className="px-6 py-4 text-start text-xs font-semibold text-gray-600 uppercase tracking-wider">{t('tenant.sessions.location', 'Location')}</th>
                <th className="px-6 py-4 text-start text-xs font-semibold text-gray-600 uppercase tracking-wider">{t('tenant.sessions.ipAddress', 'IP Address')}</th>
                <th className="px-6 py-4 text-start text-xs font-semibold text-gray-600 uppercase tracking-wider">{t('tenant.sessions.loginTime', 'Login Time')}</th>
                <th className="px-6 py-4 text-start text-xs font-semibold text-gray-600 uppercase tracking-wider">{t('tenant.sessions.duration', 'Duration')}</th>
                <th className="px-6 py-4 text-start text-xs font-semibold text-gray-600 uppercase tracking-wider">{t('tenant.sessions.status', 'Status')}</th>
                <th className="px-6 py-4 text-start text-xs font-semibold text-gray-600 uppercase tracking-wider">{t('common.actions', 'Actions')}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              <AnimatePresence>
                {filteredSessions.map((session, index) => (
                  <motion.tr
                    key={session.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    className={`hover:bg-gray-50 transition-colors ${session.isSuspicious ? 'bg-red-50/50' : ''}`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {session.userName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{session.userName}</p>
                          <p className="text-sm text-gray-500">{session.userEmail}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-gray-100 rounded-lg">
                          {getDeviceIcon(session.deviceType)}
                        </div>
                        <div>
                          <p className="text-sm text-gray-900">{session.deviceName}</p>
                          <p className="text-xs text-gray-500">{session.browser}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        {session.location}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-gray-400" />
                        <span className="font-mono text-sm text-gray-600">{session.ipAddress}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        {formatDate(session.loginAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{session.duration}</td>
                    <td className="px-6 py-4">
                      {session.isSuspicious ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium border border-red-200">
                          <AlertTriangle className="w-3 h-3" />
                          {t('tenant.sessions.suspicious', 'Suspicious')}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium border border-green-200">
                          <Shield className="w-3 h-3" />
                          {t('tenant.sessions.normal', 'Normal')}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => openDetailsModal(session)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title={t('common.details', 'Details')}
                        >
                          <Eye className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleRevokeSession(session.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title={t('tenant.sessions.revoke', 'Revoke')}
                        >
                          <Power className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {filteredSessions.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Monitor className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">{t('tenant.sessions.noSessions', 'No active sessions found.')}</p>
          </motion.div>
        )}
      </motion.div>

      {/* Details Modal */}
      <AnimatePresence>
        {showDetailsModal && selectedSession && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowDetailsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-xl">
                      <Eye className="w-6 h-6" />
                    </div>
                    <h2 className="text-xl font-bold">{t('tenant.sessions.sessionDetails', 'Session Details')}</h2>
                  </div>
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                {selectedSession.isSuspicious && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4"
                  >
                    <div className="flex items-center gap-2 text-red-800 font-semibold mb-2">
                      <AlertTriangle className="w-5 h-5" />
                      {t('tenant.sessions.suspiciousDetected', 'Suspicious Activity Detected')}
                    </div>
                    <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                      {selectedSession.suspiciousReasons?.map((reason, index) => (
                        <li key={index}>{reason}</li>
                      ))}
                    </ul>
                  </motion.div>
                )}

                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h3 className="text-sm font-semibold text-gray-500 mb-2">{t('tenant.sessions.user', 'User')}</h3>
                      <p className="font-medium text-gray-900">{selectedSession.userName}</p>
                      <p className="text-sm text-gray-500">{selectedSession.userEmail}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h3 className="text-sm font-semibold text-gray-500 mb-2">{t('tenant.sessions.userId', 'User ID')}</h3>
                      <p className="font-mono text-sm text-gray-900 break-all">{selectedSession.userId}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h3 className="text-sm font-semibold text-gray-500 mb-2">{t('tenant.sessions.deviceType', 'Device Type')}</h3>
                      <div className="flex items-center gap-2">
                        {getDeviceIcon(selectedSession.deviceType)}
                        <span className="text-gray-900">{selectedSession.deviceType}</span>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h3 className="text-sm font-semibold text-gray-500 mb-2">{t('tenant.sessions.deviceName', 'Device Name')}</h3>
                      <p className="text-gray-900">{selectedSession.deviceName}</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="text-sm font-semibold text-gray-500 mb-2">{t('tenant.sessions.browser', 'Browser')}</h3>
                    <p className="text-gray-900">{selectedSession.browser}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h3 className="text-sm font-semibold text-gray-500 mb-2">{t('tenant.sessions.ipAddress', 'IP Address')}</h3>
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-gray-400" />
                        <span className="font-mono text-gray-900">{selectedSession.ipAddress}</span>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h3 className="text-sm font-semibold text-gray-500 mb-2">{t('tenant.sessions.location', 'Location')}</h3>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-900">{selectedSession.location}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h3 className="text-sm font-semibold text-gray-500 mb-2">{t('tenant.sessions.loginTime', 'Login Time')}</h3>
                      <p className="text-gray-900">{formatDate(selectedSession.loginAt)}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h3 className="text-sm font-semibold text-gray-500 mb-2">{t('tenant.sessions.lastActivity', 'Last Activity')}</h3>
                      <p className="text-gray-900">{formatDate(selectedSession.lastActivityAt)}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h3 className="text-sm font-semibold text-gray-500 mb-2">{t('tenant.sessions.duration', 'Session Duration')}</h3>
                      <p className="text-gray-900">{selectedSession.duration}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h3 className="text-sm font-semibold text-gray-500 mb-2">{t('tenant.sessions.expiresAt', 'Expires At')}</h3>
                      <p className="text-gray-900">{formatDate(selectedSession.expiresAt)}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 mt-8 pt-6 border-t border-gray-200">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      handleRevokeSession(selectedSession.id);
                      setShowDetailsModal(false);
                    }}
                    className="flex items-center gap-2 bg-red-600 text-white px-4 py-2.5 rounded-xl hover:bg-red-700 transition-colors"
                  >
                    <Power className="w-4 h-4" />
                    {t('tenant.sessions.revokeSession', 'Revoke Session')}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      handleRevokeAllUserSessions(selectedSession.userId);
                      setShowDetailsModal(false);
                    }}
                    className="flex items-center gap-2 bg-yellow-600 text-white px-4 py-2.5 rounded-xl hover:bg-yellow-700 transition-colors"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    {t('tenant.sessions.revokeAllUserSessions', 'Revoke All User Sessions')}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowDetailsModal(false)}
                    className="flex items-center gap-2 bg-gray-200 text-gray-700 px-4 py-2.5 rounded-xl hover:bg-gray-300 transition-colors"
                  >
                    {t('common.close', 'Close')}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* History Modal */}
      <AnimatePresence>
        {showHistoryModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowHistoryModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
            >
              <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-xl">
                      <History className="w-6 h-6" />
                    </div>
                    <h2 className="text-xl font-bold">{t('tenant.sessions.sessionHistory', 'Session History')}</h2>
                  </div>
                  <button
                    onClick={() => setShowHistoryModal(false)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto max-h-[calc(90vh-100px)]">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-6 py-4 text-start text-xs font-semibold text-gray-600 uppercase tracking-wider">{t('tenant.sessions.user', 'User')}</th>
                      <th className="px-6 py-4 text-start text-xs font-semibold text-gray-600 uppercase tracking-wider">{t('tenant.sessions.device', 'Device')}</th>
                      <th className="px-6 py-4 text-start text-xs font-semibold text-gray-600 uppercase tracking-wider">{t('tenant.sessions.location', 'Location')}</th>
                      <th className="px-6 py-4 text-start text-xs font-semibold text-gray-600 uppercase tracking-wider">{t('tenant.sessions.login', 'Login')}</th>
                      <th className="px-6 py-4 text-start text-xs font-semibold text-gray-600 uppercase tracking-wider">{t('tenant.sessions.logout', 'Logout')}</th>
                      <th className="px-6 py-4 text-start text-xs font-semibold text-gray-600 uppercase tracking-wider">{t('tenant.sessions.duration', 'Duration')}</th>
                      <th className="px-6 py-4 text-start text-xs font-semibold text-gray-600 uppercase tracking-wider">{t('tenant.sessions.status', 'Status')}</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {history.map((session, index) => (
                      <motion.tr
                        key={session.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                              {session.userName.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-medium text-gray-900">{session.userName}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{session.device}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            {session.location}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                          {formatDate(session.loginAt)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                          {formatDate(session.logoutAt)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{session.duration}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusBadge(session.status)}`}>
                            {session.status.replace('_', ' ')}
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowHistoryModal(false)}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-xl hover:bg-gray-300 transition-colors"
                >
                  {t('common.close', 'Close')}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
