"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.customerRepo = void 0;
const prisma_config_1 = __importDefault(require("../config/prisma.config"));
class CustomerRepository {
    async getCustomers(tenantId, additionalWhere) {
        return prisma_config_1.default.customer.findMany({
            where: {
                tenantId,
                isDeleted: false,
                ...additionalWhere,
            },
            include: this.getCustomerIncludeOptions(),
        });
    }
    async getCustomerById(id, tenantId) {
        return prisma_config_1.default.customer.findUnique({
            where: { id, tenantId, isDeleted: false },
            include: this.getCustomerIncludeOptions(),
        });
    }
    getCustomerIncludeOptions() {
        return {
            address: {
                include: {
                    country: true,
                    state: true,
                    village: true,
                },
            },
            documents: {
                include: {
                    document: true,
                },
            },
            drivers: {
                include: {
                    rental: {
                        include: {
                            pickup: true,
                            return: true,
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
                        },
                    },
                },
            },
            invoices: true,
            damages: true,
            license: {
                include: {
                    class: true,
                    country: true,
                },
            },
            apps: true,
            violations: {
                include: {
                    violation: true,
                },
            },
        };
    }
}
exports.customerRepo = new CustomerRepository();
