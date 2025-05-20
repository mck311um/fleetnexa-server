import { NextFunction, Request, Response } from "express";
import logUtil from "../config/logger.config";

const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const status = err.statusCode || 500;
  const message = err.message || "Internal server error";

  logUtil.logger.error(
    "Error [%s]: %s",
    req.method + " " + req.originalUrl,
    message,
    {
      stack: err.stack,
      status,
    }
  );

  res.status(status).json({
    error: message,
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
};

export default errorHandler;
