// Jednoduchý logging systém
type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogContext {
  userId?: string;
  endpoint?: string;
  ip?: string;
  userAgent?: string;
  [key: string]: any;
}

class Logger {
  private isDev = process.env.NODE_ENV !== 'production';

  private formatMessage(
    level: LogLevel,
    message: string,
    context?: LogContext,
  ) {
    const timestamp = new Date().toISOString();
    const contextStr = context ? JSON.stringify(context) : '';

    return `[${timestamp}] ${level.toUpperCase()}: ${message} ${contextStr}`;
  }

  info(message: string, context?: LogContext) {
    console.log(this.formatMessage('info', message, context));
  }

  warn(message: string, context?: LogContext) {
    console.warn(this.formatMessage('warn', message, context));
  }

  error(message: string, error?: Error, context?: LogContext) {
    const errorContext = error
      ? {
          ...context,
          error: error.message,
          stack: this.isDev ? error.stack : undefined,
        }
      : context;

    console.error(this.formatMessage('error', message, errorContext));
  }

  debug(message: string, context?: LogContext) {
    if (this.isDev) {
      console.debug(this.formatMessage('debug', message, context));
    }
  }

  // Middleware pro Express logging
  requestLogger() {
    return (req: any, res: any, next: any) => {
      const start = Date.now();

      res.on('finish', () => {
        const duration = Date.now() - start;
        const context = {
          method: req.method,
          url: req.url,
          status: res.statusCode,
          duration: `${duration}ms`,
          ip: req.ip,
          userAgent: req.get('User-Agent'),
        };

        if (res.statusCode >= 400) {
          this.warn(`HTTP ${res.statusCode}`, context);
        } else {
          this.info(`HTTP ${res.statusCode}`, context);
        }
      });

      next();
    };
  }
}

export const logger = new Logger();
