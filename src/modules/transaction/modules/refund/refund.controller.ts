import { Request, Response } from 'express';
import { logger } from '../../../../config/logger';
import { transactionService } from '../../transaction.service';
import { bookingService } from '../../../booking/booking.service';
import { refundService } from './refund.service';

const getRefunds = async (req: Request, res: Response) => {
  const { tenant, user } = req.context!;
  try {
    const refunds = await refundService.getTenantRefunds(tenant);
    res.json(refunds);
  } catch (error) {
    logger.e(error, 'Error fetching refunds', {
      user: user.username,
      tenant: tenant.id,
      tenantCode: tenant.tenantCode,
    });
    res.status(500).json({ error: 'Internal server error' });
  }
};

const createRefund = async (req: Request, res: Response) => {
  const data = req.body;
  const { tenant, user } = req.context!;

  const refundDto = await refundService.validateRefundData(data);
  try {
    const refund = await refundService.createRefund(refundDto, tenant, user);

    const updatedBooking = await bookingService.getBookingById(
      tenant,
      data.bookingId,
    );
    const bookings = await bookingService.getTenantBookings(tenant);
    const refunds = await refundService.getTenantRefunds(tenant);
    const transactions = await transactionService.getTenantTransactions(tenant);
    res.status(201).json({
      message: 'Refund created successfully',
      refund,
      updatedBooking,
      bookings,
      refunds,
      transactions,
    });
  } catch (error) {
    logger.e(error, 'Error creating refund', {
      user: user.username,
      tenant: tenant.id,
      tenantCode: tenant.tenantCode,
    });
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateRefund = async (req: Request, res: Response) => {
  const data = req.body;
  const { tenant, user } = req.context!;

  const refundDto = await refundService.validateRefundData(data);
  try {
    const refund = await refundService.updateRefund(refundDto, tenant, user);

    const updatedBooking = await bookingService.getBookingById(
      tenant,
      data.bookingId,
    );
    const bookings = await bookingService.getTenantBookings(tenant);
    const refunds = await refundService.getTenantRefunds(tenant);
    const transactions = await transactionService.getTenantTransactions(tenant);
    res.status(200).json({
      message: 'Refund updated successfully',
      refund,
      updatedBooking,
      bookings,
      refunds,
      transactions,
    });
  } catch (error) {
    logger.e(error, 'Error updating refund', {
      user: user.username,
      tenant: tenant.id,
      tenantCode: tenant.tenantCode,
    });
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteRefund = async (req: Request, res: Response) => {
  const { tenant, user } = req.context!;
  const { id } = req.params;

  try {
    await refundService.deleteRefund(id, tenant, user);

    const bookings = await bookingService.getTenantBookings(tenant);
    const refunds = await refundService.getTenantRefunds(tenant);
    const transactions = await transactionService.getTenantTransactions(tenant);
    res.status(200).json({
      message: 'Refund deleted successfully',
      bookings,
      refunds,
      transactions,
    });
  } catch (error) {
    logger.e(error, 'Error deleting refund', {
      user: user.username,
      tenant: tenant.id,
      tenantCode: tenant.tenantCode,
      refundId: id,
    });
    res.status(500).json({ error: 'Internal server error' });
  }
};

export default {
  getRefunds,
  createRefund,
  updateRefund,
  deleteRefund,
};
