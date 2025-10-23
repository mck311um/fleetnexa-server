import { Country, Tenant, User } from '@prisma/client';
import prisma from '../../../../config/prisma.config';
import { TenantLocationDto } from './tenant-location.dto';
import { logger } from '../../../../config/logger';
import { v4 as uuidv4 } from 'uuid';

class TenantLocationService {
  async initializeTenantLocations(country: Country, tenant: Tenant) {
    try {
      const locations = await prisma.$transaction(async (tx) => {
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

        return await tx.tenantLocation.findMany({
          where: { tenantId: tenant.id },
          include: {
            _count: {
              select: { vehicles: true },
            },
          },
        });
      });

      return locations;
    } catch (error) {
      logger.e(error, 'Failed to initialize tenant locations', {
        tenantId: tenant.id,
        tenantCode: tenant.tenantCode,
        countryId: country.id,
        countryCode: country.code,
      });
      throw new Error('Failed to initialize tenant locations');
    }
  }

  async getAllLocations(tenant: Tenant) {
    try {
      const locations = await prisma.tenantLocation.findMany({
        where: { tenantId: tenant.id, isDeleted: false },
        include: {
          _count: {
            select: { vehicles: true },
          },
        },
      });

      return locations;
    } catch (error) {
      logger.e(error, 'Failed to get tenant locations', {
        tenantId: tenant.id,
        tenantCode: tenant.tenantCode,
      });
      throw new Error('Failed to get tenant locations');
    }
  }

  async addLocation(data: TenantLocationDto, tenant: Tenant) {
    try {
      const existingLocation = await prisma.tenantLocation.findFirst({
        where: {
          tenantId: tenant.id,
          location: {
            equals: data.location,
            mode: 'insensitive',
          },
          isDeleted: false,
        },
      });

      if (existingLocation) {
        throw new Error('Location already exists');
      }

      await prisma.tenantLocation.create({
        data: {
          id: data.id,
          tenantId: tenant.id,
          location: data.location,
          pickupEnabled: data.pickupEnabled,
          returnEnabled: data.returnEnabled,
          storefrontEnabled: data.storefrontEnabled,
          deliveryFee: data.deliveryFee ?? 0,
          collectionFee: data.collectionFee ?? 0,
          minimumRentalPeriod: data.minimumRentalPeriod ?? 0,
          createdAt: new Date(),
        },
      });
    } catch (error) {
      logger.e(error, 'Failed to add tenant location', {
        tenantId: tenant.id,
        tenantCode: tenant.tenantCode,
      });
      throw new Error('Failed to add tenant location');
    }
  }

  async updateLocation(
    data: TenantLocationDto,
    tenant: Tenant,
    userId: string,
  ) {
    try {
      const location = await prisma.tenantLocation.findUnique({
        where: { id: data.id },
      });

      if (!location || location.tenantId !== tenant.id || location.isDeleted) {
        throw new Error('Location not found');
      }

      await prisma.tenantLocation.update({
        where: { id: data.id, tenantId: tenant.id },
        data: {
          location: data.location,
          pickupEnabled: data.pickupEnabled,
          returnEnabled: data.returnEnabled,
          storefrontEnabled: data.storefrontEnabled,
          deliveryFee: data.deliveryFee ?? 0,
          collectionFee: data.collectionFee ?? 0,
          minimumRentalPeriod: data.minimumRentalPeriod ?? 0,
          updatedAt: new Date(),
          updatedBy: userId,
        },
      });
    } catch (error) {
      logger.e(error, 'Failed to update tenant location', {
        tenantId: tenant.id,
        tenantCode: tenant.tenantCode,
      });
      throw new Error('Failed to update tenant location');
    }
  }

  async deleteLocation(locationId: string, tenant: Tenant, userId: string) {
    try {
      const location = await prisma.tenantLocation.findUnique({
        where: { id: locationId },
      });

      if (!location || location.tenantId !== tenant.id || location.isDeleted) {
        throw new Error('Location not found');
      }

      await prisma.tenantLocation.update({
        where: { id: locationId, tenantId: tenant.id },
        data: { isDeleted: true, updatedAt: new Date(), updatedBy: userId },
      });
    } catch (error) {
      logger.e(error, 'Failed to delete tenant location', {
        tenantId: tenant.id,
        tenantCode: tenant.tenantCode,
      });
      throw new Error('Failed to delete tenant location');
    }
  }
}

export const tenantLocationService = new TenantLocationService();
