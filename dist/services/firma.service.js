"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.firmaService = void 0;
const axios_1 = __importDefault(require("axios"));
const logger_1 = require("../config/logger");
const pdf_service_1 = require("./pdf.service");
const FIRMA_BASE_URL = 'https://api.firma.dev/functions/v1/signing-request-api/';
const FIRMA_API_KEY = process.env.FIRMA_API_KEY;
class FirmaService {
    constructor() {
        this.client = axios_1.default.create({
            baseURL: FIRMA_BASE_URL,
            headers: {
                Authorization: `${FIRMA_API_KEY}`,
                'Content-Type': 'application/json',
            },
        });
    }
    async sendS3DocumentForSigning(bucketName, key, recipientEmail) {
        const presignedUrl = await pdf_service_1.pdfService.getPresignedURL(bucketName, key);
        const documentData = {
            documents: [
                {
                    name: key,
                    url: presignedUrl,
                },
            ],
            signers: [
                {
                    name: recipientEmail.split('@')[0],
                    email: recipientEmail,
                    role: 'signer',
                },
            ],
            title: 'Please sign this document',
            message: 'Kindly review and sign the attached agreement.',
        };
        const response = await this.createSigningRequest(documentData);
        return response;
    }
    async createSigningRequest(documentData) {
        try {
            const response = await this.client.post('signing-requests', documentData);
            return response.data;
        }
        catch (error) {
            logger_1.logger.e(error, 'Error creating signing request', {});
            throw error;
        }
    }
}
exports.firmaService = new FirmaService();
