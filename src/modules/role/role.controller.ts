import { Request, Response } from 'express';
import { userRepo } from '../user/user.repository';
import { logger } from '../../config/logger';
import service from './role.service';
import { tenantRepo } from '../../repository/tenant.repository';
import prisma from '../../config/prisma.config';

const getRoles = async (req: Request, res: Response) => {
  const tenantId = req.user?.tenantId;
  const tenantCode = req.user?.tenantCode;

  if (!tenantId) {
    logger.w('Tenant ID is missing', { tenantId });
    return res.status(400).json({ error: 'Tenant ID is required' });
  }

  try {
    const tenant = await tenantRepo.getTenantById(tenantId);

    if (!tenant) {
      logger.w('Tenant not found', { tenantId });
      return res.status(404).json({ message: 'Tenant not found' });
    }

    const roles = await service.getTenantRoles(tenant);

    res.status(200).json({ message: 'Roles fetched successfully', roles });
  } catch (error) {
    logger.e(error, 'Error fetching tenant', { tenantId, tenantCode });
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const getUserRole = async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    logger.w('User ID is missing in request');
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    const user = await userRepo.getUserById(userId);

    if (!user) {
      logger.w('User not found', { userId });
      return res.status(404).json({ message: 'User not found' });
    }

    const role = await service.getRole(user);

    res.status(200).json({ message: 'User role fetched successfully', role });
  } catch (error) {
    logger.e(error, 'Error fetching user role', { userId });
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const deleteRole = async (req: Request, res: Response) => {
  const roleId = req.params.id;
  const tenantId = req.user?.tenantId;
  const tenantCode = req.user?.tenantCode;

  if (!roleId) {
    logger.w('Role ID is missing in request', { tenantId });
    return res.status(400).json({ error: 'Role ID is required' });
  }

  if (!tenantId) {
    logger.w('Tenant ID is missing in request', { roleId });
    return res.status(400).json({ error: 'Tenant ID is required' });
  }

  try {
    const tenant = await tenantRepo.getTenantById(tenantId);

    if (!tenant) {
      logger.w('Tenant not found', { tenantId, roleId });
      return res.status(404).json({ message: 'Tenant not found' });
    }

    await prisma.$transaction(async (tx) => {
      const role = await tx.userRole.findUnique({
        where: { id: roleId, tenantId: tenant.id },
      });

      if (!role) {
        logger.w('Role not found', { tenantId, roleId });
        throw new Error('Role not found');
      }

      const usersWithRole = await tx.user.count({
        where: { roleId: role.id, tenantId: tenant.id, isDeleted: false },
      });

      if (usersWithRole > 0) {
        logger.w('Cannot delete role assigned to users', { tenantId, roleId });
        return res
          .status(400)
          .json({ message: 'Cannot delete role assigned to users' });
      }

      await service.deleteRole(role, tenant, tx);
    });

    const roles = await service.getTenantRoles(tenant);

    res.status(200).json({ message: 'Role deleted successfully', roles });
  } catch (error) {
    logger.e(error, 'Error deleting role', { tenantId, tenantCode, roleId });
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export default {
  getRoles,
  getUserRole,
  deleteRole,
};
