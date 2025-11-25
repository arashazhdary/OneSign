import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { getTenantId } from '@/lib/tenant-context';
import { usersService } from '@/lib/api/services/users.service';
import { Helmet } from 'react-helmet-async';

interface AccountProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  timezone?: string;
  language?: string;
  avatarUrl?: string;
}

interface Session {
  id: string;
  deviceName: string;
  ipAddress: string;
  location?: string;
  lastActivity: string;
  isCurrent: boolean;
}

export default function TenantAccountPage() {
  const { t } = useTranslation();
  const locale = useLocale();
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'preferences'>('profile');
  const [tenantId, setTenantIdState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Profile State
  const [profile, setProfile] = useState<AccountProfile | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [timezone, setTimezone] = useState('');
  const [language, setLanguage] = useState('');

  // Security State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [sessions, setSessions] = useState<Session[]>([]);

  // Preferences State
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [securityAlerts, setSecurityAlerts] = useState(true);
  const [weeklyReports, setWeeklyReports] = useState(false);

  useEffect(() => {
    const contextTenantId = getTenantId();
    setTenantIdState(contextTenantId || '00000000-0000-0000-0000-000000000000');
  }, []);

  useEffect(() => {
    if (tenantId) {
      fetchProfile();
      fetchSessions();
    }
  }, [tenantId]);

  const fetchProfile = async () => {
    if (!tenantId) return;
    try {
      const data = await usersService.getAccountProfile(tenantId);
      setProfile(data);
      setFirstName(data.firstName);
      setLastName(data.lastName);
      setPhoneNumber(data.phoneNumber || '');
      setTimezone(data.timezone || 'UTC');
      setLanguage(data.language || 'en');
    } catch (err: any) {
      console.error('Error fetching profile:', err);
      setError(err?.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const fetchSessions = async () => {
    if (!tenantId) return;
    try {
      const data = await usersService.getAccountSessions(tenantId);
      setSessions(data);
    } catch (err: any) {
      console.error('Error fetching sessions:', err);
      setError(err?.message || t('common.error'));
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!tenantId) return;

    try {
      await usersService.updateAccountProfile(tenantId, {
        firstName,
        lastName,
        phoneNumber,
        timezone,
        language
      });
      setSuccess(t('tenant.account.profileUpdated'));
      setEditMode(false);
      fetchProfile();
    } catch (err: any) {
      setError(err?.message || t('common.error'));
      console.error('Error updating profile:', err);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError(t('tenant.account.passwordMismatch'));
      return;
    }

    if (!tenantId) return;

    try {
      await usersService.changePassword(tenantId, currentPassword, newPassword);
      setSuccess(t('tenant.account.passwordChanged'));
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err?.message || t('common.error'));
      console.error('Error changing password:', err);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    if (!confirm(t('tenant.account.confirmRevokeSession'))) return;
    setError('');
    setSuccess('');

    if (!tenantId) return;

    try {
      await usersService.revokeSession(tenantId, sessionId);
      setSuccess(t('tenant.account.sessionRevoked'));
      fetchSessions();
    } catch (err: any) {
      setError(err?.message || t('common.error'));
      console.error('Error revoking session:', err);
    }
  };

  if (loading) {
    return <div className="p-8">{t('common.loading')}</div>;
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          {t('tenant.account.title')}
        </h1>
        <p className="text-gray-600 mt-2">{t('tenant.account.subtitle')}</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-6 py-3 font-medium ${
            activeTab === 'profile'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          {t('tenant.account.profileTab')}
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`px-6 py-3 font-medium ${
            activeTab === 'security'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          {t('tenant.account.securityTab')}
        </button>
        <button
          onClick={() => setActiveTab('preferences')}
          className={`px-6 py-3 font-medium ${
            activeTab === 'preferences'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          {t('tenant.account.preferencesTab')}
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

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">{t('tenant.account.profileInfo')}</h2>
            {!editMode && (
              <button
                onClick={() => setEditMode(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                {t('common.edit')}
              </button>
            )}
          </div>

          {editMode ? (
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">{t('tenant.account.firstName')}</label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border rounded"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">{t('tenant.account.lastName')}</label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border rounded"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">{t('tenant.account.email')}</label>
                <input
                  type="email"
                  disabled
                  className="w-full px-3 py-2 border rounded bg-gray-100"
                  value={profile?.email || ''}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">{t('tenant.account.phoneNumber')}</label>
                <input
                  type="tel"
                  className="w-full px-3 py-2 border rounded"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">{t('tenant.account.timezone')}</label>
                  <select
                    className="w-full px-3 py-2 border rounded"
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                  >
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Chicago">Central Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                    <option value="Europe/London">London</option>
                    <option value="Europe/Paris">Paris</option>
                    <option value="Asia/Tehran">Tehran</option>
                    <option value="Asia/Dubai">Dubai</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">{t('tenant.account.language')}</label>
                  <select
                    className="w-full px-3 py-2 border rounded"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                  >
                    <option value="en">English</option>
                    <option value="fa">فارسی</option>
                    <option value="ar">العربية</option>
                    <option value="fr">Français</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  {t('common.save')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditMode(false);
                    setError('');
                    fetchProfile();
                  }}
                  className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
                >
                  {t('common.cancel')}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">{t('tenant.account.firstName')}</p>
                  <p className="font-medium">{profile?.firstName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">{t('tenant.account.lastName')}</p>
                  <p className="font-medium">{profile?.lastName}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600">{t('tenant.account.email')}</p>
                <p className="font-medium">{profile?.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">{t('tenant.account.phoneNumber')}</p>
                <p className="font-medium">{profile?.phoneNumber || '-'}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">{t('tenant.account.timezone')}</p>
                  <p className="font-medium">{profile?.timezone || 'UTC'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">{t('tenant.account.language')}</p>
                  <p className="font-medium">{profile?.language || 'en'}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          {/* Change Password */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">{t('tenant.account.changePassword')}</h2>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">{t('tenant.account.currentPassword')}</label>
                <input
                  type="password"
                  required
                  className="w-full px-3 py-2 border rounded"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">{t('tenant.account.newPassword')}</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  className="w-full px-3 py-2 border rounded"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">{t('tenant.account.confirmPassword')}</label>
                <input
                  type="password"
                  required
                  className="w-full px-3 py-2 border rounded"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                {t('tenant.account.updatePassword')}
              </button>
            </form>
          </div>

          {/* Active Sessions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">{t('tenant.account.activeSessions')}</h2>
            <div className="space-y-3">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-4 border rounded hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{session.deviceName}</p>
                      {session.isCurrent && (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                          {t('tenant.account.currentSession')}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      {session.ipAddress} {session.location && `• ${session.location}`}
                    </p>
                    <p className="text-xs text-gray-500">
                      {t('tenant.account.lastActivity')}: {new Date(session.lastActivity).toLocaleString()}
                    </p>
                  </div>
                  {!session.isCurrent && (
                    <button
                      onClick={() => handleRevokeSession(session.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      {t('tenant.account.revoke')}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Preferences Tab */}
      {activeTab === 'preferences' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-6">{t('tenant.account.notificationPreferences')}</h2>
          <div className="space-y-4">
            <label className="flex items-center justify-between p-4 border rounded hover:bg-gray-50 cursor-pointer">
              <div>
                <p className="font-medium">{t('tenant.account.emailNotifications')}</p>
                <p className="text-sm text-gray-600">{t('tenant.account.emailNotificationsDesc')}</p>
              </div>
              <input
                type="checkbox"
                checked={emailNotifications}
                onChange={(e) => setEmailNotifications(e.target.checked)}
                className="w-5 h-5"
              />
            </label>

            <label className="flex items-center justify-between p-4 border rounded hover:bg-gray-50 cursor-pointer">
              <div>
                <p className="font-medium">{t('tenant.account.securityAlerts')}</p>
                <p className="text-sm text-gray-600">{t('tenant.account.securityAlertsDesc')}</p>
              </div>
              <input
                type="checkbox"
                checked={securityAlerts}
                onChange={(e) => setSecurityAlerts(e.target.checked)}
                className="w-5 h-5"
              />
            </label>

            <label className="flex items-center justify-between p-4 border rounded hover:bg-gray-50 cursor-pointer">
              <div>
                <p className="font-medium">{t('tenant.account.weeklyReports')}</p>
                <p className="text-sm text-gray-600">{t('tenant.account.weeklyReportsDesc')}</p>
              </div>
              <input
                type="checkbox"
                checked={weeklyReports}
                onChange={(e) => setWeeklyReports(e.target.checked)}
                className="w-5 h-5"
              />
            </label>
          </div>

          <div className="mt-6">
            <button
              onClick={() => setSuccess(t('tenant.account.preferencesUpdated'))}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              {t('common.save')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
