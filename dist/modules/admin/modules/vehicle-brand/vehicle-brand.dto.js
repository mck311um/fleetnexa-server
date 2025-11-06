"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VehicleBrandSchema = void 0;
const zod_1 = require("zod");
exports.VehicleBrandSchema = zod_1.z.object({
    id: zod_1.z.uuid().optional(),
    brand: zod_1.z.string().min(1).max(100),
});
