import { NextFunction, Request, Response } from "express";
import { repo } from "./booking.repository";
import service from "./booking.service";
import { logger } from "../../config/logger";
import prisma from "../../config/prisma.config";
import { CreateBookingDtoSchema } from "./dto/create-booking.dto";
import { UpdateBookingDtoSchema } from "./dto/update-booking.dto";
import { ConfirmBookingDtoSchema } from "./dto/confirm-booking.dto";
import { RentalStatus } from "@prisma/client";

//#region Get Bookings
const getBookings = async (req: Request, res: Response, next: NextFunction) => {
  const tenantId = req.user?.tenantId;

  if (!tenantId) {
    return res.status(401).json({ error: "Tenant ID is required" });
  }

  try {
    const bookings = await repo.getRentals(tenantId);

    return res.status(200).json(bookings);
  } catch (error) {
    logger.e(error, "Failed to fetch bookings", { tenantId });
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
const getBookingById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const tenantId = req.user?.tenantId;
  const { id } = req.params;

  if (!tenantId) {
    logger.w("Tenant ID is missing", { tenantId });
    return res.status(400).json({ error: "Tenant ID is required" });
  }

  if (!id) {
    logger.w("Booking ID is missing", { tenantId });
    return res.status(400).json({ error: "Booking ID is required" });
  }

  try {
    const booking = await repo.getRentalById(tenantId, id);

    if (!booking) {
      logger.w("Booking not found", { tenantId, id });
      return res.status(404).json({ error: "Booking not found" });
    }

    return res.status(200).json(booking);
  } catch (error) {
    logger.e(error, "Failed to fetch booking", { tenantId, id });
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
//#endregion

const createSystemBooking = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const tenantId = req.user?.tenantId;
  const tenantCode = req.user?.tenantCode;
  const { data } = req.body;

  if (!tenantId) {
    logger.w("Tenant ID is missing", { tenantId });
    return res.status(400).json({ error: "Tenant ID is required" });
  }

  if (!data) {
    logger.w("Booking data is missing", { tenantId });
    return res.status(400).json({ error: "Booking data is required" });
  }

  const parseResult = CreateBookingDtoSchema.safeParse(data);
  if (!parseResult.success) {
    return res.status(400).json({
      error: "Invalid booking data",
      details: parseResult.error.issues,
    });
  }

  const bookingDto = parseResult.data;

  try {
    const booking = await prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.findUnique({ where: { id: tenantId } });

      if (!tenant) {
        logger.w("Tenant not found", { tenantId });
        throw new Error("Tenant not found");
      }

      return service.createBooking(tenant, bookingDto, tx, req.user?.id);
    });

    logger.i("Booking created successfully", {
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
    logger.e(error, "Failed to create booking", { tenantId });
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
const updateBooking = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const tenantId = req.user?.tenantId;
  const tenantCode = req.user?.tenantCode;
  const { id } = req.params;
  const { data } = req.body;
  const userId = req.user?.id;

  if (!tenantId) {
    logger.w("Tenant ID is missing", { tenantId });
    return res.status(400).json({ error: "Tenant ID is required" });
  }

  if (!id) {
    logger.w("Booking ID is missing", { tenantId });
    return res.status(400).json({ error: "Booking ID is required" });
  }

  if (!data) {
    logger.w("Booking data is missing", { tenantId });
    return res.status(400).json({ error: "Booking data is required" });
  }

  const parseResult = UpdateBookingDtoSchema.safeParse(data);
  if (!parseResult.success) {
    return res.status(400).json({
      error: "Invalid booking data",
      details: parseResult.error.issues,
    });
  }

  const bookingDto = parseResult.data;

  try {
    const booking = await prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.findUnique({
        where: { id: tenantId },
      });

      const existingBooking = await tx.rental.findUnique({
        where: { id },
      });

      if (!existingBooking) {
        logger.w("Booking not found", { tenantId, id });
        throw new Error("Booking not found");
      }

      return service.updateBooking(bookingDto, tenant, tx, userId!);
    });

    logger.i("Booking updated successfully", {
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
    logger.e(error, "Failed to update booking", { tenantId, id });
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const confirmRental = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const tenantId = req.user?.tenantId;
  const tenantCode = req.user?.tenantCode;
  const { data } = req.body;
  const { id } = req.params;
  const userId = req.user?.id;

  if (!tenantId) {
    logger.w("Tenant ID is missing", { tenantId });
    return res.status(400).json({ error: "Tenant ID is required" });
  }

  if (!data) {
    logger.w("Rental confirmation data is missing", { tenantId });
    return res
      .status(400)
      .json({ error: "Rental confirmation data is required" });
  }

  const parseResult = ConfirmBookingDtoSchema.safeParse(data);
  if (!parseResult.success) {
    return res.status(400).json({
      error: "Invalid booking confirmation data",
      details: parseResult.error.issues,
    });
  }

  const bookingDto = parseResult.data;

  try {
    await prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.findUnique({ where: { id: tenantId } });

      const booking = await tx.rental.findUnique({
        where: { id: bookingDto.bookingId },
      });

      if (!booking) {
        logger.w("Booking not found", {
          tenantId,
          bookingId: bookingDto.bookingId,
        });
        throw new Error("Booking not found");
      }

      if (!tenant) {
        logger.w("Tenant not found", { tenantId });
        throw new Error("Tenant not found");
      }

      await service.updateBookingStatus(
        bookingDto.bookingId,
        RentalStatus.CONFIRMED,
        tenant,
        tx
      );

      await service.createRentalActivity(bookingDto, tenant, tx, userId!);
    });

    const updatedBooking = await repo.getRentalById(id, tenantId);
    const bookings = await repo.getRentals(tenantId);

    logger.i("Booking confirmed successfully", {
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
    logger.e(error, "Failed to confirm booking", { tenantId });
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export default {
  getBookings,
  getBookingById,
  createSystemBooking,
  updateBooking,
  confirmRental,
};
