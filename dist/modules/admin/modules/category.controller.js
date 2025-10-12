"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoryController = void 0;
const prisma_config_1 = __importDefault(require("../../../config/prisma.config"));
const logger_1 = require("../../../config/logger");
const getPermissionCategories = async (req, res) => {
    try {
        const categories = await prisma_config_1.default.permissionCategory.findMany({
            include: { permissions: true, _count: true },
        });
        res.status(200).json(categories);
    }
    catch (error) {
        logger_1.logger.e(error, 'Error fetching permission categories');
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
const addPermissionCategory = async (req, res) => {
    const data = req.body;
    if (!data) {
        logger_1.logger.w('No data provided for new app permission');
        return res.status(400).json({ error: 'No data provided' });
    }
    try {
        const formattedName = data.name.trim().toUpperCase().replace(/\s+/g, '_');
        const existingCategory = await prisma_config_1.default.permissionCategory.findUnique({
            where: { name: formattedName },
        });
        if (existingCategory) {
            logger_1.logger.w(`Category with name ${formattedName} already exists`);
            return res.status(409).json({ error: 'Category already exists' });
        }
        const newCategory = await prisma_config_1.default.permissionCategory.create({
            data: {
                name: formattedName,
                description: data.description,
            },
        });
        const categories = await prisma_config_1.default.permissionCategory.findMany({
            include: { permissions: true, _count: true },
        });
        res.status(201).json({ newCategory, categories });
    }
    catch (error) {
        logger_1.logger.e(error, 'Error adding app permission');
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.categoryController = {
    getPermissionCategories,
    addPermissionCategory,
};
