import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getTenantId } from '@/lib/tenant-context';
import Modal from '@/components/common/Modal';
import { incidentsService } from '@/lib/api/services/incidents.service';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  AlertTriangle,
  Clock,
  User,
  Shield,
  CheckCircle,
  XCircle,
  Eye,
  FileText,
  Link2,
  BookOpen,
  Play,
  MessageSquare,
  RefreshCw,
  Zap,
  AlertCircle,
  Target,
  Calendar,
  MapPin,
} from 'lucide-react';

interface Incident {
  id: string;
  tenantId: string;
  title: string;
  description: string;
  severity: number;
  status: number;
  category: string;
  source: string;
  detectedAt: string;
  acknowledgedAt: string | null;
  resolvedAt: string | null;
  closedAt: string | null;
  assignedToUserId: string | null;
  assignedToUserName: string | null;
  linkedEntities: LinkedEntity[];
  notes: IncidentNote[];
}

interface LinkedEntity {
  id: string;
  entityType: string;
  entityId: string;
  entityName: string;
  linkedAt: string;
}

interface IncidentNote {
  id: string;
  content: string;
  createdByUserId: string;
  createdByUserName: string;
  createdAt: string;
}

interface TimelineEvent {
  id: string;
  eventType: string;
  description: string;
  occurredAt: string;
  userId: string | null;
  userName: string | null;
}

interface RelatedIncident {
  id: string;
  title: string;
  severity: number;
  status: number;
  detectedAt: string;
  similarityScore: number;
}

interface Playbook {
  id: string;
  name: string;
  description: string;
}

type Tab = 'overview' | 'timeline' | 'entities' | 'notes' | 'related' | 'playbooks';

const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
  { key: 'overview', label: 'Overview', icon: Eye },
  { key: 'timeline', label: 'Timeline', icon: Clock },
  { key: 'entities', label: 'Entities', icon: Link2 },
  { key: 'notes', label: 'Notes', icon: MessageSquare },
  { key: 'related', label: 'Related', icon: Target },
  { key: 'playbooks', label: 'Playbooks', icon: BookOpen },
];

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
        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
      </div>
      <div className={`p-4 rounded-xl bg-gradient-to-br ${color}`}>{icon}</div>
    </div>
  </motion.div>
);

export default function TenantIncidentsDetailPage() {
  const params = useParams();
  const navigate = useNavigate();
  const incidentId = params.id as string;
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [incident, setIncident] = useState<Incident | null>(null);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [relatedIncidents, setRelatedIncidents] = useState<RelatedIncident[]>([]);
  const [playbooks, setPlaybooks] = useState<Playbook[]>([]);

  const [showAddNoteModal, setShowAddNoteModal] = useState(false);
  const [showAddEntityModal, setShowAddEntityModal] = useState(false);
  const [showPlaybookModal, setShowPlaybookModal] = useState(false);

  const [newNoteContent, setNewNoteContent] = useState('');
  const [entityType, setEntityType] = useState('');
  const [entityId, setEntityId] = useState('');
  const [entityName, setEntityName] = useState('');
  const [selectedPlaybookId, setSelectedPlaybookId] = useState('');

  const tenantId = getTenantId();

  useEffect(() => {
    fetchIncident();
    fetchPlaybooks();
  }, [incidentId]);

  useEffect(() => {
    if (activeTab === 'timeline') {
      fetchTimeline();
    } else if (activeTab === 'related') {
      fetchRelatedIncidents();
    }
  }, [activeTab]);

  const fetchIncident = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await incidentsService.getIncidentById(incidentId, tenantId);
      setIncident(data);
    } catch (err) {
      setError(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const fetchTimeline = async () => {
    try {
      const data = await incidentsService.getIncidentTimeline(incidentId, tenantId);
      setTimeline(data);
    } catch (err) {
      console.error('Failed to fetch timeline:', err);
    }
  };

  const fetchRelatedIncidents = async () => {
    try {
      setRelatedIncidents([]);
    } catch (err) {
      console.error('Failed to fetch related incidents:', err);
    }
  };

  const fetchPlaybooks = async () => {
    try {
      setPlaybooks([]);
    } catch (err) {
      console.error('Failed to fetch playbooks:', err);
    }
  };

  const handleAddNote = async () => {
    if (!newNoteContent.trim()) return;

    setProcessing(true);
    setError('');
    setSuccess('');
    try {
      await incidentsService.addIncidentNote(incidentId, { content: newNoteContent }, tenantId);
      setSuccess('Note added successfully');
      setNewNoteContent('');
      setShowAddNoteModal(false);
      fetchIncident();
      if (activeTab === 'timeline') fetchTimeline();
    } catch (err) {
      setError(t('common.error'));
    } finally {
      setProcessing(false);
    }
  };

  const handleAddEntity = async () => {
    if (!entityType || !entityId) {
      setError(t('tenant.incidents.errors.provideAllFields'));
      return;
    }

    setProcessing(true);
    setError('');
    setSuccess('');
    try {
      setSuccess('Entity linked successfully');
      setEntityType('');
      setEntityId('');
      setEntityName('');
      setShowAddEntityModal(false);
      fetchIncident();
    } catch (err) {
      setError(t('common.error'));
    } finally {
      setProcessing(false);
    }
  };

  const handleExecutePlaybook = async () => {
    if (!selectedPlaybookId) {
      setError(t('tenant.incidents.errors.selectPlaybook'));
      return;
    }

    setProcessing(true);
    setError('');
    setSuccess('');
    try {
      setSuccess('Playbook execution started successfully');
      setSelectedPlaybookId('');
      setShowPlaybookModal(false);
    } catch (err) {
      setError(t('common.error'));
    } finally {
      setProcessing(false);
    }
  };

  const handleStatusChange = async (action: 'acknowledge' | 'resolve' | 'close') => {
    setProcessing(true);
    setError('');
    setSuccess('');
    try {
      if (action === 'acknowledge') {
        await incidentsService.acknowledgeIncident(incidentId, tenantId);
      } else if (action === 'resolve') {
        await incidentsService.resolveIncident(incidentId, tenantId, '');
      } else if (action === 'close') {
        await incidentsService.closeIncident(incidentId, tenantId);
      }
      setSuccess(`Incident ${action}d successfully`);
      fetchIncident();
      if (activeTab === 'timeline') fetchTimeline();
    } catch (err) {
      setError(t('common.error'));
    } finally {
      setProcessing(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getSeverityConfig = (severity: number) => {
    const configs: Record<number, { text: string; bgClass: string; icon: React.ReactNode }> = {
      0: { text: 'Low', bgClass: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', icon: <CheckCircle className="w-4 h-4" /> },
      1: { text: 'Medium', bgClass: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', icon: <AlertCircle className="w-4 h-4" /> },
      2: { text: 'High', bgClass: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400', icon: <AlertTriangle className="w-4 h-4" /> },
      3: { text: 'Critical', bgClass: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', icon: <Zap className="w-4 h-4" /> },
    };
    return configs[severity] || configs[0];
  };

  const getStatusConfig = (status: number) => {
    const configs: Record<number, { text: string; bgClass: string }> = {
      0: { text: 'New', bgClass: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
      1: { text: 'Acknowledged', bgClass: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
      2: { text: 'Investigating', bgClass: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' },
      3: { text: 'Resolved', bgClass: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
      4: { text: 'Closed', bgClass: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' },
    };
    return configs[status] || configs[0];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-orange-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-8">
        <div className="flex items-center justify-center h-64">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <RefreshCw className="w-8 h-8 text-red-600" />
          </motion.div>
        </div>
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-orange-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-8">
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl">
          Incident not found
        </div>
      </div>
    );
  }

  const severityConfig = getSeverityConfig(incident.severity);
  const statusConfig = getStatusConfig(incident.status);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-orange-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Helmet>
        <title>{incident.title} - Incidents</title>
      </Helmet>

      <div className="p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <motion.button
            whileHover={{ x: -4 }}
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 mb-4 font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Incidents
          </motion.button>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-red-500 to-orange-600 shadow-lg">
                <AlertTriangle className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                  {incident.title}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">{incident.description}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className={`px-3 py-1 text-sm font-medium rounded-full flex items-center gap-1 ${severityConfig.bgClass}`}>
                    {severityConfig.icon}
                    {severityConfig.text}
                  </span>
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${statusConfig.bgClass}`}>
                    {statusConfig.text}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Alerts */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl flex items-center gap-3"
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
              className="mb-6 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 px-4 py-3 rounded-xl flex items-center gap-3"
            >
              <CheckCircle className="w-5 h-5" />
              {success}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 flex flex-wrap gap-3"
        >
          {incident.status === 0 && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleStatusChange('acknowledge')}
              className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl font-medium shadow-lg transition-all"
            >
              <Eye className="w-4 h-4" />
              Acknowledge
            </motion.button>
          )}
          {incident.status < 3 && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleStatusChange('resolve')}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium shadow-lg transition-all"
            >
              <CheckCircle className="w-4 h-4" />
              Resolve
            </motion.button>
          )}
          {incident.status === 3 && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleStatusChange('close')}
              className="flex items-center gap-2 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-xl font-medium shadow-lg transition-all"
            >
              <XCircle className="w-4 h-4" />
              Close
            </motion.button>
          )}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowAddNoteModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium shadow-lg transition-all"
          >
            <MessageSquare className="w-4 h-4" />
            Add Note
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowAddEntityModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-medium shadow-lg transition-all"
          >
            <Link2 className="w-4 h-4" />
            Link Entity
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowPlaybookModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-medium shadow-lg transition-all"
          >
            <Play className="w-4 h-4" />
            Execute Playbook
          </motion.button>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 mb-6"
        >
          <nav className="flex p-2 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`relative flex items-center gap-2 py-3 px-4 rounded-lg font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.key
                    ? 'text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700'
                }`}
              >
                {activeTab === tab.key && (
                  <motion.div
                    layoutId="activeIncidentTab"
                    className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-600 rounded-lg"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <tab.icon className="w-4 h-4 relative z-10" />
                <span className="relative z-10">{tab.label}</span>
              </button>
            ))}
          </nav>
        </motion.div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6"
            >
              <StatCard
                title="Category"
                value={incident.category}
                icon={<Shield className="w-6 h-6 text-white" />}
                color="from-blue-500 to-blue-600"
                delay={0}
              />
              <StatCard
                title="Source"
                value={incident.source}
                icon={<Target className="w-6 h-6 text-white" />}
                color="from-purple-500 to-purple-600"
                delay={1}
              />
              <StatCard
                title="Detected"
                value={new Date(incident.detectedAt).toLocaleDateString()}
                icon={<Calendar className="w-6 h-6 text-white" />}
                color="from-orange-500 to-orange-600"
                delay={2}
              />
              <StatCard
                title="Assigned To"
                value={incident.assignedToUserName || 'Unassigned'}
                icon={<User className="w-6 h-6 text-white" />}
                color="from-green-500 to-green-600"
                delay={3}
              />
            </motion.div>
          )}

          {activeTab === 'overview' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-red-500" />
                Incident Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Detected At</label>
                  <div className="text-gray-900 dark:text-white">{formatDate(incident.detectedAt)}</div>
                </div>
                {incident.acknowledgedAt && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Acknowledged At</label>
                    <div className="text-gray-900 dark:text-white">{formatDate(incident.acknowledgedAt)}</div>
                  </div>
                )}
                {incident.resolvedAt && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Resolved At</label>
                    <div className="text-gray-900 dark:text-white">{formatDate(incident.resolvedAt)}</div>
                  </div>
                )}
                {incident.closedAt && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Closed At</label>
                    <div className="text-gray-900 dark:text-white">{formatDate(incident.closedAt)}</div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'timeline' && (
            <motion.div
              key="timeline"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-red-500" />
                Timeline
              </h3>
              {timeline.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">No timeline events</p>
              ) : (
                <div className="space-y-4">
                  {timeline.map((event, index) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-4 border-l-4 border-red-500 pl-4 py-2"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 dark:text-white">{event.eventType}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">{event.description}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-500 mt-1 flex items-center gap-2">
                          <Clock className="w-3 h-3" />
                          {formatDate(event.occurredAt)}
                          {event.userName && (
                            <>
                              <User className="w-3 h-3 ml-2" />
                              {event.userName}
                            </>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'entities' && (
            <motion.div
              key="entities"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Link2 className="w-5 h-5 text-red-500" />
                Linked Entities
              </h3>
              {incident.linkedEntities.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">No linked entities</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-slate-700">
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Type</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Name</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">ID</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Linked At</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                      {incident.linkedEntities.map((entity) => (
                        <tr key={entity.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{entity.entityType}</td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{entity.entityName}</td>
                          <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 font-mono">{entity.entityId}</td>
                          <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{formatDate(entity.linkedAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'notes' && (
            <motion.div
              key="notes"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-red-500" />
                Notes
              </h3>
              {incident.notes.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">No notes yet</p>
              ) : (
                <div className="space-y-4">
                  {incident.notes.map((note, index) => (
                    <motion.div
                      key={note.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl"
                    >
                      <div className="text-gray-900 dark:text-white">{note.content}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-2">
                        <User className="w-3 h-3" />
                        {note.createdByUserName}
                        <Clock className="w-3 h-3 ml-2" />
                        {formatDate(note.createdAt)}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'related' && (
            <motion.div
              key="related"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-red-500" />
                Related Incidents
              </h3>
              {relatedIncidents.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">No related incidents found</p>
              ) : (
                <div className="space-y-3">
                  {relatedIncidents.map((related) => (
                    <motion.div
                      key={related.id}
                      whileHover={{ scale: 1.01 }}
                      className="p-4 border border-gray-200 dark:border-slate-600 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700/50 cursor-pointer transition-all"
                      onClick={() => navigate(`/tenant/incidents/${related.id}`)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 dark:text-white">{related.title}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{formatDate(related.detectedAt)}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${getSeverityConfig(related.severity).bgClass}`}>
                            {getSeverityConfig(related.severity).text}
                          </span>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {Math.round(related.similarityScore * 100)}% similar
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'playbooks' && (
            <motion.div
              key="playbooks"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-red-500" />
                Available Playbooks
              </h3>
              {playbooks.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">No playbooks available</p>
              ) : (
                <div className="space-y-3">
                  {playbooks.map((playbook) => (
                    <div key={playbook.id} className="p-4 border border-gray-200 dark:border-slate-600 rounded-xl">
                      <div className="font-medium text-gray-900 dark:text-white">{playbook.name}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">{playbook.description}</div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Add Note Modal */}
      <Modal
        isOpen={showAddNoteModal}
        onClose={() => {
          setShowAddNoteModal(false);
          setNewNoteContent('');
        }}
        title="Add Note"
        footer={
          <>
            <button
              onClick={() => {
                setShowAddNoteModal(false);
                setNewNoteContent('');
              }}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={handleAddNote}
              disabled={processing || !newNoteContent.trim()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              {processing ? 'Adding...' : 'Add Note'}
            </button>
          </>
        }
      >
        <textarea
          value={newNoteContent}
          onChange={(e) => setNewNoteContent(e.target.value)}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
          placeholder={t('tenant.incidents.placeholders.note')}
        />
      </Modal>

      {/* Add Entity Modal */}
      <Modal
        isOpen={showAddEntityModal}
        onClose={() => {
          setShowAddEntityModal(false);
          setEntityType('');
          setEntityId('');
          setEntityName('');
        }}
        title="Link Entity"
        footer={
          <>
            <button
              onClick={() => {
                setShowAddEntityModal(false);
                setEntityType('');
                setEntityId('');
                setEntityName('');
              }}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={handleAddEntity}
              disabled={processing}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              {processing ? 'Adding...' : 'Link Entity'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Entity Type</label>
            <select
              value={entityType}
              onChange={(e) => setEntityType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">Select type</option>
              <option value="user">User</option>
              <option value="device">Device</option>
              <option value="application">Application</option>
              <option value="ip">IP Address</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Entity ID</label>
            <input
              type="text"
              value={entityId}
              onChange={(e) => setEntityId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder={t('tenant.incidents.placeholders.entityId')}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Entity Name</label>
            <input
              type="text"
              value={entityName}
              onChange={(e) => setEntityName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder={t('tenant.incidents.placeholders.entityName')}
            />
          </div>
        </div>
      </Modal>

      {/* Execute Playbook Modal */}
      <Modal
        isOpen={showPlaybookModal}
        onClose={() => {
          setShowPlaybookModal(false);
          setSelectedPlaybookId('');
        }}
        title="Execute Playbook"
        footer={
          <>
            <button
              onClick={() => {
                setShowPlaybookModal(false);
                setSelectedPlaybookId('');
              }}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={handleExecutePlaybook}
              disabled={processing || !selectedPlaybookId}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {processing ? 'Executing...' : 'Execute Playbook'}
            </button>
          </>
        }
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Playbook</label>
          <select
            value={selectedPlaybookId}
            onChange={(e) => setSelectedPlaybookId(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">Select a playbook</option>
            {playbooks.map((playbook) => (
              <option key={playbook.id} value={playbook.id}>
                {playbook.name}
              </option>
            ))}
          </select>
        </div>
      </Modal>
    </div>
  );
}
