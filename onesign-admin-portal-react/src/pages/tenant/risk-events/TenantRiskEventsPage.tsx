import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocale } from '@/hooks/useLocale';
import { getTenantId } from '@/lib/tenant-context';
import { securityService } from '@/lib/api/services';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  Shield,
  ShieldAlert,
  ShieldCheck,
  X,
  Filter,
  Plus,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Globe,
  Monitor,
  User,
  Calendar,
  FileText,
  Activity,
  Zap,
  Lock,
  Laptop,
  AlertCircle,
} from 'lucide-react';

interface RiskEvent {
  id: string;
  userId: string;
  userName?: string;
  eventType: number;
  riskLevel: number;
  ipAddress: string | null;
  userAgent: string | null;
  location: string | null;
  details: string | null;
  occurredAt: string;
}

// Mock data for demonstration
const mockRiskEvents: RiskEvent[] = [
  {
    id: '1',
    userId: 'user-001',
    userName: 'John Doe',
    eventType: 1,
    riskLevel: 1,
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
    location: 'New York, US',
    details: 'New device detected: Windows Desktop',
    occurredAt: '2024-02-15T10:30:00Z',
  },
  {
    id: '2',
    userId: 'user-002',
    userName: 'Jane Smith',
    eventType: 2,
    riskLevel: 2,
    ipAddress: '10.0.0.50',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15',
    location: 'London, UK',
    details: 'Login from unusual location - 5000km from last login',
    occurredAt: '2024-02-15T09:15:00Z',
  },
  {
    id: '3',
    userId: 'user-003',
    userName: 'Bob Wilson',
    eventType: 3,
    riskLevel: 2,
    ipAddress: '172.16.0.25',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X)',
    location: 'Los Angeles, US',
    details: '5 failed login attempts in 10 minutes',
    occurredAt: '2024-02-15T08:45:00Z',
  },
  {
    id: '4',
    userId: 'user-001',
    userName: 'John Doe',
    eventType: 4,
    riskLevel: 1,
    ipAddress: '192.168.1.105',
    userAgent: 'Mozilla/5.0 (Linux; Android 14)',
    location: 'San Francisco, US',
    details: 'Unusual data access pattern detected',
    occurredAt: '2024-02-14T16:20:00Z',
  },
  {
    id: '5',
    userId: 'user-004',
    userName: 'Alice Brown',
    eventType: 5,
    riskLevel: 2,
    ipAddress: '203.0.113.50',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Edge/120.0.0.0',
    location: 'Tokyo, JP',
    details: 'Account locked after 10 failed attempts',
    occurredAt: '2024-02-14T03:10:00Z',
  },
];

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ElementType;
  color: string;
  delay: number;
}

const StatCard = ({ title, value, icon: Icon, color, delay }: StatCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: delay * 0.1 }}
    className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300"
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
      </div>
      <div className={`p-4 rounded-xl bg-gradient-to-br ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  </motion.div>
);

export default function TenantRiskEventsPage() {
  const { t } = useTranslation();
  const locale = useLocale();
  const [events, setEvents] = useState<RiskEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<RiskEvent | null>(null);

  // Filters
  const [eventTypeFilter, setEventTypeFilter] = useState<number | ''>('');
  const [riskLevelFilter, setRiskLevelFilter] = useState<number | ''>('');
  const [pageNumber, setPageNumber] = useState(1);
  const pageSize = 10;

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
      // Use mock data for demonstration
      setTimeout(() => {
        let filteredEvents = [...mockRiskEvents];

        if (eventTypeFilter !== '') {
          filteredEvents = filteredEvents.filter(e => e.eventType === eventTypeFilter);
        }
        if (riskLevelFilter !== '') {
          filteredEvents = filteredEvents.filter(e => e.riskLevel === riskLevelFilter);
        }

        setEvents(filteredEvents);
        setLoading(false);
      }, 500);
    } catch (err) {
      setError(t('common.error', 'An error occurred'));
      setLoading(false);
    }
  };

  const getEventTypeConfig = (type: number) => {
    const configs: Record<number, { name: string; icon: React.ElementType; color: string; bgColor: string }> = {
      1: { name: t('riskEvents.newDeviceLogin', 'New Device Login'), icon: Laptop, color: 'text-blue-800', bgColor: 'bg-blue-100' },
      2: { name: t('riskEvents.geoAnomaly', 'Geo Anomaly'), icon: Globe, color: 'text-purple-800', bgColor: 'bg-purple-100' },
      3: { name: t('riskEvents.multipleFailedLogins', 'Multiple Failed Logins'), icon: AlertCircle, color: 'text-orange-800', bgColor: 'bg-orange-100' },
      4: { name: t('riskEvents.suspiciousActivity', 'Suspicious Activity'), icon: AlertTriangle, color: 'text-yellow-800', bgColor: 'bg-yellow-100' },
      5: { name: t('riskEvents.accountLockout', 'Account Lockout'), icon: Lock, color: 'text-red-800', bgColor: 'bg-red-100' },
    };
    return configs[type] || { name: t('riskEvents.unknown', 'Unknown'), icon: Shield, color: 'text-gray-800', bgColor: 'bg-gray-100' };
  };

  const getRiskLevelConfig = (level: number) => {
    const configs: Record<number, { text: string; color: string; bgColor: string; icon: React.ElementType }> = {
      0: { text: t('riskEvents.low', 'Low'), color: 'text-green-800', bgColor: 'bg-green-100', icon: ShieldCheck },
      1: { text: t('riskEvents.medium', 'Medium'), color: 'text-yellow-800', bgColor: 'bg-yellow-100', icon: Shield },
      2: { text: t('riskEvents.high', 'High'), color: 'text-red-800', bgColor: 'bg-red-100', icon: ShieldAlert },
    };
    return configs[level] || configs[0];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString(locale);
  };

  const handleCreateRiskEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      // TODO: Implement when API is available
      setSuccess(t('riskEvents.eventCreated', 'Risk event created successfully'));
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
      setError(t('common.error', 'An error occurred'));
    }
  };

  const viewEventDetails = (event: RiskEvent) => {
    setSelectedEvent(event);
    setShowDetailsModal(true);
  };

  // Stats calculations
  const totalEvents = events.length;
  const highRiskEvents = events.filter(e => e.riskLevel === 2).length;
  const mediumRiskEvents = events.filter(e => e.riskLevel === 1).length;
  const lowRiskEvents = events.filter(e => e.riskLevel === 0).length;

  // Pagination
  const totalPages = Math.ceil(events.length / pageSize);
  const paginatedEvents = events.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);

  if (loading && !events.length) {
    return (
      <div
        dir={locale === 'fa' ? 'rtl' : 'ltr'}
        className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8 flex items-center justify-center"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-gray-600 font-medium">{t('common.loading', 'Loading...')}</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      dir={locale === 'fa' ? 'rtl' : 'ltr'}
      className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4"
      >
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            {t('riskEvents.title', 'Risk Events')}
          </h1>
          <p className="text-gray-600 mt-2">
            {t('riskEvents.subtitle', 'Monitor and manage security risk events')}
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
        >
          <Plus className="w-5 h-5" />
          {t('common.createRiskEvent', 'Create Risk Event')}
        </motion.button>
      </motion.div>

      {/* Success/Error Messages */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-center gap-2"
          >
            <CheckCircle className="w-5 h-5" />
            {success}
            <button onClick={() => setSuccess('')} className="ml-auto">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2"
          >
            <AlertTriangle className="w-5 h-5" />
            {error}
            <button onClick={() => setError('')} className="ml-auto">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title={t('riskEvents.totalEvents', 'Total Events')}
          value={totalEvents}
          icon={Activity}
          color="from-blue-500 to-blue-600"
          delay={0}
        />
        <StatCard
          title={t('riskEvents.highRisk', 'High Risk')}
          value={highRiskEvents}
          icon={ShieldAlert}
          color="from-red-500 to-red-600"
          delay={1}
        />
        <StatCard
          title={t('riskEvents.mediumRisk', 'Medium Risk')}
          value={mediumRiskEvents}
          icon={Shield}
          color="from-yellow-500 to-yellow-600"
          delay={2}
        />
        <StatCard
          title={t('riskEvents.lowRisk', 'Low Risk')}
          value={lowRiskEvents}
          icon={ShieldCheck}
          color="from-green-500 to-green-600"
          delay={3}
        />
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-6 mb-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-indigo-600" />
          <h3 className="font-semibold text-gray-800">{t('common.filters', 'Filters')}</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('riskEvents.eventType', 'Event Type')}
            </label>
            <select
              value={eventTypeFilter}
              onChange={(e) => {
                setEventTypeFilter(e.target.value === '' ? '' : Number(e.target.value));
                setPageNumber(1);
              }}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">{t('riskEvents.allTypes', 'All Types')}</option>
              <option value={1}>{t('riskEvents.newDeviceLogin', 'New Device Login')}</option>
              <option value={2}>{t('riskEvents.geoAnomaly', 'Geo Anomaly')}</option>
              <option value={3}>{t('riskEvents.multipleFailedLogins', 'Multiple Failed Logins')}</option>
              <option value={4}>{t('riskEvents.suspiciousActivity', 'Suspicious Activity')}</option>
              <option value={5}>{t('riskEvents.accountLockout', 'Account Lockout')}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('riskEvents.riskLevel', 'Risk Level')}
            </label>
            <select
              value={riskLevelFilter}
              onChange={(e) => {
                setRiskLevelFilter(e.target.value === '' ? '' : Number(e.target.value));
                setPageNumber(1);
              }}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">{t('riskEvents.allLevels', 'All Levels')}</option>
              <option value={0}>{t('riskEvents.low', 'Low')}</option>
              <option value={1}>{t('riskEvents.medium', 'Medium')}</option>
              <option value={2}>{t('riskEvents.high', 'High')}</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Events Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 overflow-hidden"
      >
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500">{t('common.loading', 'Loading...')}</p>
          </div>
        ) : paginatedEvents.length === 0 ? (
          <div className="p-12 text-center">
            <ShieldCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">{t('riskEvents.noEvents', 'No risk events found')}</p>
            <p className="text-gray-400 mt-2">{t('riskEvents.noEventsDesc', 'Great news! No security risk events detected.')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className={`px-6 py-4 ${locale === 'fa' ? 'text-right' : 'text-left'} text-xs font-semibold text-gray-600 uppercase tracking-wider`}>
                    {t('riskEvents.date', 'Date')}
                  </th>
                  <th className={`px-6 py-4 ${locale === 'fa' ? 'text-right' : 'text-left'} text-xs font-semibold text-gray-600 uppercase tracking-wider`}>
                    {t('common.user', 'User')}
                  </th>
                  <th className={`px-6 py-4 ${locale === 'fa' ? 'text-right' : 'text-left'} text-xs font-semibold text-gray-600 uppercase tracking-wider`}>
                    {t('riskEvents.eventType', 'Event Type')}
                  </th>
                  <th className={`px-6 py-4 ${locale === 'fa' ? 'text-right' : 'text-left'} text-xs font-semibold text-gray-600 uppercase tracking-wider`}>
                    {t('riskEvents.riskLevel', 'Risk Level')}
                  </th>
                  <th className={`px-6 py-4 ${locale === 'fa' ? 'text-right' : 'text-left'} text-xs font-semibold text-gray-600 uppercase tracking-wider`}>
                    {t('riskEvents.location', 'Location')}
                  </th>
                  <th className={`px-6 py-4 ${locale === 'fa' ? 'text-right' : 'text-left'} text-xs font-semibold text-gray-600 uppercase tracking-wider`}>
                    {t('common.actions', 'Actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <AnimatePresence>
                  {paginatedEvents.map((event, index) => {
                    const eventTypeConfig = getEventTypeConfig(event.eventType);
                    const riskLevelConfig = getRiskLevelConfig(event.riskLevel);
                    const EventIcon = eventTypeConfig.icon;
                    const RiskIcon = riskLevelConfig.icon;

                    return (
                      <motion.tr
                        key={event.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-blue-50/50 transition-colors cursor-pointer"
                        onClick={() => viewEventDetails(event)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            {formatDate(event.occurredAt)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                              {event.userName?.charAt(0) || 'U'}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{event.userName || event.userId}</p>
                              <p className="text-xs text-gray-500">{event.userId}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium ${eventTypeConfig.bgColor} ${eventTypeConfig.color}`}>
                            <EventIcon className="w-4 h-4" />
                            {eventTypeConfig.name}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${riskLevelConfig.bgColor} ${riskLevelConfig.color}`}>
                            <RiskIcon className="w-4 h-4" />
                            {riskLevelConfig.text}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            {event.location || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              viewEventDetails(event);
                            }}
                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title={t('common.viewDetails', 'View Details')}
                          >
                            <FileText className="w-5 h-5" />
                          </motion.button>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {paginatedEvents.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {t('common.showing', 'Showing')} {(pageNumber - 1) * pageSize + 1} -{' '}
              {Math.min(pageNumber * pageSize, events.length)} {t('common.of', 'of')} {events.length}
            </p>
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setPageNumber(pageNumber - 1)}
                disabled={pageNumber === 1}
                className="p-2 border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                {locale === 'fa' ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
              </motion.button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, 5).map((page) => (
                <motion.button
                  key={page}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setPageNumber(page)}
                  className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                    pageNumber === page
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                      : 'border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </motion.button>
              ))}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setPageNumber(pageNumber + 1)}
                disabled={pageNumber === totalPages || events.length < pageSize}
                className="p-2 border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                {locale === 'fa' ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
              </motion.button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Create Risk Event Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <Plus className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-white">
                      {t('common.createRiskEvent', 'Create Risk Event')}
                    </h2>
                  </div>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleCreateRiskEvent} className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('riskEvents.userId', 'User ID')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={newEventUserId}
                    onChange={(e) => setNewEventUserId(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={t('riskEvents.enterUserId', 'Enter user ID')}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('riskEvents.eventType', 'Event Type')}
                    </label>
                    <select
                      value={newEventType}
                      onChange={(e) => setNewEventType(Number(e.target.value))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value={1}>{t('riskEvents.newDeviceLogin', 'New Device Login')}</option>
                      <option value={2}>{t('riskEvents.geoAnomaly', 'Geo Anomaly')}</option>
                      <option value={3}>{t('riskEvents.multipleFailedLogins', 'Multiple Failed Logins')}</option>
                      <option value={4}>{t('riskEvents.suspiciousActivity', 'Suspicious Activity')}</option>
                      <option value={5}>{t('riskEvents.accountLockout', 'Account Lockout')}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('riskEvents.riskLevel', 'Risk Level')}
                    </label>
                    <select
                      value={newRiskLevel}
                      onChange={(e) => setNewRiskLevel(Number(e.target.value))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value={0}>{t('riskEvents.low', 'Low')}</option>
                      <option value={1}>{t('riskEvents.medium', 'Medium')}</option>
                      <option value={2}>{t('riskEvents.high', 'High')}</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('riskEvents.ipAddress', 'IP Address')} ({t('common.optional', 'Optional')})
                    </label>
                    <input
                      type="text"
                      value={newIpAddress}
                      onChange={(e) => setNewIpAddress(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="192.168.1.1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('riskEvents.location', 'Location')} ({t('common.optional', 'Optional')})
                    </label>
                    <input
                      type="text"
                      value={newLocation}
                      onChange={(e) => setNewLocation(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="City, Country"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('riskEvents.userAgent', 'User Agent')} ({t('common.optional', 'Optional')})
                  </label>
                  <input
                    type="text"
                    value={newUserAgent}
                    onChange={(e) => setNewUserAgent(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Browser/Device information"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('riskEvents.details', 'Details')} ({t('common.optional', 'Optional')})
                  </label>
                  <textarea
                    value={newDetails}
                    onChange={(e) => setNewDetails(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder={t('riskEvents.enterDetails', 'Enter event details...')}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all font-medium"
                  >
                    {t('common.create', 'Create')}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-6 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                  >
                    {t('common.cancel', 'Cancel')}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Event Details Modal */}
      <AnimatePresence>
        {showDetailsModal && selectedEvent && (
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
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {(() => {
                const eventTypeConfig = getEventTypeConfig(selectedEvent.eventType);
                const riskLevelConfig = getRiskLevelConfig(selectedEvent.riskLevel);
                const EventIcon = eventTypeConfig.icon;
                const RiskIcon = riskLevelConfig.icon;

                return (
                  <>
                    <div className={`p-6 border-b border-gray-200 bg-gradient-to-r ${
                      selectedEvent.riskLevel === 2 ? 'from-red-500 to-red-600' :
                      selectedEvent.riskLevel === 1 ? 'from-yellow-500 to-orange-500' :
                      'from-green-500 to-emerald-600'
                    } rounded-t-2xl`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-white/20 rounded-lg">
                            <EventIcon className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h2 className="text-xl font-bold text-white">
                              {eventTypeConfig.name}
                            </h2>
                            <p className="text-white/80 text-sm">{formatDate(selectedEvent.occurredAt)}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setShowDetailsModal(false)}
                          className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                        >
                          <X className="w-5 h-5 text-white" />
                        </button>
                      </div>
                    </div>

                    <div className="p-6 space-y-6">
                      <div className="flex items-center gap-3">
                        <span className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium ${riskLevelConfig.bgColor} ${riskLevelConfig.color}`}>
                          <RiskIcon className="w-5 h-5" />
                          {riskLevelConfig.text} {t('riskEvents.risk', 'Risk')}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm text-gray-500 mb-1">{t('common.user', 'User')}</p>
                            <div className="flex items-center gap-2">
                              <User className="w-5 h-5 text-gray-400" />
                              <span className="font-medium text-gray-900">{selectedEvent.userName || selectedEvent.userId}</span>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 mb-1">{t('riskEvents.ipAddress', 'IP Address')}</p>
                            <div className="flex items-center gap-2">
                              <Globe className="w-5 h-5 text-gray-400" />
                              <span className="font-medium text-gray-900">{selectedEvent.ipAddress || '-'}</span>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm text-gray-500 mb-1">{t('riskEvents.location', 'Location')}</p>
                            <div className="flex items-center gap-2">
                              <MapPin className="w-5 h-5 text-gray-400" />
                              <span className="font-medium text-gray-900">{selectedEvent.location || '-'}</span>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 mb-1">{t('riskEvents.device', 'Device')}</p>
                            <div className="flex items-center gap-2">
                              <Monitor className="w-5 h-5 text-gray-400" />
                              <span className="font-medium text-gray-900 text-sm truncate">{selectedEvent.userAgent || '-'}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {selectedEvent.details && (
                        <div>
                          <p className="text-sm text-gray-500 mb-2">{t('riskEvents.details', 'Details')}</p>
                          <div className="p-4 bg-gray-50 rounded-xl">
                            <p className="text-gray-700">{selectedEvent.details}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="px-6 pb-6">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowDetailsModal(false)}
                        className="w-full px-6 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                      >
                        {t('common.close', 'Close')}
                      </motion.button>
                    </div>
                  </>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
