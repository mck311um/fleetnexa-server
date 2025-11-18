"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const transaction_repository_1 = require("./transaction.repository");
const logger_1 = require("../../config/logger");
const getTransactions = async (req, res) => {
    const { tenant } = req.context;
    try {
        const transactions = await transaction_repository_1.transactionRepo.getTransactions(tenant.id);
        res.status(200).json(transactions);
    }
    catch (error) {
        logger_1.logger.e(error, 'Failed to get transactions', {
            tenantId: tenant.id,
            tenantCode: tenant.tenantCode,
        });
        res
            .status(500)
            .json({ error: error.message || 'Failed to fetch transactions' });
    }
};
exports.default = {
    getTransactions,
};
