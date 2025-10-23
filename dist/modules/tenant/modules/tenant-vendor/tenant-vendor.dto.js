"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantVendorSchema = void 0;
const zod_1 = require("zod");
exports.TenantVendorSchema = zod_1.z.object({
    id: zod_1.z.uuid(),
    vendor: zod_1.z.string().min(1, 'Vendor name is required'),
    contactName: zod_1.z.string().optional(),
    phone: zod_1.z.string().optional(),
    email: zod_1.z.string().optional(),
});
