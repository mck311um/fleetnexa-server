"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const formatter_1 = __importDefault(require("../../utils/formatter"));
const ses_service_1 = __importDefault(require("../../services/ses.service"));
const logger_1 = require("../../config/logger");
const customer_service_1 = __importDefault(require("../customer/customer.service"));
const sendWelcomeEmail = async (tenant, username, password, name) => {
    try {
        const templateData = {
            tenantName: tenant.tenantName,
            username,
            password,
            name,
        };
        await ses_service_1.default.sendEmail({
            to: [tenant.email || ''],
            template: 'WelcomeTemplate',
            templateData,
        });
    }
    catch (error) {
        logger_1.logger.e(error, 'Error sending welcome email', {
            tenantId: tenant.id,
            tenantCode: tenant.tenantCode,
        });
        throw error;
    }
};
const sendConfirmationEmail = async (bookingId, tenant, tx) => {
    try {
        if (!tenant) {
            throw new Error('Tenant not found');
        }
        const currency = await tx.currency.findUnique({
            where: { id: tenant.currencyId },
        });
        const booking = await tx.rental.findUnique({
            where: { id: bookingId },
            include: {
                pickup: true,
                vehicle: {
                    include: {
                        brand: true,
                        model: {
                            include: {
                                bodyType: true,
                            },
                        },
                        transmission: true,
                    },
                },
                invoice: true,
                agreement: true,
                values: true,
            },
        });
        if (!booking) {
            throw new Error('Booking not found');
        }
        const primaryDriver = await customer_service_1.default.getPrimaryDriver(booking.id, tx);
        const templateData = {
            bookingId: booking?.bookingCode || '',
            startDate: formatter_1.default.formatDateToFriendlyDate(booking?.startDate) || '',
            pickupTime: formatter_1.default.formatDateToFriendlyTime(booking?.startDate) || '',
            endDate: formatter_1.default.formatDateToFriendlyDate(booking?.endDate) || '',
            pickupLocation: booking?.pickup.location || '',
            totalPrice: formatter_1.default.formatNumberToTenantCurrency(booking?.values?.netTotal || 0, currency?.code || 'USD'),
            tenantName: tenant?.tenantName || '',
            phone: tenant?.number || '',
            vehicle: formatter_1.default.formatVehicleToFriendly(booking?.vehicle) || '',
            email: tenant?.email || '',
            invoiceUrl: booking?.invoice?.invoiceUrl || '',
            agreementUrl: booking?.agreement?.agreementUrl || '',
        };
        await ses_service_1.default.sendEmail({
            to: [primaryDriver?.customer.email || ''],
            cc: [tenant?.email || ''],
            template: 'BookingConfirmation',
            templateData,
        });
    }
    catch (error) {
        logger_1.logger.e(error, 'Error sending confirmation email', {
            bookingId,
            tenantId: tenant?.id,
            tenantCode: tenant?.tenantCode,
        });
        throw error;
    }
};
const newUserEmail = async (tenant, userId, password, tx) => {
    try {
        const user = await tx.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new Error('User not found');
        }
        const templateData = {
            tenantName: tenant?.tenantName,
            name: `${user?.firstName} ${user?.lastName}`,
            username: user?.username,
            password,
        };
        await ses_service_1.default.sendEmail({
            to: [user.email || ''],
            template: 'NewUser',
            templateData,
        });
    }
    catch (error) {
        logger_1.logger.e(error, 'Error sending new user email', {
            userId,
            tenantId: tenant?.id,
            tenantCode: tenant?.tenantCode,
        });
        throw error;
    }
};
const resetPasswordEmail = async (tenant, userId, password, tx) => {
    try {
        const user = await tx.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new Error('User not found');
        }
        const templateData = {
            tenantName: tenant?.tenantName,
            name: `${user?.firstName} ${user?.lastName}`,
            username: user?.username,
            password,
        };
        await ses_service_1.default.sendEmail({
            to: [user.email || ''],
            template: 'PasswordReset',
            templateData,
        });
    }
    catch (error) {
        logger_1.logger.e(error, 'Error sending reset password email', {
            userId,
            tenantId: tenant?.id,
            tenantCode: tenant?.tenantCode,
        });
        throw error;
    }
};
exports.default = {
    sendConfirmationEmail,
    newUserEmail,
    resetPasswordEmail,
    sendWelcomeEmail,
};
