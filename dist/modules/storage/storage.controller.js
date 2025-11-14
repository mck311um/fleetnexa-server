"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_config_1 = __importDefault(require("../../config/multer.config"));
const storage_service_1 = __importDefault(require("./storage.service"));
const logger_1 = require("../../config/logger");
const uploadFile = async (req, res) => {
    multer_config_1.default.uploadSingle(req, res, async (err) => {
        if (err) {
            logger_1.logger.e(err, 'Multer error during file upload');
            return res.status(400).json({ message: err.message });
        }
        if (!req.file) {
            logger_1.logger.w('No file uploaded');
            return res.status(400).json({ message: 'No file uploaded' });
        }
        const file = await storage_service_1.default.uploadFile(req.body, req.file);
        res.status(200).json({ message: 'File uploaded successfully', file });
    });
};
const uploadMultipleFiles = async (req, res) => {
    multer_config_1.default.uploadMultiple(req, res, async (err) => {
        if (err) {
            logger_1.logger.e(err, 'Multer error during multiple file upload');
            return res.status(400).json({ message: err.message });
        }
        const files = [];
        for (const file of req.files) {
            const result = await storage_service_1.default.uploadFile(req.body, file);
            files.push(result);
        }
        res.status(200).json({ message: 'Files uploaded successfully', files });
    });
};
exports.default = { uploadFile, uploadMultipleFiles };
