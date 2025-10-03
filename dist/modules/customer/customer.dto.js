"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerViolationSchema = void 0;
const zod_1 = require("zod");
exports.CustomerViolationSchema = zod_1.z.object({
    id: zod_1.z.uuid(),
    customerId: zod_1.z.uuid(),
    violationId: zod_1.z.uuid(),
    violationDate: zod_1.z.string(),
    notes: zod_1.z.string().optional(),
});
