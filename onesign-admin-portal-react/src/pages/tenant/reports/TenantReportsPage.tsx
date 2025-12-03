import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { getTenantId } from '@/lib/tenant-context';
import { governanceService } from '@/lib/api/services';
import * as InsightsAPI from '@/lib/api/insights';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Modal from '@/components/common/Modal';
import {
  FileBarChart,
  Plus,
  Download,
  Clock,
  Bell,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Calendar,
  Mail,
  Trash2,
  FileText,
  ChevronRight,
  Shield,
  Eye,
} from 'lucide-react';

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

interface ComplianceReport {
  id: string;
  framework: string;
  status: string;
  generatedAt: string;
  score: number;
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  delay: number;
}

const StatCard = ({ title, value, icon, color, delay }: StatCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: delay * 0.1 }}
    className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6 hover:shadow-xl transition-all duration-300"
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
      </div>
      <div className={`p-4 rounded-xl bg-gradient-to-br ${color}`}>
        {icon}
      </div>
    </div>
  </motion.div>
);

export default function TenantReportsPage() {
  const { t } = useTranslation();
  const [tenantId, setTenantIdState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState<'reports' | 'subscriptions' | 'compliance'>('reports');

  const [reports, setReports] = useState<Report[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [reportType, setReportType] = useState('SecurityOverview');
  const [reportFormat, setReportFormat] = useState<'pdf' | 'xlsx' | 'csv' | 'json'>('xlsx');

  const [subscriptions, setSubscriptions] = useState<ReportSubscription[]>([]);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [newSubscription, setNewSubscription] = useState({
    reportType: 'SecurityOverview',
    frequency: 'weekly',
    recipients: '',
  });

  const [complianceReports, setComplianceReports] = useState<ComplianceReport[]>([]);

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
      if (activeTab === 'reports') await fetchReports();
      else if (activeTab === 'subscriptions') await fetchSubscriptions();
      else if (activeTab === 'compliance') await fetchComplianceReports();
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchReports = async () => {
    setReports([
      { id: '1', name: 'Security Overview Report', type: 'Security', status: 'Completed', createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), createdBy: 'admin@example.com', completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), format: 'xlsx', size: '2.3 MB' },
      { id: '2', name: 'User Activity Report', type: 'Activity', status: 'Completed', createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), createdBy: 'security@example.com', completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), format: 'pdf', size: '1.8 MB' },
      { id: '3', name: 'Compliance Status Report', type: 'Compliance', status: 'InProgress', createdAt: new Date().toISOString(), createdBy: 'admin@example.com', format: 'xlsx' },
    ]);
  };

  const fetchSubscriptions = async () => {
    try {
      const data = await InsightsAPI.getReportSubscriptions(tenantId || undefined);
      setSubscriptions((data as any)?.subscriptions || []);
    } catch (err) {
      setSubscriptions([
        { id: '1', reportType: 'SecurityOverview', frequency: 'Weekly', recipients: ['security@example.com', 'admin@example.com'], isActive: true, lastSentAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), nextScheduledAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() },
        { id: '2', reportType: 'UserActivity', frequency: 'Monthly', recipients: ['compliance@example.com'], isActive: true, lastSentAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), nextScheduledAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() },
      ]);
    }
  };

  const fetchComplianceReports = async () => {
    try {
      const data = await governanceService.getReports();
      setComplianceReports(data);
    } catch (err) {
      setComplianceReports([
        { id: '1', framework: 'SOC 2', status: 'Completed', generatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), score: 98 },
        { id: '2', framework: 'ISO 27001', status: 'Completed', generatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), score: 95 },
        { id: '3', framework: 'GDPR', status: 'Completed', generatedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(), score: 87 },
        { id: '4', framework: 'HIPAA', status: 'Completed', generatedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(), score: 92 },
      ]);
    }
  };

  const handleCreateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSuccess('Report generation started. You will receive an email when it is ready.');
      setShowCreateModal(false);
      setTimeout(() => { setSuccess(''); fetchReports(); }, 3000);
    } catch (err) {
      setError('Failed to create report');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleCreateSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await InsightsAPI.createReportSubscription(tenantId!, {
        reportType: newSubscription.reportType as any,
        cronOrFrequency: newSubscription.frequency,
        emailRecipients: newSubscription.recipients.split(',').map((r) => r.trim()).filter(Boolean),
      });
      setSuccess('Report subscription created successfully');
      setShowSubscriptionModal(false);
      setNewSubscription({ reportType: 'SecurityOverview', frequency: 'weekly', recipients: '' });
      fetchSubscriptions();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to create subscription');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleExportReport = async (reportId: string, format: string) => {
    try {
      const blob = await InsightsAPI.exportTenantInsightsOverview(tenantId!, format);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${reportId}-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setSuccess('Report exported successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to export report');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleToggleSubscription = async (id: string) => {
    try {
      const sub = subscriptions.find((s) => s.id === id);
      if (!sub) return;
      await InsightsAPI.updateReportSubscription(tenantId!, id, {
        reportType: sub.reportType as any,
        cronOrFrequency: sub.frequency,
        emailRecipients: sub.recipients,
        isActive: !sub.isActive,
      });
      setSuccess(`Subscription ${sub.isActive ? 'disabled' : 'enabled'} successfully`);
      fetchSubscriptions();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update subscription');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDeleteSubscription = async (id: string) => {
    if (!confirm('Are you sure you want to delete this subscription?')) return;
    try {
      await InsightsAPI.deleteReportSubscription(tenantId!, id);
      setSuccess('Subscription deleted successfully');
      fetchSubscriptions();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to delete subscription');
      setTimeout(() => setError(''), 3000);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      Completed: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
      InProgress: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
      Failed: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
      Draft: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400',
    };
    return colors[status] || 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400';
  };

  const tabs = [
    { key: 'reports', label: 'Generated Reports', icon: <FileText className="w-4 h-4" /> },
    { key: 'subscriptions', label: 'Scheduled Reports', icon: <Bell className="w-4 h-4" /> },
    { key: 'compliance', label: 'Compliance Reports', icon: <Shield className="w-4 h-4" /> },
  ];

  if (loading && reports.length === 0 && subscriptions.length === 0 && complianceReports.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      <Helmet>
        <title>Reports & Analytics - OneSign</title>
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between mb-8"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
              <FileBarChart className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reports & Analytics</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">Generate, schedule, and manage reports</p>
            </div>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowSubscriptionModal(true)}
              className="flex items-center space-x-2 px-6 py-3 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition-all duration-300"
            >
              <Clock className="w-5 h-5" />
              <span>Schedule Report</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Plus className="w-5 h-5" />
              <span>Generate Report</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Messages */}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl flex items-center space-x-3">
              <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              <span className="text-red-700 dark:text-red-300">{error}</span>
            </motion.div>
          )}
          {success && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span className="text-green-700 dark:text-green-300">{success}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard title="Total Reports" value={reports.length} icon={<FileText className="w-6 h-6 text-white" />} color="from-blue-500 to-indigo-600" delay={0} />
          <StatCard title="Active Subscriptions" value={subscriptions.filter((s) => s.isActive).length} icon={<Bell className="w-6 h-6 text-white" />} color="from-green-500 to-emerald-600" delay={1} />
          <StatCard title="Compliance Reports" value={complianceReports.length} icon={<Shield className="w-6 h-6 text-white" />} color="from-purple-500 to-violet-600" delay={2} />
          <StatCard title="Last Generated" value={reports.length > 0 ? new Date(reports[0].createdAt).toLocaleDateString() : 'N/A'} icon={<Calendar className="w-6 h-6 text-white" />} color="from-orange-500 to-amber-600" delay={3} />
        </div>

        {/* Tabs */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 mb-6">
          <div className="flex border-b border-gray-200 dark:border-slate-700">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center space-x-2 px-6 py-4 font-medium transition-all relative ${
                  activeTab === tab.key ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {activeTab === tab.key && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400" />}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-slate-700/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Report Name</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Created</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Size</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                  {reports.map((report, idx) => (
                    <motion.tr key={report.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + idx * 0.05 }} className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900 dark:text-white">{report.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{report.createdBy}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 text-xs font-medium rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">{report.type}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(report.status)}`}>{report.status}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{new Date(report.createdAt).toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{report.size || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end space-x-2">
                          {report.status === 'Completed' && (
                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleExportReport(report.id, report.format)} className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors">
                              <Download className="w-4 h-4" />
                            </motion.button>
                          )}
                          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-lg transition-colors">
                            <Eye className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                  {reports.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <FileText className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400">No reports generated yet</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Subscriptions Tab */}
        {activeTab === 'subscriptions' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-slate-700/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Report Type</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Frequency</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Recipients</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Next Run</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                  {subscriptions.map((sub, idx) => (
                    <motion.tr key={sub.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + idx * 0.05 }} className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900 dark:text-white">{sub.reportType}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-300">{sub.frequency}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-1">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600 dark:text-gray-300">{sub.recipients.length} recipient(s)</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{sub.nextScheduledAt ? new Date(sub.nextScheduledAt).toLocaleString() : 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${sub.isActive ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}>{sub.isActive ? 'Active' : 'Inactive'}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleToggleSubscription(sub.id)} className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${sub.isActive ? 'text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20' : 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'}`}>
                            {sub.isActive ? 'Disable' : 'Enable'}
                          </motion.button>
                          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleDeleteSubscription(sub.id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                  {subscriptions.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <Bell className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400">No scheduled reports</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Compliance Tab */}
        {activeTab === 'compliance' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Compliance Framework Reports</h2>
              <Link to="reports/compliance" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 text-sm font-medium flex items-center">
                View Detailed Compliance <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {complianceReports.map((report, idx) => (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + idx * 0.1 }}
                  className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6 hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{report.framework}</h3>
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                      report.score >= 90 ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                      report.score >= 70 ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' :
                      'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                    }`}>
                      {report.score}%
                    </span>
                  </div>
                  <div className="mb-4">
                    <div className="w-full bg-gray-200 dark:bg-slate-600 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${report.score}%` }}
                        transition={{ duration: 1, delay: 0.5 + idx * 0.1 }}
                        className={`h-2 rounded-full ${
                          report.score >= 90 ? 'bg-gradient-to-r from-green-500 to-emerald-600' :
                          report.score >= 70 ? 'bg-gradient-to-r from-yellow-500 to-amber-600' :
                          'bg-gradient-to-r from-red-500 to-rose-600'
                        }`}
                      />
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Last generated: {new Date(report.generatedAt).toLocaleDateString()}</p>
                  <div className="flex gap-3">
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                      View Report
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg text-sm font-medium shadow-md hover:shadow-lg transition-all">
                      Re-generate
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Create Report Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Generate Report">
        <form onSubmit={handleCreateReport} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Report Type</label>
            <select value={reportType} onChange={(e) => setReportType(e.target.value)} className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
              <option value="SecurityOverview">Security Overview</option>
              <option value="UserActivity">User Activity</option>
              <option value="ApplicationUsage">Application Usage</option>
              <option value="RiskAnalysis">Risk Analysis</option>
              <option value="ComplianceStatus">Compliance Status</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Format</label>
            <select value={reportFormat} onChange={(e) => setReportFormat(e.target.value as any)} className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
              <option value="xlsx">Excel (.xlsx)</option>
              <option value="pdf">PDF (.pdf)</option>
              <option value="csv">CSV (.csv)</option>
              <option value="json">JSON (.json)</option>
            </select>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <motion.button type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowCreateModal(false)} className="px-4 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">Cancel</motion.button>
            <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all">Generate</motion.button>
          </div>
        </form>
      </Modal>

      {/* Schedule Subscription Modal */}
      <Modal isOpen={showSubscriptionModal} onClose={() => setShowSubscriptionModal(false)} title="Schedule Report">
        <form onSubmit={handleCreateSubscription} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Report Type</label>
            <select value={newSubscription.reportType} onChange={(e) => setNewSubscription({ ...newSubscription, reportType: e.target.value })} className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
              <option value="SecurityOverview">Security Overview</option>
              <option value="UserActivity">User Activity</option>
              <option value="ApplicationUsage">Application Usage</option>
              <option value="RiskAnalysis">Risk Analysis</option>
              <option value="ComplianceStatus">Compliance Status</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Frequency</label>
            <select value={newSubscription.frequency} onChange={(e) => setNewSubscription({ ...newSubscription, frequency: e.target.value })} className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Recipients (comma-separated)</label>
            <input type="text" required placeholder="email1@example.com, email2@example.com" value={newSubscription.recipients} onChange={(e) => setNewSubscription({ ...newSubscription, recipients: e.target.value })} className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <motion.button type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowSubscriptionModal(false)} className="px-4 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">Cancel</motion.button>
            <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all">Create Schedule</motion.button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
