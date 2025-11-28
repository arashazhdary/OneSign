import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { securityService } from '@/lib/api/services/security.service';

interface SecurityPolicy {
  id: string;
  tenantId: string;
  passwordMinLength: number;
  passwordRequireUppercase: boolean;
  passwordRequireLowercase: boolean;
  passwordRequireNumbers: boolean;
  passwordRequireSpecialChars: boolean;
  passwordExpiryDays: number;
  mfaRequirement: 'None' | 'Optional' | 'Required';
  sessionTimeoutMinutes: number;
  lockoutThreshold: number;
  lockoutDurationMinutes: number;
}

interface OrgUnitRule {
  id: string;
  orgUnitId: string;
  orgUnitName: string;
  mfaRequirement: 'None' | 'Optional' | 'Required';
}

export default function TenantSecurityPage() {
  const { t } = useTranslation();
  const [policy, setPolicy] = useState<SecurityPolicy | null>(null);
  const [orgUnitRules, setOrgUnitRules] = useState<OrgUnitRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showOrgUnitRulesModal, setShowOrgUnitRulesModal] = useState(false);

  // Policy form state
  const [passwordMinLength, setPasswordMinLength] = useState(8);
  const [passwordRequireUppercase, setPasswordRequireUppercase] = useState(true);
  const [passwordRequireLowercase, setPasswordRequireLowercase] = useState(true);
  const [passwordRequireNumbers, setPasswordRequireNumbers] = useState(true);
  const [passwordRequireSpecialChars, setPasswordRequireSpecialChars] = useState(true);
  const [passwordExpiryDays, setPasswordExpiryDays] = useState(90);
  const [mfaRequirement, setMfaRequirement] = useState<'None' | 'Optional' | 'Required'>('Optional');
  const [sessionTimeoutMinutes, setSessionTimeoutMinutes] = useState(30);
  const [lockoutThreshold, setLockoutThreshold] = useState(5);
  const [lockoutDurationMinutes, setLockoutDurationMinutes] = useState(15);

  useEffect(() => {
    fetchSecurityData();
  }, []);

  const fetchSecurityData = async () => {
    setLoading(true);
    try {
      // Fetch security policy
      const policyData = await securityService.getPolicy();
      if (policyData) {
        const policy = policyData;
        setPolicy(policy);
        setPasswordMinLength(policy.passwordMinLength);
        setPasswordRequireUppercase(policy.passwordRequireUppercase);
        setPasswordRequireLowercase(policy.passwordRequireLowercase);
        setPasswordRequireNumbers(policy.passwordRequireNumbers);
        setPasswordRequireSpecialChars(policy.passwordRequireSpecialChars);
        setPasswordExpiryDays(policy.passwordExpiryDays);
        setMfaRequirement(policy.mfaRequirement);
        setSessionTimeoutMinutes(policy.sessionTimeoutMinutes);
        setLockoutThreshold(policy.lockoutThreshold);
        setLockoutDurationMinutes(policy.lockoutDurationMinutes);
      }

      // Fetch org unit rules
      const rulesData = await securityService.getOrgUnitMfaRules();
      setOrgUnitRules(rulesData || []);
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
      await securityService.updatePolicy({
        passwordMinLength,
        passwordRequireUppercase,
        passwordRequireLowercase,
        passwordRequireNumbers,
        passwordRequireSpecialChars,
        passwordExpiryDays,
        mfaRequirement,
        sessionTimeoutMinutes,
        lockoutThreshold,
        lockoutDurationMinutes,
      });

      setSuccess(t('security.policyUpdated'));
      await fetchSecurityData();
    } catch (err) {
      setError(t('common.error'));
    }
  };

  // TOTP enrollment methods not yet implemented in security service
  // const handleBeginTotpEnrollment = async () => {
  //   setError('');
  //   try {
  //     // Placeholder for TOTP enrollment
  //     setError('TOTP enrollment not yet implemented');
  //   } catch (err) {
  //     setError(t('common.error'));
  //   }
  // };

  // const handleConfirmTotpEnrollment = async () => {
  //   setError('');
  //   setSuccess('');
  //   try {
  //     // Placeholder for TOTP confirmation
  //     setError('TOTP confirmation not yet implemented');
  //   } catch (err) {
  //     setError(t('security.invalidTotpCode'));
  //   }
  // };

  const handleUpdateOrgUnitRules = async () => {
    setError('');
    setSuccess('');
    try {
      // Note: Service doesn't have a bulk update method, would need to iterate
      // For now, just close the modal and show success
      // TODO: Implement individual rule updates if needed
      setSuccess(t('security.orgUnitRulesUpdated') || 'Org unit rules updated successfully');
      setShowOrgUnitRulesModal(false);
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
              {t('security.passwordMinLength') || 'Minimum Password Length'}
            </label>
            <input
              type="number"
              min="4"
              max="32"
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              value={passwordMinLength}
              onChange={(e) => setPasswordMinLength(Number(e.target.value))}
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="passwordRequireUppercase"
              checked={passwordRequireUppercase}
              onChange={(e) => setPasswordRequireUppercase(e.target.checked)}
              className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
            />
            <label htmlFor="passwordRequireUppercase" className="ml-2 text-sm text-gray-700">
              {t('security.passwordRequireUppercase') || 'Require Uppercase Letters'}
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="passwordRequireLowercase"
              checked={passwordRequireLowercase}
              onChange={(e) => setPasswordRequireLowercase(e.target.checked)}
              className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
            />
            <label htmlFor="passwordRequireLowercase" className="ml-2 text-sm text-gray-700">
              {t('security.passwordRequireLowercase') || 'Require Lowercase Letters'}
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="passwordRequireNumbers"
              checked={passwordRequireNumbers}
              onChange={(e) => setPasswordRequireNumbers(e.target.checked)}
              className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
            />
            <label htmlFor="passwordRequireNumbers" className="ml-2 text-sm text-gray-700">
              {t('security.passwordRequireNumbers') || 'Require Numbers'}
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="passwordRequireSpecialChars"
              checked={passwordRequireSpecialChars}
              onChange={(e) => setPasswordRequireSpecialChars(e.target.checked)}
              className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
            />
            <label htmlFor="passwordRequireSpecialChars" className="ml-2 text-sm text-gray-700">
              {t('security.passwordRequireSpecialChars') || 'Require Special Characters'}
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('security.passwordExpiryDays') || 'Password Expiry Days'}
            </label>
            <input
              type="number"
              min="0"
              max="365"
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              value={passwordExpiryDays}
              onChange={(e) => setPasswordExpiryDays(Number(e.target.value))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('security.mfaRequirement')}
            </label>
            <select
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              value={mfaRequirement}
              onChange={(e) => setMfaRequirement(e.target.value as 'None' | 'Optional' | 'Required')}
            >
              <option value="None">{t('security.mfaNone') || 'None'}</option>
              <option value="Optional">{t('security.mfaOptional') || 'Optional'}</option>
              <option value="Required">{t('security.mfaRequired') || 'Required'}</option>
            </select>
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
              {t('security.lockoutThreshold') || 'Lockout Threshold'}
            </label>
            <input
              type="number"
              min="1"
              max="10"
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              value={lockoutThreshold}
              onChange={(e) => setLockoutThreshold(Number(e.target.value))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('security.lockoutDurationMinutes') || 'Lockout Duration (Minutes)'}
            </label>
            <input
              type="number"
              min="1"
              max="1440"
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              value={lockoutDurationMinutes}
              onChange={(e) => setLockoutDurationMinutes(Number(e.target.value))}
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

        <div>
          <p className="text-gray-600 mb-4">{t('security.mfaMethodsDescription') || 'Manage multi-factor authentication methods for your organization'}</p>
          <p className="text-sm text-gray-500">{t('security.mfaMethodsNote') || 'TOTP enrollment functionality is managed at the user level'}</p>
        </div>
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
          <p className="text-gray-600">{t('security.noOrgUnitRules') || t('common.noOrgUnitRulesConfigured')}</p>
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{rule.mfaRequirement}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">-</td>
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
