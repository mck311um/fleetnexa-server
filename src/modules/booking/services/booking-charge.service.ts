import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { CreateBookingChargeDto } from '../dto/booking-charge.dto';
import { BookingCalculationService } from './booking-calculation.service';
import { BookingRepository } from '../booking.repository';

@Injectable()
export class BookingChargeService {
  private readonly logger = new Logger(BookingChargeService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly calculationService: BookingCalculationService,
    private readonly bookingRepo: BookingRepository,
  ) {}

  async addBookingCharge(
    data: CreateBookingChargeDto,
    tenantId: string,
    userId: string,
  ) {
    try {
      const values = await this.prisma.values.findUnique({
        where: { rentalId: data.rentalId },
      });

      if (!values) {
        this.logger.error(
          `Values record not found for rentalId: ${data.rentalId}`,
        );
        throw new NotFoundException(
          'Values record not found for the given rentalId',
        );
      }

      await this.prisma.rentalCharge.create({
        data: {
          amount: data.amount,
          charge: data.charge,
          reason: data.reason,
          valueId: values.id,
          customerId: data.customerId,
        },
      });

      await this.calculationService.recalculateAmountDue(values.id);
      const updatedBooking = await this.bookingRepo.getBookingById(
        data.rentalId,
      );
      const bookings = await this.bookingRepo.getBookings(tenantId);

      return {
        message: 'Booking charge added successfully',
        updatedBooking,
        bookings,
      };
    } catch (error: any) {
      this.logger.error('Error adding booking charge', error);
      throw error;
    }
  }
}
