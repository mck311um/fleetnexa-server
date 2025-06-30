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
        rental: {
          select: {
            rentalNumber: true,
          },
        },
        payment: {
          include: {
            paymentMethod: true,
            paymentType: true,
            rental: {
              select: {
                id: true,
                rentalNumber: true,
              },
            },
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
        customerId: payment.customerId,
      };

      await tx.payment.create({
        data: rentalPaymentData,
      });

      await tx.transactions.create({
        data: {
          amount: payment.amount,
          type: "PAYMENT",
          transactionDate: payment.paymentDate,
          customerId: payment.customerId,
          createdBy: userId,
          createdAt: new Date(),
          paymentId: payment.id,
          tenantId: tenantId,
          rentalId: payment.rentalId,
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

const addRefundPayment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { refund } = req.body;
  const userId = req.user?.id;
  const tenantId = req.user?.tenantId;

  if (!tenantId) {
    return res.status(400).json({ error: "Tenant ID is required" });
  }

  if (!refund) {
    return res.status(400).json({ error: "Payment data is required" });
  }

  try {
    await prisma.$transaction(async (tx) => {
      const rentalRefundData = {
        id: refund.id,
        amount: refund.amount,
        refundDate: refund.refundDate,
        reason: refund.notes,
        tenantId: tenantId,
        rentalId: refund.rentalId,
        createdAt: new Date(),
        updatedAt: new Date(),
        customerId: refund.customerId,
        createdBy: userId,
      };

      await tx.refund.create({
        data: rentalRefundData,
      });

      await tx.transactions.create({
        data: {
          amount: -refund.amount,
          type: "REFUND",
          transactionDate: refund.paymentDate,
          customerId: refund.customerId,
          createdBy: userId,
          createdAt: new Date(),
          tenantId: tenantId,
          rentalId: refund.rentalId,
        },
      });
    });

    const updatedRental = await rentalRepo.getRentalById(
      refund.rentalId,
      tenantId!
    );

    return res.status(201).json(updatedRental);
  } catch (error) {
    next(error);
  }
};

export default {
  addRentalPayment,
  getTransactions,
  addRefundPayment,
};
