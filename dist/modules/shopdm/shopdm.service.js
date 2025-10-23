"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("../../config/logger");
const verifySignature = () => {
    try {
        // const payload = req.body;
    }
    catch (error) {
        logger_1.logger.e(error, 'Error verifying ShopDM signature');
    }
};
exports.default = {
    verifySignature,
};
