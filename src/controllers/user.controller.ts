import { NextFunction, Request, Response } from "express";
import prisma from "../config/prisma.config";
import logUtil from "../config/logger.config";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user?.id },
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        tenantId: true,
        createdAt: true,
        email: true,
        theme: true,
        color: true,
        roleId: true,
        role: {
          include: {
            rolePermission: {
              include: {
                permission: true,
              },
            },
          },
        },
        tenant: {
          select: {
            tenantCode: true,
            tenantName: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userData = {
      id: user.id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      initials: `${user.firstName[0]}${user.lastName[0]}`,
      fullName: `${user.firstName} ${user.lastName}`,
      tenantId: user.tenantId,
      tenant: user.tenant?.tenantCode,
      tenantName: user.tenant?.tenantName,
      createdAt: user.createdAt,
      theme: user.theme,
      color: user.color,
    };

    res.json(userData);
  } catch (error: any) {
    logUtil.handleError(res, error, "fetching current user");
  }
};
const getTenantUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const tenantId = req.user?.tenantId;
  try {
    const users = await prisma.user.findMany({
      where: { tenantId },
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        tenantId: true,
        createdAt: true,
        email: true,
        theme: true,
        color: true,
        roleId: true,
        role: {
          include: {
            rolePermission: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    res.status(201).json(users);
  } catch (error) {
    next(error);
  }
};
const createTenantUser = async (req: Request, res: Response) => {
  const { firstName, lastName, email, roleId } = req.body;
  const tenantId = req.user?.tenantId;

  try {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    let username = "";
    let attempt = 1;

    while (true) {
      const prefix = firstName.substring(0, attempt).toLowerCase();
      username = `${prefix}${lastName}`.toLowerCase();

      const existingUser = await prisma.user.findUnique({
        where: {
          username_tenantId: {
            username,
            tenantId: tenantId!,
          },
        },
      });

      if (!existingUser) break;

      attempt++;
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("ThisIsAPassword!", salt);

    await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        firstName,
        lastName,
        tenantId: tenantId!,
        email,
        requiredPasswordChange: true,
        roleId,
      },
    });

    res.status(201).json({ username: username });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

export default { getCurrentUser, getTenantUsers, createTenantUser };
