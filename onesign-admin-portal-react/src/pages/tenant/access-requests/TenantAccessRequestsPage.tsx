import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import {
  KeyRound,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Plus,
  Search,
  Filter,
  Eye,
  Check,
  X,
  FileText,
  User,
  Shield,
  Calendar,
  MessageSquare,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { getTenantId } from '@/lib/tenant-context';
import { useAuth } from '@/app/contexts/AuthContext';
import Modal from '@/components/common/Modal';
import StatusBadge from '@/components/common/StatusBadge';
import * as AccessRequestsAPI from '@/lib/api/access-requests';

type AccessRequest = AccessRequestsAPI.AccessRequestExtendedDto;
type Tab = 'pending' | 'approved' | 'rejected' | 'all';

// Stat Card Component
interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: number;
  trendLabel?: string;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'indigo' | 'cyan' | 'yellow';
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
    yellow: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-600 dark:text-yellow-400', border: 'border-yellow-200 dark:border-yellow-800', glow: 'hover:shadow-yellow-100 dark:hover:shadow-yellow-900/20' }
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

export default function TenantAccessRequestsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('pending');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Data states
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [allRequests, setAllRequests] = useState<AccessRequest[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<AccessRequest | null>(null);

  // Form states
  const [resourceType, setResourceType] = useState('');
  const [resourceId, setResourceId] = useState('');
  const [resourceName, setResourceName] = useState('');
  const [accessLevel, setAccessLevel] = useState('');
  const [justification, setJustification] = useState('');
  const [reviewerComment, setReviewerComment] = useState('');

  // Pagination
  const [pageNumber, setPageNumber] = useState(1);
  const pageSize = 10;

  const tenantId = getTenantId();
  const userId = user?.id || '00000000-0000-0000-0000-000000000001';

  useEffect(() => {
    fetchRequests();
  }, [activeTab, pageNumber]);

  const fetchRequests = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError('');

    try {
      const status = activeTab !== 'all' ? (activeTab.charAt(0).toUpperCase() + activeTab.slice(1)) as AccessRequestsAPI.AccessRequestStatus : undefined;

      const result = await AccessRequestsAPI.getAccessRequests(tenantId, {
        status,
        page: pageNumber,
        pageSize,
      });

      setRequests(result.items);

      // Fetch all for counts
      if (!isRefresh) {
        const allResult = await AccessRequestsAPI.getAccessRequests(tenantId, {
          page: 1,
          pageSize: 1000,
        });
        setAllRequests(allResult.items);
      }
    } catch (err) {
      setError(t('common.error'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleCreateRequest = async () => {
    if (!resourceType || !resourceId || !accessLevel || !justification) {
      setError('لطفاً تمام فیلدهای الزامی را پر کنید');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      await AccessRequestsAPI.createAccessRequest({
        tenantId,
        userId,
        requestType: 'ApplicationAccess',
        targetResourceId: resourceId,
        targetResourceType: resourceType,
        requestedScopes: [accessLevel],
        justification,
      });

      setSuccess('درخواست دسترسی با موفقیت ایجاد شد');
      setShowCreateModal(false);
      resetForm();
      fetchRequests(true);
    } catch (err) {
      setError(t('common.error'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleApproveReject = async (approve: boolean) => {
    if (!selectedRequest) return;

    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      if (approve) {
        await AccessRequestsAPI.approveAccessRequest(selectedRequest.id, {
          tenantId,
          userId,
          comments: reviewerComment || undefined,
        });
      } else {
        await AccessRequestsAPI.rejectAccessRequest(selectedRequest.id, {
          tenantId,
          userId,
          comments: reviewerComment,
        });
      }

      setSuccess(`درخواست دسترسی با موفقیت ${approve ? 'تأیید' : 'رد'} شد`);
      setShowApprovalModal(false);
      setSelectedRequest(null);
      setReviewerComment('');
      fetchRequests(true);
    } catch (err) {
      setError(t('common.error'));
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setResourceType('');
    setResourceId('');
    setResourceName('');
    setAccessLevel('');
    setJustification('');
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('fa-IR');
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('fa-IR');
  };

  const getStatusCounts = () => {
    const counts = {
      pending: 0,
      approved: 0,
      rejected: 0,
      all: allRequests.length,
    };

    allRequests.forEach((req) => {
      const status = req.status.toLowerCase();
      if (status === 'pending') counts.pending++;
      if (status === 'approved') counts.approved++;
      if (status === 'rejected') counts.rejected++;
    });

    return counts;
  };

  const counts = getStatusCounts();

  const tabs = [
    { id: 'pending', label: 'در انتظار', icon: Clock, count: counts.pending },
    { id: 'approved', label: 'تأیید شده', icon: CheckCircle, count: counts.approved },
    { id: 'rejected', label: 'رد شده', icon: XCircle, count: counts.rejected },
    { id: 'all', label: 'همه', icon: FileText, count: counts.all },
  ];

  const filteredRequests = requests.filter((req) =>
    req.requesterName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.requesterEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.targetResourceName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.targetResourceType?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'approved': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'rejected': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-400';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'در انتظار';
      case 'approved': return 'تأیید شده';
      case 'rejected': return 'رد شده';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <KeyRound className="w-6 h-6 text-blue-500" />
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
        <title>{t('tenant.accessRequests.title', 'درخواست‌های دسترسی')} | OneSign</title>
      </Helmet>

      <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 min-h-screen" dir="rtl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3"
            >
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl text-white">
                <KeyRound className="w-6 h-6" />
              </div>
              {t('tenant.accessRequests.title', 'درخواست‌های دسترسی')}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="text-slate-500 dark:text-slate-400 mt-1"
            >
              {t('tenant.accessRequests.subtitle', 'مدیریت و بررسی درخواست‌های دسترسی کاربران')}
            </motion.p>
          </div>
          <div className="flex gap-3">
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => fetchRequests(true)}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              {t('common.refresh', 'بروزرسانی')}
            </motion.button>
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
            >
              <Plus className="w-4 h-4" />
              {t('common.newRequest', 'درخواست جدید')}
            </motion.button>
          </div>
        </div>

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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="کل درخواست‌ها"
            value={counts.all}
            icon={<FileText className="w-6 h-6" />}
            color="blue"
            delay={0}
          />
          <StatCard
            title="در انتظار بررسی"
            value={counts.pending}
            subtitle="نیاز به اقدام"
            icon={<Clock className="w-6 h-6" />}
            color="yellow"
            delay={1}
          />
          <StatCard
            title="تأیید شده"
            value={counts.approved}
            icon={<CheckCircle className="w-6 h-6" />}
            color="green"
            delay={2}
          />
          <StatCard
            title="رد شده"
            value={counts.rejected}
            icon={<XCircle className="w-6 h-6" />}
            color="red"
            delay={3}
          />
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
                onClick={() => {
                  setActiveTab(tab.id as Tab);
                  setPageNumber(1);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                <span className={`px-2 py-0.5 text-xs rounded-full ${
                  activeTab === tab.id
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4"
        >
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="جستجو در درخواست‌ها..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-10 pl-4 py-2 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </motion.div>

        {/* Requests List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-4"
        >
          {filteredRequests.length > 0 ? (
            filteredRequests.map((request, idx) => (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 hover:shadow-lg transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
                        <User className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white">
                          {request.requesterName || 'کاربر ناشناس'}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {request.requesterEmail || 'بدون ایمیل'}
                        </p>
                      </div>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusStyle(request.status)}`}>
                        {getStatusLabel(request.status)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-slate-400" />
                        <div>
                          <p className="text-xs text-slate-500 dark:text-slate-400">نوع منبع</p>
                          <p className="text-sm font-medium text-slate-900 dark:text-white">{request.targetResourceType}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-slate-400" />
                        <div>
                          <p className="text-xs text-slate-500 dark:text-slate-400">منبع</p>
                          <p className="text-sm font-medium text-slate-900 dark:text-white">
                            {request.targetResourceName || request.targetResourceId}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <KeyRound className="w-4 h-4 text-slate-400" />
                        <div>
                          <p className="text-xs text-slate-500 dark:text-slate-400">سطح دسترسی</p>
                          <p className="text-sm font-medium text-slate-900 dark:text-white">
                            {request.requestedScopes?.join(', ') || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 text-sm text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>درخواست شده: {formatDate(request.createdAt)}</span>
                      </div>
                      {request.reviewedAt && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>بررسی شده: {formatDate(request.reviewedAt)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => {
                        setSelectedRequest(request);
                        setShowDetailsModal(true);
                      }}
                      className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all"
                    >
                      <Eye className="w-5 h-5" />
                    </motion.button>
                    {request.status.toLowerCase() === 'pending' && (
                      <>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => {
                            setSelectedRequest(request);
                            setShowApprovalModal(true);
                          }}
                          className="p-2 text-slate-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-all"
                        >
                          <Check className="w-5 h-5" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => {
                            setSelectedRequest(request);
                            setShowApprovalModal(true);
                          }}
                          className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all"
                        >
                          <X className="w-5 h-5" />
                        </motion.button>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-12 text-center"
            >
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                درخواستی یافت نشد
              </h3>
              <p className="text-slate-500 dark:text-slate-400">
                هیچ درخواست دسترسی در این دسته وجود ندارد
              </p>
            </motion.div>
          )}
        </motion.div>

        {/* Pagination */}
        {filteredRequests.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-between bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4"
          >
            <button
              onClick={() => setPageNumber(pageNumber - 1)}
              disabled={pageNumber === 1}
              className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="w-4 h-4" />
              {t('common.previous', 'قبلی')}
            </button>
            <span className="text-sm text-slate-600 dark:text-slate-400">
              صفحه {pageNumber.toLocaleString('fa-IR')}
            </span>
            <button
              onClick={() => setPageNumber(pageNumber + 1)}
              disabled={requests.length < pageSize}
              className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {t('common.next', 'بعدی')}
              <ChevronLeft className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {/* Create Request Modal */}
        <Modal
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            resetForm();
          }}
          title="ایجاد درخواست دسترسی جدید"
          size="lg"
        >
          <form onSubmit={(e) => { e.preventDefault(); handleCreateRequest(); }} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                نوع منبع <span className="text-red-500">*</span>
              </label>
              <select
                value={resourceType}
                onChange={(e) => setResourceType(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="">انتخاب نوع منبع</option>
                <option value="application">اپلیکیشن</option>
                <option value="role">نقش</option>
                <option value="group">گروه</option>
                <option value="resource">منبع</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                شناسه منبع <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={resourceId}
                onChange={(e) => setResourceId(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                placeholder="شناسه منبع را وارد کنید"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                نام منبع (اختیاری)
              </label>
              <input
                type="text"
                value={resourceName}
                onChange={(e) => setResourceName(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                placeholder="نام منبع را وارد کنید"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                سطح دسترسی <span className="text-red-500">*</span>
              </label>
              <select
                value={accessLevel}
                onChange={(e) => setAccessLevel(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="">انتخاب سطح دسترسی</option>
                <option value="read">خواندن</option>
                <option value="write">نوشتن</option>
                <option value="admin">مدیر</option>
                <option value="owner">مالک</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                توجیه <span className="text-red-500">*</span>
              </label>
              <textarea
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                placeholder="دلیل نیاز به این دسترسی را توضیح دهید..."
              />
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}
                className="px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
              >
                انصراف
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50"
              >
                {submitting ? 'در حال ارسال...' : 'ایجاد درخواست'}
              </button>
            </div>
          </form>
        </Modal>

        {/* Approval Modal */}
        <Modal
          isOpen={showApprovalModal}
          onClose={() => {
            setShowApprovalModal(false);
            setSelectedRequest(null);
            setReviewerComment('');
          }}
          title="بررسی درخواست دسترسی"
          size="lg"
        >
          {selectedRequest && (
            <div className="space-y-4">
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-500 dark:text-slate-400">درخواست‌کننده:</span>
                    <div className="font-medium text-slate-900 dark:text-white">
                      {selectedRequest.requesterName || 'N/A'}
                    </div>
                    <div className="text-xs text-slate-500">{selectedRequest.requesterEmail || 'N/A'}</div>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400">تاریخ درخواست:</span>
                    <div className="font-medium text-slate-900 dark:text-white">
                      {formatDateTime(selectedRequest.createdAt)}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400">نوع منبع:</span>
                    <div className="font-medium text-slate-900 dark:text-white">
                      {selectedRequest.targetResourceType}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400">سطح دسترسی:</span>
                    <div className="font-medium text-slate-900 dark:text-white">
                      {selectedRequest.requestedScopes?.join(', ') || 'N/A'}
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-slate-500 dark:text-slate-400">منبع:</span>
                  <div className="font-medium text-slate-900 dark:text-white">
                    {selectedRequest.targetResourceName || selectedRequest.targetResourceId}
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-slate-500 dark:text-slate-400">توجیه:</span>
                  <div className="mt-1 text-slate-900 dark:text-white">{selectedRequest.justification}</div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  <MessageSquare className="w-4 h-4 inline ml-1" />
                  نظر بررسی‌کننده
                </label>
                <textarea
                  value={reviewerComment}
                  onChange={(e) => setReviewerComment(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="نظر خود را وارد کنید (اختیاری)..."
                />
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button
                  onClick={() => {
                    setShowApprovalModal(false);
                    setSelectedRequest(null);
                    setReviewerComment('');
                  }}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
                >
                  انصراف
                </button>
                <button
                  onClick={() => handleApproveReject(false)}
                  disabled={submitting}
                  className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all disabled:opacity-50"
                >
                  {submitting ? 'در حال پردازش...' : 'رد کردن'}
                </button>
                <button
                  onClick={() => handleApproveReject(true)}
                  disabled={submitting}
                  className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all disabled:opacity-50"
                >
                  {submitting ? 'در حال پردازش...' : 'تأیید'}
                </button>
              </div>
            </div>
          )}
        </Modal>

        {/* Details Modal */}
        <Modal
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedRequest(null);
          }}
          title="جزئیات درخواست دسترسی"
          size="lg"
        >
          {selectedRequest && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                  <User className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    {selectedRequest.requesterName || 'کاربر ناشناس'}
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400">
                    {selectedRequest.requesterEmail || 'بدون ایمیل'}
                  </p>
                </div>
                <span className={`px-3 py-1 text-sm font-medium rounded-full mr-auto ${getStatusStyle(selectedRequest.status)}`}>
                  {getStatusLabel(selectedRequest.status)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-2">
                    <Shield className="w-4 h-4" />
                    نوع منبع
                  </div>
                  <p className="font-medium text-slate-900 dark:text-white">{selectedRequest.targetResourceType}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-2">
                    <FileText className="w-4 h-4" />
                    منبع
                  </div>
                  <p className="font-medium text-slate-900 dark:text-white">
                    {selectedRequest.targetResourceName || selectedRequest.targetResourceId}
                  </p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-2">
                    <KeyRound className="w-4 h-4" />
                    سطح دسترسی
                  </div>
                  <p className="font-medium text-slate-900 dark:text-white">
                    {selectedRequest.requestedScopes?.join(', ') || 'N/A'}
                  </p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-2">
                    <Calendar className="w-4 h-4" />
                    تاریخ درخواست
                  </div>
                  <p className="font-medium text-slate-900 dark:text-white">{formatDateTime(selectedRequest.createdAt)}</p>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4">
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-2">
                  <MessageSquare className="w-4 h-4" />
                  توجیه
                </div>
                <p className="text-slate-900 dark:text-white">{selectedRequest.justification}</p>
              </div>

              {selectedRequest.reviewedAt && (
                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-2">
                    <Clock className="w-4 h-4" />
                    بررسی شده در
                  </div>
                  <p className="text-slate-900 dark:text-white">{formatDateTime(selectedRequest.reviewedAt)}</p>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedRequest(null);
                  }}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
                >
                  بستن
                </button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </>
  );
}
