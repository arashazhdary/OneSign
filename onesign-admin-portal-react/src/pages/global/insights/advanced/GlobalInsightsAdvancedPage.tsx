import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import * as insightsApi from '@/lib/api/insights';
import { Helmet } from 'react-helmet-async';

type ChartType = 'line' | 'bar' | 'pie' | 'area';
type MetricType = 'tenants' | 'users' | 'growth' | 'resources' | 'costs' | 'geography';

interface DashboardMetric {
  id: string;
  name: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  unit?: string;
}

interface TenantComparison {
  tenantId: string;
  tenantName: string;
  users: number;
  activeUsers: number;
  growth: number;
  revenue: number;
  resourceUsage: number;
}

interface GrowthTrend {
  date: string;
  tenants: number;
  users: number;
  revenue: number;
}

interface ResourceUtilization {
  category: string;
  allocated: number;
  used: number;
  percentage: number;
}

interface GeographicDistribution {
  region: string;
  country: string;
  tenants: number;
  users: number;
  percentage: number;
}

interface ForecastData {
  metric: string;
  current: number;
  forecast30d: number;
  forecast60d: number;
  forecast90d: number;
  confidence: number;
}

interface CostOptimization {
  id: string;
  category: string;
  suggestion: string;
  potentialSaving: number;
  effort: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
}

export default function GlobalInsightsAdvancedPage() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Date range
  const [dateRange, setDateRange] = useState('30');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');

  // Platform metrics
  const [platformMetrics, setPlatformMetrics] = useState<DashboardMetric[]>([]);
  const [tenantComparisons, setTenantComparisons] = useState<TenantComparison[]>([]);
  const [growthTrends, setGrowthTrends] = useState<GrowthTrend[]>([]);
  const [resourceUtilization, setResourceUtilization] = useState<ResourceUtilization[]>([]);
  const [geographicDist, setGeographicDist] = useState<GeographicDistribution[]>([]);
  const [forecasts, setForecasts] = useState<ForecastData[]>([]);
  const [costOptimizations, setCostOptimizations] = useState<CostOptimization[]>([]);

  // Filters
  const [selectedMetrics, setSelectedMetrics] = useState<MetricType[]>(['tenants', 'users', 'growth']);
  const [topTenantsCount, setTopTenantsCount] = useState(10);
  const [sortBy, setSortBy] = useState<'users' | 'growth' | 'revenue' | 'resources'>('users');

  useEffect(() => {
    fetchData();
  }, [dateRange, customFrom, customTo, sortBy, topTenantsCount]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      // Fetch platform overview
      const overview = await insightsApi.getGlobalPlatformOverview();

      // Generate platform metrics with trends
      const metrics: DashboardMetric[] = [
        {
          id: '1',
          name: 'Total Tenants',
          value: overview.totalTenants,
          change: 12.5,
          trend: 'up',
        },
        {
          id: '2',
          name: 'Active Tenants',
          value: overview.activeTenants,
          change: 8.3,
          trend: 'up',
        },
        {
          id: '3',
          name: 'Total Users',
          value: overview.totalUsers.toLocaleString(),
          change: 15.7,
          trend: 'up',
        },
        {
          id: '4',
          name: 'Platform Uptime',
          value: overview.systemUptime,
          change: 0.2,
          trend: 'up',
          unit: '%',
        },
        {
          id: '5',
          name: 'Avg MFA Adoption',
          value: overview.averageMfaAdoptionRate,
          change: -2.1,
          trend: 'down',
          unit: '%',
        },
        {
          id: '6',
          name: 'Daily Active Users',
          value: Math.floor(overview.totalUsers * 0.65).toLocaleString(),
          change: 5.4,
          trend: 'up',
        },
      ];
      setPlatformMetrics(metrics);

      // Fetch tenant usage
      const tenantData = await insightsApi.getGlobalTenantUsage();
      const comparisons: TenantComparison[] = (tenantData.items || []).slice(0, topTenantsCount).map((tenant: any) => ({
        tenantId: tenant.tenantId,
        tenantName: tenant.tenantName,
        users: tenant.userCount,
        activeUsers: tenant.activeUsers,
        growth: Math.random() * 30 - 5, // Simulated growth
        revenue: tenant.userCount * 50 + Math.random() * 1000, // Simulated revenue
        resourceUsage: tenant.activeUsers / tenant.userCount * 100,
      }));
      setTenantComparisons(comparisons);

      // Generate growth trends (simulated historical data)
      const trends: GrowthTrend[] = [];
      const daysBack = parseInt(dateRange === 'custom' ? '30' : dateRange);
      for (let i = daysBack; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        trends.push({
          date: date.toISOString().split('T')[0],
          tenants: Math.floor(overview.totalTenants * (0.8 + (daysBack - i) / daysBack * 0.2)),
          users: Math.floor(overview.totalUsers * (0.7 + (daysBack - i) / daysBack * 0.3)),
          revenue: Math.floor((overview.totalUsers * 50) * (0.75 + (daysBack - i) / daysBack * 0.25)),
        });
      }
      setGrowthTrends(trends);

      // Generate resource utilization data
      const resources: ResourceUtilization[] = [
        { category: 'Compute', allocated: 1000, used: 750, percentage: 75 },
        { category: 'Storage', allocated: 500, used: 380, percentage: 76 },
        { category: 'Database', allocated: 100, used: 82, percentage: 82 },
        { category: 'API Calls', allocated: 1000000, used: 650000, percentage: 65 },
        { category: 'Bandwidth', allocated: 10000, used: 7200, percentage: 72 },
      ];
      setResourceUtilization(resources);

      // Generate geographic distribution (simulated)
      const geography: GeographicDistribution[] = [
        { region: 'North America', country: 'USA', tenants: Math.floor(overview.totalTenants * 0.35), users: Math.floor(overview.totalUsers * 0.40), percentage: 40 },
        { region: 'Europe', country: 'UK', tenants: Math.floor(overview.totalTenants * 0.25), users: Math.floor(overview.totalUsers * 0.25), percentage: 25 },
        { region: 'Asia Pacific', country: 'Singapore', tenants: Math.floor(overview.totalTenants * 0.20), users: Math.floor(overview.totalUsers * 0.20), percentage: 20 },
        { region: 'Europe', country: 'Germany', tenants: Math.floor(overview.totalTenants * 0.10), users: Math.floor(overview.totalUsers * 0.08), percentage: 8 },
        { region: 'South America', country: 'Brazil', tenants: Math.floor(overview.totalTenants * 0.05), users: Math.floor(overview.totalUsers * 0.04), percentage: 4 },
        { region: 'Other', country: 'Various', tenants: Math.floor(overview.totalTenants * 0.05), users: Math.floor(overview.totalUsers * 0.03), percentage: 3 },
      ];
      setGeographicDist(geography);

      // Generate forecasts
      const forecastData: ForecastData[] = [
        {
          metric: 'Total Tenants',
          current: overview.totalTenants,
          forecast30d: Math.floor(overview.totalTenants * 1.05),
          forecast60d: Math.floor(overview.totalTenants * 1.12),
          forecast90d: Math.floor(overview.totalTenants * 1.18),
          confidence: 85,
        },
        {
          metric: 'Total Users',
          current: overview.totalUsers,
          forecast30d: Math.floor(overview.totalUsers * 1.08),
          forecast60d: Math.floor(overview.totalUsers * 1.17),
          forecast90d: Math.floor(overview.totalUsers * 1.25),
          confidence: 82,
        },
        {
          metric: 'Resource Usage (%)',
          current: 72,
          forecast30d: 76,
          forecast60d: 81,
          forecast90d: 85,
          confidence: 78,
        },
      ];
      setForecasts(forecastData);

      // Generate cost optimization suggestions
      const optimizations: CostOptimization[] = [
        {
          id: '1',
          category: 'Compute',
          suggestion: 'Implement auto-scaling for tenant workloads during off-peak hours',
          potentialSaving: 12000,
          effort: 'medium',
          impact: 'high',
        },
        {
          id: '2',
          category: 'Storage',
          suggestion: 'Archive inactive tenant data older than 90 days to cold storage',
          potentialSaving: 8500,
          effort: 'low',
          impact: 'medium',
        },
        {
          id: '3',
          category: 'Database',
          suggestion: 'Optimize database queries and implement connection pooling',
          potentialSaving: 5000,
          effort: 'high',
          impact: 'medium',
        },
        {
          id: '4',
          category: 'Licensing',
          suggestion: 'Right-size tenant tier allocations based on actual usage',
          potentialSaving: 15000,
          effort: 'medium',
          impact: 'high',
        },
        {
          id: '5',
          category: 'API',
          suggestion: 'Implement caching layer for frequently accessed API endpoints',
          potentialSaving: 3500,
          effort: 'low',
          impact: 'low',
        },
      ];
      setCostOptimizations(optimizations);

    } catch (err) {
      setError(t('common.error'));
      console.error('Error fetching global advanced insights:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = async () => {
    setSuccess('');
    setError('');
    try {
      const blob = await insightsApi.exportGlobalTenantsOverview('xlsx');
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `global-insights-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setSuccess(t('global.insights.messages.reportExportedSuccessfully'));
    } catch (err) {
      setError(t('global.insights.messages.failedToExportReport'));
    }
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') {
      return (
        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      );
    } else if (trend === 'down') {
      return (
        <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      );
    }
    return (
      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
      </svg>
    );
  };

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'low': return 'bg-blue-100 text-blue-800';
      case 'medium': return 'bg-purple-100 text-purple-800';
      case 'high': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading && !platformMetrics.length) {
    return <div className="p-8">{t('common.loading')}</div>;
  }

  return (
    <div className="p-8">
      <Helmet>
        <title>{t('global.insights.advanced.title')}</title>
      </Helmet>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{t('global.insights.advanced.title')}</h1>
        <button
          onClick={handleExportReport}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          {t('global.insights.actions.exportReports')}
        </button>
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

      {/* Controls */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow">
        <div className="flex flex-wrap gap-4 items-center">
          <div>
            <label className="block text-sm font-medium mb-2">{t('global.insights.labels.dateRange')}</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 border rounded"
            >
              <option value="7">{t('global.insights.dateRange.last7Days')}</option>
              <option value="30">{t('global.insights.dateRange.last30Days')}</option>
              <option value="60">{t('global.insights.dateRange.last60Days')}</option>
              <option value="90">{t('global.insights.dateRange.last90Days')}</option>
              <option value="180">{t('global.insights.dateRange.last6Months')}</option>
              <option value="365">{t('global.insights.dateRange.lastYear')}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">{t('global.insights.labels.topTenants')}</label>
            <select
              value={topTenantsCount}
              onChange={(e) => setTopTenantsCount(parseInt(e.target.value))}
              className="px-3 py-2 border rounded"
            >
              <option value="5">{t('global.insights.topTenants.top5')}</option>
              <option value="10">{t('global.insights.topTenants.top10')}</option>
              <option value="20">{t('global.insights.topTenants.top20')}</option>
              <option value="50">{t('global.insights.topTenants.top50')}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">{t('global.insights.labels.sortBy')}</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border rounded"
            >
              <option value="users">{t('global.insights.sortBy.totalUsers')}</option>
              <option value="growth">{t('global.insights.sortBy.growthRate')}</option>
              <option value="revenue">{t('global.insights.sortBy.revenue')}</option>
              <option value="resources">{t('global.insights.sortBy.resourceUsage')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Platform Overview Metrics */}
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-4">{t('global.insights.labels.platformOverview')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {platformMetrics.map(metric => (
            <div key={metric.id} className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-sm font-medium text-gray-600">{metric.name}</h3>
                {getTrendIcon(metric.trend)}
              </div>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold text-gray-900">
                  {metric.value}{metric.unit || ''}
                </p>
              </div>
              <div className={`text-sm mt-2 ${metric.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {metric.change >= 0 ? '+' : ''}{metric.change}% {t('global.insights.labels.fromLastPeriod')}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Growth Trends */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-bold mb-4">{t('global.insights.labels.platformGrowthTrends')}</h2>
        <div className="space-y-6">
          {/* Tenants Growth */}
          <div>
            <h3 className="text-sm font-medium text-gray-600 mb-2">{t('global.insights.labels.tenantGrowth')}</h3>
            <div className="space-y-1">
              {growthTrends.filter((_, i) => i % 3 === 0).map((trend, index) => {
                const maxTenants = Math.max(...growthTrends.map(t => t.tenants));
                return (
                  <div key={index} className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 w-20">{new Date(trend.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    <div className="flex-1 bg-gray-100 rounded h-6">
                      <div
                        className="bg-indigo-600 h-6 rounded transition-all"
                        style={{ width: `${(trend.tenants / maxTenants) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium w-16 text-right">{trend.tenants}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Users Growth */}
          <div>
            <h3 className="text-sm font-medium text-gray-600 mb-2">{t('global.insights.labels.userGrowth')}</h3>
            <div className="space-y-1">
              {growthTrends.filter((_, i) => i % 3 === 0).map((trend, index) => {
                const maxUsers = Math.max(...growthTrends.map(t => t.users));
                return (
                  <div key={index} className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 w-20">{new Date(trend.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    <div className="flex-1 bg-gray-100 rounded h-6">
                      <div
                        className="bg-green-600 h-6 rounded transition-all"
                        style={{ width: `${(trend.users / maxUsers) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium w-20 text-right">{trend.users.toLocaleString()}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Tenant Comparison */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-bold mb-4">{t('global.insights.labels.tenantComparison')}</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('global.insights.labels.tenant')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('global.insights.labels.totalUsers')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('global.insights.labels.activeUsers')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('global.insights.labels.growthRate')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('global.insights.labels.revenueEst')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('global.insights.labels.resourceUsage')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {tenantComparisons.map(tenant => (
                <tr key={tenant.tenantId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {tenant.tenantName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {tenant.users.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {tenant.activeUsers.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={tenant.growth >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {tenant.growth >= 0 ? '+' : ''}{tenant.growth.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${tenant.revenue.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded h-2">
                        <div
                          className={`h-2 rounded ${tenant.resourceUsage > 80 ? 'bg-red-500' : tenant.resourceUsage > 60 ? 'bg-yellow-500' : 'bg-green-500'}`}
                          style={{ width: `${Math.min(tenant.resourceUsage, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-600 w-12">{tenant.resourceUsage.toFixed(0)}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Resource Utilization */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-bold mb-4">{t('global.insights.labels.resourceUtilization')}</h2>
        <div className="space-y-4">
          {resourceUtilization.map(resource => (
            <div key={resource.category}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">{resource.category}</span>
                <span className="text-sm text-gray-600">
                  {resource.used.toLocaleString()} / {resource.allocated.toLocaleString()} ({resource.percentage}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded h-3">
                <div
                  className={`h-3 rounded transition-all ${
                    resource.percentage > 85 ? 'bg-red-500' :
                    resource.percentage > 70 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${resource.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Geographical Distribution */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-bold mb-4">{t('global.insights.labels.geographicalDistribution')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-600 mb-3">{t('global.insights.labels.byRegion')}</h3>
            <div className="space-y-3">
              {geographicDist.map(geo => (
                <div key={`${geo.region}-${geo.country}`}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{geo.region} ({geo.country})</span>
                    <span className="font-medium">{geo.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded transition-all"
                      style={{ width: `${geo.percentage}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {geo.tenants} {t('global.insights.labels.tenants')}, {geo.users.toLocaleString()} {t('global.insights.labels.users')}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-600 mb-3">{t('global.insights.labels.distributionMap')}</h3>
            <div className="border rounded p-4 bg-gray-50 h-64 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm">{t('global.insights.labels.geoHeatMapVisualization')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Usage Forecasting */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-bold mb-4">{t('global.insights.labels.usageForecasting')}</h2>
        <div className="space-y-4">
          {forecasts.map(forecast => (
            <div key={forecast.metric} className="border rounded p-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-medium">{forecast.metric}</h3>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {forecast.confidence}% {t('global.insights.labels.confidence')}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-xs text-gray-500 mb-1">{t('global.insights.labels.current')}</div>
                  <div className="text-lg font-bold">{forecast.current.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">{t('global.insights.labels.30Days')}</div>
                  <div className="text-lg font-bold text-blue-600">{forecast.forecast30d.toLocaleString()}</div>
                  <div className="text-xs text-green-600">
                    +{((forecast.forecast30d / forecast.current - 1) * 100).toFixed(1)}%
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">{t('global.insights.labels.60Days')}</div>
                  <div className="text-lg font-bold text-blue-600">{forecast.forecast60d.toLocaleString()}</div>
                  <div className="text-xs text-green-600">
                    +{((forecast.forecast60d / forecast.current - 1) * 100).toFixed(1)}%
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">{t('global.insights.labels.90Days')}</div>
                  <div className="text-lg font-bold text-blue-600">{forecast.forecast90d.toLocaleString()}</div>
                  <div className="text-xs text-green-600">
                    +{((forecast.forecast90d / forecast.current - 1) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cost Optimization */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-bold mb-4">{t('global.insights.labels.costOptimizationSuggestions')}</h2>
        <div className="space-y-3">
          {costOptimizations.map(opt => (
            <div key={opt.id} className="border rounded p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium">{opt.category}</span>
                    <span className={`text-xs px-2 py-1 rounded ${getEffortColor(opt.effort)}`}>
                      {opt.effort} {t('global.insights.labels.effort')}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${getImpactColor(opt.impact)}`}>
                      {opt.impact} {t('global.insights.labels.impact')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{opt.suggestion}</p>
                </div>
                <div className="text-right ml-4">
                  <div className="text-lg font-bold text-green-600">
                    ${opt.potentialSaving.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">{t('global.insights.labels.potentialSaving')}</div>
                </div>
              </div>
            </div>
          ))}
          <div className="mt-4 pt-4 border-t">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">{t('global.insights.labels.totalPotentialSavings')}</span>
              <span className="text-2xl font-bold text-green-600">
                ${costOptimizations.reduce((sum, opt) => sum + opt.potentialSaving, 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Capacity Planning */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">{t('global.insights.labels.capacityPlanningInsights')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border rounded p-4">
            <h3 className="text-sm font-medium text-gray-600 mb-2">{t('global.insights.labels.estimatedTimeTo80Capacity')}</h3>
            <p className="text-2xl font-bold text-orange-600">45 {t('common.days')}</p>
            <p className="text-xs text-gray-500 mt-2">{t('global.insights.labels.basedOnCurrentGrowthRate')}</p>
          </div>
          <div className="border rounded p-4">
            <h3 className="text-sm font-medium text-gray-600 mb-2">{t('global.insights.labels.recommendedScaleUp')}</h3>
            <p className="text-2xl font-bold text-indigo-600">+25%</p>
            <p className="text-xs text-gray-500 mt-2">{t('global.insights.labels.toHandleProjectedQ1Growth')}</p>
          </div>
          <div className="border rounded p-4">
            <h3 className="text-sm font-medium text-gray-600 mb-2">{t('global.insights.labels.costImpact')}</h3>
            <p className="text-2xl font-bold text-green-600">$8,500/mo</p>
            <p className="text-xs text-gray-500 mt-2">{t('global.insights.labels.additionalInfrastructureCost')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
