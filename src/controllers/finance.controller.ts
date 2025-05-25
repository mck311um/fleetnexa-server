import { rentalRepo } from "../repository/rental.repository";
import { NextFunction, Request, Response } from "express";
import prisma from "../config/prisma.config";
import { UUID } from "crypto";

const getTransactions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const tenantId = req.user?.tenantId;
  try {
    const transactions = await prisma.transactions.findMany({
      where: {
        tenantId: tenantId,
      },
      include: {
        customer: true,
        payment: {
          include: {
            paymentMethod: true,
            paymentType: true,
          },
        },
        user: {
          select: {
            firstName: true,
            lastName: true,
            username: true,
          },
        },
      },
    });

    return res.status(201).json(transactions);
  } catch (error) {
    next(error);
  }
};

const addRentalPayment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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
      const rentalPaymentData = {
        id: payment.id,
        amount: payment.amount,
        paymentDate: payment.paymentDate,
        notes: payment.notes,
        tenantId: tenantId,
        rentalId: payment.rentalId,
        paymentTypeId: payment.paymentTypeId,
        paymentMethodId: payment.paymentMethodId,
        createdAt: new Date(),
        updatedAt: new Date(),
        updatedBy: userId,
      };

      const existingPayments = await tx.payments.findMany({
        where: { rentalId: payment.rentalId },
      });

      await tx.payments.create({
        data: rentalPaymentData,
      });

      if (existingPayments.length === 0) {
        await tx.rental.update({
          where: { id: payment.rentalId },
          data: {
            status: "RESERVED",
            updatedAt: new Date(),
            updatedBy: userId,
          },
        });
      }

      await tx.transactions.create({
        data: {
          amount: payment.amount,
          type: "RENTAL",
          transactionDate: payment.paymentDate,
          customerId: payment.customerId,
          createdBy: userId,
          createdAt: new Date(),
          paymentId: payment.id,
          tenantId: tenantId,
        },
      });
    });

    const updatedRental = await rentalRepo.getRentalById(
      payment.rentalId,
      tenantId
    );

    return res.status(201).json(updatedRental);
  } catch (error) {
    next(error);
  }
};

export default {
  addRentalPayment,
  getTransactions,
};
