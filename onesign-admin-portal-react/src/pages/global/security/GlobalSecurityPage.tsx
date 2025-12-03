import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  Activity,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Download,
  Settings,
  Zap,
  Target,
  Crosshair,
  FileWarning,
  Bug,
  Fingerprint,
  Key,
  UserX,
  Globe,
  Server,
  Database,
  BarChart3,
  PieChart,
  Clock
} from 'lucide-react';
import DataTable, { Column } from '@/components/common/DataTable';
import Modal from '@/components/common/Modal';
import StatusBadge from '@/components/common/StatusBadge';
import AdvancedChart from '@/components/common/AdvancedChart';
import { securityService, governanceService } from '@/lib/api/services';

// Stat Card Component
interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: number;
  trendLabel?: string;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'indigo' | 'cyan' | 'pink';
  delay?: number;
}

const StatCard = ({ title, value, subtitle, icon, trend, trendLabel, color, delay = 0 }: StatCardProps) => {
  const colorClasses = {
    blue: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-800', glow: 'hover:shadow-blue-100 dark:hover:shadow-blue-900/20' },
    green: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-600 dark:text-green-400', border: 'border-green-200 dark:border-green-800', glow: 'hover:shadow-green-100 dark:hover:shadow-green-900/20' },
    purple: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-200 dark:border-purple-800', glow: 'hover:shadow-purple-100 dark:hover:shadow-purple-900/20' },
    orange: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-600 dark:text-orange-400', border: 'border-orange-200 dark:border-orange-800', glow: 'hover:shadow-orange-100 dark:hover:shadow-orange-900/20' },
    red: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-600 dark:text-red-400', border: 'border-red-200 dark:border-red-800', glow: 'hover:shadow-red-100 dark:hover:shadow-red-900/20' },
    indigo: { bg: 'bg-indigo-100 dark:bg-indigo-900/30', text: 'text-indigo-600 dark:text-indigo-400', border: 'border-indigo-200 dark:border-indigo-800', glow: 'hover:shadow-indigo-100 dark:hover:shadow-indigo-900/20' },
    cyan: { bg: 'bg-cyan-100 dark:bg-cyan-900/30', text: 'text-cyan-600 dark:text-cyan-400', border: 'border-cyan-200 dark:border-cyan-800', glow: 'hover:shadow-cyan-100 dark:hover:shadow-cyan-900/20' },
    pink: { bg: 'bg-pink-100 dark:bg-pink-900/30', text: 'text-pink-600 dark:text-pink-400', border: 'border-pink-200 dark:border-pink-800', glow: 'hover:shadow-pink-100 dark:hover:shadow-pink-900/20' }
  };

  const colors = colorClasses[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay * 0.1, duration: 0.5 }}
      className={`bg-white dark:bg-slate-800 rounded-xl shadow-sm border ${colors.border} p-6 hover:shadow-lg ${colors.glow} transition-all duration-300 cursor-default`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
            {typeof value === 'number' ? value.toLocaleString('fa-IR') : value}
          </p>
          {subtitle && (
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>
          )}
          {trend !== undefined && (
            <div className={`flex items-center gap-1 mt-2 text-sm ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span>{Math.abs(trend)}%</span>
              {trendLabel && <span className="text-slate-500 dark:text-slate-400">{trendLabel}</span>}
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl ${colors.bg}`}>
          <div className={colors.text}>{icon}</div>
        </div>
      </div>
    </motion.div>
  );
};

interface SecurityPolicy {
  id: string;
  name: string;
  description: string;
  type: 'Security' | 'Compliance' | 'Access' | 'Data';
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  status: 'Active' | 'Inactive' | 'Draft';
  scope: 'Global' | 'Tenant';
  appliedTenants: number;
  violations: number;
  createdAt: string;
  updatedAt: string;
}

interface ThreatDetectionRule {
  id: string;
  name: string;
  category: 'Anomaly' | 'Brute Force' | 'Data Exfiltration' | 'Privilege Escalation';
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  enabled: boolean;
  detections: number;
  threshold: string;
  actions: string[];
  createdAt: string;
}

interface ComplianceFramework {
  id: string;
  name: string;
  description: string;
  type: 'SOC2' | 'ISO27001' | 'GDPR' | 'HIPAA' | 'PCI-DSS';
  controls: number;
  compliantControls: number;
  complianceRate: number;
  lastAudit: string;
  nextAudit: string;
  status: 'Compliant' | 'Non-Compliant' | 'In Progress';
}

interface SecurityDashboardStats {
  totalPolicies: number;
  activePolicies: number;
  totalViolations: number;
  criticalViolations: number;
  threatDetections: number;
  complianceRate: number;
  tenantsProtected: number;
  blockedAttacks: number;
}

export default function GlobalSecurityPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'policies' | 'threats' | 'compliance' | 'dashboard'>('dashboard');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Dashboard State
  const [stats, setStats] = useState<SecurityDashboardStats>({
    totalPolicies: 0,
    activePolicies: 0,
    totalViolations: 0,
    criticalViolations: 0,
    threatDetections: 0,
    complianceRate: 0,
    tenantsProtected: 0,
    blockedAttacks: 0,
  });

  // Policies State
  const [policies, setPolicies] = useState<SecurityPolicy[]>([]);
  const [showCreatePolicyModal, setShowCreatePolicyModal] = useState(false);
  const [showEditPolicyModal, setShowEditPolicyModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<SecurityPolicy | null>(null);
  const [policyName, setPolicyName] = useState('');
  const [policyDescription, setPolicyDescription] = useState('');
  const [policyType, setPolicyType] = useState<'Security' | 'Compliance' | 'Access' | 'Data'>('Security');
  const [policySeverity, setPolicySeverity] = useState<'Critical' | 'High' | 'Medium' | 'Low'>('Medium');

  // Threat Detection State
  const [threats, setThreats] = useState<ThreatDetectionRule[]>([]);
  const [showCreateThreatModal, setShowCreateThreatModal] = useState(false);
  const [threatName, setThreatName] = useState('');
  const [threatCategory, setThreatCategory] = useState<'Anomaly' | 'Brute Force' | 'Data Exfiltration' | 'Privilege Escalation'>('Anomaly');
  const [threatSeverity, setThreatSeverity] = useState<'Critical' | 'High' | 'Medium' | 'Low'>('Medium');
  const [threatThreshold, setThreatThreshold] = useState('');

  // Compliance State
  const [frameworks, setFrameworks] = useState<ComplianceFramework[]>([]);

  // Chart data
  const threatTrendData = [
    { name: 'شنبه', 'حملات': 45, 'مسدود شده': 42, 'هشدار': 12 },
    { name: 'یکشنبه', 'حملات': 52, 'مسدود شده': 50, 'هشدار': 8 },
    { name: 'دوشنبه', 'حملات': 78, 'مسدود شده': 75, 'هشدار': 15 },
    { name: 'سه‌شنبه', 'حملات': 63, 'مسدود شده': 61, 'هشدار': 10 },
    { name: 'چهارشنبه', 'حملات': 89, 'مسدود شده': 86, 'هشدار': 18 },
    { name: 'پنج‌شنبه', 'حملات': 71, 'مسدود شده': 68, 'هشدار': 14 },
    { name: 'جمعه', 'حملات': 34, 'مسدود شده': 33, 'هشدار': 5 },
  ];

  const threatTypeData = [
    { name: 'Brute Force', value: 35 },
    { name: 'Anomaly', value: 28 },
    { name: 'Data Exfiltration', value: 22 },
    { name: 'Privilege Escalation', value: 15 },
  ];

  const complianceData = [
    { name: 'SOC2', rate: 98 },
    { name: 'ISO27001', rate: 96 },
    { name: 'GDPR', rate: 98 },
    { name: 'HIPAA', rate: 94 },
    { name: 'PCI-DSS', rate: 93 },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      await Promise.all([
        fetchPolicies(),
        fetchThreats(),
        fetchFrameworks(),
        fetchDashboardStats(),
      ]);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchPolicies = async () => {
    try {
      const data = await securityService.getSecurityPolicies();
      setPolicies(data as any);
    } catch (err) {
      console.error('Error fetching policies:', err);
      setPolicies([
        {
          id: '1',
          name: 'احراز هویت چند عاملی اجباری',
          description: 'الزام MFA برای تمام حساب‌های دارای دسترسی بالا در همه tenant‌ها',
          type: 'Security',
          severity: 'Critical',
          status: 'Active',
          scope: 'Global',
          appliedTenants: 145,
          violations: 3,
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-11-20T14:30:00Z',
        },
        {
          id: '2',
          name: 'استانداردهای پیچیدگی رمز عبور',
          description: 'حداقل 12 کاراکتر، ترکیب حروف بزرگ و کوچک، اعداد و کاراکترهای خاص',
          type: 'Security',
          severity: 'High',
          status: 'Active',
          scope: 'Global',
          appliedTenants: 145,
          violations: 8,
          createdAt: '2024-01-10T09:00:00Z',
          updatedAt: '2024-11-18T11:20:00Z',
        },
        {
          id: '3',
          name: 'حفاظت از داده‌های GDPR',
          description: 'اطمینان از رمزنگاری داده‌های شخصی و کنترل دسترسی',
          type: 'Compliance',
          severity: 'Critical',
          status: 'Active',
          scope: 'Global',
          appliedTenants: 98,
          violations: 1,
          createdAt: '2024-02-01T08:00:00Z',
          updatedAt: '2024-11-22T09:15:00Z',
        },
        {
          id: '4',
          name: 'سیاست پایان زمان نشست',
          description: 'پایان خودکار نشست پس از 30 دقیقه عدم فعالیت',
          type: 'Access',
          severity: 'Medium',
          status: 'Active',
          scope: 'Global',
          appliedTenants: 145,
          violations: 0,
          createdAt: '2024-01-20T12:00:00Z',
          updatedAt: '2024-11-15T16:45:00Z',
        },
        {
          id: '5',
          name: 'سیاست نگهداری داده',
          description: 'لاگ‌های حسابرسی حداقل 1 سال نگهداری شوند',
          type: 'Data',
          severity: 'High',
          status: 'Active',
          scope: 'Global',
          appliedTenants: 145,
          violations: 2,
          createdAt: '2024-02-10T14:00:00Z',
          updatedAt: '2024-11-19T10:30:00Z',
        },
      ]);
    }
  };

  const fetchThreats = async () => {
    setThreats([
      {
        id: '1',
        name: 'تلاش‌های ناموفق ورود',
        category: 'Brute Force',
        severity: 'Critical',
        enabled: true,
        detections: 234,
        threshold: '5 تلاش در 10 دقیقه',
        actions: ['مسدود کردن IP', 'هشدار به مدیر', 'درخواست MFA'],
        createdAt: '2024-01-15T10:00:00Z',
      },
      {
        id: '2',
        name: 'الگوی دسترسی غیرعادی به داده',
        category: 'Anomaly',
        severity: 'High',
        enabled: true,
        detections: 89,
        threshold: 'دسترسی به 100+ رکورد در 1 ساعت',
        actions: ['هشدار به مدیر', 'محدود کردن دسترسی'],
        createdAt: '2024-01-20T11:30:00Z',
      },
      {
        id: '3',
        name: 'تلاش برای ارتقای دسترسی',
        category: 'Privilege Escalation',
        severity: 'Critical',
        enabled: true,
        detections: 12,
        threshold: 'تلاش غیرمجاز برای تغییر نقش',
        actions: ['مسدود کردن کاربر', 'هشدار به مدیر', 'ایجاد حادثه'],
        createdAt: '2024-02-01T09:00:00Z',
      },
      {
        id: '4',
        name: 'صادرات داده حجیم',
        category: 'Data Exfiltration',
        severity: 'High',
        enabled: true,
        detections: 45,
        threshold: 'صادرات بیش از 1GB در یک جلسه',
        actions: ['هشدار به مدیر', 'درخواست تأیید'],
        createdAt: '2024-02-05T14:20:00Z',
      },
      {
        id: '5',
        name: 'سفر غیرممکن',
        category: 'Anomaly',
        severity: 'High',
        enabled: true,
        detections: 67,
        threshold: 'ورود از 2 مکان با فاصله کمتر از 1 ساعت',
        actions: ['مسدود کردن جلسه', 'هشدار به کاربر', 'درخواست احراز مجدد'],
        createdAt: '2024-01-25T16:45:00Z',
      },
    ]);
  };

  const fetchFrameworks = async () => {
    try {
      const data = await governanceService.getFrameworks();
      setFrameworks(data.map((f: any) => ({
        id: f.id,
        name: f.name,
        description: f.description,
        type: f.type || 'SOC2',
        controls: 150,
        compliantControls: 142,
        complianceRate: 94.7,
        lastAudit: '2024-10-15',
        nextAudit: '2025-01-15',
        status: 'Compliant',
      })));
    } catch (err) {
      setFrameworks([
        {
          id: '1',
          name: 'SOC 2 Type II',
          description: 'چارچوب انطباق کنترل سازمان خدمات 2',
          type: 'SOC2',
          controls: 150,
          compliantControls: 147,
          complianceRate: 98.0,
          lastAudit: '2024-10-15',
          nextAudit: '2025-01-15',
          status: 'Compliant',
        },
        {
          id: '2',
          name: 'ISO 27001:2022',
          description: 'استاندارد سیستم مدیریت امنیت اطلاعات',
          type: 'ISO27001',
          controls: 114,
          compliantControls: 109,
          complianceRate: 95.6,
          lastAudit: '2024-09-20',
          nextAudit: '2024-12-20',
          status: 'Compliant',
        },
        {
          id: '3',
          name: 'GDPR',
          description: 'انطباق با مقررات عمومی حفاظت از داده',
          type: 'GDPR',
          controls: 88,
          compliantControls: 86,
          complianceRate: 97.7,
          lastAudit: '2024-11-01',
          nextAudit: '2025-02-01',
          status: 'Compliant',
        },
        {
          id: '4',
          name: 'HIPAA',
          description: 'قانون قابلیت حمل و پاسخگویی بیمه سلامت',
          type: 'HIPAA',
          controls: 164,
          compliantControls: 155,
          complianceRate: 94.5,
          lastAudit: '2024-08-10',
          nextAudit: '2024-11-10',
          status: 'In Progress',
        },
        {
          id: '5',
          name: 'PCI-DSS v4.0',
          description: 'استاندارد امنیت داده صنعت کارت پرداخت',
          type: 'PCI-DSS',
          controls: 375,
          compliantControls: 348,
          complianceRate: 92.8,
          lastAudit: '2024-07-15',
          nextAudit: '2024-10-15',
          status: 'Compliant',
        },
      ]);
    }
  };

  const fetchDashboardStats = async () => {
    setStats({
      totalPolicies: 145,
      activePolicies: 142,
      totalViolations: 14,
      criticalViolations: 4,
      threatDetections: 447,
      complianceRate: 95.8,
      tenantsProtected: 145,
      blockedAttacks: 1247,
    });
  };

  const handleCreatePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      setSuccess('سیاست با موفقیت ایجاد شد');
      setShowCreatePolicyModal(false);
      resetPolicyForm();
      fetchPolicies();
    } catch (err: any) {
      setError(err?.message || t('common.errorCreatingPolicy'));
    }
  };

  const handleUpdatePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPolicy) return;
    setError('');
    setSuccess('');

    try {
      setSuccess('سیاست با موفقیت به‌روزرسانی شد');
      setShowEditPolicyModal(false);
      resetPolicyForm();
      fetchPolicies();
    } catch (err: any) {
      setError(err?.message || t('common.errorUpdatingPolicy'));
    }
  };

  const handleTogglePolicy = async (policyId: string, currentStatus: string) => {
    setError('');
    setSuccess('');

    try {
      if (currentStatus === 'Active') {
        setSuccess('سیاست با موفقیت غیرفعال شد');
      } else {
        setSuccess('سیاست با موفقیت فعال شد');
      }
      fetchPolicies();
    } catch (err: any) {
      setError(err?.message || t('common.errorTogglingPolicy'));
    }
  };

  const handleCreateThreat = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      setSuccess('قانون تشخیص تهدید با موفقیت ایجاد شد');
      setShowCreateThreatModal(false);
      resetThreatForm();
      fetchThreats();
    } catch (err: any) {
      setError(err?.message || t('common.errorCreatingThreatRule'));
    }
  };

  const handleToggleThreat = async (threatId: string, enabled: boolean) => {
    setError('');
    setSuccess('');

    try {
      setSuccess(`قانون تشخیص تهدید با موفقیت ${enabled ? 'فعال' : 'غیرفعال'} شد`);
      fetchThreats();
    } catch (err: any) {
      setError(err?.message || t('common.errorTogglingThreatRule'));
    }
  };

  const handleApplyTemplate = (template: string) => {
    switch (template) {
      case 'soc2':
        setPolicyName('کنترل‌های امنیتی SOC 2');
        setPolicyDescription('پیاده‌سازی تمام کنترل‌های امنیتی مورد نیاز SOC 2 Type II');
        setPolicyType('Compliance');
        setPolicySeverity('Critical');
        break;
      case 'iso27001':
        setPolicyName('کنترل‌های ISMS ISO 27001');
        setPolicyDescription('کنترل‌های سیستم مدیریت امنیت اطلاعات مطابق ISO 27001:2022');
        setPolicyType('Compliance');
        setPolicySeverity('Critical');
        break;
      case 'gdpr':
        setPolicyName('حفاظت از داده GDPR');
        setPolicyDescription('الزامات حریم خصوصی و حفاظت از داده برای انطباق با GDPR');
        setPolicyType('Compliance');
        setPolicySeverity('Critical');
        break;
      case 'zero-trust':
        setPolicyName('معماری Zero Trust');
        setPolicyDescription('هرگز اعتماد نکن، همیشه تأیید کن - سیاست جامع Zero Trust');
        setPolicyType('Security');
        setPolicySeverity('Critical');
        break;
    }
    setShowTemplateModal(false);
    setShowCreatePolicyModal(true);
  };

  const resetPolicyForm = () => {
    setPolicyName('');
    setPolicyDescription('');
    setPolicyType('Security');
    setPolicySeverity('Medium');
    setSelectedPolicy(null);
  };

  const resetThreatForm = () => {
    setThreatName('');
    setThreatCategory('Anomaly');
    setThreatSeverity('Medium');
    setThreatThreshold('');
  };

  const openEditPolicyModal = (policy: SecurityPolicy) => {
    setSelectedPolicy(policy);
    setPolicyName(policy.name);
    setPolicyDescription(policy.description);
    setPolicyType(policy.type);
    setPolicySeverity(policy.severity);
    setShowEditPolicyModal(true);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical': return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400';
      case 'High': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400';
      case 'Medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'Low': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400';
      default: return 'text-slate-600 bg-slate-100 dark:bg-slate-700 dark:text-slate-400';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
      case 'Compliant':
      case 'Enabled': return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
      case 'Inactive':
      case 'Non-Compliant':
      case 'Disabled': return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400';
      case 'Draft':
      case 'In Progress': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400';
      default: return 'text-slate-600 bg-slate-100 dark:bg-slate-700 dark:text-slate-400';
    }
  };

  const tabs = [
    { id: 'dashboard', label: 'داشبورد', icon: BarChart3 },
    { id: 'policies', label: 'سیاست‌های امنیتی', icon: Shield },
    { id: 'threats', label: 'تشخیص تهدید', icon: ShieldAlert },
    { id: 'compliance', label: 'انطباق', icon: ShieldCheck },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-500 border-t-transparent"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Shield className="w-6 h-6 text-red-500" />
            </div>
          </div>
          <p className="text-slate-600 dark:text-slate-400 font-medium">{t('common.loading', 'در حال بارگذاری...')}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{t('global.security.title', 'امنیت سراسری')} | OneSign</title>
      </Helmet>

      <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 via-red-50/30 to-orange-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 min-h-screen" dir="rtl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3"
            >
              <div className="p-2 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl text-white">
                <Shield className="w-6 h-6" />
              </div>
              {t('global.security.title', 'امنیت سراسری')}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="text-slate-500 dark:text-slate-400 mt-1"
            >
              {t('global.security.subtitle', 'مدیریت سیاست‌های امنیتی، تشخیص تهدید و چارچوب‌های انطباق')}
            </motion.p>
          </div>
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl hover:from-red-700 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            {t('common.refresh', 'بروزرسانی')}
          </motion.button>
        </div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-2"
        >
          <div className="flex gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Alerts */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl flex items-center gap-2"
          >
            <AlertCircle className="w-5 h-5" />
            {error}
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-xl flex items-center gap-2"
          >
            <CheckCircle className="w-5 h-5" />
            {success}
          </motion.div>
        )}

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="سیاست‌های فعال"
                value={stats.activePolicies}
                subtitle={`از ${stats.totalPolicies} سیاست`}
                icon={<Shield className="w-6 h-6" />}
                color="indigo"
                delay={0}
              />
              <StatCard
                title="نقض‌های فعال"
                value={stats.totalViolations}
                subtitle={`${stats.criticalViolations} بحرانی`}
                icon={<AlertTriangle className="w-6 h-6" />}
                trend={-15}
                trendLabel="نسبت به هفته قبل"
                color="red"
                delay={1}
              />
              <StatCard
                title="تهدیدات تشخیص داده شده"
                value={stats.threatDetections}
                subtitle="30 روز گذشته"
                icon={<ShieldAlert className="w-6 h-6" />}
                color="orange"
                delay={2}
              />
              <StatCard
                title="حملات مسدود شده"
                value={stats.blockedAttacks}
                icon={<ShieldCheck className="w-6 h-6" />}
                trend={8}
                trendLabel="نسبت به ماه قبل"
                color="green"
                delay={3}
              />
            </div>

            {/* Second Row Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="نرخ انطباق"
                value={`${stats.complianceRate}%`}
                icon={<CheckCircle className="w-6 h-6" />}
                color="green"
                delay={4}
              />
              <StatCard
                title="Tenant‌های محافظت شده"
                value={stats.tenantsProtected}
                icon={<Globe className="w-6 h-6" />}
                color="blue"
                delay={5}
              />
              <StatCard
                title="قوانین تشخیص تهدید"
                value={threats.filter(t => t.enabled).length}
                subtitle={`از ${threats.length} قانون`}
                icon={<Target className="w-6 h-6" />}
                color="purple"
                delay={6}
              />
              <StatCard
                title="چارچوب‌های انطباق"
                value={frameworks.length}
                icon={<FileWarning className="w-6 h-6" />}
                color="cyan"
                delay={7}
              />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Threat Trend Chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Activity className="w-5 h-5 text-red-500" />
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    روند تهدیدات (۷ روز گذشته)
                  </h3>
                </div>
                <AdvancedChart
                  data={threatTrendData}
                  type="area"
                  dataKeys={['حملات', 'مسدود شده', 'هشدار']}
                  xAxisKey="name"
                  height={280}
                  colors={['#ef4444', '#22c55e', '#f59e0b']}
                />
              </motion.div>

              {/* Threat Types Pie Chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6"
              >
                <div className="flex items-center gap-2 mb-4">
                  <PieChart className="w-5 h-5 text-purple-500" />
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    توزیع انواع تهدید
                  </h3>
                </div>
                <AdvancedChart
                  data={threatTypeData}
                  type="pie"
                  dataKeys={['value']}
                  height={280}
                  colors={['#ef4444', '#f59e0b', '#8b5cf6', '#3b82f6']}
                  showLegend={true}
                />
              </motion.div>
            </div>

            {/* Compliance Overview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6"
            >
              <div className="flex items-center gap-2 mb-6">
                <ShieldCheck className="w-5 h-5 text-green-500" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  وضعیت انطباق چارچوب‌ها
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {complianceData.map((item, idx) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 * idx }}
                    className="text-center p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl"
                  >
                    <div className="relative w-20 h-20 mx-auto mb-3">
                      <svg className="w-20 h-20 transform -rotate-90">
                        <circle
                          cx="40"
                          cy="40"
                          r="35"
                          stroke="currentColor"
                          strokeWidth="6"
                          fill="none"
                          className="text-slate-200 dark:text-slate-600"
                        />
                        <circle
                          cx="40"
                          cy="40"
                          r="35"
                          stroke={item.rate >= 95 ? '#22c55e' : item.rate >= 90 ? '#f59e0b' : '#ef4444'}
                          strokeWidth="6"
                          fill="none"
                          strokeLinecap="round"
                          strokeDasharray={`${item.rate * 2.2} 220`}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-lg font-bold text-slate-900 dark:text-white">{item.rate}%</span>
                      </div>
                    </div>
                    <p className="font-medium text-slate-900 dark:text-white">{item.name}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Violations */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6"
              >
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    نقض‌های اخیر سیاست‌ها
                  </h3>
                </div>
                <div className="space-y-3">
                  {policies.filter(p => p.violations > 0).slice(0, 5).map((policy, idx) => (
                    <motion.div
                      key={policy.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * idx }}
                      className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-slate-900 dark:text-white">{policy.name}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{policy.violations} نقض</p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${getSeverityColor(policy.severity)}`}>
                        {policy.severity === 'Critical' ? 'بحرانی' : policy.severity === 'High' ? 'بالا' : policy.severity === 'Medium' ? 'متوسط' : 'پایین'}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Active Threat Rules */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Target className="w-5 h-5 text-purple-500" />
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    قوانین تشخیص تهدید فعال
                  </h3>
                </div>
                <div className="space-y-3">
                  {threats.filter(t => t.enabled).slice(0, 5).map((threat, idx) => (
                    <motion.div
                      key={threat.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * idx }}
                      className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-slate-900 dark:text-white">{threat.name}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{threat.detections} تشخیص</p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${getSeverityColor(threat.severity)}`}>
                        {threat.category}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        )}

        {/* Policies Tab */}
        {activeTab === 'policies' && (
          <div className="space-y-6">
            {/* Actions Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4"
            >
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3 flex-1">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="جستجوی سیاست‌ها..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pr-10 pl-4 py-2 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowTemplateModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-all"
                  >
                    <FileWarning className="w-4 h-4" />
                    استفاده از قالب
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowCreatePolicyModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl hover:from-red-700 hover:to-orange-700 transition-all shadow-lg"
                  >
                    <Plus className="w-4 h-4" />
                    ایجاد سیاست
                  </motion.button>
                </div>
              </div>
            </motion.div>

            {/* Policies Grid */}
            <div className="grid grid-cols-1 gap-4">
              {policies.filter(p =>
                p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.description.toLowerCase().includes(searchTerm.toLowerCase())
              ).map((policy, idx) => (
                <motion.div
                  key={policy.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 hover:shadow-lg transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{policy.name}</h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${getSeverityColor(policy.severity)}`}>
                          {policy.severity === 'Critical' ? 'بحرانی' : policy.severity === 'High' ? 'بالا' : policy.severity === 'Medium' ? 'متوسط' : 'پایین'}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(policy.status)}`}>
                          {policy.status === 'Active' ? 'فعال' : policy.status === 'Inactive' ? 'غیرفعال' : 'پیش‌نویس'}
                        </span>
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 mb-4">{policy.description}</p>
                      <div className="flex items-center gap-6 text-sm">
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-slate-400" />
                          <span className="text-slate-600 dark:text-slate-400">{policy.appliedTenants} سازمان</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-slate-400" />
                          <span className={policy.violations > 0 ? 'text-red-600' : 'text-slate-600 dark:text-slate-400'}>
                            {policy.violations} نقض
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-slate-400" />
                          <span className="text-slate-600 dark:text-slate-400">
                            {new Date(policy.updatedAt).toLocaleDateString('fa-IR')}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => openEditPolicyModal(policy)}
                        className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all"
                      >
                        <Edit className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleTogglePolicy(policy.id, policy.status)}
                        className={`p-2 rounded-lg transition-all ${
                          policy.status === 'Active'
                            ? 'text-slate-500 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/30'
                            : 'text-slate-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30'
                        }`}
                      >
                        {policy.status === 'Active' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Threats Tab */}
        {activeTab === 'threats' && (
          <div className="space-y-6">
            {/* Actions Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="جستجوی قوانین..."
                    className="w-full pr-10 pl-4 py-2 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowCreateThreatModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl hover:from-red-700 hover:to-orange-700 transition-all shadow-lg"
                >
                  <Plus className="w-4 h-4" />
                  ایجاد قانون
                </motion.button>
              </div>
            </motion.div>

            {/* Threat Rules Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {threats.map((threat, idx) => (
                <motion.div
                  key={threat.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`bg-white dark:bg-slate-800 rounded-xl shadow-sm border ${
                    threat.enabled ? 'border-green-200 dark:border-green-800' : 'border-slate-200 dark:border-slate-700'
                  } p-6 hover:shadow-lg transition-all`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        threat.category === 'Brute Force' ? 'bg-red-100 dark:bg-red-900/30 text-red-600' :
                        threat.category === 'Anomaly' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600' :
                        threat.category === 'Data Exfiltration' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600' :
                        'bg-blue-100 dark:bg-blue-900/30 text-blue-600'
                      }`}>
                        {threat.category === 'Brute Force' ? <Lock className="w-5 h-5" /> :
                         threat.category === 'Anomaly' ? <Bug className="w-5 h-5" /> :
                         threat.category === 'Data Exfiltration' ? <Database className="w-5 h-5" /> :
                         <Fingerprint className="w-5 h-5" />}
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white">{threat.name}</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{threat.category}</p>
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleToggleThreat(threat.id, !threat.enabled)}
                      className={`relative w-12 h-6 rounded-full transition-all ${
                        threat.enabled ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-600'
                      }`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                        threat.enabled ? 'right-1' : 'left-1'
                      }`} />
                    </motion.button>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{threat.threshold}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${getSeverityColor(threat.severity)}`}>
                        {threat.severity}
                      </span>
                      <span className="text-sm text-slate-500 dark:text-slate-400">
                        {threat.detections} تشخیص
                      </span>
                    </div>
                    <div className="flex gap-1">
                      {threat.actions.slice(0, 2).map((action, i) => (
                        <span key={i} className="px-2 py-1 text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded">
                          {action}
                        </span>
                      ))}
                      {threat.actions.length > 2 && (
                        <span className="px-2 py-1 text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded">
                          +{threat.actions.length - 2}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Compliance Tab */}
        {activeTab === 'compliance' && (
          <div className="space-y-6">
            {/* Compliance Frameworks Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {frameworks.map((framework, idx) => (
                <motion.div
                  key={framework.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 hover:shadow-lg transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{framework.name}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{framework.description}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(framework.status)}`}>
                      {framework.status === 'Compliant' ? 'منطبق' : framework.status === 'Non-Compliant' ? 'نامنطبق' : 'در حال بررسی'}
                    </span>
                  </div>

                  {/* Progress Ring */}
                  <div className="flex items-center justify-center mb-4">
                    <div className="relative w-24 h-24">
                      <svg className="w-24 h-24 transform -rotate-90">
                        <circle
                          cx="48"
                          cy="48"
                          r="40"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="none"
                          className="text-slate-200 dark:text-slate-700"
                        />
                        <circle
                          cx="48"
                          cy="48"
                          r="40"
                          stroke={framework.complianceRate >= 95 ? '#22c55e' : framework.complianceRate >= 85 ? '#f59e0b' : '#ef4444'}
                          strokeWidth="8"
                          fill="none"
                          strokeLinecap="round"
                          strokeDasharray={`${framework.complianceRate * 2.51} 251`}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xl font-bold text-slate-900 dark:text-white">
                          {framework.complianceRate}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500 dark:text-slate-400">کنترل‌های منطبق</span>
                      <span className="font-medium text-slate-900 dark:text-white">
                        {framework.compliantControls} / {framework.controls}
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          framework.complianceRate >= 95 ? 'bg-green-500' :
                          framework.complianceRate >= 85 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${framework.complianceRate}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-sm pt-2 border-t border-slate-200 dark:border-slate-700">
                      <div>
                        <p className="text-slate-500 dark:text-slate-400">آخرین ممیزی</p>
                        <p className="font-medium text-slate-900 dark:text-white">
                          {new Date(framework.lastAudit).toLocaleDateString('fa-IR')}
                        </p>
                      </div>
                      <div className="text-left">
                        <p className="text-slate-500 dark:text-slate-400">ممیزی بعدی</p>
                        <p className="font-medium text-slate-900 dark:text-white">
                          {new Date(framework.nextAudit).toLocaleDateString('fa-IR')}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Create Policy Modal */}
        <Modal
          isOpen={showCreatePolicyModal}
          onClose={() => {
            setShowCreatePolicyModal(false);
            resetPolicyForm();
            setError('');
          }}
          title="ایجاد سیاست جدید"
          size="lg"
        >
          <form onSubmit={handleCreatePolicy} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">نام سیاست</label>
              <input
                type="text"
                required
                className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500"
                value={policyName}
                onChange={(e) => setPolicyName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">توضیحات</label>
              <textarea
                required
                rows={3}
                className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500"
                value={policyDescription}
                onChange={(e) => setPolicyDescription(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">نوع</label>
                <select
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500"
                  value={policyType}
                  onChange={(e) => setPolicyType(e.target.value as any)}
                >
                  <option value="Security">امنیتی</option>
                  <option value="Compliance">انطباق</option>
                  <option value="Access">دسترسی</option>
                  <option value="Data">داده</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">شدت</label>
                <select
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500"
                  value={policySeverity}
                  onChange={(e) => setPolicySeverity(e.target.value as any)}
                >
                  <option value="Critical">بحرانی</option>
                  <option value="High">بالا</option>
                  <option value="Medium">متوسط</option>
                  <option value="Low">پایین</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowCreatePolicyModal(false);
                  resetPolicyForm();
                  setError('');
                }}
                className="px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
              >
                انصراف
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl hover:from-red-700 hover:to-orange-700 transition-all"
              >
                ایجاد سیاست
              </button>
            </div>
          </form>
        </Modal>

        {/* Edit Policy Modal */}
        <Modal
          isOpen={showEditPolicyModal}
          onClose={() => {
            setShowEditPolicyModal(false);
            resetPolicyForm();
            setError('');
          }}
          title="ویرایش سیاست"
          size="lg"
        >
          <form onSubmit={handleUpdatePolicy} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">نام سیاست</label>
              <input
                type="text"
                required
                className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500"
                value={policyName}
                onChange={(e) => setPolicyName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">توضیحات</label>
              <textarea
                required
                rows={3}
                className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500"
                value={policyDescription}
                onChange={(e) => setPolicyDescription(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">نوع</label>
                <select
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500"
                  value={policyType}
                  onChange={(e) => setPolicyType(e.target.value as any)}
                >
                  <option value="Security">امنیتی</option>
                  <option value="Compliance">انطباق</option>
                  <option value="Access">دسترسی</option>
                  <option value="Data">داده</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">شدت</label>
                <select
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500"
                  value={policySeverity}
                  onChange={(e) => setPolicySeverity(e.target.value as any)}
                >
                  <option value="Critical">بحرانی</option>
                  <option value="High">بالا</option>
                  <option value="Medium">متوسط</option>
                  <option value="Low">پایین</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowEditPolicyModal(false);
                  resetPolicyForm();
                  setError('');
                }}
                className="px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
              >
                انصراف
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl hover:from-red-700 hover:to-orange-700 transition-all"
              >
                ذخیره تغییرات
              </button>
            </div>
          </form>
        </Modal>

        {/* Template Modal */}
        <Modal
          isOpen={showTemplateModal}
          onClose={() => setShowTemplateModal(false)}
          title="انتخاب قالب سیاست"
          size="lg"
        >
          <div className="grid grid-cols-2 gap-4">
            {[
              { id: 'soc2', name: 'SOC 2 Type II', desc: 'امنیت، در دسترس بودن، یکپارچگی پردازش، محرمانگی، حریم خصوصی' },
              { id: 'iso27001', name: 'ISO 27001', desc: 'کنترل‌های سیستم مدیریت امنیت اطلاعات (ISMS)' },
              { id: 'gdpr', name: 'GDPR', desc: 'حریم خصوصی و حفاظت از داده برای مقررات اتحادیه اروپا' },
              { id: 'zero-trust', name: 'Zero Trust', desc: 'هرگز اعتماد نکن، همیشه تأیید کن - اصول معماری' },
            ].map((template) => (
              <motion.button
                key={template.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleApplyTemplate(template.id)}
                className="p-4 border-2 border-slate-200 dark:border-slate-600 rounded-xl hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 text-right transition-all"
              >
                <div className="font-semibold text-slate-900 dark:text-white">{template.name}</div>
                <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">{template.desc}</div>
              </motion.button>
            ))}
          </div>
        </Modal>

        {/* Create Threat Modal */}
        <Modal
          isOpen={showCreateThreatModal}
          onClose={() => {
            setShowCreateThreatModal(false);
            resetThreatForm();
            setError('');
          }}
          title="ایجاد قانون تشخیص تهدید"
          size="lg"
        >
          <form onSubmit={handleCreateThreat} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">نام قانون</label>
              <input
                type="text"
                required
                className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500"
                value={threatName}
                onChange={(e) => setThreatName(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">دسته‌بندی</label>
                <select
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500"
                  value={threatCategory}
                  onChange={(e) => setThreatCategory(e.target.value as any)}
                >
                  <option value="Anomaly">ناهنجاری</option>
                  <option value="Brute Force">حمله Brute Force</option>
                  <option value="Data Exfiltration">استخراج داده</option>
                  <option value="Privilege Escalation">ارتقای دسترسی</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">شدت</label>
                <select
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500"
                  value={threatSeverity}
                  onChange={(e) => setThreatSeverity(e.target.value as any)}
                >
                  <option value="Critical">بحرانی</option>
                  <option value="High">بالا</option>
                  <option value="Medium">متوسط</option>
                  <option value="Low">پایین</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">آستانه تشخیص</label>
              <input
                type="text"
                required
                className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500"
                value={threatThreshold}
                onChange={(e) => setThreatThreshold(e.target.value)}
                placeholder="مثال: 5 تلاش در 10 دقیقه"
              />
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowCreateThreatModal(false);
                  resetThreatForm();
                  setError('');
                }}
                className="px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
              >
                انصراف
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl hover:from-red-700 hover:to-orange-700 transition-all"
              >
                ایجاد قانون
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </>
  );
}
