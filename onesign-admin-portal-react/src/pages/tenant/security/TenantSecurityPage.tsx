import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocale } from '@/hooks/useLocale';
import { securityService } from '@/lib/api/services/security.service';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Lock,
  Key,
  Clock,
  AlertTriangle,
  CheckCircle2,
  X,
  Settings,
  Save,
  Building2,
  Smartphone,
  Eye,
  EyeOff,
  RefreshCw,
  Info,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';

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

interface SettingsSectionProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  delay: number;
}

const SettingsSection = ({ title, description, icon, children, delay }: SettingsSectionProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: delay * 0.1 }}
    className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300"
  >
    <div className="flex items-start gap-4 mb-6">
      <div className="p-3 bg-indigo-100 rounded-xl flex-shrink-0">
        {icon}
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-500 mt-1">{description}</p>
      </div>
    </div>
    {children}
  </motion.div>
);

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
  icon?: React.ReactNode;
}

const ToggleSwitch = ({ checked, onChange, label, description, icon }: ToggleSwitchProps) => (
  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
    <div className="flex items-center gap-3">
      {icon && (
        <div className="p-2 bg-indigo-100 rounded-lg">
          {icon}
        </div>
      )}
      <div>
        <p className="font-medium text-gray-900">{label}</p>
        {description && <p className="text-sm text-gray-500">{description}</p>}
      </div>
    </div>
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only peer"
      />
      <div className="w-14 h-7 bg-gray-200 peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-indigo-600"></div>
    </label>
  </div>
);

export default function TenantSecurityPage() {
  const { t } = useTranslation();
  const locale = useLocale();
  const [policy, setPolicy] = useState<SecurityPolicy | null>(null);
  const [orgUnitRules, setOrgUnitRules] = useState<OrgUnitRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showOrgUnitRulesModal, setShowOrgUnitRulesModal] = useState(false);
  const [activeTab, setActiveTab] = useState('password');

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

  const tabs = [
    { id: 'password', label: t('security.passwordPolicy') || 'Password Policy', icon: <Key className="w-4 h-4" /> },
    { id: 'mfa', label: t('security.mfaMethods') || 'MFA Settings', icon: <Smartphone className="w-4 h-4" /> },
    { id: 'session', label: t('security.sessionPolicy') || 'Session & Lockout', icon: <Clock className="w-4 h-4" /> },
    { id: 'orgunit', label: t('security.orgUnitRules') || 'Org Unit Rules', icon: <Building2 className="w-4 h-4" /> },
  ];

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
    setSaving(true);
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
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateOrgUnitRules = async () => {
    setError('');
    setSuccess('');
    try {
      setSuccess(t('security.orgUnitRulesUpdated') || 'Org unit rules updated successfully');
      setShowOrgUnitRulesModal(false);
    } catch (err) {
      setError(t('common.error'));
    }
  };

  const getMfaBadge = (requirement: string) => {
    const badges: Record<string, { color: string; label: string }> = {
      None: { color: 'bg-gray-100 text-gray-700', label: t('security.mfaNone') || 'None' },
      Optional: { color: 'bg-blue-100 text-blue-700', label: t('security.mfaOptional') || 'Optional' },
      Required: { color: 'bg-green-100 text-green-700', label: t('security.mfaRequired') || 'Required' },
    };
    const { color, label } = badges[requirement] || badges.None;
    return <span className={`px-3 py-1 rounded-full text-xs font-medium ${color}`}>{label}</span>;
  };

  // Calculate password strength indicator
  const getPasswordStrengthScore = () => {
    let score = 0;
    if (passwordMinLength >= 8) score += 1;
    if (passwordMinLength >= 12) score += 1;
    if (passwordRequireUppercase) score += 1;
    if (passwordRequireLowercase) score += 1;
    if (passwordRequireNumbers) score += 1;
    if (passwordRequireSpecialChars) score += 1;
    return score;
  };

  const getPasswordStrengthLabel = () => {
    const score = getPasswordStrengthScore();
    if (score >= 6) return { label: t('security.veryStrong') || 'Very Strong', color: 'text-green-600', bg: 'bg-green-500' };
    if (score >= 4) return { label: t('security.strong') || 'Strong', color: 'text-blue-600', bg: 'bg-blue-500' };
    if (score >= 2) return { label: t('security.moderate') || 'Moderate', color: 'text-amber-600', bg: 'bg-amber-500' };
    return { label: t('security.weak') || 'Weak', color: 'text-red-600', bg: 'bg-red-500' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-500 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  const strengthInfo = getPasswordStrengthLabel();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8" dir={locale === 'fa' ? 'rtl' : 'ltr'}>
      <Helmet>
        <title>{t('security.title')}</title>
      </Helmet>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8"
      >
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            {t('security.title')}
          </h1>
          <p className="text-gray-600 mt-2">{t('security.subtitle') || 'Configure authentication and security policies'}</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => fetchSecurityData()}
          className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl font-medium hover:bg-gray-50 transition-all duration-200"
        >
          <RefreshCw className="w-4 h-4" />
          {t('common.refresh') || 'Refresh'}
        </motion.button>
      </motion.div>

      {/* Alerts */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl flex items-center gap-3"
          >
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
            <button onClick={() => setError('')} className="ml-auto">
              <X className="w-5 h-5" />
            </button>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-xl flex items-center gap-3"
          >
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span>{success}</span>
            <button onClick={() => setSuccess('')} className="ml-auto">
              <X className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-2 mb-6"
      >
        <div className="flex gap-2 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium whitespace-nowrap transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Password Policy Tab */}
      {activeTab === 'password' && (
        <div className="space-y-6">
          <SettingsSection
            title={t('security.passwordPolicy') || 'Password Policy'}
            description={t('security.passwordPolicyDescription') || 'Define password requirements for all users'}
            icon={<Key className="w-6 h-6 text-indigo-600" />}
            delay={1}
          >
            <div className="space-y-6">
              {/* Password Strength Indicator */}
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-700">{t('security.passwordStrength') || 'Password Strength'}</span>
                  <span className={`text-sm font-bold ${strengthInfo.color}`}>{strengthInfo.label}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${strengthInfo.bg}`}
                    style={{ width: `${(getPasswordStrengthScore() / 6) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Minimum Length */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('security.passwordMinLength') || 'Minimum Password Length'}
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="4"
                    max="32"
                    value={passwordMinLength}
                    onChange={(e) => setPasswordMinLength(Number(e.target.value))}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <span className="w-16 px-4 py-2 bg-gray-100 rounded-xl text-center font-bold text-indigo-600">
                    {passwordMinLength}
                  </span>
                </div>
              </div>

              {/* Password Requirements */}
              <div className="space-y-3">
                <ToggleSwitch
                  checked={passwordRequireUppercase}
                  onChange={setPasswordRequireUppercase}
                  label={t('security.passwordRequireUppercase') || 'Require Uppercase Letters'}
                  description="ABC..."
                />
                <ToggleSwitch
                  checked={passwordRequireLowercase}
                  onChange={setPasswordRequireLowercase}
                  label={t('security.passwordRequireLowercase') || 'Require Lowercase Letters'}
                  description="abc..."
                />
                <ToggleSwitch
                  checked={passwordRequireNumbers}
                  onChange={setPasswordRequireNumbers}
                  label={t('security.passwordRequireNumbers') || 'Require Numbers'}
                  description="123..."
                />
                <ToggleSwitch
                  checked={passwordRequireSpecialChars}
                  onChange={setPasswordRequireSpecialChars}
                  label={t('security.passwordRequireSpecialChars') || 'Require Special Characters'}
                  description="!@#$..."
                />
              </div>

              {/* Password Expiry */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('security.passwordExpiryDays') || 'Password Expiry (Days)'}
                </label>
                <input
                  type="number"
                  min="0"
                  max="365"
                  className="w-full max-w-xs px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  value={passwordExpiryDays}
                  onChange={(e) => setPasswordExpiryDays(Number(e.target.value))}
                />
                <p className="text-sm text-gray-500 mt-2">
                  {t('security.passwordExpiryHelp') || 'Set to 0 for no expiry'}
                </p>
              </div>

              {/* Save Button */}
              <div className="flex gap-3 pt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleUpdatePolicy}
                  disabled={saving}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {saving ? t('common.loading') : t('security.updatePolicy')}
                </motion.button>
              </div>
            </div>
          </SettingsSection>
        </div>
      )}

      {/* MFA Settings Tab */}
      {activeTab === 'mfa' && (
        <div className="space-y-6">
          <SettingsSection
            title={t('security.mfaMethods') || 'Multi-Factor Authentication'}
            description={t('security.mfaMethodsDescription') || 'Configure MFA requirements for your organization'}
            icon={<Smartphone className="w-6 h-6 text-indigo-600" />}
            delay={1}
          >
            <div className="space-y-6">
              {/* MFA Requirement */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  {t('security.mfaRequirement') || 'MFA Requirement'}
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { value: 'None', label: t('security.mfaNone') || 'None', description: t('security.mfaNoneDesc') || 'MFA is disabled', color: 'gray' },
                    { value: 'Optional', label: t('security.mfaOptional') || 'Optional', description: t('security.mfaOptionalDesc') || 'Users can choose to enable MFA', color: 'blue' },
                    { value: 'Required', label: t('security.mfaRequired') || 'Required', description: t('security.mfaRequiredDesc') || 'All users must have MFA enabled', color: 'green' },
                  ].map(option => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setMfaRequirement(option.value as any)}
                      className={`p-4 rounded-xl border-2 transition-all duration-200 text-start ${
                        mfaRequirement === option.value
                          ? `border-${option.color}-500 bg-${option.color}-50`
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <p className={`font-medium ${mfaRequirement === option.value ? `text-${option.color}-700` : 'text-gray-900'}`}>
                        {option.label}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">{option.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* MFA Methods Info */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-900">{t('security.supportedMfaMethods') || 'Supported MFA Methods'}</p>
                    <ul className="text-sm text-blue-700 mt-2 space-y-1">
                      <li>• TOTP (Authenticator Apps - Google Authenticator, Microsoft Authenticator, etc.)</li>
                      <li>• SMS Verification</li>
                      <li>• Email Verification</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex gap-3 pt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleUpdatePolicy}
                  disabled={saving}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {saving ? t('common.loading') : t('security.updatePolicy')}
                </motion.button>
              </div>
            </div>
          </SettingsSection>
        </div>
      )}

      {/* Session & Lockout Tab */}
      {activeTab === 'session' && (
        <div className="space-y-6">
          <SettingsSection
            title={t('security.sessionPolicy') || 'Session & Lockout Policy'}
            description={t('security.sessionPolicyDescription') || 'Configure session timeout and account lockout settings'}
            icon={<Clock className="w-6 h-6 text-indigo-600" />}
            delay={1}
          >
            <div className="space-y-6">
              {/* Session Timeout */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('security.sessionTimeoutMinutes') || 'Session Timeout (Minutes)'}
                </label>
                <input
                  type="number"
                  min="5"
                  max="1440"
                  className="w-full max-w-xs px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  value={sessionTimeoutMinutes}
                  onChange={(e) => setSessionTimeoutMinutes(Number(e.target.value))}
                />
                <p className="text-sm text-gray-500 mt-2">
                  {t('security.sessionTimeoutHelp') || 'Users will be logged out after this period of inactivity'}
                </p>
              </div>

              {/* Lockout Settings */}
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="flex items-start gap-3 mb-4">
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-900">{t('security.lockoutSettings') || 'Account Lockout Settings'}</p>
                    <p className="text-sm text-amber-700 mt-1">
                      {t('security.lockoutSettingsHelp') || 'Protect against brute force attacks by locking accounts after failed attempts'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('security.lockoutThreshold') || 'Failed Attempts Before Lockout'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
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
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                    value={lockoutDurationMinutes}
                    onChange={(e) => setLockoutDurationMinutes(Number(e.target.value))}
                  />
                </div>
              </div>

              {/* Save Button */}
              <div className="flex gap-3 pt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleUpdatePolicy}
                  disabled={saving}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {saving ? t('common.loading') : t('security.updatePolicy')}
                </motion.button>
              </div>
            </div>
          </SettingsSection>
        </div>
      )}

      {/* Org Unit Rules Tab */}
      {activeTab === 'orgunit' && (
        <div className="space-y-6">
          <SettingsSection
            title={t('security.orgUnitRules') || 'Organizational Unit Rules'}
            description={t('security.orgUnitRulesDescription') || 'Configure security policies for specific organizational units'}
            icon={<Building2 className="w-6 h-6 text-indigo-600" />}
            delay={1}
          >
            <div className="space-y-6">
              {orgUnitRules.length === 0 ? (
                <div className="text-center py-12">
                  <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">{t('security.noOrgUnitRules') || 'No organizational unit rules configured'}</p>
                  <button
                    onClick={() => setShowOrgUnitRulesModal(true)}
                    className="mt-4 text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    {t('security.addFirstRule') || 'Add your first rule'}
                  </button>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                        <tr>
                          <th className="px-6 py-4 text-start text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            {t('security.orgUnit') || 'Organizational Unit'}
                          </th>
                          <th className="px-6 py-4 text-start text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            {t('security.mfaRequired') || 'MFA Requirement'}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-100">
                        {orgUnitRules.map((rule, index) => (
                          <motion.tr
                            key={rule.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="hover:bg-gray-50/80 transition-colors"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-gray-100">
                                  <Building2 className="w-4 h-4 text-gray-600" />
                                </div>
                                <span className="font-medium text-gray-900">{rule.orgUnitName}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {getMfaBadge(rule.mfaRequirement)}
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowOrgUnitRulesModal(true)}
                      className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <Settings className="w-4 h-4" />
                      {t('security.manageRules') || 'Manage Rules'}
                    </motion.button>
                  </div>
                </>
              )}
            </div>
          </SettingsSection>
        </div>
      )}

      {/* Org Unit Rules Modal */}
      <AnimatePresence>
        {showOrgUnitRulesModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowOrgUnitRulesModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-8 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-indigo-100 rounded-xl">
                  <Building2 className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{t('security.manageOrgUnitRules') || 'Manage Org Unit Security Rules'}</h2>
                  <p className="text-gray-500">{t('security.orgUnitRulesModalDescription') || 'Configure security policies for specific organizational units'}</p>
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl mb-6">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-700">
                    {t('security.orgUnitRulesHelp') || 'Org unit rules override the default tenant security policy for users in specific organizational units.'}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleUpdateOrgUnitRules}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Save className="w-4 h-4" />
                  {t('common.save')}
                </motion.button>
                <button
                  onClick={() => setShowOrgUnitRulesModal(false)}
                  className="px-6 py-3 border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-all duration-200"
                >
                  {t('common.cancel')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
