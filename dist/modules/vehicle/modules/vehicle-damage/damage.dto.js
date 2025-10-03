"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VehicleDamageSchema = void 0;
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
exports.VehicleDamageSchema = zod_1.z.object({
    id: zod_1.z.uuid(),
    vehicleId: zod_1.z.uuid(),
    description: zod_1.z.string().max(500).optional(),
    images: zod_1.z.array(zod_1.z.string()).optional(),
    isRepaired: zod_1.z.boolean().default(false),
    partId: zod_1.z.string().max(100),
    location: zod_1.z.enum(client_1.DamageLocation),
    customerId: zod_1.z.string().optional(),
    title: zod_1.z.string().min(2).max(100),
    severity: zod_1.z.enum(client_1.Severity),
});
