"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bookingService = void 0;
const client_1 = require("@prisma/client");
const generator_service_1 = __importDefault(require("../../services/generator.service"));
const logger_1 = require("../../config/logger");
const pdf_service_1 = __importDefault(require("../../services/pdf.service"));
const document_service_1 = __importDefault(require("../../services/document.service"));
const customer_service_1 = __importDefault(require("../customer/customer.service"));
const prisma_config_1 = __importDefault(require("../../config/prisma.config"));
const transaction_service_1 = __importDefault(require("../transaction/transaction.service"));
const console_1 = require("console");
const booking_repository_1 = require("./booking.repository");
class BookingService {
    async getTenantBookings(tenant) {
        try {
            return await booking_repository_1.bookingRepo.getBookings(tenant.id);
        }
        catch (error) {
            logger_1.logger.e(error, 'Failed to get bookings', {
                tenantId: tenant.id,
                tenantCode: tenant.tenantCode,
            });
            throw new Error('Failed to get bookings');
        }
    }
    async getBookingById(tenant, bookingId) {
        try {
            const booking = await booking_repository_1.bookingRepo.getRentalById(bookingId, tenant.id);
            if (!booking) {
                throw new Error('Booking not found');
            }
            return booking;
        }
        catch (error) {
            logger_1.logger.e(error, 'Failed to get booking by ID', {
                tenantId: tenant.id,
                tenantCode: tenant.tenantCode,
                bookingId,
            });
            throw new Error('Failed to get booking by ID');
        }
    }
    async updateBookingStatus(bookingId, status, tenant, user) {
        try {
            const booking = await prisma_config_1.default.rental.findUnique({
                where: { id: bookingId },
            });
            if (!booking) {
                throw new Error('Booking not found');
            }
            await prisma_config_1.default.rental.update({
                where: { id: bookingId },
                data: {
                    status,
                    updatedAt: new Date(),
                    updatedBy: user.username,
                },
            });
            return;
        }
        catch (error) {
            logger_1.logger.e(error, 'Failed to update booking status', {
                tenantId: tenant.id,
                tenantCode: tenant.tenantCode,
                bookingId,
                status,
            });
            throw new Error('Failed to update booking status');
        }
    }
    async createRentalActivity(data, tenant, userId, createdAt) {
        try {
            const booking = await prisma_config_1.default.rental.findUnique({
                where: { id: data.bookingId },
            });
            if (!booking) {
                throw new Error('Booking not found');
            }
            const primaryDriver = await customer_service_1.default.getPrimaryDriver(booking.id);
            if (!primaryDriver) {
                throw new Error('Primary driver not found');
            }
            await prisma_config_1.default.rentalActivity.create({
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
        }
        catch (error) {
            logger_1.logger.e(error, 'Failed to create rental activity', {
                tenantId: tenant.id,
                tenantCode: tenant.tenantCode,
                bookingId: data.bookingId,
                action: data.action,
            });
            throw new Error('Failed to create rental activity');
        }
    }
    async generateInvoice(bookingId, tenant, user) {
        try {
            let invoiceNumber;
            const booking = await prisma_config_1.default.rental.findUnique({
                where: { id: bookingId },
                include: { values: true },
            });
            if (!booking) {
                throw new Error('Booking not found');
            }
            const existingInvoice = await prisma_config_1.default.invoice.findUnique({
                where: { rentalId: bookingId },
            });
            if (existingInvoice) {
                invoiceNumber = existingInvoice.invoiceNumber;
            }
            else {
                invoiceNumber = await generator_service_1.default.generateInvoiceNumber(tenant.id);
            }
            const data = await document_service_1.default.generateInvoiceData(bookingId, tenant.id);
            const { publicUrl } = await pdf_service_1.default.createInvoice({
                ...data,
                invoiceNumber,
            }, invoiceNumber, tenant?.tenantCode);
            const primaryDriver = await customer_service_1.default.getPrimaryDriver(bookingId);
            if (!primaryDriver) {
                throw new Error('Primary driver not found');
            }
            const invoice = await prisma_config_1.default.invoice.upsert({
                where: { rentalId: bookingId },
                create: {
                    invoiceNumber,
                    amount: booking?.values?.netTotal || 0,
                    customerId: primaryDriver?.driverId || '',
                    rentalId: booking?.id || '',
                    tenantId: tenant.id,
                    createdAt: new Date(),
                    createdBy: user.username,
                    invoiceUrl: publicUrl,
                },
                update: {
                    amount: booking?.values?.netTotal || 0,
                    customerId: primaryDriver?.driverId || '',
                    tenantId: tenant.id,
                    invoiceUrl: publicUrl,
                    updatedAt: new Date(),
                    updatedBy: user.username,
                },
            });
            return invoice;
        }
        catch (error) {
            logger_1.logger.e(error, 'Failed to generate invoice', {
                bookingId,
                tenantId: tenant.id,
                tenantCode: tenant.tenantCode,
            });
            throw new Error('Failed to generate invoice');
        }
    }
    async generateBookingAgreement(bookingId, tenant, user) {
        try {
            let agreementNumber;
            const booking = await prisma_config_1.default.rental.findUnique({
                where: { id: bookingId },
                include: { values: true },
            });
            if (!booking) {
                throw new Error('Booking not found');
            }
            const existingAgreement = await prisma_config_1.default.rentalAgreement.findUnique({
                where: { rentalId: bookingId },
            });
            if (existingAgreement) {
                agreementNumber = existingAgreement.number;
            }
            else {
                agreementNumber = await generator_service_1.default.generateRentalAgreementNumber(tenant.id);
            }
            const data = await document_service_1.default.generateAgreementData(bookingId, tenant.id);
            const { publicUrl, signablePublicUrl } = await pdf_service_1.default.createAgreement({
                ...data,
                agreementNumber,
            }, agreementNumber, tenant?.tenantCode);
            const primaryDriver = await customer_service_1.default.getPrimaryDriver(bookingId);
            const agreement = await prisma_config_1.default.rentalAgreement.upsert({
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
        }
        catch (error) {
            logger_1.logger.e(error, 'Failed to generate booking agreement', {
                bookingId,
                tenantId: tenant.id,
                tenantCode: tenant.tenantCode,
            });
            throw new Error('Failed to generate booking agreement');
        }
    }
}
exports.bookingService = new BookingService();
const createBooking = async (tenant, data, tx, userId) => {
    try {
        const bookingNumber = await generator_service_1.default.generateRentalNumber(tenant.id);
        if (!bookingNumber) {
            throw console_1.error;
        }
        const bookingCode = generator_service_1.default.generateBookingCode(tenant.tenantCode, bookingNumber);
        if (!bookingCode) {
            throw console_1.error;
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
                status: client_1.RentalStatus.PENDING,
                agent: data.agent ?? client_1.Agent.SYSTEM,
            },
        });
        await Promise.all(data.drivers.map((driver) => tx.rentalDriver.create({
            data: {
                ...driver,
                rentalId: newBooking.id,
            },
        })));
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
        await Promise.all(data.values.extras.map((extra) => tx.rentalExtra.create({
            data: {
                id: extra.id,
                extraId: extra.extraId,
                amount: extra.amount,
                customAmount: extra.customAmount,
                valuesId: extra.valuesId,
            },
        })));
        return newBooking;
    }
    catch (error) {
        logger_1.logger.e(error, 'Failed to create booking', {
            tenantId: tenant.id,
            tenantCode: tenant.tenantCode,
        });
        throw error;
    }
};
const updateBooking = async (data, tenant, tx, userId) => {
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
                status: data.status ?? client_1.RentalStatus.PENDING,
                agent: data.agent ?? client_1.Agent.SYSTEM,
                updatedAt: new Date(),
                updatedBy: userId,
            },
        });
        await tx.rentalDriver.deleteMany({ where: { rentalId: booking.id } });
        await Promise.all(data.drivers.map((driver) => tx.rentalDriver.create({
            data: {
                ...driver,
                rentalId: booking.id,
            },
        })));
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
        await Promise.all(data.values.extras.map((extra) => tx.rentalExtra.create({
            data: {
                id: extra.id,
                extraId: extra.extraId,
                amount: extra.amount,
                customAmount: extra.customAmount,
                valuesId: extra.valuesId,
            },
        })));
        return updatedBooking;
    }
    catch (error) {
        logger_1.logger.e(error, 'Failed to update booking', {
            tenantId: tenant.id,
            tenantCode: tenant.tenantCode,
        });
        throw new Error('Failed to update booking');
    }
};
const deleteBooking = async (bookingId, tenant, tx, userId) => {
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
        await transaction_service_1.default.deleteBookingTransaction(bookingId, tx);
    }
    catch (error) {
        logger_1.logger.e(error, 'Failed to delete booking', {
            tenantId: tenant.id,
            tenantCode: tenant.tenantCode,
            bookingId,
        });
        throw error;
    }
};
exports.default = {
    createBooking,
    updateBooking,
    deleteBooking,
};
