'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { getTenantId } from '@/lib/tenant-context';
import { platformService } from '@/lib/api/services';

// Types
interface Backup {
  id: string;
  name: string;
  type: 'Manual' | 'Scheduled' | 'Pre-Migration';
  status: 'Completed' | 'In Progress' | 'Failed' | 'Verified';
  size: number;
  createdAt: string;
  createdBy: string;
  expiresAt?: string;
  includesUsers: boolean;
  includesApps: boolean;
  includesSettings: boolean;
  verifiedAt?: string;
}

interface BackupSchedule {
  id: string;
  frequency: 'Daily' | 'Weekly' | 'Monthly';
  time: string;
  retention: number;
  enabled: boolean;
  nextRun: string;
  lastRun?: string;
}

export default function BackupsPage() {
  const t = useTranslations();
  const [tenantId, setTenantIdState] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [backups, setBackups] = useState<Backup[]>([]);
  const [schedule, setSchedule] = useState<BackupSchedule | null>(null);
  const [selectedBackup, setSelectedBackup] = useState<Backup | null>(null);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Form state
  const [backupName, setBackupName] = useState('');
  const [includeUsers, setIncludeUsers] = useState(true);
  const [includeApps, setIncludeApps] = useState(true);
  const [includeSettings, setIncludeSettings] = useState(true);

  // Schedule form
  const [scheduleFrequency, setScheduleFrequency] = useState<'Daily' | 'Weekly' | 'Monthly'>('Daily');
  const [scheduleTime, setScheduleTime] = useState('02:00');
  const [scheduleRetention, setScheduleRetention] = useState(30);
  const [scheduleEnabled, setScheduleEnabled] = useState(true);

  useEffect(() => {
    const contextTenantId = getTenantId();
    setTenantIdState(contextTenantId || '00000000-0000-0000-0000-000000000000');
  }, []);

  useEffect(() => {
    if (tenantId) {
      fetchBackups();
      fetchSchedule();
    }
  }, [tenantId]);

  const fetchBackups = async () => {
    if (!tenantId) return;

    setLoading(true);
    try {
      // Mock data
      const mockBackups: Backup[] = [
        {
          id: '1',
          name: 'Pre-migration backup',
          type: 'Pre-Migration',
          status: 'Verified',
          size: 2048000,
          createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
          createdBy: 'admin@example.com',
          expiresAt: new Date(Date.now() + 86400000 * 23).toISOString(),
          includesUsers: true,
          includesApps: true,
          includesSettings: true,
          verifiedAt: new Date(Date.now() - 86400000 * 7).toISOString(),
        },
        {
          id: '2',
          name: 'Daily backup - 2024-01-15',
          type: 'Scheduled',
          status: 'Completed',
          size: 1843200,
          createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
          createdBy: 'system',
          expiresAt: new Date(Date.now() + 86400000 * 27).toISOString(),
          includesUsers: true,
          includesApps: true,
          includesSettings: true,
        },
        {
          id: '3',
          name: 'Manual backup before config change',
          type: 'Manual',
          status: 'Completed',
          size: 1920000,
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          createdBy: 'john.doe@example.com',
          includesUsers: false,
          includesApps: true,
          includesSettings: true,
        },
        {
          id: '4',
          name: 'Daily backup - 2024-01-16',
          type: 'Scheduled',
          status: 'In Progress',
          size: 0,
          createdAt: new Date().toISOString(),
          createdBy: 'system',
          includesUsers: true,
          includesApps: true,
          includesSettings: true,
        },
      ];

      setBackups(mockBackups);
    } catch (err) {
      setError('Failed to fetch backups');
      console.error('Error fetching backups:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSchedule = async () => {
    if (!tenantId) return;

    try {
      // Mock data
      const mockSchedule: BackupSchedule = {
        id: '1',
        frequency: 'Daily',
        time: '02:00',
        retention: 30,
        enabled: true,
        nextRun: new Date(Date.now() + 3600000 * 8).toISOString(),
        lastRun: new Date(Date.now() - 86400000).toISOString(),
      };

      setSchedule(mockSchedule);
      setScheduleFrequency(mockSchedule.frequency);
      setScheduleTime(mockSchedule.time);
      setScheduleRetention(mockSchedule.retention);
      setScheduleEnabled(mockSchedule.enabled);
    } catch (err) {
      console.error('Error fetching schedule:', err);
    }
  };

  const handleCreateBackup = async () => {
    if (!tenantId || !backupName) {
      setError('Please provide a backup name');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setSuccess('Backup created successfully');
      setShowCreateModal(false);
      setBackupName('');
      fetchBackups();
    } catch (err) {
      setError('Failed to create backup');
      console.error('Error creating backup:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreBackup = async () => {
    if (!tenantId || !selectedBackup) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setSuccess('Backup restored successfully');
      setShowRestoreModal(false);
      setSelectedBackup(null);
    } catch (err) {
      setError('Failed to restore backup');
      console.error('Error restoring backup:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyBackup = async (backup: Backup) => {
    if (!tenantId) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setSuccess('Backup verified successfully');
      fetchBackups();
    } catch (err) {
      setError('Failed to verify backup');
      console.error('Error verifying backup:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBackup = async () => {
    if (!tenantId || !selectedBackup) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setSuccess('Backup deleted successfully');
      setShowDeleteConfirm(false);
      setSelectedBackup(null);
      fetchBackups();
    } catch (err) {
      setError('Failed to delete backup');
      console.error('Error deleting backup:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSchedule = async () => {
    if (!tenantId) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setSuccess('Backup schedule updated successfully');
      setShowScheduleModal(false);
      fetchSchedule();
    } catch (err) {
      setError('Failed to update schedule');
      console.error('Error updating schedule:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadBackup = (backup: Backup) => {
    // Simulate download
    const link = document.createElement('a');
    link.href = '#';
    link.download = `${backup.name}.backup`;
    link.click();
    setSuccess('Backup download started');
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
      case 'Verified':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Failed':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="p-8 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Backup Management
            </h1>
            <p className="text-gray-600 mt-2">
              Create, manage, and restore tenant data backups
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold"
          >
            Create Manual Backup
          </button>
        </div>
      </div>

      {/* Success/Error Messages */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg shadow-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-lg shadow-sm">
          {success}
        </div>
      )}

      {/* Backup Schedule Card */}
      {schedule && (
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Backup Schedule</h2>
            <button
              onClick={() => setShowScheduleModal(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Configure Schedule
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Frequency</label>
              <p className="text-lg font-semibold text-gray-900">{schedule.frequency}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Time</label>
              <p className="text-lg font-semibold text-gray-900">{schedule.time}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Retention</label>
              <p className="text-lg font-semibold text-gray-900">{schedule.retention} days</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Status</label>
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                  schedule.enabled
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {schedule.enabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t flex items-center justify-between text-sm">
            <div>
              <span className="text-gray-500">Next run:</span>
              <span className="ml-2 font-medium text-gray-900">
                {new Date(schedule.nextRun).toLocaleString()}
              </span>
            </div>
            {schedule.lastRun && (
              <div>
                <span className="text-gray-500">Last run:</span>
                <span className="ml-2 font-medium text-gray-900">
                  {new Date(schedule.lastRun).toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Backups List */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
          <h2 className="text-xl font-bold text-white">Backups</h2>
          <p className="text-blue-100 text-sm mt-1">{backups.length} backups available</p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Size
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {backups.length > 0 ? (
                backups.map((backup) => (
                  <tr key={backup.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-semibold text-gray-900">{backup.name}</div>
                        <div className="text-xs text-gray-500">by {backup.createdBy}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{backup.type}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(backup.status)}`}>
                        {backup.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatBytes(backup.size)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{new Date(backup.createdAt).toLocaleDateString()}</div>
                      <div className="text-xs text-gray-500">{new Date(backup.createdAt).toLocaleTimeString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        {backup.status === 'Completed' && (
                          <>
                            <button
                              onClick={() => {
                                setSelectedBackup(backup);
                                setShowRestoreModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-800 font-medium"
                            >
                              Restore
                            </button>
                            <span className="text-gray-300">|</span>
                            <button
                              onClick={() => handleDownloadBackup(backup)}
                              className="text-green-600 hover:text-green-800 font-medium"
                            >
                              Download
                            </button>
                            <span className="text-gray-300">|</span>
                            {!backup.verifiedAt && (
                              <>
                                <button
                                  onClick={() => handleVerifyBackup(backup)}
                                  className="text-purple-600 hover:text-purple-800 font-medium"
                                >
                                  Verify
                                </button>
                                <span className="text-gray-300">|</span>
                              </>
                            )}
                            <button
                              onClick={() => {
                                setSelectedBackup(backup);
                                setShowDeleteConfirm(true);
                              }}
                              className="text-red-600 hover:text-red-800 font-medium"
                            >
                              Delete
                            </button>
                          </>
                        )}
                        {backup.status === 'In Progress' && (
                          <span className="text-gray-500">Processing...</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    {loading ? (
                      <div>Loading backups...</div>
                    ) : (
                      <div>
                        <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                        </svg>
                        <p>No backups available</p>
                        <p className="text-sm mt-2">Create your first backup to get started</p>
                      </div>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Backup Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full shadow-2xl">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
              <h2 className="text-xl font-bold text-white">Create Manual Backup</h2>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Backup Name</label>
                <input
                  type="text"
                  value={backupName}
                  onChange={(e) => setBackupName(e.target.value)}
                  placeholder="Enter backup name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Include in Backup</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={includeUsers}
                      onChange={(e) => setIncludeUsers(e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700">Users</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={includeApps}
                      onChange={(e) => setIncludeApps(e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700">Applications</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={includeSettings}
                      onChange={(e) => setIncludeSettings(e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700">Settings</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-2 border-t">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateBackup}
                disabled={loading || !backupName}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Backup'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Restore Backup Modal */}
      {showRestoreModal && selectedBackup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full shadow-2xl">
            <div className="bg-gradient-to-r from-orange-600 to-red-600 px-6 py-4">
              <h2 className="text-xl font-bold text-white">Restore Backup</h2>
            </div>

            <div className="p-6">
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-4">
                <p className="text-sm text-yellow-800">
                  <strong>Warning:</strong> Restoring this backup will replace all current data. This action cannot be undone.
                </p>
              </div>

              <div className="space-y-2">
                <div>
                  <span className="text-sm text-gray-500">Backup Name:</span>
                  <p className="font-semibold text-gray-900">{selectedBackup.name}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Created:</span>
                  <p className="text-gray-900">{new Date(selectedBackup.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Size:</span>
                  <p className="text-gray-900">{formatBytes(selectedBackup.size)}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-2 border-t">
              <button
                onClick={() => {
                  setShowRestoreModal(false);
                  setSelectedBackup(null);
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleRestoreBackup}
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? 'Restoring...' : 'Restore Backup'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Configuration Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full shadow-2xl">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4">
              <h2 className="text-xl font-bold text-white">Configure Backup Schedule</h2>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Frequency</label>
                <select
                  value={scheduleFrequency}
                  onChange={(e) => setScheduleFrequency(e.target.value as any)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="Daily">Daily</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Monthly">Monthly</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                <input
                  type="time"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Retention (days)</label>
                <input
                  type="number"
                  value={scheduleRetention}
                  onChange={(e) => setScheduleRetention(parseInt(e.target.value))}
                  min="1"
                  max="365"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={scheduleEnabled}
                    onChange={(e) => setScheduleEnabled(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700">Enable automated backups</span>
                </label>
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-2 border-t">
              <button
                onClick={() => setShowScheduleModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateSchedule}
                disabled={loading}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Schedule'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedBackup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full shadow-2xl">
            <div className="bg-gradient-to-r from-red-600 to-pink-600 px-6 py-4">
              <h2 className="text-xl font-bold text-white">Delete Backup</h2>
            </div>

            <div className="p-6">
              <p className="text-gray-700 mb-4">
                Are you sure you want to delete the backup "{selectedBackup.name}"? This action cannot be undone.
              </p>
            </div>

            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-2 border-t">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setSelectedBackup(null);
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteBackup}
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? 'Deleting...' : 'Delete Backup'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
