import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';

import bcrypt from 'bcrypt';
import { GeneratorService } from '../../../common/generator/generator.service.js';
import { PrismaService } from '../../../prisma/prisma.service.js';
import { CreateTenantUserDto } from './dto/create-tenant-user.dto.js';
import { Tenant } from '../../../generated/prisma/client.js';

@Injectable()
export class TenantUserService {
  private readonly logger = new Logger(TenantUserService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly generator: GeneratorService,
  ) {}

  async getCurrentUser(id: string, tenant: Tenant) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id, tenantId: tenant.id },
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true,
          tenantId: true,
          createdAt: true,
          email: true,
          roleId: true,
          profilePicture: true,
          requirePasswordChange: true,
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
        this.logger.warn(
          `User with ID ${id} not found for tenant ${tenant.id}`,
        );
        throw new NotFoundException('User not found');
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
        email: user.email,
        profilePicture: user.profilePicture || null,
        roleId: user.roleId,
        requirePasswordChange: user.requirePasswordChange,
        role: user.role,
      };

      return userData;
    } catch (error) {
      this.logger.error(error, 'Error fetching current user', {
        userId: id,
        tenantId: tenant.id,
        tenantCode: tenant.tenantCode,
      });
      throw error;
    }
  }

  async createUser(data: CreateTenantUserDto, tenant: Tenant) {
    try {
      const user = await this.prisma.$transaction(async (tx) => {
        const emailExists = await tx.user.findUnique({
          where: { email: data.email, tenantId: tenant.id },
        });

        if (emailExists) {
          this.logger.warn(
            `User creation failed: Email ${data.email} is already in use.`,
          );
          throw new ConflictException(
            'Email is already associated with another user.',
          );
        }

        const username = await this.generator.generateUsername(
          data.firstName,
          data.lastName,
        );

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(data.password, salt);

        const user = await tx.user.create({
          data: {
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName,
            username,
            password: hashedPassword,
            tenantId: tenant.id,
            requirePasswordChange: true,
            roleId: data.roleId,
            createdAt: new Date(),
          },
        });

        return user;
      });

      return user;
    } catch (error) {
      this.logger.error('Failed to create tenant user', error);
      throw error;
    }
  }
}
