import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { bookingService } from "../service/booking.service";
import { tenantService } from "../service/tenant.service";
import generator from "../services/pdfGenerator";
import errorUtil from "../utils/error.util";
import { InvoiceData } from "../types/pdf";

const prisma = new PrismaClient();

const getBookings = async (req: Request, res: Response) => {
  const tenantId = req.user?.tenantId;

  try {
    if (!tenantId) {
      return res.status(400).json({ error: "Tenant ID is required" });
    }
    const bookings = await bookingService.getBookings(tenantId);
    return res.status(200).json(bookings);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: error instanceof Error ? error.message : undefined,
    });
  }
};
const getBookingById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const tenantId = req.user?.tenantId;
  const userId = req.user?.id;
  try {
    if (!tenantId) {
      return res.status(400).json({ error: "Tenant ID is required" });
    }
    const booking = await bookingService.getBookingById(id, tenantId);
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }
    return res.status(200).json(booking);
  } catch (error) {
    console.error("Error fetching booking:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: error instanceof Error ? error.message : undefined,
    });
  }
};
const handleBooking = async (req: Request, res: Response) => {
  const { booking } = req.body;
  const userId = req.user?.id;
  const tenantId = req.user?.tenantId;

  if (!tenantId) {
    return res.status(400).json({ error: "Tenant ID is required" });
  }

  if (!booking) {
    return res.status(400).json({ error: "Booking data is required" });
  }

  try {
    await prisma.$transaction(async (tx) => {
      const bookingData = {
        startDate: booking.startDate,
        endDate: booking.endDate,
        pickupLocationId: booking.pickupLocationId,
        returnLocationId: booking.returnLocationId,
        vehicleId: booking.vehicleId,
        customerId: booking.customerId,
        agent: booking.agent,
        signature: booking.signature,
        createdAt: new Date(),
        createdBy: userId,
        updatedAt: new Date(),
        updatedBy: userId,
        vehicleGroupId: booking.vehicleGroupId,
        tenantId,
        status: booking.status,
        notes: booking.notes,
      };

      await tx.booking.upsert({
        where: { id: booking.id },
        create: { id: booking.id, ...bookingData },
        update: bookingData,
      });

      let upsertedValues: any = null;
      if (booking.values) {
        const valuesData = {
          numberOfDays: parseFloat(booking.values.numberOfDays),
          basePrice: parseFloat(booking.values.basePrice),
          totalCost: parseFloat(booking.values.totalCost),
          discount: parseFloat(booking.values.discount),
          deliveryFee: parseFloat(booking.values.deliveryFee),
          collectionFee: parseFloat(booking.values.collectionFee),
          deposit: parseFloat(booking.values.deposit),
          totalExtras: parseFloat(booking.values.totalExtras),
          subTotal: parseFloat(booking.values.subTotal),
          netTotal: parseFloat(booking.values.netTotal),
          discountMin: parseFloat(booking.values.discountMin),
          discountMax: parseFloat(booking.values.discountMax),
          discountAmount: parseFloat(booking.values.discountAmount),
          discountPolicy: booking.values.discountPolicy,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        upsertedValues = await tx.values.upsert({
          where: { id: booking.values.id },
          create: {
            id: booking.values.id,
            bookingId: booking.id,
            ...valuesData,
          },
          update: valuesData,
        });

        if (booking.values.extras?.length) {
          await tx.bookingExtras.deleteMany({
            where: {
              valuesId: upsertedValues.id,
              id: {
                notIn: booking.values.extras
                  .map((e: any) => e.id)
                  .filter(Boolean),
              },
            },
          });

          const extrasPromises = booking.values.extras.map((extra: any) =>
            tx.bookingExtras.upsert({
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

    const bookings = await bookingService.getBookings(tenantId);

    return res.status(200).json(bookings);
  } catch (error) {
    console.error("Error handling booking:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: error instanceof Error ? error.message : undefined,
    });
  }
};

const confirmBooking = async (req: Request, res: Response) => {
  const { booking } = req.body;
  const userId = req.user?.id;
  const tenantId = req.user?.tenantId;

  if (!tenantId) {
    return res.status(400).json({ error: "Tenant ID is required" });
  }

  try {
    await prisma.$transaction(
      async (tx) => {
        await tx.booking.update({
          where: { id: booking.id },
          data: {
            status: "CONFIRMED",
            updatedAt: new Date(),
            updatedBy: userId,
          },
        });

        await tx.rentalActivity.create({
          data: {
            bookingId: booking.id,
            action: "BOOKED",
            createdAt: new Date(),
            createdBy: userId,
            customerId: booking.customerId,
            vehicleId: booking.vehicleId,
            tenantId,
          },
        });
      },
      {
        maxWait: 20000,
        timeout: 15000,
      }
    );

    const updatedBooking = await bookingService.getBookingById(
      booking.id,
      tenantId!
    );
    return res.status(201).json(updatedBooking);
  } catch (error) {
    return errorUtil.handleError(res, error, "confirming booking");
  }
};
const declineBooking = async (req: Request, res: Response) => {
  const { booking } = req.body;
  const userId = req.user?.id;
  const tenantId = req.user?.tenantId;

  try {
    await prisma.$transaction(async (tx) => {
      await tx.booking.update({
        where: { id: booking.id },
        data: {
          status: "DECLINED",
          updatedAt: new Date(),
          updatedBy: userId,
        },
      });
    });

    const updatedBooking = await bookingService.getBookingById(
      booking.id,
      tenantId!
    );
    return res.status(200).json(updatedBooking);
  } catch (error) {
    return errorUtil.handleError(res, error, "declining booking");
  }
};
const cancelBooking = async (req: Request, res: Response) => {
  const { booking } = req.body;
  const userId = req.user?.id;
  const tenantId = req.user?.tenantId;
  try {
    await prisma.$transaction(async (tx) => {
      await tx.booking.update({
        where: { id: booking.id },
        data: {
          status: "CANCELED",
          updatedAt: new Date(),
          updatedBy: userId,
        },
      });
    });

    const updatedBooking = await bookingService.getBookingById(
      booking.id,
      tenantId!
    );
    return res.status(200).json(updatedBooking);
  } catch (error) {
    return errorUtil.handleError(res, error, "cancelling booking");
  }
};
const startBooking = async (req: Request, res: Response) => {
  const { booking } = req.body;
  const userId = req.user?.id;
  const tenantId = req.user?.tenantId;
  try {
    await prisma.$transaction(async (tx) => {
      await tx.booking.update({
        where: { id: booking.id },
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
        where: { id: booking.vehicleId },
        data: {
          vehicleStatusId: rentedStatus.id,
          updatedAt: new Date(),
          updatedBy: userId,
        },
      });
    });

    const updatedBooking = await bookingService.getBookingById(
      booking.id,
      tenantId!
    );

    return res.status(200).json(updatedBooking);
  } catch (error) {
    return errorUtil.handleError(res, error, "starting booking");
  }
};

const generateInvoice = async (req: Request, res: Response) => {
  const { invoiceData } = req.body;
  const { bookingId } = req.params;
  const userId = req.user?.id;
  const tenantId = req.user?.tenantId;

  try {
    let invoiceNumber;

    const invoice = await prisma.invoice.findUnique({
      where: { bookingId },
    });

    if (invoice) {
      invoiceNumber = invoice.invoiceNumber;
    } else {
      invoiceNumber = await generateInvoiceNumber(tenantId!);
    }

    const booking = await bookingService.getBookingById(bookingId, tenantId!);
    const tenant = await tenantService.getTenantById(tenantId!);

    const { s3Key } = await generator.createInvoice(
      {
        ...invoiceData,
        invoiceNumber,
      },
      invoiceNumber,
      tenant?.tenantCode!
    );

    await prisma.invoice.upsert({
      where: { bookingId },
      create: {
        invoiceNumber,
        amount: booking?.values?.netTotal || 0,
        customerId: booking?.customerId || "",
        bookingId: booking?.id || "",
        tenantId: tenantId!,
        createdAt: new Date(),
        createdBy: userId,
        invoiceUrl: s3Key,
      },
      update: {
        amount: booking?.values?.netTotal || 0,
        customerId: booking?.customerId || "",
        tenantId: tenantId!,
        invoiceUrl: s3Key,
        updatedAt: new Date(),
        updatedBy: userId,
      },
    });

    return res.status(201).json(s3Key);
  } catch (error) {
    console.error("Error generating invoice number:", error);
    throw new Error("Error generating invoice number");
  }
};
const generateBookingAgreement = async (req: Request, res: Response) => {
  const { agreementData } = req.body;
  const { bookingId } = req.params;
  const userId = req.user?.id;
  const tenantId = req.user?.tenantId;

  try {
    let agreementNumber;

    const agreement = await prisma.bookingAgreement.findUnique({
      where: { bookingId },
    });

    if (agreement) {
      agreementNumber = agreement.agreementNumber;
    } else {
      agreementNumber = await generateBookingAgreementNumber(tenantId!);
    }

    const booking = await bookingService.getBookingById(bookingId, tenantId!);
    const tenant = await tenantService.getTenantById(tenantId!);

    const { s3Key } = await generator.createAgreement(
      {
        ...agreementData,
        agreementNumber,
      },
      agreementNumber,
      tenant?.tenantCode!
    );

    await prisma.bookingAgreement.upsert({
      where: { bookingId },
      create: {
        agreementNumber,
        customerId: booking?.customerId || "",
        bookingId: booking?.id || "",
        tenantId: tenantId!,
        createdAt: new Date(),
        createdBy: userId,
        agreementUrl: s3Key,
      },
      update: {
        customerId: booking?.customerId || "",
        tenantId: tenantId!,
        agreementUrl: s3Key,
        updatedAt: new Date(),
        updatedBy: userId,
      },
    });

    return res.status(201).json(s3Key);
  } catch (error) {
    console.error("Error generating booking agreement number:", error);
    throw new Error("Error generating booking agreement number");
  }
};
const generateInvoiceNumber = async (tenantId: string): Promise<string> => {
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    include: { invoiceSequence: true },
  });

  if (!tenant?.invoiceSequence) {
    throw new Error("Tenant has no invoice sequence configured");
  }

  const lastInvoice = await prisma.invoice.findFirst({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
    select: { invoiceNumber: true },
  });

  const lastNumber = lastInvoice?.invoiceNumber
    ? parseInt(lastInvoice.invoiceNumber.match(/\d+$/)?.[0] || "0", 10)
    : 0;
  const nextNumber = lastNumber + 1;

  const now = new Date();
  const year = now.getFullYear().toString();
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const day = now.getDate().toString().padStart(2, "0");

  let prefix = tenant.invoiceSequence.prefix;
  prefix = prefix
    .replace(/{year}/g, year)
    .replace(/{month}/g, month)
    .replace(/{day}/g, day)
    .replace(/{tenantId}/g, tenantId.substring(0, 4));

  const sequenceNumber = nextNumber.toString().padStart(3, "0");

  return `${prefix}${sequenceNumber}`;
};
const generateBookingAgreementNumber = async (
  tenantId: string
): Promise<string> => {
  const lastAgreement = await prisma.bookingAgreement.findFirst({
    where: { tenantId },
    orderBy: { agreementNumber: "desc" },
    select: { agreementNumber: true },
  });

  const currentYear = new Date().getFullYear().toString();
  let sequenceNumber = 1;

  if (lastAgreement?.agreementNumber) {
    const match = lastAgreement.agreementNumber.match(/BA-\d{4}-(\d{4})/);
    if (match && match[1]) {
      sequenceNumber = parseInt(match[1], 10) + 1;
    }
  }

  const formattedSequence = sequenceNumber.toString().padStart(4, "0");

  return `BA-${currentYear}-${formattedSequence}`;
};

export default {
  getBookings,
  getBookingById,
  handleBooking,
  confirmBooking,
  declineBooking,
  cancelBooking,
  startBooking,
  generateInvoice,
  generateBookingAgreement,
};
