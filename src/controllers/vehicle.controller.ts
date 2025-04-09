import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { connect } from "http2";

const prisma = new PrismaClient();

const getVehicles = async (req: Request, res: Response) => {
  const tenantId = req.user?.tenantId;

  try {
    const vehicles = await prisma.vehicle.findMany({
      where: { tenantId, isDeleted: false },
      include: {
        make: true,
        model: {
          include: {
            type: true,
          },
        },
        vehicleStatus: true,
        vehicleGroup: true,
        transmission: true,
        wheelDrive: true,
        fuelType: true,
        features: true,
      },
    });

    res.status(200).json(vehicles);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
const upsertVehicle = async (req: Request, res: Response) => {
  const { vehicle } = req.body;
  const userId = req.user?.id;
  const tenantId = req.user?.tenantId;

  try {
    await prisma.vehicle.upsert({
      where: { id: vehicle.id },
      update: {
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
        make: { connect: { id: vehicle.makeId } },
        model: { connect: { id: vehicle.modelId } },
        numberOfSeats: vehicle.numberOfSeats,
        numberOfDoors: vehicle.numberOfDoors,
        odometer: vehicle.odometer,
        registrationExpiry: vehicle.registrationExpiry,
        registrationNumber: vehicle.registrationNumber,
        tankVolume: vehicle.tankVolume,
        transmission: { connect: { id: vehicle.transmissionId } },
        vehicleGroup: { connect: { id: vehicle.vehicleGroupId } },
        vehicleStatus: { connect: { id: vehicle.vehicleStatusId } },
        vin: vehicle.vin,
        year: vehicle.year,
        wheelDrive: { connect: { id: vehicle.wheelDriveId } },
        tenant: { connect: { id: tenantId } },
      },
      create: {
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
        make: { connect: { id: vehicle.makeId } },
        model: { connect: { id: vehicle.modelId } },
        numberOfSeats: vehicle.numberOfSeats,
        numberOfDoors: vehicle.numberOfDoors,
        odometer: vehicle.odometer,
        registrationExpiry: vehicle.registrationExpiry,
        registrationNumber: vehicle.registrationNumber,
        tankVolume: vehicle.tankVolume,
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

    if (vehicle.damages && vehicle.damages.length > 0) {
      for (const damage of vehicle.damages) {
        await prisma.vehicleDamage.upsert({
          where: { id: damage.id },
          update: {
            vehicleId: vehicle.id,
            description: damage.description,
            customerId: damage.customerId,
            images: damage.image,
            isRepaired: damage.isRepaired,
            partId: damage.partId,
            location: damage.location,
            repairedAt: damage.repairedAt,
            severity: damage.severity,
            title: damage.title,
            updatedAt: new Date(),
            updatedBy: userId,
          },
          create: {
            id: damage.id,
            vehicleId: vehicle.id,
            description: damage.description,
            images: damage.image,
            isRepaired: false,
            partId: damage.partId,
            createdAt: new Date(),
            updatedAt: new Date(),
            updatedBy: userId,
            customerId: damage.customerId,
            location: damage.location,
            repairedAt: damage.repairedAt,
            severity: damage.severity,
            title: damage.title,
          },
        });
      }
    }

    const vehicleGroups = await prisma.vehicleGroup.findMany({
      where: { tenantId, isDeleted: false },
      include: {
        discounts: true,
        maintenanceServices: true,
        vehicles: true,
      },
    });

    res.status(201).json({ ...vehicleGroups });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// #region Vehicle Group
const getVehicleGroups = async (req: Request, res: Response) => {
  const tenantId = req.user?.tenantId;

  try {
    const vehicleGroups = await prisma.vehicleGroup.findMany({
      where: { tenantId, isDeleted: false },
      include: {
        discounts: true,
        maintenanceServices: true,
        vehicles: {
          include: {
            bookings: true,
            make: true,
            model: true,
          },
        },
        _count: {
          select: { vehicles: true },
        },
      },
    });

    res.status(200).json(vehicleGroups);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
const upsertVehicleGroup = async (req: Request, res: Response) => {
  const { vehicleGroup } = req.body;
  const userId = req.user?.id;
  const tenantId = req.user?.tenantId;

  try {
    await prisma.vehicleGroup.upsert({
      where: { id: vehicleGroup.id },
      update: {
        group: vehicleGroup.group,
        description: vehicleGroup.description,
        price: vehicleGroup.price,
        minimumBooking: vehicleGroup.minimumBooking,
        maximumBooking: vehicleGroup.maximumBooking,
        minimumAge: vehicleGroup.minimumAge,
        drivingExperience: vehicleGroup.drivingExperience,
        securityDeposit: vehicleGroup.securityDeposit,
        securityDepositPolicy: vehicleGroup.securityDepositPolicy,
        cancellationAmount: vehicleGroup.cancellationAmount,
        cancellationPolicy: vehicleGroup.cancellationPolicy,
        lateFee: vehicleGroup.lateFee,
        lateFeePolicy: vehicleGroup.lateFeePolicy,
        refundAmount: vehicleGroup.refundAmount,
        refundPolicy: vehicleGroup.refundPolicy,
        damageAmount: vehicleGroup.damageAmount,
        damagePolicy: vehicleGroup.damagePolicy,
        tenantId: vehicleGroup.tenantId,
        chargeTypeId: vehicleGroup.chargeTypeId,
        fuelPolicyId: vehicleGroup.fuelPolicyId,
        timeBetweenRentals: vehicleGroup.timeBetweenRentals,
        maintenanceEnabled: vehicleGroup.maintenanceEnabled,
        updatedAt: new Date(),
        updatedBy: userId,
      },
      create: {
        id: vehicleGroup.id,
        group: vehicleGroup.group,
        description: vehicleGroup.description,
        price: vehicleGroup.price,
        minimumBooking: vehicleGroup.minimumBooking,
        maximumBooking: vehicleGroup.maximumBooking,
        minimumAge: vehicleGroup.minimumAge,
        drivingExperience: vehicleGroup.drivingExperience,
        securityDeposit: vehicleGroup.securityDeposit,
        securityDepositPolicy: vehicleGroup.securityDepositPolicy,
        cancellationAmount: vehicleGroup.cancellationAmount,
        cancellationPolicy: vehicleGroup.cancellationPolicy,
        lateFee: vehicleGroup.lateFee,
        lateFeePolicy: vehicleGroup.lateFeePolicy,
        refundAmount: vehicleGroup.refundAmount,
        refundPolicy: vehicleGroup.refundPolicy,
        damageAmount: vehicleGroup.damageAmount,
        damagePolicy: vehicleGroup.damagePolicy,
        tenantId: vehicleGroup.tenantId,
        chargeTypeId: vehicleGroup.chargeTypeId,
        fuelPolicyId: vehicleGroup.fuelPolicyId,
        timeBetweenRentals: vehicleGroup.timeBetweenRentals,
        maintenanceEnabled: vehicleGroup.maintenanceEnabled,
        createdAt: new Date(),
        updatedAt: new Date(),
        updatedBy: userId,
      },
    });

    if (vehicleGroup.discounts && vehicleGroup.discounts.length > 0) {
      for (const discount of vehicleGroup.discounts) {
        await prisma.vehicleDiscount.upsert({
          where: { id: discount.id },
          update: {
            periodMin: discount.periodMin,
            periodMax: discount.periodMax,
            amount: discount.amount,
            discountPolicy: discount.discountPolicy,
            vehicleGroupId: vehicleGroup.id,
            updatedBy: userId,
            updatedAt: new Date(),
          },
          create: {
            id: discount.id,
            vehicleGroupId: vehicleGroup.id,
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

    if (
      vehicleGroup.maintenanceServices &&
      vehicleGroup.maintenanceServices.length > 0
    ) {
      for (const maintenanceService of vehicleGroup.maintenanceServices) {
        await prisma.vehicleGroupMaintenanceService.upsert({
          where: { id: maintenanceService.id },
          update: {
            vehicleGroupId: vehicleGroup.id,
            serviceId: maintenanceService.serviceId,
            period: maintenanceService.period,
            enabled: maintenanceService.enabled,
            updatedAt: new Date(),
            updatedBy: userId,
          },
          create: {
            vehicleGroupId: vehicleGroup.id,
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

    const vehicleGroups = await prisma.vehicleGroup.findMany({
      where: { tenantId, isDeleted: false },
      include: { discounts: true, maintenanceServices: true, vehicles: true },
    });

    res.status(201).json({ ...vehicleGroups });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
// #endregion

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
  upsertVehicleGroup,
  addVehicleGroupDiscount,
  updateVehicleGroupDiscount,
  deleteVehicleGroupDiscount,
  addVehicleGroupMaintenance,
  upsertVehicle,
  getVehicles,
};
