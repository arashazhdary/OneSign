import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getTenantId } from '@/lib/tenant-context';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import Modal from '@/components/common/Modal';
import StatusBadge from '@/components/common/StatusBadge';
import { accessService } from '@/lib/api/services/access.service';
import { Helmet } from 'react-helmet-async';

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

  // Data states
  const [request, setRequest] = useState<AccessRequest | null>(null);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [auditTrail, setAuditTrail] = useState<AuditEntry[]>([]);

  // Modal states
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);

  // Form states
  const [approvalDecision, setApprovalDecision] = useState<'approved' | 'rejected' | ''>('');
  const [approvalComment, setApprovalComment] = useState('');
  const [newComment, setNewComment] = useState('');

  const tenantId = getTenantId();

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
      const data = await accessService.getAccessRequestById(tenantId, requestId);
      setRequest(data);
    } catch (err) {
      setError(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const fetchTimeline = async () => {
    try {
      const data = await accessService.getAccessRequestTimeline(tenantId, requestId);
      setTimeline(data);
    } catch (err) {
      console.error('Failed to fetch timeline:', err);
    }
  };

  const fetchAuditTrail = async () => {
    try {
      const data = await accessService.getAccessRequestAuditTrail(tenantId, requestId);
      setAuditTrail(data);
    } catch (err) {
      console.error('Failed to fetch audit trail:', err);
    }
  };

  const handleApproval = async () => {
    if (!approvalDecision) {
      setError('Please select a decision');
      return;
    }

    setProcessing(true);
    setError('');
    setSuccess('');
    try {
      if (approvalDecision === 'approved') {
        await accessService.approveAccessRequest(tenantId, requestId, approvalComment);
      } else {
        await accessService.rejectAccessRequest(tenantId, requestId, approvalComment);
      }
      setSuccess(`Request ${approvalDecision} successfully`);
      setShowApprovalModal(false);
      setApprovalDecision('');
      setApprovalComment('');
      fetchRequest();
      if (activeTab === 'timeline') fetchTimeline();
    } catch (err) {
      setError(t('common.error'));
    } finally {
      setProcessing(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      setError('Please enter a comment');
      return;
    }

    setProcessing(true);
    setError('');
    setSuccess('');
    try {
      await accessService.addAccessRequestComment(tenantId, requestId, newComment);
      setSuccess('Comment added successfully');
      setShowCommentModal(false);
      setNewComment('');
      fetchRequest();
    } catch (err) {
      setError(t('common.error'));
    } finally {
      setProcessing(false);
    }
  };

  const handleWithdraw = async () => {
    if (!confirm('Are you sure you want to withdraw this request?')) return;

    setProcessing(true);
    setError('');
    setSuccess('');
    try {
      await accessService.withdrawAccessRequest(tenantId, requestId);
      setSuccess('Request withdrawn successfully');
      fetchRequest();
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

  const getStatusColor = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      'in-review': 'bg-blue-100 text-blue-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      withdrawn: 'bg-gray-100 text-gray-800',
      expired: 'bg-orange-100 text-orange-800',
    };
    return statusMap[status.toLowerCase()] || statusMap.pending;
  };

  const getPriorityColor = (priority: string) => {
    const priorityMap: Record<string, string> = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800',
    };
    return priorityMap[priority.toLowerCase()] || priorityMap.medium;
  };

  const getDecisionIcon = (decision: string) => {
    if (decision === 'approved') {
      return (
        <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      );
    } else if (decision === 'rejected') {
      return (
        <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      );
    }
    return (
      <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
      </svg>
    );
  };

  if (loading) {
    return ;
  }

  if (!request) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          Access request not found
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="text-blue-600 hover:text-blue-800 mb-4 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Access Requests
        </button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
              Access Request
            </h1>
            <p className="text-gray-700 mt-2">
              {request.requesterName} requesting {request.requestedAccessLevel} access to {request.resourceName}
            </p>
          </div>
          <div className="flex gap-3 items-center">
            <span className={`px-3 py-1 text-sm font-semibold rounded-full capitalize ${getPriorityColor(request.priority)}`}>
              {request.priority}
            </span>
            <span className={`px-3 py-1 text-sm font-semibold rounded-full capitalize ${getStatusColor(request.status)}`}>
              {request.status}
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      {/* Action Buttons */}
      <div className="mb-6 flex gap-3">
        {request.status === 'pending' && (
          <>
            <button
              onClick={() => setShowApprovalModal(true)}
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
            >
              Review Request
            </button>
            <button
              onClick={handleWithdraw}
              disabled={processing}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
            >
              Withdraw
            </button>
          </>
        )}
        <button
          onClick={() => setShowCommentModal(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          Add Comment
        </button>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {(['information', 'timeline', 'approvals', 'justification', 'comments', 'audit-trail'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-1 border-b-2 font-medium text-sm capitalize transition-colors ${
                activeTab === tab
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.replace('-', ' ')}
            </button>
          ))}
        </nav>
      </div>

      {/* Information Tab */}
      {activeTab === 'information' && (
        <div className="space-y-6">
          {/* Requester Information */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Requester Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <div className="text-gray-900">{request.requesterName}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <div className="text-gray-900">{request.requesterEmail}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
                <div className="text-gray-900 font-mono text-sm">{request.requesterId}</div>
              </div>
            </div>
          </div>

          {/* Request Details */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Request Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Resource Type</label>
                <div className="text-gray-900 capitalize">{request.resourceType}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Resource Name</label>
                <div className="text-gray-900">{request.resourceName}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Resource ID</label>
                <div className="text-gray-900 font-mono text-sm">{request.resourceId}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Access Level</label>
                <div className="text-gray-900 capitalize">{request.requestedAccessLevel}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Request Type</label>
                <div className="text-gray-900 capitalize">{request.requestType}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Created At</label>
                <div className="text-gray-900">{formatDate(request.createdAt)}</div>
              </div>
              {request.requestedDuration && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                  <div className="text-gray-900">{request.requestedDuration} days</div>
                </div>
              )}
              {request.expiresAt && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expires At</label>
                  <div className="text-gray-900">{formatDate(request.expiresAt)}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Timeline Tab */}
      {activeTab === 'timeline' && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Request Timeline</h3>
          {timeline.length === 0 ? (
            <p className="text-gray-500">No timeline events</p>
          ) : (
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
              <div className="space-y-6">
                {timeline.map((event, index) => (
                  <div key={event.id} className="relative pl-10">
                    <div className="absolute left-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="font-medium text-gray-900">{event.eventType}</div>
                      <div className="text-sm text-gray-600 mt-1">{event.description}</div>
                      <div className="text-xs text-gray-500 mt-2">
                        {formatDate(event.occurredAt)}
                        {event.userName && ` by ${event.userName}`}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Approvals Tab */}
      {activeTab === 'approvals' && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Approval Chain</h3>
          {request.approvals.length === 0 ? (
            <p className="text-gray-500">No approvals yet</p>
          ) : (
            <div className="space-y-4">
              {request.approvals.map((approval) => (
                <div key={approval.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {getDecisionIcon(approval.decision)}
                      <div>
                        <div className="font-medium text-gray-900">{approval.approverName}</div>
                        <div className="text-sm text-gray-600">{approval.approverEmail}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          Level {approval.level} Approver
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${
                        approval.decision === 'approved' ? 'bg-green-100 text-green-800' :
                        approval.decision === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {approval.decision}
                      </span>
                      <div className="text-xs text-gray-500 mt-1">
                        {formatDate(approval.decidedAt)}
                      </div>
                    </div>
                  </div>
                  {approval.comments && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                        {approval.comments}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Justification Tab */}
      {activeTab === 'justification' && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Business Justification</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Justification</label>
              <div className="bg-gray-50 p-4 rounded-lg text-gray-900">
                {request.justification || t('common.noJustificationProvided')}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Business Reason</label>
              <div className="bg-gray-50 p-4 rounded-lg text-gray-900">
                {request.businessReason || t('common.noBusinessReasonProvided')}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Comments Tab */}
      {activeTab === 'comments' && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Comments & Discussions</h3>
          {request.comments.length === 0 ? (
            <p className="text-gray-500">No comments yet</p>
          ) : (
            <div className="space-y-4">
              {request.comments.map((comment) => (
                <div key={comment.id} className="border-l-4 border-green-500 pl-4 py-3 bg-gray-50 rounded-r-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-medium text-gray-900">{comment.userName}</div>
                      <div className="text-sm text-gray-700 mt-2">{comment.content}</div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatDate(comment.createdAt)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Audit Trail Tab */}
      {activeTab === 'audit-trail' && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Audit Trail</h3>
          {auditTrail.length === 0 ? (
            <p className="text-gray-500">No audit entries</p>
          ) : (
            <div className="space-y-3">
              {auditTrail.map((entry) => (
                <div key={entry.id} className="border-l-4 border-blue-500 pl-4 py-3 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{entry.action}</div>
                      <div className="text-sm text-gray-600 mt-1">
                        Performed by {entry.performedBy}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {formatDate(entry.performedAt)} | IP: {entry.ipAddress}
                      </div>
                      {Object.keys(entry.changes).length > 0 && (
                        <div className="mt-2 bg-gray-50 p-2 rounded text-xs">
                          <pre className="text-gray-700 overflow-x-auto">
                            {JSON.stringify(entry.changes, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Approval Modal */}
      <Modal
        isOpen={showApprovalModal}
        onClose={() => {
          setShowApprovalModal(false);
          setApprovalDecision('');
          setApprovalComment('');
        }}
        title="Review Access Request"
        size="lg"
        footer={
          <>
            <button
              onClick={() => {
                setShowApprovalModal(false);
                setApprovalDecision('');
                setApprovalComment('');
              }}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={handleApproval}
              disabled={processing || !approvalDecision}
              className={`px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 ${
                approvalDecision === 'approved'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {processing ? 'Processing...' : `${approvalDecision === 'approved' ? 'Approve' : 'Reject'} Request`}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Decision</label>
            <div className="flex gap-4">
              <button
                onClick={() => setApprovalDecision('approved')}
                className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${
                  approvalDecision === 'approved'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:border-green-300'
                }`}
              >
                Approve
              </button>
              <button
                onClick={() => setApprovalDecision('rejected')}
                className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${
                  approvalDecision === 'rejected'
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-gray-200 hover:border-red-300'
                }`}
              >
                Reject
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Comments (Optional)</label>
            <textarea
              value={approvalComment}
              onChange={(e) => setApprovalComment(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              placeholder="Add your comments..."
            />
          </div>
        </div>
      </Modal>

      {/* Comment Modal */}
      <Modal
        isOpen={showCommentModal}
        onClose={() => {
          setShowCommentModal(false);
          setNewComment('');
        }}
        title={`${t('common.add')} ${t('common.comment')}`}
        footer={
          <>
            <button
              onClick={() => {
                setShowCommentModal(false);
                setNewComment('');
              }}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={handleAddComment}
              disabled={processing || !newComment.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {processing ? 'Adding...' : 'Add Comment'}
            </button>
          </>
        }
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Comment</label>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your comment..."
          />
        </div>
      </Modal>

      
    </div>
  );
}
