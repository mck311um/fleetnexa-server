"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefundSchema = void 0;
const zod_1 = require("zod");
exports.RefundSchema = zod_1.z.object({
    id: zod_1.z.uuid(),
    amount: zod_1.z.float64().min(0),
    refundDate: zod_1.z.string(),
    reason: zod_1.z.string().max(500).optional(),
    bookingId: zod_1.z.uuid(),
    customerId: zod_1.z.uuid(),
});
