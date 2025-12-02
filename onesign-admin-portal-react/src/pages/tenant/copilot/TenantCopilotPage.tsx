import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { getTenantId } from '@/lib/tenant-context';
import { copilotService } from '@/lib/api/services/copilot.service';
import { useAuth } from '@/app/contexts/AuthContext';
import { Helmet } from 'react-helmet-async';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestedActions?: string[];
}

interface Conversation {
  id: string;
  title: string;
  contextType: string;
  createdAt: string;
  lastMessageAt: string;
}

interface Suggestion {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
}

interface Insight {
  id: string;
  title: string;
  description: string;
  severity: string;
  metrics: Record<string, any>;
  recommendations: string[];
}

interface AnalysisResult {
  summary: string;
  findings: Array<{
    category: string;
    severity: string;
    description: string;
    recommendation: string;
  }>;
  score: number;
}

type ContextType = 'Dashboard' | 'User' | 'Application' | 'Incident' | 'Policy' | 'Hunt' | 'Generic';
type SidebarTab = 'suggestions' | 'insights' | 'analysis';

export default function TenantCopilotPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [tenantId, setTenantIdState] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  // Chat state
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [selectedContext, setSelectedContext] = useState<ContextType>('Generic');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(true);
  const [showSidebar, setShowSidebar] = useState(true);
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>('suggestions');

  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const contextTypes: ContextType[] = ['Dashboard', 'User', 'Application', 'Incident', 'Policy', 'Hunt', 'Generic'];

  useEffect(() => {
    const contextTenantId = getTenantId();
    setTenantIdState(contextTenantId || '00000000-0000-0000-0000-000000000000');
  }, []);

  useEffect(() => {
    if (tenantId) {
      fetchConversations();
      fetchSuggestions();
      fetchInsights();
    }
  }, [tenantId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const data = await copilotService.getConversationHistory();
      setConversations(data.map(conv => ({
        id: conv.id,
        title: conv.title || 'Untitled Conversation',
        contextType: conv.context || 'Generic',
        createdAt: conv.createdAt || new Date().toISOString(),
        lastMessageAt: conv.updatedAt || conv.createdAt || new Date().toISOString(),
      })));
    } catch (err) {
      console.error('Error fetching conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      // getMessages method not available in copilotService
      // const data = await copilotService.getMessages(tenantId, conversationId);
      const data: any[] = [];
      setMessages(data.map(msg => ({
        id: msg.id,
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
        timestamp: new Date(msg.timestamp || Date.now()),
        suggestedActions: undefined, // Messages don't have suggestedActions in the type
      })));
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  };

  const handleSelectConversation = async (conversation: Conversation) => {
    setActiveConversationId(conversation.id);
    setSelectedContext(conversation.contextType as ContextType);
    await fetchMessages(conversation.id);
  };

  const handleNewConversation = () => {
    setActiveConversationId(null);
    setMessages([]);
    setSelectedContext('Generic');
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || sending) return;

    setError('');
    setSending(true);

    const userMessage: Message = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');

    try {
      // sendQuery method not available in copilotService
      // const userId = user?.id || '00000000-0000-0000-0000-000000000001';
      // const data = await copilotService.sendQuery({
      //   tenantId,
      //   userId,
      //   conversationId: activeConversationId || undefined,
      //   context: selectedContext,
      //   query: inputMessage,
      // });

      // Fallback response when sendQuery is not available
      const data = {
        messageId: `assistant-${Date.now()}`,
        response: 'I apologize, but the copilot query functionality is not currently available.',
        suggestions: [],
      };

      const assistantMessage: Message = {
        id: data.messageId || `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
        suggestedActions: data.suggestions,
      };

      setMessages(prev => [...prev, assistantMessage]);

      if (!activeConversationId && (data as any).conversationId) {
        setActiveConversationId((data as any).conversationId);
        fetchConversations();
      }
    } catch (err: any) {
      setError(err?.message || t('common.error'));
      console.error('Error sending message:', err);
    } finally {
      setSending(false);
    }
  };

  const handleSuggestedAction = (action: string) => {
    setInputMessage(action);
  };

  const fetchSuggestions = async () => {
    try {
      const data = await copilotService.getSuggestions(selectedContext);
      setSuggestions(data.map((s: any) => ({
        id: s.id || `suggestion-${Date.now()}`,
        title: s.title || s.label || 'Suggestion',
        description: s.description || '',
        category: s.category || 'General',
        priority: s.priority || 'Medium',
      })));
    } catch (err) {
      console.error('Error fetching suggestions:', err);
    }
  };

  const fetchInsights = async () => {
    try {
      // getInsights method not available in copilotService
      // const data = await copilotService.getInsights(tenantId);
      const data: any[] = [];
      setInsights(data.map((i: any) => ({
        id: i.id || `insight-${Date.now()}`,
        title: i.title || 'Insight',
        description: i.description || '',
        severity: i.severity || 'Info',
        metrics: i.metrics || {},
        recommendations: i.recommendations || [],
      })));
    } catch (err) {
      console.error('Error fetching insights:', err);
    }
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    setError('');
    try {
      // requestAnalysis method not available in copilotService
      // const data = await copilotService.requestAnalysis({
      //   tenantId,
      //   analysisType: 'risk', // Default to risk analysis
      //   scope: selectedContext,
      // });

      // Fallback analysis result
      const data = {
        results: {
          summary: 'Analysis functionality not currently available',
          findings: [],
        },
      };

      setAnalysisResult({
        summary: data.results?.summary || '',
        findings: data.results?.findings?.map((f: any) => ({
          category: f.type || 'General',
          severity: f.severity || 'medium',
          description: f.description || '',
          recommendation: f.recommendation || '',
        })) || [],
        score: 0, // Analysis doesn't return a score, calculate from findings if needed
      });
      setSidebarTab('analysis');
    } catch (err: any) {
      setError(err?.message || t('common.error'));
    } finally {
      setAnalyzing(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
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

  const getContextIcon = (context: ContextType) => {
    switch (context) {
      case 'Dashboard': return '📊';
      case 'User': return '👤';
      case 'Application': return '📱';
      case 'Incident': return '🚨';
      case 'Policy': return '📋';
      case 'Hunt': return '🔍';
      default: return '💬';
    }
  };

  if (loading && !conversations.length) {
    return <div className="p-8">{t('common.loading')}</div>;
  }

  return (
    <div className="h-[calc(100vh-64px)] flex">
      {/* Conversation History Sidebar */}
      {showHistory && (
        <div className="w-80 border-r bg-gray-50 flex flex-col">
          <div className="p-4 border-b bg-white">
            <button
              onClick={handleNewConversation}
              className="w-full bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
            >
              New Conversation
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <p className="p-4 text-gray-500 text-sm">No conversations yet</p>
            ) : (
              conversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => handleSelectConversation(conv)}
                  className={`p-4 border-b cursor-pointer hover:bg-gray-100 ${
                    activeConversationId === conv.id ? 'bg-indigo-50 border-l-4 border-l-indigo-600' : ''
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span>{getContextIcon(conv.contextType as ContextType)}</span>
                    <span className="font-medium text-sm truncate">{conv.title}</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(conv.lastMessageAt).toLocaleDateString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b bg-white flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="p-2 hover:bg-gray-100 rounded"
              title="Toggle History"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-xl font-bold">OneSign Copilot</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Context:</label>
              <select
                value={selectedContext}
                onChange={(e) => setSelectedContext(e.target.value as ContextType)}
                className="px-3 py-1 border rounded text-sm"
              >
                {contextTypes.map((ctx) => (
                  <option key={ctx} value={ctx}>
                    {ctx}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="p-2 hover:bg-gray-100 rounded"
              title="Toggle Insights Sidebar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          </div>
        </div>

        {error && (
          <div className="mx-4 mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center text-gray-500">
                <div className="text-6xl mb-4">🤖</div>
                <h2 className="text-xl font-semibold mb-2">Welcome to OneSign Copilot</h2>
                <p className="text-sm">Ask me anything about your security posture, users, applications, or incidents.</p>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  {['Show me recent security events', 'Analyze user risk scores', 'Check application compliance'].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => setInputMessage(suggestion)}
                      className="px-3 py-1 text-sm bg-gray-100 rounded-full hover:bg-gray-200"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg p-4 ${
                    message.role === 'user'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  <div
                    className={`text-xs mt-2 ${
                      message.role === 'user' ? 'text-indigo-200' : 'text-gray-500'
                    }`}
                  >
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </div>
                  {message.suggestedActions && message.suggestedActions.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs text-gray-500 mb-2">Suggested actions:</p>
                      <div className="flex flex-wrap gap-2">
                        {message.suggestedActions.map((action, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSuggestedAction(action)}
                            className="px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50"
                          >
                            {action}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t bg-white">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask OneSign Copilot..."
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={sending}
            />
            <button
              type="submit"
              disabled={sending || !inputMessage.trim()}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? (
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                'Send'
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Right Sidebar - Suggestions & Insights */}
      {showSidebar && (
        <div className="w-96 border-l bg-gray-50 flex flex-col">
          <div className="p-4 border-b bg-white">
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => setSidebarTab('suggestions')}
                className={`flex-1 py-2 px-3 text-sm rounded ${
                  sidebarTab === 'suggestions'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Suggestions
              </button>
              <button
                onClick={() => setSidebarTab('insights')}
                className={`flex-1 py-2 px-3 text-sm rounded ${
                  sidebarTab === 'insights'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Insights
              </button>
              <button
                onClick={() => setSidebarTab('analysis')}
                className={`flex-1 py-2 px-3 text-sm rounded ${
                  sidebarTab === 'analysis'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Analysis
              </button>
            </div>
            <button
              onClick={handleAnalyze}
              disabled={analyzing}
              className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
            >
              {analyzing ? 'Analyzing...' : 'Analyze Security Posture'}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {sidebarTab === 'suggestions' && (
              <div className="space-y-3">
                {suggestions.map((suggestion) => (
                  <div key={suggestion.id} className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-sm font-semibold text-gray-900">{suggestion.title}</h4>
                      <span className={`px-2 py-1 rounded text-xs ${getPriorityColor(suggestion.priority)}`}>
                        {suggestion.priority}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">{suggestion.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">{suggestion.category}</span>
                      <button
                        onClick={() => setInputMessage(suggestion.title)}
                        className="text-xs text-indigo-600 hover:text-indigo-800"
                      >
                        Ask Copilot
                      </button>
                    </div>
                  </div>
                ))}
                {suggestions.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-8">No suggestions available</p>
                )}
              </div>
            )}

            {sidebarTab === 'insights' && (
              <div className="space-y-3">
                {insights.map((insight) => (
                  <div key={insight.id} className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-sm font-semibold text-gray-900">{insight.title}</h4>
                      <span className={`px-2 py-1 rounded text-xs ${getSeverityColor(insight.severity)}`}>
                        {insight.severity}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mb-3">{insight.description}</p>
                    {Object.keys(insight.metrics).length > 0 && (
                      <div className="mb-3 p-2 bg-gray-50 rounded">
                        <p className="text-xs font-medium text-gray-700 mb-1">Metrics:</p>
                        {Object.entries(insight.metrics).map(([key, value]) => (
                          <div key={key} className="text-xs text-gray-600 flex justify-between">
                            <span>{key}:</span>
                            <span className="font-medium">{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {insight.recommendations.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-gray-700 mb-1">Recommendations:</p>
                        <ul className="text-xs text-gray-600 space-y-1">
                          {insight.recommendations.map((rec, idx) => (
                            <li key={idx} className="flex items-start">
                              <span className="mr-1">•</span>
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
                {insights.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-8">No insights available</p>
                )}
              </div>
            )}

            {sidebarTab === 'analysis' && (
              <div>
                {analysisResult ? (
                  <div className="space-y-4">
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">Security Score</h4>
                      <div className="flex items-center">
                        <div className="flex-1">
                          <div className="bg-gray-200 rounded-full h-4">
                            <div
                              className={`h-4 rounded-full ${
                                analysisResult.score >= 80
                                  ? 'bg-green-600'
                                  : analysisResult.score >= 60
                                  ? 'bg-yellow-600'
                                  : 'bg-red-600'
                              }`}
                              style={{ width: `${analysisResult.score}%` }}
                            />
                          </div>
                        </div>
                        <span className="ml-3 text-lg font-bold text-gray-900">{analysisResult.score}</span>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">Summary</h4>
                      <p className="text-xs text-gray-600">{analysisResult.summary}</p>
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-gray-900">Findings</h4>
                      {analysisResult.findings.map((finding, idx) => (
                        <div key={idx} className="bg-white rounded-lg p-4 shadow-sm">
                          <div className="flex items-start justify-between mb-2">
                            <span className="text-xs font-medium text-gray-900">{finding.category}</span>
                            <span className={`px-2 py-1 rounded text-xs ${getSeverityColor(finding.severity)}`}>
                              {finding.severity}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 mb-2">{finding.description}</p>
                          <div className="text-xs text-indigo-600">
                            <span className="font-medium">Recommendation:</span> {finding.recommendation}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-sm text-gray-500 mb-4">No analysis results yet</p>
                    <p className="text-xs text-gray-400">Click "Analyze Security Posture" to start</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
