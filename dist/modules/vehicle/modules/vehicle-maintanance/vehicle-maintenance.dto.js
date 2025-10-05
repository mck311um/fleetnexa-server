"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VehicleMaintenanceSchema = void 0;
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
exports.VehicleMaintenanceSchema = zod_1.z
    .object({
    id: zod_1.z.uuid(),
    vehicleId: zod_1.z.uuid(),
    serviceId: zod_1.z.uuid(),
    vendorId: zod_1.z.string().optional(),
    startDate: zod_1.z.string(),
    endDate: zod_1.z.string(),
    cost: zod_1.z.number().min(0),
    status: zod_1.z.enum(client_1.MaintenanceStatus).optional(),
    recordExpense: zod_1.z.boolean().optional(),
    expenseDate: zod_1.z.string().optional(),
})
    .refine((data) => !data.recordExpense || !!data.expenseDate, {
    message: 'expenseDate is required when recordExpense is true',
    path: ['expenseDate'],
});
