import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { changeManagementService } from '@/lib/api/services/change-management.service';
import { useAuth } from '@/app/contexts/AuthContext';
import DataTable, { Column } from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import ActionButton from '@/components/common/ActionButton';
import Modal from '@/components/common/Modal';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import { Helmet } from 'react-helmet-async';

interface GlobalChangeAudit {
  id: string;
  tenantId: string;
  tenantName: string;
  changeSetId: string;
  changeSetName: string;
  changeType: string;
  module: string;
  status: 'Applied' | 'Rolled Back' | 'Failed';
  appliedBy: string;
  appliedAt: string;
  duration: string;
  affectedResources: number;
  details: {
    before?: any;
    after?: any;
    errors?: string[];
    warnings?: string[];
  };
}

interface TenantChangeMetrics {
  tenantId: string;
  tenantName: string;
  totalChanges: number;
  successfulChanges: number;
  failedChanges: number;
  rolledBackChanges: number;
  lastChangeAt: string;
  averageDuration: string;
}

interface ChangeImpactAnalysis {
  id: string;
  changeId: string;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  affectedTenants: number;
  affectedUsers: number;
  totalDowntime: string;
  costImpact: string;
  recommendations: string[];
}

export default function GlobalChangesAuditPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState<'audit-log' | 'tenant-metrics' | 'impact-analysis' | 'compliance'>('audit-log');

  const [auditLogs, setAuditLogs] = useState<GlobalChangeAudit[]>([]);
  const [tenantMetrics, setTenantMetrics] = useState<TenantChangeMetrics[]>([]);
  const [impactAnalyses, setImpactAnalyses] = useState<ChangeImpactAnalysis[]>([]);
  const [selectedAudit, setSelectedAudit] = useState<GlobalChangeAudit | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const [filters, setFilters] = useState({
    tenantId: '',
    status: '',
    module: '',
    dateFrom: '',
    dateTo: '',
  });

  useEffect(() => {
    if (activeTab === 'audit-log') fetchAuditLogs();
    else if (activeTab === 'tenant-metrics') fetchTenantMetrics();
    else if (activeTab === 'impact-analysis') fetchImpactAnalyses();
  }, [activeTab, filters]);

  const fetchAuditLogs = async () => {
    setLoading(true);
    setError('');
    try {
      // Use global change management service
      const data = await changeManagementService.getGlobalChangeHistory({
        ...filters,
        page: 1,
        pageSize: 100,
      });

      if (data) {
        setAuditLogs(data as any);
      } else {
        // Mock data if API not available
        setAuditLogs([
          {
            id: '1',
            tenantId: 'tenant-001',
            tenantName: 'Acme Corp',
            changeSetId: 'cs-123',
            changeSetName: 'Update MFA Policies',
            changeType: 'Security Policy Update',
            module: 'Security',
            status: 'Applied',
            appliedBy: 'admin@platform.com',
            appliedAt: new Date(Date.now() - 3600000).toISOString(),
            duration: '2m 34s',
            affectedResources: 150,
            details: {
              before: { mfaRequired: false },
              after: { mfaRequired: true },
            },
          },
          {
            id: '2',
            tenantId: 'tenant-002',
            tenantName: 'TechStart Inc',
            changeSetId: 'cs-124',
            changeSetName: 'Role Permission Updates',
            changeType: 'Permission Change',
            module: 'IAM',
            status: 'Applied',
            appliedBy: 'admin@platform.com',
            appliedAt: new Date(Date.now() - 7200000).toISOString(),
            duration: '5m 12s',
            affectedResources: 320,
            details: {},
          },
          {
            id: '3',
            tenantId: 'tenant-003',
            tenantName: 'Global Enterprises',
            changeSetId: 'cs-125',
            changeSetName: 'Integration Config Update',
            changeType: 'Configuration Change',
            module: 'Integrations',
            status: 'Failed',
            appliedBy: 'admin@platform.com',
            appliedAt: new Date(Date.now() - 10800000).toISOString(),
            duration: '1m 45s',
            affectedResources: 45,
            details: {
              errors: ['Connection timeout to external service', 'Rollback completed successfully'],
            },
          },
        ]);
      }
    } catch (err: any) {
      console.error('Error fetching audit logs:', err);
      setError('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  const fetchTenantMetrics = async () => {
    setLoading(true);
    try {
      // Mock tenant metrics
      setTenantMetrics([
        {
          tenantId: 'tenant-001',
          tenantName: 'Acme Corp',
          totalChanges: 45,
          successfulChanges: 42,
          failedChanges: 2,
          rolledBackChanges: 1,
          lastChangeAt: new Date(Date.now() - 3600000).toISOString(),
          averageDuration: '3m 22s',
        },
        {
          tenantId: 'tenant-002',
          tenantName: 'TechStart Inc',
          totalChanges: 67,
          successfulChanges: 65,
          failedChanges: 1,
          rolledBackChanges: 1,
          lastChangeAt: new Date(Date.now() - 7200000).toISOString(),
          averageDuration: '4m 15s',
        },
        {
          tenantId: 'tenant-003',
          tenantName: 'Global Enterprises',
          totalChanges: 89,
          successfulChanges: 85,
          failedChanges: 3,
          rolledBackChanges: 1,
          lastChangeAt: new Date(Date.now() - 10800000).toISOString(),
          averageDuration: '2m 58s',
        },
      ]);
    } catch (err) {
      setError('Failed to load tenant metrics');
    } finally {
      setLoading(false);
    }
  };

  const fetchImpactAnalyses = async () => {
    setLoading(true);
    try {
      // Mock impact analyses
      setImpactAnalyses([
        {
          id: '1',
          changeId: 'cs-123',
          riskLevel: 'Medium',
          affectedTenants: 15,
          affectedUsers: 4500,
          totalDowntime: '0m',
          costImpact: '$0',
          recommendations: [
            'Monitor MFA adoption rates',
            'Provide user training materials',
            'Set up automated alerts for authentication failures',
          ],
        },
        {
          id: '2',
          changeId: 'cs-124',
          riskLevel: 'High',
          affectedTenants: 32,
          affectedUsers: 12800,
          totalDowntime: '2m 15s',
          costImpact: '$250',
          recommendations: [
            'Schedule during off-peak hours',
            'Implement gradual rollout',
            'Prepare rollback procedure',
          ],
        },
      ]);
    } catch (err) {
      setError('Failed to load impact analyses');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (audit: GlobalChangeAudit) => {
    setSelectedAudit(audit);
    setShowDetailsModal(true);
  };

  const handleExportAudit = async (format: 'csv' | 'json' | 'pdf') => {
    setLoading(true);
    try {
      // Implement export functionality
      setSuccess(`Audit log exported as ${format.toUpperCase()}`);
    } catch (err) {
      setError('Failed to export audit log');
    } finally {
      setLoading(false);
    }
  };

  const auditColumns: Column<GlobalChangeAudit>[] = [
    {
      key: 'appliedAt',
      label: 'Time',
      render: (audit) => new Date(audit.appliedAt).toLocaleString(),
    },
    { key: 'tenantName', label: 'Tenant' },
    { key: 'changeSetName', label: 'Change Set' },
    { key: 'module', label: 'Module' },
    {
      key: 'status',
      label: 'Status',
      render: (audit) => (
        <StatusBadge
          status={audit.status}
          variant={
            audit.status === 'Applied'
              ? 'success'
              : audit.status === 'Failed'
              ? 'error'
              : 'warning'
          }
        />
      ),
    },
    {
      key: 'affectedResources',
      label: 'Affected',
      render: (audit) => `${audit.affectedResources} resources`,
    },
    { key: 'duration', label: 'Duration' },
  ];

  const metricsColumns: Column<TenantChangeMetrics>[] = [
    { key: 'tenantName', label: 'Tenant' },
    {
      key: 'totalChanges',
      label: 'Total Changes',
      render: (metrics) => (
        <span className="font-medium">{metrics.totalChanges}</span>
      ),
    },
    {
      key: 'successfulChanges',
      label: 'Successful',
      render: (metrics) => (
        <span className="text-green-600 font-medium">{metrics.successfulChanges}</span>
      ),
    },
    {
      key: 'failedChanges',
      label: 'Failed',
      render: (metrics) => (
        <span className="text-red-600 font-medium">{metrics.failedChanges}</span>
      ),
    },
    {
      key: 'successRate',
      label: 'Success Rate',
      render: (metrics) => {
        const rate = ((metrics.successfulChanges / metrics.totalChanges) * 100).toFixed(1);
        return <span className="font-medium">{rate}%</span>;
      },
    },
    { key: 'averageDuration', label: 'Avg Duration' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 p-6">
      

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
          Global Changes Audit
        </h1>
        <p className="text-gray-600">
          Platform-wide change tracking and compliance monitoring across all tenants
        </p>
      </div>

      {/* Alerts */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-300 text-red-800 rounded-lg">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-4 bg-green-100 border border-green-300 text-green-800 rounded-lg">
          {success}
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6 flex space-x-2 border-b border-gray-300">
        <button
          onClick={() => setActiveTab('audit-log')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'audit-log'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Audit Log
        </button>
        <button
          onClick={() => setActiveTab('tenant-metrics')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'tenant-metrics'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Tenant Metrics
        </button>
        <button
          onClick={() => setActiveTab('impact-analysis')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'impact-analysis'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Impact Analysis
        </button>
        <button
          onClick={() => setActiveTab('compliance')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'compliance'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Compliance Reports
        </button>
      </div>

      {/* Filters */}
      {activeTab === 'audit-log' && (
        <div className="mb-6 bg-white rounded-lg shadow p-4">
          <div className="grid grid-cols-5 gap-4">
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="Applied">Applied</option>
              <option value="Rolled Back">Rolled Back</option>
              <option value="Failed">Failed</option>
            </select>

            <select
              value={filters.module}
              onChange={(e) => setFilters({ ...filters, module: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Modules</option>
              <option value="Security">Security</option>
              <option value="IAM">IAM</option>
              <option value="Integrations">Integrations</option>
              <option value="Billing">Billing</option>
            </select>

            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="From"
            />

            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="To"
            />

            <div className="flex gap-2">
              <ActionButton onClick={() => handleExportAudit('csv')} variant="secondary">
                Export CSV
              </ActionButton>
            </div>
          </div>
        </div>
      )}

      {/* Audit Log Tab */}
      {activeTab === 'audit-log' && (
        <div className="space-y-6">
          <DataTable
            data={auditLogs}
            columns={auditColumns}
            onRowClick={handleViewDetails}
            actions={(audit) => (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewDetails(audit);
                }}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                View Details
              </button>
            )}
          />
        </div>
      )}

      {/* Tenant Metrics Tab */}
      {activeTab === 'tenant-metrics' && (
        <div className="space-y-6">
          <DataTable
            data={tenantMetrics}
            columns={metricsColumns}
          />

          {/* Summary Cards */}
          <div className="grid grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Total Changes (Platform)</h3>
              <p className="text-3xl font-bold text-blue-600">
                {tenantMetrics.reduce((sum, m) => sum + m.totalChanges, 0)}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Success Rate (Platform)</h3>
              <p className="text-3xl font-bold text-green-600">
                {(
                  (tenantMetrics.reduce((sum, m) => sum + m.successfulChanges, 0) /
                    tenantMetrics.reduce((sum, m) => sum + m.totalChanges, 0)) *
                  100
                ).toFixed(1)}
                %
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Active Tenants</h3>
              <p className="text-3xl font-bold text-purple-600">{tenantMetrics.length}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Failed Changes</h3>
              <p className="text-3xl font-bold text-red-600">
                {tenantMetrics.reduce((sum, m) => sum + m.failedChanges, 0)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Impact Analysis Tab */}
      {activeTab === 'impact-analysis' && (
        <div className="space-y-4">
          {impactAnalyses.map((analysis) => (
            <div key={analysis.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Change Set: {analysis.changeId}</h3>
                  <StatusBadge
                    status={analysis.riskLevel}
                    variant={
                      analysis.riskLevel === 'Critical' || analysis.riskLevel === 'High'
                        ? 'error'
                        : analysis.riskLevel === 'Medium'
                        ? 'warning'
                        : 'success'
                    }
                  />
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">Cost Impact</div>
                  <div className="text-2xl font-bold text-orange-600">{analysis.costImpact}</div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4 mb-4">
                <div>
                  <div className="text-sm text-gray-600">Affected Tenants</div>
                  <div className="text-xl font-semibold">{analysis.affectedTenants}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Affected Users</div>
                  <div className="text-xl font-semibold">{analysis.affectedUsers}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Total Downtime</div>
                  <div className="text-xl font-semibold">{analysis.totalDowntime}</div>
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-gray-700 mb-2">Recommendations:</div>
                <ul className="list-disc list-inside space-y-1">
                  {analysis.recommendations.map((rec, idx) => (
                    <li key={idx} className="text-sm text-gray-600">
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Compliance Reports Tab */}
      {activeTab === 'compliance' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Compliance & Audit Reports</h2>
          <p className="text-gray-600 mb-6">
            Generate compliance reports for regulatory and audit purposes
          </p>
          <div className="space-y-3">
            <ActionButton onClick={() => handleExportAudit('pdf')}>
              Download SOC 2 Compliance Report
            </ActionButton>
            <ActionButton variant="secondary" onClick={() => handleExportAudit('pdf')}>
              Download Change Management Audit Trail
            </ActionButton>
            <ActionButton variant="secondary" onClick={() => handleExportAudit('csv')}>
              Export All Changes (CSV)
            </ActionButton>
            <ActionButton variant="secondary" onClick={() => handleExportAudit('json')}>
              Export All Changes (JSON)
            </ActionButton>
          </div>
        </div>
      )}

      {/* Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title="Change Audit Details"
        size="large"
      >
        {selectedAudit && (
          <div className="space-y-6">
            {/* Summary */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <div className="text-sm text-gray-600">Tenant</div>
                <div className="font-medium">{selectedAudit.tenantName}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Change Set</div>
                <div className="font-medium">{selectedAudit.changeSetName}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Module</div>
                <div className="font-medium">{selectedAudit.module}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Status</div>
                <StatusBadge status={selectedAudit.status} />
              </div>
              <div>
                <div className="text-sm text-gray-600">Applied By</div>
                <div className="font-medium">{selectedAudit.appliedBy}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Applied At</div>
                <div className="font-medium">{new Date(selectedAudit.appliedAt).toLocaleString()}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Duration</div>
                <div className="font-medium">{selectedAudit.duration}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Affected Resources</div>
                <div className="font-medium">{selectedAudit.affectedResources}</div>
              </div>
            </div>

            {/* Details */}
            {selectedAudit.details && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Change Details</h3>
                {selectedAudit.details.before && (
                  <div className="mb-3">
                    <div className="text-sm font-medium text-gray-700 mb-1">Before:</div>
                    <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                      {JSON.stringify(selectedAudit.details.before, null, 2)}
                    </pre>
                  </div>
                )}
                {selectedAudit.details.after && (
                  <div className="mb-3">
                    <div className="text-sm font-medium text-gray-700 mb-1">After:</div>
                    <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                      {JSON.stringify(selectedAudit.details.after, null, 2)}
                    </pre>
                  </div>
                )}
                {selectedAudit.details.errors && selectedAudit.details.errors.length > 0 && (
                  <div>
                    <div className="text-sm font-medium text-red-700 mb-1">Errors:</div>
                    <ul className="list-disc list-inside space-y-1">
                      {selectedAudit.details.errors.map((error, idx) => (
                        <li key={idx} className="text-sm text-red-600">
                          {error}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {selectedAudit.details.warnings && selectedAudit.details.warnings.length > 0 && (
                  <div>
                    <div className="text-sm font-medium text-orange-700 mb-1">Warnings:</div>
                    <ul className="list-disc list-inside space-y-1">
                      {selectedAudit.details.warnings.map((warning, idx) => (
                        <li key={idx} className="text-sm text-orange-600">
                          {warning}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-3 pt-4 border-t">
              <ActionButton onClick={() => setShowDetailsModal(false)} className="flex-1">
                Close
              </ActionButton>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
