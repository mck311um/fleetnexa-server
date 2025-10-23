"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantLocationSchema = void 0;
const zod_1 = require("zod");
exports.TenantLocationSchema = zod_1.z.object({
    id: zod_1.z.uuid(),
    location: zod_1.z.string().min(2).max(100),
    pickupEnabled: zod_1.z.boolean(),
    returnEnabled: zod_1.z.boolean(),
    storefrontEnabled: zod_1.z.boolean(),
    deliveryFee: zod_1.z.number().min(0).optional(),
    collectionFee: zod_1.z.number().min(0).optional(),
    minimumRentalPeriod: zod_1.z.number().min(0).optional(),
});
