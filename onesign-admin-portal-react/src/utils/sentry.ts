import * as Sentry from '@sentry/react';

export const initSentry = () => {
  if (import.meta.env.PROD && import.meta.env.VITE_SENTRY_DSN) {
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration({
          maskAllText: true,
          blockAllMedia: true,
        }),
      ],

      // Performance Monitoring
      tracesSampleRate: 1.0,

      // Session Replay
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,

      // Environment
      environment: import.meta.env.MODE,

      // Release tracking
      release: import.meta.env.VITE_APP_VERSION,

      // Error filtering
      beforeSend(event, hint) {
        // Filter out certain errors
        if (event.exception) {
          const error = hint.originalException;

          // Ignore network errors
          if (error instanceof Error && error.message.includes('Network')) {
            return null;
          }

          // Ignore cancelled requests
          if (error instanceof Error && error.message.includes('cancel')) {
            return null;
          }
        }

        return event;
      },

      // Ignore certain errors
      ignoreErrors: [
        // Browser extensions
        'top.GLOBALS',
        'ResizeObserver loop limit exceeded',
        'ResizeObserver loop completed with undelivered notifications',
        // Random plugins/extensions
        'Can\'t find variable: ZiteReader',
        'jigsaw is not defined',
        'ComboSearch is not defined',
        // Facebook blocked
        'fb_xd_fragment',
      ],

      // Ignore certain URLs
      denyUrls: [
        // Browser extensions
        /extensions\//i,
        /^chrome:\/\//i,
        /^moz-extension:\/\//i,
      ],
    });
  }
};

// Custom error boundary component
export const ErrorBoundary = Sentry.ErrorBoundary;

// Capture exception manually
export const captureException = Sentry.captureException;

// Capture message
export const captureMessage = Sentry.captureMessage;

// Set user context
export const setUser = (user: { id: string; email: string; name?: string }) => {
  Sentry.setUser(user);
};

// Clear user context on logout
export const clearUser = () => {
  Sentry.setUser(null);
};

// Add breadcrumb
export const addBreadcrumb = (breadcrumb: {
  message: string;
  category?: string;
  level?: 'fatal' | 'error' | 'warning' | 'info' | 'debug';
  data?: Record<string, any>;
}) => {
  Sentry.addBreadcrumb(breadcrumb);
};

// Set context
export const setContext = (name: string, context: Record<string, any>) => {
  Sentry.setContext(name, context);
};

// Set tag
export const setTag = (key: string, value: string) => {
  Sentry.setTag(key, value);
};
