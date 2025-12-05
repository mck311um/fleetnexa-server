import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service.js';
import { StorefrontUserBookingDto } from './storefront-user-booking.dto.js';
import {
  Agent,
  RentalStatus,
  StorefrontUser,
  Tenant,
} from '../../../generated/prisma/client.js';
import { StorefrontCustomerDto } from 'src/modules/customer/storefront-customer/storefront-customer.dto.js';
import { StorefrontCustomerService } from 'src/modules/customer/storefront-customer/storefront-customer.service.js';
import { GeneratorService } from 'src/common/generator/generator.service.js';
import { NotifyService } from 'src/common/notify/notify.service.js';
import { BookingCompletedEmailParams } from 'src/types/email.js';

@Injectable()
export class StorefrontBookingService {
  private readonly logger = new Logger(StorefrontBookingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storefrontCustomer: StorefrontCustomerService,
    private readonly generator: GeneratorService,
    private readonly notify: NotifyService,
  ) {}

  async createUserBooking(data: StorefrontUserBookingDto, tenant: Tenant) {
    try {
      const booking = await this.prisma.$transaction(async (tx) => {
        const user = await tx.storefrontUser.findUnique({
          where: { id: data.userId },
        });

        if (!user) {
          this.logger.warn('Storefront user not found', {
            userId: data.userId,
          });
          throw new Error('Storefront user not found');
        }

        const customerDto = await this.createCustomer(user);
        const customer = await this.storefrontCustomer.getCustomer(
          customerDto,
          tenant,
          tx,
        );

        const bookingNumber = await this.generator.generateBookingNumber(
          tenant.id,
        );

        if (!bookingNumber) {
          this.logger.warn('Failed to generate booking number', {
            tenantId: tenant.id,
          });
          throw new Error('Failed to generate booking code');
        }

        const bookingCode = await this.generator.generateBookingCode(
          tenant.tenantCode,
          bookingNumber,
        );

        if (!bookingCode) {
          this.logger.warn('Failed to generate booking code', {
            tenantId: tenant.id,
            bookingNumber,
          });
          throw new Error('Failed to generate booking code');
        }

        const chargeType = await tx.chargeType.findFirst({
          where: { unit: 'day' },
        });

        if (!chargeType) {
          this.logger.warn('No charge type found for storefront booking');
          throw new NotFoundException(
            'No charge type found for storefront booking',
          );
        }

        const newBooking = await tx.rental.create({
          data: {
            startDate: new Date(data.startDate),
            endDate: new Date(data.endDate),
            pickupLocationId: data.pickupLocationId,
            returnLocationId: data.returnLocationId,
            vehicleId: data.vehicleId,
            chargeTypeId: chargeType?.id,
            bookingCode,
            createdAt: new Date(),
            rentalNumber: bookingNumber,
            tenantId: tenant.id,
            status: RentalStatus.PENDING,
            agent: Agent.STOREFRONT,
            drivers: {
              create: {
                driverId: customer!.id,
                isPrimary: true,
              },
            },
          },
        });

        await tx.values.create({
          data: {
            id: data.values.id,
            numberOfDays: data.values.numberOfDays,
            basePrice: data.values.basePrice,
            customBasePrice: data.values.customBasePrice,
            totalCost: data.values.totalCost,
            customTotalCost: data.values.customTotalCost,
            discount: data.values.discount,
            customDiscount: data.values.customDiscount,
            deliveryFee: data.values.deliveryFee,
            customDeliveryFee: data.values.customDeliveryFee,
            collectionFee: data.values.collectionFee,
            customCollectionFee: data.values.customCollectionFee,
            deposit: data.values.deposit,
            customDeposit: data.values.customDeposit,
            totalExtras: data.values.totalExtras,
            subTotal: data.values.subTotal,
            netTotal: data.values.netTotal,

            discountAmount: data.values.discountAmount,
            discountPolicy: data.values.discountPolicy || '',
            rentalId: newBooking.id,
          },
        });

        await Promise.all(
          (data.values.extras || []).map((extra: any) =>
            tx.rentalExtra.create({
              data: {
                id: extra.id,
                extraId: extra.extraId,
                amount: extra.amount,
                customAmount: extra.customAmount,
                valuesId: extra.valuesId,
              },
            }),
          ),
        );

        return newBooking;
      });
    } catch (error) {
      this.logger.error(error, 'Failed to create storefront booking', {
        data,
        tenantId: tenant.id,
      });
      throw new Error('Failed to create storefront booking');
    }
  }

  async createCustomer(user: StorefrontUser): Promise<StorefrontCustomerDto> {
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
}
