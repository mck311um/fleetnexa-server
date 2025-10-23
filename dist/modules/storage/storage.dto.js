"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadFileSchema = void 0;
const zod_1 = require("zod");
exports.UploadFileSchema = zod_1.z.object({
    fileName: zod_1.z.string().optional(),
    folderPath: zod_1.z.string().min(2).max(100),
});
