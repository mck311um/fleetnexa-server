import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { NotifyService } from '../notify/notify.service.js';
import { Tenant } from '../../generated/prisma/client.js';
import { FormatterService } from '../formatter/formatter.service.js';
import { SendEmailDto } from '../notify/dto/send-email.dto.js';
import { CustomerService } from '../../modules/customer/customer.service.js';
import {
  BookingCompletedEmailDto,
  NewBookingEmailDto,
} from '../../types/email.js';

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

      const templateData: BookingCompletedEmailDto = {
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

  async sendNewBookingEmail(bookingId: string, tenant: Tenant) {
    try {
      const booking = await this.prisma.rental.findUnique({
        where: { id: bookingId, tenantId: tenant.id },
        include: {
          values: true,
          pickup: true,
          return: true,
          tenant: true,
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

      const customerAddress = primaryDriver?.customer.address?.street || '';

      const templateData: NewBookingEmailDto = {
        bookingId: booking.bookingCode || '',
        bookingDate: this.formatter.formatDateToFriendlyDate(booking.createdAt),
        vehicle: this.formatter.formatVehicleToFriendly(booking?.vehicle),
        totalPrice: this.formatter.formatNumberToTenantCurrency(
          booking?.values?.netTotal || 0,
          currency?.code || 'USD',
        ),
        customerName: `${primaryDriver?.customer.firstName || ''} ${
          primaryDriver?.customer.lastName || ''
        }`,
        customerEmail: primaryDriver?.customer.email || '',
        customerPhone: primaryDriver?.customer.phone || '',
        driverLicense: primaryDriver?.customer.license?.licenseNumber || '',
        customerAddress: customerAddress,
        startDate: this.formatter.formatDateToFriendlyDate(booking?.startDate),
        endDate:
          this.formatter.formatDateToFriendlyDate(booking?.endDate) || '',
        pickupLocation: booking?.pickup.location || '',
        pickupTime:
          this.formatter.formatDateToFriendlyTime(booking?.startDate) || '',
        returnTime:
          this.formatter.formatDateToFriendlyTime(booking?.endDate) || '',
        returnLocation: booking?.return.location || '',
        rentalDuration: `${booking.values?.numberOfDays} day(s)`,
        vehiclePrice: this.formatter.formatNumberToTenantCurrency(
          booking.values?.totalCost || 0,
          currency?.code || 'USD',
        ),
        additionsTotal: this.formatter.formatNumberToTenantCurrency(
          booking.values?.totalExtras || 0,
          currency?.code || 'USD',
        ),
        securityDeposit: this.formatter.formatNumberToTenantCurrency(
          booking.values?.deposit || 0,
          currency?.code || 'USD',
        ),
      };

      const payload: SendEmailDto = {
        recipients: [tenant.email || ''],
        cc: [],
        templateName: 'RentNexaNewBooking',
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
