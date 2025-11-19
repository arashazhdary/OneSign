'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { getTenantId } from '@/lib/tenant-context';

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

type ContextType = 'Dashboard' | 'User' | 'Application' | 'Incident' | 'Policy' | 'Hunt' | 'Generic';

export default function TenantCopilotPage() {
  const t = useTranslations();
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

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const contextTypes: ContextType[] = ['Dashboard', 'User', 'Application', 'Incident', 'Policy', 'Hunt', 'Generic'];

  useEffect(() => {
    const contextTenantId = getTenantId();
    setTenantIdState(contextTenantId || '00000000-0000-0000-0000-000000000000');
  }, []);

  useEffect(() => {
    if (tenantId) {
      fetchConversations();
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
      const response = await fetch(`http://localhost:7000/api/copilot/conversations?tenantId=${tenantId}`);
      if (response.ok) {
        const data = await response.json();
        setConversations(data.items || []);
      }
    } catch (err) {
      console.error('Error fetching conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const response = await fetch(`http://localhost:7000/api/copilot/conversations/${conversationId}/messages?tenantId=${tenantId}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.items || []);
      }
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
      const response = await fetch(`http://localhost:7000/api/copilot/chat?tenantId=${tenantId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: activeConversationId,
          contextType: selectedContext,
          message: inputMessage,
        }),
      });

      if (response.ok) {
        const data = await response.json();

        const assistantMessage: Message = {
          id: data.messageId || `assistant-${Date.now()}`,
          role: 'assistant',
          content: data.response,
          timestamp: new Date(),
          suggestedActions: data.suggestedActions,
        };

        setMessages(prev => [...prev, assistantMessage]);

        if (!activeConversationId && data.conversationId) {
          setActiveConversationId(data.conversationId);
          fetchConversations();
        }
      } else {
        const errorData = await response.json();
        setError(errorData.errorMessage || t('common.error'));
      }
    } catch (err) {
      setError(t('common.error'));
      console.error('Error sending message:', err);
    } finally {
      setSending(false);
    }
  };

  const handleSuggestedAction = (action: string) => {
    setInputMessage(action);
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
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-xl font-bold">OneSign Copilot</h1>
          </div>
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
    </div>
  );
}
