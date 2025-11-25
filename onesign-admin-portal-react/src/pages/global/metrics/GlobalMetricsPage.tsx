import { useState, useEffect } from 'react';
import { platformService } from '@/lib/api/services';
import { Helmet } from 'react-helmet-async';

interface Metric {
  id: string;
  name: string;
  category: 'performance' | 'business' | 'technical' | 'custom';
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  change: number;
  timestamp: string;
}

interface MetricSeries {
  timestamp: string;
  value: number;
}

export default function GlobalMetricsPage() {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [timeRange, setTimeRange] = useState('24h');

  useEffect(() => {
    fetchMetrics();
  }, [timeRange]);

  const fetchMetrics = async () => {
    try {
      // Mock metrics data
      setMetrics([
        // Performance Metrics
        {
          id: '1',
          name: 'API Response Time',
          category: 'performance',
          value: 245,
          unit: 'ms',
          trend: 'down',
          change: -12,
          timestamp: '2024-11-23T10:00:00Z',
        },
        {
          id: '2',
          name: 'Database Query Time',
          category: 'performance',
          value: 89,
          unit: 'ms',
          trend: 'down',
          change: -8,
          timestamp: '2024-11-23T10:00:00Z',
        },
        {
          id: '3',
          name: 'CPU Usage',
          category: 'performance',
          value: 45,
          unit: '%',
          trend: 'stable',
          change: 2,
          timestamp: '2024-11-23T10:00:00Z',
        },
        {
          id: '4',
          name: 'Memory Usage',
          category: 'performance',
          value: 68,
          unit: '%',
          trend: 'up',
          change: 5,
          timestamp: '2024-11-23T10:00:00Z',
        },
        {
          id: '5',
          name: 'Request Throughput',
          category: 'performance',
          value: 15234,
          unit: 'req/min',
          trend: 'up',
          change: 18,
          timestamp: '2024-11-23T10:00:00Z',
        },

        // Business Metrics
        {
          id: '6',
          name: 'Active Tenants',
          category: 'business',
          value: 1250,
          unit: 'tenants',
          trend: 'up',
          change: 15,
          timestamp: '2024-11-23T10:00:00Z',
        },
        {
          id: '7',
          name: 'Total Users',
          category: 'business',
          value: 45678,
          unit: 'users',
          trend: 'up',
          change: 234,
          timestamp: '2024-11-23T10:00:00Z',
        },
        {
          id: '8',
          name: 'API Calls Today',
          category: 'business',
          value: 8567234,
          unit: 'calls',
          trend: 'up',
          change: 12,
          timestamp: '2024-11-23T10:00:00Z',
        },
        {
          id: '9',
          name: 'Revenue (MRR)',
          category: 'business',
          value: 125000,
          unit: 'USD',
          trend: 'up',
          change: 8,
          timestamp: '2024-11-23T10:00:00Z',
        },

        // Technical Metrics
        {
          id: '10',
          name: 'Error Rate',
          category: 'technical',
          value: 0.12,
          unit: '%',
          trend: 'down',
          change: -0.05,
          timestamp: '2024-11-23T10:00:00Z',
        },
        {
          id: '11',
          name: 'Uptime',
          category: 'technical',
          value: 99.98,
          unit: '%',
          trend: 'stable',
          change: 0,
          timestamp: '2024-11-23T10:00:00Z',
        },
        {
          id: '12',
          name: 'Database Connections',
          category: 'technical',
          value: 234,
          unit: 'connections',
          trend: 'stable',
          change: 5,
          timestamp: '2024-11-23T10:00:00Z',
        },
        {
          id: '13',
          name: 'Cache Hit Rate',
          category: 'technical',
          value: 94.5,
          unit: '%',
          trend: 'up',
          change: 2.3,
          timestamp: '2024-11-23T10:00:00Z',
        },
        {
          id: '14',
          name: 'Queue Length',
          category: 'technical',
          value: 1234,
          unit: 'jobs',
          trend: 'down',
          change: -156,
          timestamp: '2024-11-23T10:00:00Z',
        },

        // Custom Metrics
        {
          id: '15',
          name: 'Webhook Success Rate',
          category: 'custom',
          value: 97.8,
          unit: '%',
          trend: 'up',
          change: 1.2,
          timestamp: '2024-11-23T10:00:00Z',
        },
        {
          id: '16',
          name: 'Storage Used',
          category: 'custom',
          value: 4.7,
          unit: 'TB',
          trend: 'up',
          change: 0.3,
          timestamp: '2024-11-23T10:00:00Z',
        },
      ]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return '↑';
    if (trend === 'down') return '↓';
    return '→';
  };

  const getTrendColor = (trend: string, isGood: boolean) => {
    if (trend === 'stable') return 'text-gray-500';
    if (trend === 'up') return isGood ? 'text-green-600' : 'text-red-600';
    return isGood ? 'text-red-600' : 'text-green-600';
  };

  const formatValue = (value: number, unit: string) => {
    if (unit === 'USD') return `$${value.toLocaleString()}`;
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toLocaleString();
  };

  const filteredMetrics = activeCategory === 'all'
    ? metrics
    : metrics.filter(m => m.category === activeCategory);

  const categories = [
    { id: 'all', name: 'All Metrics', count: metrics.length },
    { id: 'performance', name: 'Performance', count: metrics.filter(m => m.category === 'performance').length },
    { id: 'business', name: 'Business', count: metrics.filter(m => m.category === 'business').length },
    { id: 'technical', name: 'Technical', count: metrics.filter(m => m.category === 'technical').length },
    { id: 'custom', name: 'Custom', count: metrics.filter(m => m.category === 'custom').length },
  ];

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Platform Metrics</h1>
          <p className="text-gray-600 mt-1">Real-time platform performance and business metrics</p>
        </div>
        <div className="flex space-x-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Export Report
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            Add Custom Metric
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex space-x-8">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                activeCategory === category.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {category.name} ({category.count})
            </button>
          ))}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {filteredMetrics.map((metric) => {
          const isGoodTrend = metric.category === 'performance'
            ? metric.trend === 'down'
            : metric.trend === 'up';

          return (
            <div key={metric.id} className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <div className="text-sm text-gray-600">{metric.name}</div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  metric.category === 'performance' ? 'bg-blue-100 text-blue-800' :
                  metric.category === 'business' ? 'bg-green-100 text-green-800' :
                  metric.category === 'technical' ? 'bg-purple-100 text-purple-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {metric.category}
                </span>
              </div>

              <div className="flex items-baseline space-x-2 mb-2">
                <div className="text-2xl font-bold">
                  {formatValue(metric.value, metric.unit)}
                </div>
                <div className="text-sm text-gray-500">{metric.unit}</div>
              </div>

              <div className={`flex items-center text-sm ${getTrendColor(metric.trend, isGoodTrend)}`}>
                <span className="text-lg mr-1">{getTrendIcon(metric.trend)}</span>
                <span>
                  {Math.abs(metric.change)}{metric.unit === '%' ? 'pp' : metric.unit === 'USD' ? '%' : ''}
                </span>
                <span className="ml-1 text-gray-500">vs {timeRange}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* API Response Time Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">API Response Time Trend</h3>
          <div className="h-64 flex items-end space-x-2">
            {[245, 238, 252, 241, 235, 229, 242, 238, 245, 240, 236, 245].map((value, index) => (
              <div key={index} className="flex-1 bg-blue-500 rounded-t" style={{ height: `${(value / 300) * 100}%` }}></div>
            ))}
          </div>
          <div className="mt-2 flex justify-between text-xs text-gray-500">
            <span>12h ago</span>
            <span>Now</span>
          </div>
        </div>

        {/* Active Tenants Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Active Tenants Growth</h3>
          <div className="h-64 flex items-end space-x-2">
            {[1200, 1215, 1220, 1225, 1230, 1235, 1238, 1242, 1245, 1248, 1250, 1250].map((value, index) => (
              <div key={index} className="flex-1 bg-green-500 rounded-t" style={{ height: `${((value - 1150) / 100) * 100}%` }}></div>
            ))}
          </div>
          <div className="mt-2 flex justify-between text-xs text-gray-500">
            <span>12h ago</span>
            <span>Now</span>
          </div>
        </div>

        {/* Error Rate Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Error Rate</h3>
          <div className="h-64 flex items-end space-x-2">
            {[0.18, 0.15, 0.16, 0.14, 0.13, 0.15, 0.14, 0.13, 0.12, 0.12, 0.11, 0.12].map((value, index) => (
              <div key={index} className="flex-1 bg-red-500 rounded-t" style={{ height: `${(value / 0.2) * 100}%` }}></div>
            ))}
          </div>
          <div className="mt-2 flex justify-between text-xs text-gray-500">
            <span>12h ago</span>
            <span>Now</span>
          </div>
        </div>

        {/* Cache Hit Rate Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Cache Hit Rate</h3>
          <div className="h-64 flex items-end space-x-2">
            {[92, 92.5, 93, 93.2, 93.5, 94, 94.2, 94.3, 94.4, 94.5, 94.5, 94.5].map((value, index) => (
              <div key={index} className="flex-1 bg-purple-500 rounded-t" style={{ height: `${((value - 90) / 10) * 100}%` }}></div>
            ))}
          </div>
          <div className="mt-2 flex justify-between text-xs text-gray-500">
            <span>12h ago</span>
            <span>Now</span>
          </div>
        </div>
      </div>

      {/* System Health Summary */}
      <div className="mt-6 bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">System Health Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="text-sm text-gray-600 mb-2">Overall Health</div>
            <div className="flex items-center">
              <div className="w-full bg-gray-200 rounded-full h-2 mr-3">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '98%' }}></div>
              </div>
              <span className="text-sm font-semibold">98%</span>
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-2">Performance Score</div>
            <div className="flex items-center">
              <div className="w-full bg-gray-200 rounded-full h-2 mr-3">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '94%' }}></div>
              </div>
              <span className="text-sm font-semibold">94%</span>
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-2">Reliability Score</div>
            <div className="flex items-center">
              <div className="w-full bg-gray-200 rounded-full h-2 mr-3">
                <div className="bg-purple-600 h-2 rounded-full" style={{ width: '99%' }}></div>
              </div>
              <span className="text-sm font-semibold">99%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
