"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRoleSchema = void 0;
const zod_1 = require("zod");
exports.UserRoleSchema = zod_1.z.object({
    id: zod_1.z.uuid(),
    name: zod_1.z.string().min(2).max(100),
    description: zod_1.z.string().optional(),
    show: zod_1.z.boolean().optional().default(true),
});
