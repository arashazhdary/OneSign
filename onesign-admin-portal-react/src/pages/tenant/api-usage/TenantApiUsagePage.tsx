import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getTenantId } from '@/lib/tenant-context';
import { billingService } from '@/lib/api/services';
import { Helmet } from 'react-helmet-async';

interface ApiUsageStats {
  period: string;
  totalCalls: number;
  successCalls: number;
  errorCalls: number;
  avgResponseTime: number;
  totalCost: number;
}

interface EndpointUsage {
  endpoint: string;
  method: string;
  calls: number;
  avgResponseTime: number;
  errorRate: number;
  lastCalled: string;
}

interface RateLimit {
  name: string;
  limit: number;
  used: number;
  remaining: number;
  resetAt: string;
}

interface UsageChartData {
  date: string;
  calls: number;
  errors: number;
}

// Mock data for fallback
const mockStatsFallback: ApiUsageStats[] = [
  {
    period: 'Today',
    totalCalls: 12543,
    successCalls: 12389,
    errorCalls: 154,
    avgResponseTime: 145,
    totalCost: 25.08,
  },
  {
    period: 'This Week',
    totalCalls: 87632,
    successCalls: 86421,
    errorCalls: 1211,
    avgResponseTime: 152,
    totalCost: 175.26,
  },
  {
    period: 'This Month',
    totalCalls: 342156,
    successCalls: 337890,
    errorCalls: 4266,
    avgResponseTime: 148,
    totalCost: 684.31,
  },
];

const mockEndpointsFallback: EndpointUsage[] = [
  {
    endpoint: '/api/tenant/users',
    method: 'GET',
    calls: 4532,
    avgResponseTime: 89,
    errorRate: 0.8,
    lastCalled: '2025-11-23T11:45:23Z',
  },
  {
    endpoint: '/api/tenant/users',
    method: 'POST',
    calls: 1243,
    avgResponseTime: 234,
    errorRate: 2.1,
    lastCalled: '2025-11-23T11:42:15Z',
  },
  {
    endpoint: '/api/tenant/applications',
    method: 'GET',
    calls: 2134,
    avgResponseTime: 112,
    errorRate: 1.2,
    lastCalled: '2025-11-23T11:40:08Z',
  },
  {
    endpoint: '/api/tenant/roles',
    method: 'GET',
    calls: 1876,
    avgResponseTime: 67,
    errorRate: 0.3,
    lastCalled: '2025-11-23T11:38:42Z',
  },
  {
    endpoint: '/api/tenant/audit-logs',
    method: 'GET',
    calls: 987,
    avgResponseTime: 456,
    errorRate: 4.5,
    lastCalled: '2025-11-23T11:35:19Z',
  },
];

const mockRateLimitsFallback: RateLimit[] = [
  {
    name: 'API Calls per Hour',
    limit: 10000,
    used: 3542,
    remaining: 6458,
    resetAt: '2025-11-23T12:00:00Z',
  },
  {
    name: 'API Calls per Day',
    limit: 100000,
    used: 12543,
    remaining: 87457,
    resetAt: '2025-11-24T00:00:00Z',
  },
  {
    name: 'Concurrent Requests',
    limit: 100,
    used: 23,
    remaining: 77,
    resetAt: 'Real-time',
  },
];

const mockChartDataFallback: UsageChartData[] = [
  { date: '2025-11-17', calls: 11234, errors: 145 },
  { date: '2025-11-18', calls: 12456, errors: 178 },
  { date: '2025-11-19', calls: 13123, errors: 203 },
  { date: '2025-11-20', calls: 11987, errors: 156 },
  { date: '2025-11-21', calls: 13543, errors: 198 },
  { date: '2025-11-22', calls: 12746, errors: 177 },
  { date: '2025-11-23', calls: 12543, errors: 154 },
];

export default function TenantApiUsagePage() {
  const { t } = useTranslation();
  const [stats, setStats] = useState<ApiUsageStats[]>([]);
  const [endpoints, setEndpoints] = useState<EndpointUsage[]>([]);
  const [rateLimits, setRateLimits] = useState<RateLimit[]>([]);
  const [chartData, setChartData] = useState<UsageChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartPeriod, setChartPeriod] = useState<'7' | '30'>('7');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tenantId, setTenantIdState] = useState<string | null>(null);

  useEffect(() => {
    const contextTenantId = getTenantId();
    if (contextTenantId) {
      setTenantIdState(contextTenantId);
    } else {
      setTenantIdState('00000000-0000-0000-0000-000000000000');
    }
  }, []);

  useEffect(() => {
    if (tenantId) {
      fetchUsageData();
    }
  }, [tenantId]);

  const fetchUsageData = async () => {
    if (!tenantId) return;

    try {
      // Fetch from real API
      const usageData = await billingService.getUsageMetrics(tenantId);

      // Map API response to component state
      if (usageData) {
        // Transform usage metrics to stats format
        const transformedStats: ApiUsageStats[] = [
          {
            period: 'Today',
            totalCalls: usageData.apiCalls?.today || 0,
            successCalls: usageData.apiCalls?.today - (usageData.errors?.today || 0) || 0,
            errorCalls: usageData.errors?.today || 0,
            avgResponseTime: usageData.avgResponseTime?.today || 0,
            totalCost: usageData.cost?.today || 0,
          },
          {
            period: 'This Week',
            totalCalls: usageData.apiCalls?.week || 0,
            successCalls: usageData.apiCalls?.week - (usageData.errors?.week || 0) || 0,
            errorCalls: usageData.errors?.week || 0,
            avgResponseTime: usageData.avgResponseTime?.week || 0,
            totalCost: usageData.cost?.week || 0,
          },
          {
            period: 'This Month',
            totalCalls: usageData.apiCalls?.month || 0,
            successCalls: usageData.apiCalls?.month - (usageData.errors?.month || 0) || 0,
            errorCalls: usageData.errors?.month || 0,
            avgResponseTime: usageData.avgResponseTime?.month || 0,
            totalCost: usageData.cost?.month || 0,
          },
        ];

        setStats(transformedStats.length > 0 ? transformedStats : mockStatsFallback);
        setEndpoints(usageData.endpoints || mockEndpointsFallback);
        setRateLimits(usageData.rateLimits || mockRateLimitsFallback);
        setChartData(usageData.chartData || mockChartDataFallback);
      } else {
        // Fallback to mock data if no data returned
        setStats(mockStatsFallback);
        setEndpoints(mockEndpointsFallback);
        setRateLimits(mockRateLimitsFallback);
        setChartData(mockChartDataFallback);
      }
    } catch (error: any) {
      console.error('Error fetching API usage data:', error);
      setError(error?.message || t('common.failedToLoadApiUsageData'));
      // Fallback to mock data on error
      setStats(mockStatsFallback);
      setEndpoints(mockEndpointsFallback);
      setRateLimits(mockRateLimitsFallback);
      setChartData(mockChartDataFallback);
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = async (format: 'csv' | 'json' | 'xlsx') => {
    setError('');
    setSuccess('');

    try {
      const blob = await billingService.exportUsageReport(format);
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `api-usage-report.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setSuccess(`Usage report exported as ${format.toUpperCase()}`);
    } catch (error: any) {
      setError(error?.message || t('common.failedToExportReport'));
    }
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getProgressBarColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-600';
    if (percentage >= 75) return 'bg-yellow-600';
    return 'bg-green-600';
  };

  const calculatePercentage = (used: number, limit: number) => {
    return Math.round((used / limit) * 100);
  };

  const getErrorRateColor = (rate: number) => {
    if (rate >= 5) return 'text-red-600';
    if (rate >= 2) return 'text-yellow-600';
    return 'text-green-600';
  };

  if (loading) {
    return <div className="p-8">Loading API usage data...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">API Usage & Monitoring</h1>
        <div className="flex gap-2">
          <button
            onClick={() => handleExportReport('csv')}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Export CSV
          </button>
          <button
            onClick={() => handleExportReport('xlsx')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Export Excel
          </button>
          <button
            onClick={() => handleExportReport('json')}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Export JSON
          </button>
        </div>
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

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {stats.map((stat) => (
          <div key={stat.period} className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">{stat.period}</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Total API Calls</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(stat.totalCalls)}</p>
              </div>
              <div className="flex justify-between">
                <div>
                  <p className="text-xs text-gray-600">Success</p>
                  <p className="text-lg font-semibold text-green-600">{formatNumber(stat.successCalls)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Errors</p>
                  <p className="text-lg font-semibold text-red-600">{formatNumber(stat.errorCalls)}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600">Avg Response Time</p>
                <p className="text-xl font-semibold text-gray-900">{stat.avgResponseTime}ms</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Cost</p>
                <p className="text-xl font-semibold text-indigo-600">${stat.totalCost.toFixed(2)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Rate Limits */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Rate Limits</h2>
        <div className="space-y-4">
          {rateLimits.map((limit) => {
            const percentage = calculatePercentage(limit.used, limit.limit);
            return (
              <div key={limit.name}>
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-900">{limit.name}</h3>
                    <p className="text-sm text-gray-600">
                      {formatNumber(limit.used)} / {formatNumber(limit.limit)} used
                      ({formatNumber(limit.remaining)} remaining)
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">
                      {limit.resetAt === 'Real-time' ? 'Real-time' : `Resets ${formatDate(limit.resetAt)}`}
                    </p>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className={`h-4 rounded-full ${getProgressBarColor(percentage)} transition-all`}
                    style={{ width: `${percentage}%` }}
                  >
                    <span className="text-xs text-white px-2 leading-4">{percentage}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Usage Chart */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">API Calls Over Time</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setChartPeriod('7')}
              className={`px-3 py-1 rounded ${
                chartPeriod === '7'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Last 7 Days
            </button>
            <button
              onClick={() => setChartPeriod('30')}
              className={`px-3 py-1 rounded ${
                chartPeriod === '30'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Last 30 Days
            </button>
          </div>
        </div>

        {/* Simple Bar Chart */}
        <div className="relative h-64">
          <div className="absolute inset-0 flex items-end justify-around space-x-2 px-4">
            {chartData.map((data, index) => {
              const maxCalls = Math.max(...chartData.map(d => d.calls));
              const height = (data.calls / maxCalls) * 100;
              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div className="w-full flex flex-col items-center space-y-1">
                    <div className="text-xs text-gray-600 mb-1">{formatNumber(data.calls)}</div>
                    <div
                      className="w-full bg-indigo-500 rounded-t hover:bg-indigo-600 transition-all cursor-pointer"
                      style={{ height: `${height}%`, minHeight: '20px' }}
                      title={`${data.date}: ${formatNumber(data.calls)} calls, ${data.errors} errors`}
                    />
                  </div>
                  <div className="text-xs text-gray-500 mt-2 whitespace-nowrap">
                    {new Date(data.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-4 flex justify-center">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-indigo-500 rounded"></div>
              <span className="text-sm text-gray-600">API Calls</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Endpoints */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold">Top API Endpoints</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Endpoint</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Calls</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg Response Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Error Rate</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Called</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {endpoints.map((endpoint, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{endpoint.endpoint}</td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        endpoint.method === 'GET'
                          ? 'bg-blue-100 text-blue-800'
                          : endpoint.method === 'POST'
                          ? 'bg-green-100 text-green-800'
                          : endpoint.method === 'PUT'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {endpoint.method}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{formatNumber(endpoint.calls)}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{endpoint.avgResponseTime}ms</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`font-semibold ${getErrorRateColor(endpoint.errorRate)}`}>
                      {endpoint.errorRate.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                    {formatDate(endpoint.lastCalled)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cost Breakdown */}
      <div className="bg-white rounded-lg shadow p-6 mt-6">
        <h2 className="text-xl font-bold mb-4">Cost Tracking</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border rounded p-4">
            <p className="text-sm text-gray-600 mb-1">Today's Cost</p>
            <p className="text-2xl font-bold text-gray-900">${stats[0]?.totalCost.toFixed(2)}</p>
            <p className="text-xs text-gray-500 mt-1">
              ${(stats[0]?.totalCost / stats[0]?.totalCalls * 1000).toFixed(4)} per 1K calls
            </p>
          </div>
          <div className="border rounded p-4">
            <p className="text-sm text-gray-600 mb-1">This Week's Cost</p>
            <p className="text-2xl font-bold text-gray-900">${stats[1]?.totalCost.toFixed(2)}</p>
            <p className="text-xs text-gray-500 mt-1">
              ${(stats[1]?.totalCost / stats[1]?.totalCalls * 1000).toFixed(4)} per 1K calls
            </p>
          </div>
          <div className="border rounded p-4">
            <p className="text-sm text-gray-600 mb-1">This Month's Cost</p>
            <p className="text-2xl font-bold text-gray-900">${stats[2]?.totalCost.toFixed(2)}</p>
            <p className="text-xs text-gray-500 mt-1">
              ${(stats[2]?.totalCost / stats[2]?.totalCalls * 1000).toFixed(4)} per 1K calls
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
