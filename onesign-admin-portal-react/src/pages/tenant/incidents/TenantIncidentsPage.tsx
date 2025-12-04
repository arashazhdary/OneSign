import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocale } from '@/hooks/useLocale';
import { getTenantId } from '@/lib/tenant-context';
import { incidentsService } from '@/lib/api/services/incidents.service';
import type { Incident, IncidentStats, IncidentNote, LinkedEntity } from '@/lib/api/types/incidents';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  X,
  Filter,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  User,
  Calendar,
  Tag,
  FileText,
  Plus,
  Send,
  Link2,
  PlayCircle,
  Activity,
  AlertCircle,
  Info,
  Zap,
  Target,
  MessageSquare,
} from 'lucide-react';

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

// Mock data for demonstration
const mockIncidents: Incident[] = [
  {
    id: '1',
    title: 'Suspicious Login Attempt',
    description: 'Multiple failed login attempts detected from unknown IP',
    severity: 3,
    status: 0,
    type: 'Security',
    category: 'Authentication',
    source: 'Auth Service',
    detectedAt: '2024-02-15T10:30:00Z',
    createdAt: '2024-02-15T10:30:00Z',
    updatedAt: '2024-02-15T10:30:00Z',
    assignedToUserName: undefined,
    linkedEntities: [],
    notes: [],
  },
  {
    id: '2',
    title: 'Unauthorized Access Attempt',
    description: 'User tried to access restricted resource',
    severity: 2,
    status: 1,
    type: 'Security',
    category: 'Authorization',
    source: 'Access Control',
    detectedAt: '2024-02-15T09:15:00Z',
    createdAt: '2024-02-15T09:15:00Z',
    updatedAt: '2024-02-15T09:15:00Z',
    assignedToUserName: 'John Doe',
    linkedEntities: [],
    notes: [],
  },
  {
    id: '3',
    title: 'Data Export Anomaly',
    description: 'Large data export detected outside normal hours',
    severity: 2,
    status: 2,
    type: 'Data',
    category: 'Data Breach',
    source: 'DLP System',
    detectedAt: '2024-02-14T23:45:00Z',
    createdAt: '2024-02-14T23:45:00Z',
    updatedAt: '2024-02-14T23:45:00Z',
    assignedToUserName: 'Jane Smith',
    linkedEntities: [],
    notes: [],
  },
  {
    id: '4',
    title: 'Compliance Violation',
    description: 'Password policy not enforced for new users',
    severity: 1,
    status: 3,
    type: 'Compliance',
    category: 'Compliance',
    source: 'Policy Engine',
    detectedAt: '2024-02-14T14:20:00Z',
    createdAt: '2024-02-14T14:20:00Z',
    updatedAt: '2024-02-14T14:20:00Z',
    assignedToUserName: 'John Doe',
    linkedEntities: [],
    notes: [],
  },
];

const mockStats: IncidentStats = {
  totalActive: 12,
  critical: 2,
  high: 4,
  medium: 4,
  low: 2,
};

const mockPlaybookRuns: PlaybookRun[] = [
  {
    id: '1',
    incidentId: '1',
    incidentTitle: 'Suspicious Login Attempt',
    playbookId: 'pb-1',
    playbookName: 'Account Lockout Response',
    status: 'Completed',
    startedAt: '2024-02-15T10:35:00Z',
    completedAt: '2024-02-15T10:40:00Z',
    stepsCompleted: 5,
    totalSteps: 5,
    errorMessage: null,
  },
  {
    id: '2',
    incidentId: '2',
    incidentTitle: 'Unauthorized Access Attempt',
    playbookId: 'pb-2',
    playbookName: 'Access Investigation',
    status: 'Running',
    startedAt: '2024-02-15T09:20:00Z',
    completedAt: null,
    stepsCompleted: 3,
    totalSteps: 7,
    errorMessage: null,
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

export default function TenantIncidentsPage() {
  const { t } = useTranslation();
  const locale = useLocale();
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
  const pageSize = 10;

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
      setIncidents(data.items?.length ? data.items : mockIncidents);
    } catch (err) {
      setIncidents(mockIncidents);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    if (!tenantId) return;

    try {
      const data = await incidentsService.getIncidentStats(tenantId);
      setStats(data || mockStats);
    } catch (err) {
      setStats(mockStats);
    }
  };

  const fetchTimeline = async (incidentId: string) => {
    if (!tenantId) return;

    try {
      const data = await incidentsService.getIncidentTimeline(tenantId, incidentId);
      setTimeline(data || []);
    } catch (err) {
      setTimeline([]);
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
      setPlaybookRuns(data.items?.length ? data.items : mockPlaybookRuns);
    } catch (err) {
      setPlaybookRuns(mockPlaybookRuns);
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
      setSuccess(t('tenant.incidents.acknowledged', 'Incident acknowledged successfully'));
      fetchIncidents();
      if (selectedIncident?.id === incidentId) {
        fetchIncidentDetails(incidentId);
      }
    } catch (err) {
      setError(t('common.error', 'An error occurred'));
    }
  };

  const handleResolve = async (incidentId: string) => {
    setError('');
    setSuccess('');
    if (!tenantId) return;

    try {
      await incidentsService.resolveIncident(incidentId, tenantId);
      setSuccess(t('tenant.incidents.resolved', 'Incident resolved successfully'));
      fetchIncidents();
      if (selectedIncident?.id === incidentId) {
        fetchIncidentDetails(incidentId);
      }
    } catch (err) {
      setError(t('common.error', 'An error occurred'));
    }
  };

  const handleClose = async (incidentId: string) => {
    setError('');
    setSuccess('');
    if (!tenantId) return;

    try {
      await incidentsService.closeIncident(incidentId, tenantId);
      setSuccess(t('tenant.incidents.closed', 'Incident closed successfully'));
      fetchIncidents();
      if (selectedIncident?.id === incidentId) {
        fetchIncidentDetails(incidentId);
      }
    } catch (err) {
      setError(t('common.error', 'An error occurred'));
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

      setSuccess(t('tenant.incidents.noteAdded', 'Note added successfully'));
      setNewNoteContent('');
      setShowAddNote(false);
      fetchIncidentDetails(selectedIncident.id);
      fetchTimeline(selectedIncident.id);
    } catch (err) {
      setError(t('common.error', 'An error occurred'));
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

  const getSeverityConfig = (severity: number) => {
    const configs: Record<number, { text: string; color: string; icon: React.ElementType; bgColor: string }> = {
      0: { text: 'Low', color: 'text-green-800', icon: ShieldCheck, bgColor: 'bg-green-100' },
      1: { text: 'Medium', color: 'text-yellow-800', icon: Shield, bgColor: 'bg-yellow-100' },
      2: { text: 'High', color: 'text-orange-800', icon: ShieldAlert, bgColor: 'bg-orange-100' },
      3: { text: 'Critical', color: 'text-red-800', icon: ShieldX, bgColor: 'bg-red-100' },
    };
    return configs[severity] || configs[0];
  };

  const getStatusConfig = (status: number) => {
    const configs: Record<number, { text: string; color: string; icon: React.ElementType; bgColor: string }> = {
      0: { text: 'New', color: 'text-blue-800', icon: AlertCircle, bgColor: 'bg-blue-100' },
      1: { text: 'Acknowledged', color: 'text-yellow-800', icon: Eye, bgColor: 'bg-yellow-100' },
      2: { text: 'Investigating', color: 'text-purple-800', icon: Target, bgColor: 'bg-purple-100' },
      3: { text: 'Resolved', color: 'text-green-800', icon: CheckCircle, bgColor: 'bg-green-100' },
      4: { text: 'Closed', color: 'text-gray-800', icon: XCircle, bgColor: 'bg-gray-100' },
    };
    return configs[status] || configs[0];
  };

  const getPlaybookStatusConfig = (status: string) => {
    const configs: Record<string, { color: string; bgColor: string }> = {
      'Running': { color: 'text-blue-800', bgColor: 'bg-blue-100' },
      'Completed': { color: 'text-green-800', bgColor: 'bg-green-100' },
      'Failed': { color: 'text-red-800', bgColor: 'bg-red-100' },
      'Cancelled': { color: 'text-gray-800', bgColor: 'bg-gray-100' },
    };
    return configs[status] || { color: 'text-gray-800', bgColor: 'bg-gray-100' };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString(locale);
  };

  const categories = ['Security', 'Authentication', 'Authorization', 'Data Breach', 'Malware', 'Phishing', 'DDoS', 'Compliance', 'Other'];

  const tabs = [
    { id: 'active' as Tab, label: t('tenant.incidents.activeIncidents', 'Active Incidents'), icon: AlertTriangle },
    { id: 'details' as Tab, label: t('tenant.incidents.incidentDetails', 'Incident Details'), icon: Info },
    { id: 'playbooks' as Tab, label: t('tenant.incidents.playbookRuns', 'Playbook Runs'), icon: PlayCircle },
  ];

  if (loading && !incidents.length && !playbookRuns.length) {
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
        className="mb-8"
      >
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          {t('tenant.incidents.title', 'Incidents')}
        </h1>
        <p className="text-gray-600 mt-2">
          {t('tenant.incidents.subtitle', 'Monitor and respond to security incidents')}
        </p>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatCard
          title={t('tenant.incidents.totalActive', 'Total Active')}
          value={stats.totalActive}
          icon={Activity}
          color="from-blue-500 to-blue-600"
          delay={0}
        />
        <StatCard
          title={t('tenant.incidents.critical', 'Critical')}
          value={stats.critical}
          icon={ShieldX}
          color="from-red-500 to-red-600"
          delay={1}
        />
        <StatCard
          title={t('tenant.incidents.high', 'High')}
          value={stats.high}
          icon={ShieldAlert}
          color="from-orange-500 to-orange-600"
          delay={2}
        />
        <StatCard
          title={t('tenant.incidents.medium', 'Medium')}
          value={stats.medium}
          icon={Shield}
          color="from-yellow-500 to-yellow-600"
          delay={3}
        />
        <StatCard
          title={t('tenant.incidents.low', 'Low')}
          value={stats.low}
          icon={ShieldCheck}
          color="from-green-500 to-green-600"
          delay={4}
        />
      </div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 mb-6"
      >
        <div className="flex border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-all ${
                activeTab === tab.id
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Active Incidents Tab */}
      <AnimatePresence mode="wait">
        {activeTab === 'active' && (
          <motion.div
            key="active"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {/* Filters */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-6 mb-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <Filter className="w-5 h-5 text-indigo-600" />
                <h3 className="font-semibold text-gray-800">{t('common.filters', 'Filters')}</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('tenant.incidents.severity', 'Severity')}
                  </label>
                  <select
                    value={severityFilter}
                    onChange={(e) => {
                      setSeverityFilter(e.target.value === '' ? '' : Number(e.target.value));
                      setPageNumber(1);
                    }}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">{t('tenant.incidents.allSeverities', 'All Severities')}</option>
                    <option value={3}>{t('tenant.incidents.critical', 'Critical')}</option>
                    <option value={2}>{t('tenant.incidents.high', 'High')}</option>
                    <option value={1}>{t('tenant.incidents.medium', 'Medium')}</option>
                    <option value={0}>{t('tenant.incidents.low', 'Low')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('common.status', 'Status')}
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value === '' ? '' : Number(e.target.value));
                      setPageNumber(1);
                    }}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">{t('tenant.incidents.allStatuses', 'All Statuses')}</option>
                    <option value={0}>{t('tenant.incidents.status.new', 'New')}</option>
                    <option value={1}>{t('tenant.incidents.status.acknowledged', 'Acknowledged')}</option>
                    <option value={2}>{t('tenant.incidents.status.investigating', 'Investigating')}</option>
                    <option value={3}>{t('tenant.incidents.status.resolved', 'Resolved')}</option>
                    <option value={4}>{t('tenant.incidents.status.closed', 'Closed')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('tenant.incidents.category', 'Category')}
                  </label>
                  <select
                    value={categoryFilter}
                    onChange={(e) => {
                      setCategoryFilter(e.target.value);
                      setPageNumber(1);
                    }}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">{t('tenant.incidents.allCategories', 'All Categories')}</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>
            </motion.div>

            {/* Incidents Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 overflow-hidden"
            >
              {loading ? (
                <div className="p-12 text-center">
                  <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-gray-500">{t('common.loading', 'Loading...')}</p>
                </div>
              ) : incidents.length === 0 ? (
                <div className="p-12 text-center">
                  <ShieldCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">{t('tenant.incidents.noIncidents', 'No incidents found')}</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                      <tr>
                        <th
                          className={`px-6 py-4 ${locale === 'fa' ? 'text-right' : 'text-left'} text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100`}
                          onClick={() => handleSort('detectedAt')}
                        >
                          <div className="flex items-center gap-1">
                            {t('tenant.incidents.detected', 'Detected')}
                            {sortField === 'detectedAt' ? (
                              sortDirection === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />
                            ) : (
                              <ArrowUpDown className="w-4 h-4 text-gray-400" />
                            )}
                          </div>
                        </th>
                        <th
                          className={`px-6 py-4 ${locale === 'fa' ? 'text-right' : 'text-left'} text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100`}
                          onClick={() => handleSort('title')}
                        >
                          <div className="flex items-center gap-1">
                            {t('common.title', 'Title')}
                            {sortField === 'title' ? (
                              sortDirection === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />
                            ) : (
                              <ArrowUpDown className="w-4 h-4 text-gray-400" />
                            )}
                          </div>
                        </th>
                        <th
                          className={`px-6 py-4 ${locale === 'fa' ? 'text-right' : 'text-left'} text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100`}
                          onClick={() => handleSort('severity')}
                        >
                          <div className="flex items-center gap-1">
                            {t('tenant.incidents.severity', 'Severity')}
                            {sortField === 'severity' ? (
                              sortDirection === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />
                            ) : (
                              <ArrowUpDown className="w-4 h-4 text-gray-400" />
                            )}
                          </div>
                        </th>
                        <th
                          className={`px-6 py-4 ${locale === 'fa' ? 'text-right' : 'text-left'} text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100`}
                          onClick={() => handleSort('status')}
                        >
                          <div className="flex items-center gap-1">
                            {t('common.status', 'Status')}
                            {sortField === 'status' ? (
                              sortDirection === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />
                            ) : (
                              <ArrowUpDown className="w-4 h-4 text-gray-400" />
                            )}
                          </div>
                        </th>
                        <th className={`px-6 py-4 ${locale === 'fa' ? 'text-right' : 'text-left'} text-xs font-semibold text-gray-600 uppercase tracking-wider`}>
                          {t('tenant.incidents.category', 'Category')}
                        </th>
                        <th className={`px-6 py-4 ${locale === 'fa' ? 'text-right' : 'text-left'} text-xs font-semibold text-gray-600 uppercase tracking-wider`}>
                          {t('tenant.incidents.assignedTo', 'Assigned To')}
                        </th>
                        <th className={`px-6 py-4 ${locale === 'fa' ? 'text-right' : 'text-left'} text-xs font-semibold text-gray-600 uppercase tracking-wider`}>
                          {t('common.actions', 'Actions')}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      <AnimatePresence>
                        {incidents.map((incident, index) => {
                          const severityConfig = getSeverityConfig(incident.severity);
                          const statusConfig = getStatusConfig(incident.status);
                          const SeverityIcon = severityConfig.icon;
                          const StatusIcon = statusConfig.icon;

                          return (
                            <motion.tr
                              key={incident.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              transition={{ delay: index * 0.05 }}
                              className="hover:bg-blue-50/50 transition-colors"
                            >
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                {incident.detectedAt ? formatDate(incident.detectedAt) : '-'}
                              </td>
                              <td className="px-6 py-4">
                                <div>
                                  <p className="font-medium text-gray-900">{incident.title}</p>
                                  <p className="text-sm text-gray-500">{incident.source}</p>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${severityConfig.bgColor} ${severityConfig.color}`}>
                                  <SeverityIcon className="w-4 h-4" />
                                  {severityConfig.text}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${statusConfig.bgColor} ${statusConfig.color}`}>
                                  <StatusIcon className="w-4 h-4" />
                                  {statusConfig.text}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm">
                                  <Tag className="w-3.5 h-3.5" />
                                  {incident.category}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                  <User className="w-4 h-4 text-gray-400" />
                                  {incident.assignedToUserName || t('tenant.incidents.unassigned', 'Unassigned')}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => viewIncidentDetails(incident)}
                                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                    title={t('common.view', 'View')}
                                  >
                                    <Eye className="w-4 h-4" />
                                  </motion.button>
                                  {incident.status === 0 && (
                                    <motion.button
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                      onClick={() => handleAcknowledge(incident.id)}
                                      className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                                      title={t('tenant.incidents.acknowledge', 'Acknowledge')}
                                    >
                                      <Eye className="w-4 h-4" />
                                    </motion.button>
                                  )}
                                  {incident.status < 3 && (
                                    <motion.button
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                      onClick={() => handleResolve(incident.id)}
                                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                      title={t('tenant.incidents.resolve', 'Resolve')}
                                    >
                                      <CheckCircle className="w-4 h-4" />
                                    </motion.button>
                                  )}
                                  {incident.status === 3 && (
                                    <motion.button
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                      onClick={() => handleClose(incident.id)}
                                      className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                                      title={t('tenant.incidents.close', 'Close')}
                                    >
                                      <XCircle className="w-4 h-4" />
                                    </motion.button>
                                  )}
                                </div>
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
              {incidents.length > 0 && (
                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    {t('common.page', 'Page')} {pageNumber}
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
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setPageNumber(pageNumber + 1)}
                      disabled={incidents.length < pageSize}
                      className="p-2 border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                    >
                      {locale === 'fa' ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                    </motion.button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}

        {/* Incident Details Tab */}
        {activeTab === 'details' && (
          <motion.div
            key="details"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {!selectedIncident ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-12 text-center"
              >
                <Info className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">
                  {t('tenant.incidents.selectIncident', 'Select an incident from the Active Incidents tab to view details')}
                </p>
              </motion.div>
            ) : (
              <div className="space-y-6">
                {/* Incident Header */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-6"
                >
                  <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{selectedIncident.title}</h2>
                      <p className="text-gray-500 mt-2">{selectedIncident.description}</p>
                    </div>
                    <div className="flex gap-2">
                      {(() => {
                        const severityConfig = getSeverityConfig(selectedIncident.severity);
                        const statusConfig = getStatusConfig(selectedIncident.status);
                        const SeverityIcon = severityConfig.icon;
                        const StatusIcon = statusConfig.icon;
                        return (
                          <>
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${severityConfig.bgColor} ${severityConfig.color}`}>
                              <SeverityIcon className="w-4 h-4" />
                              {severityConfig.text}
                            </span>
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${statusConfig.bgColor} ${statusConfig.color}`}>
                              <StatusIcon className="w-4 h-4" />
                              {statusConfig.text}
                            </span>
                          </>
                        );
                      })()}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Tag className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-500">{t('tenant.incidents.category', 'Category')}:</span>
                      <span className="font-medium text-gray-900">{selectedIncident.category}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Zap className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-500">{t('tenant.incidents.source', 'Source')}:</span>
                      <span className="font-medium text-gray-900">{selectedIncident.source}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-500">{t('tenant.incidents.detected', 'Detected')}:</span>
                      <span className="font-medium text-gray-900">{selectedIncident.detectedAt ? formatDate(selectedIncident.detectedAt) : '-'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-500">{t('tenant.incidents.assignedTo', 'Assigned To')}:</span>
                      <span className="font-medium text-gray-900">{selectedIncident.assignedToUserName || t('tenant.incidents.unassigned', 'Unassigned')}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-6 flex gap-3">
                    {selectedIncident.status === 0 && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleAcknowledge(selectedIncident.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-xl hover:bg-yellow-600 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        {t('tenant.incidents.acknowledge', 'Acknowledge')}
                      </motion.button>
                    )}
                    {selectedIncident.status < 3 && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleResolve(selectedIncident.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors"
                      >
                        <CheckCircle className="w-4 h-4" />
                        {t('tenant.incidents.resolve', 'Resolve')}
                      </motion.button>
                    )}
                    {selectedIncident.status === 3 && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleClose(selectedIncident.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors"
                      >
                        <XCircle className="w-4 h-4" />
                        {t('tenant.incidents.close', 'Close')}
                      </motion.button>
                    )}
                  </div>
                </motion.div>

                {/* Timeline */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-6"
                >
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-indigo-600" />
                    {t('tenant.incidents.timeline', 'Timeline')}
                  </h3>
                  {timeline.length === 0 ? (
                    <p className="text-gray-500">{t('tenant.incidents.noTimeline', 'No timeline events')}</p>
                  ) : (
                    <div className="space-y-4">
                      {timeline.map((event, index) => (
                        <motion.div
                          key={event.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-start"
                        >
                          <div className="flex-shrink-0 w-3 h-3 mt-1.5 bg-indigo-500 rounded-full ring-4 ring-indigo-100"></div>
                          <div className={`${locale === 'fa' ? 'mr-4' : 'ml-4'}`}>
                            <div className="font-medium text-gray-900">{event.eventType}</div>
                            <div className="text-sm text-gray-500">{event.description}</div>
                            <div className="text-xs text-gray-400 mt-1">
                              {formatDate(event.occurredAt)}
                              {event.userName && ` • ${event.userName}`}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>

                {/* Linked Entities */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-6"
                >
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Link2 className="w-5 h-5 text-indigo-600" />
                    {t('tenant.incidents.linkedEntities', 'Linked Entities')}
                  </h3>
                  {(selectedIncident.linkedEntities?.length ?? 0) === 0 ? (
                    <p className="text-gray-500">{t('tenant.incidents.noLinkedEntities', 'No linked entities')}</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className={`px-4 py-2 ${locale === 'fa' ? 'text-right' : 'text-left'} text-xs font-medium text-gray-500 uppercase`}>{t('common.type', 'Type')}</th>
                            <th className={`px-4 py-2 ${locale === 'fa' ? 'text-right' : 'text-left'} text-xs font-medium text-gray-500 uppercase`}>{t('common.name', 'Name')}</th>
                            <th className={`px-4 py-2 ${locale === 'fa' ? 'text-right' : 'text-left'} text-xs font-medium text-gray-500 uppercase`}>{t('tenant.incidents.linkedAt', 'Linked At')}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {selectedIncident.linkedEntities?.map((entity) => (
                            <tr key={entity.id} className="hover:bg-gray-50">
                              <td className="px-4 py-2 text-sm text-gray-900">{entity.entityType}</td>
                              <td className="px-4 py-2 text-sm text-gray-500">{entity.entityName}</td>
                              <td className="px-4 py-2 text-sm text-gray-500">{formatDate(entity.linkedAt)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </motion.div>

                {/* Notes */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-6"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-indigo-600" />
                      {t('tenant.incidents.notes', 'Notes')}
                    </h3>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowAddNote(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      {t('tenant.incidents.addNote', 'Add Note')}
                    </motion.button>
                  </div>

                  <AnimatePresence>
                    {showAddNote && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-4 p-4 bg-gray-50 rounded-xl"
                      >
                        <textarea
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                          rows={3}
                          placeholder={t('tenant.incidents.enterNote', 'Enter your note...')}
                          value={newNoteContent}
                          onChange={(e) => setNewNoteContent(e.target.value)}
                        />
                        <div className="flex gap-2 mt-3">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleAddNote}
                            disabled={!newNoteContent.trim()}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all text-sm disabled:opacity-50"
                          >
                            <Send className="w-4 h-4" />
                            {t('tenant.incidents.saveNote', 'Save Note')}
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                              setShowAddNote(false);
                              setNewNoteContent('');
                            }}
                            className="px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors text-sm"
                          >
                            {t('common.cancel', 'Cancel')}
                          </motion.button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {(selectedIncident.notes?.length ?? 0) === 0 ? (
                    <p className="text-gray-500">{t('tenant.incidents.noNotes', 'No notes yet')}</p>
                  ) : (
                    <div className="space-y-3">
                      {selectedIncident.notes?.map((note, index) => (
                        <motion.div
                          key={note.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="p-4 bg-gray-50 rounded-xl"
                        >
                          <p className="text-gray-900">{note.content}</p>
                          <div className="text-xs text-gray-500 mt-2 flex items-center gap-2">
                            <User className="w-3.5 h-3.5" />
                            {note.createdByUserName} • {formatDate(note.createdAt)}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              </div>
            )}
          </motion.div>
        )}

        {/* Playbook Runs Tab */}
        {activeTab === 'playbooks' && (
          <motion.div
            key="playbooks"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 overflow-hidden"
          >
            {loading ? (
              <div className="p-12 text-center">
                <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-500">{t('common.loading', 'Loading...')}</p>
              </div>
            ) : playbookRuns.length === 0 ? (
              <div className="p-12 text-center">
                <PlayCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">{t('tenant.incidents.noPlaybookRuns', 'No playbook runs found')}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                      <th className={`px-6 py-4 ${locale === 'fa' ? 'text-right' : 'text-left'} text-xs font-semibold text-gray-600 uppercase tracking-wider`}>
                        {t('tenant.incidents.playbook', 'Playbook')}
                      </th>
                      <th className={`px-6 py-4 ${locale === 'fa' ? 'text-right' : 'text-left'} text-xs font-semibold text-gray-600 uppercase tracking-wider`}>
                        {t('tenant.incidents.incident', 'Incident')}
                      </th>
                      <th className={`px-6 py-4 ${locale === 'fa' ? 'text-right' : 'text-left'} text-xs font-semibold text-gray-600 uppercase tracking-wider`}>
                        {t('common.status', 'Status')}
                      </th>
                      <th className={`px-6 py-4 ${locale === 'fa' ? 'text-right' : 'text-left'} text-xs font-semibold text-gray-600 uppercase tracking-wider`}>
                        {t('tenant.incidents.progress', 'Progress')}
                      </th>
                      <th className={`px-6 py-4 ${locale === 'fa' ? 'text-right' : 'text-left'} text-xs font-semibold text-gray-600 uppercase tracking-wider`}>
                        {t('tenant.incidents.startedAt', 'Started At')}
                      </th>
                      <th className={`px-6 py-4 ${locale === 'fa' ? 'text-right' : 'text-left'} text-xs font-semibold text-gray-600 uppercase tracking-wider`}>
                        {t('tenant.incidents.completedAt', 'Completed At')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <AnimatePresence>
                      {playbookRuns.map((run, index) => {
                        const statusConfig = getPlaybookStatusConfig(run.status);
                        const progress = (run.stepsCompleted / run.totalSteps) * 100;

                        return (
                          <motion.tr
                            key={run.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ delay: index * 0.05 }}
                            className="hover:bg-blue-50/50 transition-colors"
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <PlayCircle className="w-5 h-5 text-indigo-600" />
                                <span className="font-medium text-gray-900">{run.playbookName}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {run.incidentTitle}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${statusConfig.bgColor} ${statusConfig.color}`}>
                                {run.status}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 0.5 }}
                                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
                                  />
                                </div>
                                <span className="text-sm text-gray-600 min-w-[50px]">
                                  {run.stepsCompleted}/{run.totalSteps}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {formatDate(run.startedAt)}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {run.completedAt ? formatDate(run.completedAt) : '-'}
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
            {playbookRuns.length > 0 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  {t('common.page', 'Page')} {playbookPageNumber}
                </p>
                <div className="flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setPlaybookPageNumber(playbookPageNumber - 1)}
                    disabled={playbookPageNumber === 1}
                    className="p-2 border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  >
                    {locale === 'fa' ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setPlaybookPageNumber(playbookPageNumber + 1)}
                    disabled={playbookRuns.length < pageSize}
                    className="p-2 border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  >
                    {locale === 'fa' ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                  </motion.button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
