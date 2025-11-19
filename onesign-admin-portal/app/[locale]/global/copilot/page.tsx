'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';

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

type Tab = 'settings' | 'analytics' | 'history';

export default function GlobalCopilotPage() {
  const t = useTranslations();
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

  useEffect(() => {
    fetchData();
  }, [activeTab, page]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      if (activeTab === 'settings') {
        const response = await fetch('http://localhost:7000/api/global/copilot/settings');
        if (response.ok) {
          const data = await response.json();
          setSettings(data);
        }
      } else if (activeTab === 'analytics') {
        const response = await fetch('http://localhost:7000/api/global/copilot/analytics');
        if (response.ok) {
          const data = await response.json();
          setUsageStats(data);
        }
      } else if (activeTab === 'history') {
        const response = await fetch(`http://localhost:7000/api/global/copilot/conversations?page=${page}&pageSize=${pageSize}`);
        if (response.ok) {
          const data = await response.json();
          setConversations(data.items || []);
          setTotalConversations(data.totalCount || 0);
        }
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const response = await fetch('http://localhost:7000/api/global/copilot/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        setSuccess('Settings saved successfully');
      } else {
        const data = await response.json();
        setError(data.errorMessage || t('common.error'));
      }
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
      <h1 className="text-3xl font-bold mb-6">Copilot - Global Settings</h1>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>
      )}
      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">{success}</div>
      )}

      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {(['settings', 'analytics', 'history'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab === 'settings' ? 'Settings' : tab === 'analytics' ? 'Analytics' : 'Conversation History'}
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
                  <span className="font-medium">Enable Copilot</span>
                </label>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Model Provider</label>
                  <select
                    className="w-full px-3 py-2 border rounded"
                    value={settings.modelProvider}
                    onChange={(e) => setSettings({ ...settings, modelProvider: e.target.value })}
                  >
                    <option value="OpenAI">OpenAI</option>
                    <option value="Azure">Azure OpenAI</option>
                    <option value="Anthropic">Anthropic</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Max Tokens Per Request</label>
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
                  <label className="block text-sm font-medium mb-2">Max Conversation History</label>
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
                  <label className="block text-sm font-medium mb-2">Rate Limit (per minute)</label>
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
                  <label className="block text-sm font-medium mb-2">Retention Days</label>
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
                  <label className="block text-sm font-medium mb-2">Enabled Context Types</label>
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
                Save Settings
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">Total Conversations</h3>
              <p className="text-3xl font-bold text-indigo-600">{usageStats.totalConversations.toLocaleString()}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">Total Messages</h3>
              <p className="text-3xl font-bold text-indigo-600">{usageStats.totalMessages.toLocaleString()}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">Active Users</h3>
              <p className="text-3xl font-bold text-indigo-600">{usageStats.activeUsers.toLocaleString()}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">Avg Response Time</h3>
              <p className="text-3xl font-bold text-indigo-600">{usageStats.averageResponseTime}ms</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Top Context Types</h3>
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
              <p className="text-gray-500">No usage data available yet</p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tenant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Context</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Messages</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Activity</th>
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
                </tr>
              ))}
              {conversations.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    No conversations found
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
      )}
    </div>
  );
}
