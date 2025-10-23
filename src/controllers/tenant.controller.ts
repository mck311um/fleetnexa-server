import { NextFunction, Request, Response } from 'express';
import { tenantRepo } from '../repository/tenant.repository';
import prisma from '../config/prisma.config';
import generator from '../services/generator.service';
import bcrypt from 'bcrypt';
import emailService from '../services/ses.service';
import { WelcomeEmailParams } from '../types/email';
import { logger } from '../config/logger';
import { v4 as uuidv4 } from 'uuid';

// #region Tenant Reminders
const getTenantReminders = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const tenantId = req.user?.tenantId;
  try {
    const reminders = await prisma.tenantReminders.findMany({
      where: { tenantId: tenantId },
    });

    res.status(200).json(reminders);
  } catch (error) {
    next(error);
  }
};
const addTenantReminder = async (req: Request, res: Response) => {
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

    const reminders = await prisma.tenantReminders.findMany({
      where: { tenantId: tenantId },
      orderBy: { date: 'asc' },
    });

    res.status(201).json(reminders);
  } catch (error) {
    logger.e(error, 'Error adding tenant reminder');
  }
};
const updateTenantReminder = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;
  const tenantId = req.user?.tenantId;
  try {
    const existingReminder = await prisma.tenantReminders.findUnique({
      where: { id },
    });

    await prisma.tenantReminders.update({
      where: { id },
      data: {
        completed: !existingReminder?.completed,
        completedAt: new Date(),
        updatedBy: userId,
        updatedAt: new Date(),
      },
    });

    const reminders = await prisma.tenantReminders.findMany({
      where: { tenantId: tenantId },
      orderBy: { date: 'asc' },
    });

    res.status(200).json(reminders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating tenant reminder' });
  }
};
// #endregion

// #region Tenant Notifications
const getTenantNotifications = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const tenantId = req.user?.tenantId;
  try {
    const notifications = await prisma.tenantNotification.findMany({
      where: { tenantId, isDeleted: false },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json(notifications);
  } catch (error) {
    next(error);
  }
};
const markNotificationAsRead = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { id } = req.params;
  const tenantId = req.user?.tenantId;
  try {
    const notification = await prisma.tenantNotification.findUnique({
      where: { id, tenantId },
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    await prisma.tenantNotification.update({
      where: { id },
      data: { read: true },
    });

    const notifications = await prisma.tenantNotification.findMany({
      where: { tenantId, isDeleted: false },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json(notifications);
  } catch (error) {
    next(error);
  }
};
const markAllNotificationsAsRead = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const tenantId = req.user?.tenantId;
  try {
    await prisma.tenantNotification.updateMany({
      where: { tenantId, read: false, isDeleted: false },
      data: { read: true },
    });

    const notifications = await prisma.tenantNotification.findMany({
      where: { tenantId, isDeleted: false },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json(notifications);
  } catch (error) {
    next(error);
  }
};
const deleteNotification = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { id } = req.params;
  const tenantId = req.user?.tenantId;
  try {
    const notification = await prisma.tenantNotification.findUnique({
      where: { id, tenantId },
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    await prisma.tenantNotification.update({
      where: { id },
      data: { isDeleted: true },
    });

    const notifications = await prisma.tenantNotification.findMany({
      where: { tenantId, isDeleted: false },
    });

    res.status(200).json(notifications);
  } catch (error) {
    next(error);
  }
};
//#endregion

export default {
  getTenantReminders,
  addTenantReminder,
  updateTenantReminder,
  getTenantNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
};
