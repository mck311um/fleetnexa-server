import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service.js';

@Injectable()
export class StorefrontUserService {
  private readonly logger = new Logger(StorefrontUserService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getCurrentUser(userId: string) {
    try {
      const user = await this.prisma.storefrontUser.findUnique({
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

      if (!user) {
        this.logger.warn(`Storefront user with ID ${userId} not found`);
        throw new NotFoundException('Storefront user not found');
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

      return userData;
    } catch (error) {
      this.logger.error(error, 'Error fetching current storefront user', {
        userId,
      });
      throw error;
    }
  }
}
