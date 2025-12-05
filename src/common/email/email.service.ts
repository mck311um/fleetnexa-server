import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service.js';
import { NotifyService } from '../notify/notify.service.js';
import { Tenant } from 'src/generated/prisma/client.js';
import { BookingCompletedEmailParams } from 'src/types/email.js';
import { FormatterService } from '../formatter/formatter.service.js';
import { SendEmailDto } from '../notify/dto/send-email.dto.js';
import { CustomerService } from 'src/modules/customer/customer.service.js';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notify: NotifyService,
    private readonly formatter: FormatterService,
    private readonly customerService: CustomerService,
  ) {}

  async sendBookingCompletedEmail(bookingId: string, tenant: Tenant) {
    try {
      const booking = await this.prisma.rental.findUnique({
        where: { id: bookingId, tenantId: tenant.id },
        include: {
          values: true,
          pickup: true,
          vehicle: {
            include: {
              brand: true,
              model: true,
            },
          },
        },
      });

      if (!booking) {
        throw new NotFoundException('Booking not found');
      }

      let currency;

      if (!tenant.currencyId) {
        currency = await this.prisma.currency.findFirst({
          where: { code: 'USD' },
        });
      } else {
        currency = await this.prisma.currency.findUnique({
          where: { id: tenant.currencyId },
        });
      }

      const primaryDriver = await this.customerService.getPrimaryDriver(
        booking.id,
      );

      const templateData: BookingCompletedEmailParams = {
        bookingId: booking?.bookingCode || '',
        startDate:
          this.formatter.formatDateToFriendlyDate(booking?.startDate) || '',
        pickupTime:
          this.formatter.formatDateToFriendlyTime(booking?.startDate) || '',
        endDate:
          this.formatter.formatDateToFriendlyDate(booking?.endDate) || '',
        pickupLocation: booking?.pickup.location || '',
        totalPrice: this.formatter.formatNumberToTenantCurrency(
          booking?.values?.netTotal || 0,
          currency?.code || 'USD',
        ),
        tenantName: tenant?.tenantName || '',
        phone: tenant?.number || '',
        vehicle: this.formatter.formatVehicleToFriendly(booking?.vehicle) || '',
        email: tenant?.email || '',
      };

      const payload: SendEmailDto = {
        recipients: [primaryDriver?.customer.email || ''],
        cc: [],
        templateName: 'RentNexaBookingCompleted',
        templateData,
        sender: 'no-reply@rentnexa.com',
        senderName: 'RentNexa',
      };

      await this.notify.sendEmail(payload);
    } catch (error) {
      this.logger.error('Error sending booking completed email', error);
      throw error;
    }
  }
}
