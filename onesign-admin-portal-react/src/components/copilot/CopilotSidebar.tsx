import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Bot, Loader2, Send, Sparkles, X } from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';
import { useCopilotContext } from '@/app/contexts/CopilotContext';
import {
  copilotService,
  type CopilotSuggestedAction,
  type CopilotScope,
} from '@/lib/api/services/copilot.service';
import { useDirection } from '@/hooks/useDirection';
import { cn } from '@/utils/cn';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  suggestedActions?: CopilotSuggestedAction[];
}

const COPILOT_WIDTH = 400;

function normalizeNavigationUrl(url: string | undefined, scope: CopilotScope): string | null {
  if (!url) return null;
  if (url.startsWith('/tenant') || url.startsWith('/global')) return url;
  const prefix = scope === 'global' ? '/global' : '/tenant';
  if (url.startsWith('/')) return `${prefix}${url}`;
  return url;
}

export const CopilotSidebar: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { isRTL } = useDirection();
  const { copilotOpen, setCopilotOpen } = useUIStore();
  const { pageContext, scope } = useCopilotContext();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  const activeScope: CopilotScope | null = scope;

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, copilotOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sending || !activeScope) return;

    setError('');
    setSending(true);
    const text = input.trim();
    setInput('');
    setMessages((prev) => [
      ...prev,
      { id: `u-${Date.now()}`, role: 'user', content: text },
    ]);

    try {
      const result = await copilotService.sendQuery(activeScope, {
        message: text,
        contextType: pageContext.contextType,
        contextId: pageContext.contextId,
        conversationId: conversationId ?? undefined,
        locale: i18n.language?.startsWith('fa') ? 'fa' : 'en',
      });
      setConversationId(result.conversationId);
      setMessages((prev) => [
        ...prev,
        {
          id: result.messageId,
          role: 'assistant',
          content: result.answerText,
          suggestedActions: result.suggestedActions,
        },
      ]);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t('common.error');
      setError(message);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: t('tenant.copilot.queryUnavailable', 'Unable to reach Copilot. Please try again.'),
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  const handleAction = useCallback(
    async (action: CopilotSuggestedAction) => {
      if (!activeScope) return;
      const params: Record<string, string> = {};
      if (action.parameters) {
        for (const [k, v] of Object.entries(action.parameters)) {
          if (v != null) params[k] = String(v);
        }
      }
      if (pageContext.contextId && !params.contextId) {
        params.contextId = pageContext.contextId;
      }

      try {
        const result = await copilotService.executeAction(activeScope, action.type, params);
        const url = normalizeNavigationUrl(result?.resultUrl, activeScope);
        if (url) {
          navigate(url);
          return;
        }
        if (result?.createdEntityId) {
          const draftType = action.type.toLowerCase();
          if (draftType.includes('automation')) {
            navigate(`/tenant/automation/designer?draft=${result.createdEntityId}`);
          } else if (draftType.includes('hunt')) {
            navigate(`/tenant/hunting?draft=${result.createdEntityId}`);
          }
        }
        if (result?.message) {
          setMessages((prev) => [
            ...prev,
            { id: `act-${Date.now()}`, role: 'assistant', content: result.message },
          ]);
        }
      } catch {
        setError(t('common.error'));
      }
    },
    [activeScope, navigate, pageContext.contextId, t]
  );

  if (!activeScope) return null;

  const sideClass = isRTL ? 'left-0 border-r' : 'right-0 border-l';

  return (
    <AnimatePresence>
      {copilotOpen && (
        <motion.aside
          key="copilot-sidebar"
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: COPILOT_WIDTH, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
          className={cn(
            'fixed top-16 bottom-0 z-40 flex flex-col bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 shadow-xl',
            sideClass
          )}
          style={{ [isRTL ? 'left' : 'right']: 0 }}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                  {t('tenant.copilot.title', 'OneSign Copilot')}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {pageContext.contextType}
                  {pageContext.contextId ? ` · ${pageContext.contextId.slice(0, 8)}…` : ''}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setCopilotOpen(false)}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label={t('common.close', 'Close')}
            >
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.length === 0 && (
              <div className="text-center text-sm text-slate-500 dark:text-slate-400 py-8">
                <Sparkles className="w-8 h-8 mx-auto mb-2 text-violet-400" />
                <p>{t('tenant.copilot.askAnything', 'Ask about security, policies, or this page.')}</p>
              </div>
            )}
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  'rounded-xl px-3 py-2 text-sm max-w-[95%]',
                  msg.role === 'user'
                    ? 'ml-auto bg-violet-600 text-white'
                    : 'mr-auto bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                )}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
                {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {msg.suggestedActions.map((action, idx) => (
                      <button
                        key={`${action.type}-${idx}`}
                        type="button"
                        onClick={() => handleAction(action)}
                        className="text-xs px-2 py-1 rounded-md bg-white/90 dark:bg-slate-700 text-violet-700 dark:text-violet-300 hover:opacity-90"
                      >
                        {action.label || action.type}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div ref={endRef} />
          </div>

          {error && (
            <p className="px-4 text-xs text-red-600 dark:text-red-400">{error}</p>
          )}

          <form onSubmit={handleSend} className="p-3 border-t border-slate-200 dark:border-slate-700 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t('tenant.copilot.inputPlaceholder', 'Ask Copilot…')}
              className="flex-1 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white"
              disabled={sending}
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              className="p-2 rounded-lg bg-violet-600 text-white disabled:opacity-50"
            >
              {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
          </form>
        </motion.aside>
      )}
    </AnimatePresence>
  );
};

export const COPILOT_PANEL_WIDTH = COPILOT_WIDTH;
