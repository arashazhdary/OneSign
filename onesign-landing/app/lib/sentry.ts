'use client';

/**
 * Sentry Error Tracking Integration
 * Provides comprehensive error monitoring and tracking
 */

interface SentryConfig {
  dsn: string;
  environment: string;
  enabled: boolean;
  tracesSampleRate: number;
  replaysSessionSampleRate: number;
  replaysOnErrorSampleRate: number;
}

interface SentryError {
  message: string;
  stack?: string;
  level: 'fatal' | 'error' | 'warning' | 'info' | 'debug';
  tags?: Record<string, string>;
  extra?: Record<string, any>;
}

class SentryService {
  private config: SentryConfig;
  private initialized: boolean = false;

  constructor() {
    this.config = {
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || '',
      environment: process.env.NEXT_PUBLIC_ENV || 'development',
      enabled: process.env.NEXT_PUBLIC_SENTRY_ENABLED === 'true',
      tracesSampleRate: 1.0,
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
    };
  }

  /**
   * Initialize Sentry
   */
  init(): void {
    if (this.initialized || !this.config.enabled || !this.config.dsn) {
      return;
    }

    try {
      // In a real implementation, you would import @sentry/nextjs here
      console.log('[Sentry] Initialized with config:', {
        environment: this.config.environment,
        tracesSampleRate: this.config.tracesSampleRate,
      });
      this.initialized = true;
    } catch (error) {
      console.error('[Sentry] Failed to initialize:', error);
    }
  }

  /**
   * Capture an exception
   */
  captureException(error: Error | string, context?: Partial<SentryError>): void {
    if (!this.config.enabled) {
      console.error('[Sentry] Error (disabled):', error);
      return;
    }

    const errorData: SentryError = {
      message: typeof error === 'string' ? error : error.message,
      stack: typeof error !== 'string' ? error.stack : undefined,
      level: context?.level || 'error',
      tags: context?.tags,
      extra: context?.extra,
    };

    console.error('[Sentry] Capturing exception:', errorData);

    // In production, this would send to Sentry:
    // Sentry.captureException(error, { ...context });
  }

  /**
   * Capture a message
   */
  captureMessage(message: string, level: SentryError['level'] = 'info'): void {
    if (!this.config.enabled) {
      console.log('[Sentry] Message (disabled):', message);
      return;
    }

    console.log(`[Sentry] Capturing message [${level}]:`, message);

    // In production: Sentry.captureMessage(message, level);
  }

  /**
   * Set user context
   */
  setUser(user: { id: string; email?: string; username?: string } | null): void {
    if (!this.config.enabled) {
      return;
    }

    console.log('[Sentry] Setting user context:', user);

    // In production: Sentry.setUser(user);
  }

  /**
   * Set custom tags
   */
  setTags(tags: Record<string, string>): void {
    if (!this.config.enabled) {
      return;
    }

    console.log('[Sentry] Setting tags:', tags);

    // In production: Sentry.setTags(tags);
  }

  /**
   * Add breadcrumb
   */
  addBreadcrumb(breadcrumb: {
    message: string;
    category?: string;
    level?: SentryError['level'];
    data?: Record<string, any>;
  }): void {
    if (!this.config.enabled) {
      return;
    }

    console.log('[Sentry] Adding breadcrumb:', breadcrumb);

    // In production: Sentry.addBreadcrumb(breadcrumb);
  }
}

// Singleton instance
export const sentry = new SentryService();

// Initialize on import
if (typeof window !== 'undefined') {
  sentry.init();
}

/**
 * Hook for manual error reporting
 */
export function useSentry() {
  return {
    captureException: (error: Error | string, context?: Partial<SentryError>) =>
      sentry.captureException(error, context),
    captureMessage: (message: string, level?: SentryError['level']) =>
      sentry.captureMessage(message, level),
    setUser: (user: { id: string; email?: string; username?: string } | null) =>
      sentry.setUser(user),
    addBreadcrumb: (breadcrumb: {
      message: string;
      category?: string;
      level?: SentryError['level'];
      data?: Record<string, any>;
    }) => sentry.addBreadcrumb(breadcrumb),
  };
}
