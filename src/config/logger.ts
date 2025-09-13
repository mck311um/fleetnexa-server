import pino from 'pino';
import * as Sentry from '@sentry/node';

if (process.env.NODE_ENV === 'production') {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: 'production',
    tracesSampleRate: 1.0,
    sendDefaultPii: true,
  });
}

const transport =
  process.env.NODE_ENV === 'development'
    ? pino.transport({
        target: 'pino-pretty',
        options: { colorize: true, translateTime: 'SYS:standard' },
      })
    : undefined;

const pinoLogger = transport
  ? pino(
      {
        level: process.env.LOG_LEVEL || 'info',
        timestamp: pino.stdTimeFunctions.isoTime,
      },
      transport,
    )
  : pino({
      level: process.env.LOG_LEVEL || 'info',
      timestamp: pino.stdTimeFunctions.isoTime,
    });

export const logger = {
  i: (message: string, meta?: Record<string, unknown>) => {
    pinoLogger.info(meta || {}, message);
  },

  w: (message: string, meta?: Record<string, unknown>) => {
    pinoLogger.warn(meta || {}, message);
  },

  e: (
    error: unknown,
    message = 'Error occurred',
    meta?: Record<string, unknown>,
  ) => {
    pinoLogger.error({ err: error, ...meta }, message);

    if (process.env.NODE_ENV === 'production') {
      Sentry.captureException(
        error instanceof Error ? error : new Error(String(error)),
        { extra: meta },
      );
    }
  },
};
