import { Global, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { NotifyService } from '../notify/notify.service.js';
import { SendWhatsAppDto } from '../notify/dto/send-whatsapp.dto.js';
import { CustomerService } from '../../modules/customer/customer.service.js';
import { format, toZonedTime } from 'date-fns-tz';
import { SentDmService } from '../../sentdm/sentdm.service.js';
import { BookingRequestTemplate } from 'src/sentdm/sent-dm-templates.js';
import { SentDmDto } from '../../sentdm/sentdm.dto.js';
import { ConfigService } from '@nestjs/config';

@Global()
@Injectable()
export class WhatsappService {
  private readonly logger = new Logger(WhatsappService.name);

  private readonly fleetnexaProfileId: string;
  private readonly rentnexaProfileId: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly notify: NotifyService,
    private readonly customer: CustomerService,
    private readonly sentDm: SentDmService,
    private readonly configService: ConfigService,
  ) {
    this.fleetnexaProfileId =
      this.configService.get<string>('FLEETNEXA_PROFILE_ID') || '';
    this.rentnexaProfileId =
      this.configService.get<string>('RENTNEXA_PROFILE_ID') || '';
  }

  async sendBookingDocuments(data: SendWhatsAppDto) {
    try {
      await this.notify.sendWhatsapp(data);
    } catch (error) {
      this.logger.error(error, 'Failed to send booking documents', {
        data,
      });
      throw error;
    }
  }

  async sendBookingRequestNotification(bookingId: string) {
    try {
      const booking = await this.prisma.rental.findUnique({
        where: { id: bookingId },
        select: {
          bookingCode: true,
          tenant: true,
          startDate: true,
          endDate: true,
          vehicle: {
            select: {
              brand: true,
              model: true,
              year: true,
              licensePlate: true,
            },
          },
        },
      });

      if (!booking?.tenant.whatsappNumber) {
        this.logger.warn('Tenant does not have a WhatsApp number', {
          bookingId,
        });
        return {
          success: false,
          message: 'Tenant does not have a WhatsApp number',
        };
      }

      const primaryDriver = await this.customer.getPrimaryDriver(bookingId);

      const vehicle = `${booking?.vehicle.year} ${booking?.vehicle.brand.brand} ${booking?.vehicle.model.model} (${booking?.vehicle.licensePlate})`;
      const customer = `${primaryDriver?.customer.firstName} ${primaryDriver?.customer.lastName}`;

      const localStartDate = booking?.startDate
        ? toZonedTime(booking.startDate, 'America/Dominica')
        : '';

      const formattedStartDate = format(
        localStartDate,
        'EEE, MMM d, yyyy hh:mm aa',
      );

      const localEndDate = booking?.endDate
        ? toZonedTime(booking.endDate, 'America/Dominica')
        : '';
      const formattedEndDate = format(
        localEndDate,
        'EEE, MMM d, yyyy hh:mm aa',
      );

      const data: BookingRequestTemplate = {
        customer: customer,
        vehicle: vehicle,
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        bookingId: booking?.bookingCode || '',
        provider: booking?.tenant.tenantName || '',
      };

      const dmData: SentDmDto = {
        to: booking?.tenant.whatsappNumber,
        profileId: this.fleetnexaProfileId,
        templateId: 'cbcd4b5c-2153-4b48-83ed-7f08aafec6d6',
      };

      await this.sentDm.sendBookingRequest(data, dmData);

      this.logger.log('Sent WhatsApp booking request notification');
    } catch (error) {
      this.logger.error(error, 'Failed to send WhatsApp booking notification', {
        bookingId,
      });
      throw error;
    }
  }
}
