'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { getTenantId } from '@/lib/tenant-context';
import LoadingOverlay from '@/app/components/LoadingOverlay';
import Modal from '@/app/components/Modal';
import StatusBadge from '@/app/components/StatusBadge';

interface Policy {
  id: string;
  tenantId: string;
  name: string;
  description: string;
  policyType: string;
  status: string;
  priority: number;
  rules: PolicyRule[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  version: number;
}

interface PolicyRule {
  id: string;
  name: string;
  description: string;
  condition: RuleCondition;
  action: RuleAction;
  isEnabled: boolean;
  order: number;
}

interface RuleCondition {
  type: string;
  operator: string;
  field: string;
  value: any;
  conditions?: RuleCondition[];
}

interface RuleAction {
  type: string;
  configuration: Record<string, any>;
}

interface AppliedEntity {
  id: string;
  entityType: string;
  entityId: string;
  entityName: string;
  appliedAt: string;
  appliedBy: string;
}

interface AuditLogEntry {
  id: string;
  policyId: string;
  action: string;
  changedBy: string;
  changedAt: string;
  changes: Record<string, any>;
  previousVersion: number;
  newVersion: number;
}

interface ImpactAnalysis {
  affectedUsers: number;
  affectedGroups: number;
  affectedOrgUnits: number;
  estimatedEnforcementRate: number;
  potentialViolations: number;
  riskScore: number;
}

type Tab = 'overview' | 'rules' | 'applied-to' | 'audit-log' | 'impact-analysis' | 'test-policy';

export default function PolicyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const policyId = params.id as string;
  const t = useTranslations();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Data states
  const [policy, setPolicy] = useState<Policy | null>(null);
  const [appliedEntities, setAppliedEntities] = useState<AppliedEntity[]>([]);
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);
  const [impactAnalysis, setImpactAnalysis] = useState<ImpactAnalysis | null>(null);

  // Modal states
  const [showTestModal, setShowTestModal] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);

  // Form states
  const [testUserId, setTestUserId] = useState('');
  const [testResult, setTestResult] = useState<any>(null);
  const [applyEntityType, setApplyEntityType] = useState('user');
  const [applyEntityId, setApplyEntityId] = useState('');

  const tenantId = getTenantId();

  useEffect(() => {
    fetchPolicy();
  }, [policyId]);

  useEffect(() => {
    if (activeTab === 'applied-to') {
      fetchAppliedEntities();
    } else if (activeTab === 'audit-log') {
      fetchAuditLog();
    } else if (activeTab === 'impact-analysis') {
      fetchImpactAnalysis();
    }
  }, [activeTab]);

  const fetchPolicy = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(
        `http://localhost:7000/api/tenant/policies/${policyId}?tenantId=${tenantId}`,
        {
          credentials: 'include',
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch policy');
      }

      const data = await response.json();
      setPolicy(data);
    } catch (err) {
      setError(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const fetchAppliedEntities = async () => {
    try {
      const response = await fetch(
        `http://localhost:7000/api/tenant/policies/${policyId}/applied?tenantId=${tenantId}`,
        {
          credentials: 'include',
        }
      );

      if (response.ok) {
        const data = await response.json();
        setAppliedEntities(data);
      }
    } catch (err) {
      console.error('Failed to fetch applied entities:', err);
    }
  };

  const fetchAuditLog = async () => {
    try {
      const response = await fetch(
        `http://localhost:7000/api/tenant/policies/${policyId}/audit-log?tenantId=${tenantId}&pageSize=50`,
        {
          credentials: 'include',
        }
      );

      if (response.ok) {
        const data = await response.json();
        setAuditLog(data);
      }
    } catch (err) {
      console.error('Failed to fetch audit log:', err);
    }
  };

  const fetchImpactAnalysis = async () => {
    try {
      const response = await fetch(
        `http://localhost:7000/api/tenant/policies/${policyId}/impact-analysis?tenantId=${tenantId}`,
        {
          credentials: 'include',
        }
      );

      if (response.ok) {
        const data = await response.json();
        setImpactAnalysis(data);
      }
    } catch (err) {
      console.error('Failed to fetch impact analysis:', err);
    }
  };

  const handleToggleActive = async () => {
    if (!policy) return;

    setProcessing(true);
    setError('');
    setSuccess('');
    try {
      const action = policy.isActive ? 'deactivate' : 'activate';
      const response = await fetch(
        `http://localhost:7000/api/tenant/policies/${policyId}/${action}?tenantId=${tenantId}`,
        {
          method: 'POST',
          credentials: 'include',
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to ${action} policy`);
      }

      setSuccess(`Policy ${action}d successfully`);
      fetchPolicy();
    } catch (err) {
      setError(t('common.error'));
    } finally {
      setProcessing(false);
    }
  };

  const handleTestPolicy = async () => {
    if (!testUserId.trim()) {
      setError('Please enter a user ID');
      return;
    }

    setProcessing(true);
    setError('');
    setSuccess('');
    setTestResult(null);
    try {
      const response = await fetch(
        `http://localhost:7000/api/tenant/policies/${policyId}/test?tenantId=${tenantId}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ userId: testUserId }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to test policy');
      }

      const result = await response.json();
      setTestResult(result);
      setSuccess('Policy test completed');
    } catch (err) {
      setError(t('common.error'));
    } finally {
      setProcessing(false);
    }
  };

  const handleApplyPolicy = async () => {
    if (!applyEntityId.trim()) {
      setError('Please enter an entity ID');
      return;
    }

    setProcessing(true);
    setError('');
    setSuccess('');
    try {
      const response = await fetch(
        `http://localhost:7000/api/tenant/policies/${policyId}/apply?tenantId=${tenantId}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            entityType: applyEntityType,
            entityId: applyEntityId,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to apply policy');
      }

      setSuccess('Policy applied successfully');
      setShowApplyModal(false);
      setApplyEntityId('');
      fetchAppliedEntities();
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

  const getPriorityBadge = (priority: number) => {
    const priorities: Record<number, { text: string; className: string }> = {
      1: { text: 'Low', className: 'bg-green-100 text-green-800' },
      2: { text: 'Medium', className: 'bg-yellow-100 text-yellow-800' },
      3: { text: 'High', className: 'bg-orange-100 text-orange-800' },
      4: { text: 'Critical', className: 'bg-red-100 text-red-800' },
    };
    const priorityInfo = priorities[priority] || priorities[1];
    return (
      <span className={`px-3 py-1 text-sm font-semibold rounded-full ${priorityInfo.className}`}>
        {priorityInfo.text}
      </span>
    );
  };

  const getRiskScoreColor = (score: number) => {
    if (score >= 75) return 'text-red-600';
    if (score >= 50) return 'text-orange-600';
    if (score >= 25) return 'text-yellow-600';
    return 'text-green-600';
  };

  if (loading) {
    return <LoadingOverlay isLoading={true} message="Loading policy details..." />;
  }

  if (!policy) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          Policy not found
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="text-blue-600 hover:text-blue-800 mb-4 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Policies
        </button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              {policy.name}
            </h1>
            <p className="text-gray-600 mt-2">{policy.description}</p>
          </div>
          <div className="flex gap-3 items-center">
            {getPriorityBadge(policy.priority)}
            <StatusBadge status={policy.status} />
            {policy.isActive ? (
              <span className="px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800">
                Active
              </span>
            ) : (
              <span className="px-3 py-1 text-sm font-semibold rounded-full bg-gray-100 text-gray-800">
                Inactive
              </span>
            )}
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
        <button
          onClick={handleToggleActive}
          disabled={processing}
          className={`px-4 py-2 rounded-lg transition-colors disabled:opacity-50 ${
            policy.isActive
              ? 'bg-yellow-500 text-white hover:bg-yellow-600'
              : 'bg-green-500 text-white hover:bg-green-600'
          }`}
        >
          {policy.isActive ? 'Deactivate' : 'Activate'}
        </button>
        <button
          onClick={() => setShowApplyModal(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          Apply to Entity
        </button>
        <button
          onClick={() => setShowTestModal(true)}
          className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors"
        >
          Test Policy
        </button>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {(['overview', 'rules', 'applied-to', 'audit-log', 'impact-analysis', 'test-policy'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-1 border-b-2 font-medium text-sm capitalize transition-colors ${
                activeTab === tab
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.replace('-', ' ')}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Policy Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Policy Type</label>
                <div className="text-gray-900 capitalize">{policy.policyType}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Version</label>
                <div className="text-gray-900">v{policy.version}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Created By</label>
                <div className="text-gray-900">{policy.createdBy}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Created At</label>
                <div className="text-gray-900">{formatDate(policy.createdAt)}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Updated</label>
                <div className="text-gray-900">{formatDate(policy.updatedAt)}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Rules</label>
                <div className="text-gray-900">{policy.rules.length}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rules Tab */}
      {activeTab === 'rules' && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Policy Rules</h3>
          {policy.rules.length === 0 ? (
            <p className="text-gray-500">No rules defined</p>
          ) : (
            <div className="space-y-4">
              {policy.rules.map((rule) => (
                <div key={rule.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h4 className="font-medium text-gray-900">{rule.name}</h4>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          rule.isEnabled
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {rule.isEnabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{rule.description}</p>
                    </div>
                    <div className="text-sm text-gray-500">
                      Order: {rule.order}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-gray-200">
                    <div>
                      <div className="text-xs font-medium text-gray-500 mb-1">Condition</div>
                      <div className="bg-gray-50 p-2 rounded text-sm">
                        <div className="font-mono text-xs">
                          {rule.condition.field} {rule.condition.operator} {JSON.stringify(rule.condition.value)}
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-gray-500 mb-1">Action</div>
                      <div className="bg-gray-50 p-2 rounded text-sm">
                        <div className="font-medium">{rule.action.type}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Applied To Tab */}
      {activeTab === 'applied-to' && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Applied To</h3>
          {appliedEntities.length === 0 ? (
            <p className="text-gray-500">Policy not applied to any entities</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Applied At</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Applied By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {appliedEntities.map((entity) => (
                    <tr key={entity.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium capitalize">
                          {entity.entityType}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{entity.entityName}</td>
                      <td className="px-6 py-4 text-sm text-gray-500 font-mono">{entity.entityId}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{formatDate(entity.appliedAt)}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{entity.appliedBy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Audit Log Tab */}
      {activeTab === 'audit-log' && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Audit Log</h3>
          {auditLog.length === 0 ? (
            <p className="text-gray-500">No audit log entries</p>
          ) : (
            <div className="space-y-3">
              {auditLog.map((entry) => (
                <div key={entry.id} className="border-l-4 border-indigo-500 pl-4 py-3 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{entry.action}</div>
                      <div className="text-sm text-gray-600 mt-1">
                        Changed by {entry.changedBy} | Version {entry.previousVersion} → {entry.newVersion}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{formatDate(entry.changedAt)}</div>
                      {Object.keys(entry.changes).length > 0 && (
                        <div className="mt-2 bg-gray-50 p-2 rounded text-xs">
                          <pre className="text-gray-700">{JSON.stringify(entry.changes, null, 2)}</pre>
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

      {/* Impact Analysis Tab */}
      {activeTab === 'impact-analysis' && (
        <div className="space-y-6">
          {impactAnalysis ? (
            <>
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Impact Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6">
                    <div className="text-sm text-blue-600 font-medium mb-2">Affected Users</div>
                    <div className="text-3xl font-bold text-blue-900">{impactAnalysis.affectedUsers}</div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6">
                    <div className="text-sm text-purple-600 font-medium mb-2">Affected Groups</div>
                    <div className="text-3xl font-bold text-purple-900">{impactAnalysis.affectedGroups}</div>
                  </div>
                  <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-6">
                    <div className="text-sm text-indigo-600 font-medium mb-2">Affected Org Units</div>
                    <div className="text-3xl font-bold text-indigo-900">{impactAnalysis.affectedOrgUnits}</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Analysis Metrics</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Enforcement Rate</label>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-gray-200 rounded-full h-4">
                        <div
                          className="bg-green-600 h-4 rounded-full"
                          style={{ width: `${impactAnalysis.estimatedEnforcementRate}%` }}
                        ></div>
                      </div>
                      <span className="text-lg font-semibold text-gray-900">
                        {impactAnalysis.estimatedEnforcementRate}%
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Risk Score</label>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-gray-200 rounded-full h-4">
                        <div
                          className={`h-4 rounded-full ${
                            impactAnalysis.riskScore >= 75 ? 'bg-red-600' :
                            impactAnalysis.riskScore >= 50 ? 'bg-orange-600' :
                            impactAnalysis.riskScore >= 25 ? 'bg-yellow-600' : 'bg-green-600'
                          }`}
                          style={{ width: `${impactAnalysis.riskScore}%` }}
                        ></div>
                      </div>
                      <span className={`text-lg font-semibold ${getRiskScoreColor(impactAnalysis.riskScore)}`}>
                        {impactAnalysis.riskScore}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Potential Violations</label>
                    <div className="text-2xl font-bold text-gray-900">{impactAnalysis.potentialViolations}</div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <p className="text-gray-500">Loading impact analysis...</p>
            </div>
          )}
        </div>
      )}

      {/* Test Policy Tab */}
      {activeTab === 'test-policy' && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Test Policy</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                User ID to Test
              </label>
              <input
                type="text"
                value={testUserId}
                onChange={(e) => setTestUserId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter user ID"
              />
            </div>
            <button
              onClick={handleTestPolicy}
              disabled={processing}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {processing ? 'Testing...' : 'Run Test'}
            </button>
            {testResult && (
              <div className="mt-4 bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Test Result</h4>
                <pre className="text-sm text-gray-900 overflow-x-auto">
                  {JSON.stringify(testResult, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Test Modal */}
      <Modal
        isOpen={showTestModal}
        onClose={() => {
          setShowTestModal(false);
          setTestResult(null);
        }}
        title="Test Policy"
        size="lg"
        footer={
          <>
            <button
              onClick={() => {
                setShowTestModal(false);
                setTestResult(null);
              }}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Close
            </button>
            <button
              onClick={handleTestPolicy}
              disabled={processing}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              {processing ? 'Testing...' : 'Run Test'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              User ID to Test
            </label>
            <input
              type="text"
              value={testUserId}
              onChange={(e) => setTestUserId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="Enter user ID"
            />
          </div>
          {testResult && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Test Result</h4>
              <pre className="text-sm text-gray-900 overflow-x-auto">
                {JSON.stringify(testResult, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </Modal>

      {/* Apply Policy Modal */}
      <Modal
        isOpen={showApplyModal}
        onClose={() => {
          setShowApplyModal(false);
          setApplyEntityId('');
        }}
        title="Apply Policy to Entity"
        footer={
          <>
            <button
              onClick={() => {
                setShowApplyModal(false);
                setApplyEntityId('');
              }}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={handleApplyPolicy}
              disabled={processing}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {processing ? 'Applying...' : 'Apply Policy'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Entity Type</label>
            <select
              value={applyEntityType}
              onChange={(e) => setApplyEntityType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="user">User</option>
              <option value="group">Group</option>
              <option value="org-unit">Organization Unit</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Entity ID</label>
            <input
              type="text"
              value={applyEntityId}
              onChange={(e) => setApplyEntityId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Enter entity ID"
            />
          </div>
        </div>
      </Modal>

      <LoadingOverlay isLoading={processing} message="Processing..." />
    </div>
  );
}
