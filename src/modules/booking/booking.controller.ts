import { Request, Response } from 'express';
import { repo } from './booking.repository';
import service from './booking.service';
import emailService from '../email/email.service';
import vehicleService from '../vehicle/vehicle.service';
import { logger } from '../../config/logger';
import prisma from '../../config/prisma.config';
import { CreateBookingDtoSchema } from './dto/create-booking.dto';
import { UpdateBookingDtoSchema } from './dto/update-booking.dto';
import { ActionBookingDtoSchema } from './dto/action-booking.dto';
import { Rental, RentalStatus, Tenant } from '@prisma/client';

//#region Get Bookings
const getBookings = async (req: Request, res: Response) => {
  const tenantId = req.user?.tenantId;

  if (!tenantId) {
    return res.status(401).json({ error: 'Tenant ID is required' });
  }

  try {
    const bookings = await repo.getRentals(tenantId);

    if (!bookings || bookings.length === 0) {
      logger.w('No bookings found', { tenantId });
      return res.status(404).json({ error: 'No bookings found' });
    }

    const updatedBookings = bookings.map((booking) => {
      if (booking.drivers && booking.drivers.length > 0) {
        booking.drivers = booking.drivers.map((driver, index) => ({
          ...driver,
          isPrimary: index === 0,
        }));
      }
      return booking;
    });

    return res.status(200).json(updatedBookings);
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
    const booking = await repo.getRentalById(tenantId, id);

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
//#endregion

const createSystemBooking = async (req: Request, res: Response) => {
  const tenantId = req.user?.tenantId;
  const tenantCode = req.user?.tenantCode;
  const { data } = req.body;

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

    const updatedBooking = await repo.getRentalById(booking.id, tenantId);
    const bookings = await repo.getRentals(tenantId);

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
  const { data } = req.body;
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

    const updatedBooking = await repo.getRentalById(booking.id, tenantId);
    const bookings = await repo.getRentals(tenantId);

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

    const bookings = await repo.getRentals(tenantId);

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
  const tenantId = req.user?.tenantId;
  const tenantCode = req.user?.tenantCode;
  const { data } = req.body;
  const userId = req.user?.id;

  if (!tenantId) {
    logger.w('Tenant ID is missing', { tenantId });
    return res.status(400).json({ error: 'Tenant ID is required' });
  }

  if (!data) {
    logger.w('Rental confirmation data is missing', { tenantId });
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
    let tenant: Tenant | null = null;

    await prisma.$transaction(async (tx) => {
      tenant = await tx.tenant.findUnique({ where: { id: tenantId } });

      if (!tenant) {
        logger.w('Tenant not found', { tenantId });
        throw new Error('Tenant not found');
      }

      const booking = await tx.rental.findUnique({
        where: { id: bookingDto.bookingId },
      });

      if (!booking) {
        logger.w('Booking not found', {
          tenantId,
          bookingId: bookingDto.bookingId,
        });
        throw new Error('Booking not found');
      }

      if (!tenant) {
        logger.w('Tenant not found', { tenantId });
        throw new Error('Tenant not found');
      }

      await service.updateBookingStatus(
        bookingDto.bookingId,
        RentalStatus.CONFIRMED,
        tenant,
        tx,
        userId!,
      );

      await service.createRentalActivity(bookingDto, tenant, tx, userId!);

      updatedBooking = await repo.getRentalById(bookingDto.bookingId, tenantId);
    });

    (async () => {
      try {
        await emailService.sendConfirmationEmail(
          updatedBooking!.id,
          tenant,
          prisma,
        );
        await service.generateInvoice(
          updatedBooking!.id,
          tenant,
          prisma,
          userId!,
        );
        await service.generateBookingAgreement(
          updatedBooking!.id,
          tenant,
          prisma,
          userId!,
        );
      } catch (err) {
        logger.e(err, 'Background document/email generation failed', {
          tenantId,
          bookingId: updatedBooking!.id,
        });
      }
    })();

    const bookings = await repo.getRentals(tenantId);

    logger.i('Booking confirmed successfully', {
      tenantId,
      tenantCode,
      bookingId: updatedBooking!.id,
      bookingCode: updatedBooking!.bookingCode,
    });

    return res.status(200).json({
      message: `Booking #${updatedBooking!.rentalNumber} confirmed successfully`,
      updatedBooking,
      bookings,
    });
  } catch (error) {
    logger.e(error, 'Failed to confirm booking', { tenantId });
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
const declineBooking = async (req: Request, res: Response) => {
  const tenantId = req.user?.tenantId;
  const tenantCode = req.user?.tenantCode;
  const { id } = req.params;
  const userId = req.user?.id;

  if (!tenantId) {
    logger.w('Tenant ID is missing', { tenantId });
    return res.status(400).json({ error: 'Tenant ID is required' });
  }

  try {
    await prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.findUnique({ where: { id: tenantId } });

      if (!tenant) {
        logger.w('Tenant not found', { tenantId });
        throw new Error('Tenant not found');
      }

      const booking = await tx.rental.findUnique({
        where: { id },
      });

      if (!booking) {
        logger.w('Booking not found', {
          tenantId,
          tenantCode,
          bookingId: id,
        });
        throw new Error('Booking not found');
      }

      await service.updateBookingStatus(
        booking.id,
        RentalStatus.DECLINED,
        tenant,
        tx,
        userId!,
      );
    });

    const updatedBooking = await repo.getRentalById(id, tenantId);
    const bookings = await repo.getRentals(tenantId);

    return res.status(200).json({
      message: `Booking #${updatedBooking!.rentalNumber} declined successfully`,
      updatedBooking,
      bookings,
    });
  } catch (error) {
    logger.e(error, 'Failed to decline booking', { tenantId });
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
const cancelBooking = async (req: Request, res: Response) => {
  const tenantId = req.user?.tenantId;
  const tenantCode = req.user?.tenantCode;
  const { id } = req.params;
  const userId = req.user?.id;

  if (!tenantId) {
    logger.w('Tenant ID is missing', { tenantId });
    return res.status(400).json({ error: 'Tenant ID is required' });
  }

  try {
    await prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.findUnique({ where: { id: tenantId } });

      if (!tenant) {
        logger.w('Tenant not found', { tenantId });
        throw new Error('Tenant not found');
      }

      const booking = await tx.rental.findUnique({
        where: { id },
      });

      if (!booking) {
        logger.w('Booking not found', {
          tenantId,
          tenantCode,
          bookingId: id,
        });
        throw new Error('Booking not found');
      }

      await service.updateBookingStatus(
        booking.id,
        RentalStatus.CANCELED,
        tenant,
        tx,
        userId!,
      );
    });

    const updatedBooking = await repo.getRentalById(id, tenantId);
    const bookings = await repo.getRentals(tenantId);

    return res.status(200).json({
      message: `Booking #${updatedBooking!.rentalNumber} cancelled successfully`,
      updatedBooking,
      bookings,
    });
  } catch (error) {
    logger.e(error, 'Failed to cancel booking', { tenantId });
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
const startBooking = async (req: Request, res: Response) => {
  const tenantId = req.user?.tenantId;
  const tenantCode = req.user?.tenantCode;
  const { data } = req.body;
  const userId = req.user?.id;

  if (!tenantId) {
    logger.w('Tenant ID is missing', { tenantId });
    return res.status(400).json({ error: 'Tenant ID is required' });
  }

  if (!data) {
    logger.w('Rental confirmation data is missing', { tenantId });
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
      const tenant = await tx.tenant.findUnique({
        where: { id: tenantId },
      });

      if (!tenant) {
        logger.w('Tenant not found', { tenantId });
        throw new Error('Tenant not found');
      }

      const booking = await tx.rental.findUnique({
        where: { id: bookingDto.bookingId },
      });

      if (!booking) {
        logger.w('Booking not found', {
          tenantId,
          tenantCode,
          bookingId: bookingDto.bookingId,
        });
        throw new Error('Booking not found');
      }

      await service.updateBookingStatus(
        booking.id,
        bookingDto.status,
        tenant,
        tx,
        userId!,
      );

      await vehicleService.updateVehicleStatus(
        booking.vehicleId,
        bookingDto.vehicleStatus,
        tenant,
        tx,
        userId!,
      );

      await service.createRentalActivity(bookingDto, tenant, tx, userId!);
    });

    const updatedBooking = await repo.getRentalById(
      bookingDto.bookingId,
      tenantId,
    );
    const bookings = await repo.getRentals(tenantId);

    return res.status(200).json({
      message: `Booking #${updatedBooking!.rentalNumber} started successfully`,
      updatedBooking,
      bookings,
    });
  } catch (error) {
    logger.e(error, 'Failed to start booking', {
      tenantId,
      tenantCode,
      bookingId: bookingDto.bookingId,
    });
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
const endBooking = async (req: Request, res: Response) => {
  const tenantId = req.user?.tenantId;
  const tenantCode = req.user?.tenantCode;
  const { data } = req.body;
  const userId = req.user?.id;

  if (!tenantId) {
    logger.w('Tenant ID is missing', { tenantId });
    return res.status(400).json({ error: 'Tenant ID is required' });
  }

  if (!data) {
    logger.w('Rental confirmation data is missing', { tenantId });
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
      const tenant = await tx.tenant.findUnique({
        where: { id: tenantId },
      });

      if (!tenant) {
        logger.w('Tenant not found', { tenantId });
        throw new Error('Tenant not found');
      }

      const booking = await tx.rental.findUnique({
        where: { id: bookingDto.bookingId },
      });

      if (!booking) {
        logger.w('Booking not found', {
          tenantId,
          tenantCode,
          bookingId: bookingDto.bookingId,
        });
        throw new Error('Booking not found');
      }

      await service.updateBookingStatus(
        booking.id,
        bookingDto.status,
        tenant,
        tx,
        userId!,
      );

      await vehicleService.updateVehicleStatus(
        booking.vehicleId,
        bookingDto.vehicleStatus,
        tenant,
        tx,
        userId!,
      );

      await service.createRentalActivity(
        bookingDto,
        tenant,
        tx,
        userId!,
        bookingDto.returnDate ? new Date(bookingDto.returnDate) : undefined,
      );
    });

    const updatedBooking = await repo.getRentalById(
      bookingDto.bookingId,
      tenantId,
    );
    const bookings = await repo.getRentals(tenantId);

    return res.status(200).json({
      message: `Booking #${updatedBooking!.rentalNumber} ended successfully`,
      updatedBooking,
      bookings,
    });
  } catch (error) {
    logger.e(error, 'Failed to end booking', {
      tenantId,
      tenantCode,
      bookingId: bookingDto.bookingId,
    });
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

//#region Generate Documents
const generateInvoice = async (req: Request, res: Response) => {
  const tenantId = req.user?.tenantId;
  const tenantCode = req.user?.tenantCode;
  const { id } = req.params;
  const userId = req.user?.id;

  if (!tenantId) {
    logger.w('Tenant ID is missing', { tenantId });
    return res.status(400).json({ error: 'Tenant ID is required' });
  }

  try {
    const invoice = await prisma.$transaction(
      async (tx) => {
        const tenant = await tx.tenant.findUnique({ where: { id: tenantId } });

        if (!tenant) {
          logger.w('Tenant not found', { tenantId });
          throw new Error('Tenant not found');
        }

        const booking = await tx.rental.findUnique({
          where: { id },
        });

        if (!booking) {
          logger.w('Booking not found', {
            tenantId,
            tenantCode,
            bookingId: id,
          });
          throw new Error('Booking not found');
        }

        return await service.generateInvoice(booking.id, tenant, tx, userId!);
      },
      { maxWait: 10000, timeout: 20000 },
    );

    return res.status(200).json({
      message: `${invoice.invoiceNumber} generated successfully`,
    });
  } catch (error) {
    logger.e(error, 'Failed to generate rental invoice', { tenantId });
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
const generateBookingAgreement = async (req: Request, res: Response) => {
  const tenantId = req.user?.tenantId;
  const tenantCode = req.user?.tenantCode;
  const { id } = req.params;
  const userId = req.user?.id;

  if (!tenantId) {
    logger.w('Tenant ID is missing', { tenantId });
    return res.status(400).json({ error: 'Tenant ID is required' });
  }

  try {
    const agreement = await prisma.$transaction(
      async (tx) => {
        const tenant = await tx.tenant.findUnique({ where: { id: tenantId } });

        if (!tenant) {
          logger.w('Tenant not found', { tenantId });
          throw new Error('Tenant not found');
        }

        const booking = await tx.rental.findUnique({
          where: { id },
        });

        if (!booking) {
          logger.w('Booking not found', {
            tenantId,
            tenantCode,
            bookingId: id,
          });
          throw new Error('Booking not found');
        }

        return await service.generateBookingAgreement(
          booking.id,
          tenant,
          tx,
          userId!,
        );
      },
      { maxWait: 10000, timeout: 20000 },
    );

    return res.status(200).json({
      message: `${agreement.number} generated successfully`,
    });
  } catch (error) {
    logger.e(error, 'Failed to generate rental agreement', { tenantId });
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
};
