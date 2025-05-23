import prisma from "../config/prisma.config";
import { Request, Response, NextFunction } from "express";
import { tenantRepo } from "../repository/tenant.repository";
import { vehicleRepo } from "../repository/vehicle.repository";
import logUtil from "../config/logger.config";

const getAdminData = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const countries = await prisma.caribbeanCountry.findMany({
      include: { country: true },
    });
    const bodyTypes = await prisma.vehicleBodyType.findMany();
    const tenants = await prisma.tenant.findMany();

    res.status(200).json({
      countries,
      bodyTypes,
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
          model: {
            include: {
              bodyType: true,
            },
          },
          vehicleGroup: {
            select: {
              price: true,
              chargeType: true,
              minimumRental: true,
              maximumRental: true,
              drivingExperience: true,
            },
          },
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
        model: {
          include: {
            bodyType: true,
          },
        },
        vehicleGroup: {
          select: {
            price: true,
            chargeType: true,
            minimumRental: true,
            maximumRental: true,
            drivingExperience: true,
          },
        },
        tenant: {
          select: {
            id: true,
            tenantName: true,
            logo: true,
          },
        },
      },
    });

    return res.status(200).json(vehicles);
  } catch (error) {
    next(error);
  }
};

export default {
  getAdminData,
  getFeaturedData,
  getVehicles,
};
