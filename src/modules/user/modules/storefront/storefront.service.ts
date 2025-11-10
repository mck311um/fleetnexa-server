import { StorefrontUser } from '@prisma/client';
import { logger } from '../../../../config/logger';
import {
  ChangePasswordDto,
  ChangePasswordSchema,
  StorefrontUserDto,
  StorefrontUserSchema,
} from './storefront.dto';
import prisma from '../../../../config/prisma.config';
import bcrypt from 'bcrypt';
import { VerifyEmailTokenSchema } from '../../../auth/auth.dto';

class StorefrontUserService {
  async validateUserData(data: any) {
    if (!data) {
      throw new Error('User data is required');
    }

    const safeParse = StorefrontUserSchema.safeParse(data);
    if (!safeParse.success) {
      logger.w('Admin user data validation failed', {
        details: safeParse.error.issues,
      });
      throw new Error('Storefront user data validation failed');
    }

    return safeParse.data;
  }

  async validatePasswordData(data: any) {
    if (!data) {
      throw new Error('Password data is required');
    }

    const safeParse = ChangePasswordSchema.safeParse(data);
    if (!safeParse.success) {
      logger.w('Storefront user password data validation failed', {
        details: safeParse.error.issues,
      });
      throw new Error('Storefront user password data validation failed');
    }

    return safeParse.data;
  }

  async getCurrentUser(userId: string) {
    try {
      const user = await prisma.storefrontUser.findUnique({
        where: { id: userId },
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

      if (!user) {
        throw new Error('Storefront user not found');
      }

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
        country: user.country?.country,
        countryId: user.countryId,
        street: user.street,
        village: user.village?.village,
        villageId: user.villageId,
        state: user.state?.state,
        stateId: user.stateId,
        phone: user.phone,
      };

      return userData;
    } catch (error) {
      logger.e(error, 'Error fetching current storefront user', {
        userId,
      });
      throw new Error('Error fetching current storefront user');
    }
  }

  async updateStorefrontUser(data: StorefrontUserDto, user: StorefrontUser) {
    try {
      const existingUser = await prisma.storefrontUser.findUnique({
        where: { id: user.id },
      });

      if (!existingUser) {
        throw new Error('Storefront user not found');
      }

      const sameUser = existingUser.id === user.id;

      if (!sameUser) {
        throw new Error('Unauthorized to update this user');
      }

      const updatedUser = await prisma.storefrontUser.update({
        where: { id: user.id },
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
          dateOfBirth: data.dateOfBirth,
          street: data.street,
          countryId: data.countryId,
          stateId: data.stateId,
          villageId: data.villageId,
          driverLicenseNumber: data.driversLicenseNumber,
          licenseExpiry: data.licenseExpiry,
          licenseIssued: data.licenseIssued,
          license: data.license,
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
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        initials: `${updatedUser.firstName[0]}${updatedUser.lastName[0]}`,
        fullName: `${updatedUser.firstName} ${updatedUser.lastName}`,
        createdAt: updatedUser.createdAt,
        email: updatedUser.email,
        profilePicture: updatedUser.profilePicture || null,
        driverLicenseNumber: updatedUser.driverLicenseNumber,
        licenseExpiry: updatedUser.licenseExpiry,
        licenseIssued: updatedUser.licenseIssued,
        country: updatedUser.country?.country,
        countryId: updatedUser.countryId,
        street: updatedUser.street,
        village: updatedUser.village?.village,
        villageId: updatedUser.villageId,
        state: updatedUser.state?.state,
        stateId: updatedUser.stateId,
        phone: updatedUser.phone,
      };

      return userData;
    } catch (error) {
      logger.e(error, 'Error updating storefront user', {
        userId: user.id,
        data,
      });
      throw error;
    }
  }

  async updatePassword(data: ChangePasswordDto, user: StorefrontUser) {
    try {
      const existingUser = await prisma.storefrontUser.findUnique({
        where: { id: user.id },
      });

      if (!existingUser) {
        logger.w(`Storefront user not found (ID: ${user.id})`);
        throw new Error('Storefront user not found');
      }

      const sameUser = existingUser.id === user.id;
      if (!sameUser) {
        logger.w(`Unauthorized password change attempt (User ID: ${user.id})`);
        throw new Error('Unauthorized to change this user password');
      }

      const isMatch = await bcrypt.compare(
        data.currentPassword,
        existingUser.password,
      );

      if (!isMatch) {
        logger.w(`Incorrect password attempt (User ID: ${user.id})`);
        throw new Error('Incorrect current password');
      }

      const samePassword = await bcrypt.compare(
        data.newPassword,
        existingUser.password,
      );
      if (samePassword) {
        logger.w(`New password matches current password (User ID: ${user.id})`);
        throw new Error('Password must be different from the current password');
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(data.newPassword, salt);

      await prisma.storefrontUser.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
        },
      });
    } catch (error) {
      logger.e(error, 'Error updating storefront user password', {
        userId: user.id,
        data,
      });
      throw error;
    }
  }
}

export const storefrontUserService = new StorefrontUserService();
