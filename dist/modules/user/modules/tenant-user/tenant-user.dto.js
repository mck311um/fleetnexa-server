"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginDtoSchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.LoginDtoSchema = zod_1.default.object({
    username: zod_1.default.string().min(3).max(50),
    password: zod_1.default.string().min(8).max(100),
    rememberMe: zod_1.default.boolean().optional(),
});
