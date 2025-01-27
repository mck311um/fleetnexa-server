import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).json({ error: "Authorization token is required" });
  }

  const token = authorization.split(" ")[1];

  try {
    const { id, tenantCode } = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as { id: number; tenantCode: string };

    const tenant = await prisma.tenant.findUnique({
      where: { tenantCode: tenantCode },
    });

    if (!tenant) {
      return res.status(401).json({ error: "Invalid tenant code" });
    }

    const user = await prisma.user.findUnique({
      where: { id: id },
      include: { tenant: true },
    });

    if (!user || user.tenant.tenantCode !== tenantCode) {
      return res
        .status(401)
        .json({ error: "User not found or invalid tenant" });
    }

    req.user = user;
    req.tenant = tenant;

    next();
  } catch (error) {
    return res.status(403).json({ error: "Invalid or expired token" });
  }
};

export default requireAuth;
