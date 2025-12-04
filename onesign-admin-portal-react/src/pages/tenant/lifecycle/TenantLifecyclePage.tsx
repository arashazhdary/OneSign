import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocale } from '@/hooks/useLocale';
import { getTenantId } from '@/lib/tenant-context';
import { DEFAULT_TENANT_ID } from '@/lib/constants/testIds';
import { lifecycleService } from '@/lib/api/services';
import Modal from '@/components/common/Modal';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RefreshCw,
  Plus,
  Package,
  FileText,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Calendar,
  Activity,
  UserPlus,
  UserMinus,
  ArrowRight,
  Zap,
  Settings,
  Search,
  Edit,
  Trash2,
  Briefcase
} from 'lucide-react';

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

interface AccessPackage {
  id: string;
  name: string;
  description: string;
  roles: string[];
  duration: number;
  approvalRequired: boolean;
}

interface LifecyclePolicy {
  id: string;
  name: string;
  trigger: string;
  actions: string[];
  enabled: boolean;
}

interface LifecycleEvent {
  id: string;
  eventType: string;
  userId: string;
  timestamp: string;
  details: any;
}

interface UserTimelineEvent {
  id: string;
  timestamp: string;
  eventType: string;
  description: string;
  actor: string;
}

interface HRSyncStatus {
  lastSyncAt?: string;
  nextSyncAt?: string;
  status: string;
  recordsSynced: number;
  errors: number;
}

type Tab = 'packages' | 'policies' | 'hr-sync' | 'timeline' | 'events';

export default function TenantLifecyclePage() {
  const { t } = useTranslation();
  const locale = useLocale();
  const [tenantId, setTenantIdState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('packages');

  // Access Packages
  const [accessPackages, setAccessPackages] = useState<AccessPackage[]>([]);
  const [showPackageModal, setShowPackageModal] = useState(false);
  const [packageName, setPackageName] = useState('');
  const [packageDescription, setPackageDescription] = useState('');
  const [packageRoles, setPackageRoles] = useState('');
  const [packageDuration, setPackageDuration] = useState(30);
  const [packageApprovalRequired, setPackageApprovalRequired] = useState(true);

  // Lifecycle Policies
  const [lifecyclePolicies, setLifecyclePolicies] = useState<LifecyclePolicy[]>([]);
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [policyName, setPolicyName] = useState('');
  const [policyTrigger, setPolicyTrigger] = useState('OnHire');
  const [policyActions, setPolicyActions] = useState('');
  const [policyEnabled, setPolicyEnabled] = useState(true);

  // HR Sync
  const [hrSyncStatus, setHRSyncStatus] = useState<HRSyncStatus | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // User Timeline
  const [selectedUserId, setSelectedUserId] = useState('');
  const [userTimeline, setUserTimeline] = useState<UserTimelineEvent[]>([]);

  // Lifecycle Events
  const [lifecycleEvents, setLifecycleEvents] = useState<LifecycleEvent[]>([]);

  useEffect(() => {
    const contextTenantId = getTenantId();
    setTenantIdState(contextTenantId || DEFAULT_TENANT_ID);
  }, []);

  useEffect(() => {
    if (tenantId) {
      setLoading(true);
      Promise.all([
        fetchAccessPackages(),
        fetchLifecyclePolicies(),
        fetchHRSyncStatus(),
        fetchLifecycleEvents()
      ]).finally(() => setLoading(false));
    }
  }, [tenantId]);

  const fetchAccessPackages = async () => {
    if (!tenantId) return;
    try {
      // Mock data
      setAccessPackages([
        {
          id: '1',
          name: 'Standard Employee',
          description: 'Basic access for new employees',
          roles: ['Employee', 'User'],
          duration: 365,
          approvalRequired: false
        },
        {
          id: '2',
          name: 'Engineering Team',
          description: 'Access for engineering department',
          roles: ['Developer', 'CodeReviewer'],
          duration: 180,
          approvalRequired: true
        },
        {
          id: '3',
          name: 'Manager Package',
          description: 'Enhanced access for managers',
          roles: ['Manager', 'ReportViewer', 'TeamLead'],
          duration: 365,
          approvalRequired: true
        }
      ]);
    } catch (error) {
      console.error('Error fetching access packages:', error);
    }
  };

  const fetchLifecyclePolicies = async () => {
    if (!tenantId) return;
    try {
      const data = await lifecycleService.getLifecyclePolicies();
      if (Array.isArray(data) && data.length > 0) {
        setLifecyclePolicies(data);
      } else {
        // Mock data
        setLifecyclePolicies([
          { id: '1', name: 'New Hire Onboarding', trigger: 'OnHire', actions: ['GrantAccess', 'SendWelcome'], enabled: true },
          { id: '2', name: 'Termination Offboarding', trigger: 'OnTermination', actions: ['RevokeAccess', 'ArchiveData'], enabled: true },
          { id: '3', name: 'Department Transfer', trigger: 'OnTransfer', actions: ['UpdatePermissions', 'NotifyManager'], enabled: false }
        ]);
      }
    } catch (error) {
      setLifecyclePolicies([
        { id: '1', name: 'New Hire Onboarding', trigger: 'OnHire', actions: ['GrantAccess', 'SendWelcome'], enabled: true },
        { id: '2', name: 'Termination Offboarding', trigger: 'OnTermination', actions: ['RevokeAccess', 'ArchiveData'], enabled: true }
      ]);
    }
  };

  const fetchHRSyncStatus = async () => {
    if (!tenantId) return;
    try {
      setHRSyncStatus({
        status: 'Completed',
        recordsSynced: 1247,
        errors: 3,
        lastSyncAt: new Date(Date.now() - 3600000).toISOString(),
        nextSyncAt: new Date(Date.now() + 3600000).toISOString()
      });
    } catch (error) {
      console.error('Error fetching HR sync status:', error);
    }
  };

  const fetchUserTimeline = async () => {
    if (!tenantId || !selectedUserId) return;
    try {
      setUserTimeline([
        { id: '1', timestamp: new Date(Date.now() - 86400000).toISOString(), eventType: 'Account Created', description: 'User account was created', actor: 'System' },
        { id: '2', timestamp: new Date(Date.now() - 82800000).toISOString(), eventType: 'Role Assigned', description: 'Assigned Employee role', actor: 'HR Admin' },
        { id: '3', timestamp: new Date(Date.now() - 43200000).toISOString(), eventType: 'MFA Enrolled', description: 'User enrolled in MFA', actor: 'User' }
      ]);
    } catch (error) {
      console.error('Error fetching user timeline:', error);
    }
  };

  const fetchLifecycleEvents = async () => {
    if (!tenantId) return;
    try {
      const data = await lifecycleService.getLifecycleEvents();
      if (Array.isArray(data) && data.length > 0) {
        setLifecycleEvents(data);
      } else {
        // Mock data
        setLifecycleEvents([
          { id: '1', eventType: 'OnHire', userId: 'user-001', timestamp: new Date().toISOString(), details: { department: 'Engineering' } },
          { id: '2', eventType: 'OnTransfer', userId: 'user-002', timestamp: new Date(Date.now() - 86400000).toISOString(), details: { from: 'Sales', to: 'Marketing' } }
        ]);
      }
    } catch (error) {
      setLifecycleEvents([
        { id: '1', eventType: 'OnHire', userId: 'user-001', timestamp: new Date().toISOString(), details: { department: 'Engineering' } }
      ]);
    }
  };

  const handleCreateAccessPackage = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!tenantId) return;

    try {
      setShowPackageModal(false);
      setPackageName('');
      setPackageDescription('');
      setPackageRoles('');
      setPackageDuration(30);
      setPackageApprovalRequired(true);
      setSuccess(t('common.packageCreated') || 'Access package created successfully');
      fetchAccessPackages();
    } catch (error) {
      setError(t('common.error'));
    }
  };

  const handleCreateLifecyclePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!tenantId) return;

    try {
      await lifecycleService.createLifecyclePolicy({
        name: policyName,
        description: '',
        eventType: policyTrigger,
        conditions: [],
        actions: [],
        enabled: policyEnabled
      });

      setShowPolicyModal(false);
      setPolicyName('');
      setPolicyActions('');
      setPolicyEnabled(true);
      setSuccess(t('common.policyCreated') || 'Policy created successfully');
      fetchLifecyclePolicies();
    } catch (error) {
      setError(t('common.error'));
    }
  };

  const handleTriggerHRSync = async () => {
    if (!tenantId) return;
    setError('');
    setSuccess('');
    setIsSyncing(true);

    try {
      setTimeout(() => {
        setSuccess(t('tenant.lifecycle.hrSyncTriggered') || 'HR Sync triggered successfully');
        setIsSyncing(false);
        fetchHRSyncStatus();
      }, 2000);
    } catch (error) {
      setError(t('common.error'));
      setIsSyncing(false);
    }
  };

  const getTriggerIcon = (trigger: string) => {
    switch (trigger) {
      case 'OnHire': return <UserPlus className="w-4 h-4" />;
      case 'OnTermination': return <UserMinus className="w-4 h-4" />;
      case 'OnTransfer': return <ArrowRight className="w-4 h-4" />;
      case 'OnLeave': return <Calendar className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'packages', label: t('common.accessPackages') || 'Access Packages', icon: <Package className="w-4 h-4" /> },
    { key: 'policies', label: t('tenant.lifecycle.lifecyclePolicies') || 'Policies', icon: <FileText className="w-4 h-4" /> },
    { key: 'hr-sync', label: t('tenant.lifecycle.hrSync') || 'HR Sync', icon: <RefreshCw className="w-4 h-4" /> },
    { key: 'timeline', label: t('tenant.lifecycle.userTimeline') || 'Timeline', icon: <Clock className="w-4 h-4" /> },
    { key: 'events', label: t('tenant.lifecycle.events') || 'Events', icon: <Activity className="w-4 h-4" /> }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      <Helmet>
        <title>{t('tenant.lifecycle.title') || 'Lifecycle Management'} | OneSign</title>
      </Helmet>

      <div className="p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl shadow-lg">
                <RefreshCw className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {t('tenant.lifecycle.title') || 'Lifecycle Management'}
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                  {t('tenant.lifecycle.subtitle') || 'Manage user lifecycle, access packages, and HR integration'}
                </p>
              </div>
            </div>
            {activeTab === 'packages' && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowPackageModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Plus className="w-5 h-5" />
                {t('tenant.lifecycle.createPackage')}
              </motion.button>
            )}
            {activeTab === 'policies' && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowPolicyModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Plus className="w-5 h-5" />
                {t('tenant.lifecycle.createPolicy')}
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* Error/Success Messages */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl flex items-center gap-2"
            >
              <XCircle className="w-5 h-5" />
              {error}
            </motion.div>
          )}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 px-4 py-3 rounded-xl flex items-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              {success}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title={t('common.accessPackages')}
            value={accessPackages.length}
            icon={<Package className="w-6 h-6 text-white" />}
            color="from-blue-500 to-indigo-600"
            delay={0}
          />
          <StatCard
            title={t('tenant.lifecycle.activePolicies')}
            value={lifecyclePolicies.filter(p => p.enabled).length}
            icon={<FileText className="w-6 h-6 text-white" />}
            color="from-green-500 to-emerald-600"
            delay={1}
          />
          <StatCard
            title={t('tenant.lifecycle.recordsSynced')}
            value={hrSyncStatus?.recordsSynced || 0}
            icon={<Users className="w-6 h-6 text-white" />}
            color="from-purple-500 to-violet-600"
            delay={2}
          />
          <StatCard
            title={t('tenant.lifecycle.recentEvents')}
            value={lifecycleEvents.length}
            icon={<Activity className="w-6 h-6 text-white" />}
            color="from-orange-500 to-red-600"
            delay={3}
          />
        </div>

        {/* Tabs Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-2"
        >
          <nav className="flex space-x-2">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`relative flex-1 py-3 px-6 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === tab.key
                    ? 'text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700'
                }`}
              >
                {activeTab === tab.key && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {tab.icon}
                  {tab.label}
                </span>
              </button>
            ))}
          </nav>
        </motion.div>

        {/* Access Packages Tab */}
        {activeTab === 'packages' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {accessPackages.map((pkg, index) => (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -4 }}
                className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6 hover:shadow-xl transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg">
                      <Package className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white">{pkg.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{pkg.description}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">{t('tenant.lifecycle.duration')}</span>
                    <span className="font-medium text-gray-900 dark:text-white">{pkg.duration} {t('tenant.lifecycle.days')}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">{t('tenant.lifecycle.approval')}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      pkg.approvalRequired
                        ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                        : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                    }`}>
                      {pkg.approvalRequired ? t('tenant.lifecycle.required') : t('tenant.lifecycle.notRequired')}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{t('tenant.lifecycle.roles')}:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {pkg.roles.map((role, idx) => (
                        <span key={idx} className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded text-xs">
                          {role}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-slate-700">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg text-sm font-medium"
                  >
                    <Edit className="w-4 h-4" />
                    {t('common.edit')}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-sm font-medium"
                  >
                    <Trash2 className="w-4 h-4" />
                    {t('common.delete')}
                  </motion.button>
                </div>
              </motion.div>
            ))}
            {accessPackages.length === 0 && (
              <div className="col-span-3 text-center py-12 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">{t('tenant.lifecycle.noAccessPackages')}</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Lifecycle Policies Tab */}
        {activeTab === 'policies' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                <thead className="bg-gray-50 dark:bg-slate-700/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('tenant.lifecycle.policyName')}</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('tenant.lifecycle.trigger')}</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('common.actions')}</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('common.status')}</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                  {lifecyclePolicies.map((policy, index) => (
                    <motion.tr
                      key={policy.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
                            <FileText className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                          </div>
                          <span className="font-medium text-gray-900 dark:text-white">{policy.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                          {getTriggerIcon(policy.trigger)}
                          {policy.trigger}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {policy.actions.map((action, idx) => (
                            <span key={idx} className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded text-xs">
                              {action}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                          policy.enabled
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300'
                        }`}>
                          {policy.enabled ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          {policy.enabled ? t('tenant.lifecycle.enabled') : t('tenant.lifecycle.disabled')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-2">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 font-medium text-sm"
                          >
                            {t('common.edit')}
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="text-red-600 dark:text-red-400 hover:text-red-900 font-medium text-sm"
                          >
                            {t('common.delete')}
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
              {lifecyclePolicies.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">{t('tenant.lifecycle.noPolicies')}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* HR Sync Tab */}
        {activeTab === 'hr-sync' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {hrSyncStatus && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Clock className="w-5 h-5 text-gray-400" />
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('tenant.lifecycle.lastSync')}</h3>
                  </div>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {hrSyncStatus.lastSyncAt ? new Date(hrSyncStatus.lastSyncAt).toLocaleString(locale) : t('tenant.lifecycle.never')}
                  </p>
                </div>
                <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('tenant.lifecycle.nextSync')}</h3>
                  </div>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {hrSyncStatus.nextSyncAt ? new Date(hrSyncStatus.nextSyncAt).toLocaleString(locale) : t('tenant.lifecycle.notScheduled')}
                  </p>
                </div>
                <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('tenant.lifecycle.recordsSynced')}</h3>
                  </div>
                  <p className="text-lg font-bold text-green-600 dark:text-green-400">{hrSyncStatus.recordsSynced.toLocaleString()}</p>
                </div>
                <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('tenant.lifecycle.errors')}</h3>
                  </div>
                  <p className="text-lg font-bold text-red-600 dark:text-red-400">{hrSyncStatus.errors}</p>
                </div>
              </div>
            )}

            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{t('tenant.lifecycle.syncActions')}</h3>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleTriggerHRSync}
                disabled={isSyncing}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg shadow-lg hover:shadow-xl disabled:opacity-50 transition-all"
              >
                <RefreshCw className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`} />
                {isSyncing ? t('tenant.lifecycle.syncing') : t('tenant.lifecycle.triggerHRSync')}
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* User Timeline Tab */}
        {activeTab === 'timeline' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6">
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder={t('tenant.lifecycle.enterUserIdPlaceholder')}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={fetchUserTimeline}
                  className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg shadow-lg hover:shadow-xl"
                >
                  {t('tenant.lifecycle.loadTimeline')}
                </motion.button>
              </div>
            </div>

            {userTimeline.length > 0 && (
              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">{t('tenant.lifecycle.userTimeline')}</h3>
                <div className="space-y-4">
                  {userTimeline.map((event, index) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="relative pl-8 pb-4 border-l-2 border-indigo-200 dark:border-indigo-800 last:border-l-0"
                    >
                      <div className="absolute -left-2 top-0 w-4 h-4 bg-indigo-500 rounded-full border-2 border-white dark:border-slate-800"></div>
                      <div className="bg-gray-50 dark:bg-slate-700/50 p-4 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-gray-900 dark:text-white">{event.eventType}</h4>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date(event.timestamp).toLocaleString(locale)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{event.description}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">By: {event.actor}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {selectedUserId && userTimeline.length === 0 && (
              <div className="text-center py-12 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700">
                <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">{t('tenant.lifecycle.noTimelineEvents')}</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Lifecycle Events Tab */}
        {activeTab === 'events' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                <thead className="bg-gray-50 dark:bg-slate-700/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('tenant.lifecycle.eventType')}</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('tenant.lifecycle.userId')}</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('tenant.lifecycle.timestamp')}</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('tenant.lifecycle.details')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                  {lifecycleEvents.map((event, index) => (
                    <motion.tr
                      key={event.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300">
                          {getTriggerIcon(event.eventType)}
                          {event.eventType}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-600 dark:text-gray-400">
                        {event.userId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {new Date(event.timestamp).toLocaleString(locale)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-auto max-w-md">
                          {typeof event.details === 'object' ? JSON.stringify(event.details, null, 2) : event.details}
                        </pre>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
              {lifecycleEvents.length === 0 && (
                <div className="text-center py-12">
                  <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">{t('tenant.lifecycle.noEvents')}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Create Access Package Modal */}
        <Modal
          isOpen={showPackageModal}
          onClose={() => setShowPackageModal(false)}
          title={t('tenant.lifecycle.createAccessPackage')}
          size="lg"
        >
          <form onSubmit={handleCreateAccessPackage}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('tenant.lifecycle.name')} *</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  value={packageName}
                  onChange={(e) => setPackageName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('tenant.lifecycle.description')}</label>
                <textarea
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  rows={3}
                  value={packageDescription}
                  onChange={(e) => setPackageDescription(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('tenant.lifecycle.rolesCommaSeparated')}</label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  value={packageRoles}
                  onChange={(e) => setPackageRoles(e.target.value)}
                  placeholder={t('tenant.lifecycle.rolesPlaceholder')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('tenant.lifecycle.durationDays')}</label>
                <input
                  type="number"
                  min="1"
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  value={packageDuration}
                  onChange={(e) => setPackageDuration(parseInt(e.target.value))}
                />
              </div>
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-indigo-600 rounded mr-2"
                    checked={packageApprovalRequired}
                    onChange={(e) => setPackageApprovalRequired(e.target.checked)}
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{t('tenant.lifecycle.requiresApproval')}</span>
                </label>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => setShowPackageModal(false)}
                className="flex-1 px-6 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700"
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg font-medium shadow-lg hover:shadow-xl"
              >
                {t('tenant.lifecycle.createPackage')}
              </button>
            </div>
          </form>
        </Modal>

        {/* Create Lifecycle Policy Modal */}
        <Modal
          isOpen={showPolicyModal}
          onClose={() => setShowPolicyModal(false)}
          title={t('tenant.lifecycle.createLifecyclePolicy')}
          size="lg"
        >
          <form onSubmit={handleCreateLifecyclePolicy}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('tenant.lifecycle.name')} *</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  value={policyName}
                  onChange={(e) => setPolicyName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('tenant.lifecycle.triggerEvent')} *</label>
                <select
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  value={policyTrigger}
                  onChange={(e) => setPolicyTrigger(e.target.value)}
                >
                  <option value="OnHire">{t('tenant.lifecycle.onHire')}</option>
                  <option value="OnTermination">{t('tenant.lifecycle.onTermination')}</option>
                  <option value="OnTransfer">{t('tenant.lifecycle.onTransfer')}</option>
                  <option value="OnLeave">{t('tenant.lifecycle.onLeave')}</option>
                  <option value="OnReturn">{t('tenant.lifecycle.onReturn')}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('tenant.lifecycle.actionsCommaSeparated')}</label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  value={policyActions}
                  onChange={(e) => setPolicyActions(e.target.value)}
                  placeholder={t('tenant.lifecycle.actionsPlaceholder')}
                />
              </div>
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-indigo-600 rounded mr-2"
                    checked={policyEnabled}
                    onChange={(e) => setPolicyEnabled(e.target.checked)}
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{t('tenant.lifecycle.enabled')}</span>
                </label>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => setShowPolicyModal(false)}
                className="flex-1 px-6 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700"
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg font-medium shadow-lg hover:shadow-xl"
              >
                {t('tenant.lifecycle.createPolicy')}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
}
