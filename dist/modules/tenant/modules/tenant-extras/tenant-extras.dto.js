"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantExtraSchema = void 0;
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
exports.TenantExtraSchema = zod_1.z.object({
    id: zod_1.z.uuid(),
    type: zod_1.z.enum(['insurance', 'equipment', 'service']),
    item: zod_1.z.string().min(1, 'Item is required'),
    description: zod_1.z.string().optional(),
    pricePolicy: zod_1.z.enum(client_1.PricePolicy),
    price: zod_1.z.number().min(0, 'Price must be at least 0'),
});
