import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocale } from '@/hooks/useLocale';
import { getTenantId } from '@/lib/tenant-context';
import { securityService } from '@/lib/api/services';
import { Helmet } from 'react-helmet-async';

interface Policy {
  id: string;
  name: string;
  description: string;
  policyType: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PolicyEvaluationResult {
  allowed: boolean;
  reason: string;
  matchedRules: string[];
}

export default function TenantPoliciesPage() {
  const { t } = useTranslation();
  const locale = useLocale();
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showEvaluateModal, setShowEvaluateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
  const [tenantId, setTenantIdState] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Create/Edit form fields
  const [policyName, setPolicyName] = useState('');
  const [policyDescription, setPolicyDescription] = useState('');
  const [policyType, setPolicyType] = useState('ABAC');
  const [policyRules, setPolicyRules] = useState('{}');
  const [enabled, setEnabled] = useState(true);

  // Evaluate form fields
  const [evaluateUserId, setEvaluateUserId] = useState('');
  const [evaluateResource, setEvaluateResource] = useState('');
  const [evaluateAction, setEvaluateAction] = useState('');
  const [evaluationResult, setEvaluationResult] = useState<PolicyEvaluationResult | null>(null);

  // Assign form fields
  const [assignEntityType, setAssignEntityType] = useState('User');
  const [assignEntityId, setAssignEntityId] = useState('');

  // Filter
  const [filterEnabled, setFilterEnabled] = useState<boolean | null>(null);

  useEffect(() => {
    const contextTenantId = getTenantId();
    setTenantIdState(contextTenantId || '00000000-0000-0000-0000-000000000000');
  }, []);

  useEffect(() => {
    if (tenantId) {
      fetchPolicies();
    }
  }, [tenantId, filterEnabled]);

  const fetchPolicies = async () => {
    if (!tenantId) return;

    try {
      setLoading(true);
      const data = await securityService.getPolicies(tenantId, filterEnabled ?? undefined);
      setPolicies(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching policies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!tenantId) return;

    try {
      await securityService.createPolicy(tenantId, {
        name: policyName,
        description: policyDescription,
        policyType: policyType,
        rules: JSON.parse(policyRules),
        enabled
      });
      setShowCreateModal(false);
      setPolicyName('');
      setPolicyDescription('');
      setPolicyRules('{}');
      setEnabled(true);
      setSuccess(t('tenant.policies.policyCreated') || 'Policy created successfully');
      fetchPolicies();
    } catch (error: any) {
      setError(error?.message || t('common.error'));
      console.error('Error creating policy:', error);
    }
  };

  const handleUpdatePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!tenantId || !selectedPolicy) return;

    try {
      await securityService.updatePolicy(tenantId, selectedPolicy.id, {
        name: policyName,
        description: policyDescription,
        policyType: policyType,
        rules: JSON.parse(policyRules),
        enabled
      });
      setShowEditModal(false);
      setSelectedPolicy(null);
      setPolicyName('');
      setPolicyDescription('');
      setPolicyRules('{}');
      setSuccess(t('tenant.policies.policyUpdated') || 'Policy updated successfully');
      fetchPolicies();
    } catch (error: any) {
      setError(error?.message || t('common.error'));
      console.error('Error updating policy:', error);
    }
  };

  const handleDeletePolicy = async (policyId: string) => {
    if (!confirm(t('tenant.policies.confirmDelete') || 'Are you sure you want to delete this policy?')) return;
    setError('');
    setSuccess('');
    if (!tenantId) return;

    try {
      await securityService.deletePolicy(tenantId, policyId);
      setSuccess(t('tenant.policies.policyDeleted') || 'Policy deleted successfully');
      fetchPolicies();
    } catch (error: any) {
      setError(error?.message || t('common.error'));
      console.error('Error deleting policy:', error);
    }
  };

  const handleEvaluatePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setEvaluationResult(null);
    if (!tenantId || !selectedPolicy) return;

    try {
      const data = await securityService.evaluatePolicy(tenantId, selectedPolicy.id, {
        userId: evaluateUserId,
        resource: evaluateResource,
        action: evaluateAction
      });
      setEvaluationResult(data);
    } catch (error: any) {
      setError(error?.message || t('common.error'));
      console.error('Error evaluating policy:', error);
    }
  };

  const handleAssignPolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!tenantId || !selectedPolicy) return;

    try {
      await securityService.assignPolicy(tenantId, selectedPolicy.id, assignEntityType, assignEntityId);
      setShowAssignModal(false);
      setSelectedPolicy(null);
      setAssignEntityId('');
      setSuccess(t('tenant.policies.policyAssigned') || 'Policy assigned successfully');
    } catch (error: any) {
      setError(error?.message || t('common.error'));
      console.error('Error assigning policy:', error);
    }
  };

  const openEditModal = (policy: Policy) => {
    setSelectedPolicy(policy);
    setPolicyName(policy.name);
    setPolicyDescription(policy.description);
    setPolicyType(policy.policyType);
    setEnabled(policy.enabled);
    setPolicyRules('{}'); // Would need to fetch full policy details
    setShowEditModal(true);
  };

  const openEvaluateModal = (policy: Policy) => {
    setSelectedPolicy(policy);
    setEvaluateUserId('');
    setEvaluateResource('');
    setEvaluateAction('');
    setEvaluationResult(null);
    setShowEvaluateModal(true);
  };

  const openAssignModal = (policy: Policy) => {
    setSelectedPolicy(policy);
    setAssignEntityId('');
    setShowAssignModal(true);
  };

  if (loading) {
    return <div className="p-8">{t('common.loading')}</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{t('tenant.policies.title') || 'Policy Management'}</h1>
        <button
          onClick={() => {
            setPolicyName('');
            setPolicyDescription('');
            setPolicyRules('{}');
            setEnabled(true);
            setShowCreateModal(true);
          }}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          {t('tenant.policies.createPolicy') || 'Create Policy'}
        </button>
      </div>

      {/* Filter */}
      <div className="mb-4 flex gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">{t('tenant.policies.filter') || 'Filter'}</label>
          <select
            value={filterEnabled === null ? 'all' : filterEnabled.toString()}
            onChange={(e) => {
              const value = e.target.value;
              setFilterEnabled(value === 'all' ? null : value === 'true');
            }}
            className="px-3 py-2 border rounded"
          >
            <option value="all">{t('common.all')}</option>
            <option value="true">{t('common.enabled')}</option>
            <option value="false">{t('common.disabled')}</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">{t('tenant.policies.createPolicy') || 'Create Policy'}</h2>
            <form onSubmit={handleCreatePolicy}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">{t('common.name')}</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border rounded"
                  value={policyName}
                  onChange={(e) => setPolicyName(e.target.value)}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">{t('common.description')}</label>
                <textarea
                  className="w-full px-3 py-2 border rounded"
                  rows={3}
                  value={policyDescription}
                  onChange={(e) => setPolicyDescription(e.target.value)}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">{t('tenant.policies.type') || 'Policy Type'}</label>
                <select
                  className="w-full px-3 py-2 border rounded"
                  value={policyType}
                  onChange={(e) => setPolicyType(e.target.value)}
                >
                  <option value="ABAC">ABAC</option>
                  <option value="RBAC">RBAC</option>
                  <option value="PBAC">PBAC</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">{t('tenant.policies.rules') || 'Rules (JSON)'}</label>
                <textarea
                  className="w-full px-3 py-2 border rounded font-mono text-sm"
                  rows={6}
                  value={policyRules}
                  onChange={(e) => setPolicyRules(e.target.value)}
                />
              </div>
              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={enabled}
                    onChange={(e) => setEnabled(e.target.checked)}
                  />
                  {t('common.enabled')}
                </label>
              </div>
              <div className="flex gap-2">
                <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded">
                  {t('common.create')}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="bg-gray-300 px-4 py-2 rounded"
                >
                  {t('common.cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedPolicy && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">{t('tenant.policies.editPolicy') || 'Edit Policy'}</h2>
            <form onSubmit={handleUpdatePolicy}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">{t('common.name')}</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border rounded"
                  value={policyName}
                  onChange={(e) => setPolicyName(e.target.value)}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">{t('common.description')}</label>
                <textarea
                  className="w-full px-3 py-2 border rounded"
                  rows={3}
                  value={policyDescription}
                  onChange={(e) => setPolicyDescription(e.target.value)}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">{t('tenant.policies.type') || 'Policy Type'}</label>
                <select
                  className="w-full px-3 py-2 border rounded"
                  value={policyType}
                  onChange={(e) => setPolicyType(e.target.value)}
                >
                  <option value="ABAC">ABAC</option>
                  <option value="RBAC">RBAC</option>
                  <option value="PBAC">PBAC</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">{t('tenant.policies.rules') || 'Rules (JSON)'}</label>
                <textarea
                  className="w-full px-3 py-2 border rounded font-mono text-sm"
                  rows={6}
                  value={policyRules}
                  onChange={(e) => setPolicyRules(e.target.value)}
                />
              </div>
              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={enabled}
                    onChange={(e) => setEnabled(e.target.checked)}
                  />
                  {t('common.enabled')}
                </label>
              </div>
              <div className="flex gap-2">
                <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded">
                  {t('common.save')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedPolicy(null);
                  }}
                  className="bg-gray-300 px-4 py-2 rounded"
                >
                  {t('common.cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Evaluate Modal */}
      {showEvaluateModal && selectedPolicy && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full">
            <h2 className="text-xl font-bold mb-4">{t('tenant.policies.evaluatePolicy') || 'Evaluate Policy'} - {selectedPolicy.name}</h2>
            <form onSubmit={handleEvaluatePolicy}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">{t('tenant.policies.userId') || 'User ID'}</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border rounded"
                  value={evaluateUserId}
                  onChange={(e) => setEvaluateUserId(e.target.value)}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">{t('tenant.policies.resource') || 'Resource'}</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border rounded"
                  value={evaluateResource}
                  onChange={(e) => setEvaluateResource(e.target.value)}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">{t('tenant.policies.action') || 'Action'}</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border rounded"
                  value={evaluateAction}
                  onChange={(e) => setEvaluateAction(e.target.value)}
                />
              </div>

              {evaluationResult && (
                <div className={`mb-4 p-4 rounded ${evaluationResult.allowed ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                  <h3 className="font-semibold mb-2">{t('tenant.policies.evaluationResult') || 'Evaluation Result'}</h3>
                  <p><strong>{t('common.allowed')}:</strong> {evaluationResult.allowed ? t('common.yes') : t('common.no')}</p>
                  <p><strong>{t('tenant.policies.reason') || 'Reason'}:</strong> {evaluationResult.reason}</p>
                  {evaluationResult.matchedRules.length > 0 && (
                    <div className="mt-2">
                      <strong>{t('tenant.policies.matchedRules') || 'Matched Rules'}:</strong>
                      <ul className="list-disc list-inside">
                        {evaluationResult.matchedRules.map((rule, index) => (
                          <li key={index}>{rule}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <div className="flex gap-2">
                <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded">
                  {t('tenant.policies.evaluate') || 'Evaluate'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEvaluateModal(false);
                    setSelectedPolicy(null);
                    setEvaluationResult(null);
                  }}
                  className="bg-gray-300 px-4 py-2 rounded"
                >
                  {t('common.close')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Modal */}
      {showAssignModal && selectedPolicy && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">{t('tenant.policies.assignPolicy') || 'Assign Policy'} - {selectedPolicy.name}</h2>
            <form onSubmit={handleAssignPolicy}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">{t('tenant.policies.entityType') || 'Entity Type'}</label>
                <select
                  className="w-full px-3 py-2 border rounded"
                  value={assignEntityType}
                  onChange={(e) => setAssignEntityType(e.target.value)}
                >
                  <option value="User">User</option>
                  <option value="Role">Role</option>
                  <option value="Group">Group</option>
                  <option value="OrgUnit">Org Unit</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">{t('tenant.policies.entityId') || 'Entity ID'}</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border rounded"
                  value={assignEntityId}
                  onChange={(e) => setAssignEntityId(e.target.value)}
                />
              </div>

              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <div className="flex gap-2">
                <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded">
                  {t('tenant.policies.assign') || 'Assign'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAssignModal(false);
                    setSelectedPolicy(null);
                  }}
                  className="bg-gray-300 px-4 py-2 rounded"
                >
                  {t('common.cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Policies Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('common.name')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('tenant.policies.type') || 'Type'}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('common.status')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('tenant.policies.createdAt') || 'Created'}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {policies.map((policy) => (
              <tr key={policy.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {policy.name}
                  {policy.description && (
                    <p className="text-xs text-gray-500">{policy.description}</p>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{policy.policyType}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 py-1 rounded text-xs ${policy.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {policy.enabled ? t('common.enabled') : t('common.disabled')}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(policy.createdAt).toLocaleDateString(locale)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(policy)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      {t('common.edit')}
                    </button>
                    <button
                      onClick={() => openEvaluateModal(policy)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      {t('tenant.policies.evaluate') || 'Evaluate'}
                    </button>
                    <button
                      onClick={() => openAssignModal(policy)}
                      className="text-green-600 hover:text-green-900"
                    >
                      {t('tenant.policies.assign') || 'Assign'}
                    </button>
                    <button
                      onClick={() => handleDeletePolicy(policy.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      {t('common.delete')}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {policies.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {t('tenant.policies.noPolicies') || 'No policies found'}
          </div>
        )}
      </div>
    </div>
  );
}
