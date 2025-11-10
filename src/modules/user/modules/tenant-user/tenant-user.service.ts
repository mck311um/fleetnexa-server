import { logger } from '../../../../config/logger';
import prisma from '../../../../config/prisma.config';
import generatorService from '../../../../services/generator.service';
import { LoginDto, LoginDtoSchema } from './tenant-user.dto';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { emailService } from '../../../email/email.service';
import {
  ChangePasswordSchema,
  NewPasswordDto,
  NewPasswordSchema,
  RequestPasswordResetDto,
  RequestPasswordResetSchema,
} from '../../user.dto';
import {
  VerifyEmailTokenDto,
  VerifyEmailTokenSchema,
} from '../../../auth/auth.dto';

class TenantUserService {
  async validateLoginData(data: any) {
    if (!data) {
      throw new Error('Username/password are required');
    }

    const safeParse = LoginDtoSchema.safeParse(data);
    if (!safeParse.success) {
      logger.w('Tenant user data validation failed', {
        details: safeParse.error.issues,
      });
      throw new Error('Tenant user data validation failed');
    }

    return safeParse.data;
  }

  async validatePasswordRequestData(data: any) {
    if (!data) {
      throw new Error('Username is required');
    }

    const safeParse = RequestPasswordResetSchema.safeParse(data);
    if (!safeParse.success) {
      logger.w('Password reset request validation failed', {
        details: safeParse.error.issues,
      });
      throw new Error('Password reset request validation failed');
    }

    return safeParse.data;
  }

  async validateVerifyEmailData(data: any) {
    if (!data) {
      throw new Error('Email verification data is required');
    }

    const safeParse = VerifyEmailTokenSchema.safeParse(data);
    if (!safeParse.success) {
      logger.w('Email verification data validation failed', {
        details: safeParse.error.issues,
      });
      throw new Error('Email verification data validation failed');
    }

    return safeParse.data;
  }

  async validateChangePasswordData(data: any) {
    if (!data) {
      throw new Error('Password data is required');
    }

    const safeParse = NewPasswordSchema.safeParse(data);
    if (!safeParse.success) {
      logger.w('New password data validation failed', {
        details: safeParse.error.issues,
      });
      throw new Error('New password data validation failed');
    }

    return safeParse.data;
  }

  async validateTenantUser(data: LoginDto) {
    try {
      const user = await prisma.user.findFirst({
        where: {
          OR: [{ username: data.username }, { email: data.username }],
        },
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

      if (!user) {
        logger.w('Tenant user not found', { username: data.username });
        throw new Error('Tenant user not found');
      }

      const isMatch = await bcrypt.compare(data.password, user.password);
      if (!isMatch) {
        logger.w('Invalid password for tenant user', {
          username: data.username,
        });
        throw new Error('Invalid password');
      }

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
      throw error;
    }
  }

  async sendPasswordResetEmail(data: RequestPasswordResetDto) {
    try {
      const user = await prisma.user.findFirst({
        where: {
          OR: [{ username: data.username }, { email: data.username }],
        },
      });

      if (!user) {
        logger.w('Tenant user not found for password reset', {
          username: data.username,
        });
        throw new Error('Tenant user not found');
      }

      if (!user.email) {
        logger.w('User has no email address for password reset', {
          username: data.username,
        });
        throw new Error('User has no email address');
      }

      await prisma.emailTokens.updateMany({
        where: { email: user.email, expired: false },
        data: { expired: true },
      });

      const resetToken = generatorService.generateVerificationCode();
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

      await prisma.emailTokens.create({
        data: {
          email: user.email,
          token: resetToken,
          expiresAt,
        },
      });

      await emailService.sendPasswordResetEmail(resetToken, user.email);
    } catch (error) {
      logger.e(error, 'Failed to send password reset email', {
        username: data.username,
      });
      throw error;
    }
  }

  async verifyEmailToken(data: VerifyEmailTokenDto) {
    try {
      const record = await prisma.emailTokens.findFirst({
        where: {
          email: data.email,
          token: data.token,
          expired: false,
          expiresAt: { gt: new Date() },
        },
      });

      if (!record) {
        logger.w('Invalid or expired email verification token', {
          email: data.email,
        });
        throw new Error('Invalid or expired token');
      }

      await prisma.emailTokens.updateMany({
        where: { email: data.email, token: data.token },
        data: { expired: true, verified: true },
      });
    } catch (error) {
      logger.e(error, 'Failed to verify email token', {
        token: data.token,
        email: data.email,
      });
      throw error;
    }
  }

  async changePassword(data: NewPasswordDto) {
    try {
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (!existingUser) {
        logger.w(`Tenant user not found (Email: ${data.email})`);
        throw new Error('Tenant user not found');
      }

      const isSamePassword = await bcrypt.compare(
        data.password,
        existingUser.password,
      );
      if (isSamePassword) {
        logger.w(`New password cannot be the same as the old password`, {
          email: data.email,
        });
        throw new Error('New password cannot be the same as the old password');
      }

      const hashedPassword = await bcrypt.hash(data.password, 10);

      await prisma.user.update({
        where: { email: data.email },
        data: { password: hashedPassword },
      });
    } catch (error) {
      logger.e(error, 'Error changing tenant user password', {
        email: data.email,
      });
      throw error;
    }
  }
}
export const tenantUserService = new TenantUserService();
