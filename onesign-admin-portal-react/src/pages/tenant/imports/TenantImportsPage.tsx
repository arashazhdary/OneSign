import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { getTenantId } from '@/lib/tenant-context';
import { tenantService } from '@/lib/api/services/tenant.service';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import Modal from '@/components/common/Modal';
import {
  Upload,
  Download,
  FileSpreadsheet,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Plus,
  RotateCcw,
  Eye,
  Settings2,
  FileJson,
  FileText,
  Table,
  History,
  LayoutTemplate,
  ArrowRight,
  AlertCircle,
  FileUp,
  Loader2,
} from 'lucide-react';

interface ImportJob {
  id: string;
  fileName: string;
  fileType: 'csv' | 'json' | 'xlsx';
  dataType: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'validating';
  totalRecords: number;
  processedRecords: number;
  successfulRecords: number;
  failedRecords: number;
  validationErrors: ValidationError[];
  createdBy: string;
  createdAt: string;
  completedAt?: string;
  canRollback: boolean;
}

interface ValidationError {
  row: number;
  field: string;
  value: string;
  error: string;
}

interface FieldMapping {
  sourceField: string;
  targetField: string;
  required: boolean;
  dataType: string;
}

interface ImportTemplate {
  id: string;
  name: string;
  dataType: string;
  fileType: 'csv' | 'json' | 'xlsx';
  fieldMappings: FieldMapping[];
  downloadUrl?: string;
  createdAt: string;
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  delay: number;
}

export default function TenantImportsPage() {
  const { t } = useTranslation();
  const [imports, setImports] = useState<ImportJob[]>([]);
  const [templates, setTemplates] = useState<ImportTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showErrorsModal, setShowErrorsModal] = useState(false);
  const [showMappingModal, setShowMappingModal] = useState(false);
  const [selectedImport, setSelectedImport] = useState<ImportJob | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tenantId, setTenantIdState] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Form states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedDataType, setSelectedDataType] = useState('Users');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [fieldMappings, setFieldMappings] = useState<FieldMapping[]>([]);

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
      fetchImports();
      fetchTemplates();
    }
  }, [tenantId]);

  const fetchImports = async () => {
    if (!tenantId) return;

    try {
      const data = await tenantService.getImportJobs(tenantId);
      setImports(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error('Error fetching imports:', error);
      setError(error?.message || t('common.failedToLoadData'));
      setImports([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    if (!tenantId) return;

    try {
      const data = await tenantService.getImportTemplates(tenantId);
      setTemplates(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error('Error fetching templates:', error);
      setTemplates([]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      parseFilePreview(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setSelectedFile(file);
      parseFilePreview(file);
    }
  };

  const parseFilePreview = (file: File) => {
    setPreviewData([
      { Email: 'user1@example.com', FirstName: 'John', LastName: 'Doe', Phone: '+1234567890' },
      { Email: 'user2@example.com', FirstName: 'Jane', LastName: 'Smith', Phone: '+0987654321' },
      { Email: 'user3@example.com', FirstName: 'Bob', LastName: 'Johnson', Phone: '+1122334455' },
    ]);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!tenantId || !selectedFile) return;

    try {
      await tenantService.createImportJob(
        tenantId,
        selectedFile,
        selectedDataType,
        selectedTemplate || undefined,
        fieldMappings.length > 0 ? fieldMappings : undefined
      );
      setSuccess(t('tenant.imports.messages.uploadSuccess'));
      setShowUploadModal(false);
      resetUploadForm();
      fetchImports();
    } catch (error: any) {
      setError(error?.message || t('common.failedToUploadFile'));
      console.error('Error uploading file:', error);
    }
  };

  const handleRollback = async (importId: string) => {
    if (!tenantId) return;
    if (!confirm(t('tenant.imports.confirmRollback'))) return;

    setError('');
    setSuccess('');

    try {
      await tenantService.rollbackImport(tenantId, importId);
      setSuccess(t('tenant.imports.messages.rollbackSuccess'));
      fetchImports();
    } catch (error: any) {
      setError(error?.message || t('common.failedToRollbackImport'));
    }
  };

  const handleDownloadTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (!template) return;

    try {
      setSuccess(t('tenant.imports.messages.downloading', { name: template.name }));
      if (template.downloadUrl) {
        window.open(template.downloadUrl, '_blank');
      } else {
        const headers = template.fieldMappings.map(m => m.targetField).join(',');
        const sampleRow = template.fieldMappings.map(m => `[${m.dataType}]`).join(',');
        const csvContent = `${headers}\n${sampleRow}`;
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${template.name.toLowerCase().replace(/\s+/g, '_')}_template.${template.fileType}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error: any) {
      setError(error?.message || t('common.failedToDownloadTemplate'));
    }
  };

  const openPreviewModal = () => {
    if (!selectedFile) {
      setError(t('tenant.imports.errors.selectFile'));
      return;
    }
    setShowPreviewModal(true);
  };

  const openErrorsModal = (importJob: ImportJob) => {
    setSelectedImport(importJob);
    setShowErrorsModal(true);
  };

  const openMappingModal = () => {
    if (!selectedFile) {
      setError(t('tenant.imports.errors.selectFile'));
      return;
    }
    const headers = Object.keys(previewData[0] || {});
    setFieldMappings(
      headers.map((header) => ({
        sourceField: header,
        targetField: header.toLowerCase(),
        required: true,
        dataType: 'string',
      }))
    );
    setShowMappingModal(true);
  };

  const resetUploadForm = () => {
    setSelectedFile(null);
    setSelectedDataType('Users');
    setSelectedTemplate('');
    setPreviewData([]);
    setFieldMappings([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      validating: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      failed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    };
    return styles[status as keyof typeof styles] || styles.pending;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'failed': return <XCircle className="w-4 h-4" />;
      case 'processing': return <Loader2 className="w-4 h-4 animate-spin" />;
      case 'validating': return <Clock className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getProgressPercentage = (job: ImportJob) => {
    if (job.totalRecords === 0) return 0;
    return Math.round((job.processedRecords / job.totalRecords) * 100);
  };

  const totalRecordsImported = imports.reduce((sum, imp) => sum + imp.successfulRecords, 0);
  const completedImports = imports.filter(i => i.status === 'completed').length;
  const failedImports = imports.filter(i => i.status === 'failed').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-gray-600 dark:text-gray-300">{t('tenant.imports.loading')}</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 p-8">
      <Helmet>
        <title>{t('tenant.imports.title')} - {t('common.management')}</title>
      </Helmet>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center mb-8"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
            <Upload className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('tenant.imports.title')}</h1>
            <p className="text-gray-500 dark:text-gray-400">{t('tenant.imports.subtitle')}</p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <FileUp className="w-5 h-5" />
          {t('tenant.imports.uploadFile')}
        </motion.button>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title={t('tenant.imports.stats.totalImports')}
          value={imports.length}
          icon={<FileSpreadsheet className="w-6 h-6 text-white" />}
          color="from-blue-500 to-cyan-600"
          delay={0}
        />
        <StatCard
          title={t('tenant.imports.stats.recordsImported')}
          value={totalRecordsImported.toLocaleString()}
          icon={<CheckCircle className="w-6 h-6 text-white" />}
          color="from-green-500 to-emerald-600"
          delay={1}
        />
        <StatCard
          title={t('tenant.imports.stats.templates')}
          value={templates.length}
          icon={<LayoutTemplate className="w-6 h-6 text-white" />}
          color="from-purple-500 to-indigo-600"
          delay={2}
        />
        <StatCard
          title={t('tenant.imports.stats.failedImports')}
          value={failedImports}
          icon={<AlertTriangle className="w-6 h-6 text-white" />}
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

      {/* Import Templates */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6 mb-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
            <LayoutTemplate className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{t('tenant.imports.importTemplates')}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {templates.map((template, index) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-gray-50 to-white dark:from-slate-700 dark:to-slate-800 border border-gray-200 dark:border-slate-600 rounded-xl p-4 hover:shadow-lg transition-all duration-300"
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
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                {template.fieldMappings.length} fields mapped
              </p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleDownloadTemplate(template.id)}
                className="flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
              >
                <Download className="w-4 h-4" />
                {t('tenant.imports.downloadTemplate')}
              </motion.button>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Import History */}
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
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{t('tenant.imports.importHistory')}</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
            <thead className="bg-gray-50 dark:bg-slate-900/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('tenant.imports.table.fileName')}</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('tenant.imports.table.dataType')}</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('tenant.imports.table.status')}</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('tenant.imports.table.progress')}</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('tenant.imports.table.records')}</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('tenant.imports.table.created')}</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
              {imports.map((job, index) => {
                const progressPercentage = getProgressPercentage(job);
                return (
                  <motion.tr
                    key={job.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                          {getFileTypeIcon(job.fileType)}
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{job.fileName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{job.dataType}</td>
                    <td className="px-6 py-4">
                      <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium w-fit ${getStatusBadge(job.status)}`}>
                        {getStatusIcon(job.status)}
                        {job.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-32">
                        <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                          <span>{progressPercentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-slate-600 rounded-full h-2 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercentage}%` }}
                            transition={{ duration: 0.5, ease: 'easeOut' }}
                            className={`h-2 rounded-full ${
                              job.status === 'failed'
                                ? 'bg-red-500'
                                : job.status === 'completed'
                                ? 'bg-green-500'
                                : 'bg-indigo-500'
                            }`}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="space-y-1">
                        <p className="text-green-600 dark:text-green-400 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          {job.successfulRecords} {t('tenant.imports.status.success')}
                        </p>
                        {job.failedRecords > 0 && (
                          <p className="text-red-600 dark:text-red-400 flex items-center gap-1">
                            <XCircle className="w-3 h-3" />
                            {job.failedRecords} {t('tenant.imports.status.failed')}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {formatDate(job.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        {job.validationErrors.length > 0 && (
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => openErrorsModal(job)}
                            className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                            title="View Errors"
                          >
                            <AlertCircle className="w-4 h-4" />
                          </motion.button>
                        )}
                        {job.canRollback && job.status === 'completed' && (
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleRollback(job.id)}
                            className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors"
                            title="Rollback"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </motion.button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {imports.length === 0 && (
          <div className="text-center py-12">
            <div className="flex flex-col items-center gap-3">
              <div className="p-4 rounded-full bg-gray-100 dark:bg-slate-700">
                <FileSpreadsheet className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 dark:text-gray-400">{t('tenant.imports.noHistory')}</p>
            </div>
          </div>
        )}
      </motion.div>

      {/* Upload Modal */}
      <Modal
        isOpen={showUploadModal}
        onClose={() => {
          setShowUploadModal(false);
          resetUploadForm();
        }}
        title={t('tenant.imports.uploadModal.title')}
        size="lg"
      >
        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('tenant.imports.uploadModal.dataType')}</label>
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('tenant.imports.uploadModal.selectTemplate')}</label>
            <select
              className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
            >
              <option value="">{t('tenant.imports.uploadModal.noTemplate')}</option>
              {templates
                .filter((t) => t.dataType === selectedDataType)
                .map((template) => (
                  <option key={template.id} value={template.id}>{template.name}</option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('tenant.imports.uploadModal.uploadFile')}</label>
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                isDragging
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                  : 'border-gray-300 dark:border-slate-600 hover:border-indigo-400 dark:hover:border-indigo-500'
              }`}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.json,.xlsx"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <div className="flex flex-col items-center gap-3">
                  <div className="p-4 rounded-full bg-indigo-100 dark:bg-indigo-900/30">
                    <Upload className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-gray-700 dark:text-gray-300 font-medium">
                      {t('tenant.imports.uploadModal.dropFile')} <span className="text-indigo-600 dark:text-indigo-400">{t('tenant.imports.uploadModal.browse')}</span>
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {t('tenant.imports.uploadModal.supportedFormats')}
                    </p>
                  </div>
                </div>
              </label>
            </div>
          </div>

          {selectedFile && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                  {getFileTypeIcon(selectedFile.name.split('.').pop() || 'csv')}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedFile.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t('tenant.imports.uploadModal.size')}: {(selectedFile.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          <div className="flex gap-3">
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={openPreviewModal}
              disabled={!selectedFile}
              className="flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-xl hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors disabled:opacity-50"
            >
              <Eye className="w-4 h-4" />
              {t('tenant.imports.uploadModal.previewData')}
            </motion.button>
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={openMappingModal}
              disabled={!selectedFile}
              className="flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-xl hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors disabled:opacity-50"
            >
              <Settings2 className="w-4 h-4" />
              {t('tenant.imports.uploadModal.configureMapping')}
            </motion.button>
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-slate-600">
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setShowUploadModal(false);
                resetUploadForm();
              }}
              className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
            >
              {t('common.cancel')}
            </motion.button>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={!selectedFile}
              className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
            >
              {t('tenant.imports.uploadModal.uploadImport')}
            </motion.button>
          </div>
        </form>
      </Modal>

      {/* Preview Modal */}
      <Modal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        title={t('tenant.imports.previewModal.title')}
        size="xl"
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
            <thead className="bg-gray-50 dark:bg-slate-900/50">
              <tr>
                {Object.keys(previewData[0] || {}).map((key) => (
                  <th key={key} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
              {previewData.map((row, index) => (
                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                  {Object.values(row).map((value: any, colIndex) => (
                    <td key={colIndex} className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                      {value}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-end mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowPreviewModal(false)}
            className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
          >
            {t('common.close')}
          </motion.button>
        </div>
      </Modal>

      {/* Field Mapping Modal */}
      <Modal
        isOpen={showMappingModal}
        onClose={() => setShowMappingModal(false)}
        title={t('tenant.imports.mappingModal.title')}
        size="lg"
      >
        <div className="space-y-4">
          {fieldMappings.map((mapping, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="grid grid-cols-3 gap-4 items-center p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl"
            >
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">{t('tenant.imports.mappingModal.sourceField')}</label>
                <div className="px-3 py-2 bg-white dark:bg-slate-600 border border-gray-200 dark:border-slate-500 rounded-lg text-sm text-gray-700 dark:text-gray-300">
                  {mapping.sourceField}
                </div>
              </div>
              <div className="flex items-center justify-center">
                <ArrowRight className="w-5 h-5 text-gray-400" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">{t('tenant.imports.mappingModal.targetField')}</label>
                <input
                  type="text"
                  value={mapping.targetField}
                  onChange={(e) => {
                    const newMappings = [...fieldMappings];
                    newMappings[index].targetField = e.target.value;
                    setFieldMappings(newMappings);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </motion.div>
          ))}
        </div>
        <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-gray-200 dark:border-slate-700">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowMappingModal(false)}
            className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
          >
            {t('common.cancel')}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowMappingModal(false)}
            className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
          >
            {t('tenant.imports.mappingModal.saveMapping')}
          </motion.button>
        </div>
      </Modal>

      {/* Validation Errors Modal */}
      <Modal
        isOpen={showErrorsModal}
        onClose={() => {
          setShowErrorsModal(false);
          setSelectedImport(null);
        }}
        title={`Validation Errors - ${selectedImport?.fileName || ''}`}
        size="xl"
      >
        {selectedImport && (
          <>
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
              <p className="text-sm text-red-700 dark:text-red-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {t('tenant.imports.errorsModal.errorsFound', { count: selectedImport.validationErrors.length })}
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                <thead className="bg-gray-50 dark:bg-slate-900/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Row</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Field</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Value</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Error</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                  {selectedImport.validationErrors.map((error, index) => (
                    <motion.tr
                      key={index}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                    >
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white font-medium">{error.row}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white font-mono">{error.field}</td>
                      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{error.value || '(empty)'}</td>
                      <td className="px-4 py-3 text-sm text-red-600 dark:text-red-400">{error.error}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
        <div className="flex justify-end mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setShowErrorsModal(false);
              setSelectedImport(null);
            }}
            className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
          >
            {t('common.close')}
          </motion.button>
        </div>
      </Modal>
    </div>
  );
}
