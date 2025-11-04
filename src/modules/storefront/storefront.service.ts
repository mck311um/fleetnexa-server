import { Tenant } from '@prisma/client';
import { logger } from '../../config/logger';
import prisma from '../../config/prisma.config';
import { tenantExtraService } from '../tenant/modules/tenant-extras/tenant-extras.service';
import { StorefrontRatingDto } from './storefront.dto';

class StorefrontService {
  async getTenants() {
    try {
      const tenants = await prisma.tenant.findMany({
        where: {
          storefrontEnabled: true,
          tenantLocations: {
            some: { storefrontEnabled: true, isDeleted: false },
          },
          vehicles: {
            some: {
              storefrontEnabled: true,
              isDeleted: false,
            },
          },
        },
        select: {
          id: true,
          tenantName: true,
          slug: true,
          logo: true,
          rating: true,
          description: true,
          email: true,
          number: true,
          _count: {
            select: {
              vehicles: {
                where: { storefrontEnabled: true, isDeleted: false },
              },
              ratings: true,
            },
          },
          ratings: true,
          address: {
            include: {
              country: true,
              state: true,
              village: true,
            },
          },
        },
      });

      return tenants;
    } catch (error) {
      logger.e(error, 'Error fetching tenants for storefront');
      throw error;
    }
  }

  async getTenantBySlug(slug: string) {
    try {
      const tenant = await prisma.tenant.findUnique({
        where: { slug, storefrontEnabled: true },
        select: {
          id: true,
          tenantName: true,
          slug: true,
          logo: true,
          rating: true,
          description: true,
          email: true,
          number: true,
          _count: {
            select: {
              vehicles: {
                where: { storefrontEnabled: true, isDeleted: false },
              },
              ratings: true,
            },
          },
          ratings: true,
          address: {
            include: {
              country: true,
              state: true,
              village: true,
            },
          },
          vehicles: {
            where: {
              storefrontEnabled: true,
              tenant: {
                storefrontEnabled: true,
              },
            },
            select: {
              id: true,
              year: true,
              color: true,
              licensePlate: true,
              engineVolume: true,
              steering: true,
              fuelLevel: true,
              featuredImage: true,
              vehicleStatus: true,
              wheelDrive: true,
              images: true,
              brand: true,
              numberOfSeats: true,
              numberOfDoors: true,
              transmission: true,
              features: true,
              fuelType: true,
              dayPrice: true,
              minimumRental: true,
              drivingExperience: true,
              discounts: true,
              model: {
                include: {
                  bodyType: true,
                },
              },
              rentals: {
                where: {
                  status: {
                    in: ['PENDING', 'ACTIVE', 'COMPLETED'],
                  },
                },
                select: {
                  startDate: true,
                  endDate: true,
                },
              },
              tenant: {
                select: {
                  id: true,
                  tenantName: true,
                  slug: true,
                  currency: true,
                  logo: true,
                  securityDeposit: true,
                  currencyRates: {
                    include: {
                      currency: true,
                    },
                  },
                  address: {
                    include: {
                      country: true,
                      state: true,
                      village: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      return tenant;
    } catch (error) {
      logger.e(error, 'Error fetching tenant by slug for storefront');
      throw error;
    }
  }

  async getVehicles() {
    try {
      const vehicles = await prisma.vehicle.findMany({
        where: {
          storefrontEnabled: true,
          isDeleted: false,
          tenant: {
            storefrontEnabled: true,
          },
        },
        select: {
          id: true,
          year: true,
          color: true,
          licensePlate: true,
          engineVolume: true,
          steering: true,
          fuelLevel: true,
          featuredImage: true,
          vehicleStatus: true,
          wheelDrive: true,
          images: true,
          brand: true,
          numberOfSeats: true,
          numberOfDoors: true,
          transmission: true,
          features: true,
          fuelType: true,
          dayPrice: true,
          minimumRental: true,
          drivingExperience: true,
          discounts: true,
          model: {
            include: {
              bodyType: true,
            },
          },
          rentals: {
            where: {
              status: {
                in: ['PENDING', 'ACTIVE', 'COMPLETED'],
              },
            },
            select: {
              startDate: true,
              endDate: true,
            },
          },
          tenant: {
            select: {
              id: true,
              tenantName: true,
              slug: true,
              currency: true,
              logo: true,
              securityDeposit: true,
              tenantLocations: {
                where: { storefrontEnabled: true, isDeleted: false },
              },
              currencyRates: {
                include: {
                  currency: true,
                },
              },
              address: {
                include: {
                  country: true,
                  state: true,
                  village: true,
                },
              },
            },
          },
        },
      });

      const tenantIds = [
        ...new Set(vehicles.map((v) => v.tenant?.id).filter(Boolean)),
      ];

      const tenantExtrasPromises = tenantIds.map((id) =>
        tenantExtraService.getTenantExtras(id || ''),
      );
      const tenantExtrasResults = await Promise.all(tenantExtrasPromises);

      const tenantExtras = tenantExtrasResults.flat();

      const vehiclesWithExtras = vehicles.map((vehicle) => ({
        ...vehicle,
        tenant: {
          ...vehicle.tenant,
          extras: tenantExtras.filter(
            (extra) => extra.tenantId === vehicle?.tenant?.id,
          ),
        },
      }));

      return vehiclesWithExtras;
    } catch (error) {
      logger.e(error, 'Error fetching vehicles for storefront');
      throw error;
    }
  }

  async getVehicleById(id: string) {
    try {
      const vehicle = await prisma.vehicle.findFirst({
        where: {
          id,
          storefrontEnabled: true,
          isDeleted: false,
          tenant: {
            storefrontEnabled: true,
          },
        },
        select: {
          id: true,
          year: true,
          color: true,
          licensePlate: true,
          engineVolume: true,
          steering: true,
          fuelLevel: true,
          featuredImage: true,
          vehicleStatus: true,
          wheelDrive: true,
          images: true,
          brand: true,
          numberOfSeats: true,
          numberOfDoors: true,
          transmission: true,
          features: true,
          fuelType: true,
          dayPrice: true,
          minimumRental: true,
          drivingExperience: true,
          discounts: true,
          model: {
            include: {
              bodyType: true,
            },
          },
          rentals: {
            where: {
              status: {
                in: ['PENDING', 'ACTIVE', 'COMPLETED'],
              },
            },
            select: {
              startDate: true,
              endDate: true,
            },
          },
          tenant: {
            select: {
              id: true,
              tenantName: true,
              slug: true,
              currency: true,
              logo: true,
              securityDeposit: true,
              currencyRates: {
                include: {
                  currency: true,
                },
              },
              tenantLocations: {
                where: { storefrontEnabled: true, isDeleted: false },
              },
              address: {
                include: {
                  country: true,
                  state: true,
                  village: true,
                },
              },
            },
          },
        },
      });

      const tenantExtras = await tenantExtraService.getTenantExtras(
        vehicle?.tenant?.id || '',
      );

      const vehicleWithExtras = vehicle
        ? {
            ...vehicle,
            tenant: {
              ...vehicle.tenant,
              extras: tenantExtras,
            },
          }
        : null;

      return vehicleWithExtras;
    } catch (error) {
      logger.e(error, 'Error fetching vehicle by ID for storefront');
      throw error;
    }
  }

  async rateTenant(data: StorefrontRatingDto, tenant: Tenant) {
    try {
      const newRating = await prisma.tenantRatings.create({
        data: {
          tenantId: tenant.id,
          rating: data.rating,
          comment: data.comment,
          fullName: data.fullName,
          email: data.email,
        },
      });

      // Recalculate tenant average rating
      const ratings = await prisma.tenantRatings.findMany({
        where: { tenantId: tenant.id },
        select: { rating: true },
      });

      const averageRating =
        ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;

      await prisma.tenant.update({
        where: { id: tenant.id },
        data: { rating: averageRating },
      });

      return newRating;
    } catch (error) {
      logger.e(error, 'Error rating tenant in storefront');
      throw error;
    }
  }
}
export const storefrontService = new StorefrontService();
