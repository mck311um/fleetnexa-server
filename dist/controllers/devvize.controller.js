"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_config_1 = __importDefault(require("../config/prisma.config"));
const addAppPermission = async (req, res, next) => {
    try {
        const permissions = req.body;
        if (!Array.isArray(permissions)) {
            return res
                .status(400)
                .json({ message: 'Input should be an array of permissions' });
        }
        for (const permission of permissions) {
            if (!permission.name || !permission.description || !permission.category) {
                return res.status(400).json({
                    message: 'All permissions must have name, description, and category',
                    invalidPermission: permission,
                });
            }
        }
        const result = await prisma_config_1.default.appPermission.createMany({
            data: permissions,
            skipDuplicates: true,
        });
        res.status(201).json(result);
    }
    catch (error) {
        next(error);
    }
};
exports.default = {
    addAppPermission,
};
