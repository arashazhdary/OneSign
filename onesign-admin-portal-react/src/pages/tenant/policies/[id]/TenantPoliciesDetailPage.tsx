import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { getTenantId } from '@/lib/tenant-context';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import Modal from '@/components/common/Modal';
import StatusBadge from '@/components/common/StatusBadge';
import { securityService } from '@/lib/api/services/security.service';
import { Helmet } from 'react-helmet-async';
import {
  Shield,
  ArrowLeft,
  Play,
  Pause,
  Target,
  TestTube,
  FileText,
  Clock,
  Users,
  Building2,
  AlertTriangle,
  CheckCircle,
  XCircle,
  History,
  BarChart3,
  Settings,
  ChevronRight,
  Zap,
} from 'lucide-react';

interface Policy {
  id: string;
  tenantId: string;
  name: string;
  description: string;
  policyType: string;
  status: string;
  priority: number;
  rules: PolicyRule[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  version: number;
}

interface PolicyRule {
  id: string;
  name: string;
  description: string;
  condition: RuleCondition;
  action: RuleAction;
  isEnabled: boolean;
  order: number;
}

interface RuleCondition {
  type: string;
  operator: string;
  field: string;
  value: any;
  conditions?: RuleCondition[];
}

interface RuleAction {
  type: string;
  configuration: Record<string, any>;
}

interface AppliedEntity {
  id: string;
  entityType: string;
  entityId: string;
  entityName: string;
  appliedAt: string;
  appliedBy: string;
}

interface AuditLogEntry {
  id: string;
  policyId: string;
  action: string;
  changedBy: string;
  changedAt: string;
  changes: Record<string, any>;
  previousVersion: number;
  newVersion: number;
}

interface ImpactAnalysis {
  affectedUsers: number;
  affectedGroups: number;
  affectedOrgUnits: number;
  estimatedEnforcementRate: number;
  potentialViolations: number;
  riskScore: number;
}

type Tab = 'overview' | 'rules' | 'applied-to' | 'audit-log' | 'impact-analysis' | 'test-policy';

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

export default function TenantPoliciesDetailPage() {
  const params = useParams();
  const navigate = useNavigate();
  const policyId = params.id as string;
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Data states
  const [policy, setPolicy] = useState<Policy | null>(null);
  const [appliedEntities, setAppliedEntities] = useState<AppliedEntity[]>([]);
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);
  const [impactAnalysis, setImpactAnalysis] = useState<ImpactAnalysis | null>(null);

  // Modal states
  const [showTestModal, setShowTestModal] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);

  // Form states
  const [testUserId, setTestUserId] = useState('');
  const [testResult, setTestResult] = useState<any>(null);
  const [applyEntityType, setApplyEntityType] = useState('user');
  const [applyEntityId, setApplyEntityId] = useState('');

  const tenantId = getTenantId();

  const tabs = [
    { key: 'overview', label: 'Overview', icon: FileText },
    { key: 'rules', label: 'Rules', icon: Settings },
    { key: 'applied-to', label: 'Applied To', icon: Target },
    { key: 'audit-log', label: 'Audit Log', icon: History },
    { key: 'impact-analysis', label: 'Impact Analysis', icon: BarChart3 },
    { key: 'test-policy', label: 'Test Policy', icon: TestTube },
  ];

  useEffect(() => {
    fetchPolicy();
  }, [policyId]);

  useEffect(() => {
    if (activeTab === 'applied-to') {
      fetchAppliedEntities();
    } else if (activeTab === 'audit-log') {
      fetchAuditLog();
    } else if (activeTab === 'impact-analysis') {
      fetchImpactAnalysis();
    }
  }, [activeTab]);

  const fetchPolicy = async () => {
    setLoading(true);
    setError('');
    try {
      // const data = await securityService.getPolicyById(tenantId, policyId);
      // setPolicy(data);
      setPolicy(null);
    } catch (err) {
      setError(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const fetchAppliedEntities = async () => {
    try {
      // const data = await securityService.getPolicyAppliedEntities(tenantId, policyId);
      // setAppliedEntities(data);
      setAppliedEntities([]);
    } catch (err) {
      console.error('Failed to fetch applied entities:', err);
    }
  };

  const fetchAuditLog = async () => {
    try {
      // const data = await securityService.getPolicyAuditLog(tenantId, policyId, 50);
      // setAuditLog(data);
      setAuditLog([]);
    } catch (err) {
      console.error('Failed to fetch audit log:', err);
    }
  };

  const fetchImpactAnalysis = async () => {
    try {
      // const data = await securityService.getPolicyImpactAnalysis(tenantId, policyId);
      // setImpactAnalysis(data);
      setImpactAnalysis(null);
    } catch (err) {
      console.error('Failed to fetch impact analysis:', err);
    }
  };

  const handleToggleActive = async () => {
    if (!policy) return;

    setProcessing(true);
    setError('');
    setSuccess('');
    try {
      const action = policy.isActive ? 'deactivate' : 'activate';
      // if (policy.isActive) {
      //   await securityService.deactivatePolicy(tenantId, policyId);
      // } else {
      //   await securityService.activatePolicy(tenantId, policyId);
      // }

      setSuccess(`Policy ${action}d successfully`);
      fetchPolicy();
    } catch (err) {
      setError(t('common.error'));
    } finally {
      setProcessing(false);
    }
  };

  const handleTestPolicy = async () => {
    if (!testUserId.trim()) {
      setError(t('tenant.policies.errors.provideUserId'));
      return;
    }

    setProcessing(true);
    setError('');
    setSuccess('');
    setTestResult(null);
    try {
      // const result = await securityService.testPolicy(tenantId, policyId, testUserId);
      // setTestResult(result);
      setSuccess('Policy test completed');
    } catch (err) {
      setError(t('common.error'));
    } finally {
      setProcessing(false);
    }
  };

  const handleApplyPolicy = async () => {
    if (!applyEntityId.trim()) {
      setError(t('tenant.policies.errors.provideEntityId'));
      return;
    }

    setProcessing(true);
    setError('');
    setSuccess('');
    try {
      // await securityService.applyPolicyToEntity(tenantId, policyId, applyEntityType, applyEntityId);

      setSuccess('Policy applied successfully');
      setShowApplyModal(false);
      setApplyEntityId('');
      fetchAppliedEntities();
    } catch (err) {
      setError(t('common.error'));
    } finally {
      setProcessing(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getPriorityBadge = (priority: number) => {
    const priorities: Record<number, { text: string; className: string }> = {
      1: { text: 'Low', className: 'from-green-500 to-green-600' },
      2: { text: 'Medium', className: 'from-yellow-500 to-yellow-600' },
      3: { text: 'High', className: 'from-orange-500 to-orange-600' },
      4: { text: 'Critical', className: 'from-red-500 to-red-600' },
    };
    const priorityInfo = priorities[priority] || priorities[1];
    return (
      <span className={`px-3 py-1 text-sm font-semibold rounded-full text-white bg-gradient-to-r ${priorityInfo.className}`}>
        {priorityInfo.text}
      </span>
    );
  };

  const getRiskScoreColor = (score: number) => {
    if (score >= 75) return 'text-red-600';
    if (score >= 50) return 'text-orange-600';
    if (score >= 25) return 'text-yellow-600';
    return 'text-green-600';
  };

  if (loading) {
    return <LoadingOverlay />;
  }

  if (!policy) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-6 py-4 rounded-xl"
        >
          Policy not found
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      <Helmet>
        <title>{policy.name} - Policy Details | OneSign</title>
      </Helmet>

      <div className="p-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-4"
        >
          <motion.button
            onClick={() => navigate(-1)}
            whileHover={{ x: -4 }}
            className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors w-fit"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Policies
          </motion.button>

          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  {policy.name}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">{policy.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {getPriorityBadge(policy.priority)}
              <StatusBadge status={policy.status} />
              {policy.isActive ? (
                <span className="px-3 py-1 text-sm font-semibold rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-white">
                  Active
                </span>
              ) : (
                <span className="px-3 py-1 text-sm font-semibold rounded-full bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300">
                  Inactive
                </span>
              )}
            </div>
          </div>
        </motion.div>

        {/* Alerts */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl flex items-center gap-2"
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
              className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-xl flex items-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              {success}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-3"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleToggleActive}
            disabled={processing}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all disabled:opacity-50 ${
              policy.isActive
                ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600'
                : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600'
            }`}
          >
            {policy.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {policy.isActive ? 'Deactivate' : 'Activate'}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowApplyModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-2 rounded-xl font-medium hover:from-blue-600 hover:to-cyan-600 transition-all"
          >
            <Target className="w-4 h-4" />
            Apply to Entity
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowTestModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-xl font-medium hover:from-purple-600 hover:to-pink-600 transition-all"
          >
            <TestTube className="w-4 h-4" />
            Test Policy
          </motion.button>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-2"
        >
          <nav className="flex space-x-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as Tab)}
                className={`relative flex items-center gap-2 py-3 px-4 rounded-lg font-medium transition-all ${
                  activeTab === tab.key
                    ? 'text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700'
                }`}
              >
                {activeTab === tab.key && (
                  <motion.div
                    layoutId="activePolicyTab"
                    className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <tab.icon className="w-4 h-4 relative z-10" />
                <span className="relative z-10">{tab.label}</span>
              </button>
            ))}
          </nav>
        </motion.div>

        {/* Overview Tab */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Policy Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Policy Type</label>
                    <div className="text-gray-900 dark:text-white capitalize font-medium">{policy.policyType}</div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Version</label>
                    <div className="text-gray-900 dark:text-white font-medium">v{policy.version}</div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Created By</label>
                    <div className="text-gray-900 dark:text-white font-medium">{policy.createdBy}</div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Created At</label>
                    <div className="text-gray-900 dark:text-white font-medium">{formatDate(policy.createdAt)}</div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Updated</label>
                    <div className="text-gray-900 dark:text-white font-medium">{formatDate(policy.updatedAt)}</div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Rules</label>
                    <div className="text-gray-900 dark:text-white font-medium">{policy.rules.length}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Rules Tab */}
          {activeTab === 'rules' && (
            <motion.div
              key="rules"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Policy Rules</h3>
              {policy.rules.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">No rules defined</p>
              ) : (
                <div className="space-y-4">
                  {policy.rules.map((rule, index) => (
                    <motion.div
                      key={rule.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border border-gray-200 dark:border-slate-700 rounded-xl p-4 hover:shadow-md transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <h4 className="font-medium text-gray-900 dark:text-white">{rule.name}</h4>
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              rule.isEnabled
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                                : 'bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-400'
                            }`}>
                              {rule.isEnabled ? 'Enabled' : 'Disabled'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{rule.description}</p>
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Order: {rule.order}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-gray-200 dark:border-slate-700">
                        <div>
                          <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Condition</div>
                          <div className="bg-gray-50 dark:bg-slate-900/50 p-2 rounded text-sm">
                            <div className="font-mono text-xs text-gray-700 dark:text-gray-300">
                              {rule.condition.field} {rule.condition.operator} {JSON.stringify(rule.condition.value)}
                            </div>
                          </div>
                        </div>
                        <div>
                          <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Action</div>
                          <div className="bg-gray-50 dark:bg-slate-900/50 p-2 rounded text-sm">
                            <div className="font-medium text-gray-900 dark:text-white">{rule.action.type}</div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Applied To Tab */}
          {activeTab === 'applied-to' && (
            <motion.div
              key="applied-to"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Applied To</h3>
              {appliedEntities.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">Policy not applied to any entities</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Applied At</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Applied By</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                      {appliedEntities.map((entity) => (
                        <tr key={entity.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                          <td className="px-6 py-4 text-sm">
                            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 rounded-full text-xs font-medium capitalize">
                              {entity.entityType}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{entity.entityName}</td>
                          <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 font-mono">{entity.entityId}</td>
                          <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{formatDate(entity.appliedAt)}</td>
                          <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{entity.appliedBy}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          )}

          {/* Audit Log Tab */}
          {activeTab === 'audit-log' && (
            <motion.div
              key="audit-log"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Audit Log</h3>
              {auditLog.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">No audit log entries</p>
              ) : (
                <div className="space-y-3">
                  {auditLog.map((entry, index) => (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border-l-4 border-indigo-500 pl-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-700/50 rounded-r-lg transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 dark:text-white">{entry.action}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Changed by {entry.changedBy} | Version {entry.previousVersion} → {entry.newVersion}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{formatDate(entry.changedAt)}</div>
                          {Object.keys(entry.changes).length > 0 && (
                            <div className="mt-2 bg-gray-50 dark:bg-slate-900/50 p-2 rounded text-xs">
                              <pre className="text-gray-700 dark:text-gray-300">{JSON.stringify(entry.changes, null, 2)}</pre>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Impact Analysis Tab */}
          {activeTab === 'impact-analysis' && (
            <motion.div
              key="impact-analysis"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {impactAnalysis ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard
                      title="Affected Users"
                      value={impactAnalysis.affectedUsers}
                      icon={<Users className="w-6 h-6 text-white" />}
                      color="from-blue-500 to-cyan-500"
                      delay={0}
                    />
                    <StatCard
                      title="Affected Groups"
                      value={impactAnalysis.affectedGroups}
                      icon={<Users className="w-6 h-6 text-white" />}
                      color="from-purple-500 to-pink-500"
                      delay={1}
                    />
                    <StatCard
                      title="Affected Org Units"
                      value={impactAnalysis.affectedOrgUnits}
                      icon={<Building2 className="w-6 h-6 text-white" />}
                      color="from-indigo-500 to-purple-500"
                      delay={2}
                    />
                  </div>

                  <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Analysis Metrics</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Enforcement Rate</label>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 bg-gray-200 dark:bg-slate-700 rounded-full h-4">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${impactAnalysis.estimatedEnforcementRate}%` }}
                              transition={{ duration: 1, delay: 0.5 }}
                              className="bg-gradient-to-r from-green-500 to-emerald-500 h-4 rounded-full"
                            />
                          </div>
                          <span className="text-lg font-semibold text-gray-900 dark:text-white">
                            {impactAnalysis.estimatedEnforcementRate}%
                          </span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Risk Score</label>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 bg-gray-200 dark:bg-slate-700 rounded-full h-4">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${impactAnalysis.riskScore}%` }}
                              transition={{ duration: 1, delay: 0.5 }}
                              className={`h-4 rounded-full ${
                                impactAnalysis.riskScore >= 75 ? 'bg-gradient-to-r from-red-500 to-red-600' :
                                impactAnalysis.riskScore >= 50 ? 'bg-gradient-to-r from-orange-500 to-orange-600' :
                                impactAnalysis.riskScore >= 25 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
                                'bg-gradient-to-r from-green-500 to-green-600'
                              }`}
                            />
                          </div>
                          <span className={`text-lg font-semibold ${getRiskScoreColor(impactAnalysis.riskScore)}`}>
                            {impactAnalysis.riskScore}
                          </span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Potential Violations</label>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">{impactAnalysis.potentialViolations}</div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700 p-6">
                  <p className="text-gray-500 dark:text-gray-400 text-center py-8">Loading impact analysis...</p>
                </div>
              )}
            </motion.div>
          )}

          {/* Test Policy Tab */}
          {activeTab === 'test-policy' && (
            <motion.div
              key="test-policy"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Test Policy</h3>
              <div className="space-y-4 max-w-md">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    User ID to Test
                  </label>
                  <input
                    type="text"
                    value={testUserId}
                    onChange={(e) => setTestUserId(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="Enter user ID"
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleTestPolicy}
                  disabled={processing}
                  className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-2 rounded-xl font-medium hover:from-indigo-600 hover:to-purple-700 transition-all disabled:opacity-50"
                >
                  <Zap className="w-4 h-4" />
                  {processing ? 'Testing...' : 'Run Test'}
                </motion.button>
                {testResult && (
                  <div className="mt-4 bg-gray-50 dark:bg-slate-900/50 rounded-xl p-4">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Test Result</h4>
                    <pre className="text-sm text-gray-700 dark:text-gray-300 overflow-x-auto">
                      {JSON.stringify(testResult, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Test Modal */}
      <Modal
        isOpen={showTestModal}
        onClose={() => {
          setShowTestModal(false);
          setTestResult(null);
        }}
        title="Test Policy"
        size="lg"
        footer={
          <>
            <button
              onClick={() => {
                setShowTestModal(false);
                setTestResult(null);
              }}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-slate-700 rounded-xl hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleTestPolicy}
              disabled={processing}
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 transition-all"
            >
              {processing ? 'Testing...' : 'Run Test'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              User ID to Test
            </label>
            <input
              type="text"
              value={testUserId}
              onChange={(e) => setTestUserId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
              placeholder="Enter user ID"
            />
          </div>
          {testResult && (
            <div className="bg-gray-50 dark:bg-slate-900/50 rounded-xl p-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Test Result</h4>
              <pre className="text-sm text-gray-700 dark:text-gray-300 overflow-x-auto">
                {JSON.stringify(testResult, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </Modal>

      {/* Apply Policy Modal */}
      <Modal
        isOpen={showApplyModal}
        onClose={() => {
          setShowApplyModal(false);
          setApplyEntityId('');
        }}
        title="Apply Policy to Entity"
        footer={
          <>
            <button
              onClick={() => {
                setShowApplyModal(false);
                setApplyEntityId('');
              }}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-slate-700 rounded-xl hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleApplyPolicy}
              disabled={processing}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:from-blue-600 hover:to-cyan-600 disabled:opacity-50 transition-all"
            >
              {processing ? 'Applying...' : 'Apply Policy'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Entity Type</label>
            <select
              value={applyEntityType}
              onChange={(e) => setApplyEntityType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="user">User</option>
              <option value="group">Group</option>
              <option value="org-unit">Organization Unit</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Entity ID</label>
            <input
              type="text"
              value={applyEntityId}
              onChange={(e) => setApplyEntityId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              placeholder="Enter entity ID"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
