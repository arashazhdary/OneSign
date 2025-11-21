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

type Tab = 'profile' | 'activity' | 'security';

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
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'profile'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Profile Information
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'activity'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Activity History
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'security'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Security
          </button>
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
