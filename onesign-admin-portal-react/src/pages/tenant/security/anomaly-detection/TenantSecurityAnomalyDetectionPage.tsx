import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getTenantId } from '@/lib/tenant-context';
import { useAuth } from '@/app/contexts/AuthContext';
import DataTable, { Column } from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import Modal from '@/components/common/Modal';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldAlert,
  Plus,
  Eye,
  Trash2,
  Power,
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  Brain,
  Activity,
  TrendingUp,
  Search,
  Settings,
  XCircle
} from 'lucide-react';

interface ThreatDetection {
  id: string;
  tenantId: string;
  detectionType: string;
  name: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  isEnabled: boolean;
  detectionRules: DetectionRule[];
  alertChannels: string[];
}

interface DetectionRule {
  id: string;
  condition: string;
  threshold: number;
  timeWindow: number;
}

interface DetectedAnomaly {
  id: string;
  detectionId: string;
  detectionName: string;
  userId?: string;
  userName?: string;
  timestamp: string;
  severity: string;
  description: string;
  riskScore: number;
  status: 'new' | 'investigating' | 'false_positive' | 'confirmed' | 'resolved';
  details: Record<string, any>;
  resolution?: string;
}

interface MLModelConfig {
  id: string;
  modelType: 'behavioral' | 'statistical' | 'ml_based';
  isEnabled: boolean;
  sensitivity: number;
  features: string[];
  lastTrained?: string;
  accuracy?: number;
}

type Tab = 'detections' | 'anomalies' | 'false-positives' | 'ml-config';

const tabs = [
  { key: 'detections', label: 'Detection Rules', icon: <ShieldAlert className="w-4 h-4" /> },
  { key: 'anomalies', label: 'Anomalies', icon: <AlertTriangle className="w-4 h-4" /> },
  { key: 'false-positives', label: 'False Positives', icon: <XCircle className="w-4 h-4" /> },
  { key: 'ml-config', label: 'ML Config', icon: <Brain className="w-4 h-4" /> },
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
        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
      </div>
      <div className={`p-4 rounded-xl bg-gradient-to-br ${color}`}>{icon}</div>
    </div>
  </motion.div>
);

export default function TenantSecurityAnomalyDetectionPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [tenantId, setTenantIdState] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('detections');

  const [detections, setDetections] = useState<ThreatDetection[]>([]);
  const [anomalies, setAnomalies] = useState<DetectedAnomaly[]>([]);
  const [falsePositives, setFalsePositives] = useState<DetectedAnomaly[]>([]);
  const [mlConfig, setMlConfig] = useState<MLModelConfig[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [createForm, setCreateForm] = useState({
    name: '',
    description: '',
    detectionType: 'behavioral_anomaly',
    severity: 'medium' as const,
  });

  useEffect(() => {
    const contextTenantId = getTenantId();
    setTenantIdState(contextTenantId || '00000000-0000-0000-0000-000000000000');
  }, []);

  useEffect(() => {
    if (tenantId) {
      if (activeTab === 'detections') fetchDetections();
      else if (activeTab === 'anomalies') fetchAnomalies();
      else if (activeTab === 'false-positives') fetchFalsePositives();
      else if (activeTab === 'ml-config') fetchMLConfig();
    }
  }, [tenantId, activeTab]);

  const fetchDetections = async () => {
    setLoading(true);
    try {
      setDetections([
        { id: '1', tenantId: tenantId || '', detectionType: 'behavioral_anomaly', name: 'Unusual Login Activity', description: 'Detects login attempts from unusual locations', severity: 'high', isEnabled: true, detectionRules: [{ id: '1', condition: 'login_from_new_location', threshold: 3, timeWindow: 3600 }], alertChannels: ['email', 'slack'] },
        { id: '2', tenantId: tenantId || '', detectionType: 'statistical_anomaly', name: 'Data Exfiltration Detection', description: 'Monitors for unusual data access patterns', severity: 'critical', isEnabled: true, detectionRules: [{ id: '2', condition: 'large_data_download', threshold: 100, timeWindow: 1800 }], alertChannels: ['email'] },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnomalies = async () => {
    setAnomalies([
      { id: '1', detectionId: '1', detectionName: 'Unusual Login Activity', userId: 'user123', userName: 'John Doe', timestamp: new Date().toISOString(), severity: 'high', description: 'Login from unusual location: Tokyo, Japan', riskScore: 85, status: 'new', details: { location: 'Tokyo, Japan', ipAddress: '123.45.67.89' } },
      { id: '2', detectionId: '1', detectionName: 'Unusual Login Activity', userId: 'user456', userName: 'Jane Smith', timestamp: new Date(Date.now() - 3600000).toISOString(), severity: 'medium', description: 'Multiple failed login attempts', riskScore: 65, status: 'investigating', details: { failedAttempts: 7 } },
    ]);
  };

  const fetchFalsePositives = async () => {
    setFalsePositives([
      { id: '3', detectionId: '1', detectionName: 'Unusual Login Activity', userName: 'Bob Johnson', timestamp: new Date(Date.now() - 86400000).toISOString(), severity: 'low', description: 'Login from new device', riskScore: 45, status: 'false_positive', details: { device: 'iPhone 15 Pro' }, resolution: 'User confirmed new device' },
    ]);
  };

  const fetchMLConfig = async () => {
    setMlConfig([
      { id: '1', modelType: 'behavioral', isEnabled: true, sensitivity: 75, features: ['login_location', 'login_time', 'access_patterns'], lastTrained: '2024-11-15', accuracy: 92.5 },
      { id: '2', modelType: 'statistical', isEnabled: true, sensitivity: 85, features: ['api_usage', 'data_access'], lastTrained: '2024-11-10', accuracy: 88.3 },
    ]);
  };

  const handleCreateDetection = async () => {
    setLoading(true);
    try {
      setSuccess('Detection rule created successfully');
      setShowCreateModal(false);
      setCreateForm({ name: '', description: '', detectionType: 'behavioral_anomaly', severity: 'medium' });
      fetchDetections();
    } finally {
      setLoading(false);
    }
  };

  const handleToggleDetection = async (id: string, isEnabled: boolean) => {
    setSuccess(`Detection ${!isEnabled ? 'enabled' : 'disabled'} successfully`);
    fetchDetections();
  };

  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      critical: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300',
      high: 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300',
      medium: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300',
      low: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
    };
    return colors[severity] || colors.medium;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-orange-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 p-8">
      <Helmet><title>Anomaly Detection - OneSign</title></Helmet>

      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-red-500 to-orange-600 shadow-lg">
            <ShieldAlert className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Anomaly Detection</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Detect and respond to security threats</p>
          </div>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-orange-600 text-white px-6 py-3 rounded-xl hover:shadow-lg font-medium">
          <Plus className="w-5 h-5" />Create Rule
        </motion.button>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard title="Active Rules" value={detections.filter(d => d.isEnabled).length} icon={<ShieldAlert className="w-6 h-6 text-white" />} color="from-red-500 to-red-600" delay={0} />
        <StatCard title="New Anomalies" value={anomalies.filter(a => a.status === 'new').length} icon={<AlertTriangle className="w-6 h-6 text-white" />} color="from-orange-500 to-amber-600" delay={1} />
        <StatCard title="Investigating" value={anomalies.filter(a => a.status === 'investigating').length} icon={<Search className="w-6 h-6 text-white" />} color="from-blue-500 to-blue-600" delay={2} />
        <StatCard title="ML Models" value={mlConfig.filter(m => m.isEnabled).length} icon={<Brain className="w-6 h-6 text-white" />} color="from-purple-500 to-purple-600" delay={3} />
      </div>

      <AnimatePresence>
        {error && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl flex items-center gap-2"><AlertCircle className="w-5 h-5" />{error}</motion.div>}
        {success && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-xl flex items-center gap-2"><CheckCircle className="w-5 h-5" />{success}</motion.div>}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-xl p-2 shadow-lg border border-gray-200 dark:border-slate-700">
        <nav className="flex space-x-2">
          {tabs.map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key as Tab)} className={`relative flex-1 py-3 px-4 rounded-lg font-medium transition-all ${activeTab === tab.key ? 'text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700'}`}>
              {activeTab === tab.key && <motion.div layoutId="activeAnomalyTab" className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-600 rounded-lg" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />}
              <span className="relative z-10 flex items-center justify-center gap-2">{tab.icon}{tab.label}</span>
            </button>
          ))}
        </nav>
      </motion.div>

      {activeTab === 'detections' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {detections.map((detection, index) => (
            <motion.div key={detection.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{detection.name}</h3>
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${getSeverityColor(detection.severity)}`}>{detection.severity}</span>
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${detection.isEnabled ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'}`}>
                      {detection.isEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">{detection.description}</p>
                  <div className="flex items-center gap-4 mt-3 text-sm text-gray-500 dark:text-gray-400">
                    <span>Type: {detection.detectionType}</span>
                    <span>Rules: {detection.detectionRules.length}</span>
                    <span>Alerts: {detection.alertChannels.join(', ')}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleToggleDetection(detection.id, detection.isEnabled)} className={`p-2 rounded-lg ${detection.isEnabled ? 'text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20' : 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'}`}>
                    <Power className="w-5 h-5" />
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                    <Trash2 className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {activeTab === 'anomalies' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {anomalies.map((anomaly, index) => (
            <motion.div key={anomaly.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{anomaly.detectionName}</h3>
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${getSeverityColor(anomaly.severity)}`}>{anomaly.severity}</span>
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${anomaly.status === 'new' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'}`}>
                      {anomaly.status}
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">{anomaly.description}</p>
                  <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
                    <div><span className="text-gray-500 dark:text-gray-400">User:</span> <span className="font-medium text-gray-900 dark:text-white">{anomaly.userName || 'N/A'}</span></div>
                    <div><span className="text-gray-500 dark:text-gray-400">Risk Score:</span> <span className={`font-bold ${anomaly.riskScore >= 70 ? 'text-red-600' : 'text-orange-600'}`}>{anomaly.riskScore}</span></div>
                    <div><span className="text-gray-500 dark:text-gray-400">Time:</span> <span className="text-gray-900 dark:text-white">{new Date(anomaly.timestamp).toLocaleString()}</span></div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 text-sm font-medium">Investigate</motion.button>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="px-4 py-2 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-medium">False Positive</motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {activeTab === 'false-positives' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {falsePositives.map((fp, index) => (
            <motion.div key={fp.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6 opacity-75">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{fp.detectionName}</h3>
                <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">False Positive</span>
              </div>
              <p className="text-gray-600 dark:text-gray-400">{fp.description}</p>
              {fp.resolution && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <span className="text-sm font-medium text-blue-900 dark:text-blue-300">Resolution:</span>
                  <span className="text-sm text-blue-800 dark:text-blue-400 ml-2">{fp.resolution}</span>
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
      )}

      {activeTab === 'ml-config' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {mlConfig.map((config, index) => (
            <motion.div key={config.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white capitalize">{config.modelType} Model</h3>
                  <div className="grid grid-cols-3 gap-6 mt-3 text-sm">
                    <div><span className="text-gray-500 dark:text-gray-400">Sensitivity:</span> <span className="font-medium text-gray-900 dark:text-white">{config.sensitivity}%</span></div>
                    <div><span className="text-gray-500 dark:text-gray-400">Accuracy:</span> <span className="font-medium text-green-600">{config.accuracy}%</span></div>
                    <div><span className="text-gray-500 dark:text-gray-400">Last Trained:</span> <span className="text-gray-900 dark:text-white">{config.lastTrained}</span></div>
                  </div>
                </div>
                <span className={`px-3 py-1.5 text-sm font-semibold rounded-full ${config.isEnabled ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'}`}>
                  {config.isEnabled ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Features:</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {config.features.map((feature, idx) => (
                    <span key={idx} className="px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded-lg text-sm">{feature}</span>
                  ))}
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="px-4 py-2 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-medium">Retrain</motion.button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="px-4 py-2 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-medium">Adjust Sensitivity</motion.button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create Detection Rule">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Rule Name</label>
            <input type="text" value={createForm.name} onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })} className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white" placeholder="Unusual Access Pattern" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
            <textarea value={createForm.description} onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })} rows={3} className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Detection Type</label>
            <select value={createForm.detectionType} onChange={(e) => setCreateForm({ ...createForm, detectionType: e.target.value })} className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white">
              <option value="behavioral_anomaly">Behavioral Anomaly</option>
              <option value="statistical_anomaly">Statistical Anomaly</option>
              <option value="ml_based">ML-Based</option>
              <option value="rule_based">Rule-Based</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Severity</label>
            <select value={createForm.severity} onChange={(e) => setCreateForm({ ...createForm, severity: e.target.value as any })} className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
          <div className="flex gap-3 pt-4">
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleCreateDetection} className="flex-1 bg-gradient-to-r from-red-600 to-orange-600 text-white px-4 py-3 rounded-xl font-medium">Create Rule</motion.button>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowCreateModal(false)} className="flex-1 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 px-4 py-3 rounded-xl font-medium">Cancel</motion.button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
