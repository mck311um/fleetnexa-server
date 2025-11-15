import { logger } from '../../../../config/logger';
import prisma from '../../../../config/prisma.config';
import generatorService from '../../../../services/generator.service';
import { emailService } from '../../../email/email.service';
import {
  LoginDto,
  ResetPasswordDto,
  VerifyEmailTokenDto,
} from '../../auth.dto';
import { StorefrontUserDto, StorefrontUserSchema } from './storefront.dto';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

class StorefrontAuthService {
  async validateUserData(data: StorefrontUserDto) {
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

  async createUser(data: StorefrontUserDto) {
    try {
      const existingUser = await prisma.storefrontUser.findUnique({
        where: { email: data.email },
      });

      if (existingUser) {
        logger.w('User with email already exists', { email: data.email });
        throw new Error('An account with these credentials already exists.');
      }

      const existingLicense = await prisma.storefrontUser.findFirst({
        where: { driverLicenseNumber: data.driversLicenseNumber },
      });

      if (existingLicense) {
        logger.w('User with driver license number already exists', {
          driverLicenseNumber: data.driversLicenseNumber,
        });
        throw new Error('An account with these credentials already exists.');
      }

      const hashedPassword = await bcrypt.hash(data.password, 10);
      const user = await prisma.storefrontUser.create({
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
          createdAt: true,
          email: true,
          profilePicture: true,
          driverLicenseNumber: true,
          licenseExpiry: true,
          licenseIssued: true,
          license: true,
          country: true,
          countryId: true,
          street: true,
          village: true,
          villageId: true,
          state: true,
          stateId: true,
          phone: true,
        },
      });

      const userData = {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        initials: `${user.firstName[0]}${user.lastName[0]}`,
        fullName: `${user.firstName} ${user.lastName}`,
        createdAt: user.createdAt,
        email: user.email,
        profilePicture: user.profilePicture || null,
        driverLicenseNumber: user.driverLicenseNumber,
        licenseExpiry: user.licenseExpiry,
        licenseIssued: user.licenseIssued,
        license: user.license,
        country: user.country?.country,
        countryId: user.countryId,
        street: user.street,
        village: user.village?.village,
        villageId: user.villageId,
        state: user.state?.state,
        stateId: user.stateId,
        phone: user.phone,
      };

      const payload = {
        storefrontUser: { id: user.id },
      };
      const token = jwt.sign(payload, process.env.JWT_SECRET as string, {
        expiresIn: '7d',
      });

      return { userData, token };
    } catch (error) {
      logger.e(error, 'Failed to create storefront user', {
        email: data.email,
      });
      throw error;
    }
  }

  async validateUser(data: LoginDto) {
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

      const payload = {
        storefrontUser: { id: user.id },
      };
      const token = jwt.sign(payload, process.env.JWT_SECRET as string, {
        expiresIn: data.rememberMe ? '30d' : '7d',
      });

      return { userData, token };
    } catch (error) {
      logger.e(error, 'Failed to validate storefront user', {
        email: data.username,
      });
      throw new Error('Failed to validate storefront user');
    }
  }

  async requestPasswordReset(email: string) {
    try {
      const user = await prisma.storefrontUser.findUnique({
        where: { email },
      });

      if (!user) {
        throw new Error('No user found with the provided email');
      }

      await prisma.emailTokens.updateMany({
        where: { email, expired: false },
        data: { expired: true },
      });

      const resetToken = generatorService.generateVerificationCode();
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

      await prisma.emailTokens.create({
        data: {
          email,
          token: resetToken,
          expiresAt,
        },
      });

      await emailService.sendStorefrontPasswordResetEmail(resetToken, email);
    } catch (error) {
      logger.e(error, 'Failed to request password reset', { email });
      throw error;
    }
  }

  async verifyPasswordResetToken(data: VerifyEmailTokenDto) {
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
        throw new Error('Invalid or expired token');
      }

      await prisma.emailTokens.updateMany({
        where: { email: data.email, token: data.token },
        data: { expired: true, verified: true },
      });
    } catch (error) {
      logger.e(error, 'Failed to verify password reset token', {
        email: data.email,
        token: data.token,
      });
      throw error;
    }
  }

  async resetPassword(data: ResetPasswordDto) {
    try {
      const hashedPassword = await bcrypt.hash(data.newPassword, 10);
      const user = await prisma.storefrontUser.findUnique({
        where: { email: data.email },
      });

      const passwordCompare = await bcrypt.compare(
        data.newPassword,
        user?.password || '',
      );
      if (passwordCompare) {
        throw new Error('New password must be different from the old password');
      }

      await prisma.storefrontUser.updateMany({
        where: { email: data.email },
        data: { password: hashedPassword },
      });
    } catch (error) {
      logger.e(error, 'Failed to reset storefront password', {
        email: data.email,
      });
      throw error;
    }
  }
}

export const storefrontAuthService = new StorefrontAuthService();
