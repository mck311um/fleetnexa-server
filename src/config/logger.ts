import fs from 'fs';
import path from 'path';
import pino from 'pino';
import * as Sentry from '@sentry/node';

const getLogDir = () => {
  if (process.env.NODE_ENV === 'production') {
    return '/var/log/fleetnexa';
  } else {
    return path.join(process.cwd(), 'logs');
  }
};

const logDir = getLogDir();
const logFilePath = path.join(logDir, 'backend.log');

const ensureLogDirExists = () => {
  try {
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
      console.log(`Log directory created: ${logDir}`);
    }
  } catch (error) {
    console.warn(
      `Could not create log directory ${logDir}, using fallback:`,
      error,
    );
    return false;
  }
  return true;
};

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.ENVIRONMENT || 'development',
  tracesSampleRate: 1.0,
  sendDefaultPii: true,
});

const streams = [];

streams.push({
  stream: pino.transport({
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname',
    },
  }),
});

let logFileStream: fs.WriteStream | null = null;
if (ensureLogDirExists()) {
  try {
    logFileStream = fs.createWriteStream(logFilePath, {
      flags: 'a',
    });
    streams.push({ stream: logFileStream });
  } catch (error) {
    console.error(
      'Failed to create log file stream, using console only:',
      error,
    );
  }
} else {
  console.log('File logging disabled - using console only');
}

const pinoLogger = pino(
  {
    level: process.env.LOG_LEVEL || 'info',
    timestamp: pino.stdTimeFunctions.isoTime,
  },
  pino.multistream(streams),
);

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

    Sentry.captureException(
      error instanceof Error ? error : new Error(String(error)),
      { extra: meta },
    );
  },
};
