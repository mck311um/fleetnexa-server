import { PrismaClient } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import { vehicleRepo } from "../repository/vehicle.repository";
import prisma from "../config/prisma.config";

// #region Vehicle
const getVehicles = async (req: Request, res: Response) => {
  const tenantId = req.user?.tenantId;

  try {
    const vehicles = await vehicleRepo.getVehicles(tenantId!);
    res.status(200).json(vehicles);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
const getVehicleById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const vehicle = await vehicleRepo.getVehicleById(id, req.user?.tenantId!);

    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    res.status(200).json(vehicle);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
const updateVehicleStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  const { status } = req.body;
  const userId = req.user?.id;
  const tenantId = req.user?.tenantId;
  try {
    await prisma.vehicle.update({
      where: { id },
      data: {
        vehicleStatus: { connect: { id: status } },
        updatedAt: new Date(),
        updatedBy: userId,
      },
    });

    const vehicle = await vehicleRepo.getVehicleById(id, tenantId!);
    const vehicles = await vehicleRepo.getVehicles(tenantId!);

    res.status(200).json({ vehicle, vehicles });
  } catch (error) {
    next(error);
  }
};
const addVehicle = async (req: Request, res: Response) => {
  const { vehicle } = req.body;
  const userId = req.user?.id;
  const tenantId = req.user?.tenantId;

  try {
    const existingPlate = await prisma.vehicle.findFirst({
      where: { licensePlate: vehicle.licensePlate, isDeleted: false },
    });

    if (existingPlate) {
      return res.status(400).json({ message: "License plate already exists" });
    }

    await prisma.$transaction(async (tx) => {
      await tx.vehicle.create({
        data: {
          id: vehicle.id,
          color: vehicle.color,
          engineVolume: vehicle.engineVolume,
          featuredImage: vehicle.featuredImage,
          features: {
            connect: vehicle.features.map((feature: any) => ({
              id: feature.id,
            })),
          },
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
          price: vehicle.price,
          timeBetweenRentals: vehicle.timeBetweenRentals,
          minimumAge: vehicle.minimumAge,
          minimumRental: vehicle.minimumRental,
          fuelPolicy: { connect: { id: vehicle.fuelPolicyId } },
          chargeType: { connect: { id: vehicle.chargeTypeId } },
          location: { connect: { id: vehicle.locationId } },
          drivingExperience: vehicle.drivingExperience,
          lateFee: vehicle.lateFee,
          maxHours: vehicle.maxHours,
          refundAmount: vehicle.refundAmount,
          additionalDriverFee: vehicle.additionalDriverFee,
          securityDeposit: vehicle.securityDeposit,
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
    console.error(error);
    res.status(500).json({ message: "Error Adding Vehicle" });
  }
};
const updateVehicle = async (req: Request, res: Response) => {
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
          features: {
            connect: vehicle.features.map((feature: any) => ({
              id: feature.id,
            })),
          },
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
          price: vehicle.price,
          timeBetweenRentals: vehicle.timeBetweenRentals,
          minimumAge: vehicle.minimumAge,
          minimumRental: vehicle.minimumRental,
          fuelPolicy: { connect: { id: vehicle.fuelPolicyId } },
          chargeType: { connect: { id: vehicle.chargeTypeId } },
          location: { connect: { id: vehicle.locationId } },
          drivingExperience: vehicle.drivingExperience,
          lateFee: vehicle.lateFee,
          maxHours: vehicle.maxHours,
          refundAmount: vehicle.refundAmount,
          additionalDriverFee: vehicle.additionalDriverFee,
          securityDeposit: vehicle.securityDeposit,
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
              where: { id: discount.id || "" },
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
            })
          )
        );
      }
    });

    const vehicles = await vehicleRepo.getVehicles(tenantId!);
    res.status(201).json(vehicles);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error Updating Vehicle" });
  }
};
const deleteVehicle = async (req: Request, res: Response) => {
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
    console.error(error);
    res.status(500).json({ message: "Error Deleting Vehicle" });
  }
};
// #endregion

// #region VehicleDamages
const getVehicleDamages = async (req: Request, res: Response) => {
  const { vehicleId } = req.params;

  try {
    const vehicleDamages = await prisma.vehicleDamage.findMany({
      where: { vehicleId, isDeleted: false },
      include: {
        customer: true,
      },
    });

    res.status(200).json(vehicleDamages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error Fetching Vehicle Damages" });
  }
};
const addVehicleDamage = async (req: Request, res: Response) => {
  const { damage } = req.body;
  const userId = req.user?.id;
  const tenantId = req.user?.tenantId;
  try {
    console.log("damage", damage);

    await prisma.vehicleDamage.create({
      data: {
        id: damage.id,
        vehicleId: damage.vehicleId,
        description: damage.description,
        images: damage.image,
        isRepaired: false,
        partId: damage.partId,
        createdAt: new Date(),
        updatedAt: new Date(),
        updatedBy: userId,
        customerId:
          damage.customerId &&
          (await prisma.customer.findUnique({
            where: { id: damage.customerId },
          }))
            ? damage.customerId
            : null,
        location: damage.location,
        repairedAt: damage.repairedAt,
        severity: damage.severity,
        title: damage.title,
      },
    });

    const vehicleDamages = await prisma.vehicleDamage.findMany({
      where: { vehicleId: damage.vehicleId, isDeleted: false },
    });

    res.status(201).json({ ...vehicleDamages });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error Adding Vehicle Damage" });
  }
};
const updateVehicleDamage = async (req: Request, res: Response) => {
  const { damage } = req.body;
  const userId = req.user?.id;
  console.log("damage", damage);

  try {
    await prisma.vehicleDamage.update({
      where: { id: damage.id },
      data: {
        vehicleId: damage.vehicleId,
        description: damage.description,
        images: damage.images,
        isRepaired: damage.isRepaired,
        partId: damage.partId,
        updatedAt: new Date(),
        updatedBy: userId,
        customerId:
          damage.customerId &&
          (await prisma.customer.findUnique({
            where: { id: damage.customerId },
          }))
            ? damage.customerId
            : null,
        location: damage.location,
        repairedAt: damage.repairedAt,
        severity: damage.severity,
        title: damage.title,
      },
    });

    const vehicleDamages = await prisma.vehicleDamage.findMany({
      where: { vehicleId: damage.vehicleId, isDeleted: false },
    });

    res.status(200).json({ ...vehicleDamages });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error Updating Vehicle Damage" });
  }
};
const deleteVehicleDamage = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;

  try {
    const vehicleDamage = await prisma.vehicleDamage.findUnique({
      where: { id },
    });

    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleDamage?.vehicleId },
    });

    await prisma.vehicleDamage.update({
      where: { id },
      data: {
        isDeleted: true,
        updatedAt: new Date(),
        updatedBy: userId,
      },
    });

    const vehicleDamages = await prisma.vehicleDamage.findMany({
      where: { vehicleId: vehicle?.id, isDeleted: false },
    });

    res.status(200).json({ ...vehicleDamages });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error Deleting Vehicle Damage" });
  }
};
// #endregion

export default {
  getVehicles,
  getVehicleById,
  addVehicle,
  updateVehicle,
  deleteVehicle,
  getVehicleDamages,
  addVehicleDamage,
  updateVehicleDamage,
  deleteVehicleDamage,
  updateVehicleStatus,
};
