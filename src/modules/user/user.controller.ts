import { NextFunction, Request, Response } from "express";
import service from "./user.service";
import { logger } from "../../config/logger";
import { tenantRepo } from "../../repository/tenant.repository";
import prisma from "../../config/prisma.config";
import { CreateUserSchema } from "./dto/create-user.dto";
import emailService from "../email/email.service";
import { userRepo } from "./user.repository";
import { ChangePasswordSchema } from "./dto/change-passoword.dto";

const getCurrentUser = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const tenantId = req.user?.tenantId;
  const tenantCode = req.user?.tenantCode;

  if (!tenantId) {
    logger.w("Tenant ID is missing", { tenantId });
    return res.status(400).json({ error: "Tenant ID is required" });
  }

  if (!userId) {
    logger.w("User ID is missing", { userId });
    return res.status(400).json({ error: "User ID is required" });
  }

  try {
    const user = await prisma.$transaction(async (tx) => {
      const tenant = await tenantRepo.getTenantById(tenantId);

      if (!tenant) {
        logger.w("Tenant not found", { tenantId });
        return res.status(404).json({ error: "Tenant not found" });
      }

      return await service.getCurrentUser(userId!, tenant, tx);
    });

    res.status(200).json(user);
  } catch (error: any) {
    logger.e(error, "Error fetching current user", {
      userId,
      tenantId,
      tenantCode,
    });
  }
};
const getSystemUsers = async (req: Request, res: Response) => {
  const tenantId = req.user?.tenantId;

  if (!tenantId) {
    logger.w("Tenant ID is missing", { tenantId });
    return res.status(400).json({ error: "Tenant ID is required" });
  }

  try {
    const users = await userRepo.getUsers(tenantId);
    res.status(200).json(users);
  } catch (error) {
    logger.e(error, "Error fetching users", { tenantId });
    res.status(500).json({ error: "Internal server error" });
  }
};

const createSystemUser = async (req: Request, res: Response) => {
  const { data } = req.body;
  const tenantId = req.user?.tenantId;
  const tenantCode = req.user?.tenantCode;
  const userId = req.user?.id;

  if (!tenantId) {
    logger.w("Tenant ID is missing", { tenantId });
    return res.status(400).json({ error: "Tenant ID is required" });
  }

  if (!data) {
    logger.w("User data is missing", { tenantId });
    return res.status(400).json({ error: "User data is required" });
  }

  const parseResult = CreateUserSchema.safeParse(data);
  if (!parseResult.success) {
    return res.status(400).json({
      error: "Invalid user data",
      details: parseResult.error.issues,
    });
  }

  const userDto = parseResult.data;

  try {
    await prisma.$transaction(async (tx) => {
      const tenant = await tenantRepo.getTenantById(tenantId);

      if (!tenant) {
        logger.w("Tenant not found", { tenantId });
        return res.status(404).json({ error: "Tenant not found" });
      }

      const { user, password } = await service.createUser(userDto, tenant, tx);

      await emailService.newUserEmail(tenant, user.id, password, tx);
    });

    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    logger.e(error, "Error creating user", { tenantId, userId, tenantCode });
    res.status(500).json({ error: "Internal server error" });
  }
};
const changePassword = async (req: Request, res: Response) => {
  const { data } = req.body;
  const tenantId = req.user?.tenantId;
  const tenantCode = req.user?.tenantCode;
  const userId = req.user?.id;

  if (!tenantId) {
    logger.w("Tenant ID is missing", { tenantId });
    return res.status(400).json({ error: "Tenant ID is required" });
  }

  if (!data) {
    logger.w("User data is missing", { tenantId });
    return res.status(400).json({ error: "User data is required" });
  }

  const parseResult = ChangePasswordSchema.safeParse(data);
  if (!parseResult.success) {
    return res.status(400).json({
      error: "Invalid password data",
      details: parseResult.error.issues,
    });
  }

  const userDto = parseResult.data;

  try {
    const user = await prisma.$transaction(async (tx) => {
      const tenant = await tenantRepo.getTenantById(tenantId);

      if (!tenant) {
        logger.w("Tenant not found", { tenantId });
        return res.status(404).json({ error: "Tenant not found" });
      }

      await service.changePassword(userDto, tenant, tx, userId!);

      return await service.getCurrentUser(userId!, tenant, tx);
    });

    res.status(200).json({ user, message: "Password updated successfully" });
  } catch (error: any) {
    logger.e(error, "Error fetching current user", {
      userId,
      tenantId,
      tenantCode,
    });
  }
};
const resetUserPassword = async (req: Request, res: Response) => {
  const { id } = req.params;
  const tenantId = req.user?.tenantId;
  const tenantCode = req.user?.tenantCode;
  const userId = req.user?.id;

  if (!tenantId) {
    logger.w("Tenant ID is missing", { tenantId });
    return res.status(400).json({ error: "Tenant ID is required" });
  }

  if (!id) {
    logger.w("User ID is missing", { tenantId });
    return res.status(400).json({ error: "User ID is required" });
  }

  try {
    await prisma.$transaction(async (tx) => {
      const tenant = await tenantRepo.getTenantById(tenantId);

      if (!tenant) {
        logger.w("Tenant not found", { tenantId });
        return res.status(404).json({ error: "Tenant not found" });
      }

      const { updatedUser, password } = await service.resetPassword(
        id,
        tenant,
        tx
      );

      await emailService.resetPasswordEmail(
        tenant,
        updatedUser.id,
        password,
        tx
      );
    });

    res.status(200).json({ message: "User password reset successfully" });
  } catch (error) {
    logger.e(error, "Error resetting user password", {
      tenantId,
      userId,
      tenantCode,
    });
    res.status(500).json({ error: "Internal server error" });
  }
};

const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const tenantId = req.user?.tenantId;
  const tenantCode = req.user?.tenantCode;
  const userId = req.user?.id;

  if (!tenantId) {
    logger.w("Tenant ID is missing", { tenantId });
    return res.status(400).json({ error: "Tenant ID is required" });
  }

  if (!id) {
    logger.w("Customer ID is missing", { tenantId });
    return res.status(400).json({ error: "Customer ID is required" });
  }

  try {
    await prisma.$transaction(async (tx) => {
      const tenant = await tenantRepo.getTenantById(tenantId);

      if (!tenant) {
        logger.w("Tenant not found", { tenantId });
        return res.status(404).json({ error: "Tenant not found" });
      }

      await service.deleteUser(id, tenant, tx);
    });

    const users = await userRepo.getUsers(tenantId);

    res.status(200).json({
      users,
      message: "User deleted successfully",
    });
  } catch (error) {
    logger.e(error, "Error deleting user", { tenantId, userId, tenantCode });
  }
};

export default {
  getCurrentUser,
  getSystemUsers,
  deleteUser,
  createSystemUser,
  changePassword,
  resetUserPassword,
};
