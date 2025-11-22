"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transactionRepo = void 0;
const prisma_config_1 = __importDefault(require("../../config/prisma.config"));
class TransactionRepository {
    async getTransactions(tenantId, additionalWhere) {
        return await prisma_config_1.default.transactions.findMany({
            where: {
                tenantId,
                isDeleted: false,
                ...additionalWhere,
            },
            include: this.getTransactionIncludeOptions(),
        });
    }
    getTransactionIncludeOptions() {
        return {
            rental: {
                select: {
                    id: true,
                    rentalNumber: true,
                    bookingCode: true,
                },
            },
            payment: {
                include: {
                    customer: true,
                    paymentMethod: true,
                    paymentType: true,
                    rental: {
                        select: {
                            id: true,
                            rentalNumber: true,
                            bookingCode: true,
                        },
                    },
                },
            },
            refund: {
                include: {
                    customer: true,
                    rental: {
                        select: {
                            id: true,
                            rentalNumber: true,
                            bookingCode: true,
                        },
                    },
                },
            },
            expense: {
                include: {
                    vendor: true,
                    maintenance: {
                        select: {
                            id: true,
                            services: true,
                        },
                    },
                    vehicle: {
                        select: {
                            id: true,
                            licensePlate: true,
                            brand: true,
                            model: true,
                            year: true,
                        },
                    },
                },
            },
            user: {
                select: {
                    firstName: true,
                    lastName: true,
                    username: true,
                },
            },
        };
    }
}
exports.transactionRepo = new TransactionRepository();
