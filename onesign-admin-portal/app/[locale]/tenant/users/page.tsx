'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { getTenantId, setTenantId } from '@/lib/tenant-context';

interface TenantUser {
  id: string;
  email: string;
  status: string;
  isAdmin: boolean;
  lastLoginAt?: string;
}

export default function TenantUsersPage() {
  const t = useTranslations();
  const locale = useLocale();
  const [users, setUsers] = useState<TenantUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteIsAdmin, setInviteIsAdmin] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [tenantId, setTenantIdState] = useState<string | null>(null);

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
      fetchUsers();
    }
  }, [tenantId]);

  const fetchUsers = async () => {
    if (!tenantId) return;
    
    try {
      const response = await fetch(`http://localhost:7000/api/tenant/users?tenantId=${tenantId}&pageNumber=1&pageSize=100`);
      if (response.ok) {
        const data = await response.json();
        setUsers(data.items || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!tenantId) return;
    
    try {
      const response = await fetch(`http://localhost:7000/api/tenant/users/invite?tenantId=${tenantId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: inviteEmail,
          isAdmin: inviteIsAdmin
        })
      });

      if (response.ok) {
        setShowInviteModal(false);
        setInviteEmail('');
        setInviteIsAdmin(false);
        setSuccess(t('tenant.users.userInvited'));
        fetchUsers();
      } else {
        const data = await response.json();
        setError(data.errorMessage || t('common.error'));
      }
    } catch (error) {
      setError(t('common.error'));
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

  if (loading) {
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

