"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActionBookingDtoSchema = void 0;
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
exports.ActionBookingDtoSchema = zod_1.z.object({
    bookingId: zod_1.z.uuid(),
    action: zod_1.z.enum(client_1.RentalAction),
    status: zod_1.z.enum(client_1.RentalStatus),
    vehicleStatus: zod_1.z.string(),
    returnDate: zod_1.z.string().optional(),
    lateFeeApplied: zod_1.z.boolean().default(false),
    lateFee: zod_1.z.float64().min(0).optional(),
});
