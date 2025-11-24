'use client';

import { useState, useEffect } from 'react';
import { platformService } from '@/lib/api/services';

interface Backup {
  id: string;
  name: string;
  type: 'full' | 'incremental' | 'differential';
  status: 'completed' | 'in_progress' | 'failed' | 'scheduled';
  size: number;
  createdAt: string;
  completedAt: string;
  duration: number;
  tenantCount: number;
  dataSize: string;
  location: string;
  encryption: boolean;
  checksum: string;
  retentionDays: number;
  createdBy: string;
}

interface BackupSchedule {
  id: string;
  name: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  time: string;
  type: 'full' | 'incremental';
  retentionDays: number;
  isActive: boolean;
  lastRun: string;
  nextRun: string;
}

export default function GlobalBackupsPage() {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [schedules, setSchedules] = useState<BackupSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'backups' | 'schedules' | 'restore'>('backups');
  const [showCreate, setShowCreate] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Mock backups
      setBackups([
        {
          id: '1',
          name: 'Full Platform Backup - Nov 23',
          type: 'full',
          status: 'completed',
          size: 524288000000,
          createdAt: '2024-11-23T02:00:00Z',
          completedAt: '2024-11-23T04:30:00Z',
          duration: 9000,
          tenantCount: 1250,
          dataSize: '487.5 GB',
          location: 's3://backups/2024-11-23-full',
          encryption: true,
          checksum: 'sha256:a1b2c3d4...',
          retentionDays: 90,
          createdBy: 'system',
        },
        {
          id: '2',
          name: 'Incremental Backup - Nov 22',
          type: 'incremental',
          status: 'completed',
          size: 52428800000,
          createdAt: '2024-11-22T02:00:00Z',
          completedAt: '2024-11-22T02:45:00Z',
          duration: 2700,
          tenantCount: 1248,
          dataSize: '48.8 GB',
          location: 's3://backups/2024-11-22-incr',
          encryption: true,
          checksum: 'sha256:e5f6g7h8...',
          retentionDays: 30,
          createdBy: 'system',
        },
        {
          id: '3',
          name: 'Manual Backup - Pre-Update',
          type: 'full',
          status: 'completed',
          size: 520093696000,
          createdAt: '2024-11-20T14:00:00Z',
          completedAt: '2024-11-20T16:25:00Z',
          duration: 8700,
          tenantCount: 1245,
          dataSize: '484.5 GB',
          location: 's3://backups/2024-11-20-manual',
          encryption: true,
          checksum: 'sha256:i9j0k1l2...',
          retentionDays: 180,
          createdBy: 'admin@example.com',
        },
      ]);

      // Mock schedules
      setSchedules([
        {
          id: '1',
          name: 'Daily Incremental',
          frequency: 'daily',
          time: '02:00',
          type: 'incremental',
          retentionDays: 30,
          isActive: true,
          lastRun: '2024-11-23T02:00:00Z',
          nextRun: '2024-11-24T02:00:00Z',
        },
        {
          id: '2',
          name: 'Weekly Full Backup',
          frequency: 'weekly',
          time: '01:00',
          type: 'full',
          retentionDays: 90,
          isActive: true,
          lastRun: '2024-11-17T01:00:00Z',
          nextRun: '2024-11-24T01:00:00Z',
        },
        {
          id: '3',
          name: 'Monthly Archive',
          frequency: 'monthly',
          time: '00:00',
          type: 'full',
          retentionDays: 365,
          isActive: true,
          lastRun: '2024-11-01T00:00:00Z',
          nextRun: '2024-12-01T00:00:00Z',
        },
      ]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBackup = async () => {
    try {
      await platformService.createGlobalBackup?.({
        type: 'full',
        name: 'Manual Backup',
        tenantId: 'global',
      });
      setShowCreate(false);
      fetchData();
    } catch (error) {
      console.error('Failed to create backup:', error);
    }
  };

  const handleRestore = async (backupId: string) => {
    if (!confirm('This will restore the entire platform to this backup. Continue?')) return;
    try {
      await platformService.restoreGlobalBackup?.(backupId);
      alert('Restore initiated successfully!');
      fetchData();
    } catch (error) {
      console.error('Failed to restore backup:', error);
      alert('Restore failed. Check console for details.');
    }
  };

  const handleDownload = async (backupId: string) => {
    try {
      await platformService.downloadBackup?.(backupId);
      alert('Backup download started!');
    } catch (error) {
      console.error('Failed to download backup:', error);
      alert('Download failed. Check console for details.');
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      completed: 'bg-green-100 text-green-800',
      in_progress: 'bg-blue-100 text-blue-800',
      failed: 'bg-red-100 text-red-800',
      scheduled: 'bg-yellow-100 text-yellow-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100';
  };

  const getTypeBadge = (type: string) => {
    const colors = {
      full: 'bg-purple-100 text-purple-800',
      incremental: 'bg-blue-100 text-blue-800',
      differential: 'bg-indigo-100 text-indigo-800',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100';
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Platform Backups</h1>
          <p className="text-gray-600 mt-1">Manage platform-wide backup and disaster recovery</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Create Backup
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Total Backups</div>
          <div className="text-2xl font-bold">{backups.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Total Size</div>
          <div className="text-2xl font-bold">
            {formatBytes(backups.reduce((acc, b) => acc + b.size, 0))}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Last Backup</div>
          <div className="text-2xl font-bold">
            {new Date(backups[0]?.completedAt || '').toLocaleDateString()}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Active Schedules</div>
          <div className="text-2xl font-bold">
            {schedules.filter(s => s.isActive).length}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab('backups')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'backups'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Backups
          </button>
          <button
            onClick={() => setActiveTab('schedules')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'schedules'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Schedules
          </button>
          <button
            onClick={() => setActiveTab('restore')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'restore'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Restore
          </button>
        </div>
      </div>

      {/* Backups Tab */}
      {activeTab === 'backups' && (
        <div className="space-y-4">
          {backups.map((backup) => (
            <div key={backup.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold">{backup.name}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${getTypeBadge(backup.type)}`}>
                      {backup.type}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(backup.status)}`}>
                      {backup.status}
                    </span>
                    {backup.encryption && (
                      <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                        Encrypted
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">
                    Created: {new Date(backup.createdAt).toLocaleString()} |
                    Completed: {new Date(backup.completedAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleDownload(backup.id)}
                    className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
                  >
                    Download
                  </button>
                  <button
                    onClick={() => handleRestore(backup.id)}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Restore
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Size:</span>
                  <span className="ml-2 font-semibold">{backup.dataSize}</span>
                </div>
                <div>
                  <span className="text-gray-500">Duration:</span>
                  <span className="ml-2 font-semibold">{formatDuration(backup.duration)}</span>
                </div>
                <div>
                  <span className="text-gray-500">Tenants:</span>
                  <span className="ml-2 font-semibold">{backup.tenantCount.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-gray-500">Retention:</span>
                  <span className="ml-2 font-semibold">{backup.retentionDays} days</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500">
                <div>Location: {backup.location}</div>
                <div className="mt-1">Checksum: {backup.checksum}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Schedules Tab */}
      {activeTab === 'schedules' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold">Backup Schedules</h2>
            <button
              onClick={() => setShowSchedule(true)}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Add Schedule
            </button>
          </div>
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Frequency</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Run</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Next Run</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {schedules.map((schedule) => (
                <tr key={schedule.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium">{schedule.name}</td>
                  <td className="px-6 py-4 text-sm">{schedule.frequency}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-1 text-xs rounded-full ${getTypeBadge(schedule.type)}`}>
                      {schedule.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">{schedule.time}</td>
                  <td className="px-6 py-4 text-sm">{new Date(schedule.lastRun).toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm">{new Date(schedule.nextRun).toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={schedule.isActive}
                        onChange={() => {}}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <button className="text-blue-600 hover:text-blue-800 mr-3">Edit</button>
                    <button className="text-red-600 hover:text-red-800">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Restore Tab */}
      {activeTab === 'restore' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Disaster Recovery</h2>
          <div className="space-y-4">
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Warning</h3>
              <p className="text-sm text-yellow-700">
                Restoring a backup will replace all current platform data. This action cannot be undone.
                Ensure you have created a backup of the current state before proceeding.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Select Backup to Restore</label>
              <select className="w-full border border-gray-300 rounded-lg p-2">
                <option value="">Choose a backup...</option>
                {backups.map(backup => (
                  <option key={backup.id} value={backup.id}>
                    {backup.name} - {new Date(backup.createdAt).toLocaleDateString()} ({backup.dataSize})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Restore Options</label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" defaultChecked />
                  <span className="text-sm">Restore database</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" defaultChecked />
                  <span className="text-sm">Restore file storage</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" defaultChecked />
                  <span className="text-sm">Restore configuration</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm">Send notification to all admins</span>
                </label>
              </div>
            </div>

            <div className="pt-4">
              <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                Start Restore Process
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Backup Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Create Manual Backup</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Backup Name</label>
                <input
                  type="text"
                  placeholder="e.g., Pre-Migration Backup"
                  className="w-full border border-gray-300 rounded-lg p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Backup Type</label>
                <select className="w-full border border-gray-300 rounded-lg p-2">
                  <option value="full">Full Backup</option>
                  <option value="incremental">Incremental Backup</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Retention Days</label>
                <input
                  type="number"
                  defaultValue={90}
                  className="w-full border border-gray-300 rounded-lg p-2"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowCreate(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateBackup}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create Backup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
