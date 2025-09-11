import { PutObjectCommand } from '@aws-sdk/client-s3';
import { UploadFileDto } from './storage.dto';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { s3Client } from '../../config/aws.config';

const uploadFile = async (data: UploadFileDto, file: Express.Multer.File) => {
  try {
    if (!file) {
      throw new Error('No file provided');
    }

    const fileId = uuidv4();
    const fileExtension = path.extname(file.originalname);
    const baseName = data.fileName || fileId;
    const fileName = `${baseName}${fileExtension}`;
    const folderPath = data.folderPath || 'default';
    const normalizedPath = folderPath.replace(/^\/|\/$/g, '');
    const key = `Tenants/${normalizedPath}/${fileName}`;

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME || 'fleetnexa',
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      Metadata: {
        originalName: file.originalname,
      },
    });

    await s3Client.send(command);

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
  } catch (error) {}
};

export default { uploadFile };
