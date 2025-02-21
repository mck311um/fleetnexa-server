import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import * as dotenv from "dotenv";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

dotenv.config();

const awsBucketName = process.env.AWS_BUCKET_NAME;
const awsRegion = process.env.AWS_REGION;
const awsAccessKeyId = process.env.AWS_ACCESS_KEY_ID;
const awsSecretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

const s3 = new S3Client({
  credentials: {
    accessKeyId: awsAccessKeyId ?? "",
    secretAccessKey: awsSecretAccessKey ?? "",
  },
  region: awsRegion ?? "",
});

const decodeBase64 = (base64String: string) => {
  const base64Data = base64String.replace(/^data:image\/[a-z]+;base64,/, "");
  return Buffer.from(base64Data, "base64");
};

const createS3Folder = async (tenantCode: string) => {
  const folderKey = `Tenants/${tenantCode}/`;

  const params = {
    Bucket: awsBucketName,
    Key: folderKey,
    Body: "",
  };
  const command = new PutObjectCommand(params);

  try {
    await s3.send(command);
  } catch (error) {
    console.error("Error creating folder:", error);
  }
};

const uploadImage = async (
  tenantCode: string,
  imageBuffer: Buffer,
  imageKey: string,
  mimeType: string
): Promise<string> => {
  try {
    const params = {
      Bucket: awsBucketName,
      Key: imageKey,
      Body: imageBuffer,
      ContentType: mimeType,
    };

    const command = new PutObjectCommand(params);
    await s3.send(command);

    const fileUrl = `https://${awsBucketName}.s3.${awsRegion}.amazonaws.com/${imageKey}`;
    return fileUrl;
  } catch (error) {
    console.error("Error uploading logo:", error);
    throw new Error("Error uploading image to S3");
  }
};

const getUrl = async (path: string): Promise<string> => {
  try {
    const params = {
      Bucket: awsBucketName,
      Key: path,
    };

    const command = new GetObjectCommand(params);
    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });

    return signedUrl;
  } catch (error: any) {
    console.error("Error viewing image:", error);
    throw new Error("Error retrieving file from S3");
  }
};

export default {
  createS3Folder,
  uploadImage,
  getUrl,
};
