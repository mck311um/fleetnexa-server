"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transactionService = void 0;
const logger_1 = require("../../config/logger");
const prisma_config_1 = __importDefault(require("../../config/prisma.config"));
const transaction_repository_1 = require("./transaction.repository");
class TransactionService {
    async getTenantTransactions(tenant) {
        try {
            const transactions = await transaction_repository_1.transactionRepo.getTransactions(tenant.id);
            return transactions;
        }
        catch (error) {
            logger_1.logger.e(error, 'Failed to fetch tenant transactions', {
                tenantId: tenant.id,
                tenantCode: tenant.tenantCode,
            });
            throw error;
        }
    }
    async createTransaction(data, tenant, user) {
        try {
            await prisma_config_1.default.$transaction(async (tx) => {
                await tx.transactions.create({
                    data: {
                        id: data.id,
                        amount: data.amount,
                        type: data.type,
                        transactionDate: data.transactionDate,
                        createdBy: user.username,
                        paymentId: data.paymentId,
                        refundId: data.refundId,
                        expenseId: data.expenseId,
                        tenantId: tenant.id,
                        rentalId: data.rentalId,
                    },
                });
            });
        }
        catch (error) {
            logger_1.logger.e(error, 'Failed to create transaction', {
                tenantId: tenant.id,
                tenantCode: tenant.tenantCode,
                type: data.type,
                amount: data.amount,
            });
            throw error;
        }
    }
    async updateTransaction(data, tenant, user) {
        try {
            await prisma_config_1.default.$transaction(async (tx) => {
                const existingTransaction = await tx.transactions.findUnique({
                    where: { id: data.id },
                });
                if (!existingTransaction) {
                    throw new Error('Transaction not found');
                }
                await tx.transactions.update({
                    where: { id: data.id },
                    data: {
                        amount: data.amount,
                        transactionDate: data.transactionDate,
                        updatedAt: new Date(),
                        updatedBy: user.username,
                        rentalId: data.rentalId,
                    },
                });
            });
        }
        catch (error) {
            logger_1.logger.e(error, 'Failed to update transaction', {
                tenantId: tenant.id,
                tenantCode: tenant.tenantCode,
                transactionId: data.id,
                amount: data.amount,
            });
            throw error;
        }
    }
    async deleteTransaction(transactionId, tenant, user) {
        try {
            await prisma_config_1.default.$transaction(async (tx) => {
                const existingTransaction = await tx.transactions.findUnique({
                    where: { id: transactionId },
                });
                if (!existingTransaction) {
                    throw new Error('Transaction not found');
                }
                await tx.transactions.update({
                    where: { id: transactionId },
                    data: {
                        isDeleted: true,
                        updatedAt: new Date(),
                        updatedBy: user.username,
                    },
                });
            });
        }
        catch (error) {
            logger_1.logger.e(error, 'Failed to delete transaction', {
                tenantId: tenant.id,
                tenantCode: tenant.tenantCode,
                transactionId,
            });
            throw error;
        }
    }
}
exports.transactionService = new TransactionService();
const deleteBookingTransaction = async (bookingId, tx) => {
    // try {
    //   const booking = await tx.rental.findUnique({
    //     where: { id: bookingId },
    //   });
    //   if (!booking) {
    //     logger.e('Booking not found', 'Failed to delete booking');
    //     return;
    //   }
    //   await tx.transactions.updateMany({
    //     where: { rentalId: bookingId },
    //     data: { isDeleted: true, deletedAt: new Date() },
    //   });
    //   await tx.payment.updateMany({
    //     where: { rentalId: bookingId },
    //     data: { isDeleted: true, deletedAt: new Date() },
    //   });
    //   await tx.refund.updateMany({
    //     where: { rentalId: bookingId },
    //     data: { isDeleted: true, deletedAt: new Date() },
    //   });
    // } catch (error) {
    //   logger.e(error, 'Failed to delete booking', {
    //     bookingId,
    //   });
    //   throw error;
    // }
};
exports.default = {
    deleteBookingTransaction,
};
