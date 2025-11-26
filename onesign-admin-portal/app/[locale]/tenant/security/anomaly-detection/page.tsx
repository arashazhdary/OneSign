'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { getTenantId } from '@/lib/tenant-context';
import { securityService } from '@/lib/api/services';
import { useAuth } from '@/app/contexts/AuthContext';
import DataTable, { Column } from '@/app/components/DataTable';
import StatusBadge from '@/app/components/StatusBadge';
import ActionButton from '@/app/components/ActionButton';
import Modal from '@/app/components/Modal';
import LoadingOverlay from '@/app/components/LoadingOverlay';

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
  createdAt?: string;
  updatedAt?: string;
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
  assignedTo?: string;
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

export default function AnomalyDetectionPage() {
  const t = useTranslations();
  const { user } = useAuth();
  const [tenantId, setTenantIdState] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState<'detections' | 'anomalies' | 'false-positives' | 'ml-config'>('detections');

  const [detections, setDetections] = useState<ThreatDetection[]>([]);
  const [anomalies, setAnomalies] = useState<DetectedAnomaly[]>([]);
  const [falsePositives, setFalsePositives] = useState<DetectedAnomaly[]>([]);
  const [mlConfig, setMlConfig] = useState<MLModelConfig[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedDetection, setSelectedDetection] = useState<ThreatDetection | null>(null);

  const [createForm, setCreateForm] = useState({
    name: '',
    description: '',
    detectionType: 'behavioral_anomaly',
    severity: 'medium' as const,
    rules: [] as DetectionRule[],
  });

  useEffect(() => {
    const contextTenantId = getTenantId();
    setTenantIdState(contextTenantId || '11111111-1111-1111-1111-111111111111');
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
    if (!tenantId) return;
    setLoading(true);
    setError('');
    try {
      const data = await (securityService as any).getThreatDetections(tenantId);
      setDetections(data || []);
    } catch (err: any) {
      console.error('Error fetching threat detections:', err);
      setError('Failed to load threat detections');
      // Mock data on error
      setDetections([
        {
          id: '1',
          tenantId,
          detectionType: 'behavioral_anomaly',
          name: 'Unusual Login Activity',
          description: 'Detects login attempts from unusual locations or times',
          severity: 'high',
          isEnabled: true,
          detectionRules: [
            { id: '1', condition: 'login_from_new_location', threshold: 3, timeWindow: 3600 },
            { id: '2', condition: 'login_outside_business_hours', threshold: 5, timeWindow: 86400 },
          ],
          alertChannels: ['email', 'slack'],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnomalies = async () => {
    // Mock detected anomalies - implement actual API when available
    setAnomalies([
      {
        id: '1',
        detectionId: '1',
        detectionName: 'Unusual Login Activity',
        userId: 'user123',
        userName: 'John Doe',
        timestamp: new Date().toISOString(),
        severity: 'high',
        description: 'Login from unusual location: Tokyo, Japan',
        riskScore: 85,
        status: 'new',
        details: {
          location: 'Tokyo, Japan',
          ipAddress: '123.45.67.89',
          userAgent: 'Mozilla/5.0...',
        },
      },
      {
        id: '2',
        detectionId: '1',
        detectionName: 'Unusual Login Activity',
        userId: 'user456',
        userName: 'Jane Smith',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        severity: 'medium',
        description: 'Multiple failed login attempts',
        riskScore: 65,
        status: 'investigating',
        details: {
          failedAttempts: 7,
          timeWindow: '1 hour',
        },
      },
    ]);
  };

  const fetchFalsePositives = async () => {
    // Mock false positives
    setFalsePositives([
      {
        id: '3',
        detectionId: '1',
        detectionName: 'Unusual Login Activity',
        userId: 'user789',
        userName: 'Bob Johnson',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        severity: 'low',
        description: 'Login from new device',
        riskScore: 45,
        status: 'false_positive',
        details: {
          device: 'iPhone 15 Pro',
          reason: 'User confirmed new device purchase',
        },
        resolution: 'Confirmed as false positive - user purchased new device',
      },
    ]);
  };

  const fetchMLConfig = async () => {
    // Mock ML configuration
    setMlConfig([
      {
        id: '1',
        modelType: 'behavioral',
        isEnabled: true,
        sensitivity: 75,
        features: ['login_location', 'login_time', 'access_patterns', 'data_volume'],
        lastTrained: '2024-11-15',
        accuracy: 92.5,
      },
      {
        id: '2',
        modelType: 'statistical',
        isEnabled: true,
        sensitivity: 85,
        features: ['api_usage', 'data_access', 'permission_changes'],
        lastTrained: '2024-11-10',
        accuracy: 88.3,
      },
    ]);
  };

  const handleCreateDetection = async () => {
    if (!tenantId) return;
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await (securityService as any).createThreatDetection({
        tenantId,
        ...createForm,
      });
      setSuccess('Detection rule created successfully');
      setShowCreateModal(false);
      setCreateForm({
        name: '',
        description: '',
        detectionType: 'behavioral_anomaly',
        severity: 'medium',
        rules: [],
      });
      fetchDetections();
    } catch (err: any) {
      setError('Failed to create detection rule');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleDetection = async (detectionId: string, isEnabled: boolean) => {
    if (!tenantId) return;
    setLoading(true);
    try {
      await (securityService as any).updateThreatDetection(tenantId, detectionId, { isEnabled: !isEnabled });
      setSuccess(`Detection ${!isEnabled ? 'enabled' : 'disabled'} successfully`);
      fetchDetections();
    } catch (err) {
      setError('Failed to update detection');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDetection = async (detectionId: string) => {
    if (!tenantId || !confirm('Are you sure you want to delete this detection rule?')) return;
    setLoading(true);
    try {
      await (securityService as any).deleteThreatDetection(tenantId, detectionId);
      setSuccess('Detection deleted successfully');
      fetchDetections();
    } catch (err) {
      setError('Failed to delete detection');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkFalsePositive = async (anomalyId: string) => {
    setLoading(true);
    try {
      // Implement API call to mark as false positive
      setSuccess('Anomaly marked as false positive');
      fetchAnomalies();
      fetchFalsePositives();
    } catch (err) {
      setError('Failed to mark as false positive');
    } finally {
      setLoading(false);
    }
  };

  const detectionColumns: Column<ThreatDetection>[] = [
    { key: 'name', label: 'Detection Name' },
    { key: 'detectionType', label: 'Type' },
    {
      key: 'severity',
      label: 'Severity',
      render: (detection) => (
        <StatusBadge
          status={detection.severity}
          variant={
            detection.severity === 'critical' || detection.severity === 'high'
              ? 'error'
              : detection.severity === 'medium'
              ? 'warning'
              : 'success'
          }
        />
      ),
    },
    {
      key: 'isEnabled',
      label: 'Status',
      render: (detection) => (
        <StatusBadge status={detection.isEnabled ? 'Enabled' : 'Disabled'} variant={detection.isEnabled ? 'success' : 'error'} />
      ),
    },
    {
      key: 'detectionRules',
      label: 'Rules',
      render: (detection) => detection.detectionRules.length,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <LoadingOverlay isLoading={loading} message="Processing..." />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Anomaly Detection
        </h1>
        <p className="text-gray-700">
          Detect and respond to unusual behavior patterns and security threats
        </p>
      </div>

      {/* Alerts */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-300 text-red-800 rounded-lg">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-4 bg-green-100 border border-green-300 text-green-800 rounded-lg">
          {success}
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6 flex space-x-2 border-b border-gray-300">
        <button
          onClick={() => setActiveTab('detections')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'detections'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-700 hover:text-gray-900'
          }`}
        >
          Detection Rules
        </button>
        <button
          onClick={() => setActiveTab('anomalies')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'anomalies'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Detected Anomalies
        </button>
        <button
          onClick={() => setActiveTab('false-positives')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'false-positives'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          False Positives
        </button>
        <button
          onClick={() => setActiveTab('ml-config')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'ml-config'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          ML Configuration
        </button>
      </div>

      {/* Detection Rules Tab */}
      {activeTab === 'detections' && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <ActionButton onClick={() => setShowCreateModal(true)}>
              Create Detection Rule
            </ActionButton>
          </div>
          <DataTable
            data={detections}
            columns={detectionColumns}
            onRowClick={(detection) => setSelectedDetection(detection)}
            actions={(detection) => (
              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleDetection(detection.id, detection.isEnabled);
                  }}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  {detection.isEnabled ? 'Disable' : 'Enable'}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteDetection(detection.id);
                  }}
                  className="text-red-600 hover:text-red-800 font-medium"
                >
                  Delete
                </button>
              </div>
            )}
          />
        </div>
      )}

      {/* Detected Anomalies Tab */}
      {activeTab === 'anomalies' && (
        <div className="space-y-4">
          {anomalies.map((anomaly) => (
            <div key={anomaly.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">{anomaly.detectionName}</h3>
                    <StatusBadge
                      status={anomaly.severity}
                      variant={anomaly.severity === 'high' || anomaly.severity === 'critical' ? 'error' : 'warning'}
                    />
                    <StatusBadge status={anomaly.status} />
                  </div>
                  <p className="text-gray-600 mb-3">{anomaly.description}</p>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">User:</span>{' '}
                      <span className="font-medium">{anomaly.userName || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Risk Score:</span>{' '}
                      <span className={`font-medium ${anomaly.riskScore >= 70 ? 'text-red-600' : 'text-orange-600'}`}>
                        {anomaly.riskScore}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Detected:</span>{' '}
                      <span className="font-medium">{new Date(anomaly.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                  {anomaly.details && Object.keys(anomaly.details).length > 0 && (
                    <div className="mt-3 p-3 bg-gray-50 rounded">
                      <div className="text-sm font-medium text-gray-700 mb-1">Details:</div>
                      <div className="text-sm text-gray-600">
                        {Object.entries(anomaly.details).map(([key, value]) => (
                          <div key={key}>
                            <span className="font-medium">{key}:</span> {String(value)}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="ml-6 flex flex-col gap-2">
                  <ActionButton variant="secondary" onClick={() => handleMarkFalsePositive(anomaly.id)}>
                    Mark False Positive
                  </ActionButton>
                  <ActionButton>Investigate</ActionButton>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* False Positives Tab */}
      {activeTab === 'false-positives' && (
        <div className="space-y-4">
          {falsePositives.map((fp) => (
            <div key={fp.id} className="bg-white rounded-lg shadow p-6 opacity-75">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">{fp.detectionName}</h3>
                    <StatusBadge status="False Positive" variant="info" />
                  </div>
                  <p className="text-gray-600 mb-2">{fp.description}</p>
                  {fp.resolution && (
                    <div className="p-3 bg-blue-50 rounded text-sm">
                      <span className="font-medium text-blue-900">Resolution:</span>{' '}
                      <span className="text-blue-800">{fp.resolution}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ML Configuration Tab */}
      {activeTab === 'ml-config' && (
        <div className="space-y-4">
          {mlConfig.map((config) => (
            <div key={config.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold capitalize">{config.modelType} Model</h3>
                  <div className="mt-2 grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Sensitivity:</span>{' '}
                      <span className="font-medium">{config.sensitivity}%</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Accuracy:</span>{' '}
                      <span className="font-medium text-green-600">{config.accuracy}%</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Last Trained:</span>{' '}
                      <span className="font-medium">{config.lastTrained}</span>
                    </div>
                  </div>
                </div>
                <StatusBadge status={config.isEnabled ? 'Active' : 'Inactive'} variant={config.isEnabled ? 'success' : 'error'} />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-700 mb-2">Features:</div>
                <div className="flex flex-wrap gap-2">
                  {config.features.map((feature, idx) => (
                    <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <ActionButton variant="secondary">Retrain Model</ActionButton>
                <ActionButton variant="secondary">Adjust Sensitivity</ActionButton>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Detection Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create Detection Rule">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rule Name</label>
            <input
              type="text"
              value={createForm.name}
              onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Unusual Access Pattern"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={createForm.description}
              onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Detection Type</label>
            <select
              value={createForm.detectionType}
              onChange={(e) => setCreateForm({ ...createForm, detectionType: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="behavioral_anomaly">Behavioral Anomaly</option>
              <option value="statistical_anomaly">Statistical Anomaly</option>
              <option value="ml_based">ML-Based Detection</option>
              <option value="rule_based">Rule-Based</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
            <select
              value={createForm.severity}
              onChange={(e) => setCreateForm({ ...createForm, severity: e.target.value as any })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          <div className="flex gap-3 mt-6">
            <ActionButton onClick={handleCreateDetection} className="flex-1">
              Create Rule
            </ActionButton>
            <ActionButton onClick={() => setShowCreateModal(false)} variant="secondary" className="flex-1">
              Cancel
            </ActionButton>
          </div>
        </div>
      </Modal>
    </div>
  );
}
