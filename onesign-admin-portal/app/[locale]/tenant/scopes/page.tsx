'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { getTenantId } from '@/lib/tenant-context';
import { platformService, applicationsService } from '@/lib/api/services';

interface Scope {
  id: string;
  name: string;
  description: string;
  value: string;
  type: 'standard' | 'custom';
  groupId?: string;
  permissions: string[];
  applicationCount: number;
  userConsentRequired: boolean;
  isEnabled: boolean;
  createdAt: string;
}

interface ScopeGroup {
  id: string;
  name: string;
  description: string;
  scopes: string[];
}

interface Application {
  id: string;
  name: string;
  scopes: string[];
}

const STANDARD_SCOPES = [
  { value: 'openid', name: 'OpenID', description: 'OpenID Connect authentication', permissions: ['profile:basic'] },
  { value: 'profile', name: 'Profile', description: 'Access to user profile', permissions: ['profile:read'] },
  { value: 'email', name: 'Email', description: 'Access to email address', permissions: ['email:read'] },
  { value: 'offline_access', name: 'Offline Access', description: 'Refresh token access', permissions: ['token:refresh'] },
  { value: 'phone', name: 'Phone', description: 'Access to phone number', permissions: ['phone:read'] },
  { value: 'address', name: 'Address', description: 'Access to address', permissions: ['address:read'] },
];

export default function ScopeManagementPage() {
  const t = useTranslations();
  const [tenantId, setTenantIdState] = useState<string | null>(null);
  const [scopes, setScopes] = useState<Scope[]>([]);
  const [scopeGroups, setScopeGroups] = useState<ScopeGroup[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showApplicationsModal, setShowApplicationsModal] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [editingScope, setEditingScope] = useState<Scope | null>(null);
  const [selectedScopeForApps, setSelectedScopeForApps] = useState<Scope | null>(null);
  const [selectedScopeForPerms, setSelectedScopeForPerms] = useState<Scope | null>(null);
  const [scopeName, setScopeName] = useState('');
  const [scopeDescription, setScopeDescription] = useState('');
  const [scopeValue, setScopeValue] = useState('');
  const [scopeType, setScopeType] = useState<'standard' | 'custom'>('custom');
  const [scopeGroupId, setScopeGroupId] = useState('');
  const [scopePermissions, setScopePermissions] = useState<string[]>([]);
  const [userConsentRequired, setUserConsentRequired] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'standard' | 'custom'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const contextTenantId = getTenantId();
    setTenantIdState(contextTenantId || '11111111-1111-1111-1111-111111111111');
  }, []);

  useEffect(() => {
    if (tenantId) {
      fetchScopes();
      fetchScopeGroups();
      fetchApplications();
    }
  }, [tenantId]);

  const fetchScopes = async () => {
    if (!tenantId) return;
    try {
      const data = await (platformService as any).getScopes(tenantId);
      setScopes(data.items || data || []);
    } catch (error) {
      console.error('Error fetching scopes:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchScopeGroups = async () => {
    if (!tenantId) return;
    try {
      const data = await (platformService as any).getScopeGroups(tenantId);
      setScopeGroups(data.items || data || []);
    } catch (error) {
      console.error('Error fetching scope groups:', error);
    }
  };

  const fetchApplications = async () => {
    if (!tenantId) return;
    try {
      const data = await applicationsService.getApplications({ tenantId, page: 1, pageSize: 1000 });
      setApplications(data.items || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

  const handleCreateOrUpdateScope = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!tenantId) return;

    const payload = {
      name: scopeName,
      description: scopeDescription,
      value: scopeValue,
      type: scopeType,
      groupId: scopeGroupId || null,
      permissions: scopePermissions,
      userConsentRequired,
    };

    try {
      if (editingScope) {
        await (platformService as any).updateScope(tenantId, editingScope.id, payload);
      } else {
        await (platformService as any).createScope(tenantId, payload);
      }
      setSuccess(editingScope ? 'Scope updated successfully' : 'Scope created successfully');
      setShowCreateModal(false);
      resetForm();
      fetchScopes();
    } catch (error: any) {
      setError(error?.message || 'Failed to save scope');
      console.error('Error saving scope:', error);
    }
  };

  const handleEditScope = (scope: Scope) => {
    setEditingScope(scope);
    setScopeName(scope.name);
    setScopeDescription(scope.description);
    setScopeValue(scope.value);
    setScopeType(scope.type);
    setScopeGroupId(scope.groupId || '');
    setScopePermissions(scope.permissions);
    setUserConsentRequired(scope.userConsentRequired);
    setShowCreateModal(true);
  };

  const handleDeleteScope = async (scopeId: string) => {
    if (!confirm('Are you sure you want to delete this scope?')) return;

    setError('');
    setSuccess('');

    try {
      await (platformService as any).deleteScope(tenantId, scopeId);
      setSuccess('Scope deleted successfully');
      fetchScopes();
    } catch (error: any) {
      setError(error?.message || 'Failed to delete scope');
      console.error('Error deleting scope:', error);
    }
  };

  const handleToggleScopeStatus = async (scope: Scope) => {
    try {
      await (platformService as any).updateScopeStatus(tenantId, scope.id, !scope.isEnabled);
      setSuccess(`Scope ${scope.isEnabled ? 'disabled' : 'enabled'} successfully`);
      fetchScopes();
    } catch (error: any) {
      setError(error?.message || 'Failed to update scope status');
      console.error('Error updating scope status:', error);
    }
  };

  const handleApplyStandardScope = (standard: typeof STANDARD_SCOPES[0]) => {
    setScopeName(standard.name);
    setScopeDescription(standard.description);
    setScopeValue(standard.value);
    setScopeType('standard');
    setScopePermissions(standard.permissions);
  };

  const resetForm = () => {
    setEditingScope(null);
    setScopeName('');
    setScopeDescription('');
    setScopeValue('');
    setScopeType('custom');
    setScopeGroupId('');
    setScopePermissions([]);
    setUserConsentRequired(true);
  };

  const getApplicationsUsingScope = (scopeId: string) => {
    return applications.filter((app) => app.scopes.includes(scopeId));
  };

  const filteredScopes = scopes.filter((scope) => {
    const matchesType = filterType === 'all' || scope.type === filterType;
    const matchesSearch =
      scope.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scope.value.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scope.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  const getScopesByGroup = () => {
    const grouped: Record<string, Scope[]> = {
      ungrouped: [],
    };

    scopeGroups.forEach((group) => {
      grouped[group.id] = [];
    });

    filteredScopes.forEach((scope) => {
      if (scope.groupId && grouped[scope.groupId]) {
        grouped[scope.groupId].push(scope);
      } else {
        grouped.ungrouped.push(scope);
      }
    });

    return grouped;
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Scope Management</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowGroupModal(true)}
            className="px-4 py-2 border rounded hover:bg-gray-50"
          >
            📁 Manage Groups
          </button>
          <button
            onClick={() => {
              resetForm();
              setShowCreateModal(true);
            }}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            + Create Scope
          </button>
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

      {/* Filters */}
      <div className="mb-4 flex gap-4">
        <input
          type="text"
          placeholder="Search scopes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 max-w-md px-4 py-2 border rounded"
        />
        <div className="flex gap-2">
          <button
            onClick={() => setFilterType('all')}
            className={`px-4 py-2 rounded ${
              filterType === 'all' ? 'bg-indigo-600 text-white' : 'border hover:bg-gray-50'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterType('standard')}
            className={`px-4 py-2 rounded ${
              filterType === 'standard' ? 'bg-indigo-600 text-white' : 'border hover:bg-gray-50'
            }`}
          >
            Standard
          </button>
          <button
            onClick={() => setFilterType('custom')}
            className={`px-4 py-2 rounded ${
              filterType === 'custom' ? 'bg-indigo-600 text-white' : 'border hover:bg-gray-50'
            }`}
          >
            Custom
          </button>
        </div>
      </div>

      {/* Scopes Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Scope Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Value
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Permissions
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Applications
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Consent
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredScopes.map((scope) => (
              <tr key={scope.id}>
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{scope.name}</div>
                  <div className="text-sm text-gray-500">{scope.description}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded">{scope.value}</code>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 text-xs rounded ${
                      scope.type === 'standard'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}
                  >
                    {scope.type}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => {
                      setSelectedScopeForPerms(scope);
                      setShowPermissionsModal(true);
                    }}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    {scope.permissions.length} permissions
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => {
                      setSelectedScopeForApps(scope);
                      setShowApplicationsModal(true);
                    }}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    {scope.applicationCount} apps
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-500">
                    {scope.userConsentRequired ? 'Required' : 'Not Required'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleToggleScopeStatus(scope)}
                    className={`px-2 py-1 text-xs rounded ${
                      scope.isEnabled
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {scope.isEnabled ? 'Enabled' : 'Disabled'}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditScope(scope)}
                      className="text-blue-600 hover:text-blue-900"
                      disabled={scope.type === 'standard'}
                    >
                      Edit
                    </button>
                    {scope.type === 'custom' && (
                      <button
                        onClick={() => handleDeleteScope(scope.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create/Edit Scope Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingScope ? 'Edit Scope' : 'Create New Scope'}
            </h2>

            {!editingScope && (
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded">
                <h3 className="font-medium mb-2">Standard Scopes</h3>
                <div className="flex flex-wrap gap-2">
                  {STANDARD_SCOPES.map((standard) => (
                    <button
                      key={standard.value}
                      onClick={() => handleApplyStandardScope(standard)}
                      className="px-3 py-1 bg-white border rounded text-sm hover:bg-gray-50"
                    >
                      {standard.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleCreateOrUpdateScope}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Scope Name</label>
                  <input
                    type="text"
                    required
                    value={scopeName}
                    onChange={(e) => setScopeName(e.target.value)}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Value (Identifier)</label>
                  <input
                    type="text"
                    required
                    value={scopeValue}
                    onChange={(e) => setScopeValue(e.target.value)}
                    className="w-full px-3 py-2 border rounded"
                    placeholder="e.g., api.read"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    value={scopeDescription}
                    onChange={(e) => setScopeDescription(e.target.value)}
                    className="w-full px-3 py-2 border rounded"
                    rows={2}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <select
                    value={scopeType}
                    onChange={(e) => setScopeType(e.target.value as 'standard' | 'custom')}
                    className="w-full px-3 py-2 border rounded"
                  >
                    <option value="custom">Custom</option>
                    <option value="standard">Standard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Group (Optional)</label>
                  <select
                    value={scopeGroupId}
                    onChange={(e) => setScopeGroupId(e.target.value)}
                    className="w-full px-3 py-2 border rounded"
                  >
                    <option value="">None</option>
                    {scopeGroups.map((group) => (
                      <option key={group.id} value={group.id}>
                        {group.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Permissions</label>
                  <input
                    type="text"
                    value={scopePermissions.join(', ')}
                    onChange={(e) =>
                      setScopePermissions(
                        e.target.value.split(',').map((p) => p.trim()).filter(Boolean)
                      )
                    }
                    className="w-full px-3 py-2 border rounded"
                    placeholder="permission1, permission2, permission3"
                  />
                  <p className="text-xs text-gray-500 mt-1">Comma-separated list</p>
                </div>

                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={userConsentRequired}
                      onChange={(e) => setUserConsentRequired(e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm font-medium">Require user consent</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                >
                  {editingScope ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 border rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Applications Modal */}
      {showApplicationsModal && selectedScopeForApps && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full">
            <h2 className="text-xl font-bold mb-4">
              Applications using {selectedScopeForApps.name}
            </h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {getApplicationsUsingScope(selectedScopeForApps.id).map((app) => (
                <div key={app.id} className="border rounded p-3">
                  <h3 className="font-medium">{app.name}</h3>
                  <p className="text-sm text-gray-500">{app.scopes.length} scopes total</p>
                </div>
              ))}
              {getApplicationsUsingScope(selectedScopeForApps.id).length === 0 && (
                <p className="text-gray-500">No applications using this scope</p>
              )}
            </div>
            <button
              onClick={() => {
                setShowApplicationsModal(false);
                setSelectedScopeForApps(null);
              }}
              className="mt-4 px-4 py-2 border rounded hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Permissions Modal */}
      {showPermissionsModal && selectedScopeForPerms && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full">
            <h2 className="text-xl font-bold mb-4">
              Permissions for {selectedScopeForPerms.name}
            </h2>
            <div className="space-y-2">
              {selectedScopeForPerms.permissions.map((perm) => (
                <div key={perm} className="border rounded p-3">
                  <code className="text-sm">{perm}</code>
                </div>
              ))}
              {selectedScopeForPerms.permissions.length === 0 && (
                <p className="text-gray-500">No permissions defined</p>
              )}
            </div>
            <button
              onClick={() => {
                setShowPermissionsModal(false);
                setSelectedScopeForPerms(null);
              }}
              className="mt-4 px-4 py-2 border rounded hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Scope Groups Modal */}
      {showGroupModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full">
            <h2 className="text-xl font-bold mb-4">Scope Groups</h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {scopeGroups.map((group) => (
                <div key={group.id} className="border rounded p-3">
                  <h3 className="font-medium">{group.name}</h3>
                  <p className="text-sm text-gray-600">{group.description}</p>
                  <p className="text-xs text-gray-400 mt-1">{group.scopes.length} scopes</p>
                </div>
              ))}
              {scopeGroups.length === 0 && (
                <p className="text-gray-500">No scope groups defined</p>
              )}
            </div>
            <button
              onClick={() => setShowGroupModal(false)}
              className="mt-4 px-4 py-2 border rounded hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
