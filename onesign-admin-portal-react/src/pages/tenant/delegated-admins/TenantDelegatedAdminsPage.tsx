import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getTenantId } from '@/lib/tenant-context';
import { getCurrentUserScope, CurrentUserScopeDto } from '@/lib/api/users';
import { tenantService } from '@/lib/api/services/tenant.service';
import { usersService } from '@/lib/api/services/users.service';
import { Helmet } from 'react-helmet-async';

interface DelegatedAdmin {
  id: string;
  tenantUserId: string;
  userEmail?: string;
  userDisplayName?: string;
  orgUnitId: string;
  orgUnitName: string;
  scopeType: number; // 1 = OrgOnly, 2 = OrgAndDescendants
  createdAt: string;
}

interface OrgUnitTreeNode {
  id: string;
  parentId: string | null;
  name: string;
  code?: string;
  level: number;
  status: number;
  children: OrgUnitTreeNode[];
}

export default function TenantDelegatedAdminsPage() {
  const { t } = useTranslation();
  const locale = useLocale();
  const [delegatedAdmins, setDelegatedAdmins] = useState<DelegatedAdmin[]>([]);
  const [orgTree, setOrgTree] = useState<OrgUnitTreeNode[]>([]);
  const [tenantUsers, setTenantUsers] = useState<Array<{ id: string; email: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedOrgUnitId, setSelectedOrgUnitId] = useState('');
  const [selectedScopeType, setSelectedScopeType] = useState<number>(2);
  const [tenantId, setTenantId] = useState<string>('');
  const [userScope, setUserScope] = useState<CurrentUserScopeDto | null>(null);
  const [scopeLoading, setScopeLoading] = useState(true);

  useEffect(() => {
    const tid = getTenantId();
    if (tid) {
      setTenantId(tid);
      loadData(tid);
      fetchUserScope(tid);
    } else {
      setTenantId('00000000-0000-0000-0000-000000000000');
      loadData('00000000-0000-0000-0000-000000000000');
      fetchUserScope('00000000-0000-0000-0000-000000000000');
    }
  }, []);

  const fetchUserScope = async (tid: string) => {
    try {
      setScopeLoading(true);
      const scope = await getCurrentUserScope(tid);
      setUserScope(scope);
    } catch (err) {
      console.error('Error fetching user scope:', err);
    } finally {
      setScopeLoading(false);
    }
  };

  const loadData = async (tid: string) => {
    try {
      setLoading(true);
      const [admins, tree, usersData] = await Promise.all([
        tenantService.getDelegatedAdmins(tid),
        tenantService.getOrgUnitsTree(tid),
        usersService.getUsers({ tenantId: tid, pageSize: 1000 })
      ]);

      setDelegatedAdmins(admins);
      setOrgTree(tree);

      const adminUsers = usersData.items?.filter((u: any) => u.isAdmin) || [];
      setTenantUsers(adminUsers.map((u: any) => ({ id: u.id, email: u.email })));
    } catch (err) {
      setError(t('common.error'));
    } finally {
      setLoading(false);
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

  const handleCreate = async () => {
    try {
      await tenantService.createDelegatedAdmin(tenantId, {
        tenantUserId: selectedUserId,
        orgUnitId: selectedOrgUnitId,
        scopeType: selectedScopeType
      });

      setShowCreateModal(false);
      setSelectedUserId('');
      setSelectedOrgUnitId('');
      setSelectedScopeType(2);
      loadData(tenantId);
    } catch (err: any) {
      setError(err.message || t('common.error'));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('tenant.delegatedAdmins.confirmRemove'))) return;
    try {
      await tenantService.deleteDelegatedAdmin(tenantId, id);
      loadData(tenantId);
    } catch (err: any) {
      setError(err.message || t('common.error'));
    }
  };

  if (loading || scopeLoading) {
    return <div className="p-8">{t('common.loading')}</div>;
  }

  // Show access restriction for non-global admins
  if (userScope && !userScope.isGlobalAdmin) {
    return (
      <div className="p-8">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-6 py-4 rounded-lg">
          <h2 className="text-xl font-bold mb-2">Access Restricted</h2>
          <p>Only global administrators can manage delegated admins.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('tenant.delegatedAdmins.title')}</h1>
        <button
          onClick={() => {
            setSelectedUserId('');
            setSelectedOrgUnitId('');
            setSelectedScopeType(2);
            setShowCreateModal(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {t('tenant.delegatedAdmins.createDelegatedAdmin')}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('tenant.delegatedAdmins.user')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('tenant.delegatedAdmins.orgUnit')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('tenant.delegatedAdmins.scopeType')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {delegatedAdmins.map(admin => (
              <tr key={admin.id}>
                <td className="px-6 py-4 whitespace-nowrap">{admin.userEmail || admin.userDisplayName || admin.tenantUserId}</td>
                <td className="px-6 py-4 whitespace-nowrap">{admin.orgUnitName}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {admin.scopeType === 1 ? t('tenant.delegatedAdmins.orgOnly') : t('tenant.delegatedAdmins.orgAndDescendants')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleDelete(admin.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    {t('common.delete')}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h2 className="text-xl font-bold mb-4">{t('tenant.delegatedAdmins.createDelegatedAdmin')}</h2>
            <div className="mb-4">
              <label className="block mb-2">{t('tenant.delegatedAdmins.user')}</label>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">{t('tenant.delegatedAdmins.selectUser')}</option>
                {tenantUsers.map(user => (
                  <option key={user.id} value={user.id}>{user.email}</option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block mb-2">{t('tenant.delegatedAdmins.orgUnit')}</label>
              <select
                value={selectedOrgUnitId}
                onChange={(e) => setSelectedOrgUnitId(e.target.value)}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">{t('tenant.delegatedAdmins.selectOrgUnit')}</option>
                {getAllNodes(orgTree).map(node => (
                  <option key={node.id} value={node.id}>{node.name}</option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block mb-2">{t('tenant.delegatedAdmins.scopeType')}</label>
              <select
                value={selectedScopeType}
                onChange={(e) => setSelectedScopeType(Number(e.target.value))}
                className="w-full border rounded px-3 py-2"
              >
                <option value={1}>{t('tenant.delegatedAdmins.orgOnly')}</option>
                <option value={2}>{t('tenant.delegatedAdmins.orgAndDescendants')}</option>
              </select>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 border rounded"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleCreate}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {t('common.create')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

