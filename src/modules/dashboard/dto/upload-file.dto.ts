import { IsNotEmpty } from 'class-validator';
import type { Express } from 'express';

export class UploadFileDto {
  @IsNotEmpty()
  file: Express.Multer.File;
}
