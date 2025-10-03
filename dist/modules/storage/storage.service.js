"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_s3_1 = require("@aws-sdk/client-s3");
const uuid_1 = require("uuid");
const path_1 = __importDefault(require("path"));
const aws_config_1 = require("../../config/aws.config");
const uploadFile = async (data, file) => {
    try {
        if (!file) {
            throw new Error('No file provided');
        }
        const fileId = (0, uuid_1.v4)();
        const fileExtension = path_1.default.extname(file.originalname);
        const baseName = data.fileName || fileId;
        const fileName = `${baseName}${fileExtension}`;
        const folderPath = data.folderPath || 'default';
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
        const bucket = process.env.AWS_BUCKET_NAME || 'fleetnexa';
        const region = process.env.AWS_REGION || 'us-east-1';
        const url = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
        const createdFile = {
            id: fileId,
            name: file.originalname,
            key,
            url,
            size: file.size,
            type: file.mimetype,
        };
        return createdFile;
    }
    catch (error) { }
};
exports.default = { uploadFile };
