"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("../../../../config/logger");
const transaction_service_1 = require("../../transaction.service");
const booking_service_1 = require("../../../booking/booking.service");
const refund_service_1 = require("./refund.service");
const getRefunds = async (req, res) => {
    const { tenant, user } = req.context;
    try {
        const refunds = await refund_service_1.refundService.getTenantRefunds(tenant);
        res.json(refunds);
    }
    catch (error) {
        logger_1.logger.e(error, 'Error fetching refunds', {
            user: user.username,
            tenant: tenant.id,
            tenantCode: tenant.tenantCode,
        });
        res.status(500).json({ error: 'Internal server error' });
    }
};
const createRefund = async (req, res) => {
    const data = req.body;
    const { tenant, user } = req.context;
    const refundDto = await refund_service_1.refundService.validateRefundData(data);
    try {
        const refund = await refund_service_1.refundService.createRefund(refundDto, tenant, user);
        const updatedBooking = await booking_service_1.bookingService.getBookingById(tenant, data.bookingId);
        const bookings = await booking_service_1.bookingService.getTenantBookings(tenant);
        const refunds = await refund_service_1.refundService.getTenantRefunds(tenant);
        const transactions = await transaction_service_1.transactionService.getTenantTransactions(tenant);
        res.status(201).json({
            message: 'Refund created successfully',
            refund,
            updatedBooking,
            bookings,
            refunds,
            transactions,
        });
    }
    catch (error) {
        logger_1.logger.e(error, 'Error creating refund', {
            user: user.username,
            tenant: tenant.id,
            tenantCode: tenant.tenantCode,
        });
        res.status(500).json({ error: 'Internal server error' });
    }
};
const updateRefund = async (req, res) => {
    const data = req.body;
    const { tenant, user } = req.context;
    const refundDto = await refund_service_1.refundService.validateRefundData(data);
    try {
        const refund = await refund_service_1.refundService.updateRefund(refundDto, tenant, user);
        const updatedBooking = await booking_service_1.bookingService.getBookingById(tenant, data.bookingId);
        const bookings = await booking_service_1.bookingService.getTenantBookings(tenant);
        const refunds = await refund_service_1.refundService.getTenantRefunds(tenant);
        const transactions = await transaction_service_1.transactionService.getTenantTransactions(tenant);
        res.status(200).json({
            message: 'Refund updated successfully',
            refund,
            updatedBooking,
            bookings,
            refunds,
            transactions,
        });
    }
    catch (error) {
        logger_1.logger.e(error, 'Error updating refund', {
            user: user.username,
            tenant: tenant.id,
            tenantCode: tenant.tenantCode,
        });
        res.status(500).json({ error: 'Internal server error' });
    }
};
const deleteRefund = async (req, res) => {
    const { tenant, user } = req.context;
    const { id } = req.params;
    try {
        const refund = await refund_service_1.refundService.deleteRefund(id, tenant, user);
        const bookings = await booking_service_1.bookingService.getTenantBookings(tenant);
        const updatedBooking = await booking_service_1.bookingService.getBookingById(tenant, refund.rentalId || '');
        const refunds = await refund_service_1.refundService.getTenantRefunds(tenant);
        const transactions = await transaction_service_1.transactionService.getTenantTransactions(tenant);
        res.status(200).json({
            message: 'Refund deleted successfully',
            bookings,
            refunds,
            updatedBooking,
            transactions,
        });
    }
    catch (error) {
        logger_1.logger.e(error, 'Error deleting refund', {
            user: user.username,
            tenant: tenant.id,
            tenantCode: tenant.tenantCode,
            refundId: id,
        });
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.default = {
    getRefunds,
    createRefund,
    updateRefund,
    deleteRefund,
};
