"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.refundService = void 0;
const client_1 = require("@prisma/client");
const logger_1 = require("../../../../config/logger");
const refund_dto_1 = require("./refund.dto");
const prisma_config_1 = __importDefault(require("../../../../config/prisma.config"));
const uuid_1 = require("uuid");
const transaction_service_1 = require("../../transaction.service");
class RefundService {
    async validateRefundData(data) {
        const safeParse = refund_dto_1.RefundSchema.safeParse(data);
        if (!safeParse.success) {
            logger_1.logger.e('Invalid refund data', 'Refund validation failed', {
                errors: safeParse.error.issues,
                input: data,
            });
            throw new Error('Invalid refund data');
        }
        return safeParse.data;
    }
    async getTenantRefunds(tenant) {
        try {
            const refunds = await prisma_config_1.default.refund.findMany({
                where: { tenantId: tenant.id },
                include: {
                    rental: true,
                    customer: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                            phone: true,
                        },
                    },
                },
            });
            return refunds;
        }
        catch (error) {
            logger_1.logger.e(error, 'Error fetching tenant refunds', {
                tenantId: tenant.id,
                tenantCode: tenant.tenantCode,
            });
            throw error;
        }
    }
    async createRefund(data, tenant, user) {
        try {
            const refund = await prisma_config_1.default.$transaction(async (tx) => {
                const existingBooking = await tx.rental.findUnique({
                    where: { id: data.bookingId },
                });
                if (!existingBooking) {
                    throw new Error('Booking not found');
                }
                const existingCustomer = await tx.customer.findUnique({
                    where: { id: data.customerId },
                });
                if (!existingCustomer) {
                    throw new Error('Customer not found');
                }
                const newRefund = await tx.refund.create({
                    data: {
                        id: data.id,
                        amount: data.amount,
                        refundDate: new Date(data.refundDate),
                        reason: data.reason,
                        rentalId: data.bookingId,
                        tenantId: tenant.id,
                        customerId: data.customerId,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        createdBy: user.username,
                        payee: `${existingCustomer.firstName} ${existingCustomer.lastName}`,
                        payment: `Refund for booking #${existingBooking.rentalNumber}`,
                        updatedBy: user.username,
                    },
                });
                return newRefund;
            });
            const transaction = {
                id: (0, uuid_1.v4)(),
                amount: data.amount,
                type: client_1.TransactionType.REFUND,
                rentalId: data.bookingId,
                transactionDate: new Date().toISOString(),
                refundId: refund.id,
                createdBy: user.username,
            };
            await transaction_service_1.transactionService.createTransaction(transaction, tenant, user);
        }
        catch (error) {
            logger_1.logger.e(error, 'Error creating refund', {
                user: user.username,
                tenant: tenant.id,
                tenantCode: tenant.tenantCode,
            });
            throw error;
        }
    }
    async updateRefund(data, tenant, user) {
        try {
            await prisma_config_1.default.$transaction(async (tx) => {
                const existingRefund = await tx.refund.findUnique({
                    where: { id: data.id },
                });
                if (!existingRefund) {
                    throw new Error('Refund not found');
                }
                const existingCustomer = await tx.customer.findUnique({
                    where: { id: data.customerId },
                });
                if (!existingCustomer) {
                    throw new Error('Customer not found');
                }
                const exitingBooking = await tx.rental.findUnique({
                    where: { id: data.bookingId },
                });
                if (!exitingBooking) {
                    throw new Error('Booking not found');
                }
                const updatedRefund = await tx.refund.update({
                    where: { id: data.id },
                    data: {
                        amount: data.amount,
                        refundDate: new Date(data.refundDate),
                        reason: data.reason,
                        rentalId: data.bookingId,
                        customerId: data.customerId,
                        updatedAt: new Date(),
                        payee: `${existingCustomer.firstName} ${existingCustomer.lastName}`,
                        payment: `Refund for booking #${exitingBooking.rentalNumber}`,
                        updatedBy: user.username,
                    },
                });
                return updatedRefund;
            });
            const existingTransaction = await prisma_config_1.default.transactions.findFirst({
                where: { refundId: data.id },
            });
            if (!existingTransaction) {
                throw new Error('Associated transaction not found');
            }
            const transaction = {
                id: existingTransaction.id,
                amount: data.amount,
                transactionDate: existingTransaction.transactionDate.toISOString(),
                type: client_1.TransactionType.RENTAL,
                rentalId: data.bookingId,
                createdBy: user.username,
            };
            await transaction_service_1.transactionService.updateTransaction(transaction, tenant, user);
        }
        catch (error) {
            logger_1.logger.e(error, 'Error updating refund', {
                user: user.username,
                tenant: tenant.id,
                tenantCode: tenant.tenantCode,
            });
            throw error;
        }
    }
    async deleteRefund(refundId, tenant, user) {
        try {
            await prisma_config_1.default.$transaction(async (tx) => {
                const existingRefund = await tx.refund.findUnique({
                    where: { id: refundId },
                });
                if (!existingRefund) {
                    throw new Error('Refund not found');
                }
                const existingTransaction = await tx.transactions.findFirst({
                    where: { refundId: refundId },
                });
                if (!existingTransaction) {
                    throw new Error('Associated transaction not found');
                }
                await tx.refund.update({
                    where: { id: refundId },
                    data: {
                        isDeleted: true,
                        updatedAt: new Date(),
                        updatedBy: user.username,
                    },
                });
                await transaction_service_1.transactionService.deleteTransaction(existingTransaction.id, tenant, user);
            });
        }
        catch (error) {
            logger_1.logger.e(error, 'Error deleting refund', {
                refundId: refundId,
                tenant: tenant.id,
                tenantCode: tenant.tenantCode,
            });
            throw error;
        }
    }
}
exports.refundService = new RefundService();
