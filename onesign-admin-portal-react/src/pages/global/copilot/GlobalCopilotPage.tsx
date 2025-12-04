import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { copilotService } from '@/lib/api/services/copilot.service';
import { Helmet } from 'react-helmet-async';

interface CopilotSettings {
  isEnabled: boolean;
  modelProvider: string;
  maxTokensPerRequest: number;
  maxConversationHistory: number;
  enabledContextTypes: string[];
  rateLimitPerMinute: number;
  retentionDays: number;
}

interface UsageStats {
  totalConversations: number;
  totalMessages: number;
  activeUsers: number;
  averageResponseTime: number;
  topContextTypes: { contextType: string; count: number }[];
}

interface GlobalConversation {
  id: string;
  tenantId: string;
  tenantName: string;
  userId: string;
  userEmail: string;
  contextType: string;
  messageCount: number;
  createdAt: string;
  lastMessageAt: string;
}

interface PlatformInsight {
  id: string;
  title: string;
  description: string;
  category: string;
  severity: string;
  affectedTenants: number;
  metrics: Record<string, any>;
}

interface Recommendation {
  id: string;
  title: string;
  description: string;
  impact: string;
  effort: string;
  category: string;
}

interface Alert {
  id: string;
  title: string;
  description: string;
  severity: string;
  tenantId?: string;
  tenantName?: string;
  createdAt: string;
  acknowledged: boolean;
}

interface QueryResponse {
  response: string;
  confidence: number;
  sources: string[];
  executionTime: number;
}

interface ConversationDetail {
  id: string;
  messages: {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
  }[];
  tenantId: string;
  tenantName: string;
  userId: string;
  userEmail: string;
}

interface ActionResult {
  success: boolean;
  message: string;
  data?: any;
}

interface KnowledgeBaseStatus {
  isHealthy: boolean;
  totalDocuments: number;
  lastUpdated: string;
  indexSize: string;
  queryLatency: number;
}

type Tab = 'settings' | 'analytics' | 'history' | 'insights' | 'recommendations' | 'alerts' | 'query' | 'knowledge';

export default function GlobalCopilotPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<Tab>('settings');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [settings, setSettings] = useState<CopilotSettings>({
    isEnabled: true,
    modelProvider: 'OpenAI',
    maxTokensPerRequest: 4096,
    maxConversationHistory: 50,
    enabledContextTypes: ['Dashboard', 'User', 'Application', 'Incident', 'Policy', 'Hunt', 'Generic'],
    rateLimitPerMinute: 60,
    retentionDays: 90,
  });

  const [usageStats, setUsageStats] = useState<UsageStats>({
    totalConversations: 0,
    totalMessages: 0,
    activeUsers: 0,
    averageResponseTime: 0,
    topContextTypes: [],
  });

  const [conversations, setConversations] = useState<GlobalConversation[]>([]);
  const [totalConversations, setTotalConversations] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const [platformInsights, setPlatformInsights] = useState<PlatformInsight[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [analyzingTenants, setAnalyzingTenants] = useState(false);

  const [queryText, setQueryText] = useState('');
  const [queryResponse, setQueryResponse] = useState<QueryResponse | null>(null);
  const [queryLoading, setQueryLoading] = useState(false);
  const [selectedConversationId, setSelectedConversationId] = useState('');
  const [conversationDetail, setConversationDetail] = useState<ConversationDetail | null>(null);
  const [actionCommand, setActionCommand] = useState('');
  const [actionResult, setActionResult] = useState<ActionResult | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [knowledgeBaseStatus, setKnowledgeBaseStatus] = useState<KnowledgeBaseStatus | null>(null);

  useEffect(() => {
    fetchData();
  }, [activeTab, page]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      if (activeTab === 'settings') {
        const data = await copilotService.getGlobalSettings();
        setSettings(data);
      } else if (activeTab === 'analytics') {
        const data = await copilotService.getGlobalAnalytics();
        setUsageStats(data);
      } else if (activeTab === 'history') {
        const data = await copilotService.getGlobalConversations({ page, pageSize });
        setConversations(data.items || []);
        setTotalConversations(data.totalCount || 0);
      } else if (activeTab === 'insights') {
        const data = await copilotService.getGlobalPlatformInsights();
        setPlatformInsights(data.items || []);
      } else if (activeTab === 'recommendations') {
        const data = await copilotService.getGlobalRecommendations();
        setRecommendations(data.items || []);
      } else if (activeTab === 'alerts') {
        const data = await copilotService.getGlobalAlerts();
        setAlerts(data.items || []);
      } else if (activeTab === 'knowledge') {
        const data = await copilotService.getKnowledgeBaseStatus();
        setKnowledgeBaseStatus(data);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeTenants = async () => {
    setAnalyzingTenants(true);
    setError('');
    try {
      const data = await copilotService.analyzeTenants({} as any);
      setSuccess(t('global.copilot.messages.analysisCompleted', { summary: data.summary }));
      setActiveTab('insights');
      fetchData();
    } catch (err) {
      setError(t('common.error'));
    } finally {
      setAnalyzingTenants(false);
    }
  };

  const handleAcknowledgeAlert = async (alertId: string) => {
    try {
      await copilotService.acknowledgeGlobalAlert(alertId);
      setSuccess(t('global.copilot.messages.alertAcknowledged'));
      fetchData();
    } catch (err) {
      setError(t('common.error'));
    }
  };

  const handleQuery = async () => {
    if (!queryText.trim()) return;
    setQueryLoading(true);
    setError('');
    setQueryResponse(null);
    try {
      const data = await copilotService.executeGlobalQuery(queryText);
      setQueryResponse(data);
    } catch (err) {
      setError(t('common.error'));
    } finally {
      setQueryLoading(false);
    }
  };

  const handleGetConversation = async () => {
    if (!selectedConversationId.trim()) return;
    setError('');
    try {
      const data = await copilotService.getGlobalConversation(selectedConversationId);
      setConversationDetail(data);
    } catch (err) {
      setError(t('common.error'));
    }
  };

  const handleExecuteAction = async () => {
    if (!actionCommand.trim()) return;
    setActionLoading(true);
    setError('');
    setActionResult(null);
    try {
      const data = await copilotService.executeGlobalAction(actionCommand);
      setActionResult(data);
    } catch (err) {
      setError(t('common.error'));
    } finally {
      setActionLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical': return 'bg-red-100 text-red-800';
      case 'Warning': return 'bg-yellow-100 text-yellow-800';
      case 'Info': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await copilotService.updateGlobalSettings(settings);
      setSuccess(t('global.copilot.messages.settingsSavedSuccessfully'));
    } catch (err) {
      setError(t('common.error'));
    }
  };

  const handleContextTypeToggle = (contextType: string) => {
    setSettings(prev => ({
      ...prev,
      enabledContextTypes: prev.enabledContextTypes.includes(contextType)
        ? prev.enabledContextTypes.filter(ct => ct !== contextType)
        : [...prev.enabledContextTypes, contextType],
    }));
  };

  if (loading && activeTab === 'settings' && !settings.modelProvider) {
    return <div className="p-8">{t('common.loading')}</div>;
  }

  return (
    <div className="p-8">
      <Helmet>
        <title>{t('global.copilot.pageTitle')}</title>
      </Helmet>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{t('global.copilot.title')}</h1>
        <button
          onClick={handleAnalyzeTenants}
          disabled={analyzingTenants}
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-50"
        >
          {analyzingTenants ? t('global.copilot.actions.analyzingTenants') : t('global.copilot.actions.analyzeAllTenants')}
        </button>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>
      )}
      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">{success}</div>
      )}

      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {(['settings', 'query', 'analytics', 'insights', 'recommendations', 'alerts', 'history', 'knowledge'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === tab
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab === 'settings' ? t('global.copilot.settings') :
               tab === 'query' ? t('global.copilot.aiQuery') :
               tab === 'analytics' ? t('global.copilot.analytics') :
               tab === 'insights' ? t('global.copilot.platformInsights') :
               tab === 'recommendations' ? t('global.copilot.recommendations') :
               tab === 'alerts' ? t('global.copilot.smartAlerts') :
               tab === 'history' ? t('global.copilot.conversationHistory') :
               t('global.copilot.knowledgeBase')}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'settings' && (
        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSaveSettings}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={settings.isEnabled}
                    onChange={(e) => setSettings({ ...settings, isEnabled: e.target.checked })}
                  />
                  <span className="font-medium">{t('global.copilot.enableCopilot')}</span>
                </label>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">{t('global.copilot.modelProvider')}</label>
                  <select
                    className="w-full px-3 py-2 border rounded"
                    value={settings.modelProvider}
                    onChange={(e) => setSettings({ ...settings, modelProvider: e.target.value })}
                  >
                    <option value="OpenAI">{t('global.copilot.openAI')}</option>
                    <option value="Azure">{t('global.copilot.azureOpenAI')}</option>
                    <option value="Anthropic">{t('global.copilot.anthropic')}</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">{t('global.copilot.maxTokensPerRequest')}</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border rounded"
                    value={settings.maxTokensPerRequest}
                    onChange={(e) => setSettings({ ...settings, maxTokensPerRequest: parseInt(e.target.value) })}
                    min={1}
                    max={32000}
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">{t('global.copilot.maxConversationHistory')}</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border rounded"
                    value={settings.maxConversationHistory}
                    onChange={(e) => setSettings({ ...settings, maxConversationHistory: parseInt(e.target.value) })}
                    min={1}
                    max={100}
                  />
                </div>
              </div>

              <div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">{t('global.copilot.rateLimitPerMinute')}</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border rounded"
                    value={settings.rateLimitPerMinute}
                    onChange={(e) => setSettings({ ...settings, rateLimitPerMinute: parseInt(e.target.value) })}
                    min={1}
                    max={1000}
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">{t('global.copilot.retentionDays')}</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border rounded"
                    value={settings.retentionDays}
                    onChange={(e) => setSettings({ ...settings, retentionDays: parseInt(e.target.value) })}
                    min={1}
                    max={365}
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">{t('global.copilot.enabledContextTypes')}</label>
                  <div className="space-y-2">
                    {['Dashboard', 'User', 'Application', 'Incident', 'Policy', 'Hunt', 'Generic'].map((ctx) => (
                      <label key={ctx} className="flex items-center">
                        <input
                          type="checkbox"
                          className="mr-2"
                          checked={settings.enabledContextTypes.includes(ctx)}
                          onChange={() => handleContextTypeToggle(ctx)}
                        />
                        {ctx}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <button
                type="submit"
                className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
              >
                {t('global.copilot.saveSettings')}
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">{t('global.copilot.totalConversations')}</h3>
              <p className="text-3xl font-bold text-indigo-600">{usageStats.totalConversations.toLocaleString()}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">{t('global.copilot.totalMessages')}</h3>
              <p className="text-3xl font-bold text-indigo-600">{usageStats.totalMessages.toLocaleString()}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">{t('global.copilot.activeUsers')}</h3>
              <p className="text-3xl font-bold text-indigo-600">{usageStats.activeUsers.toLocaleString()}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">{t('global.copilot.avgResponseTime')}</h3>
              <p className="text-3xl font-bold text-indigo-600">{usageStats.averageResponseTime}ms</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">{t('global.copilot.topContextTypes')}</h3>
            {usageStats.topContextTypes.length > 0 ? (
              <div className="space-y-3">
                {usageStats.topContextTypes.map((item) => (
                  <div key={item.contextType} className="flex items-center">
                    <div className="w-32 text-sm font-medium">{item.contextType}</div>
                    <div className="flex-1 mx-4">
                      <div className="bg-gray-200 rounded-full h-4">
                        <div
                          className="bg-indigo-600 h-4 rounded-full"
                          style={{
                            width: `${(item.count / Math.max(...usageStats.topContextTypes.map(t => t.count))) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                    <div className="w-16 text-sm text-gray-600 text-right">{item.count}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">{t('global.copilot.noUsageData')}</p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'insights' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {platformInsights.map((insight) => (
            <div key={insight.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900">{insight.title}</h3>
                <span className={`px-2 py-1 rounded text-xs ${getSeverityColor(insight.severity)}`}>
                  {insight.severity}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-3">{insight.description}</p>
              <div className="mb-3">
                <span className="text-xs px-2 py-1 bg-indigo-100 text-indigo-800 rounded">
                  {insight.category}
                </span>
                <span className="text-xs text-gray-500 ml-2">
                  Affects {insight.affectedTenants} tenant{insight.affectedTenants !== 1 ? 's' : ''}
                </span>
              </div>
              {Object.keys(insight.metrics).length > 0 && (
                <div className="p-3 bg-gray-50 rounded">
                  <p className="text-xs font-semibold text-gray-700 mb-2">Key Metrics:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(insight.metrics).map(([key, value]) => (
                      <div key={key} className="text-xs">
                        <span className="text-gray-600">{key}:</span>
                        <span className="font-medium text-gray-900 ml-1">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
          {platformInsights.length === 0 && (
            <div className="col-span-2 text-center text-gray-500 py-12">
              {t('global.copilot.noPlatformInsights')}
            </div>
          )}
        </div>
      )}

      {activeTab === 'recommendations' && (
        <div className="grid grid-cols-1 gap-4">
          {recommendations.map((rec) => (
            <div key={rec.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{rec.title}</h3>
                  <p className="text-sm text-gray-600">{rec.description}</p>
                </div>
                <div className="flex flex-col gap-2 ml-4">
                  <span className={`px-2 py-1 rounded text-xs text-center ${getImpactColor(rec.impact)}`}>
                    Impact: {rec.impact}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs text-center ${getEffortColor(rec.effort)}`}>
                    Effort: {rec.effort}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                  {rec.category}
                </span>
                <button className="text-sm text-indigo-600 hover:text-indigo-800">
                  {t('global.copilot.viewDetails')}
                </button>
              </div>
            </div>
          ))}
          {recommendations.length === 0 && (
            <div className="text-center text-gray-500 py-12">
              {t('global.copilot.noRecommendations')}
            </div>
          )}
        </div>
      )}

      {activeTab === 'alerts' && (
        <div className="space-y-4">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`bg-white rounded-lg shadow p-6 ${
                alert.acknowledged ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 rounded text-xs ${getSeverityColor(alert.severity)}`}>
                      {alert.severity}
                    </span>
                    {alert.tenantName && (
                      <span className="text-xs text-gray-500">
                        Tenant: {alert.tenantName}
                      </span>
                    )}
                    {alert.acknowledged && (
                      <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
                        {t('global.copilot.acknowledged')}
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{alert.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">{alert.description}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(alert.createdAt).toLocaleString()}
                  </p>
                </div>
                {!alert.acknowledged && (
                  <button
                    onClick={() => handleAcknowledgeAlert(alert.id)}
                    className="ml-4 px-4 py-2 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700"
                  >
                    {t('global.copilot.acknowledge')}
                  </button>
                )}
              </div>
            </div>
          ))}
          {alerts.length === 0 && (
            <div className="text-center text-gray-500 py-12">
              {t('global.copilot.noAlerts')}
            </div>
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <div>
          <div className="mb-4 flex gap-2">
            <input
              type="text"
              value={selectedConversationId}
              onChange={(e) => setSelectedConversationId(e.target.value)}
              placeholder={t('global.copilot.enterConversationId')}
              className="flex-1 px-3 py-2 border border-gray-300 rounded"
            />
            <button
              onClick={handleGetConversation}
              disabled={!selectedConversationId}
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
            >
              {t('global.copilot.viewConversation')}
            </button>
          </div>

          {conversationDetail && (
            <div className="mb-4 bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{t('global.copilot.conversationDetails')}</h3>
                  <p className="text-sm text-gray-600">{t('common.tenant')}: {conversationDetail.tenantName}</p>
                  <p className="text-sm text-gray-600">{t('common.user')}: {conversationDetail.userEmail}</p>
                </div>
                <button
                  onClick={() => setConversationDetail(null)}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  {t('common.close')}
                </button>
              </div>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {conversationDetail.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-3 rounded ${
                      msg.role === 'user' ? 'bg-blue-50 ml-8' : 'bg-gray-50 mr-8'
                    }`}
                  >
                    <div className="flex justify-between mb-1">
                      <span className="text-xs font-semibold text-gray-700">
                        {msg.role === 'user' ? t('common.user') : t('global.copilot.assistant')}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(msg.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-800">{msg.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('common.tenant')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('common.user')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('global.copilot.context')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('global.copilot.messages')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('common.created')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('global.copilot.lastActivity')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {conversations.map((conv) => (
                  <tr key={conv.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {conv.tenantName || conv.tenantId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {conv.userEmail || conv.userId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
                        {conv.contextType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {conv.messageCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(conv.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(conv.lastMessageAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => {
                          setSelectedConversationId(conv.id);
                          handleGetConversation();
                        }}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        {t('common.view')}
                      </button>
                    </td>
                  </tr>
                ))}
                {conversations.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                      {t('global.copilot.noConversations')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            {totalConversations > pageSize && (
              <div className="px-6 py-4 flex justify-between items-center border-t">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  {t('common.previous')}
                </button>
                <span className="text-sm text-gray-500">
                  Page {page} / {Math.ceil(totalConversations / pageSize)}
                </span>
                <button
                  onClick={() => setPage(p => p + 1)}
                  disabled={page >= Math.ceil(totalConversations / pageSize)}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  {t('common.next')}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'query' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">{t('global.copilot.aiQueryInterface')}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">{t('global.copilot.enterYourQuery')}</label>
                <textarea
                  value={queryText}
                  onChange={(e) => setQueryText(e.target.value)}
                  placeholder={t('global.copilot.queryPlaceholder')}
                  className="w-full px-3 py-2 border border-gray-300 rounded h-32"
                />
              </div>
              <button
                onClick={handleQuery}
                disabled={queryLoading || !queryText.trim()}
                className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
              >
                {queryLoading ? t('global.copilot.processing') : t('global.copilot.executeQuery')}
              </button>
            </div>
          </div>

          {queryResponse && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">{t('global.copilot.queryResponse')}</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-gray-800 whitespace-pre-wrap">{queryResponse.response}</p>
                </div>
                <div className="pt-4 border-t">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <span className="text-sm text-gray-500">{t('global.copilot.confidence')}:</span>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${queryResponse.confidence * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{(queryResponse.confidence * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">{t('global.copilot.executionTime')}:</span>
                      <p className="font-medium">{queryResponse.executionTime}ms</p>
                    </div>
                  </div>
                  {queryResponse.sources.length > 0 && (
                    <div>
                      <span className="text-sm font-medium text-gray-700">{t('global.copilot.sources')}:</span>
                      <ul className="mt-2 space-y-1">
                        {queryResponse.sources.map((source, idx) => (
                          <li key={idx} className="text-sm text-gray-600">
                            - {source}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">{t('global.copilot.executeAction')}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">{t('global.copilot.actionCommand')}</label>
                <input
                  type="text"
                  value={actionCommand}
                  onChange={(e) => setActionCommand(e.target.value)}
                  placeholder={t('global.copilot.actionPlaceholder')}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                />
              </div>
              <button
                onClick={handleExecuteAction}
                disabled={actionLoading || !actionCommand.trim()}
                className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-50"
              >
                {actionLoading ? t('global.copilot.executing') : t('global.copilot.executeAction')}
              </button>
            </div>

            {actionResult && (
              <div className={`mt-4 p-4 rounded ${
                actionResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
              }`}>
                <p className={`font-medium ${actionResult.success ? 'text-green-800' : 'text-red-800'}`}>
                  {actionResult.message}
                </p>
                {actionResult.data && (
                  <pre className="mt-2 text-xs text-gray-700 overflow-auto">
                    {JSON.stringify(actionResult.data, null, 2)}
                  </pre>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'knowledge' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-6">{t('global.copilot.knowledgeBaseStatus')}</h2>
          {knowledgeBaseStatus ? (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className={`w-4 h-4 rounded-full ${
                  knowledgeBaseStatus.isHealthy ? 'bg-green-500' : 'bg-red-500'
                }`} />
                <h3 className="text-lg font-medium">
                  {knowledgeBaseStatus.isHealthy ? t('global.copilot.healthy') : t('global.copilot.unhealthy')}
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-gray-50 rounded">
                  <h4 className="text-sm font-medium text-gray-700 mb-1">{t('global.copilot.totalDocuments')}</h4>
                  <p className="text-2xl font-bold text-gray-900">{knowledgeBaseStatus.totalDocuments.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded">
                  <h4 className="text-sm font-medium text-gray-700 mb-1">{t('global.copilot.indexSize')}</h4>
                  <p className="text-2xl font-bold text-gray-900">{knowledgeBaseStatus.indexSize}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded">
                  <h4 className="text-sm font-medium text-gray-700 mb-1">{t('global.copilot.queryLatency')}</h4>
                  <p className="text-2xl font-bold text-gray-900">{knowledgeBaseStatus.queryLatency}ms</p>
                </div>
                <div className="p-4 bg-gray-50 rounded">
                  <h4 className="text-sm font-medium text-gray-700 mb-1">{t('global.copilot.lastUpdated')}</h4>
                  <p className="text-2xl font-bold text-gray-900">
                    {new Date(knowledgeBaseStatus.lastUpdated).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              {t('global.copilot.noKnowledgeBaseStatus')}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
