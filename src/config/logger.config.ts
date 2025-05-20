import { createLogger, format, transports } from "winston";
import { Request, Response } from "express";

const logger = createLogger({
  level: "info",
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  transports: [
    new transports.Console({
      format: format.combine(format.colorize(), format.simple()),
    }),
  ],
});

const handleError = (res: Response, error: unknown, context: string) => {
  const message = error instanceof Error ? error.message : "Unknown error";

  logger.error("Error in %s: %s", context, message, {
    error,
    context,
  });

  if (process.env.NODE_ENV !== "production") {
    console.error(`Error in ${context}:`, error);
  }

  return res.status(500).json({
    error: "Internal server error",
    details: process.env.NODE_ENV !== "production" ? message : undefined,
  });
};

export default {
  logger,
  handleError,
};
