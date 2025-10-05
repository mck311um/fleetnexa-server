import { Request, Response } from 'express';
import { paymentService } from './payment.service';
import { logger } from '../../../../config/logger';
import { transactionService } from '../../transaction.service';

const getPayments = async (req: Request, res: Response) => {
  const { tenant, user } = req.context!;

  try {
    const payments = await paymentService.getTenantPayments(tenant);

    res.status(200).json({ payments });
  } catch (error) {
    logger.e(error, 'Failed to fetch payments', {
      tenantId: tenant.id,
      tenantCode: tenant.tenantCode,
    });
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
};

const createPayment = async (req: Request, res: Response) => {
  const { tenant, user } = req.context!;
  const data = req.body;

  const paymentDto = await paymentService.validatePaymentData(data);

  try {
    await paymentService.createPayment(paymentDto, tenant, user);

    const payments = await paymentService.getTenantPayments(tenant);
    const transactions = await transactionService.getTenantTransactions(tenant);

    res.status(201).json({ payments, transactions });
  } catch (error) {
    logger.e(error, 'Failed to create payment', {
      tenantId: tenant.id,
      tenantCode: tenant.tenantCode,
    });
    res.status(500).json({ error: 'Failed to create payment' });
  }
};

const updatePayment = async (req: Request, res: Response) => {
  const { tenant, user } = req.context!;
  const data = req.body;

  const paymentDto = await paymentService.validatePaymentData(data);

  try {
    await paymentService.updatePayment(paymentDto, tenant, user);

    const payments = await paymentService.getTenantPayments(tenant);
    const transactions = await transactionService.getTenantTransactions(tenant);

    res.status(200).json({ payments, transactions });
  } catch (error) {
    logger.e(error, 'Failed to update payment', {
      tenantId: tenant.id,
      tenantCode: tenant.tenantCode,
    });
    res.status(500).json({ error: 'Failed to update payment' });
  }
};

const deletePayment = async (req: Request, res: Response) => {
  const { tenant, user } = req.context!;
  const { id } = req.params;

  if (!id) {
    logger.w('Payment ID is missing', {
      tenantId: tenant.id,
      tenantCode: tenant.tenantCode,
    });
    return res.status(400).json({ error: 'Payment ID is required' });
  }

  try {
    await paymentService.deletePayment(id, tenant, user);

    const payments = await paymentService.getTenantPayments(tenant);
    const transactions = await transactionService.getTenantTransactions(tenant);

    res.status(200).json({ payments, transactions });
  } catch (error) {
    logger.e(error, 'Failed to delete payment', {
      tenantId: tenant.id,
      tenantCode: tenant.tenantCode,
      paymentId: id,
    });
    res.status(500).json({ error: 'Failed to delete payment' });
  }
};

export default {
  getPayments,
  createPayment,
  updatePayment,
  deletePayment,
};
