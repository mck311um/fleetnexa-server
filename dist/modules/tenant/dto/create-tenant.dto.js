"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateTenantSchema = void 0;
const zod_1 = require("zod");
exports.CreateTenantSchema = zod_1.z.object({
    tenantName: zod_1.z.string().min(2).max(100),
    email: zod_1.z.email(),
    number: zod_1.z.string().min(10).max(15),
    firstName: zod_1.z.string().min(2).max(100),
    lastName: zod_1.z.string().min(2).max(100),
});
