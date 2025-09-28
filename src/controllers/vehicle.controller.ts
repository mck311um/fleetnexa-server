import { NextFunction, Request, Response } from 'express';
import { vehicleRepo } from '../repository/vehicle.repository';
import prisma from '../config/prisma.config';

// #region Vehicle

const addVehicle = async (req: Request, res: Response, next: NextFunction) => {
  const { vehicle } = req.body;
  const userId = req.user?.id;
  const tenantId = req.user?.tenantId;

  try {
    const existingPlate = await prisma.vehicle.findFirst({
      where: { licensePlate: vehicle.licensePlate, isDeleted: false },
    });

    if (existingPlate) {
      return res.status(400).json({ message: 'License plate already exists' });
    }

    await prisma.$transaction(async (tx) => {
      await tx.vehicle.create({
        data: {
          id: vehicle.id,
          color: vehicle.color,
          engineVolume: vehicle.engineVolume,
          featuredImage: vehicle.featuredImage,
          features:
            vehicle.features && vehicle.features.length > 0
              ? {
                  connect: vehicle.features.map((feature: any) => ({
                    id: feature.id,
                  })),
                }
              : undefined,
          fuelLevel: vehicle.fuelLevel,
          images: vehicle.images,
          insurance: vehicle.insurance,
          insuranceExpiry: vehicle.insuranceExpiry,
          licensePlate: vehicle.licensePlate,
          brand: { connect: { id: vehicle.brandId } },
          model: { connect: { id: vehicle.modelId } },
          numberOfSeats: parseInt(vehicle.numberOfSeats),
          numberOfDoors: parseInt(vehicle.numberOfDoors),
          odometer: vehicle.odometer,
          registrationExpiry: vehicle.registrationExpiry,
          registrationNumber: vehicle.registrationNumber,
          steering: vehicle.steering,
          vin: vehicle.vin,
          year: vehicle.year,
          transmission: { connect: { id: vehicle.transmissionId } },
          vehicleStatus: { connect: { id: vehicle.vehicleStatusId } },
          createdAt: new Date(),
          updatedAt: new Date(),
          updatedBy: userId,
          wheelDrive: { connect: { id: vehicle.wheelDriveId } },
          fuelType: { connect: { id: vehicle.fuelTypeId } },
          tenant: { connect: { id: tenantId } },
          isDeleted: false,
          dayPrice: vehicle.dayPrice,
          weekPrice: vehicle.weekPrice,
          monthPrice: vehicle.monthPrice,
          timeBetweenRentals: vehicle.timeBetweenRentals,
          minimumAge: vehicle.minimumAge,
          minimumRental: vehicle.minimumRental,
          fuelPolicy: { connect: { id: vehicle.fuelPolicyId } },
          location: { connect: { id: vehicle.locationId } },
          drivingExperience: vehicle.drivingExperience,
          refundAmount: vehicle.refundAmount,
        },
      });

      if (vehicle.discounts && vehicle.discounts.length > 0) {
        for (const discount of vehicle.discounts) {
          await tx.vehicleDiscount.upsert({
            where: { id: discount.id },
            update: {
              periodMin: discount.periodMin,
              periodMax: discount.periodMax,
              amount: discount.amount,
              discountPolicy: discount.discountPolicy,
              vehicleId: vehicle.id,
              updatedBy: userId,
              updatedAt: new Date(),
            },
            create: {
              id: discount.id,
              vehicleId: vehicle.id,
              periodMin: discount.periodMin,
              periodMax: discount.periodMax,
              amount: discount.amount,
              discountPolicy: discount.discountPolicy,
              createdAt: new Date(),
              updatedAt: new Date(),
              updatedBy: userId,
            },
          });
        }
      }
    });

    const vehicles = await vehicleRepo.getVehicles(tenantId!);
    res.status(201).json(vehicles);
  } catch (error) {
    next(error);
    console.error(error);
    res.status(500).json({ message: 'Error Adding Vehicle' });
  }
};
const updateVehicle = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { vehicle } = req.body;
  const userId = req.user?.id;
  const tenantId = req.user?.tenantId;

  try {
    await prisma.$transaction(async (tx) => {
      await tx.vehicle.update({
        where: { id: vehicle.id },
        data: {
          color: vehicle.color,
          engineVolume: vehicle.engineVolume,
          featuredImage: vehicle.featuredImage,
          features:
            vehicle.features && vehicle.features.length > 0
              ? {
                  connect: vehicle.features.map((feature: any) => ({
                    id: feature.id,
                  })),
                }
              : undefined,
          fuelLevel: vehicle.fuelLevel,
          fuelType: { connect: { id: vehicle.fuelTypeId } },
          images: vehicle.images,
          insurance: vehicle.insurance,
          insuranceExpiry: vehicle.insuranceExpiry,
          licensePlate: vehicle.licensePlate,
          brand: { connect: { id: vehicle.brandId } },
          model: { connect: { id: vehicle.modelId } },
          numberOfSeats: parseInt(vehicle.numberOfSeats),
          numberOfDoors: parseInt(vehicle.numberOfDoors),
          odometer: vehicle.odometer,
          registrationExpiry: vehicle.registrationExpiry,
          registrationNumber: vehicle.registrationNumber,
          steering: vehicle.steering,
          transmission: { connect: { id: vehicle.transmissionId } },
          vehicleStatus: { connect: { id: vehicle.vehicleStatusId } },
          vin: vehicle.vin,
          year: vehicle.year,
          wheelDrive: { connect: { id: vehicle.wheelDriveId } },
          tenant: { connect: { id: tenantId } },
          updatedAt: new Date(),
          updatedBy: userId,
          isDeleted: false,
          dayPrice: vehicle.dayPrice,
          weekPrice: vehicle.weekPrice,
          monthPrice: vehicle.monthPrice,
          timeBetweenRentals: vehicle.timeBetweenRentals,
          minimumAge: vehicle.minimumAge,
          minimumRental: vehicle.minimumRental,
          fuelPolicy: { connect: { id: vehicle.fuelPolicyId } },
          location: { connect: { id: vehicle.locationId } },
          drivingExperience: vehicle.drivingExperience,
          refundAmount: vehicle.refundAmount,
        },
      });

      if (vehicle.discounts) {
        const newDiscountIds = vehicle.discounts
          .map((discount: any) => discount.id)
          .filter(Boolean);

        await tx.vehicleDiscount.deleteMany({
          where: {
            vehicleId: vehicle.id,
            NOT: { id: { in: newDiscountIds } },
          },
        });

        await Promise.all(
          vehicle.discounts.map((discount: any) =>
            tx.vehicleDiscount.upsert({
              where: { id: discount.id || '' },
              update: {
                periodMin: discount.periodMin,
                periodMax: discount.periodMax,
                amount: discount.amount,
                discountPolicy: discount.discountPolicy,
                updatedAt: new Date(),
                updatedBy: userId,
              },
              create: {
                id: discount.id || undefined,
                vehicleId: vehicle.id,
                periodMin: discount.periodMin,
                periodMax: discount.periodMax,
                amount: discount.amount,
                discountPolicy: discount.discountPolicy,
                createdAt: new Date(),
                updatedAt: new Date(),
                updatedBy: userId,
              },
            }),
          ),
        );
      }
    });

    const vehicles = await vehicleRepo.getVehicles(tenantId!);
    res.status(201).json(vehicles);
  } catch (error) {
    next(error);
  }
};
const deleteVehicle = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { id } = req.params;
  const userId = req.user?.id;
  const tenantId = req.user?.tenantId;

  try {
    await prisma.vehicle.update({
      where: { id },
      data: {
        isDeleted: true,
        updatedAt: new Date(),
        updatedBy: userId,
      },
    });

    const vehicles = await vehicleRepo.getVehicles(tenantId!);
    res.status(201).json(vehicles);
  } catch (error) {
    next(error);
  }
};
// #endregion

export default {
  addVehicle,
  updateVehicle,
  deleteVehicle,
};
