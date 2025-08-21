import prisma from "../config/prisma.config";
import { Request, Response } from "express";
import logUtil from "../config/logger.config";

const healthCheck = async (req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.status(200).json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      services: {
        database: "connected",
      },
    });
  } catch (error) {
    logUtil.logger.error("Health check failed:", error);

    res.status(500).json({
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      services: {
        database: "disconnected",
      },
    });
  }
};

export default {
  healthCheck,
};
