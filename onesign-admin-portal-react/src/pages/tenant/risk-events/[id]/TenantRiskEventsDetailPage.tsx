import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { getTenantId } from '@/lib/tenant-context';
import LoadingOverlay from '@/app/components/LoadingOverlay';
import StatusBadge from '@/app/components/StatusBadge';
import { securityService } from '@/lib/api/services/security.service';
import { Helmet } from 'react-helmet-async';

interface RiskEvent {
  id: string;
  tenantId: string;
  userId: string;
  userEmail: string;
  userName: string;
  eventType: string;
  riskScore: number;
  riskLevel: string;
  factors: RiskFactor[];
  ipAddress: string;
  location: string;
  deviceId: string | null;
  deviceFingerprint: string | null;
  userAgent: string;
  detectedAt: string;
  resolvedAt: string | null;
  status: string;
  metadata: Record<string, any>;
}

interface RiskFactor {
  factorType: string;
  factorValue: string;
  weight: number;
  description: string;
}

interface TimelineEvent {
  id: string;
  eventType: string;
  description: string;
  occurredAt: string;
  userId: string | null;
  userName: string | null;
  metadata: Record<string, any>;
}

type Tab = 'overview' | 'factors' | 'timeline' | 'metadata';

export default function TenantRiskEventsDetailPage() {
  const params = useParams();
  const navigate = useNavigate();
  const eventId = params.id as string;
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Data states
  const [riskEvent, setRiskEvent] = useState<RiskEvent | null>(null);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);

  const tenantId = getTenantId();

  useEffect(() => {
    fetchRiskEvent();
  }, [eventId]);

  useEffect(() => {
    if (activeTab === 'timeline') {
      fetchTimeline();
    }
  }, [activeTab]);

  const fetchRiskEvent = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await securityService.getRiskEventById(tenantId, eventId);
      setRiskEvent(data);
    } catch (err) {
      setError(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const fetchTimeline = async () => {
    try {
      const data = await securityService.getRiskEventTimeline(tenantId, eventId);
      setTimeline(data);
    } catch (err) {
      console.error('Failed to fetch timeline:', err);
    }
  };

  const handleResolve = async () => {
    setProcessing(true);
    setError('');
    setSuccess('');
    try {
      await securityService.resolveRiskEvent(tenantId, eventId);

      setSuccess('Risk event resolved successfully');
      fetchRiskEvent();
      if (activeTab === 'timeline') fetchTimeline();
    } catch (err) {
      setError(t('common.error'));
    } finally {
      setProcessing(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getRiskLevelBadge = (level: string) => {
    const levels: Record<string, { className: string }> = {
      low: { className: 'bg-green-100 text-green-800' },
      medium: { className: 'bg-yellow-100 text-yellow-800' },
      high: { className: 'bg-orange-100 text-orange-800' },
      critical: { className: 'bg-red-100 text-red-800' },
    };
    const levelInfo = levels[level.toLowerCase()] || levels.low;
    return (
      <span className={`px-3 py-1 text-sm font-semibold rounded-full capitalize ${levelInfo.className}`}>
        {level}
      </span>
    );
  };

  const getRiskScoreColor = (score: number) => {
    if (score >= 80) return 'text-red-600';
    if (score >= 60) return 'text-orange-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getRiskScoreBarColor = (score: number) => {
    if (score >= 80) return 'bg-red-600';
    if (score >= 60) return 'bg-orange-600';
    if (score >= 40) return 'bg-yellow-600';
    return 'bg-green-600';
  };

  if (loading) {
    return ;
  }

  if (!riskEvent) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          Risk event not found
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="text-blue-600 hover:text-blue-800 mb-4 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Risk Events
        </button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
              Risk Event Details
            </h1>
            <p className="text-gray-600 mt-2">{riskEvent.eventType}</p>
          </div>
          <div className="flex gap-3 items-center">
            {getRiskLevelBadge(riskEvent.riskLevel)}
            <StatusBadge status={riskEvent.status} />
          </div>
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

      {/* Risk Score Card */}
      <div className="mb-6 bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Risk Score</h2>
          <div className={`text-5xl font-bold ${getRiskScoreColor(riskEvent.riskScore)}`}>
            {riskEvent.riskScore}
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div
            className={`h-4 rounded-full transition-all ${getRiskScoreBarColor(riskEvent.riskScore)}`}
            style={{ width: `${riskEvent.riskScore}%` }}
          ></div>
        </div>
      </div>

      {/* Action Buttons */}
      {riskEvent.status.toLowerCase() !== 'resolved' && (
        <div className="mb-6">
          <button
            onClick={handleResolve}
            disabled={processing}
            className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
          >
            {processing ? 'Resolving...' : 'Mark as Resolved'}
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {(['overview', 'factors', 'timeline', 'metadata'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-1 border-b-2 font-medium text-sm capitalize transition-colors ${
                activeTab === tab
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* User Information */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">User Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">User Name</label>
                <div className="text-gray-900">{riskEvent.userName}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <div className="text-gray-900">{riskEvent.userEmail}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
                <div className="text-gray-900 font-mono text-sm">{riskEvent.userId}</div>
              </div>
            </div>
          </div>

          {/* Event Information */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Event Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Type</label>
                <div className="text-gray-900">{riskEvent.eventType}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Detected At</label>
                <div className="text-gray-900">{formatDate(riskEvent.detectedAt)}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">IP Address</label>
                <div className="text-gray-900 font-mono text-sm">{riskEvent.ipAddress}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <div className="text-gray-900">{riskEvent.location}</div>
              </div>
              {riskEvent.deviceId && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Device ID</label>
                  <div className="text-gray-900 font-mono text-sm">{riskEvent.deviceId}</div>
                </div>
              )}
              {riskEvent.resolvedAt && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Resolved At</label>
                  <div className="text-gray-900">{formatDate(riskEvent.resolvedAt)}</div>
                </div>
              )}
            </div>
          </div>

          {/* Device Information */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Device Information</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">User Agent</label>
                <div className="text-gray-900 text-sm break-all bg-gray-50 p-3 rounded">
                  {riskEvent.userAgent}
                </div>
              </div>
              {riskEvent.deviceFingerprint && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Device Fingerprint</label>
                  <div className="text-gray-900 text-sm font-mono bg-gray-50 p-3 rounded">
                    {riskEvent.deviceFingerprint}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Factors Tab */}
      {activeTab === 'factors' && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Risk Factors</h3>
          {riskEvent.factors.length === 0 ? (
            <p className="text-gray-500">No risk factors identified</p>
          ) : (
            <div className="space-y-4">
              {riskEvent.factors.map((factor, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{factor.factorType}</div>
                      <div className="text-sm text-gray-600 mt-1">{factor.description}</div>
                    </div>
                    <div className="ml-4">
                      <div className="text-right">
                        <div className="text-xs text-gray-500">Weight</div>
                        <div className="text-lg font-bold text-gray-900">{factor.weight}</div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="text-xs text-gray-500 mb-1">Value</div>
                    <div className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                      {factor.factorValue}
                    </div>
                  </div>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-red-600 h-2 rounded-full"
                      style={{ width: `${factor.weight}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Timeline Tab */}
      {activeTab === 'timeline' && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Timeline</h3>
          {timeline.length === 0 ? (
            <p className="text-gray-500">No timeline events</p>
          ) : (
            <div className="space-y-4">
              {timeline.map((event) => (
                <div key={event.id} className="flex items-start gap-4 border-l-4 border-red-500 pl-4 py-2">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{event.eventType}</div>
                    <div className="text-sm text-gray-600">{event.description}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {formatDate(event.occurredAt)}
                      {event.userName && ` by ${event.userName}`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Metadata Tab */}
      {activeTab === 'metadata' && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Additional Metadata</h3>
          {Object.keys(riskEvent.metadata).length === 0 ? (
            <p className="text-gray-500">No additional metadata</p>
          ) : (
            <div className="bg-gray-50 rounded-lg p-4">
              <pre className="text-sm text-gray-900 overflow-x-auto">
                {JSON.stringify(riskEvent.metadata, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}

      
    </div>
  );
}
