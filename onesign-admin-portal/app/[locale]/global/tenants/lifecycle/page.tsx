'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { platformService } from '@/lib/api/services';

interface TenantHealth {
  tenantId: string;
  status: 'Healthy' | 'Degraded' | 'Unhealthy' | 'Suspended';
  usersCount: number;
  activeSessionsCount: number;
  storageUsed: number;
  lastActivityAt: string;
  issues?: string[];
}

interface TenantMetric {
  metric: string;
  value: number;
  unit: string;
  trend?: 'up' | 'down' | 'stable';
}

interface MigrationStatus {
  migrationId: string;
  status: 'Pending' | 'InProgress' | 'Completed' | 'Failed';
  progress: number;
  startedAt?: string;
  completedAt?: string;
  errorMessage?: string;
}

interface ExportJob {
  exportId: string;
  status: 'Pending' | 'InProgress' | 'Completed' | 'Failed';
  progress: number;
  downloadUrl?: string;
  createdAt: string;
}

type Tab = 'operations' | 'health' | 'data';

export default function TenantLifecyclePage() {
  const t = useTranslations();
  const [activeTab, setActiveTab] = useState<Tab>('operations');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [tenantId, setTenantId] = useState('');
  const [tenantHealth, setTenantHealth] = useState<TenantHealth | null>(null);
  const [tenantMetrics, setTenantMetrics] = useState<TenantMetric[]>([]);
  const [migrationStatus, setMigrationStatus] = useState<MigrationStatus | null>(null);
  const [exportJobs, setExportJobs] = useState<ExportJob[]>([]);
  const [migrationId, setMigrationId] = useState('');
  const [exportId, setExportId] = useState('');
  const [exportStatus, setExportStatus] = useState<ExportJob | null>(null);

  const fetchTenantHealth = async () => {
    if (!tenantId) return;

    setLoading(true);
    setError('');
    try {
      const data = await (platformService as any).getTenantHealthGlobal(tenantId);
      setTenantHealth(data);
    } catch (err: any) {
      setError(err.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const fetchTenantMetrics = async () => {
    if (!tenantId) return;

    setLoading(true);
    setError('');
    try {
      const data = await (platformService as any).getTenantMetricsGlobal(tenantId);
      setTenantMetrics(data.metrics || []);
    } catch (err: any) {
      setError(err.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const getMigrationStatus = async () => {
    if (!tenantId || !migrationId) {
      setError('Please enter both Tenant ID and Migration ID');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const data = await (platformService as any).getTenantMigrationStatus(tenantId, migrationId);
      setMigrationStatus(data);
    } catch (err: any) {
      setError(err.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const getExportStatus = async () => {
    if (!tenantId || !exportId) {
      setError('Please enter both Tenant ID and Export ID');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const data = await (platformService as any).getTenantExportStatus(tenantId, exportId);
      setExportStatus(data);
    } catch (err: any) {
      setError(err.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'health' && tenantId) {
      fetchTenantHealth();
      fetchTenantMetrics();
    }
  }, [activeTab, tenantId]);

  const handleSuspend = async () => {
    if (!tenantId) {
      setError('Please enter a Tenant ID');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await (platformService as any).suspendTenantGlobal(tenantId);
      setSuccess('Tenant suspended successfully');
      fetchTenantHealth();
    } catch (err: any) {
      setError(err.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleResume = async () => {
    if (!tenantId) {
      setError('Please enter a Tenant ID');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await (platformService as any).resumeTenantGlobal(tenantId);
      setSuccess('Tenant resumed successfully');
      fetchTenantHealth();
    } catch (err: any) {
      setError(err.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleMigrate = async () => {
    if (!tenantId) {
      setError('Please enter a Tenant ID');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const data = await (platformService as any).migrateTenant(tenantId);
      setMigrationStatus(data);
      setSuccess('Migration started successfully');
    } catch (err: any) {
      setError(err.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    if (!tenantId) {
      setError('Please enter a Tenant ID');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const data = await (platformService as any).exportTenantData(tenantId);
      setExportJobs([data, ...exportJobs]);
      setSuccess('Export started successfully');
    } catch (err: any) {
      setError(err.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!tenantId) {
      setError('Please enter a Tenant ID');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await (platformService as any).importTenantData(tenantId);
      setSuccess('Import started successfully');
    } catch (err: any) {
      setError(err.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Healthy':
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Degraded':
      case 'InProgress':
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Unhealthy':
      case 'Suspended':
      case 'Failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Tenant Lifecycle Management</h1>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>
      )}

      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">{success}</div>
      )}

      <div className="mb-6 bg-white rounded-lg shadow p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Tenant ID</label>
        <input
          type="text"
          value={tenantId}
          onChange={(e) => setTenantId(e.target.value)}
          placeholder="Enter Tenant ID"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {(['operations', 'health', 'data'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab === 'operations' ? 'Operations' :
               tab === 'health' ? 'Health Monitor' :
               'Data Management'}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'operations' && (
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Tenant Operations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Suspend Tenant</h3>
                <p className="text-sm text-gray-500 mb-4">Temporarily disable tenant access</p>
                <button
                  onClick={handleSuspend}
                  disabled={loading || !tenantId}
                  className="w-full bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Suspend
                </button>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Resume Tenant</h3>
                <p className="text-sm text-gray-500 mb-4">Re-enable suspended tenant</p>
                <button
                  onClick={handleResume}
                  disabled={loading || !tenantId}
                  className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Resume
                </button>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Migrate Tenant</h3>
                <p className="text-sm text-gray-500 mb-4">Start tenant migration process</p>
                <button
                  onClick={handleMigrate}
                  disabled={loading || !tenantId}
                  className="w-full bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Start Migration
                </button>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Migration Status</h3>
                {migrationStatus ? (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Status</span>
                      <span className={`px-2 py-1 rounded text-xs ${getStatusColor(migrationStatus.status)}`}>
                        {migrationStatus.status}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Progress</span>
                      <span className="text-sm font-medium">{migrationStatus.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-indigo-600 h-2 rounded-full"
                        style={{ width: `${migrationStatus.progress}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No active migration</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'health' && (
        <div className="space-y-6">
          {!tenantId ? (
            <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
              Please enter a Tenant ID to view health information
            </div>
          ) : (
            <>
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Tenant Health</h2>
                {tenantHealth ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="border border-gray-200 rounded-lg p-4">
                        <div className="text-sm text-gray-500">Status</div>
                        <div className="mt-2">
                          <span className={`px-2 py-1 rounded text-xs ${getStatusColor(tenantHealth.status)}`}>
                            {tenantHealth.status}
                          </span>
                        </div>
                      </div>
                      <div className="border border-gray-200 rounded-lg p-4">
                        <div className="text-sm text-gray-500">Users</div>
                        <div className="text-2xl font-bold text-gray-900 mt-1">{tenantHealth.usersCount}</div>
                      </div>
                      <div className="border border-gray-200 rounded-lg p-4">
                        <div className="text-sm text-gray-500">Active Sessions</div>
                        <div className="text-2xl font-bold text-gray-900 mt-1">{tenantHealth.activeSessionsCount}</div>
                      </div>
                      <div className="border border-gray-200 rounded-lg p-4">
                        <div className="text-sm text-gray-500">Storage Used</div>
                        <div className="text-2xl font-bold text-gray-900 mt-1">{tenantHealth.storageUsed} MB</div>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Last Activity</div>
                      <div className="text-base">{new Date(tenantHealth.lastActivityAt).toLocaleString()}</div>
                    </div>
                    {tenantHealth.issues && tenantHealth.issues.length > 0 && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <h3 className="font-medium text-red-900 mb-2">Issues</h3>
                        <ul className="list-disc list-inside space-y-1">
                          {tenantHealth.issues.map((issue, index) => (
                            <li key={index} className="text-sm text-red-700">{issue}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : loading ? (
                  <p className="text-gray-500">Loading...</p>
                ) : (
                  <button
                    onClick={fetchTenantHealth}
                    className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                  >
                    Load Health Data
                  </button>
                )}
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Tenant Metrics</h2>
                {tenantMetrics.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tenantMetrics.map((metric, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-sm text-gray-500">{metric.metric}</div>
                          {metric.trend && (
                            <div className={`text-xs ${
                              metric.trend === 'up' ? 'text-green-600' :
                              metric.trend === 'down' ? 'text-red-600' :
                              'text-gray-600'
                            }`}>
                              {metric.trend === 'up' ? '↑' : metric.trend === 'down' ? '↓' : '→'}
                            </div>
                          )}
                        </div>
                        <div className="text-2xl font-bold text-gray-900">
                          {metric.value} <span className="text-sm font-normal text-gray-500">{metric.unit}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : loading ? (
                  <p className="text-gray-500">Loading...</p>
                ) : (
                  <p className="text-gray-500">No metrics available</p>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {activeTab === 'data' && (
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Data Management</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Export Tenant Data</h3>
                <p className="text-sm text-gray-500 mb-4">Export all tenant data for backup or migration</p>
                <button
                  onClick={handleExport}
                  disabled={loading || !tenantId}
                  className="w-full bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Start Export
                </button>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Import Tenant Data</h3>
                <p className="text-sm text-gray-500 mb-4">Import previously exported tenant data</p>
                <button
                  onClick={handleImport}
                  disabled={loading || !tenantId}
                  className="w-full bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Start Import
                </button>
              </div>
            </div>
          </div>

          {exportJobs.length > 0 && (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Export Jobs</h2>
              </div>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Export ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Progress</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created At</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {exportJobs.map((job) => (
                    <tr key={job.exportId}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{job.exportId}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded text-xs ${getStatusColor(job.status)}`}>
                          {job.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-indigo-600 h-2 rounded-full"
                              style={{ width: `${job.progress}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-500">{job.progress}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(job.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {job.downloadUrl && job.status === 'Completed' ? (
                          <a
                            href={job.downloadUrl}
                            className="text-indigo-600 hover:text-indigo-900"
                            download
                          >
                            Download
                          </a>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
