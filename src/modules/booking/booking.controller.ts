import { Request, Response } from 'express';
import service, { bookingService } from './booking.service';
import emailService from '../email/email.service';
import vehicleService from '../vehicle/vehicle.service';
import { logger } from '../../config/logger';
import prisma from '../../config/prisma.config';
import { CreateBookingDtoSchema } from './dto/create-booking.dto';
import { UpdateBookingDtoSchema } from './dto/update-booking.dto';
import { ActionBookingDtoSchema } from './dto/action-booking.dto';
import { Rental, RentalStatus, Tenant } from '@prisma/client';
import { tenantRepo } from '../../repository/tenant.repository';
import { bookingRepo } from './booking.repository';

//#region Get Bookings
const getBookings = async (req: Request, res: Response) => {
  const tenantId = req.user?.tenantId;

  if (!tenantId) {
    return res.status(401).json({ error: 'Tenant ID is required' });
  }

  try {
    const tenant = await tenantRepo.getTenantById(tenantId);

    if (!tenant) {
      logger.w('Tenant not found', { tenantId });
      return res.status(404).json({ error: 'Tenant not found' });
    }

    const bookings = await bookingService.getTenantBookings(tenant);

    return res.status(200).json(bookings);
  } catch (error) {
    logger.e(error, 'Failed to fetch bookings', { tenantId });
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
const getBookingById = async (req: Request, res: Response) => {
  const tenantId = req.user?.tenantId;
  const { id } = req.params;

  if (!tenantId) {
    logger.w('Tenant ID is missing', { tenantId });
    return res.status(400).json({ error: 'Tenant ID is required' });
  }

  if (!id) {
    logger.w('Booking ID is missing', { tenantId });
    return res.status(400).json({ error: 'Booking ID is required' });
  }

  try {
    const booking = await bookingRepo.getRentalById(tenantId, id);

    if (!booking) {
      logger.w('Booking not found', { tenantId, id });
      return res.status(404).json({ error: 'Booking not found' });
    }

    return res.status(200).json(booking);
  } catch (error) {
    logger.e(error, 'Failed to fetch booking', { tenantId, id });
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
const getBookingByCode = async (req: Request, res: Response) => {
  const tenantId = req.user?.tenantId;
  const tenantCode = req.user?.tenantCode;
  const { bookingCode } = req.params;

  if (!tenantId) {
    logger.w('Tenant ID is missing', { tenantId });
    return res.status(400).json({ error: 'Tenant ID is required' });
  }

  if (!bookingCode) {
    logger.w('Booking code is missing', { tenantId });
    return res.status(400).json({ error: 'Booking code is required' });
  }

  try {
    logger.i('Fetching booking by code', { tenantId, bookingCode });

    const booking = await bookingRepo.getRentalByCode(bookingCode, tenantId);

    if (!booking) {
      logger.w('Booking not found', { tenantId, bookingCode });
      return res.status(404).json({ error: 'Booking not found' });
    }

    return res.status(200).json({
      message: `Booking #${booking.bookingCode} fetched successfully`,
      booking,
    });
  } catch (error) {
    logger.e(error, 'Failed to fetch booking', {
      tenantId,
      tenantCode,
      bookingCode,
    });
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};
//#endregion

const createSystemBooking = async (req: Request, res: Response) => {
  const tenantId = req.user?.tenantId;
  const tenantCode = req.user?.tenantCode;
  const data = req.body;

  if (!tenantId) {
    logger.w('Tenant ID is missing', { tenantId });
    return res.status(400).json({ error: 'Tenant ID is required' });
  }

  if (!data) {
    logger.w('Booking data is missing', { tenantId });
    return res.status(400).json({ error: 'Booking data is required' });
  }

  const parseResult = CreateBookingDtoSchema.safeParse(data);
  if (!parseResult.success) {
    return res.status(400).json({
      error: 'Invalid booking data',
      details: parseResult.error.issues,
    });
  }

  const bookingDto = parseResult.data;

  try {
    const booking = await prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.findUnique({ where: { id: tenantId } });

      if (!tenant) {
        logger.w('Tenant not found', { tenantId });
        throw new Error('Tenant not found');
      }

      return service.createBooking(tenant, bookingDto, tx, req.user?.id);
    });

    logger.i('Booking created successfully', {
      tenantId,
      tenantCode: tenantCode,
      bookingId: booking.id,
      bookingCode: booking.bookingCode,
    });

    const updatedBooking = await bookingRepo.getRentalById(
      booking.id,
      tenantId,
    );
    const bookings = await bookingRepo.getBookings(tenantId);

    return res.status(201).json({
      message: `Booking #${booking.rentalNumber} created successfully`,
      updatedBooking,
      bookings,
    });
  } catch (error) {
    logger.e(error, 'Failed to create booking', { tenantId });
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
const updateBooking = async (req: Request, res: Response) => {
  const tenantId = req.user?.tenantId;
  const tenantCode = req.user?.tenantCode;
  const { id } = req.params;
  const data = req.body;
  const userId = req.user?.id;

  if (!tenantId) {
    logger.w('Tenant ID is missing', { tenantId });
    return res.status(400).json({ error: 'Tenant ID is required' });
  }

  if (!id) {
    logger.w('Booking ID is missing', { tenantId });
    return res.status(400).json({ error: 'Booking ID is required' });
  }

  if (!data) {
    logger.w('Booking data is missing', { tenantId });
    return res.status(400).json({ error: 'Booking data is required' });
  }

  const parseResult = UpdateBookingDtoSchema.safeParse(data);
  if (!parseResult.success) {
    return res.status(400).json({
      error: 'Invalid booking data',
      details: parseResult.error.issues,
    });
  }

  const bookingDto = parseResult.data;

  try {
    const booking = await prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.findUnique({
        where: { id: tenantId },
      });

      if (!tenant) {
        logger.w('Tenant not found', { tenantId });
        throw new Error('Tenant not found');
      }

      const existingBooking = await tx.rental.findUnique({
        where: { id },
      });

      if (!existingBooking) {
        logger.w('Booking not found', { tenantId, id });
        throw new Error('Booking not found');
      }

      return service.updateBooking(bookingDto, tenant, tx, userId!);
    });

    logger.i('Booking updated successfully', {
      tenantId,
      tenantCode,
      bookingId: booking.id,
      bookingCode: booking.bookingCode,
    });

    const updatedBooking = await bookingRepo.getRentalById(
      booking.id,
      tenantId,
    );
    const bookings = await bookingRepo.getBookings(tenantId);

    return res.status(200).json({
      message: `Booking #${booking.rentalNumber} updated successfully`,
      updatedBooking,
      bookings,
    });
  } catch (error) {
    logger.e(error, 'Failed to update booking', { tenantId, id });
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
const deleteBooking = async (req: Request, res: Response) => {
  const { id } = req.params;
  const tenantId = req.user?.tenantId;
  const tenantCode = req.user?.tenantCode;
  const userId = req.user?.id;

  if (!tenantId) {
    logger.w('Tenant ID is missing', { tenantId });
    return res.status(400).json({ error: 'Tenant ID is required' });
  }

  if (!id) {
    logger.w('Booking ID is missing', { tenantId });
    return res.status(400).json({ error: 'Booking ID is required' });
  }

  try {
    await prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.findUnique({ where: { id: tenantId } });

      if (!tenant) {
        logger.w('Tenant not found', { tenantId });
        throw new Error('Tenant not found');
      }

      await service.deleteBooking(id, tenant, tx, userId!);
    });

    logger.i('Booking deleted successfully', {
      tenantId,
      tenantCode,
      bookingId: id,
    });

    const bookings = await bookingRepo.getBookings(tenantId);

    return res.status(200).json({
      message: `Booking  deleted successfully`,
      bookings,
    });
  } catch (error) {
    logger.e(error, 'Failed to delete booking', { tenantId, id });
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
const confirmBooking = async (req: Request, res: Response) => {
  const data = req.body;
  const { tenant, user } = req.context!;

  if (!data) {
    logger.w('Rental confirmation data is missing', { tenantId: tenant.id });
    return res
      .status(400)
      .json({ error: 'Rental confirmation data is required' });
  }

  const parseResult = ActionBookingDtoSchema.safeParse(data);
  if (!parseResult.success) {
    return res.status(400).json({
      error: 'Invalid booking confirmation data',
      details: parseResult.error.issues,
    });
  }

  const bookingDto = parseResult.data;

  try {
    let updatedBooking: Rental | null = null;

    await prisma.$transaction(async (tx) => {
      const booking = await tx.rental.findUnique({
        where: { id: bookingDto.bookingId },
      });

      if (!booking) {
        logger.w('Booking not found', {
          tenantId: tenant?.id,
          bookingId: bookingDto.bookingId,
        });
        throw new Error('Booking not found');
      }

      await bookingService.updateBookingStatus(
        bookingDto.bookingId,
        RentalStatus.CONFIRMED,
        tenant,
        user,
      );

      await bookingService.createRentalActivity(bookingDto, tenant, user);

      updatedBooking = await bookingRepo.getRentalById(
        bookingDto.bookingId,
        tenant.id,
      );
    });

    await bookingService.generateInvoice(updatedBooking!.id, tenant, user);
    await bookingService.generateBookingAgreement(
      updatedBooking!.id,
      tenant,
      user,
    );

    if (bookingDto.sendEmail) {
      await emailService.sendConfirmationEmail(
        updatedBooking!.id,
        bookingDto.includeInvoice,
        bookingDto.includeAgreement,
        tenant,
        user,
      );
    }

    const bookings = await bookingRepo.getBookings(tenant.id);

    return res.status(200).json({
      message: `Booking #${updatedBooking!.rentalNumber} confirmed successfully`,
      updatedBooking,
      bookings,
    });
  } catch (error) {
    logger.e(error, 'Failed to confirm booking', {
      tenantId: tenant.id,
      tenantCode: tenant.tenantCode,
      bookingId: data.bookingId,
    });
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
const declineBooking = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { tenant, user } = req.context!;

  try {
    await prisma.$transaction(async (tx) => {
      const booking = await tx.rental.findUnique({
        where: { id },
      });

      if (!booking) {
        logger.w('Booking not found', {
          tenantId: tenant.id,
          tenantCode: tenant.tenantCode,
          bookingId: id,
        });
        throw new Error('Booking not found');
      }

      await bookingService.updateBookingStatus(
        booking.id,
        RentalStatus.DECLINED,
        tenant,
        user,
      );
    });

    const updatedBooking = await bookingRepo.getRentalById(id, tenant.id);
    const bookings = await bookingRepo.getBookings(tenant.id);

    return res.status(200).json({
      message: `Booking #${updatedBooking!.rentalNumber} declined successfully`,
      updatedBooking,
      bookings,
    });
  } catch (error) {
    logger.e(error, 'Failed to decline booking', {
      tenantId: tenant.id,
      tenantCode: tenant.tenantCode,
      bookingId: id,
    });
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
const cancelBooking = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { tenant, user } = req.context!;

  try {
    await prisma.$transaction(async (tx) => {
      const booking = await tx.rental.findUnique({
        where: { id },
      });

      if (!booking) {
        logger.w('Booking not found', {
          tenantId: tenant.id,
          tenantCode: tenant.tenantCode,
          bookingId: id,
        });
        throw new Error('Booking not found');
      }

      await bookingService.updateBookingStatus(
        booking.id,
        RentalStatus.CANCELED,
        tenant,
        user,
      );
    });

    const updatedBooking = await bookingRepo.getRentalById(id, tenant.id);
    const bookings = await bookingRepo.getBookings(tenant.id);

    return res.status(200).json({
      message: `Booking #${updatedBooking!.rentalNumber} cancelled successfully`,
      updatedBooking,
      bookings,
    });
  } catch (error) {
    logger.e(error, 'Failed to cancel booking', {
      tenantId: tenant.id,
      tenantCode: tenant.tenantCode,
      bookingId: id,
    });
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
const startBooking = async (req: Request, res: Response) => {
  const data = req.body;
  const { tenant, user } = req.context!;

  if (!data) {
    logger.w('Rental confirmation data is missing', { tenantId: tenant.id });
    return res
      .status(400)
      .json({ error: 'Rental confirmation data is required' });
  }

  const parseResult = ActionBookingDtoSchema.safeParse(data);
  if (!parseResult.success) {
    return res.status(400).json({
      error: 'Invalid booking confirmation data',
      details: parseResult.error.issues,
    });
  }

  const bookingDto = parseResult.data;

  try {
    await prisma.$transaction(async (tx) => {
      const booking = await tx.rental.findUnique({
        where: { id: bookingDto.bookingId },
      });

      if (!booking) {
        logger.w('Booking not found', {
          tenantId: tenant.id,
          tenantCode: tenant.tenantCode,
          bookingId: bookingDto.bookingId,
        });
        throw new Error('Booking not found');
      }

      await bookingService.updateBookingStatus(
        booking.id,
        bookingDto.status,
        tenant,
        user,
      );

      await vehicleService.updateVehicleStatus(
        booking.vehicleId,
        bookingDto.vehicleStatus,
        tenant,
        tx,
        user.id,
      );

      await bookingService.createRentalActivity(bookingDto, tenant, user);
    });

    const updatedBooking = await bookingRepo.getRentalById(
      bookingDto.bookingId,
      tenant.id,
    );
    const bookings = await bookingRepo.getBookings(tenant.id);

    return res.status(200).json({
      message: `Booking #${updatedBooking!.rentalNumber} started successfully`,
      updatedBooking,
      bookings,
    });
  } catch (error) {
    logger.e(error, 'Failed to start booking', {
      tenantId: tenant.id,
      tenantCode: tenant.tenantCode,
      bookingId: bookingDto.bookingId,
    });
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
const endBooking = async (req: Request, res: Response) => {
  const data = req.body;
  const { tenant, user } = req.context!;

  if (!data) {
    logger.w('Rental confirmation data is missing', { tenantId: tenant.id });
    return res
      .status(400)
      .json({ error: 'Rental confirmation data is required' });
  }

  const parseResult = ActionBookingDtoSchema.safeParse(data);
  if (!parseResult.success) {
    return res.status(400).json({
      error: 'Invalid booking confirmation data',
      details: parseResult.error.issues,
    });
  }

  const bookingDto = parseResult.data;

  try {
    await prisma.$transaction(async (tx) => {
      const booking = await tx.rental.findUnique({
        where: { id: bookingDto.bookingId },
      });

      if (!booking) {
        logger.w('Booking not found', {
          tenantId: tenant.id,
          tenantCode: tenant.tenantCode,
          bookingId: bookingDto.bookingId,
        });
        throw new Error('Booking not found');
      }

      await bookingService.updateBookingStatus(
        booking.id,
        bookingDto.status,
        tenant,
        user,
      );

      await vehicleService.updateVehicleStatus(
        booking.vehicleId,
        bookingDto.vehicleStatus,
        tenant,
        tx,
        user.id,
      );

      await bookingService.createRentalActivity(
        bookingDto,
        tenant,
        user.id,
        bookingDto.returnDate ? new Date(bookingDto.returnDate) : undefined,
      );
    });

    const updatedBooking = await bookingRepo.getRentalById(
      bookingDto.bookingId,
      tenant.id,
    );
    const bookings = await bookingRepo.getBookings(tenant.id);

    return res.status(200).json({
      message: `Booking #${updatedBooking!.rentalNumber} ended successfully`,
      updatedBooking,
      bookings,
    });
  } catch (error) {
    logger.e(error, 'Failed to end booking', {
      tenantId: tenant.id,
      tenantCode: tenant.tenantCode,
      bookingId: bookingDto.bookingId,
    });
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

//#region Generate Documents
const generateInvoice = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { tenant, user } = req.context!;

  try {
    const invoice = await prisma.$transaction(
      async (tx) => {
        const booking = await tx.rental.findUnique({
          where: { id },
        });

        if (!booking) {
          logger.w('Booking not found', {
            tenantId: tenant.id,
            tenantCode: tenant.tenantCode,
            bookingId: id,
          });
          throw new Error('Booking not found');
        }

        return await bookingService.generateInvoice(booking.id, tenant, user);
      },
      { maxWait: 10000, timeout: 20000 },
    );

    return res.status(200).json({
      message: `${invoice.invoiceNumber} generated successfully`,
      invoice,
    });
  } catch (error) {
    logger.e(error, 'Failed to generate rental invoice', {
      tenantId: tenant.id,
      tenantCode: tenant.tenantCode,
      bookingId: id,
    });
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
const generateBookingAgreement = async (req: Request, res: Response) => {
  const { tenant, user } = req.context!;
  const { id } = req.params;

  try {
    const agreement = await prisma.$transaction(
      async (tx) => {
        const booking = await tx.rental.findUnique({
          where: { id },
        });

        if (!booking) {
          logger.w('Booking not found', {
            tenantId: tenant.id,
            tenantCode: tenant.tenantCode,
            bookingId: id,
          });
          throw new Error('Booking not found');
        }

        return await bookingService.generateBookingAgreement(
          booking.id,
          tenant,
          user,
        );
      },
      { maxWait: 10000, timeout: 20000 },
    );

    return res.status(200).json({
      message: `${agreement.number} generated successfully`,
      agreement,
    });
  } catch (error) {
    logger.e(error, 'Failed to generate rental agreement', {
      tenantId: tenant.id,
      tenantCode: tenant.tenantCode,
      bookingId: id,
    });
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
//#endregion

export default {
  cancelBooking,
  confirmBooking,
  createSystemBooking,
  declineBooking,
  deleteBooking,
  endBooking,
  generateBookingAgreement,
  generateInvoice,
  getBookingById,
  getBookings,
  startBooking,
  updateBooking,
  getBookingByCode,
};
