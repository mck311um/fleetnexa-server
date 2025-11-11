"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bookingRepo = void 0;
const prisma_config_1 = __importDefault(require("../../config/prisma.config"));
class BookingRepository {
    async getBookings(tenantId, additionalWhere) {
        return prisma_config_1.default.rental.findMany({
            where: {
                tenantId,
                isDeleted: false,
                ...additionalWhere,
            },
            include: this.getRentalIncludeOptions(),
        });
    }
    async getRentalById(id, tenantId) {
        return prisma_config_1.default.rental.findUnique({
            where: { id, tenantId, isDeleted: false },
            include: this.getRentalIncludeOptions(),
        });
    }
    async getRentalByCode(bookingCode, tenantId) {
        return prisma_config_1.default.rental.findUnique({
            where: { bookingCode, tenantId, isDeleted: false },
            include: this.getRentalIncludeOptions(),
        });
    }
    async getRentalsByCustomerId(customerId, tenantId, additionalWhere) {
        return prisma_config_1.default.rental.findMany({
            where: {
                tenantId,
                isDeleted: false,
                drivers: {
                    some: {
                        driverId: customerId,
                    },
                },
                ...additionalWhere,
            },
            include: this.getRentalIncludeOptions(),
        });
    }
    getRentalIncludeOptions() {
        return {
            pickup: true,
            return: true,
            invoice: true,
            agreement: true,
            chargeType: true,
            user: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    username: true,
                },
            },
            charges: true,
            refunds: {
                where: { isDeleted: false },
                include: {
                    customer: true,
                },
            },
            transactions: {
                where: { isDeleted: false },
                include: {
                    payment: {
                        include: {
                            customer: true,
                            paymentMethod: true,
                            paymentType: true,
                        },
                    },
                    refund: true,
                    user: {
                        select: {
                            firstName: true,
                            lastName: true,
                            username: true,
                        },
                    },
                },
                orderBy: {
                    transactionDate: 'desc',
                },
            },
            vehicle: {
                include: {
                    brand: true,
                    model: {
                        include: {
                            bodyType: true,
                        },
                    },
                    vehicleStatus: true,
                    transmission: true,
                    wheelDrive: true,
                    fuelType: true,
                    features: true,
                    damages: {
                        where: { isDeleted: false },
                        include: {
                            customer: true,
                        },
                    },
                },
            },
            drivers: {
                include: {
                    customer: {
                        include: {
                            license: true,
                            address: {
                                include: {
                                    village: true,
                                    country: true,
                                    state: true,
                                },
                            },
                            violations: {
                                where: { isDeleted: false },
                                include: {
                                    violation: true,
                                },
                            },
                        },
                    },
                },
            },
            payments: {
                where: { isDeleted: false },
                include: {
                    paymentMethod: true,
                    paymentType: true,
                },
            },
            values: {
                include: {
                    extras: true,
                },
            },
        };
    }
}
exports.bookingRepo = new BookingRepository();
