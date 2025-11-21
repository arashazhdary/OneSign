'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { getTenantId } from '@/lib/tenant-context';
import LoadingOverlay from '@/app/components/LoadingOverlay';
import Modal from '@/app/components/Modal';
import StatusBadge from '@/app/components/StatusBadge';

interface UserProfile {
  id: string;
  tenantId: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  phoneNumber: string | null;
  profilePictureUrl: string | null;
  status: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  mfaEnabled: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
  customAttributes: Record<string, any>;
  roles: string[];
  groups: string[];
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
  userId: string;
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  lastAssessedAt: string;
  signals: RiskSignal[];
  factors: Array<{
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

export default function UserProfilePage() {
  const params = useParams();
  const userId = params.id as string;
  const t = useTranslations();
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Data states
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [lifecycleEvents, setLifecycleEvents] = useState<LifecycleEvent[]>([]);
  const [riskAssessment, setRiskAssessment] = useState<RiskAssessment | null>(null);
  const [accessPackages, setAccessPackages] = useState<AccessPackage[]>([]);
  const [privilegedSessions, setPrivilegedSessions] = useState<PrivilegedSession[]>([]);
  const [auditTrail, setAuditTrail] = useState<AuditTrailEntry[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Form states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const tenantId = getTenantId();

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  useEffect(() => {
    if (activeTab === 'activity') {
      fetchActivities();
    } else if (activeTab === 'lifecycle') {
      fetchLifecycleEvents();
    } else if (activeTab === 'risk') {
      fetchRiskAssessment();
    } else if (activeTab === 'access-packages') {
      fetchAccessPackages();
    } else if (activeTab === 'privileged-sessions') {
      fetchPrivilegedSessions();
    } else if (activeTab === 'audit-trail') {
      fetchAuditTrail();
    }
  }, [activeTab]);

  const fetchProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(
        `http://localhost:7000/api/tenant/users/${userId}/profile?tenantId=${tenantId}`,
        {
          credentials: 'include',
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }

      const data = await response.json();
      setProfile(data);
      setFirstName(data.firstName || '');
      setLastName(data.lastName || '');
      setDisplayName(data.displayName || '');
      setPhoneNumber(data.phoneNumber || '');
    } catch (err) {
      setError(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const fetchActivities = async () => {
    try {
      const response = await fetch(
        `http://localhost:7000/api/tenant/users/${userId}/activities?tenantId=${tenantId}&pageSize=50`,
        {
          credentials: 'include',
        }
      );

      if (response.ok) {
        const data = await response.json();
        setActivities(data);
      }
    } catch (err) {
      console.error('Failed to fetch activities:', err);
    }
  };

  const fetchLifecycleEvents = async () => {
    try {
      const response = await fetch(
        `http://localhost:7000/api/tenant/users/${userId}/lifecycle?tenantId=${tenantId}`,
        {
          credentials: 'include',
        }
      );

      if (response.ok) {
        const data = await response.json();
        setLifecycleEvents(data);
      }
    } catch (err) {
      console.error('Failed to fetch lifecycle events:', err);
    }
  };

  const fetchRiskAssessment = async () => {
    try {
      const response = await fetch(
        `http://localhost:7000/api/tenant/users/${userId}/risk-assessment?tenantId=${tenantId}`,
        {
          credentials: 'include',
        }
      );

      if (response.ok) {
        const data = await response.json();
        setRiskAssessment(data);
      }
    } catch (err) {
      console.error('Failed to fetch risk assessment:', err);
    }
  };

  const fetchAccessPackages = async () => {
    try {
      const response = await fetch(
        `http://localhost:7000/api/tenant/users/${userId}/access-packages?tenantId=${tenantId}`,
        {
          credentials: 'include',
        }
      );

      if (response.ok) {
        const data = await response.json();
        setAccessPackages(data);
      }
    } catch (err) {
      console.error('Failed to fetch access packages:', err);
    }
  };

  const fetchPrivilegedSessions = async () => {
    try {
      const response = await fetch(
        `http://localhost:7000/api/tenant/users/${userId}/privileged-sessions?tenantId=${tenantId}`,
        {
          credentials: 'include',
        }
      );

      if (response.ok) {
        const data = await response.json();
        setPrivilegedSessions(data);
      }
    } catch (err) {
      console.error('Failed to fetch privileged sessions:', err);
    }
  };

  const fetchAuditTrail = async () => {
    try {
      const response = await fetch(
        `http://localhost:7000/api/tenant/users/${userId}/audit-trail?tenantId=${tenantId}&pageSize=50`,
        {
          credentials: 'include',
        }
      );

      if (response.ok) {
        const data = await response.json();
        setAuditTrail(data);
      }
    } catch (err) {
      console.error('Failed to fetch audit trail:', err);
    }
  };

  const handleUpdateProfile = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const response = await fetch(
        `http://localhost:7000/api/tenant/users/${userId}/profile?tenantId=${tenantId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            firstName,
            lastName,
            displayName,
            phoneNumber: phoneNumber || null,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      setSuccess('Profile updated successfully');
      setShowEditModal(false);
      setIsEditMode(false);
      fetchProfile();
    } catch (err) {
      setError(t('common.error'));
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (loading) {
    return <LoadingOverlay isLoading={true} message="Loading user profile..." />;
  }

  if (!profile) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          User profile not found
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              User Profile
            </h1>
            <p className="text-gray-600 mt-2">{profile.email}</p>
          </div>
          <button
            onClick={() => setShowEditModal(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all"
          >
            Edit Profile
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200 overflow-x-auto">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'profile', label: 'Profile Information' },
            { key: 'activity', label: 'Activity History' },
            { key: 'security', label: 'Security' },
            { key: 'lifecycle', label: 'Lifecycle Timeline' },
            { key: 'risk', label: 'Risk Assessment' },
            { key: 'access-packages', label: 'Access Packages' },
            { key: 'privileged-sessions', label: 'Privileged Sessions' },
            { key: 'audit-trail', label: 'Audit Trail' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as Tab)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          {/* Profile Card */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-32"></div>
            <div className="px-8 pb-8">
              <div className="flex items-end -mt-16 mb-6">
                <div className="w-32 h-32 rounded-full border-4 border-white bg-gray-200 flex items-center justify-center text-4xl font-bold text-gray-600">
                  {profile.firstName?.[0]}{profile.lastName?.[0]}
                </div>
                <div className="ml-6 mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">{profile.displayName || 'N/A'}</h2>
                  <p className="text-gray-600">{profile.email}</p>
                  <div className="mt-2">
                    <StatusBadge status={profile.status} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <div className="text-gray-900">{profile.firstName || 'N/A'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <div className="text-gray-900">{profile.lastName || 'N/A'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <div className="text-gray-900">{profile.phoneNumber || 'N/A'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Login</label>
                  <div className="text-gray-900">{formatDate(profile.lastLoginAt)}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Created At</label>
                  <div className="text-gray-900">{formatDate(profile.createdAt)}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Updated At</label>
                  <div className="text-gray-900">{formatDate(profile.updatedAt)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Roles & Groups */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Roles</h3>
              {profile.roles.length === 0 ? (
                <p className="text-gray-500">No roles assigned</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {profile.roles.map((role) => (
                    <span
                      key={role}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {role}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Groups</h3>
              {profile.groups.length === 0 ? (
                <p className="text-gray-500">No groups assigned</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {profile.groups.map((group) => (
                    <span
                      key={group}
                      className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {group}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Activity Tab */}
      {activeTab === 'activity' && (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
            {activities.length === 0 ? (
              <p className="text-gray-500">No activities found</p>
            ) : (
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div key={activity.id} className="border-l-4 border-blue-500 pl-4 py-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-medium text-gray-900">{activity.activityType}</div>
                        <div className="text-sm text-gray-600">{activity.description}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          IP: {activity.ipAddress} • {formatDate(activity.occurredAt)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Security Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="text-sm text-gray-600">Email Verified</div>
                  <div className="text-lg font-semibold">
                    {profile.emailVerified ? (
                      <span className="text-green-600">Yes</span>
                    ) : (
                      <span className="text-red-600">No</span>
                    )}
                  </div>
                </div>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  profile.emailVerified ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {profile.emailVerified ? '✓' : '✗'}
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="text-sm text-gray-600">Phone Verified</div>
                  <div className="text-lg font-semibold">
                    {profile.phoneVerified ? (
                      <span className="text-green-600">Yes</span>
                    ) : (
                      <span className="text-red-600">No</span>
                    )}
                  </div>
                </div>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  profile.phoneVerified ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {profile.phoneVerified ? '✓' : '✗'}
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="text-sm text-gray-600">MFA Enabled</div>
                  <div className="text-lg font-semibold">
                    {profile.mfaEnabled ? (
                      <span className="text-green-600">Yes</span>
                    ) : (
                      <span className="text-yellow-600">No</span>
                    )}
                  </div>
                </div>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  profile.mfaEnabled ? 'bg-green-100' : 'bg-yellow-100'
                }`}>
                  {profile.mfaEnabled ? '✓' : '!'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lifecycle Timeline Tab */}
      {activeTab === 'lifecycle' && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">User Lifecycle Timeline</h3>
          {lifecycleEvents.length === 0 ? (
            <p className="text-gray-500">No lifecycle events found</p>
          ) : (
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
              <div className="space-y-6">
                {lifecycleEvents.map((event) => (
                  <div key={event.id} className="relative pl-12">
                    <div className="absolute left-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {event.eventType.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-medium text-gray-900">{event.eventName}</div>
                          <div className="text-sm text-gray-600 mt-1">{event.description}</div>
                          {event.actorName && (
                            <div className="text-xs text-gray-500 mt-1">By: {event.actorName}</div>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 whitespace-nowrap ml-4">
                          {formatDate(event.timestamp)}
                        </div>
                      </div>
                      {event.metadata && Object.keys(event.metadata).length > 0 && (
                        <details className="mt-2">
                          <summary className="text-xs text-blue-600 cursor-pointer">View details</summary>
                          <pre className="text-xs bg-white p-2 rounded mt-1 overflow-auto">
                            {JSON.stringify(event.metadata, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Risk Assessment Tab */}
      {activeTab === 'risk' && (
        <div className="space-y-6">
          {!riskAssessment ? (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <p className="text-gray-500">Loading risk assessment...</p>
            </div>
          ) : (
            <>
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Risk Score</h3>
                <div className="flex items-center gap-6">
                  <div className="relative w-32 h-32">
                    <svg className="w-32 h-32 transform -rotate-90">
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="#e5e7eb"
                        strokeWidth="8"
                        fill="transparent"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke={
                          riskAssessment.riskLevel === 'critical'
                            ? '#dc2626'
                            : riskAssessment.riskLevel === 'high'
                            ? '#f59e0b'
                            : riskAssessment.riskLevel === 'medium'
                            ? '#3b82f6'
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
                        <div className="text-3xl font-bold">{riskAssessment.riskScore}</div>
                        <div className="text-xs text-gray-500">Risk Score</div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-2">Risk Level</div>
                    <span
                      className={`px-4 py-2 rounded-full text-lg font-semibold inline-block ${
                        riskAssessment.riskLevel === 'critical'
                          ? 'bg-red-100 text-red-800'
                          : riskAssessment.riskLevel === 'high'
                          ? 'bg-orange-100 text-orange-800'
                          : riskAssessment.riskLevel === 'medium'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {riskAssessment.riskLevel.toUpperCase()}
                    </span>
                    <div className="text-xs text-gray-500 mt-2">
                      Last assessed: {formatDate(riskAssessment.lastAssessedAt)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Risk Factors</h3>
                <div className="space-y-4">
                  {riskAssessment.factors.map((factor, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{factor.factor}</div>
                        <div className="text-sm text-gray-600 mt-1">{factor.description}</div>
                      </div>
                      <div className="ml-4">
                        <span className="text-lg font-bold text-gray-900">{factor.score}</span>
                        <span className="text-sm text-gray-500">/100</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Risk Signals</h3>
                {riskAssessment.signals.length === 0 ? (
                  <p className="text-gray-500">No active risk signals</p>
                ) : (
                  <div className="space-y-4">
                    {riskAssessment.signals.map((signal) => (
                      <div
                        key={signal.id}
                        className={`p-4 border-l-4 rounded-lg ${
                          signal.severity === 'critical'
                            ? 'border-red-500 bg-red-50'
                            : signal.severity === 'high'
                            ? 'border-orange-500 bg-orange-50'
                            : signal.severity === 'medium'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-green-500 bg-green-50'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900">{signal.type}</span>
                              <span
                                className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                  signal.status === 'active'
                                    ? 'bg-red-100 text-red-800'
                                    : signal.status === 'resolved'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}
                              >
                                {signal.status}
                              </span>
                            </div>
                            <div className="text-sm text-gray-600 mt-1">{signal.description}</div>
                            <div className="text-xs text-gray-500 mt-1">
                              Detected: {formatDate(signal.detectedAt)}
                            </div>
                          </div>
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              signal.severity === 'critical'
                                ? 'bg-red-200 text-red-900'
                                : signal.severity === 'high'
                                ? 'bg-orange-200 text-orange-900'
                                : signal.severity === 'medium'
                                ? 'bg-blue-200 text-blue-900'
                                : 'bg-green-200 text-green-900'
                            }`}
                          >
                            {signal.severity.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* Access Packages Tab */}
      {activeTab === 'access-packages' && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Access Packages</h3>
          {accessPackages.length === 0 ? (
            <p className="text-gray-500">No access packages assigned</p>
          ) : (
            <div className="space-y-4">
              {accessPackages.map((pkg) => (
                <div key={pkg.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-medium text-gray-900">{pkg.name}</div>
                      <div className="text-sm text-gray-600 mt-1">{pkg.description}</div>
                      <div className="text-xs text-gray-500 mt-2">
                        Granted: {formatDate(pkg.grantedAt)}
                        {pkg.expiresAt && ` • Expires: ${formatDate(pkg.expiresAt)}`}
                      </div>
                      {pkg.resources.length > 0 && (
                        <div className="mt-2">
                          <div className="text-xs font-medium text-gray-700 mb-1">Resources:</div>
                          <div className="flex flex-wrap gap-1">
                            {pkg.resources.map((resource, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                              >
                                {resource}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        pkg.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : pkg.status === 'expired'
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {pkg.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Privileged Sessions Tab */}
      {activeTab === 'privileged-sessions' && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Privileged Sessions</h3>
          {privilegedSessions.length === 0 ? (
            <p className="text-gray-500">No privileged sessions found</p>
          ) : (
            <div className="space-y-4">
              {privilegedSessions.map((session) => (
                <div key={session.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{session.sessionType}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            session.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : session.status === 'completed'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {session.status}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">{session.resourceName}</div>
                      <div className="text-xs text-gray-500 mt-2">
                        Started: {formatDate(session.startedAt)}
                        {session.endedAt && ` • Ended: ${formatDate(session.endedAt)}`}
                        {session.duration && ` • Duration: ${session.duration}m`}
                      </div>
                      <div className="text-xs text-gray-500">IP: {session.ipAddress}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Audit Trail Tab */}
      {activeTab === 'audit-trail' && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Audit Trail</h3>
          {auditTrail.length === 0 ? (
            <p className="text-gray-500">No audit entries found</p>
          ) : (
            <div className="space-y-4">
              {auditTrail.map((entry) => (
                <div
                  key={entry.id}
                  className={`border-l-4 pl-4 py-2 ${
                    entry.result === 'success' ? 'border-green-500' : 'border-red-500'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{entry.action}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            entry.result === 'success'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {entry.result}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {entry.resourceType}
                        {entry.resourceName && `: ${entry.resourceName}`}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {formatDate(entry.timestamp)} • IP: {entry.ipAddress}
                      </div>
                      {entry.details && Object.keys(entry.details).length > 0 && (
                        <details className="mt-2">
                          <summary className="text-xs text-blue-600 cursor-pointer">View details</summary>
                          <pre className="text-xs bg-gray-50 p-2 rounded mt-1 overflow-auto">
                            {JSON.stringify(entry.details, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Profile"
        size="lg"
        footer={
          <>
            <button
              onClick={() => setShowEditModal(false)}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdateProfile}
              disabled={saving}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="+1234567890"
            />
          </div>
        </div>
      </Modal>

      <LoadingOverlay isLoading={saving} message="Saving changes..." />
    </div>
  );
}
