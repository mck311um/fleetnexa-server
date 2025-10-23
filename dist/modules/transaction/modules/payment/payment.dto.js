"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentSchema = void 0;
const zod_1 = require("zod");
exports.PaymentSchema = zod_1.z.object({
    id: zod_1.z.uuid(),
    amount: zod_1.z.float64().min(0),
    paymentDate: zod_1.z.string(),
    notes: zod_1.z.string().max(500).optional(),
    bookingId: zod_1.z.uuid(),
    paymentMethodId: zod_1.z.uuid(),
    paymentTypeId: zod_1.z.uuid(),
    customerId: zod_1.z.uuid(),
});
