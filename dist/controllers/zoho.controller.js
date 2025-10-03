"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const zoho_1 = require("../config/zoho");
const axios_1 = __importDefault(require("axios"));
const prisma_config_1 = __importDefault(require("../config/prisma.config"));
const client_s3_1 = require("@aws-sdk/client-s3");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
const form_data_1 = __importDefault(require("form-data"));
const logger_config_1 = __importDefault(require("../config/logger.config"));
const s3Client = new client_s3_1.S3Client({ region: process.env.AWS_REGION });
const sendForSignature = async (req, res) => {
    const { rentalId, documentUrl, driverEmail, userId } = req.body;
    const tenantId = req.user?.tenantId;
    if (!rentalId || !documentUrl || !tenantId || !userId) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    try {
        const accessToken = await (0, zoho_1.getZohoAccessToken)();
        const [driver, user] = await Promise.all([
            prisma_config_1.default.rentalDriver.findFirst({
                where: { rentalId },
                include: { customer: true },
            }),
            prisma_config_1.default.user.findUnique({ where: { id: userId } }),
        ]);
        const signatureResponse = await createDocument(documentUrl, driver, driverEmail, user, accessToken);
        const sendResponse = await sendForSigning(signatureResponse.requests, accessToken);
        return res.status(200).json(sendResponse);
    }
    catch (error) {
        console.error('Zoho Sign Error:', error.response?.data || error.message);
        res.status(500).json({
            error: 'Failed to send document for signing',
            details: error.message,
        });
    }
};
const createDocument = async (documentUrl, driver, driverEmail, user, accessToken) => {
    let tempFilePath = null;
    try {
        const urlParts = new URL(documentUrl);
        const bucket = urlParts.hostname.split('.')[0];
        const key = urlParts.pathname.substring(1);
        const tempDir = path_1.default.join(__dirname, '..', 'temp');
        if (!fs_1.default.existsSync(tempDir)) {
            fs_1.default.mkdirSync(tempDir, { recursive: true });
        }
        tempFilePath = path_1.default.join(tempDir, `${(0, uuid_1.v4)()}.pdf`);
        const fileStream = fs_1.default.createWriteStream(tempFilePath);
        const s3Response = await s3Client.send(new client_s3_1.GetObjectCommand({
            Bucket: bucket,
            Key: key,
        }));
        if (s3Response.Body) {
            const bodyStream = s3Response.Body;
            await new Promise((resolve, reject) => {
                bodyStream.pipe(fileStream);
                bodyStream.on('error', reject);
                fileStream.on('finish', resolve);
            });
        }
        else {
            throw new Error('No file body received from S3');
        }
        const requestData = {
            requests: {
                request_name: 'Booking Agreement Signing Request',
                notes: 'Please sign this booking agreement',
                is_sequential: false,
                expiration_days: 30,
                actions: [
                    {
                        action_type: 'SIGN',
                        recipient_name: `${driver.driver.firstName} ${driver.driver.lastName}`,
                        recipient_email: driverEmail,
                        in_person_name: `${driver.driver.firstName} ${driver.driver.lastName}`,
                        verify_recipient: false,
                        private_notes: 'Primary Driver',
                    },
                    {
                        action_type: 'SIGN',
                        recipient_name: `${user.firstName} ${user.lastName}`,
                        recipient_email: `${user.email}`,
                        in_person_name: `${user.firstName} ${user.lastName}`,
                        verify_recipient: false,
                        private_notes: 'Authorized Representative',
                    },
                ],
            },
        };
        const formData = new form_data_1.default();
        formData.append('file', fs_1.default.createReadStream(tempFilePath), {
            filename: 'Booking_Agreement.pdf',
            contentType: 'application/pdf',
        });
        formData.append('data', JSON.stringify(requestData));
        const response = await axios_1.default.post('https://sign.zoho.com/api/v1/requests', formData, {
            headers: {
                Authorization: `Zoho-oauthtoken ${accessToken}`,
                ...formData.getHeaders(),
            },
        });
        if (tempFilePath && fs_1.default.existsSync(tempFilePath)) {
            fs_1.default.unlinkSync(tempFilePath);
        }
        logger_config_1.default.logger.info(`Zoho Sign Request Created: ${response.data.request_id}`);
        return response.data;
    }
    catch (error) {
        logger_config_1.default.logger.error('Error creating Zoho Sign request:', error);
        if (tempFilePath && fs_1.default.existsSync(tempFilePath)) {
            fs_1.default.unlinkSync(tempFilePath);
        }
        throw error;
    }
};
const sendForSigning = async (data, accessToken) => {
    try {
        const requestId = data.request_id;
        const res = await axios_1.default.post(`https://sign.zoho.com/api/v1/requests/${requestId}/send`, data, {
            headers: {
                Authorization: `Zoho-oauthtoken ${accessToken}`,
            },
        });
        return res.data;
    }
    catch (error) {
        logger_config_1.default.logger.error('Error sending for signature:', error);
    }
};
exports.default = {
    sendForSignature,
};
