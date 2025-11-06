"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VehicleModelSchema = void 0;
const zod_1 = require("zod");
exports.VehicleModelSchema = zod_1.z.object({
    id: zod_1.z.uuid().optional(),
    model: zod_1.z.string().min(1).max(100),
    brand: zod_1.z.string().min(1).max(100),
    bodyType: zod_1.z.string().min(1).max(100),
});
