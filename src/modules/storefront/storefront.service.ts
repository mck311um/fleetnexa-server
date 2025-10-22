import { logger } from '../../config/logger';
import prisma from '../../config/prisma.config';

class StorefrontService {
  async getTenants() {
    try {
      const tenants = await prisma.tenant.findMany({
        where: { storefrontEnabled: true },
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
              vehicles: true,
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
              vehicles: true,
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

      return vehicles;
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

      return vehicle;
    } catch (error) {
      logger.e(error, 'Error fetching vehicle by ID for storefront');
      throw error;
    }
  }
}
export const storefrontService = new StorefrontService();
