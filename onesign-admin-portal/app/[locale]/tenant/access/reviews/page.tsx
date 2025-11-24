'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { getTenantId } from '@/lib/tenant-context';
import { securityService } from '@/lib/api/services';
import { useAuth } from '@/app/contexts/AuthContext';
import DataTable, { Column } from '@/app/components/DataTable';
import StatusBadge from '@/app/components/StatusBadge';
import ActionButton from '@/app/components/ActionButton';
import Modal from '@/app/components/Modal';
import LoadingOverlay from '@/app/components/LoadingOverlay';

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

export default function TenantAccessReviewsPage() {
  const t = useTranslations();
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

  const fetchReviews = async () => {
    if (!tenantId) return;
    setLoading(true);
    setError('');
    try {
      const data = await securityService.getAccessReviews(tenantId, filterStatus || undefined);
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
      await securityService.createAccessReview({
        tenantId,
        ...createForm,
      });
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
      await securityService.submitReviewDecision(tenantId, reviewId, itemId, decision, notes);
      setSuccess(`Decision ${decision}d successfully`);

      // Refresh the selected review
      const updatedReview = await securityService.getAccessReviewById(tenantId, reviewId);
      setSelectedReview(updatedReview);
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
      await securityService.completeAccessReview(tenantId, reviewId);
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

  const reviewColumns: Column<AccessReview>[] = [
    { key: 'name', label: 'Review Name' },
    { key: 'reviewType', label: 'Type' },
    {
      key: 'status',
      label: 'Status',
      render: (review) => (
        <StatusBadge
          status={review.status}
          variant={
            review.status === 'completed'
              ? 'success'
              : review.status === 'in_progress'
              ? 'warning'
              : review.status === 'cancelled'
              ? 'error'
              : 'info'
          }
        />
      ),
    },
    {
      key: 'dueDate',
      label: 'Due Date',
      render: (review) => new Date(review.dueDate).toLocaleDateString(),
    },
    {
      key: 'statistics',
      label: 'Progress',
      render: (review) =>
        review.statistics ? (
          <div className="text-sm">
            <span className="text-green-600 font-medium">{review.statistics.approved}</span> /{' '}
            <span className="text-red-600 font-medium">{review.statistics.revoked}</span> /{' '}
            <span className="text-gray-600">{review.statistics.pending}</span>
          </div>
        ) : (
          '-'
        ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <LoadingOverlay isLoading={loading} message="Processing..." />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
          Access Reviews
        </h1>
        <p className="text-gray-600">
          Review and certify user access across applications, roles, and permissions
        </p>
      </div>

      {/* Alerts */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-300 text-red-800 rounded-lg">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-4 bg-green-100 border border-green-300 text-green-800 rounded-lg">
          {success}
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 flex items-center gap-4">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <ActionButton onClick={() => setShowCreateModal(true)}>
          Create New Review
        </ActionButton>
      </div>

      {/* Reviews Table */}
      <DataTable
        data={reviews}
        columns={reviewColumns}
        onRowClick={handleViewReview}
        actions={(review) => (
          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleViewReview(review);
              }}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              View Details
            </button>
            {review.status === 'in_progress' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCompleteReview(review.id);
                }}
                className="text-green-600 hover:text-green-800 font-medium"
              >
                Complete
              </button>
            )}
          </div>
        )}
      />

      {/* Create Review Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create Access Review">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Review Name</label>
            <input
              type="text"
              value={createForm.name}
              onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Q4 2024 Application Access Review"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={createForm.description}
              onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Quarterly review of application access..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Review Type</label>
            <select
              value={createForm.reviewType}
              onChange={(e) => setCreateForm({ ...createForm, reviewType: e.target.value as any })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="application">Application Access</option>
              <option value="role">Role Assignments</option>
              <option value="group">Group Memberships</option>
              <option value="permission">Direct Permissions</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Scope</label>
            <input
              type="text"
              value={createForm.scope}
              onChange={(e) => setCreateForm({ ...createForm, scope: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="All applications"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
            <input
              type="date"
              value={createForm.dueDate}
              onChange={(e) => setCreateForm({ ...createForm, dueDate: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-3 mt-6">
            <ActionButton onClick={handleCreateReview} className="flex-1">
              Create Review
            </ActionButton>
            <ActionButton onClick={() => setShowCreateModal(false)} variant="secondary" className="flex-1">
              Cancel
            </ActionButton>
          </div>
        </div>
      </Modal>

      {/* Review Details Modal */}
      <Modal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        title={selectedReview?.name || 'Review Details'}
        size="large"
      >
        {selectedReview && (
          <div className="space-y-6">
            {/* Review Info */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <div className="text-sm text-gray-600">Type</div>
                <div className="font-medium capitalize">{selectedReview.reviewType}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Status</div>
                <StatusBadge status={selectedReview.status} />
              </div>
              <div>
                <div className="text-sm text-gray-600">Due Date</div>
                <div className="font-medium">{new Date(selectedReview.dueDate).toLocaleDateString()}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Progress</div>
                <div className="font-medium">
                  {selectedReview.statistics?.approved || 0} approved /{' '}
                  {selectedReview.statistics?.revoked || 0} revoked /{' '}
                  {selectedReview.statistics?.pending || 0} pending
                </div>
              </div>
            </div>

            {/* Review Items */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Access Items</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {selectedReview.items.map((item) => (
                  <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="font-medium">{item.userName}</div>
                        <div className="text-sm text-gray-600">{item.userEmail}</div>
                        <div className="text-sm text-gray-600 mt-1">
                          {item.accessType}: <span className="font-medium">{item.accessName}</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Granted: {new Date(item.grantedAt).toLocaleDateString()}
                          {item.lastUsedAt && ` | Last used: ${new Date(item.lastUsedAt).toLocaleDateString()}`}
                        </div>
                      </div>
                      <div className="ml-4">
                        {item.decision ? (
                          <StatusBadge
                            status={item.decision}
                            variant={item.decision === 'approve' ? 'success' : 'error'}
                          />
                        ) : (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleSubmitDecision(selectedReview.id, item.id, 'approve')}
                              className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleSubmitDecision(selectedReview.id, item.id, 'revoke')}
                              className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                            >
                              Revoke
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    {item.notes && (
                      <div className="text-sm text-gray-600 mt-2 p-2 bg-gray-50 rounded">
                        <span className="font-medium">Notes:</span> {item.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            {selectedReview.status === 'in_progress' && (
              <div className="flex gap-3 pt-4 border-t">
                <ActionButton onClick={() => handleCompleteReview(selectedReview.id)} className="flex-1">
                  Complete Review
                </ActionButton>
                <ActionButton onClick={() => setShowReviewModal(false)} variant="secondary" className="flex-1">
                  Close
                </ActionButton>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
