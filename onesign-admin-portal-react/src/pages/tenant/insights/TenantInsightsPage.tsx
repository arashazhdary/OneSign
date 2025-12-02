import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getTenantId } from '@/lib/tenant-context';
import * as InsightsAPI from '@/lib/api/insights';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Shield,
  FileText,
  Users,
  Activity,
  Lock,
  TrendingUp,
  AlertTriangle,
  Download,
  Plus,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  X,
  CheckCircle,
  Mail,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  BarChart3,
  UserCheck,
} from 'lucide-react';

type Tab = 'dashboard' | 'security-posture' | 'reports';

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
  cronOrFrequency?: string;
  emailRecipients?: string[];
}

interface DashboardStats {
  totalUsers: number;
  activeUsersLast30Days: number;
  mfaAdoptionRate: number;
  averageLoginRate: number;
  riskEventsThisWeek: number;
  highRiskUsers: number;
}

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  delay: number;
}

const StatCard = ({ title, value, icon, color, delay }: StatCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: delay * 0.1 }}
    className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300"
  >
    <div className="flex items-center gap-4">
      <div className={`p-3 rounded-xl ${color}`}>{icon}</div>
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  </motion.div>
);

export default function TenantInsightsPage() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language;
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

    const data = await InsightsAPI.getTenantInsightsOverview(tenantId);
    setDashboardStats({
      totalUsers: data.totalUsers,
      activeUsersLast30Days: data.activeUsers,
      mfaAdoptionRate: data.mfaAdoptionPercent,
      averageLoginRate: Math.round(data.totalSignIns / 30),
      riskEventsThisWeek: data.highRiskEvents,
      highRiskUsers: data.highRiskEvents,
    });

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

    const data = await InsightsAPI.getUserSecurityPosture(tenantId);

    setUserPostures((data as any).users || []);
    setPostureTotalCount((data as any).totalCount || 0);
  };

  const fetchReportSubscriptions = async () => {
    if (!tenantId) return;

    const data = await InsightsAPI.getReportSubscriptions(tenantId);
    setReportSubscriptions((data as any).subscriptions || []);
  };

  const handleCreateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!tenantId) return;

    try {
      await InsightsAPI.createReportSubscription(tenantId, {
        name: newReport.name,
        reportType: newReport.reportType as any,
        frequency: newReport.frequency,
        recipients: newReport.recipients.split(',').map(r => r.trim()).filter(Boolean),
        isActive: newReport.isActive,
      } as any);

      setSuccess(t('tenant.insights.reportCreated', 'Report subscription created successfully'));
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
        name: editingReport.name,
        reportType: editingReport.reportType as any,
        frequency: editingReport.frequency,
        recipients: editingReport.recipients,
        isActive: editingReport.isActive,
      } as any);

      setSuccess(t('tenant.insights.reportUpdated', 'Report subscription updated successfully'));
      setEditingReport(null);
      fetchReportSubscriptions();
    } catch (err) {
      setError(t('common.error'));
    }
  };

  const handleDeleteReport = async (id: string) => {
    if (!confirm(t('tenant.insights.confirmDeleteReport', 'Are you sure you want to delete this report subscription?'))) return;
    if (!tenantId) return;
    setError('');
    setSuccess('');

    try {
      await InsightsAPI.deleteReportSubscription(tenantId, id);
      setSuccess(t('tenant.insights.reportDeleted', 'Report subscription deleted successfully'));
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
        name: report.name,
        reportType: report.reportType as any,
        frequency: report.frequency,
        recipients: report.recipients,
        isActive: !report.isActive,
      } as any);

      setSuccess(
        report.isActive
          ? t('tenant.insights.reportDisabled', 'Report subscription disabled successfully')
          : t('tenant.insights.reportEnabled', 'Report subscription enabled successfully')
      );
      fetchReportSubscriptions();
    } catch (err) {
      setError(t('common.error'));
    }
  };

  const handleExportOverview = async () => {
    if (!tenantId) return;
    try {
      const blob = await InsightsAPI.exportTenantInsightsOverview(tenantId, 'xlsx');
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `insights-overview-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setSuccess(t('tenant.insights.overviewExported', 'Overview exported successfully'));
    } catch (err) {
      setError(t('common.error'));
    }
  };

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
      setSuccess(t('tenant.insights.usersExported', 'User security posture exported successfully'));
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

  const getRiskLevelStyles = (level: string) => {
    switch (level) {
      case 'Critical':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'High':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default:
        return 'bg-green-100 text-green-700 border-green-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString(locale === 'fa' ? 'fa-IR' : 'en-US');
  };

  const totalPages = Math.ceil(postureTotalCount / pageSize);

  const tabs = [
    { id: 'dashboard', label: t('tenant.insights.dashboard', 'Dashboard'), icon: LayoutDashboard },
    { id: 'security-posture', label: t('tenant.insights.securityPosture', 'User Security Posture'), icon: Shield },
    { id: 'reports', label: t('tenant.insights.reports', 'Reports'), icon: FileText },
  ];

  if (loading && !dashboardStats.totalUsers && !userPostures.length && !reportSubscriptions.length) {
    return (
      <div dir={locale === 'fa' ? 'rtl' : 'ltr'} className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-3 text-gray-600"
        >
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span>{t('common.loading', 'Loading...')}</span>
        </motion.div>
      </div>
    );
  }

  return (
    <div dir={locale === 'fa' ? 'rtl' : 'ltr'} className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8">
      <Helmet>
        <title>{t('tenant.insights.title', 'Insights')} | OneSign</title>
      </Helmet>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            {t('tenant.insights.title', 'Insights')}
          </h1>
          <p className="text-gray-600 mt-1">
            {t('tenant.insights.subtitle', 'Monitor security metrics and generate reports')}
          </p>
        </div>
        <div className="flex gap-3">
          {activeTab === 'dashboard' && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleExportOverview}
              className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2.5 rounded-xl hover:shadow-lg transition-all"
            >
              <Download className="w-5 h-5" />
              {t('tenant.insights.exportOverview', 'Export Overview')}
            </motion.button>
          )}
          {activeTab === 'security-posture' && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleExportUsers}
              className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2.5 rounded-xl hover:shadow-lg transition-all"
            >
              <Download className="w-5 h-5" />
              {t('tenant.insights.exportUsers', 'Export Users')}
            </motion.button>
          )}
          {activeTab === 'reports' && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowCreateReportModal(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2.5 rounded-xl hover:shadow-lg transition-all"
            >
              <Plus className="w-5 h-5" />
              {t('tenant.insights.createReport', 'Create Report')}
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* Alerts */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2"
          >
            <AlertTriangle className="w-5 h-5" />
            {error}
            <button onClick={() => setError('')} className="ms-auto">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-center gap-2"
          >
            <CheckCircle className="w-5 h-5" />
            {success}
            <button onClick={() => setSuccess('')} className="ms-auto">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-2 mb-6"
      >
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as Tab);
                setPosturePageNumber(1);
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Dashboard Tab */}
      <AnimatePresence mode="wait">
        {activeTab === 'dashboard' && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <StatCard
                title={t('tenant.insights.totalUsers', 'Total Users')}
                value={dashboardStats.totalUsers}
                icon={<Users className="w-6 h-6 text-blue-600" />}
                color="bg-blue-100"
                delay={0}
              />
              <StatCard
                title={t('tenant.insights.activeUsers', 'Active Users (30 days)')}
                value={dashboardStats.activeUsersLast30Days}
                icon={<UserCheck className="w-6 h-6 text-green-600" />}
                color="bg-green-100"
                delay={1}
              />
              <StatCard
                title={t('tenant.insights.mfaRate', 'MFA Adoption Rate')}
                value={`${dashboardStats.mfaAdoptionRate}%`}
                icon={<Lock className="w-6 h-6 text-indigo-600" />}
                color="bg-indigo-100"
                delay={2}
              />
              <StatCard
                title={t('tenant.insights.avgLogins', 'Avg Daily Logins')}
                value={dashboardStats.averageLoginRate}
                icon={<Activity className="w-6 h-6 text-purple-600" />}
                color="bg-purple-100"
                delay={3}
              />
              <StatCard
                title={t('tenant.insights.riskEvents', 'Risk Events (Week)')}
                value={dashboardStats.riskEventsThisWeek}
                icon={<AlertTriangle className="w-6 h-6 text-orange-600" />}
                color="bg-orange-100"
                delay={4}
              />
              <StatCard
                title={t('tenant.insights.highRiskUsers', 'High Risk Users')}
                value={dashboardStats.highRiskUsers}
                icon={<Shield className="w-6 h-6 text-red-600" />}
                color="bg-red-100"
                delay={5}
              />
            </div>

            {/* Usage Trend Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {t('tenant.insights.usageTrend', 'Usage Trend (Last 30 Days)')}
                </h3>
              </div>
              {usageSnapshots.length > 0 ? (
                <div className="space-y-3">
                  {usageSnapshots.slice(-7).map((snapshot, index) => (
                    <motion.div
                      key={snapshot.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center gap-4"
                    >
                      <span className="text-sm text-gray-500 w-24">
                        {new Date(snapshot.snapshotDate).toLocaleDateString(locale === 'fa' ? 'fa-IR' : 'en-US')}
                      </span>
                      <div className="flex-1 bg-gray-100 rounded-lg h-8 relative overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{
                            width: `${Math.min(
                              (snapshot.totalLogins / Math.max(...usageSnapshots.map((s) => s.totalLogins || 1))) * 100,
                              100
                            )}%`,
                          }}
                          transition={{ duration: 0.5, delay: index * 0.05 }}
                          className="bg-gradient-to-r from-blue-500 to-indigo-600 h-8 rounded-lg"
                        />
                      </div>
                      <span className="text-sm font-medium w-20 text-end text-gray-700">{snapshot.totalLogins} {t('tenant.insights.logins', 'logins')}</span>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">{t('tenant.insights.noUsageData', 'No usage data available')}</p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}

        {/* Security Posture Tab */}
        {activeTab === 'security-posture' && (
          <motion.div
            key="security-posture"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 overflow-hidden"
            >
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                      <th
                        className="px-6 py-4 text-start text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
                        onClick={() => handleSort('email')}
                      >
                        <div className="flex items-center gap-2">
                          {t('tenant.insights.user', 'User')}
                          <ArrowUpDown className="w-4 h-4" />
                          {postureSortBy === 'email' && (postureSortDesc ? '↓' : '↑')}
                        </div>
                      </th>
                      <th
                        className="px-6 py-4 text-start text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
                        onClick={() => handleSort('mfaEnabled')}
                      >
                        <div className="flex items-center gap-2">
                          {t('tenant.insights.mfaStatus', 'MFA Status')}
                          <ArrowUpDown className="w-4 h-4" />
                          {postureSortBy === 'mfaEnabled' && (postureSortDesc ? '↓' : '↑')}
                        </div>
                      </th>
                      <th
                        className="px-6 py-4 text-start text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
                        onClick={() => handleSort('lastLoginAt')}
                      >
                        <div className="flex items-center gap-2">
                          {t('tenant.insights.lastLogin', 'Last Login')}
                          <ArrowUpDown className="w-4 h-4" />
                          {postureSortBy === 'lastLoginAt' && (postureSortDesc ? '↓' : '↑')}
                        </div>
                      </th>
                      <th
                        className="px-6 py-4 text-start text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
                        onClick={() => handleSort('riskLevel')}
                      >
                        <div className="flex items-center gap-2">
                          {t('tenant.insights.riskLevel', 'Risk Level')}
                          <ArrowUpDown className="w-4 h-4" />
                          {postureSortBy === 'riskLevel' && (postureSortDesc ? '↓' : '↑')}
                        </div>
                      </th>
                      <th
                        className="px-6 py-4 text-start text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
                        onClick={() => handleSort('riskEvents')}
                      >
                        <div className="flex items-center gap-2">
                          {t('tenant.insights.riskEventsCol', 'Risk Events')}
                          <ArrowUpDown className="w-4 h-4" />
                          {postureSortBy === 'riskEvents' && (postureSortDesc ? '↓' : '↑')}
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {userPostures.map((posture, index) => (
                      <motion.tr
                        key={posture.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.03 }}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                              {posture.email.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-medium text-gray-900">{posture.email}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {posture.mfaEnabled ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
                              <Lock className="w-3 h-3" />
                              {posture.mfaMethod || t('common.enabled', 'Enabled')}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                              {t('tenant.insights.notEnabled', 'Not Enabled')}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {posture.lastLoginAt
                            ? formatDate(posture.lastLoginAt)
                            : t('common.never', 'Never')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getRiskLevelStyles(posture.riskLevel)}`}>
                            {posture.riskLevel}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {posture.riskEvents}
                          {posture.lastRiskEvent && (
                            <span className="text-xs text-gray-400 ms-2">
                              ({t('common.last', 'Last')}: {new Date(posture.lastRiskEvent).toLocaleDateString(locale === 'fa' ? 'fa-IR' : 'en-US')})
                            </span>
                          )}
                        </td>
                      </motion.tr>
                    ))}
                    {userPostures.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center">
                          <Shield className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-500">{t('tenant.insights.noPostureData', 'No user security posture data available')}</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
                  <p className="text-sm text-gray-500">
                    {t('tenant.insights.showing', 'Showing')} {(posturePageNumber - 1) * pageSize + 1} {t('common.to', 'to')}{' '}
                    {Math.min(posturePageNumber * pageSize, postureTotalCount)} {t('common.of', 'of')} {postureTotalCount} {t('tenant.insights.users', 'users')}
                  </p>
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setPosturePageNumber(Math.max(1, posturePageNumber - 1))}
                      disabled={posturePageNumber === 1}
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      {t('common.previous', 'Previous')}
                    </motion.button>
                    <span className="px-4 py-2 text-sm text-gray-700">
                      {t('common.page', 'Page')} {posturePageNumber} {t('common.of', 'of')} {totalPages}
                    </span>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setPosturePageNumber(Math.min(totalPages, posturePageNumber + 1))}
                      disabled={posturePageNumber === totalPages}
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      {t('common.next', 'Next')}
                      <ChevronRight className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <motion.div
            key="reports"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-start text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      {t('common.name', 'Name')}
                    </th>
                    <th className="px-6 py-4 text-start text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      {t('common.type', 'Type')}
                    </th>
                    <th className="px-6 py-4 text-start text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      {t('tenant.insights.frequency', 'Frequency')}
                    </th>
                    <th className="px-6 py-4 text-start text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      {t('tenant.insights.recipients', 'Recipients')}
                    </th>
                    <th className="px-6 py-4 text-start text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      {t('common.status', 'Status')}
                    </th>
                    <th className="px-6 py-4 text-start text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      {t('common.actions', 'Actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {reportSubscriptions.map((report, index) => (
                    <motion.tr
                      key={report.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.03 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-indigo-100 rounded-lg">
                            <FileText className="w-4 h-4 text-indigo-600" />
                          </div>
                          <span className="font-medium text-gray-900">{report.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {report.reportType}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm">
                          <Calendar className="w-3 h-3" />
                          {report.frequency}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg text-sm">
                          <Mail className="w-3 h-3" />
                          {report.recipients.length} {t('tenant.insights.recipientsCount', 'recipient(s)')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                            report.isActive
                              ? 'bg-green-100 text-green-700 border-green-200'
                              : 'bg-gray-100 text-gray-600 border-gray-200'
                          }`}
                        >
                          {report.isActive ? t('common.active', 'Active') : t('common.inactive', 'Inactive')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setEditingReport(report)}
                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title={t('common.edit', 'Edit')}
                          >
                            <Edit className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleToggleReportStatus(report)}
                            className={`p-2 rounded-lg transition-colors ${
                              report.isActive
                                ? 'text-yellow-600 hover:bg-yellow-50'
                                : 'text-green-600 hover:bg-green-50'
                            }`}
                            title={report.isActive ? t('common.disable', 'Disable') : t('common.enable', 'Enable')}
                          >
                            {report.isActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleDeleteReport(report.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title={t('common.delete', 'Delete')}
                          >
                            <Trash2 className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                  {reportSubscriptions.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">{t('tenant.insights.noReports', 'No report subscriptions. Click "Create Report" to add one.')}</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Report Modal */}
      <AnimatePresence>
        {showCreateReportModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowCreateReportModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-xl">
                      <FileText className="w-6 h-6" />
                    </div>
                    <h2 className="text-xl font-bold">{t('tenant.insights.createReport', 'Create Report Subscription')}</h2>
                  </div>
                  <button
                    onClick={() => setShowCreateReportModal(false)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <form onSubmit={handleCreateReport} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('common.name', 'Name')}</label>
                  <input
                    type="text"
                    required
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    value={newReport.name}
                    onChange={(e) => setNewReport({ ...newReport, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('tenant.insights.reportType', 'Report Type')}</label>
                  <select
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    value={newReport.reportType}
                    onChange={(e) => setNewReport({ ...newReport, reportType: e.target.value })}
                  >
                    <option value="SecuritySummary">{t('tenant.insights.securitySummary', 'Security Summary')}</option>
                    <option value="UserActivity">{t('tenant.insights.userActivity', 'User Activity')}</option>
                    <option value="RiskEvents">{t('tenant.insights.riskEventsType', 'Risk Events')}</option>
                    <option value="MFAStatus">{t('tenant.insights.mfaStatusType', 'MFA Status')}</option>
                    <option value="LoginAnalytics">{t('tenant.insights.loginAnalytics', 'Login Analytics')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('tenant.insights.frequency', 'Frequency')}</label>
                  <select
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    value={newReport.frequency}
                    onChange={(e) => setNewReport({ ...newReport, frequency: e.target.value })}
                  >
                    <option value="Daily">{t('common.daily', 'Daily')}</option>
                    <option value="Weekly">{t('common.weekly', 'Weekly')}</option>
                    <option value="Monthly">{t('common.monthly', 'Monthly')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('tenant.insights.recipientsLabel', 'Recipients (comma-separated emails)')}
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="admin@example.com, security@example.com"
                    value={newReport.recipients}
                    onChange={(e) => setNewReport({ ...newReport, recipients: e.target.value })}
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={newReport.isActive}
                      onChange={(e) => setNewReport({ ...newReport, isActive: e.target.checked })}
                    />
                    <span className="text-sm font-medium text-gray-700">{t('common.active', 'Active')}</span>
                  </label>
                </div>
                <div className="flex gap-3 pt-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => setShowCreateReportModal(false)}
                    className="px-5 py-2.5 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors"
                  >
                    {t('common.cancel', 'Cancel')}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl hover:shadow-lg transition-all"
                  >
                    <CheckCircle className="w-4 h-4" />
                    {t('common.create', 'Create')}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Report Modal */}
      <AnimatePresence>
        {editingReport && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setEditingReport(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-xl">
                      <Edit className="w-6 h-6" />
                    </div>
                    <h2 className="text-xl font-bold">{t('tenant.insights.editReport', 'Edit Report Subscription')}</h2>
                  </div>
                  <button
                    onClick={() => setEditingReport(null)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <form onSubmit={handleUpdateReport} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('common.name', 'Name')}</label>
                  <input
                    type="text"
                    required
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    value={editingReport.name}
                    onChange={(e) => setEditingReport({ ...editingReport, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('tenant.insights.reportType', 'Report Type')}</label>
                  <select
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    value={editingReport.reportType}
                    onChange={(e) => setEditingReport({ ...editingReport, reportType: e.target.value })}
                  >
                    <option value="SecuritySummary">{t('tenant.insights.securitySummary', 'Security Summary')}</option>
                    <option value="UserActivity">{t('tenant.insights.userActivity', 'User Activity')}</option>
                    <option value="RiskEvents">{t('tenant.insights.riskEventsType', 'Risk Events')}</option>
                    <option value="MFAStatus">{t('tenant.insights.mfaStatusType', 'MFA Status')}</option>
                    <option value="LoginAnalytics">{t('tenant.insights.loginAnalytics', 'Login Analytics')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('tenant.insights.frequency', 'Frequency')}</label>
                  <select
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    value={editingReport.frequency}
                    onChange={(e) => setEditingReport({ ...editingReport, frequency: e.target.value })}
                  >
                    <option value="Daily">{t('common.daily', 'Daily')}</option>
                    <option value="Weekly">{t('common.weekly', 'Weekly')}</option>
                    <option value="Monthly">{t('common.monthly', 'Monthly')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('tenant.insights.recipientsLabel', 'Recipients (comma-separated emails)')}
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    value={editingReport.recipients.join(', ')}
                    onChange={(e) =>
                      setEditingReport({
                        ...editingReport,
                        recipients: e.target.value.split(',').map((r) => r.trim()).filter(Boolean),
                      })
                    }
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={editingReport.isActive}
                      onChange={(e) => setEditingReport({ ...editingReport, isActive: e.target.checked })}
                    />
                    <span className="text-sm font-medium text-gray-700">{t('common.active', 'Active')}</span>
                  </label>
                </div>
                <div className="flex gap-3 pt-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => setEditingReport(null)}
                    className="px-5 py-2.5 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors"
                  >
                    {t('common.cancel', 'Cancel')}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl hover:shadow-lg transition-all"
                  >
                    <CheckCircle className="w-4 h-4" />
                    {t('common.save', 'Save')}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
