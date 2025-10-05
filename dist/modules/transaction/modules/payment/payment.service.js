"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentService = void 0;
const client_1 = require("@prisma/client");
const logger_1 = require("../../../../config/logger");
const payment_dto_1 = require("./payment.dto");
const prisma_config_1 = __importDefault(require("../../../../config/prisma.config"));
const transaction_service_1 = require("../../transaction.service");
const uuid_1 = require("uuid");
class PaymentService {
    async validatePaymentData(data) {
        const safeParse = payment_dto_1.PaymentSchema.safeParse(data);
        if (!safeParse.success) {
            logger_1.logger.e('Invalid payment data', 'Payment validation failed', {
                errors: safeParse.error.issues,
                input: data,
            });
            throw new Error('Invalid payment data');
        }
        return safeParse.data;
    }
    async getTenantPayments(tenant) {
        try {
            const payments = await prisma_config_1.default.payment.findMany({
                where: { tenantId: tenant.id },
                include: {
                    rental: true,
                    paymentMethod: true,
                    paymentType: true,
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
            return payments;
        }
        catch (error) {
            logger_1.logger.e(error, 'Error fetching tenant payments', {
                tenantId: tenant.id,
            });
            throw new Error('Could not fetch tenant payments');
        }
    }
    async createPayment(data, tenant, user) {
        try {
            const payment = await prisma_config_1.default.$transaction(async (tx) => {
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
                const exitingBooking = await tx.rental.findUnique({
                    where: { id: data.bookingId },
                });
                if (!exitingBooking) {
                    throw new Error('Booking not found');
                }
                const newPayment = await tx.payment.create({
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
                        payer: `${existingCustomer.firstName} ${existingCustomer.lastName}`,
                        payment: `Payment for booking #${exitingBooking.rentalNumber}`,
                        updatedBy: user.username,
                    },
                });
                return newPayment;
            });
            const transaction = {
                id: (0, uuid_1.v4)(),
                amount: data.amount,
                type: client_1.TransactionType.PAYMENT,
                transactionDate: new Date().toISOString(),
                paymentId: payment.id,
                createdBy: user.username,
            };
            await transaction_service_1.transactionService.createTransaction(transaction, tenant, user);
            return payment;
        }
        catch (error) {
            logger_1.logger.e(error, 'Error creating payment', {
                user: user.username,
                tenant: tenant.id,
                tenantCode: tenant.tenantCode,
            });
            throw error;
        }
    }
    async updatePayment(data, tenant, user) {
        try {
            const payment = await prisma_config_1.default.$transaction(async (tx) => {
                const existingPayment = await tx.payment.findUnique({
                    where: { id: data.id },
                });
                if (!existingPayment) {
                    throw new Error('Payment not found');
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
                const updatedPayment = await tx.payment.update({
                    where: { id: data.id },
                    data: {
                        amount: data.amount,
                        rentalId: data.bookingId,
                        paymentDate: data.paymentDate,
                        notes: data.notes,
                        paymentTypeId: data.paymentTypeId,
                        paymentMethodId: data.paymentMethodId,
                        updatedAt: new Date(),
                        customerId: data.customerId,
                        payer: `${existingCustomer.firstName} ${existingCustomer.lastName}`,
                        payment: `Payment for booking #${exitingBooking.rentalNumber}`,
                        updatedBy: user.username,
                    },
                });
                return updatedPayment;
            });
            const existingTransaction = await prisma_config_1.default.transactions.findFirst({
                where: { paymentId: data.id },
            });
            if (!existingTransaction) {
                throw new Error('Associated transaction not found');
            }
            const transaction = {
                id: existingTransaction.id,
                amount: data.amount,
                type: client_1.TransactionType.PAYMENT,
                transactionDate: new Date().toISOString(),
                createdBy: user.username,
            };
            await transaction_service_1.transactionService.updateTransaction(transaction, tenant, user);
        }
        catch (error) {
            logger_1.logger.e(error, 'Error updating payment', {
                user: user.username,
                tenant: tenant.id,
                tenantCode: tenant.tenantCode,
            });
            throw error;
        }
    }
    async deletePayment(paymentId, tenant, user) {
        try {
            const existingPayment = await prisma_config_1.default.payment.findUnique({
                where: { id: paymentId },
            });
            if (!existingPayment) {
                throw new Error('Payment not found');
            }
            const existingTransaction = await prisma_config_1.default.transactions.findFirst({
                where: { paymentId: paymentId },
            });
            if (!existingTransaction) {
                throw new Error('Associated transaction not found');
            }
            await prisma_config_1.default.payment.update({
                where: { id: paymentId },
                data: {
                    isDeleted: true,
                    updatedAt: new Date(),
                    updatedBy: user.username,
                },
            });
            await transaction_service_1.transactionService.deleteTransaction(existingTransaction.id, tenant, user);
        }
        catch (error) {
            logger_1.logger.e(error, 'Error deleting payment', {
                user: user.username,
                tenant: tenant.id,
                tenantCode: tenant.tenantCode,
                paymentId: paymentId,
            });
            throw error;
        }
    }
}
exports.paymentService = new PaymentService();
