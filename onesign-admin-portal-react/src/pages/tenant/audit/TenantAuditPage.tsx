import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocale } from '@/hooks/useLocale';
import { getTenantId } from '@/lib/tenant-context';
import { securityService } from '@/lib/api/services';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClipboardList,
  Search,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  User,
  Shield,
  AlertTriangle,
  Info,
  CheckCircle2,
  XCircle,
  Clock,
  Activity,
  FileText,
  Eye,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface AuditEvent {
  id: string;
  eventType: string;
  description: string;
  actorId?: string;
  actorName?: string;
  ipAddress?: string;
  userAgent?: string;
  resourceType?: string;
  resourceId?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  status?: 'success' | 'failure' | 'warning';
  createdAt: string;
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  delay: number;
}

const StatCard = ({ title, value, icon, color, delay }: StatCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: delay * 0.1 }}
    className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300"
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className={`text-3xl font-bold mt-2 ${color}`}>{value}</p>
      </div>
      <div className={`p-4 rounded-xl ${color.replace('text-', 'bg-').replace('600', '100')}`}>
        {icon}
      </div>
    </div>
  </motion.div>
);

export default function TenantAuditPage() {
  const { t } = useTranslation();
  const locale = useLocale();
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [eventTypeFilter, setEventTypeFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [tenantId, setTenantIdState] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedEvent, setSelectedEvent] = useState<AuditEvent | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const pageSize = 20;

  // Mock event types for demo
  const eventTypes = [
    'user.login',
    'user.logout',
    'user.created',
    'user.updated',
    'user.deleted',
    'role.assigned',
    'role.revoked',
    'app.created',
    'app.updated',
    'settings.changed',
    'mfa.enabled',
    'mfa.disabled',
    'password.changed',
    'password.reset'
  ];

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
      fetchAuditEvents();
    }
  }, [tenantId, currentPage]);

  const fetchAuditEvents = async () => {
    if (!tenantId) return;

    try {
      setLoading(true);
      const params: any = { pageNumber: currentPage, pageSize };
      if (fromDate) params.fromDate = fromDate;
      if (toDate) params.toDate = toDate;
      if (eventTypeFilter) params.eventType = eventTypeFilter;

      // Mock data for demonstration
      const mockEvents: AuditEvent[] = Array.from({ length: 15 }, (_, i) => ({
        id: `event-${i + 1}`,
        eventType: eventTypes[Math.floor(Math.random() * eventTypes.length)],
        description: `Sample audit event description ${i + 1}`,
        actorId: `user-${Math.floor(Math.random() * 100)}`,
        actorName: `User ${Math.floor(Math.random() * 100)}`,
        ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        resourceType: ['User', 'Role', 'Application', 'Settings'][Math.floor(Math.random() * 4)],
        resourceId: `resource-${Math.floor(Math.random() * 1000)}`,
        severity: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)] as any,
        status: ['success', 'failure', 'warning'][Math.floor(Math.random() * 3)] as any,
        createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
      }));

      setEvents(mockEvents);
      setTotalPages(5);

      // Uncomment when API is ready:
      // const data = await securityService.getAuditLogs(params);
      // setEvents(data.items || []);
      // setTotalPages(Math.ceil(data.totalCount / pageSize));
    } catch (error) {
      console.error('Error fetching audit events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => {
    setCurrentPage(1);
    fetchAuditEvents();
  };

  const handleExport = () => {
    // Export functionality
    const csvContent = events.map(e =>
      `${e.createdAt},${e.eventType},${e.actorName || e.actorId},${e.description},${e.ipAddress}`
    ).join('\n');
    const blob = new Blob([`Date,Event Type,Actor,Description,IP Address\n${csvContent}`], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const getSeverityBadge = (severity?: string) => {
    const severityMap: Record<string, { color: string; icon: React.ReactNode }> = {
      low: { color: 'bg-blue-100 text-blue-700', icon: <Info className="w-3 h-3" /> },
      medium: { color: 'bg-yellow-100 text-yellow-700', icon: <AlertTriangle className="w-3 h-3" /> },
      high: { color: 'bg-orange-100 text-orange-700', icon: <AlertTriangle className="w-3 h-3" /> },
      critical: { color: 'bg-red-100 text-red-700', icon: <XCircle className="w-3 h-3" /> }
    };
    const { color, icon } = severityMap[severity || 'low'] || severityMap.low;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${color}`}>
        {icon}
        {severity || 'low'}
      </span>
    );
  };

  const getStatusBadge = (status?: string) => {
    const statusMap: Record<string, { color: string; icon: React.ReactNode }> = {
      success: { color: 'bg-green-100 text-green-700', icon: <CheckCircle2 className="w-3 h-3" /> },
      failure: { color: 'bg-red-100 text-red-700', icon: <XCircle className="w-3 h-3" /> },
      warning: { color: 'bg-yellow-100 text-yellow-700', icon: <AlertTriangle className="w-3 h-3" /> }
    };
    const { color, icon } = statusMap[status || 'success'] || statusMap.success;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${color}`}>
        {icon}
        {status || 'success'}
      </span>
    );
  };

  const getEventTypeIcon = (eventType: string) => {
    if (eventType.includes('user')) return <User className="w-4 h-4" />;
    if (eventType.includes('role')) return <Shield className="w-4 h-4" />;
    if (eventType.includes('app')) return <Activity className="w-4 h-4" />;
    if (eventType.includes('password') || eventType.includes('mfa')) return <Shield className="w-4 h-4" />;
    return <FileText className="w-4 h-4" />;
  };

  // Filter events by search
  const filteredEvents = events.filter(event =>
    event.eventType.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (event.actorName || '').toLowerCase().includes(searchQuery.toLowerCase())
  ).filter(event =>
    !severityFilter || event.severity === severityFilter
  );

  // Calculate stats
  const totalEvents = events.length;
  const successEvents = events.filter(e => e.status === 'success').length;
  const failureEvents = events.filter(e => e.status === 'failure').length;
  const criticalEvents = events.filter(e => e.severity === 'critical' || e.severity === 'high').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-500 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8" dir={locale === 'fa' ? 'rtl' : 'ltr'}>
      <Helmet>
        <title>{t('tenant.audit.title')}</title>
      </Helmet>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8"
      >
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            {t('tenant.audit.title')}
          </h1>
          <p className="text-gray-600 mt-2">{t('tenant.audit.subtitle') || 'Monitor and review all system activities'}</p>
        </div>
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => fetchAuditEvents()}
            className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl font-medium hover:bg-gray-50 transition-all duration-200"
          >
            <RefreshCw className="w-4 h-4" />
            {t('common.refresh') || 'Refresh'}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleExport}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2.5 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Download className="w-4 h-4" />
            {t('tenant.audit.export') || 'Export'}
          </motion.button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard
          title={t('tenant.audit.totalEvents') || 'Total Events'}
          value={totalEvents}
          icon={<ClipboardList className="w-6 h-6 text-indigo-600" />}
          color="text-indigo-600"
          delay={0}
        />
        <StatCard
          title={t('tenant.audit.successEvents') || 'Successful'}
          value={successEvents}
          icon={<CheckCircle2 className="w-6 h-6 text-green-600" />}
          color="text-green-600"
          delay={1}
        />
        <StatCard
          title={t('tenant.audit.failedEvents') || 'Failed'}
          value={failureEvents}
          icon={<XCircle className="w-6 h-6 text-red-600" />}
          color="text-red-600"
          delay={2}
        />
        <StatCard
          title={t('tenant.audit.criticalEvents') || 'Critical'}
          value={criticalEvents}
          icon={<AlertTriangle className="w-6 h-6 text-orange-600" />}
          color="text-orange-600"
          delay={3}
        />
      </div>

      {/* Filters Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-6 mb-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          {/* Search */}
          <div className="lg:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder={t('tenant.audit.searchPlaceholder') || 'Search events...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
            />
          </div>

          {/* From Date */}
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
            />
          </div>

          {/* To Date */}
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
            />
          </div>

          {/* Event Type Filter */}
          <div>
            <select
              value={eventTypeFilter}
              onChange={(e) => setEventTypeFilter(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
            >
              <option value="">{t('tenant.audit.allEventTypes') || 'All Event Types'}</option>
              {eventTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Filter Button */}
          <div>
            <button
              onClick={handleFilter}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Filter className="w-4 h-4" />
              {t('tenant.audit.filter')}
            </button>
          </div>
        </div>

        {/* Secondary Filters */}
        <div className="flex gap-2 mt-4">
          <span className="text-sm text-gray-500 py-1">{t('tenant.audit.severity') || 'Severity'}:</span>
          {['', 'low', 'medium', 'high', 'critical'].map(sev => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                severityFilter === sev
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {sev || t('common.all')}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Audit Events Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-6 py-4 text-start text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  {t('tenant.audit.timestamp')}
                </th>
                <th className="px-6 py-4 text-start text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  {t('tenant.audit.eventType')}
                </th>
                <th className="px-6 py-4 text-start text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  {t('tenant.audit.actor')}
                </th>
                <th className="px-6 py-4 text-start text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  {t('tenant.audit.description')}
                </th>
                <th className="px-6 py-4 text-start text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  {t('tenant.audit.severity') || 'Severity'}
                </th>
                <th className="px-6 py-4 text-start text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  {t('tenant.audit.status') || 'Status'}
                </th>
                <th className="px-6 py-4 text-start text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  {t('common.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filteredEvents.map((event, index) => (
                <motion.tr
                  key={event.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="hover:bg-gray-50/80 transition-colors duration-150"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4 text-gray-400" />
                      {new Date(event.createdAt).toLocaleString(locale === 'fa' ? 'fa-IR' : 'en-US')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-indigo-100 text-indigo-600">
                        {getEventTypeIcon(event.eventType)}
                      </div>
                      <code className="text-sm bg-gray-100 px-2 py-0.5 rounded font-mono text-gray-700">
                        {event.eventType}
                      </code>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white text-xs font-medium">
                        {(event.actorName || event.actorId || 'S')[0].toUpperCase()}
                      </div>
                      <span className="text-sm text-gray-900">{event.actorName || event.actorId || '-'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-600 max-w-xs truncate">{event.description}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getSeverityBadge(event.severity)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(event.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => {
                        setSelectedEvent(event);
                        setShowDetailModal(true);
                      }}
                      className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title={t('common.viewDetails') || 'View Details'}
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </motion.tr>
              ))}
              {filteredEvents.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">{t('tenant.audit.noEvents') || 'No audit events found'}</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50/50">
            <p className="text-sm text-gray-600">
              {t('common.page')} {currentPage} {t('common.of')} {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      currentPage === page
                        ? 'bg-indigo-600 text-white'
                        : 'border border-gray-200 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Event Detail Modal */}
      <AnimatePresence>
        {showDetailModal && selectedEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => { setShowDetailModal(false); setSelectedEvent(null); }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-indigo-100 rounded-xl">
                  <FileText className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{t('tenant.audit.eventDetails') || 'Event Details'}</h2>
                  <p className="text-gray-500">{selectedEvent.eventType}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-500 mb-1">{t('tenant.audit.timestamp')}</p>
                    <p className="font-medium text-gray-900">{new Date(selectedEvent.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-500 mb-1">{t('tenant.audit.actor')}</p>
                    <p className="font-medium text-gray-900">{selectedEvent.actorName || selectedEvent.actorId || '-'}</p>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-500 mb-1">{t('tenant.audit.description')}</p>
                  <p className="font-medium text-gray-900">{selectedEvent.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-500 mb-1">{t('tenant.audit.severity') || 'Severity'}</p>
                    {getSeverityBadge(selectedEvent.severity)}
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-500 mb-1">{t('tenant.audit.status') || 'Status'}</p>
                    {getStatusBadge(selectedEvent.status)}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-500 mb-1">{t('tenant.audit.ipAddress') || 'IP Address'}</p>
                    <code className="text-sm bg-gray-200 px-2 py-1 rounded">{selectedEvent.ipAddress || '-'}</code>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-500 mb-1">{t('tenant.audit.resourceType') || 'Resource Type'}</p>
                    <p className="font-medium text-gray-900">{selectedEvent.resourceType || '-'}</p>
                  </div>
                </div>

                {selectedEvent.userAgent && (
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-500 mb-1">{t('tenant.audit.userAgent') || 'User Agent'}</p>
                    <p className="text-sm text-gray-700 break-all">{selectedEvent.userAgent}</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => { setShowDetailModal(false); setSelectedEvent(null); }}
                  className="px-6 py-3 border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-all duration-200"
                >
                  {t('common.close')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
