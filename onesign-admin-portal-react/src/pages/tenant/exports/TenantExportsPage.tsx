import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getTenantId } from '@/lib/tenant-context';
import { tenantService } from '@/lib/api/services/tenant.service';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import Modal from '@/components/common/Modal';
import {
  Download,
  Upload,
  FileSpreadsheet,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  Mail,
  Filter,
  FileJson,
  FileText,
  Table,
  PlayCircle,
  PauseCircle,
  Copy,
  LayoutTemplate,
  History,
} from 'lucide-react';

interface ExportJob {
  id: string;
  name: string;
  dataType: string;
  fileType: 'csv' | 'json' | 'xlsx';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  totalRecords: number;
  fileSize?: string;
  downloadUrl?: string;
  expiresAt?: string;
  createdBy: string;
  createdAt: string;
  completedAt?: string;
  filters?: ExportFilter[];
}

interface ExportFilter {
  field: string;
  operator: string;
  value: string;
}

interface ExportTemplate {
  id: string;
  name: string;
  dataType: string;
  fileType: 'csv' | 'json' | 'xlsx';
  fields: string[];
  filters: ExportFilter[];
  createdAt: string;
}

interface ScheduledExport {
  id: string;
  name: string;
  templateId: string;
  schedule: string;
  nextRunAt: string;
  lastRunAt?: string;
  isActive: boolean;
  emailRecipients: string[];
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  delay: number;
}

// Mock data for fallback
const mockExportsFallback: ExportJob[] = [
  {
    id: '1',
    name: 'All Users Export',
    dataType: 'Users',
    fileType: 'csv',
    status: 'completed',
    totalRecords: 1543,
    fileSize: '245 KB',
    downloadUrl: '/downloads/users_export_1.csv',
    expiresAt: '2025-11-30T10:00:00Z',
    createdBy: 'admin@example.com',
    createdAt: '2025-11-23T10:00:00Z',
    completedAt: '2025-11-23T10:02:15Z',
  },
  {
    id: '2',
    name: 'Active Applications',
    dataType: 'Applications',
    fileType: 'json',
    status: 'completed',
    totalRecords: 89,
    fileSize: '156 KB',
    downloadUrl: '/downloads/applications_export_2.json',
    expiresAt: '2025-11-30T11:30:00Z',
    createdBy: 'admin@example.com',
    createdAt: '2025-11-23T11:30:00Z',
    completedAt: '2025-11-23T11:31:45Z',
    filters: [{ field: 'status', operator: 'equals', value: 'active' }],
  },
  {
    id: '3',
    name: 'Roles with Permissions',
    dataType: 'Roles',
    fileType: 'xlsx',
    status: 'processing',
    totalRecords: 0,
    createdBy: 'admin@example.com',
    createdAt: '2025-11-23T11:45:00Z',
  },
  {
    id: '4',
    name: 'Audit Logs',
    dataType: 'AuditLogs',
    fileType: 'csv',
    status: 'failed',
    totalRecords: 0,
    createdBy: 'admin@example.com',
    createdAt: '2025-11-23T09:00:00Z',
    completedAt: '2025-11-23T09:01:30Z',
  },
];

const mockTemplatesFallback: ExportTemplate[] = [
  {
    id: 't1',
    name: 'User Export - Full Details',
    dataType: 'Users',
    fileType: 'csv',
    fields: ['id', 'email', 'firstName', 'lastName', 'status', 'createdAt'],
    filters: [],
    createdAt: '2025-10-15T12:00:00Z',
  },
  {
    id: 't2',
    name: 'Active Users Only',
    dataType: 'Users',
    fileType: 'xlsx',
    fields: ['email', 'firstName', 'lastName', 'lastLoginAt'],
    filters: [{ field: 'status', operator: 'equals', value: 'active' }],
    createdAt: '2025-10-20T14:30:00Z',
  },
  {
    id: 't3',
    name: 'Application Summary',
    dataType: 'Applications',
    fileType: 'json',
    fields: ['name', 'clientId', 'type', 'createdAt'],
    filters: [],
    createdAt: '2025-10-25T09:00:00Z',
  },
];

const mockScheduledExportsFallback: ScheduledExport[] = [
  {
    id: 's1',
    name: 'Weekly User Report',
    templateId: 't1',
    schedule: 'Every Monday at 8:00 AM',
    nextRunAt: '2025-11-25T08:00:00Z',
    lastRunAt: '2025-11-18T08:00:00Z',
    isActive: true,
    emailRecipients: ['admin@example.com', 'reports@example.com'],
  },
  {
    id: 's2',
    name: 'Daily Active Users',
    templateId: 't2',
    schedule: 'Daily at 6:00 AM',
    nextRunAt: '2025-11-24T06:00:00Z',
    lastRunAt: '2025-11-23T06:00:00Z',
    isActive: true,
    emailRecipients: ['admin@example.com'],
  },
];

const dataTypes = ['Users', 'Applications', 'Roles', 'OrgUnits', 'AuditLogs', 'Sessions'];
const fileTypes = ['csv', 'json', 'xlsx'];

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

const getFileTypeIcon = (fileType: string) => {
  switch (fileType) {
    case 'csv': return <FileText className="w-4 h-4" />;
    case 'json': return <FileJson className="w-4 h-4" />;
    case 'xlsx': return <Table className="w-4 h-4" />;
    default: return <FileText className="w-4 h-4" />;
  }
};

export default function TenantExportsPage() {
  const { t } = useTranslation();
  const [exports, setExports] = useState<ExportJob[]>([]);
  const [templates, setTemplates] = useState<ExportTemplate[]>([]);
  const [scheduledExports, setScheduledExports] = useState<ScheduledExport[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tenantId, setTenantIdState] = useState<string | null>(null);

  // Form states
  const [exportName, setExportName] = useState('');
  const [selectedDataType, setSelectedDataType] = useState('Users');
  const [selectedFileType, setSelectedFileType] = useState<'csv' | 'json' | 'xlsx'>('csv');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [filters, setFilters] = useState<ExportFilter[]>([]);
  const [emailOnComplete, setEmailOnComplete] = useState(false);
  const [emailAddress, setEmailAddress] = useState('');
  const [templateName, setTemplateName] = useState('');

  const availableFields: Record<string, string[]> = {
    Users: ['id', 'email', 'firstName', 'lastName', 'status', 'createdAt', 'lastLoginAt'],
    Applications: ['id', 'name', 'clientId', 'type', 'redirectUris', 'createdAt'],
    Roles: ['id', 'name', 'description', 'permissions', 'createdAt'],
    OrgUnits: ['id', 'name', 'parentId', 'path', 'createdAt'],
    AuditLogs: ['id', 'userId', 'action', 'resource', 'timestamp', 'ipAddress'],
    Sessions: ['id', 'userId', 'ipAddress', 'device', 'loginAt', 'lastActivityAt'],
  };

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
      fetchExports();
      fetchTemplates();
      fetchScheduledExports();
    }
  }, [tenantId]);

  useEffect(() => {
    setSelectedFields(availableFields[selectedDataType] || []);
  }, [selectedDataType]);

  const fetchExports = async () => {
    if (!tenantId) return;

    try {
      const data = await tenantService.getExportJobs(tenantId);
      setExports(data || mockExportsFallback);
    } catch (error: any) {
      console.error('Error fetching exports:', error);
      setError(error?.message || t('common.failedToLoadExports'));
      setExports(mockExportsFallback);
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    if (!tenantId) return;

    try {
      const data = await tenantService.getExportTemplates(tenantId);
      setTemplates(data || mockTemplatesFallback);
    } catch (error: any) {
      console.error('Error fetching templates:', error);
      setTemplates(mockTemplatesFallback);
    }
  };

  const fetchScheduledExports = async () => {
    if (!tenantId) return;

    try {
      const data = await tenantService.getScheduledExports(tenantId);
      setScheduledExports(data || mockScheduledExportsFallback);
    } catch (error: any) {
      console.error('Error fetching scheduled exports:', error);
      setScheduledExports(mockScheduledExportsFallback);
    }
  };

  const handleCreateExport = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!tenantId) return;

    try {
      await tenantService.createExportJob(tenantId, {
        name: exportName,
        dataType: selectedDataType,
        fileType: selectedFileType,
        fields: selectedFields,
        filters: filters.length > 0 ? filters : undefined,
        emailOnComplete,
        emailAddress: emailOnComplete ? emailAddress : undefined,
      });
      setSuccess(t('tenant.exports.messages.created'));
      setShowCreateModal(false);
      resetForm();
      fetchExports();
    } catch (error: any) {
      setError(error?.message || t('tenant.exports.messages.failedToCreate'));
      console.error('Error creating export:', error);
    }
  };

  const handleDownload = async (exportJob: ExportJob) => {
    if (!exportJob.downloadUrl) return;

    try {
      setSuccess(t('tenant.exports.messages.downloading', { name: exportJob.name }));
      window.open(exportJob.downloadUrl, '_blank');
    } catch (error: any) {
      setError(error?.message || t('tenant.exports.messages.failedToDownload'));
    }
  };

  const handleDeleteExport = async (exportId: string) => {
    if (!confirm(t('tenant.exports.confirmDelete'))) return;
    if (!tenantId) return;

    setError('');
    setSuccess('');

    try {
      await tenantService.deleteExportJob(tenantId, exportId);
      setSuccess(t('tenant.exports.messages.deleted'));
      fetchExports();
    } catch (error: any) {
      setError(error?.message || t('tenant.exports.messages.failedToDelete'));
    }
  };

  const handleSaveTemplate = async () => {
    if (!tenantId) return;
    setError('');
    setSuccess('');

    try {
      await tenantService.createExportTemplate(tenantId, {
        name: templateName,
        dataType: selectedDataType,
        fileType: selectedFileType,
        fields: selectedFields,
        filters: filters.length > 0 ? filters : undefined,
      });
      setSuccess(t('tenant.exports.messages.templateSaved'));
      setShowTemplateModal(false);
      fetchTemplates();
    } catch (error: any) {
      setError(error?.message || t('tenant.exports.messages.failedToSaveTemplate'));
    }
  };

  const handleToggleSchedule = async (scheduleId: string) => {
    if (!tenantId) return;
    setError('');
    setSuccess('');

    try {
      await tenantService.toggleScheduledExport(tenantId, scheduleId);
      setSuccess(t('tenant.exports.messages.scheduleUpdated'));
      fetchScheduledExports();
    } catch (error: any) {
      setError(error?.message || t('tenant.exports.messages.failedToUpdateSchedule'));
    }
  };

  const addFilter = () => {
    setFilters([...filters, { field: '', operator: 'equals', value: '' }]);
  };

  const removeFilter = (index: number) => {
    setFilters(filters.filter((_, i) => i !== index));
  };

  const updateFilter = (index: number, field: keyof ExportFilter, value: string) => {
    const newFilters = [...filters];
    newFilters[index][field] = value;
    setFilters(newFilters);
  };

  const toggleField = (field: string) => {
    setSelectedFields((prev) =>
      prev.includes(field) ? prev.filter((f) => f !== field) : [...prev, field]
    );
  };

  const resetForm = () => {
    setExportName('');
    setSelectedDataType('Users');
    setSelectedFileType('csv');
    setSelectedTemplate('');
    setSelectedFields(availableFields['Users']);
    setFilters([]);
    setEmailOnComplete(false);
    setEmailAddress('');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      failed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    };
    return styles[status as keyof typeof styles] || styles.pending;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'failed': return <XCircle className="w-4 h-4" />;
      case 'processing': return <Clock className="w-4 h-4 animate-spin" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const completedExports = exports.filter(e => e.status === 'completed').length;
  const processingExports = exports.filter(e => e.status === 'processing').length;
  const activeSchedules = scheduledExports.filter(s => s.isActive).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-gray-600 dark:text-gray-300">Loading exports...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 p-8">
      <Helmet>
        <title>{t('tenant.exports.pageTitle')}</title>
      </Helmet>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center mb-8"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg">
            <Download className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('tenant.exports.title')}</h1>
            <p className="text-gray-500 dark:text-gray-400">{t('tenant.exports.subtitle')}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowScheduleModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-sm hover:shadow-md transition-all duration-300"
          >
            <Calendar className="w-5 h-5 text-green-600 dark:text-green-400" />
            <span className="text-gray-700 dark:text-gray-300">{t('tenant.exports.buttons.scheduled')}</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Plus className="w-5 h-5" />
            {t('tenant.exports.buttons.create')}
          </motion.button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Exports"
          value={exports.length}
          icon={<FileSpreadsheet className="w-6 h-6 text-white" />}
          color="from-blue-500 to-cyan-600"
          delay={0}
        />
        <StatCard
          title="Completed"
          value={completedExports}
          icon={<CheckCircle className="w-6 h-6 text-white" />}
          color="from-green-500 to-emerald-600"
          delay={1}
        />
        <StatCard
          title="Templates"
          value={templates.length}
          icon={<LayoutTemplate className="w-6 h-6 text-white" />}
          color="from-purple-500 to-indigo-600"
          delay={2}
        />
        <StatCard
          title="Active Schedules"
          value={activeSchedules}
          icon={<Calendar className="w-6 h-6 text-white" />}
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

      {/* Export Templates */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6 mb-6"
      >
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
              <LayoutTemplate className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Export Templates</h2>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowTemplateModal(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Template
          </motion.button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {templates.map((template, index) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-gray-50 to-white dark:from-slate-700 dark:to-slate-800 border border-gray-200 dark:border-slate-600 rounded-xl p-4 hover:shadow-lg transition-all duration-300 cursor-pointer"
              onClick={() => {
                setSelectedTemplate(template.id);
                setSelectedDataType(template.dataType);
                setSelectedFileType(template.fileType);
                setSelectedFields(template.fields);
                setFilters(template.filters);
                setShowCreateModal(true);
              }}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                    {getFileTypeIcon(template.fileType)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{template.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{template.dataType}</p>
                  </div>
                </div>
                <span className="px-2 py-1 bg-gray-100 dark:bg-slate-600 text-gray-700 dark:text-gray-300 rounded text-xs font-medium">
                  {template.fileType.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <Table className="w-3 h-3" />
                  {template.fields.length} fields
                </span>
                <span className="flex items-center gap-1">
                  <Filter className="w-3 h-3" />
                  {template.filters.length} filters
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Export History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
            <History className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Export History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
            <thead className="bg-gray-50 dark:bg-slate-900/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Data Type</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Format</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Records</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Size</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Created</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
              {exports.map((exportJob, index) => (
                <motion.tr
                  key={exportJob.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                        <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{exportJob.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{exportJob.dataType}</td>
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-slate-600 text-gray-700 dark:text-gray-300 rounded text-xs font-medium w-fit">
                      {getFileTypeIcon(exportJob.fileType)}
                      {exportJob.fileType.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium w-fit ${getStatusBadge(exportJob.status)}`}>
                      {getStatusIcon(exportJob.status)}
                      {exportJob.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {exportJob.totalRecords > 0 ? exportJob.totalRecords.toLocaleString() : '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{exportJob.fileSize || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {formatDate(exportJob.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex gap-2">
                      {exportJob.status === 'completed' && exportJob.downloadUrl && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDownload(exportJob)}
                          className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </motion.button>
                      )}
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDeleteExport(exportJob.id)}
                        className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {exports.length === 0 && (
          <div className="text-center py-12">
            <div className="flex flex-col items-center gap-3">
              <div className="p-4 rounded-full bg-gray-100 dark:bg-slate-700">
                <FileSpreadsheet className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 dark:text-gray-400">No export history found. Create your first export to get started.</p>
            </div>
          </div>
        )}
      </motion.div>

      {/* Create Export Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          resetForm();
        }}
        title="Create Export"
        size="lg"
      >
        <form onSubmit={handleCreateExport} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Export Name *</label>
            <input
              type="text"
              required
              className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              placeholder="e.g., All Active Users"
              value={exportName}
              onChange={(e) => setExportName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Data Type *</label>
              <select
                className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                value={selectedDataType}
                onChange={(e) => setSelectedDataType(e.target.value)}
              >
                {dataTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">File Format *</label>
              <select
                className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                value={selectedFileType}
                onChange={(e) => setSelectedFileType(e.target.value as any)}
              >
                {fileTypes.map((type) => (
                  <option key={type} value={type}>{type.toUpperCase()}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Fields to Export *</label>
            <div className="border border-gray-200 dark:border-slate-600 rounded-xl p-4 max-h-40 overflow-y-auto bg-gray-50 dark:bg-slate-700/50">
              <div className="grid grid-cols-2 gap-2">
                {availableFields[selectedDataType]?.map((field) => (
                  <label key={field} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedFields.includes(field)}
                      onChange={() => toggleField(field)}
                      className="rounded border-gray-300 dark:border-slate-500 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{field}</span>
                  </label>
                ))}
              </div>
            </div>
            {selectedFields.length === 0 && (
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">Select at least one field</p>
            )}
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Filters (optional)</label>
              <button
                type="button"
                onClick={addFilter}
                className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Add Filter
              </button>
            </div>
            {filters.map((filter, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="flex gap-2 mb-2"
              >
                <select
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                  value={filter.field}
                  onChange={(e) => updateFilter(index, 'field', e.target.value)}
                >
                  <option value="">Select field</option>
                  {availableFields[selectedDataType]?.map((field) => (
                    <option key={field} value={field}>{field}</option>
                  ))}
                </select>
                <select
                  className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                  value={filter.operator}
                  onChange={(e) => updateFilter(index, 'operator', e.target.value)}
                >
                  <option value="equals">Equals</option>
                  <option value="contains">Contains</option>
                  <option value="greater_than">Greater than</option>
                  <option value="less_than">Less than</option>
                </select>
                <input
                  type="text"
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                  placeholder="Value"
                  value={filter.value}
                  onChange={(e) => updateFilter(index, 'value', e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => removeFilter(index)}
                  className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </motion.div>
            ))}
          </div>

          <div className="border-t border-gray-200 dark:border-slate-600 pt-4">
            <label className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-xl cursor-pointer">
              <input
                type="checkbox"
                checked={emailOnComplete}
                onChange={(e) => setEmailOnComplete(e.target.checked)}
                className="rounded border-gray-300 dark:border-slate-500 text-indigo-600 focus:ring-indigo-500"
              />
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Email download link when complete</span>
              </div>
            </label>
            {emailOnComplete && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-2"
              >
                <input
                  type="email"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="recipient@example.com"
                  value={emailAddress}
                  onChange={(e) => setEmailAddress(e.target.value)}
                />
              </motion.div>
            )}
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowTemplateModal(true)}
              className="px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-xl hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors flex items-center gap-2"
            >
              <Copy className="w-4 h-4" />
              Save as Template
            </motion.button>
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setShowCreateModal(false);
                resetForm();
              }}
              className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
            >
              Cancel
            </motion.button>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={selectedFields.length === 0}
              className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create Export
            </motion.button>
          </div>
        </form>
      </Modal>

      {/* Template Modal */}
      <Modal
        isOpen={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        title="Save as Template"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Template Name *</label>
            <input
              type="text"
              required
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              placeholder="e.g., Monthly User Report"
            />
          </div>
          <div className="flex gap-3 justify-end pt-4">
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowTemplateModal(false)}
              className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
            >
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSaveTemplate}
              className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Save Template
            </motion.button>
          </div>
        </div>
      </Modal>

      {/* Scheduled Exports Modal */}
      <Modal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        title="Scheduled Exports"
        size="xl"
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
            <thead className="bg-gray-50 dark:bg-slate-900/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Schedule</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Next Run</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Last Run</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Recipients</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
              {scheduledExports.map((schedule) => (
                <tr key={schedule.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-indigo-500" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{schedule.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{schedule.schedule}</td>
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {formatDate(schedule.nextRunAt)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {schedule.lastRunAt ? formatDate(schedule.lastRunAt) : 'Never'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {schedule.emailRecipients.length} recipients
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggleSchedule(schedule.id)}
                      className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        schedule.isActive
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {schedule.isActive ? <PlayCircle className="w-3 h-3" /> : <PauseCircle className="w-3 h-3" />}
                      {schedule.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </motion.button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {scheduledExports.length === 0 && (
            <div className="text-center py-8">
              <div className="flex flex-col items-center gap-3">
                <div className="p-4 rounded-full bg-gray-100 dark:bg-slate-700">
                  <Calendar className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 dark:text-gray-400">No scheduled exports configured.</p>
              </div>
            </div>
          )}
        </div>
        <div className="flex justify-end mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowScheduleModal(false)}
            className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
          >
            Close
          </motion.button>
        </div>
      </Modal>
    </div>
  );
}
