'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { getTenantId } from '@/lib/tenant-context';

interface SecurityPolicy {
  id: string;
  tenantId: string;
  mfaRequirement: number;
  allowTrustedDevices: boolean;
  trustedDeviceExpireDays: number;
  sessionTimeoutMinutes: number;
  maxFailedLoginAttempts: number;
}

interface UserMfaMethod {
  id: string;
  methodType: number;
  isDefault: boolean;
  createdAt: string;
}

interface TrustedDevice {
  id: string;
  deviceName: string;
  createdAt: string;
  expiresAt: string;
  lastUsedAt: string | null;
}

interface OrgUnitRule {
  id: string;
  orgUnitId: string;
  orgUnitName: string;
  mfaRequired: boolean;
  allowedAuthMethods: string[];
  sessionTimeoutMinutes: number;
}

export default function SecurityCenterPage() {
  const t = useTranslations();
  const [policy, setPolicy] = useState<SecurityPolicy | null>(null);
  const [mfaMethods, setMfaMethods] = useState<UserMfaMethod[]>([]);
  const [trustedDevices, setTrustedDevices] = useState<TrustedDevice[]>([]);
  const [orgUnitRules, setOrgUnitRules] = useState<OrgUnitRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showOrgUnitRulesModal, setShowOrgUnitRulesModal] = useState(false);

  // Policy form state
  const [mfaRequirement, setMfaRequirement] = useState(0);
  const [allowTrustedDevices, setAllowTrustedDevices] = useState(true);
  const [trustedDeviceExpireDays, setTrustedDeviceExpireDays] = useState(30);
  const [sessionTimeoutMinutes, setSessionTimeoutMinutes] = useState(30);
  const [maxFailedLoginAttempts, setMaxFailedLoginAttempts] = useState(5);

  // TOTP enrollment state
  const [showTotpEnrollment, setShowTotpEnrollment] = useState(false);
  const [totpSecret, setTotpSecret] = useState('');
  const [totpQrCode, setTotpQrCode] = useState('');
  const [totpCode, setTotpCode] = useState('');

  const tenantId = getTenantId();

  useEffect(() => {
    fetchSecurityData();
  }, []);

  const fetchSecurityData = async () => {
    setLoading(true);
    try {
      // Fetch security policy
      const policyRes = await fetch(`http://localhost:7000/api/tenant/security/policy?tenantId=${tenantId}`, {
        credentials: 'include',
      });
      if (policyRes.ok) {
        const policyData = await policyRes.json();
        setPolicy(policyData);
        setMfaRequirement(policyData.mfaRequirement);
        setAllowTrustedDevices(policyData.allowTrustedDevices);
        setTrustedDeviceExpireDays(policyData.trustedDeviceExpireDays);
        setSessionTimeoutMinutes(policyData.sessionTimeoutMinutes);
        setMaxFailedLoginAttempts(policyData.maxFailedLoginAttempts);
      }

      // Fetch org unit rules
      const rulesRes = await fetch(`http://localhost:7000/api/tenant/security/policy/org-unit-rules?tenantId=${tenantId}`, {
        credentials: 'include',
      });
      if (rulesRes.ok) {
        const rulesData = await rulesRes.json();
        setOrgUnitRules(rulesData || []);
      }

      // Fetch MFA methods (would need userId - skip for now)
      // Fetch trusted devices (would need userId - skip for now)
    } catch (err) {
      setError(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePolicy = async () => {
    setError('');
    setSuccess('');
    try {
      const response = await fetch(`http://localhost:7000/api/tenant/security/policy?tenantId=${tenantId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          mfaRequirement,
          allowTrustedDevices,
          trustedDeviceExpireDays,
          sessionTimeoutMinutes,
          maxFailedLoginAttempts,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update policy');
      }

      setSuccess(t('security.policyUpdated'));
      await fetchSecurityData();
    } catch (err) {
      setError(t('common.error'));
    }
  };

  const handleBeginTotpEnrollment = async () => {
    setError('');
    try {
      const userId = 'current-user-id'; // Should be from auth context
      const userEmail = 'user@example.com'; // Should be from auth context

      const response = await fetch(`http://localhost:7000/api/tenant/mfa/totp/begin?userId=${userId}&userEmail=${userEmail}`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to begin TOTP enrollment');
      }

      const data = await response.json();
      setTotpSecret(data.secret);
      setTotpQrCode(data.qrCodeUri);
      setShowTotpEnrollment(true);
    } catch (err) {
      setError(t('common.error'));
    }
  };

  const handleConfirmTotpEnrollment = async () => {
    setError('');
    setSuccess('');
    try {
      const userId = 'current-user-id'; // Should be from auth context

      const response = await fetch(`http://localhost:7000/api/tenant/mfa/totp/confirm?userId=${userId}&tenantId=${tenantId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          secret: totpSecret,
          code: totpCode,
        }),
      });

      if (!response.ok) {
        throw new Error('Invalid TOTP code');
      }

      setSuccess(t('security.totpEnrolled'));
      setShowTotpEnrollment(false);
      setTotpSecret('');
      setTotpQrCode('');
      setTotpCode('');
    } catch (err) {
      setError(t('security.invalidTotpCode'));
    }
  };

  const handleUpdateOrgUnitRules = async () => {
    setError('');
    setSuccess('');
    try {
      const response = await fetch(`http://localhost:7000/api/tenant/security/policy/org-unit-rules?tenantId=${tenantId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(orgUnitRules),
      });

      if (!response.ok) {
        throw new Error('Failed to update org unit rules');
      }

      setSuccess(t('security.orgUnitRulesUpdated') || 'Org unit rules updated successfully');
      setShowOrgUnitRulesModal(false);
      await fetchSecurityData();
    } catch (err) {
      setError(t('common.error'));
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-gray-600">{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">{t('security.title')}</h1>

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

      {/* Security Policy Section */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">{t('security.policySettings')}</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('security.mfaRequirement')}
            </label>
            <select
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              value={mfaRequirement}
              onChange={(e) => setMfaRequirement(Number(e.target.value))}
            >
              <option value={0}>{t('security.mfaNone')}</option>
              <option value={1}>{t('security.mfaAdminsOnly')}</option>
              <option value={2}>{t('security.mfaAllUsers')}</option>
            </select>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="allowTrustedDevices"
              checked={allowTrustedDevices}
              onChange={(e) => setAllowTrustedDevices(e.target.checked)}
              className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
            />
            <label htmlFor="allowTrustedDevices" className="ml-2 text-sm text-gray-700">
              {t('security.allowTrustedDevices')}
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('security.trustedDeviceExpireDays')}
            </label>
            <input
              type="number"
              min="1"
              max="365"
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              value={trustedDeviceExpireDays}
              onChange={(e) => setTrustedDeviceExpireDays(Number(e.target.value))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('security.sessionTimeoutMinutes')}
            </label>
            <input
              type="number"
              min="5"
              max="1440"
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              value={sessionTimeoutMinutes}
              onChange={(e) => setSessionTimeoutMinutes(Number(e.target.value))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('security.maxFailedLoginAttempts')}
            </label>
            <input
              type="number"
              min="3"
              max="10"
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              value={maxFailedLoginAttempts}
              onChange={(e) => setMaxFailedLoginAttempts(Number(e.target.value))}
            />
          </div>

          <button
            onClick={handleUpdatePolicy}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          >
            {t('security.updatePolicy')}
          </button>
        </div>
      </div>

      {/* MFA Methods Section */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">{t('security.mfaMethods')}</h2>

        {!showTotpEnrollment ? (
          <div>
            <p className="text-gray-600 mb-4">{t('security.mfaMethodsDescription')}</p>
            <button
              onClick={handleBeginTotpEnrollment}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
            >
              {t('security.enrollTotp')}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-gray-600">{t('security.scanQrCode')}</p>
            {totpQrCode && (
              <div className="flex justify-center">
                <img src={totpQrCode} alt="TOTP QR Code" className="w-48 h-48" />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('security.enterTotpCode')}
              </label>
              <input
                type="text"
                maxLength={6}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleConfirmTotpEnrollment}
                disabled={totpCode.length !== 6}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                {t('security.confirm')}
              </button>
              <button
                onClick={() => setShowTotpEnrollment(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
              >
                {t('common.cancel')}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Org Unit Rules Section */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">{t('security.orgUnitRules') || 'Org Unit Security Rules'}</h2>
          <button
            onClick={() => setShowOrgUnitRulesModal(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          >
            {t('security.manageRules') || 'Manage Rules'}
          </button>
        </div>
        {orgUnitRules.length === 0 ? (
          <p className="text-gray-600">{t('security.noOrgUnitRules') || 'No org unit-specific rules configured'}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('security.orgUnit') || 'Org Unit'}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('security.mfaRequired') || 'MFA Required'}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('security.sessionTimeout') || 'Session Timeout'}</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orgUnitRules.map((rule) => (
                  <tr key={rule.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{rule.orgUnitName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{rule.mfaRequired ? 'Yes' : 'No'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{rule.sessionTimeoutMinutes} min</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Org Unit Rules Modal */}
      {showOrgUnitRulesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">{t('security.manageOrgUnitRules') || 'Manage Org Unit Security Rules'}</h2>
            <p className="text-sm text-gray-600 mb-4">
              {t('security.orgUnitRulesDescription') || 'Configure security policies for specific organizational units'}
            </p>
            <div className="flex gap-2 mt-6">
              <button
                onClick={handleUpdateOrgUnitRules}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
              >
                {t('common.save')}
              </button>
              <button
                onClick={() => setShowOrgUnitRulesModal(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
              >
                {t('common.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
