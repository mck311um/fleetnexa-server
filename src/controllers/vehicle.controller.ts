import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import {
  vehicleRepo,
  vehicleGroupRepo,
} from "../repository/vehicle.repository";
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
const getVehiclesByGroup = async (req: Request, res: Response) => {
  const { id } = req.params;
  const tenantId = req.user?.tenantId;
  try {
    const vehicles = await vehicleRepo.getVehicleByGroupId(id, tenantId!);
    res.status(200).json(vehicles);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
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

    await prisma.vehicle.create({
      data: {
        id: vehicle.id,
        color: vehicle.color,
        engineVolume: vehicle.engineVolume,
        featuredImage: vehicle.featuredImage,
        features: {
          connect: vehicle.features.map((feature: any) => ({ id: feature.id })),
        },
        fuelLevel: parseInt(vehicle.fuelLevel),
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
        vehicleGroup: { connect: { id: vehicle.vehicleGroupId } },
        vehicleStatus: { connect: { id: vehicle.vehicleStatusId } },
        createdAt: new Date(),
        updatedAt: new Date(),
        updatedBy: userId,
        wheelDrive: { connect: { id: vehicle.wheelDriveId } },
        fuelType: { connect: { id: vehicle.fuelTypeId } },
        tenant: { connect: { id: tenantId } },
      },
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
    await prisma.vehicle.update({
      where: { id: vehicle.id },
      data: {
        color: vehicle.color,
        engineVolume: vehicle.engineVolume,
        featuredImage: vehicle.featuredImage,
        features: {
          connect: vehicle.features.map((feature: any) => ({ id: feature.id })),
        },
        fuelLevel: parseInt(vehicle.fuelLevel),
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
        vehicleGroup: { connect: { id: vehicle.vehicleGroupId } },
        vehicleStatus: { connect: { id: vehicle.vehicleStatusId } },
        vin: vehicle.vin,
        year: vehicle.year,
        wheelDrive: { connect: { id: vehicle.wheelDriveId } },
        tenant: { connect: { id: tenantId } },
        updatedAt: new Date(),
        updatedBy: userId,
      },
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

// #region Vehicle Group
const getVehicleGroups = async (req: Request, res: Response) => {
  const tenantId = req.user?.tenantId;
  try {
    const vehicleGroups = await vehicleGroupRepo.getVehicleGroups(tenantId!);
    res.status(200).json(vehicleGroups);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
const getVehicleGroupById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const tenantId = req.user?.tenantId;

  try {
    const vehicleGroup = await vehicleGroupRepo.getVehicleGroupById(
      id,
      tenantId!
    );

    if (!vehicleGroup) {
      return res.status(404).json({ message: "Vehicle group not found" });
    }

    res.status(200).json(vehicleGroup);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
const addVehicleGroup = async (req: Request, res: Response) => {
  const { group } = req.body;
  const userId = req.user?.id;
  const tenantId = req.user?.tenantId;

  try {
    await prisma.$transaction(async (tx) => {
      await tx.vehicleGroup.create({
        data: {
          id: group.id,
          group: group.group,
          description: group.description,
          price: group.price,
          minimumBooking: group.minimumBooking,
          maximumBooking: group.maximumBooking,
          minimumAge: group.minimumAge,
          drivingExperience: group.drivingExperience,
          cancellationAmount: group.cancellationAmount,
          cancellationPolicy: group.cancellationPolicy,
          lateFee: group.lateFee,
          lateFeePolicy: group.lateFeePolicy,
          refundAmount: group.refundAmount,
          refundPolicy: group.refundPolicy,
          damageAmount: group.damageAmount,
          damagePolicy: group.damagePolicy,
          tenantId: group.tenantId,
          chargeTypeId: group.chargeTypeId,
          fuelPolicyId: group.fuelPolicyId,
          timeBetweenRentals: group.timeBetweenRentals,
          maintenanceEnabled: group.maintenanceEnabled,
          createdAt: new Date(),
          updatedAt: new Date(),
          updatedBy: userId,
        },
      });

      if (group.discounts && group.discounts.length > 0) {
        for (const discount of group.discounts) {
          await tx.vehicleDiscount.upsert({
            where: { id: discount.id },
            update: {
              periodMin: discount.periodMin,
              periodMax: discount.periodMax,
              amount: discount.amount,
              discountPolicy: discount.discountPolicy,
              vehicleGroupId: group.id,
              updatedBy: userId,
              updatedAt: new Date(),
            },
            create: {
              id: discount.id,
              vehicleGroupId: group.id,
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

      if (group.maintenanceServices && group.maintenanceServices.length > 0) {
        for (const maintenanceService of group.maintenanceServices) {
          await tx.vehicleGroupMaintenanceService.upsert({
            where: { id: maintenanceService.id },
            update: {
              vehicleGroupId: group.id,
              serviceId: maintenanceService.serviceId,
              period: maintenanceService.period,
              enabled: maintenanceService.enabled,
              updatedAt: new Date(),
              updatedBy: userId,
            },
            create: {
              vehicleGroupId: group.id,
              serviceId: maintenanceService.serviceId,
              period: maintenanceService.period,
              enabled: maintenanceService.enabled,
              createdAt: new Date(),
              updatedAt: new Date(),
              updatedBy: userId,
            },
          });
        }
      }
    });

    const vehicleGroups = await vehicleGroupRepo.getVehicleGroups(tenantId!);
    res.status(201).json(vehicleGroups);
  } catch (error: any) {
    console.error(error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    res.status(500).json({
      message: "Failed to create vehicle group",
      error: errorMessage,
    });
  }
};
const updateVehicleGroup = async (req: Request, res: Response) => {
  const { group } = req.body;
  const userId = req.user?.id;
  const tenantId = req.user?.tenantId;

  try {
    await prisma.$transaction(async (tx) => {
      await tx.vehicleGroup.update({
        where: { id: group.id },
        data: {
          group: group.group,
          description: group.description,
          price: group.price,
          minimumBooking: group.minimumBooking,
          maximumBooking: group.maximumBooking,
          minimumAge: group.minimumAge,
          drivingExperience: group.drivingExperience,
          cancellationAmount: group.cancellationAmount,
          cancellationPolicy: group.cancellationPolicy,
          lateFee: group.lateFee,
          lateFeePolicy: group.lateFeePolicy,
          refundAmount: group.refundAmount,
          refundPolicy: group.refundPolicy,
          damageAmount: group.damageAmount,
          damagePolicy: group.damagePolicy,
          chargeTypeId: group.chargeTypeId,
          fuelPolicyId: group.fuelPolicyId,
          timeBetweenRentals: group.timeBetweenRentals,
          maintenanceEnabled: group.maintenanceEnabled,
          updatedAt: new Date(),
          updatedBy: userId,
        },
      });

      if (group.discounts) {
        const newDiscountIds = group.discounts
          .map((discount: any) => discount.id)
          .filter(Boolean);

        await tx.vehicleDiscount.deleteMany({
          where: {
            vehicleGroupId: group.id,
            NOT: { id: { in: newDiscountIds } },
          },
        });

        await Promise.all(
          group.discounts.map((discount: any) =>
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
                vehicleGroupId: group.id,
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

      if (group.maintenanceServices) {
        const newServiceIds = group.maintenanceServices
          .map((service: any) => service.id)
          .filter(Boolean);

        await tx.vehicleGroupMaintenanceService.deleteMany({
          where: {
            vehicleGroupId: group.id,
            NOT: { id: { in: newServiceIds } },
          },
        });
        await Promise.all(
          group.maintenanceServices.map((service: any) =>
            tx.vehicleGroupMaintenanceService.upsert({
              where: { id: service.id || "" },
              update: {
                serviceId: service.serviceId,
                period: service.period,
                enabled: service.enabled,
                updatedAt: new Date(),
                updatedBy: userId,
              },
              create: {
                id: service.id || undefined,
                vehicleGroupId: group.id,
                serviceId: service.serviceId,
                period: service.period,
                enabled: service.enabled,
                createdAt: new Date(),
                updatedAt: new Date(),
                updatedBy: userId,
              },
            })
          )
        );
      }
    });

    const vehicleGroups = await vehicleGroupRepo.getVehicleGroups(tenantId!);
    res.status(201).json(vehicleGroups);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error Updating Vehicle Group" });
  }
};
const deleteVehicleGroup = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;
  const tenantId = req.user?.tenantId;

  try {
    await prisma.vehicleGroup.update({
      where: { id },
      data: {
        isDeleted: true,
        updatedAt: new Date(),
        updatedBy: userId,
      },
    });

    const vehicleGroups = await vehicleGroupRepo.getVehicleGroups(tenantId!);
    res.status(201).json(vehicleGroups);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error Deleting Vehicle Group" });
  }
};

// #endregion

// #region Vehicle Group Discounts
const addVehicleGroupDiscount = async (req: Request, res: Response) => {
  const { discount } = req.body;
  const userId = req.user?.id;
  const tenantId = req.user?.tenantId;

  try {
    await prisma.vehicleDiscount.create({
      data: {
        periodMin: discount.periodMin,
        periodMax: discount.periodMax,
        amount: discount.amount,
        discountPolicy: discount.discountPolicy,
        vehicleGroupId: discount.vehicleGroupId,
        createdAt: new Date(),
        updatedAt: new Date(),
        updatedBy: userId,
        isDeleted: false,
      },
    });

    const vehicleDiscounts = await prisma.vehicleDiscount.findMany({
      where: { vehicleGroupId: discount.vehicleGroupId, isDeleted: false },
    });

    res.status(201).json({ ...vehicleDiscounts });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
const updateVehicleGroupDiscount = async (req: Request, res: Response) => {
  const { discount } = req.body;
  const userId = req.user?.id;

  try {
    await prisma.vehicleDiscount.update({
      where: { id: discount.id },
      data: {
        periodMin: discount.periodMin,
        periodMax: discount.periodMax,
        amount: discount.amount,
        discountPolicy: discount.discountPolicy,
        updatedAt: new Date(),
        updatedBy: userId,
      },
    });

    const vehicleDiscounts = await prisma.vehicleDiscount.findMany({
      where: { vehicleGroupId: discount.vehicleGroupId, isDeleted: false },
    });

    res.status(200).json({ ...vehicleDiscounts });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
const deleteVehicleGroupDiscount = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;

  try {
    await prisma.vehicleDiscount.update({
      where: { id },
      data: {
        isDeleted: true,
        updatedAt: new Date(),
        updatedBy: userId,
      },
    });

    res.status(200).json({ message: "Discount deleted" });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
// #endregion

const addVehicleGroupMaintenance = async (req: Request, res: Response) => {
  const { body } = req.body;
  const userId = req.user?.id;
  const tenantId = req.user?.tenantId;

  try {
    await prisma.vehicleGroupMaintenanceService.upsert({
      where: { id: body.id },
      update: {
        vehicleGroupId: body.vehicleGroupId,
        serviceId: body.serviceId,
        period: body.period,
        enabled: body.enabled,
        updatedAt: new Date(),
        updatedBy: userId,
      },
      create: {
        vehicleGroupId: body.vehicleGroupId,
        serviceId: body.serviceId,
        period: body.period,
        enabled: body.enabled,
        createdAt: new Date(),
        updatedAt: new Date(),
        updatedBy: userId,
      },
    });

    const vehicleGroupMaintenance =
      await prisma.vehicleGroupMaintenanceService.findMany({
        where: { vehicleGroupId: body.vehicleGroupId },
      });

    res.status(201).json({ ...vehicleGroupMaintenance });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export default {
  getVehicleGroups,
  getVehicleGroupById,
  addVehicleGroup,
  updateVehicleGroup,
  deleteVehicleGroup,
  addVehicleGroupDiscount,
  updateVehicleGroupDiscount,
  deleteVehicleGroupDiscount,
  addVehicleGroupMaintenance,
  getVehicles,
  getVehicleById,
  getVehiclesByGroup,
  addVehicle,
  updateVehicle,
  deleteVehicle,
  getVehicleDamages,
  addVehicleDamage,
  updateVehicleDamage,
  deleteVehicleDamage,
};
