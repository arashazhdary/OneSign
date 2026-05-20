import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { globalService } from '@/lib/api/services/global.service';
import { Helmet } from 'react-helmet-async';

// Types
interface SystemMetrics {
  cpu: {
    usage: number;
    cores: number;
    loadAverage: number[];
  };
  memory: {
    total: number;
    used: number;
    free: number;
    usagePercent: number;
  };
  disk: {
    total: number;
    used: number;
    free: number;
    usagePercent: number;
  };
}

interface ServiceHealth {
  name: string;
  status: 'Healthy' | 'Degraded' | 'Unhealthy';
  uptime: number;
  responseTime: number;
  lastChecked: string;
}

interface Alert {
  id: string;
  severity: 'Critical' | 'Warning' | 'Info';
  message: string;
  service: string;
  timestamp: string;
  resolved: boolean;
}

interface MetricHistory {
  timestamp: string;
  cpu: number;
  memory: number;
  responseTime: number;
  requestRate: number;
  errorRate: number;
}

export default function GlobalMonitoringPage() {
  const { t } = useTranslation();

  // State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h');

  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [services, setServices] = useState<ServiceHealth[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [metricHistory, setMetricHistory] = useState<MetricHistory[]>([]);

  const fetchMetrics = useCallback(async () => {
    try {
      const [perf, health, alertsData] = await Promise.all([
        globalService.getPerformanceMetrics(),
        globalService.getHealth(),
        globalService.getAlerts(),
      ]);

      const metricsPayload: SystemMetrics | null = perf
        ? {
            cpu: {
              usage: perf.cpu?.usage ?? 0,
              cores: perf.cpu?.cores ?? 0,
              loadAverage: perf.cpu?.loadAverage ?? [0, 0, 0],
            },
            memory: {
              total: perf.memory?.total ?? 0,
              used: perf.memory?.used ?? 0,
              free: perf.memory?.free ?? 0,
              usagePercent: perf.memory?.usagePercent ?? 0,
            },
            disk: {
              total: perf.disk?.total ?? 0,
              used: perf.disk?.used ?? 0,
              free: perf.disk?.free ?? 0,
              usagePercent: perf.disk?.usagePercent ?? 0,
            },
          }
        : null;

      const serviceList: ServiceHealth[] = (health?.services ?? perf?.services ?? []).map((s: any) => ({
        name: s.name,
        status: s.status,
        uptime: s.uptime ?? 0,
        responseTime: s.latency ?? s.responseTime ?? 0,
        lastChecked: s.lastChecked ?? new Date().toISOString(),
      }));

      const alertList: Alert[] = (Array.isArray(alertsData) ? alertsData : alertsData?.items ?? []).map((a: any) => ({
        id: a.id,
        severity: a.severity,
        message: a.message ?? a.title,
        service: a.service ?? a.category ?? 'System',
        timestamp: a.timestamp ?? a.createdAt,
        resolved: a.status === 'resolved' || a.resolved === true,
      }));

      setMetrics(metricsPayload);
      setServices(serviceList);
      setAlerts(alertList);

      if (metricsPayload && serviceList.length > 0) {
        setMetricHistory((prev) => {
          const newPoint: MetricHistory = {
            timestamp: new Date().toISOString(),
            cpu: metricsPayload.cpu.usage,
            memory: metricsPayload.memory.usagePercent,
            responseTime:
              serviceList.reduce((sum, s) => sum + s.responseTime, 0) / serviceList.length,
            requestRate: perf?.requestRate ?? 0,
            errorRate: perf?.errorRate ?? 0,
          };
          return [...prev, newPoint].slice(-50);
        });
      }

      setLastRefresh(new Date());
      setError('');
    } catch (error: any) {
      console.error('Error fetching metrics:', error);
      setError(error?.message || t('common.failedToLoadMetrics'));
      setMetrics(null);
      setServices([]);
      setAlerts([]);
    }
  }, [t]);

  // Initial fetch
  useEffect(() => {
    setLoading(true);
    fetchMetrics();
    setLoading(false);
  }, [fetchMetrics]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchMetrics();
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh, fetchMetrics]);

  // Helper functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Healthy':
        return 'bg-green-500';
      case 'Degraded':
        return 'bg-yellow-500';
      case 'Unhealthy':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Info':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} MB`;
    return `${(bytes / 1024).toFixed(2)} GB`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              System Monitoring
            </h1>
            <p className="text-gray-600 mt-2">
              Real-time system metrics and performance monitoring
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-500">
              Last updated: {lastRefresh.toLocaleTimeString()}
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded"
              />
              Auto-refresh (30s)
            </label>
            <button
              onClick={fetchMetrics}
              disabled={loading}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {loading ? t('global.monitoring.labels.refreshing') : t('global.monitoring.actions.refreshNow')}
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

      {/* System Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* CPU Usage */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">CPU Usage</h3>
            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
            </svg>
          </div>
          <div className="mb-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-gray-900">
                {metrics?.cpu.usage.toFixed(1) || '0'}%
              </span>
              <span className="text-sm text-gray-500">{metrics?.cpu.cores} cores</span>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
            <div
              className={`h-3 rounded-full transition-all duration-500 ${
                (metrics?.cpu.usage || 0) > 80
                  ? 'bg-red-500'
                  : (metrics?.cpu.usage || 0) > 60
                  ? 'bg-yellow-500'
                  : 'bg-green-500'
              }`}
              style={{ width: `${metrics?.cpu.usage || 0}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Load: {metrics?.cpu.loadAverage.map((l) => l.toFixed(2)).join(', ')}
          </p>
        </div>

        {/* Memory Usage */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Memory Usage</h3>
            <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div className="mb-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-gray-900">
                {metrics?.memory.usagePercent.toFixed(1) || '0'}%
              </span>
              <span className="text-sm text-gray-500">
                {formatBytes(metrics?.memory.used || 0)} / {formatBytes(metrics?.memory.total || 0)}
              </span>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
            <div
              className={`h-3 rounded-full transition-all duration-500 ${
                (metrics?.memory.usagePercent || 0) > 80
                  ? 'bg-red-500'
                  : (metrics?.memory.usagePercent || 0) > 60
                  ? 'bg-yellow-500'
                  : 'bg-purple-500'
              }`}
              style={{ width: `${metrics?.memory.usagePercent || 0}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">Free: {formatBytes(metrics?.memory.free || 0)}</p>
        </div>

        {/* Disk Usage */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Disk Usage</h3>
            <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
            </svg>
          </div>
          <div className="mb-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-gray-900">
                {metrics?.disk.usagePercent.toFixed(1) || '0'}%
              </span>
              <span className="text-sm text-gray-500">
                {formatBytes(metrics?.disk.used || 0)} / {formatBytes(metrics?.disk.total || 0)}
              </span>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
            <div
              className={`h-3 rounded-full transition-all duration-500 ${
                (metrics?.disk.usagePercent || 0) > 80
                  ? 'bg-red-500'
                  : (metrics?.disk.usagePercent || 0) > 60
                  ? 'bg-yellow-500'
                  : 'bg-indigo-500'
              }`}
              style={{ width: `${metrics?.disk.usagePercent || 0}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">Free: {formatBytes(metrics?.disk.free || 0)}</p>
        </div>
      </div>

      {/* Active Alerts */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 mb-8 overflow-hidden">
        <div className="bg-gradient-to-r from-red-600 to-orange-600 px-6 py-4">
          <h2 className="text-xl font-bold text-white">Active Alerts</h2>
          <p className="text-red-100 text-sm mt-1">Recent system alerts and notifications</p>
        </div>
        <div className="p-6">
          {alerts.filter((a) => !a.resolved).length > 0 ? (
            <div className="space-y-3">
              {alerts
                .filter((a) => !a.resolved)
                .map((alert) => (
                  <div
                    key={alert.id}
                    className={`border rounded-lg p-4 ${getSeverityColor(alert.severity)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold">{alert.severity}</span>
                          <span className="text-sm text-gray-600">• {alert.service}</span>
                        </div>
                        <p className="text-sm">{alert.message}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(alert.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>No active alerts</p>
            </div>
          )}
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Response Time Chart */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
            <h2 className="text-xl font-bold text-white">Response Time</h2>
            <p className="text-blue-100 text-sm mt-1">Average response time (ms)</p>
          </div>
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <button
                onClick={() => setTimeRange('24h')}
                className={`px-3 py-1 rounded text-sm ${
                  timeRange === '24h' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
                }`}
              >
                24h
              </button>
              <button
                onClick={() => setTimeRange('7d')}
                className={`px-3 py-1 rounded text-sm ${
                  timeRange === '7d' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
                }`}
              >
                7d
              </button>
              <button
                onClick={() => setTimeRange('30d')}
                className={`px-3 py-1 rounded text-sm ${
                  timeRange === '30d' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
                }`}
              >
                30d
              </button>
            </div>
            <div className="relative h-48 border border-gray-200 rounded-lg bg-gradient-to-br from-gray-50 to-white p-4">
              <div className="absolute inset-0 flex items-end justify-around p-4 gap-1">
                {metricHistory.slice(-20).map((point, index) => {
                  const height = (point.responseTime / 200) * 100;
                  return (
                    <div
                      key={index}
                      className="group relative flex-1 flex items-end"
                      title={`${new Date(point.timestamp).toLocaleTimeString()}: ${point.responseTime.toFixed(0)}ms`}
                    >
                      <div
                        className="w-full bg-blue-500 rounded-t transition-all duration-300 hover:opacity-80 relative"
                        style={{ height: `${Math.max(height, 5)}%` }}
                      >
                        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                          {point.responseTime.toFixed(0)}ms
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Request Rate Chart */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4">
            <h2 className="text-xl font-bold text-white">Request Rate</h2>
            <p className="text-green-100 text-sm mt-1">Requests per second</p>
          </div>
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <button
                onClick={() => setTimeRange('24h')}
                className={`px-3 py-1 rounded text-sm ${
                  timeRange === '24h' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'
                }`}
              >
                24h
              </button>
              <button
                onClick={() => setTimeRange('7d')}
                className={`px-3 py-1 rounded text-sm ${
                  timeRange === '7d' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'
                }`}
              >
                7d
              </button>
              <button
                onClick={() => setTimeRange('30d')}
                className={`px-3 py-1 rounded text-sm ${
                  timeRange === '30d' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'
                }`}
              >
                30d
              </button>
            </div>
            <div className="relative h-48 border border-gray-200 rounded-lg bg-gradient-to-br from-gray-50 to-white p-4">
              <div className="absolute inset-0 flex items-end justify-around p-4 gap-1">
                {metricHistory.slice(-20).map((point, index) => {
                  const height = (point.requestRate / 2000) * 100;
                  return (
                    <div
                      key={index}
                      className="group relative flex-1 flex items-end"
                      title={`${new Date(point.timestamp).toLocaleTimeString()}: ${point.requestRate.toFixed(0)} req/s`}
                    >
                      <div
                        className="w-full bg-green-500 rounded-t transition-all duration-300 hover:opacity-80 relative"
                        style={{ height: `${Math.max(height, 5)}%` }}
                      >
                        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                          {point.requestRate.toFixed(0)} req/s
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Error Rate Chart */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 overflow-hidden lg:col-span-2">
          <div className="bg-gradient-to-r from-red-600 to-pink-600 px-6 py-4">
            <h2 className="text-xl font-bold text-white">Error Rate</h2>
            <p className="text-red-100 text-sm mt-1">Error percentage over time</p>
          </div>
          <div className="p-6">
            <div className="relative h-48 border border-gray-200 rounded-lg bg-gradient-to-br from-gray-50 to-white p-4">
              <div className="absolute inset-0 flex items-end justify-around p-4 gap-1">
                {metricHistory.slice(-40).map((point, index) => {
                  const height = (point.errorRate / 5) * 100;
                  const color = point.errorRate > 3 ? 'bg-red-500' : point.errorRate > 1 ? 'bg-yellow-500' : 'bg-green-500';
                  return (
                    <div
                      key={index}
                      className="group relative flex-1 flex items-end"
                      title={`${new Date(point.timestamp).toLocaleTimeString()}: ${point.errorRate.toFixed(2)}%`}
                    >
                      <div
                        className={`w-full ${color} rounded-t transition-all duration-300 hover:opacity-80 relative`}
                        style={{ height: `${Math.max(height, 5)}%` }}
                      >
                        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                          {point.errorRate.toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Service Health Status */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4">
          <h2 className="text-xl font-bold text-white">Service Health Status</h2>
          <p className="text-purple-100 text-sm mt-1">Real-time health status of all services</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Service
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Uptime
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Response Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Checked
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {services.map((service, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(service.status)} mr-3`} />
                      <span className="text-sm font-semibold text-gray-900">{service.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                        service.status === 'Healthy'
                          ? 'bg-green-100 text-green-800 border-green-200'
                          : service.status === 'Degraded'
                          ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                          : 'bg-red-100 text-red-800 border-red-200'
                      }`}
                    >
                      {service.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {service.uptime.toFixed(2)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`text-sm font-semibold ${
                        service.responseTime < 100
                          ? 'text-green-600'
                          : service.responseTime < 200
                          ? 'text-yellow-600'
                          : 'text-red-600'
                      }`}
                    >
                      {service.responseTime.toFixed(0)}ms
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(service.lastChecked).toLocaleTimeString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
