"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tenant_notification_service_1 = require("./tenant-notification.service");
const logger_1 = require("../../../../config/logger");
const getNotifications = async (req, res) => {
    const { tenant, user } = req.context;
    try {
        const notifications = await tenant_notification_service_1.tenantNotificationService.getNotifications(tenant, user);
        res.status(200).json(notifications);
    }
    catch (error) {
        logger_1.logger.e(error, 'Failed to get notifications', { tenantId: tenant.id });
        res.status(500).json({ message: error.message });
    }
};
const markNotificationAsRead = async (req, res) => {
    const { id } = req.params;
    const { tenant, user } = req.context;
    try {
        await tenant_notification_service_1.tenantNotificationService.markNotificationAsRead(id, tenant, user);
        const notifications = await tenant_notification_service_1.tenantNotificationService.getNotifications(tenant, user);
        res
            .status(200)
            .json({ message: 'Notification marked as read', notifications });
    }
    catch (error) {
        logger_1.logger.e(error, 'Failed to mark notification as read', {
            tenantId: tenant.id,
        });
        res.status(500).json({ message: error.message });
    }
};
const markAllNotificationsAsRead = async (req, res) => {
    const { tenant, user } = req.context;
    try {
        await tenant_notification_service_1.tenantNotificationService.markAllNotificationsAsRead(tenant, user);
        const notifications = await tenant_notification_service_1.tenantNotificationService.getNotifications(tenant, user);
        res
            .status(200)
            .json({ message: 'All notifications marked as read', notifications });
    }
    catch (error) {
        logger_1.logger.e(error, 'Failed to mark all notifications as read', {
            tenantId: tenant.id,
        });
        res.status(500).json({ message: error.message });
    }
};
const deleteNotification = async (req, res) => {
    const { id } = req.params;
    const { tenant, user } = req.context;
    try {
        await tenant_notification_service_1.tenantNotificationService.deleteNotification(id, tenant);
        const notifications = await tenant_notification_service_1.tenantNotificationService.getNotifications(tenant, user);
        res.status(200).json({ message: 'Notification deleted', notifications });
    }
    catch (error) {
        logger_1.logger.e(error, 'Failed to delete notification', {
            tenantId: tenant.id,
        });
        res.status(500).json({ message: error.message });
    }
};
exports.default = {
    getNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
};
