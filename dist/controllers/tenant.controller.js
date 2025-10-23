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
// #region Tenant Notifications
const getTenantNotifications = async (req, res, next) => {
    const tenantId = req.user?.tenantId;
    try {
        const notifications = await prisma_config_1.default.tenantNotification.findMany({
            where: { tenantId, isDeleted: false },
            orderBy: { createdAt: 'desc' },
        });
        res.status(200).json(notifications);
    }
    catch (error) {
        next(error);
    }
};
const markNotificationAsRead = async (req, res, next) => {
    const { id } = req.params;
    const tenantId = req.user?.tenantId;
    try {
        const notification = await prisma_config_1.default.tenantNotification.findUnique({
            where: { id, tenantId },
        });
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }
        await prisma_config_1.default.tenantNotification.update({
            where: { id },
            data: { read: true },
        });
        const notifications = await prisma_config_1.default.tenantNotification.findMany({
            where: { tenantId, isDeleted: false },
            orderBy: { createdAt: 'desc' },
        });
        res.status(200).json(notifications);
    }
    catch (error) {
        next(error);
    }
};
const markAllNotificationsAsRead = async (req, res, next) => {
    const tenantId = req.user?.tenantId;
    try {
        await prisma_config_1.default.tenantNotification.updateMany({
            where: { tenantId, read: false, isDeleted: false },
            data: { read: true },
        });
        const notifications = await prisma_config_1.default.tenantNotification.findMany({
            where: { tenantId, isDeleted: false },
            orderBy: { createdAt: 'desc' },
        });
        res.status(200).json(notifications);
    }
    catch (error) {
        next(error);
    }
};
const deleteNotification = async (req, res, next) => {
    const { id } = req.params;
    const tenantId = req.user?.tenantId;
    try {
        const notification = await prisma_config_1.default.tenantNotification.findUnique({
            where: { id, tenantId },
        });
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }
        await prisma_config_1.default.tenantNotification.update({
            where: { id },
            data: { isDeleted: true },
        });
        const notifications = await prisma_config_1.default.tenantNotification.findMany({
            where: { tenantId, isDeleted: false },
        });
        res.status(200).json(notifications);
    }
    catch (error) {
        next(error);
    }
};
//#endregion
exports.default = {
    getTenantReminders,
    addTenantReminder,
    updateTenantReminder,
    getTenantNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
};
