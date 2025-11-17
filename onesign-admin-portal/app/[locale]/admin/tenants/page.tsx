'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';

interface Tenant {
  id: string;
  name: string;
  slug: string;
  status: string;
}

export default function AdminTenantsPage() {
  const t = useTranslations();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTenantName, setNewTenantName] = useState('');
  const [newTenantSlug, setNewTenantSlug] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    try {
      const response = await fetch('http://localhost:7000/api/admin/tenants?pageNumber=1&pageSize=100');
      if (response.ok) {
        const data = await response.json();
        setTenants(data.items || []);
      }
    } catch (error) {
      console.error('Error fetching tenants:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const response = await fetch('http://localhost:7000/api/admin/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newTenantName,
          slug: newTenantSlug
        })
      });

      if (response.ok) {
        setShowCreateModal(false);
        setNewTenantName('');
        setNewTenantSlug('');
        setSuccess(t('admin.tenants.tenantCreated'));
        fetchTenants();
      } else {
        const data = await response.json();
        setError(data.errorMessage || t('common.error'));
      }
    } catch (error) {
      setError(t('common.error'));
      console.error('Error creating tenant:', error);
    }
  };

  const handleUpdateStatus = async (tenantId: string, newStatus: string) => {
    setError('');
    setSuccess('');
    try {
      const response = await fetch(`http://localhost:7000/api/admin/tenants/${tenantId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus
        })
      });

      if (response.ok) {
        setSuccess(t('admin.tenants.statusUpdated'));
        fetchTenants();
      } else {
        const data = await response.json();
        setError(data.errorMessage || t('common.error'));
      }
    } catch (error) {
      setError(t('common.error'));
      console.error('Error updating tenant status:', error);
    }
  };

  if (loading) {
    return <div className="p-8">{t('common.loading')}</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{t('admin.tenants.title')}</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          {t('admin.tenants.createTenant')}
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

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">{t('admin.tenants.createTenant')}</h2>
            <form onSubmit={handleCreateTenant}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">{t('admin.tenants.tenantName')}</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border rounded"
                  value={newTenantName}
                  onChange={(e) => setNewTenantName(e.target.value)}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">{t('admin.tenants.tenantSlug')}</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border rounded"
                  value={newTenantSlug}
                  onChange={(e) => setNewTenantSlug(e.target.value)}
                />
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

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.tenants.tenantName')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.tenants.tenantSlug')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.tenants.status')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tenants.map((tenant) => (
              <tr key={tenant.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{tenant.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{tenant.slug}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{tenant.status}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <select
                    value={tenant.status}
                    onChange={(e) => handleUpdateStatus(tenant.id, e.target.value)}
                    className="text-sm border rounded px-2 py-1"
                  >
                    <option value="Active">Active</option>
                    <option value="Suspended">Suspended</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

