import { logger } from '../config/logger';
import prisma from '../config/prisma.config';
import { Request, Response } from 'express';

const getAdminData = async (req: Request, res: Response) => {
  try {
    const caribbeanCountries = await prisma.caribbeanCountry.findMany({
      where: {
        isActive: true,
      },
      include: { country: true },
    });
    const countries = await prisma.country.findMany();
    const villages = await prisma.village.findMany();
    const states = await prisma.state.findMany();
    const bodyTypes = await prisma.vehicleBodyType.findMany();
    const tenants = await prisma.tenant.findMany({
      where: {
        storefrontEnabled: true,
      },
      select: {
        id: true,
        tenantName: true,
        slug: true,
        logo: true,
        rating: true,
        description: true,
        _count: {
          select: {
            vehicles: true,
            ratings: true,
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
    });
    const currencies = await prisma.currency.findMany();

    res.status(200).json({
      countries,
      caribbeanCountries,
      villages,
      states,
      bodyTypes,
      currencies,
      tenants,
    });
  } catch (error) {
    logger.e(error, 'Get admin data failed:');
  }
};

const getFeaturedData = async (req: Request, res: Response) => {
  try {
    const featuredData = await prisma.$transaction(async (tx) => {
      const caribbeanCountries = await tx.caribbeanCountry.findMany({
        where: {
          isActive: true,
        },
        include: {
          country: true,
        },
      });

      const randomCountries = caribbeanCountries
        .sort(() => 0.5 - Math.random())
        .slice(0, 4);

      const featuredCountries = await Promise.all(
        randomCountries.map(async (country) => {
          const tenantCount = await prisma.tenant.count({
            where: {
              address: {
                countryId: country.countryId,
              },
            },
          });

          return {
            ...country,
            tenantCount,
          };
        }),
      );

      const vehicles = await tx.vehicle.findMany({
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
      });

      const featuredVehicles = vehicles
        .sort(() => 0.5 - Math.random())
        .slice(0, 6);

      const tenants = await tx.tenant.findMany({
        where: {
          storefrontEnabled: true,
        },
        select: {
          id: true,
          tenantName: true,
          logo: true,
          _count: {
            select: {
              vehicles: true,
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
      });

      const featuredTenants = tenants
        .sort(() => 0.5 - Math.random())
        .slice(0, 6);

      return {
        featuredCountries,
        featuredVehicles,
        featuredTenants,
      };
    });

    res.status(200).json(featuredData);
  } catch (error) {
    logger.e(error, 'Get featured data failed:');
  }
};
const getVehicles = async (req: Request, res: Response) => {
  try {
    const vehicles = await prisma.vehicle.findMany({
      where: {
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
        minimumAge: true,
        fuelPolicy: true,
        discounts: true,
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
        model: {
          include: {
            bodyType: true,
          },
        },
        tenant: {
          select: {
            id: true,
            tenantName: true,
            slug: true,
            logo: true,
            currency: true,
            tenantLocations: {
              where: { storefrontEnabled: true },
            },
            securityDeposit: true,
            additionalDriverFee: true,
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

    const updatedVehicles = await Promise.all(
      vehicles.map(async (vehicle) => {
        const [tenantServices, tenantEquipments] = await Promise.all([
          prisma.tenantService.findMany({
            where: { tenantId: vehicle.tenant?.id, isDeleted: false },
            include: { service: true },
          }),
          prisma.tenantEquipment.findMany({
            where: { tenantId: vehicle.tenant?.id, isDeleted: false },
            include: { equipment: true },
          }),
        ]);

        const combined = [
          ...tenantServices.map((item) => ({
            ...item,
            type: 'Service',
            name: item.service.service,
            icon: item.service.icon,
            description: item.service.description,
          })),
          ...tenantEquipments.map((item) => ({
            ...item,
            type: 'Equipment',
            name: item.equipment.equipment,
            icon: item.equipment.icon,
            description: item.equipment.description,
          })),
        ];

        return {
          ...vehicle,
          extras: combined,
        };
      }),
    );

    return res.status(200).json(updatedVehicles);
  } catch (error) {
    logger.e(error, 'Get vehicles failed:');
  }
};

const getVehicleById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const vehicle = await prisma.vehicle.findUnique({
      where: {
        id,
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
        minimumAge: true,
        fuelPolicy: true,
        discounts: true,
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
        model: {
          include: {
            bodyType: true,
          },
        },
        tenant: {
          select: {
            id: true,
            tenantName: true,
            slug: true,
            logo: true,
            currency: true,
            tenantLocations: {
              where: { storefrontEnabled: true },
            },
            securityDeposit: true,
            additionalDriverFee: true,
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

    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    const [tenantServices, tenantEquipments] = await Promise.all([
      prisma.tenantService.findMany({
        where: { tenantId: vehicle.tenant?.id, isDeleted: false },
        include: { service: true },
      }),
      prisma.tenantEquipment.findMany({
        where: { tenantId: vehicle.tenant?.id, isDeleted: false },
        include: { equipment: true },
      }),
    ]);

    const combined = [
      ...tenantServices.map((item) => ({
        ...item,
        type: 'Service',
        name: item.service.service,
        icon: item.service.icon,
        description: item.service.description,
      })),
      ...tenantEquipments.map((item) => ({
        ...item,
        type: 'Equipment',
        name: item.equipment.equipment,
        icon: item.equipment.icon,
        description: item.equipment.description,
      })),
    ];

    const updatedVehicle = {
      ...vehicle,
      extras: combined,
    };

    return res.status(200).json(updatedVehicle);
  } catch (error) {
    logger.e(error, 'Get vehicle by ID failed:');
  }
};
const getTenants = async (req: Request, res: Response) => {
  try {
    const tenants = await prisma.tenant.findMany({
      where: {
        storefrontEnabled: true,
      },
      select: {
        id: true,
        tenantName: true,
        slug: true,
        logo: true,
        rating: true,
        description: true,
        _count: {
          select: {
            vehicles: true,
            ratings: true,
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
    });

    return res.status(200).json(tenants);
  } catch (error) {
    logger.e(error, 'Get tenants failed:');
  }
};
const getTenantById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const tenant = await prisma.tenant.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        tenantName: true,
        logo: true,
        rating: true,
        description: true,
        vehicles: {
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
            minimumAge: true,
            fuelPolicy: true,
            discounts: true,
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
            model: {
              include: {
                bodyType: true,
              },
            },
            tenant: {
              select: {
                id: true,
                tenantName: true,
                slug: true,
                logo: true,
                currency: true,
                tenantLocations: {
                  where: { storefrontEnabled: true },
                },
                securityDeposit: true,
                additionalDriverFee: true,
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
        _count: {
          select: {
            vehicles: true,
            ratings: true,
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
    });

    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found' });
    }

    return res.status(200).json(tenant);
  } catch (error) {
    logger.e(error, 'Get tenant by ID failed:');
  }
};
const getTenantBySlug = async (req: Request, res: Response) => {
  const { slug } = req.params;
  try {
    const tenant = await prisma.tenant.findUnique({
      where: {
        slug,
      },
      select: {
        id: true,
        tenantName: true,
        logo: true,
        rating: true,
        description: true,
        vehicles: {
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
            minimumAge: true,
            fuelPolicy: true,
            discounts: true,
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
            model: {
              include: {
                bodyType: true,
              },
            },
            tenant: {
              select: {
                id: true,
                tenantName: true,
                slug: true,
                logo: true,
                currency: true,
                tenantLocations: {
                  where: { storefrontEnabled: true },
                },
                securityDeposit: true,
                additionalDriverFee: true,
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
        _count: {
          select: {
            vehicles: true,
            ratings: true,
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
    });

    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found' });
    }

    return res.status(200).json(tenant);
  } catch (error) {
    logger.e(error, 'Get tenant by slug failed:');
  }
};

export default {
  getAdminData,
  getFeaturedData,
  getVehicles,
  getVehicleById,
  getTenants,
  getTenantById,
  getTenantBySlug,
};
