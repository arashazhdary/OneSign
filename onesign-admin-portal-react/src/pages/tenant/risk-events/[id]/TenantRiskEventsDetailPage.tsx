import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getTenantId } from '@/lib/tenant-context';
import { securityService } from '@/lib/api/services/security.service';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  AlertTriangle,
  User,
  MapPin,
  Monitor,
  Clock,
  Shield,
  CheckCircle,
  XCircle,
  Eye,
  BarChart3,
  FileText,
  RefreshCw,
  Target,
  Wifi,
  Globe,
  Fingerprint,
  AlertOctagon,
} from 'lucide-react';

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

const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
  { key: 'overview', label: 'Overview', icon: Eye },
  { key: 'factors', label: 'Factors', icon: Target },
  { key: 'timeline', label: 'Timeline', icon: Clock },
  { key: 'metadata', label: 'Metadata', icon: FileText },
];

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  delay: number;
}

const StatCard = ({ title, value, icon, color, delay }: StatCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: delay * 0.1 }}
    className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6 hover:shadow-xl transition-all duration-300"
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
      </div>
      <div className={`p-4 rounded-xl bg-gradient-to-br ${color}`}>{icon}</div>
    </div>
  </motion.div>
);

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
      const data: RiskEvent = {
        id: eventId,
        tenantId: tenantId,
        userId: 'user-123',
        userEmail: 'user@example.com',
        userName: 'John Doe',
        eventType: 'Suspicious Login',
        riskScore: 75,
        riskLevel: 'high',
        factors: [
          { factorType: 'New Location', factorValue: 'Toronto, CA', weight: 40, description: 'Login from new location' },
          { factorType: 'Unusual Time', factorValue: '3:00 AM', weight: 30, description: 'Login at unusual time' },
          { factorType: 'New Device', factorValue: 'Chrome on Windows', weight: 20, description: 'New device detected' },
          { factorType: 'Failed Attempts', factorValue: '3 attempts', weight: 10, description: 'Multiple failed login attempts' },
        ],
        ipAddress: '192.168.1.100',
        location: 'Toronto, Canada',
        deviceId: 'device-123',
        deviceFingerprint: 'fp-abc123def456',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        detectedAt: new Date().toISOString(),
        resolvedAt: null,
        status: 'pending',
        metadata: { source: 'security-engine', version: '1.0', confidence: 0.85 },
      };
      setRiskEvent(data);
    } catch (err) {
      setError(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const fetchTimeline = async () => {
    try {
      const data: TimelineEvent[] = [
        {
          id: '1',
          eventType: 'Event Detected',
          description: 'Risk event was detected by the security engine',
          occurredAt: new Date(Date.now() - 3600000).toISOString(),
          userId: null,
          userName: null,
          metadata: { source: 'security-engine' },
        },
        {
          id: '2',
          eventType: 'Alert Sent',
          description: 'Alert notification sent to security team',
          occurredAt: new Date(Date.now() - 3500000).toISOString(),
          userId: null,
          userName: null,
          metadata: { channel: 'email' },
        },
        {
          id: '3',
          eventType: 'Admin Review',
          description: 'Event reviewed by security administrator',
          occurredAt: new Date(Date.now() - 1800000).toISOString(),
          userId: 'admin-user-1',
          userName: 'Security Admin',
          metadata: { reviewer: 'security-team' },
        },
      ];
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
      await new Promise(resolve => setTimeout(resolve, 500));
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

  const getRiskLevelConfig = (level: string) => {
    const configs: Record<string, { text: string; bgClass: string; color: string }> = {
      low: { text: 'Low', bgClass: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', color: 'text-green-600' },
      medium: { text: 'Medium', bgClass: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', color: 'text-yellow-600' },
      high: { text: 'High', bgClass: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400', color: 'text-orange-600' },
      critical: { text: 'Critical', bgClass: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', color: 'text-red-600' },
    };
    return configs[level.toLowerCase()] || configs.low;
  };

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { text: string; bgClass: string }> = {
      pending: { text: 'Pending', bgClass: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
      resolved: { text: 'Resolved', bgClass: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
      dismissed: { text: 'Dismissed', bgClass: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' },
    };
    return configs[status.toLowerCase()] || configs.pending;
  };

  const getRiskScoreColor = (score: number) => {
    if (score >= 80) return 'text-red-600';
    if (score >= 60) return 'text-orange-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getRiskScoreBarColor = (score: number) => {
    if (score >= 80) return 'from-red-500 to-red-600';
    if (score >= 60) return 'from-orange-500 to-orange-600';
    if (score >= 40) return 'from-yellow-500 to-yellow-600';
    return 'from-green-500 to-green-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-rose-50 to-red-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-8">
        <div className="flex items-center justify-center h-64">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <RefreshCw className="w-8 h-8 text-rose-600" />
          </motion.div>
        </div>
      </div>
    );
  }

  if (!riskEvent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-rose-50 to-red-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-8">
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl">
          Risk event not found
        </div>
      </div>
    );
  }

  const riskLevelConfig = getRiskLevelConfig(riskEvent.riskLevel);
  const statusConfig = getStatusConfig(riskEvent.status);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-rose-50 to-red-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Helmet>
        <title>Risk Event - {riskEvent.eventType}</title>
      </Helmet>

      <div className="p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <motion.button
            whileHover={{ x: -4 }}
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 mb-4 font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Risk Events
          </motion.button>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-rose-500 to-red-600 shadow-lg">
                <AlertOctagon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-rose-600 to-red-600 bg-clip-text text-transparent">
                  Risk Event Details
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">{riskEvent.eventType}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${riskLevelConfig.bgClass}`}>
                    {riskLevelConfig.text} Risk
                  </span>
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${statusConfig.bgClass}`}>
                    {statusConfig.text}
                  </span>
                </div>
              </div>
            </div>

            {riskEvent.status.toLowerCase() !== 'resolved' && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleResolve}
                disabled={processing}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
              >
                <CheckCircle className="w-5 h-5" />
                {processing ? 'Resolving...' : 'Mark as Resolved'}
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* Alerts */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl flex items-center gap-3"
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
              className="mb-6 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 px-4 py-3 rounded-xl flex items-center gap-3"
            >
              <CheckCircle className="w-5 h-5" />
              {success}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Risk Score Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 bg-gradient-to-r from-rose-50 to-red-50 dark:from-slate-800 dark:to-slate-800 rounded-2xl shadow-lg border border-rose-200 dark:border-slate-700 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-rose-500" />
              Risk Score
            </h2>
            <div className={`text-5xl font-bold ${getRiskScoreColor(riskEvent.riskScore)}`}>
              {riskEvent.riskScore}
            </div>
          </div>
          <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-4 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${riskEvent.riskScore}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={`h-4 rounded-full bg-gradient-to-r ${getRiskScoreBarColor(riskEvent.riskScore)}`}
            />
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="User"
            value={riskEvent.userName}
            icon={<User className="w-6 h-6 text-white" />}
            color="from-blue-500 to-blue-600"
            delay={0}
          />
          <StatCard
            title="Location"
            value={riskEvent.location}
            icon={<MapPin className="w-6 h-6 text-white" />}
            color="from-purple-500 to-purple-600"
            delay={1}
          />
          <StatCard
            title="IP Address"
            value={riskEvent.ipAddress}
            icon={<Globe className="w-6 h-6 text-white" />}
            color="from-rose-500 to-rose-600"
            delay={2}
          />
          <StatCard
            title="Risk Factors"
            value={riskEvent.factors.length}
            icon={<Target className="w-6 h-6 text-white" />}
            color="from-orange-500 to-orange-600"
            delay={3}
          />
        </div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 mb-6"
        >
          <nav className="flex p-2">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`relative flex items-center gap-2 py-3 px-6 rounded-lg font-medium transition-all ${
                  activeTab === tab.key
                    ? 'text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700'
                }`}
              >
                {activeTab === tab.key && (
                  <motion.div
                    layoutId="activeRiskEventTab"
                    className="absolute inset-0 bg-gradient-to-r from-rose-500 to-red-600 rounded-lg"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <tab.icon className="w-4 h-4 relative z-10" />
                <span className="relative z-10">{tab.label}</span>
              </button>
            ))}
          </nav>
        </motion.div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-rose-500" />
                  User Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">User Name</label>
                    <div className="text-gray-900 dark:text-white">{riskEvent.userName}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Email</label>
                    <div className="text-gray-900 dark:text-white">{riskEvent.userEmail}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">User ID</label>
                    <div className="text-gray-900 dark:text-white font-mono text-sm">{riskEvent.userId}</div>
                  </div>
                </div>
              </div>

              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-rose-500" />
                  Event Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Event Type</label>
                    <div className="text-gray-900 dark:text-white">{riskEvent.eventType}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Detected At</label>
                    <div className="text-gray-900 dark:text-white flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {formatDate(riskEvent.detectedAt)}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">IP Address</label>
                    <div className="text-gray-900 dark:text-white font-mono text-sm flex items-center gap-1">
                      <Wifi className="w-4 h-4" />
                      {riskEvent.ipAddress}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Location</label>
                    <div className="text-gray-900 dark:text-white flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {riskEvent.location}
                    </div>
                  </div>
                  {riskEvent.resolvedAt && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Resolved At</label>
                      <div className="text-gray-900 dark:text-white">{formatDate(riskEvent.resolvedAt)}</div>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Monitor className="w-5 h-5 text-rose-500" />
                  Device Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">User Agent</label>
                    <div className="text-gray-900 dark:text-white text-sm break-all bg-gray-50 dark:bg-slate-700 p-3 rounded-lg">
                      {riskEvent.userAgent}
                    </div>
                  </div>
                  {riskEvent.deviceFingerprint && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Device Fingerprint</label>
                      <div className="text-gray-900 dark:text-white text-sm font-mono bg-gray-50 dark:bg-slate-700 p-3 rounded-lg flex items-center gap-2">
                        <Fingerprint className="w-4 h-4" />
                        {riskEvent.deviceFingerprint}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'factors' && (
            <motion.div
              key="factors"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-rose-500" />
                Risk Factors
              </h3>
              {riskEvent.factors.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">No risk factors identified</p>
              ) : (
                <div className="space-y-4">
                  {riskEvent.factors.map((factor, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border border-gray-200 dark:border-slate-600 rounded-xl p-4"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-rose-500" />
                            <span className="font-medium text-gray-900 dark:text-white">{factor.factorType}</span>
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">{factor.description}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-gray-500 dark:text-gray-400">Weight</div>
                          <div className="text-2xl font-bold text-rose-600">{factor.weight}</div>
                        </div>
                      </div>
                      <div className="mt-3">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Value</div>
                        <div className="text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-slate-700 p-2 rounded">
                          {factor.factorValue}
                        </div>
                      </div>
                      <div className="mt-3 w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${factor.weight}%` }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                          className="bg-gradient-to-r from-rose-500 to-red-600 h-2 rounded-full"
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'timeline' && (
            <motion.div
              key="timeline"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-rose-500" />
                Timeline
              </h3>
              {timeline.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">No timeline events</p>
              ) : (
                <div className="space-y-4">
                  {timeline.map((event, index) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-4 border-l-4 border-rose-500 pl-4 py-2"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 dark:text-white">{event.eventType}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">{event.description}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-500 mt-1 flex items-center gap-2">
                          <Clock className="w-3 h-3" />
                          {formatDate(event.occurredAt)}
                          {event.userName && (
                            <>
                              <User className="w-3 h-3 ml-2" />
                              {event.userName}
                            </>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'metadata' && (
            <motion.div
              key="metadata"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-rose-500" />
                Additional Metadata
              </h3>
              {Object.keys(riskEvent.metadata).length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">No additional metadata</p>
              ) : (
                <div className="bg-gray-50 dark:bg-slate-700 rounded-xl p-4">
                  <pre className="text-sm text-gray-900 dark:text-white overflow-x-auto font-mono">
                    {JSON.stringify(riskEvent.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
