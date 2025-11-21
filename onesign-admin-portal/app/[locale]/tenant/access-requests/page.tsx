'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { getTenantId } from '@/lib/tenant-context';
import LoadingOverlay from '@/app/components/LoadingOverlay';
import Modal from '@/app/components/Modal';
import StatusBadge from '@/app/components/StatusBadge';
import DataTable, { Column } from '@/app/components/DataTable';

interface AccessRequest {
  id: string;
  tenantId: string;
  requestedByUserId: string;
  requestedByUserName: string;
  requestedByUserEmail: string;
  resourceType: string;
  resourceId: string;
  resourceName: string;
  accessLevel: string;
  justification: string;
  status: string;
  reviewedByUserId: string | null;
  reviewedByUserName: string | null;
  reviewerComment: string | null;
  requestedAt: string;
  reviewedAt: string | null;
  expiresAt: string | null;
}

type Tab = 'pending' | 'approved' | 'rejected' | 'all';

export default function AccessRequestsPage() {
  const t = useTranslations();
  const [activeTab, setActiveTab] = useState<Tab>('pending');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Data states
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
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
  const pageSize = 20;

  const tenantId = getTenantId();

  useEffect(() => {
    fetchRequests();
  }, [activeTab, pageNumber]);

  const fetchRequests = async () => {
    setLoading(true);
    setError('');
    try {
      let url = `http://localhost:7000/api/tenant/access-requests?tenantId=${tenantId}&pageNumber=${pageNumber}&pageSize=${pageSize}`;

      if (activeTab !== 'all') {
        url += `&status=${activeTab}`;
      }

      const response = await fetch(url, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch access requests');
      }

      const data = await response.json();
      setRequests(data);
    } catch (err) {
      setError(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRequest = async () => {
    if (!resourceType || !resourceId || !accessLevel || !justification) {
      setError('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      const response = await fetch(
        `http://localhost:7000/api/tenant/access-requests?tenantId=${tenantId}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            resourceType,
            resourceId,
            resourceName: resourceName || resourceId,
            accessLevel,
            justification,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to create access request');
      }

      setSuccess('Access request created successfully');
      setShowCreateModal(false);
      resetForm();
      fetchRequests();
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
      const response = await fetch(
        `http://localhost:7000/api/tenant/access-requests/${selectedRequest.id}/approve?tenantId=${tenantId}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            approved: approve,
            comment: reviewerComment || null,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to ${approve ? 'approve' : 'reject'} access request`);
      }

      setSuccess(`Access request ${approve ? 'approved' : 'rejected'} successfully`);
      setShowApprovalModal(false);
      setSelectedRequest(null);
      setReviewerComment('');
      fetchRequests();
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
    return date.toLocaleString();
  };

  const columns: Column<AccessRequest>[] = [
    {
      key: 'requestedAt',
      label: 'Requested At',
      render: (item) => formatDate(item.requestedAt),
      sortable: true,
    },
    {
      key: 'requestedByUserName',
      label: 'Requested By',
      render: (item) => (
        <div>
          <div className="font-medium">{item.requestedByUserName}</div>
          <div className="text-xs text-gray-500">{item.requestedByUserEmail}</div>
        </div>
      ),
    },
    {
      key: 'resourceType',
      label: 'Resource Type',
      sortable: true,
    },
    {
      key: 'resourceName',
      label: 'Resource',
      render: (item) => (
        <div>
          <div className="font-medium">{item.resourceName}</div>
          <div className="text-xs text-gray-500">{item.accessLevel}</div>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (item) => <StatusBadge status={item.status} />,
      sortable: true,
    },
    {
      key: 'reviewedAt',
      label: 'Reviewed At',
      render: (item) => formatDate(item.reviewedAt),
    },
  ];

  const getStatusCounts = () => {
    const counts = {
      pending: 0,
      approved: 0,
      rejected: 0,
      all: requests.length,
    };

    requests.forEach((req) => {
      const status = req.status.toLowerCase();
      if (status === 'pending') counts.pending++;
      if (status === 'approved') counts.approved++;
      if (status === 'rejected') counts.rejected++;
    });

    return counts;
  };

  const counts = getStatusCounts();

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Access Requests
            </h1>
            <p className="text-gray-600 mt-2">Manage access request workflow</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Request
          </button>
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

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm font-medium text-gray-500">All Requests</div>
          <div className="text-2xl font-bold text-gray-900">{counts.all}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm font-medium text-yellow-500">Pending</div>
          <div className="text-2xl font-bold text-yellow-600">{counts.pending}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm font-medium text-green-500">Approved</div>
          <div className="text-2xl font-bold text-green-600">{counts.approved}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm font-medium text-red-500">Rejected</div>
          <div className="text-2xl font-bold text-red-600">{counts.rejected}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {(['pending', 'approved', 'rejected', 'all'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setPageNumber(1);
              }}
              className={`py-4 px-1 border-b-2 font-medium text-sm capitalize transition-colors ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Data Table */}
      <DataTable
        data={requests}
        columns={columns}
        loading={loading}
        emptyMessage="No access requests found"
        actions={(item) => (
          <div className="flex gap-2">
            <button
              onClick={() => {
                setSelectedRequest(item);
                setShowApprovalModal(true);
              }}
              className="text-blue-600 hover:text-blue-900 font-medium"
            >
              Review
            </button>
          </div>
        )}
      />

      {/* Pagination */}
      {requests.length > 0 && (
        <div className="mt-4 flex items-center justify-between">
          <button
            onClick={() => setPageNumber(pageNumber - 1)}
            disabled={pageNumber === 1}
            className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            {t('common.previous')}
          </button>
          <span className="text-sm text-gray-700">
            {t('common.page')} {pageNumber}
          </span>
          <button
            onClick={() => setPageNumber(pageNumber + 1)}
            disabled={requests.length < pageSize}
            className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            {t('common.next')}
          </button>
        </div>
      )}

      {/* Create Request Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          resetForm();
        }}
        title="Create Access Request"
        size="lg"
        footer={
          <>
            <button
              onClick={() => {
                setShowCreateModal(false);
                resetForm();
              }}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateRequest}
              disabled={submitting}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Create Request'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Resource Type <span className="text-red-500">*</span>
            </label>
            <select
              value={resourceType}
              onChange={(e) => setResourceType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select resource type</option>
              <option value="application">Application</option>
              <option value="role">Role</option>
              <option value="group">Group</option>
              <option value="resource">Resource</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Resource ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={resourceId}
              onChange={(e) => setResourceId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter resource ID"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Resource Name</label>
            <input
              type="text"
              value={resourceName}
              onChange={(e) => setResourceName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter resource name (optional)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Access Level <span className="text-red-500">*</span>
            </label>
            <select
              value={accessLevel}
              onChange={(e) => setAccessLevel(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select access level</option>
              <option value="read">Read</option>
              <option value="write">Write</option>
              <option value="admin">Admin</option>
              <option value="owner">Owner</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Justification <span className="text-red-500">*</span>
            </label>
            <textarea
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Explain why you need this access..."
            />
          </div>
        </div>
      </Modal>

      {/* Approval Modal */}
      <Modal
        isOpen={showApprovalModal}
        onClose={() => {
          setShowApprovalModal(false);
          setSelectedRequest(null);
          setReviewerComment('');
        }}
        title="Review Access Request"
        size="lg"
        footer={
          <>
            <button
              onClick={() => {
                setShowApprovalModal(false);
                setSelectedRequest(null);
                setReviewerComment('');
              }}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => handleApproveReject(false)}
              disabled={submitting}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {submitting ? 'Processing...' : 'Reject'}
            </button>
            <button
              onClick={() => handleApproveReject(true)}
              disabled={submitting}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {submitting ? 'Processing...' : 'Approve'}
            </button>
          </>
        }
      >
        {selectedRequest && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Requested By:</span>
                  <div className="font-medium">{selectedRequest.requestedByUserName}</div>
                  <div className="text-xs text-gray-500">{selectedRequest.requestedByUserEmail}</div>
                </div>
                <div>
                  <span className="text-gray-600">Requested At:</span>
                  <div className="font-medium">{formatDate(selectedRequest.requestedAt)}</div>
                </div>
                <div>
                  <span className="text-gray-600">Resource Type:</span>
                  <div className="font-medium">{selectedRequest.resourceType}</div>
                </div>
                <div>
                  <span className="text-gray-600">Access Level:</span>
                  <div className="font-medium">{selectedRequest.accessLevel}</div>
                </div>
              </div>
              <div className="mt-4">
                <span className="text-gray-600">Resource:</span>
                <div className="font-medium">{selectedRequest.resourceName}</div>
              </div>
              <div className="mt-4">
                <span className="text-gray-600">Justification:</span>
                <div className="mt-1 text-gray-900">{selectedRequest.justification}</div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Reviewer Comment</label>
              <textarea
                value={reviewerComment}
                onChange={(e) => setReviewerComment(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Add a comment (optional)..."
              />
            </div>
          </div>
        )}
      </Modal>

      <LoadingOverlay isLoading={submitting} message="Processing request..." />
    </div>
  );
}
