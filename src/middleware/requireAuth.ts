import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { AuthRequest } from "../types/express";

const prisma = new PrismaClient();

const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { authorization } = req.headers;

  if (!authorization) {
    res.status(401).json({ error: "Authorization token is required" });
    return;
  }

  const token = authorization.split(" ")[1];

  try {
    const { userId, tenantCode } = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as { userId: string; tenantCode: string };

    const tenant = await prisma.tenant.findUnique({
      where: { tenantCode: tenantCode },
    });

    if (!tenant) {
      res.status(401).json({ error: "Invalid tenant code" });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { tenant: true },
    });

    if (!user || user.tenant.tenantCode !== tenantCode) {
      res.status(401).json({ error: "User not found or invalid tenant" });
      return;
    }

    req.user = user;
    req.tenant = tenant;

    next();
  } catch (error: any) {
    res.status(403).json({ error: error.message });
    return;
  }
};

export default requireAuth;
