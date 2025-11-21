'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';

interface KeySet {
  id: string;
  name: string;
  algorithm: string;
  keySize: number;
  status: 'Active' | 'Retired' | 'Compromised';
  createdAt: string;
  lastRotatedAt?: string;
  expiresAt?: string;
  purpose: string;
}

interface RotationPolicy {
  id: string;
  name: string;
  keySetId?: string;
  rotationInterval: number;
  rotationUnit: 'Days' | 'Weeks' | 'Months';
  autoRotate: boolean;
  gracePeriod: number;
  notifyBefore: number;
  lastUpdated: string;
}

type Tab = 'keysets' | 'policies';

export default function CryptographyManagementPage() {
  const t = useTranslations();
  const [activeTab, setActiveTab] = useState<Tab>('keysets');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [keySets, setKeySets] = useState<KeySet[]>([]);
  const [rotationPolicies, setRotationPolicies] = useState<RotationPolicy[]>([]);

  const [showCreateKeySetModal, setShowCreateKeySetModal] = useState(false);
  const [newKeySet, setNewKeySet] = useState({
    name: '',
    algorithm: 'RSA',
    keySize: 2048,
    purpose: '',
  });

  const [showCreatePolicyModal, setShowCreatePolicyModal] = useState(false);
  const [newPolicy, setNewPolicy] = useState({
    name: '',
    rotationInterval: 90,
    rotationUnit: 'Days' as 'Days' | 'Weeks' | 'Months',
    autoRotate: true,
    gracePeriod: 7,
    notifyBefore: 14,
  });

  useEffect(() => {
    if (activeTab === 'keysets') {
      fetchKeySets();
    } else if (activeTab === 'policies') {
      fetchRotationPolicies();
    }
  }, [activeTab]);

  const fetchKeySets = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:7000/api/global/crypto/key-sets');
      if (response.ok) {
        const data = await response.json();
        setKeySets(data.items || data || []);
      } else {
        const data = await response.json();
        setError(data.errorMessage || t('common.error'));
      }
    } catch (err) {
      setError(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const fetchRotationPolicies = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:7000/api/global/crypto/rotation-policies');
      if (response.ok) {
        const data = await response.json();
        setRotationPolicies(data.policies || data || []);
      } else {
        const data = await response.json();
        setError(data.errorMessage || t('common.error'));
      }
    } catch (err) {
      setError(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateKeySet = async () => {
    if (!newKeySet.name || !newKeySet.purpose) {
      setError('Please fill all required fields');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const response = await fetch('http://localhost:7000/api/global/crypto/key-sets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newKeySet),
      });
      if (response.ok) {
        setSuccess('Key set created successfully');
        setShowCreateKeySetModal(false);
        setNewKeySet({ name: '', algorithm: 'RSA', keySize: 2048, purpose: '' });
        fetchKeySets();
      } else {
        const data = await response.json();
        setError(data.errorMessage || t('common.error'));
      }
    } catch (err) {
      setError(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleRotateKey = async (keySetId: string) => {
    if (!confirm('Are you sure you want to rotate this key set?')) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const response = await fetch(`http://localhost:7000/api/global/crypto/key-sets/${keySetId}/rotate`, {
        method: 'POST',
      });
      if (response.ok) {
        setSuccess('Key rotation started successfully');
        fetchKeySets();
      } else {
        const data = await response.json();
        setError(data.errorMessage || t('common.error'));
      }
    } catch (err) {
      setError(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePolicy = async () => {
    if (!newPolicy.name) {
      setError('Please fill all required fields');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const response = await fetch('http://localhost:7000/api/global/crypto/rotation-policies', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPolicy),
      });
      if (response.ok) {
        setSuccess('Rotation policy updated successfully');
        setShowCreatePolicyModal(false);
        setNewPolicy({
          name: '',
          rotationInterval: 90,
          rotationUnit: 'Days',
          autoRotate: true,
          gracePeriod: 7,
          notifyBefore: 14,
        });
        fetchRotationPolicies();
      } else {
        const data = await response.json();
        setError(data.errorMessage || t('common.error'));
      }
    } catch (err) {
      setError(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Retired':
        return 'bg-gray-100 text-gray-800';
      case 'Compromised':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDaysUntilExpiry = (expiresAt?: string) => {
    if (!expiresAt) return null;
    const now = new Date();
    const expiry = new Date(expiresAt);
    const days = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Cryptography Management</h1>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>
      )}

      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">{success}</div>
      )}

      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {(['keysets', 'policies'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab === 'keysets' ? 'Key Sets' : 'Rotation Policies'}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'keysets' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setShowCreateKeySetModal(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
            >
              Create Key Set
            </button>
          </div>

          {showCreateKeySetModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-md w-full">
                <h2 className="text-xl font-bold mb-4">Create New Key Set</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                    <input
                      type="text"
                      value={newKeySet.name}
                      onChange={(e) => setNewKeySet({ ...newKeySet, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Algorithm *</label>
                    <select
                      value={newKeySet.algorithm}
                      onChange={(e) => setNewKeySet({ ...newKeySet, algorithm: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="RSA">RSA</option>
                      <option value="AES">AES</option>
                      <option value="ECDSA">ECDSA</option>
                      <option value="EdDSA">EdDSA</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Key Size *</label>
                    <select
                      value={newKeySet.keySize}
                      onChange={(e) => setNewKeySet({ ...newKeySet, keySize: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="1024">1024 bits</option>
                      <option value="2048">2048 bits</option>
                      <option value="3072">3072 bits</option>
                      <option value="4096">4096 bits</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Purpose *</label>
                    <input
                      type="text"
                      value={newKeySet.purpose}
                      onChange={(e) => setNewKeySet({ ...newKeySet, purpose: e.target.value })}
                      placeholder="e.g., JWT signing, data encryption"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2 mt-6">
                  <button
                    onClick={() => setShowCreateKeySetModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateKeySet}
                    disabled={loading}
                    className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
                  >
                    Create
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Algorithm</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Key Size</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Purpose</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Rotated</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expires</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {keySets.map((keySet) => {
                  const daysUntilExpiry = getDaysUntilExpiry(keySet.expiresAt);
                  return (
                    <tr key={keySet.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{keySet.name}</div>
                        <div className="text-xs text-gray-500">{keySet.id}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{keySet.algorithm}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{keySet.keySize} bits</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded text-xs ${getStatusColor(keySet.status)}`}>
                          {keySet.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{keySet.purpose}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {keySet.lastRotatedAt ? new Date(keySet.lastRotatedAt).toLocaleDateString() : 'Never'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {keySet.expiresAt ? (
                          <div>
                            <div className={daysUntilExpiry && daysUntilExpiry < 30 ? 'text-red-600 font-medium' : 'text-gray-500'}>
                              {new Date(keySet.expiresAt).toLocaleDateString()}
                            </div>
                            {daysUntilExpiry !== null && (
                              <div className="text-xs text-gray-500">
                                {daysUntilExpiry > 0 ? `${daysUntilExpiry} days` : 'Expired'}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-500">No expiry</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {keySet.status === 'Active' && (
                          <button
                            onClick={() => handleRotateKey(keySet.id)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Rotate
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {keySets.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                      No key sets found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'policies' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setShowCreatePolicyModal(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
            >
              Create Policy
            </button>
          </div>

          {showCreatePolicyModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-md w-full">
                <h2 className="text-xl font-bold mb-4">Create Rotation Policy</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                    <input
                      type="text"
                      value={newPolicy.name}
                      onChange={(e) => setNewPolicy({ ...newPolicy, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Rotation Interval</label>
                      <input
                        type="number"
                        value={newPolicy.rotationInterval}
                        onChange={(e) => setNewPolicy({ ...newPolicy, rotationInterval: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                      <select
                        value={newPolicy.rotationUnit}
                        onChange={(e) => setNewPolicy({ ...newPolicy, rotationUnit: e.target.value as any })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      >
                        <option value="Days">Days</option>
                        <option value="Weeks">Weeks</option>
                        <option value="Months">Months</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newPolicy.autoRotate}
                        onChange={(e) => setNewPolicy({ ...newPolicy, autoRotate: e.target.checked })}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Enable Auto Rotation</span>
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Grace Period (days)</label>
                    <input
                      type="number"
                      value={newPolicy.gracePeriod}
                      onChange={(e) => setNewPolicy({ ...newPolicy, gracePeriod: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notify Before (days)</label>
                    <input
                      type="number"
                      value={newPolicy.notifyBefore}
                      onChange={(e) => setNewPolicy({ ...newPolicy, notifyBefore: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2 mt-6">
                  <button
                    onClick={() => setShowCreatePolicyModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdatePolicy}
                    disabled={loading}
                    className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
                  >
                    Create
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rotationPolicies.map((policy) => (
              <div key={policy.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{policy.name}</h3>
                  <span className={`px-2 py-1 rounded text-xs ${
                    policy.autoRotate ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {policy.autoRotate ? 'Auto' : 'Manual'}
                  </span>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Rotation Interval</span>
                    <span className="text-sm font-medium text-gray-900">
                      {policy.rotationInterval} {policy.rotationUnit}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Grace Period</span>
                    <span className="text-sm font-medium text-gray-900">{policy.gracePeriod} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Notify Before</span>
                    <span className="text-sm font-medium text-gray-900">{policy.notifyBefore} days</span>
                  </div>
                  <div className="flex justify-between border-t pt-3">
                    <span className="text-sm text-gray-500">Last Updated</span>
                    <span className="text-sm text-gray-900">
                      {new Date(policy.lastUpdated).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            {rotationPolicies.length === 0 && (
              <div className="col-span-2 bg-white rounded-lg shadow p-6 text-center text-gray-500">
                No rotation policies configured
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
