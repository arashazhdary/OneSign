import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { getTenantId } from '@/lib/tenant-context';
import { copilotService } from '@/lib/api/services/copilot.service';
import { useAuth } from '@/app/contexts/AuthContext';
import { Helmet } from 'react-helmet-async';
import {
  Bot,
  Send,
  Plus,
  MessageSquare,
  Lightbulb,
  BarChart3,
  Activity,
  Search,
  User,
  AppWindow,
  AlertTriangle,
  FileText,
  Menu,
  PanelRightClose,
  PanelRightOpen,
  Loader2,
  Sparkles,
  Shield,
  TrendingUp,
} from 'lucide-react';

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
  findings: Array<{ category: string; severity: string; description: string; recommendation: string }>;
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

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const data = await copilotService.getConversationHistory();
      setConversations(data.map(conv => ({ id: conv.id, title: conv.title || t('tenant.copilot.untitledConversation'), contextType: conv.context || 'Generic', createdAt: conv.createdAt || new Date().toISOString(), lastMessageAt: conv.updatedAt || conv.createdAt || new Date().toISOString() })));
    } catch (err) {
      console.error('Error fetching conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    const data: any[] = [];
    setMessages(data.map(msg => ({ id: msg.id, role: msg.role as 'user' | 'assistant', content: msg.content, timestamp: new Date(msg.timestamp || Date.now()), suggestedActions: undefined })));
  };

  const handleSelectConversation = async (conversation: Conversation) => {
    setActiveConversationId(conversation.id);
    setSelectedContext(conversation.contextType as ContextType);
    await fetchMessages(conversation.id);
  };

  const handleNewConversation = () => { setActiveConversationId(null); setMessages([]); setSelectedContext('Generic'); };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || sending) return;
    setError('');
    setSending(true);
    const userMessage: Message = { id: `temp-${Date.now()}`, role: 'user', content: inputMessage, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');

    try {
      const data = { messageId: `assistant-${Date.now()}`, response: 'I apologize, but the copilot query functionality is not currently available.', suggestions: [] };
      const assistantMessage: Message = { id: data.messageId, role: 'assistant', content: data.response, timestamp: new Date(), suggestedActions: data.suggestions };
      setMessages(prev => [...prev, assistantMessage]);
      if (!activeConversationId && (data as any).conversationId) { setActiveConversationId((data as any).conversationId); fetchConversations(); }
    } catch (err: any) {
      setError(err?.message || t('common.error'));
    } finally {
      setSending(false);
    }
  };

  const handleSuggestedAction = (action: string) => setInputMessage(action);

  const fetchSuggestions = async () => {
    try {
      const data = await copilotService.getSuggestions(selectedContext);
      setSuggestions(data.map((s: any) => ({ id: s.id || `suggestion-${Date.now()}`, title: s.title || s.label || 'Suggestion', description: s.description || '', category: s.category || 'General', priority: s.priority || 'Medium' })));
    } catch (err) {
      console.error('Error fetching suggestions:', err);
    }
  };

  const fetchInsights = async () => {
    const data: any[] = [];
    setInsights(data.map((i: any) => ({ id: i.id || `insight-${Date.now()}`, title: i.title || 'Insight', description: i.description || '', severity: i.severity || 'Info', metrics: i.metrics || {}, recommendations: i.recommendations || [] })));
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    setError('');
    try {
      const data = { results: { summary: 'Analysis functionality not currently available', findings: [] } };
      setAnalysisResult({ summary: data.results?.summary || '', findings: data.results?.findings?.map((f: any) => ({ category: f.type || 'General', severity: f.severity || 'medium', description: f.description || '', recommendation: f.recommendation || '' })) || [], score: 0 });
      setSidebarTab('analysis');
    } catch (err: any) {
      setError(err?.message || t('common.error'));
    } finally {
      setAnalyzing(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = { High: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300', Medium: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300', Low: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' };
    return colors[priority] || 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
  };

  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = { Critical: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300', Warning: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300', Info: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' };
    return colors[severity] || 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
  };

  const getContextIcon = (context: ContextType) => {
    const icons: Record<string, React.ReactNode> = { Dashboard: <BarChart3 className="w-4 h-4" />, User: <User className="w-4 h-4" />, Application: <AppWindow className="w-4 h-4" />, Incident: <AlertTriangle className="w-4 h-4" />, Policy: <FileText className="w-4 h-4" />, Hunt: <Search className="w-4 h-4" />, Generic: <MessageSquare className="w-4 h-4" /> };
    return icons[context] || <MessageSquare className="w-4 h-4" />;
  };

  if (loading && !conversations.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50 to-purple-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-64px)] flex bg-gradient-to-br from-slate-50 via-violet-50 to-purple-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      <Helmet><title>{t('tenant.copilot.pageTitle')}</title></Helmet>

      {/* Conversation History Sidebar */}
      <AnimatePresence>
        {showHistory && (
          <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: 320, opacity: 1 }} exit={{ width: 0, opacity: 0 }} className="border-r border-gray-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm flex flex-col">
            <div className="p-4 border-b border-gray-200 dark:border-slate-700">
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleNewConversation} className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all">
                <Plus className="w-5 h-5" /><span>{t('tenant.copilot.newConversation')}</span>
              </motion.button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {conversations.length === 0 ? (
                <div className="p-4 text-center">
                  <MessageSquare className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400 text-sm">{t('tenant.copilot.noConversationsYet')}</p>
                </div>
              ) : (
                conversations.map((conv, idx) => (
                  <motion.div key={conv.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }} onClick={() => handleSelectConversation(conv)} className={`p-4 border-b border-gray-100 dark:border-slate-700/50 cursor-pointer hover:bg-violet-50 dark:hover:bg-slate-700/50 transition-colors ${activeConversationId === conv.id ? 'bg-violet-100 dark:bg-violet-900/30 border-l-4 border-l-violet-500' : ''}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-violet-500">{getContextIcon(conv.contextType as ContextType)}</span>
                      <span className="font-medium text-sm text-gray-900 dark:text-white truncate">{conv.title}</span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{new Date(conv.lastMessageAt).toLocaleDateString()}</div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="p-4 border-b border-gray-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setShowHistory(!showHistory)} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
              <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </motion.button>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl shadow-lg">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">{t('tenant.copilot.title')}</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t('tenant.copilot.subtitle')}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600 dark:text-gray-400">{t('tenant.copilot.context')}:</label>
              <select value={selectedContext} onChange={(e) => setSelectedContext(e.target.value as ContextType)} className="px-3 py-1.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent">
                {contextTypes.map((ctx) => <option key={ctx} value={ctx}>{ctx}</option>)}
              </select>
            </div>
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setShowSidebar(!showSidebar)} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
              {showSidebar ? <PanelRightClose className="w-5 h-5 text-gray-600 dark:text-gray-400" /> : <PanelRightOpen className="w-5 h-5 text-gray-600 dark:text-gray-400" />}
            </motion.button>
          </div>
        </motion.div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mx-4 mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl flex items-center space-x-3">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
              <span className="text-red-700 dark:text-red-300">{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="h-full flex items-center justify-center">
              <div className="text-center max-w-md">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('tenant.copilot.welcomeTitle')}</h2>
                <p className="text-gray-500 dark:text-gray-400 mb-6">{t('tenant.copilot.welcomeMessage')}</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {[t('tenant.copilot.suggestion1'), t('tenant.copilot.suggestion2'), t('tenant.copilot.suggestion3')].map((suggestion) => (
                    <motion.button key={suggestion} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setInputMessage(suggestion)} className="px-4 py-2 text-sm bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-full hover:bg-violet-50 dark:hover:bg-violet-900/20 hover:border-violet-300 dark:hover:border-violet-600 transition-colors text-gray-700 dark:text-gray-300">
                      {suggestion}
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <AnimatePresence>
              {messages.map((message, idx) => (
                <motion.div key={message.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] rounded-2xl p-4 shadow-lg ${message.role === 'user' ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white' : 'bg-white dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-200 dark:border-slate-700'}`}>
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    <div className={`text-xs mt-2 ${message.role === 'user' ? 'text-violet-200' : 'text-gray-500 dark:text-gray-400'}`}>{new Date(message.timestamp).toLocaleTimeString()}</div>
                    {message.suggestedActions && message.suggestedActions.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-slate-700">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{t('tenant.copilot.suggestedActions')}:</p>
                        <div className="flex flex-wrap gap-2">
                          {message.suggestedActions.map((action, i) => (
                            <motion.button key={i} whileHover={{ scale: 1.05 }} onClick={() => handleSuggestedAction(action)} className="px-3 py-1 text-xs bg-gray-100 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-full hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-colors">
                              {action}
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-gray-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
          <form onSubmit={handleSendMessage} className="flex gap-3">
            <input type="text" value={inputMessage} onChange={(e) => setInputMessage(e.target.value)} placeholder={t('tenant.copilot.inputPlaceholder')} className="flex-1 px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent" disabled={sending} />
            <motion.button type="submit" disabled={sending || !inputMessage.trim()} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-all">
              {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-5 h-5" /><span>{t('common.send')}</span></>}
            </motion.button>
          </form>
        </div>
      </div>

      {/* Right Sidebar - Suggestions & Insights */}
      <AnimatePresence>
        {showSidebar && (
          <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: 384, opacity: 1 }} exit={{ width: 0, opacity: 0 }} className="border-l border-gray-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm flex flex-col">
            <div className="p-4 border-b border-gray-200 dark:border-slate-700">
              <div className="flex gap-2 mb-3">
                {[{ key: 'suggestions', label: t('tenant.copilot.suggestions'), icon: <Lightbulb className="w-4 h-4" /> }, { key: 'insights', label: t('tenant.copilot.insights'), icon: <Activity className="w-4 h-4" /> }, { key: 'analysis', label: t('tenant.copilot.analysis'), icon: <TrendingUp className="w-4 h-4" /> }].map((tab) => (
                  <motion.button key={tab.key} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setSidebarTab(tab.key as SidebarTab)} className={`flex-1 py-2 px-3 text-sm rounded-lg flex items-center justify-center space-x-1 transition-all ${sidebarTab === tab.key ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg' : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'}`}>
                    {tab.icon}<span className="hidden xl:inline">{tab.label}</span>
                  </motion.button>
                ))}
              </div>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleAnalyze} disabled={analyzing} className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 transition-all">
                {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                <span>{analyzing ? t('tenant.copilot.analyzing') : t('tenant.copilot.analyzeSecurity')}</span>
              </motion.button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {sidebarTab === 'suggestions' && (
                <div className="space-y-3">
                  {suggestions.length > 0 ? suggestions.map((suggestion, idx) => (
                    <motion.div key={suggestion.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} className="bg-white dark:bg-slate-700/50 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-slate-600 hover:shadow-md transition-all">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{suggestion.title}</h4>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(suggestion.priority)}`}>{suggestion.priority}</span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{suggestion.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500 dark:text-gray-400">{suggestion.category}</span>
                        <motion.button whileHover={{ scale: 1.05 }} onClick={() => setInputMessage(suggestion.title)} className="text-xs text-violet-600 dark:text-violet-400 hover:text-violet-800 font-medium">{t('tenant.copilot.askCopilot')}</motion.button>
                      </div>
                    </motion.div>
                  )) : (
                    <div className="text-center py-8">
                      <Lightbulb className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">{t('tenant.copilot.noSuggestionsAvailable')}</p>
                    </div>
                  )}
                </div>
              )}

              {sidebarTab === 'insights' && (
                <div className="space-y-3">
                  {insights.length > 0 ? insights.map((insight, idx) => (
                    <motion.div key={insight.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} className="bg-white dark:bg-slate-700/50 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-slate-600">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{insight.title}</h4>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getSeverityColor(insight.severity)}`}>{insight.severity}</span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">{insight.description}</p>
                      {Object.keys(insight.metrics).length > 0 && (
                        <div className="mb-3 p-2 bg-gray-50 dark:bg-slate-800 rounded-lg">
                          <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tenant.copilot.metrics')}:</p>
                          {Object.entries(insight.metrics).map(([key, value]) => (
                            <div key={key} className="text-xs text-gray-600 dark:text-gray-400 flex justify-between"><span>{key}:</span><span className="font-medium">{String(value)}</span></div>
                          ))}
                        </div>
                      )}
                      {insight.recommendations.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tenant.copilot.recommendations')}:</p>
                          <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                            {insight.recommendations.map((rec, i) => <li key={i} className="flex items-start"><span className="mr-1">•</span><span>{rec}</span></li>)}
                          </ul>
                        </div>
                      )}
                    </motion.div>
                  )) : (
                    <div className="text-center py-8">
                      <Activity className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">{t('tenant.copilot.noInsightsAvailable')}</p>
                    </div>
                  )}
                </div>
              )}

              {sidebarTab === 'analysis' && (
                <div>
                  {analysisResult ? (
                    <div className="space-y-4">
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-slate-700/50 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-slate-600">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">{t('tenant.copilot.securityScore')}</h4>
                        <div className="flex items-center">
                          <div className="flex-1 bg-gray-200 dark:bg-slate-600 rounded-full h-3">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${analysisResult.score}%` }} transition={{ duration: 1 }} className={`h-3 rounded-full ${analysisResult.score >= 80 ? 'bg-gradient-to-r from-green-500 to-emerald-600' : analysisResult.score >= 60 ? 'bg-gradient-to-r from-yellow-500 to-amber-600' : 'bg-gradient-to-r from-red-500 to-rose-600'}`} />
                          </div>
                          <span className="ml-3 text-xl font-bold text-gray-900 dark:text-white">{analysisResult.score}</span>
                        </div>
                      </motion.div>
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white dark:bg-slate-700/50 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-slate-600">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">{t('tenant.copilot.summary')}</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{analysisResult.summary}</p>
                      </motion.div>
                      {analysisResult.findings.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{t('tenant.copilot.findings')}</h4>
                          {analysisResult.findings.map((finding, idx) => (
                            <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + idx * 0.05 }} className="bg-white dark:bg-slate-700/50 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-slate-600">
                              <div className="flex items-start justify-between mb-2">
                                <span className="text-xs font-medium text-gray-900 dark:text-white">{finding.category}</span>
                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${getSeverityColor(finding.severity)}`}>{finding.severity}</span>
                              </div>
                              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{finding.description}</p>
                              <div className="text-xs text-violet-600 dark:text-violet-400"><span className="font-medium">{t('tenant.copilot.recommendation')}:</span> {finding.recommendation}</div>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <TrendingUp className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{t('tenant.copilot.noAnalysisResults')}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">{t('tenant.copilot.clickToAnalyze')}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
