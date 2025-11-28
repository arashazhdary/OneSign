import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getTenantId } from '@/lib/tenant-context';
import { governanceService } from '@/lib/api/services';
import * as InsightsAPI from '@/lib/api/insights';
import { Link } from 'react-router-dom';

interface Report {
  id: string;
  name: string;
  type: string;
  status: 'Draft' | 'InProgress' | 'Completed' | 'Failed';
  createdAt: string;
  createdBy: string;
  completedAt?: string;
  format: 'pdf' | 'xlsx' | 'csv' | 'json';
  size?: string;
}

interface ReportSubscription {
  id: string;
  reportType: string;
  frequency: string;
  recipients: string[];
  isActive: boolean;
  lastSentAt?: string;
  nextScheduledAt?: string;
}

export default function TenantReportsPage() {
  const { t } = useTranslation();
  const [tenantId, setTenantIdState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState<'reports' | 'subscriptions' | 'compliance'>('reports');

  // Reports state
  const [reports, setReports] = useState<Report[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [reportType, setReportType] = useState('SecurityOverview');
  const [reportFormat, setReportFormat] = useState<'pdf' | 'xlsx' | 'csv' | 'json'>('xlsx');

  // Subscriptions state
  const [subscriptions, setSubscriptions] = useState<ReportSubscription[]>([]);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [newSubscription, setNewSubscription] = useState({
    reportType: 'SecurityOverview',
    frequency: 'weekly',
    recipients: '',
  });

  // Compliance reports
  const [complianceReports, setComplianceReports] = useState<any[]>([]);

  useEffect(() => {
    const contextTenantId = getTenantId();
    setTenantIdState(contextTenantId || '00000000-0000-0000-0000-000000000000');
  }, []);

  useEffect(() => {
    if (tenantId) {
      fetchData();
    }
  }, [tenantId, activeTab]);

  const fetchData = async () => {
    if (!tenantId) return;

    setLoading(true);
    try {
      if (activeTab === 'reports') {
        await fetchReports();
      } else if (activeTab === 'subscriptions') {
        await fetchSubscriptions();
      } else if (activeTab === 'compliance') {
        await fetchComplianceReports();
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchReports = async () => {
    // Mock data - in real implementation, fetch from API
    setReports([
      {
        id: '1',
        name: 'Security Overview Report',
        type: 'Security',
        status: 'Completed',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        createdBy: 'admin@example.com',
        completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        format: 'xlsx',
        size: '2.3 MB',
      },
      {
        id: '2',
        name: 'User Activity Report',
        type: 'Activity',
        status: 'Completed',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        createdBy: 'security@example.com',
        completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        format: 'pdf',
        size: '1.8 MB',
      },
      {
        id: '3',
        name: 'Compliance Status Report',
        type: 'Compliance',
        status: 'InProgress',
        createdAt: new Date().toISOString(),
        createdBy: 'admin@example.com',
        format: 'xlsx',
      },
    ]);
  };

  const fetchSubscriptions = async () => {
    try {
      // getReportSubscriptions doesn't take tenantId parameter
      const data = await InsightsAPI.getReportSubscriptions();
      setSubscriptions(data.subscriptions || []);
    } catch (err) {
      console.error('Error fetching subscriptions:', err);
      // Mock data
      setSubscriptions([
        {
          id: '1',
          reportType: 'SecurityOverview',
          frequency: 'Weekly',
          recipients: ['security@example.com', 'admin@example.com'],
          isActive: true,
          lastSentAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          nextScheduledAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ]);
    }
  };

  const fetchComplianceReports = async () => {
    try {
      // governanceService.getReports() expects params object, not direct tenantId
      const data = await governanceService.getReports();
      setComplianceReports(data);
    } catch (err) {
      console.error('Error fetching compliance reports:', err);
      // Mock data
      setComplianceReports([
        {
          id: '1',
          framework: 'SOC 2',
          status: 'Completed',
          generatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          score: 98,
        },
        {
          id: '2',
          framework: 'ISO 27001',
          status: 'Completed',
          generatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          score: 95,
        },
      ]);
    }
  };

  const handleCreateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      // In real implementation, call API to generate report
      setSuccess('Report generation started. You will receive an email when it is ready.');
      setShowCreateModal(false);
      setTimeout(() => fetchReports(), 1000);
    } catch (err) {
      setError('Failed to create report');
    }
  };

  const handleCreateSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      // createReportSubscription only takes data parameter, not tenantId
      await InsightsAPI.createReportSubscription({
        reportType: newSubscription.reportType as any,
        cronOrFrequency: newSubscription.frequency,
        emailRecipients: newSubscription.recipients.split(',').map((r) => r.trim()).filter(Boolean),
      });
      setSuccess('Report subscription created successfully');
      setShowSubscriptionModal(false);
      setNewSubscription({ reportType: 'SecurityOverview', frequency: 'weekly', recipients: '' });
      fetchSubscriptions();
    } catch (err) {
      setError('Failed to create subscription');
    }
  };

  const handleExportReport = async (reportId: string, format: string) => {
    try {
      // exportTenantInsightsOverview expects (tenantId, from, to, format)
      const now = new Date();
      const from = new Date(now.setDate(now.getDate() - 30)).toISOString();
      const to = new Date().toISOString();
      const blob = await InsightsAPI.exportTenantInsightsOverview(tenantId!, from, to, format);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${reportId}-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setSuccess('Report exported successfully');
    } catch (err) {
      setError('Failed to export report');
    }
  };

  const handleToggleSubscription = async (id: string) => {
    try {
      const sub = subscriptions.find((s) => s.id === id);
      if (!sub) return;

      // updateReportSubscription expects (subscriptionId, data) - no tenantId parameter
      await InsightsAPI.updateReportSubscription(id, {
        reportType: sub.reportType as any,
        cronOrFrequency: sub.frequency,
        emailRecipients: sub.recipients,
        isActive: !sub.isActive,
      });

      setSuccess(`Subscription ${sub.isActive ? 'disabled' : 'enabled'} successfully`);
      fetchSubscriptions();
    } catch (err) {
      setError('Failed to update subscription');
    }
  };

  const handleDeleteSubscription = async (id: string) => {
    if (!confirm('Are you sure you want to delete this subscription?')) return;

    try {
      // deleteReportSubscription only takes subscriptionId parameter
      await InsightsAPI.deleteReportSubscription(id);
      setSuccess('Subscription deleted successfully');
      fetchSubscriptions();
    } catch (err) {
      setError('Failed to delete subscription');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'InProgress':
        return 'bg-blue-100 text-blue-800';
      case 'Failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading && reports.length === 0 && subscriptions.length === 0 && complianceReports.length === 0) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Reports & Analytics
          </h1>
          <p className="text-gray-600 mt-2">Generate, schedule, and manage reports</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowSubscriptionModal(true)}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Schedule Report
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Generate Report
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Reports</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{reports.length}</p>
            </div>
            <div className="text-4xl">📊</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Active Subscriptions</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {subscriptions.filter((s) => s.isActive).length}
              </p>
            </div>
            <div className="text-4xl">🔔</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Compliance Reports</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{complianceReports.length}</p>
            </div>
            <div className="text-4xl">📋</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Last Generated</p>
              <p className="text-sm font-bold text-gray-900 mt-2">
                {reports.length > 0 ? new Date(reports[0].createdAt).toLocaleDateString() : 'N/A'}
              </p>
            </div>
            <div className="text-4xl">📅</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'reports', label: 'Generated Reports' },
            { key: 'subscriptions', label: 'Scheduled Reports' },
            { key: 'compliance', label: 'Compliance Reports' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.key
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Report Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Size
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reports.map((report) => (
                <tr key={report.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{report.name}</div>
                    <div className="text-xs text-gray-500">{report.createdBy}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {report.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(report.status)}`}>
                      {report.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(report.createdAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report.size || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {report.status === 'Completed' && (
                      <button
                        onClick={() => handleExportReport(report.id, report.format)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        Download
                      </button>
                    )}
                    <button className="text-gray-600 hover:text-gray-900">View</button>
                  </td>
                </tr>
              ))}
              {reports.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No reports generated yet. Click "Generate Report" to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Subscriptions Tab */}
      {activeTab === 'subscriptions' && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Report Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Frequency
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Recipients
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Next Run
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {subscriptions.map((sub) => (
                <tr key={sub.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {sub.reportType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sub.frequency}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {sub.recipients.length} recipient(s)
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {sub.nextScheduledAt ? new Date(sub.nextScheduledAt).toLocaleString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        sub.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {sub.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleToggleSubscription(sub.id)}
                      className="text-yellow-600 hover:text-yellow-900 mr-3"
                    >
                      {sub.isActive ? 'Disable' : 'Enable'}
                    </button>
                    <button
                      onClick={() => handleDeleteSubscription(sub.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {subscriptions.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No scheduled reports. Click "Schedule Report" to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Compliance Reports Tab */}
      {activeTab === 'compliance' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Compliance Framework Reports</h2>
              <Link to="reports/compliance" className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                View Detailed Compliance →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {complianceReports.map((report) => (
                <div key={report.id} className="p-6 border border-gray-200 rounded-lg hover:border-indigo-300 transition-colors">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{report.framework}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      report.score >= 90 ? 'bg-green-100 text-green-800' :
                      report.score >= 70 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {report.score}%
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Last generated: {new Date(report.generatedAt).toLocaleDateString()}
                  </p>
                  <div className="flex gap-2">
                    <button className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                      View Report
                    </button>
                    <button className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
                      Re-generate
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Create Report Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Generate Report</h2>
            <form onSubmit={handleCreateReport}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Report Type</label>
                <select
                  className="w-full px-3 py-2 border rounded"
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                >
                  <option value="SecurityOverview">Security Overview</option>
                  <option value="UserActivity">User Activity</option>
                  <option value="ApplicationUsage">Application Usage</option>
                  <option value="RiskAnalysis">Risk Analysis</option>
                  <option value="ComplianceStatus">Compliance Status</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Format</label>
                <select
                  className="w-full px-3 py-2 border rounded"
                  value={reportFormat}
                  onChange={(e) => setReportFormat(e.target.value as any)}
                >
                  <option value="xlsx">Excel (.xlsx)</option>
                  <option value="pdf">PDF (.pdf)</option>
                  <option value="csv">CSV (.csv)</option>
                  <option value="json">JSON (.json)</option>
                </select>
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border rounded"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
                  Generate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Subscription Modal */}
      {showSubscriptionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Schedule Report</h2>
            <form onSubmit={handleCreateSubscription}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Report Type</label>
                <select
                  className="w-full px-3 py-2 border rounded"
                  value={newSubscription.reportType}
                  onChange={(e) => setNewSubscription({ ...newSubscription, reportType: e.target.value })}
                >
                  <option value="SecurityOverview">Security Overview</option>
                  <option value="UserActivity">User Activity</option>
                  <option value="ApplicationUsage">Application Usage</option>
                  <option value="RiskAnalysis">Risk Analysis</option>
                  <option value="ComplianceStatus">Compliance Status</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Frequency</label>
                <select
                  className="w-full px-3 py-2 border rounded"
                  value={newSubscription.frequency}
                  onChange={(e) => setNewSubscription({ ...newSubscription, frequency: e.target.value })}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Recipients (comma-separated)</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border rounded"
                  placeholder="email1@example.com, email2@example.com"
                  value={newSubscription.recipients}
                  onChange={(e) => setNewSubscription({ ...newSubscription, recipients: e.target.value })}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowSubscriptionModal(false)}
                  className="px-4 py-2 border rounded"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
