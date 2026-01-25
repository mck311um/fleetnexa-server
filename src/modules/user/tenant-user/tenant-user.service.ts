import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

import bcrypt from 'bcrypt';
import { GeneratorService } from '../../../common/generator/generator.service.js';
import { PrismaService } from '../../../prisma/prisma.service.js';
import { TenantUserDto } from './dto/tenant-user.dto.js';
import { Tenant, User } from '../../../generated/prisma/client.js';
import { TenantUserRepository } from './tenant-user.repository.js';
import { EmailService } from '../../../common/email/email.service.js';
import { ChangePasswordDto } from '../dto/change-password.dto.js';

@Injectable()
export class TenantUserService {
  private readonly logger = new Logger(TenantUserService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly generator: GeneratorService,
    private readonly repo: TenantUserRepository,
    private readonly email: EmailService,
  ) {}

  async getTenantUsers(tenant: Tenant) {
    try {
      const users = await this.repo.getUsers(tenant.id);

      return users;
    } catch (error) {
      this.logger.error('Error fetching tenant users', error, {
        tenantId: tenant.id,
        tenantCode: tenant.tenantCode,
      });
      throw error;
    }
  }

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

  async createUser(data: TenantUserDto, tenant: Tenant) {
    try {
      const { user, password } = await this.prisma.$transaction(async (tx) => {
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
        let hashedPassword: string;
        let password: string | undefined;

        if (data.password) {
          hashedPassword = await bcrypt.hash(data.password, salt);
        } else {
          password = await this.generator.generateTempPassword();
          hashedPassword = await bcrypt.hash(password, salt);
        }

        if (!data.roleId) {
          this.logger.warn(
            `User creation failed: roleId is required but not provided.`,
          );
          throw new BadRequestException('Role is required.');
        }

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

        return { user, password };
      });

      if (password) {
        this.logger.log(`Sending welcome email to new user ${user.email}`);
        await this.email.sendNewUserWelcomeEmail(user.id, password, tenant);
      }

      const users = await this.repo.getUsers(tenant.id);
      return {
        message: 'User created successfully',
        user,
        users,
      };
    } catch (error) {
      this.logger.error('Failed to create tenant user', error);
      throw error;
    }
  }

  async updateUser(data: TenantUserDto, tenant: Tenant) {
    try {
      const user = await this.prisma.$transaction(async (tx) => {
        const existingUser = await tx.user.findUnique({
          where: { id: data.id, tenantId: tenant.id },
        });

        if (!existingUser) {
          this.logger.warn(
            `User update failed: User with ID ${data.id} not found.`,
          );
          throw new NotFoundException('User not found');
        }

        const emailOwner = await tx.user.findUnique({
          where: { email: data.email, tenantId: tenant.id },
        });

        if (emailOwner && emailOwner.id !== data.id) {
          this.logger.warn(
            `User update failed: Email ${data.email} is already in use by another user.`,
          );
          throw new ConflictException(
            'Email is already associated with another user.',
          );
        }

        const updatedUser = await tx.user.update({
          where: { id: data.id },
          data: {
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName,
            roleId: data.roleId,
            profilePicture: data.profilePicture,
            updatedAt: new Date(),
          },
        });

        return updatedUser;
      });

      const users = await this.repo.getUsers(tenant.id);
      return {
        message: 'User updated successfully',
        user,
        users,
      };
    } catch (error) {
      this.logger.error('Failed to update tenant user', data);
      throw error;
    }
  }

  async deleteUser(userId: string, tenant: Tenant) {
    try {
      const existingUser = await this.prisma.user.findUnique({
        where: { id: userId, tenantId: tenant.id },
      });

      if (!existingUser) {
        this.logger.warn(
          `User deletion failed: User with ID ${userId} not found.`,
        );
        throw new NotFoundException('User not found');
      }

      await this.prisma.user.update({
        where: { id: userId },
        data: { isDeleted: true, updatedAt: new Date() },
      });

      const users = await this.repo.getUsers(tenant.id);
      return {
        message: 'User deleted successfully',
        users,
      };
    } catch (error) {
      this.logger.error('Failed to delete tenant user', error, {
        userId,
        tenantId: tenant.id,
      });
      throw error;
    }
  }

  async updateUserPassword(
    data: ChangePasswordDto,
    tenant: Tenant,
    userId: string,
  ) {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          id: userId,
        },
      });

      if (!user) {
        this.logger.warn(
          `Password update failed: User with ID ${userId} not found.`,
        );
        throw new NotFoundException('User not found');
      }

      const isMatch = await bcrypt.compare(data.currentPassword, user.password);
      if (!isMatch) {
        throw new UnauthorizedException('Current password is incorrect');
      }

      const isSamePassword = await bcrypt.compare(
        data.newPassword,
        user.password,
      );
      if (isSamePassword) {
        throw new BadRequestException(
          'Password cannot be the same as the current password',
        );
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(data.newPassword, salt);

      await this.prisma.user.update({
        where: {
          id: userId,
          tenantId: tenant.id,
        },
        data: {
          password: hashedPassword,
          requirePasswordChange: false,
        },
      });
    } catch (error) {
      this.logger.error('Failed to update user password', error, {
        userId,
        tenantId: tenant.id,
      });
      throw error;
    }
  }
}
