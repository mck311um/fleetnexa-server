"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.plansController = void 0;
const prisma_config_1 = __importDefault(require("../../../config/prisma.config"));
const logger_1 = require("../../../config/logger");
const getPlans = async (req, res) => {
    try {
        const plans = await prisma_config_1.default.subscriptionPlan.findMany();
        res.json(plans);
    }
    catch (error) {
        logger_1.logger.e(error, 'Error fetching subscription plans');
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.plansController = {
    getPlans,
};
