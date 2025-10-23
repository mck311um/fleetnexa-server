import { z } from 'zod';

export const UploadFileSchema = z.object({
  fileName: z.string().optional(),
  folderPath: z.string().min(2).max(100),
});

export type UploadFileDto = z.infer<typeof UploadFileSchema>;
