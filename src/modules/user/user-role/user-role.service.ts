import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { Tenant, UserRole } from 'prisma/generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserRoleService {
  private readonly logger = new Logger(UserRoleService.name);

  constructor(private readonly prisma: PrismaService) {}

  async createDefaultRole(tenant: Tenant) {
    try {
      const existingRole = await this.prisma.userRole.findFirst({
        where: {
          tenantId: tenant.id,
          name: 'Admin',
        },
      });

      if (existingRole) {
        this.logger.warn(
          `Default role 'Admin' already exists for tenant ${tenant.tenantCode}`,
        );
        return existingRole;
      }

      const role = await this.prisma.userRole.create({
        data: {
          name: 'Admin',
          description: 'Default admin role with all permissions',
          tenantId: tenant.id,
          show: true,
          createdAt: new Date(),
        },
      });

      await this.assignAllPermissionsToRole(role);

      return role;
    } catch (error) {
      this.logger.error('Failed to create default role', error);
      throw error;
    }
  }

  async assignAllPermissionsToRole(role: UserRole) {
    try {
      if (!role) {
        this.logger.warn('No role provided for permission assignment.');
        throw new BadRequestException('Role is required to assign permissions');
      }

      const permissions = await this.prisma.appPermission.findMany();

      await this.prisma.userRolePermission.createMany({
        data: permissions.map((permission) => ({
          roleId: role.id,
          permissionId: permission.id,
        })),
      });
    } catch (error) {
      this.logger.error('Failed to assign permissions to role', error);
      throw error;
    }
  }
}
