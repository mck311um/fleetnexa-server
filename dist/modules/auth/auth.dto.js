"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResetPasswordDtoSchema = exports.VerifyEmailTokenSchema = exports.StorefrontUserSchema = exports.AdminUserSchema = exports.LoginDtoSchema = void 0;
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
exports.StorefrontUserSchema = zod_1.z.object({
    firstName: zod_1.z.string().min(1).max(50),
    lastName: zod_1.z.string().min(1).max(50),
    email: (0, zod_1.email)().max(100),
    gender: zod_1.z.string().optional(),
    phone: zod_1.z.string().optional(),
    password: zod_1.z.string().min(6).max(100),
    driversLicenseNumber: zod_1.z.string().min(5),
    licenseExpiry: zod_1.z.string(),
    licenseIssued: zod_1.z.string(),
    license: zod_1.z.string().optional(),
    dateOfBirth: zod_1.z.string(),
    street: zod_1.z.string().optional(),
    countryId: zod_1.z.string().optional(),
    stateId: zod_1.z.string().optional(),
});
exports.VerifyEmailTokenSchema = zod_1.z.object({
    email: (0, zod_1.email)(),
    token: zod_1.z.string().min(6),
});
exports.ResetPasswordDtoSchema = zod_1.z.object({
    email: (0, zod_1.email)(),
    newPassword: zod_1.z.string().min(6).max(100),
});
