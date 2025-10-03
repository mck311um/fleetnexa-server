"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_config_1 = __importDefault(require("../config/logger.config"));
const errorHandler = (err, req, res) => {
    const status = err.statusCode || 500;
    const message = err.message || 'Internal server error';
    logger_config_1.default.logger.error('Error [%s]: %s', req.method + ' ' + req.originalUrl, message, {
        stack: err.stack,
        status,
    });
    res.status(status).json({
        error: message,
        ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
    });
};
exports.default = errorHandler;
