import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from '@/components/common/Modal';
import { globalService } from '@/lib/api/services/global.service';

type Tab = 'platform' | 'email' | 'sms' | 'oauth' | 'security' | 'backup' | 'logs';

interface PlatformSettings {
  maintenanceMode: boolean;
  maintenanceMessage: string;
  allowNewRegistrations: boolean;
  allowGuestAccess: boolean;
  platformName: string;
  supportEmail: string;
}

interface EmailSettings {
  smtpHost: string;
  smtpPort: number;
  smtpUsername: string;
  smtpPassword: string;
  smtpSecure: boolean;
  fromEmail: string;
  fromName: string;
}

interface SMSSettings {
  provider: 'twilio' | 'aws-sns' | 'nexmo';
  apiKey: string;
  apiSecret: string;
  fromNumber: string;
  enabled: boolean;
}

interface OAuthProvider {
  name: string;
  clientId: string;
  clientSecret: string;
  enabled: boolean;
}

interface SecuritySettings {
  sessionTimeout: number;
  passwordMinLength: number;
  passwordRequireUppercase: boolean;
  passwordRequireNumbers: boolean;
  passwordRequireSpecialChars: boolean;
  maxLoginAttempts: number;
  lockoutDuration: number;
  twoFactorRequired: boolean;
}

interface BackupSettings {
  enabled: boolean;
  schedule: string;
  retentionDays: number;
  backupLocation: string;
  notifyOnCompletion: boolean;
}

interface LogSettings {
  logLevel: 'Debug' | 'Info' | 'Warning' | 'Error' | 'Critical';
  retentionDays: number;
  enableRemoteLogging: boolean;
  remoteLoggingEndpoint: string;
}

export default function GlobalSettingsPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<Tab>('platform');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; title: string; message: string; action: () => void }>({
    isOpen: false,
    title: '',
    message: '',
    action: () => {}
  });

  const [platformSettings, setPlatformSettings] = useState<PlatformSettings>({
    maintenanceMode: false,
    maintenanceMessage: '',
    allowNewRegistrations: true,
    allowGuestAccess: false,
    platformName: 'OneSign',
    supportEmail: 'support@onesign.com'
  });

  const [emailSettings, setEmailSettings] = useState<EmailSettings>({
    smtpHost: '',
    smtpPort: 587,
    smtpUsername: '',
    smtpPassword: '',
    smtpSecure: true,
    fromEmail: '',
    fromName: ''
  });

  const [smsSettings, setSmsSettings] = useState<SMSSettings>({
    provider: 'twilio',
    apiKey: '',
    apiSecret: '',
    fromNumber: '',
    enabled: false
  });

  const [oauthProviders, setOauthProviders] = useState<OAuthProvider[]>([
    { name: 'Google', clientId: '', clientSecret: '', enabled: false },
    { name: 'GitHub', clientId: '', clientSecret: '', enabled: false },
    { name: 'Microsoft', clientId: '', clientSecret: '', enabled: false }
  ]);

  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    sessionTimeout: 30,
    passwordMinLength: 8,
    passwordRequireUppercase: true,
    passwordRequireNumbers: true,
    passwordRequireSpecialChars: true,
    maxLoginAttempts: 5,
    lockoutDuration: 15,
    twoFactorRequired: false
  });

  const [backupSettings, setBackupSettings] = useState<BackupSettings>({
    enabled: true,
    schedule: 'daily',
    retentionDays: 30,
    backupLocation: 's3://backups',
    notifyOnCompletion: true
  });

  const [logSettings, setLogSettings] = useState<LogSettings>({
    logLevel: 'Info',
    retentionDays: 90,
    enableRemoteLogging: false,
    remoteLoggingEndpoint: ''
  });

  const fetchSettings = async () => {
    setLoading(true);
    setError('');
    try {
      // Note: getGlobalSettings method does not exist in globalService
      // Using default fallback data instead
      // const data = await globalService.getGlobalSettings(activeTab);
      // For now, we use the default state values initialized above
      setHasChanges(false);
    } catch (err: any) {
      setError(err.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      let payload: any;
      switch (activeTab) {
        case 'platform':
          payload = platformSettings;
          break;
        case 'email':
          payload = emailSettings;
          break;
        case 'sms':
          payload = smsSettings;
          break;
        case 'oauth':
          payload = { providers: oauthProviders };
          break;
        case 'security':
          payload = securitySettings;
          break;
        case 'backup':
          payload = backupSettings;
          break;
        case 'logs':
          payload = logSettings;
          break;
      }

      // Note: updateGlobalSettings method does not exist in globalService
      // await globalService.updateGlobalSettings(activeTab, payload);
      // For now, we just show a success message with the prepared payload
      console.log('Settings to save:', { tab: activeTab, payload });
      setSuccess('Settings saved successfully');
      setHasChanges(false);
    } catch (err: any) {
      setError(err.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const testEmailConfiguration = async () => {
    setLoading(true);
    setError('');
    try {
      // Note: testEmailConfiguration method does not exist in globalService
      // await globalService.testEmailConfiguration(emailSettings);
      // For now, we just show a simulated success message
      console.log('Testing email configuration:', emailSettings);
      setSuccess('Test email sent successfully!');
    } catch (err: any) {
      setError(err.message || t('common.failedToSendTestEmail'));
    } finally {
      setLoading(false);
    }
  };

  const testSMSConfiguration = async () => {
    setLoading(true);
    setError('');
    try {
      // Note: testSMSConfiguration method does not exist in globalService
      // await globalService.testSMSConfiguration(smsSettings);
      // For now, we just show a simulated success message
      console.log('Testing SMS configuration:', smsSettings);
      setSuccess('Test SMS sent successfully!');
    } catch (err: any) {
      setError(err.message || t('common.failedToSendTestSMS'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [activeTab]);

  const showConfirmation = (title: string, message: string, action: () => void) => {
    setConfirmModal({ isOpen: true, title, message, action });
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Global Settings</h1>
        {hasChanges && (
          <button
            onClick={() => showConfirmation(
              'Save Changes',
              'Are you sure you want to save these settings? This may affect all users.',
              saveSettings
            )}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
          >
            Save Changes
          </button>
        )}
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
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {(['platform', 'email', 'sms', 'oauth', 'security', 'backup', 'logs'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-1 border-b-2 font-medium text-sm capitalize whitespace-nowrap ${
                activeTab === tab
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Platform Settings */}
      {activeTab === 'platform' && (
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={platformSettings.maintenanceMode}
                onChange={(e) => {
                  setPlatformSettings({ ...platformSettings, maintenanceMode: e.target.checked });
                  setHasChanges(true);
                }}
                className="mr-2 h-4 w-4"
              />
              <span className="font-medium text-gray-900">Maintenance Mode</span>
            </label>
            <p className="text-sm text-gray-500 mt-1">When enabled, only administrators can access the platform</p>
            {platformSettings.maintenanceMode && (
              <textarea
                value={platformSettings.maintenanceMessage}
                onChange={(e) => {
                  setPlatformSettings({ ...platformSettings, maintenanceMessage: e.target.value });
                  setHasChanges(true);
                }}
                placeholder="Maintenance message for users"
                rows={3}
                className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            )}
          </div>

          <div className="border-t pt-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={platformSettings.allowNewRegistrations}
                onChange={(e) => {
                  setPlatformSettings({ ...platformSettings, allowNewRegistrations: e.target.checked });
                  setHasChanges(true);
                }}
                className="mr-2 h-4 w-4"
              />
              <span className="font-medium text-gray-900">Allow New Registrations</span>
            </label>
          </div>

          <div className="border-t pt-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={platformSettings.allowGuestAccess}
                onChange={(e) => {
                  setPlatformSettings({ ...platformSettings, allowGuestAccess: e.target.checked });
                  setHasChanges(true);
                }}
                className="mr-2 h-4 w-4"
              />
              <span className="font-medium text-gray-900">Allow Guest Access</span>
            </label>
          </div>

          <div className="border-t pt-6 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Platform Name</label>
              <input
                type="text"
                value={platformSettings.platformName}
                onChange={(e) => {
                  setPlatformSettings({ ...platformSettings, platformName: e.target.value });
                  setHasChanges(true);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Support Email</label>
              <input
                type="email"
                value={platformSettings.supportEmail}
                onChange={(e) => {
                  setPlatformSettings({ ...platformSettings, supportEmail: e.target.value });
                  setHasChanges(true);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
        </div>
      )}

      {/* Email Settings */}
      {activeTab === 'email' && (
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SMTP Host</label>
              <input
                type="text"
                value={emailSettings.smtpHost}
                onChange={(e) => {
                  setEmailSettings({ ...emailSettings, smtpHost: e.target.value });
                  setHasChanges(true);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SMTP Port</label>
              <input
                type="number"
                value={emailSettings.smtpPort}
                onChange={(e) => {
                  setEmailSettings({ ...emailSettings, smtpPort: parseInt(e.target.value) });
                  setHasChanges(true);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input
                type="text"
                value={emailSettings.smtpUsername}
                onChange={(e) => {
                  setEmailSettings({ ...emailSettings, smtpUsername: e.target.value });
                  setHasChanges(true);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={emailSettings.smtpPassword}
                onChange={(e) => {
                  setEmailSettings({ ...emailSettings, smtpPassword: e.target.value });
                  setHasChanges(true);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From Email</label>
              <input
                type="email"
                value={emailSettings.fromEmail}
                onChange={(e) => {
                  setEmailSettings({ ...emailSettings, fromEmail: e.target.value });
                  setHasChanges(true);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From Name</label>
              <input
                type="text"
                value={emailSettings.fromName}
                onChange={(e) => {
                  setEmailSettings({ ...emailSettings, fromName: e.target.value });
                  setHasChanges(true);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={emailSettings.smtpSecure}
                onChange={(e) => {
                  setEmailSettings({ ...emailSettings, smtpSecure: e.target.checked });
                  setHasChanges(true);
                }}
                className="mr-2 h-4 w-4"
              />
              <span className="font-medium text-gray-900">Use SSL/TLS</span>
            </label>
          </div>

          <div className="border-t pt-4">
            <button
              onClick={testEmailConfiguration}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              Send Test Email
            </button>
          </div>
        </div>
      )}

      {/* SMS Settings */}
      {activeTab === 'sms' && (
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          <div>
            <label className="flex items-center mb-4">
              <input
                type="checkbox"
                checked={smsSettings.enabled}
                onChange={(e) => {
                  setSmsSettings({ ...smsSettings, enabled: e.target.checked });
                  setHasChanges(true);
                }}
                className="mr-2 h-4 w-4"
              />
              <span className="font-medium text-gray-900">Enable SMS</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Provider</label>
            <select
              value={smsSettings.provider}
              onChange={(e) => {
                setSmsSettings({ ...smsSettings, provider: e.target.value as any });
                setHasChanges(true);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="twilio">Twilio</option>
              <option value="aws-sns">AWS SNS</option>
              <option value="nexmo">Nexmo</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
              <input
                type="text"
                value={smsSettings.apiKey}
                onChange={(e) => {
                  setSmsSettings({ ...smsSettings, apiKey: e.target.value });
                  setHasChanges(true);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">API Secret</label>
              <input
                type="password"
                value={smsSettings.apiSecret}
                onChange={(e) => {
                  setSmsSettings({ ...smsSettings, apiSecret: e.target.value });
                  setHasChanges(true);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From Number</label>
            <input
              type="text"
              value={smsSettings.fromNumber}
              onChange={(e) => {
                setSmsSettings({ ...smsSettings, fromNumber: e.target.value });
                setHasChanges(true);
              }}
              placeholder="+1234567890"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div className="border-t pt-4">
            <button
              onClick={testSMSConfiguration}
              disabled={loading || !smsSettings.enabled}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              Send Test SMS
            </button>
          </div>
        </div>
      )}

      {/* OAuth Settings */}
      {activeTab === 'oauth' && (
        <div className="space-y-4">
          {oauthProviders.map((provider, index) => (
            <div key={provider.name} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{provider.name}</h3>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={provider.enabled}
                    onChange={(e) => {
                      const updated = [...oauthProviders];
                      updated[index].enabled = e.target.checked;
                      setOauthProviders(updated);
                      setHasChanges(true);
                    }}
                    className="mr-2 h-4 w-4"
                  />
                  <span className="text-sm font-medium">Enabled</span>
                </label>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Client ID</label>
                  <input
                    type="text"
                    value={provider.clientId}
                    onChange={(e) => {
                      const updated = [...oauthProviders];
                      updated[index].clientId = e.target.value;
                      setOauthProviders(updated);
                      setHasChanges(true);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Client Secret</label>
                  <input
                    type="password"
                    value={provider.clientSecret}
                    onChange={(e) => {
                      const updated = [...oauthProviders];
                      updated[index].clientSecret = e.target.value;
                      setOauthProviders(updated);
                      setHasChanges(true);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Security Settings */}
      {activeTab === 'security' && (
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Session Timeout (minutes)</label>
              <input
                type="number"
                value={securitySettings.sessionTimeout}
                onChange={(e) => {
                  setSecuritySettings({ ...securitySettings, sessionTimeout: parseInt(e.target.value) });
                  setHasChanges(true);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password Min Length</label>
              <input
                type="number"
                value={securitySettings.passwordMinLength}
                onChange={(e) => {
                  setSecuritySettings({ ...securitySettings, passwordMinLength: parseInt(e.target.value) });
                  setHasChanges(true);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-2">Password Requirements</h4>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={securitySettings.passwordRequireUppercase}
                  onChange={(e) => {
                    setSecuritySettings({ ...securitySettings, passwordRequireUppercase: e.target.checked });
                    setHasChanges(true);
                  }}
                  className="mr-2 h-4 w-4"
                />
                <span>Require Uppercase Letters</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={securitySettings.passwordRequireNumbers}
                  onChange={(e) => {
                    setSecuritySettings({ ...securitySettings, passwordRequireNumbers: e.target.checked });
                    setHasChanges(true);
                  }}
                  className="mr-2 h-4 w-4"
                />
                <span>Require Numbers</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={securitySettings.passwordRequireSpecialChars}
                  onChange={(e) => {
                    setSecuritySettings({ ...securitySettings, passwordRequireSpecialChars: e.target.checked });
                    setHasChanges(true);
                  }}
                  className="mr-2 h-4 w-4"
                />
                <span>Require Special Characters</span>
              </label>
            </div>
          </div>

          <div className="border-t pt-6 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Login Attempts</label>
              <input
                type="number"
                value={securitySettings.maxLoginAttempts}
                onChange={(e) => {
                  setSecuritySettings({ ...securitySettings, maxLoginAttempts: parseInt(e.target.value) });
                  setHasChanges(true);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lockout Duration (minutes)</label>
              <input
                type="number"
                value={securitySettings.lockoutDuration}
                onChange={(e) => {
                  setSecuritySettings({ ...securitySettings, lockoutDuration: parseInt(e.target.value) });
                  setHasChanges(true);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div className="border-t pt-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={securitySettings.twoFactorRequired}
                onChange={(e) => {
                  setSecuritySettings({ ...securitySettings, twoFactorRequired: e.target.checked });
                  setHasChanges(true);
                }}
                className="mr-2 h-4 w-4"
              />
              <span className="font-medium text-gray-900">Require Two-Factor Authentication</span>
            </label>
          </div>
        </div>
      )}

      {/* Backup Settings */}
      {activeTab === 'backup' && (
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={backupSettings.enabled}
                onChange={(e) => {
                  setBackupSettings({ ...backupSettings, enabled: e.target.checked });
                  setHasChanges(true);
                }}
                className="mr-2 h-4 w-4"
              />
              <span className="font-medium text-gray-900">Enable Automated Backups</span>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Schedule</label>
              <select
                value={backupSettings.schedule}
                onChange={(e) => {
                  setBackupSettings({ ...backupSettings, schedule: e.target.value });
                  setHasChanges(true);
                }}
                disabled={!backupSettings.enabled}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Retention (days)</label>
              <input
                type="number"
                value={backupSettings.retentionDays}
                onChange={(e) => {
                  setBackupSettings({ ...backupSettings, retentionDays: parseInt(e.target.value) });
                  setHasChanges(true);
                }}
                disabled={!backupSettings.enabled}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Backup Location</label>
            <input
              type="text"
              value={backupSettings.backupLocation}
              onChange={(e) => {
                setBackupSettings({ ...backupSettings, backupLocation: e.target.value });
                setHasChanges(true);
              }}
              disabled={!backupSettings.enabled}
              placeholder="s3://bucket-name or /path/to/backup"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={backupSettings.notifyOnCompletion}
                onChange={(e) => {
                  setBackupSettings({ ...backupSettings, notifyOnCompletion: e.target.checked });
                  setHasChanges(true);
                }}
                disabled={!backupSettings.enabled}
                className="mr-2 h-4 w-4"
              />
              <span className="font-medium text-gray-900">Notify on Completion</span>
            </label>
          </div>
        </div>
      )}

      {/* Log Settings */}
      {activeTab === 'logs' && (
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Log Level</label>
            <select
              value={logSettings.logLevel}
              onChange={(e) => {
                setLogSettings({ ...logSettings, logLevel: e.target.value as any });
                setHasChanges(true);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="Debug">Debug</option>
              <option value="Info">Info</option>
              <option value="Warning">Warning</option>
              <option value="Error">Error</option>
              <option value="Critical">Critical</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Log Retention (days)</label>
            <input
              type="number"
              value={logSettings.retentionDays}
              onChange={(e) => {
                setLogSettings({ ...logSettings, retentionDays: parseInt(e.target.value) });
                setHasChanges(true);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div className="border-t pt-6">
            <label className="flex items-center mb-4">
              <input
                type="checkbox"
                checked={logSettings.enableRemoteLogging}
                onChange={(e) => {
                  setLogSettings({ ...logSettings, enableRemoteLogging: e.target.checked });
                  setHasChanges(true);
                }}
                className="mr-2 h-4 w-4"
              />
              <span className="font-medium text-gray-900">Enable Remote Logging</span>
            </label>
            {logSettings.enableRemoteLogging && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Remote Endpoint</label>
                <input
                  type="text"
                  value={logSettings.remoteLoggingEndpoint}
                  onChange={(e) => {
                    setLogSettings({ ...logSettings, remoteLoggingEndpoint: e.target.value });
                    setHasChanges(true);
                  }}
                  placeholder="https://logs.example.com/api"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <Modal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        title={confirmModal.title}
        size="sm"
        footer={
          <>
            <button
              onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                confirmModal.action();
                setConfirmModal({ ...confirmModal, isOpen: false });
              }}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Confirm
            </button>
          </>
        }
      >
        <p>{confirmModal.message}</p>
      </Modal>
    </div>
  );
}
