import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getTenantId } from '@/lib/tenant-context';
import * as HuntingAPI from '@/lib/api/hunting';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import Modal from '@/components/common/Modal';
import {
  Crosshair,
  Search,
  Calendar,
  Play,
  Plus,
  Edit2,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Database,
  Code,
  Zap,
  Target,
  Activity,
  FileSearch,
  Settings,
  ChevronLeft,
  ChevronRight,
  ToggleLeft,
  ToggleRight,
  HelpCircle,
} from 'lucide-react';

// Types
type SavedQuery = any;

interface ScheduledHunt {
  id: string;
  name: string;
  queryId: string;
  queryName: string;
  scheduleSpec: string;
  datasetType: string;
  isEnabled: boolean;
  nextRunAt: string;
  lastRunAt: string | null;
  createdAt: string;
}

interface HuntRun {
  id: string;
  scheduledHuntId: string;
  huntName: string;
  status: 'Running' | 'Succeeded' | 'Failed' | 'Cancelled';
  startedAt: string;
  completedAt: string | null;
  matchCount: number;
  errorMessage: string | null;
  datasetType: string;
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  delay: number;
}

// Constants
const DATASET_TYPES = [
  'SignInLogs',
  'AuditEvents',
  'RiskEvents',
  'UserActivities',
  'AdminActions',
  'SecurityAlerts',
];

const SCHEDULE_SPECS = [
  { value: 'Hourly', label: 'Hourly' },
  { value: 'Daily', label: 'Daily' },
  { value: 'Weekly', label: 'Weekly' },
  { value: 'Custom', label: 'Custom' },
];

type Tab = 'queries' | 'scheduled' | 'runs' | 'builder';

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

export default function TenantHuntingPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<Tab>('queries');
  const [tenantId, setTenantIdState] = useState<string>('');
  const [userId] = useState('00000000-0000-0000-0000-000000000001');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Data states
  const [queries, setQueries] = useState<SavedQuery[]>([]);
  const [scheduledHunts, setScheduledHunts] = useState<ScheduledHunt[]>([]);
  const [huntRuns, setHuntRuns] = useState<HuntRun[]>([]);
  const [totalRuns, setTotalRuns] = useState(0);
  const [runsPage, setRunsPage] = useState(1);

  // Modal states
  const [showQueryModal, setShowQueryModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [editingQuery, setEditingQuery] = useState<SavedQuery | null>(null);
  const [editingSchedule, setEditingSchedule] = useState<ScheduledHunt | null>(null);

  // Query form state
  const [queryForm, setQueryForm] = useState({
    name: '',
    description: '',
    oqlExpression: '',
    datasetType: DATASET_TYPES[0],
  });

  // Schedule form state
  const [scheduleForm, setScheduleForm] = useState({
    name: '',
    queryId: '',
    scheduleSpec: 'Daily',
    customCron: '',
    isEnabled: true,
  });

  // Query builder state
  const [builderDataset, setBuilderDataset] = useState(DATASET_TYPES[0]);
  const [builderField, setBuilderField] = useState('');
  const [builderOperator, setBuilderOperator] = useState('==');
  const [builderValue, setBuilderValue] = useState('');
  const [builderQuery, setBuilderQuery] = useState('');

  useEffect(() => {
    const contextTenantId = getTenantId();
    setTenantIdState(contextTenantId || '00000000-0000-0000-0000-000000000000');
  }, []);

  useEffect(() => {
    if (tenantId) {
      fetchData();
    }
  }, [tenantId, activeTab, runsPage]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      if (activeTab === 'queries') {
        const data = await HuntingAPI.getSavedQueries({
          pageNumber: 1,
          pageSize: 100,
        });
        setQueries(data.items || data || []);
      } else if (activeTab === 'scheduled') {
        const data = await HuntingAPI.getScheduledHunts({
          pageNumber: 1,
          pageSize: 100,
        });
        setScheduledHunts(data.items || data || []);
      } else if (activeTab === 'runs') {
        const mockRuns: HuntRun[] = [];
        setHuntRuns(mockRuns);
        setTotalRuns(0);
      }
    } catch (err) {
      setError(t('common.error'));
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      if (editingQuery) {
        await HuntingAPI.updateSavedQuery(editingQuery.id, {
          userId,
          ...queryForm,
        });
        setSuccess('Query updated successfully');
      } else {
        await HuntingAPI.createSavedQuery({
          userId,
          ...queryForm,
        });
        setSuccess('Query created successfully');
      }

      setShowQueryModal(false);
      setEditingQuery(null);
      setQueryForm({
        name: '',
        description: '',
        oqlExpression: '',
        datasetType: DATASET_TYPES[0],
      });
      fetchData();
    } catch (err) {
      setError(t('common.error'));
    }
  };

  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const scheduleData = {
        userId,
        name: scheduleForm.name,
        queryId: scheduleForm.queryId,
        scheduleSpec: scheduleForm.scheduleSpec === 'Custom' ? scheduleForm.customCron : scheduleForm.scheduleSpec,
        isEnabled: scheduleForm.isEnabled,
      };

      if (editingSchedule) {
        await HuntingAPI.updateScheduledHunt(editingSchedule.id, scheduleData);
        setSuccess('Schedule updated successfully');
      } else {
        await HuntingAPI.createScheduledHunt(scheduleData);
        setSuccess('Schedule created successfully');
      }

      setShowScheduleModal(false);
      setEditingSchedule(null);
      setScheduleForm({
        name: '',
        queryId: '',
        scheduleSpec: 'Daily',
        customCron: '',
        isEnabled: true,
      });
      fetchData();
    } catch (err) {
      setError(t('common.error'));
    }
  };

  const handleDeleteQuery = async (id: string) => {
    if (!confirm('Are you sure you want to delete this query?')) return;
    try {
      await HuntingAPI.deleteSavedQuery(id);
      setSuccess('Query deleted successfully');
      fetchData();
    } catch (err) {
      setError(t('common.error'));
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    if (!confirm('Are you sure you want to delete this scheduled hunt?')) return;
    try {
      await HuntingAPI.deleteScheduledHunt(id);
      setSuccess('Scheduled hunt deleted successfully');
      fetchData();
    } catch (err) {
      setError(t('common.error'));
    }
  };

  const handleToggleSchedule = async (hunt: ScheduledHunt) => {
    try {
      await HuntingAPI.updateScheduledHunt(hunt.id, {
        userId,
        name: hunt.name,
        queryId: hunt.queryId,
        scheduleSpec: hunt.scheduleSpec,
        isEnabled: !hunt.isEnabled
      });
      fetchData();
    } catch (err) {
      setError(t('common.error'));
    }
  };

  const handleRunNow = async (huntId: string) => {
    try {
      const hunt = scheduledHunts.find(h => h.id === huntId);
      if (hunt) {
        const query = queries.find(q => q.id === hunt.queryId);
        if (query) {
          await HuntingAPI.executeQuery(query.oqlExpression);
          setSuccess('Hunt run triggered successfully');
          setActiveTab('runs');
          fetchData();
        }
      }
    } catch (err) {
      setError(t('common.error'));
    }
  };

  const handleEditQuery = (query: SavedQuery) => {
    setEditingQuery(query);
    setQueryForm({
      name: query.name,
      description: query.description,
      oqlExpression: query.oqlExpression,
      datasetType: query.datasetType,
    });
    setShowQueryModal(true);
  };

  const handleEditSchedule = (schedule: ScheduledHunt) => {
    setEditingSchedule(schedule);
    const isCustom = !['Hourly', 'Daily', 'Weekly'].includes(schedule.scheduleSpec);
    setScheduleForm({
      name: schedule.name,
      queryId: schedule.queryId,
      scheduleSpec: isCustom ? 'Custom' : schedule.scheduleSpec,
      customCron: isCustom ? schedule.scheduleSpec : '',
      isEnabled: schedule.isEnabled,
    });
    setShowScheduleModal(true);
  };

  const handleBuildQuery = () => {
    if (builderField && builderValue) {
      const newClause = `${builderField} ${builderOperator} "${builderValue}"`;
      setBuilderQuery(builderQuery ? `${builderQuery} AND ${newClause}` : newClause);
      setBuilderField('');
      setBuilderValue('');
    }
  };

  const handleSaveBuiltQuery = () => {
    if (builderQuery) {
      setQueryForm({
        name: '',
        description: '',
        oqlExpression: builderQuery,
        datasetType: builderDataset,
      });
      setShowQueryModal(true);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Succeeded': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'Failed': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'Running': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'Cancelled': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      default: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Succeeded': return <CheckCircle className="w-4 h-4" />;
      case 'Failed': return <XCircle className="w-4 h-4" />;
      case 'Running': return <Activity className="w-4 h-4 animate-pulse" />;
      case 'Cancelled': return <AlertTriangle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString();
  };

  const tabs = [
    { id: 'queries' as Tab, label: 'Saved Queries', icon: FileSearch },
    { id: 'scheduled' as Tab, label: 'Scheduled Hunts', icon: Calendar },
    { id: 'runs' as Tab, label: 'Hunt Runs', icon: Activity },
    { id: 'builder' as Tab, label: 'Query Builder', icon: Code },
  ];

  const enabledHunts = scheduledHunts.filter(h => h.isEnabled).length;
  const successfulRuns = huntRuns.filter(r => r.status === 'Succeeded').length;
  const totalMatches = huntRuns.reduce((sum, r) => sum + r.matchCount, 0);

  if (loading && !queries.length && !scheduledHunts.length && !huntRuns.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-gray-600 dark:text-gray-300">{t('common.loading')}</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 p-8">
      <Helmet>
        <title>Threat Hunting - Security Analysis</title>
      </Helmet>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center mb-8"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl shadow-lg">
            <Crosshair className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Threat Hunting</h1>
            <p className="text-gray-500 dark:text-gray-400">Proactive security analysis and threat detection</p>
          </div>
        </div>
        <div className="flex gap-3">
          {activeTab === 'queries' && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setEditingQuery(null);
                setQueryForm({
                  name: '',
                  description: '',
                  oqlExpression: '',
                  datasetType: DATASET_TYPES[0],
                });
                setShowQueryModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Plus className="w-5 h-5" />
              Create Query
            </motion.button>
          )}
          {activeTab === 'scheduled' && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setEditingSchedule(null);
                setScheduleForm({
                  name: '',
                  queryId: '',
                  scheduleSpec: 'Daily',
                  customCron: '',
                  isEnabled: true,
                });
                setShowScheduleModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Plus className="w-5 h-5" />
              Schedule Hunt
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Saved Queries"
          value={queries.length}
          icon={<FileSearch className="w-6 h-6 text-white" />}
          color="from-blue-500 to-cyan-600"
          delay={0}
        />
        <StatCard
          title="Scheduled Hunts"
          value={`${enabledHunts}/${scheduledHunts.length}`}
          icon={<Calendar className="w-6 h-6 text-white" />}
          color="from-purple-500 to-indigo-600"
          delay={1}
        />
        <StatCard
          title="Hunt Runs"
          value={huntRuns.length}
          icon={<Activity className="w-6 h-6 text-white" />}
          color="from-green-500 to-emerald-600"
          delay={2}
        />
        <StatCard
          title="Total Matches"
          value={totalMatches}
          icon={<Target className="w-6 h-6 text-white" />}
          color="from-orange-500 to-red-600"
          delay={3}
        />
      </div>

      {/* Alerts */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl flex items-center gap-2"
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
            className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-xl flex items-center gap-2"
          >
            <CheckCircle className="w-5 h-5" />
            {success}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tab Navigation */}
      <div className="mb-6 border-b border-gray-200 dark:border-slate-700">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative py-4 px-1 flex items-center gap-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'text-indigo-600 dark:text-indigo-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeHuntingTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-600"
                />
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Saved Queries Tab */}
      {activeTab === 'queries' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
              <thead className="bg-gray-50 dark:bg-slate-900/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Dataset</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">OQL Expression</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                {queries.map((query, index) => (
                  <motion.tr
                    key={query.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                          <Search className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{query.name}</div>
                          {query.description && (
                            <div className="text-sm text-gray-500 dark:text-gray-400">{query.description}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                        {query.datasetType}
                      </span>
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <code className="text-sm text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded break-all">
                        {query.oqlExpression.length > 50
                          ? `${query.oqlExpression.substring(0, 50)}...`
                          : query.oqlExpression}
                      </code>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(query.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleEditQuery(query)}
                          className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDeleteQuery(query.id)}
                          className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
                {queries.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="p-4 rounded-full bg-gray-100 dark:bg-slate-700">
                          <FileSearch className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-500 dark:text-gray-400">No saved queries. Create one to get started.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Scheduled Hunts Tab */}
      {activeTab === 'scheduled' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
              <thead className="bg-gray-50 dark:bg-slate-900/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Query</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Schedule</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Next Run</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                {scheduledHunts.map((hunt, index) => (
                  <motion.tr
                    key={hunt.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                          <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{hunt.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {hunt.queryName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 flex items-center gap-1 w-fit">
                        <Clock className="w-3 h-3" />
                        {hunt.scheduleSpec}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${
                        hunt.isEnabled
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {hunt.isEnabled ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {hunt.isEnabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {hunt.isEnabled ? formatDate(hunt.nextRunAt) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleRunNow(hunt.id)}
                          className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                          title="Run Now"
                        >
                          <Play className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleToggleSchedule(hunt)}
                          className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors"
                          title={hunt.isEnabled ? 'Disable' : 'Enable'}
                        >
                          {hunt.isEnabled ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleEditSchedule(hunt)}
                          className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDeleteSchedule(hunt.id)}
                          className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
                {scheduledHunts.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="p-4 rounded-full bg-gray-100 dark:bg-slate-700">
                          <Calendar className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-500 dark:text-gray-400">No scheduled hunts. Create one to automate threat hunting.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Hunt Runs Tab */}
      {activeTab === 'runs' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
              <thead className="bg-gray-50 dark:bg-slate-900/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Hunt</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Dataset</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Started</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Matches</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                {huntRuns.map((run, index) => (
                  <motion.tr
                    key={run.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                          <Zap className="w-4 h-4 text-green-600 dark:text-green-400" />
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{run.huntName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                        {run.datasetType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(run.startedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${getStatusColor(run.status)}`}>
                        {getStatusIcon(run.status)}
                        {run.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-semibold ${run.matchCount > 0 ? 'text-orange-600 dark:text-orange-400' : 'text-gray-500 dark:text-gray-400'}`}>
                        {run.matchCount}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {run.errorMessage ? (
                        <span className="text-red-600 dark:text-red-400 flex items-center gap-1">
                          <AlertTriangle className="w-4 h-4" />
                          {run.errorMessage}
                        </span>
                      ) : run.completedAt ? (
                        `Completed: ${formatDate(run.completedAt)}`
                      ) : (
                        <span className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                          In progress...
                        </span>
                      )}
                    </td>
                  </motion.tr>
                ))}
                {huntRuns.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="p-4 rounded-full bg-gray-100 dark:bg-slate-700">
                          <Activity className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-500 dark:text-gray-400">No hunt runs yet. Schedule a hunt or run one manually.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {totalRuns > 20 && (
            <div className="px-6 py-4 flex justify-between items-center border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setRunsPage(p => Math.max(1, p - 1))}
                disabled={runsPage === 1}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                {t('common.previous')}
              </motion.button>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {t('common.page')} {runsPage} / {Math.ceil(totalRuns / 20)}
              </span>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setRunsPage(p => p + 1)}
                disabled={runsPage >= Math.ceil(totalRuns / 20)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
              >
                {t('common.next')}
                <ChevronRight className="w-4 h-4" />
              </motion.button>
            </div>
          )}
        </motion.div>
      )}

      {/* Query Builder Tab */}
      {activeTab === 'builder' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                <Code className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Build OQL Query</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Dataset</label>
                <select
                  className="w-full border border-gray-300 dark:border-slate-600 rounded-xl px-4 py-3 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  value={builderDataset}
                  onChange={(e) => setBuilderDataset(e.target.value)}
                >
                  {DATASET_TYPES.map((dt) => (
                    <option key={dt} value={dt}>{dt}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Field</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 dark:border-slate-600 rounded-xl px-4 py-3 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  value={builderField}
                  onChange={(e) => setBuilderField(e.target.value)}
                  placeholder="e.g., ipAddress, userId"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Operator</label>
                <select
                  className="w-full border border-gray-300 dark:border-slate-600 rounded-xl px-4 py-3 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  value={builderOperator}
                  onChange={(e) => setBuilderOperator(e.target.value)}
                >
                  <option value="==">Equals (==)</option>
                  <option value="!=">Not Equals (!=)</option>
                  <option value="contains">Contains</option>
                  <option value="startswith">Starts With</option>
                  <option value="endswith">Ends With</option>
                  <option value=">">Greater Than (&gt;)</option>
                  <option value="<">Less Than (&lt;)</option>
                  <option value=">=">Greater or Equal (&gt;=)</option>
                  <option value="<=">Less or Equal (&lt;=)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Value</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 dark:border-slate-600 rounded-xl px-4 py-3 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  value={builderValue}
                  onChange={(e) => setBuilderValue(e.target.value)}
                  placeholder="Value to match"
                />
              </div>
            </div>

            <div className="flex gap-3 mb-6">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleBuildQuery}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!builderField || !builderValue}
              >
                <Plus className="w-4 h-4" />
                Add Condition
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setBuilderQuery('')}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
              >
                <XCircle className="w-4 h-4" />
                Clear
              </motion.button>
            </div>

            {builderQuery && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mb-6"
              >
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Generated Query</label>
                <div className="bg-gradient-to-r from-slate-100 to-gray-100 dark:from-slate-700 dark:to-slate-800 p-4 rounded-xl border border-gray-200 dark:border-slate-600">
                  <code className="text-sm text-gray-800 dark:text-gray-200 break-all font-mono">{builderQuery}</code>
                </div>
              </motion.div>
            )}

            <div className="flex justify-end">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSaveBuiltQuery}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!builderQuery}
              >
                <CheckCircle className="w-4 h-4" />
                Save as Query
              </motion.button>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <HelpCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">OQL Syntax Help</h3>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300 space-y-3">
              <p><strong>Basic syntax:</strong> <code className="bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded">field operator "value"</code></p>
              <p><strong>Combine conditions:</strong> Use <code className="bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded">AND</code> or <code className="bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded">OR</code></p>
              <div>
                <strong>Examples:</strong>
                <ul className="list-disc list-inside ml-4 space-y-1 mt-2">
                  <li><code className="bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded">ipAddress == "192.168.1.1"</code></li>
                  <li><code className="bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded">riskLevel &gt; 5 AND location contains "Unknown"</code></li>
                  <li><code className="bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded">eventType == "FailedLogin" AND attempts &gt;= 3</code></li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Create/Edit Query Modal */}
      <Modal
        isOpen={showQueryModal}
        onClose={() => {
          setShowQueryModal(false);
          setEditingQuery(null);
        }}
        title={editingQuery ? 'Edit Query' : 'Create Query'}
      >
        <form onSubmit={handleCreateQuery} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Name</label>
            <input
              type="text"
              required
              className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              value={queryForm.name}
              onChange={(e) => setQueryForm({ ...queryForm, name: e.target.value })}
              placeholder="Query name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
            <textarea
              className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              value={queryForm.description}
              onChange={(e) => setQueryForm({ ...queryForm, description: e.target.value })}
              placeholder="Optional description"
              rows={2}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Dataset</label>
            <select
              className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              value={queryForm.datasetType}
              onChange={(e) => setQueryForm({ ...queryForm, datasetType: e.target.value })}
            >
              {DATASET_TYPES.map((dt) => (
                <option key={dt} value={dt}>{dt}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">OQL Expression</label>
            <textarea
              required
              className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              rows={4}
              value={queryForm.oqlExpression}
              onChange={(e) => setQueryForm({ ...queryForm, oqlExpression: e.target.value })}
              placeholder='e.g., riskLevel > 5 AND eventType == "FailedLogin"'
            />
          </div>
          <div className="flex gap-3 justify-end pt-4">
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setShowQueryModal(false);
                setEditingQuery(null);
              }}
              className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
            >
              {t('common.cancel')}
            </motion.button>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {editingQuery ? 'Update' : 'Create'}
            </motion.button>
          </div>
        </form>
      </Modal>

      {/* Create/Edit Schedule Modal */}
      <Modal
        isOpen={showScheduleModal}
        onClose={() => {
          setShowScheduleModal(false);
          setEditingSchedule(null);
        }}
        title={editingSchedule ? 'Edit Scheduled Hunt' : 'Create Scheduled Hunt'}
      >
        <form onSubmit={handleCreateSchedule} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Name</label>
            <input
              type="text"
              required
              className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              value={scheduleForm.name}
              onChange={(e) => setScheduleForm({ ...scheduleForm, name: e.target.value })}
              placeholder="Schedule name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Query</label>
            <select
              required
              className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              value={scheduleForm.queryId}
              onChange={(e) => setScheduleForm({ ...scheduleForm, queryId: e.target.value })}
            >
              <option value="">Select a query...</option>
              {queries.map((q) => (
                <option key={q.id} value={q.id}>{q.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Schedule</label>
            <select
              className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              value={scheduleForm.scheduleSpec}
              onChange={(e) => setScheduleForm({ ...scheduleForm, scheduleSpec: e.target.value })}
            >
              {SCHEDULE_SPECS.map((spec) => (
                <option key={spec.value} value={spec.value}>{spec.label}</option>
              ))}
            </select>
          </div>
          {scheduleForm.scheduleSpec === 'Custom' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
            >
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Custom Cron Expression</label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white font-mono focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                value={scheduleForm.customCron}
                onChange={(e) => setScheduleForm({ ...scheduleForm, customCron: e.target.value })}
                placeholder="0 */6 * * *"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Cron format: minute hour day month weekday
              </p>
            </motion.div>
          )}
          <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
            <input
              type="checkbox"
              id="enableSchedule"
              className="w-5 h-5 text-indigo-600 border-gray-300 dark:border-slate-600 rounded focus:ring-indigo-500"
              checked={scheduleForm.isEnabled}
              onChange={(e) => setScheduleForm({ ...scheduleForm, isEnabled: e.target.checked })}
            />
            <label htmlFor="enableSchedule" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Enable immediately
            </label>
          </div>
          <div className="flex gap-3 justify-end pt-4">
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setShowScheduleModal(false);
                setEditingSchedule(null);
              }}
              className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
            >
              {t('common.cancel')}
            </motion.button>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {editingSchedule ? 'Update' : 'Create'}
            </motion.button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
