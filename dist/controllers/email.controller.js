"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tenant_repository_1 = require("../repository/tenant.repository");
const rental_repository_1 = require("../repository/rental.repository");
const prisma_config_1 = __importDefault(require("../config/prisma.config"));
const ses_service_1 = __importDefault(require("../services/ses.service"));
const logger_config_1 = require("../config/logger.config");
const ses_service_2 = __importDefault(require("../services/ses.service"));
const formatter_1 = __importDefault(require("../utils/formatter"));
// interface Document {
//   documentUrl: string;
//   documentType: string;
//   filename?: string;
// }
// interface SendDocumentBody {
//   documents: Document[];
//   recipientEmail: string;
//   senderName: string;
//   senderEmail?: string;
//   rentalId: string;
//   message?: string;
// }
const createEmailTemplate = async (req, res, next) => {
    const { body } = req.body;
    try {
        const success = await ses_service_1.default.createEmailTemplate(body);
        if (success) {
            return res.status(201).json({ message: 'Template created successfully' });
        }
        return res.status(500).json({ message: 'Failed to create template' });
    }
    catch (error) {
        next(error);
    }
};
const setupTemplates = async (req, res, next) => {
    try {
        const templates = [
            {
                name: 'WelcomeTemplate',
                subject: 'Welcome to FleetNexa!',
                text: 'Welcome {{name}}!\n\nThank you for joining FleetNexa.\n\nYour account:\nCompany: {{tenantName}}\nUsername: {{username}}\nPassword: {{password}}\n\nPlease change your password immediately after first login.\n\nBest regards,\nFleetNexa Team',
            },
            {
                name: 'BookingConfirmation',
                subject: 'Booking Confirmation',
                text: "Booking Confirmed!\n\nYour reservation has been successfully completed.\n\nBooking Details:\nBooking ID: {{bookingId}}\nStart Date: {{startDate}}\nEnd Date: {{endDate}}\nPickup Location: {{pickupLocation}}\nTotal Price: {{totalPrice}}\n\nRental Company:\nCompany: {{tenantName}}\nPhone: {{phone}}\nEmail: {{email}}\n\nImportant Notes:\n- Please bring a valid driver's license\n- Arrive 15 minutes before your scheduled pickup time\n- Contact the rental company if you need to make any changes with your booking ID\n\n© 2025 Devvize Services. All rights reserved.\nNeed help? Contact our team at support@devvize.com",
            },
            {
                name: 'BookingCompleted',
                subject: 'Booking Completed',
                text: "Booking Completed!\n\nYour reservation has been successfully completed.\n\nBooking Details:\nBooking ID: {{bookingId}}\nStart Date: {{startDate}}\nEnd Date: {{endDate}}\nPickup Location: {{pickupLocation}}\nTotal Price: {{totalPrice}}\n\nRental Company:\nCompany: {{tenantName}}\nPhone: {{phone}}\nEmail: {{email}}\n\nImportant Notes:\n- Please bring a valid driver's license\n- Arrive 15 minutes before your scheduled pickup time\n- Contact the rental company if you need to make any changes with your booking ID\n\n© 2025 Devvize Services. All rights reserved.\nNeed help? Contact our team at support@devvize.com",
            },
        ];
        const results = [];
        for (const template of templates) {
            try {
                logger_config_1.logger.info(`Setting up template: ${template.name}`);
                const success = await ses_service_1.default.createOrUpdateEmailTemplate(template);
                results.push({
                    template: template.name,
                    success: success,
                    message: success
                        ? 'Template setup complete'
                        : 'Template setup failed',
                });
                if (success) {
                    logger_config_1.logger.info(`✓ ${template.name} template setup complete`);
                }
                else {
                    logger_config_1.logger.warn(`✗ ${template.name} template setup failed`);
                }
            }
            catch (error) {
                logger_config_1.logger.error(`Failed to setup ${template.name}:`, error);
                results.push({
                    template: template.name,
                    success: false,
                    message: `Error: ${error.message}`,
                });
            }
        }
        res.status(200).json({
            message: 'Template setup completed',
            results: results,
        });
    }
    catch (error) {
        logger_config_1.logger.error('Template setup endpoint failed:', error);
        next(error);
    }
};
const updateEmailTemplate = async (req, res, next) => {
    const { body } = req.body;
    try {
        const success = await ses_service_1.default.updateEmailTemplate(body);
        if (success) {
            return res.status(200).json({ message: 'Template updated successfully' });
        }
        return res.status(500).json({ message: 'Failed to update template' });
    }
    catch (error) {
        next(error);
    }
};
const sendConfirmationEmail = async (req, res, next) => {
    const bookingId = req.params.bookingId;
    const tenantId = req.user?.tenantId;
    try {
        if (!bookingId) {
            return res.status(400).json({ message: 'BookingId is Required' });
        }
        const tenant = await tenant_repository_1.tenantRepo.getTenantById(tenantId);
        const booking = await rental_repository_1.rentalRepo.getRentalById(bookingId, tenantId);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        const primaryDriver = await prisma_config_1.default.rentalDriver.findFirst({
            where: {
                rentalId: booking.id,
                isPrimary: true,
            },
            select: { driverId: true, customer: { select: { email: true } } },
        });
        const templateData = {
            bookingId: booking?.bookingCode || '',
            startDate: formatter_1.default.formatDateToFriendlyDate(booking?.startDate) || '',
            pickupTime: formatter_1.default.formatDateToFriendlyTime(booking?.startDate) || '',
            endDate: formatter_1.default.formatDateToFriendlyDate(booking?.endDate) || '',
            pickupLocation: booking?.pickup.location || '',
            totalPrice: formatter_1.default.formatNumberToTenantCurrency(booking?.values?.netTotal || 0, tenant?.currency?.code || 'USD'),
            tenantName: tenant?.tenantName || '',
            phone: tenant?.number || '',
            vehicle: formatter_1.default.formatVehicleToFriendly(booking?.vehicle) || '',
            email: tenant?.email || '',
            invoiceUrl: booking?.invoice?.invoiceUrl || '',
            agreementUrl: booking?.agreement?.agreementUrl || '',
        };
        await ses_service_2.default.sendEmail({
            to: [primaryDriver?.customer.email || ''],
            cc: [tenant?.email || ''],
            template: 'BookingConfirmation',
            templateData,
        });
        res.status(200).json({ message: 'Confirmation email sent successfully' });
    }
    catch (error) {
        next(error);
    }
};
const sendCompletionEmail = async (req, res, next) => {
    const { bookingId, tenantId } = req.body;
    try {
        if (!bookingId) {
            return res.status(400).json({ message: 'BookingId is Required' });
        }
        const tenant = await tenant_repository_1.tenantRepo.getTenantById(tenantId);
        const booking = await rental_repository_1.rentalRepo.getRentalById(bookingId, tenantId);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        const primaryDriver = await prisma_config_1.default.rentalDriver.findFirst({
            where: {
                rentalId: booking.id,
                isPrimary: true,
            },
            select: { driverId: true, customer: { select: { email: true } } },
        });
        const templateData = {
            bookingId: booking?.bookingCode || '',
            startDate: formatter_1.default.formatDateToFriendlyDate(booking?.startDate) || '',
            pickupTime: formatter_1.default.formatDateToFriendlyTime(booking?.startDate) || '',
            endDate: formatter_1.default.formatDateToFriendlyDate(booking?.endDate) || '',
            pickupLocation: booking?.pickup.location || '',
            totalPrice: formatter_1.default.formatNumberToTenantCurrency(booking?.values?.netTotal || 0, tenant?.currency?.code || 'USD'),
            tenantName: tenant?.tenantName || '',
            phone: tenant?.number || '',
            vehicle: formatter_1.default.formatVehicleToFriendly(booking?.vehicle) || '',
            email: tenant?.email || '',
        };
        await ses_service_2.default.sendEmail({
            to: [primaryDriver?.customer.email || ''],
            cc: [tenant?.email || ''],
            from: 'no-reply@rentnexa.com',
            template: 'BookingCompleted',
            templateData,
        });
        res.status(200).json({ message: 'Completion email sent successfully' });
    }
    catch (error) {
        next(error);
    }
};
exports.default = {
    setupTemplates,
    sendConfirmationEmail,
    sendCompletionEmail,
    createEmailTemplate,
    updateEmailTemplate,
};
