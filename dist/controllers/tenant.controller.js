"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_config_1 = __importDefault(require("../config/prisma.config"));
const logger_1 = require("../config/logger");
// #region Tenant Reminders
const getTenantReminders = async (req, res, next) => {
    const tenantId = req.user?.tenantId;
    try {
        const reminders = await prisma_config_1.default.tenantReminders.findMany({
            where: { tenantId: tenantId },
        });
        res.status(200).json(reminders);
    }
    catch (error) {
        next(error);
    }
};
const addTenantReminder = async (req, res) => {
    const tenantId = req.user?.tenantId;
    try {
        // const newReminder = await prisma.tenantReminders.create({
        //   data: {
        //     reminder,
        //     date: new Date(date),
        //     tenantId: tenantId!,
        //     updatedBy: userId,
        //     createdAt: new Date(),
        //     updatedAt: new Date(),
        //   },
        // });
        const reminders = await prisma_config_1.default.tenantReminders.findMany({
            where: { tenantId: tenantId },
            orderBy: { date: 'asc' },
        });
        res.status(201).json(reminders);
    }
    catch (error) {
        logger_1.logger.e(error, 'Error adding tenant reminder');
    }
};
const updateTenantReminder = async (req, res) => {
    const { id } = req.params;
    const userId = req.user?.id;
    const tenantId = req.user?.tenantId;
    try {
        const existingReminder = await prisma_config_1.default.tenantReminders.findUnique({
            where: { id },
        });
        await prisma_config_1.default.tenantReminders.update({
            where: { id },
            data: {
                completed: !existingReminder?.completed,
                completedAt: new Date(),
                updatedBy: userId,
                updatedAt: new Date(),
            },
        });
        const reminders = await prisma_config_1.default.tenantReminders.findMany({
            where: { tenantId: tenantId },
            orderBy: { date: 'asc' },
        });
        res.status(200).json(reminders);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating tenant reminder' });
    }
};
// #endregion
exports.default = {
    getTenantReminders,
    addTenantReminder,
    updateTenantReminder,
};
