import {
  Agent,
  Prisma,
  PrismaClient,
  RentalStatus,
  Tenant,
  User,
} from '@prisma/client';
import generator from '../../services/generator.service';
import { DefaultArgs } from '@prisma/client/runtime/library';
import { CreateBookingDto } from './dto/create-booking.dto';
import { logger } from '../../config/logger';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { CreateRentalActivityDto } from './dto/create-activity.dto';
import pdf from '../../services/pdf.service';
import documentService from '../../services/document.service';
import customerService from '../customer/customer.service';
import prisma, { TxClient } from '../../config/prisma.config';
import transactionService from '../transaction/transaction.service';
import { error } from 'console';
import { bookingRepo } from './booking.repository';

class BookingService {
  async getTenantBookings(tenant: Tenant) {
    try {
      return await bookingRepo.getBookings(tenant.id);
    } catch (error) {
      logger.e(error, 'Failed to get bookings', {
        tenantId: tenant.id,
        tenantCode: tenant.tenantCode,
      });
      throw new Error('Failed to get bookings');
    }
  }

  async getBookingById(tenant: Tenant, bookingId: string) {
    try {
      const booking = await bookingRepo.getRentalById(bookingId, tenant.id);
      if (!booking) {
        throw new Error('Booking not found');
      }
      return booking;
    } catch (error) {
      logger.e(error, 'Failed to get booking by ID', {
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
      const booking = await prisma.rental.findUnique({
        where: { id: bookingId },
      });

      if (!booking) {
        throw new Error('Booking not found');
      }

      await prisma.rental.update({
        where: { id: bookingId },
        data: {
          status,
          updatedAt: new Date(),
          updatedBy: user.username,
        },
      });

      return;
    } catch (error) {
      logger.e(error, 'Failed to update booking status', {
        tenantId: tenant.id,
        tenantCode: tenant.tenantCode,
        bookingId,
        status,
      });
      throw new Error('Failed to update booking status');
    }
  }

  async createRentalActivity(
    data: CreateRentalActivityDto,
    tenant: Tenant,
    userId: User,
    createdAt?: Date,
  ) {
    try {
      const booking = await prisma.rental.findUnique({
        where: { id: data.bookingId },
      });

      if (!booking) {
        throw new Error('Booking not found');
      }

      const primaryDriver = await customerService.getPrimaryDriver(booking.id);

      if (!primaryDriver) {
        throw new Error('Primary driver not found');
      }

      await prisma.rentalActivity.create({
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

      return;
    } catch (error) {
      logger.e(error, 'Failed to create rental activity', {
        tenantId: tenant.id,
        tenantCode: tenant.tenantCode,
        bookingId: data.bookingId,
        action: data.action,
      });
      throw new Error('Failed to create rental activity');
    }
  }

  async generateInvoice(bookingId: any, tenant: any, user: User) {
    try {
      let invoiceNumber;

      const booking = await prisma.rental.findUnique({
        where: { id: bookingId },
        include: { values: true },
      });

      if (!booking) {
        throw new Error('Booking not found');
      }

      const existingInvoice = await prisma.invoice.findUnique({
        where: { rentalId: bookingId },
      });

      if (existingInvoice) {
        invoiceNumber = existingInvoice.invoiceNumber;
      } else {
        invoiceNumber = await generator.generateInvoiceNumber(tenant.id);
      }

      const data = await documentService.generateInvoiceData(
        bookingId,
        tenant.id,
      );

      const { publicUrl } = await pdf.createInvoice(
        {
          ...data,
          invoiceNumber,
        },
        invoiceNumber,
        tenant?.tenantCode!,
      );

      const primaryDriver = await customerService.getPrimaryDriver(bookingId);

      if (!primaryDriver) {
        throw new Error('Primary driver not found');
      }

      const invoice = await prisma.invoice.upsert({
        where: { rentalId: bookingId },
        create: {
          invoiceNumber,
          amount: booking?.values?.netTotal || 0,
          customerId: primaryDriver?.driverId || '',
          rentalId: booking?.id || '',
          tenantId: tenant.id!,
          createdAt: new Date(),
          createdBy: user.username,
          invoiceUrl: publicUrl,
        },
        update: {
          amount: booking?.values?.netTotal || 0,
          customerId: primaryDriver?.driverId || '',
          tenantId: tenant.id!,
          invoiceUrl: publicUrl,
          updatedAt: new Date(),
          updatedBy: user.username,
        },
      });

      return invoice;
    } catch (error) {
      logger.e(error, 'Failed to generate invoice', {
        bookingId,
        tenantId: tenant.id,
        tenantCode: tenant.tenantCode,
      });
      throw new Error('Failed to generate invoice');
    }
  }

  async generateBookingAgreement(bookingId: any, tenant: any, user: User) {
    try {
      let agreementNumber;

      const booking = await prisma.rental.findUnique({
        where: { id: bookingId },
        include: { values: true },
      });

      if (!booking) {
        throw new Error('Booking not found');
      }

      const existingAgreement = await prisma.rentalAgreement.findUnique({
        where: { rentalId: bookingId },
      });

      if (existingAgreement) {
        agreementNumber = existingAgreement.number;
      } else {
        agreementNumber = await generator.generateRentalAgreementNumber(
          tenant.id!,
        );
      }

      const data = await documentService.generateAgreementData(
        bookingId,
        tenant.id,
      );

      const { publicUrl, signablePublicUrl } = await pdf.createAgreement(
        {
          ...data,
          agreementNumber,
        },
        agreementNumber,
        tenant?.tenantCode!,
      );

      const primaryDriver = await customerService.getPrimaryDriver(bookingId);

      const agreement = await prisma.rentalAgreement.upsert({
        where: { rentalId: bookingId },
        create: {
          number: agreementNumber,
          customerId: primaryDriver?.driverId || '',
          rentalId: bookingId,
          tenantId: tenant.id,
          createdAt: new Date(),
          createdBy: user.username,
          agreementUrl: publicUrl,
          signableUrl: signablePublicUrl,
        },
        update: {
          customerId: primaryDriver?.driverId || '',
          tenantId: tenant.id,
          agreementUrl: publicUrl,
          signableUrl: signablePublicUrl,
          updatedAt: new Date(),
          updatedBy: user.username,
        },
      });

      return agreement;
    } catch (error) {
      logger.e(error, 'Failed to generate booking agreement', {
        bookingId,
        tenantId: tenant.id,
        tenantCode: tenant.tenantCode,
      });
      throw new Error('Failed to generate booking agreement');
    }
  }
}

export const bookingService = new BookingService();

const createBooking = async (
  tenant: Tenant,
  data: CreateBookingDto,
  tx: TxClient,
  userId?: string,
) => {
  try {
    const bookingNumber = await generator.generateRentalNumber(tenant.id);

    if (!bookingNumber) {
      throw error;
    }

    const bookingCode = generator.generateBookingCode(
      tenant.tenantCode,
      bookingNumber,
    );

    if (!bookingCode) {
      throw error;
    }

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
        createdBy: userId ?? 'SYSTEM',
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
            ...driver,
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
        discountMin: data.values.discountMin,
        discountMax: data.values.discountMax,
        discountAmount: data.values.discountAmount,
        discountPolicy: data.values.discountPolicy || '',
        rentalId: newBooking.id,
      },
    });

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

    return newBooking;
  } catch (error) {
    logger.e(error, 'Failed to create booking', {
      tenantId: tenant.id,
      tenantCode: tenant.tenantCode,
    });
    throw error;
  }
};

const updateBooking = async (
  data: UpdateBookingDto,
  tenant: Tenant,
  tx: TxClient,
  userId: string,
) => {
  try {
    const booking = await tx.rental.findUnique({ where: { id: data.id } });

    if (!booking) {
      throw new Error('Booking not found');
    }

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
        agent: data.agent ?? Agent.SYSTEM,
        updatedAt: new Date(),
        updatedBy: userId,
      },
    });

    await tx.rentalDriver.deleteMany({ where: { rentalId: booking.id } });

    await Promise.all(
      data.drivers.map((driver: any) =>
        tx.rentalDriver.create({
          data: {
            ...driver,
            rentalId: booking.id,
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
        discountMin: data.values.discountMin,
        discountMax: data.values.discountMax,
        discountAmount: data.values.discountAmount,
        discountPolicy: data.values.discountPolicy || '',
      },
    });

    await tx.rentalExtra.deleteMany({ where: { valuesId: data.values.id } });

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

    return updatedBooking;
  } catch (error) {
    logger.e(error, 'Failed to update booking', {
      tenantId: tenant.id,
      tenantCode: tenant.tenantCode,
    });
    throw new Error('Failed to update booking');
  }
};

const deleteBooking = async (
  bookingId: string,
  tenant: Tenant,
  tx: TxClient,
  userId: string,
) => {
  try {
    const booking = await tx.rental.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new Error('Booking not found');
    }

    await tx.rental.update({
      where: { id: bookingId },
      data: { isDeleted: true, deletedAt: new Date(), updatedBy: userId },
    });

    await transactionService.deleteBookingTransaction(bookingId, tx);
  } catch (error) {
    logger.e(error, 'Failed to delete booking', {
      tenantId: tenant.id,
      tenantCode: tenant.tenantCode,
      bookingId,
    });
    throw error;
  }
};

export default {
  createBooking,
  updateBooking,
  deleteBooking,
};
