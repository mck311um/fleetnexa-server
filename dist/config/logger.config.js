"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const winston_1 = require("winston");
exports.logger = (0, winston_1.createLogger)({
    level: 'info',
    format: winston_1.format.combine(winston_1.format.timestamp(), winston_1.format.errors({ stack: true }), winston_1.format.splat(), winston_1.format.json()),
    transports: [
        new winston_1.transports.Console({
            format: winston_1.format.combine(winston_1.format.colorize(), winston_1.format.simple()),
        }),
    ],
});
const handleError = (res, error, context) => {
    const message = error instanceof Error ? error.message : 'Unknown error';
    exports.logger.error('Error in %s: %s', context, message, {
        error,
        context,
    });
    if (error instanceof Error || typeof error === 'string') {
    }
    if (process.env.NODE_ENV !== 'production') {
        console.error(`Error in ${context}:`, error);
    }
    return res.status(500).json({
        error: 'Internal server error',
        details: process.env.NODE_ENV !== 'production' ? message : undefined,
    });
};
exports.default = {
    logger: exports.logger,
    handleError,
};
