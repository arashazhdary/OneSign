import { useState, useEffect } from 'react';
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
  type: 'CPU' | 'Memory' | 'Response Time' | 'Database' | 'Cache';
  severity: 'Warning' | 'Critical';
  message: string;
  timestamp: string;
  resolved: boolean;
}

interface ChartDataPoint {
  timestamp: string;
  value: number;
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
    activeConnections: 0
  });
  const [cpuHistory, setCpuHistory] = useState<ChartDataPoint[]>([]);
  const [memoryHistory, setMemoryHistory] = useState<ChartDataPoint[]>([]);
  const [requestHistory, setRequestHistory] = useState<ChartDataPoint[]>([]);
  const [responseTimeHistory, setResponseTimeHistory] = useState<ChartDataPoint[]>([]);
  const [slowQueries, setSlowQueries] = useState<SlowQuery[]>([]);
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchMetrics = async () => {
    setLoading(true);
    setError('');
    try {
      const data = (await globalService.getPerformanceMetrics()) as any;
      setMetrics(data);
    } catch (err: any) {
      setError(err.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  // const fetchSlowQueries = async () => {
  //   try {
  //     const data = (await globalService.getSlowQueries()) as any;
  //     setSlowQueries(data.queries || []);
  //   } catch (err) {
  //     console.error('Failed to fetch slow queries');
  //   }
  // };

  // const fetchAlerts = async () => {
  //   try {
  //     const data = await globalService.getPerformanceAlerts();
  //     setAlerts(data.alerts || []);
  //   } catch (err) {
  //     console.error('Failed to fetch alerts');
  //   }
  // };

  // const resolveAlert = async (alertId: string) => {
  //   try {
  //     await globalService.resolvePerformanceAlert(alertId);
  //     setAlerts(prev => prev.map(alert =>
  //       alert.id === alertId ? { ...alert, resolved: true } : alert
  //     ));
  //   } catch (err) {
  //     console.error('Failed to resolve alert');
  //   }
  // };

  // Simulate real-time data updates
  useEffect(() => {
    fetchMetrics();
    // fetchSlowQueries();
    // fetchAlerts();

    const interval = setInterval(() => {
      // Simulate real-time metrics
      const now = new Date().toLocaleTimeString();
      const newCpu = Math.random() * 100;
      const newMemory = Math.random() * 16384;
      const newRequests = Math.floor(Math.random() * 1000);
      const newResponseTime = Math.random() * 500;

      setMetrics(prev => ({
        ...prev,
        cpuUsage: newCpu,
        memoryUsage: newMemory,
        requestRate: newRequests,
        avgResponseTime: newResponseTime,
        cacheHitRate: 80 + Math.random() * 15
      }));

      setCpuHistory(prev => [...prev.slice(-29), { timestamp: now, value: newCpu }]);
      setMemoryHistory(prev => [...prev.slice(-29), { timestamp: now, value: newMemory }]);
      setRequestHistory(prev => [...prev.slice(-29), { timestamp: now, value: newRequests }]);
      setResponseTimeHistory(prev => [...prev.slice(-29), { timestamp: now, value: newResponseTime }]);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

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
    { key: 'query', label: 'Query', render: (q) => (
      <div className="max-w-md truncate font-mono text-xs">{q.query}</div>
    ) },
    { key: 'executionTime', label: 'Execution Time', render: (q) => `${q.executionTime}ms` }
  ];

  const renderChart = (data: ChartDataPoint[], label: string, color: string, unit: string = '') => {
    if (data.length === 0) return null;

    const max = Math.max(...data.map(d => d.value));
    const min = Math.min(...data.map(d => d.value));
    const range = max - min || 1;

    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{label}</h3>
        <div className="h-48 flex items-end space-x-1">
          {data.map((point, index) => {
            const height = ((point.value - min) / range) * 100;
            return (
              <div
                key={index}
                className="flex-1 relative group"
                style={{ height: '100%' }}
              >
                <div
                  className={`absolute bottom-0 w-full ${color} rounded-t transition-all duration-300`}
                  style={{ height: `${height}%` }}
                />
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {point.value.toFixed(1)}{unit}
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
        <button
          onClick={fetchMetrics}
          disabled={loading}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium disabled:opacity-50"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Real-time Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500">CPU Usage</div>
              <div className={`text-3xl font-bold mt-1 ${getMetricColor(metrics.cpuUsage, 100)}`}>
                {metrics.cpuUsage.toFixed(1)}%
              </div>
            </div>
            <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
            </svg>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500">Memory Usage</div>
              <div className={`text-3xl font-bold mt-1 ${getMetricColor(metrics.memoryUsage, metrics.memoryTotal)}`}>
                {(metrics.memoryUsage / 1024).toFixed(1)} GB
              </div>
              <div className="text-xs text-gray-400">of {(metrics.memoryTotal / 1024).toFixed(0)} GB</div>
            </div>
            <svg className="w-12 h-12 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500">Request Rate</div>
              <div className="text-3xl font-bold text-green-600 mt-1">
                {metrics.requestRate}
              </div>
              <div className="text-xs text-gray-400">req/min</div>
            </div>
            <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500">Avg Response Time</div>
              <div className={`text-3xl font-bold mt-1 ${getMetricColor(metrics.avgResponseTime, 500)}`}>
                {metrics.avgResponseTime.toFixed(0)} ms
              </div>
            </div>
            <svg className="w-12 h-12 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Database & Cache Metrics */}
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

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {renderChart(cpuHistory, 'CPU Usage Over Time', 'bg-blue-500', '%')}
        {renderChart(memoryHistory, 'Memory Usage Over Time', 'bg-purple-500', ' MB')}
        {renderChart(requestHistory, 'Request Rate Over Time', 'bg-green-500', ' req/min')}
        {renderChart(responseTimeHistory, 'Response Time Over Time', 'bg-yellow-500', ' ms')}
      </div>

      {/* Performance Alerts */}
      {/* Disabled: getPerformanceAlerts and resolvePerformanceAlert do not exist in globalService */}
      {false && alerts.length > 0 && (
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
                    <span className="text-xs px-2 py-1 bg-white rounded border">
                      {alert.severity}
                    </span>
                    {alert.resolved && (
                      <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
                        Resolved
                      </span>
                    )}
                  </div>
                  <div className="text-sm mt-1">{alert.message}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(alert.timestamp).toLocaleString()}
                  </div>
                </div>
                {!alert.resolved && (
                  <button
                    onClick={() => {}} // resolveAlert is not available
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

      {/* Slow Queries Log */}
      {/* Disabled: getSlowQueries does not exist in globalService */}
      {false && (
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
