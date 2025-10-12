"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionSchema = void 0;
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
exports.TransactionSchema = zod_1.z.object({
    id: zod_1.z.uuid(),
    amount: zod_1.z.float64(),
    transactionDate: zod_1.z.string(),
    type: zod_1.z.enum(client_1.TransactionType),
    createdBy: zod_1.z.string().optional(),
    paymentId: zod_1.z.string().optional(),
    refundId: zod_1.z.string().optional(),
    expenseId: zod_1.z.string().optional(),
    rentalId: zod_1.z.string().optional(),
});
