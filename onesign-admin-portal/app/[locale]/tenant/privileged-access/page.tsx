'use client';

import { useState, useEffect } from 'react';
import { getTenantId } from '@/lib/tenant-context';
import DataTable, { Column } from '@/app/components/DataTable';
import StatusBadge from '@/app/components/StatusBadge';
import ActionButton from '@/app/components/ActionButton';
import Modal from '@/app/components/Modal';
import LoadingOverlay from '@/app/components/LoadingOverlay';

interface PrivilegedSession {
  id: string;
  userId: string;
  userEmail: string;
  resourceType: string;
  resourceId: string;
  startedAt: string;
  expiresAt: string;
  status: 'Active' | 'Expired' | 'Revoked';
}

interface BreakGlassAccount {
  id: string;
  username: string;
  description: string;
  isActivated: boolean;
  lastActivatedAt?: string;
}

interface AccessRequest {
  id: string;
  requesterId: string;
  requesterEmail: string;
  resourceType: string;
  resourceId: string;
  reason: string;
  duration: number;
  status: 'Pending' | 'Approved' | 'Denied' | 'Expired';
  createdAt: string;
}

export default function PrivilegedAccessPage() {
  const [activeTab, setActiveTab] = useState<'sessions' | 'break-glass' | 'requests'>('sessions');
  const [tenantId, setTenantIdState] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [sessions, setSessions] = useState<PrivilegedSession[]>([]);
  const [breakGlassAccounts, setBreakGlassAccounts] = useState<BreakGlassAccount[]>([]);
  const [accessRequests, setAccessRequests] = useState<AccessRequest[]>([]);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestForm, setRequestForm] = useState({
    resourceType: '',
    resourceId: '',
    reason: '',
    duration: 3600
  });

  useEffect(() => {
    const contextTenantId = getTenantId();
    setTenantIdState(contextTenantId || '00000000-0000-0000-0000-000000000000');
  }, []);

  useEffect(() => {
    if (tenantId) {
      if (activeTab === 'sessions') fetchSessions();
      else if (activeTab === 'break-glass') fetchBreakGlassAccounts();
      else if (activeTab === 'requests') fetchAccessRequests();
    }
  }, [tenantId, activeTab]);

  const fetchSessions = async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:7000/api/tenant/privileged-access/sessions?tenantId=${tenantId}&status=Active`);
      if (response.ok) {
        const data = await response.json();
        setSessions(data || []);
      }
    } catch (err) {
      console.error('Error fetching sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBreakGlassAccounts = async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:7000/api/tenant/privileged-access/break-glass?tenantId=${tenantId}`);
      if (response.ok) {
        const data = await response.json();
        setBreakGlassAccounts(data || []);
      }
    } catch (err) {
      console.error('Error fetching break-glass accounts:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAccessRequests = async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:7000/api/tenant/privileged-access/requests?tenantId=${tenantId}`);
      if (response.ok) {
        const data = await response.json();
        setAccessRequests(data || []);
      }
    } catch (err) {
      console.error('Error fetching access requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestJITAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId) return;
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:7000/api/tenant/privileged-access/request?tenantId=${tenantId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestForm)
      });
      if (response.ok) {
        setSuccess('JIT access requested successfully');
        setShowRequestModal(false);
        fetchAccessRequests();
        setRequestForm({ resourceType: '', resourceId: '', reason: '', duration: 3600 });
      }
    } catch (err) {
      setError('Failed to request JIT access');
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    if (!tenantId || !confirm('Are you sure you want to revoke this session?')) return;
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:7000/api/tenant/privileged-access/sessions/${sessionId}/revoke?tenantId=${tenantId}`, {
        method: 'POST'
      });
      if (response.ok) {
        setSuccess('Session revoked successfully');
        fetchSessions();
      }
    } catch (err) {
      setError('Failed to revoke session');
    } finally {
      setLoading(false);
    }
  };

  const handleActivateBreakGlass = async (accountId: string) => {
    if (!tenantId || !confirm('Are you sure you want to activate this break-glass account? This action will be audited.')) return;
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:7000/api/tenant/privileged-access/break-glass/${accountId}/activate?tenantId=${tenantId}`, {
        method: 'POST'
      });
      if (response.ok) {
        setSuccess('Break-glass account activated');
        fetchBreakGlassAccounts();
      }
    } catch (err) {
      setError('Failed to activate break-glass account');
    } finally {
      setLoading(false);
    }
  };

  const sessionColumns: Column<PrivilegedSession>[] = [
    { key: 'userEmail', label: 'User' },
    { key: 'resourceType', label: 'Resource Type' },
    { key: 'resourceId', label: 'Resource ID' },
    { key: 'startedAt', label: 'Started', render: (s) => new Date(s.startedAt).toLocaleString() },
    { key: 'expiresAt', label: 'Expires', render: (s) => new Date(s.expiresAt).toLocaleString() },
    {
      key: 'status',
      label: 'Status',
      render: (s) => <StatusBadge status={s.status} variant={s.status === 'Active' ? 'success' : 'error'} />
    }
  ];

  const breakGlassColumns: Column<BreakGlassAccount>[] = [
    { key: 'username', label: 'Username' },
    { key: 'description', label: 'Description' },
    {
      key: 'isActivated',
      label: 'Status',
      render: (bg) => <StatusBadge status={bg.isActivated ? 'Activated' : 'Inactive'} variant={bg.isActivated ? 'warning' : 'default'} />
    },
    { key: 'lastActivatedAt', label: 'Last Activated', render: (bg) => bg.lastActivatedAt ? new Date(bg.lastActivatedAt).toLocaleString() : 'Never' }
  ];

  const requestColumns: Column<AccessRequest>[] = [
    { key: 'requesterEmail', label: 'Requester' },
    { key: 'resourceType', label: 'Resource Type' },
    { key: 'resourceId', label: 'Resource ID' },
    { key: 'reason', label: 'Reason' },
    { key: 'duration', label: 'Duration (s)' },
    {
      key: 'status',
      label: 'Status',
      render: (r) => <StatusBadge status={r.status} />
    },
    { key: 'createdAt', label: 'Created', render: (r) => new Date(r.createdAt).toLocaleDateString() }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 p-6">
      <LoadingOverlay isLoading={loading} message="Processing..." />

      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
          Privileged Access Management
        </h1>
        <p className="text-gray-600">Manage JIT access, break-glass accounts, and privileged sessions</p>
      </div>

      {error && <div className="mb-4 p-4 bg-red-100 border border-red-300 text-red-800 rounded-lg">{error}</div>}
      {success && <div className="mb-4 p-4 bg-green-100 border border-green-300 text-green-800 rounded-lg">{success}</div>}

      <div className="mb-6 flex space-x-2 border-b border-gray-300">
        {['sessions', 'break-glass', 'requests'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === tab ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            {tab.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
          </button>
        ))}
      </div>

      {activeTab === 'sessions' && (
        <DataTable
          data={sessions}
          columns={sessionColumns}
          actions={(session) => (
            <button
              onClick={() => handleRevokeSession(session.id)}
              className="text-red-600 hover:text-red-800 font-medium"
            >
              Revoke
            </button>
          )}
        />
      )}

      {activeTab === 'break-glass' && (
        <DataTable
          data={breakGlassAccounts}
          columns={breakGlassColumns}
          actions={(account) => (
            !account.isActivated && (
              <button
                onClick={() => handleActivateBreakGlass(account.id)}
                className="text-orange-600 hover:text-orange-800 font-medium"
              >
                Activate
              </button>
            )
          )}
        />
      )}

      {activeTab === 'requests' && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <ActionButton onClick={() => setShowRequestModal(true)}>Request JIT Access</ActionButton>
          </div>
          <DataTable data={accessRequests} columns={requestColumns} />
        </div>
      )}

      <Modal isOpen={showRequestModal} onClose={() => setShowRequestModal(false)} title="Request JIT Access">
        <form onSubmit={handleRequestJITAccess} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Resource Type</label>
            <input
              type="text"
              value={requestForm.resourceType}
              onChange={(e) => setRequestForm({ ...requestForm, resourceType: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Resource ID</label>
            <input
              type="text"
              value={requestForm.resourceId}
              onChange={(e) => setRequestForm({ ...requestForm, resourceId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
            <textarea
              value={requestForm.reason}
              onChange={(e) => setRequestForm({ ...requestForm, reason: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={3}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Duration (seconds)</label>
            <input
              type="number"
              value={requestForm.duration}
              onChange={(e) => setRequestForm({ ...requestForm, duration: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              min={60}
              max={86400}
              required
            />
          </div>
          <div className="flex gap-4">
            <ActionButton type="submit" fullWidth>Request</ActionButton>
            <ActionButton type="button" variant="secondary" fullWidth onClick={() => setShowRequestModal(false)}>
              Cancel
            </ActionButton>
          </div>
        </form>
      </Modal>
    </div>
  );
}
