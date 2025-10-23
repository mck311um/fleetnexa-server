"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailService = void 0;
const prisma_config_1 = __importDefault(require("../../config/prisma.config"));
const formatter_1 = __importDefault(require("../../utils/formatter"));
const ses_service_1 = __importDefault(require("../../services/ses.service"));
const logger_1 = require("../../config/logger");
const customer_service_1 = __importDefault(require("../customer/customer.service"));
class EmailService {
    async sendBusinessVerificationEmail(tenant, token) {
        try {
            const templateData = {
                tenantName: tenant.tenantName,
                email: tenant.email,
                verificationCode: token.token,
                timestamp: formatter_1.default.formatDateToFriendlyWithTime(token.expiresAt),
            };
            await ses_service_1.default.sendEmail({
                to: [tenant.email || ''],
                template: 'VerifyBusinessEmail',
                templateData,
            });
        }
        catch (error) {
            logger_1.logger.e(error, 'Error sending business verification email', {
                tenantId: tenant.id,
                tenantCode: tenant.tenantCode,
            });
            throw error;
        }
    }
    async sendBookingDocumentsEmail(data, tenant) {
        try {
            const currency = await prisma_config_1.default.currency.findUnique({
                where: { id: tenant.currencyId },
            });
            if (!currency) {
                logger_1.logger.w('Currency not found', { currencyId: tenant.currencyId });
                throw new Error('Currency not found');
            }
            const booking = await prisma_config_1.default.rental.findUnique({
                where: { id: data.bookingId },
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
                logger_1.logger.w('Booking not found', { bookingId: data.bookingId });
                throw new Error('Booking not found');
            }
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
                invoiceUrl: data.includeInvoice
                    ? booking?.invoice?.invoiceUrl || ''
                    : undefined,
                agreementUrl: data.includeAgreement
                    ? booking?.agreement?.agreementUrl || ''
                    : undefined,
            };
            await ses_service_1.default.sendEmail({
                to: [data.to],
                template: 'BookingDocuments',
                templateData,
            });
        }
        catch (error) {
            logger_1.logger.e(error, 'Error sending booking documents email', {
                bookingId: data.bookingId,
                tenantId: tenant?.id,
                tenantCode: tenant?.tenantCode,
            });
            throw error;
        }
    }
}
exports.emailService = new EmailService();
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
const sendConfirmationEmail = async (bookingId, includeInvoice, includeAgreement, tenant) => {
    try {
        let currency;
        logger_1.logger.i('Fetching currency', { tenantId: tenant.currencyId });
        if (!tenant.currencyId) {
            currency = await prisma_config_1.default.currency.findFirst({
                where: { code: 'USD' },
            });
        }
        else {
            currency = await prisma_config_1.default.currency.findUnique({
                where: { id: tenant.currencyId },
            });
        }
        const booking = await prisma_config_1.default.rental.findUnique({
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
        const primaryDriver = await customer_service_1.default.getPrimaryDriver(booking.id);
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
            invoiceUrl: includeInvoice
                ? booking?.invoice?.invoiceUrl || ''
                : undefined,
            agreementUrl: includeAgreement
                ? booking?.agreement?.agreementUrl || ''
                : undefined,
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
const newUserEmail = async (tenant, userId, password) => {
    try {
        const user = await prisma_config_1.default.user.findUnique({
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
const resetPasswordEmail = async (tenant, userId, password) => {
    try {
        const user = await prisma_config_1.default.user.findUnique({
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
