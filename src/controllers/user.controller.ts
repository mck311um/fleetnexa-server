import { NextFunction, Request, Response } from "express";
import prisma from "../config/prisma.config";
import logUtil from "../config/logger.config";
import bcrypt from "bcrypt";
import generator from "../services/generator.service";

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
        profilePicture: true,
        requiredPasswordChange: true,
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
      email: user.email,
      profilePicture: user.profilePicture || null,
      roleId: user.roleId,
      requiredPasswordChange: user.requiredPasswordChange,
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
const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  const { user } = req.body;
  const userId = req.user?.id;
  const tenantId = req.user?.tenantId;

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId, tenantId },
      data: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        profilePicture: user.profilePicture,
      },
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
        profilePicture: true,
        requiredPasswordChange: true,
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

    const userData = {
      id: updatedUser.id,
      username: updatedUser.username,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      initials: `${updatedUser.firstName[0]}${updatedUser.lastName[0]}`,
      fullName: `${updatedUser.firstName} ${updatedUser.lastName}`,
      tenantId: updatedUser.tenantId,
      tenant: updatedUser.tenant?.tenantCode,
      tenantName: updatedUser.tenant?.tenantName,
      createdAt: updatedUser.createdAt,
      theme: updatedUser.theme,
      color: updatedUser.color,
      email: updatedUser.email,
      profilePicture: updatedUser.profilePicture || null,
      roleId: updatedUser.roleId,
      role: updatedUser.role,
      requiredPasswordChange: updatedUser.requiredPasswordChange,
    };

    res.status(201).json(userData);
  } catch (error) {
    next(error);
  }
};

const updatePassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user?.id;

  try {
    await prisma.$transaction(async (prisma) => {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res
          .status(400)
          .json({ message: "Current password is incorrect" });
      }

      if (currentPassword === newPassword) {
        return res.status(400).json({
          message: "New password cannot be the same as current password",
        });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword, requiredPasswordChange: false },
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
          profilePicture: true,
          requiredPasswordChange: true,
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

      const userData = {
        id: updatedUser.id,
        username: updatedUser.username,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        initials: `${updatedUser.firstName[0]}${updatedUser.lastName[0]}`,
        fullName: `${updatedUser.firstName} ${updatedUser.lastName}`,
        tenantId: updatedUser.tenantId,
        tenant: updatedUser.tenant?.tenantCode,
        tenantName: updatedUser.tenant?.tenantName,
        createdAt: updatedUser.createdAt,
        theme: updatedUser.theme,
        color: updatedUser.color,
        email: updatedUser.email,
        profilePicture: updatedUser.profilePicture || null,
        roleId: updatedUser.roleId,
        role: updatedUser.role,
        requiredPasswordChange: updatedUser.requiredPasswordChange,
      };

      res.status(201).json(userData);
    });
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

    if (!tenant) {
      return res.status(404).json({ message: "Tenant not found" });
    }

    const username = await generator.generateUserName(firstName, lastName);

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

    res.status(201).json({ username });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

export default {
  getCurrentUser,
  getTenantUsers,
  createTenantUser,
  updateUser,
  updatePassword,
};
