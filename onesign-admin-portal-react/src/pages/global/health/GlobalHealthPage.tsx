import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { globalService } from '@/lib/api/services/global.service';

// Types
interface HealthStatus {
  status: 'Healthy' | 'Degraded' | 'Unhealthy';
  uptime: number;
  timestamp: string;
  components: ComponentHealth[];
  version?: string;
  environment?: string;
}

interface ComponentHealth {
  name: string;
  status: 'Healthy' | 'Degraded' | 'Unhealthy';
  responseTime: number;
  lastChecked: string;
  details?: Record<string, any>;
  errorMessage?: string;
}

interface LivenessProbe {
  status: 'Live' | 'Down';
  timestamp: string;
  uptimeSeconds: number;
}

interface ReadinessProbe {
  status: 'Ready' | 'NotReady';
  timestamp: string;
  checks: {
    database: boolean;
    cache: boolean;
    externalServices: boolean;
  };
}

interface RegionHealth {
  regionId: string;
  name: string;
  location: string;
  status: 'Healthy' | 'Degraded' | 'Unhealthy';
  latency: number;
  uptime: number;
  lastChecked: string;
  services?: {
    api: 'Healthy' | 'Degraded' | 'Unhealthy';
    database: 'Healthy' | 'Degraded' | 'Unhealthy';
    cache: 'Healthy' | 'Degraded' | 'Unhealthy';
  };
}

interface HealthHistoryPoint {
  timestamp: string;
  uptime: number;
  responseTime: number;
}

export default function GlobalHealthPage() {
  const { t } = useTranslation();

  // State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [livenessProbe, setLivenessProbe] = useState<LivenessProbe | null>(null);
  const [readinessProbe, setReadinessProbe] = useState<ReadinessProbe | null>(null);
  const [regionsHealth, setRegionsHealth] = useState<RegionHealth[]>([]);
  const [healthHistory, setHealthHistory] = useState<HealthHistoryPoint[]>([]);

  // Fetch health data
  const fetchHealthData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      // Fetch all health endpoints in parallel using service methods
      const [healthData, liveData, readyData, regionsData, platformHealth] = await Promise.all([
        globalService.getHealthStatus(),
        globalService.getLivenessProbe(),
        globalService.getReadinessProbe(),
        globalService.getRegionsHealthStatus(),
        globalService.getHealth(),
      ]);

      if (platformHealth?.components?.length) {
        const components: ComponentHealth[] = platformHealth.components.map(
          (c: { name: string; status: string; responseTimeMs: number; message?: string }) => ({
            name: c.name,
            status: c.status as ComponentHealth['status'],
            responseTime: c.responseTimeMs ?? 0,
            lastChecked: platformHealth.checkedAt ?? new Date().toISOString(),
            errorMessage: c.message,
          }),
        );
        const avgResponse =
          components.reduce((sum, c) => sum + c.responseTime, 0) / (components.length || 1);
        setHealthStatus({
          status: (platformHealth.status as HealthStatus['status']) || 'Healthy',
          uptime: 0,
          timestamp: platformHealth.checkedAt ?? new Date().toISOString(),
          components,
        });
        setHealthHistory((prev) => {
          const newPoint: HealthHistoryPoint = {
            timestamp: new Date().toISOString(),
            uptime: 0,
            responseTime: avgResponse,
          };
          return [...prev, newPoint].slice(-48);
        });
      } else if (healthData) {
        setHealthStatus(healthData);

        setHealthHistory((prev) => {
          const newPoint: HealthHistoryPoint = {
            timestamp: new Date().toISOString(),
            uptime: healthData.uptime || 0,
            responseTime:
              healthData.components?.reduce((sum: number, c: ComponentHealth) => sum + c.responseTime, 0) /
                (healthData.components?.length || 1) || 0,
          };
          return [...prev, newPoint].slice(-48);
        });
      }

      if (liveData) {
        setLivenessProbe(liveData);
      }

      if (readyData) {
        setReadinessProbe(readyData);
      }

      if (regionsData && regionsData.length > 0) {
        setRegionsHealth(regionsData);
      }

      setLastRefresh(new Date());
    } catch (err) {
      setError(t('global.health.messages.failedToFetchHealthData'));
      console.error('Health fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchHealthData();
  }, [fetchHealthData]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchHealthData();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, fetchHealthData]);

  // Helper functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Healthy':
      case 'Live':
      case 'Ready':
        return 'bg-green-500';
      case 'Degraded':
        return 'bg-yellow-500';
      case 'Unhealthy':
      case 'Down':
      case 'NotReady':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Healthy':
      case 'Live':
      case 'Ready':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Degraded':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Unhealthy':
      case 'Down':
      case 'NotReady':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
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

  const getResponseTimeColor = (time: number) => {
    if (time < 100) return 'text-green-600';
    if (time < 500) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {t('global.health.title')}
            </h1>
            <p className="text-gray-600 mt-2">
              {t('global.health.description')}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-500">
              {t('global.health.labels.lastUpdated')}: {lastRefresh.toLocaleTimeString()}
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded"
              />
              {t('global.health.labels.autoRefresh')}
            </label>
            <button
              onClick={fetchHealthData}
              disabled={loading}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  {t('global.health.labels.refreshing')}
                </span>
              ) : (
                t('global.health.actions.refreshNow')
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg shadow-sm">
          {error}
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* System Status */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow duration-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">System Status</h3>
            <div className={`w-3 h-3 rounded-full ${getStatusColor(livenessProbe?.status || 'Down')} animate-pulse shadow-lg`} />
          </div>
          <div className="mt-2">
            <span className={`inline-block px-3 py-1 rounded-lg text-sm font-semibold border ${getStatusBadgeColor(livenessProbe?.status || 'Down')}`}>
              {livenessProbe?.status || 'Unknown'}
            </span>
          </div>
          {livenessProbe?.uptimeSeconds !== undefined && (
            <p className="mt-3 text-xs text-gray-500">
              Uptime: {formatUptime(livenessProbe.uptimeSeconds)}
            </p>
          )}
        </div>

        {/* Readiness */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow duration-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Readiness</h3>
            <div className={`w-3 h-3 rounded-full ${getStatusColor(readinessProbe?.status || t('common.notReady'))} animate-pulse shadow-lg`} />
          </div>
          <div className="mt-2">
            <span className={`inline-block px-3 py-1 rounded-lg text-sm font-semibold border ${getStatusBadgeColor(readinessProbe?.status || t('common.notReady'))}`}>
              {readinessProbe?.status || 'Unknown'}
            </span>
          </div>
          {readinessProbe?.checks && (
            <div className="mt-3 space-y-1">
              <div className="flex items-center gap-2 text-xs">
                <div className={`w-2 h-2 rounded-full ${readinessProbe.checks.database ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-gray-600">Database</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className={`w-2 h-2 rounded-full ${readinessProbe.checks.cache ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-gray-600">Cache</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className={`w-2 h-2 rounded-full ${readinessProbe.checks.externalServices ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-gray-600">External Services</span>
              </div>
            </div>
          )}
        </div>

        {/* Overall Uptime */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow duration-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Overall Uptime</h3>
            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <div className="mt-2">
            <span className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              {healthStatus?.uptime?.toFixed(2) || '0.00'}%
            </span>
          </div>
          {healthStatus?.version && (
            <p className="mt-3 text-xs text-gray-500">
              Version: {healthStatus.version}
            </p>
          )}
        </div>

        {/* Last Check Time */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow duration-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Last Check</h3>
            <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="mt-2">
            <p className="text-sm font-semibold text-gray-800">
              {new Date(healthStatus?.timestamp || Date.now()).toLocaleTimeString()}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {new Date(healthStatus?.timestamp || Date.now()).toLocaleDateString()}
            </p>
          </div>
          {healthStatus?.environment && (
            <p className="mt-3 text-xs text-gray-500">
              Env: {healthStatus.environment}
            </p>
          )}
        </div>
      </div>

      {/* Components Health Section */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 mb-8 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
          <h2 className="text-xl font-bold text-white">Components Health</h2>
          <p className="text-blue-100 text-sm mt-1">Status of all system components</p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Component
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Response Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Checked
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {healthStatus?.components?.map((component, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(component.status)} mr-3`} />
                      <span className="text-sm font-semibold text-gray-900">{component.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadgeColor(component.status)}`}>
                      {component.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm font-semibold ${getResponseTimeColor(component.responseTime)}`}>
                      {component.responseTime}ms
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(component.lastChecked).toLocaleTimeString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {component.errorMessage ? (
                      <span className="text-red-600 text-xs">{component.errorMessage}</span>
                    ) : (
                      <span className="text-green-600 text-xs">Operational</span>
                    )}
                  </td>
                </tr>
              )) || (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    {loading ? t('global.health.loading.components') : t('global.health.empty.noComponentData')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Regions Health Section */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 mb-8 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
          <h2 className="text-xl font-bold text-white">Regions Health</h2>
          <p className="text-indigo-100 text-sm mt-1">Health status across all regions</p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Region
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Latency
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Uptime
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Checked
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {regionsHealth.map((region) => (
                <tr key={region.regionId} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(region.status)} mr-3`} />
                      <div>
                        <div className="text-sm font-semibold text-gray-900">{region.name}</div>
                        <div className="text-xs text-gray-500">{region.regionId}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {region.location}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadgeColor(region.status)}`}>
                      {region.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm font-semibold ${getResponseTimeColor(region.latency)}`}>
                      {region.latency}ms
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2" style={{ width: '60px' }}>
                        <div
                          className={`h-2 rounded-full ${
                            region.uptime >= 99 ? 'bg-green-500' : region.uptime >= 95 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${Math.min(region.uptime, 100)}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-gray-700">{region.uptime.toFixed(2)}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(region.lastChecked).toLocaleTimeString()}
                  </td>
                </tr>
              ))}
              {regionsHealth.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    {loading ? t('global.health.loading.regions') : t('global.health.empty.noRegionData')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Health History Chart */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4">
          <h2 className="text-xl font-bold text-white">Health History</h2>
          <p className="text-purple-100 text-sm mt-1">System uptime over time (last 24 hours)</p>
        </div>

        <div className="p-6">
          {healthHistory.length > 0 ? (
            <div className="space-y-4">
              {/* Simple Chart Visualization */}
              <div className="relative h-64 border border-gray-200 rounded-lg bg-gradient-to-br from-gray-50 to-white p-4">
                <div className="absolute inset-0 flex items-end justify-around p-4 gap-1">
                  {healthHistory.slice(-24).map((point, index) => {
                    const height = (point.uptime / 100) * 100;
                    const color = point.uptime >= 99 ? 'bg-green-500' : point.uptime >= 95 ? 'bg-yellow-500' : 'bg-red-500';

                    return (
                      <div
                        key={index}
                        className="group relative flex-1 flex items-end"
                        title={`${new Date(point.timestamp).toLocaleTimeString()}: ${point.uptime.toFixed(2)}%`}
                      >
                        <div
                          className={`w-full ${color} rounded-t transition-all duration-300 hover:opacity-80 relative`}
                          style={{ height: `${Math.max(height, 2)}%` }}
                        >
                          <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                            <div>{point.uptime.toFixed(2)}%</div>
                            <div className="text-gray-300">{new Date(point.timestamp).toLocaleTimeString()}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Y-axis labels */}
                <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-500 pr-2">
                  <span>100%</span>
                  <span>75%</span>
                  <span>50%</span>
                  <span>25%</span>
                  <span>0%</span>
                </div>
              </div>

              {/* Stats Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
                  <div className="text-xs text-green-700 font-semibold mb-1">Average Uptime</div>
                  <div className="text-2xl font-bold text-green-800">
                    {(healthHistory.reduce((sum, p) => sum + p.uptime, 0) / healthHistory.length).toFixed(2)}%
                  </div>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                  <div className="text-xs text-blue-700 font-semibold mb-1">Avg Response Time</div>
                  <div className="text-2xl font-bold text-blue-800">
                    {(healthHistory.reduce((sum, p) => sum + p.responseTime, 0) / healthHistory.length).toFixed(0)}ms
                  </div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
                  <div className="text-xs text-purple-700 font-semibold mb-1">Data Points</div>
                  <div className="text-2xl font-bold text-purple-800">
                    {healthHistory.length}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-12">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p>No health history data available yet</p>
              <p className="text-sm mt-2">Data will appear as the system collects health metrics</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
