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

export default function AdaptiveSecurityPage() {
  const t = useTranslations();
  const [activeTab, setActiveTab] = useState<'policies' | 'signals' | 'contexts'>('policies');
  const [tenantId, setTenantIdState] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Policies
  const [policies, setPolicies] = useState<AdaptivePolicy[]>([]);
  const [selectedPolicy, setSelectedPolicy] = useState<AdaptivePolicy | null>(null);
  const [showPolicyModal, setShowPolicyModal] = useState(false);

  // Signals
  const [signals, setSignals] = useState<RiskSignal[]>([]);
  const [selectedSignal, setSelectedSignal] = useState<RiskSignal | null>(null);
  const [showSignalModal, setShowSignalModal] = useState(false);

  // Contexts
  const [contexts, setContexts] = useState<SecurityContext[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');

  useEffect(() => {
    const contextTenantId = getTenantId();
    setTenantIdState(contextTenantId || '00000000-0000-0000-0000-000000000000');
  }, []);

  useEffect(() => {
    if (tenantId) {
      if (activeTab === 'policies') fetchPolicies();
      else if (activeTab === 'signals') fetchSignals();
      else if (activeTab === 'contexts') fetchContexts();
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

  const handleTogglePolicy = async (policyId: string, isEnabled: boolean) => {
    if (!tenantId) return;
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:7000/api/tenant/adaptive-security/policies/${policyId}/toggle?tenantId=${tenantId}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isEnabled })
        }
      );
      if (response.ok) {
        setSuccess('Policy updated successfully');
        fetchPolicies();
      }
    } catch (err) {
      setError('Failed to update policy');
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
              setShowPolicyModal(true);
            }}
            actions={(policy) => (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleTogglePolicy(policy.id, !policy.isEnabled);
                }}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                {policy.isEnabled ? 'Disable' : 'Enable'}
              </button>
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
          <div className="flex items-center justify-between">
            <SearchBar placeholder="Enter User ID..." onSearch={(query) => setSelectedUserId(query)} />
            <ActionButton onClick={() => selectedUserId && handleRefreshContext(selectedUserId)}>
              Refresh Context
            </ActionButton>
          </div>
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
    </div>
  );
}
