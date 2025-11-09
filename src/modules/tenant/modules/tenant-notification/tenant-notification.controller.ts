import { Request, Response } from 'express';
import { tenantNotificationService } from './tenant-notification.service';
import { logger } from '../../../../config/logger';

const getNotifications = async (req: Request, res: Response) => {
  const { tenant, user } = req.context!;
  try {
    const notifications = await tenantNotificationService.getNotifications(
      tenant,
      user,
    );

    res.status(200).json(notifications);
  } catch (error: any) {
    logger.e(error, 'Failed to get notifications', { tenantId: tenant.id });
    res.status(500).json({ message: error.message });
  }
};

const markNotificationAsRead = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { tenant, user } = req.context!;

  try {
    await tenantNotificationService.markNotificationAsRead(id, tenant, user);

    const notifications = await tenantNotificationService.getNotifications(
      tenant,
      user,
    );

    res
      .status(200)
      .json({ message: 'Notification marked as read', notifications });
  } catch (error: any) {
    logger.e(error, 'Failed to mark notification as read', {
      tenantId: tenant.id,
    });
    res.status(500).json({ message: error.message });
  }
};

const markAllNotificationsAsRead = async (req: Request, res: Response) => {
  const { tenant, user } = req.context!;

  try {
    await tenantNotificationService.markAllNotificationsAsRead(tenant, user);

    const notifications = await tenantNotificationService.getNotifications(
      tenant,
      user,
    );

    res
      .status(200)
      .json({ message: 'All notifications marked as read', notifications });
  } catch (error: any) {
    logger.e(error, 'Failed to mark all notifications as read', {
      tenantId: tenant.id,
    });
    res.status(500).json({ message: error.message });
  }
};

const deleteNotification = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { tenant, user } = req.context!;

  try {
    await tenantNotificationService.deleteNotification(id, tenant);

    const notifications = await tenantNotificationService.getNotifications(
      tenant,
      user,
    );

    res.status(200).json({ message: 'Notification deleted', notifications });
  } catch (error: any) {
    logger.e(error, 'Failed to delete notification', {
      tenantId: tenant.id,
    });
    res.status(500).json({ message: error.message });
  }
};

export default {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
};
