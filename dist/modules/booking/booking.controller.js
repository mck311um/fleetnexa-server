"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const booking_service_1 = __importStar(require("./booking.service"));
const email_service_1 = __importDefault(require("../email/email.service"));
const vehicle_service_1 = __importDefault(require("../vehicle/vehicle.service"));
const logger_1 = require("../../config/logger");
const prisma_config_1 = __importDefault(require("../../config/prisma.config"));
const create_booking_dto_1 = require("./dto/create-booking.dto");
const update_booking_dto_1 = require("./dto/update-booking.dto");
const action_booking_dto_1 = require("./dto/action-booking.dto");
const client_1 = require("@prisma/client");
const tenant_repository_1 = require("../../repository/tenant.repository");
const booking_repository_1 = require("./booking.repository");
//#region Get Bookings
const getBookings = async (req, res) => {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
        return res.status(401).json({ error: 'Tenant ID is required' });
    }
    try {
        const tenant = await tenant_repository_1.tenantRepo.getTenantById(tenantId);
        if (!tenant) {
            logger_1.logger.w('Tenant not found', { tenantId });
            return res.status(404).json({ error: 'Tenant not found' });
        }
        const bookings = await booking_service_1.bookingService.getTenantBookings(tenant);
        return res.status(200).json(bookings);
    }
    catch (error) {
        logger_1.logger.e(error, 'Failed to fetch bookings', { tenantId });
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};
const getBookingById = async (req, res) => {
    const tenantId = req.user?.tenantId;
    const { id } = req.params;
    if (!tenantId) {
        logger_1.logger.w('Tenant ID is missing', { tenantId });
        return res.status(400).json({ error: 'Tenant ID is required' });
    }
    if (!id) {
        logger_1.logger.w('Booking ID is missing', { tenantId });
        return res.status(400).json({ error: 'Booking ID is required' });
    }
    try {
        const booking = await booking_repository_1.bookingRepo.getRentalById(tenantId, id);
        if (!booking) {
            logger_1.logger.w('Booking not found', { tenantId, id });
            return res.status(404).json({ error: 'Booking not found' });
        }
        return res.status(200).json(booking);
    }
    catch (error) {
        logger_1.logger.e(error, 'Failed to fetch booking', { tenantId, id });
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};
const getBookingByCode = async (req, res) => {
    const tenantId = req.user?.tenantId;
    const tenantCode = req.user?.tenantCode;
    const { bookingCode } = req.params;
    if (!tenantId) {
        logger_1.logger.w('Tenant ID is missing', { tenantId });
        return res.status(400).json({ error: 'Tenant ID is required' });
    }
    if (!bookingCode) {
        logger_1.logger.w('Booking code is missing', { tenantId });
        return res.status(400).json({ error: 'Booking code is required' });
    }
    try {
        logger_1.logger.i('Fetching booking by code', { tenantId, bookingCode });
        const booking = await booking_repository_1.bookingRepo.getRentalByCode(bookingCode, tenantId);
        if (!booking) {
            logger_1.logger.w('Booking not found', { tenantId, bookingCode });
            return res.status(404).json({ error: 'Booking not found' });
        }
        return res.status(200).json({
            message: `Booking #${booking.bookingCode} fetched successfully`,
            booking,
        });
    }
    catch (error) {
        logger_1.logger.e(error, 'Failed to fetch booking', {
            tenantId,
            tenantCode,
            bookingCode,
        });
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};
//#endregion
const createSystemBooking = async (req, res) => {
    const tenantId = req.user?.tenantId;
    const tenantCode = req.user?.tenantCode;
    const { data } = req.body;
    if (!tenantId) {
        logger_1.logger.w('Tenant ID is missing', { tenantId });
        return res.status(400).json({ error: 'Tenant ID is required' });
    }
    if (!data) {
        logger_1.logger.w('Booking data is missing', { tenantId });
        return res.status(400).json({ error: 'Booking data is required' });
    }
    const parseResult = create_booking_dto_1.CreateBookingDtoSchema.safeParse(data);
    if (!parseResult.success) {
        return res.status(400).json({
            error: 'Invalid booking data',
            details: parseResult.error.issues,
        });
    }
    const bookingDto = parseResult.data;
    try {
        const booking = await prisma_config_1.default.$transaction(async (tx) => {
            const tenant = await tx.tenant.findUnique({ where: { id: tenantId } });
            if (!tenant) {
                logger_1.logger.w('Tenant not found', { tenantId });
                throw new Error('Tenant not found');
            }
            return booking_service_1.default.createBooking(tenant, bookingDto, tx, req.user?.id);
        });
        logger_1.logger.i('Booking created successfully', {
            tenantId,
            tenantCode: tenantCode,
            bookingId: booking.id,
            bookingCode: booking.bookingCode,
        });
        const updatedBooking = await booking_repository_1.bookingRepo.getRentalById(booking.id, tenantId);
        const bookings = await booking_repository_1.bookingRepo.getBookings(tenantId);
        return res.status(201).json({
            message: `Booking #${booking.rentalNumber} created successfully`,
            updatedBooking,
            bookings,
        });
    }
    catch (error) {
        logger_1.logger.e(error, 'Failed to create booking', { tenantId });
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};
const updateBooking = async (req, res) => {
    const tenantId = req.user?.tenantId;
    const tenantCode = req.user?.tenantCode;
    const { id } = req.params;
    const { data } = req.body;
    const userId = req.user?.id;
    if (!tenantId) {
        logger_1.logger.w('Tenant ID is missing', { tenantId });
        return res.status(400).json({ error: 'Tenant ID is required' });
    }
    if (!id) {
        logger_1.logger.w('Booking ID is missing', { tenantId });
        return res.status(400).json({ error: 'Booking ID is required' });
    }
    if (!data) {
        logger_1.logger.w('Booking data is missing', { tenantId });
        return res.status(400).json({ error: 'Booking data is required' });
    }
    const parseResult = update_booking_dto_1.UpdateBookingDtoSchema.safeParse(data);
    if (!parseResult.success) {
        return res.status(400).json({
            error: 'Invalid booking data',
            details: parseResult.error.issues,
        });
    }
    const bookingDto = parseResult.data;
    try {
        const booking = await prisma_config_1.default.$transaction(async (tx) => {
            const tenant = await tx.tenant.findUnique({
                where: { id: tenantId },
            });
            if (!tenant) {
                logger_1.logger.w('Tenant not found', { tenantId });
                throw new Error('Tenant not found');
            }
            const existingBooking = await tx.rental.findUnique({
                where: { id },
            });
            if (!existingBooking) {
                logger_1.logger.w('Booking not found', { tenantId, id });
                throw new Error('Booking not found');
            }
            return booking_service_1.default.updateBooking(bookingDto, tenant, tx, userId);
        });
        logger_1.logger.i('Booking updated successfully', {
            tenantId,
            tenantCode,
            bookingId: booking.id,
            bookingCode: booking.bookingCode,
        });
        const updatedBooking = await booking_repository_1.bookingRepo.getRentalById(booking.id, tenantId);
        const bookings = await booking_repository_1.bookingRepo.getBookings(tenantId);
        return res.status(200).json({
            message: `Booking #${booking.rentalNumber} updated successfully`,
            updatedBooking,
            bookings,
        });
    }
    catch (error) {
        logger_1.logger.e(error, 'Failed to update booking', { tenantId, id });
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};
const deleteBooking = async (req, res) => {
    const { id } = req.params;
    const tenantId = req.user?.tenantId;
    const tenantCode = req.user?.tenantCode;
    const userId = req.user?.id;
    if (!tenantId) {
        logger_1.logger.w('Tenant ID is missing', { tenantId });
        return res.status(400).json({ error: 'Tenant ID is required' });
    }
    if (!id) {
        logger_1.logger.w('Booking ID is missing', { tenantId });
        return res.status(400).json({ error: 'Booking ID is required' });
    }
    try {
        await prisma_config_1.default.$transaction(async (tx) => {
            const tenant = await tx.tenant.findUnique({ where: { id: tenantId } });
            if (!tenant) {
                logger_1.logger.w('Tenant not found', { tenantId });
                throw new Error('Tenant not found');
            }
            await booking_service_1.default.deleteBooking(id, tenant, tx, userId);
        });
        logger_1.logger.i('Booking deleted successfully', {
            tenantId,
            tenantCode,
            bookingId: id,
        });
        const bookings = await booking_repository_1.bookingRepo.getBookings(tenantId);
        return res.status(200).json({
            message: `Booking  deleted successfully`,
            bookings,
        });
    }
    catch (error) {
        logger_1.logger.e(error, 'Failed to delete booking', { tenantId, id });
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};
const confirmBooking = async (req, res) => {
    const tenantId = req.user?.tenantId;
    const tenantCode = req.user?.tenantCode;
    const { data } = req.body;
    const userId = req.user?.id;
    if (!tenantId) {
        logger_1.logger.w('Tenant ID is missing', { tenantId });
        return res.status(400).json({ error: 'Tenant ID is required' });
    }
    if (!data) {
        logger_1.logger.w('Rental confirmation data is missing', { tenantId });
        return res
            .status(400)
            .json({ error: 'Rental confirmation data is required' });
    }
    const parseResult = action_booking_dto_1.ActionBookingDtoSchema.safeParse(data);
    if (!parseResult.success) {
        return res.status(400).json({
            error: 'Invalid booking confirmation data',
            details: parseResult.error.issues,
        });
    }
    const bookingDto = parseResult.data;
    try {
        let updatedBooking = null;
        let tenant = null;
        await prisma_config_1.default.$transaction(async (tx) => {
            tenant = await tx.tenant.findUnique({ where: { id: tenantId } });
            if (!tenant) {
                logger_1.logger.w('Tenant not found', { tenantId });
                throw new Error('Tenant not found');
            }
            const booking = await tx.rental.findUnique({
                where: { id: bookingDto.bookingId },
            });
            if (!booking) {
                logger_1.logger.w('Booking not found', {
                    tenantId,
                    bookingId: bookingDto.bookingId,
                });
                throw new Error('Booking not found');
            }
            if (!tenant) {
                logger_1.logger.w('Tenant not found', { tenantId });
                throw new Error('Tenant not found');
            }
            await booking_service_1.default.updateBookingStatus(bookingDto.bookingId, client_1.RentalStatus.CONFIRMED, tenant, tx, userId);
            await booking_service_1.default.createRentalActivity(bookingDto, tenant, tx, userId);
            updatedBooking = await booking_repository_1.bookingRepo.getRentalById(bookingDto.bookingId, tenantId);
        });
        (async () => {
            try {
                await email_service_1.default.sendConfirmationEmail(updatedBooking.id, tenant, prisma_config_1.default);
                await booking_service_1.default.generateInvoice(updatedBooking.id, tenant, prisma_config_1.default, userId);
                await booking_service_1.default.generateBookingAgreement(updatedBooking.id, tenant, prisma_config_1.default, userId);
            }
            catch (err) {
                logger_1.logger.e(err, 'Background document/email generation failed', {
                    tenantId,
                    bookingId: updatedBooking.id,
                });
            }
        })();
        const bookings = await booking_repository_1.bookingRepo.getBookings(tenantId);
        logger_1.logger.i('Booking confirmed successfully', {
            tenantId,
            tenantCode,
            bookingId: updatedBooking.id,
            bookingCode: updatedBooking.bookingCode,
        });
        return res.status(200).json({
            message: `Booking #${updatedBooking.rentalNumber} confirmed successfully`,
            updatedBooking,
            bookings,
        });
    }
    catch (error) {
        logger_1.logger.e(error, 'Failed to confirm booking', { tenantId });
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};
const declineBooking = async (req, res) => {
    const tenantId = req.user?.tenantId;
    const tenantCode = req.user?.tenantCode;
    const { id } = req.params;
    const userId = req.user?.id;
    if (!tenantId) {
        logger_1.logger.w('Tenant ID is missing', { tenantId });
        return res.status(400).json({ error: 'Tenant ID is required' });
    }
    try {
        await prisma_config_1.default.$transaction(async (tx) => {
            const tenant = await tx.tenant.findUnique({ where: { id: tenantId } });
            if (!tenant) {
                logger_1.logger.w('Tenant not found', { tenantId });
                throw new Error('Tenant not found');
            }
            const booking = await tx.rental.findUnique({
                where: { id },
            });
            if (!booking) {
                logger_1.logger.w('Booking not found', {
                    tenantId,
                    tenantCode,
                    bookingId: id,
                });
                throw new Error('Booking not found');
            }
            await booking_service_1.default.updateBookingStatus(booking.id, client_1.RentalStatus.DECLINED, tenant, tx, userId);
        });
        const updatedBooking = await booking_repository_1.bookingRepo.getRentalById(id, tenantId);
        const bookings = await booking_repository_1.bookingRepo.getBookings(tenantId);
        return res.status(200).json({
            message: `Booking #${updatedBooking.rentalNumber} declined successfully`,
            updatedBooking,
            bookings,
        });
    }
    catch (error) {
        logger_1.logger.e(error, 'Failed to decline booking', { tenantId });
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};
const cancelBooking = async (req, res) => {
    const tenantId = req.user?.tenantId;
    const tenantCode = req.user?.tenantCode;
    const { id } = req.params;
    const userId = req.user?.id;
    if (!tenantId) {
        logger_1.logger.w('Tenant ID is missing', { tenantId });
        return res.status(400).json({ error: 'Tenant ID is required' });
    }
    try {
        await prisma_config_1.default.$transaction(async (tx) => {
            const tenant = await tx.tenant.findUnique({ where: { id: tenantId } });
            if (!tenant) {
                logger_1.logger.w('Tenant not found', { tenantId });
                throw new Error('Tenant not found');
            }
            const booking = await tx.rental.findUnique({
                where: { id },
            });
            if (!booking) {
                logger_1.logger.w('Booking not found', {
                    tenantId,
                    tenantCode,
                    bookingId: id,
                });
                throw new Error('Booking not found');
            }
            await booking_service_1.default.updateBookingStatus(booking.id, client_1.RentalStatus.CANCELED, tenant, tx, userId);
        });
        const updatedBooking = await booking_repository_1.bookingRepo.getRentalById(id, tenantId);
        const bookings = await booking_repository_1.bookingRepo.getBookings(tenantId);
        return res.status(200).json({
            message: `Booking #${updatedBooking.rentalNumber} cancelled successfully`,
            updatedBooking,
            bookings,
        });
    }
    catch (error) {
        logger_1.logger.e(error, 'Failed to cancel booking', { tenantId });
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};
const startBooking = async (req, res) => {
    const tenantId = req.user?.tenantId;
    const tenantCode = req.user?.tenantCode;
    const { data } = req.body;
    const userId = req.user?.id;
    if (!tenantId) {
        logger_1.logger.w('Tenant ID is missing', { tenantId });
        return res.status(400).json({ error: 'Tenant ID is required' });
    }
    if (!data) {
        logger_1.logger.w('Rental confirmation data is missing', { tenantId });
        return res
            .status(400)
            .json({ error: 'Rental confirmation data is required' });
    }
    const parseResult = action_booking_dto_1.ActionBookingDtoSchema.safeParse(data);
    if (!parseResult.success) {
        return res.status(400).json({
            error: 'Invalid booking confirmation data',
            details: parseResult.error.issues,
        });
    }
    const bookingDto = parseResult.data;
    try {
        await prisma_config_1.default.$transaction(async (tx) => {
            const tenant = await tx.tenant.findUnique({
                where: { id: tenantId },
            });
            if (!tenant) {
                logger_1.logger.w('Tenant not found', { tenantId });
                throw new Error('Tenant not found');
            }
            const booking = await tx.rental.findUnique({
                where: { id: bookingDto.bookingId },
            });
            if (!booking) {
                logger_1.logger.w('Booking not found', {
                    tenantId,
                    tenantCode,
                    bookingId: bookingDto.bookingId,
                });
                throw new Error('Booking not found');
            }
            await booking_service_1.default.updateBookingStatus(booking.id, bookingDto.status, tenant, tx, userId);
            await vehicle_service_1.default.updateVehicleStatus(booking.vehicleId, bookingDto.vehicleStatus, tenant, tx, userId);
            await booking_service_1.default.createRentalActivity(bookingDto, tenant, tx, userId);
        });
        const updatedBooking = await booking_repository_1.bookingRepo.getRentalById(bookingDto.bookingId, tenantId);
        const bookings = await booking_repository_1.bookingRepo.getBookings(tenantId);
        return res.status(200).json({
            message: `Booking #${updatedBooking.rentalNumber} started successfully`,
            updatedBooking,
            bookings,
        });
    }
    catch (error) {
        logger_1.logger.e(error, 'Failed to start booking', {
            tenantId,
            tenantCode,
            bookingId: bookingDto.bookingId,
        });
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};
const endBooking = async (req, res) => {
    const tenantId = req.user?.tenantId;
    const tenantCode = req.user?.tenantCode;
    const { data } = req.body;
    const userId = req.user?.id;
    if (!tenantId) {
        logger_1.logger.w('Tenant ID is missing', { tenantId });
        return res.status(400).json({ error: 'Tenant ID is required' });
    }
    if (!data) {
        logger_1.logger.w('Rental confirmation data is missing', { tenantId });
        return res
            .status(400)
            .json({ error: 'Rental confirmation data is required' });
    }
    const parseResult = action_booking_dto_1.ActionBookingDtoSchema.safeParse(data);
    if (!parseResult.success) {
        return res.status(400).json({
            error: 'Invalid booking confirmation data',
            details: parseResult.error.issues,
        });
    }
    const bookingDto = parseResult.data;
    try {
        await prisma_config_1.default.$transaction(async (tx) => {
            const tenant = await tx.tenant.findUnique({
                where: { id: tenantId },
            });
            if (!tenant) {
                logger_1.logger.w('Tenant not found', { tenantId });
                throw new Error('Tenant not found');
            }
            const booking = await tx.rental.findUnique({
                where: { id: bookingDto.bookingId },
            });
            if (!booking) {
                logger_1.logger.w('Booking not found', {
                    tenantId,
                    tenantCode,
                    bookingId: bookingDto.bookingId,
                });
                throw new Error('Booking not found');
            }
            await booking_service_1.default.updateBookingStatus(booking.id, bookingDto.status, tenant, tx, userId);
            await vehicle_service_1.default.updateVehicleStatus(booking.vehicleId, bookingDto.vehicleStatus, tenant, tx, userId);
            await booking_service_1.default.createRentalActivity(bookingDto, tenant, tx, userId, bookingDto.returnDate ? new Date(bookingDto.returnDate) : undefined);
        });
        const updatedBooking = await booking_repository_1.bookingRepo.getRentalById(bookingDto.bookingId, tenantId);
        const bookings = await booking_repository_1.bookingRepo.getBookings(tenantId);
        return res.status(200).json({
            message: `Booking #${updatedBooking.rentalNumber} ended successfully`,
            updatedBooking,
            bookings,
        });
    }
    catch (error) {
        logger_1.logger.e(error, 'Failed to end booking', {
            tenantId,
            tenantCode,
            bookingId: bookingDto.bookingId,
        });
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};
//#region Generate Documents
const generateInvoice = async (req, res) => {
    const tenantId = req.user?.tenantId;
    const tenantCode = req.user?.tenantCode;
    const { id } = req.params;
    const userId = req.user?.id;
    if (!tenantId) {
        logger_1.logger.w('Tenant ID is missing', { tenantId });
        return res.status(400).json({ error: 'Tenant ID is required' });
    }
    try {
        const invoice = await prisma_config_1.default.$transaction(async (tx) => {
            const tenant = await tx.tenant.findUnique({ where: { id: tenantId } });
            if (!tenant) {
                logger_1.logger.w('Tenant not found', { tenantId });
                throw new Error('Tenant not found');
            }
            const booking = await tx.rental.findUnique({
                where: { id },
            });
            if (!booking) {
                logger_1.logger.w('Booking not found', {
                    tenantId,
                    tenantCode,
                    bookingId: id,
                });
                throw new Error('Booking not found');
            }
            return await booking_service_1.default.generateInvoice(booking.id, tenant, tx, userId);
        }, { maxWait: 10000, timeout: 20000 });
        return res.status(200).json({
            message: `${invoice.invoiceNumber} generated successfully`,
            invoice,
        });
    }
    catch (error) {
        logger_1.logger.e(error, 'Failed to generate rental invoice', { tenantId });
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};
const generateBookingAgreement = async (req, res) => {
    const tenantId = req.user?.tenantId;
    const tenantCode = req.user?.tenantCode;
    const { id } = req.params;
    const userId = req.user?.id;
    if (!tenantId) {
        logger_1.logger.w('Tenant ID is missing', { tenantId });
        return res.status(400).json({ error: 'Tenant ID is required' });
    }
    try {
        const agreement = await prisma_config_1.default.$transaction(async (tx) => {
            const tenant = await tx.tenant.findUnique({ where: { id: tenantId } });
            if (!tenant) {
                logger_1.logger.w('Tenant not found', { tenantId });
                throw new Error('Tenant not found');
            }
            const booking = await tx.rental.findUnique({
                where: { id },
            });
            if (!booking) {
                logger_1.logger.w('Booking not found', {
                    tenantId,
                    tenantCode,
                    bookingId: id,
                });
                throw new Error('Booking not found');
            }
            return await booking_service_1.default.generateBookingAgreement(booking.id, tenant, tx, userId);
        }, { maxWait: 10000, timeout: 20000 });
        return res.status(200).json({
            message: `${agreement.number} generated successfully`,
            agreement,
        });
    }
    catch (error) {
        logger_1.logger.e(error, 'Failed to generate rental agreement', { tenantId });
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};
//#endregion
exports.default = {
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
