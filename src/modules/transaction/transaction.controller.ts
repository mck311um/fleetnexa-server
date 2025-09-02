import { NextFunction, Request, Response } from "express";
import { transactionRepo } from "./transaction.repository";
import { logger } from "../../config/logger";

const getTransactions = async (req: Request, res: Response) => {
  const tenantId = req.params.tenantId;
  const tenantCode = req.params.tenantCode;
  try {
    const transactions = await transactionRepo.getTransactions(tenantId);
    res.status(200).json(transactions);
  } catch (error) {
    logger.e(error, "Failed to get transactions", { tenantId, tenantCode });
  }
};

export default {
  getTransactions,
};
