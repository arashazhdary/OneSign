import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { usersService } from '@/lib/api/services';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Monitor,
  Smartphone,
  Tablet,
  MapPin,
  Clock,
  LogOut,
  Shield,
  AlertTriangle,
  Chrome,
  Safari,
  Globe,
  CheckCircle2,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface UserSession {
  id: string;
  deviceType: string;
  deviceName: string;
  browser: string;
  browserVersion?: string;
  operatingSystem: string;
  ipAddress: string;
  city?: string;
  country?: string;
  lastActiveAt: string;
  createdAt: string;
  isCurrentSession: boolean;
}

export default function AccountSessionsPage() {
  const { t } = useTranslation();
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [revoking, setRevoking] = useState<string | null>(null);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const data = await usersService.getAccountSessions();
      setSessions(data);
    } catch (error: any) {
      console.error('Error fetching sessions:', error);
      toast.error(t('account.sessions.fetchError', 'Failed to load sessions'));
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    if (!confirm(t('account.sessions.confirmRevoke', 'Are you sure you want to sign out this session?'))) {
      return;
    }

    try {
      setRevoking(sessionId);
      await usersService.revokeSession(sessionId);
      toast.success(t('account.sessions.revokeSuccess', 'Session signed out successfully'));
      fetchSessions();
    } catch (error: any) {
      console.error('Error revoking session:', error);
      toast.error(t('account.sessions.revokeError', 'Failed to sign out session'));
    } finally {
      setRevoking(null);
    }
  };

  const handleRevokeAllOthers = async () => {
    if (!confirm(t('account.sessions.confirmRevokeAll', 'Are you sure you want to sign out all other sessions?'))) {
      return;
    }

    try {
      setRevoking('all');
      await usersService.revokeAllOtherSessions();
      toast.success(t('account.sessions.revokeAllSuccess', 'All other sessions signed out successfully'));
      fetchSessions();
    } catch (error: any) {
      console.error('Error revoking all sessions:', error);
      toast.error(t('account.sessions.revokeAllError', 'Failed to sign out sessions'));
    } finally {
      setRevoking(null);
    }
  };

  const getDeviceIcon = (deviceType: string) => {
    const type = deviceType?.toLowerCase() || 'desktop';
    if (type.includes('mobile') || type.includes('phone')) {
      return <Smartphone className="w-6 h-6" />;
    }
    if (type.includes('tablet') || type.includes('ipad')) {
      return <Tablet className="w-6 h-6" />;
    }
    return <Monitor className="w-6 h-6" />;
  };

  const getBrowserIcon = (browser: string) => {
    const browserLower = browser?.toLowerCase() || '';
    if (browserLower.includes('chrome')) {
      return <Chrome className="w-5 h-5" />;
    }
    if (browserLower.includes('safari')) {
      return <Safari className="w-5 h-5" />;
    }
    return <Globe className="w-5 h-5" />;
  };

  const formatLastActive = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return t('account.sessions.justNow', 'Just now');
    if (diffMins < 60) return t('account.sessions.minutesAgo', '{{count}} minutes ago', { count: diffMins });

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return t('account.sessions.hoursAgo', '{{count}} hours ago', { count: diffHours });

    const diffDays = Math.floor(diffHours / 24);
    return t('account.sessions.daysAgo', '{{count}} days ago', { count: diffDays });
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
        <title>{t('account.sessions.title', 'Active Sessions')} | OneSign</title>
      </Helmet>

      <div className="p-8 max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {t('account.sessions.title', 'Active Sessions')}
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                  {t('account.sessions.subtitle', 'Manage your active login sessions across devices')}
                </p>
              </div>
            </div>

            {sessions.length > 1 && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleRevokeAllOthers}
                disabled={revoking === 'all'}
                className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors flex items-center gap-2 shadow-lg disabled:opacity-50"
              >
                {revoking === 'all' ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {t('account.sessions.signingOut', 'Signing out...')}
                  </>
                ) : (
                  <>
                    <LogOut className="w-5 h-5" />
                    {t('account.sessions.signOutAllOthers', 'Sign out all other sessions')}
                  </>
                )}
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* Security Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 flex items-start gap-3"
        >
          <AlertTriangle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
              {t('account.sessions.securityNoticeTitle', 'Security Notice')}
            </h3>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              {t('account.sessions.securityNoticeText', 'If you see any sessions you don\'t recognize, sign them out immediately and change your password.')}
            </p>
          </div>
        </motion.div>

        {/* Sessions List */}
        <div className="space-y-4">
          <AnimatePresence>
            {sessions.map((session, index) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6 hover:shadow-xl transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    {/* Device Icon */}
                    <div className={`p-3 rounded-xl ${
                      session.isCurrentSession
                        ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white'
                        : 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                    }`}>
                      {getDeviceIcon(session.deviceType)}
                    </div>

                    {/* Session Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                          {session.deviceName}
                        </h3>
                        {session.isCurrentSession && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 text-xs font-medium rounded-full">
                            <CheckCircle2 className="w-3 h-3" />
                            {t('account.sessions.currentSession', 'Current Session')}
                          </span>
                        )}
                      </div>

                      <div className="space-y-2">
                        {/* Browser Info */}
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          {getBrowserIcon(session.browser)}
                          <span>{session.browser}</span>
                          <span>•</span>
                          <span>{session.operatingSystem}</span>
                        </div>

                        {/* Location Info */}
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <MapPin className="w-4 h-4" />
                          <span>{session.ipAddress}</span>
                          {(session.city || session.country) && (
                            <>
                              <span>•</span>
                              <span>
                                {[session.city, session.country].filter(Boolean).join(', ')}
                              </span>
                            </>
                          )}
                        </div>

                        {/* Last Active */}
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-500">
                          <Clock className="w-4 h-4" />
                          <span>
                            {t('account.sessions.lastActive', 'Last active')}: {formatLastActive(session.lastActiveAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sign Out Button */}
                  {!session.isCurrentSession && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleRevokeSession(session.id)}
                      disabled={revoking === session.id}
                      className="px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                      {revoking === session.id ? (
                        <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <LogOut className="w-4 h-4" />
                      )}
                      {t('account.sessions.signOut', 'Sign out')}
                    </motion.button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {sessions.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-slate-700"
            >
              <Monitor className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                {t('account.sessions.noSessions', 'No active sessions found')}
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
