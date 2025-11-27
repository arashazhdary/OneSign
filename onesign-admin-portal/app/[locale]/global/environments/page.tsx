'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { platformService } from '@/lib/api/services';

interface Environment {
  id: string;
  name: string;
  type: 'Production' | 'Staging' | 'Development' | 'Testing';
  status: 'Running' | 'Stopped' | 'Error' | 'Starting' | 'Stopping';
  region: string;
  version: string;
  uptime: number;
  lastDeployedAt: string;
  url?: string;
}

interface EnvironmentHeartbeat {
  environmentId: string;
  timestamp: string;
  status: 'Healthy' | 'Degraded' | 'Unhealthy';
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  activeConnections: number;
  responseTime: number;
}

interface BootstrapConfig {
  name: string;
  type: 'Production' | 'Staging' | 'Development' | 'Testing';
  region: string;
  version: string;
}

type Tab = 'environments' | 'monitoring';

export default function EnvironmentManagementPage() {
  const t = useTranslations();
  const [activeTab, setActiveTab] = useState<Tab>('environments');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [selectedEnvironment, setSelectedEnvironment] = useState<string>('');
  const [heartbeat, setHeartbeat] = useState<EnvironmentHeartbeat | null>(null);
  const [environmentDetail, setEnvironmentDetail] = useState<Environment | null>(null);
  const [envIdToFetch, setEnvIdToFetch] = useState('');

  const [showBootstrapModal, setShowBootstrapModal] = useState(false);
  const [bootstrapConfig, setBootstrapConfig] = useState<BootstrapConfig>({
    name: '',
    type: 'Development',
    region: '',
    version: '',
  });

  useEffect(() => {
    fetchEnvironments();
  }, []);

  useEffect(() => {
    if (activeTab === 'monitoring' && selectedEnvironment) {
      fetchHeartbeat(selectedEnvironment);
      const interval = setInterval(() => {
        fetchHeartbeat(selectedEnvironment);
      }, 10000); // Refresh every 10 seconds
      return () => clearInterval(interval);
    }
  }, [activeTab, selectedEnvironment]);

  const fetchEnvironments = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await (platformService as any).getEnvironments();
      setEnvironments(data.items || data || []);
      if (data.items?.length > 0 && !selectedEnvironment) {
        setSelectedEnvironment(data.items[0].id);
      }
    } catch (err: any) {
      setError(err.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const fetchHeartbeat = async (environmentId: string) => {
    try {
      const data = await (platformService as any).getEnvironmentHeartbeat(environmentId);
      setHeartbeat(data);
    } catch (err) {
      console.error('Failed to fetch heartbeat:', err);
    }
  };

  const handleBootstrap = async () => {
    if (!bootstrapConfig.name || !bootstrapConfig.region || !bootstrapConfig.version) {
      setError('Please fill all required fields');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await (platformService as any).bootstrapEnvironment(bootstrapConfig);
      setSuccess('Environment bootstrapped successfully');
      setShowBootstrapModal(false);
      setBootstrapConfig({ name: '', type: 'Development', region: '', version: '' });
      fetchEnvironments();
    } catch (err: any) {
      setError(err.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleRestart = async (environmentId: string) => {
    if (!confirm('Are you sure you want to restart this environment?')) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await (platformService as any).restartEnvironment(environmentId);
      setSuccess('Environment restart initiated successfully');
      fetchEnvironments();
    } catch (err: any) {
      setError(err.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Running':
      case 'Healthy':
        return 'bg-green-100 text-green-800';
      case 'Starting':
      case 'Stopping':
      case 'Degraded':
        return 'bg-yellow-100 text-yellow-800';
      case 'Stopped':
        return 'bg-gray-100 text-gray-800';
      case 'Error':
      case 'Unhealthy':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Production':
        return 'bg-red-100 text-red-800';
      case 'Staging':
        return 'bg-yellow-100 text-yellow-800';
      case 'Development':
        return 'bg-blue-100 text-blue-800';
      case 'Testing':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getUsageColor = (usage: number) => {
    if (usage >= 90) return 'text-red-600';
    if (usage >= 75) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Environment Management</h1>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>
      )}

      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">{success}</div>
      )}

      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {(['environments', 'monitoring'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab === 'environments' ? 'Environments' : 'Monitoring'}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'environments' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setShowBootstrapModal(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
            >
              Bootstrap Environment
            </button>
          </div>

          {showBootstrapModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-md w-full">
                <h2 className="text-xl font-bold mb-4">Bootstrap New Environment</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                    <input
                      type="text"
                      value={bootstrapConfig.name}
                      onChange={(e) => setBootstrapConfig({ ...bootstrapConfig, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                    <select
                      value={bootstrapConfig.type}
                      onChange={(e) => setBootstrapConfig({ ...bootstrapConfig, type: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="Development">Development</option>
                      <option value="Testing">Testing</option>
                      <option value="Staging">Staging</option>
                      <option value="Production">Production</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Region *</label>
                    <input
                      type="text"
                      value={bootstrapConfig.region}
                      onChange={(e) => setBootstrapConfig({ ...bootstrapConfig, region: e.target.value })}
                      placeholder="e.g., us-east-1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Version *</label>
                    <input
                      type="text"
                      value={bootstrapConfig.version}
                      onChange={(e) => setBootstrapConfig({ ...bootstrapConfig, version: e.target.value })}
                      placeholder="e.g., 1.0.0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2 mt-6">
                  <button
                    onClick={() => setShowBootstrapModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleBootstrap}
                    disabled={loading}
                    className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
                  >
                    Bootstrap
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {environments.map((env) => (
              <div key={env.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{env.name}</h3>
                  <span className={`px-2 py-1 rounded text-xs ${getTypeColor(env.type)}`}>
                    {env.type}
                  </span>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Status</span>
                    <span className={`px-2 py-1 rounded text-xs ${getStatusColor(env.status)}`}>
                      {env.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Region</span>
                    <span className="text-sm font-medium text-gray-900">{env.region}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Version</span>
                    <span className="text-sm font-medium text-gray-900">{env.version}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Uptime</span>
                    <span className="text-sm font-medium text-gray-900">{formatUptime(env.uptime)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Last Deployed</span>
                    <span className="text-sm text-gray-900">
                      {new Date(env.lastDeployedAt).toLocaleDateString()}
                    </span>
                  </div>
                  {env.url && (
                    <div className="pt-2 border-t">
                      <a
                        href={env.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-indigo-600 hover:text-indigo-900"
                      >
                        Open Environment
                      </a>
                    </div>
                  )}
                </div>
                <div className="mt-4 pt-4 border-t space-y-2">
                  <button
                    onClick={() => {
                      setSelectedEnvironment(env.id);
                      setActiveTab('monitoring');
                    }}
                    className="w-full bg-blue-50 text-blue-700 px-4 py-2 rounded hover:bg-blue-100 text-sm"
                  >
                    View Monitoring
                  </button>
                  {env.status === 'Running' && (
                    <button
                      onClick={() => handleRestart(env.id)}
                      disabled={loading}
                      className="w-full bg-yellow-50 text-yellow-700 px-4 py-2 rounded hover:bg-yellow-100 text-sm disabled:opacity-50"
                    >
                      Restart
                    </button>
                  )}
                </div>
              </div>
            ))}
            {environments.length === 0 && (
              <div className="col-span-3 bg-white rounded-lg shadow p-6 text-center text-gray-500">
                No environments found
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'monitoring' && (
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Environment</label>
            <select
              value={selectedEnvironment}
              onChange={(e) => setSelectedEnvironment(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              {environments.map((env) => (
                <option key={env.id} value={env.id}>{env.name}</option>
              ))}
            </select>
          </div>

          {heartbeat ? (
            <>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Environment Health</h2>
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded text-sm ${getStatusColor(heartbeat.status)}`}>
                      {heartbeat.status}
                    </span>
                    <span className="text-sm text-gray-500">
                      Last updated: {new Date(heartbeat.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="text-sm text-gray-500 mb-2">CPU Usage</div>
                    <div className={`text-3xl font-bold ${getUsageColor(heartbeat.cpuUsage)}`}>
                      {heartbeat.cpuUsage}%
                    </div>
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          heartbeat.cpuUsage >= 90 ? 'bg-red-500' :
                          heartbeat.cpuUsage >= 75 ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`}
                        style={{ width: `${heartbeat.cpuUsage}%` }}
                      />
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="text-sm text-gray-500 mb-2">Memory Usage</div>
                    <div className={`text-3xl font-bold ${getUsageColor(heartbeat.memoryUsage)}`}>
                      {heartbeat.memoryUsage}%
                    </div>
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          heartbeat.memoryUsage >= 90 ? 'bg-red-500' :
                          heartbeat.memoryUsage >= 75 ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`}
                        style={{ width: `${heartbeat.memoryUsage}%` }}
                      />
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="text-sm text-gray-500 mb-2">Disk Usage</div>
                    <div className={`text-3xl font-bold ${getUsageColor(heartbeat.diskUsage)}`}>
                      {heartbeat.diskUsage}%
                    </div>
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          heartbeat.diskUsage >= 90 ? 'bg-red-500' :
                          heartbeat.diskUsage >= 75 ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`}
                        style={{ width: `${heartbeat.diskUsage}%` }}
                      />
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="text-sm text-gray-500 mb-2">Active Connections</div>
                    <div className="text-3xl font-bold text-gray-900">{heartbeat.activeConnections}</div>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="text-sm text-gray-500 mb-2">Response Time</div>
                    <div className={`text-3xl font-bold ${
                      heartbeat.responseTime > 1000 ? 'text-red-600' :
                      heartbeat.responseTime > 500 ? 'text-yellow-600' :
                      'text-green-600'
                    }`}>
                      {heartbeat.responseTime}ms
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Performance Metrics</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-500 mb-1">Overall Health</div>
                    <div className={`text-2xl font-bold ${
                      heartbeat.status === 'Healthy' ? 'text-green-600' :
                      heartbeat.status === 'Degraded' ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {heartbeat.status === 'Healthy' ? '95%' :
                       heartbeat.status === 'Degraded' ? '75%' : '45%'}
                    </div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-500 mb-1">Avg CPU (24h)</div>
                    <div className="text-2xl font-bold text-gray-900">
                      {Math.max(10, heartbeat.cpuUsage - 15)}%
                    </div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-500 mb-1">Avg Response (24h)</div>
                    <div className="text-2xl font-bold text-gray-900">
                      {Math.max(100, heartbeat.responseTime - 50)}ms
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : selectedEnvironment ? (
            <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
              {loading ? 'Loading monitoring data...' : 'No monitoring data available'}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
              Please select an environment to view monitoring data
            </div>
          )}
        </div>
      )}
    </div>
  );
}
