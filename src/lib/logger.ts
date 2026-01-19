/**
 * Logger utility - Logs only in development, can be extended for production monitoring
 */

type LogLevel = 'log' | 'info' | 'warn' | 'error';

interface LoggerOptions {
  context?: string;
  metadata?: Record<string, any>;
}

class Logger {
  private isDev = process.env.NODE_ENV === 'development';

  private log(level: LogLevel, message: string, options?: LoggerOptions) {
    if (this.isDev) {
      const prefix = options?.context ? `[${options.context}]` : '';
      const logFn = console[level] || console.log;
      
      if (options?.metadata) {
        logFn(prefix, message, options.metadata);
      } else {
        logFn(prefix, message);
      }
    }

    // In production, you can send to monitoring service (Sentry, LogRocket, etc.)
    if (!this.isDev && level === 'error') {
      // Example: window.Sentry?.captureException(new Error(message), { tags: options?.metadata });
    }
  }

  debug(message: string, options?: LoggerOptions) {
    this.log('log', message, options);
  }

  info(message: string, options?: LoggerOptions) {
    this.log('info', message, options);
  }

  warn(message: string, options?: LoggerOptions) {
    this.log('warn', message, options);
  }

  error(message: string, options?: LoggerOptions) {
    this.log('error', message, options);
  }
}

export const logger = new Logger();
