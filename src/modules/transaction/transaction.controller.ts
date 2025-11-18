import { Request, Response } from 'express';
import { transactionRepo } from './transaction.repository';
import { logger } from '../../config/logger';

const getTransactions = async (req: Request, res: Response) => {
  const { tenant } = req.context!;
  try {
    const transactions = await transactionRepo.getTransactions(tenant.id);
    res.status(200).json(transactions);
  } catch (error: any) {
    logger.e(error, 'Failed to get transactions', {
      tenantId: tenant.id,
      tenantCode: tenant.tenantCode,
    });
    res
      .status(500)
      .json({ error: error.message || 'Failed to fetch transactions' });
  }
};

export default {
  getTransactions,
};
