"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoryController = void 0;
const prisma_config_1 = __importDefault(require("../../../config/prisma.config"));
const logger_1 = require("../../../config/logger");
const XLSX = __importStar(require("xlsx"));
const validateExcelColumns_1 = require("../../../utils/validateExcelColumns");
const formatName = (name) => {
    return name.trim().toUpperCase().replace(/\s+/g, '_');
};
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
const bulkAddPermissionCategories = async (req, res) => {
    try {
        if (!req.file) {
            logger_1.logger.w('No file uploaded for bulk category import');
            return res.status(400).json({ message: 'No file uploaded' });
        }
        const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(sheet);
        const valid = (0, validateExcelColumns_1.validateExcelColumns)(data, ['category', 'description'], res, logger_1.logger);
        if (!valid)
            return;
        for (const item of data) {
            const category = item.category;
            const description = item.description;
            if (!category || !description) {
                logger_1.logger.w(`Skipping invalid row: ${JSON.stringify(item)}`);
                continue;
            }
            const formattedName = formatName(category);
            const existingCategory = await prisma_config_1.default.permissionCategory.findUnique({
                where: { name: formattedName },
            });
            if (existingCategory) {
                logger_1.logger.w(`Category with name ${formattedName} already exists. Skipping.`);
                continue;
            }
            await prisma_config_1.default.permissionCategory.create({
                data: {
                    name: formattedName,
                    description: description,
                },
            });
        }
        const categories = await prisma_config_1.default.permissionCategory.findMany({
            include: { permissions: true, _count: true },
        });
        res
            .status(201)
            .json({ message: 'Categories imported successfully', categories });
    }
    catch (error) {
        logger_1.logger.e(error, 'Error during bulk category import');
        res.status(500).json({ message: 'Internal Server Error' });
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
    bulkAddPermissionCategories,
};
