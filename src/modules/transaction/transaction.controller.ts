import { Request, Response } from 'express';
import { transactionRepo } from './transaction.repository';
import { logger } from '../../config/logger';
import { CreatePaymentSchema } from './dto/create-payment.dto';
import service from './transaction.service';
import prisma from '../../config/prisma.config';
import { tenantRepo } from '../../repository/tenant.repository';
import { rentalRepo } from '../../repository/rental.repository';

const getTransactions = async (req: Request, res: Response) => {
  const tenantId = req.params.tenantId;
  const tenantCode = req.params.tenantCode;
  try {
    const transactions = await transactionRepo.getTransactions(tenantId);
    res.status(200).json(transactions);
  } catch (error) {
    logger.e(error, 'Failed to get transactions', { tenantId, tenantCode });
  }
};

const createPayment = async (req: Request, res: Response) => {
  const tenantId = req.user?.tenantId;
  const tenantCode = req.user?.tenantCode;
  const userId = req.user?.id;
  const { data } = req.body;

  if (!tenantId) {
    logger.w('Tenant ID is missing', { tenantId });
    return res.status(400).json({ error: 'Tenant ID is required' });
  }

  if (!userId) {
    logger.w('User ID is missing', { tenantId });
    return res.status(400).json({ error: 'User ID is required' });
  }

  if (!data) {
    logger.w('User data is missing', { tenantId });
    return res.status(400).json({ error: 'User data is required' });
  }

  const parseResult = CreatePaymentSchema.safeParse(data);
  if (!parseResult.success) {
    return res.status(400).json({
      error: 'Invalid password data',
      details: parseResult.error.issues,
    });
  }

  const paymentDto = parseResult.data;

  try {
    await prisma.$transaction(async (tx) => {
      const tenant = await tenantRepo.getTenantById(tenantId);

      if (!tenant) {
        logger.w('Tenant not found', { tenantId });
        return res.status(404).json({ error: 'Tenant not found' });
      }

      await service.createPayment(paymentDto, tenant, tx, userId!);
    });

    const updatedBooking = await rentalRepo.getRentalById(
      data.bookingId,
      tenantId,
    );
    const bookings = await rentalRepo.getRentals(tenantId);

    res.status(201).json({
      updatedBooking,
      bookings,
      message: 'Transaction created successfully',
    });
  } catch (error) {
    logger.e(error, 'Failed to create payment', {
      tenantId,
      tenantCode,
      bookingId: data.bookingId,
    });
  }
};

export default {
  getTransactions,
  createPayment,
};
