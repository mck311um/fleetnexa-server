"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const rental_repository_1 = require("../repository/rental.repository");
const prisma_config_1 = __importDefault(require("../config/prisma.config"));
const getTransactions = async (req, res, next) => {
    const tenantId = req.user?.tenantId;
    try {
        const transactions = await prisma_config_1.default.transactions.findMany({
            where: {
                tenantId: tenantId,
            },
            include: {
                customer: true,
                rental: {
                    select: {
                        rentalNumber: true,
                    },
                },
                payment: {
                    include: {
                        paymentMethod: true,
                        paymentType: true,
                        rental: {
                            select: {
                                id: true,
                                rentalNumber: true,
                            },
                        },
                    },
                },
                // user: {
                //   select: {
                //     firstName: true,
                //     lastName: true,
                //     username: true,
                //   },
                // },
            },
        });
        return res.status(201).json(transactions);
    }
    catch (error) {
        next(error);
    }
};
const removeTransaction = async (req, res, next) => {
    const { id } = req.params;
    const tenantId = req.user?.tenantId;
    try {
        const updated = await prisma_config_1.default.$transaction(async (tx) => {
            let rentalId = null;
            const transaction = await tx.transactions.findUnique({
                where: {
                    id,
                    tenantId,
                },
            });
            if (!transaction) {
                return res.status(404).json({ error: 'Transaction not found' });
            }
            if (transaction.rentalId) {
                rentalId = transaction.rentalId;
            }
            if (transaction.paymentId) {
                await tx.payment.delete({
                    where: {
                        id: transaction.paymentId,
                    },
                });
            }
            else if (transaction.refundId) {
                await tx.refund.delete({
                    where: {
                        id: transaction.refundId,
                    },
                });
            }
            await tx.transactions.delete({
                where: {
                    id,
                    tenantId,
                },
            });
            const updatedRental = rentalId
                ? await rental_repository_1.rentalRepo.getRentalById(rentalId, tenantId)
                : null;
            return updatedRental;
        });
        return res.status(201).json(updated);
    }
    catch (error) {
        next(error);
    }
};
const addRentalPayment = async (req, res, next) => {
    const { payment } = req.body;
    const userId = req.user?.id;
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
        return res.status(400).json({ error: 'Tenant ID is required' });
    }
    if (!payment) {
        return res.status(400).json({ error: 'Payment data is required' });
    }
    try {
        await prisma_config_1.default.$transaction(async (tx) => {
            const rentalPaymentData = {
                id: payment.id,
                amount: payment.amount,
                paymentDate: payment.paymentDate,
                notes: payment.notes,
                tenantId: tenantId,
                rentalId: payment.rentalId,
                paymentTypeId: payment.paymentTypeId,
                paymentMethodId: payment.paymentMethodId,
                createdAt: new Date(),
                updatedAt: new Date(),
                updatedBy: userId,
                customerId: payment.customerId,
            };
            await tx.payment.create({
                data: rentalPaymentData,
            });
            await tx.transactions.create({
                data: {
                    amount: payment.amount,
                    type: 'PAYMENT',
                    transactionDate: payment.paymentDate,
                    customerId: payment.customerId,
                    createdBy: userId,
                    createdAt: new Date(),
                    paymentId: payment.id,
                    tenantId: tenantId,
                    rentalId: payment.rentalId,
                },
            });
        });
        const updatedRental = await rental_repository_1.rentalRepo.getRentalById(payment.rentalId, tenantId);
        return res.status(201).json(updatedRental);
    }
    catch (error) {
        next(error);
    }
};
const updateRentalPayment = async (req, res, next) => {
    const { payment } = req.body;
    const userId = req.user?.id;
    const tenantId = req.user?.tenantId;
    try {
        await prisma_config_1.default.$transaction(async (tx) => {
            const rentalPaymentData = {
                amount: payment.amount,
                paymentDate: payment.paymentDate,
                notes: payment.notes,
                paymentTypeId: payment.paymentTypeId,
                paymentMethodId: payment.paymentMethodId,
                updatedAt: new Date(),
                updatedBy: userId,
            };
            await tx.payment.update({
                where: {
                    id: payment.id,
                    tenantId: tenantId,
                },
                data: rentalPaymentData,
            });
            await tx.transactions.update({
                where: {
                    paymentId: payment.id,
                    tenantId: tenantId,
                },
                data: {
                    amount: payment.amount,
                    type: 'PAYMENT',
                    transactionDate: payment.paymentDate,
                },
            });
        });
        const updatedRental = await rental_repository_1.rentalRepo.getRentalById(payment.rentalId, tenantId);
        return res.status(201).json(updatedRental);
    }
    catch (error) {
        next(error);
    }
};
const addRefundPayment = async (req, res, next) => {
    const { refund } = req.body;
    const userId = req.user?.id;
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
        return res.status(400).json({ error: 'Tenant ID is required' });
    }
    if (!refund) {
        return res.status(400).json({ error: 'Payment data is required' });
    }
    try {
        await prisma_config_1.default.$transaction(async (tx) => {
            const rentalRefundData = {
                id: refund.id,
                amount: refund.amount,
                refundDate: refund.refundDate,
                reason: refund.reason,
                tenantId: tenantId,
                rentalId: refund.rentalId,
                createdAt: new Date(),
                updatedAt: new Date(),
                customerId: refund.customerId,
                createdBy: userId,
            };
            await tx.refund.create({
                data: rentalRefundData,
            });
            await tx.transactions.create({
                data: {
                    amount: -refund.amount,
                    type: 'REFUND',
                    transactionDate: refund.paymentDate,
                    customerId: refund.customerId,
                    createdBy: userId,
                    createdAt: new Date(),
                    tenantId: tenantId,
                    rentalId: refund.rentalId,
                    refundId: refund.id,
                },
            });
        });
        const updatedRental = await rental_repository_1.rentalRepo.getRentalById(refund.rentalId, tenantId);
        return res.status(201).json(updatedRental);
    }
    catch (error) {
        next(error);
    }
};
const updateRefundPayment = async (req, res, next) => {
    const { refund } = req.body;
    const userId = req.user?.id;
    const tenantId = req.user?.tenantId;
    try {
        await prisma_config_1.default.$transaction(async (tx) => {
            const rentalRefundData = {
                amount: refund.amount,
                refundDate: refund.refundDate,
                reason: refund.reason,
                updatedAt: new Date(),
                customerId: refund.customerId,
                createdBy: userId,
            };
            await tx.refund.update({
                where: {
                    id: refund.id,
                    tenantId: tenantId,
                },
                data: rentalRefundData,
            });
            await tx.transactions.update({
                where: {
                    refundId: refund.id,
                    tenantId: tenantId,
                },
                data: {
                    amount: -refund.amount,
                    type: 'REFUND',
                    transactionDate: refund.paymentDate,
                },
            });
        });
        const updatedRental = await rental_repository_1.rentalRepo.getRentalById(refund.rentalId, tenantId);
        return res.status(201).json(updatedRental);
    }
    catch (error) {
        next(error);
    }
};
exports.default = {
    addRentalPayment,
    updateRentalPayment,
    getTransactions,
    addRefundPayment,
    removeTransaction,
    updateRefundPayment,
};
