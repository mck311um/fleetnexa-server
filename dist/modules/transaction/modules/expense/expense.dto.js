"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpenseSchema = void 0;
const zod_1 = require("zod");
exports.ExpenseSchema = zod_1.z.object({
    id: zod_1.z.uuid(),
    amount: zod_1.z.float64().min(0),
    expenseDate: zod_1.z.string(),
    expense: (0, zod_1.string)(),
    payee: (0, zod_1.string)(),
    notes: zod_1.z.string().max(500).optional(),
    vendorId: zod_1.z.uuid().optional(),
    vehicleId: zod_1.z.uuid().optional(),
    maintenanceId: zod_1.z.uuid().optional(),
});
