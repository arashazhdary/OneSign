'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { getTenantId, setTenantId } from '@/lib/tenant-context';
import { usersService } from '@/lib/api/services/users.service';
import type { TenantUserDto, CurrentUserScopeDto } from '@/lib/api/types/users';

type TenantUser = TenantUserDto;

interface OrgUnitTreeNode {
  id: string;
  parentId: string | null;
  name: string;
  code?: string;
  level: number;
  status: number;
  children: OrgUnitTreeNode[];
}

export default function TenantUsersPage() {
  const t = useTranslations();
  const locale = useLocale();
  const [users, setUsers] = useState<TenantUser[]>([]);
  const [orgTree, setOrgTree] = useState<OrgUnitTreeNode[]>([]);
  const [selectedOrgUnitId, setSelectedOrgUnitId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showAssignOrgUnitsModal, setShowAssignOrgUnitsModal] = useState(false);
  const [selectedUserForOrgUnits, setSelectedUserForOrgUnits] = useState<TenantUser | null>(null);
  const [primaryOrgUnitId, setPrimaryOrgUnitId] = useState<string>('');
  const [secondaryOrgUnitIds, setSecondaryOrgUnitIds] = useState<string[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteIsAdmin, setInviteIsAdmin] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [tenantId, setTenantIdState] = useState<string | null>(null);
  const [userScope, setUserScope] = useState<CurrentUserScopeDto | null>(null);
  const [scopeLoading, setScopeLoading] = useState(true);

  useEffect(() => {
    // Get tenant ID from context
    const contextTenantId = getTenantId();
    if (contextTenantId) {
      setTenantIdState(contextTenantId);
    } else {
      // Default placeholder for Phase 1
      setTenantIdState('00000000-0000-0000-0000-000000000000');
    }
  }, []);

  useEffect(() => {
    if (tenantId) {
      fetchUserScope(tenantId);
    }
  }, [tenantId]);

  const fetchUserScope = async (tid: string) => {
    try {
      setScopeLoading(true);
      const scope = await usersService.getCurrentUserScope(tid);
      setUserScope(scope);

      // Auto-select first rootOrgUnitId for delegated admins
      if (scope && !scope.isGlobalAdmin && scope.rootOrgUnitIds.length > 0) {
        setSelectedOrgUnitId(scope.rootOrgUnitIds[0]);
      }
    } catch (err) {
      console.error('Error fetching user scope:', err);
    } finally {
      setScopeLoading(false);
    }
  };

  useEffect(() => {
    if (tenantId) {
      fetchUsers();
      fetchOrgTree();
    }
  }, [tenantId, selectedOrgUnitId]);

  const fetchUsers = async () => {
    if (!tenantId) return;

    try {
      const data = await usersService.getUsers({
        tenantId,
        orgUnitId: selectedOrgUnitId || undefined,
        pageNumber: 1,
        pageSize: 100,
      });
      setUsers(data.items || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrgTree = async () => {
    if (!tenantId) return;
    try {
      const response = await fetch(`http://localhost:7000/api/tenant/org-units/tree?tenantId=${tenantId}`, {
        headers: { 'Accept-Language': locale }
      });
      if (response.ok) {
        const data = await response.json();
        setOrgTree(data);
      }
    } catch (error) {
      console.error('Error fetching org tree:', error);
    }
  };

  const getAllNodes = (nodes: OrgUnitTreeNode[]): OrgUnitTreeNode[] => {
    const result: OrgUnitTreeNode[] = [];
    nodes.forEach(node => {
      result.push(node);
      if (node.children) {
        result.push(...getAllNodes(node.children));
      }
    });
    return result;
  };

  const getFilteredOrgTree = (): OrgUnitTreeNode[] => {
    if (!userScope || userScope.isGlobalAdmin) {
      return orgTree;
    }
    // Filter to show only allowed org units
    const allNodes = getAllNodes(orgTree);
    return allNodes.filter(node => userScope.allowedOrgUnitIds.includes(node.id));
  };

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!tenantId) return;

    try {
      await usersService.inviteUser({
        tenantId,
        email: inviteEmail,
        isAdmin: inviteIsAdmin,
      });

      setShowInviteModal(false);
      setInviteEmail('');
      setInviteIsAdmin(false);
      setSuccess(t('tenant.users.userInvited'));
      fetchUsers();
    } catch (error: any) {
      setError(error?.message || t('common.error'));
      console.error('Error inviting user:', error);
    }
  };

  const handleDisableUser = async (userId: string) => {
    if (!confirm(t('tenant.users.confirmDisable'))) return;
    setError('');
    setSuccess('');
    if (!tenantId) return;
    
    try {
      const response = await fetch(`http://localhost:7000/api/tenant/users/${userId}/status?tenantId=${tenantId}`, {
        method: 'PATCH'
      });

      if (response.ok) {
        setSuccess(t('tenant.users.userDisabled'));
        fetchUsers();
      } else {
        const data = await response.json();
        setError(data.errorMessage || t('common.error'));
      }
    } catch (error) {
      setError(t('common.error'));
      console.error('Error disabling user:', error);
    }
  };

  const handleAssignOrgUnits = async (user: TenantUser) => {
    setSelectedUserForOrgUnits(user);
    try {
      const response = await fetch(`http://localhost:7000/api/tenant/users/${user.id}/org-units?tenantId=${tenantId}`, {
        headers: { 'Accept-Language': locale }
      });
      if (response.ok) {
        const data = await response.json();
        setPrimaryOrgUnitId(data.primaryOrgUnitId || '');
        setSecondaryOrgUnitIds(data.secondaryOrgUnitIds || []);
      }
    } catch (error) {
      console.error('Error fetching user org units:', error);
    }
    setShowAssignOrgUnitsModal(true);
  };

  const handleSaveOrgUnits = async () => {
    if (!selectedUserForOrgUnits || !primaryOrgUnitId) return;
    setError('');
    setSuccess('');
    
    try {
      const response = await fetch(`http://localhost:7000/api/tenant/users/${selectedUserForOrgUnits.id}/org-units?tenantId=${tenantId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept-Language': locale
        },
        body: JSON.stringify({
          primaryOrgUnitId,
          secondaryOrgUnitIds
        })
      });

      if (response.ok) {
        setSuccess(t('tenant.userOrgUnits.orgUnitsAssigned'));
        setShowAssignOrgUnitsModal(false);
        setSelectedUserForOrgUnits(null);
        fetchUsers();
      } else {
        const data = await response.json();
        setError(data.errorMessage || t('common.error'));
      }
    } catch (error) {
      setError(t('common.error'));
      console.error('Error assigning org units:', error);
    }
  };

  if (loading || scopeLoading) {
    return <div className="p-8">{t('common.loading')}</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{t('tenant.users.title')}</h1>
        <button
          onClick={() => setShowInviteModal(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          {t('tenant.users.inviteUser')}
        </button>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">{t('tenant.orgUnits.title')}</label>
        <select
          value={selectedOrgUnitId}
          onChange={(e) => {
            setSelectedOrgUnitId(e.target.value);
            setLoading(true);
          }}
          className="w-full max-w-xs px-3 py-2 border rounded"
        >
          {(!userScope || userScope.isGlobalAdmin) && <option value="">{t('common.all') || 'All'}</option>}
          {getFilteredOrgTree().map(node => (
            <option key={node.id} value={node.id}>{node.name}</option>
          ))}
        </select>
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

      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">{t('tenant.users.inviteUser')}</h2>
            <form onSubmit={handleInviteUser}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">{t('tenant.users.email')}</label>
                <input
                  type="email"
                  required
                  className="w-full px-3 py-2 border rounded"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
              </div>
              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={inviteIsAdmin}
                    onChange={(e) => setInviteIsAdmin(e.target.checked)}
                  />
                  {t('tenant.users.isAdmin')}
                </label>
              </div>
              <div className="flex gap-2">
                <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded">
                  {t('common.create')}
                </button>
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="bg-gray-300 px-4 py-2 rounded"
                >
                  {t('common.cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign OrgUnits Modal */}
      {showAssignOrgUnitsModal && selectedUserForOrgUnits && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">{t('tenant.userOrgUnits.assignOrgUnits')} - {selectedUserForOrgUnits.email}</h2>
            <div className="mb-4">
              <label className="block mb-2">{t('tenant.userOrgUnits.primaryOrgUnit')}</label>
              <select
                value={primaryOrgUnitId}
                onChange={(e) => setPrimaryOrgUnitId(e.target.value)}
                className="w-full border rounded px-3 py-2"
                required
              >
                <option value="">{t('tenant.delegatedAdmins.selectOrgUnit')}</option>
                {getFilteredOrgTree().map(node => (
                  <option key={node.id} value={node.id}>{node.name}</option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block mb-2">{t('tenant.userOrgUnits.secondaryOrgUnits')}</label>
              <select
                multiple
                value={secondaryOrgUnitIds}
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions, option => option.value);
                  setSecondaryOrgUnitIds(selected);
                }}
                className="w-full border rounded px-3 py-2"
                size={5}
              >
                {getFilteredOrgTree()
                  .filter(node => node.id !== primaryOrgUnitId)
                  .map(node => (
                    <option key={node.id} value={node.id}>{node.name}</option>
                  ))}
              </select>
              <p className="text-sm text-gray-500 mt-1">{t('common.holdCtrl') || 'Hold Ctrl/Cmd to select multiple'}</p>
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
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowAssignOrgUnitsModal(false);
                  setSelectedUserForOrgUnits(null);
                  setError('');
                  setSuccess('');
                }}
                className="px-4 py-2 border rounded"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleSaveOrgUnits}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {t('common.save')}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('tenant.users.email')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('tenant.users.status')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('tenant.users.isAdmin')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('tenant.users.lastLogin')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('tenant.users.actions')}</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.status}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.isAdmin ? 'Yes' : 'No'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.lastLoginAt || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAssignOrgUnits(user)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      {t('tenant.userOrgUnits.assignOrgUnits')}
                    </button>
                    {user.status !== 'Disabled' && (
                      <button
                        onClick={() => handleDisableUser(user.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        {t('tenant.users.disable')}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

