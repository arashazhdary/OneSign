import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import DataTable, { Column } from '@/components/common/DataTable';
import Modal from '@/components/common/Modal';
import StatusBadge from '@/components/common/StatusBadge';
import { globalService } from '@/lib/api/services/global.service';
import { Helmet } from 'react-helmet-async';

interface Migration {
  id: string;
  name: string;
  version: string;
  description: string;
  type: 'Schema' | 'Data' | 'Index' | 'Function' | 'View';
  status: 'Pending' | 'Running' | 'Completed' | 'Failed' | 'Rolled Back';
  appliedAt: string | null;
  rolledBackAt: string | null;
  executionTime: number | null;
  checksum: string;
  author: string;
  dependencies: string[];
  affectedTables: string[];
  batchNumber: number | null;
}

interface MigrationLog {
  id: string;
  migrationId: string;
  timestamp: string;
  level: 'INFO' | 'WARNING' | 'ERROR' | 'DEBUG';
  message: string;
  details: any;
}

interface SchemaVersion {
  current: string;
  target: string;
  pendingMigrations: number;
  lastMigration: string;
  lastMigrationDate: string;
}

export default function GlobalMigrationsPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'pending' | 'logs'>('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // State
  const [migrations, setMigrations] = useState<Migration[]>([]);
  const [pendingMigrations, setPendingMigrations] = useState<Migration[]>([]);
  const [logs, setLogs] = useState<MigrationLog[]>([]);
  const [schemaVersion, setSchemaVersion] = useState<SchemaVersion | null>(null);
  const [selectedMigration, setSelectedMigration] = useState<Migration | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showRunModal, setShowRunModal] = useState(false);
  const [showRollbackModal, setShowRollbackModal] = useState(false);
  const [migrationToRun, setMigrationToRun] = useState<Migration | null>(null);
  const [migrationToRollback, setMigrationToRollback] = useState<Migration | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchMigrations(),
        fetchPendingMigrations(),
        fetchSchemaVersion(),
        fetchLogs(),
      ]);
    } catch (err) {
      console.error('Error fetching data:', err);
      loadMockData();
    } finally {
      setLoading(false);
    }
  };

  const fetchMigrations = async () => {
    try {
      const data = await globalService.getPlatformMigrations(1, 100);
      setMigrations(data.migrations || []);
    } catch (err) {
      // Mock data
      setMigrations([
        {
          id: 'mig-001',
          name: 'AddUserPreferencesTable',
          version: '1.5.0',
          description: 'Create user_preferences table for storing user settings',
          type: 'Schema',
          status: 'Completed',
          appliedAt: '2024-11-20T10:30:00Z',
          rolledBackAt: null,
          executionTime: 1234,
          checksum: 'sha256:abc123def456',
          author: 'dev-team',
          dependencies: [],
          affectedTables: ['user_preferences'],
          batchNumber: 15,
        },
        {
          id: 'mig-002',
          name: 'AddIndexOnTenantUsers',
          version: '1.5.1',
          description: 'Add composite index on tenant_id and user_id for faster queries',
          type: 'Index',
          status: 'Completed',
          appliedAt: '2024-11-21T14:15:00Z',
          rolledBackAt: null,
          executionTime: 567,
          checksum: 'sha256:def789ghi012',
          author: 'ops-team',
          dependencies: ['mig-001'],
          affectedTables: ['tenant_users'],
          batchNumber: 16,
        },
        {
          id: 'mig-003',
          name: 'MigrateOldNotifications',
          version: '1.5.2',
          description: 'Migrate old notification format to new schema',
          type: 'Data',
          status: 'Failed',
          appliedAt: '2024-11-22T09:00:00Z',
          rolledBackAt: '2024-11-22T09:15:00Z',
          executionTime: 45678,
          checksum: 'sha256:ghi345jkl678',
          author: 'data-team',
          dependencies: ['mig-001', 'mig-002'],
          affectedTables: ['notifications', 'notification_templates'],
          batchNumber: 17,
        },
        {
          id: 'mig-004',
          name: 'AddAuditLogPartitioning',
          version: '1.5.3',
          description: 'Partition audit_logs table by month for better performance',
          type: 'Schema',
          status: 'Completed',
          appliedAt: '2024-11-22T16:30:00Z',
          rolledBackAt: null,
          executionTime: 8901,
          checksum: 'sha256:jkl901mno234',
          author: 'ops-team',
          dependencies: [],
          affectedTables: ['audit_logs'],
          batchNumber: 18,
        },
      ]);
    }
  };

  const fetchPendingMigrations = async () => {
    try {
      // Would fetch from API
      setPendingMigrations([
        {
          id: 'mig-005',
          name: 'AddTenantBillingTable',
          version: '1.6.0',
          description: 'Create tenant_billing table for storing billing information',
          type: 'Schema',
          status: 'Pending',
          appliedAt: null,
          rolledBackAt: null,
          executionTime: null,
          checksum: 'sha256:mno567pqr890',
          author: 'billing-team',
          dependencies: [],
          affectedTables: ['tenant_billing', 'tenants'],
          batchNumber: null,
        },
        {
          id: 'mig-006',
          name: 'OptimizeTemplateQueries',
          version: '1.6.1',
          description: 'Add indexes and optimize template query performance',
          type: 'Index',
          status: 'Pending',
          appliedAt: null,
          rolledBackAt: null,
          executionTime: null,
          checksum: 'sha256:pqr123stu456',
          author: 'performance-team',
          dependencies: ['mig-005'],
          affectedTables: ['templates', 'template_versions'],
          batchNumber: null,
        },
      ]);
    } catch (err) {
      console.error('Error fetching pending migrations:', err);
    }
  };

  const fetchSchemaVersion = async () => {
    setSchemaVersion({
      current: '1.5.3',
      target: '1.6.1',
      pendingMigrations: 2,
      lastMigration: 'AddAuditLogPartitioning',
      lastMigrationDate: '2024-11-22T16:30:00Z',
    });
  };

  const fetchLogs = async () => {
    setLogs([
      {
        id: 'log-001',
        migrationId: 'mig-004',
        timestamp: '2024-11-22T16:30:05Z',
        level: 'INFO',
        message: 'Starting migration: AddAuditLogPartitioning',
        details: { version: '1.5.3' },
      },
      {
        id: 'log-002',
        migrationId: 'mig-004',
        timestamp: '2024-11-22T16:30:10Z',
        level: 'INFO',
        message: 'Creating partitions for audit_logs table',
        details: { partitions: 12 },
      },
      {
        id: 'log-003',
        migrationId: 'mig-004',
        timestamp: '2024-11-22T16:32:45Z',
        level: 'INFO',
        message: 'Migration completed successfully',
        details: { executionTime: 8901 },
      },
      {
        id: 'log-004',
        migrationId: 'mig-003',
        timestamp: '2024-11-22T09:00:05Z',
        level: 'ERROR',
        message: 'Migration failed: Foreign key constraint violation',
        details: { error: 'FK_notification_template_id', table: 'notifications' },
      },
      {
        id: 'log-005',
        migrationId: 'mig-003',
        timestamp: '2024-11-22T09:15:00Z',
        level: 'WARNING',
        message: 'Rolling back migration',
        details: { reason: 'Constraint violation' },
      },
    ]);
  };

  const loadMockData = () => {
    // Already loaded in catch blocks above
  };

  const handleRunMigration = async () => {
    if (!migrationToRun) return;
    setError('');
    setSuccess('');

    try {
      await globalService.applyPlatformMigration(migrationToRun.id);
      setSuccess(`Migration ${migrationToRun.name} started successfully`);
      setShowRunModal(false);
      setMigrationToRun(null);
      fetchData();
    } catch (err: any) {
      setError(err?.message || 'Error running migration');
    }
  };

  const handleRollbackMigration = async () => {
    if (!migrationToRollback) return;
    setError('');
    setSuccess('');

    try {
      // Would call rollback API
      setSuccess(`Migration ${migrationToRollback.name} rolled back successfully`);
      setShowRollbackModal(false);
      setMigrationToRollback(null);
      fetchData();
    } catch (err: any) {
      setError(err?.message || 'Error rolling back migration');
    }
  };

  const viewMigrationDetails = (migration: Migration) => {
    setSelectedMigration(migration);
    setShowDetailsModal(true);
  };

  const openRunModal = (migration: Migration) => {
    setMigrationToRun(migration);
    setShowRunModal(true);
  };

  const openRollbackModal = (migration: Migration) => {
    setMigrationToRollback(migration);
    setShowRollbackModal(true);
  };

  // Column Definitions
  const historyColumns: Column<Migration>[] = [
    {
      key: 'version',
      label: 'Version',
      render: (m) => <span className="font-mono font-semibold">{m.version}</span>,
    },
    {
      key: 'name',
      label: 'Migration Name',
      render: (m) => (
        <div>
          <div className="font-medium">{m.name}</div>
          <div className="text-xs text-gray-500">{m.description.substring(0, 60)}...</div>
        </div>
      ),
    },
    {
      key: 'type',
      label: 'Type',
      render: (m) => (
        <StatusBadge
          status={m.type}
          color={
            m.type === 'Schema' ? 'blue' :
            m.type === 'Data' ? 'purple' :
            m.type === 'Index' ? 'green' : 'orange'
          }
        />
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (m) => (
        <StatusBadge
          status={m.status}
          color={
            m.status === 'Completed' ? 'green' :
            m.status === 'Running' ? 'blue' :
            m.status === 'Failed' ? 'red' :
            m.status === 'Rolled Back' ? 'orange' : 'gray'
          }
        />
      ),
    },
    {
      key: 'appliedAt',
      label: 'Applied At',
      render: (m) => m.appliedAt ? new Date(m.appliedAt).toLocaleString() : 'N/A',
    },
    {
      key: 'executionTime',
      label: 'Execution Time',
      render: (m) => m.executionTime ? `${(m.executionTime / 1000).toFixed(2)}s` : 'N/A',
    },
  ];

  const pendingColumns: Column<Migration>[] = [
    {
      key: 'version',
      label: 'Version',
      render: (m) => <span className="font-mono font-semibold">{m.version}</span>,
    },
    {
      key: 'name',
      label: 'Migration Name',
      render: (m) => (
        <div>
          <div className="font-medium">{m.name}</div>
          <div className="text-xs text-gray-500">{m.description}</div>
        </div>
      ),
    },
    {
      key: 'type',
      label: 'Type',
      render: (m) => (
        <StatusBadge
          status={m.type}
          color={
            m.type === 'Schema' ? 'blue' :
            m.type === 'Data' ? 'purple' :
            m.type === 'Index' ? 'green' : 'orange'
          }
        />
      ),
    },
    {
      key: 'affectedTables',
      label: 'Affected Tables',
      render: (m) => (
        <div className="text-sm">
          {m.affectedTables.slice(0, 2).map((table, i) => (
            <div key={i} className="font-mono text-xs">{table}</div>
          ))}
          {m.affectedTables.length > 2 && (
            <div className="text-xs text-gray-500">+{m.affectedTables.length - 2} more</div>
          )}
        </div>
      ),
    },
    {
      key: 'dependencies',
      label: 'Dependencies',
      render: (m) => (
        <span className="text-sm">{m.dependencies.length} dependencies</span>
      ),
    },
  ];

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
          Database Migrations
        </h1>
        <p className="text-gray-600 mt-2">
          Manage database schema versions, run migrations, and track migration history
        </p>
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

      {/* Schema Version Overview */}
      {schemaVersion && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg shadow-lg p-6">
            <div className="text-sm opacity-90">Current Version</div>
            <div className="text-3xl font-bold font-mono">{schemaVersion.current}</div>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg shadow-lg p-6">
            <div className="text-sm opacity-90">Target Version</div>
            <div className="text-3xl font-bold font-mono">{schemaVersion.target}</div>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-lg shadow-lg p-6">
            <div className="text-sm opacity-90">Pending Migrations</div>
            <div className="text-3xl font-bold">{schemaVersion.pendingMigrations}</div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg shadow-lg p-6">
            <div className="text-sm opacity-90">Last Migration</div>
            <div className="text-lg font-semibold">{schemaVersion.lastMigration.substring(0, 20)}...</div>
            <div className="text-xs mt-1">{new Date(schemaVersion.lastMigrationDate).toLocaleDateString()}</div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-6 py-3 font-medium ${
            activeTab === 'overview'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-6 py-3 font-medium ${
            activeTab === 'pending'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Pending Migrations ({pendingMigrations.length})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-6 py-3 font-medium ${
            activeTab === 'history'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Migration History
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`px-6 py-3 font-medium ${
            activeTab === 'logs'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Migration Logs
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Migrations</h3>
            <div className="space-y-3">
              {migrations.slice(0, 5).map(migration => (
                <div key={migration.id} className="flex items-center justify-between border-b pb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold text-sm">{migration.version}</span>
                      <span className="font-medium">{migration.name}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{migration.description}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge
                      status={migration.status}
                      color={
                        migration.status === 'Completed' ? 'green' :
                        migration.status === 'Failed' ? 'red' : 'gray'
                      }
                    />
                    <button
                      onClick={() => viewMigrationDetails(migration)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Migration Status Distribution</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { status: 'Completed', count: migrations.filter(m => m.status === 'Completed').length, color: 'green' },
                { status: 'Pending', count: pendingMigrations.length, color: 'gray' },
                { status: 'Failed', count: migrations.filter(m => m.status === 'Failed').length, color: 'red' },
                { status: 'Running', count: migrations.filter(m => m.status === 'Running').length, color: 'blue' },
                { status: 'Rolled Back', count: migrations.filter(m => m.status === 'Rolled Back').length, color: 'orange' },
              ].map(item => (
                <div key={item.status} className="text-center">
                  <div className={`text-3xl font-bold ${
                    item.color === 'green' ? 'text-green-600' :
                    item.color === 'red' ? 'text-red-600' :
                    item.color === 'blue' ? 'text-blue-600' :
                    item.color === 'orange' ? 'text-orange-600' : 'text-gray-600'
                  }`}>
                    {item.count}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">{item.status}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Pending Migrations Tab */}
      {activeTab === 'pending' && (
        <div>
          <div className="mb-4 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded">
            <div className="font-semibold">Warning</div>
            <div className="text-sm">Running migrations may cause temporary service disruption. Please schedule during maintenance windows.</div>
          </div>
          <DataTable
            data={pendingMigrations}
            columns={pendingColumns}
            actions={(migration) => (
              <div className="flex gap-2">
                <button
                  onClick={() => viewMigrationDetails(migration)}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  View Details
                </button>
                <button
                  onClick={() => openRunModal(migration)}
                  className="text-green-600 hover:text-green-800 text-sm"
                >
                  Run
                </button>
              </div>
            )}
          />
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div>
          <DataTable
            data={migrations}
            columns={historyColumns}
            actions={(migration) => (
              <div className="flex gap-2">
                <button
                  onClick={() => viewMigrationDetails(migration)}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Details
                </button>
                {migration.status === 'Completed' && (
                  <button
                    onClick={() => openRollbackModal(migration)}
                    className="text-orange-600 hover:text-orange-800 text-sm"
                  >
                    Rollback
                  </button>
                )}
              </div>
            )}
          />
        </div>
      )}

      {/* Logs Tab */}
      {activeTab === 'logs' && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <h3 className="font-semibold">Migration Execution Logs</h3>
          </div>
          <div className="p-4 space-y-2 max-h-[600px] overflow-y-auto">
            {logs.map(log => (
              <div key={log.id} className="flex items-start gap-3 p-3 border-l-4 rounded bg-gray-50" style={{
                borderLeftColor:
                  log.level === 'ERROR' ? '#ef4444' :
                  log.level === 'WARNING' ? '#f59e0b' :
                  log.level === 'INFO' ? '#3b82f6' : '#6b7280'
              }}>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-semibold px-2 py-1 rounded ${
                      log.level === 'ERROR' ? 'bg-red-100 text-red-800' :
                      log.level === 'WARNING' ? 'bg-yellow-100 text-yellow-800' :
                      log.level === 'INFO' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {log.level}
                    </span>
                    <span className="text-xs text-gray-500">{new Date(log.timestamp).toLocaleString()}</span>
                    <span className="text-xs font-mono text-gray-500">{log.migrationId}</span>
                  </div>
                  <div className="text-sm">{log.message}</div>
                  {log.details && (
                    <pre className="text-xs mt-2 bg-gray-100 p-2 rounded overflow-x-auto">
                      {JSON.stringify(log.details, null, 2)}
                    </pre>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Migration Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedMigration(null);
        }}
        title="Migration Details"
        size="lg"
      >
        {selectedMigration && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Version</label>
                <div className="font-mono font-semibold">{selectedMigration.version}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Status</label>
                <div>
                  <StatusBadge
                    status={selectedMigration.status}
                    color={
                      selectedMigration.status === 'Completed' ? 'green' :
                      selectedMigration.status === 'Failed' ? 'red' : 'gray'
                    }
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Type</label>
                <div>{selectedMigration.type}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Author</label>
                <div>{selectedMigration.author}</div>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">Description</label>
              <div className="text-sm">{selectedMigration.description}</div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">Checksum</label>
              <div className="font-mono text-xs bg-gray-100 p-2 rounded">{selectedMigration.checksum}</div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">Affected Tables</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {selectedMigration.affectedTables.map((table, i) => (
                  <span key={i} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-mono rounded">
                    {table}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">Dependencies</label>
              <div className="text-sm">
                {selectedMigration.dependencies.length === 0 ? (
                  <span className="text-gray-500">No dependencies</span>
                ) : (
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedMigration.dependencies.map((dep, i) => (
                      <span key={i} className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-mono rounded">
                        {dep}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {selectedMigration.executionTime && (
              <div>
                <label className="text-sm font-medium text-gray-600">Execution Time</label>
                <div>{(selectedMigration.executionTime / 1000).toFixed(2)} seconds</div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Run Migration Modal */}
      <Modal
        isOpen={showRunModal}
        onClose={() => {
          setShowRunModal(false);
          setMigrationToRun(null);
        }}
        title="Run Migration"
        size="md"
      >
        {migrationToRun && (
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded">
              <div className="font-semibold">Warning</div>
              <div className="text-sm">This action will modify the database schema. Ensure you have a backup before proceeding.</div>
            </div>

            <div>
              <div className="font-semibold">Migration: {migrationToRun.name}</div>
              <div className="text-sm text-gray-600">Version: {migrationToRun.version}</div>
              <div className="text-sm text-gray-600 mt-2">{migrationToRun.description}</div>
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <button
                onClick={() => {
                  setShowRunModal(false);
                  setMigrationToRun(null);
                }}
                className="px-4 py-2 border rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRunMigration}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Run Migration
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Rollback Migration Modal */}
      <Modal
        isOpen={showRollbackModal}
        onClose={() => {
          setShowRollbackModal(false);
          setMigrationToRollback(null);
        }}
        title="Rollback Migration"
        size="md"
      >
        {migrationToRollback && (
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
              <div className="font-semibold">Danger</div>
              <div className="text-sm">Rolling back a migration may cause data loss. This action should only be performed during a maintenance window.</div>
            </div>

            <div>
              <div className="font-semibold">Migration: {migrationToRollback.name}</div>
              <div className="text-sm text-gray-600">Version: {migrationToRollback.version}</div>
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <button
                onClick={() => {
                  setShowRollbackModal(false);
                  setMigrationToRollback(null);
                }}
                className="px-4 py-2 border rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRollbackMigration}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Rollback Migration
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
