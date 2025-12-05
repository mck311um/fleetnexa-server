import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { RentalStatus, Tenant, User } from '../../generated/prisma/client.js';
import { BookingRepository } from './booking.repository.js';
import { NotFoundError } from 'rxjs';

@Injectable()
export class BookingService {
  private readonly logger = new Logger(BookingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly bookingRepo: BookingRepository,
  ) {}

  async getTenantBookings(tenant: Tenant) {
    try {
      return await this.bookingRepo.getBookings(tenant.id);
    } catch (error) {
      this.logger.error(error, 'Failed to get bookings', {
        tenantId: tenant.id,
        tenantCode: tenant.tenantCode,
      });
      throw new Error('Failed to get bookings');
    }
  }

  async getBookingById(bookingId: string, tenant: Tenant) {
    try {
      const booking = await this.bookingRepo.getBookingById(
        bookingId,
        tenant.id,
      );
      if (!booking) {
        throw new Error('Booking not found');
      }
      return booking;
    } catch (error) {
      this.logger.error(error, 'Failed to get booking by ID', {
        tenantId: tenant.id,
        tenantCode: tenant.tenantCode,
        bookingId,
      });
      throw new Error('Failed to get booking by ID');
    }
  }

  async updateBookingStatus(
    bookingId: string,
    status: RentalStatus,
    tenant: Tenant,
    user: User,
  ) {
    try {
      const booking = await this.prisma.rental.findUnique({
        where: { id: bookingId },
      });

      if (!booking) {
        throw new NotFoundError('Booking not found');
      }

      await this.prisma.rental.update({
        where: { id: bookingId },
        data: {
          status,
          updatedAt: new Date(),
          updatedBy: user.username,
        },
      });

      return;
    } catch (error) {
      this.logger.error(error, 'Failed to update booking status', {
        tenantId: tenant.id,
        tenantCode: tenant.tenantCode,
        bookingId,
        status,
      });
      throw new Error('Failed to update booking status');
    }
  }
}
