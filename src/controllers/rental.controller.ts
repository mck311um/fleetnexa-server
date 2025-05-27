import { NextFunction, Request, Response } from "express";
import { tenantRepo } from "../repository/tenant.repository";
import generator from "../services/pdfGenerator.service";
import logUtil from "../config/logger.config";
import prisma from "../config/prisma.config";
import numberGenerator from "../services/numberGenerator.service";
import { rentalRepo } from "../repository/rental.repository";

const getRentals = async (req: Request, res: Response) => {
  const tenantId = req.user?.tenantId;

  try {
    if (!tenantId) {
      return res.status(400).json({ error: "Tenant ID is required" });
    }
    const rentals = await rentalRepo.getRentals(tenantId);
    return res.status(200).json(rentals);
  } catch (error) {
    console.error("Error fetching rentals:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: error instanceof Error ? error.message : undefined,
    });
  }
};
const getRentalById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const tenantId = req.user?.tenantId;
  const userId = req.user?.id;
  try {
    if (!tenantId) {
      return res.status(400).json({ error: "Tenant ID is required" });
    }
    const rental = await rentalRepo.getRentalById(id, tenantId);
    if (!rental) {
      return res.status(404).json({ error: "Rental not found" });
    }
    return res.status(200).json(rental);
  } catch (error) {
    console.error("Error fetching rental:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: error instanceof Error ? error.message : undefined,
    });
  }
};
const handleRental = async (req: Request, res: Response) => {
  const { rental } = req.body;
  const userId = req.user?.id;
  const tenantId = req.user?.tenantId;

  if (!tenantId) {
    return res.status(400).json({ error: "Tenant ID is required" });
  }

  if (!rental) {
    return res.status(400).json({ error: "Rental data is required" });
  }

  try {
    await prisma.$transaction(async (tx) => {
      if (!rental.rentalNumber) {
        const rentalNumber = await numberGenerator.generateRentalNumber(
          tenantId!
        );
        rental.rentalNumber = rentalNumber;
      }

      const rentalData = {
        startDate: rental.startDate,
        endDate: rental.endDate,
        pickupLocationId: rental.pickupLocationId,
        returnLocationId: rental.returnLocationId,
        vehicleId: rental.vehicleId,
        customerId: rental.customerId,
        agent: rental.agent,
        signature: rental.signature,
        createdAt: new Date(),
        createdBy: userId,
        updatedAt: new Date(),
        updatedBy: userId,
        vehicleGroupId: rental.vehicleGroupId,
        tenantId,
        status: rental.status,
        notes: rental.notes,
        rentalNumber: rental.rentalNumber,
      };

      await tx.rental.upsert({
        where: { id: rental.id },
        create: { id: rental.id, ...rentalData },
        update: rentalData,
      });

      let upsertedValues: any = null;
      if (rental.values) {
        const valuesData = {
          numberOfDays: parseFloat(rental.values.numberOfDays),
          basePrice: parseFloat(rental.values.basePrice),
          totalCost: parseFloat(rental.values.totalCost),
          discount: parseFloat(rental.values.discount),
          deliveryFee: parseFloat(rental.values.deliveryFee),
          collectionFee: parseFloat(rental.values.collectionFee),
          deposit: parseFloat(rental.values.deposit),
          totalExtras: parseFloat(rental.values.totalExtras),
          subTotal: parseFloat(rental.values.subTotal),
          netTotal: parseFloat(rental.values.netTotal),
          discountMin: parseFloat(rental.values.discountMin),
          discountMax: parseFloat(rental.values.discountMax),
          discountAmount: parseFloat(rental.values.discountAmount),
          discountPolicy: rental.values.discountPolicy,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        upsertedValues = await tx.values.upsert({
          where: { id: rental.values.id },
          create: {
            id: rental.values.id,
            rentalId: rental.id,
            ...valuesData,
          },
          update: valuesData,
        });

        if (rental.values.extras?.length) {
          await tx.rentalExtra.deleteMany({
            where: {
              valuesId: upsertedValues.id,
              id: {
                notIn: rental.values.extras
                  .map((e: any) => e.id)
                  .filter(Boolean),
              },
            },
          });

          const extrasPromises = rental.values.extras.map((extra: any) =>
            tx.rentalExtra.upsert({
              where: { id: extra.id },
              create: {
                id: extra.id,
                extraId: extra.extraId,
                amount: extra.amount,
                valuesId: upsertedValues.id,
              },
              update: {
                extraId: extra.extraId,
                amount: extra.amount,
                valuesId: upsertedValues.id,
              },
            })
          );

          await Promise.all(extrasPromises);
        }
      }
    });

    const updatedRental = await rentalRepo.getRentalById(rental.id, tenantId!);
    const rentals = await rentalRepo.getRentals(tenantId);

    return res.status(200).json({ rentals, updatedRental });
  } catch (error) {
    console.error("Error handling rental:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: error instanceof Error ? error.message : undefined,
    });
  }
};

const confirmRental = async (req: Request, res: Response) => {
  const { rental } = req.body;
  const userId = req.user?.id;
  const tenantId = req.user?.tenantId;

  if (!tenantId) {
    return res.status(400).json({ error: "Tenant ID is required" });
  }

  try {
    await prisma.$transaction(
      async (tx) => {
        await tx.rental.update({
          where: { id: rental.id },
          data: {
            status: "CONFIRMED",
            updatedAt: new Date(),
            updatedBy: userId,
          },
        });

        await tx.rentalActivity.create({
          data: {
            rentalId: rental.id,
            action: "BOOKED",
            createdAt: new Date(),
            createdBy: userId,
            customerId: rental.customerId,
            vehicleId: rental.vehicleId,
            tenantId,
          },
        });
      },
      {
        maxWait: 20000,
        timeout: 15000,
      }
    );

    const rentals = await rentalRepo.getRentals(tenantId);
    const updatedRental = await rentalRepo.getRentalById(rental.id, tenantId!);
    return res.status(201).json({ updatedRental, rentals });
  } catch (error) {
    return logUtil.handleError(res, error, "confirming rental");
  }
};
const declineRental = async (req: Request, res: Response) => {
  const { rental } = req.body;
  const userId = req.user?.id;
  const tenantId = req.user?.tenantId;

  try {
    await prisma.$transaction(async (tx) => {
      await tx.rental.update({
        where: { id: rental.id },
        data: {
          status: "DECLINED",
          updatedAt: new Date(),
          updatedBy: userId,
        },
      });
    });

    const updatedRental = await rentalRepo.getRentalById(rental.id, tenantId!);
    return res.status(200).json(updatedRental);
  } catch (error) {
    return logUtil.handleError(res, error, "declining rental");
  }
};
const cancelRental = async (req: Request, res: Response) => {
  const { rental } = req.body;
  const userId = req.user?.id;
  const tenantId = req.user?.tenantId;
  try {
    await prisma.$transaction(async (tx) => {
      await tx.rental.update({
        where: { id: rental.id },
        data: {
          status: "CANCELED",
          updatedAt: new Date(),
          updatedBy: userId,
        },
      });

      await tx.rentalActivity.create({
        data: {
          rentalId: rental.id,
          action: "CANCELED",
          createdAt: new Date(),
          createdBy: userId,
          customerId: rental.customerId,
          vehicleId: rental.vehicleId,
          tenantId: tenantId!,
        },
      });
    });

    const updatedRental = await rentalRepo.getRentalById(rental.id, tenantId!);
    return res.status(200).json(updatedRental);
  } catch (error) {
    return logUtil.handleError(res, error, "cancelling rental");
  }
};
const startRental = async (req: Request, res: Response) => {
  const { rental } = req.body;
  const userId = req.user?.id;
  const tenantId = req.user?.tenantId;
  try {
    await prisma.$transaction(async (tx) => {
      await tx.rental.update({
        where: { id: rental.id },
        data: {
          status: "ACTIVE",
          updatedAt: new Date(),
          updatedBy: userId,
        },
      });

      const rentedStatus = await tx.vehicleStatus.findFirst({
        where: { status: "Rented" },
        select: { id: true },
      });

      if (!rentedStatus) {
        throw new Error('Vehicle status "RENTED" not found');
      }

      await tx.vehicle.update({
        where: { id: rental.vehicleId },
        data: {
          vehicleStatusId: rentedStatus.id,
          updatedAt: new Date(),
          updatedBy: userId,
        },
      });

      await tx.rentalActivity.create({
        data: {
          rentalId: rental.id,
          action: "PICKED_UP",
          createdAt: new Date(),
          createdBy: userId,
          customerId: rental.customerId,
          vehicleId: rental.vehicleId,
          tenantId: tenantId!,
        },
      });
    });

    const updatedRental = await rentalRepo.getRentalById(rental.id, tenantId!);

    return res.status(200).json(updatedRental);
  } catch (error) {
    return logUtil.handleError(res, error, "starting rental");
  }
};
const endRental = async (req: Request, res: Response, next: NextFunction) => {
  const { rental } = req.body;
  const userId = req.user?.id;
  const tenantId = req.user?.tenantId;
  try {
    await prisma.$transaction(async (tx) => {
      await tx.rental.update({
        where: { id: rental.id },
        data: {
          status: "COMPLETED",
          updatedAt: new Date(),
          updatedBy: userId,
        },
      });

      const rentedStatus = await tx.vehicleStatus.findFirst({
        where: { status: "Pending Inspection" },
        select: { id: true },
      });

      if (!rentedStatus) {
        throw new Error('Vehicle status "Pending Inspection" not found');
      }

      await tx.vehicle.update({
        where: { id: rental.vehicleId },
        data: {
          vehicleStatusId: rentedStatus.id,
          updatedAt: new Date(),
          updatedBy: userId,
        },
      });

      await tx.rentalActivity.create({
        data: {
          rentalId: rental.id,
          action: "RETURNED",
          createdAt: new Date(),
          createdBy: userId,
          customerId: rental.customerId,
          vehicleId: rental.vehicleId,
          tenantId: tenantId!,
        },
      });
    });

    const updatedRental = await rentalRepo.getRentalById(rental.id, tenantId!);

    return res.status(200).json(updatedRental);
  } catch (error) {
    next(error);
  }
};

const generateInvoice = async (req: Request, res: Response) => {
  const { invoiceData } = req.body;
  const { rentalId } = req.params;
  const userId = req.user?.id;
  const tenantId = req.user?.tenantId;

  try {
    let invoiceNumber;

    const invoice = await prisma.invoice.findUnique({
      where: { rentalId },
    });

    if (invoice) {
      invoiceNumber = invoice.invoiceNumber;
    } else {
      invoiceNumber = await numberGenerator.generateInvoiceNumber(tenantId!);
    }

    const rental = await rentalRepo.getRentalById(rentalId, tenantId!);
    const tenant = await tenantRepo.getTenantById(tenantId!);

    const { publicUrl } = await generator.createInvoice(
      {
        ...invoiceData,
        invoiceNumber,
      },
      invoiceNumber,
      tenant?.tenantCode!
    );

    await prisma.invoice.upsert({
      where: { rentalId },
      create: {
        invoiceNumber,
        amount: rental?.values?.netTotal || 0,
        customerId: rental?.customerId || "",
        rentalId: rental?.id || "",
        tenantId: tenantId!,
        createdAt: new Date(),
        createdBy: userId,
        invoiceUrl: publicUrl,
      },
      update: {
        amount: rental?.values?.netTotal || 0,
        customerId: rental?.customerId || "",
        tenantId: tenantId!,
        invoiceUrl: publicUrl,
        updatedAt: new Date(),
        updatedBy: userId,
      },
    });

    return res.status(201).json(publicUrl);
  } catch (error) {
    console.error("Error generating invoice number:", error);
    throw new Error("Error generating invoice number");
  }
};
const generateRentalAgreement = async (req: Request, res: Response) => {
  const { agreementData } = req.body;
  const { rentalId } = req.params;
  const userId = req.user?.id;
  const tenantId = req.user?.tenantId;

  try {
    let agreementNumber;

    const agreement = await prisma.rentalAgreement.findUnique({
      where: { rentalId },
    });

    if (agreement) {
      agreementNumber = agreement.number;
    } else {
      agreementNumber = await numberGenerator.generateRentalAgreementNumber(
        tenantId!
      );
    }

    const rental = await rentalRepo.getRentalById(rentalId, tenantId!);
    const tenant = await tenantRepo.getTenantById(tenantId!);

    const { publicUrl } = await generator.createAgreement(
      {
        ...agreementData,
        agreementNumber,
      },
      agreementNumber,
      tenant?.tenantCode!
    );

    await prisma.rentalAgreement.upsert({
      where: { rentalId },
      create: {
        number: agreementNumber,
        customerId: rental?.customerId || "",
        rentalId: rental?.id || "",
        tenantId: tenantId!,
        createdAt: new Date(),
        createdBy: userId,
        agreementUrl: publicUrl,
      },
      update: {
        customerId: rental?.customerId || "",
        tenantId: tenantId!,
        agreementUrl: publicUrl,
        updatedAt: new Date(),
        updatedBy: userId,
      },
    });

    return res.status(201).json(publicUrl);
  } catch (error) {
    console.error("Error generating rental agreement number:", error);
    throw new Error("Error generating rental agreement number");
  }
};

export default {
  getRentals,
  getRentalById,
  handleRental,
  confirmRental,
  declineRental,
  cancelRental,
  startRental,
  endRental,
  generateInvoice,
  generateRentalAgreement,
};
