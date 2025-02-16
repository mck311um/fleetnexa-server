import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import aws from "../utils/aws.utils";

const prisma = new PrismaClient();

const addTenant = async (req: any, res: any) => {
  const { tenantCode, tenantName, email, number } = req.body;
  try {
    await prisma.tenant.create({
      data: {
        tenantCode,
        tenantName,
        email,
        number,
        setupCompleted: false,
      },
    });

    res.status(201).end();
  } catch (error: any) {
    console.error(error.message);
    res.status(400).json({ message: error.message });
  }
};

const getTenantData = async (req: any, res: any) => {
  const { tenantCode } = req.params;

  try {
    const tenant = await prisma.tenant.findUnique({
      where: { tenantCode },
      include: {
        paymentMethods: true,
        services: true,
        vehicleGroups: {
          include: {
            discounts: true,
            vehicles: true,
          },
        },
        address: true,
      },
    });

    if (!tenant) {
      return res.status(401).json({ error: "Invalid tenant code" });
    }

    res.status(201).json(tenant);
  } catch (error: any) {
    console.error(error.message);
    res.status(500).json({ error: error.message });
  }
};

const setUpTenant = async (req: any, res: any) => {
  const { tenantCode } = req.params;
  const { data } = req.body;

  try {
    await aws.createS3Folder(data.tenantCode);

    let addressId: string | null = null;

    if (data.address) {
      const address = await prisma.address.upsert({
        where: { tenantId: data.id },
        update: {
          street: data.address.street,
          zipCode: data.address.zipCode.toString(),
          village: { connect: { id: data.address.villageId } },
          state: { connect: { id: data.address.stateId } },
          country: { connect: { id: data.address.countryId } },
        },
        create: {
          tenant: { connect: { id: data.id } },
          street: data.address.street,
          zipCode: data.address.zipCode.toString(),
          village: { connect: { id: data.address.villageId } },
          state: { connect: { id: data.address.stateId } },
          country: { connect: { id: data.address.countryId } },
        },
      });

      addressId = address.id;
    }

    await prisma.tenant.update({
      where: { id: data.id },
      data: {
        currencyId: data.currencyId,
        email: data.email,
        invoiceFootNotes: data.invoiceFootNotes,
        invoiceSequenceId: data.invoiceSequenceId,
        logo: data.logo,
        number: data.number,
        tenantName: data.tenantName,
      },
    });

    async () => {
      const tenantPaymentMethods = data.paymentMethods.map((method: any) => ({
        tenantId: method.tenantId,
        paymentMethodId: method.paymentMethodId,
      }));

      await prisma.tenantPaymentMethod.createMany({
        data: tenantPaymentMethods,
        skipDuplicates: true,
      });
    };

    if (data.vehicleGroups && data.vehicleGroups.length > 0) {
      for (const group of data.vehicleGroups) {
        await prisma.vehicleGroup.upsert({
          where: {
            id: group.id,
          },
          update: {
            tenantId: data.id,
            group: group.group,
            minimumBooking: group.minimumBooking,
            maximumBooking: group.maximumBooking,
            minimumAge: group.minimumAge,
            drivingExperience: group.drivingExperience,
            chargeTypeId: group.chargeTypeId,
            description: group.description,
            price: group.price,
            fuelPolicyId: group.fuelPolicyId,
            securityDeposit: group.securityDeposit,
            securityDepositPolicy: group.securityDepositPolicy,
            cancellationAmount: group.cancellationAmount,
            cancellationPolicy: group.cancellationPolicy,
            lateFee: group.lateFee,
            lateFeePolicy: group.lateFeePolicy,
            refundPolicy: group.refundPolicy,
            refundAmount: group.refundAmount,
            damagePolicy: group.damagePolicy,
            damageAmount: group.damageAmount,
          },
          create: {
            tenantId: data.id,
            id: group.id,
            group: group.group,
            minimumBooking: group.minimumBooking,
            maximumBooking: group.maximumBooking,
            minimumAge: group.minimumAge,
            drivingExperience: group.drivingExperience,
            chargeTypeId: group.chargeTypeId,
            description: group.description,
            price: group.price,
            fuelPolicyId: group.fuelPolicyId,
            securityDeposit: group.securityDeposit,
            securityDepositPolicy: group.securityDepositPolicy,
            cancellationAmount: group.cancellationAmount,
            cancellationPolicy: group.cancellationPolicy,
            lateFee: group.lateFee,
            lateFeePolicy: group.lateFeePolicy,
            refundPolicy: group.refundPolicy,
            refundAmount: group.refundAmount,
            damagePolicy: group.damagePolicy,
            damageAmount: group.damageAmount,
          },
        });

        if (group.discounts && group.discounts.length > 0) {
          await prisma.vehicleDiscount.createMany({
            data: group.discounts.map((discount: any) => ({
              id: discount.id,
              vehicleGroupId: group.id,
              periodMin: discount.periodMin,
              periodMax: discount.periodMax,
              amount: discount.amount,
              discountPolicy: discount.discountPolicy,
            })),
            skipDuplicates: true,
          });
        }
      }
    }

    res.status(201).end();
  } catch (error: any) {
    console.error(error.message);
    res.status(400).json({ message: error.message });
  }
};

// #region Services
const addService = async (req: any, res: any) => {
  const { service, description, price, status } = req.body;
  const { tenant } = req;

  console.log(req);

  try {
    await prisma.service.create({
      data: {
        service,
        description,
        price,
        status,
        tenant,
      },
    });
    res.status(201).end();
  } catch (error: any) {
    console.error(error.message);
    res.status(400).json({ message: error.message });
  }
};
// #endregion

export default {
  addTenant,
  getTenantData,
  addService,
  setUpTenant,
};
