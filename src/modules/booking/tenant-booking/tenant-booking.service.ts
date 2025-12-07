import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service.js';
import { TenantBookingRepository } from './tenant-booking.repository.js';
import {
  Agent,
  RentalStatus,
  Tenant,
  User,
} from '../../../generated/prisma/client.js';
import { CreateBookingDto } from './dto/create-booking.dto.js';
import { GeneratorService } from '../../../common/generator/generator.service.js';
import { UpdateBookingDto } from './dto/update-booking.dto.js';
import { ActionBookingDto } from '../dto/action-booking.dto.js';
import { RentalActivityDto } from '../dto/rental-activity.dto.js';
import { CustomerService } from '../../../modules/customer/customer.service.js';
import { DocumentService } from '../../../common/document/document.service.js';
import { EmailService } from '../../../common/email/email.service.js';
import { VehicleService } from '../../../modules/vehicle/vehicle.service.js';
import { VehicleStatusDto } from '../../../modules/vehicle/dto/vehicle-status.dto.js';

@Injectable()
export class TenantBookingService {
  private readonly logger = new Logger(TenantBookingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly bookingRepo: TenantBookingRepository,
    private readonly generator: GeneratorService,
    private readonly customer: CustomerService,
    private readonly documentService: DocumentService,
    private readonly emailService: EmailService,
    private readonly vehicleService: VehicleService,
  ) {}

  async getBookings(tenant: Tenant) {
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

  async getBookingByCode(bookingCode: string, tenant: Tenant) {
    try {
      const booking = await this.bookingRepo.getBookingByCode(
        bookingCode,
        tenant.id,
      );

      if (!booking) {
        this.logger.warn('Booking not found', { bookingCode });
        throw new NotFoundException('Booking not found');
      }

      return booking;
    } catch (error) {
      this.logger.error(error, 'Failed to get booking by code', {
        tenantId: tenant.id,
        tenantCode: tenant.tenantCode,
        bookingCode,
      });
      throw new Error('Failed to get booking by code');
    }
  }

  async createBooking(data: CreateBookingDto, tenant: Tenant, user: User) {
    try {
      const bookingNumber = await this.generator.generateBookingNumber(
        tenant.id,
      );

      if (!bookingNumber) {
        throw new NotFoundException('Failed to generate booking number');
      }

      const bookingCode = await this.generator.generateBookingCode(
        tenant.tenantCode,
        bookingNumber,
      );

      if (!bookingCode) {
        throw new NotFoundException('Failed to generate booking code');
      }

      const newBooking = await this.prisma.$transaction(async (tx) => {
        const newBooking = await tx.rental.create({
          data: {
            id: data.id,
            startDate: new Date(data.startDate),
            endDate: new Date(data.endDate),
            pickupLocationId: data.pickupLocationId,
            returnLocationId: data.returnLocationId,
            vehicleId: data.vehicleId,
            chargeTypeId: data.chargeTypeId,
            bookingCode,
            createdAt: new Date(),
            createdBy: user.username,
            rentalNumber: bookingNumber,
            tenantId: tenant.id,
            status: RentalStatus.PENDING,
            agent: data.agent ?? Agent.SYSTEM,
          },
        });

        await Promise.all(
          data.drivers.map((driver: any) =>
            tx.rentalDriver.create({
              data: {
                id: driver.id,
                driverId: driver.driverId,
                isPrimary: driver.isPrimary,
                rentalId: newBooking.id,
              },
            }),
          ),
        );

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

        if (data.values.extras) {
          await Promise.all(
            data.values.extras.map((extra: any) =>
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
        }

        return newBooking;
      });

      const booking = await this.bookingRepo.getBookingById(
        newBooking.id,
        tenant.id,
      );
      const bookings = await this.bookingRepo.getBookings(tenant.id);

      return { message: 'Booking created successfully', booking, bookings };
    } catch (error) {
      this.logger.error(error, 'Failed to create booking', {
        tenantId: tenant.id,
        tenantCode: tenant.tenantCode,
        data,
      });
      throw error;
    }
  }

  async updateBooking(data: UpdateBookingDto, tenant: Tenant, user: User) {
    try {
      const booking = await this.prisma.rental.findUnique({
        where: { id: data.id },
      });

      if (!booking) {
        this.logger.warn('Booking not found', { bookingId: data.id });
        throw new NotFoundException('Booking not found');
      }

      const updatedBooking = await this.prisma.$transaction(async (tx) => {
        const updatedBooking = await tx.rental.update({
          where: { id: data.id },
          data: {
            id: data.id,
            startDate: new Date(data.startDate),
            endDate: new Date(data.endDate),
            pickupLocationId: data.pickupLocationId,
            returnLocationId: data.returnLocationId,
            vehicleId: data.vehicleId,
            chargeTypeId: data.chargeTypeId,
            status: data.status ?? RentalStatus.PENDING,
            updatedAt: new Date(),
            updatedBy: user.id,
          },
        });

        await tx.rentalDriver.deleteMany({
          where: { rentalId: booking.id },
        });

        await Promise.all(
          data.drivers.map((driver: any) =>
            tx.rentalDriver.create({
              data: {
                id: driver.id,
                driverId: driver.driverId,
                isPrimary: driver.isPrimary,
                rentalId: updatedBooking.id,
              },
            }),
          ),
        );

        await tx.values.update({
          where: { rentalId: booking.id },
          data: {
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
          },
        });

        await tx.rentalExtra.deleteMany({
          where: { valuesId: data.values.id },
        });

        if (data.values.extras) {
          await Promise.all(
            data.values.extras.map((extra: any) =>
              tx.rentalExtra.create({
                data: {
                  id: extra.id,
                  extraId: extra.extraId,
                  amount: extra.amount,
                  customAmount: extra.customAmount,
                  valuesId: data.values.id,
                },
              }),
            ),
          );
        }

        return updatedBooking;
      });

      const updated = await this.bookingRepo.getBookingById(
        updatedBooking.id,
        tenant.id,
      );
      const bookings = await this.bookingRepo.getBookings(tenant.id);

      return {
        message: 'Booking updated successfully',
        booking: updated,
        bookings,
      };
    } catch (error) {
      this.logger.error(error, 'Failed to update booking', {
        tenantId: tenant.id,
        tenantCode: tenant.tenantCode,
        data,
      });
      throw error;
    }
  }

  async confirmBooking(data: ActionBookingDto, tenant: Tenant, user: User) {
    try {
      const booking = await this.prisma.rental.findUnique({
        where: { id: data.bookingId },
      });

      if (!booking) {
        this.logger.warn('Booking not found for confirmation', {
          tenantId: tenant.id,
          tenantCode: tenant.tenantCode,
          bookingId: data.bookingId,
        });
        throw new NotFoundException('Booking not found');
      }

      const updatedBooking = await this.prisma.$transaction(async (tx) => {
        await this.updateBookingStatus(
          data.bookingId,
          RentalStatus.CONFIRMED,
          tenant,
          user,
        );

        await this.createRentalActivity(data, tenant, user, new Date());

        return this.bookingRepo.getBookingById(data.bookingId, tenant.id);
      });

      await this.documentService.generateInvoice(
        updatedBooking?.id || '',
        tenant,
        user,
      );

      await this.documentService.generateAgreementData(
        updatedBooking?.id || '',
        tenant.id,
      );

      if (data.sendEmail) {
        await this.emailService.sendBookingConfirmationEmail(
          updatedBooking?.id || '',
          data.includeInvoice,
          data.includeAgreement,
          tenant,
        );
      }

      const bookings = await this.bookingRepo.getBookings(tenant.id);

      return {
        message: `Booking #${updatedBooking!.rentalNumber} confirmed successfully`,
        booking: updatedBooking,
        bookings,
      };
    } catch (error) {
      this.logger.error(error, 'Failed to confirm booking', {
        tenantId: tenant.id,
        tenantCode: tenant.tenantCode,
        data,
      });
      throw error;
    }
  }

  async declineBooking(id: string, tenant: Tenant, user: User) {
    try {
      const existing = await this.prisma.rental.findUnique({
        where: { id },
      });

      if (!existing) {
        this.logger.warn('Booking not found for confirmation', {
          tenantId: tenant.id,
          tenantCode: tenant.tenantCode,
          bookingId: id,
        });
        throw new NotFoundException('Booking not found');
      }

      const updatedBooking = await this.prisma.$transaction(async (tx) => {
        await this.updateBookingStatus(id, RentalStatus.DECLINED, tenant, user);

        return this.bookingRepo.getBookingById(id, tenant.id);
      });

      const bookings = await this.bookingRepo.getBookings(tenant.id);

      return {
        message: `Booking #${updatedBooking!.rentalNumber} declined successfully`,
        updatedBooking,
        bookings,
      };
    } catch (error) {
      this.logger.error(error, 'Failed to decline booking', {
        tenantId: tenant.id,
        tenantCode: tenant.tenantCode,
        bookingId: id,
      });
      throw error;
    }
  }

  async cancelBooking(id: string, tenant: Tenant, user: User) {
    try {
      const booking = await this.prisma.rental.findUnique({
        where: { id },
      });

      if (!booking) {
        this.logger.warn('Booking not found for cancellation', {
          tenantId: tenant.id,
          tenantCode: tenant.tenantCode,
          bookingId: id,
        });
        throw new NotFoundException('Booking not found');
      }

      const updatedBooking = await this.prisma.$transaction(async (tx) => {
        await this.updateBookingStatus(id, RentalStatus.CANCELED, tenant, user);

        return this.bookingRepo.getBookingById(id, tenant.id);
      });

      const bookings = await this.bookingRepo.getBookings(tenant.id);

      return {
        message: `Booking #${updatedBooking!.rentalNumber} canceled successfully`,
        booking: updatedBooking,
        bookings,
      };
    } catch (error) {
      this.logger.error(error, 'Failed to cancel booking', {
        tenantId: tenant.id,
        tenantCode: tenant.tenantCode,
        id,
      });
      throw error;
    }
  }

  async startBooking(data: ActionBookingDto, tenant: Tenant, user: User) {
    try {
      const booking = await this.prisma.rental.findUnique({
        where: { id: data.bookingId },
      });

      if (!booking) {
        this.logger.warn('Booking not found for cancellation', {
          tenantId: tenant.id,
          tenantCode: tenant.tenantCode,
          bookingId: data.bookingId,
        });
        throw new NotFoundException('Booking not found');
      }

      const updatedBooking = await this.prisma.$transaction(async (tx) => {
        await this.updateBookingStatus(
          data.bookingId,
          RentalStatus.ACTIVE,
          tenant,
          user,
        );

        const vehicleStatus: VehicleStatusDto = {
          vehicleId: booking.vehicleId,
          status: data.vehicleStatus,
        };

        await this.vehicleService.updateVehicleStatus(
          vehicleStatus,
          tenant,
          user,
        );

        await this.createRentalActivity(data, tenant, user);

        return this.bookingRepo.getBookingById(data.bookingId, tenant.id);
      });

      const bookings = await this.bookingRepo.getBookings(tenant.id);

      return {
        message: `Booking #${updatedBooking!.rentalNumber} started successfully`,
        booking: updatedBooking,
        bookings,
      };
    } catch (error) {
      this.logger.error(error, 'Failed to start booking', {
        tenantId: tenant.id,
        tenantCode: tenant.tenantCode,
        data,
      });
      throw error;
    }
  }

  async endBooking(data: ActionBookingDto, tenant: Tenant, user: User) {
    try {
      const booking = await this.prisma.rental.findUnique({
        where: { id: data.bookingId },
      });

      if (!booking) {
        this.logger.warn('Booking not found for cancellation', {
          tenantId: tenant.id,
          tenantCode: tenant.tenantCode,
          bookingId: data.bookingId,
        });
        throw new NotFoundException('Booking not found');
      }

      const updatedBooking = await this.prisma.$transaction(async (tx) => {
        await this.updateBookingStatus(
          data.bookingId,
          data.status,
          tenant,
          user,
        );

        const vehicleStatus: VehicleStatusDto = {
          vehicleId: booking.vehicleId,
          status: data.vehicleStatus,
        };

        await this.vehicleService.updateVehicleStatus(
          vehicleStatus,
          tenant,
          user,
        );

        await this.createRentalActivity(
          data,
          tenant,
          user,
          data.returnDate ? new Date(data.returnDate) : undefined,
        );

        return this.bookingRepo.getBookingById(data.bookingId, tenant.id);
      });

      const bookings = await this.bookingRepo.getBookings(tenant.id);

      return {
        message: `Booking #${updatedBooking!.rentalNumber} ended successfully`,
        booking: updatedBooking,
        bookings,
      };
    } catch (error) {
      this.logger.error(error, 'Failed to end booking', {
        tenantId: tenant.id,
        tenantCode: tenant.tenantCode,
        data,
      });
      throw error;
    }
  }

  async createRentalActivity(
    data: RentalActivityDto,
    tenant: Tenant,
    userId: User,
    createdAt?: Date,
  ) {
    try {
      const booking = await this.prisma.rental.findUnique({
        where: { id: data.bookingId },
      });

      if (!booking) {
        this.logger.warn('Booking not found for rental activity', {
          tenantId: tenant.id,
          tenantCode: tenant.tenantCode,
          bookingId: data.bookingId,
        });
        throw new NotFoundException('Booking not found');
      }

      const primaryDriver = await this.customer.getPrimaryDriver(booking.id);

      if (!primaryDriver) {
        this.logger.warn('Primary driver not found for rental activity', {
          tenantId: tenant.id,
          tenantCode: tenant.tenantCode,
          bookingId: data.bookingId,
        });
        throw new NotFoundException('Primary driver not found');
      }

      await this.prisma.rentalActivity.create({
        data: {
          rentalId: data.bookingId,
          action: data.action,
          tenantId: tenant.id,
          createdAt: createdAt
            ? createdAt
            : new Date(booking.startDate) < new Date()
              ? new Date(booking.startDate)
              : new Date(),
          createdBy: userId.username,
          customerId: primaryDriver.driverId,
          vehicleId: booking.vehicleId,
        },
      });

      return {
        message: 'Rental activity created successfully',
      };
    } catch (error) {
      this.logger.error(error, 'Failed to create rental activity', {
        tenantId: tenant.id,
        tenantCode: tenant.tenantCode,
        data,
      });
      throw error;
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
        this.logger.warn('Booking not found for status update', {
          tenantId: tenant.id,
          tenantCode: tenant.tenantCode,
          bookingId,
        });
        throw new NotFoundException('Booking not found');
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
