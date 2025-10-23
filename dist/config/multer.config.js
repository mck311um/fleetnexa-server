"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadMultiple = exports.uploadSingle = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const storage = multer_1.default.memoryStorage();
const fileFilter = (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp|gif|pdf/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path_1.default.extname(file.originalname).toLowerCase());
    if (mimetype && extname) {
        return cb(null, true);
    }
    cb(new Error('Only images and PDFs are allowed'));
};
const limits = { fileSize: 5 * 1024 * 1024 };
exports.uploadSingle = (0, multer_1.default)({ storage, fileFilter, limits }).single('file');
exports.uploadMultiple = (0, multer_1.default)({ storage, fileFilter, limits }).array('files', 10);
exports.default = {
    uploadSingle: exports.uploadSingle,
    uploadMultiple: exports.uploadMultiple,
};
