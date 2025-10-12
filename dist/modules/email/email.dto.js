"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SendBookingDocumentsSchema = void 0;
const zod_1 = require("zod");
exports.SendBookingDocumentsSchema = zod_1.z.object({
    bookingId: zod_1.z.uuid(),
    to: zod_1.z.email(),
    includeInvoice: zod_1.z.boolean().default(false),
    includeAgreement: zod_1.z.boolean().default(false),
});
