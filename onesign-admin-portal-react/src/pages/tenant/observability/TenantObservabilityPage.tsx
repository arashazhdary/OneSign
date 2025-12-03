import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocale } from '@/hooks/useLocale';
import { getTenantId } from '@/lib/tenant-context';
import * as ObservabilityAPI from '@/lib/api/observability';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import Modal from '@/components/common/Modal';
import {
  Eye,
  Search,
  Download,
  Filter,
  Calendar,
  User,
  Shield,
  Server,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Activity,
  Clock,
  Globe,
  ChevronLeft,
  ChevronRight,
  X,
  FileText,
  Trash2
} from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  delay: number;
}

const StatCard = ({ title, value, icon, color, delay }: StatCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: delay * 0.1 }}
    className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6 hover:shadow-xl transition-all duration-300"
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
      </div>
      <div className={`p-4 rounded-xl bg-gradient-to-br ${color}`}>
        {icon}
      </div>
    </div>
  </motion.div>
);

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
  const [searchResults, setSearchResults] = useState<any>(null);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
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
      const filter: any = {
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

      const data = await ObservabilityAPI.searchAuditEvents(filter);
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
      const filter: any = {
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

      const blob = await ObservabilityAPI.exportAuditLogs('csv', filter);
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

  const handleViewDetails = async (event: any) => {
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

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'Authentication':
        return <Shield className="w-4 h-4" />;
      case 'Authorization':
        return <User className="w-4 h-4" />;
      case 'UserManagement':
        return <User className="w-4 h-4" />;
      case 'ApplicationManagement':
        return <Server className="w-4 h-4" />;
      case 'SecurityPolicy':
        return <Shield className="w-4 h-4" />;
      case 'Configuration':
        return <FileText className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  // Calculate stats from search results
  const totalEvents = searchResults?.totalCount || 0;
  const successEvents = searchResults?.events?.filter((e: any) => e.success).length || 0;
  const failedEvents = searchResults?.events?.filter((e: any) => !e.success).length || 0;
  const uniqueActors = searchResults ? new Set(searchResults.events?.map((e: any) => e.actorId)).size : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      <Helmet>
        <title>{t('tenant.observability.title') || 'Advanced Audit Search'} | OneSign</title>
      </Helmet>

      <div className="p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
                <Eye className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {t('tenant.observability.title') || 'Advanced Audit Search'}
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                  {t('tenant.observability.subtitle') || 'Search and analyze audit events across your organization'}
                </p>
              </div>
            </div>
            {searchResults && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Download className="w-5 h-5" />
                {t('common.exportResults')}
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* Error/Success Messages */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl flex items-center gap-2"
            >
              <XCircle className="w-5 h-5" />
              {error}
            </motion.div>
          )}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 px-4 py-3 rounded-xl flex items-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              {success}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats Cards */}
        {searchResults && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <StatCard
              title={t('tenant.observability.totalEvents') || 'Total Events'}
              value={totalEvents.toLocaleString()}
              icon={<Activity className="w-6 h-6 text-white" />}
              color="from-blue-500 to-indigo-600"
              delay={0}
            />
            <StatCard
              title={t('tenant.observability.successfulEvents') || 'Successful'}
              value={successEvents}
              icon={<CheckCircle className="w-6 h-6 text-white" />}
              color="from-green-500 to-emerald-600"
              delay={1}
            />
            <StatCard
              title={t('tenant.observability.failedEvents') || 'Failed'}
              value={failedEvents}
              icon={<XCircle className="w-6 h-6 text-white" />}
              color="from-red-500 to-rose-600"
              delay={2}
            />
            <StatCard
              title={t('tenant.observability.uniqueActors') || 'Unique Actors'}
              value={uniqueActors}
              icon={<User className="w-6 h-6 text-white" />}
              color="from-purple-500 to-violet-600"
              delay={3}
            />
          </div>
        )}

        {/* Search Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6 mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-indigo-100 to-blue-100 dark:from-indigo-900/50 dark:to-blue-900/50 rounded-lg">
              <Filter className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{t('common.searchFilters')}</h2>
          </div>

          <form onSubmit={handleSearch}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  {t('tenant.observability.startDate') || 'Start Date'}
                </label>
                <input
                  type="date"
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  {t('tenant.observability.endDate') || 'End Date'}
                </label>
                <input
                  type="date"
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>

              {/* Event Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Activity className="w-4 h-4 inline mr-2" />
                  {t('tenant.observability.eventType') || 'Event Type'}
                </label>
                <select
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                >
                  <option value="">{t('common.all')}</option>
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('tenant.observability.action') || 'Action'}
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  value={action}
                  onChange={(e) => setAction(e.target.value)}
                  placeholder={t('common.placeholderAction')}
                />
              </div>

              {/* Actor ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  {t('tenant.observability.actorId') || 'Actor (User ID)'}
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  value={actorId}
                  onChange={(e) => setActorId(e.target.value)}
                  placeholder={t('common.placeholderUserIdOrEmail')}
                />
              </div>

              {/* Resource Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Server className="w-4 h-4 inline mr-2" />
                  {t('tenant.observability.resourceType') || 'Resource Type'}
                </label>
                <select
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  value={resourceType}
                  onChange={(e) => setResourceType(e.target.value)}
                >
                  <option value="">{t('common.all')}</option>
                  <option value="User">User</option>
                  <option value="Application">Application</option>
                  <option value="Role">Role</option>
                  <option value="Policy">Policy</option>
                  <option value="OrgUnit">Org Unit</option>
                </select>
              </div>

              {/* Resource ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('tenant.observability.resourceId') || 'Resource ID'}
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  value={resourceId}
                  onChange={(e) => setResourceId(e.target.value)}
                  placeholder={t('common.placeholderResourceId')}
                />
              </div>

              {/* IP Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Globe className="w-4 h-4 inline mr-2" />
                  {t('audit.ipAddress')}
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  value={ipAddress}
                  onChange={(e) => setIpAddress(e.target.value)}
                  placeholder={t('common.placeholderIpAddress')}
                />
              </div>

              {/* Success Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('common.status')}
                </label>
                <select
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  value={successFilter === null ? 'all' : successFilter.toString()}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSuccessFilter(value === 'all' ? null : value === 'true');
                  }}
                >
                  <option value="all">{t('common.all')}</option>
                  <option value="true">{t('common.success')}</option>
                  <option value="false">{t('common.failed')}</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg shadow-lg hover:shadow-xl disabled:opacity-50 transition-all duration-300"
              >
                {loading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  />
                ) : (
                  <Search className="w-5 h-5" />
                )}
                {loading ? t('common.searching') : t('common.search')}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={clearFilters}
                className="flex items-center gap-2 px-6 py-2.5 bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-500 transition-all duration-300"
              >
                <Trash2 className="w-5 h-5" />
                {t('common.clearFilters')}
              </motion.button>
            </div>
          </form>
        </motion.div>

        {/* Search Results */}
        {searchResults && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {t('common.results')} ({searchResults.totalCount.toLocaleString()} {t('common.events')})
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                <thead className="bg-gray-50 dark:bg-slate-700/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      <Clock className="w-4 h-4 inline mr-1" />
                      {t('tenant.observability.timestamp') || 'Timestamp'}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t('tenant.observability.eventType') || 'Event Type'}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t('tenant.observability.action') || 'Action'}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t('tenant.observability.actor') || 'Actor'}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t('tenant.observability.resource') || 'Resource'}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t('common.status')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t('common.actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                  {searchResults.events.map((event: any, index: number) => (
                    <motion.tr
                      key={event.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.02 }}
                      className={`hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors ${
                        !event.success ? 'bg-red-50/50 dark:bg-red-900/10' : ''
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(event.timestamp).toLocaleString(locale)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="p-1.5 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg text-indigo-600 dark:text-indigo-400">
                            {getEventTypeIcon(event.eventType)}
                          </span>
                          <span className="text-sm text-gray-900 dark:text-white">{event.eventType}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {event.action}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-white">{event.actorEmail}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">{event.actorId?.substring(0, 8)}...</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-white">{event.resourceType}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">{event.resourceId?.substring(0, 8)}...</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                          event.success
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                            : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                        }`}>
                          {event.success ? (
                            <CheckCircle className="w-3 h-3" />
                          ) : (
                            <XCircle className="w-3 h-3" />
                          )}
                          {event.success ? t('common.success') : t('common.failed')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleViewDetails(event)}
                          className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 text-sm font-medium"
                        >
                          <Eye className="w-4 h-4" />
                          {t('common.viewDetails')}
                        </motion.button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {searchResults.events.length === 0 && (
              <div className="text-center py-12">
                <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  {t('tenant.observability.noResults') || t('common.noResults')}
                </p>
              </div>
            )}

            {/* Pagination */}
            {searchResults.totalCount > pageSize && (
              <div className="px-6 py-4 border-t border-gray-200 dark:border-slate-700 flex justify-between items-center">
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  {t('tenant.observability.showing') || 'Showing'}{' '}
                  <span className="font-medium">{((pageNumber - 1) * pageSize) + 1}</span> -{' '}
                  <span className="font-medium">{Math.min(pageNumber * pageSize, searchResults.totalCount)}</span>{' '}
                  {t('tenant.observability.of') || 'of'}{' '}
                  <span className="font-medium">{searchResults.totalCount.toLocaleString()}</span>
                </div>
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setPageNumber(Math.max(1, pageNumber - 1));
                      handleSearch();
                    }}
                    disabled={pageNumber === 1}
                    className="flex items-center gap-1 px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    {t('common.previous')}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setPageNumber(pageNumber + 1);
                      handleSearch();
                    }}
                    disabled={pageNumber * pageSize >= searchResults.totalCount}
                    className="flex items-center gap-1 px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-all"
                  >
                    {t('common.next')}
                    <ChevronRight className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Detail Modal */}
        <Modal
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedEvent(null);
          }}
          title={t('tenant.observability.eventDetails') || 'Event Details'}
          size="lg"
        >
          {selectedEvent && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-gray-50 dark:bg-slate-700/50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    <Clock className="w-4 h-4" />
                    {t('tenant.observability.timestamp') || 'Timestamp'}
                  </div>
                  <p className="text-gray-900 dark:text-white">
                    {new Date(selectedEvent.timestamp).toLocaleString(locale)}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-slate-700/50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    <Activity className="w-4 h-4" />
                    {t('tenant.observability.eventType') || 'Event Type'}
                  </div>
                  <p className="text-gray-900 dark:text-white">{selectedEvent.eventType}</p>
                </div>
                <div className="bg-gray-50 dark:bg-slate-700/50 p-4 rounded-lg">
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    {t('tenant.observability.action') || 'Action'}
                  </div>
                  <p className="text-gray-900 dark:text-white">{selectedEvent.action}</p>
                </div>
                <div className="bg-gray-50 dark:bg-slate-700/50 p-4 rounded-lg">
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    {t('common.status')}
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                    selectedEvent.success
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                      : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                  }`}>
                    {selectedEvent.success ? (
                      <CheckCircle className="w-3 h-3" />
                    ) : (
                      <XCircle className="w-3 h-3" />
                    )}
                    {selectedEvent.success ? t('common.success') : t('common.failed')}
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-slate-700 pt-4">
                <h3 className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                  <User className="w-4 h-4" />
                  {t('tenant.observability.actor') || 'Actor'}
                </h3>
                <div className="bg-gray-50 dark:bg-slate-700/50 p-4 rounded-lg">
                  <p className="text-gray-900 dark:text-white">{selectedEvent.actorEmail}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-1">{selectedEvent.actorId}</p>
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-slate-700 pt-4">
                <h3 className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                  <Server className="w-4 h-4" />
                  {t('tenant.observability.resource') || 'Resource'}
                </h3>
                <div className="bg-gray-50 dark:bg-slate-700/50 p-4 rounded-lg">
                  <p className="text-gray-900 dark:text-white">{selectedEvent.resourceType}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-1">{selectedEvent.resourceId}</p>
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-slate-700 pt-4">
                <h3 className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                  <Globe className="w-4 h-4" />
                  {t('tenant.observability.connectionInfo') || 'Connection Info'}
                </h3>
                <div className="bg-gray-50 dark:bg-slate-700/50 p-4 rounded-lg space-y-2">
                  <p className="text-gray-900 dark:text-white">
                    <strong className="text-gray-500 dark:text-gray-400">IP:</strong> {selectedEvent.ipAddress}
                  </p>
                  <p className="text-gray-900 dark:text-white text-sm">
                    <strong className="text-gray-500 dark:text-gray-400">User Agent:</strong> {selectedEvent.userAgent}
                  </p>
                </div>
              </div>

              {selectedEvent.errorMessage && (
                <div className="border-t border-gray-200 dark:border-slate-700 pt-4">
                  <h3 className="flex items-center gap-2 text-sm font-medium text-red-500 mb-3">
                    <AlertTriangle className="w-4 h-4" />
                    {t('common.errorMessage')}
                  </h3>
                  <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                    <p className="text-red-600 dark:text-red-400">{selectedEvent.errorMessage}</p>
                  </div>
                </div>
              )}

              {selectedEvent.metadata && Object.keys(selectedEvent.metadata).length > 0 && (
                <div className="border-t border-gray-200 dark:border-slate-700 pt-4">
                  <h3 className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                    <FileText className="w-4 h-4" />
                    {t('tenant.observability.metadata') || 'Metadata'}
                  </h3>
                  <pre className="text-xs bg-gray-50 dark:bg-slate-700/50 p-4 rounded-lg overflow-auto max-h-64 text-gray-900 dark:text-white">
                    {JSON.stringify(selectedEvent.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}
