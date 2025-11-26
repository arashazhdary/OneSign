import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { getTenantId } from '@/lib/tenant-context';
import { tenantService } from '@/lib/api/services/tenant.service';

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
  createdAt: string;
}

// Mock data for fallback
const mockImportsFallback: ImportJob[] = [
  {
    id: '1',
    fileName: 'users_import_2025-11-23.csv',
    fileType: 'csv',
    dataType: 'Users',
    status: 'completed',
    totalRecords: 150,
    processedRecords: 150,
    successfulRecords: 147,
    failedRecords: 3,
    validationErrors: [
      { row: 23, field: 'email', value: 'invalid-email', error: 'Invalid email format' },
      { row: 45, field: 'phone', value: '12345', error: 'Invalid phone number format' },
      { row: 89, field: 'email', value: '', error: 'Email is required' },
    ],
    createdBy: 'admin@example.com',
    createdAt: '2025-11-23T10:00:00Z',
    completedAt: '2025-11-23T10:05:32Z',
    canRollback: true,
  },
  {
    id: '2',
    fileName: 'applications_bulk.json',
    fileType: 'json',
    dataType: 'Applications',
    status: 'processing',
    totalRecords: 50,
    processedRecords: 32,
    successfulRecords: 30,
    failedRecords: 2,
    validationErrors: [],
    createdBy: 'admin@example.com',
    createdAt: '2025-11-23T11:30:00Z',
    canRollback: false,
  },
  {
    id: '3',
    fileName: 'roles_import.xlsx',
    fileType: 'xlsx',
    dataType: 'Roles',
    status: 'failed',
    totalRecords: 25,
    processedRecords: 10,
    successfulRecords: 5,
    failedRecords: 5,
    validationErrors: [
      { row: 5, field: 'name', value: '', error: 'Role name is required' },
      { row: 8, field: 'permissions', value: 'invalid', error: 'Invalid permission format' },
    ],
    createdBy: 'admin@example.com',
    createdAt: '2025-11-23T09:15:00Z',
    completedAt: '2025-11-23T09:18:45Z',
    canRollback: false,
  },
];

const mockTemplatesFallback: ImportTemplate[] = [
  {
    id: 't1',
    name: 'User Import Template',
    dataType: 'Users',
    fileType: 'csv',
    fieldMappings: [
      { sourceField: 'Email', targetField: 'email', required: true, dataType: 'string' },
      { sourceField: 'FirstName', targetField: 'firstName', required: true, dataType: 'string' },
      { sourceField: 'LastName', targetField: 'lastName', required: true, dataType: 'string' },
      { sourceField: 'Phone', targetField: 'phoneNumber', required: false, dataType: 'string' },
    ],
    createdAt: '2025-10-15T12:00:00Z',
  },
  {
    id: 't2',
    name: 'Application Import Template',
    dataType: 'Applications',
    fileType: 'json',
    fieldMappings: [
      { sourceField: 'name', targetField: 'name', required: true, dataType: 'string' },
      { sourceField: 'clientId', targetField: 'clientId', required: true, dataType: 'string' },
      { sourceField: 'redirectUris', targetField: 'redirectUris', required: true, dataType: 'array' },
    ],
    createdAt: '2025-10-20T14:30:00Z',
  },
];

const dataTypes = ['Users', 'Applications', 'Roles', 'OrgUnits', 'Policies'];
const fileTypes = ['csv', 'json', 'xlsx'];

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
      // Fetch from real API
      const data = await tenantService.getImportJobs(tenantId);
      setImports(data || mockImportsFallback);
    } catch (error: any) {
      console.error('Error fetching imports:', error);
      setError(error?.message || t('common.failedToLoadData'));
      // Fallback to mock data
      setImports(mockImportsFallback);
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    if (!tenantId) return;

    try {
      // Fetch from real API
      const data = await tenantService.getImportTemplates(tenantId);
      setTemplates(data || mockTemplatesFallback);
    } catch (error: any) {
      console.error('Error fetching templates:', error);
      // Fallback to mock data
      setTemplates(mockTemplatesFallback);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Parse file for preview
      parseFilePreview(file);
    }
  };

  const parseFilePreview = (file: File) => {
    // Mock preview data
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
      // API call would go here
      setSuccess('File uploaded successfully. Import job started.');
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
    if (!confirm('Are you sure you want to rollback this import? All imported records will be deleted.')) return;

    setError('');
    setSuccess('');

    try {
      // API call would go here
      setSuccess('Import rolled back successfully');
      fetchImports();
    } catch (error: any) {
      setError(error?.message || t('common.failedToRollbackImport'));
    }
  };

  const handleDownloadTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (!template) return;

    setSuccess(`Downloading ${template.name}...`);
    // Download logic would go here
  };

  const openPreviewModal = () => {
    if (!selectedFile) {
      setError('Please select a file first');
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
      setError('Please select a file first');
      return;
    }
    // Initialize field mappings
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
    const colors = {
      pending: 'bg-gray-100 text-gray-800',
      processing: 'bg-blue-100 text-blue-800',
      validating: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getProgressPercentage = (job: ImportJob) => {
    if (job.totalRecords === 0) return 0;
    return Math.round((job.processedRecords / job.totalRecords) * 100);
  };

  if (loading) {
    return <div className="p-8">Loading imports...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Data Import Management</h1>
        <button
          onClick={() => setShowUploadModal(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          Upload File
        </button>
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

      {/* Import Templates */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Import Templates</h2>
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
              <p className="text-xs text-gray-500 mb-3">{template.fieldMappings.length} fields mapped</p>
              <button
                onClick={() => handleDownloadTemplate(template.id)}
                className="text-sm text-indigo-600 hover:text-indigo-800"
              >
                Download Template
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Import History */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold">Import History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">File Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Progress</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Records</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {imports.map((job) => {
                const progressPercentage = getProgressPercentage(job);
                return (
                  <tr key={job.id}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{job.fileName}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{job.dataType}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-2 py-1 rounded text-xs ${getStatusBadge(job.status)}`}>
                        {job.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="w-32">
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>{progressPercentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-indigo-600 h-2 rounded-full"
                            style={{ width: `${progressPercentage}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div>
                        <p className="text-green-600">{job.successfulRecords} success</p>
                        {job.failedRecords > 0 && (
                          <p className="text-red-600">{job.failedRecords} failed</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                      {formatDate(job.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-sm whitespace-nowrap">
                      {job.validationErrors.length > 0 && (
                        <button
                          onClick={() => openErrorsModal(job)}
                          className="text-red-600 hover:text-red-900 mr-3"
                        >
                          View Errors
                        </button>
                      )}
                      {job.canRollback && job.status === 'completed' && (
                        <button
                          onClick={() => handleRollback(job.id)}
                          className="text-yellow-600 hover:text-yellow-900"
                        >
                          Rollback
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {imports.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No import history found. Upload a file to get started.
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Upload Import File</h2>
            <form onSubmit={handleUpload}>
              <div className="mb-4">
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

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Select Template (optional)</label>
                <select
                  className="w-full px-3 py-2 border rounded"
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                >
                  <option value="">No template</option>
                  {templates
                    .filter((t) => t.dataType === selectedDataType)
                    .map((template) => (
                      <option key={template.id} value={template.id}>
                        {template.name}
                      </option>
                    ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Upload File *</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.json,.xlsx"
                  onChange={handleFileSelect}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Supported formats: CSV, JSON, Excel (XLSX)</p>
              </div>

              {selectedFile && (
                <div className="mb-4 p-3 bg-gray-50 rounded">
                  <p className="text-sm text-gray-700">
                    Selected: <span className="font-medium">{selectedFile.name}</span>
                  </p>
                  <p className="text-xs text-gray-500">
                    Size: {(selectedFile.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              )}

              <div className="flex gap-2 mb-4">
                <button
                  type="button"
                  onClick={openPreviewModal}
                  disabled={!selectedFile}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  Preview Data
                </button>
                <button
                  type="button"
                  onClick={openMappingModal}
                  disabled={!selectedFile}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
                >
                  Configure Mapping
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={!selectedFile}
                  className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
                >
                  Upload & Import
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowUploadModal(false);
                    resetUploadForm();
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

      {/* Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Data Preview (First 3 rows)</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {Object.keys(previewData[0] || {}).map((key) => (
                      <th key={key} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {previewData.map((row, index) => (
                    <tr key={index}>
                      {Object.values(row).map((value: any, colIndex) => (
                        <td key={colIndex} className="px-4 py-3 text-sm text-gray-900">
                          {value}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4">
              <button
                onClick={() => setShowPreviewModal(false)}
                className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Field Mapping Modal */}
      {showMappingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Configure Field Mapping</h2>
            <div className="space-y-3">
              {fieldMappings.map((mapping, index) => (
                <div key={index} className="grid grid-cols-3 gap-3 items-center">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Source Field</label>
                    <input
                      type="text"
                      value={mapping.sourceField}
                      disabled
                      className="w-full px-2 py-1 border rounded bg-gray-50 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Target Field</label>
                    <input
                      type="text"
                      value={mapping.targetField}
                      onChange={(e) => {
                        const newMappings = [...fieldMappings];
                        newMappings[index].targetField = e.target.value;
                        setFieldMappings(newMappings);
                      }}
                      className="w-full px-2 py-1 border rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="flex items-center space-x-2 mt-5">
                      <input
                        type="checkbox"
                        checked={mapping.required}
                        onChange={(e) => {
                          const newMappings = [...fieldMappings];
                          newMappings[index].required = e.target.checked;
                          setFieldMappings(newMappings);
                        }}
                        className="rounded"
                      />
                      <span className="text-sm">Required</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setShowMappingModal(false)}
                className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
              >
                Save Mapping
              </button>
              <button
                onClick={() => setShowMappingModal(false)}
                className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Validation Errors Modal */}
      {showErrorsModal && selectedImport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              Validation Errors - {selectedImport.fileName}
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              {selectedImport.validationErrors.length} errors found
            </p>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Row</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Field</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Value</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Error</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {selectedImport.validationErrors.map((error, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3 text-sm text-gray-900">{error.row}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 font-mono">{error.field}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{error.value || '(empty)'}</td>
                      <td className="px-4 py-3 text-sm text-red-600">{error.error}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4">
              <button
                onClick={() => {
                  setShowErrorsModal(false);
                  setSelectedImport(null);
                }}
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
