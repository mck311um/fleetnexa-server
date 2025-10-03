"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transactionService = void 0;
const client_1 = require("@prisma/client");
const logger_1 = require("../../config/logger");
const prisma_config_1 = __importDefault(require("../../config/prisma.config"));
class TransactionService {
    async createPayment(data, tenant, user) {
        try {
            await prisma_config_1.default.$transaction(async (tx) => {
                const existingBooking = await tx.rental.findUnique({
                    where: { id: data.bookingId },
                });
                if (!existingBooking) {
                    throw new Error('Booking not found');
                }
                await tx.payment.create({
                    data: {
                        id: data.id,
                        amount: data.amount,
                        tenantId: tenant.id,
                        rentalId: data.bookingId,
                        paymentDate: data.paymentDate,
                        notes: data.notes,
                        paymentTypeId: data.paymentTypeId,
                        paymentMethodId: data.paymentMethodId,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        customerId: data.customerId,
                    },
                });
                await tx.transactions.create({
                    data: {
                        amount: data.amount,
                        type: client_1.TransactionType.PAYMENT,
                        transactionDate: data.paymentDate,
                        customerId: data.customerId,
                        createdBy: user.id,
                        paymentId: data.id,
                        tenantId: tenant.id,
                        rentalId: data.bookingId,
                    },
                });
            });
        }
        catch (error) {
            logger_1.logger.e(error, 'Failed to create payment transaction', {
                tenantId: tenant.id,
                tenantCode: tenant.tenantCode,
                bookingId: data.bookingId,
                amount: data.amount,
            });
            throw error;
        }
    }
    async updatePayment(data, tenant, user) {
        try {
            await prisma_config_1.default.$transaction(async (tx) => {
                const existingPayment = await tx.payment.findUnique({
                    where: { id: data.id },
                });
                if (!existingPayment) {
                    throw new Error('Payment not found');
                }
                await tx.payment.update({
                    where: { id: data.id },
                    data: {
                        amount: data.amount,
                        paymentDate: data.paymentDate,
                        notes: data.notes,
                        paymentTypeId: data.paymentTypeId,
                        paymentMethodId: data.paymentMethodId,
                        updatedAt: new Date(),
                    },
                });
                await tx.transactions.updateMany({
                    where: { paymentId: data.id },
                    data: { amount: data.amount },
                });
            });
        }
        catch (error) {
            logger_1.logger.e(error, 'Failed to update payment transaction', {
                tenantId: tenant.id,
                tenantCode: tenant.tenantCode,
                bookingId: data.bookingId,
                amount: data.amount,
            });
            throw error;
        }
    }
    async deletePayment(paymentId, tenant, user) {
        try {
            await prisma_config_1.default.$transaction(async (tx) => {
                const existingPayment = await tx.payment.findUnique({
                    where: { id: paymentId },
                });
                if (!existingPayment) {
                    throw new Error('Payment not found');
                }
                await tx.payment.update({
                    where: { id: paymentId },
                    data: { isDeleted: true, deletedAt: new Date() },
                });
                await tx.transactions.updateMany({
                    where: { paymentId },
                    data: { isDeleted: true, deletedAt: new Date() },
                });
            });
        }
        catch (error) {
            logger_1.logger.e(error, 'Failed to delete payment transaction', {
                tenantId: tenant.id,
                tenantCode: tenant.tenantCode,
                paymentId,
            });
            throw error;
        }
    }
}
exports.transactionService = new TransactionService();
const deleteBookingTransaction = async (bookingId, tx) => {
    try {
        const booking = await tx.rental.findUnique({
            where: { id: bookingId },
        });
        if (!booking) {
            logger_1.logger.e('Booking not found', 'Failed to delete booking');
            return;
        }
        await tx.transactions.updateMany({
            where: { rentalId: bookingId },
            data: { isDeleted: true, deletedAt: new Date() },
        });
        await tx.payment.updateMany({
            where: { rentalId: bookingId },
            data: { isDeleted: true, deletedAt: new Date() },
        });
        await tx.refund.updateMany({
            where: { rentalId: bookingId },
            data: { isDeleted: true, deletedAt: new Date() },
        });
    }
    catch (error) {
        logger_1.logger.e(error, 'Failed to delete booking', {
            bookingId,
        });
        throw error;
    }
};
exports.default = {
    deleteBookingTransaction,
};
