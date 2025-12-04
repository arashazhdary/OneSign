import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import * as insightsApi from '@/lib/api/insights';
import { Helmet } from 'react-helmet-async';

type Tab = 'platform-overview' | 'high-risk-users' | 'risky-tenants' | 'system-health' | 'report-subscriptions';

interface PlatformOverviewStats {
  totalTenants: number;
  activeTenants: number;
  totalUsers: number;
  totalApplications: number;
  totalLoginsToday: number;
  totalRiskEventsThisWeek: number;
  averageMfaAdoptionRate: number;
  systemUptime: number;
}

interface TenantUsageStats {
  tenantId: string;
  tenantName: string;
  userCount: number;
  activeUsers: number;
  mfaAdoptionRate: number;
  riskEventsThisMonth: number;
}

interface HighRiskUser {
  id: string;
  tenantId: string;
  tenantName: string;
  userId: string;
  email: string;
  riskLevel: 'High' | 'Critical';
  riskScore: number;
  riskFactors: string[];
  lastRiskEvent: string | null;
  accountStatus: string;
}

interface SystemHealthMetric {
  id: string;
  serviceName: string;
  status: 'Healthy' | 'Degraded' | 'Unhealthy';
  responseTimeMs: number;
  uptime: number;
  lastChecked: string;
  errorCount: number;
  details: string;
}

interface SystemAlert {
  id: string;
  severity: 'Info' | 'Warning' | 'Critical';
  message: string;
  source: string;
  timestamp: string;
  acknowledged: boolean;
}

interface RiskyTenant {
  tenantId: string;
  tenantName: string;
  riskScore: number;
  riskLevel: 'High' | 'Critical';
  issues: string[];
  lastAssessed: string;
}

interface ReportSubscription {
  id: string;
  name: string;
  reportType: string;
  frequency: 'Daily' | 'Weekly' | 'Monthly';
  recipients: string[];
  isActive: boolean;
  createdAt: string;
}

export default function GlobalInsightsPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<Tab>('platform-overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Platform Overview state
  const [platformStats, setPlatformStats] = useState<PlatformOverviewStats>({
    totalTenants: 0,
    activeTenants: 0,
    totalUsers: 0,
    totalApplications: 0,
    totalLoginsToday: 0,
    totalRiskEventsThisWeek: 0,
    averageMfaAdoptionRate: 0,
    systemUptime: 0,
  });
  const [tenantUsageStats, setTenantUsageStats] = useState<TenantUsageStats[]>([]);

  // High Risk Users state
  const [highRiskUsers, setHighRiskUsers] = useState<HighRiskUser[]>([]);
  const [riskPageNumber, setRiskPageNumber] = useState(1);
  const [riskTotalCount, setRiskTotalCount] = useState(0);
  const [riskSortBy, setRiskSortBy] = useState('riskScore');
  const [riskSortDesc, setRiskSortDesc] = useState(true);
  const [riskLevelFilter, setRiskLevelFilter] = useState<'all' | 'High' | 'Critical'>('all');
  const pageSize = 10;

  // System Health state
  const [healthMetrics, setHealthMetrics] = useState<SystemHealthMetric[]>([]);
  const [systemAlerts, setSystemAlerts] = useState<SystemAlert[]>([]);

  // Risky Tenants state
  const [riskyTenants, setRiskyTenants] = useState<RiskyTenant[]>([]);

  // Report Subscriptions state
  const [reportSubscriptions, setReportSubscriptions] = useState<ReportSubscription[]>([]);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<ReportSubscription | null>(null);
  const [subscriptionForm, setSubscriptionForm] = useState({
    name: '',
    reportType: 'Platform Overview',
    frequency: 'Weekly' as 'Daily' | 'Weekly' | 'Monthly',
    recipients: [] as string[],
    isActive: true,
  });

  useEffect(() => {
    fetchData();
  }, [activeTab, riskPageNumber, riskSortBy, riskSortDesc, riskLevelFilter]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      switch (activeTab) {
        case 'platform-overview':
          await fetchPlatformOverview();
          break;
        case 'high-risk-users':
          await fetchHighRiskUsers();
          break;
        case 'system-health':
          await fetchSystemHealth();
          break;
      }
    } catch (err) {
      setError(t('common.error'));
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlatformOverview = async () => {
    // Fetch platform stats
    const data = await insightsApi.getGlobalPlatformOverview();
    setPlatformStats(data);

    // Fetch tenant usage breakdown
    const tenantData = await insightsApi.getGlobalTenantUsage();
    setTenantUsageStats(tenantData.items || []);
  };

  const fetchHighRiskUsers = async () => {
    const data = await insightsApi.getGlobalHighRiskUsers();
    setHighRiskUsers(data.items || data || []);
    setRiskTotalCount(data.totalCount || (Array.isArray(data) ? data.length : 0));
  };

  const fetchSystemHealth = async () => {
    // Fetch health metrics
    const healthData = await insightsApi.getGlobalSystemHealth();
    setHealthMetrics(healthData.services || []);

    // Fetch system alerts
    const alertsData = await insightsApi.getGlobalSystemAlerts();
    setSystemAlerts(alertsData.items || alertsData || []);
  };

  const handleAcknowledgeAlert = async (alertId: string) => {
    setError('');
    setSuccess('');

    try {
      await insightsApi.acknowledgeGlobalSystemAlert(alertId);
      setSuccess(t('global.insights.messages.alertAcknowledged'));
      fetchSystemHealth();
    } catch (err) {
      setError(t('common.error'));
    }
  };

  const handleRiskSort = (column: string) => {
    if (riskSortBy === column) {
      setRiskSortDesc(!riskSortDesc);
    } else {
      setRiskSortBy(column);
      setRiskSortDesc(true);
    }
    setRiskPageNumber(1);
  };

  const fetchTenantsOverview = async () => {
    try {
      const data = await insightsApi.getGlobalTenantsOverview();
      return data;
    } catch (err) {
      console.error('Error fetching tenants overview:', err);
    }
  };

  const fetchRiskyTenants = async () => {
    try {
      const data = await insightsApi.getRiskyTenants();
      setRiskyTenants(data.tenants || data.items || []);
    } catch (err) {
      console.error('Error fetching risky tenants:', err);
    }
  };

  const handleExportTenants = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const blob = await insightsApi.exportGlobalTenantsOverview('xlsx');
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tenants-export-${new Date().toISOString()}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setSuccess(t('global.insights.messages.tenantsExportedSuccessfully'));
    } catch (err) {
      setError(t('global.insights.messages.failedToExportTenants'));
    } finally {
      setLoading(false);
    }
  };

  const fetchReportSubscriptions = async () => {
    try {
      const data = await insightsApi.getGlobalReportSubscriptions();
      setReportSubscriptions(data.subscriptions || data.items || []);
    } catch (err) {
      console.error('Error fetching report subscriptions:', err);
    }
  };

  const handleCreateSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const payload = {
        reportType: subscriptionForm.reportType as any,
        cronOrFrequency: subscriptionForm.frequency,
        emailRecipients: subscriptionForm.recipients,
        isActive: subscriptionForm.isActive,
      };

      if (editingSubscription) {
        await insightsApi.updateGlobalReportSubscription(editingSubscription.id, payload);
        setSuccess(t('global.insights.messages.subscriptionUpdatedSuccessfully'));
      } else {
        await insightsApi.createGlobalReportSubscription(payload);
        setSuccess(t('global.insights.messages.subscriptionCreatedSuccessfully'));
      }

      setShowSubscriptionModal(false);
      setEditingSubscription(null);
      setSubscriptionForm({
        name: '',
        reportType: 'Platform Overview',
        frequency: 'Weekly',
        recipients: [],
        isActive: true,
      });
      fetchReportSubscriptions();
    } catch (err) {
      setError(t('global.insights.messages.failedToSaveSubscription'));
    }
  };

  const handleDeleteSubscription = async (id: string) => {
    if (!confirm(t('global.insights.messages.confirmDeleteSubscription'))) return;
    try {
      await insightsApi.deleteGlobalReportSubscription(id);
      setSuccess(t('global.insights.messages.subscriptionDeletedSuccessfully'));
      fetchReportSubscriptions();
    } catch (err) {
      setError(t('global.insights.messages.failedToDeleteSubscription'));
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'Critical':
        return 'bg-red-100 text-red-800';
      case 'High':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'Healthy':
        return 'bg-green-100 text-green-800';
      case 'Degraded':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-red-100 text-red-800';
    }
  };

  const getAlertSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const totalPages = Math.ceil(riskTotalCount / pageSize);

  if (loading && !platformStats.totalTenants && !highRiskUsers.length && !healthMetrics.length) {
    return <div className="p-8">{t('common.loading')}</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{t('global.insights.title')}</h1>
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

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {(['platform-overview', 'high-risk-users', 'risky-tenants', 'system-health', 'report-subscriptions'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setRiskPageNumber(1);
                if (tab === 'risky-tenants') fetchRiskyTenants();
                if (tab === 'report-subscriptions') fetchReportSubscriptions();
              }}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === tab
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab === 'platform-overview'
                ? t('global.insights.tabs.platformOverview')
                : tab === 'high-risk-users'
                ? t('global.insights.tabs.highRiskUsers')
                : tab === 'risky-tenants'
                ? t('global.insights.tabs.riskyTenants')
                : tab === 'report-subscriptions'
                ? t('global.insights.tabs.reportSubscriptions')
                : t('global.insights.tabs.systemHealth')}
            </button>
          ))}
        </nav>
      </div>

      {/* Platform Overview Tab */}
      {activeTab === 'platform-overview' && (
        <div>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">{t('global.insights.labels.totalTenants')}</h3>
              <p className="text-3xl font-bold text-indigo-600">{platformStats.totalTenants}</p>
              <p className="text-sm text-gray-500">{platformStats.activeTenants} {t('global.insights.labels.active')}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">{t('global.insights.labels.totalUsers')}</h3>
              <p className="text-3xl font-bold text-indigo-600">{platformStats.totalUsers}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">{t('global.insights.labels.applications')}</h3>
              <p className="text-3xl font-bold text-indigo-600">{platformStats.totalApplications}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">{t('global.insights.labels.loginsToday')}</h3>
              <p className="text-3xl font-bold text-indigo-600">{platformStats.totalLoginsToday}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">{t('global.insights.labels.avgMfaAdoption')}</h3>
              <p className="text-3xl font-bold text-indigo-600">{platformStats.averageMfaAdoptionRate}%</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">{t('global.insights.labels.riskEventsWeek')}</h3>
              <p className="text-3xl font-bold text-orange-600">{platformStats.totalRiskEventsThisWeek}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow col-span-2">
              <h3 className="text-lg font-semibold mb-2">{t('global.insights.labels.systemUptime')}</h3>
              <p className="text-3xl font-bold text-green-600">{platformStats.systemUptime}%</p>
            </div>
          </div>

          {/* Tenant Usage Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold">{t('global.insights.labels.tenantUsageBreakdown')}</h3>
            </div>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {t('global.insights.labels.tenant')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {t('global.insights.labels.users')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {t('global.insights.labels.activeUsers')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {t('global.insights.labels.mfaAdoption')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {t('global.insights.labels.riskEventsMonth')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tenantUsageStats.map((tenant) => (
                  <tr key={tenant.tenantId}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {tenant.tenantName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {tenant.userCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {tenant.activeUsers}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {tenant.mfaAdoptionRate}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {tenant.riskEventsThisMonth}
                    </td>
                  </tr>
                ))}
                {tenantUsageStats.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                      {t('global.insights.messages.noTenantUsageData')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* High Risk Users Tab */}
      {activeTab === 'high-risk-users' && (
        <div>
          {/* Filter */}
          <div className="mb-4">
            <label className="text-sm font-medium mr-2">{t('global.insights.labels.filterByRiskLevel')}:</label>
            <select
              value={riskLevelFilter}
              onChange={(e) => {
                setRiskLevelFilter(e.target.value as 'all' | 'High' | 'Critical');
                setRiskPageNumber(1);
              }}
              className="px-3 py-2 border rounded"
            >
              <option value="all">{t('common.all')}</option>
              <option value="High">{t('common.high')}</option>
              <option value="Critical">{t('common.critical')}</option>
            </select>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                    onClick={() => handleRiskSort('email')}
                  >
                    {t('global.insights.labels.user')} {riskSortBy === 'email' && (riskSortDesc ? '↓' : '↑')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {t('global.insights.labels.tenant')}
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                    onClick={() => handleRiskSort('riskLevel')}
                  >
                    {t('global.insights.labels.riskLevel')} {riskSortBy === 'riskLevel' && (riskSortDesc ? '↓' : '↑')}
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                    onClick={() => handleRiskSort('riskScore')}
                  >
                    {t('global.insights.labels.riskScore')} {riskSortBy === 'riskScore' && (riskSortDesc ? '↓' : '↑')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {t('global.insights.labels.riskFactors')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {t('global.insights.labels.accountStatus')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {highRiskUsers.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.tenantName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded text-xs ${getRiskLevelColor(user.riskLevel)}`}>
                        {user.riskLevel}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.riskScore}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="flex flex-wrap gap-1">
                        {user.riskFactors.slice(0, 3).map((factor, index) => (
                          <span
                            key={index}
                            className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs"
                          >
                            {factor}
                          </span>
                        ))}
                        {user.riskFactors.length > 3 && (
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
                            +{user.riskFactors.length - 3} {t('common.more')}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.accountStatus}
                    </td>
                  </tr>
                ))}
                {highRiskUsers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                      {t('global.insights.messages.noHighRiskUsers')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                {t('common.showing')} {(riskPageNumber - 1) * pageSize + 1} {t('common.to')}{' '}
                {Math.min(riskPageNumber * pageSize, riskTotalCount)} {t('common.of')} {riskTotalCount} {t('global.insights.labels.users')}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setRiskPageNumber(Math.max(1, riskPageNumber - 1))}
                  disabled={riskPageNumber === 1}
                  className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-50"
                >
                  {t('common.previous')}
                </button>
                <span className="px-3 py-1">
                  {t('common.page')} {riskPageNumber} {t('common.of')} {totalPages}
                </span>
                <button
                  onClick={() => setRiskPageNumber(Math.min(totalPages, riskPageNumber + 1))}
                  disabled={riskPageNumber === totalPages}
                  className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-50"
                >
                  {t('common.next')}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* System Health Tab */}
      {activeTab === 'system-health' && (
        <div>
          {/* System Alerts */}
          {systemAlerts.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">{t('global.insights.labels.activeAlerts')}</h3>
              <div className="space-y-3">
                {systemAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-4 rounded-lg border ${getAlertSeverityColor(alert.severity)}`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-medium">{alert.severity}</span>
                        <span className="mx-2">|</span>
                        <span className="text-sm">{alert.source}</span>
                        <p className="mt-1">{alert.message}</p>
                        <p className="text-xs mt-1 opacity-75">
                          {new Date(alert.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <button
                        onClick={() => handleAcknowledgeAlert(alert.id)}
                        className="text-sm px-3 py-1 bg-white rounded border hover:bg-gray-50"
                      >
                        {t('global.insights.actions.acknowledge')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Health Metrics */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold">{t('global.insights.labels.serviceHealth')}</h3>
            </div>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {t('global.insights.labels.service')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {t('common.status')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {t('global.insights.labels.responseTime')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {t('global.insights.labels.uptime')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {t('global.insights.labels.errors24h')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {t('global.insights.labels.lastChecked')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {healthMetrics.map((metric) => (
                  <tr key={metric.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{metric.serviceName}</div>
                      {metric.details && (
                        <div className="text-xs text-gray-500">{metric.details}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 rounded text-xs ${getHealthStatusColor(metric.status)}`}
                      >
                        {metric.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {metric.responseTimeMs}ms
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {metric.uptime}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={
                          metric.errorCount > 0 ? 'text-red-600 font-medium' : 'text-gray-500'
                        }
                      >
                        {metric.errorCount}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(metric.lastChecked).toLocaleString()}
                    </td>
                  </tr>
                ))}
                {healthMetrics.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                      {t('global.insights.messages.noHealthMetrics')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Risky Tenants Tab */}
      {activeTab === 'risky-tenants' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold">{t('global.insights.labels.riskyTenants')}</h3>
            <button
              onClick={handleExportTenants}
              disabled={loading}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
            >
              {t('global.insights.actions.exportToExcel')}
            </button>
          </div>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  {t('global.insights.labels.tenant')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  {t('global.insights.labels.riskLevel')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  {t('global.insights.labels.riskScore')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  {t('global.insights.labels.issues')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  {t('global.insights.labels.lastAssessed')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {riskyTenants.map((tenant) => (
                <tr key={tenant.tenantId}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {tenant.tenantName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded text-xs ${getRiskLevelColor(tenant.riskLevel)}`}>
                      {tenant.riskLevel}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {tenant.riskScore}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <div className="flex flex-wrap gap-1">
                      {tenant.issues.slice(0, 3).map((issue, index) => (
                        <span
                          key={index}
                          className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs"
                        >
                          {issue}
                        </span>
                      ))}
                      {tenant.issues.length > 3 && (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
                          +{tenant.issues.length - 3} {t('common.more')}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(tenant.lastAssessed).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {riskyTenants.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    {t('global.insights.messages.noRiskyTenants')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Report Subscriptions Tab */}
      {activeTab === 'report-subscriptions' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold">{t('global.insights.labels.reportSubscriptions')}</h3>
            <button
              onClick={() => {
                setEditingSubscription(null);
                setSubscriptionForm({
                  name: '',
                  reportType: 'Platform Overview',
                  frequency: 'Weekly',
                  recipients: [],
                  isActive: true,
                });
                setShowSubscriptionModal(true);
              }}
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
            >
              {t('global.insights.actions.createSubscription')}
            </button>
          </div>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('common.name')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('global.insights.labels.reportType')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('global.insights.labels.frequency')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('global.insights.labels.recipients')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('common.status')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reportSubscriptions.map((subscription) => (
                <tr key={subscription.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {subscription.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {subscription.reportType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
                      {subscription.frequency}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {subscription.recipients.length} {t('global.insights.labels.recipientCount')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded text-xs ${subscription.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {subscription.isActive ? t('common.active') : t('common.inactive')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingSubscription(subscription);
                          setSubscriptionForm({
                            name: subscription.name,
                            reportType: subscription.reportType,
                            frequency: subscription.frequency,
                            recipients: subscription.recipients,
                            isActive: subscription.isActive,
                          });
                          setShowSubscriptionModal(true);
                        }}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        {t('common.edit')}
                      </button>
                      <button
                        onClick={() => handleDeleteSubscription(subscription.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        {t('common.delete')}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {reportSubscriptions.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    {t('global.insights.messages.noReportSubscriptions')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Report Subscription Modal */}
      {showSubscriptionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingSubscription ? t('global.insights.labels.editReportSubscription') : t('global.insights.labels.createReportSubscription')}
            </h2>
            <form onSubmit={handleCreateSubscription}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">{t('common.name')}</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border rounded"
                  value={subscriptionForm.name}
                  onChange={(e) => setSubscriptionForm({ ...subscriptionForm, name: e.target.value })}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">{t('global.insights.labels.reportType')}</label>
                <select
                  className="w-full px-3 py-2 border rounded"
                  value={subscriptionForm.reportType}
                  onChange={(e) => setSubscriptionForm({ ...subscriptionForm, reportType: e.target.value })}
                >
                  <option value="Platform Overview">{t('global.insights.reportTypes.platformOverview')}</option>
                  <option value="High Risk Users">{t('global.insights.reportTypes.highRiskUsers')}</option>
                  <option value="Risky Tenants">{t('global.insights.reportTypes.riskyTenants')}</option>
                  <option value="System Health">{t('global.insights.reportTypes.systemHealth')}</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">{t('global.insights.labels.frequency')}</label>
                <select
                  className="w-full px-3 py-2 border rounded"
                  value={subscriptionForm.frequency}
                  onChange={(e) => setSubscriptionForm({ ...subscriptionForm, frequency: e.target.value as 'Daily' | 'Weekly' | 'Monthly' })}
                >
                  <option value="Daily">{t('common.daily')}</option>
                  <option value="Weekly">{t('common.weekly')}</option>
                  <option value="Monthly">{t('common.monthly')}</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">{t('global.insights.labels.recipientsHelp')}</label>
                <textarea
                  required
                  className="w-full px-3 py-2 border rounded"
                  rows={4}
                  value={subscriptionForm.recipients.join('\n')}
                  onChange={(e) => setSubscriptionForm({ ...subscriptionForm, recipients: e.target.value.split('\n').filter(email => email.trim()) })}
                  placeholder="admin@example.com"
                />
              </div>
              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={subscriptionForm.isActive}
                    onChange={(e) => setSubscriptionForm({ ...subscriptionForm, isActive: e.target.checked })}
                  />
                  {t('common.active')}
                </label>
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowSubscriptionModal(false);
                    setEditingSubscription(null);
                  }}
                  className="px-4 py-2 border rounded"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                >
                  {editingSubscription ? t('common.update') : t('common.create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
