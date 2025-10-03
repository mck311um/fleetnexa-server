"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tenantRepo = void 0;
const date_fns_1 = require("date-fns");
const prisma_config_1 = __importDefault(require("../config/prisma.config"));
class TenantRepository {
    async getTenantById(tenantId) {
        return prisma_config_1.default.tenant.findUnique({
            where: { id: tenantId },
            include: this.getTenantIncludeOptions(),
        });
    }
    getTenantIncludeOptions() {
        return {
            address: {
                include: {
                    village: true,
                    state: true,
                    country: true,
                },
            },
            currency: true,
            invoiceSequence: true,
            paymentMethods: true,
            customers: true,
            subscription: {
                include: {
                    payments: {
                        include: {
                            plan: true,
                        },
                    },
                    plan: {
                        include: {
                            details: true,
                            features: true,
                        },
                    },
                },
            },
            services: {
                where: { isDeleted: false },
                include: {
                    service: true,
                },
            },
            insurance: {
                where: { isDeleted: false },
            },
            equipment: {
                where: { isDeleted: false },
                include: {
                    equipment: true,
                },
            },
            tenantLocations: {
                where: { isDeleted: false },
                include: {
                    vehicles: true,
                    _count: {
                        select: { vehicles: true },
                    },
                },
            },
            weeklyStats: {
                where: {
                    OR: getFilters(),
                },
            },
            monthlyStats: true,
            monthlyRentalStats: true,
            yearlyStats: true,
            cancellationPolicy: true,
            latePolicy: true,
            transactions: {
                where: { isDeleted: false },
                include: {
                    customer: true,
                    payment: {
                        include: {
                            paymentMethod: true,
                            paymentType: true,
                        },
                    },
                    // user: {
                    //   select: {
                    //     firstName: true,
                    //     lastName: true,
                    //     username: true,
                    //   },
                    // },
                },
            },
            rentalActivity: {
                include: {
                    vehicle: {
                        select: {
                            brand: true,
                            model: true,
                        },
                    },
                    customer: true,
                },
            },
            currencyRates: {
                include: {
                    currency: true,
                },
            },
        };
    }
}
exports.tenantRepo = new TenantRepository();
const getFilters = () => {
    const now = new Date();
    const currentWeek = (0, date_fns_1.getISOWeek)(now);
    const currentYear = (0, date_fns_1.getYear)(now);
    return [
        {
            year: currentYear,
            week: {
                lte: currentWeek,
            },
        },
    ];
};
