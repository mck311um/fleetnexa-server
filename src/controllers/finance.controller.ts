import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { bookingRepo } from "../repository/booking.repository";
import logUtil from "../config/logger.config";

const prisma = new PrismaClient();

const addBookingPayment = async (req: Request, res: Response) => {
  const { payment } = req.body;
  const userId = req.user?.id;
  const tenantId = req.user?.tenantId;

  if (!tenantId) {
    return res.status(400).json({ error: "Tenant ID is required" });
  }

  if (!payment) {
    return res.status(400).json({ error: "Payment data is required" });
  }

  try {
    await prisma.$transaction(async (tx) => {
      const bookingPaymentData = {
        id: payment.id,
        amount: payment.amount,
        paymentDate: payment.paymentDate,
        notes: payment.notes,
        tenantId: tenantId,
        bookingId: payment.bookingId,
        paymentTypeId: payment.paymentTypeId,
        paymentMethodId: payment.paymentMethodId,
        createdAt: new Date(),
        updatedAt: new Date(),
        updatedBy: userId,
      };

      const booking = await bookingRepo.getBookingById(
        payment.bookingId,
        tenantId
      );

      const existingPayments = await tx.bookingPayments.findMany({
        where: { bookingId: payment.bookingId },
      });

      await tx.bookingPayments.create({
        data: bookingPaymentData,
      });

      if (existingPayments.length === 0) {
        await tx.booking.update({
          where: { id: payment.bookingId },
          data: {
            status: "RESERVED",
            updatedAt: new Date(),
            updatedBy: userId,
          },
        });
      }

      const updatedBooking = await bookingRepo.getBookingById(
        payment.bookingId,
        tenantId
      );

      return res.status(201).json(updatedBooking);
    });
  } catch (error) {
    return logUtil.handleError(res, error, "adding booking payment");
  }
};

export default {
  addBookingPayment,
};
