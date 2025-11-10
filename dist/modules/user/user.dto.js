"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestPasswordResetSchema = exports.NewPasswordSchema = exports.ChangePasswordSchema = exports.UpdateUserSchema = exports.CreateUserSchema = void 0;
const zod_1 = require("zod");
exports.CreateUserSchema = zod_1.z.object({
    email: zod_1.z.email(),
    firstName: zod_1.z.string().min(2).max(100),
    lastName: zod_1.z.string().min(2).max(100),
    roleId: zod_1.z.uuid(),
    password: zod_1.z.string().min(6).max(100).optional(),
});
exports.UpdateUserSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    email: zod_1.z.email(),
    firstName: zod_1.z.string().min(2).max(100),
    lastName: zod_1.z.string().min(2).max(100),
    profilePicture: zod_1.z.string().optional(),
});
exports.ChangePasswordSchema = zod_1.z.object({
    currentPassword: zod_1.z.string().min(2).max(100),
    newPassword: zod_1.z.string().min(2).max(100),
});
exports.NewPasswordSchema = zod_1.z.object({
    email: zod_1.z.email(),
    password: zod_1.z.string().min(8).max(100),
});
exports.RequestPasswordResetSchema = zod_1.z.object({
    username: zod_1.z.string(),
});
