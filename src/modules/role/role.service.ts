import { Tenant, User, UserRole } from '@prisma/client';
import prisma, { TxClient } from '../../config/prisma.config';
import { logger } from '../../config/logger';
import { CreateRoleDto } from './role.dto';

const getTenantRoles = async (tenant: Tenant) => {
  try {
    if (!tenant) {
      throw new Error('Tenant information is required to fetch roles');
    }

    const roles = await prisma.userRole.findMany({
      where: { tenantId: tenant.id, show: true, isDeleted: false },
      include: {
        rolePermission: {
          include: {
            permission: true,
          },
        },
      },
    });

    return roles;
  } catch (error) {
    logger.e(error, 'Error fetching tenant roles', {
      tenantId: tenant.id,
      tenantCode: tenant.tenantCode,
    });
  }
};
const getRole = async (user: User) => {
  try {
    if (!user) {
      throw new Error('User is required to fetch role');
    }
    if (!user.roleId) {
      throw new Error('User does not have a role assigned');
    }

    const role = await prisma.userRole.findUnique({
      where: { id: user.roleId },
      include: {
        rolePermission: {
          include: {
            permission: true,
          },
        },
      },
    });

    if (!role) {
      throw new Error('Role not found');
    }

    return role;
  } catch (error) {
    logger.e(error, 'Error fetching user role', { userId: user.id });
  }
};
const createRole = async (
  data: CreateRoleDto,
  tenant: Tenant,
  tx: TxClient,
) => {
  try {
    if (!tenant) {
      throw new Error('Tenant information is required to create a role');
    }

    const role = await tx.userRole.create({
      data: {
        name: data.name,
        description: data.description,
        show: data.show,
        tenantId: tenant.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return role;
  } catch (error) {
    logger.e(error, 'Error creating role', {
      tenantId: tenant.id,
      tenantCode: tenant.tenantCode,
      roleName: name,
    });
    throw new Error('Error creating role');
  }
};
const deleteRole = async (role: UserRole, tenant: Tenant, tx: TxClient) => {
  try {
    if (!role) {
      throw new Error('Role information is required to delete a role');
    }

    const existingUsers = await tx.user.count({
      where: { roleId: role.id, tenantId: tenant.id },
    });

    await tx.userRole.update({
      where: { id: role.id },
      data: { isDeleted: true },
    });
  } catch (error) {
    logger.e(error, 'Error deleting role', {
      tenantId: tenant.id,
      tenantCode: tenant.tenantCode,
      roleId: role.id,
      roleName: role.name,
    });
  }
};

const createSuperAdminRole = async (tenant: Tenant, tx: TxClient) => {
  try {
    if (!tenant) {
      throw new Error('Tenant information is required to create a role');
    }

    const role = await tx.userRole.create({
      data: {
        name: 'Super Admin',
        description: 'Super Admin role for new tenants',
        show: false,
        tenantId: tenant.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return role;
  } catch (error) {
    logger.e(error, 'Error creating role', {
      tenantId: tenant.id,
      tenantCode: tenant.tenantCode,
      roleName: name,
    });
    throw new Error('Error creating role');
  }
};

const assignAllPermissions = async (role: UserRole, tx: TxClient) => {
  try {
    if (!role) {
      throw new Error('Role  is required to assign permissions');
    }

    const permissions = await tx.appPermission.findMany();

    await tx.userRolePermission.createMany({
      data: permissions.map((perm) => ({
        roleId: role.id,
        permissionId: perm.id,
      })),
    });
  } catch (error) {
    logger.e(error, 'Error assigning permissions to role', { role });
    throw new Error('Error assigning permissions to role');
  }
};

export default {
  createRole,
  getRole,
  deleteRole,
  getTenantRoles,
  createSuperAdminRole,
  assignAllPermissions,
};
