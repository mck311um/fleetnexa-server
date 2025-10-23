"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("../../config/logger");
const ses_service_1 = __importDefault(require("../../services/ses.service"));
const templates_1 = require("../../config/templates");
const email_dto_1 = require("./email.dto");
const email_service_1 = require("./email.service");
const setupTemplates = async (req, res) => {
    try {
        const results = [];
        for (const template of templates_1.templates) {
            try {
                logger_1.logger.i(`Setting up template: ${template.name}`);
                const success = await ses_service_1.default.createOrUpdateEmailTemplate(template);
                results.push({
                    template: template.name,
                    success: success,
                    message: success
                        ? 'Template setup complete'
                        : 'Template setup failed',
                });
                if (success) {
                    logger_1.logger.i(`✓ ${template.name} template setup complete`);
                }
                else {
                    logger_1.logger.i(`✗ ${template.name} template setup failed`);
                }
            }
            catch (error) {
                logger_1.logger.e(error, `Failed to setup ${template.name}:`);
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
        logger_1.logger.e(error, 'Template setup endpoint failed:');
    }
};
const sendBookingDocumentsEmail = async (req, res) => {
    const data = req.body;
    const { tenant } = req.context;
    const safeParse = email_dto_1.SendBookingDocumentsSchema.safeParse(data);
    if (!safeParse.success) {
        logger_1.logger.w('Invalid request data for sending booking documents email', {
            errors: safeParse.error.issues,
            data,
        });
        return res.status(400).json({ errors: safeParse.error.issues });
    }
    const emailDto = safeParse.data;
    try {
        await email_service_1.emailService.sendBookingDocumentsEmail(emailDto, tenant);
        return res
            .status(200)
            .json({ message: 'Booking documents email sent successfully' });
    }
    catch (error) {
        logger_1.logger.e(error, 'Failed to send booking documents email:');
        return res.status(500).json({ message: 'Failed to send email' });
    }
};
exports.default = {
    setupTemplates,
    sendBookingDocumentsEmail,
};
