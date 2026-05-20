import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import DataTable, { Column } from '@/components/common/DataTable';
import { globalService } from '@/lib/api/services/global.service';

interface PerformanceMetrics {
  cpuUsage: number;
  memoryUsage: number;
  memoryTotal: number;
  requestRate: number;
  avgResponseTime: number;
  dbQueryTime: number;
  cacheHitRate: number;
  activeConnections: number;
}

interface SlowQuery {
  id: string;
  query: string;
  executionTime: number;
  timestamp: string;
  database: string;
}

interface PerformanceAlert {
  id: string;
  type: string;
  severity: 'Warning' | 'Critical' | string;
  message: string;
  timestamp: string;
  resolved: boolean;
}

interface ChartDataPoint {
  timestamp: string;
  value: number;
}

function mapPerformanceMetrics(perf: any): PerformanceMetrics {
  const cpuUsage = perf?.cpu?.usage ?? perf?.cpuUsage ?? 0;
  const memoryUsed = perf?.memory?.used ?? perf?.memoryUsage ?? 0;
  const memoryTotal = perf?.memory?.total ?? perf?.memoryTotal ?? 16384;
  return {
    cpuUsage,
    memoryUsage: memoryUsed,
    memoryTotal,
    requestRate: perf?.requestRate ?? perf?.requestsPerMinute ?? 0,
    avgResponseTime: perf?.avgResponseTime ?? perf?.responseTime ?? 0,
    dbQueryTime: perf?.dbQueryTime ?? perf?.database?.queryTimeMs ?? 0,
    cacheHitRate: perf?.cacheHitRate ?? perf?.cache?.hitRate ?? 0,
    activeConnections: perf?.activeConnections ?? perf?.connections ?? 0,
  };
}

function appendHistory(prev: ChartDataPoint[], value: number, max = 30): ChartDataPoint[] {
  const now = new Date().toLocaleTimeString();
  return [...prev.slice(-(max - 1)), { timestamp: now, value }];
}

export default function GlobalPerformancePage() {
  const { t } = useTranslation();
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    cpuUsage: 0,
    memoryUsage: 0,
    memoryTotal: 16384,
    requestRate: 0,
    avgResponseTime: 0,
    dbQueryTime: 0,
    cacheHitRate: 0,
    activeConnections: 0,
  });
  const [cpuHistory, setCpuHistory] = useState<ChartDataPoint[]>([]);
  const [memoryHistory, setMemoryHistory] = useState<ChartDataPoint[]>([]);
  const [requestHistory, setRequestHistory] = useState<ChartDataPoint[]>([]);
  const [responseTimeHistory, setResponseTimeHistory] = useState<ChartDataPoint[]>([]);
  const [slowQueries, setSlowQueries] = useState<SlowQuery[]>([]);
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [perf, alertsData, logsData] = await Promise.all([
        globalService.getPerformanceMetrics(),
        globalService.getAlerts({ category: 'Performance' }),
        globalService.getLogs({ level: 'Warning', pageSize: 20 }).catch(() => null),
      ]);

      if (perf) {
        const mapped = mapPerformanceMetrics(perf);
        setMetrics(mapped);
        setCpuHistory((prev) => appendHistory(prev, mapped.cpuUsage));
        setMemoryHistory((prev) => appendHistory(prev, mapped.memoryUsage));
        setRequestHistory((prev) => appendHistory(prev, mapped.requestRate));
        setResponseTimeHistory((prev) => appendHistory(prev, mapped.avgResponseTime));
      }

      const alertItems = Array.isArray(alertsData) ? alertsData : alertsData?.items ?? [];
      setAlerts(
        alertItems.map((a: any) => ({
          id: a.id,
          type: a.type ?? a.category ?? 'Alert',
          severity: a.severity ?? 'Warning',
          message: a.message ?? a.title ?? '',
          timestamp: a.timestamp ?? a.createdAt ?? new Date().toISOString(),
          resolved: a.status === 'Resolved' || a.resolved === true,
        }))
      );

      const logItems = logsData?.items ?? logsData?.logs ?? (Array.isArray(logsData) ? logsData : []);
      setSlowQueries(
        logItems
          .filter((l: any) => l.durationMs > 500 || l.executionTime > 500)
          .slice(0, 20)
          .map((l: any, i: number) => ({
            id: l.id || String(i),
            query: l.message || l.query || l.text || '—',
            executionTime: l.durationMs ?? l.executionTime ?? 0,
            timestamp: l.timestamp ?? l.createdAt ?? new Date().toISOString(),
            database: l.database ?? l.source ?? 'default',
          }))
      );
    } catch (err: any) {
      setError(err.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  const resolveAlert = async (alertId: string) => {
    try {
      await globalService.resolveAlert(alertId);
      setAlerts((prev) =>
        prev.map((alert) => (alert.id === alertId ? { ...alert, resolved: true } : alert))
      );
    } catch (err) {
      console.error('Failed to resolve alert', err);
      setError(t('common.error'));
    }
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchData]);

  const getMetricColor = (value: number, threshold: number) => {
    if (value > threshold * 0.9) return 'text-red-600';
    if (value > threshold * 0.7) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getAlertColor = (severity: string) => {
    return severity === 'Critical'
      ? 'bg-red-100 text-red-800 border-red-300'
      : 'bg-yellow-100 text-yellow-800 border-yellow-300';
  };

  const slowQueryColumns: Column<SlowQuery>[] = [
    { key: 'timestamp', label: 'Timestamp', render: (q) => new Date(q.timestamp).toLocaleString() },
    { key: 'database', label: 'Database' },
    {
      key: 'query',
      label: 'Query',
      render: (q) => <div className="max-w-md truncate font-mono text-xs">{q.query}</div>,
    },
    { key: 'executionTime', label: 'Execution Time', render: (q) => `${q.executionTime}ms` },
  ];

  const renderChart = (data: ChartDataPoint[], label: string, color: string, unit: string = '') => {
    if (data.length === 0) return null;

    const max = Math.max(...data.map((d) => d.value));
    const min = Math.min(...data.map((d) => d.value));
    const range = max - min || 1;

    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{label}</h3>
        <div className="h-48 flex items-end space-x-1">
          {data.map((point, index) => {
            const height = ((point.value - min) / range) * 100;
            return (
              <div key={index} className="flex-1 relative group" style={{ height: '100%' }}>
                <div
                  className={`absolute bottom-0 w-full ${color} rounded-t transition-all duration-300`}
                  style={{ height: `${height}%` }}
                />
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {point.value.toFixed(1)}
                  {unit}
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>{data[0]?.timestamp}</span>
          <span>{data[data.length - 1]?.timestamp}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Performance Monitoring</h1>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            Auto-refresh (30s)
          </label>
          <button
            onClick={fetchData}
            disabled={loading}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium disabled:opacity-50"
          >
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-500">CPU Usage</div>
          <div className={`text-3xl font-bold mt-1 ${getMetricColor(metrics.cpuUsage, 100)}`}>
            {metrics.cpuUsage.toFixed(1)}%
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-500">Memory Usage</div>
          <div
            className={`text-3xl font-bold mt-1 ${getMetricColor(metrics.memoryUsage, metrics.memoryTotal)}`}
          >
            {(metrics.memoryUsage / 1024).toFixed(1)} GB
          </div>
          <div className="text-xs text-gray-400">of {(metrics.memoryTotal / 1024).toFixed(0)} GB</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-500">Request Rate</div>
          <div className="text-3xl font-bold text-green-600 mt-1">{metrics.requestRate}</div>
          <div className="text-xs text-gray-400">req/min</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-500">Avg Response Time</div>
          <div className={`text-3xl font-bold mt-1 ${getMetricColor(metrics.avgResponseTime, 500)}`}>
            {metrics.avgResponseTime.toFixed(0)} ms
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-500">Database Query Time</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{metrics.dbQueryTime.toFixed(2)} ms</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-500">Cache Hit Rate</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{metrics.cacheHitRate.toFixed(1)}%</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-500">Active Connections</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{metrics.activeConnections}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {renderChart(cpuHistory, 'CPU Usage Over Time', 'bg-blue-500', '%')}
        {renderChart(memoryHistory, 'Memory Usage Over Time', 'bg-purple-500', ' MB')}
        {renderChart(requestHistory, 'Request Rate Over Time', 'bg-green-500', ' req/min')}
        {renderChart(responseTimeHistory, 'Response Time Over Time', 'bg-yellow-500', ' ms')}
      </div>

      {alerts.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Performance Alerts</h2>
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`border rounded-lg p-4 flex items-center justify-between ${
                  alert.resolved ? 'opacity-50 bg-gray-50' : getAlertColor(alert.severity)
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{alert.type}</span>
                    <span className="text-xs px-2 py-1 bg-white rounded border">{alert.severity}</span>
                    {alert.resolved && (
                      <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">Resolved</span>
                    )}
                  </div>
                  <div className="text-sm mt-1">{alert.message}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(alert.timestamp).toLocaleString()}
                  </div>
                </div>
                {!alert.resolved && (
                  <button
                    onClick={() => resolveAlert(alert.id)}
                    className="ml-4 px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 text-sm"
                  >
                    Resolve
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {slowQueries.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Slow Queries Log</h2>
          <DataTable
            data={slowQueries}
            columns={slowQueryColumns}
            loading={loading}
            emptyMessage="No slow queries detected"
          />
        </div>
      )}
    </div>
  );
}
