"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RentalActivitySchema = void 0;
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
exports.RentalActivitySchema = zod_1.z.object({
    bookingId: zod_1.z.uuid(),
    action: zod_1.z.enum(client_1.RentalAction),
});
