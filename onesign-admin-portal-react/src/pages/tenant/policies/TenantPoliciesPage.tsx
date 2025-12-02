import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocale } from '@/hooks/useLocale';
import { getTenantId } from '@/lib/tenant-context';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Plus,
  Edit3,
  Trash2,
  X,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Play,
  UserPlus,
  FileText,
  Code,
  Users,
  Building2,
  Key,
  AlertTriangle,
  Clock,
  Layers,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface Policy {
  id: string;
  name: string;
  description: string;
  policyType: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
  assignedCount?: number;
}

interface PolicyEvaluationResult {
  allowed: boolean;
  reason: string;
  matchedRules: string[];
}

// Mock data for demonstration
const mockPolicies: Policy[] = [
  {
    id: '1',
    name: 'Admin Access Policy',
    description: 'Full administrative access to all resources',
    policyType: 'RBAC',
    enabled: true,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-02-01T14:30:00Z',
    assignedCount: 5,
  },
  {
    id: '2',
    name: 'Read-Only Policy',
    description: 'Read-only access for viewers',
    policyType: 'ABAC',
    enabled: true,
    createdAt: '2024-01-20T09:00:00Z',
    updatedAt: '2024-01-25T11:15:00Z',
    assignedCount: 12,
  },
  {
    id: '3',
    name: 'Department-Based Access',
    description: 'Access based on department attributes',
    policyType: 'ABAC',
    enabled: true,
    createdAt: '2024-02-01T08:00:00Z',
    updatedAt: '2024-02-10T16:45:00Z',
    assignedCount: 8,
  },
  {
    id: '4',
    name: 'Time-Restricted Policy',
    description: 'Access only during business hours',
    policyType: 'PBAC',
    enabled: false,
    createdAt: '2024-02-05T12:00:00Z',
    updatedAt: '2024-02-15T09:20:00Z',
    assignedCount: 3,
  },
  {
    id: '5',
    name: 'Sensitive Data Policy',
    description: 'Access control for sensitive data',
    policyType: 'ABAC',
    enabled: true,
    createdAt: '2024-02-10T14:00:00Z',
    updatedAt: '2024-02-20T10:30:00Z',
    assignedCount: 6,
  },
];

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  delay: number;
}

const StatCard = ({ title, value, icon: Icon, color, delay }: StatCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: delay * 0.1 }}
    className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300"
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
      </div>
      <div className={`p-4 rounded-xl ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  </motion.div>
);

export default function TenantPoliciesPage() {
  const { t } = useTranslation();
  const locale = useLocale();
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showEvaluateModal, setShowEvaluateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
  const [tenantId, setTenantIdState] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Create/Edit form fields
  const [policyName, setPolicyName] = useState('');
  const [policyDescription, setPolicyDescription] = useState('');
  const [policyType, setPolicyType] = useState('ABAC');
  const [policyRules, setPolicyRules] = useState('{}');
  const [enabled, setEnabled] = useState(true);

  // Evaluate form fields
  const [evaluateUserId, setEvaluateUserId] = useState('');
  const [evaluateResource, setEvaluateResource] = useState('');
  const [evaluateAction, setEvaluateAction] = useState('');
  const [evaluationResult, setEvaluationResult] = useState<PolicyEvaluationResult | null>(null);

  // Assign form fields
  const [assignEntityType, setAssignEntityType] = useState('User');
  const [assignEntityId, setAssignEntityId] = useState('');

  // Filter
  const [filterEnabled, setFilterEnabled] = useState<boolean | null>(null);
  const [filterType, setFilterType] = useState<string>('all');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const contextTenantId = getTenantId();
    setTenantIdState(contextTenantId || '00000000-0000-0000-0000-000000000000');
  }, []);

  useEffect(() => {
    if (tenantId) {
      fetchPolicies();
    }
  }, [tenantId, filterEnabled]);

  const fetchPolicies = async () => {
    if (!tenantId) return;

    try {
      setLoading(true);
      // TODO: Implement policy fetching when API is available
      // const data = await securityService.getPolicies(tenantId, filterEnabled ?? undefined);
      // Use mock data for demonstration
      setTimeout(() => {
        setPolicies(mockPolicies);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error fetching policies:', error);
      setPolicies(mockPolicies);
      setLoading(false);
    }
  };

  const handleCreatePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!tenantId) return;

    try {
      // TODO: Implement policy creation when API is available
      setShowCreateModal(false);
      setPolicyName('');
      setPolicyDescription('');
      setPolicyRules('{}');
      setEnabled(true);
      setSuccess(t('common.policyCreated', 'Policy created successfully'));
      fetchPolicies();
    } catch (error: any) {
      setError(error?.message || t('common.error'));
      console.error('Error creating policy:', error);
    }
  };

  const handleUpdatePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!tenantId || !selectedPolicy) return;

    try {
      // TODO: Implement policy update when API is available
      setShowEditModal(false);
      setSelectedPolicy(null);
      setPolicyName('');
      setPolicyDescription('');
      setPolicyRules('{}');
      setSuccess(t('common.policyUpdated', 'Policy updated successfully'));
      fetchPolicies();
    } catch (error: any) {
      setError(error?.message || t('common.error'));
      console.error('Error updating policy:', error);
    }
  };

  const handleDeletePolicy = async (policyId: string) => {
    if (!confirm(t('tenant.policies.confirmDelete', 'Are you sure you want to delete this policy?'))) return;
    setError('');
    setSuccess('');
    if (!tenantId) return;

    try {
      // TODO: Implement policy deletion when API is available
      setSuccess(t('common.policyDeleted', 'Policy deleted successfully'));
      fetchPolicies();
    } catch (error: any) {
      setError(error?.message || t('common.error'));
      console.error('Error deleting policy:', error);
    }
  };

  const handleEvaluatePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setEvaluationResult(null);
    if (!tenantId || !selectedPolicy) return;

    try {
      // TODO: Implement policy evaluation when API is available
      // Provide mock evaluation result for UI testing
      const mockResult: PolicyEvaluationResult = {
        allowed: true,
        reason: 'User has required role and attributes match policy conditions',
        matchedRules: ['role-check', 'attribute-match', 'time-constraint'],
      };
      setEvaluationResult(mockResult);
    } catch (error: any) {
      setError(error?.message || t('common.error'));
      console.error('Error evaluating policy:', error);
    }
  };

  const handleAssignPolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!tenantId || !selectedPolicy) return;

    try {
      // TODO: Implement policy assignment when API is available
      setShowAssignModal(false);
      setSelectedPolicy(null);
      setAssignEntityId('');
      setSuccess(t('common.policyAssigned', 'Policy assigned successfully'));
    } catch (error: any) {
      setError(error?.message || t('common.error'));
      console.error('Error assigning policy:', error);
    }
  };

  const openEditModal = (policy: Policy) => {
    setSelectedPolicy(policy);
    setPolicyName(policy.name);
    setPolicyDescription(policy.description);
    setPolicyType(policy.policyType);
    setEnabled(policy.enabled);
    setPolicyRules('{}');
    setShowEditModal(true);
  };

  const openEvaluateModal = (policy: Policy) => {
    setSelectedPolicy(policy);
    setEvaluateUserId('');
    setEvaluateResource('');
    setEvaluateAction('');
    setEvaluationResult(null);
    setShowEvaluateModal(true);
  };

  const openAssignModal = (policy: Policy) => {
    setSelectedPolicy(policy);
    setAssignEntityId('');
    setShowAssignModal(true);
  };

  // Filter and search policies
  const filteredPolicies = policies.filter((policy) => {
    const matchesSearch =
      policy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      policy.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesEnabled = filterEnabled === null || policy.enabled === filterEnabled;
    const matchesType = filterType === 'all' || policy.policyType === filterType;
    return matchesSearch && matchesEnabled && matchesType;
  });

  // Pagination
  const totalPages = Math.ceil(filteredPolicies.length / itemsPerPage);
  const paginatedPolicies = filteredPolicies.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Stats
  const totalPolicies = policies.length;
  const enabledPolicies = policies.filter((p) => p.enabled).length;
  const disabledPolicies = policies.filter((p) => !p.enabled).length;
  const totalAssignments = policies.reduce((sum, p) => sum + (p.assignedCount || 0), 0);

  const getPolicyTypeIcon = (type: string) => {
    switch (type) {
      case 'RBAC':
        return Users;
      case 'ABAC':
        return Key;
      case 'PBAC':
        return Clock;
      default:
        return Shield;
    }
  };

  const getPolicyTypeColor = (type: string) => {
    switch (type) {
      case 'RBAC':
        return 'bg-blue-100 text-blue-800';
      case 'ABAC':
        return 'bg-purple-100 text-purple-800';
      case 'PBAC':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div
        dir={locale === 'fa' ? 'rtl' : 'ltr'}
        className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8 flex items-center justify-center"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-gray-600 font-medium">{t('common.loading', 'Loading...')}</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      dir={locale === 'fa' ? 'rtl' : 'ltr'}
      className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4"
      >
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            {t('common.policyManagement', 'Policy Management')}
          </h1>
          <p className="text-gray-600 mt-2">
            {t('tenant.policies.subtitle', 'Define and manage access control policies')}
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            setPolicyName('');
            setPolicyDescription('');
            setPolicyRules('{}');
            setEnabled(true);
            setShowCreateModal(true);
          }}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
        >
          <Plus className="w-5 h-5" />
          {t('common.createPolicy', 'Create Policy')}
        </motion.button>
      </motion.div>

      {/* Success/Error Messages */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-center gap-2"
          >
            <CheckCircle className="w-5 h-5" />
            {success}
            <button onClick={() => setSuccess('')} className="ml-auto">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2"
          >
            <AlertTriangle className="w-5 h-5" />
            {error}
            <button onClick={() => setError('')} className="ml-auto">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title={t('tenant.policies.totalPolicies', 'Total Policies')}
          value={totalPolicies}
          icon={Shield}
          color="bg-gradient-to-br from-blue-500 to-blue-600"
          delay={0}
        />
        <StatCard
          title={t('tenant.policies.enabledPolicies', 'Enabled Policies')}
          value={enabledPolicies}
          icon={CheckCircle}
          color="bg-gradient-to-br from-green-500 to-green-600"
          delay={1}
        />
        <StatCard
          title={t('tenant.policies.disabledPolicies', 'Disabled Policies')}
          value={disabledPolicies}
          icon={XCircle}
          color="bg-gradient-to-br from-gray-400 to-gray-500"
          delay={2}
        />
        <StatCard
          title={t('tenant.policies.totalAssignments', 'Total Assignments')}
          value={totalAssignments}
          icon={UserPlus}
          color="bg-gradient-to-br from-purple-500 to-purple-600"
          delay={3}
        />
      </div>

      {/* Filters and Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-6 mb-6"
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search
              className={`absolute ${locale === 'fa' ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400`}
            />
            <input
              type="text"
              placeholder={t('common.searchPolicies', 'Search policies...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full ${locale === 'fa' ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
            />
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={filterEnabled === null ? 'all' : filterEnabled.toString()}
                onChange={(e) => {
                  const value = e.target.value;
                  setFilterEnabled(value === 'all' ? null : value === 'true');
                }}
                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">{t('common.allStatus', 'All Status')}</option>
                <option value="true">{t('common.enabled', 'Enabled')}</option>
                <option value="false">{t('common.disabled', 'Disabled')}</option>
              </select>
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">{t('tenant.policies.allTypes', 'All Types')}</option>
              <option value="RBAC">RBAC</option>
              <option value="ABAC">ABAC</option>
              <option value="PBAC">PBAC</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Policies Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th
                  className={`px-6 py-4 ${locale === 'fa' ? 'text-right' : 'text-left'} text-xs font-semibold text-gray-600 uppercase tracking-wider`}
                >
                  {t('common.name', 'Name')}
                </th>
                <th
                  className={`px-6 py-4 ${locale === 'fa' ? 'text-right' : 'text-left'} text-xs font-semibold text-gray-600 uppercase tracking-wider`}
                >
                  {t('tenant.policies.type', 'Type')}
                </th>
                <th
                  className={`px-6 py-4 ${locale === 'fa' ? 'text-right' : 'text-left'} text-xs font-semibold text-gray-600 uppercase tracking-wider`}
                >
                  {t('common.status', 'Status')}
                </th>
                <th
                  className={`px-6 py-4 ${locale === 'fa' ? 'text-right' : 'text-left'} text-xs font-semibold text-gray-600 uppercase tracking-wider`}
                >
                  {t('tenant.policies.assignments', 'Assignments')}
                </th>
                <th
                  className={`px-6 py-4 ${locale === 'fa' ? 'text-right' : 'text-left'} text-xs font-semibold text-gray-600 uppercase tracking-wider`}
                >
                  {t('common.created', 'Created')}
                </th>
                <th
                  className={`px-6 py-4 ${locale === 'fa' ? 'text-right' : 'text-left'} text-xs font-semibold text-gray-600 uppercase tracking-wider`}
                >
                  {t('common.actions', 'Actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <AnimatePresence>
                {paginatedPolicies.map((policy, index) => {
                  const TypeIcon = getPolicyTypeIcon(policy.policyType);
                  return (
                    <motion.tr
                      key={policy.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-blue-50/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg">
                            <Shield className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{policy.name}</p>
                            {policy.description && (
                              <p className="text-sm text-gray-500 max-w-xs truncate">
                                {policy.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium ${getPolicyTypeColor(policy.policyType)}`}
                        >
                          <TypeIcon className="w-4 h-4" />
                          {policy.policyType}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${
                            policy.enabled
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {policy.enabled ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            <XCircle className="w-4 h-4" />
                          )}
                          {policy.enabled ? t('common.enabled', 'Enabled') : t('common.disabled', 'Disabled')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Layers className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">{policy.assignedCount || 0}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(policy.createdAt).toLocaleDateString(locale)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => openEditModal(policy)}
                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title={t('common.edit', 'Edit')}
                          >
                            <Edit3 className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => openEvaluateModal(policy)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title={t('tenant.policies.evaluate', 'Evaluate')}
                          >
                            <Play className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => openAssignModal(policy)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title={t('tenant.policies.assign', 'Assign')}
                          >
                            <UserPlus className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleDeletePolicy(policy.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title={t('common.delete', 'Delete')}
                          >
                            <Trash2 className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>

          {filteredPolicies.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">
                {t('tenant.policies.noPolicies', 'No policies found')}
              </p>
              <p className="text-gray-400 mt-2">
                {t('tenant.policies.createFirst', 'Create your first policy to get started')}
              </p>
            </motion.div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {t('common.showing', 'Showing')} {(currentPage - 1) * itemsPerPage + 1} -{' '}
              {Math.min(currentPage * itemsPerPage, filteredPolicies.length)}{' '}
              {t('common.of', 'of')} {filteredPolicies.length}
            </p>
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                {locale === 'fa' ? (
                  <ChevronRight className="w-5 h-5" />
                ) : (
                  <ChevronLeft className="w-5 h-5" />
                )}
              </motion.button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <motion.button
                  key={page}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCurrentPage(page)}
                  className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                    currentPage === page
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                      : 'border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </motion.button>
              ))}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                {locale === 'fa' ? (
                  <ChevronLeft className="w-5 h-5" />
                ) : (
                  <ChevronRight className="w-5 h-5" />
                )}
              </motion.button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Create Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <Plus className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-white">
                      {t('common.createPolicy', 'Create Policy')}
                    </h2>
                  </div>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>
              <form onSubmit={handleCreatePolicy} className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('common.name', 'Name')}
                  </label>
                  <input
                    type="text"
                    required
                    value={policyName}
                    onChange={(e) => setPolicyName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={t('tenant.policies.namePlaceholder', 'Enter policy name')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('common.description', 'Description')}
                  </label>
                  <textarea
                    rows={3}
                    value={policyDescription}
                    onChange={(e) => setPolicyDescription(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={t('tenant.policies.descriptionPlaceholder', 'Enter policy description')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('common.policyType', 'Policy Type')}
                  </label>
                  <select
                    value={policyType}
                    onChange={(e) => setPolicyType(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="ABAC">ABAC - Attribute-Based Access Control</option>
                    <option value="RBAC">RBAC - Role-Based Access Control</option>
                    <option value="PBAC">PBAC - Policy-Based Access Control</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                      <Code className="w-4 h-4" />
                      {t('tenant.policies.rules', 'Rules (JSON)')}
                    </div>
                  </label>
                  <textarea
                    rows={6}
                    value={policyRules}
                    onChange={(e) => setPolicyRules(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                    placeholder='{"conditions": [], "effect": "allow"}'
                  />
                </div>
                <div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div
                      className={`relative w-14 h-7 rounded-full transition-colors ${enabled ? 'bg-gradient-to-r from-blue-600 to-indigo-600' : 'bg-gray-300'}`}
                    >
                      <div
                        className={`absolute top-0.5 ${enabled ? (locale === 'fa' ? 'left-0.5' : 'right-0.5') : (locale === 'fa' ? 'right-0.5' : 'left-0.5')} w-6 h-6 bg-white rounded-full shadow-md transition-all`}
                      />
                    </div>
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={enabled}
                      onChange={(e) => setEnabled(e.target.checked)}
                    />
                    <span className="text-gray-700 font-medium">{t('common.enabled', 'Enabled')}</span>
                  </label>
                </div>
                <div className="flex gap-3 pt-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all font-medium"
                  >
                    {t('common.create', 'Create')}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-6 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                  >
                    {t('common.cancel', 'Cancel')}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {showEditModal && selectedPolicy && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowEditModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <Edit3 className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-white">
                      {t('common.editPolicy', 'Edit Policy')}
                    </h2>
                  </div>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>
              <form onSubmit={handleUpdatePolicy} className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('common.name', 'Name')}
                  </label>
                  <input
                    type="text"
                    required
                    value={policyName}
                    onChange={(e) => setPolicyName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('common.description', 'Description')}
                  </label>
                  <textarea
                    rows={3}
                    value={policyDescription}
                    onChange={(e) => setPolicyDescription(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('common.policyType', 'Policy Type')}
                  </label>
                  <select
                    value={policyType}
                    onChange={(e) => setPolicyType(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="ABAC">ABAC - Attribute-Based Access Control</option>
                    <option value="RBAC">RBAC - Role-Based Access Control</option>
                    <option value="PBAC">PBAC - Policy-Based Access Control</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                      <Code className="w-4 h-4" />
                      {t('tenant.policies.rules', 'Rules (JSON)')}
                    </div>
                  </label>
                  <textarea
                    rows={6}
                    value={policyRules}
                    onChange={(e) => setPolicyRules(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono text-sm"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div
                      className={`relative w-14 h-7 rounded-full transition-colors ${enabled ? 'bg-gradient-to-r from-indigo-600 to-purple-600' : 'bg-gray-300'}`}
                    >
                      <div
                        className={`absolute top-0.5 ${enabled ? (locale === 'fa' ? 'left-0.5' : 'right-0.5') : (locale === 'fa' ? 'right-0.5' : 'left-0.5')} w-6 h-6 bg-white rounded-full shadow-md transition-all`}
                      />
                    </div>
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={enabled}
                      onChange={(e) => setEnabled(e.target.checked)}
                    />
                    <span className="text-gray-700 font-medium">{t('common.enabled', 'Enabled')}</span>
                  </label>
                </div>
                <div className="flex gap-3 pt-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all font-medium"
                  >
                    {t('common.save', 'Save')}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedPolicy(null);
                    }}
                    className="px-6 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                  >
                    {t('common.cancel', 'Cancel')}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Evaluate Modal */}
      <AnimatePresence>
        {showEvaluateModal && selectedPolicy && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowEvaluateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <Play className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">
                        {t('tenant.policies.evaluatePolicy', 'Evaluate Policy')}
                      </h2>
                      <p className="text-blue-100 text-sm">{selectedPolicy.name}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowEvaluateModal(false)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>
              <form onSubmit={handleEvaluatePolicy} className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('tenant.policies.userId', 'User ID')}
                  </label>
                  <input
                    type="text"
                    required
                    value={evaluateUserId}
                    onChange={(e) => setEvaluateUserId(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="user-123"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('tenant.policies.resource', 'Resource')}
                  </label>
                  <input
                    type="text"
                    required
                    value={evaluateResource}
                    onChange={(e) => setEvaluateResource(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="/api/users"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('tenant.policies.action', 'Action')}
                  </label>
                  <input
                    type="text"
                    required
                    value={evaluateAction}
                    onChange={(e) => setEvaluateAction(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="read"
                  />
                </div>

                {evaluationResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-6 rounded-xl ${
                      evaluationResult.allowed
                        ? 'bg-green-50 border border-green-200'
                        : 'bg-red-50 border border-red-200'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      {evaluationResult.allowed ? (
                        <CheckCircle className="w-8 h-8 text-green-600" />
                      ) : (
                        <XCircle className="w-8 h-8 text-red-600" />
                      )}
                      <h3 className="text-lg font-semibold">
                        {t('tenant.policies.evaluationResult', 'Evaluation Result')}
                      </h3>
                    </div>
                    <div className="space-y-3">
                      <p>
                        <strong>{t('common.allowed', 'Allowed')}:</strong>{' '}
                        <span
                          className={`font-medium ${evaluationResult.allowed ? 'text-green-700' : 'text-red-700'}`}
                        >
                          {evaluationResult.allowed ? t('common.yes', 'Yes') : t('common.no', 'No')}
                        </span>
                      </p>
                      <p>
                        <strong>{t('tenant.policies.reason', 'Reason')}:</strong>{' '}
                        <span className="text-gray-600">{evaluationResult.reason}</span>
                      </p>
                      {evaluationResult.matchedRules.length > 0 && (
                        <div>
                          <strong>{t('tenant.policies.matchedRules', 'Matched Rules')}:</strong>
                          <ul className="mt-2 space-y-1">
                            {evaluationResult.matchedRules.map((rule, index) => (
                              <li
                                key={index}
                                className="flex items-center gap-2 text-gray-600"
                              >
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                {rule}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                <div className="flex gap-3 pt-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all font-medium flex items-center justify-center gap-2"
                  >
                    <Play className="w-5 h-5" />
                    {t('tenant.policies.evaluate', 'Evaluate')}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => {
                      setShowEvaluateModal(false);
                      setSelectedPolicy(null);
                      setEvaluationResult(null);
                    }}
                    className="px-6 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                  >
                    {t('common.close', 'Close')}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Assign Modal */}
      <AnimatePresence>
        {showAssignModal && selectedPolicy && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowAssignModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-600 to-emerald-600 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <UserPlus className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">
                        {t('tenant.policies.assignPolicy', 'Assign Policy')}
                      </h2>
                      <p className="text-green-100 text-sm">{selectedPolicy.name}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowAssignModal(false)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>
              <form onSubmit={handleAssignPolicy} className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('tenant.policies.entityType', 'Entity Type')}
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: 'User', icon: Users, label: t('common.user', 'User') },
                      { value: 'Role', icon: Key, label: t('common.role', 'Role') },
                      { value: 'Group', icon: Users, label: t('common.group', 'Group') },
                      { value: 'OrgUnit', icon: Building2, label: t('common.orgUnit', 'Org Unit') },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setAssignEntityType(option.value)}
                        className={`p-4 border-2 rounded-xl flex flex-col items-center gap-2 transition-all ${
                          assignEntityType === option.value
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <option.icon
                          className={`w-6 h-6 ${
                            assignEntityType === option.value ? 'text-green-600' : 'text-gray-400'
                          }`}
                        />
                        <span
                          className={`text-sm font-medium ${
                            assignEntityType === option.value ? 'text-green-700' : 'text-gray-600'
                          }`}
                        >
                          {option.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('tenant.policies.entityId', 'Entity ID')}
                  </label>
                  <input
                    type="text"
                    required
                    value={assignEntityId}
                    onChange={(e) => setAssignEntityId(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder={t('tenant.policies.entityIdPlaceholder', 'Enter entity ID')}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all font-medium flex items-center justify-center gap-2"
                  >
                    <UserPlus className="w-5 h-5" />
                    {t('tenant.policies.assign', 'Assign')}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => {
                      setShowAssignModal(false);
                      setSelectedPolicy(null);
                    }}
                    className="px-6 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                  >
                    {t('common.cancel', 'Cancel')}
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
