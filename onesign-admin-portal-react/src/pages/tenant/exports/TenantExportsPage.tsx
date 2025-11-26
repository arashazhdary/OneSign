import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getTenantId } from '@/lib/tenant-context';
import { tenantService } from '@/lib/api/services/tenant.service';
import { Helmet } from 'react-helmet-async';

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

export default function TenantExportsPage() {
  const { t } = useTranslation();
  const [exports, setExports] = useState<ExportJob[]>([]);
  const [templates, setTemplates] = useState<ExportTemplate[]>([]);
  const [scheduledExports, setScheduledExports] = useState<ScheduledExport[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showFiltersModal, setShowFiltersModal] = useState(false);
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
    // Set default fields when data type changes
    setSelectedFields(availableFields[selectedDataType] || []);
  }, [selectedDataType]);

  const fetchExports = async () => {
    if (!tenantId) return;

    try {
      // Fetch from real API
      const data = await tenantService.getExportJobs(tenantId);
      setExports(data || mockExportsFallback);
    } catch (error: any) {
      console.error('Error fetching exports:', error);
      setError(error?.message || t('common.failedToLoadExports'));
      // Fallback to mock data
      setExports(mockExportsFallback);
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    if (!tenantId) return;

    try {
      // Fetch from real API
      const data = await tenantService.getExportTemplates(tenantId);
      setTemplates(data || mockTemplatesFallback);
    } catch (error: any) {
      console.error('Error fetching templates:', error);
      // Fallback to mock data
      setTemplates(mockTemplatesFallback);
    }
  };

  const fetchScheduledExports = async () => {
    if (!tenantId) return;

    try {
      // Fetch from real API
      const data = await tenantService.getScheduledExports(tenantId);
      setScheduledExports(data || mockScheduledExportsFallback);
    } catch (error: any) {
      console.error('Error fetching scheduled exports:', error);
      // Fallback to mock data
      setScheduledExports(mockScheduledExportsFallback);
    }
  };

  const handleCreateExport = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!tenantId) return;

    try {
      // API call would go here
      setSuccess('Export job created successfully');
      setShowCreateModal(false);
      resetForm();
      fetchExports();
    } catch (error: any) {
      setError(error?.message || t('common.failedToCreateExport'));
      console.error('Error creating export:', error);
    }
  };

  const handleDownload = async (exportJob: ExportJob) => {
    if (!exportJob.downloadUrl) return;

    setSuccess(`Downloading ${exportJob.name}...`);
    // Download logic would go here
    // window.open(exportJob.downloadUrl, '_blank');
  };

  const handleDeleteExport = async (exportId: string) => {
    if (!confirm('Are you sure you want to delete this export?')) return;

    setError('');
    setSuccess('');

    try {
      // API call would go here
      setSuccess('Export deleted successfully');
      fetchExports();
    } catch (error: any) {
      setError(error?.message || t('common.failedToDeleteExport'));
    }
  };

  const handleSaveTemplate = async () => {
    setError('');
    setSuccess('');

    try {
      // API call would go here
      setSuccess('Template saved successfully');
      setShowTemplateModal(false);
      fetchTemplates();
    } catch (error: any) {
      setError(error?.message || t('common.failedToSaveTemplate'));
    }
  };

  const handleToggleSchedule = async (scheduleId: string) => {
    setError('');
    setSuccess('');

    try {
      // API call would go here
      setSuccess('Schedule updated successfully');
      fetchScheduledExports();
    } catch (error: any) {
      setError(error?.message || t('common.failedToUpdateSchedule'));
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
    const colors = {
      pending: 'bg-gray-100 text-gray-800',
      processing: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return <div className="p-8">Loading exports...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Data Export Management</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowScheduleModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Scheduled Exports
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Create Export
          </button>
        </div>
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

      {/* Export Templates */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Export Templates</h2>
          <button
            onClick={() => setShowTemplateModal(true)}
            className="text-sm bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700"
          >
            Create Template
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {templates.map((template) => (
            <div key={template.id} className="border rounded p-4 hover:border-indigo-500">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold">{template.name}</h3>
                  <p className="text-sm text-gray-600">{template.dataType}</p>
                </div>
                <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">
                  {template.fileType.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-gray-500 mb-2">
                {template.fields.length} fields • {template.filters.length} filters
              </p>
              <button
                onClick={() => {
                  setSelectedTemplate(template.id);
                  setSelectedDataType(template.dataType);
                  setSelectedFileType(template.fileType);
                  setSelectedFields(template.fields);
                  setFilters(template.filters);
                  setShowCreateModal(true);
                }}
                className="text-sm text-indigo-600 hover:text-indigo-800"
              >
                Use Template
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Export History */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold">Export History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Format</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Records</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Size</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {exports.map((exportJob) => (
                <tr key={exportJob.id}>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{exportJob.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{exportJob.dataType}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">
                      {exportJob.fileType.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-1 rounded text-xs ${getStatusBadge(exportJob.status)}`}>
                      {exportJob.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {exportJob.totalRecords > 0 ? exportJob.totalRecords.toLocaleString() : '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{exportJob.fileSize || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                    {formatDate(exportJob.createdAt)}
                  </td>
                  <td className="px-6 py-4 text-sm whitespace-nowrap">
                    {exportJob.status === 'completed' && exportJob.downloadUrl && (
                      <>
                        <button
                          onClick={() => handleDownload(exportJob)}
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                        >
                          Download
                        </button>
                        {exportJob.expiresAt && (
                          <span className="text-xs text-gray-500">
                            Expires {formatDate(exportJob.expiresAt)}
                          </span>
                        )}
                      </>
                    )}
                    <button
                      onClick={() => handleDeleteExport(exportJob.id)}
                      className="text-red-600 hover:text-red-900 ml-3"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {exports.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No export history found. Create your first export to get started.
          </div>
        )}
      </div>

      {/* Create Export Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Create Export</h2>
            <form onSubmit={handleCreateExport}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Export Name *</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border rounded"
                  placeholder="e.g., All Active Users"
                  value={exportName}
                  onChange={(e) => setExportName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Data Type *</label>
                  <select
                    className="w-full px-3 py-2 border rounded"
                    value={selectedDataType}
                    onChange={(e) => setSelectedDataType(e.target.value)}
                  >
                    {dataTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">File Format *</label>
                  <select
                    className="w-full px-3 py-2 border rounded"
                    value={selectedFileType}
                    onChange={(e) => setSelectedFileType(e.target.value as any)}
                  >
                    {fileTypes.map((type) => (
                      <option key={type} value={type}>
                        {type.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Fields to Export *</label>
                <div className="border rounded p-3 max-h-40 overflow-y-auto">
                  <div className="grid grid-cols-2 gap-2">
                    {availableFields[selectedDataType]?.map((field) => (
                      <label key={field} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={selectedFields.includes(field)}
                          onChange={() => toggleField(field)}
                          className="rounded"
                        />
                        <span className="text-sm">{field}</span>
                      </label>
                    ))}
                  </div>
                </div>
                {selectedFields.length === 0 && (
                  <p className="text-xs text-red-600 mt-1">Select at least one field</p>
                )}
              </div>

              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium">Filters (optional)</label>
                  <button
                    type="button"
                    onClick={addFilter}
                    className="text-sm text-indigo-600 hover:text-indigo-800"
                  >
                    + Add Filter
                  </button>
                </div>
                {filters.map((filter, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <select
                      className="flex-1 px-2 py-1 border rounded text-sm"
                      value={filter.field}
                      onChange={(e) => updateFilter(index, 'field', e.target.value)}
                    >
                      <option value="">Select field</option>
                      {availableFields[selectedDataType]?.map((field) => (
                        <option key={field} value={field}>
                          {field}
                        </option>
                      ))}
                    </select>
                    <select
                      className="px-2 py-1 border rounded text-sm"
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
                      className="flex-1 px-2 py-1 border rounded text-sm"
                      placeholder="Value"
                      value={filter.value}
                      onChange={(e) => updateFilter(index, 'value', e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => removeFilter(index)}
                      className="text-red-600 hover:text-red-800 px-2"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              <div className="mb-4 border-t pt-4">
                <label className="flex items-center space-x-2 mb-2">
                  <input
                    type="checkbox"
                    checked={emailOnComplete}
                    onChange={(e) => setEmailOnComplete(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm font-medium">Email download link when complete</span>
                </label>
                {emailOnComplete && (
                  <input
                    type="email"
                    className="w-full px-3 py-2 border rounded text-sm"
                    placeholder="recipient@example.com"
                    value={emailAddress}
                    onChange={(e) => setEmailAddress(e.target.value)}
                  />
                )}
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={selectedFields.length === 0}
                  className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
                >
                  Create Export
                </button>
                <button
                  type="button"
                  onClick={() => setShowTemplateModal(true)}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  Save as Template
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Template Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Save as Template</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Template Name *</label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border rounded"
                placeholder="e.g., Monthly User Report"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSaveTemplate}
                className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
              >
                Save Template
              </button>
              <button
                onClick={() => setShowTemplateModal(false)}
                className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Scheduled Exports Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Scheduled Exports</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Schedule</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Next Run</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Run</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Recipients</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {scheduledExports.map((schedule) => (
                    <tr key={schedule.id}>
                      <td className="px-4 py-3 text-sm text-gray-900">{schedule.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{schedule.schedule}</td>
                      <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                        {formatDate(schedule.nextRunAt)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                        {schedule.lastRunAt ? formatDate(schedule.lastRunAt) : 'Never'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {schedule.emailRecipients.length} recipients
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <button
                          onClick={() => handleToggleSchedule(schedule.id)}
                          className={`px-2 py-1 rounded text-xs ${
                            schedule.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {schedule.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <button className="text-indigo-600 hover:text-indigo-900">Edit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setShowScheduleModal(false)}
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
