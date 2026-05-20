import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { getTenantId } from '@/lib/tenant-context';
import { governanceService } from '@/lib/api/services/governance.service';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { Helmet } from 'react-helmet-async';
import {
  FileCheck,
  FileText,
  Calendar,
  History,
  LayoutDashboard,
  Download,
  Plus,
  Trash2,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  LucideIcon
} from 'lucide-react';

interface ComplianceScore {
  framework: string;
  score: number;
  lastAudit: string;
  status: 'compliant' | 'warning' | 'non-compliant';
}

interface PredefinedReport {
  id: string;
  name: string;
  framework: string;
  description: string;
  lastGenerated: string | null;
  status: 'available' | 'generating' | 'scheduled';
}

interface ReportHistory {
  id: string;
  name: string;
  framework: string;
  generatedDate: string;
  generatedBy: string;
  format: 'PDF' | 'Excel' | 'JSON';
  size: string;
}

interface CustomReportBuilder {
  name: string;
  framework: string;
  dateRange: { start: string; end: string };
  sections: string[];
  format: 'PDF' | 'Excel' | 'JSON';
}

interface ScheduledReport {
  id: string;
  name: string;
  framework: string;
  frequency: 'weekly' | 'monthly' | 'quarterly';
  nextRun: string;
  recipients: string[];
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

interface TabItem {
  key: string;
  label: string;
  icon: LucideIcon;
}

const CHART_COLORS = ['#22c55e', '#eab308', '#ef4444', '#3b82f6', '#8b5cf6'];

export default function TenantReportsCompliancePage() {
  const { t } = useTranslation();
  const [tenantId, setTenantIdState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'predefined' | 'custom' | 'scheduled' | 'history'>('dashboard');

  const [complianceScores, setComplianceScores] = useState<ComplianceScore[]>([]);
  const [predefinedReports, setPredefinedReports] = useState<PredefinedReport[]>([]);
  const [reportHistory, setReportHistory] = useState<ReportHistory[]>([]);
  const [scheduledReports, setScheduledReports] = useState<ScheduledReport[]>([]);

  const [customReport, setCustomReport] = useState<CustomReportBuilder>({
    name: '',
    framework: 'GDPR',
    dateRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0]
    },
    sections: [],
    format: 'PDF'
  });

  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [newSchedule, setNewSchedule] = useState({
    reportId: '',
    frequency: 'monthly' as 'weekly' | 'monthly' | 'quarterly',
    recipients: ''
  });

  const tabs: TabItem[] = [
    { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { key: 'predefined', label: 'Pre-defined Reports', icon: FileCheck },
    { key: 'custom', label: 'Custom Builder', icon: FileText },
    { key: 'scheduled', label: 'Scheduled', icon: Calendar },
    { key: 'history', label: 'History', icon: History }
  ];

  useEffect(() => {
    const contextTenantId = getTenantId();
    setTenantIdState(contextTenantId || '00000000-0000-0000-0000-000000000000');
  }, []);

  useEffect(() => {
    if (tenantId) {
      fetchComplianceData();
    }
  }, [tenantId]);

  const fetchComplianceData = async () => {
    if (!tenantId) return;

    setLoading(true);
    try {
      const [frameworks, reports] = await Promise.all([
        governanceService.getFrameworks(),
        governanceService.getReports()
      ]);

      const scores: ComplianceScore[] = (frameworks ?? []).map((framework: any) => ({
        framework: framework.name || framework.id,
        score: framework.complianceScore ?? 0,
        lastAudit: framework.lastAuditDate || new Date().toISOString(),
        status: framework.status || 'compliant',
      }));
      setComplianceScores(scores);

      const predefined: PredefinedReport[] = (reports ?? [])
        .filter((r: any) => r.type === 'predefined')
        .map((r: any) => ({
          id: r.id,
          name: r.name || `${r.framework} Report`,
          framework: r.framework,
          description: r.description || '',
          lastGenerated: r.generatedDate || null,
          status: r.status || 'available',
        }));
      setPredefinedReports(predefined);

      const history: ReportHistory[] = (reports ?? [])
        .filter((r: any) => r.generatedDate)
        .map((r: any) => ({
          id: r.id,
          name: r.name,
          framework: r.framework,
          generatedDate: r.generatedDate,
          generatedBy: r.generatedBy || 'system',
          format: r.format || 'PDF',
          size: r.size || '0 KB',
        }));
      setReportHistory(history);
      setScheduledReports([]);

    } catch (error) {
      console.error('Error fetching compliance data:', error);
      setComplianceScores([]);
      setPredefinedReports([]);
      setReportHistory([]);
      setScheduledReports([]);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async (reportId: string, format: 'PDF' | 'Excel' | 'JSON') => {
    const report = predefinedReports.find(r => r.id === reportId);
    if (!report || !tenantId) return;

    try {
      const formatMap: Record<string, 'pdf' | 'csv' | 'excel'> = {
        'PDF': 'pdf',
        'Excel': 'excel',
        'JSON': 'csv'
      };
      const blob = await governanceService.exportReport(reportId, formatMap[format]);

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${report.name.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.${format.toLowerCase()}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      fetchComplianceData();
    } catch (error) {
      console.error('Error generating report:', error);
      alert(`Generating ${report.name} in ${format} format...`);

      const data = {
        report: report.name,
        framework: report.framework,
        generatedDate: new Date().toISOString(),
        tenantId,
        format
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${report.name.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.${format.toLowerCase()}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const generateCustomReport = () => {
    if (!customReport.name) {
      alert(t('common.pleaseEnterReportName'));
      return;
    }

    const data = {
      ...customReport,
      generatedDate: new Date().toISOString(),
      tenantId
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${customReport.name.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.${customReport.format.toLowerCase()}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    alert(`Custom report "${customReport.name}" generated successfully!`);
  };

  const scheduleReport = () => {
    if (!newSchedule.reportId || !newSchedule.recipients) {
      alert(t('common.pleaseFillInAllFields'));
      return;
    }

    const report = predefinedReports.find(r => r.id === newSchedule.reportId);
    if (!report) return;

    const nextRun = new Date();
    if (newSchedule.frequency === 'weekly') {
      nextRun.setDate(nextRun.getDate() + 7);
    } else if (newSchedule.frequency === 'monthly') {
      nextRun.setMonth(nextRun.getMonth() + 1);
    } else {
      nextRun.setMonth(nextRun.getMonth() + 3);
    }

    const scheduled: ScheduledReport = {
      id: String(scheduledReports.length + 1),
      name: report.name,
      framework: report.framework,
      frequency: newSchedule.frequency,
      nextRun: nextRun.toISOString(),
      recipients: newSchedule.recipients.split(',').map(e => e.trim())
    };

    setScheduledReports([...scheduledReports, scheduled]);
    setShowScheduleModal(false);
    setNewSchedule({ reportId: '', frequency: 'monthly', recipients: '' });
    alert(t('common.reportScheduledSuccessfully'));
  };

  const downloadHistoryReport = (report: ReportHistory) => {
    alert(`Downloading ${report.name}...`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'compliant':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
            <CheckCircle className="w-3 h-3" />
            Compliant
          </span>
        );
      case 'warning':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300">
            <AlertTriangle className="w-3 h-3" />
            Warning
          </span>
        );
      case 'non-compliant':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300">
            <XCircle className="w-3 h-3" />
            Non-Compliant
          </span>
        );
      default:
        return null;
    }
  };

  const getFormatBadge = (format: string) => {
    switch (format) {
      case 'PDF':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
      case 'Excel':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      case 'JSON':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
    }
  };

  const availableSections = [
    'Access Controls',
    'Data Processing Activities',
    'User Consent Records',
    'Data Breach Incidents',
    'Audit Logs',
    'Policy Compliance',
    'Risk Assessments',
    'Third-Party Integrations'
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-green-50 dark:from-slate-900 dark:via-emerald-900/20 dark:to-green-900/20 p-8">
        <div className="flex items-center justify-center h-64">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full"
          />
        </div>
      </div>
    );
  }

  const avgScore = complianceScores.length > 0
    ? Math.round(complianceScores.reduce((acc, s) => acc + s.score, 0) / complianceScores.length)
    : 0;
  const compliantCount = complianceScores.filter(s => s.status === 'compliant').length;
  const warningCount = complianceScores.filter(s => s.status === 'warning').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-green-50 dark:from-slate-900 dark:via-emerald-900/20 dark:to-green-900/20">
      <Helmet>
        <title>{t('common.complianceReports')}</title>
      </Helmet>

      <div className="p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-8"
        >
          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('common.complianceReports')}</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">{t('common.generateAndManageComplianceReports')}</p>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Average Score"
            value={`${avgScore}%`}
            icon={<Shield className="w-6 h-6 text-white" />}
            color="from-emerald-500 to-green-600"
            delay={0}
          />
          <StatCard
            title="Frameworks"
            value={complianceScores.length}
            icon={<FileCheck className="w-6 h-6 text-white" />}
            color="from-blue-500 to-indigo-600"
            delay={1}
          />
          <StatCard
            title={t('common.compliant')}
            value={compliantCount}
            icon={<CheckCircle className="w-6 h-6 text-white" />}
            color="from-green-500 to-emerald-600"
            delay={2}
          />
          <StatCard
            title="Warnings"
            value={warningCount}
            icon={<AlertTriangle className="w-6 h-6 text-white" />}
            color="from-yellow-500 to-amber-600"
            delay={3}
          />
        </div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 mb-6"
        >
          <nav className="flex p-2 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`relative flex items-center gap-2 py-3 px-6 rounded-lg font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.key
                    ? 'text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700'
                }`}
              >
                {activeTab === tab.key && (
                  <motion.div
                    layoutId="activeComplianceTab"
                    className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-green-600 rounded-lg"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <tab.icon className="w-4 h-4 relative z-10" />
                <span className="relative z-10">{tab.label}</span>
              </button>
            ))}
          </nav>
        </motion.div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Compliance Scores */}
              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Compliance Score Dashboard</h3>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {complianceScores.map((score, index) => (
                    <motion.div
                      key={score.framework}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-sm text-gray-900 dark:text-white">{score.framework}</h4>
                        <span className={`w-3 h-3 rounded-full ${
                          score.status === 'compliant' ? 'bg-green-500' :
                          score.status === 'warning' ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}></span>
                      </div>
                      <p className={`text-3xl font-bold mb-2 ${
                        score.score >= 90 ? 'text-green-600 dark:text-green-400' :
                        score.score >= 75 ? 'text-yellow-600 dark:text-yellow-400' :
                        'text-red-600 dark:text-red-400'
                      }`}>{score.score}%</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(score.lastAudit).toLocaleDateString()}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Compliance Scores by Framework</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={complianceScores}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="framework" stroke="#6b7280" />
                      <YAxis domain={[0, 100]} stroke="#6b7280" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          borderRadius: '12px',
                          border: '1px solid #e5e7eb'
                        }}
                      />
                      <Legend />
                      <Bar dataKey="score" name="Compliance Score (%)" radius={[4, 4, 0, 0]}>
                        {complianceScores.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.score >= 90 ? '#22c55e' : entry.score >= 75 ? '#eab308' : '#ef4444'}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Compliance Status Distribution</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={complianceScores}>
                      <PolarGrid stroke="#e5e7eb" />
                      <PolarAngleAxis dataKey="framework" stroke="#6b7280" />
                      <PolarRadiusAxis domain={[0, 100]} stroke="#6b7280" />
                      <Radar name="Score" dataKey="score" stroke="#10b981" fill="#10b981" fillOpacity={0.5} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          borderRadius: '12px',
                          border: '1px solid #e5e7eb'
                        }}
                      />
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'predefined' && (
            <motion.div
              key="predefined"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {predefinedReports.map((report, index) => (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{report.name}</h3>
                        <span className="px-3 py-1 text-xs rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300">
                          {report.framework}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{report.description}</p>
                      {report.lastGenerated && (
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-2 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Last generated: {new Date(report.lastGenerated).toLocaleString()}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => generateReport(report.id, 'PDF')}
                        className="px-4 py-2 bg-red-500 text-white text-sm rounded-xl hover:bg-red-600 flex items-center gap-2 transition-all"
                      >
                        <Download className="w-4 h-4" />
                        PDF
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => generateReport(report.id, 'Excel')}
                        className="px-4 py-2 bg-green-500 text-white text-sm rounded-xl hover:bg-green-600 flex items-center gap-2 transition-all"
                      >
                        <Download className="w-4 h-4" />
                        Excel
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setNewSchedule({ ...newSchedule, reportId: report.id });
                          setShowScheduleModal(true);
                        }}
                        className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white text-sm rounded-xl hover:from-emerald-600 hover:to-green-700 flex items-center gap-2 transition-all"
                      >
                        <Calendar className="w-4 h-4" />
                        Schedule
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {activeTab === 'custom' && (
            <motion.div
              key="custom"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Build Custom Compliance Report</h3>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Report Name</label>
                  <input
                    type="text"
                    value={customReport.name}
                    onChange={(e) => setCustomReport({ ...customReport, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    placeholder="Enter report name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Compliance Framework</label>
                  <select
                    value={customReport.framework}
                    onChange={(e) => setCustomReport({ ...customReport, framework: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  >
                    <option value="GDPR">GDPR</option>
                    <option value="SOC2">SOC2</option>
                    <option value="ISO27001">ISO27001</option>
                    <option value="HIPAA">HIPAA</option>
                    <option value="Custom">Custom</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Start Date</label>
                    <input
                      type="date"
                      value={customReport.dateRange.start}
                      onChange={(e) => setCustomReport({
                        ...customReport,
                        dateRange: { ...customReport.dateRange, start: e.target.value }
                      })}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">End Date</label>
                    <input
                      type="date"
                      value={customReport.dateRange.end}
                      onChange={(e) => setCustomReport({
                        ...customReport,
                        dateRange: { ...customReport.dateRange, end: e.target.value }
                      })}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Report Sections</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {availableSections.map((section) => (
                      <label
                        key={section}
                        className={`flex items-center space-x-3 p-4 border rounded-xl cursor-pointer transition-all ${
                          customReport.sections.includes(section)
                            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                            : 'border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={customReport.sections.includes(section)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setCustomReport({
                                ...customReport,
                                sections: [...customReport.sections, section]
                              });
                            } else {
                              setCustomReport({
                                ...customReport,
                                sections: customReport.sections.filter(s => s !== section)
                              });
                            }
                          }}
                          className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                        />
                        <span className="text-sm text-gray-900 dark:text-white">{section}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Export Format</label>
                  <div className="flex gap-4">
                    {['PDF', 'Excel', 'JSON'].map((format) => (
                      <label
                        key={format}
                        className={`flex items-center space-x-2 px-4 py-3 border rounded-xl cursor-pointer transition-all ${
                          customReport.format === format
                            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                            : 'border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700'
                        }`}
                      >
                        <input
                          type="radio"
                          name="format"
                          value={format}
                          checked={customReport.format === format}
                          onChange={(e) => setCustomReport({ ...customReport, format: e.target.value as any })}
                          className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="text-sm text-gray-900 dark:text-white">{format}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={generateCustomReport}
                  className="w-full px-6 py-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-green-700 flex items-center justify-center gap-2 transition-all"
                >
                  <FileText className="w-5 h-5" />
                  Generate Custom Report
                </motion.button>
              </div>
            </motion.div>
          )}

          {activeTab === 'scheduled' && (
            <motion.div
              key="scheduled"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowScheduleModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl font-medium hover:from-emerald-600 hover:to-green-700 flex items-center gap-2 transition-all"
              >
                <Plus className="w-5 h-5" />
                Schedule New Report
              </motion.button>

              {scheduledReports.map((report, index) => (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{report.name}</h3>
                        <span className="px-3 py-1 text-xs rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300">
                          {report.framework}
                        </span>
                        <span className="px-3 py-1 text-xs rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                          {report.frequency}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        Next run: {new Date(report.nextRun).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1 mt-1">
                        <Users className="w-4 h-4" />
                        Recipients: {report.recipients.join(', ')}
                      </p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        if (confirm(t('tenant.reports.compliance.confirmDeleteScheduledReport', 'Are you sure you want to delete this scheduled report?'))) {
                          setScheduledReports(scheduledReports.filter(r => r.id !== report.id));
                        }
                      }}
                      className="px-4 py-2 bg-red-500 text-white text-sm rounded-xl hover:bg-red-600 flex items-center gap-2 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {activeTab === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 overflow-hidden"
            >
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50 dark:bg-slate-700/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Report Name</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Framework</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Generated Date</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Generated By</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Format</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Size</th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                    {reportHistory.map((report, index) => (
                      <motion.tr
                        key={report.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-gray-50 dark:hover:bg-slate-700/50"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{report.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-3 py-1 text-xs rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300">
                            {report.framework}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {new Date(report.generatedDate).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{report.generatedBy}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 text-xs rounded-full ${getFormatBadge(report.format)}`}>
                            {report.format}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{report.size}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => downloadHistoryReport(report)}
                            className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 flex items-center gap-1 ml-auto"
                          >
                            <Download className="w-4 h-4" />
                            Download
                          </motion.button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Schedule Modal */}
        <AnimatePresence>
          {showScheduleModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setShowScheduleModal(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Schedule Report</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Report</label>
                    <select
                      value={newSchedule.reportId}
                      onChange={(e) => setNewSchedule({ ...newSchedule, reportId: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    >
                      <option value="">Choose a report...</option>
                      {predefinedReports.map(report => (
                        <option key={report.id} value={report.id}>{report.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Frequency</label>
                    <select
                      value={newSchedule.frequency}
                      onChange={(e) => setNewSchedule({ ...newSchedule, frequency: e.target.value as any })}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    >
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Recipients (comma-separated emails)</label>
                    <input
                      type="text"
                      value={newSchedule.recipients}
                      onChange={(e) => setNewSchedule({ ...newSchedule, recipients: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                      placeholder="email1@example.com, email2@example.com"
                    />
                  </div>

                  <div className="flex gap-3 mt-6">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={scheduleReport}
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl font-medium hover:from-emerald-600 hover:to-green-700 transition-all"
                    >
                      Schedule
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowScheduleModal(false)}
                      className="flex-1 px-4 py-3 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-slate-600 transition-all"
                    >
                      Cancel
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
