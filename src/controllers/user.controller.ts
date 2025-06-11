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
  const { username, password, firstName, lastName, email } = req.body;
  const tenantId = req.user?.tenantId;

  try {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        firstName,
        lastName,
        tenantId: tenantId!,
        email,
      },
    });

    const userData = {
      id: user.id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      initials: `${user.firstName[0]}${user.lastName[0]}`,
      fullName: `${user.firstName} ${user.lastName}`,
      tenantId: user.tenantId,
      tenant: tenant?.tenantCode,
      theme: user.theme,
      color: user.color,
    };

    const payload = {
      user: {
        id: user.id,
        tenantId: user.tenantId,
      },
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET as string, {
      expiresIn: "7d",
    });

    res.status(201).json({ userData, token });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

export default { getCurrentUser, getTenantUsers, createTenantUser };
