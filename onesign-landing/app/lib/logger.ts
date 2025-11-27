/**
 * Structured logging utility
 * Provides consistent logging across the application
 */

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

type LogContext = {
  [key: string]: any;
};

class Logger {
  private context: LogContext = {};

  constructor(private defaultContext: LogContext = {}) {
    this.context = defaultContext;
  }

  private formatMessage(level: LogLevel, message: string, context?: LogContext) {
    const timestamp = new Date().toISOString();
    const mergedContext = { ...this.context, ...context };

    return {
      timestamp,
      level,
      message,
      ...mergedContext,
      environment: process.env.NODE_ENV,
    };
  }

  private log(level: LogLevel, message: string, context?: LogContext) {
    const formatted = this.formatMessage(level, message, context);

    // In production, you might want to send to a logging service
    if (process.env.NODE_ENV === 'production') {
      // Send to logging service (e.g., Sentry, LogRocket, etc.)
      // this.sendToLoggingService(formatted);
    }

    // Console output
    const consoleMethod = level === LogLevel.ERROR ? 'error' :
                         level === LogLevel.WARN ? 'warn' :
                         level === LogLevel.DEBUG ? 'debug' : 'log';

    console[consoleMethod](JSON.stringify(formatted, null, 2));
  }

  debug(message: string, context?: LogContext) {
    if (process.env.NODE_ENV === 'development') {
      this.log(LogLevel.DEBUG, message, context);
    }
  }

  info(message: string, context?: LogContext) {
    this.log(LogLevel.INFO, message, context);
  }

  warn(message: string, context?: LogContext) {
    this.log(LogLevel.WARN, message, context);
  }

  error(message: string, error?: Error, context?: LogContext) {
    this.log(LogLevel.ERROR, message, {
      ...context,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : undefined,
    });
  }

  withContext(context: LogContext) {
    return new Logger({ ...this.context, ...context });
  }
}

// Export singleton instance
export const logger = new Logger({
  service: 'onesign-landing',
  version: '1.0.0',
});

// Export class for custom instances
export { Logger };
