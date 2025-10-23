"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const payment_service_1 = require("./payment.service");
const logger_1 = require("../../../../config/logger");
const transaction_service_1 = require("../../transaction.service");
const booking_service_1 = require("../../../booking/booking.service");
const getPayments = async (req, res) => {
    const { tenant, user } = req.context;
    try {
        const payments = await payment_service_1.paymentService.getTenantPayments(tenant);
        res.status(200).json(payments);
    }
    catch (error) {
        logger_1.logger.e(error, 'Failed to fetch payments', {
            tenantId: tenant.id,
            tenantCode: tenant.tenantCode,
        });
        res.status(500).json({ error: 'Failed to fetch payments' });
    }
};
const createPayment = async (req, res) => {
    const { tenant, user } = req.context;
    const data = req.body;
    const paymentDto = await payment_service_1.paymentService.validatePaymentData(data);
    try {
        await payment_service_1.paymentService.createPayment(paymentDto, tenant, user);
        const updatedBooking = await booking_service_1.bookingService.getBookingById(tenant, data.bookingId);
        const bookings = await booking_service_1.bookingService.getTenantBookings(tenant);
        const payments = await payment_service_1.paymentService.getTenantPayments(tenant);
        const transactions = await transaction_service_1.transactionService.getTenantTransactions(tenant);
        res.status(201).json({
            message: 'Payment created successfully',
            updatedBooking,
            bookings,
            payments,
            transactions,
        });
    }
    catch (error) {
        logger_1.logger.e(error, 'Failed to create payment', {
            tenantId: tenant.id,
            tenantCode: tenant.tenantCode,
        });
        res.status(500).json({ error: 'Failed to create payment' });
    }
};
const updatePayment = async (req, res) => {
    const { tenant, user } = req.context;
    const data = req.body;
    const paymentDto = await payment_service_1.paymentService.validatePaymentData(data);
    try {
        await payment_service_1.paymentService.updatePayment(paymentDto, tenant, user);
        const payments = await payment_service_1.paymentService.getTenantPayments(tenant);
        const transactions = await transaction_service_1.transactionService.getTenantTransactions(tenant);
        const updatedBooking = await booking_service_1.bookingService.getBookingById(tenant, data.bookingId);
        const bookings = await booking_service_1.bookingService.getTenantBookings(tenant);
        res.status(200).json({
            message: 'Payment updated successfully',
            updatedBooking,
            bookings,
            payments,
            transactions,
        });
    }
    catch (error) {
        logger_1.logger.e(error, 'Failed to update payment', {
            tenantId: tenant.id,
            tenantCode: tenant.tenantCode,
        });
        res.status(500).json({ error: 'Failed to update payment' });
    }
};
const deletePayment = async (req, res) => {
    const { tenant, user } = req.context;
    const { id } = req.params;
    if (!id) {
        logger_1.logger.w('Payment ID is missing', {
            tenantId: tenant.id,
            tenantCode: tenant.tenantCode,
        });
        return res.status(400).json({ error: 'Payment ID is required' });
    }
    try {
        await payment_service_1.paymentService.deletePayment(id, tenant, user);
        const payments = await payment_service_1.paymentService.getTenantPayments(tenant);
        const transactions = await transaction_service_1.transactionService.getTenantTransactions(tenant);
        res.status(200).json({
            message: 'Payment deleted successfully',
            payments,
            transactions,
        });
    }
    catch (error) {
        logger_1.logger.e(error, 'Failed to delete payment', {
            tenantId: tenant.id,
            tenantCode: tenant.tenantCode,
            paymentId: id,
        });
        res.status(500).json({ error: 'Failed to delete payment' });
    }
};
exports.default = {
    getPayments,
    createPayment,
    updatePayment,
    deletePayment,
};
