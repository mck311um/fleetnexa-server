"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorefrontUserSchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.StorefrontUserSchema = zod_1.default.object({
    firstName: zod_1.default.string().min(1).max(50),
    lastName: zod_1.default.string().min(1).max(50),
    email: zod_1.default.email().max(100),
    gender: zod_1.default.string().optional(),
    phone: zod_1.default.string().optional(),
    password: zod_1.default.string().min(6).max(100),
    driversLicenseNumber: zod_1.default.string().min(5),
    licenseExpiry: zod_1.default.string(),
    licenseIssued: zod_1.default.string(),
    license: zod_1.default.string().optional(),
    dateOfBirth: zod_1.default.string(),
    street: zod_1.default.string().optional(),
    countryId: zod_1.default.string().optional(),
    stateId: zod_1.default.string().optional(),
});
