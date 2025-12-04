import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { adminService } from '@/lib/api/services/admin.service';
import { Helmet } from 'react-helmet-async';

type TabType = 'platform' | 'email' | 'sms' | 'oauth' | 'maintenance' | 'license';

interface PlatformSettings {
  platformName: string;
  platformUrl: string;
  supportEmail: string;
  maxTenantsPerRegion: number;
  defaultSessionTimeout: number;
  enableRegistration: boolean;
  enableTenantCreation: boolean;
}

interface EmailSettings {
  provider: 'SMTP' | 'SendGrid' | 'AWS-SES';
  smtpHost: string;
  smtpPort: number;
  smtpUsername: string;
  smtpPassword: string;
  fromEmail: string;
  fromName: string;
  useTLS: boolean;
}

interface SMSSettings {
  provider: 'Twilio' | 'AWS-SNS' | 'Vonage';
  accountSid: string;
  authToken: string;
  fromNumber: string;
  enabled: boolean;
}

interface OAuthProvider {
  id: string;
  name: string;
  provider: 'Google' | 'Microsoft' | 'GitHub' | 'Custom';
  clientId: string;
  clientSecret: string;
  enabled: boolean;
}

interface MaintenanceSettings {
  maintenanceMode: boolean;
  maintenanceMessage: string;
  allowedIPs: string[];
  scheduledMaintenanceStart?: string;
  scheduledMaintenanceEnd?: string;
}

interface LicenseInfo {
  licenseKey: string;
  licensedTo: string;
  expiresAt: string;
  maxTenants: number;
  maxUsers: number;
  features: string[];
  status: 'Active' | 'Expired' | 'Invalid';
}

export default function AdminSettingsPage() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('platform');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Platform Settings
  const [platformSettings, setPlatformSettings] = useState<PlatformSettings>({
    platformName: 'OneSign Identity Platform',
    platformUrl: 'https://platform.onesign.com',
    supportEmail: 'support@onesign.com',
    maxTenantsPerRegion: 100,
    defaultSessionTimeout: 30,
    enableRegistration: true,
    enableTenantCreation: true,
  });

  // Email Settings
  const [emailSettings, setEmailSettings] = useState<EmailSettings>({
    provider: 'SMTP',
    smtpHost: 'smtp.example.com',
    smtpPort: 587,
    smtpUsername: '',
    smtpPassword: '',
    fromEmail: 'noreply@onesign.com',
    fromName: 'OneSign Platform',
    useTLS: true,
  });

  // SMS Settings
  const [smsSettings, setSmsSettings] = useState<SMSSettings>({
    provider: 'Twilio',
    accountSid: '',
    authToken: '',
    fromNumber: '',
    enabled: false,
  });

  // OAuth Providers
  const [oauthProviders, setOauthProviders] = useState<OAuthProvider[]>([
    {
      id: '1',
      name: 'Google OAuth',
      provider: 'Google',
      clientId: '',
      clientSecret: '',
      enabled: false,
    },
    {
      id: '2',
      name: 'Microsoft OAuth',
      provider: 'Microsoft',
      clientId: '',
      clientSecret: '',
      enabled: false,
    },
  ]);

  // Maintenance Settings
  const [maintenanceSettings, setMaintenanceSettings] = useState<MaintenanceSettings>({
    maintenanceMode: false,
    maintenanceMessage: 'The platform is currently undergoing maintenance. Please check back later.',
    allowedIPs: [],
    scheduledMaintenanceStart: undefined,
    scheduledMaintenanceEnd: undefined,
  });

  // License Info
  const [licenseInfo, setLicenseInfo] = useState<LicenseInfo>({
    licenseKey: 'XXXX-XXXX-XXXX-XXXX',
    licensedTo: 'OneSign Corporation',
    expiresAt: new Date(Date.now() + 86400000 * 365).toISOString(),
    maxTenants: 1000,
    maxUsers: 100000,
    features: ['Multi-tenancy', 'SSO', 'Advanced Security', 'API Access', 'Custom Branding'],
    status: 'Active',
  });

  const [newAllowedIP, setNewAllowedIP] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API calls
      // const settings = await adminService.getGlobalSettings('all');
      // setPlatformSettings(settings.platform);
      // setEmailSettings(settings.email);
      // etc.
    } catch (err) {
      console.error('Error fetching settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePlatformSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await adminService.updateGlobalSettings('platform', platformSettings);
      setSuccess(t('admin.settings.messages.platformSettingsSaved'));
    } catch (err: any) {
      setError(err.message || t('common.failedToSavePlatformSettings'));
    }
  };

  const handleSaveEmailSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await adminService.updateGlobalSettings('email', emailSettings);
      setSuccess(t('admin.settings.messages.emailSettingsSaved'));
    } catch (err: any) {
      setError(err.message || t('common.failedToSaveEmailSettings'));
    }
  };

  const handleTestEmailConfig = async () => {
    setError('');
    setSuccess('');

    try {
      await adminService.testEmailConfiguration(emailSettings);
      setSuccess(t('admin.settings.messages.testEmailSent'));
    } catch (err: any) {
      setError(err.message || t('common.failedToSendTestEmail'));
    }
  };

  const handleSaveSMSSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await adminService.updateGlobalSettings('sms', smsSettings);
      setSuccess(t('admin.settings.messages.smsSettingsSaved'));
    } catch (err: any) {
      setError(err.message || t('common.failedToSaveSMSSettings'));
    }
  };

  const handleTestSMSConfig = async () => {
    setError('');
    setSuccess('');

    try {
      await adminService.testSMSConfiguration(smsSettings);
      setSuccess(t('admin.settings.messages.testSmsSent'));
    } catch (err: any) {
      setError(err.message || t('common.failedToSendTestSMS'));
    }
  };

  const handleToggleOAuthProvider = async (providerId: string) => {
    setOauthProviders(providers =>
      providers.map(p =>
        p.id === providerId ? { ...p, enabled: !p.enabled } : p
      )
    );
  };

  const handleSaveMaintenanceSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await adminService.updateGlobalSettings('maintenance', maintenanceSettings);
      setSuccess(t('admin.settings.messages.maintenanceSettingsSaved'));
    } catch (err: any) {
      setError(err.message || t('common.failedToSaveMaintenanceSettings'));
    }
  };

  const handleAddAllowedIP = () => {
    if (newAllowedIP && !maintenanceSettings.allowedIPs.includes(newAllowedIP)) {
      setMaintenanceSettings({
        ...maintenanceSettings,
        allowedIPs: [...maintenanceSettings.allowedIPs, newAllowedIP],
      });
      setNewAllowedIP('');
    }
  };

  const handleRemoveAllowedIP = (ip: string) => {
    setMaintenanceSettings({
      ...maintenanceSettings,
      allowedIPs: maintenanceSettings.allowedIPs.filter(i => i !== ip),
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-gray-600">{t('admin.settings.messages.loading')}</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">{t('admin.settings.title')}</h1>
        <p className="mt-2 text-gray-600">{t('admin.settings.description')}</p>
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

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('platform')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'platform'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {t('admin.settings.tabs.platform')}
          </button>
          <button
            onClick={() => setActiveTab('email')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'email'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {t('admin.settings.tabs.email')}
          </button>
          <button
            onClick={() => setActiveTab('sms')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'sms'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {t('admin.settings.tabs.sms')}
          </button>
          <button
            onClick={() => setActiveTab('oauth')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'oauth'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {t('admin.settings.tabs.oauth')}
          </button>
          <button
            onClick={() => setActiveTab('maintenance')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'maintenance'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {t('admin.settings.tabs.maintenance')}
          </button>
          <button
            onClick={() => setActiveTab('license')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'license'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {t('admin.settings.tabs.license')}
          </button>
        </nav>
      </div>

      {/* Platform Settings Tab */}
      {activeTab === 'platform' && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">{t('admin.settings.platform.title')}</h2>
          </div>
          <form onSubmit={handleSavePlatformSettings} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('admin.settings.platform.platformName')}</label>
              <input
                type="text"
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                value={platformSettings.platformName}
                onChange={(e) => setPlatformSettings({ ...platformSettings, platformName: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('admin.settings.platform.platformUrl')}</label>
              <input
                type="url"
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                value={platformSettings.platformUrl}
                onChange={(e) => setPlatformSettings({ ...platformSettings, platformUrl: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('admin.settings.platform.supportEmail')}</label>
              <input
                type="email"
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                value={platformSettings.supportEmail}
                onChange={(e) => setPlatformSettings({ ...platformSettings, supportEmail: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('admin.settings.platform.maxTenantsPerRegion')}</label>
                <input
                  type="number"
                  required
                  min="1"
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  value={platformSettings.maxTenantsPerRegion}
                  onChange={(e) => setPlatformSettings({ ...platformSettings, maxTenantsPerRegion: parseInt(e.target.value) })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('admin.settings.platform.defaultSessionTimeout')}</label>
                <input
                  type="number"
                  required
                  min="5"
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  value={platformSettings.defaultSessionTimeout}
                  onChange={(e) => setPlatformSettings({ ...platformSettings, defaultSessionTimeout: parseInt(e.target.value) })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={platformSettings.enableRegistration}
                  onChange={(e) => setPlatformSettings({ ...platformSettings, enableRegistration: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm text-gray-700">{t('admin.settings.platform.enableRegistration')}</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={platformSettings.enableTenantCreation}
                  onChange={(e) => setPlatformSettings({ ...platformSettings, enableTenantCreation: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm text-gray-700">{t('admin.settings.platform.enableTenantCreation')}</span>
              </label>
            </div>
            <button
              type="submit"
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
            >
              {t('admin.settings.platform.saveButton')}
            </button>
          </form>
        </div>
      )}

      {/* Email Settings Tab */}
      {activeTab === 'email' && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">{t('admin.settings.email.title')}</h2>
          </div>
          <form onSubmit={handleSaveEmailSettings} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('admin.settings.email.provider')}</label>
              <select
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                value={emailSettings.provider}
                onChange={(e) => setEmailSettings({ ...emailSettings, provider: e.target.value as EmailSettings['provider'] })}
              >
                <option value="SMTP">SMTP</option>
                <option value="SendGrid">SendGrid</option>
                <option value="AWS-SES">AWS SES</option>
              </select>
            </div>
            {emailSettings.provider === 'SMTP' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('admin.settings.email.smtpHost')}</label>
                    <input
                      type="text"
                      required
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      value={emailSettings.smtpHost}
                      onChange={(e) => setEmailSettings({ ...emailSettings, smtpHost: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('admin.settings.email.smtpPort')}</label>
                    <input
                      type="number"
                      required
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      value={emailSettings.smtpPort}
                      onChange={(e) => setEmailSettings({ ...emailSettings, smtpPort: parseInt(e.target.value) })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('admin.settings.email.smtpUsername')}</label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      value={emailSettings.smtpUsername}
                      onChange={(e) => setEmailSettings({ ...emailSettings, smtpUsername: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('admin.settings.email.smtpPassword')}</label>
                    <input
                      type="password"
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      value={emailSettings.smtpPassword}
                      onChange={(e) => setEmailSettings({ ...emailSettings, smtpPassword: e.target.value })}
                    />
                  </div>
                </div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={emailSettings.useTLS}
                    onChange={(e) => setEmailSettings({ ...emailSettings, useTLS: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700">{t('admin.settings.email.useTls')}</span>
                </label>
              </>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('admin.settings.email.fromEmail')}</label>
                <input
                  type="email"
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  value={emailSettings.fromEmail}
                  onChange={(e) => setEmailSettings({ ...emailSettings, fromEmail: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('admin.settings.email.fromName')}</label>
                <input
                  type="text"
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  value={emailSettings.fromName}
                  onChange={(e) => setEmailSettings({ ...emailSettings, fromName: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
              >
                {t('admin.settings.email.saveButton')}
              </button>
              <button
                type="button"
                onClick={handleTestEmailConfig}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
              >
                {t('admin.settings.email.testButton')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SMS Settings Tab */}
      {activeTab === 'sms' && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">{t('admin.settings.sms.title')}</h2>
          </div>
          <form onSubmit={handleSaveSMSSettings} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('admin.settings.sms.provider')}</label>
              <select
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                value={smsSettings.provider}
                onChange={(e) => setSmsSettings({ ...smsSettings, provider: e.target.value as SMSSettings['provider'] })}
              >
                <option value="Twilio">Twilio</option>
                <option value="AWS-SNS">AWS SNS</option>
                <option value="Vonage">Vonage</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('admin.settings.sms.accountSid')}</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                value={smsSettings.accountSid}
                onChange={(e) => setSmsSettings({ ...smsSettings, accountSid: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('admin.settings.sms.authToken')}</label>
              <input
                type="password"
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                value={smsSettings.authToken}
                onChange={(e) => setSmsSettings({ ...smsSettings, authToken: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('admin.settings.sms.fromNumber')}</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="+1234567890"
                value={smsSettings.fromNumber}
                onChange={(e) => setSmsSettings({ ...smsSettings, fromNumber: e.target.value })}
              />
            </div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={smsSettings.enabled}
                onChange={(e) => setSmsSettings({ ...smsSettings, enabled: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm text-gray-700">{t('admin.settings.sms.enableSmsNotifications')}</span>
            </label>
            <div className="flex gap-3">
              <button
                type="submit"
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
              >
                {t('admin.settings.sms.saveButton')}
              </button>
              <button
                type="button"
                onClick={handleTestSMSConfig}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
              >
                {t('admin.settings.sms.testButton')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* OAuth Providers Tab */}
      {activeTab === 'oauth' && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">{t('admin.settings.oauth.title')}</h2>
          </div>
          <div className="p-6 space-y-4">
            {oauthProviders.map((provider) => (
              <div key={provider.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-medium text-gray-900">{provider.name}</h3>
                    <span className={`px-2 py-1 text-xs rounded ${provider.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {provider.enabled ? t('admin.settings.oauth.enabled') : t('admin.settings.oauth.disabled')}
                    </span>
                  </div>
                  <button
                    onClick={() => handleToggleOAuthProvider(provider.id)}
                    className={`px-4 py-2 rounded-md ${provider.enabled ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' : 'bg-green-600 text-white hover:bg-green-700'}`}
                  >
                    {provider.enabled ? t('admin.settings.oauth.disableButton') : t('admin.settings.oauth.enableButton')}
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('admin.settings.oauth.clientId')}</label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      value={provider.clientId}
                      onChange={(e) => {
                        setOauthProviders(providers =>
                          providers.map(p =>
                            p.id === provider.id ? { ...p, clientId: e.target.value } : p
                          )
                        );
                      }}
                      placeholder={t('admin.settings.oauth.clientIdPlaceholder')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('admin.settings.oauth.clientSecret')}</label>
                    <input
                      type="password"
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      value={provider.clientSecret}
                      onChange={(e) => {
                        setOauthProviders(providers =>
                          providers.map(p =>
                            p.id === provider.id ? { ...p, clientSecret: e.target.value } : p
                          )
                        );
                      }}
                      placeholder={t('admin.settings.oauth.clientSecretPlaceholder')}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Maintenance Tab */}
      {activeTab === 'maintenance' && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">{t('admin.settings.maintenance.title')}</h2>
          </div>
          <form onSubmit={handleSaveMaintenanceSettings} className="p-6 space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={maintenanceSettings.maintenanceMode}
                  onChange={(e) => setMaintenanceSettings({ ...maintenanceSettings, maintenanceMode: e.target.checked })}
                  className="rounded"
                />
                <div>
                  <span className="text-sm font-medium text-gray-900">{t('admin.settings.maintenance.enableMaintenanceMode')}</span>
                  <p className="text-xs text-gray-600">{t('admin.settings.maintenance.maintenanceModeDescription')}</p>
                </div>
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('admin.settings.maintenance.maintenanceMessage')}</label>
              <textarea
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                rows={3}
                value={maintenanceSettings.maintenanceMessage}
                onChange={(e) => setMaintenanceSettings({ ...maintenanceSettings, maintenanceMessage: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('admin.settings.maintenance.allowedIps')}</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  className="flex-1 border border-gray-300 rounded-md px-3 py-2"
                  placeholder="192.168.1.1"
                  value={newAllowedIP}
                  onChange={(e) => setNewAllowedIP(e.target.value)}
                />
                <button
                  type="button"
                  onClick={handleAddAllowedIP}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                >
                  {t('admin.settings.maintenance.addButton')}
                </button>
              </div>
              <div className="space-y-2">
                {maintenanceSettings.allowedIPs.map((ip) => (
                  <div key={ip} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                    <span className="text-sm text-gray-700">{ip}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveAllowedIP(ip)}
                      className="text-red-600 hover:text-red-900 text-sm"
                    >
                      {t('admin.settings.maintenance.removeButton')}
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <button
              type="submit"
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
            >
              {t('admin.settings.maintenance.saveButton')}
            </button>
          </form>
        </div>
      )}

      {/* License Tab */}
      {activeTab === 'license' && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">{t('admin.settings.license.title')}</h2>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-500">{t('admin.settings.license.licenseKey')}</label>
                <div className="mt-1 text-gray-900 font-mono">{licenseInfo.licenseKey}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">{t('admin.settings.license.licensedTo')}</label>
                <div className="mt-1 text-gray-900">{licenseInfo.licensedTo}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">{t('admin.settings.license.status')}</label>
                <div className="mt-1">
                  <span className={`px-2 py-1 text-xs rounded ${
                    licenseInfo.status === 'Active' ? 'bg-green-100 text-green-800' :
                    licenseInfo.status === 'Expired' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {licenseInfo.status}
                  </span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">{t('admin.settings.license.expiresAt')}</label>
                <div className="mt-1 text-gray-900">{formatDate(licenseInfo.expiresAt)}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">{t('admin.settings.license.maxTenants')}</label>
                <div className="mt-1 text-gray-900">{licenseInfo.maxTenants.toLocaleString()}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">{t('admin.settings.license.maxUsers')}</label>
                <div className="mt-1 text-gray-900">{licenseInfo.maxUsers.toLocaleString()}</div>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">{t('admin.settings.license.licensedFeatures')}</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {licenseInfo.features.map((feature) => (
                  <span key={feature} className="px-3 py-1 bg-indigo-100 text-indigo-800 text-sm rounded-full">
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
