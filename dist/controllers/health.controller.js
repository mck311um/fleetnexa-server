"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_config_1 = __importDefault(require("../config/prisma.config"));
const logger_config_1 = __importDefault(require("../config/logger.config"));
const healthCheck = async (req, res) => {
    try {
        await prisma_config_1.default.$queryRaw `SELECT 1`;
        if (req.method === 'HEAD') {
            return res.sendStatus(200); // Only headers, no body
        }
        res.status(200).json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            services: {
                database: 'connected',
            },
        });
    }
    catch (error) {
        logger_config_1.default.logger.error('Health check failed:', error);
        if (req.method === 'HEAD') {
            return res.sendStatus(500);
        }
        res.status(500).json({
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            services: {
                database: 'disconnected',
            },
        });
    }
};
exports.default = { healthCheck };
