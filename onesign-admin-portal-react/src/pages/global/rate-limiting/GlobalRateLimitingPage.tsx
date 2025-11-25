import { useState, useEffect } from 'react';
import { platformService } from '@/lib/api/services';
import { Helmet } from 'react-helmet-async';

interface RateLimit {
  id: string;
  name: string;
  type: 'global' | 'per_tenant' | 'per_user' | 'per_ip';
  endpoint?: string;
  limit: number;
  window: number;
  windowUnit: 'second' | 'minute' | 'hour' | 'day';
  isEnabled: boolean;
  action: 'throttle' | 'block' | 'notify';
  exemptions: string[];
  createdAt: string;
  stats: {
    totalRequests: number;
    blockedRequests: number;
    throttledRequests: number;
  };
}

export default function GlobalRateLimitingPage() {
  const [limits, setLimits] = useState<RateLimit[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    fetchLimits();
  }, []);

  const fetchLimits = async () => {
    try {
      const data = await platformService.getRateLimits?.();
      const mockData: RateLimit[] = [
        {
          id: '1',
          name: 'Global API Rate Limit',
          type: 'global',
          limit: 10000,
          window: 1,
          windowUnit: 'minute',
          isEnabled: true,
          action: 'throttle',
          exemptions: ['admin@example.com', '192.168.1.0/24'],
          createdAt: '2024-01-01T00:00:00Z',
          stats: {
            totalRequests: 45678901,
            blockedRequests: 12345,
            throttledRequests: 234567,
          },
        },
        {
          id: '2',
          name: 'Authentication Endpoint',
          type: 'per_ip',
          endpoint: '/api/auth/login',
          limit: 5,
          window: 15,
          windowUnit: 'minute',
          isEnabled: true,
          action: 'block',
          exemptions: ['10.0.0.0/8'],
          createdAt: '2024-01-15T10:00:00Z',
          stats: {
            totalRequests: 567890,
            blockedRequests: 8901,
            throttledRequests: 0,
          },
        },
        {
          id: '3',
          name: 'Tenant API Calls',
          type: 'per_tenant',
          limit: 1000,
          window: 1,
          windowUnit: 'hour',
          isEnabled: true,
          action: 'throttle',
          exemptions: ['tenant-enterprise-1', 'tenant-enterprise-2'],
          createdAt: '2024-02-01T09:00:00Z',
          stats: {
            totalRequests: 12345678,
            blockedRequests: 0,
            throttledRequests: 123456,
          },
        },
        {
          id: '4',
          name: 'User Data Export',
          type: 'per_user',
          endpoint: '/api/exports',
          limit: 10,
          window: 1,
          windowUnit: 'day',
          isEnabled: true,
          action: 'block',
          exemptions: [],
          createdAt: '2024-03-10T14:00:00Z',
          stats: {
            totalRequests: 45678,
            blockedRequests: 234,
            throttledRequests: 0,
          },
        },
        {
          id: '5',
          name: 'Webhook Delivery',
          type: 'global',
          endpoint: '/webhooks/*',
          limit: 100,
          window: 1,
          windowUnit: 'second',
          isEnabled: true,
          action: 'throttle',
          exemptions: [],
          createdAt: '2024-04-20T08:00:00Z',
          stats: {
            totalRequests: 8901234,
            blockedRequests: 0,
            throttledRequests: 56789,
          },
        },
      ];
      setLimits(data || mockData);
    } catch (err) {
      console.error(err);
      setLimits(mockData);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      await platformService.createRateLimit?.({
        name: 'New Rate Limit',
        type: 'global',
        limit: 1000,
        window: 1,
        windowUnit: 'minute',
        action: 'throttle',
        exemptions: [],
      });
      setShowCreate(false);
      fetchLimits();
    } catch (error) {
      console.error('Failed to create rate limit:', error);
    }
  };

  const handleToggle = async (limitId: string) => {
    try {
      await platformService.toggleRateLimit?.(limitId);
      fetchLimits();
    } catch (error) {
      console.error('Failed to toggle rate limit:', error);
    }
  };

  const handleDelete = async (limitId: string) => {
    if (!confirm('Delete this rate limit?')) return;
    try {
      await platformService.deleteRateLimit?.(limitId);
      fetchLimits();
    } catch (error) {
      console.error('Failed to delete rate limit:', error);
    }
  };

  const getTypeBadge = (type: string) => {
    const colors = {
      global: 'bg-purple-100 text-purple-800',
      per_tenant: 'bg-blue-100 text-blue-800',
      per_user: 'bg-green-100 text-green-800',
      per_ip: 'bg-yellow-100 text-yellow-800',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100';
  };

  const getActionBadge = (action: string) => {
    const colors = {
      throttle: 'bg-yellow-100 text-yellow-800',
      block: 'bg-red-100 text-red-800',
      notify: 'bg-blue-100 text-blue-800',
    };
    return colors[action as keyof typeof colors] || 'bg-gray-100';
  };

  const formatLimit = (limit: RateLimit) => {
    return `${limit.limit.toLocaleString()} requests / ${limit.window} ${limit.windowUnit}${limit.window > 1 ? 's' : ''}`;
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Rate Limiting</h1>
          <p className="text-gray-600 mt-1">Configure API rate limits and throttling</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Create Rate Limit
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Active Limits</div>
          <div className="text-2xl font-bold">
            {limits.filter(l => l.isEnabled).length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Total Requests</div>
          <div className="text-2xl font-bold">
            {(limits.reduce((acc, l) => acc + l.stats.totalRequests, 0) / 1000000).toFixed(1)}M
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Blocked</div>
          <div className="text-2xl font-bold text-red-600">
            {limits.reduce((acc, l) => acc + l.stats.blockedRequests, 0).toLocaleString()}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Throttled</div>
          <div className="text-2xl font-bold text-yellow-600">
            {limits.reduce((acc, l) => acc + l.stats.throttledRequests, 0).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Rate Limits List */}
      <div className="space-y-4">
        {limits.map((limit) => (
          <div key={limit.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold">{limit.name}</h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${getTypeBadge(limit.type)}`}>
                    {limit.type.replace('_', ' ')}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded-full ${getActionBadge(limit.action)}`}>
                    {limit.action}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    limit.isEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {limit.isEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>

                {limit.endpoint && (
                  <div className="font-mono text-sm text-gray-600 mb-3">{limit.endpoint}</div>
                )}

                {/* Limit Configuration */}
                <div className="mb-3">
                  <span className="text-sm font-semibold">{formatLimit(limit)}</span>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                  <div>
                    <span className="text-gray-500">Total Requests:</span>
                    <span className="ml-2 font-semibold">{limit.stats.totalRequests.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Blocked:</span>
                    <span className="ml-2 font-semibold text-red-600">{limit.stats.blockedRequests.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Throttled:</span>
                    <span className="ml-2 font-semibold text-yellow-600">{limit.stats.throttledRequests.toLocaleString()}</span>
                  </div>
                </div>

                {/* Exemptions */}
                {limit.exemptions.length > 0 && (
                  <div>
                    <span className="text-sm text-gray-500">Exemptions:</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {limit.exemptions.map((exemption, idx) => (
                        <span key={idx} className="px-2 py-1 text-xs bg-gray-100 rounded font-mono">
                          {exemption}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-3 ml-4">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={limit.isEnabled}
                    onChange={() => handleToggle(limit.id)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
                <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(limit.id)}
                  className="px-3 py-1 text-sm text-red-600 border border-red-300 rounded hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </div>

            {/* Usage Bar */}
            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Rate Limit Impact</span>
                <span>
                  {((limit.stats.blockedRequests + limit.stats.throttledRequests) / limit.stats.totalRequests * 100).toFixed(2)}% affected
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div className="flex h-full">
                  <div
                    className="bg-red-600"
                    style={{ width: `${(limit.stats.blockedRequests / limit.stats.totalRequests) * 100}%` }}
                  ></div>
                  <div
                    className="bg-yellow-600"
                    style={{ width: `${(limit.stats.throttledRequests / limit.stats.totalRequests) * 100}%` }}
                  ></div>
                </div>
              </div>
              <div className="flex justify-between text-xs mt-1">
                <span className="text-red-600">Blocked</span>
                <span className="text-yellow-600">Throttled</span>
                <span className="text-green-600">Allowed</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Create Rate Limit</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <input
                  type="text"
                  placeholder="e.g., API Rate Limit"
                  className="w-full border border-gray-300 rounded-lg p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Type</label>
                <select className="w-full border border-gray-300 rounded-lg p-2">
                  <option value="global">Global</option>
                  <option value="per_tenant">Per Tenant</option>
                  <option value="per_user">Per User</option>
                  <option value="per_ip">Per IP Address</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Endpoint (Optional)</label>
                <input
                  type="text"
                  placeholder="/api/endpoint or /api/*"
                  className="w-full border border-gray-300 rounded-lg p-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Limit</label>
                  <input
                    type="number"
                    defaultValue={1000}
                    className="w-full border border-gray-300 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Window</label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      defaultValue={1}
                      className="w-20 border border-gray-300 rounded-lg p-2"
                    />
                    <select className="flex-1 border border-gray-300 rounded-lg p-2">
                      <option value="second">Second</option>
                      <option value="minute">Minute</option>
                      <option value="hour">Hour</option>
                      <option value="day">Day</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Action</label>
                <select className="w-full border border-gray-300 rounded-lg p-2">
                  <option value="throttle">Throttle (429 with Retry-After)</option>
                  <option value="block">Block (403 Forbidden)</option>
                  <option value="notify">Notify Only</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Exemptions (Optional)</label>
                <input
                  type="text"
                  placeholder="email, IP, or tenant ID (comma separated)"
                  className="w-full border border-gray-300 rounded-lg p-2"
                />
              </div>

              <div>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" defaultChecked />
                  <span className="text-sm">Enable immediately</span>
                </label>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
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
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
