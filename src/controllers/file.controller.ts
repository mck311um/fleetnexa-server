import { Request, Response } from "express";
import {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import logUtil from "../config/logger.config";
import { s3Client } from "../config/aws.config";

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp|gif|pdf/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );

    if (mimetype && extname) {
      return cb(null, true);
    }

    cb(new Error("Only images and PDFs are allowed"));
  },
}).single("file");

const uploadFile = async (req: Request, res: Response) => {
  try {
    upload(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ message: err.message });
      }

      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const file = req.file;
      const fileId = uuidv4();
      const fileExtension = path.extname(file.originalname);
      const fileName = `${fileId}${fileExtension}`;
      const folderPath = req.body.folderPath || "default";
      const normalizedPath = folderPath.replace(/^\/|\/$/g, "");
      const key = `Tenants/${normalizedPath}/${fileName}`;

      const command = new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME || "fleetnexa",
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        Metadata: {
          originalName: file.originalname,
        },
      });

      await s3Client.send(command);

      const bucket = process.env.AWS_BUCKET_NAME || "fleetnexa-dev";
      const region = process.env.AWS_REGION || "us-east-1";
      const url = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;

      res.status(201).json({
        message: "File uploaded successfully",
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
  } catch (error: any) {
    logUtil.handleError(res, error, "uploading file");
  }
};

const getFileUrl = async (req: Request, res: Response) => {
  try {
    const { key } = req.query;

    if (!key) {
      return res.status(400).json({ message: "File key is required" });
    }

    const command = new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME || "fleetnexa",
      Key: key as string,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

    res.json({ url });
  } catch (error: any) {
    logUtil.handleError(res, error, "getting file URL");
  }
};

const deleteFile = async (req: Request, res: Response) => {
  try {
    const { key } = req.params;

    if (!key) {
      return res.status(400).json({ message: "File key is required" });
    }

    const command = new DeleteObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME || "fleetnexa-dev",
      Key: key,
    });

    await s3Client.send(command);

    res.json({ message: "File deleted successfully" });
  } catch (error: any) {
    logUtil.handleError(res, error, "deleting file");
  }
};

export default {
  uploadFile,
  getFileUrl,
  deleteFile,
};
