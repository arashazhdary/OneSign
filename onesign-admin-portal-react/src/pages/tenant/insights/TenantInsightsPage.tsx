import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getTenantId } from '@/lib/tenant-context';
import * as InsightsAPI from '@/lib/api/insights';
import { Helmet } from 'react-helmet-async';

type Tab = 'dashboard' | 'security-posture' | 'reports';
type UserSecurityPosture = InsightsAPI.UserSecurityPostureDto;
type ReportSubscription = InsightsAPI.ReportSubscriptionDto;

interface UsageSnapshot {
  id: string;
  snapshotDate: string;
  totalUsers: number;
  activeUsers: number;
  mfaEnabledUsers: number;
  totalApplications: number;
  totalLogins: number;
  failedLogins: number;
}

interface UserSecurityPosture {
  id: string;
  userId: string;
  email: string;
  mfaEnabled: boolean;
  mfaMethod: string | null;
  lastLoginAt: string | null;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  riskEvents: number;
  lastRiskEvent: string | null;
}

interface ReportSubscription {
  id: string;
  name: string;
  reportType: string;
  frequency: string;
  recipients: string[];
  isActive: boolean;
  lastSentAt: string | null;
  nextScheduledAt: string | null;
}

interface DashboardStats {
  totalUsers: number;
  activeUsersLast30Days: number;
  mfaAdoptionRate: number;
  averageLoginRate: number;
  riskEventsThisWeek: number;
  highRiskUsers: number;
}

export default function TenantInsightsPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [tenantId, setTenantIdState] = useState<string | null>(null);

  // Dashboard state
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsersLast30Days: 0,
    mfaAdoptionRate: 0,
    averageLoginRate: 0,
    riskEventsThisWeek: 0,
    highRiskUsers: 0,
  });
  const [usageSnapshots, setUsageSnapshots] = useState<UsageSnapshot[]>([]);

  // Security posture state
  const [userPostures, setUserPostures] = useState<UserSecurityPosture[]>([]);
  const [posturePageNumber, setPosturePageNumber] = useState(1);
  const [postureTotalCount, setPostureTotalCount] = useState(0);
  const [postureSortBy, setPostureSortBy] = useState('riskLevel');
  const [postureSortDesc, setPostureSortDesc] = useState(true);
  const pageSize = 10;

  // Reports state
  const [reportSubscriptions, setReportSubscriptions] = useState<ReportSubscription[]>([]);
  const [showCreateReportModal, setShowCreateReportModal] = useState(false);
  const [editingReport, setEditingReport] = useState<ReportSubscription | null>(null);
  const [newReport, setNewReport] = useState({
    name: '',
    reportType: 'SecuritySummary',
    frequency: 'Weekly',
    recipients: '',
    isActive: true,
  });

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
      fetchData();
    }
  }, [tenantId, activeTab, posturePageNumber, postureSortBy, postureSortDesc]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      switch (activeTab) {
        case 'dashboard':
          await fetchDashboardData();
          break;
        case 'security-posture':
          await fetchSecurityPosture();
          break;
        case 'reports':
          await fetchReportSubscriptions();
          break;
      }
    } catch (err) {
      setError(t('common.error'));
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardData = async () => {
    if (!tenantId) return;

    // Fetch insights overview
    const now = new Date();
    const from = new Date(now.setDate(now.getDate() - 30)).toISOString();
    const to = new Date().toISOString();

    const data = await InsightsAPI.getTenantInsightsOverview(tenantId, from, to);
    setDashboardStats({
      totalUsers: data.totalUsers,
      activeUsersLast30Days: data.activeUsers,
      mfaAdoptionRate: data.mfaAdoptionPercent,
      averageLoginRate: data.totalSignIns / 30,
      riskEventsThisWeek: data.highRiskEvents,
      highRiskUsers: data.highRiskEvents, // approximate
    });

    // Set usage snapshots from trend data
    setUsageSnapshots(data.signInTrend.map(trend => ({
      id: trend.date,
      snapshotDate: trend.date,
      totalUsers: data.totalUsers,
      activeUsers: data.activeUsers,
      mfaEnabledUsers: Math.floor(data.totalUsers * data.mfaAdoptionPercent / 100),
      totalApplications: data.topApplications.length,
      totalLogins: trend.count,
      failedLogins: trend.failureCount,
    })));
  };

  const fetchSecurityPosture = async () => {
    if (!tenantId) return;

    const data = await InsightsAPI.getUserSecurityPosture(tenantId, {
      sortBy: postureSortBy,
      page: posturePageNumber,
      pageSize,
    });

    setUserPostures(data.users || []);
    setPostureTotalCount(data.totalCount || 0);
  };

  const fetchReportSubscriptions = async () => {
    if (!tenantId) return;

    const data = await InsightsAPI.getReportSubscriptions(tenantId);
    setReportSubscriptions(data.subscriptions || []);
  };

  const handleCreateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!tenantId) return;

    try {
      await InsightsAPI.createReportSubscription(tenantId, {
        reportType: newReport.reportType as InsightsAPI.ReportType,
        cronOrFrequency: newReport.frequency,
        emailRecipients: newReport.recipients.split(',').map((r) => r.trim()).filter(Boolean),
      });

      setSuccess('Report subscription created successfully');
      setShowCreateReportModal(false);
      setNewReport({
        name: '',
        reportType: 'SecuritySummary',
        frequency: 'Weekly',
        recipients: '',
        isActive: true,
      });
      fetchReportSubscriptions();
    } catch (err) {
      setError(t('common.error'));
    }
  };

  const handleUpdateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReport || !tenantId) return;
    setError('');
    setSuccess('');

    try {
      await InsightsAPI.updateReportSubscription(tenantId, editingReport.id, {
        reportType: editingReport.reportType as InsightsAPI.ReportType,
        cronOrFrequency: editingReport.frequency,
        emailRecipients: editingReport.recipients,
        isActive: editingReport.isActive,
      });

      setSuccess('Report subscription updated successfully');
      setEditingReport(null);
      fetchReportSubscriptions();
    } catch (err) {
      setError(t('common.error'));
    }
  };

  const handleDeleteReport = async (id: string) => {
    if (!confirm('Are you sure you want to delete this report subscription?')) return;
    if (!tenantId) return;
    setError('');
    setSuccess('');

    try {
      await InsightsAPI.deleteReportSubscription(tenantId, id);
      setSuccess('Report subscription deleted successfully');
      fetchReportSubscriptions();
    } catch (err) {
      setError(t('common.error'));
    }
  };

  const handleToggleReportStatus = async (report: ReportSubscription) => {
    if (!tenantId) return;
    setError('');
    setSuccess('');

    try {
      await InsightsAPI.updateReportSubscription(tenantId, report.id, {
        reportType: report.reportType as InsightsAPI.ReportType,
        cronOrFrequency: report.cronOrFrequency,
        emailRecipients: report.emailRecipients,
        isActive: !report.isActive,
      });

      setSuccess(`Report subscription ${report.isActive ? 'disabled' : 'enabled'} successfully`);
      fetchReportSubscriptions();
    } catch (err) {
      setError(t('common.error'));
    }
  };

  // Export overview using InsightsAPI
  const handleExportOverview = async () => {
    if (!tenantId) return;
    try {
      const now = new Date();
      const from = new Date(now.setDate(now.getDate() - 30)).toISOString();
      const to = new Date().toISOString();

      const blob = await InsightsAPI.exportTenantInsightsOverview(tenantId, from, to, 'xlsx');
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `insights-overview-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setSuccess('Overview exported successfully');
    } catch (err) {
      setError(t('common.error'));
    }
  };

  // Export users using InsightsAPI
  const handleExportUsers = async () => {
    if (!tenantId) return;
    try {
      const blob = await InsightsAPI.exportUserSecurityPosture(tenantId, 'xlsx');
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `user-security-posture-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setSuccess('User security posture exported successfully');
    } catch (err) {
      setError(t('common.error'));
    }
  };

  const handleSort = (column: string) => {
    if (postureSortBy === column) {
      setPostureSortDesc(!postureSortDesc);
    } else {
      setPostureSortBy(column);
      setPostureSortDesc(true);
    }
    setPosturePageNumber(1);
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'Critical':
        return 'bg-red-100 text-red-800';
      case 'High':
        return 'bg-orange-100 text-orange-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  const totalPages = Math.ceil(postureTotalCount / pageSize);

  if (loading && !dashboardStats.totalUsers && !userPostures.length && !reportSubscriptions.length) {
    return <div className="p-8">{t('common.loading')}</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Insights</h1>
        <div className="flex gap-2">
          {activeTab === 'dashboard' && (
            <button
              onClick={handleExportOverview}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export Overview
            </button>
          )}
          {activeTab === 'security-posture' && (
            <button
              onClick={handleExportUsers}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export Users
            </button>
          )}
          {activeTab === 'reports' && (
            <button
              onClick={() => setShowCreateReportModal(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
            >
              Create Report Subscription
            </button>
          )}
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

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {(['dashboard', 'security-posture', 'reports'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setPosturePageNumber(1);
              }}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab === 'dashboard'
                ? 'Dashboard'
                : tab === 'security-posture'
                ? 'User Security Posture'
                : 'Reports'}
            </button>
          ))}
        </nav>
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">Total Users</h3>
              <p className="text-3xl font-bold text-indigo-600">{dashboardStats.totalUsers}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">Active Users (30 days)</h3>
              <p className="text-3xl font-bold text-indigo-600">{dashboardStats.activeUsersLast30Days}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">MFA Adoption Rate</h3>
              <p className="text-3xl font-bold text-indigo-600">{dashboardStats.mfaAdoptionRate}%</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">Avg Daily Logins</h3>
              <p className="text-3xl font-bold text-indigo-600">{dashboardStats.averageLoginRate}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">Risk Events (This Week)</h3>
              <p className="text-3xl font-bold text-orange-600">{dashboardStats.riskEventsThisWeek}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">High Risk Users</h3>
              <p className="text-3xl font-bold text-red-600">{dashboardStats.highRiskUsers}</p>
            </div>
          </div>

          {/* Usage Trend Chart (simplified bar representation) */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Usage Trend (Last 30 Days)</h3>
            {usageSnapshots.length > 0 ? (
              <div className="space-y-3">
                {usageSnapshots.slice(-7).map((snapshot) => (
                  <div key={snapshot.id} className="flex items-center gap-4">
                    <span className="text-sm text-gray-500 w-24">
                      {new Date(snapshot.snapshotDate).toLocaleDateString()}
                    </span>
                    <div className="flex-1 bg-gray-100 rounded h-6 relative">
                      <div
                        className="bg-indigo-600 h-6 rounded"
                        style={{
                          width: `${Math.min(
                            (snapshot.totalLogins / Math.max(...usageSnapshots.map((s) => s.totalLogins || 1))) * 100,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium w-16 text-right">{snapshot.totalLogins} logins</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No usage data available</p>
            )}
          </div>
        </div>
      )}

      {/* Security Posture Tab */}
      {activeTab === 'security-posture' && (
        <div>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('email')}
                  >
                    User {postureSortBy === 'email' && (postureSortDesc ? '↓' : '↑')}
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('mfaEnabled')}
                  >
                    MFA Status {postureSortBy === 'mfaEnabled' && (postureSortDesc ? '↓' : '↑')}
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('lastLoginAt')}
                  >
                    Last Login {postureSortBy === 'lastLoginAt' && (postureSortDesc ? '↓' : '↑')}
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('riskLevel')}
                  >
                    Risk Level {postureSortBy === 'riskLevel' && (postureSortDesc ? '↓' : '↑')}
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('riskEvents')}
                  >
                    Risk Events {postureSortBy === 'riskEvents' && (postureSortDesc ? '↓' : '↑')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {userPostures.map((posture) => (
                  <tr key={posture.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {posture.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {posture.mfaEnabled ? (
                        <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-800">
                          {posture.mfaMethod || t('common.enabled')}
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-800">
                          Not Enabled
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {posture.lastLoginAt
                        ? new Date(posture.lastLoginAt).toLocaleString()
                        : 'Never'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded text-xs ${getRiskLevelColor(posture.riskLevel)}`}>
                        {posture.riskLevel}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {posture.riskEvents}
                      {posture.lastRiskEvent && (
                        <span className="text-xs text-gray-400 ml-2">
                          (Last: {new Date(posture.lastRiskEvent).toLocaleDateString()})
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                {userPostures.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                      No user security posture data available
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
                Showing {(posturePageNumber - 1) * pageSize + 1} to{' '}
                {Math.min(posturePageNumber * pageSize, postureTotalCount)} of {postureTotalCount} users
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPosturePageNumber(Math.max(1, posturePageNumber - 1))}
                  disabled={posturePageNumber === 1}
                  className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-50"
                >
                  Previous
                </button>
                <span className="px-3 py-1">
                  Page {posturePageNumber} of {totalPages}
                </span>
                <button
                  onClick={() => setPosturePageNumber(Math.min(totalPages, posturePageNumber + 1))}
                  disabled={posturePageNumber === totalPages}
                  className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Frequency
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Recipients
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reportSubscriptions.map((report) => (
                <tr key={report.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {report.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {report.reportType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {report.frequency}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {report.recipients.length} recipient(s)
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        report.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {report.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingReport(report)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleToggleReportStatus(report)}
                        className="text-yellow-600 hover:text-yellow-900"
                      >
                        {report.isActive ? 'Disable' : 'Enable'}
                      </button>
                      <button
                        onClick={() => handleDeleteReport(report.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {reportSubscriptions.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    No report subscriptions. Click "Create Report Subscription" to add one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Report Modal */}
      {showCreateReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Create Report Subscription</h2>
            <form onSubmit={handleCreateReport}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Name</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border rounded"
                  value={newReport.name}
                  onChange={(e) => setNewReport({ ...newReport, name: e.target.value })}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Report Type</label>
                <select
                  className="w-full px-3 py-2 border rounded"
                  value={newReport.reportType}
                  onChange={(e) => setNewReport({ ...newReport, reportType: e.target.value })}
                >
                  <option value="SecuritySummary">Security Summary</option>
                  <option value="UserActivity">User Activity</option>
                  <option value="RiskEvents">Risk Events</option>
                  <option value="MFAStatus">MFA Status</option>
                  <option value="LoginAnalytics">Login Analytics</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Frequency</label>
                <select
                  className="w-full px-3 py-2 border rounded"
                  value={newReport.frequency}
                  onChange={(e) => setNewReport({ ...newReport, frequency: e.target.value })}
                >
                  <option value="Daily">Daily</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Monthly">Monthly</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Recipients (comma-separated emails)</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border rounded"
                  placeholder="admin@example.com, security@example.com"
                  value={newReport.recipients}
                  onChange={(e) => setNewReport({ ...newReport, recipients: e.target.value })}
                />
              </div>
              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={newReport.isActive}
                    onChange={(e) => setNewReport({ ...newReport, isActive: e.target.checked })}
                  />
                  Active
                </label>
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowCreateReportModal(false)}
                  className="px-4 py-2 border rounded"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                >
                  {t('common.create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Report Modal */}
      {editingReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Edit Report Subscription</h2>
            <form onSubmit={handleUpdateReport}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Name</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border rounded"
                  value={editingReport.name}
                  onChange={(e) => setEditingReport({ ...editingReport, name: e.target.value })}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Report Type</label>
                <select
                  className="w-full px-3 py-2 border rounded"
                  value={editingReport.reportType}
                  onChange={(e) => setEditingReport({ ...editingReport, reportType: e.target.value })}
                >
                  <option value="SecuritySummary">Security Summary</option>
                  <option value="UserActivity">User Activity</option>
                  <option value="RiskEvents">Risk Events</option>
                  <option value="MFAStatus">MFA Status</option>
                  <option value="LoginAnalytics">Login Analytics</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Frequency</label>
                <select
                  className="w-full px-3 py-2 border rounded"
                  value={editingReport.frequency}
                  onChange={(e) => setEditingReport({ ...editingReport, frequency: e.target.value })}
                >
                  <option value="Daily">Daily</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Monthly">Monthly</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Recipients (comma-separated emails)</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border rounded"
                  value={editingReport.recipients.join(', ')}
                  onChange={(e) =>
                    setEditingReport({
                      ...editingReport,
                      recipients: e.target.value.split(',').map((r) => r.trim()).filter(Boolean),
                    })
                  }
                />
              </div>
              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={editingReport.isActive}
                    onChange={(e) => setEditingReport({ ...editingReport, isActive: e.target.checked })}
                  />
                  Active
                </label>
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setEditingReport(null)}
                  className="px-4 py-2 border rounded"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                >
                  {t('common.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
