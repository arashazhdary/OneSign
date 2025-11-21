'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { getTenantId } from '@/lib/tenant-context';
import DataTable, { Column } from '@/app/components/DataTable';
import StatusBadge from '@/app/components/StatusBadge';
import ActionButton from '@/app/components/ActionButton';
import Modal from '@/app/components/Modal';
import SearchBar from '@/app/components/SearchBar';
import LoadingOverlay from '@/app/components/LoadingOverlay';

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

export default function AdaptiveSecurityPage() {
  const t = useTranslations();
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

  const fetchPolicies = async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:7000/api/tenant/adaptive-security/policies?tenantId=${tenantId}`);
      if (response.ok) {
        const data = await response.json();
        setPolicies(data || []);
      }
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
      const response = await fetch(`http://localhost:7000/api/tenant/adaptive-security/signals?tenantId=${tenantId}`);
      if (response.ok) {
        const data = await response.json();
        setSignals(data || []);
      }
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
      const response = await fetch(`http://localhost:7000/api/tenant/adaptive-security/contexts?tenantId=${tenantId}`);
      if (response.ok) {
        const data = await response.json();
        setContexts(data || []);
      }
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
      const response = await fetch(`http://localhost:7000/api/tenant/adaptive-security/dashboard?tenantId=${tenantId}`);
      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      }
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
      const response = await fetch(`http://localhost:7000/api/tenant/adaptive-security/high-risk-users?tenantId=${tenantId}`);
      if (response.ok) {
        const data = await response.json();
        setHighRiskUsers(data || []);
      }
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
      const response = await fetch(`http://localhost:7000/api/tenant/adaptive-security/users/${userId}/risk-score?tenantId=${tenantId}`);
      if (response.ok) {
        const data = await response.json();
        setUserRiskScore(data.riskScore);
        setSuccess(`Risk score for user ${userId}: ${data.riskScore}`);
      }
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
      const response = await fetch(
        `http://localhost:7000/api/tenant/adaptive-security/policies/${policyId}?tenantId=${tenantId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        }
      );
      if (response.ok) {
        setSuccess('Policy updated successfully');
        fetchPolicies();
        setEditingPolicy(null);
      }
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
      const response = await fetch(
        `http://localhost:7000/api/tenant/adaptive-security/policies/${policyId}?tenantId=${tenantId}`,
        {
          method: 'DELETE'
        }
      );
      if (response.ok) {
        setSuccess('Policy deleted successfully');
        fetchPolicies();
      }
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
      const response = await fetch(
        `http://localhost:7000/api/tenant/adaptive-security/policies/${policyId}/enable?tenantId=${tenantId}`,
        {
          method: 'POST'
        }
      );
      if (response.ok) {
        setSuccess('Policy enabled successfully');
        fetchPolicies();
      }
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
      const response = await fetch(
        `http://localhost:7000/api/tenant/adaptive-security/policies/${policyId}/disable?tenantId=${tenantId}`,
        {
          method: 'POST'
        }
      );
      if (response.ok) {
        setSuccess('Policy disabled successfully');
        fetchPolicies();
      }
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
      const response = await fetch(
        `http://localhost:7000/api/tenant/adaptive-security/evaluate?tenantId=${tenantId}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId })
        }
      );
      if (response.ok) {
        const data = await response.json();
        setSuccess(`User evaluated. Risk score: ${data.riskScore}`);
        fetchContexts();
      }
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
      const response = await fetch(
        `http://localhost:7000/api/tenant/adaptive-security/signals/${signalId}?tenantId=${tenantId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        }
      );
      if (response.ok) {
        setSuccess('Signal updated successfully');
        fetchSignals();
        setShowSignalModal(false);
      }
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
      const response = await fetch(
        `http://localhost:7000/api/tenant/adaptive-security/contexts/${userId}/refresh?tenantId=${tenantId}`,
        {
          method: 'POST'
        }
      );
      if (response.ok) {
        setSuccess('Context refreshed successfully');
        fetchContexts();
      }
    } catch (err) {
      setError('Failed to refresh context');
    } finally {
      setLoading(false);
    }
  };

  const policyColumns: Column<AdaptivePolicy>[] = [
    { key: 'name', label: 'Policy Name' },
    { key: 'policyType', label: 'Type' },
    {
      key: 'isEnabled',
      label: 'Status',
      render: (policy) => <StatusBadge status={policy.isEnabled ? 'Enabled' : 'Disabled'} />
    },
    {
      key: 'riskLevel',
      label: 'Risk Level',
      render: (policy) => <StatusBadge status={policy.riskLevel} variant={policy.riskLevel === 'High' ? 'error' : 'warning'} />
    },
    { key: 'action', label: 'Action' }
  ];

  const signalColumns: Column<RiskSignal>[] = [
    { key: 'signalType', label: 'Signal Type' },
    { key: 'description', label: 'Description' },
    {
      key: 'severity',
      label: 'Severity',
      render: (signal) => <StatusBadge status={signal.severity} variant={signal.severity === 'Critical' ? 'error' : 'warning'} />
    },
    { key: 'weight', label: 'Weight' },
    {
      key: 'isEnabled',
      label: 'Status',
      render: (signal) => <StatusBadge status={signal.isEnabled ? 'Enabled' : 'Disabled'} />
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 p-6">
      <LoadingOverlay isLoading={loading} message="Processing..." />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
          Adaptive Security
        </h1>
        <p className="text-gray-600">
          Manage adaptive security policies, risk signals, and user security contexts
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

      {/* Tabs */}
      <div className="mb-6 flex space-x-2 border-b border-gray-300">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'dashboard'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Dashboard
        </button>
        <button
          onClick={() => setActiveTab('policies')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'policies'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Policies
        </button>
        <button
          onClick={() => setActiveTab('signals')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'signals'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Risk Signals
        </button>
        <button
          onClick={() => setActiveTab('contexts')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'contexts'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Security Contexts
        </button>
        <button
          onClick={() => setActiveTab('high-risk')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'high-risk'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          High Risk Users
        </button>
      </div>

      {/* Content */}
      {activeTab === 'policies' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <SearchBar placeholder="Search policies..." onSearch={() => {}} />
            <ActionButton onClick={() => setShowPolicyModal(true)}>
              Create Policy
            </ActionButton>
          </div>
          <DataTable
            data={policies}
            columns={policyColumns}
            onRowClick={(policy) => {
              setSelectedPolicy(policy);
              setEditingPolicy(policy);
            }}
            actions={(policy) => (
              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    policy.isEnabled ? handleDisablePolicy(policy.id) : handleEnablePolicy(policy.id);
                  }}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  {policy.isEnabled ? 'Disable' : 'Enable'}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeletePolicy(policy.id);
                  }}
                  className="text-red-600 hover:text-red-800 font-medium"
                >
                  Delete
                </button>
              </div>
            )}
          />
        </div>
      )}

      {activeTab === 'signals' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <SearchBar placeholder="Search signals..." onSearch={() => {}} />
          </div>
          <DataTable
            data={signals}
            columns={signalColumns}
            onRowClick={(signal) => {
              setSelectedSignal(signal);
              setShowSignalModal(true);
            }}
            actions={(signal) => (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedSignal(signal);
                  setShowSignalModal(true);
                }}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Edit
              </button>
            )}
          />
        </div>
      )}

      {activeTab === 'contexts' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <SearchBar placeholder="User ID for Context..." onSearch={(query) => setSelectedUserId(query)} />
              <ActionButton onClick={() => selectedUserId && handleRefreshContext(selectedUserId)}>
                Refresh
              </ActionButton>
            </div>
            <div className="flex items-center gap-2">
              <SearchBar placeholder="User ID for Risk Score..." onSearch={(query) => setEvaluateUserId(query)} />
              <ActionButton onClick={() => evaluateUserId && fetchUserRiskScore(evaluateUserId)}>
                Get Risk Score
              </ActionButton>
              <ActionButton onClick={() => evaluateUserId && handleEvaluateUser(evaluateUserId)} variant="secondary">
                Evaluate
              </ActionButton>
            </div>
          </div>

          {userRiskScore !== null && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">User Risk Score:</span>
                <span className="text-2xl font-bold text-red-600">{userRiskScore}</span>
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Security Contexts</h3>
            {contexts.length === 0 ? (
              <p className="text-gray-500">No contexts found</p>
            ) : (
              <div className="space-y-4">
                {contexts.map((ctx) => (
                  <div key={ctx.userId} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">User: {ctx.userId}</span>
                      <span className="text-sm text-gray-600">
                        Risk Score: <span className="font-semibold text-red-600">{ctx.contextData.riskScore}</span>
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      Last Assessment: {new Date(ctx.contextData.lastAssessment).toLocaleString()}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {ctx.contextData.factors.map((factor, idx) => (
                        <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                          {factor}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'dashboard' && dashboardData && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Total Policies</h3>
              <p className="text-3xl font-bold text-blue-600">{dashboardData.totalPolicies}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Active Policies</h3>
              <p className="text-3xl font-bold text-green-600">{dashboardData.activePolicies}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">High Risk Users</h3>
              <p className="text-3xl font-bold text-red-600">{dashboardData.highRiskUsers}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Recent Evaluations</h3>
              <p className="text-3xl font-bold text-purple-600">{dashboardData.recentEvaluations}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Avg Risk Score</h3>
              <p className="text-3xl font-bold text-orange-600">{dashboardData.averageRiskScore.toFixed(1)}</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'high-risk' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Risk Score</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Risk Factors</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Evaluation</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {highRiskUsers.map((user) => (
                  <tr key={user.userId}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.userId}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className="px-2 py-1 bg-red-100 text-red-800 rounded font-semibold">{user.riskScore}</span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex flex-wrap gap-1">
                        {user.riskFactors.map((factor, idx) => (
                          <span key={idx} className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs">
                            {factor}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.lastEvaluation).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {highRiskUsers.length === 0 && (
              <div className="text-center py-8 text-gray-500">No high-risk users found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
