"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signingService = void 0;
const prisma_config_1 = __importDefault(require("../../config/prisma.config"));
const customer_service_1 = require("../customer/customer.service");
const firma_service_1 = require("../../services/firma.service");
const logger_1 = require("../../config/logger");
const client_s3_1 = require("@aws-sdk/client-s3");
const aws_config_1 = require("../../config/aws.config");
const pdf_lib_1 = require("pdf-lib");
class SigningService {
    async sendAgreementForSigning(data, tenant) {
        try {
            const existingBooking = await prisma_config_1.default.rental.findUnique({
                where: { id: data.bookingId },
                include: { agreement: true },
            });
            if (!existingBooking) {
                throw new Error('Booking not found');
            }
            const primaryDriver = await customer_service_1.customerService.getPrimaryDriver(data.bookingId);
            if (!existingBooking.agreement?.agreementUrl) {
                throw new Error('Agreement URL not found for the booking');
            }
            const user = await prisma_config_1.default.user.findUnique({
                where: { id: data.userId },
            });
            if (!user) {
                throw new Error('User not found');
            }
            const s3Key = existingBooking.agreement.signableUrl.split('.amazonaws.com/')[1];
            const command = new client_s3_1.GetObjectCommand({
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: s3Key,
            });
            const s3Response = await aws_config_1.s3Client.send(command);
            const buffer = await this.streamToBuffer(s3Response.Body);
            const base64PDF = buffer.toString('base64');
            const pdfDoc = await pdf_lib_1.PDFDocument.load(buffer);
            const totalPages = pdfDoc.getPageCount();
            const documentData = {
                name: `Booking Agreement - ${existingBooking.bookingCode}`,
                document: base64PDF,
                description: 'Booking Agreement Document',
                settings: {
                    use_signing_order: false,
                    allow_download: true,
                    attach_pdf_on_finish: true,
                },
                recipients: [
                    {
                        first_name: user.firstName,
                        last_name: user.lastName,
                        email: user.email,
                        designation: 'Signer',
                        order: 1,
                    },
                    {
                        first_name: primaryDriver.customer.firstName,
                        last_name: primaryDriver.customer.lastName,
                        email: data.driverEmail,
                        designation: 'Signer',
                        order: 2,
                    },
                ],
                fields: [
                    {
                        type: 'signature',
                        position: {
                            x: 40,
                            y: 290,
                            width: 50,
                            height: 100,
                        },
                        page_number: totalPages,
                        required: true,
                    },
                    {
                        type: 'signature',
                        position: {
                            x: 320,
                            y: 290,
                            width: 50,
                            height: 100,
                        },
                        page_number: totalPages,
                        required: true,
                    },
                ],
            };
            logger_1.logger.i('Sending agreement for signing', { documentData });
            const res = await firma_service_1.firmaService.createSigningRequest(documentData);
            logger_1.logger.i(`Agreement sent for signing successfully`, { res });
        }
        catch (error) {
            logger_1.logger.e(error, 'Error sending agreement for signing', {
                bookingId: data.bookingId,
                tenantId: tenant.id,
            });
            throw error;
        }
    }
    async streamToBuffer(stream) {
        return new Promise((resolve, reject) => {
            const chunks = [];
            stream.on('data', (chunk) => chunks.push(chunk));
            stream.on('error', reject);
            stream.on('end', () => resolve(Buffer.concat(chunks)));
        });
    }
}
exports.signingService = new SigningService();
