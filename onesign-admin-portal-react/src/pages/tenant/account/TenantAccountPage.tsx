import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocale } from '@/hooks/useLocale';
import { getTenantId } from '@/lib/tenant-context';
import { usersService } from '@/lib/api/services/users.service';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Shield,
  Settings,
  Mail,
  Phone,
  Globe,
  Clock,
  Edit3,
  Save,
  X,
  Lock,
  Key,
  Monitor,
  MapPin,
  Bell,
  AlertTriangle,
  FileText,
  CheckCircle,
  XCircle,
  LogOut,
} from 'lucide-react';

interface AccountProfile {
  id: string;
  userId?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  phoneNumber?: string;
  timezone?: string;
  timeZone?: string;
  language?: string;
  preferredLanguage?: string;
  avatarUrl?: string;
  profilePictureUrl?: string;
}

interface Session {
  id: string;
  deviceName: string;
  ipAddress: string;
  location?: string;
  lastActivity: string;
  isCurrent: boolean;
}

type Tab = 'profile' | 'security' | 'preferences';

export default function TenantAccountPage() {
  const { t } = useTranslation();
  const locale = useLocale();
  const [activeTab, setActiveTab] = useState<Tab>('profile');
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

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'profile', label: t('tenant.account.profileTab', 'Profile'), icon: <User className="w-5 h-5" /> },
    { id: 'security', label: t('tenant.account.securityTab', 'Security'), icon: <Shield className="w-5 h-5" /> },
    { id: 'preferences', label: t('tenant.account.preferencesTab', 'Preferences'), icon: <Settings className="w-5 h-5" /> },
  ];

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
    try {
      const data = await usersService.getAccountProfile();
      if (data) {
        const profileData = data as unknown as AccountProfile;
        setProfile(profileData);
        const anyData = data as any;
        setFirstName(anyData.firstName || profileData.displayName?.split(' ')[0] || '');
        setLastName(anyData.lastName || profileData.displayName?.split(' ').slice(1).join(' ') || '');
        setPhoneNumber(profileData.phoneNumber || '');
        setTimezone(profileData.timeZone || anyData.timezone || 'UTC');
        setLanguage(profileData.preferredLanguage || anyData.language || 'en');
      }
    } catch (err: any) {
      console.error('Error fetching profile:', err);
      setError(err?.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const fetchSessions = async () => {
    try {
      const data = await usersService.getAccountSessions();
      setSessions(data);
    } catch (err: any) {
      console.error('Error fetching sessions:', err);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await usersService.updateAccountProfile({
        userId: profile?.id || profile?.userId || '',
        displayName: `${firstName} ${lastName}`.trim(),
        phoneNumber,
        timeZone: timezone,
        preferredLanguage: language
      });
      setSuccess(t('tenant.account.profileUpdated', 'Profile updated successfully'));
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
      setError(t('tenant.account.passwordMismatch', 'Passwords do not match'));
      return;
    }

    try {
      await usersService.changePassword(currentPassword, newPassword);
      setSuccess(t('tenant.account.passwordChanged', 'Password changed successfully'));
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err?.message || t('common.error'));
      console.error('Error changing password:', err);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    if (!confirm(t('tenant.account.confirmRevokeSession', 'Are you sure you want to revoke this session?'))) return;
    setError('');
    setSuccess('');

    try {
      await usersService.revokeSession(sessionId);
      setSuccess(t('tenant.account.sessionRevoked', 'Session revoked successfully'));
      fetchSessions();
    } catch (err: any) {
      setError(err?.message || t('common.error'));
      console.error('Error revoking session:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      <Helmet>
        <title>{t('tenant.account.title', 'My Account')} | OneSign</title>
      </Helmet>

      <div className="p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {t('tenant.account.title', 'My Account')}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                {t('tenant.account.subtitle', 'Manage your account settings and preferences')}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Alerts */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl flex items-center gap-3"
            >
              <XCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
              <button onClick={() => setError('')} className="ml-auto">
                <X className="w-5 h-5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-xl flex items-center gap-3"
            >
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
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
          className="mb-8"
        >
          <div className="flex gap-2 border-b border-gray-200 dark:border-slate-700">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-6 py-4 font-medium transition-all flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
              >
                {tab.icon}
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-600"
                  />
                )}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Profile Tab */}
        <AnimatePresence mode="wait">
          {activeTab === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <User className="w-5 h-5 text-indigo-500" />
                  {t('tenant.account.profileInfo', 'Profile Information')}
                </h2>
                {!editMode && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setEditMode(true)}
                    className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all flex items-center gap-2 shadow-lg"
                  >
                    <Edit3 className="w-4 h-4" />
                    {t('common.edit', 'Edit')}
                  </motion.button>
                )}
              </div>

              {editMode ? (
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('tenant.account.firstName', 'First Name')}
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('tenant.account.lastName', 'Last Name')}
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {t('tenant.account.email', 'Email')}
                    </label>
                    <input
                      type="email"
                      disabled
                      className="w-full px-4 py-2.5 bg-gray-100 dark:bg-slate-600 border border-gray-200 dark:border-slate-600 rounded-xl cursor-not-allowed"
                      value={profile?.email || ''}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      {t('tenant.account.phoneNumber', 'Phone Number')}
                    </label>
                    <input
                      type="tel"
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {t('tenant.account.timezone', 'Timezone')}
                      </label>
                      <select
                        className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
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
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        {t('tenant.account.language', 'Language')}
                      </label>
                      <select
                        className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
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

                  <div className="flex gap-3">
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all flex items-center gap-2 shadow-lg"
                    >
                      <Save className="w-4 h-4" />
                      {t('common.save', 'Save')}
                    </motion.button>
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setEditMode(false);
                        setError('');
                        fetchProfile();
                      }}
                      className="px-6 py-2.5 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors"
                    >
                      {t('common.cancel', 'Cancel')}
                    </motion.button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{t('tenant.account.firstName', 'First Name')}</p>
                      <p className="font-medium text-gray-900 dark:text-white">{profile?.firstName || firstName || '-'}</p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{t('tenant.account.lastName', 'Last Name')}</p>
                      <p className="font-medium text-gray-900 dark:text-white">{profile?.lastName || lastName || '-'}</p>
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {t('tenant.account.email', 'Email')}
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">{profile?.email || '-'}</p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      {t('tenant.account.phoneNumber', 'Phone Number')}
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">{profile?.phoneNumber || '-'}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {t('tenant.account.timezone', 'Timezone')}
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">{profile?.timezone || profile?.timeZone || 'UTC'}</p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        {t('tenant.account.language', 'Language')}
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">{profile?.language || profile?.preferredLanguage || 'en'}</p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <motion.div
              key="security"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Change Password */}
              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <Key className="w-5 h-5 text-indigo-500" />
                  {t('tenant.account.changePassword', 'Change Password')}
                </h2>
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('tenant.account.currentPassword', 'Current Password')}
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="password"
                        required
                        className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('tenant.account.newPassword', 'New Password')}
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="password"
                        required
                        minLength={8}
                        className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('tenant.account.confirmPassword', 'Confirm Password')}
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="password"
                        required
                        className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </div>
                  </div>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg"
                  >
                    {t('tenant.account.updatePassword', 'Update Password')}
                  </motion.button>
                </form>
              </div>

              {/* Active Sessions */}
              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <Monitor className="w-5 h-5 text-indigo-500" />
                  {t('tenant.account.activeSessions', 'Active Sessions')}
                </h2>
                <div className="space-y-4">
                  {sessions.map((session, index) => (
                    <motion.div
                      key={session.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                          <Monitor className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-gray-900 dark:text-white">{session.deviceName}</p>
                            {session.isCurrent && (
                              <span className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 text-xs px-2 py-0.5 rounded-full">
                                {t('tenant.account.currentSession', 'Current')}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2 mt-1">
                            <MapPin className="w-4 h-4" />
                            {session.ipAddress} {session.location && `• ${session.location}`}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            {t('tenant.account.lastActivity', 'Last activity')}: {new Date(session.lastActivity).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      {!session.isCurrent && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleRevokeSession(session.id)}
                          className="px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors flex items-center gap-2"
                        >
                          <LogOut className="w-4 h-4" />
                          {t('tenant.account.revoke', 'Revoke')}
                        </motion.button>
                      )}
                    </motion.div>
                  ))}
                  {sessions.length === 0 && (
                    <p className="text-center py-8 text-gray-500 dark:text-gray-400">
                      {t('tenant.account.noSessions', 'No active sessions')}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <motion.div
              key="preferences"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Bell className="w-5 h-5 text-indigo-500" />
                {t('tenant.account.notificationPreferences', 'Notification Preferences')}
              </h2>
              <div className="space-y-4">
                <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 cursor-pointer transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{t('tenant.account.emailNotifications', 'Email Notifications')}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{t('tenant.account.emailNotificationsDesc', 'Receive notifications via email')}</p>
                    </div>
                  </div>
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={emailNotifications}
                      onChange={(e) => setEmailNotifications(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                  </div>
                </label>

                <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 cursor-pointer transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                      <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{t('tenant.account.securityAlerts', 'Security Alerts')}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{t('tenant.account.securityAlertsDesc', 'Get notified about security events')}</p>
                    </div>
                  </div>
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={securityAlerts}
                      onChange={(e) => setSecurityAlerts(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                  </div>
                </label>

                <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 cursor-pointer transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <FileText className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{t('tenant.account.weeklyReports', 'Weekly Reports')}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{t('tenant.account.weeklyReportsDesc', 'Receive weekly activity summary')}</p>
                    </div>
                  </div>
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={weeklyReports}
                      onChange={(e) => setWeeklyReports(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                  </div>
                </label>
              </div>

              <div className="mt-6">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSuccess(t('tenant.account.preferencesUpdated', 'Preferences updated successfully'))}
                  className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all flex items-center gap-2 shadow-lg"
                >
                  <Save className="w-4 h-4" />
                  {t('common.save', 'Save')}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
