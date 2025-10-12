"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.permissionsController = void 0;
const prisma_config_1 = __importDefault(require("../../../config/prisma.config"));
const logger_1 = require("../../../config/logger");
const getAppPermissions = async (req, res) => {
    try {
        const permissions = await prisma_config_1.default.appPermission.findMany();
        res.status(200).json(permissions);
    }
    catch (error) {
        logger_1.logger.e(error, 'Error fetching app permissions');
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
const addAppPermission = async (req, res) => {
    const data = req.body;
    if (!data) {
        logger_1.logger.w('No data provided for new app permission');
        return res.status(400).json({ error: 'No data provided' });
    }
    try {
        const newPermission = await prisma_config_1.default.appPermission.create({
            data: {
                name: data.name,
                description: data.description,
                category: data.category,
            },
        });
        const permissions = await prisma_config_1.default.appPermission.findMany();
        res.status(201).json({ newPermission, permissions });
    }
    catch (error) {
        logger_1.logger.e(error, 'Error adding app permission');
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.permissionsController = {
    getAppPermissions,
    addAppPermission,
};
