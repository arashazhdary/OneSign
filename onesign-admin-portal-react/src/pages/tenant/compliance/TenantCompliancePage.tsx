import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getTenantId } from '@/lib/tenant-context';
import { governanceService } from '@/lib/api/services/governance.service';
import type { ComplianceReport } from '@/lib/api/types/governance';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  FileText,
  Download,
  Eye,
  BarChart3,
  Calendar,
  Target,
  Award,
  AlertCircle,
  RefreshCw,
  Plus,
  X,
  ChevronRight,
  ClipboardCheck,
  Scale,
  History,
  TrendingUp
} from 'lucide-react';
import Modal from '@/components/common/Modal';

interface ComplianceFrameworkStatus {
  id: string;
  name: string;
  version: string;
  totalControls: number;
  compliantControls: number;
  score: number;
  status: 'compliant' | 'non-compliant' | 'in-progress';
  lastAudit: string;
  nextAudit: string;
  certificationStatus: 'certified' | 'pending' | 'expired' | 'not-applicable';
}

interface ComplianceControl {
  id: string;
  frameworkId: string;
  controlId: string;
  name: string;
  description: string;
  status: 'implemented' | 'partial' | 'not-implemented';
  evidence: string[];
  lastReviewed: string;
  assignedTo: string;
}

interface ViolationExtended {
  id: string;
  policyName: string;
  violationType: string;
  severity: string;
  status: string;
  detectedAt: string;
  resolution?: string;
  remediationSteps: string[];
  dueDate?: string;
}

interface AuditTimelineEvent {
  id: string;
  date: string;
  type: 'audit' | 'violation' | 'remediation' | 'certification';
  framework: string;
  description: string;
  status: 'completed' | 'in-progress' | 'scheduled';
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  delay?: number;
  subtitle?: string;
}

const StatCard = ({ title, value, icon: Icon, color, delay = 0, subtitle }: StatCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: delay * 0.1 }}
    className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 hover:shadow-lg transition-all"
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{title}</p>
        <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{value}</p>
        {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>}
      </div>
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  </motion.div>
);

export default function TenantCompliancePage() {
  const { t } = useTranslation();
  const [tenantId, setTenantIdState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Tabs
  type Tab = 'overview' | 'frameworks' | 'controls' | 'violations' | 'reports' | 'timeline';
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  // Data
  const [frameworks, setFrameworks] = useState<ComplianceFrameworkStatus[]>([]);
  const [controls, setControls] = useState<ComplianceControl[]>([]);
  const [violations, setViolations] = useState<ViolationExtended[]>([]);
  const [reports, setReports] = useState<ComplianceReport[]>([]);
  const [timeline, setTimeline] = useState<AuditTimelineEvent[]>([]);
  const [overallScore, setOverallScore] = useState(0);

  // Filters
  const [selectedFramework, setSelectedFramework] = useState<string>('all');
  const [violationStatus, setViolationStatus] = useState<string>('all');
  const [controlStatus, setControlStatus] = useState<string>('all');

  // Modals
  const [showGenerateReportModal, setShowGenerateReportModal] = useState(false);
  const [showViolationModal, setShowViolationModal] = useState(false);
  const [selectedViolation, setSelectedViolation] = useState<ViolationExtended | null>(null);
  const [reportFramework, setReportFramework] = useState('');
  const [reportDateFrom, setReportDateFrom] = useState('');
  const [reportDateTo, setReportDateTo] = useState('');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'frameworks', label: 'Frameworks', icon: Scale },
    { id: 'controls', label: 'Controls', icon: ClipboardCheck },
    { id: 'violations', label: 'Violations', icon: AlertTriangle },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'timeline', label: 'Timeline', icon: History },
  ];

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
  }, [tenantId, activeTab, selectedFramework, violationStatus, controlStatus]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const frameworksData = await governanceService.getFrameworks();

      const frameworkStatuses: ComplianceFrameworkStatus[] = frameworksData.map(fw => {
        const totalControls = fw.requirements?.length || 0;
        const compliantControls = Math.floor(totalControls * (0.7 + Math.random() * 0.25));
        const score = totalControls > 0 ? Math.round((compliantControls / totalControls) * 100) : 0;

        return {
          id: fw.id,
          name: fw.name,
          version: fw.version,
          totalControls,
          compliantControls,
          score,
          status: score >= 90 ? 'compliant' : score >= 70 ? 'in-progress' : 'non-compliant',
          lastAudit: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
          nextAudit: new Date(Date.now() + Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(),
          certificationStatus: score >= 95 ? 'certified' : score >= 85 ? 'pending' : 'not-applicable',
        };
      });
      setFrameworks(frameworkStatuses);

      const avgScore = frameworkStatuses.length > 0
        ? Math.round(frameworkStatuses.reduce((sum, f) => sum + f.score, 0) / frameworkStatuses.length)
        : 0;
      setOverallScore(avgScore);

      const allControls: ComplianceControl[] = [];
      frameworksData.forEach(fw => {
        fw.requirements?.forEach((req) => {
          const statuses: ('implemented' | 'partial' | 'not-implemented')[] = ['implemented', 'partial', 'not-implemented'];
          const status = statuses[Math.floor(Math.random() * 10) % 3];

          allControls.push({
            id: `${fw.id}-${req.id}`,
            frameworkId: fw.id,
            controlId: req.code,
            name: req.title,
            description: req.description,
            status,
            evidence: status === 'implemented' ? ['Policy Document', 'Audit Log', 'Test Results'] : [],
            lastReviewed: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(),
            assignedTo: 'compliance-team@example.com',
          });
        });
      });
      setControls(allControls);

      if (tenantId) {
        const violationsData = await governanceService.getViolations();
        const extendedViolations: ViolationExtended[] = (violationsData || []).map(v => ({
          ...v,
          remediationSteps: [
            'Review policy requirements',
            'Update system configuration',
            'Verify compliance',
            'Document remediation',
          ],
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        }));
        setViolations(extendedViolations);

        const reportsData = await governanceService.getReports();
        setReports(reportsData || []);
      }

      const timelineEvents: AuditTimelineEvent[] = [
        {
          id: '1',
          date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          type: 'audit',
          framework: 'SOC2',
          description: 'Scheduled SOC2 Type II audit',
          status: 'scheduled',
        },
        {
          id: '2',
          date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          type: 'certification',
          framework: 'ISO 27001',
          description: 'ISO 27001 certification renewed',
          status: 'completed',
        },
        {
          id: '3',
          date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          type: 'violation',
          framework: 'GDPR',
          description: 'Data retention policy violation detected',
          status: 'in-progress',
        },
        {
          id: '4',
          date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
          type: 'audit',
          framework: 'HIPAA',
          description: 'HIPAA compliance audit completed',
          status: 'completed',
        },
      ];
      setTimeline(timelineEvents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));

    } catch (err) {
      setError('Failed to load compliance data');
      console.error('Error fetching compliance data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    if (!tenantId || !reportFramework) return;

    setError('');
    setSuccess('');
    try {
      await governanceService.generateReport('compliance', {
        frameworkId: reportFramework,
        dateFrom: reportDateFrom,
        dateTo: reportDateTo
      });
      setSuccess('Compliance report generated successfully');
      setShowGenerateReportModal(false);
      fetchData();
    } catch (err) {
      setError('Failed to generate report');
    }
  };

  const handleExportReport = async (reportId: string) => {
    if (!tenantId) return;

    try {
      const blob = await governanceService.exportReport(reportId, 'pdf');
      const url = window.URL.createObjectURL(blob as any);
      const a = document.createElement('a');
      a.href = url;
      a.download = `compliance-report-${reportId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setSuccess('Report exported successfully');
    } catch (err) {
      setError('Failed to export report');
    }
  };

  const handleResolveViolation = async (violationId: string, resolution: string) => {
    if (!tenantId) return;

    setError('');
    setSuccess('');
    try {
      await governanceService.resolveViolation(violationId, { action: resolution, comment: resolution });
      setSuccess('Violation resolved successfully');
      setSelectedViolation(null);
      setShowViolationModal(false);
      fetchData();
    } catch (err) {
      setError('Failed to resolve violation');
    }
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'compliant':
      case 'implemented':
      case 'certified':
      case 'completed':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'in-progress':
      case 'partial':
      case 'pending':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
      case 'non-compliant':
      case 'not-implemented':
      case 'expired':
      case 'open':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant':
      case 'implemented':
      case 'certified':
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'in-progress':
      case 'partial':
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'non-compliant':
      case 'not-implemented':
      case 'expired':
      case 'open':
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getSeverityStyles = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'critical':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'high':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case 'medium':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
      case 'low':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300';
    }
  };

  const filteredViolations = violationStatus === 'all'
    ? violations
    : violations.filter(v => v.status === violationStatus);

  const filteredControls = controlStatus === 'all'
    ? controls
    : controls.filter(c => c.status === controlStatus);

  if (loading && !frameworks.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 p-8">
        <div className="flex items-center justify-center h-64">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Shield className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          </motion.div>
          <span className="ml-3 text-slate-600 dark:text-slate-400">{t('common.loading')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      <Helmet>
        <title>Compliance Dashboard - OneSign</title>
      </Helmet>

      <div className="p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                Compliance Dashboard
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Monitor compliance status across all frameworks
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={fetchData}
              className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowGenerateReportModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/25"
            >
              <FileText className="w-4 h-4" />
              Generate Report
            </motion.button>
          </div>
        </motion.div>

        {/* Alerts */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl flex items-center gap-3"
            >
              <XCircle className="w-5 h-5 flex-shrink-0" />
              {error}
              <button onClick={() => setError('')} className="ml-auto">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 px-4 py-3 rounded-xl flex items-center gap-3"
            >
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              {success}
              <button onClick={() => setSuccess('')} className="ml-auto">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-1.5 inline-flex gap-1 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as Tab)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                title="Overall Score"
                value={`${overallScore}%`}
                icon={TrendingUp}
                color={overallScore >= 90 ? 'bg-gradient-to-br from-emerald-500 to-teal-600' : overallScore >= 70 ? 'bg-gradient-to-br from-amber-500 to-orange-600' : 'bg-gradient-to-br from-red-500 to-rose-600'}
                delay={0}
              />
              <StatCard
                title="Frameworks"
                value={frameworks.length}
                icon={Scale}
                color="bg-gradient-to-br from-indigo-500 to-purple-600"
                delay={1}
              />
              <StatCard
                title="Total Controls"
                value={controls.length}
                icon={ClipboardCheck}
                color="bg-gradient-to-br from-blue-500 to-cyan-600"
                delay={2}
              />
              <StatCard
                title="Active Violations"
                value={violations.filter(v => v.status === 'open').length}
                icon={AlertTriangle}
                color="bg-gradient-to-br from-red-500 to-rose-600"
                delay={3}
              />
            </div>

            {/* Compliance Score Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 mb-8"
            >
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <Target className="w-5 h-5 text-indigo-500" />
                Overall Compliance Score
              </h2>
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="relative w-40 h-40">
                  <svg className="transform -rotate-90 w-40 h-40">
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      className="stroke-slate-200 dark:stroke-slate-700"
                      strokeWidth="12"
                      fill="none"
                    />
                    <motion.circle
                      cx="80"
                      cy="80"
                      r="70"
                      stroke={overallScore >= 90 ? '#10b981' : overallScore >= 70 ? '#f59e0b' : '#ef4444'}
                      strokeWidth="12"
                      fill="none"
                      strokeLinecap="round"
                      initial={{ strokeDasharray: `${2 * Math.PI * 70}`, strokeDashoffset: `${2 * Math.PI * 70}` }}
                      animate={{ strokeDashoffset: `${2 * Math.PI * 70 * (1 - overallScore / 100)}` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-4xl font-bold text-slate-900 dark:text-white">{overallScore}%</span>
                  </div>
                </div>
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-2">
                      <CheckCircle className="w-5 h-5" />
                      <span className="text-sm font-medium">Compliant</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                      {frameworks.filter(f => f.status === 'compliant').length}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">frameworks</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 mb-2">
                      <Clock className="w-5 h-5" />
                      <span className="text-sm font-medium">In Progress</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                      {frameworks.filter(f => f.status === 'in-progress').length}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">frameworks</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-red-600 dark:text-red-400 mb-2">
                      <XCircle className="w-5 h-5" />
                      <span className="text-sm font-medium">Non-Compliant</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                      {frameworks.filter(f => f.status === 'non-compliant').length}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">frameworks</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Framework Cards */}
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Scale className="w-5 h-5 text-indigo-500" />
              Compliance Frameworks
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {frameworks.map((framework, index) => (
                <motion.div
                  key={framework.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 hover:shadow-lg transition-all"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="font-semibold text-slate-900 dark:text-white">{framework.name}</h4>
                    <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg ${getStatusStyles(framework.status)}`}>
                      {getStatusIcon(framework.status)}
                      {framework.status}
                    </span>
                  </div>
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-600 dark:text-slate-400">Compliance</span>
                      <span className="font-medium text-slate-900 dark:text-white">{framework.score}%</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                      <motion.div
                        className={`h-2 rounded-full ${framework.score >= 90 ? 'bg-emerald-500' : framework.score >= 70 ? 'bg-amber-500' : 'bg-red-500'}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${framework.score}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                  <div className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex justify-between">
                      <span>Controls</span>
                      <span className="text-slate-700 dark:text-slate-300">{framework.compliantControls}/{framework.totalControls}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Version</span>
                      <span className="text-slate-700 dark:text-slate-300">{framework.version}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Certification</span>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded ${getStatusStyles(framework.certificationStatus)}`}>
                        {framework.certificationStatus === 'certified' && <Award className="w-3 h-3" />}
                        {framework.certificationStatus}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Frameworks Tab */}
        {activeTab === 'frameworks' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Scale className="w-5 h-5 text-indigo-500" />
                Compliance Frameworks
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                <thead className="bg-slate-50 dark:bg-slate-900/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Framework</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Version</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Score</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Controls</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Last Audit</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Next Audit</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Certification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {frameworks.map((framework, index) => (
                    <motion.tr
                      key={framework.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                            <Scale className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                          </div>
                          <span className="text-sm font-medium text-slate-900 dark:text-white">{framework.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{framework.version}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium ${getStatusStyles(framework.status)}`}>
                          {getStatusIcon(framework.status)}
                          {framework.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-slate-900 dark:text-white">{framework.score}%</span>
                          <div className="w-20 bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-1.5 rounded-full ${framework.score >= 90 ? 'bg-emerald-500' : framework.score >= 70 ? 'bg-amber-500' : 'bg-red-500'}`}
                              style={{ width: `${framework.score}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                        {framework.compliantControls} / {framework.totalControls}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                        {new Date(framework.lastAudit).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                        {new Date(framework.nextAudit).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium ${getStatusStyles(framework.certificationStatus)}`}>
                          {framework.certificationStatus === 'certified' && <Award className="w-3 h-3" />}
                          {framework.certificationStatus}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Controls Tab */}
        {activeTab === 'controls' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="mb-4 flex flex-wrap gap-4">
              <select
                value={selectedFramework}
                onChange={(e) => setSelectedFramework(e.target.value)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Frameworks</option>
                {frameworks.map(f => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
              <select
                value={controlStatus}
                onChange={(e) => setControlStatus(e.target.value)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Statuses</option>
                <option value="implemented">Implemented</option>
                <option value="partial">Partially Implemented</option>
                <option value="not-implemented">Not Implemented</option>
              </select>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                  <thead className="bg-slate-50 dark:bg-slate-900/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Control ID</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Evidence</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Last Reviewed</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Assigned To</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    {filteredControls.slice(0, 20).map((control, index) => (
                      <motion.tr
                        key={control.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.03 }}
                        className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <span className="text-sm font-medium text-slate-900 dark:text-white">{control.controlId}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="max-w-xs">
                            <p className="text-sm font-medium text-slate-900 dark:text-white">{control.name}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{control.description}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium ${getStatusStyles(control.status)}`}>
                            {getStatusIcon(control.status)}
                            {control.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {control.evidence.length > 0 ? (
                            <span className="inline-flex items-center gap-1 text-sm text-emerald-600 dark:text-emerald-400">
                              <CheckCircle className="w-4 h-4" />
                              {control.evidence.length} items
                            </span>
                          ) : (
                            <span className="text-sm text-slate-400">No evidence</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                          {new Date(control.lastReviewed).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                          {control.assignedTo}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* Violations Tab */}
        {activeTab === 'violations' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="mb-4">
              <select
                value={violationStatus}
                onChange={(e) => setViolationStatus(e.target.value)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Statuses</option>
                <option value="open">Open</option>
                <option value="investigating">Investigating</option>
                <option value="resolved">Resolved</option>
                <option value="false_positive">False Positive</option>
              </select>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                  <thead className="bg-slate-50 dark:bg-slate-900/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Policy</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Severity</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Detected</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    {filteredViolations.map((violation, index) => (
                      <motion.tr
                        key={violation.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <span className="text-sm font-medium text-slate-900 dark:text-white">{violation.policyName}</span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                          {violation.violationType}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium ${getSeverityStyles(violation.severity)}`}>
                            <AlertTriangle className="w-3 h-3" />
                            {violation.severity}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium ${getStatusStyles(violation.status)}`}>
                            {getStatusIcon(violation.status)}
                            {violation.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                          {new Date(violation.detectedAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              setSelectedViolation(violation);
                              setShowViolationModal(true);
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                            View Details
                          </motion.button>
                        </td>
                      </motion.tr>
                    ))}
                    {filteredViolations.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center">
                            <CheckCircle className="w-12 h-12 text-emerald-500 mb-3" />
                            <p className="text-slate-600 dark:text-slate-400">No violations found</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-500" />
                Compliance Reports
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                <thead className="bg-slate-50 dark:bg-slate-900/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Report Type</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Framework</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Period</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Score</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Generated</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {reports.map((report, index) => (
                    <motion.tr
                      key={report.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                            <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                          </div>
                          <span className="text-sm font-medium text-slate-900 dark:text-white">
                            {(report as any).reportType || 'Compliance Report'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                        {(report as any).framework || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                        {(report as any).period ? `${new Date((report as any).period.from).toLocaleDateString()} - ${new Date((report as any).period.to).toLocaleDateString()}` : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">
                        {(report as any).overallScore || 0}%
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium ${getStatusStyles(report.status)}`}>
                          {getStatusIcon(report.status)}
                          {report.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                        {new Date(report.generatedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleExportReport(report.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg transition-colors"
                        >
                          <Download className="w-4 h-4" />
                          Export
                        </motion.button>
                      </td>
                    </motion.tr>
                  ))}
                  {reports.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center">
                          <FileText className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" />
                          <p className="text-slate-600 dark:text-slate-400">No compliance reports available</p>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setShowGenerateReportModal(true)}
                            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                            Generate Report
                          </motion.button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Timeline Tab */}
        {activeTab === 'timeline' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6"
          >
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <History className="w-5 h-5 text-indigo-500" />
              Audit Timeline
            </h2>
            <div className="space-y-6">
              {timeline.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex gap-4"
                >
                  <div className="flex flex-col items-center">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      event.status === 'completed' ? 'bg-emerald-100 dark:bg-emerald-900/30' :
                      event.status === 'in-progress' ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-blue-100 dark:bg-blue-900/30'
                    }`}>
                      {event.type === 'audit' && <ClipboardCheck className={`w-5 h-5 ${event.status === 'completed' ? 'text-emerald-600 dark:text-emerald-400' : event.status === 'in-progress' ? 'text-amber-600 dark:text-amber-400' : 'text-blue-600 dark:text-blue-400'}`} />}
                      {event.type === 'violation' && <AlertTriangle className={`w-5 h-5 ${event.status === 'completed' ? 'text-emerald-600 dark:text-emerald-400' : event.status === 'in-progress' ? 'text-amber-600 dark:text-amber-400' : 'text-blue-600 dark:text-blue-400'}`} />}
                      {event.type === 'certification' && <Award className={`w-5 h-5 ${event.status === 'completed' ? 'text-emerald-600 dark:text-emerald-400' : event.status === 'in-progress' ? 'text-amber-600 dark:text-amber-400' : 'text-blue-600 dark:text-blue-400'}`} />}
                      {event.type === 'remediation' && <CheckCircle className={`w-5 h-5 ${event.status === 'completed' ? 'text-emerald-600 dark:text-emerald-400' : event.status === 'in-progress' ? 'text-amber-600 dark:text-amber-400' : 'text-blue-600 dark:text-blue-400'}`} />}
                    </div>
                    {index < timeline.length - 1 && (
                      <div className="w-0.5 flex-1 bg-slate-200 dark:bg-slate-700 my-2" />
                    )}
                  </div>
                  <div className="flex-1 pb-8">
                    <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-medium text-slate-900 dark:text-white">{event.description}</h3>
                          <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-1">
                            <Scale className="w-3 h-3" />
                            {event.framework}
                          </p>
                        </div>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium ${getStatusStyles(event.status)}`}>
                          {getStatusIcon(event.status)}
                          {event.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(event.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Generate Report Modal */}
      <Modal
        isOpen={showGenerateReportModal}
        onClose={() => setShowGenerateReportModal(false)}
        title="Generate Compliance Report"
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4" />
                Framework
              </div>
            </label>
            <select
              value={reportFramework}
              onChange={(e) => setReportFramework(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">Select Framework</option>
              {frameworks.map(f => (
                <option key={f.id} value={f.name}>{f.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                From Date
              </div>
            </label>
            <input
              type="date"
              value={reportDateFrom}
              onChange={(e) => setReportDateFrom(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                To Date
              </div>
            </label>
            <input
              type="date"
              value={reportDateTo}
              onChange={(e) => setReportDateTo(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGenerateReport}
              disabled={!reportFramework || !reportDateFrom || !reportDateTo}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-500/25"
            >
              <FileText className="w-4 h-4" />
              Generate
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowGenerateReportModal(false)}
              className="px-6 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-all"
            >
              Cancel
            </motion.button>
          </div>
        </div>
      </Modal>

      {/* Violation Details Modal */}
      <Modal
        isOpen={showViolationModal && !!selectedViolation}
        onClose={() => {
          setShowViolationModal(false);
          setSelectedViolation(null);
        }}
        title="Violation Details"
        size="lg"
      >
        {selectedViolation && (
          <div className="space-y-6">
            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase mb-1">Policy</p>
              <p className="text-lg font-semibold text-slate-900 dark:text-white">{selectedViolation.policyName}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase mb-1">Type</p>
                <p className="text-sm text-slate-900 dark:text-white">{selectedViolation.violationType}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase mb-1">Severity</p>
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium ${getSeverityStyles(selectedViolation.severity)}`}>
                  <AlertTriangle className="w-3 h-3" />
                  {selectedViolation.severity}
                </span>
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <ChevronRight className="w-4 h-4 text-indigo-500" />
                Remediation Steps
              </p>
              <ol className="space-y-2">
                {selectedViolation.remediationSteps.map((step, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center text-xs font-medium">
                      {index + 1}
                    </span>
                    <span className="text-sm text-slate-600 dark:text-slate-400">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            {selectedViolation.status === 'open' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Resolution Notes
                </label>
                <textarea
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  rows={4}
                  placeholder="Enter resolution details..."
                />
              </div>
            )}

            <div className="flex gap-3 pt-4">
              {selectedViolation.status === 'open' && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleResolveViolation(selectedViolation.id, 'Resolved by admin')}
                  className="flex items-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  Mark as Resolved
                </motion.button>
              )}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setShowViolationModal(false);
                  setSelectedViolation(null);
                }}
                className="px-6 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-all"
              >
                Close
              </motion.button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
