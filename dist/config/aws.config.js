"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sesClient = exports.s3Client = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const client_ses_1 = require("@aws-sdk/client-ses");
const credentials = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
};
exports.s3Client = new client_s3_1.S3Client({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials,
});
exports.sesClient = new client_ses_1.SESClient({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials,
});
exports.default = {
    s3Client: exports.s3Client,
    sesClient: exports.sesClient,
};
