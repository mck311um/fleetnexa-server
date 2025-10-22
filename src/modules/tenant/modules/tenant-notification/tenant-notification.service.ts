import { Tenant } from '@prisma/client';
import { logger } from '../../../../config/logger';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../../../../config/prisma.config';
import formatter from '../../../../utils/formatter';
import app from '../../../../app';

class TenantNotificationService {
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
          read: false,
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
      throw new Error('Failed to send booking notification');
    }
  }
}

export const tenantNotificationService = new TenantNotificationService();
