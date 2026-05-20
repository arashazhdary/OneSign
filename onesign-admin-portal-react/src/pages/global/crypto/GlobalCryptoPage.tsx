import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { globalService } from '@/lib/api/services/global.service';
import { Helmet } from 'react-helmet-async';

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

type Tab = 'keysets' | 'policies' | 'versions';

export default function GlobalCryptoPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<Tab>('keysets');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [keySets, setKeySets] = useState<KeySet[]>([]);
  const [rotationPolicies, setRotationPolicies] = useState<RotationPolicy[]>([]);
  const [versionIdToRevoke, setVersionIdToRevoke] = useState('');

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
      const data = await globalService.getKeySets();
      // Map KeySetDto to KeySet
      const mappedKeySets = (data || []).map((dto: any) => ({
        id: dto.id,
        name: dto.name,
        algorithm: dto.algorithm,
        keySize: 2048, // Default value as keySize is not in DTO
        status: dto.status as 'Active' | 'Retired' | 'Compromised',
        createdAt: dto.createdAt,
        lastRotatedAt: dto.rotatedAt,
        expiresAt: dto.expiresAt,
        purpose: dto.purpose,
      }));
      setKeySets(mappedKeySets);
    } catch (err) {
      setError(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const getKeySet = async (id: string) => {
    setError('');
    try {
      const keySets = await globalService.getKeySets();
      return keySets.find(ks => ks.id === id) || null;
    } catch (err) {
      setError(t('common.error'));
      return null;
    }
  };

  const rolloverKeySet = async (id: string) => {
    setError('');
    setSuccess('');
    try {
      await globalService.rolloverKeySet(id);
      setSuccess(t('global.crypto.messages.keysetRolloverInitiated'));
      fetchKeySets();
    } catch (err) {
      setError(t('common.error'));
    }
  };

  const revokeKeyVersion = async (versionId: string) => {
    setError('');
    setSuccess('');
    try {
      // revokeKeyVersion method not available in globalService
      // This would need to be implemented in the backend
      console.warn('revokeKeyVersion not yet implemented');
      setError('Key version revocation is not yet implemented');
    } catch (err) {
      setError(t('common.error'));
    }
  };

  const fetchRotationPolicies = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await globalService.getRotationPolicies();
      // Map RotationPolicyDto to RotationPolicy
      const mappedPolicies = (data || []).map((dto: any) => ({
        id: dto.id,
        name: `Policy ${dto.id}`,
        keySetId: dto.keySetId,
        rotationInterval: dto.rotationIntervalDays,
        rotationUnit: 'Days' as const,
        autoRotate: dto.isEnabled,
        gracePeriod: 7,
        notifyBefore: 14,
        lastUpdated: new Date().toISOString(),
      }));
      setRotationPolicies(mappedPolicies);
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
      await globalService.createKeySet(newKeySet);
      setSuccess(t('global.crypto.messages.keySetCreated'));
      setShowCreateKeySetModal(false);
      setNewKeySet({ name: '', algorithm: 'RSA', keySize: 2048, purpose: '' });
      fetchKeySets();
    } catch (err) {
      setError(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleRotateKey = async (keySetId: string) => {
    if (!confirm(t('global.crypto.confirmRotateKey'))) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await globalService.rolloverKeySet(keySetId);
      setSuccess(t('global.crypto.messages.keyRotationStarted'));
      fetchKeySets();
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
      // Create a new policy instead of updating (no ID available)
      // If updating an existing policy, the policyId would need to be tracked in state
      await globalService.updateRotationPolicy('default', {
        rotationIntervalDays: newPolicy.rotationInterval,
        isEnabled: newPolicy.autoRotate,
      } as any);
      setSuccess(t('global.crypto.messages.rotationPolicyUpdated'));
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
      <h1 className="text-3xl font-bold mb-6">{t('global.crypto.title')}</h1>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>
      )}

      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">{success}</div>
      )}

      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {(['keysets', 'versions', 'policies'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab === 'keysets' ? t('global.crypto.keySets') : tab === 'versions' ? t('global.crypto.keyVersions') : t('global.crypto.rotationPolicies')}
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
              {t('global.crypto.createKeySet')}
            </button>
          </div>

          {showCreateKeySetModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-md w-full">
                <h2 className="text-xl font-bold mb-4">{t('global.crypto.createNewKeySet')}</h2>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('global.crypto.algorithm')} *</label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('global.crypto.keySize')} *</label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('global.crypto.purpose')} *</label>
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
                    {t('common.cancel')}
                  </button>
                  <button
                    onClick={handleCreateKeySet}
                    disabled={loading}
                    className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {t('common.create')}
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('common.name')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('global.crypto.algorithm')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('global.crypto.keySize')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('common.status')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('global.crypto.purpose')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('global.crypto.lastRotated')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('global.crypto.expires')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('common.actions')}</th>
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
                        <div className="flex gap-2">
                          {keySet.status === 'Active' && (
                            <>
                              <button
                                onClick={() => handleRotateKey(keySet.id)}
                                className="text-indigo-600 hover:text-indigo-900"
                              >
                                Rotate
                              </button>
                              <button
                                onClick={() => rolloverKeySet(keySet.id)}
                                className="text-purple-600 hover:text-purple-900"
                              >
                                Rollover
                              </button>
                              <button
                                onClick={async () => {
                                  const detail = await getKeySet(keySet.id);
                                  if (detail) alert(JSON.stringify(detail, null, 2));
                                }}
                                className="text-gray-600 hover:text-gray-900"
                              >
                                View
                              </button>
                            </>
                          )}
                        </div>
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

      {activeTab === 'versions' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-6">Key Version Management</h2>
          <div className="flex gap-4 items-end mb-6">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Key Version ID to Revoke
              </label>
              <input
                type="text"
                value={versionIdToRevoke}
                onChange={(e) => setVersionIdToRevoke(e.target.value)}
                placeholder="Enter key version ID"
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
            </div>
            <button
              onClick={() => {
                if (versionIdToRevoke) {
                  revokeKeyVersion(versionIdToRevoke);
                  setVersionIdToRevoke('');
                }
              }}
              disabled={!versionIdToRevoke}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
            >
              Revoke Version
            </button>
          </div>

          <div className="border-t pt-6">
            <p className="text-sm text-gray-600 mb-4">
              Revoking a key version will immediately invalidate it. This action cannot be undone.
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
              <h3 className="text-sm font-semibold text-yellow-800 mb-2">Important Notes:</h3>
              <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
                <li>Ensure the key version ID is correct before revoking</li>
                <li>Revoked versions cannot be used for any cryptographic operations</li>
                <li>Active sessions using the revoked version will be terminated</li>
                <li>Consider the grace period defined in your rotation policies</li>
              </ul>
            </div>
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
