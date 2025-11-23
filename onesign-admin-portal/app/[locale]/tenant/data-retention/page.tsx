'use client';

import { useState, useEffect } from 'react';
import { platformService } from '@/lib/api/services';

interface RetentionPolicy {
  id: string;
  name: string;
  dataType: 'logs' | 'analytics' | 'backups' | 'user_data' | 'audit_logs' | 'webhooks';
  retentionDays: number;
  autoDelete: boolean;
  isActive: boolean;
  lastRun?: string;
  nextRun?: string;
  itemsDeleted: number;
  storageFreed: string;
  createdAt: string;
  updatedAt: string;
}

interface DataStats {
  dataType: string;
  totalRecords: number;
  oldestRecord: string;
  storageUsed: string;
  retentionDays: number;
}

export default function DataRetentionPage() {
  const [policies, setPolicies] = useState<RetentionPolicy[]>([]);
  const [stats, setStats] = useState<DataStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Mock policies
      setPolicies([
        {
          id: '1',
          name: 'Application Logs Retention',
          dataType: 'logs',
          retentionDays: 30,
          autoDelete: true,
          isActive: true,
          lastRun: '2024-11-23T02:00:00Z',
          nextRun: '2024-11-24T02:00:00Z',
          itemsDeleted: 1250000,
          storageFreed: '45 GB',
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-11-23T02:00:00Z',
        },
        {
          id: '2',
          name: 'Analytics Data Retention',
          dataType: 'analytics',
          retentionDays: 90,
          autoDelete: true,
          isActive: true,
          lastRun: '2024-11-23T03:00:00Z',
          nextRun: '2024-11-24T03:00:00Z',
          itemsDeleted: 850000,
          storageFreed: '120 GB',
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-11-23T03:00:00Z',
        },
        {
          id: '3',
          name: 'Old Backups Cleanup',
          dataType: 'backups',
          retentionDays: 180,
          autoDelete: true,
          isActive: true,
          lastRun: '2024-11-20T01:00:00Z',
          nextRun: '2024-11-27T01:00:00Z',
          itemsDeleted: 45,
          storageFreed: '2.5 TB',
          createdAt: '2024-02-01T09:00:00Z',
          updatedAt: '2024-11-20T01:00:00Z',
        },
        {
          id: '4',
          name: 'Inactive User Data',
          dataType: 'user_data',
          retentionDays: 365,
          autoDelete: false,
          isActive: true,
          itemsDeleted: 0,
          storageFreed: '0 GB',
          createdAt: '2024-03-10T14:00:00Z',
          updatedAt: '2024-03-10T14:00:00Z',
        },
        {
          id: '5',
          name: 'Audit Logs Retention',
          dataType: 'audit_logs',
          retentionDays: 365,
          autoDelete: true,
          isActive: true,
          lastRun: '2024-11-23T01:00:00Z',
          nextRun: '2024-11-24T01:00:00Z',
          itemsDeleted: 450000,
          storageFreed: '78 GB',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-11-23T01:00:00Z',
        },
        {
          id: '6',
          name: 'Webhook Logs Cleanup',
          dataType: 'webhooks',
          retentionDays: 14,
          autoDelete: true,
          isActive: true,
          lastRun: '2024-11-23T04:00:00Z',
          nextRun: '2024-11-24T04:00:00Z',
          itemsDeleted: 2150000,
          storageFreed: '15 GB',
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-11-23T04:00:00Z',
        },
      ]);

      // Mock stats
      setStats([
        {
          dataType: 'Logs',
          totalRecords: 45000000,
          oldestRecord: '2024-10-23T00:00:00Z',
          storageUsed: '1.2 TB',
          retentionDays: 30,
        },
        {
          dataType: 'Analytics',
          totalRecords: 125000000,
          oldestRecord: '2024-08-23T00:00:00Z',
          storageUsed: '3.5 TB',
          retentionDays: 90,
        },
        {
          dataType: 'Backups',
          totalRecords: 245,
          oldestRecord: '2024-05-23T00:00:00Z',
          storageUsed: '8.7 TB',
          retentionDays: 180,
        },
        {
          dataType: 'User Data',
          totalRecords: 45678,
          oldestRecord: '2023-11-23T00:00:00Z',
          storageUsed: '450 GB',
          retentionDays: 365,
        },
        {
          dataType: 'Audit Logs',
          totalRecords: 12500000,
          oldestRecord: '2023-11-23T00:00:00Z',
          storageUsed: '890 GB',
          retentionDays: 365,
        },
        {
          dataType: 'Webhooks',
          totalRecords: 78900000,
          oldestRecord: '2024-11-09T00:00:00Z',
          storageUsed: '45 GB',
          retentionDays: 14,
        },
      ]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    // await platformService.createRetentionPolicy(tenantId, {...});
    setShowCreate(false);
    fetchData();
  };

  const handleToggle = async (policyId: string) => {
    // await platformService.toggleRetentionPolicy(tenantId, policyId);
    fetchData();
  };

  const handleRunNow = async (policyId: string) => {
    if (!confirm('Run this retention policy now? This will delete data according to the policy.')) return;
    // await platformService.runRetentionPolicy(tenantId, policyId);
    fetchData();
  };

  const handleDelete = async (policyId: string) => {
    if (!confirm('Delete this retention policy?')) return;
    // await platformService.deleteRetentionPolicy(tenantId, policyId);
    fetchData();
  };

  const getDataTypeBadge = (type: string) => {
    const colors = {
      logs: 'bg-blue-100 text-blue-800',
      analytics: 'bg-purple-100 text-purple-800',
      backups: 'bg-green-100 text-green-800',
      user_data: 'bg-yellow-100 text-yellow-800',
      audit_logs: 'bg-red-100 text-red-800',
      webhooks: 'bg-indigo-100 text-indigo-800',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100';
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Data Retention Policies</h1>
          <p className="text-gray-600 mt-1">Manage data lifecycle and storage optimization</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Create Policy
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Active Policies</div>
          <div className="text-2xl font-bold">
            {policies.filter(p => p.isActive).length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Total Storage</div>
          <div className="text-2xl font-bold">
            {stats.reduce((acc, s) => {
              const value = parseFloat(s.storageUsed);
              const unit = s.storageUsed.split(' ')[1];
              if (unit === 'TB') return acc + value;
              if (unit === 'GB') return acc + value / 1024;
              return acc;
            }, 0).toFixed(2)} TB
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Items Deleted (Total)</div>
          <div className="text-2xl font-bold">
            {(policies.reduce((acc, p) => acc + p.itemsDeleted, 0) / 1000000).toFixed(1)}M
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Storage Freed</div>
          <div className="text-2xl font-bold">
            {policies.reduce((acc, p) => {
              const value = parseFloat(p.storageFreed);
              const unit = p.storageFreed.split(' ')[1];
              if (unit === 'TB') return acc + value;
              if (unit === 'GB') return acc + value / 1024;
              return acc;
            }, 0).toFixed(2)} TB
          </div>
        </div>
      </div>

      {/* Data Overview */}
      <div className="bg-white rounded-lg shadow mb-6 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Data Storage Overview</h2>
        </div>
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Records</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Oldest Record</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Storage Used</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Retention</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {stats.map((stat, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium">{stat.dataType}</td>
                <td className="px-6 py-4 text-sm">{stat.totalRecords.toLocaleString()}</td>
                <td className="px-6 py-4 text-sm">{new Date(stat.oldestRecord).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-sm font-semibold">{stat.storageUsed}</td>
                <td className="px-6 py-4 text-sm">{stat.retentionDays} days</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Retention Policies */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Retention Policies</h2>
        {policies.map((policy) => (
          <div key={policy.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold">{policy.name}</h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${getDataTypeBadge(policy.dataType)}`}>
                    {policy.dataType.replace('_', ' ')}
                  </span>
                  {policy.autoDelete && (
                    <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
                      Auto Delete
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-3">
                  <div>
                    <span className="text-gray-500">Retention:</span>
                    <span className="ml-2 font-semibold">{policy.retentionDays} days</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Items Deleted:</span>
                    <span className="ml-2 font-semibold">{policy.itemsDeleted.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Storage Freed:</span>
                    <span className="ml-2 font-semibold">{policy.storageFreed}</span>
                  </div>
                  {policy.lastRun && (
                    <div>
                      <span className="text-gray-500">Last Run:</span>
                      <span className="ml-2">{new Date(policy.lastRun).toLocaleString()}</span>
                    </div>
                  )}
                </div>

                {policy.nextRun && (
                  <div className="mt-2 text-sm text-gray-600">
                    Next scheduled run: {new Date(policy.nextRun).toLocaleString()}
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-3 ml-4">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={policy.isActive}
                    onChange={() => handleToggle(policy.id)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
                {policy.isActive && (
                  <button
                    onClick={() => handleRunNow(policy.id)}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Run Now
                  </button>
                )}
                <button
                  onClick={() => handleDelete(policy.id)}
                  className="px-3 py-1 text-sm text-red-600 border border-red-300 rounded hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </div>

            {!policy.autoDelete && (
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
                <strong>⚠️ Manual Review Required:</strong> This policy is set to identify old data but not automatically delete it.
                Review and manually delete data when ready.
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Create Policy Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Create Retention Policy</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Policy Name</label>
                <input
                  type="text"
                  placeholder="e.g., Debug Logs Cleanup"
                  className="w-full border border-gray-300 rounded-lg p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Data Type</label>
                <select className="w-full border border-gray-300 rounded-lg p-2">
                  <option value="logs">Application Logs</option>
                  <option value="analytics">Analytics Data</option>
                  <option value="backups">Backups</option>
                  <option value="user_data">User Data</option>
                  <option value="audit_logs">Audit Logs</option>
                  <option value="webhooks">Webhook Logs</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Retention Period (Days)</label>
                <input
                  type="number"
                  defaultValue={30}
                  min={1}
                  className="w-full border border-gray-300 rounded-lg p-2"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Data older than this will be deleted according to the policy
                </p>
              </div>

              <div>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" defaultChecked />
                  <span className="text-sm">Automatically delete old data</span>
                </label>
                <p className="ml-6 text-xs text-gray-500">
                  If unchecked, policy will only identify old data for manual review
                </p>
              </div>

              <div>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" defaultChecked />
                  <span className="text-sm">Enable policy immediately</span>
                </label>
              </div>

              <div className="p-3 bg-red-50 border border-red-200 rounded text-sm">
                <strong>⚠️ Warning:</strong> Deleted data cannot be recovered. Ensure you have adequate backups before enabling auto-delete.
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowCreate(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create Policy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
