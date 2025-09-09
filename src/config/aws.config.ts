import { S3Client } from '@aws-sdk/client-s3';
import { SESClient } from '@aws-sdk/client-ses';

const credentials = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
};

export const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials,
});

export const sesClient = new SESClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials,
});

export default {
  s3Client,
  sesClient,
};
