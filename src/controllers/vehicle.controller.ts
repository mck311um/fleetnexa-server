import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const addVehicle = async () => {};

// #region Vehicle Groups
const getVehicleGroups = async (req: any, res: any) => {
  const { tenantId } = req.params;

  try {
    const vehicleGroups = await prisma.vehicleGroup.findMany({
      where: {
        tenantId,
      },
      include: {
        discounts: true,
        _count: {
          select: { vehicles: true },
        },
      },
    });

    res.status(200).json(vehicleGroups);
  } catch (error: any) {
    console.error(error.message);
    res.status(400).json({ message: error.message });
  }
};
const upsertVehicleGroup = async (req: any, res: any) => {
  const { newGroup } = req.body;

  console.log(newGroup);

  try {
    const existingGroup = await prisma.vehicleGroup.findFirst({
      where: {
        tenantId: newGroup.tenantId,
        group: {
          equals: newGroup.group.toLowerCase(),
          mode: "insensitive",
        },
      },
    });

    if (existingGroup) {
      return res.status(409).json({ message: "Vehicle group already exists" });
    }

    await prisma.vehicleGroup.upsert({
      where: { id: newGroup.id },
      update: {
        group: newGroup.group,
        description: newGroup.description,
        price: newGroup.price,
        minimumBooking: newGroup.minimumBooking,
        maximumBooking: newGroup.maximumBooking,
        minimumAge: newGroup.minimumAge,
        drivingExperience: newGroup.drivingExperience,
        securityDeposit: newGroup.securityDeposit,
        securityDepositPolicy: newGroup.securityDepositPolicy,
        cancellationAmount: newGroup.cancellationAmount,
        cancellationPolicy: newGroup.cancellationPolicy,
        lateFee: newGroup.lateFee,
        lateFeePolicy: newGroup.lateFeePolicy,
        refundAmount: newGroup.refundAmount,
        refundPolicy: newGroup.refundPolicy,
        damageAmount: newGroup.damageAmount,
        damagePolicy: newGroup.damagePolicy,
        tenantId: newGroup.tenantId,
        chargeTypeId: newGroup.chargeTypeId,
        fuelPolicyId: newGroup.fuelPolicyId,
        updatedAt: new Date(),
      },
      create: {
        id: newGroup.id,
        group: newGroup.group,
        description: newGroup.description,
        price: newGroup.price,
        minimumBooking: newGroup.minimumBooking,
        maximumBooking: newGroup.maximumBooking,
        minimumAge: newGroup.minimumAge,
        drivingExperience: newGroup.drivingExperience,
        securityDeposit: newGroup.securityDeposit,
        securityDepositPolicy: newGroup.securityDepositPolicy,
        cancellationAmount: newGroup.cancellationAmount,
        cancellationPolicy: newGroup.cancellationPolicy,
        lateFee: newGroup.lateFee,
        lateFeePolicy: newGroup.lateFeePolicy,
        refundAmount: newGroup.refundAmount,
        refundPolicy: newGroup.refundPolicy,
        damageAmount: newGroup.damageAmount,
        damagePolicy: newGroup.damagePolicy,
        tenantId: newGroup.tenantId,
        chargeTypeId: newGroup.chargeTypeId,
        fuelPolicyId: newGroup.fuelPolicyId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    if (newGroup.discounts && newGroup.discounts.length > 0) {
      for (const discount of newGroup.discounts) {
        await prisma.vehicleDiscount.upsert({
          where: { id: discount.id },
          update: {
            periodMin: discount.periodMin,
            periodMax: discount.periodMax,
            amount: discount.amount,
            discountPolicy: discount.discountPolicy,
            vehicleGroupId: newGroup.id,
          },
          create: {
            id: discount.id,
            vehicleGroupId: newGroup.id,
            periodMin: discount.periodMin,
            periodMax: discount.periodMax,
            amount: discount.amount,
            discountPolicy: discount.discountPolicy,
          },
        });
      }
    }

    const vehicleGroups = await prisma.vehicleGroup.findMany({
      where: {
        tenantId: newGroup.tenantId,
      },
      include: {
        discounts: true,
      },
    });

    res.status(201).json({ ...vehicleGroups });
  } catch (error: any) {
    console.error(error.message);
    res.status(400).json({ message: error.message });
  }
};
// #endregion

export default {
  addVehicle,
  getVehicleGroups,
  upsertVehicleGroup,
};
