import { Request, Response } from "express";
import prisma from "../config/prisma.config";
import logUtil from "../config/logger.config";

const healthCheck = async (req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    if (req.method === "HEAD") {
      return res.sendStatus(200); // Only headers, no body
    }

    res.status(200).json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      services: {
        database: "connected",
      },
    });
  } catch (error) {
    logUtil.logger.error("Health check failed:", error);

    if (req.method === "HEAD") {
      return res.sendStatus(500);
    }

    res.status(500).json({
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      services: {
        database: "disconnected",
      },
    });
  }
};

export default { healthCheck };
