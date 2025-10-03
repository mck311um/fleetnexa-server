"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const multer_1 = __importDefault(require("multer"));
const uuid_1 = require("uuid");
const path_1 = __importDefault(require("path"));
const aws_config_1 = require("../config/aws.config");
const logger_1 = require("../config/logger");
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|webp|gif|pdf/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path_1.default.extname(file.originalname).toLowerCase());
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Only images and PDFs are allowed'));
    },
}).single('file');
const uploadFile = async (req, res) => {
    try {
        upload(req, res, async (err) => {
            if (err) {
                return res.status(400).json({ message: err.message });
            }
            if (!req.file) {
                return res.status(400).json({ message: 'No file uploaded' });
            }
            const file = req.file;
            const fileId = (0, uuid_1.v4)();
            const fileExtension = path_1.default.extname(file.originalname);
            const fileName = req.body.fileName || `${fileId}${fileExtension}`;
            const folderPath = req.body.folderPath || 'default';
            const normalizedPath = folderPath.replace(/^\/|\/$/g, '');
            const key = `Tenants/${normalizedPath}/${fileName}`;
            const command = new client_s3_1.PutObjectCommand({
                Bucket: process.env.AWS_BUCKET_NAME || 'fleetnexa',
                Key: key,
                Body: file.buffer,
                ContentType: file.mimetype,
                Metadata: {
                    originalName: file.originalname,
                },
            });
            await aws_config_1.s3Client.send(command);
            const bucket = process.env.AWS_BUCKET_NAME || 'fleetnexa-dev';
            const region = process.env.AWS_REGION || 'us-east-1';
            const url = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
            res.status(201).json({
                message: 'File uploaded successfully',
                file: {
                    id: fileId,
                    name: file.originalname,
                    key: key,
                    url: url,
                    size: file.size,
                    type: file.mimetype,
                },
            });
        });
    }
    catch (error) {
        logger_1.logger.e(error, 'Error uploading file');
        return res.status(500).json({ message: 'Internal server error' });
    }
};
const getFileUrl = async (req, res) => {
    try {
        const { key } = req.query;
        if (!key) {
            return res.status(400).json({ message: 'File key is required' });
        }
        const command = new client_s3_1.GetObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME || 'fleetnexa',
            Key: key,
        });
        const url = await (0, s3_request_presigner_1.getSignedUrl)(aws_config_1.s3Client, command, { expiresIn: 3600 });
        res.json({ url });
    }
    catch (error) {
        logger_1.logger.e(error, 'Error generating file URL');
        return res.status(500).json({ message: 'Internal server error' });
    }
};
const deleteFile = async (req, res) => {
    try {
        const { key } = req.params;
        if (!key) {
            return res.status(400).json({ message: 'File key is required' });
        }
        const command = new client_s3_1.DeleteObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME || 'fleetnexa-dev',
            Key: key,
        });
        await aws_config_1.s3Client.send(command);
        res.json({ message: 'File deleted successfully' });
    }
    catch (error) {
        logger_1.logger.e(error, 'Error deleting file');
        return res.status(500).json({ message: 'Internal server error' });
    }
};
exports.default = {
    uploadFile,
    getFileUrl,
    deleteFile,
};
