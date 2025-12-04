import { Injectable, Logger } from '@nestjs/common';
import { Country, Tenant } from '../../../generated/prisma/client.js';
import { PrismaService } from '../../../prisma/prisma.service.js';

import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class TenantLocationService {
  private readonly logger = new Logger(TenantLocationService.name);

  constructor(private readonly prisma: PrismaService) {}

  async initializeTenantLocation(country: Country, tenant: Tenant) {
    try {
      await this.prisma.$transaction(async (tx) => {
        const presetLocations = await tx.presetLocation.findMany({
          where: { countryId: country.id },
        });

        await tx.tenantLocation.create({
          data: {
            id: uuidv4(),
            location: 'Main Office',
            tenantId: tenant.id,
            pickupEnabled: true,
            returnEnabled: true,
            storefrontEnabled: true,
            deliveryFee: 0,
            collectionFee: 0,
            minimumRentalPeriod: 1,
            updatedAt: new Date(),
            updatedBy: 'SYSTEM',
            isDeleted: false,
          },
        });

        for (const location of presetLocations) {
          await tx.tenantLocation.create({
            data: {
              id: uuidv4(),
              location: location.location,
              tenantId: tenant.id,
              pickupEnabled: true,
              returnEnabled: true,
              deliveryFee: 0,
              collectionFee: 0,
              minimumRentalPeriod: 1,
              updatedAt: new Date(),
              updatedBy: 'SYSTEM',
              isDeleted: false,
            },
          });
        }
      });
    } catch (error) {
      this.logger.error('Failed to initialize tenant locations', error);
      throw error;
    }
  }
}
