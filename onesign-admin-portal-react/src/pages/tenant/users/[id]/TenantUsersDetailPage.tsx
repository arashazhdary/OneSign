import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { getTenantId } from '@/lib/tenant-context';
import Modal from '@/components/common/Modal';
import StatusBadge from '@/components/common/StatusBadge';
import { usersService } from '@/lib/api/services/users.service';
import { Helmet } from 'react-helmet-async';
import {
  User,
  Activity,
  Shield,
  Clock,
  AlertTriangle,
  Package,
  Key,
  FileText,
  Mail,
  Phone,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit,
  Loader2,
  Users,
  Lock,
  Eye,
  Globe,
} from 'lucide-react';

interface UserProfile {
  id: string;
  tenantId?: string;
  userId?: string;
  globalUserId?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  phoneNumber?: string | null;
  profilePictureUrl?: string | null;
  status?: string;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  mfaEnabled?: boolean;
  lastLoginAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  customAttributes?: Record<string, any>;
  roles?: string[];
  groups?: string[];
  timeZone?: string;
  preferredLanguage?: string;
}

interface UserActivity {
  id: string;
  userId: string;
  activityType: string;
  description: string;
  ipAddress: string;
  userAgent: string;
  occurredAt: string;
}

interface LifecycleEvent {
  id: string;
  eventType: string;
  eventName: string;
  description: string;
  timestamp: string;
  actorId?: string;
  actorName?: string;
  metadata?: Record<string, any>;
}

interface RiskSignal {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  detectedAt: string;
  status: 'active' | 'resolved' | 'dismissed';
}

interface RiskAssessment {
  userId?: string;
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical' | string;
  lastAssessedAt?: string;
  signals?: RiskSignal[];
  factors?: Array<{
    factor: string;
    score: number;
    description: string;
  }>;
}

interface AccessPackage {
  id: string;
  name: string;
  description: string;
  grantedAt: string;
  expiresAt?: string;
  status: 'active' | 'expired' | 'revoked';
  resources: string[];
}

interface PrivilegedSession {
  id: string;
  sessionType: string;
  resourceId: string;
  resourceName: string;
  startedAt: string;
  endedAt?: string;
  duration?: number;
  ipAddress: string;
  status: 'active' | 'completed' | 'terminated';
}

interface AuditTrailEntry {
  id: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  resourceName?: string;
  result: 'success' | 'failure';
  ipAddress: string;
  userAgent: string;
  timestamp: string;
  details?: Record<string, any>;
}

type Tab = 'profile' | 'activity' | 'security' | 'lifecycle' | 'risk' | 'access-packages' | 'privileged-sessions' | 'audit-trail';

const tabs = [
  { key: 'profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
  { key: 'activity', label: 'Activity', icon: <Activity className="w-4 h-4" /> },
  { key: 'security', label: 'Security', icon: <Shield className="w-4 h-4" /> },
  { key: 'lifecycle', label: 'Lifecycle', icon: <Clock className="w-4 h-4" /> },
  { key: 'risk', label: 'Risk', icon: <AlertTriangle className="w-4 h-4" /> },
  { key: 'access-packages', label: 'Access', icon: <Package className="w-4 h-4" /> },
  { key: 'privileged-sessions', label: 'Sessions', icon: <Key className="w-4 h-4" /> },
  { key: 'audit-trail', label: 'Audit', icon: <FileText className="w-4 h-4" /> },
];

export default function TenantUsersDetailPage() {
  const params = useParams();
  const userId = params.id as string;
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [lifecycleEvents, setLifecycleEvents] = useState<LifecycleEvent[]>([]);
  const [riskAssessment, setRiskAssessment] = useState<RiskAssessment | null>(null);
  const [accessPackages, setAccessPackages] = useState<AccessPackage[]>([]);
  const [privilegedSessions, setPrivilegedSessions] = useState<PrivilegedSession[]>([]);
  const [auditTrail, setAuditTrail] = useState<AuditTrailEntry[]>([]);
  const [showEditModal, setShowEditModal] = useState(false);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const tenantId = getTenantId();

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  useEffect(() => {
    if (activeTab === 'activity') fetchActivities();
    else if (activeTab === 'lifecycle') fetchLifecycleEvents();
    else if (activeTab === 'risk') fetchRiskAssessment();
    else if (activeTab === 'access-packages') fetchAccessPackages();
    else if (activeTab === 'privileged-sessions') fetchPrivilegedSessions();
    else if (activeTab === 'audit-trail') fetchAuditTrail();
  }, [activeTab]);

  const fetchProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await usersService.getUserProfile(userId);
      if (data) {
        const mappedProfile: UserProfile = {
          id: data.id,
          userId: data.userId,
          displayName: data.displayName || '',
          phoneNumber: data.phoneNumber || null,
          profilePictureUrl: data.profilePictureUrl || null,
          timeZone: data.timeZone,
          preferredLanguage: data.preferredLanguage,
          firstName: data.displayName?.split(' ')[0] || '',
          lastName: data.displayName?.split(' ').slice(1).join(' ') || '',
          roles: [],
          groups: [],
        };
        setProfile(mappedProfile);
        setFirstName(mappedProfile.firstName || '');
        setLastName(mappedProfile.lastName || '');
        setDisplayName(mappedProfile.displayName || '');
        setPhoneNumber(mappedProfile.phoneNumber || '');
      }
    } catch (err) {
      setError(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const fetchActivities = async () => {
    try {
      const data = await usersService.getUserActivities(userId, { limit: 50 });
      setActivities(data);
    } catch (err) {
      console.error('Failed to fetch activities:', err);
    }
  };

  const fetchLifecycleEvents = async () => {
    try {
      const data = await usersService.getUserLifecycle(userId);
      setLifecycleEvents(data);
    } catch (err) {
      console.error('Failed to fetch lifecycle events:', err);
    }
  };

  const fetchRiskAssessment = async () => {
    try {
      const data = await usersService.getUserRiskAssessment(userId);
      if (data) {
        setRiskAssessment({
          userId,
          riskScore: data.riskScore || 0,
          riskLevel: data.riskLevel || 'low',
          lastAssessedAt: new Date().toISOString(),
          signals: [],
          factors: [],
        });
      }
    } catch (err) {
      console.error('Failed to fetch risk assessment:', err);
    }
  };

  const fetchAccessPackages = async () => {
    try {
      const data = await usersService.getUserAccessPackages(userId);
      setAccessPackages(data);
    } catch (err) {
      console.error('Failed to fetch access packages:', err);
    }
  };

  const fetchPrivilegedSessions = async () => {
    try {
      const data = await usersService.getUserPrivilegedSessions(userId);
      setPrivilegedSessions(data);
    } catch (err) {
      console.error('Failed to fetch privileged sessions:', err);
    }
  };

  const fetchAuditTrail = async () => {
    try {
      const data = await usersService.getUserAuditTrail(userId);
      setAuditTrail(data || []);
    } catch (err) {
      console.error('Failed to fetch audit trail:', err);
    }
  };

  const handleUpdateProfile = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await usersService.updateUserProfile(userId, {
        displayName: displayName || `${firstName} ${lastName}`.trim(),
        phoneNumber: phoneNumber || undefined,
      });
      setSuccess('Profile updated successfully');
      setShowEditModal(false);
      fetchProfile();
    } catch (err) {
      setError(t('common.error'));
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <Loader2 className="w-8 h-8 text-blue-600" />
        </motion.div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-6 py-4 rounded-xl"
        >
          User profile not found
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 p-6">
      <Helmet>
        <title>User Profile - {profile.displayName || 'User'}</title>
      </Helmet>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                User Profile
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">{profile.email}</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowEditModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            <Edit className="w-4 h-4" />
            Edit Profile
          </motion.button>
        </div>
      </motion.div>

      {/* Alerts */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-6 py-4 rounded-xl flex items-center gap-3"
          >
            <XCircle className="w-5 h-5" />
            {error}
          </motion.div>
        )}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-6 py-4 rounded-xl flex items-center gap-3"
          >
            <CheckCircle className="w-5 h-5" />
            {success}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-2"
      >
        <nav className="flex space-x-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as Tab)}
              className={`relative flex-1 py-3 px-4 rounded-lg font-medium transition-all whitespace-nowrap ${
                activeTab === tab.key
                  ? 'text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700'
              }`}
            >
              {activeTab === tab.key && (
                <motion.div
                  layoutId="activeUserTab"
                  className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10 flex items-center justify-center gap-2">
                {tab.icon}
                {tab.label}
              </span>
            </button>
          ))}
        </nav>
      </motion.div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700 overflow-hidden"
          >
            <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600" />
            <div className="px-8 pb-8">
              <div className="flex items-end -mt-16 mb-6">
                <div className="w-32 h-32 rounded-full border-4 border-white dark:border-slate-800 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center text-4xl font-bold text-blue-600 dark:text-blue-400 shadow-lg">
                  {profile.firstName?.[0]}{profile.lastName?.[0]}
                </div>
                <div className="ml-6 mb-4">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{profile.displayName || 'N/A'}</h2>
                  <p className="text-gray-600 dark:text-gray-400">{profile.email}</p>
                  <div className="mt-2">
                    <StatusBadge status={profile.status} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { label: 'First Name', value: profile.firstName, icon: <User className="w-4 h-4" /> },
                  { label: 'Last Name', value: profile.lastName, icon: <User className="w-4 h-4" /> },
                  { label: 'Phone Number', value: profile.phoneNumber, icon: <Phone className="w-4 h-4" /> },
                  { label: 'Last Login', value: formatDate(profile.lastLoginAt), icon: <Clock className="w-4 h-4" /> },
                  { label: 'Created At', value: formatDate(profile.createdAt), icon: <Calendar className="w-4 h-4" /> },
                  { label: 'Updated At', value: formatDate(profile.updatedAt), icon: <Calendar className="w-4 h-4" /> },
                ].map((item, index) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl"
                  >
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      {item.icon}
                      {item.label}
                    </div>
                    <div className="text-gray-900 dark:text-white font-medium">{item.value || 'N/A'}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Roles</h3>
              </div>
              {profile.roles?.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400">No roles assigned</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {profile.roles?.map((role) => (
                    <span
                      key={role}
                      className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {role}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Groups</h3>
              </div>
              {profile.groups?.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400">No groups assigned</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {profile.groups?.map((group) => (
                    <span
                      key={group}
                      className="bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400 px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {group}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}

      {/* Activity Tab */}
      {activeTab === 'activity' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6"
        >
          <div className="flex items-center gap-2 mb-6">
            <Activity className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
          </div>
          {activities.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">No activities found</p>
          ) : (
            <div className="space-y-4">
              {activities.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-l-4 border-blue-500 pl-4 py-3 bg-gray-50 dark:bg-slate-700/50 rounded-r-xl"
                >
                  <div className="font-medium text-gray-900 dark:text-white">{activity.activityType}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{activity.description}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-500 mt-2 flex items-center gap-2">
                    <Globe className="w-3 h-3" />
                    IP: {activity.ipAddress}
                    <span className="mx-2">•</span>
                    <Clock className="w-3 h-3" />
                    {formatDate(activity.occurredAt)}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6"
        >
          <div className="flex items-center gap-2 mb-6">
            <Shield className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Security Status</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: 'Email Verified', value: profile.emailVerified, icon: <Mail className="w-5 h-5" /> },
              { label: 'Phone Verified', value: profile.phoneVerified, icon: <Phone className="w-5 h-5" /> },
              { label: 'MFA Enabled', value: profile.mfaEnabled, icon: <Lock className="w-5 h-5" />, warning: !profile.mfaEnabled },
            ].map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center justify-between p-6 rounded-xl ${
                  item.value
                    ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                    : item.warning
                    ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
                    : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                }`}
              >
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{item.label}</div>
                  <div className={`text-lg font-semibold ${
                    item.value
                      ? 'text-green-600 dark:text-green-400'
                      : item.warning
                      ? 'text-yellow-600 dark:text-yellow-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {item.value ? 'Yes' : 'No'}
                  </div>
                </div>
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                  item.value
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                    : item.warning
                    ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
                    : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                }`}>
                  {item.value ? <CheckCircle className="w-6 h-6" /> : item.warning ? <AlertCircle className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Lifecycle Tab */}
      {activeTab === 'lifecycle' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6"
        >
          <div className="flex items-center gap-2 mb-6">
            <Clock className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">User Lifecycle Timeline</h3>
          </div>
          {lifecycleEvents.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">No lifecycle events found</p>
          ) : (
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 to-indigo-500" />
              <div className="space-y-6">
                {lifecycleEvents.map((event, index) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative pl-12"
                  >
                    <div className="absolute left-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg">
                      {event.eventType.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="bg-gray-50 dark:bg-slate-700/50 p-4 rounded-xl">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">{event.eventName}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">{event.description}</div>
                          {event.actorName && (
                            <div className="text-xs text-gray-500 dark:text-gray-500 mt-1 flex items-center gap-1">
                              <User className="w-3 h-3" />
                              By: {event.actorName}
                            </div>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-500 whitespace-nowrap ml-4">
                          {formatDate(event.timestamp)}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Risk Tab */}
      {activeTab === 'risk' && (
        <div className="space-y-6">
          {!riskAssessment ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6"
            >
              <p className="text-gray-500 dark:text-gray-400 text-center">Loading risk assessment...</p>
            </motion.div>
          ) : (
            <>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6"
              >
                <div className="flex items-center gap-2 mb-6">
                  <AlertTriangle className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Risk Score</h3>
                </div>
                <div className="flex items-center gap-8">
                  <div className="relative w-32 h-32">
                    <svg className="w-32 h-32 transform -rotate-90">
                      <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-200 dark:text-slate-700" />
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke={
                          riskAssessment.riskLevel === 'critical' ? '#dc2626'
                          : riskAssessment.riskLevel === 'high' ? '#f59e0b'
                          : riskAssessment.riskLevel === 'medium' ? '#3b82f6'
                          : '#10b981'
                        }
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={`${(riskAssessment.riskScore / 100) * 352} 352`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-gray-900 dark:text-white">{riskAssessment.riskScore}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Risk Score</div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Risk Level</div>
                    <span className={`px-4 py-2 rounded-full text-lg font-semibold inline-block ${
                      riskAssessment.riskLevel === 'critical' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
                      : riskAssessment.riskLevel === 'high' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-400'
                      : riskAssessment.riskLevel === 'medium' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400'
                      : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                    }`}>
                      {riskAssessment.riskLevel.toUpperCase()}
                    </span>
                    <div className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                      Last assessed: {formatDate(riskAssessment.lastAssessedAt)}
                    </div>
                  </div>
                </div>
              </motion.div>

              {riskAssessment.factors && riskAssessment.factors.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6"
                >
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Risk Factors</h3>
                  <div className="space-y-4">
                    {riskAssessment.factors.map((factor, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl"
                      >
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 dark:text-white">{factor.factor}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">{factor.description}</div>
                        </div>
                        <div className="ml-4 text-right">
                          <span className="text-lg font-bold text-gray-900 dark:text-white">{factor.score}</span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">/100</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </>
          )}
        </div>
      )}

      {/* Access Packages Tab */}
      {activeTab === 'access-packages' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6"
        >
          <div className="flex items-center gap-2 mb-6">
            <Package className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Access Packages</h3>
          </div>
          {accessPackages.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">No access packages assigned</p>
          ) : (
            <div className="space-y-4">
              {accessPackages.map((pkg, index) => (
                <motion.div
                  key={pkg.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 border border-gray-200 dark:border-slate-700 rounded-xl bg-gray-50 dark:bg-slate-700/50"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">{pkg.name}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">{pkg.description}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                        Granted: {formatDate(pkg.grantedAt)}
                        {pkg.expiresAt && ` • Expires: ${formatDate(pkg.expiresAt)}`}
                      </div>
                      {pkg.resources.length > 0 && (
                        <div className="mt-3">
                          <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Resources:</div>
                          <div className="flex flex-wrap gap-2">
                            {pkg.resources.map((resource, idx) => (
                              <span key={idx} className="px-2 py-1 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-lg text-xs border border-gray-200 dark:border-slate-600">
                                {resource}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      pkg.status === 'active' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                      : pkg.status === 'expired' ? 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-400'
                      : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
                    }`}>
                      {pkg.status}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Privileged Sessions Tab */}
      {activeTab === 'privileged-sessions' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6"
        >
          <div className="flex items-center gap-2 mb-6">
            <Key className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Privileged Sessions</h3>
          </div>
          {privilegedSessions.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">No privileged sessions found</p>
          ) : (
            <div className="space-y-4">
              {privilegedSessions.map((session, index) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 border border-gray-200 dark:border-slate-700 rounded-xl bg-gray-50 dark:bg-slate-700/50"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 dark:text-white">{session.sessionType}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          session.status === 'active' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                          : session.status === 'completed' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400'
                          : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
                        }`}>
                          {session.status}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">{session.resourceName}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-500 mt-2 flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        Started: {formatDate(session.startedAt)}
                        {session.endedAt && ` • Ended: ${formatDate(session.endedAt)}`}
                        {session.duration && ` • Duration: ${session.duration}m`}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-500 flex items-center gap-2 mt-1">
                        <Globe className="w-3 h-3" />
                        IP: {session.ipAddress}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Audit Trail Tab */}
      {activeTab === 'audit-trail' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6"
        >
          <div className="flex items-center gap-2 mb-6">
            <FileText className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Audit Trail</h3>
          </div>
          {auditTrail.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">No audit entries found</p>
          ) : (
            <div className="space-y-4">
              {auditTrail.map((entry, index) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`border-l-4 pl-4 py-3 rounded-r-xl ${
                    entry.result === 'success'
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/10'
                      : 'border-red-500 bg-red-50 dark:bg-red-900/10'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 dark:text-white">{entry.action}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          entry.result === 'success'
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                            : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
                        }`}>
                          {entry.result}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {entry.resourceType}
                        {entry.resourceName && `: ${entry.resourceName}`}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-500 mt-2 flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        {formatDate(entry.timestamp)}
                        <span className="mx-2">•</span>
                        <Globe className="w-3 h-3" />
                        IP: {entry.ipAddress}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Profile"
        size="lg"
        footer={
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowEditModal(false)}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-slate-700 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors"
            >
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleUpdateProfile}
              disabled={saving}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {saving ? 'Saving...' : 'Save Changes'}
            </motion.button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">First Name</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Last Name</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone Number</label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
              placeholder="+1234567890"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
