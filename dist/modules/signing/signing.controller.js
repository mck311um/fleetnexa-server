"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("../../config/logger");
const signing_service_1 = require("./signing.service");
const signing_dto_1 = require("./signing.dto");
const sendAgreementForSigning = async (req, res) => {
    const data = req.body;
    const { tenant } = req.context;
    if (!data) {
        res.status(400).json({ message: 'Invalid request data' });
        return res.status(400).json({ error: 'Signing data is required' });
    }
    const parseResult = signing_dto_1.SendAgreementForSigningSchema.safeParse(data);
    if (!parseResult.success) {
        return res.status(400).json({
            error: 'Invalid agreement signing data',
            details: parseResult.error.issues,
        });
    }
    const signingData = parseResult.data;
    try {
        const signing = await signing_service_1.signingService.sendAgreementForSigning(signingData, tenant);
        res
            .status(200)
            .json({ message: 'Agreement sent for signing', data: signing });
    }
    catch (error) {
        logger_1.logger.e(error, 'Error sending document for signing', {
            bookingId: data.bookingId,
            tenantId: tenant.id,
        });
        res.status(500).json({ message: 'Failed to send agreement for signing' });
    }
};
exports.default = {
    sendAgreementForSigning,
};
