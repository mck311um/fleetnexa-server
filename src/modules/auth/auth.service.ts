import { Tenant } from '@prisma/client';
import { logger } from '../../config/logger';
import prisma from '../../config/prisma.config';
import {
  AdminUserDto,
  AdminUserSchema,
  LoginDto,
  StorefrontUserDto,
  StorefrontUserSchema,
} from './auth.dto';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import generatorService from '../../services/generator.service';

class AuthService {
  async validateAdminUserData(data: any) {
    if (!data) {
      throw new Error('Admin user data is required');
    }

    const safeParse = AdminUserSchema.safeParse(data);
    if (!safeParse.success) {
      logger.w('Admin user data validation failed', {
        details: safeParse.error.issues,
      });
      throw new Error('Admin user data validation failed');
    }

    return safeParse.data;
  }

  async validateStorefrontUserData(data: StorefrontUserDto) {
    if (!data) {
      throw new Error('Storefront user data is required');
    }

    const safeParse = StorefrontUserSchema.safeParse(data);
    if (!safeParse.success) {
      logger.w('Storefront user data validation failed', {
        details: safeParse.error.issues,
      });
      throw new Error('Storefront user data validation failed');
    }

    return safeParse.data;
  }

  async validateAdminUser(data: LoginDto) {
    const user = await prisma.adminUser.findUnique({
      where: { username: data.username },
    });
    if (!user) return null;

    const isMatch = await bcrypt.compare(data.password, user.password);
    if (!isMatch) return null;

    const userData = {
      id: user.id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      initials: `${user.firstName[0]}${user.lastName[0]}`,
      fullName: `${user.firstName} ${user.lastName}`,
    };

    const payload = { adminUser: { id: user.id, username: user.username } };
    const token = jwt.sign(payload, process.env.JWT_SECRET as string, {
      expiresIn: data.rememberMe ? '30d' : '7d',
    });

    return { userData, token };
  }

  async createAdminUser(data: AdminUserDto) {
    const existingUser = await prisma.adminUser.findUnique({
      where: { username: data.username },
    });

    if (existingUser) {
      throw new Error('Username already exists');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const newUser = await prisma.adminUser.create({
      data: {
        username: data.username,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
      },
    });

    return {
      id: newUser.id,
      username: newUser.username,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      initials: `${newUser.firstName[0]}${newUser.lastName[0]}`,
      fullName: `${newUser.firstName} ${newUser.lastName}`,
    };
  }

  async createStorefrontUser(data: StorefrontUserDto) {
    try {
      const existingUser = await prisma.storefrontUser.findUnique({
        where: { email: data.email },
      });

      if (existingUser) {
        throw new Error('An account with these credentials already exists.');
      }

      const existingPhone = await prisma.storefrontUser.findFirst({
        where: { phone: data.phone },
      });

      if (existingPhone) {
        throw new Error('An account with these credentials already exists.');
      }

      const existingLicense = await prisma.storefrontUser.findFirst({
        where: { driverLicenseNumber: data.driversLicenseNumber },
      });

      if (existingLicense) {
        throw new Error('An account with these credentials already exists.');
      }

      const hashedPassword = await bcrypt.hash(data.password, 10);
      const newUser = await prisma.storefrontUser.create({
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          gender: data.gender || 'male',
          phone: data.phone || '',
          password: hashedPassword,
          driverLicenseNumber: data.driversLicenseNumber,
          licenseExpiry: new Date(data.licenseExpiry),
          licenseIssued: new Date(data.licenseIssued),
          license: data.license,
          dateOfBirth: new Date(data.dateOfBirth),
          street: data.street || '',
          countryId: data.countryId || null,
          stateId: data.stateId || null,
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          driverLicenseNumber: true,
          licenseExpiry: true,
          licenseIssued: true,
          dateOfBirth: true,
        },
      });

      return newUser;
    } catch (error) {
      logger.e(error, 'Failed to create storefront user', {
        email: data.email,
      });
      throw error;
    }
  }

  async validateStorefrontUser(data: LoginDto) {
    try {
      const user = await prisma.storefrontUser.findUnique({
        where: { email: data.username },
      });
      if (!user) {
        logger.w('Invalid email or password', { email: data.username });
        throw new Error('Invalid email or password');
      }

      const isMatch = await bcrypt.compare(data.password, user.password);
      if (!isMatch) {
        logger.w('Invalid email or password', { email: data.username });
        throw new Error('Invalid email or password');
      }

      const userData = {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        initials: `${user.firstName[0]}${user.lastName[0]}`,
        fullName: `${user.firstName} ${user.lastName}`,
        email: user.email,
        driverLicenseNumber: user.driverLicenseNumber,
        licenseExpiry: user.licenseExpiry,
        licenseIssued: user.licenseIssued,
        dateOfBirth: user.dateOfBirth,
      };

      return userData;
    } catch (error) {
      logger.e(error, 'Failed to validate storefront user', {
        email: data.username,
      });
      throw new Error('Failed to validate storefront user');
    }
  }

  async validateTenantUser(data: LoginDto) {
    try {
      const user = await prisma.user.findUnique({
        where: { username: data.username },
        include: {
          tenant: true,
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
      if (!user) return null;

      const isMatch = await bcrypt.compare(data.password, user.password);
      if (!isMatch) return null;

      const userData = {
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        initials: `${user.firstName[0]}${user.lastName[0]}`,
        fullName: `${user.firstName} ${user.lastName}`,
        tenantId: user.tenantId,
        tenantCode: user.tenant?.tenantCode,
        roleId: user.roleId,
        requirePasswordChange: user.requirePasswordChange,
        role: user.role,
      };

      const payload = {
        user: {
          id: user.id,
          tenantId: user.tenantId,
          tenantCode: user.tenant?.tenantCode,
        },
      };

      const token = jwt.sign(payload, process.env.JWT_SECRET as string, {
        expiresIn: data.rememberMe ? '30d' : '7d',
      });

      return { userData, token };
    } catch (error) {
      logger.e(error, 'Failed to validate tenant user', {
        username: data.username,
      });
      throw new Error('Failed to validate user');
    }
  }

  async generateVerificationToken(tenant: Tenant) {
    try {
      const alreadyVerified = await prisma.emailVerification.findFirst({
        where: {
          tenantId: tenant.id,
          verified: true,
          expiresAt: { gt: new Date() },
        },
      });

      if (alreadyVerified) {
        throw new Error('Email already verified');
      }

      const existingToken = await prisma.emailVerification.findFirst({
        where: {
          tenantId: tenant.id,
          verified: false,
          expiresAt: { gt: new Date() },
        },
      });

      if (existingToken) {
        return existingToken.token;
      }

      const token = generatorService.generateVerificationCode();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      return await prisma.emailVerification.create({
        data: {
          email: tenant.email,
          token,
          expiresAt,
          tenantId: tenant.id,
        },
      });
    } catch (error) {
      logger.e(error, 'Failed to generate email verification token', {
        tenantId: tenant.id,
      });
      throw new Error('Failed to generate email verification token');
    }
  }

  async verifyEmailToken(tenant: Tenant, token: string) {
    try {
      const record = await prisma.emailVerification.findFirst({
        where: {
          tenantId: tenant.id,
          token,
          verified: false,
          expiresAt: { gt: new Date() },
        },
      });

      if (!record) {
        throw new Error('Invalid or expired token');
      }

      await prisma.emailVerification.update({
        where: { id: record.id },
        data: { verified: true },
      });

      await prisma.tenant.update({
        where: { id: tenant.id },
        data: { emailVerified: true },
      });

      return true;
    } catch (error) {
      logger.e(error, 'Failed to verify email token', {
        tenantId: tenant.id,
        token,
      });
      throw new Error('Failed to verify email token');
    }
  }
}

export const authService = new AuthService();
