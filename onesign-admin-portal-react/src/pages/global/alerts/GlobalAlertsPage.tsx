import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { globalService } from '@/lib/api/services/global.service';

interface Alert {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  status: 'active' | 'acknowledged' | 'resolved' | 'silenced';
  category: 'performance' | 'security' | 'system' | 'business';
  source: string;
  triggeredAt: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
  acknowledgedBy?: string;
  affectedTenants?: string[];
  metrics?: Record<string, any>;
}

interface AlertRule {
  id: string;
  name: string;
  description: string;
  condition: string;
  threshold: number;
  severity: 'critical' | 'high' | 'medium' | 'low';
  isEnabled: boolean;
  notificationChannels: string[];
  cooldownMinutes: number;
  createdAt: string;
}

export default function GlobalAlertsPage() {
  const { t } = useTranslation();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [rules, setRules] = useState<AlertRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'active' | 'history' | 'rules'>('active');
  const [filterSeverity, setFilterSeverity] = useState('');
  const [showCreateRule, setShowCreateRule] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [alertsData, rulesData] = await Promise.all([
        globalService.getAlerts(),
        globalService.getAlertRules()
      ]);

      setAlerts(alertsData || []);
      setRules(rulesData || []);
    } catch (err) {
      console.error('Failed to fetch alerts data:', err);
      setAlerts([]);
      setRules([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledge = async (alertId: string) => {
    try {
      await globalService.acknowledgeAlert(alertId);
      fetchData();
    } catch (error) {
      console.error('Failed to acknowledge alert:', error);
    }
  };

  const handleResolve = async (alertId: string) => {
    try {
      await globalService.resolveAlert(alertId);
      fetchData();
    } catch (error) {
      console.error('Failed to resolve alert:', error);
    }
  };

  const handleSilence = async (alertId: string) => {
    try {
      await globalService.silenceAlert(alertId);
      fetchData();
    } catch (error) {
      console.error('Failed to silence alert:', error);
    }
  };

  const handleToggleRule = async (ruleId: string) => {
    try {
      await globalService.toggleAlertRule(ruleId);
      fetchData();
    } catch (error) {
      console.error('Failed to toggle alert rule:', error);
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    if (!confirm(t('alerts.confirmDeleteRule'))) return;
    try {
      await globalService.deleteAlertRule(ruleId);
      fetchData();
    } catch (error) {
      console.error('Failed to delete alert rule:', error);
    }
  };

  const getSeverityBadge = (severity: string) => {
    const colors = {
      critical: 'bg-red-100 text-red-800 border-red-300',
      high: 'bg-orange-100 text-orange-800 border-orange-300',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      low: 'bg-blue-100 text-blue-800 border-blue-300',
      info: 'bg-gray-100 text-gray-800 border-gray-300',
    };
    return colors[severity as keyof typeof colors] || 'bg-gray-100';
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      active: 'bg-red-100 text-red-800',
      acknowledged: 'bg-yellow-100 text-yellow-800',
      resolved: 'bg-green-100 text-green-800',
      silenced: 'bg-gray-100 text-gray-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100';
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      performance: '⚡',
      security: '🔒',
      system: '⚙️',
      business: '💼',
    };
    return icons[category as keyof typeof icons] || '📊';
  };

  const filteredAlerts = filterSeverity
    ? alerts.filter(a => a.severity === filterSeverity)
    : alerts;

  const activeAlerts = filteredAlerts.filter(a => a.status === 'active' || a.status === 'acknowledged');
  const historicalAlerts = filteredAlerts.filter(a => a.status === 'resolved' || a.status === 'silenced');

  if (loading) return <div className="p-6">{t('common.loading')}...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Global Platform Alerts</h1>
          <p className="text-gray-600 mt-1">Platform-wide alert monitoring and management</p>
        </div>
        <button
          onClick={() => setShowCreateRule(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Create Alert Rule
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-sm text-red-600">Critical</div>
          <div className="text-2xl font-bold text-red-700">
            {alerts.filter(a => a.severity === 'critical' && a.status === 'active').length}
          </div>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="text-sm text-orange-600">High</div>
          <div className="text-2xl font-bold text-orange-700">
            {alerts.filter(a => a.severity === 'high' && a.status === 'active').length}
          </div>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="text-sm text-yellow-600">Medium</div>
          <div className="text-2xl font-bold text-yellow-700">
            {alerts.filter(a => a.severity === 'medium' && a.status === 'active').length}
          </div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-sm text-green-600">Resolved Today</div>
          <div className="text-2xl font-bold text-green-700">
            {alerts.filter(a => a.status === 'resolved').length}
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-sm text-blue-600">Active Rules</div>
          <div className="text-2xl font-bold text-blue-700">
            {rules.filter(r => r.isEnabled).length}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab('active')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'active'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Active Alerts ({activeAlerts.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'history'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            History ({historicalAlerts.length})
          </button>
          <button
            onClick={() => setActiveTab('rules')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'rules'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Alert Rules ({rules.length})
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <div className="flex space-x-4">
          <div>
            <label className="block text-sm font-medium mb-2">Filter by Severity</label>
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Active Alerts Tab */}
      {activeTab === 'active' && (
        <div className="space-y-4">
          {activeAlerts.map((alert) => (
            <div key={alert.id} className={`bg-white rounded-lg shadow-lg p-6 border-l-4 ${
              alert.severity === 'critical' ? 'border-red-500' :
              alert.severity === 'high' ? 'border-orange-500' :
              alert.severity === 'medium' ? 'border-yellow-500' :
              'border-blue-500'
            }`}>
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">{getCategoryIcon(alert.category)}</span>
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="text-lg font-semibold">{alert.title}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full border ${getSeverityBadge(alert.severity)}`}>
                        {alert.severity}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(alert.status)}`}>
                        {alert.status}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm">{alert.description}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  {alert.status === 'active' && (
                    <button
                      onClick={() => handleAcknowledge(alert.id)}
                      className="px-3 py-1 text-sm bg-yellow-600 text-white rounded hover:bg-yellow-700"
                    >
                      Acknowledge
                    </button>
                  )}
                  <button
                    onClick={() => handleResolve(alert.id)}
                    className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Resolve
                  </button>
                  <button
                    onClick={() => handleSilence(alert.id)}
                    className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
                  >
                    Silence
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-4">
                <div>
                  <span className="text-gray-500">Triggered:</span>
                  <span className="ml-2">{new Date(alert.triggeredAt).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-gray-500">Source:</span>
                  <span className="ml-2">{alert.source}</span>
                </div>
                <div>
                  <span className="text-gray-500">Category:</span>
                  <span className="ml-2">{alert.category}</span>
                </div>
                {alert.affectedTenants && (
                  <div>
                    <span className="text-gray-500">Affected Tenants:</span>
                    <span className="ml-2">{alert.affectedTenants.length}</span>
                  </div>
                )}
              </div>

              {alert.acknowledgedBy && (
                <div className="mt-3 pt-3 border-t border-gray-200 text-sm text-gray-600">
                  Acknowledged by {alert.acknowledgedBy} at {new Date(alert.acknowledgedAt!).toLocaleString()}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Alert</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Severity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Triggered</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Resolved</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {historicalAlerts.map((alert) => (
                <tr key={alert.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm">
                    <div className="font-medium">{alert.title}</div>
                    <div className="text-gray-500">{alert.description}</div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-1 text-xs rounded-full ${getSeverityBadge(alert.severity)}`}>
                      {alert.severity}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">{alert.category}</td>
                  <td className="px-6 py-4 text-sm whitespace-nowrap">
                    {new Date(alert.triggeredAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm whitespace-nowrap">
                    {alert.resolvedAt ? new Date(alert.resolvedAt).toLocaleString() : '-'}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(alert.status)}`}>
                      {alert.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Rules Tab */}
      {activeTab === 'rules' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rule Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Condition</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Threshold</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Severity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Channels</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {rules.map((rule) => (
                <tr key={rule.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm">
                    <div className="font-medium">{rule.name}</div>
                    <div className="text-gray-500">{rule.description}</div>
                  </td>
                  <td className="px-6 py-4 text-sm font-mono">{rule.condition}</td>
                  <td className="px-6 py-4 text-sm">{rule.threshold}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-1 text-xs rounded-full ${getSeverityBadge(rule.severity)}`}>
                      {rule.severity}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">{rule.notificationChannels.join(', ')}</td>
                  <td className="px-6 py-4 text-sm">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rule.isEnabled}
                        onChange={() => handleToggleRule(rule.id)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <button className="text-blue-600 hover:text-blue-800 mr-3">Edit</button>
                    <button
                      onClick={() => handleDeleteRule(rule.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
