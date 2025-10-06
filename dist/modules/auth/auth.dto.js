"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminUserSchema = exports.LoginDtoSchema = void 0;
const zod_1 = require("zod");
exports.LoginDtoSchema = zod_1.z.object({
    username: zod_1.z.string().min(3).max(50),
    password: zod_1.z.string().min(6).max(100),
    rememberMe: zod_1.z.boolean().optional(),
});
exports.AdminUserSchema = zod_1.z.object({
    username: zod_1.z.string().min(3).max(50),
    password: zod_1.z.string().min(6).max(100),
    firstName: zod_1.z.string().min(1).max(50),
    lastName: zod_1.z.string().min(1).max(50),
    email: zod_1.z.string().email().max(100),
});
