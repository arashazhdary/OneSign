'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';

/**
 * Live Chat Integration Component
 * Integrates with Intercom, Crisp, or custom chat solution
 */

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'agent';
  timestamp: Date;
}

export function LiveChat() {
  const t = useTranslations('landing');
  const locale = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: t('chat.greeting'),
      sender: 'agent',
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Initialize chat widget (would connect to real service)
  useEffect(() => {
    // In production, initialize your chat service here
    // Example: window.Intercom?.('boot', { app_id: 'your_app_id' });
    return () => {
      // Cleanup
    };
  }, []);

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate agent response
    setTimeout(() => {
      const responses = [
        t('chat.responses.connecting'),
        t('chat.responses.moreDetails'),
        t('chat.responses.checkingDocs'),
        t('chat.responses.gettingAnswer'),
      ];

      const agentMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: responses[Math.floor(Math.random() * responses.length)],
        sender: 'agent',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, agentMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickReplies = [
    t('chat.quickReplies.docs'),
    t('chat.quickReplies.pricing'),
    t('chat.quickReplies.getStarted'),
    t('chat.quickReplies.support'),
  ];

  return (
    <>
      {/* Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 w-16 h-16 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-2xl flex items-center justify-center text-2xl z-50 transition-colors"
          >
            💬
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 w-96 h-[600px] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl flex flex-col z-50 border border-gray-200 dark:border-gray-700"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-xl">
                  👋
                </div>
                <div>
                  <h3 className="font-semibold">{t('chat.title')}</h3>
                  <div className="flex items-center gap-1 text-xs">
                    <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                    <span>{t('chat.online')}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-white/20 p-2 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                      message.sender === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                    <p
                      className={`text-xs mt-1 ${
                        message.sender === 'user'
                          ? 'text-blue-100'
                          : 'text-gray-500 dark:text-gray-500'
                      }`}
                    >
                      {message.timestamp.toLocaleTimeString(locale, {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl px-4 py-3">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></span>
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Replies */}
            {messages.length === 1 && (
              <div className="px-4 pb-2">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                  {t('chat.quickRepliesLabel')}
                </p>
                <div className="flex flex-wrap gap-2">
                  {quickReplies.map((reply) => (
                    <button
                      key={reply}
                      onClick={() => {
                        setInputMessage(reply);
                        handleSendMessage();
                      }}
                      className="px-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      {reply}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={t('chat.placeholder')}
                  className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-full focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim()}
                  className="w-10 h-10 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-full flex items-center justify-center transition-colors"
                >
                  ➤
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-2 text-center">
                {t('chat.typicalReply')}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/**
 * Hook to programmatically open/close chat
 */
export function useLiveChat() {
  const [isOpen, setIsOpen] = useState(false);

  return {
    openChat: () => setIsOpen(true),
    closeChat: () => setIsOpen(false),
    isOpen,
  };
}
