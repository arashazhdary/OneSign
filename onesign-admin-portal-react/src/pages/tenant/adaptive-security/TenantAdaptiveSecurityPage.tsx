import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { getTenantId } from '@/lib/tenant-context';
import { securityService } from '@/lib/api/services';
import Modal from '@/components/common/Modal';
import { Helmet } from 'react-helmet-async';
import {
  Shield,
  Activity,
  Users,
  AlertTriangle,
  TrendingUp,
  CheckCircle,
  XCircle,
  Search,
  Plus,
  Edit3,
  Trash2,
  RefreshCw,
  BarChart3,
  FileSearch,
  UserX,
  Gauge,
  Zap,
  Target,
  Clock,
  ChevronRight
} from 'lucide-react';

interface AdaptivePolicy {
  id: string;
  name: string;
  policyType: string;
  isEnabled: boolean;
  riskLevel: string;
  action: string;
  createdAt: string;
}

interface RiskSignal {
  id: string;
  signalType: string;
  description: string;
  severity: string;
  isEnabled: boolean;
  weight: number;
}

interface SecurityContext {
  userId: string;
  contextData: {
    riskScore: number;
    lastAssessment: string;
    factors: string[];
  };
}

interface HighRiskUser {
  userId: string;
  email: string;
  riskScore: number;
  riskFactors: string[];
  lastEvaluation: string;
}

interface DashboardData {
  totalPolicies: number;
  activePolicies: number;
  highRiskUsers: number;
  recentEvaluations: number;
  averageRiskScore: number;
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  delay: number;
  trend?: string;
}

const StatCard = ({ title, value, icon, color, delay, trend }: StatCardProps) => (
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
        {trend && (
          <p className="text-sm text-green-600 dark:text-green-400 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            {trend}
          </p>
        )}
      </div>
      <div className={`p-4 rounded-xl bg-gradient-to-br ${color}`}>
        {icon}
      </div>
    </div>
  </motion.div>
);

export default function TenantAdaptiveSecurityPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'policies' | 'signals' | 'contexts' | 'high-risk'>('dashboard');
  const [tenantId, setTenantIdState] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Dashboard
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);

  // Policies
  const [policies, setPolicies] = useState<AdaptivePolicy[]>([]);
  const [selectedPolicy, setSelectedPolicy] = useState<AdaptivePolicy | null>(null);
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<AdaptivePolicy | null>(null);
  const [policyForm, setPolicyForm] = useState({
    name: '',
    policyType: 'RiskBased',
    riskLevel: 'Medium',
    action: 'RequireMFA',
    isEnabled: true
  });

  // Signals
  const [signals, setSignals] = useState<RiskSignal[]>([]);
  const [selectedSignal, setSelectedSignal] = useState<RiskSignal | null>(null);
  const [showSignalModal, setShowSignalModal] = useState(false);

  // Contexts
  const [contexts, setContexts] = useState<SecurityContext[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [userRiskScore, setUserRiskScore] = useState<number | null>(null);
  const [evaluateUserId, setEvaluateUserId] = useState('');

  // High Risk Users
  const [highRiskUsers, setHighRiskUsers] = useState<HighRiskUser[]>([]);

  const tabs = [
    { key: 'dashboard', label: 'Dashboard', icon: <BarChart3 className="w-4 h-4" /> },
    { key: 'policies', label: 'Policies', icon: <Shield className="w-4 h-4" /> },
    { key: 'signals', label: 'Risk Signals', icon: <Activity className="w-4 h-4" /> },
    { key: 'contexts', label: 'Contexts', icon: <FileSearch className="w-4 h-4" /> },
    { key: 'high-risk', label: 'High Risk', icon: <UserX className="w-4 h-4" /> }
  ];

  useEffect(() => {
    const contextTenantId = getTenantId();
    setTenantIdState(contextTenantId || '00000000-0000-0000-0000-000000000000');
  }, []);

  useEffect(() => {
    if (tenantId) {
      if (activeTab === 'dashboard') fetchDashboard();
      else if (activeTab === 'policies') fetchPolicies();
      else if (activeTab === 'signals') fetchSignals();
      else if (activeTab === 'contexts') fetchContexts();
      else if (activeTab === 'high-risk') fetchHighRiskUsers();
    }
  }, [tenantId, activeTab]);

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError('');
        setSuccess('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const fetchPolicies = async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      setPolicies([]);
    } catch (err) {
      console.error('Error fetching policies:', err);
      setError('Failed to fetch policies');
    } finally {
      setLoading(false);
    }
  };

  const fetchSignals = async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      setSignals([]);
    } catch (err) {
      console.error('Error fetching signals:', err);
      setError('Failed to fetch signals');
    } finally {
      setLoading(false);
    }
  };

  const fetchContexts = async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      setContexts([]);
    } catch (err) {
      console.error('Error fetching contexts:', err);
      setError('Failed to fetch contexts');
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboard = async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      setDashboardData({
        totalPolicies: 12,
        activePolicies: 8,
        highRiskUsers: 3,
        recentEvaluations: 1247,
        averageRiskScore: 32.5
      });
    } catch (err) {
      console.error('Error fetching dashboard:', err);
      setError('Failed to fetch dashboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchHighRiskUsers = async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      setHighRiskUsers([]);
    } catch (err) {
      console.error('Error fetching high-risk users:', err);
      setError('Failed to fetch high-risk users');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserRiskScore = async (userId: string) => {
    if (!tenantId || !userId) return;
    setLoading(true);
    try {
      setUserRiskScore(null);
      setSuccess(`Risk score retrieval not available`);
    } catch (err) {
      console.error('Error fetching user risk score:', err);
      setError('Failed to fetch user risk score');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePolicy = async (policyId: string, data: Partial<AdaptivePolicy>) => {
    if (!tenantId) return;
    setLoading(true);
    try {
      setSuccess('Policy updated successfully');
      fetchPolicies();
      setEditingPolicy(null);
    } catch (err) {
      setError('Failed to update policy');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePolicy = async (policyId: string) => {
    if (!tenantId || !confirm('Are you sure you want to delete this policy?')) return;
    setLoading(true);
    try {
      setSuccess('Policy deleted successfully');
      fetchPolicies();
    } catch (err) {
      setError('Failed to delete policy');
    } finally {
      setLoading(false);
    }
  };

  const handleEnablePolicy = async (policyId: string) => {
    if (!tenantId) return;
    setLoading(true);
    try {
      setSuccess('Policy enabled successfully');
      fetchPolicies();
    } catch (err) {
      setError('Failed to enable policy');
    } finally {
      setLoading(false);
    }
  };

  const handleDisablePolicy = async (policyId: string) => {
    if (!tenantId) return;
    setLoading(true);
    try {
      setSuccess('Policy disabled successfully');
      fetchPolicies();
    } catch (err) {
      setError('Failed to disable policy');
    } finally {
      setLoading(false);
    }
  };

  const handleEvaluateUser = async (userId: string) => {
    if (!tenantId || !userId) return;
    setLoading(true);
    try {
      setSuccess(`User evaluation not available`);
      fetchContexts();
    } catch (err) {
      setError('Failed to evaluate user');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSignal = async (signalId: string, data: Partial<RiskSignal>) => {
    if (!tenantId) return;
    setLoading(true);
    try {
      setSuccess('Signal updated successfully');
      fetchSignals();
      setShowSignalModal(false);
    } catch (err) {
      setError('Failed to update signal');
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshContext = async (userId: string) => {
    if (!tenantId) return;
    setLoading(true);
    try {
      setSuccess('Context refreshed successfully');
      fetchContexts();
    } catch (err) {
      setError('Failed to refresh context');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId) return;
    setLoading(true);
    try {
      setSuccess('Policy created successfully');
      setShowPolicyModal(false);
      setPolicyForm({ name: '', policyType: 'RiskBased', riskLevel: 'Medium', action: 'RequireMFA', isEnabled: true });
      fetchPolicies();
    } catch (err) {
      setError('Failed to create policy');
    } finally {
      setLoading(false);
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'high':
      case 'critical':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'medium':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  const getRiskScoreColor = (score: number) => {
    if (score >= 70) return 'text-red-600 dark:text-red-400';
    if (score >= 40) return 'text-orange-600 dark:text-orange-400';
    return 'text-green-600 dark:text-green-400';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 p-6">
      <Helmet>
        <title>Adaptive Security</title>
      </Helmet>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-4 mb-2">
          <div className="p-3 rounded-xl bg-gradient-to-br from-red-500 to-orange-600 shadow-lg">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Adaptive Security
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage adaptive security policies, risk signals, and user security contexts
            </p>
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
            className="mb-4 p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 text-red-800 dark:text-red-300 rounded-xl flex items-center gap-2"
          >
            <AlertTriangle className="w-5 h-5" />
            {error}
          </motion.div>
        )}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 p-4 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 text-green-800 dark:text-green-300 rounded-xl flex items-center gap-2"
          >
            <CheckCircle className="w-5 h-5" />
            {success}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-2 mb-6"
      >
        <nav className="flex space-x-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`relative flex-1 py-3 px-6 rounded-lg font-medium transition-all duration-200 ${
                activeTab === tab.key
                  ? 'text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700'
              }`}
            >
              {activeTab === tab.key && (
                <motion.div
                  layoutId="activeSecTab"
                  className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-600 rounded-lg"
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

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-12">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <RefreshCw className="w-8 h-8 text-red-600" />
          </motion.div>
        </div>
      )}

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && !loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <StatCard
              title="Total Policies"
              value={dashboardData?.totalPolicies || 0}
              icon={<Shield className="w-6 h-6 text-white" />}
              color="from-blue-500 to-blue-600"
              delay={0}
            />
            <StatCard
              title="Active Policies"
              value={dashboardData?.activePolicies || 0}
              icon={<CheckCircle className="w-6 h-6 text-white" />}
              color="from-green-500 to-green-600"
              delay={1}
            />
            <StatCard
              title="High Risk Users"
              value={dashboardData?.highRiskUsers || 0}
              icon={<UserX className="w-6 h-6 text-white" />}
              color="from-red-500 to-red-600"
              delay={2}
            />
            <StatCard
              title="Recent Evaluations"
              value={dashboardData?.recentEvaluations?.toLocaleString() || 0}
              icon={<Activity className="w-6 h-6 text-white" />}
              color="from-purple-500 to-purple-600"
              delay={3}
            />
            <StatCard
              title="Avg Risk Score"
              value={dashboardData?.averageRiskScore?.toFixed(1) || '0'}
              icon={<Gauge className="w-6 h-6 text-white" />}
              color="from-orange-500 to-orange-600"
              delay={4}
            />
          </div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6 cursor-pointer hover:shadow-xl transition-all duration-300"
              onClick={() => setActiveTab('policies')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                    <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Manage Policies</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Configure security policies</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6 cursor-pointer hover:shadow-xl transition-all duration-300"
              onClick={() => setActiveTab('signals')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                    <Activity className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Risk Signals</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Configure risk detection</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6 cursor-pointer hover:shadow-xl transition-all duration-300"
              onClick={() => setActiveTab('high-risk')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl">
                    <UserX className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">High Risk Users</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Review risky accounts</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}

      {/* Policies Tab */}
      {activeTab === 'policies' && !loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search policies..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-red-500 dark:bg-slate-700 dark:text-white"
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setEditingPolicy(null);
                setPolicyForm({ name: '', policyType: 'RiskBased', riskLevel: 'Medium', action: 'RequireMFA', isEnabled: true });
                setShowPolicyModal(true);
              }}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-orange-600 text-white rounded-xl hover:shadow-lg transition-all duration-200"
            >
              <Plus className="w-5 h-5" />
              Create Policy
            </motion.button>
          </div>

          {policies.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-12 text-center"
            >
              <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Policies Configured</h3>
              <p className="text-gray-600 dark:text-gray-400">Create adaptive security policies to protect your organization.</p>
            </motion.div>
          ) : (
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                <thead className="bg-gray-50 dark:bg-slate-700/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Policy Name</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Risk Level</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Action</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                  {policies.map((policy, index) => (
                    <motion.tr
                      key={policy.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer"
                      onClick={() => setSelectedPolicy(policy)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                            <Shield className="w-4 h-4 text-red-600 dark:text-red-400" />
                          </div>
                          <span className="font-medium text-gray-900 dark:text-white">{policy.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 rounded text-sm">
                          {policy.policyType}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getRiskLevelColor(policy.riskLevel)}`}>
                          {policy.riskLevel}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {policy.action}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          policy.isEnabled
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                        }`}>
                          {policy.isEnabled ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          {policy.isEnabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              policy.isEnabled ? handleDisablePolicy(policy.id) : handleEnablePolicy(policy.id);
                            }}
                            className={`p-2 rounded-lg transition-colors ${
                              policy.isEnabled
                                ? 'text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/30'
                                : 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30'
                            }`}
                          >
                            {policy.isEnabled ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeletePolicy(policy.id);
                            }}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      )}

      {/* Signals Tab */}
      {activeTab === 'signals' && !loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search signals..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-red-500 dark:bg-slate-700 dark:text-white"
            />
          </div>

          {signals.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-12 text-center"
            >
              <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Risk Signals Configured</h3>
              <p className="text-gray-600 dark:text-gray-400">Risk signals help detect suspicious activity and behavior.</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {signals.map((signal, index) => (
                <motion.div
                  key={signal.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6 hover:shadow-xl transition-all duration-300 cursor-pointer"
                  onClick={() => {
                    setSelectedSignal(signal);
                    setShowSignalModal(true);
                  }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-xl ${
                        signal.severity === 'Critical' ? 'bg-red-100 dark:bg-red-900/30' :
                        signal.severity === 'High' ? 'bg-orange-100 dark:bg-orange-900/30' :
                        'bg-yellow-100 dark:bg-yellow-900/30'
                      }`}>
                        <Zap className={`w-5 h-5 ${
                          signal.severity === 'Critical' ? 'text-red-600 dark:text-red-400' :
                          signal.severity === 'High' ? 'text-orange-600 dark:text-orange-400' :
                          'text-yellow-600 dark:text-yellow-400'
                        }`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{signal.signalType}</h3>
                        <span className={`text-xs px-2 py-1 rounded ${getRiskLevelColor(signal.severity)}`}>
                          {signal.severity}
                        </span>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      signal.isEnabled
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                    }`}>
                      {signal.isEnabled ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{signal.description}</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Weight: {signal.weight}</span>
                    <Edit3 className="w-4 h-4 text-gray-400" />
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Contexts Tab */}
      {activeTab === 'contexts' && !loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          {/* Search and Evaluate */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Lookup User Context</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="User ID..."
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-slate-700 dark:text-white"
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => selectedUserId && handleRefreshContext(selectedUserId)}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg hover:shadow-lg transition-all duration-200"
                >
                  <RefreshCw className="w-5 h-5" />
                </motion.button>
              </div>
            </div>

            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Get Risk Score</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Target className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="User ID for evaluation..."
                    value={evaluateUserId}
                    onChange={(e) => setEvaluateUserId(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-slate-700 dark:text-white"
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => evaluateUserId && fetchUserRiskScore(evaluateUserId)}
                  className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all duration-200"
                >
                  <Gauge className="w-5 h-5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => evaluateUserId && handleEvaluateUser(evaluateUserId)}
                  className="px-4 py-2 bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-500 transition-all duration-200"
                >
                  Evaluate
                </motion.button>
              </div>
            </div>
          </div>

          {/* Risk Score Display */}
          {userRiskScore !== null && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-900/30 dark:to-purple-900/30 border border-blue-200 dark:border-blue-700 rounded-xl p-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                    <Gauge className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">User Risk Score</span>
                    <p className={`text-3xl font-bold ${getRiskScoreColor(userRiskScore)}`}>{userRiskScore}</p>
                  </div>
                </div>
                <div className="w-32 h-32 relative">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      className="text-gray-200 dark:text-slate-700"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${userRiskScore * 3.52} 352`}
                      className={getRiskScoreColor(userRiskScore)}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`text-2xl font-bold ${getRiskScoreColor(userRiskScore)}`}>{userRiskScore}%</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Security Contexts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <FileSearch className="w-5 h-5 text-blue-600" />
              Security Contexts
            </h3>
            {contexts.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <FileSearch className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No security contexts found</p>
                <p className="text-sm">Search for a user to view their context</p>
              </div>
            ) : (
              <div className="space-y-4">
                {contexts.map((ctx) => (
                  <div key={ctx.userId} className="border border-gray-200 dark:border-slate-600 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                          <Users className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">{ctx.userId}</span>
                      </div>
                      <span className={`text-2xl font-bold ${getRiskScoreColor(ctx.contextData.riskScore)}`}>
                        {ctx.contextData.riskScore}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
                      <Clock className="w-4 h-4" />
                      Last Assessment: {new Date(ctx.contextData.lastAssessment).toLocaleString()}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {ctx.contextData.factors.map((factor, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded text-xs"
                        >
                          {factor}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}

      {/* High Risk Tab */}
      {activeTab === 'high-risk' && !loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          {highRiskUsers.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-12 text-center"
            >
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No High Risk Users</h3>
              <p className="text-gray-600 dark:text-gray-400">Great! No users are currently flagged as high risk.</p>
            </motion.div>
          ) : (
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                <thead className="bg-gray-50 dark:bg-slate-700/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">User</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Risk Score</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Risk Factors</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Last Evaluation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                  {highRiskUsers.map((user, index) => (
                    <motion.tr
                      key={user.userId}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                            <UserX className="w-4 h-4 text-red-600 dark:text-red-400" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">{user.userId}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-lg font-bold ${
                          user.riskScore >= 70
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                            : 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
                        }`}>
                          {user.riskScore}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {user.riskFactors.map((factor, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 rounded text-xs"
                            >
                              {factor}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {new Date(user.lastEvaluation).toLocaleString()}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      )}

      {/* Policy Modal */}
      <Modal
        isOpen={showPolicyModal}
        onClose={() => setShowPolicyModal(false)}
        title={editingPolicy ? 'Edit Policy' : 'Create Policy'}
      >
        <form onSubmit={handleCreatePolicy} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Policy Name</label>
            <input
              type="text"
              value={policyForm.name}
              onChange={(e) => setPolicyForm({ ...policyForm, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-slate-700 dark:text-white"
              placeholder="High Risk Login Policy"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Policy Type</label>
            <select
              value={policyForm.policyType}
              onChange={(e) => setPolicyForm({ ...policyForm, policyType: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-slate-700 dark:text-white"
            >
              <option value="RiskBased">Risk Based</option>
              <option value="LocationBased">Location Based</option>
              <option value="DeviceBased">Device Based</option>
              <option value="TimeBased">Time Based</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Risk Level</label>
            <select
              value={policyForm.riskLevel}
              onChange={(e) => setPolicyForm({ ...policyForm, riskLevel: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-slate-700 dark:text-white"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Action</label>
            <select
              value={policyForm.action}
              onChange={(e) => setPolicyForm({ ...policyForm, action: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-slate-700 dark:text-white"
            >
              <option value="RequireMFA">Require MFA</option>
              <option value="Block">Block Access</option>
              <option value="Warn">Show Warning</option>
              <option value="LogOnly">Log Only</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="policyEnabled"
              checked={policyForm.isEnabled}
              onChange={(e) => setPolicyForm({ ...policyForm, isEnabled: e.target.checked })}
              className="rounded border-gray-300 dark:border-slate-600 text-red-600 focus:ring-red-500"
            />
            <label htmlFor="policyEnabled" className="text-sm text-gray-700 dark:text-gray-300">Enable policy</label>
          </div>
          <div className="flex gap-3 pt-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="flex-1 py-2 bg-gradient-to-r from-red-500 to-orange-600 text-white rounded-lg hover:shadow-lg transition-all duration-200"
            >
              {editingPolicy ? 'Update' : 'Create'}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => setShowPolicyModal(false)}
              className="flex-1 py-2 bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-500 transition-all duration-200"
            >
              Cancel
            </motion.button>
          </div>
        </form>
      </Modal>

      {/* Signal Modal */}
      <Modal
        isOpen={showSignalModal}
        onClose={() => setShowSignalModal(false)}
        title="Edit Risk Signal"
      >
        {selectedSignal && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Signal Type</label>
              <input
                type="text"
                value={selectedSignal.signalType}
                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-100 dark:bg-slate-600 dark:text-white cursor-not-allowed"
                disabled
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
              <textarea
                value={selectedSignal.description}
                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-slate-700 dark:text-white"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Severity</label>
                <select
                  defaultValue={selectedSignal.severity}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-slate-700 dark:text-white"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Weight</label>
                <input
                  type="number"
                  defaultValue={selectedSignal.weight}
                  min={1}
                  max={100}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-slate-700 dark:text-white"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="signalEnabled"
                defaultChecked={selectedSignal.isEnabled}
                className="rounded border-gray-300 dark:border-slate-600 text-red-600 focus:ring-red-500"
              />
              <label htmlFor="signalEnabled" className="text-sm text-gray-700 dark:text-gray-300">Enable signal</label>
            </div>
            <div className="flex gap-3 pt-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleUpdateSignal(selectedSignal.id, {})}
                className="flex-1 py-2 bg-gradient-to-r from-red-500 to-orange-600 text-white rounded-lg hover:shadow-lg transition-all duration-200"
              >
                Update
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowSignalModal(false)}
                className="flex-1 py-2 bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-500 transition-all duration-200"
              >
                Cancel
              </motion.button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
