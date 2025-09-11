import { Request, Response } from 'express';
import multer from '../../config/multer.config';
import service from './storage.service';
import { logger } from '../../config/logger';

const uploadFile = async (req: Request, res: Response) => {
  multer.uploadSingle(req, res, async (err: any) => {
    if (err) {
      logger.e(err, 'Multer error during file upload');
      return res.status(400).json({ message: err.message });
    }

    if (!req.file) {
      logger.w('No file uploaded');
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const file = await service.uploadFile(req.body, req.file);
    res.status(200).json({ message: 'File uploaded successfully', file });
  });
};

const uploadMultipleFiles = async (req: Request, res: Response) => {
  multer.uploadMultiple(req, res, async (err: any) => {
    if (err) {
      logger.e(err, 'Multer error during multiple file upload');
      return res.status(400).json({ message: err.message });
    }

    const files = [];
    for (const file of req.files as Express.Multer.File[]) {
      const result = await service.uploadFile(req.body, file);
      files.push(result);
    }
  });
};

export default { uploadFile, uploadMultipleFiles };
