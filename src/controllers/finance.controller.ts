import { rentalRepo } from '../repository/rental.repository';
import { NextFunction, Request, Response } from 'express';
import prisma from '../config/prisma.config';

const getTransactions = async (
  req: Request,
  res: Response,
  next: NextFunction,
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
        // user: {
        //   select: {
        //     firstName: true,
        //     lastName: true,
        //     username: true,
        //   },
        // },
      },
    });

    return res.status(201).json(transactions);
  } catch (error) {
    next(error);
  }
};
const removeTransaction = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { id } = req.params;
  const tenantId = req.user?.tenantId;

  try {
    const updated = await prisma.$transaction(async (tx) => {
      let rentalId = null;
      const transaction = await tx.transactions.findUnique({
        where: {
          id,
          tenantId,
        },
      });

      if (!transaction) {
        return res.status(404).json({ error: 'Transaction not found' });
      }

      if (transaction.rentalId) {
        rentalId = transaction.rentalId;
      }

      if (transaction.paymentId) {
        await tx.payment.delete({
          where: {
            id: transaction.paymentId,
          },
        });
      } else if (transaction.refundId) {
        await tx.refund.delete({
          where: {
            id: transaction.refundId,
          },
        });
      }

      await tx.transactions.delete({
        where: {
          id,
          tenantId,
        },
      });

      const updatedRental = rentalId
        ? await rentalRepo.getRentalById(rentalId, tenantId!)
        : null;

      return updatedRental;
    });

    return res.status(201).json(updated);
  } catch (error) {
    next(error);
  }
};

const addRentalPayment = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { payment } = req.body;
  const userId = req.user?.id;
  const tenantId = req.user?.tenantId;

  if (!tenantId) {
    return res.status(400).json({ error: 'Tenant ID is required' });
  }

  if (!payment) {
    return res.status(400).json({ error: 'Payment data is required' });
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
          type: 'PAYMENT',
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
      tenantId,
    );

    return res.status(201).json(updatedRental);
  } catch (error) {
    next(error);
  }
};
const updateRentalPayment = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { payment } = req.body;
  const userId = req.user?.id;
  const tenantId = req.user?.tenantId;

  try {
    await prisma.$transaction(async (tx) => {
      const rentalPaymentData = {
        amount: payment.amount,
        paymentDate: payment.paymentDate,
        notes: payment.notes,
        paymentTypeId: payment.paymentTypeId,
        paymentMethodId: payment.paymentMethodId,
        updatedAt: new Date(),
        updatedBy: userId,
      };

      await tx.payment.update({
        where: {
          id: payment.id,
          tenantId: tenantId,
        },
        data: rentalPaymentData,
      });

      await tx.transactions.update({
        where: {
          paymentId: payment.id,
          tenantId: tenantId,
        },
        data: {
          amount: payment.amount,
          type: 'PAYMENT',
          transactionDate: payment.paymentDate,
        },
      });
    });

    const updatedRental = await rentalRepo.getRentalById(
      payment.rentalId,
      tenantId!,
    );

    return res.status(201).json(updatedRental);
  } catch (error) {
    next(error);
  }
};

const addRefundPayment = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { refund } = req.body;
  const userId = req.user?.id;
  const tenantId = req.user?.tenantId;

  if (!tenantId) {
    return res.status(400).json({ error: 'Tenant ID is required' });
  }

  if (!refund) {
    return res.status(400).json({ error: 'Payment data is required' });
  }

  try {
    await prisma.$transaction(async (tx) => {
      const rentalRefundData = {
        id: refund.id,
        amount: refund.amount,
        refundDate: refund.refundDate,
        reason: refund.reason,
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
          type: 'REFUND',
          transactionDate: refund.paymentDate,
          customerId: refund.customerId,
          createdBy: userId,
          createdAt: new Date(),
          tenantId: tenantId,
          rentalId: refund.rentalId,
          refundId: refund.id,
        },
      });
    });

    const updatedRental = await rentalRepo.getRentalById(
      refund.rentalId,
      tenantId!,
    );

    return res.status(201).json(updatedRental);
  } catch (error) {
    next(error);
  }
};
const updateRefundPayment = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { refund } = req.body;
  const userId = req.user?.id;
  const tenantId = req.user?.tenantId;

  try {
    await prisma.$transaction(async (tx) => {
      const rentalRefundData = {
        amount: refund.amount,
        refundDate: refund.refundDate,
        reason: refund.reason,
        updatedAt: new Date(),
        customerId: refund.customerId,
        createdBy: userId,
      };

      await tx.refund.update({
        where: {
          id: refund.id,
          tenantId: tenantId,
        },
        data: rentalRefundData,
      });

      await tx.transactions.update({
        where: {
          refundId: refund.id,
          tenantId: tenantId,
        },
        data: {
          amount: -refund.amount,
          type: 'REFUND',
          transactionDate: refund.paymentDate,
        },
      });
    });

    const updatedRental = await rentalRepo.getRentalById(
      refund.rentalId,
      tenantId!,
    );

    return res.status(201).json(updatedRental);
  } catch (error) {
    next(error);
  }
};

export default {
  addRentalPayment,
  updateRentalPayment,
  getTransactions,
  addRefundPayment,
  removeTransaction,
  updateRefundPayment,
};
