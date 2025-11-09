import { Tenant, User } from '@prisma/client';
import { logger } from '../../../../config/logger';
import prisma from '../../../../config/prisma.config';
import formatter from '../../../../utils/formatter';
import app from '../../../../app';

class TenantNotificationService {
  async getNotifications(tenant: Tenant, user: User) {
    try {
      const notifications = await prisma.tenantNotification.findMany({
        where: { tenantId: tenant.id, isDeleted: false },
        orderBy: { createdAt: 'desc' },
        include: {
          readByUsers: true,
        },
      });

      const notificationsWithReadStatus = await Promise.all(
        notifications.map(async (notification) => {
          const readStatus = await prisma.notificationReadStatus.findUnique({
            where: {
              notificationId_userId: {
                notificationId: notification.id,
                userId: user.id,
              },
            },
          });

          return {
            ...notification,
            isRead: !!readStatus,
          };
        }),
      );

      return notificationsWithReadStatus;
    } catch (error) {
      logger.e(error, 'Failed to get notifications', { tenantId: tenant.id });
      throw error;
    }
  }

  async sendBookingNotification(bookingId: string, tenant: Tenant) {
    try {
      const booking = await prisma.rental.findUnique({
        where: { id: bookingId, tenantId: tenant.id },
        include: {
          vehicle: {
            include: {
              brand: true,
              model: true,
            },
          },
          drivers: {
            where: { isPrimary: true },
            include: {
              customer: true,
            },
          },
        },
      });

      if (!booking) {
        throw new Error('Booking not found');
      }

      const bookingNumber = booking?.rentalNumber;
      const actionUrl = `/app/bookings/${bookingNumber}`;
      const driverName = booking.drivers[0]?.customer
        ? `${booking.drivers[0].customer.firstName} ${booking.drivers[0].customer.lastName}`
        : 'Valued Customer';
      const vehicleName = `${booking.vehicle.brand.brand} ${booking.vehicle.model.model}`;
      const fromDate = formatter.formatDateToFriendlyDateShort(
        new Date(booking.startDate),
      );
      const toDate = formatter.formatDateToFriendlyDateShort(
        new Date(booking.endDate),
      );
      const message = `${driverName} just submitted a booking request for a ${vehicleName}, scheduled from ${fromDate} to ${toDate}, via your storefront.`;

      const notification = await prisma.tenantNotification.create({
        data: {
          tenantId: tenant.id,
          title: 'New Booking Request',
          type: 'BOOKING',
          priority: 'HIGH',
          message,
          actionUrl,
          createdAt: new Date(),
        },
      });

      const io = app.get('io');
      io.to(tenant.id).emit('tenant-notification', notification);
    } catch (error) {
      logger.e(error, 'Failed to send booking notification', {
        bookingId,
        tenantId: tenant.id,
      });
      throw error;
    }
  }

  async markNotificationAsRead(
    notificationId: string,
    tenant: Tenant,
    user: User,
  ) {
    try {
      const notification = await prisma.tenantNotification.findUnique({
        where: { id: notificationId, tenantId: tenant.id },
      });

      if (!notification) {
        logger.w('Notification not found', {
          notificationId,
          tenantId: tenant.id,
        });
        throw new Error('Notification not found');
      }

      await prisma.notificationReadStatus.upsert({
        where: {
          notificationId_userId: {
            notificationId: notificationId,
            userId: user.id,
          },
        },
        create: {
          notificationId: notification.id,
          userId: user.id,
        },
        update: {},
      });
    } catch (error) {
      logger.e(error, 'Failed to mark notification as read', {
        notificationId,
        tenantId: tenant.id,
        userId: user.id,
      });
      throw error;
    }
  }

  async markAllNotificationsAsRead(tenant: Tenant, user: User) {
    try {
      const notifications = await prisma.tenantNotification.findMany({
        where: { tenantId: tenant.id, isDeleted: false },
      });

      const readStatusPromises = notifications.map((notification) =>
        prisma.notificationReadStatus.upsert({
          where: {
            notificationId_userId: {
              notificationId: notification.id,
              userId: user.id,
            },
          },
          create: {
            notificationId: notification.id,
            userId: user.id,
          },
          update: {},
        }),
      );

      await Promise.all(readStatusPromises);
    } catch (error) {
      logger.e(error, 'Failed to mark all notifications as read', {
        tenantId: tenant.id,
        userId: user.id,
      });
      throw error;
    }
  }

  async deleteNotification(notificationId: string, tenant: Tenant) {
    try {
      const notification = await prisma.tenantNotification.findUnique({
        where: { id: notificationId, tenantId: tenant.id },
      });

      if (!notification) {
        logger.w('Notification not found for deletion', {
          notificationId,
          tenantId: tenant.id,
        });
        throw new Error('Notification not found');
      }

      await prisma.tenantNotification.update({
        where: { id: notificationId },
        data: { isDeleted: true },
      });
    } catch (error) {
      logger.e(error, 'Failed to delete notification', {
        notificationId,
        tenantId: tenant.id,
      });
      throw error;
    }
  }
}

export const tenantNotificationService = new TenantNotificationService();
