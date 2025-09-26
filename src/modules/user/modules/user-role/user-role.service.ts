import { Tenant, User, UserRole } from '@prisma/client';
import prisma, { TxClient } from '../../../../config/prisma.config';
import { logger } from '../../../../config/logger';
import { UserRoleDto } from './role.dto';

class UserRoleService {
  async getTenantRoles(tenant: Tenant) {
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
  }

  async getRole(user: User) {
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
  }

  async createUserRole(data: UserRoleDto, tenant: Tenant, user: User) {
    try {
      const existingRole = await prisma.userRole.findFirst({
        where: { name: data.name, tenantId: tenant.id },
      });

      if (existingRole) {
        if (existingRole.isDeleted) {
          throw new Error(
            'Role with this name was previously deleted. Please choose a different name.',
          );
        }
        throw new Error('Role with this name already exists');
      }

      const role = await prisma.userRole.create({
        data: {
          name: data.name,
          description: data.description,
          show: data.show,
          tenantId: tenant.id,
          createdAt: new Date(),
          updatedAt: new Date(),
          updatedBy: user.username,
        },
      });

      return role;
    } catch (error) {
      logger.e(error, 'Error creating role', {
        tenantId: tenant.id,
        tenantCode: tenant.tenantCode,
        roleName: data.name,
      });
      throw new Error('Error creating role');
    }
  }

  async updateUserRole(data: UserRoleDto, tenant: Tenant, user: User) {
    try {
      if (!tenant) {
        throw new Error('Tenant information is required to update a role');
      }

      const role = await prisma.userRole.update({
        where: { id: data.id, tenantId: tenant.id },
        data: {
          name: data.name,
          description: data.description,
          show: data.show,
          tenantId: tenant.id,
          createdAt: new Date(),
          updatedAt: new Date(),
          updatedBy: user.username,
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
  }

  async deleteUserRole(roleId: string, tenant: Tenant, user: User) {
    try {
      if (!tenant) {
        throw new Error('Tenant information is required to delete a role');
      }

      const existingRole = await prisma.userRole.findUnique({
        where: { id: roleId, tenantId: tenant.id },
      });

      if (!existingRole) {
        throw new Error('Role not found');
      }

      const existingUsers = await prisma.user.count({
        where: { roleId, tenantId: tenant.id },
      });

      if (existingUsers > 0) {
        throw new Error('Cannot delete role assigned to users');
      }

      await prisma.userRole.update({
        where: { id: roleId },
        data: {
          isDeleted: true,
          updatedAt: new Date(),
          updatedBy: user.username,
        },
      });
    } catch (error) {
      logger.e(error, 'Error deleting role', {
        tenantId: tenant.id,
        tenantCode: tenant.tenantCode,
        roleId,
      });
      throw new Error('Error deleting role');
    }
  }

  async assignPermissionsToRole(
    roleId: string,
    permissions: string[],
    tenant: Tenant,
    user: User,
  ) {
    try {
      await prisma.$transaction(async (tx) => {
        const role = await tx.userRole.findUnique({
          where: { id: roleId, tenantId: tenant.id },
        });

        if (!role) {
          throw new Error('Role not found');
        }

        await tx.userRolePermission.deleteMany({
          where: { roleId: role.id },
        });

        await tx.userRolePermission.createMany({
          data: permissions.map((permId) => ({
            roleId: role.id,
            permissionId: permId,
            assignedBy: user.username,
            assignedAt: new Date(),
          })),
        });
      });
    } catch (error) {
      logger.e(error, 'Error assigning permissions to role', {
        tenantId: tenant.id,
        tenantCode: tenant.tenantCode,
        roleId,
      });
      throw new Error('Error assigning permissions to role');
    }
  }
}

export const userRoleService = new UserRoleService();

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
  deleteRole,
  getTenantRoles,
  createSuperAdminRole,
  assignAllPermissions,
};
