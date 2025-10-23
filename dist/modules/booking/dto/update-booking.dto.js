"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateBookingDtoSchema = void 0;
const zod_1 = require("zod");
const create_booking_dto_1 = require("./create-booking.dto");
const client_1 = require("@prisma/client");
exports.UpdateBookingDtoSchema = create_booking_dto_1.CreateBookingDtoSchema.extend({
    bookingCode: zod_1.z.string().optional(),
    bookingNumber: zod_1.z.string().optional(),
    status: zod_1.z.enum(client_1.RentalStatus),
});
