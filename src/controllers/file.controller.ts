import { Request, Response } from "express";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import path from "path";

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

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

      const getCommand = new GetObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME || "fleetnexa",
        Key: key,
      });

      const url = await getSignedUrl(s3Client, getCommand, { expiresIn: 3600 });

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
    res.status(500).json({ message: error.message });
    console.error(error);
  }
};

const getFileUrl = async (req: Request, res: Response) => {
  try {
    const { key } = req.query;

    if (!key) {
      return res.status(400).json({ message: "File key is required" });
    }

    const command = new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME || "fleetnexa-files",
      Key: key as string,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

    res.json({ url });
  } catch (error: any) {
    console.error("Error getting file URL:", error);
    res.status(500).json({ message: error.message });
  }
};

const deleteFile = async (req: Request, res: Response) => {
  try {
    const { key } = req.params;

    if (!key) {
      return res.status(400).json({ message: "File key is required" });
    }

    const command = new DeleteObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME || "fleetnexa",
      Key: key,
    });

    await s3Client.send(command);

    res.json({ message: "File deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting file:", error);
    res.status(500).json({ message: error.message });
  }
};

export default {
  uploadFile,
  getFileUrl,
  deleteFile,
};
