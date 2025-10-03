"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("../../config/logger");
const handlePayment = (req) => {
    try {
        logger_1.logger.i('Received ShopDM payment webhook', { body: req.body });
    }
    catch (error) {
        logger_1.logger.e(error, 'Error handling ShopDM payment webhook');
    }
};
exports.default = {
    handlePayment,
};
