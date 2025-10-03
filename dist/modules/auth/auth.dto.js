"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginDtoSchema = void 0;
const zod_1 = require("zod");
exports.LoginDtoSchema = zod_1.z.object({
    username: zod_1.z.string().min(3).max(50),
    password: zod_1.z.string().min(6).max(100),
    rememberMe: zod_1.z.boolean().optional(),
});
