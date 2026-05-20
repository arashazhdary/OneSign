import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';

export type CopilotContextType =
  | 'Dashboard'
  | 'Incident'
  | 'Policy'
  | 'ChangeSet'
  | 'Hunting'
  | 'Automation'
  | 'Generic';

export interface CopilotPageContext {
  contextType: CopilotContextType;
  contextId?: string;
  label?: string;
}

interface CopilotContextValue {
  pageContext: CopilotPageContext;
  setPageContext: (ctx: CopilotPageContext) => void;
  scope: 'tenant' | 'global' | null;
}

const CopilotContext = createContext<CopilotContextValue | null>(null);

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function resolveCopilotContextFromPath(pathname: string): CopilotPageContext {
  const rules: Array<{ pattern: RegExp; type: CopilotContextType; idGroup?: number }> = [
    { pattern: /^\/tenant\/incidents\/([^/]+)/, type: 'Incident', idGroup: 1 },
    { pattern: /^\/tenant\/policies\/([^/]+)/, type: 'Policy', idGroup: 1 },
    { pattern: /^\/tenant\/change-management/, type: 'ChangeSet' },
    { pattern: /^\/tenant\/hunting/, type: 'Hunting' },
    { pattern: /^\/tenant\/automation/, type: 'Automation' },
    { pattern: /^\/tenant(\/dashboard)?\/?$/, type: 'Dashboard' },
    { pattern: /^\/global\/tenants\/([^/]+)/, type: 'Dashboard', idGroup: 1 },
    { pattern: /^\/global\/change-management/, type: 'ChangeSet' },
    { pattern: /^\/global/, type: 'Dashboard' },
  ];

  for (const rule of rules) {
    const match = pathname.match(rule.pattern);
    if (match) {
      const rawId = rule.idGroup != null ? match[rule.idGroup] : undefined;
      const contextId = rawId && UUID_RE.test(rawId) ? rawId : undefined;
      return { contextType: rule.type, contextId };
    }
  }

  return { contextType: 'Generic' };
}

export function CopilotProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const routeContext = useMemo(
    () => resolveCopilotContextFromPath(location.pathname),
    [location.pathname]
  );

  const scope = useMemo(() => {
    if (location.pathname.startsWith('/tenant')) return 'tenant' as const;
    if (location.pathname.startsWith('/global')) return 'global' as const;
    return null;
  }, [location.pathname]);

  const [override, setOverride] = useState<CopilotPageContext | null>(null);
  const pageContext = override ?? routeContext;

  const value = useMemo(
    () => ({
      pageContext,
      setPageContext: setOverride,
      scope,
    }),
    [pageContext, scope]
  );

  return <CopilotContext.Provider value={value}>{children}</CopilotContext.Provider>;
}

export function useCopilotContext() {
  const ctx = useContext(CopilotContext);
  if (!ctx) {
    throw new Error('useCopilotContext must be used within CopilotProvider');
  }
  return ctx;
}

export function useCopilotContextOptional() {
  return useContext(CopilotContext);
}
