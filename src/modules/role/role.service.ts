import { Tenant, UserRole } from '@prisma/client';
import { TxClient } from '../../config/prisma.config';
import { logger } from '../../config/logger';
import { CreateRoleDto } from './role.dto';

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
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
    });
  } catch (error) {
    logger.e(error, 'Error assigning permissions to role', { role });
    throw new Error('Error assigning permissions to role');
  }
};

export default {
  createRole,
  createSuperAdminRole,
  assignAllPermissions,
};
