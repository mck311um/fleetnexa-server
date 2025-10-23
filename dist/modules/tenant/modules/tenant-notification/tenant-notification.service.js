"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tenantNotificationService = void 0;
const logger_1 = require("../../../../config/logger");
const prisma_config_1 = __importDefault(require("../../../../config/prisma.config"));
const formatter_1 = __importDefault(require("../../../../utils/formatter"));
const app_1 = __importDefault(require("../../../../app"));
class TenantNotificationService {
    async sendBookingNotification(bookingId, tenant) {
        try {
            const booking = await prisma_config_1.default.rental.findUnique({
                where: { id: bookingId, tenantId: tenant.id },
                include: {
                    vehicle: {
                        include: {
                            brand: true,
                            model: true,
                        },
                    },
                    drivers: {
                        where: { isPrimary: true },
                        include: {
                            customer: true,
                        },
                    },
                },
            });
            if (!booking) {
                throw new Error('Booking not found');
            }
            const bookingNumber = booking?.rentalNumber;
            const actionUrl = `/app/bookings/${bookingNumber}`;
            const driverName = booking.drivers[0]?.customer
                ? `${booking.drivers[0].customer.firstName} ${booking.drivers[0].customer.lastName}`
                : 'Valued Customer';
            const vehicleName = `${booking.vehicle.brand.brand} ${booking.vehicle.model.model}`;
            const fromDate = formatter_1.default.formatDateToFriendlyDateShort(new Date(booking.startDate));
            const toDate = formatter_1.default.formatDateToFriendlyDateShort(new Date(booking.endDate));
            const message = `${driverName} just submitted a booking request for a ${vehicleName}, scheduled from ${fromDate} to ${toDate}, via your storefront.`;
            const notification = await prisma_config_1.default.tenantNotification.create({
                data: {
                    tenantId: tenant.id,
                    title: 'New Booking Request',
                    type: 'BOOKING',
                    priority: 'HIGH',
                    message,
                    actionUrl,
                    read: false,
                    createdAt: new Date(),
                },
            });
            const io = app_1.default.get('io');
            io.to(tenant.id).emit('tenant-notification', notification);
        }
        catch (error) {
            logger_1.logger.e(error, 'Failed to send booking notification', {
                bookingId,
                tenantId: tenant.id,
            });
            throw new Error('Failed to send booking notification');
        }
    }
}
exports.tenantNotificationService = new TenantNotificationService();
