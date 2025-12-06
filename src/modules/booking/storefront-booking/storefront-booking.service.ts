import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService, TxClient } from '../../../prisma/prisma.service.js';
import { StorefrontUserBookingDto } from './dto/storefront-user-booking.dto.js';
import {
  Agent,
  RentalStatus,
  StorefrontUser,
  Tenant,
} from '../../../generated/prisma/client.js';
import { StorefrontCustomerDto } from '../../../modules/customer/storefront-customer/storefront-customer.dto.js';
import { StorefrontCustomerService } from '../../../modules/customer/storefront-customer/storefront-customer.service.js';
import { GeneratorService } from '../../../common/generator/generator.service.js';
import { EmailService } from '../../../common/email/email.service.js';
import { TenantNotificationService } from '../../../modules/tenant/tenant-notification/tenant-notification.service.js';
import { StorefrontGuestBookingDto } from './dto/storefront-guest-booking.dto.js';

@Injectable()
export class StorefrontBookingService {
  private readonly logger = new Logger(StorefrontBookingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storefrontCustomer: StorefrontCustomerService,
    private readonly generator: GeneratorService,
    private readonly emailService: EmailService,
    private readonly tenantNotification: TenantNotificationService,
  ) {}

  async createUserBooking(data: StorefrontUserBookingDto) {
    const user = await this.getStorefrontUser(data.userId);
    const customerDto = await this.createCustomer(user);

    return this.createBooking({
      tenantId: data.tenantId,
      customer: customerDto,
      data,
    });
  }

  async createGuestBooking(data: StorefrontGuestBookingDto) {
    return this.createBooking({
      tenantId: data.tenantId,
      customer: data.customer,
      data,
    });
  }

  private async createCustomer(
    user: StorefrontUser,
  ): Promise<StorefrontCustomerDto> {
    try {
      const customer: StorefrontCustomerDto = {
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        gender: user.gender,
        phone: user.phone,
        driverLicenseNumber: user.driverLicenseNumber,
        licenseExpiry: user.licenseExpiry?.toISOString() || '',
        licenseIssued: user.licenseIssued?.toISOString() || '',
        dateOfBirth: user.dateOfBirth?.toISOString() || '',
      };

      return customer;
    } catch (error) {
      this.logger.error(error, 'Failed to create storefront customer', {
        userId: user.id,
      });
      throw new Error('Failed to create storefront customer');
    }
  }

  private async createBooking({ tenantId, customer, data }) {
    try {
      const booking = await this.prisma.$transaction(async (tx) => {
        const tenant = await this.getTenant(tx, tenantId);

        const customerRecord = await this.storefrontCustomer.getCustomer(
          customer,
          tenant,
          tx,
        );

        const { bookingNumber, bookingCode } =
          await this.generateIdentifiers(tenant);

        const chargeType = await this.getChargeType(tx);

        const newBooking = await tx.rental.create({
          data: {
            startDate: new Date(data.startDate),
            endDate: new Date(data.endDate),
            pickupLocationId: data.pickupLocationId,
            returnLocationId: data.returnLocationId,
            vehicleId: data.vehicleId,
            chargeTypeId: chargeType.id,
            bookingCode,
            createdAt: new Date(),
            rentalNumber: bookingNumber,
            tenantId: tenant.id,
            status: RentalStatus.PENDING,
            agent: Agent.STOREFRONT,
            drivers: {
              create: {
                driverId: customerRecord.id,
                isPrimary: true,
              },
            },
          },
          select: { id: true, tenant: true },
        });

        await this.createValuesAndExtras(tx, data.values, newBooking.id);

        return newBooking;
      });

      await this.sendNotifications(booking);
      return this.getBookingDetails(booking.id);
    } catch (error) {
      this.logger.error(error, 'Failed to create storefront booking', {
        tenantId,
        data,
      });
      throw new Error('Failed to create storefront booking');
    }
  }

  private async getTenant(tx: TxClient, tenantId: string) {
    const tenant = await tx.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) throw new NotFoundException('Tenant not found');
    return tenant;
  }

  private async getStorefrontUser(userId: string) {
    const user = await this.prisma.storefrontUser.findUnique({
      where: { id: userId },
    });

    if (!user) throw new NotFoundException('Storefront user not found');
    return user;
  }

  private async generateIdentifiers(tenant: Tenant) {
    const bookingNumber = await this.generator.generateBookingNumber(tenant.id);
    if (!bookingNumber) throw new Error('Failed to generate booking number');

    const bookingCode = await this.generator.generateBookingCode(
      tenant.tenantCode,
      bookingNumber,
    );
    if (!bookingCode) throw new Error('Failed to generate booking code');

    return { bookingNumber, bookingCode };
  }

  private async getChargeType(tx: TxClient) {
    const chargeType = await tx.chargeType.findFirst({
      where: { unit: 'day' },
    });

    if (!chargeType) {
      throw new NotFoundException(
        'No charge type found for storefront booking',
      );
    }
    return chargeType;
  }

  private async createValuesAndExtras(tx, values, rentalId: string) {
    const { extras, ...valueData } = values;

    const createdValue = await tx.values.create({
      data: {
        ...valueData,
        discountPolicy: values.discountPolicy || '',
        rentalId,
      },
    });

    if (extras && extras.length > 0) {
      await Promise.all(
        extras.map((extra) =>
          tx.rentalExtra.create({
            data: {
              ...extra,
              valueId: createdValue.id,
            },
          }),
        ),
      );
    }
  }

  private async sendNotifications(booking: any) {
    const tasks = [
      this.emailService.sendBookingCompletedEmail(booking.id, booking.tenant),
      this.emailService.sendNewBookingEmail(booking.id, booking.tenant),
      this.tenantNotification.sendBookingNotification(
        booking.id,
        booking.tenant,
      ),
    ];

    const results = await Promise.allSettled(tasks);

    results.forEach((r, i) => {
      if (r.status === 'rejected') {
        this.logger.error(
          r.reason,
          `Notification #${i + 1} failed unexpectedly`,
          {
            bookingId: booking.id,
          },
        );
      }
    });
  }
  private async getBookingDetails(bookingId: string) {
    return this.prisma.rental.findUnique({
      where: { id: bookingId },
      select: {
        startDate: true,
        endDate: true,
        id: true,
        rentalNumber: true,
        bookingCode: true,
        tenant: {
          select: {
            id: true,
            tenantName: true,
            email: true,
            number: true,
            currency: true,
            currencyRates: {
              include: {
                currency: true,
              },
            },
          },
        },
        vehicle: {
          select: {
            year: true,
            brand: true,
            model: true,
            tenant: { select: { currency: true } },
          },
        },
        pickup: true,
        values: { select: { netTotal: true } },
      },
    });
  }
}
