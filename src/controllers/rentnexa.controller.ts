import prisma from "../config/prisma.config";
import { Request, Response, NextFunction } from "express";
import { tenantRepo } from "../repository/tenant.repository";
import { vehicleRepo } from "../repository/vehicle.repository";
import logUtil from "../config/logger.config";
import loggerConfig from "../config/logger.config";

const getAdminData = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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
  } catch (error) {}
};

const getFeaturedData = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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
        })
      );

      const vehicles = await tx.vehicle.findMany({
        where: {
          tenant: {
            storefrontEnabled: true,
          },
        },
        select: {
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
          price: true,
          chargeType: true,
          minimumRental: true,
          drivingExperience: true,
          model: {
            include: {
              bodyType: true,
            },
          },
          // vehicleGroup: {
          //   select: {
          //     price: true,
          //     chargeType: true,
          //     minimumRental: true,
          //     maximumRental: true,
          //     drivingExperience: true,
          //   },
          // },
          tenant: {
            select: {
              id: true,
              tenantName: true,
              logo: true,
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
  } catch (error) {}
};
const getVehicles = async (req: Request, res: Response, next: NextFunction) => {
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
        price: true,
        chargeType: true,
        minimumRental: true,
        drivingExperience: true,
        minimumAge: true,
        fuelPolicy: true,
        rentals: {
          where: {
            status: {
              in: ["PENDING", "ACTIVE", "COMPLETED"],
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
        // vehicleGroup: {
        //   select: {
        //     price: true,
        //     chargeType: true,
        //     minimumRental: true,
        //     maximumRental: true,
        //     drivingExperience: true,
        //     minimumAge: true,
        //     fuelPolicy: true,
        //   },
        // },
        tenant: {
          select: {
            id: true,
            tenantName: true,
            logo: true,
            currency: true,
            tenantLocations: true,
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
            type: "Service",
            name: item.service.service,
            icon: item.service.icon,
            description: item.service.description,
          })),
          ...tenantEquipments.map((item) => ({
            ...item,
            type: "Equipment",
            name: item.equipment.equipment,
            icon: item.equipment.icon,
            description: item.equipment.description,
          })),
        ];

        return {
          ...vehicle,
          extras: combined,
        };
      })
    );

    return res.status(200).json(updatedVehicles);
  } catch (error) {
    next(error);
  }
};

export default {
  getAdminData,
  getFeaturedData,
  getVehicles,
};
