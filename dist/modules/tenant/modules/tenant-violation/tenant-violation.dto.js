"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantViolationSchema = void 0;
const zod_1 = require("zod");
exports.TenantViolationSchema = zod_1.z.object({
    id: zod_1.z.uuid(),
    violation: zod_1.z.string().min(2).max(100),
    description: zod_1.z.string().optional(),
    amount: zod_1.z.number().min(0, { message: 'Amount is required' }),
});
