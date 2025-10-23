import multer from 'multer';
import path from 'path';

const storage = multer.memoryStorage();

const fileFilter = (
  req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  const filetypes = /jpeg|jpg|png|webp|gif|pdf/;
  const mimetype = filetypes.test(file.mimetype);
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  }

  cb(new Error('Only images and PDFs are allowed'));
};

const limits = { fileSize: 5 * 1024 * 1024 };

export const uploadSingle = multer({ storage, fileFilter, limits }).single(
  'file',
);
export const uploadMultiple = multer({ storage, fileFilter, limits }).array(
  'files',
  10,
);
export default {
  uploadSingle,
  uploadMultiple,
};
