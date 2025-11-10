"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SendAgreementForSigningSchema = void 0;
const zod_1 = require("zod");
exports.SendAgreementForSigningSchema = zod_1.z.object({
    bookingId: zod_1.z.uuid(),
    userId: zod_1.z.string(),
    driverEmail: zod_1.z.email(),
});
