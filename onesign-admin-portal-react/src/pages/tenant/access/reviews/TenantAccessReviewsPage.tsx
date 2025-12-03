import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { getTenantId } from '@/lib/tenant-context';
import { platformService } from '@/lib/api/services';
import { useAuth } from '@/app/contexts/AuthContext';
import Modal from '@/components/common/Modal';
import { Helmet } from 'react-helmet-async';
import {
  ClipboardCheck,
  Users,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Plus,
  Eye,
  AlertTriangle,
  RefreshCw,
  Search,
  Filter,
  ThumbsUp,
  ThumbsDown,
  UserCheck,
  FileText,
  BarChart3
} from 'lucide-react';

interface AccessReview {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  reviewType: 'application' | 'role' | 'group' | 'permission';
  scope: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  dueDate: string;
  reviewers: string[];
  items: AccessReviewItem[];
  completedAt?: string;
  statistics?: {
    total: number;
    approved: number;
    revoked: number;
    pending: number;
  };
}

interface AccessReviewItem {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  accessType: string;
  accessName: string;
  grantedAt: string;
  lastUsedAt?: string;
  decision?: 'approve' | 'revoke' | 'pending';
  decidedAt?: string;
  decidedByUserId?: string;
  notes?: string;
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

export default function TenantAccessReviewsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [tenantId, setTenantIdState] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [reviews, setReviews] = useState<AccessReview[]>([]);
  const [selectedReview, setSelectedReview] = useState<AccessReview | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  const [createForm, setCreateForm] = useState({
    name: '',
    description: '',
    reviewType: 'application' as const,
    scope: '',
    dueDate: '',
    reviewers: [] as string[],
  });

  useEffect(() => {
    const contextTenantId = getTenantId();
    setTenantIdState(contextTenantId || '00000000-0000-0000-0000-000000000000');
  }, []);

  useEffect(() => {
    if (tenantId) {
      fetchReviews();
    }
  }, [tenantId, filterStatus]);

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError('');
        setSuccess('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const fetchReviews = async () => {
    if (!tenantId) return;
    setLoading(true);
    setError('');
    try {
      const data = await platformService.getAccessReviews(tenantId);
      setReviews(data || []);
    } catch (err: any) {
      console.error('Error fetching access reviews:', err);
      setError('Failed to load access reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReview = async () => {
    if (!tenantId) return;
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      setSuccess('Access review created successfully');
      setShowCreateModal(false);
      setCreateForm({
        name: '',
        description: '',
        reviewType: 'application',
        scope: '',
        dueDate: '',
        reviewers: [],
      });
      fetchReviews();
    } catch (err: any) {
      setError('Failed to create access review');
    } finally {
      setLoading(false);
    }
  };

  const handleViewReview = async (review: AccessReview) => {
    setSelectedReview(review);
    setShowReviewModal(true);
  };

  const handleSubmitDecision = async (
    reviewId: string,
    itemId: string,
    decision: 'approve' | 'revoke',
    notes?: string
  ) => {
    if (!tenantId) return;
    setLoading(true);
    setError('');
    try {
      setSuccess(`Decision ${decision}d successfully`);
      fetchReviews();
    } catch (err: any) {
      setError('Failed to submit decision');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteReview = async (reviewId: string) => {
    if (!tenantId || !confirm('Are you sure you want to complete this review? This action cannot be undone.')) return;
    setLoading(true);
    setError('');
    try {
      setSuccess('Access review completed successfully');
      setShowReviewModal(false);
      setSelectedReview(null);
      fetchReviews();
    } catch (err: any) {
      setError('Failed to complete review');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
    }
  };

  const getReviewTypeIcon = (type: string) => {
    switch (type) {
      case 'application':
        return <FileText className="w-4 h-4" />;
      case 'role':
        return <UserCheck className="w-4 h-4" />;
      case 'group':
        return <Users className="w-4 h-4" />;
      default:
        return <ClipboardCheck className="w-4 h-4" />;
    }
  };

  const filteredReviews = reviews.filter(review => {
    if (filterStatus && review.status !== filterStatus) return false;
    if (searchQuery && !review.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const totalReviews = reviews.length;
  const completedReviews = reviews.filter(r => r.status === 'completed').length;
  const inProgressReviews = reviews.filter(r => r.status === 'in_progress').length;
  const pendingItems = reviews.reduce((sum, r) => sum + (r.statistics?.pending || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 p-6">
      <Helmet>
        <title>Access Reviews</title>
      </Helmet>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-4 mb-2">
          <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
            <ClipboardCheck className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Access Reviews
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Review and certify user access across applications, roles, and permissions
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

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Reviews"
          value={totalReviews}
          icon={<ClipboardCheck className="w-6 h-6 text-white" />}
          color="from-indigo-500 to-indigo-600"
          delay={0}
        />
        <StatCard
          title="Completed"
          value={completedReviews}
          icon={<CheckCircle className="w-6 h-6 text-white" />}
          color="from-green-500 to-green-600"
          delay={1}
        />
        <StatCard
          title="In Progress"
          value={inProgressReviews}
          icon={<Clock className="w-6 h-6 text-white" />}
          color="from-blue-500 to-blue-600"
          delay={2}
        />
        <StatCard
          title="Pending Items"
          value={pendingItems}
          icon={<Users className="w-6 h-6 text-white" />}
          color="from-orange-500 to-orange-600"
          delay={3}
        />
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-4 mb-6"
      >
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search reviews..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-200"
          >
            <Plus className="w-5 h-5" />
            Create Review
          </motion.button>
        </div>
      </motion.div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-12">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <RefreshCw className="w-8 h-8 text-indigo-600" />
          </motion.div>
        </div>
      )}

      {/* Reviews List */}
      {!loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          {filteredReviews.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-12 text-center"
            >
              <ClipboardCheck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Access Reviews</h3>
              <p className="text-gray-600 dark:text-gray-400">Create a new review to start certifying user access.</p>
            </motion.div>
          ) : (
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                <thead className="bg-gray-50 dark:bg-slate-700/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Review Name</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Due Date</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Progress</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                  {filteredReviews.map((review, index) => (
                    <motion.tr
                      key={review.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer"
                      onClick={() => handleViewReview(review)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                            {getReviewTypeIcon(review.reviewType)}
                          </div>
                          <div>
                            <span className="font-medium text-gray-900 dark:text-white">{review.name}</span>
                            {review.description && (
                              <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">{review.description}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 rounded text-sm capitalize">
                          {review.reviewType}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(review.status)}`}>
                          {review.status === 'completed' && <CheckCircle className="w-3 h-3" />}
                          {review.status === 'in_progress' && <Clock className="w-3 h-3" />}
                          {review.status === 'cancelled' && <XCircle className="w-3 h-3" />}
                          {review.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {new Date(review.dueDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {review.statistics ? (
                          <div className="flex items-center gap-2">
                            <div className="flex gap-1 text-sm">
                              <span className="text-green-600 dark:text-green-400 font-medium">{review.statistics.approved}</span>
                              <span className="text-gray-400">/</span>
                              <span className="text-red-600 dark:text-red-400 font-medium">{review.statistics.revoked}</span>
                              <span className="text-gray-400">/</span>
                              <span className="text-gray-600 dark:text-gray-400">{review.statistics.pending}</span>
                            </div>
                            <div className="w-24 bg-gray-200 dark:bg-slate-600 rounded-full h-2 overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-green-500 to-blue-500"
                                style={{
                                  width: `${review.statistics.total > 0
                                    ? ((review.statistics.approved + review.statistics.revoked) / review.statistics.total) * 100
                                    : 0}%`
                                }}
                              />
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewReview(review);
                            }}
                            className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </motion.button>
                          {review.status === 'in_progress' && (
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCompleteReview(review.id);
                              }}
                              className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                              title="Complete Review"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </motion.button>
                          )}
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

      {/* Create Review Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Access Review"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Review Name</label>
            <input
              type="text"
              value={createForm.name}
              onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white"
              placeholder="Q4 2024 Application Access Review"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <textarea
              value={createForm.description}
              onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white"
              rows={3}
              placeholder="Quarterly review of application access..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Review Type</label>
            <select
              value={createForm.reviewType}
              onChange={(e) => setCreateForm({ ...createForm, reviewType: e.target.value as any })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white"
            >
              <option value="application">Application Access</option>
              <option value="role">Role Assignments</option>
              <option value="group">Group Memberships</option>
              <option value="permission">Direct Permissions</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Scope</label>
            <input
              type="text"
              value={createForm.scope}
              onChange={(e) => setCreateForm({ ...createForm, scope: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white"
              placeholder="All applications"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Due Date</label>
            <input
              type="date"
              value={createForm.dueDate}
              onChange={(e) => setCreateForm({ ...createForm, dueDate: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCreateReview}
              className="flex-1 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200"
            >
              Create Review
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowCreateModal(false)}
              className="flex-1 py-2 bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-500 transition-all duration-200"
            >
              Cancel
            </motion.button>
          </div>
        </div>
      </Modal>

      {/* Review Details Modal */}
      <Modal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        title={selectedReview?.name || 'Review Details'}
        size="lg"
      >
        {selectedReview && (
          <div className="space-y-6">
            {/* Review Info */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Type</div>
                <div className="font-medium capitalize text-gray-900 dark:text-white">{selectedReview.reviewType}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Status</div>
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedReview.status)}`}>
                  {selectedReview.status.replace('_', ' ')}
                </span>
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Due Date</div>
                <div className="font-medium text-gray-900 dark:text-white">{new Date(selectedReview.dueDate).toLocaleDateString()}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Progress</div>
                <div className="font-medium text-gray-900 dark:text-white">
                  <span className="text-green-600">{selectedReview.statistics?.approved || 0}</span> approved /
                  <span className="text-red-600 ml-1">{selectedReview.statistics?.revoked || 0}</span> revoked /
                  <span className="text-gray-600 dark:text-gray-400 ml-1">{selectedReview.statistics?.pending || 0}</span> pending
                </div>
              </div>
            </div>

            {/* Review Items */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                Access Items
              </h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {selectedReview.items.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No items in this review</p>
                  </div>
                ) : (
                  selectedReview.items.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border border-gray-200 dark:border-slate-600 rounded-xl p-4"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 dark:text-white">{item.userName}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">{item.userEmail}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {item.accessType}: <span className="font-medium">{item.accessName}</span>
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-500 mt-1 flex items-center gap-2">
                            <Clock className="w-3 h-3" />
                            Granted: {new Date(item.grantedAt).toLocaleDateString()}
                            {item.lastUsedAt && ` | Last used: ${new Date(item.lastUsedAt).toLocaleDateString()}`}
                          </div>
                        </div>
                        <div className="ml-4">
                          {item.decision && item.decision !== 'pending' ? (
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                              item.decision === 'approve'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                            }`}>
                              {item.decision === 'approve' ? <ThumbsUp className="w-3 h-3" /> : <ThumbsDown className="w-3 h-3" />}
                              {item.decision}
                            </span>
                          ) : (
                            <div className="flex gap-2">
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleSubmitDecision(selectedReview.id, item.id, 'approve')}
                                className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm flex items-center gap-1"
                              >
                                <ThumbsUp className="w-3 h-3" />
                                Approve
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleSubmitDecision(selectedReview.id, item.id, 'revoke')}
                                className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm flex items-center gap-1"
                              >
                                <ThumbsDown className="w-3 h-3" />
                                Revoke
                              </motion.button>
                            </div>
                          )}
                        </div>
                      </div>
                      {item.notes && (
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-2 p-2 bg-gray-50 dark:bg-slate-700 rounded">
                          <span className="font-medium">Notes:</span> {item.notes}
                        </div>
                      )}
                    </motion.div>
                  ))
                )}
              </div>
            </div>

            {/* Actions */}
            {selectedReview.status === 'in_progress' && (
              <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-slate-700">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleCompleteReview(selectedReview.id)}
                  className="flex-1 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  Complete Review
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowReviewModal(false)}
                  className="flex-1 py-2 bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-500 transition-all duration-200"
                >
                  Close
                </motion.button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
