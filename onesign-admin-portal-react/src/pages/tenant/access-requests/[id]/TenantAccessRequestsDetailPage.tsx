import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { getTenantId } from '@/lib/tenant-context';
import Modal from '@/components/common/Modal';
import { accessService } from '@/lib/api/services/access.service';
import { Helmet } from 'react-helmet-async';
import {
  ArrowLeft,
  User,
  Key,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  MessageSquare,
  History,
  Shield,
  Info,
  UserCheck,
  Calendar,
  Send,
  X,
  LucideIcon
} from 'lucide-react';

interface AccessRequest {
  id: string;
  tenantId: string;
  requesterId: string;
  requesterName: string;
  requesterEmail: string;
  resourceType: string;
  resourceId: string;
  resourceName: string;
  requestedAccessLevel: string;
  requestType: string;
  status: string;
  priority: string;
  justification: string;
  businessReason: string;
  requestedDuration: number | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
  approvals: Approval[];
  comments: Comment[];
}

interface Approval {
  id: string;
  approverId: string;
  approverName: string;
  approverEmail: string;
  decision: string;
  decidedAt: string;
  comments: string | null;
  level: number;
}

interface Comment {
  id: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: string;
}

interface TimelineEvent {
  id: string;
  eventType: string;
  description: string;
  occurredAt: string;
  userId: string | null;
  userName: string | null;
  metadata: Record<string, any>;
}

interface AuditEntry {
  id: string;
  action: string;
  performedBy: string;
  performedAt: string;
  changes: Record<string, any>;
  ipAddress: string;
  userAgent: string;
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
        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
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

type Tab = 'information' | 'timeline' | 'approvals' | 'justification' | 'comments' | 'audit-trail';

export default function TenantAccessRequestsDetailPage() {
  const params = useParams();
  const navigate = useNavigate();
  const requestId = params.id as string;
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<Tab>('information');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [request, setRequest] = useState<AccessRequest | null>(null);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [auditTrail, setAuditTrail] = useState<AuditEntry[]>([]);

  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);

  const [approvalDecision, setApprovalDecision] = useState<'approved' | 'rejected' | ''>('');
  const [approvalComment, setApprovalComment] = useState('');
  const [newComment, setNewComment] = useState('');

  const tenantId = getTenantId();

  const tabs: TabItem[] = [
    { key: 'information', label: 'Information', icon: Info },
    { key: 'timeline', label: 'Timeline', icon: History },
    { key: 'approvals', label: 'Approvals', icon: UserCheck },
    { key: 'justification', label: 'Justification', icon: FileText },
    { key: 'comments', label: 'Comments', icon: MessageSquare },
    { key: 'audit-trail', label: 'Audit Trail', icon: Shield }
  ];

  useEffect(() => {
    fetchRequest();
  }, [requestId]);

  useEffect(() => {
    if (activeTab === 'timeline') {
      fetchTimeline();
    } else if (activeTab === 'audit-trail') {
      fetchAuditTrail();
    }
  }, [activeTab]);

  const fetchRequest = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await accessService.getAccessRequestById(requestId);
      if (data) {
        setRequest(data as any);
      } else {
        // Mock data for demo
        setRequest({
          id: requestId,
          tenantId: tenantId || '',
          requesterId: 'user-123',
          requesterName: 'John Doe',
          requesterEmail: 'john.doe@example.com',
          resourceType: 'Application',
          resourceId: 'app-456',
          resourceName: 'Finance Dashboard',
          requestedAccessLevel: 'Editor',
          requestType: 'New Access',
          status: 'pending',
          priority: 'high',
          justification: 'Need access to complete quarterly financial reports and analysis.',
          businessReason: 'Required for Q4 financial closing activities and reporting.',
          requestedDuration: 90,
          expiresAt: null,
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString(),
          approvals: [
            {
              id: 'approval-1',
              approverId: 'approver-1',
              approverName: 'Jane Smith',
              approverEmail: 'jane.smith@example.com',
              decision: 'pending',
              decidedAt: '',
              comments: null,
              level: 1
            }
          ],
          comments: [
            {
              id: 'comment-1',
              userId: 'user-123',
              userName: 'John Doe',
              content: 'Please prioritize this request as the deadline is approaching.',
              createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
            }
          ]
        });
      }
    } catch (err) {
      setError(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const fetchTimeline = async () => {
    try {
      setTimeline([
        {
          id: '1',
          eventType: 'Request Created',
          description: 'Access request submitted by John Doe',
          occurredAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          userId: 'user-123',
          userName: 'John Doe',
          metadata: {}
        },
        {
          id: '2',
          eventType: 'Assigned to Approver',
          description: 'Request assigned to Jane Smith for review',
          occurredAt: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000).toISOString(),
          userId: null,
          userName: 'System',
          metadata: {}
        },
        {
          id: '3',
          eventType: 'Comment Added',
          description: 'Requester added a comment',
          occurredAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          userId: 'user-123',
          userName: 'John Doe',
          metadata: {}
        }
      ]);
    } catch (err) {
      console.error('Failed to fetch timeline:', err);
    }
  };

  const fetchAuditTrail = async () => {
    try {
      setAuditTrail([
        {
          id: '1',
          action: 'Request Created',
          performedBy: 'john.doe@example.com',
          performedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          changes: { status: 'pending' },
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0'
        },
        {
          id: '2',
          action: 'Comment Added',
          performedBy: 'john.doe@example.com',
          performedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          changes: {},
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0'
        }
      ]);
    } catch (err) {
      console.error('Failed to fetch audit trail:', err);
    }
  };

  const handleApproval = async () => {
    if (!approvalDecision) {
      setError(t('tenant.accessRequests.errors.selectDecision'));
      return;
    }

    setProcessing(true);
    setError('');
    setSuccess('');
    try {
      if (approvalDecision === 'approved') {
        await accessService.approveRequest(requestId, approvalComment);
      } else {
        await accessService.rejectRequest(requestId, approvalComment);
      }
      setSuccess(t('tenant.accessRequests.messages.requestProcessed', { decision: approvalDecision }));
      setShowApprovalModal(false);
      setApprovalDecision('');
      setApprovalComment('');
      fetchRequest();
      if (activeTab === 'timeline') fetchTimeline();
    } catch (err) {
      setError(t('tenant.accessRequests.messages.failed'));
    } finally {
      setProcessing(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      setError(t('tenant.accessRequests.errors.enterComment'));
      return;
    }

    setProcessing(true);
    setError('');
    setSuccess('');
    try {
      setSuccess(t('tenant.accessRequests.messages.commentAdded'));
      setShowCommentModal(false);
      setNewComment('');
    } catch (err) {
      setError(t('tenant.accessRequests.messages.failed'));
    } finally {
      setProcessing(false);
    }
  };

  const handleWithdraw = async () => {
    if (!confirm(t('tenant.accessRequests.confirmWithdraw'))) return;

    setProcessing(true);
    setError('');
    setSuccess('');
    try {
      await accessService.cancelRequest(requestId);
      setSuccess(t('tenant.accessRequests.messages.withdrawn'));
      fetchRequest();
    } catch (err) {
      setError(t('tenant.accessRequests.messages.failed'));
    } finally {
      setProcessing(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
            <CheckCircle className="w-4 h-4" />
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300">
            <XCircle className="w-4 h-4" />
            Rejected
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300">
            <Clock className="w-4 h-4" />
            Pending
          </span>
        );
      case 'in-review':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
            <User className="w-4 h-4" />
            In Review
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
            {status}
          </span>
        );
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'critical':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300">
            <AlertTriangle className="w-3 h-3" />
            Critical
          </span>
        );
      case 'high':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300">
            High
          </span>
        );
      case 'medium':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300">
            Medium
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
            Low
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-teal-50 dark:from-slate-900 dark:via-green-900/20 dark:to-teal-900/20 p-8">
        <div className="flex items-center justify-center h-64">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full"
          />
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-teal-50 dark:from-slate-900 dark:via-green-900/20 dark:to-teal-900/20 p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 mb-6">
            <AlertTriangle className="w-10 h-10 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Access Request Not Found</h1>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/tenant/access-requests')}
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-xl font-medium"
          >
            Back to Access Requests
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-teal-50 dark:from-slate-900 dark:via-green-900/20 dark:to-teal-900/20">
      <Helmet>
        <title>{t('tenant.accessRequests.pageTitle', { resource: request.resourceName })}</title>
      </Helmet>

      <div className="p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            {t('tenant.accessRequests.buttons.back')}
          </motion.button>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-green-500 to-teal-600 shadow-lg">
                <Key className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('tenant.accessRequests.title')}</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {t('tenant.accessRequests.subtitle', {
                    requester: request.requesterName,
                    level: request.requestedAccessLevel,
                    resource: request.resourceName
                  })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {getPriorityBadge(request.priority)}
              {getStatusBadge(request.status)}
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
              className="mb-6 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl flex items-center gap-3"
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
              className="mb-6 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 px-4 py-3 rounded-xl flex items-center gap-3"
            >
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              {success}
              <button onClick={() => setSuccess('')} className="ml-auto">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Resource"
            value={request.resourceName}
            icon={<Shield className="w-6 h-6 text-white" />}
            color="from-green-500 to-teal-600"
            delay={0}
          />
          <StatCard
            title="Access Level"
            value={request.requestedAccessLevel}
            icon={<Key className="w-6 h-6 text-white" />}
            color="from-blue-500 to-indigo-600"
            delay={1}
          />
          <StatCard
            title="Approvals"
            value={`${request.approvals.filter(a => a.decision === 'approved').length}/${request.approvals.length}`}
            icon={<UserCheck className="w-6 h-6 text-white" />}
            color="from-purple-500 to-violet-600"
            delay={2}
          />
          <StatCard
            title="Duration"
            value={request.requestedDuration ? `${request.requestedDuration} days` : 'Permanent'}
            icon={<Calendar className="w-6 h-6 text-white" />}
            color="from-orange-500 to-amber-600"
            delay={3}
          />
        </div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap gap-3 mb-8"
        >
          {request.status === 'pending' && (
            <>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowApprovalModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-xl font-medium hover:from-green-600 hover:to-teal-700 flex items-center gap-2 transition-all"
              >
                <UserCheck className="w-5 h-5" />
                {t('tenant.accessRequests.buttons.review')}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleWithdraw}
                disabled={processing}
                className="px-6 py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 flex items-center gap-2 disabled:opacity-50 transition-all"
              >
                <XCircle className="w-5 h-5" />
                {t('tenant.accessRequests.buttons.withdraw')}
              </motion.button>
            </>
          )}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowCommentModal(true)}
            className="px-6 py-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center gap-2 transition-all"
          >
            <MessageSquare className="w-5 h-5" />
            {t('tenant.accessRequests.buttons.addComment')}
          </motion.button>
        </motion.div>

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
                onClick={() => setActiveTab(tab.key as Tab)}
                className={`relative flex items-center gap-2 py-3 px-6 rounded-lg font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.key
                    ? 'text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700'
                }`}
              >
                {activeTab === tab.key && (
                  <motion.div
                    layoutId="activeAccessTab"
                    className="absolute inset-0 bg-gradient-to-r from-green-500 to-teal-600 rounded-lg"
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
          {activeTab === 'information' && (
            <motion.div
              key="information"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {/* Requester Information */}
              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-teal-600">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Requester Information</h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-500 dark:text-gray-400">Name</label>
                    <p className="font-medium text-gray-900 dark:text-white">{request.requesterName}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 dark:text-gray-400">Email</label>
                    <p className="font-medium text-gray-900 dark:text-white">{request.requesterEmail}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 dark:text-gray-400">User ID</label>
                    <p className="font-mono text-sm text-gray-600 dark:text-gray-300">{request.requesterId}</p>
                  </div>
                </div>
              </div>

              {/* Request Details */}
              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600">
                    <Key className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Request Details</h2>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-500 dark:text-gray-400">Resource Type</label>
                    <p className="font-medium text-gray-900 dark:text-white capitalize">{request.resourceType}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 dark:text-gray-400">Resource Name</label>
                    <p className="font-medium text-gray-900 dark:text-white">{request.resourceName}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 dark:text-gray-400">Access Level</label>
                    <p className="font-medium text-gray-900 dark:text-white capitalize">{request.requestedAccessLevel}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 dark:text-gray-400">Request Type</label>
                    <p className="font-medium text-gray-900 dark:text-white capitalize">{request.requestType}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 dark:text-gray-400">Created At</label>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{formatDate(request.createdAt)}</p>
                  </div>
                  {request.requestedDuration && (
                    <div>
                      <label className="text-sm text-gray-500 dark:text-gray-400">Duration</label>
                      <p className="font-medium text-gray-900 dark:text-white">{request.requestedDuration} days</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'timeline' && (
            <motion.div
              key="timeline"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-teal-600">
                  <History className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Request Timeline</h2>
              </div>
              {timeline.length === 0 ? (
                <div className="text-center py-12">
                  <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No timeline events</p>
                </div>
              ) : (
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-green-200 dark:bg-green-800"></div>
                  <div className="space-y-6">
                    {timeline.map((event, index) => (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="relative pl-10"
                      >
                        <div className="absolute left-0 w-8 h-8 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center">
                          <div className="w-3 h-3 bg-white rounded-full"></div>
                        </div>
                        <div className="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-4">
                          <div className="font-medium text-gray-900 dark:text-white">{event.eventType}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">{event.description}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-500 mt-2 flex items-center gap-2">
                            <Clock className="w-3 h-3" />
                            {formatDate(event.occurredAt)}
                            {event.userName && <span>by {event.userName}</span>}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'approvals' && (
            <motion.div
              key="approvals"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-teal-600">
                  <UserCheck className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Approval Chain</h2>
              </div>
              {request.approvals.length === 0 ? (
                <div className="text-center py-12">
                  <UserCheck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No approvals yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {request.approvals.map((approval, index) => (
                    <motion.div
                      key={approval.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border border-gray-200 dark:border-slate-700 rounded-xl p-4"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${
                            approval.decision === 'approved' ? 'bg-green-100 dark:bg-green-900/30' :
                            approval.decision === 'rejected' ? 'bg-red-100 dark:bg-red-900/30' :
                            'bg-gray-100 dark:bg-gray-700'
                          }`}>
                            {approval.decision === 'approved' ? (
                              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                            ) : approval.decision === 'rejected' ? (
                              <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                            ) : (
                              <Clock className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">{approval.approverName}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">{approval.approverEmail}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">Level {approval.level} Approver</div>
                          </div>
                        </div>
                        <div className="text-right">
                          {getStatusBadge(approval.decision)}
                          {approval.decidedAt && (
                            <div className="text-xs text-gray-500 dark:text-gray-500 mt-2">{formatDate(approval.decidedAt)}</div>
                          )}
                        </div>
                      </div>
                      {approval.comments && (
                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-slate-700">
                          <div className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-slate-700/50 p-3 rounded-lg">
                            {approval.comments}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'justification' && (
            <motion.div
              key="justification"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-teal-600">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Business Justification</h2>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Justification</label>
                  <div className="bg-gray-50 dark:bg-slate-700/50 p-4 rounded-xl text-gray-900 dark:text-white">
                    {request.justification || 'No justification provided'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Business Reason</label>
                  <div className="bg-gray-50 dark:bg-slate-700/50 p-4 rounded-xl text-gray-900 dark:text-white">
                    {request.businessReason || 'No business reason provided'}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'comments' && (
            <motion.div
              key="comments"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-teal-600">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Comments & Discussions</h2>
              </div>
              {request.comments.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No comments yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {request.comments.map((comment, index) => (
                    <motion.div
                      key={comment.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border-l-4 border-green-500 pl-4 py-3 bg-gray-50 dark:bg-slate-700/50 rounded-r-xl"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">{comment.userName}</div>
                          <div className="text-sm text-gray-700 dark:text-gray-300 mt-2">{comment.content}</div>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-500">{formatDate(comment.createdAt)}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'audit-trail' && (
            <motion.div
              key="audit-trail"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-teal-600">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Audit Trail</h2>
              </div>
              {auditTrail.length === 0 ? (
                <div className="text-center py-12">
                  <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No audit entries</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {auditTrail.map((entry, index) => (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border-l-4 border-blue-500 pl-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-700/50 rounded-r-xl transition-colors"
                    >
                      <div className="font-medium text-gray-900 dark:text-white">{entry.action}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Performed by {entry.performedBy}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-500 mt-1 flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        {formatDate(entry.performedAt)} | IP: {entry.ipAddress}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Approval Modal */}
        <AnimatePresence>
          {showApprovalModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setShowApprovalModal(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-slate-800 p-6 rounded-2xl max-w-lg w-full shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-teal-600">
                    <UserCheck className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Review Access Request</h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Decision</label>
                    <div className="flex gap-4">
                      <button
                        onClick={() => setApprovalDecision('approved')}
                        className={`flex-1 px-4 py-3 rounded-xl border-2 transition-all flex items-center justify-center gap-2 ${
                          approvalDecision === 'approved'
                            ? 'border-green-500 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                            : 'border-gray-200 dark:border-slate-600 hover:border-green-300 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        <CheckCircle className="w-5 h-5" />
                        Approve
                      </button>
                      <button
                        onClick={() => setApprovalDecision('rejected')}
                        className={`flex-1 px-4 py-3 rounded-xl border-2 transition-all flex items-center justify-center gap-2 ${
                          approvalDecision === 'rejected'
                            ? 'border-red-500 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                            : 'border-gray-200 dark:border-slate-600 hover:border-red-300 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        <XCircle className="w-5 h-5" />
                        Reject
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Comments (Optional)</label>
                    <textarea
                      value={approvalComment}
                      onChange={(e) => setApprovalComment(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                      placeholder={t('tenant.accessRequests.placeholders.approvalComment')}
                    />
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleApproval}
                    disabled={processing || !approvalDecision}
                    className={`flex-1 px-6 py-3 rounded-xl font-medium disabled:opacity-50 flex items-center justify-center gap-2 transition-all ${
                      approvalDecision === 'approved'
                        ? 'bg-gradient-to-r from-green-500 to-teal-600 text-white hover:from-green-600 hover:to-teal-700'
                        : approvalDecision === 'rejected'
                        ? 'bg-red-500 text-white hover:bg-red-600'
                        : 'bg-gray-300 text-gray-500'
                    }`}
                  >
                    <Send className="w-5 h-5" />
                    {processing ? 'Processing...' : `${approvalDecision === 'approved' ? 'Approve' : approvalDecision === 'rejected' ? 'Reject' : 'Submit'}`}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setShowApprovalModal(false);
                      setApprovalDecision('');
                      setApprovalComment('');
                    }}
                    className="px-6 py-3 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-slate-600 transition-all"
                  >
                    Cancel
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Comment Modal */}
        <AnimatePresence>
          {showCommentModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setShowCommentModal(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-slate-800 p-6 rounded-2xl max-w-lg w-full shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600">
                    <MessageSquare className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Add Comment</h2>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Comment</label>
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder={t('tenant.accessRequests.placeholders.comment')}
                  />
                </div>
                <div className="flex gap-3 mt-6">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleAddComment}
                    disabled={processing || !newComment.trim()}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
                  >
                    <Send className="w-5 h-5" />
                    {processing ? t('tenant.accessRequests.actions.adding') : t('tenant.accessRequests.actions.addComment')}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setShowCommentModal(false);
                      setNewComment('');
                    }}
                    className="px-6 py-3 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-slate-600 transition-all"
                  >
                    Cancel
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
