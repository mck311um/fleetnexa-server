import pino from "pino";
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV || "development",
  tracesSampleRate: 1.0,
  sendDefaultPii: true,
});

const transport =
  process.env.NODE_ENV === "development"
    ? pino.transport({
        target: "pino-pretty",
        options: { colorize: true },
      })
    : undefined;

const pinoLogger = transport
  ? pino({ level: process.env.LOG_LEVEL || "info" }, transport)
  : pino({ level: process.env.LOG_LEVEL || "info" });

export const logger = {
  i: (message: string, meta?: any) => {
    pinoLogger.info(meta || {}, message);
  },

  w: (message: string, meta?: any) => {
    pinoLogger.warn(meta || {}, message);
  },

  e: (error: any, message = "Error occurred", meta?: any) => {
    pinoLogger.error({ err: error, ...meta }, message);

    Sentry.captureException(
      error instanceof Error ? error : new Error(String(error)),
      {
        extra: meta,
      }
    );
  },
};
